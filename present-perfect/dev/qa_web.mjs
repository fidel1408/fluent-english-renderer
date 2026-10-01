import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] }); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('http://localhost:8766/_hosttest.html'); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 60000 });
await p.click('#btnPlay'); await p.waitForTimeout(2500);
const r = await p.evaluate(() => ({ t: __lesson.t, playing: __lesson.playing, audioOK: __lesson.audioOK, missing: [...__missingIPA].length }));
await p.evaluate('__lesson.pause(); __lesson.seek(100)'); const t2 = await p.evaluate('__lesson.t');
console.log(JSON.stringify(r), 'seek ->', t2, 'errors:', errs.length ? errs : 'none'); await p.screenshot({ path: 'dev/out/web_ok.png' }); await b.close();
