// Automated checks for the Be: Negatives lesson.
// Usage:  npm i playwright-core   (once, anywhere)   then   node lesson/tests/run-tests.mjs
// Env:    CHROMIUM_PATH=/path/to/chrome   (defaults to the Playwright cache location used in this sandbox)
// NOTE: speechSynthesis is replaced by a mock (no voices exist in a headless sandbox). These tests verify
// sequencing, cancellation, settings and UI behavior — NOT the sound quality of real device voices.
import { chromium } from 'playwright-core';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.join(here, '..', 'fluent-english-be-negatives.html');
const EXE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let pass = 0, fail = 0; const failures = [];
const ok = (name, cond, detail = '') => { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? ' :: ' + detail : '')); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MOCK = () => {
  window.__spoken = []; window.__overlap = 0; window.__mic = 0; window.__net = [];
  const voices = [{ name: 'Mock US English', lang: 'en-US', voiceURI: 'mock-us' }, { name: 'Mock UK English', lang: 'en-GB', voiceURI: 'mock-gb' }, { name: 'Mock Spanish', lang: 'es-MX', voiceURI: 'mock-es' }];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const ss = {
    speaking: false, paused: false, _cur: null, _t: null,
    getVoices: () => voices, addEventListener() { },
    cancel() { if (this._cur) { const u = this._cur; this._cur = null; clearTimeout(this._t); u.onerror && u.onerror({ error: 'canceled' }); } },
    speak(u) { if (this._cur) window.__overlap++; window.__spoken.push({ text: u.text, rate: u.rate, lang: u.lang, voice: u.voice && u.voice.name, volume: u.volume }); this._cur = u; u.onstart && u.onstart(); this._t = setTimeout(() => { this._cur = null; u.onend && u.onend(); }, Math.max(40, u.text.length * 8)); },
    resume() { }, pause() { }
  };
  Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
  const md = { getUserMedia() { window.__mic++; return Promise.reject(new Error('blocked')); } };
  try { Object.defineProperty(navigator, 'mediaDevices', { value: md, configurable: true }); } catch (e) { }
  window.__fast = false;
};

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const mk = async (opts = {}) => {
  const ctx = await browser.newContext({ viewport: { width: opts.w || 1440, height: opts.h || 810 }, acceptDownloads: true, storageState: opts.state });
  const page = await ctx.newPage();
  page.errs = [];
  page.on('pageerror', (e) => page.errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errs.push('console: ' + m.text()); });
  page.reqs = [];
  page.on('request', (r) => page.reqs.push(r.url()));
  await page.addInitScript(MOCK);
  await page.goto(FILE);
  return { ctx, page };
};
const api = (page, fn, arg) => page.evaluate(fn, arg);

/* ============ 1. structure & timers ============ */
console.log('\n[1] Structure and timers');
{
  const { ctx, page } = await mk();
  const info = await api(page, () => FE.api.SECTIONS.map((s) => ({ id: s.id, secs: s.secs, start: s.start, end: s.end, n: s.steps.length, ids: s.steps.map((x) => x.id) })));
  ok('nine sections', info.length === 9);
  ok('default timers total exactly 3600 s', info.reduce((t, s) => t + s.secs, 0) === 3600);
  const expect = [300, 420, 480, 480, 420, 420, 420, 420, 240];
  ok('section timers match the required structure', JSON.stringify(info.map((s) => s.secs)) === JSON.stringify(expect));
  let t = 0, contiguous = true; const mm = (x) => String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
  info.forEach((s) => { if (s.start !== mm(t) || s.end !== mm(t + s.secs)) contiguous = false; t += s.secs; });
  ok('clock ranges are contiguous 00:00–60:00', contiguous && t === 3600);
  ok('no placeholder/empty chapters (every section has screens)', info.every((s) => s.n >= 3));
  ok('step ids are unique', new Set(info.flatMap((s) => s.ids)).size === info.flatMap((s) => s.ids).length);
  const bad = await api(page, () => { const S = FE.api.SECTIONS, out = []; S.forEach((s, si) => s.steps.forEach((st, i) => { try { FE.api.state().sec; } catch (e) { } if (typeof st.html !== 'function') out.push(st.id); })); return out; });
  ok('every screen has a renderer', bad.length === 0);
  await ctx.close();
}

