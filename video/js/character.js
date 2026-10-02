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
    L: { x: -SHOULDER_DX + 60, y: 1175, z: 150, ang: 20, curl: 0.3, spread: 0.1, thumbOut: 0, vis: 1 },
    R: { x: SHOULDER_DX - 60, y: 1175, z: 150, ang: -20, curl: 0.3, spread: 0.1, thumbOut: 0, vis: 1 },
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
  const T = { x: CX + a.x * 1, y: a.y, z: a.z };
  const { E, W } = solveArm(S, T, side);
  const pS = proj(S), pE = proj(E), pW = proj(W);
  const rS = 56 * pS.k, rE = 45 * pE.k, rW = 25 * pW.k;
  ctx.save(); ctx.globalAlpha = a.vis;
  // upper arm sleeve
  capsule(ctx, pS, pE, rS, rE, C.navy, C.navyD, 5);
  const hl = { x: (pS.x + pE.x) / 2, y: (pS.y + pE.y) / 2 };
  // sleeve highlight
  ctx.save(); ctx.globalAlpha = a.vis * 0.12; capsule(ctx, { x: pS.x - side * rS * 0.35, y: pS.y }, { x: pE.x - side * rE * 0.3, y: pE.y }, rS * 0.28, rE * 0.28, '#fff'); ctx.restore();
  // forearm: sleeve (rolled cuff at 36%) then skin to wrist
  const cuff = { x: lerp(pE.x, pW.x, 0.38), y: lerp(pE.y, pW.y, 0.38) }, rC = lerp(rE, rW, 0.38) * 1.02 + 3;
  const skinStart = { x: lerp(pE.x, pW.x, 0.30), y: lerp(pE.y, pW.y, 0.30) };
  capsule(ctx, skinStart, pW, rC * 0.78, rW, C.skin, OL, 5);              // skin forearm (under sleeve)
  capsule(ctx, pE, cuff, rE * 0.97, rC * 1.02, C.navy, C.navyD, 5);      // sleeve
  // ribbed cuff band
  const ca = Math.atan2(pW.y - pE.y, pW.x - pE.x);
  ctx.save(); ctx.translate(cuff.x, cuff.y); ctx.rotate(ca);
  ctx.beginPath(); ctx.roundRect(-9, -rC * 1.06 - 2, 22, rC * 2.12 + 4, 8); ctx.fillStyle = C.tealD; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.navyD; ctx.stroke();
  ctx.restore();
  // elbow crease
  // hand
  const ang = a.ang + Math.atan2(pW.x - pE.x, -(pW.y - pE.y)) * 180 / Math.PI * (a.follow == null ? 0 : a.follow);
  drawHand(ctx, pW.x, pW.y, pW.k * (a.scale || 1.35), ang, a.curl, a.spread, -side, a.thumbOut, a.pose);
  ctx.restore();
}

// Hand in local coords: wrist at origin, fingers toward -y. Exactly 4 fingers + 1 thumb.
function drawHand(ctx, x, y, k, angDeg, curl, spread, thumbDir, thumbOut = 0, pose) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angDeg * Math.PI / 180); ctx.scale(k, k);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fingers = [ // x base, length, width
    { x: -26, len: 48, w: 17 }, { x: -9, len: 60, w: 18 }, { x: 9, len: 56, w: 18 }, { x: 26, len: 44, w: 16 },
  ];
  // thumbDir: +1 => thumb on +x side. Index finger is nearest the thumb.
  if (thumbDir > 0) fingers.reverse();
  const order = [1, 2, 0, 3].map(i => fingers[i]);
  const palmTop = -70;
  const fanAng = spread;
  const thumbSide = thumbDir;
  const drawFinger = (f, idx) => {
    let a0 = (f.x / 26) * fanAng * 0.30;   // symmetric fan about the middle of the hand
    const segs = [0.46, 0.32, 0.22], bend = [0.9, 1.1, 0.8].map(b => b * curl * 1.15);
    let pt = { x: f.x, y: palmTop + 6 }, pts = [pt], ang = a0;
    const curlDir = thumbDir; // in-plane bend toward thumb side
    for (let i = 0; i < 3; i++) {
      ang += curlDir * bend[i] * (i === 0 ? 0.55 : 1);
      pt = { x: pt.x + Math.sin(ang) * f.len * segs[i], y: pt.y - Math.cos(ang) * f.len * segs[i] }; pts.push(pt);
    }
    const path = () => { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); };
    path(); ctx.lineWidth = f.w + 9; ctx.strokeStyle = OL; ctx.stroke();
    path(); ctx.lineWidth = f.w; ctx.strokeStyle = C.skin; ctx.stroke();
    // knuckle crease marks
    ctx.strokeStyle = 'rgba(122,75,46,.35)'; ctx.lineWidth = 2.5;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(pts[i].x - 4, pts[i].y + 0.5); ctx.lineTo(pts[i].x + 4, pts[i].y + 0.5); ctx.stroke(); }
  };
  // thumb first (behind palm edge), then fingers, then palm
  const th = () => {
    const bx = thumbSide * 30, by = -22, a0 = thumbSide * (0.55 + thumbOut * 0.5 - curl * 0.35);
    const l1 = 34, l2 = 30; const m = { x: bx + Math.sin(a0) * l1, y: by - Math.cos(a0) * l1 };
    const a1 = a0 - thumbSide * (0.35 + curl * 0.5); const t = { x: m.x + Math.sin(a1) * l2, y: m.y - Math.cos(a1) * l2 };
    const path = () => { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(m.x, m.y); ctx.lineTo(t.x, t.y); };
    path(); ctx.lineWidth = 29; ctx.strokeStyle = OL; ctx.stroke(); path(); ctx.lineWidth = 20; ctx.strokeStyle = C.skin; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m.x - 3, m.y); ctx.lineTo(m.x + 3, m.y); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(122,75,46,.35)'; ctx.stroke();
  };
  th();
  fingers.map((f, i) => [f, i]).sort((a, b) => Math.abs(b[1] - 1.5) - Math.abs(a[1] - 1.5)).forEach(([f, i]) => drawFinger(f, i));
  // palm
  const palm = new Path2D();
  palm.moveTo(-24, 6); palm.bezierCurveTo(-38, -10, -42, -40, -40, -62); palm.quadraticCurveTo(-38, -80, -20, -80);
  palm.lineTo(20, -80); palm.quadraticCurveTo(38, -80, 40, -62); palm.bezierCurveTo(42, -40, 38, -10, 24, 6); palm.closePath();
  const pg = ctx.createRadialGradient(-8, -42, 4, 0, -34, 54); pg.addColorStop(0, C.skinL); pg.addColorStop(1, C.skin);
  ctx.fillStyle = pg; ctx.fill(palm); ctx.lineWidth = 5; ctx.strokeStyle = OL; ctx.stroke(palm);
  // cover finger-root outlines inside the palm
  ctx.save(); ctx.clip(palm); ctx.fillStyle = pg; ctx.fillRect(-36, -70, 72, 66); ctx.restore();
  ctx.strokeStyle = 'rgba(122,75,46,.30)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-22, -28); ctx.quadraticCurveTo(0, -18, 24, -34); ctx.stroke();
  ctx.restore();
}
export { SHOULDER_DX, SHOULDER_Y };
