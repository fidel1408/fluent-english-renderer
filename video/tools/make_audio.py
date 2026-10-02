"""Original sound design + mix for the Fluent English reel. Everything here is synthesised from scratch
(numpy/scipy) – no samples, no third-party audio. Stems are written already ducked so they sum to the master.
Outputs: audio/stems/{narration,english,music,sfx,ambience}.wav (+ .mp3 previews), audio/mix_master.wav,
         audio/mix_mono.wav, audio/mix_phone_sim.wav, audio/metrics.json"""
import json, os, numpy as np, soundfile as sf
from scipy import signal
import pyloudnorm as pyln
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 48000; DUR = 30.0; N = int(SR * DUR)
TL = json.load(open("audio/timeline.json")); rng = np.random.default_rng(7)
os.makedirs("audio/stems", exist_ok=True)
t_ax = np.arange(N) / SR
def db(x): return 10 ** (x / 20)
def stereo(x, pan=0.0):  # constant-power pan, pan in [-1,1]
    a = (pan + 1) * np.pi / 4; return np.stack([x * np.cos(a) * np.sqrt(2), x * np.sin(a) * np.sqrt(2)], 1) * 0.7071
def place(buf, x, t0, gain=1.0):
    i = int(t0 * SR); n = min(len(x), buf.shape[0] - i)
    if n > 0: buf[i:i + n] += (x[:n] if x.ndim == 2 else stereo(x[:n])) * gain
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, a, b, o=2): return signal.sosfilt(signal.butter(o, [a, b], 'band', fs=SR, output='sos'), x, axis=0)
def env_ad(n, a, d, curve=3.0):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na) ** 1.5
    nd = max(1, int(d * SR)); e[-nd:] *= np.linspace(1, 0, nd) ** curve if nd <= n else 1; return e
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def noise(n): return rng.standard_normal(n)
def pink(n):
    w = noise(n); return lp(w, 800, 1) * 0.6 + lp(w, 150, 1) * 1.2 + lp(w, 3000, 1) * 0.15

# ---------------- voices ----------------
def load_voice(name, target_dbfs=-21.0):
    x, sr = sf.read(f"audio/voice/{name}.wav"); assert sr == SR
    x = hp(x, 75, 2); r = np.sqrt(np.mean(x ** 2)); return x * (db(target_dbfs) / r)
narr = np.zeros((N, 2)); eng = np.zeros((N, 2))
for k in ["n1_hook", "n2_first", "n4_you", "n5_school", "n6_cta"]: place(narr, load_voice(k, -20.0), TL["clips"][k]["start"])
for k in ["e1_normal", "e2_slow"]: place(eng, load_voice(k, -19.0), TL["clips"][k]["start"])

# ---------------- music (original) ----------------
BPM = 96; BAR = 4 * 60 / BPM; BEAT = 60 / BPM
CH = {'Am9': [45, 52, 55, 59, 64], 'Dm7': [38, 50, 53, 57, 60], 'F': [41, 48, 52, 57, 60], 'C9': [36, 48, 52, 55, 62], 'Am7': [45, 52, 55, 60, 64], 'G': [43, 50, 55, 59, 62], 'Cm9': [36, 48, 55, 59, 62]}
PROG = ['Am9', 'Dm7', 'F', 'C9', 'Am7', 'F', 'C9', 'Am7', 'F', 'G', 'F', 'Cm9']  # 12 bars = 30 s
def pad_note(m, dur, bright):
    n = int((dur + 1.2) * SR); tt = np.arange(n) / SR; f0 = midi(m); y = np.zeros(n)
    for det in (-0.04, 0.0, 0.04):
        f = f0 * 2 ** (det / 12)
        for h in range(1, 7): y += np.sin(2 * np.pi * f * h * tt + h) / h ** (1.6 - 0.5 * bright) * (0.4 if h > 3 else 1.0)
    a = np.minimum(1, tt / 0.7) ** 1.5; r = np.clip((dur + 1.2 - tt) / 1.2, 0, 1) ** 1.5
    return y * a * r / 3
