/* ACTUALLY / CURRENTLY – cue-driven timeline. */
(function (root) {
  const NAME = 'actually_currently';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const K = {}, d6 = c.c06.end - c.c06.start;
    K.hookEnd = c.c01.end + .45; K.cmp1 = c.c02.start - .15; K.cmp2 = c.c03.start - .15; K.cmpOut = c.c03.end + .45;
    K.dlgIn = c.c04.start - .55; K.b1 = c.c04.start - .1; K.travelS = c.c05.start - .05; K.travelE = K.travelS + 1.0; K.b2 = c.c05.start - .1; K.tr = c.c05.end + .25; K.dlgOut = c.c05.end + 1.0;
    K.presIn = c.c06.start - .4; K.nowS = K.presIn + .6; K.curHl = c.c06.start + .55 * d6; K.trEs = K.curHl + .35; K.presOut = c.c06.end + .6;
    K.prIn = c.c07.start - .15; K.q = c.c08.start - .2; K.box = c.c08.start + .7; K.cta = c.c08.start + .9; K.avOut = K.prIn;
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookEnd - .3 }, { type: 'pop', at: K.cmp1 }, { type: 'pop', at: K.cmp2 }, { type: 'swish', at: K.cmpOut - .1 },
      { type: 'swish', at: K.dlgIn }, { type: 'pop', at: K.b1 }, { type: 'whoosh', at: K.travelS }, { type: 'pop', at: K.b2 }, { type: 'ding', at: K.travelE }, { type: 'tick', at: K.tr },
      { type: 'swish', at: K.dlgOut }, { type: 'pop', at: K.presIn }, { type: 'tick', at: K.nowS }, { type: 'tick', at: K.curHl }, { type: 'tick', at: K.trEs },
      { type: 'swish', at: K.presOut }, { type: 'pop', at: K.prIn + .1 }, { type: 'tick', at: K.box }, { type: 'tick', at: K.cta }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
