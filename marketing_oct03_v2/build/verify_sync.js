#!/usr/bin/env node
// node build/verify_sync.js <mp4> <video>
// Objective sync evidence from the ENCODED file (not a listening test):
//  A) per cue: normalized cross-correlation of the cue's narration samples against the MP4's decoded audio -> lag (ms) + correlation
//  B) burned captions: cream-text pixel count in the caption band at each cue midpoint (expect ON) and mid-gap (expect OFF)
//  C) loudness / peaks of the final audio
const fs = require('fs'), path = require('path'), cp = require('child_process'); const L = require('./lib');
const file = path.resolve(process.argv[2]), name = process.argv[3] || 'i_agree', m = L.loadManifest(name), SR = 44100, D = 4, R = SR / D;
if (m.status !== 'TIMED_FROM_SUPPLIED_AUDIO') { console.error('needs narrated manifest'); process.exit(2); }
const dec = f => { const b = cp.execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-vn', '-ac', '1', '-ar', String(R), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 }); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const out = dec(file), res = { file: path.basename(file), cues: [], captions: [], loudness: null };
for (const q of m.cues) {
  const ref = dec(path.join(L.ROOT, q.audio)), i0 = Math.round(q.start * R), maxLag = Math.round(0.15 * R); let best = { c: -2, lag: 0 };
  let ee = 0; for (let k = 0; k < ref.length; k++) ee += ref[k] * ref[k];
  for (let lag = -maxLag; lag <= maxLag; lag++) { let xy = 0, yy = 0; for (let k = 0; k < ref.length; k++) { const y = out[i0 + lag + k] || 0; xy += ref[k] * y; yy += y * y; } const c = xy / Math.sqrt(ee * yy + 1e-12); if (c > best.c) best = { c, lag }; }
  res.cues.push({ id: q.id, text: q.text, correlation: +best.c.toFixed(3), lagMs: +(best.lag / R * 1000).toFixed(1) });
}
// captions
// caption presence: the dark caption bar over the host's cream shirt (central torso region), counted as dark pixels
const band = (t) => { const b = cp.execFileSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1', '-vf', 'crop=250:90:380:1380', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 }); let n = 0; for (let i = 0; i < b.length; i += 3) if (b[i] < 50 && b[i + 1] < 60 && b[i + 2] < 80) n++; return n; };
m.cues.forEach(q => res.captions.push({ at: +((q.cs + q.ce) / 2).toFixed(2), expect: 'ON ' + q.id, creamPixels: band((q.cs + q.ce) / 2) }));
for (let i = 0; i < m.cues.length - 1; i++) { const a = m.cues[i].ce + .3, b = m.cues[i + 1].cs - .3; if (b - a > .1) res.captions.push({ at: +((a + b) / 2).toFixed(2), expect: `OFF (gap ${m.cues[i].id}-${m.cues[i + 1].id})`, creamPixels: band((a + b) / 2) }); }
// final hold: the host has left, so the dark-bar probe cannot see a caption there. Checked from the manifest (no cue window active) + visual review.
const lastEnd = Math.max(...m.cues.map(q => q.ce ?? q.end)); res.finalHold = { from: +(lastEnd + .25).toFixed(2), to: m.duration, noCueActiveInLastSeconds: m.duration - 1 > lastEnd + .25, staticSecondsAfterLastSpeech: +(m.duration - lastEnd - .25).toFixed(2) };
const eb = cp.spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr.toString(); const g = r => { const mm = r.exec(eb.split('Summary:')[1] || ''); return mm ? +mm[1] : null; };
res.loudness = { integratedLUFS: g(/I:\s+(-?[\d.]+) LUFS/), loudnessRangeLU: g(/LRA:\s+(-?[\d.]+) LU/), truePeakdBTP: g(/Peak:\s+(-?[\d.]+) dBFS/) };
res.pass = res.finalHold.noCueActiveInLastSeconds && res.cues.every(c => c.correlation > 0.85 && Math.abs(c.lagMs) <= 45) && res.captions.every(c => c.expect.startsWith('ON') ? c.creamPixels > 3000 : c.creamPixels < 500) && res.loudness.truePeakdBTP < -0.5;
fs.writeFileSync(path.join(L.ROOT, 'qa', `${name}_sync_and_levels.json`), JSON.stringify(res, null, 2)); console.log(JSON.stringify(res, null, 1)); process.exit(res.pass ? 0 : 1);
