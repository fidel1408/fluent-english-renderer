/* lesson2.js — groups: negatives & questions, short answers, question words, interactive checks, experience, result */
'use strict';

/* tile row helper: tiles = [{tb, color, x, w, dy, a, tabL, tabR}] ; text is centred */
function tilesDraw(ctx, tiles, y, h) {
  for (const k of tiles) {
    if (k.a <= 0.01) continue;
    const yy = y + (k.dy || 0);
    ctx.save(); ctx.globalAlpha *= k.a;
    tile(ctx, k.x, yy, k.w, h, k.color, k.tabL, k.tabR);
    k.tb.draw(ctx, k.x + k.w / 2 - k.tb.w / 2, yy + h / 2 - k.tb.h / 2 - 2, { color: '#FFFFFF', ipaColor: 'rgba(255,255,255,.92)' });
    ctx.restore();
  }
}
const tileW = (tb) => tb.w + 76;
function layoutRow(tbs, cx) { const ws = tbs.map(tileW), tot = ws.reduce((a, b) => a + b, 0); let x = cx - tot / 2; return ws.map(w => { const r = { x, w }; x += w; return r; }); }
function useRibbon(S, ctx, t, g, label, hideAt) { // "Use one: ..." ribbon at the top; optionally leaves before the first speech bubble
  let p = pr(t, g.t0 - 0.1, g.t0 + 0.7, E.back); if (hideAt) p *= 1 - pr(t, hideAt, hideAt + 0.35); if (p <= 0.01) return;
  const dy = (1 - clamp(p)) * -16, h = label.h + 40;
  ctx.save(); ctx.globalAlpha *= clamp(p); const w = label.w + 130; banner(ctx, 960, 20 + h / 2 + dy, w, h, COL.navy); label.draw(ctx, 960 - label.w / 2, 20 + h / 2 - label.h / 2 - 2 + dy, { color: '#fff', ipaColor: 'rgba(255,255,255,.85)' }); ctx.restore();
}

