/* FE261014-BORROW – one adult male host demonstrates both quoted lines (receiver viewpoint, then lender viewpoint). Zones YO / TÚ stay fixed;
   roles, ownership tag and the arrow appear only after their example is ready; the arrow always points from the lender to the receiver. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = PROPS;
  const TW = 424, LX = [CARD_X], RX = [CARD_X + CARD_W - TW];   // tray rects: left x..x+424, right x..x+424
  const TRAY_Y = 460, TRAY_H = 125, LANE_Y = 598, LANE_H = 177, PEN_Y = 708, ARR_Y = 752, EX_Y = 840, EX_H = 250;
  const OWN_R = 750, OWN_L = 262;                                                  // pen resting x at the right (TÚ) / left (YO) side of the lane
  function state(c, t, K, which, a, ta) {
    const b = which === 'borrow', t0 = b ? K.bIn : K.lIn, rolesT = b ? K.bRoles : K.lRoles, arrS = b ? K.bArrowS : K.lArrowS, arrE = b ? K.bArrowE : K.lArrowE, chipT = b ? K.bChip : K.lChip;
    const roles = E.back(seg(t, rolesT, rolesT + .4)), arrowP = E.io(seg(t, arrS, arrE)), r0 = Math.min(1, roles);
    // trays: left = YO, right = TÚ. borrow: YO receives, TÚ lends (owner). lend: YO lends (owner), TÚ receives.
    P.tray(c, LX[0], TRAY_Y, TW, TRAY_H, 'YO', { chip: b ? 'RECIBE' : 'PRESTA', chipCol: b ? C.mint : C.coral, chipA: roles, a, hl: r0 > .5 });
    P.tray(c, RX[0], TRAY_Y, TW, TRAY_H, 'TÚ', { chip: b ? 'PRESTA' : 'RECIBE', chipCol: b ? C.coral : C.mint, chipA: roles, a, hl: r0 > .5 });
    // lane: pen + (later) arrow from lender to receiver
    c.save(); c.globalAlpha *= a; c.fillStyle = '#16294a'; rr(c, CARD_X, LANE_Y, CARD_W, LANE_H, 40); c.fill(); c.restore();
    const from = b ? OWN_R : OWN_L, to = b ? OWN_L : OWN_R, penX = lerp(from, to, arrowP), bob = r0 > 0 ? 0 : Math.sin(t * 3) * 3;   // the pen only idles before the roles appear; it is stationary during the settled reading hold
    c.save(); c.beginPath(); c.roundRect(CARD_X, LANE_Y, CARD_W, LANE_H, 40); c.clip();
    P.arrow(c, from, to, ARR_Y, arrowP, { col: b ? C.mint : C.coral, a }); P.pen(c, penX, PEN_Y + bob, 1.25, 0, { a });
    c.restore();
    if (r0 > 0) { const tag = b ? 'tu pluma' : 'mi pluma'; c.save(); c.globalAlpha *= a * r0; c.font = `700 60px ${KIT.FONT || FE.FONT}`; const w = c.measureText(tag).width + 48, tx = Math.max(CARD_X + w / 2 + 14, Math.min(CARD_X + CARD_W - w / 2 - 14, penX));
      c.fillStyle = C.cream; rr(c, tx - w / 2, LANE_Y + 8, w, 72, 36); c.fill(); text(c, tag, tx, LANE_Y + 8 + 52, 60, C.navy); c.restore(); }
    // example unit: card first, then EN + ES together (coherent bilingual state)
    const m = a; card(c, CARD_X, EX_Y, CARD_W, EX_H, { a: m, stroke: null });
    c.save(); c.globalAlpha *= ta; const en = b ? 'Can I borrow your pen?' : 'I can lend you my pen.', es = b ? '¿Me prestas tu pluma?' : 'Te puedo prestar mi pluma.';
    text(c, en, CX, EX_Y + 78, fit(c, en, 780, 74), C.navy); text(c, es, CX, EX_Y + 144, fit(c, es, 780, 62), C.teal);
    const cp = E.back(seg(t, chipT, chipT + .4)); if (cp > 0) { const lab = b ? 'BORROW = recibir prestado' : 'LEND = prestar'; c.font = `700 60px ${FE.FONT}`; const w = c.measureText(lab).width + 60, sc = .8 + .2 * Math.min(1, cp); c.save(); c.globalAlpha *= Math.min(1, cp * 2); c.translate(CX, EX_Y + 202); c.scale(sc, sc);
      c.fillStyle = b ? C.mint : 'rgba(244,117,88,.9)'; rr(c, -w / 2, -38, w, 76, 38); c.fill(); text(c, lab, 0, 21, 60, C.navy); c.restore(); }
    c.restore(); KIT.tab(c, CARD_X + 24, EX_Y, b ? 'EJEMPLO: YO PIDO' : 'EJEMPLO: YO PRESTO', m);
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'ask' }, { t: S(q.c02) - .3, v: 'ask' }, { t: S(q.c04) - .3, v: 'warm' }, { t: S(q.c05) - .3, v: 'happy' }, { t: S(q.c07) - .3, v: 'warm' }, { t: S(q.c08) - .3, v: 'ask' }, { t: S(q.c09) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .35, v: 'both' }, { t: S(q.c04) - .35, v: 'presentL' }, { t: S(q.c05) - .35, v: 'presentR' }, { t: S(q.c07) - .35, v: 'presentR' }, { t: S(q.c08) - .35, v: 'pointR' }, { t: S(q.c09) - .35, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, .1, .6));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      // HOOK: one pen between two neutral zones (YO / TÚ). No role words, no arrow.
      if (t < K.hookEnd + .05) {
        const p = E.back(seg(t, .1, .6)), o = out(t, K.hookEnd - .3), a = Math.min(1, p) * o;
        if (a > 0) {
          tail(c, CX, 1046, CX, HT.y, C.cream, a);
          c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); text(c, '¿Te presto', CX, 450 + 140, 108, C.navy); text(c, 'o me prestas?', CX, 450 + 262, 108, C.teal);
          P.tray(c, 100, 780, 320, 125, 'YO', {}); P.tray(c, 592, 780, 320, 125, 'TÚ', {});
          c.fillStyle = C.navy2; rr(c, 100, 925, 812, 100, 36); c.fill();
          const sway = Math.sin(t * 2.2) * .12; P.pen(c, CX, 975 + Math.sin(t * 3) * 4, 1.2, sway);
          [[-250, 0], [250, 1.7]].forEach(([dx, ph]) => text(c, '?', CX + dx, 996 + Math.sin(t * 2 + ph) * 8, 84, C.mint, { a: .9 }));
          c.restore();
        }
      }
      // BORROW then LEND: complete viewpoint reset between them (everything leaves before the next state enters)
      if (t >= K.bIn && t < K.bOut + .4) { const o = out(t, K.bOut), m = Math.min(1, inn(t, K.bIn)) * o; if (m > 0) state(c, t, K, 'borrow', m, txt(t, K.bIn) * o); }
      if (t >= K.lIn && t < K.lOut + .4) { const o = out(t, K.lOut), m = Math.min(1, inn(t, K.lIn)) * o; if (m > 0) state(c, t, K, 'lend', m, txt(t, K.lIn) * o); }
      // PRACTICE: neutral blank; the charger replaces the pen; no arrow, no roles, no answer
      if (t >= K.pracIn && t < K.pracOut + .4) {
        const o = out(t, K.pracOut), pI = inn(t, K.pracIn), m = Math.min(1, pI) * o, ta = txt(t, K.pracIn) * o;
        if (m > 0) {
          pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 60, { a: m, sc: .85 + .15 * Math.min(1, pI) });
          card(c, CARD_X, 500, CARD_W, 400, { a: m, sc: .92 + .08 * m });
          c.save(); c.globalAlpha = ta; P.charger(c, 400, 622, 1.2, -.06);
          const f = 90; text(c, 'Can I', CX - 205, 500 + 270, f, C.navy);
          const bl = E.out(seg(t, K.canI - .1, K.canI + .3)); c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX - 90, 500 + 280); c.lineTo(CX - 90 + 330 * Math.max(bl, .001), 500 + 280); c.stroke();
          const ch = E.out(seg(t, K.charger - .15, K.charger + .25)); text(c, 'your charger?', CX, 500 + 365, f, C.navy, { a: Math.max(.35, ch) }); c.restore();
          const qa = E.out(seg(t, K.que - .1, K.que + .35)) * o; if (qa > 0) { c.save(); c.translate(0, (1 - qa) * 18); text(c, '¿Qué palabra falta?', CX, 1012, 74, C.cream, { a: qa }); c.restore(); }
        }
      }
      // CTA
      if (t >= K.cta) {
        const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24);
        KB.cta(c, 480, m * ta, [{ t: 'Clases en línea', size: 74 }, { kw: 'GRUPO', before: 'Manda', size: 66 }, { t: 'por mensaje privado.', size: 64 }]); c.restore();
      }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
