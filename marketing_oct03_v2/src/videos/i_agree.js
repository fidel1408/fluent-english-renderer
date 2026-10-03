/* VIDEO 1 – I AGREE. draw(c, t, cues, K) is a pure function of time; K comes from src/timelines/i_agree.js (cue-driven). */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, ground, text, tokens, pill, card, tail, particles, caption, measure } = FE;
  const { CARD_X, CARD_W } = KIT, rr = FE.rr;
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x);
    background(c, t);
    const moodW = t < K.hookEnd ? 'curious' : t < K.flip ? 'think' : t < K.qIn ? 'happy' : 'curious', moodM = t < K.hookEnd ? 'listen' : t < K.flip ? 'think' : t < K.qIn ? 'happy' : 'think';
    KIT.pair(c, t, { enter: seg(t, 0, .7), out: seg(t, K.avOut, K.avOut + .5), moodW, moodM, talkW: 0, talkM: KIT.speaking(t, cues) });   // man = the one educator voice; woman = silent listener
    ground(c); KIT.logoSmall(c, seg(t, .1, .6) * (1 - seg(t, K.avOut - .1, K.avOut + .3)));

    // hook
    if (t < K.hookEnd + .05) {
      const p = E.back(seg(t, .1, .6)), o = 1 - seg(t, K.hookEnd - .3, K.hookEnd), y = 470;
      if (o > 0) {
        tail(c, 700, y + 426, 790, 1062, C.cream, Math.min(1, p) * o);   // bubble belongs to the educator (right)
        card(c, CARD_X, y, CARD_W, 430, { a: Math.min(1, p * 2) * o, sc: .7 + .3 * p });
        c.save(); c.globalAlpha = Math.min(1, p * 2) * o; c.translate(CX, y + 430); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -(y + 430));
        text(c, '¿Estás de', CX, y + 170, 132, C.navy); text(c, 'acuerdo?', CX, y + 320, 132, C.navy); c.restore();
        [[860, 560, 0], [100, 790, 1.7]].forEach(([x, yy, ph]) => text(c, '?', x, yy + Math.sin(t * 2 + ph) * 12, 150, C.mint, { a: .75 * o * seg(t, .5, 1) }));
      }
    }
    // phrase card: incorrect -> (fix) -> correct -> example
    if (t >= K.badIn && t < K.exOut + .35) {
      const enterP = E.out(seg(t, K.badIn, K.badIn + .45)), exit = 1 - seg(t, K.exOut, K.exOut + .3), grow = E.io(seg(t, K.grow0, K.grow1));
      const phase = t < K.strikeS ? 'bad' : t < K.flip ? 'fix' : t < K.exLabel ? 'good' : 'ex';   // label always matches what is on the card
      const y = 500, h = lerp(240, 390, grow), flipP = E.back(seg(t, K.flip, K.flip + .4));
      c.save(); c.globalAlpha = enterP * exit; c.translate(0, (1 - enterP) * 36);
      card(c, CARD_X, y, CARD_W, h, { stroke: phase === 'bad' ? C.coral : phase === 'fix' ? C.teal : phase === 'good' ? C.mint : null });
      c.restore();
      // label: own opacity ramp (full strength well before the phrase text), pop animation never goes below 85% scale so it is never a sliver
      c.save(); c.globalAlpha = Math.min(1, enterP * 2.5) * exit; c.translate(0, (1 - enterP) * 36);
      const pop = x => .85 + .15 * x;
      if (phase === 'bad') pill(c, CX, 450, 'EVITA ESTA FRASE', C.coral, C.navy, 50, { icon: 'x', sc: .9 + .1 * enterP });
      else if (phase === 'fix') pill(c, CX, 450, 'QUITA AM', C.cream, C.navy, 50, { sc: pop(E.back(seg(t, K.strikeS, K.strikeS + .3))) });
      else if (phase === 'good') pill(c, CX, 450, 'DI ASÍ', C.mint, C.navy, 50, { icon: 'check', sc: pop(flipP) });
      else pill(c, CX, 450, 'EJEMPLO', C.mint, C.navy, 50);
      c.restore();
      c.save(); c.globalAlpha = enterP * exit; c.translate(0, (1 - enterP) * 36);
      // everything inside the card is clipped to the card: nothing can spill out or cross the label
      c.save(); KIT.clipRR(c, CARD_X + 5, y + 5, CARD_W - 10, h - 10, 58); c.globalAlpha *= seg(enterP, .45, 1);
      const lift = E.out(seg(t, K.liftS, K.liftE)), amW = 1 - E.io(seg(t, K.collS, K.collE)), flag = seg(t, K.flagS, K.flagE);
      const font = Math.min(150, 780 / measure(c, 'I am agree.', 100) * 100), baseY = y + 160 + (font - 140) * .2;
      const toks = [{ t: 'I' }, { t: 'am', col: t >= K.flagS ? C.coral : C.navy, under: t >= K.flagS ? C.coral : null, underP: flag, strike: t >= K.strikeS ? E.out(seg(t, K.strikeS, K.strikeE)) : 0, dx: 120 * lift, dy: -60 * lift, rot: -.35 * lift, sc: 1 - .5 * lift, a: 1 - seg(t, K.liftS + .25, K.liftS + .65), w: amW }, { t: 'agree.', col: t >= K.flip + .35 && t < K.exLabel ? C.teal : C.navy }];
      const keep = t >= K.wy, lay = tokens(c, keep ? [{ t: 'I' }, { t: 'agree' }] : toks, CX, baseY, font, C.navy);
      if (keep) {
        const a = E.back(seg(t, K.wy, K.wy + .45)), a2 = E.out(seg(t, K.wy, K.wy + .35));
        if (t >= K.hl) { const p = E.out(seg(t, K.hl, K.hl + .5)), wy = measure(c, 'with you.', font); c.fillStyle = 'rgba(114,216,198,.55)'; rr(c, CX - wy / 2 - 26, baseY + 150 - font * .86, (wy + 52) * p, font * 1.15, 40); c.fill(); }
        tokens(c, [{ t: 'with', dy: Math.min(0, (1 - a) * -50), a: a2 }, { t: 'you.', dy: Math.min(0, (1 - a) * -50), a: a2 }], CX, baseY + 150, font, C.navy);
      }
      c.restore();
      // sparkles are clipped to the card too, so the departing "am" and dust can never cross the label
      c.save(); KIT.clipRR(c, CARD_X + 5, y + 5, CARD_W - 10, h - 10, 58);
      if (t >= K.liftS && t <= K.liftS + 1) particles(c, t, K.liftS + .25, lay.x0 + measure(c, 'I', font) + font * .27 + measure(c, 'am', font) / 2 + 60, baseY - 70, 22, 11, [C.mint, C.cream, C.coral], .8, 150);
      if (t >= K.flip && t <= K.flip + 1.2) particles(c, t, K.flip + .03, CX + 40, baseY - 30, 18, 40, [C.mint, C.cream], 1.0, 200);
      c.restore(); c.restore();
      const ex = 1 - seg(t, K.expOut, K.expOut + .3), ta = E.out(seg(t, K.expA, K.expA + .4)) * ex, tb = E.out(seg(t, K.expB, K.expB + .4)) * ex;
      if (ta > 0) { c.save(); c.translate(0, (1 - ta) * 26); tokens(c, ['Agree', 'ya', 'es', 'un'].map(w => ({ t: w, a: ta, col: C.cream })).concat([{ t: 'verbo.', a: ta, col: C.mint }]), CX, 880, 80, C.cream); c.restore(); }
      if (tb > 0) { c.save(); c.translate(0, (1 - tb) * 26); tokens(c, ['Aquí', 'no', 'necesitas'].map(w => ({ t: w, a: tb, col: C.cream })).concat([{ t: 'am.', a: tb, col: C.coral }]), CX, 985, 80, C.cream); c.restore(); }
      const tr = E.out(seg(t, K.tr, K.tr + .5)) * exit;
      if (tr > 0) { c.save(); c.translate(0, (1 - tr) * 22); text(c, 'Estoy de acuerdo contigo.', CX, 1005, 66, C.mint, { a: tr }); c.restore(); }
    }
    // practice question
    if (t >= K.qIn && t < K.ctaIn + .1) {
      const p = E.back(seg(t, K.qIn, K.qIn + .55)), o = 1 - seg(t, K.ctaIn - .3, K.ctaIn), a = Math.min(1, p * 2) * o;
      if (a > 0) {
        pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 50, { a, sc: .8 + .2 * p });
        card(c, CARD_X, 490, CARD_W, 400, { a, sc: .8 + .2 * p });
        c.save(); c.globalAlpha = a; c.translate(CX, 890); c.scale(.8 + .2 * p, .8 + .2 * p); c.translate(-CX, -890);
        text(c, '¿Cómo dirías', CX, 625, 104, C.navy); text(c, '«No estoy de', CX, 745, 104, C.navy); text(c, 'acuerdo»?', CX, 865, 104, C.navy); c.restore();
        KIT.commentBox(c, t, 930, E.out(seg(t, K.box, K.box + .5)) * o, 'Escribe tu respuesta…');   // deliberately left empty
      }
    }
    // question (compact) + CTA – static hold until the end
    if (t >= K.ctaIn) {
      const u = t - K.ctaIn, qa = E.out(seg(u, .15, .65)), la = E.out(seg(u, .4, .95)), sa = E.out(seg(u, .7, 1.2)), g = E.back(seg(u, .9, 1.4));
      c.save(); c.globalAlpha = qa; c.translate(0, (1 - qa) * 28); text(c, '¿Cómo dirías', CX, 490, 72, C.cream); text(c, '«No estoy de acuerdo»?', CX, 570, 72, C.cream); c.restore();
      pill(c, CX, 645, 'Responde en los comentarios', C.mint, C.navy, 44, { a: qa });
      c.save(); c.translate(0, (1 - la) * 24); KIT.logoBig(c, 470, 705, la); c.restore();
      c.save(); c.globalAlpha = sa; c.translate(0, (1 - sa) * 24); text(c, 'Clases en línea', CX, 1030, 112, C.cream); c.restore();
      text(c, 'Manda', CX - 205, 1135, 72, C.cream, { a: sa });
      c.save(); c.translate(CX + 120, 1112); c.scale(g, g); c.globalAlpha = sa; c.fillStyle = C.coral; rr(c, -175, -55, 350, 110, 55); c.fill(); text(c, 'GRUPO', 0, 27, 72, C.navy); c.restore();
      text(c, 'por mensaje privado.', CX, 1235, 72, C.cream, { a: sa });
    }
    caption(c, t, cues);
  }
  return { draw };
})();
