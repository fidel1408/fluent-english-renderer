/* LOOKING FORWARD TO – cue-driven timeline. */
(function (root) {
  const NAME = 'looking_forward_to';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const K = {};
    K.hookEnd = c.c01.end + .45; K.calIn = c.c02.start - .5; K.b1 = c.c02.start - .1; K.travelS = c.c02.start + .15; K.travelE = K.travelS + 1.0; K.b2 = c.c03.start - .1; K.dlgOut = c.c03.end + .9;
    K.fcIn = c.c04.start - .5; K.rule = c.c04.start + .1; K.seeHl = c.c05.start - .1; K.tr1 = c.c05.start + .3;
    K.swap = c.c06.start + 1.2; K.noun = K.swap + .7; K.nvOut = c.c06.end + .55;
    K.prIn = c.c07.start - .5; K.q = c.c08.start - .1; K.box = c.c07.start + 1.4; K.cta = c.c08.start + .2; K.avOut = K.prIn;
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookEnd - .3 }, { type: 'swish', at: K.calIn }, { type: 'pop', at: K.b1 }, { type: 'whoosh', at: K.travelS }, { type: 'ding', at: K.travelE },
      { type: 'pop', at: K.b2 }, { type: 'swish', at: K.dlgOut }, { type: 'pop', at: K.fcIn }, { type: 'tick', at: K.rule }, { type: 'tick', at: K.seeHl }, { type: 'tick', at: K.tr1 },
      { type: 'swish', at: K.swap }, { type: 'tick', at: K.noun }, { type: 'swish', at: K.nvOut }, { type: 'pop', at: K.prIn + .1 }, { type: 'pop', at: K.q }, { type: 'tick', at: K.box }, { type: 'tick', at: K.cta }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
