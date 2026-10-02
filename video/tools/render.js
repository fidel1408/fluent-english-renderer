// Offline export: frames (headless Chromium) + audio (OfflineAudioContext) -> MP4 via ffmpeg.
//   node tools/render.js [--cc 0|1|2] [--out out/name.mp4] [--audio-only] [--stems]
// Requires: playwright (global or local), ffmpeg on PATH. Production controls are hidden (?render=1).
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const http = require('http'); const fs = require('fs'); const path = require('path');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const CC = +arg('cc', 2), OUT = arg('out', `out/fluent_english_no_entendiste_cc${CC}.mp4`), ROOT = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
(async () => {
  const srv = require('child_process').spawn('node', [path.join(__dirname, 'serve.js'), '8124'], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  pg.on('pageerror', e => console.log('PAGEERR', e.message)); pg.on('console', m => { if (/error/i.test(m.type())) console.log('console', m.text()); });
  await pg.goto(`http://localhost:8124/index.html?render=1&cc=${CC}`); await pg.waitForFunction('window.__ready', null, { timeout: 60000 });
  const stems = arg('stems', false) ? ['mix', 'voice', 'music', 'fx', 'amb'] : ['mix'];
  for (const s of stems) { const b64 = await pg.evaluate((s) => window.renderAudioWav(s), s); fs.writeFileSync(path.join(ROOT, 'out', s === 'mix' ? 'audio_mix.wav' : `stem_${s}.wav`), Buffer.from(b64, 'base64')); console.log('audio', s, 'ok'); }
  if (!arg('audio-only', false)) {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-i', path.join(ROOT, 'out/audio_mix.wav'),
      '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-t', '30', '-movflags', '+faststart', path.join(ROOT, OUT)], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise(r => ff.on('close', r)); const el = pg.locator('#stage'); const t0 = Date.now();
    for (let i = 0; i < 900; i++) {
      await pg.evaluate((t) => window.drawAt(t), i / 30); const png = await el.screenshot({ type: 'png' });
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 90 === 0) console.log(`frame ${i}/900  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await done; console.log('wrote', OUT);
  }
  await b.close(); srv.kill();
})();
