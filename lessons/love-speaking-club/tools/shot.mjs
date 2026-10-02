// Usage: node tools/shot.mjs <url> <out.png> [width height] [--js "code to eval before shot"] [--wait ms]
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const args = process.argv.slice(2);
const url = args[0], out = args[1];
const w = parseInt(args[2] || '1600'), h = parseInt(args[3] || '900');
const jsIdx = args.indexOf('--js'); const js = jsIdx > -1 ? args[jsIdx + 1] : null;
const wIdx = args.indexOf('--wait'); const wait = wIdx > -1 ? parseInt(args[wIdx + 1]) : 400;
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
page.on('console', m => { if (m.type() === 'error' || m.type()==='warning') console.log('[console.' + m.type() + ']', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForTimeout(wait);
if (js) { await page.evaluate(js); await page.waitForTimeout(wait); }
await page.screenshot({ path: out });
await browser.close();
