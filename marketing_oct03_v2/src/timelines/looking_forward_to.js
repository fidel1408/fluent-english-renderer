/* LOOKING FORWARD TO – keyed to the measured speech activity of the supplied narration; ing / noun focus changes use measured pauses. */
(function (root) {
  const NAME = 'looking_forward_to';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.marks[k] : d, K = {};
    K.hookEnd = E(c.c01) + .45; K.calIn = S(c.c02) - .5; K.b1 = S(c.c02) - .1; K.travelS = S(c.c02) + .15; K.travelE = K.travelS + 1.0; K.b2 = S(c.c03) - .1; K.dlgOut = E(c.c03) + .9;
    K.fcIn = S(c.c04) - .5; K.rule = S(c.c04) + .1; K.ruleIng = c.c04.start + mk(c.c04, 'ingStart', 2.37) - .05; K.seeHl = S(c.c05) + .2; K.tr1 = S(c.c05) + .45;
    K.nounChip = S(c.c06) + .55;                           // 'O un sustantivo' is introduced: state A leaves (0.25 s) ...
    K.noun = K.nounChip + .3;                               // ... then the whole noun state (example + rule + Spanish translation) enters together
    K.nounHl = c.c06.start + mk(c.c06, 'nounStart', 1.4) + .85; K.swap = K.noun;
    K.nounHold = 2.7;                                        // stationary full-opacity reading time for the noun translation, after its entrance and before its exit
    K.nvOut = Math.max(E(c.c06) + .55, K.noun + .5 + K.nounHold);
    K.prIn = S(c.c07) - .5; K.q = S(c.c08) - .1; K.box = S(c.c07) + 1.4; K.cta = E(c.c08) + .25; K.avOut = K.cta - .1;
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookEnd - .3 }, { type: 'swish', at: K.calIn }, { type: 'pop', at: K.b1 }, { type: 'whoosh', at: K.travelS }, { type: 'ding', at: K.travelE },
      { type: 'pop', at: K.b2 }, { type: 'swish', at: K.dlgOut }, { type: 'pop', at: K.fcIn }, { type: 'tick', at: K.rule }, { type: 'tick', at: K.ruleIng }, { type: 'tick', at: K.seeHl }, { type: 'tick', at: K.tr1 },
      { type: 'swish', at: K.nounChip }, { type: 'tick', at: K.noun }, { type: 'tick', at: K.nounHl }, { type: 'swish', at: K.nvOut }, { type: 'pop', at: K.prIn + .1 }, { type: 'pop', at: K.q }, { type: 'tick', at: K.box }, { type: 'swish', at: K.cta - .2 }, { type: 'tick', at: K.cta + .3 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
