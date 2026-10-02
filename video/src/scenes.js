/* ===== content, scenes and the show script ===== */
const W = 1080, H = 1920;
const TXT = {
  s2en: { words: ['Actually,', 'I', 'prefer', 'tea.'], ipa: ['/ˈæktʃuəli/', '/aɪ/', '/prɪˈfɜːr/', '/tiː/'], say: 'Actually, I prefer tea.' },
  s3en: { words: ['I’m', 'currently', 'studying', 'English.'], ipa: ['/aɪm/', '/ˈkɜːrəntli/', '/ˈstʌdiɪŋ/', '/ˈɪŋɡlɪʃ/'], say: "I'm currently studying English." },
  s4en: { words: ['I’m', 'currently', 'learning', 'English.'], ipa: ['/aɪm/', '/ˈkɜːrəntli/', '/ˈlɜːrnɪŋ/', '/ˈɪŋɡlɪʃ/'], say: "I'm currently learning English." },
  s2es: { words: ['En', 'realidad,', 'prefiero', 'té.'] },
  s3es: { words: ['Actualmente', 'estoy', 'estudiando', 'inglés.'] },
  s4es: { words: ['Actualmente', 'estoy', 'aprendiendo', 'inglés.'] },
  ipaActually: '/ˈæktʃuəli/', ipaCurrently: '/ˈkɜːrəntli/'
};
/* narration: l = voice language, t = text spoken, d = estimated ms (only used when no voice is available / for export timing) */
const NARR = {
  n1: { cap: '¡Cuidado! “Actually” no significa “actualmente”.', segs: [{ l: 'es', t: '¡Cuidado!', d: 700 }, { l: 'en', t: 'Actually', d: 600 }, { l: 'es', t: 'no significa actualmente.', d: 1500 }] },
  n2: { cap: 'Aquí, actually significa “en realidad”.', segs: [{ l: 'es', t: 'Aquí,', d: 400 }, { l: 'en', t: 'actually', d: 600 }, { l: 'es', t: 'significa, en realidad.', d: 1300 }] },
  n3: { cap: 'Para “actualmente”, usa currently.', segs: [{ l: 'es', t: 'Para actualmente, usa', d: 1500 }, { l: 'en', t: 'currently.', d: 750 }] },
  n4: { cap: 'Ahora tú. Dilo en inglés.', segs: [{ l: 'es', t: 'Ahora tú.', d: 700, gap: 200 }, { l: 'es', t: 'Dilo en inglés.', d: 1000 }] },
  n5: { cap: 'Practica con Fluent English. Escríbenos “inglés”.', segs: [{ l: 'es', t: 'Practica con', d: 700 }, { l: 'en', t: 'Fluent English.', d: 1000 }, { l: 'es', t: 'Escríbenos, inglés.', d: 1400 }] }
};
const LINES = {
  e2: [{ l: 'en', t: TXT.s2en.say, d: 1700 }], e3: [{ l: 'en', t: TXT.s3en.say, d: 2100 }], e4: [{ l: 'en', t: TXT.s4en.say, d: 2100 }]
};

const Show = {
  state: 'idle', scene: -1, prev: null, prevSt: 0, sceneStart: 0, ev: [{}, {}, {}, {}, {}], ccMode: +store.get('cc', '0'),
  cap: null, mouth: false, testing: false, trans: 'none', run: 0, endedAt: 0, debug: false
};
const logoImg = new Image(); logoImg.src = LOGO_DATA;

/* seconds since an event; in test/seek mode fall back to nominal scene time */
function since(i, name, nominal, st) {
  const e = Show.ev[i][name];
  if (e != null) return (Clock.now() - e) / 1000;
  return Show.testing ? st - nominal : -1;
}
const layCache = new Map();
function fitLayout(c, key, words, ipas, size, ipaSize, maxW, showIpa, family = SERIF) {
  const ck = key + '|' + showIpa; if (layCache.has(ck)) return layCache.get(ck);
  let L;
  for (let k = 0; k < 14; k++) {
    const gap = Math.max(size * .3, 14), n = words.length;
    const items = words.map((w, i) => {
      const ww = tw(c, w, size, 800, family), iw = showIpa && ipas ? tw(c, ipas[i], ipaSize, 600, IPAF) : 0; return { w, ipa: ipas ? ipas[i] : null, ww, iw, bw: Math.max(ww, iw), idx: i };
    });
    const wd = (a, b) => items.slice(a, b).reduce((s, it) => s + it.bw, 0) + gap * (b - a - 1);
    let split = [[0, n]];
    if (wd(0, n) > maxW) { let best = 1e9; for (let s = 1; s < n; s++) { const m = Math.max(wd(0, s), wd(s, n)); if (m < best) { best = m; split = [[0, s], [s, n]]; } } }
    const mx = Math.max(...split.map(([a, b]) => wd(a, b)));
    if (mx <= maxW || k === 13) {
      const lines = split.map(([a, b]) => { let x = 0; const ln = items.slice(a, b).map(it => { it.x = x; x += it.bw + gap; return it; }); return ln; });
      L = { lines, lineW: split.map(([a, b]) => wd(a, b)), size, ipaSize, lh: size * 1.1 + (showIpa ? ipaSize * 1.3 : 0), showIpa, family }; break;
    }
    size *= .94; ipaSize *= .94;
  }
  layCache.set(ck, L); return L;
}
const ipaOn = () => Show.ccMode === 2;

