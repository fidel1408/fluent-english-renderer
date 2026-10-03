#!/usr/bin/env node
// node build/retime.js <video>  -> measures supplied narration files and rewrites cue times + total duration from the REAL durations.
// Audio is never sped up, trimmed or cut. Missing cues keep their estimate (status PARTIAL_AUDIO).
const fs = require('fs'), path = require('path'); const L = require('./lib');
const name = process.argv[2] || 'i_agree', m = L.loadManifest(name, false); delete m.sfx;
let found = 0; const measured = {};
m.cues.forEach(q => { const f = L.findCueAudio(m, q); if (f) { found++; measured[q.id] = { f, d: L.probeDuration(f) }; } });
L.layout(m, q => measured[q.id] ? measured[q.id].d : q.est);
m.cues.forEach(q => { if (measured[q.id]) { q.audio = path.relative(L.ROOT, measured[q.id].f); q.audioSeconds = +measured[q.id].d.toFixed(3); } });
const alF = path.join(L.ROOT, 'manifest', `${name}.alignment.json`), al = fs.existsSync(alF) ? JSON.parse(fs.readFileSync(alF, 'utf8')) : null;
if (al) m.cues.forEach(q => { const a = al.cues.find(x => x.id === q.id); if (a && q.audioSeconds && Math.abs(a.seconds - q.audioSeconds) < .01) { q.padHead = a.padHead; q.padTail = a.padTail; q.cs = +(q.start + a.padHead).toFixed(3); q.ce = +(q.end - a.padTail).toFixed(3); q.marks = (al.marks || {})[q.id] || {}; q.islands = a.islandsInCue; } });
m.alignmentSource = al ? { file: path.relative(L.ROOT, alF), master: al.master, masterSha256: al.masterSha256, method: al.method, confidence: al.confidence } : null;
m.status = found === m.cues.length ? 'TIMED_FROM_SUPPLIED_AUDIO' : (found ? 'PARTIAL_AUDIO' : 'PLANNED_TIMING_NO_AUDIO');
const [lo, hi] = m.targetSeconds, warn = []; if (m.duration < lo - 1 || m.duration > hi + 1) warn.push(`duration ${m.duration}s is outside the target ${lo}-${hi}s (not forced; review pacing/pauses with the owner)`);
m.warnings = warn;
// auditable source-to-final edit map: video_time(source_time) = final_cue_start + source_time - source_partition_start
// Precision rules: durations are derived from SAMPLE COUNTS (never from summed millisecond-rounded cue seconds); the full master duration is kept separate
// from the retained-cue duration; cut endpoints are called exact only when they are explicit integer sample partitions.
if (found && al) {
  const SRr = al.sampleRate || 44100, cp = require('child_process');
  const wavSamples = f => (fs.statSync(f).size - 44) / 2;      // PCM16 mono WAV written by this pipeline (44-byte header)
  const masterSamples = al.totalSamples || (cp.execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(L.ROOT, al.master), '-ac', '1', '-ar', String(SRr), '-f', 's16le', '-'], { maxBuffer: 1 << 28 }).length / 2);
  const rows = m.cues.map(q => { const a = al.cues.find(x => x.id === q.id), exact = !!a.sourceSampleRange, wavN = wavSamples(path.join(L.ROOT, q.audio));
    const sr = exact ? a.sourceSampleRange : [Math.round(a.masterStart * SRr), Math.round(a.masterEnd * SRr)];
    return { q, exact, wavN, sr }; });
  const retained = rows.reduce((s2, r) => s2 + r.wavN, 0), allExact = rows.every(r => r.exact);
  const map = { video: name, formula: 'video_time(source_time) = cue.finalStart + source_time - cue.sourceStart', masterFile: al.master, masterSha256: al.masterSha256, sampleRate: SRr,
    fullMasterSamples: masterSamples, fullMasterSeconds: +(masterSamples / SRr).toFixed(9),
    retainedCueSamples: retained, retainedCueSeconds: +(retained / SRr).toFixed(9), masterSamplesNotInAnyCue: masterSamples - retained,
    finalDurationSeconds: m.duration, addedSilenceSeconds: +(m.duration - retained / SRr).toFixed(6), lead: m.lead, endHold: m.endHold,
    cutEndpoints: allExact ? 'EXACT integer sample partitions (contiguous; every source sample retained exactly once)' : 'APPROXIMATE: derived from rounded times (silence-padded cuts with 8 ms fades inside silence). Cue WAVs retain every speech sample bit-exactly (verified in the alignment report), but endpoints are NOT sample-exact partitions and differ from the actual cue WAV lengths by the amounts listed per cue.',
    note: 'Speech is never sped up, trimmed or cut. Only silence is added (lead, per-cue gaps, end hold).',
    cues: rows.map(({ q, exact, wavN, sr }) => ({ id: q.id, text: q.text, caption: q.caption || q.text, cueFile: q.audio, cueWavSamples: wavN, [exact ? 'sourceSampleRange' : 'sourceSampleRangeApprox']: sr, rangeLengthMinusWavSamples: (sr[1] - sr[0]) - wavN, sourceStartSeconds: +(sr[0] / SRr).toFixed(6), sourceEndSeconds: +(sr[1] / SRr).toFixed(6), finalStart: q.start, finalEnd: q.end, offsetSeconds: +(q.start - sr[0] / SRr).toFixed(6), gapBeforeAdded: q.gap, speechActivityFinal: [q.cs, q.ce] })) };
  fs.mkdirSync(path.join(L.ROOT, 'qa'), { recursive: true }); fs.writeFileSync(path.join(L.ROOT, 'qa', `${name}_source_to_final_edit_map.json`), JSON.stringify(map, null, 2));
}
if (found) fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.retimed.json`), JSON.stringify(m, null, 2));
console.log(`${found}/${m.cues.length} cue files -> ${m.status}; total ${m.duration}s`); m.cues.forEach(q => console.log(`  ${q.id} ${q.start.toFixed(2)}-${q.end.toFixed(2)}${q.audioSeconds ? ' (' + q.audioSeconds + 's audio)' : ' (estimate)'}`)); warn.forEach(w => console.log('  WARNING', w));
