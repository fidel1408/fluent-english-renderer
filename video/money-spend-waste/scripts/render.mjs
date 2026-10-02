// Renders the animation to MP4 (1080x1920, 30 fps, H.264) by capturing deterministic frames
// from the HTML page with Playwright/Chromium and encoding with ffmpeg.
// Usage: node scripts/render.mjs [--mode 0|1|2] [--out output/name.mp4] [--audio path.m4a|wav] [--fps 30]
//        [--from 0 --to 28.8] [--workers 2]
// Resource note: ~870 PNG frames at 1080x1920. Default 2 workers keeps CPU use moderate.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const mode = parseInt(arg('mode', '2'), 10);
const fps = parseInt(arg('fps', '30'), 10);
const out = resolve(root, arg('out', `output/spend-or-waste_mode${mode}.mp4`));
const audio = arg('audio', null);
const workers = parseInt(arg('workers', '2'), 10);
const exe = process.env.CHROMIUM_PATH || undefined;

const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const server = createServer((req, res) => {
  const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html');
  if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const probe = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await probe.goto(`http://localhost:${port}/index.html?export=1&mode=${mode}`);
await probe.waitForFunction('window.__ready===true');
const duration = parseFloat(arg('to', await probe.evaluate('window.__duration')));
const t0 = parseFloat(arg('from', '0'));
await probe.close();
const total = Math.round((duration - t0) * fps);
mkdirSync(dirname(out), { recursive: true });

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  ...(audio ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : ['-an']),
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

// each worker renders a contiguous interleaved set; frames are re-ordered before being piped to ffmpeg
const buf = new Map(); let next = 0;
const flush = async () => { while (buf.has(next)) { const b = buf.get(next); buf.delete(next); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); next++; } };
async function worker(w) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto(`http://localhost:${port}/index.html?export=1&mode=${mode}`);
  await page.waitForFunction('window.__ready===true');
  for (let i = w; i < total; i += workers) {
    while (i - next > 24) await new Promise(r => setTimeout(r, 15));   // bound memory
    await page.evaluate(([t, m]) => window.__frame(t, m), [t0 + i / fps, mode]);
    buf.set(i, await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } }));
    await flush();
    if (i % 90 === 0) console.log(`frame ${i}/${total}`);
  }
  await page.close();
}
await Promise.all(Array.from({ length: workers }, (_, w) => worker(w)));
await flush();
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close(); server.close();
console.log('wrote', out);
