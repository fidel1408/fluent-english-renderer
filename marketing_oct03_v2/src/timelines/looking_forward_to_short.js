/* LOOKING FORWARD TO - SHORT (10-15 s): the useful phrase is on screen from the first frame; English narration from the existing master (played twice, same samples); Spanish meaning and the CTA are honest on-screen text. */
(function (root) {
  const NAME = 'looking_forward_to_short';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, K = {};
    K.cardIn = 0;                       // lesson card is fully there at 0.5 s (first word starts at 0.469 s)
    K.ctaEarly = 1.3;                   // compact CTA appears below the lesson card (does not cover it)
    K.esIn = 1.9;                       // Spanish meaning fades in (readable by 2.3 s, inside the first 3 s)
    K.lessonOut = E(c.c02) + .55; K.morphS = K.lessonOut + .35; K.morphE = K.morphS + .6;     // the lesson card leaves FIRST (0.3 s), then the same CTA card moves up and grows (no overlap)
    K.end = E(c.c02) + 4.9; K.avOut = 1e9;
    K.scenes = [{ id: 'lesson_with_cta_morph', in: 0, end: K.end + 1 }];   // one continuous layout: the lesson card leaves while the same CTA card moves up (no second card)
    K.holds = [
      { id: 'lesson_card_settled', from: K.esIn + .6, to: K.lessonOut, min: 2.5, rects: [[110, 520, 900, 810]] },
      { id: 'closing_cta', from: K.morphE + .15, to: null, min: 3.0, rects: [[110, 490, 900, 830]] }];
    K.required = [['looking forward', .6, K.lessonOut], ['to seeing you.', .6, K.lessonOut], ['Tengo muchas ganas', K.esIn + .5, K.lessonOut], ['de verte.', K.esIn + .5, K.lessonOut], ['Clases en línea.', K.ctaEarly + .6, K.end], ['GRUPO', K.ctaEarly + .6, K.end], ['por mensaje privado.', K.ctaEarly + .6, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'pop', at: K.ctaEarly + .1 }, { type: 'tick', at: K.esIn + .2 }, { type: 'swish', at: K.morphS }, { type: 'tick', at: K.morphE + .1 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
