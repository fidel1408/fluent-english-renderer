/* Fluent English - Love Speaking Club
 * art-figure.js : jointed adult character rig (SVG).
 * Local coordinates: origin = centre of the shoulder line. Head is up (negative y), hips at y=230.
 * Joints: waist lean, neck tilt, head yaw/pitch, shoulder, elbow, wrist, five-finger hands,
 * eyelids, brows, gaze, mouth (smile/open), blink, idle breathing and audio-driven talking.
 */
(function (global) {
  'use strict';
  const { S, SKIN, PAL, f, lerp, clamp, ease, Anim } = global.Art;

  /* ---------- body builds ---------- */
  const BUILD = {
    male: { sx: 80, delt: 22, neckW: 25, chestY: 70, chest: 91, waist: 77, UA: 108, FA: 98, ua0: 21, ua1: 17, fa0: 15.5, fa1: 11.5, hand: 1.3, head: 1.04, jaw: 'male' },
    female: { sx: 58, delt: 15, neckW: 17, chestY: 66, chest: 63, waist: 52, UA: 100, FA: 92, ua0: 14.5, ua1: 12, fa0: 11, fa1: 8.2, hand: 1.12, head: 1.0, jaw: 'female' }
  };

  /* ---------- helper: closed symmetric path from a right-side segment list ---------- */
  function symPath(start, segs) {
    // start & final end are on the x=0 axis. segs: ['L',[x,y]] | ['C',[c1],[c2],[end]] | ['Q',[c],[end]]
    let d = `M${f(start[0])},${f(start[1])}`;
    const pts = [start];
    for (const s of segs) {
      const t = s[0];
      d += t + s.slice(1).map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
      pts.push(s[s.length - 1]);
    }
    // left side reversed
    for (let i = segs.length - 1; i >= 0; i--) {
      const s = segs[i]; const prev = pts[i];
      const m = (p) => [-p[0], p[1]];
      if (s[0] === 'L') d += `L${f(-prev[0])},${f(prev[1])}`;
      else if (s[0] === 'C') d += `C${f(-s[2][0])},${f(s[2][1])} ${f(-s[1][0])},${f(s[1][1])} ${f(-prev[0])},${f(prev[1])}`;
      else if (s[0] === 'Q') d += `Q${f(-s[1][0])},${f(s[1][1])} ${f(-prev[0])},${f(prev[1])}`;
    }
    return d + 'Z';
  }
  const mirrorD = (d) => { // mirror a path made of absolute commands in pairs (M L C Q Z only)
    let i = 0;
    return d.replace(/-?\d*\.?\d+/g, (m) => { const n = parseFloat(m); const out = (i % 2 === 0) ? -n : n; i++; return f(out); });
  };
  const shade = (hex, amt) => { // amt -1..1
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  /* ---------- hand presets: finger curl 0..1 (index, middle, ring, pinky), thumb 0..1 (out->across), spread deg ---------- */
  const HANDS = {
    relaxed: { i: .30, m: .38, r: .46, p: .55, t: .35, sp: 4, w: 0 },
    open:    { i: .04, m: .02, r: .04, p: .06, t: .10, sp: 11, w: 0 },
    flat:    { i: .02, m: .02, r: .02, p: .02, t: .55, sp: 2, w: 0 },
    point:   { i: 0, m: .95, r: .98, p: .98, t: .75, sp: 3, w: 0 },
    fist:    { i: .95, m: .98, r: .98, p: .98, t: .85, sp: 0, w: 0 },
    loose:   { i: .5, m: .55, r: .6, p: .65, t: .4, sp: 5, w: 0 },
    cup:     { i: .55, m: .6, r: .62, p: .66, t: .2, sp: 7, w: 0 },
    thumbs:  { i: .98, m: .98, r: .98, p: .98, t: 0, sp: 0, w: 0 },
    pinch:   { i: .55, m: .12, r: .12, p: .16, t: .62, sp: 8, w: 0 }
  };
  const handKeys = ['i', 'm', 'r', 'p', 't', 'sp'];

  /* ---------- expressions: numeric overrides ---------- */
  const EXPR = {
    neutral:   { bl: 0, br: 0, blt: 0, brt: 0, eo: 1, ms: .12, mo: 0, ex: 0, ey: 0 },
    warm:      { bl: -1, br: -1, blt: 2, brt: 2, eo: .92, ms: .62, mo: 0, ex: 0, ey: 0 },
    smile:     { bl: -1.5, br: -1.5, blt: 1, brt: 1, eo: .86, ms: .9, mo: .12, ex: 0, ey: 0 },
    laugh:     { bl: -3, br: -3, blt: 3, brt: 3, eo: .28, ms: 1, mo: .85, ex: 0, ey: 0 },
    delight:   { bl: -7, br: -7, blt: 4, brt: 4, eo: 1, ms: 1, mo: .45, ex: 0, ey: 0 },
    surprised: { bl: -9, br: -9, blt: 5, brt: 5, eo: 1.12, ms: .05, mo: .6, ex: 0, ey: 0 },
    curious:   { bl: -7, br: 1, blt: 5, brt: -3, eo: 1, ms: .25, mo: 0, ex: 0, ey: -.2 },
    concerned: { bl: -3, br: -3, blt: 11, brt: 11, eo: .95, ms: -.25, mo: 0, ex: 0, ey: 0 },
    sorry:     { bl: -2, br: -2, blt: 14, brt: 14, eo: .88, ms: -.35, mo: 0, ex: 0, ey: .5 },
    sad:       { bl: 0, br: 0, blt: 12, brt: 12, eo: .8, ms: -.55, mo: 0, ex: 0, ey: .7 },
    focused:   { bl: 2, br: 2, blt: -7, brt: -7, eo: .8, ms: -.05, mo: 0, ex: 0, ey: .15 },
    tired:     { bl: 2, br: 2, blt: 7, brt: 7, eo: .62, ms: -.15, mo: 0, ex: 0, ey: .5 },
    thinking:  { bl: -6, br: 2, blt: 3, brt: -5, eo: .9, ms: .02, mo: 0, ex: .8, ey: -.7 },
    listening: { bl: -2, br: -2, blt: 4, brt: 4, eo: 1, ms: .22, mo: 0, ex: 0, ey: 0 },
    wry:       { bl: -6, br: 2, blt: 3, brt: -4, eo: .88, ms: .45, mo: 0, ex: 0, ey: 0 },
    proud:     { bl: -3, br: -3, blt: 1, brt: 1, eo: .84, ms: .8, mo: .02, ex: 0, ey: 0 },
    shy:       { bl: -2, br: -2, blt: 6, brt: 6, eo: .86, ms: .5, mo: 0, ex: -.6, ey: .5 }
  };

  const DEFAULT = {
    lean: 0, head: 0, yaw: 0, pitch: 0, breathe: 0,
    aL: 6, aLe: 10, aLw: 0, aLf: 0, aR: 6, aRe: 10, aRw: 0, aRf: 0,
    bl: 0, br: 0, blt: 0, brt: 0, eo: 1, ex: 0, ey: 0, ms: .12, mo: 0,
    hL_i: .3, hL_m: .38, hL_r: .46, hL_p: .55, hL_t: .35, hL_sp: 4,
    hR_i: .3, hR_m: .38, hR_r: .46, hR_p: .55, hR_t: .35, hR_sp: 4
  };

  /* expand friendly pose input: {aL:[s,e,w,'hand'], aR:[...], expr:'smile', ...} -> flat numeric map */
  function flatten(p) {
    const o = {};
    for (const k in p) {
      const v = p[k];
      if (k === 'expr') { Object.assign(o, EXPR[v] || {}); continue; }
      if (k === 'aL' || k === 'aR') {
        if (Array.isArray(v)) {
          let sh = v[0], el = v[1], wr = v[2], fs = 0;
          if (wr && typeof wr === 'object') { fs = wr.f || 0; wr = wr.w || 0; }      // from fig.ik(): tucked, foreshortened forearm
          else if (typeof el === 'number' && el > 30 && sh < 35) {                     // raw 'hands in front' pose: tuck the elbow, foreshorten the forearm
            fs = clamp((el - 20) / 90, 0, .78); sh = sh * .3; el = 8 + (el - 30) * .06;
          } else if (typeof sh === 'number' && sh > 6 && typeof el === 'number' && el <= 30) sh = Math.min(sh, 8);
          o[k] = sh; if (el !== undefined) o[k + 'e'] = el; o[k + 'w'] = wr || 0; o[k + 'f'] = fs;
          if (v[3]) { const h = typeof v[3] === 'string' ? HANDS[v[3]] : v[3]; const side = k === 'aL' ? 'hL_' : 'hR_'; for (const hk of handKeys) o[side + hk] = h[hk]; if (h.w) o[k + 'w'] = (o[k + 'w'] || 0) + h.w; }
        } else o[k] = v;
        continue;
      }
      if (k === 'hL' || k === 'hR') { const h = typeof v === 'string' ? HANDS[v] : v; for (const hk of handKeys) o[k + '_' + hk] = h[hk]; continue; }
      o[k] = v;
    }
    return o;
  }

  const mix = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = (sh) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t); return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1); };
  let UID = 0;

  /* =====================================================================================
   *  makeFigure(spec) -> Figure
   * ===================================================================================== */
  function makeFigure(spec) {
    const id = 'fg' + (++UID);
    const B = BUILD[spec.build || 'male'];
    const sk = SKIN[spec.skin || 's2'];
    const skinId = spec.skin || 's2';
    const ol = spec.outfit || {};
    const hairC = spec.hairColor || '#2A1E1C';
    const hairHi = spec.hairHi || shade(hairC, .35);
    const male = (spec.build || 'male') === 'male';
    const lineW = 1.15;

    /* clothing colours */
    const C = {
      tee: ol.tee || PAL.ivory, jacket: ol.jacket || null, trim: ol.trim || null,
      pants: ol.pants || '#26314F', shoe: ol.shoe || '#1c1a24', sleeve: ol.sleeve || 'rolled', neck: ol.neck || 'crew'
    };
    C.teeDk = shade(C.tee, -.2); C.jkDk = C.jacket ? shade(C.jacket, -.28) : null; C.jkLt = C.jacket ? shade(C.jacket, .18) : null;

    const root = S('g', { class: 'figure', 'data-fig': id });
    const defs = S('defs');
    root.appendChild(defs);

    /* clip paths (per figure) */
    const headPathD = male
      ? 'M0,-128 C27,-128 47,-114 48,-90 C49,-76 47,-63 42,-51 C37,-40 28,-31 18,-26 Q8,-22 0,-22 Q-8,-22 -18,-26 C-28,-31 -37,-40 -42,-51 C-47,-63 -49,-76 -48,-90 C-47,-114 -27,-128 0,-128Z'
      : 'M0,-126 C24,-126 42,-112 42,-88 C42,-70 39,-57 32,-45 C26,-34 16,-27 8,-23 Q0,-20.5 -8,-23 C-16,-27 -26,-34 -32,-45 C-39,-57 -42,-70 -42,-88 C-42,-112 -24,-126 0,-126Z';
    defs.appendChild(S('clipPath', { id: id + '-hc' }, S('path', { d: headPathD })));

    /* ============================== LAYERS ============================== */
    const L = {};
    ['legs', 'hairBack', 'upper'].forEach((n) => { L[n] = S('g', { class: n }); root.appendChild(L[n]); });
    const upper = L.upper;                       // rotates at the waist
    const gBody = S('g', { class: 'body' }); upper.appendChild(gBody);
    const gNeck = S('g', { class: 'neck' }); const gTee = S('g', { class: 'tee' }); const gJacket = S('g', { class: 'jacket' });
    const gHead = S('g', { class: 'head' }); const gArms = S('g', { class: 'arms' });
    gBody.append(gNeck, gTee, gJacket); upper.append(gHead, gArms);

    /* ---------------- neck + chest skin ---------------- */
    const nw = B.neckW;
    gNeck.appendChild(S('path', { d: `M${-nw},-52 L${-nw - 1},8 C${-nw * .6},28 ${nw * .6},28 ${nw + 1},8 L${nw},-52Z`, fill: `url(#neck-${skinId})`, stroke: sk.ln, 'stroke-width': .8, 'stroke-opacity': .5 }));
    // jaw shadow on neck
    gNeck.appendChild(S('path', { d: `M${-nw},-40 Q0,-18 ${nw},-40 L${nw},-22 Q0,2 ${-nw},-22Z`, fill: '#2a1410', opacity: .22 }));

    /* ---------------- torso geometry ---------------- */
    const cx = B.chest, cw = B.waist, ch = B.chestY;
    const hipY = 236;
    const sideSegs = [
      ['C', [nw + 22, -9], [B.sx - 14, -2], [B.sx + 6, 9]],
      ['C', [B.sx + 17, 15], [cx + 6, 28], [cx, ch]],
      ['C', [cx - 3, ch + 55], [cw + 4, 160], [cw, 188]],
      ['L', [cw + 2, hipY]],
      ['L', [0, hipY + 2]]
    ];
    const torsoD = symPath([0, -10], sideSegs);

    // tee (full silhouette, a little narrower than jacket)
    const tee = S('path', { d: torsoD, fill: C.tee });
    gTee.appendChild(tee);
    gTee.appendChild(S('path', { d: torsoD, fill: 'url(#shadeSide)', opacity: .8 }));
    // neckline
    const neckStyle = C.neck;
    let neckD;
    if (neckStyle === 'v') neckD = `M${-nw - 3},-6 L0,${male ? 52 : 44} L${nw + 3},-6 Q0,${male ? 12 : 8} ${-nw - 3},-6Z`;
    else if (neckStyle === 'scoop') neckD = `M${-nw - 4},-6 C${-nw - 4},30 ${nw + 4},30 ${nw + 4},-6 Q0,8 ${-nw - 4},-6Z`;
    else if (neckStyle === 'henley') neckD = `M${-nw - 2},-6 C${-nw},14 ${nw},14 ${nw + 2},-6 Q0,6 ${-nw - 2},-6Z`;
    else neckD = `M${-nw - 3},-6 C${-nw - 1},22 ${nw + 1},22 ${nw + 3},-6 Q0,10 ${-nw - 3},-6Z`;
    // skin patch of chest under neckline is part of the neck group; draw tee collar band over it
    // (the V/scoop opening reveals the skin colour behind)
    const skinChest = S('path', { d: neckD, fill: sk.base });
    // we paint the opening as skin ABOVE the tee
    gTee.appendChild(skinChest);
    gTee.appendChild(S('path', { d: neckD, fill: 'url(#shadeDown)', opacity: .5 }));
    gTee.appendChild(S('path', { d: neckD, fill: 'none', stroke: C.teeDk, 'stroke-width': 3.2, 'stroke-linejoin': 'round', opacity: .9 }));
    if (neckStyle === 'henley') {
      gTee.appendChild(S('path', { d: `M0,12 L0,${male ? 54 : 46}`, stroke: C.teeDk, 'stroke-width': 1.4, opacity: .8 }));
      gTee.appendChild(S('path', { d: `M-6,10 L-6,${male ? 52 : 44} L6,${male ? 52 : 44} L6,10`, fill: 'none', stroke: C.teeDk, 'stroke-width': 1.2, opacity: .55 }));
      for (let i = 0; i < 3; i++) gTee.appendChild(S('circle', { cx: 0, cy: 22 + i * 12, r: 2, fill: shade(C.tee, -.35), opacity: .9 }));
    }
    // fabric folds on tee
    gTee.appendChild(S('path', { d: `M${-cw + 8},120 Q${-cw + 28},150 ${-cw + 18},196 M${cw - 14},112 Q${cw - 30},150 ${cw - 20},200`, fill: 'none', stroke: '#000', 'stroke-width': 3, opacity: .06, 'stroke-linecap': 'round' }));

    /* ---------------- jacket / overshirt / cardigan ---------------- */
    if (C.jacket) {
      const open = ol.open !== false;
      const edgeX = ol.edge || (male ? 22 : 17);   // inner opening edge at neck
      const bot = ol.hem || 20;                    // inner edge at hem
      const jP = (side) => {
        const sg = side;                             // -1 left, +1 right
        const px = (x) => x * sg;
        const d = `M${px(edgeX)},-8 C${px(nw + 22)},-9 ${px(B.sx - 14)},-2 ${px(B.sx + 6)},9 C${px(B.sx + 17)},15 ${px(cx + 6)},28 ${px(cx)},${ch}` +
          ` C${px(cx - 3)},${ch + 55} ${px(cw + 4)},160 ${px(cw)},188 L${px(cw + 3)},${hipY + 4} L${px(bot)},${hipY + 6} C${px(bot - 2)},180 ${px(edgeX + 1)},60 ${px(edgeX)},-8Z`;
        return d;
      };
      ['-1', '1'].forEach((sgs) => {
        const sg = +sgs; const d = jP(sg);
        gJacket.appendChild(S('path', { d, fill: C.jacket }));
        gJacket.appendChild(S('path', { d, fill: 'url(#shadeSide)', opacity: sg < 0 ? .55 : .95 }));
        if (ol.texture === 'weave') gJacket.appendChild(S('path', { d, fill: 'url(#weave)' }));
        if (ol.texture === 'knit') gJacket.appendChild(S('path', { d, fill: 'url(#knit)' }));
        // inner edge line + shadow where it overlaps tee
        gJacket.appendChild(S('path', { d: `M${sg * edgeX},-6 C${sg * (edgeX + 1)},60 ${sg * (bot - 2)},180 ${sg * bot},${hipY + 4}`, fill: 'none', stroke: C.jkDk, 'stroke-width': 3, opacity: .75, 'stroke-linecap': 'round' }));
        gJacket.appendChild(S('path', { d: `M${sg * (edgeX - 3)},-4 C${sg * (edgeX - 2)},60 ${sg * (bot - 5)},180 ${sg * (bot - 3)},${hipY + 2}`, fill: 'none', stroke: '#000', 'stroke-width': 7, opacity: .10, 'stroke-linecap': 'round' }));
        // side seam + folds
        gJacket.appendChild(S('path', { d: `M${sg * (cx - 18)},${ch + 18} C${sg * (cw)},120 ${sg * (cw - 4)},170 ${sg * (cw - 3)},${hipY}`, fill: 'none', stroke: C.jkDk, 'stroke-width': 1.3, opacity: .5 }));
        gJacket.appendChild(S('path', { d: `M${sg * 36},84 Q${sg * 30},130 ${sg * 40},176`, fill: 'none', stroke: '#000', 'stroke-width': 3, opacity: .07, 'stroke-linecap': 'round' }));
      });
      // chest pockets (overshirt)
      if (ol.pockets) {
        [-1, 1].forEach((sg) => {
          gJacket.appendChild(S('path', { d: `M${sg * 38},70 L${sg * 74},70 L${sg * 74},106 Q${sg * 56},114 ${sg * 38},106Z`, fill: C.jkLt, opacity: .42 }));
          gJacket.appendChild(S('path', { d: `M${sg * 38},70 L${sg * 74},70 L${sg * 74},106 Q${sg * 56},114 ${sg * 38},106Z`, fill: 'none', stroke: C.jkDk, 'stroke-width': 1.3, opacity: .75 }));
          gJacket.appendChild(S('path', { d: `M${sg * 38},78 L${sg * 74},78`, stroke: C.jkDk, 'stroke-width': 1, opacity: .5 }));
        });
      }
      // collar flaps
      const collar = (sg) => {
        const d = `M${sg * (edgeX + 1)},-16 C${sg * 28},-22 ${sg * 46},-12 ${sg * 52},4 L${sg * 34},34 L${sg * (edgeX - 3)},${ol.collarDrop || 22} C${sg * (edgeX - 5)},10 ${sg * (edgeX - 3)},-4 ${sg * (edgeX + 1)},-16Z`;
        return d;
      };
      if (ol.collar !== false) {
        [-1, 1].forEach((sg) => {
          const d = collar(sg);
          gJacket.appendChild(S('path', { d, fill: C.jkLt }));
          gJacket.appendChild(S('path', { d, fill: 'url(#shadeDown)', opacity: .5 }));
          gJacket.appendChild(S('path', { d, fill: 'none', stroke: C.jkDk, 'stroke-width': 1.4, 'stroke-linejoin': 'round', opacity: .85 }));
          gJacket.appendChild(S('path', { d: `M${sg * 48},2 L${sg * 33},30`, stroke: C.jkDk, 'stroke-width': 1, opacity: .45 }));
        });
      }
    }

    /* ---------------- legs (optional, standing/full body) ---------------- */
    if (spec.legs) {
      const lw = male ? 34 : 29, gap = male ? 3 : 2;
      const pc = C.pants, pd = shade(pc, -.3);
      [-1, 1].forEach((sg) => {
        const x0 = sg * (gap + lw / 2 + 6);
        const d = `M${x0 - lw / 2 - 4},228 L${x0 + lw / 2 + 4},228 L${x0 + lw / 2 - 1},430 L${x0 - lw / 2 + 1},430Z`;
        L.legs.appendChild(S('path', { d, fill: pc }));
        L.legs.appendChild(S('path', { d, fill: 'url(#shadeSide)', opacity: .55 }));
        L.legs.appendChild(S('path', { d: `M${x0},250 L${x0 - 1},425`, stroke: pd, 'stroke-width': 1.2, opacity: .45 }));
        // shoe
        L.legs.appendChild(S('path', { d: `M${x0 - lw / 2 + 1},425 L${x0 + lw / 2 - 1},425 L${x0 + lw / 2 + 12 * sg},442 Q${x0 + lw / 2 + 14 * sg},452 ${x0 + 2},452 L${x0 - lw / 2 - 6},450Z`, fill: C.shoe }));
        L.legs.appendChild(S('path', { d: `M${x0 - lw / 2 - 6},448 L${x0 + lw / 2 + 14 * sg},448`, stroke: '#fff', 'stroke-opacity': .25, 'stroke-width': 3 }));
      });
      L.legs.appendChild(S('path', { d: `M-${lw},232 L${lw},232 L${lw},245 L-${lw},245Z`, fill: pc }));
    }

    /* ============================== HEAD ============================== */
    const hs = B.head;
    const headRoot = S('g', { class: 'headrot', transform: `scale(${hs})` });
    gHead.appendChild(headRoot);
    const gEars = S('g', {}); const gFace = S('g', {}); const gFeat = S('g', { class: 'feat' }); const gHairF = S('g', { class: 'hairF' });
    headRoot.append(gEars, gFace);

    // ears
    [-1, 1].forEach((sg) => {
      gEars.appendChild(S('path', { d: `M${sg * 44},-98 C${sg * 56},-102 ${sg * 58},-84 ${sg * 52},-72 C${sg * 50},-66 ${sg * 45},-66 ${sg * 43},-70Z`, fill: sk.base, stroke: sk.ln, 'stroke-width': lineW, 'stroke-opacity': .55 }));
      gEars.appendChild(S('path', { d: `M${sg * 48},-92 C${sg * 53},-92 ${sg * 53},-82 ${sg * 49},-77`, fill: 'none', stroke: sk.sh, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: .8 }));
    });
    // face
    gFace.appendChild(S('path', { d: headPathD, fill: `url(#face-${skinId})`, stroke: sk.ln, 'stroke-width': lineW, 'stroke-opacity': .5 }));
    // face modelling
    const fm = S('g', { 'clip-path': `url(#${id}-hc)` });
    fm.appendChild(S('rect', { x: -60, y: -130, width: 120, height: 112, fill: 'url(#shadeSide)', opacity: .8 }));
    fm.appendChild(S('rect', { x: -60, y: -130, width: 120, height: 112, fill: 'url(#shadeDown)', opacity: .55 }));
    // jaw/cheek shadow
    fm.appendChild(S('path', { d: male ? 'M30,-60 C38,-44 28,-30 14,-26 L40,-30 Z' : 'M26,-52 C30,-40 20,-30 10,-26 L34,-34 Z', fill: '#2a1410', opacity: .10 }));
    gFace.appendChild(fm);
    if (!male) { // blush
      gFace.appendChild(S('ellipse', { cx: -26, cy: -58, rx: 11, ry: 6.5, fill: sk.blush, opacity: .16 }));
      gFace.appendChild(S('ellipse', { cx: 26, cy: -58, rx: 11, ry: 6.5, fill: sk.blush, opacity: .16 }));
    } else {
      gFace.appendChild(S('ellipse', { cx: -27, cy: -62, rx: 10, ry: 6, fill: sk.blush, opacity: .05 }));
      gFace.appendChild(S('ellipse', { cx: 27, cy: -62, rx: 10, ry: 6, fill: sk.blush, opacity: .05 }));
    }

    // facial hair (stubble / beard)
    const beard = spec.beard || null;
    if (beard) {
      const bd = male
        ? 'M-45,-66 C-47,-50 -38,-33 -20,-26 Q0,-19 20,-26 C38,-33 47,-50 45,-66 C42,-56 36,-50 30,-52 C26,-46 18,-44 12,-46 Q0,-50 -12,-46 C-18,-44 -26,-46 -30,-52 C-36,-50 -42,-56 -45,-66Z'
        : 'M-40,-60 C-40,-44 -30,-30 -10,-24 Q0,-21 10,-24 C30,-30 40,-44 40,-60 C34,-48 24,-44 14,-46 Q0,-50 -14,-46 C-24,-44 -34,-48 -40,-60Z';
      const g = S('g', { 'clip-path': `url(#${id}-hc)` });
      if (beard === 'stubble') {
        g.appendChild(S('path', { d: bd, fill: spec.beardColor || '#2b1f1d', opacity: .30 }));
        g.appendChild(S('path', { d: bd, fill: 'url(#stubble)', opacity: .55 }));
        // upper-lip shadow
        g.appendChild(S('path', { d: 'M-16,-48.5 Q0,-52 16,-48.5 Q8,-45.5 0,-45.5 Q-8,-45.5 -16,-48.5Z', fill: spec.beardColor || '#2b1f1d', opacity: .22 }));
      } else {
        const bc = spec.beardColor || hairC;
        const bfull = 'M-46,-72 C-50,-48 -40,-26 -18,-18 Q0,-12 18,-18 C40,-26 50,-48 46,-72 C44,-60 38,-53 31,-54 C27,-47 19,-44 12,-46 Q0,-51 -12,-46 C-19,-44 -27,-47 -31,-54 C-38,-53 -44,-60 -46,-72Z';
        g.appendChild(S('path', { d: bfull, fill: bc }));
        g.appendChild(S('path', { d: bfull, fill: 'url(#shadeSide)', opacity: .7 }));
        g.appendChild(S('path', { d: bfull, fill: 'url(#knit)', opacity: .7 }));
        g.appendChild(S('path', { d: 'M-30,-34 C-14,-24 14,-24 30,-34', fill: 'none', stroke: hairHi, 'stroke-width': 1.6, opacity: .35, 'stroke-linecap': 'round' }));
      }
      gFace.appendChild(g);
    }

    /* ---- features group (shifts with yaw/pitch) ---- */
    gFace.appendChild(gFeat);
    const eyeX = male ? 21 : 19.5, eyeY = -88;
    const eyes = {}; // 'L' & 'R'
    const mkEye = (sg) => {
      const eg = S('g', { transform: `translate(${sg * eyeX},${eyeY})` });
      const clip = S('clipPath', { id: `${id}-e${sg}` }); const clipPath = S('path', { d: '' }); clip.appendChild(clipPath); defs.appendChild(clip);
      const sclera = S('path', { d: '', fill: '#FBF6EE' });
      const inner = S('g', { 'clip-path': `url(#${id}-e${sg})` });
      const iris = S('g', {});
      iris.appendChild(S('circle', { r: 5.6, fill: spec.eye || '#3a2a20' }));
      iris.appendChild(S('circle', { r: 5.6, fill: 'none', stroke: '#1b120d', 'stroke-width': .9 }));
      iris.appendChild(S('circle', { r: 2.8, fill: '#0d0809' }));
      iris.appendChild(S('circle', { cx: -1.7, cy: -1.9, r: 1.25, fill: '#fff', opacity: .95 }));
      const shadeTop = S('path', { d: '', fill: '#1b1010', opacity: .16 });
      inner.append(sclera.cloneNode(false), iris, shadeTop);
      const lashTop = S('path', { d: '', fill: 'none', stroke: '#1b1010', 'stroke-width': male ? 2.4 : 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      const lashLow = S('path', { d: '', fill: 'none', stroke: sk.ln, 'stroke-width': 1, 'stroke-linecap': 'round', opacity: .5 });
      const crease = S('path', { d: '', fill: 'none', stroke: sk.ln, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: .55 });
      const flick = !male ? S('path', { d: `M${sg * 9.5},-1 q${sg * 4},-1.5 ${sg * 6},-4.5`, fill: 'none', stroke: '#1b1010', 'stroke-width': 1.8, 'stroke-linecap': 'round' }) : null;
      eg.append(S('path', { d: '', fill: '#FBF6EE', class: 'sclera' }), inner, crease, lashLow, lashTop, flick);
      const sc = eg.firstChild; sc.setAttribute('fill', '#FBF6EE');
      eyes[sg] = { g: eg, clipPath, sclera: sc, innerSclera: inner.firstChild, iris, shadeTop, lashTop, lashLow, crease, sg };
      return eg;
    };
    gFeat.append(mkEye(-1), mkEye(1));

    // brows
    const browThick = male ? 5.2 : 3.1;
    const browCol = spec.browColor || hairC;
    const brows = {};
    const mkBrow = (sg) => {
      const g = S('g', {});
      const p = S('path', { d: '', fill: browCol, stroke: browCol, 'stroke-width': .6, 'stroke-linejoin': 'round' });
      g.appendChild(p);
      brows[sg] = { g, p, sg };
      return g;
    };
    gFeat.append(mkBrow(-1), mkBrow(1));

    // nose
    const nose = S('g', {});
    nose.appendChild(S('path', { d: 'M5.5,-84 C8,-78 9.4,-70 9,-63', fill: 'none', stroke: sk.sh, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .2 }));
    nose.appendChild(S('path', { d: male ? 'M-10,-61 C-9,-55 -4,-52.5 0,-53.5 C4,-52.5 9,-55 10,-61 C7,-58 4,-57 0,-57.5 C-4,-57 -7,-58 -10,-61Z' : 'M-8,-60 C-7,-55 -3,-53 0,-53.5 C3,-53 7,-55 8,-60 C6,-57.5 3,-57 0,-57.5 C-3,-57 -6,-57.5 -8,-60Z', fill: sk.sh, opacity: .55 }));
    nose.appendChild(S('path', { d: male ? 'M-10,-61 C-9,-55 -4,-52.5 0,-53.5 C4,-52.5 9,-55 10,-61' : 'M-8,-60 C-7,-55 -3,-53 0,-53.5 C3,-53 7,-55 8,-60', fill: 'none', stroke: sk.ln, 'stroke-width': 1.3, 'stroke-linecap': 'round', opacity: .7 }));
    nose.appendChild(S('ellipse', { cx: -4.2, cy: -55.8, rx: 1.9, ry: 1.1, fill: '#2a1410', opacity: .55 }));
    nose.appendChild(S('ellipse', { cx: 4.2, cy: -55.8, rx: 1.9, ry: 1.1, fill: '#2a1410', opacity: .55 }));
    nose.appendChild(S('ellipse', { cx: -1.5, cy: -64, rx: 2.6, ry: 4.2, fill: sk.hi, opacity: .45 }));
    gFeat.appendChild(nose);

    // mouth
    const mouthY = male ? -39.5 : -40.5;
    const mw = male ? 14.5 : 12.5;
    const mouth = S('g', { transform: `translate(0,${mouthY})` });
    const mInterior = S('path', { d: '', fill: '#3a1218' });
    const mTongue = S('path', { d: '', fill: '#a8434f', opacity: .85 });
    const mTeeth = S('path', { d: '', fill: '#fbf6ee' });
    const mClipId = id + '-mc'; const mClip = S('clipPath', { id: mClipId }); const mClipP = S('path', { d: '' }); mClip.appendChild(mClipP); defs.appendChild(mClip);
    const mIn = S('g', { 'clip-path': `url(#${mClipId})` }); mIn.append(mInterior, mTongue, mTeeth);
    const lipC = male ? mix(sk.lip, sk.base, .38) : sk.lip;
    const lipLow = S('path', { d: '', fill: lipC });
    const lipLowHi = S('path', { d: '', fill: '#fff', opacity: .16 });
    const lipUp = S('path', { d: '', fill: shade(lipC, -.07) });
    const mLine = S('path', { d: '', fill: 'none', stroke: shade(sk.lip, -.45), 'stroke-width': 1.3, 'stroke-linecap': 'round' });
    const dimple = S('path', { d: '', fill: 'none', stroke: sk.ln, 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: .3 });
    mouth.append(mIn, lipLow, lipLowHi, lipUp, mLine, dimple);
    gFeat.appendChild(mouth);

    // glasses (optional)
    if (spec.glasses) {
      const gl = S('g', { fill: 'none', stroke: spec.glassColor || '#20243a', 'stroke-width': 2.4 });
      gl.appendChild(S('rect', { x: -eyeX - 15, y: eyeY - 11, width: 30, height: 22, rx: 8 }));
      gl.appendChild(S('rect', { x: eyeX - 15, y: eyeY - 11, width: 30, height: 22, rx: 8 }));
      gl.appendChild(S('path', { d: `M-${eyeX - 15},${eyeY - 2} Q0,${eyeY - 7} ${eyeX - 15},${eyeY - 2}` }));
      gl.appendChild(S('path', { d: `M${-eyeX - 15},${eyeY - 4} L-47,${eyeY - 6} M${eyeX + 15},${eyeY - 4} L47,${eyeY - 6}` }));
      gl.appendChild(S('rect', { x: -eyeX - 15, y: eyeY - 11, width: 30, height: 22, rx: 8, fill: '#BFE6F0', 'fill-opacity': .12, stroke: 'none' }));
      gl.appendChild(S('rect', { x: eyeX - 15, y: eyeY - 11, width: 30, height: 22, rx: 8, fill: '#BFE6F0', 'fill-opacity': .12, stroke: 'none' }));
      gFeat.appendChild(gl);
    }
    // earrings
    if (spec.earrings) {
      [-1, 1].forEach((sg) => gEars.appendChild(S('circle', { cx: sg * 51, cy: -66, r: 3, fill: PAL.amber, stroke: PAL.amberDk, 'stroke-width': .8 })));
    }

    /* ---------------- hair ---------------- */
    buildHair(spec.hair || 'short', { male, hairC, hairHi, hairBack: L.hairBack, hairFront: gHairF, headRoot, headPathD, id, defs, hs, skin: sk });
    headRoot.appendChild(gHairF);
    // hairBack lives with head transform => move it into a group that follows head tilt
    const hairBackWrap = S('g', { class: 'hairBackWrap' });
    while (L.hairBack.firstChild) hairBackWrap.appendChild(L.hairBack.firstChild);
    L.hairBack.appendChild(hairBackWrap);

    /* ============================== ARMS ============================== */
    const arms = {};
    const makeArm = (side) => { // side -1 (screen-left) / +1 (screen-right)
      const sg = side;
      const sh = S('g', {});
      const sleeveC = C.jacket || C.tee;
      const sleeveDk = shade(sleeveC, -.3), sleeveLt = shade(sleeveC, .15);
      const rolled = C.sleeve === 'rolled', short = C.sleeve === 'short';
      const UA = B.UA, FA = B.FA;
      const wTop = B.ua0, wBot = B.ua1;
      // upper arm sleeve
      const upD = `M${-wTop},3 C${-wTop},${f(-wTop * .42)} ${wTop},${f(-wTop * .42)} ${wTop},3 C${wTop - .5},${UA * .45} ${wBot + 1},${UA * .8} ${wBot},${UA} A${wBot},${wBot} 0 0 1 ${-wBot},${UA} C${-wBot - 1},${UA * .8} ${-wTop + .5},${UA * .45} ${-wTop},3Z`;
      const upper = S('g', {});
      if (short) {
        const sleeveLen = UA * .62;
        const skinUp = S('path', { d: upD, fill: `url(#limb-${skinId})`, stroke: sk.ln, 'stroke-width': lineW, 'stroke-opacity': .5 });
        upper.appendChild(skinUp);
        const sp = `M${-wTop - 1},3 C${-wTop - 1},${f(-wTop * .45)} ${wTop + 1},${f(-wTop * .45)} ${wTop + 1},3 L${wTop - 2},${sleeveLen} L${-wTop + 2},${sleeveLen}Z`;
        upper.appendChild(S('path', { d: sp, fill: sleeveC }));
        upper.appendChild(S('path', { d: sp, fill: 'url(#shadeSide)', opacity: .8 }));
      } else {
        upper.appendChild(S('path', { d: upD, fill: sleeveC }));
        upper.appendChild(S('path', { d: upD, fill: 'url(#shadeSide)', opacity: .9 }));
        if (ol.texture === 'weave') upper.appendChild(S('path', { d: upD, fill: 'url(#weave)' }));
        if (ol.texture === 'knit') upper.appendChild(S('path', { d: upD, fill: 'url(#knit)' }));
        // soft fold lines
        upper.appendChild(S('path', { d: `M${-wBot + 3},${UA * .55} q${wBot},6 ${wBot * 1.7},0 M${-wBot + 4},${UA * .8} q${wBot},5 ${wBot * 1.5},0`, fill: 'none', stroke: '#000', 'stroke-width': 1.8, opacity: .09, 'stroke-linecap': 'round' }));
      }
      sh.appendChild(upper);
      // elbow group
      const el = S('g', { transform: `translate(0,${UA})` });
      // forearm
      const w0 = B.fa0, w1 = B.fa1;
      const faD = `M${-w0},0 A${w0},${w0} 0 0 1 ${w0},0 C${w0},${FA * .3} ${w1 + 1.5},${FA * .6} ${w1},${FA} L${-w1},${FA} C${-w1 - 1.5},${FA * .6} ${-w0},${FA * .3} ${-w0},0Z`;
      const fa = S('g', {});
      const showSkinFrom = (C.sleeve === 'long') ? FA - 6 : (rolled ? 28 : 0);
      fa.appendChild(S('path', { d: faD, fill: `url(#limb-${skinId})`, stroke: sk.ln, 'stroke-width': lineW, 'stroke-opacity': .5 }));
      // forearm hair for male
      if (male && spec.armHair !== false) {
        let hairLines = '';
        for (let i = 0; i < 16; i++) { const yy = 34 + (i * 4.1) % (FA - 44); const xx = ((i * 7.3) % 14) - 7; hairLines += `M${f(xx)},${f(yy)} l${f((i % 2 ? 1.6 : -1.6))},2.4 `; }
        fa.appendChild(S('path', { d: hairLines, stroke: '#2a1c18', 'stroke-width': .8, opacity: .35, fill: 'none', 'stroke-linecap': 'round' }));
      }
      fa.appendChild(S('path', { d: faD, fill: 'url(#shadeSide)', opacity: .35 }));
      // muscle highlight line
      fa.appendChild(S('path', { d: `M${-w0 + 4},30 C${-w0 + 3},50 ${-w1 + 3},70 ${-w1 + 3},${FA - 6}`, fill: 'none', stroke: '#fff', 'stroke-width': 1.6, opacity: .12, 'stroke-linecap': 'round' }));
      el.appendChild(fa);
      // sleeve over forearm
      if (C.sleeve === 'long') {
        const sl = `M${-wBot},0 A${wBot},${wBot} 0 0 1 ${wBot},0 C${wBot},${FA * .3} ${w1 + 3},${FA * .62} ${w1 + 2.5},${FA - 9} L${-w1 - 2.5},${FA - 9} C${-w1 - 3},${FA * .62} ${-wBot},${FA * .3} ${-wBot},0Z`;
        fa.appendChild(S('path', { d: sl, fill: sleeveC })); fa.appendChild(S('path', { d: sl, fill: 'url(#shadeSide)', opacity: .9 }));
        fa.appendChild(S('rect', { x: -w1 - 3, y: FA - 14, width: 2 * w1 + 6, height: 8, rx: 3, fill: sleeveLt }));
        fa.appendChild(S('rect', { x: -w1 - 3, y: FA - 14, width: 2 * w1 + 6, height: 8, rx: 3, fill: 'none', stroke: sleeveDk, 'stroke-width': 1, opacity: .8 }));
      } else if (rolled) {
        const sl = `M${-wBot},0 A${wBot},${wBot} 0 0 1 ${wBot},0 C${wBot + .5},10 ${w0 + 3.5},20 ${w0 + 4},30 L${-w0 - 4},30 C${-w0 - 3.5},20 ${-wBot - .5},10 ${-wBot},0Z`;
        fa.appendChild(S('path', { d: sl, fill: sleeveC })); fa.appendChild(S('path', { d: sl, fill: 'url(#shadeSide)', opacity: .9 }));
        // rolled cuff band
        fa.appendChild(S('rect', { x: -w0 - 5.5, y: 20, width: 2 * w0 + 11, height: 13, rx: 5, fill: sleeveLt }));
        fa.appendChild(S('rect', { x: -w0 - 5.5, y: 20, width: 2 * w0 + 11, height: 13, rx: 5, fill: 'url(#shadeSide)', opacity: .8 }));
        fa.appendChild(S('rect', { x: -w0 - 5.5, y: 20, width: 2 * w0 + 11, height: 13, rx: 5, fill: 'none', stroke: sleeveDk, 'stroke-width': 1.1, opacity: .85 }));
        fa.appendChild(S('path', { d: `M${-w0 - 3},26.5 L${w0 + 3},26.5`, stroke: sleeveDk, 'stroke-width': .9, opacity: .5 }));
      }
      sh.appendChild(el);

      // watch on screen-left wrist (male)
      let wtRef = null;
      if (spec.watch && side === -1) {
        const wt = wtRef = S('g', { transform: `translate(0,${FA - 14})` });
        wt.appendChild(S('rect', { x: -w1 - 1.2, y: -4, width: 2 * w1 + 2.4, height: 9, rx: 3, fill: '#8a5a32' }));
        wt.appendChild(S('circle', { cx: 0, cy: .5, r: 8.2, fill: '#c9ccd4', stroke: '#6b6f7e', 'stroke-width': 1 }));
        wt.appendChild(S('circle', { cx: 0, cy: .5, r: 6.2, fill: '#162036' }));
        wt.appendChild(S('path', { d: 'M0,.5 L0,-4 M0,.5 L3.4,2', stroke: '#e8eaf0', 'stroke-width': 1, 'stroke-linecap': 'round' }));
        el.appendChild(wt);
      }
      // bracelets for female
      if (spec.bracelet && side === 1) {
        fa.appendChild(S('rect', { x: -w1 - 1, y: FA - 15, width: 2 * w1 + 2, height: 3.2, rx: 1.6, fill: PAL.amber, stroke: PAL.amberDk, 'stroke-width': .6 }));
      }

      // hand
      const hand = makeHand(side, sk, skinId, B.hand, male, lineW);
      const hg = S('g', { transform: `translate(0,${FA - 2})` }); hg.appendChild(hand.g);
      el.appendChild(hg);
      const holder = S('g', { class: 'held' }); // objects attached to hand
      hand.g.appendChild(holder);

      arms[side] = { sh, el, hg, hand, holder, upper, fa, wt: wtRef };
      return sh;
    };
    const armL = makeArm(-1), armR = makeArm(1);
    gArms.append(armL, armR);

    /* ============================== STATE & RENDER ============================== */
    const cur = Object.assign({}, DEFAULT);
    const fig = { id, el: root, spec, cur, B, male, parts: { gHead, gFeat, headRoot, upper, arms, eyes, brows, gFace, hairBackWrap }, layers: L, held: {} };
    let talkAmt = 0, blink = 1, idleT = 0, breathe = 0, gazeJx = 0, gazeJy = 0;

    function eyePaths(o, sg) {
      // o: openness 0..1.15
      const w = male ? 10.4 : 10.8;
      const top = lerp(1.4, -6.8, clamp(o, 0, 1.2)), bot = lerp(1.8, 5.2, clamp(o, 0, 1.2));
      const outerUp = male ? 0 : -.6;
      const sclera = `M${-w},.6 C${-w * .55},${top} ${w * .55},${top} ${w},${outerUp - .2} C${w * .55},${bot} ${-w * .55},${bot} ${-w},.6Z`;
      const lash = `M${-w - .6},.8 C${-w * .55},${top - .4} ${w * .55},${top - .4} ${w + .4},${outerUp - .4}`;
      const low = `M${-w + 1.4},1.8 C${-w * .5},${bot + .8} ${w * .5},${bot + .8} ${w - 1},${outerUp + 1.2}`;
      const crease = `M${-w + 1},${top - 4.2} C${-w * .5},${top - 7.4 + (1 - Math.min(o, 1)) * 2.5} ${w * .5},${top - 7.4 + (1 - Math.min(o, 1)) * 2.5} ${w},${top - 3}`;
      return { sclera, lash, low, crease, top };
    }
    function browPath(sg, lift, tilt) {
      // spine from inner (u=0) to outer (u=1); thickness profile tapers outward. tilt>0 raises inner end.
      const x0 = male ? 5.5 : 7.5, x1 = male ? 34 : 32;
      const yIn = (male ? -100.5 : -102.5) + lift, yOut = (male ? -101.5 : -104) + lift;
      const arch = male ? 2.4 : 4.2, peak = male ? .6 : .55;
      const N = 8, spine = [];
      const cxm = (x0 + x1) / 2, cym = (yIn + yOut) / 2, a = tilt * Math.PI / 180;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = lerp(x0, x1, u);
        const y = lerp(yIn, yOut, u) - arch * Math.sin(Math.PI * Math.pow(u, 1 / (1 + (peak - .5) * 2.2)));
        const dx = x - cxm, dy = y - cym;
        spine.push([cxm + dx * Math.cos(a) - dy * Math.sin(a), cym + dx * Math.sin(a) + dy * Math.cos(a), u]);
      }
      const T = browThick;
      const top = [], bot = [];
      spine.forEach(([x, y, u]) => {
        const w = T * (.58 + .5 * Math.sin(Math.PI * Math.min(1, u * 1.05 + .06))) * (1 - .8 * Math.pow(u, 2.4));
        top.push([x, y - w * .55]); bot.push([x, y + w * .45]);
      });
      const pts = top.concat(bot.reverse());
      let d = `M${f(pts[0][0] * sg)},${f(pts[0][1])}`;
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1], p1 = pts[i], pm = pts[i - 2] || p0, pn = pts[i + 1] || p1;
        const c1 = [p0[0] + (p1[0] - pm[0]) / 6, p0[1] + (p1[1] - pm[1]) / 6], c2 = [p1[0] - (pn[0] - p0[0]) / 6, p1[1] - (pn[1] - p0[1]) / 6];
        d += `C${f(c1[0] * sg)},${f(c1[1])} ${f(c2[0] * sg)},${f(c2[1])} ${f(p1[0] * sg)},${f(p1[1])}`;
      }
      return d + 'Z';
    }
    function mouthPaths(s, o) {
      const sp = Math.max(s, 0);
      const w = mw * (1 + sp * .22 + o * .04);
      const cy = -s * 6.4;                                   // corner y (negative = raised)
      const openH = o * 12.5;
      const line = `M${-w},${f(cy)} C${f(-w * .55)},${f(cy * .18)} ${f(-w * .22)},0 0,0 C${f(w * .22)},0 ${f(w * .55)},${f(cy * .18)} ${w},${f(cy)}`;
      // opening: between the upper-lip edge and the lower-lip inner edge
      const lowMid = openH + 1.5;
      const lowCtl = lowMid * 1.28;
      const interior = line + ` C${f(w * .72)},${f(cy + lowCtl)} ${f(-w * .72)},${f(cy + lowCtl)} ${-w},${f(cy)}Z`;
      // upper lip: above the line
      const tu = male ? 3.6 : 4.2;
      const upper = `M${-w - .6},${f(cy + .2)} C${f(-w * .72)},${f(cy - 1.4)} ${f(-w * .34)},${-tu - .6} ${f(-w * .1)},${f(-tu + .2)} Q0,${f(-tu + 1.2)} ${f(w * .1)},${f(-tu + .2)} C${f(w * .34)},${-tu - .6} ${f(w * .72)},${f(cy - 1.4)} ${w + .6},${f(cy + .2)}` +
        ` C${f(w * .55)},${f(cy * .18 + .3)} ${f(w * .22)},.3 0,.3 C${f(-w * .22)},.3 ${f(-w * .55)},${f(cy * .18 + .3)} ${-w - .6},${f(cy + .2)}Z`;
      // lower lip: below the line (or the opening)
      const tl = (male ? 5.6 : 7.6) + o * 1.4;
      const lower = `M${-w + .6},${f(cy + .4)} C${f(-w * .6)},${f(cy + lowCtl * .96)} ${f(w * .6)},${f(cy + lowCtl * .96)} ${w - .6},${f(cy + .4)}` +
        ` C${f(w * .62)},${f(cy + lowCtl + tl * 1.05)} ${f(-w * .62)},${f(cy + lowCtl + tl * 1.05)} ${-w + .6},${f(cy + .4)}Z`;
      return { interior: o > .03 ? interior : '', upper, lower, line, w, cy, lowC: lowCtl, openH, tl };
    }

    function render() {
      const c = cur;
      /* waist lean / breathe */
      const br = 1 + Math.sin(idleT * 1.5) * .006;
      upper.setAttribute('transform', `rotate(${f(c.lean)} 0 ${hipY}) translate(0,${f(Math.sin(idleT * 1.5) * .8)})`);
      /* head */
      const yaw = c.yaw, pitch = c.pitch;
      gHead.setAttribute('transform', `rotate(${f(c.head)} 0 -8)`);
      gFeat.setAttribute('transform', `translate(${f(yaw * 11)},${f(pitch * 4)}) scale(${f(1 - Math.abs(yaw) * .06)},1)`);
      hairBackWrap.setAttribute('transform', `rotate(${f(c.head)} 0 -8) scale(${hs})`);
      // eyes
      const eoBase = clamp(c.eo * blink, 0, 1.2);
      [-1, 1].forEach((sg) => {
        const E = eyes[sg]; const p = eyePaths(eoBase, sg);
        E.sclera.setAttribute('d', p.sclera); E.clipPath.setAttribute('d', p.sclera);
        E.innerSclera.setAttribute('d', p.sclera);
        E.lashTop.setAttribute('d', p.lash); E.lashLow.setAttribute('d', p.low); E.crease.setAttribute('d', p.crease);
        E.shadeTop.setAttribute('d', `M-12,${f(p.top - 2)} L12,${f(p.top - 2)} L12,${f(p.top + 3.4)} Q0,${f(p.top + 6)} -12,${f(p.top + 3.4)}Z`);
        const gx = clamp(c.ex + gazeJx + yaw * .6, -1.2, 1.2) * 3.2, gy = clamp(c.ey + gazeJy + pitch * .3, -1, 1) * 1.8;
        E.iris.setAttribute('transform', `translate(${f(gx)},${f(gy)})`);
      });
      // brows (left of screen is sg=-1)
      const bL = browPath(-1, c.bl, c.blt), bR = browPath(1, c.br, c.brt);
      brows[-1].p.setAttribute('d', bL); brows[1].p.setAttribute('d', bR);
      // mouth
      const mo = clamp(c.mo + talkAmt, 0, 1);
      const mp = mouthPaths(c.ms, mo);
      lipLow.setAttribute('d', mp.lower); lipLowHi.setAttribute('d', `M${f(-mp.w * .38)},${f(mp.cy + mp.lowC * .96 + mp.tl * .55)} Q0,${f(mp.cy + mp.lowC * .96 + mp.tl * .72)} ${f(mp.w * .38)},${f(mp.cy + mp.lowC * .96 + mp.tl * .55)}`);
      lipLowHi.setAttribute('fill', 'none'); lipLowHi.setAttribute('stroke', '#fff'); lipLowHi.setAttribute('stroke-width', 1.6); lipLowHi.setAttribute('stroke-linecap', 'round');
      lipUp.setAttribute('d', mp.upper); mLine.setAttribute('d', mp.line);
      if (mp.interior) {
        mInterior.setAttribute('d', mp.interior); mClipP.setAttribute('d', mp.interior);
        const th = Math.min(5.4, 1.6 + mo * 6);
        mTeeth.setAttribute('d', `M${-mp.w + 1},${f(mp.cy - 2)} L${mp.w - 1},${f(mp.cy - 2)} L${mp.w - 1},${f(mp.cy + th * .55)} Q0,${f(th + .6)} ${-mp.w + 1},${f(mp.cy + th * .55)}Z`);
        mTongue.setAttribute('d', `M${f(-mp.w * .5)},${f(mp.cy + mp.lowC + 2)} Q0,${f(mp.cy + mp.lowC * .35 + 1)} ${f(mp.w * .5)},${f(mp.cy + mp.lowC + 2)}Z`);
        mInterior.style.display = ''; mTeeth.style.display = ''; mTongue.style.display = '';
        mLine.style.display = 'none';
      } else { mInterior.style.display = 'none'; mTeeth.style.display = 'none'; mTongue.style.display = 'none'; mLine.style.display = ''; }
      const dm = c.ms > .45 ? (c.ms - .45) * 1.6 : 0;
      dimple.setAttribute('d', dm > .05 ? `M${f(-mp.w - 2.6)},${f(mp.cy - 3)} q-2.4,${f(3 + dm)} .4,${f(7 + dm)} M${f(mp.w + 2.6)},${f(mp.cy - 3)} q2.4,${f(3 + dm)} -.4,${f(7 + dm)}` : '');
      // arms
      [['aL', -1, 'hL_'], ['aR', 1, 'hR_']].forEach(([k, sg, hp]) => {
        const A = arms[sg];
        A.sh.setAttribute('transform', `translate(${sg * B.sx},13) rotate(${f(-sg * c[k])})`);
        A.el.setAttribute('transform', `translate(0,${B.UA}) rotate(${f(sg * c[k + 'e'])})`);
        const sy = 1 - (c[k + 'f'] || 0);
        A.fa.setAttribute('transform', `scale(1,${f(sy)})`);
        A.hg.setAttribute('transform', `translate(0,${f((B.FA - 2) * sy)}) rotate(${f(sg * c[k + 'w'])}) scale(1,${f(1 - (c[k + 'f'] || 0) * .3)})`);
        if (A.wt) A.wt.setAttribute('transform', `translate(0,${f((B.FA - 14) * sy)})`);
        A.hand.set({ i: c[hp + 'i'], m: c[hp + 'm'], r: c[hp + 'r'], p: c[hp + 'p'], t: c[hp + 't'], sp: c[hp + 'sp'] });
      });
    }

    /* ---- public API ---- */
    fig.render = render;
    fig.set = function (pose) { Object.assign(cur, flatten(pose)); render(); return fig; };
    fig.pose = function (pose, ms = 600, easeFn = ease.inOut, delay = 0) {
      const target = flatten(pose);
      const from = {}; for (const k in target) from[k] = cur[k];
      if (fig._tw) { Anim.tweens.delete(fig._tw); }
      const tw = { dur: ms, delay, ease: easeFn, update: (e) => { for (const k in target) cur[k] = lerp(from[k], target[k], e); render(); } };
      fig._tw = tw;
      return new Promise((res) => { tw.done = res; Anim.add(tw); });
    };
    fig.attach = function (side, node, tx = 0, ty = 0, rot = 0) { // side: 'L' | 'R'
      const A = arms[side === 'L' ? -1 : 1];
      const w = S('g', { transform: `translate(${tx},${ty}) rotate(${rot})` }); w.appendChild(node); A.holder.appendChild(w);
      fig.held[side] = w; return w;
    };
    fig.detach = function (side) { const A = arms[side === 'L' ? -1 : 1]; while (A.holder.firstChild) A.holder.removeChild(A.holder.firstChild); fig.held[side] = null; };
    /* two-bone IK: place the wrist of arm 'L' (screen-left) or 'R' at (tx,ty) in figure units. returns [s,e,w] */
    fig.ik = function (side, tx, ty, bend) {
      const sg = side === 'L' ? -1 : 1; const px = sg * B.sx, py = 13, UA = B.UA, FA = B.FA - 2;
      const toPose = (ux, uy, fx, fy, sy) => {
        const th = Math.atan2(-ux, uy) * 180 / Math.PI, thf = Math.atan2(-fx, fy) * 180 / Math.PI;
        let e = sg * (thf - th); while (e > 180) e -= 360; while (e < -180) e += 360;
        let sh = -sg * th; while (sh > 180) sh -= 360; while (sh < -180) sh += 360;
        return [sh, e, { w: 0, f: 1 - sy }];
      };
      /* hands in front of the body: keep the elbow tucked by the ribs and foreshorten the forearm (it points toward the viewer) instead of flaring the elbow out */
      const inFront = sg * (tx - px) < 10 && ty > py + 8;
      if (inFront && bend !== 'out') {
        const ab = (6 + Math.max(0, sg * (px - tx) - 40) * .05) * Math.PI / 180;
        const ux = -sg * Math.sin(ab), uy = Math.cos(ab);
        const ex = px + UA * ux, ey = py + UA * uy;
        const vx = tx - ex, vy = ty - ey, L2 = Math.hypot(vx, vy);
        if (L2 <= FA * 1.04) return toPose(ux, uy, vx / (L2 || 1), vy / (L2 || 1), clamp(L2 / FA, .3, 1));
      }
      let dx = tx - px, dy = ty - py; let d = Math.hypot(dx, dy); d = clamp(d, Math.abs(UA - FA) + 2, UA + FA - 1);
      const phi = Math.atan2(dy, dx), a = Math.acos(clamp((UA * UA + d * d - FA * FA) / (2 * UA * d), -1, 1));
      const cands = [phi + a, phi - a].map((ang) => ({ ang, ex: px + UA * Math.cos(ang), ey: py + UA * Math.sin(ang) }));
      let pick;
      if (bend === 'up') pick = cands[0].ey < cands[1].ey ? cands[0] : cands[1];
      else if (bend === 'out') pick = Math.abs(cands[0].ex) > Math.abs(cands[1].ex) ? cands[0] : cands[1];
      else pick = cands[0].ey > cands[1].ey ? cands[0] : cands[1];   // default: elbow low, like a relaxed arm
      const ux = Math.cos(pick.ang), uy = Math.sin(pick.ang);
      const wx = px + d * Math.cos(phi), wy = py + d * Math.sin(phi);
      return toPose(ux, uy, wx - pick.ex, wy - pick.ey, 1);
    };
    fig.setTalk = (v) => { talkAmt = v; render(); };
    fig.talkTicker = null;
    fig.startTalk = function (envFn) { // envFn(t)->0..1
      fig.stopTalk();
      fig.talkTicker = Anim.ticker((ts) => { talkAmt = clamp(envFn(ts) * .85, 0, .9); render(); });
    };
    fig.stopTalk = function () { if (fig.talkTicker) { fig.talkTicker(); fig.talkTicker = null; } talkAmt = 0; render(); };
    fig.idle = function (on = true) {
      if (fig._idle) { fig._idle(); fig._idle = null; }
      if (!on) return fig;
      let nextBlink = 1400 + Math.random() * 2600, bt = -1, last = 0, nextGaze = 800;
      fig._idle = Anim.ticker((ts) => {
        if (Anim.reduced) return;
        const dt = last ? ts - last : 16; last = ts; idleT += dt / 1000;
        nextBlink -= dt; nextGaze -= dt;
        if (nextBlink <= 0 && bt < 0) { bt = 0; nextBlink = 2200 + Math.random() * 3600; }
        if (bt >= 0) { bt += dt; const p = bt / 170; blink = p < .5 ? 1 - p * 2 : p < 1 ? (p - .5) * 2 : 1; if (p >= 1) { bt = -1; blink = 1; } }
        if (nextGaze <= 0) { gazeJx = (Math.random() - .5) * .35; gazeJy = (Math.random() - .5) * .2; nextGaze = 900 + Math.random() * 1800; }
        render();
      });
      return fig;
    };
    fig.pos = function (x, y, s = 1, flip = false) { root.setAttribute('transform', `translate(${x},${y}) scale(${flip ? -s : s},${s})`); return fig; };
    fig.destroy = () => { fig.idle(false); fig.stopTalk(); };
    fig.set({});
    fig.set(spec.pose || {});
    return fig;
  }

  /* =====================================================================================
   *  HANDS: five-finger rig, back-of-hand view. Local origin = wrist, hand points down (+y).
   * ===================================================================================== */
  function makeHand(side, sk, skinId, scale, male, lineW) {
    const sg = side;                 // -1 screen-left hand, +1 screen-right hand
    const tdir = sg === -1 ? 1 : -1; // thumb sits on the inner side (towards the body centre)
    const g = S('g', { class: 'hand', transform: `scale(${scale})` });
    const pw = 13.5, wr = 10.5;
    const stroke = { stroke: sk.ln, 'stroke-width': lineW / scale, 'stroke-opacity': .6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    const fill = { fill: `url(#limb-${skinId})` };
    const palmD = `M${-wr},-4 C${-wr - 1},7 ${-pw - 1},15 ${-pw},25 Q${-pw},31 ${-pw + 4},31 L${pw - 4},31 Q${pw},31 ${pw},25 C${pw + 1},15 ${wr + 1},7 ${wr},-4Z`;
    const palm = S('path', { d: palmD, ...fill, ...stroke });
    const palmShade = S('path', { d: palmD, fill: 'url(#shadeSide)', opacity: .35 });
    const knuckles = S('path', { d: `M${-pw + 3},26.5 q${pw * .45},3 ${pw * .9},0 M${-pw * .1},26.5 q${pw * .5},3 ${pw},0`, fill: 'none', stroke: sk.sh, 'stroke-width': 1, opacity: .45, 'stroke-linecap': 'round' });
    const mound = S('ellipse', { cx: tdir * (pw - 4), cy: 15, rx: 6, ry: 11, ...fill, opacity: .95 });
    const fx = [pw - 4.2, pw / 3 - 1.6, -pw / 3 + 1.6, -pw + 4.2].map((x) => x * tdir);
    const lens = [32, 35, 33, 25], widths = [7.5, 7.7, 7.3, 6.3];
    const cap = (len, w) => { const r = w / 2; return `M${-w / 2},0 L${-w / 2 + .3},${f(len - r)} A${r},${r} 0 0 0 ${w / 2 - .3},${f(len - r)} L${w / 2},0Z`; };
    const fingers = fx.map((x, i) => {
      const fg = S('g', { transform: `translate(${x},29)` });
      const p1 = S('path', { d: '', ...fill, ...stroke });
      const p2 = S('path', { d: '', ...fill, ...stroke });
      const nail = S('path', { d: '', fill: 'none', stroke: sk.sh, 'stroke-width': .9, opacity: .55, 'stroke-linecap': 'round' });
      const j = S('g', {}); j.append(p2, nail);
      fg.append(p1, j);
      return { g: fg, p1, p2, j, nail, len: lens[i], w: widths[i] * (male ? 1 : .86) };
    });
    const tg = S('g', { transform: `translate(${tdir * (pw - 2.5)},9)` });
    const t1 = S('path', { d: '', ...fill, ...stroke }), t2 = S('path', { d: '', ...fill, ...stroke });
    const tj = S('g', {}); tj.append(t2); tg.append(t1, tj);
    g.append(...fingers.map((fi) => fi.g).reverse(), tg, palm, mound, palmShade, knuckles);
    const api = {
      g,
      set(h) {
        const sp = h.sp;
        fingers.forEach((fi, idx) => {
          const k = [h.i, h.m, h.r, h.p][idx];
          const ang = (idx - 1.5) * sp * tdir;
          fi.g.setAttribute('transform', `translate(${f(fx[idx])},28) rotate(${f(ang)})`);
          const vis = 1 - .55 * k;
          const l1 = fi.len * .54 * vis, l2 = fi.len * .46 * vis, w = fi.w;
          fi.p1.setAttribute('d', cap(l1 + 2, w)); fi.j.setAttribute('transform', `translate(0,${f(l1)})`);
          fi.p2.setAttribute('d', cap(l2, w * .94));
          fi.nail.setAttribute('d', k < .65 ? `M${f(-w * .22)},${f(l2 - 6)} q${f(w * .22)},-2 ${f(w * .44)},0` : '');
        });
        const tl1 = 14, tl2 = 12 * (1 - .22 * h.t);
        tg.setAttribute('transform', `translate(${tdir * (pw - 1)},12) rotate(${f(-tdir * lerp(34, -6, h.t))})`);
        if (h.t > .62) g.appendChild(tg); else g.insertBefore(tg, palm);
        t1.setAttribute('d', cap(tl1 + 2, 9.6 * (male ? 1 : .88))); tj.setAttribute('transform', `translate(0,${tl1})`);
        t2.setAttribute('d', cap(tl2, 8.6 * (male ? 1 : .88)));
      }
    };
    api.set({ i: .3, m: .38, r: .46, p: .55, t: .35, sp: 4 });
    return api;
  }

  /* =====================================================================================
   *  HAIR STYLES
   * ===================================================================================== */
  function buildHair(style, o) {
    const { hairC, hairHi, hairBack, hairFront, male } = o;
    const dk = shade(hairC, -.4);
    const add = (parent, d, fill, extra) => parent.appendChild(S('path', Object.assign({ d, fill }, extra || {})));
    const strands = (parent, list, col, w, op) => list.forEach((d) => parent.appendChild(S('path', { d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', opacity: op })));
    const sheen = (parent, d, op) => parent.appendChild(S('path', { d, fill: hairHi, opacity: op || .3 }));
    switch (style) {
      case 'short': { // Alex: tapered sides, textured top, softly raised front
        const cap = 'M-46,-70 C-50,-84 -52,-102 -48,-118 C-42,-136 -22,-146 2,-146 C28,-146 48,-135 51,-115 C53,-100 51,-84 46,-70 L44,-73 C44,-82 43,-92 40,-101 C36,-110 28,-116 18,-118 C6,-121 -8,-119 -20,-116 C-32,-112 -40,-104 -43,-94 C-44,-86 -45,-78 -46,-70Z';
        add(hairFront, cap, hairC);
        add(hairFront, cap, 'url(#shadeSide)', { opacity: .5 });
        sheen(hairFront, 'M-12,-141 C10,-147 34,-141 45,-124 C32,-134 12,-138 -12,-141Z', .38);
        sheen(hairFront, 'M-34,-128 C-26,-136 -14,-140 -6,-141 C-16,-136 -26,-132 -34,-128Z', .22);
        // temple taper (darker, close-cropped)
        add(hairFront, 'M-46,-70 C-49,-82 -48,-92 -44,-100 L-43,-94 C-44,-86 -45,-78 -46,-70Z', dk, { opacity: .55 });
        add(hairFront, 'M46,-70 C49,-82 48,-92 44,-100 L43,-94 C44,-86 45,-78 46,-70Z', dk, { opacity: .55 });
        strands(hairFront, ['M-34,-124 C-26,-122 -18,-121 -10,-123', 'M-20,-134 C-10,-130 2,-128 12,-130', 'M2,-139 C12,-134 22,-132 32,-133', 'M22,-136 C30,-132 38,-128 44,-120', 'M-40,-112 C-34,-116 -28,-120 -22,-122', 'M30,-126 C36,-122 42,-116 46,-108'], hairHi, 1.2, .3);
        strands(hairFront, ['M-26,-140 C-18,-136 -10,-134 -2,-135', 'M8,-142 C16,-139 24,-137 32,-138'], dk, 1.8, .45);
        break;
      }
      case 'wavy': { // Maya: shoulder-length waves, side-swept fringe
        const back = symPath([0, -147], [['C', [32, -147], [58, -130], [59, -104]], ['C', [66, -80], [68, -40], [65, -6]], ['C', [64, 22], [66, 42], [58, 58]], ['C', [52, 66], [44, 56], [38, 62]], ['L', [0, 52]]]);
        add(hairBack, back, hairC); add(hairBack, back, 'url(#shadeSide)', { opacity: .45 });
        strands(hairBack, ['M-56,-60 C-62,-30 -60,0 -54,30', 'M56,-60 C62,-30 60,0 54,30', 'M-48,-20 C-52,10 -48,34 -44,50', 'M48,-20 C52,10 48,34 44,50'], hairHi, 1.8, .32);
        const cap = 'M-45,-72 C-49,-86 -50,-104 -45,-118 C-38,-136 -18,-147 4,-147 C30,-147 50,-133 52,-110 C54,-94 50,-76 46,-62 L43,-64 C44,-72 44,-80 40,-88 C35,-100 25,-107 11,-112 C3,-115 -6,-118 -16,-120 C-26,-114 -36,-106 -41,-96 C-43,-90 -44,-82 -45,-72Z';
        add(hairFront, cap, hairC); add(hairFront, cap, 'url(#shadeSide)', { opacity: .4 });
        sheen(hairFront, 'M-8,-143 C16,-148 40,-138 49,-116 C36,-130 14,-136 -8,-143Z', .4);
        sheen(hairFront, 'M2,-112 C14,-108 26,-102 36,-94 C26,-100 14,-106 2,-112Z', .22);
        strands(hairFront, ['M-14,-128 C-2,-124 10,-118 22,-110', 'M0,-138 C14,-132 28,-122 38,-110', 'M-30,-122 C-24,-124 -18,-124 -12,-122', 'M16,-142 C30,-136 42,-124 47,-108', 'M-38,-110 C-34,-114 -30,-117 -24,-118'], hairHi, 1.2, .4);
        break;
      }
      case 'bun': { // Priya: pulled back, top bun
        add(hairBack, 'M-22,-152 C-22,-178 22,-178 22,-152 C22,-136 -22,-136 -22,-152Z', hairC);
        add(hairBack, 'M-22,-152 C-22,-178 22,-178 22,-152 C22,-136 -22,-136 -22,-152Z', 'url(#shadeSide)', { opacity: .5 });
        strands(hairBack, ['M-14,-165 C-4,-171 8,-171 15,-163', 'M-16,-154 C-6,-160 8,-160 16,-153'], hairHi, 1.5, .4);
        const cap = 'M-47,-72 C-51,-86 -52,-104 -47,-118 C-40,-136 -20,-145 2,-145 C28,-145 48,-134 51,-114 C53,-100 50,-84 46,-72 L44,-74 C44,-84 42,-94 38,-102 C30,-112 14,-117 0,-118 C-14,-117 -30,-112 -38,-102 C-42,-94 -44,-84 -44,-74Z';
        add(hairFront, cap, hairC); add(hairFront, cap, 'url(#shadeSide)', { opacity: .45 });
        sheen(hairFront, 'M-14,-141 C10,-147 36,-140 46,-122 C32,-134 10,-138 -14,-141Z', .38);
        strands(hairFront, ['M-34,-120 C-22,-126 -6,-128 8,-127', 'M-40,-108 C-28,-118 -12,-122 2,-122', 'M12,-126 C24,-124 34,-118 41,-108'], hairHi, 1.2, .38);
        break;
      }
      case 'curly': { // Leo: short voluminous curls
        const blobs = [[-40, -100, 11], [-42, -114, 12], [-34, -126, 14], [-20, -136, 15], [-2, -140, 16], [16, -137, 15], [32, -128, 14], [42, -114, 12], [43, -100, 11], [-26, -118, 14], [-8, -124, 15], [12, -122, 15], [28, -112, 12], [-30, -106, 10], [2, -108, 9]];
        blobs.forEach(([x, y, r], i) => hairFront.appendChild(S('circle', { cx: x, cy: y, r, fill: i % 3 === 0 ? hairC : shade(hairC, i % 2 ? .1 : -.14) })));
        blobs.slice(0, 11).forEach(([x, y, r]) => hairFront.appendChild(S('path', { d: `M${x - r * .55},${y - r * .35} q${r * .55},-${r * .5} ${r * 1.1},0`, fill: 'none', stroke: hairHi, 'stroke-width': 1.5, opacity: .4, 'stroke-linecap': 'round' })));
        add(hairFront, 'M-47,-92 L-44,-68 L-41,-74 L-42,-96Z', hairC); add(hairFront, 'M47,-92 L44,-68 L41,-74 L42,-96Z', hairC);
        break;
      }
      case 'bald': { // Sam: bald, grey fringe above ears
        add(hairFront, 'M-49,-98 C-53,-88 -52,-74 -47,-66 L-44,-72 C-46,-80 -46,-90 -45,-98Z', hairC, { opacity: .9 });
        add(hairFront, 'M49,-98 C53,-88 52,-74 47,-66 L44,-72 C46,-80 46,-90 45,-98Z', hairC, { opacity: .9 });
        sheen(hairFront, 'M-22,-122 C-6,-132 18,-132 30,-122 C14,-127 -6,-127 -22,-122Z', .3);
        hairFront.appendChild(S('ellipse', { cx: -14, cy: -118, rx: 12, ry: 5, fill: '#fff', opacity: .18, transform: 'rotate(-14 -14 -118)' }));
        break;
      }
      case 'bob': { // Nora: silver bob with fringe
        const back = symPath([0, -148], [['C', [32, -148], [58, -132], [60, -104]], ['C', [68, -76], [66, -40], [60, -12]], ['C', [56, 2], [46, 8], [38, 3]], ['L', [0, -8]]]);
        add(hairBack, back, hairC); add(hairBack, back, 'url(#shadeSide)', { opacity: .4 });
        strands(hairBack, ['M-56,-70 C-60,-40 -58,-14 -52,0', 'M56,-70 C60,-40 58,-14 52,0'], hairHi, 1.6, .45);
        const cap = 'M-45,-70 C-49,-86 -50,-104 -45,-118 C-38,-136 -18,-146 4,-146 C30,-146 50,-132 52,-110 C54,-94 50,-80 46,-66 L43,-68 C44,-80 42,-90 38,-98 C30,-108 14,-112 -2,-111 C-18,-110 -32,-104 -39,-94 C-42,-88 -43,-78 -45,-70Z';
        add(hairFront, cap, hairC); add(hairFront, cap, 'url(#shadeSide)', { opacity: .35 });
        sheen(hairFront, 'M-12,-142 C14,-148 40,-138 48,-118 C34,-130 12,-136 -12,-142Z', .5);
        strands(hairFront, ['M-34,-122 C-20,-118 -6,-116 8,-118', 'M-24,-132 C-8,-126 8,-124 24,-128', 'M2,-142 L2,-114', 'M26,-126 C34,-122 40,-114 43,-104'], hairHi, 1.2, .55);
        break;
      }
      case 'slick': { // older man, combed short
        const cap = 'M-47,-78 C-50,-92 -51,-106 -46,-118 C-38,-136 -18,-144 4,-144 C28,-144 48,-134 50,-114 C52,-100 50,-88 46,-78 L44,-84 C43,-94 40,-102 36,-108 C26,-114 10,-116 -6,-114 C-22,-112 -34,-106 -40,-98 C-43,-92 -44,-86 -47,-78Z';
        add(hairFront, cap, hairC); add(hairFront, cap, 'url(#shadeSide)', { opacity: .4 });
        sheen(hairFront, 'M-14,-140 C14,-146 40,-136 48,-116 C34,-130 12,-136 -14,-140Z', .5);
        strands(hairFront, ['M-34,-124 C-14,-130 10,-130 32,-122', 'M-40,-112 C-18,-122 10,-122 38,-110'], hairHi, 1.3, .5);
        break;
      }
      case 'ponytail': {
        add(hairBack, 'M30,-124 C62,-122 82,-80 66,-34 C60,-14 74,6 62,22 C48,10 58,-14 50,-34 C42,-56 44,-92 30,-124Z', hairC);
        const cap = 'M-47,-72 C-51,-86 -52,-104 -47,-118 C-40,-136 -20,-145 2,-145 C28,-145 48,-134 51,-114 C53,-100 50,-84 46,-72 L44,-74 C44,-84 42,-94 38,-102 C30,-112 14,-117 0,-118 C-14,-117 -30,-112 -38,-102 C-42,-94 -44,-84 -44,-74Z';
        add(hairFront, cap, hairC); add(hairFront, cap, 'url(#shadeSide)', { opacity: .45 });
        sheen(hairFront, 'M-14,-141 C10,-147 36,-140 46,-122 C32,-134 10,-138 -14,-141Z', .38);
        break;
      }
      default: break;
    }
  }

  global.Art.makeFigure = makeFigure;
  global.Art.EXPR = EXPR; global.Art.HANDS = HANDS; global.Art.shade = shade;
})(window);
