import sys, subprocess
from PIL import Image
ts=sys.argv[2].split(','); mode=sys.argv[3]; sc=sys.argv[4]; out=sys.argv[5]
subprocess.check_call([sys.executable,'tools/shot_t.py',sys.argv[1],sys.argv[2],mode,sc])
ims=[Image.open(f'out/build_t{float(t):05.2f}.png') for t in ts]; w,h=ims[0].size
sh=Image.new('RGB',(w*len(ims),h)); [sh.paste(im,(i*w,0)) for i,im in enumerate(ims)]; sh.save(out)
