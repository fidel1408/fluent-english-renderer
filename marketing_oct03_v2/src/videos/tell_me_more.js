/* FE261021-MORE – one adult male host. "That's nice" is valid (never marked wrong); the follow-up question and the invitation are labelled as separate options. Menu illustration, then a movie ticket for the practice. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = P2;
  const STAGE = [CARD_X, 450, CARD_W, 190], EXY = 700;
  function role(c, label, y, fill) { c.font = `700 60px ${FE.FONT}`; const w = c.measureText(label).width + 56; c.fillStyle = fill; rr(c, CX - w / 2, y - 38, w, 76, 38); c.fill(); text(c, label, CX, y + 21, 60, C.navy); }
  function box(c, tab, en, es, chip, h, m, ta, stroke, chipCol) {
    card(c, CARD_X, EXY, CARD_W, h, { a: m, sc: .92 + .08 * m, stroke }); c.save(); c.globalAlpha = ta;
    en.forEach((l, i) => text(c, l, CX, EXY + 128 + i * 82, fit(c, l, 780, 84), C.navy)); if (es) text(c, es, CX, EXY + 284, fit(c, es, 780, 66), C.teal); if (chip) role(c, chip, EXY + 345, chipCol); c.restore(); KIT.tab(c, CARD_X + 24, EXY, tab, m);
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'think' }, { t: S(q.c02) - .3, v: 'warm' }, { t: S(q.c03) - .3, v: 'happy' }, { t: S(q.c05) - .3, v: 'warm' }, { t: S(q.c08) - .3, v: 'ask' }, { t: S(q.c11) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .35, v: 'presentL' }, { t: S(q.c03) - .35, v: 'presentR' }, { t: S(q.c05) - .35, v: 'both' }, { t: S(q.c06) - .35, v: 'presentR' }, { t: S(q.c08) - .35, v: 'pointR' }, { t: S(q.c11) - .35, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, 0, .5));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      if (t < K.hookOut + .35) {
        const p = E.back(seg(t, 0, .5)), o = out(t, K.hookOut), a = Math.min(1, p) * o;
        if (a > 0) { tail(c, CX, 1046, CX, HT.y, C.cream, a); c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.8 + .2 * Math.min(1, p), .8 + .2 * Math.min(1, p)); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); text(c, '¿Y después de', CX, 450 + 135, 100, C.navy); text(c, '“That’s nice”?', CX, 450 + 135 + 112, 104, C.teal); P.menuScene(c, 100, 745, 812, 280, t); c.restore(); }
      }
      if (t >= K.seIn && t < K.alOut + .35) {   // menu stage persists over setup -> reply -> invitation; one text state at a time
        const sa = Math.min(1, inn(t, K.seIn)) * out(t, K.alOut); if (sa > 0) { c.save(); c.globalAlpha = sa; P.menuScene(c, ...STAGE, t); c.restore(); }
        if (t < K.seOut + .35) { const o = out(t, K.seOut), m = Math.min(1, inn(t, K.seIn)) * o; if (m > 0) box(c, 'EJEMPLO', ['I tried a new', 'restaurant.'], null, null, 262, m, txt(t, K.seIn) * o); }
        if (t >= K.qIn && t < K.qOut + .35) { const o = out(t, K.qOut), m = Math.min(1, inn(t, K.qIn)) * o; if (m > 0) box(c, 'RESPUESTA POSIBLE', ['Oh, nice!', 'What was it like?'], '¿Cómo estuvo?', 'PREGUNTA DE SEGUIMIENTO'.length ? 'PREGUNTA' : '', 395, m, txt(t, K.qIn) * o, C.mint, C.mint); }
        if (t >= K.alIn) { const o = out(t, K.alOut), m = Math.min(1, inn(t, K.alIn)) * o; if (m > 0) box(c, 'OTRA OPCIÓN', ['Tell me more', 'about it.'], 'Cuéntame más.', 'INVITACIÓN', 395, m, txt(t, K.alIn) * o, C.coral, 'rgba(244,117,88,.9)'); }
      }
      if (t >= K.prIn && t < K.prOut + .35) {   // practice: movie ticket replaces the menu; no suggested question
        const o = out(t, K.prOut), pI = inn(t, K.prIn), m = Math.min(1, pI) * o, ta = txt(t, K.prIn) * o;
        if (m > 0) { pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 60, { a: m, sc: .85 + .15 * Math.min(1, pI) }); P.ticket(c, CX, 585, 400, 150, { a: m });
          card(c, CARD_X, 690, CARD_W, 240, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta; text(c, 'I watched a movie', CX, 690 + 100, 84, C.navy); text(c, 'last night.', CX, 690 + 190, 84, C.navy); c.restore();
          const qa = E.out(seg(t, K.quIn, K.quIn + .4)) * o; if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, '¿Qué preguntarías después?', CX, 1030, fit(c, '¿Qué preguntarías después?', 800, 70), C.cream, { a: qa }); c.restore(); } }
      }
      if (t >= K.cta) { const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24);
        KB.cta(c, 480, m * ta, [{ t: 'Speaking Club', size: 76 }, { t: 'Intermedios y avanzados', size: 62 }, { kw: 'CLUB', before: 'Manda', size: 66 }, { t: 'por mensaje privado.', size: 62 }]); c.restore(); }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
