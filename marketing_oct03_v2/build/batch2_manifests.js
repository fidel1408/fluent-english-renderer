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
  clarify_deadline: { mixGainDb: -0.4, id: 'FE261019-CLARIFY', title: 'CLARIFY THE DEADLINE', master: 'audio/originals/clarify_deadline_take1.mp3', lead: .6, endHold: 3.5, target: [25, 35], total: 12,
    cues: [
      { id: 'c01', text: '¿Necesitas que te aclaren una fecha?', g: [0], gap: 0 },
      { id: 'c02', text: 'Could you clarify the deadline?', g: [1], gap: .75 },
      { id: 'c03', text: '¿Podrías aclarar la fecha límite?', g: [2], gap: .1 },
      { id: 'c04', text: 'Para confirmar:', g: [3], gap: .35 },
      { id: 'c05', text: 'Do you mean this Friday?', g: [4], gap: .1 },
      { id: 'c06', text: '¿Te refieres a este viernes?', g: [5], gap: .1 },
      { id: 'c07', text: 'Ahora cambia the deadline por the next step.', captionStatus: 'PROVISIONAL: the intended Spanish copy says "por"; independent ASR (small+medium full-file take1, medium es-constrained spans) writes "for" around source 14.2-15.2 s. Not established as a spoken defect (code-switch recognition is possible) and not cleared by listening. Caption keeps the script word until a human listens.', g: [6, 7, 8], gap: .35 },
      { id: 'c08', text: 'Clases en línea para tu equipo:', g: [9], gap: 3.9 },
      { id: 'c09', text: 'manda EMPRESA por mensaje privado.', g: [10, 11], gap: .2 }],
    marks: { porStart: ['c07', 1], nextStart: ['c07', 2] }, anchors: {} },
  tell_me_more: { mixGainDb: -1.5, id: 'FE261021-MORE', title: 'TELL ME MORE', master: 'audio/originals/tell_me_more_take1.mp3', lead: .6, endHold: 3.5, target: [25, 36], total: 15,
    cues: [
      { id: 'c01', text: '¿Y después de That’s nice?', g: [0, 1], gap: 0 },
      { id: 'c02', text: 'I tried a new restaurant.', g: [2], gap: .9 },
      { id: 'c03', text: 'Oh, nice! What was it like?', g: [3], gap: 2.05 },
      { id: 'c04', text: '¿Cómo estuvo?', g: [4], gap: .1 },
      { id: 'c05', text: 'También puedes decir:', g: [5], gap: .55 },
      { id: 'c06', text: 'Tell me more about it.', g: [6], gap: .1 },
      { id: 'c07', text: 'Cuéntame más.', g: [7], gap: .1 },
      { id: 'c08', text: 'Ahora tú:', g: [8], gap: .5 },
      { id: 'c09', text: 'I watched a movie last night.', g: [9], gap: .1 },
      { id: 'c10', text: '¿Qué preguntarías después?', g: [10], gap: .1 },
      { id: 'c11', text: 'Speaking Club para intermedios y avanzados:', g: [11], gap: 3.4 },
      { id: 'c12', text: 'manda CLUB por mensaje privado.', g: [12, 13, 14], gap: .2 }],
    marks: {}, anchors: {} },
  private_company: { mixGainDb: -0.5, id: 'FE261023-PRIVATE', title: 'PRIVATE / COMPANY', master: 'audio/originals/private_company_take1.mp3', lead: .6, endHold: 3.5, target: [25, 35], total: 11,
    cues: [
      { id: 'c01', text: '¿Buscas una clase privada o clases para tu equipo?', g: [0], gap: 0 },
      { id: 'c02', text: 'Las privadas pueden ser para una, dos o tres personas.', g: [1], gap: .9 },
      { id: 'c03', text: 'Las clases para empresas son en línea, para un máximo de diez por clase.', g: [2, 3], gap: 3.17 },
      { id: 'c04', text: 'Cuéntanos qué necesitan practicar.', g: [4, 5], gap: 3.12 },
      { id: 'c05', text: 'Manda PRIVADO o EMPRESA por mensaje privado.', g: [6, 7, 8, 9, 10], gap: .3 }],
    marks: {}, anchors: { una: 4.58, dos: 5.18, tres: 5.78, maxStart: 9.36, diezEnd: 10.16, privateActivity: 3.09 } },
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
    ...(v.cues.some(q => q.captionStatus) ? {} : {}), note: 'Cue times are COMPUTED from sample partitions of the supplied take-2 master + added silence (gap). Only silence is ever added; speech is never sped up, trimmed or cut. Phrase boundaries come from measured silences in this build; mapping to script phrases is structural, corroborated by independent ASR evidence, and unverified by ear. Take 1 is a provisional editorial choice based on independent ASR/pause measurements (not an audition). ASR word times are NOT used as cut instructions.',
    cues: v.cues.map((q, i) => ({ id: q.id, who: 'narrator', lang: 'es+en', capFit: true, ...(q.captionStatus ? { captionStatus: q.captionStatus } : {}), text: q.text, ...(q.caption ? { caption: q.caption } : {}), est: +((parts[i][1] - parts[i][0]) / SR).toFixed(3), gap: q.gap, file: `audio/cues/${name}_${q.id}.wav` })),
    alignment: { anchors: v.anchors, method: 'cut positions derived by this build from the waveform: integer sample midpoints of measured silences (silencedetect -38 dB, >= 120 ms) between declared groups of speech islands; NOT an externally supplied sample-cut handoff', confidence: { phraseBoundaries: 'waveform-derived cuts from this build (silence midpoints); mapping island group -> script phrase is structural. Independent faster-whisper small/medium ASR (supplied with batch 2, see manifest/batch2_inputs) corroborates the broad phrase assignment; ASR is not listening and does not prove pronunciation or naturalness', islands: 'measured from waveform (-38 dB); not a linguistic detector', wordLevel: 'not measured by this build; ASR word estimates carry model uncertainty (por/for code-switch disagreement in medium CanHave)', content: 'pronunciation/naturalness NOT verified (no listening)' }, totalSamples: N, partitions: parts, islandsMeasured: isl.map(x => [+x.s.toFixed(3), +x.e.toFixed(3)]), islandGroups: v.cues.map(q => q.g), marks: v.marks } };
  fs.writeFileSync(path.join(L.ROOT, 'manifest', `${name}.cues.json`), JSON.stringify(man, null, 2));
  console.log(name, 'islands', isl.map(x => x.s.toFixed(2) + '-' + x.e.toFixed(2)).join(' '), '\n  partitions', parts.map(p => p.join('-')).join(' '));
}
