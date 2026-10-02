// Renders the procedural music / ambience / sfx stems offline (OfflineAudioContext in headless Chromium)
// and builds the narration stem from build/voices/*.wav placed at their cue times.
const fs = require('fs'), path = require('path'), cp = require('child_process'), L = require('./lib');
const out = path.join(L.ROOT, 'build/audio'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const srv = await L.serve(), b = await L.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => console.log('pageerror', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('console error:', m.text()); });
  await p.goto(srv.url + '/tools/sheet.html');
  await p.addScriptTag({ url: srv.url + '/src/audio.js' });
  const stems = await p.evaluate(() => FE.AudioEngine.renderStems(48000));
  for (const [k, b64] of Object.entries(stems)) {
    const raw = path.join(out, k + '.raw'); fs.writeFileSync(raw, Buffer.from(b64, 'base64'));
    cp.execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 's16le', '-ar', '48000', '-ac', '2', '-i', raw, path.join(out, k + '.wav')]); fs.unlinkSync(raw);
    console.log('stem', k, 'ok');
  }
  // narration stem
  const cfg = await p.evaluate(() => FE.CUES.map((q) => ({ id: q.id, t: q.t })));
  const args = ['-y', '-v', 'error'], filt = []; cfg.forEach((q, i) => { args.push('-i', path.join(L.ROOT, 'build/voices', q.id + '.wav')); filt.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(q.t * 1000)}|${Math.round(q.t * 1000)}[a${i}]`); });
  filt.push(cfg.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${cfg.length}:normalize=0,apad=whole_dur=30,atrim=0:30[v]`);
  args.push('-filter_complex', filt.join(';'), '-map', '[v]', path.join(out, 'voice.wav'));
  cp.execFileSync('ffmpeg', args); console.log('stem voice ok');
  await b.close(); srv.close();
})();