/* ---------------- backgrounds ---------------- */
function bgCafe(c, t) {
  c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#14335F'], [.5, '#0E2650'], [1, PAL.navyDeep]]); c.fillRect(0, 0, W, H);
  // window with night sky
  rr(c, 650, 250, 340, 430, 26); c.fillStyle = lin(c, 0, 250, 0, 680, [[0, '#0A2347'], [1, '#1B4C7A']]); c.fill();
  c.save(); rr(c, 650, 250, 340, 430, 26); c.clip(); for (let i = 0; i < 18; i++) { c.fillStyle = hexA(PAL.ivory, .35 + .35 * Math.sin(t * 1.3 + i)); c.beginPath(); c.arc(670 + (i * 97) % 300, 270 + (i * 53) % 260, 2.5, 0, 7); c.fill(); }
  c.fillStyle = '#071a36'; for (let i = 0; i < 6; i++) c.fillRect(650 + i * 58, 560 - (i * 37) % 80, 40, 200); c.restore();
  c.strokeStyle = PAL.ivory; c.lineWidth = 12; rr(c, 650, 250, 340, 430, 26); c.stroke(); c.lineWidth = 8; c.beginPath(); c.moveTo(820, 250); c.lineTo(820, 680); c.moveTo(650, 450); c.lineTo(990, 450); c.stroke();
  // pendant lamps
  [[220, 150], [470, 210]].forEach(([x, h], i) => {
    c.strokeStyle = '#ffffff55'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke();
    glow(c, x, h + 120, 340, PAL.tang, .22 + .03 * Math.sin(t + i));
    c.beginPath(); c.moveTo(x - 24, h); c.lineTo(x + 24, h); c.lineTo(x + 74, h + 72); c.lineTo(x - 74, h + 72); c.closePath(); c.fillStyle = lin(c, x - 74, 0, x + 74, 0, [[0, PAL.tangDeep], [.5, PAL.tangLight], [1, PAL.tangDeep]]); c.fill();
    c.beginPath(); c.ellipse(x, h + 74, 62, 12, 0, 0, 7); c.fillStyle = '#FFE7BD'; c.fill();
  });
  // framed leaf
  rr(c, 80, 420, 190, 250, 14); c.fillStyle = PAL.ivory; c.fill(); rr(c, 96, 436, 158, 218, 8); c.fillStyle = PAL.mint; c.fill();
  c.fillStyle = PAL.mintDeep; c.beginPath(); c.moveTo(175, 620); c.bezierCurveTo(110, 560, 130, 480, 175, 460); c.bezierCurveTo(222, 480, 240, 560, 175, 620); c.fill();
  c.strokeStyle = PAL.ivory; c.lineWidth = 4; c.beginPath(); c.moveTo(175, 618); c.lineTo(175, 475); c.stroke();
}
function bgStudy(c, t, dim = 0) {
  c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#12305E'], [.5, '#0D2551'], [1, PAL.navyDeep]]); c.fillRect(0, 0, W, H);
  // window with moon
  rr(c, 60, 300, 290, 420, 22); c.fillStyle = lin(c, 0, 300, 0, 720, [[0, '#07193A'], [1, '#17497A']]); c.fill();
  c.save(); rr(c, 60, 300, 290, 420, 22); c.clip(); glow(c, 250, 420, 140, PAL.ivory, .35); c.beginPath(); c.arc(250, 420, 40, 0, 7); c.fillStyle = PAL.ivory; c.fill();
  c.beginPath(); c.arc(262, 410, 36, 0, 7); c.fillStyle = '#0c2a52'; c.fill();
  for (let i = 0; i < 14; i++) { c.fillStyle = hexA(PAL.ivory, .3 + .3 * Math.sin(t * 1.4 + i)); c.beginPath(); c.arc(80 + (i * 71) % 250, 320 + (i * 47) % 200, 2.2, 0, 7); c.fill(); } c.restore();
  c.strokeStyle = PAL.mintLight; c.lineWidth = 10; rr(c, 60, 300, 290, 420, 22); c.stroke(); c.beginPath(); c.moveTo(205, 300); c.lineTo(205, 720); c.stroke();
  // shelf with books
  c.fillStyle = PAL.woodDark; c.fillRect(740, 400, 300, 16);
  [[750, 62, PAL.tang], [816, 48, PAL.mint], [868, 70, PAL.ivory], [942, 52, PAL.tangLight], [998, 38, PAL.mintDeep]].forEach(([x, w, col], i) => { const h = 90 + (i * 23) % 40; c.fillStyle = col; rr(c, x, 400 - h, w, h, 6); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + w * .15, 400 - h + 14, w * .7, 6); });
  // glowing calendar marking the present
  const pulse = .5 + .5 * Math.sin(t * 1.4), cx = 890, cy = 600;
  glow(c, cx, cy, 250 + pulse * 20, PAL.mint, .35 + pulse * .12);
  drawCalendar(c, cx, cy, { s: .36, flip: 0 });
  c.strokeStyle = hexA(PAL.mint, .9); c.lineWidth = 6; c.beginPath(); c.ellipse(cx, cy - 4, 62 + pulse * 3, 56 + pulse * 3, 0, 0, 7); c.stroke();
  if (dim) { c.fillStyle = `rgba(5,12,30,${dim})`; c.fillRect(0, 0, W, H); }
}
function drawDesk(c, backY, frontY, t) {
  c.beginPath(); c.moveTo(-40, backY); c.lineTo(W + 40, backY); c.lineTo(W + 60, frontY); c.lineTo(-60, frontY); c.closePath();
  c.fillStyle = lin(c, 0, backY, 0, frontY, [[0, PAL.woodLight], [.3, PAL.wood], [1, '#6E442B']]); c.fill();
  c.strokeStyle = 'rgba(40,18,6,.18)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-20, backY + 18 + i * (frontY - backY) / 6); c.bezierCurveTo(300, backY + 8 + i * 24, 700, backY + 30 + i * 22, W + 20, backY + 16 + i * (frontY - backY) / 6); c.stroke(); }
  c.fillStyle = 'rgba(255,230,190,.22)'; c.fillRect(-40, backY, W + 80, 6);
  c.fillStyle = lin(c, 0, frontY, 0, frontY + 46, [[0, '#5a361f'], [1, '#2b190d']]); c.fillRect(-60, frontY, W + 120, 46);
  c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(-40, frontY + 46, W + 80, 14);
}

