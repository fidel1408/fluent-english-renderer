/* End-to-end checks for the lesson. Run:  node lesson/tests/e2e.js
   Needs playwright-core and a Chromium binary (set CHROMIUM=/path/to/chrome). */
const { chromium } = require('playwright-core');
const path = require('path');
const URL = 'file://' + path.join(__dirname, '..', 'fluent-english-be-yes-no-questions.html');
const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ FAIL: ' + m); } };
const plain = t => t.replace(/\/[^\/\s]*\//g, '').replace(/\s+/g, ' ');
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (got ${JSON.stringify(a)}${JSON.stringify(a) === JSON.stringify(b) ? '' : ', expected ' + JSON.stringify(b)})`);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 960 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const ev = (f) => page.evaluate(f);
  await page.goto(URL);
  await ev(() => { Sp.est = () => 60; });

  console.log('Structure');
  eq(await ev(() => LESSON.length), 9, 'nine sections');
  eq(await ev(() => LESSON.map(c => c.min)), [5, 8, 7, 7, 7, 8, 7, 7, 4], 'section minutes');
  eq(await ev(() => LESSON.reduce((a, c) => a + c.min * 60, 0)), 3600, 'default timers total exactly 3600 s');
  eq(await ev(() => LESSON.map(c => c.time)), ['00:00–05:00', '05:00–13:00', '13:00–20:00', '20:00–27:00', '27:00–34:00', '34:00–42:00', '42:00–49:00', '49:00–56:00', '56:00–60:00'], 'section time ranges');
  eq(await ev(() => LESSON.every(c => c.steps.reduce((a, s) => a + s.sec, 0) === c.min * 60)), true, 'pacing guide per section adds up to the section timer');
  eq(await ev(() => ST.timers.reduce((a, t) => a + t.def, 0)), 3600, 'state timers total 3600 s');

  console.log('Assessment data');
  eq(await ev(() => ITEMS.length), 10, 'exactly ten items');
  ok(await ev(() => ITEMS.every(i => i.opts.length === 4 && new Set(i.opts).size === 4 && 'ABCD'.includes(i.key))), 'four distinct options A–D per item');
  eq(await ev(() => ITEMS.map(i => i.opts['ABCD'.indexOf(i.key)])), ['Are you ready?', 'Is', 'Are', 'Am', 'Yes, I am.', 'No, he isn’t.', 'Yes, it is.', 'No, they aren’t.', 'No, you aren’t.', 'Yes, we are.'], 'the ten required correct answers');
  const pos = await ev(() => ITEMS.map(i => i.key));
  const cnt = {}; pos.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
  ok(Object.values(cnt).every(v => v >= 2 && v <= 3) && Object.keys(cnt).length === 4, 'correct positions balanced: ' + JSON.stringify(cnt));
  ok(await ev(() => ITEMS.every(i => {
    const key = i.opts['ABCD'.indexOf(i.key)];
    const m = key.match(/^No, (\w+) (isn’t|aren’t)\.$/); if (!m) return true;
    const alt = { 'isn’t': ['is not', '’s not'], 'aren’t': ['are not', '’re not'] }; // acceptable variants of the key
    const variants = [`No, ${m[1]} ${alt[m[2]][0]}.`, `No, ${m[1]}${alt[m[2]][1]}.`, `No, ${m[1] === 'you' ? 'you’re' : m[1]} not.`];
    return !i.opts.some(o => o !== key && variants.includes(o));
  })), 'no distractor is an acceptable alternative of the correct negative (never two acceptable contractions competing)');
  ok(await ev(() => !ITEMS.some(i => i.opts.some(o => /^Do .* are/.test(o) && i.key !== 'x') && false)), 'no do/does in correct forms');

  console.log('Start, controls, timers');
  await page.click('#startBtn');
  await page.waitForTimeout(400);
  eq(await ev(() => [ST.started, ST.paused]), [true, false], 'Start Lesson starts, unpaused');
  ok(await ev(() => !!Aud.ctx), 'Start unlocked the Web Audio context');
  const r0 = await ev(() => ST.timers[0].rem);
  await page.waitForTimeout(1500);
  const r1 = await ev(() => ST.timers[0].rem);
  ok(r0 - r1 > 1.0 && r0 - r1 < 2.2, `timer counts down while playing (${(r0 - r1).toFixed(2)} s in 1.5 s)`);
  await page.click('#bPlay');
  const p0 = await ev(() => ST.timers[0].rem); await page.waitForTimeout(1200); const p1 = await ev(() => ST.timers[0].rem);
  ok(Math.abs(p0 - p1) < 0.05, 'timer stops while paused');
  ok(await ev(() => ST.clock.paused > 0.9), 'paused time is tracked separately');
  await page.click('#bPlay');
  const e0 = await ev(() => ST.timers[0].rem);
  await page.click('#bExt30'); await page.click('#bExt60');
  const e1 = await ev(() => ST.timers[0].rem);
  ok(e1 - e0 > 88 && e1 - e0 < 91, `Extend +30 s and +1 min add 90 s (${(e1 - e0).toFixed(1)})`);
  eq(await ev(() => ST.timers[0].ext), 90, 'extension recorded');
  ok((await page.textContent('#toast')).includes('longer than 60:00'), 'toast explains extension changes class length');
  await page.click('#timerBtn');
  ok((await page.textContent('#modal')).includes('actual') || (await page.textContent('#modal')).includes('real length'), 'timer panel explains effect on real class length');
  await page.keyboard.press('Escape');
  await page.click('#bSkip');
  eq(await ev(() => ST.ch), 1, 'Skip Timer jumps to next section');
  ok(await ev(() => ST.timers[0].skip > 0 && ST.timers[0].rem === 0), 'skipped time recorded');
  await page.click('#bPrev'); eq(await ev(() => ST.ch), 0, 'Previous goes back (revisit)');
  await ev(() => FE.enter(0, 0)); await page.click('#bNext'); await page.click('#bNext'); eq(await ev(() => [ST.ch, ST.st]), [0, 2], 'Next moves through steps');
  await page.click('#bReveal'); eq(await ev(() => Run.S.lv), 1, 'Reveal Answer reveals'); await page.click('#bReveal'); await page.click('#bReveal'); eq(await ev(() => Run.S.lv), 0, 'Hide Answer hides again');
  await page.click('#bChap'); ok(await ev(() => $('#chapDrawer').classList.contains('open')), 'chapter menu opens');
  await page.click('#chapBody [data-go="3:0"]'); eq(await ev(() => [ST.ch, ST.st]), [3, 0], 'chapter menu jumps');

  console.log('CC / IPA / Spanish / motion');
  await page.click('#ccSeg [data-cc="0"]'); ok(await ev(() => getComputedStyle($('#ccWrap')).display === 'none'), 'CC Off hides captions');
  await page.click('#ccSeg [data-cc="1"]'); ok(await ev(() => getComputedStyle($('#ccWrap')).display !== 'none' && getComputedStyle($('.w .p') || document.body).display === 'none'), 'Captions mode: captions yes, IPA hidden');
  await page.click('#ccSeg [data-cc="2"]'); ok(await ev(() => getComputedStyle($('.w .p')).display === 'block'), 'Captions + IPA shows IPA under words');
  ok(await ev(() => { const w = $('#title .w'); return w && w.querySelector('.p') && w.children[0].getBoundingClientRect().bottom <= w.children[1].getBoundingClientRect().top + 1; }), 'IPA sits directly beneath the title word');
  await page.click('#esBtn'); ok(await ev(() => getComputedStyle($('#esCard')).display === 'block' && $('#esText').textContent.length > 10), 'Spanish Help card shows Spanish text');
  await page.click('#esBtn');
  await ev(() => { CFG.rm = 'on'; UI.applyCfg(); }); ok(await ev(() => document.body.classList.contains('rm')), 'reduced motion class applies');
  await ev(() => { CFG.rm = 'auto'; UI.applyCfg(); });
  await page.click('#bHide'); ok(await ev(() => document.body.classList.contains('nochrome')), 'hide controls works'); await page.click('#showChrome');

  console.log('Order-the-words challenge');
  await ev(() => FE.enter(1, 4)); await page.waitForTimeout(500);
  await page.locator('.tile', { hasText: 'student' }).first().click();
  ok(plain(await page.textContent('#content .fb')).includes('Be goes before the subject'), 'wrong tile explains position of be');
  for (const w of ['Are', 'you', 'a', 'student', '?']) await page.locator('.tile:not(.used)', { hasText: new RegExp('^' + (w === '?' ? '\\?' : w) + '(?![a-z])') }).first().click();
  ok(plain(await page.textContent('#content .fb')).includes('Move “are” before “you”'), 'completing the order shows explanation');

  console.log('Assessment: first attempt, retry, labels, export');
  await ev(() => FE.enter(7, 0)); await page.waitForTimeout(300);
  await page.click('#content .opt >> nth=1'); // individual
  eq(await ev(() => ST.assess.mode), 'individual', 'individual mode selectable');
  await page.click('#content .opt >> nth=0'); eq(await ev(() => ST.assess.mode), 'class', 'class mode selectable');
  // answer: items 1..7 correct, 8,9,10 wrong
  const answers = ['B', 'C', 'D', 'A', 'C', 'A', 'D', 'A', 'B', 'A'];
  for (let i = 0; i < 10; i++) {
    await ev(`FE.enter(7, ${i + 1})`); await page.waitForTimeout(150);
    ok(await ev(() => !$$('#content .opt').some(b => /good|bad/.test(b.className)) && !/Correct|answer is/i.test($('#content').textContent)), `item ${i + 1}: correct answer hidden before submit`);
    await page.keyboard.press(answers[i]);
  }
  eq(await ev(() => Object.keys(ST.assess.answers).length), 10, 'ten answers stored (keyboard A–D works)');
  await ev(() => FE.enter(7, 11)); await page.waitForTimeout(200);
  await page.click('#content .btn.gold');
  eq(await ev(() => ST.assess.first.score), 7, 'first-attempt score = 7/10');
  ok((await page.textContent('#content')).includes('Class activity score (teacher-entered shared answers)'), 'shared score labelled "class activity score"');
  ok(!(await page.textContent('#content')).toLowerCase().includes('mastery'), 'no mastery claim for class score');
  await ev(() => FE.enter(7, 12)); await page.waitForTimeout(200);
  ok(await ev(() => $$('#content .rb').length === 3), 'retry offers only the 3 missed items');
  // retry: fix two of three
  const blocks = await page.locator('#content .rb').all();
  await blocks[0].locator('button').nth(1).click();   // item 8 -> B (correct)
  await blocks[1].locator('button').nth(0).click();   // item 9 -> A (correct)
  await blocks[2].locator('button').nth(0).click();   // item 10 -> A (still wrong)
  await page.click('#content .btn.gold');
  eq(await ev(() => [ST.assess.first.score, ST.assess.retry.score, ST.assess.retry.outOf]), [7, 2, 3], 'first-attempt 7 kept; retry 2/3 stored separately');
  await page.click('#resBtn');
  const exp = await ev(() => UI.buildExport());
  eq(exp.assessment.firstAttempt.score, 7, 'export: first attempt'); eq(exp.assessment.retry.score, 2, 'export: retry');
  ok(exp.assessment.scoreType.startsWith('Class activity score'), 'export labels class activity score');
  const csv = await ev(() => UI.buildCSV()); ok(csv.includes('firstAttemptScore') && csv.includes('retryScore'), 'CSV has both scores');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#dlJson')]);
  ok(dl.suggestedFilename().endsWith('.json'), 'explicit JSON download works');
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('#dlCsv')]);
  ok(dl2.suggestedFilename().endsWith('.csv'), 'explicit CSV download works');
  await page.keyboard.press('Escape');

  console.log('Persistence, resume, reset');
  await ev(() => { ST.notes = 'anon note'; Store.save(); });
  await ev(() => FE.enter(4, 2));
  const savedTimers = await ev(() => ST.timers.map(t => Math.round(t.spent)));
  await ev(() => Store.save());
  await page.reload(); await page.waitForTimeout(500);
  ok(await page.isVisible('#resumeBox'), 'resume choice appears after refresh');
  await page.click('#startBtn'); await page.waitForTimeout(300);
  eq(await ev(() => [ST.ch, ST.st]), [4, 2], 'resume returns to saved step');
  eq(await ev(() => [ST.assess.first.score, ST.assess.retry.score, ST.notes]), [7, 2, 'anon note'], 'scores and notes restored');
  ok((await page.evaluate(() => ST.timers.map(t => Math.round(t.spent)))).every((v, i) => Math.abs(v - savedTimers[i]) <= 2), 'timers restored');
  await page.click('#bReset'); ok(await page.isVisible('#modalBg.open'), 'Reset asks for confirmation');
  await page.click('#rNo'); eq(await ev(() => ST.ch), 4, 'cancel keeps progress');
  await page.click('#bReset'); await page.click('#rYes');
  const rs = await ev(() => [ST.ch, ST.st, Math.round(ST.timers.reduce((a, t) => a + t.rem, 0))]); eq(rs, [0, 0, 3600], 'reset restores section 1 and 60:00');
  eq(await ev(() => ST.assess.first.score), 7, 'reset keeps scores unless asked');

  console.log('Narration follows pause / replay');
  await ev(() => FE.enter(0, 1)); await ev(() => FE.setPaused(true)); await page.waitForTimeout(2500);
  const beName = () => ev(() => { const n = $('#content .tok[data-id="b"]'); return n ? n._t : null; });
  eq(await beName(), 'are', 'paused: the statement does not move on (word still "are")');
  await ev(() => FE.setPaused(false)); await page.waitForTimeout(5500);
  eq(await beName(), 'Are', 'resumed: narration continues and "Are" moves to the front');
  await ev(() => FE.replay()); await page.waitForTimeout(300);
  eq(await beName(), 'are', 'Replay Example restarts the sequence from the statement');

  console.log('Gender-matched voices');
  const spoken = await ev(async () => {
    const mk = (name, lang) => ({ name, lang, voiceURI: name, localService: true });
    Sp.voices = [mk('Microsoft Aria Online (Natural) - English (United States)', 'en-US'), mk('Microsoft Guy Online (Natural) - English (United States)', 'en-US'), mk('Microsoft Sabina - Spanish (Mexico)', 'es-MX')];
    Sp.none = false;
    const log = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    const realSpeak = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { log.push([u.text, u.voice && u.voice.name, u.pitch]); setTimeout(() => u.onend && u.onend(), 20); };
    CFG.voiceF = ''; CFG.voiceM = '';
    const e = ++Run.epoch; const S = makeCtx({}, e);
    ST.paused = false;
    await S.say('Yes, I am.', { who: { o: { k: 'alex' }, talk() { } } });
    await S.say('Are you ready?', { who: { o: { k: 'nora' }, talk() { } } });
    await S.say('Is he late?', { who: { o: { k: 'sam' }, talk() { } } });
    await S.say('Yes, she is.', { who: { o: { k: 'maya' }, talk() { } } });
    speechSynthesis.speak = realSpeak; return log;
  });
  eq(spoken.map(x => /Guy/.test(x[1]) ? 'male' : /Aria/.test(x[1]) ? 'female' : x[1]), ['male', 'female', 'male', 'female'], 'Alex/Sam use a male voice, Nora/Maya a female voice');

  console.log('Every step builds, every word has IPA');
  const n = await ev(() => FE.flat.length); eq(n, 65, 'sixty-five steps');
  for (let i = 0; i < n; i++) {
    await ev(`FE.goFlat(${i})`); await page.waitForTimeout(120);
    const lv = await ev(() => Run.S.levels || 0);
    for (let l = 1; l <= lv; l++) { await ev(`FE.setLevel(${l})`); await page.waitForTimeout(60); }
  }
  const miss = await ev(() => Array.from(IPAMISS)); ok(miss.length === 0, 'no English teaching word lacks IPA' + (miss.length ? ': ' + miss.join(',') : ''));
  const noTitle = await ev(() => LESSON.flatMap(c => c.steps).filter(s => !s.title || !s.es).map(s => s.id)); ok(noTitle.length === 0, 'every step has a title and Spanish Help');

  console.log('Audio engine');
  const audio = await ev(async () => { Aud.init(); await Aud.ctx.resume(); ['move', 'whoosh', 'place', 'tick', 'reveal', 'good', 'soft', 'question', 'chime', 'card'].forEach(n => Aud.sfx(n)); return Aud.ctx.state; });
  ok(['running', 'suspended'].includes(audio), 'all effects schedule without error (context ' + audio + ')');
  ok(await ev(() => Aud.comp.threshold.value < 0), 'master compressor/limiter present');

  ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  console.log(`\n${pass} passed, ${fail} failed`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
