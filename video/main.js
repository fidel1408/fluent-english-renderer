/* Fluent English – “I agree” reel. Rendering, timeline and UI. Designed at 1080×1920. */
const W = 1080, H = 1920, CX = 520;
const C = { plum: '#3b1450', plum2: '#5a2368', plumD: '#240a33', cream: '#fbf1dd', turq: '#19c6bd', turqD: '#0e8f8d', mango: '#ffa41b', mangoD: '#f2790f', coral: '#f0533b' };
const FONT = "'Fredoka','Baloo 2','Nunito','Trebuchet MS','Segoe UI',system-ui,sans-serif";
const IPAFONT = "'Noto Sans','Charis SIL','Segoe UI','DejaVu Sans',Arial,sans-serif";
const $ = s => document.querySelector(s);
const cv = $('#stage'), ctx = cv.getContext('2d');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const eOut = t => 1 - Math.pow(1 - t, 3), eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eBack = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

// ---------- state
const ST = { running: false, ended: false, recording: false, scene: 'plum', prev: 'plum', sceneT: -9, trans: 'cut', calm: 0, warm: 0, marks: {}, cap: null, ccMode: 0, safe: false, runId: 0, tEnd: 0 };
try { ST.ccMode = +(localStorage.getItem('fe_cc') || 0); } catch (e) {}
const parts = [];
const mark = k => { ST.marks[k] = Clock.t; };
const ph = (k, d, f = eOut) => { const m = ST.marks[k]; return m === undefined ? 0 : f(clamp((Clock.t - m) / d, 0, 1)); };
const since = k => ST.marks[k] === undefined ? -1 : Clock.t - ST.marks[k];
function setScene(s, trans = 'fade') { ST.prev = ST.scene; ST.scene = s; ST.sceneT = Clock.t; ST.trans = trans; }

// ---------- captions / IPA
const IPA = { I: '/aɪ/', 'agree': '/əˈɡriː/', 'with': '/wɪð/', 'you': '/ju/', 'Learning': '/ˈlɜːrnɪŋ/', 'English': '/ˈɪŋɡlɪʃ/', 'takes': '/teɪks/', 'practice': '/ˈpræktɪs/' };

// ---------- particles
function burst(x, y, n, cols, sp = 260, life = 0.9) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 7, v = sp * (0.3 + Math.random() * 0.8); parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, l: 0, m: life * (0.6 + Math.random() * 0.6), s: 5 + Math.random() * 9, c: cols[i % cols.length], star: Math.random() < 0.4 }); }
}
function drawParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.l += dt; if (p.l > p.m) { parts.splice(i, 1); continue; }
    p.vy += 220 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
    const a = 1 - p.l / p.m; ctx.globalAlpha = a; ctx.fillStyle = p.c;
    if (p.star) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.l * 4); ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.lineTo(0, -p.s * 1.4 * a - 2); ctx.rotate(Math.PI / 4); ctx.lineTo(0, -p.s * 0.45); ctx.rotate(Math.PI / 4); } ctx.fill(); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s * a + 1, 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}

