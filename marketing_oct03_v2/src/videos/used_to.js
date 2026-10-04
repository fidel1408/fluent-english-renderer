/* FE261028-USED – one adult male host (present-day) outside the ANTES memory vignette. Used to + base verb: a past habit that changed (not "soccer is impossible now"). The completion stays blank. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = P3;
  const STAGE = [CARD_X, 450, CARD_W, 160], EXY = 668;
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'think' }, { t: S(q.c02) - .3, v: 'happy' }, { t: S(q.c04) - .3, v: 'warm' }, { t: S(q.c06) - .3, v: 'ask' }, { t: S(q.c09) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .35, v: 'presentL' }, { t: S(q.c04) - .35, v: 'presentR' }, { t: K.usedAt - .35, v: 'pointR' }, { t: S(q.c06) - .35, v: 'both' }, { t: S(q.c08) - .35, v: 'pointR' }, { t: S(q.c09) - .35, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, 0, .5));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      if (t < K.hookOut + .35) {
        const p = E.back(seg(t, 0, .5)), o = out(t, K.hookOut), a = Math.min(1, p) * o;
        if (a > 0) { tail(c, CX, 1046, CX, HT.y, C.cream, a); c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.8 + .2 * Math.min(1, p), .8 + .2 * Math.min(1, p)); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); text(c, 'Algo que', CX, 450 + 130, 100, C.navy); text(c, 'hacías antes', CX, 450 + 130 + 112, 100, C.teal); P.memoryScene(c, 100, 745, 812, 280, t, { bob: Math.abs(Math.sin(t * 3)) * 10 }); c.restore(); }
      }
      if (t >= K.exIn && t < K.ruOut + .35) {   // memory stage persists; it dims (the routine changed) and gets an AHORA chip when the rule card appears
        const sa = Math.min(1, inn(t, K.exIn)) * out(t, K.ruOut);
        if (sa > 0) { const ch = E.io(seg(t, K.ruIn + .3, K.ruIn + .7)) * (t >= K.ruIn ? 1 : 0); c.save(); c.globalAlpha = sa; P.memoryScene(c, ...STAGE, t, { faded: ch, ahora: ch }); c.restore(); }
        if (t < K.exOut + .35) { const o = out(t, K.exOut), m = Math.min(1, inn(t, K.exIn)) * o, ta = txt(t, K.exIn) * o; if (m > 0) { card(c, CARD_X, EXY, CARD_W, 372, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta;
          ['I used to play', 'soccer after school.'].forEach((l, i) => text(c, l, CX, EXY + 126 + i * 76, fit(c, l, 780, 78), C.navy)); ['Antes jugaba fútbol', 'después de la escuela.'].forEach((l, i) => text(c, l, CX, EXY + 272 + i * 64, fit(c, l, 780, 62), C.teal)); c.restore(); KIT.tab(c, CARD_X + 24, EXY, 'EJEMPLO', m); } }
        if (t >= K.ruIn) { const o = out(t, K.ruOut), m = Math.min(1, inn(t, K.ruIn)) * o, ta = txt(t, K.ruIn) * o; if (m > 0) { card(c, CARD_X, EXY, CARD_W, 430, { a: m, sc: .92 + .08 * m, stroke: C.mint }); c.save(); c.globalAlpha = ta;
          text(c, 'Un hábito de antes', CX, EXY + 124, 70, C.navy); text(c, 'que ya cambió', CX, EXY + 196, 70, C.teal);
          const u = E.out(seg(t, K.usedAt, K.usedAt + .4)); c.font = `700 60px ${FE.FONT}`; const w = c.measureText('USED TO + verbo base').width + 56; c.fillStyle = `rgba(114,216,198,${.4 + .6 * u})`; rr(c, CX - w / 2, EXY + 236, w, 76, 38); c.fill(); text(c, 'USED TO + verbo base', CX, EXY + 236 + 53, 60, C.navy);
          const pl = E.out(seg(t, K.playAt, K.playAt + .4)), pw = measure(c, 'play', 88); if (pl > 0) { c.fillStyle = `rgba(244,117,88,${.35 * pl})`; rr(c, CX - pw / 2 - 28, EXY + 326, pw + 56, 92, 28); c.fill(); } text(c, 'play', CX, EXY + 396, 88, C.navy); c.restore(); KIT.tab(c, CARD_X + 24, EXY, 'REGLA', m); } }
      }
      if (t >= K.prIn && t < K.prOut + .35) {
        const o = out(t, K.prOut), pI = inn(t, K.prIn), m = Math.min(1, pI) * o, ta = txt(t, K.prIn) * o;
        if (m > 0) { pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 60, { a: m, sc: .85 + .15 * Math.min(1, pI) }); card(c, CARD_X, 520, CARD_W, 250, { a: m, sc: .92 + .08 * m });
          c.save(); c.globalAlpha = ta; const w1 = measure(c, 'I used to', 92), tot = w1 + 24 + 300 + 10 + measure(c, '.', 92), x0 = CX - tot / 2; text(c, 'I used to', x0 + w1 / 2, 520 + 150, 92, C.navy);
          c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 + w1 + 24, 520 + 160); c.lineTo(x0 + w1 + 24 + 300, 520 + 160); c.stroke(); text(c, '.', x0 + w1 + 24 + 300 + 10 + 8, 520 + 150, 92, C.navy); c.restore();
          const qa = E.out(seg(t, K.quIn, K.quIn + .4)) * o; if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, '¿Cómo completarías', CX, 880, 76, C.cream, { a: qa }); text(c, 'la frase?', CX, 962, 76, C.cream, { a: qa }); c.restore(); } }
      }
      if (t >= K.cta) { const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24); KB.cta(c, 480, m * ta, [{ t: 'Clases en línea', size: 74 }, { kw: 'GRUPO', before: 'Manda', size: 66 }, { t: 'por mensaje privado.', size: 64 }]); c.restore();
        const sm = E.out(seg(t, K.cta + .3, K.cta + .8)); if (sm > 0) { c.save(); c.globalAlpha = sm; P.ball(c, 868, 545, 30); c.restore(); } }   // soccer vignette shrinks to a corner icon
    });
    caption(c, t, cues);
  }
  return { draw };
})();
