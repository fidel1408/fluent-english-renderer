// usage: node tools/segshots.mjs OUTDIR id:frac,id:frac ...   (renders a still of each segment at a fraction of its duration)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'); const out = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto('file://' + path.join(root, 'release/index.html')); await p.waitForTimeout(800);
await p.evaluate(() => { document.getElementById('startVeil').remove(); FE.R.started = true; });
for (const spec of process.argv[3].split(',')) {
  const [id, fr = '0.6'] = spec.split(':');
  const r = await p.evaluate(([id, fr]) => { const i = FE.L.segs.findIndex(s => s.id === id); const c = FE.compileSeg(FE.L.segs[i]); FE.R.load(i, FE.L.segs[i].filmDur * fr); return [i, c.dur]; }, [id, +fr]);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/s_${id}.png` });
}
await b.close();
