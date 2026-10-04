/* FE261016-SCHEDULE (TikTok adaptation) – keyed to measured speech activity of the supplied take-2 narration. */
(function (root) {
  const NAME = 'schedule_options';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.hookOut = E(c.c01) + .1;
    // sábado onset: independent faster-whisper small/medium estimates put it at source 6.830-7.030 s (cue c02 starts at source 2.970249 s) => cue-relative 3.86-4.06 s. The weekend TITLE is fully readable at the middle of that range; no audio cut is made from this.
    K.sab = c.c02.start + 3.96;
    K.wdIn = S(c.c02) - .5; K.wdOut = K.sab - .38;           // weekday contents leave (0.15 s) ...
    K.wkIn = K.sab - .2; K.wkOut = S(c.c03) - .85;           // ... the SAME cream card then shows the weekend title (readable by K.sab), then its options one after another
    K.ctxIn = S(c.c03) - .5; K.clubIn = S(c.c04) - .5; K.ctxOut = S(c.c05) - .85;
    K.cta = S(c.c05) - .5; K.avOut = 1e9; K.end = E(c.c05) + 3.4;
    K.scenes = [{ id: 'hook', in: .1, end: K.hookOut + .3 }, { id: 'weekday_weekend_card', in: K.wdIn, end: K.wkOut + .3 }, { id: 'context', in: K.ctxIn, end: K.ctxOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    K.holds = [
      { id: 'weekday_options', from: K.wdIn + 1.15, to: K.wdOut, min: 2.5, rects: [[110, 460, 900, 1080]] },
      { id: 'weekend_options', from: K.sab + 1.2, to: K.wkOut, min: 2.5, rects: [[110, 460, 900, 1080]] },
      { id: 'context_monterrey_club', from: K.clubIn + .75, to: K.ctxOut, min: 2.5, rects: [[110, 465, 900, 675], [110, 725, 900, 1045]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 800]] }];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookOut - .2 }, { type: 'pop', at: K.wdIn + .1 }, { type: 'tick', at: K.wdIn + .7 }, { type: 'swish', at: K.wdOut }, { type: 'pop', at: K.sab + .1 },
      { type: 'tick', at: K.sab + .6 }, { type: 'swish', at: K.wkOut }, { type: 'pop', at: K.ctxIn + .1 }, { type: 'pop', at: K.clubIn + .1 }, { type: 'swish', at: K.ctxOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
