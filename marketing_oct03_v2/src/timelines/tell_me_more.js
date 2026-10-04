/* FE261021-MORE – keyed to measured speech activity of the supplied take-1 narration. That's nice is shown as valid (never marked wrong); the alternative is an invitation. */
(function (root) {
  const NAME = 'tell_me_more';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, K = {};
    K.hookOut = S(c.c02) - 1.25;
    K.seIn = S(c.c02) - .9; K.seOut = S(c.c03) - 1.25;                 // EJEMPLO: the quoted statement
    K.qIn = S(c.c03) - .9; K.qOut = S(c.c05) - 1.25;                   // RESPUESTA POSIBLE (follow-up question) + translation as one unit
    K.alIn = S(c.c05) - .9; K.alOut = S(c.c08) - 1.25;                 // OTRA OPCIÓN (an invitation, not a question)
    K.prIn = S(c.c08) - .9; K.quIn = S(c.c10) - .45; K.prOut = S(c.c11) - 1.25;
    K.cta = S(c.c11) - .9; K.avOut = 1e9; K.end = E(c.c12) + 3.5;
    K.scenes = [{ id: 'hook', in: .0, end: K.hookOut + .3 }, { id: 'setup', in: K.seIn, end: K.seOut + .3 }, { id: 'question', in: K.qIn, end: K.qOut + .3 }, { id: 'alternative', in: K.alIn, end: K.alOut + .3 }, { id: 'practice', in: K.prIn, end: K.prOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    K.holds = [
      { id: 'setup_example', from: K.seIn + .75, to: K.seOut, min: 2.5, rects: [[110, 715, 900, 900]] },
      { id: 'question_bilingual', from: K.qIn + .75, to: K.qOut, min: 2.5, rects: [[110, 715, 900, 1085]] },
      { id: 'alternative_bilingual', from: K.alIn + .75, to: K.alOut, min: 2.5, rects: [[110, 715, 900, 1085]] },
      { id: 'practice_unanswered', from: K.quIn + .5, to: K.prOut, min: 3.0, rects: [[110, 505, 900, 900]] },
      { id: 'practice_after_question', from: E(c.c10), to: K.prOut, min: 3.0, rects: [[110, 505, 900, 900]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 880]] }];
    K.required = [['I tried a new', S(c.c02) - .1, E(c.c02)], ['EJEMPLO', S(c.c02) - .1, E(c.c02)], ['Oh, nice!', S(c.c03) - .1, E(c.c04)], ['¿Cómo estuvo?', S(c.c03) - .1, E(c.c04)], ['RESPUESTA POSIBLE', S(c.c03) - .1, E(c.c04)],
      ['OTRA OPCIÓN', S(c.c05) - .1, E(c.c07)], ['Tell me more', S(c.c06) - .1, E(c.c07)], ['Cuéntame más.', S(c.c06) - .1, E(c.c07)], ['I watched a movie', S(c.c08) + .2, K.prOut], ['¿Qué preguntarías después?', S(c.c10) - .1, K.prOut], ['CLUB', K.cta + .9, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookOut }, { type: 'pop', at: K.seIn + .1 }, { type: 'swish', at: K.seOut }, { type: 'pop', at: K.qIn + .1 }, { type: 'swish', at: K.qOut }, { type: 'pop', at: K.alIn + .1 }, { type: 'swish', at: K.alOut },
      { type: 'pop', at: K.prIn + .1 }, { type: 'tick', at: K.quIn }, { type: 'swish', at: K.prOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
