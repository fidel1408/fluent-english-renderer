/* 25-stage: scene host, camera, cast, speech bubbles (organic outlines, tails glued to speakers) */
(function () {
  'use strict';
  const FE = window.FE;
  const { el, h, clamp } = FE;
  const SCENES = (FE.SCENES = FE.SCENES || {});

  class Stage {
    constructor(dom) {
      this.dom = dom; // {scene, light, fx, bubbles}
      this.chars = {}; this.bubbles = []; this.cam = { x: 0, y: 0, z: 1 };
      this.env = { wet: 0.35, rain: 0, time: 0 }; // weather & ambience params (tweened)
      this.anim = []; // per-scene animators (fn(dt,t))
      this.t = 0; this.sceneName = null;
    }
    /* build a scene fresh; resets everything */
    load(name, opts = {}) {
      const d = this.dom;
      FE.Tween.clear();
      this.hideBubbles(true); d.bubbles.innerHTML = ''; d.fx.innerHTML = '';
      this.chars = {}; this.anim = []; this.bubbles = [];
      this.sceneName = name; this.opts = opts;
      this.cam = { x: 0, y: 0, z: 1 }; this.env.wet = opts.wet != null ? opts.wet : 0.35; this.env.rain = opts.rain || 0;
      d.scene.innerHTML = '';
      const defs = el('defs'); d.scene.appendChild(defs);
      this.world = el('g', { id: 'world' }); d.scene.appendChild(this.world);
      this.layers = {};
      ['back', 'mid', 'chars', 'front', 'fg'].forEach((n) => { this.layers[n] = el('g', { class: 'L-' + n }); this.world.appendChild(this.layers[n]); });
      const def = SCENES[name]; if (!def) throw new Error('scene ' + name);
      this.sc = def(this, opts) || {};
      d.light.style.background = this.sc.light || 'none';
      this.applyCam();
      return this;
    }
    /* add character (idempotent) */
    add(id, o = {}) {
      let c = this.chars[id];
      if (!c) {
        c = new FE.Char(FE.Char.CAST[id]);
        this.chars[id] = c; this.layers.chars.appendChild(c.el);
      }
      const P = { x: o.x != null ? o.x : 960, y: o.y != null ? o.y : (this.sc.floorY || 960), s: o.s || (this.sc.charScale || 0.9), flip: o.flip || 1, alpha: o.alpha != null ? o.alpha : 1 };
      c.set(P);
      c.pose(o.pose || 'idle', 0); c.face(o.face || 'neutral', 0);
      if (o.look) c.look(o.look[0], o.look[1], 0);
      FE.Tween.finish();
      c.hands(); c.render(0);
      this.sortChars();
      return c;
    }
    sortChars() {
      Object.values(this.chars).sort((a, b) => a.P.y - b.P.y).forEach((c) => this.layers.chars.appendChild(c.el));
    }
    remove(id) { const c = this.chars[id]; if (c) { c.el.remove(); delete this.chars[id]; } }
    char(id) { return this.chars[id]; }

    /* camera: subtle push / pan, with parallax on the back layer */
    camTo(c, dur = 4, ease = 'soft') { FE.Tween.to(this.cam, c, dur, ease); }
    applyCam() {
      const { x, y, z } = this.cam;
      this.world.setAttribute('transform', `translate(960,540) scale(${z.toFixed(4)}) translate(${(-960 - x).toFixed(1)},${(-540 - y).toFixed(1)})`);
      this.layers.back.setAttribute('transform', `translate(${(x * 0.45).toFixed(1)},${(y * 0.45).toFixed(1)})`);
    }
    toScreen(px, py) {
      const { x, y, z } = this.cam;
      return { x: 960 + (px - 960 - x) * z, y: 540 + (py - 540 - y) * z };
    }
    setWeather(wet, rain, dur = 3) { FE.Tween.to(this.env, { wet, rain }, dur, 'soft'); }

    /* ---------- bubbles ---------- */
    heads() {
      return Object.values(this.chars).map((c) => { const a = c.anchor(); const s = this.toScreen(a.x, a.y); return { c, x: s.x, y: s.y, r: a.r * this.cam.z, top: this.toScreen(a.x, a.top).y }; });
    }
    bubble(speakerId, text, o = {}) {
      const d = this.dom;
      if (!o.keepOthers) this.hideBubbles();
      const b = h('div', { class: 'bub' + (o.narrate ? ' narrate' : '') });
      const svg = el('svg'); const tx = h('div', { class: 'tx' }, `<span class="ub">${FE.U(text)}</span>`);
      if (o.fs) tx.style.setProperty('--fs', o.fs + 'px');
      if (o.maxW) tx.style.maxWidth = o.maxW + 'px';
      b.appendChild(svg); b.appendChild(tx); d.bubbles.appendChild(b);
      const w = tx.offsetWidth, hgt = tx.offsetHeight;
      svg.setAttribute('width', w); svg.setAttribute('height', hgt);
      const rec = { b, svg, tx, w, h: hgt, speaker: speakerId, units: FE.$$('.wu', tx), seed: FE.hash(text + speakerId), body: null, x: 0, y: 0, dir: 0 };
      // outline paths (body drawn once; tail updated per frame)
      const ns = (t, a) => el(t, a);
      rec.tailS = ns('path', { fill: '#2a2238', stroke: '#2a2238', 'stroke-width': 7, 'stroke-linejoin': 'round' });
      rec.bodyS = ns('path', { fill: '#2a2238', stroke: '#2a2238', 'stroke-width': 7, 'stroke-linejoin': 'round' });
      rec.bodyF = ns('path', { fill: '#fffaf0' });
      rec.tailF = ns('path', { fill: '#fffaf0' });
      [rec.tailS, rec.bodyS, rec.tailF, rec.bodyF].forEach((p) => svg.appendChild(p));
      const bd = this.organic(w, hgt, rec.seed);
      rec.bodyS.setAttribute('d', bd); rec.bodyF.setAttribute('d', bd);
      this.place(rec, o);
      this.bubbles.push(rec); this.tail(rec);
      b.style.left = rec.x + 'px'; b.style.top = rec.y + 'px';
      requestAnimationFrame(() => b.classList.add('on'));
      if (FE.Tween.instant) b.classList.add('on');
      return rec;
    }
    /* hand-drawn looking rounded blob with tiny stable wobble */
    organic(w, hh, seed) {
      const r = FE.rng(seed), R = Math.min(34, hh * 0.42), n = 5;
      const pts = [];
      const wob = () => (r() - 0.5) * 3.2;
      // clockwise around rectangle with several points per side
      const sidePts = (x0, y0, x1, y1, k) => { for (let i = 0; i < k; i++) { const t = i / k; pts.push([x0 + (x1 - x0) * t + wob(), y0 + (y1 - y0) * t + wob()]); } };
      const m = 2;
      sidePts(R, m, w - R, m, n); pts.push([w - R * 0.3 + wob(), m + R * 0.3]);
      sidePts(w - m, R, w - m, hh - R, 2); pts.push([w - R * 0.3, hh - R * 0.3 + wob()]);
      sidePts(w - R, hh - m, R, hh - m, n); pts.push([R * 0.3 + wob(), hh - R * 0.3]);
      sidePts(m, hh - R, m, R, 2); pts.push([R * 0.3, R * 0.3 + wob()]);
      // Catmull-Rom → cubic beziers (closed)
      const P = pts, N = P.length; let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
      for (let i = 0; i < N; i++) {
        const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
        d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
      }
      return d + 'Z';
    }
    place(rec, o) {
      const hs = this.heads(), me = hs.find((q) => q.c.id === rec.speaker);
      const w = rec.w, hh = rec.h, M = 28;
      const others = hs.filter((q) => q !== me);
      const taken = this.bubbles.map((q) => ({ x: q.x, y: q.y, w: q.w, h: q.h }));
      let cands = [];
      if (o.at) cands = [{ x: o.at[0], y: o.at[1] }];
      else if (me) {
        const toC = me.x < 960 ? 1 : -1;
        const topY = me.top - hh - 38;
        const base = [
          [me.x - w / 2 + toC * w * 0.28, topY], [me.x - w / 2 + toC * w * 0.5, topY - 20],
          [me.x - w / 2 - toC * w * 0.2, topY - 10], [me.x + toC * (me.r + 50) - (toC < 0 ? w : 0), me.y - hh / 2 - 90],
          [me.x - w / 2 + toC * w * 0.28, topY - 90], [me.x - w / 2, topY - 160],
        ];
        cands = base.map((q) => ({ x: q[0], y: q[1] }));
      } else cands = [{ x: 960 - w / 2, y: 180 }];
      let best = null, bestScore = 1e9;
      for (const c of cands) {
        const x = clamp(c.x, M, 1920 - w - M), y = clamp(c.y, 142, 900 - hh);
        let sc = Math.abs(x - c.x) + Math.abs(y - c.y);
        for (const q of others) { // avoid every other face
          const ox = Math.max(0, Math.min(x + w, q.x + q.r) - Math.max(x, q.x - q.r)), oy = Math.max(0, Math.min(y + hh, q.y + q.r) - Math.max(y, q.y - q.r - 20));
          sc += ox * oy * 0.2;
        }
        if (me) { const ox = Math.max(0, Math.min(x + w, me.x + me.r * 0.9) - Math.max(x, me.x - me.r * 0.9)), oy = Math.max(0, Math.min(y + hh, me.y + me.r) - Math.max(y, me.y - me.r)); sc += ox * oy * 0.6; }
        for (const q of taken) { const ox = Math.max(0, Math.min(x + w, q.x + q.w + 14) - Math.max(x - 14, q.x)), oy = Math.max(0, Math.min(y + hh, q.y + q.h + 14) - Math.max(y - 14, q.y)); sc += ox * oy * 0.5; }
        if (sc < bestScore) { bestScore = sc; best = { x, y }; }
        if (sc === 0) break;
      }
      rec.x = best.x; rec.y = best.y;
    }
    /* tail from bubble edge to the speaker's head, recomputed every frame the speaker/camera moves */
    tail(rec) {
      const c = this.chars[rec.speaker]; if (!c) { rec.tailS.setAttribute('d', ''); rec.tailF.setAttribute('d', ''); return; }
      const a = c.anchor(), s = this.toScreen(a.x, a.y), r = a.r * this.cam.z;
      const bx = rec.x + rec.w / 2, by = rec.y + rec.h / 2;
      let dx = s.x - bx, dy = s.y - by; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
      // tip: on the head circle toward the bubble (never over the face centre)
      const tipX = s.x - dx * r * 1.02, tipY = s.y - dy * r * 1.02;
      // base: intersection of centre→tip ray with the body rectangle, shrunk a little
      const hw = rec.w / 2 - 22, hh2 = rec.h / 2 - 8;
      const k = Math.min(Math.abs(dx) > 1e-4 ? hw / Math.abs(dx) : 1e9, Math.abs(dy) > 1e-4 ? hh2 / Math.abs(dy) : 1e9);
      const ex = bx + dx * k - rec.x, ey = by + dy * k - rec.y;
      const nx = -dy, ny = dx, bw = 21;
      const tx = tipX - rec.x, ty = tipY - rec.y;
      const inx = -dx * 12, iny = -dy * 12; // base pushed inside the body so fills merge cleanly
      const mid = 0.55, cx = ex + (tx - ex) * mid + nx * 7, cy = ey + (ty - ey) * mid + ny * 7;
      const cx2 = ex + (tx - ex) * mid - nx * 2, cy2 = ey + (ty - ey) * mid - ny * 2;
      const d = `M${ex + nx * bw + inx},${ey + ny * bw + iny} L${ex + nx * bw},${ey + ny * bw} Q${cx},${cy} ${tx},${ty} Q${cx2},${cy2} ${ex - nx * bw},${ey - ny * bw} L${ex - nx * bw + inx},${ey - ny * bw + iny}Z`;
      rec.tailS.setAttribute('d', d); rec.tailF.setAttribute('d', d);
    }
    hideBubbles(instant) {
      for (const r of this.bubbles) { if (instant) r.b.remove(); else { r.b.classList.remove('on'); const b = r.b; setTimeout(() => b.remove(), 300); } }
      this.bubbles = [];
    }
    /* word highlight for a bubble by word index */
    highlight(rec, i) {
      if (!rec) return;
      rec.units.forEach((u, k) => u.classList.toggle('hl', k === i));
    }

    /* ---------- frame ---------- */
    tick(dt) {
      this.t += dt;
      FE.Tween.update(dt);
      for (const f of this.anim) f(dt, this.t);
      for (const id in this.chars) this.chars[id].render(dt);
      this.applyCam();
      for (const r of this.bubbles) this.tail(r);
      if (this.sc.env) this.sc.env(this.env, dt, this.t);
    }
  }
  FE.Stage = Stage;
})();
