/* Should for Advice — articulated SVG adult characters (code-built, spring-animated) */
(function (g) {
  'use strict';
  const FE = g.FE;
  const { shade, mix, clamp } = FE;

  /* ---------------- character roster (original adult characters) ---------------- */
  FE.CHARS = {
    maya: { name: 'Maya', voice: 'af_bella', build: 'f', skin: '#a8714f', hair: 'bun', hairCol: '#2a1a14', eye: '#4a2d1d', brow: '#24160f', lip: '#a4474a',
      top: 'blazer', topCol: '#1f6b77', inner: '#f1e6d6', earring: '#e8c872', glasses: false, jaw: 0.0 },
    daniel: { name: 'Daniel', voice: 'am_michael', build: 'm', skin: '#e2b08c', hair: 'short', hairCol: '#3b2a1e', eye: '#5a4a35', brow: '#33241a', lip: '#b8706a',
      top: 'shirt', topCol: '#c9d4e6', inner: '#ffffff', stubble: true, glasses: false, jaw: 0.6, sleeve: 0.55 },
    priya: { name: 'Priya', voice: 'af_sarah', build: 'f', skin: '#b9825a', hair: 'long', hairCol: '#150f0d', eye: '#3a2417', brow: '#1a110d', lip: '#a63f4c',
      top: 'jacket', topCol: '#c4623a', inner: '#f4efe6', earring: '#d9a441', glasses: false, jaw: 0.1 },
    marcus: { name: 'Marcus', voice: 'am_eric', build: 'm', skin: '#6e4530', hair: 'fade', hairCol: '#120d0b', eye: '#2c1a10', brow: '#120d0b', lip: '#8a4a45',
      top: 'sweater', topCol: '#38506b', inner: '#e8e2d6', beard: true, glasses: true, jaw: 0.7 },
    hana: { name: 'Hana', voice: 'af_sky', build: 'f', skin: '#efc6a2', hair: 'bob', hairCol: '#1b1417', eye: '#2a1c18', brow: '#1f1517', lip: '#c05d62',
      top: 'cardigan', topCol: '#8a6bb0', inner: '#f6f0f4', earring: '#cfd8e6', glasses: false, jaw: 0.0 },
    theo: { name: 'Theo', voice: 'am_liam', build: 'm', skin: '#c38e68', hair: 'wavy', hairCol: '#4a3020', eye: '#4d5a3a', brow: '#3a2619', lip: '#a95e57',
      top: 'hoodie', topCol: '#4f7a62', inner: '#e9e4da', stubble: true, glasses: false, jaw: 0.4 },
  };

  /* ---------------- hand shapes (wrist at 0,0, fingers toward +y) ---------------- */
  function hands(sk) {
    const d = shade(sk, -0.28), l = shade(sk, 0.1);
    return {
      relax: `<path d="M-10 -3C-14 10-13 25-9 35C-6 41-1 43 3 40C9 37 12 27 12 14C12 6 11 0 10 -3Z" fill="${sk}"/>
        <path d="M-9 8C-17 13-18 25-12 30C-10 24-10 15-7 9Z" fill="${shade(sk, -0.06)}"/>
        <path d="M-3 20V37M3 18V39M8 16V35" stroke="${d}" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
        <path d="M10 -2C12 8 12 18 10 27" stroke="${l}" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>`,
      open: `<path d="M-11 -3C-15 8-15 16-14 22L-12 36C-11 42-6 43-5 38L-4 24L-3 44C-2 49 3 49 3 44L3 25L6 42C7 47 12 46 11 41L8 24L12 34C14 38 18 36 16 31C14 24 14 14 12 6L11 -3Z" fill="${sk}"/>
        <path d="M-11 6C-21 8-25 18-20 26C-17 21-14 17-11 15Z" fill="${shade(sk, -0.06)}"/>
        <path d="M-4 24L-3 40M3 25L3 42M8 24L10 37" stroke="${d}" stroke-width="1.2" opacity=".4" stroke-linecap="round"/>`,
      fist: `<path d="M-12 -3C-16 8-15 22-10 30C-6 36 5 37 10 31C14 25 14 10 12 -3Z" fill="${sk}"/>
        <path d="M-9 12C-1 16 7 16 12 13M-9 20C-1 24 7 24 12 21" stroke="${d}" stroke-width="1.5" fill="none" opacity=".55" stroke-linecap="round"/>
        <path d="M-12 6C-20 9-20 20-13 24C-10 19-10 13-9 8Z" fill="${shade(sk, -0.07)}"/>`,
      point: `<path d="M-11 -3C-15 8-14 18-10 25C-6 30 5 31 10 26C13 20 13 10 12 -3Z" fill="${sk}"/>
        <path d="M-3 22C-5 32-5 42-4 50C-3 55 2 55 3 50C4 42 4 32 3 22Z" fill="${sk}"/>
        <path d="M-9 8C-18 11-18 22-12 25C-9 20-9 14-8 10Z" fill="${shade(sk, -0.07)}"/>
        <path d="M5 14C9 15 11 18 11 21M5 21C9 22 11 25 11 28" stroke="${d}" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>`,
    };
  }

  /* ---------------- hair styles ---------------- */
  const HAIR = {
    short: { back: '', front: (c) => `<path d="M-61 -116C-67 -178-28 -210 6 -208C46 -206 69 -176 61 -116C58 -139 52 -151 42 -158C20 -171-8 -167-27 -152C-44 -138-53 -128-61 -116Z" fill="url(#${c}hair)"/>
        <path d="M-27 -152C-8 -167 20 -171 42 -158" stroke="${shade('#ffffff', 0)}" stroke-opacity=".12" stroke-width="3" fill="none"/>
        <path d="M-58 -118C-62 -108-60 -98-58 -94L-55 -118Z M58 -118C62 -108 60 -98 58 -94L55 -118Z" fill="url(#${c}hair)"/>` },
    fade: { back: '', front: (c) => `<path d="M-59 -120C-64 -174-30 -202 2 -201C36 -200 66 -172 59 -120C55 -146 44 -160 30 -165C6 -172-22 -168-38 -154C-50 -144-56 -134-59 -120Z" fill="url(#${c}hair)"/>
        <path d="M-59 -120C-60 -108-58 -100-56 -94L-54 -120Z M59 -120C60 -108 58 -100 56 -94L54 -120Z" fill="${'#000'}" opacity=".25"/>` },
    bun: { back: (c) => `<circle cx="0" cy="-226" r="33" fill="url(#${c}hair)"/><circle cx="-14" cy="-232" r="18" fill="url(#${c}hairhi)" opacity=".35"/>
        <path d="M-68 -120C-80 -200 80 -200 68 -120L58 -86L-58 -86Z" fill="url(#${c}hair)"/>`,
      front: (c) => `<path d="M-62 -112C-70 -182-30 -208 4 -207C44 -206 72 -176 62 -112C60 -136 52 -156 36 -164C12 -176-20 -172-40 -154C-52 -142-58 -128-62 -112Z" fill="url(#${c}hair)"/>
        <path d="M-40 -154C-18 -172 12 -176 36 -164" stroke="#fff" stroke-opacity=".14" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M-8 -200c8 8 22 8 30 0" stroke="#000" stroke-opacity=".18" stroke-width="2" fill="none"/>` },
    long: { back: (c) => `<path d="M-68 -130C-84 -216 84 -216 68 -130C80 -64 90 -6 84 56L-84 56C-90 -6 -80 -64 -68 -130Z" fill="url(#${c}hair)"/>`,
      front: (c) => `<path d="M-63 -108C-72 -184-30 -210 6 -209C46 -208 74 -178 63 -108C61 -138 50 -160 28 -170C0 -150-30 -146-52 -128C-58 -122-61 -116-63 -108Z" fill="url(#${c}hair)"/>
        <path d="M28 -170C0 -150-30 -146-52 -128" stroke="#fff" stroke-opacity=".12" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-63 -108C-66 -80-66 -50-62 -20L-54 -20C-58 -50-58 -80-56 -110Z M63 -108C66 -80 66 -50 62 -20L54 -20C58 -50 58 -80 56 -110Z" fill="url(#${c}hair)"/>` },
    bob: { back: (c) => `<path d="M-72 -146C-82 -222 82 -222 72 -146C78 -106 74 -76 64 -62L-64 -62C-74 -76 -78 -106 -72 -146Z" fill="url(#${c}hair)"/>`,
      front: (c) => `<path d="M-64 -110C-72 -186-30 -212 4 -211C46 -210 74 -180 64 -110C62 -128 56 -146 46 -156C20 -150-10 -146-30 -150C-46 -140-58 -126-64 -110Z" fill="url(#${c}hair)"/>
        <path d="M-64 -110C-68 -88-68 -72-62 -64L-52 -66C-56 -80-56 -96-54 -112Z M64 -110C68 -88 68 -72 62 -64L52 -66C56 -80 56 -96 54 -112Z" fill="url(#${c}hair)"/>
        <path d="M-30 -150C-10 -146 20 -150 46 -156" stroke="#fff" stroke-opacity=".13" stroke-width="3" fill="none" stroke-linecap="round"/>` },
    wavy: { back: '', front: (c) => `<path d="M-63 -114C-76 -170-50 -214-8 -214C30 -216 56 -204 66 -168C72 -146 66 -128 62 -114C60 -134 52 -148 40 -154C34 -164 20 -158 10 -162C-2 -152-20 -164-30 -154C-42 -148-52 -128-63 -114Z" fill="url(#${c}hair)"/>
        <path d="M-40 -190C-24 -204 -4 -204 12 -196M16 -196C32 -204 48 -196 54 -184" stroke="#fff" stroke-opacity=".15" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M-60 -118C-64 -106-62 -98-60 -92L-56 -118Z M60 -118C64 -106 62 -98 60 -92L56 -118Z" fill="url(#${c}hair)"/>` },
  };

  /* ---------------- body / clothing ---------------- */
  function dims(spec) { return spec.build === 'm' ? { sw: 96, ww: 84, ar: 21 } : { sw: 84, ww: 66, ar: 18 }; }
  function torsoPath(d) {
    const { sw, ww } = d;
    return `M${-sw} 26C${-sw + 5} 4-40 -4-26 -10L26 -10C40 -4 ${sw - 5} 4 ${sw} 26C${sw + 4} 100 ${ww + 12} 170 ${ww} 270L${-ww} 270C${-ww - 12} 170 ${-sw - 4} 100 ${-sw} 26Z`;
  }
  function clothing(spec, d, id) {
    const c = spec.topCol, cd = shade(c, -0.22), cl = shade(c, 0.16), inn = spec.inner, sk = spec.skin;
    const skd = shade(sk, -0.2);
    const t = spec.top;
    const fold = (p) => `<path d="${p}" stroke="#000" stroke-opacity=".14" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    if (t === 'blazer') return `<rect x="-120" y="-20" width="240" height="300" fill="${inn}"/>
      <path d="M-24 -10L24 -10L2 70L-2 70Z" fill="${sk}"/><path d="M-24 -10L24 -10L2 70L-2 70Z" fill="${skd}" opacity=".25"/>
      <path d="M-120 -20H-24L-5 128L-5 280H-120Z" fill="url(#${id}top)"/><path d="M120 -20H24L5 128L5 280H120Z" fill="url(#${id}top)"/>
      <path d="M-26 -10L-56 28L-30 78L-8 120L-4 100L-14 62L-22 24Z" fill="${cl}"/><path d="M26 -10L56 28L30 78L8 120L4 100L14 62L22 24Z" fill="${shade(c, 0.05)}"/>
      <path d="M-26 -10L-14 62L-4 100" stroke="${cd}" stroke-width="2" fill="none"/><path d="M26 -10L14 62L4 100" stroke="${cd}" stroke-width="2" fill="none"/>
      <circle cx="-6" cy="128" r="4.5" fill="${cd}"/><circle cx="-6.5" cy="127" r="1.6" fill="#fff" opacity=".5"/>
      <path d="M-62 98L-34 94" stroke="${cd}" stroke-width="2.4" stroke-linecap="round"/>${fold('M-40 140C-44 190-44 230-40 268')}${fold('M42 150C46 200 44 236 42 268')}`;
    if (t === 'shirt') return `<rect x="-120" y="-20" width="240" height="300" fill="url(#${id}top)"/>
      <path d="M-24 -10L24 -10L2 36L-2 36Z" fill="${sk}"/><path d="M-24 -10L24 -10L2 36L-2 36Z" fill="${skd}" opacity=".3"/>
      <path d="M-28 -12L-2 40L-12 56L-44 18Z" fill="${shade(c, 0.12)}" stroke="${cd}" stroke-width="1.5"/><path d="M28 -12L2 40L12 56L44 18Z" fill="${shade(c, 0.06)}" stroke="${cd}" stroke-width="1.5"/>
      <path d="M0 42V270" stroke="${cd}" stroke-width="2" opacity=".7"/><g fill="${shade(c, 0.3)}" stroke="${cd}" stroke-width=".8"><circle cx="0" cy="84" r="3.2"/><circle cx="0" cy="130" r="3.2"/><circle cx="0" cy="176" r="3.2"/><circle cx="0" cy="222" r="3.2"/></g>
      <path d="M26 90H62V132H26Z" fill="none" stroke="${cd}" stroke-width="1.8" opacity=".7"/>${fold('M-46 120C-52 170-50 230-44 268')}${fold('M46 170C52 210 50 240 46 268')}`;
    if (t === 'sweater') return `<rect x="-120" y="-20" width="240" height="300" fill="url(#${id}top)"/>
      <g stroke="${cd}" stroke-opacity=".22" stroke-width="2">${Array.from({ length: 18 }, (_, i) => `<path d="M${-95 + i * 11} 30V270"/>`).join('')}</g>
      <path d="M-30 -10C-24 22 24 22 30 -10L40 -6C30 36-30 36-40 -6Z" fill="${cd}"/><path d="M-26 -10C-20 14 20 14 26 -10Z" fill="${sk}"/><path d="M-26 -10C-20 14 20 14 26 -10Z" fill="${skd}" opacity=".3"/>
      <path d="M-34 4C-24 30 24 30 34 4" stroke="${cl}" stroke-width="2" fill="none" opacity=".6"/>${fold('M-50 130C-56 180-52 240-46 268')}`;
    if (t === 'jacket') return `<rect x="-120" y="-20" width="240" height="300" fill="${inn}"/>
      <path d="M-120 -20H-26L-20 24L-4 270H-120Z" fill="url(#${id}top)"/><path d="M120 -20H26L20 24L4 270H120Z" fill="url(#${id}top)"/>
      <path d="M-26 -14L-40 -6L-36 22L-18 28Z" fill="${cl}"/><path d="M26 -14L40 -6L36 22L18 28Z" fill="${shade(c, 0.08)}"/>
      <path d="M0 24V270" stroke="${cd}" stroke-width="3"/><path d="M-3 40V260" stroke="#e9e3d6" stroke-width="1.5" stroke-dasharray="3 4" opacity=".7"/><rect x="-6" y="22" width="9" height="12" rx="2" fill="#d8d0c0"/>
      <rect x="-70" y="108" width="42" height="34" rx="5" fill="none" stroke="${cd}" stroke-width="2"/><path d="M-70 120H-28" stroke="${cd}" stroke-width="1.6"/>${fold('M46 150C50 200 48 240 44 268')}`;
    if (t === 'hoodie') return `<rect x="-120" y="-20" width="240" height="300" fill="url(#${id}top)"/>
      <path d="M-44 -8C-36 26 36 26 44 -8C30 -22-30 -22-44 -8Z" fill="${cd}"/><path d="M-34 -6C-24 18 24 18 34 -6Z" fill="${sk}"/><path d="M-34 -6C-24 18 24 18 34 -6Z" fill="${skd}" opacity=".3"/>
      <path d="M-12 20C-14 50-14 76-12 96M12 20C14 50 14 76 12 96" stroke="#e8e1d2" stroke-width="3" stroke-linecap="round"/><circle cx="-12" cy="98" r="3" fill="#e8e1d2"/><circle cx="12" cy="98" r="3" fill="#e8e1d2"/>
      <path d="M-70 190C-30 176 30 176 70 190L74 262H-74Z" fill="${cd}" opacity=".55"/>${fold('M-50 110C-56 160-52 220-46 266')}`;
    if (t === 'cardigan') return `<rect x="-120" y="-20" width="240" height="300" fill="${inn}"/>
      <path d="M-24 -10C-18 30 -6 80 -4 270H-120V-20Z" fill="url(#${id}top)"/><path d="M24 -10C18 30 6 80 4 270H120V-20Z" fill="url(#${id}top)"/>
      <path d="M-24 -10C-16 20 -10 60 -6 100L-12 270" stroke="${cd}" stroke-width="3" fill="none"/><path d="M24 -10C16 20 10 60 6 100L12 270" stroke="${cd}" stroke-width="3" fill="none"/>
      <path d="M-26 -12C-30 4-20 28-12 40C-14 20-16 4-18 -10Z" fill="${cl}"/><path d="M26 -12C30 4 20 28 12 40C14 20 16 4 18 -10Z" fill="${cl}"/>
      <path d="M-22 -10C-14 14 14 14 22 -10Z" fill="${sk}"/><path d="M-22 -10C-14 14 14 14 22 -10Z" fill="${skd}" opacity=".3"/>
      <g stroke="${cd}" stroke-opacity=".2" stroke-width="2">${Array.from({ length: 8 }, (_, i) => `<path d="M${-100 + i * 11} 40V270"/>`).join('')}</g>${fold('M-52 130C-58 190-54 240-48 268')}`;
    return '';
  }

  /* ---------------- build one actor's SVG ---------------- */
  function buildSVG(spec, id) {
    const d = dims(spec), sk = spec.skin;
    const sk0 = shade(sk, 0.14), sk2 = shade(sk, -0.16), sk3 = shade(sk, -0.34);
    const blush = mix(sk, '#d4584a', 0.34), hc = spec.hairCol;
    const H = HAIR[spec.hair];
    const hb = typeof H.back === 'function' ? H.back(id) : H.back;
    const hf = H.front(id);
    const hand = hands(sk);
    const tp = torsoPath(d);
    const ar = d.ar;
    const armSvg = (side) => {
      const sleeveLen = spec.sleeve != null ? spec.sleeve : 1; // 1 = full sleeve
      const c = spec.topCol, cd = shade(c, -0.22);
      const upper = `<path d="M${-ar} -4C${-ar - 2} 30 ${-ar + 2} 70 ${-ar + 4} 112L${ar - 4} 112C${ar - 2} 70 ${ar + 2} 30 ${ar} -4C${ar - 4} -14 ${-ar + 4} -14 ${-ar} -4Z" fill="url(#${id}arm)"/>
        <path d="M${ar - 4} 0C${ar} 40 ${ar - 3} 80 ${ar - 5} 110" stroke="#fff" stroke-opacity=".1" stroke-width="3" fill="none"/>`;
      const fl = 104, fw = ar - 3;
      const sleeveEnd = Math.round(fl * sleeveLen);
      const fore = `<path d="M${-fw} 0L${-fw + 3} ${fl}L${fw - 3} ${fl}L${fw} 0Z" fill="${sk}"/>
        <path d="M${-fw} 0L${-fw + 3} ${fl}L${-fw + 9} ${fl}L${-fw + 6} 0Z" fill="${sk2}" opacity=".35"/>
        <path d="M${-fw - 1} -2L${-fw + 3} ${sleeveEnd}L${fw - 3} ${sleeveEnd}L${fw + 1} -2Z" fill="url(#${id}arm)"/>
        ${sleeveLen < 1 ? `<path d="M${-fw + 3} ${sleeveEnd}L${fw - 3} ${sleeveEnd}" stroke="${cd}" stroke-width="3"/>` : `<path d="M${-fw + 3} ${sleeveEnd - 2}L${fw - 3} ${sleeveEnd - 2}" stroke="${cd}" stroke-width="3.2" opacity=".8"/>`}`;
      return `<g class="arm" data-side="${side}"><g class="up"><circle cx="0" cy="0" r="${ar + 1}" fill="url(#${id}arm)"/>${upper}<g class="fore" transform="translate(0 112)"><circle cx="0" cy="0" r="${ar - 2}" fill="url(#${id}arm)"/>${fore}<g class="hand" transform="translate(0 ${fl - 2})">
        <g class="props"></g><g class="hs">${hand.relax}</g></g></g></g></g>`;
    };
    const eyeSvg = (s) => `<g class="eye" data-s="${s}" transform="translate(${s * 28} -112)">
        <clipPath id="${id}ec${s}"><path d="M-15 1C-8 -12 8 -12 15 1C8 11-8 11-15 1Z"/></clipPath>
        <g class="eo"><g clip-path="url(#${id}ec${s})"><path d="M-16 -14H16V14H-16Z" fill="url(#${id}sclera)"/>
          <g class="iris"><circle r="8.6" fill="url(#${id}iris)"/><circle r="8.6" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.2"/><circle r="3.6" fill="#07070a"/><circle cx="-3" cy="-3" r="2.1" fill="#fff" opacity=".92"/><circle cx="3" cy="3" r="1" fill="#fff" opacity=".5"/></g>
          <path d="M-16 -14H16V-4C8 -9-8 -9-16 -4Z" fill="#000" opacity=".16"/></g>
          <path d="M-16 0C-9 -13 9 -13 16 0" fill="none" stroke="${shade(spec.brow, -0.2)}" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M${s * 15} -1L${s * 20} -5" stroke="${shade(spec.brow, -0.2)}" stroke-width="2" stroke-linecap="round"/>
          <path d="M-13 3C-6 10 6 10 13 3" fill="none" stroke="${sk2}" stroke-width="1.4" opacity=".7"/></g>
        <path class="crease" d="M-15 -8C-7 -17 7 -17 15 -8" fill="none" stroke="${sk3}" stroke-width="1.6" opacity=".5" stroke-linecap="round"/></g>`;
    const glasses = spec.glasses ? `<g class="glasses" fill="none" stroke="#1f1f24" stroke-width="3.2"><rect x="-50" y="-128" width="42" height="32" rx="12"/><rect x="8" y="-128" width="42" height="32" rx="12"/><path d="M-8 -118Q0 -124 8 -118"/><path d="M-50 -118L-60 -122M50 -118L60 -122"/></g><path d="M-48 -126H-10M10 -126H48" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>` : '';
    const beard = spec.beard ? `<path d="M-58 -108C-60 -70-48 -38-22 -28C-10 -24 10 -24 22 -28C48 -38 60 -70 58 -108C54 -90 50 -80 40 -74C30 -84 18 -84 12 -80L-12 -80C-18 -84-30 -84-40 -74C-50 -80-54 -90-58 -108Z" fill="${spec.hairCol}" opacity=".94"/>` :
      spec.stubble ? `<path d="M-53 -86C-49 -60-37 -38-17 -30C-8 -27 8 -27 17 -30C37 -38 49 -60 53 -86C42 -73 26 -70 0 -70C-26 -70-42 -73-53 -86Z" fill="url(#${id}stub)"/>` : '';
    const earring = spec.earring ? (s) => `<g class="ering" data-s="${s}"><circle cx="${s * 59}" cy="-86" r="3.2" fill="${spec.earring}"/><circle cx="${s * 59}" cy="-76" r="4.2" fill="${spec.earring}" stroke="#fff" stroke-opacity=".5" stroke-width=".8"/></g>` : () => '';
    return `
    <defs>
      <linearGradient id="${id}skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sk0}"/><stop offset=".55" stop-color="${sk}"/><stop offset="1" stop-color="${sk2}"/></linearGradient>
      <linearGradient id="${id}neck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sk3}"/><stop offset=".6" stop-color="${sk2}"/><stop offset="1" stop-color="${sk}"/></linearGradient>
      <linearGradient id="${id}hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(hc, 0.22)}"/><stop offset=".5" stop-color="${hc}"/><stop offset="1" stop-color="${shade(hc, -0.4)}"/></linearGradient>
      <linearGradient id="${id}hairhi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(hc, 0.55)}"/><stop offset="1" stop-color="${hc}"/></linearGradient>
      <linearGradient id="${id}top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(spec.topCol, 0.14)}"/><stop offset=".6" stop-color="${spec.topCol}"/><stop offset="1" stop-color="${shade(spec.topCol, -0.3)}"/></linearGradient>
      <linearGradient id="${id}arm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(spec.topCol, 0.1)}"/><stop offset=".6" stop-color="${spec.topCol}"/><stop offset="1" stop-color="${shade(spec.topCol, -0.32)}"/></linearGradient>
      <radialGradient id="${id}iris" cx=".4" cy=".4" r=".8"><stop offset="0" stop-color="${shade(spec.eye, 0.35)}"/><stop offset=".6" stop-color="${spec.eye}"/><stop offset="1" stop-color="${shade(spec.eye, -0.5)}"/></radialGradient>
      <linearGradient id="${id}sclera" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfc8c4"/><stop offset=".35" stop-color="#f6f2ee"/><stop offset="1" stop-color="#ebe3de"/></linearGradient>
      <linearGradient id="${id}stub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${spec.hairCol}" stop-opacity="0"/><stop offset="1" stop-color="${spec.hairCol}" stop-opacity=".34"/></linearGradient>
      <radialGradient id="${id}cheek" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${blush}" stop-opacity=".55"/><stop offset="1" stop-color="${blush}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id}light" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>
      <clipPath id="${id}tc"><path d="${tp}"/></clipPath>
      <clipPath id="${id}fc"><path d="M-58 -118C-60 -165-30 -190 0 -190C30 -190 60 -165 58 -118C58 -85 46 -52 24 -36C12 -28-12 -28-24 -36C-46 -52-58 -85-58 -118Z"/></clipPath>
    </defs>
    <ellipse class="shadow" cx="0" cy="268" rx="${d.sw + 30}" ry="12" fill="#000" opacity=".0"/>
    <g class="sway">
      <g class="hairB" transform="translate(0 -30)"><g transform="translate(0 30)">${hb}</g></g>
      <g class="torso">
        <path d="M-24 -60H24V8H-24Z" fill="url(#${id}neck)" class="neckp"/>
        <g clip-path="url(#${id}tc)"><g>${clothing(spec, d, id)}</g>
          <rect x="-130" y="-30" width="260" height="320" fill="url(#${id}light)"/></g>
        <path d="${tp}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2.5" stroke-dasharray="0 400 300 0" />
      </g>
      <g class="head" transform="translate(0 -30)"><g class="hd" transform="translate(0 30)">
        <g class="ears">
          <g class="earL"><ellipse cx="-58" cy="-104" rx="9" ry="16" fill="${sk2}"/><ellipse cx="-58" cy="-104" rx="4.5" ry="9" fill="${sk3}" opacity=".5"/>${earring(-1)}</g>
          <g class="earR"><ellipse cx="58" cy="-104" rx="9" ry="16" fill="${sk2}"/><ellipse cx="58" cy="-104" rx="4.5" ry="9" fill="${sk3}" opacity=".5"/>${earring(1)}</g>
        </g>
        <g class="face">
          <path d="M-58 -118C-60 -165-30 -190 0 -190C30 -190 60 -165 58 -118C58 -85 46 -52 24 -36C12 -28-12 -28-24 -36C-46 -52-58 -85-58 -118Z" fill="url(#${id}skin)"/>
          <g clip-path="url(#${id}fc)">
            <path d="M40 -190C60 -165 62 -120 58 -100C52 -62 36 -40 12 -30L24 -36C46 -52 58 -85 58 -118C58 -150 52 -175 40 -190Z" fill="${sk2}" opacity=".5"/>
            <path d="M-58 -118C-58 -150 -50 -175 -36 -190L-30 -190C-44 -170 -50 -150 -50 -118Z" fill="${sk0}" opacity=".35"/>
            <ellipse cx="0" cy="-52" rx="30" ry="10" fill="${sk3}" opacity=".16"/>
            <ellipse class="chL" cx="-34" cy="-80" rx="19" ry="13" fill="url(#${id}cheek)"/><ellipse class="chR" cx="34" cy="-80" rx="19" ry="13" fill="url(#${id}cheek)"/>
            <path d="M-50 -122C-40 -148 40 -148 50 -122" fill="${sk3}" opacity=".12"/>
          </g>
          ${beard}
          <g class="feat">
            <g class="nose"><path d="M-3 -118C-5 -100-9 -92-10 -86C-6 -82 6 -82 10 -86C9 -92 5 -100 3 -118Z" fill="${sk2}" opacity=".32"/>
              <path d="M-9 -86C-6 -80 6 -80 9 -86" stroke="${sk3}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
              <ellipse cx="0" cy="-92" rx="5" ry="3.4" fill="${sk0}" opacity=".55"/><path d="M-8 -84l1.4 1.4M8 -84l-1.4 1.4" stroke="${sk3}" stroke-width="2" stroke-linecap="round" opacity=".5"/></g>
            ${eyeSvg(-1)}${eyeSvg(1)}
            <path class="brL" d="" fill="${spec.brow}" /><path class="brR" d="" fill="${spec.brow}" />
            <g class="mouth"><path class="mIn" d="" fill="#3d1417"/><path class="mTeeth" d="" fill="#f4eee8"/><path class="mTongue" d="" fill="#b8575c" opacity=".85"/>
              <path class="mUp" d="" fill="${shade(spec.lip, -0.06)}"/><path class="mLo" d="" fill="${spec.lip}"/><path class="mLine" d="" stroke="${shade(spec.lip, -0.55)}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
              <path class="mHi" d="" stroke="#fff" stroke-opacity=".28" stroke-width="2" fill="none" stroke-linecap="round"/></g>
          </g>
          ${glasses}
        </g>
        <g class="hairF">${hf}</g>
      </g></g>
      <g class="armL">${armSvg(-1)}</g><g class="armR">${armSvg(1)}</g>
    </g>`;
  }

  /* ---------------- springs ---------------- */
  function Spring(x, k, dmp) { this.x = x; this.v = 0; this.t = x; this.k = k; this.d = dmp; }
  Spring.prototype.step = function (dt) {
    const sub = Math.ceil(dt / 0.012), h = dt / sub;
    for (let i = 0; i < sub; i++) { this.v += (this.k * (this.t - this.x) - this.d * this.v) * h; this.x += this.v * h; }
  };

  const PARAMS = {
    // name: [default, stiffness, damping]
    lean: [0, 45, 9], sx: [0, 30, 8], headRot: [0, 70, 10], headX: [0, 70, 11], headY: [0, 70, 11], facing: [0, 40, 11],
    gx: [0, 220, 24], gy: [0, 220, 24], open: [1, 260, 28], brow: [0, 110, 15], tilt: [0, 110, 15], browL: [0, 110, 15], smile: [0.15, 110, 15],
    mouth: [0, 400, 26], mw: [1, 110, 15], blush: [0, 40, 10],
    Lsh: [8, 90, 11], Lel: [10, 90, 11], Rsh: [8, 90, 11], Rel: [10, 90, 11], Lwr: [0, 120, 13], Rwr: [0, 120, 13], Lup: [1, 90, 12], Rup: [1, 90, 12],
  };
  const EXPR = {
    neutral: { brow: 0, tilt: 0, smile: 0.12, open: 1, mw: 1, browL: 0, blush: 0 },
    smile: { brow: 0.15, tilt: 0, smile: 0.75, open: 0.92, mw: 1.05, blush: 0.4 },
    grin: { brow: 0.3, tilt: 0, smile: 1, open: 0.8, mw: 1.1, blush: 0.55 },
    worry: { brow: 0.35, tilt: 0.9, smile: -0.45, open: 1.04, mw: 0.9, blush: 0 },
    stress: { brow: 0.1, tilt: 0.7, smile: -0.7, open: 0.95, mw: 0.85, blush: 0.1 },
    think: { brow: 0.1, tilt: -0.2, smile: 0.0, open: 0.9, mw: 0.85, browL: 0.55 },
    surprise: { brow: 0.95, tilt: 0.2, smile: 0.1, open: 1.25, mw: 0.8, blush: 0 },
    relief: { brow: 0.1, tilt: 0.3, smile: 0.5, open: 0.7, mw: 1, blush: 0.25 },
    confident: { brow: 0.1, tilt: -0.25, smile: 0.55, open: 0.95, mw: 1.05, blush: 0.1 },
    frown: { brow: -0.3, tilt: -0.7, smile: -0.5, open: 0.9, mw: 0.9, blush: 0 },
    listen: { brow: 0.2, tilt: 0.1, smile: 0.3, open: 1, mw: 1, blush: 0.05 },
  };
  /* arm presets: [sh, el, up-scale, hand]  per side (outward-symmetric: sh>0 = away from body, el>0 = forearm folds up/in) */
  const ARM = {
    rest: [8, 10, 1, 'relax'], rest2: [14, 22, 1, 'relax'], desk: [22, 98, 1, 'relax'], type: [26, 104, 1, 'relax'], hold: [14, 112, 1, 'fist'],
    hold2: [8, 128, 0.9, 'fist'], talk: [30, 82, 1, 'open'], talkHi: [40, 100, 1, 'open'], palm: [34, 70, 1, 'open'], wide: [58, 60, 1, 'open'],
    point: [42, 70, 1, 'point'], pointUp: [30, 150, 1, 'point'], chin: [-6, 168, 0.62, 'fist'], hip: [48, -26, 1, 'relax'], cross: [-4, 128, 0.82, 'relax'], wave: [76, 130, 1, 'open'],
    shrug: [28, 86, 1, 'open'], phone: [6, 132, 0.8, 'fist'], present: [62, 24, 1, 'open'], heart: [4, 150, 0.7, 'open'],
  };
  FE.ARM = ARM; FE.EXPR = EXPR;

  /* ---------------- Actor ---------------- */
  function Actor(key, opts) {
    opts = opts || {};
    this.key = key; this.spec = FE.CHARS[key]; this.id = FE.uid('c');
    this.x = opts.x || 0; this.y = opts.y || 0; this.scale = opts.scale || 1;
    this.mirror = !!opts.mirror;
    this.sp = {};
    for (const k in PARAMS) this.sp[k] = new Spring(PARAMS[k][0], PARAMS[k][1], PARAMS[k][2]);
    this.hand = { L: 'relax', R: 'relax' };
    this.rand = FE.rng(FE.hash(key + (opts.seed || '')));
    this.nextBlink = 1.5 + this.rand() * 3; this.blinkT = -1;
    this.nextSacc = 1 + this.rand() * 2; this.nextShift = 4 + this.rand() * 4; this.shiftDir = 1;
    this.sacX = 0; this.sacY = 0; this.time = this.rand() * 10;
    this.talkLevel = 0; this.speaking = false; this.talkEnv = null; this.nextGesture = 0;
    this.hairLag = new Spring(0, 40, 6); this._lastHeadRot = 0; this.idleAmp = opts.idle == null ? 1 : opts.idle;
    this.cue = []; this.cached = {};
    const wrap = document.createElementNS(FE.SVGNS, 'g');
    wrap.setAttribute('class', 'actor actor-' + key);
    wrap.innerHTML = buildSVG(this.spec, this.id);
    this.el = wrap;
    const q = (s) => wrap.querySelector(s);
    this.r = {
      sway: q('.sway'), torso: q('.torso'), head: q('.head'), hd: q('.hd'), face: q('.face'), feat: q('.feat'), nose: q('.nose'), hairF: q('.hairF'), hairB: q('.hairB'),
      earL: q('.earL'), earR: q('.earR'), eyeL: q('.eye[data-s="-1"]'), eyeR: q('.eye[data-s="1"]'),
      irisL: q('.eye[data-s="-1"] .iris'), irisR: q('.eye[data-s="1"] .iris'), eoL: q('.eye[data-s="-1"] .eo'), eoR: q('.eye[data-s="1"] .eo'),
      brL: q('.brL'), brR: q('.brR'), mIn: q('.mIn'), mTeeth: q('.mTeeth'), mTongue: q('.mTongue'), mUp: q('.mUp'), mLo: q('.mLo'), mLine: q('.mLine'), mHi: q('.mHi'),
      armL: q('.armL'), armR: q('.armR'), chL: q('.chL'), chR: q('.chR'), ering: wrap.querySelectorAll('.ering'),
    };
    ['L', 'R'].forEach((s) => {
      const a = q('.arm' + s);
      this.r['up' + s] = a.querySelector('.up'); this.r['fore' + s] = a.querySelector('.fore'); this.r['hand' + s] = a.querySelector('.hand');
      this.r['hs' + s] = a.querySelector('.hs'); this.r['props' + s] = a.querySelector('.props');
    });
    this.handsSvg = hands(this.spec.skin);
    this.dims = dims(this.spec);
    this.setArms('rest', 'rest', true); this.expr('neutral', true);
    this.place(); this.render(true);
  }
  Actor.prototype.place = function () {
    const sc = this.scale, m = this.mirror ? -1 : 1;
    this.el.setAttribute('transform', `translate(${this.x} ${this.y}) scale(${sc * m} ${sc})`);
  };
  Actor.prototype.moveTo = function (x, y, scale) { this.x = x; this.y = y; if (scale) this.scale = scale; this.place(); };
  Actor.prototype.set = function (p, instant) {
    for (const k in p) {
      const s = this.sp[k]; if (!s) continue;
      s.t = p[k]; if (instant) { s.x = p[k]; s.v = 0; }
    }
    if (instant) this.render(true);
  };
  Actor.prototype.expr = function (name, instant) { const e = EXPR[name] || EXPR.neutral; this.exprName = name; this.set(Object.assign({ browL: 0 }, e), instant); };
  Actor.prototype.arm = function (side, name, instant, extra) {
    const a = ARM[name]; if (!a) return;
    const o = {}; o[side + 'sh'] = a[0]; o[side + 'el'] = a[1]; o[side + 'up'] = a[2]; o[side + 'wr'] = 0;
    if (extra) for (const k in extra) o[side + k] = extra[k];
    this.setHand(side, a[3]);
    this.set(o, instant);
  };
  Actor.prototype.setArms = function (l, r, instant) { this.arm('L', l, instant); this.arm('R', r || l, instant); };
  Actor.prototype.setHand = function (side, shape) {
    if (this.hand[side] === shape) return;
    this.hand[side] = shape; this.r['hs' + side].innerHTML = this.handsSvg[shape] || this.handsSvg.relax;
  };
  /* attach a prop (SVG string) to a hand; it follows the forearm */
  Actor.prototype.holdProp = function (side, svg, tf) {
    const p = this.r['props' + side]; p.innerHTML = svg ? `<g transform="${tf || ''}">${svg}</g>` : '';
  };
  Actor.prototype.look = function (gx, gy, facing) { const o = { gx: gx, gy: gy || 0 }; if (facing != null) o.facing = facing; this.set(o); };
  Actor.prototype.lookAtActor = function (other) {
    const dx = other.x - this.x; const f = clamp(dx / 650, -1, 1);
    this.set({ facing: f * 0.7, gx: clamp(f * 1.1, -1, 1), gy: 0, headRot: -f * 2.5 });
  };
  /* timed pose sequence: [[delaySec, fn(actor)], ...] — scheduled by the animation loop */
  Actor.prototype.seq = function (steps) { const t0 = this.time; steps.forEach(([d, fn]) => this.cue.push({ t: t0 + d, fn })); this.cue.sort((a, b) => a.t - b.t); };
  Actor.prototype.gesture = function (name) {
    const A = this;
    const G = {
      nod: () => A.seq([[0, () => A.set({ headY: 3, headRot: 1 })], [0.16, () => A.set({ headY: -2 })], [0.4, () => A.set({ headY: 0, headRot: 0 })]]),
      talk: () => { const s = A.rand() < 0.5 ? 'R' : 'L'; A.seq([[0, () => A.arm(s, 'rest2')], [0.14, () => A.arm(s, A.rand() < 0.5 ? 'talk' : 'talkHi')], [0.9, () => A.arm(s, 'rest2')]]); },
      both: () => A.seq([[0, () => A.setArms('rest2', 'rest2')], [0.15, () => A.setArms('palm', 'palm')], [1.1, () => A.setArms('rest2', 'rest2')]]),
      shrug: () => A.seq([[0, () => A.set({ headY: 2 })], [0.12, () => { A.setArms('shrug', 'shrug'); A.set({ headRot: 4, headY: -3 }); }], [1.1, () => { A.setArms('rest', 'rest'); A.set({ headRot: 0, headY: 0 }); }]]),
      point: () => A.seq([[0, () => A.arm('R', 'rest2')], [0.15, () => A.arm('R', 'point')], [1.3, () => A.arm('R', 'rest2')]]),
    };
    (G[name] || G.nod)();
  };
  Actor.prototype.setTalking = function (on, env) { this.speaking = !!on; this.talkEnv = on ? env || null : null; if (!on) this.set({ mouth: 0 }); };
  Actor.prototype.anchor = function (kind) {
    // stage coordinates of speech-bubble tail targets (beside the head, never on the face)
    const s = this.scale, hx = this.sp.headX.x + this.sp.sx.x, hy = this.sp.headY.x, f = this.sp.facing.x;
    const m = this.mirror ? -1 : 1;
    const side = kind === 'left' ? -1 : 1;
    return { x: this.x + m * (side * 78 + hx + f * 6) * s, y: this.y + (-150 + hy) * s };
  };
  Actor.prototype.mouthPos = function () { return { x: this.x + this.sp.facing.x * 15 * this.scale, y: this.y - 90 * this.scale }; };

  function setA(el, k, v) { el.setAttribute(k, v); }
  Actor.prototype.update = function (dt, lvl) {
    this._lvl = lvl; this.time += dt; const t = this.time;
    const B = this.sp;
    if (this.idleAmp > 0) {
      // blink
      if (this.blinkT < 0 && t > this.nextBlink) { this.blinkT = 0; this.nextBlink = t + 2.4 + this.rand() * 3.6; if (this.rand() < 0.18) this.nextBlink = t + 0.5; }
      if (this.blinkT >= 0) { this.blinkT += dt / 0.15; if (this.blinkT >= 1) this.blinkT = -1; }
      // micro-saccades
      if (t > this.nextSacc) { this.sacX = (this.rand() - 0.5) * 0.18; this.sacY = (this.rand() - 0.5) * 0.12; this.nextSacc = t + 1.1 + this.rand() * 2.4; }
      // weight shift
      if (t > this.nextShift) { this.shiftDir *= -1; B.sx.t = (this.baseSx || 0) + this.shiftDir * 3.5 * this.idleAmp; B.lean.t = (this.baseLean || 0) + this.shiftDir * 0.9 * this.idleAmp; this.nextShift = t + 5 + this.rand() * 5; }
    }
    if (this.speaking) {
      if (t > this.nextGesture && !this.noGesture) { this.nextGesture = t + 1.3 + this.rand() * 1.5; const r = this.rand(); this.gesture(r < 0.45 ? 'talk' : r < 0.7 ? 'nod' : r < 0.82 ? 'both' : 'talk'); }
    }
    while (this.cue.length && this.cue[0].t <= t) this.cue.shift().fn(this);
    for (const k in B) B[k].step(dt);
    this.render(false);
  };
  Actor.prototype.render = function (force) {
    const B = this.sp, r = this.r, d = this.dims;
    const t = this.time;
    const breath = Math.sin(t * 1.6) * this.idleAmp;
    const f = B.facing.x, af = Math.abs(f);
    const hRot = B.headRot.x;
    // hair secondary motion
    this.hairLag.t = (hRot * 0.5) + (B.headX.x * 0.12);
    this.hairLag.step(1 / 60);
    const hairSway = this.hairLag.x - hRot * 0.5;
    // body
    r.sway.setAttribute('transform', `translate(${(B.sx.x).toFixed(2)} 0) rotate(${B.lean.x.toFixed(2)} 0 270)`);
    r.torso.setAttribute('transform', `translate(0 ${(-breath * 0.8).toFixed(2)}) scale(${(1 - af * 0.06).toFixed(3)} ${(1 + breath * 0.004).toFixed(4)})`);
    const hy = B.headY.x - breath * 1.1;
    r.head.setAttribute('transform', `translate(${(B.headX.x + f * 3).toFixed(2)} ${(hy - 30).toFixed(2)})`);
    r.hd.setAttribute('transform', `rotate(${hRot.toFixed(2)} 0 -30) translate(0 30)`);
    r.hairF.setAttribute('transform', `translate(${(f * 7).toFixed(2)} 0) rotate(${(hairSway * 0.8).toFixed(2)} 0 -190)`);
    r.hairB.setAttribute('transform', `translate(${(f * 3).toFixed(2)} ${(hy - 30).toFixed(2)}) rotate(${(-hairSway * 0.5).toFixed(2)} 0 -100)`);
    r.hairB.firstElementChild.setAttribute('transform', 'translate(0 30)');
    // face parallax
    r.face.setAttribute('transform', `translate(${(f * 5).toFixed(2)} 0) scale(${(1 - af * 0.05).toFixed(3)} 1)`);
    r.feat.setAttribute('transform', `translate(${(f * 12).toFixed(2)} 0)`);
    r.nose.setAttribute('transform', `translate(${(f * 7).toFixed(2)} 0)`);
    r.earL.setAttribute('transform', `translate(${(f * 9 + Math.max(0, f) * 13).toFixed(1)} 0)`); r.earR.setAttribute('transform', `translate(${(f * 9 + Math.min(0, f) * 13).toFixed(1)} 0)`);
    r.ering.forEach((e) => e.setAttribute('transform', `rotate(${(-hairSway * 1.2).toFixed(2)} 0 -86)`));
    // eyes
    let blink = 1; if (this.blinkT >= 0) blink = 1 - Math.sin(this.blinkT * Math.PI) * 0.94;
    const open = clamp(B.open.x, 0.1, 1.3) * blink;
    const gx = clamp(B.gx.x + this.sacX + f * 0.35, -1.2, 1.2) * 5, gy = clamp(B.gy.x + this.sacY, -1, 1) * 3.6;
    const sxL = 1 - Math.max(0, f) * 0.22 + Math.max(0, -f) * 0.06, sxR = 1 - Math.max(0, -f) * 0.22 + Math.max(0, f) * 0.06;
    r.eyeL.setAttribute('transform', `translate(-28 -112) scale(${(sxL * 1.08).toFixed(3)} 1.08)`);
    r.eyeR.setAttribute('transform', `translate(28 -112) scale(${(sxR * 1.08).toFixed(3)} 1.08)`);
    r.eoL.setAttribute('transform', `scale(1 ${open.toFixed(3)})`); r.eoR.setAttribute('transform', `scale(1 ${open.toFixed(3)})`);
    r.irisL.setAttribute('transform', `translate(${gx.toFixed(2)} ${gy.toFixed(2)})`); r.irisR.setAttribute('transform', `translate(${gx.toFixed(2)} ${gy.toFixed(2)})`);
    // brows
    const br = B.brow.x, tl = B.tilt.x, bl = B.browL.x;
    const brow = (s, extra) => {
      const cx = s * 28, ix = cx - s * 17, ox = cx + s * 19;
      const yb = -134 - br * 7 - extra * 6;
      const yi = yb + 2 - tl * 5.5, yo = yb + 3 + tl * 3.5, ym = yb - 3.5 - (tl < 0 ? tl * 2 : 0) + 0;
      const th = 5.2;
      return `M${ix} ${yi}Q${cx - s * 2} ${ym - 3} ${ox} ${yo}L${ox} ${yo + 2.4}Q${cx} ${ym + th - 1} ${ix} ${yi + th}Z`;
    };
    r.brL.setAttribute('d', brow(-1, bl)); r.brR.setAttribute('d', brow(1, 0));
    // cheeks
    const bl2 = clamp(B.blush.x, 0, 1);
    r.chL.setAttribute('opacity', (0.45 + bl2 * 0.8).toFixed(2)); r.chR.setAttribute('opacity', (0.45 + bl2 * 0.8).toFixed(2));
    // mouth
    let mo = B.mouth.x;
    if (this.speaking) {
      const lv = this._lvl != null ? this._lvl : this.talkLevel; mo = Math.max(mo, lv);
    }
    mo = clamp(mo, 0, 1);
    const w = 19 * B.mw.x * (1 - mo * 0.12), sm = clamp(B.smile.x, -1, 1.2);
    const y0 = -58 + (mo * 1.5), cy = sm * 6.2;
    const L = [-w, y0 - cy * 0.9], R = [w, y0 - cy * 0.9];
    const gap = mo * 15 + (sm > 0.5 ? (sm - 0.5) * 3 : 0);
    const upY = y0 - 2.2 + (sm > 0 ? -sm * 0.8 : 0), loY = y0 + 3.2 + gap + (sm > 0 ? sm * 1.5 : 0);
    const upper = `M${L[0]} ${L[1]}C${-w * 0.55} ${upY - 4.2} ${-w * 0.2} ${upY - 5.2} 0 ${upY - 3.2}C${w * 0.2} ${upY - 5.2} ${w * 0.55} ${upY - 4.2} ${R[0]} ${R[1]}C${w * 0.5} ${upY + 1.2 + gap * 0.0} ${-w * 0.5} ${upY + 1.2} ${L[0]} ${L[1]}Z`;
    const lower = `M${L[0]} ${L[1]}C${-w * 0.5} ${loY + 6.5 + cy * -0.2} ${w * 0.5} ${loY + 6.5 + cy * -0.2} ${R[0]} ${R[1]}C${w * 0.5} ${loY - 0.5 + gap * 0.0} ${-w * 0.5} ${loY - 0.5} ${L[0]} ${L[1]}Z`;
    const inner = `M${L[0] + 1.5} ${L[1]}C${-w * 0.5} ${upY + 1.2} ${w * 0.5} ${upY + 1.2} ${R[0] - 1.5} ${R[1]}C${w * 0.5} ${loY - 0.2} ${-w * 0.5} ${loY - 0.2} ${L[0] + 1.5} ${L[1]}Z`;
    if (gap > 1.2) {
      setA(r.mIn, 'd', inner);
      setA(r.mTeeth, 'd', `M${L[0] + 3} ${L[1]}C${-w * 0.5} ${upY + 1.2} ${w * 0.5} ${upY + 1.2} ${R[0] - 3} ${R[1]}L${R[0] - 4} ${upY + 2.2 + Math.min(5, gap * 0.45)}C${w * 0.4} ${upY + 3 + Math.min(5, gap * 0.45)} ${-w * 0.4} ${upY + 3 + Math.min(5, gap * 0.45)} ${L[0] + 4} ${upY + 2.2 + Math.min(5, gap * 0.45)}Z`);
      setA(r.mTongue, 'd', `M${-w * 0.45} ${loY + 0.5}C${-w * 0.2} ${loY - gap * 0.45} ${w * 0.2} ${loY - gap * 0.45} ${w * 0.45} ${loY + 0.5}Z`);
      setA(r.mLine, 'd', '');
    } else {
      setA(r.mIn, 'd', ''); setA(r.mTeeth, 'd', ''); setA(r.mTongue, 'd', '');
      setA(r.mLine, 'd', `M${L[0]} ${L[1]}C${-w * 0.4} ${y0 + 1 - cy * 0.2} ${w * 0.4} ${y0 + 1 - cy * 0.2} ${R[0]} ${R[1]}`);
    }
    setA(r.mUp, 'd', upper); setA(r.mLo, 'd', lower);
    setA(r.mHi, 'd', `M${-w * 0.35} ${loY + 3.4}Q0 ${loY + 5.4} ${w * 0.35} ${loY + 3.4}`);
    // arms
    const ar = d.ar, sx = d.sw - ar * 0.55;
    ['L', 'R'].forEach((s) => {
      const sg = s === 'L' ? -1 : 1;
      const sh = B[s + 'sh'].x + Math.sin(t * 1.6 + (s === 'L' ? 0 : 0.7)) * 0.5 * this.idleAmp, el = B[s + 'el'].x, up = B[s + 'up'].x;
      const armEl = r['arm' + s];
      armEl.setAttribute('transform', `translate(${sg * sx} ${(24 - breath * 0.8).toFixed(2)}) scale(${sg} 1) rotate(${(-sh).toFixed(2)})`);
      r['up' + s].setAttribute('transform', `scale(1 ${up.toFixed(3)})`);
      r['fore' + s].setAttribute('transform', `translate(0 ${(112).toFixed(1)}) scale(1 ${(1 / up).toFixed(3)}) rotate(${el.toFixed(2)})`);
      r['hand' + s].setAttribute('transform', `translate(0 102) rotate(${B[s + 'wr'].x.toFixed(1)})`);
    });
  };

  /* ---------------- shared animation loop ---------------- */
  const Loop = {
    actors: new Set(), raf: 0, last: 0, run: false, hooks: new Set(),
    add(a) { this.actors.add(a); }, remove(a) { this.actors.delete(a); }, clear() { this.actors.clear(); this.hooks.clear(); },
    start() { if (this.run) return; this.run = true; this.last = performance.now(); const tick = (now) => { if (!this.run) return; const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now; this.frame(dt); this.raf = requestAnimationFrame(tick); }; this.raf = requestAnimationFrame(tick); },
    stop() { this.run = false; cancelAnimationFrame(this.raf); },
    frame(dt) {
      const lv = FE.audio && FE.audio.mouthLevel ? FE.audio.mouthLevel() : null;
      this.actors.forEach((a) => a.update(dt, a.speaking ? lv : null));
      this.hooks.forEach((h) => h(dt));
    },
    step(dt) { this.frame(dt); },
  };
  FE.Loop = Loop; FE.Actor = Actor;
})(window);
