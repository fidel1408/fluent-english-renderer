/* gfx.js — teaching graphics: bubbles, ribbons, tiles, brackets, arrows, badges, icons.
   All shapes are generated once or are cheap per-frame paths (a few dozen segments).           */
'use strict';

const COL = {
  ink: '#14213D', paper: '#FFFDF7', paper2: '#F6EFE2',
  subj: '#1F6FD1', aux: '#D9660B', part: '#0E8A6E', not: '#C93545', time: '#7A47CC', wh: '#7A47CC',
  subjL: '#DCEAFB', auxL: '#FDE6D0', partL: '#D5F1E8', notL: '#FADCE0', timeL: '#E9DFF8',
  navy: '#0F2A4D', gold: '#E9B949', ok: '#1E9E5A', bad: '#C93545', grey: '#8A94A6',
};

/* ------------------------------------------------------------ speech bubbles */
function makeBubble(str, o = {}) {
  const size = o.size || 42;
  const tb = T(str, { size, maxW: o.maxW || 700, weight: 500 });
  const padX = o.padX || 34, padY = o.padY || 22;
  const n = 3.1, Aw = tb.w / 2 + padX, Ah = tb.h / 2 + padY;
  const r = Math.pow(Math.pow((tb.w / 2) / Aw, n) + Math.pow((tb.h / 2) / Ah, n), 1 / n);
  const k = Math.max(1, r * 1.04), a = Aw * k, b = Ah * k;
  const rn = rng(hash(str)), ph = [rn() * 6.28, rn() * 6.28, rn() * 6.28], amp = [0.016 + rn() * 0.01, 0.012, 0.008];
  const N = 120, pts = [];
  for (let i = 0; i < N; i++) {
    const th = i / N * TAU, c = Math.cos(th), s = Math.sin(th);
    const rr = Math.pow(Math.pow(Math.abs(c), n) + Math.pow(Math.abs(s), n), -1 / n);
    const wob = 1 + amp[0] * Math.sin(2 * th + ph[0]) + amp[1] * Math.sin(3 * th + ph[1]) + amp[2] * Math.sin(5 * th + ph[2]);
    pts.push([c * rr * a * wob, s * rr * b * wob]);
  }
  let per = 0; for (let i = 0; i < N; i++) { const p = pts[i], q = pts[(i + 1) % N]; per += Math.hypot(q[0] - p[0], q[1] - p[1]); }
  return { tb, a, b, pts, N, step: per / N, w: a * 2, h: b * 2, str, color: o.color || COL.paper, ink: o.ink || '#22304A' };
}

function nearestIdx(B, dx, dy) {
  const ang = Math.atan2(dy, dx); let best = 0, bd = 9;
  for (let i = 0; i < B.N; i++) { const th = Math.atan2(B.pts[i][1] / B.b, B.pts[i][0] / B.a); let d = Math.abs(th - ang); if (d > Math.PI) d = TAU - d; if (d < bd) { bd = d; best = i; } }
  return best;
}

