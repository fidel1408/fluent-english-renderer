// Offline MP4 export: deterministic frames (headless Chromium) + offline Web Audio mix + voice clips.
//
// Browser speechSynthesis cannot be captured by a canvas recording, so the MP4's voice track comes from
// WAV clips in export/voices/<beat>.wav. Missing clips are generated with espeak-ng/MBROLA (offline, free).
// Drop in your own recordings with the same names to replace them, then re-run `npm run export`.
//
// usage: node tools/export.mjs [--cc=0,1,2] [--fps=30] [--no-voice]
import { createRequire } from 'module';
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const FPS = +(args.fps || 30);
const CCS = String(args.cc || '2,1,0').split(',').map(Number);
const VOICE_DIR = path.join(ROOT, 'export/voices');
const OUT = path.join(ROOT, 'export');
fs.mkdirSync(VOICE_DIR, { recursive: true });

// ---- script (kept in sync with src/config.js by loading it) ----
const cfgSrc = fs.readFileSync(path.join(ROOT, 'src/config.js'), 'utf8');
const FE = {}; new Function('window', cfgSrc)({ FE });
const BEATS = FE.BEATS;

function sh(cmd, a) { const r = spawnSync(cmd, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr}`); return r.stdout; }
const dur = (f) => parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));

// ---- voices ----
const VOICE_TEXT = { hook: 0, phrase: 0, intro: 0, introEn: 0, morph: 0, turn: 0, reveal: 0, cta: 0 };
function makeVoice(b) {
  const f = path.join(VOICE_DIR, b.k + '.wav');
  if (fs.existsSync(f)) return f;
  const raw = path.join(VOICE_DIR, b.k + '.raw.wav');
  const text = b.say.text.replace(/[“”]/g, '').replace('…', '');
  const es = b.say.lang === 'es';
  const a = es ? ['-v', 'es-419', '-s', '178', '-p', '38', '-g', '1'] : ['-v', 'mb-us2', '-s', '140', '-g', '4'];
  sh('espeak-ng', [...a, text, '-w', raw]);
  sh('ffmpeg', ['-loglevel', 'error', '-y', '-i', raw, '-ar', '44100', '-ac', '1',
    '-af', 'highpass=f=80,silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-3:LRA=7,apad=pad_dur=0.02',
    f]);
  fs.unlinkSync(raw);
  return f;
}

const useVoice = !args['no-voice'];
const clips = {};
BEATS.forEach((b) => { if (b.say && useVoice) clips[b.k] = makeVoice(b); });

// ---- schedule (same rules as the live engine, with real clip lengths) ----
const beats = {}; let cursor = 0;
BEATS.forEach((b) => {
  const m = { s: cursor };
  if (b.wait) { m.end = cursor + b.wait; }
  else {
    const d = clips[b.k] ? dur(clips[b.k]) : 0.42 * b.say.text.split(' ').length;
    m.say0 = cursor + (b.pre || 0); m.say1 = m.say0 + d; m.est = d; m.end = m.say1 + (b.post || 0);
  }
  beats[b.k] = m; cursor = m.end;
});
const TOTAL = Math.ceil(cursor * FPS) / FPS + 0.2;
fs.writeFileSync(path.join(OUT, 'schedule.json'), JSON.stringify({ total: cursor, fps: FPS, beats }, null, 2));
console.log('schedule: total', cursor.toFixed(2), 's; silence', (beats.silence.end - beats.silence.s).toFixed(2), 's');

// ---- tiny static server ----
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(p); const mime = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2' }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime }); fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/index.html?export=1`);
await page.evaluate(() => FE.exp.init());

// ---- audio ----
const voices = {};
for (const [k, f] of Object.entries(clips)) voices[k] = fs.readFileSync(f).toString('base64');
const audio = await page.evaluate(([b, v, t]) => FE.exp.audio(b, v, t), [beats, voices, TOTAL]);
const wavPath = path.join(OUT, 'audio_mix.wav');
fs.writeFileSync(wavPath, Buffer.from(audio.b64, 'base64'));
console.log('audio mix peak (linear):', audio.peak.toFixed(3));

// ---- cover ----
{
  const url = await page.evaluate(() => FE.exp.frame({}, 0, 0, 'cover'));
  fs.writeFileSync(path.join(OUT, 'cover.png'), Buffer.from(url.split(',')[1], 'base64'));
}

// ---- frames per caption mode ----
const names = { 0: 'cc-off', 1: 'captions', 2: 'captions-ipa' };
for (const cc of CCS) {
  const file = path.join(OUT, `fluent-english-tacos_${names[cc]}.mp4`);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', wavPath,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '192k', '-t', String(TOTAL), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(TOTAL * FPS);
  for (let i = 0; i < n; i++) {
    const url = await page.evaluate(([b, t, c]) => FE.exp.frame(b, t, c), [beats, i / FPS, cc]);
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`cc=${cc} frame ${i}/${n}`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', file);
}
await browser.close(); server.close();
