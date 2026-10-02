// Adult male cartoon character: layered body, 3D two-bone arm IK (elbows tucked), articulated 5-digit hands.
import { C, clamp, lerp, capsule, rgba } from './util.js';

const CX = 540, SHOULDER_Y = 935, SHOULDER_DX = 228, L1 = 250, L2 = 225, FOCAL = 1700;
const OL = C.skinO;            // skin outline
const proj = (p) => { const k = FOCAL / (FOCAL - p.z); return { x: CX + (p.x - CX) * k, y: 900 + (p.y - 900) * k, k, z: p.z }; };
const v3 = {
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }), add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
  mul: (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s }), dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
  len: (a) => Math.hypot(a.x, a.y, a.z), nrm: (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l }; },
};
// Two-bone IK in 3D. side: -1 = screen-left arm, +1 = screen-right arm. pole biases the elbow down/back, slightly outward.
export function solveArm(S, T, side) {
  let d = v3.sub(T, S), dist = v3.len(d);
  const maxR = (L1 + L2) * 0.985, minR = Math.abs(L1 - L2) + 30;
  const dir = v3.nrm(d); dist = clamp(dist, minR, maxR);
  const Tt = v3.add(S, v3.mul(dir, dist));
  const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  let pole = { x: side * 0.04, y: 1, z: -0.55 };
  pole = v3.sub(pole, v3.mul(dir, v3.dot(pole, dir))); pole = v3.nrm(pole);
  const E = v3.add(v3.add(S, v3.mul(dir, a)), v3.mul(pole, h));
  return { S, E, W: Tt };
}

export function defaultPose() {
  return {
    sway: 0, breath: 0, shoulderLift: 0,
    head: { dx: 0, dy: 0, tilt: 0, pitch: 0 }, look: { x: 0, y: 0 }, blink: 0,
    brow: { raise: 0, worry: 0 }, smile: 0.3, mouth: 0, cheeks: 0.3,
    L: { x: -175, y: 1325, z: 110, ang: 20, curl: .4, spread: .1, thumbOut: 0, fore: .5, follow: 0, view: 'back', vis: 1 },
    R: { x: 175, y: 1325, z: 110, ang: -20, curl: .4, spread: .1, thumbOut: 0, fore: .5, follow: 0, view: 'back', vis: 1 },
  };
}

export function drawCharacter(ctx, p, opt = {}) {
  ctx.save();
  const bx = p.sway, by = p.breath;
  ctx.translate(bx, by);
  drawTorso(ctx, p);
  ctx.save(); drawNeckHead(ctx, p); ctx.restore();
  // arms (drawn after body so hands overlap torso/face naturally). Draw the arm that is lower in z first.
  const arms = [['L', -1], ['R', 1]].map(([k, side]) => ({ k, side, a: p[k] })).sort((a, b) => a.a.z - b.a.z);
  for (const { k, side, a } of arms) if (a.vis > 0.01) drawArm(ctx, p, k, side, a);
  ctx.restore();
}

