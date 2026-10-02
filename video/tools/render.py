"""Render the animation frame-by-frame with headless Chromium, then encode MP4 with ffmpeg.
Usage: python tools/render.py [--mode off|cc|ipa] [--out out/fluent_english_reel.mp4] [--workers 3] [--frames N]
Resource note: ~900 frames at 1080x1920; roughly 0.3-0.6 s/frame/worker on 4 CPU cores. Temp PNGs go to build/frames (≈150 MB)."""
import argparse, os, subprocess, sys, shutil, time
from multiprocessing import Process
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument("--mode", default="ipa"); ap.add_argument("--out", default="out/fluent_english_reel.mp4")
ap.add_argument("--workers", type=int, default=3); ap.add_argument("--frames", type=int, default=900); ap.add_argument("--audio", default="audio/mix_master.wav")
ap.add_argument("--keep", action="store_true"); a = ap.parse_args()
FR = f"{ROOT}/build/frames_{a.mode}"
def work(ids):
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(f"file://{ROOT}/web/index.html?export=1&mode={a.mode}"); pg.evaluate("fontsReady()")
        for i in ids:
            pg.evaluate(f"renderAt({i / 30.0:.5f},'{a.mode}')"); pg.screenshot(path=f"{FR}/f{i:04d}.png")
        b.close()
if __name__ == "__main__":
    shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR); t0 = time.time()
    ids = list(range(a.frames)); ps = [Process(target=work, args=(ids[k::a.workers],)) for k in range(a.workers)]
    [p.start() for p in ps]; [p.join() for p in ps]
    print(f"frames rendered in {time.time() - t0:.0f}s")
    os.makedirs(os.path.dirname(f"{ROOT}/{a.out}"), exist_ok=True)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", f"{FR}/f%04d.png", "-i", f"{ROOT}/{a.audio}",
           "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
           "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "30",
           "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", "-shortest", f"{ROOT}/{a.out}"]
    subprocess.check_call(cmd); print("wrote", a.out)
    if not a.keep: shutil.rmtree(FR, ignore_errors=True)
