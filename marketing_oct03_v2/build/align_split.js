#!/usr/bin/env node
// node build/align_split.js i_agree audio/originals/<master>.mp3
// Phrase-level alignment of a continuous narration master from the REAL waveform (no ASR model is available offline):
//  1) decode master -> PCM, find speech islands with ffmpeg silencedetect (-38 dB, >=120 ms pauses)
//  2) group islands into the known script phrases (explicit, validated island count + syllable-rate plausibility)
//  3) cut ONLY inside silences (pad <= 180 ms, never beyond half the pause), 8 ms edge fades, write one WAV per cue
//  4) prove nothing was lost: every sample of every speech island is reproduced exactly by the cue files.
// Word-level boundaries are NOT claimed except pauses that exist in the audio (see marks + confidence in the JSON).
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'); const L = require('./lib');
const [name, masterRel] = [process.argv[2], process.argv[3]]; const master = path.resolve(L.ROOT, masterRel), SR = 44100, TH = -38, MIN = 0.12, FADE = Math.round(0.008 * SR);
const raw = cp.execFileSync('ffmpeg', ['-v', 'error', '-i', master, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 28 }); const pcm = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2), N = pcm.length, dur = N / SR;
const so = cp.spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', master, '-af', `silencedetect=n=${TH}dB:d=${MIN}`, '-f', 'null', '-']).stderr.toString();
const sil = []; let cur = null; for (const ln of so.split('\n')) { let m; if ((m = /silence_start: ([\d.]+)/.exec(ln))) cur = { s: +m[1] }; if ((m = /silence_end: ([\d.]+)/.exec(ln)) && cur) { cur.e = +m[1]; sil.push(cur); cur = null; } } if (cur) { cur.e = dur; sil.push(cur); }
const isl = []; let t = 0; sil.forEach(s => { if (s.s > t + 0.02) isl.push({ s: t, e: s.s }); t = s.e; }); if (t < dur - 0.02) isl.push({ s: t, e: dur });
const man = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.json`))), spec = man.alignment; if (!spec) throw new Error('manifest has no "alignment" spec');
if (isl.length !== spec.islandCount) { console.error(`FAIL: found ${isl.length} speech islands, script expects ${spec.islandCount}. Not guessing; aborting.`); process.exit(2); }
const groups = spec.groups, cues = man.cues; if (groups.length !== cues.length) throw new Error('groups/cues mismatch');
// plausibility: seconds of speech per syllable per phrase should be within 2x of the median
const rate = groups.map((g, i) => { const sp = g.reduce((a, k) => a + (isl[k].e - isl[k].s), 0); return sp / spec.syllables[i]; }); const med = [...rate].sort((a, b) => a - b)[Math.floor(rate.length / 2)];
const odd = rate.map((r, i) => (r > 2 * med || r < med / 2) ? cues[i].id : null).filter(Boolean);
const rep = { video: name, master: path.relative(L.ROOT, master), masterSha256: crypto.createHash('sha256').update(fs.readFileSync(master)).digest('hex'), masterSeconds: +dur.toFixed(4), method: `waveform silencedetect ${TH} dB / ${MIN * 1000} ms + explicit script grouping; no ASR/forced aligner available (model hosts unreachable)`,
  islands: isl.map(x => ({ s: +x.s.toFixed(3), e: +x.e.toFixed(3) })), cues: [], rateSecPerSyllable: rate.map(r => +r.toFixed(3)), rateOutliers: odd };
const cover = new Int8Array(N); const recon = new Int16Array(N);
groups.forEach((g, i) => {
  const first = isl[g[0]], last = isl[g[g.length - 1]], prevE = i ? isl[groups[i - 1][groups[i - 1].length - 1]].e : 0, nextS = i < groups.length - 1 ? isl[groups[i + 1][0]].s : dur;
  const padH = i ? Math.min(0.18, (first.s - prevE) / 2) : Math.min(0.18, first.s), padT = i < groups.length - 1 ? Math.min(0.18, (nextS - last.e) / 2) : Math.min(0.18, dur - last.e);
  const a = Math.max(0, Math.round((first.s - padH) * SR)), b = Math.min(N, Math.round((last.e + padT) * SR)), seg = pcm.slice(a, b);
  for (let k = 0; k < FADE && k < seg.length; k++) { const f = k / FADE; seg[k] = Math.round(seg[k] * f); seg[seg.length - 1 - k] = Math.round(seg[seg.length - 1 - k] * f); }
  for (let k = a; k < b; k++) { recon[k] = seg[k - a]; cover[k] = 1; }
  const wav = Buffer.alloc(44 + seg.length * 2); wav.write('RIFF', 0); wav.writeUInt32LE(36 + seg.length * 2, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(seg.length * 2, 40); Buffer.from(seg.buffer, seg.byteOffset, seg.byteLength).copy(wav, 44);
  const out = path.join(L.ROOT, cues[i].file); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, wav);
  const off = x => +(x - a / SR).toFixed(3);
  rep.cues.push({ id: cues[i].id, text: cues[i].text, file: cues[i].file, masterStart: +(a / SR).toFixed(3), masterEnd: +(b / SR).toFixed(3), padHead: +padH.toFixed(3), padTail: +padT.toFixed(3), seconds: +((b - a) / SR).toFixed(3),
    islandsInCue: g.map(k => ({ s: off(isl[k].s), e: off(isl[k].e) })), internalPausesSec: g.slice(1).map((k, j) => +(isl[k].s - isl[g[j]].e).toFixed(3)) });
});
// exactness proof: every sample inside every speech island is reproduced bit-exactly (islands are away from the faded edges by >= pad)
let bad = 0, checked = 0; isl.forEach(x => { for (let k = Math.round(x.s * SR); k < Math.min(N, Math.round(x.e * SR)); k++) { checked++; if (!cover[k] || recon[k] !== pcm[k]) bad++; } });
rep.speechSamplesChecked = checked; rep.speechSamplesDifferent = bad; rep.allSpeechPreserved = bad === 0;
// marks (seconds from cue-file start). Only pauses that really exist in the audio are used.
const c = id => rep.cues.find(x => x.id === id); const marks = {};
if (spec.marks) Object.entries(spec.marks).forEach(([k, [cid, islandInCue]]) => { marks[cid] = marks[cid] || {}; marks[cid][k] = c(cid).islandsInCue[islandInCue].s; });
rep.marks = marks; rep.confidence = { phraseBoundaries: odd.length ? 'CHECK: rate outliers ' + odd.join(',') : 'good (pause structure + 15/15 islands + plausible syllable rates)', wordLevel: 'not measured', content: 'speech content/pronunciation NOT verified (no ASR; no listening)' };
fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.alignment.json`), JSON.stringify(rep, null, 2));
console.log(JSON.stringify({ islands: isl.length, rateOutliers: odd, allSpeechPreserved: rep.allSpeechPreserved, speechSamplesChecked: checked, cues: rep.cues.map(x => `${x.id} ${x.seconds}s pads ${x.padHead}/${x.padTail} pauses ${x.internalPausesSec}`) }, null, 1));
process.exit(rep.allSpeechPreserved ? 0 : 3);