/* ---------------- shared overlays ---------------- */
function drawCaption(c, text) {
  if (!text || Show.ccMode < 1) return;
  c.save(); c.font = `800 44px ${SANS}`; c.textAlign = 'center';
  const words = text.split(' '), lines = [''], maxW = 880;
  words.forEach(w => { const L = lines.length - 1, test = (lines[L] ? lines[L] + ' ' : '') + w; if (c.measureText(test).width > maxW) lines.push(w); else lines[L] = test; });
  const lh = 56, h = lines.length * lh + 26, y0 = 1500 - (lines.length - 1) * lh / 2 - lh / 2 - 6, wmax = Math.max(...lines.map(l => c.measureText(l).width));
  rr(c, W / 2 - wmax / 2 - 30, y0 - 4, wmax + 60, h, 26); c.fillStyle = 'rgba(4,10,26,.78)'; c.fill();
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; c.stroke();
  lines.forEach((l, i) => { c.fillStyle = PAL.ivory; c.fillText(l, W / 2, y0 + 44 + i * lh); });
  c.restore();
}
function drawMic(c, x, y, s, col, a = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= a; c.fillStyle = col; rr(c, -26, -62, 52, 90, 26); c.fill();
  c.strokeStyle = col; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.arc(0, -4, 46, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  c.beginPath(); c.moveTo(0, 42); c.lineTo(0, 70); c.moveTo(-26, 70); c.lineTo(26, 70); c.stroke();
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 4; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-16, -40 + i * 16); c.lineTo(16, -40 + i * 16); c.stroke(); } c.restore();
}
function drawChat(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; rr(c, -44, -34, 88, 64, 20); c.fill(); c.beginPath(); c.moveTo(-18, 28); c.lineTo(-26, 50); c.lineTo(4, 28); c.fill();
  c.fillStyle = PAL.navy; [-20, 0, 20].forEach(dx => { c.beginPath(); c.arc(dx, -2, 6, 0, 7); c.fill(); }); c.restore();
}
function sparkles(c, cx, cy, p, n = 12, R = 260, col = PAL.ivory) {
  if (p <= 0 || p >= 1) return; for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + .3, r = R * E.out(p) * (.6 + (i % 3) * .2), s = (1 - p) * (6 + (i % 3) * 3);
    c.fillStyle = hexA(i % 2 ? col : PAL.mint, (1 - p) * .9); c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, s, 0, 7); c.fill();
  }
}
function pill(c, x, y, w, h, fill, stroke) { rr(c, x - w / 2, y - h / 2, w, h, h / 2); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 4; c.stroke(); } }

/* ---------------- SCENE 0 — the hook ---------------- */
function hookTitle(c, st, T) {
  const ea = E.back(prog(st, 2.3, 2.7)), ma = E.out(prog(st, 2.45, 2.95));
  if (st >= 2.45) drawTag(c, 540, 1030, 'ACTUALLY', { s: 1.15 });
  if (ipaOn() && st > 2.5) txt(c, TXT.ipaActually, 540, 1150, { size: 40, weight: 600, family: IPAF, fill: PAL.mintLight, alpha: E.out(prog(st, 2.5, 2.9)) });
  if (ea > 0) txt(c, '≠', 540, 1282, { size: 132 * ea, fill: PAL.ivory, weight: 900, shadow: ['rgba(0,0,0,.4)', 18, 6] });
  if (ma > 0) {
    c.save(); c.globalAlpha = ma; c.translate((1 - ma) * 160, 0);
    const w = tw(c, 'ACTUALMENTE', 74, 900, SERIF) + 90; withShadow(c, 'rgba(0,0,0,.4)', 28, 0, 16, () => { rr(c, 540 - w / 2, 1308, w, 124, 30); c.fillStyle = lin(c, 0, 1308, 0, 1432, [[0, '#1d4685'], [1, PAL.navy2]]); c.fill(); });
    c.strokeStyle = PAL.mint; c.lineWidth = 5; rr(c, 540 - w / 2 + 6, 1314, w - 12, 112, 25); c.stroke();
    txt(c, 'ACTUALMENTE', 540, 1388, { size: 74, fill: PAL.mintLight, weight: 900 }); c.restore();
  }
}
function sceneHook(c, st, T) {
  bgBase(c, W, H, T, 0);
  // calendar spins in, page flips, calendar slides away
  const sp = prog(st, 0, .85), land = E.back(sp), slide = E.inOut(prog(st, 1.4, 2.15)), flip = E.inOut(prog(st, 1.2, 1.75));
  let cx = 540 + slide * 270, cy = 740 - slide * 250 - (1 - E.out(sp)) * 380, s = (.12 + 1.0 * land) * (1 - slide * .5), rot = (1 - E.out(sp)) * -Math.PI * 3 + slide * .2;
  if (st < .85) glow(c, 540, 740, 520, PAL.tang, .25 * sp);
  drawCalendar(c, cx, cy, { s, rot, flip });
  // the tag tries to land on "today"
  if (st > .6) {
    const a = prog(st, .6, 1.2), fall = E.out(prog(st, 1.55, 2.0)), glide = E.inOut(prog(st, 1.95, 2.45));
    let tx = 540, ty = lerp(-160, 725, E.back(a)) + Math.sin(st * 9) * (st > 1.1 && st < 1.5 ? 6 : 0);
    ty += fall * 150; const rot2 = Math.sin(prog(st, 1.55, 2.2) * Math.PI) * -.14;
    if (st < 2.45) {
      const gy = lerp(ty, 1030, glide), sc = lerp(1, 1.15, glide);
      drawTag(c, tx, gy, 'ACTUALLY', { rot: rot2 * (1 - glide), s: sc, sy: 1 + (st > 1.5 && st < 1.7 ? .06 * Math.sin((st - 1.5) * 30) : 0) });
    }
  }
  hookTitle(c, st, T);
  sparkles(c, 540, 1030, prog(st, 2.4, 3.2), 14, 300, PAL.tangLight);
}