function drawTorso(ctx, p) {
  const sy = SHOULDER_Y + p.shoulderLift;
  // torso (sweater)
  const g = ctx.createLinearGradient(0, sy - 40, 0, 1300);
  g.addColorStop(0, C.navyL); g.addColorStop(0.5, C.navy); g.addColorStop(1, C.navyD);
  ctx.beginPath();
  ctx.moveTo(CX - 62, sy - 26);
  ctx.bezierCurveTo(CX - 150, sy - 14, CX - 262, sy - 8, CX - 290, sy + 62);
  ctx.lineTo(CX - 312, 1320); ctx.lineTo(CX + 312, 1320); ctx.lineTo(CX + 290, sy + 62);
  ctx.bezierCurveTo(CX + 262, sy - 8, CX + 150, sy - 14, CX + 62, sy - 26);
  ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = C.navyD; ctx.lineJoin = 'round'; ctx.stroke();
  // soft chest highlight + fold shadows
  const hg = ctx.createRadialGradient(CX - 70, sy + 120, 10, CX - 70, sy + 120, 260);
  hg.addColorStop(0, 'rgba(255,255,255,.10)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg; ctx.fillRect(CX - 300, sy - 30, 600, 420);
  ctx.strokeStyle = 'rgba(6,20,40,.35)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(CX + s * 200, sy + 150); ctx.quadraticCurveTo(CX + s * 180, sy + 260, CX + s * 205, sy + 380); ctx.stroke(); }
  // neck opening: skin triangle + ivory shirt collar
  ctx.beginPath(); ctx.moveTo(CX - 66, sy - 28); ctx.quadraticCurveTo(CX, sy + 118, CX + 66, sy - 28); ctx.closePath();
  ctx.fillStyle = C.skinD; ctx.fill();
  ctx.fillStyle = C.ivory; ctx.strokeStyle = C.ivoryD; ctx.lineWidth = 4;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(CX + s * 8, sy + 72); ctx.lineTo(CX + s * 84, sy - 32); ctx.lineTo(CX + s * 58, sy + 22); ctx.lineTo(CX + s * 20, sy + 66); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // sweater V-neck rib trim
  ctx.strokeStyle = C.tealD; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(CX - 92, sy - 22); ctx.quadraticCurveTo(CX - 34, sy + 106, CX, sy + 138); ctx.quadraticCurveTo(CX + 34, sy + 106, CX + 92, sy - 22); ctx.stroke();
}

function drawNeckHead(ctx, p) {
  const sy = SHOULDER_Y + p.shoulderLift;
  const hx = CX + p.head.dx, hy = 690 + p.head.dy + p.shoulderLift * 0.5;
  // neck
  const ng = ctx.createLinearGradient(0, hy + 120, 0, sy + 20);
  ng.addColorStop(0, C.skinD); ng.addColorStop(1, C.skin);
  ctx.beginPath(); ctx.moveTo(hx - 52, hy + 90); ctx.lineTo(hx - 56, sy + 4); ctx.quadraticCurveTo(CX, sy + 40, hx + 56, sy + 4); ctx.lineTo(hx + 52, hy + 90); ctx.closePath();
  ctx.fillStyle = ng; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke();
  // head
  ctx.translate(hx, hy); ctx.rotate(p.head.tilt * Math.PI / 180); ctx.scale(1, 1 - p.head.pitch * 0.02);
  drawHead(ctx, p);
}

const FACE = () => {
  const f = new Path2D();
  f.moveTo(0, -168); f.bezierCurveTo(84, -168, 134, -118, 136, -30); f.bezierCurveTo(138, 40, 120, 100, 86, 140);
  f.bezierCurveTo(62, 166, 30, 178, 0, 178); f.bezierCurveTo(-30, 178, -62, 166, -86, 140);
  f.bezierCurveTo(-120, 100, -138, 40, -136, -30); f.bezierCurveTo(-134, -118, -84, -168, 0, -168); f.closePath(); return f;
};
let FACE_PATH = null;

function drawHead(ctx, p) {
  FACE_PATH = FACE_PATH || FACE();
  // ears
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(s * 134, 6, 24, 40, s * 0.12, 0, Math.PI * 2); ctx.fillStyle = C.skin; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(s * 134, 8, 11, 22, s * 0.12, 0, Math.PI * 2); ctx.fillStyle = C.skinD; ctx.fill();
  }
  // face base
  const fg = ctx.createRadialGradient(-30, -40, 20, 0, 20, 220);
  fg.addColorStop(0, C.skinL); fg.addColorStop(0.55, C.skin); fg.addColorStop(1, C.skinD);
  ctx.fillStyle = fg; ctx.fill(FACE_PATH); ctx.lineWidth = 5.5; ctx.strokeStyle = OL; ctx.lineJoin = 'round'; ctx.stroke(FACE_PATH);
  ctx.save(); ctx.clip(FACE_PATH);
  // light stubble shadow on jaw
  const sg = ctx.createLinearGradient(0, 40, 0, 180); sg.addColorStop(0, 'rgba(58,38,30,0)'); sg.addColorStop(1, 'rgba(58,38,30,.20)');
  ctx.fillStyle = sg; ctx.fillRect(-150, 40, 300, 150);
  // cheeks
  const ch = 0.10 + 0.22 * p.cheeks;
  for (const s of [-1, 1]) { const cg = ctx.createRadialGradient(s * 80, 58, 4, s * 80, 58, 44); cg.addColorStop(0, rgba(C.coral, ch + .08)); cg.addColorStop(1, rgba(C.coral, 0)); ctx.fillStyle = cg; ctx.fillRect(s * 80 - 50, 10, 100, 100); }
  ctx.restore();
  // nose
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -22); ctx.quadraticCurveTo(-14, 18, -22, 38); ctx.strokeStyle = 'rgba(122,75,46,.35)'; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 40, 24, 16, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(190,127,82,.55)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, 44); ctx.quadraticCurveTo(-12, 56, 0, 52); ctx.quadraticCurveTo(12, 56, 22, 44); ctx.strokeStyle = C.skinO; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-8, 33, 5, 3, -0.4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,240,220,.55)'; ctx.fill();
  // eyes
  const lookX = p.look.x, lookY = p.look.y;
  for (const s of [-1, 1]) drawEye(ctx, s, lookX, lookY, p.blink, p.smile);
  // brows
  drawBrows(ctx, p);
  // mouth
  drawMouth(ctx, p);
  // smile lines
  const sm = clamp(p.smile, 0, 1);
  ctx.strokeStyle = 'rgba(122,75,46,.30)'; ctx.lineWidth = 4;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 50, 62); ctx.quadraticCurveTo(s * (64 + sm * 8), 100, s * (56 + sm * 10), 122 - sm * 6); ctx.stroke(); }
  drawHair(ctx);
}