/* ================================================================ NEGATIVES + QUESTIONS */
group({
  id: 'negq1', beats: ['neg', 'quest'], scene: 'studio', sceneKeep: true,
  cast: LAY2('M', 'D', 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.025] }, autoGesture: false,
  build() {
    const S = {}, z = 58;
    S.I = Tx('I', z); S.have = Tx('have', z); S.not = Tx('not', z); S.fin = Tx('finished.', z); S.hvnt = Tx("haven't", z);
    S.she = Tx('She', z); S.hasnt = Tx("hasn't", z);
    S.you = Tx('You', z); S.you2 = Tx('you', z); S.has = Tx('has', z); S.Have = Tx('Have', z); S.Has = Tx('Has', z); S.she2 = Tx('she', z); S.finq = Tx('finished?', z);
    S.cs = Tx('have', z); S.cs2 = Tx('has', z);
    S.row1 = layoutRow([S.I, S.have, S.fin], 960); S.row1n = layoutRow([S.I, S.have, S.not, S.fin], 960); S.row1c = layoutRow([S.I, S.hvnt, S.fin], 960);
    S.row2 = layoutRow([S.she, S.hasnt, S.fin], 960);
    S.q1a = layoutRow([S.you, S.have, S.fin], 960); S.q1b = layoutRow([S.Have, S.you2, S.finq], 960);
    S.q2a = layoutRow([S.she, S.has, S.fin], 960); S.q2b = layoutRow([S.Has, S.she2, S.finq], 960);
    S.doT = Tx('do or does', 56); S.hhT = Tx('have or has', 56);
    S.lblN = Tx('negative', 34); S.lblQ = Tx('question', 34);
    return S;
  },
  pose(K, S, g) {
    for (const id of ['M', 'D']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); }
    K.M.nod(at('n1', 0.3)); K.D.nod(at('n2', 0.2)); K.M.face(at('q1'), 'curious', 0.5); K.D.nod(at('q2', 0.1)); K.M.nod(at('q2', 2.2)); K.D.face(at('q3'), 'thinking', 0.5); K.M.face(at('q3'), 'neutral', 0.4);
  },
  ui(ctx, S, t) {
    const H = 140, y1 = 262, y2 = 470;
    const R = (ys) => ys;
    const negP = pr(t, at('n1', -0.3), at('n1', 0.3)) * (1 - pr(t, at('q1', -0.7), at('q1', -0.25)));
    if (negP > 0.01) {
      ctx.save(); ctx.globalAlpha *= negP;
      // label tag
      tape(ctx, 110, 150, S.lblN.w + 70, S.lblN.h + 24, COL.notL, -0.03); S.lblN.draw(ctx, 145, 162, { color: COL.not, ipaColor: 'rgba(201,53,69,.85)' });
      const d = du('n1'), tNot = at('n1', d * 0.3), tMerge = at('n1', d * 0.66);
      const pn = pr(t, tNot, tNot + 0.7, E.back), pm = pr(t, tMerge, tMerge + 0.6, E.io);
      const roles = [COL.subj, COL.aux, COL.not, COL.part];
      if (pm < 1) { // 3 -> 4 tile row (not drops in), then merges
        const a = (1 - pm);
        ctx.save(); ctx.globalAlpha *= a;
        const T0 = S.row1, T1 = S.row1n, e = E.io(clamp(pn));
        const L = [0, 1, 3].map((srcIdx, k) => ({ tb: [S.I, S.have, S.fin][k], color: [COL.subj, COL.aux, COL.part][k], x: lerp(T0[k].x, T1[srcIdx].x, e), w: lerp(T0[k].w, T1[srcIdx].w, 1), tabL: k > 0 || pn > 0.01, tabR: true, a: 1 }));
        L[0].tabL = false; L[2].tabR = false;
        const notT = { tb: S.not, color: COL.not, x: T1[2].x, w: T1[2].w, dy: -(1 - clamp(pn)) * 150, a: clamp(pn * 1.4), tabL: true, tabR: true };
        L.splice(2, 0, notT);
        if (pn < 0.01) { L.splice(2, 1); }
        tilesDraw(ctx, L, y1, H); ctx.restore();
      }
      if (pm > 0) { ctx.save(); ctx.globalAlpha *= pm; const T = S.row1c; tilesDraw(ctx, [{ tb: S.I, color: COL.subj, tabR: true, a: 1, ...T[0] }, { tb: S.hvnt, color: COL.not, tabL: true, tabR: true, a: 1, ...T[1] }, { tb: S.fin, color: COL.part, tabL: true, a: 1, ...T[2] }], y1, H); ctx.restore(); }
      const p2 = pr(t, at('n2', du('n2') * 0.5 - 0.15), at('n2', du('n2') * 0.5 + 0.5), E.back);
      if (p2 > 0.01) { const T = S.row2; tilesDraw(ctx, [{ tb: S.she, color: COL.subj, tabR: true, a: clamp(p2), dy: (1 - clamp(p2)) * 40, ...T[0] }, { tb: S.hasnt, color: COL.not, tabL: true, tabR: true, a: clamp(p2), dy: (1 - clamp(p2)) * 40, ...T[1] }, { tb: S.fin, color: COL.part, tabL: true, a: clamp(p2), dy: (1 - clamp(p2)) * 40, ...T[2] }], y2, H); }
      ctx.restore();
    }
    // questions
    const qP = pr(t, at('q1', -0.25), at('q1', 0.3));
    if (qP > 0.01) {
      ctx.save(); ctx.globalAlpha *= qP;
      tape(ctx, 110, 150, S.lblQ.w + 70, S.lblQ.h + 24, COL.timeL, -0.03); S.lblQ.draw(ctx, 145, 162, { color: COL.time, ipaColor: 'rgba(122,71,204,.85)' });
      const swapRow = (A, B, tbA, tbB, tSwap, y, cols) => {
        const e = pr(t, tSwap, tSwap + 0.85, E.io), a = tbA, b = tbB; // each: [t0,t1,t2] blocks
        const idxMap = [1, 0, 2]; // statement slot -> question slot
        const items = [0, 1, 2].map(i => {
          const dst = idxMap[i]; const x = lerp(A[i].x, B[dst].x, e), w = lerp(A[i].w, B[dst].w, e);
          const arc = (i === 1) ? -90 * Math.sin(e * Math.PI) : (i === 0 ? 0 : 0);
          return { tb: e > 0.5 ? b[i] : a[i], color: cols[i], x, w, dy: arc, a: 1, tabL: true, tabR: true };
        });
        // tab pattern follows final order
        const order = [...items].sort((p, q) => p.x - q.x); order.forEach((it, k) => { it.tabL = k > 0; it.tabR = k < 2; });
        tilesDraw(ctx, items, y, H);
      };
      swapRow(S.q1a, S.q1b, [S.you, S.have, S.fin], [S.you2, S.Have, S.finq], at('q1', du('q1') * 0.5), y1, [COL.subj, COL.aux, COL.part]);
      swapRow(S.q2a, S.q2b, [S.she, S.has, S.fin], [S.she2, S.Has, S.finq], at('q2', du('q2') * 0.5), y2, [COL.subj, COL.aux, COL.part]);
      ctx.restore();
    }
    // do / does is wrong here
    const dP = pr(t, at('q3', 0.0), at('q3', 0.8), E.back);
    if (dP > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(dP) * qP; ctx.translate(0, (1 - clamp(dP)) * 30);
      const y = 660, w1 = S.doT.w + 80, w2 = S.hhT.w + 80;
      pill(ctx, 700 - w1 / 2, y, w1, S.doT.h + 30, '#9AA4B6'); S.doT.draw(ctx, 700 - S.doT.w / 2, y + 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
      ctx.strokeStyle = COL.bad; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(700 - w1 / 2 + 18, y + S.doT.h / 2 + 22); ctx.lineTo(700 + w1 / 2 - 18, y + S.doT.h / 2 + 8); ctx.stroke();
      checkBadge(ctx, 700 + w1 / 2 - 4, y + 6, 30, false);
      pill(ctx, 1220 - w2 / 2, y, w2, S.hhT.h + 30, COL.aux); S.hhT.draw(ctx, 1220 - S.hhT.w / 2, y + 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
      checkBadge(ctx, 1220 + w2 / 2 - 4, y + 6, 30, true);
      ctx.restore();
    }
  },
});

