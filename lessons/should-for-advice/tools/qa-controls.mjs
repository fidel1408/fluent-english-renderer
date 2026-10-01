// Behavioural tests for the built lesson. Prints PASS/FAIL per check and writes docs/qa-results.json.
import { chromium } from 'playwright-core';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = []; const t = (name, ok, info) => { results.push({ name, ok: !!ok, info: info === undefined ? '' : String(info) }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info !== undefined && info !== '' ? '  [' + info + ']' : '')); };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
await p.goto('file://' + root + '/dist/should-for-advice.html'); await p.waitForTimeout(600);
const rect = (sel) => p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, r: r.right }; }, sel);
const ev = (f, a) => p.evaluate(f, a);

/* ---- opening state ---- */
t('title is exactly "Should for Advice"', await ev(() => document.title.startsWith('Should for Advice') && [...document.querySelectorAll('#startTitle .u .w')].map((x) => x.textContent).join(' ') === 'Should for Advice'));
t('start card shows IPA under each title word', await ev(() => [...document.querySelectorAll('#startTitle .u')].map((u) => u.querySelector('.p').textContent).join(' ') === '/ʃʊd/ /fɔːr/ /ædˈvaɪs/'), await ev(() => [...document.querySelectorAll('#startTitle .u .p')].map((x) => x.textContent).join(' ')));
const vp0 = await rect('#viewport'); const bar0 = await rect('#bar');
t('control bar visible before start', bar0.h > 40 && bar0.h < 70, 'bar height ' + bar0.h);
t('logo asset is the supplied logo (aspect preserved)', await ev(() => { const i = document.querySelector('#hud .logo-card img'); return i.naturalWidth / i.naturalHeight > 1.83 && i.naturalWidth / i.naturalHeight < 1.84; }));

/* ---- start ---- */
await p.evaluate(() => { document.getElementById('startBtn').click(); });
await p.waitForTimeout(700);
const vp1 = await rect('#viewport'); const bar1 = await rect('#bar');
t('after start the bar is hidden by default', await ev(() => document.getElementById('app').classList.contains('bar-hidden')));
t('hidden bar releases its layout space (viewport reaches window bottom)', Math.abs(vp1.b - 900) < 1.5 && vp1.h > vp0.h + 40, `viewport ${vp0.h}→${vp1.h}, bottom ${vp1.b}`);
t('hidden bar takes no space (height 0 / not rendered)', bar1.h < 1, 'bar h ' + bar1.h);
const st = await rect('#stage');
t('stage keeps 16:9 when bar hidden', Math.abs(st.w / st.h - 16 / 9) < 0.01, (st.w / st.h).toFixed(4));
t('stage fully inside viewport (no cropping)', st.x >= -0.5 && st.y >= -0.5 && st.r <= vp1.r + 0.5 && st.b <= vp1.b + 0.5);
const sb = await rect('#showBtn');
t('Show-controls button is visible and ≥44px', sb.w >= 44 && sb.h >= 44 && (await ev(() => getComputedStyle(document.getElementById('showBtn')).display !== 'none')), `${sb.w}x${sb.h}`);
t('Show button sits in a safe corner (bottom-right)', sb.r > 1500 && sb.b > 800);
t('Show button is keyboard focusable', await ev(() => { const b = document.getElementById('showBtn'); b.focus(); return document.activeElement === b; }));

