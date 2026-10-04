#!/usr/bin/env node
// node build/verify_caption_reserve.js <mp4> <video>  -> ENCODED-frame check that burned captions respect the essential reserve (x100-860, y180-1420) and stay clear of the host's mouth.
//  A) cream (caption-glyph colour) pixels in x<100 or x>860 within y 1150-1480: must be 0 (no host/torso there, so any cream is a caption leak)
//  B) dark caption-bar pixels in the shirt column x 330-690, y 1424-1480: must be ~0 (bar and glyphs end above y 1420)
//  C) bar present above the shirt: dark pixels count in x 330-690, y 1215-1405 must be large while a caption is active (sanity)
const fs = require('fs'), path = require('path'), cp = require('child_process'); const L = require('./lib');
const mp4 = path.resolve(process.argv[2]), name = process.argv[3], m = L.loadManifest(name), R = { file: path.basename(mp4), samples: 0, maxCreamOutsideX: 0, maxDarkBelow1420: 0, minBarPixelsWhileActive: 1e9, pass: true };
const frame = t => cp.execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', mp4, '-frames:v', '1', '-vf', 'crop=1080:340:0:1140', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 });   // rows y1140..1479
const px = (b, x, y) => { const o = ((y - 1140) * 1080 + x) * 3; return [b[o], b[o + 1], b[o + 2]]; };
for (const q of m.cues) for (let t = q.cs + .3; t < q.ce - .1; t += .25) { const b = frame(t); R.samples++; let cream = 0, dark = 0, bar = 0;
  for (let y = 1150; y < 1480; y++) for (let x = 0; x < 1080; x += 1) { const o = ((y - 1140) * 1080 + x) * 3, r = b[o], g = b[o + 1], bl = b[o + 2];
    if ((x < 100 || x > 860) && Math.abs(r - 255) < 14 && Math.abs(g - 247) < 14 && Math.abs(bl - 235) < 20) cream++;
    if (x >= 330 && x <= 690) { const isDark = r < 45 && g < 55 && bl < 75; if (y >= 1424 && isDark) dark++; if (y >= 1215 && y <= 1405 && isDark) bar++; } }
  R.maxCreamOutsideX = Math.max(R.maxCreamOutsideX, cream); R.maxDarkBelow1420 = Math.max(R.maxDarkBelow1420, dark); R.minBarPixelsWhileActive = Math.min(R.minBarPixelsWhileActive, bar); }
R.pass = R.maxCreamOutsideX === 0 && R.maxDarkBelow1420 < 200 && R.minBarPixelsWhileActive > 1500;
fs.writeFileSync(path.join(L.ROOT, 'qa', `${name}_caption_reserve_encoded.json`), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R)); process.exit(R.pass ? 0 : 1);
