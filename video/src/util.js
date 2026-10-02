(function () {
  const FE = (window.FE = window.FE || {});
  const U = (FE.U = {});

  U.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.map = (t, a, b) => U.clamp((t - a) / (b - a));
  U.mix2 = (p, q, t) => [U.lerp(p[0], q[0], t), U.lerp(p[1], q[1], t)];
  U.ease = {
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    sine: (t) => 0.5 - 0.5 * Math.cos(Math.PI * t),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  /* Smooth keyframe sampler: keys = [[t, value|array], ...] with sine easing between. */
  U.keys = (keys, t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const a = keys[i - 1], b = keys[i];
        const k = U.ease.sine((t - a[0]) / (b[0] - a[0]));
        if (Array.isArray(a[1])) return a[1].map((v, j) => U.lerp(v, b[1][j], k));
        return U.lerp(a[1], b[1], k);
      }
    }
    return keys[keys.length - 1][1];
  };
  U.rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  U.rr = (c, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  /* Tapered capsule between two points (path only). */
  U.capsule = (c, x1, y1, x2, y2, r1, r2) => {
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1e-6;
    const a = Math.atan2(dy, dx), s = Math.asin(U.clamp((r1 - r2) / d, -1, 1));
    c.beginPath();
    c.arc(x1, y1, r1, a + Math.PI / 2 + s, a - Math.PI / 2 - s);
    c.arc(x2, y2, r2, a - Math.PI / 2 - s, a + Math.PI / 2 + s);
    c.closePath();
  };
  U.fillStroke = (c, fill, stroke, lw) => {
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.lineWidth = lw || 3; c.strokeStyle = stroke; c.lineJoin = 'round'; c.stroke(); }
  };
  U.grad = (c, x0, y0, x1, y1, stops) => {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    return g;
  };
  U.shadow = (c, col, blur, ox = 0, oy = 0) => { c.shadowColor = col; c.shadowBlur = blur; c.shadowOffsetX = ox; c.shadowOffsetY = oy; };
  U.noShadow = (c) => { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0; c.shadowOffsetY = 0; };

  /* Word layout: returns lines of {text,x,w} centred on cx, wrapping at maxW. */
  U.layoutWords = (c, words, font, maxW, gap) => {
    c.font = font;
    const sp = gap != null ? gap : c.measureText(' ').width;
    const items = words.map((w) => ({ w, width: c.measureText(w).width }));
    const lines = []; let cur = [], curW = 0;
    items.forEach((it) => {
      const add = (cur.length ? sp : 0) + it.width;
      if (cur.length && curW + add > maxW) { lines.push({ items: cur, width: curW }); cur = []; curW = 0; }
      curW += (cur.length ? sp : 0) + it.width; cur.push(it);
    });
    if (cur.length) lines.push({ items: cur, width: curW });
    lines.forEach((ln) => { let x = -ln.width / 2; ln.items.forEach((it) => { it.x = x; x += it.width + sp; }); });
    return lines;
  };
})();
