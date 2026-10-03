/* VIDEO 2 – ACTUALLY / CURRENTLY. Neutral treatment of "actually": never marked as wrong, never "always means". */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, ground, text, tokens, pill, card, tail, particles, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT;
  const out = (t, a) => 1 - seg(t, a, a + .3);
  function pin(c, x, y, label, col, pulse = 0) {
    c.save(); c.translate(x, y); if (pulse) { c.strokeStyle = col; c.globalAlpha = (1 - pulse) * .7; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 26 + pulse * 46, 0, 6.2832); c.stroke(); c.globalAlpha = 1; }
    c.fillStyle = col; c.beginPath(); c.arc(0, 0, 22, 0, 6.2832); c.fill(); c.fillStyle = C.navy; c.beginPath(); c.arc(0, 0, 8, 0, 6.2832); c.fill(); c.restore();
    text(c, label, x, y + 76, 46, C.cream);
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const talking = x => t >= x.start && t <= x.end ? 1 : 0;
    background(c, t);
    const dlg = t >= K.dlgIn && t < K.dlgOut + .3;
    KIT.pair(c, t, { enter: seg(t, 0, .7), out: seg(t, K.avOut, K.avOut + .5), moodW: t < K.hookEnd ? 'ask' : 'listen', moodM: dlg ? 'happy' : 'listen', talkW: talking(q.c04) || talking(q.c01) * 0, talkM: talking(q.c05), y: 1245, sc: 1.05 });
    ground(c); KIT.logoSmall(c, seg(t, .1, .6) * (1 - seg(t, K.avOut, K.avOut + .4)));

    // hook
    if (t < K.hookEnd + .05) {
      const p = E.back(seg(t, .1, .6)), o = out(t, K.hookEnd - .3), a = Math.min(1, p * 2) * o;
      if (a > 0) { card(c, CARD_X, 470, CARD_W, 520, { a, sc: .7 + .3 * p }); tail(c, 250, 986, 196, 1130, C.cream, Math.min(1, p) * o);
        c.save(); c.globalAlpha = a; c.translate(CX, 990); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -990);
        tokens(c, [{ t: 'Actually', col: C.teal }], CX, 640, 128, C.navy); text(c, 'significa', CX, 780, 116, C.navy); text(c, 'actualmente?', CX, 920, 116, C.navy); c.restore(); }
    }
    // compare
    if (t >= K.cmp1 - .1 && t < K.cmpOut + .3) {
      const o = out(t, K.cmpOut), a1 = E.back(seg(t, K.cmp1, K.cmp1 + .5)), a2 = E.back(seg(t, K.cmp2, K.cmp2 + .5));
      c.save(); c.globalAlpha = o;
      [[a1, 470, 'Actually', 'en realidad · de hecho', C.teal], [a2, 780, 'Currently', 'actualmente', C.coral]].forEach(([a, y, w, es, col], i) => {
        if (a <= 0) return; const p = Math.min(1, a); card(c, CARD_X, y, CARD_W, 270, { a: p, sc: .85 + .15 * p, stroke: i ? null : C.mint });
        c.save(); c.globalAlpha *= p; text(c, 'suele significar', CX, y + 62, 44, C.teal, { weight: 600 }); text(c, w, CX, y + 168, 112, C.navy); text(c, es, CX, y + 244, 64, i ? C.teal : C.teal); c.restore(); });
      c.restore();
    }
    // dialogue + moving city marker (abstract map: two pins and a dotted arc)
    if (t >= K.dlgIn && t < K.dlgOut + .3) {
      const o = out(t, K.dlgOut), ma = E.out(seg(t, K.dlgIn, K.dlgIn + .5)) * o;
      c.save(); c.globalAlpha = ma;
      c.strokeStyle = 'rgba(114,216,198,.7)'; c.lineWidth = 6; c.setLineDash([2, 16]); c.lineCap = 'round'; c.beginPath(); c.moveTo(210, 600); c.quadraticCurveTo(CX, 400, 800, 600); c.stroke(); c.setLineDash([]);
      const lon = Math.max(0, 1 - E.io(seg(t, K.travelE - .2, K.travelE + .5))), pu = (t - K.travelE) / .9;
      pin(c, 210, 600, 'London', C.mint, 0); pin(c, 800, 600, 'Monterrey', C.mint, t >= K.travelE && pu < 1 ? pu : 0);
      const u = E.io(seg(t, K.travelS, K.travelE)), mx = (1 - u) * (1 - u) * 210 + 2 * u * (1 - u) * CX + u * u * 800, my = (1 - u) * (1 - u) * 600 + 2 * u * (1 - u) * 400 + u * u * 600 - Math.sin(u * 3.1416) * 0;
      c.fillStyle = C.coral; c.beginPath(); c.arc(mx, my - 44 - Math.sin(u * 3.1416) * 20, 26, 0, 6.2832); c.fill(); c.fillStyle = C.cream; c.beginPath(); c.arc(mx, my - 44 - Math.sin(u * 3.1416) * 20, 9, 0, 6.2832); c.fill();
      c.restore();
      const b1 = E.back(seg(t, K.b1, K.b1 + .4)) * o, b2 = E.back(seg(t, K.b2, K.b2 + .4)) * o, tr = E.out(seg(t, K.tr, K.tr + .5)) * o;
      if (b1 > 0) { const f = fit(c, 'Do you live in London?', 780, 64); KIT.box(c, CARD_X, 720, CARD_W, 110, { a: Math.min(1, b1), sc: .85 + .15 * Math.min(1, b1), r: 48 }); c.save(); c.globalAlpha = Math.min(1, b1); text(c, 'Do you live in London?', CX, 720 + 74, f, C.navy); c.restore(); }
      if (b2 > 0) { KIT.box(c, CARD_X, 850, CARD_W, 170, { fill: C.mint, a: Math.min(1, b2), sc: .85 + .15 * Math.min(1, b2), r: 48 });
        c.save(); c.globalAlpha = Math.min(1, b2); tokens(c, [{ t: 'Actually,', col: C.teal }, { t: 'I live' }], CX, 850 + 78, 66, C.navy); text(c, 'in Monterrey.', CX, 850 + 150, 66, C.navy); c.restore(); }
      if (tr > 0) { c.save(); c.translate(0, (1 - tr) * 20); text(c, 'En realidad, vivo en Monterrey.', CX, 1075, fit(c, 'En realidad, vivo en Monterrey.', 860, 52), C.mint, { a: tr }); c.restore(); }
    }
    // present: now marker on a timeline
    if (t >= K.presIn && t < K.presOut + .3) {
      const o = out(t, K.presOut), p = E.back(seg(t, K.presIn, K.presIn + .5)), a = Math.min(1, p) * o;
      card(c, CARD_X, 470, CARD_W, 300, { a, sc: .85 + .15 * Math.min(1, p) });
      c.save(); c.globalAlpha = a;
      const hl = E.out(seg(t, K.curHl, K.curHl + .5)), f = 92;
      c.font = `700 ${f}px ${FE.FONT}`; const wcur = c.measureText('currently').width; // line 1: I'm currently
      const l1 = measure(c, "I'm currently", f), x0 = CX - l1 / 2, wI = measure(c, "I'm ", f);
      if (hl > 0) { c.fillStyle = 'rgba(114,216,198,.6)'; rr(c, x0 + wI - 16, 470 + 52, (wcur + 32) * hl, f * 1.18, 34); c.fill(); }
      text(c, "I'm currently", CX, 470 + 140, f, C.navy); text(c, 'studying English.', CX, 470 + 255, f, C.navy); c.restore();
      // timeline
      const ta = E.out(seg(t, K.nowS - .2, K.nowS + .4)) * o; if (ta > 0) {
        c.save(); c.globalAlpha = ta; c.strokeStyle = 'rgba(255,247,235,.5)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(120, 915); c.lineTo(900, 915); c.stroke();
        text(c, 'antes', 190, 985, 44, 'rgba(255,247,235,.7)', { weight: 500 }); text(c, 'después', 830, 985, 44, 'rgba(255,247,235,.7)', { weight: 500 });
        const pu = (Math.sin((t - K.nowS) * 3) + 1) / 2; c.strokeStyle = C.coral; c.globalAlpha = ta * (.2 + .5 * (1 - pu)); c.lineWidth = 6; c.beginPath(); c.arc(CX, 915, 30 + pu * 22, 0, 6.2832); c.stroke(); c.globalAlpha = ta;
        c.fillStyle = C.coral; c.beginPath(); c.arc(CX, 915, 26, 0, 6.2832); c.fill(); pill(c, CX, 845, 'AHORA', C.coral, C.navy, 44); c.restore(); }
      const te = E.out(seg(t, K.trEs, K.trEs + .5)) * o; if (te > 0) { c.save(); c.translate(0, (1 - te) * 20); text(c, 'Actualmente estudio inglés.', CX, 1075, 66, C.mint, { a: te }); c.restore(); }
    }
    // practice + discreet CTA (static at the end)
    if (t >= K.prIn) {
      const p = E.back(seg(t, K.prIn, K.prIn + .55)), a = Math.min(1, p * 2);
      pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 50, { a, sc: .8 + .2 * Math.min(1, p) });
      card(c, CARD_X, 490, CARD_W, 330, { a, sc: .8 + .2 * Math.min(1, p) });
      c.save(); c.globalAlpha = a; text(c, 'Actualmente trabajo', CX, 490 + 135, fit(c, 'Actualmente trabajo', 780, 100), C.navy); text(c, 'desde casa.', CX, 490 + 265, 108, C.navy); c.restore();
      const qa = E.out(seg(t, K.q, K.q + .4)); if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, 'Escribe tu versión.', CX, 925, 72, C.cream, { a: qa }); c.restore(); }
      KIT.commentBox(c, t, 960, E.out(seg(t, K.box, K.box + .5)), 'Escribe tu versión…');
      const ca = E.out(seg(t, K.cta, K.cta + .5)); if (ca > 0) { c.save(); c.translate(0, (1 - ca) * 20); KIT.cta(c, 1100, ca); c.restore(); }
    }
    caption(c, t, cues);
  }
  return { draw };
})();