/* ---------------- character poses ---------------- */
const MAN = { x: 540, y: 640, s: .85 };
const toLocal = (wx, wy) => [(wx - MAN.x) / MAN.s, (wy - MAN.y) / MAN.s];
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/* ---------------- SCENE 1 — coffee vs tea ---------------- */
const CUP = { tea: [750, 960], coffee: [330, 960] }, CS = .78, SAUCER_Y = 1050;
function sceneTea(c, st, T) {
  bgBase(c, W, H, T, 0); c.globalAlpha = E.inOut(prog(st, 0, .9)); bgCafe(c, T); c.globalAlpha = 1;
  if (st < .6) { c.save(); c.globalAlpha = 1 - prog(st, 0, .45); c.translate(0, -prog(st, 0, .5) * 60); hookTitle(c, 9, T); c.restore(); }
  const rise = E.out(prog(st, 1.0, 1.55)), speaking = Show.mouth && Show.scene === 1, mouth = speaking ? .35 + .45 * Math.abs(Math.sin(T * 14)) : 0;
  const lookP = st < 1.45 ? [0, 0] : st < 1.95 ? [-.9, .3] : st < 2.45 ? [.9, .3] : [0, 0];
  c.save(); c.translate(0, (1 - rise) * 520); c.globalAlpha = Math.min(1, rise * 2);
  drawMan(c, { ...MAN, t: T, look: lookP, mouth, smile: speaking ? .75 : .55, brow: st > 1.5 && st < 2.0 ? -.3 : .15, tilt: st > 1.5 && st < 1.95 ? -.04 : st > 2.4 ? .03 : 0, part: 'body' });
  c.restore();
  drawDesk(c, 1015, 1150, T);
  // the calendar becomes a saucer, splits in two, and a cup rises from each half
  const A = prog(st, 0, .5), B = E.inOut(prog(st, .42, .85)), sY = SAUCER_Y;
  if (B < 1) {
    const x0 = lerp(810, 540, E.inOut(A)), y0 = lerp(490, sY, E.inOut(A)), sc = lerp(.56, .52, A);
    if (A < 1) { c.save(); c.globalAlpha = 1 - A; drawCalendar(c, x0, y0, { s: sc, rot: lerp(.2, 0, A), flip: 1 }); c.restore(); }
    if (A > 0) {
      const wd = lerp(520 * sc, 300, A), hd = lerp(600 * sc, 300, A), r = lerp(36, 150, A), sq = lerp(1, .24, B);
      [-1, 1].forEach(sd => {
        c.save(); c.globalAlpha = A; c.translate(x0 + sd * B * (sd < 0 ? 210 : 210) , lerp(y0, sY, B)); c.scale(1, sq);
        rr(c, -wd / 2, -hd / 2, wd, hd, Math.min(r, wd / 2)); c.fillStyle = lin(c, -150, 0, 150, 0, [[0, PAL.ivoryShade], [.4, PAL.ivory], [1, PAL.ivoryShade]]); c.fill(); c.restore();
      });
    }
  } else { drawSaucer(c, CUP.coffee[0], sY, CS); drawSaucer(c, CUP.tea[0], sY, CS); }
  // arms
  const rest = { L: [-105, 452, 120], R: [118, 452, 120] };
  const reach = E.inOut(prog(st, 1.85, 2.35)), lift = E.inOut(prog(st, 2.4, 3.05)), sip = Math.sin(prog(st, 4.2, 5.2) * Math.PI);
  const cupPos = [lerp(CUP.tea[0], 640, lift), lerp(CUP.tea[1], 800, lift) - sip * 16 + Math.sin(T * 1.7) * lift * 2];
  const gl = toLocal(cupPos[0] + 86 * CS / .78, cupPos[1] + 40 * CS / .78);
  const Rw = mix3(rest.R, [gl[0], gl[1], lerp(120, 170, lift)], reach), curlR = lerp(.2, .85, prog(st, 2.15, 2.45));
  // cups
  const rc = prog(st, .8, 1.3) > 0 ? E.back(prog(st, .8, 1.3)) : 0, rt = prog(st, .95, 1.4) > 0 ? E.back(prog(st, .95, 1.4)) : 0;
  if (rc > .01 && B >= 1) { c.save(); c.translate(CUP.coffee[0], sY - 6); c.scale(1, rc); drawCup(c, 0, -96 * CS, { kind: 'coffee', s: CS, t: T }); c.restore(); }
  if (rt > .01 && B >= 1) {
    if (st < 2.4) { c.save(); c.translate(CUP.tea[0], sY - 6); c.scale(1, rt); drawCup(c, 0, -96 * CS, { kind: 'tea', s: CS, t: T }); c.restore(); }
    else { drawSaucer(c, CUP.tea[0], sY, CS); drawCup(c, cupPos[0], cupPos[1], { kind: 'tea', s: CS, t: T, rot: -sip * .45 }); }
  }
  c.save(); c.translate(0, (1 - rise) * 520); c.globalAlpha = Math.min(1, rise * 2);
  drawMan(c, { ...MAN, t: T, part: 'arms', arms: {
    L: { w: [rest.L[0] + Math.sin(T * .9) * 3, rest.L[1], rest.L[2]], ang: Math.PI / 2 + .3, curl: [.15, .2, .25, .3, .35] },
    R: { w: Rw, ang: lerp(Math.PI / 2 - .3, Math.PI + .15, reach) - sip * .1, curl: [lerp(.1, .5, reach), curlR, curlR, curlR, curlR * 1.05], ts: 1, bd: -1 } } });
  c.restore();
  // text
  const showEn = since(1, 'enShow', 1.3, st), showEs = since(1, 'esShow', 3.5, st);
  const L = indexLayout(fitLayout(c, 's2en', TXT.s2en.words, TXT.s2en.ipa, 84, 36, 900, ipaOn())), y0 = 1272;
  if (showEn > 0) { const r = drawSentence(c, L, 540, y0, { revealWords: showEn * 5, hl: { 0: PAL.tangLight } }); softUnderline(c, r[0], prog(showEn, 1.0, 1.5), T, PAL.tang); }
  if (showEs > 0) {
    const a = E.out(prog(showEs, 0, .5)); c.save(); c.globalAlpha = a;
    const l2 = indexLayout(fitLayout(c, 's2es', TXT.s2es.words, null, 54, 0, 920, false, SANS));
    drawSentence(c, l2, 540, y0 + L.lh * L.lines.length + 14 + (1 - a) * 14, { hl: { 0: PAL.tangLight, 1: PAL.tangLight }, shadow: false }); c.restore();
  }
}

