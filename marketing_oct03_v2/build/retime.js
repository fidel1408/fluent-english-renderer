#!/usr/bin/env node
// node build/retime.js <video>  -> measures supplied narration files and rewrites cue times + total duration from the REAL durations.
// Audio is never sped up, trimmed or cut. Missing cues keep their estimate (status PARTIAL_AUDIO).
const fs = require('fs'), path = require('path'); const L = require('./lib');
const name = process.argv[2] || 'i_agree', m = L.loadManifest(name, false); delete m.sfx;
let found = 0; const measured = {};
m.cues.forEach(q => { const f = L.findCueAudio(m, q); if (f) { found++; measured[q.id] = { f, d: L.probeDuration(f) }; } });
L.layout(m, q => measured[q.id] ? measured[q.id].d : q.est);
m.cues.forEach(q => { if (measured[q.id]) { q.audio = path.relative(L.ROOT, measured[q.id].f); q.audioSeconds = +measured[q.id].d.toFixed(3); } });
m.status = found === m.cues.length ? 'TIMED_FROM_SUPPLIED_AUDIO' : (found ? 'PARTIAL_AUDIO' : 'PLANNED_TIMING_NO_AUDIO');
const [lo, hi] = m.targetSeconds, warn = []; if (m.duration < lo - 1 || m.duration > hi + 1) warn.push(`duration ${m.duration}s is outside the target ${lo}-${hi}s (not forced; review pacing/pauses with the owner)`);
m.warnings = warn;
if (found) fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.retimed.json`), JSON.stringify(m, null, 2));
console.log(`${found}/${m.cues.length} cue files -> ${m.status}; total ${m.duration}s`); m.cues.forEach(q => console.log(`  ${q.id} ${q.start.toFixed(2)}-${q.end.toFixed(2)}${q.audioSeconds ? ' (' + q.audioSeconds + 's audio)' : ' (estimate)'}`)); warn.forEach(w => console.log('  WARNING', w));
