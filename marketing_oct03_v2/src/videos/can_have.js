/* FE261012-CANHAVE – one adult male host demonstrates the quoted request; "Here you go." is an example response (hand + glass, no second speaker). */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = PROPS;
  const STAGE = [CARD_X, 450, CARD_W, 215];      // illustration panel above the example cards
  function stage(c, t, K, a) {                    // table scene: pitcher + glass; glow while requested; hand passes the glass during the response
    const [x, y, w, h] = STAGE; c.save(); c.globalAlpha *= a; card(c, x - 4, y - 4, w + 8, h + 8, { fill: 'rgba(0,0,0,0)' });
    const ty = P.tableScene(c, x, y, w, h, t); c.save(); c.beginPath(); c.roundRect(x, y, w, h, 44); c.clip();
    const pass = E.io(seg(t, K.pass, K.passE)), gx = lerp(560, 255, pass), by = ty + 36, gs = .78;
    P.pitcher(c, 790, ty + 14, .7, { level: .7, t });
    const glow = (seg(t, K.glow, K.glow + .4) * (1 - seg(t, K.reqOut - .3, K.reqOut))) * (.75 + .25 * Math.sin(t * 5));
    P.glass(c, gx, by, gs, { fill: 1, glow: Math.max(0, glow), t });
    const hand = t >= K.pass - .45 && t <= K.passE + .85 ? (t < K.pass ? E.out(seg(t, K.pass - .45, K.pass)) : 1 - E.in(seg(t, K.passE + .1, K.passE + .8))) : 0;
    if (hand > 0) { const hx = gx + (1 - hand) * 520; P.handHolding(c, hx, by, gs, Math.min(1, hand * 2)); }
    c.restore(); c.restore();
  }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'warm' }, { t: S(q.c02) - .3, v: 'ask' }, { t: S(q.c04) - .3, v: 'happy' }, { t: S(q.c06) - .3, v: 'warm' }, { t: S(q.c07) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .3, v: 'both' }, { t: S(q.c04) - .3, v: 'presentR' }, { t: S(q.c06) - .3, v: 'pointR' }, { t: S(q.c07) - .3, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, .1, .6));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      // 1 HOOK: card + pouring water; tail belongs to the host
      if (t < K.hookEnd + .05) {
        const p = E.back(seg(t, .1, .6)), o = out(t, K.hookEnd - .3), a = Math.min(1, p) * o;
        if (a > 0) {
          tail(c, CX, 1046, CX, HT.y, C.cream, a);
          c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600);
          const f = Math.min(104, 780 / Math.max(measure(c, 'Una frase para', 100), measure(c, 'practicar en casa', 100)) * 100);
          text(c, 'Una frase para', CX, 450 + 140, f, C.navy); text(c, 'practicar en casa', CX, 450 + 140 + f * 1.2, f, C.teal);
          const sx = 100, sy = 745, sw = 812, sh = 280, ty = P.tableScene(c, sx, sy, sw, sh, t);
          c.save(); c.beginPath(); c.roundRect(sx, sy, sw, sh, 44); c.clip();
          const pour = E.io(seg(t, K.pourS, K.pourS + .5)) * (1 - E.io(seg(t, K.pourE - .1, K.pourE + .4))), fill = E.io(seg(t, K.pourS + .3, K.pourE));
          const gcx = 420, gby = ty + 48, gs = .82; P.glass(c, gcx, gby, gs, { fill, t });
          P.pitcher(c, 680, ty + 18, .88, { level: 1 - .35 * fill, tilt: .52 * pour, pourTo: { x: gcx - 14, y: gby - 190 * gs * fill - 6 }, pour: pour > .3 ? 1 : 0, t });
          c.restore(); c.restore();
        }
      }
      // 2-3 REQUEST + RESPONSE: stage panel stays; the example cards switch as one bilingual unit each (card first, text after)
      if (t >= K.reqIn && t < K.respOut + .4) {
        const sIn = inn(t, K.reqIn), sa = Math.min(1, sIn) * out(t, K.respOut); stage(c, t, K, sa);
        // request unit
        if (t < K.reqOut + .4) {
          const o = out(t, K.reqOut), m = Math.min(1, sIn) * o, ta = txt(t, K.reqIn) * o;
          if (m > 0) { card(c, CARD_X, 735, CARD_W, 350, { a: m, sc: .9 + .1 * m }); c.save(); c.globalAlpha = ta;
            text(c, 'Can I have some', CX, 735 + 100, fit(c, 'Can I have some', 780, 84), C.navy); text(c, 'water, please?', CX, 735 + 185, 84, C.navy);
            text(c, '¿Me das un poco de agua,', CX, 735 + 262, fit(c, '¿Me das un poco de agua,', 780, 62), C.teal); text(c, 'por favor?', CX, 735 + 330, 62, C.teal); c.restore(); KIT.tab(c, CARD_X + 24, 735, 'EJEMPLO: PEDIR', m); }
        }
        // response unit (sequential, after the request has left)
        if (t >= K.respIn) {
          const o = out(t, K.respOut), rI = inn(t, K.respIn), m = Math.min(1, rI) * o, ta = txt(t, K.respIn) * o;
          if (m > 0) { card(c, CARD_X, 735, CARD_W, 300, { a: m, sc: .9 + .1 * m, stroke: C.mint }); c.save(); c.globalAlpha = ta;
            text(c, 'Here you go.', CX, 735 + 125, 100, C.navy); text(c, 'Aquí tienes.', CX, 735 + 235, 78, C.teal); c.restore(); KIT.tab(c, CARD_X + 24, 735, 'RESPUESTA DE EJEMPLO', m); }
        }
      }
      // 4 PRACTICE: water leaves, blank stays, juice card enters. The completed answer is never shown.
      if (t >= K.pracIn && t < K.pracOut + .4) {
        const o = out(t, K.pracOut), pI = inn(t, K.pracIn), m = Math.min(1, pI) * o, ta = txt(t, K.pracIn) * o;
        if (m > 0) {
          pill(c, CX, 440, 'A PRACTICAR', C.mint, C.navy, 60, { a: m, sc: .85 + .15 * Math.min(1, pI) });
          c.save(); c.globalAlpha = ta; tokens(c, [{ t: 'Ahora' }, { t: 'cambia' }], CX, 548, 66, C.cream); tokens(c, [{ t: 'water', col: C.coral }, { t: 'por' }, { t: 'juice.', col: C.mint }], CX, 622, 66, C.cream); c.restore();
          card(c, CARD_X, 655, CARD_W, 255, { a: m, sc: .92 + .08 * m });
          c.save(); c.globalAlpha = ta; const f = 86; text(c, 'Can I have some', CX, 655 + 105, f, C.navy);
          const wW = measure(c, 'water', f), pW = measure(c, ', please?', f), x0 = CX - (wW + pW) / 2, by = 655 + 208, hl = E.out(seg(t, K.waterHl, K.waterHl + .35)), ex = E.in(seg(t, K.waterOut, K.waterOut + .45));
          if (hl > 0 && ex < 1) { c.fillStyle = 'rgba(244,117,88,.28)'; rr(c, x0 - 14, by - f * .82, (wW + 28) * hl, f * 1.08, 28); c.fill(); }
          if (ex < 1) { c.save(); c.globalAlpha *= 1 - ex; c.translate(x0 + wW / 2, by - f * .3); c.rotate(-ex * .25); c.scale(1 - .4 * ex, 1 - .4 * ex); c.translate(-(x0 + wW / 2), -(by - f * .3)); text(c, 'water', x0 + wW / 2, by, f, C.navy); c.restore(); }
          const bl = E.out(seg(t, K.waterOut + .15, K.waterOut + .5)); if (bl > 0) { c.strokeStyle = C.teal; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, by + 10); c.lineTo(x0 + wW * bl, by + 10); c.stroke(); }   // never a zero-length round-capped dot
          text(c, ', please?', x0 + wW + pW / 2, by, f, C.navy); c.restore();
          const ji = E.back(seg(t, K.juiceIn, K.juiceIn + .5)) * o; if (ji > 0) { const jm = Math.min(1, ji); card(c, CARD_X, 935, CARD_W, 150, { a: jm, sc: .85 + .15 * jm, stroke: C.mint }); P.glass(c, 290, 1058, .56, { kind: 'juice', t: 0, a: jm }); text(c, 'juice', 600, 1038, 92, C.navy, { a: jm }); }
        }
      }
      // 5 CTA: text area cleared; the glass is a small corner icon
      if (t >= K.cta) {
        const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta);
        c.save(); c.translate(0, (1 - m) * 24); const y = 470;
        KB.cta(c, y, m * ta, [{ t: 'Clases en línea', size: 74 }, { t: 'para niños', size: 74 }, { t: 'Mamás y papás: manden', size: 62 }, { kw: 'NIÑOS', size: 64 }, { t: 'por mensaje privado.', size: 62 }]);
        c.restore(); P.glass(c, 878, 566, .4, { kind: 'water', t: 0, a: E.back(seg(t, K.cta + .3, K.cta + .8)) > 0 ? Math.min(1, E.out(seg(t, K.cta + .3, K.cta + .8))) : 0 });
      }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
