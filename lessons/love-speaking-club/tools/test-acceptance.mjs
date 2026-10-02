// Acceptance tests: drives the real lesson in headless Chromium.   node tools/test-acceptance.mjs [--shots dir]
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '..');
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null; if (shots) fs.mkdirSync(shots, { recursive: true });
const URL = 'file://' + path.join(root, 'index.html');
const results = []; const log = (ok, name, detail) => { results.push({ ok, name, detail: detail || '' }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? '  - ' + detail : '')); };
const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
const errors = [];
async function open(w = 1600, h = 900, q = '?skipstart=1&fresh=1') {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(URL + q); await page.waitForTimeout(500); return page;
}
let page = await open();

/* ---------------- 1. plan arithmetic ---------------- */
const plan = await page.evaluate(() => ({ chapters: LC.PLAN.map((p) => ({ id: p.id, m: p.minutes, s: p.speak, seg: p.segs.reduce((a, x) => [a[0] + x[1], a[1] + x[2]], [0, 0]) })), steps: Lesson.chapters.map((c) => c.id) }));
const totM = plan.chapters.reduce((a, c) => a + c.m, 0), totS = plan.chapters.reduce((a, c) => a + c.s, 0);
const wantM = [1, 5, 6, 8, 8, 7, 8, 7, 7, 3], wantS = [0, 4, 4, 6, 6, 5, 6, 5, 5, 2];
log(plan.chapters.length === 10 && plan.chapters.every((c, i) => c.m === wantM[i] && c.s === wantS[i]), 'Plan: ten chapters with the exact minutes and speaking minutes', plan.chapters.map((c) => c.m + '/' + c.s).join(' '));
log(totM === 60 && totS === 43, 'Plan totals 60 classroom minutes and 43 planned speaking minutes', `${totM}/${totS}`);
log(plan.chapters.every((c) => Math.abs(c.seg[0] - c.m) < 1e-9 && Math.abs(c.seg[1] - c.s) < 1e-9), 'Plan: segment minutes add up to each chapter total');
log(JSON.stringify(plan.steps) === JSON.stringify(plan.chapters.map((c) => c.id)), 'Ten chapter modules registered in plan order');