/* ================================================================ SHORT ANSWERS (cafe dialogue) */
group({
  id: 'short', beats: ['short'], scene: 'cafe', sceneKeep: false,
  cast: { M: { x: 640, y: 610, s: 1.0, rest: { armL: { x: -112, y: 255, hand: 'rest' }, armR: { x: 112, y: 255, hand: 'rest' }, yaw: 0.2 } }, D: { x: 1320, y: 610, s: 1.0, flip: true, rest: { armL: { x: -112, y: 255, hand: 'rest' }, armR: { x: 126, y: 255, hand: 'rest' }, yaw: 0.2 } } },
  bub: { M: [560, 190], D: [1380, 190] }, bubW: 520, bubHold: 4.0,
  cam: { from: [960, 560, 1.0], to: [960, 545, 1.05] },
  build() { return { tag: Tx('short answer', 32) }; },
  pose(K, S, g) {
    K.M.face(0.01, 'curious'); K.D.face(0.01, 'warm'); K.M.look(0.01, 'D', 0.1); K.D.look(0.01, 'M', 0.1);
    K.D.face(at('a2'), 'happy', 0.4); K.M.face(at('a3'), 'curious', 0.4); K.D.face(at('a4'), 'neutral', 0.4); K.D.shake(at('a4', 0.1), 1, -0.0); K.M.nod(at('a4', 1.4), 1, 0.06);
  },
  ui(ctx, S, t) {
    for (const id of ['a2', 'a4']) {
      const p = pr(t, at(id, 0.1), at(id, 0.6), E.back), out = 1 - pr(t, en(id, 3.6), en(id, 4.0)); const a = clamp(p) * out; if (a <= 0.01) continue;
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(1150, 54 + (1 - clamp(p)) * -10); ctx.rotate(-0.03);
      tape(ctx, -S.tag.w / 2 - 30, -10, S.tag.w + 60, S.tag.h + 24, COL.gold, 0); S.tag.draw(ctx, -S.tag.w / 2, 2, { color: COL.navy, ipaColor: 'rgba(15,42,77,.8)' }); ctx.restore();
    }
  },
});

/* ================================================================ QUESTION WORDS */
group({
  id: 'wh', beats: ['wh'], scene: 'studio', sceneKeep: true,
  cast: LAY2('M', 'S', 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.025] }, autoGesture: false,
  build() {
    const S = {}, z = 50;
    S.f = [Tx('question word', z), Tx('have or has', z), Tx('subject', z), Tx('past participle', z)];
    S.fw = S.f.map(tb => tb.w + 70); const tot = S.fw.reduce((a, b) => a + b, 0); S.fx = []; let x = 960 - tot / 2; for (const w of S.fw) { S.fx.push(x); x += w; }
    const e = 54; S.a = [Tx('What', e), Tx('have', e), Tx('you', e), Tx('done?', e)]; S.b = [Tx('How long', e), Tx('have', e), Tx('you', e), Tx('lived', e), Tx('here?', e)];
    S.ra = layoutRow(S.a, 960); S.rb = layoutRow(S.b, 960);
    S.lbl = Tx('question word', 34);
    return S;
  },
  pose(K, S, g) { for (const id of ['M', 'S']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.M.nod(at('w1', 0.6)); K.S.nod(at('w2', 0.4)); K.M.face(at('w2'), 'curious', 0.5); K.S.nod(at('w2', 3.2)); },
  ui(ctx, S, t) {
    const H = 120, cols = [COL.wh, COL.aux, COL.subj, COL.part];
    S.f.forEach((tb, i) => { const a = pr(t, at('w1', 0.0 + i * 0.35), at('w1', 0.6 + i * 0.35), E.back); tilesDraw(ctx, [{ tb, color: cols[i], x: S.fx[i], w: S.fw[i], a: clamp(a), dy: (1 - clamp(a)) * 50, tabL: i > 0, tabR: i < 3 }], 190, H); });
    const pa = pr(t, at('w2', -0.1), at('w2', 0.5), E.back), pb = pr(t, at('w2', du('w2') * 0.5 - 0.2), at('w2', du('w2') * 0.5 + 0.5), E.back);
    const ca = [COL.wh, COL.aux, COL.subj, COL.part], cb = [COL.wh, COL.aux, COL.subj, COL.part, '#7C8AA5'];
    tilesDraw(ctx, S.a.map((tb, i) => ({ tb, color: ca[i], a: clamp(pa), dy: (1 - clamp(pa)) * 40, tabL: i > 0, tabR: i < 3, ...S.ra[i] })), 400, H + 10);
    tilesDraw(ctx, S.b.map((tb, i) => ({ tb, color: cb[i], a: clamp(pb), dy: (1 - clamp(pb)) * 40, tabL: i > 0, tabR: i < 4, ...S.rb[i] })), 600, H + 10);
    // soft karaoke ring on active row
    const act = t >= at('w2') && t < at('w2', du('w2') * 0.5) ? 0 : t >= at('w2', du('w2') * 0.5) && t < en('w2') + 0.2 ? 1 : -1;
    if (act >= 0) { const y = act === 0 ? 400 : 600, R = act === 0 ? S.ra : S.rb; const x0 = R[0].x - 14, x1 = R[R.length - 1].x + R[R.length - 1].w + 14; ctx.strokeStyle = 'rgba(255,196,60,.95)'; ctx.lineWidth = 6; ctx.beginPath(); rrect(ctx, x0, y - 10, x1 - x0, H + 30, 26); ctx.stroke(); }
  },
});

