/* Café world (back wall, counter, props) and drink illustrations. World space = final-framing pixels. */
(function () {
  const FE = (window.FE = window.FE || {});
  const U = FE.U, C = FE.C;
  const DARK = '#2A1710';

  function wall(c) {
    c.fillStyle = U.grad(c, 0, -400, 0, 1500, [[0, '#F7E9CF'], [0.55, '#F1DDBB'], [1, '#E8CFA6']]);
    c.fillRect(-900, -500, 3000, 2100);
    // subtle vertical wall panelling
    c.globalAlpha = 0.07; c.fillStyle = C.espresso;
    for (let x = -900; x < 2100; x += 120) c.fillRect(x, -500, 3, 1900);
    c.globalAlpha = 1;
    // wainscot
    c.fillStyle = U.grad(c, 0, 1230, 0, 1560, [[0, C.teal], [1, C.deepTeal]]);
    c.fillRect(-900, 1230, 3000, 360);
    c.fillStyle = C.cream; c.fillRect(-900, 1222, 3000, 14);
    c.strokeStyle = 'rgba(255,246,230,0.35)'; c.lineWidth = 4;
    for (let x = -880; x < 2100; x += 230) U.rr(c, x, 1290, 190, 230, 10), c.stroke();
    // floor
    c.fillStyle = U.grad(c, 0, 1560, 0, 2600, [[0, '#8A5A38'], [1, '#5C3A25']]);
    c.fillRect(-900, 1560, 3000, 1200);
    c.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 1600; y < 2600; y += 90) c.fillRect(-900, y, 3000, 3);
    c.fillStyle = DARK; c.fillRect(-900, 1556, 3000, 6);
  }

  function window_(c, x, y, w, h, t) {
    c.save();
    U.rr(c, x - 16, y - 16, w + 32, h + 32, 18); c.fillStyle = C.espresso; c.fill();
    c.save(); U.rr(c, x, y, w, h, 8); c.clip();
    c.fillStyle = U.grad(c, 0, y, 0, y + h, [[0, '#BFE6EA'], [0.6, '#FBEBC9'], [1, '#F6D6A0']]); c.fillRect(x, y, w, h);
    // distant street: buildings + tree
    c.fillStyle = '#CDB89A'; c.fillRect(x + 10, y + h * 0.55, 80, h * 0.45); c.fillRect(x + 100, y + h * 0.42, 70, h * 0.58);
    c.fillStyle = '#B79F80'; c.fillRect(x + 175, y + h * 0.6, 110, h * 0.4);
    c.fillStyle = '#7FB59A'; c.beginPath(); c.arc(x + w - 70, y + h * 0.62, 56, 0, 7); c.fill();
    c.fillStyle = '#5E4332'; c.fillRect(x + w - 74, y + h * 0.7, 8, h * 0.3);
    c.restore();
    c.strokeStyle = C.espresso; c.lineWidth = 12; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h * 0.5); c.lineTo(x + w, y + h * 0.5); c.stroke();
    // sill plant
    c.fillStyle = C.coral; U.rr(c, x + 30, y + h + 16, 70, 56, 10); c.fill();
    c.fillStyle = '#3F8F5E';
    for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(x + 65 + (i - 3) * 14, y + h - 18 - (i % 3) * 14, 12, 40, (i - 3) * 0.28, 0, 7); c.fill(); }
    c.restore();
  }

  function door(c, x, y, w, h, open) {
    // frame
    c.fillStyle = C.espresso; U.rr(c, x - 18, y - 18, w + 36, h + 18, 14); c.fill();
    c.fillStyle = '#FFE9B8'; c.fillRect(x, y, w, h); // bright outside
    c.fillStyle = U.grad(c, 0, y, 0, y + h, [[0, '#CDEBF0'], [1, '#FFF1D2']]); c.fillRect(x, y, w, h);
    // door leaf swings about the left hinge: scaleX shrinks
    const k = 1 - 0.78 * open;
    c.save(); c.translate(x, y); c.scale(k, 1);
    c.fillStyle = C.teal; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.18)'; U.rr(c, 24, 30, w - 48, h * 0.45, 14); c.fill();
    c.fillStyle = '#CFEFF2'; U.rr(c, 36, 42, w - 72, h * 0.45 - 24, 10); c.fill();
    c.strokeStyle = C.deepTeal; c.lineWidth = 6; U.rr(c, 24, h * 0.55, w - 48, h * 0.38, 10); c.stroke();
    c.fillStyle = C.gold; c.beginPath(); c.arc(w - 36, h * 0.56, 12, 0, 7); c.fill();
    c.restore();
  }

  function lamp(c, x, topY, len, glow) {
    c.strokeStyle = DARK; c.lineWidth = 5; c.beginPath(); c.moveTo(x, topY); c.lineTo(x, topY + len); c.stroke();
    const g = c.createRadialGradient(x, topY + len + 30, 10, x, topY + len + 30, 300);
    g.addColorStop(0, 'rgba(255,214,140,' + (0.5 * glow) + ')'); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(x - 320, topY + len - 280, 640, 700);
    c.beginPath(); c.moveTo(x - 70, topY + len + 56); c.quadraticCurveTo(x - 62, topY + len, x, topY + len - 6); c.quadraticCurveTo(x + 62, topY + len, x + 70, topY + len + 56); c.closePath();
    c.fillStyle = C.coral; c.fill(); c.strokeStyle = DARK; c.lineWidth = 4; c.stroke();
    c.beginPath(); c.ellipse(x, topY + len + 56, 70, 10, 0, 0, 7); c.fillStyle = '#FFE2A8'; c.fill(); c.stroke();
  }

  function menuBoard(c, x, y, w, h, hl) {
    U.rr(c, x - 14, y - 14, w + 28, h + 28, 18); c.fillStyle = '#7A5237'; c.fill(); c.strokeStyle = DARK; c.lineWidth = 4; c.stroke();
    U.rr(c, x, y, w, h, 10); c.fillStyle = '#2D211C'; c.fill();
    c.fillStyle = C.paleGold; c.font = '700 40px ' + FE.FONT.head; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText('MENU', x + w / 2, y + 56);
    c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(x + w * 0.3, y + 70); c.lineTo(x + w * 0.7, y + 70); c.stroke();
    const items = [['Coffee', 'hot'], ['Latte', 'hot'], ['Iced latte', 'ice'], ['Tea', 'tea']];
    items.forEach((it, i) => {
      const col = i % 2, row = (i / 2) | 0;
      const ix = x + 36 + col * 214, iy = y + 112 + row * 84;
      c.textAlign = 'left'; c.font = '600 28px ' + FE.FONT.body;
      c.fillStyle = hl && hl === it[0] ? C.coral : '#F6E7CC';
      c.fillText(it[0], ix + 40, iy + 10);
      miniIcon(c, ix + 20, iy, it[1]);
    });
  }
  function miniIcon(c, x, y, kind) {
    c.save(); c.translate(x, y); c.strokeStyle = C.paleGold; c.fillStyle = C.paleGold; c.lineWidth = 3.5; c.lineJoin = 'round';
    if (kind === 'ice') {
      c.beginPath(); c.moveTo(-14, -18); c.lineTo(14, -18); c.lineTo(10, 18); c.lineTo(-10, 18); c.closePath(); c.stroke();
      c.fillStyle = 'rgba(242,213,140,0.5)'; c.fillRect(-9, -4, 18, 18);
    } else {
      c.beginPath(); c.moveTo(-16, -8); c.lineTo(12, -8); c.lineTo(10, 14); c.quadraticCurveTo(-2, 22, -14, 14); c.closePath(); c.stroke();
      c.beginPath(); c.arc(14, 2, 7, -1.2, 1.2); c.stroke();
      if (kind === 'tea') { c.beginPath(); c.moveTo(-2, -8); c.lineTo(-2, -20); c.stroke(); c.fillRect(-8, -26, 12, 8); }
    }
    c.restore();
  }

  function shelves(c, x, y, w, t) {
    c.fillStyle = '#7A5237'; U.rr(c, x, y, w, 14, 5); c.fill(); c.strokeStyle = DARK; c.lineWidth = 3; c.stroke();
    const cols = [C.coral, C.ivory, C.teal, C.gold, C.cream];
    for (let i = 0; i < 6; i++) {
      const cx = x + 30 + i * (w - 60) / 5;
      c.fillStyle = cols[i % 5]; U.rr(c, cx - 22, y - 46, 44, 46, 8); c.fill(); c.strokeStyle = DARK; c.lineWidth = 3; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(cx - 14, y - 38, 6, 30);
    }
  }

  function counter(c) {
    // top
    c.fillStyle = DARK; U.rr(c, 470, 1112, 1400, 56, 14); c.fill();
    c.fillStyle = U.grad(c, 0, 1112, 0, 1164, [[0, '#9B6A45'], [1, '#6B4430']]); U.rr(c, 474, 1114, 1392, 48, 12); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(490, 1118, 1360, 5);
    // front
    c.fillStyle = U.grad(c, 0, 1164, 0, 1600, [[0, C.teal], [1, C.deepTeal]]); c.fillRect(480, 1164, 1380, 440);
    c.strokeStyle = 'rgba(255,246,230,0.28)'; c.lineWidth = 3;
    for (let x = 480; x < 1860; x += 92) { c.beginPath(); c.moveTo(x, 1164); c.lineTo(x, 1600); c.stroke(); }
    for (let y = 1164; y < 1600; y += 92) { c.beginPath(); c.moveTo(480, y); c.lineTo(1860, y); c.stroke(); }
    c.strokeStyle = DARK; c.lineWidth = 4; c.strokeRect(480, 1164, 1380, 436);
    // rounded near end cap shadow
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(480, 1164, 26, 436);
  }

  function espressoMachine(c, x, y, t) {
    c.save(); c.translate(x, y);
    c.fillStyle = DARK; U.rr(c, -6, -214, 232, 214, 20); c.fill();
    c.fillStyle = U.grad(c, 0, -210, 0, 0, [[0, '#E9E3D8'], [1, '#B8AFA2']]); U.rr(c, 0, -208, 220, 206, 16); c.fill();
    c.fillStyle = C.coral; U.rr(c, 14, -196, 192, 28, 8); c.fill();
    c.fillStyle = DARK; U.rr(c, 36, -150, 148, 96, 8); c.fill();
    c.fillStyle = '#EDE4D3'; U.rr(c, 58, -62, 64, 46, 5); c.fill();
    c.fillStyle = C.gold; c.beginPath(); c.arc(30, -176, 5, 0, 7); c.arc(190, -176, 5, 0, 7); c.fill();
    // steam
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 5; c.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      c.beginPath(); const ph = t * 1.3 + i * 2;
      c.moveTo(185 + i * 16, -214); c.bezierCurveTo(175 + i * 16 + Math.sin(ph) * 8, -250, 200 + i * 16 + Math.cos(ph) * 8, -280, 188 + i * 16, -320); c.stroke();
    }
    c.lineCap = 'butt';
    c.restore();
  }

  function pastryDome(c, x, y) {
    c.save(); c.translate(x, y);
    c.fillStyle = '#EDE2CF'; U.rr(c, -80, -10, 160, 14, 6); c.fill(); c.strokeStyle = DARK; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.gold; c.beginPath(); c.ellipse(-24, -28, 32, 20, 0, 0, 7); c.fill(); c.strokeStyle = DARK; c.stroke();
    c.fillStyle = '#C9845A'; c.beginPath(); c.ellipse(30, -26, 28, 18, 0.2, 0, 7); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-76, -10); c.bezierCurveTo(-76, -120, 76, -120, 76, -10); c.closePath();
    c.fillStyle = 'rgba(200,235,240,0.35)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.arc(0, -108, 8, 0, 7); c.fillStyle = C.gold; c.fill();
    c.restore();
  }

  /* ---------- drinks ---------- */
  /* x,y = base centre. kind: 'coffee' | 'tea' | 'iced'. s scale. t seconds for steam. */
  function drink(c, x, y, s, kind, t, o) {
    o = o || {};
    c.save(); c.translate(x, y); c.scale(s, s);
    if (kind === 'iced') {
      const w0 = 74, w1 = 56, h = 280;
      // shadow
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(0, 4, 78, 12, 0, 0, 7); c.fill();
      // straw behind
      c.save(); c.translate(26, -h + 20); c.rotate(0.12);
      c.fillStyle = C.coral; U.rr(c, -7, -90, 14, 250, 7); c.fill(); c.strokeStyle = DARK; c.lineWidth = 3; c.stroke();
      c.fillStyle = C.ivory; for (let i = 0; i < 5; i++) c.fillRect(-7, -70 + i * 40, 14, 14);
      c.restore();
      const body = () => { c.beginPath(); c.moveTo(-w0, -h); c.lineTo(w0, -h); c.lineTo(w1, 0); c.quadraticCurveTo(0, 14, -w1, 0); c.closePath(); };
      body(); c.fillStyle = 'rgba(225,245,248,0.55)'; c.fill();
      c.save(); body(); c.clip();
      // layers: milk bottom, espresso top
      c.fillStyle = U.grad(c, 0, -h * 0.82, 0, 0, [[0, '#7A4A2B'], [0.38, '#A66F45'], [0.52, '#E8D2B0'], [1, '#F6EAD3']]);
      c.fillRect(-w0, -h * 0.82, w0 * 2, h * 0.9);
      // ice cubes
      const r = U.rng(11); c.fillStyle = 'rgba(255,255,255,0.55)'; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const cx = -40 + r() * 80, cy = -h * 0.78 + i * 14 + r() * 26 + Math.sin(t * 1.4 + i) * 1.5;
        c.save(); c.translate(cx, cy); c.rotate(r() * 1.2 - 0.6); U.rr(c, -22, -22, 44, 44, 9); c.fill(); c.stroke(); c.restore();
      }
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-w0 + 12, -h + 14, 10, h - 40);
      c.restore();
      body(); c.lineWidth = 4; c.strokeStyle = DARK; c.stroke();
      c.beginPath(); c.ellipse(0, -h, w0, 11, 0, 0, 7); c.strokeStyle = DARK; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fill();
      // condensation dots
      c.fillStyle = 'rgba(255,255,255,0.85)';
      [[-30, -90], [24, -140], [-14, -190], [34, -60]].forEach(([dx, dy]) => { c.beginPath(); c.ellipse(dx, dy, 3.4, 5, 0, 0, 7); c.fill(); });
    } else {
      // saucer
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(0, 8, 120, 15, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(0, -2, 112, 20, 0, 0, 7); c.fillStyle = C.ivory; c.fill(); c.strokeStyle = DARK; c.lineWidth = 4; c.stroke();
      c.beginPath(); c.ellipse(0, -4, 64, 10, 0, 0, 7); c.fillStyle = '#E8D9BF'; c.fill();
      // handle
      c.beginPath(); c.arc(80, -64, 34, -1.5, 1.5); c.lineWidth = 17; c.strokeStyle = DARK; c.stroke(); c.lineWidth = 10; c.strokeStyle = kind === 'tea' ? C.coral : C.ivory; c.stroke();
      // cup
      c.beginPath(); c.moveTo(-82, -112); c.lineTo(82, -112); c.bezierCurveTo(82, -30, 50, 0, 0, 0); c.bezierCurveTo(-50, 0, -82, -30, -82, -112); c.closePath();
      c.fillStyle = kind === 'tea' ? C.coral : C.ivory; c.fill(); c.lineWidth = 4; c.strokeStyle = DARK; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-48, -70, 8, 28, 0.1, 0, 7); c.fill();
      if (kind === 'coffee') { c.fillStyle = C.teal; c.fillRect(-81, -86, 162, 14); }
      c.beginPath(); c.ellipse(0, -112, 82, 15, 0, 0, 7); c.fillStyle = kind === 'tea' ? '#C9803F' : '#4B2A18'; c.fill(); c.strokeStyle = DARK; c.stroke();
      if (kind === 'coffee') { c.beginPath(); c.ellipse(0, -112, 54, 8, 0, 0, 7); c.fillStyle = '#B98558'; c.fill(); }
      if (kind === 'tea') { // tea bag tag
        c.strokeStyle = DARK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-10, -112); c.lineTo(-52, -152); c.stroke();
        c.fillStyle = C.paleGold; U.rr(c, -78, -176, 40, 30, 4); c.fill(); c.stroke();
      }
      // steam
      c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 7; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const ph = t * 1.6 + i * 1.7, x0 = -34 + i * 34;
        c.globalAlpha = 0.5 + 0.2 * Math.sin(ph);
        c.beginPath(); c.moveTo(x0, -138); c.bezierCurveTo(x0 - 20 + Math.sin(ph) * 10, -170, x0 + 20 + Math.cos(ph) * 10, -200, x0, -240); c.stroke();
      }
      c.globalAlpha = 1; c.lineCap = 'butt';
    }
    c.restore();
  }

  FE.art = { wall, window_, door, lamp, menuBoard, shelves, counter, espressoMachine, pastryDome, drink };
})();
