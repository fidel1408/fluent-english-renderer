/* Deterministic 2D vector engine: every frame is a pure function of time t (seconds). 1080x1920. */
const FE = (() => {
  const W = 1080, H = 1920, CX = 506;                       // CX: content centre, shifted left of the right-hand social UI reserve
  const C = { navy: '#101E34', navy2: '#16294a', navyD: '#0a1424', cream: '#FFF7EB', mint: '#72D8C6', teal: '#0D625F', coral: '#F47558', skin1: '#E8B48F', skin2: '#C98A63', hair1: '#4a2e26', hair2: '#1c2433' };
  const FONT = "'Fredoka','Trebuchet MS',system-ui,sans-serif";
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const E = {
    out: x => 1 - Math.pow(1 - x, 3), quint: x => 1 - Math.pow(1 - x, 5), io: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    back: x => { const c1 = 1.8, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }, in: x => x * x * x,
  };
  const lerp = (a, b, x) => a + (b - a) * x;
  const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

  function background(c, t) {
    if (window.__FLAT) { c.fillStyle = '#8a8a8a'; c.fillRect(0, 0, W, H); return; }   // debug hook for build/verify_layout.js only
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#13243f'); g.addColorStop(1, '#0b172a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const blob = (x, y, r, col, a, k) => { c.globalAlpha = a; c.fillStyle = col; c.beginPath(); for (let i = 0; i <= 40; i++) { const an = i / 40 * 6.2832, rad = r * (1 + .1 * Math.sin(an * 3 + t * .5 + k) + .06 * Math.sin(an * 5 - t * .35 + k * 2)); c[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rad, y + Math.sin(an) * rad); } c.fill(); c.globalAlpha = 1; };
    blob(120, 520 + Math.sin(t * .4) * 18, 380, C.teal, .55, 1); blob(960, 1000 + Math.cos(t * .35) * 22, 420, C.teal, .38, 2); blob(880, 330, 190, C.mint, .08, 3); blob(160, 1500, 260, C.mint, .07, 4);
    const r = c.createRadialGradient(CX, 760, 20, CX, 760, 760); r.addColorStop(0, 'rgba(114,216,198,.14)'); r.addColorStop(1, 'rgba(114,216,198,0)'); c.fillStyle = r; c.fillRect(0, 0, W, H);
  }
  function ground(c, y0 = 1290) {
    c.fillStyle = C.teal; c.beginPath(); c.moveTo(0, y0 + 20); c.bezierCurveTo(260, y0 - 24, 700, y0 + 50, W, y0 - 6); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    c.fillStyle = 'rgba(10,20,36,.35)'; c.fillRect(0, y0 + 90, W, H);
  }

  // ---- text
  function measure(c, s, font, weight = 700) { c.font = `${weight} ${font}px ${FONT}`; return c.measureText(s).width; }
  function text(c, s, x, y, font, col, { weight = 700, align = 'center', a = 1, base = 'alphabetic' } = {}) {
    c.save(); c.globalAlpha *= a; c.font = `${weight} ${font}px ${FONT}`; c.fillStyle = col; c.textAlign = align; c.textBaseline = base; c.fillText(s, x, y); c.restore();
  }
  /* tokens: [{t, col, w (width multiplier), dx, dy, sc, a, rot, glue}] laid out on one baseline, centred on cx */
  function tokens(c, toks, cx, y, font, defCol) {
    c.font = `700 ${font}px ${FONT}`; const sp = font * .27, A0 = c.globalAlpha; let x = 0; const L = [];
    toks.forEach((k, i) => { const tw = c.measureText(k.t).width, w = k.w === undefined ? 1 : k.w; if (i && !k.glue) x += sp * w; L.push({ k, x, tw, w }); x += tw * w; });
    const total = x, x0 = cx - total / 2;
    L.forEach(({ k, x, tw, w }) => {
      const a = k.a === undefined ? 1 : k.a; if (a <= .01) return;
      c.save(); c.translate(x0 + x + tw * w / 2 + (k.dx || 0), y + (k.dy || 0)); c.rotate(k.rot || 0); c.scale(k.sc || 1, k.sc || 1); c.globalAlpha = A0 * a;
      if (k.under) { c.strokeStyle = k.under; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); const p = k.underP === undefined ? 1 : k.underP; c.moveTo(-tw / 2, 24); for (let s = 0; s <= 24 * p; s++) c.lineTo(-tw / 2 + s * tw / 24, 24 + Math.sin(s * 1.3) * 5); c.stroke(); }
      c.font = `700 ${font}px ${FONT}`; c.fillStyle = k.col || defCol; c.textAlign = 'center'; c.fillText(k.t, 0, 0);
      if (k.strike) { c.strokeStyle = k.strikeCol || C.coral; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-tw / 2 - 6, -font * .3); c.lineTo(-tw / 2 - 6 + (tw + 12) * k.strike, -font * .3); c.stroke(); }
      c.restore();
    });
    return { x0, total, L };
  }
  function pill(c, cx, cy, label, bg, fg, font = 54, { sc = 1, a = 1, icon = null } = {}) {
    c.save(); c.globalAlpha *= a; c.translate(cx, cy); c.scale(sc, sc); c.font = `700 ${font}px ${FONT}`; const iw = icon ? font * 1.1 : 0, w = c.measureText(label).width + font * 1.6 + iw, h = font * 1.85;
    c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 22; c.shadowOffsetY = 8; c.fillStyle = bg; rr(c, -w / 2, -h / 2, w, h, h / 2); c.fill(); c.shadowColor = 'transparent';
    const ix = -w / 2 + font * .8 + iw / 2;
    if (icon) { c.strokeStyle = fg; c.lineWidth = font * .13; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); const s = font * .27;
      if (icon === 'x') { c.moveTo(ix - s, -s); c.lineTo(ix + s, s); c.moveTo(ix + s, -s); c.lineTo(ix - s, s); } else { c.moveTo(ix - s, 0); c.lineTo(ix - s * .25, s * .8); c.lineTo(ix + s, -s * .8); } c.stroke(); }
    c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, iw / 2 + font * .0, 3); c.restore();
  }
  function card(c, x, y, w, h, { stroke = null, a = 1, sc = 1, fill = C.cream } = {}) {
    c.save(); c.globalAlpha *= a; c.translate(x + w / 2, y + h); c.scale(sc, sc); c.translate(-(x + w / 2), -(y + h));
    c.shadowColor = 'rgba(4,10,20,.5)'; c.shadowBlur = 44; c.shadowOffsetY = 20; c.fillStyle = fill; rr(c, x, y, w, h, 64); c.fill(); c.shadowColor = 'transparent';
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 10; rr(c, x + 5, y + 5, w - 10, h - 10, 60); c.stroke(); } c.restore();
  }
  function tail(c, x, y, tx, ty, col = C.cream, a = 1) { // speech-bubble tail from (x,y) down to (tx,ty)
    c.save(); c.globalAlpha *= a; c.fillStyle = col; c.beginPath(); c.moveTo(x - 46, y - 4); c.quadraticCurveTo((x + tx) / 2 - 10, (y + ty) / 2, tx, ty); c.quadraticCurveTo((x + tx) / 2 + 30, (y + ty) / 2 - 10, x + 40, y - 4); c.fill(); c.restore();
  }
  function particles(c, t, t0, x, y, n, seed, cols, dur = .9, speed = 260) {
    const u = (t - t0) / dur; if (u < 0 || u > 1) return;
    for (let i = 0; i < n; i++) { const an = rnd(seed + i) * 6.2832, v = speed * (.35 + rnd(seed + i + 50) * .8), px = x + Math.cos(an) * v * u, py = y + Math.sin(an) * v * u + 140 * u * u;
      c.globalAlpha = 1 - u; c.fillStyle = cols[i % cols.length]; c.beginPath(); c.arc(px, py, (4 + rnd(seed + i + 9) * 8) * (1 - u * .6), 0, 6.2832); c.fill(); }
    c.globalAlpha = 1;
  }

  // ---- avatars: flat vector busts. mood: ask | listen | happy | think. talk 0..1
  function avatar(c, kind, x, y, t, { mood = 'listen', talk = 0, sc = 1, a = 1 } = {}) {
    const woman = kind === 'woman', br = Math.sin(t * 1.8 + (woman ? 0 : 1.7)) * 3, blink = (t + (woman ? 0 : 1.3)) % 3.9 > 3.78 ? .1 : 1;
    c.save(); c.globalAlpha = a; c.translate(x, y + br); c.scale(sc, sc);
    if (woman) { c.fillStyle = C.hair1; c.beginPath(); c.moveTo(-70, -20); c.bezierCurveTo(-92, -120, 92, -120, 70, -20); c.bezierCurveTo(84, 40, 74, 84, 60, 96); c.lineTo(-60, 96); c.bezierCurveTo(-74, 84, -84, 40, -70, -20); c.fill(); }
    // shoulders
    c.fillStyle = woman ? C.coral : C.mint; c.beginPath(); c.moveTo(-132, 160); c.bezierCurveTo(-130, 78, -78, 62, -34, 58); c.lineTo(34, 58); c.bezierCurveTo(78, 62, 130, 78, 132, 160); c.fill();
    c.fillStyle = woman ? '#d9604a' : '#5bbfae'; c.beginPath(); c.moveTo(-34, 58); c.lineTo(0, 108); c.lineTo(34, 58); c.closePath(); c.fill();
    c.fillStyle = C.cream; c.beginPath(); c.moveTo(-34, 58); c.lineTo(0, 100); c.lineTo(-6, 58); c.fill(); c.beginPath(); c.moveTo(34, 58); c.lineTo(0, 100); c.lineTo(6, 58); c.fill();
    // neck + head
    const sk = woman ? C.skin1 : C.skin2; c.fillStyle = sk; rr(c, -20, 22, 40, 48, 16); c.fill();
    c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(0, 54, 22, 12, 0, 0, Math.PI); c.fill();
    c.fillStyle = sk; c.beginPath(); c.ellipse(0, -26, 58, 66, 0, 0, 6.2832); c.fill();
    c.beginPath(); c.ellipse(-58, -22, 9, 15, 0, 0, 6.2832); c.ellipse(58, -22, 9, 15, 0, 0, 6.2832); c.fill();
    // hair front
    c.fillStyle = woman ? C.hair1 : C.hair2; c.beginPath();
    if (woman) { c.moveTo(-60, -34); c.bezierCurveTo(-66, -104, 60, -112, 62, -34); c.bezierCurveTo(40, -70, -10, -78, -60, -34); }
    else { c.moveTo(-60, -34); c.bezierCurveTo(-72, -106, 66, -118, 60, -32); c.bezierCurveTo(52, -62, 30, -78, 4, -76); c.bezierCurveTo(-20, -80, -48, -66, -60, -34); }
    c.fill();
    // face
    const up = (mood === 'ask' || mood === 'curious') ? -9 : mood === 'happy' ? -3 : 0, tilt = mood === 'think' ? .03 : 0;
    c.strokeStyle = woman ? C.hair1 : C.hair2; c.lineWidth = 7; c.lineCap = 'round';
    [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s * 14, -38 + up + s * tilt * 20); c.lineTo(s * 40, -41 + up - s * tilt * 20); c.stroke(); });
    c.fillStyle = C.navyD; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 26, -20, 6.5, 8.5 * blink, 0, 0, 6.2832); c.fill(); });
    if (!woman) { c.strokeStyle = C.cream; c.lineWidth = 5; [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 26, -20, 17, 0, 6.2832); c.stroke(); }); c.beginPath(); c.moveTo(-9, -22); c.lineTo(9, -22); c.stroke(); }
    c.fillStyle = 'rgba(244,117,88,.28)'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s * 38, 4, 11, 7, 0, 0, 6.2832); c.fill(); });
    const mo = talk > 0 ? .25 + .75 * Math.abs(Math.sin(t * 13) * Math.sin(t * 5.3 + 1)) : 0;
    c.strokeStyle = '#7a2f2a'; c.fillStyle = '#5a1f1f'; c.lineWidth = 5; c.beginPath();
    if (mo > .05) { c.ellipse(0, 22, 14 + mo * 4, 4 + mo * 12, 0, 0, 6.2832); c.fill(); }
    else if (mood === 'ask') { c.ellipse(0, 24, 7, 8, 0, 0, 6.2832); c.stroke(); }
    else if (mood === 'think') { c.moveTo(-13, 23); c.quadraticCurveTo(0, 27, 13, 22); c.stroke(); }
    else { const s = mood === 'happy' ? 12 : 7; c.moveTo(-17, 18); c.quadraticCurveTo(0, 28 + s, 17, 18); c.stroke(); }
    if (woman) { c.fillStyle = C.mint; [-1, 1].forEach(s => { c.beginPath(); c.arc(s * 59, 0, 6, 0, 6.2832); c.fill(); }); }
    c.restore();
  }

  function caption(c, t, cues) {
    const q = cues.find(k => t >= (k.cs ?? k.start) - .05 && t <= (k.ce ?? k.end) + .25); if (!q) return;
    const s0 = q.cs ?? q.start, e0 = q.ce ?? q.end, a = Math.min(seg(t, s0 - .05, s0 + .12), 1 - seg(t, e0 + .05, e0 + .25));
    const textShown = q.caption || q.text;
    c.save(); c.globalAlpha = a; c.font = `600 64px ${FONT}`; const maxW = 800, ws = q.text.split(' '), lines = []; let cur = '';
    ws.forEach(w => { const s = cur ? cur + ' ' + w : w; if (c.measureText(s).width > maxW && cur) { lines.push(cur); cur = w; } else cur = s; }); lines.push(cur);
    const lh = 80, h = lines.length * lh + 34, w = Math.min(maxW + 70, Math.max(...lines.map(l => c.measureText(l).width)) + 80), y = 1478 - h;
    c.fillStyle = 'rgba(10,20,36,.9)'; rr(c, CX - w / 2, y, w, h, 40); c.fill(); c.strokeStyle = 'rgba(114,216,198,.45)'; c.lineWidth = 3; rr(c, CX - w / 2, y, w, h, 40); c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'center'; c.textBaseline = 'middle'; lines.forEach((l, i) => c.fillText(l, CX, y + 17 + lh * (i + .5) + 2)); c.restore();
  }

  return { W, H, CX, C, FONT, clamp, seg, E, lerp, rnd, rr, background, ground, text, tokens, pill, card, tail, particles, avatar, caption, measure };
})();