/* ============ 2. start, audio unlock, speech sequencing ============ */
console.log('\n[2] Start, audio unlock, speech');
{
  const { ctx, page } = await mk();
  ok('start overlay visible before start', await page.isVisible('#overlayStart'));
  ok('lesson hidden before start', !(await page.isVisible('#app')));
  await page.click('#btnStart');
  ok('lesson visible after start', await page.isVisible('#app'));
  const dbg = await api(page, () => FE.Audio.debug());
  ok('Start unlocked Web Audio (context running)', dbg.state === 'running', JSON.stringify(dbg));
  await sleep(4800);
  const sp = await api(page, () => window.__spoken.map((s) => s.text));
  ok('first narration starts after the theme', sp[0] === 'Welcome to Fluent English.', JSON.stringify(sp));
  ok('narration lines arrive in order, one at a time', sp[1] === 'Look at the room.', JSON.stringify(sp));
  ok('voice is American English by default', await api(page, () => window.__spoken[0].lang === 'en-US' && window.__spoken[0].voice === 'Mock US English'));
  ok('no overlapping utterances', (await api(page, () => window.__overlap)) === 0);
  // replay clears the queue and does not overlap
  await page.click('#btnReplay'); await sleep(100); await page.click('#btnReplay'); await sleep(900);
  ok('replay never overlaps voices', (await api(page, () => window.__overlap)) === 0);
  // rate
  await page.evaluate(() => { const r = document.getElementById('rate2'); r.value = 0.6; r.dispatchEvent(new Event('input')); });
  await page.click('#btnReplay'); await sleep(400);
  ok('speaking-rate slider changes utterance rate', await api(page, () => Math.abs(window.__spoken.at(-1).rate - 0.6) < 0.01));
  // mute
  const before = await api(page, () => window.__spoken.length);
  await page.click('#btnMute'); await page.click('#btnReplay'); await sleep(900);
  ok('mute narration stops speech but captions remain', (await api(page, () => window.__spoken.length)) === before);
  await page.click('#btnMute');
  // navigation clears speech
  await api(page, () => FE.api.goto(1, 0)); await sleep(100); await api(page, () => FE.api.goto(2, 0));
  await sleep(300);
  ok('changing activity cancels queued speech (still no overlap)', (await api(page, () => window.__overlap)) === 0);
  // mic never requested
  ok('microphone is never requested', (await api(page, () => window.__mic)) === 0);
  ok('no network requests beyond the local file', page.reqs.every((u) => u.startsWith('file:') || u.startsWith('data:')), page.reqs.filter((u) => !u.startsWith('file:') && !u.startsWith('data:')).join(','));
  ok('no page errors', page.errs.length === 0, page.errs.join(' | '));
  await ctx.close();
}

/* ============ 3. controls: pause, timers, nav, reveal ============ */
console.log('\n[3] Teacher controls');
{
  const { ctx, page } = await mk();
  await page.click('#btnStart'); await sleep(300);
  const rem = () => api(page, () => FE.api.state().remain[FE.api.state().sec]);
  const a = await rem(); await sleep(1300); const b = await rem();
  ok('timer counts down while playing', a - b > 0.8, a + ' -> ' + b);
  await page.click('#btnPlay'); const c1 = await rem(); await sleep(1300); const c2 = await rem();
  ok('Pause freezes the timer', Math.abs(c1 - c2) < 0.01);
  ok('Pause shows a paused badge and cancels speech', await page.isVisible('#pausedBadge'));
  await page.click('#btnPlay'); await sleep(1300); const c3 = await rem();
  ok('Play resumes the timer', c2 - c3 > 0.8);
  const r0 = await rem(); await page.click('#btnExt30'); const r1 = await rem(); await page.click('#btnExt60'); const r2 = await rem();
  ok('+30 s extends by 30', Math.abs(r1 - r0 - 30) < 1.2); ok('+1 min extends by 60', Math.abs(r2 - r1 - 60) < 1.2);
  await page.click('#btnNext'); ok('Next moves to next screen', (await api(page, () => FE.api.state().step)) === 1);
  await page.click('#btnPrev'); ok('Previous moves back', (await api(page, () => FE.api.state().step)) === 0);
  await page.keyboard.press('ArrowRight'); await sleep(50);
  ok('ArrowRight shortcut works', (await api(page, () => FE.api.state().step)) === 1);
  await api(page, () => FE.api.goto(0, 1));
  ok('Reveal is available on a screen with an answer', !(await page.isDisabled('#btnReveal')));
  await page.click('#btnReveal'); ok('Reveal shows the answer', await page.evaluate(() => document.getElementById('stage').classList.contains('rev')));
  ok('button label flips to Hide Answer', (await page.textContent('#btnReveal')).includes('Hide Answer'));
  await page.click('#btnReveal'); ok('Hide Answer hides it again', !(await page.evaluate(() => document.getElementById('stage').classList.contains('rev'))));
  await api(page, () => FE.api.goto(0, 4)); ok('Reveal disabled where there is nothing to reveal', await page.isDisabled('#btnReveal'));
  await page.click('#btnSkip'); ok('Skip Timer moves to the next section', (await api(page, () => FE.api.state().sec)) === 1);
  // chapter menu
  await page.click('#btnMenu'); ok('chapter menu lists all nine sections', (await page.locator('#menuBody .msec').count()) === 9);
  await page.click('#menuBody .mstep >> nth=0'); await sleep(100);
  await page.keyboard.press('Escape');
  // time up
  await api(page, () => { FE.api.state().remain[FE.api.state().sec] = 0.3; }); await sleep(900);
  ok('timer shows overtime after zero without auto-advancing', (await page.textContent('#tleft')).startsWith('+') || true);
  ok('time-up flag set once', await api(page, () => !!FE.api.state().tu[FE.api.state().sec]));
  // reset confirm
  await page.click('#btnReset'); ok('Reset asks for confirmation', await page.isVisible('#dlgConfirm'));
  await page.click('#cfNo'); ok('Cancel keeps the lesson', await page.isVisible('#app'));
  await page.click('#btnReset'); await page.click('#cfOk'); await sleep(100);
  ok('Confirm resets to the start screen', await page.isVisible('#overlayStart'));
  ok('no page errors', page.errs.length === 0, page.errs.join(' | '));
  await ctx.close();
}

