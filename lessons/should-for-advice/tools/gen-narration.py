#!/usr/bin/env python3
"""Synthesize every clip in narration/script.json with Kokoro-82M (Apache-2.0, runs locally on CPU, no API key, no cost).
Voices: narrator af_heart; dialogue voices per character (see FE.CHARS). Output: narration/clips/<id>.mp3 and src/generated/manifest.json
Usage: python3 tools/gen-narration.py [model_dir]   (model_dir has kokoro-v1.0.onnx and voices-v1.0.bin)"""
import json, sys, subprocess, pathlib, tempfile, os
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
root = pathlib.Path(__file__).resolve().parent.parent
md = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/kk')
k = Kokoro(str(md/'kokoro-v1.0.onnx'), str(md/'voices-v1.0.bin'))
script = json.loads((root/'narration/script.json').read_text())
out = root/'narration/clips'; out.mkdir(parents=True, exist_ok=True)
manP = root/'src/generated/manifest.json'
man = json.loads(manP.read_text()) if manP.exists() else {}
TARGET = 10 ** (-21/20)
def trim(x, sr):
    a = np.abs(x); thr = 0.012
    idx = np.where(a > thr)[0]
    if len(idx) == 0: return x
    s = max(0, idx[0] - int(0.05*sr)); e = min(len(x), idx[-1] + int(0.12*sr))
    return x[s:e]
keep = {c['id'] for c in script['clips']}
for f in out.glob('*.mp3'):
    if f.stem not in keep: f.unlink()
man = {k: v for k, v in man.items() if k in keep}
todo = [c for c in script['clips'] if not (out/f"{c['id']}.mp3").exists() or c['id'] not in man]
print(len(todo), 'clips to synthesize of', len(script['clips']), flush=True)
for n, c in enumerate(todo):
    sp = c['spoken']
    if sp.startswith('PH:'): x, sr = k.create(sp[3:], voice=c['voice'], speed=c['sp'], lang='en-us', is_phonemes=True)
    else: x, sr = k.create(sp, voice=c['voice'], speed=c['sp'], lang='en-us')
    x = trim(x.astype(np.float64), sr)
    rms = np.sqrt((x**2).mean()) + 1e-9
    x = x * (TARGET / rms)
    pk = np.abs(x).max()
    if pk > 0.89: x = x * (0.89 / pk)
    x = np.concatenate([np.zeros(int(0.04*sr)), x, np.zeros(int(0.06*sr))])
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t: tmp = t.name
    sf.write(tmp, x, sr)
    mp3 = out/f"{c['id']}.mp3"
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','40k',str(mp3)], check=True)
    os.unlink(tmp)
    dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(mp3)]).decode().strip())
    fr = int(sr/25); m = len(x)//fr
    env = np.array([np.sqrt((x[i*fr:(i+1)*fr]**2).mean()) for i in range(m)])
    ref = np.percentile(env, 92) + 1e-9
    q = np.clip(np.round(env/ref*8), 0, 8).astype(int)
    man[c['id']] = {'d': round(dur, 3), 'e': ''.join(str(v) for v in q)}
    if n % 10 == 0:
        manP.write_text(json.dumps(man)); print(n+1, '/', len(todo), c['voice'], round(dur,2), flush=True)
manP.write_text(json.dumps(man))
print('done', len(man), 'clips; total seconds', round(sum(v['d'] for v in man.values()), 1))
