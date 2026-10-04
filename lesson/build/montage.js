// Builds labeled PNG contact sheets from the screenshots written by contact.js. Usage: node build/montage.js SHOTDIR OUTDIR
const { chromium, launchOpts } = require('./pw'); const fs = require('fs'), path = require('path');
const [dir, out] = [path.resolve(process.argv[2]), path.resolve(process.argv[3])]; fs.mkdirSync(out, { recursive: true });
const idx = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')); const phone = idx.width < 700, land = idx.width >= 700 && idx.width < 1000;
const COLS = phone ? 6 : land ? 2 : 3, TW = phone ? 300 : land ? 760 : 620; const label = phone ? `phone-390x${idx.height}${idx.real ? '-REAL' : '-expanded'}` : land ? `phone-landscape-${idx.width}x${idx.height}-REAL` : `desktop-1280${idx.real ? '-REAL' : ''}`;   // thumbnail width
const groups = {}; idx.shots.forEach((s) => { (groups[s.group] = groups[s.group] || []).push(s); });
(async () => {
  const b = await chromium.launch({ ...launchOpts }); const p = await b.newPage({ viewport: { width: COLS * (TW + 14) + 20, height: 800 } });
  const made = [];
  for (const [g, shots] of Object.entries(groups)) {
    const per = phone ? 12 : 12, pages = Math.ceil(shots.length / per);
    for (let k = 0; k < pages; k++) {
      const part = shots.slice(k * per, (k + 1) * per), name = `${label}_${g}${pages > 1 ? '_' + (k + 1) : ''}.png`;
      const html = `<html><body style="margin:0;background:#0b3a40;font-family:sans-serif"><div style="color:#fff;padding:8px 12px;font:600 15px sans-serif">${label} · ${g}${pages > 1 ? ` (${k + 1}/${pages})` : ''} · Large text · IPA on unless stated · ${idx.real ? 'TRUE device viewport (no expansion): what a user actually sees at first' : 'viewport height expanded to show full content'}</div><div style="display:grid;grid-template-columns:repeat(${COLS},${TW}px);gap:12px;padding:0 10px 14px;align-items:start">${part.map((s) => `<figure style="margin:0;background:#fff;border-radius:6px;overflow:hidden"><img src="${s.file}" style="width:${TW}px;display:block"><figcaption style="font:12px/1.3 sans-serif;padding:4px 6px;color:#222;background:#f1ece0">${s.caption.replace(/</g, '&lt;')}</figcaption></figure>`).join('')}</div></body></html>`;
      fs.writeFileSync(path.join(dir, '_sheet.html'), html); await p.goto('file://' + path.join(dir, '_sheet.html')); await p.waitForLoadState('load'); await p.waitForTimeout(400);
      await p.screenshot({ path: path.join(out, name), fullPage: true }); made.push(name);
    }
  }
  fs.unlinkSync(path.join(dir, '_sheet.html')); console.log(made.length + ' sheets:', made.join(' ')); await b.close();
})();
