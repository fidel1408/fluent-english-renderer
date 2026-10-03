"""Shot MS-01 "Maya listens, glances at the clock, begins to raise a hand" - motion/visual test (SILENT, no lip-sync).
Usage (bpy module):  python maya_shot.py still <frame> <out.png> <resx> <spp>
                     python maya_shot.py anim <f0> <f1> <outdir> <resx> <spp>
                     python maya_shot.py save <out.blend>
Env: CLOTHES=Rolled_neck_blouse,Tightjeans  HAIR=long01
"""
import os, sys, math, random, time
import bpy
from mathutils import Vector, Matrix, Euler
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import characters, materials as M

FPS, F_END = 24, 96
mode = sys.argv[1] if len(sys.argv) > 1 else "save"
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS; sc.frame_start, sc.frame_end = 1, F_END

# ------------------------------------------------------------------ environment
def box(name, loc, size, mat, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object
    o.name = name; o.scale = size; o.rotation_euler = rot; o.data.materials.append(mat); return o

def noise_bump(nt, b, scale, strength, dist=0.002):
    tc = nt.nodes.new("ShaderNodeTexCoord"); n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = 8
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = strength; bp.inputs["Distance"].default_value = dist
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"]); nt.links.new(n.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])

def mat_brick():
    m, nt, out = M._nt("Brick"); b = M._bsdf(nt, out); tc = nt.nodes.new("ShaderNodeTexCoord")
    br = nt.nodes.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = 6; br.inputs["Mortar Size"].default_value = 0.02
    br.inputs["Brick Width"].default_value = 0.5; br.inputs["Row Height"].default_value = 0.2
    br.inputs["Color1"].default_value = (0.42, 0.17, 0.11, 1); br.inputs["Color2"].default_value = (0.30, 0.12, 0.08, 1); br.inputs["Mortar"].default_value = (0.35, 0.3, 0.26, 1)
    nt.links.new(tc.outputs["Object"], br.inputs["Vector"]); nt.links.new(br.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.85
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.6; nt.links.new(br.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m

def mat_wood(name, col, rough=0.4, planks=False):
    m, nt, out = M._nt(name); b = M._bsdf(nt, out); tc = nt.nodes.new("ShaderNodeTexCoord")
    wv = nt.nodes.new("ShaderNodeTexWave"); wv.wave_type = "BANDS"; wv.inputs["Scale"].default_value = 3; wv.inputs["Distortion"].default_value = 6; wv.inputs["Detail"].default_value = 4
    nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].color = (col[0] * 0.55, col[1] * 0.5, col[2] * 0.45, 1); ramp.color_ramp.elements[1].color = (*col, 1)
    nt.links.new(wv.outputs["Fac"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough; b.inputs["Specular IOR Level"].default_value = 0.5
    if planks:
        br = nt.nodes.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = 3; br.inputs["Mortar Size"].default_value = 0.012; br.inputs["Brick Width"].default_value = 1.6; br.inputs["Row Height"].default_value = 0.25
        nt.links.new(tc.outputs["Object"], br.inputs["Vector"]); bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.5; bp.inputs["Distance"].default_value = 0.004
        nt.links.new(br.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    else:
        noise_bump(nt, b, 200, 0.15, 0.0008)
    return m

def mat_plaster():
    m, nt, out = M._nt("Plaster"); b = M._bsdf(nt, out); b.inputs["Base Color"].default_value = (0.38, 0.28, 0.2, 1); b.inputs["Roughness"].default_value = 0.9
    noise_bump(nt, b, 40, 0.5, 0.004); return m

def build_environment():
    box("Floor", (0, 1, -0.05), (9, 8, 0.1), mat_wood("FloorWood", (0.36, 0.2, 0.1), 0.35, planks=True))
    box("BackWall", (0, 3.6, 1.6), (9, 0.15, 3.4), mat_plaster())
    box("BrickPanel", (1.6, 3.5, 1.3), (3.2, 0.1, 2.6), mat_brick())
    box("LeftWall", (-4.2, 1, 1.6), (0.15, 8, 3.4), mat_plaster())
    box("RightWall", (4.2, 1, 1.6), (0.15, 8, 3.4), mat_plaster())
    box("Ceiling", (0, 1, 3.3), (9, 8, 0.1), mat_plaster())
    wood = mat_wood("TableWood", (0.42, 0.24, 0.11), 0.3)
    box("TableTop", (0, -0.55, 0.93), (1.9, 0.75, 0.05), wood)
    for sx in (-1, 1):
        for sy in (-1, 1): box(f"Leg{sx}{sy}", (sx * 0.88, -0.55 + sy * 0.32, 0.45), (0.07, 0.07, 0.9), wood)
    box("TableApron", (0, -0.2, 0.86), (1.8, 0.03, 0.12), wood)
    # tall window (left wall, camera-left): bright sky card + frame bars
    sky = M.simple("WindowSky", (0.9, 0.95, 1.0), 0.5, emission=((0.75, 0.88, 1.0), 3.5))
    box("WindowGlass", (-4.1, 0.3, 1.7), (0.05, 1.8, 2.2), sky)
    frame = M.simple("WindowFrame", (0.12, 0.1, 0.09), 0.5)
    for i, yy in enumerate((-0.6, 0.3, 1.2)): box(f"Mullion{i}", (-4.05, yy, 1.7), (0.1, 0.07, 2.25), frame)
    box("Transom", (-4.05, 0.3, 1.7), (0.1, 1.85, 0.07), frame)
    # bookshelf in background (colours only, no text)
    shelf = mat_wood("ShelfWood", (0.16, 0.09, 0.045), 0.5)
    box("ShelfBack", (-1.8, 3.35, 1.2), (1.6, 0.04, 2.0), shelf)
    for zi in range(5):
        box(f"Shelf{zi}", (-1.8, 3.2, 0.35 + zi * 0.42), (1.6, 0.35, 0.03), shelf)
    random.seed(7)
    cols = [(0.12, 0.03, 0.025), (0.03, 0.06, 0.1), (0.16, 0.11, 0.04), (0.035, 0.08, 0.05), (0.1, 0.085, 0.07), (0.06, 0.04, 0.08)]
    for zi in range(4):
        x = -2.55
        while x < -1.1:
            w = random.uniform(0.03, 0.07); h = random.uniform(0.2, 0.34)
            box("Book", (x, 3.18, 0.37 + zi * 0.42 + h / 2), (w, 0.22, h), M.simple("BookMat", random.choice(cols), 0.6)); x += w + 0.004
    # hanging paper lanterns (bokeh + practical light)
    random.seed(3)
    for i in range(9):
        x = random.uniform(-2.8, 2.8); y = random.uniform(2.4, 3.3); z = random.uniform(1.75, 2.45)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=random.uniform(0.09, 0.13), location=(x, y, z), segments=24, ring_count=12); o = bpy.context.object; o.name = f"Lantern{i}"
        o.scale.z = 1.25; o.data.materials.append(M.simple(f"LanternGlow{i}", (1, 0.5, 0.2), 0.5, emission=((1.0, 0.5, 0.18), random.uniform(3.0, 5.5))))
        for p in o.data.polygons: p.use_smooth = True
        bpy.ops.mesh.primitive_cylinder_add(radius=0.004, depth=3.3 - z, location=(x, y, (z + 3.3) / 2)); box_ = bpy.context.object; box_.data.materials.append(M.simple("Cord", (0.05, 0.05, 0.05)))
    # foreground gooseneck microphone, camera-left (out of focus)
    steel = M.simple("MicMetal", (0.55, 0.55, 0.58), 0.25, metal=1.0)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.03, location=(-0.62, -0.78, 1.015)); bpy.context.object.data.materials.append(steel)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=0.34, location=(-0.62, -0.78, 1.19)); bpy.context.object.data.materials.append(steel)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.028, location=(-0.62, -0.78, 1.375)); o = bpy.context.object; o.scale = (1, 1, 1.5); o.data.materials.append(M.simple("MicHead", (0.08, 0.08, 0.09), 0.7))
    # lights: window key (motivated), warm fill/bounce, lantern rim
    def area(name, loc, rot, energy, size, color):
        bpy.ops.object.light_add(type="AREA", location=loc); l = bpy.context.object; l.name = name; l.rotation_euler = [math.radians(r) for r in rot]
        l.data.energy = energy; l.data.size = size; l.data.color = color; return l
    area("Key_Window", (-3.3, -0.8, 1.9), (80, 0, -62), 430, 2.4, (0.82, 0.9, 1.0))
    area("Fill_Bounce", (2.4, -2.4, 1.5), (82, 0, 38), 9, 2.5, (1.0, 0.82, 0.65))
    area("Rim_Lantern", (1.9, 1.6, 2.2), (-110, 0, 10), 240, 0.8, (1.0, 0.6, 0.3))
    w = bpy.data.worlds.new("World"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.04, 0.04, 0.05, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.25

build_environment()

# ------------------------------------------------------------------ character
CL = os.environ.get("CLOTHES", "Rolled_neck_blouse").split(",")
H = characters.build_maya(clothes=tuple(c for c in CL if c), hair=os.environ.get("HAIR", "long01"))
rig = H.objects["rig"]
rig.rotation_euler.z = math.radians(-18)           # body turned slightly toward camera-left (window / clock side)
rig.location = (0.0, 0.0, 0.0)
bpy.context.view_layer.update()

# ------------------------------------------------------------------ FK pose engine
bones = rig.data.bones
R_rest = {b.name: b.matrix_local.to_3x3() for b in bones}
def rot(axis, deg):
    return Matrix.Rotation(math.radians(deg), 3, axis)
def compose(*rs):
    m = Matrix.Identity(3)
    for r in rs: m = m @ r
    return m
def D_total(name, DR, cache):
    if name in cache: return cache[name]
    b = bones[name]; Dp = D_total(b.parent.name, DR, cache) if b.parent else Matrix.Identity(3)
    d = DR.get(name, Matrix.Identity(3)) @ Dp; cache[name] = d; return d
POSED = set()
def key_pose(frame, DR):
    cache = {}
    for n in list(DR.keys()) + list(POSED):
        POSED.add(n)
    for n in sorted(POSED, key=lambda n: len(bones[n].parent_recursive)):
        pb = rig.pose.bones[n]; b = bones[n]
        Dp = D_total(b.parent.name, DR, cache) if b.parent else Matrix.Identity(3)
        dr = DR.get(n, Matrix.Identity(3))
        P = R_rest[n].inverted() @ Dp.inverted() @ dr @ Dp @ R_rest[n]
        pb.rotation_mode = "QUATERNION"; pb.rotation_quaternion = P.to_quaternion()
        pb.keyframe_insert("rotation_quaternion", frame=frame)

SKIN_OBJS = [H.objects["body"], H.objects["eyebrow005"], H.objects["Eyelashes01"]]
def key_face(frame, **vals):
    for o in SKIN_OBJS:
        for k in o.data.shape_keys.key_blocks[1:]:
            v = vals.get(k.name.replace("-", "_"), 0.0)
            k.value = v; k.keyframe_insert("value", frame=frame)

def side(s, r):  # mirror helper: for left bones, flip Y/Z-axis rotation sense
    return r

def pose_state(t):
    """t in seconds -> (bone rotation dict, face dict). Hand-authored beats; angles in degrees, axes in armature space (x right-left, y depth, z up)."""
    raise NotImplementedError

def arms_rest(g=0.0):
    """Both forearms resting on the table, relaxed. g = gesture amount for the RIGHT hand (character's right = -x)."""
    DR = {}
    DR["upperarm01.R"] = compose(rot("Y", -47), rot("X", 4))
    DR["lowerarm01.R"] = compose(rot("X", -36 - 34 * g), rot("Z", 8 * g))
    DR["wrist.R"] = compose(rot("X", 8 - 18 * g), rot("Y", 6 * g))
    DR["upperarm01.L"] = compose(rot("Y", 47), rot("X", 4))
    DR["lowerarm01.L"] = rot("X", -34)
    DR["wrist.L"] = rot("X", 8)
    for fb in ("finger2", "finger3", "finger4", "finger5", "finger1"):
        for sd, sgn in (("R", 1), ("L", 1)):
            for j, amt in ((1, 7), (2, 11), (3, 7)):
                n = f"{fb}-{j}.{sd}"
                if n in bones:
                    open_amt = 1.0 - 0.7 * g if sd == "R" else 1.0
                    DR[n] = rot("X", -amt * open_amt * sgn)
    return DR

def merge(*ds):
    out = {}
    for d in ds:
        for k, v in d.items(): out[k] = (out[k] @ v) if k in out else v
    return out

def body_beat(f):
    """Per-key full-body DR dict. f = frame. Weight shift, breathing, head turn toward the clock (camera-left, up), then return; right-hand gesture late."""
    t = (f - 1) / FPS
    breath = math.sin(t * 2 * math.pi / 3.6)
    ease = lambda a, b, x: 0.0 if x <= a else 1.0 if x >= b else (lambda u: u * u * (3 - 2 * u))((x - a) / (b - a))
    look = ease(0.95, 1.55, t) * (1 - ease(2.15, 2.75, t))                 # head-turn amount toward clock
    g = ease(2.3, 3.2, t)                                                  # gesture
    DR = arms_rest(g)
    DR = merge(DR, {
        "spine03": compose(rot("X", 0.8 * breath), rot("Z", 2.0 * look)),
        "spine01": compose(rot("X", 0.6 * breath), rot("Z", 3.0 * look)),
        "clavicle.R": rot("Z", -1.2 * breath), "clavicle.L": rot("Z", 1.2 * breath),
        "spine05": rot("Y", 1.2 * math.sin(t * 2 * math.pi / 8.0)),
        "neck01": compose(rot("Z", 5 * ease(1.05, 1.7, t) * (1 - ease(2.15, 2.8, t)))),
        "head": compose(rot("Z", 12 * look), rot("X", -5 * look + 1.2 * math.sin(t * 2 * math.pi / 5.0)), rot("Y", -3 * look)),
    })
    # eyes (relative to head): saccade to clock earlier than the head, return before it
    eye_look = ease(0.80, 0.88, t) * (1 - ease(2.0, 2.08, t))
    for e in ("eye.L", "eye.R"):
        DR[e] = compose(rot("Z", -14 * 1.0 * 0 + 4 + 12 * eye_look * 0 + (-6 * (1 - eye_look)) + 8 * eye_look * 0), rot("X", 4 * eye_look))
    return DR

def face_beat(f):
    t = (f - 1) / FPS
    ease = lambda a, b, x: 0.0 if x <= a else 1.0 if x >= b else (lambda u: u * u * (3 - 2 * u))((x - a) / (b - a))
    def blink(t0):
        x = (t - t0) / 0.2
        return max(0.0, 1 - abs(x * 2 - 1)) if 0 <= x <= 1 else 0.0
    b = max(blink(0.55), blink(1.85), blink(3.4))
    tension = ease(0.3, 1.1, t)
    prep = ease(2.2, 3.1, t)
    return dict(
        eye_left_closure=b, eye_right_closure=b,
        eyebrows_left_inner_up=0.35 + 0.25 * tension + 0.3 * prep, eyebrows_right_inner_up=0.35 + 0.25 * tension + 0.3 * prep,
        eyebrows_left_down=0.03 * tension, eyebrows_right_down=0.03 * tension,
        eyebrows_left_up=0.15 * prep, eyebrows_right_up=0.15 * prep,
        mouth_compression=0.12 + 0.2 * tension - 0.12 * prep, mouth_retraction=0.10 * prep,
        mouth_depression=0.05 * tension,
    )

KEYS = [1, 12, 20, 26, 34, 44, 52, 60, 68, 78, 88, 96]
for kf in KEYS:
    key_pose(kf, body_beat(kf)); key_face(kf, **face_beat(kf))

# ------------------------------------------------------------------ camera
bpy.ops.object.empty_add(type="PLAIN_AXES"); focus = bpy.context.object; focus.name = "FocusTarget"
c = focus.constraints.new("COPY_LOCATION"); c.target = rig; c.subtarget = "eye.R"
bpy.ops.object.camera_add(location=(0.35, -2.7, 1.4)); cam = bpy.context.object; cam.name = "Cam_MS01"; sc.camera = cam
cam.data.lens = 58; cam.data.sensor_width = 36
cam.data.dof.use_dof = True; cam.data.dof.focus_object = focus; cam.data.dof.aperture_fstop = 1.8
tr = cam.constraints.new("TRACK_TO"); tgt_empty = None
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0.0, 0.0, 1.25)); aim = bpy.context.object; aim.name = "CamAim"
tr.target = aim; tr.track_axis = "TRACK_NEGATIVE_Z"; tr.up_axis = "UP_Y"
cam.location = (0.45, -2.75, 1.36); cam.keyframe_insert("location", frame=1)
cam.location = (0.22, -2.15, 1.45); cam.keyframe_insert("location", frame=F_END)
aim.location = (0.0, 0.0, 1.30); aim.keyframe_insert("location", frame=1)
aim.location = (0.0, 0.0, 1.43); aim.keyframe_insert("location", frame=F_END)
for ob in (cam, aim):
    for fc in ob.animation_data.action.layers[0].strips[0].channelbags[0].fcurves if hasattr(ob.animation_data.action, "layers") else ob.animation_data.action.fcurves:
        for kp in fc.keyframe_points: kp.interpolation = "BEZIER"; kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"

