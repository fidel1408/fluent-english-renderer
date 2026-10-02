import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(process.env.URL); await p.waitForFunction('document.getElementById("loader").hidden', null, { timeout: 60000 });
await p.selectOption('#chapSel', '3'); await p.waitForTimeout(800);
const t = await p.evaluate('window.__lesson.t'); await p.click('#btnPlay'); await p.waitForTimeout(600); await p.click('#btnPlay');
await p.click('#settings summary'); await p.waitForTimeout(200);
await p.screenshot({ path: 'dev/out/menu.png' });
console.log({ chapterJumpTo: t.toFixed(1), errs }); await b.close();
