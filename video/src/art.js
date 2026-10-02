/* ===== illustration toolkit: helpers, props and the character ===== */
const SERIF = '"Fraunces","Source Serif 4","Noto Serif","DejaVu Serif",Georgia,serif';
const SANS = '"Nunito","Noto Sans","DejaVu Sans","Segoe UI",Arial,sans-serif';
const IPAF = '"Noto Sans","Charis SIL","DejaVu Sans","Segoe UI",Arial,sans-serif';

function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function glow(c, x, y, r, col, a = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(col, a)); g.addColorStop(1, hexA(col, 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function shade(hex, amt) { // amt -1..1
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = amt < 0 ? 0 : 255, p = Math.abs(amt); r = Math.round(r + (f - r) * p); g = Math.round(g + (f - g) * p); b = Math.round(b + (f - b) * p);
  return `rgb(${r},${g},${b})`;
}
function lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
function withShadow(c, col, blur, ox, oy, fn) { c.save(); c.shadowColor = col; c.shadowBlur = blur; c.shadowOffsetX = ox; c.shadowOffsetY = oy; fn(); c.restore(); }
function txt(c, s, x, y, o = {}) {
  c.save(); c.font = `${o.weight || 800} ${o.size || 60}px ${o.family || SERIF}`; c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'alphabetic';
  if (o.ls) { try { c.letterSpacing = o.ls + 'px'; } catch (e) { } }
  if (o.shadow) { c.shadowColor = o.shadow[0]; c.shadowBlur = o.shadow[1]; c.shadowOffsetY = o.shadow[2] || 0; }
  if (o.stroke) { c.lineWidth = o.stroke[1]; c.strokeStyle = o.stroke[0]; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  c.fillStyle = o.fill || PAL.ivory; if (o.alpha != null) c.globalAlpha *= o.alpha; c.fillText(s, x, y); c.restore();
}
function tw(c, s, size, weight, family) { c.save(); c.font = `${weight} ${size}px ${family}`; const w = c.measureText(s).width; c.restore(); return w; }

/* -------- sentence with optional IPA, word-aligned. Returns layout so highlights can be drawn. -------- */
function layoutSentence(c, words, ipas, size, ipaSize, maxW, showIpa, family = SERIF) {
  const gap = size * 0.28, lines = [[]], lineW = [0];
  const items = words.map((w, i) => {
    const ww = tw(c, w, size, 800, family), iw = showIpa && ipas ? tw(c, ipas[i], ipaSize, 600, IPAF) : 0;
    return { w, ipa: ipas ? ipas[i] : null, ww, iw, bw: Math.max(ww, iw) };
  });
  items.forEach(it => {
    let L = lines.length - 1;
    const add = (lines[L].length ? gap : 0) + it.bw;
    if (lineW[L] + add > maxW && lines[L].length) { lines.push([]); lineW.push(0); L++; }
    it.x = lineW[L] + (lines[L].length ? gap : 0); lines[L].push(it); lineW[L] = it.x + it.bw;
  });
  return { lines, lineW, size, ipaSize, lh: size * 1.12 + (showIpa ? ipaSize * 1.25 : 0), showIpa, family };
}
/* draws the layout centered at cx with first baseline y; hl = {wordIndex: color}; returns rects of words */
function drawSentence(c, L, cx, y, o = {}) {
  const rects = [];
  L.lines.forEach((ln, li) => {
    const x0 = cx - L.lineW[li] / 2, by = y + li * L.lh;
    ln.forEach(it => {
      const cxw = x0 + it.x + it.bw / 2, a = o.revealWords != null ? clamp(o.revealWords - it.idx) : 1;
      const col = (o.hl && o.hl[it.idx]) || o.fill || PAL.ivory;
      const lift = (1 - E.out(a)) * 18;
      txt(c, it.w, cxw, by + lift, { size: L.size, family: L.family, fill: col, alpha: a * (o.alpha ?? 1), shadow: o.shadow === false ? null : ['rgba(0,0,0,.35)', 14, 4] });
      if (L.showIpa && it.ipa) txt(c, it.ipa, cxw, by + L.size * 0.2 + L.ipaSize * 1.08 + lift, { size: L.ipaSize, weight: 600, family: IPAF, fill: o.ipaFill || PAL.mintLight, alpha: a * (o.alpha ?? 1) * 0.95 });
      rects[it.idx] = { x: cxw - it.ww / 2, w: it.ww, y: by, size: L.size };
    });
  });
  return rects;
}
function indexLayout(L) { let i = 0; L.lines.forEach(l => l.forEach(it => it.idx = i++)); return L; }

/* soft moving underline: draws in, then gently shimmers */
function softUnderline(c, r, p, t, col) {
  if (p <= 0) return; const y = r.y + r.size * 0.16, w = r.w * E.out(p), x = r.x - 6, h = Math.max(8, r.size * 0.09);
  c.save(); const g = c.createLinearGradient(x, 0, x + r.w + 12, 0), sh = (t * 0.45) % 1;
  g.addColorStop(0, hexA(col, .55)); g.addColorStop(clamp(sh - .15), hexA(col, .75)); g.addColorStop(clamp(sh), '#ffffffcc'); g.addColorStop(clamp(sh + .15), hexA(col, .75)); g.addColorStop(1, hexA(col, .55));
  c.fillStyle = g; c.shadowColor = hexA(col, .6); c.shadowBlur = 16;
  const wob = Math.sin(t * 2.2) * 1.6; rr(c, x, y + wob, Math.max(h, w + 12), h, h / 2); c.fill(); c.restore();
}

/* ---------------- backgrounds ---------------- */
function bgBase(c, W, H, t, tint = 0) {
  c.fillStyle = lin(c, 0, 0, 0, H, [[0, '#0E2A55'], [.55, PAL.navy], [1, PAL.navyDeep]]); c.fillRect(0, 0, W, H);
  glow(c, 760 + Math.sin(t * .3) * 40, 420, 760, tint ? PAL.mint : PAL.tang, 0.13);
  glow(c, 220, 1280 + Math.cos(t * .27) * 40, 700, tint ? PAL.tang : PAL.mint, 0.08);
  for (let i = 0; i < 26; i++) { // slow bokeh
    const sx = (i * 193.7) % W, sy = (i * 331.3) % H, r = 6 + (i % 5) * 5, dr = Math.sin(t * .25 + i) * 18;
    c.fillStyle = hexA(i % 3 ? PAL.ivory : (i % 2 ? PAL.tang : PAL.mint), .05 + (i % 4) * .015);
    c.beginPath(); c.arc((sx + dr + W) % W, (sy - t * (6 + i % 5) % H + H) % H, r, 0, 7); c.fill();
  }
}
function vignette(c, W, H) {
  const g = c.createRadialGradient(W / 2, H * .5, H * .3, W / 2, H * .5, H * .78); g.addColorStop(0, '#0000'); g.addColorStop(1, 'rgba(2,6,16,.55)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

/* ---------------- props ---------------- */
function drawCalendar(c, x, y, o = {}) {
  const w = 520, h = 600, s = o.s ?? 1, rot = o.rot ?? 0;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale((o.sx ?? 1) * s, s);
  withShadow(c, 'rgba(0,0,0,.45)', 50, 0, 30, () => { rr(c, -w / 2, -h / 2, w, h, 36); c.fillStyle = PAL.ivoryShade; c.fill(); });
  // back page (next day) always present
  rr(c, -w / 2, -h / 2, w, h, 36); c.fillStyle = lin(c, 0, -h / 2, 0, h / 2, [[0, '#F7EBD2'], [1, '#E9D9B8']]); c.fill();
  c.save(); rr(c, -w / 2, -h / 2, w, h, 36); c.clip();
  c.fillStyle = PAL.tang; c.fillRect(-w / 2, -h / 2, w, 120);
  txt(c, o.month2 || 'OCTUBRE', 0, -h / 2 + 76, { size: 52, weight: 800, family: SANS, fill: PAL.ivory, ls: 6 });
  txt(c, o.day2 || '16', 0, 90, { size: 300, fill: PAL.navy, weight: 900 });
  c.restore();
  // top page flipping around the hinge at the top edge
  const flip = clamp(o.flip ?? 0), th = flip * Math.PI, cs = Math.cos(th);
  if (flip < 1) {
    c.save(); c.translate(0, -h / 2 + 4); c.scale(1, cs); c.translate(0, h / 2 - 4);
    const back = cs < 0;
    rr(c, -w / 2, -h / 2, w, h, 36);
    c.fillStyle = back ? lin(c, 0, -h / 2, 0, h / 2, [[0, '#E3D2AE'], [1, '#F2E4C4']]) : lin(c, 0, -h / 2, 0, h / 2, [[0, '#FFFAEE'], [1, PAL.ivory]]); c.fill();
    if (!back) {
      c.save(); rr(c, -w / 2, -h / 2, w, h, 36); c.clip();
      c.fillStyle = lin(c, 0, -h / 2, 0, -h / 2 + 120, [[0, PAL.tang], [1, PAL.tangDeep]]); c.fillRect(-w / 2, -h / 2, w, 120);
      txt(c, o.month || 'OCTUBRE', 0, -h / 2 + 76, { size: 52, weight: 800, family: SANS, fill: PAL.ivory, ls: 6 });
      txt(c, o.day || '15', 0, 90, { size: 300, fill: PAL.navy, weight: 900 });
      rr(c, -88, 140, 176, 52, 26); c.fillStyle = hexA(PAL.mint, .9); c.fill();
      txt(c, 'HOY', 0, 178, { size: 32, weight: 800, family: SANS, fill: PAL.navyDeep, ls: 5 });
      c.restore();
    }
    // shading while turning
    c.fillStyle = `rgba(20,10,0,${.25 * Math.sin(th)})`; rr(c, -w / 2, -h / 2, w, h, 36); c.fill();
    c.restore();
  }
  // binder rings
  for (const rx of [-130, 130]) {
    c.fillStyle = lin(c, rx - 14, 0, rx + 14, 0, [[0, '#9FB0C8'], [.5, '#F4F8FF'], [1, '#7C8EA8']]);
    rr(c, rx - 13, -h / 2 - 34, 26, 78, 13); c.fill();
    c.fillStyle = '#0006'; c.beginPath(); c.ellipse(rx, -h / 2 + 14, 9, 7, 0, 0, 7); c.fill();
  }
  c.restore();
}

function drawTag(c, x, y, text, o = {}) { // "ACTUALLY" paper label
  const w = tw(c, text, 78, 900, SERIF) + 96, h = 130, s = o.s ?? 1;
  c.save(); c.translate(x, y); c.rotate(o.rot ?? 0); c.scale(s * (o.sx ?? 1), s * (o.sy ?? 1));
  withShadow(c, 'rgba(0,0,0,.4)', 28, 0, 16, () => { rr(c, -w / 2, -h / 2, w, h, 30); c.fillStyle = lin(c, 0, -h / 2, 0, h / 2, [[0, PAL.tangLight], [.15, PAL.tang], [1, PAL.tangDeep]]); c.fill(); });
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; rr(c, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 24); c.stroke();
  txt(c, text, 0, 28, { size: 78, fill: PAL.ivory, weight: 900, shadow: ['rgba(120,40,0,.5)', 0, 4] });
  c.restore(); return w;
}

function drawSaucer(c, x, y, s = 1, col = PAL.ivory) {
  c.save(); c.translate(x, y); c.scale(s, s);
  withShadow(c, 'rgba(0,0,0,.4)', 24, 0, 14, () => { c.beginPath(); c.ellipse(0, 6, 150, 36, 0, 0, 7); c.fillStyle = shade(col, -.25); c.fill(); });
  c.beginPath(); c.ellipse(0, 0, 150, 36, 0, 0, 7); c.fillStyle = lin(c, -150, 0, 150, 0, [[0, shade(col, -.12)], [.4, col], [1, shade(col, -.2)]]); c.fill();
  c.beginPath(); c.ellipse(0, -2, 98, 20, 0, 0, 7); c.fillStyle = shade(col, -.14); c.fill();
  c.restore();
}
/* cup origin = center of the rim ellipse. handle on +x side. */
function drawCup(c, x, y, o = {}) {
  const s = o.s ?? 1, kind = o.kind || 'tea', body = kind === 'tea' ? PAL.mint : PAL.tang, liquid = kind === 'tea' ? '#C98A3C' : '#3B2114', t = o.t ?? 0;
  c.save(); c.translate(x, y); c.rotate(o.rot ?? 0); c.scale(s * (o.sx ?? 1), s * (o.sy ?? 1));
  // handle
  c.lineCap = 'round'; c.strokeStyle = shade(body, -.25); c.lineWidth = 24; c.beginPath(); c.moveTo(78, 24); c.bezierCurveTo(150, 8, 158, 86, 70, 90); c.stroke();
  c.strokeStyle = body; c.lineWidth = 17; c.beginPath(); c.moveTo(78, 24); c.bezierCurveTo(150, 8, 158, 86, 70, 90); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(92, 20); c.bezierCurveTo(140, 12, 148, 64, 112, 80); c.stroke();
  // body
  c.beginPath(); c.moveTo(-98, 0); c.bezierCurveTo(-98, 80, -66, 118, 0, 120); c.bezierCurveTo(66, 118, 98, 80, 98, 0); c.closePath();
  c.fillStyle = lin(c, -98, 0, 98, 0, [[0, shade(body, -.3)], [.25, body], [.6, shade(body, .1)], [1, shade(body, -.38)]]); c.fill();
  c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.24)'; c.beginPath(); c.ellipse(-52, 52, 14, 46, .25, 0, 7); c.fill();
  c.fillStyle = hexA(PAL.ivory, .85); c.fillRect(-100, 62, 200, 12); // decorative band
  c.restore();
  // rim + liquid
  c.beginPath(); c.ellipse(0, 0, 98, 26, 0, 0, 7); c.fillStyle = PAL.ivory; c.fill();
  c.beginPath(); c.ellipse(0, 3, 86, 20, 0, 0, 7); c.fillStyle = liquid; c.fill();
  c.beginPath(); c.ellipse(-20, 1, 34, 7, 0, 0, 7); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill();
  if (kind === 'tea') { // tea-bag string + tag
    c.strokeStyle = PAL.ivory; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, 4); c.quadraticCurveTo(-60, 6, -88, 30); c.stroke();
    c.save(); c.translate(-90, 36); c.rotate(-.2); rr(c, -14, 0, 28, 38, 5); c.fillStyle = PAL.tang; c.fill(); c.restore();
  }
  // steam
  if (o.steam !== false) for (let i = 0; i < 3; i++) {
    c.strokeStyle = `rgba(255,246,229,${.2 + .08 * Math.sin(t * 2 + i)})`; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath();
    const bx = -34 + i * 34, ph = t * 1.6 + i * 1.7; c.moveTo(bx, -8);
    for (let k = 1; k <= 5; k++) c.lineTo(bx + Math.sin(ph + k * .9) * 14, -8 - k * 24);
    c.stroke();
  }
  c.restore();
}

function drawPlant(c, x, y, t, s = 1) { // pot + pothos-like leaves with gentle sway
  c.save(); c.translate(x, y); c.scale(s, s);
  const leaves = [[-70, -150, -.8], [-30, -230, -.35], [20, -270, .05], [70, -220, .45], [100, -140, .85], [0, -170, .15], [-100, -90, -1.1], [115, -70, 1.1]];
  leaves.forEach(([lx, ly, a], i) => {
    const sw = Math.sin(t * 1.1 + i) * .05; c.save(); c.translate(lx * .25, -30); c.rotate(sw);
    c.strokeStyle = PAL.mintDeep; c.lineWidth = 7; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(lx * .4, ly * .5, lx, ly); c.stroke();
    c.translate(lx, ly); c.rotate(a + sw * 2);
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-46, -20, -40, -86, 0, -108); c.bezierCurveTo(40, -86, 46, -20, 0, 0);
    c.fillStyle = lin(c, -40, 0, 40, -100, [[0, i % 2 ? '#2FA886' : '#3DBE98'], [1, '#8FE8C8']]); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, -92); c.stroke(); c.restore();
  });
  c.beginPath(); c.moveTo(-80, -40); c.lineTo(80, -40); c.lineTo(62, 80); c.lineTo(-62, 80); c.closePath();
  c.fillStyle = lin(c, -80, 0, 80, 0, [[0, PAL.tangDeep], [.5, PAL.tang], [1, '#B8500F']]); c.fill();
  rr(c, -88, -52, 176, 28, 12); c.fillStyle = PAL.tangLight; c.fill();
  c.restore();
}

/* ---------------- the character ---------------- */
function ik3(S, W, L1, L2, pole) {
  const dx = W[0] - S[0], dy = W[1] - S[1], dz = W[2] - S[2];
  let d = Math.hypot(dx, dy, dz); const dmax = (L1 + L2) * 0.995; let Wc = W;
  if (d > dmax) { const k = dmax / d; Wc = [S[0] + dx * k, S[1] + dy * k, S[2] + dz * k]; d = dmax; }
  const u = [(Wc[0] - S[0]) / d, (Wc[1] - S[1]) / d, (Wc[2] - S[2]) / d];
  const a = (d * d + L1 * L1 - L2 * L2) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pd = pole[0] * u[0] + pole[1] * u[1] + pole[2] * u[2];
  let pr = [pole[0] - u[0] * pd, pole[1] - u[1] * pd, pole[2] - u[2] * pd]; const pl = Math.hypot(...pr) || 1; pr = pr.map(v => v / pl);
  return { E: [S[0] + u[0] * a + pr[0] * h, S[1] + u[1] * a + pr[1] * h, S[2] + u[2] * a + pr[2] * h], W: Wc };
}
function capsule(c, p0, p1, w0, w1, fill) {
  const a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) + Math.PI / 2, nx = Math.cos(a), ny = Math.sin(a);
  c.fillStyle = fill; c.beginPath();
  c.moveTo(p0[0] + nx * w0 / 2, p0[1] + ny * w0 / 2); c.lineTo(p1[0] + nx * w1 / 2, p1[1] + ny * w1 / 2);
  c.lineTo(p1[0] - nx * w1 / 2, p1[1] - ny * w1 / 2); c.lineTo(p0[0] - nx * w0 / 2, p0[1] - ny * w0 / 2); c.closePath(); c.fill();
  c.beginPath(); c.arc(p0[0], p0[1], w0 / 2, 0, 7); c.fill(); c.beginPath(); c.arc(p1[0], p1[1], w1 / 2, 0, 7); c.fill();
}

