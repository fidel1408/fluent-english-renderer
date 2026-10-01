/* 30-scenes-a: rooftop (hook / mission), office, café */
(function () {
  'use strict';
  const FE = window.FE, { el } = FE, SC = FE.SCENES;
  const mix = (a, b, t) => {
    const p = (x) => [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)];
    const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  FE.mixColor = mix;

  /* skyline silhouettes with lit windows (seeded) */
  function skyline(seed, base, top, color, win, hMin, hMax, wMin, wMax, litAlpha) {
    const r = FE.rng(seed); let x = -40, s = '';
    while (x < 1960) {
      const w = wMin + r() * (wMax - wMin), hh = hMin + r() * (hMax - hMin), y = base - hh;
      s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${(hh + 4).toFixed(0)}" fill="${color}"/>`;
      if (r() > 0.6) s += `<rect x="${(x + w * 0.4).toFixed(0)}" y="${(y - 26).toFixed(0)}" width="${(w * 0.2).toFixed(0)}" height="28" fill="${color}"/>`;
      if (win) for (let wy = y + 14; wy < base - 8; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 18) if (r() > 0.55) s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="8" height="11" fill="${win}" opacity="${(litAlpha * (0.5 + r() * 0.5)).toFixed(2)}"/>`;
      x += w + r() * 6;
    }
    return s;
  }
  const cloudShape = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="0" rx="150" ry="46"/><ellipse cx="-70" cy="-30" rx="80" ry="52"/><ellipse cx="30" cy="-48" rx="96" ry="62"/><ellipse cx="110" cy="-12" rx="70" ry="40"/></g>`;

  /* shared sky: returns {svg, update(env,t)} */
  function makeSky(S, w, hgt, horizon, opts = {}) {
    const id = 'sky' + Math.floor(Math.random() * 1e6);
    const defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop id="${id}a" offset="0" stop-color="#4aa3e8"/><stop id="${id}b" offset=".7" stop-color="#bfe3ff"/><stop id="${id}c" offset="1" stop-color="#ffe9c9"/></linearGradient>
      <radialGradient id="${id}sun"><stop offset="0" stop-color="#fff6c9"/><stop offset=".35" stop-color="#ffe58a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd36a" stop-opacity="0"/></radialGradient>`);
    const nCl = opts.clouds || 7, r = FE.rng(opts.seed || 3);
    let clouds = '';
    for (let i = 0; i < nCl; i++) clouds += `<g class="cl" data-sp="${(6 + r() * 10).toFixed(1)}">` + cloudShape(r() * (w + 400) - 200, 80 + r() * (horizon - 260), 0.8 + r() * 0.9) + '</g>';
    const g = el('g', { class: 'sky' }, `<rect width="${w}" height="${hgt}" fill="url(#${id})"/><circle id="${id}s" cx="${opts.sunX || 1480}" cy="${opts.sunY || 330}" r="260" fill="url(#${id}sun)"/><g class="clouds" fill="#fff">${clouds}</g>`);
    const cls = FE.$$('.cl', g); const sun = g.querySelector('#' + id + 's'); const cg = g.querySelector('.clouds');
    const a = defs.querySelector('#' + id + 'a'), b = defs.querySelector('#' + id + 'b'), c = defs.querySelector('#' + id + 'c');
    const pos = cls.map((q) => 0);
    return {
      g,
      update(env, dt) {
        const k = env.wet;
        a.setAttribute('stop-color', mix('#3f9be6', '#3b4863', k)); b.setAttribute('stop-color', mix('#bfe3ff', '#7c8ba6', k)); c.setAttribute('stop-color', mix('#ffeed2', '#a9b3c4', k));
        sun.setAttribute('opacity', (1 - k * 1.25).toFixed(2));
        cg.setAttribute('fill', mix('#ffffff', '#6b778d', Math.min(1, k * 1.15)));
        cls.forEach((q, i) => {
          pos[i] += dt * parseFloat(q.dataset.sp) * (0.5 + k); if (pos[i] > w + 500) pos[i] -= w + 900;
          q.setAttribute('transform', `translate(${pos[i].toFixed(1)},0)`);
        });
      },
    };
  }
  const rainLayer = (w, hgt, n) => {
    const r = FE.rng(11); let s = '';
    for (let i = 0; i < n; i++) { const x = r() * w, y = r() * hgt; s += `<line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x - 14).toFixed(0)}" y2="${(y + 44).toFixed(0)}"/>`; }
    return el('g', { stroke: '#dbeaff', 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0 }, s);
  };

  /* ================= ROOFTOP ================= */
  SC.rooftop = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    const sky = makeSky(S, 1920, 1080, 640, { sunX: 1500, sunY: 360, clouds: 8, seed: 5 });
    L.back.appendChild(sky.g);
    L.back.appendChild(el('g', { opacity: 0.55 }, skyline(2, 700, 0, '#7d8fb0', '#fff3c6', 90, 300, 46, 96, 0.5)));
    L.back.appendChild(el('g', {}, skyline(9, 760, 0, '#4a5b80', '#ffe7a3', 70, 230, 50, 110, 0.9)));
    // parapet wall + glass railing
    defs.insertAdjacentHTML('beforeend', `<linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a5e"/><stop offset="1" stop-color="#8c5f3a"/></linearGradient><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d3c7"/><stop offset="1" stop-color="#a9a396"/></linearGradient>`);
    let mid = `<rect x="0" y="742" width="1920" height="70" fill="url(#wall)"/><rect x="0" y="736" width="1920" height="12" fill="#efe9dd"/>`;
    for (let x = 40; x < 1920; x += 160) mid += `<rect x="${x}" y="640" width="6" height="100" fill="#8e98a8"/>`;
    mid += `<rect x="0" y="640" width="1920" height="100" fill="#cfe6f6" opacity=".16"/><rect x="0" y="636" width="1920" height="7" fill="#aab3c2"/>`;
    // string lights
    let lights = '';
    [[0, 1920, 120, 90], [-40, 1000, 160, 70], [900, 1960, 150, 80]].forEach(([x0, x1, y, sag], k) => {
      const midx = (x0 + x1) / 2; lights += `<path d="M${x0},${y} Q${midx},${y + sag * 2} ${x1},${y}" stroke="#2a2430" stroke-width="3" fill="none"/>`;
      for (let i = 1; i < 14; i++) { const t = i / 14, x = x0 + (x1 - x0) * t, yy = (1 - t) * (1 - t) * y + 2 * t * (1 - t) * (y + sag * 2) + t * t * y; lights += `<circle cx="${x.toFixed(0)}" cy="${(yy + 12).toFixed(0)}" r="9" fill="#ffe08a"/><circle cx="${x.toFixed(0)}" cy="${(yy + 12).toFixed(0)}" r="22" fill="#ffd36a" opacity=".22"/>`; }
    });
    L.mid.appendChild(el('g', {}, mid));
    L.mid.appendChild(el('g', { class: 'lights' }, lights));
    // deck floor
    let deck = `<rect x="0" y="812" width="1920" height="270" fill="url(#deck)"/>`;
    for (let i = 0; i < 9; i++) { const y = 812 + Math.pow(i / 9, 1.4) * 268; deck += `<line x1="0" y1="${y.toFixed(0)}" x2="1920" y2="${y.toFixed(0)}" stroke="#6e4528" stroke-opacity=".35" stroke-width="2"/>`; }
    for (let i = -6; i < 28; i++) deck += `<line x1="${(i * 70 + 300).toFixed(0)}" y1="812" x2="${((i * 70 + 300 - 960) * 1.6 + 960).toFixed(0)}" y2="1082" stroke="#6e4528" stroke-opacity=".18" stroke-width="2"/>`;
    L.mid.appendChild(el('g', {}, deck));
    // banquet tables with white cloths + trays (set-up in progress)
    const table = (x, y, w) => `<g transform="translate(${x},${y})"><ellipse cx="${w / 2}" cy="${w * 0.04 + 86}" rx="${w / 2 + 10}" ry="14" fill="#000" opacity=".2"/><rect x="0" y="0" width="${w}" height="92" rx="6" fill="#fbf8f2"/><path d="M0,22 Q${w / 2},32 ${w},22" stroke="#e3dccd" stroke-width="3" fill="none"/><rect x="0" y="0" width="${w}" height="16" fill="#fff"/><rect x="0" y="16" width="${w}" height="76" fill="#ede6d6" opacity=".5"/></g>`;
    L.mid.appendChild(el('g', {}, table(120, 770, 420) + table(1430, 770, 380) +
      `<g transform="translate(170,742)"><rect width="130" height="30" rx="6" fill="#e8e1d2" stroke="#c7bda5" stroke-width="2"/><path d="M8 0 Q65 -46 122 0Z" fill="#cfd6dd" stroke="#9aa5b2" stroke-width="2"/></g>
       <g transform="translate(340,748)"><circle cx="40" cy="12" r="38" fill="#fff" stroke="#cfc6b3" stroke-width="3"/><circle cx="40" cy="12" r="24" fill="#d7ac52" opacity=".85"/></g>
       <g transform="translate(1480,744)"><rect width="150" height="26" rx="6" fill="#e8e1d2" stroke="#c7bda5" stroke-width="2"/><circle cx="30" cy="-6" r="14" fill="#c2503b"/><circle cx="62" cy="-6" r="14" fill="#e58a2c"/><circle cx="94" cy="-6" r="14" fill="#6aa84f"/></g>`));
    // plants
    const plant = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="6" rx="46" ry="9" fill="#000" opacity=".2"/><path d="M-34,-70 L34,-70 L26,0 L-26,0Z" fill="#c9764f"/><rect x="-38" y="-80" width="76" height="14" rx="5" fill="#d98760"/><g fill="#2e7d4f"><path d="M0,-80 C-40,-120 -60,-170 -52,-220 C-20,-190 -4,-140 0,-80Z"/><path d="M0,-80 C40,-130 64,-180 52,-232 C16,-196 2,-140 0,-80Z" fill="#3d9a62"/><path d="M0,-80 C-6,-140 6,-200 0,-250 C16,-200 14,-140 0,-80Z" fill="#256b42"/></g></g>`;
    L.mid.appendChild(el('g', {}, plant(60, 800, 1.1) + plant(1860, 806, 1.2)));
    // foreground planter + stacked chairs
    L.front.appendChild(el('g', {}, `<g transform="translate(1660,1030)"><rect x="-60" y="-70" width="120" height="70" rx="8" fill="#7a5b44"/><g fill="#3d9a62"><ellipse cx="-30" cy="-100" rx="46" ry="46"/><ellipse cx="22" cy="-112" rx="48" ry="52" fill="#2e7d4f"/><ellipse cx="0" cy="-86" rx="56" ry="34" fill="#4aa86f"/></g></g>`));
    // weather: rain + optional tent / heaters (mission choices)
    const rain = rainLayer(1920, 1080, 90); L.fg.appendChild(rain);
    let tent = null;
    if (o.tent) {
      tent = el('g', {}, `<path d="M0,0 L1920,0 L1920,150 Q1440,210 960,150 Q480,210 0,150Z" fill="#f4efe4" opacity=".96"/><path d="M0,150 Q480,210 960,150 Q1440,210 1920,150" stroke="#cdbf9f" stroke-width="5" fill="none"/>` + [160, 560, 960, 1360, 1760].map((x) => `<path d="M${x},0 L${x},150" stroke="#cdbf9f" stroke-width="3" opacity=".6"/>`).join(''));
      L.fg.appendChild(tent);
    }
    if (o.heaters) {
      [420, 1500].forEach((x) => L.mid.appendChild(el('g', { transform: `translate(${x},800)` }, `<rect x="-8" y="-210" width="16" height="214" fill="#9aa3ae"/><path d="M-26,-250 L26,-250 L18,-214 L-18,-214Z" fill="#c9533a"/><ellipse cx="0" cy="-200" rx="40" ry="14" fill="#ffb347" opacity=".35"/>`)));
    }
    const dry = rain.querySelectorAll('line');
    let off = 0;
    S.anim.push((dt) => { off = (off + dt * 900) % 44; rain.setAttribute('transform', `translate(${(-off * 0.3).toFixed(1)},${off.toFixed(1)})`); });
    return {
      floorY: 960, charScale: 0.9,
      light: 'radial-gradient(ellipse at 76% 22%,rgba(255,226,160,.20),transparent 55%),linear-gradient(180deg,rgba(20,30,70,.08),rgba(20,20,40,.0) 40%,rgba(10,10,30,.22))',
      env(env, dt, t) { sky.update(env, dt); rain.setAttribute('opacity', env.rain.toFixed(2)); },
    };
  };

  /* ================= OFFICE ================= */
  SC.office = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', `<linearGradient id="ow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e2d6"/><stop offset="1" stop-color="#d4ccbd"/></linearGradient><linearGradient id="of" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c7482"/><stop offset="1" stop-color="#4c5361"/></linearGradient><linearGradient id="dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b78457"/><stop offset="1" stop-color="#8d6139"/></linearGradient>`);
    L.back.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#ow)' }));
    // big window with live sky + skyline
    const sky = makeSky(S, 1000, 520, 360, { sunX: 700, sunY: 190, clouds: 5, seed: 8 });
    const win = el('g', { transform: 'translate(210,150)' });
    const clip = el('clipPath', { id: 'owc' }, '<rect x="0" y="0" width="1000" height="520" rx="8"/>'); defs.appendChild(clip);
    const inner = el('g', { 'clip-path': 'url(#owc)' }); inner.appendChild(sky.g);
    inner.appendChild(el('g', { opacity: 0.7 }, `<g transform="translate(0,160)">${skyline(4, 360, 0, '#6f81a6', '#fff0b8', 60, 220, 50, 90, 0.6)}</g>`));
    win.appendChild(inner);
    win.appendChild(el('g', {}, `<rect x="-14" y="-14" width="1028" height="548" rx="14" fill="none" stroke="#f4f0e8" stroke-width="22"/><rect x="496" y="0" width="8" height="520" fill="#f4f0e8"/><rect x="0" y="256" width="1000" height="8" fill="#f4f0e8"/><path d="M0,520 L1000,0" stroke="#fff" stroke-opacity=".08" stroke-width="90"/>`));
    L.back.appendChild(win);
    const rain = rainLayer(1000, 520, 50); inner.appendChild(rain);
    // whiteboard with abstract scribbles (no readable text) + shelf
    L.mid.appendChild(el('g', {}, `<g transform="translate(1330,190)"><rect width="440" height="290" rx="10" fill="#fdfdfb" stroke="#9aa3ad" stroke-width="8"/><path d="M40 70 Q120 30 200 70 T360 60" stroke="#2c6fb0" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="90" cy="170" r="34" fill="none" stroke="#d1583e" stroke-width="6"/><path d="M130 170 L250 170 M250 170 L230 155 M250 170 L230 185" stroke="#d1583e" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="290" y="130" width="100" height="80" rx="10" fill="none" stroke="#14876b" stroke-width="6"/><path d="M40 250 L400 250" stroke="#9aa3ad" stroke-width="4" stroke-dasharray="10 12"/></g>
      <g transform="translate(60,360)"><rect width="110" height="420" rx="6" fill="#8d6139"/>${[0, 1, 2, 3].map((i) => `<rect x="8" y="${14 + i * 100}" width="94" height="8" fill="#6e4a2b"/>${[0, 1, 2, 3, 4].map((k) => `<rect x="${12 + k * 18}" y="${-26 + 14 + i * 100 + 8}" width="14" height="${50 + (k * 7) % 22}" fill="${['#c2503b', '#2c6fb0', '#e0a93d', '#3f8f6b', '#7a5fa0'][(k + i) % 5]}" transform="translate(0,${-(50 + (k * 7) % 22) + 28})"/>`).join('')}`).join('')}</g>`));
    // floor + desk (foreground, hides legs)
    L.mid.appendChild(el('rect', { x: 0, y: 840, width: 1920, height: 240, fill: 'url(#of)' }));
    L.mid.appendChild(el('rect', { x: 0, y: 834, width: 1920, height: 10, fill: '#e6dfd0' }));
    L.front.appendChild(el('g', {}, `<g transform="translate(300,810)"><ellipse cx="640" cy="236" rx="760" ry="20" fill="#000" opacity=".2"/><rect x="0" y="0" width="1280" height="34" rx="10" fill="url(#dk)"/><rect x="40" y="34" width="1200" height="230" fill="#7a5230"/><rect x="40" y="34" width="1200" height="14" fill="#000" opacity=".15"/>
      <g transform="translate(160,-190)"><rect x="-10" y="150" width="20" height="44" fill="#39414e"/><rect x="-60" y="186" width="120" height="10" rx="4" fill="#39414e"/><rect x="-170" y="-10" width="340" height="170" rx="12" fill="#1e2530" stroke="#10151d" stroke-width="5"/><rect x="-158" y="2" width="316" height="146" rx="4" fill="#dff1ff"/><rect x="-146" y="14" width="140" height="64" rx="4" fill="#8fc4f0"/><rect x="-146" y="88" width="90" height="50" rx="4" fill="#f3c26b"/><path d="M0 24h140M0 46h110M0 68h130M0 96h90M0 118h120" stroke="#9db4c9" stroke-width="6" stroke-linecap="round"/></g>
      <g transform="translate(980,-14)"><rect x="-80" y="0" width="160" height="12" rx="4" fill="#cfd6df"/><path d="M-70,0 L-54,-110 L54,-110 L70,0Z" fill="#aeb8c6"/><rect x="-46" y="-102" width="92" height="84" rx="4" fill="#cfe6ff"/></g>
      <g transform="translate(1120,-30)"><rect width="46" height="46" rx="6" fill="#f6efe2" stroke="#b8a98f" stroke-width="3"/><path d="M46 12c14 0 14 22 0 22" fill="none" stroke="#b8a98f" stroke-width="4"/></g></g>`));
    L.fg.appendChild(rain.cloneNode(false) && el('g'));
    S.anim.push((dt) => { /* rain falls past the window */ const t = (S.t * 700) % 44; rain.setAttribute('transform', `translate(${(-t * 0.3).toFixed(1)},${t.toFixed(1)})`); });
    return { floorY: 930, charScale: 0.9, light: 'radial-gradient(ellipse at 34% 28%,rgba(255,236,190,.20),transparent 60%),linear-gradient(180deg,rgba(0,0,0,0),rgba(10,10,30,.16))',
      env(env, dt) { sky.update(env, dt); rain.setAttribute('opacity', env.rain.toFixed(2)); } };
  };

  /* ================= CAFÉ ================= */
  SC.cafe = (S, o) => {
    const L = S.layers, defs = S.dom.scene.querySelector('defs');
    defs.insertAdjacentHTML('beforeend', `<linearGradient id="cw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6f6a"/><stop offset="1" stop-color="#245a56"/></linearGradient><linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8a47a"/><stop offset="1" stop-color="#9c7650"/></linearGradient><radialGradient id="pl"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>`);
    L.back.appendChild(el('rect', { width: 1920, height: 1080, fill: 'url(#cw)' }));
    // brick pattern band
    let brick = ''; for (let y = 0; y < 8; y++) for (let x = -1; x < 12; x++) brick += `<rect x="${x * 170 + (y % 2) * 85}" y="${560 + y * 34}" width="160" height="28" rx="3" fill="#b4573f" opacity="${0.55 + ((x * 7 + y * 3) % 5) * 0.06}"/>`;
    L.back.appendChild(el('g', {}, `<rect x="0" y="540" width="1920" height="300" fill="#8e3f2d"/>${brick}`));
    // street window with sky
    const sky = makeSky(S, 760, 400, 260, { sunX: 560, sunY: 130, clouds: 4, seed: 12 });
    const wg = el('g', { transform: 'translate(1040,130)' });
    const clip = el('clipPath', { id: 'cwc' }, '<rect width="760" height="400" rx="10"/>'); defs.appendChild(clip);
    const inner = el('g', { 'clip-path': 'url(#cwc)' }); inner.appendChild(sky.g);
    inner.appendChild(el('g', { opacity: 0.8 }, `<g transform="translate(0,120)">${skyline(6, 280, 0, '#6c7da3', '#fff0b8', 50, 180, 60, 100, 0.5)}</g>`));
    wg.appendChild(inner); wg.appendChild(el('g', {}, `<rect x="-10" y="-10" width="780" height="420" rx="16" fill="none" stroke="#1d2a33" stroke-width="20"/><rect x="376" y="0" width="8" height="400" fill="#1d2a33"/>`));
    L.back.appendChild(wg);
    const rain = rainLayer(760, 400, 40); inner.appendChild(rain);
    // chalkboard (abstract doodles only) + pendant lamps
    L.mid.appendChild(el('g', {}, `<g transform="translate(150,170)"><rect width="460" height="300" rx="10" fill="#222c2f" stroke="#8d6139" stroke-width="14"/><path d="M50 80 Q110 40 170 80 T290 70" stroke="#e8efe9" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="90" cy="180" r="30" fill="none" stroke="#f1c75a" stroke-width="5"/><path d="M150 180h200M150 215h160M50 250h300" stroke="#e8efe9" stroke-width="4" stroke-dasharray="14 10" opacity=".6"/></g>
      ${[420, 960, 1500].map((x) => `<g transform="translate(${x},0)"><path d="M0 0V160" stroke="#14201f" stroke-width="3"/><path d="M-42 214 Q0 150 42 214Z" fill="#e0a93d"/><circle cx="0" cy="224" r="70" fill="url(#pl)"/></g>`).join('')}`));
    // floor + counter with espresso machine + pastry case
    L.mid.appendChild(el('rect', { x: 0, y: 840, width: 1920, height: 240, fill: 'url(#cf)' }));
    let plank = ''; for (let i = 0; i < 10; i++) plank += `<line x1="0" y1="${840 + i * 26}" x2="1920" y2="${840 + i * 26}" stroke="#7a5836" stroke-opacity=".25" stroke-width="2"/>`;
    L.mid.appendChild(el('g', {}, plank));
    L.mid.appendChild(el('g', {}, `<g transform="translate(60,520)"><rect width="520" height="330" rx="10" fill="#3a2a22"/><rect x="0" y="0" width="520" height="18" fill="#e6dccb"/><g transform="translate(40,-120)"><rect width="190" height="120" rx="12" fill="#b9c0c8" stroke="#8a929c" stroke-width="4"/><rect x="20" y="20" width="60" height="40" rx="6" fill="#2b3340"/><circle cx="130" cy="42" r="20" fill="#d7dde3" stroke="#8a929c" stroke-width="3"/><rect x="40" y="86" width="26" height="34" fill="#8a929c"/><rect x="120" y="86" width="26" height="34" fill="#8a929c"/></g><g transform="translate(300,-100)"><rect width="190" height="100" rx="10" fill="#cfe8ee" opacity=".7" stroke="#8aa8b2" stroke-width="4"/><ellipse cx="50" cy="64" rx="34" ry="18" fill="#d9a05a"/><ellipse cx="120" cy="66" rx="36" ry="18" fill="#c27b45"/><ellipse cx="86" cy="42" rx="28" ry="15" fill="#e8c27a"/></g></g>`));
    L.front.appendChild(el('g', {}, `<g transform="translate(1180,830)"><ellipse cx="190" cy="196" rx="270" ry="18" fill="#000" opacity=".22"/><rect x="0" y="0" width="380" height="18" rx="9" fill="#d9d2c2" stroke="#a89f8c" stroke-width="3"/><rect x="170" y="18" width="40" height="170" fill="#4a4036"/><rect x="100" y="180" width="180" height="14" rx="7" fill="#4a4036"/><g transform="translate(70,-30)"><path d="M0 0h54l-6 30h-42z" fill="#fbf6ee" stroke="#a89a82" stroke-width="2.5"/><path d="M54 6c12 0 12 20 0 20" fill="none" stroke="#a89a82" stroke-width="3"/></g><g transform="translate(250,-34)"><ellipse cx="30" cy="30" rx="32" ry="8" fill="#e9dfc9"/><ellipse cx="30" cy="22" rx="28" ry="18" fill="#d9a05a"/></g></g>`));
    S.anim.push(() => { const t = (S.t * 600) % 44; rain.setAttribute('transform', `translate(${(-t * 0.3).toFixed(1)},${t.toFixed(1)})`); });
    return { floorY: 940, charScale: 0.9, light: 'radial-gradient(ellipse at 70% 24%,rgba(255,226,170,.18),transparent 60%),radial-gradient(ellipse at 50% 20%,rgba(255,190,100,.14),transparent 60%),linear-gradient(180deg,rgba(0,0,0,0),rgba(30,10,10,.2))',
      env(env, dt) { sky.update(env, dt); rain.setAttribute('opacity', env.rain.toFixed(2)); } };
  };
})();
