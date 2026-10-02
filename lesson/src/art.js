/* ART — original SVG illustrations: characters with jointed arms, rooms, objects, fact icons. */
(function (FE) {
  'use strict';
  const C = FE.C = {
    plum: '#3a1747', plum2: '#5b2a6e', plum3: '#8a5a9e', turq: '#1db8b0', turq2: '#8be3dc',
    ivory: '#fbf3e4', ivory2: '#f1e2c6', coral: '#ff6b5e', gold: '#e9b949', ink: '#2a1235',
    blue: '#2f6fd6', green: '#3aa66a', yellow: '#f2c230', red: '#d9423a', wood: '#c58f5a', woodD: '#9c6a3e'
  };

  function shade(hex, p) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = p < 0 ? 0 : 255, t = Math.abs(p);
    r = Math.round((f - r) * t + r); g = Math.round((f - g) * t + g); b = Math.round((f - b) * t + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  FE.shade = shade;

  /* Shared defs (gradients/filters) injected once into the document. */
  FE.defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
    <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8ea"/><stop offset="1" stop-color="#f1e2c6"/></linearGradient>
    <linearGradient id="gWallPlum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3a80"/><stop offset="1" stop-color="#4a2260"/></linearGradient>
    <linearGradient id="gWallTurq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdf3ee"/><stop offset="1" stop-color="#a6e4dd"/></linearGradient>
    <linearGradient id="gWallWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9d6"/><stop offset="1" stop-color="#f8cfb4"/></linearGradient>
    <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7a06a"/><stop offset="1" stop-color="#a8723f"/></linearGradient>
    <linearGradient id="gFloorGrey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdbfd6"/><stop offset="1" stop-color="#a995b8"/></linearGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd8e8"/><stop offset="1" stop-color="#e8fbf6"/></linearGradient>
    <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a873"/><stop offset="1" stop-color="#b57d49"/></linearGradient>
    <linearGradient id="gScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c2a4a"/><stop offset="1" stop-color="#3b2a5e"/></linearGradient>
    <radialGradient id="gLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe7a1" stop-opacity=".85"/><stop offset="1" stop-color="#ffe7a1" stop-opacity="0"/></radialGradient>
    <radialGradient id="gSpot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></linearGradient>
    <filter id="fBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="fBlurS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs></svg>`;

  const shadow = (x, y, rx, ry = rx * 0.16, op = 0.28) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2a1235" opacity="${op}" filter="url(#fBlur)"/>`;

  /* ---------- People ---------- */
  function hand(s, skin) {
    const sd = shade(skin, -0.22), dirT = -s; // thumb points toward the body
    let f = '';
    const lens = [15, 17, 15.5, 12];
    for (let i = 0; i < 4; i++) {
      const x = dirT * (5.3 - i * 3.55), rot = -dirT * (8 - i * 5.4);
      f += `<g transform="translate(${x.toFixed(2)},16) rotate(${rot.toFixed(1)})"><path d="M0,0 L0,${lens[i]}" stroke="${sd}" stroke-width="5.6" stroke-linecap="round"/><path d="M0,0 L0,${lens[i]}" stroke="${skin}" stroke-width="4.3" stroke-linecap="round"/></g>`;
    }
    const thumb = `<g transform="translate(${dirT * 6.2},5) rotate(${-dirT * 32})"><path d="M0,0 L0,12" stroke="${sd}" stroke-width="6" stroke-linecap="round"/><path d="M0,0 L0,12" stroke="${skin}" stroke-width="4.7" stroke-linecap="round"/></g>`;
    return `<g class="hand">${thumb}<path d="M-7.5,-1 C-9.5,6 -8.5,14 -6.5,18 L6.5,18 C8.5,14 9.5,6 7.5,-1 Z" fill="${skin}" stroke="${sd}" stroke-width="1"/>${f}</g>`;
  }

  /* One arm = shoulder -> elbow -> wrist joints as nested rotating groups. */
  function arm(x, y, s, sleeve, skin) {
    return `<g transform="translate(${x},${y})" class="arm" data-s="${s}">
      <g class="j sh"><path d="M0,0 L0,53" stroke="${sleeve}" stroke-width="17" stroke-linecap="round"/>
        <circle r="9.5" fill="${sleeve}"/>
        <g transform="translate(0,53)"><g class="j el">
          <path d="M0,0 L0,46" stroke="${skin}" stroke-width="12.5" stroke-linecap="round"/>
          <path d="M0,0 L0,17" stroke="${sleeve}" stroke-width="15" stroke-linecap="round"/>
          <circle r="7.6" fill="${sleeve}"/>
          <g transform="translate(0,46)"><g class="j wr">${hand(s, skin)}</g></g>
        </g></g></g></g>`;
  }

  const POSES = {
    rest: { A: 5, B: -7, W: 0 },
    present: { A: 22, B: 58, W: -6 },
    point: { A: 34, B: 108, W: 0 },
    think: { A: 14, B: -166, W: 4 },
    open: { A: 20, B: 40, W: 0 }
  };
  FE.POSES = POSES;
  FE.setPose = function (root, side, name) {
    const P = POSES[name] || POSES.rest;
    root.querySelectorAll('.arm').forEach((a) => {
      const s = +a.dataset.s;
      if (side && side !== s) return;
      const q = (c) => a.querySelector(c);
      q('.sh').style.transform = `rotate(${-s * P.A}deg)`;
      q('.el').style.transform = `rotate(${-s * P.B}deg)`;
      q('.wr').style.transform = `rotate(${-s * P.W}deg)`;
    });
  };

  const HAIR = {
    short: (c) => `<path d="M-19,-284 C-22,-307 -9,-311 0,-311 C10,-311 22,-307 19,-284 C17,-294 11,-298 0,-298 C-11,-298 -17,-294 -19,-284Z" fill="${c}"/>`,
    side: (c) => `<path d="M-19,-283 C-23,-306 -8,-312 2,-311 C14,-310 23,-304 19,-283 C16,-292 9,-299 -3,-299 C-12,-298 -17,-293 -19,-283Z" fill="${c}"/><path d="M-3,-299 C4,-302 12,-300 19,-290" stroke="${shade(c, 0.18)}" stroke-width="1.5" fill="none"/>`,
    long: (c) => `<path d="M-19,-286 C-22,-309 -8,-312 0,-312 C9,-312 22,-309 19,-286 C13,-296 3,-299 -4,-299 C-11,-298 -17,-294 -19,-286Z" fill="${c}"/>`,
    bun: (c) => `<circle cx="0" cy="-316" r="9" fill="${c}"/><path d="M-19,-284 C-22,-307 -9,-311 0,-311 C10,-311 22,-307 19,-284 C17,-295 10,-299 0,-299 C-10,-299 -17,-295 -19,-284Z" fill="${c}"/>`,
    curly: (c) => `<g fill="${c}"><circle cx="-14" cy="-298" r="8"/><circle cx="-6" cy="-306" r="8.5"/><circle cx="6" cy="-306" r="8.5"/><circle cx="14" cy="-298" r="8"/><circle cx="0" cy="-300" r="9"/><circle cx="-19" cy="-288" r="6"/><circle cx="19" cy="-288" r="6"/></g>`,
    bob: (c) => `<path d="M-19,-286 C-22,-309 -8,-312 0,-312 C9,-312 22,-309 19,-286 C13,-296 3,-299 -4,-299 C-11,-298 -17,-294 -19,-286Z" fill="${c}"/>`
  };
  const HAIR_BACK = {
    long: (c) => `<path d="M-23,-284 C-27,-314 27,-314 23,-284 L26,-236 C14,-229 -14,-229 -26,-236Z" fill="${c}"/>`,
    bob: (c) => `<path d="M-23,-284 C-27,-314 27,-314 23,-284 L23,-262 C12,-256 -12,-256 -23,-262Z" fill="${c}"/>`
  };

  /* person(): returns an SVG <g>. Feet at (0,0), ~311 units tall. */
  FE.person = function (o) {
    const m = o.g === 'm';
    const skin = o.skin || '#dfab80', skinD = shade(skin, -0.16);
    const hair = o.hair || '#2d1b14', shirt = o.shirt || C.turq, pants = o.pants || '#3b3050', shoes = o.shoes || '#2a1f2f';
    const style = o.style || (m ? 'short' : 'long');
    const expr = o.expr || 'smile';
    const sx = m ? 41 : 36, sy = m ? -240 : -238;
    const face = m
      ? 'M-18,-283 C-18,-299 -9,-303 0,-303 C9,-303 18,-299 18,-283 C18,-270 12,-259 0,-258 C-12,-259 -18,-270 -18,-283Z'
      : 'M-17,-283 C-17,-299 -9,-303 0,-303 C9,-303 17,-299 17,-283 C17,-270 10,-260 0,-259 C-10,-260 -17,-270 -17,-283Z';
    const mouth = {
      smile: `<path d="M-6,-271 Q0,-265.5 6,-271" stroke="#8a3b3b" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      calm: `<path d="M-5,-269.5 Q0,-268 5,-269.5" stroke="#8a3b3b" stroke-width="2" fill="none" stroke-linecap="round"/>`,
      happy: `<path d="M-7,-272 Q0,-262 7,-272 Z" fill="#fff" stroke="#8a3b3b" stroke-width="1.6" stroke-linejoin="round"/>`
    }[expr] || '';
    const torso = m
      ? 'M-41,-243 C-30,-250 -10,-253 0,-253 C10,-253 30,-250 41,-243 C45,-215 39,-182 36,-146 L-36,-146 C-39,-182 -45,-215 -41,-243Z'
      : 'M-36,-241 C-26,-248 -9,-251 0,-251 C9,-251 26,-248 36,-241 C38,-214 31,-188 30,-176 C33,-166 36,-154 37,-144 L-37,-144 C-36,-154 -33,-166 -30,-176 C-31,-188 -38,-214 -36,-241Z';
    const neckline = m
      ? `<path d="M-10,-253 L0,-235 L10,-253Z" fill="${skinD}"/><path d="M-12,-253 L0,-233 L-3,-253Z M12,-253 L0,-233 L3,-253Z" fill="${shade(shirt, 0.22)}"/>`
      : `<path d="M-13,-251 C-8,-238 8,-238 13,-251Z" fill="${skinD}"/>`;
    const legs = m
      ? `<path d="M-33,-148 C-34,-100 -29,-50 -26,-9 L-5,-9 C-4,-50 -3,-100 -2,-148Z" fill="${pants}"/><path d="M33,-148 C34,-100 29,-50 26,-9 L5,-9 C4,-50 3,-100 2,-148Z" fill="${pants}"/>`
      : `<path d="M-33,-146 C-33,-100 -28,-50 -25,-9 L-5,-9 C-4,-50 -3,-100 -2,-146Z" fill="${pants}"/><path d="M33,-146 C33,-100 28,-50 25,-9 L5,-9 C4,-50 3,-100 2,-146Z" fill="${pants}"/>`;
    const beard = o.beard ? `<path d="M-18,-282 C-18,-262 -9,-257 0,-257 C9,-257 18,-262 18,-282 C14,-270 8,-267 0,-267 C-8,-267 -14,-270 -18,-282Z" fill="${hair}" opacity="${o.beard === 'full' ? 0.95 : 0.4}"/>` : '';
    const glasses = o.glasses ? `<g fill="none" stroke="#3a2a40" stroke-width="1.7"><circle cx="-7.5" cy="-283" r="5.6"/><circle cx="7.5" cy="-283" r="5.6"/><path d="M-2,-283 L2,-283"/></g>` : '';
    const sleeveL = o.sleeve || shirt;
    return `<g class="person ${o.cls || ''}" data-name="${o.name || ''}">
      ${shadow(0, 2, 56, 7, 0.3)}
      ${HAIR_BACK[style] ? HAIR_BACK[style](hair) : ''}
      ${legs}
      <ellipse cx="-15" cy="-5" rx="14" ry="6.5" fill="${shoes}"/><ellipse cx="15" cy="-5" rx="14" ry="6.5" fill="${shoes}"/>
      <g class="breathe">
        <path d="M-8,-264 L-8,-247 C-3,-243 3,-243 8,-247 L8,-264Z" fill="${skinD}"/>
        <path d="${torso}" fill="${shirt}"/>
        <path d="${torso}" fill="url(#gSpot)" opacity=".35"/>
        ${neckline}
        ${o.belt === false ? '' : `<rect x="-36" y="-150" width="72" height="6" rx="3" fill="${shade(pants, -0.25)}" opacity=".8"/>`}
        ${arm(-sx, sy, -1, sleeveL, skin)}${arm(sx, sy, 1, sleeveL, skin)}
        <g class="head">
          <ellipse cx="-18.5" cy="-282" rx="3.2" ry="5" fill="${skinD}"/><ellipse cx="18.5" cy="-282" rx="3.2" ry="5" fill="${skinD}"/>
          <path d="${face}" fill="${skin}"/>
          ${beard}
          <g class="blink"><ellipse cx="-7" cy="-283.5" rx="2.2" ry="2.7" fill="#2a1a22"/><ellipse cx="7" cy="-283.5" rx="2.2" ry="2.7" fill="#2a1a22"/></g>
          <path d="M-11,-290 Q-7,-292.5 -3,-290.5 M3,-290.5 Q7,-292.5 11,-290" stroke="${shade(hair, 0.05)}" stroke-width="${m ? 2.2 : 1.6}" fill="none" stroke-linecap="round"/>
          <path d="M0,-282 Q-2.5,-275 1.2,-274.5" stroke="${skinD}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          ${mouth}${glasses}
          ${HAIR[style](hair)}
        </g>
      </g>
    </g>`;
  };

  /* Standard cast (labels in the picture say who they are; we never infer from looks). */
  const CAST = {
    alex: { name: 'Alex', g: 'm', skin: '#c99068', hair: '#2a1a16', shirt: '#2b8f9b', pants: '#33304d', beard: 'stubble', style: 'short' },
    maya: { name: 'Maya', g: 'f', skin: '#e7b58e', hair: '#5a2a1a', shirt: '#d9573f', pants: '#3b3050', style: 'long' },
    leo: { name: 'Leo', g: 'm', skin: '#e2b088', hair: '#6a4a2a', shirt: '#5b2a6e', pants: '#2d2c40', style: 'side' },
    rosa: { name: 'Rosa', g: 'f', skin: '#c58b64', hair: '#241418', shirt: '#e9b949', pants: '#3a3550', style: 'bun' },
    ben: { name: 'Ben', g: 'm', skin: '#f0c7a0', hair: '#8a5a2a', shirt: '#4a7fd6', pants: '#3a3a4c', style: 'short', beard: 'full' },
    lina: { name: 'Lina', g: 'f', skin: '#a8714a', hair: '#1c1218', shirt: '#1db8b0', pants: '#44304f', style: 'curly' },
    pablo: { name: 'Pablo', g: 'm', skin: '#d6a074', hair: '#1c1218', shirt: '#c9573a', pants: '#2f3550', style: 'side', glasses: true },
    rita: { name: 'Rita', g: 'f', skin: '#eab995', hair: '#3a2018', shirt: '#7a4a9a', pants: '#3a3550', style: 'bob' },
    dana: { name: 'Dana', g: 'f', skin: '#d9a47c', hair: '#2a1a16', shirt: '#2b8f9b', style: 'long' },
    omar: { name: 'Omar', g: 'm', skin: '#b98258', hair: '#1c1218', shirt: '#e9b949', style: 'short', beard: 'full' },
    mei: { name: 'Mei', g: 'f', skin: '#efc9a2', hair: '#150d12', shirt: '#d9573f', style: 'bob' }
  };
  FE.cast = (id, extra) => FE.person(Object.assign({}, CAST[id], { cls: 'c-' + id }, extra || {}));
  const at = (x, y, s, inner) => `<g transform="translate(${x},${y}) scale(${s})">${inner}</g>`;
  FE.at = at;

  /* ---------- Props ---------- */
  const P = {
    book(x, y, w, h, col, rot = 0) {
      return `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="0" y="0" width="${w}" height="${h}" rx="3" fill="${shade(col, -0.25)}"/>
        <rect x="0" y="0" width="${w}" height="${h - 4}" rx="3" fill="${col}"/>
        <rect x="${w * 0.12}" y="${h * 0.22}" width="${w * 0.5}" height="${Math.max(3, h * 0.14)}" rx="1.5" fill="${C.ivory}" opacity=".85"/>
        <rect x="2" y="${h - 5}" width="${w - 4}" height="3.5" rx="1" fill="#fff7e6"/></g>`;
    },
    phone(x, y, w = 40, h = 24) {
      return `<g transform="translate(${x},${y})"><rect width="${w}" height="${h}" rx="5" fill="#241a33"/>
        <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="3.5" fill="url(#gScreen)"/>
        <path d="M${w * 0.1},${h - 3} L${w * 0.5},3 L${w * 0.62},3 L${w * 0.22},${h - 3}Z" fill="#fff" opacity=".12"/>
        <circle cx="${w - 5}" cy="${h / 2}" r="1.4" fill="#0e0a14"/></g>`;
    },
    bag(x, y, col, s = 1) {
      return `<g transform="translate(${x},${y}) scale(${s})">${shadow(45, 100, 52, 7, 0.3)}
        <path d="M18,22 C18,-10 72,-10 72,22" fill="none" stroke="${shade(col, -0.3)}" stroke-width="7" stroke-linecap="round"/>
        <path d="M6,34 C6,18 20,14 45,14 C70,14 84,18 84,34 L88,98 C88,104 82,108 76,108 L14,108 C8,108 2,104 2,98Z" fill="${col}"/>
        <path d="M6,34 C6,18 20,14 45,14 C70,14 84,18 84,34 L84,48 C60,56 30,56 6,48Z" fill="${shade(col, -0.16)}"/>
        <path d="M12,40 C30,47 60,47 78,40" stroke="${C.gold}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="22" y="66" width="46" height="28" rx="7" fill="${shade(col, -0.2)}"/>
        <path d="M22,66 L68,66" stroke="${shade(col, 0.25)}" stroke-width="2"/>
        <path d="M14,24 C10,50 10,80 14,100" stroke="#fff" stroke-opacity=".22" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
    },
    chair(x, y, col = C.wood, s = 1, facing = 1) {
      const d = shade(col, -0.25);
      return `<g transform="translate(${x},${y}) scale(${s * facing},${s})">${shadow(40, 148, 58, 8, 0.28)}
        <rect x="6" y="0" width="68" height="14" rx="4" fill="${shade(col, 0.1)}" opacity="0"/>
        <rect x="8" y="-92" width="8" height="150" rx="3" fill="${d}"/><rect x="64" y="-92" width="8" height="150" rx="3" fill="${d}"/>
        <rect x="10" y="-92" width="60" height="12" rx="5" fill="${col}"/><rect x="10" y="-66" width="60" height="9" rx="4" fill="${col}"/><rect x="10" y="-44" width="60" height="9" rx="4" fill="${col}"/>
        <rect x="0" y="-16" width="80" height="16" rx="6" fill="${shade(col, 0.12)}"/><rect x="0" y="-4" width="80" height="8" rx="4" fill="${col}"/>
        <rect x="8" y="4" width="8" height="144" rx="3" fill="${d}"/><rect x="64" y="4" width="8" height="144" rx="3" fill="${d}"/>
        <rect x="16" y="90" width="48" height="5" rx="2" fill="${d}"/></g>`;
    },
    desk(x, y, w = 380, drawers = true) {
      return `<g transform="translate(${x},${y})">${shadow(w / 2, 168, w / 2 + 10, 12, 0.3)}
        <rect x="8" y="22" width="14" height="140" rx="3" fill="${C.woodD}"/><rect x="${w - 22}" y="22" width="14" height="140" rx="3" fill="${C.woodD}"/>
        ${drawers ? `<rect x="${w - 150}" y="22" width="132" height="64" rx="5" fill="${shade(C.wood, -0.08)}"/><rect x="${w - 134}" y="38" width="100" height="14" rx="4" fill="${C.woodD}" opacity=".5"/><circle cx="${w - 84}" cy="58" r="4" fill="${C.gold}"/>` : ''}
        <rect x="0" y="0" width="${w}" height="26" rx="8" fill="url(#gWood)"/><rect x="0" y="0" width="${w}" height="8" rx="4" fill="#fff" opacity=".18"/></g>`;
    },
    plant(x, y, s = 1) {
      return `<g transform="translate(${x},${y}) scale(${s})">${shadow(30, 92, 34, 5, 0.25)}
        <path d="M10,52 L50,52 L44,92 L16,92Z" fill="${C.coral}"/><rect x="8" y="46" width="44" height="10" rx="4" fill="${shade(C.coral, 0.12)}"/>
        <g fill="#2f9e6a"><path d="M30,48 C8,40 2,14 14,2 C26,10 32,30 30,48Z"/><path d="M30,48 C52,38 60,12 46,0 C34,10 28,30 30,48Z" fill="#37b77a"/><path d="M30,48 C28,30 30,10 30,-12 C38,8 36,32 30,48Z" fill="#278a5a"/></g></g>`;
    },
    lamp(x, y) {
      return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-30" rx="86" ry="80" fill="url(#gLamp)"/>
        <rect x="-3" y="-30" width="6" height="52" fill="${C.plum2}"/><ellipse cx="0" cy="24" rx="16" ry="4" fill="${C.plum2}"/>
        <path d="M-22,-24 L-12,-52 L12,-52 L22,-24Z" fill="${C.gold}"/><path d="M-22,-24 L22,-24 L20,-20 L-20,-20Z" fill="${shade(C.gold, -0.2)}"/></g>`;
    },
    window(x, y, w, h) {
      return `<g transform="translate(${x},${y})"><rect x="-8" y="-8" width="${w + 16}" height="${h + 16}" rx="10" fill="${C.plum2}"/>
        <rect width="${w}" height="${h}" rx="4" fill="url(#gSky)"/>
        <circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.14}" fill="#fff3bd"/><circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.3}" fill="url(#gLamp)"/>
        <path d="M0,${h * 0.78} C${w * 0.2},${h * 0.62} ${w * 0.4},${h * 0.8} ${w * 0.62},${h * 0.7} C${w * 0.8},${h * 0.62} ${w * 0.9},${h * 0.72} ${w},${h * 0.68} L${w},${h} L0,${h}Z" fill="#7bd3a0" opacity=".85"/>
        <rect x="${w / 2 - 3}" y="0" width="6" height="${h}" fill="${C.plum2}"/><rect x="0" y="${h / 2 - 3}" width="${w}" height="6" fill="${C.plum2}"/></g>`;
    },
    table(x, y, w = 200) {
      return `<g transform="translate(${x},${y})">${shadow(w / 2, 112, w / 2, 9, 0.28)}
        <rect x="14" y="14" width="10" height="98" fill="${C.woodD}"/><rect x="${w - 24}" y="14" width="10" height="98" fill="${C.woodD}"/>
        <rect x="0" y="0" width="${w}" height="18" rx="6" fill="url(#gWood)"/></g>`;
    },
    frameGold(x, y, w, h) {
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${C.gold}" stroke-width="4" stroke-dasharray="10 7"/>`;
    }
  };
  FE.P = P;

  /* Evidence halo (soft, static; fades in) */
  const evidence = (x, y, w, h) => `<rect class="ev" x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="none" stroke="${C.gold}" stroke-width="4"/>`;
  const wrapSvg = (vb, inner, cls = '', label = '') =>
    `<svg class="art ${cls}" viewBox="0 0 ${vb[0]} ${vb[1]}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
  FE.wrapSvg = wrapSvg;

  /* ===== Scene 1: the room (blue bag, ONE phone, TWO books on a desk, empty chair) ===== */
  FE.roomScene = function (hl) {
    const inner = `
      <rect width="900" height="520" fill="url(#gWall)"/>
      <path d="M0,300 C150,260 260,310 420,280 C600,250 760,300 900,270 L900,370 L0,370Z" fill="${C.turq2}" opacity=".18"/>
      <rect y="360" width="900" height="160" fill="url(#gFloor)"/>
      <g stroke="#7a4f2c" stroke-opacity=".25" stroke-width="2"><path d="M0,392 L900,392"/><path d="M0,430 L900,430"/><path d="M0,476 L900,476"/></g>
      <rect y="354" width="900" height="10" fill="${C.plum2}" opacity=".85"/>
      ${P.window(640, 52, 190, 170)}
      <path d="M640,222 L830,222 L700,520 L430,520Z" fill="url(#gBeam)" opacity=".5"/>
      <ellipse cx="360" cy="474" rx="250" ry="38" fill="${C.plum2}" opacity=".85"/><ellipse cx="360" cy="474" rx="226" ry="30" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".8"/>
      ${P.plant(40, 270, 1.35)}
      ${P.chair(200, 296, C.wood, 1)}
      ${P.bag(70, 372, C.blue, 1.05)}
      ${P.desk(400, 300, 400)}
      ${P.lamp(770, 292)}
      ${P.book(450, 275, 96, 26, C.coral, -2)}
      ${P.book(572, 280, 92, 22, C.turq, 1.5)}
      ${P.phone(650, 276, 62, 24)}
      <ellipse class="hl-ring" cx="681" cy="288" rx="58" ry="26" fill="none" stroke="${C.gold}" stroke-width="4" opacity="${hl === 'phone' ? 1 : 0}"/>
      <ellipse cx="681" cy="288" rx="78" ry="40" fill="url(#gLamp)" opacity="${hl === 'phone' ? 0.8 : 0}"/>
      `;
    return wrapSvg([900, 520], inner, 'room', 'A room with a blue bag on the floor, an empty wooden chair, a desk with two books and one phone on it.');
  };
  // label anchors in viewBox % for the room
  FE.roomTags = [
    { w: 'bag', x: 15, y: 94 }, { w: 'chair', x: 28, y: 52 }, { w: 'desk', x: 56, y: 76 },
    { w: 'books', x: 62, y: 49 }, { w: 'phone', x: 78, y: 49 }
  ];

  /* ===== Section 4: six fresh Picture Detective scenes (640x400) ===== */
  FE.detectiveScene = function (n) {
    let inner = '';
    if (n === 1) { // blue bag on a hallway bench
      inner = `<rect width="640" height="400" fill="url(#gWallTurq)"/><rect y="290" width="640" height="110" fill="url(#gFloorGrey)"/>
        <rect y="284" width="640" height="10" fill="${C.plum2}" opacity=".7"/>
        ${P.window(60, 40, 150, 120)}
        <g>${shadow(330, 340, 190, 12, 0.28)}<rect x="170" y="262" width="320" height="22" rx="8" fill="url(#gWood)"/><rect x="190" y="284" width="14" height="60" fill="${C.woodD}"/><rect x="456" y="284" width="14" height="60" fill="${C.woodD}"/></g>
        ${P.bag(285, 158, C.blue, 1.0).replace(shadow(45, 100, 52, 7, 0.3), '')}
        ${evidence(272, 150, 120, 120)}`;
    } else if (n === 2) { // one phone on a table, "It" frame
      inner = `<rect width="640" height="400" fill="url(#gWallWarm)"/><rect y="300" width="640" height="100" fill="url(#gFloor)"/>
        ${P.lamp(540, 150)}${P.table(130, 232, 380)}
        ${P.phone(272, 206, 96, 28)}
        ${FE.P.frameGold(250, 168, 140, 74)}${evidence(250, 168, 140, 74)}`;
    } else if (n === 3) { // two books on a desk, empty chair
      inner = `<rect width="640" height="400" fill="url(#gWall)"/><rect y="300" width="640" height="100" fill="url(#gFloor)"/>
        ${P.window(440, 40, 150, 110)}
        ${P.chair(60, 190, '#b86a8a', 0.95)}
        ${P.desk(250, 218, 340)}
        ${P.book(310, 194, 96, 26, C.coral, -2)}${P.book(430, 198, 92, 22, C.gold, 2)}
        ${evidence(290, 176, 250, 58)}`;
    } else if (n === 4) { // Alex, corridor
      inner = `<rect width="640" height="400" fill="url(#gWallTurq)"/><rect y="320" width="640" height="80" fill="url(#gFloorGrey)"/>
        ${P.window(420, 50, 160, 150)}${P.plant(60, 215, 1.25)}
        <path d="M420,200 L580,200 L520,400 L330,400Z" fill="url(#gBeam)" opacity=".45"/>
        ${at(250, 372, 1.08, FE.cast('alex', { expr: 'smile' }))}
        ${evidence(188, 22, 124, 180)}`;
    } else if (n === 5) { // classroom: three adults behind desks
      inner = `<rect width="640" height="400" fill="url(#gWall)"/><rect y="310" width="640" height="90" fill="url(#gFloor)"/>
         <rect x="150" y="30" width="340" height="96" rx="8" fill="#2f5c58"/><rect x="156" y="36" width="328" height="84" rx="5" fill="#3a736d"/>
        <path d="M180,60 L300,60 M180,80 L260,80" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
        ${P.window(18, 60, 96, 110)}${P.window(526, 60, 96, 110)}
        ${at(130, 398, 0.86, FE.cast('dana', { expr: 'smile' }))}
        ${at(320, 398, 0.86, FE.cast('omar', { expr: 'smile' }))}
        ${at(510, 398, 0.86, FE.cast('mei', { expr: 'smile' }))}
        <g>${[40, 230, 420].map((x) => `<rect x="${x}" y="262" width="180" height="22" rx="6" fill="url(#gWood)"/><rect x="${x + 6}" y="284" width="168" height="120" rx="4" fill="${C.woodD}"/><rect x="${x + 14}" y="292" width="152" height="6" fill="#000" opacity=".15"/>`).join('')}</g>
        ${evidence(10, 20, 620, 360)}`;
    } else { // Maya with thought bubble
      inner = `<rect width="640" height="400" fill="url(#gWallWarm)"/><rect y="330" width="640" height="70" fill="url(#gFloor)"/>
        <circle cx="430" cy="120" r="150" fill="url(#gLamp)" opacity=".5"/>
        ${at(210, 380, 1.1, FE.cast('maya', { expr: 'calm' }))}
        <g fill="#fff" stroke="${C.plum2}" stroke-width="3"><circle cx="268" cy="120" r="9"/><circle cx="300" cy="94" r="14"/>
        <path d="M330,40 C320,10 380,0 400,22 C430,0 500,6 504,44 C540,50 548,106 508,118 C510,148 454,160 430,138 C404,160 340,152 346,122 C306,112 304,56 330,40Z"/></g>
        ${evidence(318, 14, 240, 150)}`;
    }
    return wrapSvg([640, 400], inner, 'det', 'Scene ' + n);
  };

  /* ===== Fact-card pictures (small, 4:3-ish) ===== */
  FE.factScene = function (id) {
    let inner = '', vb = [420, 300];
    const bgW = '<rect width="420" height="300" fill="url(#gWallWarm)"/><rect y="236" width="420" height="64" fill="url(#gFloor)"/>';
    if (id === 'clock') {
      inner = `<rect width="420" height="300" fill="url(#gWallTurq)"/>
        <circle cx="210" cy="150" r="104" fill="${C.ivory}" stroke="${C.plum2}" stroke-width="10"/>
        ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${210 + 86 * Math.sin(a)}" y1="${150 - 86 * Math.cos(a)}" x2="${210 + 96 * Math.sin(a)}" y2="${150 - 96 * Math.cos(a)}" stroke="${C.plum2}" stroke-width="${i % 3 ? 3 : 6}" stroke-linecap="round"/>`; }).join('')}
        <line x1="210" y1="150" x2="${210 + 52 * Math.sin(Math.PI * 2 * (5 + 50 / 60) / 12)}" y2="${150 - 52 * Math.cos(Math.PI * 2 * (5 + 50 / 60) / 12)}" stroke="${C.plum}" stroke-width="9" stroke-linecap="round"/>
        <line x1="210" y1="150" x2="${210 + 78 * Math.sin(Math.PI * 2 * 50 / 60)}" y2="${150 - 78 * Math.cos(Math.PI * 2 * 50 / 60)}" stroke="${C.coral}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="210" cy="150" r="8" fill="${C.gold}"/>`;
    } else if (id === 'leo') {
      inner = `${bgW}${at(170, 292, 0.86, FE.cast('leo'))}`;
    } else if (id === 'rosa') {
      inner = `${bgW}<circle cx="260" cy="90" r="90" fill="url(#gLamp)" opacity=".5"/>${at(150, 292, 0.86, FE.cast('rosa', { expr: 'calm' }))}`;
    } else if (id === 'table') {
      inner = `${bgW}${P.table(90, 160, 240)}<path d="M210,128 L210,150" stroke="${C.gold}" stroke-width="4" stroke-linecap="round"/><path d="M200,140 L210,152 L220,140" fill="none" stroke="${C.gold}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (id === 'library') {
      inner = `<rect width="420" height="300" fill="url(#gWall)"/><rect y="238" width="420" height="62" fill="url(#gFloorGrey)"/>
        <g>${[0, 1, 2].map((r) => `<rect x="24" y="${24 + r * 58}" width="372" height="8" rx="3" fill="${C.woodD}"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => `<rect x="${32 + i * 24}" y="${r * 58 + (i % 3 ? 4 : 0) + 4}" width="18" height="${52 - (i % 3 ? 4 : 0)}" rx="2" fill="${[C.coral, C.turq, C.gold, C.plum3, C.blue][(i + r) % 5]}" opacity=".9"/>`).join('')).join('')}</g>
        ${at(130, 292, 0.8, FE.cast('pablo'))}${at(290, 292, 0.8, FE.cast('rita'))}`;
    } else if (id === 'bags') {
      inner = `${bgW}${at(120, 292, 0.8, FE.cast('ben', { expr: 'calm' }))}${at(300, 292, 0.8, FE.cast('lina', { expr: 'calm' }))}`;
    } else if (id === 'cafe') {
      inner = `<rect width="420" height="300" fill="url(#gWallWarm)"/><rect y="236" width="420" height="64" fill="url(#gFloor)"/>
        <g fill="${C.plum2}" opacity=".9"><rect x="20" y="30" width="380" height="14" rx="7"/></g>
        ${at(120, 292, 0.8, FE.cast('ben'))}${at(300, 292, 0.8, FE.cast('lina'))}
        <g transform="translate(168,196)"><rect x="0" y="40" width="84" height="8" rx="3" fill="url(#gWood)"/><rect x="38" y="48" width="8" height="40" fill="${C.woodD}"/>
          <rect x="14" y="14" width="22" height="26" rx="5" fill="#fff"/><path d="M36,20 q9,4 0,14" fill="none" stroke="#fff" stroke-width="4"/><rect x="48" y="14" width="22" height="26" rx="5" fill="#fff"/><path d="M70,20 q9,4 0,14" fill="none" stroke="#fff" stroke-width="4"/>
          <path d="M20,6 q-4,-6 0,-12 M60,6 q-4,-6 0,-12" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    } else if (id === 'energy') {
      inner = `<rect width="420" height="300" fill="url(#gWallTurq)"/><rect y="236" width="420" height="64" fill="url(#gFloorGrey)"/>
        <rect x="70" y="80" width="250" height="124" rx="22" fill="#fff" stroke="${C.plum2}" stroke-width="10"/><rect x="320" y="118" width="22" height="48" rx="8" fill="${C.plum2}"/>
        <rect x="84" y="94" width="${222 * 0.9}" height="96" rx="12" fill="${C.turq}"/><rect x="84" y="94" width="${222 * 0.9}" height="30" rx="12" fill="#fff" opacity=".22"/>
        <text x="195" y="162" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="44" fill="#fff">90%</text>`;
    } else if (id === 'chair') {
      inner = `${bgW}${P.chair(150, 100, '#3a9d6a', 1.2)}`;
    }
    return wrapSvg(vb, inner, 'fact', id);
  };

  /* ===== Section 7/9: object still-life sets (colors verified, one phone, etc.) ===== */
  FE.objectSet = function (k) {
    const sets = [
      { chair: C.yellow, bag: C.blue, items: 'phone' },
      { chair: C.red, bag: C.green, items: 'books' },
      { chair: C.blue, bag: C.red, items: 'phone' }
    ];
    const s = sets[k % sets.length];
    const inner = `<rect width="640" height="400" fill="url(#gWall)"/><rect y="296" width="640" height="104" fill="url(#gFloor)"/>
      ${P.window(430, 36, 150, 112)}
      ${P.chair(70, 196, s.chair, 0.82)}
      ${P.bag(180, 280, s.bag, 0.95)}
      ${P.table(300, 200, 280).replace(shadow(140, 112, 140, 9, 0.28), shadow(140, 112, 140, 9, 0.28))}
      ${s.items === 'phone' ? P.phone(400, 178, 70, 22) + P.book(300, 178, 60, 22, C.gold) : P.book(330, 180, 80, 22, C.coral, -2) + P.book(430, 183, 80, 18, C.turq, 2)}`;
    return wrapSvg([640, 400], inner, 'det', 'Objects');
  };
  FE.objectSetFacts = [
    { chair: 'yellow', bag: 'blue', desc: 'a yellow chair, a blue bag, a phone and a gold book' },
    { chair: 'red', bag: 'green', desc: 'a red chair, a green bag and two books' },
    { chair: 'blue', bag: 'red', desc: 'a blue chair, a red bag, a phone and a gold book' }
  ];

  /* Small icons for fact cards */
  FE.icon = function (n) {
    const i = {
      battery: `<rect x="3" y="9" width="26" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="29" y="13" width="3" height="6" rx="1" fill="currentColor"/><rect x="5.5" y="11.5" width="19" height="9" rx="1.5" fill="currentColor"/>`,
      clock: `<circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 9v7l5 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`,
      id: `<rect x="4" y="6" width="24" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="15" r="3" fill="currentColor"/><path d="M8 22c1-4 7-4 8 0M19 13h6M19 18h5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
      pin: `<path d="M16 29s9-9 9-16a9 9 0 10-18 0c0 7 9 16 9 16z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="16" cy="13" r="3.2" fill="currentColor"/>`,
      list: `<rect x="6" y="4" width="20" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M11 12h10M11 17h10M11 22h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
      bubble: `<path d="M5 7h22a2 2 0 012 2v12a2 2 0 01-2 2H15l-6 5v-5H5a2 2 0 01-2-2V9a2 2 0 012-2z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>`,
      eye: `<path d="M3 16s5-9 13-9 13 9 13 9-5 9-13 9S3 16 3 16z" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="16" cy="16" r="4" fill="currentColor"/>`,
      check: `<path d="M5 17l7 7 15-16" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`,
      cross: `<path d="M8 8l16 16M24 8L8 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`
    }[n] || '';
    return `<svg class="ico" viewBox="0 0 32 32" aria-hidden="true">${i}</svg>`;
  };

  /* Soft completion glow: gentle drifting lights (no flashing). */
  FE.completionArt = function () {
    let lights = '';
    for (let i = 0; i < 18; i++) {
      const x = 40 + ((i * 97) % 820), y = 60 + ((i * 53) % 300), r = 5 + (i % 4) * 3;
      lights += `<circle class="drift" style="animation-delay:${(i % 6) * 0.7}s" cx="${x}" cy="${y}" r="${r}" fill="${[C.gold, C.turq2, C.coral, '#fff'][i % 4]}" opacity=".65"/>`;
    }
    return wrapSvg([900, 420], `<rect width="900" height="420" fill="none"/>${lights}`, 'done-art', '');
  };
})(window.FE = window.FE || {});
