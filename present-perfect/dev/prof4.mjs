import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
await p.goto('file://' + path.resolve('dist/present-perfect.html')); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 90000 });
const r = await p.evaluate(() => {
  const run = (label) => { const ms = []; for (let t = 1; t <= Eng.duration; t += 0.5) { const a = performance.now(); Eng.draw(t); Eng.ctx.getImageData(0, 0, 1, 1); ms.push(performance.now() - a); } const s = [...ms].sort((x, y) => x - y); return label + ' avg=' + (ms.reduce((x, y) => x + y, 0) / ms.length).toFixed(1) + ' p95=' + s[Math.floor(s.length * .95)].toFixed(1) + ' max=' + s[s.length - 1].toFixed(1); };
  const ws = window.withShadow; const out = [];
  window.withShadow = (ctx, c, bl, dx, dy, fn) => { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 0; ctx.shadowOffsetX = dx * 0.6; ctx.shadowOffsetY = dy * 0.6; fn(); ctx.restore(); }; out.push(run('hard offset shadow'));
  window.withShadow = (ctx, c, bl, dx, dy, fn) => { ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = Math.min(bl, 5); ctx.shadowOffsetX = dx; ctx.shadowOffsetY = dy; fn(); ctx.restore(); }; out.push(run('blur capped at 5   '));
  window.withShadow = ws; out.push(run('current            '));
  return out;
});
console.log(r.join('\n')); await b.close();