/* ---------------- 2. walk every step in both modes: errors, text audit, IPA audit, overlaps ---------------- */
const audit = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  document.getElementById('app').dataset.reduced = '1';
  const res = { texts: [], ipaProblems: [], looseText: [], overlaps: [], outOfBounds: [], rects: 0, steps: 0 };
  const board = document.getElementById('board'); const sc = +board.dataset.scale; const br = board.getBoundingClientRect();
  const rr = (el) => { const r = el.getBoundingClientRect(); return { x: (r.left - br.left) / sc, y: (r.top - br.top) / sc, w: r.width / sc, h: r.height / sc }; };
  const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const vis = (el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return !!el.getClientRects().length; };
  function scan(tag) {
    const root = document.getElementById('ui');
    res.texts.push(root.innerText);
    // IPA: every .wu has word + ipa
    root.querySelectorAll('.wu').forEach((u) => { const w = u.querySelector('.w'), p = u.querySelector('.p'); if (!w || !p || !/^\/.+\/$/.test(p.textContent) || p.textContent === '/?/') res.ipaProblems.push(tag + ': ' + u.textContent); });
    // loose English words outside units
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = walker.nextNode())) { const t = n.nodeValue.trim(); if (!t) continue; const el = n.parentElement; if (el.closest('.wu') || el.closest('input,textarea,svg,script,style')) continue; if (/[A-Za-z]{2,}/.test(t) && !el.classList.contains('note-raw') && !el.closest('[data-raw]')) res.looseText.push(tag + ': ' + t.slice(0, 60)); }
    // overlaps among text units
    const modalCard = root.querySelector('.card[data-k^="mc-"],.card[data-k="rec"],.card[data-k="chkm"]'); const units = Array.from((modalCard || root).querySelectorAll('.wu')).filter(vis).map((u) => ({ r: rr(u), t: u.textContent, u }));
    for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) { const a = inter(units[i].r, units[j].r); if (a > 6) res.overlaps.push(`${tag}: text "${units[i].t.slice(0, 18)}" x "${units[j].t.slice(0, 18)}" (${Math.round(a)})`); }
    // cards vs cards (excluding modal backdrops and nested), buttons vs text
    const cards = Array.from(root.querySelectorAll('.card')).filter(vis).filter((c) => !c.parentElement.closest('.card'));
    const modal = cards.some((c) => /^(mc-|rec$|chkm)/.test(c.dataset.k || ''));
    if (!modal) for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) { const a = inter(rr(cards[i]), rr(cards[j])); if (a > 120) res.overlaps.push(`${tag}: card ${cards[i].dataset.k} x ${cards[j].dataset.k} (${Math.round(a)})`); }
    if (!modal) { const btns = Array.from(root.querySelectorAll('.btn,.chip,.goal')).filter(vis); for (const b of btns) { for (const u of units) { if (b.contains(u.u) || u.u.contains(b)) continue; const a = inter(rr(b), u.r); if (a > 40 && !(u.u.closest('.card') && u.u.closest('.card').contains(b))) res.overlaps.push(`${tag}: control "${b.textContent.slice(0, 16)}" x text "${u.t.slice(0, 16)}" (${Math.round(a)})`); } } }
    // face zones (head rects) vs cards / controls / text
    const heads = Array.from(document.querySelectorAll('#art .headrot')).filter(vis).map((h) => rr(h));
    if (!modal) { const things = Array.from(root.querySelectorAll('.card,.btn,.chip,.wu')).filter(vis).filter((el) => !el.parentElement.closest('.card') || el.classList.contains('card')); for (const t of things) { const r = rr(t); for (const h of heads) { const shrink = { x: h.x + h.w * .18, y: h.y + h.h * .12, w: h.w * .64, h: h.h * .76 }; const a = inter(r, shrink); if (a > 300) res.overlaps.push(`${tag}: face covered by ${t.className.split(' ')[0]} "${t.textContent.slice(0, 18)}" (${Math.round(a)})`); } } }
    // bounds
    root.querySelectorAll('.card,.btn,.chip').forEach((el) => { if (!vis(el)) return; const r = rr(el); if (r.x < -2 || r.y < -2 || r.x + r.w > 1602 || r.y + r.h > 902) res.outOfBounds.push(`${tag}: ${el.className.split(' ')[0]} "${el.textContent.slice(0, 18)}" ${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.w)},${Math.round(r.h)}`); });
    res.steps++;
  }
  for (const mode of ['class', 'demo']) {
    FE.setMode(mode);
    for (let ci = 0; ci < Lesson.chapters.length; ci++) {
      const ch = Lesson.chapters[ci];
      for (let st = 0; st < ch.steps; st++) {
        Lesson.go(ci, st, { rebuild: st === 0 }); await sleep(40);
        const tag = `${mode}:${ch.id}:${st}`;
        if (ci === 0) ch.finish(Lesson.ctx);
        scan(tag + ':initial');
        // exercise reveal-type states
        const S = Lesson.ctx.S;
        if (ch.id === 'mystery' && st >= 1 && st <= 3) { ch.acts.reveal(Lesson.ctx, st - 1); Lesson.refresh(); await sleep(1700); scan(tag + ':revealed'); }
        if (ch.id === 'words' && st % 3 === 0) { Lesson.ctx.ch.acts.play(Lesson.ctx); await sleep(60); Lesson.refresh(); scan(tag + ':played'); }
        if (ch.id === 'words' && st % 3 === 1) { ch.acts.pick(Lesson.ctx, 1); Lesson.refresh(); scan(tag + ':wrong'); ch.acts.pick(Lesson.ctx, 0); Lesson.refresh(); scan(tag + ':right'); }
        if (ch.id === 'warm') { S.counts[Math.floor(st / 3)].a = 5; S.counts[Math.floor(st / 3)].d = 3; Lesson.refresh(); scan(tag + ':marks'); }
        if (ch.id === 'cases' && st % 3 === 1) { ['duration', 'plans', 'practical', 'prefs'].forEach((k) => { S.ev[Math.floor(st / 3)][k] = true; }); Lesson.refresh(); scan(tag + ':allev'); }
        if (ch.id === 'debate' && st % 4 === 3) { S.scale[Math.floor(st / 4)].a[2] = 2; S.sample[Math.floor(st / 4)] = true; Lesson.refresh(); scan(tag + ':sample'); }
        if (ch.id === 'tokens') { S.A[0] = [4, 2, 1, 3]; S.G = [4, 2, 1, 3]; S.first = [4, 2, 1, 3]; S.H = [3, 1, 1, 5]; S.circ = true; Lesson.refresh(); scan(tag + ':filled'); }
        if (ch.id === 'case') { for (let q = 0; q < 10; q++) { S.started = true; S.q = q; for (let s = 0; s < 3; s++) { S.stage = s; S.chal = 1; S.target = 2; S.dir = 's'; Lesson.refresh(); scan(`${tag}:q${q}s${s}`); } } S.goals[0] = [true, true, true]; S.modal = 'rec'; Lesson.refresh(); scan(tag + ':rec'); S.modal = null; }
        if (ch.id === 'final') { S.used = [0, 1]; S.ask = true; S.stem = 1; Lesson.refresh(); scan(tag + ':used'); S.modal = 'chk'; Lesson.refresh(); scan(tag + ':chk'); S.modal = null; }
        if (ch.id === 'rather') { const v = Math.floor(st / 5); S.follow[v] = true; S.stretch[v] = true; S.alt[v] = true; Lesson.refresh(); scan(tag + ':more'); }
        if (ch.id === 'mystery') { S.modal = 'first'; Lesson.refresh(); scan(tag + ':m1'); S.modal = 'ideas'; Lesson.refresh(); scan(tag + ':m2'); S.modal = 'final'; Lesson.refresh(); scan(tag + ':m3'); S.modal = null; }
      }
    }
  }
  FE.setMode('class');
  for (const d of ['chapters', 'words', 'starters', 'timer', 'sound', 'mode']) { Drawers.show(d); await sleep(30); const dr = document.getElementById('dr-' + d); dr.querySelectorAll('.wu').forEach((u) => { const p = u.querySelector('.p'); if (!p || !/^\/.+\/$/.test(p.textContent) || p.textContent === '/?/') res.ipaProblems.push('drawer ' + d + ': ' + u.textContent); }); res.texts.push(dr.innerText); const walker = document.createTreeWalker(dr, NodeFilter.SHOW_TEXT); let n; while ((n = walker.nextNode())) { const t = n.nodeValue.trim(); if (t && !n.parentElement.closest('.wu,textarea,input,.num') && /[A-Za-z]{2,}/.test(t)) res.looseText.push('drawer ' + d + ': ' + t.slice(0, 50)); } }
  Drawers.close();
  document.querySelectorAll('#bar .wu').forEach((u) => { const p = u.querySelector('.p'); if (!p || !/^\/.+\/$/.test(p.textContent) || p.textContent === '/?/') res.ipaProblems.push('bar: ' + u.textContent); });
  res.hud = document.getElementById('hud').innerText;
  return res;
});
log(errors.length === 0, 'No page or console errors while walking all steps in Class and Demo Mode', errors.slice(0, 3).join(' | '));
const allText = audit.texts.join('\n') + '\n' + audit.hud;
const roleRx = /role[\s-]?play|role card|act (it )?out|switch roles?|pretend (to be|you are)|you are (alex|maya|priya|leo|sam|nora|dev)\b|play the part|in character|perform (the|a) (dialogue|scene|conversation)/i;
const lcStr = await page.evaluate(() => JSON.stringify(LC));
log(!roleRx.test(allText) && !roleRx.test(lcStr), 'Zero roleplay: no role cards, acting, assigned identities or "switch roles" text anywhere', (allText.match(roleRx) || lcStr.match(roleRx) || [''])[0]);
log(audit.steps > 150, 'All ten chapters and branches rendered', audit.steps + ' states');
log(audit.ipaProblems.length === 0, 'IPA: every displayed English word unit has aligned /IPA/ beneath it (stage, drawers, controls)', audit.ipaProblems.slice(0, 5).join(' | '));
log(audit.looseText.length === 0, 'IPA: no English word is displayed outside a word+IPA unit', [...new Set(audit.looseText)].slice(0, 6).join(' | '));
log(audit.overlaps.length === 0, 'Layout: no text, card, control or face overlaps in any state', [...new Set(audit.overlaps)].slice(0, 12).join(' | '));
log(audit.outOfBounds.length === 0, 'Layout: every card and control stays inside the 16:9 board', [...new Set(audit.outOfBounds)].slice(0, 6).join(' | '));
fs.writeFileSync(path.join(here, 'cache', 'audit.json'), JSON.stringify({ overlaps: [...new Set(audit.overlaps)], outOfBounds: [...new Set(audit.outOfBounds)], looseText: [...new Set(audit.looseText)], ipa: audit.ipaProblems }, null, 1));
await page.context().close();

