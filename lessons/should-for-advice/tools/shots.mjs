// Screenshots + contact sheets of the CURRENT build. Output folder is keyed by the build's SHA-256, so images from different builds never mix.
//   node tools/shots.mjs [--html=dist/should-for-advice.html] [--ids=1.2,3.3,...] [--out=evidence]
// Per viewport (desktop 1600x900, phone portrait 390x844, phone landscape 844x390): one PNG per segment + contact sheets + manifest.json.
import { chromium } from 'playwright-core';
import path from 'node:path'; import fs from 'node:fs'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const HTML = path.resolve(root, arg('html', 'dist/should-for-advice.html'));
const sha = crypto.createHash('sha256').update(fs.readFileSync(HTML)).digest('hex');
const OUT = path.resolve(root, arg('out', 'evidence'), sha.slice(0, 12));
const VPS = [['desktop-1600x900', { viewport: { width: 1600, height: 900 } }], ['phone-portrait-390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }], ['phone-landscape-844x390', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }]];
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const manifest = { html: path.basename(HTML), sha256: sha, date: new Date().toISOString(), viewports: {} };
for (const [name, ctx] of VPS) {
  const dir = path.join(OUT, name); fs.mkdirSync(dir, { recursive: true });
  const c = await browser.newContext(Object.assign({ deviceScaleFactor: 1 }, ctx)); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + HTML); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(dir, '00-start.png') });
  await p.evaluate(() => { FE.qa = true; document.getElementById('startBtn').click(); FE.engine.setPlaying(false); FE.engine.setMode('class'); FE.ui.setBar(true, false); });
  const all = await p.evaluate(() => FE.segs.map((s) => s.id)); const ids = arg('ids', '') ? arg('ids', '').split(',') : all;
  for (const id of ids) {
    await p.evaluate((id) => { const E = FE.engine; E.mission = {}; const s = FE.segs.find((x) => x.id === id); E.goto(s.start + Math.min(s.dur - 1, Math.max(16, s.dur * 0.55))); E.scene.doReveal(); document.getElementById('toast').classList.remove('on'); const d = document.getElementById('dockbody'); if (d) d.scrollTop = 0; }, id);
    await p.waitForTimeout(400); await p.screenshot({ path: path.join(dir, id + '.png') });
  }
  // contact sheets (6 per sheet), rendered from the saved PNGs
  const files = ['00-start', ...ids]; const per = name.startsWith('desktop') ? 3 : name.includes('portrait') ? 6 : 3; const sp = await c.newPage();
  for (let i = 0, k = 1; i < files.length; i += per * 2, k++) {
    const grp = files.slice(i, i + per * 2);
    fs.writeFileSync(path.join(dir, '_sheet.html'), `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${per},auto);gap:6px;padding:6px;width:max-content">` + grp.map((f) => `<div style="color:#fff;font:14px sans-serif"><div>${f}</div><img src="${f}.png" ${name.startsWith('desktop') ? 'width="520"' : ''}></div>`).join('') + '</body>');
    await sp.goto('file://' + path.join(dir, '_sheet.html')); await sp.waitForTimeout(300);
    const d = await sp.evaluate(() => [document.body.scrollWidth, document.body.scrollHeight]); await sp.setViewportSize({ width: d[0], height: d[1] });
    await sp.screenshot({ path: path.join(dir, `contact-${String(k).padStart(2, '0')}.png`) });
  }
  fs.rmSync(path.join(dir, '_sheet.html'));
  manifest.viewports[name] = { segments: ids.length, pageErrors: errs };
  await c.close();
}
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log('screenshots ->', OUT);
await browser.close();
