/* VIDEO 1 – I AGREE (20 s). draw(c, t, cues) is a pure function of t. Cue times come from manifest/i_agree.cues.json. */
window.VIDEO = (() => {
  const { W, H, CX, C, E, seg, lerp, background, ground, text, tokens, pill, card, tail, particles, avatar, caption, measure } = FE;
  const CARD_X = 72, CARD_W = 868;
  const cue = (cues, id) => cues.find(q => q.id === id);
  const fade = (t, a, b, c2, d) => Math.min(seg(t, a, b), 1 - seg(t, c2, d));      // in a..b, out c2..d

  function logoSmall(c, t) {
    const a = seg(t, .1, .6) * (1 - seg(t, 16.0, 16.4)); if (a <= 0 || !window.LOGO) return;
    const w = 330, h = w * 1181 / 2640; c.save(); c.globalAlpha = a; c.drawImage(window.LOGO, 405, 348, 2640, 1181, 72, 205, w, h); c.restore();
  }

  function draw(c, t, cues) {
    background(c, t);
    const c01 = cue(cues, 'c01'), c04 = cue(cues, 'c04'), c05 = cue(cues, 'c05'), c06 = cue(cues, 'c06'), c07 = cue(cues, 'c07');
    const talking = q => t >= q.start && t <= q.end ? 1 : 0;
    const avOut = seg(t, 16.1, 16.6), avDy = E.in(avOut) * 330;
    // ---- avatars (behind ledge)
    const moodW = t < 2.4 ? 'ask' : t < 4.75 ? 'think' : t < 13.4 ? 'happy' : 'ask';
    const moodM = t < 2.4 ? 'listen' : t < 4.75 ? 'think' : t < 13.4 ? 'happy' : 'think';
    const enter = E.back(seg(t, .0, .7));
    if (avOut < 1) {
      avatar(c, 'woman', 190, 1205 + (1 - enter) * 300 + avDy, t, { mood: moodW, talk: talking(c01) || talking(c07), sc: 1.4 });
      avatar(c, 'man', 790, 1205 + (1 - enter) * 300 + avDy, t, { mood: moodM, talk: talking(c05), sc: 1.4 });
    }
    ground(c);
    logoSmall(c, t);

    // ---- S1 hook 0–2.4
    if (t < 2.5) {
      const p = E.back(seg(t, .1, .6)), o = 1 - seg(t, 2.15, 2.4), y = 470;
      if (o > 0) {
        tail(c, 250, y + 430 - 4, 196, 1062, C.cream, Math.min(1, p) * o);
        card(c, CARD_X, y, CARD_W, 430, { a: Math.min(1, p * 2) * o, sc: .7 + .3 * p });
        c.save(); c.globalAlpha = Math.min(1, p * 2) * o; c.translate(CX, y + 430); c.scale(.7 + .3 * p, .7 + .3 * p); c.translate(-CX, -(y + 430));
        text(c, '¿Estás de', CX, y + 170, 132, C.navy); text(c, 'acuerdo?', CX, y + 320, 132, C.navy); c.restore();
        [[860, 560, 0], [100, 790, 1.7]].forEach(([x, yy, ph]) => text(c, '?', x, yy + Math.sin(t * 2 + ph) * 12, 150, C.mint, { a: .75 * o * seg(t, .5, 1) }));
      }
    }

    // ---- S2–S4 phrase card
    if (t >= 2.4 && t < 13.5) {
      const enterP = E.out(seg(t, 2.4, 2.85)), exit = 1 - seg(t, 13.1, 13.4), grow = E.io(seg(t, (c05.start - .2), c05.start + .35));
      const bad = t < 4.75, y = 500, h = lerp(240, 390, grow);
      const flip = E.back(seg(t, 4.75, 5.15));
      c.save(); c.globalAlpha = enterP * exit; c.translate(0, (1 - enterP) * 36);
      card(c, CARD_X, y, CARD_W, h, { stroke: bad ? C.coral : (t < 9.4 ? C.mint : null) });
      // label
      if (bad) pill(c, CX, 450, 'EVITA ESTA FRASE', C.coral, C.navy, 50, { icon: 'x', sc: E.back(seg(t, 2.55, 2.95)) });
      else if (t < 9.4) pill(c, CX, 450, 'DI ASÍ', C.mint, C.navy, 50, { icon: 'check', sc: flip });
      else pill(c, CX, 450, 'EJEMPLO', C.mint, C.navy, 50, { sc: 1 });
      // phrase
      const amLift = E.out(seg(t, 3.95, 4.6)), amW = 1 - E.io(seg(t, 4.15, 4.75)), flag = seg(t, 3.1, 3.6);
      const font = Math.min(150, 780 / measure(c, 'I am agree.', 100) * 100);
      const baseY = y + 160 + (font - 140) * .2;
      const toks = [{ t: 'I' }, { t: 'am', col: t >= 3.1 && t < 4.75 ? C.coral : C.navy, under: t >= 3.1 ? C.coral : null, underP: flag, strike: t >= 3.6 ? E.out(seg(t, 3.6, 3.95)) : 0, dy: -150 * amLift, rot: -.35 * amLift, sc: 1 - .5 * amLift, a: 1 - seg(t, 4.2, 4.6), w: amW }, { t: t < 4.75 ? 'agree.' : 'agree.' }];
      if (t >= 5.1 && t < 9.4) toks[2].col = C.teal;
      const textA = 1; c.globalAlpha *= textA;
      const keep = t >= c05.start - .2;
      const line1 = keep ? [{ t: 'I' }, { t: 'agree' }] : toks;
      if (keep) { line1[1].col = C.navy; }
      const lay = tokens(c, line1, CX, baseY, font, C.navy);
      if (keep) {
        const a = E.back(seg(t, c05.start - .15, c05.start + .3)), a2 = E.out(seg(t, c05.start - .15, c05.start + .2));
        if (t >= c05.start + .4) { const p = E.out(seg(t, c05.start + .4, c05.start + .9)); const wy = measure(c, 'with you.', font); c.fillStyle = 'rgba(114,216,198,.55)'; FE.rr(c, CX - wy / 2 - 26, baseY + 150 - font * .86, (wy + 52) * p, font * 1.15, 40); c.fill(); }
        tokens(c, [{ t: 'with', dy: (1 - a) * -50, a: a2 }, { t: 'you.', dy: (1 - a) * -50, a: a2 }], CX, baseY + 150, font, C.navy);
      }
      c.restore();
      if (t >= 4.1 && t <= 4.9) { particles(c, t, 4.2, lay.x0 + measure(c, 'I', font) + font * .27 + measure(c, 'am', font) / 2, baseY - 60, 22, 11, [C.mint, C.cream, C.coral], .8, 230); }
      if (t >= 4.75 && t <= 5.8) particles(c, t, 4.78, CX + 40, baseY - 30, 18, 40, [C.mint, C.cream], 1.0, 330);
      // explanation (S3)
      const A = c04.start - .1, B = c04.start + 1.25, ex = 1 - seg(t, 9.0, 9.35);
      const ta = E.out(seg(t, A, A + .4)) * ex, tb = E.out(seg(t, B, B + .4)) * ex;
      if (ta > 0) { c.save(); c.translate(0, (1 - ta) * 26); tokens(c, [{ t: 'Agree', a: ta, col: C.cream }, { t: 'ya', a: ta, col: C.cream }, { t: 'es', a: ta, col: C.cream }, { t: 'un', a: ta, col: C.cream }, { t: 'verbo.', a: ta, col: C.mint }], CX, 880, 80, C.cream); c.restore(); }
      if (tb > 0) { c.save(); c.translate(0, (1 - tb) * 26); tokens(c, [{ t: 'Aquí', a: tb, col: C.cream }, { t: 'no', a: tb, col: C.cream }, { t: 'necesitas', a: tb, col: C.cream }, { t: 'am.', a: tb, col: C.coral }], CX, 985, 80, C.cream); c.restore(); }
      // translation (S4)
      const tr = E.out(seg(t, c06.start - .15, c06.start + .35)) * exit;
      if (tr > 0 && t >= 9.4) { c.save(); c.translate(0, (1 - tr) * 22); text(c, 'Estoy de acuerdo contigo.', CX, 1005, 66, C.mint, { a: tr }); c.restore(); }
    }

    // ---- S5a practice question 13.4–16.4
    if (t >= 13.3 && t < 16.8) {
      const p = E.back(seg(t, 13.4, 13.95)), o = 1 - seg(t, 16.1, 16.45), a = Math.min(1, p * 2) * o;
      if (a > 0) {
        pill(c, CX, 440, 'TU TURNO', C.mint, C.navy, 50, { a, sc: .8 + .2 * p });
        card(c, CARD_X, 490, CARD_W, 400, { a, sc: .8 + .2 * p });
        c.save(); c.globalAlpha = a; c.translate(CX, 890); c.scale(.8 + .2 * p, .8 + .2 * p); c.translate(-CX, -890);
        text(c, '¿Cómo dirías', CX, 490 + 135, 104, C.navy); text(c, '«No estoy de', CX, 490 + 255, 104, C.navy); text(c, 'acuerdo»?', CX, 490 + 375, 104, C.navy); c.restore();
        // empty comment box: the answer is deliberately NOT shown
        const bx = E.out(seg(t, 14.3, 14.8)) * o;
        if (bx > 0) { c.save(); c.globalAlpha = bx; c.fillStyle = C.navy2; FE.rr(c, CARD_X, 930, CARD_W, 110, 40); c.fill(); c.strokeStyle = C.mint; c.lineWidth = 5; FE.rr(c, CARD_X, 930, CARD_W, 110, 40); c.stroke();
          text(c, 'Escribe tu respuesta…', CARD_X + 44, 1000, 52, 'rgba(255,247,235,.62)', { weight: 500, align: 'left' });
          if (Math.floor(t * 1.8) % 2 === 0) { c.fillStyle = C.mint; c.fillRect(CARD_X + 44 + measure(c, 'Escribe tu respuesta…', 52, 500) + 10, 960, 6, 60); } c.restore(); }
      }
    }

    // ---- S5b question + CTA (static hold from ~17.4 to 20)
    if (t >= 16.45) {
      const q = E.out(seg(t, 16.5, 17.0)), l = E.out(seg(t, 16.75, 17.3)), s = E.out(seg(t, 17.0, 17.5)), g = E.back(seg(t, 17.2, 17.7));
      c.save(); c.globalAlpha = q; c.translate(0, (1 - q) * 28);
      text(c, '¿Cómo dirías', CX, 490, 72, C.cream); text(c, '«No estoy de acuerdo»?', CX, 570, 72, C.cream); c.restore();
      pill(c, CX, 645, 'Responde en los comentarios', C.mint, C.navy, 44, { a: q });
      if (window.LOGO) { const w = 470, h = w * 1181 / 2640; c.save(); c.globalAlpha = l; c.drawImage(window.LOGO, 405, 348, 2640, 1181, CX - w / 2, 705 + (1 - l) * 24, w, h); c.restore(); }
      c.save(); c.globalAlpha = s; c.translate(0, (1 - s) * 24); text(c, 'Clases en línea', CX, 1030, 112, C.cream); c.restore();
      text(c, 'Manda', CX - 205, 1135, 72, C.cream, { a: s });
      c.save(); c.translate(CX + 120, 1112); c.scale(g, g); c.globalAlpha = s; c.fillStyle = C.coral; FE.rr(c, -175, -55, 350, 110, 55); c.fill(); text(c, 'GRUPO', 0, 27, 72, C.navy); c.restore();
      text(c, 'por mensaje privado.', CX, 1235, 72, C.cream, { a: s });
    }

    caption(c, t, cues);
  }
  return { duration: 20, draw };
})();
