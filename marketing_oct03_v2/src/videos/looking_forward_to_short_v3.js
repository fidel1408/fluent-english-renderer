/* LOOKING FORWARD TO - SHORT v3: "Tu primera semana de inglés GRATIS" is on screen from frame 0 (large). Condition "Solo pagas si decides continuar." fades in at 1.3 s. English example from frame 0, Spanish meaning at 1.9 s. After the lesson card leaves, the SAME offer card grows to reveal "Escríbenos SEMANA GRATIS" for the closing hold. v3: the CTA row is drawn only after the card has finished growing (fixes pill protruding below card during 7.2-7.4 s). Same host, logo, cues, timing, SFX and mix as v1. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, card, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out } = KB;
  const OY = 468;   // offer card top (content coords)
  function offer(c, t, K, u) {
    const h = lerp(352, 604, u); card(c, CARD_X, OY, CARD_W, h, { stroke: C.coral });
    text(c, 'Tu primera semana', CX, OY + 92, fit(c, 'Tu primera semana', 780, 90), C.navy);
    const f = fit(c, 'Tu primera semana', 780, 90), w1 = measure(c, 'de inglés', f), w2 = measure(c, 'GRATIS', f), g = 22, pad = 22, tot = w1 + g + w2 + pad * 2, x0 = CX - tot / 2;
    text(c, 'de inglés', x0 + w1 / 2, OY + 184, f, C.navy); c.fillStyle = C.coral; rr(c, x0 + w1 + g, OY + 184 - f * .86, w2 + pad * 2, f * 1.1, 30); c.fill(); text(c, 'GRATIS', x0 + w1 + g + pad + w2 / 2, OY + 184, f, C.navy);
    const ca = E.out(seg(t, K.ctaEarly, K.ctaEarly + .4)); if (ca > 0) { c.save(); c.translate(0, (1 - ca) * 12); text(c, 'Solo pagas si decides', CX, OY + 262, 62, C.teal, { a: ca }); text(c, 'continuar.', CX, OY + 322, 62, C.teal, { a: ca }); c.restore(); }
    if (u >= 1) { c.save(); c.globalAlpha *= E.out(seg(t, K.morphE, K.morphE + .2)); c.strokeStyle = 'rgba(16,30,52,.18)'; c.lineWidth = 4; c.beginPath(); c.moveTo(CX - 300, OY + 378); c.lineTo(CX + 300, OY + 378); c.stroke();
      text(c, 'Escríbenos', CX, OY + 452, 72, C.navy); c.font = `700 66px ${FE.FONT}`; const pw = c.measureText('SEMANA GRATIS').width + 70; c.fillStyle = C.coral; rr(c, CX - pw / 2, OY + 472, pw, 88, 44); c.fill(); text(c, 'SEMANA GRATIS', CX, OY + 472 + 62, 66, C.navy); c.restore(); }
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start, En = x => x.ce ?? x.end;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .5), leave: 0,
      moodKeys: [{ t: 0, v: 'warm' }, { t: S(q.c01) - .2, v: 'happy' }, { t: S(q.c02) - .3, v: 'happy' }, { t: K.morphS - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c01) - .1, v: 'presentL' }, { t: K.esIn - .2, v: 'presentR' }, { t: S(q.c02) - .3, v: 'both' }, { t: K.morphS - .3, v: 'pointR' }],
      lookKeys: [{ t: 0, x: 0, y: -.3 }] });
    KIT.logoSmall(c, 1);
    KIT.content(c, () => {
      const u = E.io(seg(t, K.morphS, K.morphE)); offer(c, t, K, u);
      const lo = out(t, K.lessonOut);   // lesson card (English example + Spanish meaning) sits under the offer card and leaves first
      if (lo > 0) {
        const LY = 832; card(c, CARD_X, LY, CARD_W, 268, { a: lo }); c.save(); c.globalAlpha = lo;
        text(c, 'I’m looking forward', CX, LY + 56, fit(c, 'I’m looking forward', 780, 64), C.navy); text(c, 'to seeing you.', CX, LY + 118, 64, C.navy);
        const pp = seg(t, S(q.c01), En(q.c01)); if (pp > 0) { c.strokeStyle = C.mint; c.lineWidth = 8; c.lineCap = 'round'; const w = measure(c, 'to seeing you.', 64); c.beginPath(); c.moveTo(CX - w / 2, LY + 134); c.lineTo(CX - w / 2 + w * pp, LY + 134); c.stroke(); }
        const ea = E.out(seg(t, K.esIn, K.esIn + .4)); if (ea > 0) { c.save(); c.translate(0, (1 - ea) * 12); text(c, 'Tengo muchas ganas', CX, LY + 190, 60, C.teal, { a: ea }); text(c, 'de verte.', CX, LY + 250, 60, C.teal, { a: ea }); c.restore(); }
        c.restore();
      }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
