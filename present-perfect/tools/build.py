#!/usr/bin/env python3
"""
Build dist/present-perfect.html — ONE self-contained file (fonts, logo, timeline, IPA dictionary, narration and music embedded).
Run order:  tts_generate.py  ->  music.py  ->  (dev/dumpwords.mjs + ipa_build.py when text changes)  ->  build.py
Needs: ffmpeg (mp3 encode, logo resize).  Nothing heavy: encodes ~6 minutes of audio once.
"""
import base64, json, subprocess, shutil, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
B, SRC, DIST = ROOT / "build", ROOT / "src", ROOT / "dist"
SOURCES = ["util.js", "text.js", "chars.js", "scenes.js", "gfx.js", "engine.js", "lesson1.js", "lesson2.js", "lesson3.js", "boot.js", "player.js"]

def b64(p): return base64.b64encode(Path(p).read_bytes()).decode()
def run(*a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main():
    DIST.mkdir(exist_ok=True); (DIST / "audio").mkdir(exist_ok=True); (DIST / "assets").mkdir(exist_ok=True)
    run("ffmpeg", "-y", "-i", str(B / "narration.wav"), "-ac", "1", "-ar", "24000", "-codec:a", "libmp3lame", "-b:a", "64k", str(DIST / "audio" / "narration.mp3"))
    run("ffmpeg", "-y", "-i", str(B / "bed.wav"), "-ac", "2", "-ar", "44100", "-codec:a", "libmp3lame", "-b:a", "96k", str(DIST / "audio" / "music_and_effects.mp3"))
    run("ffmpeg", "-y", "-i", str(ROOT / "assets/logo/fluent_english_logo_blue.png"), "-vf", "scale=720:-1", str(DIST / "assets" / "fluent_english_logo_blue_720.png"))
    css = (SRC / "fonts.css").read_text()
    import re
    css = re.sub(r"__FONT_([^_]+)__", lambda m: "data:font/woff2;base64," + b64(ROOT / "assets/fonts" / m.group(1)), css)
    data = ("window.TIMELINE=" + (B / "timeline.json").read_text() + ";\n" + (B / "ipa.js").read_text() + "\n" +
            "window.ASSETS={logoBlue:'data:image/png;base64," + b64(DIST / "assets/fluent_english_logo_blue_720.png") + "',"
            "narration:'data:audio/mpeg;base64," + b64(DIST / "audio/narration.mp3") + "',"
            "music:'data:audio/mpeg;base64," + b64(DIST / "audio/music_and_effects.mp3") + "'};")
    code = "\n".join(f"/* ===== {s} ===== */\n" + (SRC / s).read_text() for s in SOURCES)
    html = (SRC / "player.html").read_text().replace("/*FONTS*/", css).replace("/*DATA*/", data.replace("</script", "<\\/script")).replace("/*SOURCES*/", code.replace("</script", "<\\/script"))
    (DIST / "present-perfect.html").write_text(html)
    # ---- web variant: small page + separate audio files (for hosting / in-app preview, which truncates very large files)
    web = DIST / "web"; (web / "audio").mkdir(parents=True, exist_ok=True)
    shutil.copy(DIST / "audio/narration.mp3", web / "audio/narration.mp3"); shutil.copy(DIST / "audio/music_and_effects.mp3", web / "audio/music_and_effects.mp3")
    data_web = ("window.TIMELINE=" + (B / "timeline.json").read_text() + ";\n" + (B / "ipa.js").read_text() + "\n" +
                "window.ASSETS={logoBlue:'data:image/png;base64," + b64(DIST / "assets/fluent_english_logo_blue_720.png") + "',narration:'audio/narration.mp3',music:'audio/music_and_effects.mp3'};")
    html_web = (SRC / "player.html").read_text().replace("/*FONTS*/", css).replace("/*DATA*/", data_web.replace("</script", "<\\/script")).replace("/*SOURCES*/", code.replace("</script", "<\\/script"))
    (web / "index.html").write_text(html_web)
    # fragment form for hosts that add their own document skeleton (no doctype/html/head/body tags)
    frag = re.sub(r"<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset=\"utf-8\">\s*<meta name=\"viewport\"[^>]*>\s*", "", html_web, flags=re.I)
    frag = frag.replace("</style>\n</head>\n<body>\n", "</style>\n").replace("\n</body>\n</html>", "")
    assert "<html" not in frag[:2000].lower() and "</body>" not in frag[-200:]
    (web / "artifact.html").write_text(frag)
    print(f"dist/web/index.html  {len(html_web)/1e6:.2f} MB  (+ audio/ files)")
    print(f"dist/present-perfect.html  {len(html)/1e6:.1f} MB   (audio: narration {(DIST/'audio/narration.mp3').stat().st_size/1e6:.1f} MB, music {(DIST/'audio/music_and_effects.mp3').stat().st_size/1e6:.1f} MB)")

if __name__ == "__main__":
    main()
