// Plays the built lesson in headless Chromium over http and checks multi-part audio switching + controls.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = process.env.URL || 'http://127.0.0.1:8765/index.html';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--use-fake-device-for-media-stream', '--mute-audio'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(url); await p.waitForFunction('document.getElementById("loader").hidden', null, { timeout: 60000 });
const info = await p.evaluate(() => ({ dur: window.__lesson.dur, parts: window.__lesson.parts.length, ch: document.querySelectorAll('.chap').length, stars: document.querySelectorAll('#marks .star').length, missing: [...window.__missingIPA] }));
console.log('boot', JSON.stringify(info));
await p.evaluate("window.__lesson.apMode='off'");
const cuts = await p.evaluate("window.__lesson.parts.map(x=>x.t0)");
let bad = 0;
for (const c of cuts.slice(1, 3)) {
  await p.evaluate(`window.__lesson.seek(${c - 2.0}); window.__lesson.play()`);
  const samples = [];
  for (let k = 0; k < 8; k++) { await p.waitForTimeout(500); samples.push(await p.evaluate(() => ({ t: +window.__lesson.t.toFixed(2), playing: window.__lesson.playing }))); }
  await p.evaluate('window.__lesson.pause()');
  console.log('cross', c.toFixed(1), samples.map(s => s.t).join(' '));
}
// audio element state after crossing: is a part element actually playing and aligned?
await p.evaluate(`window.__lesson.seek(${cuts[1] - 1.0}); window.__lesson.play()`);
await p.waitForTimeout(3500);
const st = await p.evaluate(() => ({ t: window.__lesson.t, a: window.__lesson.audioState(), parts: window.__lesson.parts[1].t0 }));
console.log('after', JSON.stringify(st));
await p.evaluate('window.__lesson.pause()');
// controls
await p.click('#nextAct'); const t1 = await p.evaluate('window.__lesson.t'); await p.click('#prevAct'); const t2 = await p.evaluate('window.__lesson.t');
console.log('next/prev activity', t1.toFixed(1), t2.toFixed(1));
console.log('errors', JSON.stringify(errs));
await p.screenshot({ path: 'dev/out/player.png' });
await b.close();
