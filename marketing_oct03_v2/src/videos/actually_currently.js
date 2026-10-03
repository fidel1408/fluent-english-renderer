/* VIDEO 2 – ACTUALLY / CURRENTLY. One adult male host (the supplied Luis voice) models every line, including both quoted dialogue lines.
   "Actually" is never marked wrong and never "always means". Practice stays unanswered. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT; const out = (t, a) => 1 - seg(t, a, a + .3);
  function pin(c, x, y, label, col, pulse = 0) {
    c.save(); c.translate(x, y); if (pulse) { c.strokeStyle = col; c.globalAlpha = (1 - pulse) * .7; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 26 + pulse * 46, 0, 6.2832); c.stroke(); c.globalAlpha = 1; }
    c.fillStyle = col; c.beginPath(); c.arc(0, 0, 22, 0, 6.2832); c.fill(); c.fillStyle = C.navy; c.beginPath(); c.arc(0, 0, 8, 0, 6.2832); c.fill(); c.restore();
    text(c, label, x, y + 76, 46, C.cream);
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: seg(t, K.avOut, K.avOut + .5),
      moodKeys: [{ t: 0, v: 'ask' }, { t: S(q.c02), v: 'warm' }, { t: S(q.c04), v: 'happy' }, { t: S(q.c06), v: 'warm' }, { t: S(q.c07), v: 'ask' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .3, v: 'presentR' }, { t: S(q.c03) - .2, v: 'presentL' }, { t: S(q.c04) - .3, v: 'presentL' }, { t: S(q.c05) - .2, v: 'presentR' }, { t: K.dlgOut, v: 'rest' }, { t: S(q.c06) - .2, v: 'pointR' }, { t: S(q.c07) - .2, v: 'both' }, { t: S(q.c08) + 1.2, v: 'pointR' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }] });
    KIT.logoSmall(c, seg(t, .1, .6) * (1 - seg(t, K.avOut - .1, K.avOut + .3)));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      // hook (the "¿" opens the question)
      if (t < K.hookEnd + .05) {
        const p = E.back(seg(t, .1, .6)), o = out(t, K.hookEnd - .3), a = Math.min(1, p * 2) * o;
        if (a > 0) { card(c, CARD_X, 470, CARD_W, 520, { a, sc: .7 + .3 * p }); tail(c, CX, 986, CX, HT.y, C.cream, Math.min(1, p) * o);
          c.save(); c.globalAlpha = a; c.translate(CX, 990); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -990);
          tokens(c, [{ t: '¿Actually', col: C.teal }], CX, 640, 128, C.navy); text(c, 'significa', CX, 780, 116, C.navy); text(c, 'actualmente?', CX, 920, 116, C.navy); c.restore(); }
      }
      // compare: neutral treatment of both words
      if (t >= K.cmp1 - .1 && t < K.cmpOut + .3) {
        const o = out(t, K.cmpOut), a1 = E.back(seg(t, K.cmp1, K.cmp1 + .5)), a2 = E.back(seg(t, K.cmp2, K.cmp2 + .5));
        c.save(); c.globalAlpha = o;
        [[a1, 470, 'Actually', 'en realidad · de hecho', 0], [a2, 780, 'Currently', 'actualmente', 1]].forEach(([a, y, w, es, i]) => {
          if (a <= 0) return; const p = Math.min(1, a); card(c, CARD_X, y, CARD_W, 270, { a: p, sc: .85 + .15 * p, stroke: i ? null : C.mint });
          c.save(); c.globalAlpha *= p; text(c, 'suele significar', CX, y + 62, 44, C.teal, { weight: 600 }); text(c, w, CX, y + 168, 112, C.navy); text(c, es, CX, y + 244, 64, C.teal); c.restore(); });
        c.restore();
      }
      // dialogue: the host reads both lines; role chips make that explicit
      if (t >= K.dlgIn && t < K.dlgOut + .3) {
        const o = out(t, K.dlgOut), ma = E.out(seg(t, K.dlgIn, K.dlgIn + .5)) * o;
        c.save(); c.globalAlpha = ma; c.strokeStyle = 'rgba(114,216,198,.7)'; c.lineWidth = 6; c.setLineDash([2, 16]); c.lineCap = 'round'; c.beginPath(); c.moveTo(210, 500); c.quadraticCurveTo(CX, 330, 800, 500); c.stroke(); c.setLineDash([]);
        const pu = (t - K.travelE) / .9; pin(c, 210, 500, 'London', C.mint, 0); pin(c, 800, 500, 'Monterrey', C.mint, t >= K.travelE && pu < 1 ? pu : 0);
        const u = E.io(seg(t, K.travelS, K.travelE)), mx = (1 - u) * (1 - u) * 210 + 2 * u * (1 - u) * CX + u * u * 800, my = (1 - u) * (1 - u) * 500 + 2 * u * (1 - u) * 330 + u * u * 500 - 44 - Math.sin(u * 3.1416) * 20;
        c.fillStyle = C.coral; c.beginPath(); c.arc(mx, my, 26, 0, 6.2832); c.fill(); c.fillStyle = C.cream; c.beginPath(); c.arc(mx, my, 9, 0, 6.2832); c.fill(); c.restore();
        const b1 = E.back(seg(t, K.b1, K.b1 + .4)) * o, b2 = E.back(seg(t, K.b2, K.b2 + .4)) * o, tr = E.out(seg(t, K.tr, K.tr + .5)) * o;
        if (b1 > 0) { const m = Math.min(1, b1), f = fit(c, 'Do you live in London?', 780, 64); KIT.box(c, CARD_X, 665, CARD_W, 120, { a: m, sc: .85 + .15 * m, r: 46 }); c.save(); c.globalAlpha = m; text(c, 'Do you live in London?', CX, 755, f, C.navy); c.restore(); KIT.tab(c, CARD_X + 24, 665, 'Pregunta', m); }
        if (b2 > 0) { const m = Math.min(1, b2); KIT.box(c, CARD_X, 848, CARD_W, 176, { fill: C.mint, a: m, sc: .85 + .15 * m, r: 48 });
          c.save(); c.globalAlpha = m; tokens(c, [{ t: 'Actually,', col: C.teal }, { t: 'I live' }], CX, 936, 64, C.navy); text(c, 'in Monterrey.', CX, 1000, 64, C.navy); c.restore(); KIT.tab(c, CARD_X + 24, 848, 'Respuesta', m); }
        if (tr > 0) { c.save(); c.translate(0, (1 - tr) * 20); text(c, 'En realidad, vivo en Monterrey.', CX, 1078, fit(c, 'En realidad, vivo en Monterrey.', 860, 52), C.mint, { a: tr }); c.restore(); }
      }
      // present: "now" marker on a timeline
      if (t >= K.presIn && t < K.presOut + .3) {
        const o = out(t, K.presOut), p = E.back(seg(t, K.presIn, K.presIn + .5)), a = Math.min(1, p) * o;
        card(c, CARD_X, 470, CARD_W, 300, { a, sc: .85 + .15 * Math.min(1, p) }); c.save(); c.globalAlpha = a;
        const hl = E.out(seg(t, K.curHl, K.curHl + .5)), f = 92; c.font = `700 ${f}px ${FE.FONT}`; const wcur = c.measureText('currently').width, l1 = measure(c, "I'm currently", f), x0 = CX - l1 / 2, wI = measure(c, "I'm ", f);
        if (hl > 0) { c.fillStyle = 'rgba(114,216,198,.6)'; rr(c, x0 + wI - 16, 470 + 52, (wcur + 32) * hl, f * 1.18, 34); c.fill(); }
        text(c, "I'm currently", CX, 610, f, C.navy); text(c, 'studying English.', CX, 725, f, C.navy); c.restore();
        const ta = E.out(seg(t, K.nowS - .2, K.nowS + .4)) * o; if (ta > 0) {
          c.save(); c.globalAlpha = ta; c.strokeStyle = 'rgba(255,247,235,.5)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(120, 915); c.lineTo(900, 915); c.stroke();
          text(c, 'antes', 190, 985, 44, 'rgba(255,247,235,.7)', { weight: 500 }); text(c, 'después', 830, 985, 44, 'rgba(255,247,235,.7)', { weight: 500 });
          const pu = (Math.sin((t - K.nowS) * 3) + 1) / 2; c.strokeStyle = C.coral; c.globalAlpha = ta * (.2 + .5 * (1 - pu)); c.lineWidth = 6; c.beginPath(); c.arc(CX, 915, 30 + pu * 22, 0, 6.2832); c.stroke(); c.globalAlpha = ta;
          c.fillStyle = C.coral; c.beginPath(); c.arc(CX, 915, 26, 0, 6.2832); c.fill(); pill(c, CX, 845, 'AHORA', C.coral, C.navy, 44); c.restore(); }
        const te = E.out(seg(t, K.trEs, K.trEs + .5)) * o; if (te > 0) { c.save(); c.translate(0, (1 - te) * 20); text(c, 'Actualmente estudio inglés.', CX, 1075, 66, C.mint, { a: te }); c.restore(); }
      }
      // practice (unanswered) ; after the last spoken word the host leaves for the clean static CTA hold
      if (t >= K.prIn) {
        const p = E.back(seg(t, K.prIn, K.prIn + .55)), a = Math.min(1, p * 2);
        pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 50, { a, sc: .8 + .2 * Math.min(1, p) }); card(c, CARD_X, 490, CARD_W, 330, { a, sc: .8 + .2 * Math.min(1, p) });
        c.save(); c.globalAlpha = a; text(c, 'Actualmente trabajo', CX, 625, fit(c, 'Actualmente trabajo', 780, 100), C.navy); text(c, 'desde casa.', CX, 755, 108, C.navy); c.restore();
        const qa = E.out(seg(t, K.q, K.q + .4)); if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, 'Escribe tu versión.', CX, 925, 72, C.cream, { a: qa }); c.restore(); }
        KIT.commentBox(c, t, 960, E.out(seg(t, K.box, K.box + .5)), 'Escribe tu versión…');
        const ca = E.out(seg(t, K.cta + .25, K.cta + .75)); if (ca > 0) { c.save(); c.translate(0, (1 - ca) * 20); KIT.cta(c, 1095, ca); c.restore(); }   // starts after the host has slid away
      }
    });
    if (t >= K.cta) KIT.logoBig(c, 440, 1270, E.out(seg(t, K.cta + .35, K.cta + .95)));
    caption(c, t, cues);
  }
  return { draw };
})();
