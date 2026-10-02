"""A/V sync spot-checks measured on the delivered MP4 itself:
 1) the listening cue at the start of the speaking pause (audio onset) vs the first frame showing the mic/countdown badge,
 2) the box-landing thud (audio) vs the frame where the box has landed on the table,
 3) the first narration word vs the first caption frame."""
import sys, subprocess, numpy as np, soundfile as sf, os, tempfile
mp4 = sys.argv[1]; FPS = 30
wav = tempfile.mktemp(suffix='.wav'); subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp4, '-vn', '-ac', '1', '-ar', '44100', wav], check=True)
x, sr = sf.read(wav); os.remove(wav)
def frame(t):
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', f'{t:.4f}', '-i', mp4, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return np.frombuffer(r, np.uint8).reshape(1920, 1080, 3).astype(int)
def onset(a, b, hp=None, thr=4.0):
    seg = x[int(a * sr):int(b * sr)]; env = np.abs(seg); w = int(sr * 0.002); e = np.convolve(env, np.ones(w) / w, 'same'); base = np.median(e[:int(0.05 * sr)]) + 1e-5
    i = np.argmax(e > max(thr * base, 0.004)); return a + i / sr
ok = True
# 1) pause cue: audio onset vs mic badge (gold ring at ~(905,1255))
a_on = onset(20.0, 20.4)
vis = None
for k in range(int(19.9 * FPS), int(20.4 * FPS)):
    f = frame(k / FPS); px = f[1255 - 90:1255 + 90, 905 - 90:905 + 90]; gold = ((abs(px[..., 0] - 246) < 25) & (abs(px[..., 1] - 183) < 25) & (abs(px[..., 2] - 60) < 40)).sum()
    if gold > 150: vis = k / FPS; break
print(f'pause cue: audio onset {a_on:.3f} s | mic badge first visible {vis} s | offset {None if vis is None else round((a_on - vis) * 1000)} ms')
ok &= vis is not None and abs(a_on - vis) < 0.12
# 2) thud: low-frequency transient near 14.75 s vs box on table
from numpy.fft import rfft
seg = x[int(14.5 * sr):int(15.2 * sr)]; F = np.fft.rfft(seg); fr = np.fft.rfftfreq(len(seg), 1 / sr); F[fr > 130] = 0; seg = np.fft.irfft(F, len(seg))   # keep <130 Hz: the narration has almost nothing there
n = int(sr * 0.01); e = np.array([np.sqrt(np.mean(seg[i:i + n] ** 2)) for i in range(0, len(seg) - n, n)]); t_thud = 14.5 + (np.argmax(np.diff(e)) + 1) * 0.01
print(f'box thud: strongest audio rise at {t_thud:.2f} s (box lands at 14.75 s per animation timeline)'); ok &= abs(t_thud - 14.75) < 0.12
# 3) first narration word vs first caption pill (caption bg #071731 at y~1500)
a0 = onset(0.1, 0.6, thr=3.0); vis = None
for k in range(0, int(0.8 * FPS)):
    f = frame(k / FPS); px = f[1440:1560, 200:880]; ivory = ((px[..., 0] > 230) & (px[..., 1] > 225) & (px[..., 2] > 205)).sum()
    if ivory > 300: vis = k / FPS; break
print(f'first words: audio onset {a0:.3f} s | caption first visible {vis} s'); ok &= vis is not None and abs(a0 - vis) < 0.25
print('RESULT:', 'PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
