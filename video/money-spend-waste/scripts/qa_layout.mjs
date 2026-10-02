// Layout QA: for sampled times and all 3 CC modes, checks that captions / English cards / hook phrases / logo / CTA
// stay inside the platform-safe area (x 60–1020, y 240–1585) and that captions never overlap the logo, CTA, or cards.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf' };
const server = createServer((req, res) => { const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html'); if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); }).listen(0);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`http://localhost:${server.address().port}/index.html?export=1`); await p.waitForFunction('window.__ready===true');
const SAFE = { x0: 60, x1: 1020, y0: 235, y1: 1585 };
let problems = 0, checked = 0;
for (const mode of [0, 1, 2]) for (let t = 0; t <= 28.8; t += 0.1) {
  await p.evaluate(([t, m]) => window.__frame(t, m), [t, mode]);
  const items = await p.evaluate(() => [...document.querySelectorAll('[data-ui]')].map(e => { const r = e.getBoundingClientRect(); const op = parseFloat(e.getAttribute('opacity') ?? '1'); return { k: e.dataset.ui, x0: r.left, x1: r.right, y0: r.top, y1: r.bottom, op }; }));
  for (const it of items.filter(i => i.op > 0.9)) {
    checked++;
    if (it.x0 < SAFE.x0 || it.x1 > SAFE.x1 || it.y0 < SAFE.y0 || it.y1 > SAFE.y1) { problems++; if (problems < 14) console.log(`OUTSIDE SAFE t=${t.toFixed(1)} mode=${mode} ${it.k}`, JSON.stringify(it)); }
  }
  const caps = items.filter(i => i.k === 'caption' && i.op > .9), others = items.filter(i => ['card', 'logo', 'cta', 'hookcard'].includes(i.k) && i.op > .9);
  for (const c of caps) for (const o of others) if (c.x0 < o.x1 && c.x1 > o.x0 && c.y0 < o.y1 && c.y1 > o.y0) { problems++; if (problems < 12) console.log(`OVERLAP t=${t.toFixed(1)} mode=${mode} caption/${o.k}`); }
}
console.log(`layout QA: ${checked} element checks, ${problems} problem(s)`);
await b.close(); server.close(); process.exit(problems ? 1 : 0);
