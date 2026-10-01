/* lesson1.js — helpers + groups: title, story, contrast, form.
   A "group" = one scene with its own cast layout, camera, pose keys and teaching graphics.
   ui() redraws everything from the timeline each frame (pure function of t), so seeking is exact.   */
'use strict';
const GROUPS = [];
const group = d => GROUPS.push(d);
const at = (id, o = 0) => Eng.LINE[id].t0 + o;
const en = (id, o = 0) => Eng.LINE[id].t1 + o;
const du = id => Eng.LINE[id].dur;
const pr = (t, a, b, e = E.out) => e(clamp((t - a) / Math.max(1e-6, b - a)));
const Tx = (s, size, o = {}) => T(s, Object.assign({ size }, o));
function appear(ctx, p, fn, dy = 14) { if (p <= 0.004) return; ctx.save(); ctx.globalAlpha *= p; ctx.translate(0, (1 - p) * dy); fn(); ctx.restore(); }
const ROLEC = { subj: COL.subj, aux: COL.aux, part: COL.part, not: COL.not, time: COL.time, wh: COL.wh, ink: COL.ink };
const roleColor = (roles, i) => ROLEC[roles && roles[i]] || COL.ink;
const roleIpa = (roles, i) => { const r = roles && roles[i]; return r ? rgba(ROLEC[r], 0.8) : 'rgba(20,33,61,.72)'; };
/* hero sentence painted by role */
function hero(ctx, tb, x, y, roles, o = {}) { tb.draw(ctx, x, y, Object.assign({ color: (i) => roleColor(roles, i), ipaColor: (i) => roleIpa(roles, i) }, o)); }
/* karaoke-style sweep: highlight the unit being spoken in line `id` */
function sweep(tb, id, t, from = 0, to = 1) {
  const L = Eng.LINE[id]; const p = clamp(((t - L.t0) / L.dur - from) / (to - from)); if (t < L.t0 || t > L.t1 + 0.05) return null;
  const cum = wordWeights(tb); const wi = wordAt(cum, p); return { [wi]: 'rgba(255,214,102,.7)' };
}
const LAY2 = (a, b, y = 1015, s = 0.92) => ({ [a]: { x: 250, y, s }, [b]: { x: 1670, y, s, flip: true } });
/* corner buddies for scenes with a foreground desk/table: heads stay above the furniture */
const LAYB = (a, b, y = 872, s = 0.9) => ({ [a]: { x: 250, y, s }, [b]: { x: 1670, y, s, flip: true } });
function lookAtUi(K, ids, t0) { for (const id of ids) K[id].look(t0, 'ui', 0.5); }

/* ================================================================ TITLE */
group({
  id: 'title', beats: ['title'], scene: 'studio',
  cast: { S: { x: 540, y: 950, s: 1.0 }, M: { x: 960, y: 972, s: 1.04, z: 1 }, D: { x: 1380, y: 950, s: 1.0 } },
  cam: { from: [960, 540, 1.0], to: [960, 540, 1.03] }, autoGesture: false,
  build() { return { title: Tx('Present Perfect', 132, { serif: true, weight: 700, ipa: 56 }), sub: Tx('Grammar lesson', 46, {}) }; },
  pose(K, S, g) {
    const s = at('t1');
    K.S.face(0.01, 'happy'); K.M.face(0.01, 'warm'); K.D.face(0.01, 'happy');
    K.S.look(0.01, 'cam', 0.1); K.M.look(0.01, 'cam', 0.1); K.D.look(0.01, 'cam', 0.1);
    K.S.wave(s + 0.2, s + 2.4, 'R'); K.S.arm('R', s + 2.6, { x: 114 - 8, y: 300, hand: 'rest' }, 0.5);
    K.M.nod(s + 1.2, 2); K.D.look(s + 1.0, 'S', 0.4); K.D.nod(s + 2.4, 1, 0.07); K.M.look(s + 2.2, 'D', 0.4); K.M.look(s + 3.4, 'cam', 0.4);
  },
  ui(ctx, S, t) {
    const p = pr(t, 0.35, 1.2, E.spring), pb = pr(t, 1.1, 1.7, E.back);
    appear(ctx, clamp(p), () => {
      const w = S.title.w + 150, h = S.title.h + 70, x = 960 - w / 2, y = 150;
      paper(ctx, x, y, w, h, { color: 'rgba(255,253,247,.92)', r: 40 });
      S.title.draw(ctx, 960 - S.title.w / 2, y + 36, { color: COL.navy, ipaColor: 'rgba(15,42,77,.75)' });
      ctx.fillStyle = COL.gold; ctx.beginPath(); rrect(ctx, 960 - 120, y + h - 22, 240, 10, 5); ctx.fill();
    }, 30);
    if (pb > 0.01) { ctx.save(); ctx.globalAlpha = clamp(pb); const w = S.sub.w + 140, cy = 518 + (1 - clamp(pb)) * 20; banner(ctx, 960, cy, w, 112, '#17727A'); S.sub.draw(ctx, 960 - S.sub.w / 2, cy - S.sub.h / 2 - 2, { color: '#FFFFFF', ipaColor: 'rgba(255,255,255,.85)' }); ctx.restore(); }
  },
});

