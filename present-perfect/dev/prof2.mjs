import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
await p.goto('file://' + path.resolve('dist/present-perfect.html')); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 90000 });
const r = await p.evaluate(() => {
  const log = []; const T = (n, f) => { const a = performance.now(); const v = f(); return [n, Math.round(performance.now() - a)]; };
  const dS = Eng.drawScene.bind(Eng), dO = Eng.drawOverlay.bind(Eng), dC = Eng.drawChrome.bind(Eng);
  let acc = {}; Eng.drawScene = (...a) => { const t0 = performance.now(); dS(...a); acc.scene = (acc.scene || 0) + performance.now() - t0; };
  Eng.drawOverlay = (...a) => { const t0 = performance.now(); dO(...a); acc.overlay = (acc.overlay || 0) + performance.now() - t0; };
  Eng.drawChrome = (...a) => { const t0 = performance.now(); dC(...a); acc.chrome = (acc.chrome || 0) + performance.now() - t0; };
  for (const t of [14.0, 14.8, 15.0, 15.0, 15.2, 15.6, 24.5, 25.0, 25.2, 25.2, 25.6]) { acc = {}; const a = performance.now(); Eng.draw(t); const tot = performance.now() - a; log.push(t + ': total ' + Math.round(tot) + ' ' + JSON.stringify(Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, Math.round(v)])))); }
  return log;
});
console.log(r.join('\n')); await b.close();
