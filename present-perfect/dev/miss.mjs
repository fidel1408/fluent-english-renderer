import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{ width:1920, height:1080 } });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto('file://' + path.resolve(process.env.PAGE || 'dev/play.html'));
await p.waitForFunction('window.__done||window.__err', null, { timeout: 30000 });
console.log('missing', JSON.stringify(await p.evaluate('[...window.__missingIPA]')));
await b.close();
