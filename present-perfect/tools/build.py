#!/usr/bin/env python3
"""
Build the one-hour lesson into dist/lesson/ :
    index.html          the player (fonts, logo, timeline, IPA dictionary, activities and all code inline; ~1 MB)
    artifact.html       the same page as a fragment, for hosts that add their own document skeleton
    audio/n01.mp3 ...   narration parts (mono)        audio/m01.mp3 ...  music + effects parts (stereo)
The audio is cut into ~9-minute parts at silent gaps between beats (an hour in one file would be ~30 MB and slow to seek).
Run order:  lesson_hour.py -> tts_generate.py -> music.py -> (dev/dumpwords.mjs + ipa_build.py when text changes) -> build.py
Needs: ffmpeg.
"""
import base64, json, subprocess, shutil, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
B, SRC, DIST = ROOT / "build", ROOT / "src", ROOT / "dist" / "lesson"
SOURCES = ["util.js", "text.js", "chars.js", "scenes.js", "gfx.js", "engine.js", "lesson1.js", "lesson2.js", "lesson3.js", "@activities", "lesson4.js", "boot.js", "player.js"]
TARGET = 540.0          # seconds per part (cut at the first silent gap after this)

def b64(p): return base64.b64encode(Path(p).read_bytes()).decode()
def run(*a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def cut_points(tl):
    beats = tl["beats"]; cuts = [0.0]
    for prev, cur in zip(beats, beats[1:]):
        mid = (prev["t1"] + cur["t0"]) / 2
        if mid - cuts[-1] >= TARGET and tl["duration"] - mid > 120: cuts.append(mid)
    cuts.append(tl["duration"])
    return cuts

def main():
    tl = json.loads((B / "timeline.json").read_text())
    if DIST.exists(): shutil.rmtree(DIST)
    (DIST / "audio").mkdir(parents=True)
    cuts = cut_points(tl); parts = []
    for i in range(len(cuts) - 1):
        t0, t1 = cuts[i], cuts[i + 1]; n = f"audio/n{i+1:02d}.mp3"; m = f"audio/m{i+1:02d}.mp3"
        fade = f"afade=t=in:d=0.03,afade=t=out:st={t1 - t0 - 0.03:.3f}:d=0.03"
        run("ffmpeg", "-y", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}", "-i", str(B / "narration.wav"), "-af", fade, "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "56k", str(DIST / n))
        run("ffmpeg", "-y", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}", "-i", str(B / "bed.wav"), "-af", fade, "-ac", "2", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "48k", str(DIST / m))
        parts.append({"t0": round(t0, 3), "t1": round(t1, 3), "n": n, "m": m})
    logo = B / "logo_720.png"
    run("ffmpeg", "-y", "-i", str(ROOT / "assets/logo/fluent_english_logo_blue.png"), "-vf", "scale=720:-1", str(logo))
    css = (SRC / "fonts.css").read_text()
    css = re.sub(r"__FONT_([^_]+)__", lambda m: "data:font/woff2;base64," + b64(ROOT / "assets/fonts" / m.group(1)), css)
    data = ("window.TIMELINE=" + (B / "timeline.json").read_text() + ";\n" + (B / "ipa.js").read_text() + "\n" +
            "window.ASSETS={logoBlue:'data:image/png;base64," + b64(logo) + "',parts:" + json.dumps(parts) + "};")
    def src(s): return (B / "activities.js").read_text() if s == "@activities" else (SRC / s).read_text()
    code = "\n".join(f"/* ===== {s} ===== */\n" + src(s) for s in SOURCES)
    html = (SRC / "player.html").read_text().replace("/*FONTS*/", css).replace("/*DATA*/", data.replace("</script", "<\\/script")).replace("/*SOURCES*/", code.replace("</script", "<\\/script"))
    (DIST / "index.html").write_text(html)
    frag = re.sub(r"<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset=\"utf-8\">\s*<meta name=\"viewport\"[^>]*>\s*", "", html, flags=re.I)
    frag = frag.replace("</style>\n</head>\n<body>\n", "</style>\n").replace("\n</body>\n</html>", "")
    assert "<html" not in frag[:2000].lower() and "</body>" not in frag[-200:]
    (DIST / "artifact.html").write_text(frag)
    sizes = [(DIST / p["n"]).stat().st_size + (DIST / p["m"]).stat().st_size for p in parts]
    print(f"{len(parts)} audio parts, cuts at " + ", ".join(f"{c/60:.1f}" for c in cuts) + " min")
    print(f"index.html {len(html)/1e6:.2f} MB; audio {sum(sizes)/1e6:.1f} MB total (largest part pair {max(sizes)/1e6:.1f} MB); lesson length {tl['duration']/60:.1f} min")

if __name__ == "__main__":
    main()
    if "--release" in sys.argv:        # dist/ is git-ignored; release/lesson is the copy that is committed
        rel = ROOT / "release" / "lesson"
        if rel.exists(): shutil.rmtree(rel)
        shutil.copytree(DIST, rel); print("copied to release/lesson")
