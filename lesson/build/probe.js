// Visits every beat of every activity, collects console errors and IPA words missing from the dictionary.
const { chromium, launchOpts } = require('./pw');
const path = require('path');
(async () => {
  const b = await chromium.launch({ ...launchOpts, args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html'));
  await p.evaluate(() => localStorage.clear());
  await p.goto('file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html'));
  const info = await p.evaluate(async () => {
    S.started = true; document.getElementById('start').hidden = true; Sound.init();
    const L = window.__lesson; const res = [];
    for (let a = 0; a < L.ACTS.length; a++) for (let b = 0; b < L.ACTS[a].beats.length; b++) { L.enter(a, b, { noIntro: true, tr: false }); await new Promise(r => setTimeout(r, 30)); }
    return { missing: Array.from(IPA.missing).sort(), beats: L.ACTS.map(a => a.beats.length), talk: L.ACTS.map(a => a.beats.reduce((s, x) => s + (x.talk || 0), 0)) };
  });
  console.log(JSON.stringify(info));
  console.log('ERRORS', errs.length); errs.slice(0, 15).forEach(e => console.log(e));
  await b.close();
})();
