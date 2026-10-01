#!/usr/bin/env python3
"""
Original background music + subtle sound effects, generated from scratch with numpy (no samples, no licensing issues).
  * Warm pad + soft kalimba-style arpeggio + sine bass on a looping Cmaj7 - Am7 - Fmaj7 - G6 progression, 84 BPM.
  * The arpeggio drops out during "thinking time" holds; a soft clock tick marks the seconds.
  * Sidechain-style DUCKING: music level follows the narration track (drops ~11 dB while anyone speaks).
  * SFX: bubble pop for dialogue, soft whoosh at chapter changes, bell chime at answer reveals and at the end.
Reads build/timeline.json + build/narration.wav, writes build/bed.wav (stereo 44.1 kHz).
"""
import json, re
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

ROOT = Path(__file__).resolve().parents[1]
SR = 44100
BPM = 84
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)


def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)


CHORDS = [  # (bass midi, chord tones)
    (48, [60, 64, 67, 71]),   # Cmaj7
    (45, [60, 64, 67, 69]),   # Am7
    (41, [57, 60, 64, 69]),   # Fmaj7 (voiced low)
    (43, [59, 62, 64, 67]),   # G6
]
# an hour of one four-chord loop would wear thin: three progressions alternate every 8 bars
PROGS = [
    CHORDS,
    [(45, [60, 64, 67, 69]), (41, [57, 60, 64, 69]), (48, [60, 64, 67, 71]), (43, [59, 62, 64, 67])],      # Am7 Fmaj7 Cmaj7 G6
    [(50, [57, 60, 65, 69]), (43, [59, 62, 65, 67]), (48, [60, 64, 67, 71]), (45, [60, 64, 67, 69])],      # Dm7 G7 Cmaj7 Am7
]
PATS = [[0, 2, 1, 3, 2, 1, 3, 2], [0, 1, 2, 3, 2, 1, 2, 3], [3, 1, 2, 0, 2, 1, 3, 1]]


def env_ar(n, a, r, sr=SR):
    e = np.ones(n)
    na, nr = int(a * sr), int(r * sr)
    if na: e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def add(buf, start, sig, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i >= len(buf) or i < 0: return
    n = min(len(sig), len(buf) - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += sig[:n] * gain * l * 1.414 / 1.0 * 0.707
    buf[i:i + n, 1] += sig[:n] * gain * r * 1.414 / 1.0 * 0.707


def pad_note(f, dur):
    t = np.arange(int(dur * SR)) / SR
    s = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 1.003 * t + 0.7) + 0.22 * np.sin(2 * np.pi * 2 * f * t)
         + 0.12 * np.sin(2 * np.pi * 3 * f * 0.999 * t)) / 1.8
    return s * env_ar(len(t), 0.9, 1.1) * (1 + 0.04 * np.sin(2 * np.pi * 0.23 * t))


def kalimba(f, dur=0.9):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 5.5) + 0.35 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 14) + 0.12 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 26)
    s[:int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return s


def bass_note(f, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return s * env_ar(len(t), 0.05, 0.5) * 0.9


# ----------------------------------------------------------------- sfx
def sfx_pop():
    t = np.arange(int(0.16 * SR)) / SR
    f = 520 + 380 * np.exp(-t * 38)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)
    return s * 0.9


def sfx_bloop():
    t = np.arange(int(0.22 * SR)) / SR
    f = 330 + 260 * (1 - np.exp(-t * 18))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * 0.8


def sfx_whoosh(dur=0.55):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    sos = butter(2, [400, 3200], "band", fs=SR, output="sos")
    x = sosfilt(sos, x)
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t) ** 2.2
    return x * env * 0.5


def sfx_tick(k):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    f = 1150 if k % 2 == 0 else 880
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * 0.55


def sfx_chime():
    out = np.zeros(int(1.8 * SR))
    for dly, f in [(0.0, 784.0), (0.14, 1175.0), (0.30, 1568.0)]:
        t = np.arange(int(1.4 * SR)) / SR
        s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6)) * np.exp(-t * 3.2)
        i = int(dly * SR); out[i:i + len(s)] += s[: len(out) - i] * 0.4
    return out


