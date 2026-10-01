// usage: node dev/frames.mjs out_prefix t1 t2 t3 ...   (renders frames of dev/play.html or a given page)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const [,, prefix, ...ts] = process.argv;
const page_ = process.env.PAGE || 'dev/play.html';
const b = await chromium.launch({ args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{ width:1920, height:1080 } });
p.on('console', m => { if (['error','warning'].includes(m.type())) console.log('[console.'+m.type()+']', m.text()); });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto('file://' + path.resolve(page_));
await p.waitForFunction('window.__done||window.__err', null, { timeout: 30000 });
const err = await p.evaluate('window.__err'); if (err) { console.log('BOOT ERROR', err); await b.close(); process.exit(1); }
const miss = await p.evaluate('[...window.__missingIPA].join(",")'); if (miss) console.log('missing IPA:', miss);
for (const t of ts) { await p.evaluate(`window.renderAt(${t})`); await p.screenshot({ path: `${prefix}_${String(t).replace('.','_')}.png` }); }
await b.close();