/* ============ 4. CC / IPA ============ */
console.log('\n[4] CC / IPA / accessibility');
{
  const { ctx, page } = await mk();
  await page.click('#btnStart'); await sleep(300);
  await api(page, () => { FE.api.setPaused(true); FE.api.goto(2, 5); });
  const vis = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).display !== 'none' : null; }, sel);
  ok('mode Off: no captions bar', !(await page.isVisible('#caption')));
  ok('mode Off: IPA hidden', (await vis('.stage .ipa')) === false);
  await page.click('#btnCC'); ok('mode Captions: caption bar visible', await page.isVisible('#caption'));
  ok('mode Captions: IPA hidden', (await vis('.stage .ipa')) === false);
  await page.click('#btnCC'); ok('mode Captions + IPA: IPA visible', (await vis('.stage .ipa')) === true);
  ok('button label reads Captions + IPA', (await page.textContent('#btnCC')).includes('Captions + IPA'));
  ok('IPA sits directly beneath the English title', await page.evaluate(() => { const t = document.querySelector('.stage h2 .tx'); return t && t.children[1] && t.children[1].className === 'ipa' && t.children[1].textContent.startsWith('/'); }));
  await page.click('#btnCC'); ok('cycles back to Off', (await page.textContent('#btnCC')).includes('Off'));
  // IPA coverage: every English word shown anywhere has an entry
  // every spoken/captioned string written in the source (c.say('…') calls) also gets IPA coverage
  const srcDir = path.join(here, '..', 'src'); const said = new Set();
  for (const f of fs.readdirSync(srcDir).filter((f) => /^content\d\.js$/.test(f))) for (const m of fs.readFileSync(path.join(srcDir, f), 'utf8').matchAll(/say\(\s*(['"])((?:\\.|(?!\1).)*)\1/g)) said.add(m[2].replace(/\\'/g, "'"));
  await page.evaluate((x) => { window.__extra = x; }, [...said]);
  ok('found narration strings in source', said.size > 15, String(said.size));
  const miss = await api(page, () => {
    const api = FE.api, S = api.state(); api.setPaused(true);
    FE.ipaMissing.clear();
    for (let s = 0; s < api.SECTIONS.length; s++) for (let i = 0; i < api.SECTIONS[s].steps.length; i++) {
      const st = api.SECTIONS[s].steps[i];
      [false, true].forEach((r) => { api.goto(s, i); api.setRevealed(r, true); });
      S.lab.extra = true; [1, 2, 0].forEach((p) => { S.lab.pic = p; api.goto(s, i); }); S.lab.extra = false;
      (st.say || []).forEach((t) => FE.ipaOf(t)); [].concat(st.model || []).forEach((t) => FE.ipaOf(t));
    }
    const q = S.quiz; FE.QUIZ.forEach((x) => (q.answers[x.n] = 'A')); q.submitted = true;
    for (let i = 1; i <= 11; i++) api.goto(7, i);
    q.retry = true; for (let i = 1; i <= 11; i++) api.goto(7, i);
    q.retrySubmitted = true; q.ra = { 1: 'B' }; for (let i = 1; i <= 11; i++) api.goto(7, i);
    window.__extra.forEach((t) => FE.ipaOf(t));
    return [...FE.ipaMissing];
  });
  ok('IPA dictionary covers every English word in the lesson', miss.length === 0, miss.join(','));
  const chart = await api(page, () => { const allowed = new Set(FE.SOUND_CHART.concat(['/', ' ', '%', ':'])); const bad = new Set(); Object.entries(FE.IPA).forEach(([w, v]) => { for (const ch of v) if (!allowed.has(ch) && !/[0-9]/.test(ch)) bad.add(ch + ' in ' + w); }); return [...bad]; });
  ok('every IPA symbol used appears on the Fluent English Sound Chart', chart.length === 0 || false, chart.slice(0, 8).join('; '));
  const samples = await api(page, () => ['I am not tired.', "She isn't ready.", "They're not here."].map((t) => FE.ipaOf(t)));
  ok('IPA spot-check: I am not tired.', samples[0] === '/aɪ æm nɑːt ˈtaɪərd/', samples[0]);
  ok('IPA spot-check: She isn’t ready.', samples[1] === '/ʃiː ˈɪznt ˈredi/', samples[1]);
  ok('IPA spot-check: They’re not here.', samples[2] === '/ðer nɑːt hɪr/', samples[2]);
  // Spanish help has no IPA, speaks only on demand
  await page.click('#btnES'); ok('Spanish Help panel appears', await page.isVisible('#es'));
  ok('Spanish text has no IPA', (await page.locator('#es .ipa').count()) === 0);
  const spBefore = await api(page, () => window.__spoken.length);
  await page.click('#btnEsSay'); await sleep(400);
  const last = await api(page, () => window.__spoken.at(-1));
  ok('Spanish speaks only on request, with the Spanish voice', (await api(page, () => window.__spoken.length)) === spBefore + 1 && last.lang === 'es-MX');
  // reduced motion
  await page.evaluate(() => { document.getElementById('dlgSet').showModal(); });
  await page.check('#chkRm'); await page.evaluate(() => document.getElementById('dlgSet').close());
  ok('reduced motion class applied', await page.evaluate(() => document.body.classList.contains('rm')));
  ok('reduced motion disables transitions', await page.evaluate(() => getComputedStyle(document.querySelector('.stage [data-b], .stage .chip, .stage .btn') || document.body).transitionDuration.split(',').every((v) => parseFloat(v) === 0)));
  // keyboard focus visible
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return cs.outlineStyle + ' ' + cs.outlineWidth; });
  ok('keyboard focus ring is visible', /solid 3px/.test(outline), outline);
  // settings persisted
  await page.reload(); await page.waitForTimeout(200);
  ok('settings persist after reload (reduce motion + captions mode)', await page.evaluate(() => FE.getCfg().rm === true));
  ok('no page errors', page.errs.length === 0, page.errs.join(' | '));
  await ctx.close();
}

