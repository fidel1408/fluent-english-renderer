const { chromium, launchOpts } = require('./pw');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log(c ? '  ok  ' : '  FAIL', m); };
(async () => {
  const b = await chromium.launch({ ...launchOpts, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 780 } });
  await ctx.addInitScript(() => {
    const voices = [{ name: 'Mock Voice US', lang: 'en-US', localService: true }, { name: 'Mock Voz MX', lang: 'es-MX', localService: true }, { name: 'Mock Voice GB', lang: 'en-GB', localService: true }];
    window.__sp = { log: [], active: 0, overlap: 0, cancels: 0, cur: null, langs: [] };
    class U { constructor(t) { this.text = t; this.rate = 1; } }
    window.SpeechSynthesisUtterance = U;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => voices, addEventListener() {}, 
      speak(u) { const sp = __sp; if (sp.active > 0) sp.overlap++; sp.active++; sp.log.push(u.text); sp.langs.push((u.voice && u.voice.name) || u.lang); sp.cur = u;
        u.__t = setTimeout(() => { if (sp.cur === u) { sp.cur = null; sp.active--; u.onend && u.onend(); } }, 120); },
      cancel() { const sp = __sp; if (sp.cur) { const u = sp.cur; clearTimeout(u.__t); sp.cur = null; sp.active--; sp.cancels++; u.onend && u.onend(); } },
    } });
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL);
  console.log('# speech sequencing (mock speechSynthesis)');
  await p.evaluate(() => { S.settings.voice = ''; });
  await p.click('#b-start'); await p.waitForTimeout(500);
  await p.click('#b-begin'); await p.waitForTimeout(3500);
  let log = await p.evaluate(() => __sp.log.slice());
  console.log('   spoken so far:', JSON.stringify(log.slice(0, 8)));
  ok(log.includes('Look at the picture.') && log.includes('Two people. Alex and Maya.'), 'activity 1 narration plays in order');
  ok(log.indexOf('Look at the picture.') < log.indexOf('Two people. Alex and Maya.') && log.indexOf('Two people. Alex and Maya.') < log.indexOf('A group.'), 'order preserved');
  ok(await p.evaluate(() => __sp.overlap === 0), 'no overlapping voices');
  ok(await p.evaluate(() => __sp.langs.every((l) => /Mock Voice US/.test(l))), 'American English voice chosen automatically');
  console.log('# pause stops speech and timer; resume continues');
  await p.evaluate(() => enter(1, 2, { noIntro: true })); await p.waitForTimeout(200);
  await p.click('#b-play'); const n1 = await p.evaluate(() => __sp.log.length); await p.waitForTimeout(900);
  const n2 = await p.evaluate(() => __sp.log.length); ok(n1 === n2, 'nothing is spoken while paused');
  await p.click('#b-play'); await p.waitForTimeout(1500);
  const n3 = await p.evaluate(() => __sp.log.length); ok(n3 > n2, 'speech resumes after Play');
  ok(await p.evaluate(() => __sp.overlap === 0), 'still no overlap after resume');
  console.log('# changing activity stops queued speech');
  await p.evaluate(() => enter(1, 3, { noIntro: true })); await p.waitForTimeout(150);
  await p.evaluate(() => { window.__mark = __sp.log.length; enter(4, 0, { noIntro: true }); }); await p.waitForTimeout(1200);
  const tail = await p.evaluate(() => __sp.log.slice(__mark));
  ok(!tail.some((t) => /Alex and Maya: we|Daniel and Sofia: they/.test(t)), 'old beat lines are not spoken after navigating away');
  ok(await p.evaluate(() => __sp.overlap === 0), 'no overlap across navigation');
  console.log('# Spanish help only on demand');
  const before = await p.evaluate(() => __sp.langs.filter((l) => /Voz/.test(l)).length); ok(before === 0, 'no Spanish speech by default');
  await p.click('#b-es'); await p.click('#es-read'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => __sp.langs.some((l) => /Voz MX/.test(l))), 'Spanish read-aloud uses the Spanish voice');
  console.log('# mute narration');
  await p.click('#b-mute'); const m1 = await p.evaluate(() => __sp.log.length); await p.evaluate(() => enter(4, 1, { noIntro: true })); await p.waitForTimeout(1500);
  ok(m1 === await p.evaluate(() => __sp.log.length), 'muted narration speaks nothing (captions still run)');
  ok((await p.textContent('#caption')).length > 0, 'caption text still shown while muted');
  console.log('# reduced motion');
  await p.evaluate(() => { S.settings.rm = true; applyRM(); }); ok(await p.evaluate(() => document.body.classList.contains('rm')), 'reduced-motion class applied');
  console.log('errors:', errs.length, errs.slice(0, 3)); console.log(`${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
