#!/usr/bin/env node
// node build/render.js i_agree [--from 0] [--to 20] [--out out/file.mp4]
// Deterministic render: Chromium draws frame(t) -> PNG -> ffmpeg (libx264 yuv420p, AAC, faststart).
const fs = require('fs'), path = require('path'), cp = require('child_process'); const L = require('./lib');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright');
const a = process.argv.slice(2), name = a[0] && !a[0].startsWith('--') ? a[0] : 'i_agree', opt = k => { const i = a.indexOf('--' + k); return i < 0 ? null : a[i + 1]; };
(async () => {
  const m = L.loadManifest(name), FPS = m.fps, from = +(opt('from') || 0), to = +(opt('to') || m.duration);
  const complete = m.status === 'TIMED_FROM_SUPPLIED_AUDIO';
  const label = complete ? 'narrated' : 'PREVIEW_audio-pending';
  const outFile = path.resolve(L.ROOT, opt('out') || `out/${name}_oct03_v2_${label}.mp4`); fs.mkdirSync(path.dirname(outFile), { recursive: true });
  cp.execFileSync('node', [path.join(__dirname, 'audio.js'), name], { stdio: 'inherit' });
  const mix = path.join(L.ROOT, 'build', 'tmp', `${name}_mix.wav`);
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  const S = await L.serve(); await page.goto(S.url + '/src/index.html?video=' + name); await page.evaluate(() => window.ready); await page.evaluate(c => window.setCues(c), m.cues);
  const ff = cp.spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-ss', String(from), '-t', String(to - from), '-i', mix,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-metadata', `title=Fluent English - ${name} - ${label}`, '-metadata', `comment=${complete ? 'Narration from supplied files' : 'ANIMATION PREVIEW. Narration pending. Not publish-ready.'}`, '-shortest', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * FPS), n1 = Math.round(to * FPS); const t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    const b64 = await page.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png').slice(22); }, n / FPS);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 60 === 0) process.stdout.write(`frame ${n}/${n1}\r`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close(); S.srv.close();
  console.log(`\nrendered ${n1 - n0} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${path.relative(L.ROOT, outFile)} (${m.status})`);
})();