// ---------- backgrounds
function blob(x, y, r, col, a, t, k = 0) {
  ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const an = i / 24 * Math.PI * 2, rad = r * (1 + 0.14 * Math.sin(an * 3 + t * 0.6 + k) + 0.08 * Math.sin(an * 5 - t * 0.4 + k * 2)); ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rad, y + Math.sin(an) * rad); }
  ctx.fill(); ctx.globalAlpha = 1;
}
function bgPlum(t, calm = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b0d3c'); g.addColorStop(0.5, '#4b1b5f'); g.addColorStop(1, '#6a2a70');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  blob(150, 420 + Math.sin(t * .5) * 20, 260, C.turq, .16, t, 1); blob(930, 1050 + Math.cos(t * .4) * 24, 300, C.mango, .13, t, 2);
  blob(780, 330, 150, C.turq, .12, t, 3); blob(120, 1380, 240, C.mango, .1, t, 4);
  const r = ctx.createRadialGradient(CX, 820, 40, CX, 820, 640); r.addColorStop(0, 'rgba(255,214,150,.33)'); r.addColorStop(1, 'rgba(255,214,150,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) { const x = (i * 197 + t * (8 + i % 4 * 3)) % W, y = (i * 331 + Math.sin(t * .4 + i) * 40) % H; ctx.fillStyle = i % 3 ? 'rgba(255,230,190,.12)' : 'rgba(25,198,189,.16)'; ctx.beginPath(); ctx.arc(x, y, 8 + i % 5 * 5, 0, 7); ctx.fill(); }
}
function leaf(x, y, len, ang, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * .35, -len * .26, len, 0); ctx.quadraticCurveTo(len * .35, len * .26, 0, 0); ctx.fill(); ctx.restore(); }
function bgRoom(t, calm, warm) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#46185a'); g.addColorStop(0.62, '#6d2d77'); g.addColorStop(1, '#85406f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // wall pattern
  ctx.fillStyle = 'rgba(255,220,180,.05)'; for (let y = 120; y < 1500; y += 120) for (let x = (y / 120 % 2) * 60; x < W + 60; x += 120) { ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); }
  // arched windows
  [[96, 1], [744, -1]].forEach(([x0], i) => {
    const w = 240, top = 430, bot = 980; ctx.fillStyle = '#f7e3c2'; ctx.beginPath(); ctx.moveTo(x0 - 14, bot); ctx.lineTo(x0 - 14, top + w / 2); ctx.arc(x0 + w / 2, top + w / 2, w / 2 + 14, Math.PI, 0); ctx.lineTo(x0 + w + 14, bot); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.moveTo(x0, bot); ctx.lineTo(x0, top + w / 2); ctx.arc(x0 + w / 2, top + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x0 + w, bot); ctx.clip();
    const sg = ctx.createLinearGradient(0, top, 0, bot); sg.addColorStop(0, '#2fd0c6'); sg.addColorStop(1, '#d6fbf0'); ctx.fillStyle = sg; ctx.fillRect(x0, top, w, bot - top);
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x0 + ((t * 8 + i * 90) % (w + 160)) - 40, top + 150, 70, 22, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#18a59b'; ctx.beginPath(); ctx.moveTo(x0, bot); ctx.quadraticCurveTo(x0 + 60, bot - 200, x0 + 130, bot - 120); ctx.quadraticCurveTo(x0 + 190, bot - 190, x0 + w, bot - 90); ctx.lineTo(x0 + w, bot); ctx.fill();
    ctx.fillStyle = '#ffb44a'; ctx.beginPath(); ctx.arc(x0 + (i ? 70 : 170), top + 120, 34, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#f7e3c2'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x0 + w / 2, top); ctx.lineTo(x0 + w / 2, bot); ctx.moveTo(x0, 760); ctx.lineTo(x0 + w, 760); ctx.stroke();
  });
  // pendant lamps
  const gl = 0.55 * (1 - calm * 0.55) + warm * 0.25;
  [[170, 250], [520, 150], [870, 250]].forEach(([x, y], i) => {
    const sw = Math.sin(t * .7 + i) * (1 - calm * .8) * 3; ctx.strokeStyle = 'rgba(255,230,190,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + sw, y); ctx.stroke();
    const r = ctx.createRadialGradient(x + sw, y + 20, 10, x + sw, y + 20, 260); r.addColorStop(0, `rgba(255,190,90,${gl})`); r.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = r; ctx.fillRect(x - 280, y - 240, 560, 520);
    ctx.fillStyle = C.mango; ctx.beginPath(); ctx.moveTo(x + sw - 62, y + 10); ctx.quadraticCurveTo(x + sw - 50, y - 60, x + sw, y - 62); ctx.quadraticCurveTo(x + sw + 50, y - 60, x + sw + 62, y + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff3c9'; ctx.beginPath(); ctx.ellipse(x + sw, y + 10, 62, 12, 0, 0, 7); ctx.fill();
  });
  // sofa + cushions
  ctx.fillStyle = '#12a79f'; rr(-40, 1000, W + 80, 420, 120); ctx.fill(); ctx.fillStyle = '#0e8c88'; rr(-40, 1180, W + 80, 260, 60); ctx.fill();
  ctx.fillStyle = C.mango; rr(60, 1010, 190, 170, 60); ctx.fill(); ctx.fillStyle = C.cream; rr(800, 1020, 180, 160, 60); ctx.fill(); ctx.fillStyle = '#ff7a59'; rr(880, 1060, 150, 150, 55); ctx.fill();
  // plants
  const sw2 = Math.sin(t * .9) * (1 - calm * .8) * 0.05;
  ctx.fillStyle = '#f7ecd9'; rr(24, 1250, 130, 190, 30); ctx.fill();
  [[-1.2, '#0f8f7f'], [-0.8, '#17b3a2'], [-0.4, '#0b7a6e'], [0, '#1ec4ae'], [0.35, '#0f8f7f']].forEach(([a, c], i) => leaf(90, 1260, 250 + i * 18, -Math.PI / 2 + a * .8 + sw2, c));
  ctx.fillStyle = '#f7ecd9'; rr(930, 1300, 120, 150, 30); ctx.fill();
  [[-1, '#17b3a2'], [-0.5, '#0b7a6e'], [0, '#1ec4ae'], [0.5, '#0f8f7f']].forEach(([a, c], i) => leaf(990, 1310, 210 + i * 14, -Math.PI / 2 + a * .8 - sw2, c));
  // floor + rug
  const fg = ctx.createLinearGradient(0, 1420, 0, H); fg.addColorStop(0, '#f1d9b2'); fg.addColorStop(1, '#d9b387'); ctx.fillStyle = fg; ctx.fillRect(0, 1420, W, H - 1420);
  ctx.fillStyle = C.mango; ctx.beginPath(); ctx.ellipse(CX, 1700, 520, 120, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff1d0'; ctx.beginPath(); ctx.ellipse(CX, 1700, 400, 80, 0, 0, 7); ctx.fill();
  // mood overlays
  if (calm > 0) { ctx.fillStyle = `rgba(36,10,51,${0.3 * calm})`; ctx.fillRect(0, 0, W, H); }
  if (warm > 0) { const r = ctx.createRadialGradient(CX, 900, 100, CX, 900, 900); r.addColorStop(0, `rgba(255,190,90,${0.28 * warm})`); r.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H); }
}
function bgCTA(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2b0d3c'); g.addColorStop(1, '#5a2368'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(25,198,189,.18)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(CX, 560, 220 + i * 90 + Math.sin(t + i) * 6, 0, 7); ctx.stroke(); }
  blob(930, 1200, 260, C.mango, .16, t, 1); blob(110, 1500, 240, C.turq, .15, t, 2);
  const r = ctx.createRadialGradient(CX, 520, 20, CX, 520, 520); r.addColorStop(0, 'rgba(255,214,150,.25)'); r.addColorStop(1, 'rgba(255,214,150,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
}
function drawBg(kind, t) {
  if (kind === 'plum') bgPlum(t); else if (kind === 'room') bgRoom(t, ST.calm, ST.warm); else bgCTA(t);
}
const bgKind = s => s === 'plum' ? 'plum' : s === 'cta' ? 'cta' : 'room';

// ---------- text / bubble
function pill(x, y, text, bg, fg, size = 40, a = 1, sc = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(sc, sc); ctx.font = `700 ${size}px ${FONT}`;
  const w = ctx.measureText(text).width + size * 1.5, h = size * 1.7; ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.fillStyle = bg; rr(-w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2); ctx.restore();
}
// lines: [[{t, ipa, glue, w, sc, dx, dy, rot, a, hl, draw}]]
function layout(lines, font, ipaOn) {
  ctx.font = `700 ${font}px ${FONT}`; const sp = font * 0.3, ipaS = Math.max(26, font * 0.3), lh = font * 1.12 + (ipaOn ? ipaS * 1.45 : 0);
  let maxW = 0;
  lines.forEach(L => {
    let x = 0; ctx.font = `700 ${font}px ${FONT}`;
    L.forEach((k, i) => {
      let tw = ctx.measureText(k.t).width * (k.sc || 1);
      if (ipaOn && k.ipa) { ctx.font = `500 ${ipaS}px ${IPAFONT}`; tw = Math.max(tw, ctx.measureText(k.ipa).width + 8); ctx.font = `700 ${font}px ${FONT}`; }
      const slot = tw * (k.w === undefined ? 1 : k.w); if (i && !k.glue) x += sp * (k.w === undefined ? 1 : Math.max(k.w, 0));
      k._x = x; k._w = slot; k._tw = tw; x += slot;
    });
    L.w = x; maxW = Math.max(maxW, x);
  });
  return { lines, font, ipaS, lh, ipaOn, w: maxW, h: lines.length * lh };
}
function drawBubble(Lo, top, a, sc, label) {
  const padX = 80, padY = 64, bw = Lo.w + padX * 2, bh = Lo.h + padY * 2 - (Lo.ipaOn ? 10 : 0);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(CX, top + bh); ctx.scale(sc, sc); ctx.translate(-CX, -(top + bh));
  ctx.shadowColor = 'rgba(15,0,25,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = C.cream;
  rr(CX - bw / 2, top, bw, bh, 78); ctx.fill();
  ctx.beginPath(); ctx.moveTo(CX - 46, top + bh - 4); ctx.quadraticCurveTo(CX - 20, top + bh + 50, CX - 6, top + bh + 86); ctx.quadraticCurveTo(CX + 14, top + bh + 40, CX + 52, top + bh - 4); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.restore();
  return { bw, bh };
}
function drawLines(Lo, top, a, sc, col, anchorBottom) {
  const padY = 64, bh = Lo.h + padY * 2 - (Lo.ipaOn ? 10 : 0);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(CX, top + bh); ctx.scale(sc, sc); ctx.translate(-CX, -(top + bh));
  Lo.lines.forEach((L, li) => {
    const x0 = CX - L.w / 2, yb = top + padY + li * Lo.lh + Lo.font * 0.92;
    // highlight pill behind marked tokens
    const hk = L.filter(k => k.hl && (k.hlA || 0) > 0);
    if (hk.length) {
      const k0 = hk[0], k1 = hk[hk.length - 1], p = k0.hlA, xa = x0 + k0._x - 22, xb = x0 + k1._x + k1._w + 22, w = (xb - xa) * p;
      ctx.fillStyle = 'rgba(255,164,27,.38)'; rr(xa, yb - Lo.font * 0.92 - 6, w, Lo.font * 1.1 + (Lo.ipaOn ? Lo.ipaS * 1.35 : 0), 48); ctx.fill();
      ctx.strokeStyle = C.mangoD; ctx.lineWidth = 6; ctx.globalAlpha = a * p; rr(xa, yb - Lo.font * 0.92 - 6, w, Lo.font * 1.1 + (Lo.ipaOn ? Lo.ipaS * 1.35 : 0), 48); ctx.stroke(); ctx.globalAlpha = a;
    }
    L.forEach(k => {
      const ka = (k.a === undefined ? 1 : k.a); if (ka <= 0.01) return;
      ctx.save(); ctx.globalAlpha = a * ka; const cx = x0 + k._x + k._w / 2 + (k.dx || 0), cy = yb + (k.dy || 0);
      ctx.translate(cx, cy); ctx.rotate(k.rot || 0); ctx.scale(k.sc || 1, k.sc || 1);
      if (k.back) k.back(ctx);
      ctx.font = `700 ${Lo.font}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = k.col || col; ctx.fillText(k.t, 0, 0);
      ctx.restore();
      if (Lo.ipaOn && k.ipa && !k.noIpa) {
        ctx.save(); ctx.globalAlpha = a * ka * (k.ipaA === undefined ? 1 : k.ipaA); ctx.font = `500 ${Lo.ipaS}px ${IPAFONT}`; ctx.textAlign = 'center'; ctx.fillStyle = '#7a3a8c';
        ctx.fillText(k.ipa, x0 + k._x + k._w / 2, yb + Lo.ipaS * 1.25); ctx.restore();
      }
    });
  });
  ctx.restore();
}
const T = (t, o = {}) => Object.assign({ t, ipa: IPA[t.replace(/[.,?]/g, '')] }, o);

// ---------- scene overlays
function sceneHook(t) {
  const ipaOn = ST.ccMode === 2, fz = ph('freeze', 0.55, eBack), wob = fz > 0 ? Math.sin(since('freeze') * 9) * 0.04 * Math.max(0, 1 - since('freeze') * 0.35) : 0;
  const fix = ph('fix', 0.9, x => x), lift = eIO(clamp(fix / 0.7, 0, 1)), dis = clamp((fix - 0.55) / 0.45, 0, 1), land = ph('land', 0.6, eBack), landA = ph('land', 0.3);
  const mSc = 1 + 0.95 * fz;
  const tI = T('I', { ipaA: landA }), tM = T('’m', { glue: true, w: 1 - clamp(fix / 0.75, 0, 1), sc: mSc * (1 - dis * 0.5), dy: -lift * 330 + fz * 14 * Math.sin(t * 7) * (fix ? 0 : 1), rot: wob - lift * 0.5, a: 1 - dis, ipa: null,
    back: c => { if (fz > 0 && fix === 0) { c.fillStyle = C.mango; c.beginPath(); c.ellipse(0, -36, 66, 82, wob, 0, 7); c.fill(); c.fillStyle = C.mangoD; c.globalAlpha = .4; c.beginPath(); c.ellipse(-16, -70, 34, 22, -.5, 0, 7); c.fill(); c.globalAlpha = 1; } },
    col: fz > 0 && fix === 0 ? C.plumD : C.coral });
  const tA = T(land > 0 ? 'agree.' : 'agree', { ipa: IPA.agree, ipaA: landA });
  tI.ipa = IPA.I;
  const Lo = layout([[tI, tM, tA]], 128, ipaOn && land > 0);
  if (fix > 0 && fix < 0.6 && !ST.marks._puff) { ST.marks._puff = 1; }
  const pa = ph('bubble', 0.5, eBack), sq = land > 0 ? 1 + (1 - land) * 0.12 * Math.sin(land * 9) : 1;
  const top = 330;
  const bs = drawBubble(Lo, top, clamp(pa * 2, 0, 1), 0.5 + 0.5 * pa, null);
  drawLines(Lo, top, clamp(pa * 2, 0, 1), 0.5 + 0.5 * pa, C.plum);
  // dissolve dust follows the lifting ’m
  if (fix > 0.5 && !ST.marks._dust) { ST.marks._dust = 1; burst(CX + 40, top + 40, 36, [C.mango, C.cream, C.turq], 300, 1.1); }
  const wrong = since('fix') < 0.5, lab = pa > 0.1;
  const showOk = since('fix') > 0.5;
  if (lab && !showOk) pill(CX, top - 56, '✗  NO DIGAS ASÍ', C.coral, '#fff', 40, clamp(pa * 2, 0, 1) * (1 - ph('fix', 0.4)), 0.9 + 0.1 * pa);
  if (showOk) pill(CX, top - 56, '✓  DI ASÍ', C.turq, '#06322f', 40, ph('fix', 0.5, x => clamp((x - 0.45) * 2, 0, 1)) > 0 ? 1 : 0, 0.8 + 0.2 * ph('fix', 0.8, eBack));
  const vb = ph('verb', 0.5, eBack); if (vb > 0) pill(CX, 1010, 'agree = verbo ✓', C.plum2, C.cream, 46, clamp(vb, 0, 1), 0.7 + 0.3 * vb);
}
function sceneRoom1(t) {
  const ipaOn = ST.ccMode === 2, wy = ph('withyou', 0.5, eBack), hl = ph('hl', 0.5);
  const l1 = [T('I'), T('agree')], l2 = [T('with', { a: wy, dy: (1 - wy) * -40, hl: true, hlA: hl }), T('you.', { ipa: IPA.you, a: wy, dy: (1 - wy) * -40, hl: true, hlA: hl })];
  const Lo = layout([l1, l2], 96, ipaOn), pa = ph('bubble3', 0.5, eBack), top = 250;
  const sp = ph('s5', 0.55, eBack);
  drawBubble(Lo, top, clamp(pa * 2, 0, 1), 0.6 + 0.4 * pa); drawLines(Lo, top, clamp(pa * 2, 0, 1), 0.6 + 0.4 * pa, C.plum);
  pill(CX, top - 50, '✓  MEJORA TU FRASE', C.turq, '#06322f', 38, clamp(pa * 2, 0, 1), 1);
}
function sceneRoom4(t) {
  const ipaOn = ST.ccMode === 2, pa = ph('s4', 0.5, eBack);
  const Lo = layout([[T('Learning'), T('English')], [T('takes'), T('practice.')]], 92, ipaOn), top = 250;
  drawBubble(Lo, top, clamp(pa * 2, 0, 1), 0.6 + 0.4 * pa); drawLines(Lo, top, clamp(pa * 2, 0, 1), 0.6 + 0.4 * pa, C.plum);
  pill(CX, top - 52, '🎤  TU TURNO', C.mango, C.plumD, 38, ph('turn', 0.4), 1);
  // optional support chips
  const ca = ph('chips', 0.6);
  if (ca > 0) {
    pill(CX, 1090, 'Puedes decir:', 'rgba(25,198,189,.95)', '#06322f', 32, ca, 1);
    const mk = s => { const ws = s.replace('.', '').split(' '); return layout([ws.map((x, j) => T(x + (j === ws.length - 1 ? '.' : ''), { ipa: IPA[x] }))], 54, ipaOn); };
    const A = mk('I agree.'), B = mk('I agree with you.'), gap = 30, pad = 38, tw = A.w + B.w + pad * 4 + gap, y = 1122, h = Math.max(A.h, B.h) + 30;
    let x = CX - tw / 2;
    [[A, 0], [B, 1]].forEach(([Ls, i]) => {
      const bw = Ls.w + pad * 2; ctx.save(); ctx.globalAlpha = ca; ctx.fillStyle = 'rgba(251,241,221,.96)'; rr(x, y, bw, h, 38); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(x + bw / 2 - CX, 0); drawLines(Ls, y - 64 + 4, ca, 1, C.plum); ctx.restore(); x += bw + gap;
    });
  }
  // calm countdown ring
  const r0 = since('ring');
  if (r0 >= 0) {
    const tot = 4, p = clamp(r0 / tot, 0, 1), a = clamp(r0 / 0.4, 0, 1) * (1 - ph('ringEnd', 0.4)), cx = 880, cy = 760, R = 78;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(36,10,51,.5)'; ctx.beginPath(); ctx.arc(cx, cy, R + 22, 0, 7); ctx.fill();
    ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(251,241,221,.22)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = C.mango; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (1 - p) * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.cream; ctx.font = `700 74px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(Math.max(0, Math.ceil(tot - r0))), cx, cy + 4);
    ctx.restore();
  }
}
function sceneWarm(t) {
  const ipaOn = ST.ccMode === 2, pa = ph('s5', 0.6, eBack);
  const Lo = layout([[T('I'), T('agree')], [T('with', { hl: true, hlA: 1 }), T('you.', { ipa: IPA.you, hl: true, hlA: 1 })]], 96, ipaOn), top = 250;
  const bounce = 1 + Math.sin(since('s5') * 6) * 0.012 * Math.max(0, 1 - since('s5') * 0.3);
  drawBubble(Lo, top, clamp(pa * 2, 0, 1), (0.6 + 0.4 * pa) * bounce); drawLines(Lo, top, clamp(pa * 2, 0, 1), (0.6 + 0.4 * pa) * bounce, C.plum);
  pill(CX, top - 50, '✓  MÁS CONFIANZA', C.mango, C.plumD, 38, clamp(pa * 2, 0, 1), 1);
  if (since('s5') > 0 && Math.random() < 0.18) burst(150 + Math.random() * 740, 1000 + Math.random() * 200, 2, [C.mango, C.cream, C.turq], 120, 1.2);
}
const logo = new Image(); if (window.LOGO_WHITE) logo.src = window.LOGO_WHITE;
function sceneCTA(t) {
  const a = ph('cta', 0.6), a2 = ph('cta', 0.9, x => x), lw = 700, lh = lw * 340 / 760;
  if (logo.complete && logo.naturalWidth) { ctx.save(); ctx.globalAlpha = a; ctx.drawImage(logo, CX - lw / 2, 300 + (1 - a) * 30, lw, lh); ctx.restore(); }
  else { ctx.fillStyle = C.cream; ctx.font = `700 120px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('Fluent English', CX, 420); }
  ctx.save(); ctx.globalAlpha = clamp((a2 - 0.25) * 2, 0, 1); ctx.fillStyle = C.cream; ctx.font = `700 64px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('Practica tu inglés', CX, 700); ctx.fillText('con nosotros.', CX, 776); ctx.restore();
  const b = ph('btn', 0.6, eBack);
  if (b > 0) {
    const pulse = 1 + Math.sin(t * 3) * 0.015; ctx.save(); ctx.translate(CX, 910); ctx.scale((0.6 + 0.4 * b) * pulse, (0.6 + 0.4 * b) * pulse); ctx.globalAlpha = clamp(b * 2, 0, 1);
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = C.mango; rr(-400, -74, 800, 148, 74); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.plumD; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 70px ${FONT}`; ctx.fillText('Escríbenos INGLÉS', 0, 6); ctx.restore();
  }
}

// ---------- captions
function drawCaption() {
  if (ST.ccMode === 0 || !ST.cap) return;
  const text = ST.cap, a = ph('capIn', 0.25); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `600 46px ${FONT}`;
  const maxW = 820, words = text.split(' '), lines = []; let cur = '';
  words.forEach(w => { const tst = cur ? cur + ' ' + w : w; if (ctx.measureText(tst).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tst; }); lines.push(cur);
  const lh = 60, h = lines.length * lh + 36, w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 70, y = 1475 - h;
  ctx.fillStyle = 'rgba(24,6,34,.82)'; rr(CX - w / 2, y, w, h, 34); ctx.fill();
  ctx.fillStyle = C.cream; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lines.forEach((l, i) => ctx.fillText(l, CX, y + 18 + lh * (i + 0.5))); ctx.restore();
}

// ---------- frame
let last = 0, tt = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts; if (!ST.paused) tt += dt;
  if (ST.running || ST.ended) Clock.tick(dt);
  // ease environment mood
  const calmT = (ST.scene === 'room4') ? 1 : 0, warmT = ST.scene === 'room5' ? 1 : 0;
  ST.calm = lerp(ST.calm, calmT, 1 - Math.exp(-dt * 2.2)); ST.warm = lerp(ST.warm, warmT, 1 - Math.exp(-dt * 2.2));
  Char.S.speaking = ST.enSpeaking && !ST.paused; Char.update(ST.paused ? 0 : dt, tt);
  render(dt); requestAnimationFrame(frame);
}
function render(dt) {
  const t = tt, tr = Clock.t - ST.sceneT, kind = bgKind(ST.scene), pk = bgKind(ST.prev);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  if (ST.trans === 'iris' && tr < 0.8 && kind !== pk) {
    drawBg(pk, t); const r = eIO(clamp(tr / 0.8, 0, 1)) * 1500; ctx.save(); ctx.beginPath(); ctx.arc(CX, 800, r, 0, 7); ctx.clip(); drawBg(kind, t); ctx.restore();
    ctx.strokeStyle = C.mango; ctx.lineWidth = 16; ctx.globalAlpha = 1 - tr / 0.8; ctx.beginPath(); ctx.arc(CX, 800, r, 0, 7); ctx.stroke(); ctx.strokeStyle = C.turq; ctx.beginPath(); ctx.arc(CX, 800, Math.max(0, r - 34), 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  } else if (tr < 0.5 && kind !== pk) { drawBg(pk, t); ctx.globalAlpha = tr / 0.5; drawBg(kind, t); ctx.globalAlpha = 1; }
  else drawBg(kind, t);
  Char.draw(ctx, t);
  if (ST.scene === 'plum') sceneHook(t); else if (ST.scene === 'room') sceneRoom1(t); else if (ST.scene === 'room4') sceneRoom4(t); else if (ST.scene === 'room5') sceneWarm(t); else if (ST.scene === 'cta') sceneCTA(t);
  drawParts(dt || 0.016);
  drawCaption();
  if (ST.safe && !ST.recording) { ctx.save(); ctx.strokeStyle = 'rgba(0,255,200,.8)'; ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.strokeRect(70, 230, 880, 1250); ctx.fillStyle = 'rgba(255,0,80,.12)'; ctx.fillRect(950, 0, 130, H); ctx.fillRect(0, 1500, W, 420); ctx.fillRect(0, 0, W, 230); ctx.restore(); }
}

// ---------- script / timeline
const w = s => Clock.wait(s);
async function narrate(cap, items, gap = 0.1) {
  ST.cap = cap; mark('capIn');
  for (const it of items) {
    if (it[0] === 'wait') await w(it[1]); else if (it[0] === 'fn') it[1]();
    else { await Speech.say(it[0], it[1], { onStart: () => { if (it[0] === 'en') ST.enSpeaking = true; }, onEnd: () => { if (it[0] === 'en') ST.enSpeaking = false; }, onBoundary: it[2] }); await w(gap); }
  }
  ST.cap = null;
}
async function runScript() {
  const id = ++ST.runId;
  resetAll(); ST.running = true; Aud.setSection('hook');
  try {
    // 0–3: hook
    setScene('plum', 'cut'); Char.set({ g: 'ready', f: 'confident' });
    await w(0.15); mark('bubble'); Aud.pop();
    await narrate('¿Dices “I’m agree”? Haz este pequeño cambio.', [
      ['es', '¿Dices'], ['en', 'I’m agree'],
      ['fn', () => { mark('freeze'); Char.S.frozen = true; Char.set({ g: 'hold', f: 'freeze' }); Aud.recordStop(); }], ['wait', 0.55],
      ['fn', () => { Aud.setSection('hook'); }], ['es', 'Haz este pequeño cambio.'],
    ], 0.05);
    // 3–8: correction
    mark('fix'); Char.S.frozen = false; Char.set({ g: 'pluck', f: 'confident' }); Aud.resumeMusic(); Aud.setSection('groove'); Aud.pull();
    Clock.after(0.5, () => { Aud.dissolve(); });
    Clock.after(0.85, () => { mark('land'); Aud.land(); burst(CX, 480, 26, [C.turq, C.mango, C.cream], 340, 1); Char.set({ g: 'show', f: 'happy' }); });
    await w(0.35);
    await narrate('En inglés, agree ya es un verbo.', [['fn', () => Clock.after(1.0, () => mark('verb'))], ['es', 'En inglés, agree ya es un verbo.']], 0.05);
    await narrate(null, [['en', 'I agree.']], 0.15);
    // 8–15: upgrade
    setScene('room', 'iris'); mark('bubble3'); Aud.swish(); Aud.pop(); Char.set({ g: 'chest', f: 'confident', y: 1060 });
    await w(0.45);
    await narrate('Y para decir “Estoy de acuerdo contigo”…', [['es', 'Y para decir “Estoy de acuerdo contigo”…']], 0.1);
    mark('withyou'); Char.set({ g: 'you' }); await w(0.3);
    await narrate(null, [['en', 'I agree with you.', e => { if (!ST.marks.hl && e.charIndex >= 8) mark('hl'); }]], 0.1);
    if (!ST.marks.hl) mark('hl');
    await w(0.15);
    // 15–23: speaking challenge
    setScene('room4', 'cut'); Aud.swish(0.3); mark('s4'); Char.set({ g: 'listen', f: 'neutral', s: 0.8, y: 970, x: 470 }); mark('turn');
    await w(0.4);
    await narrate(null, [['en', 'Learning English takes practice.']], 0.2);
    Char.set({ f: 'expect', nod: 0 });
    await narrate('¿Estás de acuerdo? Contesta en voz alta.', [['fn', () => Aud.setSection('pause')], ['es', '¿Estás de acuerdo? Contesta en voz alta.']], 0.1);
    mark('ring'); mark('chips'); ST.cap = null; Char.set({ f: 'expect' });
    await w(4.0); mark('ringEnd');
    // 23–27: reinforcement
    setScene('room5', 'cut'); mark('s5'); Aud.setSection('lift'); Aud.chord(); Aud.sparkle(); Aud.swish();
    Char.set({ g: 'confident', f: 'joy', s: 1, y: 1060, x: CX });
    await narrate('Una frase pequeña. Más confianza para hablar.', [['es', 'Una frase pequeña.'], ['es', 'Más confianza para hablar.']], 0.05);
    await w(0.1);
    // 27–30: CTA
    setScene('cta', 'fade'); mark('cta'); Aud.swish(); Aud.setSection('end'); Char.set({ g: 'point', f: 'happy', s: 0.62, y: 1330, x: CX });
    Clock.after(0.9, () => mark('btn'));
    await narrate('Escríbenos “inglés” y conoce nuestras clases en línea.', [['es', 'Escríbenos'], ['es', '“inglés” y conoce nuestras clases en línea.']], 0.04);
    Aud.finale(); burst(CX, 420, 30, [C.mango, C.cream, C.turq], 380, 1.2);
    await w(1.6);
    ST.tEnd = Clock.t; ST.ended = true; ST.running = false; Aud.setSection('off'); onEnded();
  } catch (e) { if (e !== ABORT) throw e; }
}
function resetAll() {
  Clock.reset(); Speech.cancel(); Aud.resetSpeaking(); Aud.stopAll(); ST.marks = {}; ST.cap = null; ST.ended = false; ST.enSpeaking = false; ST.paused = false; ST.calm = 0; ST.warm = 0; parts.length = 0;
  Object.assign(Char.S, { frozen: false }); Char.set({ g: 'ready', f: 'confident', x: CX, y: 960, s: 1, nod: 0, tilt: 0 }); ST.scene = ST.prev = 'plum'; ST.sceneT = -9;
  $('#pauseBtn').textContent = '⏸ Pause'; setStatus('Playing…');
}

// ---------- UI
function setStatus(s) { $('#status').textContent = s; }
function onEnded() { setStatus(`Finished. Actual running time on this device: ${ST.tEnd.toFixed(1)} s.`); $('#overlay').classList.remove('hide'); $('#overlay').classList.add('ended'); $('#startBtn').textContent = '↻ Replay'; if (ST.recording) stopRecording(); }
async function start() {
  Aud.init(); Aud.resume(); Speech.unlock(); $('#overlay').classList.add('hide'); $('#overlay').classList.remove('ended');
  try { await Promise.race([document.fonts.load(`700 40px Fredoka`), new Promise(r => setTimeout(r, 800))]); } catch (e) {}
  runScript();
}
$('#startBtn').onclick = () => { if (ST.recording) return; start(); };
$('#replayBtn').onclick = () => { if (ST.recording) return; start(); };
$('#pauseBtn').onclick = () => {
  if (!ST.running) return; ST.paused = !ST.paused; Clock.paused = ST.paused;
  if (ST.paused) { Speech.pause(); Aud.suspend(); $('#pauseBtn').textContent = '▶ Resume'; } else { Speech.resume(); Aud.resume(); $('#pauseBtn').textContent = '⏸ Pause'; }
};
$('#muteBtn').onclick = () => { const m = $('#muteBtn').dataset.m !== '1'; $('#muteBtn').dataset.m = m ? '1' : '0'; $('#muteBtn').textContent = m ? '🔇 Unmute' : '🔊 Mute'; Aud.setMuted(m); Speech.setMuted(m); };
const CC_NAMES = ['CC off', 'Captions', 'Captions + IPA'];
function paintCC() { document.querySelectorAll('#ccSeg button').forEach((b, i) => b.classList.toggle('on', i === ST.ccMode)); }
document.querySelectorAll('#ccSeg button').forEach((b, i) => b.onclick = () => { ST.ccMode = i; try { localStorage.setItem('fe_cc', i); } catch (e) {} paintCC(); });
$('#ccBtn').onclick = () => { ST.ccMode = (ST.ccMode + 1) % 3; try { localStorage.setItem('fe_cc', ST.ccMode); } catch (e) {} paintCC(); $('#ccBtn').textContent = '⌨ ' + CC_NAMES[ST.ccMode]; };
$('#safeBtn').onclick = () => { ST.safe = !ST.safe; $('#safeBtn').classList.toggle('on', ST.safe); };
paintCC(); $('#ccBtn').textContent = '⌨ ' + CC_NAMES[ST.ccMode];

function roleNote(k) {
  const v = Speech.sel[k], want = Speech.ROLE[k].gender, g = v ? Speech.gender(v) : '?';
  let n = Speech.quality(v);
  if (v && g === '?') n += ' Gender could not be detected from the name – listen with Test and pick a ' + (want === 'm' ? 'male' : 'female') + ' voice.';
  else if (v && g !== want) n += ' ⚠ This is a ' + (g === 'm' ? 'male' : 'female') + ' voice but this role needs a ' + (want === 'm' ? 'male' : 'female') + ' one.';
  return n;
}
function fillVoices() {
  ['es', 'en'].forEach(k => {
    const sel = $('#v_' + k); sel.innerHTML = '';
    Speech.lists[k].forEach(v => { const o = document.createElement('option'); o.value = v.voiceURI; o.textContent = `${v.name} (${v.lang}) · ${({ m: 'male', f: 'female', '?': 'gender unknown' })[Speech.gender(v)]}`; if (Speech.sel[k] === v) o.selected = true; sel.appendChild(o); });
    if (!Speech.lists[k].length) { const o = document.createElement('option'); o.textContent = 'No voice installed'; sel.appendChild(o); }
    $('#q_' + k).textContent = roleNote(k);
  });
  $('#speechNote').style.display = Speech.supported ? 'none' : 'block';
}
['es', 'en'].forEach(k => {
  $('#v_' + k).onchange = e => { Speech.choose(k, e.target.value); $('#q_' + k).textContent = roleNote(k); };
  $('#t_' + k).onclick = () => { if (ST.running) return; Aud.init(); Speech.cancel(); Speech.say(k, k === 'es' ? 'Estoy de acuerdo contigo.' : 'I agree with you.'); };
});
const spd = $('#speed'); spd.value = Speech.speed; $('#speedV').textContent = Speech.speed.toFixed(2) + '×';
spd.oninput = () => { Speech.setSpeed(+spd.value); $('#speedV').textContent = (+spd.value).toFixed(2) + '×'; };
Speech.onVoices = fillVoices; Speech.load(); fillVoices(); setTimeout(() => { Speech.load(); }, 600);

// copy helpers
document.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => { const el = $(b.dataset.copy); navigator.clipboard && navigator.clipboard.writeText(el.textContent).then(() => { const o = b.textContent; b.textContent = 'Copied ✓'; setTimeout(() => b.textContent = o, 1200); }); });

// ---------- video export (visuals + music + effects; browser speech cannot be captured)
let rec = null, chunks = [];
function stopRecording() { setTimeout(() => { if (rec && rec.state !== 'inactive') rec.stop(); }, 500); }
$('#recBtn').onclick = async () => {
  if (ST.recording || !cv.captureStream || !window.MediaRecorder) { setStatus('This browser cannot record a canvas (MediaRecorder / captureStream missing).'); return; }
  Aud.init(); Aud.resume(); Speech.unlock();
  const vs = cv.captureStream(30), as = Aud.stream(); if (as) as.getAudioTracks().forEach(t => vs.addTrack(t));
  const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']; const mime = types.find(t => MediaRecorder.isTypeSupported(t));
  rec = new MediaRecorder(vs, { mimeType: mime, videoBitsPerSecond: 8e6, audioBitsPerSecond: 192e3 }); chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.onstop = () => { ST.recording = false; const blob = new Blob(chunks, { type: 'video/webm' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `fluent-english-i-agree_music-fx-only_cc${ST.ccMode}.webm`; a.click(); setStatus(`Exported ${(blob.size / 1e6).toFixed(1)} MB WebM: picture + music + effects. Narration is NOT in this file (see notes).`); window.__lastBlob = blob; $('#recBtn').disabled = false; };
  ST.recording = true; $('#recBtn').disabled = true; $('#overlay').classList.add('hide'); rec.start(250); setStatus('Recording… (narration plays through speakers but is not captured)'); runScript();
};

window.__fe = { ST, Clock, Char, Aud, Speech };
requestAnimationFrame(frame);
