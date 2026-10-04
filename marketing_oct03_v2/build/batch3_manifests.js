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
  since_for: { id: 'FE261026-SINCEFOR', title: 'SINCE / FOR', master: 'audio/originals/since_for_take1.mp3', lead: .6, endHold: 3.5, target: [25, 40], total: 17,
    cues: [
      { id: 'c01', text: 'Esto empezó antes y sigue ahora.', g: [0], gap: 0 },
      { id: 'c02', text: 'I’ve lived here for two years.', g: [1], gap: .77 },
      { id: 'c03', text: 'For indica duración:', g: [2, 3], gap: .1 },
      { id: 'c04', text: 'two years.', g: [4], gap: .1 },
      { id: 'c05', text: 'I’ve lived here since twenty twenty-four.', g: [5], gap: .95 },
      { id: 'c06', text: 'Since señala cuándo empezó:', g: [6, 7, 8], gap: .1 },
      { id: 'c07', text: 'twenty twenty-four.', g: [9], gap: .1 },
      { id: 'c08', text: 'Ahora tú:', g: [10], gap: .68 },
      { id: 'c09', text: 'I’ve studied English… six months.', g: [11, 12], gap: .1 },
      { id: 'c10', text: '¿Since o for?', g: [13, 14], gap: .1 },
      { id: 'c11', text: 'Clases en línea:', g: [15], gap: 3.5 },
      { id: 'c12', text: 'manda GRUPO por mensaje privado.', g: [16], gap: .2 }],
    marks: { forStart: ['c03', 0], durStart: ['c03', 1], sinceStart: ['c06', 0] }, anchors: {} },
  used_to: { mixGainDb: -0.6, id: 'FE261028-USED', title: 'USED TO', master: 'audio/originals/used_to_take2.mp3', lead: .6, endHold: 3.5, target: [25, 40], total: 14,
    cues: [
      { id: 'c01', text: 'Piensa en algo que hacías antes.', g: [0], gap: 0 },
      { id: 'c02', text: 'I used to play soccer after school.', g: [1], gap: .7 },
      { id: 'c03', text: 'Antes jugaba fútbol después de la escuela.', g: [2], gap: .1 },
      { id: 'c04', text: 'Para un hábito de antes que ya cambió,', g: [3], gap: .39 },
      { id: 'c05', text: 'usa used to más verbo base: play.', g: [4, 5, 6, 7], gap: .1 },
      { id: 'c06', text: 'Ahora tú:', g: [8], gap: 3.4 },
      { id: 'c07', text: 'I used to…', g: [9], gap: .1 },
      { id: 'c08', text: '¿Cómo completarías la frase?', g: [10], gap: .1 },
      { id: 'c09', text: 'Clases en línea:', g: [11], gap: 3.3 },
      { id: 'c10', text: 'manda GRUPO por mensaje privado.', g: [12, 13], gap: .2 }],
    marks: { usedToStart: ['c05', 1], playStart: ['c05', 3] }, anchors: {} },
  trial_faq: { mixGainDb: -1.3, id: 'FE261030-TRIALFAQ', title: 'TRIAL FAQ', master: 'audio/originals/trial_faq_take2.mp3', lead: .6, endHold: 3.5, target: [25, 40], total: 8,
    cues: [
      { id: 'c01', text: '¿Qué pasa después de la semana de prueba?', g: [0], gap: 0 },
      { id: 'c02', text: 'En grupos y Speaking Club pruebas la primera semana sin pagar por adelantado.', g: [1], gap: .75 },
      { id: 'c03', text: 'Si no continúas, no pagas.', g: [2, 3], gap: .1 },
      { id: 'c04', text: 'Si continúas, el pago cubre las cuatro semanas completas, incluida la primera.', g: [4], gap: .9 },
      { id: 'c05', text: 'Consulta los precios en la descripción.', g: [5], gap: 2.7 },
      { id: 'c06', text: 'Manda GRUPO o CLUB por privado.', g: [6, 7], gap: 3.45 }],
    marks: { noPayStart: ['c03', 1] }, anchors: { fourWeeks: 11.2, week1: 13.0 } },
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
    ...(v.cues.some(q => q.captionStatus) ? {} : {}), note: 'Cue times are COMPUTED from sample partitions of the supplied take-2 master + added silence (gap). Only silence is ever added; speech is never sped up, trimmed or cut. Phrase boundaries come from measured silences in this build; mapping to script phrases is structural, corroborated by independent ASR evidence, and unverified by ear. Take choice (since_for take1, used_to take2, trial_faq take2) is a provisional editorial choice from independent ASR/pause measurements (not an audition). ASR word times are NOT used as cut instructions.',
    cues: v.cues.map((q, i) => ({ id: q.id, who: 'narrator', lang: 'es+en', capFit: true, ...(q.captionStatus ? { captionStatus: q.captionStatus } : {}), text: q.text, ...(q.caption ? { caption: q.caption } : {}), est: +((parts[i][1] - parts[i][0]) / SR).toFixed(3), gap: q.gap, file: `audio/cues/${name}_${q.id}.wav` })),
    alignment: { anchors: v.anchors, method: 'cut positions derived by this build from the waveform: integer sample midpoints of measured silences (silencedetect -38 dB, >= 120 ms) between declared groups of speech islands; NOT an externally supplied sample-cut handoff', confidence: { phraseBoundaries: 'waveform-derived cuts from this build (silence midpoints); mapping island group -> script phrase is structural. Independent faster-whisper small/medium ASR (supplied with batch 2, see manifest/batch3_inputs) corroborates the broad phrase assignment; ASR is not listening and does not prove pronunciation or naturalness', islands: 'measured from waveform (-38 dB); not a linguistic detector', wordLevel: 'not measured by this build; ASR word estimates carry model uncertainty (por/for code-switch disagreement in medium CanHave)', content: 'pronunciation/naturalness NOT verified (no listening)' }, totalSamples: N, partitions: parts, islandsMeasured: isl.map(x => [+x.s.toFixed(3), +x.e.toFixed(3)]), islandGroups: v.cues.map(q => q.g), marks: v.marks } };
  fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.json`), JSON.stringify(man, null, 2));
  console.log(name, 'islands', isl.map(x => x.s.toFixed(2) + '-' + x.e.toFixed(2)).join(' '), '\n  partitions', parts.map(p => p.join('-')).join(' '));
}
