import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
await p.goto('file://' + path.resolve('dist/present-perfect.html')); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 90000 });
const r = await p.evaluate(() => {
  const times = [15.0, 25.2, 60.0, 73.0, 262.6];
  const meas = (label) => { const o = {}; for (const t of times) { Eng.draw(t); const a = performance.now(); for (let i = 0; i < 3; i++) Eng.draw(t); o[t] = Math.round((performance.now() - a) / 3); } return label + ' ' + JSON.stringify(o); };
  const out = []; out.push(meas('baseline'));
  const ws = window.withShadow; window.withShadow = (ctx, c, bl, dx, dy, fn) => fn(); out.push(meas('no shadowBlur'));
  window.withShadow = ws;
  // also test: only scene (no overlay)
  const dO = Eng.drawOverlay; Eng.drawOverlay = () => {}; out.push(meas('no overlay')); Eng.drawOverlay = dO;
  const dS = Eng.drawScene; Eng.drawScene = () => {}; out.push(meas('no scene')); Eng.drawScene = dS;
  return out;
});
console.log(r.join('\n')); await b.close();
