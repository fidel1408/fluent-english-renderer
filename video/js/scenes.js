// Environment, props, overlays, captions and scene-5 illustration
import { W, H, C, clamp, lerp, smooth, easeOut, easeOutBack, seg, rng, rrect, rgba } from './util.js';
import { drawCharacter, defaultPose } from './character.js';

export const FONT = (w, s) => `${w} ${s}px Nunito, 'DejaVu Sans', sans-serif`;
export const IPAFONT = (s, b) => `${b ? 'bold ' : ''}${s}px 'DejaVu Sans', sans-serif`;
export const TABLE_Y = 1272;

// ---------- background ----------
export function drawBackground(ctx, t, mood) {
  // wall
  const g = ctx.createLinearGradient(0, 0, 0, TABLE_Y); g.addColorStop(0, '#F8F1E0'); g.addColorStop(1, '#EADFC6');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // wainscot panel
  ctx.fillStyle = 'rgba(31,163,160,.10)'; ctx.fillRect(0, 960, W, 330);
  ctx.fillStyle = 'rgba(31,163,160,.18)'; ctx.fillRect(0, 956, W, 8);
  // far wall decor: soft circles (depth)
  ctx.fillStyle = 'rgba(242,184,75,.10)'; ctx.beginPath(); ctx.arc(120, 360, 260, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(31,163,160,.08)'; ctx.beginPath(); ctx.arc(980, 1000, 300, 0, 7); ctx.fill();
  drawWindow(ctx, t);
  drawShelf(ctx, t);
  // mood tint (cool / uncertain -> warm)
  ctx.fillStyle = `rgba(30,60,100,${0.20 * (1 - mood)})`; ctx.fillRect(0, 0, W, TABLE_Y);
  const wg = ctx.createRadialGradient(W * 0.72, 380, 40, W * 0.72, 380, 900); wg.addColorStop(0, `rgba(255,214,130,${0.32 * mood})`); wg.addColorStop(1, 'rgba(255,214,130,0)');
  ctx.fillStyle = wg; ctx.fillRect(0, 0, W, TABLE_Y);
}
function drawWindow(ctx, t) {
  const x = 672, y = 400, w = 330, h = 440;
  ctx.save(); rrect(ctx, x, y, w, h, 20); ctx.clip();
  const sg = ctx.createLinearGradient(0, y, 0, y + h); sg.addColorStop(0, '#9ED8DA'); sg.addColorStop(0.6, '#D8F0E8'); sg.addColorStop(1, '#FCE9BC');
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
  // clouds (parallax drift)
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const [cx, cy, s, sp] of [[0, 520, 1, 6], [200, 470, .7, 4], [120, 590, .9, 8]]) {
    const px = x + ((cx + t * sp) % (w + 240)) - 120; for (const [dx, dy, r] of [[0, 0, 28], [30, -10, 34], [62, 2, 26], [28, 10, 30]]) { ctx.beginPath(); ctx.arc(px + dx * s, cy + dy * s - 40, r * s, 0, 7); ctx.fill(); }
  }
  // skyline
  const r = rng(7); let bx = x - 10; ctx.fillStyle = 'rgba(20,128,126,.55)';
  while (bx < x + w) { const bw = 40 + r() * 40, bh = 90 + r() * 150; ctx.fillRect(bx, y + h - bh, bw, bh); bx += bw + 4; }
  bx = x - 20; ctx.fillStyle = C.navy;
  while (bx < x + w) { const bw = 50 + r() * 50, bh = 50 + r() * 110; ctx.fillRect(bx, y + h - bh, bw, bh);
    ctx.fillStyle = C.gold; for (let wy = y + h - bh + 12; wy < y + h - 12; wy += 22) for (let wx = bx + 8; wx < bx + bw - 10; wx += 16) if (r() > .6) ctx.fillRect(wx, wy, 6, 9);
    ctx.fillStyle = C.navy; bx += bw + 6; }
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = C.navy; rrect(ctx, x, y, w, h, 20); ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h * 0.45); ctx.lineTo(x + w, y + h * 0.45); ctx.stroke();
  ctx.fillStyle = C.navyL; ctx.fillRect(x - 22, y + h, w + 44, 20);
}
function drawShelf(ctx, t) {
  const x = 70, w = 330, y1 = 780, y2 = 590;
  const books = [[C.coral, 70], [C.teal, 86], [C.gold, 60], [C.navy, 90], [C.coral, 56], [C.tealL, 74], [C.navyL, 64]];
  for (const [yy, off] of [[y1, 0], [y2, 3]]) {
    let bx = x + 14; const r = rng(11 + off);
    for (let i = 0; i < 7 && bx < x + w - 24; i++) { const [c, h] = books[(i + off) % 7]; const bw = 26 + r() * 14, hh = h + r() * 12;
      ctx.fillStyle = c; rrect(ctx, bx, yy - hh, bw, hh, 4); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(bx + 5, yy - hh + 12, bw - 10, 5); bx += bw + 3; }
    ctx.fillStyle = C.navyL; ctx.fillRect(x, yy, w, 16); ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x, yy + 16, w, 8);
  }
  // plant on top of the shelf with gentle sway
  const px = x + 250, py = y2 - 8; ctx.fillStyle = C.coral; ctx.beginPath(); ctx.moveTo(px - 34, py - 52); ctx.lineTo(px + 34, py - 52); ctx.lineTo(px + 24, py); ctx.lineTo(px - 24, py); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.coralD; ctx.lineWidth = 4; ctx.stroke();
  for (let i = 0; i < 7; i++) { const a = -1.4 + i * 0.47 + Math.sin(t * 1.1 + i) * 0.03; ctx.save(); ctx.translate(px, py - 50); ctx.rotate(a);
    ctx.fillStyle = i % 2 ? C.tealD : C.teal; ctx.beginPath(); ctx.ellipse(0, -52, 17, 56, 0, 0, 7); ctx.fill(); ctx.restore(); }
  // gold lamp
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(x + 40, y2 - 120); ctx.lineTo(x + 100, y2 - 120); ctx.lineTo(x + 116, y2 - 70); ctx.lineTo(x + 24, y2 - 70); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.navy; ctx.fillRect(x + 66, y2 - 70, 8, 56); ctx.fillRect(x + 48, y2 - 22, 44, 12);
}