def pluck(m, dur=1.4, bright=0.6):
    n = int(dur * SR); tt = np.arange(n) / SR; f = midi(m); y = np.zeros(n)
    for h, (amp, dec) in enumerate([(1, 3.5), (0.35, 7), (0.18, 11), (0.08, 16)], 1): y += amp * np.sin(2 * np.pi * f * h * tt) * np.exp(-dec * tt * (1.6 - bright * .6))
    return y * np.minimum(1, tt / 0.004)
music = np.zeros((N, 2))
# section gain (dB) automation for pad / pluck / bass over time  (piecewise-linear points)
def curve(pts):
    xs, ys = zip(*pts); return db(np.interp(t_ax, xs, ys))
PAD_G = curve([(0, -60), (0.6, -23), (3.6, -19), (3.95, -40), (4.25, -40), (4.7, -22), (8.0, -22), (8.6, -23), (13.8, -23), (14.4, -29), (16.5, -31), (19.7, -31), (20.1, -20), (26.0, -17), (28.8, -17), (30, -22)])
PLK_G = curve([(0, -80), (4.3, -80), (4.6, -32), (8.2, -32), (8.7, -33), (13.8, -33), (14.4, -80), (19.9, -80), (20.2, -25), (28.8, -25), (30, -32)])
BASS_G = curve([(0, -80), (1.0, -80), (1.4, -29), (3.7, -29), (3.95, -80), (4.4, -80), (4.7, -31), (8.2, -31), (8.6, -33), (13.8, -33), (14.4, -80), (19.9, -80), (20.2, -24), (28.8, -24), (30, -30)])
pad = np.zeros((N, 2)); bass = np.zeros(N); plk = np.zeros((N, 2))
for b, name in enumerate(PROG):
    t0 = b * BAR; notes = CH[name]
    for j, m in enumerate(notes[1:] if name not in ('Dm7',) else notes[1:]):
        p = pad_note(m, BAR + 0.3, 0.3 + 0.7 * (t0 > 19)); place(pad, p, t0, 0.5 * (1 + 0.15 * (-1) ** j))
    bn = int((BAR + 0.5) * SR); tt = np.arange(bn) / SR; fb = midi(notes[0])
    by = (np.sin(2 * np.pi * fb * tt) + 0.3 * np.sin(4 * np.pi * fb * tt)) * np.minimum(1, tt / 0.05) * np.clip((BAR + .5 - tt) / .5, 0, 1)
    i = int(t0 * SR); bass[i:i + min(bn, N - i)] += by[:N - i] * 0.9
    # arpeggio on eighths
    arp = [notes[1], notes[3], notes[2], notes[4], notes[3], notes[2], notes[4], notes[3]]
    for e in range(8):
        tt0 = t0 + e * BEAT / 2
        sparse = (4.3 < tt0 < 8.2 and e % 2 == 0) or (8.2 <= tt0 < 13.8 and e % 4 == 0) or (tt0 >= 19.9)
        if not sparse or tt0 > 29.0: continue
        place(plk, stereo(pluck(arp[e] + 12, 1.3, 0.6 if tt0 < 20 else 0.8), pan=(-0.15 if e % 2 else 0.15)), tt0, 1.0)
pad *= PAD_G[:, None]; plk *= PLK_G[:, None]; bass = bass * BASS_G
music += pad + plk + stereo(lp(bass, 220, 2)) * 0.9
# soft hat/shaker pulse in the lift + close (band-limited, no harsh highs)
hat = np.zeros(N)
for k in range(int(20.0 / (BEAT / 2)), int(29.0 / (BEAT / 2))):
    t0 = k * BEAT / 2; i = int(t0 * SR); n = int(0.05 * SR); ev = noise(n) * np.exp(-np.arange(n) / SR * 70)
    hat[i:i + n] += ev * (0.5 if k % 2 else 0.9)
