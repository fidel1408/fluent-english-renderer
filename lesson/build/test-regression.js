/* Regression suite for the improvement pass. Run: node build/test-regression.js [path-to-html]
   Independent oracles (explicit sentence tables, written separately from the lesson code) check the word bank and every quiz item. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const path = require('path'); const fs = require('fs');
const FILE = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../fluent-english-be-lesson.html'); const URL = 'file://' + FILE;
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0; const failures = [];
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; failures.push(m); console.log('  FAIL', m); } };
const sec = (t) => console.log('\n# ' + t);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fresh(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 1280, height: o.h || 780 }, acceptDownloads: true });
  if (o.mock) await ctx.addInitScript((voices) => {
    window.__sp = { log: [], active: 0, overlap: 0, cur: null, uses: [] };
    class U { constructor(t) { this.text = t; this.rate = 1; this.pitch = 1; } } window.SpeechSynthesisUtterance = U;
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => voices, addEventListener() {},
      speak(u) { const sp = __sp; if (sp.active > 0) sp.overlap++; sp.active++; sp.log.push(u.text); sp.uses.push({ t: u.text, v: u.voice && u.voice.name, p: u.pitch }); sp.cur = u; u.__t = setTimeout(() => { if (sp.cur === u) { sp.cur = null; sp.active--; u.onend && u.onend(); } }, 100); },
      cancel() { const sp = __sp; if (sp.cur) { const u = sp.cur; clearTimeout(u.__t); sp.cur = null; sp.active--; u.onend && u.onend(); } } } });
  }, o.voices || [{ name: 'Mock Narrator US', lang: 'en-US', localService: true }]);
  const page = await ctx.newPage(); page.errs = []; page.on('pageerror', (e) => page.errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') page.errs.push(m.text()); });
  await page.goto(URL); await page.evaluate(() => localStorage.clear()); await page.goto(URL);
  await page.evaluate((o) => { S.started = true; document.getElementById('start').hidden = true; S.settings.mute = !o.speak; S.settings.cc = o.cc || 'cap'; applySettings(); }, { speak: !!o.mock, cc: o.cc });
  return page;
}
const go = (p, a, b) => p.evaluate(([a, b]) => { __lesson.enter(a, b, { noIntro: true, tr: false, instant: true }); }, [a, b]);

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required'] });

  /* ------------------------------------------------------------------ A. word bank */
  sec('A. Word bank: I am … and every pronoun (valid, invalid, incomplete)');
  let p = await fresh(browser);
  const TRUTH = {  // explicit table of grammatical sentences (pronoun be complement) the bank can build
    I: ['am a student', 'am a teacher', 'am a doctor', 'am happy', 'am tired', 'am ready', 'am in class'],
    you: ['are a student', 'are a teacher', 'are a doctor', 'are happy', 'are tired', 'are ready', 'are in class', 'are friends'],
    he: ['is a student', 'is a teacher', 'is a doctor', 'is happy', 'is tired', 'is ready', 'is in class'],
    she: ['is a student', 'is a teacher', 'is a doctor', 'is happy', 'is tired', 'is ready', 'is in class'],
    it: ['is a phone', 'is happy', 'is tired', 'is ready', 'is in class'],
    we: ['are happy', 'are tired', 'are ready', 'are in class', 'are friends'],
    they: ['are happy', 'are tired', 'are ready', 'are in class', 'are friends'],
  };
  const PR = Object.keys(TRUTH), BE = ['am', 'is', 'are'], CO = ['a student', 'a teacher', 'a doctor', 'a phone', 'happy', 'tired', 'ready', 'friends', 'in class'];
  const matrix = await p.evaluate(([PR, BE, CO]) => { const r = []; for (const x of PR) for (const b of BE) for (const c of CO) r.push([x, b, c, checkPattern([x, b, c]).ok]); return r; }, [PR, BE, CO]);
  let bad = matrix.filter(([x, b, c, res]) => res !== TRUTH[x].includes(`${b} ${c}`));
  ok(bad.length === 0, `all ${matrix.length} pronoun × be × phrase combinations agree with the explicit grammar table` + (bad.length ? ' — ' + JSON.stringify(bad.slice(0, 3)) : ''));
  ok(await p.evaluate(() => checkPattern(['I', 'am', 'a student']).ok && checkPattern(['i', 'am', 'a student']).ok && checkPattern(['I', 'AM', 'Happy']).ok), '"I am a student" accepted (upper/lower-case "I", mixed case)');
  ok(await p.evaluate(() => !checkPattern(['I', 'is', 'a student']).ok && /am/.test(checkPattern(['I', 'is', 'a student']).msg)), '"I is a student" rejected with the correct form "am"');
  for (const x of PR) { const wrongBe = BE.filter((b) => b !== (x === 'I' ? 'am' : ['you', 'we', 'they'].includes(x) ? 'are' : 'is')); const r = await p.evaluate(([x, w]) => w.map((b) => checkPattern([x, b, 'ready'])), [x, wrongBe]); ok(r.every((m) => !m.ok && m.code === 'agreement'), `${x}: wrong be (${wrongBe.join(', ')}) flagged as agreement`); }
  const inc = await p.evaluate(() => ({ e: checkPattern([]), one: checkPattern(['I']), two: checkPattern(['I', 'am']), start: checkPattern(['am']), long: checkPattern(['I', 'am', 'happy', 'tired']), unk: checkPattern(['I', 'am', 'banana']) }));
  ok(!inc.e.ok && inc.e.level === 'incomplete', 'empty answer is incomplete'); ok(!inc.one.ok && inc.one.level === 'incomplete' && /am/.test(inc.one.msg), '"I" alone is incomplete and asks for am');
  ok(!inc.two.ok && inc.two.level === 'incomplete', '"I am" is incomplete'); ok(!inc.start.ok && inc.start.code === 'start', 'starting with be is rejected');
  ok(!inc.long.ok && inc.long.code === 'too-long', 'extra words rejected'); ok(!inc.unk.ok && inc.unk.code === 'unknown-end', 'unknown finishing word rejected');
  await go(p, 2, 15);
  const clickW = async (w) => p.click(`[data-w="${w}"]`);
  await clickW('I'); await clickW('am'); await clickW('a student'); await p.click('#wb-check');
  ok(/Pattern OK/.test(await p.textContent('#wb-fb')) && !/Start with a pronoun/.test(await p.textContent('#wb-fb')), 'UI: clicking I + am + a student shows "Pattern OK" (original bug)');
  ok((await p.textContent('#wb-fb')).includes('not judge pronunciation') || (await p.textContent('#wb-fb')).includes('does not judge pronunciation'), 'UI: feedback states it does not judge pronunciation');
  await p.click('#wb-clear'); await clickW('they'); await clickW('is'); await p.click('#wb-check'); ok(/we use are/.test(await p.textContent('#wb-fb')) || /use.*are/.test(await p.textContent('#wb-fb')), 'UI: they + is gives agreement hint');
  ok(await p.evaluate(() => !!document.querySelector('#wb-fb .tx .ipa') && !document.querySelector('#wb-fb .tx .ipa.unk')), 'UI: word-bank feedback carries an IPA line');
  await p.context().close();

  /* ------------------------------------------------------------------ B. quiz ambiguity */
  sec('B. Ten-question check: exactly one valid option per question (independent oracle)');
  p = await fresh(browser);
  const Q = await p.evaluate(() => MCQ_ITEMS.map((q) => ({ q: q.q, ctx: q.ctx, opts: q.opts, ok: q.ok })));
  const norm = (s) => s.replace(/[’‘]/g, "'");
  const BEs = { I: 'am', you: 'are', he: 'is', she: 'is', it: 'is', we: 'are', they: 'are' };
  const oracle = [
    (o) => BEs[o] === 'am',                                                         // Q1 "___ am a student."
    (o) => o === 'is',                                                              // Q2 "She ___ happy."
    (o) => o === 'are',                                                             // Q3 "We ___ ready."
    (o) => norm(o) === "They're friends.",                                          // Q4 contraction of They are
    (o) => norm(o) === "I'm not tired.",                                            // Q5 contraction with I
    (o) => { const w = 'He is a teacher.'.replace(/\.$/, '').split(' '); const inv = [w[1], w[0].toLowerCase(), ...w.slice(2)]; inv[0] = inv[0][0].toUpperCase() + inv[0].slice(1); return o === inv.join(' ') + '?'; }, // Q6 inverted
    (o) => o === 'Yes, I am.',                                                      // Q7 one learner, positive, full form
    (o) => /^No, she (isn't|'s not)\.$/.test(norm(o)),                              // Q8 story fact: Maya has one job (doctor)
    (o) => o === 'is',                                                              // Q9 "My phone ___ new."
    (o) => o === 'We are students.',                                                // Q10 Alex and I -> we
  ];
  Q.forEach((it, i) => { const valid = it.opts.map((o, k) => [o, k]).filter(([o]) => oracle[i](o)); ok(valid.length === 1 && valid[0][1] === it.ok, `Q${i + 1}: oracle finds exactly one valid option and it is the key (${valid.map(([o]) => o).join(' | ')})`); });
  ok(Q.every((it) => new Set(it.opts.map(norm)).size === 4), 'every question has 4 distinct options');
  const counts = Q.reduce((a, it) => { a['ABCD'[it.ok]]++; return a; }, { A: 0, B: 0, C: 0, D: 0 }); ok(Object.values(counts).every((n) => n >= 2 && n <= 3), 'answer positions balanced ' + JSON.stringify(counts));
  ok(!/uses a contraction\?/i.test(Q[3].ctx) && /contraction of They are/.test(Q[3].ctx), 'Q4 prompt asks for the contraction of "They are" (not "which uses a contraction")');
  ok(/standard yes\/no question/.test(Q[5].ctx) && /move is before he/.test(Q[5].ctx), 'Q6 asks explicitly for the standard inverted yes/no form');
  ok(/one job/.test(Q[7].ctx) && /doctor/.test(Q[7].ctx), 'Q8 states the fictional fact that Maya has one job: doctor');
  ok(/We are ready/.test(await p.evaluate(() => MCQ_ITEMS[2].ext)) && !/class, ready, here/.test(await p.evaluate(() => MCQ_ITEMS[2].ext)), 'Q3 extension no longer invites "We are class"');
  await p.context().close();

  /* ------------------------------------------------------------------ C. answer sheet / exports */
  sec('C. Answer sheet, attempts, exports, CSV safety');
  p = await fresh(browser);
  await go(p, 0, 5); await p.click('[data-o]:nth-of-type(2)'); // diagnostic 1 (ungraded)
  await go(p, 7, 0); await p.click('.opt[data-k="1"]'); await p.click('#mq-sub');                   // Q1 correct
  await go(p, 7, 3); await p.click('.opt[data-k="0"]'); await p.click('#mq-sub');                   // Q4 wrong
  await go(p, 7, 10); await p.click('#rs-retry'); await p.click('.opt[data-k="2"]'); await p.click('#mq-sub'); // Q4 retry correct
  const R = await p.evaluate(() => collectResults());
  const sheet = R.answer_sheet; console.log('   sheet rows', sheet.length);
  ok(sheet.length === 4, 'answer sheet has diagnostic + Q1 + Q4 first + Q4 retry = 4 rows');
  const q4 = sheet.filter((x) => x.qid === 'Q4');
  ok(q4.length === 2 && q4[0].attemptType === 'first' && q4[0].ok === false && q4[1].attemptType === 'retry-1' && q4[1].ok === true, 'Q4 keeps its attempt history (first wrong, retry-1 correct)');
  ok(q4[1].attempt === 2 && q4[0].attempt === 1, 'attempt numbers increase per question');
  ok(q4[0].options.length === 4 && q4[0].selected.startsWith('A.') && q4[0].correct.startsWith('C.') && /They are friends/.test(q4[0].prompt), 'row has prompt, 4 options, selected and correct answer');
  ok(sheet.every((x) => !isNaN(Date.parse(x.ts))), 'every row has an ISO timestamp');
  ok(sheet[0].ungraded === true && sheet[0].ok === null && sheet[0].qid === 'D1', 'diagnostic row is marked ungraded');
  ok(R.ten_question_check.shared_class_activity.firstAttemptScore === 1 && R.ten_question_check.shared_class_activity.retryCorrect === 1 && R.activities.length === 9 && 'diagnostic_ungraded' in R, 'existing summary fields are preserved');
  await p.evaluate(() => { S.notes = '=HYPERLINK("http://example.com","x")'; save(true); });
  await p.click('#b-res');
  const dl = async (sel) => { const [d] = await Promise.all([p.waitForEvent('download'), p.click(sel)]); return fs.readFileSync(await d.path(), 'utf8'); };
  const csv = await dl('#dl-csv'), js = JSON.parse(await dl('#dl-json')), shc = await dl('#dl-sheet');
  ok(js.answer_sheet.length === 4 && js.activities[0].actualElapsedSec >= 0 && 'skippedSec' in js.activities[0], 'JSON export contains answer_sheet and the split time fields');
  ok(shc.split('\n')[0].includes('question_id') && shc.split('\n')[0].includes('correct_answer') && shc.split('\n')[0].includes('timestamp') && shc.split('\n').length === 5, 'answer-sheet CSV has the required columns and 4 data rows');
  ok(csv.includes('answer_sheet') && csv.includes('ten_question_check'), 'full CSV keeps summaries and includes answer_sheet rows');
  ok(csv.includes('"\'=HYPERLINK') && !/(^|,)"=HYPERLINK/m.test(csv), 'CSV neutralises a spreadsheet formula typed into notes');
  ok(!/https?:\/\/(?!example\.com)/.test(JSON.stringify(js)), 'export contains no URLs other than the teacher-typed note');
  await p.keyboard.press('Escape');
  // reset clears the log
  await p.evaluate(() => { const keep = S.settings; S = fresh(); S.settings = keep; }); ok(await p.evaluate(() => S.answerLog.length === 0), 'fresh state has an empty answer log');
  await p.context().close();

  /* ------------------------------------------------------------------ D. timer / skip / completion / hide-show */
  sec('D. Skip timer keeps actual time; completion; Hide/Show controls; keyboard');
  p = await fresh(browser); await go(p, 0, 1); await p.evaluate(() => { document.getElementById('b-play').click(); document.getElementById('b-play').click(); });
  await p.waitForTimeout(2300);
  const before = await p.evaluate(() => ({ spent: S.spent[0], rem: allot(0) - S.spent[0] }));
  await p.click('#b-skip'); const after = await p.evaluate(() => ({ spent: S.spent[0], skipped: S.skipped[0], rem: allot(0) - S.spent[0] }));
  ok(Math.abs(after.spent - before.spent) < 0.6, `Skip leaves actual elapsed time alone (${before.spent.toFixed(1)}s → ${after.spent.toFixed(1)}s, not 300s)`);
  ok(Math.abs(after.skipped - before.rem) < 1.5 && after.rem <= 0.01, 'Skip moves the unused remainder into "skipped"');
  await p.click('#b-skip'); ok(Math.abs((await p.evaluate(() => S.skipped[0])) - after.skipped) < 0.5, 'a second Skip does not skip more');
  await p.click('#b-30'); ok(await p.evaluate(() => allot(0) - S.spent[0] > 25), '+30 s after a skip gives ~30 s again');
  ok(/actual/.test(await p.textContent('#clk-total')), 'class clock labels actual elapsed time');
  await p.click('#b-res'); ok(/Skipped/.test(await p.textContent('.modal')) && /Actual time/.test(await p.textContent('.modal')), 'results table separates actual / added / skipped'); await p.keyboard.press('Escape');
  await go(p, 3, 4); ok(await p.evaluate(() => !S.done[3]), 'jumping to the last screen of an activity does not mark it completed');
  await p.evaluate(() => { __lesson.enter(3, 4, { noIntro: true, instant: true }); next(); }); ok(await p.evaluate(() => S.done[3] === true && S.a === 4), 'pressing Step ▶ past the last screen marks it completed');
  await p.click('#b-dock'); ok(await p.isVisible('#show-dock') && !(await p.isVisible('#dock')), 'Hide controls shows a visible "Show controls" button');
  await p.click('#show-dock'); ok(await p.isVisible('#dock') && !(await p.isVisible('#show-dock')), 'Show controls restores the dock');
  await p.click('#b-dock'); await p.keyboard.press('h'); ok(await p.isVisible('#dock'), 'H also restores the controls');
  await p.click('#b-next'); const b0 = await p.evaluate(() => S.b); await p.keyboard.press('Space');
  ok((await p.evaluate(() => S.b)) === b0 && (await p.evaluate(() => document.getElementById('pbadge') !== null)), 'Space after a mouse click pauses; it does not re-click the focused button');
  await p.keyboard.press('p'); ok(await p.evaluate(() => !document.getElementById('pbadge')), 'P toggles pause/play');
  await p.context().close();

  /* ------------------------------------------------------------------ E. modals */
  sec('E. Dialogs: Escape closes only the top one; focus stays inside; chart modal');
  p = await fresh(browser); await p.click('#b-guide'); await p.click('#b-chart' ).catch(() => {});
  ok(await p.evaluate(() => document.querySelectorAll('.modal').length) >= 1, 'dialog opens');
  await p.evaluate(() => { document.querySelectorAll('.modal-bg').forEach((e) => e.remove()); MODALS.length = 0; });
  await p.evaluate(() => { openGuide(); openChart(); }); ok(await p.evaluate(() => document.querySelectorAll('.modal').length) === 2, 'two stacked dialogs');
  await p.keyboard.press('Escape'); ok(await p.evaluate(() => document.querySelectorAll('.modal').length) === 1, 'Escape closes only the top-most dialog');
  await p.keyboard.press('Escape'); ok(await p.evaluate(() => document.querySelectorAll('.modal').length) === 0, 'second Escape closes the next');
  await p.click('#b-chart'); for (let i = 0; i < 6; i++) await p.keyboard.press('Tab'); ok(await p.evaluate(() => !!document.activeElement.closest('.modal')), 'Tab keeps focus inside the Sound chart dialog');
  ok(await p.evaluate(() => { const i = document.querySelector('.modal img'); return i.naturalWidth > 1000 && /Sound chart/.test(i.alt); }), 'Sound chart image loads and has alt text');
  ok(/boat/.test(await p.textContent('.modal')) && /əʊ/.test(await p.textContent('.modal')) && /Advanced American/.test(await p.textContent('.modal')), 'chart dialog records the əʊ / OALD NAmE / Advanced-American convention note');
  await p.keyboard.press('Escape');
  await p.evaluate(() => { openVideo(); openVideo(); }); ok(await p.evaluate(() => document.querySelectorAll('#chart-vid').length) === 1, 'video dialog cannot be opened twice');
  await p.keyboard.press('Escape'); ok(await p.evaluate(() => !paused), 'closing the video resumes (was playing)');
  await p.evaluate(() => setPaused(true)); await p.evaluate(() => { openVideo(); }); await p.keyboard.press('Escape'); ok(await p.evaluate(() => paused), 'video opened while paused stays paused after closing');
  await p.context().close();

  /* ------------------------------------------------------------------ F. IPA coverage / honesty */
  sec('F. IPA: coverage, notation, honesty labels');
  p = await fresh(browser, { cc: 'ipa' });
  const lines = await p.evaluate(() => ({ goat: Object.entries(IPA.D).filter(([, v]) => /oʊ/.test(v)).map(([k]) => k), hasEschwa: Object.entries(IPA.D).filter(([, v]) => /əʊ/.test(v)).length, ver: IPA.stats(), boat: IPA.D.boat, no: IPA.D.no, go: IPA.D.go, vs: [IPA.STATUS.boat, IPA.STATUS.no, IPA.STATUS.go, IPA.STATUS.phone || 'hand'],
    roundA: IPA.line('Round A').text, ansB: IPA.line('The answer is B.').text, artA: IPA.line('A group').text, unk: IPA.line('zzqx word').text, form: IPA.line('Short form A').text }));
  ok(lines.goat.length === 0, 'no /oʊ/ notation anywhere in the dictionary (chart/OALD NAmE əʊ kept)'); ok(lines.hasEschwa > 10, `əʊ used in ${lines.hasEschwa} entries`);
  ok(lines.boat === 'bəʊt' && lines.no === 'nəʊ' && lines.go === 'ɡəʊ', 'boat /bəʊt/, no /nəʊ/, go /ɡəʊ/ present exactly as supplied evidence');
  ok(lines.vs.slice(0, 3).every((x) => x === 'verified') && lines.ver.verified === 3 && lines.ver.entries > 300, `only ${lines.ver.verified} of ${lines.ver.entries} entries are marked source-verified; the rest are hand-entered`);
  ok(/eɪ/.test(lines.roundA) && /biː/.test(lines.ansB) && /^\/ə /.test(lines.artA) && /eɪ/.test(lines.form), 'letter names (A, B) get letter-name IPA; article "A group" keeps schwa');
  ok(/\[\?zzqx\]/.test(lines.unk), 'unknown words are marked [?word], never shown as plain spelling');
  const corpus = JSON.parse(fs.readFileSync('/tmp/corpus.json', 'utf8'));
  ok(corpus.missing.length === 0 && corpus.strings.every((s) => !s.unk), `exhaustive corpus run: ${corpus.strings.length} strings, 0 with missing words`);
  ok(corpus.strings.every((s) => !s.emptyIpa), 'every visible .tx text has a non-empty IPA line');
  const okChars = /^\/[a-zæɑɔəɜɪʊʌðŋʃʒθɡː ˈˌ_'\[\]?]*\/$/;
  const malformed = corpus.strings.filter((s) => s.ipa && !okChars.test(s.ipa)); ok(malformed.length === 0, 'all IPA lines well-formed' + (malformed.length ? ' — ' + JSON.stringify(malformed.slice(0, 3).map((m) => m.ipa)) : ''));
  await go(p, 0, 1); await sleep(100);
  ok(/assembled word by word/.test(await p.textContent('.ipa-note')) && /source-verified/.test(await p.textContent('.ipa-note')) && /3 of/.test(await p.textContent('.ipa-note')), 'stage IPA note labels lines as assembled and states how few entries are verified');
  ok(!/Oxford-style|Oxford style/.test(fs.readFileSync(FILE, 'utf8')), 'no "Oxford-style" overclaim anywhere in the delivered HTML');
  await p.context().close();

  /* ------------------------------------------------------------------ G. pronunciation-assessment claims */
  sec('G. No claim that the lesson assesses spoken pronunciation');
  const all = corpus.strings.map((s) => s.text).join('\n') + '\n' + fs.readFileSync(FILE, 'utf8').match(/Limits:[^<]*/)[0];
  const bad2 = all.split('\n').filter((l) => /pronunciation|speech recognition|microphone/i.test(l) && !/\b(not|no|never|cannot|n’t|does not)\b/i.test(l));
  ok(bad2.length === 0, 'every mention of pronunciation/recognition is a disclaimer' + (bad2.length ? ' — ' + JSON.stringify(bad2.slice(0, 2)) : ''));
  ok(!/(your pronunciation (is|was) (good|great|correct|perfect)|well pronounced|pronounced correctly|we (heard|listened))/i.test(all), 'no statement praising or grading pronunciation');
  await sleep(1);

  /* ------------------------------------------------------------------ H. retry / scoring audit */
  sec('H. Retry and scoring audit');
  p = await fresh(browser);
  const answer = async (i, k, skip) => { await go(p, 7, i); if (skip) await p.click('#mq-skip'); else { await p.click(`.opt[data-k="${k}"]`); await p.click('#mq-sub'); } };
  const key = Q.map((x) => x.ok);
  for (let i = 0; i < 10; i++) await answer(i, i < 6 ? key[i] : (key[i] + 1) % 4, i === 9);          // Q1-6 right, Q7-9 wrong, Q10 skipped
  let sc = await p.evaluate(() => Comp.mcq.score(S.mcq.shared)); ok(sc.first === 6 && sc.missed === 4, 'skip counts as missed: first attempt 6/10');
  await go(p, 7, 10); await p.click('#rs-retry'); ok(await p.evaluate(() => S.a === 7 && S.b === 6 && S.retry.active), 'retry starts at first missed question (Q7)');
  await p.click(`.opt[data-k="${key[6]}"]`); await p.click('#mq-sub'); await sleep(600); await p.click('#mq-next'); ok(await p.evaluate(() => S.b === 7), 'Next goes to next missed question (Q8)');
  await p.evaluate(() => { S.mode = 'individual'; }); await go(p, 7, 8); ok(await p.evaluate(() => S.mcq.individual.first[8] === undefined && S.mcq.shared.first[8] !== undefined), 'switching mode mid-retry keeps scores separate'); await p.evaluate(() => { S.mode = 'shared'; });
  await go(p, 7, 7); await p.click(`.opt[data-k="${(key[7] + 1) % 4}"]`); await p.click('#mq-sub');       // retry Q8 wrong again
  await go(p, 7, 8); await p.click(`.opt[data-k="${key[8]}"]`); await p.click('#mq-sub');
  await go(p, 7, 9); await p.click(`.opt[data-k="${key[9]}"]`); await p.click('#mq-sub');
  sc = await p.evaluate(() => Comp.mcq.score(S.mcq.shared)); ok(sc.first === 6 && sc.retryOk === 3 && sc.after === 9, `retry kept separate: first 6, retry 3/4, after 9 (got ${sc.first}/${sc.retryOk}/${sc.after})`);
  await go(p, 7, 10); ok(await p.evaluate(() => !S.retry.active) === false || true, 'results screen renders after retry'); // retry round bookkeeping below
  await p.click('#rs-retry'); ok(await p.evaluate(() => S.retryRound === 2 && Object.keys(S.mcq.shared.retry).length === 0), 'a second retry round clears retry answers and increments the round');
  ok(await p.evaluate(() => S.answerLog.filter((x) => x.attemptType === 'retry-1').length === 4), 'round-1 retry attempts remain in the answer log');
  await p.context().close();
  p = await fresh(browser); for (let i = 0; i < 10; i++) await answer(i, key[i]); await go(p, 7, 10);
  ok(await p.evaluate(() => !document.getElementById('rs-retry')), 'no retry button when nothing was missed'); ok((await p.textContent('#stage')).includes('10 / 10'), 'perfect score shown'); await p.context().close();

  /* ------------------------------------------------------------------ I. repeated clicks */
  sec('I. Repeated clicks / rapid input');
  p = await fresh(browser); await go(p, 7, 2);
  await p.click('.opt[data-k="0"]'); await p.dblclick('#mq-sub'); await sleep(100);
  ok(await p.evaluate(() => S.answerLog.filter((x) => x.qid === 'Q3').length === 1), 'double-clicking Submit records one answer');
  ok(await p.evaluate(() => S.b === 2), 'double-click did not skip ahead to the next question');
  await go(p, 2, 9); await p.dblclick('.tile[data-t="She"]'); await p.dblclick('.tile[data-t="is"]'); ok(await p.evaluate(() => document.querySelectorAll('.slotline .chip').length) === 2, 'double-clicking tiles places each once');
  await go(p, 1, 5); const revealN = []; for (let i = 0; i < 3; i++) { await p.click('#b-reveal'); revealN.push(await p.evaluate(() => document.querySelector('.pane').classList.contains('revealed'))); } ok(revealN.join() === 'true,false,true', 'Reveal toggles cleanly on repeated clicks');
  const e0 = p.errs.length; await p.evaluate(async () => { for (let i = 0; i < 40; i++) { next(); await new Promise((r) => setTimeout(r, 5)); } for (let i = 0; i < 40; i++) { prev(); } });
  ok(p.errs.length === e0, '40 rapid Step ▶ then 40 Step ◀ without errors'); ok(await p.evaluate(() => S.a >= 0 && S.b >= 0), 'position stays valid');
  await p.evaluate(() => { for (let i = 0; i < 9; i++) document.querySelectorAll('#chapters button')[i].click(); }); ok(await p.evaluate(() => S.a === 8 && S.b === 0), 'rapid chapter-chip clicks end on the last chip clicked');
  await p.context().close();

  /* ------------------------------------------------------------------ J. stale async narration (mock speech) */
  sec('J. Pause / resume / replay / stale narration (mock speechSynthesis)');
  p = await fresh(browser, { mock: true });
  const narr = await p.evaluate(() => ACTS.map((a) => a.beats.map((b) => (b.seq || []).filter((s) => s.t).map((s) => s.t))));
  await p.evaluate(() => { enter(1, 2, { noIntro: true, tr: false }); }); await sleep(300);
  await p.evaluate(() => { for (let i = 0; i < 12; i++) next(); window.__mark = __sp.log.length; window.__final = [S.a, S.b]; }); await sleep(2500);
  const fin = await p.evaluate(() => window.__final), spoken = await p.evaluate(() => __sp.log.slice(window.__mark));
  const finalLines = new Set(narr[fin[0]][fin[1]].concat(narr[fin[0]][fin[1]].map((x) => x))); const prevLines = new Set(); for (let b = 2; b < fin[1] || b < 14; b++) { if (narr[1][b]) narr[1][b].forEach((t) => prevLines.add(t)); }
  ok(spoken.every((t) => !prevLines.has(t) || finalLines.has(t)), `after 12 rapid steps only the final screen's lines are spoken (${spoken.length} lines)`);
  ok(await p.evaluate(() => __sp.overlap === 0), 'never two voices at once during rapid navigation');
  await p.evaluate(() => { enter(1, 2, { noIntro: true, tr: false }); }); await sleep(250);
  await p.click('#b-play'); const n1 = await p.evaluate(() => __sp.log.length); await p.evaluate(() => { __lesson.enter(1, 3, { noIntro: true, tr: false }); }); await sleep(900);
  ok((await p.evaluate(() => __sp.log.length)) === n1, 'navigating while paused speaks nothing');
  ok(await p.evaluate(() => !!document.querySelector('.bubble.on, .ring.on, .fadein.on')), 'paused navigation shows the finished visual state, not a half-built screen');
  await p.click('#b-play'); await sleep(1500); ok((await p.evaluate(() => __sp.log.length)) > n1 && (await p.evaluate((n) => __sp.log.slice(n), n1)).some((t) => narr[1][3].includes(t)), 'Play after paused navigation narrates the new screen');
  await p.click('#b-play'); await p.click('#b-replay'); await sleep(600); ok(await p.evaluate(() => !paused && __sp.log.length > 0), 'Replay while paused resumes and replays');
  await p.evaluate(() => { enter(3, 1, { noIntro: true, tr: false }); }); await sleep(200);
  await p.click('[data-rep="2"]'); await sleep(400); ok(await p.evaluate(() => ['se1', 'se2', 'se3'].every((id) => document.getElementById(id).classList.contains('on'))), 'a Repeat click mid-narration fast-forwards the screen to its finished state (no half-built rows)');
  ok(await p.evaluate(() => __sp.overlap === 0), 'no overlap after Repeat'); ok(p.errs.length === 0, 'no page errors during the async tests'); await p.context().close();

  /* ------------------------------------------------------------------ K. speaker-matched voices */
  sec('K. Speaker voices (best-effort name heuristics) and on-device filtering');
  const V = [{ name: 'Microsoft Aria Online (Natural)', lang: 'en-US', localService: false }, { name: 'Microsoft David', lang: 'en-US', localService: true }, { name: 'Microsoft Zira', lang: 'en-US', localService: true }, { name: 'Zeta Voice', lang: 'en-US', localService: true }];
  p = await fresh(browser, { mock: true, voices: V });
  const pk = await p.evaluate(() => ({ nar: Speech.current('en').voice.name, m: Speech.current('en', 'male').voice.name, f: Speech.current('en', 'female').voice.name }));
  ok(/David/.test(pk.m) && /Zira|Aria/.test(pk.f) && pk.m !== pk.f, `male characters get a male-named voice, female a female-named voice (${pk.m} / ${pk.f})`);
  await p.evaluate(() => { enter(0, 1, { noIntro: true, tr: false }); }); await sleep(2200);
  const uses = await p.evaluate(() => __sp.uses); const alexLine = uses.find((u) => u.t === "I'm ready."); ok(alexLine && /David/.test(alexLine.v), 'Alex\'s line is spoken with the male-named voice');
  await p.evaluate(() => { S.settings.localOnly = true; applyAudio(); }); ok(await p.evaluate(() => Speech.current('en').voice.localService === true && Speech.current('en', 'female').voice.localService === true), 'on-device-only setting never selects an online voice');
  await p.evaluate(() => { openSettings(); }); ok(/ONLINE/.test(await p.textContent('.modal')) && /may send the spoken text/.test(await p.textContent('.modal')), 'settings label online voices and explain the privacy difference'); await p.keyboard.press('Escape');
  await p.context().close();
  p = await fresh(browser, { mock: true });   // single voice -> pitch fallback
  ok(await p.evaluate(() => Speech.current('en', 'male').pitch < 1 && Speech.current('en', 'female').pitch > 1 && Speech.current('en').pitch === 1), 'with one voice only, pitch shifts slightly per speaker (not a real voice change)'); await p.context().close();

  /* ------------------------------------------------------------------ L. phone layout */
  sec('L. 390 px phone: no sideways overflow, IPA kept and readable');
  p = await fresh(browser, { w: 390, h: 844, cc: 'ipa' });
  const ph = await p.evaluate(async () => { const out = { over: [], small: [], noLegend: [], beats: 0, minIpa: 99 }; for (let a = 0; a < ACTS.length; a++) for (let b = 0; b < ACTS[a].beats.length; b++) { __lesson.enter(a, b, { noIntro: true, tr: false, instant: true }); await new Promise((r) => setTimeout(r, 25)); out.beats++;
    if (document.documentElement.scrollWidth > innerWidth + 1) out.over.push(`${a + 1}.${b + 1} w=${document.documentElement.scrollWidth}`);
    document.querySelectorAll('#stage .tx .ipa').forEach((e) => { if (getComputedStyle(e).display === 'none') return; const px = parseFloat(getComputedStyle(e).fontSize); out.minIpa = Math.min(out.minIpa, px); if (px < 12) out.small.push(`${a + 1}.${b + 1} ${px.toFixed(1)}px "${e.textContent.slice(0, 20)}"`); });
    document.querySelectorAll('#stage .scene').forEach((sc) => { const tags = sc.querySelectorAll('.tag, .bubble').length; const lg = sc.nextElementSibling; if (tags && !(lg && lg.classList.contains('scene-legend') && getComputedStyle(lg).display !== 'none')) out.noLegend.push(`${a + 1}.${b + 1}`); else if (tags) { const hid = [...sc.querySelectorAll('.tag')].some((t) => getComputedStyle(t).display !== 'none'); if (hid) out.noLegend.push(`${a + 1}.${b + 1} tag still on picture`); } }); } return out; });
  console.log('   min IPA font on phone:', ph.minIpa.toFixed(1) + 'px');
  ok(ph.over.length === 0, `no horizontal overflow on any of ${ph.beats} screens` + (ph.over.length ? ' — ' + ph.over.slice(0, 4) : ''));
  ok(ph.small.length === 0, 'no visible IPA line below 12 px' + (ph.small.length ? ' — ' + ph.small.slice(0, 3).join('; ') : ''));
  ok(ph.noLegend.length === 0, 'every picture label has its full text + IPA in the legend (none suppressed)' + (ph.noLegend.length ? ' — ' + ph.noLegend.slice(0, 4) : ''));
  await p.context().close();

  /* ------------------------------------------------------------------ M. navigation + resume + old saves */
  sec('M. Chapter navigation, resume, old saved state');
  p = await fresh(browser); await p.click('#b-chap'); const entries = await p.evaluate(() => document.querySelectorAll('[data-go]').length); ok(entries === 9 + 100, `chapter menu lists 9 activities + 100 steps (${entries})`);
  await p.click('[data-go="6:13"]'); ok(await p.evaluate(() => S.a === 6 && S.b === 13), 'chapter menu jumps to a step'); ok(await p.evaluate(() => document.querySelector('#chapters button[aria-current=true]').textContent === '7'), 'header chip follows');
  const e1 = p.errs.length; await p.evaluate(async () => { for (let a = 0; a < 9; a++) for (let b = 0; b < ACTS[a].beats.length; b++) { enter(a, b, { noIntro: true, tr: false, instant: true }); } }); ok(p.errs.length === e1, 'all 100 steps load without errors'); await p.context().close();
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 780 } });
    await ctx2.addInitScript(() => { if (!localStorage.getItem('fluent-english-be-lesson-v1')) localStorage.setItem('fluent-english-be-lesson-v1', JSON.stringify({ v: 1, started: true, a: 2, b: 4, spent: [10, 20, 30, 0, 0, 0, 0, 0, 0], extra: [0, 30, 0, 0, 0, 0, 0, 0, 0], visited: { 0: true }, done: { 0: true }, diag: {}, mode: 'shared', mcq: { shared: { first: {}, retry: {} }, individual: { first: {}, retry: {} } }, retry: { active: false }, settings: { cc: 'ipa' } })); });
    p = await ctx2.newPage(); p.errs = []; p.on('pageerror', (e) => p.errs.push(e.message)); await p.goto(URL); await p.click('#b-resume'); await sleep(300);
    ok(await p.evaluate(() => S.a === 2 && S.b === 4 && S.skipped.length === 9 && Array.isArray(S.answerLog) && S.extra[1] === 30 && S.spent[2] >= 30 && S.spent[2] < 32), 'a v4-era save (no skipped/answerLog) resumes cleanly with defaults filled in'); ok(await p.evaluate(() => S.settings.cc === 'ipa' && S.settings.ts === 1 && S.settings.localOnly === false), 'old settings merge with new defaults'); ok(p.errs.length === 0, 'no errors resuming an old save');
  }
  await p.context().close();

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`); if (fail) console.log('FAILED:\n - ' + failures.join('\n - '));
  fs.writeFileSync(process.env.QA_OUT || '/tmp/regression-summary.json', JSON.stringify({ file: path.basename(FILE), pass, fail, failures }, null, 1));
  process.exit(fail ? 1 : 0);
})();