/* ================================================================ CHECKS (interactive, pauseable) */
function checkGroup(d) {
  group({
    id: d.id, beats: [d.beat], scene: 'studio', sceneKeep: true, autoGesture: false,
    cast: LAY2(d.cast[0], d.cast[1], 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] },
    build(g) {
      const S = { pick: null, hot: [], pausePoints: [{ t: Eng.LINE[d.hold].t0 + 0.15, id: d.id, label: d.title }] };
      const k = d.context ? 0.86 : 1, z = Math.round(60 * k);
      S.k = k; S.title = Tx(d.title, 48, { serif: true, weight: 700 }); S.think = Tx('Think', 32);
      S.ctx = d.context ? Tx(d.context, 40, { maxW: 1100 }) : null;
      S.before = Tx(d.before, z); S.after = Tx(d.after, z);
      S.opts = d.options.map(o => Tx(o, Math.round(58 * k), { weight: 700 }));
      S.slotW = Math.max(...S.opts.map(o => o.w)) + 70;
      S.why = Tx(d.why, Math.round(38 * k)); S.full = Tx(d.full, Math.round(50 * k), { maxW: 1100 });
      S.n = d.options.length; S.bw = S.n === 3 ? 360 : 450; S.bh = Math.round(150 * k); S.gap = 40;
      return S;
    },
    pose(K, S, g) {
      const [a, b] = d.cast; for (const id of [a, b]) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'curious'); }
      K[a].set(at(d.hold), { roll: 0.05 }, 0.8); K[b].face(at(d.hold), 'thinking', 0.6); K[a].face(at(d.ans), 'happy', 0.4); K[b].face(at(d.ans), 'happy', 0.4); K[b].nod(at(d.ans, 0.6), 1, 0.08); K[a].nod(at(d.ans, 0.4)); K[a].set(at(d.ans), { roll: 0 }, 0.5);
    },
    ui(ctx, S, t, g) {
      const q = Eng.LINE[d.q], h = Eng.LINE[d.hold], an = Eng.LINE[d.ans];
      const cx = 960, cardX = 320, cardW = 1280, cardY = 150, cardH = 690;
      const pc = pr(t, q.t0 - 0.35, q.t0 + 0.35, E.back);
      if (t < g.t0 - 1 || t < q.t0 - 2) S.pick = null;
      if (pc <= 0.01) return;
      ctx.save(); ctx.globalAlpha *= clamp(pc); ctx.translate(0, (1 - clamp(pc)) * 40);
      paper(ctx, cardX, cardY, cardW, cardH, { color: COL.paper, r: 40 });
      // title banner
      const tw = S.title.w + 150, bh = S.title.h + 44; banner(ctx, cx, cardY + 2, tw, bh, COL.time); S.title.draw(ctx, cx - S.title.w / 2, cardY + 2 - S.title.h / 2 - 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.85)' });
      const revealed = t >= an.t0 - 0.05, rp = pr(t, an.t0 - 0.05, an.t0 + 0.5, E.back);
      let y0 = cardY + 92;
      if (S.ctx) { const w = S.ctx.w + 70; tape(ctx, cx - w / 2, y0 - 8, w, S.ctx.h + 26, COL.timeL, -0.004); S.ctx.draw(ctx, cx - S.ctx.w / 2, y0 + 3, { color: COL.time, ipaColor: 'rgba(122,71,204,.85)' }); y0 += S.ctx.h + 34; }
      // sentence with slot
      const totW = S.before.w + S.slotW + S.after.w + 40, sx = cx - totW / 2, sy = y0 + 14;
      S.before.draw(ctx, sx, sy);
      const slotX = sx + S.before.w + 20, slotY = sy + 4, slotH = S.before.h + 6;
      const pk = S.pick, shown = revealed ? d.correct : pk;
      ctx.save();
      ctx.fillStyle = revealed ? 'rgba(30,158,90,.12)' : 'rgba(122,71,204,.07)'; ctx.beginPath(); rrect(ctx, slotX, slotY, S.slotW, slotH, 20); ctx.fill();
      ctx.strokeStyle = revealed ? COL.ok : COL.time; ctx.lineWidth = 4; ctx.setLineDash(revealed ? [] : [14, 10]); ctx.stroke(); ctx.setLineDash([]);
      if (shown !== null && shown !== undefined) { const ob = S.opts[shown]; ob.draw(ctx, slotX + S.slotW / 2 - ob.w / 2, sy + 2, { color: revealed ? COL.ok : COL.time, ipaColor: revealed ? 'rgba(30,158,90,.8)' : 'rgba(122,71,204,.8)' }); }
      ctx.restore();
      S.after.draw(ctx, slotX + S.slotW + 20, sy);
      // options
      const by = sy + S.before.h + 34, tot = S.n * S.bw + (S.n - 1) * S.gap, bx0 = cx - tot / 2;
      const rdP = pr(t, q.t0 + 0.9, q.t0 + 1.5, E.back);
      const readP = clamp((t - (q.t0 + q.dur * 0.55)) / (q.dur * 0.42)); // narrator reads the options
      const readIdx = t >= q.t0 + q.dur * 0.55 && t <= q.t1 + 0.05 ? Math.min(S.n - 1, Math.floor(readP * S.n)) : -1;
      S.hot = [];
      for (let i = 0; i < S.n; i++) {
        const x = bx0 + i * (S.bw + S.gap), ap = pr(t, q.t0 + 0.8 + i * 0.18, q.t0 + 1.4 + i * 0.18, E.back); if (ap <= 0.01) continue;
        const ok = i === d.correct; let fill = '#FFFFFF', stroke = COL.navy, dim = 1, txt = COL.ink;
        if (revealed) { if (ok) { fill = '#DDF5E8'; stroke = COL.ok; txt = '#0A6B3D'; } else { dim = 1 - 0.45 * rp; } }
        else if (pk === i) { fill = '#E3ECFB'; stroke = COL.subj; }
        ctx.save(); ctx.globalAlpha *= clamp(ap) * dim; ctx.translate(0, (1 - clamp(ap)) * 30 - (revealed && ok ? 8 * rp : 0));
        const hover = !revealed && readIdx === i;
        withShadow(ctx, 'rgba(15,25,50,.22)', 14, 0, 8, () => { ctx.fillStyle = fill; ctx.beginPath(); rrect(ctx, x, by, S.bw, S.bh, 34); ctx.fill(); });
        ctx.lineWidth = hover || pk === i || (revealed && ok) ? 7 : 4; ctx.strokeStyle = hover ? COL.gold : stroke; ctx.stroke();
        S.opts[i].draw(ctx, x + S.bw / 2 - S.opts[i].w / 2, by + S.bh / 2 - S.opts[i].h / 2 - 2, { color: txt, ipaColor: revealed && ok ? 'rgba(10,107,61,.85)' : 'rgba(20,33,61,.72)' });
        ctx.restore();
        if (revealed) { if (ok) checkBadge(ctx, x + S.bw - 22, by + 6 - 8 * rp, 34, true, rp, E.back(clamp(rp))); else if (pk === i) checkBadge(ctx, x + S.bw - 22, by + 6, 34, false, rp, E.back(clamp(rp))); }
        if (!revealed && t >= q.t0 + 1.2) { S.hot.push(i); Eng.hot.push({ x: x, y: by, w: S.bw, h: S.bh, fn: () => { S.pick = i; Eng.onPick && Eng.onPick(d.id, i); } }); }
      }
      // thinking ring
      if (t >= h.t0 - 0.05 && t < an.t0) {
        const p = clamp((t - h.t0) / h.dur); ring(ctx, cardX + cardW - 80, cardY + 118, 38, 1 - p, COL.time, 11);
        appear(ctx, pr(t, h.t0, h.t0 + 0.4), () => { pill(ctx, cardX + 40, cardY + 100, S.think.w + 56, S.think.h + 22, COL.time); S.think.draw(ctx, cardX + 68, cardY + 110, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); }, 8);
      }
      // explanation
      if (revealed) {
        const ey = by + S.bh + 26; const w = S.full.w + 90;
        ctx.save(); ctx.globalAlpha *= clamp(rp); ctx.translate(0, (1 - clamp(rp)) * 24);
        tape(ctx, cx - w / 2, ey - 6, w, S.full.h + 22, COL.partL, -0.004);
        hero(ctx, S.full, cx - S.full.w / 2, ey + 4, d.roles);
        ctx.restore();
        appear(ctx, pr(t, an.t0 + 0.9, an.t0 + 1.5), () => { S.why.draw(ctx, cx - S.why.w / 2, ey + S.full.h + 28, { color: COL.ink }); }, 10);
      }
      ctx.restore();
    },
  });
}
checkGroup({ id: 'chk1', beat: 'chk1', q: 'k1q', hold: 'k1h', ans: 'k1a', title: 'Quick check 1', cast: ['S', 'D'], before: 'She', after: 'finished the report.', options: ['have', 'has', 'does'], correct: 1, full: 'She has finished the report.', why: 'He, she, it use has.', roles: ['subj', 'aux', 'part', null, null] });
checkGroup({ id: 'chk2', beat: 'chk2', q: 'k2q', hold: 'k2h', ans: 'k2a', title: 'Quick check 2', cast: ['M', 'S'], before: 'Maya has already', after: 'lunch.', options: ['ate', 'eaten', 'eat'], correct: 1, full: 'Maya has already eaten lunch.', why: 'After has: past participle.', roles: ['subj', 'aux', 'time', 'part', null] });
checkGroup({ id: 'chk3', beat: 'chk3', q: 'k3q', hold: 'k3h', ans: 'k3a', title: 'Quick check 3', cast: ['D', 'M'], before: 'Daniel has worked here', after: '2019.', options: ['for', 'since'], correct: 1, full: 'Daniel has worked here since 2019.', why: 'Since: the starting point.', roles: ['subj', 'aux', 'part', null, 'time', 'time'] });
checkGroup({ id: 'chk4', beat: 'chk4', q: 'k4q', hold: 'k4h', ans: 'k4a', title: 'Quick check 4', cast: ['S', 'D'], context: "Sofia's trip was last summer.", before: 'We', after: 'Canada last summer.', options: ['visited', 'have visited'], correct: 0, full: 'We visited Canada last summer.', why: 'Finished time: simple past.', roles: ['subj', 'part', null, 'time', 'time'] });

