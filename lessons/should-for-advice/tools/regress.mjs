// Audit regression suite. Runs the same checks against any build:
//   node tools/regress.mjs --html=<file> --out=<results.json> [--label=baseline|fixed]
// Each check records PASS/FAIL with details. Expected: every check FAILS (or is N/A) on the original and PASSES on the repaired build.
import { chromium } from 'playwright-core';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const HTML = path.resolve(arg('html', path.join(root, 'dist/should-for-advice.html')));
const OUT = arg('out', path.join(root, 'docs/regress-results.json'));
const LABEL = arg('label', 'run');
const only = arg('only', '');
const results = [];
const rec = (id, item, name, ok, detail) => { if (only && !id.startsWith(only)) return; results.push({ id, item, name, pass: !!ok, detail: detail === undefined ? '' : (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 1800) }); console.log((ok ? 'PASS ' : 'FAIL ') + id + ' ' + name + (detail !== undefined && !ok ? '  ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 220) : '')); };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
async function open(opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1600, height: 900 } }, opts.ctx || {}));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + HTML); await p.waitForTimeout(500);
  await p.evaluate((qa) => { FE.qa = qa; document.getElementById('startBtn').click(); FE.engine.setPlaying(false); FE.engine.setMode('class'); }, opts.qa !== false);
  p.errs = errs; return p;
}
const seg = (id) => `FE.segs.find((s) => s.id === '${id}')`;

/* ============ 1. checkForm ============ */
{
  const p = await open();
  const cases = [
    // [sentence, expected]  ok=true bad=false neutral=null
    ['Should he calls her?', false], ['Should I happy?', null], ['I am not happy.', null], ['You shouldnt ignore the message.', false],
    ['You shouldn’t ignore the message.', true], ['You shouldn\'t ignore the message.', true], ['You should not ignore the message.', true],
    ['You should always check the address.', true], ['My manager should probably call her.', true], ['The team should really wait.', true],
    ['I think you should ask for help.', true], ['I don\'t think you should send it yet.', true],
    ['Should I call her?', true], ['What should I do?', true], ['When should we leave?', true], ['Who should I ask?', true], ['Where should we meet?', true],
    ['Should the team send it?', true], ['Should Maya call her?', true], ['Should I be on time?', true], ['You should be on time.', true], ['You shouldn\'t be rude.', true],
    ['She should calls him.', false], ['You should to ask.', false], ['He doesn\'t should wait.', false], ['Do I should call?', false], ['What I should do?', false], ['They should leaves earlier.', false],
    ['You should.', null], ['Yes, you should.', true], ['No, you shouldn\'t.', true], ['I should call?', false], ['Should call her?', false], ['Should you to call?', false],
    ['She should call him', true], ['You should happy.', null], ['He should wait for them.', true], ['', null], ['You should calling her.', false], ['You should called her.', false],
    ['We should leave earlier.', true], ['Who should call her?', true], ['They should be careful.', true], ['You should be happy.', true],
    // independent-QA findings (checkpoint 1): stacked modals, "not should", determiner-only subject, repeated should, second clause errors
    ['I can should call.', false], ['He not should call.', false], ['The should call.', false], ['Should the team should call?', false], ['You should call and she should waits.', false],
    // other invalid shapes of the same families
    ['You should should call.', false], ['You should can call.', false], ['She will should call.', false], ['Should I can call?', false], ['Him should call her.', false],
    ['The team should call and the manager should leaves.', false], ['You shouldn\'t not call.', false], ['You must should wait.', false], ['The team should to wait.', false],
    // valid multiword subjects, harmless adverbs, several should clauses, framed questions
    ['The new manager should call her.', true], ['My manager and I should leave.', true], ['Maya and Daniel should call her.', true], ['Maya\'s sister should wait.', true],
    ['You should call her and she should wait.', true], ['You should call and should wait.', true], ['I think the team should probably wait.', true], ['Do you think I should call her?', true],
    ['Honestly, you should ask for help.', true], ['The team never should call.', true],
    // unproven / complex: neutral teacher review, never green
    ['You should call her because she needs help.', null], ['If you are late, you should call.', null], ['Everyone should call her.', null], ['You should call and waits.', null], ['You should call her and she waits.', null],
    ['There should be a rule.', null], ['Call should wait.', null],
  ];
  const got = await p.evaluate((cs) => cs.map(([s]) => { try { const r = FE.checkForm(s); return r.formOk === true ? true : r.formOk === false ? false : null; } catch (e) { return 'ERR ' + e.message; } }), cases);
  const wrong = cases.map((c, i) => [c[0], c[1], got[i]]).filter((x) => x[1] !== x[2]);
  rec('1.checkForm.table', 1, `checkForm classifies ${cases.length} sentences (ok / bad / neutral-teacher-review) correctly`, wrong.length === 0, wrong.map((w) => `"${w[0]}" expected ${w[1]} got ${w[2]}`));
  for (const [s, id] of [['Should he calls her?', 'shouldHeCalls'], ['Should I happy?', 'shouldIHappy'], ['I am not happy.', 'iAmNotHappy']]) {
    const r = await p.evaluate((s) => FE.checkForm(s), s);
    rec('1.checkForm.' + id, 1, `"${s}" is never shown green`, r.formOk !== true, r);
  }
  const msg = await p.evaluate(() => FE.checkForm('Should I happy?').msgs.map((m) => m.tone + ':' + m.t).join(' | '));
  rec('1.checkForm.neutralWording', 1, 'unprovable constructions get neutral teacher-review wording (no green tick, no false "looks correct")', !/looks correct/i.test(msg) && /teacher|check by eye|cannot/i.test(msg), msg);
  await p.close();
}

