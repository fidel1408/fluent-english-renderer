// node tools/tour2.mjs outdir '[{"c":3,"s":1,"js":"..."}]' [mode] [w] [h]
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2]; const list = JSON.parse(process.argv[3]); const mode = process.argv[4] || 'class'; const vw = +(process.argv[5] || 1600), vh = +(process.argv[6] || 900);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: vw, height: vh } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message)); page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
await page.goto('file://' + path.resolve(here, '..', 'index.html') + '?skipstart=1&fresh=1'); await page.waitForTimeout(600);
await page.evaluate((m) => window.FE.setMode(m), mode);
for (const e of list) {
  await page.evaluate(([c, s]) => { window.Lesson.go(c, s, { rebuild: true }); }, [e.c, e.s]);
  await page.waitForTimeout(e.wait || 900);
  if (e.js) { await page.evaluate(e.js); await page.waitForTimeout(e.wait2 || 1500); }
  
  await page.screenshot({ path: path.join(out, e.name || `c${e.c}_s${e.s}.png`) });
}
await browser.close();
