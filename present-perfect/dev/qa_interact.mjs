import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = process.env.URL || 'http://127.0.0.1:8765/index.html';
const b = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(url); await p.waitForFunction('document.getElementById("loader").hidden', null, { timeout: 60000 });
const R = {};
// 1. choose: click option 2 of q_form item 0 during the hold; pick must show in the slot, then reveal shows the right answer
R.choose = await p.evaluate(() => {
  const a = ACTIVITIES.find(x => x.id === 'q_form'), h = Eng.LINE[a.items[0].h], t = (h.t0 + h.t1) / 2;
  window.__lesson.seek(t); const hot = Eng.hot.map(x => ({ x: x.x + x.w / 2, y: x.y + x.h / 2 })); const clicked = hot.length && Eng.click(hot[0].x, hot[0].y);
  const g = Eng.groups.find(g => g.id === 'q_form'); const pick = g.S.pick[0];
  return { nhot: hot.length, clicked, pick };
});
// 2. sort: click bin 1 during the hold of item 1
R.sort = await p.evaluate(() => {
  const a = ACTIVITIES.find(x => x.id === 'sort_fs'), h = Eng.LINE[a.items[1].h], t = (h.t0 + h.t1) / 2;
  window.__lesson.seek(t); const n = Eng.hot.length; const hit = Eng.hot[1]; const ok = hit && Eng.click(hit.x + 5, hit.y + 5);
  const g = Eng.groups.find(g => g.id === 'sort_fs'); return { nhot: n, ok, pick: g.S.pick[1] };
});
// 3. auto-pause modes: play across the first item hold of q_form, then the second
async function run(mode, itemIdx) {
  return p.evaluate(async ({ mode, itemIdx }) => {
    const L = window.__lesson, a = ACTIVITIES.find(x => x.id === 'q_form'), h = Eng.LINE[a.items[itemIdx].h]; L.apMode = mode;
    L.seek(h.t0 - 2.0); L.play(); await new Promise(r => setTimeout(r, 4200)); const st = { playing: L.playing, t: +L.t.toFixed(2), expect: +(h.t0 + 0.15).toFixed(2) }; L.pause(); return st;
  }, { mode, itemIdx });
}
R.pauseRoundItem0 = await run('round', 0); R.pauseRoundItem1 = await run('round', 1); R.pauseItemItem1 = await run('item', 1); R.pauseOffItem0 = await run('off', 0);
console.log(JSON.stringify(R, null, 1)); console.log('errors', JSON.stringify(errs)); await b.close();
