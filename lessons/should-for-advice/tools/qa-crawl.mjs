// Visits every segment (start / middle / end, reveal, every activity item). Reports script errors, missing IPA, empty IPA, layout issues.
import { chromium } from 'playwright-core';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shots = process.argv.includes('--shots'); const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
p.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await p.goto('file://' + root + '/dist/should-for-advice.html'); await p.waitForTimeout(500);
await p.evaluate(() => { FE.qa = true; document.getElementById('startBtn').click(); FE.engine.setPlaying(false); });
const ids = await p.evaluate(() => FE.segs.map((s) => [s.id, s.start, s.dur, s.title]));
const report = [];
fs.mkdirSync('/tmp/shots', { recursive: true });
for (const [id, start, dur] of ids) {
  if (only && id !== only) continue;
  const r = await p.evaluate(async ([id, start, dur]) => {
    const out = { id, errs: [], emptyIpa: 0, missing: [] };
    try {
      FE.engine.goto(start + 0.01); const S = FE.engine.scene;
      (S.ctls || []).forEach((c) => { if (c.items && c.goto) c.items.forEach((_, i) => { try { c.goto(i, true); if (c.reveal) c.reveal(); } catch (e) { out.errs.push('item ' + i + ' ' + e.message); } }); });
      FE.engine.goto(start + dur * 0.5);
      FE.engine.goto(start + dur - 0.05);
      const S2 = FE.engine.scene; S2.doReveal(); S2.doHint();
      out.emptyIpa = [...document.querySelectorAll('.u')].filter((u) => { const pp = u.querySelector('.p'); return !pp || !pp.textContent.trim() || pp.textContent === '/?/'; }).length;
      out.units = document.querySelectorAll('.u').length;
    } catch (e) { out.errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]); }
    return out;
  }, [id, start, dur]);
  if (shots) { await p.evaluate(([s, d]) => FE.engine.goto(s + d * 0.55), [start, dur]); await p.waitForTimeout(350); await p.screenshot({ path: `/tmp/shots/${id}.png` }); }
  report.push(r);
}
const missing = await p.evaluate(() => [...FE.missing]);
const issues = await p.evaluate(() => FE.layoutIssues);
console.log(JSON.stringify({ segments: report.length, errors: [...new Set(errors)].slice(0, 20), segErrors: report.filter((r) => r.errs.length).map((r) => [r.id, r.errs]), emptyIpa: report.filter((r) => r.emptyIpa).map((r) => [r.id, r.emptyIpa]), missing, layoutIssues: issues }, null, 1));
await b.close();
