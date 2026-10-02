/* Fluent English – "¿Te bloqueas al hablar?" 30 s reel. Deterministic: frame(t, mode) -> SVG markup. */
(function () {
  const TL = window.TIMELINE, P = window.Person;
  const W = 1080, H = 1920;
  const C = { navy: '#0B1F3A', navy2: '#13294B', navy3: '#1B3A66', ivory: '#FBF5E9', ivory2: '#F1E7D2', teal: '#14B8A6', tealD: '#0B7F78', tealL: '#7FE3D6', coral: '#FF6B57', gold: '#F2B544', ink: '#0B1F3A' };
  const SANS = "'Plus Jakarta Sans','Helvetica Neue',Arial,sans-serif", IPAF = "'Gentium Plus','DejaVu Sans',serif";
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const eo = (x) => 1 - Math.pow(1 - x, 3), ei = (x) => x * x * x, eio = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eb = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const f1 = (n) => Math.round(n * 10) / 10;

  // ---------- text measuring ----------
  let _cv; const _mc = {};
  function mw(text, size, weight, family) {
    const key = text + '|' + size + '|' + weight + '|' + family;
    if (_mc[key] != null) return _mc[key];
    _cv = _cv || document.createElement('canvas').getContext('2d');
    _cv.font = `${weight} ${size}px ${family || SANS}`;
    return (_mc[key] = _cv.measureText(text).width);
  }
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function text(x, y, s, o) {
    o = o || {};
    return `<text x="${f1(x)}" y="${f1(y)}" font-family="${o.family || SANS}" font-size="${o.size || 48}" font-weight="${o.weight || 800}" fill="${o.fill || C.ink}" text-anchor="${o.anchor || 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op != null ? ` opacity="${f1(o.op * 100) / 100}"` : ''}${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 8}" paint-order="stroke" stroke-linejoin="round"` : ''}>${esc(s)}</text>`;
  }
  const g = (inner, o) => { o = o || {}; const tr = []; if (o.x != null || o.y != null) tr.push(`translate(${f1(o.x || 0)} ${f1(o.y || 0)})`); if (o.rot) tr.push(`rotate(${f1(o.rot)})`); if (o.s != null && o.s !== 1) tr.push(`scale(${f1(o.s * 1000) / 1000})`); return `<g${tr.length ? ` transform="${tr.join(' ')}"` : ''}${o.op != null && o.op < 1 ? ` opacity="${f1(o.op * 1000) / 1000}"` : ''}${o.clip ? ` clip-path="url(#${o.clip})"` : ''}>${inner}</g>`; };
  const rr = (x, y, w, h, r, fill, extra) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${r}" fill="${fill}" ${extra || ''}/>`;

  // ---------- shared defs ----------
  const DEFS = `<defs>
    <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1A33"/><stop offset=".6" stop-color="#10294A"/><stop offset="1" stop-color="#0E2F4A"/></linearGradient>
    <linearGradient id="gDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBF1"/><stop offset="1" stop-color="#F3E8D2"/></linearGradient>
    <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5A3B"/><stop offset=".08" stop-color="#6E452D"/><stop offset="1" stop-color="#4A2D1E"/></linearGradient>
    <linearGradient id="gTealC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#18C3B0"/><stop offset="1" stop-color="#0B7F78"/></linearGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D8FD6"/><stop offset="1" stop-color="#BFE6F5"/></linearGradient>
    <linearGradient id="gWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1C3F6E"/><stop offset=".7" stop-color="#E58A5B"/><stop offset="1" stop-color="#F7C873"/></linearGradient>
    <radialGradient id="gWarm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD58A" stop-opacity=".55"/><stop offset="1" stop-color="#FFD58A" stop-opacity="0"/></radialGradient>
    <radialGradient id="gTealGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#14B8A6" stop-opacity=".45"/><stop offset="1" stop-color="#14B8A6" stop-opacity="0"/></radialGradient>
    <radialGradient id="gVig" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#06142A" flood-opacity=".35"/></filter>
    <clipPath id="cardClip"><rect x="0" y="0" width="200" height="200" rx="34"/></clipPath>
  </defs>`;

  // ---------- caption layer ----------
  function wrapLines(s, size, maxW) {
    const words = s.split(' '); if (mw(s, size, 800) <= maxW) return [s];
    let best = null;
    for (let i = 1; i < words.length; i++) { const a = words.slice(0, i).join(' '), b = words.slice(i).join(' '); const m = Math.max(mw(a, size, 800), mw(b, size, 800)); if (!best || m < best.m) best = { m, l: [a, b] }; }
    return best.l;
  }
  function captions(t, mode, skipFn) {
    if (mode === 'off') return '';
    let out = '';
    for (const c of TL.captions) {
      if (t < c.t0 || t > c.t1 + 0.15) continue;
      if (skipFn && skipFn(c)) continue;
      const a = Math.min(seg(t, c.t0, c.t0 + 0.14), 1 - seg(t, c.t1, c.t1 + 0.15));
      const size = 62, lines = wrapLines(c.text, size, 900), lh = 76;
      const bw = Math.max(...lines.map((l) => mw(l, size, 800))) + 76, bh = lines.length * lh + 34;
      const cy = 1415 - (lines.length - 1) * lh / 2;  // block centre sits well above the Reels UI zone
      let s = rr(540 - bw / 2, cy - bh / 2 - 8, bw, bh, 30, 'rgba(8,22,44,.84)');
      lines.forEach((l, i) => { s += text(540, cy - ((lines.length - 1) * lh) / 2 + i * lh + 22, l, { size, fill: C.ivory, weight: 800 }); });
      out += g(s, { op: a, y: (1 - eo(a)) * 14 });
    }
    return out;
  }

  // ---------- phrase layout (shared by S2/S3) ----------
  const WORDS = ["I'd", 'like', 'to', 'learn', 'English.'];
  function phraseLayout(size, y1, y2) {
    const sp = size * 0.28, lines = [[0, 1, 2], [3, 4]], res = [];
    lines.forEach((ids, li) => {
      const ws = ids.map((i) => mw(WORDS[i], size, 800)), tot = ws.reduce((a, b) => a + b, 0) + sp * (ids.length - 1);
      let x = 540 - tot / 2;
      ids.forEach((i, k) => { res[i] = { x: x + ws[k] / 2, y: li ? y2 : y1, w: ws[k] }; x += ws[k] + sp; });
    });
    return res;
  }

  // ---------- scene 1: the block ----------
  function bgOffice(t) {
    let s = `<rect width="${W}" height="${H}" fill="url(#gNight)"/>`;
    // window with city dusk
    s += rr(70, 330, 360, 560, 26, '#0A1A33');
    s += `<g clip-path="url(#winClip)"><rect x="82" y="342" width="336" height="536" fill="url(#gWin)"/>`;
    const bl = [[92, 700, 54, 180], [150, 640, 46, 240], [200, 720, 60, 160], [264, 600, 48, 280], [316, 680, 56, 200], [376, 640, 40, 240]];
    bl.forEach((b, i) => { s += rr(b[0], b[1] + 0, b[2], b[3], 4, '#0C1D38'); for (let k = 0; k < 6; k++) if ((i * 3 + k) % 3) s += rr(b[0] + 8 + (k % 2) * 20, b[1] + 14 + Math.floor(k / 2) * 28, 9, 12, 2, '#FFD58A', 'opacity=".75"'); });
    s += `</g><rect x="82" y="342" width="336" height="536" rx="20" fill="none" stroke="#2A4C7C" stroke-width="10"/><path d="M250 342V878M82 610H418" stroke="#2A4C7C" stroke-width="8"/>`;
    // bookshelf
    s += rr(690, 420, 330, 12, 4, '#6E452D') + rr(690, 640, 330, 12, 4, '#6E452D');
    const cols = [C.coral, C.teal, C.gold, '#6C8EBF', C.ivory2, C.coral, C.teal, C.gold, '#6C8EBF'];
    cols.forEach((c, i) => { const h = 150 + (i * 37 % 40); s += rr(706 + i * 33, 420 - h, 26, h, 3, c, 'opacity=".9"'); });
    [0, 1, 2, 3, 4, 5].forEach((i) => { const h = 130 + (i * 23 % 50); s += rr(712 + i * 40, 640 - h, 30, h, 3, cols[(i + 3) % 9], 'opacity=".85"'); });
    s += `<circle cx="946" cy="560" r="34" fill="${C.gold}" opacity=".9"/><path d="M946 526v68M912 560h68" stroke="#B9822A" stroke-width="3" opacity=".6"/>`;
    // pendant lamp + glow
    s += `<path d="M540 0V250" stroke="#1C3A63" stroke-width="5"/><path d="M470 330 Q540 230 610 330Z" fill="${C.gold}"/><ellipse cx="540" cy="620" rx="520" ry="620" fill="url(#gWarm)" opacity="${f1(0.55 + Math.sin(t * 1.3) * 0.03)}"/>`;
    // bokeh
    for (let i = 0; i < 9; i++) { const x = (i * 131 + 40) % 1000 + Math.sin(t * .4 + i) * 10, y = 180 + (i * 97) % 420 + Math.cos(t * .5 + i) * 8; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${14 + (i % 3) * 9}" fill="${i % 2 ? C.teal : C.gold}" opacity=".10"/>`; }
    return s;
  }
  function desk(topY, objs) {
    let s = `<rect x="-20" y="${topY}" width="1120" height="${H - topY + 40}" fill="url(#gWood)"/>`;
    s += `<rect x="-20" y="${topY}" width="1120" height="10" fill="#A87450" opacity=".55"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="M-20 ${topY + 60 + i * 55}H1100" stroke="#3A2214" stroke-width="2" opacity=".35"/>`;
    return s + (objs || '');
  }
  function laptopBack(x, y, glow) {
    return g(`<ellipse cx="170" cy="150" rx="260" ry="60" fill="#000" opacity=".25" filter="url(#soft)"/>${rr(10, 0, 330, 200, 14, '#C9CED6')}${rr(10, 0, 330, 200, 14, 'none', 'stroke="#9AA3B2" stroke-width="3"')}<circle cx="175" cy="100" r="22" fill="#EEF1F5"/>${rr(-10, 196, 370, 16, 8, '#AEB6C4')}`, { x, y });
  }
  function mug(x, y) { return g(`<ellipse cx="50" cy="124" rx="70" ry="14" fill="#000" opacity=".25"/>${rr(10, 20, 80, 100, 14, C.ivory)}<path d="M90 44c34-4 34 52 0 52" fill="none" stroke="${C.ivory}" stroke-width="12"/>${rr(10, 20, 80, 22, 11, C.coral)}<path d="M36 6c-8-14 8-18 0-32M60 8c-8-14 8-18 0-32" stroke="#fff" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>`, { x, y }); }

  function blinkAt(t, times) { for (const b of times) { const d = Math.abs(t - b); if (d < 0.09) return 1 - d / 0.09; } return 0; }

  // pose param interpolation
  function mixArm(a, b, k) { const o = {}; for (const key of ['u', 'us', 'f', 'fs', 'handRot']) { const va = a[key] == null ? (key === 'us' || key === 'fs' ? 1 : 0) : a[key], vb = b[key] == null ? (key === 'us' || key === 'fs' ? 1 : 0) : b[key]; o[key] = lerp(va, vb, k); } o.hand = k < 0.5 ? a.hand : b.hand; return o; }
  const ARM_REST = { u: 4, f: -34, hand: 'relax' };
  const ARM_CHIN = { u: -12, us: .5, f: -156, fs: 1.0, hand: 'fist' };
  const ARM_PRESENT = { u: 5, f: 82, fs: .8, hand: 'open', handRot: -6 };
  const ARM_PRESENT_L = { u: 5, f: 58, fs: .8, hand: 'open', handRot: -4 };
  const ARM_DESK_R = { u: 3, f: -30, hand: 'flat', handRot: 52 }, ARM_DESK_L = { u: 3, f: -30, hand: 'flat', handRot: -52 };

  function hero(t, x, oy, s, pose) {
    return P.person(Object.assign({ x, y: oy, scale: s, style: 'male', breath: Math.sin(t * 2.0) }, pose));
  }

  function scene1(t) {
    const s = 0.95, topY = 1250 + (t > 3.9 ? ei(seg(t, 3.9, 4.5)) * 40 : 0);
    const camZoom = 1 + 0.03 * (1 - seg(t, 0, 4.2));
    let o = bgOffice(t);
    // pose over time
    const bob = t > 1.45 && t < 2.05 ? Math.sin((t - 1.45) / 0.6 * Math.PI) : 0;
    const chin = eio(seg(t, 2.0, 2.65)) * (1 - eio(seg(t, 3.95, 4.3)));
    const listening = 1 - eio(seg(t, 1.9, 2.5));
    const armR = mixArm(ARM_DESK_R, ARM_CHIN, chin), armL = mixArm(ARM_DESK_L, ARM_DESK_L, 0);
    const pause = eio(seg(t, 1.9, 2.5));
    const head = { tilt: lerp(3, -4, pause) + Math.sin(t * 1.1) * 0.6, dy: bob * 7, dx: 0, brow: lerp(0.1, 0.65, pause) + bob * .2, browTilt: pause * 0.5,
      smile: lerp(0.45, 0.02, pause) + bob * 0.25, mouth: 0, gaze: { x: lerp(0.9, -0.9, pause), y: lerp(-0.4, -1, pause) },
      blink: blinkAt(t, [0.9, 2.35, 3.3]) };
    // light bloom behind character during the pause
    o += g(`<circle cx="540" cy="760" r="${f1(420 + pause * 40)}" fill="url(#gTealGlow)" opacity="${f1(pause * 0.9)}"/>`);
    const oy1 = topY - 400 * s, pose1 = { armL: Object.assign({}, armL, { hs: 1.3 }), armR: Object.assign({}, armR, { hs: 1.3 }), head };
    o += hero(t, 540, oy1, s, Object.assign({ part: 'body' }, pose1));
    o += desk(topY, laptopBack(90, topY - 190) + mug(820, topY - 105));
    o += hero(t, 540, oy1, s, Object.assign({ part: 'arms' }, pose1));
    // incoming question bubble
    const a1 = eb(seg(t, 0.25, 0.75)) * (1 - seg(t, 2.0, 2.3));
    if (a1 > 0.01) {
      const bx = 645, by = 600, bw = 370, bh = 150;
      o += g(`<g filter="url(#shadow)">${rr(0, 0, bw, bh, 40, C.ivory)}<path d="M40 ${bh - 4}L10 ${bh + 44}L96 ${bh - 4}Z" fill="${C.ivory}"/></g>` +
        `<circle cx="64" cy="${bh / 2}" r="26" fill="${C.teal}"/><path d="M50 ${bh / 2}q14-16 28 0q-14 16-28 0" fill="none" stroke="#fff" stroke-width="4"/>` +
        text(96, 64, 'What would you', { size: 33, anchor: 'start', fill: C.ink }) + text(96, 108, 'like to do?', { size: 33, anchor: 'start', fill: C.ink }), { x: bx, y: by, s: .6 + .4 * a1, op: clamp(a1 * 1.4) });
      // soft incoming-question ripple
      const rp = seg(t, 0.2, 0.9); o += `<circle cx="${bx + bw - 30}" cy="${by + 10}" r="${f1(14 + rp * 60)}" fill="none" stroke="${C.tealL}" stroke-width="5" opacity="${f1((1 - rp) * 0.8)}"/>`;
    }
    // understood check
    const ck = eb(seg(t, 1.5, 1.95)) * (1 - seg(t, 2.35, 2.6));
    if (ck > 0.01) o += g(`<circle r="46" fill="${C.teal}" filter="url(#shadow)"/><path d="M-20 2L-6 16L22-14" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`, { x: 880, y: 540, s: ck, op: clamp(ck * 2) });
    // unfinished words cluster
    const wa = seg(t, 2.35, 2.9) * (1 - seg(t, 3.85, 4.2));
    if (wa > 0.01) {
      const bits = [['I’d…', 190, 700, -8, 54], ['to…', 330, 610, 6, 46], ['like…', 190, 560, 4, 44], ['…?', 345, 730, -4, 60]];
      bits.forEach((b, i) => {
        const w = mw(b[0], b[4], 800) + 50, k = eb(clamp((t - 2.4 - i * 0.12) / 0.4));
        const fy = Math.sin(t * 1.6 + i * 1.7) * 7;
        o += g(rr(-w / 2, -b[4] * .7, w, b[4] * 1.3, b[4] * .65, 'rgba(11,31,58,.55)', `stroke="${C.tealL}" stroke-opacity=".7" stroke-width="3" stroke-dasharray="${i % 2 ? '10 8' : '0'}"`) + text(0, b[4] * .3, b[0], { size: b[4], fill: C.ivory, weight: 700, op: .92 }), { x: b[1] + 560 * 0 + (i < 2 ? 0 : 0), y: b[2] + fy, rot: b[3], s: k, op: clamp(wa * 1.6) });
      });
    }
    // hook headline
    const ha = eb(seg(t, 0.3, 0.8)) * (1 - seg(t, 3.9, 4.15));
    o += hookText(ha, t);
    return g(o, { x: 540 * (1 - camZoom), y: 900 * (1 - camZoom), s: camZoom });
  }
  function hookText(a, t) {
    if (a <= 0.01) return '';
    const l1 = '¿TE BLOQUEAS', l2 = 'AL HABLAR?';
    const size = 118, w2 = mw(l2, size, 800);
    let s = text(540, 350, l1, { size, fill: C.ivory, stroke: C.navy, sw: 14 }) + text(540, 470, l2, { size, fill: C.teal, stroke: C.navy, sw: 14 });
    s += rr(540 - w2 / 2, 494, w2 * seg(t, 0.55, 1.1), 14, 7, C.gold);
    return g(s, { op: clamp(a * 1.5), y: (1 - clamp(a)) * 60 });
  }

  // ---------- scene 2: first step ----------
  function bgRoomDay(t) {
    let s = `<rect width="${W}" height="${H}" fill="url(#gDay)"/>`;
    s += `<circle cx="900" cy="300" r="520" fill="url(#gWarm)" opacity=".55"/><circle cx="160" cy="1000" r="480" fill="url(#gTealGlow)" opacity=".35"/>`;
    // big window light panes
    s += `<g opacity=".16"><path d="M620 0H1080V1100L900 1100Z" fill="${C.gold}"/></g>`;
    s += rr(40, 160, 300, 440, 22, '#BFE6F5', 'opacity=".5"') + `<path d="M190 160V600M40 380H340" stroke="#fff" stroke-width="8" opacity=".8"/>`;
    // plant
    const sw = Math.sin(t * 1.2) * 2;
    s += g(`<path d="M0 0c-60-90-30-170 10-230c10 90 30 150-10 230zM0 0c70-70 70-160 40-210c-30 70-60 120-40 210zM0 0c-100-30-130-100-120-150c70 20 110 60 120 150z" fill="${C.tealD}"/><path d="M-40 0H40L30 100H-30Z" fill="${C.coral}"/>`, { x: 1010, y: 1120, rot: sw, s: 1.0 });
    return s;
  }
  function scene2(t) {
    const tt = t - 4.2;
    let o = bgRoomDay(t);
    const s = 0.78;
    const pull = eio(seg(t, 4.2, 4.9));
    const topY = lerp(1290, 1290, pull);
    // character
    const relax = eio(seg(t, 4.3, 5.0));
    const gest = eio(seg(t, 6.35, 6.95)) * (1 - eio(seg(t, 7.75, 8.2)));
    const chin = (1 - eio(seg(t, 4.2, 4.7)));
    const armR = mixArm(mixArm(ARM_DESK_R, ARM_CHIN, chin), ARM_PRESENT, gest);
    const armL = mixArm(ARM_DESK_L, ARM_PRESENT_L, gest * 0.85);
    const head = { tilt: lerp(-4, 1.5, relax) + gest * 2, dy: Math.sin(Math.max(0, t - 4.2) * 3) * 2 * (1 - relax), brow: lerp(.65, .12, relax), browTilt: 0, smile: lerp(0.02, 0.5, relax) + gest * .35, mouth: gest * .25,
      gaze: { x: lerp(-0.9, 0.2, relax) * (1 - gest), y: lerp(-1, -0.2, relax) * (1 - gest) }, blink: blinkAt(t, [4.9, 6.2, 7.6]) };
    const breath = Math.sin(t * 1.7) + (1 - relax) * 0;
    // exhale puff
    const ox = 540, oy = topY - 400 * s;
    const pose2 = { x: ox, y: oy, scale: s, style: 'male', breath, armL: Object.assign({}, armL, { hs: 1.3 }), armR: Object.assign({}, armR, { hs: 1.3 }), head };
    o += g(`<circle cx="540" cy="${f1(oy + 60)}" r="330" fill="url(#gTealGlow)" opacity=".8"/>`);
    o += P.person(Object.assign({ part: 'body' }, pose2));
    o += `<rect x="-20" y="${topY}" width="1120" height="${H - topY + 40}" fill="url(#gWood)"/><rect x="-20" y="${topY}" width="1120" height="9" fill="#A87450" opacity=".55"/>`;
    o += P.person(Object.assign({ part: 'arms' }, pose2));
    // phrase words: scattered -> snapped
    const L = phraseLayout(104, 470, 600);
    const scat = [[230, 360, -14], [800, 420, 11], [400, 760, 8], [740, 880, -9], [250, 860, 6]];
    const snapT = [5.75, 5.9, 6.05, 6.2, 6.4];
    const tipPulse = seg(t, 6.5, 6.9);
    WORDS.forEach((w, i) => {
      const t0 = 4.45 + i * 0.1; const appear = eb(seg(t, t0, t0 + 0.5));
      const k = eio(seg(t, snapT[i] - 0.4, snapT[i]));
      const sx = lerp(scat[i][0] + Math.sin(t * 1.3 + i * 2) * 14, L[i].x, k), sy = lerp(scat[i][1] + Math.cos(t * 1.1 + i) * 14, L[i].y, k);
      const rot = lerp(scat[i][2], 0, k), sc = lerp(0.62, 1, k) * appear;
      const size = 104, ww = L[i].w + 40, chip = 1 - k;
      const pop = Math.exp(-Math.pow((t - snapT[i]) / 0.07, 2)) * 0.08;
      o += g(rr(-ww / 2, -size * 0.82, ww, size * 1.18, 26, C.ivory, `stroke="${C.teal}" stroke-width="${f1(3 * chip)}" opacity="${f1(chip)}" filter="url(#shadow)"`) + text(0, 0, w, { size, fill: C.navy }), { x: sx, y: sy, rot, s: sc * (1 + pop) });
    });
    // underline sweep when connected
    const ul = eio(seg(t, 6.4, 6.9));
    if (ul > 0) { o += rr(L[0].x - L[0].w / 2, 494, (L[2].x + L[2].w / 2) - (L[0].x - L[0].w / 2), 8, 4, C.teal, `opacity="${f1(ul)}" transform="translate(0 0)"`); o += rr(L[3].x - L[3].w / 2, 624, (L[4].x + L[4].w / 2) - (L[3].x - L[3].w / 2), 8, 4, C.teal, `opacity="${f1(ul)}"`); }
    return o;
  }

  // ---------- scene 3: useful phrase ----------
  function scene3(t) {
    let o = `<rect width="${W}" height="${H}" fill="url(#gDay)"/><circle cx="540" cy="760" r="620" fill="url(#gTealGlow)" opacity=".45"/>` + floorWaves(t);
    // lesson card
    const k = eb(seg(t, 8.2, 8.7));
    o += g(rr(60, 330, 960, 820, 54, '#FFFFFF', 'filter="url(#shadow)"') + rr(60, 330, 960, 18, 9, C.teal, 'opacity=".0"'), { x: 0, y: (1 - clamp(k)) * 50, op: clamp(k * 1.4) });
    o += text(540, 408, 'REPITE CONMIGO', { size: 30, fill: C.tealD, weight: 800, ls: 6 });
    // words with highlight sync (normal pass then slow pass)
    const L = phraseLayout(112, 600, 840);
    const passes = [TL.english.normal, TL.english.slow];
    const lit = (i) => { let v = 0; for (const p of passes) { const w = p[i]; const on = seg(t, w.t0 - 0.03, w.t0 + 0.06) * (1 - seg(t, w.t1 + 0.01, w.t1 + 0.09)); v = Math.max(v, on); } return v; };
    const ipaMode = window.__mode === 'ipa';
    WORDS.forEach((w, i) => {
      const l = lit(i), ww = L[i].w;
      // from S2 positions glide into the card layout
      const from = phraseLayout(104, 470, 600)[i]; const m = eio(seg(t, 8.2, 8.75));
      const x = lerp(from.x, L[i].x, m), y = lerp(from.y, L[i].y, m);
      const blank = i >= 3 ? eio(seg(t, 12.75, 13.3)) : 0;
      if (l > 0.01) o += rr(x - ww / 2 - 16, y - 100, ww + 32, 138, 30, C.teal, `opacity="${f1(l * 0.22)}"`);
      o += g(text(0, 0, w, { size: lerp(104, 112, m), fill: l > .5 ? C.tealD : C.navy }), { x, y, s: 1 + l * 0.05, op: 1 - blank });
      if (ipaMode && i !== 4 + 99) {
        const ia = seg(t, 8.5 + i * 0.07, 8.8 + i * 0.07);
        const wordNoPunct = w.replace('.', '');
        const iw = TL.ipa[i];
        o += text(L[i].x, L[i].y + 62, '/' + iw + '/', { size: 54, fill: l > .5 ? C.tealD : '#2E4670', weight: 400, family: IPAF, op: ia * (1 - blank) });
      }
    });
    // blank version: "I'd like to ___."
    const bl = eio(seg(t, 12.75, 13.3));
    if (bl > 0) {
      const sz = 112, sp = sz * 0.28, tw = mw("I'd like to", sz, 800), bw = 300;
      o += g(text(0, 0, '___', { size: sz, fill: C.teal }) + rr(-bw / 2, 22, bw, 10, 5, C.gold), { x: L[3].x + L[3].w / 2 + (L[4].x - L[3].x) / 2 - 20, y: L[3].y, op: bl, s: 0.7 + 0.3 * bl });
    }
    // waveform of the real audio
    o += waveform(t, 150, 1000);
    return o;
  }
  function waveform(t, x0, y0) {
    let s = '';
    const bars = 72, bw = 8, gap = 5;
    const total = bars * (bw + gap) - gap, sx = 540 - total / 2;
    const clips = [[TL.clips.e1_normal.start, TL.wave.normal], [TL.clips.e2_slow.start, TL.wave.slow]];
    let amp = new Array(bars).fill(0.05);
    for (const [st, wv] of clips) {
      const rel = t - st; if (rel < -0.1 || rel > wv.length / TL.wave.hz + 0.1) continue;
      for (let i = 0; i < bars; i++) { const idx = Math.round((rel + (i - bars / 2) * 0.012) * TL.wave.hz); if (idx >= 0 && idx < wv.length) amp[i] = Math.max(amp[i], wv[idx]); }
    }
    const act = clips.some(([st, wv]) => t >= st - 0.05 && t <= st + wv.length / TL.wave.hz + 0.1);
    for (let i = 0; i < bars; i++) { const h = 10 + amp[i] * 120 * (0.5 + 0.5 * Math.sin(i * .7)) + amp[i] * 40; s += rr(sx + i * (bw + gap), y0 - h / 2, bw, h, 4, act ? C.teal : '#9BB1BC', `opacity="${act ? 0.95 : 0.5}"`); }
    const lab = t < TL.clips.e2_slow.start - 0.2 ? 'Escucha' : (t < TL.clips.e2_slow.end + 0.3 ? 'Ahora más despacio' : '');
    return s + (lab ? text(540, y0 + 108, lab, { size: 34, fill: C.tealD, weight: 700 }) : '');
  }

  function floorWaves(t) { const y = 1560; return `<path d="M0 ${y}Q270 ${y - 60} 540 ${y}T1080 ${y}V1920H0Z" fill="${C.teal}" opacity=".10"/><path d="M0 ${y + 90}Q270 ${y + 30} 540 ${y + 90}T1080 ${y + 90}V1920H0Z" fill="${C.tealD}" opacity=".10"/>`; }
  // ---------- scene 4: viewer speaks ----------
  function cardArt(kind, t) {
    let s = '';
    if (kind === 'travel') {
      s += `<rect width="200" height="200" fill="url(#gSky)"/><circle cx="150" cy="46" r="22" fill="#FFE9A8"/><ellipse cx="60" cy="150" rx="70" ry="26" fill="#fff" opacity=".85"/><ellipse cx="150" cy="170" rx="80" ry="26" fill="#fff" opacity=".7"/>`;
      s += g(`<path d="M-50 10L40 0L58 -26L74 -26L62 0L84 0L98 -14L108 -14L102 6C110 8 110 14 102 16L108 36L98 36L84 20L62 20L74 46L58 46L40 20L-50 30Z" fill="#fff" stroke="#0B1F3A" stroke-width="3" stroke-linejoin="round"/>`, { x: 60 + Math.sin(t * 1.4) * 4, y: 76 + Math.sin(t * 1.4) * 3, rot: -14, s: .85 });
      s += `<path d="M10 120 Q60 110 100 128" stroke="#fff" stroke-width="5" stroke-dasharray="3 9" stroke-linecap="round" fill="none"/>`;
      s += `<path d="M150 118c-20 0-26 22-12 40l12 20l12-20c14-18 8-40-12-40z" fill="${C.coral}" stroke="#fff" stroke-width="3"/><circle cx="150" cy="138" r="8" fill="#fff"/>`;
    } else if (kind === 'meet') {
      s += `<rect width="200" height="200" fill="#FFE2D0"/><circle cx="100" cy="190" r="120" fill="#FFC6A8" opacity=".7"/>`;
      s += P.person({ style: 'womanA', x: 56, y: 118, scale: .27, armL: { f: -10, hand: 'relax' }, armR: { f: -10, hand: 'relax' }, head: { smile: .9, mouth: .2 } });
      s += P.person({ style: 'manB', x: 150, y: 118, scale: .27, armL: { f: -10, hand: 'relax' }, armR: { f: -10, hand: 'relax' }, head: { smile: .9, mouth: .2 } });
      s += g(`<path d="M0 0h58a14 14 0 0 1 14 14v22a14 14 0 0 1-14 14H26l-14 14V50A14 14 0 0 1 0 36V14Z" fill="#fff"/><path d="M20 24h32M20 36h20" stroke="${C.teal}" stroke-width="5" stroke-linecap="round"/>`, { x: 66, y: 8, s: .8 + Math.sin(t * 2) * .02 });
    } else {
      s += `<rect width="200" height="200" fill="#FFF1C9"/><circle cx="100" cy="100" r="86" fill="#FFD98A" opacity=".5"/>`;
      s += `<path d="M30 120Q100 96 100 96Q100 96 170 120V168Q100 144 100 144Q100 144 30 168Z" fill="#fff" stroke="${C.navy}" stroke-width="5" stroke-linejoin="round"/><path d="M100 96V144" stroke="${C.navy}" stroke-width="5"/><path d="M44 126Q78 114 94 120M44 142Q78 130 94 136" stroke="${C.teal}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M156 126Q122 114 106 120M156 142Q122 130 106 136" stroke="${C.teal}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      s += g(`<circle r="26" fill="${C.gold}"/><path d="M-12 24h24M-8 32h16" stroke="${C.navy}" stroke-width="5" stroke-linecap="round"/><path d="M-10 4L0 -8L10 4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`, { x: 100, y: 52 + Math.sin(t * 2) * 3 });
      [[40, 56, 1], [166, 70, .8], [150, 30, .6]].forEach((p, i) => { s += `<path d="M${p[0]} ${p[1] - 12}L${p[0] + 4} ${p[1] - 4}L${p[0] + 12} ${p[1]}L${p[0] + 4} ${p[1] + 4}L${p[0]} ${p[1] + 12}L${p[0] - 4} ${p[1] + 4}L${p[0] - 12} ${p[1]}L${p[0] - 4} ${p[1] - 4}Z" fill="${C.coral}" opacity="${f1(0.6 + 0.4 * Math.sin(t * 3 + i))}"/>`; });
    }
    return s;
  }
  function scene4(t) {
    let o = `<rect width="${W}" height="${H}" fill="url(#gDay)"/><circle cx="880" cy="520" r="520" fill="url(#gTealGlow)" opacity=".4"/><circle cx="120" cy="1250" r="380" fill="url(#gWarm)" opacity=".4"/>` + floorWaves(t);
    // phrase header, stays visible
    const ha = eb(seg(t, 14.2, 14.75));
    const blank = '___';
    const sz = 104, p1 = "I’d like to", w1 = mw(p1, sz, 800), wb = mw(blank, sz, 800), tot = w1 + 28 + wb + mw('.', sz, 800);
    const sx = 540 - tot / 2;
    const pulse = 0.5 + 0.5 * Math.sin((t - 14.2) * 3.2);
    o += g(text(sx, 360, p1, { size: sz, fill: C.navy, anchor: 'start' }) + text(sx + w1 + 28, 360, blank, { size: sz, fill: C.teal, anchor: 'start' }) + text(sx + w1 + 28 + wb, 360, '.', { size: sz, fill: C.navy, anchor: 'start' }) +
      rr(sx + w1 + 36, 386, wb - 14, 10, 5, C.gold, `opacity="${f1(0.55 + 0.45 * pulse)}"`), { op: clamp(ha * 1.5), y: (1 - clamp(ha)) * 40 });
    const cards = [['travel', 'travel', 'viajar'], ['meet', 'meet new people', 'conocer gente nueva'], ['learn', 'learn something new', 'aprender algo nuevo']];
    cards.forEach((c, i) => {
      const t0 = 14.95 + i * 0.42, k = eb(seg(t, t0, t0 + 0.55)), y = 500 + i * 244;
      const fl = Math.sin(t * 1.5 + i * 2) * 3;
      o += g(rr(0, 0, 960, 214, 44, '#FFFFFF', 'filter="url(#shadow)"') +
        g(cardArt(c[0], t), { x: 18, y: 7, s: 1 }, '') .replace('<g', '<g clip-path="url(#cardClip2)"') +
        text(262, 96, c[1], { size: c[1].length > 14 ? 50 : 62, fill: C.navy, anchor: 'start' }) + text(262, 156, c[2], { size: 36, fill: C.tealD, anchor: 'start', weight: 600 }), { x: 60 + (1 - k) * 160, y: y + fl, op: clamp(k * 1.3) });
    });
    // gentle progress cue during the speaking pause
    const w0 = TL.speakWindow[0], w1b = TL.speakWindow[1];
    const pa = seg(t, w0 - 0.25, w0 + 0.15) * (1 - seg(t, w1b + 0.2, w1b + 0.55));
    if (pa > 0.01) {
      const prog = seg(t, w0, w1b), by = 1272;
      o += g(rr(110, by, 700, 18, 9, 'rgba(11,31,58,.14)') + rr(110, by, 700 * prog, 18, 9, C.teal) +
        // mic icon with slow breathing ring
        `<circle cx="900" cy="${by + 9}" r="${f1(40 + Math.sin(t * 2.2) * 3)}" fill="none" stroke="${C.teal}" stroke-width="4" opacity=".4"/><circle cx="900" cy="${by + 9}" r="34" fill="${C.tealD}"/><rect x="889" y="${by - 12}" width="22" height="30" rx="11" fill="${C.ivory}"/><path d="M882 ${by + 12}a18 18 0 0 0 36 0M900 ${by + 30}v8" stroke="${C.ivory}" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        text(110, by - 22, 'Tu turno', { size: 34, fill: C.tealD, anchor: 'start', weight: 800 }), { op: pa });
    }
    return o;
  }

  // ---------- scene 5: Fluent English online class ----------
  function tile(x, y, w, h, style, who, t, active, opts) {
    opts = opts || {};
    const bg = opts.bg || '#DDEFEF';
    let s = `<g transform="translate(${x} ${y})"><clipPath id="tc${who}"><rect width="${w}" height="${h}" rx="26"/></clipPath><g clip-path="url(#tc${who})">`;
    s += `<rect width="${w}" height="${h}" fill="${bg}"/>`;
    if (opts.board) s += `<rect x="${w * .08}" y="${h * .10}" width="${w * .5}" height="${h * .34}" rx="14" fill="#fff"/>` + text(w * .33, h * .31, "I’d like to…", { size: Math.round(h * .13), fill: C.navy, weight: 800 });
    else s += `<circle cx="${w * .8}" cy="${h * .22}" r="${h * .14}" fill="#fff" opacity=".35"/>`;
    const sc = (w * 0.9) / 430, hs = opts.scale || sc;
    s += P.person({ style, x: w / 2 + (opts.dx || 0), y: h * (opts.py || 0.62), scale: hs, armL: { u: 4, f: -34 }, armR: opts.wave ? { u: 20, f: 130, fs: .95, hand: 'open', handRot: -10 } : { u: 4, f: -34 }, head: { smile: 0.7, mouth: opts.talk ? (0.2 + 0.2 * Math.abs(Math.sin(t * 9 + who))) : 0, blink: blinkAt(t, [21.3 + who, 23.4 + who, 25 + who]), gaze: { x: 0, y: 0 } }, breath: Math.sin(t * 1.8 + who) });
    s += `</g>`;
    s += `<rect width="${w}" height="${h}" rx="26" fill="none" stroke="${active ? C.teal : 'rgba(11,31,58,.18)'}" stroke-width="${active ? 8 : 3}"/>`;
    s += `<g transform="translate(${w - 62} ${h - 46})"><rect width="46" height="32" rx="10" fill="rgba(11,31,58,.7)"/><rect x="18" y="6" width="10" height="14" rx="5" fill="${active ? C.teal : '#9BB1BC'}"/><path d="M13 16a10 10 0 0 0 20 0" stroke="${active ? C.teal : '#9BB1BC'}" stroke-width="2.5" fill="none"/></g>`;
    return s + `</g>`;
  }
  function scene5(t) {
    const tt = t - 20.2;
    let o = `<rect width="${W}" height="${H}" fill="url(#gDay)"/><circle cx="920" cy="360" r="560" fill="url(#gTealGlow)" opacity=".5"/><circle cx="100" cy="1300" r="380" fill="url(#gWarm)" opacity=".45"/>`;
    // logo (authentic file, multiply onto ivory is unnecessary: transparent PNG)
    const la = eb(seg(t, 20.45, 21.0));
    o += g(`<image href="img/logo_blue.png" x="-250" y="-136" width="500" height="272" preserveAspectRatio="xMidYMid meet"/>`, { x: 540, y: 300, op: clamp(la * 1.5), s: 0.95 + 0.05 * clamp(la) });
    // device frame
    const k = eb(seg(t, 20.35, 21.0));
    const dx = 50, dy = 440, dw = 980, dh = 800;
    let dev = rr(0, 0, dw, dh, 46, C.navy, 'filter="url(#shadow)"') + rr(18, 18, dw - 36, dh - 36, 32, '#EAF3F3');
    // top bar of the call (generic video-call UI, no third-party branding)
    dev += rr(18, 18, dw - 36, 56, 32, C.navy2) + rr(18, 50, dw - 36, 24, 0, C.navy2);
    dev += `<circle cx="64" cy="46" r="8" fill="${C.coral}"/><circle cx="92" cy="46" r="8" fill="${C.gold}"/><circle cx="120" cy="46" r="8" fill="${C.teal}"/>` + text(dw / 2, 56, 'Clase en vivo', { size: 26, fill: C.ivory, weight: 700 });
    const act = Math.floor((t - 20.8) / 1.45) % 4; const A = (i) => t > 20.8 && act === i;
    dev += g(tile(0, 0, 590, 340, 'womanA', 0, t, A(0) || t < 20.8, { board: true, talk: A(0) || t < 20.8, bg: '#CFE7E4', py: .74, scale: .62, dx: 150 }), { x: 36, y: 92 });
    dev += g(tile(0, 0, 310, 340, 'manB', 1, t, A(1), { talk: A(1), bg: '#F9DEC9', py: .76, scale: .5 }), { x: 640, y: 92 });
    dev += g(tile(0, 0, 290, 270, 'womanB', 2, t, A(2), { talk: A(2), bg: '#FFE9B0', py: .76, scale: .46, wave: t > 23.0 && t < 24.4 }), { x: 36, y: 450 });
    dev += g(tile(0, 0, 290, 270, 'male', 3, t, A(3), { talk: A(3), bg: '#D9E4F7', py: .76, scale: .46 }), { x: 346, y: 450 });
    // chat panel with a practice line
    const ca = eb(seg(t, 22.0, 22.6));
    dev += g(rr(0, 0, 310, 270, 26, '#fff', 'stroke="rgba(11,31,58,.14)" stroke-width="3"') + text(24, 44, 'Chat', { size: 26, fill: C.tealD, anchor: 'start' }) +
      rr(24, 62, 220, 56, 28, C.teal) + text(40, 98, "I’d like to learn", { size: 24, fill: '#fff', anchor: 'start', weight: 700 }) +
      rr(24, 134, 262, 56, 28, '#EAF3F3') + text(40, 170, 'Great job! 👏', { size: 24, fill: C.ink, anchor: 'start', weight: 700 }), { x: 646, y: 450, op: clamp(ca) });
    // toolbar
    dev += rr(dw / 2 - 160, dh - 76, 320, 50, 25, C.navy) + [0, 1, 2].map((i) => `<circle cx="${dw / 2 - 80 + i * 80}" cy="${dh - 51}" r="17" fill="${i === 2 ? C.coral : '#2A4C7C'}"/>`).join('');
    o += g(dev, { x: dx, y: dy + (1 - clamp(k)) * 90, op: clamp(k * 1.4) });
    return o;
  }

  // ---------- scene 6: CTA ----------
  function scene6(t) {
    let o = `<rect width="${W}" height="${H}" fill="url(#gDay)"/><circle cx="900" cy="300" r="520" fill="url(#gTealGlow)" opacity=".5"/><circle cx="120" cy="1120" r="420" fill="url(#gWarm)" opacity=".5"/>` + floorWaves(t);
    const la = eb(seg(t, 25.1, 25.75));
    o += g(`<image href="img/logo_blue.png" x="-380" y="-207" width="760" height="414" preserveAspectRatio="xMidYMid meet"/>`, { x: 540, y: 470, op: clamp(la * 1.5), s: 0.9 + 0.1 * clamp(la) });
    // CTA card
    const ka = eb(seg(t, 25.5, 26.1));
    let cta = rr(0, 0, 900, 330, 56, 'url(#gTealC)', 'filter="url(#shadow)"');
    // chat input mock with typed INGLÉS
    cta += text(450, 98, 'ESCRÍBENOS', { size: 78, fill: C.ivory, weight: 800, ls: 2 });
    const typed = 'INGLÉS'.slice(0, Math.floor(seg(t, 26.3, 27.0) * 6.99));
    cta += rr(100, 150, 700, 128, 64, C.ivory) + text(150, 238, typed + (Math.floor(t * 2.2) % 2 ? '' : '|'), { size: 82, fill: C.navy, anchor: 'start', weight: 800 });
    cta += `<circle cx="744" cy="214" r="38" fill="${C.tealD}"/><path d="M728 214L760 214M748 198L762 214L748 230" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += g(cta, { x: 90, y: 740 + (1 - clamp(ka)) * 80, op: clamp(ka * 1.4) });
    const sa = eb(seg(t, 26.0, 26.6));
    o += g(`<path d="M-60 0h120" stroke="${C.gold}" stroke-width="8" stroke-linecap="round"/>` + text(0, 70, 'Clases en línea', { size: 56, fill: C.navy, weight: 800 }), { x: 540, y: 1140, op: clamp(sa * 1.4), s: 0.94 + 0.06 * clamp(sa) });
    return o;
  }

  // ---------- transitions ----------
  function sweep(t, c, dur, color) {
    const a = (t - (c - dur)) / (2 * dur); if (a <= 0 || a >= 1) return '';
    // diagonal band travelling left -> right; leading and trailing edges
    const lead = lerp(-500, W + 900, eio(clamp(a * 1.0)));
    const w = 820; const x0 = lead - w;
    const skew = 380;
    return `<path d="M${f1(x0 + skew)} -40L${f1(lead + skew)} -40L${f1(lead - skew)} ${H + 40}L${f1(x0 - skew)} ${H + 40}Z" fill="${color || C.teal}"/><path d="M${f1(lead + skew - 26)} -40L${f1(lead + skew + 8)} -40L${f1(lead - skew + 8)} ${H + 40}L${f1(lead - skew - 26)} ${H + 40}Z" fill="${C.gold}"/>`;
  }
  function bloom(t, c, dur) {
    const a = (t - (c - dur)) / (2 * dur); if (a <= 0 || a >= 1) return '';
    const r = a < .5 ? eo(a * 2) * 1500 : 1500; const op = a < .5 ? 1 : 1 - eio((a - .5) * 2);
    return `<circle cx="540" cy="800" r="${f1(r)}" fill="${C.ivory}" opacity="${f1(op)}"/>`;
  }

  // ---------- compose ----------
  function sceneFor(t) {
    if (t < 4.2) return 1; if (t < 8.2) return 2; if (t < 14.2) return 3; if (t < 20.2) return 4; if (t < 25.0) return 5; return 6;
  }
  function frame(t, mode, opts) {
    opts = opts || {};
    window.__mode = mode;
    t = clamp(t, 0, 29.999);
    const sc = sceneFor(t);
    let o = '';
    // S1->S2 uses a light bloom (the scene "opens up"); others a teal sweep
    const s2b = t >= 3.95 && t < 4.5;
    if (sc === 1) o += scene1(t); else if (sc === 2) o += scene2(t); else if (sc === 3) o += scene3(t); else if (sc === 4) o += scene4(t); else if (sc === 5) o += scene5(t); else o += scene6(t);
    o += bloom(t, 4.2, 0.28) + sweep(t, 8.2, 0.3) + sweep(t, 14.2, 0.3) + sweep(t, 20.2, 0.3) + sweep(t, 25.0, 0.3);
    // vignette over dark scene only
    if (sc === 1) o += `<rect width="${W}" height="${H}" fill="url(#gVig)" opacity="${f1(1 - seg(t, 3.9, 4.2))}"/>`;
    // captions: skip duplicates of burned-in hook / CTA design text
    const skip = (c) => (c.clip === 'n1_hook' && c.text.startsWith('pero')) || (c.clip === 'n6_cta' && c.text.startsWith('Escríbenos'));
    if (!opts.noCaptions) o += captions(t, mode, skip);
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS.replace('</defs>', '<clipPath id="winClip"><rect x="82" y="342" width="336" height="536" rx="20"/></clipPath><clipPath id="cardClip2"><rect x="0" y="0" width="200" height="200" rx="34"/></clipPath></defs>')}${o}</svg>`;
  }

  // ---------- cover (thumbnail) ----------
  function cover() {
    const t = 3.0, s = 1.0, topY = 1262;
    let o = bgOffice(t);
    const head = { tilt: -4, brow: .7, browTilt: .5, smile: .05, mouth: 0, gaze: { x: -0.9, y: -1 }, blink: 0 };
    const pose = { x: 540, y: topY - 400 * s, scale: s, style: 'male', breath: 0, armL: Object.assign({}, ARM_DESK_L, { hs: 1.3 }), armR: Object.assign({}, ARM_CHIN, { hs: 1.3 }), head };
    o += g(`<circle cx="540" cy="860" r="470" fill="url(#gTealGlow)"/>`);
    o += P.person(Object.assign({ part: 'body' }, pose)) + desk(topY, laptopBack(80, topY - 190) + mug(830, topY - 105)) + P.person(Object.assign({ part: 'arms' }, pose));
    const bits = [['I’d…', 170, 770, -8, 58], ['to…', 300, 690, 6, 50], ['like…', 160, 640, 4, 48], ['…?', 330, 820, -4, 64]];
    bits.forEach((b) => { const w = mw(b[0], b[4], 800) + 50; o += g(rr(-w / 2, -b[4] * .7, w, b[4] * 1.3, b[4] * .65, 'rgba(11,31,58,.6)', `stroke="${C.tealL}" stroke-opacity=".8" stroke-width="3"`) + text(0, b[4] * .3, b[0], { size: b[4], fill: C.ivory, weight: 700 }), { x: b[1], y: b[2], rot: b[3] }); });
    const size = 120;
    o += text(540, 418, '¿TE BLOQUEAS', { size: 120, fill: C.ivory, stroke: C.navy, sw: 16 }) + text(540, 544, 'AL HABLAR?', { size, fill: C.teal, stroke: C.navy, sw: 16 });
    o += rr(540 - mw('AL HABLAR?', size, 800) / 2, 566, mw('AL HABLAR?', size, 800), 16, 8, C.gold);
    o += `<image href="img/logo_white.png" x="${540 - 230}" y="${1372}" width="460" height="250" preserveAspectRatio="xMidYMid meet"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS.replace('</defs>', '<clipPath id="winClip"><rect x="82" y="342" width="336" height="536" rx="20"/></clipPath><clipPath id="cardClip2"><rect x="0" y="0" width="200" height="200" rx="34"/></clipPath></defs>')}${o}</svg>`;
  }
  window.FE = { frame, cover, TL, W, H, C };
})();