/* ---------------- SCENE 2 — study corner ---------------- */
const NB = { x: 540, y: 1062 };
function scribblePt(p) { const li = p < .56 ? 0 : 1, q = li ? (p - .56) / .44 : p / .56, len = li ? 120 : 190; return [-215 + q * len, -12 + li * 24 + Math.sin(q * 70) * 4]; }
function sceneStudy(c, st, T) {
  bgStudy(c, T); glow(c, 160, 960, 420, PAL.tang, .16);
  const speaking = Show.mouth && Show.scene === 2, mouth = speaking ? .35 + .45 * Math.abs(Math.sin(T * 14)) : 0;
  const writing = st < 2.7, wp = clamp((st - .3) / 2.3);
  drawMan(c, { ...MAN, t: T, look: writing ? [-.25, .9] : [0, .1], mouth, smile: speaking ? .72 : .55, brow: .15, tilt: writing ? .05 : 0, part: 'body' });
  drawDesk(c, 1015, 1150, T);
  c.save(); c.translate(130, 1012); // desk lamp
  c.fillStyle = '#0006'; c.beginPath(); c.ellipse(0, 6, 70, 14, 0, 0, 7); c.fill();
  c.strokeStyle = PAL.ivory; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-10, -170); c.lineTo(50, -260); c.stroke();
  c.beginPath(); c.moveTo(30, -300); c.lineTo(104, -300); c.lineTo(130, -230); c.lineTo(10, -230); c.closePath(); c.fillStyle = PAL.tang; c.fill(); c.restore();
  glow(c, 190, 800, 380, PAL.tangLight, .15);
  drawPlant(c, 930, 1032, T, .95);
  // notebook
  c.save(); c.translate(NB.x, NB.y);
  withShadow(c, 'rgba(0,0,0,.4)', 24, 0, 12, () => { c.beginPath(); c.moveTo(-250, -50); c.lineTo(250, -50); c.lineTo(270, 56); c.lineTo(-270, 56); c.closePath(); c.fillStyle = PAL.mintDeep; c.fill(); });
  c.beginPath(); c.moveTo(-240, -46); c.lineTo(-4, -50); c.lineTo(-4, 50); c.lineTo(-256, 48); c.closePath(); c.fillStyle = PAL.ivory; c.fill();
  c.beginPath(); c.moveTo(4, -50); c.lineTo(240, -46); c.lineTo(256, 48); c.lineTo(4, 50); c.closePath(); c.fillStyle = '#FBF0DA'; c.fill();
  c.strokeStyle = 'rgba(40,90,140,.25)'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { const y = -26 + i * 24; c.beginPath(); c.moveTo(-240 - i * 4, y); c.lineTo(-12, y + 2); c.moveTo(12, y + 2); c.lineTo(240 + i * 4, y); c.stroke(); }
  c.fillStyle = lin(c, -14, 0, 14, 0, [[0, '#0003'], [.5, '#0000'], [1, '#0003']]); c.fillRect(-14, -50, 28, 100);
  c.strokeStyle = '#1b3a7a'; c.lineWidth = 3.2; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  const N = Math.floor(wp * 160); for (let i = 0; i <= N; i++) { const q = scribblePt(i / 160), pq = i ? scribblePt((i - 1) / 160) : q; if (!i || Math.abs(q[0] - pq[0]) > 30) c.moveTo(q[0], q[1]); else c.lineTo(q[0], q[1]); } c.stroke(); c.restore();
  // pen + hands
  const tipL = scribblePt(wp), lift = E.inOut(prog(st, 2.7, 3.2));
  const wob = writing ? Math.sin(T * 19) * 3 : 0;
  const tip = [NB.x + tipL[0] + lift * 70, NB.y + tipL[1] * .9 + wob - lift * 40];
  const u = [.37, -.93], dirA = Math.atan2(.93, -.37);
  const wrW = [tip[0] + 62, tip[1] - 157], wl = toLocal(wrW[0], wrW[1]);
  const arms = {
    L: { w: [wl[0], wl[1], 70], ang: dirA + Math.sin(T * 19) * .02 * (writing ? 1 : 0), curl: [.5, .45, .62, .8, .85], ts: -1, bd: 1 },
    R: { w: [toLocal(655, 960)[0], toLocal(655, 960)[1], 60], ang: Math.PI / 2 + .45, curl: [.1, .2, .22, .25, .3], ts: 1 } };
  drawMan(c, { ...MAN, t: T, part: 'arms', arms });
  { c.save(); c.lineCap = 'round'; const base = [tip[0] + u[0] * 128, tip[1] + u[1] * 128];
    c.strokeStyle = PAL.navy2; c.lineWidth = 12; c.beginPath(); c.moveTo(base[0], base[1]); c.lineTo(tip[0], tip[1]); c.stroke();
    c.strokeStyle = PAL.tang; c.lineWidth = 12; c.beginPath(); c.moveTo(tip[0] + u[0] * 26, tip[1] + u[1] * 26); c.lineTo(tip[0], tip[1]); c.stroke(); c.restore(); }
  // text
  const showEn = since(2, 'enShow', .6, st), showEs = since(2, 'esShow', 2.9, st), y0 = 1282;
  const L = indexLayout(fitLayout(c, 's3en', TXT.s3en.words, TXT.s3en.ipa, 84, 36, 900, ipaOn()));
  if (showEn > 0) { const r = drawSentence(c, L, 540, y0, { revealWords: showEn * 5, hl: { 1: PAL.mint } }); softUnderline(c, r[1], prog(showEn, 1.1, 1.7), T, PAL.mint); }
  if (showEs > 0) {
    const a = E.out(prog(showEs, 0, .5)); c.save(); c.globalAlpha = a;
    const l2 = indexLayout(fitLayout(c, 's3es', TXT.s3es.words, null, 50, 0, 920, false, SANS));
    const r = drawSentence(c, l2, 540, y0 + L.lh * L.lines.length + 10 + (1 - a) * 14, { hl: { 0: PAL.mint }, shadow: false });
    softUnderline(c, r[0], prog(showEs, .35, .95), T, PAL.mint); c.restore();
  }
}

