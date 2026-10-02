/* ===== core: virtual clock, helpers, persisted settings ===== */
const CANCEL = Symbol('cancel');
const Clock = {
  offset: 0, pausedAt: null, timers: [],
  now() { return (this.pausedAt ?? performance.now()) - this.offset; },
  pause() { if (this.pausedAt == null) this.pausedAt = performance.now(); },
  resume() { if (this.pausedAt != null) { this.offset += performance.now() - this.pausedAt; this.pausedAt = null; } },
  get paused() { return this.pausedAt != null; },
  reset() { this.offset = performance.now(); this.pausedAt = null; },
  sleep(ms) { return new Promise((res, rej) => this.timers.push({ due: this.now() + ms, res, rej })); },
  tick() {
    const n = this.now();
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const t = this.timers[i];
      if (t.due <= n) { this.timers.splice(i, 1); t.res(); }
    }
  },
  cancelAll() { const ts = this.timers; this.timers = []; ts.forEach(t => t.rej(CANCEL)); }
};
setInterval(() => Clock.tick(), 12);

const store = {
  get(k, d) { try { const v = localStorage.getItem('fe.' + k); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fe.' + k, v); } catch (e) { } }
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => t === 0 || t === 1 ? t : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
  sine: t => .5 - Math.cos(Math.PI * t) / 2
};
const PAL = {
  navy: '#0B1E3F', navy2: '#13305F', navyDeep: '#071229', tang: '#FF8A2B', tangDeep: '#E5671A', tangLight: '#FFB46B',
  mint: '#5FD6B0', mintDeep: '#2FA886', mintLight: '#B5F0DC', ivory: '#FFF6E5', ivoryShade: '#EBDDC2',
  skin: '#E8B48C', skinShade: '#C98E67', skinLight: '#F5CBA7', hair: '#2A1A12', wood: '#8A5A3B', woodDark: '#5E3A24', woodLight: '#B07A52'
};
