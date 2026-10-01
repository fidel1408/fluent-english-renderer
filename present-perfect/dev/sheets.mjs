import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const b = await chromium.launch({ args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1200 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.resolve('dist/present-perfect.html')); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 90000 });
const beats = await p.evaluate(() => TIMELINE.beats.map(b => { const ls = b.lines.filter(l => l.kind !== 'hold'); const last = b.check ? b.lines[b.lines.length - 1] : ls[ls.length - 1]; return { id: b.id, t: Math.min(b.t1 - 0.2, (b.check ? last.t0 + 1.4 : (b.t0 + (b.t1 - b.t0) * 0.72))) }; }));
let i = 0;
for (const bt of beats) { await p.evaluate(t => __lesson.seek(t), bt.t); const url = await p.evaluate(() => document.getElementById('cv').toDataURL('image/png')); fs.writeFileSync(`dev/out/final/${String(i++).padStart(2, '0')}_${bt.id}.png`, Buffer.from(url.split(',')[1], 'base64')); }
console.log(beats.length, 'frames; errors:', errs.length ? errs : 'none', '; canvas px', await p.evaluate('document.getElementById("cv").width'));
await b.close();