/* ---------------- SCENE 3 — the speaking challenge ---------------- */
function sceneChallenge(c, st, T) {
  bgBase(c, W, H, T * .5, 1);
  const pS = Show.ev[3].pauseStart, pStart = pS != null ? pS : (Show.testing ? Show.ev[3].testPause ?? 2.2 * 1000 + Clock.now() - st * 1000 : null);
  const now = Clock.now();
  const pp = pS != null ? clamp((now - pS) / 4000) : (Show.testing ? clamp((st - 2.2) / 4) : 0);
  const rv = since(3, 'reveal', 6.4, st);
  const cx = 540, cy = 800, R = 190;
  const prompt = indexLayout(fitLayout(c, 's4es', TXT.s4es.words, null, 68, 0, 880, false));
  const pa = E.out(prog(st, 0, .5)); c.save(); c.globalAlpha = pa * (rv > 0 ? lerp(1, .55, prog(rv, 0, .6)) : 1);
  drawSentence(c, prompt, 540, 330 + (1 - pa) * 20, { hl: { 0: PAL.mint }, shadow: ['rgba(0,0,0,.3)', 12, 4] }); c.restore();
  const ringA = E.out(prog(st, .2, .8));
  if (rv <= 0 || rv < 1) {
    const out = rv > 0 ? prog(rv, 0, .5) : 0;
    c.save(); c.globalAlpha = ringA * (1 - out * .0);
    // calm glow
    glow(c, cx, cy, 420, PAL.mint, .12 + .02 * Math.sin(T * .8));
    c.lineWidth = 16; c.strokeStyle = 'rgba(255,246,229,.12)'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    if (pp > 0) { c.strokeStyle = PAL.mint; c.lineCap = 'round'; c.shadowColor = hexA(PAL.mint, .55); c.shadowBlur = 24; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + pp * Math.PI * 2); c.stroke(); }
    c.restore();
    c.save(); c.globalAlpha = ringA * (1 - out); drawMic(c, cx, cy + 4, 1.35, PAL.ivory, .92); c.restore();
    txt(c, 'TU TURNO', cx, cy + R + 86, { size: 36, weight: 800, family: SANS, fill: PAL.mintLight, ls: 8, alpha: ringA * (1 - out) * .85 });
  }
  // reveal: the ring becomes a halo behind the speaker
  if (rv > 0) {
    const hp = E.out(prog(rv, 0, .7)), rad = lerp(R, 250, hp);
    glow(c, cx, cy, 520, PAL.mint, .22 * hp);
    c.save(); c.beginPath(); c.arc(cx, cy, rad, 0, 7); c.fillStyle = lin(c, 0, cy - rad, 0, cy + rad, [[0, '#1d4a86'], [1, PAL.navy2]]); c.globalAlpha = hp; c.fill();
    c.lineWidth = 12; c.strokeStyle = PAL.mint; c.shadowColor = hexA(PAL.mint, .6); c.shadowBlur = 26; c.stroke(); c.restore();
    // speaker pops out of the halo
    const up = E.back(prog(rv, .25, .95)); c.save(); c.beginPath(); c.rect(0, 0, W, cy); c.arc(cx, cy, rad - 2, 0, 7); c.clip('nonzero');
    const sp = Show.mouth && Show.scene === 3, mouth = sp ? .35 + .45 * Math.abs(Math.sin(T * 14)) : 0;
    c.translate(0, (1 - up) * 300); c.globalAlpha = Math.min(1, up * 1.5);
    drawMan(c, { x: 540, y: 880, s: .66, t: T, look: [0, .05], mouth, smile: sp ? .75 : .6, brow: .15, arms: {
      L: { w: [-150, 400, 60], ang: Math.PI / 2, curl: [.2, .2, .2, .2, .2], ts: 1 },
      R: { w: [235, 235, 150], ang: -Math.PI / 2 + .35, curl: [.1, .05, .05, .08, .1], ts: -1, bd: 1, spread: .12 } } });
    c.restore();
    const showEn = rv - .1;
    if (showEn > 0) {
      const L = indexLayout(fitLayout(c, 's4en', TXT.s4en.words, TXT.s4en.ipa, 84, 36, 900, ipaOn()));
      const r = drawSentence(c, L, 540, 1230, { revealWords: showEn * 5, hl: { 1: PAL.mint } });
      softUnderline(c, r[1], prog(showEn, 1.0, 1.6), T, PAL.mint);
    }
    sparkles(c, cx, cy, prog(rv, 0, 1.4), 16, 330, PAL.mintLight);
  }
}

