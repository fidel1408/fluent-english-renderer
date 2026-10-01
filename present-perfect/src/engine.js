/* engine.js — timeline model + deterministic renderer.
   render(ctx, t) is a pure function of time: scrubbing, chapter jumps and replay are exact.
   Layers: scene bg (camera) -> cast (camera) -> scene fg (camera) -> bubbles + teaching graphics (screen space)
   -> captions / logo / chapter chip.  Text never moves with the camera.                               */
'use strict';
const VW = 1920, VH = 1080;
const HEAD_R = { D: 112, M: 134, S: 116 };

const Eng = {
  TL: null, LINE: {}, BEAT: {}, groups: [], gi: 0, assets: {}, hot: [], pausePoints: [], captions: true, quality: 1,

  init(TL, groupDefs, assets) {
    this.TL = TL; this.assets = assets; this.LINE = {}; this.BEAT = {};
    for (const b of TL.beats) { this.BEAT[b.id] = b; for (const l of b.lines) { l.beat = b.id; this.LINE[l.id] = l; } }
    this.duration = TL.duration;
    // per-character speaking line lists (for mouth envelopes)
    this.talk = { D: [], M: [], S: [] };
    for (const b of TL.beats) for (const l of b.lines) if (l.open && this.talk[l.who]) this.talk[l.who].push(l);
    this.chapterOf = {}; TL.chapters.forEach((c, i) => { c.idx = i; this.chapterOf[c.id] = c; });
    this.groups = groupDefs.map(def => this.buildGroup(def));
    this.groups.sort((a, b) => a.t0 - b.t0);
    this.pausePoints = this.groups.flatMap(g => (g.S && g.S.pausePoints) || []).sort((a, b) => a.t - b.t);
    // chapter start times (first beat of each chapter)
    this.chapterStart = TL.chapters.map(c => { const b = TL.beats.find(b => b.ch === c.id); return b ? Math.max(0, b.t0 - 0.35) : 0; });
    this.chapterBlocks = TL.chapters.map(c => T(c.label, { size: 30, ipa: 19, weight: 500 }));
  },

  /* ------------------------------------------------------------ groups */
  buildGroup(def) {
    const first = this.BEAT[def.beats[0]], last = this.BEAT[def.beats[def.beats.length - 1]];
    if (!first || !last) throw new Error('unknown beat in group ' + def.id);
    const g = Object.assign({}, def, { t0: first.t0, t1: last.t1, ch: first.ch, tracks: {}, bubbles: [] });
    g.dur = g.t1 - g.t0;
    for (const id of Object.keys(g.cast)) g.tracks[id] = this.newTracks(id, g);
    const K = {}; for (const id of Object.keys(g.cast)) K[id] = this.keyApi(g, id);
    g.K = K;
    g.S = def.build ? def.build(g) || {} : {};
    // automatic bubbles for dialogue + silent thoughts
    for (const bid of def.beats) for (const l of this.BEAT[bid].lines) if ((l.kind === 'dlg' || l.kind === 'thought') && g.cast[l.who]) g.bubbles.push(this.makeBubbleFor(g, l));
    for (const id of Object.keys(g.cast)) if (g.autoGesture !== false) this.autoGestures(g, id);
    if (def.pose) def.pose(K, g.S, g);
    for (const id of Object.keys(g.tracks)) for (const k of Object.keys(g.tracks[id])) g.tracks[id][k].finalize();
    // camera
    g.cam = { x: new Track(960), y: new Track(540), z: new Track(1) };
    const c = def.cam || { from: [960, 540, 1.0], to: [960, 540, 1.045] };
    g.cam.x.init = c.from[0]; g.cam.y.init = c.from[1]; g.cam.z.init = c.from[2];
    g.cam.x.add(g.t0, c.to[0], g.dur, E.io); g.cam.y.add(g.t0, c.to[1], g.dur, E.io); g.cam.z.add(g.t0, c.to[2], g.dur, E.io);
    for (const k of ['x', 'y', 'z']) g.cam[k].finalize();
    return g;
  },

  newTracks(id, g) {
    const c = g.cast[id], C = CAST[id], rest = c.rest || {};
    const R = (a, d) => (a === undefined ? d : a);
    const aL = rest.armL || { x: -(C.sw - 8), y: 300, hand: 'rest' }, aR = rest.armR || { x: C.sw - 8, y: 300, hand: 'rest' };
    const mk = v => new Track(v);
    return {
      bx: mk(0), by: mk(0), lean: mk(R(rest.lean, 0)), shrug: mk(0), yaw: mk(R(rest.yaw, 0)), pitch: mk(0), roll: mk(0), brow: mk(0), bt: mk(0), lid: mk(1), smile: mk(R(rest.smile, 0.2)), mo: mk(0),
      alx: mk(aL.x), aly: mk(aL.y), arx: mk(aR.x), ary: mk(aR.y), alh: mk(aL.hand), arh: mk(aR.hand), ali: mk(aL.item || null), ari: mk(aR.item || null),
      lx: mk(R(rest.lookX, c.x)), ly: mk(R(rest.lookY, c.y - 160)), hf: mk(R(rest.headFollow, 0.65)),
    };
  },

  keyApi(g, id) {
    const tr = g.tracks[id], self = this;
    const api = {
      set(t, o, dur = 0.5, ease = E.io) { for (const k in o) { if (!tr[k]) throw new Error('bad prop ' + k); tr[k].add(t, o[k], dur, ease); } return api; },
      arm(side, t, a, dur = 0.55, ease = E.io) { const s = side === 'L' ? 'l' : 'r'; if (a.x !== undefined) tr['a' + s + 'x'].add(t, a.x, dur, ease); if (a.y !== undefined) tr['a' + s + 'y'].add(t, a.y, dur, ease); if (a.hand) tr['a' + s + 'h'].add(t, a.hand, dur, ease); if (a.item !== undefined) tr['a' + s + 'i'].add(t, a.item, 0.01, ease); return api; },
      look(t, target, dur = 0.35, follow) { const p = self.resolveTarget(g, target); tr.lx.add(t, p[0], dur, E.io); tr.ly.add(t, p[1], dur, E.io); if (follow !== undefined) tr.hf.add(t, follow, dur); return api; },
      face(t, name, dur = 0.4) { const e = EXPR[name]; if (!e) throw new Error('bad expr ' + name); const o = Object.assign({ brow: 0, bt: 0, lid: 1, smile: 0.2, mo: 0 }, e); for (const k in o) tr[k].add(t, o[k], dur, E.io); return api; },
      nod(t, n = 1, amp = 0.09) { for (let i = 0; i < n; i++) { tr.pitch.add(t + i * 0.42, amp, 0.18, E.out); tr.pitch.add(t + i * 0.42 + 0.18, 0, 0.24, E.io); } return api; },
      shake(t, n = 2, amp = 0.35) { for (let i = 0; i < n; i++) { tr.yaw.add(t + i * 0.5, amp * (i % 2 ? 1 : -1), 0.25, E.io); } return api; },
      wave(t, t1, side = 'R') { const s = side === 'L' ? 'l' : 'r', sx = side === 'L' ? -1 : 1; let i = 0; for (let x = t; x < t1; x += 0.34, i++) { tr['a' + s + 'x'].add(x, sx * (170 + (i % 2 ? 32 : -22)), 0.3, E.io); tr['a' + s + 'y'].add(x, -40 + (i % 2) * 14, 0.3, E.io); } tr['a' + s + 'h'].add(t, 'open', 0.2); return api; },
      gesture(t0, t1, side = 'R', kind = 'open') { self.gesture(g, id, t0, t1, side, kind); return api; },
    };
    return api;
  },

  resolveTarget(g, target) {
    if (Array.isArray(target)) return target;
    if (g.cast[target]) { const c = g.cast[target]; return [c.x * 1, c.y - (30 + 118 * HS) * c.s]; }
    if (target === 'ui') return [960, 420];
    if (target === 'cam') return [960, 760];
    if (target === 'down') return [960, 1000];
    if (target === 'left') return [200, 540]; if (target === 'right') return [1700, 540];
    return [960, 540];
  },

  /* default rest and gestures: talking hands */
  gesture(g, id, t0, t1, side, kind) {
    const C = CAST[id], tr = g.tracks[id], s = side === 'L' ? 'l' : 'r', sx = side === 'L' ? -1 : 1, rest = (g.cast[id].rest || {})['arm' + side] || { x: sx * (C.sw - 8), y: 300, hand: 'rest' };
    const up = { x: sx * (C.sw + 30 + (kind === 'wide' ? 40 : 0)), y: 175 - (kind === 'point' ? 25 : 0) };
    tr['a' + s + 'x'].add(t0 - 0.22, rest.x - sx * 12, 0.16, E.io); tr['a' + s + 'y'].add(t0 - 0.22, rest.y + 14, 0.16, E.io);          // anticipation
    tr['a' + s + 'x'].add(t0 - 0.06, up.x, 0.42, E.back); tr['a' + s + 'y'].add(t0 - 0.06, up.y, 0.42, E.back); tr['a' + s + 'h'].add(t0 - 0.06, kind === 'point' ? 'point' : 'open', 0.2);
    tr['a' + s + 'y'].add(t0 + 0.5, up.y + 22, Math.max(0.3, (t1 - t0) * 0.4), E.io);
    tr['a' + s + 'x'].add(t1 - 0.2, rest.x, 0.55, E.io); tr['a' + s + 'y'].add(t1 - 0.2, rest.y, 0.55, E.io); tr['a' + s + 'h'].add(t1 + 0.2, rest.hand || 'rest', 0.2);
  },
  autoGestures(g, id) {
    let k = 0;
    for (const bid of g.beats) for (const l of this.BEAT[bid].lines) {
      if (l.who !== id || l.kind !== 'dlg' || l.dur < 1.2) continue;
      this.gesture(g, id, l.t0 + 0.05, l.t1, k++ % 2 ? 'L' : 'R', 'open');
    }
  },

  /* ------------------------------------------------------------ bubbles */
  makeBubbleFor(g, l) {
    const pos = (g.bub && g.bub[l.who]) || [g.cast[l.who].x, g.cast[l.who].y - 400];
    const B = makeBubble(l.text, { size: g.bubSize || 42, maxW: g.bubW || 560 });
    // lifetime: until same speaker's next bubble, or hold seconds after the line
    const hold = g.bubHold === undefined ? 2.6 : g.bubHold;
    return { id: l.id, who: l.who, kind: l.kind, B, cx: pos[0], cy: pos[1], t0: l.t0 - 0.05, t1: l.kind === 'thought' ? l.t1 : l.t1 + hold, line: l, words: wordWeights(B.tb) };
  },

  /* ------------------------------------------------------------ pose evaluation */
  pose(g, id, t) {
    const tr = g.tracks[id], c = g.cast[id], C = CAST[id], P = {};
    for (const k in tr) P[k] = tr[k].at(t);
    const s = c.s, flip = !!c.flip, seed = hash(id) % 97;
    // breathing / weight shift (slow, small)
    P.by = Math.sin(t * 1.55 + seed) * 1.6 / s + P.by; P.lean = P.lean + Math.sin(t * 0.7 + seed) * 0.0035;
    // gaze: eyes lead, head follows later and partially
    const base = { yaw: 0, pitch: P.pitch, roll: P.roll, lean: P.lean, shrug: P.shrug };
    const an = anchors(C, base);
    const ex = c.x + (flip ? -1 : 1) * an.head[0] * s, ey = c.y + an.head[1] * s;
    const tx = P.lx, ty = P.ly;
    let gx = clamp((tx - ex) / 340, -1, 1), gy = clamp((ty - ey) / 280, -1, 1) * 0.9;
    const t2 = t - 0.14, hx = clamp((tr.lx.at(t2) - ex) / 340, -1, 1), hy = clamp((tr.ly.at(t2) - ey) / 280, -1, 1);
    gx += Math.sin(t * 1.3 + seed) * 0.05 + Math.sin(t * 3.1 + seed * 2) * 0.02; gy += Math.sin(t * 1.1 + seed) * 0.03;
    const sgn = flip ? -1 : 1;
    P.gx = gx * sgn; P.gy = gy; P.yaw = clamp(P.yaw + hx * P.hf * 0.85, -1, 1) * sgn; P.pitch += hy * P.hf * 0.12; P.roll = P.roll * sgn;
    // blink
    P.blink = this.blinkAt(id, t, seed);
    // speech
    const L = this.talkLine(id, t);
    let o = 0, r = 0;
    if (L) { const f = (t - L.t0) * this.TL.env_hz, i = Math.floor(f), u = f - i, a = L.open, b = L.round; const get = (arr, j) => (arr[clamp(j, 0, arr.length - 1)] || 0) / 99; o = lerp(get(a, i), get(a, i + 1), u); r = lerp(get(b, i), get(b, i + 1), u); P.pitch += (o - 0.3) * 0.045; P.brow += o * 0.10; P.smile = lerp(P.smile, Math.max(P.smile * 0.6, 0.1), o); }
    P.open = Math.max(P.mo, o * 1.05); P.round = r;
    P.armL = { x: P.alx, y: P.aly, hand: P.alh, item: P.ali }; P.armR = { x: P.arx, y: P.ary, hand: P.arh, item: P.ari };
    return P;
  },
  talkLine(id, t) { const A = this.talk[id]; if (!A) return null; let lo = 0, hi = A.length - 1, k = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (A[m].t0 <= t) { k = m; lo = m + 1; } else hi = m - 1; } return k >= 0 && t <= A[k].t1 ? A[k] : null; },
  blinkAt(id, t, seed) {
    this._bl = this._bl || {}; let B = this._bl[id];
    if (!B) { const r = rng(seed * 7919 + 13); B = []; let x = 0.8 + r() * 1.5; while (x < this.duration + 5) { B.push(x); x += 2.1 + r() * 3.6; if (r() < 0.18) B.push(x + 0.28); } this._bl[id] = B; }
    let lo = 0, hi = B.length - 1, k = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (B[m] <= t) { k = m; lo = m + 1; } else hi = m - 1; }
    if (k < 0) return 0; const u = (t - B[k]) / 0.17; return u >= 1 ? 0 : Math.sin(u * Math.PI);
  },

  /* ------------------------------------------------------------ camera */
  camAt(g, t) { return { x: g.cam.x.at(t), y: g.cam.y.at(t), z: g.cam.z.at(t) }; },
  toScreen(cam, x, y) { return [VW / 2 + (x - cam.x) * cam.z, VH / 2 + (y - cam.y) * cam.z]; },

  /* ------------------------------------------------------------ render */
  groupAt(t) {
    const G = this.groups; let lo = 0, hi = G.length - 1, k = 0;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (G[m].t0 - 0.5 <= t) { k = m; lo = m + 1; } else hi = m - 1; }
    return k;
  },

  render(ctx, t) {
    ctx.setTransform(this.quality * this.baseScale, 0, 0, this.quality * this.baseScale, 0, 0);
    ctx.fillStyle = '#F4EEDF'; ctx.fillRect(0, 0, VW, VH);
    this.hot = [];
    const i = this.groupAt(t), g = this.groups[i], prev = i > 0 ? this.groups[i - 1] : null;
    const k = i === 0 ? smooth(0, 0.6, t) : smooth(g.t0 - 0.5, g.t0 - 0.05, t);
    const sameScene = prev && prev.scene === g.scene && prev.sceneKeep && g.sceneKeep;
    if (prev && k < 1 && !sameScene) { this.drawScene(ctx, prev, Math.min(t, prev.t1 + 0.4), 1); this.drawOverlay(ctx, prev, Math.min(t, prev.t1 + 0.4), 1 - k); }
    this.drawScene(ctx, g, t, sameScene ? 1 : k); this.drawOverlay(ctx, g, t, k);
    this.drawChrome(ctx, g, t, k);
  },

  drawScene(ctx, g, t, alpha) {
    if (alpha <= 0.002) return;
    const sc = getScene(g.scene), cam = this.camAt(g, t);
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.translate(VW / 2, VH / 2); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
    ctx.drawImage(sc.bg, -WORLD.ox, -WORLD.oy);
    const order = Object.keys(g.cast).sort((a, b) => (g.cast[a].z || 0) - (g.cast[b].z || 0));
    for (const id of order) {
      const c = g.cast[id]; if (c.hidden && c.hidden(t)) continue;
      const P = this.pose(g, id, t), sway = Math.sin(t * 1.2 + hash(id)) * 3 + (P.roll) * 30;
      drawFigure(ctx, id, P, c.x, c.y, c.s, !!c.flip, sway);
    }
    ctx.drawImage(sc.fg, -WORLD.ox, -WORLD.oy);
    if (g.world) g.world(ctx, g.S, t, cam);
    ctx.restore();
  },

  headScreen(g, id, t, cam) {
    const c = g.cast[id], P = this.pose(g, id, t), an = anchors(CAST[id], P), sg = c.flip ? -1 : 1;
    const wx = c.x + sg * an.head[0] * c.s + P.bx * c.s * 0, wy = c.y + an.head[1] * c.s;
    const s = this.toScreen(cam, wx, wy); return { x: s[0], y: s[1], r: HEAD_R[id] * c.s * cam.z };
  },

  drawOverlay(ctx, g, t, alpha) {
    if (alpha <= 0.002) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.save(); if (g.ui) g.ui(ctx, g.S, t, g); ctx.restore();
    const cam = this.camAt(g, t);
    for (const b of g.bubbles) {
      if (t < b.t0 || t > b.t1 + 0.3) continue;
      // fade when the same speaker's next bubble takes over
      let end = b.t1; for (const o of g.bubbles) if (o.who === b.who && o.t0 > b.t0 && o !== b) end = Math.min(end, o.t0 + 0.12);
      if (t > end + 0.3) continue;
      const pop = smooth(b.t0, b.t0 + 0.28, t), out = 1 - smooth(end, end + 0.28, t), a = pop * out; if (a <= 0.01) continue;
      const hs = this.headScreen(g, b.who, t, cam), dx = b.cx - hs.x, dy = b.cy - hs.y, L = Math.hypot(dx, dy) || 1;
      const stop = hs.r * 1.02 + 16, tip = [hs.x + dx / L * stop, hs.y + dy / L * stop];
      const sc = lerp(0.55, 1, E.back(clamp((t - b.t0) / 0.3)));
      const hi = {}; if (b.kind === 'dlg') { const p = clamp((t - b.line.t0 - 0.05) / Math.max(0.1, b.line.dur - 0.1)); const wi = wordAt(b.words, p); if (t < b.line.t1 + 0.05 && wi >= 0) hi[wi] = 'rgba(255,214,102,.78)'; }
      if (b.kind === 'thought') drawThought(ctx, b.B, b.cx, b.cy, tip, { alpha: a, scale: sc }); else drawBubble(ctx, b.B, b.cx, b.cy, tip, { alpha: a, scale: sc, hi });
    }
    ctx.restore();
  },

  /* captions (narrator phrases) + chapter chip + logo */
  drawChrome(ctx, g, t, k) {
    // chapter chip
    const ch = this.chapterOf[g.ch], blk = this.chapterBlocks[ch.idx];
    const cw = blk.w + 70, cx0 = 36, cy0 = 30;
    ctx.save(); ctx.globalAlpha = 0.97;
    pill(ctx, cx0, cy0, cw, blk.h + 26, '#0F2A4D'); ctx.fillStyle = COL.gold; ctx.beginPath(); ctx.arc(cx0 + 28, cy0 + (blk.h + 26) / 2, 9, 0, TAU); ctx.fill();
    blk.draw(ctx, cx0 + 50, cy0 + 12, { color: '#FFFFFF', ipaColor: 'rgba(207,227,255,.9)' }); ctx.restore();
    // logo
    if (!g.noLogo) {
      const im = this.assets.logoBlue; if (im) { const lw = 236, lh = lw * im.naturalHeight / im.naturalWidth, lx = VW - lw - 40, ly = 24;
        ctx.save(); withShadow(ctx, 'rgba(15,25,50,.22)', 12, 0, 5, () => { ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.beginPath(); rrect(ctx, lx - 14, ly - 6, lw + 28, lh + 12, 20); ctx.fill(); }); ctx.drawImage(im, lx, ly, lw, lh); ctx.restore(); }
    }
    // captions
    if (!this.captions) return;
    const ln = this.activeNarration(t); if (!ln) return;
    const ph = ln.phrases.find(p => t >= ln.t0 + p.t0 - 0.02 && t <= ln.t0 + p.t1 + 0.04); if (!ph) return;
    const blkc = capBlock(ph.text), a = smooth(ln.t0 + ph.t0 - 0.02, ln.t0 + ph.t0 + 0.12, t) * (1 - smooth(ln.t0 + ph.t1 - 0.05, ln.t0 + ph.t1 + 0.1, t));
    if (a <= 0.01) return;
    const w = blkc.w + 76, h = blkc.h + 30, x = VW / 2 - w / 2, y = 1038 - h;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(12,32,62,.90)'; ctx.beginPath(); rrect(ctx, x, y, w, h, 28); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
    blkc.draw(ctx, VW / 2 - blkc.w / 2, y + 12, { color: '#FFFFFF', ipaColor: '#BFD9FF' }); ctx.restore();
  },
  activeNarration(t) {
    this._nl = this._nl || this.TL.beats.flatMap(b => b.lines).filter(l => l.phrases && !l.nocap && l.kind !== 'ex').sort((a, b) => a.t0 - b.t0);
    const A = this._nl; let lo = 0, hi = A.length - 1, k = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (A[m].t0 <= t + 0.02) { k = m; lo = m + 1; } else hi = m - 1; }
    return k >= 0 && t <= A[k].t1 + 0.1 ? A[k] : null;
  },

  /* ------------------------------------------------------------ interaction */
  click(x, y) { for (const h of this.hot) if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) { h.fn(); return true; } return false; },
  cursorAt(x, y) { return this.hot.some(h => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h); },
};

const _cap = new Map();
function capBlock(txt) { let b = _cap.get(txt); if (!b) { b = T(txt, { size: 38, ipa: 23, weight: 500, maxW: 1500 }); _cap.set(txt, b); } return b; }
/* per-word timing weights for karaoke highlighting */
function wordWeights(tb) { const w = tb.L.units.map(u => 0.5 + u.word.length * 0.22 + (/[.!?]/.test(u.trail) ? 0.9 : /[,:;]/.test(u.trail) ? 0.35 : 0)); const s = w.reduce((a, b) => a + b, 0); let c = 0; return w.map(x => (c += x / s)); }
function wordAt(cum, p) { for (let i = 0; i < cum.length; i++) if (p <= cum[i]) return i; return cum.length - 1; }
