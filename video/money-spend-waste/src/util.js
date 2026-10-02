// Deterministic helpers: every frame is a pure function of time t (seconds).
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = (t) => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
export const easeInOut = (t) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const seg = (t, a, b) => clamp((t - a) / (b - a));
// springy pop-in: 0 -> overshoot -> 1
export const pop = (t, a, d = 0.45) => {
  const u = clamp((t - a) / d);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - Math.exp(-7 * u) * Math.cos(11 * u);
};
export const rad = (d) => d * Math.PI / 180;
export const f = (n) => (Math.round(n * 100) / 100);
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const C = {
  navy: '#0B2347', navy2: '#12305E', navy3: '#1C4585', ivory: '#FBF4E4', ivory2: '#F1E6CC',
  emerald: '#0E9F6E', emeraldD: '#0A7A55', teal: '#12A5A5', tealD: '#0C7C80', coral: '#FF6B57', coralD: '#D94A38',
  gold: '#F6B73C', goldD: '#D18F12', ink: '#10213D',
  skin: '#E3A877', skinD: '#B9774B', skinL: '#F2C29A', hair: '#2B1C16', white: '#FFFFFF'
};

// Interpolate two poses (numbers lerp, other values switch at the midpoint)
export function lerpPose(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, t);
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) {
    const o = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o[k] = lerpPose(a[k] ?? b[k], b[k] ?? a[k], t);
    return o;
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => lerpPose(v, b[i], t));
  return t < 0.5 ? a : b;
}
// keyframes: [{t, ease?, ...pose}] sorted by t
export function poseAt(keys, t) {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const A = keys[i], B = keys[i + 1];
    if (t >= A.t && t <= B.t) return lerpPose(A, B, easeInOut((t - A.t) / (B.t - A.t)));
  }
  return keys[keys.length - 1];
}