music += stereo(bp(hat, 3500, 7000, 2)) * db(-41)
# airy shimmer texture for the quiet practice window
shim = lp(hp(pink(N), 1800), 5500, 2) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t_ax)) * curve([(0, -90), (15.5, -90), (16.4, -44), (19.7, -44), (20.2, -90), (30, -90)])
music += stereo(shim)
music = lp(music, 7000, 2)
# final resolved chord swell + tail to the closing accent
music *= curve([(0, 0), (29.2, 0), (30.0, -30)])[:, None]

# ---------------- SFX (original) ----------------
sfx = np.zeros((N, 2))
def bell(f, dur=1.0, fm=2.0, idx=1.2, dec=4.0):
    n = int(dur * SR); tt = np.arange(n) / SR; y = np.sin(2 * np.pi * f * tt + idx * np.sin(2 * np.pi * f * fm * tt) * np.exp(-6 * tt)) * np.exp(-dec * tt)
    return y * np.minimum(1, tt / 0.003)
def click(f=1500, dur=0.06):
    n = int(dur * SR); tt = np.arange(n) / SR; y = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 140) + bp(noise(n), 1800, 5000, 2) * np.exp(-tt * 220) * 0.5
    return y
def whoosh(dur, f0, f1, peak=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR; x = noise(n); fc = np.geomspace(f0, f1, n); out = np.zeros(n); B = 512
    for i in range(0, n, B):
        c = fc[min(i + B // 2, n - 1)]; out[i:i + B] = bp(x[i:i + B], c * 0.6, min(c * 1.6, 9000), 2)
    e = np.sin(np.pi * (tt / dur)) ** 2
    return out * e / (np.max(np.abs(out)) + 1e-9) * peak
def riser(t0, t1):
    n = int((t1 - t0) * SR); tt = np.arange(n) / SR; x = pink(n); fc = np.geomspace(350, 3200, n); out = np.zeros(n); B = 512
    for i in range(0, n, B): c = fc[min(i + B // 2, n - 1)]; out[i:i + B] = bp(x[i:i + B], c * 0.7, c * 1.4, 2)
    return out * (tt / (t1 - t0)) ** 2.2
SFX_CUES = []  # (time, label, gain dB)
def cue(t, label, x, g_db, pan=0.0):
    SFX_CUES.append((round(t, 2), label, g_db)); place(sfx, stereo(x, pan), t, db(g_db))
cue(0.12, "Incoming-question cue (soft interface ping, two notes)", np.concatenate([bell(988, .5, 2, .8, 6), np.zeros(0)]), -22)
cue(0.30, "Incoming-question cue, second note", bell(1480, .7, 2, .8, 5), -25)
cue(1.52, "Understood check tick", bell(1318, .5, 2, .6, 8), -26)
r = riser(2.35, 3.95); i = int(2.35 * SR); sfx[i:i + len(r)] += stereo(r) * db(-28)
cue(3.95, "Bloom whoosh (scene opens up)", whoosh(0.7, 500, 3000, .6), -23)
for k, tc in enumerate([5.75, 5.9, 6.05, 6.2, 6.4]): cue(tc, f"Word click {k + 1}/5 (sentence assembling)", click(1300 + 160 * k), -23 + (2 if k == 4 else 0), pan=(k - 2) * 0.05)
cue(6.4, "Sentence-complete soft sparkle", bell(1976, 0.9, 3, .5, 5), -29)
cue(6.38, "Gesture cloth movement", lp(noise(int(.35 * SR)), 2500, 2) * np.hanning(int(.35 * SR)) * 0.5, -35)
cue(7.95, "Transition sweep to lesson card", whoosh(0.55, 700, 2600, .5), -25)
cue(12.80, "Blank-slot soft tick (after model audio ends)", click(900, .08), -30)
cue(13.95, "Transition sweep to the viewer scene", whoosh(0.55, 600, 2400, .5), -25)
for k, tc in enumerate([14.95, 15.37, 15.79]): cue(tc, f"Option card {k + 1} soft pop", bell(659 * (1.122 ** k), .35, 2, .4, 9), -31)
cue(19.80, "End of speaking time – soft single chime", bell(784, 1.1, 2, .5, 3.2), -26)
cue(19.95, "Transition sweep + warm lift", whoosh(0.7, 500, 3200, .7), -22)
cue(20.50, "Logo shimmer", bell(1568, 1.0, 3, .5, 4), -30)
cue(21.0, "Call window pop", bell(523, .4, 2, .5, 9), -31)
cue(22.0, "Chat bubble", bell(880, .4, 2, .5, 9), -33); cue(22.45, "Chat reply", bell(1175, .4, 2, .5, 9), -33)
cue(24.8, "Transition sweep to CTA", whoosh(0.6, 600, 2800, .5), -24)
for k in range(1, 7): cue(26.3 + 0.7 * k / 6.99, f"Typing tick {k}/6", click(1100 + 90 * (k % 3), .045), -33)
for k, fm_ in enumerate([72, 79, 88]): cue(28.25 + 0.06 * k, f"Closing accent note {k + 1}", bell(midi(fm_ + 12) / 1.0, 1.1 - 0.06 * k, 2, .5, 3.4 + k * .4), -23 - 2 * k)
sfx = lp(sfx, 9000, 2)

# ---------------- ambience ----------------
amb = np.zeros((N, 2))
room = lp(pink(N), 700, 2) * 0.5; air = hp(lp(pink(N), 4000, 1), 900, 1) * 0.1 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t_ax))
amb[:, 0] = room * 0.9 + air; amb[:, 1] = np.roll(room, 997) * 0.9 + np.roll(air, 1553)
amb *= curve([(0, -49), (4.2, -49), (4.6, -46), (14, -46), (16.4, -43), (19.8, -43), (20.2, -47), (30, -47)])[:, None]
rum = lp(noise(N), 90, 2) * curve([(0, -48), (3.9, -46), (4.3, -90), (30, -90)]); amb += stereo(rum) * 0.5  # faint evening-city hum in the first scene

# ---------------- ducking ----------------
def smooth_env(x, att=0.02, rel=0.5):
    e = np.abs(x).max(1) if x.ndim == 2 else np.abs(x); e = lp(e, 40, 1) if False else e
    out = np.zeros_like(e); a = np.exp(-1 / (att * SR)); r = np.exp(-1 / (rel * SR)); y = 0.0
    # vectorised via blocks of 1 ms
    B = 48; m = e[:len(e) // B * B].reshape(-1, B).max(1); o = np.zeros_like(m); y = 0
    ab = np.exp(-B / (att * SR)); rb = np.exp(-B / (rel * SR))
    for i, v in enumerate(m): y = v + ab * (y - v) if v > y else v + rb * (y - v); o[i] = y
    return np.repeat(o, B)[:len(e)] if len(o) * B >= len(e) else np.pad(np.repeat(o, B), (0, len(e) - len(o) * B), mode='edge')
env_n = smooth_env(narr); env_e = smooth_env(eng)
act_n = np.clip(env_n / 0.02, 0, 1); act_e = np.clip(env_e / 0.02, 0, 1)
act_n = np.convolve(act_n, np.ones(2400) / 2400, 'same'); act_e = np.convolve(act_e, np.ones(2400) / 2400, 'same')
def duck(dn, de): return db(-(dn * act_n + de * act_e) / np.maximum(1, 1))[:, None]
music *= curve([(0, 5.0), (19.8, 5.0), (20.3, -3.0), (30, -3.0)])[:, None]; music *= duck(7.5, 11.0); sfx *= duck(5.0, 18.0); amb *= duck(3.0, 6.0)

# ---------------- masters ----------------
stems = dict(narration=narr, english=eng, music=music, sfx=sfx, ambience=amb)
raw = sum(stems.values())
meter = pyln.Meter(SR)
lufs_raw = meter.integrated_loudness(raw); gain = db(-14.0 - lufs_raw)
def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=0); return 20 * np.log10(np.max(np.abs(up)) + 1e-12)
def limiter(x, ceil_db=-1.3, look=0.004, rel=0.12):
    ceil = db(ceil_db); up = np.abs(signal.resample_poly(x, 4, 1, axis=0)).max(1); up = up[:len(x) * 4].reshape(-1, 4).max(1); up = np.pad(up, (0, len(x) - len(up)))
    need = np.minimum(1, ceil / np.maximum(up, 1e-9))
    L = int(look * SR); g_ = -np.log(need + 1e-9)
    g_ = signal.sosfilt(signal.butter(1, 1 / rel, 'low', fs=SR, output='sos'), np.maximum.accumulate(g_[::-1])[::-1]) if False else g_
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    g2 = maximum_filter1d(g_, 2 * L + 1); g2 = uniform_filter1d(g2, L + 1)
    return x * np.exp(-g2)[:, None]
mix = limiter(raw * gain)
# micro fades so file starts/ends silently
fi = int(0.01 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]; mix[-int(.05 * SR):] *= np.linspace(1, 0, int(.05 * SR))[:, None]
for k, v in stems.items():
    v = v * gain; v[:fi] *= np.linspace(0, 1, fi)[:, None]; v[-int(.05 * SR):] *= np.linspace(1, 0, int(.05 * SR))[:, None]
    sf.write(f"audio/stems/{k}.wav", v.astype(np.float32), SR, subtype="PCM_24")
sf.write("audio/mix_master.wav", mix, SR, subtype="PCM_24")
mono = mix.mean(1); sf.write("audio/mix_mono.wav", mono, SR, subtype="PCM_24")
# phone-speaker *simulation* (band-limit + mild saturation; not a real device test)
ph = np.tanh(1.6 * bp(mono, 320, 7500, 2)) / np.tanh(1.6); sf.write("audio/mix_phone_sim.wav", ph * 0.9, SR, subtype="PCM_24")
# ---------------- metrics ----------------
def momentary(x, win=0.5, hop=0.25):
    out = []
    for s in np.arange(0, DUR - win, hop):
        seg_ = x[int(s * SR):int((s + win) * SR)];
        try: out.append((s, meter.integrated_loudness(seg_)))
        except Exception: pass
    return out
mom = [(s, l) for s, l in momentary(mix) if l > -70]
jumps = max(abs(mom[i + 1][1] - mom[i][1]) for i in range(len(mom) - 1))
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def seg_rms(x, a, b): return rms_db(x[int(a * SR):int(b * SR)] * gain)
ve = lambda k: TL["clips"][k]
speech_clips = ["n1_hook", "n2_first", "n4_you", "n5_school", "n6_cta"]
snr = []
for k in speech_clips + ["e1_normal", "e2_slow"]:
    a, b = ve(k)["start"], ve(k)["end"]; bed = music + sfx + amb
    voice = narr if k.startswith('n') else eng
    snr.append((k, round(seg_rms(voice, a, b) - seg_rms(bed, a, b), 1)))
metrics = dict(sample_rate=SR, duration_s=round(len(mix) / SR, 3),
    integrated_lufs_final=round(meter.integrated_loudness(mix), 2), integrated_lufs_before_limiter=round(lufs_raw + 20 * np.log10(gain), 2),
    true_peak_dbtp_final=round(true_peak_db(mix), 2), sample_peak_dbfs=round(20 * np.log10(np.abs(mix).max()), 2),
    mono_lufs=round(meter.integrated_loudness(np.stack([mono, mono], 1)), 2),
    stereo_L_R_correlation=round(float(np.corrcoef(mix[:, 0], mix[:, 1])[0, 1]), 3),
    max_momentary_loudness_jump_lu=round(float(jumps), 1), momentary_lufs_range=[round(min(l for _, l in mom), 1), round(max(l for _, l in mom), 1)],
    voice_minus_bed_rms_db=snr, clipped_samples=int((np.abs(mix) >= 0.999).sum()),
    music_after_duck_rms_db_during_speech=round(seg_rms(music, 0.4, 3.0), 1))
json.dump(metrics, open("audio/metrics.json", "w"), indent=1)
json.dump(dict(cues=SFX_CUES, bpm=BPM, progression=PROG), open("audio/sfx_cues.json", "w"), indent=1)
print(json.dumps(metrics, indent=1))