/* ============ 2 + 3. reveal per item, Build Clear ============ */
{
  const multi = ['5.2', '5.3', '5.4', '5.5', '5.6', '5.7'];
  for (const id of multi) {
    const p = await open();
    const r = await p.evaluate((id) => {
      const E = FE.engine; E.setMode('class'); E.goto(FE.segs.find((s) => s.id === id).start + 10);
      const W = (el) => [...el.querySelectorAll('.w')].map((w) => w.textContent).join(' ');
      const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os, .slots, .sent'));
      const out = { items: 1, revealed: [] };
      const lab = P.querySelector('.ft .lab'); if (lab) out.items = parseInt((lab.textContent.match(/\/\s*(\d+)/) || [0, 1])[1], 10);
      const marked = () => !!P.querySelector('.opt.ok, .opt.miss') || !!P.querySelector('.slots.ok') || (/correct/.test((P.querySelector('.badge') || {}).textContent || '') && !/incorrect/.test((P.querySelector('.badge') || {}).textContent || ''));
      for (let i = 0; i < out.items; i++) {
        if (i > 0) [...P.querySelectorAll('.btn')].find((b) => /Next/.test(W(b))).click();
        const before = marked();
        FE.ui.reveal(); // same path as the bar Reveal button
        out.revealed.push({ item: i, before, after: marked() });
      }
      return out;
    }, id);
    const okAll = r.revealed.every((x) => !x.before && x.after);
    rec('2.reveal.' + id, 2, `CLASS: reveal works on every item of ${id} (reveal → Next → reveal)`, okAll, r.revealed);
    await p.close();
  }
  { // gate banner "Show answer" reappears for the next item
    const p = await open();
    const r = await p.evaluate(() => {
      const E = FE.engine; E.setMode('class'); const s = FE.segs.find((x) => x.id === '5.6'); E.goto(s.start + 10);
      let n = 0; while (!E.gate && n++ < 400) E.advance(0.5);
      const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const has = () => !!document.getElementById('gReveal');
      const a = has(); document.getElementById('gReveal') && document.getElementById('gReveal').click();
      [...P.querySelectorAll('.btn')].find((b) => /Next/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))).click();
      return { gate: E.gate, showAtItem1: a, showAtItem2: has() };
    });
    rec('2.reveal.gateButton', 2, 'gate banner offers Show answer again after Next (item 2)', r.gate && r.showAtItem1 && r.showAtItem2, r);
    await p.close();
  }
  { // Build Clear
    const p = await open();
    const r = await p.evaluate(() => {
      const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '5.2').start + 12);
      const P = document.querySelector('.panel'); const W = (el) => [...el.querySelectorAll('.w')].map((w) => w.textContent).join(' ');
      const tile = (w) => [...P.querySelectorAll('.tray .tile')].find((x) => W(x) === w && !x.disabled);
      const btn = (re) => [...P.querySelectorAll('.btn')].find((b) => re.test(W(b)));
      const fill = () => ['She', 'should', 'ask', 'for', 'help'].forEach((w) => { const t = tile(w); if (t) t.click(); });
      fill(); btn(/Check/).click(); const first = P.querySelector('.slots').classList.contains('ok');
      btn(/Clear/).click();
      const afterClear = { slots: P.querySelectorAll('.slots .tile').length, trayEnabled: [...P.querySelectorAll('.tray .tile')].filter((x) => !x.disabled).length, cls: P.querySelector('.slots').className, fb: P.querySelector('.feedback').style.display };
      fill(); const placed = P.querySelectorAll('.slots .tile').length; btn(/Check/).click();
      const second = P.querySelector('.slots').classList.contains('ok');
      // wrong attempt after a success + clear must be judged too
      btn(/Clear/).click(); ['She', 'should', 'asks', 'for', 'help'].forEach((w) => { const t = tile(w); if (t) t.click(); }); btn(/Check/).click();
      const wrongJudged = P.querySelector('.slots').classList.contains('no');
      return { first, afterClear, placed, second, wrongJudged };
    });
    rec('3.build.clearFresh', 3, 'Clear after a completed answer gives a real fresh attempt (tiles live, slots empty, no stale state)', r.first && r.afterClear.slots === 0 && r.afterClear.trayEnabled === 7 && r.placed === 5 && r.second && r.wrongJudged, r);
    await p.close();
  }
}

/* ============ 4. scenario facts (all 27 combinations) ============ */
{
  const E1 = {
    pres: { '0,0': [1, 0, 1], '0,1': [1, 0, 0], '0,2': [1, 1, 0], '1,0': [0, 1, 1], '1,1': [1, 1, 0], '1,2': [0, 1, 0], '2,0': [0, 0, 1], '2,1': [1, 0, 0], '2,2': [0, 1, 0] },
    // lamps: [outline ready, phone quiet, room known (current)]
    trip: { '0,0': [1, 0, 1], '0,1': [1, 1, 0], '0,2': [1, 0, 0], '1,0': [0, 1, 1], '1,1': [0, 1, 0], '1,2': [0, 1, 0], '2,0': [0, 0, 1], '2,1': [0, 1, 0], '2,2': [0, 0, 0] },
    // lamps: [tickets ready, extra time, plan shared (current)]
    flat: { '0,0': [1, 1, 0], '0,1': [1, 0, 0], '0,2': [1, 0, 1], '1,0': [1, 1, 0], '1,1': [1, 0, 0], '1,2': [1, 0, 1], '2,0': [1, 1, 1], '2,1': [1, 0, 1], '2,2': [1, 0, 1] },
    // lamps: [he knows, agreement made, time to rest]
  };
  const p = await open();
  const ids = { pres: ['6.5', '6.8'], trip: ['6.6', '6.9'], flat: ['6.7', '6.10'] };
  const bad = []; let total = 0;
  for (const sc of Object.keys(E1)) for (const key of Object.keys(E1[sc])) {
    const [a, b] = key.split(',').map(Number); total++;
    const got = await p.evaluate(([r1, r2, a, b]) => {
      const E = FE.engine; E.mission = {}; E.setMode('class'); E.finished = false;
      E.goto(FE.segs.find((s) => s.id === r1).start + 10); document.querySelectorAll('.panel .cards .opt')[a].click();
      E.goto(FE.segs.find((s) => s.id === r2).start + 30); document.querySelectorAll('.panel .cards .opt')[b].click();
      return [...document.querySelectorAll('.tok')].map((el) => (el.innerHTML.includes('✓') ? 1 : 0));
    }, [ids[sc][0], ids[sc][1], a, b]);
    if (JSON.stringify(got) !== JSON.stringify(E1[sc][key])) bad.push(`${sc}[${key}] expected ${E1[sc][key]} got ${got}`);
  }
  rec('4.facts.allCombos', 4, `final lamps match the hand-written fact table for all ${total} scenario combinations (twist invalidates outdated facts; later train does not create tickets)`, bad.length === 0, bad.slice(0, 8));
  // twist shows the invalidation before the learner chooses again
  const tw = await p.evaluate(() => {
    const E = FE.engine; E.mission = {}; E.goto(FE.segs.find((s) => s.id === '6.5').start + 10); document.querySelectorAll('.panel .cards .opt')[2].click();
    const before = [...document.querySelectorAll('.tok')].map((el) => (el.innerHTML.includes('✓') ? 1 : 0));
    const s = FE.segs.find((x) => x.id === '6.8'); E.goto(s.start + s.L.tw.end + 1);
    const after = [...document.querySelectorAll('.tok')].map((el) => (el.innerHTML.includes('✓') ? 1 : 0));
    return { before, after };
  });
  rec('4.facts.twistInvalidates', 4, 'after the room-change twist, "room known" from the earlier check turns off', JSON.stringify(tw.after) === '[0,0,0]' && JSON.stringify(tw.before) === '[0,0,1]', tw);
  await p.close();
}