/* ---- playback unaffected by hide/show ---- */
await ev(() => { FE.engine.setPlaying(true); });
await p.waitForTimeout(1500);
const before = await ev(() => ({ T: FE.engine.T, tok: FE.audio.token, playing: FE.engine.playing, seg: FE.engine.seg.id }));
await p.keyboard.press('h'); await p.waitForTimeout(500);
const showing = await ev(() => !document.getElementById('app').classList.contains('bar-hidden'));
const vp2 = await rect('#viewport'); const bar2 = await rect('#bar');
t('H key shows the bar', showing);
t('shown bar is compact (<=60px) and viewport shrinks by exactly the bar height', bar2.h <= 60 && Math.abs((vp1.h - vp2.h) - bar2.h) < 1.5, `bar ${bar2.h}, viewport ${vp1.h}→${vp2.h}`);
const st2 = await rect('#stage');
t('stage still 16:9 and inside viewport with bar shown', Math.abs(st2.w / st2.h - 16 / 9) < 0.01 && st2.b <= vp2.b + 0.5);
await p.keyboard.press('h'); await p.waitForTimeout(500);
const after = await ev(() => ({ T: FE.engine.T, tok: FE.audio.token, playing: FE.engine.playing, seg: FE.engine.seg.id }));
t('hide/show during playback does not pause or restart anything', after.playing && after.T > before.T && after.tok === before.tok && after.seg === before.seg, `T ${before.T.toFixed(1)}→${after.T.toFixed(1)} token ${before.tok}→${after.tok}`);
t('Hide controls button collapses the bar', await (async () => { await ev(() => FE.ui.setBar(false, false)); await p.waitForTimeout(400); await p.click('#hideBtn'); await p.waitForTimeout(500); return ev(() => document.getElementById('app').classList.contains('bar-hidden')); })());
t('Show button click restores the bar', await (async () => { await p.click('#showBtn'); await p.waitForTimeout(500); return ev(() => !document.getElementById('app').classList.contains('bar-hidden')); })());
await p.keyboard.press('h'); await p.waitForTimeout(400);
/* paused */
await ev(() => FE.engine.setPlaying(false)); const pT = await ev(() => FE.engine.T);
await p.keyboard.press('h'); await p.waitForTimeout(300); await p.keyboard.press('h'); await p.waitForTimeout(300);
t('hide/show while paused keeps it paused', await ev((pT) => !FE.engine.playing && Math.abs(FE.engine.T - pT) < 0.01, pT));
/* chapter change */
await ev(() => FE.engine.chapterJump(1)); await p.waitForTimeout(300);
t('hidden state survives chapter change', await ev(() => document.getElementById('app').classList.contains('bar-hidden')));
await ev(() => FE.ui.setBar(false, false)); await ev(() => FE.engine.chapterJump(1)); await p.waitForTimeout(300);
t('visible state survives chapter change', await ev(() => !document.getElementById('app').classList.contains('bar-hidden')));
await ev(() => FE.ui.setBar(true, false));
/* resize */
await p.setViewportSize({ width: 1280, height: 720 }); await p.waitForTimeout(400);
const vr = await rect('#viewport'), sr = await rect('#stage');
t('resize keeps hidden state and 16:9', (await ev(() => document.getElementById('app').classList.contains('bar-hidden'))) && Math.abs(sr.w / sr.h - 16 / 9) < 0.01 && sr.b <= vr.b + 0.5, `${sr.w.toFixed(0)}x${sr.h.toFixed(0)}`);
await p.setViewportSize({ width: 1000, height: 900 }); await p.waitForTimeout(400);
const sr2 = await rect('#stage'), vr2 = await rect('#viewport');
t('narrow window letterboxes (no stretch, no crop)', Math.abs(sr2.w / sr2.h - 16 / 9) < 0.01 && sr2.r <= vr2.r + 0.5 && sr2.x >= -0.5, `${sr2.w.toFixed(0)}x${sr2.h.toFixed(0)}`);
await p.setViewportSize({ width: 1600, height: 900 }); await p.waitForTimeout(300);
/* fullscreen */
const fsOk = await ev(async () => { try { await document.documentElement.requestFullscreen(); return !!document.fullscreenElement; } catch (e) { return 'unsupported: ' + e.message; } });
await p.waitForTimeout(500);
if (fsOk === true) {
  t('fullscreen keeps hidden state', await ev(() => document.getElementById('app').classList.contains('bar-hidden')));
  await p.keyboard.press('h'); await p.waitForTimeout(400);
  t('H works in fullscreen', await ev(() => !document.getElementById('app').classList.contains('bar-hidden')));
  await p.keyboard.press('h'); await p.waitForTimeout(300);
  await ev(() => document.exitFullscreen()); await p.waitForTimeout(500);
  t('hidden state survives leaving fullscreen', await ev(() => document.getElementById('app').classList.contains('bar-hidden')));
} else t('fullscreen transitions (headless browser could not enter fullscreen)', false, fsOk + ' — UNVERIFIED in this environment');
/* H ignored in inputs */
await ev(() => FE.engine.goto(FE.segs.find((s) => s.id === '7.4').start + 20)); await p.waitForTimeout(400);
const hidBefore = await ev(() => document.getElementById('app').classList.contains('bar-hidden'));
await p.click('.paper input[type=text], input[type=text]'); await p.keyboard.type('h'); await p.waitForTimeout(200);
t('H is ignored while typing in a text field', hidBefore === (await ev(() => document.getElementById('app').classList.contains('bar-hidden'))) && (await ev(() => document.querySelector('input[type=text]').value)) === 'h');
/* form checker (typed task) */
const fc = await ev(() => ['She should calls him.', 'You should to ask.', 'He doesn\'t should wait.', 'Do I should call?', 'What I should do?', 'You should call her.', 'You shouldn\'t ignore the message.', 'Should I call her?', 'What should I do?', 'We should leave earlier.', 'They should leaves earlier.'].map((s) => [s, FE.checkForm(s).formOk]));
const expect = [false, false, false, false, false, true, true, true, true, true, false];
t('form checker flags each genuine learner error and accepts correct forms', fc.every((r, i) => r[1] === expect[i]), JSON.stringify(fc.map((r) => r[1])));