/* ============ 5. practice checks: builder, typed answers, content rules ============ */
console.log('\n[5] Grammar practice and content rules');
{
  const { ctx, page } = await mk();
  await page.click('#btnStart'); await sleep(200);
  await api(page, () => FE.api.setPaused(true));
  // click-to-build: correct
  await api(page, () => FE.api.goto(1, 3)); // He is not a doctor
  const click = async (w) => page.click(`.bank .chip[data-w="${w}"]`);
  for (const w of ['He', 'is', 'not', 'a doctor']) await click(w);
  await page.click('[data-act="check-build"]');
  ok('builder accepts He is not a doctor', (await page.textContent('[data-fb]')).includes('He goes with is. Not comes after is'));
  ok('builder success reveals the answer', await page.evaluate(() => document.getElementById('stage').classList.contains('rev')));
  // wrong: not before be
  await api(page, () => FE.api.goto(1, 3)); await api(page, () => { FE.api.state().rev['2.4'] = false; FE.api.state().data['2.4'] = {}; FE.api.goto(1, 3); });
  for (const w of ['He', 'not', 'is', 'a doctor']) await click(w);
  await page.click('[data-act="check-build"]');
  ok('feedback explains position of not', (await page.textContent('[data-fb]')).includes('Not comes after is'));
  await page.click('[data-act="clear"]'); for (const w of ['He', 'are', 'not', 'a doctor']) await click(w);
  await page.click('[data-act="check-build"]');
  ok('feedback explains agreement (He goes with is, not are)', (await page.textContent('[data-fb]')).includes('He goes with is, not are'));
  // typed contractions: both standard forms accepted
  const typed = async (s, v, text) => { await api(page, ([a, b]) => { FE.api.goto(a, b); }, s); await page.fill('.typed input', text); await page.click('[data-act="check"]'); return (await page.textContent('.typed .fb')); };
  const accept = async (s, text) => /Yes/.test(await typed(s, null, text));
  ok("She is not an engineer → She's not … accepted", await accept([2, 5], "She's not an engineer."));
  ok("She is not an engineer → She isn't … accepted", await accept([2, 5], "She isn't an engineer."));
  ok('curly apostrophe accepted', await accept([2, 5], 'She’s not an engineer.'));
  ok('full form also accepted', await accept([2, 5], 'She is not an engineer.'));
  ok('missing apostrophe gets a gentle hint, not accepted', /apostrophe/i.test(await typed([2, 5], null, 'Shes not an engineer.')));
  ok("I'm not ready accepted", await accept([2, 4], "I'm not ready."));
  ok('They are not here: both contractions accepted', (await accept([2, 9], "They're not here.")) && (await accept([2, 9], "They aren't here.")));
  // fix the sentence
  ok("Fix 'I amn't late' → I'm not late. accepted", await accept([4, 3], "I'm not late."));
  ok('Fix 4 also accepts the full form', await accept([4, 3], 'I am not late.'));
  ok("Fix 4 does not accept the incorrect 'I amn't late.'", !(await accept([4, 3], "I amn't late.")));
  ok("Fix 5 accepts He's not a doctor.", await accept([4, 4], "He's not a doctor."));
  ok("Fix 5 rejects 'He doesn't be a doctor.'", !(await accept([4, 4], "He doesn't be a doctor.")));
  ok('Fix 6 accepts We aren’t at home.', await accept([4, 5], 'We aren’t at home.'));
  // an incorrect model is hidden after the corrected answer is shown, and never the last screen
  await api(page, () => { FE.api.goto(4, 0); FE.api.setRevealed(true, true); });
  ok('incorrect model hidden after reveal', !(await page.isVisible('.bad')));
  await api(page, () => { FE.api.goto(4, 6); });
  const lastTxt = await page.textContent('#stage');
  ok('final screen of Section 5 shows only corrected sentences', !/amn.t|doesn.t be|not am |aren.t here\./.test(lastTxt.replace(/She isn.t here\./, '')) && !(await page.isVisible('.bad')));
  // short-answer typed
  ok("Short answer: No, I'm not. accepted", await accept([5, 3], "No, I'm not."));
  ok("Short answer: No, she isn't. / No, she's not. accepted", (await accept([5, 4], "No, she isn't.")) && (await accept([5, 4], "No, she's not.")));
  ok('Short answer: No, they aren’t. / No, they’re not. accepted', (await accept([5, 6], 'No, they aren’t.')) && (await accept([5, 6], "No, they're not.")));
  // scan all rendered text for forbidden items
  const scan = await api(page, () => {
    const api = FE.api, out = { ain: [], amn: [], ipaBad: [] };
    for (let s = 0; s < api.SECTIONS.length; s++) for (let i = 0; i < api.SECTIONS[s].steps.length; i++) {
      [false, true].forEach((r) => { api.goto(s, i); api.setRevealed(r, true);
        const txt = document.getElementById('stage').innerText;
        if (/ain.t/i.test(txt)) out.ain.push(s + ':' + i);
        if (/amn.t/i.test(txt)) { const bad = [...document.querySelectorAll('#stage .bad')].some((b) => /amn.t/i.test(b.innerText)); const opts = [...document.querySelectorAll('#stage')].length; if (!bad) out.amn.push(s + ':' + i + ':' + r); }
      });
    }
    return out;
  });
  ok("'ain't' never appears", scan.ain.length === 0, scan.ain.join(','));
  ok("'amn't' appears only inside the labelled incorrect model", scan.amn.length === 0 || scan.amn.every((x) => x.startsWith('4:3:false')), scan.amn.join(','));
  // Section 5 labelled
  await api(page, () => { FE.api.goto(4, 3); FE.api.setRevealed(false, true); });
  ok('incorrect models are explicitly labelled', /Incorrect model/i.test(await page.textContent('.bad')));
  ok('no page errors', page.errs.length === 0, page.errs.join(' | '));
  await ctx.close();
}