/* ============ 5. pause / seek / repeated clicks with real audio ============ */
{
  const p = await open({ qa: false });
  await p.evaluate(() => { FE.audio.init(); });
  const r = await p.evaluate(async () => {
    const E = FE.engine, A = FE.audio; E.setMode('class'); E.mission = {}; E.finished = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const s = FE.segs.find((x) => x.id === '6.8'); E.goto(s.start + 40); E.setPlaying(true); await sleep(300);
    document.querySelectorAll('.panel .cards .opt')[0].click(); // consequence clip, then follow-on
    await sleep(700); const consId = A.cur && A.cur.id; E.setPlaying(false);
    const dur = (FE.MANIFEST[consId] || { d: 6 }).d;
    await sleep((dur + 1.5) * 1000); // well past the point where a wall-clock follow-on would fire
    const whilePaused = A.cur && A.cur.id; const pausedAt = A.el.currentTime;
    E.setPlaying(true); const seq = [consId]; const t0 = performance.now();
    while (performance.now() - t0 < (dur + 14) * 1000) { await sleep(120); const id = A.cur && A.cur.id; if (id && id !== seq[seq.length - 1]) seq.push(id); if (seq.length >= 2 && !A.cur) break; }
    return { consId, whilePaused, pausedAt, seq, cnt: seq.length, dur };
  });
  rec('5.pause.consequenceKeptWhilePaused', 5, 'pause mid consequence line: the paused clip is not replaced by the delayed follow-on', r.whilePaused === r.consId, { consId: r.consId, whilePaused: r.whilePaused });
  rec('5.pause.sequenceAfterResume', 5, 'after resume: consequence finishes, then exactly one follow-on plays (no skip, no duplicate)', r.seq.length === 2 && r.seq[0] === r.consId, r.seq);
  const seek = await p.evaluate(async () => {
    const E = FE.engine, A = FE.audio; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    E.mission = {}; const s = FE.segs.find((x) => x.id === '6.9'); E.goto(s.start + 40); E.setPlaying(true); await sleep(200);
    document.querySelectorAll('.panel .cards .opt')[1].click(); await sleep(500);
    E.goto(FE.segs.find((x) => x.id === '2.1').start + 3); const ids = []; const allowed = new Set(FE.segs.find((x) => x.id === '2.1').lines.map((l) => l.id));
    const t0 = performance.now(); while (performance.now() - t0 < 12000) { await sleep(150); if (A.cur) ids.push(A.cur.id); }
    return { stray: [...new Set(ids)].filter((i) => !allowed.has(i)) };
  });
  rec('5.pause.seekCancelsFollowOn', 5, 'seeking away cancels delayed consequences (no stray clip in the new segment)', seek.stray.length === 0, seek);
  const rep = await p.evaluate(async () => {
    const E = FE.engine, A = FE.audio; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    E.mission = {}; const s = FE.segs.find((x) => x.id === '6.5'); E.goto(s.start + 20); E.setPlaying(true);
    const opts = [...document.querySelectorAll('.panel .cards .opt')]; const seen = []; const watch = setInterval(() => { if (A.cur && seen[seen.length - 1] !== A.cur.id) seen.push(A.cur.id); }, 40);
    opts[0].click(); opts[0].click(); await sleep(200); opts[1].click(); await sleep(150); opts[2].click(); await sleep(250); opts[2].click();
    await sleep(1200); clearInterval(watch);
    return { last: A.cur && A.cur.id, want: s.C['o1c'].id, mission: JSON.stringify(E.mission.pres), n: document.querySelectorAll('audio').length };
  });
  rec('5.pause.repeatedClicks', 5, 'rapid repeated branch clicks end with exactly the last choice playing, one audio element', rep.last === rep.want && rep.n === 0, rep);
  const repl = await p.evaluate(async () => {
    const E = FE.engine, A = FE.audio; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const s = FE.segs.find((x) => x.id === '6.10'); E.mission = {}; E.goto(s.start + 40); E.setPlaying(true); await sleep(200);
    document.querySelectorAll('.panel .cards .opt')[0].click(); await sleep(400); E.replay(); await sleep(300);
    const afterReplay = { local: E.local, cur: A.cur && A.cur.id };
    E.setPlaying(false); await sleep(1500); E.setPlaying(true); await sleep(2500);
    return { afterReplay, strayChoice: [...document.querySelectorAll('.panel .opt.ok')].length };
  });
  rec('5.pause.replayResets', 5, 'replay after a branch choice restarts the example cleanly (no leftover choice audio)', repl.afterReplay.local < 1.5 && repl.strayChoice === 0, repl);
  await p.close();
}

