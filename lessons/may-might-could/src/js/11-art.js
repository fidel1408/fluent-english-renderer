/* 11-art: high-detail character art (face, brows, mouth, neck, ears). Drawn entirely in code.
   Coordinates: head-local, centre (0,0); features sit at eyes y≈-3, nose tip y≈14, mouth y≈29, chin y≈57. */
(function () {
  'use strict';
  const FE = window.FE, { el } = FE;
  const Art = (FE.Art = {});
  const SH = FE.shade;
  const f1 = (n) => (+n).toFixed(1);

  /* skin palette with warm shadows and cool-ish highlights (never plain grey) */
  Art.tone = (skin) => ({
    base: skin, hi: SH(skin, 0.1, 0.0, 3), hi2: SH(skin, 0.17, -0.03, 4), lo: SH(skin, -0.09, 0.05, -4), deep: SH(skin, -0.2, 0.1, -8), blood: SH(skin, -0.02, 0.18, -12),
  });

  /* head silhouette: forehead, temples, cheekbones, jaw angle, chin. j = jaw width, fem = softer chin */
  Art.headPoints = (j, fem) => {
    const jx = 30.5 * j, cx = fem ? 9 : 11, cy = fem ? 55.5 : 57;
    return { jx, cx, cy };
  };
  Art.headPath = (j, fem) => {
    const { jx, cx, cy } = Art.headPoints(j, fem);
    const R = `M0,-55 C19,-55 35,-48 41,-33 C44.5,-24 45,-12 43.5,-1 C42,13 ${jx + 8},29 ${jx},41 C${jx - 7},51 ${cx},${cy} 0,${cy + 0.6}`;
    const L = ` C${-cx},${cy} ${-(jx - 7)},51 ${-jx},41 C${-(jx + 8)},29 -42,13 -43.5,-1 C-45,-12 -44.5,-24 -41,-33 C-35,-48 -19,-55 0,-55Z`;
    return R + L;
  };

  /* ================= HEAD ================= */
  Art.head = (c) => {
    const d = c.def, u = c.uid, T = Art.tone(d.skin), fem = d.build === 'f';
    const g = (c.faceG = el('g', { transform: 'translate(0,-490) scale(1,0.93)' }));
    c.head.innerHTML = ''; c.hairBack.innerHTML = '';
    const hairDef = Art.hair(c);
    const hb = el('g', { transform: 'translate(0,-490) scale(1,0.93)' }); hb.innerHTML = hairDef.back; c.hairBack.appendChild(hb);
    c.head.appendChild(g);
    const hp = Art.headPath(d.jaw || 1, fem);
    const lip = d.lip, lipHi = SH(lip, 0.1, -0.05), lipLo = SH(lip, -0.12, 0.05), irisC = d.eye;
    c.defs.insertAdjacentHTML('beforeend', `
      <clipPath id="${u}hc"><path d="${hp}"/></clipPath>
      <linearGradient id="${u}sk" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="${T.hi}"/><stop offset=".45" stop-color="${T.base}"/><stop offset="1" stop-color="${T.lo}"/></linearGradient>
      <linearGradient id="${u}side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.deep}" stop-opacity=".0"/><stop offset=".72" stop-color="${T.deep}" stop-opacity=".0"/><stop offset="1" stop-color="${T.deep}" stop-opacity=".42"/></linearGradient>
      <linearGradient id="${u}jaw" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="${T.deep}" stop-opacity="0"/><stop offset="1" stop-color="${T.deep}" stop-opacity=".34"/></linearGradient>
      <radialGradient id="${u}soft" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}dark" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${T.deep}" stop-opacity=".55"/><stop offset="1" stop-color="${T.deep}" stop-opacity="0"/></radialGradient>
      <radialGradient id="${u}blood" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${d.blush || T.blood}" stop-opacity=".42"/><stop offset="1" stop-color="${d.blush || T.blood}" stop-opacity="0"/></radialGradient>
      <linearGradient id="${u}scl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bdb2aa"/><stop offset=".3" stop-color="#f1ece6"/><stop offset="1" stop-color="#fdfaf6"/></linearGradient>
      <radialGradient id="${u}iris" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="${SH(irisC, 0.2, 0.05)}"/><stop offset=".55" stop-color="${irisC}"/><stop offset="1" stop-color="${SH(irisC, -0.22, 0.05)}"/></radialGradient>
      <linearGradient id="${u}lidsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0f0b" stop-opacity=".55"/><stop offset="1" stop-color="#1a0f0b" stop-opacity="0"/></linearGradient>
      <linearGradient id="${u}lipU" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lipLo}"/><stop offset="1" stop-color="${lip}"/></linearGradient>
      <linearGradient id="${u}lipL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lip}"/><stop offset=".6" stop-color="${lipHi}"/><stop offset="1" stop-color="${SH(lip, 0.03)}"/></linearGradient>
      <linearGradient id="${u}teeth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffefb"/><stop offset="1" stop-color="#e6dfd4"/></linearGradient>
      <radialGradient id="${u}mouthd" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#6b2a30"/><stop offset="1" stop-color="#2c0d12"/></radialGradient>
      <clipPath id="${u}mc"><path id="${u}mpath" d=""/></clipPath>
      <clipPath id="${u}eL"><path d="${Art.eyePath(-17, -1)}"/></clipPath><clipPath id="${u}eR"><path d="${Art.eyePath(17, 1)}"/></clipPath>`);
    let s = '';
    // ears first (behind the face)
    const ear = (sx) => `<g transform="translate(${sx * 42.5},-1) scale(${sx},1)">
        <path d="M-1,-11 C5,-13 10,-7 9,0 C8,6 5,11 1,13 C-1,14 -2,12 -2,10Z" fill="${T.base}"/>
        <path d="M-1,-11 C5,-13 10,-7 9,0 C8,6 5,11 1,13" fill="none" stroke="${T.lo}" stroke-width="1.4" opacity=".7"/>
        <path d="M1.5,-6 C5,-6 6.5,-2 5.5,2 C5,5 3,7 1.5,8" fill="none" stroke="${T.deep}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
        <ellipse cx="3" cy="-1" rx="3" ry="6" fill="${T.blood}" opacity=".16"/>
        <ellipse cx="1" cy="11" rx="2.6" ry="2.2" fill="${T.hi}" opacity=".5"/></g>`;
    s += ear(-1) + ear(1);
    // head base + sculpted shading (all clipped to the head)
    s += `<path d="${hp}" fill="url(#${u}sk)"/><g clip-path="url(#${u}hc)">
      <rect x="-50" y="-60" width="100" height="125" fill="url(#${u}side)"/>
      <rect x="-50" y="-60" width="100" height="125" fill="url(#${u}jaw)"/>
      <ellipse cx="-30" cy="-26" rx="16" ry="8" fill="url(#${u}soft)" opacity=".5"/>
      <ellipse cx="-4" cy="-37" rx="22" ry="9" fill="url(#${u}soft)" opacity=".55"/>
      <ellipse cx="-17" cy="-4" rx="17" ry="10" fill="url(#${u}dark)" opacity=".55"/><ellipse cx="17" cy="-4" rx="17" ry="10" fill="url(#${u}dark)" opacity=".62"/>
      <ellipse cx="-25" cy="8" rx="11" ry="6.5" fill="url(#${u}soft)" opacity=".55"/><ellipse cx="25" cy="8" rx="11" ry="6.5" fill="url(#${u}soft)" opacity=".28"/>
      <ellipse cx="-27" cy="16" rx="13" ry="9" fill="url(#${u}blood)"/><ellipse cx="27" cy="16" rx="13" ry="9" fill="url(#${u}blood)"/>
      <path d="M-2,-12 C-3,-4 -4,4 -6,11" stroke="${T.deep}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".1"/>
      <path d="M4,-12 C5,-4 6,4 7,11" stroke="${T.deep}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".16"/>
      <ellipse cx="0" cy="${fem ? 51 : 52}" rx="9" ry="4" fill="url(#${u}soft)" opacity=".28"/>
      <path d="M-34,-44 C-20,-54 18,-55 34,-44" stroke="${T.deep}" stroke-width="12" fill="none" opacity=".12"/>
      <path d="M42,-24 C46,-8 44,12 38,30" stroke="${T.hi2}" stroke-width="2.4" fill="none" opacity=".5" stroke-linecap="round"/>
    </g>`;
    // under-eye + creases (subtle realism)
    s += `<g fill="none" stroke-linecap="round" stroke="${T.deep}">
      <path d="M-26,3 C-20,6.2 -13,6 -9,3.6" stroke-width="1" opacity=".22"/><path d="M26,3 C20,6.2 13,6 9,3.6" stroke-width="1" opacity=".26"/>
      <path d="M-14,19 C-17,26 -16,31 -12,35" stroke-width="1.2" opacity=".2"/><path d="M14,19 C17,26 16,31 12,35" stroke-width="1.2" opacity=".24"/></g>`;
    // nose: bridge shading, nostrils, alae, tip highlight, cast shadow
    s += `<g>
      <ellipse cx="0" cy="12.6" rx="3.9" ry="3" fill="${T.hi2}" opacity=".5"/>
      <path d="M-7.8,13.6 C-8.8,16 -6.2,18.4 -3.6,18 C-2.6,17.8 -2.2,16.2 -2.6,14.6" fill="none" stroke="${T.deep}" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>
      <path d="M7.8,13.6 C8.8,16 6.2,18.4 3.6,18 C2.6,17.8 2.2,16.2 2.6,14.6" fill="none" stroke="${T.deep}" stroke-width="1.5" stroke-linecap="round" opacity=".62"/>
      <ellipse cx="-3.9" cy="17" rx="1.9" ry="1.2" fill="#2a1410" opacity=".55"/><ellipse cx="3.9" cy="17" rx="1.9" ry="1.2" fill="#2a1410" opacity=".6"/>
      <ellipse cx="0" cy="20.6" rx="6.4" ry="1.9" fill="${T.deep}" opacity=".22"/>
      <path d="M-1.4,22 C-1.8,24.6 -1.6,26 -1,26.8M1.4,22 C1.8,24.6 1.6,26 1,26.8" stroke="${T.deep}" stroke-width=".9" fill="none" opacity=".18"/></g>`;
    g.innerHTML = s;
    // eyes
    const eyes = el('g'); g.appendChild(eyes);
    eyes.innerHTML = Art.eye(c, -17, -1) + Art.eye(c, 17, 1);
    c.irisEls = FE.$$('.iris', eyes); c.lidEls = FE.$$('.lid', eyes); c.lashEls = FE.$$('.lash', eyes);
    // brows (hair-stroke detail; transformed per frame)
    c.browL = Art.brow(c, -1); c.browR = Art.brow(c, 1); g.appendChild(c.browL); g.appendChild(c.browR);
    // mouth
    c.mouthG = el('g'); g.appendChild(c.mouthG);
    c.mouthG.innerHTML = `<ellipse cx="0" cy="38" rx="9" ry="2.6" fill="${T.deep}" opacity=".18"/><ellipse cx="0" cy="47" rx="10" ry="4" fill="url(#${u}soft)" opacity=".22"/>
      <path class="mI" fill="url(#${u}mouthd)"/><g clip-path="url(#${u}mc)"><rect class="mT" fill="url(#${u}teeth)"/><ellipse class="mG" fill="#c9606b"/><ellipse class="mG2" fill="#e08a92" opacity=".55"/></g>
      <path class="mL" fill="url(#${u}lipL)"/><path class="mU" fill="url(#${u}lipU)"/><path class="mLine" fill="none" stroke="${SH(lip, -0.3, 0.05)}" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>
      <ellipse class="mH" fill="#fff" opacity=".3"/><path class="mDim" fill="none" stroke="${T.deep}" stroke-width="1" stroke-linecap="round" opacity="0"/>`;
    ['mI', 'mT', 'mG', 'mG2', 'mL', 'mU', 'mLine', 'mH', 'mDim'].forEach((k) => { c['m_' + k] = c.mouthG.querySelector('.' + k); });
    c.mpath = c.defs.querySelector(`#${u}mpath`);
    // stubble / beard / moustache
    if (d.beard) {
      const bc = d.beard; let strokes = ''; const r = FE.rng(21);
      for (let i = 0; i < 90; i++) { const x = (r() - 0.5) * 80, y = 8 + r() * 52; if (Math.abs(x) < 40 - (y - 8) * 0.18 && y > 14 + Math.abs(x) * 0.15) strokes += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x + (r() - 0.5) * 2)}" y2="${f1(y + 2.6)}" stroke="${SH(bc, 0.07)}" stroke-width=".7" opacity=".55"/>`; }
      g.insertAdjacentHTML('beforeend', `<g clip-path="url(#${u}hc)"><path fill-rule="evenodd" d="M-43,-2 C-47,32 -26,60 0,62 C26,60 47,32 43,-2 C38,16 28,28 15,32 C6,28 -6,28 -15,32 C-28,28 -38,16 -43,-2Z M-14,22 C-8,35 8,35 14,22 C8,16 -8,16 -14,22Z" fill="${bc}" opacity=".96"/>${strokes}<path d="M-43,-2 C-47,32 -26,60 0,62 C26,60 47,32 43,-2" fill="none" stroke="${SH(bc, 0.1)}" stroke-width="1.2" opacity=".35"/></g>`);
    }
    if (d.mustache) g.insertAdjacentHTML('beforeend', `<path d="M-18,24 C-11,14 -3,17 0,21 C3,17 11,14 18,24 C11,31 4,26 0,26 C-4,26 -11,31 -18,24Z" fill="${d.mustache}"/><path d="M-14,21 C-8,17 -3,19 0,22M14,21 C8,17 3,19 0,22" stroke="${SH(d.mustache, 0.12)}" stroke-width=".8" fill="none" opacity=".6"/>`);
    // hair in front
    const hf = el('g'); hf.innerHTML = hairDef.front; g.appendChild(hf);
    if (d.glasses) g.appendChild(el('g', {}, `<g fill="${d.glassTint || 'rgba(170,215,255,.14)'}" stroke="${d.glasses}" stroke-width="3" stroke-linejoin="round"><rect x="-33.5" y="-16.5" width="28" height="22" rx="7"/><rect x="5.5" y="-16.5" width="28" height="22" rx="7"/></g>
      <path d="M-5.5,-8 C-2,-11 2,-11 5.5,-8" stroke="${d.glasses}" stroke-width="2.6" fill="none"/><path d="M-33.5,-9 L-43,-8M33.5,-9 L43,-8" stroke="${d.glasses}" stroke-width="2.6"/>
      <path d="M-30,-12.5 L-21,-12.5M9,-12.5 L18,-12.5" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/><path d="M-11,2 L-8,-6M28,2 L31,-6" stroke="#fff" stroke-opacity=".28" stroke-width="1.6" stroke-linecap="round"/>`));
    if (d.earring) g.appendChild(el('g', {}, `<circle cx="-43" cy="13" r="3.3" fill="${d.earring}"/><circle cx="43" cy="13" r="3.3" fill="${d.earring}"/><circle cx="-44" cy="12" r="1" fill="#fff" opacity=".8"/><circle cx="42" cy="12" r="1" fill="#fff" opacity=".8"/>`));
  };

  /* ================= EYES ================= */
  Art.eyePath = (cx, s) => { const X = (dx) => cx + s * dx; return `M${f1(X(-10.4))},-2.4 C${f1(X(-6))},-9.4 ${f1(X(4))},-11.2 ${f1(X(11.2))},-4.4 C${f1(X(6))},3.2 ${f1(X(-5))},4.4 ${f1(X(-10.4))},-2.4Z`; };
  Art.eye = (c, cx, s) => {
    const d = c.def, u = c.uid, T = Art.tone(d.skin), X = (dx) => cx + s * dx, fem = d.build === 'f';
    const clip = `${u}${s < 0 ? 'eL' : 'eR'}`, lashC = d.lash || '#17110f';
    let fibers = ''; for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; fibers += `<line x1="${f1(cx + Math.cos(a) * 2.7)}" y1="${f1(-3 + Math.sin(a) * 2.7)}" x2="${f1(cx + Math.cos(a) * 5.1)}" y2="${f1(-3 + Math.sin(a) * 5.1)}" stroke="${SH(d.eye, 0.25)}" stroke-width=".5" opacity=".32"/>`; }
    let lashes = '';
    const n = fem ? 6 : 0;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), px = -2 + t * 13, py = -10.6 + Math.pow(t - 0.1, 2) * 4 + t * 5.4; lashes += `<path d="M${f1(X(px))},${f1(py)} q${f1(s * (0.8 + t * 1.2))},${f1(-1.6 - t * 0.4)} ${f1(s * (1.5 + t * 2.1))},${f1(-1.6 + t * 1.5)}" stroke="${lashC}" stroke-width="1" fill="none" stroke-linecap="round"/>`; }
    return `<g>
      <path d="${Art.eyePath(cx, s)}" fill="url(#${u}scl)"/>
      <g clip-path="url(#${clip})">
        <g class="iris"><circle cx="${cx}" cy="-3" r="5.9" fill="url(#${u}iris)"/>${fibers}<circle cx="${cx}" cy="-3" r="5.9" fill="none" stroke="${SH(d.eye, -0.32)}" stroke-width="1.5" opacity=".75"/>
          <circle cx="${cx}" cy="-3" r="2.5" fill="#080606"/><path d="M${f1(cx - 5.2)},-6.4 C${f1(cx - 2)},-9.6 ${f1(cx + 2)},-9.6 ${f1(cx + 5.2)},-6.4Z" fill="#000" opacity=".16"/>
          <ellipse cx="${f1(cx - 2)}" cy="-5.1" rx="1.8" ry="1.5" fill="#fff" opacity=".95"/><circle cx="${f1(cx + 2)}" cy="-1.3" r=".85" fill="#fff" opacity=".7"/><ellipse cx="${f1(cx + 1.6)}" cy="0.2" rx="2.6" ry="1.1" fill="#fff" opacity=".12"/></g>
        <rect x="${f1(cx - 13)}" y="-11" width="26" height="6.6" fill="url(#${u}lidsh)"/>
        <ellipse cx="${f1(X(-9.4))}" cy="-2" rx="1.7" ry="1.4" fill="#e59c98" opacity=".85"/>
        <rect class="lid" x="${f1(cx - 14)}" y="-27" width="28" height="17" fill="${T.base}"/>
      </g>
      <g class="lash"><path d="M${f1(X(-10.8))},-2.2 C${f1(X(-6))},-10 ${f1(X(4))},-11.8 ${f1(X(11.6))},-4.2 C${f1(X(5))},-8.6 ${f1(X(-5))},-8.4 ${f1(X(-10.8))},-2.2Z" fill="${lashC}"/>${lashes}
        <path d="M${f1(X(-9))},-10.6 C${f1(X(-3))},-13.6 ${f1(X(6))},-13 ${f1(X(12))},-8" fill="none" stroke="${T.deep}" stroke-width="1" opacity=".5" stroke-linecap="round"/></g>
      <path d="M${f1(X(-8))},3.2 C${f1(X(-3))},5 ${f1(X(4))},4.4 ${f1(X(9))},0.6" fill="none" stroke="${lashC}" stroke-width=".7" opacity=".28" stroke-linecap="round"/>
    </g>`;
  };

  /* ================= EYEBROWS (hair strokes) ================= */
  Art.brow = (c, sx) => {
    const d = c.def, bc = d.browColor || SH(d.hair.color, -0.04, 0.02), fem = d.build === 'f', hl = SH(bc, 0.12);
    const thick = fem ? 0.82 : 1.12;
    const P = (t) => { const a = 1 - t; return [a * a * a * 6 + 3 * a * a * t * 12 + 3 * a * t * t * 21 + t * t * t * 30, a * a * a * -18.6 + 3 * a * a * t * -24.4 + 3 * a * t * t * -25.4 + t * t * t * -20.2]; };
    let top = '', bot = '';
    for (let i = 0; i <= 10; i++) { const t = i / 10, [x, y] = P(t), w = (1 - Math.pow(t, 1.6)) * 3.2 * thick + 0.5; top += `${i ? 'L' : 'M'}${f1(x)},${f1(y - w)} `; }
    for (let i = 10; i >= 0; i--) { const t = i / 10, [x, y] = P(t), w = (1 - Math.pow(t, 1.6)) * 3.2 * thick + 0.5; bot += `L${f1(x)},${f1(y + w * 0.9)} `; }
    let hairs = ''; const r = FE.rng(sx > 0 ? 5 : 9);
    for (let i = 0; i < 22; i++) { const t = r(), [x, y] = P(t), a = (-0.5 + t * 0.9) + (r() - 0.5) * 0.4; hairs += `<path d="M${f1(x - 1.2)},${f1(y + 1.2 + r())} l${f1(Math.cos(a) * 3.8)},${f1(Math.sin(a) * 3.8 - 1.4)}" stroke="${r() > 0.5 ? hl : bc}" stroke-width=".75" stroke-linecap="round" opacity=".8" fill="none"/>`; }
    const g = el('g', {}, `<g transform="scale(${sx},1)"><path d="${top}${bot}Z" fill="${bc}" opacity=".9"/>${hairs}</g>`);
    g.dataset.sx = sx; return g;
  };
  Art.brows = (c, raise, ang) => {
    [c.browL, c.browR].forEach((b) => {
      const sx = +b.dataset.sx, dy = -raise * 4.6, rot = -sx * 9 * ang + (ang < 0 ? sx * 2 : 0);
      b.setAttribute('transform', `translate(0,${f1(dy)}) rotate(${f1(rot)} ${f1(sx * 6)} -19)`);
    });
  };

  /* ================= MOUTH ================= */
  Art.mouth = (c, o, sm, mw) => {
    const w = (10.6 + sm * 3.1) * mw * (1 - Math.max(0, o - 0.55) * 0.2), cy = 29, cyc = cy - sm * 2.9, drop = o * 15.5;
    const up = `M${f1(-w)},${f1(cyc)} Q${f1(-w * .62)},${f1(cy - 6.6)} ${f1(-w * .34)},${f1(cy - 5.9)} Q${f1(-w * .14)},${f1(cy - 6)} 0,${f1(cy - 4.1)} Q${f1(w * .14)},${f1(cy - 6)} ${f1(w * .34)},${f1(cy - 5.9)} Q${f1(w * .62)},${f1(cy - 6.6)} ${f1(w)},${f1(cyc)} Q${f1(w * .5)},${f1(cy + 1)} 0,${f1(cy + .7)} Q${f1(-w * .5)},${f1(cy + 1)} ${f1(-w)},${f1(cyc)}Z`;
    const ty = cy + 0.7 + drop * 0.82, tyc = cy + 1 + drop * 0.78;
    const lo = `M${f1(-w * .96)},${f1(cyc + .3)} Q${f1(-w * .5)},${f1(tyc)} 0,${f1(ty)} Q${f1(w * .5)},${f1(tyc)} ${f1(w * .96)},${f1(cyc + .3)} Q${f1(w * .56)},${f1(cy + 8.6 + drop)} 0,${f1(cy + 9 + drop)} Q${f1(-w * .56)},${f1(cy + 8.6 + drop)} ${f1(-w * .96)},${f1(cyc + .3)}Z`;
    c.m_mU.setAttribute('d', up); c.m_mL.setAttribute('d', lo);
    c.m_mH.setAttribute('cx', 0); c.m_mH.setAttribute('cy', f1(cy + 5 + drop * 0.9)); c.m_mH.setAttribute('rx', f1(w * 0.34)); c.m_mH.setAttribute('ry', 1.4);
    if (o < 0.06) {
      c.m_mI.setAttribute('d', ''); c.mpath.setAttribute('d', ''); c.m_mT.setAttribute('width', 0); c.m_mG.setAttribute('rx', 0); c.m_mG2.setAttribute('rx', 0);
      c.m_mLine.setAttribute('d', `M${f1(-w)},${f1(cyc)} Q${f1(-w * .5)},${f1(cy + 1.1)} 0,${f1(cy + .8)} Q${f1(w * .5)},${f1(cy + 1.1)} ${f1(w)},${f1(cyc)}`);
    } else {
      const inner = `M${f1(-w)},${f1(cyc)} Q${f1(-w * .5)},${f1(cy + 1)} 0,${f1(cy + .7)} Q${f1(w * .5)},${f1(cy + 1)} ${f1(w)},${f1(cyc)} Q${f1(w * .5)},${f1(tyc)} 0,${f1(ty)} Q${f1(-w * .5)},${f1(tyc)} ${f1(-w)},${f1(cyc)}Z`;
      c.m_mI.setAttribute('d', inner); c.mpath.setAttribute('d', inner);
      c.m_mT.setAttribute('x', f1(-w * .8)); c.m_mT.setAttribute('y', f1(cy + .2)); c.m_mT.setAttribute('width', f1(w * 1.6)); c.m_mT.setAttribute('height', f1(Math.min(5.6, drop * 0.6 + 1)));
      c.m_mG.setAttribute('cx', 0); c.m_mG.setAttribute('cy', f1(ty + 1.5)); c.m_mG.setAttribute('rx', f1(w * 0.62)); c.m_mG.setAttribute('ry', f1(Math.max(0.1, drop * 0.5)));
      c.m_mG2.setAttribute('cx', 0); c.m_mG2.setAttribute('cy', f1(ty - 0.4)); c.m_mG2.setAttribute('rx', f1(w * 0.3)); c.m_mG2.setAttribute('ry', f1(Math.max(0.1, drop * 0.2)));
      c.m_mLine.setAttribute('d', `M${f1(-w)},${f1(cyc)} Q${f1(-w * .5)},${f1(cy + 1)} 0,${f1(cy + .7)} Q${f1(w * .5)},${f1(cy + 1)} ${f1(w)},${f1(cyc)}`);
    }
    const dim = Math.max(0, sm - 0.45);
    c.m_mDim.setAttribute('opacity', f1(dim * 0.5)); c.m_mDim.setAttribute('d', `M${f1(-w - 2.6)},${f1(cyc - 2.4)} q-1.6,2.4 0,5M${f1(w + 2.6)},${f1(cyc - 2.4)} q1.6,2.4 0,5`);
  };

  /* ================= NECK (with chin shadow, tendons, collar shading) ================= */
  Art.neck = (c) => {
    const d = c.def, u = c.uid, T = Art.tone(d.skin), male = d.build === 'm';
    c.defs.insertAdjacentHTML('beforeend', `<linearGradient id="${u}nk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.hi}"/><stop offset=".55" stop-color="${T.base}"/><stop offset="1" stop-color="${T.lo}"/></linearGradient>`);
    const w = male ? 19 : 16.5;
    c.neck.innerHTML = `<path d="M${-w},-12 L${-w},10 C${-w},14 ${-w - 3},17 ${-w - 8},19 L${w + 8},19 C${w + 3},17 ${w},14 ${w},10 L${w},-12Z" fill="url(#${u}nk)"/>
      <path d="M${-w + 1},0 C${-w * .4},9 ${w * .4},9 ${w - 1},0 L${w - 1},-12 L${-w + 1},-12Z" fill="${T.deep}" opacity=".34"/>
      <ellipse cx="0" cy="-3" rx="${w}" ry="9" fill="${T.deep}" opacity=".3"/>
      <path d="M${-w * .5},6 C${-w * .35},13 ${-w * .5},20 ${-w * .9},25M${w * .5},6 C${w * .35},13 ${w * .5},20 ${w * .9},25" stroke="${T.deep}" stroke-width="1.4" fill="none" opacity=".2" stroke-linecap="round"/>
      
      ${male ? `<ellipse cx="0" cy="10" rx="2.6" ry="3.4" fill="${T.hi}" opacity=".35"/>` : ''}`;
  };
})();