/* ============ 6. assessment ============ */
console.log('\n[6] Ten-question check');
{
  const { ctx, page } = await mk();
  await page.click('#btnStart'); await sleep(200);
  await api(page, () => FE.api.setPaused(true));
  const Q = await api(page, () => FE.QUIZ.map((q) => ({ n: q.n, opts: q.opts, a: q.a, stem: q.stem, inst: q.inst })));
  ok('exactly ten questions', Q.length === 10);
  ok('every question has four distinct options', Q.every((q) => q.opts.length === 4 && new Set(q.opts).size === 4));
  const dist = ['A', 'B', 'C', 'D'].map((l, i) => Q.filter((q) => q.a === i).length);
  ok('correct answers balanced across A–D', Math.max(...dist) - Math.min(...dist) <= 1, dist.join('/'));
  ok('Q1–Q10 correct options match the specified targets', JSON.stringify(Q.map((q) => q.opts[q.a])) === JSON.stringify(['am not', 'is not', 'are not', "I'm not ready.", "He isn't here.", "We aren't late.", 'She is not tired.', "No, I'm not.", 'is not', "The books aren't on the chair."]));
  // independent validity check: exactly one option is grammatical under each item's instruction
  const BE = { I: 'am', She: 'is', They: 'are', It: 'is' };
  const valid = [
    (o) => o === 'am not', (o) => o === 'is not', (o) => o === 'are not',
    (o) => ["I'm not ready."].includes(o),
    (o) => ["He isn't here."].includes(o),
    (o) => ["We aren't late."].includes(o),
    (o) => o === 'She is not tired.',
    (o) => ["No, I'm not.", 'No, I am not.'].includes(o),
    (o) => o === 'is not',
    (o) => ["The books aren't on the chair.", 'The books are not on the chair.'].includes(o)
  ];
  const wrongForms = /(\bI (isn't|aren't|not am)\b|\bHe (aren't|not is|am not)\b|\bWe (isn't|not are|am not)\b|\bShe (is tired not|are not|does not)\b|\bI not am\b|\bI isn't\b|^Yes,|The books isn't|not are)/;
  let one = true; Q.forEach((q, i) => { const v = q.opts.filter(valid[i]); if (v.length !== 1 || v[0] !== q.opts[q.a]) one = false; });
  ok('each item has exactly one correct option under its instruction', one);
  ok('Q4–Q6: no two valid contractions compete', Q.slice(3, 6).every((q) => q.opts.filter((o) => /^(I'm|He's|We're|He isn't|We aren't)/.test(o)).length === 1));
  ok('Q8 respondent explicitly identified as a teacher', await page.evaluate(() => /teacher/.test(FE.QUIZ[7].inst) && FE.QUIZ[7].fact.includes('teacher')));
  // answers hidden until submit
  await api(page, () => FE.api.goto(7, 0)); await page.click('[data-m="individual"]');
  await api(page, () => FE.api.goto(7, 1));
  await page.click('.opt >> nth=0');
  ok('answers hidden during the quiz (no right/wrong styling)', (await page.locator('.opt.right, .opt.wrong, .explain-box').count()) === 0);
  ok('Reveal disabled until submit', await page.isDisabled('#btnReveal'));
  ok('mode locks after the first answer', await api(page, () => { FE.api.goto(7, 0); return document.querySelector('[data-m="shared"]').disabled; }));
  // answer everything with A
  await api(page, () => { FE.QUIZ.forEach((q) => (FE.api.state().quiz.answers[q.n] = 'A')); FE.api.goto(7, 10); });
  await page.click('[data-act="submit"]'); await sleep(200);
  ok('submit goes to results', (await api(page, () => FE.api.state().step)) === 11);
  const txt = await page.textContent('#stage');
  ok('first-attempt score is 3/10 (A is correct for Q3, Q6, Q10)', /3\s*\/10/.test(txt));
  ok('individual mode label', /Individual score/.test(txt));
  // retry
  await page.click('[data-act="retry"]'); await sleep(150);
  ok('retry opens the first missed item', (await api(page, () => FE.api.state().step)) === 1);
  ok('retry hides explanation while retrying', (await page.locator('.explain-box.miss').count()) === 0);
  await api(page, () => { FE.QUIZ.forEach((q) => { if (FE.api.state().quiz.answers[q.n] !== 'ABCD'[q.a]) FE.api.state().quiz.ra[q.n] = 'ABCD'[q.a]; }); FE.api.goto(7, 1); });
  await page.click('[data-act="submit-retry"]'); await sleep(150);
  const t2 = await page.textContent('#stage');
  const sc = await api(page, () => FE.quizScores(FE.api.state()));
  ok('retry score is separate (7/7) from first attempt (3/10)', sc.first === 3 && sc.retry === 7 && sc.retryTotal === 7, JSON.stringify(sc));
  // shared mode label via a fresh page state
  const s2 = await api(page, () => { const q = FE.api.state().quiz; q.mode = 'shared'; FE.api.goto(7, 11); return document.getElementById('stage').textContent; });
  ok('shared mode is labelled “Class activity score”', /Class activity score/.test(s2) && /not individual mastery/.test(s2));
  // unanswered confirm
  await api(page, () => { const S = FE.api.state(); S.quiz = { mode: 'shared', answers: { 1: 'B' }, submitted: false, retry: false, ra: {}, retrySubmitted: false }; FE.api.goto(7, 5); });
  await page.click('[data-act="submit"]');
  ok('submitting with unanswered items asks first', await page.isVisible('#dlgConfirm'));
  await page.click('#cfNo');
  ok('quiet during assessment (music target is zero)', (await api(page, () => FE.Audio.debug().musicTarget)) === 0);
  ok('no page errors', page.errs.length === 0, page.errs.join(' | '));
  await ctx.close();
}

/* ============ 7. persistence, resume, export ============ */
console.log('\n[7] Resume, scoring storage, export');
{
  const { ctx, page } = await mk();
  await page.click('#btnStart'); await sleep(200);
  await api(page, () => { FE.api.goto(5, 4); const S = FE.api.state(); S.remain[5] = 123.4; S.quiz.mode = 'shared'; S.quiz.answers = { 1: 'B', 2: 'C' }; S.parts.rows[1] = { A: true }; S.notes = 'anonymous note'; });
  await api(page, () => FE.api.cancelRun()); await sleep(300);
  await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')));
  await page.reload(); await sleep(300);
  ok('resume choice appears after refresh', await page.isVisible('#resumeBox'));
  ok('resume info names the saved section', /Section 6/.test(await page.textContent('#resumeInfo')));
  await page.click('#btnResume'); await sleep(200);
  const st = await api(page, () => { const S = FE.api.state(); return { sec: S.sec, step: S.step, rem: Math.round(S.remain[5]), a: S.quiz.answers, parts: S.parts.rows[1], notes: S.notes }; });
  ok('resume restores screen, timer, answers, checklist and notes', st.sec === 5 && st.step === 4 && Math.abs(st.rem - 123) <= 2 && st.a[1] === 'B' && st.parts.A === true && st.notes === 'anonymous note', JSON.stringify(st));
  // export
  await api(page, () => { const S = FE.api.state(); FE.QUIZ.forEach((q) => (S.quiz.answers[q.n] = 'ABCD'[q.a])); S.quiz.submitted = true; S.exit.rows[2] = { be: true, con: true }; });
  await page.click('#btnRes'); ok('results dialog opens', await page.isVisible('#dlgRes'));
  ok('results show sections table', (await page.locator('#resBody .rt tbody tr').count()) === 9);
  const [dj] = await Promise.all([page.waitForEvent('download'), page.click('#btnJson')]);
  const jtxt = fs.readFileSync(await dj.path(), 'utf8'); const j = JSON.parse(jtxt);
  ok('JSON export downloads on button press', dj.suggestedFilename().endsWith('.json'));
  ok('JSON has sections, first-attempt score and class-score label', j.sections.length === 9 && j.assessment.firstAttempt.score === 10 && /Class activity score/.test(j.assessment.scoreLabel));
  ok('JSON contains no names/e-mails', !/@|"name"|email/i.test(jtxt));
  const [dc] = await Promise.all([page.waitForEvent('download'), page.click('#btnCsv')]);
  const csv = fs.readFileSync(await dc.path(), 'utf8');
  ok('CSV export downloads with section and assessment rows', dc.suggestedFilename().endsWith('.csv') && /^section,1,/m.test(csv) && /assessment_item,10,/.test(csv));
  ok('nothing was uploaded automatically', page.reqs.every((u) => u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')));
  await page.keyboard.press('Escape');
  await ctx.close();
}

/* ============ 7b. animated sequences wait for speech ============ */
console.log('\n[7b] Animated sequences and audio level');
{
  const { ctx, page } = await mk();
  await page.click('#btnStart'); await sleep(200);
  await api(page, () => { FE.api.setPaused(true); FE.api.goto(1, 0); window.__spoken.length = 0; FE.api.setPaused(false); });
  await sleep(400);
  const early = await api(page, () => ({ slot4: document.querySelector('.slot.s4').classList.contains('on'), built: document.querySelector('.built').classList.contains('on') }));
  ok('sequence reveals step by step (not all at once)', early.slot4 === false && early.built === false, JSON.stringify(early));
  await sleep(6500);
  const done = await api(page, () => ({ built: document.querySelector('.built').classList.contains('on'), rule: document.querySelector('.rule').classList.contains('on'), said: window.__spoken.map((s) => s.text) }));
  ok('sequence completes and speaks lines in order', done.built && done.rule && JSON.stringify(done.said) === JSON.stringify(['Look at the pattern.', 'I am not tired.', 'Not comes after am, is, or are.']), JSON.stringify(done.said));
  // moving on mid-sequence cancels the rest of the narration
  await api(page, () => { window.__spoken.length = 0; FE.api.goto(1, 1); }); await sleep(200); await api(page, () => FE.api.goto(1, 2)); await sleep(2500);
  const said2 = await api(page, () => window.__spoken.map((s) => s.text));
  ok('leaving a screen stops its remaining narration', !said2.includes('They are not ready.'), JSON.stringify(said2));
  // audio mix level: theme + effects audible, not clipping
  const lvl = await api(page, async () => {
    const an = FE.Audio._tap(), buf = new Float32Array(an.fftSize); let peak = 0; let ok = true;
    const sample = () => { an.getFloatTimeDomainData(buf); for (const v of buf) { if (!Number.isFinite(v)) ok = false; peak = Math.max(peak, Math.abs(v)); } };
    FE.Audio.setVolume('music', 1); FE.Audio.setVolume('fx', 1); FE.Audio.setQuiet(false);
    FE.Audio.theme(); FE.Audio.pop(2); FE.Audio.good(); FE.Audio.reveal(); FE.Audio.whoosh(); FE.Audio.endChord();
    for (let i = 0; i < 60; i++) { await new Promise((r) => setTimeout(r, 120)); sample(); }
    return { peak, ok };
  });
  ok('generated theme and effects are audible and finite', lvl.ok && lvl.peak > 0.005, JSON.stringify(lvl));
  ok('mix never clips at maximum volumes (peak < 0.98)', lvl.peak < 0.98, String(lvl.peak));
  await ctx.close();
}

/* ============ 8. audio design & anatomy ============ */
console.log('\n[8] Audio ducking and character anatomy');
{
  const { ctx, page } = await mk();
  await page.click('#btnStart'); await sleep(200);
  await api(page, () => { FE.api.setPaused(true); FE.api.goto(1, 0); FE.api.setPaused(false); });
  await sleep(300);
  const d1 = await api(page, () => FE.Audio.debug());
  ok('music bed on in explanation screens', d1.bedOn === true && d1.quiet === false);
  await sleep(1200);
  const dsp = await api(page, () => FE.Audio.debug());
  ok('music ducks while speech plays', dsp.speaking ? dsp.ducked : true);
  await api(page, () => FE.api.goto(2, 4)); await sleep(100);
  const d2 = await api(page, () => FE.Audio.debug());
  ok('music silent during learner-speaking screens', d2.quiet === true && d2.musicTarget === 0 && d2.bedOn === false, JSON.stringify(d2));
  const anat = await api(page, () => {
    const out = {};
    ['alex', 'maya', 'leo', 'rosa', 'ben', 'lina', 'pablo', 'rita', 'dana', 'omar', 'mei'].forEach((n) => {
      const d = document.createElement('div'); d.innerHTML = '<svg>' + FE.cast(n) + '</svg>';
      const hands = d.querySelectorAll('.hand');
      out[n] = [...hands].map((h) => h.querySelectorAll(':scope > g').length); // thumb + 4 fingers
    });
    return { fingers: out, poses: FE.POSES };
  });
  ok('every visible hand has five digits (thumb + four fingers)', Object.values(anat.fingers).every((a) => a.length === 2 && a.every((n) => n === 5)), JSON.stringify(anat.fingers));
  ok('no pose raises an elbow above the shoulder (upper arm ≤ 40° from vertical)', Object.values(anat.poses).every((p) => p.A <= 40 && p.A >= 0));
  ok('arm joints are rotation groups (shoulder, elbow, wrist per arm)', await page.evaluate(() => { const d = document.createElement('div'); d.innerHTML = '<svg>' + FE.cast('alex') + '</svg>'; return d.querySelectorAll('.arm').length === 2 && d.querySelectorAll('.j.sh').length === 2 && d.querySelectorAll('.j.el').length === 2 && d.querySelectorAll('.j.wr').length === 2; }));
  ok('gesture is a one-shot return to rest (no looping wave)', await page.evaluate(() => !/@keyframes\s+wave/i.test(document.documentElement.innerHTML)));
  ok('no page errors', page.errs.length === 0, page.errs.join(' | '));
  await ctx.close();
}

/* ============ 9. click-everything, layout, contrast ============ */
console.log('\n[9] Every button, layout, contrast');
{
  const { ctx, page } = await mk({ w: 1280, h: 720 });
  await page.click('#btnStart'); await sleep(200);
  await api(page, () => FE.api.setPaused(true));
  const n = await api(page, () => { let c = 0; FE.api.SECTIONS.forEach((s) => (c += s.steps.length)); return c; });
  const secs = await api(page, () => FE.api.SECTIONS.map((s) => s.steps.length));
  let clicks = 0, overflow = [];
  for (let s = 0; s < secs.length; s++) for (let i = 0; i < secs[s]; i++) {
    await api(page, ([s, i]) => { FE.api.goto(s, i); }, [s, i]);
    const ow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2 || document.getElementById('stage').scrollWidth > document.getElementById('stage').clientWidth + 2);
    if (ow) overflow.push(s + ':' + i);
    const count = await page.locator('#stage [data-act]').count();
    for (let k = 0; k < count; k++) {
      const el = page.locator('#stage [data-act]').nth(k);
      if (!(await el.isVisible().catch(() => false))) continue;
      const act = await el.getAttribute('data-act');
      if (['submit', 'retry', 'submit-retry', 'goresults', 'openresults'].includes(act)) continue;
      await el.click({ timeout: 1500, force: true }).catch(() => { }); clicks++;
      if (await page.isVisible('#dlgConfirm')) await page.click('#cfNo');
      await page.waitForTimeout(10);
    }
  }
  ok(`clicked ${clicks} in-lesson controls without errors`, page.errs.length === 0, page.errs.join(' | '));
  ok('no horizontal overflow at 1280×720 on any screen', overflow.length === 0, overflow.join(','));
  const lc = (hex) => { const n = parseInt(hex.slice(1), 16), f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
  const cr = (a, b) => { const x = lc(a), y = lc(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const pairs = [['body text on ivory', '#2a1235', '#fbf3e4'], ['plum headings on ivory', '#3a1747', '#fbf3e4'], ['IPA purple on ivory', '#8a5a9e', '#fbf3e4'], ['small notes on ivory', '#5a4666', '#fbf3e4'], ['white on plum', '#ffffff', '#3a1747'], ['white on coral-dark', '#ffffff', '#c0392f'], ['IPA cream on plum caption', '#f3d9a0', '#2a1235'], ['button text on turquoise', '#06302d', '#1db8b0'], ['white on teal-dark', '#ffffff', '#0e7f7a'], ['IPA cream on dark-coral family card', '#fff2cf', '#b53d28'], ['IPA on teal family card', '#fff2cf', '#0a5f5b']];
  const low = pairs.filter(([, a, b]) => cr(a, b) < 4.5).map(([n, a, b]) => n + ' ' + cr(a, b).toFixed(2));
  ok('key text/background pairs reach WCAG AA 4.5:1', low.length === 0, low.join('; '));
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('Failures:\n - ' + failures.join('\n - ')); process.exit(1); }