/* ============ 6. adaptive readability ============ */
{
  const viewports = [['phone-portrait-390x844', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ['phone-landscape-844x390', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ['desktop-1600x900', { viewport: { width: 1600, height: 900 } }]];
  for (const [name, ctx] of viewports) {
    const p = await open({ ctx });
    const mobile = name.startsWith('phone');
    // substantive thresholds per input type (touch phones: 16/11/40 px; desktop pointer: 13/9.5/32 px — the wide layout is the unchanged 1920x1080 design scaled)
    const TH = mobile ? { w: 16, p: 11, t: 40 } : { w: 13, p: 9.5, t: 32 };
    const stats = await p.evaluate((TH) => {
      const E = FE.engine; const min = { w: 1e9, p: 1e9, wid: '', pid: '' }; const small = []; const targets = []; let overflow = [];
      const vw = window.innerWidth;
      const eff = (el) => { const cs = parseFloat(getComputedStyle(el).fontSize); const r = el.getBoundingClientRect(); const ratio = el.offsetWidth ? r.width / el.offsetWidth : 1; return cs * (ratio || 1); };
      const visible = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return false; let n = el; while (n && n !== document.body) { const c = getComputedStyle(n); if (c.display === 'none' || parseFloat(c.opacity) === 0) return false; n = n.parentElement; } return true; };
      const sample = ['1.2', '2.2', '3.2', '3.7', '4.4', '4.5', '5.2', '5.4', '5.6', '5.9', '6.5', '6.8', '7.4'];
      const bad = { w: [], p: [], t: [], x: [] };
      for (const id of ['__start__', ...sample]) {
        if (id === '__start__') { document.getElementById('start').style.display = ''; } else { document.getElementById('start').style.display = 'none'; const s = FE.segs.find((x) => x.id === id); E.goto(s.start + Math.min(s.dur - 1, Math.max(14, s.dur * 0.55))); E.scene.doReveal(); }
        document.querySelectorAll('.u .w').forEach((w) => { if (!visible(w)) return; const e = eff(w); if (e < min.w) { min.w = e; min.wid = id + ':' + w.textContent; } if (e < TH.w) bad.w.push(id + ':' + w.textContent + ':' + e.toFixed(1)); });
        document.querySelectorAll('.u .p').forEach((q) => { if (!visible(q)) return; const e = eff(q); if (e < min.p) { min.p = e; min.pid = id + ':' + q.textContent; } if (e < TH.p) bad.p.push(id + ':' + q.textContent + ':' + e.toFixed(1)); });
        document.querySelectorAll('button, input, .opt, .tile, .btn, .tbtn').forEach((b) => { if (!visible(b)) return; const r = b.getBoundingClientRect(); if (b.closest('#tip')) return; if (r.height < TH.t || r.width < TH.t) bad.t.push(id + ':' + (b.getAttribute('aria-label') || b.textContent.slice(0, 20)) + ':' + Math.round(r.width) + 'x' + Math.round(r.height)); });
        if (document.documentElement.scrollWidth > vw + 2) bad.x.push(id + ':' + document.documentElement.scrollWidth);
      }
      return { min, nW: bad.w.length, nP: bad.p.length, nT: bad.t.length, nX: bad.x.length, w: bad.w.slice(0, 4), p: bad.p.slice(0, 4), t: [...new Set(bad.t)].slice(0, 6), x: bad.x.slice(0, 3) };
    }, TH);
    rec('6.read.' + name + '.words', 6, `${name}: every visible word ≥ ${TH.w} px effective (min ${stats.min.w.toFixed(1)} px)`, stats.nW === 0, { min: stats.min.w, n: stats.nW, sample: stats.w });
    rec('6.read.' + name + '.ipa', 6, `${name}: every visible IPA line ≥ ${TH.p} px effective (min ${stats.min.p.toFixed(1)} px)`, stats.nP === 0, { min: stats.min.p, n: stats.nP, sample: stats.p });
    rec('6.read.' + name + '.targets', 6, `${name}: controls ≥ ${TH.t} px`, stats.nT === 0, { n: stats.nT, sample: stats.t });
    rec('6.read.' + name + '.noHScroll', 6, `${name}: no horizontal page overflow`, stats.nX === 0, stats.x);
    if (mobile) {
      const show = await p.evaluate(() => { FE.ui.setBar(true, false); const b = document.getElementById('showBtn'); const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { disp: cs.display, w: r.width, h: r.height, inView: r.right <= innerWidth && r.bottom <= innerHeight && r.left >= 0 && r.top >= 0 }; });
      rec('6.read.' + name + '.showControls', 6, `${name}: persistent Show controls button visible, ≥44 px, inside the viewport`, show.disp !== 'none' && show.w >= 44 && show.h >= 44 && show.inView, show);
      const barReach = await p.evaluate(() => { FE.ui.setBar(false, false); const bar = document.getElementById('bar'); const bs = [...bar.querySelectorAll('button')]; const vw = innerWidth; const unreachable = bs.filter((b) => { const r = b.getBoundingClientRect(); return r.right > vw + 1 || r.left < -1; }); const wraps = getComputedStyle(bar).flexWrap !== 'nowrap' || ['auto', 'scroll'].includes(getComputedStyle(bar).overflowX); return { n: bs.length, unreachable: unreachable.length, wraps, h: bar.getBoundingClientRect().height }; });
      rec('6.read.' + name + '.barReach', 6, `${name}: control-bar buttons are reachable (wrap or scroll; none clipped off-screen)`, barReach.wraps && barReach.unreachable === 0, barReach);
    }
    await p.close();
  }
}

/* ============ 7. IPA completeness, convention, phoneme grouping ============ */
{
  const p = await open();
  const r = await p.evaluate(() => {
    const miss = new Set(); const E = FE.engine; const wordsOf = (s) => FE.tokenize(s).filter((t) => t.type === 'word' && t.ipa == null);
    const check = (s, where) => wordsOf(s).forEach((t) => { if (FE.LEX[t.text.toLowerCase().replace(/’/g, "'")] == null) miss.add(t.text + ' @' + where); });
    FE.segs.forEach((s) => { s.lines.forEach((l) => check(l.text, s.id + '/line:' + l.k)); Object.values(s.C || {}).forEach((c) => check(c.text, s.id + '/clip:' + c.k)); check(s.title, s.id + '/title'); });
    FE.chapters.forEach((c) => check(c.title, 'chapter'));
    // rendered crawl: every ctl item, reveal, all hints, notes, all branch buttons
    const bad = [];
    const scan = (where) => document.querySelectorAll('.u').forEach((u) => { const q = u.querySelector('.p'); if (!q || !/^\/.+\/$/.test(q.textContent) || q.textContent === '/?/') bad.push(where + ':' + u.textContent.slice(0, 24)); });
    document.getElementById('start').style.display = ''; scan('start'); document.getElementById('start').style.display = 'none';
    FE.segs.forEach((s) => {
      E.mission = {}; E.goto(s.start + Math.min(s.dur - 0.5, 12)); const S = E.scene;
      for (let step = 0; step < 8; step++) { scan(s.id + ' item' + step); FE.ui.reveal(); scan(s.id + ' reveal' + step); const nx = [...document.querySelectorAll('.panel .ft .btn')].find((b) => /Next/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' ')) && !b.disabled); if (!nx) break; nx.click(); }
      for (let k = 0; k < (S.hints || []).length + 1; k++) S.doHint(); S.doReveal(); S.doHint();
      document.querySelectorAll('.panel .cards .opt, .tile, .opt').forEach((b) => { try { if (b.closest('.cards')) b.click(); } catch (e) { /* ignore */ } });
      scan(s.id + ' final'); const n = document.getElementById('notes'); n.classList.add('on'); FE.ui.renderNotes(); scan(s.id + ' notes'); n.classList.remove('on');
      E.goto(s.start + Math.max(0, s.dur - 1)); S.doReveal(); scan(s.id + ' end');
    });
    FE.segs.forEach((s) => { E.mission = {}; E.goto(s.start + 1); [...s.lines].forEach((l) => { E.goto(s.start + l.start + 0.1); if (FE.ui.showCC) FE.ui.showCC(l); scan(s.id + ' cc ' + l.k); }); });
    document.querySelectorAll('[data-tip]').forEach((b) => { const d = document.createElement('div'); d.innerHTML = FE.UB(b.dataset.tip); scan('tip:' + b.dataset.tip); d.querySelectorAll('.u').forEach((u) => { if (u.querySelector('.p').textContent === '/?/') bad.push('tip:' + b.dataset.tip); }); });
    ['Press H to show the controls', 'One more minute', 'The lesson is finished', 'no hint here', 'nothing to reveal'].forEach((t) => check(t, 'toast'));
    return { miss: [...miss].slice(0, 40), missN: miss.size, bad: [...new Set(bad)].slice(0, 40), badN: new Set(bad).size, loose: [...FE.missing].slice(0, 30) };
  });
  rec('7.ipa.allTextHasIPA', 7, 'every narration/dialogue line, title, answer, hint, reveal, branch outcome and note has IPA for every word (incl. n’t, Priya’s, role-play, Maya’s)', r.missN === 0 && r.badN === 0 && r.loose.length === 0, r);
  const conv = await p.evaluate(() => { const L = FE.LEX; const need = { go: 'ɡəʊ', no: 'nəʊ', boat: 'bəʊt', know: 'nəʊ', home: 'həʊm', phone: 'fəʊn', road: 'rəʊd', slow: 'sləʊ' }; const wrong = Object.keys(need).filter((k) => L[k] != null && L[k] !== need[k]).map((k) => k + '=' + L[k]); const withOu = Object.keys(L).filter((k) => /oʊ/.test(L[k])); return { wrong, withOuN: withOu.length, withOu: withOu.slice(0, 8) }; });
  rec('7.ipa.convention', 7, 'lexicon follows the Oxford Learner’s NAmE convention stated by the owner (/əʊ/ in go, no, boat; no stray /oʊ/)', conv.wrong.length === 0 && conv.withOuN === 0, conv);
  const ph = await p.evaluate(() => { const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '4.5').start + 40); const g = [...document.querySelectorAll('.phgroup')]; const snd = g.map((x) => x.dataset.sound + ':' + x.dataset.letters); const dup = snd.filter((x, i) => snd.findIndex((y) => y.split(':')[0] === x.split(':')[0]) !== i); return { n: g.length, snd, dup }; });
  rec('7.ipa.phonemeGrouping', 7, 'phoneme diagram groups sh → /ʃ/ and ou → /ʊ/ once each (l silent, d /d/); no repeated sound per letter', ph.n === 4 && ph.dup.length === 0, ph);
  await p.close();
}

