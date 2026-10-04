/* FE261019-CLARIFY – one adult male host models TWO SEPARATE question models (not question-answer). Fictional desk + calendar illustration; practice swaps the deadline for the next step, the answer stays hidden. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = P2;
  const STAGE = [CARD_X, 450, CARD_W, 190], EXY = 700, EXH = 395;
  function example(c, tab, en, es, m, ta, stroke) {     // card first, then text; tab badge clear of the English glyphs (>= 12 px)
    card(c, CARD_X, EXY, CARD_W, EXH, { a: m, sc: .92 + .08 * m, stroke }); c.save(); c.globalAlpha = ta;
    en.forEach((l, i) => text(c, l, CX, EXY + 128 + i * 82, fit(c, l, 780, 80), C.navy)); es.forEach((l, i) => text(c, l, CX, EXY + 284 + i * 66, fit(c, l, 780, 60), C.teal)); c.restore(); KIT.tab(c, CARD_X + 24, EXY, tab, m);
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'ask' }, { t: S(q.c02) - .3, v: 'warm' }, { t: S(q.c04) - .3, v: 'think' }, { t: S(q.c07) - .3, v: 'ask' }, { t: S(q.c08) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .35, v: 'presentL' }, { t: S(q.c04) - .35, v: 'presentR' }, { t: S(q.c07) - .35, v: 'pointR' }, { t: S(q.c08) - .35, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, 0, .5));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      if (t < K.hookOut + .35) {   // hook: card is fully there when the first word starts (lead 0.6 s)
        const p = E.back(seg(t, 0, .5)), o = out(t, K.hookOut), a = Math.min(1, p) * o;
        if (a > 0) { tail(c, CX, 1046, CX, HT.y, C.cream, a); c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.8 + .2 * Math.min(1, p), .8 + .2 * Math.min(1, p)); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); text(c, '¿Necesitas', CX, 450 + 135, 100, C.navy); text(c, 'aclarar una fecha?', CX, 450 + 135 + 112, fit(c, 'aclarar una fecha?', 780, 100), C.teal);
          P.deskScene(c, 100, 745, 812, 280, t, { fri: .6 }); c.restore(); }
      }
      if (t >= K.clIn && t < K.cfOut + .35) {   // stage (desk + calendar) persists over the two question models
        const sa = Math.min(1, inn(t, K.clIn)) * out(t, K.cfOut); if (sa > 0) { c.save(); c.globalAlpha = sa; P.deskScene(c, ...STAGE, t, { fri: E.out(seg(t, K.cfIn + .5, K.cfIn + 1)) }); c.restore(); }
        if (t < K.clOut + .35) { const o = out(t, K.clOut), m = Math.min(1, inn(t, K.clIn)) * o; if (m > 0) example(c, 'PEDIR UNA ACLARACIÓN', ['Could you clarify', 'the deadline?'], ['¿Podrías aclarar la', 'fecha límite?'], m, txt(t, K.clIn) * o); }
        if (t >= K.cfIn) { const o = out(t, K.cfOut), m = Math.min(1, inn(t, K.cfIn)) * o; if (m > 0) example(c, 'PARA CONFIRMAR', ['Do you mean', 'this Friday?'], ['¿Te refieres a', 'este viernes?'], m, txt(t, K.cfIn) * o, C.mint); }
      }
      if (t >= K.prIn && t < K.prOut + .35) {   // practice: swap suggestion first, then the blank phrase (never completed)
        const o = out(t, K.prOut), pI = inn(t, K.prIn), m = Math.min(1, pI) * o, ta = txt(t, K.prIn) * o;
        if (m > 0) { pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 60, { a: m, sc: .85 + .15 * Math.min(1, pI) });
          const chip = (label, y, fill, fg, a) => { c.save(); c.globalAlpha *= a; c.font = `700 62px ${FE.FONT}`; const w = c.measureText(label).width + 70; c.fillStyle = fill; rr(c, CX - w / 2, y, w, 86, 43); c.fill(); text(c, label, CX, y + 60, 62, fg); c.restore(); };
          chip('the deadline', 505, 'rgba(244,117,88,.9)', C.navy, ta);
          const na = E.out(seg(t, K.nextIn, K.nextIn + .4)) * o; if (na > 0) { c.save(); c.globalAlpha *= na; c.fillStyle = C.cream; c.beginPath(); c.moveTo(CX - 30, 618); c.lineTo(CX + 30, 618); c.lineTo(CX, 660); c.closePath(); c.fill(); c.restore(); chip('the next step', 668, C.mint, C.navy, na); }
          const si = inn(t, K.sentIn) * o; if (si > 0) { const sm = Math.min(1, si), st = txt(t, K.sentIn) * o; card(c, CARD_X, 780, CARD_W, 285, { a: sm, sc: .92 + .08 * sm }); c.save(); c.globalAlpha = st; text(c, 'Could you clarify', CX, 780 + 112, 84, C.navy);
            const bl = E.out(seg(t, K.sentIn + .55, K.sentIn + .9)); if (bl > 0) { c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX - 230, 780 + 230); c.lineTo(CX - 230 + 400 * bl, 780 + 230); c.stroke(); text(c, '?', CX + 215, 780 + 222, 84, C.navy, { a: bl }); } c.restore(); } }
      }
      if (t >= K.cta) { const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24);
        KB.cta(c, 480, m * ta, [{ t: 'Clases en línea', size: 70 }, { t: 'para tu equipo', size: 70 }, { kw: 'EMPRESA', before: 'Manda', size: 66 }, { t: 'por mensaje privado.', size: 62 }]); c.restore(); }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
