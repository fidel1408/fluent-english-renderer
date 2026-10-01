import sys,glob
from PIL import Image, ImageDraw
files=sorted(glob.glob('dev/out/acts/*.png')); names=sys.argv[1:] 
sel=[f for f in files if any(f.split('/')[-1].startswith(n+'_') for n in names)] if names else files
W,H=640,360
cols=3
for s in range(0,len(sel),12):
    chunk=sel[s:s+12]; rows=(len(chunk)+cols-1)//cols
    im=Image.new('RGB',(cols*W,rows*H),'white')
    for i,f in enumerate(chunk):
        t=Image.open(f).convert('RGB').resize((W,H)); d=ImageDraw.Draw(t); d.text((6,H-14),f.split('/')[-1],fill=(255,0,0)); im.paste(t,((i%cols)*W,(i//cols)*H))
    im.save(f'dev/out/sheet_{s//12}.png')
print(len(sel))
