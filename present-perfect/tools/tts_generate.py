#!/usr/bin/env python3
"""
Generate the Present Perfect narration from src/script.json and build the master timeline.

Engine: Kokoro v1.0 (82M, Apache-2.0) via kokoro-onnx, American English voices.
Phonemizer: espeak-ng (the copy bundled in piper-tts; espeakng-loader's data path is broken in
this container).  Per-line pronunciation overrides use  [text](/phonemes/)  in the "say" field.

Outputs (build/):
  audio/lines/<id>.wav     processed per-line speech (24 kHz mono)
  narration.wav            master track, speech placed at timeline positions
  timeline.json            beats / lines / absolute times / mouth envelopes / phrase timing

Usage:  python tools/tts_generate.py [--model fp32|int8] [--only line_id ...] [--force]
Heavy parts (model inference) run one line at a time on CPU; the whole script takes ~1-2 minutes.
"""
import argparse, hashlib, json, os, re, sys, wave
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, sosfiltfilt, resample_poly

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
LINES = BUILD / "audio" / "lines"
MODELS = Path(os.environ.get("KOKORO_DIR", ROOT / "build" / "models"))
SR = 24000
ENV_HZ = 40
CACHE_VERSION = "v3"

# gaps (seconds) -------------------------------------------------------------
GAP_AFTER = {"say": 0.30, "ex": 0.55, "dlg": 0.32}
EX_LEAD = 0.18          # extra air before an example sentence
BEAT_PRE = 0.45
BEAT_POST = 0.40

SPLIT_RE = re.compile(r"\[([^\]]+)\]\(/([^/]+)/\)")


# ------------------------------------------------------------ ElevenLabs engine
ELEVEN_URL = "https://api.elevenlabs.io/v1"


def eleven_key():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set (add it as an environment variable; never paste it into chat).")
    return key


def eleven_request(path, body=None, key=None, accept="application/json"):
    import urllib.request, urllib.error
    req = urllib.request.Request(ELEVEN_URL + path, data=None if body is None else json.dumps(body).encode(),
                                 headers={"xi-api-key": key or eleven_key(), "Content-Type": "application/json", "Accept": accept})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs HTTP {e.code}: {e.read()[:300]!r}")


def strip_markup(text):
    """[I've](/ˈaɪv/) -> I've   (phoneme overrides are Kokoro-only)"""
    return SPLIT_RE.sub(lambda m: m.group(1), text)


def eleven_pcm(text, voice_id, model_id, settings, prev=None, nxt=None):
    body = {"text": text, "model_id": model_id, "voice_settings": settings, "language_code": "en"}
    if prev: body["previous_text"] = prev
    if nxt: body["next_text"] = nxt
    raw = eleven_request(f"/text-to-speech/{voice_id}?output_format=pcm_24000", body, accept="audio/pcm")
    return np.frombuffer(raw, dtype="<i2").astype(np.float64) / 32768.0


def list_voices():
    data = json.loads(eleven_request("/voices"))
    for v in data["voices"]:
        lab = v.get("labels", {})
        print(f"{v['voice_id']}  {v['name']:<22} {v.get('category',''):<10} {lab.get('accent','')}/{lab.get('gender','')}/{lab.get('use_case','')}")


def get_kokoro(model):
    from piper.phonemize_espeak import EspeakPhonemizer
    from kokoro_onnx import Kokoro
    ph = EspeakPhonemizer()
    k = Kokoro(str(MODELS / ("kokoro-v1.0.onnx" if model == "fp32" else "kokoro-int8.onnx")),
               str(MODELS / "voices-v1.0.bin"))
    vocab = k.tokenizer.vocab

    def phon(text, lang="en-us", norm=True):
        out, pos = [], 0
        for m in SPLIT_RE.finditer(text):
            if m.start() > pos:
                out.append(_esp(ph, text[pos:m.start()], vocab))
            out.append("".join(c for c in m.group(2) if c in vocab))
            pos = m.end()
        if pos < len(text):
            out.append(_esp(ph, text[pos:], vocab))
        return " ".join(x for x in out if x).strip()
    k.tokenizer.phonemize = phon
    return k


