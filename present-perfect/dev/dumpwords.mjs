import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const b = await chromium.launch({ args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{ width:1920, height:1080 } });
p.on('pageerror', e => console.log('[pageerror]', e.message));
p.on('console', m => { if (m.type()==='error') console.log('[console.error]', m.text()); });
await p.goto('file://' + path.resolve(process.env.PAGE || 'dev/play.html'));
await p.waitForFunction('window.__done||window.__err', null, { timeout: 30000 });
const err = await p.evaluate('window.__err'); if (err) { console.log('BOOT ERROR', err); process.exit(1); }
const w = await p.evaluate('[...window.__usedWords]'); fs.writeFileSync('build/words.json', JSON.stringify(w)); console.log(w.length, 'words');
await b.close();
