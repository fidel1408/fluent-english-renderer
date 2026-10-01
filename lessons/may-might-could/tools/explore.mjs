// QA harness: node tools/explore.mjs [--shots dir] [--only 1.2,2.3]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const shotDir = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
await p.goto('file://' + path.join(root, 'release/index.html')); await p.waitForTimeout(800); console.log('LOAD ERRORS:', errs);
const info = await p.evaluate(() => { const total = FE.plan(); return { total, chapters: FE.L.chapters.map((c) => ({ n: c.n, len: c.e - c.s, rest: Math.round(c.rest), fits: c.fits })), segs: FE.L.segs.map((s) => ({ id: s.id, plan: s.plan, film: +s.filmDur.toFixed(1), act: +s.actDur.toFixed(1), hasAct: !!s.act })) }; });
console.log('TOTAL PLAN', info.total); console.log(JSON.stringify(info.chapters));
for (const [i, s] of info.segs.entries()) {
  if (only && !only.includes(s.id)) continue;
  const r = await p.evaluate(async (i) => {
    const S = FE.L.segs[i];
    FE.R.load(i, Math.max(0.5, S.filmDur * 0.5));
    await new Promise((r) => setTimeout(r, 120));
    FE.R.load(i, S.filmDur + 0.5);
    await new Promise((r) => setTimeout(r, 200));
    const clk = (sel) => FE.$$(sel).forEach((e) => e.click());
    for (let k = 0; k < 14; k++) {
      clk('#fx_act [data-opt]'); clk('#fx_act [data-do="check"]'); clk('#fx_act [data-do="hint"]'); clk('#fx_act [data-do="sup"]'); clk('#fx_act [data-do="model"]'); clk('#fx_act [data-do="ex"]');
      clk('#fx_act [data-do="reveal"]'); clk('#fx_act [data-do="nextq"]'); clk('#fx_act [data-do="add"]'); clk('#fx_act [data-do="sort"]');
      if (k === 6) { clk('#fx_act [data-do="check"]'); }
    }
    return { act: !!FE.$('#fx_act'), text: (FE.$('#fx_act') || { innerText: '' }).innerText.length };
  }, i);
  if (shotDir) {
    await p.evaluate((i) => { FE.R.load(i, FE.L.segs[i].filmDur * 0.55); }, i); await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(shotDir, `s${s.id}_film.png`) });
    if (s.hasAct) { await p.evaluate((i) => { FE.R.load(i, FE.L.segs[i].filmDur + 0.5); }, i); await p.waitForTimeout(500); await p.screenshot({ path: path.join(shotDir, `s${s.id}_act.png`) }); }
  }
}
const miss = await p.evaluate(() => [...FE.ipaMissing].sort());
console.log('MISSING IPA (' + miss.length + '):', miss.join(' ')); const ctx = await p.evaluate(() => FE.ipaCtx); fs.writeFileSync(path.join(root, 'tools/.missing.json'), JSON.stringify({ miss, ctx }, null, 1));
console.log('ERRORS:', errs.length ? errs.slice(0, 12) : 'none');
fs.writeFileSync(path.join(root, 'tools/.plan.json'), JSON.stringify(info, null, 1));
await b.close();
