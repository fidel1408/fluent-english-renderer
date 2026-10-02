// Renders the complete soundtrack OFFLINE with the same Web Audio code the preview uses (src/soundtrack.js) and writes:
//   audio/export/stem_{voice,music,ambience,sfx}.wav   (independent layers)
//   audio/export/mix_raw.wav                           (stems summed + master chain)
//   audio/export/soundtrack.wav                        (loudness-normalised to -16 LUFS, true peak <= -1.5 dBTP) <- muxed into the MP4
// Nothing is recorded from speakers or a browser tab, so every layer is guaranteed to be in the file.
// Usage: node scripts/render_audio.mjs [--voice 1 --music 0.9 --ambience 0.85 --sfx 0.9]
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? parseFloat(process.argv[i + 1]) : d; };
const gains = { voice: arg('voice', 1), music: arg('music', 0.9), ambience: arg('ambience', 0.85), sfx: arg('sfx', 0.9) };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.mp3': 'audio/mpeg' };
const server = createServer((req, res) => { const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html'); if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); }).listen(0);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.log('page error:', e.message));
await p.goto(`http://localhost:${server.address().port}/index.html?export=1`); await p.waitForFunction('window.__ready===true');
const t0 = Date.now(); const r = await p.evaluate((g) => window.__renderAudio(g), gains);
const dir = resolve(root, 'audio/export'); mkdirSync(dir, { recursive: true });
for (const k of ['voice', 'music', 'ambience', 'sfx']) writeFileSync(join(dir, `stem_${k}.wav`), Buffer.from(r[k], 'base64'));
writeFileSync(join(dir, 'mix_raw.wav'), Buffer.from(r.mix, 'base64'));
await b.close(); server.close();
console.log(`rendered ${r.voiceClips} narration clips + synthesised layers in ${((Date.now() - t0) / 1000).toFixed(1)} s; gains`, JSON.stringify(gains));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(dir, 'mix_raw.wav'), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9:linear=true', '-ar', '44100', join(dir, 'soundtrack.wav')]);
console.log('wrote audio/export/soundtrack.wav');
