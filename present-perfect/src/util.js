/* util.js — math, easing, color and path helpers shared by every module */
'use strict';
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const E = {
  lin: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  io: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  soft: t => t * t * (3 - 2 * t),
  back: t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  anticip: t => { const c = 1.2; return t * t * ((c + 1) * t - c); },       // small pull-back before moving
  spring: t => 1 - Math.exp(-6.5 * t) * Math.cos(t * 9.5),                  // settle with follow-through
};

/* deterministic random: mulberry32 */
function rng(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---- color ---- */
const _cc = new Map();
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbHex(r, g, b) { return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function shade(h, amt) { // amt -1..1 : darken/lighten, with slight warm shift in shadows
  const k = h + '|' + amt; if (_cc.has(k)) return _cc.get(k);
  let [r, g, b] = hex2rgb(h), o;
  if (amt >= 0) o = rgbHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  else { const a = -amt; o = rgbHex(r * (1 - a) + 20 * a * 0.4, g * (1 - a * 1.04), b * (1 - a * 0.92) + 28 * a * 0.35); }
  _cc.set(k, o); return o;
}
function rgba(h, a) { const k = h + '@' + a; if (_cc.has(k)) return _cc.get(k); const [r, g, b] = hex2rgb(h); const o = `rgba(${r},${g},${b},${a})`; _cc.set(k, o); return o; }
function mix(h1, h2, t) { const a = hex2rgb(h1), b = hex2rgb(h2); return rgbHex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)); }

/* ---- gradients & shapes ---- */
function lg(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of stops) g.addColorStop(o, c); return g; }
function rg(ctx, x, y, r0, r1, stops, x1 = x, y1 = y) { const g = ctx.createRadialGradient(x, y, r0, x1, y1, r1); for (const [o, c] of stops) g.addColorStop(o, c); return g; }
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/* tapered limb segment with round ends, as a closed path */
function limb(ctx, x0, y0, x1, y1, w0, w1) {
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a);
  ctx.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  ctx.arc(x1, y1, w1 / 2, a + Math.PI / 2, a - Math.PI / 2, true);
  ctx.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  ctx.arc(x0, y0, w0 / 2, a - Math.PI / 2, a + Math.PI / 2, true);
  ctx.closePath();
}
/* Catmull-Rom closed spline through points -> bezier path */
function spline(ctx, pts, closed = true, tension = 0.5) {
  const n = pts.length; if (n < 3) return;
  const P = i => pts[(i + n) % n];
  ctx.moveTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = closed ? P(i - 1) : pts[Math.max(i - 1, 0)], p1 = P(i), p2 = closed ? P(i + 1) : pts[Math.min(i + 1, n - 1)], p3 = closed ? P(i + 2) : pts[Math.min(i + 2, n - 1)];
    const t = tension / 3 * 2;
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * t / 2 * 1, p1[1] + (p2[1] - p0[1]) * t / 2 * 1,
      p2[0] - (p3[0] - p1[0]) * t / 2, p2[1] - (p3[1] - p1[1]) * t / 2, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
function star(ctx, cx, cy, r1, r2, n = 5, rot = -Math.PI / 2) {
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.closePath();
}
/* soft drop shadow helper (cheap: one shadowBlur fill) */
function withShadow(ctx, color, blur, dx, dy, fn) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = dx; ctx.shadowOffsetY = dy; fn(); ctx.restore(); }

/* ---- keyframe tracks: pure functions of time, so scrubbing is exact ---- */
class Track {
  constructor(init) { this.segs = []; this.init = init; }
  add(t, to, dur = 0.5, ease = E.io) { this.segs.push({ t, dur, to, ease }); return this; }
  finalize() {
    this.segs.sort((a, b) => a.t - b.t);
    let prev = this.init;
    for (const s of this.segs) { s.from = prev; prev = s.to; }
  }
  at(t) {
    const S = this.segs; let lo = 0, hi = S.length - 1, k = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (S[m].t <= t) { k = m; lo = m + 1; } else hi = m - 1; }
    if (k < 0) return this.init;
    const s = S[k], u = (t - s.t) / s.dur;
    if (u >= 1) return s.to;
    const e = s.ease(clamp(u));
    return typeof s.to === 'number' ? s.from + (s.to - s.from) * e : (e < 0.5 ? s.from : s.to);
  }
}
