#!/usr/bin/env python3
"""Generate natural narration with Kokoro (open-source neural TTS, Apache-2.0, runs locally: free, no credits).

  python3 tools/make-voices.py narr   -> audio/n/*.mp3            one file per spoken line
  python3 tools/make-voices.py dict [shard nshards] -> audio/d/*.mp3            word + meaning + example, packed ("sprites")
  then:  node tools/build-manifest.mjs  -> audio/manifest.js

Needs: pip install kokoro-onnx soundfile numpy; the model files kokoro-v1.0.onnx and voices-v1.0.bin
(github.com/thewh1teagle/kokoro-onnx, release model-files-v1.0); ffmpeg.  Set KOKORO_DIR to where the model files are.
"""
import json, os, subprocess, sys, hashlib
import numpy as np
from kokoro_onnx import Kokoro

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
kdir = os.environ.get("KOKORO_DIR", "/tmp/kk")
k = Kokoro(os.path.join(kdir, "kokoro.onnx"), os.path.join(kdir, "voices.bin"))
VOICE = {"maya": "af_heart", "theo": "am_michael", "alex": "af_bella", "jordan": "am_eric"}
BASE = 0.97
MOOD = {"grin": 1.05, "laugh": 1.06, "proud": 1.0, "surprised": 1.05, "warm": 0.96, "smile": 1.0, "curious": 0.98,
        "thinking": 0.93, "worried": 0.93, "shy": 0.91, "sad": 0.89, "flat": 0.98, "neutral": 1.0, "": 1.0}
SR = 24000


def trim(a, pad=0.06):
    thr = 0.012
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    s = max(0, idx[0] - int(pad * SR)); e = min(len(a), idx[-1] + int(pad * SR))
    return a[s:e]


def say(text, role, mood="", speed=None):
    a, sr = k.create(text, voice=VOICE.get(role, "af_heart"), speed=speed or BASE * MOOD.get(mood, 1.0), lang="en-us")
    assert sr == SR
    return trim(a.astype(np.float32))


def mp3(a, path, kbps=40):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    rms = float(np.sqrt(np.mean(a ** 2))) or 1.0
    a = np.clip(a * min(0.11 / rms, 0.95 / (float(np.max(np.abs(a))) or 1.0)), -1, 1)  # even loudness, no clipping
    pcm = (np.clip(a, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-ar", str(SR), "-c:a", "libmp3lame", "-b:a", f"{kbps}k", path], input=pcm, check=True)


data = json.load(open(os.path.join(here, "speech-lines.json")))
mode = sys.argv[1] if len(sys.argv) > 1 else "narr"
index = []
if mode == "narr":
    for i, l in enumerate(data["lines"]):
        name = hashlib.md5((l["role"] + "|" + l["text"]).encode()).hexdigest()[:10]
        f = f"audio/n/{l['role']}-{name}.mp3"
        a = say(l["text"], l["role"], l.get("mood", ""))
        mp3(a, os.path.join(root, f))
        index.append({"role": l["role"], "text": l["text"], "f": f, "s": 0, "d": round(len(a) / SR, 3)})
        if i % 20 == 0:
            print(i, len(data["lines"]), flush=True)
    json.dump(index, open(os.path.join(root, "audio", "index-narr.json"), "w"), indent=0)
else:
    entries = sorted(data["dict"], key=lambda e: e["k"])
    GAP = np.zeros(int(0.4 * SR), dtype=np.float32)
    PACK = 45
    shard = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    nshards = int(sys.argv[3]) if len(sys.argv) > 3 else 1
    for pi in range(0, len(entries), PACK):
        if (pi // PACK) % nshards != shard:
            continue
        chunk = entries[pi:pi + PACK]
        f = f"audio/d/d{pi // PACK:02d}.mp3"
        buf = []; t = 0.0
        for e in chunk:
            for kind in ("word", "def", "ex"):
                text = e[kind]
                a = say(text, "maya", speed=0.92 if kind == "word" else BASE)
                index.append({"role": "maya", "text": text, "f": f, "s": round(t, 3), "d": round(len(a) / SR, 3)})
                buf += [a, GAP]; t += (len(a) + len(GAP)) / SR
        mp3(np.concatenate(buf), os.path.join(root, f), kbps=32)
        print("pack", pi // PACK, len(chunk), round(t), "s", flush=True)
    json.dump(index, open(os.path.join(root, "audio", f"index-dict-{shard}.json"), "w"), indent=0)