/* ============ 8. echo question + clock freeze + planned vs actual ============ */
{
  const p = await open();
  const r = await p.evaluate(() => {
    const E = FE.engine; const out = {}; const W = (el) => [...el.querySelectorAll('.w')].map((w) => w.textContent).join(' ');
    E.goto(FE.segs.find((s) => s.id === '5.4').start + 12); const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.sent'));
    const next = () => [...P.querySelectorAll('.btn')].find((b) => /Next/.test(W(b))); for (let i = 0; i < 3; i++) next().click(); // item 4: "Do I should call?"
    const opt = [...P.querySelectorAll('.opt')].find((o) => /I should call\?/.test(W(o))); opt.click();
    out.optionExplains = W(P.querySelector('.feedback'));
    out.checkForm = FE.checkForm('I should call?').msgs.map((m) => m.t).join(' ');
    return out;
  });
  rec('8.echo.specifiesInvertedQuestion', 8, 'rejecting "I should call?" names the standard yes/no form "Should I call?" (and says why)', /Should I call\?/.test(r.optionExplains) && /yes\/no|yes or no/i.test(r.optionExplains) && /Should I call\?/.test(r.checkForm), r);
  const c = await p.evaluate(async () => {
    const E = FE.engine; E.setMode('demo'); E.goto(3590); E.setPlaying(true); E.finished = false; E.advance(0.5);
    let n = 0; while (!E.finished && n++ < 100) E.advance(0.5);
    const a = E.actual(); await new Promise((r) => setTimeout(r, 1600)); const b = E.actual();
    return { finished: E.finished, a, b, froze: Math.abs(b - a) < 0.05 };
  });
  rec('8.clock.freezesAtFinish', 8, 'class-time clock stops when the lesson is finished', c.finished && c.froze, c);
  const note = await p.evaluate(() => { const n = document.getElementById('finishNote'); const t = n ? [...n.querySelectorAll('.w')].map((w) => w.textContent).join(' ') : ''; return { has: !!n, t }; });
  rec('8.clock.explainsPlannedVsActual', 8, 'finish card explains planned 3600 s vs actual class time (pauses, replays, gates, extra time)', note.has && /planned/i.test(note.t) && /pause/i.test(note.t) && /class time/i.test(note.t), note);
  await p.close();
}


/* ============ 9. phone layout: it must actually be OPERABLE by touch, not just readable ============ */
{
  const PH = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
  const p = await open({ ctx: PH });
  const ev = async (fn, arg) => { try { return await p.evaluate(fn, arg); } catch (e) { return { error: e.message.slice(0, 120) }; } }; // a build without the feature fails the check instead of crashing the suite
  const hit = (sel) => ev((sel) => { const el = document.querySelector(sel); if (!el) return { found: false }; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { found: true, w: r.width, h: r.height, reachable: !!top && (el === top || el.contains(top)), inViewport: r.left >= 0 && r.right <= innerWidth }; }, sel);
  // 1) a wrong answer in 5.4 can be tapped in the dock and gives visible feedback; Clear/reveal controls exist
  await ev(() => { FE.engine.goto(FE.segs.find((s) => s.id === '5.4').start + 12); });
  const o = await hit('#dockbody .opt');
  rec('9.phone.optionTappable', 9, '390 px: a 5.4 answer option is inside the dock, ≥44 px tall, not covered by another element, tappable', o.found && o.h >= 44 && o.reachable && o.inViewport, o);
  const fb = await ev(() => { const b = document.querySelector('#dockbody .opt'); b.click(); const f = document.querySelector('#dockbody .feedback'); return { text: f ? f.textContent.trim().slice(0, 40) : '', inDock: !!f && !!f.closest('#dockbody') }; });
  rec('9.phone.feedbackInDock', 9, '390 px: tapping an answer shows its feedback inside the dock', fb.inDock && fb.text.length > 0, fb);
  // 2) mission branch choice at 390 px changes the scenario facts
  const mis = await ev(() => { const E = FE.engine; E.mission = {}; E.goto(FE.segs.find((s) => s.id === '6.5').start + 10); const opts = document.querySelectorAll('#dockbody .cards .opt'); opts[2].click(); return { n: opts.length, mission: E.mission.pres && E.mission.pres.n1, lamps: [...document.querySelectorAll('.tok')].map((el) => (el.innerHTML.includes('✓') ? 1 : 0)).join('') }; });
  rec('9.phone.branchChoice', 9, '390 px: choosing a path in the dock stores the choice and lights the right fact ("room known")', mis.n === 3 && mis.mission === 2 && mis.lamps === '001', mis);
  // 3) captions: dialogue line with IPA units
  const cap = await ev(() => { const E = FE.engine; const s = FE.segs.find((x) => x.id === '4.3'); const ln = s.lines.find((l) => l.who !== 'narr'); E.goto(s.start + ln.start + 0.3); const c = document.getElementById('capdock'); return { has: c.classList.contains('has'), who: (c.querySelector('.capwho') || {}).textContent || '', units: c.querySelectorAll('.u').length, ipa: [...c.querySelectorAll('.u .p')].every((q) => /^\/.+\/$/.test(q.textContent)), replayH: c.querySelector('.capreplay') ? c.querySelector('.capreplay').getBoundingClientRect().height : 0 }; });
  rec('9.phone.caption', 9, '390 px: a spoken dialogue line is captioned with speaker name, word-over-IPA and a ≥44 px replay button', cap.has && cap.who.length > 0 && cap.units > 3 && cap.ipa && cap.replayH >= 44, cap);
  // 4) gate banner buttons usable
  const gate = await ev(async () => { const E = FE.engine; E.setMode('class'); const s = FE.segs.find((x) => x.id === '5.2'); E.goto(s.start + s.dur - 0.05); E.setPlaying(true); await new Promise((r) => setTimeout(r, 400)); E.setPlaying(false); const g = document.getElementById('gate'); const bs = [...g.querySelectorAll('button')].map((b) => { const r = b.getBoundingClientRect(); return { h: r.height, w: r.width, inV: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; }); return { on: g.classList.contains('on'), bs }; });
  rec('9.phone.gateButtons', 9, '390 px: the "time is up" banner appears with ≥44 px buttons fully inside the screen', gate.on && gate.bs.length >= 2 && gate.bs.every((b) => b.h >= 44 && b.w >= 44 && b.inV), gate);
  // 5) teacher notes panel readable
  const nt = await ev(() => { FE.ui.toggleNotes(); const n = document.getElementById('notes'); const words = [...n.querySelectorAll('.u .w')]; const e = (w) => { const r = w.getBoundingClientRect(); return parseFloat(getComputedStyle(w).fontSize) * (w.offsetWidth ? r.width / w.offsetWidth : 1); }; const r = n.getBoundingClientRect(); const out = { n: words.length, min: Math.min(...words.map(e)), inV: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; FE.ui.toggleNotes(); return out; });
  rec('9.phone.notesReadable', 9, '390 px: teacher notes open as a readable panel (every word ≥16 px, inside the screen)', nt.n > 3 && nt.min >= 16 && nt.inV, nt);
  // 6) rotating the phone keeps the lesson position and rebuilds the segment
  const rot = await ev(() => { const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '3.4').start + 20); return { id: E.seg.id, T: Math.round(E.T) }; });
  await p.setViewportSize({ width: 844, height: 390 }); await p.waitForTimeout(500);
  const rot2 = await ev(() => ({ id: FE.engine.seg.id, T: Math.round(FE.engine.T), orient: FE.ui.orient, docked: document.querySelectorAll('#dockbody .indock').length }));
  rec('9.phone.rotate', 9, 'rotating portrait → landscape keeps segment and time, switches layout, content stays docked', rot2.id === rot.id && Math.abs(rot2.T - rot.T) <= 1 && rot2.orient === 'side' && rot2.docked > 0, { before: rot, after: rot2 });
  await p.setViewportSize({ width: 1600, height: 900 }); await p.waitForTimeout(500);
  const back = await ev(() => ({ id: FE.engine.seg.id, orient: FE.ui.orient, docked: document.querySelectorAll('#dockbody .indock').length, inStage: document.querySelectorAll('#ui > *').length, zoomLeft: document.querySelectorAll('#ui [style*="zoom"]').length }));
  rec('9.phone.backToWide', 9, 'growing back to desktop returns every element to the stage (nothing left docked or zoomed)', back.orient === 'wide' && back.docked === 0 && back.inStage > 0 && back.zoomLeft === 0, back);
  // 7) IPA stays visible in the dock unless the learner turns it off
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500);
  await ev(() => { FE.engine.goto(FE.segs.find((x) => x.id === '3.4').start + 20); }); await p.waitForTimeout(700);
  const ipaOn = await ev(() => { return ({ ipaPressed: FE.ui.ipa, hidden: document.body.classList.contains('no-ipa'), shown: [...document.querySelectorAll('#dockbody .u .p')].filter((q) => q.offsetParent).length }); });
  rec('9.phone.ipaDefaultOn', 9, 'IPA is on by default on phones (never silently dropped)', ipaOn.ipaPressed === true && ipaOn.hidden === false && ipaOn.shown > 0, ipaOn);
  await p.close();
}


