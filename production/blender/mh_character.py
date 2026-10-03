"""MakeHuman-data -> Blender character builder (headless, bpy).
Source data: production/assets/makehuman (fetched by tools/fetch_assets.sh). See docs/05_ASSET_LICENSES.md - licence status is PROVISIONAL.
Units: MakeHuman data are decimetres, y-up, +z toward viewer. Blender result: metres, z-up, character faces -Y.
"""
import json, math
from pathlib import Path
import numpy as np
import bpy
from mathutils import Vector, Matrix, Quaternion

ROOT = Path(__file__).resolve().parents[1] / "assets" / "makehuman"
DATA = ROOT / "public" / "data"
DM = 0.1
FOOT = 8.45  # base mesh is centred; lift so soles are at z~0 (decimetres)


def to_bl(v):
    """three.js decimetre coords (N,3) -> Blender metre coords."""
    v = np.asarray(v, dtype=np.float64).reshape(-1, 3)
    return np.stack([v[:, 0], -v[:, 2], v[:, 1] + FOOT], 1) * DM


def delta_to_bl(d):
    return to_bl(d)


# ---------------------------------------------------------------- targets / macro
class Targets:
    def __init__(self):
        self.z = np.load(ROOT / "targets.npz", allow_pickle=True)

    def delta(self, name):
        """Per-vertex delta array (19158,3) in MH decimetres for target `name` (path without extension)."""
        idx = self.z[name + ".index"].astype(np.int64)
        vec = self.z[name + ".vector"].astype(np.float64) * 1e-3
        out = np.zeros((19158, 3))
        out[idx] = vec
        return out

    def has(self, name):
        return (name + ".index") in self.z.files


def _tri_vals(x):
    lo = max(0.0, 1 - 2 * x); hi = max(0.0, 2 * x - 1)
    return lo, 1 - lo - hi, hi


def macro_weights(gender, age_years, race=(1.0, 0.0, 0.0), muscle=0.5, weight=0.5):
    """gender: 0 female .. 1 male. race: (caucasian, asian, african). Adult ages only (25..90)."""
    age = (age_years - 25.0) / (65.0 * 2) + 0.5
    old = max(0.0, age * 2 - 1); young = 1 - old
    w = {}
    names = ("caucasian", "asian", "african")
    for gname, gw in (("female", 1 - gender), ("male", gender)):
        for aname, av in (("young", young), ("old", old)):
            if gw * av <= 0:
                continue
            for rn, rw in zip(names, race):
                if rw > 0:
                    k = f"targets/macrodetails/{rn}-{gname}-{aname}"
                    w[k] = w.get(k, 0) + rw * gw * av
            for mn, mv in zip(("minmuscle", "averagemuscle", "maxmuscle"), _tri_vals(muscle)):
                for wn, wv in zip(("minweight", "averageweight", "maxweight"), _tri_vals(weight)):
                    if mv * wv > 0:
                        k = f"targets/macrodetails/universal-{gname}-{aname}-{mn}-{wn}"
                        w[k] = w.get(k, 0) + gw * av * mv * wv
    return w


# ---------------------------------------------------------------- mesh io
def parse_faces(flat):
    faces, mats, uvidx = [], [], []
    i, n = 0, len(flat)
    while i < n:
        t = flat[i]; i += 1
        nv = 4 if t & 1 else 3
        vs = flat[i:i + nv]; i += nv
        m = 0
        if t & 2: m = flat[i]; i += 1
        if t & 4: i += 1
        uv = None
        if t & 8: uv = flat[i:i + nv]; i += nv
        if t & 16: i += 1
        if t & 32: i += nv
        if t & 64: i += 1
        if t & 128: i += nv
        faces.append(vs); mats.append(m); uvidx.append(uv)
    return faces, mats, uvidx


def load_json(p):
    return json.load(open(p))


def make_mesh(name, verts_bl, faces, mats, uvidx, uvs, mat_slots=()):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts_bl], [], [tuple(f) for f in faces])
    me.update()
    if uvs is not None:
        uvl = me.uv_layers.new(name="UV")
        uvs = np.asarray(uvs).reshape(-1, 2)
        for p, ui in zip(me.polygons, uvidx):
            for li, u in zip(p.loop_indices, ui):
                uvl.data[li].uv = uvs[u]
    for m in mat_slots:
        me.materials.append(m)
    if mat_slots and len(mat_slots) > 1:
        for p, mi in zip(me.polygons, mats):
            p.material_index = min(mi, len(mat_slots) - 1)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


