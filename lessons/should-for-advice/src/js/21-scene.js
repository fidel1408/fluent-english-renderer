/* Should for Advice — Scene: layered stage, actors, organic speech bubbles, cues */
(function (g) {
  'use strict';
  const FE = g.FE;
  const { h, clamp } = FE;

  /* ---------- hand-drawn organic bubble geometry (stable per bubble) ---------- */
  function wobblyPath(w, hgt, seed, r) {
    const rnd = FE.rng(seed), pts = [];
    const rr = Math.min(r, hgt / 2 - 2, w / 2 - 2);
    const per = [];
    // perimeter samples of a rounded rect (clockwise from top-left corner end)
    const nx = Math.max(3, Math.round(w / 90)), ny = Math.max(2, Math.round(hgt / 90));
    for (let i = 0; i <= nx; i++) per.push([rr + (w - 2 * rr) * (i / nx), 0, 0, -1]);
    per.push([w - rr * 0.3, rr * 0.3, 1, -1]);
    for (let i = 0; i <= ny; i++) per.push([w, rr + (hgt - 2 * rr) * (i / ny), 1, 0]);
    per.push([w - rr * 0.3, hgt - rr * 0.3, 1, 1]);
    for (let i = nx; i >= 0; i--) per.push([rr + (w - 2 * rr) * (i / nx), hgt, 0, 1]);
    per.push([rr * 0.3, hgt - rr * 0.3, -1, 1]);
    for (let i = ny; i >= 0; i--) per.push([0, rr + (hgt - 2 * rr) * (i / ny), -1, 0]);
    per.push([rr * 0.3, rr * 0.3, -1, -1]);
    per.forEach((p) => { const n = (rnd() - 0.5) * 5.2; pts.push([p[0] + p[2] * n * 0.8, p[1] + p[3] * n * 0.8]); });
    // closed Catmull-Rom -> cubic Bezier
    const N = pts.length; let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < N; i++) {
      const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  function Bubble(S, spec) {
    this.S = S; this.spec = spec; this.actor = spec.actor || null; this.think = !!spec.think; this.seed = FE.hash(spec.id || spec.text || 'b');
    const el = (this.el = h('div', { class: 'bubble' + (this.think ? ' think' : '') }));
    const spkName = spec.who || (spec.actor && FE.CHARS[spec.actor.key] ? FE.CHARS[spec.actor.key].name : '');
    el.innerHTML = '<svg class="bg" aria-hidden="true"><g class="sh"><path class="tail-fill" d=""/><path class="blob" d=""/><path class="tail-fill2" d=""/></g><g class="dots"></g></svg><div class="txt">' +
      (spkName ? '<div class="who' + (spec.who ? '' : ' auto') + '">' + FE.U(spkName) + '</div>' : '') + '<div class="line">' + (spec.html || FE.U(spec.text, { idx: true })) + '</div></div>';
    el.style.left = '0px'; el.style.top = '0px';
    if (spec.w) el.querySelector('.txt').style.width = spec.w + 'px';
    if (spec.size) el.querySelector('.txt').style.fontSize = spec.size + 'px';
    S.ui_.appendChild(el);
    this.measure();
    this.lastA = null;
    this.update(true);
    S.bubbles.push(this);
  }
  Bubble.prototype.measure = function () {
    const el = this.el, txt = el.querySelector('.txt');
    if (!txt.offsetWidth) { this.w = 0; return; } // hidden (compact layout): measured again when shown on a wide layout
    this.w = txt.offsetWidth; this.h = txt.offsetHeight;
    const sp = this.spec;
    this.x0 = Math.max(24, Math.min(1896 - this.w, Math.round(sp.x - this.w / 2))); this.y0 = Math.max(142, Math.round(sp.y - this.h / 2));
    const an = this.anchorPt && this.anchorPt();
    if (an && !this.think) {
      if (an.y - (this.y0 + this.h) > 260) this.y0 = Math.max(142, Math.round(an.y - 260 - this.h));
      const cx = this.x0 + this.w / 2, lim = this.w / 2 + 230;
      if (Math.abs(cx - an.x) > lim) this.x0 = Math.max(24, Math.min(1896 - this.w, Math.round(an.x + Math.sign(cx - an.x) * lim - this.w / 2)));
    }
    el.style.left = this.x0 + 'px'; el.style.top = this.y0 + 'px';
    const svg = el.querySelector('svg.bg'); svg.setAttribute('width', this.w + 60); svg.setAttribute('height', this.h + 60); svg.setAttribute('viewBox', `-30 -30 ${this.w + 60} ${this.h + 60}`);
    svg.style.left = '0'; svg.style.top = '0'; svg.style.transform = 'translate(-30px,-30px)';
    const blob = wobblyPath(this.w, this.h, this.seed, this.think ? 60 : 40);
    this.blob = blob;
    const bp = el.querySelector('.blob');
    bp.setAttribute('d', blob);
    const dark = !!this.spec.dark;
    const fill = dark ? '#1b2748' : '#fffdf8', stroke = dark ? '#8fa6da' : '#1a2239';
    el.querySelectorAll('.blob,.tail-fill').forEach((p) => { p.setAttribute('fill', fill); p.setAttribute('stroke', stroke); p.setAttribute('stroke-width', '3.6'); p.setAttribute('stroke-linejoin', 'round'); });
    el.querySelector('.tail-fill2').setAttribute('fill', fill);
    el.querySelector('.sh').setAttribute('filter', 'url(#fe-sh2)');
  };
  Bubble.prototype.anchorPt = function () {
    const sp = this.spec; let a;
    if (this.actor) a = this.actor.anchor(sp.side || 'right'); else if (sp.anchor) a = sp.anchor; else return null;
    if (sp.dx) a = { x: a.x + sp.dx, y: a.y + (sp.dy || 0) };
    return a;
  };
  Bubble.prototype.update = function (force) {
    if (!this.w) return;
    const a = this.anchorPt();
    if (!a) return;
    if (!force && this.lastA && Math.abs(a.x - this.lastA.x) < 0.4 && Math.abs(a.y - this.lastA.y) < 0.4) return;
    this.lastA = a;
    const lx = a.x - this.x0, ly = a.y - this.y0, w = this.w, hh = this.h;
    const cx = w / 2, cy = hh / 2, dx = lx - cx, dy = ly - cy;
    // intersection of the centre->anchor ray with the rounded rect, kept off the corners
    let t = Math.min(dx !== 0 ? (w / 2 - 34) / Math.abs(dx) : 1e9, dy !== 0 ? (hh / 2) / Math.abs(dy) : 1e9);
    if (!isFinite(t)) t = 1;
    let bx, by, nx, ny, tx, ty; // base centre, outward normal, tangent
    if (Math.abs(dy) * (w / 2) >= Math.abs(dx) * (hh / 2) * 0.55 || Math.abs(dy) > hh / 2) {
      const sgn = dy > 0 ? 1 : -1; by = sgn > 0 ? hh - 1 : 1; bx = clamp(cx + dx * ((by - cy) / dy), 54, w - 54); nx = 0; ny = sgn; tx = 1; ty = 0;
    } else {
      const sgn = dx > 0 ? 1 : -1; bx = sgn > 0 ? w - 1 : 1; by = clamp(cy + dy * ((bx - cx) / dx), 30, hh - 30); nx = sgn; ny = 0; tx = 0; ty = 1;
    }
    const bw = this.think ? 0 : 20;
    const p1 = [bx - tx * bw, by - ty * bw], p2 = [bx + tx * bw, by + ty * bw];
    const el = this.el;
    if (this.think) {
      // thought bubble: three trailing dots toward the anchor
      el.querySelector('.tail-fill').setAttribute('d', ''); el.querySelector('.tail-fill2').setAttribute('d', '');
      const dots = el.querySelector('.dots'); dots.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const f = (i + 1) / 4.2, px = bx + (lx - bx) * f, py = by + (ly - by) * f, r = 15 - i * 3.6;
        dots.insertAdjacentHTML('beforeend', `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="#fffdf8" stroke="#1a2239" stroke-width="3"/>`);
      }
      return;
    }
    // organic curved tail: tip lands just beside the speaker's head
    const tipx = lx - nx * 4, tipy = ly - ny * 4;
    const mx = (bx + tipx) / 2, my = (by + tipy) / 2, bend = clamp((tipx - bx) * ny * -0.18 + (tipy - by) * nx * 0.18, -26, 26);
    const c1 = [p1[0] + (mx - p1[0]) * 0.8 + ny * bend + 0, p1[1] + (my - p1[1]) * 0.8 - nx * bend];
    const c2 = [p2[0] + (mx - p2[0]) * 0.8 + ny * bend * 0.4, p2[1] + (my - p2[1]) * 0.8 - nx * bend * 0.4];
    const d = `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}Q${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)}Q${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    el.querySelector('.tail-fill').setAttribute('d', d + 'Z');
    // patch that hides the blob outline where the tail joins it
    const i1 = [p1[0] - nx * 5, p1[1] - ny * 5], i2 = [p2[0] - nx * 5, p2[1] - ny * 5];
    el.querySelector('.tail-fill2').setAttribute('d', `M${(p1[0] + tx * 1.5).toFixed(1)} ${(p1[1] + ty * 1.5).toFixed(1)}L${(p2[0] - tx * 1.5).toFixed(1)} ${(p2[1] - ty * 1.5).toFixed(1)}L${i2[0].toFixed(1)} ${i2[1].toFixed(1)}L${i1[0].toFixed(1)} ${i1[1].toFixed(1)}Z`);
  };
  Bubble.prototype.show = function (fast) {
    this.shown = true; const el = this.el;
    if (!this.w && !(FE.ui && FE.ui.compact)) { this.measure(); } el.classList.toggle('fast', !!fast);
    this.update(true);
    if (fast) el.classList.add('in'); else requestAnimationFrame(() => { if (this.shown) { el.classList.add('in'); FE.ui && FE.ui.ensureVisible && FE.ui.ensureVisible(el); } });
    if (this.actor) FE.Loop.hooks.add(this.hook || (this.hook = () => this.update(false)));
  };
  Bubble.prototype.hide = function (fast) {
    this.shown = false;
    this.el.classList.toggle('fast', !!fast); this.el.classList.remove('in');
    if (this.hook) FE.Loop.hooks.delete(this.hook);
  };
  Bubble.prototype.hl = function (i) {
    const us = this.el.querySelectorAll('.u[data-i]');
    us.forEach((u) => u.classList.toggle('spk', +u.dataset.i === i));
  };

  /* ---------- Scene ---------- */
  function Scene(seg, L, layers) {
    this.seg = seg; this.L = L; this.layers = layers; this.fast = false;
    this.cues = []; this.actors = []; this.bubbles = []; this.timers = []; this.tickers = []; this.hints = []; this.hintIx = 0; this.revealFns = []; this.notesHTML = ''; this.cleanup = []; this.ctls = [];
    this.ui_ = layers.ui; this.revealed = false; this.state = {};
  }
  const P = Scene.prototype;
  P.env = function (name, opt) {
    const e = FE.ENV[name](opt || {});
    this.layers.back.innerHTML = '<svg viewBox="0 0 1920 1080">' + e.back + '</svg>';
    this.layers.front.innerHTML = '<svg viewBox="0 0 1920 1080">' + e.front + '</svg>';
    this.envName = name;
  };
  P.noEnv = function (bg) { this.layers.back.innerHTML = '<svg viewBox="0 0 1920 1080"><defs><radialGradient id="nb" cx=".3" cy=".25" r="1"><stop offset="0" stop-color="' + (bg || '#1d3a6b') + '"/><stop offset="1" stop-color="#070b16"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#nb)"/></svg>'; this.layers.front.innerHTML = ''; };
  P.actor = function (key, o) {
    o = o || {}; if (o.idle == null) o.idle = (this.idle == null ? 1 : this.idle) * (FE.reduced() ? 0.3 : 1);
    const a = new FE.Actor(key, o);
    this.layers.actors.appendChild(a.el);
    if (o.facing != null) a.set({ facing: o.facing }, true);
    if (o.arms) a.setArms(o.arms[0], o.arms[1], true);
    if (o.expr) a.expr(o.expr, true);
    if (o.look) a.set({ gx: o.look[0], gy: o.look[1] || 0 }, true);
    if (o.lean != null) { a.baseLean = o.lean; a.set({ lean: o.lean }, true); }
    a.render(true);
    FE.Loop.add(a); this.actors.push(a); return a;
  };
  P.svg = function (markup, cls) {
    const gg = document.createElementNS(FE.SVGNS, 'g'); if (cls) gg.setAttribute('class', cls); gg.innerHTML = markup; this.layers.props.appendChild(gg); return gg;
  };
  P.ui = function (html, cls, style) {
    const d = h('div', { class: cls || '', html: html }); if (style) Object.assign(d.style, style); this.ui_.appendChild(d); return d;
  };
  P.bubble = function (spec) { return new Bubble(this, spec); };
  /* Delayed work runs on the SCENE clock, which only advances while the lesson is playing (pause freezes it, seek/replay/destroy cancel it). */
  P.timeout = function (fn, ms) { const t = { left: Math.max(0, ms) / 1000, fn, dead: false }; this.timers.push(t); return t; };
  /* UI feedback (not lesson sequencing): real time, so a paused teacher still sees an answer's result; cancelled when the scene is destroyed */
  P.later = function (fn, ms) { const id = setTimeout(() => { this.rt = (this.rt || []).filter((x) => x !== id); fn(); }, ms); (this.rt = this.rt || []).push(id); return id; };
  P.cancel = function (t) { if (t) t.dead = true; };
  P.ticker = function (fn) { const k = { fn, dead: false }; this.tickers.push(k); return k; };
  P.tick = function (dt) {
    for (let i = 0; i < this.timers.length; i++) { const t = this.timers[i]; if (t.dead) continue; t.left -= dt; if (t.left <= 0) { t.dead = true; try { t.fn(); } catch (e) { console.error('timer', e); } } }
    this.timers = this.timers.filter((t) => !t.dead);
    for (let i = 0; i < this.tickers.length; i++) { const k = this.tickers[i]; if (!k.dead) { try { k.fn(dt); } catch (e) { k.dead = true; } } }
    this.tickers = this.tickers.filter((k) => !k.dead);
  };
  P.reg = function (ctl) { this.ctls.push(ctl); return ctl; };
  P.sfx = function (n) { if (!this.fast) FE.audio.sfx(n); };
  /* reveal / vanish with classes (CSS transition); respects fast mode */
  P.in = function (el, delay) {
    if (!el) return;
    el.classList.add('anim'); el.classList.toggle('notr', this.fast);
    if (this.fast) el.classList.add('on');
    else if (!delay) requestAnimationFrame(() => { if (el.isConnected) { el.classList.add('on'); FE.ui && FE.ui.ensureVisible && FE.ui.ensureVisible(el); } });
    else this.timeout(() => { el.classList.add('on'); FE.ui && FE.ui.ensureVisible && FE.ui.ensureVisible(el); }, delay * 1000);
  };
  P.out = function (el) { if (!el) return; el.classList.toggle('notr', this.fast); el.classList.remove('on'); };
  /* smoothly move an SVG/HTML wrapper element (CSS transform) */
  P.move = function (el, x, y, ms, rot) {
    if (!el) return; el.style.transition = this.fast ? 'none' : `transform ${ms || 900}ms cubic-bezier(.4,0,.2,1)`;
    el.style.transform = `translate(${x}px,${y}px)${rot ? ` rotate(${rot}deg)` : ''}`;
  };
  P.t = function (ref) {
    if (typeof ref !== 'string') return ref;
    const m = ref.match(/^([\w.\-]+)(>)?([+-][\d.]+)?$/);
    if (!m) throw new Error('bad cue ref ' + ref);
    const ln = this.L[m[1]]; if (!ln) throw new Error('unknown line ' + m[1] + ' in segment ' + this.seg.id);
    return (m[2] ? ln.end : ln.start) + (m[3] ? parseFloat(m[3]) : 0);
  };
  P.at = function (ref, fn) { this.cues.push({ t: this.t(ref), fn, done: false }); return this; };
  P.hint = function (fn) { this.hints.push(fn); };
  /* A reveal handler is item-scoped: it may be called any number of times and must be idempotent; can() says whether something is still hidden. */
  P.onReveal = function (fn, can) { const r = { fn, can: can || null, used: false }; this.revealFns.push(r); return r; };
  P.canReveal = function () { return this.revealFns.some((r) => (r.can ? !!r.can() : !r.used)); };
  P.doReveal = function () { let any = false; this.revealFns.forEach((r) => { if (r.can ? r.can() : !r.used) { r.used = true; any = true; r.fn(); } }); if (any && FE.engine) FE.engine.emit('revealstate'); return any; };
  P.doHint = function () { if (!this.hints.length) return false; const f = this.hints[Math.min(this.hintIx++, this.hints.length - 1)]; f(); return true; };
  P.notes = function (html) { this.notesHTML = html; };
  P.lineTime = function (k) { return this.L[k]; };

  /* a spoken line: bubble appears with the line, speaker's mouth follows the audio, words highlight in time */
  P.say = function (key, spec) {
    const ln = this.L[key]; if (!ln) throw new Error('unknown line ' + key);
    const text = spec.text != null ? spec.text : ln.text;
    const b = this.bubble(Object.assign({ id: key, text }, spec));
    const words = FE.tokenize(text).filter((t) => t.type === 'word');
    const wts = words.map((w) => 2 + (FE.ipaOf(w.text) || w.text).length), tot = wts.reduce((a, c) => a + c, 0);
    const a = spec.actor, group = spec.group;
    this.sayList = this.sayList || [];
    if (!spec.keep) this.at(ln.start - 0.06, () => { this.sayList.forEach((o) => { if (o !== b && o.shown) o.hide(this.fast); }); });
    this.sayList.push(b);
    this.at(ln.start - 0.05, () => { b.show(this.fast); if (a) { a.setTalking(true); if (!this.fast && spec.to && a.lookAtActor) a.lookAtActor(spec.to); } });
    let acc = 0;
    words.forEach((w, i) => { const t0 = ln.start + 0.1 + (ln.dur - 0.25) * (acc / tot); acc += wts[i]; this.at(t0, () => { if (!this.fast) b.hl(i); }); });
    this.at(ln.end, () => { if (a) a.setTalking(false); b.hl(-1); });
    if (spec.hideAfter != null) this.at(ln.end + spec.hideAfter, () => b.hide(this.fast));
    return b;
  };
  P.groups = null;
  P.destroy = function () {
    this.timers.forEach((t) => { t.dead = true; }); this.timers = []; this.tickers = []; (this.rt || []).forEach(clearTimeout); this.rt = [];
    this.cleanup.forEach((f) => { try { f(); } catch (e) { /* ignore */ } });
    this.actors.forEach((a) => FE.Loop.remove(a));
    FE.Loop.hooks.clear();
    const l = this.layers; l.back.innerHTML = ''; l.front.innerHTML = ''; l.actors.innerHTML = ''; l.props.innerHTML = ''; l.ui.innerHTML = '';
    this.bubbles = []; this.actors = [];
  };
  FE.Scene = function (seg, L, layers) { const s = new Scene(seg, L, layers); s.groups = {}; return s; };
})(window);