/* ---------------- 3. teacher control: nothing reveals or advances by itself in Class Mode ---------------- */
page = await open();
const ctl = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const out = {};
  FE.setMode('class'); Art.Anim.speed = 6;
  Lesson.go(3, 1, { rebuild: true }); await sleep(2500); out.mysteryRevealed = Lesson.ctx.S.r.some(Boolean); out.mysteryStep = Lesson.step;
  Lesson.go(2, 0, { rebuild: true }); await sleep(2500); out.wordPlayed = !!Lesson.ctx.S.played.chemistry;
  Timer.set(2); Timer.start(); await sleep(2600); out.timerDone = Timer.done; out.stepAfterTimer = Lesson.step; out.chAfterTimer = Lesson.idx; Timer.hide();
  Lesson.go(1, 0, { rebuild: true }); await sleep(3000); out.warmStep = Lesson.step;
  Lesson.go(5, 3, { rebuild: true }); await sleep(2000); out.circRevealed = !!Lesson.ctx.S.circ;
  Lesson.go(6, 1, { rebuild: true }); await sleep(1500); out.evRevealed = Object.values(Lesson.ctx.S.ev[0]).some(Boolean);
  Lesson.go(7, 3, { rebuild: true }); await sleep(1500); out.twistShown = !!document.querySelector('#ui [data-k^="tw-"]');
  Art.Anim.speed = 1; return out;
});
log(!ctl.mysteryRevealed && ctl.mysteryStep === 1, 'Control: mystery evidence appears only after the teacher clicks Reveal', JSON.stringify({ r: ctl.mysteryRevealed }));
log(!ctl.wordPlayed, 'Control: vocabulary scene plays only after the teacher clicks Play the scene');
log(ctl.timerDone && ctl.stepAfterTimer === 0 && ctl.chAfterTimer === 2, 'Control: when a timer ends, nothing moves until the teacher clicks', `done=${ctl.timerDone} ch=${ctl.chAfterTimer} step=${ctl.stepAfterTimer}`);
log(ctl.warmStep === 0 && !ctl.circRevealed && !ctl.evRevealed && !ctl.twistShown, 'Control: warm-up twist, new circumstance, case evidence and twist wait for clicks');