/* Five-finger hand. Origin = wrist, local +x runs along the hand toward the fingertips.
   ts: side of the thumb (-1/+1 in local y), bd: curl direction, curl: [thumb,index,middle,ring,pinky] 0..1 */
function drawHand(c, wx, wy, ang, o = {}) {
  const ts = o.ts ?? -1, bd = o.bd ?? -ts, curl = o.curl || [.2, .2, .2, .2, .2], sp = o.spread ?? .07, s = o.s ?? 1;
  const FL = [[32, 24, 20], [34, 25, 21], [31, 23, 19], [25, 18, 16]];   // index, middle, ring, pinky segment lengths
  const FW = [17, 17.5, 16.5, 14.5], CURLMAX = [1.25, 1.35, 1.3, 1.3];
  const palmL = 86, palmW = 74;
  const pose = (pass) => {
    const col = pass === 0 ? PAL.skinShade : PAL.skin, grow = pass === 0 ? 4.5 : 0;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col;
    // thumb (two phalanges + metacarpal bulge)
    const tc = curl[0], t0 = [20, ts * (palmW / 2 - 6)], ta = ts * (.62 - tc * .12) + 0; // thumb base direction (outward)
    const a1 = ta * 1 + (-bd) * tc * .55 * 0, a2 = a1 - ts * 0 + (-ts) * tc * .9 * 1;
    const t1 = [t0[0] + Math.cos(a1 * 0 + ts * .75 - ts * tc * .55) * 30, t0[1] + Math.sin(ts * .75 - ts * tc * .55) * 30];
    const t2 = [t1[0] + Math.cos(ts * .35 - ts * tc * 1.25) * 28, t1[1] + Math.sin(ts * .35 - ts * tc * 1.25) * 28];
    c.lineWidth = 22 + grow; c.beginPath(); c.moveTo(t0[0], t0[1]); c.lineTo(t1[0], t1[1]); c.stroke();
    c.lineWidth = 19 + grow; c.beginPath(); c.moveTo(t1[0], t1[1]); c.lineTo(t2[0], t2[1]); c.stroke();
    // palm
    c.fillStyle = col; c.strokeStyle = col; c.lineWidth = grow;
    c.beginPath(); c.moveTo(-4, -20); c.bezierCurveTo(14, -palmW / 2 - 2, 30, -palmW / 2, palmL - 8, -palmW / 2 + 4);
    c.quadraticCurveTo(palmL + 2, -palmW / 2 + 6, palmL + 2, -palmW / 2 + 16); c.lineTo(palmL + 2, palmW / 2 - 16);
    c.quadraticCurveTo(palmL + 2, palmW / 2 - 6, palmL - 8, palmW / 2 - 4); c.bezierCurveTo(30, palmW / 2, 14, palmW / 2 + 2, -4, 20); c.closePath();
    c.fill(); if (grow) c.stroke();
    // fingers
    for (let i = 0; i < 4; i++) {
      const y0 = ts * (27 - 18 * i), cv = curl[i + 1] * CURLMAX[i];
      let px = palmL - 2, py = y0, a = ts * sp * (i - 1.5) * -1 * 2 + (ts * -0.0);
      a = (i - 1.5) * ts * -sp;        // fan the fingers a little so each one reads clearly
      c.lineWidth = FW[i] + grow; c.beginPath(); c.moveTo(px, py);
      const pts = [[px, py]];
      for (let k = 0; k < 3; k++) {
        a += bd * cv * [.55, .75, .55][k] * (k === 0 ? 1 : 1);
        px += Math.cos(a) * FL[i][k]; py += Math.sin(a) * FL[i][k]; c.lineTo(px, py); pts.push([px, py]);
      }
      c.stroke();
    }
  };
  c.save(); c.translate(wx, wy); c.rotate(ang); c.scale(s, s); pose(0); pose(1);
  // knuckle highlights + nail hints
  c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(palmL * .55, 0, 26, 18, 0, 0, 7); c.fill();
  c.restore();
}