/* cx,cy = bubble centre (screen). tip = where the tail ends (computed from the speaker's head each frame). */
function drawBubble(ctx, B, cx, cy, tip, o = {}) {
  const sc = o.scale === undefined ? 1 : o.scale, al = o.alpha === undefined ? 1 : o.alpha;
  if (al <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= al;
  // pop from the tail tip
  if (sc !== 1) { ctx.translate(tip[0], tip[1]); ctx.scale(sc, sc); ctx.translate(-tip[0], -tip[1]); }
  ctx.translate(cx, cy);
  const tx = tip[0] - cx, ty = tip[1] - cy;
  const ic = nearestIdx(B, tx, ty), m = Math.max(3, Math.round(30 / B.step));
  const iA = (ic - m + B.N) % B.N, iB = (ic + m) % B.N, A = B.pts[iA], Bp = B.pts[iB];
  const mx = (A[0] + Bp[0]) / 2, my = (A[1] + Bp[1]) / 2, dx = tx - mx, dy = ty - my, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const curl = Math.min(30, L * 0.22) * (tx >= 0 ? 1 : -1) * 0.8;
  const path = new Path2D();
  path.moveTo(A[0], A[1]);
  path.bezierCurveTo(A[0] + dx * 0.30 + nx * curl * 0.6, A[1] + dy * 0.30 + ny * curl * 0.6, tx - dx * 0.22 + nx * curl, ty - dy * 0.22 + ny * curl, tx, ty);
  path.bezierCurveTo(tx - dx * 0.10 + nx * curl * 0.15, ty - dy * 0.10 + ny * curl * 0.15, Bp[0] - dx * 0.34, Bp[1] - dy * 0.34, Bp[0], Bp[1]);
  for (let j = 1; j < B.N - 2 * m; j++) { const p = B.pts[(iB + j) % B.N]; path.lineTo(p[0], p[1]); }
  path.closePath();
  ctx.save(); ctx.translate(3, 7); ctx.fillStyle = 'rgba(15,25,50,.16)'; ctx.fill(path); ctx.restore();
  ctx.fillStyle = lg(ctx, 0, -B.b, 0, B.b, [[0, '#FFFFFF'], [1, B.color]]); ctx.fill(path);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = B.ink; ctx.lineWidth = 4.2; ctx.stroke(path);
  ctx.save(); ctx.translate(1.4, -1.1); ctx.rotate(0.004); ctx.strokeStyle = rgba(B.ink, 0.22); ctx.lineWidth = 1.8; ctx.stroke(path); ctx.restore();
  B.tb.draw(ctx, -B.tb.w / 2, -B.tb.h / 2, { color: o.color || COL.ink, hi: o.hi, w: B.tb.w });
  ctx.restore();
}

/* thought cloud: scalloped outline, trailing dots toward the thinker; silent thoughts only */
function drawThought(ctx, B, cx, cy, tip, o = {}) {
  const al = o.alpha === undefined ? 1 : o.alpha, sc = o.scale === undefined ? 1 : o.scale; if (al <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(tip[0], tip[1]); ctx.scale(sc, sc); ctx.translate(-tip[0], -tip[1]);
  const a = B.a * 1.02, b = B.b * 1.05, N = 14, cir = [];
  for (let i = 0; i < N; i++) { const th = i / N * TAU; cir.push([cx + Math.cos(th) * (a - 20), cy + Math.sin(th) * (b - 16), 40 + (i % 3) * 5]); }
  const dots = []; for (let i = 0; i < 3; i++) { const t = (i + 1) / 4; dots.push([lerp(cx + (tip[0] - cx) * 0.55, tip[0], t) + 0, lerp(cy + b * 0.85, tip[1], t), 17 - i * 4.5]); }
  ctx.fillStyle = '#7C8AA5'; for (const [x, y, r] of cir) { ctx.beginPath(); ctx.arc(x, y, r + 3.5, 0, TAU); ctx.fill(); } for (const [x, y, r] of dots) { ctx.beginPath(); ctx.arc(x, y, r + 3.5, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#F4F7FC'; for (const [x, y, r] of cir) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } ctx.beginPath(); ctx.ellipse(cx, cy, a - 24, b - 20, 0, 0, TAU); ctx.fill(); for (const [x, y, r] of dots) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  B.tb.draw(ctx, cx - B.tb.w / 2, cy - B.tb.h / 2, { color: '#44516C', ipaColor: 'rgba(68,81,108,.8)' });
  ctx.restore();
}

/* ------------------------------------------------------------ ribbons & shapes */
function banner(ctx, cx, cy, w, h, color, o = {}) {
  const al = o.alpha === undefined ? 1 : o.alpha, fold = Math.min(46, h * 0.5), x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, arch = o.arch === undefined ? 8 : o.arch;
  ctx.save(); ctx.globalAlpha *= al; ctx.lineJoin = 'round';
  // back folds
  ctx.fillStyle = shade(color, -0.3);
  for (const s of [-1, 1]) { const ex = s < 0 ? x0 : x1; ctx.beginPath(); ctx.moveTo(ex - s * 4, y0 + 14); ctx.lineTo(ex + s * 4 + s * fold * 0.2, y0 + 14); ctx.lineTo(ex + s * fold * 0.6, y1 + 14); ctx.lineTo(ex - s * 6, y1 + 14); ctx.closePath(); ctx.fill(); }
  // swallowtail ends
  for (const s of [-1, 1]) { const ex = s < 0 ? x0 : x1; ctx.fillStyle = shade(color, -0.12); ctx.beginPath(); ctx.moveTo(ex, y0 + 14); ctx.lineTo(ex - s * fold, y0 + 14); ctx.lineTo(ex - s * fold * 0.62, cy + 14); ctx.lineTo(ex - s * fold, y1 + 14); ctx.lineTo(ex, y1 + 14); ctx.closePath(); ctx.fill(); }
  withShadow(ctx, 'rgba(15,25,50,.25)', 14, 0, 7, () => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x0, y0 + 14); ctx.quadraticCurveTo(cx, y0 + 14 - arch, x1, y0 + 14); ctx.lineTo(x1, y1 + 14); ctx.quadraticCurveTo(cx, y1 + 14 - arch, x0, y1 + 14); ctx.closePath(); ctx.fill(); });
  ctx.fillStyle = lg(ctx, 0, y0, 0, y1 + 14, [[0, 'rgba(255,255,255,.28)'], [0.5, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.14)']]);
  ctx.beginPath(); ctx.moveTo(x0, y0 + 14); ctx.quadraticCurveTo(cx, y0 + 14 - arch, x1, y0 + 14); ctx.lineTo(x1, y1 + 14); ctx.quadraticCurveTo(cx, y1 + 14 - arch, x0, y1 + 14); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function paper(ctx, x, y, w, h, o = {}) { // soft paper card with slight rotation
  ctx.save(); ctx.globalAlpha *= o.alpha === undefined ? 1 : o.alpha; ctx.translate(x + w / 2, y + h / 2); ctx.rotate(o.rot || 0);
  withShadow(ctx, 'rgba(15,25,50,.22)', 22, 0, 10, () => { ctx.fillStyle = o.color || COL.paper; ctx.beginPath(); rrect(ctx, -w / 2, -h / 2, w, h, o.r || 26); ctx.fill(); });
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.sw || 3; ctx.stroke(); }
  ctx.restore();
}
function tape(ctx, x, y, w, h, color, rot = 0, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  withShadow(ctx, 'rgba(15,25,50,.22)', 10, 0, 5, () => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); for (let i = 0; i <= 5; i++) ctx.lineTo(-w / 2 + (i % 2 ? 7 : -1), -h / 2 + i * h / 5); ctx.lineTo(-w / 2, h / 2); ctx.lineTo(w / 2, h / 2); for (let i = 5; i >= 0; i--) ctx.lineTo(w / 2 - (i % 2 ? -1 : 7), -h / 2 + i * h / 5); ctx.closePath(); ctx.fill(); });
  ctx.fillStyle = lg(ctx, 0, -h / 2, 0, h / 2, [[0, 'rgba(255,255,255,.3)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(-w / 2 + 8, -h / 2, w - 16, h); ctx.restore();
}
function pill(ctx, x, y, w, h, color, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
  withShadow(ctx, 'rgba(15,25,50,.22)', 10, 0, 5, () => { ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, shade(color, 0.14)], [1, color]]); ctx.beginPath(); rrect(ctx, x, y, w, h, o.r === undefined ? h / 2 : o.r); ctx.fill(); });
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
}
/* jigsaw sentence tile: tabs on the right edge (tabR=1) and sockets on the left edge (tabL=1) so tiles visibly snap together */
function tilePath(ctx, x, y, w, h, tabL, tabR, r = 18) {
  const tb = h * 0.17, ty = y + h / 2;
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, ty - tb * 1.3);
  if (tabR) { ctx.bezierCurveTo(x + w + tb * 1.9, ty - tb * 1.9, x + w + tb * 1.9, ty + tb * 1.9, x + w, ty + tb * 1.3); }
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, ty + tb * 1.3);
  if (tabL) { ctx.bezierCurveTo(x + tb * 1.9, ty + tb * 1.9, x + tb * 1.9, ty - tb * 1.9, x, ty - tb * 1.3); }
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
}
function tile(ctx, x, y, w, h, color, tabL, tabR, o = {}) {
  ctx.save(); ctx.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
  withShadow(ctx, 'rgba(15,25,50,.28)', 14, 0, 8, () => { ctx.fillStyle = lg(ctx, 0, y, 0, y + h, [[0, shade(color, 0.16)], [1, color]]); ctx.beginPath(); tilePath(ctx, x, y, w, h, tabL, tabR); ctx.fill(); });
  ctx.strokeStyle = shade(color, -0.35); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); rrect(ctx, x + 10, y + 7, w - 20, h * 0.18, 8); ctx.fill();
  ctx.restore();
}
function bracket(ctx, x0, x1, y, h, color, prog = 1, up = false, lw = 7) {
  if (prog <= 0) return; const d = up ? -1 : 1, mx = lerp(x0, x1, 0.5), xe = lerp(x0, x1, prog);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(x0, y + d * h, x0 + 24, y + d * h);
  const mid = (x0 + x1) / 2;
  if (xe < mid - 24) ctx.lineTo(xe, y + d * h);
  else { ctx.lineTo(mid - 20, y + d * h); ctx.quadraticCurveTo(mid, y + d * h, mid, y + d * h * 1.55); ctx.moveTo(mid, y + d * h * 1.55); ctx.quadraticCurveTo(mid, y + d * h, mid + 20, y + d * h); if (xe > mid + 20) { if (xe < x1 - 24) ctx.lineTo(xe, y + d * h); else { ctx.lineTo(x1 - 24, y + d * h); ctx.quadraticCurveTo(x1, y + d * h, x1, y); } } }
  ctx.stroke(); ctx.restore();
}
function arcArrow(ctx, p0, p1, bulge, color, prog = 1, lw = 7, head = true) {
  if (prog <= 0) return;
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bulge, cy = my + dx / L * bulge;
  const pt = (t) => { const u = 1 - t; return [u * u * p0[0] + 2 * u * t * cx + t * t * p1[0], u * u * p0[1] + 2 * u * t * cy + t * t * p1[1]]; };
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const n = 36, last = Math.max(1, Math.round(n * prog)); ctx.beginPath(); let q = pt(0); ctx.moveTo(q[0], q[1]);
  for (let i = 1; i <= last; i++) { q = pt(Math.min(prog, i / n)); ctx.lineTo(q[0], q[1]); } ctx.stroke();
  if (head && prog > 0.97) { const a = pt(0.96), b = pt(1), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.save(); ctx.translate(b[0], b[1]); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-lw * 2.6, -lw * 1.9); ctx.lineTo(-lw * 1.8, 0); ctx.lineTo(-lw * 2.6, lw * 1.9); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function checkBadge(ctx, x, y, r, ok = true, a = 1, pop = 1) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(pop, pop);
  withShadow(ctx, 'rgba(0,0,0,.28)', 8, 0, 3, () => { ctx.fillStyle = ok ? COL.ok : COL.bad; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); });
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  if (ok) { ctx.moveTo(-r * 0.42, 0); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.46, -r * 0.34); } else { ctx.moveTo(-r * 0.34, -r * 0.34); ctx.lineTo(r * 0.34, r * 0.34); ctx.moveTo(r * 0.34, -r * 0.34); ctx.lineTo(-r * 0.34, r * 0.34); }
  ctx.stroke(); ctx.restore();
}
function ring(ctx, x, y, r, prog, color, lw = 12) {
  ctx.save(); ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(20,33,61,.14)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(prog)); ctx.stroke(); ctx.restore();
}
function plus(ctx, x, y, r, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = r * 0.34; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); ctx.restore(); }
function nowFlag(ctx, x, y, h, o = {}) {
  const al = o.alpha === undefined ? 1 : o.alpha; ctx.save(); ctx.globalAlpha *= al;
  ctx.strokeStyle = COL.navy; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
  if (o.below) { ctx.moveTo(x, y - 24); ctx.lineTo(x, y + h); } else { ctx.moveTo(x, y - h); ctx.lineTo(x, y + 26); }
  ctx.stroke();
  ctx.fillStyle = COL.navy; ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
  if (o.label) { const lw = o.label.w + 36, lh = o.label.h + 14, ly = o.below ? y + h - 6 : y - h - lh + 4; ctx.fillStyle = COL.navy; ctx.beginPath(); rrect(ctx, x - lw / 2, ly, lw, lh, 16); ctx.fill(); o.label.draw(ctx, x - o.label.w / 2, ly + 7, { color: '#FFFFFF', ipaColor: 'rgba(255,255,255,.82)' }); }
  ctx.restore();
}

