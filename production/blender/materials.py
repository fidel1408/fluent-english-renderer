"""Reusable Cycles materials for the Lantern Workshop characters."""
import bpy
from mh_character import load_image, DATA


def _rgba_in(node):
    """Mix node (RGBA): return (A, B) colour sockets - names are ambiguous across float/vector/rgba."""
    c = [i for i in node.inputs if i.type == "RGBA"]
    return c[0], c[1]


def _nt(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != "OUTPUT_MATERIAL":
            nt.nodes.remove(n)
    out = [n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"][0]
    return m, nt, out


def _bsdf(nt, out):
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    return b


def _tex(nt, path, srgb=True, loc=(-600, 0)):
    t = nt.nodes.new("ShaderNodeTexImage"); t.image = load_image(path, srgb); t.location = loc
    t.interpolation = "Smart"
    return t


def skin(name, tex_path, tint=(1, 1, 1), sss=0.35, roughness=0.42):
    m, nt, out = _nt(name); b = _bsdf(nt, out)
    t = _tex(nt, tex_path)
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0; _rgba_in(mix)[1].default_value = (*tint, 1)
    nt.links.new(t.outputs["Color"], _rgba_in(mix)[0])
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.28, 0.15)
    b.inputs["Subsurface Scale"].default_value = 0.012
    b.inputs["Roughness"].default_value = roughness
    b.inputs["Specular IOR Level"].default_value = 0.45
    b.inputs["Sheen Weight"].default_value = 0.25
    b.inputs["Sheen Roughness"].default_value = 0.5
    # pore-scale micro relief + roughness breakup (procedural; no external texture)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n1 = nt.nodes.new("ShaderNodeTexNoise"); n1.inputs["Scale"].default_value = 900; n1.inputs["Detail"].default_value = 6
    n2 = nt.nodes.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 55; n2.inputs["Detail"].default_value = 3
    nt.links.new(tc.outputs["Object"], n1.inputs["Vector"]); nt.links.new(tc.outputs["Object"], n2.inputs["Vector"])
    add = nt.nodes.new("ShaderNodeMath"); add.operation = "ADD"
    nt.links.new(n1.outputs["Fac"], add.inputs[0]); nt.links.new(n2.outputs["Fac"], add.inputs[1])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.25; bump.inputs["Distance"].default_value = 0.0006
    nt.links.new(add.outputs["Value"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    rmap = nt.nodes.new("ShaderNodeMapRange"); rmap.inputs["From Min"].default_value = 0.3; rmap.inputs["From Max"].default_value = 0.8
    rmap.inputs["To Min"].default_value = roughness - 0.08; rmap.inputs["To Max"].default_value = roughness + 0.12
    nt.links.new(n2.outputs["Fac"], rmap.inputs["Value"]); nt.links.new(rmap.outputs["Result"], b.inputs["Roughness"])
    return m


def eye(name, tex_path):
    m, nt, out = _nt(name); b = _bsdf(nt, out)
    t = _tex(nt, tex_path); nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.08
    b.inputs["Coat Weight"].default_value = 1.0; b.inputs["Coat Roughness"].default_value = 0.0
    b.inputs["Specular IOR Level"].default_value = 0.8
    b.inputs["Subsurface Weight"].default_value = 0.05
    return m


def alpha_card(name, tex_path, color=None, rough=0.5, spec=0.3, sheen=0.0, tint=None):
    """Hair / lashes / brows: texture colour + texture alpha."""
    m, nt, out = _nt(name); b = _bsdf(nt, out)
    t = _tex(nt, tex_path)
    if tint:
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0; _rgba_in(mix)[1].default_value = (*tint, 1)
        nt.links.new(t.outputs["Color"], _rgba_in(mix)[0]); nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])
    else:
        nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(t.outputs["Alpha"], b.inputs["Alpha"])
    b.inputs["Roughness"].default_value = rough
    b.inputs["Specular IOR Level"].default_value = spec
    b.inputs["Sheen Weight"].default_value = sheen
    return m


def fabric(name, tex_path=None, color=(0.5, 0.5, 0.5), rough=0.85, sheen=0.6, scale=1.0, normal_path=None):
    m, nt, out = _nt(name); b = _bsdf(nt, out)
    if tex_path:
        t = _tex(nt, tex_path); nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    else:
        b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Sheen Weight"].default_value = sheen; b.inputs["Sheen Roughness"].default_value = 0.4
    b.inputs["Specular IOR Level"].default_value = 0.2
    # woven micro-relief
    tc = nt.nodes.new("ShaderNodeTexCoord")
    br = nt.nodes.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = 900 * scale
    br.inputs["Mortar Size"].default_value = 0.08; br.inputs["Mortar Smooth"].default_value = 0.1
    br.offset = 0.5; br.squash = 1.0
    nt.links.new(tc.outputs["Object"], br.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.35; bump.inputs["Distance"].default_value = 0.0004
    nt.links.new(br.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def simple(name, color, rough=0.5, metal=0.0, emission=None):
    m, nt, out = _nt(name); b = _bsdf(nt, out)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emission:
        b.inputs["Emission Color"].default_value = (*emission[0], 1); b.inputs["Emission Strength"].default_value = emission[1]
    return m
