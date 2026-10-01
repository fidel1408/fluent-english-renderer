/* 13-art-body: hands with fingers, tapered sleeves, trousers, shoes, fabric shading and rim light. */
(function () {
  'use strict';
  const FE = window.FE, { el } = FE, Art = FE.Art, SH = FE.shade;
  const f = (n) => (+n).toFixed(1);

  /* ---------------- hands ---------------- */
  /* finger = polyline from the palm outward; w = width. wrist at (0,0), fingers toward +y */
  const HP = {
    open: { F: [[[-7.6, 24], [-8.6, 36], [-9.2, 47], 5.4], [[-2.6, 25], [-2.8, 38], [-2.8, 51], 5.6], [[2.6, 25], [3.2, 38], [3.6, 49], 5.4], [[7.6, 23], [9, 32], [9.8, 40], 4.6]], T: [[-9, 9], [-16, 17], [-19.5, 26], 6] },
    flat: { F: [[[-7.4, 24], [-7.8, 40], [-8, 54], 5.4], [[-2.4, 25], [-2.4, 42], [-2.4, 58], 5.6], [[2.6, 25], [2.8, 41], [3, 55], 5.4], [[7.4, 23], [8.2, 35], [8.6, 47], 4.6]], T: [[-9, 10], [-17, 13], [-23, 21], 6] },
    fist: { K: true, T: [[-9, 12], [-4, 26], [5, 33], 6.2] },
    point: { K: true, P: [[-6, 24], [-6.4, 40], [-6.6, 57], 5.2], T: [[-9, 12], [-5, 24], [2, 29], 6] },
    pinch: { F: [[[-6, 24], [-7, 35], [-3, 43], 5.2], [[-1, 25], [-1, 34], [1, 40], 5.2], [[4, 25], [5, 33], [6.4, 38], 5], [[8.4, 23], [9.4, 30], [10, 36], 4.4]], T: [[-9, 11], [-14, 24], [-6, 38], 6] },
  };
  const line = (pts) => 'M' + pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' L');
  const smooth = (pts) => { let d = `M${f(pts[0][0])},${f(pts[0][1])}`; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; d += ` Q${f(a[0])},${f(a[1])} ${f(mx)},${f(my)}`; if (i === pts.length - 1) d += ` T${f(b[0])},${f(b[1])}`; } return d; };

  Art.handSVG = (c, kind) => {
    const T = Art.tone(c.def.skin), h = HP[kind] || HP.open;
    const finger = (pts, w) => {
      const p = pts.slice(0, -1), d = line(p);
      const tip = p[p.length - 1], prev = p[p.length - 2], ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
      return `<path d="${d}" stroke="${T.deep}" stroke-width="${f(w + 1.8)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".7"/>
        <path d="${d}" stroke="${T.base}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="${d}" stroke="${T.hi}" stroke-width="${f(w * 0.34)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".55" transform="translate(${f(-w * 0.16)},0)"/>
        <ellipse cx="${f(tip[0])}" cy="${f(tip[1] - 1.1)}" rx="${f(w * 0.34)}" ry="${f(w * 0.46)}" fill="${T.hi2}" opacity=".7" transform="rotate(${f(ang * 57.3 - 90)} ${f(tip[0])} ${f(tip[1])})"/>
        <path d="M${f(p[1][0] - w * 0.4)},${f(p[1][1])} l${f(w * 0.8)},0" stroke="${T.deep}" stroke-width=".8" opacity=".35"/>`;
    };
    let s = `<path d="M-10.6,-1 C-12.6,8 -12.6,19 -10.6,27 C-6,31 6,31 10.6,27 C12.6,19 12.6,8 10.6,-1Z" fill="url(#${c.uid}hand)" stroke="${T.deep}" stroke-width="1.1" opacity="1"/>
      <path d="M-5,12 C-1,16 5,16 9,12" stroke="${T.deep}" stroke-width=".9" fill="none" opacity=".3"/><path d="M-6,18 C-1,22 5,21 8,17" stroke="${T.deep}" stroke-width=".9" fill="none" opacity=".26"/>
      <ellipse cx="-3" cy="9" rx="6" ry="7" fill="${T.hi}" opacity=".3"/>`;
    if (h.K) { // fist: knuckles + curled fingertips
      for (let i = 0; i < 4; i++) { const x = -7.4 + i * 4.9; s += `<ellipse cx="${f(x)}" cy="30" rx="3.1" ry="3.4" fill="${T.base}" stroke="${T.deep}" stroke-width=".9" opacity=".96"/><path d="M${f(x)},32 v6.6" stroke="${T.deep}" stroke-width="5.4" stroke-linecap="round" opacity=".6"/><path d="M${f(x)},32 v6.6" stroke="${T.base}" stroke-width="4.2" stroke-linecap="round"/>`; }
      s += `<path d="M-10,27 C-8,36 8,36 10,27" stroke="${T.deep}" stroke-width="1" fill="none" opacity=".35"/>`;
      if (h.P) s += finger(h.P, h.P[3]);
    } else h.F.forEach((p) => { s += finger(p, p[3]); });
    s += finger(h.T, h.T[3]);
    return s;
  };
  Art.setHand = (arm, kind) => { arm.hp.innerHTML = Art.handSVG(arm.char, kind); };

  /* ---------------- shared gradients for the body ---------------- */
  Art.initBody = (c) => {
    const T = Art.tone(c.def.skin), u = c.uid;
    c.defs.insertAdjacentHTML('beforeend', `
      <linearGradient id="${u}hand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${T.hi}"/><stop offset=".55" stop-color="${T.base}"/><stop offset="1" stop-color="${T.lo}"/></linearGradient>
      <linearGradient id="${u}shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".72" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
      <linearGradient id="${u}rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".78" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
      <linearGradient id="${u}armsh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>`);
  };

  /* ---------------- arms ---------------- */
  Art.arm = (c, side) => {
    const d = c.def, t = d.top, u = c.uid, T = Art.tone(d.skin);
    const sleeve = t.sleeve || t.color, cuff = t.cuff || null, shortS = t.sleeveLen === 'short';
    const sg = c.grad(sleeve), skin = `url(#${u}hand)`, fold = SH(sleeve, -0.2), lite = SH(sleeve, 0.14);
    const g = el('g', { transform: `translate(${side * (c.geo.sx - 2)},-408)` });
    const up = el('g'), fore = el('g', { transform: 'translate(0,88)' });
    const arm = `M-17,0 C-17.6,28 -15.2,60 -13.6,88 L13.6,88 C15.2,60 17.6,28 17,0Z`;
    let U = '';
    if (shortS) U += `<path d="${arm}" fill="${skin}"/><path d="${arm}" fill="url(#${u}armsh)"/>`;
    const slEnd = shortS ? 36 : 88;
    U += `<path d="M-17,0 C-17.6,${slEnd * 0.3} -15.6,${slEnd * 0.7} -14.4,${slEnd} L14.4,${slEnd} C15.6,${slEnd * 0.7} 17.6,${slEnd * 0.3} 17,0Z" fill="${sg}"/>
      <path d="M-18.4,10 C-18.4,-6 -10,-13 0,-13 C10,-13 18.4,-6 18.4,10Z" fill="${sg}"/><path d="M-18.4,10 C-18.4,-6 -10,-13 0,-13 C10,-13 18.4,-6 18.4,10Z" fill="url(#${u}armsh)"/>
      <path d="M-17,0 C-17.6,${slEnd * 0.3} -15.6,${slEnd * 0.7} -14.4,${slEnd} L14.4,${slEnd} C15.6,${slEnd * 0.7} 17.6,${slEnd * 0.3} 17,0Z" fill="url(#${u}armsh)"/>
      <path d="M-15,-9 C-8,-13 8,-13 15,-6" stroke="${lite}" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>
      <path d="M-6,18 C-4,36 -4,52 -6,${slEnd - 6}" stroke="${fold}" stroke-width="5" fill="none" opacity=".12" stroke-linecap="round"/>
      <path d="M8,12 C10,30 10,48 8,${slEnd - 8}" stroke="${lite}" stroke-width="3" fill="none" opacity=".12" stroke-linecap="round"/>`;
    if (shortS) U += `<path d="M-17.4,34 C-8,41 8,41 17.4,34 L17.8,38 C8,46 -8,46 -17.8,38Z" fill="${SH(sleeve, -0.1)}"/><path d="M-16,35 C-6,39 6,39 16,35" stroke="${lite}" stroke-width="1" fill="none" opacity=".5"/>`;
    else U += `<circle cx="0" cy="88" r="13.6" fill="${sg}"/>`;
    up.innerHTML = U;
    const wr = shortS ? skin : sg;
    let F = `<path d="M-13.2,0 C-13,26 -11,52 -9.8,72 L9.8,72 C11,52 13,26 13.2,0Z" fill="${wr}"/><path d="M-13.2,0 C-13,26 -11,52 -9.8,72 L9.8,72 C11,52 13,26 13.2,0Z" fill="url(#${u}armsh)"/>`;
    if (!shortS) F += `<path d="M-11,-6 q11,7 22,0" stroke="${fold}" stroke-width="1.6" fill="none" opacity=".3"/><path d="M-9,-1 q9,6 18,0" stroke="${fold}" stroke-width="1.2" fill="none" opacity=".24"/><path d="M-9,16 C-6,32 -6,46 -7,60" stroke="${lite}" stroke-width="2.4" fill="none" opacity=".12"/>`;
    if (cuff && !shortS) F += `<rect x="-11.4" y="63" width="22.8" height="9.5" rx="3" fill="${cuff}"/><rect x="-11.4" y="63" width="22.8" height="3" rx="1.5" fill="#fff" opacity=".16"/>`;
    if (!shortS) F += `<path d="M-10.4,72 C-10.4,77 10.4,77 10.4,72 L10.6,79 C10.6,81 -10.6,81 -10.6,79Z" fill="${skin}"/>`;
    F += `<g class="hand" transform="translate(0,78)"><g class="hp"></g><g class="prop"></g></g>`;
    fore.innerHTML = F; up.appendChild(fore); g.appendChild(up);
    return { g, up, fore, hp: fore.querySelector('.hp'), prop: fore.querySelector('.prop'), side, char: c };
  };

  /* ---------------- legs & shoes ---------------- */
  Art.leg = (c, side) => {
    const d = c.def, u = c.uid, pants = d.bottom, pg = c.grad(pants), fold = SH(pants, -0.2), lite = SH(pants, 0.14), sc = d.shoes;
    const g = el('g', { transform: `translate(${side * 21},-262)` });
    const thigh = el('g'), shinG = el('g', { transform: 'translate(0,128)' });
    thigh.innerHTML = `<path d="M-23.5,-6 C-27,40 -22.4,92 -17.4,128 L17.4,128 C22.4,92 27,40 23.5,-6Z" fill="${pg}"/>
      <path d="M-23.5,-6 C-27,40 -22.4,92 -17.4,128 L17.4,128 C22.4,92 27,40 23.5,-6Z" fill="url(#${u}armsh)"/>
      <path d="M${side * -2},-4 C${side * -3},40 ${side * -2},90 ${side * -1},126" stroke="${fold}" stroke-width="1.6" fill="none" opacity=".5"/><path d="M${side * -3.4},-4 C${side * -4.4},40 ${side * -3.4},90 ${side * -2.4},126" stroke="${lite}" stroke-width="1.2" fill="none" opacity=".45"/>
      <path d="M-14,100 q14,7 28,0M-12,108 q12,6 24,0M-13,92 q13,5 26,0" stroke="${fold}" stroke-width="1.5" fill="none" opacity=".28"/>
      <path d="M-20,12 C-14,26 -10,40 -10,60" stroke="${fold}" stroke-width="6" fill="none" opacity=".1" stroke-linecap="round"/>
      <circle cx="0" cy="128" r="17.4" fill="${pg}"/>`;
    const shoe = `<g transform="translate(0,114)">
        <ellipse cx="${side * 3}" cy="27" rx="17" ry="4.4" fill="#000" opacity=".22"/>
        <path d="M-12.6,-8 L12.6,-8 C14,2 15.6,8 ${side > 0 ? 25 : 17},14 C${side > 0 ? 29 : 21},19 ${side > 0 ? 29 : 21},26 ${side > 0 ? 24 : 16},27 L${side > 0 ? -16 : -24},27 C${side > 0 ? -21 : -29},26 ${side > 0 ? -21 : -29},19 ${side > 0 ? -17 : -25},14 C-15.6,8 -14,2 -12.6,-8Z" transform="translate(${side * 2.5},0)" fill="${c.grad(sc)}" stroke="${SH(sc, -0.25)}" stroke-width="1"/>
        <path d="M-15,23 L15,23 C17,23 18,25.6 16,27.2 L-16,27.2 C-18,25.6 -17,23 -15,23Z" transform="translate(${side * 2.5},0)" fill="${SH(sc, -0.28)}"/>
        <path d="M-9,9 C-5,6 5,6 9,9" stroke="${SH(sc, 0.22)}" stroke-width="1.6" fill="none" opacity=".55" transform="translate(${side * 2.5},0)"/>
        ${d.build === 'm' ? `<g stroke="${SH(sc, 0.25)}" stroke-width="1.3" opacity=".7" transform="translate(${side * 2.5},0)"><path d="M-7,-3 h14M-7.6,1 h15.2M-8.2,5 h16.4"/></g>` : `<ellipse cx="${side * 2.5}" cy="14" rx="9" ry="3.4" fill="${SH(sc, 0.12)}" opacity=".5"/>`}
        <ellipse cx="${side * 2.5 - 2}" cy="19" rx="7" ry="2" fill="#fff" opacity=".22"/></g>`;
    shinG.innerHTML = `<path d="M-17.4,0 C-17.4,40 -14.4,90 -12.9,114 L12.9,114 C14.4,90 17.4,40 17.4,0Z" fill="${pg}"/><path d="M-17.4,0 C-17.4,40 -14.4,90 -12.9,114 L12.9,114 C14.4,90 17.4,40 17.4,0Z" fill="url(#${u}armsh)"/>
      <path d="M${side * -1.6},0 C${side * -1.4},40 ${side * -1},90 ${side * -.6},112" stroke="${fold}" stroke-width="1.5" fill="none" opacity=".45"/>
      <path d="M-14,98 q14,6 28,0M-13.4,104 q13.4,5 26.8,0" stroke="${fold}" stroke-width="1.4" fill="none" opacity=".3"/>
      <path d="M-13,110 C-6,116 6,116 13,110 L13.6,116 C6,121 -6,121 -13.6,116Z" fill="${SH(pants, -0.12)}"/>` + shoe;
    thigh.appendChild(shinG); g.appendChild(thigh);
    return { g, thigh, shinG };
  };

  /* ---------------- garment detail on the torso (folds, buttons, shading, rim light) ---------------- */
  Art.torsoDetail = (c) => {
    const d = c.def, t = d.top, u = c.uid, { sx, cw, ww, hw } = c.geo, O = c._outer, col = t.color;
    const fold = SH(col, -0.22), lite = SH(col, 0.16), male = d.build === 'm';
    const hem = t.style === 'dress' ? -138 : t.style === 'blazer' ? -228 : -240;
    c.defs.insertAdjacentHTML('beforeend', `<clipPath id="${u}tc"><path d="${O}"/></clipPath>`);
    let s = `<path d="${O}" fill="url(#${u}shade)"/>`;
    // folds from armpits / waist / hem, mirrored
    const F = (sg) => `<path d="M${sg * (cw + 1)},-358 C${sg * (ww + 7)},-332 ${sg * (ww + 6)},-300 ${sg * (hw)},${hem + 4}" stroke="${fold}" stroke-width="8" fill="none" opacity=".12" stroke-linecap="round"/>
      <path d="M${sg * 20},-380 C${sg * 24},-350 ${sg * 28},-320 ${sg * 26},-286" stroke="${fold}" stroke-width="4" fill="none" opacity=".1" stroke-linecap="round"/>
      <path d="M${sg * 10},-370 C${sg * 12},-340 ${sg * 14},-310 ${sg * 12},-262" stroke="${lite}" stroke-width="3" fill="none" opacity=".1" stroke-linecap="round"/>`;
    s += F(-1) + F(1);
    if (t.style === 'blazer') {
      s += `<path d="M-44,-336 l20,-2" stroke="${fold}" stroke-width="1.6" opacity=".45"/><path d="M-44,-334.4 l20,-2" stroke="${lite}" stroke-width="1" opacity=".5"/>
        <path d="M24,-298 l24,2 v8 l-24,-2z" fill="${SH(col, -0.04)}" stroke="${fold}" stroke-width="1" opacity=".7"/><path d="M-48,-296 l24,-2 v8 l-24,2z" fill="${SH(col, -0.04)}" stroke="${fold}" stroke-width="1" opacity=".7"/>
        <circle cx="-5" cy="-292" r="4.2" fill="${SH(col, -0.1)}" stroke="${fold}" stroke-width=".8"/><circle cx="-5.8" cy="-293" r="1.3" fill="#fff" opacity=".5"/>
        <path d="M-17,-433 L-26,-410 L-9,-372 L-3,-400" fill="none" stroke="${lite}" stroke-width="1.2" opacity=".5"/><path d="M17,-433 L26,-410 L9,-372 L3,-400" fill="none" stroke="${lite}" stroke-width="1.2" opacity=".5"/>`;
    } else if (t.style === 'sweater') {
      let rib = ''; for (let x = -hw - 1; x <= hw + 1; x += 5) rib += `<path d="M${x},${hem - 1} v12" />`;
      s += `<g stroke="${fold}" stroke-width="1" opacity=".3">${rib}</g>`;
      let knit = ''; for (let x = -cw; x <= cw; x += 7) knit += `<path d="M${x},-420 C${x * 1.02},-360 ${x * 1.05},-300 ${x * 1.1},${hem - 2}" />`;
      s += `<g stroke="${lite}" stroke-width="1.1" opacity=".12" fill="none">${knit}</g><path d="M-19,-433 C-8,-420 8,-420 19,-433" stroke="${fold}" stroke-width="3" fill="none" opacity=".3"/>`;
    } else if (t.style === 'shirt') {
      s += `<path d="M-30,-322 C-14,-308 14,-308 30,-322" stroke="${fold}" stroke-width="2" fill="none" opacity=".18"/><path d="M-24,-360 C-8,-352 8,-352 24,-360" stroke="${fold}" stroke-width="2" fill="none" opacity=".14"/>`;
    } else { // blouse / dress: soft drape and bust shading
      s += `<ellipse cx="-16" cy="-368" rx="17" ry="12" fill="${lite}" opacity=".1"/><ellipse cx="16" cy="-368" rx="17" ry="12" fill="${fold}" opacity=".1"/>
        <path d="M-30,-346 C-16,-334 16,-334 30,-346" stroke="${fold}" stroke-width="3" fill="none" opacity=".16"/><path d="M-20,-322 C-8,-312 8,-312 20,-322" stroke="${fold}" stroke-width="2.4" fill="none" opacity=".14"/>`;
    }
    // soft contact shadow under the arms & rim light on the right silhouette
    s += `<path d="${O}" fill="none" stroke="url(#${u}rim)" stroke-width="5" stroke-linejoin="round"/>`;
    return `<g clip-path="url(#${u}tc)">${s}</g>`;
  };
})();