/* ================================================================ EXPERIENCE */
group({
  id: 'exp1', beats: ['exp1'], scene: 'travel', sceneKeep: true,
  cast: { S: { x: 630, y: 615, s: 1.0, rest: { armL: { x: -108, y: 270, hand: 'rest' }, armR: { x: 108, y: 270, hand: 'rest' }, yaw: 0.2 } }, D: { x: 1320, y: 615, s: 1.0, flip: true, rest: { armL: { x: -108, y: 270, hand: 'rest' }, armR: { x: 108, y: 270, hand: 'rest' }, yaw: 0.2 } } },
  bub: { S: [545, 196], D: [1400, 196] }, bubW: 540, bubHold: 4,
  cam: { from: [960, 560, 1.0], to: [980, 545, 1.05] },
  build() { return { rib: Tx('Use one: experience', 46, { weight: 700 }) }; },
  pose(K, S, g) {
    K.S.face(0.01, 'curious'); K.D.face(0.01, 'warm'); K.S.look(0.01, 'D', 0.1); K.D.look(0.01, 'S', 0.1); K.D.look(at('e1'), 'ui', 0.4); K.S.look(at('e1'), 'ui', 0.4);
    K.S.look(at('e2', -0.2), 'D', 0.4); K.D.look(at('e2', -0.1), 'S', 0.4); K.D.face(at('e3'), 'happy', 0.4); K.S.face(at('e3', 2.2), 'happy', 0.5); K.S.nod(at('e3', 2.4));
  },
  ui(ctx, S, t, g) { useRibbon(S, ctx, t, g, S.rib, at('e2', -0.3)); },
  world(ctx) { drawSuitcase(ctx, 1700, 960); },
});