/* ---- mode semantics & whole-lesson simulation ---- */
await ev(() => { FE.qa = true; FE.engine.setPlaying(false); FE.engine.restart(); });
const sim = await ev(() => {
  const E = FE.engine, out = { gates: 0, order: [], mem: [] }; E.setMode('class'); E.finished = false; E.goto(0);
  let guard = 0; const seen = new Set();
  while (!E.finished && guard++ < 200000) {
    if (!seen.has(E.seg.id)) { seen.add(E.seg.id); out.order.push(E.seg.id); }
    if (E.gate) { out.gates++; E.continueGate(); continue; }
    E.advance(0.5);
  }
  out.finishedAt = E.T; out.segsSeen = seen.size; out.total = FE.segs.length; return out;
});
t('CLASS mode: every segment visited, lesson reaches 60:00, gates hold until Continue', sim.segsSeen === sim.total && sim.gates > 20, `segments ${sim.segsSeen}/${sim.total}, gates ${sim.gates}`);
const gateHold = await ev(() => { const E = FE.engine; E.finished = false; E.setMode('class'); const s = FE.segs.find((x) => x.id === '5.1'); E.goto(s.start + 1); let n = 0; while (!E.gate && n++ < 400) E.advance(0.5); const T0 = E.T; for (let i = 0; i < 200; i++) E.advance(0.5); return { gate: E.gate, held: Math.abs(E.T - T0) < 0.001, atEnd: Math.abs(E.T - s.end) < 0.6, seg: E.seg.id }; });
t('CLASS gate holds the clock (no auto-advance) at end of an activity', gateHold.gate && gateHold.held && gateHold.seg === '5.1', JSON.stringify(gateHold));
const demo = await ev(() => { const E = FE.engine; E.finished = false; E.setMode('demo'); E.goto(0); const t0 = performance.now(); let n = 0, gates = 0; while (!E.finished && n++ < 20000) { if (E.gate) { gates++; E.continueGate(); } E.advance(0.5); } return { T: E.T, gates, n, ms: performance.now() - t0 }; });
t('DEMO mode: deterministic 60:00 with no gates', demo.gates === 0 && demo.T >= 3599 && Math.abs(demo.n * 0.5 - 3600) < 120, `T=${demo.T.toFixed(1)}, ticks×0.5=${demo.n * 0.5}`);
t('planned chapters total exactly 3600 s', await ev(() => FE.chapters.reduce((a, c) => a + (c.b - c.a), 0) === 3600 && FE.segs.reduce((a, s) => a + s.dur, 0) === 3600 && FE.layoutIssues.length === 0), await ev(() => JSON.stringify(FE.layoutIssues)));
t('chapter allocations 5/8/8/8/10/15/6 minutes', await ev(() => FE.chapters.map((c) => (c.b - c.a) / 60).join('/') === '5/8/8/8/10/15/6'));
t('every segment narration fits inside its planned duration', await ev(() => FE.segs.every((s) => !s.lines.length || s.speechEnd + 0.1 <= s.dur)), await ev(() => FE.segs.filter((s) => s.lines.length && s.speechEnd + 0.1 > s.dur).map((s) => s.id + ':' + s.speechEnd.toFixed(1) + '>' + s.dur).join(' ')));

