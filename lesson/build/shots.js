const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const list = process.argv.slice(2).length ? process.argv.slice(2) : ['start', '0:0', '0:1', '1:0'];
const cc = process.env.CC || 'cap'; const W = +(process.env.W || 1280), H = +(process.env.H || 760); const wait = +(process.env.WAIT || 6000);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html'));
  await p.evaluate((cc) => { localStorage.clear(); }, cc);
  await p.goto('file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html'));
  fs.mkdirSync('/tmp/claude-0/-home-user-fluent-english-renderer/0b86f73e-8468-530d-bbc1-d4a728591c15/scratchpad/shots', { recursive: true });
  const dir = '/tmp/claude-0/-home-user-fluent-english-renderer/0b86f73e-8468-530d-bbc1-d4a728591c15/scratchpad/shots/';
  for (const s of list) {
    if (s === 'start') { await p.waitForTimeout(1500); await p.screenshot({ path: dir + 'start.png' }); continue; }
    if (s === 'begin') { await p.click('#b-start'); await p.waitForTimeout(1500); await p.screenshot({ path: dir + 'begin.png' }); continue; }
    const [a, bb] = s.split(':').map(Number);
    await p.evaluate(({ a, bb, cc }) => { S.started = true; document.getElementById('start').hidden = true; Sound.init(); S.settings.cc = cc; S.settings.mute = true; applySettings(); window.__lesson.enter(a, bb, { noIntro: true, tr: false }); }, { a, bb, cc });
    await p.waitForTimeout(wait);
    await p.screenshot({ path: dir + `s_${a}_${bb}_${cc}.png` });
  }
  await b.close();
})();
