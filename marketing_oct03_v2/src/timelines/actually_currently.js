/* ACTUALLY / CURRENTLY – every moment is keyed to the measured speech activity of the supplied narration (cue.cs / cue.ce), plus marks from measured pauses. */
(function (root) {
  const NAME = 'actually_currently';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.marks[k] : d, K = {};
    K.hookEnd = E(c.c01) + .45; K.cmp1 = S(c.c02) - .15; K.cmp2 = S(c.c03) - .15; K.cmpOut = E(c.c03) + .45;
    K.dlgIn = S(c.c04) - .55; K.b1 = S(c.c04) - .1; K.travelS = S(c.c05) - .05; K.travelE = K.travelS + 1.0; K.b2 = S(c.c05) - .1; K.tr = E(c.c05) + .25; K.dlgOut = E(c.c05) + 1.15;
    K.presIn = S(c.c06) - .4; K.nowS = K.presIn + .6; K.curHl = c.c06.start + mk(c.c06, 'englishStart', 2.4) + .3; K.trEs = K.curHl + .35; K.presOut = E(c.c06) + .6;
    K.prIn = S(c.c07) - .15; K.q = S(c.c08) - .2; K.box = S(c.c08) + .7; K.cta = E(c.c09) + .25; K.avOut = K.cta - .1;
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookEnd - .3 }, { type: 'pop', at: K.cmp1 }, { type: 'pop', at: K.cmp2 }, { type: 'swish', at: K.cmpOut - .1 },
      { type: 'swish', at: K.dlgIn }, { type: 'pop', at: K.b1 }, { type: 'whoosh', at: K.travelS }, { type: 'pop', at: K.b2 }, { type: 'ding', at: K.travelE }, { type: 'tick', at: K.tr },
      { type: 'swish', at: K.dlgOut }, { type: 'pop', at: K.presIn }, { type: 'tick', at: K.nowS }, { type: 'tick', at: K.curHl }, { type: 'tick', at: K.trEs },
      { type: 'swish', at: K.presOut }, { type: 'pop', at: K.prIn + .1 }, { type: 'tick', at: K.box }, { type: 'swish', at: K.cta - .2 }, { type: 'tick', at: K.cta + .3 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
