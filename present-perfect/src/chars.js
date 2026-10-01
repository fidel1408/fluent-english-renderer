/* chars.js — procedural adult cartoon characters (waist-up rig).
   Origin = base of the neck, +y down. Everything is a pure function of the pose object P,
   so any frame can be rendered at any time (scrubbing, chapter jumps, replay). */
'use strict';

const CAST = {
  D: { id: 'D', name: 'Daniel', sw: 140, skin: '#E2B08A', hair: '#33201A', hairHi: '#6B4A37', eye: '#5B3D26', lips: '#BE6F62', brow: '#2C1A12', jaw: 1.06, eyeW: 17,
       top: '#27456E', topHi: '#3A6296', collar: '#DCEAF7', style: 'short', glasses: true, stubble: true, outfit: 'sweater', lash: 0, cheek: 0.10 },
  M: { id: 'M', name: 'Maya', sw: 120, skin: '#B67A58', hair: '#1F120D', hairHi: '#4A2E22', eye: '#3A2418', lips: '#A9453F', brow: '#1B0F0A', jaw: 0.90, eyeW: 18.5,
       top: '#17727A', topHi: '#2C9AA0', collar: '#FBF1DF', style: 'curls', glasses: false, stubble: false, outfit: 'blazer', lash: 1, cheek: 0.24, pendant: '#E9B949', earring: '#E9B949' },
  S: { id: 'S', name: 'Sofia', sw: 114, skin: '#DDA67F', hair: '#7E3517', hairHi: '#C2692F', eye: '#2F6E55', lips: '#CE4F57', brow: '#5A2610', jaw: 0.88, eyeW: 18.5,
       top: '#E4AA2D', topHi: '#F5CC62', collar: '#FFFFFF', style: 'long', glasses: false, stubble: false, outfit: 'cardigan', lash: 1, cheek: 0.26, scarf: '#3E9C76', earring: '#F2D27A' },
};

const HS = 1.14;   // head scale: slightly large heads read friendlier on a classroom screen
const REST_ARM = (c, side) => ({ x: side * (c.sw - 6), y: 330, hand: 'rest' });
const POSE0 = {
  bx: 0, by: 0, lean: 0, shrug: 0, yaw: 0, pitch: 0, roll: 0, gx: 0, gy: 0, brow: 0, bt: 0, lid: 1, smile: 0.15, open: 0, round: 0, blink: 0,
};

/* ------------------------------------------------------------------ face */
function facePath(c) {
  const j = c.jaw, p = new Path2D();
  p.moveTo(0, -98);
  p.bezierCurveTo(54, -98, 79, -62, 79, -14);
  p.bezierCurveTo(79, 26, 62 * j, 64, 34 * j, 86);
  p.bezierCurveTo(20 * j, 99, -20 * j, 99, -34 * j, 86);
  p.bezierCurveTo(-62 * j, 64, -79, 26, -79, -14);
  p.bezierCurveTo(-79, -62, -54, -98, 0, -98);
  p.closePath();
  return p;
}
const _fp = {};
function getFace(c) { return _fp[c.id] || (_fp[c.id] = facePath(c)); }