/* ================================================================ STORY (hall) */
group({
  id: 'story', beats: ['story1'], scene: 'hall', sceneKeep: true,
  cast: { D: { x: 650, y: 600, s: 1.0, rest: { yaw: 0.18, smile: -0.2 } }, M: { x: 1330, y: 600, s: 1.0, flip: true, rest: { yaw: -0.1 } } },
  bub: { D: [585, 196], M: [1450, 190] }, bubW: 520, bubHold: 3.4, autoGesture: false,
  cam: { from: [940, 560, 1.0], to: [980, 540, 1.07] },
  pose(K, S, g) {
    const D = K.D, M = K.M, a = at('s1a'), th = at('s1b'), sp = at('s1c');
    D.face(0.01, 'neutral'); M.face(0.01, 'warm');
    D.look(a + 0.3, 'down', 0.5, 0.5); D.face(a + 2.2, 'worried', 0.6);
    M.look(a, 'D', 0.4); M.set(a + 1.0, { roll: 0.06 }, 0.8);
    // searching pockets (silent thought)
    D.look(th, 'down', 0.3, 0.6);
    for (let i = 0; i < 3; i++) {
      const x = th + 0.15 + i * 0.75;
      D.arm('L', x, { x: -78, y: 160 + (i % 2) * 14, hand: 'open' }, 0.3, E.out); D.arm('L', x + 0.34, { x: -120, y: 240, hand: 'open' }, 0.3);
      D.arm('R', x + 0.3, { x: 150, y: 330, hand: 'open' }, 0.28, E.out); D.arm('R', x + 0.58, { x: 130, y: 300, hand: 'rest' }, 0.3);
    }
    D.set(th + 0.4, { yaw: 0.45 }, 0.5); D.set(th + 1.4, { yaw: -0.1 }, 0.5); D.face(th + 1.9, 'surprised', 0.35);
    // exclamation: hands up beside the head
    D.look(sp - 0.2, 'M', 0.25, 0.8);
    D.arm('L', sp - 0.15, { x: -176, y: -30, hand: 'open' }, 0.4, E.back); D.arm('R', sp - 0.15, { x: 176, y: -30, hand: 'open' }, 0.4, E.back);
    D.set(sp - 0.15, { shrug: 0.7, lean: -0.03 }, 0.4); D.face(sp + 0.2, 'worried', 0.5);
    D.arm('L', en('s1c', 0.9), { x: -120, y: 250, hand: 'rest' }, 0.7); D.arm('R', en('s1c', 0.9), { x: 124, y: 290, hand: 'rest' }, 0.7); D.set(en('s1c', 0.8), { shrug: 0, lean: 0 }, 0.7);
    M.face(sp + 0.3, 'worried', 0.5); M.set(sp + 0.2, { lean: -0.04 }, 0.5); M.look(sp + 1.5, 'D', 0.3);
  },
  ui() {},
});

