/* Shared helpers + environment drawing: background, table, cake with number candles, confetti. */
window.FE = window.FE || {};

(function (FE) {
  const C = FE.COLORS;
  const U = (FE.U = {
    W: 1080, H: 1920,
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    prog: (T, a, b) => Math.max(0, Math.min(1, (T - a) / (b - a))),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out3: (t) => 1 - Math.pow(1 - t, 3),
    outBack: (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    rr(ctx, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    },
    prng(seed) {
      let a = seed >>> 0;
      return function () {
        a = (a + 0x6d2b79f5) >>> 0; let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    // Filled tapered capsule between two circles.
    capsule(ctx, x0, y0, r0, x1, y1, r1) {
      const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
      const b = Math.acos(U.clamp((r0 - r1) / d, -1, 1));
      ctx.beginPath();
      ctx.moveTo(x0 + r0 * Math.cos(a + b), y0 + r0 * Math.sin(a + b));
      ctx.arc(x0, y0, r0, a + b, a + 2 * Math.PI - b, false);
      ctx.lineTo(x1 + r1 * Math.cos(a - b), y1 + r1 * Math.sin(a - b));
      ctx.arc(x1, y1, r1, a - b, a + b, false);
      ctx.closePath();
    },
  });
  const { clamp, lerp, rr } = U;

  // ---------- static background (cached) ----------
  let bgCache = null;
  function buildBackground() {
    const cv = document.createElement("canvas"); cv.width = U.W; cv.height = U.H;
    const g = cv.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, U.H);
    grad.addColorStop(0, "#0b5240"); grad.addColorStop(0.55, "#073a2d"); grad.addColorStop(1, "#04271e");
    g.fillStyle = grad; g.fillRect(0, 0, U.W, U.H);
    // soft spotlight behind the action
    const sp = g.createRadialGradient(540, 980, 40, 540, 980, 820);
    sp.addColorStop(0, "rgba(255,226,160,0.20)"); sp.addColorStop(0.55, "rgba(255,226,160,0.05)"); sp.addColorStop(1, "rgba(255,226,160,0)");
    g.fillStyle = sp; g.fillRect(0, 0, U.W, U.H);
    // art-deco diamond lattice (very subtle)
    g.strokeStyle = "rgba(233,209,154,0.055)"; g.lineWidth = 2;
    for (let i = -20; i < 40; i++) {
      g.beginPath(); g.moveTo(i * 100, 0); g.lineTo(i * 100 + 1400, 1400); g.stroke();
      g.beginPath(); g.moveTo(i * 100 + 1400, 0); g.lineTo(i * 100, 1400); g.stroke();
    }
    // fans in the top corners
    g.strokeStyle = "rgba(233,209,154,0.16)"; g.lineWidth = 3;
    [[0, 0, 1], [U.W, 0, -1]].forEach(([cx, cy]) => {
      for (let r = 90; r <= 450; r += 45) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI / 2); g.stroke(); }
    });
    // bokeh
    const r = U.prng(77);
    for (let i = 0; i < 22; i++) {
      const x = r() * U.W, y = 250 + r() * 1150, rad = 18 + r() * 52;
      const bg = g.createRadialGradient(x, y, 0, x, y, rad);
      bg.addColorStop(0, "rgba(255,230,170,0.16)"); bg.addColorStop(1, "rgba(255,230,170,0)");
      g.fillStyle = bg; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    }
    // string lights across the top
    g.strokeStyle = "rgba(233,209,154,0.5)"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-20, 130); g.quadraticCurveTo(540, 250, 1100, 130); g.stroke();
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, x = -20 + t * 1120;
      const y = (1 - t) * (1 - t) * 130 + 2 * (1 - t) * t * 250 + t * t * 130 + 8;
      const gl = g.createRadialGradient(x, y + 10, 0, x, y + 10, 38);
      gl.addColorStop(0, "rgba(255,226,150,0.55)"); gl.addColorStop(1, "rgba(255,226,150,0)");
      g.fillStyle = gl; g.beginPath(); g.arc(x, y + 10, 38, 0, 7); g.fill();
      g.fillStyle = "#ffe9b0"; g.beginPath(); g.ellipse(x, y + 12, 7, 10, 0, 0, 7); g.fill();
    }
    // vignette
    const vg = g.createRadialGradient(540, 960, 500, 540, 960, 1250);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.45)");
    g.fillStyle = vg; g.fillRect(0, 0, U.W, U.H);
    return cv;
  }
  FE.drawBackground = function (ctx) {
    if (!bgCache) bgCache = buildBackground();
    ctx.drawImage(bgCache, 0, 0);
  };

  // ---------- table (front of everything except cake) ----------
  const TABLE_Y = 1450;
  FE.TABLE_Y = TABLE_Y;
  let tableCache = null;
  function buildTable() {
    const cv = document.createElement("canvas"); cv.width = U.W; cv.height = U.H - TABLE_Y + 40;
    const g = cv.getContext("2d");
    g.translate(0, -TABLE_Y + 20);
    // top surface
    const tg = g.createLinearGradient(0, TABLE_Y - 20, 0, TABLE_Y + 8);
    tg.addColorStop(0, "#fff5dd"); tg.addColorStop(1, "#d9c49a");
    g.fillStyle = tg; g.fillRect(0, TABLE_Y - 18, U.W, 26);
    // gold edge
    const ge = g.createLinearGradient(0, 0, U.W, 0);
    ge.addColorStop(0, "#b88f3c"); ge.addColorStop(0.3, "#f6e3ae"); ge.addColorStop(0.6, "#c9a14d"); ge.addColorStop(1, "#f1dca2");
    g.fillStyle = ge; g.fillRect(0, TABLE_Y + 6, U.W, 12);
    // raspberry velvet drape with pleats
    const cg = g.createLinearGradient(0, TABLE_Y + 18, 0, U.H);
    cg.addColorStop(0, "#8c1244"); cg.addColorStop(1, "#4a0725");
    g.fillStyle = cg; g.fillRect(0, TABLE_Y + 18, U.W, U.H);
    for (let i = 0; i < 12; i++) {
      const x = i * 100 - 20;
      const pg = g.createLinearGradient(x, 0, x + 100, 0);
      pg.addColorStop(0, "rgba(255,255,255,0)"); pg.addColorStop(0.35, "rgba(255,160,190,0.13)");
      pg.addColorStop(0.7, "rgba(0,0,0,0.20)"); pg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = pg; g.fillRect(x, TABLE_Y + 18, 100, U.H);
    }
    // scalloped gold trim
    g.strokeStyle = "#e5c677"; g.lineWidth = 4;
    for (let x = 0; x < U.W + 60; x += 60) { g.beginPath(); g.arc(x + 30, TABLE_Y + 22, 30, 0, Math.PI); g.stroke(); }
    // shadow cast on cloth top
    const sh = g.createLinearGradient(0, TABLE_Y + 18, 0, TABLE_Y + 80);
    sh.addColorStop(0, "rgba(0,0,0,0.35)"); sh.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = sh; g.fillRect(0, TABLE_Y + 18, U.W, 62);
    return cv;
  }
  FE.drawTable = function (ctx) {
    if (!tableCache) tableCache = buildTable();
    ctx.drawImage(tableCache, 0, TABLE_Y - 20);
  };

  // ---------- number candle ----------
  // "3" drawn as one thick round-capped stroke so it reads clearly as a numeral candle.
  function threePath(g) {
    g.beginPath();
    g.moveTo(-44, -66);
    g.bezierCurveTo(-44, -94, -22, -104, 6, -104);
    g.bezierCurveTo(36, -104, 54, -86, 54, -62);
    g.bezierCurveTo(54, -38, 34, -22, 4, -20);
    g.bezierCurveTo(38, -20, 62, -2, 62, 34);
    g.bezierCurveTo(62, 72, 36, 96, 2, 96);
    g.bezierCurveTo(-26, 96, -48, 82, -54, 58);
  }
  function stripeGradient(g, c1, c2) {
    const gr = g.createLinearGradient(-70, -120, 70, 110);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = i / n, b = (i + 1) / n, col = i % 2 ? c2 : c1;
      gr.addColorStop(a + 0.0001, col); gr.addColorStop(b - 0.0001, col);
    }
    return gr;
  }
  function drawFlame(g, x, y, W, ph) {
    const fl = 1 + 0.09 * Math.sin(W * 9 + ph) + 0.05 * Math.sin(W * 17 + ph * 2);
    const sway = 3 * Math.sin(W * 5 + ph);
    g.save(); g.translate(x, y);
    // glow
    g.globalCompositeOperation = "lighter";
    const gl = g.createRadialGradient(0, -22, 0, 0, -22, 120);
    gl.addColorStop(0, "rgba(255,190,90,0.38)"); gl.addColorStop(1, "rgba(255,190,90,0)");
    g.fillStyle = gl; g.beginPath(); g.arc(0, -22, 120, 0, 7); g.fill();
    g.globalCompositeOperation = "source-over";
    g.scale(1, fl);
    const body = (s, c0, c1) => {
      const f = g.createLinearGradient(0, 8, 0, -50 * s);
      f.addColorStop(0, c0); f.addColorStop(1, c1);
      g.fillStyle = f; g.beginPath();
      g.moveTo(0, 8);
      g.bezierCurveTo(-15 * s, 4, -13 * s, -22 * s, sway * 0.5, -50 * s);
      g.bezierCurveTo(13 * s + sway * 0.4, -22 * s, 15 * s, 4, 0, 8);
      g.fill();
    };
    body(1, "#ff8a1f", "#ffd45a");
    body(0.55, "#fff6c2", "#fffbe8");
    g.restore();
  }
  // x = centre of the digit, yBase = cake surface y where the spike enters.
  FE.drawNumberCandle = function (ctx, x, yBase, W, ph, c1, c2, edge) {
    ctx.save();
    ctx.translate(x, yBase - 102 - 24);
    // spike
    ctx.fillStyle = "#c9b98c"; rr(ctx, -4, 112, 8, 26, 3); ctx.fill();
    // soft shadow on the frosting
    ctx.fillStyle = "rgba(60,10,25,0.22)"; ctx.beginPath(); ctx.ellipse(6, 142, 38, 9, 0, 0, 7); ctx.fill();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    threePath(ctx); ctx.strokeStyle = edge; ctx.lineWidth = 49; ctx.save(); ctx.translate(3, 5); ctx.stroke(); ctx.restore();
    threePath(ctx); ctx.strokeStyle = stripeGradient(ctx, c1, c2); ctx.lineWidth = 40; ctx.stroke();
    // rounded highlight
    ctx.save(); ctx.translate(-6, -6); threePath(ctx);
    ctx.strokeStyle = "rgba(255,255,255,0.42)"; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    // wick + flame at the numeral's upper tip
    ctx.strokeStyle = "#3a2a22"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-44, -90); ctx.lineTo(-42, -108); ctx.stroke();
    drawFlame(ctx, -42, -106, W, ph);
    ctx.restore();
  };

  // ---------- cake ----------
  function band(g, cx, yTop, rx, ry, h, c0, c1, c2) {
    const sg = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
    sg.addColorStop(0, c0); sg.addColorStop(0.35, c1); sg.addColorStop(1, c2);
    g.fillStyle = sg;
    g.beginPath(); g.moveTo(cx - rx, yTop); g.lineTo(cx - rx, yTop + h);
    g.ellipse(cx, yTop + h, rx, ry, 0, Math.PI, 0, true);
    g.lineTo(cx + rx, yTop); g.ellipse(cx, yTop, rx, ry, 0, 0, Math.PI, false); g.closePath(); g.fill();
  }
  let cakeCache = null;
  function buildCake() {
    const cv = document.createElement("canvas"); cv.width = 560; cv.height = 520;
    const g = cv.getContext("2d");
    const cx = 280, base = 500; // base = table y in cache
    // stand foot + stem + plate
    g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.ellipse(cx, base - 2, 150, 15, 0, 0, 7); g.fill();
    band(g, cx, base - 26, 112, 14, 20, "#a98030", "#f3dc9b", "#8f6a22");
    g.fillStyle = "#d8b765"; g.fillRect(cx - 20, base - 70, 40, 48);
    // plate
    band(g, cx, base - 88, 232, 32, 16, "#a98030", "#f3dc9b", "#8f6a22");
    let pg = g.createLinearGradient(0, base - 122, 0, base - 60);
    pg.addColorStop(0, "#fff8e6"); pg.addColorStop(1, "#e3d2a8");
    g.fillStyle = pg; g.beginPath(); g.ellipse(cx, base - 88, 232, 32, 0, 0, 7); g.fill();
    g.strokeStyle = "#d8b765"; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, base - 88, 214, 26, 0, 0, 7); g.stroke();
    // tier 1 (cream) y: base-88 … base-188
    const t1 = base - 188;
    band(g, cx, t1, 200, 38, 100, "#e6d2a8", "#fff4da", "#d2bd90");
    // gold band + pearls
    g.fillStyle = "#e0c273";
    g.beginPath(); g.moveTo(cx - 200, t1 + 70); g.ellipse(cx, t1 + 70, 200, 38, 0, Math.PI, 0, true); g.lineTo(cx + 200, t1 + 84); g.ellipse(cx, t1 + 84, 200, 38, 0, 0, Math.PI, false); g.closePath(); g.fill();
    for (let i = 0; i <= 18; i++) {
      const a = Math.PI * (i / 18), x = cx - Math.cos(a) * 200, y = t1 + 100 + Math.sin(a) * 38 - 4;
      g.fillStyle = "#fffaf0"; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill();
      g.fillStyle = "rgba(0,0,0,0.12)"; g.beginPath(); g.arc(x + 2, y + 3, 5, 0, 7); g.fill();
    }
    // tier 1 top surface
    g.fillStyle = "#fff3d6"; g.beginPath(); g.ellipse(cx, t1, 200, 38, 0, 0, 7); g.fill();
    // tier 2 (raspberry) y: t1-4 … t1-92
    const t2 = t1 - 92;
    band(g, cx, t2, 142, 27, 92, "#9b1048", "#d72c6a", "#7a0c38");
    // specular strip
    g.fillStyle = "rgba(255,255,255,0.14)"; g.fillRect(cx - 70, t2 + 6, 10, 82);
    // cream drips on tier 2 rim
    g.fillStyle = "#fff3d6";
    for (let i = 0; i < 12; i++) {
      const a = Math.PI * ((i + 0.5) / 12), x = cx - Math.cos(a) * 142, y = t2 + Math.sin(a) * 27;
      const len = 14 + ((i * 37) % 22);
      U.rr(g, x - 8, y - 2, 16, len, 8); g.fill();
    }
    g.fillStyle = "#fff3d6"; g.beginPath(); g.ellipse(cx, t2, 142, 27, 0, 0, 7); g.fill();
    // rosettes round the rim
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI * (i / 14), x = cx - Math.cos(a) * 128, y = t2 + Math.sin(a) * 22 + 2;
      const rg = g.createRadialGradient(x - 3, y - 4, 1, x, y, 11);
      rg.addColorStop(0, "#ffffff"); rg.addColorStop(1, "#e8d3a6");
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill();
    }
    // raspberries + mint
    const rasp = (x, y, s) => {
      g.fillStyle = "#157a4f"; g.beginPath(); g.ellipse(x + 12 * s, y - 14 * s, 14 * s, 6 * s, -0.5, 0, 7); g.fill();
      const rg = g.createRadialGradient(x - 4 * s, y - 5 * s, 1, x, y, 15 * s);
      rg.addColorStop(0, "#ff7aa6"); rg.addColorStop(1, "#b0123f");
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, 14 * s, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,0.35)";
      for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + Math.cos(k * 1.1) * 7 * s, y + Math.sin(k * 1.1) * 7 * s, 2.2 * s, 0, 7); g.fill(); }
    };
    rasp(cx - 108, t2 + 6, 1); rasp(cx + 112, t2 + 4, 1.05); rasp(cx + 84, t2 + 18, 0.85);
    g.fillStyle = "#1f8f5f"; [[-88, 14], [96, 20]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(cx + dx, t2 + dy, 16, 6, dx < 0 ? -0.3 : 0.3, 0, 7); g.fill(); });
    // gold leaf flecks
    g.fillStyle = "#f1d58c";
    [[-60, 36], [70, 40], [-140, 60], [150, 64], [30, 70]].forEach(([dx, dy]) => g.fillRect(cx + dx, t1 + dy, 6, 4));
    cv._top = t2; // y of tier-2 top surface (in cache coords)
    return cv;
  }
  // Cake sits centred at cx on the table. Returns the y of the candle-base surface.
  FE.drawCake = function (ctx, cx, W, lit) {
    if (!cakeCache) cakeCache = buildCake();
    const SC = 0.88;
    ctx.save(); ctx.translate(cx, TABLE_Y); ctx.scale(SC, SC); ctx.translate(-cx, -TABLE_Y);
    const ox = cx - 280, oy = TABLE_Y - 500 + 6;
    ctx.drawImage(cakeCache, ox, oy);
    const surf = oy + cakeCache._top;
    if (lit !== false) {
      // warm candlelight on frosting
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const lg = ctx.createRadialGradient(cx, surf - 20, 10, cx, surf - 20, 260);
      lg.addColorStop(0, "rgba(255,190,100,0.16)"); lg.addColorStop(1, "rgba(255,190,100,0)");
      ctx.fillStyle = lg; ctx.fillRect(cx - 260, surf - 280, 520, 520); ctx.restore();
    }
    FE.drawNumberCandle(ctx, cx - 70, surf + 4, W, 0.0, "#f4dc9a", "#fff6df", "#a77f2d");
    FE.drawNumberCandle(ctx, cx + 70, surf + 4, W, 1.7, "#cc2a69", "#ffeef3", "#7d0f3a");
    ctx.restore();
    return surf;
  };

  // ---------- confetti (analytic → deterministic, scrub-friendly) ----------
  const COLS = ["#e9d19a", "#fbe9b8", "#c2185b", "#ec5c8c", "#fcf3df", "#2a9a76", "#b88f3c"];
  function makeBurst(seed, n, x, y, spread, power) {
    const r = U.prng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (r() - 0.5) * spread, sp = power * (0.55 + r() * 0.6);
      out.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, k: 1.6 + r() * 0.8, g: 900 + r() * 300,
        w: 10 + r() * 12, h: 6 + r() * 8, col: COLS[(r() * COLS.length) | 0], rot: r() * 6.28, spin: (r() - 0.5) * 12,
        flip: 3 + r() * 6, shape: r() < 0.22 ? 1 : 0, life: 2.1 + r() * 0.5,
      });
    }
    return out;
  }
  const BURSTS = {
    main: [{ at: 5.35, parts: makeBurst(11, 44, 190, 800, 1.4, 1250).concat(makeBurst(12, 44, 890, 800, 1.4, 1250)) }],
    end: [{ at: 28.0, parts: makeBurst(21, 26, 160, 860, 1.2, 1000).concat(makeBurst(22, 26, 920, 860, 1.2, 1000)) }],
  };
  FE.drawConfetti = function (ctx, T) {
    ["main", "end"].forEach((k) => BURSTS[k].forEach((b) => {
      const t = T - b.at; if (t < 0) return;
      b.parts.forEach((p) => {
        if (t > p.life) return;
        const e = (1 - Math.exp(-p.k * t)) / p.k;
        const x = p.x + p.vx * e, y = p.y + (p.vy + p.g / p.k) * e - (p.g * t) / p.k;
        const a = t > p.life - 0.6 ? (p.life - t) / 0.6 : 1;
        ctx.save(); ctx.globalAlpha = a * Math.min(1, t * 14); ctx.translate(x, y); ctx.rotate(p.rot + p.spin * t);
        ctx.scale(1, Math.cos(p.flip * t)); ctx.fillStyle = p.col;
        if (p.shape) { ctx.beginPath(); ctx.arc(0, 0, p.h * 0.55, 0, 7); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
    }));
  };
})(window.FE);