def main():
    tl = json.loads((ROOT / "build" / "timeline.json").read_text())
    dur = tl["duration"] + 2.0
    n = int(dur * SR)
    music = np.zeros((n, 2), dtype=np.float32)
    sfx = np.zeros((n, 2), dtype=np.float32)

    # ---- hold windows (thinking time): arpeggio off, ticks on
    holds, thoughts = [], []
    lines = [l for b in tl["beats"] for l in b["lines"]]
    for l in lines:
        if l["kind"] == "hold": holds.append((l["t0"], l["t1"]))
    # ---- music: bar by bar
    nb = int(dur / BAR) + 2
    for b in range(nb):
        t0 = b * BAR
        sec = (b // 8) % 3
        root, tones = PROGS[sec][b % 4]
        for k, m in enumerate(tones):
            add(music, t0, pad_note(mtof(m), BAR + 1.0), pan=(-0.5 + k * 0.33), gain=0.065)
        add(music, t0, bass_note(mtof(root), BAR * 0.92), pan=0.0, gain=0.11)
        # arpeggio, eighth notes
        pat = PATS[(b // 16) % 3]
        for e in range(8):
            ts = t0 + e * BEAT / 2
            if any(h0 - 0.2 <= ts <= h1 + 0.2 for h0, h1 in holds): continue
            if e % 2 == 1 and (b % 2 == 0) and e in (3, 7): continue            # a little breathing room
            if (b // 8) % 5 == 4: continue                                       # every fifth 8-bar section: pad only
            m = tones[pat[e] % 4] + 12
            vel = 0.5 + 0.35 * ((e % 4) == 0) + rng.random() * 0.1
            add(music, ts, kalimba(mtof(m)), pan=(-0.35 if e % 2 else 0.35), gain=0.075 * vel)
    # ---- sfx
    chap_seen = set()
    for b in tl["beats"]:
        if b["ch"] not in chap_seen:
            chap_seen.add(b["ch"]); add(sfx, max(0, b["t0"] - 0.45), sfx_whoosh(), pan=0.0, gain=0.10)
        for l in b["lines"]:
            if l["kind"] == "dlg": add(sfx, l["t0"] - 0.06, sfx_pop(), pan=-0.3 if l["who"] in ("D",) else 0.3, gain=0.10)
            if l["kind"] == "thought": add(sfx, l["t0"] - 0.02, sfx_bloop(), gain=0.09)
            if l["kind"] == "hold":
                k = 0; x = l["t0"] + 0.5
                if l["t1"] - l["t0"] > 20: x = l["t1"] - 10.5          # pair work: silence while students talk, ticks only for the last 10 s
                while x < l["t1"] - 0.2:
                    add(sfx, x, sfx_tick(k), gain=0.06); x += 1.0; k += 1
            if re.fullmatch(r".+_\d+a", l["id"]) and l["kind"] != "ex": add(sfx, l["t0"] - 0.05, sfx_chime(), gain=0.08)
        if b.get("check"):
            ans = b["lines"][-1]; add(sfx, ans["t0"] - 0.05, sfx_chime(), gain=0.12)
        if b["id"] == "speak":
            add(sfx, b["lines"][-1]["t0"] - 0.05, sfx_chime(), gain=0.14)
    # ---- ducking from narration energy
    nar, nsr = sf.read(ROOT / "build" / "narration.wav", dtype="float32")
    nar = resample_poly(nar, SR, nsr) if nsr != SR else nar
    hop = int(0.01 * SR)
    m = len(nar) // hop
    rms = np.sqrt((nar[: m * hop].reshape(m, hop) ** 2).mean(axis=1) + 1e-12)
    act = (rms > 10 ** (-48 / 20)).astype(float)
    # asymmetric smoothing: fast attack (duck quickly), slow release
    g = np.zeros(m); cur = 0.0
    a_att, a_rel = 1 - np.exp(-0.01 / 0.10), 1 - np.exp(-0.01 / 0.70)
    for i in range(m):
        cur += (act[i] - cur) * (a_att if act[i] > cur else a_rel)
        g[i] = cur
    gain = 1.0 - 0.72 * g                    # ~ -11 dB under speech
    gain_full = np.interp(np.arange(n) / SR, np.arange(m) * 0.01, gain).astype(np.float32)
    # long holds (pair work, class sharing): the music sits far back so students can hear each other
    quiet = np.ones(n, dtype=np.float32)
    for h0, h1 in holds:
        if h1 - h0 > 20:
            i0, i1 = max(0, int((h0 - 1) * SR)), min(n, int((h1 + 1) * SR)); tl = np.arange(i0, i1) / SR
            quiet[i0:i1] *= (1 - 0.7 * np.clip(np.minimum((tl - h0) / 1.5, (h1 - tl) / 1.5), 0, 1)).astype(np.float32)
    gain_full = gain_full * quiet
    music *= gain_full[:, None].astype(np.float32)
    sfx *= (1.0 - 0.35 * np.interp(np.arange(n) / SR, np.arange(m) * 0.01, g))[:, None].astype(np.float32)
    # music tone: gentle lowpass so it never fights consonants
    sos = butter(2, 5200, "low", fs=SR, output="sos")
    music = sosfilt(sos, music, axis=0)
    mix = music + sfx
    # fade in/out
    f = int(1.5 * SR); mix[:f] *= np.linspace(0, 1, f)[:, None]; mix[-f:] *= np.linspace(1, 0, f)[:, None]
    pk = np.abs(mix).max(); mix *= min(1.0, 0.7 / pk)
    sf.write(ROOT / "build" / "bed.wav", mix.astype(np.float32), SR, subtype="PCM_16")
    rms_db = 20 * np.log10(np.sqrt((mix ** 2).mean()) + 1e-9)
    print(f"bed.wav {dur:.1f}s  peak {20*np.log10(np.abs(mix).max()):.1f} dBFS  overall rms {rms_db:.1f} dBFS  (speech active {act.mean()*100:.0f}% of time)")
    # report: music level while speaking vs. not
    sp = np.interp(np.arange(n) / SR, np.arange(m) * 0.01, act) > 0.5
    r = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
    print(f"music level under speech {r(music[sp]):.1f} dBFS, in gaps {r(music[~sp]):.1f} dBFS -> ducking {r(music[~sp]) - r(music[sp]):.1f} dB; narration rms {r(nar[(np.abs(nar)>1e-4)]):.1f} dBFS")


if __name__ == "__main__":
    main()
