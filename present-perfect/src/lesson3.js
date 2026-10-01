/* lesson3.js — groups: still true (for/since), unfinished time, finished-time contrast, American note, been/gone, next lesson, review, speaking */
'use strict';

function miniPortrait(ctx, id, x, y, w, h, s, mood = {}) { // framed photo of a cast member (same rig, small)
  ctx.save(); ctx.translate(x, y); ctx.rotate(mood.rot || 0);
  withShadow(ctx, 'rgba(15,25,50,.35)', 18, 0, 10, () => { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); rrect(ctx, -w / 2 - 12, -h / 2 - 12, w + 24, h + 40, 14); ctx.fill(); });
  ctx.beginPath(); rrect(ctx, -w / 2, -h / 2, w, h, 8); ctx.clip();
  ctx.fillStyle = lg(ctx, 0, -h / 2, 0, h / 2, [[0, '#BFE4F6'], [1, '#F6E3C4']]); ctx.fillRect(-w / 2, -h / 2, w, h);
  const P = Object.assign({}, POSE0, { smile: 0.8, lid: 0.9, brow: 0.2, armL: { x: -110, y: 300, hand: 'rest' }, armR: { x: 110, y: 300, hand: 'rest' } });
  drawFigure(ctx, id, P, 0, h / 2 - 20, s, false, 0);
  ctx.restore();
}