/* ---- timers ---- */
const tm = await ev(() => { const E = FE.engine; E.finished = false; E.setMode('class'); const s = FE.segs.find((x) => x.id === '5.2'); E.goto(s.start + s.timerAt + 1); const a = E.timerInfo().rem; E.extend(60); E.goto(s.start + s.timerAt + 1); E.extend(60); let n = 0; while (!E.gate && n++ < 2000) E.advance(0.5); const ext = E.extPending; E.restartTimer(); return { a, restartedAt: E.local - s.timerAt, ti: E.timerInfo() }; });
t('timer restart returns to the start of the response interval', Math.abs(tm.restartedAt) < 0.01 && tm.ti.rem > 40);
const ex = await ev(() => { const E = FE.engine; E.finished = false; E.setMode('class'); const s = FE.segs.find((x) => x.id === '5.2'); E.goto(s.end - 3); E.extend(60); for (let i = 0; i < 12; i++) E.advance(0.5); const mid = E.timerInfo().rem; for (let i = 0; i < 160; i++) E.advance(0.5); return { mid, gate: E.gate, T: E.T, end: s.end, seg: E.seg.id }; });
t('"more time" extends an activity beyond its planned end before the gate', ex.mid > 55 && ex.gate && ex.seg === '5.2', JSON.stringify(ex));
const skip = await ev(() => { const E = FE.engine; const s = FE.segs.find((x) => x.id === '5.3'); E.goto(s.start + 10); E.skipTimer(); return E.seg.id; });
t('skip jumps to the next segment', skip === '5.4', skip);

/* ---- genuine validation ---- */
const val = await ev(() => {
  const E = FE.engine; E.setMode('class'); E.finished = false; const r = {};
  E.goto(FE.segs.find((s) => s.id === '5.6').start + 12);
  const P = document.querySelector('.panel'); const opts = [...P.querySelectorAll('.opt')];
  opts[1].click(); r.wrongMarked = opts[1].classList.contains('no') && !opts[1].classList.contains('ok');
  opts[0].click(); r.rightMarked = opts[0].classList.contains('ok') && /✓/.test(opts[0].textContent);
  r.fbHasText = P.querySelector('.feedback').textContent.length > 5;
  return r;
});
t('single-answer question: wrong option marked wrong, right option accepted with explanation', val.wrongMarked && val.rightMarked && val.fbHasText, JSON.stringify(val));
const multi = await ev(() => {
  const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '5.9').start + 12);
  const P = document.querySelector('.panel'); const o = [...P.querySelectorAll('.opt')];
  [0, 1, 2].forEach((i) => o[i].click()); [...P.querySelectorAll('.btn')].find((b) => /Check/.test(b.textContent)).click();
  return { allOk: [0, 1, 2].every((i) => o[i].classList.contains('ok')), badDim: [3, 4, 5].every((i) => !o[i].classList.contains('ok')), fb: P.querySelector('.feedback').className };
});
t('identify-all-reasonable task accepts the three reasonable ideas and leaves unhelpful ones unmarked', multi.allOk && multi.badDim && /good/.test(multi.fb), JSON.stringify(multi));
const multi2 = await ev(() => { const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '5.9').start + 12); const P = document.querySelector('.panel'); const o = [...P.querySelectorAll('.opt')]; o[3].click(); [...P.querySelectorAll('.btn')].find((b) => /Check/.test(b.textContent)).click(); return { fb: P.querySelector('.feedback').className, bad: o[3].classList.contains('no') }; });
t('selecting an unhelpful idea is not marked correct', multi2.bad && !/good/.test(multi2.fb), JSON.stringify(multi2));
const build = await ev(() => {
  const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '5.2').start + 12);
  const P = document.querySelector('.panel'); const click = (w) => { const b = [...P.querySelectorAll('.tray .tile')].find((x) => x.textContent.replace(/\/[^/]*\//g, '').trim() === w && !x.disabled); b.click(); };
  const check = () => [...P.querySelectorAll('.btn')].find((b) => /Check/.test(b.textContent)).click();
  ['She', 'should', 'asks', 'for', 'help'].forEach(click); check(); const wrong = P.querySelector('.slots').classList.contains('no') && /base verb/.test([...P.querySelectorAll('.feedback .w')].map((w) => w.textContent).join(' '));
  [...P.querySelectorAll('.btn')].find((b) => /Clear/.test(b.textContent)).click();
  ['She', 'should', 'ask', 'for', 'help'].forEach(click); check(); return { wrong, right: P.querySelector('.slots').classList.contains('ok') };
});
t('sentence builder rejects "asks" with a specific explanation and accepts the correct order', build.wrong && build.right, JSON.stringify(build));
const rep = await ev(() => {
  const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '5.4').start + 12);
  const P = document.querySelector('.panel'); const before = P.querySelector('.sent').textContent; const opts = [...P.querySelectorAll('.opt')];
  const badStays = P.querySelector('.bad').style.borderColor;
  opts[1].click(); const stillBad = /incorrect/.test(P.querySelector('.badge').textContent);
  opts[0].click();
  return { stillBad, fixedBadge: /correct/.test(P.querySelector('.badge').textContent) && !/incorrect/.test(P.querySelector('.badge').textContent), sentenceNow: [...P.querySelectorAll('.sent .w')].map((w) => w.textContent).join(' ') };
});
await p.waitForTimeout(1800);
const rep2 = await ev(() => [...document.querySelectorAll('.panel .sent .w')].map((w) => w.textContent).join(' '));
t('repair task: sentence stays marked incorrect until the right repair is chosen, then becomes correct', rep.stillBad && /^She should call him\.$/.test(rep2), rep2);

