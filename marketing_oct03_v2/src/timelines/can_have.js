/* FE261012-CANHAVE – every moment keyed to measured speech activity (cue.cs/ce) and measured island marks of the supplied take-2 narration. */
(function (root) {
  const NAME = 'can_have';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.pourS = .55; K.pourE = K.pourS + 1.5; K.hookEnd = E(c.c01) + .4;
    K.reqIn = S(c.c02) - .55; K.glow = S(c.c02); K.reqOut = S(c.c04) - .85;
    K.respIn = S(c.c04) - .5; K.pass = S(c.c04) - .05; K.passE = K.pass + 1.1; K.respOut = S(c.c06) - .9;
    K.pracIn = S(c.c06) - .55; K.waterHl = S(c.c06) + .35; K.waterOut = mk(c.c06, 'porStart', S(c.c06) + 1.9); K.juiceIn = mk(c.c06, 'juiceStart', S(c.c06) + 2.3) - .1; K.pracOut = S(c.c07) - .75;
    K.cta = S(c.c07) - .4; K.avOut = 1e9; K.end = E(c.c07) + 3.4;
    K.scenes = [{ id: 'hook', in: .1, end: K.hookEnd }, { id: 'request', in: K.reqIn, end: K.reqOut + .3 }, { id: 'response', in: K.respIn, end: K.respOut + .3 }, { id: 'practice', in: K.pracIn, end: K.pracOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];   // sequential, non-overlapping teaching states (the table stage persists across request/response)
    K.holds = [   // stationary, fully settled, full-opacity reading windows; rects (content space) lie inside opaque cards so background drift cannot count as change
      { id: 'request_bilingual', from: K.reqIn + .75, to: K.reqOut, min: 2.5, rects: [[110, 745, 900, 1075]] },
      { id: 'response_bilingual', from: K.respIn + .75, to: K.respOut, min: 2.5, rects: [[110, 745, 900, 1025]] },
      { id: 'practice_unanswered_after_juice', from: K.juiceIn + .6, to: K.pracOut, min: 3.0, rects: [[110, 665, 900, 900], [110, 945, 900, 1075]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 850]] }];
    K.scenes = K.scenes; const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.pourS }, { type: 'ding', at: K.pourE }, { type: 'swish', at: K.hookEnd - .2 }, { type: 'pop', at: K.reqIn + .1 }, { type: 'sparkle', at: K.glow },
      { type: 'swish', at: K.reqOut }, { type: 'pop', at: K.respIn + .1 }, { type: 'whoosh', at: K.pass }, { type: 'ding', at: K.passE }, { type: 'swish', at: K.respOut },
      { type: 'pop', at: K.pracIn + .1 }, { type: 'tick', at: K.waterHl }, { type: 'swish', at: K.waterOut }, { type: 'pop', at: K.juiceIn + .1 }, { type: 'swish', at: K.pracOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
