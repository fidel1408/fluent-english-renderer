/* lesson4.js — data-driven class activities for the one-hour lesson.
   build/activities.js (generated from tools/lesson_hour.py) describes each activity; this file turns it into groups.
   Types: info, table, choral, say, choose, fix, sort, pair, timer, skit.  Every word drawn here is a T() block, so it carries IPA. */
'use strict';
const FURN = new Set(['cafe', 'office', 'travel']);
const TRI = (a, b, c) => ({ [a]: { x: 300, y: 1010, s: 0.86 }, [b]: { x: 960, y: 990, s: 0.78, z: 1 }, [c]: { x: 1620, y: 1010, s: 0.86, flip: true } });
const lineOf = id => Eng.LINE[id];
const curIdx = (items, t) => { let k = -1; for (let i = 0; i < items.length; i++) if (t >= items[i].q0 - 0.35) k = i; return k; };
const lowerSet = arr => new Set((arr || []).map(w => w.toLowerCase()));
const unitSet = (tb, words) => { const w = lowerSet(words), out = new Set(); tb.L.units.forEach((u, i) => { if (w.has(u.word.toLowerCase())) out.add(i); }); return out; };
const sizeFor = (len, big = 112) => len <= 5 ? big : len <= 12 ? Math.round(big * 0.84) : len <= 24 ? Math.round(big * 0.64) : Math.round(big * 0.5);
const DARKGREEN = '#0A6B3D';
function sweepT(tb, t0, t1, t) { if (t < t0 || t > t1 + 0.05) return null; return { [wordAt(wordWeights(tb), clamp((t - t0) / Math.max(0.1, t1 - t0)))]: 'rgba(255,214,102,.7)' }; }

function dots(ctx, n, cur, cx, y) {
  const gap = 30, x0 = cx - (n - 1) * gap / 2;
  for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x0 + i * gap, y, i === cur ? 10 : 6.5, 0, TAU); ctx.fillStyle = i < cur ? COL.part : i === cur ? COL.gold : 'rgba(20,33,61,.2)'; ctx.fill(); if (i === cur) { ctx.strokeStyle = COL.navy; ctx.lineWidth = 2.5; ctx.stroke(); } }
}
function micIcon(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); rrect(ctx, -9, -24, 18, 32, 9); ctx.fill(); ctx.beginPath(); ctx.arc(0, -2, 16, 0.15, Math.PI - 0.15); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, 24); ctx.stroke(); ctx.restore();
}
function speakerIcon(ctx, x, y, s, t, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18, -8); ctx.lineTo(-8, -8); ctx.lineTo(8, -22); ctx.lineTo(8, 22); ctx.lineTo(-8, 8); ctx.lineTo(-18, 8); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 7 - i * 1.1)); ctx.beginPath(); ctx.arc(8, 0, 14 + i * 10, -0.8, 0.8); ctx.stroke(); }
  ctx.restore();
}
/* mic + countdown ring for "class speaks now" holds */
function speakRing(ctx, x, y, r, p, col = COL.part) { ring(ctx, x, y, r, 1 - p, col, 10); micIcon(ctx, x, y, r / 46, col); }

/* a card that always sits in the same place so the eye never has to search */
function cardBox(ctx, w, h, y, o = {}) { paper(ctx, 960 - w / 2, y, w, h, Object.assign({ color: COL.paper, r: 34 }, o)); }

const RENDER = {};

