#!/usr/bin/env node
// node build/verify_noun_hold.js <encoded.mp4>   (Looking forward to)
//  S) source-state proof, every frame at 30 fps from 1 s before the noun intro to the end of the scene: example, rule chip and Spanish translation never show contradictory states
//  E) encoded-pixel measurement: how long the completed noun translation is stationary at full opacity (mint text pixel count within 3 % of its plateau and unchanged), between its entrance and its exit
const path = require('path'), cp = require('child_process'), fs = require('fs'); const L = require('./lib'); const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright');
(async () => {
  const mp4 = path.resolve(process.argv[2]), name = 'looking_forward_to', m = L.loadManifest(name), { K } = L.plan(name, m.cues), FPS = 30, R = { video: name, S: null, E: null };
  const S = await L.serve(), b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(S.url + '/src/index.html?video=' + name); await p.evaluate(() => window.ready); await p.evaluate(c => window.setCues(c), m.cues);
  let bad = [], n = 0, bothAny = 0; const t0 = K.nounChip - 1, t1 = K.nvOut + .4;
  for (let k = Math.round(t0 * FPS); k < Math.round(t1 * FPS); k++) { const st = await p.evaluate(t => { window.renderFrame(t); return window.__NOUN_STATE; }, k / FPS); n++; if (!st) continue; const ε = 0.01;
    if (st.chipB > ε && (st.exampleA > ε || st.trA > ε || st.chipA > ε)) bad.push({ t: +st.t.toFixed(3), why: 'noun chip with state-A element', st });
    if (st.exampleB > ε && (st.trA > ε || st.chipA > ε || st.exampleA > ε)) bad.push({ t: +st.t.toFixed(3), why: 'noun example with state-A element', st });
    if (st.trB > ε && (st.exampleA > ε || st.trA > ε || st.chipA > ε)) bad.push({ t: +st.t.toFixed(3), why: 'noun translation with state-A element', st }); }
  R.S = { framesChecked: n, window: [+t0.toFixed(2), +t1.toFixed(2)], contradictoryFrames: bad.length, firstBad: bad[0] || null, pass: bad.length === 0 }; await b.close(); S.srv.close();
  // E: encoded pixels. Translation lines sit at content y 995 and 1062 (54 px type) -> screen via the 0.86 group transform
  const KK = .86, Y0 = 362, REF = 440, CXc = 506, ty = y => Math.round(Y0 + (y - REF) * KK), tx = x => Math.round(CXc + (x - CXc) * KK);
  const x0 = tx(110), x1 = tx(900), y0 = ty(950), y1 = ty(1085), w = x1 - x0, h = y1 - y0, ts = K.nounChip - .2, td = (K.nvOut + .6) - ts;
  const raw = cp.execFileSync('ffmpeg', ['-v', 'error', '-ss', String(ts), '-t', String(td), '-i', mp4, '-vf', `fps=${FPS},crop=${w}:${h}:${x0}:${y0}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 29 }), fs_ = w * h * 3, nF = Math.floor(raw.length / fs_), cnt = [];
  for (let f = 0; f < nF; f++) { let c = 0; const o = f * fs_; for (let i = 0; i < w * h; i++) { const r = raw[o + i * 3], g = raw[o + i * 3 + 1], bl = raw[o + i * 3 + 2]; if (Math.abs(r - 114) < 32 && Math.abs(g - 216) < 32 && Math.abs(bl - 198) < 32) c++; } cnt.push(c); }
  const sel = cnt.map((c, i) => [ts + i / FPS, c]).filter(([t]) => t > K.noun + .6 && t < K.nvOut - .05), plateau = sel.map(x => x[1]).sort((a, b) => a - b)[Math.floor(sel.length / 2)];
  let best = { len: 0, from: 0, to: 0 }, cur = null; cnt.forEach((c, i) => { const t = ts + i / FPS, ok = c >= .97 * plateau && c <= 1.03 * plateau && t >= K.noun; if (ok) { if (!cur) cur = { from: t, to: t }; cur.to = t; if ((cur.to - cur.from + 1 / FPS) > best.len) best = { len: cur.to - cur.from + 1 / FPS, from: cur.from, to: cur.to }; } else cur = null; });
  R.E = { plateauMintPixels: plateau, entranceStartsAt: +K.noun.toFixed(2), exitStartsAt: +K.nvOut.toFixed(2), longestStationaryFullOpacityRunSeconds: +best.len.toFixed(2), runFrom: +best.from.toFixed(2), runTo: +(best.to + 1 / FPS).toFixed(2), requirementSeconds: 2.5, pass: best.len >= 2.5 };
  R.pass = R.S.pass && R.E.pass; fs.writeFileSync(path.join(L.ROOT, 'qa', path.basename(mp4, '.mp4') + '.noun_hold.json'), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R, null, 1)); process.exit(R.pass ? 0 : 1);
})();
