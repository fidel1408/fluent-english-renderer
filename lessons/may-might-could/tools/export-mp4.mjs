// Passive, NON-INTERACTIVE demonstration video of Demo Mode (no clicks, no timers you can use).
// node tools/export-mp4.mjs --out file.mp4 [--fps 6] [--w 960] [--h 540] [--from 0] [--to 3600]
// Renders on THIS machine (headless Chromium, frame by frame, piped to ffmpeg). Slow: about 0.1 s per frame.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { spawn, spawnSync } from 'child_process'; import path from 'path'; import fs from 'fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const fps = +arg('fps', 6), W = +arg('w', 960), H = +arg('h', 540), from = +arg('from', 0), to = +arg('to', 3600), out = path.resolve(arg('out', 'demo.mp4'));
const tmp = out + '.video.mp4';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto('file://' + path.join(root, 'release/index.html')); await p.waitForTimeout(1000);
const sched = await p.evaluate(([from, to]) => {
  document.getElementById('startVeil').remove(); document.getElementById('hud').style.display = 'none';
  const A = FE.Audio; A.init = () => {}; A.play = () => true; A.stop = () => {}; A.sfx = () => {}; A.musicOn = () => {}; A.ambience = () => {}; A.setSilence = () => {};
  const R = FE.R; R.started = true; R.wall = () => R.pos(); R.mode = 'demo'; FE.UI.onMode('demo'); R.seekP(from); R.playing = true;
  const out = []; FE.L.segs.forEach((s) => FE.compileSeg(s).speech.forEach((q) => { const at = s.start + q.t0; if (at >= from - 1 && at < to) out.push({ file: A.NARR[q.key] && A.NARR[q.key].file, at: at - from }); }));
  return out.filter((x) => x.file);
}, [from, to]);
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '32', '-pix_fmt', 'yuv420p', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
const frames = Math.round((to - from) * fps); const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  await p.evaluate((dt) => FE.R.tick(dt), 1 / fps);
  const buf = await p.screenshot({ type: 'jpeg', quality: 62 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 600 === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)} s elapsed`);
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close();
// narration track: every clip placed at its exact time in the Demo timeline
const inputs = sched.flatMap((s) => ['-i', path.join(root, 'release', s.file)]);
const filt = sched.map((s, i) => `[${i}:a]adelay=${Math.round(s.at * 1000)}:all=1[a${i}]`).join(';') + ';' + sched.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${sched.length}:normalize=0:dropout_transition=0,apad=whole_dur=${to - from}[m]`;
fs.writeFileSync(out + '.filter.txt', filt);
const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-i', tmp, '-filter_complex_script', out + '.filter.txt', '-map', `${sched.length}:v`, '-map', '[m]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k', '-shortest', out], { stdio: 'inherit' });
fs.rmSync(tmp, { force: true }); fs.rmSync(out + '.filter.txt', { force: true });
console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB', 'in', ((Date.now() - t0) / 1000).toFixed(0), 's', 'status', r.status);