/* ================================================================ CONTRAST */
group({
  id: 'contrast', beats: ['contrast'], scene: 'hall', sceneKeep: false,
  cast: LAY2('D', 'M', 1022, 0.9), cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] }, autoGesture: false,
  build() {
    const S = {};
    S.tagL = Tx('simple past', 36); S.tagR = Tx('present perfect', 36);
    S.hL = Tx('I lost my keys yesterday.', 54, { maxW: 740 }); S.hR = Tx("I've lost my keys.", 54, { maxW: 740 });
    S.fin = Tx('finished time', 34); S.res = Tx('result now', 34); S.miss = Tx('keys missing', 32); S.dated = Tx('yesterday', 34);
    S.past = Tx('Past', 60, { serif: true, weight: 700, ipa: 32 }); S.now = Tx('now', 60, { serif: true, weight: 700, ipa: 32 }); S.nowF = Tx('now', 30, { ipa: 18 }); S.pastL = Tx('past', 28, { ipa: 17 });
    S.rolesL = [null, null, null, null, 'time']; S.rolesR = [null, null, null, null];
    return S;
  },
  pose(K, S, g) {
    lookAtUi(K, ['D', 'M'], 0.2); K.D.face(0.01, 'worried'); K.M.face(0.01, 'curious');
    K.D.nod(at('c2', 0.2)); K.M.nod(at('c4', 0.1)); K.D.face(at('c4'), 'worried', 0.5); K.M.face(at('c5'), 'warm', 0.5); K.D.face(at('c6'), 'relieved', 0.6); K.M.nod(at('c6', 0.6), 2);
  },
  ui(ctx, S, t) {
    const lx = 110, rx = 990, cy = 160, cw = 820, ch = 610;
    // ---- left card: simple past
    const pL = pr(t, at('c2', -0.2), at('c2', 0.5)), pR = pr(t, at('c4', -0.2), at('c4', 0.5));
    appear(ctx, pL, () => {
      paper(ctx, lx, cy, cw, ch, { color: COL.paper });
      pill(ctx, lx + 30, cy - 26, S.tagL.w + 56, S.tagL.h + 26, COL.subj); S.tagL.draw(ctx, lx + 58, cy - 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.88)' });
      tape(ctx, lx + 40, cy + 74, cw - 80, S.hL.h + 44, COL.subjL, -0.006);
      hero(ctx, S.hL, lx + cw / 2 - S.hL.w / 2, cy + 96, S.rolesL, { hi: sweep(S.hL, 'c2', t) });
    }, 20);
    // timeline (past): axis
    const ay = 548, ax0 = lx + 50, ax1 = lx + cw - 50, nowX = lx + 560;
    appear(ctx, pr(t, at('c3', -0.1), at('c3', 0.6)), () => {
      axis(ctx, ax0, ax1, ay, 0.0); S.pastL.draw(ctx, ax0 - 6, ay + 26, { color: COL.grey, ipaColor: 'rgba(100,110,130,.8)', align: 'l' });
      nowFlag(ctx, nowX, ay, 120, { label: S.nowF });
      // finished block: yesterday
      const bx = lx + 230, bw = 190, bp = pr(t, at('c3', 0.2), at('c3', 1.0));
      ctx.save(); ctx.globalAlpha *= bp; ctx.fillStyle = COL.timeL; ctx.beginPath(); rrect(ctx, bx, ay - 74, bw, 74, 14); ctx.fill(); ctx.strokeStyle = COL.time; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      ICON.keys(ctx, bx + bw / 2 - 20, ay - 118 + (1 - bp) * -20, 0.78, bp);
      const cp = pr(t, at('c3', 0.9), at('c3', 1.6)); appear(ctx, cp, () => { pill(ctx, bx + bw / 2 - (S.dated.w + 44) / 2, ay + 22, S.dated.w + 44, S.dated.h + 20, COL.time); S.dated.draw(ctx, bx + bw / 2 - S.dated.w / 2, ay + 32, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      const fp = pr(t, at('c3', 1.8), at('c3', 2.5)); appear(ctx, fp, () => { S.fin.draw(ctx, lx + cw / 2 - S.fin.w / 2 - 40, ay + 124, { color: COL.time, ipaColor: 'rgba(122,71,204,.8)' }); });
    });
    // ---- right card: present perfect
    appear(ctx, pR, () => {
      paper(ctx, rx, cy, cw, ch, { color: COL.paper });
      pill(ctx, rx + 30, cy - 26, S.tagR.w + 56, S.tagR.h + 26, COL.part); S.tagR.draw(ctx, rx + 58, cy - 14, { color: '#fff', ipaColor: 'rgba(255,255,255,.88)' });
      tape(ctx, rx + 40, cy + 74, cw - 80, S.hR.h + 44, COL.partL, 0.006);
      hero(ctx, S.hR, rx + cw / 2 - S.hR.w / 2, cy + 96, S.rolesR, { hi: sweep(S.hR, 'c4', t) });
    }, 20);
    const bx0 = rx + 50, bx1 = rx + cw - 50, nowR = rx + 560;
    appear(ctx, pr(t, at('c5', -0.1), at('c5', 0.5)), () => {
      axis(ctx, bx0, bx1, ay, 0); S.pastL.draw(ctx, bx0 - 6, ay + 26, { color: COL.grey, ipaColor: 'rgba(100,110,130,.8)', align: 'l' });
      nowFlag(ctx, nowR, ay, 120, { label: S.nowF });
      ICON.keys(ctx, rx + 190, ay - 62, 0.78);
      const ap = pr(t, at('c5', 0.3), at('c5', 1.7), E.io); arcArrow(ctx, [rx + 230, ay - 72], [nowR - 14, ay - 20], -120, COL.part, ap, 8);
      const hp = pr(t, at('c5', 1.5), at('c5', 2.3), E.back); ICON.hook(ctx, nowR + 135, ay - 78 + (1 - hp) * 20, 0.74, clamp(hp));
      appear(ctx, pr(t, at('c5', 2.2), at('c5', 2.9)), () => { pill(ctx, rx + cw / 2 - (S.res.w + 44) / 2, ay + 22, S.res.w + 44, S.res.h + 20, COL.part); S.res.draw(ctx, rx + cw / 2 - S.res.w / 2, ay + 32, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
        S.miss.draw(ctx, rx + cw / 2 - S.miss.w / 2 - 20, ay + 124, { color: COL.not, ipaColor: 'rgba(201,53,69,.8)' }); });
    });
    // ---- bottom banner: past -> now
    const bp2 = pr(t, at('c6', 0.1), at('c6', 0.9), E.back);
    if (bp2 > 0.01) { ctx.save(); ctx.globalAlpha = clamp(bp2); const w = S.past.w + S.now.w + 240, y = 832 + (1 - clamp(bp2)) * 20; banner(ctx, 960, y, w, S.past.h + 40, COL.navy);
      S.past.draw(ctx, 960 - w / 2 + 70, y - S.past.h / 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.85)' });
      arcArrow(ctx, [960 - 40, y + 4], [960 + 44, y + 4], 0, COL.gold, pr(t, at('c6', 0.5), at('c6', 1.2)), 9);
      S.now.draw(ctx, 960 + w / 2 - 70 - S.now.w, y - S.now.h / 2, { color: '#fff', ipaColor: 'rgba(255,255,255,.85)' }); ctx.restore(); }
  },
});
function axis(ctx, x0, x1, y, a) {
  ctx.save(); ctx.strokeStyle = COL.navy; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1 - 14, y); ctx.stroke();
  ctx.fillStyle = COL.navy; ctx.beginPath(); ctx.moveTo(x1 + 8, y); ctx.lineTo(x1 - 22, y - 15); ctx.lineTo(x1 - 22, y + 15); ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ================================================================ FORM (tiles -> pronouns -> participles -> contractions) */
group({
  id: 'form', beats: ['form1', 'form2', 'form3'], scene: 'studio', sceneKeep: true,
  cast: LAY2('S', 'D', 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.025] }, autoGesture: false,
  build() {
    const S = {}, sz = 62;
    S.gen = [Tx('subject', sz, { }), Tx('have or has', sz, {}), Tx('past participle', sz, {})];
    S.ex = [Tx('She', sz + 6, {}), Tx('has', sz + 6, {}), Tx('finished.', sz + 6, {})];
    S.ord = [Tx('first', 32), Tx('second', 32), Tx('third', 32)];
    S.tw = [Math.max(S.gen[0].w, S.ex[0].w) + 130, Math.max(S.gen[1].w, S.ex[1].w) + 130, Math.max(S.gen[2].w, S.ex[2].w) + 130];
    S.pnL = ['I', 'you', 'we', 'they'].map(w => Tx(w, 50)); S.pnR = ['he', 'she', 'it'].map(w => Tx(w, 50));
    S.hv = Tx('have', 46, { weight: 700 }); S.hs = Tx('has', 46, { weight: 700 });
    // participle table
    S.cols = [Tx('base form', 34), Tx('simple past', 34), Tx('past participle', 34)]; S.third = Tx('third form', 28);
    const rows = [['work', 'worked', 'worked'], ['see', 'saw', 'seen'], ['go', 'went', 'gone'], ['be', 'was, were', 'been'], ['eat', 'ate', 'eaten']];
    S.rows = rows.map(r => r.map(w => Tx(w, 52)));
    S.regT = Tx('regular', 30); S.irrT = Tx('irregular', 30);
    // contractions
    S.cl = [Tx('I have finished.', 52), Tx('She has finished.', 52), Tx('She is tired.', 52)];
    S.cr = [Tx("I've finished.", 56), Tx("She's finished.", 56), Tx("She's tired.", 56)];
    S.lab = [Tx('has', 40, { weight: 700 }), Tx('is', 40, { weight: 700 })];
    S.cTitle = Tx('short forms', 40);
    return S;
  },
  pose(K, S, g) {
    for (const id of ['S', 'D']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); }
    const ids = ['S', 'D'];
    K.S.nod(at('f1', 0.4)); K.D.nod(at('f2', 0.1)); K.S.nod(at('f3', 1.0)); K.D.nod(at('f3', 3.2));
    K.S.face(at('f4'), 'thinking', 0.5); K.D.face(at('f4'), 'curious', 0.5); K.S.nod(at('f5', 0.3)); K.D.nod(at('f5', 3.0)); K.S.face(at('f7'), 'happy', 0.5); K.D.face(at('f7'), 'warm', 0.5); K.D.nod(at('f7', 0.2)); K.S.nod(at('f7', 1.4)); K.S.face(at('f8'), 'curious', 0.5);
  },
  ui(ctx, S, t) {
    const tY = 236, tH = 150, tw = S.tw, x0 = 960 - (tw[0] + tw[1] + tw[2]) / 2, cols = [COL.subj, COL.aux, COL.part];
    const tilesP = pr(t, at('f1', -0.1), at('f1', 0.9), E.back), tilesOut = 1 - pr(t, at('f4', -0.5), at('f4', -0.1));
    const tp = tilesP * tilesOut;
    if (tp > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(tp);
      let x = x0; const flipP = pr(t, at('f2', 0.0), at('f2', 0.9), E.io);
      for (let i = 0; i < 3; i++) {
        const y = tY + (1 - clamp(tilesP)) * 70 + i * 0; const h = tH;
        // staggered drop-in
        const st = pr(t, at('f1', 0.15 + i * 0.6), at('f1', 0.85 + i * 0.6), E.back); const yy = tY + (1 - clamp(st)) * 80 * (tilesP < 1 ? 1 : 0);
        tile(ctx, x, yy, tw[i], h, cols[i], i > 0, i < 2, { alpha: clamp(st) });
        const f = flipP; let tb = S.gen[i], sy = 1; if (f > 0) { if (f < 0.5) { sy = 1 - f * 2; } else { tb = S.ex[i]; sy = (f - 0.5) * 2; } }
        ctx.save(); ctx.globalAlpha *= clamp(st); ctx.translate(x + tw[i] / 2, yy + h / 2); ctx.scale(1, Math.max(0.02, sy)); tb.draw(ctx, -tb.w / 2, -tb.h / 2 - 2, { color: '#FFFFFF', ipaColor: 'rgba(255,255,255,.92)' }); ctx.restore();
        appear(ctx, st, () => S.ord[i].draw(ctx, x + tw[i] / 2 - S.ord[i].w / 2, yy + h + 22, { color: cols[i], ipaColor: rgba(cols[i], 0.8) }), 8);
        x += tw[i];
      }
      ctx.restore();
    }
    // pronoun cards
    const cp = pr(t, at('f3', -0.1), at('f3', 0.6)) * tilesOut;
    if (cp > 0.01) {
      const cardY = 506, cardH = 262, wL = 780, wR = 620, xL = 130, xR = 1790 - wR;
      ctx.save(); ctx.globalAlpha *= clamp(cp);
      paper(ctx, xL, cardY, wL, cardH, { color: COL.auxL, r: 30 }); paper(ctx, xR, cardY, wR, cardH, { color: COL.auxL, r: 30 });
      const dL = du('f3'), tR = at('f3') + dL * 0.52;
      // left: have
      const pl = pr(t, at('f3', 0.2), at('f3', 0.8)); appear(ctx, pl, () => { pill(ctx, xL + 30, cardY - 34, S.hv.w + 70, S.hv.h + 22, COL.aux); S.hv.draw(ctx, xL + 65, cardY - 24, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      let px = xL + 50; S.pnL.forEach((b, i) => { const a = pr(t, at('f3', 0.3 + i * 0.5), at('f3', 0.8 + i * 0.5), E.back); const w = b.w + 56; appear(ctx, clamp(a), () => { pill(ctx, px, cardY + 108, w, b.h + 34, '#FFFFFF', { stroke: COL.subj }); b.draw(ctx, px + 28, cardY + 122, { color: COL.subj, ipaColor: rgba(COL.subj, 0.8) }); }, 20); px += w + 24; });
      // right: has
      const pr2 = pr(t, tR - 0.1, tR + 0.5); appear(ctx, pr2, () => { pill(ctx, xR + 30, cardY - 34, S.hs.w + 70, S.hs.h + 22, COL.aux); S.hs.draw(ctx, xR + 65, cardY - 24, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      px = xR + 50; S.pnR.forEach((b, i) => { const a = pr(t, tR + 0.1 + i * 0.5, tR + 0.6 + i * 0.5, E.back); const w = b.w + 56; appear(ctx, clamp(a), () => { pill(ctx, px, cardY + 108, w, b.h + 34, '#FFFFFF', { stroke: COL.subj }); b.draw(ctx, px + 28, cardY + 122, { color: COL.subj, ipaColor: rgba(COL.subj, 0.8) }); }, 20); px += w + 24; });
      ctx.restore();
    }
    // participle table
    const tbP = pr(t, at('f4', -0.15), at('f4', 0.5)) * (1 - pr(t, at('f7', -0.7), at('f7', -0.3)));
    if (tbP > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(tbP);
      const cx = [690, 1060, 1450], rowY0 = 318, pitch = 112;
      paper(ctx, 150, 196, 1620, 690, { color: COL.paper, r: 34 });
      ctx.fillStyle = COL.partL; ctx.beginPath(); rrect(ctx, 1262, 206, 380, 670, 26); ctx.fill();
      const hcol = [COL.grey, COL.subj, COL.part];
      S.cols.forEach((b, i) => { const w = b.w + 54; pill(ctx, cx[i] - w / 2, 214, w, b.h + 24, hcol[i]); b.draw(ctx, cx[i] - b.w / 2, 226, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      const tg = pr(t, at('f4', 1.2), at('f4', 1.9), E.back); if (tg > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(tg); ctx.translate(1450, 146 + (1 - clamp(tg)) * -10); tape(ctx, -S.third.w / 2 - 28, -4, S.third.w + 56, S.third.h + 20, COL.gold, -0.03); S.third.draw(ctx, -S.third.w / 2, 5, { color: COL.navy, ipaColor: 'rgba(15,42,77,.8)' }); ctx.restore(); }
      const L = Eng.LINE.f5, per = L.dur / 5;
      S.rows.forEach((row, r) => {
        const ra = pr(t, L.t0 + r * per - 0.1, L.t0 + r * per + 0.35), y = rowY0 + r * pitch;
        const active = t >= L.t0 + r * per - 0.05 && t < L.t0 + (r + 1) * per - 0.02;
        appear(ctx, ra, () => {
          if (active) { ctx.fillStyle = 'rgba(255,214,102,.34)'; ctx.beginPath(); rrect(ctx, 176, y - 6, 1568, 104, 22); ctx.fill(); }
          const tg = r === 0 ? S.regT : S.irrT, tc = r === 0 ? COL.subj : COL.aux, tw2 = tg.w + 44; pill(ctx, 330 - tw2 / 2, y + 22, tw2, tg.h + 18, tc); tg.draw(ctx, 330 - tg.w / 2, y + 30, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
          row.forEach((b, i) => b.draw(ctx, cx[i] - b.w / 2, y, { color: i === 2 ? '#0A6B54' : COL.ink }));
          ctx.fillStyle = r === 0 ? COL.ok : COL.bad; ctx.font = '700 46px Lexend, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(r === 0 ? '=' : '≠', 1255, y + 48);
        }, 12);
      });
      ctx.restore();
    }
    // contractions
    const cc = pr(t, at('f7', -0.3), at('f7', 0.2));
    if (cc > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(cc);
      const ys = [236, 402, 626], xl = 560, xr = 1330;
      paper(ctx, 140, 196, 1640, 650, { color: COL.paper, r: 34 });
      ctx.restore();
      for (let r = 0; r < 3; r++) {
        const a = pr(t, r === 2 ? at('f8', 0.5 * du('f8') - 0.2) : at('f7', -0.2 + r * 0.25), r === 2 ? at('f8', 0.5 * du('f8') + 0.4) : at('f7', 0.2 + r * 0.25));
        const ay = ys[r];
        const aShort = pr(t, r === 0 ? at('f7', 0.0) : r === 1 ? at('f7', 0.5 * du('f7') - 0.1) : at('f8', 0.5 * du('f8') + 0.3), r === 0 ? at('f7', 0.6) : r === 1 ? at('f7', 0.5 * du('f7') + 0.5) : at('f8', 0.5 * du('f8') + 0.9));
        const rolesL = r === 0 ? ['subj', 'aux', 'part'] : r === 1 ? ['subj', 'aux', 'part'] : ['subj', 'aux', null];
        appear(ctx, a * cc, () => hero(ctx, S.cl[r], xl - S.cl[r].w / 2, ay, rolesL), 16);
        const sp = r === 0 ? { 0: [1, COL.subj, COL.aux] } : r === 1 ? { 0: [3, COL.subj, COL.aux] } : { 0: [3, COL.subj, COL.aux] };
        const rr = r === 0 ? ['part', null, null] : null;
        if (aShort > 0.01) {
          arcArrow(ctx, [xl + S.cl[r].w / 2 + 34, ay + 54], [xr - S.cr[r].w / 2 - 34, ay + 54], 0, COL.gold, pr(t, aShort > 0 ? (r === 0 ? at('f7', 0) : r === 1 ? at('f7', 0.5 * du('f7') - 0.1) : at('f8', 0.5 * du('f8') + 0.3)) : 0, (r === 0 ? at('f7', 0) : r === 1 ? at('f7', 0.5 * du('f7') - 0.1) : at('f8', 0.5 * du('f8') + 0.3)) + 0.5), 8);
          appear(ctx, aShort, () => S.cr[r].draw(ctx, xr - S.cr[r].w / 2, ay, { split: sp, color: (i) => i === 1 ? (r === 2 ? COL.ink : COL.part) : COL.ink, ipaColor: 'rgba(20,33,61,.72)' }), 16);
          // bracket + meaning label under 's
          if (r >= 1) {
            const lb = r === 1 ? S.lab[0] : S.lab[1], col = r === 1 ? COL.aux : COL.grey, sp0 = (r === 1 ? at('f8', 0.25) : at('f8', 0.5 * du('f8') + 0.9)), bp = pr(t, sp0, sp0 + 0.6);
            const u = S.cr[r].unitBox(0); const bx = xr - S.cr[r].w / 2 + u.x; const w1 = u.w * 0.5;
            if (bp > 0.01) { const px0 = bx + u.w * 0.75, py0 = ay + S.cr[r].h + 16; arcArrow(ctx, [px0, py0 - 2], [px0 + 4, ay + S.cr[r].h - 2], 0, col, bp, 6); appear(ctx, pr(t, sp0 + 0.3, sp0 + 0.8), () => { pill(ctx, bx + u.w * 0.75 - (lb.w + 44) / 2, ay + S.cr[r].h + 16, lb.w + 44, lb.h + 16, col); lb.draw(ctx, bx + u.w * 0.75 - lb.w / 2, ay + S.cr[r].h + 24, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); }); }
          }
        }
      }
    }
  },
});
