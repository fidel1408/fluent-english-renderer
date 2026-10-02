/* Fluent English - Love Speaking Club
 * art-core.js : palette, shared SVG definitions, tiny SVG helpers, tween engine.
 * Original artwork, drawn in code (SVG + JS). No external images.
 */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- palette (see README: midnight navy, ivory, coral, raspberry, teal, amber) ---------- */
  const PAL = {
    navy0: '#070E22', navy1: '#0B1630', navy2: '#14224A', navy3: '#1F3366', navy4: '#34508F',
    ivory: '#FBF4E6', ivory2: '#F3E7D0', ivory3: '#E6D4B3',
    coral: '#FF6B57', coralDk: '#D9453A', raspberry: '#B5214F', raspberryDk: '#7E1237',
    teal: '#1FA8A0', tealDk: '#0E7370', tealLt: '#7FD6CC',
    amber: '#F5B544', amberDk: '#C98418', amberLt: '#FFD98A',
    ink: '#141B33'
  };

  /* Skin tones: base, highlight, shade, line, blush, lip */
  const SKIN = {
    s1: { base: '#F0C4A0', hi: '#F9DCC3', sh: '#D49D78', ln: '#9B6244', blush: '#E58C7C', lip: '#C46B62' },
    s2: { base: '#D69C6E', hi: '#E9BA8E', sh: '#B57850', ln: '#744428', blush: '#C77358', lip: '#A44F47' },
    s3: { base: '#A66C46', hi: '#BF865A', sh: '#7F4E2E', ln: '#4A2A17', blush: '#B05E49', lip: '#86413E' },
    s4: { base: '#6C4328', hi: '#885738', sh: '#4C2D1A', ln: '#2B190D', blush: '#8A4934', lip: '#66312E' }
  };

  /* ---------- helpers ---------- */
  const f = (n) => Math.round(n * 100) / 100;
  function S(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) { if (attrs[k] !== undefined && attrs[k] !== null) el.setAttribute(k, attrs[k]); }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return el;
  }
  /* Build SVG from a markup string (fast for static scenery). */
  function SVGfrag(markup) {
    const t = document.createElementNS(NS, 'g');
    t.innerHTML = markup;
    return t;
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = {
    linear: (t) => t,
    inOut: (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    soft: (t) => t * t * (3 - 2 * t),
    back: (t) => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };

  /* ---------- shared defs (gradients used across scenes) ---------- */
  function buildDefs() {
    let d = '';
    for (const k in SKIN) {
      const s = SKIN[k];
      d += `<radialGradient id="face-${k}" cx="42%" cy="38%" r="75%"><stop offset="0" stop-color="${s.hi}"/><stop offset=".55" stop-color="${s.base}"/><stop offset="1" stop-color="${s.sh}"/></radialGradient>`;
      d += `<linearGradient id="limb-${k}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${s.hi}"/><stop offset=".45" stop-color="${s.base}"/><stop offset="1" stop-color="${s.sh}"/></linearGradient>`;
      d += `<linearGradient id="neck-${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${s.sh}"/><stop offset=".55" stop-color="${s.base}"/><stop offset="1" stop-color="${s.base}"/></linearGradient>`;
    }
    d += `
    <linearGradient id="shadeSide" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0B1630" stop-opacity=".30"/></linearGradient>
    <linearGradient id="shadeDown" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0B1630" stop-opacity=".28"/></linearGradient>
    <linearGradient id="shadeUp" x1="0" x2="0" y1="1" y2="0"><stop offset="0" stop-color="#0B1630" stop-opacity=".34"/><stop offset="1" stop-color="#0B1630" stop-opacity="0"/></linearGradient>
    <radialGradient id="glowAmber" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD98A" stop-opacity=".95"/><stop offset=".35" stop-color="#F5B544" stop-opacity=".45"/><stop offset="1" stop-color="#F5B544" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowCoral" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FF8C79" stop-opacity=".9"/><stop offset=".4" stop-color="#FF6B57" stop-opacity=".35"/><stop offset="1" stop-color="#FF6B57" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowTeal" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7FD6CC" stop-opacity=".85"/><stop offset=".4" stop-color="#1FA8A0" stop-opacity=".3"/><stop offset="1" stop-color="#1FA8A0" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowWhite" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF7E6" stop-opacity=".9"/><stop offset=".4" stop-color="#FFF1CF" stop-opacity=".3"/><stop offset="1" stop-color="#FFF1CF" stop-opacity="0"/></radialGradient>
    <radialGradient id="vignette" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#050A1A" stop-opacity="0"/><stop offset="1" stop-color="#050A1A" stop-opacity=".55"/></radialGradient>
    <linearGradient id="floorShade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
    <pattern id="stubble" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".55" fill="#1a1216"/><circle cx="3.6" cy="2.6" r=".5" fill="#1a1216"/><circle cx="2" cy="4.2" r=".45" fill="#1a1216"/></pattern>
    <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="none"/><rect width="1" height="6" fill="#000" opacity=".07"/></pattern>
    <pattern id="knit" width="8" height="10" patternUnits="userSpaceOnUse"><path d="M0 0 L4 8 L8 0" fill="none" stroke="#000" stroke-opacity=".10" stroke-width="1.4"/></pattern>
    <filter id="blur6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur14" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    `;
    return d;
  }
  function mountDefs() {
    if (document.getElementById('fe-art-defs')) return;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('id', 'fe-art-defs');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = buildDefs();
    svg.appendChild(defs);
    document.body.appendChild(svg);
  }

  /* ---------- global animation loop (virtual clock so Pause freezes scenes; reduced motion jumps) ---------- */
  const Anim = {
    tweens: new Set(), tickers: new Set(), sched: [],
    running: false, reduced: false, paused: false, speed: 1,
    vt: 0, last: 0,
    add(t) { t.t0 = this.vt; this.tweens.add(t); this.kick(); return t; },
    ticker(fn) { this.tickers.add(fn); this.kick(); return () => this.tickers.delete(fn); },
    /* scheduled callback on the virtual clock */
    later(fn, ms) { const it = { due: this.vt + ms, fn, dead: false }; this.sched.push(it); this.kick(); return it; },
    cancel(it) { if (it) it.dead = true; },
    cancelAll() { this.sched.forEach((s) => { s.dead = true; }); this.sched = []; this.tweens.forEach((t) => { t.dead = true; }); this.tweens.clear(); },
    pause() { this.paused = true; }, resume() { this.paused = false; this.kick(); },
    kick() { if (!this.running) { this.running = true; this.last = 0; requestAnimationFrame((ts) => this.frame(ts)); } },
    frame(ts) {
      const dt = this.last ? Math.min(ts - this.last, 100) : 16; this.last = ts;
      if (!this.paused) this.vt += dt * this.speed;
      if (!this.paused) {
        for (const t of [...this.tweens]) {
          if (t.dead) { this.tweens.delete(t); continue; }
          const delay = t.delay || 0; const el = this.vt - t.t0 - delay;
          if (el < 0 && !this.reduced) continue;
          const dur = this.reduced ? 1 : t.dur;
          const raw = dur <= 0 ? 1 : clamp(el / dur, 0, 1);
          t.update((t.ease || ease.inOut)(raw), raw);
          if (raw >= 1) { this.tweens.delete(t); t.done && t.done(); }
        }
        if (this.sched.length) {
          const due = this.sched.filter((s) => !s.dead && s.due <= this.vt);
          this.sched = this.sched.filter((s) => !s.dead && s.due > this.vt);
          due.forEach((s) => { try { s.fn(); } catch (e) { console.error(e); } });
        }
      }
      for (const fn of this.tickers) fn(ts, dt);
      if (this.tweens.size || this.tickers.size || this.sched.length) requestAnimationFrame((x) => this.frame(x)); else { this.running = false; }
    }
  };

  global.Art = global.Art || {};
  Object.assign(global.Art, { NS, PAL, SKIN, S, SVGfrag, f, lerp, clamp, ease, Anim, mountDefs });
})(window);