// ---------- table & props (drawn over character's lower body) ----------
export function drawTable(ctx, t, mood) {
  const g = ctx.createLinearGradient(0, TABLE_Y, 0, H); g.addColorStop(0, '#1A6A72'); g.addColorStop(0.12, '#145A63'); g.addColorStop(1, '#0C3440');
  ctx.fillStyle = g; ctx.fillRect(0, TABLE_Y, W, H - TABLE_Y);
  ctx.fillStyle = C.tealL; ctx.fillRect(0, TABLE_Y, W, 8); ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(0, TABLE_Y + 8, W, 18);
  // notebook + pen (left)
  ctx.save(); ctx.translate(110, TABLE_Y + 8); ctx.rotate(-0.05);
  ctx.fillStyle = C.ivory; rrect(ctx, 0, -30, 130, 40, 6); ctx.fill(); ctx.fillStyle = C.coral; ctx.fillRect(0, -30, 12, 40);
  ctx.fillStyle = C.gold; rrect(ctx, 30, -42, 90, 10, 5); ctx.fill(); ctx.restore();
  // mug with steam (right)
  const mx = 930, my = TABLE_Y + 6;
  ctx.fillStyle = C.coral; rrect(ctx, mx - 44, my - 82, 88, 84, 14); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = C.coral; ctx.beginPath(); ctx.arc(mx + 48, my - 44, 20, -1.2, 1.2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; rrect(ctx, mx - 34, my - 74, 14, 62, 7); ctx.fill();
  ctx.fillStyle = '#5B2A1B'; ctx.beginPath(); ctx.ellipse(mx, my - 80, 40, 9, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 2; i++) { const ph = t * 1.4 + i * 2; ctx.globalAlpha = 0.5 * (0.6 + 0.4 * Math.sin(ph)); ctx.beginPath(); ctx.moveTo(mx - 14 + i * 28, my - 100);
    ctx.bezierCurveTo(mx - 30 + i * 28 + Math.sin(ph) * 10, my - 130, mx + 6 + i * 28 - Math.sin(ph) * 10, my - 150, mx - 8 + i * 28, my - 178); ctx.stroke(); }
  ctx.globalAlpha = 1;
}

// ---------- scene overlays ----------
export function titlePill(ctx, text, a, y = 262, color = C.navy) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = FONT(900, 46); const w = ctx.measureText(text).width + 90, h = 86;
  ctx.translate(W / 2, y + (1 - a) * 18); ctx.fillStyle = color; rrect(ctx, -w / 2, -h / 2, w, h, 43); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(-w / 2 + 40, 0, 11, 0, 7); ctx.fill();
  ctx.fillStyle = C.ivory; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 18, 3); ctx.restore();
}
export function headline(ctx, t) {
  // "¿NO ENTENDISTE?" pops in 0.15s, shrinks into the title position at 3.7s
  const a = easeOut(seg(t, 0.1, 0.45)), out = smooth(seg(t, 3.55, 3.95)); if (a <= 0 || out >= 1) return;
  ctx.save(); const y = lerp(300, 262, out), sc = lerp(1, 0.5, out);
  ctx.translate(W / 2, y); ctx.scale(sc * (0.88 + 0.12 * easeOutBack(seg(t, 0.1, 0.55))), sc * (0.88 + 0.12 * easeOutBack(seg(t, 0.1, 0.55)))); ctx.globalAlpha = a * (1 - out);
  ctx.font = FONT(900, 112); let tw = ctx.measureText('¿NO ENTENDISTE?').width; const fit = Math.min(1, 930 / tw); ctx.scale(fit, fit);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 22; ctx.strokeStyle = C.ivory; ctx.strokeText('¿NO ENTENDISTE?', 0, 0);
  ctx.fillStyle = C.navy; ctx.fillText('¿NO ENTENDISTE?', 0, 0);
  // coral underline swoosh
  const sw = smooth(seg(t, 0.35, 0.8)); ctx.strokeStyle = C.coral; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-tw / 2 + 10, 78); ctx.quadraticCurveTo(0, 96, -tw / 2 + 10 + (tw - 20) * sw, 70); ctx.stroke();
  ctx.restore();
}
// unintelligible question bubble from someone off-screen left (scene 1)
export function murmurBubble(ctx, t) {
  const a = easeOut(seg(t, 0.15, 0.5)) * (1 - smooth(seg(t, 2.35, 2.75))); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; const bx = 30 - (1 - a) * 80, by = 420, w = 400, h = 170;
  ctx.translate(bx, by); ctx.fillStyle = C.ivory; ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(w - 30, 0); ctx.quadraticCurveTo(w, 0, w, 30); ctx.lineTo(w, h - 30); ctx.quadraticCurveTo(w, h, w - 30, h);
  ctx.lineTo(160, h); ctx.lineTo(86, h + 54); ctx.lineTo(90, h); ctx.lineTo(26, h); ctx.quadraticCurveTo(-4, h, -4, h - 30); ctx.lineTo(-4, 30); ctx.quadraticCurveTo(-4, 0, 26, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  // scribble lines that "talk too fast"
  ctx.strokeStyle = C.navyL; ctx.lineWidth = 7; ctx.lineCap = 'round'; const r = rng(3);
  for (let row = 0; row < 3; row++) { ctx.beginPath(); const y0 = 44 + row * 44, len = 220 - row * 28 + 40; ctx.moveTo(34, y0);
    for (let x = 0; x < len; x += 8) ctx.lineTo(34 + x, y0 + Math.sin(x * 0.35 + t * 9 + row * 2) * (5 + 2 * Math.sin(t * 5 + x)) * (0.6 + r() * 0.1)); ctx.stroke(); }
  ctx.fillStyle = C.coral; ctx.font = FONT(900, 92); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', w - 54, h / 2 + 4);
  ctx.restore();
}
export function thinkDots(ctx, t, x, y) {
  const a = easeOut(seg(t, 2.95, 3.25)) * (1 - smooth(seg(t, 3.85, 4.0))); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.fillStyle = C.ivory; ctx.strokeStyle = C.navy; ctx.lineWidth = 6; rrect(ctx, -78, -42, 156, 84, 42); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.navy; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-38 + i * 38, 0, 9 + 3 * Math.max(0, Math.sin(t * 6 - i * 1)), 0, 7); ctx.fill(); }
  ctx.restore();
}
export function pauseRing(ctx, t, cx, cy) {
  const u = seg(t, 3.35, 4.0); if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.strokeStyle = rgba(C.teal, 0.8 * (1 - u)); ctx.lineWidth = 14 * (1 - u) + 2; ctx.beginPath(); ctx.arc(cx, cy, 120 + 380 * easeOut(u), 0, 7); ctx.stroke(); ctx.restore();
}
// slow-down wave (scene 3)
export function slowWave(ctx, t) {
  const a = smooth(seg(t, 11.2, 11.8)) * (1 - smooth(seg(t, 17.6, 18.0))); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * .95; const cy = 412, x0 = 90, x1 = 990;
  ctx.fillStyle = 'rgba(251,245,230,.82)'; rrect(ctx, 60, cy - 78, 960, 156, 78); ctx.fill();
  const slow = smooth(seg(t, 13.9, 15.6)); const wl = lerp(46, 190, slow), amp = lerp(26, 52, slow), sp = lerp(14, 2.6, slow);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [col, lw, off, am] of [[rgba(C.teal, .35), 22, 0.6, 1], [C.teal, 10, 0, 1], [C.coral, 6, 1.4, .6]]) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let x = x0; x <= x1; x += 6) { const e = Math.sin(Math.PI * (x - x0) / (x1 - x0)); const y = cy + Math.sin((x / wl) * Math.PI * 2 - t * sp + off) * amp * am * e; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}
