/* ===== Art: original SVG people, objects and scenes =====
   Arms are built with forward kinematics (shoulder -> elbow -> wrist, fixed segment lengths),
   so elbows/wrists stay anatomically consistent. Every hand has five digits. */
const Art = (() => {
  const CAST = {
    alex:  { name: 'Alex',   pr: 'he/him',  m: 1, skin: '#e7b894', hair: '#2a201b', hs: 'short', beard: 1, top: '#1f8a8a', pants: '#2c3a52' },
    maya:  { name: 'Maya',   pr: 'she/her', m: 0, skin: '#a86f4b', hair: '#1c1411', hs: 'long',  top: '#ff6f59', pants: '#3a3350' },
    daniel:{ name: 'Daniel', pr: 'he/him',  m: 1, skin: '#efc9a9', hair: '#8b8e94', hs: 'short', glasses: 1, top: '#6a4fb0', pants: '#3b3f4a' },
    sofia: { name: 'Sofia',  pr: 'she/her', m: 0, skin: '#e5b28c', hair: '#3a2417', hs: 'bob',   glasses: 1, top: '#f2b632', pants: '#2c3a52' },
    omar:  { name: 'Omar',   pr: 'he/him',  m: 1, skin: '#b07650', hair: '#17110e', hs: 'short', beard: 1, top: '#e8744f', pants: '#2d3b3a' },
    lena:  { name: 'Lena',   pr: 'she/her', m: 0, skin: '#f3d1b6', hair: '#b4532d', hs: 'bun',   top: '#7a5cc4', pants: '#34415a' },
    ken:   { name: 'Ken',    pr: 'he/him',  m: 1, skin: '#e9c39c', hair: '#14100f', hs: 'buzz',  top: '#2b4170', pants: '#3b3b3b' },
    rosa:  { name: 'Rosa',   pr: 'she/her', m: 0, skin: '#8c5a3c', hair: '#241410', hs: 'curly', top: '#2a9d8f', pants: '#47384f' },
  };
  let UID = 0;
  const REG = {};
  const rad = (d) => (d * Math.PI) / 180;
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
    return '#' + [f(r), f(g), f(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  /* ---------- hands (local: wrist at origin, fingers toward +y; thumb on inner side for side=+1) ---------- */
  function hand(type, skin) {
    const edge = shade(skin, -0.4), L = (x1, y1, x2, y2, w, col) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    const both = (arr) => arr.map((a) => L(a[0], a[1], a[2], a[3], a[4] + 1.8, edge)).join('');
    const fill = (arr) => arr.map((a) => L(a[0], a[1], a[2], a[3], a[4], skin)).join('');
    const palm = `<path d="M-7.2 -1 Q-8.4 8 -7 15.5 Q0 18.5 7 15.5 Q8.4 8 7.2 -1 Z" fill="${skin}" stroke="${edge}" stroke-width="1.4" stroke-linejoin="round"/>`;
    let fingers, thumb, extra = '';
    if (type === 'point') {
      fingers = [[-4.2, 13, -4.2, 31, 3.7], [-0.4, 14, -0.4, 19.5, 3.8], [3.2, 14, 3.2, 18.8, 3.7], [6.4, 12.5, 6.4, 17, 3.4]];
      thumb = [[-6.6, 3, -2.4, 12.5, 4]];
    } else if (type === 'fist') {
      fingers = [[-5.4, 14, -5.4, 18, 4.2], [-1.8, 14.5, -1.8, 19, 4.2], [1.8, 14.5, 1.8, 19, 4.2], [5.2, 13.5, 5.2, 17.5, 3.9]];
      thumb = [[-6.6, 4, -1.2, 13.5, 4.2]];
    } else if (type === 'flat') {
      fingers = [[-4.4, 13, -4.6, 25, 3.5], [-1.4, 14, -1.4, 27, 3.5], [1.6, 14, 1.8, 26, 3.5], [4.5, 12.5, 4.8, 22, 3.3]];
      thumb = [[-6.6, 4, -9.2, 14, 4]];
    } else { // open
      fingers = [[-5.2, 13, -5.9, 26, 3.6], [-1.8, 14, -1.8, 28.5, 3.6], [1.8, 14, 2.3, 27, 3.6], [5.2, 12.5, 6, 23.5, 3.4]];
      thumb = [[-6.8, 4, -12.8, 14, 4.2]];
    }
    const lines = fingers.concat(thumb);
    return `<g class="hand">${both(lines)}${palm}${fill(lines)}<path d="M-6.2 -0.6 H6.2" stroke="${skin}" stroke-width="2.8"/></g>`;
  }

  /* ---------- held objects (absolute, small) ---------- */
  function held(type, x, y) {
    const t = `transform="translate(${x} ${y})"`;
    switch (type) {
      case 'book': return `<g ${t}><rect x="-17" y="-26" width="34" height="46" rx="3" fill="#0f6f78"/><rect x="-14" y="-23" width="4" height="40" fill="#0b5058"/><rect x="14" y="-24" width="3" height="42" fill="#fffaf0"/><rect x="-6" y="-14" width="16" height="3" rx="1.5" fill="#f5b72e"/><rect x="-6" y="-7" width="11" height="2.4" rx="1.2" fill="#f5b72e" opacity=".7"/></g>`;
      case 'notebook': return `<g ${t}><rect x="-17" y="-24" width="34" height="44" rx="3" fill="#7a5cc4"/><rect x="-17" y="-24" width="5" height="44" fill="#5a3fa3"/>${[-16, -8, 0, 8, 16].map((y) => `<circle cx="-14" cy="${y}" r="1.6" fill="#e8e0f8"/>`).join('')}<rect x="-4" y="-12" width="16" height="3" rx="1.5" fill="#fffaf0"/></g>`;
      case 'palette': return `<g ${t}><path d="M-22 0 Q-22 -22 2 -22 Q26 -20 24 -2 Q22 14 6 12 Q-2 10 -4 16 Q-12 22 -22 0Z" fill="#e7c28f" stroke="#a9794a" stroke-width="1.5"/><circle cx="-10" cy="-8" r="4" fill="#ff6f59"/><circle cx="0" cy="-13" r="4" fill="#f5b72e"/><circle cx="11" cy="-8" r="4" fill="#1f8a8a"/><circle cx="14" cy="2" r="4" fill="#7a5cc4"/></g>`;
      case 'phone': return `<g ${t}><rect x="-9" y="-19" width="18" height="36" rx="4" fill="#3b2e66"/><rect x="-7" y="-16" width="14" height="30" rx="2" fill="#9fd3e6"/></g>`;
      default: return '';
    }
  }

  /* ---------- arm (forward kinematics) ---------- */
  const L1 = 55, L2 = 45;   // shoulder→wrist ≈ shoulder→hip (100), so relaxed hands end at mid-thigh
  function armPoints(side, sh, pose) {
    const ex = sh.x + side * L1 * Math.sin(rad(pose.a1)), ey = sh.y + L1 * Math.cos(rad(pose.a1));
    const wx = ex + side * L2 * Math.sin(rad(pose.a2)), wy = ey + L2 * Math.cos(rad(pose.a2));
    const dx = side * Math.sin(rad(pose.a2)), dy = Math.cos(rad(pose.a2));
    return { ex, ey, wx, wy, rot: (Math.atan2(-dx, dy) * 180) / Math.PI };
  }
  function armSVG(R, side, pose) {
    const c = R.c, sh = { x: side * (c.m ? 41 : 36), y: -222 };
    const p = armPoints(side, sh, pose);
    const sleeveCol = R.sleeve, skin = c.skin;
    const wU = c.m ? 17 : 15, wF = c.m ? 15 : 13;
    const f = (n) => n.toFixed(1);
    const long = R.longSleeve;
    const mid = long ? null : { x: sh.x + (p.ex - sh.x) * 0.55, y: sh.y + (p.ey - sh.y) * 0.55 };
    let out = `<polyline points="${f(sh.x)},${f(sh.y)} ${f(p.ex)},${f(p.ey)}" fill="none" stroke="${skin}" stroke-width="${wU}" stroke-linecap="round" stroke-linejoin="round"/>`;
    out += `<polyline points="${f(p.ex)},${f(p.ey)} ${f(p.wx)},${f(p.wy)}" fill="none" stroke="${skin}" stroke-width="${wF}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (long) {
      out += `<polyline points="${f(sh.x)},${f(sh.y)} ${f(p.ex)},${f(p.ey)} ${f(p.wx)},${f(p.wy)}" fill="none" stroke="${sleeveCol}" stroke-width="${wF + 1}" stroke-linecap="butt" stroke-linejoin="round"/>`;
      out += `<circle cx="${f(sh.x)}" cy="${f(sh.y)}" r="${(wU + 2) / 2}" fill="${sleeveCol}"/>`;
      const k = 0.9, cx = p.ex + (p.wx - p.ex) * k, cy = p.ey + (p.wy - p.ey) * k;
      out += `<line x1="${f(cx)}" y1="${f(cy)}" x2="${f(p.wx)}" y2="${f(p.wy)}" stroke="${shade(sleeveCol, -0.25)}" stroke-width="${wF + 2}" stroke-linecap="butt"/>`;
    } else {
      out += `<polyline points="${f(sh.x)},${f(sh.y)} ${f(mid.x)},${f(mid.y)}" fill="none" stroke="${sleeveCol}" stroke-width="${wU + 2}" stroke-linecap="round"/>`;
    }
    const hv = pose.held || R.held[side < 0 ? 'L' : 'R'];
    if (hv) out += held(hv, p.wx + Math.sin(rad(p.rot)) * -4, p.wy - 6);
    out += `<g transform="translate(${f(p.wx)} ${f(p.wy)}) rotate(${f(p.rot)}) scale(${side * 1.1} 1.1)">${hand(pose.hand || 'open', skin)}</g>`;
    return out;
  }
  const POSES = {
    rest:   { a1: 7, a2: 4, hand: 'open' },
    chest:  { a1: 10, a2: -100, hand: 'flat' },
    point:  { a1: 64, a2: 80, hand: 'point' },
    pointUp:{ a1: 70, a2: 104, hand: 'point' },
    present:{ a1: 38, a2: 70, hand: 'open' },
    hold:   { a1: 22, a2: -62, hand: 'fist' },
    holdHi: { a1: 18, a2: -100, hand: 'fist' },
    desk:   { a1: 24, a2: -50, hand: 'open' },
    hip:    { a1: 45, a2: -40, hand: 'fist' },
  };

  /* ---------- face ---------- */
  function faceSVG(c, expr, gaze) {
    const ink = '#2a1a14', skin = c.skin, dk = shade(skin, -0.28);
    const gx = (gaze || 0) * 1.9;
    const eye = (sx) => {
      const x = sx * 10.5;
      const tired = expr === 'tired';
      return `<g class="blink"><ellipse cx="${x}" cy="-276" rx="5.6" ry="${tired ? 2.4 : 4.3}" fill="#fff"/><circle cx="${x + gx}" cy="-276" r="${tired ? 2.2 : 2.9}" fill="#3a2418"/><circle cx="${x + gx - 0.9}" cy="-277.2" r=".9" fill="#fff"/>${tired ? `<path d="M${x - 6.5} -277.5 Q${x} -281 ${x + 6.5} -277.5" fill="${skin}" stroke="${dk}" stroke-width="1.2"/>` : ''}</g>`;
    };
    const browY = expr === 'happy' ? -288 : expr === 'tired' ? -284 : -286;
    const brow = (sx) => `<path d="M${sx * 5} ${browY + (expr === 'tired' ? 1.5 : 0)} Q${sx * 11} ${browY - 3} ${sx * 17} ${browY + (expr === 'tired' ? 2.2 : 0.8)}" fill="none" stroke="${shade(c.hair, 0.0)}" stroke-width="2.6" stroke-linecap="round"/>`;
    const nose = `<path d="M0 -279 Q-3 -268 -1 -266 Q2 -265 3.5 -267" fill="none" stroke="${dk}" stroke-width="1.6" stroke-linecap="round"/>`;
    const mc = {
      neutral: `<path d="M-6 -256 Q0 -254.5 6 -256" fill="none" stroke="#7a3a35" stroke-width="2.2" stroke-linecap="round"/>`,
      smile: `<path d="M-8 -257 Q0 -250 8 -257" fill="none" stroke="#7a3a35" stroke-width="2.4" stroke-linecap="round"/>`,
      happy: `<path d="M-9.5 -258 Q0 -246 9.5 -258 Z" fill="#7a2d2d"/><path d="M-7 -257.3 Q0 -254.6 7 -257.3 L6 -255.6 Q0 -253.6 -6 -255.6Z" fill="#fff"/>`,
      tired: `<path d="M-6 -255 Q0 -257.5 6 -255" fill="none" stroke="#7a3a35" stroke-width="2.2" stroke-linecap="round"/>`,
      think: `<path d="M-5 -256 Q1 -254 7 -257" fill="none" stroke="#7a3a35" stroke-width="2.2" stroke-linecap="round"/>`,
    };
    const closed = mc[expr] || mc.smile;
    const open = `<ellipse cx="0" cy="-255.5" rx="5.2" ry="4.2" fill="#6e2a2a"/><path d="M-4 -258 Q0 -256 4 -258" stroke="#fff" stroke-width="1.8" fill="none"/>`;
    const blush = expr === 'happy' ? `<circle cx="-15" cy="-264" r="5" fill="#ff8e7a" opacity=".28"/><circle cx="15" cy="-264" r="5" fill="#ff8e7a" opacity=".28"/>` : '';
    const glasses = c.glasses ? `<g fill="none" stroke="#2b2b33" stroke-width="1.8"><circle cx="-10.5" cy="-276" r="8.6"/><circle cx="10.5" cy="-276" r="8.6"/><path d="M-2 -277 Q0 -279 2 -277"/><path d="M-19 -277 L-25 -278"/><path d="M19 -277 L25 -278"/></g>` : '';
    const beard = c.beard ? `<path d="M-23.5 -271 Q-25 -246 0 -240.5 Q25 -246 23.5 -271 Q18 -260 9 -257.5 Q0 -254.5 -9 -257.5 Q-18 -260 -23.5 -271Z" fill="${c.hair}" opacity=".95"/>` : '';
    return `${blush}${eye(-1)}${eye(1)}${brow(-1)}${brow(1)}${nose}${beard}<g class="m-closed">${closed}</g><g class="m-open">${open}</g>${glasses}`;
  }

  /* ---------- hair ---------- */
  function hairBack(c) {
    const h = c.hair;
    if (c.hs === 'long') return `<path d="M-29 -284 Q-37 -250 -39 -212 Q-20 -203 0 -207 Q20 -203 39 -212 Q37 -250 29 -284Z" fill="${h}"/>`;
    if (c.hs === 'bob') return `<path d="M-30 -284 Q-36 -258 -32 -236 Q0 -229 32 -236 Q36 -258 30 -284Z" fill="${h}"/>`;
    if (c.hs === 'curly') return `<ellipse cx="0" cy="-282" rx="37" ry="38" fill="${h}"/><circle cx="-32" cy="-256" r="10" fill="${h}"/><circle cx="32" cy="-256" r="10" fill="${h}"/>`;
    if (c.hs === 'bun') return `<circle cx="3" cy="-316" r="12" fill="${h}"/><path d="M-27 -284 Q-30 -262 -26 -250 L26 -250 Q30 -262 27 -284Z" fill="${h}"/>`;
    return '';
  }
  function hairFront(c) {
    const h = c.hair;
    if (c.hs === 'short') return `<path d="M-26.5 -274 Q-31 -307 0 -309 Q31 -307 26.5 -274 Q23 -289 12 -293 Q-3 -287 -18 -285 Q-24 -283 -26.5 -274Z" fill="${h}"/>`;
    if (c.hs === 'buzz') return `<path d="M-25 -278 Q-27 -305 0 -305 Q27 -305 25 -278 Q20 -293 0 -294 Q-20 -293 -25 -278Z" fill="${h}" opacity=".9"/>`;
    const cap = `<path d="M-27.5 -272 Q-32 -310 0 -311 Q32 -310 27.5 -272 Q24 -293 9 -297 Q-8 -291 -22 -283 Q-26 -279 -27.5 -272Z" fill="${h}"/>`;
    if (c.hs === 'curly') return cap + [[-22, -298], [-8, -306], [8, -306], [22, -298]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${h}"/>`).join('');
    return cap;
  }

  /* ---------- body ---------- */
  function build(o) {
    const base = CAST[o.who] || CAST.alex;
    const c = Object.assign({}, base, o.over || {});
    const id = o.id || 'p' + ++UID;
    const job = o.job || null;
    let top = c.top, longSleeve = true, sleeve = top;
    if (job === 'nurse') { top = '#6cc5c8'; sleeve = top; longSleeve = false; }
    if (job === 'doctor') { top = '#2e9aa0'; sleeve = '#ffffff'; }
    if (job === 'engineer') { top = '#3b4a63'; sleeve = top; }
    if (job === 'artist') { sleeve = top; }
    const R = { c, id, job, sleeve, longSleeve, held: o.held || {}, expr: o.expr || 'smile', gaze: o.gaze || 0,
      pose: { L: Object.assign({}, POSES[o.poseL || 'rest']), R: Object.assign({}, POSES[o.poseR || 'rest']) }, top };
    REG[id] = R;
    const m = c.m;
    const torso = m
      ? 'M-46 -224 Q-46 -235 -32 -238 L-9 -241 Q0 -236 9 -241 L32 -238 Q46 -235 46 -224 L42 -168 Q40 -140 41 -121 L-41 -121 Q-40 -140 -42 -168 Z'
      : 'M-40 -224 Q-40 -235 -28 -238 L-9 -241 Q0 -236 9 -241 L28 -238 Q40 -235 40 -224 L36 -176 Q31 -150 35 -121 L-35 -121 Q-31 -150 -36 -176 Z';
    const legL = m ? 'M-40 -124 L-2 -124 L-4 -12 L-34 -12Z' : 'M-35 -124 L-2 -124 L-5 -12 L-31 -12Z';
    const legR = m ? 'M2 -124 L40 -124 L34 -12 L4 -12Z' : 'M2 -124 L35 -124 L31 -12 L5 -12Z';
    const pants = c.pants, tsh = shade(top, -0.18);
    const skin = c.skin;
    let jobBody = '', jobHead = '';
    if (job === 'doctor') {
      jobBody = `<path d="M-46 -224 Q-46 -235 -32 -238 L-12 -241 L-4 -190 L-6 -92 L-44 -92 L-42 -168 Z" fill="#fff"/><path d="M46 -224 Q46 -235 32 -238 L12 -241 L4 -190 L6 -92 L44 -92 L42 -168 Z" fill="#fff"/><path d="M-12 -241 L-4 -190 M12 -241 L4 -190" stroke="#d8dee2" stroke-width="2" fill="none"/><path d="M-13 -238 Q-18 -200 -6 -190 Q4 -184 12 -196" fill="none" stroke="#3b3b44" stroke-width="2.6" stroke-linecap="round"/><circle cx="12.5" cy="-196" r="4" fill="#9aa3ad" stroke="#3b3b44" stroke-width="1.5"/>`;
    } else if (job === 'engineer') {
      jobBody = `<path d="M-30 -238 L-12 -240 L-8 -122 L-32 -122Z M30 -238 L12 -240 L8 -122 L32 -122Z" fill="#ff8a1f"/><path d="M-25 -176 H-11 M25 -176 H11 M-26 -150 H-10 M26 -150 H10" stroke="#e8ecef" stroke-width="5"/>`;
      jobHead = `<path d="M-30 -292 Q-28 -325 0 -326 Q28 -325 30 -292 Z" fill="#f5b72e"/><rect x="-33" y="-293" width="66" height="7" rx="3.5" fill="#d99a14"/><rect x="-5" y="-326" width="10" height="14" rx="3" fill="#d99a14"/>`;
    } else if (job === 'artist') {
      jobBody = `<path d="M-30 -218 L30 -218 L36 -121 L-36 -121Z" fill="#ff8c78"/><path d="M-30 -218 L-18 -240 M30 -218 L18 -240" stroke="#ff8c78" stroke-width="5"/><circle cx="-14" cy="-160" r="4" fill="#f5b72e"/><circle cx="10" cy="-140" r="4" fill="#7a5cc4"/>`;
    } else if (job === 'nurse') {
      jobBody = `<rect x="14" y="-200" width="14" height="9" rx="2" fill="#fff" opacity=".9"/><path d="M-8 -241 L0 -222 L8 -241Z" fill="#fff" opacity=".35"/>`;
    } else if (job === 'student') {
      jobBody = `<path d="M-22 -239 L-26 -150 M22 -239 L26 -150" stroke="#e8744f" stroke-width="7" stroke-linecap="round" opacity=".95"/>`;
    }
    const neckline = job === 'doctor' ? '' : `<path d="M-12 -241 Q0 -222 12 -241Z" fill="${shade(skin, -0.08)}"/>`;
    const sh = `<clipPath id="ct-${id}"><path d="${torso}"/></clipPath>`;
    const armL = `<g id="armL-${id}">${armSVG(R, -1, R.pose.L)}</g>`;
    const armR = `<g id="armR-${id}">${armSVG(R, 1, R.pose.R)}</g>`;
    const body = `
      <ellipse cx="0" cy="-2" rx="${m ? 58 : 52}" ry="9" fill="rgba(7,42,48,.28)"/>
      ${hairBack(c)}
      <path d="${legL}" fill="${pants}"/><path d="${legR}" fill="${pants}"/>
      <path d="M0 -124 L0 -60" stroke="${shade(pants, -0.3)}" stroke-width="2"/>
      <rect x="${m ? -42 : -37}" y="-14" width="${m ? 38 : 33}" height="7" fill="${shade(pants, -0.25)}"/><rect x="${m ? 4 : 4}" y="-14" width="${m ? 38 : 33}" height="7" fill="${shade(pants, -0.25)}"/>
      <path d="M-34 -10 Q-34 -22 -20 -16 L-2 -12 L-2 -4 L-34 -4Z" fill="#2b2b33"/><path d="M34 -10 Q34 -22 20 -16 L2 -12 L2 -4 L34 -4Z" fill="#2b2b33"/>
      <rect x="-9" y="-253" width="18" height="20" fill="${shade(skin, -0.1)}"/>
      <path d="${torso}" fill="${top}"/>${sh}
      <rect x="14" y="-245" width="40" height="130" fill="rgba(0,0,0,.11)" clip-path="url(#ct-${id})"/><rect x="-48" y="-245" width="12" height="130" fill="rgba(255,255,255,.10)" clip-path="url(#ct-${id})"/>
      <path d="M-41 -121 L41 -121" stroke="${tsh}" stroke-width="3"/>
      ${neckline}${jobBody}
      <g class="head-g">
        <ellipse cx="-24.5" cy="-272" rx="4.6" ry="7" fill="${shade(skin, -0.06)}"/><ellipse cx="24.5" cy="-272" rx="4.6" ry="7" fill="${shade(skin, -0.06)}"/>
        <path d="M-24 -277 Q-24 -303 0 -303 Q24 -303 24 -277 Q24 -251 0 -243.5 Q-24 -251 -24 -277Z" fill="${skin}"/>
        <path d="M10 -296 Q24 -290 24 -270 Q24 -251 2 -243.5 Q17 -255 18 -272 Q18 -285 10 -296Z" fill="rgba(0,0,0,.07)"/>
        <g id="face-${id}">${faceSVG(c, R.expr, R.gaze)}</g>
        ${hairFront(c)}${jobHead}
      </g>
      ${armL}${armR}`;
    return { id, svg: body, R };
  }
  function person(o) {
    const b = build(o);
    const sx = (o.flip ? -1 : 1) * (o.s || 1), sy = o.s || 1;
    return `<g id="fig-${b.id}" class="fig" transform="translate(${o.x || 0} ${o.y || 0}) scale(${sx} ${sy})"><g class="breath">${b.svg}</g></g>`;
  }
  /* animate arm poses (rAF tween on joint angles) */
  const tweens = {};
  function setPose(id, side, to, ms = 700) {
    const R = REG[id]; if (!R) return Promise.resolve();
    const key = side === 'L' ? 'L' : 'R', s = side === 'L' ? -1 : 1;
    const from = Object.assign({}, R.pose[key]);
    const dest = typeof to === 'string' ? POSES[to] : to;
    const g = document.getElementById(`arm${key}-${id}`);
    if (!g) return Promise.resolve();
    if (document.body.classList.contains('rm')) ms = 1;
    const t0 = performance.now(); const tk = (tweens[id + key] = {});
    return new Promise((res) => {
      const step = (now) => {
        if (tweens[id + key] !== tk) return res();
        const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const p = { a1: from.a1 + (dest.a1 - from.a1) * e, a2: from.a2 + (dest.a2 - from.a2) * e, hand: k < 0.5 ? from.hand : dest.hand, held: dest.held !== undefined ? dest.held : from.held };
        R.pose[key] = p; g.innerHTML = armSVG(R, s, p);
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
  function setExpr(id, expr, gaze) {
    const R = REG[id]; if (!R) return; R.expr = expr; if (gaze !== undefined) R.gaze = gaze;
    const g = document.getElementById('face-' + id); if (g) g.innerHTML = faceSVG(R.c, R.expr, R.gaze);
  }
  function talk(id, on) { const f = document.getElementById('fig-' + id); if (f) f.classList.toggle('talking', !!on); }

  /* ---------- objects ---------- */
  function obj(type, x, y, s = 1, o = {}) {
    const t = `transform="translate(${x} ${y}) scale(${s})"`;
    switch (type) {
      case 'book': return `<g ${t}><ellipse cx="0" cy="2" rx="38" ry="6" fill="rgba(0,0,0,.18)"/><g transform="rotate(-6)"><rect x="-26" y="-64" width="52" height="66" rx="4" fill="#0f6f78"/><rect x="-26" y="-64" width="8" height="66" rx="3" fill="#0b4f57"/><rect x="26" y="-62" width="4" height="62" fill="#fffaf0"/><rect x="-10" y="-48" width="28" height="5" rx="2.5" fill="#f5b72e"/><rect x="-10" y="-38" width="20" height="4" rx="2" fill="#f5b72e" opacity=".7"/><circle cx="4" cy="-18" r="8" fill="none" stroke="#f5b72e" stroke-width="2.5"/></g></g>`;
      case 'phone': return `<g ${t}><ellipse cx="0" cy="2" rx="22" ry="5" fill="rgba(0,0,0,.18)"/><rect x="-17" y="-72" width="34" height="72" rx="7" fill="${o.color || '#4b3a8a'}"/><rect x="-14" y="-67" width="28" height="60" rx="4" fill="#bfe6f2"/><path d="M-14 -67 L14 -40 L14 -67Z" fill="#fff" opacity=".35"/><circle cx="0" cy="-3.5" r="1.8" fill="#fff" opacity=".6"/><rect x="-5" y="-71" width="10" height="2" rx="1" fill="#2a2150"/></g>`;
      case 'laptop': return `<g ${t}><ellipse cx="0" cy="2" rx="52" ry="6" fill="rgba(0,0,0,.18)"/><path d="M-34 -52 L34 -52 L38 -6 L-38 -6Z" fill="#2b3340"/><path d="M-30 -48 L30 -48 L33 -10 L-33 -10Z" fill="#8fd0e0"/><path d="M-30 -48 L8 -48 L-8 -10 L-33 -10Z" fill="#fff" opacity=".25"/><path d="M-46 -4 L46 -4 L40 4 L-40 4Z" fill="#c5ccd4"/><rect x="-8" y="-3" width="16" height="2" rx="1" fill="#9aa3ab"/></g>`;
      case 'bag': { const col = o.color || '#d22f2f'; return `<g ${t}><ellipse cx="0" cy="2" rx="46" ry="6" fill="rgba(0,0,0,.2)"/><path d="M-22 -62 Q-22 -86 0 -86 Q22 -86 22 -62" fill="none" stroke="${shade(col, -0.3)}" stroke-width="7" stroke-linecap="round"/><path d="M-44 -2 Q-48 -34 -36 -62 L36 -62 Q48 -34 44 -2 Z" fill="${col}"/><path d="M-40 -48 Q0 -34 40 -48 L36 -62 L-36 -62Z" fill="${shade(col, -0.18)}"/><circle cx="0" cy="-42" r="5" fill="#f5b72e"/><path d="M-30 -56 Q-34 -30 -34 -10" stroke="#fff" stroke-width="3" opacity=".25" fill="none" stroke-linecap="round"/></g>`; }
      case 'cup': return `<g ${t}><ellipse cx="0" cy="2" rx="26" ry="5" fill="rgba(0,0,0,.18)"/><path d="M-18 -42 L18 -42 L14 -2 Q0 4 -14 -2Z" fill="${o.color || '#ffffff'}"/><path d="M18 -34 Q34 -34 30 -20 Q28 -12 15 -12" fill="none" stroke="${o.color || '#ffffff'}" stroke-width="5"/><ellipse cx="0" cy="-42" rx="18" ry="4" fill="#6b3d22"/><path d="M-4 -52 Q-8 -60 -3 -66 M5 -52 Q1 -60 6 -66" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
      case 'notebook': return `<g ${t}><ellipse cx="0" cy="2" rx="30" ry="5" fill="rgba(0,0,0,.18)"/><rect x="-26" y="-50" width="52" height="50" rx="4" fill="#7a5cc4"/><rect x="-26" y="-50" width="8" height="50" fill="#5a3fa3"/>${[-42, -32, -22, -12, -4].map((y) => `<circle cx="-22" cy="${y}" r="2" fill="#e8e0f8"/>`).join('')}<rect x="-8" y="-34" width="26" height="4" rx="2" fill="#fffaf0"/><rect x="-8" y="-24" width="18" height="3" rx="1.5" fill="#fffaf0" opacity=".7"/></g>`;
      case 'plant': return `<g ${t}><path d="M-22 -50 L22 -50 L16 0 L-16 0Z" fill="#c9714b"/><rect x="-24" y="-56" width="48" height="10" rx="3" fill="#dd8660"/><g class="sway"><path d="M0 -56 Q-30 -90 -40 -130 Q-6 -110 0 -56Z" fill="#2f9a6a"/><path d="M0 -56 Q28 -96 46 -122 Q8 -104 0 -56Z" fill="#3fb07a"/><path d="M0 -56 Q-6 -110 6 -150 Q18 -104 0 -56Z" fill="#23805a"/></g></g>`;
      case 'clock': return `<g ${t}><circle r="28" fill="#fffaf0" stroke="#14606a" stroke-width="5"/><path d="M0 0 L0 -17 M0 0 L13 6" stroke="#14252b" stroke-width="3" stroke-linecap="round"/><circle r="2.5" fill="#c63d27"/></g>`;
      case 'chair': return `<g ${t}><ellipse cx="0" cy="2" rx="40" ry="6" fill="rgba(0,0,0,.18)"/><rect x="-30" y="-110" width="8" height="110" fill="#8a5a33"/><rect x="22" y="-110" width="8" height="110" fill="#8a5a33"/><rect x="-32" y="-112" width="64" height="48" rx="8" fill="${o.color || '#2a9d8f'}"/><rect x="-34" y="-62" width="68" height="14" rx="5" fill="${shade(o.color || '#2a9d8f', -0.2)}"/></g>`;
      case 'apple': return `<g ${t}><ellipse cx="0" cy="2" rx="22" ry="4" fill="rgba(0,0,0,.18)"/><circle cx="-8" cy="-18" r="16" fill="${o.color || '#3fa856'}"/><circle cx="8" cy="-18" r="16" fill="${o.color || '#3fa856'}"/><path d="M0 -34 Q4 -44 12 -46" stroke="#5a3a1e" stroke-width="3" fill="none"/><path d="M4 -38 Q14 -46 22 -38 Q12 -34 4 -38Z" fill="#2f8a45"/></g>`;
      default: return '';
    }
  }
  function table(x, y, w = 360, col = '#b07a46') {
    return `<g transform="translate(${x} ${y})"><rect x="${-w / 2 + 14}" y="12" width="12" height="90" fill="${shade(col, -0.3)}"/><rect x="${w / 2 - 26}" y="12" width="12" height="90" fill="${shade(col, -0.3)}"/><rect x="${-w / 2}" y="-6" width="${w}" height="22" rx="8" fill="${col}"/><rect x="${-w / 2}" y="-6" width="${w}" height="8" rx="4" fill="${shade(col, 0.22)}"/><ellipse cx="0" cy="106" rx="${w / 2}" ry="8" fill="rgba(0,0,0,.14)"/></g>`;
  }

  /* ---------- backgrounds ---------- */
  function motes() {
    return [[120, 120, 0], [300, 300, 3], [520, 180, 6], [700, 90, 9], [860, 280, 2], [420, 80, 5]].map(([x, y, d]) => `<circle class="mote" cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".45" style="animation-delay:-${d}s"/>`).join('');
  }
  function bg(theme, uid) {
    const g = (id, a, b) => `<linearGradient id="${id}${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    if (theme === 'cafe') return `<defs>${g('w', '#ffcfbf', '#ff9a82')}${g('f', '#1b5a63', '#0f3f46')}${g('s', '#ffe6a3', '#ffc85a')}</defs>
      <rect width="960" height="540" fill="url(#w${uid})"/><rect y="300" width="960" height="110" fill="#14606a"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 60 + 2}" y="302" width="56" height="50" fill="#1b7a84" opacity=".5"/><rect x="${i * 60 + 2}" y="356" width="56" height="50" fill="#0f4e57" opacity=".5"/>`).join('')}
      <rect y="410" width="960" height="130" fill="url(#f${uid})"/><rect y="404" width="960" height="10" fill="#0b3a40"/>
      <rect x="560" y="70" width="330" height="180" rx="10" fill="#14464d"/><rect x="570" y="80" width="310" height="160" rx="6" fill="#0f3a41"/><g fill="#fffaf0" opacity=".85"><rect x="590" y="100" width="120" height="8" rx="4"/><rect x="590" y="122" width="170" height="6" rx="3" opacity=".6"/><rect x="590" y="140" width="140" height="6" rx="3" opacity=".6"/><rect x="590" y="158" width="160" height="6" rx="3" opacity=".6"/></g>
      ${[140, 330, 480].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="${60 + (x % 3) * 20}" stroke="#4a3320" stroke-width="3"/><path d="M${x - 34} ${70 + (x % 3) * 20} Q${x} ${34 + (x % 3) * 20} ${x + 34} ${70 + (x % 3) * 20}Z" fill="url(#s${uid})"/><ellipse cx="${x}" cy="${72 + (x % 3) * 20}" rx="30" ry="22" fill="#ffe08a" opacity=".25"/>`).join('')}
      <rect x="40" y="250" width="300" height="60" rx="8" fill="#8a5a33"/><rect x="40" y="250" width="300" height="12" rx="6" fill="#b07a46"/>${obj('cup', 90, 252, .55, { color: '#fffaf0' })}${obj('plant', 300, 252, .5)}
      ${motes()}`;
    if (theme === 'office') return `<defs>${g('w', '#2a8f93', '#14606a')}${g('f', '#b9c3c9', '#8e9aa3')}${g('k', '#bfe6f5', '#ffffff')}</defs>
      <rect width="960" height="540" fill="url(#w${uid})"/><rect y="404" width="960" height="136" fill="url(#f${uid})"/><rect y="398" width="960" height="10" fill="#0f4e57"/>
      <rect x="70" y="50" width="250" height="210" rx="8" fill="#e9f6f5"/><rect x="80" y="60" width="230" height="190" fill="url(#k${uid})"/><path d="M195 60 V250 M80 155 H310" stroke="#e9f6f5" stroke-width="6"/><circle cx="260" cy="110" r="26" fill="#fff6c7" opacity=".9"/>
      <rect x="600" y="70" width="300" height="170" rx="6" fill="#fffaf0" stroke="#d9c9a5" stroke-width="6"/><g stroke="#14606a" stroke-width="3" fill="none" opacity=".6"><path d="M630 110 H760 M630 140 H820 M630 170 H730"/></g><rect x="780" y="105" width="90" height="60" rx="6" fill="#ffe0da" opacity=".8"/>
      <g class="sway">${obj('plant', 880, 400, .9)}</g>${motes()}`;
    if (theme === 'plain') return `<defs><radialGradient id="r${uid}" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f1dfbd"/></radialGradient></defs><rect width="960" height="540" fill="url(#r${uid})"/><circle cx="880" cy="90" r="150" fill="#1f8a8a" opacity=".1"/><circle cx="60" cy="470" r="190" fill="#7a5cc4" opacity=".1"/><circle cx="780" cy="500" r="110" fill="#ff6f59" opacity=".09"/><rect y="470" width="960" height="70" fill="#d9c49a" opacity=".5"/>`;
    // classroom (default)
    const books = Array.from({ length: 9 }, (_, i) => { const cols = ['#ff6f59', '#1f8a8a', '#f5b72e', '#7a5cc4', '#14606a']; const h = 44 + (i * 17) % 22; return `<rect x="${796 + i * 14}" y="${166 - h}" width="12" height="${h}" fill="${cols[i % 5]}" rx="1.5"/>`; }).join('');
    return `<defs>${g('w', '#fff3da', '#f6e2bb')}${g('f', '#d4a066', '#a8733f')}${g('k', '#9fdcf0', '#e9f9ff')}</defs>
      <rect width="960" height="540" fill="url(#w${uid})"/><rect y="270" width="960" height="140" fill="#14606a" opacity=".92"/><rect y="262" width="960" height="12" fill="#0f4e57"/>
      <rect y="406" width="960" height="134" fill="url(#f${uid})"/>${Array.from({ length: 8 }, (_, i) => `<line x1="${i * 140 - 60}" y1="540" x2="${i * 80 + 160}" y2="406" stroke="#8a5a33" stroke-width="2" opacity=".35"/>`).join('')}<rect y="400" width="960" height="9" fill="#0b3a40"/>
      <rect x="60" y="40" width="260" height="196" rx="10" fill="#fffaf0" stroke="#d9c9a5" stroke-width="6"/><rect x="74" y="54" width="232" height="168" fill="url(#k${uid})"/><path d="M190 54 V222 M74 138 H306" stroke="#fffaf0" stroke-width="7"/><circle cx="262" cy="96" r="30" fill="#fff4b8" opacity=".95"/><g fill="#fff" opacity=".9"><ellipse cx="120" cy="92" rx="30" ry="12"/><ellipse cx="142" cy="84" rx="20" ry="11"/></g>
      <path d="M74 222 L150 54 L190 54 L110 222Z" fill="#fff6c7" opacity=".18"/>
      <rect x="780" y="40" width="150" height="360" rx="6" fill="#8a5a33"/><rect x="790" y="50" width="130" height="340" rx="4" fill="#a8733f"/><rect x="790" y="170" width="130" height="8" fill="#6d4524"/><rect x="790" y="286" width="130" height="8" fill="#6d4524"/>${books}${books.replace(/y="(\d+(\.\d+)?)"/g, (m, y) => `y="${+y + 116}"`)}
      <g class="sway">${obj('plant', 722, 402, .95)}</g>
      <rect x="400" y="60" width="260" height="140" rx="6" fill="#f4faf9" stroke="#b9c6c8" stroke-width="6"/><g stroke="#14606a" stroke-width="3" opacity=".5" fill="none"><path d="M425 100 H560 M425 130 H620 M425 160 H520"/></g>${obj('clock', 360, 90, .9)}
      ${motes()}`;
  }

  /** Scene: o.bg, o.people (person opts), o.objs [{type,x,y,s,o}], o.ov overlays [{x,y,html,cls,id}], o.extra raw svg */
  function scene(o) {
    const uid = ++UID;
    const ppl = (o.people || []).map((p) => person(p)).join('');
    const objs = (o.objs || []).map((a) => (a.raw ? a.raw : obj(a.type, a.x, a.y, a.s, a.o))).join('');
    const ov = (o.ov || []).map((v) => `<div class="ov ${v.cls || ''}" ${v.id ? `id="${v.id}"` : ''} style="left:${(v.x / 9.6).toFixed(2)}%;top:${(v.y / 5.4).toFixed(2)}%">${v.html}</div>`).join('');
    const bubbles = (o.bubbles || []).map((v) => `<div class="bubble" id="${v.id}" style="left:${(v.x / 9.6).toFixed(2)}%;top:${(v.y / 5.4).toFixed(2)}%">${v.html}</div>`).join('');
    const rings = (o.rings || []).map((v) => `<div class="ring ${v.cls || ''}" id="${v.id}" style="left:${(v.x / 9.6).toFixed(2)}%;top:${(v.y / 5.4).toFixed(2)}%;width:${(v.w / 9.6).toFixed(2)}%;height:${(v.h / 5.4).toFixed(2)}%;"></div>`).join('');
    return `<div class="scene ${o.cls || ''}" ${o.id ? `id="${o.id}"` : ''} role="img" aria-label="${(o.alt || '').replace(/"/g, '&quot;')}"><svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bg(o.bg || 'class', uid)}${o.back || ''}${objs}${ppl}${o.extra || ''}</svg>${rings}${ov}${bubbles}</div>`;
  }
  return { hand, CAST, POSES, person, setPose, setExpr, talk, obj, table, scene, shade, REG };
})();
