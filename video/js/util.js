// Shared helpers + brand palette
export const W = 1080, H = 1920, FPS = 30, DURATION = 30;
export const C = {
  navy: '#0F2C52', navyD: '#0A1F3C', navyL: '#1E4478', ivory: '#FBF5E6', ivoryD: '#EFE4CC',
  teal: '#1FA3A0', tealD: '#14807E', tealL: '#7FD1CB', coral: '#F26B5B', coralD: '#D9503F', gold: '#F2B84B', goldD: '#D9961F',
  skin: '#D9A271', skinD: '#B97F52', skinL: '#EBB98A', skinO: '#7A4B2E', hair: '#2A211E', hairL: '#4A3A34',
};
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOutBack = (t) => { t = clamp(t); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
// progress of t within [a,b]
export const seg = (t, a, b) => clamp((t - a) / (b - a));
// keyframed interpolation: keys = [[t, v], ...], v number or object of numbers (smoothstep between keys)
export function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1], [t1, b] = keys[i]; const u = smooth((t - t0) / (t1 - t0));
      if (typeof a === 'number') return lerp(a, b, u);
      const o = {}; for (const k in a) o[k] = typeof a[k] === 'number' ? lerp(a[k], b[k], u) : (u < .5 ? a[k] : b[k]); return o;
    }
  }
  return keys[keys.length - 1][1];
}
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
export function capsule(ctx, a, b, r0, r1, fill, outline, ow = 5) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx);
  const s = Math.asin(clamp((r0 - r1) / d, -1, 1));
  const path = () => {
    ctx.beginPath();
    ctx.arc(a.x, a.y, r0, ang + Math.PI / 2 + s, ang - Math.PI / 2 - s);
    ctx.arc(b.x, b.y, r1, ang - Math.PI / 2 - s, ang + Math.PI / 2 + s);
    ctx.closePath();
  };
  if (outline) { path(); ctx.lineWidth = ow * 2; ctx.lineJoin = 'round'; ctx.strokeStyle = outline; ctx.stroke(); }
  path(); ctx.fillStyle = fill; ctx.fill();
}
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
