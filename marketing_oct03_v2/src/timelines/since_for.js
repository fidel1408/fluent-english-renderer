/* FE261026-SINCEFOR – keyed to measured speech activity of the supplied take-1 narration (anchors mapped through the inserted silence). Every card is fully readable BEFORE its phrase (text full at S-0.2); each state leaves only after its speech ends. */
(function (root) {
  const NAME = 'since_for';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.hookOut = S(c.c02) - 1.25;
    K.duIn = S(c.c02) - .9; K.forAt = mk(c.c03, 'forStart', S(c.c03)); K.duOut = S(c.c05) - 1.25;      // FOR: complete example + translation + rule as ONE state
    K.stIn = S(c.c05) - .9; K.sinceAt = mk(c.c06, 'sinceStart', S(c.c06)); K.stOut = S(c.c08) - 1.25;   // SINCE: full replacement (never a new rule over the old example)
    K.prIn = S(c.c08) - .9; K.quIn = S(c.c10) - .45; K.prOut = S(c.c11) - 1.25;                         // practice: solved examples and highlights cleared; blank stays empty
    K.cta = S(c.c11) - .9; K.avOut = 1e9; K.end = E(c.c12) + 3.5;
    K.scenes = [{ id: 'hook', in: .0, end: K.hookOut + .3 }, { id: 'for', in: K.duIn, end: K.duOut + .3 }, { id: 'since', in: K.stIn, end: K.stOut + .3 }, { id: 'practice', in: K.prIn, end: K.prOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    const ST = [90, 455, 925, 615], CD = [110, 675, 900, 1090];
    K.holds = [
      { id: 'for_example', from: Math.max(K.duIn + .75, K.forAt + .5), to: K.duOut, min: 2.5, rects: [ST, CD] },
      { id: 'since_example', from: Math.max(K.stIn + .75, K.sinceAt + .5), to: K.stOut, min: 2.5, rects: [ST, CD] },
      { id: 'practice_unanswered', from: K.prIn + .8, to: K.prOut, min: 3.0, rects: [[110, 505, 900, 900]] },
      { id: 'practice_after_question', from: E(c.c10), to: K.prOut, min: 3.0, rects: [[110, 505, 900, 900]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 830]] }];
    K.required = [['Empezó antes', 0.6, S(c.c02) - 1.25], ['I’ve lived here', S(c.c02) - .1, E(c.c02)], ['for two years.', S(c.c02) - .1, E(c.c04)], ['FOR + duración', S(c.c02) - .1, E(c.c04)], ['Vivo aquí desde', S(c.c02) - .1, E(c.c04)],
      ['since 2024.', S(c.c05) - .1, E(c.c07)], ['SINCE + inicio', S(c.c05) - .1, E(c.c07)], ['desde 2024.', S(c.c05) - .1, E(c.c07)], ['six months.', K.prIn + .8, K.prOut], ['¿Since o for?', S(c.c10) - .1, K.prOut], ['GRUPO', K.cta + .9, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookOut }, { type: 'pop', at: K.duIn + .1 }, { type: 'tick', at: K.forAt }, { type: 'swish', at: K.duOut }, { type: 'pop', at: K.stIn + .1 }, { type: 'tick', at: K.sinceAt }, { type: 'swish', at: K.stOut },
      { type: 'pop', at: K.prIn + .1 }, { type: 'tick', at: K.quIn }, { type: 'swish', at: K.prOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
