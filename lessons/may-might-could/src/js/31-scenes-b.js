/* 31-scenes-b: station platform, apartment hallway, airport gate (modelled materials, lighting and depth) */
(function () {
  'use strict';
  const FE = window.FE, { el } = FE, SC = FE.SCENES;
  const lg = (id, st, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${st.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const rg = (id, st) => `<radialGradient id="${id}">${st.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const n = (v) => (+v).toFixed(1);

  /* ---------- PLATFORM ---------- */
  SC.platform = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend',
      lg('plf', [[0, '#a9adb6'], [0.4, '#8a8f9a'], [1, '#5f636e']]) + lg('trn', [[0, '#fbfcfe'], [0.45, '#dde3ec'], [1, '#8f9aab']]) + lg('trg', [[0, '#7fa2c9'], [0.5, '#2d4361'], [1, '#18263b']]) +
      lg('pcol', [[0, '#202634'], [0.35, '#4a5366'], [0.6, '#343c4c'], [1, '#1b202c']], 0, 0, 1, 0) + lg('pcan', [[0, '#14181f'], [1, '#303847']]) + lg('rail', [[0, '#e7eaf0'], [0.5, '#a9afba'], [1, '#5c6270']]) +
      lg('ball', [[0, '#5b5d66'], [1, '#383a42']]) + rg('plamp', [[0, '#fff1c0', 0.95], [1, '#ffd98a', 0]]) + lg('refl', [[0, '#fff', 0.2], [1, '#fff', 0]]) + lg('bench', [[0, '#c88e58'], [1, '#8a5a34']]));
    const sky = FE.makeSky(S, 1920, 700, 520, { sunX: 1560, sunY: 250, clouds: 6, seed: 21 });
    L.back.appendChild(sky.g);
    L.back.appendChild(el('g', { opacity: 0.6 }, FE.skyline(21, 660, 0, '#8196b8', '#fff0bf', 80, 260, 50, 100, 0.55)));
    L.back.appendChild(el('g', {}, FE.skyline(23, 700, 0, '#51648b', '#ffe3a0', 50, 170, 60, 120, 0.8)));
    // track bed: ballast with gravel, two polished rails, sleepers seen end-on
    const r = FE.rng(4); let tr = `<rect x="0" y="690" width="1920" height="190" fill="url(#ball)"/>`;
    for (let i = 0; i < 420; i++) { const x = r() * 1920, y = 696 + r() * 176; tr += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1 + r() * 2.4).toFixed(1)}" fill="${r() > 0.5 ? '#8b8d96' : '#222328'}" opacity="${(0.25 + r() * 0.4).toFixed(2)}"/>`; }
    for (let x = 20; x < 1920; x += 90) tr += `<rect x="${x}" y="722" width="46" height="9" rx="2" fill="#2a2b30" opacity=".75"/><rect x="${x}" y="800" width="46" height="9" rx="2" fill="#2a2b30" opacity=".75"/>`;
    tr += `<rect x="0" y="708" width="1920" height="14" fill="url(#rail)"/><rect x="0" y="708" width="1920" height="3" fill="#fff" opacity=".55"/><rect x="0" y="722" width="1920" height="6" fill="#000" opacity=".3"/><rect x="0" y="790" width="1920" height="16" fill="url(#rail)"/><rect x="0" y="790" width="1920" height="3" fill="#fff" opacity=".55"/><rect x="0" y="806" width="1920" height="6" fill="#000" opacity=".35"/>`;
    L.mid.appendChild(el('g', {}, tr));
    // train: modelled carriage (rolls in when S.trainX is tweened)
    let tw = ''; for (let i = 0; i < 6; i++) tw += `<g transform="translate(${60 + i * 240},30)"><rect width="190" height="86" rx="12" fill="#101a2a"/><rect x="5" y="5" width="180" height="76" rx="9" fill="url(#trg)"/><path d="M20,76 L74,5 L104,5 L50,76Z" fill="#fff" opacity=".13"/><path d="M92,76 L134,5 L148,5 L106,76Z" fill="#fff" opacity=".08"/><rect x="5" y="5" width="180" height="7" rx="3" fill="#fff" opacity=".18"/></g><rect x="${240 + i * 240}" y="26" width="3" height="170" fill="#7e899b" opacity=".6"/>`;
    const train = el('g', { class: 'train' }, `<g transform="translate(0,452)"><rect x="0" y="0" width="1500" height="248" rx="34" fill="url(#trn)" stroke="#6f7a8c" stroke-width="3"/><rect x="0" y="130" width="1500" height="26" fill="#2c6fb0"/><rect x="0" y="130" width="1500" height="5" fill="#8fc0ee" opacity=".8"/><rect x="0" y="156" width="1500" height="4" fill="#173a63" opacity=".6"/><rect x="0" y="196" width="1500" height="52" rx="14" fill="#7d8798" opacity=".35"/><rect x="40" y="-14" width="420" height="16" rx="6" fill="#4a5262"/><path d="M200,-14 L260,-54 L330,-54 L360,-14Z" fill="none" stroke="#3a4150" stroke-width="5"/>${tw}<rect x="-10" y="26" width="128" height="116" rx="18" fill="#101a2a"/><rect x="-2" y="32" width="112" height="104" rx="14" fill="url(#trg)"/><rect x="0" y="236" width="1500" height="14" fill="#2b303b"/>${[120, 320, 1180, 1380].map((x) => `<g transform="translate(${x},250)"><circle r="28" fill="#20242d"/><circle r="18" fill="#868f9d"/><circle r="6" fill="#20242d"/></g>`).join('')}<circle cx="22" cy="186" r="14" fill="#fff6c9"/><circle cx="22" cy="186" r="60" fill="url(#plamp)" opacity=".7"/></g>`);
    S.trainX = 2200; L.mid.appendChild(train);
    // platform: stone tiles in perspective, tactile edge with studs, soft gloss
    let pl = `<rect x="0" y="858" width="1920" height="222" fill="url(#plf)"/>`;
    for (let i = 0; i < 6; i++) { const y = 872 + Math.pow(i / 6, 1.5) * 210; pl += `<line x1="0" y1="${n(y)}" x2="1920" y2="${n(y)}" stroke="#3d4049" stroke-opacity=".4" stroke-width="2"/>`; }
    for (let i = 0; i < 22; i++) pl += `<line x1="${i * 100 - 100}" y1="867" x2="${n((i * 100 - 100 - 960) * 1.7 + 960)}" y2="1080" stroke="#3d4049" stroke-opacity=".28" stroke-width="2"/>`;
    pl += `<rect x="0" y="848" width="1920" height="20" fill="#e8b93a"/><rect x="0" y="848" width="1920" height="4" fill="#fff6bf" opacity=".6"/><rect x="0" y="864" width="1920" height="4" fill="#000" opacity=".28"/>`;
    for (let x = 12; x < 1920; x += 26) pl += `<circle cx="${x}" cy="858" r="3" fill="#a87c10" opacity=".7"/>`;
    pl += `<rect x="0" y="868" width="1920" height="60" fill="url(#refl)"/>`;
    L.mid.appendChild(el('g', {}, pl));
    // canopy: steel beam with rivets, round columns, lamps, wall-clock with polished bezel
    let cols = ''; [260, 960, 1660].forEach((x) => { cols += `<rect x="${x - 17}" y="86" width="34" height="784" fill="url(#pcol)"/><rect x="${x - 30}" y="836" width="60" height="34" rx="4" fill="#161b25"/><rect x="${x - 24}" y="840" width="48" height="5" fill="#fff" opacity=".12"/><rect x="${x - 26}" y="86" width="52" height="22" rx="4" fill="#161b25"/>`; });
    let riv = ''; for (let x = 30; x < 1920; x += 60) riv += `<circle cx="${x}" cy="70" r="3" fill="#59627a"/>`;
    const lamps = [110, 610, 1310, 1810].map((x) => `<g transform="translate(${x},96)"><rect x="-70" y="-6" width="140" height="10" rx="4" fill="#0d1017"/><ellipse cx="0" cy="3" rx="62" ry="6" fill="#fff6d5"/><ellipse cx="0" cy="60" rx="150" ry="120" fill="url(#plamp)" opacity=".34"/></g>`).join('');
    const tick = Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="-62" x2="0" y2="${i % 3 ? -54 : -48}" stroke="#232834" stroke-width="${i % 3 ? 3 : 5}" transform="rotate(${i * 30})"/>`).join('');
    L.mid.appendChild(el('g', {}, `<rect x="0" y="0" width="1920" height="86" fill="url(#pcan)"/><rect x="0" y="82" width="1920" height="6" fill="#000" opacity=".4"/><rect x="0" y="86" width="1920" height="10" fill="#e8b93a"/><rect x="0" y="86" width="1920" height="3" fill="#fff6bf" opacity=".6"/>${riv}${cols}${lamps}<g transform="translate(960,190)"><rect x="-7" y="-120" width="14" height="130" fill="#2d3340"/><circle r="80" fill="#10141c"/><circle r="76" fill="#b9bfc9"/><circle r="70" fill="#f8f5ec"/><circle r="70" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/><path d="M-60,-30 A66,66 0 0 1 20,-64" stroke="#fff" stroke-width="10" stroke-opacity=".35" fill="none" stroke-linecap="round"/>${tick}<line x1="0" y1="0" x2="0" y2="-38" stroke="#232834" stroke-width="7" stroke-linecap="round" transform="rotate(100)"/><line x1="0" y1="0" x2="0" y2="-54" stroke="#c2503b" stroke-width="4" stroke-linecap="round" transform="rotate(-30)"/><circle r="7" fill="#232834"/></g>`));
    L.front.appendChild(el('g', {}, `<g transform="translate(1380,862)"><ellipse cx="165" cy="12" rx="190" ry="12" fill="#000" opacity=".28"/><rect x="18" y="-60" width="14" height="66" fill="#1b212c"/><rect x="298" y="-60" width="14" height="66" fill="#1b212c"/><rect x="0" y="-74" width="330" height="18" rx="7" fill="url(#bench)"/><rect x="0" y="-74" width="330" height="4" rx="2" fill="#fff" opacity=".28"/><rect x="0" y="-108" width="330" height="26" rx="9" fill="url(#bench)"/><rect x="0" y="-108" width="330" height="4" rx="2" fill="#fff" opacity=".28"/><rect x="0" y="-86" width="330" height="4" fill="#000" opacity=".3"/></g>`));
    S.anim.push((dt) => { train.setAttribute('transform', `translate(${S.trainX.toFixed(1)},0)`); });
    return { floorY: 975, charScale: 0.88, light: 'radial-gradient(ellipse at 82% 14%,rgba(255,236,190,.22),transparent 55%),radial-gradient(ellipse at 50% 8%,rgba(255,240,200,.12),transparent 60%),linear-gradient(180deg,rgba(0,0,0,0),rgba(10,10,30,.2))',
      env(env, dt) { sky.update(env, dt); } };
  };

  /* ---------- HALLWAY with doors ---------- */
  SC.hallway = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend',
      lg('hw', [[0, '#eadcc6'], [0.7, '#d6c4a8'], [1, '#c2ad8c']]) + lg('hwd', [[0, '#b58a63'], [1, '#8f6444']]) + lg('hf', [[0, '#8a4444'], [0.5, '#6c3036'], [1, '#4e2227']]) +
      lg('hdr', [[0, '#6f8fa0'], [1, '#496677']], 0, 0, 1, 0) + lg('hdp', [[0, '#5c7c8e'], [1, '#41596a']]) + lg('hfr', [[0, '#f6eddc'], [1, '#d9ccb2']]) + lg('hbr', [[0, '#ffe9a6'], [1, '#b98d2c']], 0, 0, 1, 1) +
      rg('hdl', [[0, '#ffd98a', 0.95], [0.4, '#ffc25c', 0.4], [1, '#ffbf5a', 0]]) + lg('hspill', [[0, '#fff3cc', 0.9], [1, '#fff3cc', 0]], 0, 0, 1, 0));
    L.back.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#hw)' }));
    // damask-style wallpaper stripes + crown moulding + wainscot with raised panels
    let wl = ''; for (let x = 0; x < 1920; x += 64) wl += `<rect x="${x}" y="40" width="30" height="520" fill="#fff" opacity=".1"/><circle cx="${x + 15}" cy="150" r="5" fill="#b89d78" opacity=".25"/><circle cx="${x + 47}" cy="260" r="5" fill="#b89d78" opacity=".25"/><circle cx="${x + 15}" cy="370" r="5" fill="#b89d78" opacity=".25"/><circle cx="${x + 47}" cy="480" r="5" fill="#b89d78" opacity=".25"/>`;
    wl += `<rect x="0" y="0" width="1920" height="40" fill="#f2e8d4"/><rect x="0" y="36" width="1920" height="8" fill="#000" opacity=".12"/><rect x="0" y="0" width="1920" height="4" fill="#fff" opacity=".6"/>`;
    wl += `<rect x="0" y="548" width="1920" height="312" fill="url(#hwd)"/><rect x="0" y="540" width="1920" height="14" fill="url(#hfr)"/><rect x="0" y="554" width="1920" height="8" fill="#000" opacity=".18"/>`;
    for (let i = 0; i < 9; i++) { const x = 40 + i * 215; wl += `<rect x="${x}" y="592" width="170" height="226" rx="4" fill="#a67b57" stroke="#6e4a2f" stroke-width="3"/><path d="M${x + 4},${814} L${x + 4},${596} L${x + 166},${596}" stroke="#7a5236" stroke-width="3" fill="none" opacity=".9"/><path d="M${x + 4},${814} L${x + 166},${814} L${x + 166},${596}" stroke="#d9b48c" stroke-width="3" fill="none" opacity=".7"/>`; }
    wl += `<rect x="0" y="832" width="1920" height="34" fill="url(#hfr)"/><rect x="0" y="860" width="1920" height="8" fill="#000" opacity=".28"/>`;
    L.back.appendChild(el('g', {}, wl));
    const door = (x, lit, ajar) => {
      const dw = 220, open = ajar ? 70 : dw;
      const body = lit
        ? `<rect x="0" y="0" width="${dw}" height="590" fill="#2a1c12"/><path d="M0,0 L${open},0 L${open},590 L0,590Z" fill="#ffe9ae"/><path d="M0,0 L${open},0 L${open},590 L0,590Z" fill="url(#hspill)"/><path d="M${open},0 L${dw - 10},22 L${dw - 10},572 L${open},590Z" fill="url(#hdr)"/><path d="M${open},0 L${dw - 10},22 L${dw - 10},572 L${open},590Z" fill="#000" opacity=".22"/>`
        : `<rect x="0" y="0" width="${dw}" height="590" rx="4" fill="url(#hdr)"/>${[[26, 36, 168, 230], [26, 300, 168, 250]].map(([a, b, c, d]) => `<rect x="${a}" y="${b}" width="${c}" height="${d}" rx="3" fill="url(#hdp)"/><path d="M${a},${b + d} L${a},${b} L${a + c},${b}" stroke="#2d4452" stroke-width="3" fill="none"/><path d="M${a},${b + d} L${a + c},${b + d} L${a + c},${b}" stroke="#9db8c6" stroke-opacity=".55" stroke-width="3" fill="none"/>`).join('')}<rect x="0" y="0" width="14" height="590" fill="#fff" opacity=".07"/><circle cx="190" cy="318" r="12" fill="url(#hbr)"/><circle cx="187" cy="315" r="4" fill="#fff" opacity=".8"/><circle cx="188" cy="262" r="6" fill="#d9c9a0" opacity=".8"/>`;
      return `<g transform="translate(${x},250)"><rect x="-14" y="-16" width="248" height="624" rx="6" fill="url(#hfr)"/><rect x="-14" y="-16" width="248" height="8" rx="4" fill="#fff" opacity=".7"/>${body}<rect x="-14" y="590" width="248" height="14" fill="#000" opacity=".16"/><g transform="translate(80,-74)"><rect width="64" height="40" rx="6" fill="url(#hbr)" stroke="#8a6a1c" stroke-width="2"/><rect x="10" y="12" width="44" height="6" rx="3" fill="#6b4f10" opacity=".55"/><rect x="18" y="24" width="28" height="5" rx="2.5" fill="#6b4f10" opacity=".4"/></g></g>`;
    };
    L.mid.appendChild(el('g', {}, door(110, false) + door(480, false) + door(1200, true, true) + door(1580, false)));
    L.mid.appendChild(el('g', {}, [330, 1060, 1440, 1840].map((x) => `<g transform="translate(${x},350)"><circle r="120" fill="url(#hdl)"/><path d="M-18,0 Q0,-34 18,0 L14,34 L-14,34Z" fill="url(#hbr)" stroke="#8a6a1c" stroke-width="1.5"/><path d="M-9,-2 Q0,-22 9,-2 L7,24 L-7,24Z" fill="#fff6d0" opacity=".85"/><rect x="-6" y="-26" width="12" height="26" fill="#8a6a1c"/></g>`).join('')));
    // runner carpet with border pattern, soft reflections of sconces
    let cp = `<rect x="0" y="866" width="1920" height="214" fill="url(#hf)"/><rect x="0" y="866" width="1920" height="26" fill="#000" opacity=".28"/><rect x="0" y="892" width="1920" height="14" fill="#d9b86a" opacity=".75"/><rect x="0" y="1008" width="1920" height="12" fill="#d9b86a" opacity=".6"/>`;
    for (let x = -20; x < 1960; x += 70) cp += `<path d="M${x},950 l24,-20 l24,20 l-24,20z" fill="#d9b86a" opacity=".32"/><path d="M${x + 35},950 l8,-7 l8,7 l-8,7z" fill="#e8d28f" opacity=".35"/>`;
    cp += `<rect x="0" y="866" width="1920" height="214" fill="#fff" opacity=".03"/>`;
    L.mid.appendChild(el('g', {}, cp));
    L.front.appendChild(el('g', {}, `<g transform="translate(1790,866)"><ellipse cx="0" cy="8" rx="80" ry="10" fill="#000" opacity=".3"/><rect x="-52" y="-196" width="104" height="196" rx="8" fill="#6b4a33"/><rect x="-52" y="-196" width="104" height="10" rx="4" fill="#9a6e4a"/><rect x="-44" y="-128" width="88" height="4" fill="#3b2819"/><rect x="-44" y="-118" width="88" height="106" rx="4" fill="#5a3d28"/><circle cx="0" cy="-60" r="9" fill="url(#hbr)"/><g transform="translate(0,-222)"><path d="M-34,0 L34,0 L26,40 L-26,40Z" fill="#c2503b"/><rect x="-38" y="-8" width="76" height="14" rx="6" fill="#d9654e"/><path d="M0,-6 V-70" stroke="#2e7d4f" stroke-width="8" stroke-linecap="round"/><path d="M0,-30 C-50,-50 -62,-84 -50,-104 C-18,-90 -6,-60 0,-30Z" fill="#3d9a62"/><path d="M0,-44 C48,-62 62,-96 48,-116 C16,-102 4,-72 0,-44Z" fill="#2e7d4f"/><path d="M0,-70 C-8,-100 8,-130 0,-150 C16,-128 12,-98 0,-70Z" fill="#4aa86f"/></g></g>`));
    return { floorY: 975, charScale: 0.9, light: 'radial-gradient(ellipse at 70% 40%,rgba(255,220,150,.24),transparent 55%),radial-gradient(ellipse at 30% 30%,rgba(255,226,170,.14),transparent 55%),linear-gradient(180deg,rgba(0,0,0,0),rgba(40,10,10,.24))' };
  };

  /* ---------- AIRPORT gate ---------- */
  SC.airport = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend',
      lg('af', [[0, '#dfe3ea'], [0.35, '#c4cad4'], [1, '#98a0ae']]) + lg('aw', [[0, '#f3f5f8'], [1, '#d6dbe3']]) + lg('afus', [[0, '#ffffff'], [0.5, '#e6ebf1'], [0.82, '#b8c3d3'], [1, '#8795ab']]) + lg('awing', [[0, '#eef2f7'], [1, '#98a6bb']], 0, 0, 1, 1) +
      lg('atar', [[0, '#8e96a3'], [1, '#6d7683']]) + lg('aseat', [[0, '#3d62a0'], [1, '#233f72']]) + lg('acnt', [[0, '#2a4677'], [1, '#162a50']]) + lg('abag', [[0, '#e0674c'], [1, '#a93a26']], 0, 0, 1, 0) + lg('arefl', [[0, '#fff', 0.35], [1, '#fff', 0]]) + lg('aglass', [[0, '#fff', 0.18], [1, '#fff', 0.02]], 0, 0, 1, 1));
    L.back.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#aw)' }));
    // glass wall: live sky, distant skyline, tarmac, parked jet with shaded fuselage, jet-bridge
    const clip = el('clipPath', { id: 'apc' }, '<rect x="160" y="150" width="1600" height="560" rx="8"/>'); defs.appendChild(clip);
    const sky = FE.makeSky(S, 1600, 560, 400, { sunX: 1250, sunY: 120, clouds: 6, seed: 31 });
    const sg = el('g', { transform: 'translate(160,150)' }); sg.appendChild(sky.g);
    const view = el('g', { 'clip-path': 'url(#apc)' });
    view.appendChild(sg);
    view.appendChild(el('g', { opacity: 0.7 }, `<g transform="translate(0,0)">${FE.skyline(31, 566, 0, '#8fa5c6', '#fff', 26, 120, 40, 90, 0)}</g>`));
    let tar = `<rect x="160" y="556" width="1600" height="154" fill="url(#atar)"/><rect x="160" y="556" width="1600" height="6" fill="#fff" opacity=".18"/><path d="M160,640 H1760" stroke="#ece6a6" stroke-width="7" stroke-dasharray="64 44"/><path d="M160,690 H1760" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>`;
    const jet = `<g transform="translate(900,466)"><ellipse cx="40" cy="206" rx="480" ry="20" fill="#000" opacity=".22"/>
      <path d="M-80,-70 L-196,-222 L-120,-222 L50,-70Z" fill="url(#awing)" stroke="#a8b3c4" stroke-width="3"/>
      <path d="M-380,22 C-380,-40 -320,-72 -230,-72 L290,-72 C380,-72 452,-40 474,20 C452,72 380,92 290,92 L-230,92 C-320,92 -380,72 -380,22Z" fill="url(#afus)" stroke="#9aa7ba" stroke-width="3"/>
      <path d="M-370,48 C-300,82 -80,96 290,92 C380,92 452,72 474,20 C440,66 380,76 290,74 L-230,74 C-300,74 -350,64 -370,48Z" fill="#7b8aa3" opacity=".35"/>
      <path d="M-340,-60 L-382,-196 L-306,-196 L-246,-72Z" fill="#2c6fb0"/><path d="M-340,-60 L-370,-158 L-326,-158 L-290,-64Z" fill="#fff" opacity=".18"/>
      <path d="M-60,70 L-216,196 L-132,196 L90,70Z" fill="url(#awing)" stroke="#a8b3c4" stroke-width="3"/>
      <path d="M-60,70 L-216,196 L-190,196 L-34,70Z" fill="#fff" opacity=".3"/>
      <rect x="-4" y="76" width="130" height="58" rx="22" fill="#cfd7e3" stroke="#9aa7ba" stroke-width="3"/><ellipse cx="124" cy="105" rx="10" ry="26" fill="#7f8da3"/><ellipse cx="120" cy="105" rx="5" ry="16" fill="#3b4558"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${-222 + i * 40}" y="-30" width="18" height="24" rx="9" fill="#33445f"/><rect x="${-219 + i * 40}" y="-27" width="6" height="10" rx="3" fill="#fff" opacity=".4"/>`).join('')}
      <path d="M392,-22 C420,-34 446,-24 462,-2 C440,-6 416,-8 392,-6Z" fill="#33445f"/><path d="M-380,22 C-380,-40 -320,-72 -230,-72 L40,-72 C-120,-50 -260,-30 -380,22Z" fill="#fff" opacity=".35"/>
      <path d="M-200,34 L430,34" stroke="#2c6fb0" stroke-width="6" opacity=".9"/><rect x="-90" y="6" width="150" height="6" rx="3" fill="#2c6fb0" opacity=".9"/></g>`;
    view.appendChild(el('g', {}, tar + jet));
    view.appendChild(el('g', {}, `<rect x="160" y="150" width="1600" height="560" fill="url(#aglass)"/><path d="M160,700 L1000,150 L1160,150 L300,710Z" fill="#fff" opacity=".07"/><path d="M820,710 L1500,150 L1560,150 L900,710Z" fill="#fff" opacity=".05"/>`));
    L.back.appendChild(view);
    L.back.appendChild(el('g', {}, `<rect x="146" y="136" width="1628" height="588" rx="16" fill="none" stroke="#98a1ae" stroke-width="16"/><rect x="146" y="136" width="1628" height="5" fill="#fff" opacity=".5"/>${[560, 960, 1360].map((x) => `<rect x="${x - 7}" y="150" width="14" height="560" fill="#9ca6b5"/><rect x="${x - 7}" y="150" width="4" height="560" fill="#fff" opacity=".5"/>`).join('')}`));
    // departure board (abstract bars only) — sits between the title chip and the timer
    L.mid.appendChild(el('g', { transform: 'translate(770,26) scale(.7)' }, `<rect x="-6" y="-6" width="612" height="116" rx="14" fill="#06091a"/><rect width="600" height="104" rx="10" fill="#10172b"/>${[0, 1, 2].map((i) => `<g transform="translate(24,${16 + i * 28})"><rect width="70" height="14" rx="3" fill="#f2b84b"/><rect x="90" width="180" height="14" rx="3" fill="#cfd8f0" opacity=".85"/><rect x="290" width="140" height="14" rx="3" fill="#cfd8f0" opacity=".6"/><circle cx="520" cy="7" r="8" fill="${['#58c288', '#f2b84b', '#e8685b'][i]}"/></g>`).join('')}<rect width="600" height="30" rx="10" fill="#fff" opacity=".05"/>`));
    // terminal floor: polished stone with reflections and tile joints
    let fl = `<rect x="0" y="724" width="1920" height="356" fill="url(#af)"/>`;
    for (let i = 0; i < 6; i++) { const y = 740 + Math.pow(i / 6, 1.5) * 330; fl += `<line x1="0" y1="${n(y)}" x2="1920" y2="${n(y)}" stroke="#7b8391" stroke-opacity=".35" stroke-width="2"/>`; }
    for (let i = 0; i < 18; i++) fl += `<line x1="${i * 140 - 100}" y1="724" x2="${n((i * 140 - 100 - 960) * 2.2 + 960)}" y2="1080" stroke="#7b8391" stroke-opacity=".4" stroke-width="2"/>`;
    fl += `<rect x="0" y="724" width="1920" height="12" fill="#7d8594"/><rect x="0" y="724" width="1920" height="3" fill="#fff" opacity=".6"/><path d="M160,740 L1000,1080 L1500,1080 L1760,740Z" fill="url(#arefl)" opacity=".7"/>`;
    L.mid.appendChild(el('g', {}, fl));
    const seat = (x, y) => `<g transform="translate(${x},${y})"><ellipse cx="44" cy="62" rx="62" ry="7" fill="#000" opacity=".18"/><rect x="38" y="6" width="12" height="56" fill="#4f5766"/><rect x="0" y="-74" width="88" height="68" rx="14" fill="url(#aseat)"/><rect x="6" y="-70" width="76" height="10" rx="5" fill="#fff" opacity=".18"/><rect x="-8" y="-16" width="104" height="30" rx="12" fill="url(#aseat)"/><rect x="-4" y="-14" width="96" height="6" rx="3" fill="#fff" opacity=".2"/><rect x="-14" y="-30" width="10" height="38" rx="4" fill="#4f5766"/></g>`;
    L.mid.appendChild(el('g', {}, [1100, 1196, 1292, 1388, 1484].map((x) => seat(x, 850)).join('')));
    L.front.appendChild(el('g', {}, `<g transform="translate(130,780)"><ellipse cx="260" cy="262" rx="340" ry="22" fill="#000" opacity=".26"/><rect x="0" y="0" width="520" height="250" rx="16" fill="url(#acnt)"/><rect x="0" y="0" width="520" height="24" rx="12" fill="#eef1f6"/><rect x="0" y="0" width="520" height="4" rx="2" fill="#fff"/><rect x="0" y="24" width="520" height="8" fill="#000" opacity=".25"/><circle cx="84" cy="104" r="34" fill="#f2b84b"/><path d="M62,104 l16,16 l30,-34" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/><rect x="140" y="82" width="150" height="14" rx="3" fill="#f2b84b"/><rect x="140" y="110" width="100" height="10" rx="3" fill="#8aa0c8"/><rect x="20" y="180" width="480" height="4" fill="#fff" opacity=".08"/><g transform="translate(330,-104)"><rect x="40" y="86" width="70" height="10" rx="3" fill="#1b2230"/><rect width="150" height="100" rx="10" fill="#1e2530" stroke="#10151d" stroke-width="4"/><rect x="10" y="10" width="130" height="80" rx="4" fill="#cfe6ff"/><rect x="10" y="10" width="130" height="22" fill="#8fc4f0"/><path d="M10,90 L50,10 L72,10 L32,90Z" fill="#fff" opacity=".35"/></g></g>
      <g transform="translate(1530,930)"><ellipse cx="0" cy="6" rx="62" ry="9" fill="#000" opacity=".28"/><rect x="-46" y="-136" width="92" height="136" rx="16" fill="url(#abag)"/><rect x="-46" y="-136" width="14" height="136" rx="7" fill="#fff" opacity=".16"/><rect x="-28" y="-160" width="56" height="28" rx="9" fill="none" stroke="#4f5766" stroke-width="7"/><rect x="-46" y="-96" width="92" height="9" fill="#000" opacity=".2"/><rect x="-46" y="-50" width="92" height="9" fill="#000" opacity=".2"/><circle cx="-28" cy="4" r="7" fill="#20242d"/><circle cx="28" cy="4" r="7" fill="#20242d"/></g>`));
    S.anim.push((dt) => { });
    return { floorY: 975, charScale: 0.88, light: 'radial-gradient(ellipse at 30% 18%,rgba(255,255,255,.22),transparent 60%),linear-gradient(180deg,rgba(0,0,0,0),rgba(10,10,40,.2))',
      env(env, dt) { sky.update(env, dt); } };
  };
})();