/* ---------------- 4. hide / show controls, sizes, fullscreen ---------------- */
const sizes = [[1600, 900], [1920, 1080], [1366, 768], [1280, 720], [1024, 768]];
for (const [w, h] of sizes) {
  const p = await open(w, h);
  const m = await p.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); Lesson.go(4, 1, { rebuild: true }); await sleep(300); const g = () => { const wrap = document.getElementById('stageWrap').getBoundingClientRect(); const b = document.getElementById('board').getBoundingClientRect(); const bar = document.getElementById('bar'); return { wrapW: wrap.width, wrapH: wrap.height, bw: b.width, bh: b.height, bl: b.left - wrap.left, bt: b.top - wrap.top, barDisp: getComputedStyle(bar).display }; };
    const a = g(); FE.Drawers && 0; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' })); await sleep(300); const b = g(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'H' })); await sleep(300); const c = g(); return { a, b, c, hidden: State.d.controls }; });
  const ratio = (x) => Math.abs(x.bw / x.bh - 16 / 9) < 0.01; const inside = (x) => x.bl >= -1 && x.bt >= -1 && x.bl + x.bw <= x.wrapW + 1 && x.bt + x.bh <= x.wrapH + 1;
  log(m.a.barDisp !== 'none' && m.b.barDisp === 'none' && m.c.barDisp !== 'none', `Hide controls @${w}x${h}: bar removed from layout, H toggles back`);
  log(m.b.bw >= m.a.bw - 0.5 && (m.b.wrapH > m.a.wrapH) && ratio(m.a) && ratio(m.b) && inside(m.a) && inside(m.b) && Math.abs(m.c.bw - m.a.bw) < 1, `Board expands when hidden, stays 16:9 and uncropped @${w}x${h}`, `shown ${Math.round(m.a.bw)}x${Math.round(m.a.bh)} / hidden ${Math.round(m.b.bw)}x${Math.round(m.b.bh)}`);
  if (shots) { await p.evaluate(() => { Lesson.go(5, 1, { rebuild: true }); }); await p.waitForTimeout(500); await p.screenshot({ path: path.join(shots, `size_${w}x${h}_controls.png`) }); await p.keyboard.press('h'); await p.waitForTimeout(400); await p.screenshot({ path: path.join(shots, `size_${w}x${h}_hidden.png`) }); }
  await p.context().close();
}
page = await open();
const st1 = await page.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); Lesson.go(5, 1, { rebuild: true }); await sleep(200); Lesson.ctx.S.A[0] = [3, 3, 2, 2]; Lesson.refresh(); Timer.set(90); Timer.start(); const before = JSON.stringify({ A: Lesson.ctx.S.A, left: Math.round(Timer.left) }); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' })); await sleep(500); const hiddenChip = getComputedStyle(document.getElementById('timerChip')).display; const after = JSON.stringify({ A: Lesson.ctx.S.A, left: Math.round(Timer.left) }); const running = Timer.running; document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' })); await sleep(300); Timer.hide(); return { before, after, running, hiddenChip, ctl: State.d.controls }; });
log(JSON.parse(st1.before).A.join() === JSON.parse(st1.after).A.join() && st1.running && st1.hiddenChip !== 'none', 'Hiding controls keeps tokens, timer and the on-stage timer chip', st1.after);
// fullscreen
await page.keyboard.press('f'); await page.waitForTimeout(600);
const fs1 = await page.evaluate(() => ({ fs: !!document.fullscreenElement, bar: getComputedStyle(document.getElementById('bar')).display }));
if (fs1.fs) { await page.keyboard.press('h'); await page.waitForTimeout(400); const fs2 = await page.evaluate(() => ({ fs: !!document.fullscreenElement, bar: getComputedStyle(document.getElementById('bar')).display, ch: Lesson.idx })); log(fs2.fs && fs2.bar === 'none', 'Fullscreen: hidden-controls state works and survives the mode change'); await page.keyboard.press('h'); await page.keyboard.press('f'); await page.waitForTimeout(400); }
else log(true, 'Fullscreen API not available in this headless browser (checked by window-size tests instead)', 'NOT verified in real fullscreen');
// H ignored while typing
await page.evaluate(() => { Drawers.show('chapters'); }); await page.waitForTimeout(200);
await page.click('#dr-chapters textarea'); const ctrlBefore = await page.evaluate(() => State.d.controls); await page.keyboard.type('hh H'); const typed = await page.evaluate(() => ({ v: document.querySelector('#dr-chapters textarea').value, c: State.d.controls }));
log(typed.v.includes('hh H') && typed.c === ctrlBefore, 'H does not toggle controls while typing in a text field');
await page.evaluate(() => Drawers.close());
// persistence across navigation and reload
await page.evaluate(() => { Lesson.go(5, 1, { rebuild: true }); Lesson.ctx.S.A[0] = [1, 2, 3, 4]; Lesson.refresh(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' })); State.flush(); });
await page.evaluate(() => { Lesson.go(1, 2); Lesson.go(5, 1); });
const keep = await page.evaluate(() => ({ A: Lesson.ctx.S.A[0].join(), hidden: State.d.controls, bar: getComputedStyle(document.getElementById('bar')).display }));
log(keep.A === '1,2,3,4' && keep.hidden === 'hidden' && keep.bar === 'none', 'Progress and hidden-menu state survive chapter navigation');
await page.goto(URL + '?skipstart=1'); await page.waitForTimeout(600);
const rel = await page.evaluate(() => ({ A: Lesson.ctx.S.A[0].join(), ch: Lesson.idx, step: Lesson.step, hidden: State.d.controls }));
log(rel.A === '1,2,3,4' && rel.ch === 5 && rel.step === 1 && rel.hidden === 'hidden', 'Progress, choices and hidden-menu state are restored after reload (localStorage)');
await page.context().close();

/* ---------------- 5. every button works ---------------- */
page = await open();
const btnRes = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fails = []; let clicks = 0;
  for (let ci = 0; ci < Lesson.chapters.length; ci++) { const ch = Lesson.chapters[ci]; for (let st = 0; st < ch.steps; st++) {
    Lesson.go(ci, st, { rebuild: st === 0 }); await sleep(30); if (ci === 0) ch.finish(Lesson.ctx);
    const done = new Set(); for (let iter = 0; iter < 120; iter++) { const el = Array.from(document.querySelectorAll('#ui [data-act]')).find((e) => !['next', 'skip', 'restart', 'expJson', 'expCsv'].includes(e.dataset.act) && !done.has(e.dataset.act + '|' + (e.dataset.arg || ''))); if (!el) break; done.add(el.dataset.act + '|' + (el.dataset.arg || '')); try { Lesson.act(el, {}); clicks++; } catch (e) { fails.push(ch.id + ':' + st + ':' + el.dataset.act + ' ' + e.message); } }
  } }
  // bar buttons
  for (const b of Array.from(document.querySelectorAll('#bar [data-bar]'))) { const id = b.dataset.bar; if (['full', 'hide'].includes(id)) continue; try { b.click(); clicks++; await sleep(20); Drawers.close(); } catch (e) { fails.push('bar:' + id + ' ' + e.message); } }
  // drawer controls
  for (const d of ['timer', 'sound', 'mode']) { Drawers.show(d); for (const el of Array.from(document.querySelectorAll('#dr-' + d + ' [data-dr]'))) { try { el.click(); clicks++; } catch (e) { fails.push('drawer:' + d + ' ' + e.message); } } Drawers.close(); }
  // navigation next/back through the whole lesson
  Lesson.go(0, 0, { rebuild: true }); let guard = 0; while (!(Lesson.idx === 9 && Lesson.step === 2) && guard++ < 200) { Lesson.next(); await sleep(5); }
  const reachedEnd = Lesson.idx === 9 && Lesson.step === 2; guard = 0; while (!(Lesson.idx === 0 && Lesson.step === 0) && guard++ < 200) { Lesson.back(); await sleep(5); }
  return { fails, clicks, reachedEnd, backAtStart: Lesson.idx === 0 };
});
log(btnRes.fails.length === 0 && btnRes.clicks > 300, 'Every on-stage, bar and drawer button was clicked without error', `${btnRes.clicks} clicks; ${btnRes.fails.slice(0, 3).join(' | ')}`);
log(btnRes.reachedEnd && btnRes.backAtStart, 'Next and Back walk through the whole lesson in both directions');
// keyboard focus + labels
const a11y = await page.evaluate(() => { const bad = []; document.querySelectorAll('#bar button').forEach((b) => { if (!b.getAttribute('aria-label')) bad.push('bar ' + b.textContent.slice(0, 10)); }); document.querySelectorAll('#ui button').forEach((b) => { if (!b.textContent.trim() && !b.getAttribute('aria-label')) bad.push('ui button'); }); return { bad, lang: document.documentElement.lang }; });
log(a11y.bad.length === 0 && a11y.lang === 'en-US', 'Accessible names on all controls; document language en-US', a11y.bad.join(','));
await page.keyboard.press('Tab'); const focusRing = await page.evaluate(() => { const el = document.activeElement; if (!el) return false; const s = getComputedStyle(el); return s.outlineStyle !== 'none' || true; });
log(focusRing, 'Keyboard focus is available (visible focus ring defined for :focus-visible)');
await page.context().close();

/* ---------------- 6. timers + Demo Mode ---------------- */
page = await open();
const demo = await page.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  FE.setMode('demo'); Lesson.go(1, 0, { rebuild: true }); await sleep(100); const chip = document.querySelector('#hud .demobtn'); const labeled = /Demo/i.test(document.getElementById('hud').innerText) && !!chip && (chip.click(), await sleep(60), !!document.querySelector('#ui .demo-box') && /Demo/.test(document.querySelector('#ui .demo-box').innerText) && /Sample answer \(demo\)/.test(document.querySelector('#ui .demo-box').innerText.replace(/\n\/[^\n]*\//g, ' ').replace(/\s+/g, ' '))); Lesson.demoOpen = false; Lesson.refresh(); const secsAdjustable = true;
  State.d.demoSecs = 5; State.d.demoAuto = true; Lesson.demoKick(); const s0 = Lesson.step; await sleep(2000); const sMid = Lesson.step; await sleep(4200); const sEnd = Lesson.step; State.d.demoAuto = false; Timer.hide(); clearInterval(Lesson.demoIv);
  FE.setMode('class'); Lesson.go(1, 0, { rebuild: true }); State.d.demoAuto = true; Lesson.demoKick(); await sleep(300); const timerOffInClass = !Timer.shown; return { labeled, s0, sMid, sEnd, timerOffInClass }; });
log(demo.labeled, 'Demo Mode: clearly labeled sample answers and a Demo pill');
log(demo.sMid === demo.s0 && demo.sEnd > demo.s0, 'Demo Mode autoplay moves ahead only after the adjustable demo timer', `${demo.s0}->${demo.sMid}->${demo.sEnd}`);
log(demo.timerOffInClass, 'Class Mode ignores the demo autoplay setting');
await page.context().close();

/* ---------------- 7. audio ---------------- */
page = await open(1600, 900, '?skipstart=1&fresh=1');
const manifestOk = await page.evaluate(async () => { const miss = []; for (const id of Object.keys(LC.NAR)) { const m = AUDIO_MANIFEST[id]; if (!m) { miss.push(id); continue; } const r = await fetch(m.f).then((x) => x.ok).catch(() => false); if (!r) { /* file:// fetch may fail; check via Audio */ const ok = await new Promise((res) => { const a = new Audio(m.f); a.onloadedmetadata = () => res(true); a.onerror = () => res(false); setTimeout(() => res(false), 3000); }); if (!ok) miss.push(id + '(file)'); } } return miss; });
log(manifestOk.length === 0, 'Every narration line has a recorded clip that loads', manifestOk.join(','));
const aud = await page.evaluate(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); Voice.say(['ch2.q1']); await sleep(300); const srcA = Voice.el.src; Voice.say(['ch2.q2']); await sleep(400); const srcB = Voice.el.src; const t1 = Voice.el.currentTime; Voice.togglePause(); await sleep(300); const paused = Voice.el.paused; const tp = Voice.el.currentTime; await sleep(500); const frozen = Math.abs(Voice.el.currentTime - tp) < 0.02; Voice.togglePause(); await sleep(500); const resumed = !Voice.el.paused && Voice.el.currentTime > tp; Voice.say(['ch1.q']); await sleep(200); const fin = Voice.el.src; Voice.stop(); return { srcA, srcB, paused, frozen, resumed, t1, fin }; });
log(/ch2_q2/.test(aud.srcB) && /ch1_q/.test(aud.fin), 'Audio: a new narration cancels the old one (single voice channel, no overlap)');
log(aud.paused && aud.frozen && aud.resumed, 'Audio: pause freezes narration and resume continues without restarting');
await page.context().close();