/* ---- branching ---- */
const br = await ev(() => {
  const E = FE.engine; E.setMode('class'); E.finished = false;
  const words = (el) => [...el.querySelectorAll('.w')].map((w) => w.textContent).join(' ');
  const run = (n1, n2) => {
    E.mission = {}; E.goto(FE.segs.find((s) => s.id === '6.5').start + 10);
    document.querySelectorAll('.panel .cards .opt')[n1].click();
    const f1 = [...document.querySelectorAll('.tok')].map((el) => el.innerHTML.includes('✓')).join(',');
    const note1 = words([...document.querySelectorAll('.panel')].find((x) => /maybe/.test(x.textContent) && x.style.display !== 'none') || document.body);
    E.goto(FE.segs.find((s) => s.id === '6.8').start + 30);
    document.querySelectorAll('.panel .cards .opt')[n2].click();
    const f2 = [...document.querySelectorAll('.tok')].map((el) => el.innerHTML.includes('✓')).join(',');
    const all = [...document.querySelectorAll('.panel')].map(words).join(' | ');
    return { f1, f2, note1: note1.slice(0, 60), res: all.includes('Your two steps') ? 'good' : all.includes('same kind') ? 'same' : 'none', mood: E.scene.actors[0].exprName };
  };
  return { a: run(0, 0), b: run(0, 1), c: run(1, 2), d: run(2, 1), e: run(1, 0) };
});
t('mission: different first choices produce different scene states and different outcome narration', new Set([br.a.f1, br.c.f1, br.d.f1]).size === 3 && new Set([br.a.note1, br.c.note1, br.d.note1]).size === 3, JSON.stringify([br.a.f1, br.c.f1, br.d.f1]));
t('mission: revised advice changes the final state (complementary steps = "good", repeated step = "same")', br.a.res === 'good' && br.b.res === 'same' && br.c.res === 'same' && br.d.res === 'good' && br.e.res === 'good' && br.a.f2 !== br.b.f2, JSON.stringify([br.a.res, br.b.res, br.c.res, br.d.res, br.e.res]));
t('mission: the character\'s mood follows the state (two steps = relief, one = think)', br.a.mood === 'relief' && br.b.mood === 'think', JSON.stringify([br.a.mood, br.b.mood]));