# ------------------------------------------------------------------ render settings
sc.render.engine = "CYCLES"; cy = sc.cycles; cy.device = "CPU"; cy.use_denoising = True; cy.use_adaptive_sampling = True
cy.max_bounces = 6; cy.transparent_max_bounces = 8; cy.diffuse_bounces = 3; cy.glossy_bounces = 3; cy.sample_clamp_indirect = 8.0
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - High Contrast"; sc.view_settings.exposure = -0.5
sc.render.use_motion_blur = False
sc.render.film_transparent = False
sc.render.image_settings.file_format = "PNG"

def set_res(resx, spp):
    sc.render.resolution_x = resx; sc.render.resolution_y = resx * 9 // 16; cy.samples = spp

if mode == "still":
    fr, out, resx, spp = int(sys.argv[2]), sys.argv[3], int(sys.argv[4]), int(sys.argv[5]); set_res(resx, spp)
    sc.frame_set(fr); sc.render.filepath = out; t0 = time.time(); bpy.ops.render.render(write_still=True); print(f"RESULT still f{fr} {resx}px {spp}spp {time.time()-t0:.1f}s")
elif mode == "anim":
    f0, f1, outdir, resx, spp = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4], int(sys.argv[5]), int(sys.argv[6]); set_res(resx, spp)
    os.makedirs(outdir, exist_ok=True); t0 = time.time()
    for fr in range(f0, f1 + 1):
        p = f"{outdir}/f{fr:04d}.png"
        if os.path.exists(p): continue          # resumable
        sc.frame_set(fr); sc.render.filepath = p; t1 = time.time(); bpy.ops.render.render(write_still=True); print(f"frame {fr} {time.time()-t1:.1f}s", flush=True)
    print(f"RESULT anim {f0}-{f1} total {time.time()-t0:.1f}s")
elif mode == "save":
    bpy.ops.wm.save_as_mainfile(filepath=sys.argv[2])
