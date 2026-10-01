/* Fluent English — "May, Might, and Could" interactive lesson
   00-util: helpers, easing, seeded RNG, tween engine */
(function () {
  'use strict';
  const FE = (window.FE = window.FE || {});
  FE.NS = 'http://www.w3.org/2000/svg';
  FE.$ = (s, r = document) => r.querySelector(s);
  FE.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  FE.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  FE.lerp = (a, b, t) => a + (b - a) * t;
  FE.fmt = (sec) => {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  };

  /* SVG element factory. html => innerHTML (parsed as SVG). */
  FE.el = (tag, attrs, html) => {
    const e = document.createElementNS(FE.NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  };
  /* HTML element factory. */
  FE.h = (tag, attrs, html) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (attrs[k] == null) continue;
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    return e;
  };

  /* seeded RNG (mulberry32) so organic shapes are stable between frames and runs */
  FE.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  FE.hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  /* easing */
  FE.ease = {
    linear: (t) => t,
    in: (t) => t * t * t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    soft: (t) => t * t * (3 - 2 * t),
    /* anticipation: pulls back slightly before moving */
    anticip: (t) => { const c = 1.2; return t * t * ((c + 1) * t - c); },
    /* overshoot: follow-through, settles */
    back: (t) => { const c1 = 1.35, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    spring: (t) => 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 2.2),
  };

  /* Tween engine. Targets are plain objects with numeric fields. */
  const Tween = (FE.Tween = {
    list: [],
    instant: false,
    to(obj, props, dur, ease, delay) {
      dur = dur == null ? 0.6 : dur; delay = delay || 0;
      const fn = typeof ease === 'function' ? ease : FE.ease[ease || 'inOut'] || FE.ease.inOut;
      if (Tween.instant || (dur <= 0 && delay <= 0)) { Object.assign(obj, props); return; }
      for (const k in props) {
        for (let i = Tween.list.length - 1; i >= 0; i--) {
          const w = Tween.list[i]; if (w.obj === obj && w.k === k) Tween.list.splice(i, 1);
        }
        Tween.list.push({ obj, k, from: null, to: props[k], t: -delay, dur: Math.max(dur, 0.0001), fn });
      }
    },
    /* returns true while tweens are still running */
    update(dt) {
      const L = Tween.list;
      for (let i = L.length - 1; i >= 0; i--) {
        const w = L[i]; w.t += dt;
        if (w.t < 0) continue;
        if (w.from === null) w.from = w.obj[w.k];
        const p = Math.min(1, w.t / w.dur);
        w.obj[w.k] = w.from + (w.to - w.from) * w.fn(p);
        if (p >= 1) L.splice(i, 1);
      }
      return L.length > 0;
    },
    finish() {
      for (const w of Tween.list) w.obj[w.k] = w.to;
      Tween.list.length = 0;
    },
    clear() { Tween.list.length = 0; },
    active: () => Tween.list.length > 0,
  });

  FE.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
})();
