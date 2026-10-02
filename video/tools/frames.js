// node tools/frames.js out_dir t1 t2 ... : save PNG frames at given times (cc via CC env)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [dir, ...ts] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('console', m => console.log('console:', m.text())); pg.on('pageerror', e => console.log('PAGEERR', e.message));
  await pg.goto('http://localhost:8123/index.html?render=1'); await pg.waitForFunction('window.__ready', null, { timeout: 30000 });
  for (const t of ts) { await pg.evaluate(([t, cc]) => window.drawAt(t, cc), [+t, +(process.env.CC ?? 2)]); await pg.locator('#stage').screenshot({ path: `${dir}/f_${(+t).toFixed(2)}.png` }); }
  await b.close();
})();
