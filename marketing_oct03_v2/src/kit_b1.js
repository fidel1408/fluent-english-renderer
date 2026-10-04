/* October batch-1 helpers (depends on engine.js, kit.js, props.js): native-DM CTA with a configurable keyword, shared timing easings. */
const KB = (() => {
  const { CX, C, E, seg, text, rr, FONT } = FE; const { CARD_X, CARD_W } = KIT;
  const out = (t, a, d = .3) => 1 - seg(t, a, a + d);
  const inn = (t, a) => E.back(seg(t, a, a + .5));
  const txt = (t, a) => E.out(seg(t, a + .35, a + .7));      // text appears only after its card has (almost) finished entering
  // CTA card. lines: [{t, size}] plain lines; kw: keyword pill inserted as its own row: {before:'Manda', kw:'GRUPO'} (before may be '') ; rows rendered top->bottom
  function cta(c, y, a, rows) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; let h = 36; const gaps = []; rows.forEach(r => { r._h = r.kw ? 96 : r.size * 1.2; h += r._h + 12; }); h += 14;
    c.fillStyle = 'rgba(16,30,52,.94)'; rr(c, CARD_X, y, CARD_W, h, 48); c.fill(); c.strokeStyle = 'rgba(114,216,198,.55)'; c.lineWidth = 3; rr(c, CARD_X, y, CARD_W, h, 48); c.stroke();
    let yy = y + 30;
    rows.forEach(r => { if (r.kw) { c.font = `700 ${r.size || 62}px ${FONT}`; const w1 = r.before ? c.measureText(r.before).width : 0, gap = r.before ? 26 : 0; c.font = `700 ${(r.size || 62) - 4}px ${FONT}`; const pw = c.measureText(r.kw).width + 64, tot = w1 + gap + pw, x0 = CX - tot / 2, cy = yy + 48;
        if (r.before) text(c, r.before, x0 + w1 / 2, cy + 20, r.size || 62, C.cream); c.fillStyle = C.coral; rr(c, x0 + w1 + gap, cy - 40, pw, 80, 40); c.fill(); text(c, r.kw, x0 + w1 + gap + pw / 2, cy + 19, (r.size || 62) - 4, C.navy); }
      else text(c, r.t, CX, yy + r.size * .95, r.size, C.cream);
      yy += r._h + 12; });
    c.restore(); return h;
  }
  return { out, inn, txt, cta };
})();