/* ------------------------------------------------------------ icons (all code-drawn) */
const ICON = {
  keys(ctx, x, y, s = 1, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.strokeStyle = '#AEB6C4'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke(); for (const [ang, col] of [[0.55, '#D9A93B'], [1.55, '#2E7DD7'], [2.5, '#17A589']]) { ctx.save(); ctx.rotate(ang); ctx.fillStyle = col; ctx.beginPath(); rrect(ctx, 18, -8, 72, 16, 7); ctx.fill(); ctx.fillRect(70, 6, 9, 20); ctx.fillRect(54, 6, 8, 14); ctx.restore(); } ctx.restore(); },
  hook(ctx, x, y, s = 1, a = 1, empty = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = lg(ctx, -70, 0, 70, 0, [[0, '#B77C45'], [1, '#8A5630']]); ctx.beginPath(); rrect(ctx, -70, -60, 140, 120, 16); ctx.fill(); ctx.fillStyle = lg(ctx, 0, 0, 20, 0, [[0, '#F2D27A'], [1, '#B98A2B']]); ctx.beginPath(); ctx.arc(0, -16, 12, 0, TAU); ctx.fill(); ctx.fillRect(-4, -14, 8, 22); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.setLineDash([9, 8]); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 22, 26, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); },
  report(ctx, x, y, s = 1, a = 1, done = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; withShadow(ctx, 'rgba(15,25,50,.3)', 14, 0, 7, () => { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); rrect(ctx, -70, -92, 140, 184, 10); ctx.fill(); }); ctx.fillStyle = '#2E7DD7'; ctx.fillRect(-52, -72, 70, 11); ctx.fillStyle = '#C7D2E0'; for (let i = 0; i < 4; i++) ctx.fillRect(-52, -44 + i * 15, 104 - (i % 2) * 24, 6); ctx.fillStyle = '#17A589'; ctx.fillRect(-52, 28, 22, 40); ctx.fillStyle = '#F28C28'; ctx.fillRect(-22, 14, 22, 54); ctx.fillStyle = '#2E7DD7'; ctx.fillRect(8, 40, 22, 28); ctx.fillStyle = '#7A47CC'; ctx.fillRect(38, 22, 14, 46); ctx.restore(); },
  pin(ctx, x, y, s = 1, a = 1, color = '#D64550') { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; withShadow(ctx, 'rgba(0,0,0,.28)', 8, 0, 4, () => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-36, -34, -34, -78, 0, -78); ctx.bezierCurveTo(34, -78, 36, -34, 0, 0); ctx.fill(); }); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -50, 13, 0, TAU); ctx.fill(); ctx.restore(); },
  plane(ctx, x, y, s = 1, a = 1, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#34445A'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(60, 0); ctx.bezierCurveTo(44, -13, -20, -13, -50, -9); ctx.lineTo(-62, -34); ctx.lineTo(-48, -34); ctx.lineTo(-24, -9); ctx.lineTo(-24, 9); ctx.lineTo(-48, 34); ctx.lineTo(-62, 34); ctx.lineTo(-50, 9); ctx.bezierCurveTo(-20, 13, 44, 13, 60, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(-14, -48); ctx.lineTo(0, -48); ctx.lineTo(30, -10); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(-14, 48); ctx.lineTo(0, 48); ctx.lineTo(30, 10); ctx.fill(); ctx.stroke(); ctx.restore(); },
  house(ctx, x, y, s = 1, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#F3D9AE'; ctx.fillRect(-46, -40, 92, 70); ctx.fillStyle = '#C9553A'; ctx.beginPath(); ctx.moveTo(-60, -38); ctx.lineTo(0, -92); ctx.lineTo(60, -38); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7A4A2A'; ctx.fillRect(-12, -6, 24, 36); ctx.fillStyle = '#8FC3E3'; ctx.fillRect(-38, -26, 18, 18); ctx.fillRect(20, -26, 18, 18); ctx.restore(); },
  tower(ctx, x, y, s = 1, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#C9A25F'; ctx.fillRect(-26, -44, 52, 74); ctx.fillStyle = '#B58B45'; ctx.fillRect(-20, -140, 40, 100); ctx.beginPath(); ctx.moveTo(-26, -140); ctx.lineTo(0, -196); ctx.lineTo(26, -140); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFF8E0'; ctx.beginPath(); ctx.arc(0, -108, 15, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4A3A22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -108); ctx.lineTo(0, -118); ctx.moveTo(0, -108); ctx.lineTo(7, -104); ctx.stroke(); ctx.fillStyle = '#8D6A30'; for (let i = 0; i < 3; i++) ctx.fillRect(-12, -66 + i * 20, 9, 12), ctx.fillRect(3, -66 + i * 20, 9, 12); ctx.restore(); },
  calendar(ctx, x, y, s = 1, a = 1, hi = -1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; withShadow(ctx, 'rgba(15,25,50,.28)', 12, 0, 6, () => { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); rrect(ctx, -64, -60, 128, 120, 12); ctx.fill(); }); ctx.fillStyle = '#C93545'; ctx.beginPath(); rrect(ctx, -64, -60, 128, 30, 12); ctx.fill(); ctx.fillRect(-64, -44, 128, 14); ctx.fillStyle = '#D5DCE8'; for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { ctx.fillStyle = (r * 5 + c === hi) ? '#7A47CC' : '#D5DCE8'; ctx.fillRect(-50 + c * 21, -16 + r * 24, 15, 15); } ctx.restore(); },
  suitcase(ctx, x, y, s = 1, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#E36414'; ctx.beginPath(); rrect(ctx, -44, -50, 88, 100, 12); ctx.fill(); ctx.strokeStyle = '#8A3C08'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-24, -50); ctx.lineTo(-24, -70); ctx.lineTo(24, -70); ctx.lineTo(24, -50); ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 4; for (const dx of [-20, 0, 20]) { ctx.beginPath(); ctx.moveTo(dx, -44); ctx.lineTo(dx, 44); ctx.stroke(); } ctx.restore(); },
  clock(ctx, x, y, s = 1, a = 1, ang = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#34445A'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.fill(); ctx.stroke(); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -32); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 24, Math.sin(ang) * 24); ctx.stroke(); ctx.restore(); },
  handshake(ctx, x, y, s = 1, a = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = '#E36414'; ctx.beginPath(); ctx.arc(-26, 0, 30, 0, TAU); ctx.fill(); ctx.fillStyle = '#17A589'; ctx.beginPath(); ctx.arc(26, 0, 30, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, TAU); ctx.fill(); ctx.restore(); },
  meeting(ctx, x, y, s = 1, a = 1, done = true) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a; ctx.fillStyle = done ? '#17A589' : '#C8D2E0'; ctx.beginPath(); rrect(ctx, -52, -34, 104, 68, 14); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.9)'; for (const dx of [-26, 0, 26]) { ctx.beginPath(); ctx.arc(dx, -4, 11, 0, TAU); ctx.fill(); ctx.fillRect(dx - 11, 8, 22, 12); } ctx.restore(); },
};

function glowDot(ctx, x, y, r, color, a = 1) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = rg(ctx, x, y, 0, r * 2.4, [[0, rgba(color, 0.55)], [1, rgba(color, 0)]]); ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, TAU); ctx.fill(); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, TAU); ctx.fill(); ctx.restore(); }
