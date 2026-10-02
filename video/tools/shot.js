// node tools/shot.js "<url path>" out.png  (server must be running on :8123)
const { chromium } = require('playwright');
(async () => {
  const [url, out, scale] = [process.argv[2], process.argv[3], +process.argv[4] || 1];
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('console', m => console.log('console:', m.text())); pg.on('pageerror', e => console.log('PAGEERR', e.message));
  await pg.goto('http://localhost:8123/' + url); await pg.waitForTimeout(+process.argv[5] || 800);
  await pg.screenshot({ path: out }); await b.close();
})();
