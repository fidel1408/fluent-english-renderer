"""Character definitions (data only) + build function. Reusable for Leon/Tess/Adrian later."""
import bpy
from mh_character import Human, DATA, load_image
import materials as M

HAIR_TINT = (0.62, 0.50, 0.45)
FACE_UNITS = ["eye-left-closure", "eye-right-closure", "eyebrows-left-down", "eyebrows-right-down",
              "eyebrows-left-inner-up", "eyebrows-right-inner-up", "eyebrows-left-up", "eyebrows-right-up",
              "eyebrows-left-extern-up", "eyebrows-right-extern-up", "mouth-compression", "mouth-corner-puller",
              "mouth-depression", "mouth-elevation", "mouth-pursing", "mouth-open", "mouth-retraction", "eye-left-slit", "eye-right-slit"]


def build_maya(prefix="Maya", clothes=("VNeckTop",), hair="long01"):
    H = Human(prefix, gender=0.0, age=42, race=(1, 0, 0), muscle=0.45, weight=0.45)
    skin_tex = DATA / "skins/middleage_caucasian_female/textures/middleage_lightskinned_female_diffuse.png"
    skin = M.skin(f"{prefix}_Skin", skin_tex, tint=(1.0, 0.93, 0.9))
    body = H.build_body(skin)
    rig = H.build_armature()
    H.bind(body)
    # eyes
    eye_tex = DATA / "proxies/eyes/HighPolyEyes/textures/brownlight_eye.png"
    eyes, P, _ = H.build_proxy("eyes", "HighPolyEyes", [], single_material=M.eye(f"{prefix}_Eye", eye_tex))
    H.bind(eyes)
    # teeth / tongue
    for kind, nm, tex in (("teeth", "Teeth_Base", "teeth.png"), ("tongue", "tongue01", "tongue01_diffuse.png")):
        o, _, f = H.build_proxy(kind, nm, [], single_material=M.simple(f"{prefix}_{nm}", (0.85, 0.8, 0.75) if kind == "teeth" else (0.55, 0.2, 0.2), 0.35))
        H.bind(o)
    # brows / lashes with expression keys so they follow the face
    brow, Pb, fb = H.build_proxy("eyebrows", "eyebrow005", [], single_material=M.alpha_card(f"{prefix}_Brow", DATA / "proxies/eyebrows/eyebrow005/textures/eyebrow005.png", tint=(0.35, 0.22, 0.14), rough=0.6))
    lash, Pl, fl = H.build_proxy("eyelashes", "Eyelashes01", [], single_material=M.alpha_card(f"{prefix}_Lash", DATA / "proxies/eyelashes/Eyelashes01/textures/eyelashes01.png", rough=0.5))
    H.add_expression_keys(body, None, FACE_UNITS)
    H.add_expression_keys(brow, Pb, FACE_UNITS)
    H.add_expression_keys(lash, Pl, FACE_UNITS)
    H.bind(brow); H.bind(lash)
    # hair
    hair_ob, Ph, fh = H.build_proxy("hair", hair, [], single_material=M.alpha_card(f"{prefix}_Hair", DATA / f"proxies/hair/{hair}/textures/{hair}_diffuse.png", tint=HAIR_TINT, rough=0.62, spec=0.12, sheen=0.0))
    H.bind(hair_ob)
    # clothes
    for c in clothes:
        folder = DATA / "proxies/clothes" / c
        tex = sorted((folder / "textures").iterdir())
        tex = [t for t in tex if "normal" not in t.name][0]
        mat = M.fabric(f"{prefix}_{c}", tex, scale=1.0)
        co, _, _ = H.build_proxy("clothes", c, [], single_material=mat)
        H.bind(co)
    for o in H.objects.values():
        if o is not rig:
            o.parent = rig
    return H
