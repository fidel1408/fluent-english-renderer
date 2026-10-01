import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
await p.goto('file://' + path.resolve('dist/present-perfect.html')); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 90000 });
const r = await p.evaluate(() => {
  const times = []; for (let t = 1; t <= Eng.duration; t += 1.0) times.push(t);
  const measure = (label, patch) => { const undo = patch(); const ms = []; for (const t of times) { const a = performance.now(); Eng.draw(t); Eng.ctx.getImageData(0, 0, 1, 1); ms.push(performance.now() - a); } undo(); return label + ' avg=' + (ms.reduce((x, y) => x + y, 0) / ms.length).toFixed(1); };
  const keep = (name) => { const o = Eng[name]; return [o, () => { Eng[name] = o; }]; };
  const out = [];
  out.push(measure('everything          ', () => () => {}));
  out.push(measure('no overlay          ', () => { const o = Eng.drawOverlay; Eng.drawOverlay = () => {}; return () => { Eng.drawOverlay = o; }; }));
  out.push(measure('no chrome (cap/logo)', () => { const o = Eng.drawChrome; Eng.drawChrome = () => {}; return () => { Eng.drawChrome = o; }; }));
  out.push(measure('no scene+cast       ', () => { const o = Eng.drawScene; Eng.drawScene = () => {}; return () => { Eng.drawScene = o; }; }));
  out.push(measure('scene bg only (no cast)', () => { const o = window.drawFigure; window.drawFigure = () => {}; return () => { window.drawFigure = o; }; }));
  return out;
});
console.log(r.join('\n')); await b.close();
