/* Original vector props for the October batch-1 tips (glass, pitcher, juice, hand, pen, charger, trays, arrow, clock, pin, level bars). Pure functions of their arguments (no stored state). */
const PROPS = (() => {
  const { C, E, seg, lerp, rr, text, measure, FONT } = FE; const SK = { skin: '#D9A07A', skinD: '#B9805C', shirt: '#FFF7EB', shirtD: '#cdbfa7' };
  const TAU = Math.PI * 2;
  // ---- glass (tumbler). cx = centre, by = bottom y, s = scale (1 => 140 wide at the rim, 190 tall)
  function glass(c, cx, by, s, { fill = 1, kind = 'water', glow = 0, t = 0, a = 1 } = {}) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a;
    const hw = 70 * s, bw = 52 * s, h = 190 * s, top = by - h, path = (inset) => { const p = new Path2D(); p.moveTo(cx - hw + inset, top); p.lineTo(cx + hw - inset, top); p.lineTo(cx + bw - inset * .6, by - 14 * s); p.quadraticCurveTo(cx + bw - inset * .6, by - inset, cx + bw - 16 * s, by - inset); p.lineTo(cx - bw + 16 * s, by - inset); p.quadraticCurveTo(cx - bw + inset * .6, by - inset, cx - bw + inset * .6, by - 14 * s); p.closePath(); return p; };
    if (glow > 0) { const g = c.createRadialGradient(cx, by - h * .5, 10, cx, by - h * .5, 190 * s); g.addColorStop(0, `rgba(255,255,255,${.75 * glow})`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(cx - 200 * s, by - h - 80 * s, 400 * s, h + 160 * s); }
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(path(0));
    c.save(); c.clip(path(6 * s)); const ly = by - 12 * s - (h - 22 * s) * Math.max(0, Math.min(1, fill));
    if (fill > 0) { const j = kind === 'juice', g = c.createLinearGradient(0, ly, 0, by); g.addColorStop(0, j ? '#FBB744' : '#9fdcf0'); g.addColorStop(1, j ? '#F28A25' : '#58b9de'); c.fillStyle = g; c.beginPath(); c.moveTo(cx - hw, by + 5);
      for (let x = -hw; x <= hw; x += 6 * s) c.lineTo(cx + x, ly + Math.sin(t * 3 + x * .08 / s) * 2.2 * s); c.lineTo(cx + hw, by + 5); c.closePath(); c.fill();
      if (!j) { [[-18, 62, 0], [16, 98, 1.7]].forEach(([dx, dy, ph]) => { c.save(); c.translate(cx + dx * s, by - dy * s + Math.sin(t * 1.6 + ph) * 3 * s); c.rotate(.3 + ph * .2); c.fillStyle = 'rgba(255,255,255,.5)'; c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3 * s; rr(c, -17 * s, -17 * s, 34 * s, 34 * s, 8 * s); c.fill(); c.stroke(); c.restore(); }); } }
    c.restore();
    c.strokeStyle = 'rgba(16,30,52,.42)'; c.lineWidth = 5 * s; c.lineJoin = 'round'; c.stroke(path(0));
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 7 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - hw * .62, top + 24 * s); c.lineTo(cx - bw * .66, by - 40 * s); c.stroke();
    if (kind === 'juice') { c.strokeStyle = C.coral; c.lineWidth = 11 * s; c.beginPath(); c.moveTo(cx + 12 * s, by - 20 * s); c.lineTo(cx + 46 * s, top - 52 * s); c.stroke();
      c.save(); c.translate(cx + hw - 6 * s, top + 4 * s); c.fillStyle = '#F6A33B'; c.beginPath(); c.arc(0, 0, 34 * s, Math.PI, TAU); c.closePath(); c.fill(); c.strokeStyle = '#FFF1CF'; c.lineWidth = 4 * s; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(Math.PI + (k + .5) * Math.PI / 4) * 30 * s, Math.sin(Math.PI + (k + .5) * Math.PI / 4) * 30 * s); c.stroke(); } c.restore(); }
    if (glow > 0) for (let k = 0; k < 4; k++) { const an = k * 1.6 + t * .9, r = 128 * s + Math.sin(t * 3 + k) * 6 * s, x = cx + Math.cos(an) * r * .95, y = by - h * .5 + Math.sin(an) * r * .85, z = (9 + 5 * Math.sin(t * 4 + k * 2)) * s * glow; c.fillStyle = k % 2 ? C.coral : C.teal; c.beginPath(); c.moveTo(x, y - z * 1.6); c.lineTo(x + z * .4, y - z * .4); c.lineTo(x + z * 1.6, y); c.lineTo(x + z * .4, y + z * .4); c.lineTo(x, y + z * 1.6); c.lineTo(x - z * .4, y + z * .4); c.lineTo(x - z * 1.6, y); c.lineTo(x - z * .4, y - z * .4); c.closePath(); c.fill(); }
    c.restore();
  }
  // ---- pitcher, optionally tilted to pour into (px, py). returns spout position
  function pitcher(c, cx, by, s, { level = 1, tilt = 0, pourTo = null, pour = 0, t = 0, a = 1 } = {}) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; const H = 230 * s, W = 138 * s;
    c.save(); c.translate(cx, by); c.rotate(-tilt); c.translate(-cx, -by);
    const body = new Path2D(); body.moveTo(cx - W / 2, by - H); body.lineTo(cx + W / 2, by - H); body.lineTo(cx + W / 2 + 8 * s, by - 16 * s); body.quadraticCurveTo(cx + W / 2 + 8 * s, by, cx + W / 2 - 14 * s, by); body.lineTo(cx - W / 2 + 14 * s, by); body.quadraticCurveTo(cx - W / 2 - 8 * s, by, cx - W / 2 - 8 * s, by - 16 * s); body.closePath();
    c.strokeStyle = 'rgba(16,30,52,.42)'; c.lineWidth = 9 * s; c.beginPath(); c.ellipse(cx + W / 2 + 14 * s, by - H * .52, 36 * s, 64 * s, 0, -1.5, 1.5); c.stroke();      // handle
    c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(body);
    c.save(); c.clip(body); const ly = by - 14 * s - (H - 24 * s) * level; const g = c.createLinearGradient(0, ly, 0, by); g.addColorStop(0, '#9fdcf0'); g.addColorStop(1, '#58b9de'); c.fillStyle = g; c.beginPath(); c.moveTo(cx - W, by + 4);
    for (let x = -W; x <= W; x += 8 * s) c.lineTo(cx + x, ly + Math.sin(t * 2.6 + x * .07 / s) * 2.4 * s); c.lineTo(cx + W, by + 4); c.fill(); c.restore();
    c.strokeStyle = 'rgba(16,30,52,.42)'; c.lineWidth = 5 * s; c.lineJoin = 'round'; c.stroke(body);
    c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.moveTo(cx - W / 2 - 4 * s, by - H); c.lineTo(cx - W / 2 - 34 * s, by - H - 12 * s); c.lineTo(cx - W / 2 + 6 * s, by - H + 18 * s); c.closePath(); c.fill(); c.strokeStyle = 'rgba(16,30,52,.42)'; c.stroke();   // spout lip
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 7 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - W * .3, by - H + 30 * s); c.lineTo(cx - W * .32, by - 40 * s); c.stroke();
    c.restore();
    const lx = -W / 2 - 34 * s, ly2 = -H - 12 * s, ca = Math.cos(-tilt), sa = Math.sin(-tilt), spout = { x: cx + lx * ca - (ly2 + H) * sa + 0, y: by + lx * sa + (ly2 + H) * ca - H };
    // spout position after rotation about (cx,by): local offset from pivot = (lx, ly2)
    const ox = lx, oy = ly2 + 0; spout.x = cx + ox * ca - oy * sa; spout.y = by + ox * sa + oy * ca;
    if (pourTo && pour > 0) { const sx = spout.x, sy = spout.y, ex = pourTo.x, ey = pourTo.y; c.strokeStyle = 'rgba(120,200,235,.95)'; c.lineWidth = 11 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx - 18 * s, (sy + ey) / 2, ex, lerp(sy, ey, Math.min(1, pour))); c.stroke();
      for (let k = 0; k < 5; k++) { const u = ((t * 2.2 + k / 5) % 1), x = lerp(sx, ex, u * .95) - 10 * s * Math.sin(u * 3), y = lerp(sy, ey, u); c.fillStyle = 'rgba(190,230,245,.95)'; c.beginPath(); c.arc(x, y, 4.5 * s, 0, TAU); c.fill(); } }
    c.restore(); return spout;
  }
  // bright scene: pale wall + wooden tabletop band. returns tableY
  function tableScene(c, x, y, w, h, t = 0) {
    c.save(); c.beginPath(); c.roundRect(x, y, w, h, 44); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#EAF8F4'); g.addColorStop(1, '#CDEDE5'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.7)'; rr(c, x + w * .08, y + h * .14, w * .2, h * .3, 14); c.fill(); c.strokeStyle = 'rgba(13,98,95,.25)'; c.lineWidth = 5; rr(c, x + w * .08, y + h * .14, w * .2, h * .3, 14); c.stroke(); c.beginPath(); c.moveTo(x + w * .18, y + h * .14); c.lineTo(x + w * .18, y + h * .44); c.stroke();   // window pane hint
    const ty = y + h * .76; c.fillStyle = '#EDC48C'; c.fillRect(x, ty, w, h); c.fillStyle = '#D9A468'; c.fillRect(x, ty, w, 10); c.strokeStyle = 'rgba(160,100,50,.25)'; c.lineWidth = 3; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x, ty + k * (h * .08)); c.lineTo(x + w, ty + k * (h * .08)); c.stroke(); }
    c.restore(); return y + h * .76;
  }
  // forearm + hand entering from the right edge, gripping a glass. (gx, gy) = glass centre x / bottom y at scale s. Fingers wrap in front of the glass.
  function handHolding(c, gx, gy, s, a = 1, reach = 1) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; const hy = gy - 92 * s;
    const sx = gx + 70 * s, wx = gx + 62 * s, ex = gx + 520 * s;
    c.strokeStyle = SK.shirtD; c.lineCap = 'round'; c.lineWidth = 92 * s; c.beginPath(); c.moveTo(ex + 80 * s, hy + 30 * s); c.lineTo(wx + 160 * s, hy + 12 * s); c.stroke();
    c.strokeStyle = SK.shirt; c.lineWidth = 84 * s; c.beginPath(); c.moveTo(ex + 80 * s, hy + 30 * s); c.lineTo(wx + 160 * s, hy + 12 * s); c.stroke();                                   // sleeve
    c.strokeStyle = SK.skinD; c.lineWidth = 64 * s; c.beginPath(); c.moveTo(wx + 168 * s, hy + 12 * s); c.lineTo(wx + 52 * s, hy + 4 * s); c.stroke(); c.strokeStyle = SK.skin; c.lineWidth = 56 * s; c.stroke();   // forearm / wrist
    c.strokeStyle = '#0D625F'; c.lineWidth = 80 * s; c.beginPath(); c.moveTo(wx + 172 * s, hy + 12 * s); c.lineTo(wx + 186 * s, hy + 13 * s); c.stroke();                                               // teal cuff
    c.fillStyle = SK.skinD; rr(c, wx - 4 * s, hy - 44 * s, 76 * s, 98 * s, 30 * s); c.fill(); c.fillStyle = SK.skin; rr(c, wx - 1 * s, hy - 41 * s, 70 * s, 92 * s, 28 * s); c.fill();           // back of hand
    [-38, -14, 10, 34].forEach((dy, i) => { const len = (86 - i * 5) * s; c.strokeStyle = SK.skinD; c.lineWidth = 27 * s; c.beginPath(); c.moveTo(wx + 8 * s, hy + dy * s); c.lineTo(wx - len + 8 * s, hy + dy * s + 4 * s); c.stroke(); c.strokeStyle = SK.skin; c.lineWidth = 21 * s; c.stroke(); });   // fingers across the glass
    c.restore();
  }
  function pen(c, cx, cy, s, rot = 0, { a = 1, body = C.coral } = {}) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(cx, cy); c.rotate(rot); c.scale(s, s);
    c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 10; c.shadowOffsetY = 5; c.fillStyle = body; rr(c, -98, -15, 176, 30, 15); c.fill(); c.shadowColor = 'transparent';
    c.fillStyle = C.navy; c.beginPath(); c.moveTo(-98, -12); c.lineTo(-136, 0); c.lineTo(-98, 12); c.closePath(); c.fill(); c.fillStyle = C.cream; c.beginPath(); c.moveTo(-124, -4); c.lineTo(-136, 0); c.lineTo(-124, 4); c.closePath(); c.fill();
    c.fillStyle = C.navy; rr(c, 58, -17, 44, 34, 12); c.fill(); c.fillStyle = C.cream; rr(c, 62, -6, 30, 6, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, -70, -9, 120, 6, 3); c.fill(); c.restore();
  }
  function charger(c, cx, cy, s, rot = 0, { a = 1 } = {}) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(cx, cy); c.rotate(rot); c.scale(s, s);
    c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 12; c.shadowOffsetY = 6; c.fillStyle = '#fff'; rr(c, -62, -52, 112, 104, 24); c.fill(); c.shadowColor = 'transparent'; c.strokeStyle = C.navy; c.lineWidth = 5; rr(c, -62, -52, 112, 104, 24); c.stroke();
    c.fillStyle = '#9aa7b8'; rr(c, -96, -30, 38, 11, 4); c.fill(); rr(c, -96, 19, 38, 11, 4); c.fill(); c.fillStyle = C.mint; c.beginPath(); c.arc(-6, -22, 8, 0, TAU); c.fill(); c.strokeStyle = 'rgba(16,30,52,.25)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-30, 8); c.lineTo(24, 8); c.stroke(); c.beginPath(); c.moveTo(-30, 26); c.lineTo(24, 26); c.stroke();
    c.strokeStyle = C.navy; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 0); c.bezierCurveTo(120, 0, 100, 70, 160, 62); c.stroke(); c.fillStyle = '#9aa7b8'; rr(c, 156, 46, 48, 34, 9); c.fill(); c.fillStyle = C.navy; rr(c, 196, 55, 20, 16, 5); c.fill(); c.restore();
  }
  // thick arrow along y from x1 toward x2, p = 0..1 growth. head at the tip once p>0.
  function arrow(c, x1, x2, y, p, { col = C.coral, w = 20, a = 1 } = {}) {
    if (p <= 0 || a <= 0) return; c.save(); c.globalAlpha *= a; const d = Math.sign(x2 - x1), L = Math.abs(x2 - x1), tip = x1 + d * L * p, hl = Math.min(54, L * p * .9);
    c.fillStyle = col; rr(c, Math.min(x1, tip - d * hl), y - w / 2, Math.max(0, Math.abs(tip - d * hl - x1)), w, w / 2); c.fill();
    c.beginPath(); c.moveTo(tip, y); c.lineTo(tip - d * hl, y - 30); c.lineTo(tip - d * hl, y + 30); c.closePath(); c.fill(); c.restore();
  }
  // zone tray: title (YO / TÚ) left, role chip right
  function tray(c, x, y, w, h, title, { chip = null, chipCol = C.mint, chipA = 0, a = 1, hl = false } = {}) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = C.navy2; rr(c, x, y, w, h, 40); c.fill(); c.strokeStyle = hl ? chipCol : 'rgba(114,216,198,.5)'; c.lineWidth = hl ? 6 : 4; rr(c, x + 2, y + 2, w - 4, h - 4, 38); c.stroke();
    text(c, title, x + 30, y + h / 2 + 23, 66, C.cream, { align: 'left' });
    if (chip && chipA > 0) { c.font = `700 60px ${FONT}`; const cw = c.measureText(chip).width + 44, ch = 80, sc = .75 + .25 * Math.min(1, chipA); c.save(); c.globalAlpha *= Math.min(1, chipA * 1.6); c.translate(x + w - 18 - cw / 2, y + h / 2); c.scale(sc, sc); c.fillStyle = chipCol; rr(c, -cw / 2, -ch / 2, cw, ch, ch / 2); c.fill(); c.fillStyle = C.navy; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(chip, 0, 3); c.restore(); }
    c.restore();
  }
  function clock(c, cx, cy, r, { ring = 1, a = 1, hand = 1 } = {}) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = C.cream; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); c.strokeStyle = C.navy; c.lineWidth = r * .1; c.stroke();
    if (ring > 0) { c.strokeStyle = C.mint; c.lineWidth = r * .2; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, r * .72, -Math.PI / 2, -Math.PI / 2 + TAU * ring); c.stroke(); }
    c.strokeStyle = C.navy; c.lineWidth = r * .09; c.lineCap = 'round'; const an = -Math.PI / 2 + TAU * ring * hand; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(an) * r * .5, cy + Math.sin(an) * r * .5); c.stroke();
    c.lineWidth = r * .1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - r * .3); c.stroke(); c.fillStyle = C.navy; c.beginPath(); c.arc(cx, cy, r * .09, 0, TAU); c.fill(); c.restore();
  }
  function pin(c, cx, by, s, a = 1) {   // map pin, tip at (cx, by)
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.translate(cx, by); c.scale(s, s); c.fillStyle = C.coral; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-52, -52, -50, -118, 0, -118); c.bezierCurveTo(50, -118, 52, -52, 0, 0); c.fill(); c.fillStyle = C.cream; c.beginPath(); c.arc(0, -78, 20, 0, TAU); c.fill(); c.restore();
  }
  function levelBars(c, x, by, s, filled, a = 1) {   // three ascending bars: beginner / intermediate / advanced; filled = [b,b,b]
    c.save(); c.globalAlpha *= a; [0, 1, 2].forEach(i => { const h = (46 + i * 34) * s, bx = x + i * 52 * s; c.fillStyle = filled[i] ? C.mint : 'rgba(16,30,52,.1)'; rr(c, bx, by - h, 38 * s, h, 9 * s); c.fill(); c.strokeStyle = filled[i] ? C.teal : 'rgba(16,30,52,.35)'; c.lineWidth = 4 * s; if (!filled[i]) c.setLineDash([8 * s, 7 * s]); rr(c, bx, by - h, 38 * s, h, 9 * s); c.stroke(); c.setLineDash([]); }); c.restore();
  }
  return { glass, pitcher, tableScene, handHolding, pen, charger, arrow, tray, clock, pin, levelBars };
})();
