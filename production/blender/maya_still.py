import sys, os, math, time, bpy
from mathutils import Vector
sys.path.insert(0, __file__.rsplit("/",1)[0])
import characters
out, resx, spp = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
bpy.ops.wm.read_factory_settings(use_empty=True)
t0=time.time(); H = characters.build_maya(hair=os.environ.get('HAIR','long01')); print("build s", round(time.time()-t0,1))
sc=bpy.context.scene
if os.environ.get('NOARM'):
    for o in bpy.data.objects:
        for m in list(o.modifiers): o.modifiers.remove(m)
if os.environ.get('NOKEYS'):
    for o in bpy.data.objects:
        if o.type=='MESH' and o.data.shape_keys: o.shape_key_clear()
head = H.objects["rig"].data.bones["head"]; 
print("head world", head.head_local, "height approx", max(v.co.z for v in H.objects['body'].data.vertices))
bpy.ops.object.light_add(type='AREA', location=(-1.5,-2.0,2.0)); k=bpy.context.object; k.data.energy=float(os.environ.get('KEY','400')); k.data.size=1.5
k.rotation_euler=(math.radians(70),0,math.radians(-35))
bpy.ops.object.light_add(type='AREA', location=(1.5,-1.0,1.8)); f=bpy.context.object; f.data.energy=80; f.data.size=2
f.rotation_euler=(math.radians(70),0,math.radians(40))
w=bpy.data.worlds.new("w"); sc.world=w; w.use_nodes=True; w.node_tree.nodes["Background"].inputs[0].default_value=(0.12,0.11,0.1,1)
CAMY=float(os.environ.get('CAMY','-2.6')); CAMZ=float(os.environ.get('CAMZ','1.45')); LENS=float(os.environ.get('LENS','70'))
for n in os.environ.get('HIDE','').split(','):
    if n and (H.name+'_'+n) in bpy.data.objects: bpy.data.objects[H.name+'_'+n].hide_render=True
bpy.ops.object.camera_add(location=(0.0,CAMY,CAMZ)); cam=bpy.context.object; sc.camera=cam; cam.data.lens=LENS
cam.rotation_euler=(math.radians(90),0,0)
sc.render.engine='CYCLES'; sc.cycles.device='CPU'; sc.cycles.samples=spp; sc.cycles.use_denoising=True
sc.render.resolution_x=resx; sc.render.resolution_y=resx*9//16; sc.render.filepath=out
sc.view_settings.view_transform='AgX'
t0=time.time(); bpy.ops.render.render(write_still=True); print("RENDER s", round(time.time()-t0,1))
bpy.ops.wm.save_as_mainfile(filepath=out.replace('.png','.blend'))
