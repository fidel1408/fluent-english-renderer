// usage: node tools/frames.mjs outDir scene:st[:cc[:cap]] ...   -> PNG per frame (canvas pixels)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [,, out, ...specs] = process.argv; mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 700, height: 1000 } });
p.on('console', m => { if (m.type() !== 'log' || !m.text().startsWith('[')) console.log('[console]', m.text()); }); p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto('file://' + join(root, 'index.html')); await p.waitForTimeout(1200);
for (const s of specs) {
  const [sc, st, cc = '0', cap = ''] = s.split(':');
  await p.evaluate(([sc, st, cc, cap]) => { __fe.seek(+sc, +st, { cc: +cc, cap: cap || null, mouth: true, debug: false }); }, [sc, st, cc, cap]);
  await p.waitForTimeout(120);
  const data = await p.evaluate(() => document.getElementById('stage').toDataURL('image/png'));
  writeFileSync(join(out, `s${sc}_${st}_cc${cc}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
await b.close();
