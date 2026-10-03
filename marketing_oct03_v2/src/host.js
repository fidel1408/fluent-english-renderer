/* ONE adult male presenter ("host"), waist-up with visible neck, shoulders and torso. Pure function of time (no stored state).
   Local units: origin = base of the neck, y down, 1 unit ~ 0.8 px at the default scale. Head ~200 wide x 296 tall, shoulders ~480 wide. */
const HOST = (() => {
  const C = { skin: '#D9A07A', skinD: '#B9805C', skinL: '#EDBA94', hair: '#1f1819', hairL: '#3a2c2d', shirt: '#FFF7EB', shirtD: '#E2D5BF', teal: '#0D625F', mint: '#72D8C6', navy: '#101E34', lip: '#9a4a40' };
  const G = { x: 506, nb: 1235, s: 0.8 };                 // screen placement of the neck base and scale
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, sm = x => x * x * (3 - 2 * x);
  const L1 = 262, L2 = 236, SH = 232;                      // upper arm, forearm (realistic ratio to head size), half shoulder width

  const POSES = { open: { c: [0.05, 0.03, 0.03, 0.05, 0.08], s: 0.34 }, relaxed: { c: [0.3, 0.32, 0.4, 0.46, 0.52], s: 0.12 }, point: { c: [0.55, 0.0, 0.92, 0.96, 1.0], s: 0.05 }, present: { c: [0.12, 0.12, 0.14, 0.2, 0.26], s: 0.2 } };
  const GEST = {
    rest: { L: { x: -250, y: 520, p: 'relaxed', r: 2.7 }, R: { x: 250, y: 520, p: 'relaxed', r: -2.7 } },
    both: { L: { x: -300, y: 35, p: 'open', r: 0.22 }, R: { x: 300, y: 35, p: 'open', r: -0.22 } },
    presentR: { L: { x: -250, y: 520, p: 'relaxed', r: 2.7 }, R: { x: 305, y: 25, p: 'open', r: -0.3 } },
    presentL: { L: { x: -305, y: 25, p: 'open', r: 0.3 }, R: { x: 250, y: 520, p: 'relaxed', r: -2.7 } },
    pointR: { L: { x: -250, y: 520, p: 'relaxed', r: 2.7 }, R: { x: 295, y: 5, p: 'point', r: -0.12 } },
  };
  const MOODS = { warm: { brow: 0.1, smile: 0.7, eye: 1 }, ask: { brow: 0.8, smile: 0.55, eye: 1.08 }, think: { brow: 0.25, smile: 0.25, eye: 0.95 }, happy: { brow: 0.3, smile: 1.1, eye: 0.9 }, serious: { brow: 0, smile: 0.2, eye: 1 } };

  // keyframes: [{t, v}] -> blended value (names resolved through a table), smoothstep over 0.35 s before each key time
  function blendKeys(t, keys, table, fields, fade = 0.35) {
    let prev = keys[0], next = null; for (const k of keys) { if (k.t <= t) prev = k; else { next = k; break; } }
    const out = {}; const a = table[prev.v];
    if (!next) { fields.forEach(f => out[f] = a[f]); return { out, a, b: a, w: 0 }; }
    const w = sm(clamp((t - (next.t - fade)) / fade)), b = table[next.v]; fields.forEach(f => out[f] = lerp(a[f], b[f], w)); return { out, a, b, w };
  }
  function gestureAt(t, keys) {
    let prev = keys[0], next = null; for (const k of keys) { if (k.t <= t) prev = k; else { next = k; break; } }
    const w = next ? sm(clamp((t - (next.t - 0.45)) / 0.45)) : 0, a = GEST[prev.v], b = next ? GEST[next.v] : a, o = {};
    ['L', 'R'].forEach(h => { const pa = POSES[a[h].p], pb = POSES[b[h].p]; o[h] = { x: lerp(a[h].x, b[h].x, w), y: lerp(a[h].y, b[h].y, w), r: lerp(a[h].r, b[h].r, w), c: pa.c.map((v, i) => lerp(v, pb.c[i], w)), s: lerp(pa.s, pb.s, w) }; });
    return o;
  }
  function arm(S, T, side) {   // upper arm hangs down/outward; forearm foreshortens as needed: no wings, no popped elbows
    const base = Math.PI / 2 - side * 0.1, toT = Math.atan2(T.y - S.y, T.x - S.x); let dl = toT - base; while (dl > Math.PI) dl -= 2 * Math.PI; while (dl < -Math.PI) dl += 2 * Math.PI;
    const k = 0.06 + 0.16 * clamp((260 - T.y) / 330), dir = base + k * dl, E = { x: S.x + L1 * Math.cos(dir), y: S.y + L1 * Math.sin(dir) };
    const vx = T.x - E.x, vy = T.y - E.y, d = Math.hypot(vx, vy) || 1, len = clamp(d, 110, L2); return { E, W: { x: E.x + vx / d * len, y: E.y + vy / d * len } };
  }
  function cap(c, x1, y1, x2, y2, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }

  function hand(c, h, side) {   // five fingers, palm + two-segment-looking capsules, foreshortened curl
    c.save(); c.rotate(h.r); if (side > 0) c.scale(-1, 1);
    const F = [{ x: 28, l: 62 }, { x: 10, l: 70 }, { x: -9, l: 64 }, { x: -27, l: 50 }];
    const pass = (col, grow) => { c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(-34, 10); c.quadraticCurveTo(-46, -34, -42, -74); c.lineTo(42, -74); c.quadraticCurveTo(46, -34, 34, 10); c.quadraticCurveTo(0, 26, -34, 10); c.closePath(); c.fill(); if (grow) { c.lineWidth = grow; c.stroke(); }
      F.forEach((f, i) => { const cu = h.c[i + 1], an = (1.5 - i) * h.s * 0.5, len = f.l * (0.28 + 0.72 * Math.cos(cu * 1.35)), bx = f.x, by = -70; c.lineWidth = 21 - i + (grow || 0); c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.sin(an) * len, by - Math.cos(an) * len); c.stroke(); });
      const tc = h.c[0], ta = 0.95 - tc + h.s * 0.3, tl = 58 - tc * 18; c.lineWidth = 24 + (grow || 0); c.beginPath(); c.moveTo(38, -8); c.lineTo(38 + Math.sin(ta) * tl, -8 - Math.cos(ta) * tl); c.stroke(); };
    pass(C.skinD, 7); pass(C.skin, 0); c.restore();
  }

  function head(c, t, o) {
    const eo = clamp(o.eye * ((t % 3.8) > 3.68 ? 0.1 : 1), 0.05, 1.2), lx = o.lookX, ly = o.lookY;
    // neck
    c.fillStyle = C.skinD; c.beginPath(); c.moveTo(-58, -120); c.lineTo(58, -120); c.lineTo(66, 8); c.lineTo(-66, 8); c.closePath(); c.fill();
    c.fillStyle = 'rgba(70,30,18,.30)'; c.beginPath(); c.ellipse(0, -96, 70, 30, 0, 0, Math.PI); c.fill();
    c.save(); c.translate(0, o.nod); c.rotate(o.tilt);
    // ears
    [-1, 1].forEach(sd => { c.fillStyle = C.skinD; c.beginPath(); c.ellipse(sd * 104, -176, 17, 31, 0, 0, 7); c.fill(); c.fillStyle = C.skin; c.beginPath(); c.ellipse(sd * 103, -176, 10, 22, 0, 0, 7); c.fill(); });
    // face: longer, defined jaw (adult proportions)
    const face = new Path2D('M-100 -196 C-102 -290 -58 -334 0 -334 C58 -334 102 -290 100 -196 C100 -148 94 -112 80 -86 C64 -58 40 -38 0 -36 C-40 -38 -64 -58 -80 -86 C-94 -112 -100 -148 -100 -196 Z');
    const g = c.createLinearGradient(-80, -320, 80, -40); g.addColorStop(0, C.skinL); g.addColorStop(0.55, C.skin); g.addColorStop(1, '#c58b66'); c.fillStyle = g; c.fill(face);
    // light, neat stubble (not a beard) + jaw shadow + cheek planes
    c.save(); c.clip(face); const sg = c.createLinearGradient(0, -120, 0, -34); sg.addColorStop(0, 'rgba(40,28,26,0)'); sg.addColorStop(1, 'rgba(40,28,26,.26)'); c.fillStyle = sg; c.fillRect(-110, -130, 220, 100);
    c.fillStyle = 'rgba(40,28,26,.10)'; c.beginPath(); c.ellipse(0, -112, 36, 13, 0, 0, 7); c.fill();   // faint moustache shadow
    c.fillStyle = 'rgba(120,70,45,.07)'; [-1, 1].forEach(sd => { c.beginPath(); c.ellipse(sd * 74, -118, 22, 40, sd * 0.2, 0, 7); c.fill(); }); c.restore();
    c.strokeStyle = 'rgba(110,60,40,.12)'; c.lineWidth = 3; c.lineCap = 'round'; [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * 36, -140); c.quadraticCurveTo(sd * 50, -118, sd * 44, -96); c.stroke(); });
    // nose
    c.strokeStyle = 'rgba(120,64,40,.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-6, -196); c.quadraticCurveTo(-13, -156, -23, -146); c.quadraticCurveTo(0, -130, 23, -146); c.stroke();
    c.fillStyle = 'rgba(80,40,25,.45)'; [-1, 1].forEach(sd => { c.beginPath(); c.ellipse(sd * 12, -141, 6, 4, 0, 0, 7); c.fill(); });
    // eyes + moderate brows
    [-1, 1].forEach(sd => { c.save(); c.translate(sd * 41, -200);
      c.fillStyle = '#f7efe4'; c.beginPath(); c.ellipse(0, 0, 22, 13 * eo, 0, 0, 7); c.fill(); c.save(); c.beginPath(); c.ellipse(0, 0, 22, 13 * eo, 0, 0, 7); c.clip();
      c.fillStyle = '#3b2418'; c.beginPath(); c.arc(lx * 6, ly * 3.5, 10.5, 0, 7); c.fill(); c.fillStyle = '#0c0707'; c.beginPath(); c.arc(lx * 6, ly * 3.5, 5.5, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(lx * 6 + 3.5, ly * 3.5 - 4, 2.6, 0, 7); c.fill(); c.restore();
      c.strokeStyle = 'rgba(40,24,20,.85)'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 22, 13 * eo, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.restore();
      const by = -232 - o.brow * 13; c.strokeStyle = C.hair; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(sd * 20, by + 5); c.quadraticCurveTo(sd * 46, by - 7 - o.brow * 5, sd * 70, by + 5 + o.brow * 3); c.stroke(); });
    // mouth: closed smile in pauses, opens only while speaking
    const my = -92, mo = o.mouth, sm_ = o.smile, mw = 36 + sm_ * 10;
    if (mo < 0.05) { c.strokeStyle = '#7d352c'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-mw, my - sm_ * 5); c.quadraticCurveTo(0, my + 5 + sm_ * 11, mw, my - sm_ * 5); c.stroke(); }
    else { const h = 7 + mo * 30; c.fillStyle = '#3a0f12'; c.beginPath(); c.moveTo(-mw * 0.8, my - 4); c.quadraticCurveTo(0, my - 8, mw * 0.8, my - 4); c.quadraticCurveTo(mw * 0.55, my + h + 3, 0, my + h + 7); c.quadraticCurveTo(-mw * 0.55, my + h + 3, -mw * 0.8, my - 4); c.fill();
      c.fillStyle = '#f5ede2'; c.beginPath(); c.moveTo(-mw * 0.62, my - 4); c.quadraticCurveTo(0, my - 7, mw * 0.62, my - 4); c.lineTo(mw * 0.55, my + 6); c.quadraticCurveTo(0, my + 3, -mw * 0.55, my + 6); c.fill(); c.fillStyle = '#c9585a'; c.beginPath(); c.ellipse(0, my + h, mw * 0.38, Math.min(10, h * 0.36), 0, Math.PI, 0); c.fill(); }
    // short neat hair, side part
    const hg = c.createLinearGradient(-100, -350, 100, -240); hg.addColorStop(0, C.hairL); hg.addColorStop(1, C.hair); c.fillStyle = hg; c.beginPath();
    c.moveTo(-104, -204); c.bezierCurveTo(-122, -306, -66, -356, 4, -356); c.bezierCurveTo(84, -356, 124, -306, 104, -204); c.bezierCurveTo(100, -236, 90, -256, 66, -268);
    c.bezierCurveTo(30, -250, -34, -270, -64, -258); c.bezierCurveTo(-86, -250, -98, -230, -104, -204); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.13)'; c.lineWidth = 5; c.beginPath(); c.moveTo(-70, -318); c.quadraticCurveTo(-20, -342, 40, -330); c.stroke();
    c.restore();
  }

  function torso(c, br) {
    c.save(); c.translate(0, br);
    const g = c.createLinearGradient(-260, 0, 260, 0); g.addColorStop(0, C.shirtD); g.addColorStop(0.3, C.shirt); g.addColorStop(0.75, C.shirt); g.addColorStop(1, C.shirtD);
    c.fillStyle = g; c.beginPath(); c.moveTo(-72, -10); c.bezierCurveTo(-150, -2, -222, 22, -250, 74); c.lineTo(-276, 760); c.lineTo(276, 760); c.lineTo(250, 74); c.bezierCurveTo(222, 22, 150, -2, 72, -10); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(16,30,52,.14)'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 60); c.lineTo(0, 700); c.stroke();             // placket
    c.fillStyle = C.mint; [150, 270, 390, 510].forEach(y => { c.beginPath(); c.arc(0, y, 8.5, 0, 7); c.fill(); });
    c.fillStyle = C.skinD; c.beginPath(); c.moveTo(-50, -12); c.lineTo(50, -12); c.lineTo(0, 78); c.closePath(); c.fill();            // open collar V
    // collar flaps
    [-1, 1].forEach(sd => { c.fillStyle = C.shirt; c.strokeStyle = 'rgba(16,30,52,.22)'; c.lineWidth = 4; c.beginPath(); c.moveTo(sd * 52, -22); c.lineTo(sd * 112, 20); c.lineTo(sd * 36, 92); c.lineTo(sd * 4, 62); c.closePath(); c.fill(); c.stroke(); });
    c.strokeStyle = 'rgba(16,30,52,.10)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-150, 290); c.quadraticCurveTo(-120, 380, -150, 520); c.moveTo(150, 280); c.quadraticCurveTo(122, 390, 156, 540); c.stroke();
    c.restore();
  }

  function drawArm(c, side, h, br) {
    const S = { x: side * SH, y: 64 }, { E, W } = arm(S, h, side), fa = Math.atan2(W.y - E.y, W.x - E.x);
    c.save(); c.translate(0, br);
    cap(c, S.x, S.y, E.x, E.y, 112, '#cdbfa7'); cap(c, S.x, S.y, E.x, E.y, 102, C.shirt);                                   // shirt sleeve
    cap(c, E.x, E.y, W.x, W.y, 70, C.skinD); cap(c, E.x, E.y, W.x, W.y, 62, C.skin);                                           // forearm
    cap(c, E.x + Math.cos(fa) * 6, E.y + Math.sin(fa) * 6, E.x + Math.cos(fa) * 20, E.y + Math.sin(fa) * 20, 76, C.teal);     // rolled cuff in brand teal
    c.save(); c.translate(W.x, W.y); hand(c, h, side); c.restore(); c.restore();
  }

  /* o: { enter:0..1, leave:0..1, moodKeys, gestKeys, lookKeys, speaking:0/1, starts:[island start times] } */
  function draw(c, t, o) {
    const enter = clamp(o.enter === undefined ? 1 : o.enter), leave = clamp(o.leave || 0); if (leave >= 1) return;
    const m = blendKeys(t, o.moodKeys, MOODS, ['brow', 'smile', 'eye']).out, look = o.lookKeys ? o.lookKeys.reduce((a, k) => (k.t <= t ? k : a), o.lookKeys[0]) : { x: 0, y: 0 };
    const lk = o.lookKeys ? { x: look.x, y: look.y } : { x: 0, y: 0 }, g = gestureAt(t, o.gestKeys);
    const speaking = o.speaking ? 1 : 0, mouth = speaking ? 0.22 + 0.7 * Math.abs(Math.sin(t * 12.1) * Math.sin(t * 4.7 + 1)) : 0;
    let nod = Math.sin(t * 1.1) * 1.2, tilt = Math.sin(t * 0.7) * 0.006; (o.starts || []).forEach(s => { const d = t - s; if (d >= 0 && d < 0.5) nod += 7 * Math.exp(-d * 7) * Math.sin(Math.min(1, d / 0.12) * Math.PI / 2); });   // small emphasis nod at each phrase onset
    const br = Math.sin(t * 1.7) * 3, dy = (1 - (1 - Math.pow(1 - enter, 3))) * 520 + (leave * leave) * 560;
    c.save(); c.translate(G.x, G.nb + dy); c.scale(G.s, G.s);
    c.fillStyle = 'rgba(8,16,30,.28)'; c.beginPath(); c.ellipse(0, 330, 320, 420, 0, 0, 7); c.fill();                             // soft depth shadow behind the torso
    torso(c, br); c.save(); c.translate(0, br * 0.6); head(c, t, { eye: m.eye, brow: m.brow, smile: m.smile, mouth, nod, tilt, lookX: lk.x, lookY: lk.y }); c.restore();
    drawArm(c, -1, g.L, br); drawArm(c, 1, g.R, br); c.restore();
  }
  return { draw, G, GEST, MOODS, headTopY: () => G.nb - 356 * G.s, mouthXY: () => ({ x: G.x, y: G.nb - 92 * G.s }) };
})();
