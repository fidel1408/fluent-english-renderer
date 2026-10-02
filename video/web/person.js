/* Vector character rig for Fluent English.
   Local coordinates: shoulder line y=0, body centre x=0, +y down. Units ~ px at scale 1.
   Arms use two-bone IK (shoulder -> elbow -> wrist) so every pose keeps natural limb proportions. */
(function () {
  const f = (n) => (Math.round(n * 10) / 10);
  const rot = (v, a) => ({ x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) });
  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const mul = (a, k) => ({ x: a.x * k, y: a.y * k });
  const len = (a) => Math.hypot(a.x, a.y);
  const norm = (a) => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };

  // two-bone IK; picks the elbow solution that sits lower (elbows hang down, close to the torso)
  function ik(S, W, a, b, outward) {
    let d = len(sub(W, S));
    const maxd = a + b - 2, mind = Math.abs(a - b) + 2;
    const dd = Math.min(maxd, Math.max(mind, d));
    const dir = norm(sub(W, S));
    const W2 = add(S, mul(dir, dd));
    const ca = (a * a + dd * dd - b * b) / (2 * a * dd);
    const al = Math.acos(Math.max(-1, Math.min(1, ca)));
    const e1 = add(S, mul(rot(dir, al), a)), e2 = add(S, mul(rot(dir, -al), a));
    // score: lower is better; mild bias toward the body centre side (outward>0 means away from centre)
    const sc = (e) => -e.y + (outward || 0) * 0;
    const E = sc(e1) < sc(e2) ? e1 : e2;
    return { E, W: W2 };
  }

  // solid capsule-chain (union of circles + quads; no outline) for arms / sleeves
  function chain(pts, ws, fill, extra) {
    let s = '';
    for (let i = 0; i < pts.length; i++) s += `<circle cx="${f(pts[i].x)}" cy="${f(pts[i].y)}" r="${f(ws[i] / 2)}" fill="${fill}"/>`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1], n = norm({ x: -(q.y - p.y), y: q.x - p.x });
      const a1 = add(p, mul(n, ws[i] / 2)), a2 = add(q, mul(n, ws[i + 1] / 2)), b2 = sub(q, mul(n, ws[i + 1] / 2)), b1 = sub(p, mul(n, ws[i] / 2));
      s += `<path d="M${f(a1.x)} ${f(a1.y)}L${f(a2.x)} ${f(a2.y)}L${f(b2.x)} ${f(b2.y)}L${f(b1.x)} ${f(b1.y)}Z" fill="${fill}"/>`;
    }
    return s;
  }
  // single closed outline for fingers: polyline with widths, round caps
  function tube(pts, ws) {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const prev = pts[Math.max(0, i - 1)], next = pts[Math.min(pts.length - 1, i + 1)];
      const t = norm(sub(next, prev)), n = { x: -t.y, y: t.x };
      L.push(add(pts[i], mul(n, ws[i] / 2))); R.push(sub(pts[i], mul(n, ws[i] / 2)));
    }
    const e = pts.length - 1, r1 = ws[e] / 2, r0 = ws[0] / 2;
    let d = `M${f(L[0].x)} ${f(L[0].y)}`;
    for (let i = 1; i <= e; i++) d += `L${f(L[i].x)} ${f(L[i].y)}`;
    d += `A${f(r1)} ${f(r1)} 0 0 0 ${f(R[e].x)} ${f(R[e].y)}`;
    for (let i = e - 1; i >= 0; i--) d += `L${f(R[i].x)} ${f(R[i].y)}`;
    d += `A${f(r0)} ${f(r0)} 0 0 0 ${f(L[0].x)} ${f(L[0].y)}Z`;
    return d;
  }

  const HANDS = {
    // kind: 'fan' (fingers extended, spread/curve params) | 'fist'
    open:  { kind: 'fan', spread: 1.0, bend: 0.10, thumb: 0.85, thumbBend: 0.18 },
    relax: { kind: 'fan', spread: 0.45, bend: 0.30, thumb: 0.55, thumbBend: 0.35 },
    flat:  { kind: 'fan', spread: 0.18, bend: 0.03, thumb: 0.45, thumbBend: 0.1 },
    fist:  { kind: 'fist' },
  };
  function lerpHand(a, b, k) { return k < 0.5 ? a : b; }
  // wrist at origin, fingers along +x, thumb on the +y*side edge
  function hand(W, ang, h, skin, shade, side, s) {
    s = s || 1;
    const stroke = `stroke="${shade}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
    let body = '';
    if (h.kind === 'fist') {
      // seen from the back of the hand: knuckle block, four folded fingers, thumb wrapped across
      body += `<path d="M-2 -22 Q-6 0 -2 22 Q2 30 14 31 L56 31 Q70 30 70 16 L70 -16 Q70 -30 56 -31 L14 -31 Q2 -30 -2 -22Z" fill="${skin}" ${stroke}/>`;
      for (let i = 0; i < 4; i++) {
        const y0 = -31 + i * 15.5;
        body += `<path d="M36 ${y0 + 1} Q70 ${y0 - 1} 71 ${y0 + 7} Q70 ${y0 + 15} 36 ${y0 + 14}Z" fill="${skin}" ${stroke}/>`;
      }
      const t = side > 0 ? 1 : -1;
      body += `<path d="${tube([{ x: 14, y: 27 * t }, { x: 38, y: 33 * t }, { x: 58, y: 24 * t }], [18, 16, 14])}" fill="${skin}" ${stroke}/>`;
    } else {
      const lens = [[26, 18, 15], [29, 20, 16], [26, 18, 15], [21, 14, 12]];
      const ys = [17, 5.7, -5.7, -17];                      // index .. pinky (index nearest the thumb)
      const fan = [0.20, 0.06, -0.08, -0.24];               // base fan angles toward the thumb side (index) .. away (pinky)
      let thumb = '';
      let a = h.thumb * side, p = { x: 14, y: 22 * side };
      const tp = [p], tw = [18];
      for (let j = 0; j < 2; j++) { a -= h.thumbBend * side; p = add(p, rot({ x: j ? 22 : 28, y: 0 }, a)); tp.push(p); tw.push(j ? 14.5 : 16.5); }
      thumb = `<path d="${tube(tp, tw)}" fill="${skin}" ${stroke}/>`;
      let fingers = '';
      for (const i of [3, 2, 1, 0]) {
        let aa = fan[i] * h.spread * side, q = { x: 48, y: ys[i] * side };
        const pts = [q], ws = [14 - i * 0.5];
        for (let j = 0; j < 3; j++) { aa += h.bend * side * (j === 0 ? 0.6 : 1); q = add(q, rot({ x: lens[i][j], y: 0 }, aa)); pts.push(q); ws.push(13.2 - i * 0.5 - j * 0.9); }
        fingers += `<path d="${tube(pts, ws)}" fill="${skin}" ${stroke}/>`;
      }
      body += thumb;
      body += `<path d="M-4 -23 Q-8 0 -4 23 Q0 30 14 30 L52 28 L52 -28 L14 -29 Q0 -29 -4 -23Z" fill="${skin}" ${stroke}/>`;
      body += `<path d="M14 -4 Q20 8 14 20" fill="none" stroke="${shade}" stroke-width="1.6" opacity=".4" stroke-linecap="round"/>`;
      body += fingers;
    }
    return `<g transform="translate(${f(W.x)} ${f(W.y)}) rotate(${f(ang * 180 / Math.PI)}) scale(${s})">${body}</g>`;
  }

  // ----- drawing a person -----
  const STYLES = {
    male:   { skin: '#C98E66', shade: '#A8704C', hair: '#241A17', brow: '#2A1D18', beard: true, tee: '#14A89C', over: '#16305A', overDark: '#0F2444', cuff: '#F6EEDC', sh: 1, hairStyle: 'short' },
    manB:   { skin: '#8E5B3E', shade: '#734530', hair: '#15100F', brow: '#1B1311', beard: false, tee: '#F2B544', over: '#0F2444', overDark: '#0A1B36', cuff: '#F6EEDC', sh: 1, hairStyle: 'short' },
    womanA: { skin: '#D9A07C', shade: '#B97E5B', hair: '#2B1C18', brow: '#2A1D18', beard: false, tee: '#FF6B57', over: '#1B3A66', overDark: '#10284B', cuff: '#F6EEDC', sh: 0.82, hairStyle: 'long' },
    womanB: { skin: '#B97B58', shade: '#9A6141', hair: '#4A2A1C', brow: '#2A1D18', beard: false, tee: '#F6EEDC', over: '#14A89C', overDark: '#0E857B', cuff: '#F6EEDC', sh: 0.8, hairStyle: 'bun' },
  };

  function head(st, ex) {
    const o = [];
    const gx = (ex.gaze ? ex.gaze.x : 0), gy = (ex.gaze ? ex.gaze.y : 0);
    const blink = ex.blink || 0, brow = ex.brow || 0, smile = ex.smile == null ? 0.4 : ex.smile, mo = ex.mouth || 0, tilt = ex.browTilt || 0;
    const fem = st.hairStyle !== 'short';
    // back hair for long styles
    if (st.hairStyle === 'long') o.push(`<path d="M-98 -205 C-120 -330 120 -330 98 -205 C112 -140 104 -80 90 -48 L-90 -48 C-104 -80 -112 -140 -98 -205Z" fill="${st.hair}"/>`);
    if (st.hairStyle === 'bun') o.push(`<circle cx="0" cy="-322" r="42" fill="${st.hair}"/>`);
    // ears
    o.push(`<ellipse cx="-88" cy="-176" rx="14" ry="22" fill="${st.skin}"/><ellipse cx="88" cy="-176" rx="14" ry="22" fill="${st.skin}"/>`);
    o.push(`<ellipse cx="-88" cy="-176" rx="6" ry="12" fill="${st.shade}" opacity=".55"/><ellipse cx="88" cy="-176" rx="6" ry="12" fill="${st.shade}" opacity=".55"/>`);
    // face: defined jaw, slightly squared chin for male
    const jaw = fem
      ? `M-84 -200 C-86 -272 -50 -296 0 -296 C50 -296 86 -272 84 -200 C83 -140 66 -98 38 -82 C16 -72 -16 -72 -38 -82 C-66 -98 -83 -140 -84 -200Z`
      : `M-88 -200 C-90 -272 -52 -296 0 -296 C52 -296 90 -272 88 -200 C88 -146 78 -104 52 -86 C28 -72 -28 -72 -52 -86 C-78 -104 -88 -146 -88 -200Z`;
    o.push(`<path d="${jaw}" fill="${st.skin}"/>`);
    // cheek warmth + jaw shadow
    o.push(`<ellipse cx="-52" cy="-132" rx="22" ry="12" fill="#E8836B" opacity=".25"/><ellipse cx="52" cy="-132" rx="22" ry="12" fill="#E8836B" opacity=".25"/>`);
    // beard (male)
    if (st.beard) {
      o.push(`<path d="M-88 -170 C-90 -120 -70 -84 -44 -78 C-20 -70 20 -70 44 -78 C70 -84 90 -120 88 -170 C80 -140 70 -128 56 -122 C40 -112 20 -108 0 -108 C-20 -108 -40 -112 -56 -122 C-70 -128 -80 -140 -88 -170Z" fill="${st.hair}" opacity=".92"/>`);
      // moustache
      o.push(`<path d="M-34 -126 C-20 -140 -6 -132 0 -128 C6 -132 20 -140 34 -126 C22 -118 8 -118 0 -122 C-8 -118 -22 -118 -34 -126Z" fill="${st.hair}"/>`);
    }
    // hair
    if (st.hairStyle === 'short') {
      o.push(`<path d="M-94 -196 C-104 -312 -34 -330 12 -326 C74 -322 108 -290 94 -196 C90 -226 80 -246 56 -258 C30 -240 -20 -250 -52 -240 C-72 -232 -86 -220 -94 -196Z" fill="${st.hair}"/>`);
      o.push(`<path d="M-30 -300 C0 -312 40 -308 70 -286" stroke="#fff" stroke-opacity=".10" stroke-width="6" fill="none" stroke-linecap="round"/>`);
    } else {
      o.push(`<path d="M-90 -196 C-102 -318 100 -318 90 -196 C84 -250 40 -272 0 -246 C-40 -272 -84 -250 -90 -196Z" fill="${st.hair}"/>`);
    }
    // brows
    const by = -222 - brow * 10;
    o.push(`<path d="M-62 ${by + 4 + tilt * 6} Q-40 ${by - 8} -14 ${by + 2 - tilt * 6}" stroke="${st.brow}" stroke-width="${fem ? 6 : 9}" fill="none" stroke-linecap="round"/>`);
    o.push(`<path d="M62 ${by + 4 + tilt * 6} Q40 ${by - 8} 14 ${by + 2 - tilt * 6}" stroke="${st.brow}" stroke-width="${fem ? 6 : 9}" fill="none" stroke-linecap="round"/>`);
    // eyes
    for (const sx of [-1, 1]) {
      const cx = sx * 36, cy = -190, ry = 10 * (1 - blink * 0.92);
      o.push(`<ellipse cx="${cx}" cy="${cy}" rx="16" ry="${f(Math.max(1, ry))}" fill="#fff"/>`);
      if (blink < 0.7) {
        o.push(`<circle cx="${f(cx + gx * 6)}" cy="${f(cy + gy * 3)}" r="${f(7.5 * (1 - blink * 0.5))}" fill="#3A2418"/><circle cx="${f(cx + gx * 6)}" cy="${f(cy + gy * 3)}" r="3.4" fill="#0C0705"/><circle cx="${f(cx + gx * 6 + 2.6)}" cy="${f(cy + gy * 3 - 2.8)}" r="1.9" fill="#fff"/>`);
      }
      o.push(`<path d="M${cx - 17} ${cy} Q${cx} ${f(cy - ry * 1.9)} ${cx + 17} ${cy}" stroke="${st.hair}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
      if (fem) o.push(`<path d="M${cx + sx * 15} ${cy - 1} l${sx * 6} -4" stroke="${st.hair}" stroke-width="2.5" stroke-linecap="round"/>`);
    }
    // nose
    o.push(`<path d="M-4 -176 C-12 -150 -18 -142 -10 -134 C-4 -128 4 -128 10 -134 C18 -142 12 -150 4 -176" fill="${st.shade}" opacity=".35"/>`);
    o.push(`<path d="M-14 -134 Q0 -124 14 -134" stroke="${st.shade}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
    // mouth
    const my = st.beard ? -108 : -112;
    const w = 26 + smile * 12, up = smile * 14;
    if (mo > 0.08) {
      const h = 6 + mo * 22;
      o.push(`<path d="M${-w} ${my} Q0 ${my + up + 4} ${w} ${my} Q0 ${my + h + 6} ${-w} ${my}Z" fill="#5A1E22"/>`);
      o.push(`<path d="M${-w + 5} ${my + 1} Q0 ${my + up + 5} ${w - 5} ${my + 1} L${w - 7} ${my + 6} Q0 ${my + 9} ${-w + 7} ${my + 6}Z" fill="#fff" opacity=".95"/>`);
      o.push(`<path d="M${-w + 8} ${my + h * 0.8 + 3} Q0 ${my + h * 0.5} ${w - 8} ${my + h * 0.8 + 3} Q0 ${my + h + 5} ${-w + 8} ${my + h * 0.8 + 3}Z" fill="#C85A55"/>`);
    } else {
      o.push(`<path d="M${-w} ${my} Q0 ${my + up * 1.2 + 2} ${w} ${my}" stroke="${st.beard ? '#E7A6A0' : '#B24F4F'}" stroke-width="6" fill="none" stroke-linecap="round"/>`);
    }
    return o.join('');
  }

  /* opts: {style, x, y, scale, flip,
            armL:{W:{x,y}, hand:'open'|..., handAng}, armR:{...}, head:{tilt, gaze, blink, brow, smile, mouth}, breath, lean} */
  function person(opts) {
    const st = STYLES[opts.style || 'male'];
    const sh = st.sh;
    const o = [];
    const breath = opts.breath || 0, lean = opts.lean || 0;
    const SW = 182 * sh; // shoulder half-width (broad, masculine)
    const shoulderY = 52;
    const armDefs = [{ k: 'armL', side: -1 }, { k: 'armR', side: 1 }];
    const A = 232 * (0.88 + 0.12 * sh), B = 204 * (0.88 + 0.12 * sh);
    const armsGeo = {};
    const D2R = Math.PI / 180;
    for (const d of armDefs) {
      const cfg = opts[d.k] || {};
      const u = (cfg.u == null ? 4 : cfg.u) * D2R, fa = (cfg.f == null ? -35 : cfg.f) * D2R;
      const S = { x: d.side * SW, y: shoulderY };
      const E = add(S, { x: d.side * Math.sin(u) * A * (cfg.us || 1), y: Math.cos(u) * A * (cfg.us || 1) });
      const W = add(E, { x: d.side * Math.sin(fa) * B * (cfg.fs || 1), y: Math.cos(fa) * B * (cfg.fs || 1) });
      armsGeo[d.k] = { S, E, W, cfg, side: d.side, fa };
    }
    // --- draw order: back arm(s) not needed (front view). torso first.
    const torsoPath = `M${-48 * sh} -30 C${-80 * sh} -26 ${-150 * sh} -6 ${-200 * sh} 50 C${-214 * sh} 110 ${-176 * sh} 360 ${-156 * sh} 560 L${156 * sh} 560 C${176 * sh} 360 ${214 * sh} 110 ${200 * sh} 50 C${150 * sh} -6 ${80 * sh} -26 ${48 * sh} -30Z`;
    // neck
    o.push(`<g transform="translate(0 ${f(lean * -4)})">`);
    o.push(`<path d="M-38 -90 L-40 -10 Q0 26 40 -10 L38 -90Z" fill="${st.skin}"/><path d="M-40 -48 Q0 -14 40 -48 L40 -10 Q0 26 -40 -10Z" fill="${st.shade}" opacity=".55"/>`);
    o.push(`</g>`);
    o.push(`<g transform="translate(0 ${f(breath * 3)})">`);
    // tee + overshirt
    o.push(`<path d="${torsoPath}" fill="${st.tee}"/>`);
    // open overshirt panels
    const ps = (x) => f(x * sh);
    o.push(`<path d="M${ps(-48)} -30 C${ps(-80)} -26 ${ps(-150)} -6 ${ps(-200)} 50 C${ps(-214)} 110 ${ps(-176)} 360 ${ps(-156)} 560 L${ps(-60)} 560 C${ps(-54)} 400 ${ps(-50)} 190 ${ps(-18)} 6 Z" fill="${st.over}"/>`);
    o.push(`<path d="M${ps(48)} -30 C${ps(80)} -26 ${ps(150)} -6 ${ps(200)} 50 C${ps(214)} 110 ${ps(176)} 360 ${ps(156)} 560 L${ps(60)} 560 C${ps(54)} 400 ${ps(50)} 190 ${ps(18)} 6 Z" fill="${st.over}"/>`);
    // collar + neckline of tee
    o.push(`<path d="M-40 -14 Q0 40 40 -14 L30 0 Q0 52 -30 0Z" fill="${st.tee}"/>`);
    o.push(`<path d="M${ps(-48)} -30 L${ps(-18)} 6 L${ps(-66)} 34 Z" fill="${st.overDark}"/><path d="M${ps(48)} -30 L${ps(18)} 6 L${ps(66)} 34 Z" fill="${st.overDark}"/>`);
    // chest pocket + seam shading
    o.push(`<path d="M${ps(-140)} 190 h${ps(56)} v${ps(60)} q${ps(-28)} ${ps(14)} ${ps(-56)} 0z" fill="${st.overDark}" opacity=".5"/>`);
    o.push(`<path d="M${ps(-50)} 40 C${ps(-50)} 190 ${ps(-52)} 400 ${ps(-60)} 560" stroke="${st.overDark}" stroke-width="5" fill="none" opacity=".6"/><path d="M${ps(50)} 40 C${ps(50)} 190 ${ps(52)} 400 ${ps(60)} 560" stroke="${st.overDark}" stroke-width="5" fill="none" opacity=".6"/>`);
    o.push(`</g>`);
    // head (rotates about the neck base)
    const hd = opts.head || {};
    o.push(`<g transform="translate(${f((hd.dx || 0) + lean * 8)} ${f(breath * 2 + (hd.dy || 0))}) rotate(${f(hd.tilt || 0)} 0 -70) translate(0 -70) scale(0.84) translate(0 70)">${head(st, hd)}</g>`);
    const A2 = [];
    // arms on top of torso
    for (const d of armDefs) {
      const g = armsGeo[d.k], cfg = g.cfg;
      const k = 0.88 + 0.12 * sh;
      const wU = 84 * k, wE = 66 * k, wW = 40 * k;
      const T = 0.50, mid = add(g.E, mul(sub(g.W, g.E), T));   // sleeve ends mid-forearm
      const wMid = wE + (wW - wE) * T;
      const dirF = norm(sub(g.W, g.E)), nF = { x: -dirF.y, y: dirF.x };
      const c1 = add(mid, mul(dirF, 14));
      const band = (p, q, w) => `<path d="M${f(p.x + nF.x * w / 2)} ${f(p.y + nF.y * w / 2)}L${f(q.x + nF.x * w / 2)} ${f(q.y + nF.y * w / 2)}L${f(q.x - nF.x * w / 2)} ${f(q.y - nF.y * w / 2)}L${f(p.x - nF.x * w / 2)} ${f(p.y - nF.y * w / 2)}Z"`;
      A2.push(`<g>`);
      A2.push(chain([g.E, g.W], [wE - 6, wW], st.skin));
      // forearm shade (underside) for volume
      A2.push(chain([mid, g.W], [wMid * 0.5, wW * 0.5], st.shade).replace(/fill=/g, 'opacity=".28" fill='));
      A2.push(chain([g.S, g.E, mid], [wU, wE + 8, wMid + 8], st.over));
      A2.push(band(mid, c1, wMid + 10) + ` fill="${st.cuff}"/>`);
      A2.push(`<path d="M${f(g.E.x)} ${f(g.E.y)}" fill="none"/>`);
      const h = cfg.hand ? (typeof cfg.hand === 'string' ? HANDS[cfg.hand] : cfg.hand) : HANDS.relax;
      const fang = Math.atan2(dirF.y, dirF.x), ang = fang + (cfg.handRot || 0) * D2R;
      A2.push(hand(g.W, ang, h, st.skin, st.shade, cfg.thumbSide != null ? cfg.thumbSide : (d.side > 0 ? -1 : 1), cfg.hs || 1.3));
      A2.push(`</g>`);
    }
    const out = `<g transform="translate(${f(opts.x || 0)} ${f(opts.y || 0)}) scale(${(opts.flip ? -1 : 1) * (opts.scale || 1)} ${opts.scale || 1})">${(opts.part === 'arms' ? A2 : opts.part === 'body' ? o : o.concat(A2)).join('')}</g>`;
    return out;
  }
  window.Person = { person, hand, HANDS, lerpHand, ik, STYLES };
})();
