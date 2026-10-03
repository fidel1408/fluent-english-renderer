/* VIDEO 3 – LOOKING FORWARD TO. One adult male host models both quoted lines. Rule shown only as "look forward to + verbo en -ing" / "+ sustantivo". */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT; const out = (t, a) => 1 - seg(t, a, a + .3);
  const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: seg(t, K.avOut, K.avOut + .5),
      moodKeys: [{ t: 0, v: 'ask' }, { t: S(q.c02), v: 'happy' }, { t: S(q.c04), v: 'warm' }, { t: S(q.c07), v: 'ask' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .2, v: 'presentL' }, { t: S(q.c03) - .2, v: 'presentR' }, { t: S(q.c04) - .2, v: 'pointR' }, { t: S(q.c06) - .2, v: 'presentR' }, { t: S(q.c07) - .3, v: 'both' }, { t: S(q.c08), v: 'pointR' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }] });
    KIT.logoSmall(c, seg(t, .1, .6) * (1 - seg(t, K.avOut - .1, K.avOut + .3)));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      if (t < K.hookEnd + .05) {
        const p = E.back(seg(t, .1, .6)), o = out(t, K.hookEnd - .3), a = Math.min(1, p * 2) * o;
        if (a > 0) { card(c, CARD_X, 470, CARD_W, 520, { a, sc: .7 + .3 * p }); tail(c, CX, 986, CX, HT.y, C.cream, Math.min(1, p) * o);
          c.save(); c.globalAlpha = a; c.translate(CX, 990); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -990);
          text(c, '¿Cómo dices:', CX, 610, 104, C.teal); text(c, 'tengo muchas', CX, 735, 112, C.navy); text(c, 'ganas de verte?', CX, 860, 112, C.navy); c.restore(); }
      }
      // dialogue with calendar: the host reads both lines (role chips)
      if (t >= K.calIn && t < K.dlgOut + .3) {
        const o = out(t, K.dlgOut), ca = E.back(seg(t, K.calIn, K.calIn + .5)), cp = Math.min(1, ca) * o;
        card(c, CARD_X, 460, CARD_W, 250, { a: cp, sc: .88 + .12 * Math.min(1, ca) }); c.save(); c.globalAlpha = cp;
        const colW = CARD_W / 7, u = E.io(seg(t, K.travelS, K.travelE)), tx = CARD_X + colW * (0.5 + 5 * u);
        DAYS.forEach((d, i) => { const x = CARD_X + colW * (i + .5), sat = i === 5 && u > .98; c.fillStyle = sat ? 'rgba(244,117,88,.15)' : 'rgba(16,30,52,.06)'; rr(c, x - colW * .4, 560, colW * .8, 120, 26); c.fill(); text(c, d, x, 524, 52, i === 5 ? C.coral : C.navy); });
        const hop = Math.abs(Math.sin(u * Math.PI * 5)) * 26 * (u < 1 ? 1 : 0); c.fillStyle = C.coral; c.beginPath(); c.arc(tx, 620 - hop, 30, 0, 6.2832); c.fill(); c.fillStyle = C.cream; c.beginPath(); c.arc(tx, 620 - hop, 11, 0, 6.2832); c.fill();
        c.restore(); const pa = E.back(seg(t, K.travelE, K.travelE + .4)) * o; if (pa > 0) pill(c, CARD_X + colW * 5.5, 745, 'Saturday', C.coral, C.navy, 44, { a: Math.min(1, pa), sc: .7 + .3 * Math.min(1, pa) });
        const b1 = E.back(seg(t, K.b1, K.b1 + .4)) * o, b2 = E.back(seg(t, K.b2, K.b2 + .4)) * o;
        if (b1 > 0) { const m = Math.min(1, b1); KIT.box(c, CARD_X, 800, CARD_W, 100, { a: m, sc: .85 + .15 * m, r: 46 }); c.save(); c.globalAlpha = m; text(c, 'See you on Saturday!', CX, 870, fit(c, 'See you on Saturday!', 780, 66), C.navy); c.restore(); pill(c, CARD_X + 135, 789, 'Alguien dice', C.cream, C.navy, 32, { a: m }); }
        if (b2 > 0) { const m = Math.min(1, b2); KIT.box(c, CARD_X, 935, CARD_W, 170, { fill: C.mint, a: m, sc: .85 + .15 * m, r: 48 });
          c.save(); c.globalAlpha = m; text(c, "I'm looking forward to", CX, 1009, fit(c, "I'm looking forward to", 780, 66), C.navy); tokens(c, [{ t: 'seeing you.', col: C.teal }], CX, 1081, 66, C.navy); c.restore(); pill(c, CARD_X + 140, 924, 'Tú respondes', C.cream, C.navy, 32, { a: m }); }
      }
      // focus: rule, then the noun variant on the same stationary card
      if (t >= K.fcIn && t < K.nvOut + .3) {
        const o = out(t, K.nvOut), p = E.back(seg(t, K.fcIn, K.fcIn + .5)), a = Math.min(1, p) * o;
        card(c, CARD_X, 470, CARD_W, 290, { a, sc: .85 + .15 * Math.min(1, p) }); c.save(); c.globalAlpha = a;
        const f = fit(c, "I'm looking forward to", 780, 84); text(c, "I'm looking forward to", CX, 595, f, C.navy);
        const sw = E.io(seg(t, K.swap, K.swap + .5)), hl = E.out(seg(t, K.seeHl, K.seeHl + .45)), hn = E.out(seg(t, K.noun, K.noun + .45)), base = 705;
        if (sw < 1) { c.save(); c.globalAlpha = a * (1 - Math.min(1, sw * 2)); c.translate(0, -sw * 40); const wv = measure(c, 'seeing you.', f); if (hl > 0) { c.fillStyle = 'rgba(114,216,198,.6)'; rr(c, CX - wv / 2 - 22, base - f * .86, (wv + 44) * hl, f * 1.12, 34); c.fill(); } text(c, 'seeing you.', CX, base, f, C.navy); c.restore(); }
        if (sw > 0.5) { c.save(); c.globalAlpha = a * Math.min(1, sw * 2 - 1); c.translate(0, (1 - sw) * 40); const wv = measure(c, 'the weekend.', f); if (hn > 0) { c.fillStyle = 'rgba(114,216,198,.6)'; rr(c, CX - wv / 2 - 22, base - f * .86, (wv + 44) * hn, f * 1.12, 34); c.fill(); } text(c, 'the weekend.', CX, base, f, C.navy); c.restore(); }
        c.restore();
        const ru = E.back(seg(t, K.rule, K.rule + .45)) * o; if (ru > 0) { const m = Math.min(1, ru), nounMode = t >= K.nounChip, ingA = E.out(seg(t, K.ruleIng, K.ruleIng + .3)), nA = E.out(seg(t, K.nounChip, K.nounChip + .3));
          KIT.box(c, CARD_X, 790, CARD_W, 150, { fill: C.mint, a: m, sc: .85 + .15 * m, r: 44 }); c.save(); c.globalAlpha = m; text(c, 'look forward to', CX, 852, 60, C.navy);
          if (!nounMode) text(c, '+ verbo en -ing', CX, 916, 60, C.teal, { a: ingA }); else text(c, '+ sustantivo', CX, 916, 60, C.teal, { a: nA }); c.restore(); }
        const t1 = E.out(seg(t, K.tr1, K.tr1 + .5)) * o * (1 - sw), t2 = E.out(seg(t, K.noun, K.noun + .5)) * o * sw;
        if (t1 > 0) { c.save(); c.translate(0, (1 - t1) * 18); text(c, 'Tengo muchas ganas de verte.', CX, 1010, fit(c, 'Tengo muchas ganas de verte.', 860, 60), C.mint, { a: t1 }); c.restore(); }
        if (t2 > 0) { c.save(); c.translate(0, (1 - t2) * 18); text(c, 'Tengo muchas ganas de que', CX, 995, 54, C.mint, { a: t2 }); text(c, 'llegue el fin de semana.', CX, 1062, 54, C.mint, { a: t2 }); c.restore(); }
      }
      // practice (unanswered); the host leaves after the last word for the static CTA hold
      if (t >= K.prIn) {
        const p = E.back(seg(t, K.prIn, K.prIn + .55)), a = Math.min(1, p * 2);
        pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 50, { a, sc: .8 + .2 * Math.min(1, p) }); card(c, CARD_X, 490, CARD_W, 290, { a, sc: .8 + .2 * Math.min(1, p) });
        c.save(); c.globalAlpha = a; const f = fit(c, "I'm looking forward to", 780, 84); text(c, "I'm looking forward to", CX, 615, f, C.navy);
        c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX - 270, 735); c.lineTo(CX + 230, 735); c.stroke(); text(c, '.', CX + 262, 735, f, C.navy); c.restore();
        const qa = E.out(seg(t, K.q, K.q + .4)); if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, '¿Cómo la completas?', CX, 875, 72, C.cream, { a: qa }); c.restore(); }
        KIT.commentBox(c, t, 905, E.out(seg(t, K.box, K.box + .5)), 'Escribe tu versión…');
        const ca = E.out(seg(t, K.cta, K.cta + .5)); if (ca > 0) { c.save(); c.translate(0, (1 - ca) * 20); KIT.cta(c, 1055, ca); c.restore(); }
      }
    });
    if (t >= K.cta) KIT.logoBig(c, 440, 1250, E.out(seg(t, K.cta + .3, K.cta + .9)));
    caption(c, t, cues);
  }
  return { draw };
})();