function drawEye(ctx, s, lx, ly, blink, smile) {
  const ex = s * 56, ey = -22, open = clamp(1 - blink) * (1 - 0.18 * clamp(smile, 0, 1));
  ctx.save(); ctx.translate(ex, ey);
  // socket shadow
  ctx.beginPath(); ctx.ellipse(0, 2, 40, 28, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(122,75,46,.14)'; ctx.fill();
  const rx = 32, ry = 24 * open;
  if (open > 0.06) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, rx, Math.max(ry, 1), 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#FFFDF8'; ctx.fillRect(-40, -30, 80, 60);
    const ix = lx * 9 - s * 1.5, iy = ly * 6;
    const ig = ctx.createRadialGradient(ix - 2, iy - 3, 2, ix, iy, 16); ig.addColorStop(0, '#7A4A2C'); ig.addColorStop(1, '#3E2415');
    ctx.beginPath(); ctx.arc(ix, iy, 16, 0, Math.PI * 2); ctx.fillStyle = ig; ctx.fill();
    ctx.beginPath(); ctx.arc(ix, iy, 8, 0, Math.PI * 2); ctx.fillStyle = '#140B07'; ctx.fill();
    ctx.beginPath(); ctx.arc(ix - 5, iy - 6, 4.2, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.beginPath(); ctx.arc(ix + 5, iy + 5, 2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
    // upper lid shadow
    const lg = ctx.createLinearGradient(0, -ry, 0, -ry + 12); lg.addColorStop(0, 'rgba(60,30,20,.35)'); lg.addColorStop(1, 'rgba(60,30,20,0)');
    ctx.fillStyle = lg; ctx.fillRect(-40, -ry - 2, 80, 16);
    ctx.restore();
    // lash line
    ctx.beginPath(); ctx.moveTo(-rx - 2, 1); ctx.quadraticCurveTo(0, -ry * 2 + 2, rx + 2, 1);
    ctx.lineWidth = 5.5; ctx.strokeStyle = '#2A1710'; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-rx + 4, 4); ctx.quadraticCurveTo(0, ry * 0.9 + 6, rx - 4, 4); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(122,75,46,.55)'; ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-rx, 2); ctx.quadraticCurveTo(0, 12, rx, 2); ctx.lineWidth = 6; ctx.strokeStyle = '#2A1710'; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();
}

function drawBrows(ctx, p) {
  const { raise, worry } = p.brow; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of [-1, 1]) {
    const inner = { x: s * 22, y: -62 - raise * 14 - worry * 12 }, mid = { x: s * 58, y: -84 - raise * 20 - worry * 4 }, outer = { x: s * 96, y: -66 - raise * 10 + worry * 12 };
    ctx.beginPath(); ctx.moveTo(inner.x, inner.y); ctx.quadraticCurveTo(mid.x, mid.y - 6, outer.x, outer.y);
    ctx.lineWidth = 17; ctx.strokeStyle = C.hair; ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = C.hairL; ctx.globalAlpha = .45; ctx.beginPath(); ctx.moveTo(inner.x + s * 8, inner.y - 3); ctx.quadraticCurveTo(mid.x, mid.y - 9, outer.x - s * 10, outer.y - 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
}

function drawMouth(ctx, p) {
  const cy = 98, sm = clamp(p.smile, -0.5, 1), open = clamp(p.mouth, 0, 1);
  const w = 46 + sm * 14 + open * 4, cornerY = cy - sm * 13 + open * 2;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (open < 0.05) {
    ctx.beginPath(); ctx.moveTo(-w, cornerY); ctx.quadraticCurveTo(0, cy + 8 + sm * 22, w, cornerY);
    ctx.lineWidth = 7; ctx.strokeStyle = '#8A3F33'; ctx.stroke();
    // lower lip hint
    ctx.beginPath(); ctx.moveTo(-w * 0.55, cy + 16 + sm * 10); ctx.quadraticCurveTo(0, cy + 28 + sm * 14, w * 0.55, cy + 16 + sm * 10);
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(190,100,80,.45)'; ctx.stroke();
  } else {
    const depth = 8 + open * 52;
    const mouth = new Path2D();
    mouth.moveTo(-w, cornerY); mouth.quadraticCurveTo(0, cy - 4 + sm * 8, w, cornerY);
    mouth.bezierCurveTo(w * 0.8, cy + depth + 14, -w * 0.8, cy + depth + 14, -w, cornerY); mouth.closePath();
    ctx.fillStyle = '#4E1A20'; ctx.fill(mouth);
    ctx.save(); ctx.clip(mouth);
    ctx.fillStyle = '#FFFDF6'; ctx.fillRect(-w, cornerY - 6, w * 2, 15 + open * 6);
    ctx.fillStyle = '#D9544A'; ctx.beginPath(); ctx.ellipse(0, cy + depth + 6, w * 0.65, 18 + open * 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = '#8A3F33'; ctx.stroke(mouth);
  }
}

function drawHair(ctx) {
  const h = new Path2D();
  h.moveTo(-142, -34); h.bezierCurveTo(-158, -140, -100, -214, 4, -214); h.bezierCurveTo(112, -216, 164, -140, 144, -34);
  h.bezierCurveTo(138, -64, 124, -92, 104, -108); h.bezierCurveTo(78, -92, 28, -112, -8, -142);
  h.bezierCurveTo(-40, -116, -92, -104, -116, -80); h.bezierCurveTo(-130, -66, -138, -52, -142, -34); h.closePath();
  const g = ctx.createLinearGradient(0, -214, 0, -60); g.addColorStop(0, C.hairL); g.addColorStop(0.5, C.hair); g.addColorStop(1, '#1b1412');
  ctx.fillStyle = g; ctx.fill(h); ctx.lineWidth = 5; ctx.strokeStyle = '#150E0C'; ctx.lineJoin = 'round'; ctx.stroke(h);
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const [a, b, c, d, e, f] of [[-90, -176, -50, -200, 10, -196], [-20, -170, 30, -184, 80, -170], [40, -160, 84, -168, 118, -140]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c, d, e, f); ctx.stroke(); }
}

// ---------- arms & hands ----------
function drawArm(ctx, p, key, side, a) {
  const sy = SHOULDER_Y + p.shoulderLift;
  const S = { x: CX + side * SHOULDER_DX, y: sy + 56, z: 0 };
  const T = { x: CX + a.x, y: a.y, z: a.z };
  const { E, W } = solveArm(S, T, side);
  const pS = proj(S), pE = proj(E), pW = proj(W);
  const rS = 56 * pS.k, rE = 44 * pE.k, rW = 23 * pW.k;
  ctx.save(); ctx.globalAlpha = a.vis;
  capsule(ctx, pS, pE, rS, rE, C.navy, C.navyD, 5);                       // upper arm (sleeve)
  ctx.save(); ctx.globalAlpha = a.vis * 0.12; capsule(ctx, { x: pS.x - side * rS * 0.35, y: pS.y }, { x: pE.x - side * rE * 0.3, y: pE.y }, rS * 0.28, rE * 0.28, '#fff'); ctx.restore();
  const cuffT = 0.30, cuff = { x: lerp(pE.x, pW.x, cuffT), y: lerp(pE.y, pW.y, cuffT) }, rC = lerp(rE, rW, cuffT) * 1.04 + 2;
  capsule(ctx, pE, pW, lerp(rE, rW, 0.3) * 0.92, rW, C.skin, OL, 5);       // forearm skin, tapering to the wrist
  capsule(ctx, pE, cuff, rE * 0.98, rC, C.navy, C.navyD, 5);               // sleeve to the rolled cuff
  const ca = Math.atan2(pW.y - pE.y, pW.x - pE.x);
  ctx.save(); ctx.translate(cuff.x, cuff.y); ctx.rotate(ca);
  ctx.beginPath(); ctx.roundRect(-8, -rC * 1.05 - 2, 20, rC * 2.1 + 4, 8); ctx.fillStyle = C.tealD; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.navyD; ctx.stroke(); ctx.restore();
  // wrist follows the forearm; follow fades out when the forearm is foreshortened (pointing at the camera)
  const fAng = Math.atan2(pW.x - pE.x, -(pW.y - pE.y)) * 180 / Math.PI, fLen = Math.hypot(pW.x - pE.x, pW.y - pE.y);
  const follow = (a.follow ?? 0) * clamp(fLen / 120, 0, 1);
  const ang = a.ang + fAng * follow;
  drawHand(ctx, pW.x, pW.y, pW.k * 1.12, ang, { curl: a.curl, spread: a.spread, thumbDir: -side, thumbOut: a.thumbOut, fore: a.fore || 0, view: a.view || 'palm' });
  ctx.restore();
}

// Hand in local coords: wrist at origin, fingers toward -y. Exactly 4 tapered fingers (3 phalanges each, own curl) + thumb.
function drawHand(ctx, x, y, k, angDeg, o) {
  const { curl = .2, spread = .2, thumbDir = 1, thumbOut = .3, fore = 0, view = 'palm' } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angDeg * Math.PI / 180); ctx.scale(k, k); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fl = 1 - 0.6 * fore, palmH = 1 - 0.32 * fore, top = -74 * palmH, OW = 3.6;
  const specs = [{ dx: 27, len: 54, w: 15, st: 0, by: 3 }, { dx: 9, len: 63, w: 16.5, st: .08, by: -3 }, { dx: -9, len: 57, w: 15.5, st: .16, by: -2 }, { dx: -27, len: 44, w: 13, st: .26, by: 4 }];
  const skin = C.skin, fingers = specs.map((s) => {
    const xpos = thumbDir * s.dx, base = { x: xpos, y: top + s.by * palmH }, a0 = (xpos / 27) * spread * 0.30;
    const cs = clamp(curl * (1 + s.st * 2.2)), bend = [0.9, 1.15, 0.85].map(b => b * cs * 1.15), lens = [0.5, 0.31, 0.19].map(f => f * s.len * fl);
    const pts = [base], rs = [s.w / 2]; let phi = 0, p = base;
    for (let j = 0; j < 3; j++) { phi += bend[j]; const step = lens[j] * Math.cos(phi * 0.85), dir = a0 - thumbDir * Math.sin(phi) * 0.10; p = { x: p.x + Math.sin(dir) * step, y: p.y - Math.cos(dir) * step }; pts.push(p); rs.push(s.w / 2 * [0.95, 0.86, 0.78][j]); }
    return { pts, rs, dirEnd: a0 };
  });
  // thumb (behind palm)
  const ta = thumbDir * (0.42 + thumbOut * 0.55), tb = { x: thumbDir * 27, y: -16 * palmH }, tl = [36, 30].map(v => v * (1 - .28 * fore));
  const t1 = { x: tb.x + Math.sin(ta) * tl[0], y: tb.y - Math.cos(ta) * tl[0] }, ta2 = ta - thumbDir * (0.22 + curl * 0.6), t2 = { x: t1.x + Math.sin(ta2) * tl[1], y: t1.y - Math.cos(ta2) * tl[1] };
  capsule(ctx, tb, t1, 12, 10, OL); capsule(ctx, t1, t2, 10, 8.6, OL);
  capsule(ctx, tb, t1, 12 - OW, 10 - OW, skin); capsule(ctx, t1, t2, 10 - OW, 8.6 - OW, skin);
  // fingers: outlines first (so neighbours separate cleanly), then fills; outer fingers first so the middle ones overlap
  const order = [3, 0, 2, 1];
  for (const i of order) { const f = fingers[i]; for (let j = 0; j < 3; j++) capsule(ctx, f.pts[j], f.pts[j + 1], f.rs[j], f.rs[j + 1], OL); }
  for (const i of order) { const f = fingers[i]; for (let j = 0; j < 3; j++) capsule(ctx, f.pts[j], f.pts[j + 1], f.rs[j] - OW + 0.8, f.rs[j + 1] - OW + 0.8, j === 0 ? skin : (j === 1 ? '#DDA878' : '#E2AC7C')); }
  // knuckle creases + nails on the back view
  ctx.strokeStyle = 'rgba(122,75,46,.33)'; ctx.lineWidth = 2.2;
  for (const f of fingers) for (let j = 1; j < 3; j++) { const q = f.pts[j], r = f.rs[j] * 0.55; ctx.beginPath(); ctx.moveTo(q.x - r, q.y); ctx.lineTo(q.x + r, q.y); ctx.stroke(); }
  if (view === 'back' || fore > 0.3) for (const f of fingers) { const q = f.pts[3], r = f.rs[3]; ctx.save(); ctx.translate(q.x, q.y + r * 0.2); ctx.rotate(f.dirEnd); ctx.beginPath(); ctx.ellipse(0, 0, r * 0.62, r * 0.78, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,238,224,.78)'; ctx.fill(); ctx.restore(); }
  // palm
  ctx.save(); ctx.scale(1, palmH);
  const palm = new Path2D(); palm.moveTo(-22, 8); palm.bezierCurveTo(-35, -2, -39, -30, -38, -56); palm.quadraticCurveTo(-37, -78, -18, -79);
  palm.lineTo(18, -79); palm.quadraticCurveTo(37, -78, 38, -56); palm.bezierCurveTo(39, -30, 35, -2, 22, 8); palm.closePath();
  const pg = ctx.createRadialGradient(-8 * thumbDir, -46, 4, 0, -36, 58); pg.addColorStop(0, C.skinL); pg.addColorStop(1, skin);
  ctx.fillStyle = pg; ctx.fill(palm); ctx.lineWidth = OW + 1; ctx.strokeStyle = OL; ctx.stroke(palm);
  ctx.beginPath(); ctx.ellipse(thumbDir * 22, -18, 17, 26, thumbDir * 0.35, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();   // thenar mound
  ctx.fillStyle = pg; ctx.fillRect(-33, -72, 66, 52);
  ctx.strokeStyle = 'rgba(122,75,46,.32)'; ctx.lineWidth = 2.6;
  if (view === 'palm') { ctx.beginPath(); ctx.moveTo(thumbDir * 30, -40); ctx.quadraticCurveTo(thumbDir * 6, -30, -thumbDir * 8, -46); ctx.stroke(); ctx.beginPath(); ctx.moveTo(thumbDir * 14, -18); ctx.quadraticCurveTo(thumbDir * 16, -34, thumbDir * 28, -40); ctx.stroke(); }
  else for (const f of fingers) { ctx.beginPath(); ctx.moveTo(f.pts[0].x, f.pts[0].y + 6); ctx.lineTo(f.pts[0].x * 0.6, -20); ctx.stroke(); }
  ctx.restore(); ctx.restore();
}
export { SHOULDER_DX, SHOULDER_Y };
