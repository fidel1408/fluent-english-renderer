import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const url = 'file://' + path.resolve('dist/present-perfect.html');
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1600, height: 960 } });
const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url); await p.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 60000 });

// 1) full-timeline sweep: draw every 0.2 s, record cost
const sweep = await p.evaluate(() => {
  const ms = []; const bad = [];
  for (let t = 0; t <= Eng.duration; t += 0.2) { const a = performance.now(); try { Eng.draw(t); } catch (e) { bad.push(t.toFixed(1) + ' ' + e.message); } ms.push(performance.now() - a); }
  ms.sort((x, y) => x - y); const avg = ms.reduce((s, x) => s + x, 0) / ms.length;
  return { n: ms.length, avg: avg.toFixed(1), p95: ms[Math.floor(ms.length * 0.95)].toFixed(1), max: ms[ms.length - 1].toFixed(1), bad };
});
console.log('sweep', JSON.stringify(sweep));

// 2) caption + text geometry audit
const audit = await p.evaluate(() => {
  const out = { captions: 0, wide: [], multiline: [], overflowUnits: 0 };
  for (const b of TIMELINE.beats) for (const l of b.lines) if (l.phrases) for (const ph of l.phrases) { const c = capBlock(ph.text); out.captions++; if (c.F.lines.length > 1) out.multiline.push(ph.text); if (c.w + 76 > 1560) out.wide.push(ph.text + ' ' + Math.round(c.w)); }
  let units = 0, centred = 0; for (const [k, L] of _lay) for (const u of L.units) { units++; if (u.w >= u.iw && u.w >= u.ww) centred++; else out.overflowUnits++; }
  out.units = units; out.unitsSized = centred; out.layouts = _lay.size; out.words = __usedWords.size;
  return out;
});
console.log('audit', JSON.stringify(audit));

// 3) interaction: check 1 (thinking window ~ 70-76 s). pick option with keyboard + mouse, reveal, auto-pause
const t = await p.evaluate(() => ({ q: Eng.LINE.k1q.t0, h: Eng.LINE.k1h.t0, a: Eng.LINE.k1a.t0 }));
await p.evaluate(`window.__lesson.seek(${t.q + 3})`);
await p.keyboard.press('3'); await p.waitForTimeout(200);
const pickKey = await p.evaluate(() => Eng.groups.find(g => g.id === 'chk1').S.pick);
// click option 2 with the mouse at the canvas position of the 2nd button
const box = await p.locator('#cv').boundingBox();
const hot = await p.evaluate(() => Eng.hot.map(h => ({ x: h.x + h.w / 2, y: h.y + h.h / 2 })));
await p.mouse.click(box.x + hot[1].x / 1920 * box.width, box.y + hot[1].y / 1080 * box.height); await p.waitForTimeout(200);
const pickMouse = await p.evaluate(() => Eng.groups.find(g => g.id === 'chk1').S.pick);
console.log('hot options', hot.length, '| key 3 ->', pickKey, '| mouse option 2 ->', pickMouse);
await p.evaluate(`window.__lesson.seek(${t.a + 1.2})`); await p.screenshot({ path: 'dev/out/qa_check_reveal.png' });
// auto-pause: seek just before the thinking window and play
await p.evaluate(`window.__lesson.seek(${t.h - 1.5})`); await p.click('#btnPlay'); await p.waitForTimeout(2600);
const ap = await p.evaluate(() => ({ playing: __lesson.playing, t: __lesson.t })); console.log('auto-pause at practice point: playing', ap.playing, 't', ap.t.toFixed(2), 'expected ~', (t.h + 0.15).toFixed(2));
await p.screenshot({ path: 'dev/out/qa_autopause.png' });
// continue and reveal happens
await p.click('#btnPlay'); await p.waitForTimeout(1200); console.log('resumed, playing', await p.evaluate('__lesson.playing'));
// 4) hidden tab pauses
await p.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
console.log('hidden tab -> playing', await p.evaluate('__lesson.playing'));
console.log('errors:', errs.length ? errs.join('\n') : 'none');
await b.close();