/* ============ 10. layout switching must not destroy attempts (both directions, mid-answer and post-answer) ============ */
{
  const WIDE = { width: 1600, height: 900 }, PHONE = { width: 390, height: 844 };
  const W = (el) => [...el.querySelectorAll('.w')].map((w) => w.textContent).join(' ');
  const snapFns = {
    // Build (5.5): placed tiles, tray state, verdict classes, controller identity
    build: () => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.slots')); const wd = (e) => [...e.querySelectorAll('.w')].map((w) => w.textContent).join(' '); return JSON.stringify({ slots: [...P.querySelectorAll('.slots .tile')].map(wd), tray: [...P.querySelectorAll('.tray .tile')].map((t) => wd(t) + (t.disabled ? '#off' : '')), verdict: P.querySelector('.slots').className.replace(/\s*shake/, ''), fb: (P.querySelector('.feedback') || {}).textContent }); },
    // Repair (5.4): which options were tried, feedback text
    repair: () => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); return JSON.stringify({ opts: [...P.querySelectorAll('.opt')].map((o) => o.className.replace(/\s*shake\s*/, ' ').trim() + (o.disabled ? '#off' : '')), fb: (P.querySelector('.feedback') || {}).textContent, sent: (P.querySelector('.sent') || {}).textContent, item: (P.querySelector('.ft .lab') || {}).textContent, playing: FE.engine.playing }); },
    // Branch (6.5): stored choice + lamps + chosen card
    branch: () => JSON.stringify({ mission: FE.engine.mission.pres, lamps: [...document.querySelectorAll('.tok')].map((el) => (el.innerHTML.includes('✓') ? 1 : 0)).join(''), cards: [...document.querySelectorAll('.cards .opt')].map((o) => o.className) }),
    // Typed text (7.4): the learner's sentence and the checker's verdict text
    typed: () => { const i = document.querySelector('.panel input[type=text]'); const c = i.closest('.panel').querySelector('.feedback'); return JSON.stringify({ v: i && i.value, res: c && c.style.display !== 'none' ? c.textContent : '' }); },
  };
  snapFns.repair2 = snapFns.repair;
  const setups = {
    build: { seg: '5.5', off: 10, mid: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.slots')); P.querySelectorAll('.tray .tile')[1].click(); P.querySelectorAll('.tray .tile')[0].click(); })()`,
      post: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.slots')); while (P.querySelector('.tray .tile:not(:disabled)')) P.querySelector('.tray .tile:not(:disabled)').click(); [...P.querySelectorAll('.btn')].find((b) => /Check/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))).click(); })()`,
      alive: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.slots')); [...P.querySelectorAll('.btn')].find((b) => /Clear/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))).click(); return P.querySelectorAll('.slots .tile').length === 0 && P.querySelectorAll('.tray .tile:not(:disabled)').length > 2; })()` },
    repair: { seg: '5.4', off: 12, mid: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); P.querySelectorAll('.opt')[1].click(); })()`,
      post: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const o = [...P.querySelectorAll('.opt')].find((x) => /Should I call/.test([...x.querySelectorAll('.w')].map((w) => w.textContent).join(' '))) || P.querySelectorAll('.opt')[0]; o.click(); FE.engine.scene.doReveal(); })()`,
      alive: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const nx = [...P.querySelectorAll('.btn')].find((b) => /Next/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))); if (!nx) return false; const before = P.querySelector('.sent').textContent; nx.click(); return P.querySelector('.sent').textContent !== before; })()` },
    repair2: { seg: '5.4', off: 12,
      mid: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const c = FE.engine.scene.ctls.find((k) => k.panel === P || k.items); const ok = (i) => c.items[i].options.findIndex((o) => o.ok); P.querySelectorAll('.opt')[ok(0)].click(); [...P.querySelectorAll('.btn')].find((b) => /Next/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))).click(); const wrong = c.items[1].options.findIndex((o) => !o.ok); P.querySelectorAll('.opt')[wrong].click(); })()`,
      post: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const c = FE.engine.scene.ctls.find((k) => k.items); P.querySelectorAll('.opt')[c.items[1].options.findIndex((o) => o.ok)].click(); })()`,
      alive: `(() => { const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const c = FE.engine.scene.ctls.find((k) => k.items); if (!c.done[1]) P.querySelectorAll('.opt')[c.items[1].options.findIndex((o) => o.ok)].click(); return c.i === 1 && c.done[0] === true && c.done[1] === true; })()` },
    branch: { seg: '6.5', off: 10, mid: `document.querySelectorAll('.cards .opt')[0].click()`, post: `(() => { document.querySelectorAll('.cards .opt')[2].click(); })()`,
      alive: `(() => { document.querySelectorAll('.cards .opt')[1].click(); return FE.engine.mission.pres.n1 === 1; })()` },
    typed: { seg: '7.4', off: 12, mid: `(() => { const i = document.querySelector('.panel input[type=text]'); i.value = 'You should call and she should waits'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`,
      post: `(() => { const P = document.querySelector('.panel input[type=text]').closest('.panel'); [...P.querySelectorAll('.btn')].find((b) => /Check form/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))).click(); })()`,
      alive: `(() => { const i = document.querySelector('.panel input[type=text]'); i.value = 'You should call her.'; const P = i.closest('.panel'); [...P.querySelectorAll('.btn')].find((b) => /Check form/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))).click(); return /checks out/i.test([...P.querySelector('.feedback').querySelectorAll('.w')].map((w) => w.textContent).join(' ')); })()` },
  };
  for (const [kind, sp] of Object.entries(setups)) for (const [dir, from, to] of [['wide→phone→wide', WIDE, PHONE], ['phone→wide→phone', PHONE, WIDE]]) for (const stage of ['mid', 'post']) for (const paused of [true, false]) {
    const p = await open({ ctx: { viewport: from, isMobile: from.width < 700, hasTouch: from.width < 700 } });
    const ev = async (fn, arg) => { try { return await p.evaluate(fn, arg); } catch (e) { return { error: e.message.slice(0, 160) }; } };
    await ev(([id, off, paused]) => { FE.engine.setMode('class'); FE.engine.goto(FE.segs.find((s) => s.id === id).start + off); FE.engine.setPlaying(!paused); }, [sp.seg, sp.off, paused]); await p.waitForTimeout(500);
    await ev(`${sp.mid}`.startsWith('(') ? new Function('return ' + `() => ${sp.mid}`)() : (() => {}));
    if (stage === 'post') await ev(new Function('return ' + `() => ${sp.post}`)());
    await p.waitForTimeout(1800);
    const before = await ev(new Function('return ' + snapFns[kind].toString())());
    await ev(() => { window.__scene = FE.engine.scene; window.__T = FE.engine.T; window.__playing = FE.engine.playing; });
    const flips = [];
    for (const vp of [to, from]) {
      await p.setViewportSize(vp); await p.waitForTimeout(600);
      flips.push(await ev(() => ({ same: FE.engine.scene === window.__scene, dT: Math.abs(FE.engine.T - window.__T), orient: FE.ui.orient, playing: FE.engine.playing === window.__playing })));
      flips[flips.length - 1].snap = await ev(new Function('return ' + snapFns[kind].toString())());
    }
    const alive = await ev(new Function('return () => ' + sp.alive)());
    const okSnap = flips.every((f) => f.snap === before && typeof before === 'string' && before.length > 20);
    const okScene = flips.every((f) => f.same === true && f.playing === true && f.dT < (paused ? 0.01 : 3));
    rec(`10.switch.${kind}.${stage}.${dir.startsWith('wide') ? 'wide-first' : 'phone-first'}.${paused ? 'paused' : 'playing'}`, 10, `${kind} ${stage}-answer, ${dir}, lesson ${paused ? 'paused' : 'playing'}: same scene object, same attempt state after each switch, controls still work afterwards`, okSnap && okScene && alive === true, { before: String(before).slice(0, 160), flips: flips.map((f) => ({ same: f.same, dT: f.dT, orient: f.orient, snapEqual: f.snap === before, after: f.snap === before ? undefined : String(f.snap).slice(0, 400) })), alive });
    await p.close();
  }
}

/* ============ 11. checker fuzz: invalid constructions must never be green ============ */
{
  const p = await open();
  const r = await p.evaluate(() => {
    const subj = ['I', 'You', 'He', 'She', 'We', 'They', 'The team', 'My manager', 'Maya', 'Daniel and Maya'];
    const verbs = ['call', 'ask', 'wait', 'leave', 'check'];
    const inflect = { call: ['calls', 'called', 'calling'], ask: ['asks', 'asked', 'asking'], wait: ['waits', 'waited', 'waiting'], leave: ['leaves', 'leaving'], check: ['checks', 'checked', 'checking'] };
    const modals = ['can', 'could', 'will', 'would', 'must', 'may', 'might', 'shall'];
    const cases = [];
    for (const s of subj) for (const v of verbs) {
      for (const m of modals) { cases.push(`${s} ${m} should ${v}.`, `${s} should ${m} ${v}.`); }
      cases.push(`${s} not should ${v}.`, `${s} should should ${v}.`, `${s} should to ${v}.`, `${s} shouldn't not ${v}.`, `Should ${s.toLowerCase()} should ${v}?`, `Do ${s.toLowerCase()} should ${v}?`);
      for (const f of inflect[v]) cases.push(`${s} should ${f}.`, `Should ${s.toLowerCase()} ${f}?`, `${s} should ${v} and she should ${f}.`, `${s} should ${f} and she should ${v}.`);
      cases.push(`The should ${v}.`, `A should ${v}.`, `Should ${v}.`);
    }
    const green = cases.filter((c) => { try { return FE.checkForm(c).formOk === true; } catch (e) { return true; } });
    // sanity: the valid counterparts of the same templates ARE accepted (so the guard is not just "reject everything")
    const valid = []; for (const s of subj) for (const v of verbs) valid.push(`${s} should ${v}.`, `${s} shouldn't ${v}.`, `${s} should probably ${v}.`, `${s} should ${v} and she should ${v}.`);
    const rejected = valid.filter((c) => FE.checkForm(c).formOk !== true);
    return { n: cases.length, green: green.slice(0, 12), nGreen: green.length, nValid: valid.length, rejected: rejected.slice(0, 12), nRejected: rejected.length };
  });
  rec('11.checkForm.fuzzInvalidNeverGreen', 11, `${r.n} generated invalid constructions (stacked modals, not-should, repeated should, to, inflected verbs in either clause, bare determiner subject) are never formOk:true`, r.nGreen === 0, r);
  rec('11.checkForm.fuzzValidAccepted', 11, `${r.nValid} generated valid constructions (multiword subjects, adverbs, two should clauses) are accepted`, r.nRejected === 0, r);
  await p.close();
}