class Human:
    """Builds body mesh, armature, proxies. Keep all 19158 base vertices so target/proxy indices stay valid."""

    def __init__(self, name, gender, age, race=(1, 0, 0), muscle=0.5, weight=0.5, skin_tex=None, collection=None):
        self.name = name
        self.T = Targets()
        base = load_json(DATA / "models" / "human_full_size.json")
        self.base_json = base
        self.base = np.array(base["vertices"], dtype=np.float64).reshape(-1, 3)
        self.macro = macro_weights(gender, age, race, muscle, weight)
        self.verts = self.base.copy()
        for k, w in self.macro.items():
            self.verts += self.T.delta(k) * w
        self.race = ("caucasian", "asian", "african")[int(np.argmax(race))]
        self.skin_tex = skin_tex
        self.objects = {}
        self.shape_deltas = {}
        self.col = collection

    # ---- body
    def build_body(self, mat):
        b = self.base_json
        faces, mats, uvi = parse_faces(b["faces"])
        keep = [i for i, m in enumerate(mats) if m == 0]
        ob = make_mesh(f"{self.name}_Body", to_bl(self.verts), [faces[i] for i in keep], [0] * len(keep),
                       [uvi[i] for i in keep], b["uvs"][0], [mat])
        for p in ob.data.polygons:
            p.use_smooth = True
        self.objects["body"] = ob
        self._skin(ob, b["skinIndices"], b["skinWeights"], 4, b["bones"])
        return ob

    def _skin(self, ob, sidx, swt, per, bones):
        si = np.array(sidx).reshape(-1, per); sw = np.array(swt).reshape(-1, per)
        names = [bn["name"].replace("____head", "") for bn in bones]
        groups = {}
        for v in range(len(si)):
            for k in range(per):
                if sw[v, k] > 1e-4:
                    n = names[si[v, k]]
                    g = groups.get(n) or groups.setdefault(n, ob.vertex_groups.new(name=n))
                    g.add([v], float(sw[v, k]), "ADD")

    # ---- skeleton
    def joint_pos(self):
        jp = self.base_json["metadata"]["joint_pos_idxs"]
        V = to_bl(self.verts)
        return {k: Vector(V[v].mean(0)) for k, v in jp.items()}

    def build_armature(self):
        rig = load_json(ROOT / "src" / "json" / "rigs" / "default.json")
        J = self.joint_pos()
        arm = bpy.data.armatures.new(f"{self.name}_Rig")
        ob = bpy.data.objects.new(f"{self.name}_Rig", arm)
        bpy.context.scene.collection.objects.link(ob)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.mode_set(mode="EDIT")
        done, pend = set(), dict(rig["bones"])
        while pend:
            prog = False
            for n, d in list(pend.items()):
                if d["parent"] and d["parent"] not in done:
                    continue
                h, t = J[d["head"]], J[d["tail"]]
                if (t - h).length < 1e-4:
                    t = h + Vector((0, 0, 0.01))
                eb = arm.edit_bones.new(n); eb.head, eb.tail = h, t
                if d["parent"]:
                    eb.parent = arm.edit_bones[d["parent"]]
                done.add(n); del pend[n]; prog = True
            assert prog, "bone parent cycle"
        bpy.ops.object.mode_set(mode="OBJECT")
        self.objects["rig"] = ob
        return ob

    def bind(self, ob, rig=None):
        rig = rig or self.objects["rig"]
        m = ob.modifiers.new("Armature", "ARMATURE"); m.object = rig
        return m

    # ---- proxies
    def fit(self, P, body=None):
        body = self.verts if body is None else body
        ref = np.array(P["ref_vIdxs"]); w = np.array(P["weights"]); off = np.array(P["offsets"])
        return (body[ref] * w[..., None]).sum(1) + off

    def build_proxy(self, kind, name, mats, single_material=None, smooth=True):
        folder = DATA / "proxies" / kind / name
        P = load_json(folder / f"{name}.json")
        verts = self.fit(P)
        faces, fm, uvi = parse_faces(P["faces"])
        slots = [single_material] if single_material else mats
        ob = make_mesh(f"{self.name}_{name}", to_bl(verts), faces, fm if not single_material else [0] * len(fm),
                       uvi, P["uvs"][0], slots)
        for p in ob.data.polygons:
            p.use_smooth = smooth
        per = P["influencesPerVertex"]
        self._skin(ob, P["skinIndices"], P["skinWeights"], per, P["bones"])
        self.objects[name] = ob
        return ob, P, folder

    # ---- expression shape keys
    def add_expression_keys(self, ob, P, units, strength=1.0):
        """P=None for the body mesh (uses base vertex order), else a proxy json to refit per unit."""
        ob.shape_key_add(name="Basis")
        for u in units:
            tname = f"targets/expression/units/{self.race}/{u}"
            if not self.T.has(tname):
                continue
            d = self.T.delta(tname) * strength
            if P is None:
                pos = to_bl(self.verts + d)
            else:
                pos = to_bl(self.fit(P, self.verts + d))
            sk = ob.shape_key_add(name=u, from_mix=False)
            sk.data.foreach_set("co", pos.astype(np.float32).ravel())
            sk.value = 0.0; sk.slider_min, sk.slider_max = 0.0, 1.0


def load_image(path, srgb=True):
    img = bpy.data.images.load(str(path), check_existing=True)
    img.colorspace_settings.name = "sRGB" if srgb else "Non-Color"
    return img