/* ================================================================ STILL TRUE */
group({
  id: 'still1', beats: ['still1'], scene: 'cafe', sceneKeep: true,
  cast: { D: { x: 640, y: 612, s: 1.0, rest: { armL: { x: -110, y: 258, hand: 'rest' }, armR: { x: 110, y: 258, hand: 'rest' }, yaw: 0.2 } }, S: { x: 1320, y: 612, s: 1.0, flip: true, rest: { armL: { x: -110, y: 258, hand: 'rest' }, armR: { x: 110, y: 258, hand: 'rest' }, yaw: 0.2 } } },
  bub: { D: [545, 196], S: [1400, 196] }, bubW: 540, bubHold: 4,
  cam: { from: [960, 560, 1.0], to: [980, 545, 1.05] },
  build() { return { rib: Tx('Use three: still true now', 46, { weight: 700 }) }; },
  pose(K, S, g) {
    K.D.face(0.01, 'warm'); K.S.face(0.01, 'warm'); K.D.look(0.01, 'ui', 0.1); K.S.look(0.01, 'ui', 0.1);
    K.D.look(at('u2', -0.2), 'S', 0.3); K.S.look(at('u2', 0.2), [960, 420], 0.4); K.S.look(at('u3', -0.2), 'D', 0.3); K.D.look(at('u3', 0.2), [960, 420], 0.4);
    K.D.face(at('u2'), 'happy', 0.4); K.S.face(at('u3'), 'happy', 0.4);
  },
  ui(ctx, S, t, g) {
    useRibbon(S, ctx, t, g, S.rib, at('u2', -0.3));
    const p = pr(t, at('u2', -0.3), at('u2', 0.4), E.back); if (p > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(p) * (1 - pr(t, en('u3', 2.8), en('u3', 3.4))); ctx.translate(0, (1 - clamp(p)) * 40); miniPortrait(ctx, 'M', 960, 400, 190, 230, 0.34, { rot: -0.05 }); ctx.restore(); }
  },
});
group({
  id: 'still2', beats: ['still2'], scene: 'cafe', sceneKeep: false,
  cast: LAYB('D', 'S'), cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] }, autoGesture: false,
  build() {
    const S = {};
    S.rib = Tx('Use three: still true now', 46, { weight: 700 });
    S.sA = Tx("I've known her for five years.", 54, { maxW: 1200 }); S.sB = Tx("She's lived here since 2021.", 54, { maxW: 1200 }); S.sC = Tx('She lived in Paris for two years.', 54, { maxW: 1200 });
    S.forP = Tx('for five years', 36); S.sinceP = Tx('since 2021', 36); S.start = Tx('starting point', 32); S.still = Tx('still true now', 32); S.len = Tx('length of time', 32);
    S.nowF = Tx('now', 30, { ipa: 18 }); S.fin = Tx('finished', 36); S.pp = Tx('simple past', 34); S.twoY = Tx('for two years', 36);
    return S;
  },
  pose(K, S, g) { for (const id of ['D', 'S']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.S.nod(at('u4', 0.5)); K.D.nod(at('u4', 2.8)); K.D.face(at('u5'), 'curious', 0.5); K.S.face(at('u5'), 'thinking', 0.5); K.S.nod(at('u6', 0.6)); },
  ui(ctx, S, t, g) {
    useRibbon(S, ctx, t, g, S.rib);
    const ax0 = 520, ax1 = 1760, ay = 650, sx = 700, nowX = 1380;
    const p1 = pr(t, at('u4', -0.2), at('u4', 0.4)) * (1 - pr(t, at('u5', -0.3), at('u5', 0.1)));
    if (p1 > 0.01) {
      ctx.save(); ctx.globalAlpha *= p1;
      const fa = pr(t, at('u4', 0.0), at('u4', 0.5), E.back); appear(ctx, fa, () => { const w = S.sA.w + 90; tape(ctx, 960 - w / 2, 160, w, S.sA.h + 36, COL.partL, -0.004); const wi = wordIndex(S.sA, 'for');
        S.sA.draw(ctx, 960 - S.sA.w / 2, 178, { hi: pr(t, at('u4', 0.3), 1) > 0 ? { [wi]: rgba(COL.time, 0.2), [wi + 1]: rgba(COL.time, 0.2), [wi + 2]: rgba(COL.time, 0.2) } : null, color: (i) => i >= wi ? COL.time : COL.ink, ipaColor: (i) => i >= wi ? rgba(COL.time, 0.85) : 'rgba(20,33,61,.72)' }); });
      const sb = pr(t, at('u4', du('u4') * 0.5 - 0.1), at('u4', du('u4') * 0.5 + 0.5), E.back); appear(ctx, sb, () => { const w = S.sB.w + 90; tape(ctx, 960 - w / 2, 318, w, S.sB.h + 36, COL.subjL, 0.004); const wi = wordIndex(S.sB, 'since');
        S.sB.draw(ctx, 960 - S.sB.w / 2, 336, { hi: { [wi]: rgba(COL.time, 0.2), [wi + 1]: rgba(COL.time, 0.2) }, color: (i) => i >= wi ? COL.time : COL.ink, ipaColor: (i) => i >= wi ? rgba(COL.time, 0.85) : 'rgba(20,33,61,.72)' }); });
      axis(ctx, 200, ax1, ay, 0); nowFlag(ctx, nowX, ay, 118, { label: S.nowF });
      // continuing line through now
      const lp = pr(t, at('u4', 0.3), at('u4', 1.5), E.io);
      ctx.strokeStyle = COL.part; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, ay); ctx.lineTo(lerp(sx, nowX + 150, lp), ay); ctx.stroke();
      if (lp > 0.99) { ctx.setLineDash([2, 22]); ctx.beginPath(); ctx.moveTo(nowX + 150, ay); ctx.lineTo(nowX + 300, ay); ctx.stroke(); ctx.setLineDash([]); }
      // for: bracket (length)
      const bp = pr(t, at('u4', 0.9), at('u4', 2.2), E.io); bracket(ctx, sx, nowX, ay - 40, -70, COL.time, bp, true, 8);
      appear(ctx, pr(t, at('u4', 1.8), at('u4', 2.5)), () => { const w = S.forP.w + 54; pill(ctx, (sx + nowX) / 2 - w / 2, ay - 232, w, S.forP.h + 22, COL.time); S.forP.draw(ctx, (sx + nowX) / 2 - S.forP.w / 2, ay - 222, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      // since: start flag
      const sp = pr(t, at('u4', du('u4') * 0.5 + 0.2), at('u4', du('u4') * 0.5 + 0.9), E.back);
      if (sp > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(sp); ctx.strokeStyle = COL.navy; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx, ay + 6); ctx.lineTo(sx, ay - 150); ctx.stroke(); ctx.fillStyle = COL.aux; ctx.beginPath(); ctx.moveTo(sx, ay - 150); ctx.lineTo(sx + 100, ay - 128 + Math.sin(t * 3) * 3); ctx.lineTo(sx, ay - 100); ctx.closePath(); ctx.fill(); ctx.restore();
        appear(ctx, pr(t, at('u4', du('u4') * 0.5 + 0.7), at('u4', du('u4') * 0.5 + 1.3)), () => { const w = S.sinceP.w + 54; pill(ctx, sx - w / 2, ay + 56, w, S.sinceP.h + 22, COL.aux); S.sinceP.draw(ctx, sx - S.sinceP.w / 2, ay + 66, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); S.start.draw(ctx, sx - S.start.w / 2, ay + 138, { color: COL.aux, ipaColor: 'rgba(217,102,11,.85)' }); }); }
      appear(ctx, pr(t, at('u4', 3.0), at('u4', 3.6)), () => { const w = S.still.w + 54; pill(ctx, nowX + 40, ay + 56, w, S.still.h + 22, COL.part); S.still.draw(ctx, nowX + 67, ay + 66, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      ctx.restore();
    }
    // finished situation -> simple past
    const p2 = pr(t, at('u5', 0.0), at('u5', 0.6)); if (p2 > 0.01) {
      ctx.save(); ctx.globalAlpha *= p2; const ex = 1040;
      const w = S.sC.w + 90; appear(ctx, pr(t, at('u6', -0.3), at('u6', 0.3), E.back), () => { tape(ctx, 960 - w / 2, 190, w, S.sC.h + 36, COL.subjL, -0.004); S.sC.draw(ctx, 960 - S.sC.w / 2, 208, { hi: sweep(S.sC, 'u6', t) }); });
      axis(ctx, 200, ax1, ay, 0); nowFlag(ctx, nowX + 100, ay, 118, { label: S.nowF });
      ctx.strokeStyle = COL.grey; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx - 120, ay); ctx.lineTo(ex, ay); ctx.stroke();
      for (const x of [sx - 120, ex]) { ctx.strokeStyle = COL.navy; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, ay + 6); ctx.lineTo(x, ay - 100); ctx.stroke(); }
      bracket(ctx, sx - 120, ex, ay - 120, -50, COL.time, pr(t, at('u5', 1.0), at('u5', 2.0)), true, 8);
      appear(ctx, pr(t, at('u6', 0.8), at('u6', 1.4)), () => { const w2 = S.twoY.w + 54; pill(ctx, (sx - 120 + ex) / 2 - w2 / 2, ay - 232, w2, S.twoY.h + 22, COL.time); S.twoY.draw(ctx, (sx - 120 + ex) / 2 - S.twoY.w / 2, ay - 222, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      appear(ctx, pr(t, at('u6', 1.4), at('u6', 2.0)), () => { const w3 = S.fin.w + 54; pill(ctx, (sx - 120 + ex) / 2 - w3 / 2, ay + 56, w3, S.fin.h + 22, COL.grey); S.fin.draw(ctx, (sx - 120 + ex) / 2 - S.fin.w / 2, ay + 66, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); const w4 = S.pp.w + 54; pill(ctx, 1560 - w4 / 2, ay + 56, w4, S.pp.h + 22, COL.subj); S.pp.draw(ctx, 1560 - S.pp.w / 2, ay + 66, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      ctx.restore();
    }
  },
});

/* ================================================================ UNFINISHED PERIOD */
group({
  id: 'per1', beats: ['per1'], scene: 'office', sceneKeep: true,
  cast: { M: { x: 640, y: 612, s: 1.0, rest: { armL: { x: -110, y: 260, hand: 'rest' }, armR: { x: 110, y: 260, hand: 'rest' }, yaw: 0.2 } }, D: { x: 1320, y: 612, s: 1.0, flip: true, rest: { armL: { x: -110, y: 260, hand: 'rest' }, armR: { x: 110, y: 260, hand: 'rest' }, yaw: 0.25 } } },
  bub: { M: [560, 190] }, bubW: 560, bubHold: 4,
  cam: { from: [960, 560, 1.0], to: [980, 545, 1.05] },
  build() { return { rib: Tx('Use four: unfinished time', 46, { weight: 700 }) }; },
  pose(K, S, g) {
    K.M.face(0.01, 'warm'); K.D.face(0.01, 'warm'); K.M.look(0.01, 'ui', 0.1); K.D.look(0.01, 'ui', 0.1); K.M.look(at('p2', -0.2), 'D', 0.3); K.D.look(at('p2', 0.1), 'M', 0.3);
    K.M.arm('L', at('p2', -0.2), { x: -150, y: 170, hand: 'grip', item: 'planner' }, 0.6, E.back); K.M.arm('L', en('p2', 1.4), { x: -110, y: 260, hand: 'rest', item: null }, 0.7); K.M.face(at('p2'), 'neutral', 0.3); K.D.face(at('p2', 1.0), 'curious', 0.4); K.D.nod(at('p2', 1.6));
  },
  ui(ctx, S, t, g) { useRibbon(S, ctx, t, g, S.rib, at('p2', -0.3)); },
});
group({
  id: 'per2', beats: ['per2'], scene: 'office', sceneKeep: false,
  cast: LAYB('M', 'D'), cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] }, autoGesture: false,
  build() {
    const S = {};
    S.rib = Tx('Use four: unfinished time', 46, { weight: 700 });
    S.sT = Tx("I've had two meetings so far today.", 50, { maxW: 1100 }); S.sY = Tx('I had two meetings yesterday.', 50, { maxW: 1100 }); S.sA = Tx('I had two meetings today.', 50, { maxW: 1000 });
    S.today = Tx('today', 34); S.notF = Tx('not finished', 34); S.yest = Tx('yesterday', 34); S.fin = Tx('finished', 34); S.nowF = Tx('now', 30, { ipa: 18 });
    S.adv = Tx('Advanced note', 40, { weight: 700 }); S.also = Tx('also possible', 36); S.view = Tx("speaker's view", 44);
    return S;
  },
  pose(K, S, g) { for (const id of ['M', 'D']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.D.nod(at('p3', 0.5)); K.M.nod(at('p4', 0.2)); K.D.face(at('p5'), 'thinking', 0.5); K.M.face(at('p5'), 'thinking', 0.5); },
  ui(ctx, S, t, g) {
    useRibbon(S, ctx, t, g, S.rib);
    const x0 = 470, x1 = 1450, barH = 92, yT = 340, yY = 700;
    const mainP = pr(t, at('p3', -0.2), at('p3', 0.4)) * (1 - pr(t, at('p5', -0.4), at('p5', 0.0)));
    if (mainP > 0.01) {
      ctx.save(); ctx.globalAlpha *= mainP;
      // today row
      const w = S.sT.w + 90; tape(ctx, 960 - w / 2, 160, w, S.sT.h + 36, COL.partL, -0.004); S.sT.draw(ctx, 960 - S.sT.w / 2, 178, { hi: sweep(S.sT, 'p2', t) });
      const nowT = 1060;
      ctx.fillStyle = COL.partL; ctx.beginPath(); rrect(ctx, x0, yT, nowT - x0, barH, 26); ctx.fill();
      ctx.fillStyle = 'rgba(138,148,166,.18)'; ctx.beginPath(); rrect(ctx, nowT, yT, x1 - nowT, barH, 26); ctx.fill(); ctx.strokeStyle = COL.grey; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.stroke(); ctx.setLineDash([]);
      ICON.meeting(ctx, 640, yT + barH / 2, 0.75, 1, true); ICON.meeting(ctx, 870, yT + barH / 2, 0.75, pr(t, at('p3', 0.8), at('p3', 1.3)), true); ICON.meeting(ctx, 1260, yT + barH / 2, 0.75, 0.9, false);
      nowFlag(ctx, nowT, yT + barH / 2 + 0, 140, { label: S.nowF });
      const wa = pr(t, at('p3', 1.0), at('p3', 1.6)); appear(ctx, wa, () => { pill(ctx, x0, yT + barH + 20, S.today.w + 50, S.today.h + 20, COL.part); S.today.draw(ctx, x0 + 25, yT + barH + 30, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); pill(ctx, x1 - S.notF.w - 50, yT + barH + 20, S.notF.w + 50, S.notF.h + 20, COL.grey); S.notF.draw(ctx, x1 - S.notF.w - 25, yT + barH + 30, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      // yesterday row
      const pY = pr(t, at('p3', du('p3') * 0.55), at('p3', du('p3') * 0.55 + 0.6), E.back);
      appear(ctx, pY, () => {
        const w2 = S.sY.w + 90; tape(ctx, 960 - w2 / 2, 520, w2, S.sY.h + 36, COL.subjL, 0.004); S.sY.draw(ctx, 960 - S.sY.w / 2, 538, { hi: sweep(S.sY, 'p4', t) });
        ctx.fillStyle = COL.timeL; ctx.beginPath(); rrect(ctx, x0, yY, 780, barH, 26); ctx.fill(); ctx.strokeStyle = COL.time; ctx.lineWidth = 4; ctx.stroke();
        ICON.meeting(ctx, 640, yY + barH / 2, 0.75, 1, true); ICON.meeting(ctx, 870, yY + barH / 2, 0.75, 1, true);
        nowFlag(ctx, 1350, yY + barH / 2, 110, { label: S.nowF });
        pill(ctx, x0, yY + barH + 20, S.yest.w + 50, S.yest.h + 20, COL.time); S.yest.draw(ctx, x0 + 25, yY + barH + 30, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
        pill(ctx, x0 + 780 - S.fin.w - 50, yY + barH + 20, S.fin.w + 50, S.fin.h + 20, COL.grey); S.fin.draw(ctx, x0 + 780 - S.fin.w - 25, yY + barH + 30, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' });
      });
      ctx.restore();
    }
    // advanced note
    const ap = pr(t, at('p5', -0.2), at('p5', 0.6), E.back);
    if (ap > 0.01) {
      ctx.save(); ctx.globalAlpha *= clamp(ap); ctx.translate(0, (1 - clamp(ap)) * 30);
      paper(ctx, 360, 230, 1200, 520, { color: COL.paper, r: 36 });
      const w = S.adv.w + 90; tape(ctx, 960 - w / 2, 204, w, S.adv.h + 30, COL.time, -0.02); S.adv.draw(ctx, 960 - S.adv.w / 2, 216, { color: '#fff', ipaColor: 'rgba(255,255,255,.88)' });
      S.view.draw(ctx, 960 - S.view.w / 2, 330, { color: COL.time, ipaColor: 'rgba(122,71,204,.85)' });
      const w2 = S.sT.w + 80; tape(ctx, 960 - w2 / 2, 480, w2, S.sT.h + 30, COL.partL, -0.004); S.sT.draw(ctx, 960 - S.sT.w / 2, 494);
      const w3 = S.sA.w + 80; tape(ctx, 960 - w3 / 2, 640, w3, S.sA.h + 30, COL.subjL, 0.004); S.sA.draw(ctx, 960 - S.sA.w / 2, 654);
      appear(ctx, pr(t, at('p5', du('p5') * 0.6), at('p5', du('p5') * 0.6 + 0.6)), () => { const w4 = S.also.w + 60; pill(ctx, 960 + w3 / 2 - 100, 616, w4, S.also.h + 22, COL.ok); S.also.draw(ctx, 960 + w3 / 2 - 70, 626, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
      ctx.restore();
    }
  },
});

/* ================================================================ FINISHED TIME */
group({
  id: 'fin1', beats: ['fin1'], scene: 'studio', sceneKeep: true,
  cast: LAY2('S', 'D', 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.025] }, autoGesture: false,
  build() {
    const S = {};
    S.w = [Tx('yesterday', 50), Tx('last week', 50), Tx('in 2022', 50)]; S.sp = Tx('simple past', 54, { weight: 700 });
    S.ok = Tx('I saw her yesterday.', 56, { maxW: 1000 }); S.no = Tx("I've seen her yesterday.", 56, { maxW: 1000 });
    return S;
  },
  pose(K, S, g) { for (const id of ['S', 'D']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.D.nod(at('x1', 1.0)); K.S.nod(at('x2', 0.2)); K.S.face(at('x3'), 'worried', 0.4); K.D.face(at('x3'), 'thinking', 0.4); },
  ui(ctx, S, t) {
    const d = du('x1'), xs = [430, 960, 1490];
    S.w.forEach((tb, i) => { const a = pr(t, at('x1', d * (0.3 + i * 0.2)), at('x1', d * (0.3 + i * 0.2) + 0.6), E.back); if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(0, (1 - clamp(a)) * 40);
      ICON.calendar(ctx, xs[i], 236, 0.85, 1, i * 4 + 2); const w = tb.w + 70; pill(ctx, xs[i] - w / 2, 316, w, tb.h + 28, COL.time); tb.draw(ctx, xs[i] - tb.w / 2, 330, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); ctx.restore(); });
    const ap = pr(t, at('x1', d * 0.82), at('x1', d * 0.82 + 0.6), E.back);
    if (ap > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(ap); arcArrow(ctx, [960, 470], [960, 535], 0, COL.navy, 1, 8); const w = S.sp.w + 90; pill(ctx, 960 - w / 2, 548, w, S.sp.h + 28, COL.subj); S.sp.draw(ctx, 960 - S.sp.w / 2, 562, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); ctx.restore(); }
    const okP = pr(t, at('x2', -0.1), at('x2', 0.5), E.back);
    appear(ctx, okP, () => { const w = S.ok.w + 140; tape(ctx, 960 - w / 2, 700, w, S.ok.h + 40, COL.partL, -0.004); S.ok.draw(ctx, 960 - S.ok.w / 2 + 30, 720, { hi: sweep(S.ok, 'x2', t) }); checkBadge(ctx, 960 - w / 2 + 44, 700 + (S.ok.h + 40) / 2, 34, true, 1, E.back(okP)); });
    const nP = pr(t, at('x3', 0.2), at('x3', 0.8), E.back);
    if (nP > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(nP); ctx.globalAlpha *= 1; // wrong example crossed out, shown over the right one
      ctx.translate(0, 0); const w = S.no.w + 140, y = 700; ctx.fillStyle = 'rgba(255,253,247,.0)';
      withShadow(ctx, 'rgba(15,25,50,.3)', 20, 0, 10, () => { ctx.fillStyle = COL.paper; ctx.beginPath(); rrect(ctx, 960 - w / 2 - 20, y - 14, w + 40, S.no.h + 80, 24); ctx.fill(); });
      tape(ctx, 960 - w / 2, y, w, S.no.h + 40, COL.notL, 0.004); S.no.draw(ctx, 960 - S.no.w / 2 + 30, y + 20, { strike: new Set(S.no.L.units.map((_, i) => i)), strikeColor: 'rgba(201,53,69,.85)', color: '#5C6578', ipaColor: 'rgba(92,101,120,.7)' });
      checkBadge(ctx, 960 - w / 2 + 44, y + (S.no.h + 40) / 2, 34, false, 1, E.back(nP)); ctx.restore(); }
  },
});

/* ================================================================ AMERICAN NOTE */
group({
  id: 'usn', beats: ['usn'], scene: 'studio', sceneKeep: true,
  cast: LAY2('M', 'S', 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.025] }, autoGesture: false,
  build() {
    const S = {};
    S.tag = Tx('American English note', 42, { weight: 700 }); S.hp = Tx('present perfect', 38); S.hs = Tx('simple past', 38); S.both = Tx('both are normal', 40, { weight: 700 });
    S.L = [Tx("I've just eaten.", 50), Tx("I've already finished.", 50), Tx('Have you finished yet?', 50)];
    S.R = [Tx('I just ate.', 50), Tx('I already finished.', 50), Tx('Did you finish yet?', 50)];
    return S;
  },
  pose(K, S, g) { for (const id of ['M', 'S']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.M.nod(at('m1', 1.0)); K.S.nod(at('m2', 0.4)); K.M.face(at('m2'), 'happy', 0.5); K.S.face(at('m2'), 'happy', 0.5); },
  ui(ctx, S, t) {
    const tp = pr(t, at('m1', -0.2), at('m1', 0.5), E.back); if (tp > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(tp); const w = S.tag.w + 130; banner(ctx, 960, 170 + (1 - clamp(tp)) * -20, w, 92, COL.time); S.tag.draw(ctx, 960 - S.tag.w / 2, 170 - S.tag.h / 2 - 2 + (1 - clamp(tp)) * -20, { color: '#fff', ipaColor: 'rgba(255,255,255,.88)' }); ctx.restore(); }
    const hp = pr(t, at('m1', du('m1') * 0.4), at('m1', du('m1') * 0.4 + 0.6), E.back);
    const xl = 560, xr = 1360;
    if (hp > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(hp); for (const [cx, tb, col] of [[xl, S.hp, COL.part], [xr, S.hs, COL.subj]]) { const w = tb.w + 90; pill(ctx, cx - w / 2, 262, w, tb.h + 26, col); tb.draw(ctx, cx - tb.w / 2, 275, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); checkBadge(ctx, cx + w / 2 - 6, 266, 26, true); } ctx.restore(); }
    for (let i = 0; i < 3; i++) {
      const a = pr(t, at('m2', du('m2') * (i * 0.3) - 0.1), at('m2', du('m2') * (i * 0.3) + 0.5), E.back); if (a <= 0.01) continue; const y = 380 + i * 150;
      ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(0, (1 - clamp(a)) * 30);
      for (const [cx, tb, col] of [[xl, S.L[i], COL.partL], [xr, S.R[i], COL.subjL]]) { const w = tb.w + 80; tape(ctx, cx - w / 2, y, w, tb.h + 34, col, (i % 2 ? 1 : -1) * 0.004); tb.draw(ctx, cx - tb.w / 2, y + 14, { hi: sweep(tb, 'm2', t, i / 3, (i + 1) / 3 > 1 ? 1 : (i + 1) / 3) }); }
      ctx.restore();
    }
    appear(ctx, pr(t, at('m2', du('m2') * 0.9), at('m2', du('m2') * 0.9 + 0.7)), () => { const w = S.both.w + 100; pill(ctx, 960 - w / 2, 836, w, S.both.h + 26, COL.ok); S.both.draw(ctx, 960 - S.both.w / 2, 849, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
  },
});

/* ================================================================ BEEN vs GONE */
group({
  id: 'gone1', beats: ['gone1'], scene: 'cafe', sceneKeep: true,
  cast: { D: { x: 640, y: 612, s: 1.0, rest: { armL: { x: -110, y: 258, hand: 'rest' }, armR: { x: 110, y: 258, hand: 'rest' }, yaw: 0.2 } }, M: { x: 1320, y: 612, s: 1.0, flip: true, rest: { armL: { x: -110, y: 258, hand: 'rest' }, armR: { x: 110, y: 258, hand: 'rest' }, yaw: 0.2 } } },
  bub: { D: [545, 196], M: [1400, 196] }, bubW: 520, bubHold: 3,
  cam: { from: [960, 560, 1.0], to: [980, 545, 1.05] },
  pose(K, S, g) { K.D.face(0.01, 'curious'); K.M.face(0.01, 'warm'); K.D.look(0.01, 'M', 0.1); K.M.look(0.01, 'D', 0.1); K.M.face(at('g2'), 'neutral', 0.4); K.D.face(at('g2', 1.2), 'surprised', 0.4); },
  ui() {},
});
group({
  id: 'gone2', beats: ['gone2'], scene: 'travel', sceneKeep: false,
  cast: LAYB('D', 'M'), cam: { from: [960, 540, 1.0], to: [960, 540, 1.02] }, autoGesture: false,
  build() {
    const S = {};
    S.sg = Tx("She's gone to London.", 50, { maxW: 900 }); S.sb = Tx("She's been to London.", 50, { maxW: 900 });
    S.away = Tx('away now', 36); S.exp = Tx('experience', 36);
    S.hm = Tx('home', 30); S.ln = Tx('London', 30);
    return S;
  },
  pose(K, S, g) { for (const id of ['D', 'M']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'warm'); } K.D.nod(at('g3', 0.6)); K.M.nod(at('g5', 0.6)); K.M.face(at('g5'), 'thinking', 0.4); },
  ui(ctx, S, t) {
    const lane = (y, tb, a0, a1, kind) => {
      const p = pr(t, a0 - 0.2, a0 + 0.5, E.back); if (p <= 0.01) return;
      ctx.save(); ctx.globalAlpha *= clamp(p); ctx.translate(0, (1 - clamp(p)) * 30);
      paper(ctx, 470, y, 980, 340, { color: COL.paper, r: 32 });
      const w = tb.w + 80; tape(ctx, 960 - w / 2, y + 20, w, tb.h + 34, kind === 'gone' ? COL.auxL : COL.partL, -0.004); tb.draw(ctx, 960 - tb.w / 2, y + 34, {});
      const hx = 620, lx = 1290, iy = y + 270;
      ICON.house(ctx, hx, iy - 34, 0.95); ICON.tower(ctx, lx, iy - 12, 0.8);
      S.hm.draw(ctx, hx - S.hm.w / 2, iy + 10, { color: COL.grey, ipaColor: 'rgba(100,110,130,.8)' }); S.ln.draw(ctx, lx - S.ln.w / 2, iy + 10, { color: COL.grey, ipaColor: 'rgba(100,110,130,.8)' });
      const ap = pr(t, a0 + 0.2, a0 + 1.6, E.io); arcArrow(ctx, [hx + 80, iy - 60], [lx - 90, iy - 60], -90, kind === 'gone' ? COL.aux : COL.part, ap, 8);
      if (ap > 0.1) { const q = Math.min(ap, 1), px = lerp(hx + 80, lx - 90, q), py = iy - 60 - Math.sin(q * Math.PI) * 82 * 1; ICON.plane(ctx, px, py - 6, 0.5, 1, -0.2 + q * 0.4); }
      if (kind === 'been') { const bp = pr(t, a1, a1 + 1.4, E.io); arcArrow(ctx, [lx - 90, iy + 6], [hx + 80, iy + 6], 70, COL.part, bp, 8); }
      ctx.restore();
    };
    lane(150, S.sg, at('g3'), 0, 'gone');
    appear(ctx, pr(t, at('g3', du('g3') * 0.6), at('g3', du('g3') * 0.6 + 0.6)), () => { const w = S.away.w + 60; pill(ctx, 1450 - w - 20, 130, w, S.away.h + 22, COL.aux); S.away.draw(ctx, 1450 - w + 10, 140, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
    lane(530, S.sb, at('g4'), at('g5', 0.2), 'been');
    appear(ctx, pr(t, at('g5', 1.2), at('g5', 1.8)), () => { const w = S.exp.w + 60; pill(ctx, 1450 - w - 20, 510, w, S.exp.h + 22, COL.part); S.exp.draw(ctx, 1450 - w + 10, 520, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); });
  },
});

/* ================================================================ NEXT LESSON */
group({
  id: 'cont', beats: ['cont'], scene: 'studio', sceneKeep: true,
  cast: LAY2('S', 'M', 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.025] }, autoGesture: false,
  build() { return { t: Tx('Present perfect continuous', 72, { serif: true, weight: 700, ipa: 38, maxW: 1100 }), tag: Tx('Not in this lesson', 44, { weight: 700 }), nx: Tx('Next lesson', 40, { weight: 700 }) }; },
  pose(K, S, g) { for (const id of ['S', 'M']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'curious'); } K.S.nod(at('z1', 1.0)); K.M.face(at('z1', 3.5), 'warm', 0.5); },
  ui(ctx, S, t) {
    const p = pr(t, at('z1', 0.4), at('z1', 1.3), E.spring); if (p <= 0.01) return;
    ctx.save(); ctx.globalAlpha *= clamp(p); ctx.translate(960, 480); ctx.scale(0.9 + 0.1 * Math.min(1, p), 0.9 + 0.1 * Math.min(1, p)); ctx.translate(-960, -480);
    paper(ctx, 340, 230, 1240, 420, { color: COL.paper, r: 44, rot: -0.01 });
    S.t.draw(ctx, 960 - S.t.w / 2, 300, { color: COL.navy, ipaColor: 'rgba(15,42,77,.75)' });
    const w = S.tag.w + 100; tape(ctx, 960 - w / 2, 560, w, S.tag.h + 30, COL.timeL, 0.012); S.tag.draw(ctx, 960 - S.tag.w / 2, 572, { color: COL.time, ipaColor: 'rgba(122,71,204,.85)' });
    const w2 = S.nx.w + 90; banner(ctx, 560, 220, w2, 72, COL.gold); S.nx.draw(ctx, 560 - S.nx.w / 2, 220 - S.nx.h / 2 - 2, { color: COL.navy, ipaColor: 'rgba(15,42,77,.8)' });
    ctx.restore();
  },
});

/* ================================================================ REVIEW */
group({
  id: 'sum', beats: ['sum'], scene: 'studio', sceneKeep: true,
  cast: LAY2('D', 'M', 1020, 0.92), cam: { from: [960, 540, 1.0], to: [960, 540, 1.025] }, autoGesture: false,
  build() {
    const S = {}, z = 44;
    S.f = [Tx('subject', z), Tx('have or has', z), Tx('past participle', z)]; S.fw = S.f.map(t => t.w + 60); S.fx = []; let x = 960 - S.fw.reduce((a, b) => a + b, 0) / 2; for (const w of S.fw) { S.fx.push(x); x += w; }
    S.u = [Tx('experience', 40, { weight: 700 }), Tx('recent result', 40, { weight: 700, maxW: 300 }), Tx('still true', 40, { weight: 700 }), Tx('unfinished time', 40, { weight: 700, maxW: 300 })];
    S.ft = Tx('finished time', 38); S.sp = Tx('simple past', 38);
    return S;
  },
  pose(K, S, g) { for (const id of ['D', 'M']) { K[id].look(0.01, 'ui', 0.1); K[id].face(0.01, 'happy'); } K.D.nod(at('v2', 0.3)); K.M.nod(at('v2', 2.4)); K.D.nod(at('v3', 0.6)); },
  ui(ctx, S, t) {
    const cols = [COL.subj, COL.aux, COL.part];
    S.f.forEach((tb, i) => { const a = pr(t, at('v1', 0.1 + i * 0.35), at('v1', 0.7 + i * 0.35), E.back); tilesDraw(ctx, [{ tb, color: cols[i], x: S.fx[i], w: S.fw[i], a: clamp(a), dy: (1 - clamp(a)) * 40, tabL: i > 0, tabR: i < 2 }], 190, 110); });
    const d = du('v2'), cw = 350, ch = 300, gap = 44, x0 = 960 - (4 * cw + 3 * gap) / 2, y = 380, cc = [COL.part, COL.aux, COL.time, COL.subj];
    S.u.forEach((tb, i) => {
      const a = pr(t, at('v2', d * [0.1, 0.3, 0.52, 0.76][i] - 0.1), at('v2', d * [0.1, 0.3, 0.52, 0.76][i] + 0.5), E.back); if (a <= 0.01) return;
      const x = x0 + i * (cw + gap); ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(0, (1 - clamp(a)) * 40);
      paper(ctx, x, y, cw, ch, { color: COL.paper, r: 30, stroke: cc[i], sw: 5 });
      const ix = x + cw / 2, iy = y + 100;
      if (i === 0) { ICON.pin(ctx, ix, iy + 40, 1.0, 1, COL.part); } else if (i === 1) ICON.report(ctx, ix, iy, 0.7); else if (i === 2) { ICON.clock(ctx, ix, iy, 0.95, 1, 0.9); } else ICON.calendar(ctx, ix, iy, 0.85, 1, 7);
      tb.draw(ctx, ix - tb.w / 2, y + 190, { color: cc[i], ipaColor: rgba(cc[i], 0.85) });
      ctx.restore();
    });
    const p3 = pr(t, at('v3', -0.1), at('v3', 0.6), E.back);
    if (p3 > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(p3); ctx.translate(0, (1 - clamp(p3)) * 30); const w1 = S.ft.w + 80, w2 = S.sp.w + 80, yy = 750; pill(ctx, 960 - 160 - w1 - 0, yy, w1, S.ft.h + 26, COL.time); S.ft.draw(ctx, 960 - 160 - w1 + 40, yy + 13, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); arcArrow(ctx, [960 - 130, yy + 40], [960 + 124, yy + 40], 0, COL.navy, pr(t, at('v3', 0.2), at('v3', 0.9)), 8); pill(ctx, 960 + 160, yy, w2, S.sp.h + 26, COL.subj); S.sp.draw(ctx, 960 + 200, yy + 13, { color: '#fff', ipaColor: 'rgba(255,255,255,.9)' }); ctx.restore(); }
  },
});

/* ================================================================ SPEAKING + END */
group({
  id: 'speak', beats: ['speak'], scene: 'studio', sceneKeep: true,
  cast: { S: { x: 540, y: 975, s: 0.98 }, M: { x: 960, y: 995, s: 1.02, z: 1 }, D: { x: 1380, y: 975, s: 0.98 } },
  cam: { from: [960, 540, 1.0], to: [960, 540, 1.03] }, autoGesture: false, noLogo: false,
  build() {
    const S = {};
    S.rib = Tx('Your turn', 80, { serif: true, weight: 700, ipa: 40 });
    S.p = [Tx("Something you've done today.", 46, { maxW: 480 }), Tx("A place you've never visited.", 46, { maxW: 480 }), Tx("Someone you've known for years.", 46, { maxW: 480 })];
    S.great = Tx('Great work!', 108, { serif: true, weight: 700, ipa: 50 }); S.see = Tx('See you next time.', 54);
    S.say = Tx('Say three sentences', 44, { weight: 700 });
    return S;
  },
  pose(K, S, g) {
    for (const id of ['S', 'M', 'D']) { K[id].look(0.01, 'cam', 0.1); K[id].face(0.01, 'warm'); }
    K.M.nod(at('y1', 0.5)); K.D.nod(at('y1', 3.0)); K.S.nod(at('y1', 5.5)); for (const id of ['S', 'M', 'D']) K[id].face(at('y3'), 'happy', 0.5);
    K.S.wave(at('y3', 0.2), at('y3', 3.0), 'R'); K.D.wave(at('y3', 0.6), at('y3', 3.0), 'L'); K.M.nod(at('y3', 0.4), 2); for (const id of ['S', 'D']) K[id].look(at('y3'), 'cam', 0.3);
  },
  ui(ctx, S, t, g) {
    const y1 = Eng.LINE.y1, y2 = Eng.LINE.y2, y3 = Eng.LINE.y3;
    const pre = t < y3.t0 - 0.2 ? 1 : 1 - pr(t, y3.t0 - 0.2, y3.t0 + 0.2);
    if (pre > 0.01) {
      ctx.save(); ctx.globalAlpha *= pre;
      const rp = pr(t, y1.t0 - 0.1, y1.t0 + 0.6, E.spring); ctx.save(); ctx.globalAlpha *= clamp(rp); S.rib.draw(ctx, 960 - S.rib.w / 2, 120 + (1 - clamp(rp)) * -20, { color: COL.navy, ipaColor: 'rgba(15,42,77,.75)' }); ctx.restore();
      const cw = 540, ch = 250, xs = [120, 690, 1260], ic = ['clock', 'pin', 'handshake'], cc = [COL.part, COL.aux, COL.time], d = y1.dur;
      S.p.forEach((tb, i) => { const a = pr(t, y1.t0 + d * [0.3, 0.52, 0.76][i] - 0.2, y1.t0 + d * [0.3, 0.52, 0.76][i] + 0.4, E.back); if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= clamp(a); ctx.translate(0, (1 - clamp(a)) * 40);
        paper(ctx, xs[i], 330, cw, ch, { color: COL.paper, r: 30, stroke: cc[i], sw: 5 }); if (i === 0) ICON.clock(ctx, xs[i] + 80, 420, 0.7, 1, 0.9); else if (i === 1) ICON.pin(ctx, xs[i] + 80, 466, 0.8, 1, COL.aux); else ICON.handshake(ctx, xs[i] + 80, 430, 0.9);
        tb.draw(ctx, xs[i] + 150, 350, { align: 'l', w: 360, color: COL.ink }); ctx.restore(); });
      // speaking time: ring over the hold
      if (t >= y2.t0 - 0.2) { const a = pr(t, y2.t0 - 0.2, y2.t0 + 0.4); ctx.save(); ctx.globalAlpha *= a; const p = clamp((t - y2.t0) / y2.dur); ring(ctx, 960, 690, 44, 1 - p, COL.part, 12); ctx.fillStyle = COL.navy; ctx.beginPath(); rrect(ctx, 960 - 11, 664, 22, 36, 11); ctx.fill(); ctx.strokeStyle = COL.navy; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(960, 690, 17, 0.1, Math.PI - 0.1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(960, 707); ctx.lineTo(960, 718); ctx.stroke(); ctx.restore(); }
      ctx.restore();
    }
    const fp = pr(t, y3.t0 - 0.1, y3.t0 + 0.8, E.spring);
    if (fp > 0.01) { ctx.save(); ctx.globalAlpha *= clamp(fp); ctx.translate(0, (1 - clamp(fp)) * -30);
      const w = Math.max(S.great.w, S.see.w) + 160; paper(ctx, 960 - w / 2, 150, w, 330, { color: 'rgba(255,253,247,.94)', r: 44 }); S.great.draw(ctx, 960 - S.great.w / 2, 176, { color: COL.navy, ipaColor: 'rgba(15,42,77,.75)' }); S.see.draw(ctx, 960 - S.see.w / 2, 346, { color: COL.part, ipaColor: 'rgba(14,138,110,.85)' }); ctx.restore(); }
  },
});