/* local coordinates: origin = base of the neck, +y down, +x to viewer's right, +z toward viewer */
function drawMan(c, o) {
  const t = o.t ?? 0, s = o.s ?? 1, SH = { L: [-172, 64, 0], R: [172, 64, 0] };
  const breath = Math.sin(t * 1.7) * 3, blinkPh = (t % 3.4), blink = o.blink ?? (blinkPh > 3.25 ? Math.sin((blinkPh - 3.25) / 0.15 * Math.PI) : 0);
  const prj = p => [p[0] * (1 + p[2] * .0006), p[1] * (1 + p[2] * .0006) - p[2] * .02];
  c.save(); c.translate(o.x, o.y); c.scale(s, s);
  const sleeve = o.sleeve || PAL.tang, sleeveD = shade(sleeve, -.28);

  const body = () => {
    // torso
    c.save(); c.translate(0, 0); c.scale(1, 1 + breath * .0015);
    c.beginPath(); c.moveTo(-96, 18); c.bezierCurveTo(-150, 28, -200, 48, -216, 130); c.lineTo(-232, 520); c.lineTo(232, 520); c.lineTo(216, 130);
    c.bezierCurveTo(200, 48, 150, 28, 96, 18); c.closePath();
    c.fillStyle = lin(c, -250, 0, 250, 0, [[0, shade(sleeve, -.25)], [.3, sleeve], [.65, shade(sleeve, .05)], [1, shade(sleeve, -.4)]]); c.fill();
    c.save(); c.clip(); // knit folds + light
    c.strokeStyle = 'rgba(120,40,0,.18)'; c.lineWidth = 7; c.lineCap = 'round';
    [[-110, 160, -80, 420], [60, 190, 90, 430], [-30, 250, -20, 480]].forEach(f => { c.beginPath(); c.moveTo(f[0], f[1]); c.quadraticCurveTo(f[0] + 18, (f[1] + f[3]) / 2, f[2], f[3]); c.stroke(); });
    glow(c, -90, 140, 220, '#FFFFFF', .14); c.restore();
    c.restore();
    // neck
    c.beginPath(); c.moveTo(-44, -52); c.lineTo(-48, 14); c.quadraticCurveTo(0, 64, 48, 14); c.lineTo(44, -52); c.closePath();
    c.fillStyle = lin(c, -48, 0, 48, 0, [[0, PAL.skinShade], [.35, PAL.skin], [1, shade(PAL.skinShade, -.1)]]); c.fill();
    c.fillStyle = 'rgba(80,30,10,.28)'; c.beginPath(); c.ellipse(0, -30, 52, 24, 0, 0, Math.PI); c.fill(); // chin shadow
    c.strokeStyle = 'rgba(90,40,20,.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, 4); c.quadraticCurveTo(0, 12, 10, 4); c.stroke();
    // crew-neck rib collar
    c.beginPath(); c.moveTo(-70, 8); c.quadraticCurveTo(0, 86, 70, 8); c.quadraticCurveTo(0, 42, -70, 8); c.fillStyle = sleeveD; c.fill();
    c.strokeStyle = 'rgba(255,200,140,.4)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-64, 12); c.quadraticCurveTo(0, 78, 64, 12); c.stroke();
    // head
    head();
  };

  const head = () => {
    const look = o.look || [0, 0], mouth = o.mouth || 0, smile = o.smile ?? .5, brow = o.brow || 0;
    c.save(); c.translate(0, -150 + breath * .5); c.rotate(o.tilt || 0); c.translate((o.hx || 0), 0);
    // ears
    for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 88, 6, 14, 28, 0, 0, 7); c.fillStyle = PAL.skinShade; c.fill(); c.beginPath(); c.ellipse(sd * 88, 8, 7, 17, 0, 0, 7); c.fillStyle = shade(PAL.skinShade, -.2); c.fill(); }
    const face = () => { c.beginPath(); c.moveTo(-88, -26); c.bezierCurveTo(-90, -112, -52, -138, 0, -138); c.bezierCurveTo(52, -138, 90, -112, 88, -26);
      c.bezierCurveTo(88, 38, 76, 90, 44, 114); c.bezierCurveTo(24, 128, -24, 128, -44, 114); c.bezierCurveTo(-76, 90, -88, 38, -88, -26); c.closePath(); };
    face(); c.fillStyle = lin(c, -90, -40, 90, 80, [[0, PAL.skinLight], [.5, PAL.skin], [1, shade(PAL.skinShade, -.05)]]); c.fill();
    c.save(); face(); c.clip();
    // jaw / beard stubble
    c.beginPath(); c.moveTo(-92, -4); c.bezierCurveTo(-84, 26, -62, 40, -44, 48); c.bezierCurveTo(-26, 60, 26, 60, 44, 48); c.bezierCurveTo(62, 40, 84, 26, 92, -4); c.lineTo(100, 140); c.lineTo(-100, 140); c.closePath();
    c.fillStyle = 'rgba(42,26,18,.42)'; c.fill();
    c.fillStyle = 'rgba(42,26,18,.22)'; c.beginPath(); c.ellipse(0, 40, 70, 22, 0, 0, 7); c.fill();
    glow(c, 40, 20, 90, '#7A3A1A', .12); c.restore();
    // hair
    c.beginPath(); c.moveTo(-94, -20); c.bezierCurveTo(-104, -100, -80, -162, -10, -170); c.bezierCurveTo(60, -176, 112, -130, 94, -20);
    c.bezierCurveTo(92, -62, 80, -86, 62, -96); c.bezierCurveTo(20, -108, -30, -92, -66, -66); c.bezierCurveTo(-82, -52, -88, -36, -94, -20); c.closePath();
    c.fillStyle = lin(c, -90, -160, 90, -60, [[0, '#4A2F22'], [.5, PAL.hair], [1, '#1a100b']]); c.fill();
    c.strokeStyle = 'rgba(255,220,180,.18)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-60, -130); c.quadraticCurveTo(0, -158, 60, -128); c.stroke();
    // brows
    const by = -52 - brow * 8;
    for (const sd of [-1, 1]) { c.save(); c.translate(sd * 40, by - (sd > 0 ? brow * 3 : 0)); c.rotate(sd * (.08 - brow * .12)); c.beginPath(); c.moveTo(-26, 6); c.quadraticCurveTo(0, -9, 26, 1); c.strokeStyle = '#2a1a12'; c.lineWidth = 10; c.lineCap = 'round'; c.stroke(); c.restore(); }
    // eyes
    for (const sd of [-1, 1]) {
      const ex = sd * 40, ey = -14, op = 1 - blink * .96 - (smile > .8 ? .1 : 0);
      c.save(); c.translate(ex, ey); c.beginPath(); c.ellipse(0, 0, 19, 14 * op, 0, 0, 7); c.fillStyle = '#FFFDF7'; c.fill(); c.clip();
      c.beginPath(); c.arc(look[0] * 7, look[1] * 4 + 1, 9.5, 0, 7); c.fillStyle = '#4b2f1f'; c.fill();
      c.beginPath(); c.arc(look[0] * 7, look[1] * 4 + 1, 4.8, 0, 7); c.fillStyle = '#120a06'; c.fill();
      c.beginPath(); c.arc(look[0] * 7 + 3.4, look[1] * 4 - 3, 2.6, 0, 7); c.fillStyle = '#fff'; c.fill(); c.restore();
      c.strokeStyle = '#2a1a12'; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.ellipse(ex, ey, 19, 14 * op, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
      c.strokeStyle = 'rgba(120,60,30,.35)'; c.lineWidth = 3; c.beginPath(); c.ellipse(ex, ey + 2, 20, 16 * op + 2, 0, .2, Math.PI - .2); c.stroke();
    }
    // nose
    c.strokeStyle = 'rgba(120,60,30,.35)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, -18); c.quadraticCurveTo(-12, 12, -18, 26); c.stroke();
    c.beginPath(); c.moveTo(-22, 32); c.quadraticCurveTo(0, 46, 22, 32); c.strokeStyle = 'rgba(110,50,25,.55)'; c.lineWidth = 5; c.stroke();
    c.beginPath(); c.ellipse(6, 14, 10, 15, .15, 0, 7); c.fillStyle = 'rgba(255,235,210,.28)'; c.fill();
    // mustache + mouth
    const mw = 30 + smile * 8, my = 76, op = mouth * 26;
    c.beginPath(); c.moveTo(-46, 62); c.quadraticCurveTo(-24, 50, 0, 56); c.quadraticCurveTo(24, 50, 46, 62); c.quadraticCurveTo(26, 70, 0, 64); c.quadraticCurveTo(-26, 70, -46, 62); c.fillStyle = 'rgba(30,18,12,.85)'; c.fill();
    c.save(); c.translate(0, my);
    if (op > 1.5 || smile > .35) {
      c.beginPath(); c.moveTo(-mw, -smile * 6 + 0); c.quadraticCurveTo(0, -4 + op * .3, mw, -smile * 6);
      c.quadraticCurveTo(mw * .7, 10 + smile * 14 + op, 0, 12 + smile * 10 + op * 1.15); c.quadraticCurveTo(-mw * .7, 10 + smile * 14 + op, -mw, -smile * 6); c.closePath();
      c.fillStyle = '#4A1414'; c.fill(); c.save(); c.clip();
      c.fillStyle = '#FFFDF6'; c.fillRect(-mw, -8, mw * 2, 8 + Math.min(op, 13)); // teeth
      c.fillStyle = '#B5524F'; c.beginPath(); c.ellipse(0, 12 + op, 17, 9, 0, 0, 7); c.fill(); c.restore();
      c.strokeStyle = '#8E3B33'; c.lineWidth = 4; c.stroke();
    } else { c.strokeStyle = '#8E3B33'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(0, 6, 26, 0); c.stroke(); }
    c.restore();
    c.restore();
  };

  const arms = () => {
    ['L', 'R'].forEach(sd => {
      const a = (o.arms && o.arms[sd]) || { w: [sd === 'L' ? -150 : 150, 420, 180], ang: Math.PI / 2, curl: [.2, .2, .2, .2, .2] };
      const S = SH[sd], pole = a.pole || [sd === 'L' ? -.25 : .25, 1, -.25];
      const r = ik3(S, a.w, 250, 205, pole), S2 = prj(S), E2 = prj(r.E), W2 = prj(r.W);
      // forearm (skin)
      capsule(c, E2, W2, 56, 38, lin(c, E2[0] - 28, 0, E2[0] + 28, 0, [[0, PAL.skinShade], [.4, PAL.skin], [1, shade(PAL.skinShade, -.1)]]));
      // sleeve pushed up to the elbow
      capsule(c, S2, E2, 98, 80, lin(c, S2[0] - 49, 0, S2[0] + 49, 0, [[0, shade(sleeve, -.25)], [.45, sleeve], [1, shade(sleeve, -.35)]]));
      c.beginPath(); c.arc(S2[0], S2[1], 49, 0, 7); c.fillStyle = sleeve; c.fill();
      const ea = Math.atan2(W2[1] - E2[1], W2[0] - E2[0]);
      c.save(); c.translate(E2[0], E2[1]); c.rotate(ea); rr(c, -22, -44, 46, 88, 18); c.fillStyle = sleeveD; c.fill(); c.strokeStyle = 'rgba(255,190,120,.35)'; c.lineWidth = 3;
      [-8, 6].forEach(x => { c.beginPath(); c.moveTo(x, -38); c.lineTo(x, 38); c.stroke(); }); c.restore();
      if (sd === 'L') { // wristwatch
        c.save(); c.translate(W2[0], W2[1]); c.rotate(ea); rr(c, -28, -22, 18, 44, 6); c.fillStyle = PAL.mintDeep; c.fill(); rr(c, -34, -17, 14, 34, 5); c.fillStyle = PAL.navy; c.fill(); c.fillStyle = PAL.mintLight; c.fillRect(-30, -4, 6, 8); c.restore();
      }
      drawHand(c, W2[0], W2[1], a.ang, { ts: a.ts ?? (sd === 'L' ? -1 : 1), bd: a.bd, curl: a.curl, spread: a.spread, s: a.hs ?? 1 });
    });
  };
  if (o.part === 'arms') arms(); else if (o.part === 'body') body(); else { body(); arms(); }
  c.restore();
}
