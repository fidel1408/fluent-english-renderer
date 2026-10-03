#!/usr/bin/env node
// node build/retime.js i_agree  -> measures supplied narration files and writes manifest/i_agree.cues.retimed.json
const fs = require('fs'), path = require('path'); const L = require('./lib');
const name = process.argv[2] || 'i_agree', m = L.loadManifest(name, false);
const winEnd = id => m.scenes[m.cues.find(c => c.id === id).scene][1];
let prevEnd = 0, found = 0, problems = [];
const out = JSON.parse(JSON.stringify(m)); out.cues = m.cues.map(q => {
  const f = L.findCueAudio(m, q); if (!f) { prevEnd = Math.max(prevEnd, q.end); return { ...q, audio: null }; }
  found++; const d = L.probeDuration(f), start = Math.max(q.start, prevEnd + .12), end = +(start + d).toFixed(3);
  const limit = q.scene === 'practice' && q.id === 'c09' ? m.duration - .35 : winEnd(q.id);
  if (end > limit + 1e-6) problems.push(`${q.id}: ${d.toFixed(2)} s of audio starting ${start.toFixed(2)} ends ${end.toFixed(2)} > window limit ${limit.toFixed(2)} (shorten the read or widen the scene; audio is never sped up)`);
  prevEnd = end; return { ...q, start: +start.toFixed(3), end, audio: path.relative(L.ROOT, f), audioSeconds: +d.toFixed(3) };
});
out.status = found === m.cues.length ? (problems.length ? 'AUDIO_DOES_NOT_FIT' : 'TIMED_FROM_SUPPLIED_AUDIO') : (found ? 'PARTIAL_AUDIO' : 'PLANNED_TIMING_NO_AUDIO');
out.problems = problems;
if (found) { fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.retimed.json`), JSON.stringify(out, null, 2)); }
console.log(`${found}/${m.cues.length} cue files found -> ${out.status}`); problems.forEach(p => console.log('  PROBLEM', p));
process.exit(problems.length ? 2 : 0);
