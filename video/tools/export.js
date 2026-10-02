// Exports out/pide-tu-cafe-en-ingles.mp4 : frames from the real renderer (headless Chromium, 1080x1920 @30 fps)
// + mixed audio (narration, music, ambience, effects stems). Usage: node tools/export.js [--mode 0|1|2] [--out file]
const fs = require('fs'), path = require('path'), cp = require('child_process'), L = require('./lib');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const mode = +arg('--mode', 2), outFile = path.resolve(arg('--out', path.join(L.ROOT, 'out/pide-tu-cafe-en-ingles.mp4')));
const FPS = 30, N = 30 * FPS, A = path.join(L.ROOT, 'build/audio');
for (const f of ['voice', 'music', 'amb', 'sfx']) if (!fs.existsSync(path.join(A, f + '.wav'))) { console.error('missing stem', f, '— run tools/render-audio.js'); process.exit(1); }
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const G = JSON.parse(fs.readFileSync(path.join(__dirname, 'mix.json')));
const MIX = `[3:a]volume=${G.voice}[v];[0:a]volume=${G.music}[m];[1:a]volume=${G.amb}[a];[2:a]volume=${G.sfx}[s]`;
(async () => {
  // 1) audio mix (voice 3, music 0, amb 1, sfx 2)
  const mixWav = path.join(L.ROOT, 'build/audio/mix.wav');
  cp.execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(A, 'music.wav'), '-i', path.join(A, 'amb.wav'), '-i', path.join(A, 'sfx.wav'), '-i', path.join(A, 'voice.wav'),
    '-filter_complex', MIX + ';[v][m][a][s]amix=inputs=4:normalize=0,loudnorm=I=-16:TP=-3:LRA=7,alimiter=limit=0.85:level=disabled,aresample=48000,atrim=0:30[o]', '-map', '[o]', mixWav]);
  // 2) frames
  const srv = await L.serve(), b = await L.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.log('pageerror', e.message));
  await p.goto(srv.url + '/index.html?export=1&mode=' + mode);
  await p.waitForFunction('window.__ready && window.__ready()');
  const ff = cp.spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', mixWav,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', '30', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r) => ff.on('close', r));
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const b64 = await p.evaluate((t) => { window.__renderAt(t); return document.getElementById('cv').toDataURL('image/jpeg', 0.97).split(',')[1]; }, i / FPS);
    if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log('frame', i, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  ff.stdin.end(); await done; await b.close(); srv.close();
  console.log('wrote', outFile);
})();
