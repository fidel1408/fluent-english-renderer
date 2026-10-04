#!/usr/bin/env node
// node build/verify_holds.js <mp4> <video>  -> ENCODED-frame proof of the settled reading holds declared in the timeline (K.holds).
// For every hold and every rect (content-space rects lie inside opaque cards) the luma of each encoded frame (30 fps) is compared with its predecessor and with the first frame of the hold.
// A frame is "stationary" when mean |diff| to the previous frame <= 0.9 gray levels and to the first frame <= 2.5. The longest stationary run (min over the rects of a hold) must be >= the requirement.
const fs = require('fs'), path = require('path'), cp = require('child_process'); const L = require('./lib');
const mp4 = path.resolve(process.argv[2]), name = process.argv[3], m = L.loadManifest(name), { K } = L.plan(name, m.cues), FPS = 30, KK = .86, Y0 = 362, REF = 440, CXc = 506;
const sx = x => Math.round(CXc + (x - CXc) * KK), sy = y => Math.round(Y0 + (y - REF) * KK), R = { file: path.basename(mp4), holds: [], pass: true };
for (const h of K.holds) {
  const from = h.from, to = h.to === null ? m.duration : h.to, runs = [];
  for (const [x0, y0, x1, y1] of h.rects) {
    const X0 = sx(x0), Y0s = sy(y0), W = sx(x1) - X0, H = sy(y1) - Y0s, raw = cp.execFileSync('ffmpeg', ['-v', 'error', '-ss', String(from), '-t', String(to - from), '-i', mp4, '-an', '-vf', `fps=${FPS},crop=${W}:${H}:${X0}:${Y0s},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 }), fsz = W * H, n = Math.floor(raw.length / fsz);
    let best = 0, cur = 0, maxPrev = 0, maxFirst = 0, first = 0, meanFirst = [];
    for (let f = 0; f < n; f++) { let dp = 0, df = 0; const o = f * fsz, op = (f - 1) * fsz; for (let i = 0; i < fsz; i += 3) { if (f) dp += Math.abs(raw[o + i] - raw[op + i]); df += Math.abs(raw[o + i] - raw[first * fsz + i]); } dp /= fsz / 3; df /= fsz / 3;
      const still = f === 0 || (dp <= .9 && df <= 2.5); if (f) { maxPrev = Math.max(maxPrev, dp); maxFirst = Math.max(maxFirst, df); } if (still) { cur++; best = Math.max(best, cur); } else { cur = 1; first = f; } }
    runs.push({ rect: [X0, Y0s, W, H], frames: n, longestStationaryRunSeconds: +(best / FPS).toFixed(2), maxMeanAbsDiffToPrevious: +maxPrev.toFixed(2), maxMeanAbsDiffToFirst: +maxFirst.toFixed(2) });
  }
  const measured = Math.min(...runs.map(r => r.longestStationaryRunSeconds)), ok = measured >= h.min - 1 / FPS;
  if (!ok) R.pass = false; R.holds.push({ id: h.id, plannedWindow: [+from.toFixed(2), +to.toFixed(2)], requirementSeconds: h.min, measuredStationarySeconds: measured, ok, rects: runs });
}
fs.writeFileSync(path.join(L.ROOT, 'qa', `${name}_holds_encoded.json`), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R.holds.map(h => `${h.id}: planned ${h.plannedWindow.join('-')} s, stationary ${h.measuredStationarySeconds} s (min ${h.requirementSeconds}) ${h.ok ? 'OK' : 'FAIL'}`), null, 1)); process.exit(R.pass ? 0 : 1);
