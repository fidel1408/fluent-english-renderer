// Dev helper: render still frames of the scenes for visual review.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';
const out = process.argv[2] || 'out/shots'; fs.mkdirSync(out, { recursive: true });
const shots = JSON.parse(process.argv[3] || '[]');
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('http://127.0.0.1:8123/index.html?export=1');
await page.evaluate(() => FE.exp.init());
for (const s of shots) {
  const url = await page.evaluate(([beats, t, cc, kind]) => FE.exp.frame(beats, t, cc, kind), [s.beats, s.t, s.cc ?? 2, s.kind]);
  fs.writeFileSync(`${out}/${s.name}.png`, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
