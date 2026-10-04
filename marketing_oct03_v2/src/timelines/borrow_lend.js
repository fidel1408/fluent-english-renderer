/* FE261014-BORROW – keyed to measured speech activity of the supplied take-2 narration. Roles/arrow animate only after their example is ready. */
(function (root) {
  const NAME = 'borrow_lend';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.hookEnd = E(c.c01) + .15;
    K.bIn = Math.max(S(c.c02) - .6, K.hookEnd + .04);                                   // borrow state: zones + example (EN+ES) as ONE unit, roles still hidden
    K.bRoles = S(c.c04) - .05; K.bArrowS = S(c.c04) - .05; K.bArrowE = K.bArrowS + .95; K.bChip = S(c.c04) + .05;
    K.bOut = S(c.c05) - .8;                                  // complete viewpoint reset: everything leaves (0.3 s) before the lend state enters
    K.lIn = S(c.c05) - .45;
    K.lRoles = S(c.c07) - .05; K.lArrowS = S(c.c07) - .05; K.lArrowE = K.lArrowS + .95; K.lChip = S(c.c07) + .05;
    K.lOut = S(c.c08) - .85;
    K.pracIn = S(c.c08) - .5; K.canI = mk(c.c08, 'canIStart', S(c.c08) + 1.1); K.charger = mk(c.c08, 'yourChargerStart', S(c.c08) + 2.3); K.que = mk(c.c08, 'queStart', S(c.c08) + 3.7);
    K.pracOut = S(c.c09) - .75; K.cta = S(c.c09) - .35; K.avOut = 1e9; K.end = E(c.c09) + 3.6;
    K.scenes = [{ id: 'hook', in: .1, end: K.hookEnd }, { id: 'borrow', in: K.bIn, end: K.bOut + .3 }, { id: 'lend', in: K.lIn, end: K.lOut + .3 }, { id: 'practice', in: K.pracIn, end: K.pracOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    const ST = [[90, 465, 500, 555], [515, 465, 925, 555], [90, 577, 925, 738], [110, 815, 900, 1095]];   // trays, lane (arrow + pen + ownership tag), bilingual example card
    K.holds = [
      { id: 'borrow_complete_state', from: K.bArrowE + .1, to: K.bOut, min: 2.5, rects: ST },
      { id: 'lend_complete_state', from: K.lArrowE + .1, to: K.lOut, min: 2.5, rects: ST },
      { id: 'practice_unanswered_after_question', from: E(c.c08), to: K.pracOut, min: 3.0, rects: [[110, 510, 900, 890]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 820]] }];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookEnd - .2 }, { type: 'pop', at: K.bIn + .1 }, { type: 'tick', at: K.bRoles }, { type: 'whoosh', at: K.bArrowS }, { type: 'ding', at: K.bArrowE }, { type: 'pop', at: K.bChip },
      { type: 'swish', at: K.bOut }, { type: 'pop', at: K.lIn + .1 }, { type: 'tick', at: K.lRoles }, { type: 'whoosh', at: K.lArrowS }, { type: 'ding', at: K.lArrowE }, { type: 'pop', at: K.lChip },
      { type: 'swish', at: K.lOut }, { type: 'pop', at: K.pracIn + .1 }, { type: 'tick', at: K.canI }, { type: 'tick', at: K.charger }, { type: 'tick', at: K.que }, { type: 'swish', at: K.pracOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
