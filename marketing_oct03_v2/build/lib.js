// Shared helpers: manifest loading + cue layout from natural durations, cue audio lookup, SFX synthesis.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..'); const SR = 48000;

// Cue times are computed, never fixed: start = previous end + gap; duration = real audio length (or estimate for a preview).
function layout(m, durOf) {
  let t = m.lead; m.cues.forEach((q, i) => { const d = durOf(q); q.start = +(i === 0 ? t : t + q.gap).toFixed(3); q.end = +(q.start + d).toFixed(3); t = q.end; });
  m.duration = Math.ceil((t + m.endHold) * 10) / 10; return m;
}
function plan(name, cues) { return require(path.join(ROOT, 'src', 'timelines', name + '.js')).plan(cues); }
function loadManifest(name, preferRetimed = true) {
  const base = path.join(ROOT, 'manifest', `${name}.cues.json`), re = path.join(ROOT, 'manifest', `${name}.cues.retimed.json`);
  let m;
  if (preferRetimed && fs.existsSync(re)) { m = JSON.parse(fs.readFileSync(re, 'utf8')); m._file = re; }
  else { m = JSON.parse(fs.readFileSync(base, 'utf8')); layout(m, q => q.est); m.status = 'PLANNED_TIMING_NO_AUDIO'; m._file = base; }
  m.sfx = plan(name, m.cues).sfx; return m;
}
function findCueAudio(m, q) {
  const stem = path.join(ROOT, path.dirname(q.file), path.basename(q.file, path.extname(q.file)));
  for (const ext of ['.wav', '.mp3', '.WAV', '.MP3']) if (fs.existsSync(stem + ext)) return stem + ext; return null;
}
function probeDuration(file) { return parseFloat(cp.execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString()); }

function serve() {
  const http = require('http'), types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
  return new Promise(res => { const srv = http.createServer((rq, rs) => { const f = path.join(ROOT, decodeURIComponent(rq.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(rs); }); srv.listen(0, '127.0.0.1', () => res({ srv, url: `http://127.0.0.1:${srv.address().port}` })); });
}

// ---- tiny offline synth (nonmusical UI-style effects), all original
function synthSfx(m) {
  const N = Math.ceil(m.duration * SR), L = new Float32Array(N), R = new Float32Array(N);
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };
  const add = (t0, dur, fn, gain, pan = 0) => { const i0 = Math.floor(t0 * SR), n = Math.floor(dur * SR); for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const x = fn(i / SR, i / n) * gain; L[i0 + i] += x * (1 - Math.max(0, pan)); R[i0 + i] += x * (1 + Math.min(0, pan)); } };
  const env = (u, a = .02, p = 3) => Math.min(1, u / a) * Math.pow(1 - u, p);
  const lp = (k) => { let y = 0; return x => (y += k * (x - y)); };
  const T = {
    pop: t => add(t, .16, (s, u) => Math.sin(2 * Math.PI * (330 + 420 * u) * s) * env(u, .01, 2.2), .16),
    tick: t => add(t, .05, (s, u) => Math.sin(2 * Math.PI * 1500 * s) * env(u, .002, 4), .07),
    swish: t => { const f = lp(.18), g = lp(.5); add(t, .4, (s, u) => { const k = .05 + .5 * Math.sin(Math.PI * u); return (g(rnd()) - f(rnd())) * 2.4 * Math.sin(Math.PI * u) * (.4 + k); }, .18); },
    scratch: t => { const f = lp(.35); add(t, .34, (s, u) => (rnd() - f(rnd())) * Math.sin(Math.PI * Math.min(1, u * 1.4)) * (.6 + .4 * Math.sin(u * 60)), .09); },
    thock: t => { add(t, .2, (s, u) => Math.sin(2 * Math.PI * (210 - 90 * u) * s) * env(u, .004, 3), .22); const f = lp(.4); add(t + .02, .35, (s, u) => (rnd() - f(rnd())) * Math.sin(Math.PI * u), .12); },
    sparkle: t => [0, 1, 2, 3, 4].forEach(i => add(t + i * .045, .18, (s, u) => Math.sin(2 * Math.PI * (2400 + i * 520) * s) * env(u, .003, 3), .035, i % 2 ? .4 : -.4)),
    ding: t => add(t, .6, (s, u) => (Math.sin(2 * Math.PI * 880 * s) + .3 * Math.sin(2 * Math.PI * 1760 * s)) * env(u, .005, 2.5), .1),
    whoosh: t => { const f = lp(.12); add(t, .8, (s, u) => (rnd() - f(rnd())) * Math.sin(Math.PI * u) * Math.sin(Math.PI * u), .14, 0); },   // slow travel sound for markers
  };
  m.sfx.forEach(e => T[e.type](e.at));
  const duck = new Float32Array(N).fill(1); m.cues.forEach(q => { for (let i = Math.floor((q.start - .06) * SR); i < Math.min(N, Math.floor((q.end + .12) * SR)); i++) if (i >= 0) duck[i] = .35; });
  let d = 1; for (let i = 0; i < N; i++) { const target = duck[i], k = target < d ? 1 - Math.exp(-1 / (.06 * SR)) : 1 - Math.exp(-1 / (.25 * SR)); d += (target - d) * k; L[i] *= d; R[i] *= d; }
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); const norm = peak > 0 ? Math.min(1, .1 / peak) : 1;
  const buf = Buffer.alloc(44 + N * 4); buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4); }
  return { buf, peakDb: 20 * Math.log10(Math.max(1e-9, peak * norm)) };
}
module.exports = { serve, ROOT, SR, layout, plan, loadManifest, findCueAudio, probeDuration, synthSfx };