/* ---------------- SCENE 4 — the close ---------------- */
function pairRow(c, y, en, es, ipa, col, a, slide) {
  c.save(); c.globalAlpha = a; c.translate(slide, 0);
  let size = 54, wA = 80, wEn, wEs, total; do { wEn = tw(c, en, size, 900, SERIF); wEs = tw(c, es, size, 900, SERIF); total = wEn + wA + wEs; size -= 2; } while (total > 820 && size > 30); size += 2; const cw = total + 100;
  withShadow(c, 'rgba(0,0,0,.35)', 26, 0, 12, () => { rr(c, 540 - cw / 2, y - 72, cw, 150, 36); c.fillStyle = hexA('#13305F', .96); c.fill(); });
  c.strokeStyle = col; c.lineWidth = 4; rr(c, 540 - cw / 2, y - 72, cw, 150, 36); c.stroke();
  const x0 = 540 - total / 2;
  txt(c, en, x0, y + 18, { size, fill: col, weight: 900, align: 'left' });
  if (ipaOn() && ipa) txt(c, ipa, x0 + wEn / 2, y + 62, { size: 30, weight: 600, family: IPAF, fill: PAL.mintLight });
  txt(c, '→', x0 + wEn + wA / 2, y + 16, { size: 54, fill: PAL.ivory, weight: 800, family: SANS });
  txt(c, es, x0 + wEn + wA, y + 18, { size, fill: PAL.ivory, weight: 900, align: 'left' });
  c.restore();
}
function sceneClose(c, st, T) {
  bgBase(c, W, H, T, 0);
  const a1 = E.out(prog(st, 0, .45)), a2 = E.out(prog(st, .3, .75)), up = E.inOut(prog(st, 1.35, 1.95));
  const y1 = lerp(700, 330, up), y2 = lerp(900, 520, up);
  pairRow(c, y1, 'ACTUALLY', 'EN REALIDAD', TXT.ipaActually, PAL.tangLight, a1, (1 - a1) * -200);
  pairRow(c, y2, 'CURRENTLY', 'ACTUALMENTE', TXT.ipaCurrently, PAL.mint, a2, (1 - a2) * 200);
  const lp = E.back(prog(st, 1.6, 2.3));
  if (lp > 0) {
    c.save(); c.translate(540, 900); c.scale(lp, lp); c.globalAlpha = Math.min(1, lp * 1.5);
    withShadow(c, 'rgba(0,0,0,.45)', 50, 0, 24, () => { rr(c, -420, -200, 840, 400, 56); c.fillStyle = PAL.ivory; c.fill(); });
    const lw = 780, lh = lw * logoImg.naturalHeight / (logoImg.naturalWidth || 1);
    if (logoImg.complete && logoImg.naturalWidth) c.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh); else txt(c, 'Fluent English', 0, 20, { size: 90, fill: PAL.navy });
    c.restore();
  }
  const cp = E.back(prog(st, 2.3, 2.9));
  if (cp > 0) {
    c.save(); c.translate(540, 1240); c.scale(cp, cp); c.globalAlpha = Math.min(1, cp * 1.5);
    const bump = 1 + .015 * Math.sin(T * 3); c.scale(bump, bump);
    const w = 800; withShadow(c, hexA(PAL.tang, .6), 40, 0, 14, () => { rr(c, -w / 2, -80, w, 160, 80); c.fillStyle = lin(c, 0, -80, 0, 80, [[0, PAL.tangLight], [.2, PAL.tang], [1, PAL.tangDeep]]); c.fill(); });
    drawChat(c, -w / 2 + 100, 0, 1.15, PAL.ivory);
    const w1 = tw(c, 'Escríbenos ', 50, 800, SANS), w2 = tw(c, 'INGLÉS', 66, 900, SERIF), x0 = (-w / 2 + 170 + w / 2 - 80) - (w1 + w2) / 2;
    txt(c, 'Escríbenos ', x0, 20, { size: 50, weight: 800, family: SANS, fill: '#2a1200', align: 'left' });
    txt(c, 'INGLÉS', x0 + w1, 22, { size: 66, weight: 900, family: SERIF, fill: PAL.navyDeep, align: 'left' });
    c.restore();
    txt(c, 'Clases en línea', 540, 1420, { size: 40, weight: 800, family: SANS, fill: PAL.mintLight, ls: 4, alpha: E.out(prog(st, 2.9, 3.4)) });
  }
  sparkles(c, 540, 900, prog(st, 1.7, 2.7), 18, 420, PAL.tangLight);
}

/* ---------------- cover (before Start / poster frame) ---------------- */
function drawCover(c, T) {
  bgBase(c, W, H, T, 0);
  drawCalendar(c, 540, 560, { s: .85, rot: -.05, flip: 0 });
  drawTag(c, 540, 1010, 'ACTUALLY', { rot: -.04 });
  txt(c, '≠', 540, 1250, { size: 150, fill: PAL.ivory, weight: 900, shadow: ['rgba(0,0,0,.4)', 18, 6] });
  const w = tw(c, 'ACTUALMENTE', 78, 900, SERIF) + 96; rr(c, 540 - w / 2, 1296, w, 130, 30); c.fillStyle = PAL.navy2; c.fill(); c.strokeStyle = PAL.mint; c.lineWidth = 5; rr(c, 540 - w / 2 + 6, 1302, w - 12, 118, 25); c.stroke();
  txt(c, 'ACTUALMENTE', 540, 1384, { size: 78, fill: PAL.mintLight, weight: 900 });
  txt(c, '👀', 540, 1530, { size: 100, family: '"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif' });
  vignette(c, W, H);
}

