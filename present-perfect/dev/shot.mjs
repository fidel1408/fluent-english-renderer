import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [,, url, out, w='1920', h='1080', wait='300'] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] }).catch(async()=>chromium.launch({args:['--no-sandbox']}));
const p = await b.newPage({ viewport:{ width:+w, height:+h } });
p.on('console', m => { if (['error','warning'].includes(m.type())) console.log('[console.'+m.type()+']', m.text()); });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(url); await p.waitForTimeout(+wait);
await p.screenshot({ path: out });
await b.close();