/* ============ 12. delayed callbacks are item-scoped and pause-aware (repair: answer item 1, press Next inside the 1.4 s delay) ============ */
{
  const p = await open();
  const ev = async (fn, arg) => { try { return await p.evaluate(fn, arg); } catch (e) { return { error: e.message.slice(0, 160) }; } };
  const r = await ev(async () => {
    const E = FE.engine; E.setMode('class'); E.goto(FE.segs.find((s) => s.id === '5.4').start + 12); E.setPlaying(true); FE.qa = false; // real (non-fast) scene behaviour
    const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const c = E.scene.ctls.find((k) => k.items);
    const W = (el) => [...el.querySelectorAll('.w')].map((w) => w.textContent).join(' ');
    const item1Good = c.items[0].good.join(' '), item2Bad = c.items[1].bad.join(' ');
    P.querySelectorAll('.opt')[c.items[0].options.findIndex((o) => o.ok)].click();
    const midPhase = !!document.querySelector('.panel .feedback .fbicon') && W(P.querySelector('.sent')) !== item1Good; // still in the "look at the marked words" phase
    [...P.querySelectorAll('.btn')].find((b) => /Next/.test(W(b))).click();          // Next inside the delay
    const sentAfterNext = W(P.querySelector('.sent'));
    await new Promise((r) => setTimeout(r, 2200));                                  // the old 1.4 s callback would have fired by now
    const sentLater = W(P.querySelector('.sent')), badge = P.querySelector('.badge').textContent, fbText = W(P.querySelector('.feedback'));
    return { midPhase, item2Bad, sentAfterNext, sentLater, badge, fbIsEmpty: P.querySelector('.feedback').style.display === 'none' || fbText.trim() === '', doneState: JSON.stringify(c.done), item: (P.querySelector('.ft .lab') || {}).textContent };
  });
  const norm = (t) => String(t || '').replace(/\s+/g, ' ').trim();
  rec('12.delayed.repairNextInsideDelay', 12, 'repair: correct answer on item 1, Next within the delay → item 2 keeps ITS sentence, incorrect badge and empty feedback; item 1 stays recorded as done', r.midPhase === true && norm(r.sentLater).startsWith(norm(r.item2Bad).slice(0, 12)) && norm(r.sentLater) === norm(r.sentAfterNext) && /incorrect/i.test(r.badge) && r.fbIsEmpty && /"0":true/.test(r.doneState), r);
  // pause-aware: with the lesson paused nothing is left to a wall-clock timer
  const r2 = await ev(async () => {
    const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '5.4').start + 12); E.setPlaying(false);
    const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const c = E.scene.ctls.find((k) => k.items);
    P.querySelectorAll('.opt')[c.items[0].options.findIndex((o) => o.ok)].click();
    const immediate = /correct/i.test(P.querySelector('.badge').textContent);
    const left = E.scene.timers.filter((t) => !t.dead).length;
    return { immediate, pendingTimers: left, rtTimers: (E.scene.rt || []).length };
  });
  rec('12.delayed.pausedNoWallClock', 12, 'repair answered while paused: result is complete at once and no timer is left pending', r2.immediate === true && r2.pendingTimers === 0, r2);
  await p.close();
}

