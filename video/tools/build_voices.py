#!/usr/bin/env python3
"""Synthesize the voice lines locally with Kokoro (open-source, offline, no account/API).
Writes assets/voice/*.wav and assets/cues.json (start times, word timings, mouth envelope).

Models (not committed, ~350 MB): kokoro-v1.0.onnx + voices-v1.0.bin from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
Usage: python3 tools/build_voices.py /path/to/model_dir
"""
import json, sys, os, re
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

MODELS = sys.argv[1] if len(sys.argv) > 1 else "."
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "assets", "voice")
SR = 24000
k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))

ES, EN = "ef_dora", "am_michael"   # Spanish narrator (female) / American-English male (the on-screen character)

def synth(text, voice, lang, speed):
    s, sr = k.create(text, voice=voice, speed=speed, lang=lang)
    assert sr == SR
    return trim(np.asarray(s, dtype=np.float32))

def trim(x, thr=0.012, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    a, b = max(0, idx[0] - int(pad * SR)), min(len(x), idx[-1] + int(pad * SR))
    y = x[a:b].copy()
    f = int(0.02 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

def silence(sec): return np.zeros(int(sec * SR), dtype=np.float32)

def word_ends(words, voice, lang, speed, total, audio):
    """End time of each word: phoneme-count proportions, each boundary snapped to the nearest energy dip (+-80 ms)."""
    w = []
    for word in words:
        core = re.sub(r"[^\wáéíóúüñÁÉÍÓÚÜÑ']", "", word)
        n = len(k.tokenizer.phonemize(core, lang)) if core else 1
        n += 2.5 if re.search(r"[,.?!…]$", word) and word is not words[-1] else 0   # breath/pause after punctuation
        w.append(max(n, 1))
    cum = np.cumsum(w) / sum(w) * total
    hop = int(0.01 * SR); env = np.array([np.sqrt(np.mean(audio[i:i + hop * 2] ** 2)) for i in range(0, len(audio), hop)])
    env = np.convolve(env, np.ones(3) / 3, "same")
    out = []
    for c in cum[:-1]:
        i0, i1 = int(max(0, c - 0.08) * 100), int(min(total, c + 0.08) * 100) + 1
        out.append((i0 + int(np.argmin(env[i0:i1]))) / 100 if i1 > i0 else c)
    out.append(total)
    for i in range(1, len(out)): out[i] = max(out[i], out[i - 1] + 0.06)
    return out

def envelope(x, fps=30):
    n = int(len(x) / SR * fps) + 1; w = SR // fps
    e = np.array([np.sqrt(np.mean(x[i*w:(i+1)*w] ** 2)) if i*w < len(x) else 0 for i in range(n)])
    e = e / (e.max() + 1e-9)
    return [round(float(v), 3) for v in e]

# id, start (s on the video timeline), kind, parts[(text, voice, lang, speed)], caption chunks (list of word lists)
LINES = [
    ("es_intro",   0.35, "es", [("¿No entendiste lo que te dijeron? Prueba esta frase.", ES, "es", 0.97)],
        [["¿No", "entendiste", "lo", "que", "te", "dijeron?"], ["Prueba", "esta", "frase."]]),
    ("en_repeat",  4.45, "en", [("Could you say that again, please?", EN, "en-us", 0.93)],
        [["Could", "you", "say", "that", "again,", "please?"]]),
    ("es_repeat",  7.10, "es", [("¿Podrías repetirlo, por favor?", ES, "es", 0.97)],
        [["¿Podrías", "repetirlo,", "por", "favor?"]]),
    ("es_slowly", 11.30, "es", [("Y si necesitas que hablen más despacio…", ES, "es", 0.97)],
        [["Y", "si", "necesitas", "que", "hablen", "más", "despacio…"]]),
    ("en_slowly", 14.35, "en", [("A little more slowly, please.", EN, "en-us", 0.93)],
        [["A", "little", "more", "slowly,", "please."]]),
    ("es_yourturn", 18.35, "es", [("Ahora dilo tú.", ES, "es", 0.97)],
        [["Ahora", "dilo", "tú."]]),
    ("es_cta",    24.55, "es", [("Practica inglés con", ES, "es", 0.97), ("Fluent English.", ES, "en-us", 0.95),
                                ("Escríbenos inglés por mensaje.", ES, "es", 0.97)],
        [["Practica", "inglés", "con", "Fluent", "English."], ["Escríbenos", "INGLÉS", "por", "mensaje."]]),
]

cues = {"fps": 30, "duration": 30.0, "voices": {"es": ES, "en": EN, "engine": "Kokoro v1.0 (kokoro-onnx), local/offline"}, "lines": []}
for lid, start, kind, parts, chunks in LINES:
    segs, offs, t = [], [], 0.0
    for j, (txt, v, l, sp) in enumerate(parts):
        a = synth(txt, v, l, sp); offs.append(t); segs.append(a); t += len(a) / SR + (0.10 if j < len(parts) - 1 else 0)
    audio = np.concatenate([np.concatenate([s, silence(0.10)]) if i < len(segs) - 1 else s for i, s in enumerate(segs)])
    dur = len(audio) / SR
    sf.write(os.path.join(OUT, lid + ".wav"), audio, SR, subtype="PCM_16")
    # word timings
    words = [w for c in chunks for w in c]
    if len(parts) == 1:
        text, v, l, sp = parts[0]
        ends = word_ends(text.split(), v, l, sp, dur, audio)
    else:  # multi-part (CTA): per-part word timings
        ends = []
        for (text, v, l, sp), off, s in zip(parts, offs, segs):
            ends += [off + e for e in word_ends(text.split(), v, l, sp, len(s) / SR, s)]
    assert len(ends) == len(words), (lid, len(ends), len(words))
    wl, prev = [], 0.0
    for w, e in zip(words, ends):
        wl.append({"w": w, "t0": round(start + prev, 3), "t1": round(start + e, 3)}); prev = e
    # chunk boundaries
    ci, out_chunks = 0, []
    for c in chunks:
        ws = wl[ci:ci + len(c)]; ci += len(c)
        out_chunks.append({"t0": ws[0]["t0"], "t1": ws[-1]["t1"], "words": ws})
    cues["lines"].append({"id": lid, "kind": kind, "file": f"assets/voice/{lid}.wav", "start": start,
                          "dur": round(dur, 3), "end": round(start + dur, 3), "chunks": out_chunks,
                          "env": envelope(audio) if kind == "en" else None})
    print(f"{lid:12s} {start:6.2f} -> {start+dur:6.2f}  ({dur:.2f}s)")
json.dump(cues, open(os.path.join(HERE, "assets", "cues.json"), "w"), ensure_ascii=False, separators=(",", ":"))
