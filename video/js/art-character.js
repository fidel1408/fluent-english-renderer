/* The presenter: a friendly adult man, waist-up. Arms are a real 2-bone rig (shoulder → elbow → wrist)
 * with anatomically-proportioned limbs and a five-fingered hand, so elbows and wrists bend naturally. */
window.FE = window.FE || {};

(function (FE) {
  const U = FE.U;
  const SKIN = { base: "#d99f74", light: "#ebb88f", shade: "#b97c57", line: "#8f5a3d" };
  const HAIR = { base: "#2b1b13", hi: "#503729" };
  const BLAZER = { base: "#b3174f", light: "#d02a67", dark: "#7d0f3a", line: "#5a0a29" };
  const SHIRT = "#fbf0da";
  const CX = 700, SY = 1150; // body centre-x and shoulder-line y
  const UPPER = 250, FORE = 215;
  const deg = Math.PI / 180;

  // ---------- pose keyframes (viewer-right arm = gesturing arm) ----------
  // [upper-arm angle, forearm angle, hand angle, finger spread, finger curl]; canvas degrees (0 → right, 90 → down)
  // Elbow flexion (|forearm − upper arm|) is kept ≤ ~135° and the upper arm stays close to the torso:
  // no folded-flat forearms, no flared "chicken-wing" elbows.
  const P = {
    rest: [86, 100, 100, 0.15, 0.5, 1],
    low: [84, 188, 184, 0.22, 0.35, 0.78],
    ask: [80, 205, 228, 0.6, 0.15, 0.62],
    present: [78, 210, 222, 0.4, 0.2, 0.62],
    present2: [78, 215, 232, 0.4, 0.2, 0.6],
  };
  const KEYS = [
    [0.0, "rest"], [0.7, "rest"], [1.3, "ask"], [3.1, "ask"], [3.9, "low"],
    [4.3, "low"], [4.8, "present"], [6.8, "present"], [7.6, "low"],
    [10.3, "low"], [10.8, "present2"], [13.0, "present2"], [13.7, "low"],
    [15.15, "low"], [15.4, "ask"], [17.0, "ask"], [17.7, "low"],
    [23.7, "low"], [24.3, "present"], [25.0, "present"], [25.4, "present2"], [28.6, "present2"],
    [29.4, "low"], [31, "low"],
  ];
  function poseAt(T) {
    let i = 0;
    while (i < KEYS.length - 2 && T >= KEYS[i + 1][0]) i++;
    const [t0, n0] = KEYS[i], [t1, n1] = KEYS[i + 1];
    const k = U.inOut(U.clamp((T - t0) / (t1 - t0), 0, 1));
    const a = P[n0], b = P[n1];
    return a.map((v, j) => U.lerp(v, b[j], k));
  }

  // ---------- parts ----------
  // Hand in local frame: wrist at origin, fingers along +x. thumbSign: −1 thumb on −y side, +1 on +y side.
  // Drawn as one silhouette: outline pass → skin pass → soft finger separations (reads as five clear digits).
  function fingerPts(bx, by, ang, len, curl, bend) {
    const mx = bx + Math.cos(ang) * len * 0.56, my = by + Math.sin(ang) * len * 0.56;
    const a2 = ang + bend * curl * 38 * deg;
    return [[bx, by], [mx, my], [mx + Math.cos(a2) * len * 0.46, my + Math.sin(a2) * len * 0.46]];
  }
  function palmPath(ctx) {
    ctx.beginPath(); ctx.moveTo(0, -20);
    ctx.bezierCurveTo(14, -30, 44, -30, 62, -28); ctx.bezierCurveTo(73, -27, 76, -18, 76, -8);
    ctx.lineTo(76, 12); ctx.bezierCurveTo(76, 24, 71, 31, 60, 30);
    ctx.bezierCurveTo(40, 33, 14, 30, 0, 22); ctx.bezierCurveTo(-9, 12, -9, -12, 0, -20); ctx.closePath();
  }
  function drawHand(ctx, x, y, ang, spread, curl, ts) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang * deg); ctx.scale(1.3, 1.3);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const L = [61, 67, 61, 49], Y = [20, 6.5, -7, -20], Wd = [16.5, 17, 16, 14];
    const fingers = L.map((len, i) => fingerPts(66, ts * Y[i], (i - 1.5) * spread * 8 * deg * -ts, len, curl * (i === 3 ? 1.15 : 1), ts));
    const ta = ts * (32 + spread * 16) * deg, tb = [18, ts * 21];
    const t1 = [tb[0] + Math.cos(ta) * 31, tb[1] + Math.sin(ta) * 31];
    const ta2 = ts * (14 + spread * 8) * deg;
    const thumb = [tb, t1, [t1[0] + Math.cos(ta2) * 27, t1[1] + Math.sin(ta2) * 27]];
    const stroke = (pts, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
    // 1) outline
    fingers.forEach((f, i) => stroke(f, Wd[i] + 5, SKIN.line)); stroke(thumb, 23, SKIN.line);
    palmPath(ctx); ctx.fillStyle = SKIN.line; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = SKIN.line; ctx.stroke();
    // 2) skin
    stroke(thumb, 18.5, SKIN.base);
    fingers.forEach((f, i) => stroke(f, Wd[i], SKIN.base));
    palmPath(ctx); const pg = ctx.createLinearGradient(0, -28, 0, 28); pg.addColorStop(0, SKIN.light); pg.addColorStop(1, SKIN.base);
    ctx.fillStyle = pg; ctx.fill();
    ctx.fillStyle = SKIN.base; ctx.beginPath(); ctx.ellipse(26, ts * 17, 20, 15, 0, 0, 7); ctx.fill(); // thumb mound
    // 3) finger separations + highlights + knuckle hints
    ctx.strokeStyle = "rgba(143,90,61,0.75)"; ctx.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) {
      const a = fingers[i], b = fingers[i + 1];
      const mx = (a[1][0] + b[1][0]) / 2, my = (a[1][1] + b[1][1]) / 2;
      ctx.beginPath(); ctx.moveTo(63, (a[0][1] + b[0][1]) / 2); ctx.lineTo(mx, my); ctx.stroke();
    }
    fingers.forEach((f) => { ctx.strokeStyle = "rgba(255,225,200,0.4)"; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(f[0][0] + 2, f[0][1] - ts * 2.5); ctx.lineTo(f[1][0] + 1, f[1][1] - ts * 2.5); ctx.stroke(); });
    ctx.strokeStyle = "rgba(143,90,61,0.4)"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(14, ts * 12); ctx.quadraticCurveTo(34, ts * 3, 52, -ts * 8); ctx.stroke();
    ctx.restore();
  }

  // One arm: shoulder S, angles a1 (upper), a2 (fore), a3 (hand).
  function drawArm(ctx, sx, sy, a1, a2, a3, spread, curl, thumbSign, ff) {
    ff = ff || 1;
    const ex = sx + Math.cos(a1 * deg) * UPPER, ey = sy + Math.sin(a1 * deg) * UPPER;
    const wx = ex + Math.cos(a2 * deg) * FORE * ff, wy = ey + Math.sin(a2 * deg) * FORE * ff;
    // hand behind the cuff
    drawHand(ctx, wx, wy, a3, spread, curl, thumbSign);
    // forearm sleeve
    const sleeve = (x0, y0, r0, x1, y1, r1) => {
      U.capsule(ctx, x0, y0, r0, x1, y1, r1);
      const g = ctx.createLinearGradient(x0 - r0, y0, x0 + r0, y0);
      g.addColorStop(0, BLAZER.light); g.addColorStop(1, BLAZER.base);
      ctx.fillStyle = BLAZER.base; ctx.fill(); ctx.strokeStyle = BLAZER.line; ctx.lineWidth = 3.5; ctx.stroke();
    };
    // shirt cuff (cream) peeking out
    const dxf = Math.cos(a2 * deg), dyf = Math.sin(a2 * deg);
    U.capsule(ctx, wx - dxf * 16, wy - dyf * 16, 31, wx + dxf * 4, wy + dyf * 4, 29);
    ctx.fillStyle = SHIRT; ctx.fill(); ctx.strokeStyle = "#cdbb94"; ctx.lineWidth = 3; ctx.stroke();
    sleeve(ex, ey, 41, wx - dxf * 14, wy - dyf * 14, 33);
    // forearm highlight
    ctx.strokeStyle = "rgba(255,170,200,0.28)"; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(ex - dyf * 14, ey + dxf * 14); ctx.lineTo(wx - dxf * 20 - dyf * 12, wy - dyf * 20 + dxf * 12); ctx.stroke();
    // upper arm + elbow
    sleeve(sx, sy, 46, ex, ey, 41);
    ctx.beginPath(); ctx.arc(ex, ey, 40, 0, 7); ctx.fillStyle = BLAZER.base; ctx.fill();
    // elbow fold
    ctx.strokeStyle = "rgba(90,10,41,0.35)"; ctx.lineWidth = 4; ctx.beginPath();
    ctx.arc(ex, ey, 30, (a1 + 100) * deg, (a2 - 60) * deg, false); ctx.stroke();
    return { ex, ey, wx, wy };
  }

  function drawTorso(ctx, breathe) {
    ctx.save(); ctx.translate(CX, SY + breathe);
    // blazer body
    ctx.beginPath();
    ctx.moveTo(-64, -30);
    ctx.bezierCurveTo(-120, -28, -190, -14, -232, 28);
    ctx.quadraticCurveTo(-250, 56, -242, 130);
    ctx.lineTo(-222, 360); ctx.lineTo(222, 360); ctx.lineTo(242, 130);
    ctx.quadraticCurveTo(250, 56, 232, 28);
    ctx.bezierCurveTo(190, -14, 120, -28, 64, -30); ctx.closePath();
    const bg = ctx.createLinearGradient(-240, 0, 240, 0);
    bg.addColorStop(0, BLAZER.light); bg.addColorStop(0.5, BLAZER.base); bg.addColorStop(1, BLAZER.dark);
    ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = BLAZER.line; ctx.lineWidth = 4; ctx.stroke();
    // shirt V
    ctx.beginPath(); ctx.moveTo(-62, -30); ctx.lineTo(0, 160); ctx.lineTo(62, -30); ctx.closePath();
    const sg = ctx.createLinearGradient(0, -30, 0, 160); sg.addColorStop(0, "#fff8e8"); sg.addColorStop(1, "#e9d9b6");
    ctx.fillStyle = sg; ctx.fill();
    // open collar
    ctx.fillStyle = "#fffaf0"; ctx.strokeStyle = "#cdbb94"; ctx.lineWidth = 3;
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath(); ctx.moveTo(s * 40, -34); ctx.lineTo(s * 74, 12); ctx.lineTo(s * 24, 34); ctx.lineTo(s * 2, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
    // lapels
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath(); ctx.moveTo(s * 58, -30); ctx.lineTo(s * 100, 26); ctx.lineTo(s * 70, 66); ctx.lineTo(s * 96, 128); ctx.lineTo(s * 8, 168);
      ctx.lineTo(s * 28, 74); ctx.closePath();
      const lg = ctx.createLinearGradient(s * 20, 0, s * 110, 160);
      lg.addColorStop(0, BLAZER.dark); lg.addColorStop(1, "#a01446");
      ctx.fillStyle = lg; ctx.fill(); ctx.strokeStyle = BLAZER.line; ctx.lineWidth = 3; ctx.stroke();
    });
    // centre line + button, gold lapel pin
    ctx.strokeStyle = BLAZER.line; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 168); ctx.lineTo(0, 360); ctx.stroke();
    ctx.fillStyle = "#e9d19a"; ctx.beginPath(); ctx.arc(-8, 214, 9, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(118, 70, 8, 0, 7); ctx.fill(); ctx.strokeStyle = "#b88f3c"; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  function drawHead(ctx, st, W) {
    ctx.save();
    ctx.translate(CX, SY - 30 + st.breathe);
    // neck
    ctx.beginPath(); ctx.moveTo(-50, -120); ctx.lineTo(-54, 0); ctx.quadraticCurveTo(0, 26, 54, 0); ctx.lineTo(50, -120); ctx.closePath();
    const ng = ctx.createLinearGradient(-54, 0, 54, 0); ng.addColorStop(0, SKIN.shade); ng.addColorStop(0.45, SKIN.base); ng.addColorStop(1, SKIN.shade);
    ctx.fillStyle = ng; ctx.fill();
    ctx.fillStyle = "rgba(90,50,30,0.35)"; ctx.beginPath(); ctx.ellipse(0, -70, 52, 34, 0, 0, 7); ctx.fill();
    // head rotates about the neck base
    ctx.translate(0, -60); ctx.rotate(st.tilt * deg); ctx.translate(0, 60 + st.nod);
    const hy = -135; // head centre y (relative)
    ctx.translate(0, hy); ctx.scale(1.1, 1.1);
    // ears
    [-1, 1].forEach((s) => {
      ctx.fillStyle = SKIN.base; ctx.strokeStyle = SKIN.line; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(s * 96, 8, 15, 27, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = SKIN.shade; ctx.beginPath(); ctx.ellipse(s * 97, 10, 6, 15, 0, 0, 7); ctx.fill();
    });
    // face
    const face = () => {
      ctx.beginPath(); ctx.moveTo(0, -122);
      ctx.bezierCurveTo(54, -122, 96, -86, 97, -26);
      ctx.bezierCurveTo(98, 24, 92, 62, 70, 90);
      ctx.bezierCurveTo(54, 112, 26, 124, 0, 124);
      ctx.bezierCurveTo(-26, 124, -54, 112, -70, 90);
      ctx.bezierCurveTo(-92, 62, -98, 24, -97, -26);
      ctx.bezierCurveTo(-96, -86, -54, -122, 0, -122); ctx.closePath();
    };
    face();
    const fg = ctx.createLinearGradient(-97, 0, 97, 0);
    fg.addColorStop(0, SKIN.shade); fg.addColorStop(0.22, SKIN.base); fg.addColorStop(0.62, SKIN.light); fg.addColorStop(1, SKIN.base);
    ctx.fillStyle = fg; ctx.fill(); ctx.strokeStyle = SKIN.line; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.save(); face(); ctx.clip();
    // beard (short, neat) — fills jaw and chin, leaves cheeks/forehead as skin
    ctx.beginPath();
    ctx.moveTo(-100, -4); ctx.bezierCurveTo(-92, 30, -78, 46, -58, 52);
    ctx.bezierCurveTo(-40, 40, -22, 38, 0, 40); ctx.bezierCurveTo(22, 38, 40, 40, 58, 52);
    ctx.bezierCurveTo(78, 46, 92, 30, 100, -4); ctx.lineTo(104, 140); ctx.lineTo(-104, 140); ctx.closePath();
    const bgd = ctx.createLinearGradient(0, 40, 0, 130); bgd.addColorStop(0, "rgba(46,30,22,0.92)"); bgd.addColorStop(1, "rgba(30,19,14,0.96)");
    ctx.fillStyle = bgd; ctx.fill();
    // stubble speckle
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    const rr = U.prng(5);
    for (let i = 0; i < 140; i++) { const x = (rr() - 0.5) * 190, y = 50 + rr() * 74; ctx.fillRect(x, y, 2, 2); }
    ctx.restore();
    // cheek blush + light
    ctx.fillStyle = "rgba(230,120,110,0.16)";
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(s * 62, 22, 24, 16, 0, 0, 7); ctx.fill(); });

    // hair
    ctx.beginPath();
    ctx.moveTo(-101, -4);
    ctx.bezierCurveTo(-118, -96, -84, -158, -14, -168);
    ctx.bezierCurveTo(30, -178, 108, -158, 114, -92);
    ctx.bezierCurveTo(118, -60, 106, -28, 101, -4);
    ctx.lineTo(93, -28);
    ctx.bezierCurveTo(90, -64, 74, -84, 46, -92);
    ctx.bezierCurveTo(14, -104, -30, -98, -52, -78);
    ctx.bezierCurveTo(-72, -66, -86, -52, -90, -28); ctx.closePath();
    const hg = ctx.createLinearGradient(-100, -160, 100, -40); hg.addColorStop(0, HAIR.base); hg.addColorStop(0.5, HAIR.hi); hg.addColorStop(1, HAIR.base);
    ctx.fillStyle = hg; ctx.fill(); ctx.strokeStyle = "#160d08"; ctx.lineWidth = 3; ctx.stroke();
    // side-part line and strands
    ctx.strokeStyle = "rgba(255,230,200,0.22)"; ctx.lineWidth = 3; ctx.lineCap = "round";
    [[-34, -140, -10, -110, 30, -100], [-10, -150, 22, -122, 62, -108], [-60, -128, -44, -108, -8, -98]].forEach(([a, b, c, d, e, f]) => {
      ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c, d, e, f); ctx.stroke();
    });

    // eyes
    const blink = st.blink;
    [-1, 1].forEach((s) => {
      const ex = s * 40, ey = -22;
      ctx.save(); ctx.translate(ex, ey);
      ctx.fillStyle = "#fffdf6"; ctx.beginPath(); ctx.ellipse(0, 0, 21, 12 * (1 - blink * 0.92) + 0.8, 0, 0, 7); ctx.fill();
      if (blink < 0.8) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 21, 12 * (1 - blink * 0.92) + 0.8, 0, 0, 7); ctx.clip();
        const ix = st.eye.x * 5, iy = st.eye.y * 3;
        const ig = ctx.createRadialGradient(ix, iy, 1, ix, iy, 11); ig.addColorStop(0, "#7a4a2c"); ig.addColorStop(1, "#3b2316");
        ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(ix, iy, 10.5, 0, 7); ctx.fill();
        ctx.fillStyle = "#120a06"; ctx.beginPath(); ctx.arc(ix, iy, 5, 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.arc(ix - 3.5, iy - 3.5, 2.6, 0, 7); ctx.fill();
        ctx.restore();
      }
      // lids
      ctx.strokeStyle = "#241510"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.ellipse(0, 0, 21, 12 * (1 - blink * 0.92) + 0.8, 0, Math.PI * 1.04, Math.PI * 1.96); ctx.stroke();
      ctx.restore();
      // brows: thick, adult, expressive
      ctx.save(); ctx.translate(s * 40, -56 - st.brow * 8);
      ctx.rotate(-s * st.browTilt * deg);
      ctx.fillStyle = "#2a190f"; ctx.beginPath();
      ctx.moveTo(-s * 26, 2); ctx.quadraticCurveTo(s * 2, -17, s * 29, 4);
      ctx.quadraticCurveTo(s * 28, 9, s * 22, 7); ctx.quadraticCurveTo(s * 2, -6, -s * 25, 9); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
    // nose
    ctx.strokeStyle = "rgba(143,90,61,0.7)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-8, -18); ctx.quadraticCurveTo(-14, 14, -17, 28); ctx.stroke();
    ctx.fillStyle = SKIN.light; ctx.beginPath(); ctx.moveTo(-4, -20); ctx.quadraticCurveTo(8, 10, 6, 28); ctx.lineTo(0, 28); ctx.closePath(); ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = "#b97c57"; ctx.beginPath(); ctx.ellipse(0, 33, 20, 11, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = "#5a3321"; [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(s * 9, 34, 4.5, 3, 0, 0, 7); ctx.fill(); });
    // moustache
    ctx.fillStyle = "#231610"; ctx.beginPath();
    ctx.moveTo(-46, 52); ctx.quadraticCurveTo(-22, 36, 0, 44); ctx.quadraticCurveTo(22, 36, 46, 52);
    ctx.quadraticCurveTo(24, 58, 0, 52); ctx.quadraticCurveTo(-24, 58, -46, 52); ctx.closePath(); ctx.fill();
    // mouth: warm closed/open smile
    const m = U.clamp(st.mouth, 0, 1), sm = st.smile;
    const my = 64, mw = 34 + sm * 6;
    ctx.beginPath();
    ctx.moveTo(-mw, my - 3 - sm * 3);
    ctx.quadraticCurveTo(0, my + 3 + 2 * m, mw, my - 3 - sm * 3);
    ctx.quadraticCurveTo(0, my + 12 + 24 * m + sm * 6, -mw, my - 3 - sm * 3); ctx.closePath();
    ctx.fillStyle = "#5b1e2b"; ctx.fill();
    // teeth
    ctx.save(); ctx.clip();
    ctx.fillStyle = "#fffdf4"; ctx.fillRect(-mw, my - 8, mw * 2, 8 + 9 * m + sm * 5);
    ctx.fillStyle = "#9a3d4a"; ctx.beginPath(); ctx.ellipse(0, my + 14 + 16 * m, 18, 8 + 6 * m, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#7a2a3a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-mw, my - 3 - sm * 3); ctx.quadraticCurveTo(0, my + 12 + 24 * m + sm * 6, mw, my - 3 - sm * 3); ctx.stroke();
    // smile lines
    ctx.strokeStyle = "rgba(143,90,61,0.55)"; ctx.lineWidth = 3;
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.moveTo(s * 50, 36); ctx.quadraticCurveTo(s * 62, 54, s * 50, 72); ctx.stroke(); });
    ctx.restore();
  }

  // Eyes follow the lesson: up toward the text while it is being taught, to the viewer for questions.
  function gaze(T) {
    const text = (T > 4.5 && T < 14.8) || (T > 24 && T < 26.6);
    return text ? { x: -0.4, y: -0.9 } : { x: 0, y: 0 };
  }
  // ---------- public ----------
  FE.drawPresenter = function (ctx, S) {
    const T = S.T, W = S.W;
    const breathe = Math.sin(W * 1.6) * 2.2;
    // facial state
    const speaking = !!S.speakingEn;
    const mouth = speaking ? 0.28 + 0.5 * Math.abs(Math.sin(W * 13.5)) * (0.6 + 0.4 * Math.sin(W * 3.1)) : 0.0;
    const hush = T >= FE.TL.pauseStart - 0.2 && T < FE.TL.pauseStart + FE.TL.pauseLen;
    const bt = (W % 3.6);
    const blink = bt > 3.42 ? Math.sin(((bt - 3.42) / 0.18) * Math.PI) : 0;
    const ask = T > 1.1 && T < 3.3 || (T > 15.3 && T < 17.2);
    const st = {
      breathe, mouth, smile: speaking ? 0.5 : 1,
      blink: U.clamp(blink, 0, 1),
      tilt: (ask ? 3.5 : hush ? 2 : 0) + Math.sin(W * 0.8) * 0.8 + (speaking ? Math.sin(W * 4.2) * 1.0 : 0),
      nod: (hush ? 0 : Math.sin(W * 0.9) * 0.8) + (speaking ? Math.abs(Math.sin(W * 4.2)) * 2.5 : 0),
      brow: ask ? 0.8 : 0.1, browTilt: ask ? 3 : 0,
      eye: gaze(T),
    };
    drawTorso(ctx, breathe);
    // left arm (viewer-left): relaxed at the side, behind the cake/table
    const sh = { lx: CX - 192, rx: CX + 192, y: SY + 34 + breathe };
    drawArm(ctx, sh.lx, sh.y, 96 + Math.sin(W * 1.6) * 0.8, 84, 84, 0.15, 0.5, +1);
    // right arm (viewer-right): gesturing
    const p = poseAt(T);
    let a2 = p[1], a3 = p[2];
    drawArm(ctx, sh.rx, sh.y, p[0] + Math.sin(W * 1.6) * 0.6, a2, a3, p[3], p[4], -1, p[5]);
    drawHead(ctx, st, W);
  };
})(window.FE);
