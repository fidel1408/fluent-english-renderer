/* scenes.js — layered scenery, drawn once into offscreen canvases (no per-frame path generation).
   World = 2304x1296 (1920x1080 view + 192/108 overscan so the camera can pan and push in).
   Each scene has `bg` (behind the cast) and `fg` (table/desk/props in front of the cast).
   Scenery contains no words, so nothing on screen is missing its IPA.                              */
'use strict';
const WORLD = { w: 2304, h: 1296, ox: 192, oy: 108 };

function mk() { const c = document.createElement('canvas'); c.width = WORLD.w; c.height = WORLD.h; const x = c.getContext('2d'); x.translate(WORLD.ox, WORLD.oy); return [c, x]; }

/* ---- shared props ---- */
function plant(ctx, x, y, s, seed = 1, pot = '#C9774B') {
  const r = rng(seed); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = lg(ctx, -50, 0, 50, 0, [[0, shade(pot, 0.12)], [1, shade(pot, -0.25)]]); ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(52, 0); ctx.lineTo(40, 100); ctx.quadraticCurveTo(0, 112, -40, 100); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(pot, 0.18); ctx.fillRect(-56, -6, 112, 16);
  const greens = ['#2F7D4F', '#3F9A63', '#58B47A', '#25694A'];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.3, L = 90 + r() * 120;
    ctx.save(); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = greens[i % 4];
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.bezierCurveTo(26, -L * 0.3, 22, -L * 0.8, 0, -L); ctx.bezierCurveTo(-22, -L * 0.8, -26, -L * 0.3, 0, -4); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -L * 0.9); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
function glow(ctx, x, y, r, color, a) { ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, rgba(color, a)], [1, rgba(color, 0)]]); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function vignette(ctx, a = 0.28) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = rg(ctx, WORLD.w / 2, WORLD.h / 2, WORLD.h * 0.35, WORLD.w * 0.68, [[0, 'rgba(20,12,8,0)'], [1, `rgba(20,12,8,${a})`]]); ctx.fillRect(0, 0, WORLD.w, WORLD.h); ctx.restore();
}
function frameArt(ctx, x, y, w, h, c1, c2, c3) {
  ctx.fillStyle = '#6B4428'; ctx.fillRect(x - 10, y - 10, w + 20, h + 20); ctx.fillStyle = '#FFF8EC'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(x + w * 0.36, y + h * 0.42, w * 0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = c2; ctx.fillRect(x + w * 0.1, y + h * 0.7, w * 0.8, h * 0.12); ctx.fillStyle = c3; ctx.beginPath(); ctx.arc(x + w * 0.68, y + h * 0.35, w * 0.11, 0, TAU); ctx.fill();
}
function cupProp(ctx, x, y, s = 1, tint = '#F7F1E7', coffee = '#6B3E22') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(40,20,10,.22)'; ctx.beginPath(); ctx.ellipse(8, 8, 62, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = shade(tint, -0.08); ctx.beginPath(); ctx.ellipse(0, 4, 56, 13, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = lg(ctx, -38, 0, 38, 0, [[0, tint], [1, shade(tint, -0.16)]]); ctx.beginPath(); ctx.moveTo(-38, -44); ctx.lineTo(38, -44); ctx.quadraticCurveTo(34, 2, 0, 4); ctx.quadraticCurveTo(-34, 2, -38, -44); ctx.fill();
  ctx.strokeStyle = tint; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(46, -26, 15, -1.2, 1.4); ctx.stroke();
  ctx.fillStyle = coffee; ctx.beginPath(); ctx.ellipse(0, -44, 38, 9, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.ellipse(-10, -46, 14, 3, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function floorBoards(ctx, y0, base, plank = 120, seed = 3) {
  const r = rng(seed);
  ctx.fillStyle = lg(ctx, 0, y0, 0, 1210, [[0, shade(base, 0.12)], [1, shade(base, -0.28)]]); ctx.fillRect(-192, y0, 2304, 1296 - y0 + 108);
  ctx.strokeStyle = 'rgba(60,30,10,.18)'; ctx.lineWidth = 3;
  for (let x = -192; x < 2112; x += plank) { ctx.beginPath(); ctx.moveTo(x + r() * 8, y0); ctx.lineTo(x * 1.35 - 400 + 0, 1296); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 14; i++) { ctx.fillRect(r() * 2200 - 192, y0 + 10 + r() * 240, 120 + r() * 160, 3); }
}

/* ------------------------------------------------------------------ HALL (story) */
function sceneHall() {
  const [bg, b] = mk(), [fg, f] = mk();
  b.fillStyle = lg(b, 0, -108, 0, 840, [[0, '#F8ECD7'], [1, '#EBD3AE']]); b.fillRect(-192, -108, 2304, 960);
  b.fillStyle = 'rgba(160,110,60,.045)'; for (let x = -192; x < 2112; x += 64) b.fillRect(x, -108, 26, 960);
  // wainscot + rail
  b.fillStyle = lg(b, 0, 600, 0, 850, [[0, '#2D6A5C'], [1, '#1F4F45']]); b.fillRect(-192, 600, 2304, 250);
  b.fillStyle = 'rgba(255,255,255,.09)'; for (let x = -150; x < 2100; x += 260) { b.strokeStyle = 'rgba(255,255,255,.17)'; b.lineWidth = 3; b.strokeRect(x, 650, 200, 160); }
  b.fillStyle = '#9A6538'; b.fillRect(-192, 590, 2304, 20); b.fillStyle = '#C48A55'; b.fillRect(-192, 590, 2304, 6);
  b.fillStyle = '#6E4526'; b.fillRect(-192, 846, 2304, 26);
  floorBoards(b, 872, '#A5703F', 130, 5);
  // door
  const dx = 130, dy = 70, dw = 430, dh = 790;
  b.fillStyle = '#5E3A20'; b.fillRect(dx - 26, dy - 26, dw + 52, dh + 26);
  b.fillStyle = lg(b, dx, 0, dx + dw, 0, [[0, '#8F5B33'], [0.5, '#A06A3B'], [1, '#7C4E2B']]); b.fillRect(dx, dy, dw, dh);
  b.strokeStyle = 'rgba(40,20,5,.35)'; b.lineWidth = 5; b.strokeRect(dx + 34, dy + 300, dw - 68, 190); b.strokeRect(dx + 34, dy + 530, dw - 68, 200);
  b.fillStyle = lg(b, 0, dy + 34, 0, dy + 260, [[0, '#CFE9F7'], [1, '#8FC3E3']]); b.beginPath(); rrect(b, dx + 40, dy + 34, dw - 80, 236, 20); b.fill();
  b.strokeStyle = '#5E3A20'; b.lineWidth = 8; b.stroke(); b.strokeStyle = 'rgba(255,255,255,.65)'; b.lineWidth = 5; b.beginPath(); b.moveTo(dx + 80, dy + 230); b.lineTo(dx + 190, dy + 80); b.moveTo(dx + 150, dy + 246); b.lineTo(dx + 250, dy + 110); b.stroke();
  // brass lock + handle
  b.fillStyle = lg(b, 0, 0, 30, 0, [[0, '#F2D27A'], [1, '#B98A2B']]); b.beginPath(); rrect(b, dx + dw - 86, dy + 430, 40, 96, 14); b.fill(); b.beginPath(); b.arc(dx + dw - 66, dy + 454, 10, 0, TAU); b.fillStyle = '#3B2A12'; b.fill();
  b.strokeStyle = lg(b, 0, 0, 90, 0, [[0, '#F2D27A'], [1, '#B98A2B']]); b.lineWidth = 12; b.lineCap = 'round'; b.beginPath(); b.moveTo(dx + dw - 66, dy + 500); b.lineTo(dx + dw - 142, dy + 500); b.stroke();
  // key rack board on the right
  const kx = 1560, ky = 250;
  b.fillStyle = 'rgba(40,20,5,.28)'; b.beginPath(); rrect(b, kx + 8, ky + 12, 300, 112, 14); b.fill();
  b.fillStyle = lg(b, 0, ky, 0, ky + 110, [[0, '#B77C45'], [1, '#8A5630']]); b.beginPath(); rrect(b, kx, ky, 300, 110, 14); b.fill();
  for (let i = 0; i < 4; i++) { const hx = kx + 46 + i * 70; b.fillStyle = lg(b, 0, 0, 16, 0, [[0, '#F2D27A'], [1, '#B98A2B']]); b.beginPath(); b.arc(hx, ky + 38, 9, 0, TAU); b.fill(); b.fillRect(hx - 3, ky + 36, 6, 14);
    if (i !== 2) { b.strokeStyle = '#C8CDD6'; b.lineWidth = 4; b.beginPath(); b.arc(hx, ky + 62, 9, 0, TAU); b.stroke(); b.fillStyle = ['#2E7DD7', '#F28C28', '#17A589'][i > 2 ? 2 : i]; b.fillRect(hx - 6, ky + 74, 12, 22); } }
  // wall lamp + glow, art, plant
  glow(b, 1430, 150, 260, '#FFE2A8', 0.5); b.fillStyle = '#F5D78B'; b.beginPath(); b.arc(1430, 150, 30, 0, TAU); b.fill(); b.fillStyle = '#6E4526'; b.fillRect(1410, 176, 40, 14);
  frameArt(b, 1000, 120, 220, 170, '#E36414', '#17727A', '#E9B949');
  plant(b, 1830, 740, 1.35, 9, '#C9774B');
  glow(b, 300, 330, 520, '#FFFFFF', 0.18);
  // light spill on floor
  b.fillStyle = 'rgba(255,240,200,.22)'; b.beginPath(); b.moveTo(130, 872); b.lineTo(560, 872); b.lineTo(900, 1200); b.lineTo(200, 1200); b.fill();
  vignette(b, 0.26);
  f.fillStyle = 'rgba(0,0,0,0)';
  return { bg, fg, name: 'hall' };
}

/* ------------------------------------------------------------------ CAFE */
function sceneCafe() {
  const [bg, b] = mk(), [fg, f] = mk();
  b.fillStyle = lg(b, 0, -108, 0, 900, [[0, '#F7E6CB'], [1, '#E8C9A0']]); b.fillRect(-192, -108, 2304, 1100);
  // brick lower wall
  b.fillStyle = '#B5603F'; b.fillRect(-192, 560, 2304, 320);
  const r = rng(21); for (let y = 560; y < 880; y += 34) for (let x = -192 - ((y / 34) % 2) * 45; x < 2112; x += 90) { b.fillStyle = shade('#B5603F', (r() - 0.5) * 0.18); b.fillRect(x + 2, y + 2, 86, 30); }
  b.fillStyle = 'rgba(0,0,0,.14)'; b.fillRect(-192, 560, 2304, 10);
  // big window left with city
  const wx = 90, wy = 90, ww = 600, wh = 560;
  b.fillStyle = '#7A4E2C'; b.fillRect(wx - 22, wy - 22, ww + 44, wh + 44);
  b.fillStyle = lg(b, 0, wy, 0, wy + wh, [[0, '#9ED4F2'], [0.7, '#D8EEF8'], [1, '#FBE9C8']]); b.fillRect(wx, wy, ww, wh);
  b.save(); b.beginPath(); b.rect(wx, wy, ww, wh); b.clip();
  const bl = rng(4); for (let i = 0; i < 9; i++) { const bw = 70 + bl() * 70, bh = 120 + bl() * 220, bx = wx + i * 72 - 10; b.fillStyle = shade('#8FA9BF', 0.05 + bl() * 0.18); b.fillRect(bx, wy + wh - bh, bw, bh); b.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 6; k++) b.fillRect(bx + 10 + (k % 3) * 18, wy + wh - bh + 14 + Math.floor(k / 3) * 30, 9, 14); }
  glow(b, wx + 470, wy + 110, 220, '#FFFFFF', 0.7); b.restore();
  b.strokeStyle = '#7A4E2C'; b.lineWidth = 10; b.beginPath(); b.moveTo(wx + ww / 2, wy); b.lineTo(wx + ww / 2, wy + wh); b.moveTo(wx, wy + wh * 0.55); b.lineTo(wx + ww, wy + wh * 0.55); b.stroke();
  // shelves right with cups + plants
  for (const [sy, sx] of [[210, 1470], [400, 1470]]) { b.fillStyle = '#6A4023'; b.fillRect(sx, sy, 400, 16); b.fillStyle = 'rgba(0,0,0,.2)'; b.fillRect(sx, sy + 16, 400, 10); }
  for (let i = 0; i < 5; i++) { b.fillStyle = ['#17727A', '#E36414', '#F7F1E7', '#E9B949', '#5B2A5E'][i]; b.beginPath(); rrect(b, 1500 + i * 70, 160, 46, 50, 8); b.fill(); }
  plant(b, 1740, 395, 0.5, 14, '#F7F1E7'); plant(b, 1560, 395, 0.4, 3, '#C9774B');
  frameArt(b, 1520, 460, 170, 120, '#17727A', '#E36414', '#E9B949');
  // pendant lamps
  for (const lx of [820, 1180, 1580]) { b.strokeStyle = '#3B2A1B'; b.lineWidth = 4; b.beginPath(); b.moveTo(lx, -108); b.lineTo(lx, 70); b.stroke(); glow(b, lx, 150, 190, '#FFD37A', 0.42); b.fillStyle = lg(b, lx - 56, 0, lx + 56, 0, [[0, '#F2A93B'], [1, '#C97A18']]); b.beginPath(); b.moveTo(lx - 22, 70); b.lineTo(lx + 22, 70); b.lineTo(lx + 62, 150); b.lineTo(lx - 62, 150); b.closePath(); b.fill(); b.fillStyle = '#FFF1C2'; b.beginPath(); b.ellipse(lx, 150, 62, 11, 0, 0, TAU); b.fill(); }
  // back counter with espresso machine
  b.fillStyle = '#4A2E1C'; b.fillRect(-192, 840, 2304, 60);
  floorBoards(b, 900, '#8B5A33', 140, 8);
  b.fillStyle = '#C9CED6'; b.beginPath(); rrect(b, 760, 746, 200, 96, 12); b.fill(); b.fillStyle = '#8D95A3'; b.fillRect(760, 800, 200, 14); b.fillStyle = '#2B2F3A'; b.fillRect(800, 820, 28, 22); b.fillRect(890, 820, 28, 22);
  vignette(b, 0.3);
  // FG: table
  f.fillStyle = 'rgba(30,15,5,.28)'; f.beginPath(); f.ellipse(960, 1004, 900, 70, 0, 0, TAU); f.fill();
  f.fillStyle = lg(f, 0, 872, 0, 1100, [[0, '#C98B57'], [0.12, '#B67842'], [1, '#8A5630']]); f.beginPath(); f.moveTo(150, 880); f.quadraticCurveTo(960, 846, 1770, 880); f.lineTo(1840, 1200); f.lineTo(80, 1200); f.closePath(); f.fill();
  f.fillStyle = 'rgba(255,255,255,.18)'; f.beginPath(); f.moveTo(220, 892); f.quadraticCurveTo(960, 860, 1700, 892); f.lineTo(1700, 900); f.quadraticCurveTo(960, 868, 220, 900); f.fill();
  f.strokeStyle = 'rgba(60,30,10,.18)'; f.lineWidth = 3; for (let y = 930; y < 1160; y += 46) { f.beginPath(); f.moveTo(120, y); f.quadraticCurveTo(960, y - 32, 1800, y); f.stroke(); }
  cupProp(f, 640, 940, 0.9); cupProp(f, 1320, 946, 0.9, '#E8F1F5', '#7A4A2A');
  f.fillStyle = '#F7F1E7'; f.beginPath(); f.ellipse(960, 972, 94, 20, 0, 0, TAU); f.fill(); f.fillStyle = '#E9C07A'; f.beginPath(); f.arc(930, 960, 24, Math.PI, TAU); f.fill(); f.fillStyle = '#B5603F'; f.beginPath(); f.arc(986, 962, 18, Math.PI, TAU); f.fill();
  return { bg, fg, name: 'cafe' };
}

/* ------------------------------------------------------------------ OFFICE */
function sceneOffice() {
  const [bg, b] = mk(), [fg, f] = mk();
  b.fillStyle = lg(b, 0, -108, 0, 900, [[0, '#E7F0F6'], [1, '#CFDFEA']]); b.fillRect(-192, -108, 2304, 1100);
  // window wall (right) with skyline
  const wx = 1150, wy = 40, ww = 800, wh = 620;
  b.fillStyle = '#9FB2C2'; b.fillRect(wx - 18, wy - 18, ww + 36, wh + 36);
  b.fillStyle = lg(b, 0, wy, 0, wy + wh, [[0, '#7EC3EE'], [0.65, '#CFEAF8'], [1, '#F6F1DF']]); b.fillRect(wx, wy, ww, wh);
  b.save(); b.beginPath(); b.rect(wx, wy, ww, wh); b.clip();
  const bl = rng(12); for (let i = 0; i < 11; i++) { const bw = 80 + bl() * 80, bh = 160 + bl() * 300, bx = wx + i * 78 - 20; b.fillStyle = shade('#7C93AB', 0.02 + bl() * 0.22); b.fillRect(bx, wy + wh - bh, bw, bh); b.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 12; k++) b.fillRect(bx + 10 + (k % 4) * 17, wy + wh - bh + 14 + Math.floor(k / 4) * 34, 8, 16); }
  b.fillStyle = 'rgba(255,255,255,.7)'; for (const [cx, cy, s] of [[wx + 150, wy + 120, 1], [wx + 560, wy + 80, 0.8]]) { b.beginPath(); b.arc(cx, cy, 40 * s, 0, TAU); b.arc(cx + 44 * s, cy + 8, 32 * s, 0, TAU); b.arc(cx - 40 * s, cy + 10, 30 * s, 0, TAU); b.fill(); }
  glow(b, wx + 640, wy + 80, 300, '#FFFFFF', 0.55); b.restore();
  b.strokeStyle = '#9FB2C2'; b.lineWidth = 12; b.beginPath(); b.moveTo(wx + ww / 3, wy); b.lineTo(wx + ww / 3, wy + wh); b.moveTo(wx + 2 * ww / 3, wy); b.lineTo(wx + 2 * ww / 3, wy + wh); b.stroke();
  // whiteboard with sticky notes (no words)
  const bx = 120, by = 120;
  b.fillStyle = 'rgba(0,0,0,.14)'; b.fillRect(bx + 8, by + 10, 640, 400); b.fillStyle = '#9AA6B2'; b.fillRect(bx - 12, by - 12, 664, 424); b.fillStyle = '#FBFCFD'; b.fillRect(bx, by, 640, 400);
  const nc = ['#F8D56B', '#F59AA3', '#8ED3A8', '#8CC7F0']; const rr = rng(5);
  for (let i = 0; i < 9; i++) { const nx = bx + 40 + (i % 3) * 190 + rr() * 14, ny = by + 40 + Math.floor(i / 3) * 110 + rr() * 10; b.save(); b.translate(nx, ny); b.rotate((rr() - 0.5) * 0.12); b.fillStyle = nc[i % 4]; b.fillRect(0, 0, 130, 84); b.fillStyle = 'rgba(0,0,0,.1)'; b.fillRect(0, 70, 130, 14); b.fillStyle = 'rgba(30,40,60,.35)'; for (let k = 0; k < 3; k++) b.fillRect(14, 18 + k * 17, 80 - k * 14, 5); b.restore(); }
  b.strokeStyle = '#2E7DD7'; b.lineWidth = 6; b.lineCap = 'round'; b.beginPath(); b.moveTo(bx + 60, by + 370); b.bezierCurveTo(bx + 200, by + 330, bx + 340, by + 390, bx + 560, by + 350); b.stroke();
  // bookshelf far-left bottom & wall clock
  b.fillStyle = '#FBFBF8'; b.beginPath(); b.arc(1040, 160, 62, 0, TAU); b.fill(); b.strokeStyle = '#34445A'; b.lineWidth = 8; b.stroke(); b.lineWidth = 5; b.beginPath(); b.moveTo(1040, 160); b.lineTo(1040, 120); b.moveTo(1040, 160); b.lineTo(1068, 172); b.stroke();
  // floor + back wall base
  b.fillStyle = '#B7C6D2'; b.fillRect(-192, 780, 2304, 90); b.fillStyle = lg(b, 0, 870, 0, 1300, [[0, '#8EA0B0'], [1, '#6C7E8E']]); b.fillRect(-192, 870, 2304, 520);
  b.fillStyle = 'rgba(255,255,255,.09)'; for (let x = -192; x < 2112; x += 220) { b.beginPath(); b.moveTo(x, 870); b.lineTo(x * 1.5 - 360, 1300); b.lineTo(x * 1.5 - 340, 1300); b.lineTo(x + 14, 870); b.fill(); }
  plant(b, 90, 860, 1.5, 31, '#F7F1E7'); plant(b, 1960, 880, 1.25, 17, '#2D6A5C');
  vignette(b, 0.18);
  // FG: desk with laptop + mug + papers
  f.fillStyle = 'rgba(20,30,40,.28)'; f.beginPath(); f.ellipse(960, 1010, 940, 64, 0, 0, TAU); f.fill();
  f.fillStyle = lg(f, 0, 860, 0, 1100, [[0, '#D9B684'], [0.1, '#C79D66'], [1, '#9A7243']]); f.beginPath(); f.moveTo(90, 876); f.lineTo(1830, 876); f.lineTo(1890, 1200); f.lineTo(30, 1200); f.closePath(); f.fill();
  f.fillStyle = 'rgba(255,255,255,.22)'; f.fillRect(90, 876, 1740, 8);
  // laptop seen from behind (lid), left side
  f.fillStyle = lg(f, 0, 0, 380, 0, [[0, '#C5CBD3'], [1, '#9FA7B2']]); f.beginPath(); rrect(f, 360, 740, 420, 150, 14); f.fill(); f.fillStyle = 'rgba(0,0,0,.12)'; f.fillRect(360, 880, 420, 10);
  f.fillStyle = '#E9ECEF'; f.beginPath(); f.arc(570, 815, 15, 0, TAU); f.fill(); f.fillStyle = '#8D95A3'; f.beginPath(); f.arc(570, 815, 8, 0, TAU); f.fill();
  cupProp(f, 1370, 936, 0.8, '#F28C28', '#6B3E22');
  f.save(); f.translate(1520, 940); f.rotate(-0.06); f.fillStyle = '#FFFFFF'; f.fillRect(0, 0, 180, 120); f.fillStyle = 'rgba(0,0,0,.1)'; f.fillRect(0, 112, 180, 8); f.fillStyle = '#C7D2E0'; for (let i = 0; i < 4; i++) f.fillRect(18, 22 + i * 22, 130 - (i % 2) * 28, 6); f.restore();
  return { bg, fg, name: 'office' };
}

/* ------------------------------------------------------------------ TRAVEL (airport gate) */
function sceneTravel() {
  const [bg, b] = mk(), [fg, f] = mk();
  b.fillStyle = lg(b, 0, -108, 0, 900, [[0, '#EAF4FB'], [1, '#D3E4F0']]); b.fillRect(-192, -108, 2304, 1100);
  // huge window with plane
  const wx = -192, wy = 20, ww = 2304, wh = 640;
  b.fillStyle = lg(b, 0, wy, 0, wy + wh, [[0, '#59B4EE'], [0.55, '#A9DBF6'], [1, '#EAF6FC']]); b.fillRect(wx, wy, ww, wh);
  glow(b, 1500, 160, 360, '#FFFFFF', 0.75);
  b.fillStyle = 'rgba(255,255,255,.85)'; for (const [cx, cy, s] of [[360, 170, 1.3], [980, 110, 1], [1700, 250, 1.1]]) { b.beginPath(); b.arc(cx, cy, 46 * s, 0, TAU); b.arc(cx + 56 * s, cy + 10, 38 * s, 0, TAU); b.arc(cx - 54 * s, cy + 12, 34 * s, 0, TAU); b.arc(cx + 10 * s, cy + 22, 44 * s, 0, TAU); b.fill(); }
  // tarmac
  b.fillStyle = lg(b, 0, 520, 0, 660, [[0, '#9AA7B3'], [1, '#6E7C89']]); b.fillRect(wx, 520, ww, 140);
  b.fillStyle = 'rgba(255,255,255,.5)'; for (let x = -100; x < 2200; x += 220) b.fillRect(x, 596, 120, 8);
  // airplane (side view) on tarmac
  b.save(); b.translate(980, 470); b.scale(1.15, 1.15);
  b.fillStyle = '#FFFFFF'; b.beginPath(); b.moveTo(-300, 20); b.bezierCurveTo(-300, -40, -180, -62, -20, -62); b.lineTo(180, -58); b.bezierCurveTo(270, -50, 330, -10, 340, 20); b.bezierCurveTo(300, 52, 200, 62, 80, 62); b.lineTo(-180, 62); b.bezierCurveTo(-260, 62, -300, 52, -300, 20); b.fill();
  b.fillStyle = '#17727A'; b.fillRect(-300, 22, 640, 14); b.fillStyle = '#E36414'; b.beginPath(); b.moveTo(-296, -30); b.lineTo(-340, -150); b.lineTo(-250, -150); b.lineTo(-190, -52); b.fill();
  b.fillStyle = '#B7C8D6'; b.beginPath(); b.moveTo(-40, 30); b.lineTo(120, 130); b.lineTo(30, 130); b.lineTo(-150, 30); b.fill();
  b.fillStyle = '#4C6C86'; for (let i = 0; i < 12; i++) { b.beginPath(); b.arc(-200 + i * 36, -8, 9, 0, TAU); b.fill(); } b.fillStyle = '#2C4A63'; b.beginPath(); b.moveTo(250, -42); b.lineTo(310, -14); b.lineTo(250, -14); b.fill();
  b.restore();
  // window mullions
  b.fillStyle = '#C7D3DD'; for (const x of [260, 820, 1380, 1940]) b.fillRect(x, wy - 20, 26, wh + 30); b.fillStyle = '#AEBCC8'; b.fillRect(wx, wy + wh, ww, 30);
  // floor
  b.fillStyle = lg(b, 0, 690, 0, 1300, [[0, '#B9C6D2'], [0.4, '#D9E2EA'], [1, '#9AA9B8']]); b.fillRect(-192, 690, 2304, 700);
  b.fillStyle = 'rgba(255,255,255,.25)'; b.beginPath(); b.moveTo(1300, 690); b.lineTo(1700, 690); b.lineTo(2100, 1300); b.lineTo(1500, 1300); b.fill();
  b.strokeStyle = 'rgba(80,100,120,.18)'; b.lineWidth = 3; for (let x = -192; x < 2300; x += 180) { b.beginPath(); b.moveTo(x, 690); b.lineTo(x * 1.6 - 600, 1300); b.stroke(); }
  // departures board (bars only) + ceiling light
  b.fillStyle = '#16233A'; b.beginPath(); rrect(b, 1380, -60, 520, 150, 12); b.fill(); const br = rng(2); for (let i = 0; i < 4; i++) { b.fillStyle = '#F2D27A'; b.fillRect(1410, -34 + i * 30, 90 + br() * 60, 10); b.fillStyle = '#7FC6F2'; b.fillRect(1560, -34 + i * 30, 140 + br() * 80, 10); b.fillStyle = '#7FD89B'; b.fillRect(1760, -34 + i * 30, 70 + br() * 40, 10); }
  plant(b, 80, 800, 1.25, 41, '#F7F1E7');
  vignette(b, 0.16);
  // FG: low seat backs bottom + suitcase right
  f.fillStyle = 'rgba(20,40,60,.25)'; f.beginPath(); f.ellipse(960, 1030, 960, 60, 0, 0, TAU); f.fill();
  for (let i = 0; i < 6; i++) { const sx = 40 + i * 330; f.fillStyle = lg(f, 0, 930, 0, 1100, [[0, '#2E7DD7'], [1, '#1B4F94']]); f.beginPath(); rrect(f, sx, 940, 290, 200, 34); f.fill(); f.fillStyle = 'rgba(255,255,255,.14)'; f.beginPath(); rrect(f, sx + 18, 950, 254, 28, 14); f.fill(); }
  return { bg, fg, name: 'travel' };
}

function drawSuitcase(ctx, x, y) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = lg(ctx, 0, 0, 150, 0, [[0, '#E36414'], [1, '#B84A0C']]); ctx.beginPath(); rrect(ctx, 0, -230, 170, 260, 24); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 5; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * 42, -222); ctx.lineTo(i * 42, 22); ctx.stroke(); } ctx.fillStyle = '#3B2A1B'; ctx.fillRect(66, -270, 38, 44); ctx.restore();
}
/* ------------------------------------------------------------------ STUDIO (grammar boards) */
function sceneStudio() {
  const [bg, b] = mk(), [fg, f] = mk();
  b.fillStyle = lg(b, -192, -108, 2112, 1100, [[0, '#E4F1F6'], [0.5, '#F4EEDF'], [1, '#F7E3CC']]); b.fillRect(-192, -108, 2304, 1296);
  // soft geometric motifs: big translucent circles & arcs echoing the globe logo
  for (const [x, y, r, c, a] of [[260, 220, 300, '#2E7DD7', 0.07], [1700, 180, 340, '#F28C28', 0.07], [980, 760, 460, '#17A589', 0.06], [1500, 900, 260, '#8E5BD9', 0.06], [120, 800, 220, '#D64550', 0.05]]) glow(b, x, y, r, c, a * 2);
  b.strokeStyle = 'rgba(46,125,215,.10)'; b.lineWidth = 3; for (let i = 0; i < 7; i++) { b.beginPath(); b.ellipse(960, 560, 280 + i * 120, 140 + i * 60, 0, 0, TAU); b.stroke(); }
  b.strokeStyle = 'rgba(46,125,215,.08)'; for (let i = -4; i <= 4; i++) { b.beginPath(); b.moveTo(960 + i * 150, -108); b.quadraticCurveTo(960 + i * 300, 540, 960 + i * 150, 1200); b.stroke(); }
  b.fillStyle = lg(b, 0, 860, 0, 1300, [[0, '#E8D2B0'], [1, '#C8A97A']]); b.fillRect(-192, 860, 2304, 440);
  b.fillStyle = 'rgba(255,255,255,.35)'; b.fillRect(-192, 860, 2304, 5);
  plant(b, 60, 840, 1.55, 61, '#C9774B'); plant(b, 1880, 850, 1.45, 62, '#17727A');
  vignette(b, 0.12);
  return { bg, fg, name: 'studio' };
}

const SCENE_BUILDERS = { hall: sceneHall, cafe: sceneCafe, office: sceneOffice, travel: sceneTravel, studio: sceneStudio };
const SCENES = {};
function getScene(name) { return SCENES[name] || (SCENES[name] = SCENE_BUILDERS[name]()); }
