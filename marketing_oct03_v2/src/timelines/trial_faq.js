/* FE261030-TRIALFAQ (TikTok-only) – keyed to measured speech activity of the supplied take-2 narration. Exactly four weeks; week 1 is inside the same four-week bracket in every state; no fifth block. */
(function (root) {
  const NAME = 'trial_faq';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.hookOut = S(c.c02) - 1.25;
    K.trIn = S(c.c02) - .9; K.noPay = mk(c.c03, 'noPayStart', S(c.c03) + .8); K.trOut = S(c.c04) - 1.25;            // first week + no advance payment + stop condition
    K.coIn = S(c.c04) - .9; K.four = mk(c.c04, 'fourWeeks', S(c.c04) + 1.9); K.week1 = mk(c.c04, 'week1', S(c.c04) + 3.7); K.coOut = S(c.c05) - 1.25;      // whole conditional payment statement together
    K.deIn = S(c.c05) - .9; K.deOut = S(c.c06) - 1.25;                                                              // dense Spanish details: ~4 s settled
    K.cta = S(c.c06) - .9; K.avOut = 1e9; K.end = E(c.c06) + 3.5;
    K.scenes = [{ id: 'hook', in: .0, end: K.hookOut + .3 }, { id: 'trial', in: K.trIn, end: K.trOut + .3 }, { id: 'continue', in: K.coIn, end: K.coOut + .3 }, { id: 'details', in: K.deIn, end: K.deOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    const ST = [90, 455, 925, 600], CD = [110, 668, 900, 1090];
    K.holds = [
      { id: 'trial_state', from: K.trIn + .75, to: K.trOut, min: 2.5, rects: [ST, CD] },
      { id: 'continuation_state', from: Math.max(K.coIn + .75, K.week1 + .6), to: K.coOut, min: 2.5, rects: [ST, CD] },
      { id: 'details_card', from: K.deIn + .75, to: K.deOut, min: 4.0, rects: [[110, 460, 900, 1085]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 900]] }];
    K.required = [['Qué pasa después', 0.6, S(c.c02) - 1.25], ['Primera semana', S(c.c02) - .1, E(c.c03)], ['sin pago adelantado', S(c.c02) - .1, E(c.c03)], ['no pagas', S(c.c03) - .1, E(c.c03)],
      ['Si continúas, el pago cubre', S(c.c04) - .1, E(c.c04)], ['las cuatro semanas', S(c.c04) - .1, E(c.c04)], ['completas,', S(c.c04) - .1, E(c.c04)], ['incluida la primera', S(c.c04) - .1, E(c.c04)],
      ['Precios y condiciones', S(c.c05) - .1, E(c.c05)], ['Club: intermedios', S(c.c05) - .1, E(c.c05)], ['Grupos: máx. 10', S(c.c05) - .1, E(c.c05)], ['GRUPO', K.cta + .9, K.end], ['CLUB', K.cta + .9, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookOut }, { type: 'pop', at: K.trIn + .1 }, { type: 'tick', at: K.noPay }, { type: 'swish', at: K.trOut }, { type: 'pop', at: K.coIn + .1 }, { type: 'tick', at: K.four }, { type: 'tick', at: K.week1 }, { type: 'swish', at: K.coOut },
      { type: 'pop', at: K.deIn + .1 }, { type: 'swish', at: K.deOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
