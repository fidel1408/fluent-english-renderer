/* LOOKING FORWARD TO - SHORT v3: the useful phrase is on screen from the first frame; English narration from the existing master (played twice, same samples); Spanish meaning and the CTA are honest on-screen text. */
(function (root) {
  const NAME = 'looking_forward_to_short_v3';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, K = {};
    K.cardIn = 0;                       // lesson card is fully there at 0.5 s (first word starts at 0.469 s)
    K.ctaEarly = 1.3;                   // v2: the condition line fades in here (same time as v1's CTA pop, so the SFX are unchanged)
    K.esIn = 1.9;                       // Spanish meaning fades in (readable by 2.3 s, inside the first 3 s)
    K.lessonOut = E(c.c02) + .55; K.morphS = K.lessonOut + .35; K.morphE = K.morphS + .6;     // the lesson card leaves FIRST (0.3 s), then the same CTA card moves up and grows (no overlap)
    K.end = E(c.c02) + 4.9; K.avOut = 1e9;
    K.scenes = [{ id: 'offer_card_with_lesson_then_cta', in: 0, end: K.end + 1 }];   // one persistent offer card; the lesson card leaves first, then the offer card grows to reveal the CTA row
    K.holds = [
      { id: 'lesson_card_settled', from: K.esIn + .6, to: K.lessonOut, min: 2.5, rects: [[110, 846, 900, 1085]] },
      { id: 'offer_card_phase1', from: K.ctaEarly + .5, to: K.lessonOut, min: 2.5, rects: [[110, 480, 900, 800]] },
      { id: 'closing_offer_cta', from: K.morphE + .3, to: null, min: 3.0, rects: [[110, 480, 900, 1065]] }];
    K.required = [['Tu primera semana', 0, K.end], ['de inglés', 0, K.end], ['GRATIS', 0, K.end], ['Solo pagas si decides', K.ctaEarly + .5, K.end], ['continuar.', K.ctaEarly + .5, K.end], ['looking forward', 0.05, K.lessonOut], ['to seeing you.', 0.05, K.lessonOut], ['Tengo muchas ganas', K.esIn + .5, K.lessonOut], ['de verte.', K.esIn + .5, K.lessonOut], ['Escríbenos', K.morphE + .3, K.end], ['SEMANA GRATIS', K.morphE + .3, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'pop', at: K.ctaEarly + .1 }, { type: 'tick', at: K.esIn + .2 }, { type: 'swish', at: K.morphS }, { type: 'tick', at: K.morphE + .1 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
