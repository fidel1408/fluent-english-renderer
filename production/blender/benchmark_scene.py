"""Benchmark scene: Lantern Workshop meeting room (stand-in figures, NOT final characters).
Usage: python benchmark_scene.py <engine: CYCLES|EEVEE> <out.png> [samples] [res_x]"""
import sys, time, math, bpy
from mathutils import Vector
engine, out = sys.argv[1], sys.argv[2]
samples = int(sys.argv[3]) if len(sys.argv) > 3 else 32
resx = int(sys.argv[4]) if len(sys.argv) > 4 else 960
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, col, rough=0.5, metal=0.0, emit=None, sss=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sss: b.inputs["Subsurface Weight"].default_value = sss
    if emit:
        b.inputs["Emission Color"].default_value = (*emit[0], 1)
        b.inputs["Emission Strength"].default_value = emit[1]
    return m
def obj(o, name, m, loc=(0,0,0), scale=(1,1,1), rot=(0,0,0)):
    o.name = name; o.location = loc; o.scale = scale; o.rotation_euler = rot
    o.data.materials.append(m); return o
def cube(*a, **k): bpy.ops.mesh.primitive_cube_add(size=1); return obj(bpy.context.object, *a, **k)
def sph(*a, **k): bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24); return obj(bpy.context.object, *a, **k)
def cyl(*a, **k): bpy.ops.mesh.primitive_cylinder_add(vertices=32); return obj(bpy.context.object, *a, **k)

wood = mat("Oak", (0.30,0.16,0.07), 0.35)
plaster = mat("WarmPlaster", (0.62,0.50,0.38), 0.85)
floor = mat("FloorWood", (0.20,0.11,0.06), 0.3)
cube("Floor", floor, (0,0,-0.05), (9,7,0.1))
cube("BackWall", plaster, (0,3.5,1.5), (9,0.1,3))
cube("LeftWall", plaster, (-4.5,0,1.5), (0.1,7,3))
cube("Table", wood, (0,0.3,0.75), (2.6,1.0,0.07))
for x in (-1.2,1.2):
    for y in (-0.1,0.7): cyl(f"Leg{x}{y}", wood, (x,y,0.37), (0.04,0.04,0.74))
cube("Lectern", wood, (-2.4,0.8,0.55), (0.5,0.4,1.1))
skin = [mat(f"Skin{i}", c, 0.45, sss=0.15) for i,c in enumerate([(0.55,0.36,0.27),(0.42,0.27,0.19),(0.75,0.55,0.44),(0.30,0.19,0.14)])]
cloth = [mat(f"Cloth{i}", c, 0.8) for i,c in enumerate([(0.10,0.25,0.35),(0.45,0.12,0.10),(0.18,0.30,0.20),(0.25,0.25,0.28)])]
hair = mat("Hair", (0.05,0.03,0.02), 0.6)
def person(name, x, y, rotz, i, h=1.0):
    cyl(name+"_Torso", cloth[i], (x,y,1.12*h), (0.17,0.11,0.30*h))
    cyl(name+"_Hips", cloth[(i+1)%4], (x,y,0.70*h), (0.16,0.11,0.20*h))
    sph(name+"_Head", skin[i], (x,y,1.60*h), (0.105,0.12,0.13))
    sph(name+"_Hair", hair, (x,y,1.65*h), (0.11,0.125,0.11))
    for s in (-1,1): cyl(f"{name}_Leg{s}", cloth[3], (x+s*0.08,y,0.32*h), (0.065,0.065,0.34*h))
    for o in bpy.data.objects:
        if o.name.startswith(name+"_"): 
            o.rotation_euler[2]=rotz
person("Maya", 0.5, 1.2, math.radians(180), 0)
person("Adrian", 1.2, 1.2, math.radians(180), 3, 1.05)
person("Leon", -2.4, 1.5, math.radians(-30), 1, 1.03)
person("Tess", 2.6, -1.4, math.radians(150), 2, 0.97)
# lamps (practicals)
for i,(x,y) in enumerate([(-3.0,2.8),(0.0,3.2),(3.0,2.8)]):
    sph(f"Lantern{i}", mat(f"LanternGlow{i}",(1,0.7,0.35),0.5,emit=((1,0.62,0.28),25)), (x,y,2.3), (0.18,0.18,0.25))
    bpy.ops.object.light_add(type='POINT', location=(x,y-0.2,2.2)); l=bpy.context.object; l.data.energy=300; l.data.color=(1,0.7,0.4); l.data.shadow_soft_size=0.15
bpy.ops.object.light_add(type='AREA', location=(-4.2,-1,2.0), rotation=(math.radians(80),0,math.radians(-70)))
k=bpy.context.object; k.name="WindowKey"; k.data.energy=900; k.data.size=2.0; k.data.color=(0.75,0.85,1.0)
bpy.ops.object.light_add(type='AREA', location=(3,-3,2.5), rotation=(math.radians(60),0,math.radians(30)))
f=bpy.context.object; f.name="Fill"; f.data.energy=150; f.data.size=3
w = bpy.data.worlds.new("W"); sc.world=w; w.use_nodes=True
w.node_tree.nodes["Background"].inputs[0].default_value=(0.03,0.035,0.05,1)
bpy.ops.object.empty_add(location=(0.4,1.2,1.4)); tgt=bpy.context.object
bpy.ops.object.camera_add(location=(-0.8,-3.8,1.55)); cam=bpy.context.object; sc.camera=cam
cam.data.lens=50; cam.data.dof.use_dof=True; cam.data.dof.focus_object=tgt; cam.data.dof.aperture_fstop=2.8
c=cam.constraints.new('TRACK_TO'); c.target=tgt; c.track_axis='TRACK_NEGATIVE_Z'; c.up_axis='UP_Y'
sc.render.resolution_x=resx; sc.render.resolution_y=resx*9//16; sc.render.filepath=out
sc.view_settings.view_transform='AgX'
t=time.time()
if engine=="CYCLES":
    sc.render.engine='CYCLES'; cy=sc.cycles; cy.device='CPU'; cy.samples=samples; cy.use_denoising=True
    cy.max_bounces=6
else:
    sc.render.engine='BLENDER_EEVEE'
    sc.eevee.taa_render_samples=samples
bpy.ops.render.render(write_still=True)
print(f"RESULT engine={engine} res={resx} samples={samples} seconds={time.time()-t:.1f}")
