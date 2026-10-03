#!/usr/bin/env node
// node build/partition_split.js <video> <master.mp3>
// Splits a continuous narration master at the EXPLICIT sample indices in manifest.alignment.partitions (half-open [a,b), 44.1 kHz mono),
// taken from the independent timing handoff (midpoints of measured silences). No fades, no resampling, no speed change, no trimming:
// every decoded sample is retained exactly once. Also measures speech islands (silencedetect -38 dB, >=120 ms) inside each partition
// for mouth/caption/animation timing, and proves coverage + bit-exact reconstruction.
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'); const L = require('./lib');
const [name, masterRel] = [process.argv[2], process.argv[3]], master = path.resolve(L.ROOT, masterRel), SR = 44100;
const man = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.json`))), spec = man.alignment;
const raw = cp.execFileSync('ffmpeg', ['-v', 'error', '-i', master, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 28 }); const pcm = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2), N = pcm.length;
if (N !== spec.totalSamples) throw new Error(`decoded ${N} samples, expected ${spec.totalSamples}`);
const P = spec.partitions; if (P.length !== man.cues.length) throw new Error('partitions/cues mismatch');
for (let i = 0; i < P.length; i++) { if (P[i][0] !== (i ? P[i - 1][1] : 0)) throw new Error('partitions not contiguous at ' + i); } if (P[P.length - 1][1] !== N) throw new Error('partitions do not reach the end');
const so = cp.spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', master, '-af', 'silencedetect=n=-38dB:d=0.12', '-f', 'null', '-']).stderr.toString(); const sil = []; let cur = null;
for (const ln of so.split('\n')) { let m; if ((m = /silence_start: ([\d.]+)/.exec(ln))) cur = { s: +m[1] }; if ((m = /silence_end: ([\d.]+)/.exec(ln)) && cur) { cur.e = +m[1]; sil.push(cur); cur = null; } } if (cur) { cur.e = N / SR; sil.push(cur); }
let isl = []; let t = 0; sil.forEach(s => { if (s.s > t + 0.01) isl.push({ s: t, e: s.s }); t = s.e; }); if (t < N / SR - 0.01) isl.push({ s: t, e: N / SR });
isl = isl.filter(x => x.e - x.s >= 0.06);   // drop <60 ms blips (tail noise), they are not speech
const rep = { video: name, master: path.relative(L.ROOT, master), masterSha256: crypto.createHash('sha256').update(fs.readFileSync(master)).digest('hex'), totalSamples: N, sampleRate: SR, method: 'explicit sample partitions from independent timing handoff; islands from silencedetect -38 dB / 120 ms; no fades, no resampling, no time-stretch', cues: [], marks: {} };
const recon = new Int16Array(N); let maxEdge = 0;
P.forEach(([a, b], i) => {
  const cue = man.cues[i], seg = pcm.slice(a, b); recon.set(seg, a);
  const wav = Buffer.alloc(44 + seg.length * 2); wav.write('RIFF', 0); wav.writeUInt32LE(36 + seg.length * 2, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(seg.length * 2, 40); Buffer.from(seg.buffer, seg.byteOffset, seg.byteLength).copy(wav, 44);
  const out = path.join(L.ROOT, cue.file); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, wav);
  const a0 = a / SR, b0 = b / SR, mine = isl.filter(x => x.e > a0 && x.s < b0).map(x => ({ s: +(Math.max(x.s, a0) - a0).toFixed(3), e: +(Math.min(x.e, b0) - a0).toFixed(3) }));
  const edge = Math.max(Math.abs(seg[0]), Math.abs(seg[seg.length - 1])); maxEdge = Math.max(maxEdge, edge);
  const act = mine.length ? [mine[0].s, mine[mine.length - 1].e] : [0, (b - a) / SR], hs = (spec.handoffActivity || [])[i];
  rep.cues.push({ id: cue.id, text: cue.text, file: cue.file, sourceSampleRange: [a, b], sourceStart: +a0.toFixed(6), sourceEnd: +b0.toFixed(6), seconds: +((b - a) / SR).toFixed(6), padHead: hs ? +(hs[0] - a0).toFixed(3) : act[0], padTail: hs ? +(b0 - hs[1]).toFixed(3) : +(((b - a) / SR) - act[1]).toFixed(3), islandsInCue: mine,
    activityInCue: act, handoffActivitySource: hs || null, activityVsHandoffMs: hs ? [Math.round((a0 + act[0] - hs[0]) * 1000), Math.round((a0 + act[1] - hs[1]) * 1000)] : null, edgeSampleAbs: [Math.abs(seg[0]), Math.abs(seg[seg.length - 1])] });
});
if (spec.marks) Object.entries(spec.marks).forEach(([k, [cid, idx]]) => { const c = rep.cues.find(x => x.id === cid); rep.marks[cid] = rep.marks[cid] || {}; rep.marks[cid][k] = c.islandsInCue[idx].s; });
let diff = 0; for (let i = 0; i < N; i++) if (recon[i] !== pcm[i]) diff++;
rep.coverage = { partitionSamples: P.reduce((s, [a, b]) => s + (b - a), 0), totalSamples: N, reconstructedDifferingSamples: diff, allSamplesRetainedOnce: diff === 0 && P.reduce((s, [a, b]) => s + (b - a), 0) === N, maxAbsSampleAtAnyCut: maxEdge };
rep.confidence = { phraseBoundaries: 'authoritative sample cuts from handoff (silence midpoints)', islands: 'measured from waveform (-38 dB); not a linguistic detector', wordLevel: 'not measured', content: 'pronunciation/content NOT verified (no listening)' };
fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.alignment.json`), JSON.stringify(rep, null, 2));
console.log(JSON.stringify({ coverage: rep.coverage, cues: rep.cues.map(c => `${c.id} ${c.seconds}s islands=${c.islandsInCue.length} act=${c.activityInCue} vsHandoffMs=${c.activityVsHandoffMs}`), marks: rep.marks }, null, 1)); process.exit(rep.coverage.allSamplesRetainedOnce ? 0 : 3);
