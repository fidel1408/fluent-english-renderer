/* FE261019-CLARIFY – keyed to measured speech activity (cue.cs/ce) of the supplied take-1 narration. Every card is fully readable BEFORE its phrase (text full at S-0.2), every state leaves only after its speech ends. */
(function (root) {
  const NAME = 'clarify_deadline';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.hookOut = S(c.c02) - 1.25;
    K.clIn = S(c.c02) - .9; K.clOut = S(c.c04) - 1.25;          // two SEPARATE question models (not question-answer)
    K.cfIn = S(c.c04) - .9; K.cfOut = S(c.c07) - 1.25;
    K.prIn = S(c.c07) - .9; K.porAt = mk(c.c07, 'porStart', S(c.c07) + 1.9); K.nextAt = mk(c.c07, 'nextStart', S(c.c07) + 2.6); K.nextIn = K.nextAt - .55; K.sentIn = E(c.c07) - .45; K.prOut = S(c.c08) - 1.25;
    K.cta = S(c.c08) - .9; K.avOut = 1e9; K.end = E(c.c09) + 3.5;
    K.scenes = [{ id: 'hook', in: .0, end: K.hookOut + .3 }, { id: 'clarify', in: K.clIn, end: K.clOut + .3 }, { id: 'confirm', in: K.cfIn, end: K.cfOut + .3 }, { id: 'practice', in: K.prIn, end: K.prOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    K.holds = [
      { id: 'clarify_example', from: K.clIn + .75, to: K.clOut, min: 2.5, rects: [[110, 710, 900, 1085]] },
      { id: 'confirm_example', from: K.cfIn + .75, to: K.cfOut, min: 2.5, rects: [[110, 710, 900, 1085]] },
      { id: 'practice_unanswered', from: K.sentIn + .75, to: K.prOut, min: 3.0, rects: [[110, 505, 900, 1060]] },
      { id: 'practice_after_question', from: E(c.c07), to: K.prOut, min: 3.0, rects: [[110, 505, 900, 1060]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 830]] }];
    K.required = [['Could you clarify', S(c.c02) - .1, E(c.c02)], ['¿Podrías aclarar', S(c.c03) - .1, E(c.c03)], ['PEDIR UNA ACLARACIÓN', S(c.c02) - .1, E(c.c03)], ['PARA CONFIRMAR', S(c.c04) - .1, E(c.c06)], ['Do you mean', S(c.c05) - .1, E(c.c05)], ['¿Te refieres a', S(c.c06) - .1, E(c.c06)],
      ['the deadline', S(c.c07) - .1, K.prOut], ['the next step', K.nextAt - .05, K.prOut], ['EMPRESA', K.cta + .9, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookOut }, { type: 'pop', at: K.clIn + .1 }, { type: 'swish', at: K.clOut }, { type: 'pop', at: K.cfIn + .1 }, { type: 'sparkle', at: S(c.c05) }, { type: 'swish', at: K.cfOut },
      { type: 'pop', at: K.prIn + .1 }, { type: 'tick', at: K.nextIn }, { type: 'pop', at: K.sentIn + .1 }, { type: 'swish', at: K.prOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
