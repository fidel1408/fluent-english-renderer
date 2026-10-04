// Screenshots of every step + every answer/feedback state at one viewport width. Usage: node build/contact.js desktop|phone OUTDIR
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const path = require('path'); const fs = require('fs');
const mode = process.argv[2] || 'desktop', OUT = process.argv[3] || '/tmp/shots'; const REAL = !!process.env.REAL; const W = +(process.env.VW || (mode === 'phone' ? 390 : 1280)), H0 = +(process.env.VH || (mode === 'phone' ? 844 : 720));
const FILE = path.resolve(__dirname, '../fluent-english-be-lesson.html'); fs.mkdirSync(OUT, { recursive: true });
const index = []; let n = 0;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H0 }, acceptDownloads: true });
  await ctx.addInitScript(() => { const voices = [{ name: 'Microsoft Aria Online (Natural)', lang: 'en-US', localService: false }, { name: 'Microsoft David', lang: 'en-US', localService: true }, { name: 'Microsoft Zira', lang: 'en-US', localService: true }, { name: 'Microsoft Sabina', lang: 'es-MX', localService: true }];
    class U { constructor(t) { this.text = t; } } window.SpeechSynthesisUtterance = U; Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => voices, addEventListener() {}, speak(u) { setTimeout(() => u.onend && u.onend(), 50); }, cancel() {} } }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + FILE); await p.evaluate(() => localStorage.clear()); await p.goto('file://' + FILE);
  const boot = (cc = 'ipa', ts = 1) => p.evaluate(([cc, ts]) => { S = Object.assign(fresh(), { started: true }); S.settings.cc = cc; S.settings.ts = ts; S.settings.mute = true; S.settings.rm = true; document.getElementById('start').hidden = true; document.querySelectorAll('.modal-bg').forEach((e) => e.remove()); MODALS.length = 0; document.body.classList.remove('nodock'); setPaused(false); applySettings(); }, [cc, ts]);
  const enter = async (a, bI) => { await p.evaluate(([a, b]) => { __lesson.enter(a, b, { noIntro: true, tr: false, instant: true }); }, [a, bI]); await p.waitForTimeout(60); };
  const shot = async (group, name, caption) => {
    // expand the viewport so long IPA / feedback is not cropped
    const need = await p.evaluate(() => { const g = (id) => (document.getElementById(id) || { offsetHeight: 0 }).offsetHeight; const pane = document.querySelector('#stage .pane, .modal'); const m = document.querySelector('.modal'); return m ? m.scrollHeight + 120 : (pane ? pane.scrollHeight : 0) + g('top') + g('caption') + g('dock') + 50; });
    if (!REAL) await p.setViewportSize({ width: W, height: Math.min(3200, Math.max(H0, need)) });   // REAL=1: keep the true device viewport (no expansion) await p.waitForTimeout(80);
    const file = `${String(++n).padStart(3, '0')}_${name.replace(/[^a-z0-9]+/gi, '-')}.png`; await p.screenshot({ path: path.join(OUT, file) });
    index.push({ file, group, name, caption: caption || name, w: W }); if (!REAL) await p.setViewportSize({ width: W, height: H0 });
  };
  /* ---- every step (IPA mode, Large text) ---- */
  await boot();
  const acts = await p.evaluate(() => ACTS.map((a) => ({ title: a.title, beats: a.beats.map((b) => ({ title: b.title, inv: b.inv ? b.inv.kind : 'teaching', hasAns: false })) })));
  for (let a = 0; a < acts.length; a++) for (let bI = 0; bI < acts[a].beats.length; bI++) {
    await enter(a, bI); const bt = acts[a].beats[bI];
    await shot(`activity-${a + 1}`, `A${a + 1}.${bI + 1} ${bt.title}`, `${a + 1}.${bI + 1} · ${bt.title} · ${bt.inv}`);
    if (await p.evaluate(() => !document.getElementById('b-reveal').disabled && !document.querySelector('.opt'))) { await p.evaluate(() => __lesson.toggleReveal()); await p.waitForTimeout(80); await shot(`activity-${a + 1}-answers`, `A${a + 1}.${bI + 1} ANSWER ${bt.title}`, `${a + 1}.${bI + 1} · answer revealed`); }
  }
  /* ---- interactive states ---- */
  await boot();
  const click = (sel) => p.click(sel); const S_ = 'states';
  await enter(2, 9); await click('.tile[data-t="am"]'); await shot(S_, 'build wrong tile feedback', 'A3 build: wrong tile → explanatory feedback');
  await click('.tile[data-t="He"]'); await shot(S_, 'build wrong pronoun feedback', 'A3 build: second wrong tile');
  for (const t of ['She', 'is', 'a']) await click(`.tile[data-t="${t}"]`); await shot(S_, 'build partial', 'A3 build: partly built');
  await click('.tile[data-t="doctor."]'); await shot(S_, 'build complete', 'A3 build: complete + explanation');
  await enter(2, 14); await click('.tile[data-t="a"]'); await click('.tile[data-t="am"]'); await shot(S_, 'build an-engineer tip', 'A3 build 6: tile "a" tip about an');
  await enter(5, 7); await click('.tile[data-t="Does"]'); await shot(S_, 'question build does tip', 'A6 build: "Does" → no do/does with be');
  const wb = async (words, name, cap) => { await enter(2, 15); for (const w of words) await click(`[data-w="${w}"]`); await click('#wb-check'); await shot(S_, name, cap); };
  await wb(['I', 'am', 'a student'], 'wordbank I am valid', 'Word bank: I am a student → Pattern OK (was rejected before the fix)');
  await wb(['she', 'is', 'happy'], 'wordbank she is valid', 'Word bank: she is happy → OK');
  await wb(['they', 'is', 'friends'], 'wordbank agreement hint', 'Word bank: they + is → agreement hint');
  await wb(['I'], 'wordbank incomplete', 'Word bank: "I" alone → incomplete');
  await wb(['we', 'are', 'a student'], 'wordbank plural hint', 'Word bank: we are a student → plural hint');
  await wb(['it', 'is', 'a teacher'], 'wordbank it person hint', 'Word bank: it + person → hint');
  await enter(0, 4); await click('[data-w="happy"]'); await shot(S_, 'feelings chosen', 'A1 feeling choice: I’m happy.');
  await enter(0, 5); await click('[data-o]:nth-of-type(2)'); await shot(S_, 'diagnostic recorded', 'A1 quick check: recorded, no score');
  await enter(3, 1); await click('[data-rep="2"]'); await shot(S_, 'contraction repeat', 'A4 contractions + Repeat');
  await enter(4, 5); await p.evaluate(() => __lesson.toggleReveal()); await shot(S_, 'true-false facts revealed', 'A5 true/false with Facts card, answer revealed');
  await enter(6, 2); await click('[data-extra]'); await shot(S_, 'lab extra challenge', 'A7 lab: Extra challenge on, starters hidden');
  await enter(1, 2); await click('#b-es'); await shot(S_, 'spanish help', 'Spanish Help panel open'); await click('#es-x');
  /* quiz states */
  await p.evaluate(() => { S.mode = 'shared'; });
  await enter(7, 3); await click('.opt[data-k="3"]'); await shot(S_, 'quiz Q4 selected', 'Quiz Q4: option selected, answer hidden');
  await click('#mq-sub'); await shot(S_, 'quiz Q4 wrong feedback', 'Quiz Q4: wrong → answer, explanation, speaking extension');
  await enter(7, 7); await click('.opt[data-k="2"]'); await click('#mq-sub'); await shot(S_, 'quiz Q8 correct', 'Quiz Q8: correct + story fact');
  await enter(7, 5); await click('#mq-skip'); await shot(S_, 'quiz Q6 skipped', 'Quiz Q6: skipped');
  for (const i of [0, 1, 2, 4, 6, 8, 9]) { await enter(7, i); await click(`.opt[data-k="${i === 6 ? 1 : 0}"]`); await click('#mq-sub'); }
  await enter(7, 10); await shot(S_, 'quiz results', 'Quiz results: first attempt, labeled class activity score');
  await click('#rs-retry'); await shot(S_, 'quiz retry first missed', 'Quiz retry round: first missed question');
  await click('.opt[data-k="2"]'); await click('#mq-sub'); await shot(S_, 'quiz retry correct', 'Quiz retry: correct');
  await p.evaluate(() => { S.mode = 'individual'; }); await enter(7, 0); await shot(S_, 'quiz individual mode', 'Quiz in Individual mode label'); await p.evaluate(() => { S.mode = 'shared'; });
  await enter(7, 10); await shot(S_, 'quiz results after retry', 'Quiz results with retry kept separate');
  /* checklists */
  await enter(6, 13); await p.check('input[data-k="A"][data-l="0"]'); await p.check('input[data-k="B"][data-l="1"]'); await shot(S_, 'participation checklist', 'A7 wrap-up: anonymous participation checklist');
  await enter(8, 5); await shot(S_, 'exit checklist', 'A9 teacher checklist');
  /* CC modes */
  await enter(1, 0); await p.evaluate(() => { S.settings.cc = 'off'; applyCC(); }); await shot(S_, 'cc off', 'CC/IPA: Off'); await p.evaluate(() => { S.settings.cc = 'cap'; applyCC(); }); await shot(S_, 'cc captions', 'CC/IPA: Captions'); await p.evaluate(() => { S.settings.cc = 'ipa'; applyCC(); });
  /* pause / timeup / hide */
  await enter(1, 1); await p.evaluate(() => setPaused(true)); await shot(S_, 'paused', 'Paused badge'); await p.evaluate(() => setPaused(false));
  await click('#b-skip'); await p.waitForTimeout(500); await shot(S_, 'timeup banner after skip', 'Skip timer → time-up banner (no auto-advance)');
  await click('#b-dock'); await shot(S_, 'controls hidden show button', 'Controls hidden: visible Show controls button'); await click('#show-dock');
  /* dialogs */
  const dlg = async (open, name, cap) => { await p.evaluate(open); await p.waitForTimeout(200); await shot('dialogs', name, cap); await p.keyboard.press('Escape'); };
  await dlg(() => openChapters(), 'chapters menu', 'Chapter menu (all 100 steps)');
  await dlg(() => openSettings(), 'settings voices', 'Voice & volume: narrator/male/female voices, ONLINE labels, privacy note');
  await dlg(() => openGuide(), 'teacher guide', 'Teacher guide (time-change warning, IPA honesty)');
  await dlg(() => openChart(), 'sound chart', 'Sound chart dialog with convention note');
  await dlg(() => openVideo(), 'sound chart video', 'Sound chart video dialog (lesson paused)');
  await p.evaluate(() => { setPaused(false); });
  await dlg(() => openResults(), 'results modal', 'Results summary with actual/added/skipped + answer sheet buttons');
  /* start screen */
  await p.evaluate(() => { save(true); document.getElementById('start').hidden = false; showStart(); }); await shot('dialogs', 'start screen resume', 'Start screen with Resume offer and privacy line');
  /* Extra large text on dense screens */
  await boot('ipa', 2);
  for (const [a, bI, nm] of [[0, 4, 'feelings'], [1, 2, 'he she it'], [2, 0, 'families'], [2, 15, 'word bank'], [3, 1, 'contractions'], [4, 2, 'negative table'], [5, 3, 'short answers table'], [6, 2, 'lab prompt with facts'], [7, 7, 'quiz Q8'], [7, 10, 'results'], [8, 6, 'recap']]) { await enter(a, bI); await shot('large-text', `XL ${nm}`, `Extra large text · ${a + 1}.${bI + 1} ${nm}`); }
  await enter(7, 3); await click('.opt[data-k="3"]'); await click('#mq-sub'); await shot('large-text', 'XL quiz Q4 feedback', 'Extra large text · quiz feedback');
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ mode, width: W, height: H0, real: REAL, shots: index, pageErrors: errs }, null, 1));
  console.log(`${mode}: ${index.length} screenshots, page errors ${errs.length}`); await b.close();
})();
