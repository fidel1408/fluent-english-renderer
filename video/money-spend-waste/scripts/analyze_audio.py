"""Objective checks of the rendered soundtrack: levels per layer, ducking depth, quiet pause, clipping, loudness."""
import soundfile as sf, numpy as np, sys, os, json, subprocess
D = os.path.join(os.path.dirname(__file__), '..', 'audio', 'export')
def load(n):
    x, sr = sf.read(os.path.join(D, n)); return (x if x.ndim == 1 else x.mean(1)), sr
db = lambda v: 20 * np.log10(max(v, 1e-9))
L = {k: load(f'stem_{k}.wav')[0] for k in ['voice', 'music', 'ambience', 'sfx']}; mix, sr = load('soundtrack.wav'); raw, _ = load('mix_raw.wav')
rms = lambda x, a, b: float(np.sqrt(np.mean(x[int(a * sr):int(b * sr)] ** 2)))
voice_wins = [(0.25, 3.59), (4.2, 6.02), (6.45, 10.54), (11.3, 13.16), (13.9, 16.39), (17.3, 20.01), (23.2, 28.42)]
PAUSE = (20.15, 22.8)
print('peak dBFS  ', {k: round(db(np.max(np.abs(v))), 1) for k, v in L.items()}, ' mix_raw', round(db(np.max(np.abs(raw))), 1), ' final', round(db(np.max(np.abs(mix))), 1))
print('overall RMS', {k: round(db(np.sqrt(np.mean(v ** 2))), 1) for k, v in L.items()}, ' final', round(db(np.sqrt(np.mean(mix ** 2))), 1))
vm = np.zeros(len(L['voice']), bool)
for a, b in voice_wins: vm[int(a * sr):int(b * sr)] = True
for k in ['music', 'ambience', 'sfx']:
    x = L[k]; print(f'{k:9s} RMS under speech {db(np.sqrt(np.mean(x[vm]**2))):6.1f} dB | in gaps {db(np.sqrt(np.mean(x[~vm]**2))):6.1f} dB | pause window {db(rms(x, *PAUSE)):6.1f} dB')
print('voice RMS in speech windows', round(db(np.sqrt(np.mean(L['voice'][vm] ** 2))), 1), 'dB; voice in pause', round(db(rms(L['voice'], *PAUSE)), 1))
print('final mix: speech windows', round(db(np.sqrt(np.mean(mix[vm] ** 2))), 1), 'dB, pause window', round(db(rms(mix, *PAUSE)), 1), 'dB')
# voice-to-bed ratio under speech (dB): how far the bed sits below the narration
bed = L['music'] + L['ambience'] + L['sfx']
print('bed vs voice during speech (dB):', round(db(np.sqrt(np.mean(bed[vm] ** 2))) - db(np.sqrt(np.mean(L['voice'][vm] ** 2))), 1))
# per-second profile of the final mix
print('final mix RMS per second (dB):', ' '.join(f'{db(rms(mix, i, i + 1)):.0f}' for i in range(int(len(mix) / sr))))
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', os.path.join(D, 'soundtrack.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print([l.strip() for l in r.splitlines() if ('I:' in l or 'Peak:' in l or 'LRA:' in l)][-3:])
print('DC offset', {k: round(float(np.mean(v)), 5) for k, v in L.items()}, 'NaN?', any(np.isnan(v).any() for v in L.values()))
