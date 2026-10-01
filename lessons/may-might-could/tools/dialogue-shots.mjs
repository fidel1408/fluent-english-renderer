import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'); const out = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + path.join(root, 'release/index.html')); await p.waitForTimeout(800);
await p.evaluate(() => { document.getElementById('startVeil').remove(); FE.R.started = true; });
const list = await p.evaluate(() => { const o = []; FE.L.segs.forEach((s, i) => FE.compileSeg(s).speech.filter((q) => q.kind === 'say').forEach((q) => o.push([i, s.id, q.who, q.t0 + (q.t1 - q.t0) * 0.55]))); return o; });
let n = 0; const want = new Set(process.argv[3].split(','));
for (const [i, id, who, t] of list) { if (!want.has(id + ':' + who)) continue; await p.evaluate(([i, t]) => { FE.R.load(i, t); }, [i, t]); await p.waitForTimeout(450); await p.screenshot({ path: `${out}/d${String(n++).padStart(2, '0')}_${id}_${who}.png` }); }
console.log(n, 'shots'); await b.close();
