import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const url = 'file://' + path.resolve('dist/present-perfect.html');
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text()); });
await p.goto(url); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 60000 });
console.log('loaded; missing IPA:', await p.evaluate('[...window.__missingIPA].join(",")||"none"'), '| duration', await p.evaluate('window.__lesson.dur.toFixed(1)'));
await p.screenshot({ path: 'dev/out/ui_idle.png' });
// play for ~3 s via the real button
await p.click('#btnPlay'); await p.waitForTimeout(3000);
const t1 = await p.evaluate('window.__lesson.t'); const playing = await p.evaluate('window.__lesson.playing'); const at = await p.evaluate('document.querySelector("audio")?1:0');
console.log('after 3s of real playback: t =', t1.toFixed(2), 'playing', playing);
await p.screenshot({ path: 'dev/out/ui_playing.png' });
await p.click('#btnPlay'); const tp = await p.evaluate('window.__lesson.t'); await p.waitForTimeout(500); const tp2 = await p.evaluate('window.__lesson.t');
console.log('paused: t stays', tp.toFixed(2), '->', tp2.toFixed(2), 'raf running?', await p.evaluate('window.__lesson.playing'));
// chapter button
const chs = await p.$$('.chap'); console.log('chapters:', chs.length);
await chs[3].click(); await p.waitForTimeout(400); console.log('after chapter 4 click t =', (await p.evaluate('window.__lesson.t')).toFixed(1));
await p.click('#btnPlay'); await p.waitForTimeout(300);
// scrub
await p.evaluate('window.__lesson.pause()'); await p.evaluate('window.__lesson.seek(120)'); console.log('seek 120 ->', (await p.evaluate('window.__lesson.t')).toFixed(1));
console.log('errors:', errs.length ? errs.join('\n') : 'none');
await b.close();
