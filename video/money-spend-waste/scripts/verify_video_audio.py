"""Proves the MP4's own audio track contains every layer: decodes it, aligns it with the rendered stems, and solves
   mp4_audio ≈ a·voice + b·music + c·ambience + d·effects   (least squares).
Each coefficient must be clearly > 0 (layer present, at its expected relative level), R² must be high, and the speaking pause must be quiet."""
import sys, os, subprocess, numpy as np, soundfile as sf, tempfile
mp4 = sys.argv[1]; D = os.path.join(os.path.dirname(__file__), '..', 'audio', 'export')
tmp = tempfile.mktemp(suffix='.wav'); subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp4, '-vn', '-ac', '1', '-ar', '44100', tmp], check=True)
x, sr = sf.read(tmp); os.remove(tmp)
info = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,sample_rate,channels,duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.split()
print('streams:', info)
if not any('audio' in s for s in info): print('FAIL: MP4 has no audio stream'); sys.exit(1)
ld = lambda n: (lambda a: a if a.ndim == 1 else a.mean(1))(sf.read(os.path.join(D, n))[0])
S = {k: ld(f'stem_{k}.wav') for k in ['voice', 'music', 'ambience', 'sfx']}; ref = ld('mix_raw.wav')
# align by cross-correlation on a 4 s excerpt (AAC encoder delay): x[t + L] ≈ ref[t]
s0, e0 = int(1 * sr), int(5 * sr); best = (-1.0, 0); ra = ref[s0:e0]
for L in range(-3000, 3001):
    seg = x[s0 + L:e0 + L]
    if len(seg) == len(ra):
        r = float(np.dot(seg, ra) / (np.linalg.norm(seg) * np.linalg.norm(ra) + 1e-12))
        if r > best[0]: best = (r, L)
lag = best[1]; print(f'alignment lag {lag} samples ({lag / sr * 1000:.1f} ms), correlation with the rendered mix {best[0]:.4f}')
m = min(len(x) - max(lag, 0), len(ref) - max(-lag, 0)) - 2000
y = x[max(lag, 0):max(lag, 0) + m]
A = np.stack([S[k][max(-lag, 0):max(-lag, 0) + m] for k in S], 1)
coef, *_ = np.linalg.lstsq(A, y, rcond=None); pred = A @ coef; r2 = 1 - np.sum((y - pred) ** 2) / np.sum((y - y.mean()) ** 2)
names = list(S); print('regression coefficients (mp4 = Σ coef·stem):', {k: round(float(c), 3) for k, c in zip(names, coef)}, ' R² =', round(float(r2), 4))
# contribution of each layer to the delivered audio, in dB re the whole file
tot = np.sqrt(np.mean(y ** 2)); contrib = {k: 20 * np.log10(max(np.sqrt(np.mean((A[:, i] * coef[i]) ** 2)), 1e-9) / tot) for i, k in enumerate(names)}
print('layer level inside the MP4 audio (dB rel. total):', {k: round(float(v), 1) for k, v in contrib.items()})
ok = r2 > 0.9 and all(c > 0.05 for c in coef) and all(v > -45 for v in contrib.values())
# windows
db = lambda v: 20 * np.log10(max(v, 1e-9)); w = lambda a, b: float(np.sqrt(np.mean(x[int(a * sr):int(b * sr)] ** 2)))
print(f'speech window 0.3–3.5 s: {db(w(0.3, 3.5)):.1f} dBFS RMS | pause 20.3–22.7 s: {db(w(20.3, 22.7)):.1f} dBFS | CTA 23.5–28.3 s: {db(w(23.5, 28.3)):.1f} dBFS')
pause_ok = db(w(20.3, 22.7)) < db(w(0.3, 3.5)) - 25
clip = float(np.max(np.abs(x))); print('peak', round(db(clip), 1), 'dBFS', '(no clipping)' if clip < 0.99 else 'CLIPPING')
ok = ok and pause_ok and clip < 0.99
print('RESULT:', 'PASS — narration, music, ambience and effects are all present in the MP4 audio; the speaking pause is quiet' if ok else 'FAIL'); sys.exit(0 if ok else 1)
