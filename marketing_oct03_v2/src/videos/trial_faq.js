/* FE261030-TRIALFAQ (TikTok-only) – one adult male host; exactly four connected week blocks inside ONE bracket (week 1 always inside; never a fifth block). No prices on screen (caption pointer only). */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = P3;
  const STAGE = [CARD_X, 450, CARD_W, 160], EXY = 668;
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'ask' }, { t: S(q.c02) - .3, v: 'warm' }, { t: S(q.c04) - .3, v: 'serious' }, { t: S(q.c05) - .3, v: 'warm' }, { t: S(q.c06) - .3, v: 'happy' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .35, v: 'presentL' }, { t: S(q.c03) - .35, v: 'presentR' }, { t: S(q.c04) - .35, v: 'both' }, { t: K.four - .35, v: 'pointR' }, { t: S(q.c05) - .35, v: 'presentL' }, { t: S(q.c06) - .35, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, 0, .5));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      if (t < K.hookOut + .35) {
        const p = E.back(seg(t, 0, .5)), o = out(t, K.hookOut), a = Math.min(1, p) * o;
        if (a > 0) { tail(c, CX, 1046, CX, HT.y, C.cream, a); c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.8 + .2 * Math.min(1, p), .8 + .2 * Math.min(1, p)); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); text(c, '¿Qué pasa después de', CX, 450 + 118, fit(c, '¿Qué pasa después de', 780, 84), C.navy); text(c, 'la semana de prueba?', CX, 450 + 118 + 96, fit(c, 'la semana de prueba?', 780, 84), C.teal);
          c.font = `700 60px ${FE.FONT}`; const gw = c.measureText('Grupos y Speaking Club').width + 70; c.fillStyle = C.mint; rr(c, CX - gw / 2, 450 + 250, gw, 84, 42); c.fill(); text(c, 'Grupos y Speaking Club', CX, 450 + 250 + 58, 60, C.navy);
          P.weekBlocks(c, 100, 800, 812, 230, t, {}); c.restore(); }
      }
      if (t >= K.trIn && t < K.coOut + .35) {   // week-block stage persists: week 1 highlighted first, then all four inside the same bracket
        const sa = Math.min(1, inn(t, K.trIn)) * out(t, K.coOut);
        if (sa > 0) { const f1 = E.out(seg(t, K.trIn + .3, K.trIn + .6)), fa = t >= K.coIn ? E.out(seg(t, K.coIn + .3, K.coIn + .6)) : 0, fo = Math.max(f1 * (1 - (t >= K.coIn ? 1 : 0)), 0), fill = [Math.max(f1, fa), fa, fa, fa], ring = E.out(seg(t, K.week1, K.week1 + .4)) * (t >= K.coIn ? 1 : 0), pul = E.out(seg(t, K.four, K.four + .4)) * (t >= K.coIn ? 1 : 0);
          c.save(); c.globalAlpha = sa; P.weekBlocks(c, ...STAGE, t, { fill, ring1: ring, bracketCol: t >= K.coIn ? C.coral : C.teal, pulse: pul }); c.restore(); }
        if (t < K.trOut + .35) { const o = out(t, K.trOut), m = Math.min(1, inn(t, K.trIn)) * o, ta = txt(t, K.trIn) * o; if (m > 0) { card(c, CARD_X, EXY, CARD_W, 412, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta;
          text(c, 'Primera semana', CX, EXY + 126, 74, C.navy); text(c, 'sin pago adelantado', CX, EXY + 206, fit(c, 'sin pago adelantado', 780, 74), C.navy);
          c.strokeStyle = 'rgba(16,30,52,.18)'; c.lineWidth = 4; c.beginPath(); c.moveTo(CX - 300, EXY + 244); c.lineTo(CX + 300, EXY + 244); c.stroke();
          text(c, 'Si no continúas,', CX, EXY + 316, 70, C.teal); text(c, 'no pagas.', CX, EXY + 390, 74, C.teal); c.restore(); KIT.tab(c, CARD_X + 24, EXY, 'SEMANA DE PRUEBA', m); } }
        if (t >= K.coIn) { const o = out(t, K.coOut), m = Math.min(1, inn(t, K.coIn)) * o, ta = txt(t, K.coIn) * o; if (m > 0) { card(c, CARD_X, EXY, CARD_W, 424, { a: m, sc: .92 + .08 * m, stroke: C.coral }); c.save(); c.globalAlpha = ta;
          text(c, 'Si continúas, el pago cubre', CX, EXY + 128, fit(c, 'Si continúas, el pago cubre', 780, 66), C.navy); text(c, 'las cuatro semanas', CX, EXY + 206, 70, C.navy); text(c, 'completas,', CX, EXY + 284, 70, C.navy); text(c, 'incluida la primera', CX, EXY + 362, fit(c, 'incluida la primera', 780, 70), C.coral); c.restore(); KIT.tab(c, CARD_X + 24, EXY, 'SI CONTINÚAS', m); } }
      }
      if (t >= K.deIn && t < K.deOut + .35) {   // dense Spanish details: eligibility + caption pointer, ~4 s settled
        const o = out(t, K.deOut), m = Math.min(1, inn(t, K.deIn)) * o, ta = txt(t, K.deIn) * o;
        if (m > 0) { card(c, CARD_X, 450, CARD_W, 640, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta;
          text(c, 'Precios y condiciones', CX, 450 + 110, fit(c, 'Precios y condiciones', 780, 68), C.navy); text(c, 'en la descripción', CX, 450 + 190, 68, C.navy);
          c.strokeStyle = 'rgba(16,30,52,.18)'; c.lineWidth = 4; c.beginPath(); c.moveTo(CX - 300, 450 + 232); c.lineTo(CX + 300, 450 + 232); c.stroke();
          text(c, 'Club: intermedios', CX, 450 + 316, fit(c, 'Club: intermedios', 780, 68), C.teal); text(c, 'y avanzados', CX, 450 + 396, 68, C.teal);
          c.beginPath(); c.moveTo(CX - 300, 450 + 438); c.lineTo(CX + 300, 450 + 438); c.stroke();
          text(c, 'Grupos: máx. 10', CX, 450 + 522, fit(c, 'Grupos: máx. 10', 780, 68), C.navy); text(c, 'Club: máx. 6', CX, 450 + 600, 68, C.navy); c.restore(); }
      }
      if (t >= K.cta) { const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24);
        KB.cta(c, 470, m * ta, [{ kw: 'GRUPO', before: 'Manda', size: 66 }, { kw: 'CLUB', before: 'o', size: 66 }, { t: 'por mensaje privado.', size: 64 }, { t: 'Clases en línea', size: 64 }]); c.restore(); }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
