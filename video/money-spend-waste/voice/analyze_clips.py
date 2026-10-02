"""Prints speech runs (start,end in s) per clip: gaps >= 60 ms split runs. Used to place caption splits and word highlights."""
import soundfile as sf, numpy as np, glob, os, json
out = {}
for p in sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'audio', '*.wav'))):
    if 'voiceover' in p or 'stem' in p: continue
    x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1); n = int(sr * 0.01)
    e = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x) - n, n)]); a = e > 0.012
    runs = []; i = 0
    while i < len(a):
        if a[i]:
            j = i
            while j < len(a) and (a[j] or (j + 6 < len(a) and a[j:j + 6].any())): j += 1
            runs.append((round(i * .01, 2), round(j * .01, 2))); i = j
        else: i += 1
    out[os.path.basename(p)[:-4]] = {'dur': round(len(x) / sr, 2), 'runs': runs}
    print(os.path.basename(p)[:-4], out[os.path.basename(p)[:-4]])
json.dump(out, open(os.path.join(os.path.dirname(__file__), '..', 'audio', 'clip_marks.json'), 'w'), indent=1)
