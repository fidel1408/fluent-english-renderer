// Exercises every chapter, step, branch, drawer and mode of the lesson in headless Chromium and records every
// English token that was rendered through I() (the IPA word-unit renderer).  Output: tools/cache/words.json
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const url = 'file://' + path.resolve(here, '..', 'index.html') + '?skipstart=1&fresh=1';
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url); await page.waitForTimeout(800);
const SKIP = new Set(['next', 'skip', 'restart', 'again', 'expJson', 'expCsv', 'clearRec', 'draw', 'nextSpk']);
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const L = window.Lesson;
  const SKIPA = new Set(['next', 'skip', 'restart', 'again', 'expJson', 'expCsv', 'clearRec', 'nextSpk']);
  async function clickAll() {
    const done = new Set();
    for (let iter = 0; iter < 120; iter++) {
      const els = Array.from(document.querySelectorAll('#ui [data-act]'));
      const el = els.find((e) => !SKIPA.has(e.dataset.act) && !done.has(e.dataset.act + '|' + (e.dataset.arg || '')));
      if (!el) break; done.add(el.dataset.act + '|' + (el.dataset.arg || ''));
      try { L.act(el, {}); } catch (e) { /* ignore */ }
      await sleep(12);
    }
  }
  for (const mode of ['class', 'demo']) {
    window.FE.setMode(mode);
    for (let ci = 0; ci < L.chapters.length; ci++) {
      const ch = L.chapters[ci];
      for (let st = 0; st < ch.steps; st++) {
        L.go(ci, st, { rebuild: st === 0 }); await sleep(60);
        if (ci === 0 && st === 0) { ch.finish(L.ctx); }
        await clickAll();
        if (ci === 8) { for (let q = 0; q < 10; q++) { L.ctx.S.q = q; L.ctx.S.started = true; for (let s = 0; s < 3; s++) { L.ctx.S.stage = s; L.refresh(); } } }
      }
    }
  }
  for (const d of ['chapters', 'words', 'starters', 'timer', 'sound', 'mode']) { window.Drawers.show(d); await sleep(30); }
  window.Drawers.close();
});
const words = await page.evaluate(() => ({ seen: window.I.seen(), missing: window.I.missing() }));
// static walk of lesson content (display strings only)
const lc = await page.evaluate(() => {
  const out = []; const skipKeys = new Set(['id', 'scene', 'who', 'kind', 'f', 'VOICES']);
  (function walk(o, k) { if (o === window.LC.VOICES) return; if (typeof o === 'string') { if (!skipKeys.has(k) && !/^[a-z]\d[a-z]?$/.test(o)) out.push(o); } else if (Array.isArray(o)) o.forEach((x) => walk(x, k)); else if (o && typeof o === 'object') for (const kk in o) walk(o[kk], kk); })(window.LC);
  out.forEach((s) => window.I(s)); return window.I.seen();
});
fs.mkdirSync(path.resolve(here, 'cache'), { recursive: true });
const all = Array.from(new Set([...words.seen, ...lc])).sort();
fs.writeFileSync(path.resolve(here, 'cache', 'words.json'), JSON.stringify(all, null, 1));
console.log('unique tokens:', all.length);
await browser.close();
