import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
await p.goto('file://' + path.resolve('dist/present-perfect.html')); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 90000 });
const r = await p.evaluate(() => {
  const run = (label) => { const ms = []; const slow = []; for (let t = 1; t <= Eng.duration; t += 0.5) { const a = performance.now(); Eng.draw(t); Eng.ctx.getImageData(0, 0, 1, 1); const d = performance.now() - a; ms.push(d); if (d > 50) slow.push([t, Math.round(d)]); } const s = [...ms].sort((x, y) => x - y); return label + ' n=' + ms.length + ' avg=' + (ms.reduce((x, y) => x + y, 0) / ms.length).toFixed(1) + ' p50=' + s[s.length >> 1].toFixed(1) + ' p95=' + s[Math.floor(s.length * .95)].toFixed(1) + ' max=' + s[s.length - 1].toFixed(1) + ' slow>50ms=' + slow.length + (slow.length ? ' e.g. ' + JSON.stringify(slow.slice(0, 6)) : ''); };
  const out = [`canvas ${Eng.canvas.width}x${Eng.canvas.height}`, run('with shadows (current)')];
  const ws = window.withShadow; window.withShadow = (ctx, c, bl, dx, dy, fn) => fn(); out.push(run('shadowBlur disabled   '));
  window.withShadow = ws; return out;
});
console.log(r.join('\n')); await b.close();