group({
  id: 'exp2', beats: ['exp2'], scene: 'travel', sceneKeep: false,
  cast: LAYB('S', 'D'), cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] }, autoGesture: false,
  build() {
    const S = {};
    S.rib = Tx('Use one: experience', 46, { weight: 700 });
    S.s1 = Tx("I've visited Canada.", 56, { maxW: 900 }); S.s2 = Tx('I visited Canada in 2022.', 56, { maxW: 1000 }); S.s3 = Tx("I've never visited Canada.", 56, { maxW: 1000 });
    S.up = Tx('some time up to now', 34); S.dated = Tx('in 2022', 34); S.never = Tx('never', 36, { weight: 700 }); S.pres = Tx('present perfect', 32); S.past = Tx('simple past', 32); S.nowF = Tx('now', 30, { ipa: 18 });
    S.nvB = Tx('not at any time', 34);
    return S;
  },
  pose(K, S, g) { for (const id of ['S', 'D']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.S.nod(at('e4', 0.6)); K.D.nod(at('e4', 2.6)); K.S.face(at('e5'), 'thinking', 0.4); K.D.face(at('e6'), 'warm', 0.4); K.S.nod(at('e6', 0.8)); },
  ui(ctx, S, t, g) {
    useRibbon(S, ctx, t, g, S.rib);
    const ax0 = 190, ax1 = 1740, ay = 610, nowX = 1500;
    const pa = pr(t, at('e4', -0.1), at('e4', 0.6));
    const ph1 = pr(t, at('e4', 0.0), at('e4', 0.5)), ph2 = pr(t, at('e4', du('e4') * 0.55), at('e4', du('e4') * 0.55 + 0.6)), nv = pr(t, at('e5', -0.1), at('e5', 0.5));
    const fadeOld = 1 - nv;
    if (pa > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(pa);
      axis(ctx, ax0, ax1, ay, 0); nowFlag(ctx, nowX, ay, 130, { label: S.nowF });
      // present perfect: undated pins up to now
      ctx.save(); ctx.globalAlpha *= fadeOld;
      appear(ctx, ph1, () => {
        const w = S.s1.w + 90; tape(ctx, 960 - w / 2, 188, w, S.s1.h + 40, COL.partL, -0.004); hero(ctx, S.s1, 960 - S.s1.w / 2, 208, [], { hi: sweep(S.s1, 'e4', t, 0, 0.5) });
        for (const [px, d0] of [[420, 0.1], [760, 0.3], [1100, 0.5]]) { const a = pr(t, at('e4', d0), at('e4', d0 + 0.5), E.back); ICON.pin(ctx, px, ay - 22 - (1 - clamp(a)) * 60, 0.9, clamp(a), COL.part); }
        bracket(ctx, 260, nowX - 20, ay + 84, 30, COL.part, pr(t, at('e4', 0.6), at('e4', 1.6), E.io), false, 8);
        appear(ctx, pr(t, at('e4', 1.4), at('e4', 2.0)), () => { pill(ctx, 760 - (S.up.w + 40) / 2, ay + 152, S.up.w + 40, S.up.h + 20, COL.part); S.up.draw(ctx, 760 - S.up.w / 2, ay + 162, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      });
      // simple past with a finished time
      appear(ctx, ph2, () => {
        const w = S.s2.w + 90; tape(ctx, 960 - w / 2, 340, w, S.s2.h + 40, COL.subjL, 0.004); hero(ctx, S.s2, 960 - S.s2.w / 2, 360, ['subj', null, null, 'time', 'time'].slice(0, 0), { hi: sweep(S.s2, 'e4', t, 0.55, 1) });
        ICON.pin(ctx, 1230, ay - 22, 0.9, 1, COL.time);
        ctx.fillStyle = COL.timeL; ctx.beginPath(); rrect(ctx, 1170, ay - 118, 120, 74, 14); ctx.fill(); ctx.strokeStyle = COL.time; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
        pill(ctx, 1230 - (S.dated.w + 40) / 2, ay + 24, S.dated.w + 40, S.dated.h + 20, COL.time); S.dated.draw(ctx, 1230 - S.dated.w / 2, ay + 34, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
      });
      ctx.restore();
      // never
      ctx.save(); ctx.globalAlpha *= nv;
      const w3 = S.s3.w + 90; tape(ctx, 960 - w3 / 2, 250, w3, S.s3.h + 40, COL.notL, -0.004);
      hero(ctx, S.s3, 960 - S.s3.w / 2, 270, ['subj', 'aux', 'part', 'part'].slice(0, 0), { color: (i) => i === 1 ? COL.not : COL.ink, hi: sweep(S.s3, 'e6', t) });
      for (const px of [420, 760, 1100]) { ICON.pin(ctx, px, ay - 22, 0.9, 0.6, COL.grey); }
      ctx.strokeStyle = COL.bad; ctx.lineWidth = 9; ctx.lineCap = 'round'; for (const px of [420, 760, 1100]) { ctx.beginPath(); ctx.moveTo(px - 24, ay - 82); ctx.lineTo(px + 24, ay - 34); ctx.moveTo(px + 24, ay - 82); ctx.lineTo(px - 24, ay - 34); ctx.stroke(); }
      bracket(ctx, 260, nowX - 20, ay + 84, 30, COL.not, pr(t, at('e5', 0.2), at('e5', 1.2), E.io), false, 8);
      appear(ctx, pr(t, at('e5', 0.9), at('e5', 1.5)), () => { pill(ctx, 760 - (S.nvB.w + 40) / 2, ay + 152, S.nvB.w + 40, S.nvB.h + 20, COL.not); S.nvB.draw(ctx, 760 - S.nvB.w / 2, ay + 162, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      ctx.restore();
      ctx.restore();
    }
  },
});

/* ================================================================ RESULT */
group({
  id: 'res1', beats: ['res1'], scene: 'office', sceneKeep: true,
  cast: { M: { x: 640, y: 612, s: 1.0, rest: { armL: { x: -110, y: 260, hand: 'rest' }, armR: { x: 110, y: 260, hand: 'rest' }, yaw: 0.2 } }, D: { x: 1320, y: 612, s: 1.0, flip: true, rest: { armL: { x: -110, y: 260, hand: 'rest' }, armR: { x: 110, y: 260, hand: 'rest' }, yaw: 0.25 } } },
  bub: { D: [1380, 190], M: [560, 190] }, bubW: 540, bubHold: 4,
  cam: { from: [960, 560, 1.0], to: [980, 545, 1.05] },
  build() { return { rib: Tx('Use two: recent result', 46, { weight: 700 }) }; },
  pose(K, S, g) {
    K.M.face(0.01, 'warm'); K.D.face(0.01, 'curious'); K.M.look(0.01, 'D', 0.1); K.D.look(0.01, 'M', 0.1); K.M.look(at('r1'), 'ui', 0.4); K.D.look(at('r1'), 'ui', 0.4);
    K.D.look(at('r2', -0.2), 'M', 0.3); K.M.look(at('r2', 0.3), 'D', 0.3);
    K.M.face(at('r3', -0.3), 'proud', 0.4);
    K.M.arm('R', at('r3', 0.0), { x: 150, y: 150, hand: 'grip', item: 'report' }, 0.6, E.back); K.M.arm('R', en('r3', 1.4), { x: 110, y: 260, hand: 'rest', item: null }, 0.7);
    K.D.face(at('r3', 0.8), 'relieved', 0.5); K.D.nod(at('r3', 1.4), 2, 0.07);
  },
  ui(ctx, S, t, g) { useRibbon(S, ctx, t, g, S.rib, at('r2', -0.3)); },
});
group({
  id: 'res2', beats: ['res2'], scene: 'office', sceneKeep: false,
  cast: LAYB('M', 'D'), cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] }, autoGesture: false,
  build() {
    const S = {};
    S.rib = Tx('Use two: recent result', 46, { weight: 700 });
    S.fin = Tx('finished', 40, { weight: 700 }); S.ready = Tx('ready now', 40, { weight: 700 });
    S.r1 = Tx("I've already finished.", 54); S.r2 = Tx('Have you finished yet?', 54); S.r3 = Tx("I haven't finished yet.", 54);
    S.l1 = Tx('before the participle', 32); S.l2 = Tx('at the end', 32); S.l3 = Tx('at the end', 32);
    return S;
  },
  pose(K, S, g) { for (const id of ['M', 'D']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.D.nod(at('r4', 0.6)); K.M.nod(at('r5', 0.3)); K.D.face(at('r6'), 'curious', 0.4); K.M.face(at('r6'), 'worried', 0.5); },
  ui(ctx, S, t, g) {
    useRibbon(S, ctx, t, g, S.rib);
    // left: the finished report
    const p = pr(t, at('r4', -0.1), at('r4', 0.8), E.back);
    if (p > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(p);
      ctx.fillStyle = rg(ctx, 500, 430, 20, 320, [[0, 'rgba(255,230,150,.75)'], [1, 'rgba(255,230,150,0)']]); ctx.beginPath(); ctx.arc(500, 430, 320, 0, TAU); ctx.fill();
      ICON.report(ctx, 500, 420 + (1 - clamp(p)) * 40, 1.7, 1);
      checkBadge(ctx, 596, 308, 52, true, 1, E.back(clamp((t - at('r4', 0.5)) / 0.5)));
      appear(ctx, pr(t, at('r4', 0.9), at('r4', 1.5)), () => { pill(ctx, 500 - (S.fin.w + 60) / 2, 640, S.fin.w + 60, S.fin.h + 24, COL.part); S.fin.draw(ctx, 500 - S.fin.w / 2, 652, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      appear(ctx, pr(t, at('r4', 1.6), at('r4', 2.3)), () => { pill(ctx, 500 - (S.ready.w + 60) / 2, 740, S.ready.w + 60, S.ready.h + 24, COL.time); S.ready.draw(ctx, 500 - S.ready.w / 2, 752, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      ctx.restore();
    }
    // right: already / yet, one row each: sentence strip + position label underneath
    const rows = [[S.r1, 'r5', 0.15, S.l1, 'already'], [S.r2, 'r5', 0.55, S.l2, 'yet'], [S.r3, 'r6', 0.0, S.l3, 'yet']];
    rows.forEach(([tb, lid, fr, lb, key], i) => {
      const t0r = i === 2 ? at('r6', -0.2) : at('r5', du('r5') * fr - 0.2 + (i === 0 ? 0.3 : 0)), a = pr(t, t0r, t0r + 0.6, E.back);
      if (a <= 0.01) return;
      const y = 215 + i * 225, w = tb.w + 90, x = 780;
      appear(ctx, clamp(a), () => {
        tape(ctx, x, y - 14, w, tb.h + 40, i === 2 ? COL.notL : COL.partL, i % 2 ? 0.004 : -0.004);
        const wi = wordIndex(tb, key); const hi = {}; hi[wi] = rgba(COL.time, 0.22);
        tb.draw(ctx, x + 45, y + 4, { hi, color: (k) => k === wi ? COL.time : COL.ink, ipaColor: (k) => k === wi ? rgba(COL.time, 0.85) : 'rgba(20,33,61,.72)' });
        const u = tb.unitBox(wi), ux = x + 45 + u.cx;
        const lp = pr(t, t0r + 0.9, t0r + 1.5);
        appear(ctx, lp, () => { const lw = lb.w + 44; pill(ctx, ux - lw / 2, y + tb.h + 36, lw, lb.h + 18, COL.time); lb.draw(ctx, ux - lb.w / 2, y + tb.h + 45, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); }, 8);
      }, 18);
    });
  },
});
