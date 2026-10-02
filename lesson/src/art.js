/* ============================================================
   ART — original SVG illustration: cast, props, backgrounds
   Design canvas is 1600 x 900. Everything here returns SVG strings.
   ============================================================ */
const A = {};

A.defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="shadeH" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff2cf" stop-opacity=".30"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b0e3a" stop-opacity=".34"/></linearGradient>
<linearGradient id="shadeV" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b0e3a" stop-opacity=".32"/></linearGradient>
<linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff0d2"/><stop offset="1" stop-color="#f6dcb0"/></linearGradient>
<linearGradient id="wallDark" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2a2f86"/><stop offset="1" stop-color="#171b55"/></linearGradient>
<linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c88f58"/><stop offset="1" stop-color="#8e5b36"/></linearGradient>
<linearGradient id="wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e2a769"/><stop offset="1" stop-color="#b57841"/></linearGradient>
<linearGradient id="woodSide" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#a86d3b"/><stop offset="1" stop-color="#7d4d28"/></linearGradient>
<linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7fe2dc"/><stop offset="1" stop-color="#d4f6ef"/></linearGradient>
<linearGradient id="skyNight" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1c2270"/><stop offset="1" stop-color="#3b3f98"/></linearGradient>
<linearGradient id="beam" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></linearGradient>
<radialGradient id="glowGold" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd978" stop-opacity=".85"/><stop offset="1" stop-color="#ffd978" stop-opacity="0"/></radialGradient>
<radialGradient id="glowTeal" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#34d6cc" stop-opacity=".7"/><stop offset="1" stop-color="#34d6cc" stop-opacity="0"/></radialGradient>
<radialGradient id="glowCoral" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff7a69" stop-opacity=".6"/><stop offset="1" stop-color="#ff7a69" stop-opacity="0"/></radialGradient>
<radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#0b0e3a" stop-opacity="0"/><stop offset="1" stop-color="#0b0e3a" stop-opacity=".55"/></radialGradient>
<filter id="blur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="blur8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="blur18" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>
</defs></svg>`;

/* ---------- cast: explicit, consistent identities ---------- */
A.cast = {
  alex: { name: 'Alex', sex: 'm', skin: '#c58a5c', skinD: '#8f5c38', hair: '#2a1b14', shirt: '#2f3aa8', shirtD: '#1d2575', pants: '#2c3350', shoe: '#1f1a2e', hairStyle: 'short', beard: 'stubble', eye: '#3a2418' },
  sam:  { name: 'Sam',  sex: 'm', skin: '#f0c4a0', skinD: '#b98763', hair: '#5a3a22', shirt: '#ff7a69', shirtD: '#d4513f', pants: '#3b4a63', shoe: '#2b2230', hairStyle: 'wavy',  beard: 'full', eye: '#4a6a7a' },
  nora: { name: 'Nora', sex: 'f', skin: '#8a5a3c', skinD: '#5e3a24', hair: '#1a1210', shirt: '#f4b942', shirtD: '#c88f1e', pants: '#2a2f86', shoe: '#1f1a2e', hairStyle: 'puff',  beard: '', eye: '#2a1a12', cardigan: '#2a2f86' },
  maya: { name: 'Maya', sex: 'f', skin: '#d9a074', skinD: '#a06d44', hair: '#1c1418', shirt: '#25b9b0', shirtD: '#168a84', pants: '#3a3f6a', shoe: '#f3e9d8', hairStyle: 'long',  beard: '', eye: '#2a1a12', coat: '#f7f4ee' }
};

/* tapered limb as two stroked layers (outline + fill) */
A.line = (x0, y0, x1, y1, w, fill, edge) =>
  `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${edge}" stroke-width="${w + 3}" stroke-linecap="round"/>` +
  `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;

/* A hand: palm + four fingers + thumb = five digits. Local frame: origin at wrist,
   +y toward the fingertips, thumb on -x (right-arm design; mirrored for the left arm). */
A.hand = (style, skin, edge) => {
  const D = (bx, by, len, ang, w) => { // one digit, angle measured from +y toward -x (thumb side) negative
    const r = ang * Math.PI / 180;
    const ex = bx + Math.sin(r) * len, ey = by + Math.cos(r) * len;
    return A.line(bx, by, ex, ey, w, skin, edge);
  };
  let d = '';
  const palm = `<path d="M-12,-2 Q-15,16 -12.5,34 Q0,41 12.5,34 Q15,16 12,-2 Q0,-6 -12,-2Z" fill="${skin}" stroke="${edge}" stroke-width="1.6"/>`;
  if (style === 'open') {
    d += D(10, 31, 22, 14, 7) + D(3.4, 34, 30, 5, 7.4) + D(-3.4, 34, 33, -4, 7.6) + D(-10, 31, 30, -13, 7.4); // pinky..index drawn back to front
    d += D(-11, 14, 24, -62, 8.6);
  } else if (style === 'flat') {
    d += D(10, 31, 23, 4, 7) + D(3.4, 34, 31, 1, 7.4) + D(-3.4, 34, 34, -1, 7.6) + D(-10, 31, 31, -4, 7.4);
    d += D(-11, 14, 22, -48, 8.6);
  } else if (style === 'point') {
    d += D(10, 31, 12, 6, 7) + D(3.4, 34, 14, 3, 7.4) + D(-3.4, 34, 15, -2, 7.6);
    d += D(-10, 31, 36, -5, 7.4) + D(-11, 16, 16, -78, 8.6);
  } else if (style === 'hold') {
    d += D(10, 31, 16, 4, 7) + D(3.4, 34, 19, 0, 7.4) + D(-3.4, 34, 20, -3, 7.6) + D(-10, 31, 18, -6, 7.4);
    d += D(-11, 14, 17, -52, 8.6);
  } else { // relaxed, loosely curled
    d += D(10, 31, 17, 2, 7) + D(3.4, 34, 21, 0, 7.4) + D(-3.4, 34, 22, -2, 7.6) + D(-10, 31, 20, -5, 7.4);
    d += D(-12, 13, 19, -26, 8.6);
  }
  // knuckle creases hint separation between the digits
  const cr = `<path d="M-7,36 L-7,41 M0,38 L0,43 M7,36 L7,41" stroke="${edge}" stroke-width="1.1" stroke-linecap="round" opacity=".55" fill="none"/>`;
  return d + palm + (style === 'open' || style === 'flat' ? '' : cr);
};

/* named arm poses (a = upper-arm angle from straight down, f = forearm angle; positive = outward/up) */
A.poses = {
  rest:    { R: { a: 7, f: 14, h: 'relaxed' },  L: { a: 7, f: 14, h: 'relaxed' } },
  present: { R: { a: 12, f: 104, h: 'open' },   L: { a: 7, f: 14, h: 'relaxed' } },       // open palm toward screen-right
  presentL:{ L: { a: 12, f: 104, h: 'open' },   R: { a: 7, f: 14, h: 'relaxed' } },       // open palm toward screen-left
  point:   { R: { a: 34, f: 92, h: 'point' },   L: { a: 7, f: 14, h: 'relaxed' } },
  pointL:  { L: { a: 34, f: 92, h: 'point' },   R: { a: 7, f: 14, h: 'relaxed' } },
  chest:   { R: { a: 9, f: -118, h: 'open' },   L: { a: 7, f: 14, h: 'relaxed' } },       // hand to own chest ("I")
  raise:   { R: { a: 84, f: 176, h: 'open' },   L: { a: 7, f: 14, h: 'relaxed' } },
  two:     { R: { a: 12, f: 100, h: 'open' },   L: { a: 12, f: 100, h: 'open' } },        // both palms gently open (group "we")
  desk:    { R: { a: 20, f: -62, h: 'flat' },   L: { a: 20, f: -62, h: 'flat' } },        // forearms resting on a desk
  deskPt:  { R: { a: 26, f: 60, h: 'point' },   L: { a: 20, f: -62, h: 'flat' } },
  card:    { R: { a: 14, f: -96, h: 'hold' },   L: { a: 14, f: -96, h: 'hold' } }         // holding something at the waist
};

A.person = function (o) {
  const c = A.cast[o.k];
  const { x = 0, y = 0, s = 1, look = [0, 0], seated = false, talking = false } = o;
  const m = c.sex === 'm';
  const sw = m ? 80 : 66;              // half shoulder width
  const SY = -438;                    // shoulder line
  const preset = A.poses[o.pose || 'rest'];
  const armDef = (side) => Object.assign({}, preset[side], (o['arm' + side]) || {});
  const dirv = (side, th) => { const sg = side === 'R' ? 1 : -1, r = th * Math.PI / 180; return [sg * Math.sin(r), Math.cos(r)]; };
  const UL = 110, FL = 98;
  const arm = (side) => {
    const d = armDef(side), sg = side === 'R' ? 1 : -1;
    const sx = sg * (sw - 9), sy = SY + 12;
    const u = dirv(side, d.a), ex = sx + u[0] * UL, ey = sy + u[1] * UL;
    const f = dirv(side, d.f), wx = ex + f[0] * FL, wy = ey + f[1] * FL;
    const sleeveEnd = (c.coat || c.cardigan) ? 1.0 : 0.62;
    const hx = sx + u[0] * UL * sleeveEnd, hy = sy + u[1] * UL * sleeveEnd;
    const hand = `<g transform="translate(${wx.toFixed(1)},${wy.toFixed(1)}) rotate(${(-sg * d.f).toFixed(1)}) scale(${sg * 1.08},1.08)">${A.hand(d.h, c.skin, c.skinD)}</g>`;
    const sleeveCol = c.coat ? c.coat : (c.cardigan ? c.cardigan : c.shirt);
    const sleeveEdge = c.coat ? '#cfc9bd' : (c.cardigan ? '#1a1f66' : c.shirtD);
    let out = A.line(sx, sy, ex, ey, m ? 29 : 25, c.skin, c.skinD);
    out += A.line(ex, ey, wx, wy, m ? 23 : 20, c.skin, c.skinD);
    // shading on forearm (cheap volume)
    out += `<line x1="${ex.toFixed(1)}" y1="${ey.toFixed(1)}" x2="${wx.toFixed(1)}" y2="${wy.toFixed(1)}" stroke="url(#shadeH)" stroke-width="${m ? 21 : 18}" stroke-linecap="round" opacity=".5"/>`;
    // long coat/cardigan sleeves cover more of the forearm
    if (c.coat || c.cardigan) {
      const fe = 0.8;
      out += A.line(ex, ey, ex + f[0] * FL * fe, ey + f[1] * FL * fe, 26, sleeveCol, sleeveEdge);
    }
    out += A.line(sx, sy, hx, hy, m ? 38 : 34, sleeveCol, sleeveEdge);
    out += `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="url(#shadeH)" stroke-width="${m ? 36 : 32}" stroke-linecap="round" opacity=".55"/>`;
    return out + hand;
  };

  /* ---------- legs ---------- */
  let legs = '';
  if (!seated) {
    const hp = m ? 56 : 64;
    const leg = (sg) => `<path d="M${sg * 2},-272 L${sg * (hp + 2)},-272 L${sg * (hp - 12)},-26 L${sg * 9},-26 Z" fill="${c.pants}" stroke="#0b0e3a" stroke-opacity=".25" stroke-width="1.5"/>` +
      `<path d="M${sg * 8},-30 L${sg * (hp - 13)},-30 Q${sg * (hp - 8)},4 ${sg * (hp + 18)},4 L${sg * 14},4 Q${sg * 6},-6 ${sg * 8},-30 Z" fill="${c.shoe}"/>`;
    legs = `<ellipse cx="0" cy="6" rx="${m ? 104 : 96}" ry="13" fill="#0b0e3a" opacity=".28" filter="url(#blur8)"/>` + leg(-1) + leg(1);
  }

  /* ---------- torso ---------- */
  const tw = sw - 8, ww = m ? 58 : 50, hw = m ? 58 : 66;
  let torsoCol = c.shirt, torsoEdge = c.shirtD;
  let torso = `<path d="M${-14},-456 L${14},-456 Q${tw + 6},-452 ${sw + 3},-428 Q${tw + 8},-380 ${ww},-330 L${hw},-258 L${-hw},-258 L${-ww},-330 Q${-tw - 8},-380 ${-sw - 3},-428 Q${-tw - 6},-452 -14,-456Z" fill="${torsoCol}" stroke="${torsoEdge}" stroke-width="2"/>`;
  torso += `<path d="M${-14},-456 L${14},-456 Q${tw + 6},-452 ${sw + 3},-428 Q${tw + 8},-380 ${ww},-330 L${hw},-258 L${-hw},-258 L${-ww},-330 Q${-tw - 8},-380 ${-sw - 3},-428 Q${-tw - 6},-452 -14,-456Z" fill="url(#shadeH)"/>`;
  let torsoTop = '';
  if (c.coat) { // white coat with lapels over a turquoise top + stethoscope
    torso = `<path d="M-14,-456 L14,-456 Q${tw + 6},-452 ${sw + 3},-428 Q${tw + 9},-380 ${ww + 3},-330 L${hw + 6},-236 L${-hw - 6},-236 L${-ww - 3},-330 Q${-tw - 9},-380 ${-sw - 3},-428 Q${-tw - 6},-452 -14,-456Z" fill="${c.coat}" stroke="#cfc9bd" stroke-width="2"/>`;
    torso += `<path d="M-14,-456 L14,-456 L18,-330 L0,-300 L-18,-330Z" fill="${c.shirt}"/>`;
    torso += `<path d="M-14,-456 L-34,-420 L-14,-378 L-6,-440Z M14,-456 L34,-420 L14,-378 L6,-440Z" fill="#fff" stroke="#cfc9bd" stroke-width="1.5"/>`;
    torso += `<path d="M-12,-452 Q-32,-380 -4,-336 Q14,-330 24,-352" fill="none" stroke="#32385f" stroke-width="3"/><circle cx="24" cy="-352" r="7" fill="#c9ced9" stroke="#32385f" stroke-width="2"/>`;
    torso += `<path d="M-14,-456 L14,-456 Q${tw + 6},-452 ${sw + 3},-428 Q${tw + 9},-380 ${ww + 3},-330 L${hw + 6},-236 L${-hw - 6},-236 L${-ww - 3},-330 Q${-tw - 9},-380 ${-sw - 3},-428 Q${-tw - 6},-452 -14,-456Z" fill="url(#shadeH)"/>`;
  } else if (c.cardigan) { // open cardigan over a golden blouse
    torso = `<path d="M-14,-456 L14,-456 Q${tw + 6},-452 ${sw + 3},-428 Q${tw + 8},-380 ${ww},-330 L${hw},-258 L${-hw},-258 L${-ww},-330 Q${-tw - 8},-380 ${-sw - 3},-428 Q${-tw - 6},-452 -14,-456Z" fill="${c.cardigan}" stroke="#1a1f66" stroke-width="2"/>`;
    torso += `<path d="M-14,-456 L14,-456 L24,-330 L16,-258 L-16,-258 L-24,-330Z" fill="${c.shirt}" stroke="${c.shirtD}" stroke-width="1.5"/>`;
    torso += `<path d="M-14,-456 L14,-456 Q${tw + 6},-452 ${sw + 3},-428 Q${tw + 8},-380 ${ww},-330 L${hw},-258 L${-hw},-258 L${-ww},-330 Q${-tw - 8},-380 ${-sw - 3},-428 Q${-tw - 6},-452 -14,-456Z" fill="url(#shadeH)"/>`;
  } else if (o.k === 'alex') { // button shirt
    torsoTop = `<path d="M-14,-456 L0,-424 L14,-456 L24,-444 L0,-404 L-24,-444Z" fill="#fff6e5" stroke="#d9c9a8" stroke-width="1.2"/><path d="M0,-404 L0,-262" stroke="${c.shirtD}" stroke-width="1.6"/>` +
      [-380, -340, -300].map(yy => `<circle cx="0" cy="${yy}" r="2.6" fill="#fff6e5"/>`).join('');
  } else if (o.k === 'sam') { // crew-neck sweater with ribbing
    torsoTop = `<path d="M-18,-456 Q0,-432 18,-456 L14,-456 Q0,-440 -14,-456Z" fill="${c.shirtD}"/>` +
      `<path d="M${-hw},-258 L${hw},-258 L${hw - 2},-272 L${-hw + 2},-272Z" fill="${c.shirtD}" opacity=".7"/>`;
  }
  // light rim from the window (left)
  const rim = `<path d="M${-sw - 3},-428 Q${-tw - 8},-380 ${-ww},-330" fill="none" stroke="#ffe3a0" stroke-width="3" opacity=".6" stroke-linecap="round"/>`;

  /* ---------- neck, head ---------- */
  const neck = `<path d="M-15,-476 L15,-476 L17,-450 Q0,-438 -17,-450Z" fill="${c.skin}" stroke="${c.skinD}" stroke-width="1.5"/><path d="M-15,-476 L15,-476 L15,-462 Q0,-452 -15,-462Z" fill="#0b0e3a" opacity=".18"/>`;
  const hy = -510, lx = look[0], ly = look[1];
  const jaw = m ? 36 : 32;
  const head = `<path d="M${-jaw},${hy - 6} Q${-jaw - 2},${hy - 40} 0,${hy - 42} Q${jaw + 2},${hy - 40} ${jaw},${hy - 6} Q${jaw - 2},${hy + 30} ${m ? 14 : 11},${hy + 40} Q0,${hy + 46} ${m ? -14 : -11},${hy + 40} Q${-jaw + 2},${hy + 30} ${-jaw},${hy - 6}Z" fill="${c.skin}" stroke="${c.skinD}" stroke-width="1.8"/>` +
    `<path d="M${-jaw},${hy - 6} Q${-jaw - 2},${hy - 40} 0,${hy - 42} Q${jaw + 2},${hy - 40} ${jaw},${hy - 6} Q${jaw - 2},${hy + 30} ${m ? 14 : 11},${hy + 40} Q0,${hy + 46} ${m ? -14 : -11},${hy + 40} Q${-jaw + 2},${hy + 30} ${-jaw},${hy - 6}Z" fill="url(#shadeH)"/>`;
  const ears = [-1, 1].map(sg => `<ellipse cx="${sg * (jaw + 1)}" cy="${hy + 2}" rx="5" ry="9" fill="${c.skin}" stroke="${c.skinD}" stroke-width="1.5"/>`).join('');
  const brow = m ? 4.2 : 3;
  const eyes = [-1, 1].map(sg => {
    const ex = sg * 14;
    return `<g><ellipse cx="${ex}" cy="${hy + 1}" rx="7" ry="5.2" fill="#fffaf0"/>` +
      `<circle cx="${ex + lx}" cy="${hy + 1 + ly}" r="3.8" fill="${c.eye}"/><circle cx="${ex + lx}" cy="${hy + 1 + ly}" r="1.8" fill="#120a08"/><circle cx="${ex + lx + 1.4}" cy="${hy - 0.4 + ly}" r="1" fill="#fff"/>` +
      `<g class="lid" style="transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0)"><ellipse cx="${ex}" cy="${hy + 1}" rx="7.6" ry="5.8" fill="${c.skin}"/></g>` +
      `<path d="M${ex - 8},${hy - 2} Q${ex},${hy - 7} ${ex + 8},${hy - 2}" fill="none" stroke="#2a1a12" stroke-width="1.6" stroke-linecap="round"/></g>` +
      `<path d="M${ex - 9},${hy - 10 + (sg < 0 ? 1 : 0)} Q${ex},${hy - 15} ${ex + 9},${hy - 10 + (sg < 0 ? 0 : 1)}" fill="none" stroke="${c.hair}" stroke-width="${brow}" stroke-linecap="round"/>`;
  }).join('');
  const nose = `<path d="M${lx * 0.5},${hy + 3} Q${lx * 0.5 + 4},${hy + 16} ${lx * 0.5 - 1},${hy + 19} Q${lx * 0.5 - 5},${hy + 20} ${lx * 0.5 - 6},${hy + 17}" fill="none" stroke="${c.skinD}" stroke-width="2" stroke-linecap="round"/>`;
  const mouthY = hy + 28;
  const mouth = `<g class="mouth-closed"><path d="M-11,${mouthY} Q0,${mouthY + 8} 11,${mouthY}" fill="none" stroke="#7a2e2e" stroke-width="2.6" stroke-linecap="round"/></g>` +
    `<g class="mouth-open" opacity="0"><path d="M-9,${mouthY - 1} Q0,${mouthY + 12} 9,${mouthY - 1} Q0,${mouthY + 2} -9,${mouthY - 1}Z" fill="#7a2e2e"/><path d="M-7,${mouthY} Q0,${mouthY + 3} 7,${mouthY}" stroke="#fff" stroke-width="2.2" fill="none"/></g>`;
  const cheeks = `<ellipse cx="-22" cy="${hy + 18}" rx="7" ry="4.5" fill="#ff7a69" opacity=".16"/><ellipse cx="22" cy="${hy + 18}" rx="7" ry="4.5" fill="#ff7a69" opacity=".16"/>`;
  let facial = '';
  if (c.beard === 'full') facial = `<path d="M${-jaw + 1},${hy + 6} Q${-jaw},${hy + 40} -10,${hy + 46} Q0,${hy + 50} 10,${hy + 46} Q${jaw},${hy + 40} ${jaw - 1},${hy + 6} Q${jaw - 6},${hy + 24} 15,${hy + 22} Q8,${hy + 20} 0,${hy + 22} Q-8,${hy + 20} -15,${hy + 22} Q${-jaw + 6},${hy + 24} ${-jaw + 1},${hy + 6}Z" fill="${c.hair}" opacity=".95"/>` +
    `<path d="M-9,${mouthY - 5} Q0,${mouthY - 9} 9,${mouthY - 5}" stroke="${c.hair}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if (c.beard === 'stubble') facial = `<path d="M${-jaw + 3},${hy + 10} Q${-jaw + 2},${hy + 38} -10,${hy + 44} Q0,${hy + 47} 10,${hy + 44} Q${jaw - 2},${hy + 38} ${jaw - 3},${hy + 10} Q${jaw - 8},${hy + 24} 12,${hy + 22} Q0,${hy + 18} -12,${hy + 22} Q${-jaw + 8},${hy + 24} ${-jaw + 3},${hy + 10}Z" fill="#1a100c" opacity=".28"/>`;
  // hair
  let hairBack = '', hairFront = '';
  const hc = c.hair;
  if (c.hairStyle === 'short') {
    hairFront = `<path d="M${-jaw - 2},${hy - 8} Q${-jaw - 6},${hy - 52} 0,${hy - 54} Q${jaw + 6},${hy - 52} ${jaw + 2},${hy - 8} Q${jaw - 2},${hy - 28} ${jaw - 10},${hy - 32} Q10,${hy - 40} -14,${hy - 30} Q${-jaw + 4},${hy - 28} ${-jaw - 2},${hy - 8}Z" fill="${hc}"/><path d="M-14,${hy - 30} Q10,${hy - 44} ${jaw - 10},${hy - 32}" stroke="#5a4033" stroke-width="2" fill="none" opacity=".55"/>`;
  } else if (c.hairStyle === 'wavy') {
    hairBack = `<path d="M${-jaw - 3},${hy - 4} Q${-jaw - 8},${hy - 56} 0,${hy - 58} Q${jaw + 8},${hy - 56} ${jaw + 3},${hy - 4} L${jaw},${hy - 14} L${-jaw},${hy - 14}Z" fill="${hc}"/>`;
    hairFront = `<path d="M${-jaw - 3},${hy - 6} Q${-jaw - 10},${hy - 54} -6,${hy - 60} Q${jaw + 8},${hy - 58} ${jaw + 3},${hy - 6} Q${jaw - 2},${hy - 26} ${jaw - 8},${hy - 30} Q${jaw - 18},${hy - 36} 6,${hy - 30} Q-4,${hy - 42} -16,${hy - 30} Q${-jaw + 6},${hy - 34} ${-jaw + 2},${hy - 22} Q${-jaw - 2},${hy - 16} ${-jaw - 3},${hy - 6}Z" fill="${hc}"/><path d="M-20,${hy - 44} Q-4,${hy - 54} 14,${hy - 46}" stroke="#8a6040" stroke-width="2.4" fill="none" opacity=".5"/>`;
  } else if (c.hairStyle === 'puff') {
    hairBack = `<circle cx="0" cy="${hy - 64}" r="30" fill="${hc}"/><circle cx="-24" cy="${hy - 50}" r="22" fill="${hc}"/><circle cx="24" cy="${hy - 50}" r="22" fill="${hc}"/>`;
    hairFront = `<path d="M${-jaw - 3},${hy - 4} Q${-jaw - 6},${hy - 50} 0,${hy - 52} Q${jaw + 6},${hy - 50} ${jaw + 3},${hy - 4} Q${jaw - 2},${hy - 30} 0,${hy - 32} Q${-jaw + 2},${hy - 30} ${-jaw - 3},${hy - 4}Z" fill="${hc}"/><path d="M-20,${hy - 42} Q-2,${hy - 50} 16,${hy - 44}" stroke="#5a4033" stroke-width="2" fill="none" opacity=".5"/>`;
  } else if (c.hairStyle === 'long') {
    hairBack = `<path d="M${-jaw - 6},${hy - 20} Q${-jaw - 14},${hy + 40} ${-jaw - 4},${hy + 78} L${jaw + 4},${hy + 78} Q${jaw + 14},${hy + 40} ${jaw + 6},${hy - 20}Z" fill="${hc}"/>`;
    hairFront = `<path d="M${-jaw - 3},${hy + 4} Q${-jaw - 8},${hy - 52} 0,${hy - 54} Q${jaw + 8},${hy - 52} ${jaw + 3},${hy + 4} Q${jaw - 4},${hy - 22} 8,${hy - 32} Q-8,${hy - 22} ${-jaw + 8},${hy - 12} Q${-jaw + 2},${hy - 4} ${-jaw - 3},${hy + 4}Z" fill="${hc}"/><path d="M-16,${hy - 42} Q2,${hy - 52} 18,${hy - 42}" stroke="#6a5560" stroke-width="2.2" fill="none" opacity=".5"/>`;
  }
  const headG = `<g class="headg" transform="rotate(${o.tilt || 0},0,-452)">${hairBack}${neck}${ears}${head}${cheeks}${eyes}${nose}${mouth}${facial}${hairFront}</g>`;
  const legsOrNone = legs;
  const body = `<g class="body">${torso}${torsoTop}${rim}</g>`;
  const arms = '<g class="arms"><!--A-->' + arm('L') + arm('R') + '<!--/A--></g>';
  return `<g class="person ${talking ? 'talking' : ''}" data-k="${o.k}" transform="translate(${x},${y}) scale(${s})">${legsOrNone}${body}${arms}${headG}</g>`;
};

