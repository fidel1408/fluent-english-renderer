/* Fluent English – scene renderer. Everything is procedural canvas drawing (no external images except the embedded logo).
   FE.draw(ctx, state) is a pure function of (beat index, time inside beat, caption mode, absolute time). */
(function () {
  const FE = (window.FE = window.FE || {});
  const C = FE.C, W = FE.W, H = FE.H;

  /* ---------- helpers ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (A, B, t) => A.map((v, i) => lerp(v, B[i], t));
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const seg = (u, a, b) => clamp((u - a) / (b - a));
  FE.util = { clamp, lerp, easeIO, easeOut };

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function lin(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function rad(ctx, x, y, r0, r1, stops) { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function alpha(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
  function shade(hex, k) { // k<0 darker, k>0 lighter
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
  const FONT = '"FE Nunito","Nunito","Avenir Next","Segoe UI","Helvetica Neue",Arial,sans-serif';
  const IPAFONT = '"FE IPA","Noto Sans","Charis SIL","Segoe UI","DejaVu Sans",Arial,sans-serif';

  /* ---------- two-bone IK ---------- */
  function ik(sx, sy, tx, ty, L1, L2, bend) {
    let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
    const dMax = L1 + L2 - 1, dMin = Math.abs(L1 - L2) + 1;
    if (d > dMax) { tx = sx + (dx * dMax) / d; ty = sy + (dy * dMax) / d; d = dMax; dx = tx - sx; dy = ty - sy; }
    if (d < dMin) d = dMin;
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
    return { ex: sx + ux * a - uy * h * bend, ey: sy + uy * a + ux * h * bend, wx: tx, wy: ty };
  }

  /* ---------- characters ---------- */
  const SAM = { name: "Sam", x: 215, feetY: 1370, s: 1.0, facing: 1,
    skin: "#C98F63", skinD: "#A8714A", skinL: "#E2A97D", hair: "#2A1B14", jacket: C.cobalt, jacketD: "#143A9E", tee: C.ivory,
    pants: "#2C3A5E", shoe: "#FFF6E3", sw: 104, male: true };
  const ALEX = { name: "Alex", x: 752, feetY: 1370, s: 0.955, facing: -1,
    skin: "#E9B68F", skinD: "#C88F6A", skinL: "#F6CDAE", hair: "#5B2D1B", jacket: C.coral, jacketD: "#D24A37", tee: C.ivory,
    pants: "#2B4A9C", shoe: C.lemon, sw: 82, male: false };
  const L1 = 150, L2 = 138;

  function shoulderOf(P, side /* 'near' = toward partner */) {
    const dir = side === "near" ? P.facing : -P.facing; // world x direction of that shoulder
    return { x: P.x + dir * P.sw * P.s * 0.93, y: P.feetY - 556 * P.s };
  }

  /* hand poses, written for a character facing RIGHT (Sam). Angles are WORLD degrees (0 = right, 90 = down).
     `mirror(pose)` converts them for a character facing left (Alex). */
  const POSES = {
    cradle: { ang: 6, thumb: -52, curl: [0.1, 0.12, 0.14, 0.2], spread: 9, thumbCurl: 0.15, palmUp: 1 },
    rest:   { ang: 92, thumb: 160, curl: [0.4, 0.46, 0.52, 0.58], spread: 7, thumbCurl: 0.3, palmUp: 0 },
    open:   { ang: -10, thumb: -62, curl: [0.06, 0.04, 0.07, 0.12], spread: 15, thumbCurl: 0.1, palmUp: 1 },
  };
  function lerpPose(a, b, t) {
    return { ang: lerp(a.ang, b.ang, t), thumb: lerp(a.thumb, b.thumb, t), curl: a.curl.map((v, i) => lerp(v, b.curl[i], t)),
      spread: lerp(a.spread, b.spread, t), thumbCurl: lerp(a.thumbCurl, b.thumbCurl, t), palmUp: lerp(a.palmUp, b.palmUp, t) };
  }
  const mirrorPose = (p) => Object.assign({}, p, { ang: 180 - p.ang, thumb: 180 - p.thumb });

  /* A five-fingered hand drawn at the wrist: palm + 4 two-joint fingers + 2-joint thumb. The thumb side is derived
     from the thumb's world angle, so poses blend smoothly with no flipping. */
  function drawHand(ctx, x, y, pose, skin, skinD, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((pose.ang * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    let tl = ((pose.thumb - pose.ang + 540) % 360) - 180; // thumb angle in the hand's frame, -180..180
    const side = Math.tanh(Math.sin((tl * Math.PI) / 180) * 3); // -1 .. 1 : which side of the palm the thumb is on
    const tAng = side >= 0 ? Math.max(18, Math.min(150, tl)) : Math.min(-18, Math.max(-150, tl));
    const outline = skinD;
    const fing = [[15, 27, 24, 14.5], [5, 30, 26, 15], [-5, 28, 25, 14], [-15, 22, 18, 12.5]]; // y offset, len1, len2, width (index first)
    const palmL = 42;
    // thumb behind the palm
    const a0 = (tAng * Math.PI) / 180, bx = 12, by = 19 * side;
    const a1 = a0 - Math.sign(side || 1) * pose.thumbCurl * 0.9;
    const x1 = bx + Math.cos(a0) * 25, y1 = by + Math.sin(a0) * 25, x2 = x1 + Math.cos(a1) * 22, y2 = y1 + Math.sin(a1) * 22;
    const stroke = (pts, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.lineTo(pts[2], pts[3]); ctx.lineTo(pts[4], pts[5]); ctx.stroke(); };
    stroke([bx, by, x1, y1, x2, y2], 21, outline); stroke([bx, by, x1, y1, x2, y2], 17.5, skin);
    ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.ellipse(x2 - 1, y2 - 1.5, 4.4, 3.2, a1, 0, 6.3); ctx.fill();
    // fingers (index on the thumb side)
    fing.forEach((f, i) => {
      const sd = side >= 0 ? 1 : -1;
      const fy = f[0] * sd;
      const a = (((i - 1.5) * pose.spread * -sd) * Math.PI) / 180;
      const c = pose.curl[i] * sd;
      const bx2 = palmL - 4, x1f = bx2 + Math.cos(a) * f[1], y1f = fy + Math.sin(a) * f[1];
      const a2 = a + c * 1.15, x2f = x1f + Math.cos(a2) * f[2], y2f = y1f + Math.sin(a2) * f[2];
      stroke([bx2, fy, x1f, y1f, x2f, y2f], f[3] + 4, outline); stroke([bx2, fy, x1f, y1f, x2f, y2f], f[3], skin);
      ctx.strokeStyle = "rgba(120,60,30,.3)"; ctx.lineWidth = 1.8; ctx.beginPath();
      ctx.moveTo(x1f - Math.sin(a) * f[3] * 0.34, y1f + Math.cos(a) * f[3] * 0.34); ctx.lineTo(x1f + Math.sin(a) * f[3] * 0.34, y1f - Math.cos(a) * f[3] * 0.34); ctx.stroke();
      ctx.fillStyle = pose.palmUp < 0.5 ? "rgba(255,236,222,.85)" : "rgba(255,255,255,.22)";
      ctx.beginPath(); ctx.ellipse(x2f - Math.cos(a2) * 2.5, y2f - Math.sin(a2) * 2.5, 4.8, 3.4, a2, 0, 6.3); ctx.fill();
    });
    // palm
    ctx.beginPath();
    ctx.moveTo(-8, -17); ctx.quadraticCurveTo(palmL * 0.5, -25, palmL, -22); ctx.lineTo(palmL, 24);
    ctx.quadraticCurveTo(palmL * 0.5, 30, 4, 21); ctx.quadraticCurveTo(-11, 8, -8, -17); ctx.closePath();
    ctx.fillStyle = skin; ctx.fill(); ctx.strokeStyle = outline; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.fillStyle = lin(ctx, 0, -22, 0, 28, [[0, "rgba(255,255,255,.2)"], [1, "rgba(120,50,20,.14)"]]); ctx.fill();
    if (pose.palmUp > 0.5) { ctx.strokeStyle = "rgba(120,60,30,.26)"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(12, 9); ctx.quadraticCurveTo(24, 16, 37, 7); ctx.moveTo(14, -5); ctx.quadraticCurveTo(25, 0, 36, -9); ctx.stroke(); }
    ctx.restore();
  }

  /* limb: tapered capsule from a to b */
  function limb(ctx, a, b, w1, w2, fill, edge) {
    const ang = Math.atan2(b.y - a.y, b.x - a.x), nx = -Math.sin(ang), ny = Math.cos(ang);
    ctx.beginPath();
    ctx.moveTo(a.x + nx * w1 / 2, a.y + ny * w1 / 2);
    ctx.lineTo(b.x + nx * w2 / 2, b.y + ny * w2 / 2);
    ctx.arc(b.x, b.y, w2 / 2, ang + Math.PI / 2, ang - Math.PI / 2, true);
    ctx.lineTo(a.x - nx * w1 / 2, a.y - ny * w1 / 2);
    ctx.arc(a.x, a.y, w1 / 2, ang - Math.PI / 2, ang + Math.PI / 2, true);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 2.5; ctx.stroke(); }
  }

  function drawArm(ctx, P, side, wrist, bend) {
    const sh = shoulderOf(P, side);
    const k = P.s;
    const j = ik(sh.x, sh.y, wrist.x, wrist.y, L1 * k, L2 * k, bend);
    const sleeveW = (P.male ? 50 : 42) * k, wristW = (P.male ? 36 : 28) * k;
    const sleeve = P.jacket, sleeveD = P.jacketD;
    // upper arm (sleeve)
    limb(ctx, { x: sh.x, y: sh.y }, { x: j.ex, y: j.ey }, sleeveW, sleeveW * 0.88, sleeve, sleeveD);
    // forearm: sleeve (Sam) or 3/4 sleeve + bare forearm (Alex)
    if (P.male) {
      limb(ctx, { x: j.ex, y: j.ey }, { x: j.wx, y: j.wy }, sleeveW * 0.88, wristW + 6, sleeve, sleeveD);
      // tee cuff + wrist
      const ang = Math.atan2(j.wy - j.ey, j.wx - j.ex);
      limb(ctx, { x: j.wx - Math.cos(ang) * 8, y: j.wy - Math.sin(ang) * 8 }, { x: j.wx + Math.cos(ang) * 3, y: j.wy + Math.sin(ang) * 3 }, wristW + 2, wristW - 2, P.tee, "rgba(0,0,0,.15)");
    } else {
      const mid = { x: lerp(j.ex, j.wx, 0.3), y: lerp(j.ey, j.wy, 0.3) };
      limb(ctx, { x: j.ex, y: j.ey }, mid, sleeveW * 0.88, sleeveW * 0.8, sleeve, sleeveD);
      limb(ctx, mid, { x: j.wx, y: j.wy }, wristW * 1.25, wristW * 0.92, P.skin, P.skinD);
      // bracelet
      const ang = Math.atan2(j.wy - j.ey, j.wx - j.ex);
      limb(ctx, { x: j.wx - Math.cos(ang) * 14, y: j.wy - Math.sin(ang) * 14 }, { x: j.wx - Math.cos(ang) * 9, y: j.wy - Math.sin(ang) * 9 }, wristW + 3, wristW + 3, C.lemon, C.lemonDark);
    }
    // joint soft highlight
    ctx.fillStyle = sleeve; ctx.beginPath(); ctx.arc(j.ex, j.ey, sleeveW * 0.44, 0, 6.3); ctx.fill();
    return j;
  }

  function drawLegsAndBody(ctx, P, T) {
    const s = P.s, fx = P.facing;
    ctx.save();
    ctx.translate(P.x, P.feetY);
    ctx.scale(s, s);
    const sway = Math.sin(T * 1.3 + P.x) * 1.2;
    // ground shadow
    ctx.fillStyle = rad(ctx, 0, 0, 10, 190, [[0, "rgba(40,30,60,.38)"], [1, "rgba(40,30,60,0)"]]);
    ctx.beginPath(); ctx.ellipse(0, 6, 190, 36, 0, 0, 6.3); ctx.fill();
    // legs
    const legW = P.male ? 56 : 48, gap = P.male ? 34 : 28;
    [-1, 1].forEach((sd) => {
      const x0 = sd * gap, x1 = sd * (gap + 6);
      ctx.beginPath();
      ctx.moveTo(x0 - legW / 2, -330); ctx.lineTo(x0 + legW / 2, -330);
      ctx.lineTo(x1 + legW / 2 - 4, -26); ctx.lineTo(x1 - legW / 2 + 4, -26); ctx.closePath();
      ctx.fillStyle = lin(ctx, x0 - legW / 2, 0, x0 + legW / 2, 0, [[0, shade(P.pants, -0.18)], [0.6, P.pants], [1, shade(P.pants, 0.12)]]);
      ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.18)"; ctx.lineWidth = 2; ctx.stroke();
      // shoe
      ctx.beginPath();
      ctx.ellipse(x1 + fx * 22, -16, 54, 20, 0, 0, 6.3);
      ctx.fillStyle = P.shoe; ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x1 + fx * 22, -4, 54, 9, 0, 0, Math.PI); ctx.fillStyle = P.male ? C.coral : C.cobalt; ctx.fill();
    });
    // torso
    const sw = P.sw, waist = P.male ? sw * 0.8 : sw * 0.7, hip = P.male ? sw * 0.86 : sw * 0.88;
    const sy = -556 + sway * 0.3;
    ctx.beginPath();
    ctx.moveTo(-sw, sy + 18);
    ctx.quadraticCurveTo(-sw - 4, sy - 6, -sw * 0.55, sy - 14);
    ctx.lineTo(sw * 0.55, sy - 14);
    ctx.quadraticCurveTo(sw + 4, sy - 6, sw, sy + 18);
    ctx.quadraticCurveTo(sw + 6, -460, waist, -380);
    ctx.quadraticCurveTo(hip + 4, -350, hip, -312);
    ctx.lineTo(-hip, -312);
    ctx.quadraticCurveTo(-hip - 4, -350, -waist, -380);
    ctx.quadraticCurveTo(-sw - 6, -460, -sw, sy + 18);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, -sw, 0, sw, 0, [[0, shade(P.jacket, -0.2)], [0.55, P.jacket], [1, shade(P.jacket, 0.18)]]);
    ctx.fill(); ctx.strokeStyle = P.jacketD; ctx.lineWidth = 3; ctx.stroke();
    // inner top (tee / blouse)
    ctx.beginPath();
    if (P.male) {
      ctx.moveTo(-22, sy - 8); ctx.lineTo(22, sy - 8); ctx.lineTo(30, -330); ctx.lineTo(-30, -330); ctx.closePath();
    } else {
      ctx.moveTo(-34, sy - 8); ctx.quadraticCurveTo(0, sy + 70, 34, sy - 8); ctx.lineTo(28, -330); ctx.lineTo(-28, -330); ctx.closePath();
    }
    ctx.fillStyle = P.tee; ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.14)"; ctx.lineWidth = 2; ctx.stroke();
    // jacket front panels shade
    ctx.strokeStyle = P.jacketD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(P.male ? -24 : -32, sy - 6); ctx.lineTo(P.male ? -34 : -30, -318); ctx.moveTo(P.male ? 24 : 32, sy - 6); ctx.lineTo(P.male ? 34 : 30, -318); ctx.stroke();
    if (!P.male) { // scarf
      ctx.fillStyle = C.lemon; ctx.beginPath(); ctx.moveTo(-46, sy - 8); ctx.quadraticCurveTo(0, sy + 32, 46, sy - 8); ctx.lineTo(40, sy - 22); ctx.quadraticCurveTo(0, sy - 2, -40, sy - 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.lemonDark; ctx.lineWidth = 2; ctx.stroke();
    } else { // collar
      ctx.fillStyle = shade(P.jacket, 0.08);
      [-1, 1].forEach((sd) => { ctx.beginPath(); ctx.moveTo(sd * 20, sy - 10); ctx.lineTo(sd * 64, sy + 4); ctx.lineTo(sd * 36, sy + 74); ctx.lineTo(sd * 14, sy + 14); ctx.closePath(); ctx.fill(); ctx.strokeStyle = P.jacketD; ctx.lineWidth = 2.5; ctx.stroke(); });
    }
    // belt / waist band
    ctx.fillStyle = P.male ? "#1B2340" : shade(P.pants, -0.25); ctx.fillRect(-hip, -322, hip * 2, 14);
    // window rim light on the right side
    ctx.fillStyle = lin(ctx, sw * 0.4, 0, sw + 6, 0, [[0, "rgba(255,230,160,0)"], [1, "rgba(255,230,160,.35)"]]);
    ctx.fillRect(sw * 0.4, sy, sw * 0.7, 230);
    ctx.restore();
  }

  function drawHead(ctx, P, T, f) {
    // f: {talk 0..1, brow -1..1, look (-1..1 horizontal gaze), smile 0..1, nod rad}
    const s = P.s, fx = P.facing;
    const bob = Math.sin(T * 1.7 + P.x) * 1.4;
    ctx.save();
    ctx.translate(P.x + fx * 4, P.feetY + (-640) * s + bob);
    ctx.rotate((f.nod || 0) + Math.sin(T * 0.9 + P.x) * 0.012);
    ctx.scale(s, s);
    // back hair (Alex)
    if (!P.male) {
      ctx.fillStyle = lin(ctx, 0, -90, 0, 160, [[0, P.hair], [1, shade(P.hair, -0.3)]]);
      ctx.beginPath(); ctx.moveTo(-72, -20);
      ctx.bezierCurveTo(-92, -100, 88, -112, 74, -20); ctx.bezierCurveTo(98, 50, 84, 120, 56, 156);
      ctx.quadraticCurveTo(30, 134, 0, 150); ctx.quadraticCurveTo(-34, 138, -60, 160); ctx.bezierCurveTo(-96, 110, -92, 40, -72, -20); ctx.closePath(); ctx.fill();
    }
    // neck
    ctx.fillStyle = lin(ctx, 0, 40, 0, 80, [[0, P.skin], [1, P.skinD]]);
    rr(ctx, -22, 40, 44, 56, 14); ctx.fill();
    // ears
    const earX = -fx * 60;
    ctx.fillStyle = P.skin; ctx.strokeStyle = P.skinD; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(earX, 4, 11, 17, 0, 0, 6.3); ctx.fill(); ctx.stroke();
    if (!P.male) { ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(earX, 24, 6.5, 0, 6.3); ctx.fill(); ctx.strokeStyle = C.coralDark; ctx.stroke(); }
    // face
    const jaw = P.male ? 66 : 60;
    ctx.beginPath();
    ctx.moveTo(-62, -14);
    ctx.bezierCurveTo(-62, -84, 62, -84, 62, -14);
    ctx.bezierCurveTo(62, 28, jaw * 0.6, 62, fx * 6, 66);
    ctx.bezierCurveTo(-jaw * 0.6, 62, -62, 28, -62, -14);
    ctx.closePath();
    ctx.fillStyle = rad(ctx, fx * 18, -20, 6, 96, [[0, P.skinL], [0.6, P.skin], [1, P.skinD]]);
    ctx.fill(); ctx.strokeStyle = P.skinD; ctx.lineWidth = 2.5; ctx.stroke();
    // beard stubble (Sam)
    if (P.male) {
      ctx.save(); ctx.clip();
      ctx.fillStyle = "rgba(42,27,20,.28)";
      ctx.beginPath(); ctx.moveTo(-64, 6); ctx.bezierCurveTo(-60, 40, -30, 70, fx * 6, 70); ctx.bezierCurveTo(30, 70, 62, 40, 64, 6);
      ctx.bezierCurveTo(46, 30, 34, 36, 22, 30); ctx.quadraticCurveTo(0, 22, -22, 30); ctx.bezierCurveTo(-34, 36, -46, 30, -64, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    const sh = fx * 12; // 3/4 turn: features slide toward the partner
    // cheeks
    ctx.fillStyle = P.male ? "rgba(255,140,110,.16)" : "rgba(255,110,100,.28)";
    [-30, 30].forEach((x) => { ctx.beginPath(); ctx.ellipse(x + sh, 22, 13, 8, 0, 0, 6.3); ctx.fill(); });
    // eyes
    const blink = (T % 3.7) < 0.12 ? 0.1 : 1;
    [-1, 1].forEach((sd) => {
      const near = sd === fx;
      const ex = sd * 25 + sh + (near ? 4 : -2), ey = -18;
      const rx = near ? 12.5 : 10, ry = 10.5 * blink;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(ex, ey, rx, Math.max(1.2, ry), 0, 0, 6.3); ctx.fill();
      ctx.strokeStyle = "rgba(60,30,20,.45)"; ctx.lineWidth = 2; ctx.stroke();
      if (blink > 0.5) {
        const ix = ex + clamp(f.look, -1, 1) * 4.5, iy = ey + 0.5;
        ctx.fillStyle = P.male ? "#3A2216" : "#4A2C1A"; ctx.beginPath(); ctx.arc(ix, iy, 6.6, 0, 6.3); ctx.fill();
        ctx.fillStyle = "#0B0806"; ctx.beginPath(); ctx.arc(ix, iy, 3.3, 0, 6.3); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ix + 2.4, iy - 2.6, 1.9, 0, 6.3); ctx.fill();
      }
      // upper lid / lashes
      ctx.strokeStyle = P.male ? "#2A1B14" : "#2A1410"; ctx.lineWidth = P.male ? 3 : 3.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.ellipse(ex, ey, rx + 0.5, Math.max(1.2, ry), 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      if (!P.male) { ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(ex + sd * rx, ey - 1); ctx.lineTo(ex + sd * (rx + 7), ey - 7); ctx.stroke(); }
      // brow
      const by = -42 - f.brow * 7 - (near ? 0 : f.brow * 1.5);
      ctx.strokeStyle = P.male ? "#241610" : "#3B1D12"; ctx.lineWidth = P.male ? 7.5 : 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(ex - sd * 14 - 4, by + 4 + (sd === fx ? 0 : -1)); ctx.quadraticCurveTo(ex, by - 5 - f.brow * 2, ex + sd * 14 + 2, by + (sd === fx ? 4 : 6) - f.brow * 4); ctx.stroke();
    });
    // nose
    ctx.strokeStyle = P.skinD; ctx.lineWidth = 3.4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(sh + fx * 2, -14); ctx.quadraticCurveTo(sh + fx * 12, 12, sh + fx * 4, 16); ctx.stroke();
    ctx.fillStyle = "rgba(120,50,30,.18)"; ctx.beginPath(); ctx.ellipse(sh + fx * 7, 17, 8, 4.5, 0, 0, 6.3); ctx.fill();
    // mustache (Sam)
    if (P.male) {
      ctx.fillStyle = "rgba(36,22,16,.78)";
      ctx.beginPath(); ctx.moveTo(sh - 24, 32); ctx.quadraticCurveTo(sh, 24, sh + 24, 32); ctx.quadraticCurveTo(sh + 12, 38, sh, 35); ctx.quadraticCurveTo(sh - 12, 38, sh - 24, 32); ctx.closePath(); ctx.fill();
    }
    // mouth
    const my = 44, mw = 24 + f.smile * 5, open = clamp(f.talk, 0, 1);
    const mxx = sh + fx * 2;
    if (open > 0.08) {
      ctx.beginPath(); ctx.moveTo(mxx - mw, my - 2);
      ctx.quadraticCurveTo(mxx, my - 5 + open * 0, mxx + mw, my - 2);
      ctx.quadraticCurveTo(mxx + mw * 0.7, my + 6 + open * 18, mxx, my + 7 + open * 19);
      ctx.quadraticCurveTo(mxx - mw * 0.7, my + 6 + open * 18, mxx - mw, my - 2); ctx.closePath();
      ctx.fillStyle = "#5A1B1B"; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = "#fff"; ctx.fillRect(mxx - mw, my - 4, mw * 2, 6 + open * 3);
      ctx.fillStyle = "#E0707A"; ctx.beginPath(); ctx.ellipse(mxx, my + 14 + open * 10, mw * 0.55, 7 + open * 3, 0, 0, 6.3); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = P.male ? "#7A3C2B" : C.coralDark; ctx.lineWidth = 3; ctx.stroke();
    } else {
      ctx.strokeStyle = P.male ? "#7A3C2B" : C.coralDark; ctx.lineWidth = P.male ? 4 : 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(mxx - mw, my - 1 - f.smile * 1); ctx.quadraticCurveTo(mxx, my + 8 + f.smile * 10, mxx + mw, my - 1 - f.smile * 1); ctx.stroke();
      if (f.smile > 0.35) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(mxx - mw * 0.7, my + 1); ctx.quadraticCurveTo(mxx, my + 11 + f.smile * 9, mxx + mw * 0.7, my + 1); ctx.quadraticCurveTo(mxx, my + 5, mxx - mw * 0.7, my + 1); ctx.fill(); }
    }
    // hair
    if (P.male) {
      ctx.fillStyle = lin(ctx, 0, -110, 0, -20, [[0, shade(P.hair, 0.15)], [1, P.hair]]);
      ctx.beginPath(); ctx.moveTo(-66, -12);
      ctx.bezierCurveTo(-76, -92, -30, -118, 8, -112); ctx.bezierCurveTo(52, -112, 82, -80, 66, -12);
      ctx.bezierCurveTo(62, -40, 46, -64, 20, -68); ctx.bezierCurveTo(-4, -50, -30, -66, -50, -52); ctx.bezierCurveTo(-60, -44, -62, -30, -66, -12); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,230,190,.25)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-30, -100); ctx.quadraticCurveTo(0, -112, 36, -98); ctx.stroke();
    } else {
      ctx.fillStyle = lin(ctx, 0, -110, 0, 0, [[0, shade(P.hair, 0.12)], [1, P.hair]]);
      ctx.beginPath(); ctx.moveTo(-70, 14);
      ctx.bezierCurveTo(-86, -96, 76, -118, 71, 12);
      ctx.bezierCurveTo(67, -26, 54, -46, 30, -57);
      ctx.bezierCurveTo(14, -68, -14, -68, -30, -55);
      ctx.bezierCurveTo(-52, -44, -61, -24, -70, 14); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,220,180,.3)"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-34, -92); ctx.quadraticCurveTo(10, -104, 46, -80); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- the book ---------- */
  const BW = 220, BH = 290, BK = 0.885; // design size; drawn at BK scale (≈195 × 257 px)
  function drawBook(ctx, cx, cy, rot, T, flutter) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(BK, BK);
    // soft shadow
    ctx.fillStyle = "rgba(20,25,60,.22)"; rr(ctx, -BW / 2 + 12, -BH / 2 + 16, BW + 26, BH + 10, 14); ctx.fill();
    // page block (right + bottom edges)
    const t = 24;
    ctx.fillStyle = "#EFE3C4"; rr(ctx, -BW / 2 + 8, -BH / 2 + 8, BW + t - 6, BH + t - 12, 10); ctx.fill();
    ctx.strokeStyle = "rgba(120,100,60,.35)"; ctx.lineWidth = 1.6;
    for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(BW / 2 + 2 + i * (t / 6), -BH / 2 + 14 + i * 2); ctx.lineTo(BW / 2 + 2 + i * (t / 6), BH / 2 + 4 + i * 2); ctx.stroke(); }
    // fluttering pages
    if (flutter > 0.01) {
      for (let i = 0; i < 4; i++) {
        const ph = T * 22 + i * 1.7, lift = (Math.sin(ph) * 0.5 + 0.5) * 20 * flutter;
        ctx.strokeStyle = "rgba(255,250,235,.95)"; ctx.lineWidth = 3.4; ctx.beginPath();
        const y0 = -BH / 2 + 40 + i * 52;
        ctx.moveTo(BW / 2 - 4, y0); ctx.quadraticCurveTo(BW / 2 + 18 + lift, y0 - 8 - lift * 0.4, BW / 2 + 12 + lift * 1.3, y0 + 26); ctx.stroke();
      }
    }
    // cover
    rr(ctx, -BW / 2, -BH / 2, BW, BH, 12);
    ctx.fillStyle = lin(ctx, -BW / 2, -BH / 2, BW / 2, BH / 2, [[0, C.cobaltLight], [0.35, C.cobalt], [1, C.cobaltDark]]);
    ctx.fill(); ctx.strokeStyle = "#0E2468"; ctx.lineWidth = 3; ctx.stroke();
    // spine
    ctx.fillStyle = "rgba(10,25,90,.42)"; rr(ctx, -BW / 2, -BH / 2, 26, BH, 12); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-BW / 2 + 28, -BH / 2 + 8); ctx.lineTo(-BW / 2 + 28, BH / 2 - 8); ctx.stroke();
    // cover art: coral ribbon + lemon emblem + text lines
    ctx.fillStyle = C.coral; ctx.fillRect(-BW / 2 + 26, -BH / 2 + 190, BW - 26, 30);
    ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(-BW / 2 + 26, -BH / 2 + 190, BW - 26, 8);
    const ex = 12, ey = -BH / 2 + 100;
    ctx.fillStyle = rad(ctx, ex - 10, ey - 12, 4, 56, [[0, "#FFF0A0"], [1, C.lemon]]); ctx.beginPath(); ctx.arc(ex, ey, 52, 0, 6.3); ctx.fill();
    ctx.strokeStyle = C.lemonDark; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = "rgba(31,79,216,.8)"; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.ellipse(ex, ey, 52, 18, 0, 0, 6.3); ctx.moveTo(ex, ey - 52); ctx.lineTo(ex, ey + 52); ctx.moveTo(ex - 52, ey); ctx.lineTo(ex + 52, ey); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(ex, ey, 24, 52, 0, 0, 6.3); ctx.stroke();
    ctx.fillStyle = "rgba(255,246,227,.85)"; rr(ctx, -BW / 2 + 44, -BH / 2 + 236, 110, 9, 4); ctx.fill(); rr(ctx, -BW / 2 + 44, -BH / 2 + 254, 70, 9, 4); ctx.fill();
    // gloss
    ctx.fillStyle = lin(ctx, -BW / 2, -BH / 2, BW / 2, 0, [[0, "rgba(255,255,255,.28)"], [0.5, "rgba(255,255,255,0)"]]);
    rr(ctx, -BW / 2, -BH / 2, BW, BH, 12); ctx.fill();
    ctx.restore();
  }

  /* Book path as a function of handover progress p (0 = with Alex, 1 = with Sam). */
  const GEO = {
    S: { x: 600, y: 935 }, M: { x: 478, y: 930 }, E: { x: 375, y: 920 },
  };
  function bookAt(p) {
    const { S, M, E } = GEO;
    if (p < 0.45) { const s = easeIO(p / 0.45); return { x: lerp(S.x, M.x, s), y: lerp(S.y, M.y, s) - 38 * Math.sin(Math.PI * s), rot: lerp(0.02, -0.05, s), s }; }
    if (p < 0.58) { const k = (p - 0.45) / 0.13; return { x: M.x, y: M.y + 2 * Math.sin(k * Math.PI), rot: -0.05, s: 0 }; }
    const s = easeIO((p - 0.58) / 0.42);
    return { x: lerp(M.x, E.x, s), y: lerp(M.y, E.y, s) - 22 * Math.sin(Math.PI * s), rot: lerp(-0.05, 0.03, s), s };
  }
  FE.bookAt = bookAt;

  /* ---------- scene variables per beat ---------- */
  function sceneVars(id, u, dur) {
    const V = { p: 0, arrow: "none", focus: null, bubble: null, chips: "idle", talkSam: 0, header: "idle", card: null, rewind: 0, tag: null, flutter: 0 };
    switch (id) {
      case "hook": V.arrow = "hint"; V.chips = "hook"; break;
      case "borrowAsk": V.bubble = "borrowQ"; V.chips = "borrow"; V.arrow = "hint"; V.talkSam = 1; V.header = "borrow"; break;
      case "borrowHand": V.p = clamp(u / 1.35); V.arrow = "follow"; V.focus = "sam"; V.bubble = "borrowQ"; V.header = "borrow"; V.chips = "borrow"; V.flutter = V.p < 0.9 ? 1 : 0; break;
      case "borrowNarr": V.p = 1; V.arrow = "follow"; V.focus = "sam"; V.bubble = "borrowQ"; V.header = "borrow"; V.chips = "borrow"; break;
      case "rewind": V.p = 1 - easeIO(clamp(u / 0.68)); V.arrow = "none"; V.rewind = Math.sin(Math.PI * clamp(u / dur)) ; V.header = "idle"; V.chips = "idle"; V.flutter = 1; break;
      case "lendAsk": V.bubble = "lendQ"; V.chips = "lend"; V.arrow = "hint"; V.talkSam = 1; V.header = "lend"; break;
      case "lendHand": V.p = clamp(u / 1.35); V.arrow = "follow"; V.focus = "alex"; V.bubble = "lendQ"; V.header = "lend"; V.chips = "lend"; V.flutter = V.p < 0.9 ? 1 : 0; break;
      case "lendNarr": V.p = 1; V.arrow = "follow"; V.focus = "alex"; V.bubble = "lendQ"; V.header = "lend"; V.chips = "lend"; V.tag = "same"; break;
      case "speakPrompt": V.p = 1; V.card = "blank"; V.header = "none"; V.chips = "none"; break;
      case "pause": V.p = 1; V.card = "blank"; V.header = "none"; V.chips = "none"; break;
      case "reveal": V.p = 1; V.card = "full"; V.header = "none"; V.chips = "none"; break;
      case "cta": V.p = 1; V.card = null; V.header = "none"; V.chips = "none"; break;
    }
    return V;
  }

  /* ---------- static background (cached) ---------- */
  let bgCache = null;
  function buildBg() {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
    // wall
    g.fillStyle = lin(g, 0, 0, 0, H, [[0, "#FFF8E8"], [0.55, "#FFF0D2"], [1, "#F8DDB0"]]); g.fillRect(0, 0, W, H);
    // big soft geometric shapes (mid-century arches)
    g.fillStyle = "rgba(255,216,74,.38)"; g.beginPath(); g.arc(150, 520, 210, 0, 6.3); g.fill();
    g.fillStyle = "rgba(255,107,87,.20)"; g.beginPath(); g.arc(940, 430, 260, Math.PI, 0); g.lineTo(1200, 900); g.lineTo(680, 900); g.closePath(); g.fill();
    g.fillStyle = "rgba(111,147,255,.13)"; g.beginPath(); g.arc(540, 1000, 560, Math.PI, 0); g.fill();
    // window (arched) top-right
    g.save();
    g.beginPath(); g.moveTo(690, 760); g.lineTo(690, 470); g.arc(820, 470, 130, Math.PI, 0); g.lineTo(950, 760); g.closePath();
    g.fillStyle = lin(g, 0, 330, 0, 760, [[0, "#BFD5FF"], [1, "#FFF3C9"]]); g.fill();
    g.strokeStyle = C.cobalt; g.lineWidth = 12; g.stroke();
    g.clip(); g.strokeStyle = "rgba(31,79,216,.85)"; g.lineWidth = 8; g.beginPath(); g.moveTo(820, 340); g.lineTo(820, 760); g.moveTo(690, 560); g.lineTo(950, 560); g.stroke();
    g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(760, 460, 52, 18, 0, 0, 6.3); g.ellipse(790, 450, 36, 20, 0, 0, 6.3); g.fill();
    g.restore();
    // bookshelf (left)
    g.fillStyle = C.cobaltDark; rr(g, -20, 640, 290, 560, 14); g.fill();
    g.fillStyle = "#1A3FA8"; rr(g, -10, 650, 268, 540, 10); g.fill();
    const cols = [C.coral, C.lemon, C.ivory, "#7FA6FF", "#FF9A8A", "#F6C23E", C.cobaltLight];
    for (let r = 0; r < 3; r++) {
      const y = 650 + r * 180; g.fillStyle = "#0F2A7A"; g.fillRect(-10, y + 168, 268, 14);
      let x = 4; let i = r * 3;
      while (x < 244) { const w = 18 + ((i * 7) % 5) * 5, h = 100 + ((i * 11) % 6) * 11; g.fillStyle = cols[i % cols.length]; rr(g, x, y + 168 - h, w, h, 3); g.fill(); g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x + w - 4, y + 168 - h, 4, h); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x + 3, y + 168 - h + 12, w - 10, 3); x += w + 3; i++; }
    }
    // framed world print above shelf
    g.fillStyle = C.ivory; rr(g, 40, 330, 190, 150, 10); g.fill(); g.strokeStyle = C.coral; g.lineWidth = 8; g.stroke();
    g.fillStyle = "rgba(31,79,216,.8)"; g.beginPath(); g.arc(135, 405, 48, 0, 6.3); g.fill();
    g.fillStyle = C.lemon; g.beginPath(); g.arc(120, 395, 18, 0, 6.3); g.arc(152, 420, 14, 0, 6.3); g.fill();
    // floor
    g.fillStyle = lin(g, 0, 1290, 0, H, [[0, "#E7B77A"], [1, "#B97A4D"]]); g.fillRect(0, 1290, W, H - 1290);
    g.strokeStyle = "rgba(90,50,20,.18)"; g.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const y = 1310 + i * 76; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    for (let i = 0; i < 14; i++) { const y = 1310 + Math.floor(i / 2) * 76; g.beginPath(); g.moveTo((i * 211) % W, y); g.lineTo((i * 211) % W, y + 76); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(0, 1290, W, 10);
    g.fillStyle = "#8D5A36"; g.fillRect(0, 1284, W, 12); // skirting
    // rug
    g.save(); g.translate(480, 1400);
    g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.ellipse(0, 14, 560, 112, 0, 0, 6.3); g.fill();
    g.fillStyle = C.coral; g.beginPath(); g.ellipse(0, 0, 548, 104, 0, 0, 6.3); g.fill();
    g.strokeStyle = C.ivory; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 0, 508, 88, 0, 0, 6.3); g.stroke();
    g.strokeStyle = C.lemon; g.lineWidth = 5; g.setLineDash([22, 16]); g.beginPath(); g.ellipse(0, 0, 468, 72, 0, 0, 6.3); g.stroke();
    g.restore();
    // side table (right) with plant on the wall side
    // plant on the floor behind the table
    g.fillStyle = "#2E8B6A"; [-34, -12, 12, 30].forEach((dx, i) => { g.beginPath(); g.ellipse(1040 + dx, 1090 + (i % 2) * 24, 20, 84, (dx / 80) * 0.9, 0, 6.3); g.fill(); });
    g.fillStyle = "#47B58A"; [-22, 2, 22].forEach((dx) => { g.beginPath(); g.ellipse(1044 + dx, 1080, 15, 74, (dx / 70) * 0.8, 0, 6.3); g.fill(); });
    g.fillStyle = C.coral; rr(g, 995, 1196, 92, 100, 14); g.fill(); g.fillStyle = C.coralDark; g.fillRect(995, 1196, 92, 14);
    // side table
    g.fillStyle = "#6D4630"; g.fillRect(868, 1196, 12, 150); g.fillRect(968, 1196, 12, 150);
    g.fillStyle = "#C28A57"; rr(g, 836, 1176, 176, 26, 12); g.fill(); g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(846, 1180, 156, 6);
    g.fillStyle = "rgba(0,0,0,.2)"; g.beginPath(); g.ellipse(924, 1352, 100, 14, 0, 0, 6.3); g.fill();
    // vignette
    g.fillStyle = rad(g, W / 2, H * 0.48, 500, 1250, [[0, "rgba(120,60,20,0)"], [1, "rgba(120,60,20,.16)"]]); g.fillRect(0, 0, W, H);
    return cv;
  }
  // The plant was drawn on the wall; keep the table top clear for the pen (table top y≈1176).

  /* ---------- pen ---------- */
  function drawPen(ctx, x, y, rot, scale, glow, T) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
    if (glow > 0) { ctx.fillStyle = rad(ctx, 0, 0, 10, 150, [[0, `rgba(255,216,74,${0.5 * glow})`], [1, "rgba(255,216,74,0)"]]); ctx.beginPath(); ctx.arc(0, 0, 150, 0, 6.3); ctx.fill(); }
    ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(6, 16, 108, 7, 0, 0, 6.3); ctx.fill();
    // body
    ctx.beginPath(); ctx.moveTo(-100, -9); ctx.lineTo(60, -9); ctx.lineTo(60, 9); ctx.lineTo(-100, 9); ctx.closePath();
    ctx.fillStyle = lin(ctx, 0, -9, 0, 9, [[0, "#6F93FF"], [0.5, C.cobalt], [1, C.cobaltDark]]); ctx.fill();
    ctx.fillStyle = C.coral; ctx.fillRect(-100, -9, 22, 18); ctx.fillStyle = C.lemon; ctx.fillRect(-78, -9, 6, 18);
    // clip
    ctx.fillStyle = "#E6EAF5"; rr(ctx, -70, -14, 80, 6, 3); ctx.fill();
    // grip + tip
    ctx.fillStyle = "#1B2340"; ctx.beginPath(); ctx.moveTo(60, -9); ctx.lineTo(92, -4); ctx.lineTo(92, 4); ctx.lineTo(60, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#D9DEEA"; ctx.beginPath(); ctx.moveTo(92, -4); ctx.lineTo(112, 0); ctx.lineTo(92, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.fillRect(-96, -6, 150, 3);
    ctx.restore();
  }

  /* ---------- text helpers ---------- */
  function setFont(ctx, size, weight, fam) { ctx.font = `${weight || 900} ${size}px ${fam || FONT}`; }
  function fitFont(ctx, text, max, size, min, weight, fam) { let s = size; setFont(ctx, s, weight, fam); while (ctx.measureText(text).width > max && s > min) { s -= 2; setFont(ctx, s, weight, fam); } return s; }
  function wrapLines(ctx, text, max) {
    const words = text.split(" "), lines = []; let cur = "";
    words.forEach((w) => { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }
  function pill(ctx, cx, cy, text, size, bg, fg, opts) {
    opts = opts || {};
    setFont(ctx, size, 900); const w = ctx.measureText(text).width + size * 1.1, h = size * 1.5;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(opts.scale || 1, opts.scale || 1); ctx.globalAlpha *= opts.alpha == null ? 1 : opts.alpha;
    if (opts.glow) { ctx.shadowColor = bg; ctx.shadowBlur = 36; }
    ctx.fillStyle = bg; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = lin(ctx, 0, -h / 2, 0, h / 2, [[0, "rgba(255,255,255,.28)"], [0.5, "rgba(255,255,255,0)"]]); rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, size * 0.04);
    ctx.restore(); return w;
  }

  /* English phrase with key word highlighted + IPA beneath (cc==2). Returns bottom y. */
  function phraseBlock(ctx, cx, topY, words, ipa, cc, accent, boxW, size) {
    // words: [{t, hi}]
    const full = words.map((w) => w.t).join(" ");
    const fs = fitFont(ctx, full, boxW, size, 44, 900);
    setFont(ctx, fs, 900);
    const spaceW = ctx.measureText(" ").width;
    const widths = words.map((w) => ctx.measureText(w.t).width);
    const total = widths.reduce((a, b) => a + b, 0) + spaceW * (words.length - 1);
    let x = cx - total / 2; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    const by = topY + fs * 0.95;
    words.forEach((w, i) => {
      if (w.hi) { ctx.fillStyle = alpha(accent, 0.2); rr(ctx, x - 8, by - fs * 0.86, widths[i] + 16, fs * 1.14, 14); ctx.fill(); }
      ctx.fillStyle = w.hi ? accent : C.ink; ctx.fillText(w.t, x, by); x += widths[i] + spaceW;
    });
    let bottom = by + fs * 0.25;
    if (cc === 2 && ipa) {
      const txt = Array.isArray(ipa) ? ipa : [ipa];
      ctx.textAlign = "center";
      const parts = txt.map((s) => (s === "___" ? s : "/" + s + "/"));
      // draw: /…/ then blank then /…/
      const isz = fitFont(ctx, parts.join("   "), boxW, 42, 28, 700, IPAFONT);
      ctx.fillStyle = "#3D4C78"; ctx.fillText(parts.join("   "), cx, by + isz * 1.25);
      bottom = by + isz * 1.25 + isz * 0.35;
    }
    return bottom;
  }

  /* ---------- main draw ---------- */
  FE.draw = function (ctx, S) {
    const { sch, bi, u, T, cc } = S;
    const beat = sch.beats[bi], id = beat.id;
    const V = sceneVars(id, u, beat.dur);
    const accentB = C.coral, accentL = C.cobalt;
    if (!bgCache) bgCache = buildBg();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bgCache, 0, 0);

    // light shafts + dust motes
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const sway = Math.sin(T * 0.4) * 14;
    ctx.fillStyle = lin(ctx, 800, 500, 300, 1300, [[0, "rgba(255,236,170,.30)"], [1, "rgba(255,236,170,0)"]]);
    ctx.beginPath(); ctx.moveTo(700 + sway, 560); ctx.lineTo(950 + sway, 560); ctx.lineTo(560, 1380); ctx.lineTo(160, 1380); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 26; i++) {
      const px = (i * 173 + Math.sin(T * 0.3 + i) * 30 + T * (6 + (i % 5) * 2)) % W, py = 330 + ((i * 97 + T * (4 + (i % 4) * 3)) % 1000);
      ctx.fillStyle = `rgba(255,248,210,${0.25 + 0.2 * Math.sin(T * 1.7 + i)})`; ctx.beginPath(); ctx.arc(px, py, 2 + (i % 3), 0, 6.3); ctx.fill();
    }
    ctx.restore();

    // focus spotlight + ring on the floor
    const book = bookAt(V.p);
    const focusAmt = V.focus ? easeOut(clamp(u / 0.4)) : 0;
    if (V.focus) {
      const P = V.focus === "sam" ? SAM : ALEX, col = V.focus === "sam" ? accentB : accentL;
      ctx.save(); ctx.globalAlpha = focusAmt;
      ctx.fillStyle = lin(ctx, 0, 560, 0, P.feetY, [[0, alpha(col, 0)], [1, alpha(col, 0.16)]]);
      ctx.beginPath(); ctx.moveTo(P.x - 70, 560); ctx.lineTo(P.x + 70, 560); ctx.lineTo(P.x + 230, P.feetY + 10); ctx.lineTo(P.x - 230, P.feetY + 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.shadowColor = col; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.ellipse(P.x, P.feetY + 6, 200 + 8 * Math.sin(T * 4), 40, 0, 0, 6.3); ctx.stroke();
      ctx.restore();
    }

    // ---- poses ----
    const p = V.p;
    const shSamN = shoulderOf(SAM, "near"), shAlexN = shoulderOf(ALEX, "near");
    const restSamN = { x: shSamN.x + 10, y: shSamN.y + 276 * SAM.s };
    const restAlexN = { x: shAlexN.x - 8, y: shAlexN.y + 276 * ALEX.s };
    const bookM = bookAt(0.5);
    // wrist targets: each hand cradles the underside of the book on its own side (Alex right, Sam left)
    const HX = 108, HY = 148;
    const attachA = (b) => ({ x: b.x + HX, y: b.y + HY }), attachS = (b) => ({ x: b.x - HX, y: b.y + HY });
    let alexW, alexG, samW, samG;
    if (p <= 0.52) { alexW = attachA(book); alexG = 1; }
    else { const k = easeIO(clamp((p - 0.52) / 0.38)), b0 = bookAt(0.52), a0 = attachA(b0); alexW = { x: lerp(a0.x, restAlexN.x, k), y: lerp(a0.y, restAlexN.y, k) }; alexG = 1 - clamp((p - 0.52) / 0.22); }
    if (p < 0.45) { const k = easeIO(p / 0.45), t0 = attachS(bookM); samW = { x: lerp(restSamN.x, t0.x, k), y: lerp(restSamN.y, t0.y, k) }; samG = clamp(k * 1.25 - 0.1); }
    else { samW = attachS(book); samG = 1; }

    // far arms hang relaxed, except Alex who points to the pen on the table
    const farSamSh = shoulderOf(SAM, "far"), farAlexSh = shoulderOf(ALEX, "far");
    let samFarW = { x: farSamSh.x - 8, y: farSamSh.y + 276 * SAM.s }, samFarPose = POSES.rest;
    let alexFarW = { x: farAlexSh.x + 8, y: farAlexSh.y + 274 * ALEX.s }, alexFarPose = POSES.rest;
    if (id === "speakPrompt" || id === "pause" || id === "reveal") {
      const k = easeOut(seg(id === "speakPrompt" ? u : 9, 0.5, 1.5));
      alexFarW = { x: lerp(alexFarW.x, farAlexSh.x + 66, k), y: lerp(alexFarW.y, farAlexSh.y + 190, k) };
      alexFarPose = lerpPose(POSES.rest, POSES.open, k);
    }
    // faces
    const talkAmp = () => clamp(0.35 + 0.65 * Math.abs(Math.sin(T * 11.3) * Math.sin(T * 5.1 + 1)), 0, 1);
    const spokeNow = S.speaking != null ? S.speaking : (u >= beat.sp && u < beat.sp + beat.speechDur);
    const samTalk = V.talkSam && spokeNow ? talkAmp() : 0;
    const eager = id === "hook" || V.talkSam;
    const samFace = { talk: samTalk, brow: eager ? 0.8 : (V.focus === "sam" ? 0.9 : 0.1), look: 1, smile: V.focus === "sam" || eager ? 1 : 0.7, nod: V.focus === "sam" ? 0.03 * Math.sin(T * 3) : 0 };
    const alexFace = { talk: 0, brow: V.focus === "alex" ? 0.7 : 0.2, look: -1, smile: id === "reveal" || V.focus === "alex" || id === "cta" ? 1 : 0.65,
      nod: V.focus === "alex" ? 0.03 * Math.sin(T * 3) : (id === "borrowAsk" || id === "lendAsk") ? 0.05 * Math.sin(seg(u, 0.8, 1.6) * Math.PI) : 0 };

    // ---- bodies ----
    drawLegsAndBody(ctx, SAM, T); drawLegsAndBody(ctx, ALEX, T);
    const sFar = drawArm(ctx, SAM, "far", samFarW, 1);
    const aFar = drawArm(ctx, ALEX, "far", alexFarW, -1);
    const aNear = drawArm(ctx, ALEX, "near", alexW, 1);
    const sNear = drawArm(ctx, SAM, "near", samW, -1);
    drawHead(ctx, SAM, T, samFace); drawHead(ctx, ALEX, T, alexFace);
    drawHand(ctx, sFar.wx, sFar.wy, mirrorPose(samFarPose), SAM.skin, SAM.skinD, SAM.s * HAND_SCALE);
    drawHand(ctx, aFar.wx, aFar.wy, alexFarPose, ALEX.skin, ALEX.skinD, ALEX.s * HAND_SCALE);

    // arrow (follows the real object)
    if (V.arrow !== "none") drawArrow(ctx, V, p, T, id, u, beat);

    // book
    const bookVisible = !(id === "cta");
    if (bookVisible) drawBook(ctx, book.x, book.y, book.rot, T, V.flutter);

    // hands holding the book (in front of it)
    drawNearHand(ctx, aNear, lerpPose(POSES.rest, POSES.cradle, alexG), ALEX);
    drawNearHand(ctx, sNear, lerpPose(POSES.rest, POSES.cradle, samG), SAM);

    // sparkles on grab
    if ((id === "borrowHand" || id === "lendHand") && u > 0.58 && u < 0.95) {
      const k = (u - 0.58) / 0.37;
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9 + 0.3, r = 30 + 90 * easeOut(k);
        ctx.fillStyle = `rgba(255,216,74,${1 - k})`; star(ctx, bookM.x + Math.cos(a) * r, bookM.y + 20 + Math.sin(a) * r * 0.8, 9 - 5 * k, 4);
      }
    }

    // ---- pen on the table ----
    const penK = id === "speakPrompt" ? easeBack(seg(u, 0.35, 1.0)) : (id === "pause" || id === "reveal" || id === "cta") ? 1 : 0;
    if (penK > 0 && id !== "cta") {
      const penGlow = id === "pause" ? 0.6 + 0.4 * Math.sin(T * 3) : 0.5;
      drawPen(ctx, 922, 1152 - 120 * (1 - penK), -0.1, 0.95 * penK, penGlow, T);
      // little arrow pointing from the pen toward Sam in the reveal
    }

    // ---- headers, badges, bubbles ----
    drawHeader(ctx, V, u, T, id);
    drawBadges(ctx, V, T);
    if (V.bubble) drawBubble(ctx, V, id, u, cc, beat);
    if (V.card) drawCard(ctx, V, id, u, T, cc, beat);
    if (V.tag === "same") drawSameTag(ctx, u);

    // rewind overlay
    if (V.rewind > 0.01 || id === "rewind") drawRewind(ctx, V, u, T, beat);

    // CTA
    if (id === "cta") drawCTA(ctx, u, T);

    // captions
    if (cc >= 1 && beat.caption && u >= beat.sp - 0.05) drawCaption(ctx, beat.caption, id);

    // global fade in/out
    if (bi === 0) { ctx.fillStyle = `rgba(255,246,227,${1 - clamp(u / 0.35)})`; ctx.fillRect(0, 0, W, H); }
  };

  const HAND_SCALE = 1.3;
  function drawNearHand(ctx, arm, pose, P) { drawHand(ctx, arm.wx, arm.wy, P.facing < 0 ? mirrorPose(pose) : pose, P.skin, P.skinD, P.s * HAND_SCALE); }

  function star(ctx, x, y, r, n) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i * Math.PI) / n - Math.PI / 2, rr2 = i % 2 ? r * 0.4 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); ctx.fill(); }

  /* ---------- arrow ---------- */
  /* The arrow head sits directly above the book (same x), so it always follows the real object.
     Its tail starts above Alex's hand; it only ever points from Alex toward Sam. */
  function drawArrow(ctx, V, p, T, id, u, beat) {
    const lend = id.startsWith("lend"), borrow = id.startsWith("borrow");
    const cHead = borrow ? C.coral : lend ? C.cobalt : C.coral, cTail = borrow ? "#FF9A8A" : lend ? C.cobaltLight : C.cobalt;
    let drawTo = V.arrow === "hint" ? (id === "hook" ? easeIO(seg(u, 0.5, 2.3)) : 1) : p;
    if (drawTo <= 0.03) return;
    const S0 = GEO.S.x + 18, E0 = GEO.E.x;
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const q = (drawTo * i) / 80, b = bookAt(q);
      const x = i === 0 ? S0 : b.x, f = clamp((S0 - x) / (S0 - E0));
      pts.push({ x, y: 742 - 44 * Math.sin(Math.PI * f) });
    }
    const tip = pts[pts.length - 1]; let prev = pts[Math.max(0, pts.length - 14)];
    if (Math.hypot(tip.x - prev.x, tip.y - prev.y) < 8) prev = { x: tip.x + 10, y: tip.y }; // arrow always points toward Sam (left)
    ctx.save();
    ctx.globalAlpha = V.arrow === "hint" && id !== "hook" ? 0.5 : 1;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const flow = V.arrow === "hint" && id !== "hook";
    // soft glow: one wide translucent stroke along the whole path
    ctx.save(); ctx.globalAlpha *= 0.22; ctx.strokeStyle = cHead; ctx.lineWidth = 46;
    ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke(); ctx.restore();
    if (flow) ctx.setLineDash([22, 20]);
    for (let i = 1; i < pts.length; i++) {
      const k = i / pts.length;
      ctx.strokeStyle = k < 0.5 ? mixHex(cTail, cHead, k * 2) : cHead; ctx.lineWidth = lerp(10, 26, k);
      ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (let i = 1; i < pts.length; i += 1) { const k = i / pts.length; ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.lineWidth = lerp(2, 8, k); ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y - 4); ctx.lineTo(pts[i].x, pts[i].y - 4); ctx.stroke(); }
    const ang = Math.atan2(tip.y - prev.y, tip.x - prev.x);
    ctx.translate(tip.x, tip.y); ctx.rotate(ang);
    ctx.shadowColor = cHead; ctx.shadowBlur = 26;
    ctx.fillStyle = cHead; ctx.beginPath(); ctx.moveTo(44, 0); ctx.lineTo(-10, -40); ctx.quadraticCurveTo(8, 0, -10, 40); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.moveTo(32, 0); ctx.lineTo(-2, -24); ctx.quadraticCurveTo(10, -4, 14, -2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function mixHex(a, b, t) {
    const pa = a.startsWith("#") ? [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)] : [255, 154, 138];
    const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
    return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], t))).join(",")})`;
  }

  /* ---------- header chips, badges ---------- */
  function drawHeader(ctx, V, u, T, id) {
    if (V.header === "none") return;
    const mode = V.header; const y = 236;
    const items = [{ t: "BORROW", x: 290, col: C.coral, key: "borrow" }, { t: "LEND", x: 790, col: C.cobalt, key: "lend" }];
    items.forEach((it) => {
      const active = mode === it.key, hook = id === "hook";
      const pulse = hook ? 1 + 0.03 * Math.sin(T * 4 + (it.key === "lend" ? 1.5 : 0)) : active ? 1.1 : 0.82;
      const inK = id === "hook" ? easeBack(seg(u, it.key === "borrow" ? 0.2 : 0.45, 0.85)) : 1;
      if (inK <= 0) return;
      pill(ctx, it.x, y, it.t, 70, it.col, "#FFFFFF", { scale: pulse * inK, alpha: hook || active ? 1 : 0.5, glow: active });
    });
    // "o" between the two words in the hook
    if (id === "hook") { ctx.save(); ctx.globalAlpha = easeOut(seg(u, 0.5, 0.9)); setFont(ctx, 44, 900); ctx.fillStyle = C.ink; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("o", 540, 240); ctx.restore(); }
  }

  function drawBadges(ctx, V, T) {
    if (!V.focus) return;
    const y = 1418;
    const samActive = V.focus === "sam";
    const lbl = (t, x, col, on) => pill(ctx, x, y, t, on ? 40 : 30, on ? col : "#FFF6E3", on ? "#FFFFFF" : alpha(C.ink, 0.55), { alpha: on ? 1 : 0.75, glow: on });
    lbl(samActive ? "RECIBE" : "recibe", SAM.x, C.coral, samActive);
    lbl(samActive ? "da" : "DA", ALEX.x, C.cobalt, !samActive);
  }

  /* ---------- speech bubble with English phrase ---------- */
  function drawBubble(ctx, V, id, u, cc, beat) {
    const lend = V.bubble === "lendQ";
    const accent = lend ? C.cobalt : C.coral;
    const words = lend ? [{ t: "Can" }, { t: "you" }, { t: "lend", hi: 1 }, { t: "me" }, { t: "your" }, { t: "book?" }] : [{ t: "Can" }, { t: "I" }, { t: "borrow", hi: 1 }, { t: "your" }, { t: "book?" }];
    const inK = id.endsWith("Ask") ? easeBack(seg(u, 0.0, 0.45)) : 1;
    const bx = 60, by = 352, bw = 960, bh = cc === 2 ? 208 : 156;
    ctx.save(); ctx.translate(540, by + bh / 2); ctx.scale(inK, inK); ctx.translate(-540, -(by + bh / 2));
    ctx.shadowColor = "rgba(20,33,61,.3)"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14;
    rr(ctx, bx, by, bw, bh, 52); ctx.fillStyle = "#FFFDF6"; ctx.fill();
    // tail toward Sam
    ctx.beginPath(); ctx.moveTo(190, by + bh - 4); ctx.lineTo(272, by + bh - 4); ctx.lineTo(236, by + bh + 62); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = accent; ctx.lineWidth = 8; rr(ctx, bx, by, bw, bh, 52); ctx.stroke();
    ctx.fillStyle = "#FFFDF6"; ctx.fillRect(196, by + bh - 8, 70, 12);
    ctx.strokeStyle = accent; ctx.beginPath(); ctx.moveTo(190, by + bh); ctx.lineTo(236, by + bh + 62); ctx.lineTo(272, by + bh); ctx.stroke();
    // name tag
    pill(ctx, 190, by - 6, "SAM", 30, C.ink, C.ivory);
    phraseBlock(ctx, 540, by + 34, words, FE.IPA[V.bubble], cc, accent, bw - 90, 68);
    ctx.restore();
  }

  /* ---------- practice card ---------- */
  function drawCard(ctx, V, id, u, T, cc, beat) {
    const reveal = V.card === "full";
    const inK = id === "speakPrompt" ? easeBack(seg(u, 0, 0.5)) : 1;
    const bx = 60, by = 320, bw = 960, bh = cc === 2 ? 290 : 232;
    ctx.save(); ctx.translate(540, by + bh / 2); ctx.scale(inK, inK); ctx.translate(-540, -(by + bh / 2));
    ctx.shadowColor = "rgba(20,33,61,.35)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    rr(ctx, bx, by, bw, bh, 56); ctx.fillStyle = "#FFFDF6"; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = reveal ? C.coral : C.cobalt; ctx.lineWidth = 8; rr(ctx, bx, by, bw, bh, 56); ctx.stroke();
    pill(ctx, 540, by - 4, reveal ? "ASÍ SE DICE" : "TU TURNO", 32, reveal ? C.coral : C.cobalt, "#fff");
    const fs = 76;
    setFont(ctx, fs, 900);
    const parts = ["Can I ", reveal ? "borrow" : "_____", " your pen?"];
    const w = parts.map((s) => ctx.measureText(s).width);
    const total = w[0] + w[1] + w[2];
    let x = 540 - total / 2; const baseY = by + 40 + fs * 0.95;
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = C.ink; ctx.fillText(parts[0], x, baseY); x += w[0];
    if (reveal) {
      const k = easeBack(seg(u, 0.0, 0.5));
      ctx.save(); ctx.translate(x + w[1] / 2, baseY - fs * 0.3); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
      ctx.fillStyle = alpha(C.coral, 0.2); rr(ctx, -w[1] / 2 - 10, -fs * 0.62, w[1] + 20, fs * 1.14, 16); ctx.fill();
      ctx.fillStyle = C.coral; ctx.textAlign = "center"; ctx.fillText("borrow", 0, fs * 0.3); ctx.restore(); ctx.textAlign = "left";
    } else {
      const blink = 0.55 + 0.45 * Math.sin(T * 5);
      ctx.fillStyle = alpha(C.cobalt, 0.35 + 0.4 * blink); rr(ctx, x + 6, baseY - fs * 0.62, w[1] - 12, fs * 0.9, 14); ctx.fill();
      ctx.fillStyle = C.cobalt; ctx.fillText(parts[1], x, baseY);
    }
    x += w[1]; ctx.fillStyle = C.ink; ctx.fillText(parts[2], x, baseY);
    if (cc === 2) {
      ctx.textAlign = "center";
      const ipa = reveal ? "/" + FE.IPA.penFull + "/" : "/" + FE.IPA.penBlank[0] + "/   ___   /" + FE.IPA.penBlank[1] + "/";
      const isz = fitFont(ctx, ipa, bw - 90, 44, 28, 700, IPAFONT);
      ctx.fillStyle = "#3D4C78"; ctx.fillText(ipa, 540, baseY + isz * 1.45);
    }
    ctx.restore();
    // progress ring (silent)
    if (id === "pause") drawRing(ctx, u / beat.dur, T);
    if (id === "speakPrompt") { ctx.save(); ctx.globalAlpha = 0.5 * easeOut(seg(u, 0.8, 1.6)); strokeRing(ctx, 548, 1150, 78, 0, 0); ctx.restore(); }
  }
  function strokeRing(ctx, cx, cy, r, prog, glow) {
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,246,227,.55)"; ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.3); ctx.stroke();
    if (prog > 0) {
      const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r); g.addColorStop(0, C.lemon); g.addColorStop(1, C.coral);
      ctx.strokeStyle = g; ctx.shadowColor = C.lemon; ctx.shadowBlur = 26 * glow;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke(); ctx.shadowBlur = 0;
    }
  }
  function drawRing(ctx, prog, T) {
    const cx = 548, cy = 1150, r = 78;
    ctx.save();
    ctx.fillStyle = "rgba(14,24,64,.82)"; ctx.beginPath(); ctx.arc(cx, cy, r + 26, 0, 6.3); ctx.fill();
    strokeRing(ctx, cx, cy, r, clamp(prog), 1);
    // speaking-lips-free microphone-less glyph: sound arcs pulsing (silent visual)
    ctx.strokeStyle = C.ivory; ctx.lineWidth = 9; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = 0.25 + 0.2 * Math.sin(T * 3 - i * 0.9); ctx.globalAlpha = 0.5 + a; ctx.beginPath(); ctx.arc(cx - 22, cy, 20 + i * 17, -0.9, 0.9); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.fillStyle = C.ivory; rr(ctx, cx - 48, cy - 16, 24, 32, 8); ctx.fill();
    ctx.restore();
  }

  function drawSameTag(ctx, u) {
    const k = easeBack(seg(u, 0.15, 0.75));
    if (k <= 0) return;
    ctx.save(); ctx.translate(540, 1255); ctx.scale(k, k);
    setFont(ctx, 44, 900); const t = "Misma acción · distinto punto de vista"; const w = ctx.measureText(t).width + 60;
    ctx.shadowColor = "rgba(20,33,61,.3)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = C.ink; rr(ctx, -w / 2, -42, w, 84, 42); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = C.lemon; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(t, 0, 3);
    ctx.restore();
  }

  function drawRewind(ctx, V, u, T, beat) {
    const k = clamp(u / beat.dur);
    const a = Math.sin(Math.PI * k);
    ctx.save();
    // tinted wash + scanlines
    ctx.fillStyle = `rgba(31,79,216,${0.22 * a})`; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255,255,255,${0.10 * a})`;
    for (let y = ((T * 900) % 36) - 36; y < H; y += 36) ctx.fillRect(0, y, W, 10);
    // speed streaks
    ctx.strokeStyle = `rgba(255,246,227,${0.5 * a})`; ctx.lineCap = "round";
    for (let i = 0; i < 14; i++) { const y = 360 + ((i * 97 + T * 400) % 1000), x = (i * 211 + (1 - k) * 900) % W; ctx.lineWidth = 4 + (i % 3) * 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 140, y); ctx.stroke(); }
    // rewind glyph
    ctx.globalAlpha = Math.min(1, a * 1.6);
    ctx.translate(540, 560); ctx.scale(0.8 + 0.3 * a, 0.8 + 0.3 * a);
    ctx.fillStyle = C.ink; rr(ctx, -250, -70, 500, 140, 70); ctx.fill();
    ctx.fillStyle = C.lemon;
    const tri = (x) => { ctx.beginPath(); ctx.moveTo(x - 34, 0); ctx.lineTo(x + 20, -38); ctx.lineTo(x + 20, 38); ctx.closePath(); ctx.fill(); };
    tri(-190); tri(-130);
    setFont(ctx, 58, 900); ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = C.ivory; ctx.fillText("OTRA VEZ", -78, 4);
    ctx.restore();
  }

  function drawCaption(ctx, text, id) {
    setFont(ctx, 46, 900);
    const lines = wrapLines(ctx, text, 960);
    const lh = 60, h = lines.length * lh + 36, w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 70;
    const y = 1580 - h;
    ctx.save();
    ctx.fillStyle = "rgba(20,33,61,.82)"; rr(ctx, 540 - w / 2, y, w, h, 34); ctx.fill();
    ctx.fillStyle = C.ivory; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    lines.forEach((l, i) => ctx.fillText(l, 540, y + 20 + lh * (i + 0.5) + 2));
    ctx.restore();
  }

  /* ---------- end card ---------- */
  function drawCTA(ctx, u, T) {
    const inK = easeOut(seg(u, 0, 0.5));
    ctx.save();
    ctx.fillStyle = `rgba(255,246,227,${0.94 * inK})`; ctx.fillRect(0, 0, W, H);
    // confetti shapes
    ctx.globalAlpha = inK;
    const cols = [C.coral, C.lemon, C.cobalt];
    for (let i = 0; i < 18; i++) {
      const x = (i * 157) % W, y = 200 + ((i * 331 + T * 40) % 1500);
      ctx.save(); ctx.translate(x, y); ctx.rotate(T * 0.6 + i); ctx.fillStyle = alpha(cols[i % 3], 0.35); rr(ctx, -12, -6, 26, 12, 6); ctx.fill(); ctx.restore();
    }
    // logo card
    const lk = easeBack(seg(u, 0.0, 0.6));
    const lw = 760, lh = (lw * FE.assets.logoH) / FE.assets.logoW;
    ctx.save(); ctx.translate(540, 470); ctx.scale(lk, lk);
    ctx.shadowColor = "rgba(20,33,61,.25)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12;
    ctx.fillStyle = "#FFFFFF"; rr(ctx, -lw / 2 - 30, -lh / 2 - 26, lw + 60, lh + 52, 56); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (FE.assets.logoImg) ctx.drawImage(FE.assets.logoImg, -lw / 2, -lh / 2, lw, lh);
    ctx.restore();
    // clases en línea
    const ck = easeOut(seg(u, 0.5, 1.0));
    pill(ctx, 540, 722, "clases en línea", 38, C.cobalt, "#fff", { alpha: ck });
    // three tag words
    const words = [["Entiéndelo.", C.cobalt], ["Dilo.", C.coral], ["Practícalo.", "#D49A00"]];
    words.forEach((w, i) => {
      const k = easeBack(seg(u, 0.8 + i * 0.35, 1.3 + i * 0.35));
      if (k <= 0) return;
      ctx.save(); ctx.translate(540, 830 + i * 112); ctx.scale(k, k);
      setFont(ctx, 96, 900); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 10; ctx.strokeStyle = "#fff"; ctx.strokeText(w[0], 0, 0); ctx.fillStyle = w[1]; ctx.fillText(w[0], 0, 0);
      ctx.restore();
    });
    // write-us button
    const bk = easeBack(seg(u, 2.2, 2.8));
    if (bk > 0) {
      ctx.save(); ctx.translate(540, 1255); const pulse = 1 + 0.025 * Math.sin(T * 5); ctx.scale(bk * pulse, bk * pulse);
      ctx.shadowColor = alpha(C.coral, 0.6); ctx.shadowBlur = 40; ctx.shadowOffsetY = 10;
      ctx.fillStyle = lin(ctx, 0, -70, 0, 70, [[0, "#FF8A78"], [1, C.coral]]); rr(ctx, -440, -78, 880, 156, 78); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      // chat icon
      ctx.fillStyle = "#fff"; rr(ctx, -388, -44, 96, 70, 22); ctx.fill(); ctx.beginPath(); ctx.moveTo(-368, 20); ctx.lineTo(-372, 52); ctx.lineTo(-338, 22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.coral; [-362, -340, -318].forEach((x) => { ctx.beginPath(); ctx.arc(x, -9, 7, 0, 6.3); ctx.fill(); });
      setFont(ctx, 68, 900); ctx.textAlign = "left"; ctx.textBaseline = "middle";
      const wEs = ctx.measureText("Escríbenos ").width, wIn = ctx.measureText("INGLÉS").width, x0 = -270 + (700 - wEs - wIn) / 2;
      ctx.fillStyle = "#fff"; ctx.fillText("Escríbenos", x0, 2);
      ctx.fillStyle = C.lemon; ctx.fillText("INGLÉS", x0 + wEs, 2);
      ctx.restore();
    }
    ctx.restore();
  }

  FE.loadAssets = async function () {
    const A = window.FE_ASSETS;
    FE.assets = { logoW: A.logoSize[0], logoH: A.logoSize[1] };
    const faces = [
      new FontFace("FE Nunito", `url(${A.nunito800})`, { weight: "800" }),
      new FontFace("FE Nunito", `url(${A.nunito900})`, { weight: "900" }),
      new FontFace("FE IPA", `url(${A.ipaFont})`, { weight: "700" }),
    ];
    await Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l)).catch(() => {})));
    await new Promise((res) => { const im = new Image(); im.onload = () => { FE.assets.logoImg = im; res(); }; im.onerror = res; im.src = A.logo; });
  };
})();
