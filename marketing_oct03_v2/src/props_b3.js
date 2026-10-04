/* Original vector props for October batch 3: apartment door/key + timeline (SINCE/FOR), soccer ball + backpack memory vignette (USED TO), four connected week blocks with one bracket (TRIAL FAQ). Illustration text >= 60 px source type. */
const P3 = (() => {
  const { C, E, seg, lerp, rr, text, FONT } = FE; const TAU = Math.PI * 2;
  const panel = (c, x, y, w, h, c0, c1) => { c.beginPath(); c.roundRect(x, y, w, h, 44); c.clip(); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c0); g.addColorStop(1, c1); c.fillStyle = g; c.fillRect(x, y, w, h); };
  function door(c, x, y, h) { c.save(); c.fillStyle = C.navy; rr(c, x, y, 84, h, 10); c.fill(); c.strokeStyle = C.mint; c.lineWidth = 4; rr(c, x + 10, y + 10, 64, h * .38, 6); c.stroke(); rr(c, x + 10, y + h * .5, 64, h * .38, 6); c.stroke(); c.fillStyle = C.coral; c.beginPath(); c.arc(x + 70, y + h * .52, 6, 0, TAU); c.fill(); c.restore(); }
  function key(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#E0A53A'; c.fillStyle = '#E0A53A'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 17, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(17, 0); c.lineTo(78, 0); c.moveTo(60, 0); c.lineTo(60, 18); c.moveTo(74, 0); c.lineTo(74, 14); c.stroke(); c.restore(); }
  // timeline: past (dashed) -> start point -> AHORA. mode 'for' draws a coral duration bracket (grow p), 'since' draws a 2024 flag and an arrow start -> AHORA (grow p), 'plain' none.
  function timelineScene(c, x, y, w, h, t, { mode = 'plain', p = 0 } = {}) {
    c.save(); panel(c, x, y, w, h, '#EAF8F4', '#CDEDE5'); const ly = y + h * .74, sx = x + 400, nx = x + w - 190, lab = y + h * .40;
    door(c, x + 34, y + h * .1, h * .8); key(c, x + 140, y + h * .5, h > 200 ? 1 : .8);
    c.strokeStyle = C.navy; c.lineWidth = 8; c.lineCap = 'round'; c.setLineDash([14, 12]); c.beginPath(); c.moveTo(x + 250, ly); c.lineTo(sx, ly); c.stroke(); c.setLineDash([]); c.beginPath(); c.moveTo(sx, ly); c.lineTo(x + w - 40, ly); c.stroke();
    c.beginPath(); c.moveTo(x + w - 36, ly); c.lineTo(x + w - 62, ly - 16); c.lineTo(x + w - 62, ly + 16); c.closePath(); c.fillStyle = C.navy; c.fill();
    c.fillStyle = C.navy; c.beginPath(); c.arc(sx, ly, 11, 0, TAU); c.fill(); c.fillStyle = C.teal; c.beginPath(); c.arc(nx, ly, 14, 0, TAU); c.fill(); text(c, 'AHORA', nx, lab + 20, 60, C.teal);
    if (mode === 'for' && p > 0) { const e = sx + (nx - sx) * p; c.strokeStyle = C.coral; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, ly); c.lineTo(e, ly); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(sx, ly - 22); c.lineTo(sx, ly + 22); c.moveTo(e, ly - 22); c.lineTo(e, ly + 22); c.stroke(); }
    if (mode === 'since' && p > 0) { c.save(); c.globalAlpha *= Math.min(1, p * 2); c.strokeStyle = C.coral; c.lineWidth = 7; c.beginPath(); c.moveTo(sx, ly); c.lineTo(sx, lab + 34); c.stroke(); c.fillStyle = C.coral; c.beginPath(); c.moveTo(sx, lab + 34); c.lineTo(sx + 62, lab + 44); c.lineTo(sx, lab + 54); c.closePath(); c.fill(); c.restore(); text(c, '2024', sx - 8, lab + 14, 60, C.coral, { a: Math.min(1, p * 2) }); const e = sx + (nx - sx) * p; c.strokeStyle = C.coral; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, ly); c.lineTo(e, ly); c.stroke(); c.fillStyle = C.coral; c.beginPath(); c.moveTo(e + 22, ly); c.lineTo(e - 6, ly - 20); c.lineTo(e - 6, ly + 20); c.closePath(); c.fill(); }
    c.restore();
  }
  function ball(c, x, y, r) { c.save(); c.translate(x, y); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.strokeStyle = C.navy; c.lineWidth = r * .08; c.stroke(); c.fillStyle = C.navy; const pent = (cx, cy, rr_) => { c.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * TAU / 5; c.lineTo(cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_); } c.closePath(); c.fill(); }; pent(0, 0, r * .34); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * TAU / 5; pent(Math.cos(a) * r * .78, Math.sin(a) * r * .78, r * .2); } c.restore(); }
  function backpack(c, x, y, w, h) { c.save(); c.translate(x, y); c.fillStyle = C.teal; rr(c, 0, 0, w, h, w * .22); c.fill(); c.fillStyle = C.mint; rr(c, w * .16, h * .52, w * .68, h * .36, 12); c.fill(); c.strokeStyle = C.cream; c.lineWidth = 6; c.beginPath(); c.moveTo(w * .22, h * .3); c.lineTo(w * .78, h * .3); c.stroke(); c.strokeStyle = C.teal; c.lineWidth = 9; c.beginPath(); c.arc(w / 2, -2, w * .22, Math.PI, TAU); c.stroke(); c.restore(); }
  // memory vignette: warm "ANTES" frame with ball + backpack (past routine). faded 0..1 dims the props (the routine changed); ahora 0..1 shows an AHORA chip (no prohibition sign)
  function memoryScene(c, x, y, w, h, t, { faded = 0, ahora = 0, bob = 0 } = {}) {
    c.save(); panel(c, x, y, w, h, '#F7EBD3', '#EAD4AE'); c.strokeStyle = 'rgba(122,80,40,.35)'; c.lineWidth = 5; c.setLineDash([16, 12]); rr(c, x + 14, y + 14, w - 28, h - 28, 34); c.stroke(); c.setLineDash([]);
    c.font = `700 60px ${FONT}`; const aw = c.measureText('ANTES').width + 44; c.fillStyle = '#B87746'; rr(c, x + 34, y + 26, aw, 72, 36); c.fill(); text(c, 'ANTES', x + 34 + aw / 2, y + 26 + 51, 60, C.cream);
    c.save(); c.globalAlpha *= 1 - .6 * faded; const r = Math.min(h * .3, 90); ball(c, x + w * .42, y + h * .62 - bob, r); backpack(c, x + w * .58, y + h * .62 - r * 1.1, r * 1.5, r * 1.8); c.restore();
    if (ahora > 0) { c.save(); c.globalAlpha *= ahora; c.font = `700 60px ${FONT}`; const bw = c.measureText('AHORA').width + 56; c.fillStyle = C.mint; rr(c, x + w - bw - 34, y + 26, bw, 72, 36); c.fill(); text(c, 'AHORA', x + w - 34 - bw / 2, y + 26 + 51, 60, C.navy); c.restore(); }
    c.restore();
  }
  // four connected week blocks (exactly four) inside ONE bracket. fill[i] 0..1 highlight; ring1 0..1 outlines week 1; bracketCol colour of bracket+label
  function weekBlocks(c, x, y, w, h, t, { fill = [0, 0, 0, 0], ring1 = 0, bracketCol = C.teal, pulse = 0 } = {}) {
    c.save(); panel(c, x, y, w, h, '#EAF8F4', '#CDEDE5'); const bw = (w - 120) / 4, by = y + 10, bh = h * (h < 200 ? .38 : .44);
    for (let i = 0; i < 4; i++) { const bx = x + 60 + i * bw; c.fillStyle = `rgba(16,30,52,${.1 - .1 * fill[i]})`; rr(c, bx + 4, by, bw - 8, bh, 16); c.fill(); if (fill[i] > 0) { c.globalAlpha = fill[i]; c.fillStyle = i === 0 ? C.mint : 'rgba(114,216,198,.8)'; rr(c, bx + 4, by, bw - 8, bh, 16); c.fill(); c.globalAlpha = 1; } text(c, String(i + 1), bx + bw / 2, by + bh * .72, 62, C.navy); }
    if (ring1 > 0) { c.globalAlpha = ring1; c.strokeStyle = C.coral; c.lineWidth = 7; rr(c, x + 60 + 2, by - 4, bw - 4, bh + 8, 18); c.stroke(); c.globalAlpha = 1; }
    const lx0 = x + 60, lx1 = x + 60 + 4 * bw, ly = by + bh + 16; c.strokeStyle = bracketCol; c.lineWidth = 9 + pulse * 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx0 + 4, ly - 14); c.lineTo(lx0 + 4, ly); c.lineTo(lx1 - 4, ly); c.lineTo(lx1 - 4, ly - 14); c.stroke();
    text(c, '4 semanas', (lx0 + lx1) / 2, ly + 52, 60, bracketCol); c.restore();
  }
  return { timelineScene, memoryScene, weekBlocks, ball, backpack };
})();
