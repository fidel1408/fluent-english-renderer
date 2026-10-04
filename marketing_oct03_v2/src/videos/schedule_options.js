/* FE261016-SCHEDULE (TikTok adaptation) – one adult male host; every published weekday and weekend option, all in Monterrey time; Club level; no assigned class/start/teacher. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = PROPS;
  const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const mtyChip = (c, cx, cy, a) => { if (a <= 0) return; c.save(); c.globalAlpha *= a; c.font = `700 60px ${FE.FONT}`; const w = c.measureText('Hora de Monterrey').width + 64; c.fillStyle = C.teal; rr(c, cx - w / 2, cy - 38, w, 76, 38); c.fill(); text(c, 'Hora de Monterrey', cx, cy + 21, 60, C.cream); c.restore(); };
  function sun(c, x, y, r, t) { c.save(); c.translate(x, y); c.fillStyle = '#F6B73C'; c.beginPath(); c.arc(0, 0, r, 0, 6.2832); c.fill(); c.strokeStyle = '#F6B73C'; c.lineWidth = r * .22; c.lineCap = 'round'; for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4 + t * .3; c.beginPath(); c.moveTo(Math.cos(an) * r * 1.4, Math.sin(an) * r * 1.4); c.lineTo(Math.cos(an) * r * 1.85, Math.sin(an) * r * 1.85); c.stroke(); } c.restore(); }
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'ask' }, { t: S(q.c02) - .3, v: 'warm' }, { t: S(q.c04) - .3, v: 'serious' }, { t: S(q.c05) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: S(q.c02) - .3, v: 'presentL' }, { t: K.wk - .3, v: 'presentR' }, { t: S(q.c03) - .3, v: 'both' }, { t: S(q.c04) - .3, v: 'pointR' }, { t: S(q.c05) - .3, v: 'both' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: S(q.c02), x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, .1, .6));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      // 1 HOOK: weekly calendar (original): weekdays mint, weekend coral
      if (t < K.hookOut + .35) {
        const p = E.back(seg(t, .1, .6)), o = out(t, K.hookOut), a = Math.min(1, p) * o;
        if (a > 0) {
          tail(c, CX, 1046, CX, HT.y, C.cream, a);
          c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); const f = fit(c, 'o en fin de semana?', 780, 92);
          text(c, '¿Entre semana', CX, 450 + 122, f, C.navy); text(c, 'o en fin de semana?', CX, 450 + 122 + f * 1.18, f, C.teal);
          c.font = `700 60px ${FE.FONT}`; const gw = c.measureText('Grupos y Speaking Club').width + 70, gy = 450 + 122 + f * 1.18 + 62; c.fillStyle = C.mint; rr(c, CX - gw / 2, gy, gw, 84, 42); c.fill(); text(c, 'Grupos y Speaking Club', CX, gy + 58, 60, C.navy);
          const ty = 830; DAYS.forEach((d, i) => { const x = 112 + i * 108, we = i >= 5, pulse = 1 + .05 * Math.sin(t * 3 + i * .7); c.save(); c.translate(x + 48, ty + 90); c.scale(pulse, pulse); c.fillStyle = we ? C.coral : C.mint; rr(c, -48, -90, 96, 180, 28); c.fill(); text(c, d, 0, -18, 66, C.navy); c.fillStyle = 'rgba(16,30,52,.22)'; c.beginPath(); c.arc(0, 52, 22, 0, 6.2832); c.fill(); c.restore(); });
          c.restore();
        }
      }
      // 2 WEEKDAYS: five blocks, one hour each (ring sweeps once per day), starts on the hour 7 a. m. to 9 p. m.
      if (t >= K.wdIn && t < K.wdOut + .4) {
        const o = out(t, K.wdOut), wI = inn(t, K.wdIn), m = Math.min(1, wI) * o, ta = txt(t, K.wdIn) * o;
        if (m > 0) {
          card(c, CARD_X, 450, CARD_W, 640, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta;
          c.font = `700 64px ${FE.FONT}`; const hw = c.measureText('LUNES A VIERNES').width + 80; c.fillStyle = C.mint; rr(c, CX - hw / 2, 462, hw, 88, 44); c.fill(); text(c, 'LUNES A VIERNES', CX, 462 + 62, 64, C.navy);
          [0, 1, 2, 3, 4].forEach(i => { const bx = 116 + i * 160, ring = E.io(seg(t, K.wdIn + .55 + i * .12, K.wdIn + 1.05 + i * .12)); c.fillStyle = 'rgba(16,30,52,.07)'; rr(c, bx, 568, 140, 178, 34); c.fill(); text(c, DAYS[i], bx + 70, 568 + 60, 62, C.navy); P.clock(c, bx + 70, 568 + 118, 38, { ring }); });
          text(c, 'Una hora al día', CX, 818, 78, C.navy); text(c, 'Inicios en punto:', CX, 886, 62, C.teal); text(c, '7 a. m. a 9 p. m.', CX, 976, 92, C.navy); mtyChip(c, CX, 1044, 1); c.restore();
        }
      }
      // 3 WEEKEND: Saturday OR Sunday (alternatives), either morning block OR afternoon block
      if (t >= K.wkIn && t < K.wkOut + .4) {
        const o = out(t, K.wkOut), wI = inn(t, K.wkIn), m = Math.min(1, wI) * o, ta = txt(t, K.wkIn) * o;
        if (m > 0) {
          card(c, CARD_X, 450, CARD_W, 640, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta;
          c.font = `700 64px ${FE.FONT}`; const hw = c.measureText('SÁBADO O DOMINGO').width + 80; c.fillStyle = C.coral; rr(c, CX - hw / 2, 462, hw, 88, 44); c.fill(); text(c, 'SÁBADO O DOMINGO', CX, 462 + 62, 64, C.navy);
          [['SÁBADO', 100], ['DOMINGO', 558]].forEach(([n, x], i) => { const pp = E.back(seg(t, K.wkIn + .35 + i * .12, K.wkIn + .8 + i * .12)); c.save(); c.translate(x + 177, 641); c.scale(Math.max(.01, pp), Math.max(.01, pp)); c.translate(-(x + 177), -641);
            c.fillStyle = 'rgba(16,30,52,.07)'; rr(c, x, 566, 354, 150, 36); c.fill(); c.fillStyle = C.coral; c.beginPath(); c.roundRect(x, 566, 354, 68, [36, 36, 0, 0]); c.fill(); text(c, n, x + 177, 566 + 50, 60, C.navy); sun(c, x + 177, 678, 17, 0); c.restore(); });
          const oc = E.back(seg(t, K.wkIn + .5, K.wkIn + .9)); c.save(); c.translate(CX, 641); c.scale(Math.max(.01, oc), Math.max(.01, oc)); c.fillStyle = C.navy; c.beginPath(); c.arc(0, 0, 46, 0, 6.2832); c.fill(); text(c, 'o', 0, 20, 62, C.cream); c.restore();
          const pa = E.out(seg(t, K.wkIn + .6, K.wkIn + .9)); c.font = `700 70px ${FE.FONT}`; const aw = c.measureText('7 a. m.–12 p. m.').width + 70; c.save(); c.globalAlpha *= pa; c.fillStyle = C.mint; rr(c, CX - aw / 2, 736, aw, 90, 45); c.fill(); text(c, '7 a. m.–12 p. m.', CX, 736 + 65, 70, C.navy); text(c, 'o', CX, 886, 62, C.teal);
          const bw = c.measureText('1–6 p. m.').width + 70; c.fillStyle = C.mint; rr(c, CX - bw / 2, 904, bw, 90, 45); c.fill(); text(c, '1–6 p. m.', CX, 904 + 65, 70, C.navy); c.restore();
          c.restore();
          if (ta > .5) { c.save(); c.globalAlpha *= ta; mtyChip(c, CX, 1048, 1); c.restore(); }
        }
      }
      // 4 CONTEXT: Monterrey time (clock + pin), then Club level (stationary text); both stay together until the CTA
      if (t >= K.ctxIn && t < K.ctxOut + .4) {
        const o = out(t, K.ctxOut), m1 = Math.min(1, inn(t, K.ctxIn)) * o, t1 = txt(t, K.ctxIn) * o, m2 = Math.min(1, inn(t, K.clubIn)) * o, t2 = txt(t, K.clubIn) * o;
        if (m1 > 0) { card(c, CARD_X, 455, CARD_W, 230, { a: m1, sc: .92 + .08 * m1 }); c.save(); c.globalAlpha = t1; P.clock(c, 232, 570, 66, { ring: 1, hand: .25 }); P.pin(c, 300, 664, .85); text(c, 'Hora de', 640, 540, 84, C.navy); text(c, 'Monterrey', 640, 636, 90, C.teal); c.restore(); }
        if (m2 > 0) { card(c, CARD_X, 715, CARD_W, 340, { a: m2, sc: .92 + .08 * m2 }); c.save(); c.globalAlpha = t2; P.levelBars(c, 134, 960, 1.55, [false, true, true]);
          text(c, 'Club:', 640, 806, 70, C.teal); text(c, 'intermedios', 640, 900, 84, C.navy); text(c, 'y avanzados', 640, 994, 84, C.navy); c.restore(); }
      }
      // 5 CTA
      if (t >= K.cta) {
        const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24);
        KB.cta(c, 480, m * ta, [{ t: 'Clases en línea', size: 74 }, { kw: 'HORARIO', before: 'Manda', size: 66 }, { t: 'por mensaje privado.', size: 64 }]); c.restore();
      }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
