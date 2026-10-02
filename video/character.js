/* Illustrated adult male character: waist-up, two-bone IK arms, five-finger hands. */
const Char = (() => {
  const SKIN = '#c98a5c', SKIN_D = '#9e6340', SKIN_L = '#e2a878', HAIR = '#2a1816', SHIRT = '#1aa7a1', SHIRT_D = '#0f7f7d', SHIRT_L = '#3cd0c6', CREAM = '#f7ecd9';
  const L1 = 245, L2 = 235, SH = 232;      // upper arm, forearm, half shoulder width
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const POSES = {            // curl per finger [thumb, index, middle, ring, pinky], spread
    relaxed: { c: [0.3, 0.32, 0.4, 0.46, 0.52], s: 0.12 },
    open: { c: [0.05, 0.03, 0.03, 0.05, 0.08], s: 0.34 },
    present: { c: [0.12, 0.12, 0.14, 0.2, 0.26], s: 0.2 },
    point: { c: [0.55, 0.0, 0.92, 0.96, 1.0], s: 0.05 },
    fist: { c: [0.8, 0.95, 0.95, 0.95, 0.95], s: 0.0 },
  };
  const GEST = {   // wrist targets relative to the neck base; r = hand roll in radians (0 = fingers up)
    rest: { L: { x: -250, y: 470, p: 'relaxed', r: 2.7 }, R: { x: 250, y: 470, p: 'relaxed', r: -2.7 } },
    ready: { L: { x: -215, y: 430, p: 'relaxed', r: 2.7 }, R: { x: 330, y: 235, p: 'open', r: -0.25 } },
    hold: { L: { x: -335, y: 170, p: 'open', r: 0.22 }, R: { x: 335, y: 170, p: 'open', r: -0.22 } },
    pluck: { L: { x: -230, y: 440, p: 'relaxed', r: 2.7 }, R: { x: 318, y: 115, p: 'point', r: -0.12 } },
    show: { L: { x: -230, y: 440, p: 'relaxed', r: 2.7 }, R: { x: 330, y: 190, p: 'present', r: -0.5 } },
    chest: { L: { x: -62, y: 215, p: 'open', r: 1.2 }, R: { x: 245, y: 440, p: 'relaxed', r: -2.7 } },
    you: { L: { x: -70, y: 225, p: 'open', r: 1.2 }, R: { x: 335, y: 185, p: 'present', r: -0.5 } },
    listen: { L: { x: -225, y: 370, p: 'present', r: 0.35 }, R: { x: 225, y: 370, p: 'present', r: -0.35 } },
    confident: { L: { x: -320, y: 260, p: 'open', r: 0.3 }, R: { x: 320, y: 260, p: 'open', r: -0.3 } },
    point: { L: { x: -240, y: 450, p: 'relaxed', r: 2.7 }, R: { x: 322, y: 130, p: 'point', r: -0.1 } },
  };
  const FACE = {
    neutral: { brow: 0, smile: 0.45, eye: 1 },
    confident: { brow: 0.1, smile: 0.7, eye: 1 },
    freeze: { brow: 0.9, smile: 0.2, eye: 1.2 },
    happy: { brow: 0.3, smile: 1, eye: 0.9 },
    joy: { brow: 0.4, smile: 1.2, eye: 0.8 },
    expect: { brow: 0.7, smile: 0.7, eye: 1.05 },
  };

  const S = {
    x: 520, y: 960, s: 1, g: GEST.rest, hand: { L: null, R: null }, brow: 0, smile: 0.45, eyeOpen: 1,
    nod: 0, tilt: 0, lookX: 0, lookY: 0, mouth: 0, speaking: false, frozen: false, bob: 0,
    tgt: { g: 'rest', f: 'neutral', x: 520, y: 960, s: 1, nod: 0, tilt: 0 },
  };
  function resetHands() {
    ['L', 'R'].forEach(k => { const g = S.g[k]; S.hand[k] = { x: g.x, y: g.y, r: g.r, c: POSES[g.p].c.slice(), s: POSES[g.p].s }; });
  }
  S.g = GEST.rest; resetHands();

  function set(o) { Object.assign(S.tgt, o); }
  function update(dt, t) {
    const k = 1 - Math.exp(-dt * 7), g = GEST[S.tgt.g], f = FACE[S.tgt.f];
    ['L', 'R'].forEach(h => {
      const a = S.hand[h], b = g[h], p = POSES[b.p];
      a.x = lerp(a.x, b.x, k); a.y = lerp(a.y, b.y, k); a.r = lerp(a.r, b.r, k); a.s = lerp(a.s, p.s, k);
      for (let i = 0; i < 5; i++) a.c[i] = lerp(a.c[i], p.c[i], k);
    });
    S.brow = lerp(S.brow, f.brow, k); S.smile = lerp(S.smile, f.smile, k); S.eyeOpen = lerp(S.eyeOpen, f.eye, k);
    S.x = lerp(S.x, S.tgt.x, k); S.y = lerp(S.y, S.tgt.y, k); S.s = lerp(S.s, S.tgt.s, k);
    S.nod = lerp(S.nod, S.tgt.nod, k); S.tilt = lerp(S.tilt, S.tgt.tilt, k);
    const m = S.speaking ? 0.25 + 0.65 * Math.abs(Math.sin(t * 11.3) * Math.sin(t * 5.1 + 1)) : 0;
    S.mouth = lerp(S.mouth, m, 1 - Math.exp(-dt * 22));
  }

  function capsule(ctx, x1, y1, x2, y2, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

  // Natural arm: upper arm keeps its length and hangs down/outward (following the hand a little);
  // the forearm is foreshortened as needed, so elbows never fly up like wings.
  function ik(S0, T, side) {
    const base = Math.PI / 2 - side * 0.24, toT = Math.atan2(T.y - S0.y, T.x - S0.x);
    let dl = toT - base; while (dl > Math.PI) dl -= 2 * Math.PI; while (dl < -Math.PI) dl += 2 * Math.PI;
    const k = 0.15 + 0.35 * clamp((260 - T.y) / 260, 0, 1), dir = base + k * dl;
    const E = { x: S0.x + L1 * Math.cos(dir), y: S0.y + L1 * Math.sin(dir) };
    let vx = T.x - E.x, vy = T.y - E.y, d = Math.hypot(vx, vy) || 1;
    const len = clamp(d, 90, L2);
    return { E, W: { x: E.x + vx / d * len, y: E.y + vy / d * len } };
  }

  function drawHand(ctx, h, ang, side) {
    ctx.save(); ctx.rotate(h.r); if (side > 0) ctx.scale(-1, 1);
    const fing = [ // [baseX, baseLen, lenTotal]
      { x: 26, l: 56 }, { x: 9, l: 62 }, { x: -9, l: 56 }, { x: -26, l: 44 },
    ];
    const draw = (col, grow) => {
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // palm
      ctx.beginPath(); ctx.moveTo(-31, 8); ctx.quadraticCurveTo(-42, -30, -38, -66); ctx.lineTo(38, -66);
      ctx.quadraticCurveTo(42, -30, 31, 8); ctx.quadraticCurveTo(0, 22, -31, 8); ctx.closePath(); ctx.fill();
      if (grow) { ctx.lineWidth = grow; ctx.stroke(); }
      // fingers
      fing.forEach((f, i) => {
        const c = h.c[i + 1], spread = (i - 1.5) * -h.s * 0.55 + (i === 0 ? 0 : 0);
        const ang2 = (1.5 - i) * h.s * 0.5;
        const len = f.l * (0.28 + 0.72 * Math.cos(c * 1.35));
        const bx = f.x, by = -62, w = 19 - i * 0.8;
        const ex = bx + Math.sin(ang2) * len, ey = by - Math.cos(ang2) * len;
        ctx.lineWidth = w + (grow || 0); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
      });
      // thumb
      const tc = h.c[0], ta = 0.95 - tc * 1.0 + h.s * 0.3, tl = 54 - tc * 16;
      const tx = 34, ty = -8;
      ctx.lineWidth = 22 + (grow || 0); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + Math.sin(ta) * tl, ty - Math.cos(ta) * tl); ctx.stroke();
    };
    draw(SKIN_D, 7); draw(SKIN, 0);
    // knuckle + finger crease hints
    ctx.strokeStyle = 'rgba(120,70,40,.28)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, -30); ctx.quadraticCurveTo(0, -24, 30, -30); ctx.stroke();
    ctx.restore();
  }

  function drawArm(ctx, side, hand) {
    const sh = { x: side * SH, y: 82 };
    const { E, W } = ik(sh, hand, side);
    // upper sleeve (shirt), rolled cuff at the elbow, skin forearm
    capsule(ctx, sh.x, sh.y, E.x, E.y, 92, SHIRT_D);
    capsule(ctx, sh.x, sh.y, E.x, E.y, 80, SHIRT);
    const fa = Math.atan2(W.y - E.y, W.x - E.x);
    capsule(ctx, E.x, E.y, W.x, W.y, 62, SKIN_D);
    capsule(ctx, E.x, E.y, W.x, W.y, 54, SKIN);
    // forearm light edge
    capsule(ctx, E.x + Math.cos(fa) * 70, E.y + Math.sin(fa) * 70, W.x - Math.cos(fa) * 20, W.y - Math.sin(fa) * 20, 14, 'rgba(255,220,180,.18)');
    // rolled cuff
        capsule(ctx, E.x + Math.cos(fa) * 14, E.y + Math.sin(fa) * 14, E.x + Math.cos(fa) * 30, E.y + Math.sin(fa) * 30, 74, CREAM);
    capsule(ctx, E.x + Math.cos(fa) * 22, E.y + Math.sin(fa) * 22, E.x + Math.cos(fa) * 30, E.y + Math.sin(fa) * 30, 72, '#e6d6ba');
    ctx.save(); ctx.translate(W.x, W.y); drawHand(ctx, S.hand[side < 0 ? 'L' : 'R'], fa, side); ctx.restore();
  }

  function drawHead(ctx, t) {
    const blink = (t % 3.6) > 3.47 ? 0.08 : 1;
    const eo = clamp(S.eyeOpen * blink, 0.05, 1.3);
    // neck
    ctx.fillStyle = SKIN_D; ctx.beginPath(); ctx.roundRect(-52, -105, 104, 120, 30); ctx.fill();
    ctx.fillStyle = 'rgba(60,25,15,.35)'; ctx.beginPath(); ctx.ellipse(0, -62, 62, 26, 0, 0, Math.PI); ctx.fill();
    ctx.save(); ctx.translate(0, -62 + S.nod); ctx.rotate(S.tilt); ctx.translate(0, 62);
    // ears
    [-1, 1].forEach(sd => { ctx.fillStyle = SKIN_D; ctx.beginPath(); ctx.ellipse(sd * 108, -168, 19, 33, 0, 0, 7); ctx.fill(); ctx.fillStyle = SKIN; ctx.beginPath(); ctx.ellipse(sd * 107, -168, 12, 24, 0, 0, 7); ctx.fill(); });
    // face
    const face = new Path2D('M-106 -192 C-108 -290 -58 -326 0 -326 C58 -326 108 -290 106 -192 C108 -140 104 -100 84 -72 C62 -44 34 -38 0 -38 C-34 -38 -62 -44 -84 -72 C-104 -100 -108 -140 -106 -192 Z');
    const fg = ctx.createLinearGradient(-90, -300, 90, -40); fg.addColorStop(0, SKIN_L); fg.addColorStop(0.55, SKIN); fg.addColorStop(1, '#b97a4f');
    ctx.fillStyle = fg; ctx.fill(face);
    // cheek blush
    ctx.fillStyle = 'rgba(230,110,80,.16)'; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * 62, -128, 26, 17, 0, 0, 7); ctx.fill(); });
    // beard (short, groomed) + mustache
    ctx.fillStyle = 'rgba(38,22,20,.88)';
    ctx.beginPath(); ctx.moveTo(-105, -196); ctx.bezierCurveTo(-110, -120, -92, -62, -60, -52); ctx.bezierCurveTo(-30, -36, 30, -36, 60, -52);
    ctx.bezierCurveTo(92, -62, 110, -120, 105, -196); ctx.bezierCurveTo(98, -170, 90, -146, 68, -134);
    ctx.bezierCurveTo(44, -126, 20, -128, 0, -126); ctx.bezierCurveTo(-20, -128, -44, -126, -68, -134); ctx.bezierCurveTo(-90, -146, -98, -170, -105, -196); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-44, -120); ctx.bezierCurveTo(-22, -134, -6, -128, 0, -124); ctx.bezierCurveTo(6, -128, 22, -134, 44, -120); ctx.bezierCurveTo(24, -108, -24, -108, -44, -120); ctx.fill();
    // chin-area shading
    ctx.fillStyle = 'rgba(38,22,20,.35)'; ctx.beginPath(); ctx.ellipse(0, -70, 60, 26, 0, 0, Math.PI); ctx.fill();
    // nose
    ctx.strokeStyle = 'rgba(120,64,36,.6)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, -190); ctx.quadraticCurveTo(-14, -150, -22, -143); ctx.quadraticCurveTo(0, -132, 22, -143); ctx.stroke();
    ctx.fillStyle = 'rgba(80,40,25,.5)'; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * 12, -139, 6, 4, 0, 0, 7); ctx.fill(); });
    // eyes
    [-1, 1].forEach(sd => {
      const ex = sd * 43, ey = -194;
      ctx.save(); ctx.translate(ex, ey);
      ctx.fillStyle = '#fbf6ec'; ctx.beginPath(); ctx.ellipse(0, 0, 25, 16 * eo, 0, 0, 7); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 25, 16 * eo, 0, 0, 7); ctx.clip();
      ctx.fillStyle = '#4a2a1a'; ctx.beginPath(); ctx.arc(S.lookX * 6, S.lookY * 4, 12.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#120a08'; ctx.beginPath(); ctx.arc(S.lookX * 6, S.lookY * 4, 6.5, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(S.lookX * 6 + 4, S.lookY * 4 - 5, 3.2, 0, 7); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(40,20,15,.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 25, 16 * eo, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.restore();
      // eyebrows: thick, masculine
      const by = -232 - S.brow * 14 + (sd === 1 ? 0 : 0), inner = S.brow * 5;
      ctx.strokeStyle = HAIR; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sd * 20, by + 4 + inner * 0.2); ctx.quadraticCurveTo(sd * 48, by - 8 - S.brow * 6, sd * 76, by + 6 + S.brow * 4); ctx.stroke();
    });
    // mouth
    const my = -88, sm = S.smile, mo = S.mouth, mw = 38 + sm * 12;
    if (mo < 0.06) {
      ctx.strokeStyle = '#6e2a22'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-mw, my - sm * 6); ctx.quadraticCurveTo(0, my + 6 + sm * 14, mw, my - sm * 6); ctx.stroke();
      if (sm > 0.85) { ctx.fillStyle = '#fbf6ec'; ctx.beginPath(); ctx.moveTo(-mw * 0.7, my - 1); ctx.quadraticCurveTo(0, my + 13 + sm * 9, mw * 0.7, my - 1); ctx.quadraticCurveTo(0, my + 7, -mw * 0.7, my - 1); ctx.fill(); }
    } else {
      const h = 8 + mo * 34;
      ctx.fillStyle = '#3a0f12'; ctx.beginPath(); ctx.moveTo(-mw * 0.8, my - 4); ctx.quadraticCurveTo(0, my - 8, mw * 0.8, my - 4);
      ctx.quadraticCurveTo(mw * 0.55, my + h + 4, 0, my + h + 8); ctx.quadraticCurveTo(-mw * 0.55, my + h + 4, -mw * 0.8, my - 4); ctx.fill();
      ctx.fillStyle = '#fbf6ec'; ctx.beginPath(); ctx.moveTo(-mw * 0.62, my - 4); ctx.quadraticCurveTo(0, my - 7, mw * 0.62, my - 4); ctx.lineTo(mw * 0.55, my + 7); ctx.quadraticCurveTo(0, my + 3, -mw * 0.55, my + 7); ctx.fill();
      ctx.fillStyle = '#c9585a'; ctx.beginPath(); ctx.ellipse(0, my + h + 2, mw * 0.4, Math.min(11, h * 0.38), 0, Math.PI, 0); ctx.fill();
    }
    // hair
    const hg = ctx.createLinearGradient(-100, -350, 100, -230); hg.addColorStop(0, '#4a2d27'); hg.addColorStop(1, HAIR);
    ctx.fillStyle = hg; ctx.beginPath();
    ctx.moveTo(-112, -200); ctx.bezierCurveTo(-128, -300, -72, -352, 6, -352); ctx.bezierCurveTo(88, -352, 130, -300, 112, -200);
    ctx.bezierCurveTo(106, -236, 92, -256, 64, -266); ctx.bezierCurveTo(30, -246, -26, -262, -62, -250); ctx.bezierCurveTo(-88, -242, -104, -226, -112, -200); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.ellipse(-20, -320, 46, 10, -0.2, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawTorso(ctx, br) {
    ctx.save(); ctx.translate(0, br);
    const tg = ctx.createLinearGradient(-280, 0, 280, 0); tg.addColorStop(0, SHIRT_D); tg.addColorStop(0.3, SHIRT); tg.addColorStop(0.55, SHIRT_L); tg.addColorStop(1, SHIRT_D);
    ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-124, -14); ctx.bezierCurveTo(-210, 4, -268, 40, -282, 112); ctx.lineTo(-312, 1300); ctx.lineTo(312, 1300); ctx.lineTo(282, 112);
    ctx.bezierCurveTo(268, 40, 210, 4, 124, -14); ctx.closePath(); ctx.fill();
    // henley collar + placket
    ctx.fillStyle = CREAM; ctx.beginPath(); ctx.moveTo(-70, -22); ctx.quadraticCurveTo(0, 36, 70, -22); ctx.lineTo(52, -12); ctx.quadraticCurveTo(0, 56, -52, -12); ctx.fill();
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(-60, -20); ctx.quadraticCurveTo(0, 46, 60, -20); ctx.lineTo(0, -28); ctx.fill();
    ctx.strokeStyle = SHIRT_D; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, 190); ctx.stroke();
    ctx.fillStyle = CREAM; [76, 124, 172].forEach(y => { ctx.beginPath(); ctx.arc(0, y, 7, 0, 7); ctx.fill(); });
    // folds
    ctx.strokeStyle = 'rgba(8,60,70,.22)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-150, 260); ctx.quadraticCurveTo(-120, 330, -150, 430); ctx.moveTo(160, 250); ctx.quadraticCurveTo(130, 340, 170, 440); ctx.stroke();
    ctx.restore();
  }

  function draw(ctx, t) {
    const br = S.frozen ? 0 : Math.sin(t * 1.9) * 4, sway = S.frozen ? 0 : Math.sin(t * 0.8) * 0.01;
    ctx.save(); ctx.translate(S.x, S.y); ctx.scale(S.s, S.s); ctx.rotate(sway);
    // soft ground shadow behind torso
    ctx.fillStyle = 'rgba(20,5,30,.18)'; ctx.beginPath(); ctx.ellipse(0, 300, 330, 380, 0, 0, 7); ctx.fill();
    drawTorso(ctx, br);
    ctx.save(); ctx.translate(0, br * 0.6); drawHead(ctx, t); ctx.restore();
    ctx.save(); ctx.translate(0, br); drawArm(ctx, -1, S.hand.L); drawArm(ctx, 1, S.hand.R); ctx.restore();
    ctx.restore();
  }
  return { S, set, update, draw, resetHands, GEST, FACE };
})();