const SCENES = [sceneHook, sceneTea, sceneStudy, sceneChallenge, sceneClose];
const TRANS = ['none', 'none', 'iris', 'fade', 'iris'];

function renderFrame(c) {
  const T = Clock.now() / 1000;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.clearRect(0, 0, W, H);
  if (Show.state === 'idle' || Show.scene < 0) { drawCover(c, T); }
  else {
    const st = (Clock.now() - Show.sceneStart) / 1000, tp = prog(st, 0, .7);
    const kind = TRANS[Show.scene];
    if (Show.prev != null && kind !== 'none' && tp < 1) {
      c.save(); SCENES[Show.prev](c, Show.prevSt, T); c.restore();
      c.save();
      if (kind === 'iris') { c.beginPath(); c.arc(540, 960, E.inOut(tp) * 1500, 0, 7); c.clip(); } else c.globalAlpha = E.inOut(tp);
      SCENES[Show.scene](c, st, T); c.restore();
    } else SCENES[Show.scene](c, st, T);
    vignette(c, W, H);
    // chrome that never competes with the lesson
    if (Show.cap) drawCaption(c, Show.cap);
  }
  if (Show.debug) {
    c.save(); c.strokeStyle = 'rgba(255,0,80,.7)'; c.lineWidth = 3; c.strokeRect(60, 250, 860, 1290); c.restore();
  }
}

/* ---------------- the show script (speech drives the pace) ---------------- */
function enterScene(i) {
  const now = Clock.now();
  Show.prev = Show.scene >= 0 ? Show.scene : null; Show.prevSt = (now - Show.sceneStart) / 1000;
  Show.scene = i; Show.sceneStart = now; Show.ev[i] = {}; Show.cap = null; Show.mouth = false;
}
const mark = (i, name) => { Show.ev[i][name] = Clock.now(); };
const sceneTime = () => (Clock.now() - Show.sceneStart) / 1000;
async function atTime(s) { const d = s - sceneTime(); if (d > 0) await Clock.sleep(d * 1000); }
async function narrate(n, extra = {}) {
  Audio_.duck('voice'); Show.cap = n.cap; await Speech.say(n.segs); Show.cap = null; await Clock.sleep(80); Audio_.duck('idle');
}
async function charLine(i, lines) {
  Audio_.duck('voice'); mark(i, 'enShow');
  await Speech.say(lines, { segStart: () => { Show.mouth = true; }, segEnd: () => { Show.mouth = false; } });
  Show.mouth = false; await Clock.sleep(80); Audio_.duck('idle');
}
async function playShow(run) {
  const S = Audio_.sfx, alive = () => { if (run !== Show.run) throw CANCEL; };
  try {
    Show.state = 'playing'; Audio_.startMusic(); await Clock.sleep(60);
    /* 1 — the hook */
    enterScene(0); S.swish(1, .5, .14);
    const n1 = (async () => { await atTime(.25); await narrate(NARR.n1); })();
    (async () => { await atTime(.7); S.swish(1, .3, .12); await atTime(1.2); S.paperFlip(); Audio_.interrupt(); await atTime(1.45); S.swish(-1, .45, .12); await atTime(2.35); S.pop(520); await atTime(2.5); S.sparkle(); })().catch(() => { });
    await n1; alive(); await Clock.sleep(120);
    /* 2 — coffee or tea? */
    enterScene(1);
    (async () => { await atTime(.35); S.swish(1, .3, .1); await atTime(.62); S.paperFlip(); await atTime(.95); S.cup(1.15); await atTime(1.15); S.cup(.9); await atTime(1.9); S.swish(-1, .22, .07); await atTime(2.4); S.cup(1.4); })().catch(() => { });
    await atTime(1.15); await charLine(1, LINES.e2); alive();
    await Clock.sleep(150); mark(1, 'esShow'); S.pop(740); await Clock.sleep(300);
    await narrate(NARR.n2); alive(); await Clock.sleep(120);
    /* 3 — study corner */
    enterScene(2); S.swish(1, .5, .12);
    (async () => { await atTime(.5); S.scribble(); })().catch(() => { });
    await atTime(.5); await charLine(2, LINES.e3); alive();
    await Clock.sleep(150); mark(2, 'esShow'); S.pop(780); await Clock.sleep(300);
    await narrate(NARR.n3); alive(); await Clock.sleep(120);
    /* 4 — speaking challenge */
    enterScene(3); S.swish(-1, .4, .08); await atTime(.2);
    await narrate(NARR.n4); alive();
    await Clock.sleep(120); Audio_.duck('silent'); await Clock.sleep(280);
    mark(3, 'pauseStart');                                   // four uninterrupted, silent seconds
    await Clock.sleep(4000); alive();
    mark(3, 'reveal'); Audio_.duck('idle'); S.revealChord(1); S.sparkle(); await Clock.sleep(300);
    await charLine(3, LINES.e4); alive(); await Clock.sleep(350);
    /* 5 — close */
    enterScene(4); S.swish(1, .45, .12);
    (async () => { await atTime(.35); S.pop(600); await atTime(.8); S.pop(760); await atTime(1.6); S.pluck(88); S.sparkle(); await atTime(2.35); S.pop(880); })().catch(() => { });
    await atTime(.4); await narrate(NARR.n5); alive();
    await Clock.sleep(450); Audio_.endMusic(1.8); await Clock.sleep(1000);
    Show.state = 'ended'; Show.endedAt = Clock.now(); window.dispatchEvent(new Event('fe-ended'));
  } catch (e) { if (e !== CANCEL) { console.error(e); } }
}
