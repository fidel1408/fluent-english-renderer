#!/usr/bin/env node
// node build/holds_plan.js <video>...  -> source-side check: every declared settled hold in the timeline plan meets its minimum duration.
const L = require('./lib'); let bad = 0;
for (const name of process.argv.slice(2)) { const m = L.loadManifest(name), { K } = L.plan(name, m.cues);
  K.holds.forEach(h => { const to = h.to === null ? m.duration : h.to, d = to - h.from, ok = d >= h.min; if (!ok) bad++; console.log(`${name} ${h.id}: ${h.from.toFixed(2)}-${to.toFixed(2)} = ${d.toFixed(2)} s (min ${h.min}) ${ok ? 'OK' : 'FAIL'}`); }); K.scenes.forEach((sc, i) => { const nx = K.scenes[i + 1]; if (nx) { const ok = nx.in >= sc.end - 1e-6; if (!ok) bad++; console.log(`${name} scene ${sc.id} ends ${sc.end.toFixed(2)} -> ${nx.id} starts ${nx.in.toFixed(2)} ${ok ? 'sequential OK' : 'OVERLAP FAIL'}`); } }); console.log(name, 'duration', m.duration); }
process.exit(bad ? 1 : 0);