/* ---- every control-bar button really works (real clicks) ---- */
{
  const page2 = await (await b.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' })).newPage(); const e2 = [];
  page2.on('pageerror', (e) => e2.push(e.message)); page2.on('console', (m) => { if (m.type() === 'error') e2.push(m.text().slice(0, 160)); });
  await page2.goto('file://' + root + '/dist/should-for-advice.html'); await page2.waitForTimeout(400);
  await page2.evaluate(() => { FE.qa = true; document.getElementById('startBtn').click(); FE.engine.setPlaying(false); FE.ui.setBar(false, false); FE.engine.goto(FE.segs.find((s) => s.id === '5.3').start + 20); });
  await page2.waitForTimeout(300);
  const btn = (n) => page2.locator('#bar button').nth(n); const S2 = (f, a) => page2.evaluate(f, a);
  const names = await S2(() => [...document.querySelectorAll('#bar button')].map((b) => b.getAttribute('aria-label') || b.className));
  const idx = (label) => names.findIndex((n) => n === label);
  const T0 = await S2(() => FE.engine.T);
  await page2.click('#bar button[aria-label="Play" i]'); await page2.waitForTimeout(150);
  t('bar: Play starts the lesson clock', await S2(() => FE.engine.playing));
  await page2.click('#bar button[aria-label="Pause" i]'); await page2.waitForTimeout(100);
  t('bar: Pause stops it', await S2(() => !FE.engine.playing));
  await page2.click('#bar button[aria-label="Forward five seconds" i]'); t('bar: forward 5 s', await S2((T0) => Math.abs(FE.engine.T - T0 - 5) < 0.2, T0));
  await page2.click('#bar button[aria-label="Back five seconds" i]'); t('bar: back 5 s', await S2((T0) => Math.abs(FE.engine.T - T0) < 0.2, T0));
  await page2.click('#bar button[aria-label="Next chapter" i]'); t('bar: next chapter', await S2(() => FE.engine.chapterOf(FE.engine.T).n === 6));
  await page2.click('#bar button[aria-label="Previous chapter" i]'); t('bar: previous chapter at a chapter start goes to the previous chapter start', await S2(() => FE.engine.T === FE.chapters[4].a));
  await page2.click('#bar button[aria-label="Replay this example" i]'); t('bar: replay restarts the current example', await S2(() => FE.engine.local === 0));
  await S2(() => FE.engine.goto(FE.segs.find((s) => s.id === '5.3').start + 20));
  await page2.click('#bar button[aria-label="Hint" i]'); t('bar: hint shows the optional hint card', await S2(() => !!document.querySelector('.hintcard')));
  await page2.click('#bar button[aria-label="Show answer" i]'); t('bar: answer reveal marks the correct option', await S2(() => !!document.querySelector('.opt.ok')));
  await S2(() => FE.engine.goto(FE.segs.find((s) => s.id === '5.3').start + 20));
  await page2.click('#bar button[aria-label="More time" i]'); t('bar: more time adds a minute', await S2(() => FE.engine.extPending === 60 || FE.engine.ext === 60));
  await page2.click('#bar button[aria-label="Skip" i]'); t('bar: skip moves on', await S2(() => FE.engine.seg.id === '5.4'));
  await page2.click('#bar button[aria-label="Restart timer" i]'); t('bar: restart timer', await S2(() => FE.engine.local === FE.engine.seg.timerAt));
  await page2.click('#bar .modeb'); t('bar: mode toggle switches CLASS/DEMO', await S2(() => FE.engine.mode === 'demo'));
  await page2.click('#bar .modeb'); 
  await page2.click('#bar button[aria-label="Sound" i]'); t('bar: sound popover opens', await S2(() => document.getElementById('soundPop').classList.contains('on')));
  await page2.fill('#soundPop input[aria-label="music"]', '0.2'); await page2.dispatchEvent('#soundPop input[aria-label="music"]', 'input');
  await page2.fill('#soundPop input[aria-label="narration"]', '0.4'); await page2.dispatchEvent('#soundPop input[aria-label="narration"]', 'input');
  t('bar: narration, music and effects have separate volume controls', await S2(() => Math.abs(FE.audio.vol.mus - 0.2) < 0.01 && Math.abs(FE.audio.vol.nar - 0.4) < 0.01 && !!document.querySelector('#soundPop input[aria-label="effects"]')));
  await page2.click('#soundPop button[aria-label="Mute narration" i]'); t('bar: mute narration', await S2(() => FE.audio.mute.nar === true));
  await S2(() => { FE.audio.setMute('nar', false); FE.audio.setVol('nar', 1); FE.audio.setVol('mus', 0.7); document.getElementById('soundPop').classList.remove('on'); });
  await page2.click('#bar button[aria-label="Teacher notes" i]'); t('bar: teacher notes panel', await S2(() => document.getElementById('notes').classList.contains('on') && document.getElementById('notes').textContent.length > 20));
  await page2.keyboard.press('Escape');
  await page2.click('#bar button[aria-label="Restart lesson" i]'); t('bar: restart asks for confirmation first', await S2(() => document.getElementById('modal').classList.contains('on') && FE.engine.T > 0));
  await page2.click('#mNo'); t('bar: cancelling keeps the lesson where it is', await S2(() => !document.getElementById('modal').classList.contains('on') && FE.engine.T > 0));
  await page2.click('#bar button[aria-label="Restart lesson" i]'); await page2.click('#mYes'); t('bar: confirming restarts at 00:00 and reopens the start card', await S2(() => FE.engine.T === 0 && document.getElementById('start').style.display !== 'none'));
  t('reduced-motion: bar has no transition', await S2(() => getComputedStyle(document.getElementById('bar')).transitionDuration.split(',').every((d) => parseFloat(d) === 0)));
  t('no errors during the control click-through', e2.length === 0, e2.slice(0, 3).join(' | '));
  await page2.close();
}

/* ---- IPA structure ---- */
const ipa = {};
await ev(() => { FE.qa = true; });
const tot = await ev(() => {
  const E = FE.engine; let units = 0, bad = []; const txt = [];
  for (const s of FE.segs) {
    E.goto(s.start + s.dur * 0.6); const S = E.scene; (S.ctls || []).forEach((c) => c.items && c.goto && c.items.forEach((_, i) => { c.goto(i, true); c.reveal && c.reveal(); })); S.doReveal();
    document.querySelectorAll('.u').forEach((u) => { units++; const w = u.querySelector('.w'), pp = u.querySelector('.p'); if (!w || !pp || !pp.textContent.trim() || pp.textContent === '/?/' || !/^\/.+\/$/.test(pp.textContent)) bad.push(s.id + ':' + u.textContent); });
    // English words outside units
    const walker = document.createTreeWalker(document.getElementById('stage'), NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) {
      const tx = n.textContent.trim(); if (!/[A-Za-z]{2,}/.test(tx) && !/\+/.test(tx)) continue;
      const el = n.parentElement; if (el.closest('.u, svg, script, style, .sr')) continue;
      txt.push(s.id + ':' + tx.slice(0, 30));
    }
  }
  return { units, bad: bad.slice(0, 20), nBad: bad.length, loose: [...new Set(txt)].slice(0, 30) };
});
t('every displayed English word is a word-over-IPA unit with non-empty IPA', tot.nBad === 0, `${tot.units} units checked; bad: ${JSON.stringify(tot.bad)}`);
t('no English words displayed outside word-over-IPA units (stage content)', tot.loose.length === 0, JSON.stringify(tot.loose));
t('no missing lexicon entries', (await ev(() => [...FE.missing])).length === 0, JSON.stringify(await ev(() => [...FE.missing])));
t('every "+" shown has /plʌs/ beneath', await ev(() => { const E = FE.engine; let ok = true; for (const s of FE.segs) { E.goto(s.start + s.dur * 0.7); document.querySelectorAll('.u.plus').forEach((u) => { if (u.querySelector('.p').textContent !== '/plʌs/') ok = false; }); } return ok; }));
t('no console/page errors during tests', errs.length === 0, errs.slice(0, 3).join(' | '));

/* ---- long-run resource check (demo mode, 60 simulated minutes) ---- */
const mem = await ev(() => {
  const E = FE.engine; E.finished = false; E.setMode('demo'); E.goto(0); const samples = []; let n = 0;
  while (!E.finished && n++ < 20000) { E.advance(0.5); if (n % 800 === 0) samples.push({ T: Math.round(E.T), nodes: document.getElementsByTagName('*').length, actors: FE.Loop.actors.size, hooks: FE.Loop.hooks.size, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : -1 }); }
  return samples;
});
const nodes = mem.map((m) => m.nodes), maxNodes = Math.max(...nodes);
t('DOM size stays bounded over the full simulated hour', maxNodes < 6000 && mem[mem.length - 1].actors <= 4, `max nodes ${maxNodes}, last ${JSON.stringify(mem[mem.length - 1])}`);
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/qa-results.json'), JSON.stringify({ date: new Date().toISOString(), results, memorySamples: mem }, null, 1));
const fails = results.filter((r) => !r.ok); console.log(`\n${results.length - fails.length}/${results.length} passed`); if (fails.length) console.log('FAILED:', fails.map((f) => f.name).join('; '));
await b.close();
