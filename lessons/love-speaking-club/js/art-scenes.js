/* Fluent English - Love Speaking Club
 * art-scenes.js : layered environments (SVG markup) - cafe, balcony, park, apartment, travel, plus
 * a small Stage class that composes scenery, figures and props with gentle parallax.
 * Artboard: 1600 x 900. No words are drawn inside artwork (all teaching text is real HTML with IPA).
 */
(function (global) {
  'use strict';
  const { S, PAL, f, lerp, clamp, Anim } = global.Art;
  const rng = (seed) => { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };

  /* ---------- reusable scenery parts (return markup strings) ---------- */
  const P = {};

  P.skyline = ({ x0 = 0, x1 = 1600, base = 600, minH = 60, maxH = 260, color = '#0d1736', seed = 1, win = '#F5B544', winOp = .8, density = .35, wMin = 40, wMax = 110 } = {}) => {
    const r = rng(seed); let x = x0, out = '';
    while (x < x1) {
      const w = wMin + r() * (wMax - wMin), h = minH + r() * (maxH - minH);
      out += `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h + 4)}" fill="${color}"/>`;
      if (r() > .72) out += `<rect x="${f(x + w * .45)}" y="${f(base - h - 26)}" width="3" height="26" fill="${color}"/>`;
      if (win) {
        const cols = Math.floor(w / 12), rows = Math.floor(h / 16);
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (r() < density) out += `<rect x="${f(x + 5 + i * 12)}" y="${f(base - h + 8 + j * 16)}" width="5" height="7" fill="${win}" opacity="${f(winOp * (.45 + r() * .55))}"/>`;
      }
      x += w + (r() > .7 ? r() * 10 : 0);
    }
    return out;
  };
  P.bokeh = ({ n = 30, x0 = 0, y0 = 0, x1 = 1600, y1 = 500, rMin = 8, rMax = 34, colors = ['#F5B544', '#FF6B57', '#FFD98A'], op = .5, seed = 3 } = {}) => {
    const r = rng(seed); let out = '';
    for (let i = 0; i < n; i++) { const c = colors[Math.floor(r() * colors.length)]; out += `<circle cx="${f(lerp(x0, x1, r()))}" cy="${f(lerp(y0, y1, r()))}" r="${f(lerp(rMin, rMax, r()))}" fill="${c}" opacity="${f(op * (.4 + r() * .6))}"/>`; }
    return out;
  };
  P.stars = (seed, n, y1) => { const r = rng(seed); let o = ''; for (let i = 0; i < n; i++) o += `<circle cx="${f(r() * 1600)}" cy="${f(r() * y1)}" r="${f(.6 + r() * 1.4)}" fill="#FFF3D6" opacity="${f(.25 + r() * .6)}"/>`; return o; };
  P.plant = (x, y, s = 1, kind = 'monstera', pot = '#C9573E') => {
    let o = `<g transform="translate(${x},${y}) scale(${s})">`;
    o += `<path d="M-34,0 L34,0 L26,70 Q0,78 -26,70Z" fill="${pot}"/><path d="M-34,0 L34,0 L31,14 L-31,14Z" fill="${global.Art.shade(pot, .18)}"/><path d="M-34,0 L34,0 L26,70 Q0,78 -26,70Z" fill="url(#shadeSide)" opacity=".9"/>`;
    const leaf = (rot, len, col) => `<g transform="rotate(${rot})"><path d="M0,0 C-${len * .28},-${len * .3} -${len * .36},-${len * .75} 0,-${len} C${len * .36},-${len * .75} ${len * .28},-${len * .3} 0,0Z" fill="${col}"/><path d="M0,0 L0,-${len * .92}" stroke="#0a4a3c" stroke-width="2" opacity=".5"/></g>`;
    const cols = ['#0E7C62', '#14966F', '#0A6A57', '#1FA882'];
    if (kind === 'monstera') for (let i = 0; i < 9; i++) { const a = -70 + i * 17.5; o += leaf(a, 120 + (i % 3) * 26, cols[i % 4]); }
    else if (kind === 'fern') for (let i = 0; i < 13; i++) { const a = -84 + i * 14; o += `<g transform="rotate(${a})"><path d="M0,0 C-8,-60 -14,-110 -2,-150 C8,-112 6,-60 0,0Z" fill="${cols[i % 4]}"/></g>`; }
    else for (let i = 0; i < 7; i++) { const a = -50 + i * 17; o += leaf(a, 90 + (i % 2) * 30, cols[i % 4]); }
    return o + '</g>';
  };
  P.pendant = (x, y0, y1, r = 46, glow = 'glowAmber') => `<g><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="#1b1220" stroke-width="3"/><ellipse cx="${x}" cy="${y1 + r * 1.5}" rx="${r * 2.6}" ry="${r * 2.2}" fill="url(#${glow})" opacity=".9"/><path d="M${x - r},${y1 + r * .8} Q${x - r * .8},${y1 - 4} ${x},${y1 - 6} Q${x + r * .8},${y1 - 4} ${x + r},${y1 + r * .8}Z" fill="#E7A24A"/><path d="M${x - r},${y1 + r * .8} Q${x - r * .8},${y1 - 4} ${x},${y1 - 6} Q${x + r * .8},${y1 - 4} ${x + r},${y1 + r * .8}Z" fill="url(#shadeSide)" opacity=".8"/><ellipse cx="${x}" cy="${y1 + r * .8}" rx="${r}" ry="${r * .16}" fill="#FFE9B0"/></g>`;
  P.stringLights = (x0, x1, y, sag, n, seed = 5) => {
    const r = rng(seed); let o = `<path d="M${x0},${y} Q${(x0 + x1) / 2},${y + sag} ${x1},${y}" fill="none" stroke="#1b1220" stroke-width="2" opacity=".7"/>`;
    for (let i = 1; i < n; i++) { const t = i / n; const x = lerp(x0, x1, t); const yy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + sag) + t * t * y;
      const c = ['#FFD98A', '#FFC4A8', '#FFE9B0'][Math.floor(r() * 3)];
      o += `<circle cx="${f(x)}" cy="${f(yy + 6)}" r="22" fill="url(#glowAmber)" opacity=".7"/><circle cx="${f(x)}" cy="${f(yy + 6)}" r="4.4" fill="${c}"/>`; }
    return o;
  };
  P.frame = (x, y, w, h, kind = 1) => {
    const cs = [['#E86A58', '#F5B544', '#1FA8A0'], ['#1F3366', '#FF6B57', '#FBF4E6'], ['#0E7370', '#F3E7D0', '#B5214F']][kind % 3];
    return `<g><rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="4" fill="#2a1d1a"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cs[2]}"/><circle cx="${x + w * .35}" cy="${y + h * .4}" r="${h * .26}" fill="${cs[0]}"/><path d="M${x},${y + h} L${x + w * .55},${y + h * .45} L${x + w},${y + h}Z" fill="${cs[1]}" opacity=".9"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#shadeSide)" opacity=".5"/></g>`;
  };
  P.mug = (x, y, col = '#FBF4E6', s = 1, steam = true) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="3" rx="30" ry="7" fill="#000" opacity=".25"/><path d="M-22,-34 L22,-34 L19,0 Q0,7 -19,0Z" fill="${col}"/><path d="M-22,-34 L22,-34 L19,0 Q0,7 -19,0Z" fill="url(#shadeSide)" opacity=".9"/><ellipse cx="0" cy="-34" rx="22" ry="6" fill="${global.Art.shade(col, -.1)}"/><ellipse cx="0" cy="-33" rx="18" ry="4.4" fill="#6b3b22"/><path d="M22,-26 Q38,-26 36,-14 Q34,-4 20,-6" fill="none" stroke="${col}" stroke-width="5"/>${steam ? `<path class="steam" d="M-6,-44 q-8,-12 0,-22 q8,-10 0,-20" fill="none" stroke="#FFF1CF" stroke-width="3" stroke-linecap="round" opacity=".5"/><path class="steam" d="M8,-42 q-8,-12 0,-22 q8,-10 0,-20" fill="none" stroke="#FFF1CF" stroke-width="3" stroke-linecap="round" opacity=".4"/>` : ''}</g>`;
  P.flowers = (x, y, s = 1) => {
    let o = `<g transform="translate(${x},${y}) scale(${s})"><path d="M-14,0 L14,0 L10,-46 L-10,-46Z" fill="#7FD6CC" opacity=".85"/><path d="M-14,0 L14,0 L10,-46 L-10,-46Z" fill="url(#shadeSide)"/>`;
    const fl = [[-14, -88, '#FF6B57'], [8, -102, '#F5B544'], [-2, -74, '#B5214F'], [18, -80, '#FF8C79'], [-24, -70, '#F5B544']];
    fl.forEach(([fx, fy, c]) => { o += `<path d="M${fx * .3},-46 Q${fx * .6},${fy * .6} ${fx},${fy}" stroke="#0E7C62" stroke-width="3" fill="none"/>`; for (let k = 0; k < 6; k++) o += `<ellipse cx="${fx + Math.cos(k * 1.047) * 8}" cy="${fy + Math.sin(k * 1.047) * 8}" rx="7" ry="5" transform="rotate(${k * 60} ${fx + Math.cos(k * 1.047) * 8} ${fy + Math.sin(k * 1.047) * 8})" fill="${c}"/>`; o += `<circle cx="${fx}" cy="${fy}" r="4.4" fill="#FFD98A"/>`; });
    return o + '</g>';
  };
  P.candle = (x, y) => `<g transform="translate(${x},${y})"><ellipse cx="0" cy="2" rx="14" ry="4" fill="#000" opacity=".25"/><rect x="-7" y="-34" width="14" height="36" rx="3" fill="#FBF4E6"/><rect x="-7" y="-34" width="14" height="36" rx="3" fill="url(#shadeSide)"/><circle cx="0" cy="-60" r="34" fill="url(#glowAmber)"/><path class="flame" d="M0,-52 C-6,-44 -5,-38 0,-36 C5,-38 6,-44 0,-52Z" fill="#FFD98A"/></g>`;
  P.laptop = (x, y, s = 1, screen = '#1F3366', glow = true) => `<g transform="translate(${x},${y}) scale(${s})">${glow ? '<ellipse cx="0" cy="-60" rx="140" ry="100" fill="url(#glowTeal)" opacity=".35"/>' : ''}<path d="M-92,0 L92,0 L104,14 L-104,14Z" fill="#9aa3b8"/><path d="M-92,0 L92,0 L104,14 L-104,14Z" fill="url(#shadeDown)"/><path d="M-86,-122 L86,-122 L90,-2 L-90,-2Z" fill="#20263a"/><path d="M-80,-116 L80,-116 L84,-6 L-84,-6Z" fill="${screen}"/><path d="M-80,-116 L80,-116 L84,-6 L-84,-6Z" fill="url(#shadeSide)" opacity=".5"/></g>`;
  P.phone = (x, y, rot = 0, s = 1, on = true, col = '#1F3366') => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-24" y="-46" width="48" height="92" rx="9" fill="#10162a"/><rect x="-21" y="-42" width="42" height="84" rx="6" fill="${on ? col : '#0a0f20'}"/>${on ? `<rect x="-21" y="-42" width="42" height="84" rx="6" fill="url(#glowWhite)" opacity=".25"/>` : ''}</g>`;
  P.book = (x, y, rot = 0, col = '#B5214F', s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-44" y="-8" width="88" height="16" rx="2" fill="${col}"/><rect x="-42" y="-8" width="84" height="5" fill="#FBF4E6"/><rect x="-44" y="-8" width="88" height="16" rx="2" fill="url(#shadeDown)"/></g>`;
  P.books = (x, y, n = 6, seed = 8) => { const r = rng(seed); const cols = ['#B5214F', '#1FA8A0', '#F5B544', '#34508F', '#FF6B57', '#0E7370', '#FBF4E6']; let o = '', xx = x; for (let i = 0; i < n; i++) { const w = 14 + r() * 16, h = 60 + r() * 40; const c = cols[Math.floor(r() * cols.length)]; o += `<rect x="${f(xx)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${c}"/><rect x="${f(xx)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="url(#shadeSide)" opacity=".8"/><rect x="${f(xx + 2)}" y="${f(y - h + 10)}" width="${f(w - 4)}" height="3" fill="#fff" opacity=".35"/>`; xx += w + 1; } return o; };
  P.suitcase = (x, y, s = 1, col = '#1FA8A0') => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="4" rx="64" ry="9" fill="#000" opacity=".3"/><path d="M-12,-96 L-12,-110 Q-12,-118 -4,-118 L4,-118 Q12,-118 12,-110 L12,-96" fill="none" stroke="#10162a" stroke-width="6"/><rect x="-56" y="-98" width="112" height="98" rx="14" fill="${col}"/><rect x="-56" y="-98" width="112" height="98" rx="14" fill="url(#shadeSide)"/><path d="M-30,-92 L-30,-6 M0,-92 L0,-6 M30,-92 L30,-6" stroke="#000" stroke-opacity=".14" stroke-width="4"/><rect x="-56" y="-98" width="112" height="98" rx="14" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/><circle cx="-34" cy="12" r="6" fill="#10162a"/><circle cx="34" cy="12" r="6" fill="#10162a"/></g>`;
  P.ticket = (x, y, rot = 0, s = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-62" y="-30" width="124" height="60" rx="8" fill="#FBF4E6"/><rect x="-62" y="-30" width="124" height="14" rx="8" fill="#FF6B57"/><path d="M26,-16 L26,30" stroke="#B9A98A" stroke-dasharray="3 4" stroke-width="2"/><circle cx="-34" cy="6" r="14" fill="none" stroke="#14224A" stroke-width="3"/><path d="M-44,6 L-24,6 M-34,-4 L-34,16" stroke="#14224A" stroke-width="2.4"/><rect x="34" y="-6" width="20" height="22" fill="#14224A" opacity=".85"/></g>`;
  P.envelope = (x, y, rot = 0, s = 1, open = false) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="-60" y="-40" width="120" height="80" rx="5" fill="#F3E7D0"/><rect x="-60" y="-40" width="120" height="80" rx="5" fill="url(#shadeDown)"/>${open ? '<rect x="-48" y="-62" width="96" height="70" fill="#FBF4E6" stroke="#E6D4B3"/><path d="M-36,-46 L36,-46 M-36,-34 L36,-34 M-36,-22 L20,-22" stroke="#B9A98A" stroke-width="3"/>' : ''}<path d="M-60,-40 L0,6 L60,-40" fill="#EADBBE" stroke="#cdb98f"/><circle cx="0" cy="6" r="9" fill="#B5214F"/></g>`;
  P.chair = (x, y, s = 1, col = '#7a3b2a', flip = false) => `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})"><rect x="-70" y="-300" width="140" height="300" rx="22" fill="${col}"/><rect x="-70" y="-300" width="140" height="300" rx="22" fill="url(#shadeSide)"/><rect x="-60" y="-290" width="120" height="20" rx="10" fill="#fff" opacity=".12"/></g>`;
  P.tableBand = (cx, T, w, col = '#9a5a35', front = '#5a2f22') => {
    const x0 = cx - w / 2, x1 = cx + w / 2, sd = global.Art.shade;
    return `<g><ellipse cx="${cx}" cy="${T + 40}" rx="${w / 2 + 40}" ry="34" fill="#000" opacity=".25" filter="url(#blur14)"/>
      <path d="M${x0 + 14},${T} L${x1 - 14},${T} L${x1 + 6},${T + 26} L${x0 - 6},${T + 26}Z" fill="${col}"/>
      <path d="M${x0 + 14},${T} L${x1 - 14},${T} L${x1 + 6},${T + 26} L${x0 - 6},${T + 26}Z" fill="url(#shadeDown)" opacity=".55"/>
      <path d="M${x0 + 14},${T + 1} L${x1 - 14},${T + 1}" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
      <path d="M${x0 + 80},${T + 12} Q${cx},${T + 7} ${x1 - 80},${T + 13}" stroke="#fff" stroke-opacity=".14" stroke-width="3" fill="none"/>
      <rect x="${x0 - 6}" y="${T + 26}" width="${w + 12}" height="${900 - T}" fill="${front}"/>
      <rect x="${x0 - 6}" y="${T + 26}" width="${w + 12}" height="${900 - T}" fill="url(#shadeSide)" opacity=".7"/>
      <rect x="${x0 - 6}" y="${T + 26}" width="${w + 12}" height="14" fill="${sd(col, -.15)}"/>
      <rect x="${x0 - 6}" y="${T + 26}" width="${w + 12}" height="${900 - T}" fill="url(#floorShade)" opacity=".5"/></g>`;
  };
  P.tableTop = (cx, cy, w, h, col = '#9a5a35') => `<g><ellipse cx="${cx}" cy="${cy + h * .55}" rx="${w / 2 + 14}" ry="${h * .5}" fill="#000" opacity=".28"/><path d="M${cx - w / 2},${cy} L${cx + w / 2},${cy} L${cx + w / 2 + 18},${cy + h} L${cx - w / 2 - 18},${cy + h}Z" fill="${col}"/><path d="M${cx - w / 2},${cy} L${cx + w / 2},${cy} L${cx + w / 2 + 18},${cy + h} L${cx - w / 2 - 18},${cy + h}Z" fill="url(#shadeDown)" opacity=".7"/><path d="M${cx - w / 2},${cy} L${cx + w / 2},${cy}" stroke="#ffd9a0" stroke-opacity=".55" stroke-width="2"/><path d="M${cx - w / 2 + 40},${cy + 10} Q${cx},${cy + 4} ${cx + w / 2 - 40},${cy + 12}" stroke="#fff" stroke-opacity=".14" stroke-width="3" fill="none"/></g>`;

  /* ---------- SCENES: return {bg, mid, fg} markup + metadata ---------- */
  const SC = {};

  /* warm cafe, evening */
  SC.cafe = () => {
    const r = rng(11);
    let bg = `
    <defs><linearGradient id="cfWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4a2430"/><stop offset=".55" stop-color="#7a3b36"/><stop offset="1" stop-color="#9a5240"/></linearGradient>
    <linearGradient id="cfPanel" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#17406a"/><stop offset="1" stop-color="#0d2a4a"/></linearGradient>
    <linearGradient id="cfWin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#14224A"/><stop offset=".7" stop-color="#34508F"/><stop offset="1" stop-color="#E88B62"/></linearGradient>
    <pattern id="brick" width="80" height="36" patternUnits="userSpaceOnUse"><rect width="80" height="36" fill="none"/><path d="M0,0 H80 M0,18 H80 M40,0 V18 M0,18 V36 M80,18 V36" stroke="#2a0f14" stroke-opacity=".28" stroke-width="2" fill="none"/></pattern></defs>
    <rect width="1600" height="900" fill="url(#cfWall)"/><rect width="1600" height="900" fill="url(#brick)"/>
    <rect y="560" width="1600" height="340" fill="url(#cfPanel)"/><rect y="556" width="1600" height="10" fill="#E7A24A" opacity=".7"/>
    <g opacity=".9">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * 270 + 20}" y="580" width="230" height="300" rx="6" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="3"/>`).join('')}</g>`;
    // window (arched) with city bokeh
    bg += `<g transform="translate(120,80)"><clipPath id="cfWinClip"><path d="M0,470 L0,150 Q0,0 150,0 Q300,0 300,150 L300,470Z"/></clipPath>
      <path d="M-14,484 L-14,150 Q-14,-14 150,-14 Q314,-14 314,150 L314,484Z" fill="#2a1520"/>
      <g clip-path="url(#cfWinClip)"><rect width="300" height="470" fill="url(#cfWin)"/>${P.skyline({ x0: 0, x1: 300, base: 420, minH: 40, maxH: 170, color: '#0e1a3e', seed: 4, density: .4, wMin: 20, wMax: 50 })}${P.bokeh({ n: 22, x0: 0, y0: 180, x1: 300, y1: 440, rMin: 6, rMax: 20, op: .55, seed: 9 })}
      <rect width="300" height="470" fill="url(#shadeSide)" opacity=".4"/></g>
      <path d="M150,-14 L150,484 M0,200 L300,200" stroke="#2a1520" stroke-width="8" opacity=".9"/><path d="M-14,484 L314,484" stroke="#E7A24A" stroke-width="10" opacity=".8"/></g>`;
    // shelves right
    bg += `<g transform="translate(1180,170)"><rect x="0" y="120" width="360" height="12" fill="#c98b4c"/><rect x="0" y="300" width="360" height="12" fill="#c98b4c"/>
      ${P.books(14, 120, 9, 3)} ${P.books(210, 300, 8, 6)}
      <g transform="translate(250,120)">${P.mug(0, 0, '#F3E7D0', .9, false)}${P.mug(60, 0, '#1FA8A0', .9, false)}</g>
      <g transform="translate(40,300)">${P.mug(0, 0, '#FF6B57', .9, false)}${P.mug(60, 0, '#F3E7D0', .9, false)}${P.mug(120, 0, '#F5B544', .9, false)}</g>
      <path d="M296,300 q10,-44 0,-90 q30,10 20,90Z" fill="#14966F"/><path d="M308,300 q-6,-60 18,-84 q10,40 -6,84Z" fill="#0E7C62"/></g>`;
    bg += `<g>${P.frame(876, 150, 96, 124, 1)}${P.frame(1262, 56, 96, 80, 2)}</g>`;
    // pendants
    bg += P.pendant(520, 0, 150, 46) + P.pendant(740, 0, 110, 52) + P.pendant(1060, 0, 160, 44);
    bg += `<rect width="1600" height="900" fill="url(#glowAmber)" opacity=".0"/>`;
    const mid = `${P.chair(560, 880, 1.15, '#6c2f2d')}${P.chair(1040, 880, 1.15, '#6c2f2d', true)}`;
    const props = `${P.candle(800, 722)}${P.flowers(700, 722, .85)}`;
    return { bg, mid, fg: '', props, table: { cx: 800, T: 700, w: 900, col: '#a8683c', front: '#5a2f22' }, tableY: 700, depth: [.2, .6, 1.2] };
  };

  /* balcony at dusk */
  SC.balcony = () => {
    const bg = `
    <defs><linearGradient id="bcSky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0B1630"/><stop offset=".38" stop-color="#2a2a63"/><stop offset=".62" stop-color="#B5214F"/><stop offset=".8" stop-color="#FF6B57"/><stop offset="1" stop-color="#F5B544"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#bcSky)"/>${P.stars(2, 70, 300)}
    <circle cx="1220" cy="300" r="120" fill="url(#glowAmber)" opacity=".8"/>
    <g>${P.skyline({ base: 720, minH: 90, maxH: 300, color: '#3a2a63', seed: 21, win: '#FFD98A', winOp: .55, density: .18, wMin: 50, wMax: 130 })}</g>
    <g>${P.skyline({ base: 760, minH: 100, maxH: 260, color: '#1d1c47', seed: 22, win: '#FFD98A', winOp: .75, density: .3, wMin: 50, wMax: 120 })}</g>
    <g>${P.skyline({ base: 800, minH: 60, maxH: 190, color: '#0d1233', seed: 23, win: '#F5B544', winOp: .85, density: .4, wMin: 40, wMax: 100 })}</g>
    ${P.bokeh({ n: 26, x0: 0, y0: 500, x1: 1600, y1: 790, rMin: 6, rMax: 22, op: .4, seed: 7, colors: ['#FFD98A', '#FF8C79', '#7FD6CC'] })}`;
    const mid = `<g>${P.stringLights(-20, 1620, 70, 90, 16)}</g>`;
    const fg = `<g>
      <rect x="0" y="760" width="1600" height="140" fill="#0a0f26"/><rect x="0" y="752" width="1600" height="14" fill="#1b2150"/>
      ${Array.from({ length: 26 }, (_, i) => `<rect x="${i * 64 + 14}" y="660" width="10" height="94" fill="#10173a"/>`).join('')}
      <rect x="0" y="640" width="1600" height="22" fill="#1b2150"/><rect x="0" y="640" width="1600" height="5" fill="#FF8C79" opacity=".5"/>
      ${P.plant(120, 750, 1.2, 'monstera', '#C9573E')}${P.plant(1480, 750, 1.3, 'fern', '#0E7370')}</g>`;
    return { bg, mid, fg, tableY: 760, depth: [.3, .7, 1.4] };
  };

  /* city park at golden hour */
  SC.park = () => {
    const r = rng(33);
    let bg = `
    <defs><linearGradient id="pkSky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#34508F"/><stop offset=".4" stop-color="#E88B62"/><stop offset=".7" stop-color="#FFC27A"/><stop offset="1" stop-color="#FFE0A8"/></linearGradient>
    <linearGradient id="pkGrass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2f9a6a"/><stop offset="1" stop-color="#0e5f4e"/></linearGradient>
    <linearGradient id="pkPath" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#EBC89A"/><stop offset="1" stop-color="#C79868"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#pkSky)"/>
    <circle cx="790" cy="400" r="260" fill="url(#glowWhite)" opacity=".85"/><circle cx="790" cy="400" r="62" fill="#FFF1CF"/>
    <g opacity=".5"><path d="M-40,300 q140,-50 280,0 q-60,30 -140,24 q-80,6 -140,-24Z" fill="#FFE9D6"/><path d="M880,210 q140,-44 270,4 q-70,26 -140,18 q-70,8 -130,-22Z" fill="#FFE9D6"/></g>
    <g>${P.skyline({ base: 640, minH: 40, maxH: 150, color: '#8a5a7a', seed: 41, win: null, wMin: 40, wMax: 100 })}</g>
    <g>${[0, 1, 2, 3, 4, 5, 6].map((i) => { const x = 80 + i * 250 + r() * 60, h = 170 + r() * 90; return `<g><rect x="${x - 6}" y="${620 - h * .5}" width="12" height="${h * .55}" fill="#4a2f3a"/><circle cx="${x}" cy="${620 - h * .7}" r="${h * .46}" fill="#5c8f6a"/><circle cx="${x - 30}" cy="${620 - h * .55}" r="${h * .3}" fill="#6ea77a"/></g>`; }).join('')}</g>
    <rect y="620" width="1600" height="280" fill="url(#pkGrass)"/>
    <path d="M-100,900 C300,720 700,690 1000,680 C1300,672 1500,690 1700,720 L1700,900Z" fill="url(#pkPath)" opacity=".9"/>
    <path d="M-100,900 C300,720 700,690 1000,680" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none"/>`;
    // big near trees (parallax mid)
    const mid = `<g>
      <g transform="translate(110,0)"><rect x="-26" y="260" width="52" height="520" fill="#5a3326"/><rect x="-26" y="260" width="52" height="520" fill="url(#shadeSide)"/>
      <circle cx="0" cy="190" r="190" fill="#1f6e58"/><circle cx="-110" cy="260" r="120" fill="#2a8a68"/><circle cx="120" cy="250" r="130" fill="#17604f"/><circle cx="-30" cy="130" r="100" fill="#37a07a" opacity=".7"/></g>
      <g transform="translate(1500,0)"><rect x="-24" y="280" width="48" height="500" fill="#5a3326"/><rect x="-24" y="280" width="48" height="500" fill="url(#shadeSide)"/>
      <circle cx="0" cy="210" r="180" fill="#1f6e58"/><circle cx="-100" cy="280" r="110" fill="#17604f"/><circle cx="110" cy="270" r="120" fill="#2a8a68"/></g></g>`;
    // sunlit leaves & foreground
    const blades = (x0, x1, n) => Array.from({ length: n }, () => { const x = lerp(x0, x1, r()), h = 50 + r() * 80, w = 8 + r() * 8, lean = (r() - .5) * 40; return `<path d="M${f(x - w)},900 Q${f(x + lean * .4)},${f(900 - h * .6)} ${f(x + lean)},${f(900 - h)} Q${f(x + w * .4 + lean * .5)},${f(900 - h * .5)} ${f(x + w)},900Z" fill="${r() > .5 ? '#0e6b52' : '#157d5f'}"/>`; }).join('');
    const fg = `<g>${blades(-20, 330, 16)}${blades(1280, 1620, 16)}${blades(330, 1280, 5)}</g>`;
    return { bg, mid, fg, tableY: 720, depth: [.3, .8, 1.5], extra: `${P.bokeh({ n: 14, x0: 0, y0: 100, x1: 1600, y1: 600, rMin: 10, rMax: 36, op: .22, seed: 2, colors: ['#FFF1CF', '#FFD98A'] })}` };
  };

  /* modern apartment, evening */
  SC.apartment = () => {
    const bg = `
    <defs><linearGradient id="apWall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1c2f5e"/><stop offset="1" stop-color="#2a4478"/></linearGradient>
    <linearGradient id="apWin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0B1630"/><stop offset=".7" stop-color="#2a2a63"/><stop offset="1" stop-color="#E8706A"/></linearGradient>
    <linearGradient id="apFloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7a5236"/><stop offset="1" stop-color="#4b2f20"/></linearGradient></defs>
    <rect width="1600" height="900" fill="url(#apWall)"/>
    <g transform="translate(180,70)"><rect x="-10" y="-10" width="620" height="500" fill="#10172e"/><rect width="600" height="480" fill="url(#apWin)"/>${P.stars(5, 30, 200).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, a) => `cx="${f(a * .375)}"`)}
      <g clip-path="url(#apWinClip)"></g>${P.skyline({ x0: 0, x1: 600, base: 480, minH: 70, maxH: 260, color: '#0f1740', seed: 51, win: '#FFD98A', winOp: .8, density: .3, wMin: 30, wMax: 80 })}
      <path d="M300,0 L300,480 M0,240 L600,240" stroke="#10172e" stroke-width="10"/><rect width="600" height="480" fill="url(#shadeSide)" opacity=".25"/></g>
    <rect y="700" width="1600" height="200" fill="url(#apFloor)"/><rect y="696" width="1600" height="10" fill="#1b140f" opacity=".6"/>
    <g>${P.frame(940, 120, 150, 190, 0)}${P.frame(1120, 160, 110, 140, 2)}${P.frame(1260, 110, 160, 200, 1)}</g>
    <g transform="translate(1180,520)"><rect x="0" y="0" width="360" height="12" fill="#e8d8b8"/><rect x="0" y="-160" width="360" height="12" fill="#e8d8b8"/>${P.books(16, 0, 9, 14)}${P.books(200, -160, 6, 12)}<g transform="translate(60,-160)">${P.plant(0, 0, .28, 'leafy', '#E6D4B3')}</g></g>
    <ellipse cx="800" cy="860" rx="560" ry="60" fill="#B5214F" opacity=".55"/><ellipse cx="800" cy="860" rx="500" ry="46" fill="#C2335F" opacity=".5"/>`;
    const mid = `<g>${P.plant(1520, 700, 1.25, 'monstera', '#e8d8b8')}
      <g transform="translate(110,700)"><rect x="-5" y="-300" width="10" height="300" fill="#222"/><path d="M-60,-300 L60,-300 L40,-360 L-40,-360Z" fill="#F3E7D0"/><ellipse cx="0" cy="-290" rx="150" ry="120" fill="url(#glowAmber)" opacity=".6"/><ellipse cx="0" cy="0" rx="46" ry="10" fill="#222"/></g></g>`;
    const fg = '';
    return { bg, mid, fg, tableY: 700, depth: [.2, .6, 1.2] };
  };

  /* travel: station / airport concourse */
  SC.travel = () => {
    const bg = `
    <defs><linearGradient id="trSky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#14224A"/><stop offset=".55" stop-color="#B5214F"/><stop offset="1" stop-color="#FFB46A"/></linearGradient>
    <linearGradient id="trFloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2a3358"/><stop offset="1" stop-color="#10163a"/></linearGradient></defs>
    <rect width="1600" height="900" fill="#0d1535"/>
    <g transform="translate(100,70)"><rect width="1400" height="520" fill="url(#trSky)"/>${P.stars(8, 40, 160).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, a) => `cx="${f(a * .875)}"`)}
      <circle cx="1000" cy="360" r="140" fill="url(#glowAmber)" opacity=".7"/>
      ${P.skyline({ x0: 0, x1: 1400, base: 520, minH: 20, maxH: 70, color: '#2a1c4a', seed: 61, win: null, wMin: 60, wMax: 160 })}
      <rect y="470" width="1400" height="50" fill="#1a2250"/>${Array.from({ length: 34 }, (_, i) => `<circle cx="${40 + i * 42}" cy="490" r="3.4" fill="${i % 2 ? '#FFD98A' : '#7FD6CC'}"/>`).join('')}
      <g transform="translate(640,330) rotate(-9)"><path d="M-150,0 L110,-14 L150,-20 L110,-4 L-120,8Z" fill="#E6EAF4"/><path d="M-20,-4 L10,-70 L34,-70 L22,-8Z" fill="#cfd5e6"/><path d="M-130,-2 L-146,-36 L-128,-36 L-100,0Z" fill="#cfd5e6"/><rect x="-80" y="-6" width="90" height="3" fill="#1F3366" opacity=".7"/></g>
      ${Array.from({ length: 6 }, (_, i) => `<rect x="${i * 240 + 10}" y="-10" width="14" height="540" fill="#0d1535"/>`).join('')}<rect y="-6" width="1400" height="14" fill="#0d1535"/><rect y="250" width="1400" height="10" fill="#0d1535"/></g>
    <rect y="620" width="1600" height="280" fill="url(#trFloor)"/>
    <g opacity=".22">${Array.from({ length: 12 }, (_, i) => `<ellipse cx="${100 + i * 130}" cy="780" rx="40" ry="140" fill="#FFD98A"/>`).join('')}</g>
    <g transform="translate(1180,40)"><rect width="320" height="150" rx="10" fill="#0a0f26"/>${Array.from({ length: 4 }, (_, i) => `<rect x="18" y="${20 + i * 30}" width="${160 - i * 22}" height="12" rx="3" fill="#F5B544" opacity=".85"/><rect x="${200 - i * 6}" y="${20 + i * 30}" width="60" height="12" rx="3" fill="#7FD6CC" opacity=".8"/>`).join('')}</g>`;
    const mid = `<g>${P.suitcase(160, 780, 1.3, '#1FA8A0')}${P.suitcase(1450, 790, 1.15, '#B5214F')}</g>`;
    return { bg, mid, fg: '', tableY: 780, depth: [.2, .7, 1.3] };
  };

  /* neutral midnight stage for non-location moments */
  SC.night = () => {
    const bg = `<defs><radialGradient id="nsBg" cx=".5" cy=".4" r=".9"><stop offset="0" stop-color="#26397a"/><stop offset=".6" stop-color="#101a40"/><stop offset="1" stop-color="#070E22"/></radialGradient></defs>
    <rect width="1600" height="900" fill="url(#nsBg)"/>${P.stars(12, 90, 900)}${P.bokeh({ n: 22, x0: 0, y0: 0, x1: 1600, y1: 900, rMin: 10, rMax: 44, op: .12, seed: 13, colors: ['#FF6B57', '#1FA8A0', '#F5B544'] })}`;
    return { bg, mid: '', fg: '', tableY: 700, depth: [.1, .4, 1] };
  };

  /* ---------- Stage ---------- */
  let CLIP_ID = 0;
  class Stage {
    constructor(sceneName, opts = {}) {
      const sc = (SC[sceneName] || SC.night)();
      this.scene = sc; this.name = sceneName; this.figs = []; this.timers = []; this.cancel = false;
      this.tableY = sc.tableY;
      this.svg = S('svg', { viewBox: '0 0 1600 900', class: 'stage-svg', preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': opts.label || '' });
      this.layers = {};
      ['bg', 'extra', 'mid', 'table', 'props', 'actors', 'fg', 'fx', 'vig'].forEach((n) => { const g = S('g', { class: 'layer l-' + n }); this.layers[n] = g; this.svg.appendChild(g); });
      this.layers.bg.innerHTML = sc.bg; this.layers.extra.innerHTML = sc.extra || ''; this.layers.mid.innerHTML = sc.mid; this.layers.fg.innerHTML = sc.fg;
      this.layers.props.innerHTML = sc.props || '';
      const tc = opts.table === undefined ? sc.table : opts.table; this.table = tc;
      if (tc) this.layers.table.innerHTML = P.tableBand(tc.cx, tc.T, tc.w, tc.col, tc.front);
      this.layers.vig.innerHTML = opts.vignette === false ? '' : '<rect width="1600" height="900" fill="url(#vignette)" pointer-events="none"/>';
      this.layers.bg.classList.add('px', 'px-0'); this.layers.mid.classList.add('px', 'px-1'); this.layers.fg.classList.add('px', 'px-2');
      this.el = this.svg;
      this.clipY = tc ? tc.T + 28 : (opts.clipY || null);
    }
    addFigure(fig, x, y, s = 1, opts = {}) {
      let host = this.layers.actors;
      const clipY = opts.clipY === undefined ? this.clipY : opts.clipY;
      if (clipY) {
        const id = 'sclip' + (++CLIP_ID);
        const defs = S('defs', {}, S('clipPath', { id }, S('rect', { x: -400, y: -400, width: 2400, height: clipY + 400 })));
        const w = S('g', { 'clip-path': `url(#${id})` }); w.appendChild(defs); this.layers.actors.appendChild(w); host = w;
      }
      host.appendChild(fig.el); fig.pos(x, y, s, !!opts.flip); this.figs.push(fig); if (opts.idle !== false) fig.idle(true); return fig;
    }
    addMarkup(layer, markup) { const g = S('g'); g.innerHTML = markup; this.layers[layer].appendChild(g); return g; }
    addNode(layer, node) { this.layers[layer].appendChild(node); return node; }
    later(fn, ms) { const it = Anim.later(() => { if (!this.cancel) fn(); }, ms); this.timers.push(it); return it; }
    destroy() { this.cancel = true; this.timers.forEach((t) => Anim.cancel(t)); this.figs.forEach((fg) => fg.destroy && fg.destroy()); }
  }

  global.Art.P = P; global.Art.SC = SC; global.Art.Stage = Stage; global.Art.rng = rng;
})(window);