/* ---------------- props ---------------- */
A.obj = {};
A.obj.phone = (x, y, s = 1, col = '#232a6e') => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="8" rx="38" ry="7" fill="#000" opacity=".25" filter="url(#blur3)"/>
<rect x="-26" y="-70" width="52" height="82" rx="9" fill="#10133c"/><rect x="-23" y="-66" width="46" height="74" rx="6" fill="${col}"/><rect x="-23" y="-66" width="46" height="74" rx="6" fill="url(#shadeH)"/>
<circle cx="-8" cy="-48" r="9" fill="#34d6cc" opacity=".9"/><rect x="-6" y="-30" width="30" height="5" rx="2.5" fill="#fff6e5" opacity=".8"/><rect x="-18" y="-20" width="36" height="5" rx="2.5" fill="#fff6e5" opacity=".5"/><circle cx="0" cy="3" r="2" fill="#fff6e5" opacity=".6"/></g>`;
A.obj.book = (x, y, s = 1, col = '#ff7a69', w = 90) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="${w / 2 - 5}" cy="4" rx="${w / 2 + 10}" ry="6" fill="#000" opacity=".22" filter="url(#blur3)"/>
<rect x="0" y="-18" width="${w}" height="20" rx="3" fill="${col}"/><rect x="0" y="-18" width="${w}" height="20" rx="3" fill="url(#shadeV)"/><rect x="6" y="-14" width="${w - 12}" height="12" rx="2" fill="#fff6e5"/><path d="M6,-9 H${w - 6} M6,-5 H${w - 6}" stroke="#e1caa0" stroke-width="1.4"/></g>`;
A.obj.books = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">${A.obj.book(0, 0, 1, '#2f3aa8', 100)}${A.obj.book(8, -22, 1, '#f4b942', 92)}</g>`;
A.obj.bag = (x, y, s = 1, col = '#2f6fd8', dark = '#1a3f8c') => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="6" rx="62" ry="10" fill="#000" opacity=".25" filter="url(#blur3)"/>
<path d="M-44,0 Q-52,-70 -30,-104 Q0,-124 30,-104 Q52,-70 44,0 Q0,10 -44,0Z" fill="${col}" stroke="${dark}" stroke-width="3"/><path d="M-44,0 Q-52,-70 -30,-104 Q0,-124 30,-104 Q52,-70 44,0 Q0,10 -44,0Z" fill="url(#shadeH)"/>
<rect x="-30" y="-48" width="60" height="38" rx="10" fill="${dark}" opacity=".55"/><path d="M-30,-60 Q0,-52 30,-60" stroke="${dark}" stroke-width="3" fill="none"/><path d="M-18,-108 Q0,-134 18,-108" stroke="${dark}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="0" cy="-34" r="4" fill="#f4b942"/></g>`;
A.obj.pen = (x, y, s = 1, col = '#2f6fd8') => `<g transform="translate(${x},${y}) rotate(-12) scale(${s})"><rect x="-60" y="-5" width="120" height="10" rx="5" fill="${col}"/><rect x="-60" y="-5" width="120" height="10" rx="5" fill="url(#shadeV)"/><path d="M60,-5 L78,0 L60,5Z" fill="#f4e3c0"/><path d="M72,-1.6 L78,0 L72,1.6Z" fill="${col}"/><rect x="-60" y="-3" width="30" height="3" rx="1.5" fill="#fff" opacity=".35"/></g>`;
A.obj.laptop = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="8" rx="110" ry="10" fill="#000" opacity=".25" filter="url(#blur3)"/>
<path d="M-80,-100 H80 Q86,-100 86,-94 V-6 H-86 V-94 Q-86,-100 -80,-100Z" fill="#2c3350"/><rect x="-76" y="-92" width="152" height="80" rx="4" fill="#173a5a"/><rect x="-76" y="-92" width="152" height="80" rx="4" fill="url(#shadeH)"/>
<circle cx="-30" cy="-52" r="20" fill="#34d6cc" opacity=".55"/><rect x="-6" y="-60" width="60" height="6" rx="3" fill="#fff6e5" opacity=".7"/><rect x="-6" y="-46" width="44" height="6" rx="3" fill="#fff6e5" opacity=".45"/>
<path d="M-100,-4 H100 L90,8 H-90Z" fill="#9aa3c7"/><rect x="-20" y="-3" width="40" height="4" rx="2" fill="#6f78a3"/></g>`;
A.obj.clock = (x, y, s = 1, h = 9, mi = 0) => {
  const ah = (h % 12 + mi / 60) * 30, am = mi * 6;
  return `<g transform="translate(${x},${y}) scale(${s})"><circle r="52" fill="#2a2f86"/><circle r="46" fill="#fff6e5"/><circle r="46" fill="url(#shadeV)"/>` +
    [...Array(12)].map((_, i) => `<line x1="0" y1="-40" x2="0" y2="-35" stroke="#2a2f86" stroke-width="${i % 3 ? 2 : 3.4}" transform="rotate(${i * 30})"/>`).join('') +
    `<line x1="0" y1="0" x2="0" y2="-24" stroke="#171b55" stroke-width="5" stroke-linecap="round" transform="rotate(${ah})"/><line x1="0" y1="0" x2="0" y2="-36" stroke="#171b55" stroke-width="3" stroke-linecap="round" transform="rotate(${am})"/><circle r="4" fill="#ff7a69"/></g>`;
};
A.obj.plant = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="6" rx="50" ry="8" fill="#000" opacity=".25" filter="url(#blur3)"/>
${[[-34, -118, -28], [0, -150, 0], [34, -120, 28], [-18, -92, -14], [20, -90, 16]].map(([lx, ly, r]) => `<path d="M0,-50 Q${lx * 0.9},${ly * 0.6} ${lx},${ly} Q${lx * 0.2},${ly * 0.55} 0,-50Z" fill="#1fa58f" stroke="#127a69" stroke-width="2" transform="rotate(${r * 0.2})"/>`).join('')}
<path d="M-34,-52 H34 L26,0 H-26Z" fill="#ff7a69" stroke="#c94f40" stroke-width="2"/><path d="M-34,-52 H34 L26,0 H-26Z" fill="url(#shadeH)"/><rect x="-37" y="-60" width="74" height="12" rx="4" fill="#ff8f80"/></g>`;
A.obj.shelf = (x, y, w = 320, books = true) => {
  let b = '';
  if (books) {
    const cols = ['#2f3aa8', '#ff7a69', '#f4b942', '#25b9b0', '#8a5ad6', '#2f3aa8', '#ff7a69'];
    let bx = 18;
    cols.forEach((cc, i) => { const bw = 20 + (i * 7) % 14, bh = 70 + (i * 13) % 26; b += `<rect x="${bx}" y="${-bh}" width="${bw}" height="${bh}" rx="2" fill="${cc}"/><rect x="${bx}" y="${-bh}" width="${bw}" height="${bh}" rx="2" fill="url(#shadeH)"/><rect x="${bx + 3}" y="${-bh + 12}" width="${bw - 6}" height="4" fill="#fff6e5" opacity=".6"/>`; bx += bw + 3; });
  }
  return `<g transform="translate(${x},${y})">${b}<rect x="0" y="0" width="${w}" height="16" rx="3" fill="url(#wood)"/><rect x="0" y="12" width="${w}" height="6" fill="#7d4d28" opacity=".6"/></g>`;
};
A.obj.desk = (x, y, w = 420, d = 60) => `<g transform="translate(${x},${y})"><ellipse cx="${w / 2}" cy="${d + 118}" rx="${w / 2 + 20}" ry="14" fill="#000" opacity=".25" filter="url(#blur8)"/>
<rect x="14" y="${d}" width="14" height="112" fill="url(#woodSide)"/><rect x="${w - 28}" y="${d}" width="14" height="112" fill="url(#woodSide)"/>
<path d="M-10,${d} L${w + 10},${d} L${w - 6},0 L6,0Z" fill="url(#wood)"/><rect x="-10" y="${d}" width="${w + 20}" height="14" rx="3" fill="#b57841"/><path d="M6,0 L${w - 6},0" stroke="#fff0d2" stroke-width="2" opacity=".5"/></g>`;
A.obj.chair = (x, y, s = 1, col = '#25b9b0') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-40" y="-120" width="80" height="60" rx="10" fill="${col}"/><rect x="-44" y="-56" width="88" height="16" rx="6" fill="${col}"/><rect x="-44" y="-56" width="88" height="16" rx="6" fill="url(#shadeV)"/><rect x="-36" y="-40" width="8" height="40" fill="#2a2f86"/><rect x="28" y="-40" width="8" height="40" fill="#2a2f86"/></g>`;
A.obj.window = (x, y, w = 320, h = 300, night = false) => `<g transform="translate(${x},${y})"><rect x="-14" y="-14" width="${w + 28}" height="${h + 28}" rx="14" fill="#f4b942" opacity=".9"/><rect x="0" y="0" width="${w}" height="${h}" rx="6" fill="url(#${night ? 'skyNight' : 'sky'})"/>
${night ? '<circle cx="' + w * 0.72 + '" cy="' + h * 0.28 + '" r="26" fill="#fff0c0"/><circle cx="' + w * 0.72 + '" cy="' + h * 0.28 + '" r="60" fill="url(#glowGold)" opacity=".5"/>' : '<ellipse cx="' + w * 0.3 + '" cy="' + h * 0.3 + '" rx="60" ry="22" fill="#fff" opacity=".85"/><ellipse cx="' + w * 0.5 + '" cy="' + h * 0.36 + '" rx="48" ry="18" fill="#fff" opacity=".8"/><path d="M0,' + h * 0.78 + ' Q' + w * 0.3 + ',' + h * 0.6 + ' ' + w * 0.6 + ',' + h * 0.76 + ' T' + w + ',' + h * 0.7 + ' V' + h + ' H0Z" fill="#1fa58f" opacity=".75"/>'}
<rect x="${w / 2 - 5}" y="0" width="10" height="${h}" fill="#f4b942"/><rect x="0" y="${h / 2 - 5}" width="${w}" height="10" fill="#f4b942"/></g>`;
A.obj.door = (x, y, s = 1, plate = '12') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-96" y="-330" width="192" height="334" rx="8" fill="#7d4d28"/><rect x="-86" y="-320" width="172" height="318" rx="4" fill="url(#wood)"/>
<rect x="-66" y="-296" width="132" height="120" rx="6" fill="#b57841" opacity=".7"/><rect x="-66" y="-150" width="132" height="130" rx="6" fill="#b57841" opacity=".7"/><rect x="-86" y="-320" width="172" height="318" rx="4" fill="url(#shadeH)"/>
<circle cx="62" cy="-160" r="9" fill="#f4b942" stroke="#c88f1e" stroke-width="2"/><rect x="-44" y="-372" width="88" height="46" rx="8" fill="#171b55" stroke="#f4b942" stroke-width="4"/><text x="0" y="-338" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="34" fill="#fff6e5">${plate}</text></g>`;
A.obj.sofa = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="6" rx="190" ry="14" fill="#000" opacity=".28" filter="url(#blur8)"/>
<rect x="-170" y="-150" width="340" height="110" rx="34" fill="#2f6fd8"/><rect x="-190" y="-90" width="60" height="92" rx="24" fill="#2556b0"/><rect x="130" y="-90" width="60" height="92" rx="24" fill="#2556b0"/><rect x="-140" y="-80" width="280" height="78" rx="20" fill="#3a82ee"/><rect x="-170" y="-150" width="340" height="110" rx="34" fill="url(#shadeH)" opacity=".7"/><rect x="-140" y="-80" width="280" height="78" rx="20" fill="url(#shadeV)"/><rect x="-100" y="-90" width="3" height="86" fill="#2556b0" opacity=".5"/><rect x="40" y="-90" width="3" height="86" fill="#2556b0" opacity=".5"/>
<rect x="-176" y="-2" width="14" height="14" rx="4" fill="#7d4d28"/><rect x="162" y="-2" width="14" height="14" rx="4" fill="#7d4d28"/></g>`;
A.obj.lamp = (x, y, s = 1, glow = true) => `<g transform="translate(${x},${y}) scale(${s})">${glow ? '<circle cx="0" cy="-170" r="150" fill="url(#glowGold)" opacity=".6"/>' : ''}<ellipse cx="0" cy="4" rx="44" ry="8" fill="#000" opacity=".25" filter="url(#blur3)"/><rect x="-5" y="-130" width="10" height="130" fill="#7d4d28"/><ellipse cx="0" cy="0" rx="36" ry="9" fill="#2a2f86"/><path d="M-50,-130 L-30,-200 H30 L50,-130Z" fill="#ffd978"/><path d="M-50,-130 L-30,-200 H30 L50,-130Z" fill="url(#shadeH)" opacity=".6"/></g>`;
A.obj.rug = (x, y, w = 600, h = 90, col = '#25b9b0') => `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="${col}"/><ellipse cx="0" cy="0" rx="${w / 2 - 22}" ry="${h / 2 - 10}" fill="none" stroke="#fff6e5" stroke-width="4" opacity=".7"/><ellipse cx="0" cy="0" rx="${w / 2 - 60}" ry="${h / 2 - 24}" fill="#f4b942" opacity=".5"/></g>`;
A.obj.house = (x, y, s = 1, col = '#fff6e5') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-50,-8 L0,-58 L50,-8 V46 H-50Z" fill="${col}" stroke="#2a2f86" stroke-width="5" stroke-linejoin="round"/><path d="M-60,-6 L0,-66 L60,-6" fill="none" stroke="#ff7a69" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><rect x="-12" y="14" width="24" height="32" rx="3" fill="#2a2f86"/><rect x="22" y="-4" width="18" height="18" rx="2" fill="#34d6cc"/></g>`;
A.obj.board = (x, y, w, h) => ''; // the board is an HTML element (crisp text)
A.obj.pointer = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="16" fill="url(#glowGold)"/><circle r="6" fill="#ffd978" stroke="#c88f1e" stroke-width="2"/></g>`;

/* ---------------- backgrounds ---------------- */
A.bg = {};
A.bg.classroom = () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="1600" height="900">
<rect width="1600" height="900" fill="url(#wall)"/>
<rect y="0" width="1600" height="64" fill="#171b55"/><rect y="56" width="1600" height="10" fill="#f4b942"/>
<rect y="620" width="1600" height="280" fill="url(#floor)"/>
${[...Array(9)].map((_, i) => `<path d="M${-200 + i * 260},900 L${300 + (i - 4) * 90},620" stroke="#000" opacity=".08" stroke-width="3"/>`).join('')}
<rect y="612" width="1600" height="12" fill="#7d4d28"/><rect y="560" width="1600" height="54" fill="#f1cf9c"/><rect y="556" width="1600" height="6" fill="#fff0d2" opacity=".8"/>
${A.obj.window(70, 130, 330, 320)}
<polygon points="70,130 400,130 760,740 250,760" fill="url(#beam)" opacity=".75"/>
<polygon points="-10,450 410,450 780,760 40,760" fill="url(#beam)" opacity=".2"/>
${A.obj.plant(1520, 620, 1.35)}
${A.obj.shelf(1300, 470, 260)}
${A.obj.clock(1210, 150, 1.0, 9, 0)}
${A.obj.lamp(150, 640, 0.001, false)}
<g opacity=".92">${[0, 1, 2].map(i => `<g transform="translate(${1330 + i * 70},${250 + (i % 2) * 14}) rotate(${(i - 1) * 6})"><rect width="54" height="66" rx="4" fill="${['#25b9b0', '#ff7a69', '#f4b942'][i]}"/><rect x="8" y="12" width="38" height="5" fill="#fff6e5" opacity=".8"/><rect x="8" y="26" width="30" height="5" fill="#fff6e5" opacity=".6"/></g>`).join('')}</g>
<rect width="1600" height="900" fill="url(#vignette)"/></svg>`;

A.bg.doorway = (d1 = 480, d2 = 1130) => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="1600" height="900">
<rect width="1600" height="900" fill="url(#wall)"/><rect y="640" width="1600" height="260" fill="url(#floor)"/><rect y="630" width="1600" height="14" fill="#7d4d28"/>
<rect y="0" width="1600" height="60" fill="#171b55"/><rect y="52" width="1600" height="8" fill="#f4b942"/>
<rect x="0" y="560" width="1600" height="74" fill="#f1cf9c"/>
${A.obj.door(d1, 640, 1.18, '12')}${A.obj.door(d2, 640, 1.18, '14')}
<ellipse cx="800" cy="130" rx="300" ry="80" fill="url(#glowGold)" opacity=".5"/>
${A.obj.plant(800, 650, 1.1)}
<rect width="1600" height="900" fill="url(#vignette)"/></svg>`;

A.bg.doorwayL = () => A.bg.doorway(300, 780);
A.bg.home = () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="1600" height="900">
<rect width="1600" height="900" fill="url(#wallDark)"/><rect y="640" width="1600" height="260" fill="url(#floor)" opacity=".9"/><rect y="630" width="1600" height="14" fill="#5b3a22"/>
${A.obj.window(1030, 120, 380, 330, true)}
<ellipse cx="800" cy="450" rx="620" ry="260" fill="url(#glowGold)" opacity=".16"/>
${A.obj.rug(740, 790, 900, 130, '#25b9b0')}
${A.obj.lamp(300, 640, 1.25, true)}
<rect x="540" y="150" width="190" height="130" rx="8" fill="#f4b942"/><rect x="552" y="162" width="166" height="106" rx="4" fill="#ffe9a8"/><path d="M552,248 L610,200 L650,236 L682,214 L718,248 V268 H552Z" fill="#25b9b0"/><circle cx="670" cy="192" r="14" fill="#ff7a69"/>
${A.obj.plant(1500, 660, 1.2)}
<rect width="1600" height="900" fill="url(#vignette)"/></svg>`;

A.bg.night = () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" width="1600" height="900">
<rect width="1600" height="900" fill="url(#wallDark)"/>
<ellipse cx="260" cy="150" rx="330" ry="260" fill="url(#glowTeal)" opacity=".28"/><ellipse cx="1380" cy="760" rx="380" ry="260" fill="url(#glowCoral)" opacity=".18"/><ellipse cx="900" cy="420" rx="520" ry="260" fill="url(#glowGold)" opacity=".1"/>
${[...Array(26)].map((_, i) => `<circle cx="${(i * 197) % 1600}" cy="${(i * 331) % 900}" r="${3 + (i * 7) % 9}" fill="${['#34d6cc', '#ffd978', '#ff7a69'][i % 3]}" opacity=".10"/>`).join('')}
<rect width="1600" height="900" fill="url(#vignette)"/></svg>`;

/* little pictograms for perspective / subject icons (design units ~ 100px) */
A.icon = {};
A.icon.ear = (x, y, s = 1, col = '#34d6cc') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-14,10 Q-26,-6 -18,-24 Q-4,-44 14,-32 Q30,-20 20,0 Q14,10 8,16 Q4,28 -6,28 Q-14,26 -12,18" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M-2,-10 Q4,-18 10,-10 Q14,-2 6,4" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/></g>`;
A.icon.voice = (x, y, s = 1, col = '#ffd978') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-22,-14 Q-8,-14 4,-26 V26 Q-8,14 -22,14Z" fill="${col}"/><path d="M14,-14 Q24,0 14,14" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"/><path d="M24,-26 Q42,0 24,26" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" opacity=".7"/></g>`;
A.icon.person = (x, y, s = 1, col = '#fff6e5') => `<g transform="translate(${x},${y}) scale(${s})"><circle cx="0" cy="-30" r="16" fill="${col}"/><path d="M-26,28 Q-26,-6 0,-6 Q26,-6 26,28Z" fill="${col}"/></g>`;
A.icon.people = (x, y, s = 1, col = '#fff6e5') => `<g transform="translate(${x},${y}) scale(${s})">${A.icon.person(-28, 4, 0.8, col)}${A.icon.person(28, 4, 0.8, col)}${A.icon.person(0, -6, 1, col)}</g>`;
A.icon.point = (x, y, s = 1, col = '#ffd978') => `<g transform="translate(${x},${y}) scale(${s})"><circle r="24" fill="none" stroke="${col}" stroke-width="5"/><circle r="6" fill="${col}"/><path d="M0,-34 V-24 M0,24 V34 M-34,0 H-24 M24,0 H34" stroke="${col}" stroke-width="5" stroke-linecap="round"/></g>`;

/* arms only (used for smooth joint-angle tweening without re-creating the head) */
A.armsMarkup = (o) => { const m = A.person(o); const i = m.indexOf('<!--A-->') + 8; return m.slice(i, m.indexOf('<!--/A-->')); };