def _esp(ph, text, vocab):
    text = text.strip()
    if not text:
        return ""
    sents = ph.phonemize("en-us", text)
    s = " ".join("".join(x) for x in sents)
    return "".join(c for c in s if c in vocab).strip()


# ---------------------------------------------------------------- processing
def trim(x, thr_db=-45, keep=0.05):
    a = np.abs(x)
    ref = a.max()
    idx = np.where(a > ref * 10 ** (thr_db / 20))[0]
    if len(idx) == 0:
        return x
    s = max(0, idx[0] - int(keep * SR))
    e = min(len(x), idx[-1] + int(keep * 1.6 * SR))
    return x[s:e]


def deess(x, lo=5200, hi=9500, amount=0.55):
    """Light dynamic de-esser: attenuate the sibilant band when it dominates."""
    bp = butter(4, [lo, hi], "band", fs=SR, output="sos")
    s = sosfiltfilt(bp, x)
    env = np.sqrt(sosfilt(butter(2, 60, "low", fs=SR, output="sos"), s ** 2) + 1e-12)
    broad = np.sqrt(sosfilt(butter(2, 60, "low", fs=SR, output="sos"), x ** 2) + 1e-12)
    ratio = env / (broad + 1e-6)
    thr = 0.42
    g = np.where(ratio > thr, (thr / np.maximum(ratio, 1e-6)) ** amount, 1.0)
    g = sosfiltfilt(butter(2, 120, "low", fs=SR, output="sos"), g)
    return x - s + s * np.clip(g, 0.3, 1.0)


def level(x, target_db=-21.0):
    frame = int(0.02 * SR)
    n = len(x) // frame
    rms = np.sqrt((x[: n * frame].reshape(n, frame) ** 2).mean(axis=1) + 1e-12)
    act = rms[rms > rms.max() * 0.1]
    cur = 20 * np.log10(np.sqrt((act ** 2).mean()) + 1e-9)
    y = x * 10 ** ((target_db - cur) / 20)
    pk = np.abs(y).max()
    if pk > 0.89:                      # soft limiter by tanh knee
        y = np.tanh(y / 0.89 * 1.2) * 0.89 / np.tanh(1.2)
    return y


def fade(x, ms=12):
    n = int(ms / 1000 * SR)
    x = x.copy()
    x[:n] *= np.linspace(0, 1, n)
    x[-n:] *= np.linspace(1, 0, n)
    return x