/* ================================================================ SAY IT: prompt -> class answers -> reveal */
RENDER.say = {
  build(a) {
    const S = { rib: Tx(a.title, 46, { weight: 700 }), lab: Tx(a.label || 'Say it', 34), items: [], pausePoints: [] };
    a.items.forEach((it, i) => {
      const q = lineOf(it.q), h = lineOf(it.h), an = lineOf(it.a);
      S.items.push(Object.assign({}, it, { q0: q.t0, h0: h.t0, h1: h.t1, a0: an.t0, a1: an.t1, p: Tx(it.prompt, sizeFor(it.prompt.length), { maxW: 930 }), r: Tx(it.answer, sizeFor(it.answer.length, 104), { maxW: 1100 }) }));
      S.pausePoints.push({ t: h.t0 + 0.2, label: a.title, kind: i === 0 ? 'round' : 'item' });
    });
    return S;
  },
  ui(ctx, S, t, g, a) {
    useRibbon(S, ctx, t, g, S.rib);
    const i = curIdx(S.items, t); if (i < 0) return; const it = S.items[i];
    const p = pr(t, it.q0 - 0.35, it.q0 + 0.1), pH = Math.max(230, it.p.h + 110), aH = Math.max(190, it.r.h + 90), y0 = 176, y1 = y0 + pH + 34;
    appear(ctx, p, () => {
      cardBox(ctx, 1200, pH, y0);
      pill(ctx, 390, y0 - 26, S.lab.w + 60, S.lab.h + 24, COL.part); S.lab.draw(ctx, 420, y0 - 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
      it.p.draw(ctx, 960 - it.p.w / 2, y0 + (pH - it.p.h) / 2 + 12, { hi: t >= it.q0 && t < it.h0 ? sweep(it.p, it.q, t) : null });
      if (t >= it.h0 - 0.05 && t < it.a0) speakRing(ctx, 1480, y0 + 62, 38, clamp((t - it.h0) / (it.h1 - it.h0)));
      const ap = pr(t, it.a0 - 0.05, it.a0 + 0.5, E.back);
      if (ap <= 0.01) { ctx.save(); ctx.strokeStyle = 'rgba(20,33,61,.25)'; ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.beginPath(); rrect(ctx, 360, y1, 1200, aH, 34); ctx.stroke(); ctx.restore(); }
      else { ctx.save(); ctx.globalAlpha *= clamp(ap); ctx.translate(0, (1 - clamp(ap)) * 24); paper(ctx, 360, y1, 1200, aH, { color: '#E4F6EC', r: 34, stroke: COL.ok, sw: 5 });
        it.r.draw(ctx, 960 - it.r.w / 2, y1 + (aH - it.r.h) / 2 + 2, { color: DARKGREEN, ipaColor: 'rgba(10,107,61,.85)', hi: sweep(it.r, it.a, t) }); checkBadge(ctx, 1540, y1 + 12, 34, true, 1, E.back(clamp(ap))); ctx.restore(); }
    }, 12);
    dots(ctx, S.items.length, i, 960, y1 + aH + 40);
  },
  pose(K, S, g, a) { const ids = Object.keys(g.cast); S.items.forEach(it => { ids.forEach((id, k) => { K[id].face(it.h0, 'thinking', 0.4); K[id].face(it.a0, 'happy', 0.4); if (k === 0) K[id].nod(it.a0 + 0.1); }); }); },
};

/* ================================================================ CHORAL: listen, then everyone repeats */
RENDER.choral = {
  build(a) {
    const S = { rib: Tx(a.title, 46, { weight: 700 }), listen: Tx('Listen', 36), you: Tx('Everyone', 36), items: [], pausePoints: [] };
    a.items.forEach((it, i) => {
      const m = lineOf(it.m), h = lineOf(it.h);
      S.items.push(Object.assign({}, it, { q0: m.t0, m1: m.t1, h0: h.t0, h1: h.t1, tb: Tx(it.text, sizeFor(it.text.length, 96), { maxW: 1240 }) }));
    });
    S.pausePoints.push({ t: S.items[0].q0 - 0.6, label: a.title, kind: 'round' });
    return S;
  },
  ui(ctx, S, t, g, a) {
    useRibbon(S, ctx, t, g, S.rib);
    const i = curIdx(S.items, t); if (i < 0) return; const it = S.items[i];
    const p = pr(t, it.q0 - 0.35, it.q0 + 0.15), H = Math.max(260, it.tb.h + 130), y0 = 220;
    appear(ctx, p, () => {
      cardBox(ctx, 1320, H, y0);
      hero(ctx, it.tb, 960 - it.tb.w / 2, y0 + (H - it.tb.h) / 2, it.roles || [], { hi: t < it.m1 + 0.1 ? sweep(it.tb, it.m, t) : null });
      const listening = t < it.m1 + 0.15, w = (listening ? S.listen : S.you);
      const pc = listening ? COL.subj : COL.part; pill(ctx, 960 - (w.w + 130) / 2, y0 + H + 22, w.w + 130, w.h + 26, pc);
      w.draw(ctx, 960 - w.w / 2 + 34, y0 + H + 35, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
      if (listening) speakerIcon(ctx, 960 - w.w / 2 - 28, y0 + H + 22 + (w.h + 26) / 2, 0.7, t, '#fff'); else micIcon(ctx, 960 - w.w / 2 - 28, y0 + H + 22 + (w.h + 26) / 2, 0.55, '#fff');
      if (t >= it.h0) ring(ctx, 1500, y0 + 64, 34, 1 - clamp((t - it.h0) / (it.h1 - it.h0)), COL.part, 10);
    }, 12);
    dots(ctx, S.items.length, i, 960, y0 + H + 158);
  },
  pose(K, S, g) { const ids = Object.keys(g.cast); S.items.forEach(it => { ids.forEach(id => { K[id].face(it.q0, 'warm', 0.3); }); if (it.who && K[it.who]) K[it.who].face(it.q0 - 0.05, 'happy', 0.3); ids.forEach(id => K[id].look(it.q0, it.who && g.cast[it.who] ? it.who : 'ui', 0.35)); K[ids[0]].look(it.m1 + 0.1, 'ui', 0.4); }); },
};

/* ================================================================ TABLE: rows spoken, then repeated */
RENDER.table = {
  build(a) {
    const S = { rib: Tx(a.title, 44, { weight: 700 }), cols: a.cols.map(c => Tx(c, 32)), rows: [], pausePoints: [] };
    const n = a.rows.length, size = n > 6 ? 44 : n > 4 ? 50 : 56;
    S.size = size; S.rowH = Math.min(118, Math.floor(610 / n));
    a.rows.forEach((r, i) => {
      const m = lineOf(r.line), h = r.hold ? lineOf(r.hold) : null;
      S.rows.push({ line: r.line, q0: m.t0, m1: m.t1, h0: h ? h.t0 : m.t1, h1: h ? h.t1 : m.t1 + 0.5, label: r.label, cells: r.cells.map(c => Tx(c, r.label ? size - 4 : size)) });
    });
    S.ipaLabel = a.rows.some(r => r.label);
    S.pausePoints.push({ t: S.rows[0].q0 - 0.5, label: a.title, kind: 'round' });
    return S;
  },
  ui(ctx, S, t, g, a) {
    useRibbon(S, ctx, t, g, S.rib);
    const p = pr(t, g.t0 - 0.1, g.t0 + 0.6, E.out); if (p <= 0.01) return;
    ctx.save(); ctx.globalAlpha *= p;
    const n = S.rows.length, x0 = 200, W = 1520, yH = 150, top = 300, hasLabel = S.ipaLabel;
    paper(ctx, x0, 140, W, 790, { color: COL.paper, r: 34 });
    const nc = a.cols.length, centers = hasLabel ? [380, 1180] : nc === 2 ? [610, 1270] : [520, 960, 1400];
    const hcol = hasLabel ? [COL.grey, COL.subj] : nc === 2 ? [COL.grey, COL.part] : [COL.grey, COL.subj, COL.part];
    if (!hasLabel && (a.emph === -1 || a.emph === nc - 1) || (a.emph !== undefined && a.emph >= 0)) { const e = a.emph >= 0 ? a.emph : nc - 1; ctx.fillStyle = COL.partL; ctx.beginPath(); rrect(ctx, centers[e] - 195, 160, 390, 755, 26); ctx.fill(); }
    a.cols.forEach((c, k) => { const b = S.cols[k], w = b.w + 56; pill(ctx, centers[k] - w / 2, 168, w, b.h + 22, hcol[k] || COL.grey); b.draw(ctx, centers[k] - b.w / 2, 178, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
    S.rows.forEach((r, i) => {
      const ra = pr(t, r.q0 - 0.15, r.q0 + 0.3, E.out); if (ra <= 0.01) return; const y = top + i * S.rowH;
      const active = t >= r.q0 - 0.05 && t < r.h1;
      appear(ctx, ra, () => {
        if (active) { ctx.fillStyle = 'rgba(255,214,102,.38)'; ctx.beginPath(); rrect(ctx, x0 + 20, y - 8, W - 40, S.rowH - 6, 22); ctx.fill(); }
        if (r.label) {
          ctx.save(); ctx.fillStyle = COL.subj; ctx.font = `700 ${S.size + 8}px "FEIPA", sans-serif`; ctx.textAlign = 'center'; ctx.fillText(r.label, centers[0], y + S.rowH * 0.56); ctx.restore();
          const k = r.cells.length, xs0 = 700, xs1 = 1640; r.cells.forEach((b, j) => b.draw(ctx, xs0 + (xs1 - xs0) * (j + 0.5) / k - b.w / 2, y, { hi: t >= r.q0 && t < r.m1 ? null : null }));
        } else r.cells.forEach((b, j) => b.draw(ctx, centers[j] - b.w / 2, y, { color: (nc > 1 && j === nc - 1 && (a.emph === -1 || a.emph === j)) ? '#0A6B54' : COL.ink }));
        if (t >= r.h0 && t < r.h1) speakRing(ctx, 1655, y + S.rowH * 0.42, 24, clamp((t - r.h0) / (r.h1 - r.h0)));
        else if (t >= r.q0 && t < r.m1) speakerIcon(ctx, 1655, y + S.rowH * 0.42, 0.55, t, COL.subj);
      }, 8);
    });
    ctx.restore();
  },
  pose(K, S, g) { const ids = Object.keys(g.cast); S.rows.forEach((r, i) => { K[ids[i % ids.length]].nod(r.q0 + 0.2, 1, 0.06); }); },
};

/* ================================================================ INFO: rows revealed as they are explained */
RENDER.info = {
  build(a) {
    const S = { rib: Tx(a.title, 46, { weight: 700 }), rows: [], pausePoints: [] }, n = a.rows.length, PAD = 44, GAP = 18;
    let size = n >= 5 ? 44 : n === 4 ? 50 : 56, tot;
    do {
      S.rows = []; let lastT = null;
      a.rows.forEach(r => {
        const ln = r.line ? lineOf(r.line) : null; const q0 = ln ? ln.t0 : (lastT === null ? Eng.BEAT[a.beat].t0 : lastT); lastT = q0;
        S.rows.push({ q0, q1: ln ? ln.t1 : q0 + 3, tb: Tx(r.text, size, { maxW: 1300 }), roles: r.roles || [] });
      });
      tot = S.rows.reduce((x, r) => x + r.tb.h + PAD + GAP, -GAP); size -= 3;
    } while (tot > 730 && size > 28);
    S.PAD = PAD; S.GAP = GAP; S.tot = tot;
    return S;
  },
  ui(ctx, S, t, g, a) {
    useRibbon(S, ctx, t, g, S.rib);
    let y = 160 + Math.max(0, (740 - S.tot) / 2);
    S.rows.forEach((r, i) => {
      const h = r.tb.h + S.PAD, ra = pr(t, r.q0 - 0.15, r.q0 + 0.4, E.back); const yy = y; y += h + S.GAP; if (ra <= 0.01) return;
      appear(ctx, clamp(ra), () => {
        const w = Math.max(r.tb.w + 120, 620), x = 960 - w / 2; const active = t >= r.q0 - 0.05 && t < r.q1 + 0.4;
        tape(ctx, x, yy, w, h, [COL.partL, COL.subjL, COL.auxL, COL.timeL][i % 4], (i % 2 ? 1 : -1) * 0.004);
        if (active) { ctx.strokeStyle = 'rgba(255,196,60,.95)'; ctx.lineWidth = 6; ctx.beginPath(); rrect(ctx, x - 10, yy - 8, w + 20, h + 16, 18); ctx.stroke(); }
        hero(ctx, r.tb, 960 - r.tb.w / 2, yy + S.PAD / 2, r.roles, { hi: active && t < r.q1 ? sweepT(r.tb, r.q0, r.q1, t) : null });
      }, 14);
    });
  },
  pose(K, S, g) { const ids = Object.keys(g.cast); S.rows.forEach((r, i) => K[ids[i % ids.length]].nod(r.q0 + 0.4, 1, 0.07)); },
};

/* ================================================================ CHOOSE: clickable multiple choice, one item per question */
const TxE = (s, size, o) => (s && s.trim() ? Tx(s, size, o) : null);
RENDER.choose = {
  build(a) {
    const S = { title: Tx(a.title, 46, { serif: true, weight: 700 }), think: Tx('Think', 32), items: [], pick: [], pausePoints: [] };
    a.items.forEach((it, i) => {
      const q = lineOf(it.q), h = lineOf(it.h), an = lineOf(it.a), n = it.options.length;
      const o = { q0: q.t0, q1: q.t1, qd: q.dur, h0: h.t0, h1: h.t1, a0: an.t0, correct: it.correct, n, stemMode: !!it.stem };
      if (it.stem) {
        o.stem = Tx(it.stem, 44, { maxW: 1100, weight: 600 }); o.opts = it.options.map(x => Tx(x, 40, { maxW: 1000 }));
        o.bh = Math.max(...o.opts.map(b => b.h)) + 40; o.bw = 1120;
      } else {
        const k = it.context ? 0.86 : 1, z = Math.round(60 * k);
        o.ctxT = TxE(it.context, 40, { maxW: 1100 }); o.opts = it.options.map(x => Tx(x, Math.round(58 * k), { weight: 700 }));
        o.slotW = Math.max(...o.opts.map(b => b.w)) + 70;
        let zz = z; do { o.before = TxE(it.before, zz); o.after = TxE(it.after, zz); zz -= 2; } while (((o.before ? o.before.w + 20 : 0) + (o.after ? o.after.w + 20 : 0) + o.slotW + 40 > 1130) && zz > 30);
        o.bw = n === 3 ? 360 : 450; o.bh = Math.round(150 * k); o.k = k;
      }
      o.why = Tx(it.why, 34, { maxW: 1180 });
      o.contentH = o.stemMode ? 92 + o.stem.h + 26 + n * (o.bh + 18) + 4 + o.why.h + 22 + 40
        : 92 + (o.ctxT ? o.ctxT.h + 34 : 0) + 14 + (o.before || o.after || o.opts[0]).h + 40 + o.bh + 26 + o.why.h + 22 + 40;
      S.items.push(o); S.pick.push(null);
      S.pausePoints.push({ t: h.t0 + 0.15, id: a.id + '#' + i, label: a.title, kind: i === 0 ? 'round' : 'item' });
    });
    S.dotsN = a.items.length; S.cardH = Math.min(740, Math.max(...S.items.map(o => o.contentH)));
    return S;
  },
  ui(ctx, S, t, g, a) {
    const i = curIdx(S.items, t); if (i < 0) return; const o = S.items[i];
    const cardX = 320, cardW = 1280, cardY = 150, cardH = S.cardH, cx = 960;
    if (t < o.q0 - 2) S.pick[i] = null;
    const pc = pr(t, o.q0 - 0.35, o.q0 + 0.3, E.back); if (pc <= 0.01) return;
    const pk = S.pick[i], revealed = t >= o.a0 - 0.05, rp = pr(t, o.a0 - 0.05, o.a0 + 0.5, E.back);
    ctx.save(); ctx.globalAlpha *= clamp(pc); ctx.translate(0, (1 - clamp(pc)) * 36);
    paper(ctx, cardX, cardY, cardW, cardH, { color: COL.paper, r: 40 });
    const tw = S.title.w + 150, bh0 = S.title.h + 44; banner(ctx, cx, cardY + 2, tw, bh0, COL.time); S.title.draw(ctx, cx - S.title.w / 2, cardY + 2 - S.title.h / 2 - 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.85)' });
    let y0 = cardY + 92;
    const readT0 = o.q0 + o.qd * (o.stemMode ? 0.4 : 0.55), readIdx = t >= readT0 && t <= o.q1 + 0.05 ? Math.min(o.n - 1, Math.floor(clamp((t - readT0) / (o.q1 - readT0)) * o.n)) : -1;
    S.hot = [];
    const hotAdd = k => { if (!revealed && t >= o.q0 + 1.2) return true; return false; };
    const drawOpt = (k, x, by, w, h, r) => {
      const ok = k === o.correct; let fill = '#FFFFFF', stroke = COL.navy, dim = 1, txt = COL.ink;
      if (revealed) { if (ok) { fill = '#DDF5E8'; stroke = COL.ok; txt = DARKGREEN; } else dim = 1 - 0.45 * rp; } else if (pk === k) { fill = '#E3ECFB'; stroke = COL.subj; }
      const ap = pr(t, o.q0 + 0.7 + k * 0.16, o.q0 + 1.3 + k * 0.16, E.back); if (ap <= 0.01) return;
      ctx.save(); ctx.globalAlpha *= clamp(ap) * dim; ctx.translate(0, (1 - clamp(ap)) * 28 - (revealed && ok ? 8 * rp : 0));
      const hover = !revealed && readIdx === k;
      withShadow(ctx, 'rgba(15,25,50,.22)', 14, 0, 8, () => { ctx.fillStyle = fill; ctx.beginPath(); rrect(ctx, x, by, w, h, r); ctx.fill(); });
      ctx.lineWidth = hover || pk === k || (revealed && ok) ? 7 : 4; ctx.strokeStyle = hover ? COL.gold : stroke; ctx.stroke();
      o.opts[k].draw(ctx, x + w / 2 - o.opts[k].w / 2, by + h / 2 - o.opts[k].h / 2 - 2, { color: txt, ipaColor: revealed && ok ? 'rgba(10,107,61,.85)' : 'rgba(20,33,61,.72)' });
      ctx.restore();
      if (revealed) { if (ok) checkBadge(ctx, x + w - 22, by + 6 - 8 * rp, 32, true, rp, E.back(clamp(rp))); else if (pk === k) checkBadge(ctx, x + w - 22, by + 6, 32, false, rp, E.back(clamp(rp))); }
      if (hotAdd(k)) Eng.hot.push({ x, y: by, w, h, fn: () => { S.pick[i] = k; Eng.onPick && Eng.onPick(a.id + '#' + i, k); } });
    };
    let endY;
    if (o.stemMode) {
      appear(ctx, 1, () => o.stem.draw(ctx, cx - o.stem.w / 2, y0 + 4, { color: COL.ink }));
      y0 += o.stem.h + 26;
      for (let k = 0; k < o.n; k++) { const by = y0 + k * (o.bh + 18); drawOpt(k, cx - o.bw / 2, by, o.bw, o.bh, 30); }
      endY = y0 + o.n * (o.bh + 18) + 4;
    } else {
      if (o.ctxT) { const w = o.ctxT.w + 70; tape(ctx, cx - w / 2, y0 - 8, w, o.ctxT.h + 26, COL.timeL, -0.004); o.ctxT.draw(ctx, cx - o.ctxT.w / 2, y0 + 3, { color: COL.time, ipaColor: 'rgba(122,71,204,.85)' }); y0 += o.ctxT.h + 34; }
      const bW = o.before ? o.before.w + 20 : 0, aW = o.after ? o.after.w + 20 : 0, totW = bW + o.slotW + aW, sx = cx - totW / 2, sy = y0 + 14, hh = (o.before || o.after || o.opts[0]).h;
      if (o.before) o.before.draw(ctx, sx, sy);
      const slotX = sx + bW, slotY = sy + 4, slotH = hh + 6, shown = revealed ? o.correct : pk;
      ctx.save(); ctx.fillStyle = revealed ? 'rgba(30,158,90,.12)' : 'rgba(122,71,204,.07)'; ctx.beginPath(); rrect(ctx, slotX, slotY, o.slotW, slotH, 20); ctx.fill();
      ctx.strokeStyle = revealed ? COL.ok : COL.time; ctx.lineWidth = 4; ctx.setLineDash(revealed ? [] : [14, 10]); ctx.stroke(); ctx.setLineDash([]);
      if (shown !== null && shown !== undefined) { const ob = o.opts[shown]; ob.draw(ctx, slotX + o.slotW / 2 - ob.w / 2, sy + 2, { color: revealed ? COL.ok : COL.time, ipaColor: revealed ? 'rgba(30,158,90,.8)' : 'rgba(122,71,204,.8)' }); }
      ctx.restore();
      if (o.after) o.after.draw(ctx, slotX + o.slotW + 20, sy);
      const by = sy + hh + 40, tot = o.n * o.bw + (o.n - 1) * 40, bx0 = cx - tot / 2;
      for (let k = 0; k < o.n; k++) drawOpt(k, bx0 + k * (o.bw + 40), by, o.bw, o.bh, 34);
      endY = by + o.bh + 26;
    }
    if (t >= o.h0 - 0.05 && t < o.a0) {
      const p = clamp((t - o.h0) / (o.h1 - o.h0)), by2 = cardY + cardH - 62; ring(ctx, cardX + cardW - 70, by2, 34, 1 - p, COL.time, 10);
      appear(ctx, pr(t, o.h0, o.h0 + 0.4), () => { pill(ctx, cardX + 36, by2 - 33, S.think.w + 56, S.think.h + 22, COL.time); S.think.draw(ctx, cardX + 64, by2 - 23, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); }, 8);
    }
    if (revealed) appear(ctx, pr(t, o.a0 + 0.2, o.a0 + 0.8), () => { const w = o.why.w + 90; tape(ctx, cx - w / 2, endY, w, o.why.h + 22, COL.partL, -0.004); o.why.draw(ctx, cx - o.why.w / 2, endY + 10, { color: COL.ink }); }, 12);
    ctx.restore();
    dots(ctx, S.dotsN, i, 960, cardY + cardH + 34);
  },
  pose(K, S, g, a) {
    const ids = Object.keys(g.cast);
    S.items.forEach((o, i) => {
      ids.forEach((id, k) => { K[id].look(o.q0 - 0.2, 'ui', 0.3); K[id].face(o.q0, 'curious', 0.4); K[id].face(o.h0, 'thinking', 0.5); K[id].face(o.a0, 'happy', 0.4); });
      K[ids[0]].nod(o.a0 + 0.3); K[ids[1]].nod(o.a0 + 0.7, 1, 0.07); K[ids[0]].set(o.h0, { roll: 0.05 }, 0.8); K[ids[0]].set(o.a0, { roll: 0 }, 0.5);
    });
  },
};

/* ================================================================ FIX: find the mistake */
RENDER.fix = {
  build(a) {
    const S = { lab: Tx('Find the mistake', 34), items: [], pausePoints: [] };
    a.items.forEach((it, i) => {
      const q = lineOf(it.q), h = lineOf(it.h), an = lineOf(it.a), big = Math.min(sizeFor(it.wrong.length, 88), 84);
      const wr = Tx(it.wrong, big, { maxW: 1250 }), rt = Tx(it.right, big, { maxW: 1250 });
      S.items.push({ q0: q.t0, q1: q.t1, h0: h.t0, h1: h.t1, a0: an.t0, a1: an.t1, wr, rt, why: Tx(it.why, 36, { maxW: 1200 }), strike: unitSet(wr, it.strike), mark: unitSet(rt, it.mark) });
      S.pausePoints.push({ t: h.t0 + 0.15, label: a.title, kind: i === 0 ? 'round' : 'item' });
    });
    return S;
  },
  ui(ctx, S, t, g, a) {
    const i = curIdx(S.items, t); if (i < 0) return; const o = S.items[i];
    const pc = pr(t, o.q0 - 0.35, o.q0 + 0.3, E.back); if (pc <= 0.01) return;
    const rev = t >= o.a0 - 0.05, rp = pr(t, o.a0 - 0.05, o.a0 + 0.55, E.back);
    const Hw = Math.max(230, o.wr.h + 120), Hr = Math.max(200, o.rt.h + 84), y0 = 190, y1 = y0 + Hw + 30;
    ctx.save(); ctx.globalAlpha *= clamp(pc); ctx.translate(0, (1 - clamp(pc)) * 34);
    paper(ctx, 280, y0, 1360, Hw, { color: COL.paper, r: 36, stroke: rev ? 'rgba(214,69,80,.55)' : null, sw: 4 });
    pill(ctx, 340, y0 - 26, S.lab.w + 60, S.lab.h + 24, COL.not); S.lab.draw(ctx, 370, y0 - 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
    o.wr.draw(ctx, 960 - o.wr.w / 2, y0 + (Hw - o.wr.h) / 2 + 18, { color: i2 => (rev && o.strike.has(i2)) ? COL.bad : COL.ink, strike: rev ? o.strike : null, hi: t >= o.q0 && t < o.h0 ? sweepT(o.wr, o.q0 + 0.9, o.q1, t) : null });
    if (t >= o.h0 - 0.05 && t < o.a0) ring(ctx, 1560, y0 + 66, 34, 1 - clamp((t - o.h0) / (o.h1 - o.h0)), COL.not, 10);
    if (!rev) { ctx.save(); ctx.strokeStyle = 'rgba(20,33,61,.22)'; ctx.setLineDash([16, 12]); ctx.lineWidth = 4; ctx.beginPath(); rrect(ctx, 280, y1, 1360, Hr, 36); ctx.stroke(); ctx.restore(); }
    else {
      ctx.save(); ctx.globalAlpha *= clamp(rp); ctx.translate(0, (1 - clamp(rp)) * 26);
      paper(ctx, 280, y1, 1360, Hr, { color: '#E4F6EC', r: 36, stroke: COL.ok, sw: 5 });
      o.rt.draw(ctx, 960 - o.rt.w / 2, y1 + (Hr - o.rt.h) / 2 + 4, { color: i2 => o.mark.has(i2) ? DARKGREEN : COL.ink, ipaColor: i2 => o.mark.has(i2) ? 'rgba(10,107,61,.85)' : 'rgba(20,33,61,.72)', hi: sweepT(o.rt, o.a0 + 0.4, o.a1, t) });
      checkBadge(ctx, 1600, y1 + 12, 34, true, 1, E.back(clamp(rp))); ctx.restore();
      appear(ctx, pr(t, o.a0 + 1.0, o.a0 + 1.6), () => { const w = o.why.w + 90; tape(ctx, 960 - w / 2, y1 + Hr + 20, w, o.why.h + 22, COL.partL, -0.004); o.why.draw(ctx, 960 - o.why.w / 2, y1 + Hr + 30, { color: COL.ink }); }, 10);
    }
    ctx.restore();
    dots(ctx, S.items.length, i, 960, 900);
  },
  pose(K, S, g) { const ids = Object.keys(g.cast); S.items.forEach(o => { ids.forEach(id => { K[id].look(o.q0 - 0.2, 'ui', 0.3); K[id].face(o.h0, 'thinking', 0.5); K[id].face(o.a0, 'happy', 0.4); }); K[ids[0]].nod(o.a0 + 0.3); K[ids[1]].shake(o.q0 + 0.6, 1, 0.25); }); },
};

/* ================================================================ SORT: two bins, one item at a time */
RENDER.sort = {
  build(a) {
    const S = { lab: Tx('Sort it', 34), bins: a.bins.map(b => Tx(b, b.length > 8 ? 52 : 80, { serif: true, weight: 700, ipa: b.length > 8 ? 26 : 34 })), single: a.items.some(it => it.text.length > 14), items: [], pick: [], pausePoints: [] };
    const cnt = [0, 0];
    a.items.forEach((it, i) => {
      const q = lineOf(it.q), h = lineOf(it.h), an = lineOf(it.a);
      S.items.push({ bin: it.bin, slot: cnt[it.bin]++, q0: q.t0, h0: h.t0, h1: h.t1, a0: an.t0, tb: Tx(it.text, sizeFor(it.text.length, 92), { maxW: 900 }), chip: Tx(it.text, a.items.some(x => x.text.length > 14) ? 28 : 26) });
      S.pick.push(null); S.pausePoints.push({ t: h.t0 + 0.15, id: a.id + '#' + i, label: a.title, kind: i === 0 ? 'round' : 'item' });
    });
    return S;
  },
  ui(ctx, S, t, g, a) {
    const i = curIdx(S.items, t), bx = [320, 960], bw = 640, by = 520, bh = 390, binCol = [COL.subj, COL.time], binTint = [COL.subjL, COL.timeL];
    const pb = pr(t, g.t0 - 0.1, g.t0 + 0.7, E.back); if (pb <= 0.01) return;
    const o = i >= 0 ? S.items[i] : null; const rev = o && t >= o.a0 - 0.05, rp = o ? pr(t, o.a0 - 0.05, o.a0 + 0.5, E.back) : 0;
    if (o && t < o.q0 - 2) S.pick[i] = null;
    ctx.save(); ctx.globalAlpha *= clamp(pb); S.hot = [];
    for (let b = 0; b < 2; b++) {
      const good = rev && o.bin === b, bad = rev && S.pick[i] === b && o.bin !== b;
      paper(ctx, bx[b], by, bw, bh, { color: good ? '#E4F6EC' : COL.paper, r: 34, stroke: good ? COL.ok : bad ? COL.bad : binCol[b], sw: good || bad ? 7 : 4 });
      const lw = S.bins[b].w + 90; banner(ctx, bx[b] + bw / 2, by + 2, lw, S.bins[b].h + 36, binCol[b]); S.bins[b].draw(ctx, bx[b] + bw / 2 - S.bins[b].w / 2, by + 2 - S.bins[b].h / 2 - 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.88)' });
      if (good) checkBadge(ctx, bx[b] + bw - 34, by + 38, 30, true, rp, E.back(clamp(rp))); else if (bad) checkBadge(ctx, bx[b] + bw - 34, by + 38, 30, false, rp, E.back(clamp(rp)));
      if (o && !rev && t >= o.q0 + 0.2) Eng.hot.push({ x: bx[b], y: by, w: bw, h: bh, fn: () => { S.pick[i] = b; Eng.onPick && Eng.onPick(a.id + '#' + i, b); } });
    }
    // chips already sorted
    S.items.forEach((c, j) => {
      const done = t >= c.a0 + 0.3 && (j < i || j === i || t >= c.a0 + 0.3); if (!done) return;
      const p = pr(t, c.a0 + 0.3, c.a0 + 0.75, E.back), col = S.single ? 0 : c.slot % 2, row = S.single ? c.slot : Math.floor(c.slot / 2), x = bx[c.bin] + (S.single ? 36 : 22) + col * 300, y = by + (S.single ? 118 : 132) + row * (S.single ? 66 : 78), cw = S.single ? 568 : 288;
      ctx.save(); ctx.globalAlpha *= clamp(p); ctx.translate(x + cw / 2, y + 31); ctx.scale(lerp(0.7, 1, clamp(p)), lerp(0.7, 1, clamp(p))); ctx.translate(-cw / 2, -31);
      ctx.fillStyle = binTint[c.bin]; ctx.beginPath(); rrect(ctx, 0, 0, cw, 62, 18); ctx.fill(); const cs = Math.min(1, (cw - 18) / c.chip.w); ctx.translate(cw / 2, 31); ctx.scale(cs, cs); c.chip.draw(ctx, -c.chip.w / 2, -c.chip.h / 2 + 2, { color: COL.ink }); ctx.restore();
    });
    if (o) {
      const pc = pr(t, o.q0 - 0.35, o.q0 + 0.25, E.back), H = Math.max(190, o.tb.h + 56), y0 = 170;
      appear(ctx, pc, () => {
        paper(ctx, 960 - 520, y0, 1040, H, { color: COL.paper, r: 34 });
        pill(ctx, 960 - 520 + 40, y0 - 26, S.lab.w + 60, S.lab.h + 24, COL.part); S.lab.draw(ctx, 960 - 520 + 70, y0 - 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
        o.tb.draw(ctx, 960 - o.tb.w / 2, y0 + (H - o.tb.h) / 2 + 2, { hi: t >= o.q0 && t < o.h0 ? sweepT(o.tb, o.q0, o.q0 + 1.0, t) : null, color: rev ? (S.pick[i] === o.bin || S.pick[i] === null ? COL.ink : COL.ink) : COL.ink });
        if (t >= o.h0 - 0.05 && t < o.a0) ring(ctx, 960 + 440, y0 + 52, 32, 1 - clamp((t - o.h0) / (o.h1 - o.h0)), COL.part, 10);
      }, 14);
    }
    ctx.restore();
    dots(ctx, S.items.length, i, 960, by + bh + 38);
  },
  pose(K, S, g) { const ids = Object.keys(g.cast); S.items.forEach(o => { ids.forEach((id, k) => { K[id].look(o.q0 - 0.2, 'ui', 0.3); K[id].face(o.h0, 'thinking', 0.4); K[id].face(o.a0, 'happy', 0.4); }); K[ids[0]].nod(o.a0 + 0.2, 1, 0.07); }); },
};

/* ================================================================ PAIR WORK: countdown ring + prompt tiles, role swap at half time */
function personIcon(ctx, x, y, s, col) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -12, 11, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-18, 20); ctx.quadraticCurveTo(-18, -2, 0, -2); ctx.quadraticCurveTo(18, -2, 18, 20); ctx.closePath(); ctx.fill(); ctx.restore(); }
const mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
RENDER.pair = {
  build(a) {
    const S = { lab: Tx(a.title, 40, { weight: 700 }), roles: a.roles.map(r => Tx(r, 38, { weight: 600 })), sw: Tx('Switch roles!', 64, { serif: true, weight: 700, ipa: 28 }), pausePoints: [] };
    S.stem = a.stem ? Tx(a.stem, 64, { serif: true, weight: 700, ipa: 28 }) : null;
    const n = a.prompts.length, rows = Math.ceil(n / 2), availH = S.stem ? 360 : 470; let sz = 54;
    do { S.tiles = a.prompts.map(p => Tx(p, sz, { maxW: 560 })); S.rowH = []; for (let r = 0; r < rows; r++) S.rowH.push(Math.max(...[S.tiles[r * 2], S.tiles[r * 2 + 1]].filter(Boolean).map(b => b.h)) + 26); sz -= 2; } while (S.rowH.reduce((x, y) => x + y, 0) + (rows - 1) * 14 > availH && sz > 24);
    S.availH = availH; S.totH = S.rowH.reduce((x, y) => x + y, 0) + (rows - 1) * 14;
    const h1 = lineOf(a.h1), sw = lineOf(a.sw), h2 = lineOf(a.h2);
    Object.assign(S, { h0: h1.t0, hm: sw.t0, hs: sw.t1, h2: h2.t1, i0: lineOf(Eng.BEAT[a.beat].lines[0].id).t0 });
    return S;
  },
  ui(ctx, S, t, g, a) {
    const p = pr(t, g.t0 - 0.1, g.t0 + 0.7, E.back); if (p <= 0.01) return;
    const x0 = 270, W = 1380, y0 = 150, H = 740, tot = S.h2 - S.h0, el = clamp(t - S.h0, 0, tot);
    ctx.save(); ctx.globalAlpha *= clamp(p); ctx.translate(0, (1 - clamp(p)) * 30);
    paper(ctx, x0, y0, W, H, { color: COL.paper, r: 40 });
    const lw = S.lab.w + 150; banner(ctx, 960, y0 + 2, lw, S.lab.h + 44, COL.navy); S.lab.draw(ctx, 960 - S.lab.w / 2, y0 + 2 - S.lab.h / 2 - 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.88)' });
    const phase = t >= S.hm - 0.01 ? 1 : 0, running = t >= S.h0 - 0.05 && t <= S.h2 + 0.3;
    // role pills (swap)
    for (let k = 0; k < 2; k++) { const r = S.roles[(k + phase) % 2], w = r.w + 120, x = x0 + 56 + k * 360, y = y0 + 84, col = k ? '#D98324' : COL.subj; pill(ctx, x, y, w, r.h + 28, col); personIcon(ctx, x + 40, y + (r.h + 28) / 2 + 4, 0.9, '#fff'); r.draw(ctx, x + 76, y + 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); }
    // countdown ring + digits
    const rx = x0 + W - 112, ry = y0 + 124;
    ring(ctx, rx, ry, 56, running ? 1 - el / tot : 1, phase ? '#D98324' : COL.subj, 14);
    ctx.save(); ctx.fillStyle = COL.navy; ctx.font = '700 38px "Lexend", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(mmss(running ? tot - el : tot), rx, ry + 2); ctx.restore();
    // stem
    let y = y0 + 190 + (S.stem ? 0 : 6);
    if (S.stem) { S.stem.draw(ctx, 960 - S.stem.w / 2 - 80, y); y += S.stem.h + 16; }
    // prompt tiles
    const colW = 640; let yy = y + 6 + Math.max(0, (S.availH - S.totH) / 2);
    for (let r = 0; r < S.rowH.length; r++) { for (let c = 0; c < 2; c++) { const tb = S.tiles[r * 2 + c]; if (!tb) continue; const ta = pr(t, g.t0 + 0.5 + (r * 2 + c) * 0.12, g.t0 + 1.0 + (r * 2 + c) * 0.12, E.back); appear(ctx, clamp(ta), () => { const x = 960 - colW + c * colW + 20; tape(ctx, x, yy, colW - 40, S.rowH[r] - 8, [COL.subjL, COL.partL, COL.timeL, COL.auxL][(r + c) % 4], (c ? 1 : -1) * 0.004); tb.draw(ctx, x + (colW - 40) / 2 - tb.w / 2, yy + (S.rowH[r] - 8) / 2 - tb.h / 2, { color: COL.ink }); }, 14); } yy += S.rowH[r] + 14; }
    // switch flash
    const f = pr(t, S.hm - 0.1, S.hm + 0.35, E.back) * (1 - pr(t, S.hs + 1.6, S.hs + 2.1));
    if (f > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(f); const w = S.sw.w + 160, h = S.sw.h + 70; banner(ctx, 960, 540, w, h, '#D98324'); S.sw.draw(ctx, 960 - S.sw.w / 2, 540 - S.sw.h / 2 - 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); ctx.restore(); }
    ctx.restore();
  },
  pose(K, S, g, a) {
    const [A, B] = Object.keys(g.cast); const tot = S.h2 - S.h0;
    K[A].look(0.01, B, 0.2); K[B].look(0.01, A, 0.2); K[A].face(0.01, 'warm'); K[B].face(0.01, 'warm');
    for (let x = S.h0 + 2; x < S.h2 - 1; x += 7) { const sp = Math.floor((x - S.h0) / 7) % 2 ? B : A, ot = sp === A ? B : A; K[sp].gesture(x, x + 2.2, 'R', 'open'); K[ot].nod(x + 1.4, 1, 0.07); }
  },
};

/* ================================================================ TIMER: one timed speaking moment */
RENDER.timer = {
  build(a) {
    const h = lineOf(a.h), S = { lab: Tx('Speak now', 40, { weight: 700 }), tb: Tx(a.prompt, sizeFor(a.prompt.length, 84), { maxW: 1200 }), h0: h.t0, h1: h.t1, pausePoints: [] };
    return S;
  },
  ui(ctx, S, t, g, a) {
    const p = pr(t, S.h0 - 0.3, S.h0 + 0.4, E.back); if (p <= 0.01) return;
    const H = Math.max(360, S.tb.h + 190), y0 = 230, tot = S.h1 - S.h0, el = clamp(t - S.h0, 0, tot), run = t >= S.h0 - 0.02 && t <= S.h1 + 0.2;
    ctx.save(); ctx.globalAlpha *= clamp(p); ctx.translate(0, (1 - clamp(p)) * 30);
    paper(ctx, 300, y0, 1320, H, { color: COL.paper, r: 40 });
    const lw = S.lab.w + 150; banner(ctx, 960, y0 + 2, lw, S.lab.h + 44, COL.part); S.lab.draw(ctx, 960 - S.lab.w / 2, y0 + 2 - S.lab.h / 2 - 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.88)' });
    S.tb.draw(ctx, 960 - S.tb.w / 2 - 40, y0 + 78 + (H - 78 - S.tb.h) / 2 - 20, { color: COL.ink });
    speakRing(ctx, 1500, y0 + H / 2 + 20, 70, run ? el / tot : 0);
    ctx.save(); ctx.fillStyle = COL.navy; ctx.font = '700 40px "Lexend", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(mmss(run ? tot - el : tot), 1500, y0 + H / 2 + 20 + 120); ctx.restore();
    ctx.restore();
  },
  pose(K, S, g) { const ids = Object.keys(g.cast); ids.forEach(id => { K[id].look(S.h0 - 0.2, 'ui', 0.3); K[id].face(S.h0, 'warm', 0.5); }); K[ids[0]].nod(S.h0 + 1); },
};

/* ================================================================ SKIT: characters speak in bubbles */
RENDER.skit = {
  build(a) { return { rib: Tx('Listen to the dialogue', 40, { weight: 700 }), pausePoints: [] }; },
  ui(ctx, S, t, g) { useRibbon(S, ctx, t, g, S.rib); },
  pose(K, S, g, a) {
    const ids = Object.keys(g.cast), L = Eng.BEAT[a.beat].lines.filter(l => l.kind === 'dlg');
    ids.forEach(id => { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); });
    L.forEach((l, k) => {
      ids.forEach(id => { if (id === l.who) { const other = ids.find(o => o !== id && L[k + 1] && L[k + 1].who === o) || ids.find(o => o !== id); K[id].look(l.t0 - 0.05, other, 0.3, 0.7); K[id].face(l.t0, 'happy', 0.3); } else { K[id].look(l.t0 - 0.1, l.who, 0.3, 0.7); K[id].face(l.t0 + 0.2, 'warm', 0.4); K[id].nod(l.t1 - 0.2, 1, 0.06); } });
    });
  },
};

/* ================================================================ activities -> groups */
function actGroup(a) {
  const R = RENDER[a.type]; if (!R) throw new Error('unknown activity type ' + a.type);
  const scene = a.scene || 'studio', studio = scene === 'studio';
  const ids = a.cast.slice(0, a.type === 'skit' ? 3 : 2); let cast, bub = null;
  if (a.type === 'skit') {
    if (ids.length === 3) { cast = TRI(ids[0], ids[1], ids[2]); bub = { [ids[0]]: [440, 560], [ids[1]]: [960, 440], [ids[2]]: [1480, 560] }; }
    else if (FURN.has(scene)) { cast = LAYB(ids[0], ids[1], 872, 0.9); bub = { [ids[0]]: [470, 390], [ids[1]]: [1450, 390] }; }
    else { cast = LAY2(ids[0], ids[1], 1015, 0.92); bub = { [ids[0]]: [470, 520], [ids[1]]: [1450, 520] }; }
  } else cast = LAY2(ids[0], ids[1], 1015, 0.92);
  group({
    id: a.id, beats: [a.beat], scene, sceneKeep: studio, cast, bub, bubW: 540, bubHold: 1.4, autoGesture: a.type === 'skit',
    cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] },
    build: g => R.build(a, g), pose: (K, S, g) => R.pose && R.pose(K, S, g, a), ui: (ctx, S, t, g) => R.ui(ctx, S, t, g, a),
  });
}
(window.ACTIVITIES || []).forEach(actGroup);
