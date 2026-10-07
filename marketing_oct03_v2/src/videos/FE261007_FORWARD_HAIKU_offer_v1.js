/* FE261007_FORWARD_HAIKU_offer_v1 – LOOKING FORWARD TO. Frame 0 shows the free-week offer (with the condition) and the English example + Spanish meaning; one lesson card then moves through rule, noun, practice and a fixed CTA card ("Escríbenos SEMANA GRATIS"). One adult host, same logo, same cues/SFX as REV4. */
window.VIDEO = (() => {
  const { CX, C, E, seg, background, text, card, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT;
  const OY = 468, OH = 352;   // offer card: top and fixed height (content coords), visible from frame 0
  const LY = 832, LH = 268;   // lesson / CTA card: fixed height, same box for every state

  function offer(c) {
    card(c, CARD_X, OY, CARD_W, OH, { stroke: C.coral });
    const f = fit(c, 'Tu primera semana', 780, 90), w1 = measure(c, 'de inglés', f), w2 = measure(c, 'GRATIS', f), g = 22, pad = 22, tot = w1 + g + w2 + pad * 2, x0 = CX - tot / 2;
    text(c, 'Tu primera semana', CX, OY + 92, f, C.navy);
    text(c, 'de inglés', x0 + w1 / 2, OY + 184, f, C.navy);
    c.fillStyle = C.coral; rr(c, x0 + w1 + g, OY + 184 - f * .86, w2 + pad * 2, f * 1.1, 30); c.fill();
    text(c, 'GRATIS', x0 + w1 + g + pad + w2 / 2, OY + 184, f, C.navy);
    text(c, 'Solo pagas si decides', CX, OY + 262, 62, C.teal);
    text(c, 'continuar.', CX, OY + 322, 62, C.teal);
  }

  // one highlight band behind a word/phrase; width grows with h (0..1)
  function band(c, cx, base, label, font, h) {
    if (h <= 0) return; const w = measure(c, label, font);
    c.fillStyle = 'rgba(114,216,198,.6)'; rr(c, cx - w / 2 - 22, base - font * .86, (w + 44) * h, font * 1.12, 34); c.fill();
  }

  function lesson(c, t, K) {
    card(c, CARD_X, LY, CARD_W, LH);   // present from frame 0 (no entrance fade)
    // state windows: A (example + Spanish) -> R (rule -ing) -> N (rule noun) -> P (practice) -> C (CTA). Each state fades out before the next fades in.
    const aA = 1 - seg(t, K.fcIn - .3, K.fcIn - .05);
    const aR = seg(t, K.fcIn, K.fcIn + .25) * (1 - seg(t, K.nounChip - .3, K.nounChip - .05));
    const aN = seg(t, K.nounChip, K.nounChip + .25) * (1 - seg(t, K.nvOut - .3, K.nvOut - .05));
    const aP = seg(t, K.prIn, K.prIn + .3) * (1 - seg(t, K.cta - .3, K.cta - .05));
    const aC = seg(t, K.cta + .05, K.cta + .45);
    const f64 = 64, f60 = 60;
    if (aA > 0) { c.save(); c.globalAlpha = aA;
      text(c, 'I’m looking forward', CX, LY + 56, fit(c, 'I’m looking forward', 780, f64), C.navy);
      text(c, 'to seeing you.', CX, LY + 118, f64, C.navy);
      text(c, 'Tengo muchas ganas', CX, LY + 190, f60, C.teal);
      text(c, 'de verte.', CX, LY + 250, f60, C.teal);
      c.restore(); }
    if (aR > 0) { c.save(); c.globalAlpha = aR;
      text(c, 'look forward to', CX, LY + 56, f64, C.navy);
      text(c, '+ verbo en -ing', CX, LY + 118, f60, C.teal);
      text(c, 'I’m looking forward to', CX, LY + 190, f60, C.navy);
      const hl = E.out(seg(t, K.seeHl, K.seeHl + .45)); band(c, CX, LY + 250, 'seeing you.', f60, hl);
      text(c, 'seeing you.', CX, LY + 250, f60, C.navy);
      c.restore(); }
    if (aN > 0) { c.save(); c.globalAlpha = aN;
      text(c, 'look forward to', CX, LY + 56, f64, C.navy);
      text(c, '+ sustantivo', CX, LY + 118, f60, C.teal);
      text(c, 'I’m looking forward to', CX, LY + 190, f60, C.navy);
      const hn = E.out(seg(t, K.nounHl, K.nounHl + .45)); band(c, CX, LY + 250, 'the weekend.', f60, hn);
      text(c, 'the weekend.', CX, LY + 250, f60, C.navy);
      c.restore(); }
    if (aP > 0) { c.save(); c.globalAlpha = aP;
      text(c, 'I’m looking forward to', CX, LY + 56, f64, C.navy);
      c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX - 270, LY + 124); c.lineTo(CX + 230, LY + 124); c.stroke();
      text(c, '¿Cómo la completas?', CX, LY + 190, f60, C.teal);
      c.restore(); }
    if (aC > 0) { c.save(); c.globalAlpha = aC;
      text(c, 'Escríbenos', CX, LY + 100, 72, C.navy);
      c.font = `700 66px ${FE.FONT}`; const pw = c.measureText('SEMANA GRATIS').width + 70;
      c.fillStyle = C.coral; rr(c, CX - pw / 2, LY + 126, pw, 92, 46); c.fill();
      text(c, 'SEMANA GRATIS', CX, LY + 126 + 64, 66, C.navy);
      c.restore(); }
  }

  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: 1, leave: seg(t, K.avOut, K.avOut + .5),
      moodKeys: [{ t: 0, v: 'ask' }, { t: S(q.c02), v: 'happy' }, { t: S(q.c04), v: 'warm' }, { t: S(q.c07), v: 'ask' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .2, v: 'presentL' }, { t: S(q.c03) - .2, v: 'presentR' }, { t: S(q.c04) - .2, v: 'pointR' }, { t: S(q.c06) - .2, v: 'presentR' }, { t: S(q.c07) - .3, v: 'both' }, { t: S(q.c08), v: 'pointR' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }] });
    KIT.logoSmall(c, 1);
    KIT.content(c, () => { offer(c); lesson(c, t, K); });
    if (t >= K.cta + .35) KIT.logoBig(c, 440, 1270, E.out(seg(t, K.cta + .35, K.cta + .95)));
    caption(c, t, cues);
  }
  return { draw };
})();
