#!/usr/bin/env node
// node build/transition_sheets.js <mp4> <video> <outDir>  -> ENCODED-frame contact sheets at phone size (270x480 tiles) around every scene boundary (-0.2 .. +0.6 s, 0.1 s steps) plus settled frames of each hold.
const fs = require('fs'), path = require('path'), cp = require('child_process'); const L = require('./lib');
const mp4 = path.resolve(process.argv[2]), name = process.argv[3], out = path.resolve(process.argv[4]), m = L.loadManifest(name), { K } = L.plan(name, m.cues); fs.mkdirSync(out, { recursive: true });
const tile = (t, f) => cp.execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(Math.max(0, t)), '-i', mp4, '-frames:v', 1, '-vf', 'scale=270:480', f]);
const sheet = (times, file) => { const fs_ = times.map((t, i) => { const f = path.join(out, `_t${i}.png`); tile(t, f); return f; }); const cols = Math.min(times.length, 8), rows = Math.ceil(times.length / cols), inp = fs_.flatMap(f => ['-i', f]);
  const lay = fs_.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|'); cp.execFileSync('ffmpeg', ['-v', 'error', '-y', ...inp, '-filter_complex', `${fs_.map((_, i) => `[${i}]`).join('')}xstack=inputs=${fs_.length}:layout=${lay}`, file]); fs_.forEach(f => fs.unlinkSync(f)); };
K.scenes.slice(0, -1).forEach((sc, i) => { const b = sc.end, nx = K.scenes[i + 1]; const ts = []; for (let k = -2; k <= 6; k++) ts.push(+(Math.min(m.duration - .05, b + k * .1)).toFixed(2)); sheet(ts.slice(0, 8), path.join(out, `${name}_transition_${sc.id}_to_${nx.id}.png`)); });
K.holds.forEach(h => { const to = h.to === null ? m.duration - .05 : h.to; sheet([h.from, h.from + (to - h.from) * .33, h.from + (to - h.from) * .66, to - .05].map(t => +t.toFixed(2)), path.join(out, `${name}_hold_${h.id}.png`)); });
console.log('sheets in', out, fs.readdirSync(out).filter(f => f.startsWith(name)).length);