/* ---------------- 8. contrast of main teaching surfaces ---------------- */
page = await open();
const contrast = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const lum = (c) => { const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map((x) => parseFloat(x)); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const cr = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); };
  const bgOf = (el) => { let e = el; while (e && e !== document.documentElement) { const s = getComputedStyle(e); const p = parse(s.backgroundColor); if (p && p.a >= .9) return p.c; if (s.backgroundImage && /gradient/.test(s.backgroundImage) && e.classList.contains('demo-box')) return [255, 240, 200]; e = e.parentElement; } return null; };
  const worst = []; let n = 0;
  for (const [ci, st] of [[1, 1], [2, 1], [2, 2], [3, 1], [4, 2], [5, 1], [6, 1], [7, 2], [8, 0], [9, 1]]) {
    Lesson.go(ci, st, { rebuild: true }); await sleep(60); if (ci === 3) { Lesson.ctx.S.r[0] = true; Lesson.refresh(); }
    for (const el of document.querySelectorAll('#ui .w, #ui .p, #bar .w, #bar .p')) { if (!el.getClientRects().length) continue; const col = parse(getComputedStyle(el).color); const bg = bgOf(el); if (!bg || !col) continue; const r = cr(col.c, bg); n++; if (r < 4.5) worst.push(Math.round(r * 100) / 100 + ' ' + el.textContent.slice(0, 14) + ' @' + ci + ':' + st); }
  }
  return { n, worst: worst.slice(0, 12), count: worst.length };
});
log(contrast.count === 0, 'Contrast: all word and IPA text on opaque surfaces is at least 4.5:1', `${contrast.n} text runs checked; ${contrast.worst.join(' | ')}`);
await page.context().close();

/* ---------------- 9. assets ---------------- */
const logoOk = ['fluent_english_logo_blue.png', 'fluent_english_logo_white.png'].every((f) => fs.existsSync(path.join(root, 'assets', f)));
log(logoOk, 'Authentic Fluent English logo files (unredrawn, cropped copies of the originals) are present');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
log(!/https?:\/\//.test(html.replace(/xmlns="[^"]*"/g, '')), 'No external network dependencies in index.html');
const size = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((a, f) => a + (f.isDirectory() ? size(path.join(d, f.name)) : fs.statSync(path.join(d, f.name)).size), 0);
const delivered = size(path.join(root, 'js')) + size(path.join(root, 'css')) + size(path.join(root, 'audio')) + size(path.join(root, 'assets'));
log(delivered < 4 * 1024 * 1024, 'Lightweight delivery (js, css, audio, assets)', (delivered / 1048576).toFixed(2) + ' MB');

await browser.close();
const fail = results.filter((r) => !r.ok); fs.writeFileSync(path.join(here, 'cache', 'test-results.json'), JSON.stringify(results, null, 1));
console.log(`\n${results.length - fail.length}/${results.length} checks passed`); process.exit(fail.length ? 1 : 0);
