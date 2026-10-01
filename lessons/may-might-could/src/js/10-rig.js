/* 10-rig: parametric articulated SVG characters (adults, ~6.5 heads tall) */
(function () {
  'use strict';
  const FE = window.FE;
  const { el, clamp } = FE;

  /* ---------- colour helpers ---------- */
  function hex2hsl(hex) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0); else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function hsl2hex(h, s, l) {
    h = ((h % 360) + 360) % 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1);
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
    const to = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return '#' + to(r) + to(g) + to(b);
  }
  FE.shade = (hex, dl, ds = 0, dh = 0) => { const [h, s, l] = hex2hsl(hex); return hsl2hex(h + dh, s + ds, l + dl); };

  let UID = 0;

  /* ---------- hand shapes (wrist at 0,0; fingers toward +y) ---------- */
  const HANDS = {
    open: 'M-10,0 C-14,10 -14,24 -10,31 C-6,36 6,36 10,31 C14,24 14,10 10,0Z M-9,9 C-19,12 -22,23 -16,27 C-12,23 -10,17 -7,13Z',
    fist: 'M-10,0 C-14,8 -13,22 -9,26 C-4,29 4,29 9,26 C13,22 14,8 10,0Z M-9,8 C-17,10 -18,20 -12,23Z',
    point: 'M-10,0 C-14,8 -13,20 -9,23 C-4,25 4,25 9,23 C13,20 14,8 10,0Z M-9,8 C-17,10 -18,18 -12,21Z M-2,20 C-2,30 -2,40 0,46 C2,47 5,46 5,40 C6,32 6,26 5,20Z',
    flat: 'M-11,0 C-14,12 -13,30 -9,38 C-5,42 5,42 9,38 C13,30 14,12 11,0Z M-10,8 C-20,12 -23,22 -17,26 C-13,22 -11,17 -8,13Z',
    pinch: 'M-9,0 C-13,8 -12,20 -8,24 C-3,27 4,26 8,22 C11,16 12,8 9,0Z M-8,8 C-16,12 -16,22 -10,24Z',
  };

  /* ---------- held props (origin at palm; +y along forearm) ---------- */
  const PROPS = {
    phone: '<g transform="translate(0,22)"><rect x="-15" y="-6" width="30" height="58" rx="6" fill="#1b2230" stroke="#0c111a" stroke-width="2"/><rect x="-12" y="-1" width="24" height="46" rx="3" fill="#7fd4ff"/><rect x="-12" y="-1" width="24" height="18" rx="3" fill="#bfeaff" opacity=".7"/></g>',
    clipboard: '<g transform="translate(-6,26) rotate(-8)"><rect x="-34" y="-6" width="68" height="92" rx="6" fill="#8a5a33" stroke="#5a3820" stroke-width="2"/><rect x="-27" y="3" width="54" height="76" rx="3" fill="#fbf8ef"/><rect x="-12" y="-12" width="24" height="14" rx="4" fill="#9aa3ad" stroke="#5b636c" stroke-width="2"/><path d="M-19 20h38M-19 32h38M-19 44h30M-19 56h34" stroke="#b9c2cc" stroke-width="3" stroke-linecap="round"/></g>',
    cup: '<g transform="translate(0,16)"><path d="M-14 -4h28l-4 40h-20z" fill="#f6efe2" stroke="#b8a98f" stroke-width="2"/><path d="M-12.5 8h25l-1 10h-23z" fill="#c8553d"/><rect x="-16" y="-8" width="32" height="7" rx="3" fill="#e8dfcd" stroke="#b8a98f" stroke-width="2"/></g>',
    tablet: '<g transform="translate(-4,22) rotate(-6)"><rect x="-32" y="-4" width="64" height="86" rx="7" fill="#262c38" stroke="#10141b" stroke-width="2"/><rect x="-27" y="3" width="54" height="72" rx="3" fill="#dff1ff"/><rect x="-22" y="9" width="44" height="22" rx="3" fill="#8fc4f0"/><path d="M-22 40h44M-22 50h30M-22 60h38" stroke="#9db4c9" stroke-width="3" stroke-linecap="round"/></g>',
    umbrella: '<g transform="translate(0,8)"><path d="M0 -60 L0 70" stroke="#2c3442" stroke-width="5" stroke-linecap="round"/><path d="M0 -62 C-16 -50 -18 -20 -10 6 L10 6 C18 -20 16 -50 0 -62Z" fill="#3c5fa8" stroke="#243c70" stroke-width="2"/><path d="M0 70 q0 12 -10 10" stroke="#2c3442" stroke-width="5" fill="none" stroke-linecap="round"/></g>',
    folder: '<g transform="translate(-4,22) rotate(-5)"><rect x="-30" y="-2" width="60" height="78" rx="4" fill="#d9a441" stroke="#a67b25" stroke-width="2"/><path d="M-30 6h24l6 -8h24" stroke="#a67b25" stroke-width="2" fill="none"/></g>',
    coffee: '<g transform="translate(0,14)"><path d="M-13 -2h26l-3 32h-20z" fill="#fbf6ee" stroke="#a89a82" stroke-width="2"/><path d="M-11 10h22l-1 8h-20z" fill="#3a7ca5"/><path d="M13 6c9 0 9 16 0 16" fill="none" stroke="#a89a82" stroke-width="3"/></g>',
    pen: '<g transform="translate(0,14) rotate(18)"><rect x="-2.5" y="-4" width="5" height="48" rx="2" fill="#243b6b"/><path d="M-2.5 44h5l-2.5 9z" fill="#222"/></g>',
  };

  /* ---------- hair styles in head-local coordinates (head centre 0,0) ---------- */
  const HAIR = {
    crop: (c, h) => ({
      back: '',
      front: `<path d="M-45,-8 C-50,-44 -28,-66 2,-66 C32,-66 52,-46 45,-8 C43,-24 34,-34 20,-37 C8,-30 -12,-35 -26,-33 C-36,-30 -43,-22 -45,-8Z" fill="${c}"/>
              <path d="M-30,-48 C-18,-60 10,-62 28,-54" stroke="${h}" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".55"/>`,
    }),
    sidePart: (c, h) => ({
      back: '',
      front: `<path d="M-45,-6 C-52,-46 -26,-68 6,-67 C38,-66 54,-44 45,-6 C44,-22 38,-32 28,-38 C14,-26 -6,-34 -20,-32 C-34,-30 -43,-20 -45,-6Z" fill="${c}"/>
              <path d="M-4,-64 C-8,-50 -4,-42 -12,-33" stroke="${FE.shade(c, -0.08)}" stroke-width="2.5" fill="none"/>
              <path d="M-34,-50 C-20,-62 14,-64 34,-52" stroke="${h}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>`,
    }),
    curly: (c, h) => {
      let s = ''; const r = FE.rng(7);
      const pts = [[-44,-10],[-47,-26],[-40,-42],[-28,-55],[-12,-62],[6,-64],[22,-60],[35,-50],[44,-36],[48,-20],[45,-8],[-26,-44],[-10,-50],[8,-52],[24,-46],[0,-40],[-18,-36],[16,-34]];
      pts.forEach((p, i) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="${i < 11 ? 14 + r() * 3 : 12}" fill="${i % 3 === 0 ? FE.shade(c, 0.04) : c}"/>`; });
      return { back: '', front: s + `<path d="M-30,-18 C-20,-30 20,-30 30,-18 C26,-30 -26,-30 -30,-18Z" fill="${FE.shade(c, -0.05)}" opacity=".0"/>` };
    },
    wavy: (c, h) => ({
      back: `<path d="M-54,-18 C-70,28 -62,92 -44,126 C-20,134 20,134 44,126 C62,92 70,28 54,-18 C52,-62 -52,-62 -54,-18Z" fill="${FE.shade(c, -0.04)}"/>`,
      front: `<path d="M-48,0 C-56,-48 -26,-70 6,-69 C40,-68 58,-42 48,2 C46,-14 38,-30 26,-38 C8,-28 -18,-34 -30,-28 C-40,-18 -42,-4 -44,18 C-46,36 -50,44 -46,60 C-54,44 -52,18 -48,0Z" fill="${c}"/>
              <path d="M-40,-36 C-22,-60 22,-62 40,-40" stroke="${h}" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".5"/>
              <path d="M44,0 C50,20 50,44 46,62" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    }),
    long: (c, h) => ({
      back: `<path d="M-52,-20 C-68,40 -62,120 -48,176 L48,176 C62,120 68,40 52,-20 C50,-62 -50,-62 -52,-20Z" fill="${FE.shade(c, -0.03)}"/>`,
      front: `<path d="M0,-69 C-34,-68 -56,-46 -50,2 C-50,34 -54,70 -50,100 C-38,90 -34,50 -36,14 C-34,-8 -26,-30 0,-40 C26,-30 34,-8 36,14 C34,50 38,90 50,100 C54,70 50,34 50,2 C56,-46 34,-68 0,-69Z" fill="${c}"/>
              <path d="M-24,-56 C-10,-64 12,-64 26,-56" stroke="${h}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>`,
    }),
    bun: (c, h) => ({
      back: `<circle cx="0" cy="-70" r="23" fill="${FE.shade(c, -0.03)}"/><path d="M-14,-72 C-6,-82 8,-82 14,-72" stroke="${h}" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>`,
      front: `<path d="M-46,-4 C-52,-44 -26,-64 0,-64 C26,-64 52,-44 46,-4 C44,-22 34,-34 22,-38 C8,-30 -8,-30 -22,-38 C-34,-34 -44,-22 -46,-4Z" fill="${c}"/>
              <path d="M0,-63 L0,-38" stroke="${FE.shade(c, -0.1)}" stroke-width="2"/>`,
    }),
    shortBeard: (c, h) => ({
      back: '',
      front: `<path d="M-46,-4 C-54,-44 -30,-67 2,-66 C34,-66 56,-44 46,-4 C44,-18 38,-28 30,-33 C20,-22 4,-34 -10,-32 C-24,-34 -38,-26 -46,-4Z" fill="${c}"/>
              <path d="M-36,-48 C-18,-62 18,-62 38,-48" stroke="${h}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>`,
    }),
  };

  /* ---------- the character class ---------- */
  class Char {
    constructor(def) {
      this.def = def; this.id = def.id; this.uid = 'c' + (++UID);
      this.P = {
        x: 0, y: 0, s: 1, flip: 1,
        lean: 0, bob: 0, sway: 0, shr: 0, chest: 0,
        headRot: 0, headX: 0, headY: 0, lookX: 0, lookY: 0, blink: 0,
        brow: 0, browA: 0, mo: 0, sm: 0.25, mw: 1,
        LA: 6, LB: 8, LW: 0, LU: 1, LF: 1,
        RA: 6, RB: 8, RW: 0, RU: 1, RF: 1,
        llA: 0, llB: 0, rlA: 0, rlB: 0,
        alpha: 1,
      };
      this.handL = 'open'; this.handR = 'open'; this.propL = null; this.propR = null;
      this.grads = {};
      this.t = Math.random() * 20; this.nextBlink = 1.5 + Math.random() * 2.5; this.blinkT = -1;
      this.nextSacc = 1 + Math.random() * 2; this.sacc = { x: 0, y: 0 };
      this.walking = false; this.walkPh = 0;
      this.talk = null; this.talkAmp = 0; this.talkAvg = 0; this.talkClock = 0;
      this.gestureSide = 1; this.seated = false;
      this.idle = true;
      this.build();
      this.render(0);
    }

    grad(color, dir = 'h') {
      const key = color + dir;
      if (this.grads[key]) return `url(#${this.grads[key]})`;
      const id = `${this.uid}g${Object.keys(this.grads).length}`;
      this.grads[key] = id;
      const [x2, y2] = dir === 'h' ? [1, 0.25] : [0.3, 1];
      this.defs.insertAdjacentHTML('beforeend',
        `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${FE.shade(color, 0.07)}"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="${FE.shade(color, -0.13)}"/></linearGradient>`);
      return `url(#${id})`;
    }

    build() {
      const d = this.def, u = this.uid;
      const skin = d.skin, skinS = FE.shade(skin, -0.12, 0.02), skinH = FE.shade(skin, 0.07);
      const male = d.build === 'm';
      const sx = male ? 60 : 53;   // shoulder x
      const cw = male ? 55 : 45;   // chest half-width
      const ww = male ? 48 : 38;   // waist half-width
      const hw = male ? 51 : 52;   // hip half-width
      this.geo = { sx, cw, ww, hw };
      const root = (this.el = el('g', { class: 'char', 'data-char': d.id }));
      this.defs = el('defs'); root.appendChild(this.defs);
      this.defs.innerHTML =
        `<radialGradient id="${u}sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset=".6" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
         <radialGradient id="${u}iris" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="${FE.shade(d.eye, 0.14)}"/><stop offset="1" stop-color="${FE.shade(d.eye, -0.1)}"/></radialGradient>
         <linearGradient id="${u}fore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".45" stop-color="#000" stop-opacity="0"/></linearGradient>
         <radialGradient id="${u}blush" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${d.blush || '#e0707a'}" stop-opacity=".32"/><stop offset="1" stop-color="${d.blush || '#e0707a'}" stop-opacity="0"/></radialGradient>
         <clipPath id="${u}headclip"><path d="${this.headPath()}"/></clipPath>
         <clipPath id="${u}eyeL"><ellipse cx="-17" cy="-3" rx="9.6" ry="6.6"/></clipPath>
         <clipPath id="${u}eyeR"><ellipse cx="17" cy="-3" rx="9.6" ry="6.6"/></clipPath>
         <clipPath id="${u}mouth"><path id="${u}mpath" d=""/></clipPath>`;

      // floor shadow (stays on ground; drawn by scene via this.shadow)
      this.shadow = el('ellipse', { cx: 0, cy: 4, rx: 118, ry: 22, fill: `url(#${u}sh)` });
      root.appendChild(this.shadow);

      this.body = el('g', { class: 'body' }); root.appendChild(this.body);
      // legs
      this.legBackG = el('g'); this.legFrontG = el('g');
      const leg = (side) => {
        const px = side * 21;
        const pants = d.bottom, pg = this.grad(pants);
        const g = el('g', { transform: `translate(${px},-262)` });
        const thigh = el('g'); const shinG = el('g', { transform: 'translate(0,128)' });
        thigh.innerHTML = `<path d="M-23,-6 C-26,40 -22,92 -17,128 L17,128 C22,92 26,40 23,-6Z" fill="${pg}"/><path d="M0,-4 L0,126" stroke="${FE.shade(pants, -0.08)}" stroke-width="1.5" opacity=".5"/><circle cx="0" cy="128" r="17" fill="${pg}"/>`;
        shinG.innerHTML = `<path d="M-17,0 C-17,40 -14,90 -12.5,114 L12.5,114 C14,90 17,40 17,0Z" fill="${pg}"/>
          <g transform="translate(0,116)"><path d="M-12,-4 L12,-4 L13,6 C20,8 27,12 27,20 L27,26 L-24,26 L-24,20 C-24,12 -16,8 -13,6Z" transform="translate(${side * 3},-10)" fill="${this.grad(d.shoes)}"/><rect x="-26" y="14" width="53" height="5" rx="2.5" fill="${FE.shade(d.shoes, -0.2)}" transform="translate(${side * 3},0)"/></g>`;
        g.appendChild(thigh); thigh.appendChild(shinG);
        return { g, thigh, shinG };
      };
      this.legL = leg(-1); this.legR = leg(1);
      this.body.appendChild(this.legL.g); this.body.appendChild(this.legR.g);

      // upper body (rotates about the hips)
      this.upper = el('g', { class: 'upper' }); this.body.appendChild(this.upper);
      this.hairBack = el('g'); this.upper.appendChild(this.hairBack);
      // arms (back layer: behind torso) — we draw both arms in front for expressive crossing; torso first
      this.torso = el('g'); this.upper.appendChild(this.torso);
      this.torso.innerHTML = this.torsoSVG();
      this.neck = el('g', { transform: 'translate(0,-430)' });
      this.upper.appendChild(this.neck);
      this.neck.innerHTML =
        `<path d="M-17,-8 L-17,16 C-17,26 17,26 17,16 L17,-8Z" fill="${this.grad(skin)}"/><path d="M-17,-2 C-8,10 8,10 17,-2 L17,6 C8,18 -8,18 -17,6Z" fill="#000" opacity=".1"/>`;
      this.armL = this.makeArm(-1); this.armR = this.makeArm(1);
      this.upper.appendChild(this.armL.g); this.upper.appendChild(this.armR.g);
      this.head = el('g', { class: 'head' }); this.upper.appendChild(this.head);
      this.buildHead();
    }

    headPath() {
      const j = this.def.jaw || 1;
      const jx = 30 * j, jy = 46;
      return `M0,-50 C26,-50 42,-34 42,-8 C42,20 ${jx},${jy} 0,52 C${-jx},${jy} -42,20 -42,-8 C-42,-34 -26,-50 0,-50Z`;
    }

    torsoSVG() {
      const d = this.def, { sx, cw, ww, hw } = this.geo, t = d.top, male = d.build === 'm';
      const skin = d.skin;
      const inner = t.inner || '#f4efe6';
      let s = '';
      const hem = t.style === 'dress' ? -138 : t.style === 'blazer' ? -228 : -240;
      // base shape (outer)
      const outer = (col, wExtra = 0) =>
        `M${-17 - wExtra},-433 C${-30},-436 ${-sx + 10},-428 ${-sx},-408 C${-sx - 4},-392 ${-cw - 4},-372 ${-cw - 2},-352 C${-ww - 6},-320 ${-ww - 6},-290 ${-hw - 3},${hem}
         L${hw + 3},${hem} C${ww + 6},-290 ${ww + 6},-320 ${cw + 2},-352 C${cw + 4},-372 ${sx + 4},-392 ${sx},-408 C${sx - 10},-428 30,-436 ${17 + wExtra},-433Z`;
      if (t.style === 'dress') {
        s += `<path d="M${-ww - 6},-300 C${-hw - 14},-220 ${-hw - 26},-170 ${-hw - 30},${hem} L${hw + 30},${hem} C${hw + 26},-170 ${hw + 14},-220 ${ww + 6},-300Z" fill="${this.grad(t.color)}"/>`;
      }
      // inner shirt/ chest
      s += `<path d="${outer()}" fill="${this.grad(t.style === 'blazer' || t.style === 'cardigan' ? inner : t.color)}"/>`;
      if (t.style === 'blazer' || t.style === 'cardigan') {
        // jacket panels with open V
        s += `<path d="M${-17},-433 C-30,-436 ${-sx + 10},-428 ${-sx},-408 C${-sx - 4},-392 ${-cw - 4},-372 ${-cw - 2},-352 C${-ww - 6},-320 ${-ww - 6},-290 ${-hw - 3},${hem} L-6,${hem} C-10,-330 -16,-380 -17,-433Z" fill="${this.grad(t.color)}"/>
              <path d="M${17},-433 C30,-436 ${sx - 10},-428 ${sx},-408 C${sx + 4},-392 ${cw + 4},-372 ${cw + 2},-352 C${ww + 6},-320 ${ww + 6},-290 ${hw + 3},${hem} L6,${hem} C10,-330 16,-380 17,-433Z" fill="${this.grad(t.color)}"/>
              <path d="M-17,-433 L-26,-410 L-9,-372 L-3,-400Z" fill="${FE.shade(t.color, 0.07)}" stroke="${FE.shade(t.color, -0.15)}" stroke-width="1.4"/>
              <path d="M17,-433 L26,-410 L9,-372 L3,-400Z" fill="${FE.shade(t.color, 0.07)}" stroke="${FE.shade(t.color, -0.15)}" stroke-width="1.4"/>
              <path d="M-6,${hem} C-10,-330 -16,-380 -17,-433" stroke="${FE.shade(t.color, -0.16)}" stroke-width="1.6" fill="none"/>
              <path d="M6,${hem} C10,-330 16,-380 17,-433" stroke="${FE.shade(t.color, -0.16)}" stroke-width="1.6" fill="none"/>
              <path d="M${-ww - 2},-290 C-30,-296 -20,-292 -14,-296" stroke="${FE.shade(t.color, -0.14)}" stroke-width="2" fill="none" opacity=".6"/>`;
        // shirt collar
        s += `<path d="M-17,-433 L-3,-400 L-14,-396Z M17,-433 L3,-400 L14,-396Z" fill="${FE.shade(inner, 0.04)}" opacity=".0"/>`;
        if (t.tie) s += `<path d="M-5,-420 L5,-420 L8,-396 L0,-300 L-8,-396Z" fill="${t.tie}"/>`;
      } else if (t.style === 'sweater') {
        s += `<path d="M-17,-433 C-10,-418 10,-418 17,-433 L22,-428 C10,-406 -10,-406 -22,-428Z" fill="${FE.shade(t.color, -0.08)}"/>
              <path d="M${-hw - 3},${hem} L${hw + 3},${hem} L${hw + 3},${hem + 12} L${-hw - 3},${hem + 12}Z" fill="${FE.shade(t.color, -0.1)}"/>`;
        if (t.collar) s += `<path d="M-19,-433 L-5,-410 L-20,-404Z M19,-433 L5,-410 L20,-404Z" fill="${t.collar}"/>`;
      } else if (t.style === 'shirt') {
        s += `<path d="M-17,-433 L0,-402 L17,-433 L24,-424 L0,-386 L-24,-424Z" fill="${FE.shade(t.color, 0.06)}" stroke="${FE.shade(t.color, -0.12)}" stroke-width="1.4"/>
              <path d="M0,-390 L0,${hem}" stroke="${FE.shade(t.color, -0.12)}" stroke-width="1.4"/>`;
        for (let i = 0; i < 4; i++) s += `<circle cx="0" cy="${-370 + i * 36}" r="2.2" fill="${FE.shade(t.color, -0.2)}"/>`;
      } else if (t.style === 'blouse' || t.style === 'dress') {
        s += `<path d="M-17,-433 C-8,-412 8,-412 17,-433 L22,-426 C10,-396 -10,-396 -22,-426Z" fill="${FE.shade(skin, 0)}"/>
              <path d="M-22,-426 C-10,-396 10,-396 22,-426" stroke="${FE.shade(t.color, -0.14)}" stroke-width="2" fill="none"/>`;
      }
      // belt / waistline hint
      if (t.belt) s += `<rect x="${-hw - 2}" y="-272" width="${hw * 2 + 4}" height="9" fill="${t.belt}"/><rect x="-7" y="-274" width="14" height="13" rx="2" fill="#d8b86a"/>`;
      // contour shadow at the waist
      s += `<path d="M${-cw},-352 C${-ww},-322 ${-ww},-296 ${-hw},${hem}" stroke="#000" stroke-opacity=".08" stroke-width="10" fill="none"/>`;
      if (d.badge) s += `<g transform="translate(-24,-330)"><path d="M0,-14 L0,-30" stroke="${d.badge}" stroke-width="3"/><rect x="-9" y="0" width="22" height="30" rx="3" fill="#fff" stroke="${d.badge}" stroke-width="2"/><circle cx="2" cy="10" r="5" fill="${d.badge}" opacity=".6"/><rect x="-5" y="19" width="14" height="3" rx="1.5" fill="${d.badge}" opacity=".5"/></g>`;
      if (d.necklace) s += `<path d="M-18,-432 C-10,-410 10,-410 18,-432" stroke="${d.necklace}" stroke-width="2.4" fill="none"/><circle cx="0" cy="-413" r="4" fill="${d.necklace}"/>`;
      if (d.scarf) s += `<path d="M-20,-436 C-6,-420 6,-420 20,-436 L26,-422 C10,-402 -10,-402 -26,-422Z" fill="${d.scarf}"/><path d="M6,-410 L22,-360 L10,-356 L0,-396Z" fill="${FE.shade(d.scarf, -0.08)}"/>`;
      return s;
    }

    makeArm(side) {
      const d = this.def, t = d.top, sleeve = t.sleeve || t.color, cuff = t.cuff || null;
      const skin = d.skin;
      const longSleeve = t.style !== 'sleeveless' && t.sleeveLen !== 'short';
      const g = el('g', { transform: `translate(${side * (this.geo.sx - 2)},-408)` });
      const up = el('g'); const fore = el('g', { transform: 'translate(0,88)' });
      const sg = this.grad(sleeve), kg = this.grad(skin);
      up.innerHTML = `<circle cx="0" cy="0" r="17" fill="${sg}"/><path d="M-16,0 C-17,30 -14,60 -13,88 L13,88 C14,60 17,30 16,0Z" fill="${sg}"/><circle cx="0" cy="88" r="13.5" fill="${sg}"/>`;
      const fl = longSleeve
        ? `<path d="M-13,0 C-13,26 -11,52 -10,70 L10,70 C11,52 13,26 13,0Z" fill="${sg}"/>${cuff ? `<rect x="-11" y="66" width="22" height="9" rx="3" fill="${cuff}"/>` : ''}<path d="M-10,72 C-10,76 10,76 10,72 L10,80 L-10,80Z" fill="${kg}"/>`
        : `<path d="M-12,0 C-12,26 -10,52 -9,78 L9,78 C10,52 12,26 12,0Z" fill="${kg}"/><path d="M-14,-2 C-14,12 14,12 14,-2 L14,10 C14,18 -14,18 -14,10Z" fill="${sg}"/>`;
      fore.innerHTML = `${fl}<g class="hand" transform="translate(0,78)"><path class="hp" d="${HANDS.open}" fill="${kg}" stroke="${FE.shade(skin, -0.2)}" stroke-width="1.2" stroke-linejoin="round"/><g class="prop"></g></g>`;
      up.appendChild(fore); g.appendChild(up);
      return { g, up, fore, hp: fore.querySelector('.hp'), prop: fore.querySelector('.prop'), side };
    }

    buildHead() {
      const d = this.def, u = this.uid, h = this.head;
      const skin = d.skin, skinS = FE.shade(skin, -0.1, 0.02);
      const hair = HAIR[d.hair.style](d.hair.color, d.hair.hi || FE.shade(d.hair.color, 0.22));
      this.hairBack.innerHTML = '';
      const hb = el('g', { transform: 'translate(0,-492)' }); hb.innerHTML = hair.back; this.hairBack.appendChild(hb);
      h.innerHTML = '';
      const g = (this.faceG = el('g', { transform: 'translate(0,-492)' })); h.appendChild(g);
      let s = '';
      // ears
      s += `<ellipse cx="-42" cy="-1" rx="6.5" ry="11" fill="${this.grad(skin)}"/><ellipse cx="42" cy="-1" rx="6.5" ry="11" fill="${this.grad(skin)}"/>
            <path d="M-43,-5 C-45,0 -44,4 -42,6M43,-5 C45,0 44,4 42,6" stroke="${skinS}" stroke-width="1.6" fill="none"/>`;
      // head
      s += `<path d="${this.headPath()}" fill="${this.grad(skin, 'v')}"/>`;
      s += `<g clip-path="url(#${u}headclip)">
              <rect x="-50" y="-52" width="100" height="44" fill="url(#${u}fore)"/>
              <path d="M-48,10 C-30,52 30,52 48,10 L48,60 L-48,60Z" fill="#000" opacity=".06"/>
              <circle cx="-27" cy="14" r="11" fill="url(#${u}blush)"/><circle cx="27" cy="14" r="11" fill="url(#${u}blush)"/>
              <path d="M30,-44 C44,-30 46,0 38,24" stroke="#fff" stroke-opacity=".12" stroke-width="5" fill="none"/>
            </g>`;
      // beard (under mouth)
      if (d.beard) {
        s += `<path fill-rule="evenodd" d="M-43,-2 C-46,32 -26,60 0,62 C26,60 46,32 43,-2 C38,18 28,30 14,34 C6,30 -6,30 -14,34 C-28,30 -38,18 -43,-2Z M-14,24 C-8,34 8,34 14,24 C8,18 -8,18 -14,24Z" fill="${d.beard}"/>`;
      }
      // nose
      s += `<path d="M-3,2 C-6,10 -8,13 -5,16 C-2,18 2,18 5,16 C8,13 6,10 3,2" stroke="${FE.shade(skin, -0.16, 0.03)}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>
            <path d="M-6,16 C-3,19 3,19 6,16" stroke="${FE.shade(skin, -0.2)}" stroke-width="1.6" fill="none" opacity=".7"/>`;
      // eyes
      const eye = (sx, clip) => `<g transform="translate(${sx},0)">
          <ellipse cx="0" cy="-3" rx="9.6" ry="6.6" fill="#fdfbf7" stroke="${FE.shade(skin, -0.25)}" stroke-width="1"/>
          <g clip-path="url(#${clip})"><g class="iris"><circle r="5.2" cy="-3" fill="url(#${u}iris)"/><circle r="2.5" cy="-3" fill="#0b0b10"/><circle cx="-1.8" cy="-4.8" r="1.5" fill="#fff"/><circle cx="1.6" cy="-1.6" r=".8" fill="#fff" opacity=".7"/></g>
          <rect class="lid" x="-11" y="-11" width="22" height="16" fill="${skinS}"/></g>
          <path class="lash" d="M-10.5,-3.4 C-6,-9.8 6,-9.8 10.5,-3.4" stroke="${d.lash || '#1f1a1a'}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          ${d.build === 'f' ? `<path d="M10,-5 L14,-8M8.4,-7.4 L11.6,-11" stroke="${d.lash || '#1f1a1a'}" stroke-width="1.5" stroke-linecap="round"/>` : ''}
        </g>`;
      s += eye(-17, u + 'eyeL').replace('translate(-17,0)', 'translate(0,0)').replace(/cx="0"/g, 'cx="-17"');
      s = s; // eyes handled via explicit groups below
      g.innerHTML = s;
      // build eyes explicitly (clipPaths use absolute coords, so no translate)
      const eyeG = (cx, clip, mirror) => {
        const e = el('g', {});
        e.innerHTML = `
          <ellipse cx="${cx}" cy="-3" rx="9.6" ry="6.6" fill="#fdfbf7" stroke="${FE.shade(skin, -0.25)}" stroke-width="1"/>
          <g clip-path="url(#${u}${clip})"><g class="iris"><circle cx="${cx}" cy="-3" r="5.3" fill="url(#${u}iris)"/><circle cx="${cx}" cy="-3" r="2.5" fill="#0b0b10"/><circle cx="${cx - 1.8}" cy="-4.8" r="1.5" fill="#fff"/><circle cx="${cx + 1.6}" cy="-1.6" r=".8" fill="#fff" opacity=".7"/></g>
          <rect class="lid" x="${cx - 11}" y="-11" width="22" height="16" fill="${FE.shade(skin, -0.05)}"/></g>
          <path class="lash" d="M${cx - 10.5},-3.4 C${cx - 6},-9.8 ${cx + 6},-9.8 ${cx + 10.5},-3.4" stroke="${d.lash || '#1f1a1a'}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          ${d.build === 'f' ? `<path d="M${cx + mirror * 9.4},-5.2 L${cx + mirror * 13.4},-8.6" stroke="${d.lash || '#1f1a1a'}" stroke-width="1.6" stroke-linecap="round"/>` : ''}`;
        return e;
      };
      g.innerHTML = s.split('<g transform="translate(0,0)">')[0]; // drop the placeholder eye markup
      const eyes = el('g'); g.appendChild(eyes);
      const eL = eyeG(-17, 'eyeL', -1), eR = eyeG(17, 'eyeR', 1);
      eyes.appendChild(eL); eyes.appendChild(eR);
      this.irisEls = FE.$$('.iris', eyes); this.lidEls = FE.$$('.lid', eyes); this.lashEls = FE.$$('.lash', eyes);
      // brows
      this.browL = el('path', { fill: d.hair.color === '#1d1a1a' ? '#1d1a1a' : FE.shade(d.hair.color, -0.04) });
      this.browR = el('path', { fill: FE.shade(d.hair.color, -0.04) });
      g.appendChild(this.browL); g.appendChild(this.browR);
      // mouth
      this.mouthG = el('g'); g.appendChild(this.mouthG);
      this.mouthBack = el('path', { fill: '#4a1a22' });
      this.teeth = el('rect', { fill: '#fffdf7', 'clip-path': `url(#${u}mouth)` });
      this.tongue = el('ellipse', { fill: '#cf6270', 'clip-path': `url(#${u}mouth)` });
      this.lipU = el('path', { fill: 'none', stroke: d.lip, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      this.lipL = el('path', { fill: 'none', stroke: FE.shade(d.lip, 0.06), 'stroke-width': 3.6, 'stroke-linecap': 'round' });
      [this.mouthBack, this.teeth, this.tongue, this.lipL, this.lipU].forEach((n) => this.mouthG.appendChild(n));
      this.mpath = this.defs.querySelector(`#${u}mpath`);
      // mustache
      if (d.mustache) {
        const m = el('path', { d: 'M-17,24 C-10,15 -3,18 0,21 C3,18 10,15 17,24 C10,30 4,26 0,26 C-4,26 -10,30 -17,24Z', fill: d.mustache });
        this.mustacheEl = m; g.appendChild(m);
      }
      // hair front
      const hf = el('g'); hf.innerHTML = hair.front; g.appendChild(hf);
      if (d.glasses) {
        g.appendChild(el('g', {}, `<g fill="${d.glassTint || 'rgba(160,210,255,.12)'}" stroke="${d.glasses}" stroke-width="3" stroke-linejoin="round">
            <rect x="-33" y="-16" width="27" height="21" rx="7"/><rect x="6" y="-16" width="27" height="21" rx="7"/></g>
            <path d="M-6,-8 C-2,-11 2,-11 6,-8" stroke="${d.glasses}" stroke-width="2.6" fill="none"/>
            <path d="M-33,-9 L-42,-8M33,-9 L42,-8" stroke="${d.glasses}" stroke-width="2.6"/>
            <path d="M-29,-12 L-20,-12M10,-12 L19,-12" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>`));
      }
      if (d.earring) g.appendChild(el('g', {}, `<circle cx="-42" cy="12" r="3.2" fill="${d.earring}"/><circle cx="42" cy="12" r="3.2" fill="${d.earring}"/>`));
    }

    /* ---------- pose control ---------- */
    to(props, dur = 0.7, ease = 'inOut', delay = 0) { FE.Tween.to(this.P, props, dur, ease, delay); return this; }
    set(props) { Object.assign(this.P, props); return this; }
    hands(l, r) { if (l) this.handL = l; if (r) this.handR = r; this._handsDirty = true; return this; }
    hold(propL, propR) { this.propL = propL; this.propR = propR; this._handsDirty = true; return this; }
    pose(name, dur = 0.8, ease = 'inOut') {
      const p = Char.POSES[name]; if (!p) { console.warn('pose?', name); return this; }
      const { hands, hold, ...rest } = p;
      const base = { LA: 6, LB: 8, LW: 0, LU: 1, LF: 1, RA: 6, RB: 8, RW: 0, RU: 1, RF: 1, lean: 0, shr: 0, headRot: 0, headY: 0, headX: 0 };
      this.to(Object.assign({}, base, rest), dur, ease);
      this.hands(hands ? hands[0] : 'open', hands ? hands[1] : 'open');
      this.hold(hold ? hold[0] : null, hold ? hold[1] : null);
      this.poseName = name;
      return this;
    }
    face(name, dur = 0.35) {
      const f = Char.FACES[name]; if (!f) return this;
      this.to({ brow: 0, browA: 0, sm: 0.6, mw: 1, ...f }, dur, 'out'); return this;
    }
    look(x, y, dur = 0.25) { this.lookBase = { x, y }; this.to({ lookX: x, lookY: y }, dur, 'out'); return this; }
    turn(dir, dur = 0.45) {
      this.to({ flip: dir }, dur, 'inOut'); return this;
    }
    /* head anchor in scene coordinates (for speech bubble tails & collision) */
    anchor() {
      const P = this.P, s = P.s, f = P.flip < 0 ? -1 : 1;
      return { x: P.x + f * (P.sway + P.headX) * s * 0.9, y: P.y - (492 - P.bob * 0.4 + 0) * s, top: P.y - 560 * s, r: 58 * s, mouthY: P.y - 464 * s };
    }

    /* ---------- speaking ---------- */
    startTalk(env, startOffset = 0) { this.talk = env; this.talkClock = startOffset; }
    stopTalk() { this.talk = null; FE.Tween.to(this.P, { mo: 0 }, 0.12, 'out'); this.talkAmp = 0; }

    /* ---------- per-frame ---------- */
    render(dt) {
      const P = this.P, d = this.def;
      this.t += dt;
      // idle life: breathing, blink, saccades, weight shift
      const br = Math.sin(this.t * 1.55) * 0.5 + 0.5;
      const sway = Math.sin(this.t * 0.37) * 3 + Math.sin(this.t * 0.9) * 0.6;
      P.chest = br;
      if (dt > 0) {
        this.nextBlink -= dt;
        if (this.nextBlink <= 0 && this.blinkT < 0) { this.blinkT = 0; this.nextBlink = 2.2 + Math.random() * 3.6; }
        if (this.blinkT >= 0) { this.blinkT += dt; if (this.blinkT > 0.2) this.blinkT = -1; }
        this.nextSacc -= dt;
        if (this.nextSacc <= 0) { this.nextSacc = 1.2 + Math.random() * 2.8; const b = this.lookBase || { x: 0, y: 0 }; this.sacc = { x: b.x * 0 + (Math.random() - 0.5) * 0.35, y: (Math.random() - 0.5) * 0.18 }; }
      }
      let bl = P.blink; if (this.blinkT >= 0) { const k = this.blinkT / 0.2; bl = Math.max(bl, k < 0.45 ? k / 0.45 : 1 - (k - 0.45) / 0.55); }
      // speech: mouth + beats
      let talkNod = 0, talkBrow = 0, talkGest = 0;
      if (this.talk) {
        this.talkClock += dt;
        const env = this.talk, i = this.talkClock * env.rate;
        const i0 = Math.floor(i), f = i - i0;
        const a = (env.data[i0] || 0) / 255, b = (env.data[i0 + 1] || 0) / 255;
        const v = a + (b - a) * f;
        this.talkAmp += (v - this.talkAmp) * Math.min(1, dt * 22);
        this.talkAvg += (v - this.talkAvg) * Math.min(1, dt * 2.2);
        P.mo = clamp(this.talkAmp * 1.25, 0, 1);
        talkNod = (this.talkAmp - this.talkAvg) * 7;
        talkBrow = Math.max(0, this.talkAmp - this.talkAvg - 0.1) * 5;
        talkGest = this.talkAvg;
      } else { this.talkAvg *= 0.96; talkGest = this.talkAvg; }

      // legs: walk cycle or rest
      let lA = P.llA, lB = P.llB, rA = P.rlA, rB = P.rlB, wb = 0, wa = 0;
      if (this.walking) {
        this.walkPh += dt * 7.2;
        const s1 = Math.sin(this.walkPh), s2 = Math.sin(this.walkPh + Math.PI);
        lA = s1 * 20; rA = s2 * 20; lB = Math.max(0, -Math.cos(this.walkPh)) * 38; rB = Math.max(0, Math.cos(this.walkPh)) * 38;
        wb = Math.abs(Math.cos(this.walkPh)) * -5; wa = s1 * 3;
      }
      // apply
      const sc = P.s;
      this.el.setAttribute('transform', `translate(${P.x.toFixed(1)},${P.y.toFixed(1)}) scale(${(sc * P.flip).toFixed(4)},${sc.toFixed(4)})`);
      this.el.setAttribute('opacity', P.alpha.toFixed(2));
      const sw = P.sway + sway + wa, bobv = P.bob + wb + (br - 0.5) * -2.2;
      this.upper.setAttribute('transform', `translate(${sw.toFixed(2)},${bobv.toFixed(2)}) rotate(${(P.lean + sway * 0.12).toFixed(2)},0,-262)`);
      this.torso.setAttribute('transform', `translate(0,-380) scale(${(1 + br * 0.008).toFixed(4)},${(1 + br * 0.012).toFixed(4)}) translate(0,380)`);
      this.shadow.setAttribute('cx', (sw * 0.3).toFixed(1));
      const setLeg = (L, a, b) => { L.thigh.setAttribute('transform', `rotate(${a.toFixed(1)})`); L.shinG.setAttribute('transform', `translate(0,128) rotate(${(-b).toFixed(1)})`); };
      L_: { this.legL.g.setAttribute('transform', `translate(-21,-262)`); this.legR.g.setAttribute('transform', `translate(21,-262)`); setLeg(this.legL, lA, lB); setLeg(this.legR, -rA, rB); }
      // arms
      const gest = talkGest;
      const arm = (A, a, b, w, us, fs, hand, prop, sgn) => {
        A.g.setAttribute('transform', `translate(${sgn * (this.geo.sx - 2)},${-408 - P.shr}) rotate(${(sgn < 0 ? a : -a).toFixed(2)}) `);
        A.up.firstChild; // keep
        A.up.setAttribute('transform', `scale(1,${us.toFixed(3)})`);
        A.fore.setAttribute('transform', `translate(0,88) scale(1,${(fs / us).toFixed(3)}) rotate(${(sgn < 0 ? -b : b).toFixed(2)})`);
        const hg = A.fore.querySelector('.hand');
        hg.setAttribute('transform', `translate(0,78) scale(${sgn < 0 ? 1 : -1},${(1 / fs * us).toFixed(3)}) rotate(${(sgn < 0 ? -w : w) * 1})`);
      };
      // speaking gesture beats on the active (screen-right) arm
      const beat = Math.sin(this.t * 3.1) * gest * 5;
      const RAx = P.RA + (this.talk ? beat * 0.8 + gest * 6 : 0), RBx = P.RB + (this.talk ? Math.cos(this.t * 2.3) * gest * 10 + gest * 14 : 0);
      arm(this.armL, P.LA, P.LB, P.LW, P.LU, P.LF, this.handL, this.propL, -1);
      arm(this.armR, RAx, RBx, P.RW, P.RU, P.RF, this.handR, this.propR, 1);
      if (this._handsDirty) {
        this.armL.hp.setAttribute('d', HANDS[this.handL] || HANDS.open); this.armR.hp.setAttribute('d', HANDS[this.handR] || HANDS.open);
        this.armL.prop.innerHTML = this.propL ? PROPS[this.propL] : ''; this.armR.prop.innerHTML = this.propR ? PROPS[this.propR] : '';
        this._handsDirty = false;
      }
      this.armL.g.setAttribute('transform', `translate(${-(this.geo.sx - 2)},${-408 - P.shr}) rotate(${P.LA.toFixed(2)})`);
      this.armR.g.setAttribute('transform', `translate(${this.geo.sx - 2},${-408 - P.shr}) rotate(${(-RAx).toFixed(2)})`);
      // head
      this.neck.setAttribute('transform', `translate(${(P.headX * 0.3).toFixed(1)},${-430 - P.shr * 0.3})`);
      const hr = P.headRot + talkNod * 0.5 + Math.sin(this.t * 0.5) * 0.6;
      this.head.setAttribute('transform', `translate(${(P.headX).toFixed(1)},${(P.headY + talkNod - P.shr * 0.4).toFixed(1)}) rotate(${hr.toFixed(2)},0,-440)`);
      this.hairBack.setAttribute('transform', `translate(${(P.headX).toFixed(1)},${(P.headY + talkNod - P.shr * 0.4).toFixed(1)}) rotate(${hr.toFixed(2)},0,-440)`);
      // eyes
      const lx = (P.lookX + this.sacc.x) * 3.4, ly = (P.lookY + this.sacc.y) * 2.4;
      this.irisEls.forEach((e) => e.setAttribute('transform', `translate(${lx.toFixed(2)},${ly.toFixed(2)})`));
      const lidY = -11 + bl * 15.5;
      this.lidEls.forEach((e) => { e.setAttribute('y', (-27 + bl * 14.4).toFixed(2)); e.setAttribute('height', '17'); });
      this.lashEls.forEach((e) => e.setAttribute('transform', `translate(0,${(bl * 6.6).toFixed(2)})`));
      // brows
      const br_ = P.brow + talkBrow, ba = P.browA;
      const bp = (sx) => {
        const y0 = -19.5 - br_ * 4.5, tilt = ba * 4; // + = frown (inner down)
        const xi = sx * 6, xo = sx * 27;
        const yi = y0 + tilt + (ba < 0 ? ba * 2 : 0), yo = y0 - tilt * 0.9;
        return `M${xi},${yi + 1.8} C${xi + sx * 6},${yi - 3} ${xo - sx * 8},${yo - 4} ${xo},${yo - 0.5} C${xo - sx * 8},${yo - 1} ${xi + sx * 7},${yi + 0.6} ${xi},${yi + 3.2}Z`;
      };
      this.browL.setAttribute('d', bp(-1)); this.browR.setAttribute('d', bp(1));
      this.mouth(P.mo, P.sm, P.mw);
      if (this.def.build === 'f') this.mouthG.setAttribute('opacity', 1);
    }

    mouth(o, sm, mw) {
      const y0 = 29, hw = (10.5 + sm * 3.5 + (o > 0.5 ? -(o - 0.5) * 3 : 0)) * mw;
      const lift = sm * 3.4; // corners up when smiling
      const cy = y0 - lift;
      let d;
      if (o < 0.07) {
        // closed lips
        const dip = 1.5 + sm * 5;
        this.mouthBack.setAttribute('d', ''); this.teeth.setAttribute('width', 0); this.tongue.setAttribute('rx', 0);
        this.lipU.setAttribute('d', `M${-hw},${cy} C${-hw * 0.5},${cy - 1.6 + dip * 0.3} ${-3},${cy - 2.4} 0,${cy - 1.2} C3,${cy - 2.4} ${hw * 0.5},${cy - 1.6 + dip * 0.3} ${hw},${cy}`);
        this.lipL.setAttribute('d', `M${-hw + 1},${cy + 0.4} C${-hw * 0.5},${cy + 3 + dip} ${hw * 0.5},${cy + 3 + dip} ${hw - 1},${cy + 0.4}`);
        this.mpath.setAttribute('d', '');
        return;
      }
      const depth = 2 + o * 15, wTop = hw * (1 - o * 0.12);
      d = `M${-wTop},${cy} C${-wTop * 0.5},${cy - 2.6} ${-3},${cy - 3.2} 0,${cy - 2.2} C3,${cy - 3.2} ${wTop * 0.5},${cy - 2.6} ${wTop},${cy} C${wTop * 0.8},${cy + depth * 1.05} ${-wTop * 0.8},${cy + depth * 1.05} ${-wTop},${cy}Z`;
      this.mouthBack.setAttribute('d', d); this.mpath.setAttribute('d', d);
      const th = Math.min(5.5, o * 9);
      this.teeth.setAttribute('x', -wTop * 0.8); this.teeth.setAttribute('y', cy - 2.4); this.teeth.setAttribute('width', wTop * 1.6); this.teeth.setAttribute('height', th);
      this.tongue.setAttribute('cx', 0); this.tongue.setAttribute('cy', cy + depth * 0.82); this.tongue.setAttribute('rx', wTop * 0.55); this.tongue.setAttribute('ry', Math.max(0, depth * 0.38));
      this.lipU.setAttribute('d', `M${-wTop},${cy} C${-wTop * 0.5},${cy - 2.6} ${-3},${cy - 3.4} 0,${cy - 2.4} C3,${cy - 3.4} ${wTop * 0.5},${cy - 2.6} ${wTop},${cy}`);
      this.lipL.setAttribute('d', `M${-wTop + 1},${cy + 0.6} C${-wTop * 0.8},${cy + depth * 1.05} ${wTop * 0.8},${cy + depth * 1.05} ${wTop - 1},${cy + 0.6}`);
    }
  }

  /* named poses: only arm/torso params; hands & props optional */
  Char.POSES = {
    idle: { LA: 7, LB: 7, RA: 7, RB: 7, hands: ['open', 'open'] },
    relaxed: { LA: 9, LB: 14, RA: 9, RB: 14, lean: 0.5 },
    clasp: { LA: 16, LB: 70, RA: 16, RB: 70, LU: 0.8, RU: 0.8, LF: 0.9, RF: 0.9, hands: ['fist', 'fist'] },
    think: { LA: 12, LB: 40, RA: 12, RB: 154, RU: 0.55, RF: 1, LU: 0.85, hands: ['fist', 'fist'], headRot: -3 },
    thinkLook: { LA: 18, LB: 70, RA: 6, RB: 150, RU: 0.52, hands: ['fist', 'fist'], headRot: 4, lean: -1 },
    shrug: { LA: 14, LB: -92, RA: 14, RB: -92, shr: 9, hands: ['flat', 'flat'], headRot: 3 },
    open: { LA: 16, LB: -64, RA: 16, RB: -64, hands: ['flat', 'flat'] },
    openR: { LA: 8, LB: 10, RA: 18, RB: -66, hands: ['open', 'flat'] },
    openL: { LA: 18, LB: -66, RA: 8, RB: 10, hands: ['flat', 'open'] },
    pointUpR: { LA: 8, LB: 10, RA: 148, RB: 6, hands: ['open', 'point'] },
    pointUpL: { LA: 148, LB: 6, RA: 8, RB: 10, hands: ['point', 'open'] },
    pointR: { LA: 8, LB: 10, RA: 82, RB: 8, hands: ['open', 'point'] },
    pointL: { LA: 82, LB: 8, RA: 8, RB: 10, hands: ['point', 'open'] },
    wave: { LA: 8, LB: 10, RA: 130, RB: 56, hands: ['open', 'open'] },
    phoneR: { LA: 8, LB: 16, RA: 14, RB: 150, RU: 0.58, RF: 1, hands: ['open', 'fist'], hold: [null, 'phone'], headRot: -2 },
    phoneChest: { LA: 8, LB: 16, RA: 20, RB: 100, RU: 0.8, hands: ['open', 'fist'], hold: [null, 'phone'] },
    phoneL: { LA: 14, LB: 128, LU: 0.7, RA: 8, RB: 16, hands: ['fist', 'open'], hold: ['phone', null], headRot: 2 },
    phoneBoth: { LA: 22, LB: 88, RA: 22, RB: 88, LU: 0.8, RU: 0.8, hands: ['fist', 'fist'], hold: [null, 'phone'] },
    clipboard: { LA: 22, LB: 112, LU: 0.8, RA: 9, RB: 14, hands: ['fist', 'open'], hold: ['clipboard', null] },
    tablet: { LA: 26, LB: 98, LU: 0.8, RA: 18, RB: 78, RU: 0.85, hands: ['fist', 'point'], hold: ['tablet', null] },
    cup: { LA: 8, LB: 12, RA: 18, RB: 104, RU: 0.8, hands: ['open', 'fist'], hold: [null, 'cup'] },
    coffee: { LA: 8, LB: 12, RA: 18, RB: 104, RU: 0.8, hands: ['open', 'fist'], hold: [null, 'coffee'] },
    cross: { LA: 30, LB: 138, LU: 0.72, LF: 1, RA: 30, RB: 138, RU: 0.72, RF: 1, hands: ['fist', 'fist'] },
    hip: { LA: 38, LB: 98, LF: 0.62, RA: 8, RB: 10, hands: ['fist', 'open'] },
    hipBoth: { LA: 38, LB: 98, LF: 0.62, RA: 38, RB: 98, RF: 0.62, hands: ['fist', 'fist'] },
    umbrella: { LA: 8, LB: 12, RA: 14, RB: 70, RU: 0.9, hands: ['open', 'fist'], hold: [null, 'umbrella'] },
    folder: { LA: 24, LB: 100, LU: 0.8, RA: 9, RB: 14, hands: ['fist', 'open'], hold: ['folder', null] },
    reach: { LA: 8, LB: 10, RA: 54, RB: 30, hands: ['open', 'flat'] },
    count: { LA: 10, LB: 14, RA: 30, RB: 96, RU: 0.85, hands: ['open', 'pinch'] },
    deny: { LA: 12, LB: 14, RA: 40, RB: 100, hands: ['open', 'flat'] },
    stop: { LA: 12, LB: 14, RA: 56, RB: 74, RU: 0.9, hands: ['open', 'flat'], headRot: 1 },
    bag: { LA: 8, LB: 10, RA: 10, RB: 12 },
  };
  Char.FACES = {
    neutral: { sm: 0.6, brow: 0.1, browA: 0 },
    smile: { sm: 0.85, brow: 0.2, browA: 0 },
    grin: { sm: 1.2, brow: 0.35, browA: 0 },
    curious: { sm: 0.4, brow: 0.9, browA: -0.2 },
    worried: { sm: -0.3, brow: 0.4, browA: -0.9 },
    unsure: { sm: -0.15, brow: 0.5, browA: -0.5, mw: 0.9 },
    think: { sm: 0, brow: 0.6, browA: 0.2, mw: 0.85 },
    surprised: { sm: 0.1, brow: 1, browA: -0.1, mo: 0.25 },
    firm: { sm: -0.2, brow: -0.2, browA: 0.6 },
    apology: { sm: -0.1, brow: 0.2, browA: -0.7 },
    relief: { sm: 0.7, brow: 0.3, browA: -0.3 },
  };

  /* ---------- the cast ---------- */
  Char.CAST = {
    maya:   { id: 'maya', name: 'Maya', build: 'f', skin: '#b8795a', eye: '#4a2f1e', lip: '#a3454d', blush: '#d96a6a', jaw: 0.93,
              hair: { style: 'wavy', color: '#2a1d1a', hi: '#5b3f35' }, top: { style: 'blazer', color: '#d1583e', inner: '#fbf3e6', cuff: null, sleeve: '#d1583e' },
              bottom: '#2f3744', shoes: '#6b3f2a', badge: '#2c6fb0', earring: '#e3b756', necklace: '#e3b756' },
    daniel: { id: 'daniel', name: 'Daniel', build: 'm', skin: '#7b4b32', eye: '#2b1b12', lip: '#5e2f2a', blush: '#b04a4a', jaw: 1.04,
              hair: { style: 'crop', color: '#17130f', hi: '#3a322b' }, top: { style: 'sweater', color: '#233a66', sleeve: '#233a66', collar: '#dfe8f2', cuff: '#1b2d50' },
              bottom: '#c3a77a', shoes: '#3b2a1f', glasses: '#26303f', beard: '#1c1612' && null },
    priya:  { id: 'priya', name: 'Priya', build: 'f', skin: '#c68d62', eye: '#3a2216', lip: '#9c3b4a', blush: '#d96a6a', jaw: 0.9,
              hair: { style: 'long', color: '#1b1412', hi: '#4a3a33' }, top: { style: 'blouse', color: '#14876b', sleeve: '#14876b', sleeveLen: 'short' },
              bottom: '#efe3cc', shoes: '#f0d9b0', necklace: '#f2f2f2', earring: '#f2c14e' },
    tom:    { id: 'tom', name: 'Tom', build: 'm', skin: '#eab99a', eye: '#3d6a8c', lip: '#a65d54', blush: '#e08a82', jaw: 1.06,
              hair: { style: 'shortBeard', color: '#6a4a2e', hi: '#a07a52' }, top: { style: 'shirt', color: '#8aa6bf', sleeve: '#4c5f74', cuff: '#4c5f74' },
              bottom: '#3a4a63', shoes: '#4b3a2c', beard: '#6a4a2e', mustache: '#5b3e26' },
    lena:   { id: 'lena', name: 'Lena', build: 'f', skin: '#e2ae8c', eye: '#5a6f3c', lip: '#b13e4b', blush: '#e0707a', jaw: 0.9,
              hair: { style: 'bun', color: '#8e3b21', hi: '#c9703f' }, top: { style: 'blazer', color: '#1e3358', inner: '#f5f3ee', sleeve: '#1e3358', cuff: '#c8a24a' },
              bottom: '#1e3358', shoes: '#1a1f2b', scarf: '#c63a3a', earring: '#c8a24a' },
    ken:    { id: 'ken', name: 'Ken', build: 'm', skin: '#e0b48c', eye: '#241a14', lip: '#8f4a40', blush: '#d77d6f', jaw: 1.0,
              hair: { style: 'sidePart', color: '#14110f', hi: '#3a3330' }, top: { style: 'blazer', color: '#3c4350', inner: '#e8b64a', sleeve: '#3c4350', cuff: null, tie: null },
              bottom: '#343a46', shoes: '#241c18', glasses: null },
  };
  FE.Char = Char;
})();
