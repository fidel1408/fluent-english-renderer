/* Character rig: front-facing adult cartoon figure with 2-bone arms (foreshortening aware),
   constructed hands (palm + 4 fingers with 3 phalanges + thumb), and a simple walk-in pair of legs.
   All coordinates are "local" (origin = neck base, +y down) and scaled by P.s. */
(function () {
  const FE = (window.FE = window.FE || {});
  const U = FE.U, C = FE.C;

  const SX = 135, SY = 26; // shoulder joint offset
  const L1 = 205, L2 = 178; // upper arm, forearm
  const DARK = '#2A1710';

  /* Two-bone IK. Returns elbow and (possibly clamped) wrist. pref = preferred elbow direction. */
  function ik(S, W, l1, l2, pref) {
    let dx = W[0] - S[0], dy = W[1] - S[1];
    let d = Math.hypot(dx, dy) || 1e-6;
    const maxd = l1 + l2 - 0.5, mind = Math.abs(l1 - l2) + 0.5;
    const dd = U.clamp(d, mind, maxd);
    const ux = dx / d, uy = dy / d;
    const wrist = [S[0] + ux * dd, S[1] + uy * dd];
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const px = S[0] + ux * a, py = S[1] + uy * a;
    const c1 = [px - uy * h, py + ux * h], c2 = [px + uy * h, py - ux * h];
    const sc = (c) => (c[0] - S[0]) * pref[0] + (c[1] - S[1]) * pref[1];
    return { E: sc(c1) >= sc(c2) ? c1 : c2, W: wrist };
  }

  /* ---------- hand ---------- */
  const FINGERS = [ // from thumb side: index, middle, ring, pinky
    { u: 21, len: 54, w: 15.5 }, { u: 7, len: 60, w: 16 }, { u: -7, len: 55, w: 15 }, { u: -21, len: 44, w: 13 }
  ];
  const POSES = {
    relaxed: { curl: [0.38, 0.44, 0.5, 0.56], spread: 5, thumb: { ang: 14, curl: 0.4 } },
    open: { curl: [0.05, 0.03, 0.05, 0.08], spread: 7, thumb: { ang: 38, curl: 0.05 } },
    present: { curl: [0.08, 0.06, 0.09, 0.14], spread: 4, thumb: { ang: 30, curl: 0.1 } },
    point: { curl: [0.0, 1.0, 1.0, 1.0], spread: 2, thumb: { ang: 16, curl: 0.95 } },
    wrap: { curl: [0.3, 0.28, 0.32, 0.38], spread: 0, thumb: null }
  };
  function mixPose(a, b, k) {
    const A = POSES[a], B = POSES[b || a];
    return {
      curl: A.curl.map((v, i) => U.lerp(v, B.curl[i], k)),
      spread: U.lerp(A.spread, B.spread, k),
      thumb: A.thumb && B.thumb ? { ang: U.lerp(A.thumb.ang, B.thumb.ang, k), curl: U.lerp(A.thumb.curl, B.thumb.curl, k) } : (k < 0.5 ? A.thumb : B.thumb)
    };
  }

  function fingerPoints(f, curl, spreadDeg, tS) {
    const th = [curl * 1.15, curl * 1.65, curl * 0.95]; // joint flexions (rad)
    const frac = [0.5, 0.3, 0.2];
    const sp = (spreadDeg * Math.PI) / 180 * (f.u * tS / 21);
    let x = f.u * tS, y = 70, phi = 0;
    const pts = [[x, y]];
    for (let i = 0; i < 3; i++) {
      phi += th[i];
      const l = f.len * frac[i];
      y += l * Math.cos(phi); x += l * Math.sin(sp) * Math.cos(phi);
      pts.push([x, y]);
    }
    return pts;
  }

  /* Draw the part of the hand "behind" a held object: palm + (optionally) fingers. */
  function handBack(c, o) {
    const skin = o.skin, shade = o.shade;
    // palm: rounded trapezoid via thick round-joined path
    const pw = 56;
    c.save();
    c.beginPath(); c.moveTo(-22, 2); c.lineTo(22, 2); c.lineTo(pw / 2 + 3, 66); c.lineTo(-pw / 2 - 3, 66); c.closePath();
    c.lineJoin = 'round'; c.lineWidth = 12; c.strokeStyle = DARK; c.stroke();
    c.lineWidth = 8; c.strokeStyle = skin; c.stroke(); c.fillStyle = skin; c.fill();
    // soft palm shading
    c.fillStyle = shade; c.globalAlpha = 0.28; c.beginPath(); c.ellipse(-o.tS * 6, 38, 14, 22, 0, 0, 7); c.fill();
    c.restore();
  }
  function thumbPts(o) {
    const t = o.pose.thumb; if (!t) return null;
    const a = (t.ang * Math.PI) / 180;
    const base = [o.tS * 22, 26];
    const dir1 = Math.PI / 2 - o.tS * a; // measured from +y axis toward the thumb side
    const p1 = [base[0] + Math.cos(dir1) * 36, base[1] + Math.sin(dir1) * 36 * (1 - 0.35 * t.curl)];
    const dir2 = dir1 - o.tS * t.curl * 1.2;
    const p2 = [p1[0] + Math.cos(dir2) * 28 * (1 - 0.25 * t.curl), p1[1] + Math.sin(dir2) * 28 * (1 - 0.45 * t.curl)];
    return [base, p1, p2];
  }
  function drawChain(c, pts, widths, col, edge) {
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < pts.length - 1; i++) {
        U.capsule(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], widths[i] / 2 + (pass ? 0 : 2.6), widths[i + 1] / 2 + (pass ? 0 : 2.6));
        if (pass) { c.fillStyle = col; c.fill(); } else { c.fillStyle = DARK; c.fill(); }
      }
    }
    // knuckle creases
    c.strokeStyle = edge; c.globalAlpha = 0.5; c.lineWidth = 1.6;
    for (let i = 1; i < pts.length - 1; i++) {
      const w = widths[i] * 0.34; c.beginPath(); c.moveTo(pts[i][0] - w, pts[i][1]); c.lineTo(pts[i][0] + w, pts[i][1]); c.stroke();
    }
    c.globalAlpha = 1;
  }
  function handFront(c, o) {
    const fins = o.fingerOrder || [3, 2, 1, 0, 'thumb']; // draw back-to-front
    fins.forEach((k) => {
      if (k === 'thumb') {
        const tp = thumbPts(o); if (tp) drawChain(c, tp, [24, 21, 17], o.skin, o.shade);
        return;
      }
      const f = FINGERS[k];
      const pts = fingerPoints(f, o.pose.curl[k], o.pose.spread, o.tS);
      const ws = [f.w, f.w * 0.93, f.w * 0.86, f.w * 0.72];
      drawChain(c, pts, ws, o.skin, o.shade);
      // fingernail hint on mostly-extended fingers
      if (o.pose.curl[k] < 0.5) {
        const e = pts[3], p = pts[2];
        c.save(); c.translate(e[0], e[1]); c.rotate(Math.atan2(e[1] - p[1], e[0] - p[0]) - Math.PI / 2);
        c.fillStyle = 'rgba(255,235,220,0.55)'; U.rr(c, -3.4, -8, 6.8, 7.5, 3); c.fill(); c.restore();
      }
    });
  }

  /* ---------- body parts ---------- */
  function drawLegs(c, P) {
    const ph = P.walk; // phase in radians or null
    c.fillStyle = DARK; U.rr(c, -112, 430, 224, 100, 30); c.fill();
    c.fillStyle = P.pants; U.rr(c, -109, 433, 218, 94, 28); c.fill();
    const sides = [-1, 1];
    sides.forEach((sd) => {
      const sw = Math.sin(ph + (sd < 0 ? 0 : Math.PI));
      const lift = Math.max(0, sw) * 70;
      const hip = [sd * 56, 470];
      const knee = [sd * (62 + 6 * sw), 470 + 235 - lift * 0.55];
      const foot = [sd * (58 + 4 * sw), 470 + 470 - lift];
      c.save();
      [[hip, knee, 52, 44], [knee, foot, 44, 34]].forEach(([a, b, r1, r2]) => {
        U.capsule(c, a[0], a[1], b[0], b[1], r1 + 3, r2 + 3); c.fillStyle = DARK; c.fill();
        U.capsule(c, a[0], a[1], b[0], b[1], r1, r2); c.fillStyle = P.pants; c.fill();
      });
      // shoe
      c.beginPath(); c.ellipse(foot[0] + sd * 8, foot[1] + 18, 52, 24, 0, 0, 7); c.fillStyle = DARK; c.fill();
      c.beginPath(); c.ellipse(foot[0] + sd * 8, foot[1] + 16, 48, 20, 0, 0, 7); c.fillStyle = P.shoes || C.caramel; c.fill();
      c.restore();
    });
  }

  function drawTorso(c, P) {
    const sh = P.shirt, sd = P.shirtDark, sl = P.shirtLight;
    const br = P.breathe || 0;
    c.save();
    c.scale(1 + br * 0.006, 1 + br * 0.01);
    c.beginPath();
    c.moveTo(-34, -10);
    c.bezierCurveTo(-76, -8, -126, 4, -152, 34);
    c.bezierCurveTo(-170, 58, -170, 104, -156, 156);
    c.bezierCurveTo(-142, 240, -124, 340, -116, 470);
    c.lineTo(116, 470);
    c.bezierCurveTo(124, 340, 142, 240, 156, 156);
    c.bezierCurveTo(170, 104, 170, 58, 152, 34);
    c.bezierCurveTo(126, 4, 76, -8, 34, -10);
    c.closePath();
    c.fillStyle = U.grad(c, -160, 0, 160, 0, [[0, sd], [0.22, sh], [0.7, sh], [1, sd]]);
    c.fill(); c.lineWidth = 4; c.lineJoin = 'round'; c.strokeStyle = P.outline || '#0E3B3D'; c.stroke();
    c.clip();
    if (P.apron) {
      c.fillStyle = P.apron;
      c.beginPath(); c.moveTo(-86, 70); c.lineTo(86, 70); c.lineTo(112, 470); c.lineTo(-112, 470); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 3; c.stroke();
      c.strokeStyle = P.apron; c.lineWidth = 12;
      c.beginPath(); c.moveTo(-70, 70); c.lineTo(-30, -6); c.moveTo(70, 70); c.lineTo(30, -6); c.stroke();
    } else {
      // placket + buttons + pocket
      c.strokeStyle = 'rgba(8,40,42,0.55)'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(0, 60); c.lineTo(0, 480); c.stroke();
      c.fillStyle = P.shirtLight;
      for (let y = 110; y < 470; y += 78) { c.beginPath(); c.arc(0, y, 6, 0, 7); c.fill(); }
      c.strokeStyle = 'rgba(8,40,42,0.55)'; c.lineWidth = 3; U.rr(c, 52, 120, 62, 70, 8); c.stroke();
      c.beginPath(); c.moveTo(52, 138); c.lineTo(114, 138); c.stroke();
      // soft fold shadows
      c.globalAlpha = 0.16; c.fillStyle = '#04201f';
      c.beginPath(); c.moveTo(-40, 250); c.quadraticCurveTo(-70, 330, -60, 470); c.lineTo(-30, 470); c.quadraticCurveTo(-34, 340, -40, 250); c.fill();
      c.globalAlpha = 1;
    }
    c.restore();
    // collar (shirts)
    if (!P.apron) {
      c.save();
      c.fillStyle = sl; c.lineWidth = 3.5; c.strokeStyle = P.outline || '#0E3B3D'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-34, -10); c.lineTo(-70, 20); c.lineTo(-18, 72); c.lineTo(2, 46); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(34, -10); c.lineTo(70, 20); c.lineTo(18, 72); c.lineTo(-2, 46); c.closePath(); c.fill(); c.stroke();
      c.restore();
    } else {
      c.save(); c.fillStyle = '#FFF6E6'; c.strokeStyle = DARK; c.lineWidth = 3;
      c.beginPath(); c.moveTo(-34, -10); c.lineTo(-52, 30); c.lineTo(0, 54); c.lineTo(52, 30); c.lineTo(34, -10); c.closePath(); c.fill(); c.stroke(); c.restore();
    }
  }

  function drawNeck(c, P) {
    c.save();
    U.rr(c, -28, -62, 56, 74, 14); c.fillStyle = P.skinShade; c.fill();
    c.strokeStyle = DARK; c.lineWidth = 3; c.stroke();
    c.restore();
  }

  /* Head in head-local coordinates (origin = head centre). */
  function drawHead(c, P) {
    const skin = P.skin, shade = P.skinShade;
    const m = P.mouth || { open: 0, smile: 0.5 };
    const look = P.look || [0, 0];
    const blink = P.blink || 0;
    const brow = P.brow || 0;
    const female = P.female;

    // back hair (female ponytail/bun)
    if (female) {
      c.fillStyle = P.hair; c.strokeStyle = DARK; c.lineWidth = 3;
      c.beginPath(); c.arc(4, -108, 34, 0, 7); c.fill(); c.stroke();
    }
    // ears
    [-1, 1].forEach((s) => {
      c.beginPath(); c.ellipse(s * 61, 4, 11, 19, 0, 0, 7); c.fillStyle = skin; c.fill(); c.strokeStyle = DARK; c.lineWidth = 3; c.stroke();
      c.beginPath(); c.ellipse(s * 62, 5, 5, 11, 0, 0, 7); c.fillStyle = shade; c.globalAlpha = 0.5; c.fill(); c.globalAlpha = 1;
    });
    // head shape
    const headPath = () => {
      c.beginPath(); c.moveTo(0, -80);
      c.bezierCurveTo(46, -80, 62, -46, 62, -8);
      c.bezierCurveTo(62, 34, 40, 74, 0, 78);
      c.bezierCurveTo(-40, 74, -62, 34, -62, -8);
      c.bezierCurveTo(-62, -46, -46, -80, 0, -80); c.closePath();
    };
    headPath();
    c.fillStyle = U.grad(c, 0, -80, 0, 80, [[0, P.skinLight], [0.45, skin], [1, shade]]); c.fill();
    c.lineWidth = 3.5; c.strokeStyle = DARK; c.stroke();

    // beard (trimmed) with mouth cut-out
    if (P.beard) {
      c.save(); headPath(); c.clip();
      c.beginPath();
      c.moveTo(-70, -4); c.bezierCurveTo(-48, 6, -40, 22, -24, 24); c.quadraticCurveTo(0, 20, 24, 24);
      c.bezierCurveTo(40, 22, 48, 6, 70, -4); c.lineTo(70, 90); c.lineTo(-70, 90); c.closePath();
      c.fillStyle = P.hair; c.globalAlpha = 0.9; c.fill(); c.globalAlpha = 1;
      // lip area (lighter skin around the mouth)
      c.beginPath(); c.ellipse(0, 44, 30, 15, 0, 0, 7); c.fillStyle = skin; c.fill();
      c.restore();
    }
    // blush
    c.globalAlpha = 0.2; c.fillStyle = C.coral;
    [-1, 1].forEach((s) => { c.beginPath(); c.ellipse(s * 40, 20, 15, 10, 0, 0, 7); c.fill(); });
    c.globalAlpha = 1;

    // eyes
    [-1, 1].forEach((s) => {
      const ex = s * 26, ey = -18;
      const ry = 10.5 * (1 - blink * 0.95);
      c.save();
      c.beginPath(); c.ellipse(ex, ey, 14, Math.max(0.8, ry), 0, 0, 7); c.fillStyle = '#FFFFFF'; c.fill();
      c.clip();
      c.beginPath(); c.arc(ex + look[0] * 5, ey + look[1] * 3.5, 7.4, 0, 7); c.fillStyle = '#4A2B1B'; c.fill();
      c.beginPath(); c.arc(ex + look[0] * 5, ey + look[1] * 3.5, 3.7, 0, 7); c.fillStyle = '#120A07'; c.fill();
      c.beginPath(); c.arc(ex + look[0] * 5 - 2.4, ey + look[1] * 3.5 - 2.6, 1.9, 0, 7); c.fillStyle = '#fff'; c.fill();
      c.restore();
      c.beginPath(); c.ellipse(ex, ey, 14, Math.max(0.8, ry), 0, Math.PI, 0); c.lineWidth = 3.4; c.strokeStyle = DARK; c.stroke();
      c.beginPath(); c.ellipse(ex, ey, 14, Math.max(0.8, ry), 0, 0, Math.PI); c.lineWidth = 1.4; c.strokeStyle = 'rgba(70,30,15,0.5)'; c.stroke();
      // eyebrows
      const by = -42 - brow * 5 - (female ? 0 : 0);
      c.beginPath();
      c.moveTo(s * 10, by + 3 - brow * 2); c.quadraticCurveTo(s * 28, by - 6 - brow * 3, s * 46, by + 3 + brow);
      c.lineWidth = female ? 4.5 : 7.5; c.lineCap = 'round'; c.strokeStyle = P.hair; c.stroke(); c.lineCap = 'butt';
    });
    // nose
    c.beginPath(); c.moveTo(-3, -12); c.quadraticCurveTo(-9, 10, -11, 13); c.quadraticCurveTo(0, 21, 11, 13); c.quadraticCurveTo(8, 8, 5, -8);
    c.lineWidth = 3; c.strokeStyle = 'rgba(80,38,20,0.7)'; c.stroke();
    c.beginPath(); c.ellipse(6, 4, 5, 10, -0.15, 0, 7); c.fillStyle = shade; c.globalAlpha = 0.28; c.fill(); c.globalAlpha = 1;

    // mouth
    const my = 44, w = 19 + m.smile * 6;
    const cornerLift = m.smile * 8;
    if (m.open > 0.06) {
      const h = m.open * 24;
      c.beginPath();
      c.moveTo(-w, my - cornerLift * 0.6);
      c.quadraticCurveTo(0, my - 5 + m.smile * 2, w, my - cornerLift * 0.6);
      c.quadraticCurveTo(0, my + h * 1.6 + m.smile * 8, -w, my - cornerLift * 0.6);
      c.closePath(); c.fillStyle = '#5B1E19'; c.fill();
      c.save(); c.clip();
      c.fillStyle = '#FFF8EE'; c.fillRect(-w, my - 8, 2 * w, Math.min(8 + h * 0.1, 10));
      c.fillStyle = '#C8574C'; c.beginPath(); c.ellipse(0, my + h * 1.3, w * 0.55, h * 0.5 + 3, 0, 0, 7); c.fill();
      c.restore();
      c.lineWidth = 3.2; c.strokeStyle = DARK; c.beginPath();
      c.moveTo(-w, my - cornerLift * 0.6); c.quadraticCurveTo(0, my - 5 + m.smile * 2, w, my - cornerLift * 0.6);
      c.quadraticCurveTo(0, my + h * 1.6 + m.smile * 8, -w, my - cornerLift * 0.6); c.stroke();
    } else {
      c.beginPath(); c.moveTo(-w, my - cornerLift * 0.5); c.quadraticCurveTo(0, my + 3 + m.smile * 12, w, my - cornerLift * 0.5);
      c.lineWidth = 3.8; c.lineCap = 'round'; c.strokeStyle = '#5B1E19'; c.stroke(); c.lineCap = 'butt';
    }
    // hair
    c.save();
    c.fillStyle = P.hair; c.strokeStyle = DARK; c.lineWidth = 3.5; c.lineJoin = 'round';
    c.beginPath();
    if (female) {
      c.moveTo(-66, -6); c.bezierCurveTo(-76, -92, -30, -112, 6, -108); c.bezierCurveTo(56, -106, 78, -84, 66, -6);
      c.bezierCurveTo(62, -34, 52, -52, 30, -62); c.bezierCurveTo(10, -50, -30, -50, -52, -58); c.bezierCurveTo(-58, -40, -62, -24, -66, -6);
    } else {
      c.moveTo(-64, -10); c.bezierCurveTo(-74, -78, -38, -108, 10, -104); c.bezierCurveTo(54, -102, 76, -76, 64, -10);
      c.bezierCurveTo(62, -26, 56, -44, 46, -52); c.bezierCurveTo(26, -64, -2, -52, -26, -62);
      c.bezierCurveTo(-42, -56, -54, -44, -57, -28); c.bezierCurveTo(-60, -22, -62, -16, -64, -10);
    }
    c.closePath(); c.fill(); c.stroke();
    c.globalAlpha = 0.35; c.strokeStyle = '#6B4A3A'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-34, -90); c.quadraticCurveTo(-4, -104, 28, -94); c.stroke();
    c.beginPath(); c.moveTo(-14, -84); c.quadraticCurveTo(8, -92, 30, -84); c.stroke();
    c.restore();
  }

  /* ---------- arms ---------- */
  function armGeometry(P, side, A) {
    const S = [side * SX, SY + (P.shoulderLift || 0)];
    const l1 = L1 * (A.f1 == null ? 1 : A.f1), l2 = L2 * (A.f2 == null ? 1 : A.f2);
    const pref = A.pref || [side * 0.35, 1];
    return Object.assign({ S }, ik(S, A.W, l1, l2, pref));
  }
  function drawArmBack(c, P, side, A, G) {
    const { S, E, W } = G;
    const sleeve = P.shirt, edge = P.outline || '#0E3B3D';
    // upper arm sleeve
    U.capsule(c, S[0], S[1], E[0], E[1], 46, 37); c.fillStyle = edge; c.fill();
    U.capsule(c, S[0], S[1], E[0], E[1], 43, 34.5); c.fillStyle = P.shirt; c.fill();
    // forearm skin
    const near = 1 + (1 - (A.f2 == null ? 1 : A.f2)) * 0.28; // closer to camera => slightly thicker
    U.capsule(c, E[0], E[1], W[0], W[1], 33 * near + 3, 24 * near + 3); c.fillStyle = DARK; c.fill();
    U.capsule(c, E[0], E[1], W[0], W[1], 33 * near, 24 * near); c.fillStyle = P.skin; c.fill();
    // forearm shading
    U.capsule(c, E[0], E[1], W[0], W[1], 33 * near, 24 * near); c.save(); c.clip();
    c.fillStyle = P.skinShade; c.globalAlpha = 0.25; c.translate(side * 8, 6); U.capsule(c, E[0], E[1], W[0], W[1], 33 * near, 24 * near); c.fill(); c.restore();
    // rolled cuff at the elbow
    const ang = Math.atan2(W[1] - E[1], W[0] - E[0]);
    const cx = E[0] + Math.cos(ang) * 6, cy = E[1] + Math.sin(ang) * 6;
    c.save(); c.translate(cx, cy); c.rotate(ang);
    U.rr(c, -12, -37, 26, 74, 12); c.fillStyle = P.shirtLight; c.fill(); c.lineWidth = 3.5; c.strokeStyle = edge; c.stroke(); c.restore();
  }
  function handOpts(P, side, A, G) {
    const hp = A.hand || { pose: 'relaxed' };
    const pose = typeof hp.pose === 'string' ? mixPose(hp.pose, hp.to, hp.k || 0) : hp.pose;
    return { skin: P.skin, shade: P.skinShade, pose, tS: hp.tS != null ? hp.tS : -side, fingerOrder: hp.fingerOrder };
  }
  function withHandFrame(c, G, A, fn) {
    const { E, W } = G;
    let ang = Math.atan2(W[1] - E[1], W[0] - E[0]);
    if (A.hand && A.hand.dir != null) ang = A.hand.dir;
    c.save(); c.translate(W[0], W[1]); c.rotate(ang - Math.PI / 2 + ((A.hand && A.hand.roll) || 0)); c.scale((A.hand && A.hand.scale) || 1, (A.hand && A.hand.scale) || 1);
    fn(); c.restore();
  }
  function drawHandBack(c, P, side, A, G) {
    const o = handOpts(P, side, A, G);
    withHandFrame(c, G, A, () => handBack(c, o));
  }
  function drawHandFront(c, P, side, A, G) {
    const o = handOpts(P, side, A, G);
    withHandFrame(c, G, A, () => handFront(c, o));
  }

  /* Public: draw a person. P.armL / P.armR: {W:[x,y], f1, f2, pref, hand:{pose,to,k,roll,tS,scale}}.
     P.holdL / P.holdR callbacks draw an object between the back of the hand and the fingers (in person-local space). */
  FE.drawPerson = function (c, P) {
    c.save();
    c.translate(P.x, P.y); c.scale(P.s, P.s);
    if (P.walk != null) drawLegs(c, P);
    drawTorso(c, P);
    drawNeck(c, P);
    c.save();
    c.translate(0, -6); c.rotate(P.tilt || 0); c.translate(0, 6 + (P.nod || 0) - 112);
    drawHead(c, P);
    c.restore();
    const arms = [[-1, P.armL, P.holdL], [1, P.armR, P.holdR]];
    const geo = arms.map(([sd, A]) => armGeometry(P, sd, A));
    arms.forEach(([sd, A], i) => { drawArmBack(c, P, sd, A, geo[i]); drawHandBack(c, P, sd, A, geo[i]); });
    arms.forEach(([sd, A, hold], i) => {
      if (hold) hold(c, geo[i]);
      drawHandFront(c, P, sd, A, geo[i]);
    });
    c.restore();
    return geo;
  };
  FE.personGeo = armGeometry;
  FE.handPoses = POSES;
  FE.armDims = { SX, SY, L1, L2 };
})();