function drawEye(ctx, c, side, P, yawShift) {
  const far = side * P.yaw > 0 ? 1 - 0.26 * Math.abs(P.yaw) : 1 + 0.05 * Math.abs(P.yaw);
  const ew = c.eyeW * far, lid = clamp(P.lid * (1 - P.blink), 0, 1.25);
  const ex = side * 34 + yawShift, ey = -4;
  ctx.save(); ctx.translate(ex, ey); ctx.rotate(side * -0.05);
  // socket shadow
  ctx.fillStyle = rgba(shade(c.skin, -0.35), 0.28); ctx.beginPath(); ctx.ellipse(0, -2, ew + 7, 17, 0, 0, TAU); ctx.fill();
  const uh = 13 * lid, lh = 7.5 * Math.min(lid, 1);
  const eye = new Path2D();
  eye.moveTo(-ew, 1); eye.bezierCurveTo(-ew * 0.55, -uh * 1.35, ew * 0.55, -uh * 1.35, ew, 1);
  eye.bezierCurveTo(ew * 0.55, lh * 1.35, -ew * 0.55, lh * 1.35, -ew, 1); eye.closePath();
  if (lid > 0.12) {
    ctx.save(); ctx.clip(eye);
    ctx.fillStyle = '#FBFAF5'; ctx.fillRect(-ew - 2, -20, ew * 2 + 4, 40);
    const ix = clamp(P.gx, -1, 1) * 8 * far + yawShift * 0.25 * 0 + side * 0, iy = clamp(P.gy, -1, 1) * 4.5 - 0.5;
    const ir = 10.6 * (0.96 + 0.04 * lid);
    ctx.fillStyle = rg(ctx, ix, iy, 1, ir, [[0, shade(c.eye, 0.18)], [0.6, c.eye], [1, shade(c.eye, -0.5)]]);
    ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fill();
    ctx.fillStyle = '#120A07'; ctx.beginPath(); ctx.arc(ix, iy, 5.2, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(ix - 3.6, iy - 3.8, 2.6, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(ix + 3.4, iy + 3.4, 1.3, 0, TAU); ctx.fill();
    // upper-lid shadow
    ctx.fillStyle = lg(ctx, 0, -uh * 1.3, 0, uh * 0.4, [[0, 'rgba(60,30,20,.38)'], [1, 'rgba(60,30,20,0)']]); ctx.fillRect(-ew - 2, -20, ew * 2 + 4, 28);
    ctx.restore();
  }
  // lids / lashes
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = shade(c.hair, -0.2); ctx.lineWidth = 3.4 + c.lash * 0.8;
  ctx.beginPath();
  if (lid > 0.12) { ctx.moveTo(-ew - 1, 1.5); ctx.bezierCurveTo(-ew * 0.55, -uh * 1.4, ew * 0.55, -uh * 1.4, ew + 1, 1.5); }
  else { ctx.moveTo(-ew, 1); ctx.quadraticCurveTo(0, 5, ew, 1); }
  ctx.stroke();
  if (c.lash && lid > 0.12) { // outer-corner flick
    ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(side * ew + side * -1, 0.5); ctx.quadraticCurveTo(side * (ew + 6), -2, side * (ew + 9), -6); ctx.stroke();
  }
  ctx.strokeStyle = rgba(shade(c.skin, -0.45), 0.5); ctx.lineWidth = 1.6; ctx.beginPath();
  ctx.moveTo(-ew * 0.7, lh * 1.2 + 2); ctx.quadraticCurveTo(0, lh * 1.7 + 3, ew * 0.7, lh * 1.2 + 2); ctx.stroke();
  // crease
  if (lid > 0.4) { ctx.strokeStyle = rgba(shade(c.skin, -0.5), 0.45); ctx.lineWidth = 1.8; ctx.beginPath();
    ctx.moveTo(-ew * 0.8, -uh * 1.55 - 3); ctx.quadraticCurveTo(0, -uh * 1.75 - 7, ew * 0.8, -uh * 1.55 - 3); ctx.stroke(); }
  ctx.restore();
}

function drawBrow(ctx, c, side, P, yawShift) {
  const lift = -P.brow * 11, tilt = P.bt;
  const x0 = side * 34 + yawShift, y0 = -34 + lift;
  const th = c.id === 'S' ? 4.2 : c.id === 'M' ? 6.6 : 7.4;
  const inner = [x0 - side * 25, y0 + 1 - tilt * 7], outer = [x0 + side * 25, y0 + 3 + tilt * 4.5], mid = [x0 + side * 2, y0 - 6 - (c.id === 'S' ? 3 : 0) - tilt * 1.2];
  ctx.fillStyle = c.brow;
  ctx.beginPath();
  ctx.moveTo(inner[0], inner[1]);
  ctx.quadraticCurveTo(mid[0] - side * 2, mid[1] - th * 0.35, outer[0], outer[1] - 0.5);
  ctx.quadraticCurveTo(mid[0] + side * 2, mid[1] + th * 0.9, inner[0], inner[1] + th * 0.9);
  ctx.closePath(); ctx.fill();
}

function drawMouth(ctx, c, P, yawShift) {
  const o = clamp(P.open, 0, 1), rd = clamp(P.round, 0, 1), sm = clamp(P.smile, -1, 1);
  const mx = yawShift * 1.05, my = 55;
  const hw = 21 * (1 + 0.28 * sm - 0.38 * rd + 0.12 * o * (1 - rd));
  const cy = -sm * 6.5 + 1;                // corner lift
  const up = my - 2.5 + o * 0.0, drop = o * 27 * (1 - 0.25 * rd) + 0.01;
  const lip = c.lips, lipD = shade(c.lips, -0.28);
  ctx.save(); ctx.translate(mx, 0); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (o < 0.07) {
    // closed: upper lip, lower lip
    ctx.fillStyle = lip;
    ctx.beginPath(); ctx.moveTo(-hw, my + cy);
    ctx.bezierCurveTo(-hw * 0.5, my - 6 + cy * 0.2, -hw * 0.15, my - 7, 0, my - 4.5);
    ctx.bezierCurveTo(hw * 0.15, my - 7, hw * 0.5, my - 6 + cy * 0.2, hw, my + cy);
    ctx.bezierCurveTo(hw * 0.5, my + 1.5 + cy * 0.3, -hw * 0.5, my + 1.5 + cy * 0.3, -hw, my + cy); ctx.fill();
    ctx.fillStyle = shade(lip, 0.08);
    ctx.beginPath(); ctx.moveTo(-hw * 0.88, my + cy * 0.9 + 0.5);
    ctx.bezierCurveTo(-hw * 0.4, my + 11 + sm * 1.5, hw * 0.4, my + 11 + sm * 1.5, hw * 0.88, my + cy * 0.9 + 0.5);
    ctx.bezierCurveTo(hw * 0.4, my + 2.4, -hw * 0.4, my + 2.4, -hw * 0.88, my + cy * 0.9 + 0.5); ctx.fill();
    ctx.strokeStyle = lipD; ctx.lineWidth = 2.1; ctx.beginPath(); ctx.moveTo(-hw, my + cy); ctx.bezierCurveTo(-hw * 0.4, my + 2.8, hw * 0.4, my + 2.8, hw, my + cy); ctx.stroke();
    // smile creases
    if (sm > 0.3) { ctx.strokeStyle = rgba(shade(c.skin, -0.5), 0.35 * sm); ctx.lineWidth = 2;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * (hw + 3), my + cy - 5); ctx.quadraticCurveTo(s * (hw + 9), my + cy + 2, s * (hw + 4), my + cy + 9); ctx.stroke(); } }
  } else {
    const topY = my - 3, botY = my + 1 + drop;
    const mouth = new Path2D();
    mouth.moveTo(-hw, my + cy);
    mouth.bezierCurveTo(-hw * 0.55, topY - 3, -hw * 0.18, topY - 4, 0, topY - 2.5);
    mouth.bezierCurveTo(hw * 0.18, topY - 4, hw * 0.55, topY - 3, hw, my + cy);
    mouth.bezierCurveTo(hw * 0.78, botY + 5, hw * 0.3, botY + 9, 0, botY + 9);
    mouth.bezierCurveTo(-hw * 0.3, botY + 9, -hw * 0.78, botY + 5, -hw, my + cy); mouth.closePath();
    ctx.fillStyle = '#4A1C1F'; ctx.fill(mouth);
    ctx.save(); ctx.clip(mouth);
    if (o > 0.14) { // upper teeth
      ctx.fillStyle = '#FBF7F0'; ctx.beginPath(); rrect(ctx, -hw * 0.78, topY - 4, hw * 1.56, Math.min(10, 4 + o * 9), 4); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fillRect(-hw * 0.78, topY + Math.min(10, 4 + o * 9) - 6, hw * 1.56, 2);
    }
    if (o > 0.3) { ctx.fillStyle = '#D9726F'; ctx.beginPath(); ctx.ellipse(0, botY + 6, hw * 0.62, 8 + o * 4, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    // lips
    ctx.strokeStyle = lip; ctx.lineWidth = 5.4;
    ctx.beginPath(); ctx.moveTo(-hw, my + cy); ctx.bezierCurveTo(-hw * 0.55, topY - 3, -hw * 0.18, topY - 4, 0, topY - 2.5); ctx.bezierCurveTo(hw * 0.18, topY - 4, hw * 0.55, topY - 3, hw, my + cy); ctx.stroke();
    ctx.lineWidth = 6.4; ctx.strokeStyle = shade(lip, 0.06);
    ctx.beginPath(); ctx.moveTo(-hw, my + cy); ctx.bezierCurveTo(-hw * 0.78, botY + 5, -hw * 0.3, botY + 9, 0, botY + 9); ctx.bezierCurveTo(hw * 0.3, botY + 9, hw * 0.78, botY + 5, hw, my + cy); ctx.stroke();
  }
  ctx.restore();
}

function drawNose(ctx, c, yawShift) {
  const x = yawShift * 1.15;
  ctx.save(); ctx.translate(x, 0);
  ctx.fillStyle = rgba(shade(c.skin, -0.3), 0.22); ctx.beginPath(); ctx.ellipse(8, 24, 13, 10, 0.2, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(shade(c.skin, -0.55), 0.55); ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-1, -6); ctx.quadraticCurveTo(7, 12, 6, 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, 28); ctx.quadraticCurveTo(-1, 35, 10, 28); ctx.stroke();
  ctx.fillStyle = rgba(shade(c.skin, -0.6), 0.5);
  ctx.beginPath(); ctx.ellipse(-6, 29.5, 3, 1.8, 0.3, 0, TAU); ctx.ellipse(7, 29.5, 3, 1.8, -0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba(shade(c.skin, 0.4), 0.45); ctx.beginPath(); ctx.ellipse(-3, 12, 3.2, 9, 0.1, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ------------------------------------------------------------------ hair */
const _curls = {};
function curlSet(seed) {
  if (_curls[seed]) return _curls[seed];
  const r = rng(seed), back = [], front = [];
  for (let i = 0; i < 34; i++) {
    const th = Math.PI + 0.05 + (i / 33) * (Math.PI + 0.1) - 0.2 + (r() - 0.5) * 0.12;
    const rad = 1 + r() * 0.12;
    back.push([Math.cos(th) * 88 * rad, -22 + Math.sin(th) * 96 * rad, 32 + r() * 15]);
  }
  for (let i = 0; i < 14; i++) { // inner fill + side/lower puffs
    const th = r() * TAU; back.push([Math.cos(th) * 52, -35 + Math.sin(th) * 52, 36 + r() * 14]);
  }
  for (const s of [-1, 1]) for (let j = 0; j < 4; j++) back.push([s * (84 + r() * 10), -10 + j * 20, 26 + r() * 8]);
  for (let i = 0; i < 12; i++) front.push([-66 + i * 12 + (r() - 0.5) * 6, -83 - Math.sin(i / 11 * Math.PI) * 6 + (r() - 0.5) * 7, 21 + r() * 8]);
  return (_curls[seed] = { back, front });
}
function drawCurls(ctx, c, list, sway) {
  const base = c.hair, hi = c.hairHi;
  for (const [x, y, r] of list) {
    ctx.fillStyle = rg(ctx, x - r * 0.3 + sway, y - r * 0.4, 1, r * 1.1, [[0, hi], [0.55, base], [1, shade(base, -0.4)]]);
    ctx.beginPath(); ctx.arc(x + sway * (y < -40 ? 0.6 : 1), y, r, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = rgba(hi, 0.55); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  for (let i = 0; i < list.length; i += 3) { const [x, y, r] = list[i]; ctx.beginPath(); ctx.arc(x - r * 0.15 + sway, y - r * 0.1, r * 0.55, Math.PI * 1.1, Math.PI * 1.55); ctx.stroke(); }
}

function hairBack(ctx, c, P, sway) {
  const s = c.style;
  if (s === 'curls') drawCurls(ctx, c, curlSet(7).back, sway * 0.5);
  else if (s === 'short') {
    ctx.fillStyle = lg(ctx, 0, -130, 0, 10, [[0, c.hairHi], [0.4, c.hair], [1, shade(c.hair, -0.3)]]);
    ctx.beginPath(); ctx.moveTo(-82, -6); ctx.bezierCurveTo(-98, -78, -50, -128, 8, -126); ctx.bezierCurveTo(70, -124, 100, -70, 82, -4);
    ctx.bezierCurveTo(78, 12, 60, 6, 60, -12); ctx.lineTo(-60, -12); ctx.bezierCurveTo(-60, 6, -78, 12, -82, -6); ctx.fill();
  } else if (s === 'long') {
    ctx.fillStyle = lg(ctx, 0, -120, 0, 230, [[0, c.hairHi], [0.25, c.hair], [1, shade(c.hair, -0.35)]]);
    ctx.beginPath(); ctx.moveTo(0, -118);
    ctx.bezierCurveTo(70, -122, 112, -70, 108, -6); ctx.bezierCurveTo(106, 70, 124, 140, 100 + sway, 232);
    ctx.bezierCurveTo(78, 252, 40, 236, 20, 222); ctx.lineTo(-20, 222);
    ctx.bezierCurveTo(-44, 244, -84, 254, -106 + sway, 228); ctx.bezierCurveTo(-126, 140, -108, 70, -108, -6);
    ctx.bezierCurveTo(-112, -70, -70, -122, 0, -118); ctx.fill();
  }
}

function hairFront(ctx, c, P, sway) {
  const s = c.style;
  if (s === 'curls') { drawCurls(ctx, c, curlSet(7).front, sway * 0.3); return; }
  if (s === 'short') {
    ctx.fillStyle = lg(ctx, -60, -120, 60, -40, [[0, c.hairHi], [0.45, c.hair], [1, shade(c.hair, -0.25)]]);
    ctx.beginPath();
    ctx.moveTo(-80, -26); ctx.bezierCurveTo(-96, -88, -48, -128, 14, -124);
    ctx.bezierCurveTo(66, -122, 98, -78, 80, -22);
    ctx.bezierCurveTo(78, -48, 64, -70, 40, -80);              // right hairline
    ctx.bezierCurveTo(14, -62, -14, -78, -38, -90);           // part wave
    ctx.bezierCurveTo(-58, -74, -72, -52, -80, -26); ctx.fill();
    ctx.strokeStyle = rgba(c.hairHi, 0.7); ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 22, -100 + Math.abs(i - 2.5) * 5); ctx.quadraticCurveTo(-30 + i * 22, -122 + i * 2, 10 + i * 18, -104 + i * 3); ctx.stroke(); }
    // sideburns
    ctx.fillStyle = shade(c.hair, -0.1);
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 78, -34); ctx.lineTo(sd * 79, 6); ctx.lineTo(sd * 72, 0); ctx.lineTo(sd * 71, -30); ctx.fill(); }
  } else if (s === 'long') {
    ctx.fillStyle = lg(ctx, -40, -120, 80, -30, [[0, c.hairHi], [0.35, c.hair], [1, shade(c.hair, -0.3)]]);
    // side-swept fringe
    ctx.beginPath(); ctx.moveTo(-24, -112);
    ctx.bezierCurveTo(30, -112, 84, -84, 84, -22);
    ctx.bezierCurveTo(70, -52, 42, -66, 8, -62);
    ctx.bezierCurveTo(-18, -58, -50, -62, -72, -30);
    ctx.bezierCurveTo(-90, -70, -64, -112, -24, -112); ctx.fill();
    // left side lock framing face down to the shoulder
    ctx.beginPath(); ctx.moveTo(-72, -36); ctx.bezierCurveTo(-92, -70, -112, -10, -108, 70 + sway * 0.3);
    ctx.bezierCurveTo(-104, 130, -112, 160, -100 + sway, 190); ctx.bezierCurveTo(-74, 150, -76, 90, -70, 30); ctx.bezierCurveTo(-66, 0, -66, -20, -72, -36); ctx.fill();
    ctx.strokeStyle = rgba(c.hairHi, 0.75); ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 18, -108 + i * 6); ctx.quadraticCurveTo(34 + i * 10, -96 + i * 6, 70, -52 + i * 4); ctx.stroke(); }
  }
}

/* ------------------------------------------------------------- body & clothes */
function drawTorso(ctx, c, P) {
  const sw = c.sw, sh = -P.shrug * 10;
  const body = new Path2D();
  body.moveTo(-30, -8); body.bezierCurveTo(-64, 0 + sh, -sw + 34, 4 + sh, -sw + 2, 34 + sh);
  body.bezierCurveTo(-sw - 12, 80, -sw - 6, 200, -sw + 2, 330);
  body.lineTo(-sw + 4, 700); body.lineTo(sw - 4, 700); body.lineTo(sw - 2, 330);
  body.bezierCurveTo(sw + 6, 200, sw + 12, 80, sw - 2, 34 + sh);
  body.bezierCurveTo(sw - 34, 4 + sh, 64, 0 + sh, 30, -8); body.closePath();
  ctx.save();
  ctx.fillStyle = lg(ctx, -sw, 0, sw, 360, [[0, c.topHi], [0.45, c.top], [1, shade(c.top, -0.35)]]);
  ctx.fill(body);
  ctx.clip(body);
  const o = c.outfit;
  if (o === 'sweater') {
    // knit ribs + v-neck with collar
    ctx.strokeStyle = rgba(shade(c.top, -0.35), 0.28); ctx.lineWidth = 3;
    for (let x = -sw + 18; x < sw; x += 17) { ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x * 1.03, 700); ctx.stroke(); }
    ctx.fillStyle = c.collar; ctx.beginPath(); ctx.moveTo(-34, -10); ctx.lineTo(0, 62); ctx.lineTo(34, -10); ctx.lineTo(48, 4); ctx.lineTo(0, 78); ctx.lineTo(-48, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lg(ctx, 0, -10, 0, 70, [[0, '#E9F2FB'], [1, '#B9D0E8']]);
    ctx.beginPath(); ctx.moveTo(-30, -10); ctx.lineTo(0, 56); ctx.lineTo(30, -10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(c.top, -0.45); ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-50, 4); ctx.lineTo(0, 80); ctx.lineTo(50, 4); ctx.stroke();
  } else if (o === 'blazer') {
    ctx.fillStyle = c.collar; ctx.beginPath(); ctx.moveTo(-34, -10); ctx.bezierCurveTo(-30, 40, -12, 74, 0, 82); ctx.bezierCurveTo(12, 74, 30, 40, 34, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba('#000000', 0.07); ctx.beginPath(); ctx.moveTo(-34, -10); ctx.bezierCurveTo(-30, 40, -12, 74, 0, 82); ctx.lineTo(0, -10); ctx.fill();
    // lapels
    for (const s of [-1, 1]) {
      ctx.fillStyle = lg(ctx, s * 20, 0, s * 80, 140, [[0, shade(c.top, 0.2)], [1, shade(c.top, -0.15)]]);
      ctx.beginPath(); ctx.moveTo(s * 36, -12); ctx.lineTo(s * 74, 18); ctx.lineTo(s * 40, 130); ctx.lineTo(s * 4, 90); ctx.bezierCurveTo(s * 20, 60, s * 30, 30, s * 36, -12); ctx.fill();
      ctx.strokeStyle = shade(c.top, -0.45); ctx.lineWidth = 2.6; ctx.stroke();
    }
    ctx.strokeStyle = rgba(c.pendant, 1); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(0, 96, 26, 0); ctx.stroke();
    ctx.fillStyle = c.pendant; ctx.beginPath(); ctx.arc(0, 66, 7.5, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-2, 64, 2.4, 0, TAU); ctx.fill();
    // buttons
    ctx.fillStyle = shade(c.top, -0.4); for (const y of [190, 270]) { ctx.beginPath(); ctx.arc(-6, y, 5, 0, TAU); ctx.fill(); }
  } else if (o === 'cardigan') {
    ctx.fillStyle = c.collar; ctx.beginPath(); ctx.moveTo(-60, -10); ctx.bezierCurveTo(-52, 60, -20, 120, 0, 150); ctx.bezierCurveTo(20, 120, 52, 60, 60, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba('#000', 0.06); ctx.beginPath(); ctx.moveTo(-60, -10); ctx.bezierCurveTo(-52, 60, -20, 120, 0, 150); ctx.lineTo(0, -10); ctx.fill();
    for (const s of [-1, 1]) { // cardigan fronts
      ctx.fillStyle = lg(ctx, s * 10, 0, s * 70, 200, [[0, shade(c.top, 0.1)], [1, shade(c.top, -0.2)]]);
      ctx.beginPath(); ctx.moveTo(s * 58, -14); ctx.bezierCurveTo(s * 52, 60, s * 22, 120, s * 4, 160); ctx.lineTo(s * 4, 720); ctx.lineTo(s * 130, 720); ctx.lineTo(s * 130, -10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = shade(c.top, -0.4); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s * 58, -14); ctx.bezierCurveTo(s * 52, 60, s * 22, 120, s * 4, 160); ctx.stroke();
    }
    ctx.fillStyle = shade(c.top, -0.35); for (const y of [210, 290]) { ctx.beginPath(); ctx.arc(10, y, 5.5, 0, TAU); ctx.fill(); }
  }
  // soft form shadow on the right side + under-neck shadow
  ctx.fillStyle = lg(ctx, sw * 0.2, 0, sw, 0, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(10,20,40,.20)']]); ctx.fillRect(-sw - 20, -20, sw * 2 + 40, 760);
  ctx.restore();
  ctx.strokeStyle = rgba(shade(c.top, -0.55), 0.6); ctx.lineWidth = 2.5; ctx.stroke(body);
}

function drawNeck(ctx, c) {
  ctx.fillStyle = lg(ctx, -30, 0, 30, 0, [[0, shade(c.skin, -0.12)], [0.5, c.skin], [1, shade(c.skin, -0.28)]]);
  ctx.beginPath(); ctx.moveTo(-27, -62); ctx.lineTo(-29, 12); ctx.quadraticCurveTo(0, 26, 29, 12); ctx.lineTo(27, -62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba(shade(c.skin, -0.6), 0.32); ctx.beginPath(); ctx.moveTo(-28, -40); ctx.quadraticCurveTo(0, -4, 28, -40); ctx.lineTo(28, -62); ctx.lineTo(-28, -62); ctx.fill();
}

/* ------------------------------------------------------------------ arms */
function ik(sx, sy, tx, ty, L1, L2, bendSign) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
  const dmax = L1 + L2 - 2, dmin = Math.abs(L1 - L2) + 6;
  const dd = clamp(d, dmin, dmax);
  const a = Math.atan2(dy, dx);
  const cosA = clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1);
  const A = Math.acos(cosA) * bendSign;
  const ex = sx + Math.cos(a + A) * L1, ey = sy + Math.sin(a + A) * L1;
  const wx = sx + Math.cos(a) * dd, wy = sy + Math.sin(a) * dd;
  return { ex, ey, wx, wy };
}

function drawHand(ctx, c, type, side, shade_) {
  const skin = c.skin, sk2 = shade(skin, -0.25), ol = rgba(shade(skin, -0.6), 0.65);
  const th = side;                                            // thumb side: toward body centre
  const fing = (x0, y0, x1, y1, w) => { ctx.beginPath(); limb(ctx, x0, y0, x1, y1, w, w * 0.88); ctx.fill(); ctx.stroke(); };
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 1.8; ctx.strokeStyle = ol;
  const g = lg(ctx, -22, 0, 22, 0, [[0, shade(skin, 0.06)], [1, sk2]]);
  ctx.fillStyle = g;
  if (type === 'open') {
    // palm presented, fingers fanned
    ctx.beginPath(); ctx.ellipse(0, 24, 22, 26, 0, 0, TAU); ctx.fill(); ctx.stroke();
    const fa = [-0.46, -0.16, 0.12, 0.40], fl = [28, 36, 34, 27];
    ctx.fillStyle = g;
    for (let i = 0; i < 4; i++) { const a = Math.PI / 2 + fa[i]; fing(Math.cos(a) * 10 * 0 + (i - 1.5) * 10, 38, (i - 1.5) * 10 + Math.cos(a) * fl[i], 38 + Math.sin(a) * fl[i], 11); }
    fing(th * 18, 20, th * 44, 34, 12.5);
    ctx.fillStyle = rgba(sk2, 0.5); ctx.beginPath(); ctx.ellipse(0, 26, 11, 12, 0, 0, TAU); ctx.fill();
  } else if (type === 'point') {
    ctx.beginPath(); ctx.ellipse(0, 24, 21, 24, 0, 0, TAU); ctx.fill(); ctx.stroke();
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(-th * (i - 2) * -1 * 0 + (i - 2.2) * 10 * -th, 44, 8.5, 9, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    fing(-th * 11, 34, -th * 11 + th * 0, 76, 11.5);
    fing(th * 16, 26, th * 28, 42, 12);
  } else if (type === 'grip') {
    ctx.beginPath(); rrect(ctx, -23, 6, 46, 44, 16); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = rgba(sk2, 0.9); ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-18, 20 + i * 9); ctx.lineTo(16, 20 + i * 9); ctx.stroke(); }
    ctx.strokeStyle = ol; ctx.lineWidth = 1.8; ctx.fillStyle = g; fing(th * 14, 10, th * 22, 34, 14);
  } else { // rest / relaxed
    ctx.beginPath(); ctx.ellipse(0, 24, 21, 25, 0, 0, TAU); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 4; i++) fing((i - 1.5) * 9.5, 40, (i - 1.5) * 9.2 + th * 1.2, 60 + (i === 1 || i === 2 ? 4 : 0), 10);
    fing(th * 17, 14, th * 27, 38, 12.5);
  }
}

function drawItem(ctx, item, side) {
  ctx.save();
  if (item === 'phone') { ctx.translate(side * 4, 38); ctx.rotate(side * 0.25); ctx.fillStyle = '#1D2230'; ctx.beginPath(); rrect(ctx, -22, -4, 44, 76, 8); ctx.fill(); ctx.fillStyle = lg(ctx, 0, 0, 0, 70, [[0, '#7FC6F2'], [1, '#3A7DB8']]); ctx.beginPath(); rrect(ctx, -18, 0, 36, 66, 5); ctx.fill(); }
  else if (item === 'keys') { ctx.translate(0, 62); ctx.strokeStyle = '#B9BEC7'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.stroke(); ctx.fillStyle = '#D9A93B'; for (const a of [0.5, 1.7, 2.6]) { ctx.save(); ctx.rotate(a); ctx.fillRect(10, -3.5, 38, 7); ctx.fillRect(40, 3, 5, 10); ctx.restore(); } }
  else if (item === 'cup') { ctx.translate(0, 52); ctx.fillStyle = '#F7F1E7'; ctx.beginPath(); ctx.moveTo(-24, -26); ctx.lineTo(24, -26); ctx.lineTo(18, 28); ctx.quadraticCurveTo(0, 34, -18, 28); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7A4A2A'; ctx.fillRect(-23, -26, 46, 8); ctx.strokeStyle = '#F7F1E7'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(side * -30, -2, 12, -1.3, 1.3, side > 0); ctx.stroke(); }
  else if (item === 'report') { ctx.translate(side * 6, 54); ctx.rotate(side * -0.08); ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#B7C2D0'; ctx.lineWidth = 2; ctx.beginPath(); rrect(ctx, -56, -40, 112, 150, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2E7DD7'; ctx.fillRect(-42, -26, 52, 9); ctx.fillStyle = '#C7D2E0'; for (let i = 0; i < 5; i++) ctx.fillRect(-42, -6 + i * 12, 84 - (i % 2) * 18, 5); ctx.fillStyle = '#17A589'; ctx.fillRect(-42, 60, 18, 30); ctx.fillStyle = '#F28C28'; ctx.fillRect(-18, 46, 18, 44); ctx.fillStyle = '#2E7DD7'; ctx.fillRect(6, 70, 18, 20); }
  else if (item === 'planner') { ctx.translate(side * 4, 50); ctx.fillStyle = '#7A3B4F'; ctx.beginPath(); rrect(ctx, -34, -30, 68, 100, 6); ctx.fill(); ctx.fillStyle = '#F6E7C9'; ctx.fillRect(-28, -24, 56, 88); ctx.fillStyle = '#C8B58C'; for (let i = 0; i < 5; i++) ctx.fillRect(-22, -12 + i * 14, 44, 3); }
  ctx.restore();
}

function drawArm(ctx, c, P, side, arm, outfit) {
  const sx = side * (c.sw - 24), sy = 34 - P.shrug * 10;
  const L1 = 172, L2 = 160;
  const r = ik(sx, sy, arm.x, arm.y, L1, L2, (side < 0 ? 1 : -1) * (arm.y < 60 ? -1 : 1));   // raised hand: elbow drops
  const sleeve = c.top, w0 = 64, w1 = 52, w2 = 46;
  ctx.save();
  // upper arm + forearm sleeves
  const path = new Path2D();
  const add = (x0, y0, x1, y1, a, b) => { const p = new Path2D(); const t = ctx; t.beginPath(); limb(t, x0, y0, x1, y1, a, b); };
  ctx.fillStyle = lg(ctx, sx - 40, sy, sx + 40, sy + 100, [[0, shade(sleeve, 0.12)], [0.6, sleeve], [1, shade(sleeve, -0.28)]]);
  ctx.strokeStyle = rgba(shade(sleeve, -0.6), 0.65); ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath(); limb(ctx, sx, sy, r.ex, r.ey, w0, w1); ctx.fill(); ctx.stroke();
  ctx.beginPath(); limb(ctx, r.ex, r.ey, r.wx, r.wy, w1, w2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(r.ex, r.ey, w1 / 2 - 0.6, 0, TAU); ctx.fill();
  // fold highlight on forearm
  ctx.strokeStyle = rgba(shade(sleeve, 0.35), 0.35); ctx.lineWidth = 5; ctx.lineCap = 'round';
  const fa = Math.atan2(r.wy - r.ey, r.wx - r.ex), nx = -Math.sin(fa) * 9, ny = Math.cos(fa) * 9;
  ctx.beginPath(); ctx.moveTo(r.ex + nx * -1 + Math.cos(fa) * 18, r.ey + ny * -1 + Math.sin(fa) * 18); ctx.lineTo(r.wx + nx * -0.7 - Math.cos(fa) * 20, r.wy + ny * -0.7 - Math.sin(fa) * 20); ctx.stroke();
  // cuff
  const cx = r.wx - Math.cos(fa) * 12, cy = r.wy - Math.sin(fa) * 12;
  ctx.fillStyle = outfit === 'sweater' ? shade(sleeve, -0.12) : outfit === 'blazer' ? c.collar : shade(sleeve, -0.1);
  ctx.strokeStyle = rgba(shade(sleeve, -0.6), 0.6); ctx.lineWidth = 2;
  ctx.beginPath(); limb(ctx, cx, cy, r.wx + Math.cos(fa) * 3, r.wy + Math.sin(fa) * 3, w2 + 3, w2 + 1); ctx.fill(); ctx.stroke();
  // hand
  ctx.translate(r.wx, r.wy); ctx.rotate(fa - Math.PI / 2);
  if (arm.item && (arm.item === 'report' || arm.item === 'planner')) drawItem(ctx, arm.item, -side);
  ctx.scale(1.22, 1.22);
  drawHand(ctx, c, arm.hand || 'rest', -side);
  if (arm.item && arm.item !== 'report' && arm.item !== 'planner') drawItem(ctx, arm.item, -side);
  ctx.restore();
  return r;
}

/* ------------------------------------------------------------------ whole figure */
function drawHead(ctx, c, P, sway) {
  const face = getFace(c), yawShift = P.yaw * 15;
  ctx.save();
  ctx.translate(0, -30 + P.pitch * 6); ctx.rotate(P.roll); ctx.scale(HS, HS); ctx.translate(0, -118);
  if (c.style !== 'long') hairBack(ctx, c, P, sway);
  // ears
  for (const s of [-1, 1]) {
    const vis = s * P.yaw > 0.3 ? 0.4 : 1;
    ctx.fillStyle = shade(c.skin, -0.1); ctx.beginPath(); ctx.ellipse(s * 77 + yawShift * 0.3, 0, 12 * vis, 20, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(shade(c.skin, -0.5), 0.35); ctx.beginPath(); ctx.ellipse(s * 77 + yawShift * 0.3, 2, 5 * vis, 11, 0, 0, TAU); ctx.fill();
    if (c.earring && s === -1) { ctx.fillStyle = c.earring; ctx.beginPath(); ctx.arc(s * 77 + yawShift * 0.3, 24, 5.5, 0, TAU); ctx.fill(); }
    if (c.earring && s === 1) { ctx.fillStyle = c.earring; ctx.beginPath(); ctx.arc(s * 77 + yawShift * 0.3, 24, 5.5, 0, TAU); ctx.fill(); }
  }
  // face
  ctx.save(); ctx.translate(0, P.pitch * 5);
  ctx.fillStyle = rg(ctx, -22 + yawShift, -34, 8, 150, [[0, shade(c.skin, 0.14)], [0.55, c.skin], [1, shade(c.skin, -0.30)]]);
  ctx.fill(face);
  ctx.save(); ctx.clip(face);
  // cheek blush, jaw shadow, forehead hair shadow
  const bl = c.cheek; ctx.fillStyle = rgba('#E8636B', bl * (0.7 + 0.5 * clamp(P.smile, 0, 1)));
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 46 + yawShift, 30, 18, 11, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = lg(ctx, 0, 40, 0, 100, [[0, 'rgba(60,20,10,0)'], [1, 'rgba(60,20,10,.22)']]); ctx.fillRect(-90, 40, 180, 70);
  ctx.fillStyle = lg(ctx, 0, -98, 0, -52, [[0, 'rgba(40,15,8,.30)'], [1, 'rgba(40,15,8,0)']]); ctx.fillRect(-90, -100, 180, 50);
  if (c.stubble) {
    ctx.fillStyle = lg(ctx, 0, 20, 0, 100, [[0, 'rgba(40,28,22,0)'], [0.4, 'rgba(40,28,22,.22)'], [1, 'rgba(40,28,22,.38)']]);
    ctx.beginPath(); ctx.moveTo(-82, 10); ctx.bezierCurveTo(-60, 30, -30, 38, 0, 38); ctx.bezierCurveTo(30, 38, 60, 30, 82, 10); ctx.lineTo(82, 110); ctx.lineTo(-82, 110); ctx.fill();
    const r = rng(11); ctx.fillStyle = 'rgba(30,20,16,.35)'; for (let i = 0; i < 90; i++) { const x = (r() - 0.5) * 120, y = 44 + r() * 46; if (Math.abs(x) < 22 && y < 62) continue; ctx.fillRect(x, y, 1.6, 1.6); }
  }
  ctx.restore();
  ctx.strokeStyle = rgba(shade(c.skin, -0.6), 0.5); ctx.lineWidth = 2.2; ctx.stroke(face);
  drawNose(ctx, c, yawShift);
  drawBrow(ctx, c, -1, P, yawShift); drawBrow(ctx, c, 1, P, yawShift);
  drawEye(ctx, c, -1, P, yawShift); drawEye(ctx, c, 1, P, yawShift);
  drawMouth(ctx, c, P, yawShift);
  if (c.glasses) {
    ctx.strokeStyle = '#272A35'; ctx.lineWidth = 3.4; ctx.lineJoin = 'round';
    for (const s of [-1, 1]) { ctx.fillStyle = 'rgba(160,200,235,.10)'; ctx.beginPath(); rrect(ctx, s * 34 + yawShift - 28, -25, 56, 42, 16); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(s * 34 + yawShift - 16, -17); ctx.lineTo(s * 34 + yawShift - 4, -22); ctx.stroke(); ctx.strokeStyle = '#272A35'; ctx.lineWidth = 3.4; }
    ctx.beginPath(); ctx.moveTo(-5 + yawShift, -10); ctx.quadraticCurveTo(0 + yawShift, -15, 5 + yawShift, -10); ctx.stroke();
    ctx.lineWidth = 3; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 62 + yawShift, -10); ctx.lineTo(s * 79 + yawShift * 0.3, -8); ctx.stroke(); }
  }
  ctx.restore();
  hairFront(ctx, c, P, sway);
  ctx.restore();
}

function anchors(c, P) {
  // head centre & mouth in character-local coordinates (after lean/roll)
  const cr = Math.cos(P.roll), sr = Math.sin(P.roll);
  const loc = (x, y) => { x *= HS; y *= HS; const px = x * cr - y * sr, py = x * sr + y * cr; return [px, py - 30 + P.pitch * 6]; };
  const hc = loc(0, -118), mo = loc(P.yaw * 15 * 1.05, -118 + 55 + P.pitch * 5), eyes = [loc(-34 + P.yaw * 15, -122), loc(34 + P.yaw * 15, -122)];
  const lean = (p) => { const a = P.lean, cy = 500, dx = p[0], dy = p[1] - cy; return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a) + cy]; };
  return { head: lean(hc), mouth: lean(mo), eyeL: lean(eyes[0]), eyeR: lean(eyes[1]) };
}

/* draw the figure; (ox,oy) is the neck-base position in the current space, s = scale, flip = face left */
function drawFigure(ctx, id, P, ox, oy, s, flip, sway) {
  const c = CAST[id];
  P.armL = P.armL || REST_ARM(c, -1); P.armR = P.armR || REST_ARM(c, 1);
  ctx.save();
  ctx.translate(ox + P.bx * s, oy + P.by * s); ctx.scale(flip ? -s : s, s);
  // breathing handled by caller through by/lean; rotate upper body about the waist
  ctx.translate(0, 500); ctx.rotate(P.lean); ctx.translate(0, -500);
  hairBack_longOnly(ctx, c, P, sway);
  drawTorso(ctx, c, P);
  drawNeck(ctx, c);
  if (c.scarf) drawScarf(ctx, c);
  if (c.style === 'long') hairShoulder(ctx, c, P, sway);
  const outfit = c.outfit;
  drawArm(ctx, c, P, -1, P.armL, outfit);
  drawArm(ctx, c, P, 1, P.armR, outfit);
  drawHead(ctx, c, P, sway);
  ctx.restore();
}
function hairBack_longOnly(ctx, c, P, sway) {
  if (c.style !== 'long') return;
  ctx.save(); ctx.translate(0, -30 + P.pitch * 6); ctx.rotate(P.roll); ctx.scale(HS, HS); ctx.translate(0, -118);
  hairBack(ctx, c, P, sway); ctx.restore();
}
function hairShoulder(ctx, c, P, sway) {
  // strands falling over the shoulders (drawn after torso, before arms)
  ctx.fillStyle = lg(ctx, 0, -20, 0, 240, [[0, c.hairHi], [0.3, c.hair], [1, shade(c.hair, -0.3)]]);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 66, -40); ctx.bezierCurveTo(s * 112, -10, s * 126, 60, s * (112) + sway * 0.4, 130);
    ctx.bezierCurveTo(s * 112 + sway * 0.4, 190, s * 92 + sway, 230, s * 82 + sway, 246);
    ctx.bezierCurveTo(s * 70, 200, s * 74, 130, s * 66, 60); ctx.bezierCurveTo(s * 62, 20, s * 62, -10, s * 66, -40); ctx.fill();
    ctx.strokeStyle = rgba(c.hairHi, 0.6); ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s * 88, 10); ctx.bezierCurveTo(s * 104, 60, s * 100, 120, s * 94 + sway * 0.5, 180); ctx.stroke();
  }
}
function drawScarf(ctx, c) {
  ctx.fillStyle = lg(ctx, -60, 0, 60, 60, [[0, shade(c.scarf, 0.18)], [1, shade(c.scarf, -0.2)]]);
  ctx.beginPath(); ctx.moveTo(-52, -6); ctx.bezierCurveTo(-40, 38, 40, 38, 52, -6); ctx.bezierCurveTo(44, -18, -44, -18, -52, -6); ctx.fill();
  ctx.strokeStyle = rgba(shade(c.scarf, -0.5), 0.6); ctx.lineWidth = 2.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, 20); ctx.bezierCurveTo(30, 60, 24, 110, 30, 150); ctx.lineTo(4, 156); ctx.bezierCurveTo(4, 110, 6, 60, -2, 28); ctx.closePath(); ctx.fillStyle = lg(ctx, 0, 20, 30, 150, [[0, c.scarf], [1, shade(c.scarf, -0.3)]]); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = rgba('#FFFFFF', 0.28); ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(8, 50 + i * 24); ctx.lineTo(28, 44 + i * 24); ctx.stroke(); }
}

/* expression presets: brow raise, inner-brow tilt, lid openness, smile, extra open mouth */
const EXPR = {
  neutral:   { brow: 0,    bt: 0,    lid: 1,    smile: 0.2,  mo: 0 },
  happy:     { brow: 0.25, bt: 0,    lid: 0.95, smile: 0.85, mo: 0 },
  warm:      { brow: 0.12, bt: 0.1,  lid: 0.97, smile: 0.55, mo: 0 },
  worried:   { brow: 0.45, bt: 0.85, lid: 1.04, smile: -0.45, mo: 0 },
  surprised: { brow: 1.0,  bt: 0.3,  lid: 1.2,  smile: 0.1,  mo: 0.45 },
  thinking:  { brow: 0.35, bt: -0.2, lid: 0.9,  smile: 0.0,  mo: 0 },
  proud:     { brow: 0.3,  bt: 0,    lid: 0.88, smile: 0.9,  mo: 0 },
  curious:   { brow: 0.6,  bt: 0.2,  lid: 1.05, smile: 0.35, mo: 0 },
  relieved:  { brow: 0.2,  bt: 0.5,  lid: 0.8,  smile: 0.7,  mo: 0 },
};
