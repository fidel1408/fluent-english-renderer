// quick dev check: load built html, jump to a time, screenshot.  node tools/dev.mjs <seconds> <out.png> [js]
import { chromium } from 'playwright-core';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [,, t='0', out='/tmp/dev.png', js='', w='1920', h='1080', start='1'] = process.argv;
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{ width:+w, height:+h } });
p.on('console', m => { if (['error','warning'].includes(m.type())) console.log('[console]', m.type(), m.text().slice(0,400)); });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto('file://' + root + '/dist/should-for-advice.html');
await p.waitForTimeout(500);
if (start==='1') { await p.evaluate(() => { FE.qa = true; document.getElementById('startBtn').click(); }); await p.waitForTimeout(300); await p.evaluate((t) => { FE.engine.setPlaying(false); FE.engine.goto(+t); }, t); }
await p.addStyleTag({ content: '#toast{display:none!important}' }); await p.waitForTimeout(900);
if (js) { const r = await p.evaluate(js); if (r !== undefined) console.log(JSON.stringify(r)); await p.waitForTimeout(500); }
await p.screenshot({ path: out });
console.log('missing IPA:', JSON.stringify(await p.evaluate(() => [...FE.missing])));
await b.close();
