/* FE261023-PRIVATE (TikTok-only) – one adult male host; faceless silhouettes are CAPACITY ICONS only. Private 1-3, company 1-10 online; no prices, no per-class billing, no assigned time/teacher/start, no trial or in-person claim. */
window.VIDEO = (() => {
  const { CX, C, E, seg, lerp, background, text, tokens, pill, card, tail, caption, measure, rr } = FE;
  const { CARD_X, CARD_W, fit } = KIT, { out, inn, txt } = KB, P = P2;
  const head = (c, label, col, a) => { c.save(); c.globalAlpha *= a; c.font = `700 64px ${FE.FONT}`; const w = c.measureText(label).width + 80; c.fillStyle = col; rr(c, CX - w / 2, 462, w, 88, 44); c.fill(); text(c, label, CX, 462 + 62, 64, C.navy); c.restore(); };
  const price = (c, y, a) => { text(c, 'Mismo precio total', CX, y, 62, C.teal, { a }); text(c, 'dentro de este límite', CX, y + 68, 62, C.teal, { a }); };
  function draw(c, t, cues, K) {
    const q = {}; cues.forEach(x => q[x.id] = x); const S = x => x.cs ?? x.start;
    background(c, t);
    KIT.hostFor(c, t, cues, { enter: seg(t, 0, .8), leave: 0,
      moodKeys: [{ t: 0, v: 'ask' }, { t: K.sPriv - .3, v: 'warm' }, { t: K.sComp - .3, v: 'serious' }, { t: S(q.c04) - .3, v: 'ask' }, { t: S(q.c05) - .3, v: 'warm' }],
      gestKeys: [{ t: 0, v: 'both' }, { t: K.sPriv - .35, v: 'presentL' }, { t: K.sComp - .35, v: 'presentR' }, { t: S(q.c04) - .35, v: 'both' }, { t: S(q.c05) - .35, v: 'pointR' }],
      lookKeys: [{ t: 0, x: 0, y: -.6 }, { t: K.sPriv, x: 0, y: -.2 }] });
    KIT.logoSmall(c, seg(t, 0, .5));
    const HT = KIT.headTarget();
    KIT.content(c, () => {
      if (t < K.hookOut + .35) {
        const p = E.back(seg(t, 0, .5)), o = out(t, K.hookOut), a = Math.min(1, p) * o;
        if (a > 0) { tail(c, CX, 1046, CX, HT.y, C.cream, a); c.save(); c.globalAlpha = a; c.translate(CX, 1050); c.scale(.8 + .2 * Math.min(1, p), .8 + .2 * Math.min(1, p)); c.translate(-CX, -1050);
          card(c, CARD_X, 450, CARD_W, 600); text(c, '¿Clases privadas', CX, 450 + 135, fit(c, '¿Clases privadas', 780, 100), C.navy); text(c, 'o para tu equipo?', CX, 450 + 135 + 112, fit(c, 'o para tu equipo?', 780, 100), C.teal);
          P.notebook(c, 130, 760, 330, 250); P.dashboard(c, 520, 760, 360, 250, t); c.restore(); }
      }
      if (t >= K.pvIn && t < K.pvOut + .35) {   // PRIVADAS: three slots fill as "una, dos o tres" is said
        const o = out(t, K.pvOut), m = Math.min(1, inn(t, K.pvIn)) * o, ta = txt(t, K.pvIn) * o;
        if (m > 0) { card(c, CARD_X, 450, CARD_W, 640, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta; head(c, 'PRIVADAS', C.mint, 1);
          [K.una, K.dos, K.tres].forEach((tt, i) => P.person(c, CX + (i - 1) * 210, 780, 1.7, E.out(seg(t, tt, tt + .3))));
          text(c, '1–3 estudiantes', CX, 880, fit(c, '1–3 estudiantes', 780, 88), C.navy); price(c, 960, 1); c.restore(); }
      }
      if (t >= K.coIn && t < K.coOut + .35) {   // EMPRESAS: capacity text visible from the start; ten slots fill across "un máximo de diez"
        const o = out(t, K.coOut), m = Math.min(1, inn(t, K.coIn)) * o, ta = txt(t, K.coIn) * o;
        if (m > 0) { card(c, CARD_X, 450, CARD_W, 640, { a: m, sc: .92 + .08 * m }); c.save(); c.globalAlpha = ta; head(c, 'EMPRESAS', C.coral, 1);
          text(c, 'En línea · 1–10 por clase', CX, 640, fit(c, 'En línea · 1–10 por clase', 780, 72), C.navy);
          for (let i = 0; i < 10; i++) { const tt = lerp(K.max0, K.diez, i / 9) - .05; P.person(c, CX + ((i % 5) - 2) * 150, 770 + Math.floor(i / 5) * 125, 1.0, E.out(seg(t, tt, tt + .25)), C.coral); }
          price(c, 985, 1); c.restore(); }
      }
      if (t >= K.cta) { const cI = inn(t, K.cta), m = Math.min(1, cI), ta = txt(t, K.cta); c.save(); c.translate(0, (1 - m) * 24);
        KB.cta(c, 470, m * ta, [{ kw: 'PRIVADO', before: 'Manda', size: 66 }, { kw: 'EMPRESA', before: 'o', size: 66 }, { t: 'por mensaje privado.', size: 64 }, { t: '¿Qué necesitan practicar?', size: 62 }]); c.restore(); }
    });
    caption(c, t, cues);
  }
  return { draw };
})();
