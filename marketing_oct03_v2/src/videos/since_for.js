/* FE261026-SINCEFOR – one adult male host; apartment key/door + timeline. FOR = duration span; SINCE = starting point 2024 continuing to AHORA. Example, translation and rule are replaced as ONE state; practice clears solved material. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = P3;
  const STAGE = [CARD_X, 450, CARD_W, 160], EXY = 668, EXH = 432;
  function example(c, tab, en, es, rule, ruleCol, m, ta, stroke) {
    card(c, CARD_X, EXY, CARD_W, EXH, { a: m, sc: .92 + .08 * m, stroke }); c.save(); c.globalAlpha = ta;
    en.forEach((l, i) => text(c, l, CX, EXY + 126 + i * 76, fit(c, l, 780, 76), C.navy)); es.forEach((l, i) => text(c, l, CX, EXY + 266 + i * 62, fit(c, l, 780, 60), C.teal));
    c.font = `700 60px ${FE.FONT}`; const w = c.measureText(rule).width + 56; c.fillStyle = ruleCol; rr(c, CX - w / 2, EXY + 350, w, 76, 38); c.fill(); text(c, rule, CX, EXY + 350 + 53, 60, C.navy); c.restore(); KIT.tab(c, CARD_X + 24, EXY, tab, m);
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'warm' }, { t: S(q.c02) - .3, v: 'happy' }, { t: S(q.c05) - .3, v: 'warm' }, { t: S(q.c08) - .3, v: 'ask' }, { t: S(q.c11) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .35, v: 'presentL' }, { t: K.forAt - .35, v: 'pointR' }, { t: S(q.c05) - .35, v: 'presentR' }, { t: K.sinceAt - .35, v: 'pointR' }, { t: S(q.c08) - .35, v: 'both' }, { t: S(q.c10) - .35, v: 'pointR' }, { t: S(q.c11) - .35, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, 0, .5));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      if (t < K.hookOut + .35) {   // "Empezó antes y sigue ahora" is visible from the opening, with the door/key timeline ending at AHORA
        const p = E.back(seg(t, 0, .5)), o = out(t, K.hookOut), a = Math.min(1, p) * o;
        if (a > 0) { tail(c, CX, 1046, CX, HT.y, C.cream, a); c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.8 + .2 * Math.min(1, p), .8 + .2 * Math.min(1, p)); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); text(c, 'Empezó antes', CX, 450 + 130, 100, C.navy); text(c, 'y sigue ahora', CX, 450 + 130 + 112, 100, C.teal); P.timelineScene(c, 100, 745, 812, 280, t, {}); c.restore(); }
      }
      if (t >= K.duIn && t < K.stOut + .35) {   // timeline stage persists; FOR bracket grows at "For", SINCE flag + arrow at "Since"
        const sa = Math.min(1, inn(t, K.duIn)) * out(t, K.stOut);
        if (sa > 0) { const pf = E.out(seg(t, K.forAt, K.forAt + .5)) * (1 - seg(t, K.duOut, K.duOut + .25)), ps = t >= K.stIn ? E.out(seg(t, K.sinceAt, K.sinceAt + .5)) : 0;
          c.save(); c.globalAlpha = sa; P.timelineScene(c, ...STAGE, t, t >= K.stIn ? { mode: 'since', p: ps } : { mode: 'for', p: pf }); c.restore(); }
        if (t < K.duOut + .35) { const o = out(t, K.duOut), m = Math.min(1, inn(t, K.duIn)) * o; if (m > 0) example(c, 'EJEMPLO: FOR', ['I’ve lived here', 'for two years.'], ['Vivo aquí desde', 'hace dos años.'], 'FOR + duración', C.mint, m, txt(t, K.duIn) * o); }
        if (t >= K.stIn) { const o = out(t, K.stOut), m = Math.min(1, inn(t, K.stIn)) * o; if (m > 0) example(c, 'EJEMPLO: SINCE', ['I’ve lived here', 'since 2024.'], ['Vivo aquí', 'desde 2024.'], 'SINCE + inicio', 'rgba(244,117,88,.9)', m, txt(t, K.stIn) * o, C.coral); }
      }
      if (t >= K.prIn && t < K.prOut + .35) {   // practice: no solved example, no active highlight; the blank stays empty
        const o = out(t, K.prOut), pI = inn(t, K.prIn), m = Math.min(1, pI) * o, ta = txt(t, K.prIn) * o;
        if (m > 0) { pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 60, { a: m, sc: .85 + .15 * Math.min(1, pI) }); card(c, CARD_X, 520, CARD_W, 330, { a: m, sc: .92 + .08 * m });
          c.save(); c.globalAlpha = ta; text(c, 'I’ve studied English', CX, 520 + 125, 82, C.navy); const w2 = measure(c, 'six months.', 82), tot = 270 + 26 + w2, x0 = CX - tot / 2;
          c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, 520 + 250); c.lineTo(x0 + 270, 520 + 250); c.stroke(); text(c, 'six months.', x0 + 270 + 26 + w2 / 2, 520 + 240, 82, C.navy); c.restore();
          const qa = E.out(seg(t, K.quIn, K.quIn + .4)) * o; if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, '¿Since o for?', CX, 960, 88, C.cream, { a: qa }); c.restore(); } }
      }
      if (t >= K.cta) { const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24); KB.cta(c, 480, m * ta, [{ t: 'Clases en línea', size: 74 }, { kw: 'GRUPO', before: 'Manda', size: 66 }, { t: 'por mensaje privado.', size: 64 }]); c.restore(); }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
