// Offline, frame-exact export of the 1080×1920 video with generated music + SFX.
//   node tools/export-video.mjs [--cc off|cc|ipa ...] [--out video/exports] [--fps 30] [--crf 20]
// Speech synthesis can NOT be captured by this exporter (it plays through the OS/browser audio stack, not
// through Web Audio). The exported audio is: original music + SFX, ducked as in the live preview where narration
// goes, and nearly silent during the 4 s learner pause. See video/README.md for how to record with voices.
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const modes = []; for (let i = 0; i < args.length; i++) if (args[i] === "--cc") modes.push(args[i + 1]);
if (!modes.length) modes.push("cc", "ipa");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(opt("out", join(root, "video", "exports")));
const FPS = +opt("fps", 30), CRF = opt("crf", "20");
mkdirSync(outDir, { recursive: true });
const CC = { off: 0, cc: 1, ipa: 2 };
const NAMES = { off: "sin-subtitulos", cc: "subtitulos", ipa: "subtitulos-ipa" };

const browser = await chromium.launch({ args: ["--disable-gpu-vsync"] });

async function newPage(cc) {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.goto(pathToFileURL(join(root, "video", "index.html")).href + "?clean=1&cc=" + cc);
  await page.waitForFunction(() => window.FE && FE.player && FE.lockupImg);
  return page;
}

// 1) soundtrack (once)
const apage = await newPage(0);
const wavB64 = await apage.evaluate(async () => {
  const buf = await FE.renderSoundtrack();
  const wav = FE.encodeWav(buf);
  let s = ""; for (let i = 0; i < wav.length; i += 0x8000) s += String.fromCharCode.apply(null, wav.subarray(i, i + 0x8000));
  return btoa(s);
});
const wavPath = join(outDir, "soundtrack-musica-y-efectos.wav");
writeFileSync(wavPath, Buffer.from(wavB64, "base64"));
console.log("soundtrack ->", wavPath);

// 2) cover
const coverB64 = await apage.evaluate(() => {
  const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1920;
  FE.renderCover(cv.getContext("2d")); return cv.toDataURL("image/png").split(",")[1];
});
writeFileSync(join(outDir, "portada.png"), Buffer.from(coverB64, "base64"));
await apage.close();

// 3) frames → mp4, per caption mode
for (const mode of modes) {
  const page = await newPage(CC[mode]);
  await page.evaluate((cc) => {
    const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1920; document.body.appendChild(cv);
    window.__cv = cv;
    const P = new FE.Player(cv, { virtual: true, noAudio: true, cc });
    window.__P = P; P.replayInternal();
  }, CC[mode]);
  const file = join(outDir, `fluent-english-edad-33-${NAMES[mode]}.mp4`);
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-i", wavPath, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "medium", "-crf", CRF, "-pix_fmt", "yuv420p",
    "-profile:v", "high", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-t", "30", "-movflags", "+faststart", file],
    { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((r) => ff.on("close", r));
  const total = Math.round(30 * FPS);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    const url = await page.evaluate(([f, FPS]) => {
      const P = window.__P;
      if (f > 0) P.step(1 / FPS);
      // picture and the offline soundtrack both use nominal times, so the clock must never hold or drift
      if (P.holding || Math.abs(P.T - f / FPS) > 1e-6) throw new Error("clock drift at frame " + f + ": T=" + P.T + " holding=" + P.holding);
      P.draw();
      return window.__cv.toDataURL("image/jpeg", 0.95);
    }, [f, FPS]);
    if (!ff.stdin.write(Buffer.from(url.split(",")[1], "base64"))) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 90 === 0) process.stdout.write(`\r[${mode}] frame ${f}/${total} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end(); await done; await page.close();
  console.log(`\n${mode} -> ${file}`);
}
await browser.close();
