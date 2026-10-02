/* Deterministic frame renderer: FE.render(ctx, t, opts)  — opts.mode: 0 off | 1 captions | 2 captions+IPA */
(function () {
  const FE = (window.FE = window.FE || {});
  const U = FE.U, C = FE.C, A = FE.art, K = U.keys;
  const W = FE.W, H = FE.H, CX = 515; // UI centre line (inside platform safe margins)
  const logo = new Image(); let logoReady = false;
  logo.onload = () => { logoReady = true; }; logo.src = 'assets/fluent_english_logo_blue.png';
  FE.logoReady = () => logoReady;
  FE.logoImg = logo;

  const cue = (id) => FE.CUES.find((q) => q.id === id);
  const vd = (id) => (FE.VOICES && FE.VOICES.cues[id]) || null;
  const cueEnd = (id) => cue(id).t + (vd(id) ? vd(id).dur : 2.5);
  FE.cueEnd = cueEnd;

  /* ---------- arm keyframes ---------- */
  const restR = { W: [150, 312], f1: 0.82, f2: 0.72, pref: [0.2, 1], hand: { pose: 'relaxed', tS: -1 } };
  const restL = { W: [-150, 312], f1: 0.82, f2: 0.72, pref: [-0.2, 1], hand: { pose: 'relaxed', tS: 1 } };
  const menuR = { W: [250, 16], f1: 0.86, f2: 0.9, pref: [0.1, 1], hand: { pose: 'present', tS: -1, roll: 0.12 } };
  const offerR = { W: [222, 196], f1: 0.88, f2: 0.78, pref: [0.4, 1], hand: { pose: 'present', tS: -1, roll: -0.5 } };
  const cardsR = { W: [212, 150], f1: 0.88, f2: 0.78, pref: [0.1, 1], hand: { pose: 'open', tS: -1, roll: -0.42 } };
  const pointR = { W: [250, 20], f1: 0.95, f2: 0.9, pref: [0.2, 1], hand: { pose: 'point', tS: -1, roll: -0.25 } };
  function blend(a, b, k) {
    const hand = Object.assign({}, a.hand, { to: b.hand.pose, k: U.ease.sine(k) });
    hand.roll = U.lerp(a.hand.roll || 0, b.hand.roll || 0, k);
    if (b.hand.dir != null) { const ea = a.hand.dir != null ? a.hand.dir : null; hand.dir = ea == null ? (k > 0.55 ? b.hand.dir : null) : U.lerp(ea, b.hand.dir, k); }
    if (k >= 0.5) { hand.pose = a.hand.pose; }
    return { W: U.mix2(a.W, b.W, k), f1: U.lerp(a.f1, b.f1, k), f2: U.lerp(a.f2, b.f2, k), pref: U.mix2(a.pref, b.pref, k), hand };
  }
  function armAt(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return blend(a[1], b[1], U.ease.sine((t - a[0]) / (b[0] - a[0]))); }
    }
    return keys[keys.length - 1][1];
  }
  const R_KEYS = [[0, restR], [3.6, restR], [4.3, menuR], [7.0, menuR], [7.8, restR], [11.3, restR], [11.9, offerR], [15.0, offerR], [15.8, restR],
    [17.3, restR], [18.0, cardsR], [20.3, cardsR], [21.0, restR]];
  const L_KEYS = [[0, restL]];

  /* glass handover (scene 5) */
  const GL = { base0: [900, 1146], base1: [610, 1146], base2: [392, 1262], s: 0.92 };
  function glassPos(t) {
    if (t < 24.0) return null;
    if (t < 24.45) return U.mix2(GL.base0, GL.base1, U.ease.out(U.map(t, 24.0, 24.45)));
    if (t < 25.55) return GL.base1;
    return U.mix2(GL.base1, GL.base2, U.ease.inOut(U.map(t, 25.5, 26.4)));
  }
  function holdWeight(t) { return U.ease.inOut(U.map(t, 24.75, 25.5)); }

  function person(t) {
    const u = U.ease.inOut(U.map(t, 0.55, 3.45));
    const s = U.lerp(0.8, 1.35, u), x = U.lerp(-220, 330, u);
    const walking = t > 0.5 && t < 3.5;
    const ph = walking ? t * 8.2 : 0;
    const bob = walking ? -Math.abs(Math.sin(ph)) * 9 : 0;
    const P = {
      x, y: 1123 - 180 * s + bob, s, walk: ph,
      shirt: C.teal, shirtDark: C.deepTeal, shirtLight: '#9AD6CC', outline: '#0E3B3D',
      skin: C.skin, skinShade: C.skinShade, skinLight: C.skinLight, hair: C.hair, beard: true, pants: '#2C3A4A', shoes: C.caramel,
      breathe: Math.sin(t * 2.1), tilt: Math.sin(t * 0.9) * 0.012, nod: 0, look: [0, 0], brow: 0, blink: 0, mouth: { open: 0, smile: 0.7 }
    };
    // blink
    const bt = (t + 0.7) % 3.4; P.blink = bt < 0.14 ? Math.sin((bt / 0.14) * Math.PI) : 0;
    // gaze / head
    if (t < 3.5) { P.look = [0.2, 0.1]; }
    if (t >= 4.2 && t < 7.4) { const k = U.ease.sine(U.map(t, 4.2, 4.7)) * (1 - U.map(t, 6.9, 7.4)); P.look = [0.9 * k, -0.45 * k]; P.tilt += 0.05 * k; }
    if (t >= 17.5 && t < 20.4) { const k = U.ease.sine(U.map(t, 17.5, 18)) * (1 - U.map(t, 20, 20.4)); P.look = [0.85 * k, 0.1 * k]; P.tilt += 0.04 * k; }
    if (t >= 20.55 && t < 23.65) { P.brow = 0.8; P.nod = Math.sin((t - 20.55) * 2.4) * 2.2; P.mouth.smile = 0.85; }
    if (t >= 24.6) P.look = [-0.25 * U.map(t, 25.6, 26.4), 0.35 * U.map(t, 25.6, 26.4)];
    // nods while barista / narrator speaks
    if (t > 8.3 && t < 9.2) P.nod = Math.sin(U.map(t, 8.3, 9.2) * Math.PI * 2) * 4;
    if (t > 25.9 && t < 26.8) P.nod = Math.sin(U.map(t, 25.9, 26.8) * Math.PI) * 5;
    if (t >= 25.9) P.mouth.smile = 1;
    // lips: customer speaks the English model lines
    ['v2', 'v4'].forEach((id) => {
      const q = cue(id), tl = t - q.t, d = vd(id);
      if (d && tl >= 0 && tl <= d.dur) {
        const e = d.env[Math.min(d.env.length - 1, Math.floor(tl * d.envHz))] || 0;
        P.mouth.open = Math.min(1, e * 0.95); P.mouth.smile = 0.55;
      } else if (!d && tl >= 0 && tl <= 2.2) P.mouth.open = 0.25 + 0.5 * Math.abs(Math.sin(tl * 13));
    });
    // arms
    const sw = walking ? Math.sin(ph) * 26 : 0;
    const aR = armAt(R_KEYS, t), aL = armAt(L_KEYS, t);
    P.armR = JSON.parse(JSON.stringify(aR)); P.armL = JSON.parse(JSON.stringify(aL));
    if (walking) { P.armR.W[1] += sw; P.armL.W[1] -= sw; }
    // glass hold (scene 5) — hands wrap the glass, elbows stay near the torso
    const gp = glassPos(t);
    if (gp && t > 24.7) {
      const k = holdWeight(t), gmid = [gp[0], gp[1] - 128 * GL.s];
      const toLocal = (wx, wy) => [(wx - P.x) / P.s, (wy - P.y) / P.s];
      const wr = toLocal(gmid[0] + 138, gmid[1] - 6), wl = toLocal(gmid[0] - 138, gmid[1] + 52);
      const hR = { W: wr, f1: 0.62, f2: 0.3, pref: [0.4, 1], hand: { pose: 'wrap', tS: -1, dir: Math.PI - 0.15, scale: 1.0 } };
      const hL = { W: wl, f1: 0.62, f2: 0.3, pref: [-0.4, 1], hand: { pose: 'wrap', tS: 1, dir: 0.12, scale: 1.0 } };
      P.armR = blend(Object.assign({}, aR, { hand: Object.assign({}, aR.hand) }), hR, k);
      P.armL = blend(aL, hL, U.ease.inOut(U.map(t, 25.95, 26.5)));
      P.armR.hand.pose = k > 0.35 ? 'wrap' : P.armR.hand.pose; P.armR.hand.to = 'wrap'; P.armR.hand.k = k > 0.35 ? 0 : P.armR.hand.k;
      if (U.map(t, 25.95, 26.5) > 0.35) { P.armL.hand.pose = 'wrap'; P.armL.hand.k = 0; P.armL.hand.to = 'wrap'; }
      const gl = gp, pp = P; P.holdL = (c) => { c.save(); c.translate((gl[0] - pp.x) / pp.s, (gl[1] - pp.y) / pp.s); A.drink(c, 0, 0, GL.s / pp.s, 'iced', t); c.restore(); };
    }
    return P;
  }
  function glassFingersMask() {}

  function barista(t, gp) {
    const P = {
      x: 905, y: 1010, s: 1.0, walk: null, female: true,
      shirt: '#F3E6CC', shirtDark: '#D9C7A4', shirtLight: '#FFFFFF', outline: '#5A4631', apron: C.coral,
      skin: '#E6B08C', skinShade: '#C98F6C', skinLight: '#F2C7A8', hair: '#5A2E20', beard: false, pants: '#222',
      breathe: Math.sin(t * 2.3 + 1), tilt: Math.sin(t * 0.7) * 0.015, look: [-0.7, 0.1], blink: ((t + 1.9) % 3.9) < 0.13 ? 1 : 0,
      brow: 0, mouth: { open: 0, smile: 0.7 }
    };
    const rest = (side) => ({ W: [side * 120, 300], f1: 0.9, f2: 0.7, pref: [side * 0.5, 1], hand: { pose: 'relaxed', tS: -side } });
    P.armL = rest(-1); P.armR = rest(1);
    if (t > 24.0 && t < 24.7) { P.mouth.smile = 1; P.nod = Math.sin(U.map(t, 24.3, 24.7) * Math.PI) * 4; }
    P.s = 1.0;
    return P;
  }

  /* ---------- camera ---------- */
  function camera(t) {
    const z = K([[0, 0.86], [3.6, 1.0], [24, 1.0], [27.4, 1.045]], t);
    const c = K([[0, [60, 1010]], [3.6, [540, 960]], [24, [540, 960]], [27.4, [525, 955]]], t);
    return { z, cx: c[0], cy: c[1] };
  }

  /* ---------- UI helpers ---------- */
  function plate(c, x, y, w, h, fill, a) {
    c.save(); c.globalAlpha = a == null ? 1 : a; U.shadow(c, 'rgba(30,15,8,0.35)', 24, 0, 8); U.rr(c, x, y, w, h, 34); c.fillStyle = fill; c.fill(); c.restore();
  }
  function pop(t, t0, d) { return t < t0 ? 0 : U.ease.back(U.map(t, t0, t0 + d)); }

  function drawHeadline(c, t) {
    const a = U.ease.out(U.map(t, 0.3, 0.9)) * (1 - U.map(t, 3.55, 3.95));
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 26);
    plate(c, 70, 232, 890, 250, 'rgba(59,36,24,0.9)');
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = C.ivory; c.font = '800 96px ' + FE.FONT.head; c.fillText('PIDE TU CAFÉ', CX, 355);
    c.fillStyle = C.paleGold; c.fillText('EN INGLÉS', CX, 450);
    c.fillStyle = C.coral; U.rr(c, CX - 120, 468, 240, 8, 4); c.fill();
    c.restore();
  }

  function phraseKey(t) { return t < 11.35 ? 'p1' : 'p2'; }

  function drawPhraseCard(c, t, mode) {
    if (t < 4.0 || t >= 24.0) return;
    const inA = U.ease.out(U.map(t, 4.0, 4.55)), outA = 1 - U.map(t, 23.7, 24.0);
    const a = inA * outA; if (a <= 0) return;
    const scene4 = t >= 17;
    let lines = [];
    const fontW = '800 60px ' + FE.FONT.head;
    c.font = fontW;
    // text layouts
    const mk = (words) => U.layoutWords(c, words, fontW, 800, 20);
    const words1 = FE.PHRASES.p1, words2 = FE.PHRASES.p2, words3 = ['Could', 'I', 'have', '____,', 'please?'];
    const tChange = 11.35, swap = U.ease.sine(U.map(t, tChange, tChange + 0.45));
    const cardH = mode === 2 ? 304 : 236, cardY = 228, cardW = 900, cardX = CX - cardW / 2;
    c.save(); c.globalAlpha = a; c.translate(0, (1 - inA) * -30);
    plate(c, cardX, cardY, cardW, cardH, 'rgba(255,246,230,0.97)');
    c.fillStyle = C.teal; U.rr(c, cardX + 28, cardY + 24, 120, 8, 4); c.fill();
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';

    const drawLayout = (words, alpha, dy, hiIdx, spokenIdx, chg) => {
      const lay = mk(words); c.save(); c.globalAlpha *= alpha;
      lay.forEach((ln, li) => {
        const y = cardY + 104 + li * 74 + dy;
        ln.items.forEach((it, wi) => {
          const idx = lay.slice(0, li).reduce((s, l) => s + l.items.length, 0) + wi;
          const x = CX + it.x;
          if (chg && chg.includes(idx) && swap > 0.6) { c.fillStyle = C.gold; U.rr(c, x - 8, y - 56, it.width + 16, 78, 18); c.fill(); }
          if (spokenIdx === idx) { c.fillStyle = 'rgba(242,107,91,0.28)'; U.rr(c, x - 8, y - 56, it.width + 16, 78, 18); c.fill(); }
          c.font = fontW; c.fillStyle = chg && chg.includes(idx) && swap > 0.6 ? C.espresso : (spokenIdx === idx ? C.deepCoral : C.espresso);
          c.fillText(it.w, x, y);
        });
      });
      c.restore(); return lay;
    };
    const spokenIndex = (id, words) => {
      const q = cue(id), d = vd(id); if (!d) return -1;
      const tl = t - q.t; if (tl < 0 || tl > d.dur + 0.15) return -1;
      const i = d.words.findIndex((w) => tl >= w.t0 && tl < w.t1); return i;
    };
    let ipa = null;
    if (!scene4) {
      if (t < tChange) { drawLayout(words1, 1, 0, -1, spokenIndex('v2')); ipa = FE.IPA.p1; }
      else {
        drawLayout(words1, 1 - swap, -swap * 18, -1, -1);
        drawLayout(words2, swap, (1 - swap) * 18, -1, spokenIndex('v4'), [3, 4, 5]);
        ipa = swap < 0.5 ? FE.IPA.p1 : FE.IPA.p2;
      }
    } else {
      const lay = drawLayout(words3, 1, 0, -1, -1);
      // pulsing blank underline
      c.fillStyle = C.coral; c.globalAlpha *= 0.6 + 0.4 * Math.sin(t * 5); const l0 = lay[lay.length > 1 ? 1 : 0]; void l0; c.globalAlpha = a;
      ipa = '/kʊd aɪ hæv ____ pliːz/';
    }
    if (mode === 2 && ipa) {
      c.font = '500 40px ' + FE.FONT.body; c.textAlign = 'center'; c.fillStyle = C.mocha;
      const crossing = !scene4 && t >= tChange;
      if (crossing) { c.globalAlpha = a * (1 - swap); c.fillText(FE.IPA.p1, CX, cardY + cardH - 40); c.globalAlpha = a * swap; c.fillText(FE.IPA.p2, CX, cardY + cardH - 40); }
      else c.fillText(ipa, CX, cardY + cardH - 40);
    }
    c.restore();
  }

  /* Remix-scene drink badge (coffee -> latte -> iced cup) */
  function drawBadge(c, t) {
    if (t < 11.0 || t >= 17.2) return;
    const a = pop(t, 11.1, 0.5) * (1 - U.map(t, 16.8, 17.2));
    if (a <= 0.001) return;
    const cx = 820, cy = 1010;
    c.save(); c.translate(cx, cy); c.scale(a, a);
    U.shadow(c, 'rgba(30,15,8,0.35)', 30, 0, 10); c.beginPath(); c.arc(0, 0, 210, 0, 7); c.fillStyle = C.ivory; c.fill(); U.noShadow(c);
    c.lineWidth = 10; c.strokeStyle = C.gold; c.stroke();
    const sw = U.ease.sine(U.map(t, 11.45, 11.85));
    c.save(); c.beginPath(); c.arc(0, 0, 200, 0, 7); c.clip();
    c.globalAlpha = 1 - sw; A.drink(c, 0, 110 - sw * 24, 1.0, 'coffee', t);
    c.globalAlpha = sw; A.drink(c, 0, 118 + (1 - sw) * 26, 0.86, 'iced', t);
    c.restore();
    c.restore();
  }

  function drawChoices(c, t) {
    if (t < 17.3 || t >= 24.0) return;
    const out = 1 - U.map(t, 23.6, 24.0);
    const items = [{ k: 'coffee', label: 'a coffee', ipa: FE.IPA.coffee }, { k: 'iced', label: 'an iced latte', ipa: FE.IPA.latte }, { k: 'tea', label: 'a tea', ipa: FE.IPA.tea }];
    items.forEach((it, i) => {
      const a = pop(t, 17.55 + i * 0.28, 0.5) * out; if (a <= 0.001) return;
      const x = 600, y = 612 + i * 218, w = 390, h = 196;
      const hot = t >= 20.55 && t < 23.65 && ((((t - 20.55) / 1.03) | 0) === i);
      c.save(); c.translate(x + w / 2, y + h / 2); c.scale(a * (hot ? 1.03 : 1), a * (hot ? 1.03 : 1)); c.translate(-(x + w / 2), -(y + h / 2));
      plate(c, x, y, w, h, 'rgba(255,246,230,0.97)');
      if (hot) { c.lineWidth = 6; c.strokeStyle = C.coral; U.rr(c, x, y, w, h, 34); c.stroke(); }
      c.save(); U.rr(c, x, y, w, h, 34); c.clip();
      c.fillStyle = '#EAD6B3'; c.beginPath(); c.arc(x + 92, y + h / 2, 72, 0, 7); c.fill(); c.restore();
      A.drink(c, x + 92, y + h - 34, it.k === 'iced' ? 0.4 : 0.44, it.k, t);
      c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = C.espresso; c.font = '800 34px ' + FE.FONT.head;
      c.fillText(it.label, x + 176, y + h / 2 + (FE._mode === 2 ? -4 : 12), w - 186);
      if (FE._mode === 2) { c.font = '500 25px ' + FE.FONT.body; c.fillStyle = C.mocha; c.fillText(it.ipa, x + 176, y + h / 2 + 40, w - 186); }
      c.restore();
    });
  }

  function drawPauseUI(c, t) {
    if (t < FE.PAUSE.t0 || t >= 24.0) return;
    const a = U.ease.out(U.map(t, FE.PAUSE.t0, FE.PAUSE.t0 + 0.3)) * (1 - U.map(t, FE.PAUSE.t1, FE.PAUSE.t1 + 0.35));
    if (a <= 0) return;
    const k = U.map(t, FE.PAUSE.t0, FE.PAUSE.t1);
    c.save(); c.globalAlpha = a;
    plate(c, CX - 400, 1428, 800, 150, 'rgba(59,36,24,0.92)');
    const rx = CX - 290, ry = 1503;
    c.lineWidth = 12; c.strokeStyle = 'rgba(255,246,230,0.2)'; c.beginPath(); c.arc(rx, ry, 46, 0, 7); c.stroke();
    c.strokeStyle = C.coral; c.lineCap = 'round'; c.beginPath(); c.arc(rx, ry, 46, -Math.PI / 2, -Math.PI / 2 + (1 - k) * Math.PI * 2); c.stroke(); c.lineCap = 'butt';
    // mic icon
    c.fillStyle = C.ivory; U.rr(c, rx - 10, ry - 24, 20, 34, 10); c.fill();
    c.strokeStyle = C.ivory; c.lineWidth = 5; c.beginPath(); c.arc(rx, ry - 2, 18, 0.1, Math.PI - 0.1); c.stroke();
    c.beginPath(); c.moveTo(rx, ry + 16); c.lineTo(rx, ry + 28); c.stroke();
    c.fillStyle = C.paleGold; c.textAlign = 'left'; c.font = '800 54px ' + FE.FONT.head; c.fillText('TU TURNO', rx + 76, ry - 2);
    c.fillStyle = C.ivory; c.font = '600 34px ' + FE.FONT.body; c.fillText('Dilo en voz alta', rx + 76, ry + 44);
    c.restore();
  }

  function drawCaptions(c, t, mode) {
    if (mode < 1) return;
    const active = FE.CUES.find((q) => q.lang === 'es' && t >= q.t - 0.05 && t <= cueEnd(q.id) + 0.35);
    if (!active) return;
    const d = vd(active.id), tl = t - active.t;
    const a = U.ease.out(U.map(t, active.t - 0.05, active.t + 0.2)) * (1 - U.map(t, cueEnd(active.id) + 0.1, cueEnd(active.id) + 0.35));
    if (a <= 0) return;
    const font = '700 48px ' + FE.FONT.body;
    c.font = font;
    const raw = active.text.replace(/INGLÉS\.?$/, 'INGLÉS.');
    const words = raw.split(/\s+/);
    const lay = U.layoutWords(c, words, font, 850, 14);
    const lh = 64, h = lay.length * lh + 44, w = Math.min(880, Math.max(...lay.map((l) => l.width)) + 70);
    const isEnd = active.id === 'v6';
    const y0 = isEnd ? 1440 : 1405;
    c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 14);
    plate(c, CX - w / 2, y0, w, h, 'rgba(36,25,21,0.78)');
    let wi = 0;
    lay.forEach((ln, li) => ln.items.forEach((it) => {
      const cw = d && d.words[wi] ? d.words[wi] : null; const on = cw && tl >= cw.t0 && tl < cw.t1;
      c.textAlign = 'left'; c.font = font; c.fillStyle = on ? C.paleGold : C.ivory;
      c.fillText(it.w, CX + it.x, y0 + 58 + li * lh); wi++;
    }));
    c.restore();
  }

  function drawEndCard(c, t) {
    const a = U.ease.inOut(U.map(t, 26.9, 27.5)); if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    c.fillStyle = U.grad(c, 0, 0, 0, H, [[0, '#FFF9EE'], [1, '#F6E7CC']]); c.fillRect(0, 0, W, H);
    // soft bean-coloured accents
    c.fillStyle = 'rgba(31,122,122,0.07)'; c.beginPath(); c.arc(920, 240, 320, 0, 7); c.fill();
    c.fillStyle = 'rgba(242,107,91,0.07)'; c.beginPath(); c.arc(130, 1560, 360, 0, 7); c.fill();
    const lg = pop(t, 27.0, 0.7);
    if (logoReady) {
      // crop to the logo's opaque bounds (406..3044 x 350..1525 in the 3444x1875 source)
      const sx = 380, sy = 330, sw = 2690, sh = 1220, dw = 900, dh = dw * sh / sw;
      c.save(); c.translate(CX, 640); c.scale(0.9 + 0.1 * lg, 0.9 + 0.1 * lg); c.globalAlpha = a * U.clamp(lg);
      c.drawImage(logo, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh); c.restore();
    }
    const p = pop(t, 27.7, 0.5);
    if (p > 0) {
      c.save(); c.translate(CX, 1090); c.scale(p, p);
      U.shadow(c, 'rgba(30,15,8,0.3)', 24, 0, 8); U.rr(c, -400, -66, 800, 132, 66); c.fillStyle = C.coral; c.fill(); U.noShadow(c);
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '800 62px ' + FE.FONT.head; c.fillText('ESCRÍBENOS INGLÉS', 0, 22);
      c.restore();
      const q = pop(t, 27.95, 0.5);
      c.save(); c.translate(CX, 1235); c.scale(q, q); c.fillStyle = C.navy; c.textAlign = 'center'; c.font = '700 56px ' + FE.FONT.body; c.fillText('Clases en línea', 0, 0); c.restore();
    }
    c.restore();
  }

  function worldLight(c, t, cam) {
    // warm window light beam
    c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = 0.16;
    const g = U.grad(c, -40, 560, 480, 1500, [[0, '#FFE6A8'], [1, 'rgba(255,230,170,0)']]);
    c.fillStyle = g; c.beginPath(); c.moveTo(-40, 540); c.lineTo(250, 540); c.lineTo(760, 1560); c.lineTo(180, 1560); c.closePath(); c.fill();
    c.restore();
  }

  /* ---------- main ---------- */
  FE._person = person;
  FE.render = function (c, t, opts) {
    const mode = opts && opts.mode != null ? opts.mode : 2; FE._mode = mode;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
    const cam = camera(t);
    c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.translate(-cam.cx, -cam.cy);
    A.wall(c);
    A.window_(c, -60, 560, 300, 460, t);
    // door opens as the customer arrives (and swings shut behind him)
    const open = U.ease.sine(U.map(t, 0.1, 0.7)) * (1 - U.ease.sine(U.map(t, 3.0, 3.8)));
    A.door(c, -330, 548, 220, 1008, open);
    A.shelves(c, 590, 940, 440, t);
    A.menuBoard(c, 600, 470, 440, 330, t > 4.4 && t < 7.4 ? 'Coffee' : (t > 12 && t < 15 ? 'Iced latte' : null));
    A.lamp(c, 150, -420, 540, 1); A.lamp(c, 900, -420, 380, 1);
    // bell above the door
    c.fillStyle = C.gold; c.beginPath(); c.arc(-220, 510 + Math.sin(t * 30) * 2 * (t > 0.5 && t < 1.3 ? 1 : 0), 14, 0, 7); c.fill();
    worldLight(c, t, cam);
    const gp = glassPos(t);
    // barista (clipped behind the counter)
    c.save(); c.beginPath(); c.rect(400, 600, 1500, 520); c.clip();
    FE.drawPerson(c, barista(t, gp));
    c.restore();
    A.counter(c);
    A.espressoMachine(c, 1040, 1114, t); A.pastryDome(c, 560, 1112);
    // glass on counter (before pick-up) is drawn behind the customer's hands
    if (gp && t <= 24.7) { A.drink(c, gp[0], gp[1], GL.s, 'iced', t); }
    // dim the world while the viewer chooses
    const dim = 0.4 * U.ease.sine(U.map(t, 17.2, 17.8)) * (1 - U.ease.sine(U.map(t, 23.6, 24.2)));
    if (dim > 0) { c.fillStyle = 'rgba(40,22,14,' + dim + ')'; c.fillRect(-900, -500, 3000, 3000); }
    c.restore();

    // mid layer (screen space)
    drawBadge(c, t); drawChoices(c, t);

    // customer (on top of the badge/cards so gestures stay visible)
    c.save(); c.translate(W / 2, H / 2); c.scale(cam.z, cam.z); c.translate(-cam.cx, -cam.cy);
    const P = person(t);
    c.globalAlpha = U.ease.out(U.map(t, 0.25, 0.7));
    FE.drawPerson(c, P);
    c.globalAlpha = 1;
    // glass held by the customer: redraw glass between back-of-hands and fingers
    if (gp && t > 24.7) {
      const k = holdWeight(t);
      if (k > 0.05) { /* glass already drawn on the counter / moving; fingers drawn after by drawPerson */ }
    }
    c.restore();

    // vignette
    const vg = c.createRadialGradient(W / 2, H / 2, 600, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(40,20,10,0)'); vg.addColorStop(1, 'rgba(40,20,10,0.28)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);

    if (opts && opts.cover) {
      drawHeadline(c, 2);
      if (logoReady) { const sx = 380, sy = 330, sw = 2690, sh = 1220, dw = 600, dh = dw * sh / sw; c.save(); U.shadow(c, 'rgba(30,15,8,0.25)', 24, 0, 8); U.rr(c, CX - 330, 1442, 660, dh + 60, 36); c.fillStyle = 'rgba(255,246,230,0.96)'; c.fill(); U.noShadow(c); c.drawImage(logo, sx, sy, sw, sh, CX - dw / 2, 1472, dw, dh); c.restore(); }
      c.restore(); return;
    }
    drawEndCard(c, t);
    drawHeadline(c, t); drawPhraseCard(c, t, mode); drawPauseUI(c, t); drawCaptions(c, t, mode);
    // global fade in/out
    const fi = 1 - U.map(t, 0, 0.3); if (fi > 0) { c.fillStyle = 'rgba(255,246,230,' + fi + ')'; c.fillRect(0, 0, W, H); }
    c.restore();
  };
})();
