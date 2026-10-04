/* Original vector props for October batch 2: fictional desk + calendar (CLARIFY), restaurant menu + movie ticket (MORE), notebook + team dashboard + faceless capacity silhouettes (PRIVATE).
   Pure functions of their arguments. Illustration text is kept at >= 60 px source type (readable at 270x480) or omitted. */
const P2 = (() => {
  const { C, E, seg, lerp, rr, text, FONT } = FE; const TAU = Math.PI * 2;
  function wall(c, x, y, w, h, c0 = '#EAF8F4', c1 = '#CDEDE5') { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c0); g.addColorStop(1, c1); c.fillStyle = g; c.fillRect(x, y, w, h); }
  function clipPanel(c, x, y, w, h) { c.beginPath(); c.roundRect(x, y, w, h, 44); c.clip(); }
  // fictional work desk with a wall calendar whose header says VIERNES (no real date, no real company). fri 0..1 highlights Friday; ring pulses; note 0..1 sticky note
  function deskScene(c, x, y, w, h, t, { fri = 0, note = 1 } = {}) {
    c.save(); clipPanel(c, x, y, w, h); wall(c, x, y, w, h); const ty = y + h * .72;
    c.fillStyle = '#EDC48C'; c.fillRect(x, ty, w, h); c.fillStyle = '#D9A468'; c.fillRect(x, ty, w, 9);
    const lx = x + 36, lw = Math.min(250, w * .3), lh = Math.min(h * .52, 150);                 // laptop
    c.fillStyle = '#9aa7b8'; rr(c, lx - 14, ty - 12, lw + 28, 14, 7); c.fill(); c.fillStyle = C.navy; rr(c, lx, ty - 12 - lh, lw, lh, 14); c.fill();
    c.fillStyle = C.mint; for (let k = 0; k < 4; k++) { rr(c, lx + 18, ty - 12 - lh + 20 + k * (lh - 40) / 4, lw * (.75 - .13 * (k % 3)), 9, 4); c.fill(); }
    const mx = lx + lw + 60; c.fillStyle = C.coral; rr(c, mx, ty - 52, 50, 50, 10); c.fill(); c.strokeStyle = C.coral; c.lineWidth = 8; c.beginPath(); c.arc(mx + 52, ty - 28, 14, -1.3, 1.3); c.stroke();   // mug
    const cw = Math.min(340, w * .4), cx0 = x + w - cw - 28, cy0 = y + 14, ch = h - 28 - (h * .72 > h - 30 ? 0 : 0);                                   // wall calendar
    c.shadowColor = 'rgba(4,10,20,.3)'; c.shadowBlur = 16; c.shadowOffsetY = 6; c.fillStyle = C.cream; rr(c, cx0, cy0, cw, ch, 22); c.fill(); c.shadowColor = 'transparent';
    c.fillStyle = C.coral; c.beginPath(); c.roundRect(cx0, cy0, cw, 70, [22, 22, 0, 0]); c.fill(); text(c, 'VIERNES', cx0 + cw / 2, cy0 + 51, 60, C.navy);
    const colw = (cw - 40) / 5, gy = cy0 + 86, gh = Math.min(26, (ch - 100) / 3 - 8);                  // week strip (shapes only)
    for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) { const bx = cx0 + 20 + k * colw, by = gy + r * (gh + 8), f = k === 4; c.fillStyle = f && r === 0 ? `rgba(244,117,88,${.25 + .6 * fri})` : 'rgba(16,30,52,.1)'; rr(c, bx + 3, by, colw - 6, gh, 7); c.fill(); }
    if (fri > 0) { const p = 1 + .08 * Math.sin(t * 4) * fri, bx = cx0 + 20 + 4 * colw, by = gy; c.strokeStyle = C.coral; c.lineWidth = 5; rr(c, bx - 1, by - 3, (colw - 4) * p, (gh + 6), 9); c.stroke(); }
    if (note > 0) { c.save(); c.translate(cx0 - 26, ty - 52); c.rotate(-.1); c.fillStyle = '#FFE08A'; rr(c, -30, -34, 60, 60, 6); c.fill(); c.strokeStyle = 'rgba(16,30,52,.3)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-16, -14); c.lineTo(16, -14); c.moveTo(-16, 0); c.lineTo(10, 0); c.stroke(); c.restore(); }
    c.restore();
  }
  // restaurant menu + cutlery + plate
  function menuScene(c, x, y, w, h, t) {
    c.save(); clipPanel(c, x, y, w, h); wall(c, x, y, w, h, '#FCEFD9', '#F3DDB7'); const ty = y + h * .78; c.fillStyle = '#C98A5C'; c.fillRect(x, ty, w, h); c.fillStyle = '#B87746'; c.fillRect(x, ty, w, 8);
    const mw = Math.min(300, w * .34), mx = x + 44, my = y + 12, mh = h - 24; c.shadowColor = 'rgba(4,10,20,.3)'; c.shadowBlur = 14; c.shadowOffsetY = 5; c.fillStyle = C.cream; rr(c, mx, my, mw, mh, 18); c.fill(); c.shadowColor = 'transparent';
    c.fillStyle = C.teal; c.beginPath(); c.roundRect(mx, my, mw, 70, [18, 18, 0, 0]); c.fill(); text(c, 'MENÚ', mx + mw / 2, my + 51, 60, C.cream);
    for (let k = 0; k < 3; k++) { const ly = my + 92 + k * Math.max(30, (mh - 110) / 3); if (ly + 14 > my + mh - 8) break; c.fillStyle = 'rgba(16,30,52,.16)'; rr(c, mx + 22, ly, mw * (.62 - k * .06), 12, 6); c.fill(); c.fillStyle = C.coral; c.beginPath(); c.arc(mx + mw - 30, ly + 6, 7, 0, TAU); c.fill(); }
    const px = x + w * .66, py = ty - 8;                                                                    // plate + fork + knife
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(px, py, 92, 24, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(16,30,52,.25)'; c.lineWidth = 4; c.stroke(); c.fillStyle = '#F6B73C'; c.beginPath(); c.ellipse(px, py - 8, 52, 12, 0, 0, TAU); c.fill(); c.fillStyle = C.coral; c.beginPath(); c.arc(px - 14, py - 18, 12, 0, TAU); c.arc(px + 16, py - 16, 10, 0, TAU); c.fill();
    c.strokeStyle = '#9aa7b8'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(px - 140, ty - 52); c.lineTo(px - 140, ty + 4); c.moveTo(px - 152, ty - 52); c.lineTo(px - 152, ty - 28); c.moveTo(px - 128, ty - 52); c.lineTo(px - 128, ty - 28); c.stroke(); c.beginPath(); c.moveTo(px + 140, ty - 52); c.quadraticCurveTo(px + 156, ty - 30, px + 140, ty + 4); c.stroke();
    c.restore();
  }
  // movie ticket (evenodd notches). cx,cy = centre, w x h size
  function ticket(c, cx, cy, w, h, { a = 1 } = {}) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(cx - w / 2, cy - h / 2); const r = 20, p = new Path2D(); p.roundRect(0, 0, w, h, 22); p.moveTo(r, h / 2); p.arc(0, h / 2, r, 0, TAU); p.moveTo(w + r, h / 2); p.arc(w, h / 2, r, 0, TAU);
    c.shadowColor = 'rgba(4,10,20,.35)'; c.shadowBlur = 16; c.shadowOffsetY = 6; c.fillStyle = C.coral; c.fill(p, 'evenodd'); c.shadowColor = 'transparent';
    c.strokeStyle = 'rgba(16,30,52,.35)'; c.lineWidth = 4; c.setLineDash([10, 9]); c.beginPath(); c.moveTo(w * .72, 18); c.lineTo(w * .72, h - 18); c.stroke(); c.setLineDash([]);
    text(c, 'CINE', w * .36, h / 2 + 21, 64, C.navy); c.fillStyle = C.navy; c.beginPath(); for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + k * TAU / 5, bn = an + TAU / 10; c.lineTo(w * .86 + Math.cos(an) * 24, h / 2 + Math.sin(an) * 24); c.lineTo(w * .86 + Math.cos(bn) * 10, h / 2 + Math.sin(bn) * 10); } c.closePath(); c.fill(); c.restore();
  }
  // faceless capacity silhouette (head + shoulders). by = bottom y. on 0..1 fill amount (0 = dashed ghost slot)
  function person(c, cx, by, s, on = 1, col = C.mint) {
    c.save(); c.translate(cx, by); c.scale(s, s); const body = new Path2D(); body.moveTo(-52, 0); body.quadraticCurveTo(-52, -52, -22, -58); body.lineTo(22, -58); body.quadraticCurveTo(52, -52, 52, 0); body.closePath(); const head = new Path2D(); head.arc(0, -92, 26, 0, TAU);
    if (on < 1) { c.strokeStyle = 'rgba(16,30,52,.35)'; c.lineWidth = 5; c.setLineDash([9, 8]); c.stroke(body); c.stroke(head); c.setLineDash([]); }
    if (on > 0) { const k = .7 + .3 * on; c.globalAlpha *= on; c.translate(0, (1 - on) * 14); c.scale(k, k); c.fillStyle = col; c.fill(body); c.fill(head); c.strokeStyle = C.teal; c.lineWidth = 4; c.stroke(body); c.stroke(head); }
    c.restore();
  }
  function notebook(c, x, y, w, h) {   // personal-goal notebook (shapes only)
    c.save(); c.translate(x, y); c.shadowColor = 'rgba(4,10,20,.3)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = C.teal; rr(c, 0, 0, w, h, 16); c.fill(); c.shadowColor = 'transparent'; c.fillStyle = C.cream; rr(c, 14, 8, w - 24, h - 16, 10); c.fill();
    for (let k = 0; k < 3; k++) { const ly = 34 + k * (h - 70) / 3; c.fillStyle = C.mint; rr(c, 32, ly, 20, 20, 5); c.fill(); c.strokeStyle = C.teal; c.lineWidth = 4; c.beginPath(); c.moveTo(36, ly + 11); c.lineTo(41, ly + 16); c.lineTo(49, ly + 5); c.stroke(); c.fillStyle = 'rgba(16,30,52,.18)'; rr(c, 64, ly + 4, (w - 110) * (.9 - k * .15), 11, 5); c.fill(); }
    c.fillStyle = '#9aa7b8'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(8, 22 + k * (h - 40) / 3, 5, 0, TAU); c.fill(); } c.restore();
  }
  function dashboard(c, x, y, w, h, t) {   // small team-work dashboard (bars + dots, no text)
    c.save(); c.translate(x, y); c.shadowColor = 'rgba(4,10,20,.3)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = C.navy; rr(c, 0, 0, w, h, 16); c.fill(); c.shadowColor = 'transparent';
    [.45, .7, .55, .9, .65].forEach((v, k) => { const bh = (h - 54) * v * (.9 + .1 * Math.sin(t * 2 + k)); c.fillStyle = k % 2 ? C.mint : C.coral; rr(c, 20 + k * ((w - 40) / 5), h - 22 - bh, (w - 40) / 5 - 10, bh, 6); c.fill(); });
    c.fillStyle = C.cream; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(24 + k * 20, 20, 6, 0, TAU); c.fill(); } c.restore();
  }
  return { deskScene, menuScene, ticket, person, notebook, dashboard, wall, clipPanel };
})();