/* ============ 13. gate "Show answer": visible and reachable for the CURRENT item (reveal item 1 before the gate, gate opens, Next) ============ */
for (const [name, vp] of [['wide', { width: 1600, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const p = await open({ ctx: { viewport: vp, isMobile: name === 'phone', hasTouch: name === 'phone' } });
  const ev = async (fn, arg) => { try { return await p.evaluate(fn, arg); } catch (e) { return { error: e.message.slice(0, 160) }; } };
  const r = await ev(async () => {
    const E = FE.engine; E.setMode('class'); E.goto(FE.segs.find((s) => s.id === '5.4').start + 12);
    const W = (el) => [...el.querySelectorAll('.w')].map((w) => w.textContent).join(' ');
    const P = [...document.querySelectorAll('.panel')].find((x) => x.querySelector('.os')); const c = E.scene.ctls.find((k) => k.items);
    E.scene.doReveal();                                                // item 1 revealed BEFORE the gate
    E.setPlaying(true); E.local = E.seg.dur - 0.4; E.advance(1); E.setPlaying(false);  // time runs out -> gate opens
    const gate = document.getElementById('gate'); const gr = () => document.getElementById('gReveal');
    const visible = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || getComputedStyle(el).display === 'none' || el.hidden) return false; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (el === t || el.contains(t)); };
    const out = { gateOn: gate.classList.contains('on'), item1ButtonVisible: visible(gr()), canRevealItem1: E.scene.canReveal() };
    [...P.querySelectorAll('.btn')].find((b) => /Next/.test(W(b))).click();   // Next while the gate is open
    out.canRevealItem2 = E.scene.canReveal(); out.item2ButtonVisible = visible(gr());
    if (gr()) gr().click();
    out.item2Revealed = c.revealed[1] === true || c.done[1] === true; out.buttonGoneAfter = !visible(gr());
    return out;
  });
  rec('13.gate.showAnswerFollowsItem.' + name, 13, `${name}: item 1 revealed before the gate → no Show answer then; after Next the button is visible, unobstructed, works, and disappears when item 2 is revealed`, r.gateOn && r.item1ButtonVisible === false && r.canRevealItem1 === false && r.canRevealItem2 === true && r.item2ButtonVisible === true && r.item2Revealed === true && r.buttonGoneAfter === true, r);
  await p.close();
}

/* ============ 14. free-text boundary: adversarial positive / negative / unknown matrix ============ */
{
  const p = await open();
  const r = await p.evaluate(() => {
    const M = [
      // POSITIVE: validated simple templates -> confident green allowed
      ['You should call her.', 'ok'], ['She shouldn\'t wait.', 'ok'], ['Should we leave now?', 'ok'], ['What should I do?', 'ok'], ['The new manager should probably call her.', 'ok'], ['You should call her and she should wait.', 'ok'], ['Yes, you should.', 'ok'],
      // NEGATIVE: definite should errors -> confident red
      ['He should calls her.', 'bad'], ['I can should call.', 'bad'], ['She will should wait.', 'bad'], ['They not should leave.', 'bad'], ['Should he calls her?', 'bad'], ['You should to go.', 'bad'], ['She doesn\'t should wait.', 'bad'], ['The should call.', 'bad'], ['Do I should call?', 'bad'],
      // UNKNOWN (valid or ambiguous English outside the supported grammar): neutral teacher review — never green, never red
      ['What do you think I should do?', 'review'], ['Where do you think we should meet?', 'review'], ['You should call her, but she might not answer.', 'review'], ['If she calls, you should answer.', 'review'], ['Because it is late, you should leave.', 'review'],
      ['Daniel thinks we should wait.', 'review'], ['Everyone should call her.', 'review'], ['There should be a clear rule.', 'review'], ['You should definitely not call her.', 'review'], ['You should call her because she needs help.', 'review'],
      ['Whether you should call or not is your choice.', 'review'], ['Should I call her or should I wait?', 'review'], ['Not sure what to do.', 'review'], ['I would call her.', 'review'], ['You ought to call her.', 'review'], ['You should\'ve called her.', 'review'], ['You should have called her.', 'ok'],
      ['Should I?', 'review'], ['Should not I call her?', 'review'], ['Shouldn\'t I call her?', 'review'], ['The manager, who is new, should call her.', 'review'], ['Call her.', 'review'],
    ];
    const got = M.map(([s, want]) => { const x = FE.checkForm(s); const have = x.confidence === 'confident' ? 'ok' : x.confidence === 'error' ? 'bad' : 'review'; const consistent = (x.formOk === true) === (have === 'ok') && (x.formOk === false) === (have === 'bad'); return { s, want, have, consistent, formOk: x.formOk }; });
    const wrong = got.filter((g) => g.want !== g.have || !g.consistent);
    const falseGreen = got.filter((g) => g.want !== 'ok' && g.have === 'ok'), falseRed = got.filter((g) => g.want !== 'bad' && g.have === 'bad');
    return { n: got.length, wrong: wrong.slice(0, 10), nFalseGreen: falseGreen.length, nFalseRed: falseRed.length };
  });
  rec('14.freeText.matrix', 14, `adversarial matrix of ${r.n} sentences: positive → confident, definite errors → confident error, unsupported/complex → "needs teacher review"`, r.wrong.length === 0, r);
  rec('14.freeText.noFalseGreenNoFalseRed', 14, 'no unsupported/complex sentence is ever shown as a green pass or a red error', r.nFalseGreen === 0 && r.nFalseRed === 0, r);
  // the confidence boundary is visible in the UI (label + limitation note) for each of the three outcomes
  const ui = await p.evaluate(() => { FE.engine.goto(FE.segs.find((s) => s.id === '7.4').start + 12); const P = document.querySelector('.panel input[type=text]').closest('.panel'); const inp = P.querySelector('input[type=text]'); const btn = [...P.querySelectorAll('.btn')].find((b) => /Check form/.test([...b.querySelectorAll('.w')].map((w) => w.textContent).join(' '))); const lab = () => (P.querySelector('.conf') || {}).className || ''; const out = {}; for (const [k, s] of [['ok', 'You should call her.'], ['bad', 'He should calls her.'], ['review', 'If she calls, you should answer.']]) { inp.value = s; btn.click(); out[k] = lab(); } out.note = !!P.querySelector('.conf-note'); return out; });
  rec('14.freeText.confidenceVisible', 14, 'typed checker shows a visible confidence label for ok / error / needs-teacher-review and a standing limitation note', /conf-confident/.test(ui.ok) && /conf-error/.test(ui.bad) && /conf-review/.test(ui.review) && ui.note === true, ui);
  await p.close();
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const summary = { label: LABEL, html: path.basename(HTML), bytes: fs.statSync(HTML).size, sha256: (await import('node:crypto')).createHash('sha256').update(fs.readFileSync(HTML)).digest('hex'), date: new Date().toISOString(), total: results.length, passed: results.filter((x) => x.pass).length, results };
fs.writeFileSync(OUT, JSON.stringify(summary, null, 1));
console.log(`\n[${LABEL}] ${summary.passed}/${summary.total} passed -> ${OUT}`);
await browser.close();
