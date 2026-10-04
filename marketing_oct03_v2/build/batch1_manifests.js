#!/usr/bin/env node
// node build/batch1_manifests.js   (October batch 1: CANHAVE / BORROW / SCHEDULE)
// Writes manifest/<video>.cues.json for the three supplied take-2 masters. Phrase boundaries are NOT guessed from the script text alone:
// speech islands are measured from the real waveform (ffmpeg silencedetect -38 dB, >=120 ms, islands <60 ms dropped, same rule as partition_split.js);
// each cue is declared as a group of consecutive islands; the run FAILS if the measured island count differs from the declared structure.
// Cuts = integer sample midpoints of the silence between the last island of one cue and the first island of the next (contiguous, every sample once).
// No speech recognition exists offline here, so the mapping island-group -> script phrase rests on the script's pause structure + island counts/durations
// (reported as structural confidence, NOT verified by listening).
const fs = require('fs'), path = require('path'), cp = require('child_process'), L = require('./lib'); const SR = 44100;
const V = {
  can_have: { id: 'FE261012-CANHAVE', title: 'CAN I HAVE', master: 'audio/originals/can_have_take2.mp3', lead: .4, endHold: 3.4, target: [25, 35], total: 10,
    cues: [
      { id: 'c01', text: 'Una frase para practicar en casa.', g: [0], gap: 0 },
      { id: 'c02', text: 'Can I have some water, please?', g: [1], gap: .3 },
      { id: 'c03', text: '¿Me das un poco de agua, por favor?', g: [2], gap: .3 },
      { id: 'c04', text: 'Here you go.', g: [3], gap: .3 },
      { id: 'c05', text: 'Aquí tienes.', g: [4], gap: .1 },
      { id: 'c06', text: 'Ahora cambia water por juice.', g: [5, 6, 7], gap: 1.2 },
      { id: 'c07', text: 'Mamás y papás: manden NIÑOS por mensaje privado.', g: [8, 9], gap: 2.9 }],
    marks: { porStart: ['c06', 1], juiceStart: ['c06', 2], mandenStart: ['c07', 1] } },
  borrow_lend: { id: 'FE261014-BORROW', title: 'BORROW / LEND', master: 'audio/originals/borrow_lend_take2.mp3', lead: .4, endHold: 3.6, target: [25, 35], total: 16,
    cues: [
      { id: 'c01', text: '¿Te presto o me prestas?', g: [0, 1], gap: 0 },
      { id: 'c02', text: 'Can I borrow your pen?', g: [2], gap: .2 },
      { id: 'c03', text: '¿Me prestas tu pluma?', g: [3], gap: .2 },
      { id: 'c04', text: 'Borrow: recibir algo prestado.', g: [4, 5], gap: .2 },
      { id: 'c05', text: 'I can lend you my pen.', g: [6], gap: 1.5 },
      { id: 'c06', text: 'Te puedo prestar mi pluma.', g: [7], gap: .2 },
      { id: 'c07', text: 'Lend: prestar a otra persona.', g: [8, 9], gap: .2 },
      { id: 'c08', text: 'Ahora tú: Can I... your charger? ¿Qué palabra falta?', caption: 'Ahora tú: Can I… your charger? ¿Qué palabra falta?', g: [10, 11, 12, 13], gap: 1.4 },
      { id: 'c09', text: 'Clases en línea: manda GRUPO por mensaje privado.', g: [14, 15], gap: 2.9 }],
    marks: { recibirStart: ['c04', 1], prestarStart: ['c07', 1], canIStart: ['c08', 1], yourChargerStart: ['c08', 2], queStart: ['c08', 3], mandaStart: ['c09', 1] } },
  schedule_options: { mixGainDb: -3.0, id: 'FE261016-SCHEDULE', title: 'SCHEDULE OPTIONS', master: 'audio/originals/schedule_options_take2.mp3', lead: .4, endHold: 3.4, target: [25, 35], total: 6,
    cues: [
      { id: 'c01', text: '¿Una hora entre semana o un bloque de fin de semana?', g: [0], gap: 0 },
      { id: 'c02', text: 'Para grupos y Speaking Club hay opciones de lunes a viernes, sábado o domingo.', g: [1, 2], gap: .4 },
      { id: 'c03', text: 'Todos los horarios son de Monterrey.', g: [3], gap: 3.2 },
      { id: 'c04', text: 'Speaking Club es para intermedios y avanzados.', g: [4], gap: .3 },
      { id: 'c05', text: 'Manda HORARIO por privado y cuéntanos qué opción prefieres.', g: [5], gap: .8 }],
    marks: { afterPause: ['c02', 1] } },
};
for (const [name, v] of Object.entries(V)) {
  const master = path.join(L.ROOT, v.master);
  const raw = cp.execFileSync('ffmpeg', ['-v', 'error', '-i', master, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 28 }), N = raw.length / 2;
  const so = cp.spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', master, '-af', 'silencedetect=n=-38dB:d=0.12', '-f', 'null', '-']).stderr.toString(); const sil = []; let cur = null;
  for (const ln of so.split('\n')) { let m; if ((m = /silence_start: ([\d.]+)/.exec(ln))) cur = { s: +m[1] }; if ((m = /silence_end: ([\d.]+)/.exec(ln)) && cur) { cur.e = +m[1]; sil.push(cur); cur = null; } } if (cur) { cur.e = N / SR; sil.push(cur); }
  let isl = [], t = 0; sil.forEach(s => { if (s.s > t + .01) isl.push({ s: t, e: s.s }); t = s.e; }); if (t < N / SR - .01) isl.push({ s: t, e: N / SR }); isl = isl.filter(x => x.e - x.s >= .06);
  if (isl.length !== v.total) throw new Error(`${name}: measured ${isl.length} speech islands, declared structure has ${v.total}`);
  const used = v.cues.flatMap(q => q.g); if (used.join() !== [...Array(v.total).keys()].join()) throw new Error(name + ': cue groups must cover islands in order');
  const parts = []; let prev = 0;
  v.cues.forEach((q, i) => { const last = isl[q.g[q.g.length - 1]], next = v.cues[i + 1] ? isl[v.cues[i + 1].g[0]] : null; const end = next ? Math.round(((last.e + next.s) / 2) * SR) : N; parts.push([prev, end]); prev = end; });
  const man = { video: name, contentId: v.id, title: v.title, fps: 30, lead: v.lead, endHold: v.endHold, targetSeconds: v.target, status: 'PLANNED', ...(v.mixGainDb ? { mixGainDb: v.mixGainDb } : {}),
    note: 'Cue times are COMPUTED from sample partitions of the supplied take-2 master + added silence (gap). Only silence is ever added; speech is never sped up, trimmed or cut. Phrase boundaries come from measured silences in this build; mapping to script phrases is structural, corroborated by independent ASR evidence, and unverified by ear. Take 2 is a provisional longer alternative selected during production (not an owner audition or owner selection).',
    cues: v.cues.map((q, i) => ({ id: q.id, who: 'narrator', lang: 'es+en', capFit: true, text: q.text, ...(q.caption ? { caption: q.caption } : {}), est: +((parts[i][1] - parts[i][0]) / SR).toFixed(3), gap: q.gap, file: `audio/cues/${name}_${q.id}.wav` })),
    alignment: { method: 'cut positions derived by this build from the waveform: integer sample midpoints of measured silences (silencedetect -38 dB, >= 120 ms) between declared groups of speech islands; NOT an externally supplied sample-cut handoff', confidence: { phraseBoundaries: 'waveform-derived cuts from this build (silence midpoints); mapping island group -> script phrase is structural. Independent faster-whisper small/medium ASR (supplied later, see manifest/batch1_inputs/asr_handoff) corroborates the broad phrase assignment; ASR is not listening and does not prove pronunciation or naturalness', islands: 'measured from waveform (-38 dB); not a linguistic detector', wordLevel: 'not measured by this build; ASR word estimates carry model uncertainty (por/for code-switch disagreement in medium CanHave)', content: 'pronunciation/naturalness NOT verified (no listening)' }, totalSamples: N, partitions: parts, islandsMeasured: isl.map(x => [+x.s.toFixed(3), +x.e.toFixed(3)]), islandGroups: v.cues.map(q => q.g), marks: v.marks } };
  fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.json`), JSON.stringify(man, null, 2));
  console.log(name, 'islands', isl.map(x => x.s.toFixed(2) + '-' + x.e.toFixed(2)).join(' '), '\n  partitions', parts.map(p => p.join('-')).join(' '));
}
