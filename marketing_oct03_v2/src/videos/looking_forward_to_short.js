/* LOOKING FORWARD TO - SHORT. One adult male host. The lesson card shows the English phrase from frame 0 (speech-progress underline), the Spanish meaning fades in by 2.3 s; a compact CTA sits below the card from 1.3 s and later moves up and grows for the closing hold. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, pill, card, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out } = KB;
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start, En = x => x.ce ?? x.end;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .5), leave: 0,
      moodKeys: [{ t: 0, v: 'warm' }, { t: S(q.c01) - .2, v: 'happy' }, { t: S(q.c02) - .3, v: 'happy' }, { t: K.morphS - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c01) - .1, v: 'presentL' }, { t: K.esIn - .2, v: 'presentR' }, { t: S(q.c02) - .3, v: 'both' }, { t: K.morphS - .3, v: 'pointR' }],
      lookKeys: [{ t: 0, x: 0, y: -.3 }] });
    KIT.logoSmall(c, 1);
    KIT.content(c, () => {
      const lo = out(t, K.lessonOut);   // lesson card + role pill leave together
      if (lo > 0) {
        card(c, CARD_X, 480, CARD_W, 336, { a: lo }); KIT.tab(c, CARD_X + 24, 480, 'FRASE ÚTIL', lo); c.save(); c.globalAlpha = lo;
        text(c, 'I’m looking forward', CX, 480 + 100, fit(c, 'I’m looking forward', 780, 66), C.navy); text(c, 'to seeing you.', CX, 480 + 168, 66, C.navy);
        // speech-progress underline (grows with the audible phrase; not a word-timing claim)
        const pp = seg(t, S(q.c01), En(q.c01));   // grows once with the first play, then stays complete (static during the reading hold)
        if (pp > 0) { c.strokeStyle = C.mint; c.lineWidth = 9; c.lineCap = 'round'; const w = measure(c, 'to seeing you.', 66); c.beginPath(); c.moveTo(CX - w / 2, 480 + 192); c.lineTo(CX - w / 2 + w * pp, 480 + 192); c.stroke(); }
        const ea = E.out(seg(t, K.esIn, K.esIn + .4)); if (ea > 0) { c.save(); c.translate(0, (1 - ea) * 14); text(c, 'Tengo muchas ganas', CX, 480 + 258, 60, C.teal, { a: ea }); text(c, 'de verte.', CX, 480 + 318, 60, C.teal, { a: ea }); c.restore(); }
        c.restore();
      }
      // one CTA: compact below the lesson card, then it moves up and grows for the closing hold (never covers the lesson)
      const ci = E.back(seg(t, K.ctaEarly, K.ctaEarly + .45)), u = E.io(seg(t, K.morphS, K.morphE));
      if (ci > 0) { const m = Math.min(1, ci); c.save(); c.translate(0, (1 - m) * 20);
        KB.cta(c, lerp(822, 480, u), m, [{ t: 'Clases en línea.', size: lerp(60, 74, u) }, { kw: 'GRUPO', before: 'Manda', size: lerp(64, 70, u) }, { t: 'por mensaje privado.', size: lerp(60, 64, u) }]); c.restore(); }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
