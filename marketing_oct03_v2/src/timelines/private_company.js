/* FE261023-PRIVATE (TikTok-only) – keyed to measured speech activity of the supplied take-1 narration. Private card is settled before the waveform activity at source ~3.09 s, the company card before ~6.96 s (earlier than the ASR onset estimates, per the handoff). */
(function (root) {
  const NAME = 'private_company';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.sPriv = mk(c.c02, 'privateActivity', S(c.c02)); K.sComp = S(c.c03);
    K.hookOut = K.sPriv - 1.25; K.pvIn = K.sPriv - .9; K.pvOut = K.sComp - 1.25; K.coIn = K.sComp - .9; K.coOut = S(c.c04) - 1.25; K.cta = S(c.c04) - .9;
    K.una = mk(c.c02, 'una', K.sPriv + 1.4) - .05; K.dos = mk(c.c02, 'dos', K.una + .6) - .05; K.tres = mk(c.c02, 'tres', K.dos + .6) - .05;
    K.max0 = mk(c.c03, 'maxStart', K.sComp + 2.3); K.diez = mk(c.c03, 'diezEnd', K.max0 + .8); K.avOut = 1e9; K.end = E(c.c05) + 3.5;
    K.scenes = [{ id: 'hook', in: .0, end: K.hookOut + .3 }, { id: 'private', in: K.pvIn, end: K.pvOut + .3 }, { id: 'company', in: K.coIn, end: K.coOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    K.holds = [
      { id: 'private_info', from: K.tres + .5, to: K.pvOut, min: 2.5, rects: [[110, 460, 900, 1085]] },
      { id: 'company_info', from: K.diez + .5, to: K.coOut, min: 2.5, rects: [[110, 460, 900, 1085]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 900]] }];
    K.required = [['PRIVADAS', K.sPriv - .1, E(c.c02)], ['1–3', K.sPriv - .1, E(c.c02)], ['EMPRESAS', K.sComp - .1, E(c.c03)], ['1–10 por clase', K.sComp - .1, E(c.c03)], ['Mismo precio total', K.sPriv - .1, E(c.c02)], ['Mismo precio total', K.sComp - .1, E(c.c03)], ['PRIVADO', K.cta + .9, K.end], ['EMPRESA', K.cta + .9, K.end], ['¿Qué necesitan practicar?', K.cta + .9, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookOut }, { type: 'pop', at: K.pvIn + .1 }, { type: 'tick', at: K.una }, { type: 'tick', at: K.dos }, { type: 'tick', at: K.tres }, { type: 'swish', at: K.pvOut }, { type: 'pop', at: K.coIn + .1 }, { type: 'sparkle', at: K.diez }, { type: 'swish', at: K.coOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
