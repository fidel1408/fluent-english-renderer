#!/usr/bin/env node
/* Fluent English – flattened video export (Node + Playwright/Chromium + ffmpeg + espeak-ng).
 *
 *   node export/export.mjs [--cc all|0|1|2] [--out output] [--fps 30] [--voices-dir DIR] [--no-video]
 *
 * - Video: every frame is rendered by the SAME draw code as the preview (js/draw.js) and burned-in captions/IPA follow --cc.
 * - Music + effects: rendered offline with the SAME Web Audio code as the preview (js/audio.js).
 * - Narration: the browser's speech synthesis cannot be captured offline, so this script synthesises stand-in voices with espeak-ng
 *   (robotic!). To use better voices, record your own / device TTS to <voices-dir>/<beatId>.wav (hook, borrowAsk, borrowNarr, lendAsk,
 *   lendNarr, speakPrompt, reveal, cta) – timing then follows the real clip lengths.
 */
import { createRequire } from "module";
import { spawn, spawnSync } from "child_process";
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : true); };
const OUT = path.resolve(here, "..", arg("out", "output")); const FPS = +arg("fps", 30); const CC = arg("cc", "all"); const VOICES = arg("voices-dir", null);
const NOVIDEO = !!arg("no-video", false);
const TMP = fs.mkdtempSync("/tmp/fe-export-"); fs.mkdirSync(OUT, { recursive: true });
const run = (cmd, args, o) => { const r = spawnSync(cmd, args, Object.assign({ encoding: "utf8" }, o)); if (r.status !== 0) throw new Error(cmd + " failed: " + (r.stderr || "").slice(-600)); return r; };
const dur = (f) => parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox", "--disable-gpu"] });
async function newPage() {
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on("pageerror", (e) => console.error("[page error]", e.message));
  await pg.goto("file://" + path.join(here, "frame.html")); await pg.evaluate(() => FE.ready); return pg;
}
const pg0 = await newPage();
const beats = await pg0.evaluate(() => FE.BEATS.map((b) => ({ id: b.id, speech: b.speech })));
const GAP = await pg0.evaluate(() => FE.GAP);

/* ---------- 1. narration clips ---------- */
const clips = {}; const durs = {};
for (const b of beats) {
  if (!b.speech) continue;
  const override = VOICES && path.join(path.resolve(VOICES), b.id + ".wav");
  const parts = [];
  if (override && fs.existsSync(override)) { clips[b.id] = override; durs[b.id] = dur(override); console.log("voice override", b.id, durs[b.id].toFixed(2)); continue; }
  b.speech.forEach((s, i) => {
    const f = path.join(TMP, `${b.id}_${i}.wav`);
    const voice = s.lang === "es" ? ["-v", "es-419", "-s", "178", "-p", "48"] : ["-v", "en-us", "-s", "165", "-p", "44"];
    run("espeak-ng", [...voice, "-a", "180", "-w", f, s.text]);
    parts.push(f);
  });
  // concat with a short gap between segments, 44.1k mono
  const list = []; const gapF = path.join(TMP, "gap.wav");
  run("ffmpeg", ["-y", "-f", "lavfi", "-i", `anullsrc=r=44100:cl=mono`, "-t", String(GAP), gapF]);
  parts.forEach((p, i) => { list.push(p); if (i < parts.length - 1) list.push(gapF); });
  const out = path.join(TMP, b.id + ".wav");
  const inputs = list.flatMap((f) => ["-i", f]);
  const filt = list.map((_, i) => `[${i}:a]aresample=44100,aformat=sample_fmts=s16:channel_layouts=mono,silenceremove=start_periods=1:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_threshold=-48dB,areverse[a${i}]`).join(";") + ";" + list.map((_, i) => `[a${i}]`).join("") + `concat=n=${list.length}:v=0:a=1[o]`;
  run("ffmpeg", ["-y", ...inputs, "-filter_complex", filt, "-map", "[o]", out]);
  clips[b.id] = out; durs[b.id] = dur(out);
  console.log("narration", b.id.padEnd(12), durs[b.id].toFixed(2) + "s");
}

/* ---------- 2. schedule + audio ---------- */
const sch = await pg0.evaluate((d) => FE.setSchedule(d), durs);
console.log("timeline:", sch.beats.map((b) => `${b.id} ${b.start.toFixed(2)}+${b.dur.toFixed(2)}`).join(" | "));
console.log("total duration", sch.total.toFixed(2), "s");
fs.writeFileSync(path.join(OUT, "timeline.json"), JSON.stringify({ total: sch.total, beats: sch.beats.map((b) => ({ id: b.id, start: +b.start.toFixed(3), duration: +b.dur.toFixed(3), speechDuration: +b.speechDur.toFixed(3) })) }, null, 2));

const b64 = await pg0.evaluate((s) => FE.renderOfflineAudio(s, 44100), sch);
const musicWav = path.join(TMP, "music_sfx.wav");
{ const pcm = Buffer.from(b64, "base64"); const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVEfmt ", 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(44100, 24); h.writeUInt32LE(44100 * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40); fs.writeFileSync(musicWav, Buffer.concat([h, pcm])); }
fs.copyFileSync(musicWav, path.join(OUT, "audio_music_sfx_only.wav"));

/* mix narration over music/sfx */
const mixWav = path.join(TMP, "mix.wav");
{
  const inputs = ["-i", musicWav]; const filters = ["[0:a]aformat=channel_layouts=stereo[m]"]; const labels = ["[m]"]; let k = 1;
  for (const b of sch.beats) {
    if (!clips[b.id]) continue;
    const ms = Math.round((b.start + b.sp) * 1000);
    inputs.push("-i", clips[b.id]);
    filters.push(`[${k}:a]aresample=44100,aformat=channel_layouts=stereo,volume=1.9,adelay=${ms}|${ms}[v${k}]`); labels.push(`[v${k}]`); k++;
  }
  filters.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=first,alimiter=limit=0.92:level=disabled[o]`);
  run("ffmpeg", ["-y", ...inputs, "-filter_complex", filters.join(";"), "-map", "[o]", "-t", String(sch.total), "-ar", "44100", "-ac", "2", mixWav]);
}
fs.copyFileSync(mixWav, path.join(OUT, "audio_full_mix.wav"));
await pg0.close();
if (NOVIDEO) { await browser.close(); console.log("audio only – done"); process.exit(0); }

/* ---------- 3. video, one pass per caption mode ---------- */
const modes = CC === "all" ? [2, 1, 0] : [+CC];
const names = { 0: "no-captions", 1: "captions", 2: "captions-ipa" };
const nFrames = Math.round(sch.total * FPS);
await Promise.all(modes.map(async (cc) => {
  const pg = await newPage(); await pg.evaluate((d) => FE.setSchedule(d), durs);
  const file = path.join(OUT, `fluent-english-borrow-lend_${names[cc]}.mp4`);
  const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-i", mixWav,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    "-metadata", `title=Fluent English – Borrow vs Lend (${names[cc]})`, "-shortest", file], { stdio: ["pipe", "ignore", "pipe"] });
  let err = ""; ff.stderr.on("data", (d) => (err += d)); const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error(err.slice(-500))))));
  const t0 = Date.now();
  for (let i = 0; i < nFrames; i++) {
    const jpg = await pg.evaluate(([t, c]) => { FE.renderFrame(t, c); return FE.frameJPEG(0.94); }, [i / FPS, cc]);
    if (!ff.stdin.write(Buffer.from(jpg, "base64"))) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`[cc=${cc}] frame ${i}/${nFrames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await done; await pg.close(); console.log("wrote", file);
}));
await browser.close();
console.log("done");
