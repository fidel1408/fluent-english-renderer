/* Illustration layer — everything is drawn with canvas paths (no bitmaps except the logo). */
(function () {
  const FE = (window.FE = window.FE || {});
  const C = FE.COLORS;
  const TAU = Math.PI * 2;
  const A = (FE.Art = {});

  /* ---------- helpers ---------- */
  function sr(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
  A.sr = sr;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = {
    out: (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3),
    inOut: (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    back: (t) => { t = clamp(t, 0, 1); const c = 1.70158, d = c + 1; return 1 + d * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };
  A.ease = ease; A.clamp = clamp; A.lerp = lerp;

  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  A.rr = rr;
  function lin(g, x0, y0, x1, y1, stops) {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr;
  }
  function rad(g, x, y, r0, r1, stops) {
    const gr = g.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr;
  }
  A.lin = lin; A.rad = rad;
  function ell(g, x, y, rx, ry, rot) { g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, TAU); }
  function shadowOn(g, color, blur, ox, oy) { g.shadowColor = color; g.shadowBlur = blur; g.shadowOffsetX = ox || 0; g.shadowOffsetY = oy || 0; }
  function shadowOff(g) { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; }
  A.shadowOn = shadowOn; A.shadowOff = shadowOff;

  /* ---------- café background (static, cached) ---------- */
  const COUNTER_Y = 1245;
  A.COUNTER_Y = COUNTER_Y;

  function drawWall(g) {
    const W = FE.W;
    g.fillStyle = lin(g, 0, 0, 0, 1260, [[0, '#A9472F'], [0.5, '#C65A3E'], [1, '#DE7B55']]);
    g.fillRect(0, 0, W, 1260);
    // plaster speckle
    const r = sr(11);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() > 0.5 ? 'rgba(255,225,190,0.045)' : 'rgba(80,25,10,0.05)';
      const s = 2 + r() * 5; g.fillRect(r() * W, r() * 1200, s, s);
    }
    // soft vignette corners
    g.fillStyle = rad(g, 540, 700, 300, 1250, [[0, 'rgba(255,200,140,0.20)'], [1, 'rgba(60,10,0,0.35)']]);
    g.fillRect(0, 0, W, 1260);

    // teal wainscot with tiles
    g.fillStyle = lin(g, 0, 1020, 0, 1260, [[0, '#14656C'], [1, '#0B3F45']]);
    g.fillRect(0, 1020, W, 240);
    g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 3;
    for (let y = 1020; y < 1260; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let row = 0; row < 4; row++) {
      for (let x = (row % 2) * 60 - 60; x < W; x += 120) {
        g.beginPath(); g.moveTo(x, 1020 + row * 60); g.lineTo(x, 1080 + row * 60); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x + 4, 1024 + row * 60, 52, 6);
      }
    }
    // chair rail
    g.fillStyle = lin(g, 0, 1006, 0, 1030, [[0, '#FFF3DA'], [1, '#E3C99A']]);
    rr(g, -10, 1004, W + 20, 26, 8); g.fill();
  }

  function drawWindow(g) {
    // right-hand window with light and blurred greenery
    const x = 690, y = 470, w = 330, h = 520;
    g.save();
    shadowOn(g, 'rgba(60,10,0,0.45)', 30, 0, 14);
    g.fillStyle = C.cream; rr(g, x - 22, y - 22, w + 44, h + 44, 34); g.fill(); shadowOff(g);
    g.restore();
    g.save(); rr(g, x, y, w, h, 18); g.clip();
    g.fillStyle = lin(g, 0, y, 0, y + h, [[0, '#FFF1C8'], [0.55, '#FBE3A8'], [1, '#F2C987']]);
    g.fillRect(x, y, w, h);
    g.fillStyle = rad(g, x + 240, y + 130, 10, 330, [[0, 'rgba(255,255,255,0.85)'], [1, 'rgba(255,255,255,0)']]);
    g.fillRect(x, y, w, h);
    // blurred street shapes + trees
    const r = sr(5);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = `rgba(${90 + r() * 40},${150 + r() * 50},${70 + r() * 30},0.55)`;
      ell(g, x + r() * w, y + h - 60 + r() * 60, 60 + r() * 60, 70 + r() * 80); g.fill();
    }
    g.fillStyle = 'rgba(200,90,60,0.55)'; g.fillRect(x, y + h - 150, w, 150);
    g.fillStyle = 'rgba(255,230,180,0.5)'; g.fillRect(x, y + h - 150, w, 12);
    g.restore();
    // mullions
    g.strokeStyle = C.cream; g.lineWidth = 14; g.lineCap = 'butt';
    g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h * 0.42); g.lineTo(x + w, y + h * 0.42); g.stroke();
    // sill
    g.fillStyle = lin(g, 0, y + h + 10, 0, y + h + 40, [[0, '#FFF3DA'], [1, '#D9BE8A']]);
    rr(g, x - 40, y + h + 14, w + 80, 30, 10); g.fill();
  }

  function drawMenuBoard(g) {
    const x = 70, y = 520, w = 300, h = 450;
    g.save(); shadowOn(g, 'rgba(40,5,0,0.5)', 28, 0, 14);
    g.fillStyle = '#7B4A2A'; rr(g, x - 18, y - 18, w + 36, h + 36, 22); g.fill(); shadowOff(g); g.restore();
    g.fillStyle = lin(g, x, y, x + w, y + h, [[0, '#14595F'], [1, '#0A3A3F']]); rr(g, x, y, w, h, 12); g.fill();
    // chalk doodles (no readable text — the board is decoration)
    g.strokeStyle = 'rgba(255,248,230,0.85)'; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x + 40, y + 62); g.quadraticCurveTo(x + 150, y + 30, x + 260, y + 62); g.stroke();
    g.lineWidth = 3;
    const rows = [120, 190, 260, 330, 400].map((v) => v + y);
    rows.forEach((yy, i) => {
      g.beginPath(); g.moveTo(x + 70, yy); g.lineTo(x + 200 - (i % 2) * 30, yy); g.stroke();
      g.beginPath(); g.moveTo(x + 224, yy); g.lineTo(x + 262, yy); g.stroke();
    });
    // little chalk icons
    g.strokeStyle = 'rgba(221,240,122,0.9)'; g.lineWidth = 4;
    g.beginPath(); g.arc(x + 40, rows[0] - 2, 9, 0, TAU); g.stroke();
    g.beginPath(); g.arc(x + 40, rows[2] - 2, 9, 0, Math.PI); g.stroke();
    g.beginPath(); g.moveTo(x + 31, rows[4] - 2); g.lineTo(x + 49, rows[4] - 2); g.moveTo(x + 40, rows[4] - 11); g.lineTo(x + 40, rows[4] + 7); g.stroke();
  }

  function drawLamp(g, x, cordY, s) {
    g.save(); g.translate(x, 0);
    g.strokeStyle = '#2B1810'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -10); g.lineTo(0, cordY); g.stroke();
    g.translate(0, cordY);
    // glow
    g.fillStyle = rad(g, 0, 70 * s, 10, 330 * s, [[0, 'rgba(255,214,130,0.55)'], [0.5, 'rgba(255,190,100,0.16)'], [1, 'rgba(255,190,100,0)']]);
    g.fillRect(-340 * s, -120 * s, 680 * s, 700 * s);
    g.fillStyle = lin(g, -60 * s, 0, 60 * s, 0, [[0, '#0A363B'], [0.5, '#1B7078'], [1, '#0A363B']]);
    g.beginPath(); g.moveTo(-18 * s, 0); g.lineTo(18 * s, 0); g.lineTo(68 * s, 70 * s); g.quadraticCurveTo(0, 86 * s, -68 * s, 70 * s); g.closePath(); g.fill();
    g.fillStyle = '#FFE9A8'; ell(g, 0, 74 * s, 54 * s, 12 * s); g.fill();
    g.restore();
  }

  function drawPlant(g, x, y, s, seed) {
    const r = sr(seed);
    g.save(); g.translate(x, y); g.scale(s, s);
    // pot
    g.fillStyle = lin(g, -50, 0, 50, 0, [[0, '#E58A62'], [1, '#B8502F']]);
    g.beginPath(); g.moveTo(-52, -80); g.lineTo(52, -80); g.lineTo(38, 0); g.lineTo(-38, 0); g.closePath(); g.fill();
    g.fillStyle = '#D9694A'; rr(g, -58, -96, 116, 24, 8); g.fill();
    // leaves
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI / 2 + (i - 5) * 0.22 + (r() - 0.5) * 0.12, L = 120 + r() * 90;
      g.save(); g.translate(0, -90); g.rotate(a + Math.PI / 2);
      g.fillStyle = lin(g, 0, 0, 0, -L, [[0, '#0F5B3B'], [1, i % 2 ? '#7FAE2E' : '#3E8A3C']]);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(34, -L * 0.45, 0, -L); g.quadraticCurveTo(-34, -L * 0.45, 0, 0); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -L * 0.9); g.stroke();
      g.restore();
    }
    g.restore();
  }

  function drawBunting(g) {
    // small pennants across the top (keeps the hook zone festive, not text-heavy)
    const cols = [C.lime, C.cream, C.teal, C.terracottaLight];
    g.strokeStyle = 'rgba(43,24,16,0.7)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(-10, 120); g.quadraticCurveTo(540, 210, 1090, 120); g.stroke();
    for (let i = 0; i < 12; i++) {
      const t = (i + 0.5) / 12, x = lerp(-10, 1090, t), y = 120 + 2 * (1 - t) * t * 90 * 1.0;
      g.fillStyle = cols[i % 4];
      g.beginPath(); g.moveTo(x - 26, y); g.lineTo(x + 26, y); g.lineTo(x, y + 58); g.closePath(); g.fill();
    }
  }

  function buildBackground() {
    const c = document.createElement('canvas'); c.width = FE.W; c.height = FE.H;
    const g = c.getContext('2d');
    drawWall(g); drawWindow(g); drawMenuBoard(g);
    drawBunting(g);
    drawLamp(g, 130, 250, 1); drawLamp(g, 950, 250, 1);
    drawPlant(g, 112, COUNTER_Y + 2, 1.0, 3); drawPlant(g, 972, COUNTER_Y + 2, 0.9, 8);
    return c;
  }

  function buildCounter() {
    const c = document.createElement('canvas'); c.width = FE.W; c.height = FE.H;
    const g = c.getContext('2d'); const W = FE.W;
    // top surface
    g.fillStyle = lin(g, 0, COUNTER_Y, 0, 1585, [[0, '#E6CE9F'], [0.35, '#F6E6C3'], [1, '#FFF3DA']]);
    g.fillRect(0, COUNTER_Y, W, 345);
    // terrazzo flecks
    const r = sr(21);
    const fl = ['#C65A3E', '#0F4F55', '#B5D335', '#E58A62'];
    for (let i = 0; i < 260; i++) {
      g.fillStyle = fl[i % 4] + '55';
      const y = COUNTER_Y + 10 + r() * 330, s = (1.5 + r() * 4.5) * (0.6 + (y - COUNTER_Y) / 500);
      g.save(); g.translate(r() * W, y); g.rotate(r() * 6); g.fillRect(-s, -s / 2, s * 2, s); g.restore();
    }
    // far-edge shadow & soft light
    g.fillStyle = lin(g, 0, COUNTER_Y - 4, 0, COUNTER_Y + 50, [[0, 'rgba(60,25,10,0.55)'], [1, 'rgba(60,25,10,0)']]);
    g.fillRect(0, COUNTER_Y - 4, W, 54);
    g.fillStyle = rad(g, 540, 1420, 40, 620, [[0, 'rgba(255,240,200,0.35)'], [1, 'rgba(255,240,200,0)']]);
    g.fillRect(0, COUNTER_Y, W, 345);
    // front lip
    g.fillStyle = lin(g, 0, 1585, 0, 1625, [[0, '#FFF9E8'], [0.5, '#E9D3A4'], [1, '#B99A66']]);
    g.fillRect(0, 1585, W, 40);
    // front face: fluted teal panel
    g.fillStyle = lin(g, 0, 1625, 0, FE.H, [[0, '#145F66'], [1, '#093238']]);
    g.fillRect(0, 1625, W, FE.H - 1625);
    for (let x = 0; x < W; x += 54) {
      g.fillStyle = lin(g, x, 0, x + 54, 0, [[0, 'rgba(255,255,255,0.10)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,0.28)']]);
      g.fillRect(x, 1625, 54, FE.H - 1625);
    }
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, 1625, W, 16);
    return c;
  }

  A.init = function () {
    if (A.bg) return;
    A.bg = buildBackground(); A.counter = buildCounter();
  };

  /* ---------- dynamic light: dust motes / bokeh ---------- */
  A.motes = function (g, t, alpha) {
    const r = sr(77);
    for (let i = 0; i < 26; i++) {
      const bx = r() * FE.W, by = 150 + r() * 1000, sp = 8 + r() * 14, ph = r() * TAU, rd = 4 + r() * 10;
      const x = bx + Math.sin(t * 0.3 + ph) * 22, y = ((by - t * sp) % 1050 + 1050) % 1050 + 120;
      g.fillStyle = `rgba(255,236,190,${(0.10 + 0.12 * Math.sin(t * 0.8 + ph) ** 2) * alpha})`;
      g.beginPath(); g.arc(x, y, rd, 0, TAU); g.fill();
    }
  };

  /* ---------- hands (5 fingers, jointed, thumb on the medial side) ---------- */
  // pose.curl: 0 open .. 1 relaxed-curled. side: -1 viewer-left hand, +1 viewer-right hand.
  function limb(g, pts, widths, fill, outline) {
    // draw tapered limb along pts with round joints
    const draw = (extra, col) => {
      g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        g.lineWidth = lerp(widths[i], widths[i + 1], 0.5) + extra;
        g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke();
      }
    };
    if (outline) draw(5, outline);
    draw(0, fill);
  }

  A.hand = function (g, x, y, rot, side, o) {
    o = o || {};
    const spread = o.spread == null ? 0.18 : o.spread, sc = o.scale || 1, fore = o.fore == null ? 1 : o.fore;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc * fore);
    const skin = C.skin, dark = '#7D4E33';
    const med = -side; // local x direction of the thumb side (toward the body midline)
    // palm outline (wrist at y=+6, knuckles at y=-92)
    const palm = () => {
      g.beginPath(); g.moveTo(-28, 8);
      g.quadraticCurveTo(-46, -36, -45, -90); g.quadraticCurveTo(0, -102, 45, -90);
      g.quadraticCurveTo(47, -36, 28, 8); g.quadraticCurveTo(0, 20, -28, 8); g.closePath();
    };
    // fingers: base x on the knuckle line, length, width, fan angle (index..pinky; index is on the thumb side)
    const dirI = med; // index finger sits on the thumb side
    const F = [
      { bx: dirI * 33, len: 82, w: 21, a: dirI * spread * 0.9 },
      { bx: dirI * 11, len: 92, w: 22, a: dirI * spread * 0.3 },
      { bx: -dirI * 11, len: 86, w: 21, a: -dirI * spread * 0.3 },
      { bx: -dirI * 33, len: 68, w: 18, a: -dirI * spread * 0.9 },
    ].map((f) => {
      const segs = [0.44, 0.30, 0.26].map((q) => q * f.len);
      const pts = [[f.bx, -88]]; let px = f.bx, py = -88;
      segs.forEach((l) => { px += Math.sin(f.a) * l; py -= Math.cos(f.a) * l; pts.push([px, py]); });
      return { pts, w: f.w };
    });
    // thumb: starts on the thumb side of the lower palm, angled ~38° out, two joints
    const ta = med * 0.66;
    const tp0 = [med * 36, -26], tp1 = [tp0[0] + Math.sin(ta) * 40, tp0[1] - Math.cos(ta) * 40];
    const ta2 = ta + med * 0.12, tp2 = [tp1[0] + Math.sin(ta2) * 34, tp1[1] - Math.cos(ta2) * 34];
    const thumb = { pts: [tp0, tp1, tp2], w: [30, 27, 23] };

    // pass 1: all outlines (so overlapping parts merge without inner seams)
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = dark; g.lineWidth = 5; palm(); g.stroke();
    const trace = (pts, ws, extra, col) => {
      g.strokeStyle = col; g.lineCap = 'round';
      for (let i = 0; i < pts.length - 1; i++) { g.lineWidth = (ws[i] + ws[i + 1]) / 2 + extra; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke(); }
    };
    F.forEach((f) => trace(f.pts, [f.w, f.w * 0.96, f.w * 0.9, f.w * 0.84], 5, dark));
    trace(thumb.pts, thumb.w, 5, dark);
    // pass 2: fills
    g.fillStyle = skin; palm(); g.fill();
    F.forEach((f) => trace(f.pts, [f.w, f.w * 0.96, f.w * 0.9, f.w * 0.84], 0, skin));
    trace(thumb.pts, thumb.w, 0, skin);
    g.fillStyle = skin; palm(); g.fill();
    // shading + details
    g.fillStyle = lin(g, -40, -92, 40, 10, [[0, 'rgba(255,255,255,0.14)'], [1, 'rgba(70,30,10,0.14)']]); palm(); g.fill();
    g.strokeStyle = 'rgba(110,64,38,0.45)'; g.lineWidth = 2.2; g.lineCap = 'round';
    F.concat([thumb]).forEach((f) => {
      for (let k = 1; k < f.pts.length - 1; k++) { const [cx, cy] = f.pts[k], w = Array.isArray(f.w) ? f.w[k] : f.w; g.beginPath(); g.moveTo(cx - w * 0.28, cy); g.lineTo(cx + w * 0.28, cy); g.stroke(); }
    });
    g.fillStyle = 'rgba(255,232,210,0.5)';
    F.concat([thumb]).forEach((f) => { const [ex, ey] = f.pts[f.pts.length - 1], w = Array.isArray(f.w) ? f.w[2] : f.w; ell(g, ex, ey + 1, w * 0.2, w * 0.2); g.fill(); });
    g.strokeStyle = 'rgba(120,70,40,0.32)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(med * 26, -34); g.quadraticCurveTo(0, -26, -med * 28, -56); g.stroke();
    g.beginPath(); g.moveTo(med * 22, -18); g.quadraticCurveTo(0, -12, -med * 26, -28); g.stroke();
    g.restore();
  };

  /* ---------- character ---------- */
  function headBlob(g) {
    g.beginPath();
    g.moveTo(0, -128);
    g.bezierCurveTo(60, -128, 98, -92, 100, -30);
    g.bezierCurveTo(102, 30, 92, 74, 62, 108);
    g.bezierCurveTo(40, 128, 16, 136, 0, 136);
    g.bezierCurveTo(-16, 136, -40, 128, -62, 108);
    g.bezierCurveTo(-92, 74, -102, 30, -100, -30);
    g.bezierCurveTo(-98, -92, -60, -128, 0, -128);
    g.closePath();
  }
  const stub = (() => { const r = sr(4); const a = []; for (let i = 0; i < 520; i++) a.push([-96 + r() * 192, 20 + r() * 120, 1 + r() * 1.6]); return a; })();

  function face(g, m) {
    // m: {blink, smile, brow, lookX, lookY, talk}
    // neck
    g.fillStyle = lin(g, -50, 0, 50, 0, [[0, '#A96F4B'], [0.5, '#BE845D'], [1, '#9A6342']]);
    rr(g, -52, 70, 104, 120, 30); g.fill();
    g.fillStyle = 'rgba(60,25,10,0.28)'; ell(g, 0, 128, 70, 30); g.fill(); // jaw shadow on neck
    // ears
    [-1, 1].forEach((s) => {
      g.fillStyle = '#B67A55'; ell(g, s * 100, 6, 17, 30); g.fill();
      g.fillStyle = '#9A6140'; ell(g, s * 100, 8, 8, 18); g.fill();
    });
    // face
    g.fillStyle = lin(g, -100, -100, 100, 120, [[0, '#D9A47B'], [0.55, '#C98F66'], [1, '#B27A55']]);
    headBlob(g); g.fill();
    g.save(); headBlob(g); g.clip();
    // cheek light + jaw shade
    g.fillStyle = rad(g, -28, -10, 10, 120, [[0, 'rgba(255,225,190,0.35)'], [1, 'rgba(255,225,190,0)']]); g.fillRect(-120, -140, 240, 290);
    g.fillStyle = lin(g, 0, 40, 0, 140, [[0, 'rgba(70,30,15,0)'], [1, 'rgba(70,30,15,0.28)']]); g.fillRect(-120, 20, 240, 130);
    g.fillStyle = 'rgba(214,98,70,0.20)'; ell(g, -58, 40, 24, 16); g.fill(); ell(g, 58, 40, 24, 16); g.fill();
    // stubble (5 o'clock shadow) over jaw/chin
    g.fillStyle = 'rgba(40,22,15,0.16)';
    g.beginPath(); g.moveTo(-98, 20); g.bezierCurveTo(-70, 70, -40, 52, 0, 52); g.bezierCurveTo(40, 52, 70, 70, 98, 20); g.lineTo(100, 150); g.lineTo(-100, 150); g.closePath(); g.fill();
    g.fillStyle = 'rgba(30,16,10,0.22)';
    stub.forEach(([x, y, s]) => { const inJaw = y > 52 - Math.abs(x) * 0.2; if (inJaw && Math.abs(x) < 94) g.fillRect(x, y, s, s); });
    g.restore();
    // mustache
    g.fillStyle = '#2A1A14';
    g.beginPath(); g.moveTo(0, 54); g.bezierCurveTo(-18, 46, -48, 52, -56, 70); g.bezierCurveTo(-30, 68, -14, 66, 0, 64);
    g.bezierCurveTo(14, 66, 30, 68, 56, 70); g.bezierCurveTo(48, 52, 18, 46, 0, 54); g.fill();

    // nose
    g.strokeStyle = 'rgba(100,55,30,0.55)'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-8, -16); g.quadraticCurveTo(-16, 18, -20, 34); g.stroke();
    g.fillStyle = 'rgba(255,225,190,0.35)'; ell(g, 3, 24, 10, 14); g.fill();
    g.fillStyle = 'rgba(80,40,22,0.6)'; ell(g, -12, 40, 7, 4.5, -0.3); g.fill(); ell(g, 12, 40, 7, 4.5, 0.3); g.fill();
    g.strokeStyle = 'rgba(100,55,30,0.5)'; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(-26, 34); g.quadraticCurveTo(-30, 44, -16, 46); g.moveTo(26, 34); g.quadraticCurveTo(30, 44, 16, 46); g.stroke();

    // eyes
    const bl = 1 - m.blink * 0.92;
    [-1, 1].forEach((s) => {
      const ex = s * 42, ey = -18;
      g.save(); g.translate(ex, ey);
      g.fillStyle = '#FBF3E6'; g.beginPath(); g.moveTo(-23, 2); g.quadraticCurveTo(0, -17 * bl - 4, 23, 2); g.quadraticCurveTo(0, 14 * bl + 4, -23, 2); g.fill();
      g.save(); g.beginPath(); g.moveTo(-23, 2); g.quadraticCurveTo(0, -17 * bl - 4, 23, 2); g.quadraticCurveTo(0, 14 * bl + 4, -23, 2); g.clip();
      const ix = m.lookX * 7, iy = m.lookY * 4;
      g.fillStyle = rad(g, ix, iy, 2, 13, [[0, '#6B3E22'], [1, '#2C170C']]); ell(g, ix, iy + 1, 12, 12.5); g.fill();
      g.fillStyle = '#0E0806'; ell(g, ix, iy + 1, 6, 6.5); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.95)'; ell(g, ix + 4, iy - 4, 3.2, 3.2); g.fill(); ell(g, ix - 3, iy + 5, 1.6, 1.6); g.fill();
      g.restore();
      g.strokeStyle = '#2A1A14'; g.lineWidth = 5.5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-25, 3); g.quadraticCurveTo(0, -18 * bl - 5, 25, 3); g.stroke();
      g.strokeStyle = 'rgba(90,50,30,0.45)'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(-20, 7); g.quadraticCurveTo(0, 14 * bl + 6, 20, 7); g.stroke();
      g.restore();
      // brow
      const by = -52 - m.brow * 9 + (s === 1 ? -m.brow * 2 : 0);
      g.fillStyle = '#2A1A14';
      g.beginPath();
      g.moveTo(s * 18, by + 7); g.quadraticCurveTo(s * 40, by - 8 - m.brow * 3, s * 72, by + 6);
      g.quadraticCurveTo(s * 40, by - 1 - m.brow * 3, s * 18, by + 15); g.closePath(); g.fill();
    });

    // mouth (smile; teeth when wide)
    const sm = m.smile, my = 84, mw = 30 + sm * 8, open = clamp(m.talk, 0, 1) * 9 + sm * 4.5;
    g.fillStyle = '#5A1F18';
    g.beginPath(); g.moveTo(-mw, my - sm * 5);
    g.quadraticCurveTo(0, my + 6 + open * 2.2, mw, my - sm * 5);
    g.quadraticCurveTo(0, my - 2 + (sm * 4) - open * 0.2, -mw, my - sm * 5); g.fill();
    if (open > 3) {
      g.save(); g.beginPath(); g.moveTo(-mw + 3, my - sm * 5); g.quadraticCurveTo(0, my + 6 + open * 2.2, mw - 3, my - sm * 5);
      g.quadraticCurveTo(0, my - 1, -mw + 3, my - sm * 5); g.clip();
      g.fillStyle = '#FFFFFF'; g.fillRect(-mw, my - sm * 5, mw * 2, 8 + open * 0.3);
      g.fillStyle = '#B5524A'; ell(g, 0, my + 14, 16, 8); g.fill(); g.restore();
    }
    g.strokeStyle = 'rgba(70,24,16,0.85)'; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(-mw - 3, my - sm * 6 - 2); g.quadraticCurveTo(-mw - 6, my - sm * 6 + 2, -mw + 1, my - sm * 5 + 1);
    g.moveTo(mw + 3, my - sm * 6 - 2); g.quadraticCurveTo(mw + 6, my - sm * 6 + 2, mw - 1, my - sm * 5 + 1); g.stroke();
    // smile lines
    g.strokeStyle = 'rgba(100,55,30,0.35)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-58, 52); g.quadraticCurveTo(-66, 78, -50, 96); g.moveTo(58, 52); g.quadraticCurveTo(66, 78, 50, 96); g.stroke();

    // hair: short, side-swept quiff with faded sides
    g.fillStyle = lin(g, 0, -170, 0, -40, [[0, '#3B2519'], [1, '#1D110C']]);
    g.beginPath();
    g.moveTo(-100, -20); g.bezierCurveTo(-112, -104, -78, -150, -10, -154);
    g.bezierCurveTo(50, -170, 112, -128, 100, -20);
    g.bezierCurveTo(98, -52, 92, -78, 84, -86);
    g.bezierCurveTo(54, -92, 20, -100, -6, -90);
    g.bezierCurveTo(-36, -80, -62, -78, -80, -64);
    g.bezierCurveTo(-92, -52, -96, -36, -100, -20); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,230,200,0.14)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-70 + i * 17, -128 + Math.abs(i - 4) * 4); g.quadraticCurveTo(-40 + i * 17, -150, 10 + i * 12, -128 + (i % 2) * 6); g.stroke(); }
    g.fillStyle = 'rgba(30,17,12,0.22)'; // side fade over temples
    g.beginPath(); g.moveTo(-100, -20); g.lineTo(-92, 40); g.lineTo(-84, 6); g.lineTo(-90, -40); g.fill();
    g.beginPath(); g.moveTo(100, -20); g.lineTo(92, 40); g.lineTo(84, 6); g.lineTo(90, -40); g.fill();
  }

  // Arm geometry (relative to the counter edge). Elbows stay close to the ribs; forearms rest forward on the counter.
  const ARM = {
    shoulder: (side, bodyY) => [side * 205, bodyY + 66],
    elbow: (side) => [side * 238, -104],
    wrist: (side) => [side * 148, 16],
  };

  function taper(g, p0, p1, w0, w1, fill, outline) {
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const path = () => {
      g.beginPath();
      g.moveTo(p0[0] + nx * w0 / 2, p0[1] + ny * w0 / 2); g.lineTo(p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2);
      g.arc(p1[0], p1[1], w1 / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
      g.lineTo(p0[0] - nx * w0 / 2, p0[1] - ny * w0 / 2);
      g.arc(p0[0], p0[1], w0 / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true);
      g.closePath();
    };
    path(); if (outline) { g.lineWidth = 5; g.strokeStyle = outline; g.lineJoin = 'round'; g.stroke(); }
    g.fillStyle = fill; path(); g.fill();
  }

  /** Draws the customer (torso, upper arms, head). o = { x, y(counter edge), s, t, mood:{smile,brow,talk,lookX,lookY}, nod, tilt } */
  A.customer = function (g, o) {
    const t = o.t, s = o.s || 1, mood = o.mood || {};
    const breathe = Math.sin(t * 1.7) * 3.0;
    const bph = (t % 3.4); const blink = bph < 0.14 ? Math.sin(bph / 0.14 * Math.PI) : 0;
    const look = Math.sin(t * 0.55) * 0.25, nod = o.nod || 0;
    g.save(); g.translate(o.x, o.y); g.scale(s, s);
    const bodyY = -300 + breathe;

    // upper arms first (behind the torso edge)
    [-1, 1].forEach((side) => {
      const sh = ARM.shoulder(side, bodyY), e = ARM.elbow(side);
      taper(g, sh, e, 80, 64, C.skin, '#8D5A3B');
      g.strokeStyle = 'rgba(255,225,190,0.16)'; g.lineWidth = 10; g.lineCap = 'round';
      g.beginPath(); g.moveTo(lerp(sh[0], e[0], 0.5) - side * 10, lerp(sh[1], e[1], 0.5)); g.lineTo(lerp(sh[0], e[0], 0.9) - side * 8, lerp(sh[1], e[1], 0.9)); g.stroke();
    });

    // torso
    g.save(); g.translate(0, bodyY);
    g.fillStyle = lin(g, -240, 0, 240, 0, [[0, '#87AF29'], [0.35, '#A9CB3C'], [0.7, '#9CC033'], [1, '#779A22']]);
    g.beginPath(); g.moveTo(-70, -20);
    g.bezierCurveTo(-140, -12, -228, 8, -240, 64); g.lineTo(-262, 330); g.lineTo(262, 330); g.lineTo(240, 64);
    g.bezierCurveTo(228, 8, 140, -12, 70, -20); g.closePath(); g.fill();
    g.fillStyle = 'rgba(40,60,0,0.16)'; g.beginPath(); g.moveTo(-240, 64); g.lineTo(-262, 330); g.lineTo(-196, 330); g.lineTo(-188, 96); g.fill();
    g.beginPath(); g.moveTo(240, 64); g.lineTo(262, 330); g.lineTo(196, 330); g.lineTo(188, 96); g.fill();
    g.strokeStyle = 'rgba(50,70,0,0.25)'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-112, 130); g.quadraticCurveTo(-84, 190, -104, 280); g.moveTo(104, 120); g.quadraticCurveTo(76, 190, 94, 290); g.stroke();
    g.strokeStyle = 'rgba(255,255,220,0.2)'; g.lineWidth = 6; g.beginPath(); g.moveTo(-60, 44); g.quadraticCurveTo(0, 72, 70, 40); g.stroke();
    g.strokeStyle = 'rgba(50,70,0,0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 60); g.lineTo(0, 330); g.stroke();
    g.fillStyle = '#F6F0D8'; [100, 170, 240, 310].forEach((yy) => { ell(g, 0, yy, 7, 7); g.fill(); });
    g.fillStyle = 'rgba(20,40,0,0.25)'; [100, 170, 240, 310].forEach((yy) => { ell(g, 0, yy + 2, 3, 3); g.fill(); });
    g.strokeStyle = 'rgba(50,70,0,0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(-170, 130); g.lineTo(-100, 130); g.lineTo(-104, 196); g.lineTo(-166, 196); g.closePath(); g.stroke();
    g.restore();

    // short sleeves (tapered, flat hem) over the top of each upper arm
    [-1, 1].forEach((side) => {
      const sh = ARM.shoulder(side, bodyY), e = ARM.elbow(side);
      const hem = [lerp(sh[0], e[0], 0.5), lerp(sh[1], e[1], 0.5)];
      const sp = [sh[0] - side * 6, sh[1] - 22];
      taper(g, sp, hem, 108, 94, '#93B72F', 'rgba(60,85,10,0.55)');
      g.fillStyle = 'rgba(40,60,0,0.20)';
      const dx = hem[0] - sp[0], dy = hem[1] - sp[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
      g.beginPath(); g.moveTo(sp[0] + nx * side * 40, sp[1] + ny * side * 40); g.lineTo(hem[0] + nx * side * 43, hem[1] + ny * side * 43);
      g.lineTo(hem[0] + nx * side * 12, hem[1] + ny * side * 12); g.lineTo(sp[0] + nx * side * 14, sp[1] + ny * side * 14); g.closePath(); g.fill();
      g.strokeStyle = '#7E9F27'; g.lineWidth = 8; g.lineCap = 'butt';
      g.beginPath(); g.moveTo(hem[0] + nx * 47, hem[1] + ny * 47); g.lineTo(hem[0] - nx * 47, hem[1] - ny * 47); g.stroke();
    });

    // collar
    g.fillStyle = '#B5D335'; g.strokeStyle = 'rgba(50,70,0,0.4)'; g.lineWidth = 4;
    [-1, 1].forEach((sd) => {
      g.beginPath(); g.moveTo(sd * 8, bodyY + 40); g.lineTo(sd * 84, bodyY - 20); g.lineTo(sd * 98, bodyY + 40); g.lineTo(sd * 20, bodyY + 126); g.closePath(); g.fill(); g.stroke();
    });
    // head (scaled up a touch for friendlier proportions)
    g.save(); g.translate(0, bodyY - 166 + nod * 5); g.scale(1.16, 1.16); g.rotate(Math.sin(t * 0.7) * 0.012 + (o.tilt || 0));
    face(g, { blink, smile: mood.smile == null ? 0.8 : mood.smile, brow: mood.brow || 0, lookX: (mood.lookX == null ? look : mood.lookX), lookY: mood.lookY || 0, talk: mood.talk || 0 });
    g.restore();
    g.restore();
  };

  /** Forearms + hands, drawn after the counter so they rest on its surface. Five fingers each, relaxed. */
  A.customerHands = function (g, o) {
    const s = o.s || 1, t = o.t;
    g.save(); g.translate(o.x, o.y); g.scale(s, s);
    [-1, 1].forEach((side) => {
      const e = ARM.elbow(side), w = ARM.wrist(side);
      const wob = Math.sin(t * 1.1 + side) * 1.2;
      // soft contact shadow on the counter
      g.fillStyle = 'rgba(60,25,8,0.20)'; ell(g, lerp(e[0], w[0], 0.55) + 6, lerp(e[1], w[1], 0.6) + 34, 62, 22, 0.6 * -side); g.fill();
      taper(g, e, [w[0], w[1] + wob], 64, 50, C.skin, '#8D5A3B');
      g.strokeStyle = 'rgba(255,225,190,0.16)'; g.lineWidth = 9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(lerp(e[0], w[0], 0.2) + side * 8, lerp(e[1], w[1], 0.2)); g.lineTo(lerp(e[0], w[0], 0.75) + side * 6, lerp(e[1], w[1], 0.75)); g.stroke();
      const ang = Math.atan2(w[1] - e[1], w[0] - e[0]) + Math.PI / 2;
      A.hand(g, w[0], w[1] + wob, ang, side, { curl: 0.5, spread: 0.1, fore: 0.58, scale: 0.8 });
    });
    g.restore();
  };

  /* ---------- food ---------- */
  A.plate = function (g, x, y, sc, glow) {
    g.save(); g.translate(x, y); g.scale(sc, sc);
    g.fillStyle = 'rgba(50,20,5,0.35)'; ell(g, 6, 52, 380, 82); g.fill();
    g.fillStyle = lin(g, 0, -70, 0, 70, [[0, '#14707A'], [1, '#0A4349']]); ell(g, 0, 22, 372, 96); g.fill();
    g.fillStyle = lin(g, 0, -70, 0, 70, [[0, '#FFFBEF'], [1, '#EBD8AE']]); ell(g, 0, 10, 358, 90); g.fill();
    g.fillStyle = lin(g, 0, -60, 0, 60, [[0, '#F8EBC9'], [1, '#FFF8E6']]); ell(g, 0, 14, 290, 66); g.fill();
    g.strokeStyle = 'rgba(15,79,85,0.55)'; g.lineWidth = 6; ell(g, 0, 10, 326, 80); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 10, 345, 84, 0, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
    g.restore();
  };

  function leafShape(g, x, y, len, w, rot, c1, c2) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = lin(g, 0, 0, 0, -len, [[0, c1], [1, c2]]);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(w, -len * 0.5, 0, -len); g.quadraticCurveTo(-w, -len * 0.5, 0, 0); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -2); g.lineTo(0, -len * 0.85); g.stroke();
    g.restore();
  }

  A.taco = function (g, x, y, sc, rot, seed) {
    const r = sr(seed || 3);
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(sc, sc);
    // shadow
    g.fillStyle = 'rgba(60,25,5,0.30)'; ell(g, 6, 8, 170, 22); g.fill();
    // back shell
    g.fillStyle = lin(g, 0, -190, 0, 0, [[0, '#D69A33'], [1, '#B97A22']]);
    g.beginPath(); g.moveTo(-158, 0); g.bezierCurveTo(-176, -215, 176, -215, 158, 0); g.quadraticCurveTo(0, 18, -158, 0); g.fill();
    // fillings
    g.save();
    g.beginPath(); g.moveTo(-150, 0); g.bezierCurveTo(-168, -205, 168, -205, 150, 0); g.closePath(); g.clip();
    // meat
    for (let i = 0; i < 26; i++) {
      const px = -118 + r() * 236, py = -130 + r() * 64;
      g.fillStyle = lin(g, px, py - 10, px, py + 10, [[0, i % 3 ? '#A5532B' : '#C26B35'], [1, '#6E331A']]);
      g.save(); g.translate(px, py); g.rotate(r() * 3); ell(g, 0, 0, 15 + r() * 14, 8 + r() * 6); g.fill(); g.restore();
    }
    g.restore();
    // lettuce ruffle at the top
    for (let i = 0; i < 9; i++) {
      const px = -128 + i * 32, py = -150 + Math.abs(i - 4) * 5 + (i % 2) * 4;
      leafShape(g, px, py + 36, 62 + r() * 18, 22, -0.8 + i * 0.2 + (r() - 0.5) * 0.2, '#6FA52A', '#C6E25A');
    }
    // cilantro, onion, tomato, cheese
    for (let i = 0; i < 12; i++) { const px = -100 + r() * 200, py = -150 + r() * 36 + Math.abs(px) * 0.16; leafShape(g, px, py, 24 + r() * 10, 9, r() * 6, '#1F6B33', '#52A046'); }
    for (let i = 0; i < 14; i++) { g.fillStyle = '#E0393B'; const px = -96 + r() * 192, py = -146 + r() * 40 + Math.abs(px) * 0.18; g.save(); g.translate(px, py); g.rotate(r()); g.fillRect(-7, -7, 14, 12); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(-5, -5, 5, 3); g.restore(); }
    for (let i = 0; i < 16; i++) { g.fillStyle = i % 3 ? '#FFF8EA' : '#F2D7E4'; const px = -100 + r() * 200, py = -140 + r() * 40 + Math.abs(px) * 0.17; ell(g, px, py, 6, 4, r() * 3); g.fill(); }
    for (let i = 0; i < 12; i++) { g.fillStyle = '#FFE08A'; const px = -90 + r() * 180, py = -136 + r() * 34 + Math.abs(px) * 0.15; ell(g, px, py, 5, 3, r() * 3); g.fill(); }
    // front shell
    g.fillStyle = lin(g, -150, -40, 150, 20, [[0, '#F0C25E'], [0.5, '#E6AE42'], [1, '#D2922B']]);
    g.beginPath(); g.moveTo(-150, 6); g.bezierCurveTo(-148, -118, 148, -118, 150, 6); g.quadraticCurveTo(0, 26, -150, 6); g.fill();
    g.strokeStyle = 'rgba(255,240,190,0.65)'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-140, -6); g.bezierCurveTo(-138, -104, 138, -104, 140, -6); g.stroke();
    // toasted spots
    for (let i = 0; i < 26; i++) { const px = -118 + r() * 236, py = -80 + r() * 80; if (py < -60 + Math.abs(px) * 0.4 && Math.abs(px) < 110) continue; g.fillStyle = 'rgba(140,80,20,0.35)'; ell(g, px, py, 3 + r() * 6, 2 + r() * 3, r() * 3); g.fill(); }
    g.strokeStyle = 'rgba(150,90,25,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-148, 6); g.quadraticCurveTo(0, 28, 148, 6); g.stroke();
    g.restore();
  };

  A.lime = function (g, x, y, sc, rot) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(sc, sc);
    g.fillStyle = 'rgba(60,25,5,0.3)'; ell(g, 4, 12, 56, 12); g.fill();
    g.fillStyle = '#4F8F27'; g.beginPath(); g.moveTo(-54, 0); g.bezierCurveTo(-54, -60, 54, -60, 54, 0); g.quadraticCurveTo(0, 16, -54, 0); g.fill();
    g.fillStyle = '#E6F4A4'; g.beginPath(); g.moveTo(-44, -2); g.bezierCurveTo(-44, -48, 44, -48, 44, -2); g.quadraticCurveTo(0, 10, -44, -2); g.fill();
    g.strokeStyle = 'rgba(170,200,70,0.8)'; g.lineWidth = 2.5;
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 4, 4); g.lineTo(i * 14, -34 + Math.abs(i) * 8); g.stroke(); }
    g.restore();
  };

  A.sandwich = function (g, x, y, sc, rot, seed) {
    const r = sr(seed || 9);
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.scale(sc, sc);
    g.fillStyle = 'rgba(60,25,5,0.30)'; ell(g, 4, 10, 190, 24); g.fill();
    // bottom slice
    g.fillStyle = lin(g, 0, -42, 0, 0, [[0, '#F0CA84'], [1, '#D9A24C']]); rr(g, -170, -44, 340, 46, 20); g.fill();
    g.strokeStyle = '#B9791F'; g.lineWidth = 6; rr(g, -170, -44, 340, 46, 20); g.stroke();
    // lettuce (wavy)
    g.fillStyle = lin(g, 0, -100, 0, -44, [[0, '#B9DE4D'], [1, '#6AA32C']]);
    g.beginPath(); g.moveTo(-182, -44);
    for (let i = 0; i <= 12; i++) g.quadraticCurveTo(-182 + i * 30.3 - 15, -44 - 30 - (i % 2) * 14, -182 + i * 30.3, -50 - (i % 2) * 6);
    g.lineTo(182, -44); g.closePath(); g.fill();
    // ham
    g.fillStyle = lin(g, 0, -108, 0, -78, [[0, '#F4A3A0'], [1, '#D9726F']]);
    g.beginPath(); g.moveTo(-176, -64); for (let i = 0; i <= 10; i++) g.quadraticCurveTo(-176 + i * 35.2 - 17, -74 - (i % 2) * 18, -176 + i * 35.2, -72);
    g.lineTo(176, -64); g.quadraticCurveTo(0, -48, -176, -64); g.fill();
    // cheese (slice with drooping corner)
    g.fillStyle = lin(g, 0, -92, 0, -62, [[0, '#FFD54A'], [1, '#EDAF1F']]);
    g.beginPath(); g.moveTo(-178, -78); g.lineTo(178, -78); g.lineTo(178, -66); g.lineTo(120, -66); g.lineTo(104, -42); g.lineTo(88, -66); g.lineTo(-178, -66); g.closePath(); g.fill();
    // tomato slices
    [-110, -20, 70, 140].forEach((px, i) => {
      g.fillStyle = lin(g, 0, -122, 0, -88, [[0, '#F0553F'], [1, '#C93625']]); rr(g, px - 34, -112 + (i % 2) * 4, 68, 24, 12); g.fill();
      g.fillStyle = 'rgba(255,200,170,0.5)'; rr(g, px - 24, -108 + (i % 2) * 4, 48, 6, 3); g.fill();
    });
    // top slice
    g.fillStyle = lin(g, 0, -200, 0, -112, [[0, '#F4D08C'], [1, '#D9A24C']]);
    g.beginPath(); g.moveTo(-170, -108); g.bezierCurveTo(-190, -190, -110, -214, 0, -212); g.bezierCurveTo(110, -214, 190, -190, 170, -108); g.quadraticCurveTo(0, -92, -170, -108); g.fill();
    g.strokeStyle = '#B9791F'; g.lineWidth = 6; g.stroke();
    g.strokeStyle = 'rgba(255,240,200,0.6)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-136, -156); g.quadraticCurveTo(-90, -190, -20, -194); g.stroke();
    for (let i = 0; i < 28; i++) { g.fillStyle = 'rgba(255,248,225,0.9)'; const px = -120 + r() * 240, py = -196 + r() * 60; if (py > -126 - Math.abs(px) * 0.1) continue; g.save(); g.translate(px, py); g.rotate(r() * 3); ell(g, 0, 0, 4.5, 2.4); g.fill(); g.restore(); }
    // toothpick + flag
    g.strokeStyle = '#E7C58A'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, -205); g.lineTo(52, -280); g.stroke();
    g.fillStyle = C.teal; g.beginPath(); g.moveTo(52, -280); g.lineTo(100, -268); g.lineTo(54, -250); g.closePath(); g.fill();
    g.fillStyle = C.lime; ell(g, 66, -266, 5, 5); g.fill();
    g.restore();
  };

  A.lemonade = function (g, x, y, sc, t, o) {
    o = o || {};
    const r = sr(14);
    g.save(); g.translate(x, y); g.scale(sc, sc);
    // coaster + shadow
    g.fillStyle = 'rgba(50,20,5,0.35)'; ell(g, 14, 12, 190, 36); g.fill();
    g.fillStyle = lin(g, 0, -20, 0, 20, [[0, '#14707A'], [1, '#0A4349']]); ell(g, 0, 6, 170, 38); g.fill();
    g.fillStyle = '#FFF3DA'; ell(g, 0, 2, 158, 33); g.fill();
    // glass path
    const gl = () => { g.beginPath(); g.moveTo(-135, -480); g.lineTo(135, -480); g.lineTo(104, -14); g.quadraticCurveTo(0, 14, -104, -14); g.closePath(); };
    // back rim
    g.fillStyle = 'rgba(255,255,255,0.18)'; ell(g, 0, -480, 135, 22); g.fill();
    // lemon slice (behind glass lip, perched on the rim, right)
    const slice = () => {
      g.save(); g.translate(112, -462); g.rotate(-0.4);
      g.fillStyle = '#F7D93B'; ell(g, 0, 0, 82, 82); g.fill();
      g.fillStyle = '#FFF6C9'; ell(g, 0, 0, 72, 72); g.fill();
      g.fillStyle = '#FBE56B'; ell(g, 0, 0, 64, 64); g.fill();
      for (let i = 0; i < 9; i++) {
        g.save(); g.rotate(i * TAU / 9);
        g.fillStyle = i % 2 ? '#FFEE8C' : '#FFE35A'; g.beginPath(); g.moveTo(5, -4); g.lineTo(58, -14); g.quadraticCurveTo(64, 0, 58, 14); g.lineTo(5, 4); g.closePath(); g.fill();
        g.restore();
      }
      g.fillStyle = '#FFF6C9'; ell(g, 0, 0, 7, 7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 76, 3.4, 4.6); g.stroke();
      g.restore();
    };
    // straw (behind)
    g.save(); g.strokeStyle = '#0F4F55'; g.lineWidth = 22; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-34, -90); g.lineTo(-62, -560); g.stroke();
    g.strokeStyle = '#FFF3DA'; g.lineWidth = 22; g.setLineDash([22, 22]); g.beginPath(); g.moveTo(-34, -90); g.lineTo(-62, -560); g.stroke(); g.setLineDash([]);
    g.restore();
    // liquid
    g.save(); gl(); g.clip();
    const lq = lin(g, 0, -430, 0, 0, [[0, '#FBEF7A'], [0.4, '#F6DB4A'], [1, '#E9B92B']]);
    g.fillStyle = lq; g.fillRect(-150, -430, 300, 440);
    g.fillStyle = rad(g, -60, -250, 5, 220, [[0, 'rgba(255,255,230,0.5)'], [1, 'rgba(255,255,230,0)']]); g.fillRect(-150, -430, 300, 440);
    // liquid surface
    g.fillStyle = 'rgba(255,250,200,0.75)'; ell(g, 0, -430, 128, 18); g.fill();
    g.fillStyle = 'rgba(247,219,74,0.9)'; ell(g, 0, -426, 118, 13); g.fill();
    // ice cubes
    const cubes = [[-62, -330, 74, 0.25], [48, -380, 70, -0.3], [8, -250, 76, 0.5], [-70, -170, 70, -0.2], [60, -140, 72, 0.4], [-8, -60, 66, 0.15]];
    cubes.forEach(([cx, cy, cs, cr], i) => {
      const bob = Math.sin(t * 1.2 + i * 1.7) * 3.5;
      g.save(); g.translate(cx, cy + bob); g.rotate(cr + Math.sin(t * 0.7 + i) * 0.03);
      g.fillStyle = 'rgba(235,252,255,0.50)'; rr(g, -cs / 2, -cs / 2, cs, cs, 14); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 3.5; rr(g, -cs / 2, -cs / 2, cs, cs, 14); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.55)'; rr(g, -cs / 2 + 8, -cs / 2 + 8, cs * 0.36, 10, 5); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-cs * 0.15, cs * 0.05); g.lineTo(cs * 0.2, cs * 0.28); g.stroke();
      g.restore();
    });
    // bubbles
    for (let i = 0; i < 14; i++) {
      const bx = -90 + r() * 180, sp = 22 + r() * 20, ph = r() * 400;
      const by = -((t * sp + ph) % 420) - 10, br = 3 + r() * 5;
      g.fillStyle = 'rgba(255,255,230,0.5)'; ell(g, bx + Math.sin(t * 2 + i) * 4, by, br, br); g.fill();
    }
    g.restore();
    // mint
    leafShape(g, -90, -472, 70, 24, -0.6, '#2F7F3A', '#78C25A'); leafShape(g, -70, -474, 64, 22, -0.1, '#2A7A38', '#6FB955');
    // glass body edges + highlights
    gl(); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 5; g.stroke();
    g.fillStyle = lin(g, -135, 0, 135, 0, [[0, 'rgba(255,255,255,0.28)'], [0.12, 'rgba(255,255,255,0)'], [0.85, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0.18)']]);
    gl(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)'; rr(g, -112, -440, 14, 330, 7); g.fill(); rr(g, -112, -92, 12, 30, 6); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.28)'; rr(g, 96, -440, 8, 200, 4); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, -480, 135, 22, 0, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(190,225,230,0.20)'; g.beginPath(); g.ellipse(0, -480, 135, 22, 0, 0, TAU); g.fill();
    // thick glass base
    g.fillStyle = 'rgba(200,235,240,0.35)'; g.beginPath(); g.moveTo(-104, -14); g.quadraticCurveTo(0, 14, 104, -14); g.lineTo(98, -40); g.quadraticCurveTo(0, -18, -98, -40); g.closePath(); g.fill();
    slice();
    // condensation: droplets with tiny highlights, a few with trails
    const dr = sr(31);
    for (let i = 0; i < 46; i++) {
      const yy = -440 + dr() * 400, f = (yy + 480) / 466, half = lerp(135, 104, f) - 14;
      const xx = (dr() * 2 - 1) * half, rd = 3 + dr() * 6.5;
      if (dr() > 0.8) { g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = rd * 0.5; g.beginPath(); g.moveTo(xx, yy - 30 - dr() * 24); g.lineTo(xx, yy); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,0.30)'; ell(g, xx, yy, rd * 0.85, rd); g.fill();
      g.strokeStyle = 'rgba(70,110,110,0.45)'; g.lineWidth = 1.3; ell(g, xx, yy, rd * 0.85, rd); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.95)'; ell(g, xx - rd * 0.25, yy - rd * 0.35, rd * 0.28, rd * 0.28); g.fill();
    }
    g.restore();
  };

  /* ---------- effects ---------- */
  A.sparkle = function (g, x, y, s, a, rot) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.globalAlpha *= a;
    g.fillStyle = '#FFF7D1';
    g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0); g.quadraticCurveTo(s * 0.12, s * 0.12, 0, s); g.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0); g.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s); g.fill();
    g.restore();
  };
  A.burst = function (g, x, y, p, seed, rmax) {
    // radial confetti burst, p 0..1
    const r = sr(seed || 5); const cols = [C.lime, C.terracottaLight, C.cream, '#FFE35A', C.tealLight];
    for (let i = 0; i < 34; i++) {
      const a = r() * TAU, d = (0.35 + r() * 0.65) * rmax * ease.out(p), sz = 5 + r() * 9;
      g.save(); g.globalAlpha = clamp(1 - p * 1.05, 0, 1);
      g.translate(x + Math.cos(a) * d, y + Math.sin(a) * d + p * p * 60); g.rotate(r() * 6 + p * 5);
      g.fillStyle = cols[i % cols.length]; if (i % 3) g.fillRect(-sz / 2, -sz / 4, sz, sz / 2); else { ell(g, 0, 0, sz / 2, sz / 2); g.fill(); }
      g.restore();
    }
  };

  /** Vector taco icon used in place of the emoji so every renderer shows it identically. */
  A.tacoIcon = function (g, x, y, s) {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#C48A2B'; g.beginPath(); g.moveTo(-34, 14); g.bezierCurveTo(-40, -44, 40, -44, 34, 14); g.quadraticCurveTo(0, 22, -34, 14); g.fill();
    g.fillStyle = '#6FB23A'; for (let i = 0; i < 5; i++) { ell(g, -22 + i * 11, -22 + (i % 2) * 4, 8, 7); g.fill(); }
    g.fillStyle = '#E0393B'; ell(g, -8, -26, 5, 4); g.fill(); ell(g, 14, -24, 5, 4); g.fill();
    g.fillStyle = '#F4C45C'; g.beginPath(); g.moveTo(-32, 14); g.bezierCurveTo(-34, -26, 34, -26, 32, 14); g.quadraticCurveTo(0, 21, -32, 14); g.fill();
    g.strokeStyle = 'rgba(255,240,190,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-26, 10); g.bezierCurveTo(-26, -18, 26, -18, 26, 10); g.stroke();
    g.restore();
  };
})();
