import json,os,subprocess,sys
d=sys.argv[1]
plan=json.load(open(os.path.join(os.path.dirname(__file__),'.plan.json')))
files=[]
for s in plan['segs']:
    files.append(f"s{s['id']}_film.png")
    if s['hasAct']: files.append(f"s{s['id']}_act.png")
files=[os.path.join(d,f) for f in files if os.path.exists(os.path.join(d,f))]
n=0
for i in range(0,len(files),4):
    chunk=files[i:i+4]
    ins=sum([['-i',f] for f in chunk],[])
    flt=''.join(f'[{k}]scale=960:540[v{k}];' for k in range(len(chunk)))
    pad=''.join(f'[v{k}]' for k in range(len(chunk)))
    lay='|'.join(f"{(k%2)*960}_{(k//2)*540}" for k in range(len(chunk)))
    subprocess.run(['ffmpeg','-loglevel','error','-y']+ins+['-filter_complex',flt+pad+f'xstack=inputs={len(chunk)}:layout={lay}','-frames:v','1',os.path.join(d,f'sheet{n}.png')])
    n+=1
print(n,'sheets')
