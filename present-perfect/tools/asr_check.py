#!/usr/bin/env python3
"""
Pronunciation round-trip check (objective, NOT a substitute for listening).
Transcribes every per-line audio file with Whisper (sherpa-onnx, small.en) and compares it with the script text.
Flags: word errors, and specifically missed contractions / auxiliaries / participles that a grammar lesson needs to be audible.
Usage: python tools/asr_check.py <path to sherpa-onnx-whisper-small.en dir>      -> build/asr_report.md
"""
import json, re, sys
from pathlib import Path
import numpy as np, soundfile as sf
import sherpa_onnx
from scipy.signal import resample_poly

ROOT = Path(__file__).resolve().parents[1]
M = Path(sys.argv[1])
asr = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=str(M / "small.en-encoder.int8.onnx"), decoder=str(M / "small.en-decoder.int8.onnx"), tokens=str(M / "small.en-tokens.txt"), language="en", task="transcribe", num_threads=4)

NUM = {"2020": "twenty twenty", "2019": "twenty nineteen", "2021": "twenty twenty-one", "2022": "twenty twenty-two"}
def norm(s):
    s = s.lower().replace("’", "'").replace("-", " ")
    for k, v in NUM.items(): s = s.replace(k, v)
    s = re.sub(r"\b(twenty) (nineteen)\b", r"\1 nineteen", s)
    s = re.sub(r"[^a-z' ]", " ", s)
    return s.split()
def wer(ref, hyp):
    r, h = norm(ref), norm(hyp); d = np.zeros((len(r) + 1, len(h) + 1), int); d[:, 0] = range(len(r) + 1); d[0, :] = range(len(h) + 1)
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1): d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
    return d[-1, -1], len(r)

script = json.loads((ROOT / "src" / "script.json").read_text())
tl = json.loads((ROOT / "build" / "timeline.json").read_text())
KEY = re.compile(r"\b(I've|you've|she's|he's|haven't|hasn't|have|has|been|gone|eaten|seen|done|ate|saw|went|worked|finished|visited|lived|known)\b", re.I)
rows, errs, total = [], 0, 0
for b in tl["beats"]:
    for l in b["lines"]:
        if "file" not in l: continue
        x, sr = sf.read(ROOT / "build/audio/lines" / l["file"])
        if sr != 16000: x = resample_poly(x, 16000, sr)
        s = asr.create_stream(); s.accept_waveform(16000, x.astype(np.float32)); asr.decode_stream(s); hyp = s.result.text.strip()
        e, n = wer(l["text"], hyp); errs += e; total += n
        miss = [m.group(0) for m in KEY.finditer(l["text"]) if m.group(0).lower().replace("’", "'") not in " ".join(norm(hyp))]
        rows.append((l["id"], l["who"], e, n, l["text"], hyp, miss))
out = ["# ASR round-trip report", "", "Whisper small.en transcription of each generated line vs. the script. This checks intelligibility only; it cannot judge naturalness, stress or warmth.", "",
       f"Overall word error rate: **{errs}/{total} = {100*errs/total:.1f}%**", "", "| line | who | errors | script text | heard | key words not heard |", "|---|---|---|---|---|---|"]
for r in rows: out.append(f"| {r[0]} | {r[1]} | {r[2]}/{r[3]} | {r[4]} | {r[5]} | {', '.join(r[6])} |")
(ROOT / "build" / "asr_report.md").write_text("\n".join(out) + "\n")
bad = [r for r in rows if r[2] or r[6]]
print(f"WER {errs}/{total} = {100*errs/total:.1f}%   lines with any difference: {len(bad)}/{len(rows)}")
for r in bad: print(f"  {r[0]:5} ({r[1]}) {r[2]} err | heard: {r[5]!r} | missed: {r[6]}")