// practice countdown (scene 4)
export function countdown(ctx, t) {
  const t0 = 20.2, a = smooth(seg(t, 19.7, 20.1)) * (1 - smooth(seg(t, 23.7, 24.0))); if (a <= 0) return;
  const cx = W / 2, cy = 402, R = 74; ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = C.navy; ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, 7); ctx.fill();
  ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(251,245,230,.18)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  const p = clamp((t - t0) / 3); ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - p)); if (p < 1) ctx.stroke();
  const n = t < t0 ? 3 : Math.max(0, 3 - Math.floor(t - t0)); ctx.fillStyle = C.ivory; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (t >= t0 + 3) { ctx.strokeStyle = C.teal; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(cx - 30, cy + 2); ctx.lineTo(cx - 8, cy + 26); ctx.lineTo(cx + 34, cy - 24); ctx.stroke(); }
  else { const f = (t - t0) % 1, pop = t < t0 ? 1 : 1 + 0.25 * Math.max(0, 1 - f * 5); ctx.font = FONT(900, 92 * pop); ctx.fillText(String(n), cx, cy + 6); }
  ctx.restore();
}
export function sparkles(ctx, t, t0, t1, seed = 5) {
  const a = smooth(seg(t, t0, t0 + 0.5)) * (1 - smooth(seg(t, t1 - 0.5, t1))); if (a <= 0) return; const r = rng(seed);
  ctx.save(); for (let i = 0; i < 14; i++) { const x = 90 + r() * 900, ph = (t * 0.25 + r()) % 1, y = 1180 - ph * 800 + r() * 40, s = 8 + r() * 12;
    ctx.globalAlpha = a * Math.sin(ph * Math.PI) * 0.9; ctx.fillStyle = i % 3 ? C.gold : C.tealL; ctx.save(); ctx.translate(x + Math.sin(t + i) * 14, y); ctx.rotate(t * 0.8 + i);
    ctx.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? s * 0.28 : s; ctx.lineTo(Math.cos(k * Math.PI / 4) * rr, Math.sin(k * Math.PI / 4) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
export function sceneWipe(ctx, t) {
  for (const [tb, col] of [[4.0, C.teal], [11.0, C.coral], [18.0, C.gold], [24.0, C.navy]]) {
    const u = (t - (tb - 0.32)) / 0.62; if (u <= 0 || u >= 1) continue;
    const e = u < 0.5 ? smooth(u * 2) : 1, e2 = u < 0.5 ? 0 : smooth((u - 0.5) * 2);
    ctx.save(); ctx.fillStyle = col; ctx.beginPath(); const sk = 380, x0 = -sk + (W + sk * 2) * e2, x1 = -sk + (W + sk * 2) * e;
    ctx.moveTo(x0 + sk, 0); ctx.lineTo(x1 + sk, 0); ctx.lineTo(x1 - sk * 0.0, H); ctx.lineTo(x0, H); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

// ---------- captions ----------
// mode: 0 off, 1 captions, 2 captions + IPA
export function captionES(ctx, text, a, mode, y0 = 1292, size = 66) {
  if (mode === 0 || a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = FONT(900, size);
  const lines = wrap(ctx, text, 860), lh = size * 1.24, h = lines.length * lh + 56, y = y0 + (1 - a) * 14 + (y0 < 1300 ? (2 - lines.length) * 16 : 0);
  plate(ctx, W / 2 - 470, y, 940, h); ctx.fillStyle = C.ivory; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, y + 28 + lh / 2 + i * lh + 3)); ctx.restore();
}
function plate(ctx, x, y, w, h) {
  ctx.save(); ctx.shadowColor = 'rgba(5,16,32,.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; ctx.fillStyle = 'rgba(10,31,60,.94)'; rrect(ctx, x, y, w, h, 40); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(242,184,75,.9)'; ctx.lineWidth = 4; rrect(ctx, x + 2, y + 2, w - 4, h - 4, 38); ctx.stroke();
}
function wrap(ctx, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur);
  if (lines.length === 2) { const all = text.split(' '); let best = null; for (let i = 1; i < all.length; i++) { const a = all.slice(0, i).join(' '), b = all.slice(i).join(' '), m = Math.max(ctx.measureText(a).width, ctx.measureText(b).width); if (m <= maxW && (!best || m < best.m)) best = { m, l: [a, b] }; } if (best) return best.l; }
  return lines;
}
// English teaching phrase: words with IPA centered directly underneath each word
export function captionPhrase(ctx, words, ipa, hi, a, mode, opts = {}) {
  if (mode === 0 || a <= 0.01) return;
  const WS = 68, IS = 40, gap = 28, maxW = 880; ctx.save();
  const cells = words.map((w, i) => { ctx.font = FONT(900, WS); const ww = ctx.measureText(w).width; ctx.font = IPAFONT(IS, true); const iw = mode === 2 ? ctx.measureText('/' + ipa[i] + '/').width : 0; return { w, i, cw: Math.max(ww, iw), ww, iw }; });
  const lines = []; let cur = [], cw = 0;
  for (const c of cells) { if (cur.length && cw + gap + c.cw > maxW) { lines.push(cur); cur = []; cw = 0; } cur.push(c); cw += (cur.length > 1 ? gap : 0) + c.cw; }
  lines.push(cur);
  const lh = mode === 2 ? 128 : 94, h = lines.length * lh + 44, y = 1248 + (1 - a) * 16 + (opts.dy || 0);
  ctx.globalAlpha = a; plate(ctx, W / 2 - 470, y, 940, h);
  lines.forEach((ln, li) => {
    const tot = ln.reduce((s, c) => s + c.cw, 0) + gap * (ln.length - 1); let x = W / 2 - tot / 2; const by = y + 20 + li * lh + 50;
    for (const c of ln) {
      const on = c.i === hi, done = hi != null && c.i < hi, cx = x + c.cw / 2; const col = on ? C.gold : C.ivory;
      ctx.save(); ctx.translate(cx, by); if (on) ctx.scale(1.08, 1.08); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = FONT(900, WS); ctx.fillStyle = col; ctx.fillText(c.w, 0, 22);
      if (on) { ctx.fillStyle = C.coral; rrect(ctx, -c.ww / 2, 36 + (mode === 2 ? 0 : 0), c.ww, 6, 3); if (mode !== 2) ctx.fill(); }
      if (mode === 2) { ctx.font = IPAFONT(IS, true); ctx.fillStyle = on ? C.gold : C.tealL; ctx.fillText('/' + ipa[c.i] + '/', 0, 70); }
      ctx.restore(); x += c.cw + gap;
    }
  });
  ctx.restore();
}

// ---------- final scene (24-30s): logo + online-class illustration + CTA ----------
export function drawFinal(ctx, t, logo, charPose) {
  const u = t - 24; if (u < -0.1) return;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FBF5E6'); g.addColorStop(1, '#F1E6CC'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = rgba(C.teal, .12); ctx.beginPath(); ctx.arc(960, 260, 380, 0, 7); ctx.fill(); ctx.fillStyle = rgba(C.coral, .10); ctx.beginPath(); ctx.arc(80, 1180, 330, 0, 7); ctx.fill();
  // logo (supplied artwork, unaltered; scaled uniformly)
  const la = easeOut(seg(u, 0.25, 0.8)), ls = 0.9 + 0.1 * easeOutBack(seg(u, 0.25, 0.9)); const lw = 960, lh = lw * logo.height / logo.width;
  if (logo.complete) { ctx.save(); ctx.globalAlpha = la; ctx.translate(W / 2, 400); ctx.scale(ls, ls); ctx.drawImage(logo, -lw / 2, -lh / 2, lw, lh); ctx.restore(); }
  // laptop with video-call tiles = "clases en línea"
  const ia = easeOutBack(seg(u, 0.7, 1.4)); if (ia > 0) {
    ctx.save(); ctx.translate(W / 2, 870 + (1 - clamp(ia)) * 80); ctx.globalAlpha = clamp(ia); const s = 0.96 + 0.04 * ia; ctx.scale(s, s);
    // screen body
    ctx.fillStyle = C.navy; rrect(ctx, -390, -250, 780, 470, 34); ctx.fill(); ctx.fillStyle = C.navyD; rrect(ctx, -366, -226, 732, 422, 20); ctx.fill();
    // base
    ctx.fillStyle = '#C9BFA6'; ctx.beginPath(); ctx.moveTo(-450, 232); ctx.lineTo(450, 232); ctx.lineTo(420, 262); ctx.lineTo(-420, 262); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#E4DAC1'; ctx.fillRect(-450, 220, 900, 14);
    // tiles
    const tiles = [[-352, -212, 346, 250, 'me'], [8, -212, 346, 250, 'f'], [-352, 52, 346, 134, 'm2'], [8, 52, 346, 134, 'f2']];
    tiles.forEach(([x, y, w, h, who], i) => { const ta = easeOut(seg(u, 1.0 + i * 0.18, 1.5 + i * 0.18)); ctx.save(); ctx.globalAlpha = ta; ctx.beginPath(); rrect(ctx, x, y, w, h, 18); ctx.clip();
      const bg = ctx.createLinearGradient(x, y, x + w, y + h); bg.addColorStop(0, [C.teal, C.coral, C.gold, C.tealL][i]); bg.addColorStop(1, [C.tealD, C.coralD, C.goldD, C.teal][i]); ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
      if (who === 'me') { ctx.save(); ctx.translate(x + w / 2, y + h + 8); const k = 0.50; ctx.scale(k, k); ctx.translate(-540, -1055); const p = defaultPose(); p.smile = 1; p.mouth = 0.25 * (0.5 + 0.5 * Math.sin(u * 5)); p.L.vis = 0; p.R.vis = 0; p.blink = (u % 3.1 < 0.14) ? 1 : 0; drawCharacter(ctx, p); ctx.restore(); }
      else avatar(ctx, x + w / 2, y + h, h, who, u + i);
      ctx.restore(); });
    // chat bubble above the laptop
    const ca = easeOutBack(seg(u, 2.0, 2.5)); if (ca > 0) { ctx.save(); ctx.translate(318, -276); ctx.scale(ca, ca); ctx.fillStyle = C.gold; ctx.strokeStyle = C.navy; ctx.lineWidth = 7; rrect(ctx, -86, -50, 172, 100, 34); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-30, 48); ctx.lineTo(-52, 84); ctx.lineTo(0, 48); ctx.fill(); ctx.fillStyle = C.navy; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-36 + i * 36, 0, 10, 0, 7); ctx.fill(); } ctx.restore(); }
    ctx.restore();
  }
  // CTA button
  const ba = easeOutBack(seg(u, 2.6, 3.2)); if (ba > 0) {
    const pulse = 1 + 0.025 * Math.sin(u * 5.5) * seg(u, 3.3, 3.4); ctx.save(); ctx.translate(W / 2, 1222); ctx.scale(ba * pulse, ba * pulse); ctx.font = FONT(900, 60);
    const label = 'ESCRÍBENOS INGLÉS', tw = ctx.measureText(label).width, bw = tw + 190, bh = 124;
    ctx.shadowColor = 'rgba(217,80,63,.5)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12; ctx.fillStyle = C.coral; rrect(ctx, -bw / 2, -bh / 2, bw, bh, 62); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 5; ctx.strokeStyle = C.ivory; rrect(ctx, -bw / 2 + 4, -bh / 2 + 4, bw - 8, bh - 8, 58); ctx.stroke();
    // message icon
    ctx.fillStyle = C.ivory; rrect(ctx, -bw / 2 + 36, -30, 66, 50, 14); ctx.fill(); ctx.beginPath(); ctx.moveTo(-bw / 2 + 52, 18); ctx.lineTo(-bw / 2 + 48, 42); ctx.lineTo(-bw / 2 + 74, 18); ctx.fill();
    ctx.fillStyle = C.coral; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-bw / 2 + 52 + i * 14, -5, 5, 0, 7); ctx.fill(); }
    ctx.fillStyle = C.ivory; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 52, 5); ctx.restore();
  }
}
function avatar(ctx, cx, by, h, who, t) {
  const f = who === 'f' || who === 'f2'; const skin = f ? '#F0C29A' : '#C98F63', hair = f ? '#5B2E1E' : '#D8D2C8', shirt = f ? C.navy : C.tealD;
  const s = who.length === 1 ? 1 : 0.62; ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
  ctx.fillStyle = shirt; ctx.beginPath(); ctx.ellipse(0, 0, 150, 120, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = skin; ctx.fillRect(-22, -170, 44, 70);
  if (f) { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(0, -255, 76, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(0, -330, 30, 0, 7); ctx.fill(); }
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -240, 66, 78, 0, 0, 7); ctx.fill();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, -290, 70, 40, 0, Math.PI, 0); ctx.fill();
  const bl = (t % 3.3) < 0.12 ? 0.1 : 1; ctx.fillStyle = '#2A1710'; for (const e of [-26, 26]) { ctx.beginPath(); ctx.ellipse(e, -240, 8, 10 * bl, 0, 0, 7); ctx.fill(); }
  ctx.strokeStyle = '#8A3F33'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -210, 24, 0.25, Math.PI - 0.25); ctx.stroke();
  if (!f) { ctx.strokeStyle = C.navyD; ctx.lineWidth = 6; for (const e of [-26, 26]) { ctx.beginPath(); ctx.arc(e, -240, 20, 0, 7); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-6, -240); ctx.lineTo(6, -240); ctx.stroke(); }
  ctx.restore();
}
