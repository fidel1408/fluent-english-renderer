// Full-timeline sweep: draws a frame every STEP seconds in the built page, reports exceptions, text-geometry problems and frame cost.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = process.env.URL || 'http://127.0.0.1:8765/index.html', STEP = +(process.env.STEP || 2);
const b = await chromium.launch({ args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url); await p.waitForFunction('document.getElementById("loader").hidden', null, { timeout: 60000 });
const r = await p.evaluate(async (STEP) => {
  const out = { n: 0, ex: [], ms: [], nan: 0 }; const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  for (let t = 0; t < Eng.duration; t += STEP) {
    const t0 = performance.now();
    try { Eng.draw(t); ctx.getImageData(0, 0, 1, 1); } catch (e) { out.ex.push(t.toFixed(1) + ': ' + e.message); }
    out.ms.push(performance.now() - t0); out.n++;
    if (out.n % 100 === 0) await new Promise(r => setTimeout(r, 0));
  }
  out.ms.sort((a, b) => a - b); const q = f => out.ms[Math.floor(out.ms.length * f)];
  return { n: out.n, ex: out.ex.slice(0, 10), nex: out.ex.length, avg: out.ms.reduce((a, b) => a + b, 0) / out.ms.length, p95: q(0.95), max: out.ms[out.ms.length - 1], missing: [...window.__missingIPA] };
}, STEP);
console.log(JSON.stringify(r)); console.log('page errors', JSON.stringify(errs));
await b.close();
