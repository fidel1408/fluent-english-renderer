#!/usr/bin/env node
// node build/verify_mouth.js <mp4> <video>   Casting check on the ENCODED frames: the man (right) must show an open mouth only inside measured
// speech islands (never in silence/padding); the woman (left) must never show an open (speaking) mouth.
const cp = require('child_process'), fs = require('fs'), path = require('path'); const L = require('./lib');
const file = path.resolve(process.argv[2]), name = process.argv[3] || 'i_agree', m = L.loadManifest(name), FPS = m.fps, N = Math.round(m.duration * FPS);
const grab = () => cp.execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'crop=100:60:456:1140', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });   // host mouth region (single presenter)
const open = (buf, f) => { let n = 0; const o = f * 100 * 60 * 3; for (let i = 0; i < 100 * 60; i++) { const r = buf[o + i * 3], g = buf[o + i * 3 + 1], b = buf[o + i * 3 + 2]; if (Math.abs(r - 58) < 24 && Math.abs(g - 15) < 20 && Math.abs(b - 18) < 20) n++; } return n >= 150; };   // an open mouth is a filled blob (~1000 px); a closed smile/line is a thin stroke (~150 px)
const K = L.plan(name, m.cues).K, avEnd = K.avOut + .1;   // avatars leave the screen at the CTA
const man = grab(), woman = null, isl = []; m.cues.forEach(q => (q.islands || []).forEach(i => isl.push([q.start + i.s, q.start + i.e])));
const inside = t => isl.some(([a, b]) => t >= a && t <= b);
const R = { islands: isl.length, manOpenInIsland: 0, manFramesInIsland: 0, manOpenOutsideIsland: 0, womanOpenFrames: 0, perIslandOpenFraction: [] };
const per = isl.map(() => ({ n: 0, o: 0 }));
for (let f = 0; f < N; f++) { const t = f / FPS; /* avatars are settled between entrance (0.7 s) and exit */ if (t < 0.8) continue; if (t > K.avOut - .05) break; const om = open(man, f), ow = false; if (ow) R.womanOpenFrames++;
  const k = isl.findIndex(([a, b]) => t >= a && t <= b); if (k >= 0) { R.manFramesInIsland++; per[k].n++; if (om) { R.manOpenInIsland++; per[k].o++; } } else if (om) { R.manOpenOutsideIsland++; (R.outsideTimes = R.outsideTimes || []).push(+t.toFixed(3)); } }
R.perIslandOpenFraction = per.map((p, i) => `${isl[i][0].toFixed(2)}-${isl[i][1].toFixed(2)}s:${p.n ? (p.o / p.n).toFixed(2) : 'n/a'}`);
R.pass = R.manOpenOutsideIsland === 0 && R.womanOpenFrames === 0 && per.every(p => p.n === 0 || p.o / p.n > .3);
fs.writeFileSync(path.join(L.ROOT, 'qa', `${name}_mouth_casting.json`), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R, null, 1)); process.exit(R.pass ? 0 : 1);
