/* Should for Advice — layered, code-built environments (1920×1080). Each returns {back, front, light} */
(function (g) {
  'use strict';
  const FE = g.FE;
  const { shade, mix } = FE;
  const R = (x, y, w, h, f, rx, ex) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${rx ? ` rx="${rx}"` : ''}${ex ? ' ' + ex : ''}/>`;
  const C = (x, y, r, f, ex) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${ex ? ' ' + ex : ''}/>`;
  const LG = (id, x1, y1, x2, y2, stops) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</linearGradient>`;
  const RG = (id, cx, cy, r, stops) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('')}</radialGradient>`;

  function bokeh(seed, n, box, cols, rmin, rmax, op) {
    const rnd = FE.rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const c = cols[Math.floor(rnd() * cols.length)];
      s += C((box[0] + rnd() * box[2]).toFixed(0), (box[1] + rnd() * box[3]).toFixed(0), (rmin + rnd() * (rmax - rmin)).toFixed(0), c, `opacity="${(op * (0.4 + rnd() * 0.6)).toFixed(2)}"`);
    }
    return s;
  }
  function skyline(seed, x, y, w, h, base, lit, n) {
    const rnd = FE.rng(seed); let s = '', cx = x;
    while (cx < x + w) {
      const bw = 40 + rnd() * 70, bh = h * (0.3 + rnd() * 0.7);
      s += R(cx, y + h - bh, bw, bh, shade(base, (rnd() - 0.5) * 0.18));
      for (let wy = y + h - bh + 10; wy < y + h - 8; wy += 17) for (let wx = cx + 7; wx < cx + bw - 9; wx += 14) if (rnd() < 0.3) s += R(wx, wy, 6, 8, lit, 0, `opacity="${(0.4 + rnd() * 0.6).toFixed(2)}"`);
      cx += bw + 3 + rnd() * 6;
    }
    return s;
  }
  function plant(x, y, s, pot, leaf, seed) {
    const rnd = FE.rng(seed || 7); let l = '';
    for (let i = 0; i < 11; i++) {
      const a = -90 + (i - 5) * 17 + (rnd() - 0.5) * 8, len = (110 + rnd() * 90) * s;
      const ex = Math.cos(a * Math.PI / 180) * len, ey = Math.sin(a * Math.PI / 180) * len;
      const col = shade(leaf, (rnd() - 0.5) * 0.35);
      l += `<path d="M0 0C${ex * 0.2 - 22 * s} ${ey * 0.5} ${ex * 0.9 - 26 * s} ${ey * 0.9} ${ex} ${ey}C${ex * 0.9 + 26 * s} ${ey * 0.85} ${ex * 0.3 + 22 * s} ${ey * 0.4} 0 0Z" fill="${col}"/><path d="M0 0L${ex * 0.95} ${ey * 0.95}" stroke="${shade(col, -0.3)}" stroke-width="1.6" opacity=".55"/>`;
    }
    return `<g transform="translate(${x} ${y})">${l}<path d="M${-46 * s} 0H${46 * s}L${36 * s} ${70 * s}H${-36 * s}Z" fill="${pot}"/><path d="M${-46 * s} 0H${46 * s}L${44 * s} ${12 * s}H${-44 * s}Z" fill="${shade(pot, 0.2)}"/><path d="M${20 * s} 0L${34 * s} ${70 * s}H${36 * s}L${46 * s} 0Z" fill="#000" opacity=".16"/></g>`;
  }
  function books(seed, x, y, w, h, cols) {
    const rnd = FE.rng(seed); let s = '', cx = x;
    while (cx < x + w - 8) {
      const bw = 12 + rnd() * 18, bh = h * (0.68 + rnd() * 0.3), c = cols[Math.floor(rnd() * cols.length)];
      const tilt = rnd() < 0.06;
      s += `<g${tilt ? ` transform="rotate(6 ${cx + bw} ${y + h})"` : ''}>${R(cx, y + h - bh, bw, bh, c)}${R(cx + 2, y + h - bh + 8, bw - 4, 3, '#fff', 0, 'opacity=".35"')}${R(cx + bw - 3, y + h - bh, 3, bh, '#000', 0, 'opacity=".2"')}</g>`;
      cx += bw + 1;
    }
    return s;
  }
  function pendant(x, y, len, col, glow) {
    return `<path d="M${x} 0V${y + len}" stroke="#1a1a1f" stroke-width="3"/><path d="M${x - 46} ${y + len + 44}Q${x - 38} ${y + len} ${x} ${y + len}Q${x + 38} ${y + len} ${x + 46} ${y + len + 44}Z" fill="${col}"/><ellipse cx="${x}" cy="${y + len + 46}" rx="46" ry="7" fill="${glow}"/><ellipse cx="${x}" cy="${y + len + 90}" rx="150" ry="120" fill="${glow}" opacity=".12" filter="url(#fe-b30)"/>`;
  }
  function vignette(op) { return `<rect width="1920" height="1080" fill="url(#fe-vig)" opacity="${op}"/>`; }

  const ENV = (FE.ENV = {});

  /* ---------------- OFFICE (late-afternoon, golden hour) ---------------- */
  ENV.office = function (p) {
    const mood = (p && p.mood) || 'gold';
    const sky = mood === 'night' ? [['0', '#101a3a'], ['.6', '#3a2f6b'], ['1', '#d77b6a']] : [['0', '#5a7fb8'], ['.5', '#f2b784'], ['1', '#ffd9a3']];
    const id = FE.uid('o');
    const back = `<defs>${LG(id + 'w', 0, 0, 0, 1, [[0, '#2d4a56'], [1, '#1c3340']])}${LG(id + 's', 0, 0, 0, 1, sky)}${LG(id + 'f', 0, 0, 0, 1, [[0, '#4b3a30'], [1, '#2a211c']])}
      ${LG(id + 'sh', 0, 0, 1, 1, [[0, '#ffe3b0', 0.34], [1, '#ffe3b0', 0]])}${RG(id + 'g', 0.5, 0.5, 0.5, [[0, '#ffd890', 0.9], [1, '#ffd890', 0]])}</defs>
      ${R(0, 0, 1920, 1080, `url(#${id}w)`)}
      <g opacity=".5">${Array.from({ length: 9 }, (_, i) => R(i * 240 + 20, 0, 6, 780, '#000', 0, 'opacity=".12"')).join('')}</g>
      <g filter="url(#fe-b3)">${R(1130, 110, 700, 560, `url(#${id}s)`)}${skyline(11, 1130, 330, 700, 340, '#3d4468', '#ffd89a', 1)}${skyline(23, 1130, 420, 700, 250, '#2a2f4d', '#ffe3a8', 1)}${bokeh(5, 18, [1140, 130, 680, 300], ['#fff1c9', '#ffb77a', '#ffd9a8'], 8, 26, 0.35)}</g>
      <path d="M1130 110H1830V670H1130Z" fill="none" stroke="#10181d" stroke-width="14"/><path d="M1480 110V670M1130 340H1830" stroke="#10181d" stroke-width="9"/>
      <path d="M1130 670H1830" stroke="#caa77a" stroke-width="10"/>
      <polygon points="1130,672 1830,672 1700,1000 560,1000" fill="url(#${id}sh)" opacity=".7"/>
      <g filter="url(#fe-b3)" opacity=".85">${R(40, 520, 420, 6, '#10181d', 3)}${R(60, 150, 380, 380, '#17262e', 6)}${books(3, 70, 160, 360, 110, ['#c7684a', '#e4b34e', '#4e8c8a', '#d9d2c2', '#6c5b9a', '#3d6a98'])}${books(9, 70, 290, 360, 110, ['#d9d2c2', '#2f7d73', '#c7684a', '#e4b34e', '#7b4f63'])}${books(15, 70, 410, 360, 110, ['#e4b34e', '#3d6a98', '#d9d2c2', '#c7684a'])}</g>
      ${plant(380, 160, 0.42, '#c9a27a', '#4f9a6a', 3)}
      <g filter="url(#fe-b3)">${R(560, 190, 190, 130, '#e8dfd0', 4)}${R(576, 206, 160, 98, '#2b6e7b', 2)}${C(630, 250, 26, '#f0b763')}${R(676, 232, 44, 48, '#d9684c', 3)}${R(790, 220, 90, 120, '#e8dfd0', 4)}${R(804, 234, 62, 92, '#c9d9d6', 2)}</g>
      ${pendant(900, 0, 180, '#e7d7bd', '#ffd890')}
      <g filter="url(#fe-b3)" opacity=".7">${R(440, 560, 230, 120, '#243642', 6)}${R(460, 580, 190, 80, '#5b8aa0', 4)}${R(1500, 700, 360, 20, '#10181d')}</g>
      ${R(0, 720, 1920, 360, `url(#${id}f)`)}<path d="M0 720H1920" stroke="#000" stroke-opacity=".25" stroke-width="3"/>
      <g opacity=".1">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 170 - 200} 1080L${i * 120 + 300} 720" stroke="#fff" stroke-width="2"/>`).join('')}</g>
      ${vignette(0.5)}`;
    const front = `<defs>${LG(id + 'd', 0, 0, 0, 1, [[0, '#8a5d3b'], [0.08, '#a8764c'], [1, '#5f3d27']])}${LG(id + 'ds', 0, 0, 0, 1, [[0, '#000', 0.4], [1, '#000', 0]])}${LG(id + 'scr', 0, 0, 1, 1, [[0, '#dfeaf2'], [1, '#aac4d6']])}</defs>
      ${R(-20, 880, 1960, 220, `url(#${id}d)`)}${R(-20, 860, 1960, 24, '#c28a5a')}${R(-20, 884, 1960, 14, `url(#${id}ds)`)}
      <g opacity=".08">${Array.from({ length: 14 }, (_, i) => `<path d="M-20 ${900 + i * 14}H1940" stroke="#000" stroke-width="2"/>`).join('')}</g>
      ${(p && p.monitor === false) ? '' : `<g transform="translate(1530 650)"><path d="M-6 210V230H40V210" fill="#222" /><rect x="-210" y="-170" width="440" height="260" rx="14" fill="#14181c"/><rect x="-198" y="-158" width="416" height="236" rx="6" fill="url(#${id}scr)"/>
        ${R(-176, -136, 120, 14, '#2b6e7b', 4)}${R(-176, -108, 230, 10, '#9fb4c0', 3)}${R(-176, -88, 200, 10, '#9fb4c0', 3)}${R(-176, -68, 170, 10, '#9fb4c0', 3)}${R(60, -136, 140, 100, '#e8c27a', 6, 'opacity=".8"')}${R(-176, -30, 380, 8, '#c8d6de', 3)}${R(-176, -10, 300, 8, '#c8d6de', 3)}
        <path d="M-70 90L-90 220H110L90 90Z" fill="#2b3036"/><rect x="-140" y="214" width="280" height="16" rx="8" fill="#1d2126"/></g>`}
      ${(p && p.lamp === false) ? '' : `<g transform="translate(220 826)"><path d="M0 0L40 -120" stroke="#1a1a1f" stroke-width="8" stroke-linecap="round"/><path d="M40 -120L110 -150" stroke="#1a1a1f" stroke-width="8" stroke-linecap="round"/><path d="M80 -150Q110 -190 150 -150Z" fill="#e8c27a"/><ellipse cx="0" cy="40" rx="50" ry="10" fill="#1a1a1f"/><ellipse cx="116" cy="-140" rx="90" ry="60" fill="#ffd890" opacity=".15" filter="url(#fe-b20)"/></g>`}
      <g transform="translate(380 850)">${R(-34, -48, 62, 54, '#f1ece2', 8)}<path d="M28 -34Q50 -34 50 -14Q50 6 28 6" fill="none" stroke="#f1ece2" stroke-width="7"/><ellipse cx="-3" cy="-46" rx="31" ry="8" fill="#5b3a28"/><path d="M-12 -62Q-4 -84 -16 -100M6 -62Q16 -86 4 -104" stroke="#fff" stroke-opacity=".3" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#fe-b3)"/></g>
      ${R(540, 840, 150, 38, '#d8d1c3', 3)}${R(548, 834, 150, 10, '#efe9dc', 2)}
      <g filter="url(#fe-b8)" opacity=".92"><g transform="translate(0 1000)"><path d="M0 80C40 -80 90 -150 40 -260C130 -170 150 -60 150 80Z" fill="#2f6b4a"/><path d="M60 80C100 -40 180 -90 150 -190C220 -100 240 -20 220 80Z" fill="#3b8059"/></g></g>`;
    return { back, front };
  };

  /* ---------------- CAFÉ ---------------- */
  ENV.cafe = function () {
    const id = FE.uid('f');
    const back = `<defs>${LG(id + 'w', 0, 0, 0, 1, [[0, '#4a3225'], [1, '#2a1b15']])}${LG(id + 'o', 0, 0, 0, 1, [[0, '#9fc2d4'], [1, '#e8d2b0']])}${LG(id + 'c', 0, 0, 0, 1, [[0, '#6b4a34'], [1, '#3e2a1d']])}${LG(id + 'fl', 0, 0, 0, 1, [[0, '#6e5440'], [1, '#33241b']])}</defs>
      ${R(0, 0, 1920, 1080, `url(#${id}w)`)}
      <g opacity=".5">${Array.from({ length: 10 }, (_, r) => Array.from({ length: 16 }, (_, c) => R(c * 124 + (r % 2) * 62 - 30, r * 62 + 4, 118, 56, shade('#7a4a36', ((r * 7 + c * 13) % 9 - 4) * 0.018), 2)).join('')).join('')}</g>
      ${R(0, 0, 1920, 640, '#000', 0, 'opacity=".22"')}
      <g filter="url(#fe-b3)">${R(90, 120, 620, 520, `url(#${id}o)`)}${skyline(31, 90, 340, 620, 300, '#586878', '#fff0c8', 1)}${bokeh(8, 22, [100, 330, 600, 300], ['#ffe0a0', '#ff9a7a', '#fff', '#9ad0ff'], 8, 28, 0.55)}${R(90, 560, 620, 80, '#3a3c44', 0, 'opacity=".7"')}</g>
      <path d="M90 120H710V640H90Z" fill="none" stroke="#1b110c" stroke-width="16"/><path d="M400 120V640M90 380H710" stroke="#1b110c" stroke-width="10"/>
      <g filter="url(#fe-b3)">${R(820, 130, 520, 330, '#1d2a26', 8)}${R(832, 142, 496, 306, '#27382f', 4)}
        <g stroke="#f4efe0" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"><path d="M870 200Q930 178 1010 204T1160 196"/><path d="M870 250H1100M870 296H1180M870 340H1030"/><path d="M1220 250h60v50q0 24-30 24t-30-24z"/><path d="M1280 262q24 4 24 22t-24 22"/><path d="M1236 224q8-14 0-26M1258 224q8-14 0-26"/></g></g>
      <g filter="url(#fe-b3)">${R(1420, 150, 440, 20, '#2a1b15')}${R(1440, 78, 70, 72, '#e8dcc7', 6)}${R(1530, 94, 60, 56, '#d9684c', 6)}${R(1610, 70, 66, 80, '#f1ece2', 6)}${R(1700, 100, 90, 50, '#8fb6a6', 6)}${R(1420, 330, 440, 20, '#2a1b15')}${R(1450, 262, 60, 68, '#e8dcc7', 6)}${R(1536, 280, 80, 50, '#c9a27a', 6)}${R(1640, 258, 80, 72, '#f1ece2', 6)}${R(1748, 290, 80, 40, '#d9684c', 6)}</g>
      ${pendant(560, 0, 150, '#c8a05a', '#ffd48a')}${pendant(960, 0, 100, '#c8a05a', '#ffd48a')}${pendant(1360, 0, 170, '#c8a05a', '#ffd48a')}
      <g filter="url(#fe-b3)">
        ${R(1380, 560, 520, 120, '#8a8f95', 10)}${R(1400, 470, 150, 100, '#b9bfc4', 10)}${R(1420, 490, 110, 50, '#2c3036', 6)}${R(1420, 540, 24, 28, '#e8dcc7', 3)}${R(1600, 520, 210, 60, '#c9ced2', 8)}${C(1672, 500, 26, '#e0e4e7')}
      </g>
      ${R(0, 640, 1920, 440, `url(#${id}fl)`)}
      ${R(0, 650, 1920, 12, '#000', 0, 'opacity=".25"')}
      ${plant(40, 700, 0.55, '#d6b998', '#4f9a6a', 5)}
      ${vignette(0.55)}`;
    const front = `<defs>${LG(id + 't', 0, 0, 0, 1, [[0, '#a9754a'], [1, '#6a4428']])}${LG(id + 'cn', 0, 0, 0, 1, [[0, '#5c3d2a'], [1, '#2d1c13']])}</defs>
      ${R(-20, 868, 1960, 250, `url(#${id}t)`)}${R(-20, 860, 1960, 14, '#d3a276')}${R(-20, 874, 1960, 12, '#000', 0, 'opacity=".25"')}
      <g opacity=".07">${Array.from({ length: 12 }, (_, i) => `<path d="M-20 ${890 + i * 14}H1940" stroke="#000" stroke-width="2"/>`).join('')}</g>
      <g transform="translate(1560 862)">${R(-60, -46, 108, 50, '#f4efe6', 14)}<ellipse cx="-6" cy="-46" rx="54" ry="10" fill="#6b3f26"/><ellipse cx="-6" cy="-46" rx="40" ry="6" fill="#8a5a3a"/><path d="M48 -30Q78 -30 78 -12Q78 6 46 6" fill="none" stroke="#f4efe6" stroke-width="9"/><ellipse cx="-4" cy="8" rx="94" ry="14" fill="#e8dfd0"/><path d="M-12 -70Q0 -96 -14 -112M16 -70Q28 -100 12 -118" stroke="#fff" stroke-opacity=".35" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#fe-b3)"/></g>
      <g transform="translate(250 868)">${R(-50, -34, 90, 36, '#efe9de', 10)}<ellipse cx="-5" cy="-34" rx="44" ry="9" fill="#5b3a28"/><ellipse cx="-5" cy="6" rx="82" ry="12" fill="#e8dfd0"/><rect x="100" y="-30" width="64" height="34" rx="6" fill="#e8c27a"/></g>
      <g filter="url(#fe-b8)" opacity=".9"><g transform="translate(1840 1000)"><path d="M0 80C-40 -80-90 -150-40 -260C-130 -170-150 -60-150 80Z" fill="#2f6b4a"/></g></g>`;
    return { back, front };
  };

  /* ---------------- APARTMENT (evening living room) ---------------- */
  ENV.apartment = function () {
    const id = FE.uid('a');
    const back = `<defs>${LG(id + 'w', 0, 0, 0, 1, [[0, '#dcc9ad'], [1, '#bfa27f']])}${LG(id + 'n', 0, 0, 0, 1, [[0, '#1d2a52'], [1, '#6a4a7a']])}${LG(id + 'fl', 0, 0, 0, 1, [[0, '#8d7156'], [1, '#4d3b2b']])}${LG(id + 'sf', 0, 0, 0, 1, [[0, '#3f6f78'], [1, '#26474f']])}${RG(id + 'lg', 0.5, 0.5, 0.5, [[0, '#ffd89a', 0.85], [1, '#ffd89a', 0]])}</defs>
      ${R(0, 0, 1920, 1080, `url(#${id}w)`)}${R(0, 0, 1920, 1080, '#2a1b3a', 0, 'opacity=".28"')}
      <g filter="url(#fe-b3)">${R(1180, 90, 560, 560, `url(#${id}n)`)}${skyline(41, 1180, 360, 560, 290, '#2a2d52', '#ffd89a', 1)}${bokeh(12, 26, [1190, 300, 540, 340], ['#ffd89a', '#ff9a8a', '#a8c8ff', '#fff'], 6, 22, 0.5)}</g>
      <path d="M1180 90H1740V650H1180Z" fill="none" stroke="#efe6d6" stroke-width="16"/><path d="M1460 90V650" stroke="#efe6d6" stroke-width="9"/>
      <path d="M1100 70H1250V690Q1190 700 1120 690Z" fill="#9b6b7a" opacity=".92"/><path d="M1130 70V680M1170 70V686M1210 70V690" stroke="#000" stroke-opacity=".14" stroke-width="5"/>
      <path d="M1800 70H1670V690Q1730 700 1800 690Z" fill="#9b6b7a" opacity=".92"/><path d="M1760 70V686M1720 70V690M1690 70V690" stroke="#000" stroke-opacity=".14" stroke-width="5"/>
      <g filter="url(#fe-b3)">${R(60, 120, 470, 560, '#5a4636', 6)}${[0, 1, 2, 3].map((i) => R(72, 132 + i * 136, 446, 8, '#3a2c20') + books(20 + i, 80, 140 + i * 136, 430, 118, ['#c7684a', '#e4b34e', '#4e8c8a', '#d9d2c2', '#6c5b9a', '#3d6a98', '#7b4f63'])).join('')}${R(300, 258, 52, 46, '#d9d2c2', 4)}${C(420, 540, 24, '#e4b34e')}</g>
      <g filter="url(#fe-b3)">${R(620, 170, 210, 150, '#f1ece2', 4)}${R(636, 186, 178, 118, '#3b6c7a', 2)}${C(720, 240, 34, '#e9b25d')}${R(660, 262, 130, 30, '#d9684c', 3)}${R(880, 250, 130, 100, '#f1ece2', 4)}${R(894, 264, 102, 72, '#caa7b8', 2)}</g>
      <g transform="translate(940 0)"><path d="M0 0V110" stroke="#1a1a1f" stroke-width="3"/><circle cx="0" cy="150" r="42" fill="#fff3d6"/><circle cx="0" cy="150" r="150" fill="url(#${id}lg)" opacity=".5"/></g>
      ${R(0, 760, 1920, 320, `url(#${id}fl)`)}
      <g filter="url(#fe-b3)"><ellipse cx="860" cy="900" rx="620" ry="76" fill="#b86b52" opacity=".85"/><ellipse cx="860" cy="900" rx="520" ry="56" fill="#e0b27f" opacity=".6"/></g>
      <g>${R(250, 560, 1020, 230, `url(#${id}sf)`, 40)}${R(220, 600, 100, 200, '#2f5860', 40)}${R(1200, 600, 100, 200, '#2f5860', 40)}${R(300, 520, 920, 120, '#33636c', 50)}
        <rect x="330" y="548" width="150" height="130" rx="26" fill="#e9b25d" transform="rotate(-6 400 610)"/><rect x="1000" y="552" width="150" height="130" rx="26" fill="#c7684a" transform="rotate(7 1070 610)"/></g>
      <g transform="translate(1860 760)"><path d="M0 0V-330" stroke="#1a1a1f" stroke-width="6"/><path d="M-70 -330Q-60 -400 0 -400Q60 -400 70 -330Z" fill="#fff3d6"/><ellipse cx="0" cy="-330" rx="70" ry="9" fill="#ffe2a0"/><ellipse cx="0" cy="-250" rx="200" ry="280" fill="url(#${id}lg)" opacity=".4"/></g>
      ${plant(1700, 790, 0.6, '#c9a27a', '#4f9a6a', 9)}
      ${vignette(0.55)}`;
    const front = `<defs>${LG(id + 'ct', 0, 0, 0, 1, [[0, '#a98763'], [1, '#6b4f36']])}</defs>
      ${R(-20, 900, 1960, 200, `url(#${id}ct)`)}${R(-20, 890, 1960, 18, '#d7b88e')}${R(-20, 908, 1960, 12, '#000', 0, 'opacity=".25"')}
      <g transform="translate(300 890)">${R(-52, -50, 84, 52, '#efe9de', 12)}<ellipse cx="-10" cy="-50" rx="42" ry="9" fill="#5b3a28"/><path d="M32 -36Q58 -36 58 -16Q58 4 30 4" fill="none" stroke="#efe9de" stroke-width="8"/></g>
      <g transform="translate(1560 888)">${R(-90, -20, 180, 18, '#e8dfd0', 4)}${R(-84, -42, 168, 24, '#8fb6a6', 4)}${R(-78, -62, 156, 22, '#d9684c', 4)}</g>
      <g filter="url(#fe-b8)" opacity=".9"><g transform="translate(40 1020)"><path d="M0 60C50 -90 100 -170 40 -280C140 -190 170 -70 160 60Z" fill="#2f6b4a"/></g></g>`;
    return { back, front };
  };

  /* ---------------- COWORKING (bright, glass, plants) ---------------- */
  ENV.cowork = function (p) {
    const id = FE.uid('k');
    const back = `<defs>${LG(id + 'w', 0, 0, 0, 1, [[0, '#e9eef0'], [1, '#c9d5d8']])}${LG(id + 'sk', 0, 0, 0, 1, [[0, '#a8d0ee'], [1, '#e9f4f7']])}${LG(id + 'fl', 0, 0, 0, 1, [[0, '#b7a58d'], [1, '#7a6a55']])}${LG(id + 'g', 0, 0, 1, 1, [[0, '#fff', 0.35], [1, '#fff', 0.05]])}</defs>
      ${R(0, 0, 1920, 1080, `url(#${id}w)`)}
      <g filter="url(#fe-b3)">${R(980, 80, 880, 600, `url(#${id}sk)`)}${skyline(51, 980, 380, 880, 300, '#9fb3c4', '#fff', 1)}${skyline(52, 980, 450, 880, 230, '#7f95a8', '#fff', 1)}</g>
      <path d="M980 80H1860V680H980Z" fill="none" stroke="#2a3a44" stroke-width="12"/><path d="M1272 80V680M1566 80V680M980 380H1860" stroke="#2a3a44" stroke-width="7"/>
      <polygon points="980,80 1860,80 1560,980 760,980" fill="#fff" opacity=".14"/>
      <g filter="url(#fe-b3)">${R(80, 120, 600, 380, '#f8fafb', 8)}${R(88, 128, 584, 364, '#eef2f4', 4)}
        <g stroke-width="6" fill="none" stroke-linecap="round"><rect x="130" y="170" width="130" height="80" rx="12" stroke="#3d7bd9"/><rect x="330" y="170" width="130" height="80" rx="12" stroke="#d9684c"/><rect x="520" y="170" width="110" height="80" rx="12" stroke="#2f9a6a"/><path d="M260 210H330M460 210H520" stroke="#6b7680"/><path d="M195 250V330H330M395 250V330M575 250V330H460" stroke="#6b7680"/></g>
        ${R(130, 360, 140, 90, '#f6d66b', 4)}${R(300, 380, 140, 70, '#f2a0b4', 4)}${R(470, 360, 150, 90, '#8fd0c0', 4)}</g>
      <g transform="translate(0 0)">${Array.from({ length: 11 }, (_, i) => `<path d="M${40 + i * 180} 0Q${130 + i * 180} 70 ${220 + i * 180} 0" stroke="#2a2a30" stroke-width="3" fill="none"/>${C(130 + i * 180, 62, 12, '#fff3c8')}${C(130 + i * 180, 62, 46, '#ffe8a8', 'opacity=".18" filter="url(#fe-b8)"')}`).join('')}</g>
      <g filter="url(#fe-b3)" opacity=".75">${R(700, 470, 240, 180, '#fff', 4, 'opacity=".25"')}${R(1010, 560, 160, 130, '#35505e', 8)}${C(1090, 520, 34, '#c28a6a')}${R(1050, 550, 80, 110, '#5a7fb8', 20)}${R(1380, 580, 160, 110, '#35505e', 8)}${C(1460, 546, 30, '#e0b08c')}${R(1424, 570, 72, 100, '#c7684a', 20)}</g>
      ${R(0, 700, 1920, 380, `url(#${id}fl)`)}${R(0, 700, 1920, 4, '#000', 0, 'opacity=".25"')}
      <g opacity=".1">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 130 - 100} 1080L${i * 70 + 340} 700" stroke="#000" stroke-width="2"/>`).join('')}</g>
      ${plant(60, 760, 0.75, '#e0d6c4', '#3f9a62', 4)}${plant(1790, 740, 0.7, '#e0d6c4', '#3f9a62', 6)}
      ${vignette(0.3)}`;
    const front = `<defs>${LG(id + 't', 0, 0, 0, 1, [[0, '#f4f0e8'], [1, '#d4cbb9']])}</defs>
      ${R(-20, 880, 1960, 220, `url(#${id}t)`)}${R(-20, 874, 1960, 14, '#fff')}${R(-20, 888, 1960, 12, '#000', 0, 'opacity=".16"')}
      ${(p && p.laptop === false) ? '' : `<g transform="translate(1500 850)"><rect x="-190" y="-160" width="380" height="230" rx="12" fill="#1b2025"/><rect x="-178" y="-148" width="356" height="206" rx="4" fill="#e8f1f6"/>${R(-156, -126, 100, 12, '#3d7bd9', 4)}${R(-156, -100, 300, 9, '#aab9c3', 3)}${R(-156, -80, 260, 9, '#aab9c3', 3)}${R(-156, -60, 190, 9, '#aab9c3', 3)}${R(60, -60, 90, 70, '#f6d66b', 5)}<rect x="-60" y="68" width="120" height="14" rx="6" fill="#c5cbd0"/></g>`}
      <g transform="translate(240 862)">${R(-40, -26, 120, 24, '#f6d66b', 3)}${R(-30, -50, 120, 26, '#f2a0b4', 3)}${R(-40, 4, 8, 3, '#000', 0, 'opacity="0"')}<ellipse cx="170" cy="-2" rx="48" ry="9" fill="#1a1a1f" opacity=".2"/>${R(130, -50, 80, 50, '#fff', 12)}<path d="M210 -36Q232 -36 232 -18Q232 0 208 0" fill="none" stroke="#fff" stroke-width="8"/></g>`;
    return { back, front };
  };

  /* ---------------- STATION / TRAVEL ---------------- */
  ENV.station = function () {
    const id = FE.uid('s');
    const back = `<defs>${LG(id + 'w', 0, 0, 0, 1, [[0, '#3b4a63'], [0.6, '#7d8aa0'], [1, '#c3b9a9']])}${LG(id + 'sk', 0, 0, 0, 1, [[0, '#cfe3f2'], [1, '#fff6e2']])}${LG(id + 'fl', 0, 0, 0, 1, [[0, '#8a8479'], [1, '#4c4842']])}${LG(id + 'tr', 0, 0, 1, 0, [[0, '#2e5ea8'], [0.5, '#e8ecef'], [1, '#2e5ea8']])}${RG(id + 'hl', 0.5, 0.5, 0.5, [[0, '#fff6c8', 0.95], [1, '#fff6c8', 0]])}</defs>
      ${R(0, 0, 1920, 1080, `url(#${id}w)`)}
      <g filter="url(#fe-b3)">${R(0, 0, 1920, 330, `url(#${id}sk)`)}
        <g stroke="#2a3140" stroke-width="10" fill="none">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 240 - 40} 330L${i * 240 + 80} 20L${i * 240 + 200} 330"/>`).join('')}<path d="M0 20H1920M0 150H1920"/></g></g>
      <polygon points="300,0 900,0 1300,1000 400,1000" fill="#fff6d8" opacity=".14"/><polygon points="1100,0 1500,0 1700,900 1200,900" fill="#fff6d8" opacity=".1"/>
      <g filter="url(#fe-b3)">${R(1000, 330, 880, 380, '#586274')}
        <g transform="translate(1120 360)">${R(0, 0, 580, 300, `url(#${id}tr)`, 40)}${R(40, 40, 230, 130, '#1b2430', 12)}${R(310, 40, 230, 130, '#1b2430', 12)}${R(0, 230, 580, 24, '#1b2430')}${C(60, 220, 18, '#fff6c8')}${C(520, 220, 18, '#fff6c8')}${C(60, 220, 70, 'url(#' + id + 'hl)')}${C(520, 220, 70, 'url(#' + id + 'hl)')}${R(0, 255, 580, 14, '#c9ced4')}</g></g>
      <g filter="url(#fe-b3)">${R(120, 130, 330, 150, '#12161d', 12)}${Array.from({ length: 4 }, (_, r) => `${R(144, 154 + r * 30, 40, 12, ['#ffd24a', '#4ad2a0', '#ff7a5a', '#8fb4ff'][r], 3)}${R(200, 154 + r * 30, 160, 12, '#c8ced8', 3, 'opacity=".7"')}${R(376, 154 + r * 30, 50, 12, '#6ad48a', 3)}`).join('')}</g>
      <g transform="translate(790 160)"><circle r="82" fill="#f4f1ea" stroke="#1a1d24" stroke-width="12"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${(Math.sin(i * Math.PI / 6) * 68).toFixed(1)} ${(-Math.cos(i * Math.PI / 6) * 68).toFixed(1)}L${(Math.sin(i * Math.PI / 6) * 76).toFixed(1)} ${(-Math.cos(i * Math.PI / 6) * 76).toFixed(1)}" stroke="#1a1d24" stroke-width="${i % 3 ? 3 : 6}"/>`).join('')}<path d="M0 0L-30 -40" stroke="#1a1d24" stroke-width="7" stroke-linecap="round"/><path d="M0 0L38 -50" stroke="#1a1d24" stroke-width="5" stroke-linecap="round"/><circle r="6" fill="#d9684c"/></g>
      <g filter="url(#fe-b3)" opacity=".7">${Array.from({ length: 7 }, (_, i) => { const x = 160 + i * 150 + (i % 2) * 40; return `${C(x, 540, 20, ['#c28a6a', '#8c5a3c', '#e0b08c'][i % 3])}${R(x - 26, 560, 52, 130, ['#35506a', '#6b4f63', '#4a7a62', '#9a5a3c'][i % 4], 18)}`; }).join('')}</g>
      ${R(0, 700, 1920, 380, `url(#${id}fl)`)}${R(0, 700, 1920, 6, '#000', 0, 'opacity=".25"')}${R(0, 760, 1920, 10, '#f2c230')}
      <path d="M0 790H1920" stroke="#fff" stroke-opacity=".08" stroke-width="40"/>
      ${vignette(0.4)}`;
    const front = `<defs>${LG(id + 'bn', 0, 0, 0, 1, [[0, '#9a6e46'], [1, '#5a3b24']])}</defs>${R(-20, 930, 1960, 170, `url(#${id}bn)`)}${R(-20, 922, 1960, 14, '#c79862')}${Array.from({ length: 5 }, (_, i) => R(-20, 950 + i * 26, 1960, 3, '#000', 0, 'opacity=".25"')).join('')}<g transform="translate(150 930)"><rect x="-80" y="-250" width="170" height="270" rx="26" fill="#c4623a"/><rect x="-60" y="-230" width="130" height="230" rx="18" fill="#d9764c"/><path d="M-60 -150H70M-60 -90H70" stroke="#000" stroke-opacity=".15" stroke-width="5"/><rect x="-20" y="-296" width="50" height="50" rx="12" fill="none" stroke="#2a2a30" stroke-width="10"/><circle cx="-50" cy="30" r="14" fill="#1a1a1f"/><circle cx="60" cy="30" r="14" fill="#1a1a1f"/></g>
      <g transform="translate(330 960)"><rect x="-60" y="-160" width="120" height="170" rx="22" fill="#3d6a98"/><rect x="-44" y="-144" width="88" height="130" rx="14" fill="#4c7eae"/><path d="M-30 -190Q0 -230 30 -190" stroke="#2a2a30" stroke-width="9" fill="none"/></g>
      <g transform="translate(1720 960)"><rect x="-90" y="-210" width="190" height="230" rx="28" fill="#2f7d73"/><rect x="-66" y="-186" width="142" height="180" rx="18" fill="#3a948a"/><path d="M-66 -120H76M-66 -64H76" stroke="#000" stroke-opacity=".15" stroke-width="5"/><circle cx="-56" cy="26" r="14" fill="#1a1a1f"/><circle cx="66" cy="26" r="14" fill="#1a1a1f"/></g>`;
    return { back, front };
  };

  /* shared filter defs + vignette gradient, injected once into the global defs SVG */
  FE.SHARED_DEFS = `
    <filter id="fe-b3" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="fe-b8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="fe-b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="fe-b30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="fe-sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#0b1020" flood-opacity=".35"/></filter>
    <filter id="fe-sh2" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#0b1020" flood-opacity=".3"/></filter>
    <radialGradient id="fe-vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05060d" stop-opacity=".85"/></radialGradient>`;
})(window);