def mouth_envelope(x):
    """40 Hz arrays: open (0..99) and round (0..99) from RMS and spectral centroid."""
    hop = SR // ENV_HZ
    n = len(x) // hop + 1
    op = np.zeros(n)
    rd = np.zeros(n)
    win = np.hanning(hop * 2)
    peak = np.sqrt((x ** 2).mean()) * 2.4 + 1e-9
    for i in range(n):
        seg = x[max(0, i * hop - hop // 2): i * hop + hop * 3 // 2]
        if len(seg) < 64:
            continue
        w = np.hanning(len(seg))
        sp = np.abs(np.fft.rfft(seg * w))
        fr = np.fft.rfftfreq(len(seg), 1 / SR)
        e = np.sqrt((seg ** 2).mean())
        cen = (sp * fr).sum() / (sp.sum() + 1e-9)
        op[i] = min(1.0, (e / peak) ** 0.8 * 1.15)
        # low centroid + voiced energy -> rounded 'oo/oh'; high centroid -> wide 'ee/s'
        rd[i] = np.clip((1700 - cen) / 1100, 0, 1) * op[i]
    k = np.array([0.25, 0.5, 0.25])
    op = np.convolve(op, k, "same")
    rd = np.convolve(rd, k, "same")
    return (op * 99).astype(int).tolist(), (rd * 99).astype(int).tolist()


def silent_gaps(x, min_ms=70, thr_db=-38):
    """Return list of (start, end) seconds of internal silences (candidate phrase boundaries)."""
    hop = int(0.01 * SR)
    n = len(x) // hop
    e = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    thr = e.max() * 10 ** (thr_db / 20) * 6
    sil = e < thr
    gaps, i = [], 0
    while i < n:
        if sil[i]:
            j = i
            while j < n and sil[j]:
                j += 1
            if (j - i) * 10 >= min_ms and i > 5 and j < n - 5:
                gaps.append((i * 0.01, j * 0.01))
            i = j
        else:
            i += 1
    return gaps


# ------------------------------------------------------------------ synthesis
def synth_line(k, script, line, force=False, engine="kokoro", ctx=None):
    v = script["voices"][line["who"]]
    speed = line.get("speed", v["speed"])
    text = line.get("say", line["text"])
    if engine == "eleven":
        ev = script["elevenlabs"]
        vid = ev["voices"][line["who"]]
        text = strip_markup(text)
        key = hashlib.sha1(f"{CACHE_VERSION}|eleven|{ev['model']}|{vid}|{text}".encode()).hexdigest()[:10]
    else:
        key = hashlib.sha1(f"{CACHE_VERSION}|{v['voice']}|{speed}|{text}".encode()).hexdigest()[:10]
    path = LINES / f"{line['id']}_{key}.wav"
    if path.exists() and not force:
        x, _ = sf.read(path)
        return x.astype(np.float64), path
    for old in LINES.glob(f"{line['id']}_*.wav"):
        old.unlink()
    if engine == "eleven":
        x = eleven_pcm(text, vid, ev["model"], ev["settings"][line["who"]], (ctx or {}).get("prev"), (ctx or {}).get("next"))
    else:
        x, sr = k.create(text, voice=v["voice"], speed=speed, lang="en-us")
        assert sr == SR
        x = np.asarray(x, dtype=np.float64)
    x = trim(x)
    if line["who"] == "N" or v["voice"].startswith("af_"):
        x = deess(x)
    x = level(x)
    x = fade(x)
    sf.write(path, x.astype(np.float32), SR, subtype="PCM_16")
    return x, path


def phrase_split(text):
    """Split caption text into short phrases (<= ~7 words) at punctuation."""
    parts = re.findall(r"[^.,:;!?]+[.,:;!?]*", text)
    out = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        words = p.split()
        while len(words) > 7:
            cut = 5 if len(words) <= 10 else 6
            out.append(" ".join(words[:cut]))
            words = words[cut:]
        out.append(" ".join(words))
    return out


def phrase_times(text, x, dur):
    """Distribute phrase boundaries over the audio, snapping to detected silences."""
    phrases = phrase_split(text)
    if len(phrases) <= 1:
        return [{"text": phrases[0] if phrases else text, "t0": 0.0, "t1": round(dur, 3)}]
    wts = []
    for p in phrases:
        w = len(re.findall(r"[A-Za-z']+", p)) + 0.5 * len(re.findall(r"[,:;]", p)) + 0.9 * len(re.findall(r"[.!?]", p))
        wts.append(max(w, 0.8))
    cum = np.cumsum(wts) / sum(wts) * dur
    gaps = silent_gaps(x)
    bounds = []
    for c in cum[:-1]:
        best = None
        for g0, g1 in gaps:
            mid = (g0 + g1) / 2
            if abs(mid - c) < 0.35 and (best is None or abs(mid - c) < abs(best - c)):
                best = mid
        bounds.append(best if best is not None else c)
    bounds = [0.0] + bounds + [dur]
    return [{"text": phrases[i], "t0": round(bounds[i], 3), "t1": round(bounds[i + 1], 3)} for i in range(len(phrases))]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="fp32")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--engine", default="kokoro", choices=["kokoro", "eleven"])
    ap.add_argument("--list-voices", action="store_true", help="ElevenLabs: print voices available to this key")
    ap.add_argument("--audition", nargs="*", metavar="VOICE_ID", help="ElevenLabs: render the audition sample for these voice ids")
    args = ap.parse_args()
    if args.list_voices:
        return list_voices()
    if args.audition is not None:
        sample = "I've finished the report. She hasn't called yet. Have you ever visited Canada?"
        out = BUILD / "audition"; out.mkdir(parents=True, exist_ok=True)
        model = json.loads((ROOT / "src" / "script.json").read_text())["elevenlabs"]["model"]
        for vid in args.audition:
            x = eleven_pcm(sample, vid, model, {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True})
            sf.write(out / f"eleven_{vid}.wav", x.astype(np.float32), SR)
            print("wrote", out / f"eleven_{vid}.wav", f"{len(x)/SR:.2f}s")
        return
    LINES.mkdir(parents=True, exist_ok=True)
    script = json.loads((ROOT / "src" / "script.json").read_text())
    k = get_kokoro(args.model) if args.engine == "kokoro" else None
    if args.engine == "eleven":
        eleven_key()
        if "elevenlabs" not in script:
            sys.exit("script.json needs an 'elevenlabs' block (model, voices per role, settings per role).")

    cursor = 0.0
    timeline = {"title": script["title"], "sr": SR, "env_hz": ENV_HZ, "chapters": script["chapters"], "beats": []}
    master_parts = []   # (start_sample, audio)
    n_checks = 0
    for beat in script["beats"]:
        b = {"id": beat["id"], "ch": beat["ch"], "check": beat.get("check"), "lines": []}
        cursor += beat.get("pre", BEAT_PRE)
        b["t0"] = round(cursor, 3)
        for ln in beat["lines"]:
            kind = ln.get("kind", "say")
            if kind == "ex":
                cursor += EX_LEAD
            rec = {"id": ln["id"], "kind": kind, "who": ln.get("who"), "text": ln.get("text", ""), "nocap": ln.get("nocap", False)}
            if kind in ("hold", "thought"):
                rec["t0"] = round(cursor, 3)
                cursor += ln["hold"]
                rec["t1"] = round(cursor, 3)
                rec["dur"] = ln["hold"]
            else:
                if args.only and ln["id"] not in args.only and not list(LINES.glob(f"{ln['id']}_*.wav")):
                    pass
                x, path = synth_line(k, script, ln, args.force or (args.only and ln["id"] in args.only), args.engine, {})
                dur = len(x) / SR
                rec["t0"] = round(cursor, 3)
                rec["t1"] = round(cursor + dur, 3)
                rec["dur"] = round(dur, 3)
                rec["file"] = path.name
                rec["open"], rec["round"] = mouth_envelope(x)
                if kind != "dlg":
                    rec["phrases"] = phrase_times(ln["text"], x, dur)
                master_parts.append((int(round(cursor * SR)), x))
                cursor += dur + GAP_AFTER.get(kind, 0.3)
            b["lines"].append(rec)
        b["t1"] = round(cursor, 3)
        cursor += BEAT_POST
        timeline["beats"].append(b)
        print(f"{b['id']:10} {b['t0']:7.2f} -> {b['t1']:7.2f}  ({b['t1'] - b['t0']:5.1f}s)")
    total = cursor + 1.2
    timeline["duration"] = round(total, 3)
    master = np.zeros(int(total * SR) + SR)
    for s, x in master_parts:
        master[s: s + len(x)] += x
    sf.write(BUILD / "narration.wav", master.astype(np.float32), SR, subtype="PCM_16")
    (BUILD / "timeline.json").write_text(json.dumps(timeline, separators=(",", ":")))
    words = sum(len(re.findall(r"[A-Za-z']+", l.get("text", ""))) for bb in script["beats"] for l in bb["lines"] if l.get("kind") not in ("hold", "thought"))
    spoken = sum(r["dur"] for bb in timeline["beats"] for r in bb["lines"] if "file" in r)
    print(f"\nTOTAL {total:.1f}s ({int(total // 60)}:{int(total % 60):02d})  speech {spoken:.1f}s  words {words}  ({words / spoken * 60:.0f} wpm of active speech)")


if __name__ == "__main__":
    main()
