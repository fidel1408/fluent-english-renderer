/* I AGREE – every visual/SFX moment is keyed to cue times, so real narration durations re-time everything. */
(function (root) {
  const NAME = 'i_agree';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const K = {};
    K.hookEnd = c.c01.end + .45; K.badIn = K.hookEnd; K.labelIn = K.badIn + .2;
    const mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.marks[k] : d;
    K.flagS = c.c02.start + mk(c.c02, 'badPhrase', .5); K.flagE = K.flagS + .5;
    K.strikeS = c.c02.end + .1; K.strikeE = K.strikeS + .35; K.liftS = K.strikeS + .4; K.liftE = K.liftS + .65; K.collS = K.liftS + .2; K.collE = K.liftS + .8; K.flip = K.collE;                       // DI ASÍ exactly when only the correct phrase remains
    K.expA = c.c04.start - .1; K.expB = c.c04.start + mk(c.c04, 'aqui', .52 * (c.c04.end - c.c04.start)) - .05; K.expOut = c.c04.end + .45;
    K.exLabel = c.c05.start - .3; K.grow0 = K.expOut + .3; K.wy = Math.max(c.c05.start - .15, K.grow0 + .3); K.grow1 = K.wy; K.hl = c.c05.start + .45; K.tr = c.c06.start - .15; K.exOut = c.c06.end + .4;
    K.qIn = c.c07.start - .3; K.box = c.c07.start + .9; K.ctaIn = c.c08.end + .3; K.avOut = K.ctaIn - .1;
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookEnd - .3 }, { type: 'swish', at: K.badIn }, { type: 'tick', at: K.labelIn + .2 }, { type: 'scratch', at: K.strikeS },
      { type: 'thock', at: K.liftS }, { type: 'sparkle', at: K.liftS + .05 }, { type: 'ding', at: K.flip + .03 }, { type: 'tick', at: K.expA }, { type: 'tick', at: K.expB },
      { type: 'swish', at: K.expOut - .1 }, { type: 'swish', at: K.wy }, { type: 'tick', at: K.hl }, { type: 'tick', at: K.tr }, { type: 'swish', at: K.exOut }, { type: 'pop', at: K.qIn + .05 },
      { type: 'swish', at: K.ctaIn - .2 }, { type: 'tick', at: K.ctaIn + .7 }, { type: 'pop', at: K.ctaIn + .95 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
