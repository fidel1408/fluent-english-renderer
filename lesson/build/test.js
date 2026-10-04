const { chromium, launchOpts } = require('./pw');
const path = require('path'), fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ ...launchOpts, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 780 }, acceptDownloads: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL);

  console.log('# structure');
  ok(await p.evaluate(() => Object.values(IPA.D).every((v) => /^[a-zæɑɔəɜɪʊʌðŋʃʒθɡː ˈˌ']+$/.test(v))), 'every dictionary entry is made of IPA characters only (no chart-only whitelist is imposed)');
  ok(await p.evaluate(() => !JSON.stringify(IPA.D).includes('oʊ') && Object.values(IPA.D).some((v) => v.includes('əʊ'))), 'GOAT vowel written əʊ as on the chart');
  ok(await p.evaluate(() => ACT_MIN.reduce((a, b) => a + b, 0) === 60), 'default activity minutes total exactly 60');
  ok(await p.evaluate(() => ACTS.length === 9), 'nine activities');
  ok(await p.evaluate(() => ACTS.reduce((s, a) => s + a.beats.reduce((t, x) => t + (x.talk || 0), 0), 0) === 2100), 'planned learner speaking = 35.0 min');
  ok(await p.evaluate(() => MCQ_ITEMS.length === 10 && MCQ_ITEMS.every((q) => q.opts.length === 4 && new Set(q.opts).size === 4 && q.ok >= 0 && q.ok < 4)), 'ten MCQ items, 4 distinct options, one key each');
  const letters = await p.evaluate(() => MCQ_ITEMS.map((q) => 'ABCD'[q.ok]).join(''));
  console.log('   answer key:', letters);
  const exp = { 1: 'I', 2: 'is', 3: 'are', 4: 'They’re friends.', 5: 'I’m not tired.', 6: 'Is he a teacher?', 7: 'Yes, I am.', 8: 'No, she isn’t.', 9: 'is', 10: 'We are students.' };
  ok(await p.evaluate((exp) => MCQ_ITEMS.every((q, i) => q.opts[q.ok] === exp[i + 1]), exp), 'correct answers match the specification');
  ok(await p.evaluate(() => MCQ_ITEMS.every((q) => q.opts.filter((o) => o === q.opts[q.ok]).length === 1)), 'each item has exactly one option equal to its key');

  console.log('# sound chart');
  await p.evaluate(() => { document.getElementById('start').hidden = true; });
  await p.click('#b-chart'); ok(await p.isVisible('.modal img'), 'Sound chart button opens the chart'); ok(await p.evaluate(() => document.querySelector('.modal img').naturalWidth > 1000), 'chart image loads'); await p.keyboard.press('Escape');
  await p.evaluate(() => { document.getElementById('start').hidden = false; });
  console.log('# start / audio unlock');
  ok(!(await p.evaluate(() => Sound.ready)), 'no AudioContext before Start');
  await p.click('#b-start'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => Sound.ready), 'AudioContext created after Start click');
  const an = await p.evaluate(() => { window.__an = Sound.tap(); window.__peak = 0; const buf = new Float32Array(2048); window.__iv = setInterval(() => { __an.getFloatTimeDomainData(buf); for (const v of buf) __peak = Math.max(__peak, Math.abs(v)); }, 50); return 1; });
  await p.waitForTimeout(6000);
  const peak = await p.evaluate(() => window.__peak);
  console.log('   opening theme peak', peak.toFixed(3));
  ok(peak > 0.01 && peak < 0.95, 'opening theme audible and not clipping');
  await p.click('#b-begin'); await p.waitForTimeout(600);
  ok(await p.evaluate(() => __lesson.S.a === 0 && __lesson.S.b === 0), 'Begin Activity 1 enters A1 step 1');
  ok((await p.textContent('#stage h1')).includes('People, things'), 'A1 title shown');

  console.log('# timer / pause / extend / skip');
  const t0 = await p.evaluate(() => S.spent[0]); await p.waitForTimeout(2200); const t1 = await p.evaluate(() => S.spent[0]);
  ok(t1 - t0 > 1.5, 'timer runs while playing');
  await p.click('#b-play'); const tp = await p.evaluate(() => S.spent[0]); await p.waitForTimeout(1500); const tp2 = await p.evaluate(() => S.spent[0]);
  ok(Math.abs(tp2 - tp) < 0.3, 'timer stops while paused');
  ok(await p.evaluate(() => !!document.getElementById('pbadge')), 'paused badge shown');
  await p.click('#b-play'); await p.waitForTimeout(600);
  await p.click('#b-60'); ok(await p.evaluate(() => S.extra[0] === 60), '+1 min extends activity 1 by 60 s');
  await p.click('#b-30'); ok(await p.evaluate(() => S.extra[0] === 90), '+30 s adds 30 s');
  ok((await p.textContent('#clk-total')).includes('now 61:30'), 'class clock shows plan 60:00 → now 61:30');
  await p.click('#b-skip'); ok(await p.evaluate(() => allot(0) - S.spent[0] <= 0.01), 'skip timer zeroes remaining');
  await p.waitForTimeout(700); ok(await p.evaluate(() => !!document.getElementById('timeup')), 'time-up banner appears (no auto-advance)');
  ok(await p.evaluate(() => S.a === 0), 'lesson did not advance by itself');

  console.log('# navigation');
  await p.click('#b-next'); await p.click('#b-next'); ok(await p.evaluate(() => S.b === 2), 'Step ▶ advances');
  await p.click('#b-prev'); ok(await p.evaluate(() => S.b === 1), 'Step ◀ goes back');
  await p.click('#b-na'); ok(await p.evaluate(() => S.a === 1 && S.b === 0), 'Next activity');
  const sp0 = await p.evaluate(() => S.spent[0]);
  await p.click('#b-pa'); await p.waitForTimeout(300); ok(await p.evaluate((s) => S.a === 0 && Math.abs(S.spent[0] - s) < 1.5, sp0), 'revisiting activity 1 keeps its time used');
  await p.click('#b-chap'); await p.click('[data-go="5:3"]'); ok(await p.evaluate(() => S.a === 5 && S.b === 3), 'chapter menu jumps to activity 6 step 4');
  await p.keyboard.press('ArrowRight'); ok(await p.evaluate(() => S.b === 4), 'keyboard → works');
  await p.evaluate(() => enter(0, 5, { noIntro: true }));

  console.log('# reveal / spanish / cc');
  await p.evaluate(() => enter(1, 5, { noIntro: true })); await p.waitForTimeout(300);
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.ans')).display === 'none'), 'answer hidden by default');
  await p.click('#b-reveal'); ok(await p.evaluate(() => getComputedStyle(document.querySelector('.ans')).display !== 'none'), 'Reveal answer shows it');
  await p.click('#b-reveal'); ok(await p.evaluate(() => getComputedStyle(document.querySelector('.ans')).display === 'none'), 'Hide answer hides it again');
  await p.click('#b-es'); ok(await p.evaluate(() => !!document.getElementById('es-panel')), 'Spanish help opens'); await p.click('#es-x');
  for (let i = 0; i < 3; i++) await p.click('#b-cc');
  ok(await p.evaluate(() => S.settings.cc === 'cap'), 'CC/IPA cycles off → captions → IPA → off → …');
  await p.click('#b-cc'); ok(await p.evaluate(() => document.body.dataset.cc === 'ipa'), 'IPA mode sets body flag');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.tx .ipa')).display !== 'none'), 'IPA visible under teaching text');
  await p.click('#b-cc'); await p.click('#b-cc'); ok(await p.evaluate(() => S.settings.cc === 'cap'), 'back to captions');

  console.log('# interactive build (A3)');
  await p.evaluate(() => enter(2, 9, { noIntro: true })); await p.waitForTimeout(200);
  const clickTile = (t) => p.click(`.tile[data-t="${t}"]`);
  await clickTile('am'); ok(await p.evaluate(() => /is/.test(document.querySelector('[data-fb]').textContent)), 'wrong tile gives explanatory feedback');
  for (const t of ['She', 'is', 'a', 'doctor.']) await clickTile(t);
  ok(await p.evaluate(() => document.querySelector('.pane').classList.contains('revealed')), 'sentence completes and explanation appears');

  console.log('# ten-question check');
  await p.evaluate(() => { S.mode = 'shared'; S.mcq = fresh().mcq; S.retry = { active: false }; enter(7, 0, { noIntro: true }); }); await p.waitForTimeout(200);
  const answersWanted = [1, 3, 0, 1 /*wrong: key is C*/, 1, 3, 1 /*wrong key A*/, 2, 1, 3]; // 8 right, 2 wrong
  for (let i = 0; i < 10; i++) {
    ok(await p.evaluate(() => !document.querySelector('.opt.right') && !document.querySelector('.opt.wrong')), `Q${i + 1}: correct/wrong marks hidden before submit`);
    await p.click(`.opt[data-k="${answersWanted[i]}"]`); await p.click('#mq-sub'); await p.waitForTimeout(600);
    if (i === 3) ok(await p.evaluate(() => !!document.querySelector('.opt.right') && !!document.querySelector('.opt.wrong')), 'wrong answer shows correct + chosen after submit');
    await p.click('#mq-next');
  }
  ok(await p.evaluate(() => S.b === 10), 'results screen after 10 questions');
  let sc = await p.evaluate(() => Comp.mcq.score(S.mcq.shared)); ok(sc.first === 8 && sc.missed === 2, 'first-attempt score 8/10');
  ok((await p.textContent('#stage')).includes('Class activity score'), 'shared mode labeled "Class activity score"');
  await p.click('#rs-retry'); ok(await p.evaluate(() => S.a === 7 && S.b === 3), 'retry jumps to first missed question');
  await p.click('.opt[data-k="2"]'); await p.click('#mq-sub'); await p.waitForTimeout(600); await p.click('#mq-next');
  ok(await p.evaluate(() => S.b === 6), 'next missed question');
  await p.click('.opt[data-k="0"]'); await p.click('#mq-sub'); await p.waitForTimeout(600); await p.click('#mq-next');
  sc = await p.evaluate(() => Comp.mcq.score(S.mcq.shared)); ok(sc.first === 8 && sc.retryOk === 2 && sc.after === 10, 'retry kept separate: first 8, retry 2/2, after 10');
  ok(await p.evaluate(() => S.mcq.shared.first[3].ok === false), 'first-attempt record unchanged after retry');
  await p.evaluate(() => { S.mode = 'individual'; }); sc = await p.evaluate(() => Comp.mcq.score(S.mcq.individual)); ok(sc.first === 0, 'individual mode scores stored separately'); await p.evaluate(() => { S.mode = 'shared'; });

  console.log('# checklist / export');
  await p.evaluate(() => enter(6, 13, { noIntro: true })); await p.waitForTimeout(200);
  await p.check('input[data-k="A"][data-l="0"]'); ok(await p.evaluate(() => S.part.L1 && S.part.L1.A === true), 'participation checklist stores locally with anonymous label');
  await p.click('#b-res');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#dl-json')]);
  const txt = fs.readFileSync(await dl.path(), 'utf8'); const j = JSON.parse(txt);
  ok(j.ten_question_check.shared_class_activity.firstAttemptScore === 8 && j.ten_question_check.shared_class_activity.retryCorrect === 2, 'JSON export has first-attempt and retry scores');
  ok(!/@|email|password/i.test(txt.replace(/emails/g, '')), 'export contains no emails/credentials');
  const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('#dl-csv')]); ok(fs.readFileSync(await dl2.path(), 'utf8').startsWith('"section"'), 'CSV export works');
  await p.keyboard.press('Escape');

  console.log('# resume after refresh');
  await p.evaluate(() => { enter(3, 2, { noIntro: true }); save(true); });
  await p.reload(); await p.waitForTimeout(500);
  ok(await p.isVisible('#b-resume'), 'resume offered after refresh');
  await p.click('#b-resume'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => S.a === 3 && S.b === 2 && S.extra[0] === 90 && S.mcq.shared.first[0].ok), 'resumed at A4 step 3 with timers and scores intact');
  ok(await p.evaluate(() => { const j = JSON.parse(localStorage.getItem(KEY)); const keys = JSON.stringify(Object.keys(j)); return !/name|email|mail/i.test(keys) && !/@/.test(JSON.stringify(j)); }), 'saved state has no name/email fields and no e-mail-like text');

  console.log('# reset with confirmation');
  await p.click('#b-reset'); ok(await p.isVisible('#cfm-ok'), 'reset asks for confirmation');
  await p.click('#cfm-ok'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => S.spent.every((x) => x === 0) && S.a === 0 && S.started === false && S.extra.every((x) => x === 0)), 'reset clears progress');

  console.log('# individual mode label');
  await p.click('#b-start'); await p.waitForTimeout(300); await p.click('#b-begin');
  await p.evaluate(() => { S.mode = 'individual'; enter(7, 0, { noIntro: true }); }); await p.waitForTimeout(200);
  ok((await p.textContent('#stage')).includes('Individual mode'), 'individual mode clearly labeled');

  console.log('\nconsole/page errors:', errs.length); errs.slice(0, 5).forEach((e) => console.log('  ', e));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
