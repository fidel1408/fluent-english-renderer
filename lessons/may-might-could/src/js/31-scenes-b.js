/* 31-scenes-b: station platform, apartment hallway, airport gate */
(function () {
  'use strict';
  const FE = window.FE, { el } = FE, SC = FE.SCENES;
  const mk = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const sk = (seed, base, hmin, hmax, col, win, a) => { const r = FE.rng(seed); let x = -30, s = ''; while (x < 1950) { const w = 50 + r() * 60, hh = hmin + r() * (hmax - hmin); s += `<rect x="${x.toFixed(0)}" y="${(base - hh).toFixed(0)}" width="${w.toFixed(0)}" height="${(hh + 4).toFixed(0)}" fill="${col}"/>`; for (let wy = base - hh + 12; wy < base - 8; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 18) if (r() > 0.6) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="11" fill="${win}" opacity="${a}"/>`; x += w + 4; } return s; };

  /* ---------- PLATFORM ---------- */
  SC.platform = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', mk('pls', '#5b8fc9', '#d9e8f3') + mk('plf', '#8d9099', '#6b6e78') + mk('trn', '#d9dee6', '#9aa3b0'));
    L.back.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#pls)' }));
    L.back.appendChild(el('g', { opacity: 0.55 }, sk(21, 640, 80, 260, '#7c8fb3', '#fff0bf', 0.5)));
    // tracks in perspective
    let tr = `<rect x="0" y="640" width="1920" height="240" fill="#4a4d57"/>`;
    for (let i = 0; i < 22; i++) { const y = 650 + Math.pow(i / 22, 1.5) * 220; tr += `<rect x="0" y="${y.toFixed(0)}" width="1920" height="${(3 + i * 0.5).toFixed(1)}" fill="#2f3138" opacity=".5"/>`; }
    tr += `<rect x="0" y="716" width="1920" height="10" fill="#b8bcc6"/><rect x="0" y="796" width="1920" height="12" fill="#b8bcc6"/>`;
    L.mid.appendChild(el('g', {}, tr));
    // train (slides in from the right when S.train is tweened)
    const train = el('g', { class: 'train' }, `<g transform="translate(0,470)"><rect x="0" y="0" width="1500" height="230" rx="30" fill="url(#trn)" stroke="#808996" stroke-width="4"/><rect x="0" y="120" width="1500" height="22" fill="#2c6fb0"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${60 + i * 240}" y="30" width="190" height="80" rx="10" fill="#27384f"/><rect x="${70 + i * 240}" y="36" width="170" height="30" rx="8" fill="#9fc7ee" opacity=".5"/>`).join('')}<rect x="-8" y="30" width="120" height="110" rx="14" fill="#27384f"/><circle cx="22" cy="170" r="18" fill="#fff6c9"/><circle cx="22" cy="170" r="48" fill="#fff0a0" opacity=".25"/></g>`);
    S.trainX = 2200; L.mid.appendChild(train);
    // platform surface + edge
    L.mid.appendChild(el('g', {}, `<rect x="0" y="858" width="1920" height="222" fill="url(#plf)"/><rect x="0" y="848" width="1920" height="16" fill="#e8b93a"/><rect x="0" y="864" width="1920" height="3" fill="#000" opacity=".25"/>` + Array.from({ length: 12 }, (_, i) => `<line x1="${i * 180}" y1="867" x2="${(i * 180 - 960) * 1.8 + 960}" y2="1080" stroke="#555963" stroke-opacity=".35" stroke-width="2"/>`).join('')));
    // canopy columns + clock (no numerals) + bench
    let cols = ''; [260, 960, 1660].forEach((x) => { cols += `<rect x="${x - 16}" y="0" width="32" height="870" fill="#2d3340"/><rect x="${x - 28}" y="840" width="56" height="30" fill="#232834"/>`; });
    L.mid.appendChild(el('g', {}, `<rect x="0" y="0" width="1920" height="86" fill="#232834"/><rect x="0" y="86" width="1920" height="10" fill="#e8b93a" opacity=".9"/>${cols}<g transform="translate(960,190)"><rect x="-6" y="-120" width="12" height="130" fill="#2d3340"/><circle r="74" fill="#f6f2e8" stroke="#232834" stroke-width="10"/>${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-60" x2="0" y2="-50" stroke="#232834" stroke-width="4" transform="rotate(${i * 30})"/>`).join('')}<line x1="0" y1="0" x2="0" y2="-40" stroke="#232834" stroke-width="6" stroke-linecap="round" transform="rotate(100)"/><line x1="0" y1="0" x2="0" y2="-54" stroke="#c2503b" stroke-width="4" stroke-linecap="round" transform="rotate(-30)"/><circle r="6" fill="#232834"/></g>`));
    L.front.appendChild(el('g', {}, `<g transform="translate(1380,860)"><rect x="0" y="-70" width="330" height="14" rx="6" fill="#8d6139"/><rect x="0" y="-100" width="330" height="22" rx="8" fill="#a9754a"/><rect x="20" y="-56" width="12" height="56" fill="#2d3340"/><rect x="298" y="-56" width="12" height="56" fill="#2d3340"/></g>`));
    S.anim.push((dt) => { train.setAttribute('transform', `translate(${S.trainX.toFixed(1)},0)`); });
    return { floorY: 975, charScale: 0.88, light: 'radial-gradient(ellipse at 50% 10%,rgba(255,240,200,.15),transparent 60%),linear-gradient(180deg,rgba(0,0,0,0),rgba(10,10,30,.2))' };
  };

  /* ---------- HALLWAY with doors ---------- */
  SC.hallway = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', mk('hw', '#e2d4bf', '#cdbba0') + mk('hf', '#7a3b3b', '#5b2a2f') + `<radialGradient id="hdl"><stop offset="0" stop-color="#ffd98a" stop-opacity=".95"/><stop offset="1" stop-color="#ffbf5a" stop-opacity="0"/></radialGradient>`);
    L.back.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#hw)' }));
    let walls = `<rect x="0" y="560" width="1920" height="300" fill="#a67b57"/>`;
    for (let i = 0; i < 9; i++) walls += `<rect x="${40 + i * 215}" y="590" width="170" height="230" rx="6" fill="none" stroke="#8c6444" stroke-width="5" opacity=".7"/>`;
    L.back.appendChild(el('g', {}, walls));
    const door = (x, lit, ajar) => `<g transform="translate(${x},250)"><rect x="-12" y="-14" width="244" height="620" rx="6" fill="#efe6d4"/>${lit ? `<path d="M0,0 L${ajar ? 70 : 220},0 L${ajar ? 70 : 220},590 L0,590Z" fill="#fff0c8"/><rect x="${ajar ? 70 : 220}" y="0" width="${ajar ? 150 : 0}" height="590" fill="#6a4b34"/>` : `<rect x="0" y="0" width="220" height="590" rx="4" fill="#5b7a8a"/><rect x="26" y="36" width="168" height="230" rx="4" fill="#4d6a79"/><rect x="26" y="300" width="168" height="250" rx="4" fill="#4d6a79"/><circle cx="188" cy="318" r="10" fill="#d8b86a"/>`}<rect x="78" y="-72" width="66" height="40" rx="6" fill="#d8b86a"/><circle cx="111" cy="-52" r="9" fill="#fff6d9" opacity=".6"/></g>`;
    L.mid.appendChild(el('g', {}, door(110, false) + door(480, false) + door(1200, true, true) + door(1580, false)));
    L.mid.appendChild(el('g', {}, [330, 1060, 1440, 1840].map((x) => `<g transform="translate(${x},330)"><circle r="90" fill="url(#hdl)"/><path d="M-16,0 Q0,-30 16,0 L12,26 L-12,26Z" fill="#d8b86a"/></g>`).join('')));
    L.mid.appendChild(el('g', {}, `<rect x="0" y="860" width="1920" height="220" fill="url(#hf)"/><rect x="0" y="852" width="1920" height="14" fill="#efe6d4"/><path d="M0,900 H1920" stroke="#d8b86a" stroke-width="5" opacity=".6"/><path d="M0,1010 H1920" stroke="#d8b86a" stroke-width="5" opacity=".5"/>`));
    L.front.appendChild(el('g', {}, `<g transform="translate(1790,860)"><rect x="-50" y="-190" width="100" height="190" rx="8" fill="#6b4a33"/><path d="M-44,-120h88" stroke="#4e3524" stroke-width="3"/><circle cx="0" cy="-60" r="9" fill="#d8b86a"/><g transform="translate(0,-220)"><rect x="-30" y="0" width="60" height="30" rx="14" fill="#c2503b"/><path d="M0,0 V-60" stroke="#2e7d4f" stroke-width="8" stroke-linecap="round"/><ellipse cx="-20" cy="-60" rx="26" ry="14" fill="#3d9a62"/><ellipse cx="22" cy="-72" rx="26" ry="14" fill="#2e7d4f"/></g></g>`));
    return { floorY: 975, charScale: 0.9, light: 'radial-gradient(ellipse at 70% 40%,rgba(255,220,150,.22),transparent 55%),linear-gradient(180deg,rgba(0,0,0,0),rgba(40,10,10,.22))' };
  };

  /* ---------- AIRPORT gate ---------- */
  SC.airport = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', mk('as', '#6ea8dd', '#d7e9f6') + mk('af', '#cfd3d9', '#aab0ba') + mk('aw', '#eef0f3', '#d9dde3'));
    L.back.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#aw)' }));
    // glass wall with plane and tarmac
    const clip = el('clipPath', { id: 'apc' }, '<rect x="160" y="150" width="1600" height="560" rx="8"/>'); defs.appendChild(clip);
    const view = el('g', { 'clip-path': 'url(#apc)' }, `<rect x="160" y="150" width="1600" height="560" fill="url(#as)"/><g opacity=".5">${sk(31, 560, 30, 110, '#8aa0c0', '#fff', 0)}</g><rect x="160" y="560" width="1600" height="150" fill="#7d8591"/><path d="M160,640 H1760" stroke="#e8e3a0" stroke-width="6" stroke-dasharray="60 40"/>
      <g transform="translate(900,470)"><path d="M-380,20 C-380,-40 -320,-70 -230,-70 L290,-70 C380,-70 450,-40 470,20 C450,70 380,90 290,90 L-230,90 C-320,90 -380,70 -380,20Z" fill="#f4f6f8" stroke="#aab3bf" stroke-width="4"/><path d="M-80,-70 L-190,-210 L-120,-210 L40,-70Z" fill="#dfe5ea" stroke="#aab3bf" stroke-width="3"/><path d="M-60,70 L-210,190 L-130,190 L80,70Z" fill="#dfe5ea" stroke="#aab3bf" stroke-width="3"/><path d="M-340,-60 L-380,-190 L-310,-190 L-250,-70Z" fill="#2c6fb0"/>${Array.from({ length: 14 }, (_, i) => `<circle cx="${-210 + i * 40}" cy="-14" r="9" fill="#4b6483"/>`).join('')}<circle cx="420" cy="14" r="18" fill="#2c6fb0" opacity=".25"/></g>`);
    L.back.appendChild(view);
    L.back.appendChild(el('g', {}, `<rect x="146" y="136" width="1628" height="588" rx="16" fill="none" stroke="#98a1ae" stroke-width="16"/>${[560, 960, 1360].map((x) => `<rect x="${x - 5}" y="150" width="10" height="560" fill="#98a1ae"/>`).join('')}<path d="M160,700 L1000,150" stroke="#fff" stroke-opacity=".08" stroke-width="140"/>`));
    // departure board (abstract bars only)
    L.mid.appendChild(el('g', { transform: 'translate(660,24)' }, `<rect width="600" height="104" rx="10" fill="#10172b"/>${[0, 1, 2].map((i) => `<g transform="translate(24,${16 + i * 28})"><rect width="70" height="14" rx="3" fill="#f2b84b"/><rect x="90" width="180" height="14" rx="3" fill="#cfd8f0" opacity=".85"/><rect x="290" width="140" height="14" rx="3" fill="#cfd8f0" opacity=".6"/><circle cx="520" cy="7" r="8" fill="${['#58c288', '#f2b84b', '#e8685b'][i]}"/></g>`).join('')}`));
    L.mid.appendChild(el('g', {}, `<rect x="0" y="724" width="1920" height="356" fill="url(#af)"/>` + Array.from({ length: 16 }, (_, i) => `<line x1="${i * 140 - 100}" y1="724" x2="${(i * 140 - 100 - 960) * 2.2 + 960}" y2="1080" stroke="#8f96a2" stroke-opacity=".5" stroke-width="3"/>`).join('') + `<rect x="0" y="724" width="1920" height="10" fill="#8f96a2"/>`));
    // seat row + gate counter
    const seat = (x, y) => `<g transform="translate(${x},${y})"><rect x="0" y="-70" width="86" height="70" rx="12" fill="#2d4a7a"/><rect x="-8" y="-14" width="102" height="26" rx="10" fill="#243b66"/><rect x="40" y="12" width="8" height="50" fill="#555d6a"/></g>`;
    L.mid.appendChild(el('g', {}, [1100, 1196, 1292, 1388, 1484].map((x) => seat(x, 850)).join('')));
    L.front.appendChild(el('g', {}, `<g transform="translate(130,780)"><ellipse cx="260" cy="262" rx="330" ry="20" fill="#000" opacity=".2"/><rect x="0" y="0" width="520" height="250" rx="14" fill="#1e3358"/><rect x="0" y="0" width="520" height="22" rx="10" fill="#e8ecf2"/><rect x="40" y="60" width="130" height="14" rx="3" fill="#f2b84b"/><rect x="40" y="90" width="90" height="10" rx="3" fill="#8aa0c8"/><g transform="translate(330,-100)"><rect width="150" height="100" rx="8" fill="#1e2530" stroke="#10151d" stroke-width="4"/><rect x="10" y="10" width="130" height="80" rx="4" fill="#cfe6ff"/><rect x="10" y="10" width="130" height="22" fill="#8fc4f0"/></g></g>
      <g transform="translate(1520,930)"><rect x="-44" y="-130" width="88" height="130" rx="14" fill="#d1583e"/><rect x="-26" y="-150" width="52" height="24" rx="8" fill="none" stroke="#555d6a" stroke-width="6"/><rect x="-34" y="-110" width="68" height="10" fill="#fff" opacity=".3"/></g>`));
    return { floorY: 975, charScale: 0.88, light: 'radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.2),transparent 60%),linear-gradient(180deg,rgba(0,0,0,0),rgba(10,10,40,.18))' };
  };
})();
