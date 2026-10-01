// usage: node shot.mjs <url|file> <out.png> [wait-ms] [js-to-eval] [w] [h]
import { chromium } from 'playwright-core';
const [,, target, out, wait='500', js='', w='1920', h='1080'] = process.argv;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport:{ width:+w, height:+h } });
p.on('console', m => { const t=m.text(); if (m.type()==='error'||m.type()==='warning'||t.startsWith('LOG')) console.log('[console]', m.type(), t); });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto(target.startsWith('http')||target.startsWith('file:')? target : 'file://'+process.cwd()+'/'+target);
await p.waitForTimeout(+wait);
if (js) { const r = await p.evaluate(js); if (r!==undefined) console.log(JSON.stringify(r)); await p.waitForTimeout(400); }
await p.screenshot({ path: out });
await b.close();
