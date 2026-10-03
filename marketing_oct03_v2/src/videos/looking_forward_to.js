/* VIDEO 3 – LOOKING FORWARD TO. Rule shown only as "look forward to + verbo en -ing" (no general 'to + -ing' claim). */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, ground, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT; const out = (t, a) => 1 - seg(t, a, a + .3);
  const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const talking = x => t >= x.start && t <= x.end ? 1 : 0;
    background(c, t);
    KIT.pair(c, t, { enter: seg(t, 0, .7), out: seg(t, K.avOut, K.avOut + .5), moodW: t < K.hookEnd ? 'ask' : 'happy', moodM: 'happy', talkW: talking(q.c02), talkM: talking(q.c03), y: 1245, sc: 1.05 });
    ground(c); KIT.logoSmall(c, seg(t, .1, .6) * (1 - seg(t, K.avOut, K.avOut + .4)));
    if (t < K.hookEnd + .05) {
      const p = E.back(seg(t, .1, .6)), o = out(t, K.hookEnd - .3), a = Math.min(1, p * 2) * o;
      if (a > 0) { card(c, CARD_X, 470, CARD_W, 520, { a, sc: .7 + .3 * p }); tail(c, 250, 986, 196, 1130, C.cream, Math.min(1, p) * o);
        c.save(); c.globalAlpha = a; c.translate(CX, 990); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -990);
        text(c, '¿Cómo dices:', CX, 610, 104, C.teal); text(c, 'tengo muchas', CX, 735, 112, C.navy); text(c, 'ganas de verte?', CX, 860, 112, C.navy); c.restore(); }
    }
    // dialogue with calendar
    if (t >= K.calIn && t < K.dlgOut + .3) {
      const o = out(t, K.dlgOut), ca = E.back(seg(t, K.calIn, K.calIn + .5)); const cp = Math.min(1, ca) * o;
      card(c, CARD_X, 460, CARD_W, 250, { a: cp, sc: .88 + .12 * Math.min(1, ca) }); c.save(); c.globalAlpha = cp;
      const colW = CARD_W / 7, u = E.io(seg(t, K.travelS, K.travelE)), tx = CARD_X + colW * (0.5 + 5 * u);
      DAYS.forEach((d, i) => { const x = CARD_X + colW * (i + .5), sat = i === 5 && u > .98; c.fillStyle = sat ? 'rgba(244,117,88,.15)' : 'rgba(16,30,52,.06)'; rr(c, x - colW * .4, 560, colW * .8, 120, 26); c.fill(); text(c, d, x, 524, 52, i === 5 ? C.coral : C.navy); });
      const hop = Math.abs(Math.sin(u * Math.PI * 5)) * 26 * (u < 1 ? 1 : 0);
      c.fillStyle = C.coral; c.beginPath(); c.arc(tx, 620 - hop, 30, 0, 6.2832); c.fill(); c.fillStyle = C.cream; c.beginPath(); c.arc(tx, 620 - hop, 11, 0, 6.2832); c.fill();
      c.restore(); const pa = E.back(seg(t, K.travelE, K.travelE + .4)) * o; if (pa > 0) pill(c, CARD_X + colW * 5.5, 745, 'Saturday', C.coral, C.navy, 44, { a: Math.min(1, pa), sc: .7 + .3 * Math.min(1, pa) });
      const b1 = E.back(seg(t, K.b1, K.b1 + .4)) * o, b2 = E.back(seg(t, K.b2, K.b2 + .4)) * o;
      if (b1 > 0) { const m = Math.min(1, b1); KIT.box(c, CARD_X, 800, CARD_W, 110, { a: m, sc: .85 + .15 * m, r: 48 }); c.save(); c.globalAlpha = m; text(c, 'See you on Saturday!', CX, 874, fit(c, 'See you on Saturday!', 780, 66), C.navy); c.restore(); }
      if (b2 > 0) { const m = Math.min(1, b2); KIT.box(c, CARD_X, 935, CARD_W, 170, { fill: C.mint, a: m, sc: .85 + .15 * m, r: 48 }); c.save(); c.globalAlpha = m; text(c, "I'm looking forward to", CX, 935 + 74, fit(c, "I'm looking forward to", 780, 66), C.navy); tokens(c, [{ t: 'seeing you.', col: C.teal }], CX, 935 + 146, 66, C.navy); c.restore(); }
    }
    // focus: rule, then noun variant on the same stationary card
    if (t >= K.fcIn && t < K.nvOut + .3) {
      const o = out(t, K.nvOut), p = E.back(seg(t, K.fcIn, K.fcIn + .5)), a = Math.min(1, p) * o;
      card(c, CARD_X, 470, CARD_W, 290, { a, sc: .85 + .15 * Math.min(1, p) }); c.save(); c.globalAlpha = a;
      const f = fit(c, "I'm looking forward to", 780, 84); text(c, "I'm looking forward to", CX, 470 + 125, f, C.navy);
      const sw = E.io(seg(t, K.swap, K.swap + .5)), hl = E.out(seg(t, K.seeHl, K.seeHl + .45)), hn = E.out(seg(t, K.noun, K.noun + .45)); const base = 470 + 235;
      if (sw < 1) { c.save(); c.globalAlpha = a * (1 - sw); c.translate(0, -sw * 40); const wv = measure(c, 'seeing you.', f); if (hl > 0) { c.fillStyle = 'rgba(114,216,198,.6)'; rr(c, CX - wv / 2 - 22, base - f * .86, (wv + 44) * hl, f * 1.12, 34); c.fill(); } text(c, 'seeing you.', CX, base, f, C.navy); c.restore(); }
      if (sw > 0) { c.save(); c.globalAlpha = a * sw; c.translate(0, (1 - sw) * 40); const wv = measure(c, 'the weekend.', f); if (hn > 0) { c.fillStyle = 'rgba(114,216,198,.6)'; rr(c, CX - wv / 2 - 22, base - f * .86, (wv + 44) * hn, f * 1.12, 34); c.fill(); } text(c, 'the weekend.', CX, base, f, C.navy); c.restore(); }
      c.restore();
      const ru = E.back(seg(t, K.rule, K.rule + .45)) * o; if (ru > 0) { const m = Math.min(1, ru); KIT.box(c, CARD_X, 790, CARD_W, 150, { fill: C.mint, a: m, sc: .85 + .15 * m, r: 44 });
        c.save(); c.globalAlpha = m; text(c, 'look forward to', CX, 790 + 62, 60, C.navy); text(c, sw < .5 ? '+ verbo en -ing' : '+ sustantivo', CX, 790 + 126, 60, C.teal); c.restore(); }
      const t1 = E.out(seg(t, K.tr1, K.tr1 + .5)) * o * (1 - sw), t2 = E.out(seg(t, K.noun, K.noun + .5)) * o * sw;
      if (t1 > 0) { c.save(); c.translate(0, (1 - t1) * 18); text(c, 'Tengo muchas ganas de verte.', CX, 1010, fit(c, 'Tengo muchas ganas de verte.', 860, 60), C.mint, { a: t1 }); c.restore(); }
      if (t2 > 0) { c.save(); c.translate(0, (1 - t2) * 18); text(c, 'Tengo muchas ganas de que', CX, 995, 54, C.mint, { a: t2 }); text(c, 'llegue el fin de semana.', CX, 1062, 54, C.mint, { a: t2 }); c.restore(); }
    }
    // practice + discreet CTA
    if (t >= K.prIn) {
      const p = E.back(seg(t, K.prIn, K.prIn + .55)), a = Math.min(1, p * 2);
      pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 50, { a, sc: .8 + .2 * Math.min(1, p) });
      card(c, CARD_X, 490, CARD_W, 290, { a, sc: .8 + .2 * Math.min(1, p) });
      c.save(); c.globalAlpha = a; const f = fit(c, "I'm looking forward to", 780, 84); text(c, "I'm looking forward to", CX, 490 + 125, f, C.navy);
      c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX - 270, 490 + 245); c.lineTo(CX + 230, 490 + 245); c.stroke(); text(c, '.', CX + 262, 490 + 245, f, C.navy, { align: 'center' }); c.restore();
      const qa = E.out(seg(t, K.q, K.q + .4)); if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, '¿Cómo la completas?', CX, 875, 72, C.cream, { a: qa }); c.restore(); }
      KIT.commentBox(c, t, 905, E.out(seg(t, K.box, K.box + .5)), 'Escribe tu versión…');
      const ca = E.out(seg(t, K.cta, K.cta + .5)); if (ca > 0) { c.save(); c.translate(0, (1 - ca) * 20); KIT.cta(c, 1055, ca); c.restore(); }
    }
    caption(c, t, cues);
  }
  return { draw };
})();
