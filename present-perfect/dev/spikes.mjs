import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
await p.goto('file://' + path.resolve('dist/present-perfect.html')); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 90000 });
const r = await p.evaluate(() => { const spikes = []; const all = []; for (let pass = 0; pass < 2; pass++) for (let t = 0; t <= Eng.duration; t += 0.2) { const a = performance.now(); Eng.draw(t); const d = performance.now() - a; all.push(d); if (d > 40) spikes.push([pass, +t.toFixed(1), Math.round(d)]); } all.sort((x, y) => x - y); return { spikes, median: all[all.length >> 1].toFixed(1), p99: all[Math.floor(all.length * .99)].toFixed(1), n: all.length }; });
console.log(JSON.stringify(r)); await b.close();
