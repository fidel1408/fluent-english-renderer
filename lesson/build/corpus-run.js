// Drives every screen and interaction branch in a headless browser and records every English string shown or narrated,
// with its assembled IPA line, so missing/malformed IPA can be audited exhaustively. Output: JSON (path in argv[2]).
const { chromium, launchOpts } = require('./pw'); const path = require('path'); const fs = require('fs');
const file = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(__dirname, '../fluent-english-be-lesson.html'); const outFile = process.argv[2] || path.join(require('os').tmpdir(), 'fluent-corpus.json');
(async () => {
  const b = await chromium.launch({ ...launchOpts });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + file); await p.evaluate(() => localStorage.clear()); await p.goto('file://' + file);
  const res = await p.evaluate(async () => {
    S.started = true; document.getElementById('start').hidden = true; S.settings.cc = 'ipa'; S.settings.mute = true; applySettings();
    const L = window.__lesson, strings = [], seen = new Set(); const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));
    const add = (src, text) => { text = String(text).replace(/\s+/g, ' ').trim(); if (!/[A-Za-z]/.test(text)) return; const k = src.split(' ')[0] + '|' + text; if (seen.has(k)) return; seen.add(k); const ip = IPA.line(text); strings.push({ src, text, ipa: ip.text, unk: ip.unk, words: ip.words.map((w) => w.status) }); };
    const snap = (src) => { document.querySelectorAll('#stage .tx').forEach((x) => { const w = x.querySelector('.w'), i = x.querySelector('.ipa'); if (!w) return; const t = w.textContent.trim(); if (!/[A-Za-z]/.test(t)) return; const k = src.split(' ')[0] + '|vis|' + t; if (seen.has(k)) return; seen.add(k); strings.push({ src: src + ' [visible]', text: t, ipa: i ? i.textContent.trim() : '', unk: !!(i && i.classList.contains('unk')), emptyIpa: !i || !i.textContent.trim(), words: [] }); }); };
    const said = []; Speech.say = async (items) => { (Array.isArray(items) ? items : [items]).forEach((i) => said.push(typeof i === 'string' ? i : i.t)); return true; };
    const flushSaid = (src) => { said.splice(0).forEach((t) => add(src + ' [spoken]', t)); };
    let where = ''; const q = (s) => { const e = document.querySelector(s); if (!e) throw new Error('missing ' + s + ' at ' + where); return e; }, qa = (s) => Array.from(document.querySelectorAll(s));
    for (let a = 0; a < L.ACTS.length; a++) for (let bI = 0; bI < L.ACTS[a].beats.length; bI++) {
      const id = `${a + 1}.${bI + 1}`; where = id; const beat = L.ACTS[a].beats[bI];
      L.enter(a, bI, { noIntro: true, tr: false, instant: true }); await tick(40);
      L.curA.log.forEach((x) => add(id + ' [narration]', x.t));
      [beat.turn, beat.title, beat.sub].filter(Boolean).forEach((t) => add(id + ' [title/turn]', t)); (beat.ansSay || []).forEach((t) => add(id + ' [answer-narration]', typeof t === 'string' ? t : t.t));
      snap(id);
      // reveal state
      if (!document.querySelector('#b-reveal').disabled) { window.__lesson.toggleReveal(); await tick(); flushSaid(id); snap(id + ' revealed'); window.__lesson.toggleReveal(); }
      // build tiles: every wrong tile, then the correct order
      if (document.querySelector('[data-build]')) { for (const t of qa('.tile')) { t.click(); await tick(5); snap(id + ' tile-feedback'); } q('[data-reset]').click(); }
      // repeat / row buttons, extra challenge
      qa('[data-rep],[data-row]').forEach((x) => x.click()); flushSaid(id + ' repeat'); const ex = document.querySelector('[data-extra]'); if (ex) { ex.click(); snap(id + ' extra'); ex.click(); }
      // feelings
      qa('[data-w]').forEach((x) => { if (x.closest('.card')) { x.click(); } }); if (document.querySelector('#feel-s')) { snap(id + ' feelings'); flushSaid(id); }
      // diag
      qa('[data-o]').forEach((x) => { x.click(); }); if (document.querySelector('#dg-note')) { snap(id + ' diag'); }
    }
    // word bank branches
    where = 'wordbank'; L.enter(2, 15, { noIntro: true, tr: false, instant: true }); await tick(40);
    const combos = [[], ['be'], ['I'], ['I', 'is'], ['I', 'am'], ['I', 'am', 'a student'], ['I', 'am', 'happy'], ['she', 'is'], ['she', 'am', 'happy'], ['she', 'is', 'friends'], ['it', 'is', 'a student'], ['they', 'are', 'a phone'], ['we', 'are', 'a student'], ['we', 'are', 'friends'], ['you', 'are', 'ready'], ['he', 'is', 'in class'], ['he', 'is', 'in class', 'happy'], ['he', 'is', 'in'], ['I', 'am', 'am']];
    for (const c of combos) { q('#wb-clear').click(); c.forEach((w) => { const bt = qa('[data-w]').find((x) => x.dataset.w === w); if (bt) bt.click(); else { /* 'be' etc: a be word is in the bank; non-bank words are skipped */ } }); q('#wb-check').click(); await tick(5); snap('3.16 wordbank'); }
    // quiz: every option of every question in both modes; skip; results; retry
    for (const mode of ['shared', 'individual']) {
      S.mode = mode; S.mcq = fresh().mcq; S.retry = { active: false };
      for (let i = 0; i < 10; i++) for (let k = 0; k < 4; k++) { where = `quiz ${mode} Q${i + 1} opt${k}`; S.mcq[mode] = { first: {}, retry: {} }; L.enter(7, i, { noIntro: true, tr: false, instant: true }); await tick(10); qa('.opt')[k].click(); q('#mq-sub').click(); await tick(5); snap(`8.${i + 1} ${mode} option${k}`); flushSaid(`8.${i + 1}`); }
      S.mcq[mode] = { first: {}, retry: {} }; L.enter(7, 0, { noIntro: true, tr: false, instant: true }); q('#mq-skip').click(); snap('8.1 skipped');
      // first wrong everywhere, results, retry banner
      S.mcq[mode] = { first: {}, retry: {} }; where = 'quiz wrong-everywhere ' + mode;
      for (let i = 0; i < 10; i++) { L.enter(7, i, { noIntro: true, tr: false, instant: true }); await tick(10); qa('.opt')[(MCQ_ITEMS[i].ok + 1) % 4].click(); q('#mq-sub').click(); }
      L.enter(7, 10, { noIntro: true, tr: false, instant: true }); await tick(20); snap(`8.11 results ${mode}`); q('#rs-retry').click(); await tick(20); snap(`8.x retry ${mode}`); flushSaid('8.retry');
      L.enter(7, 3, { noIntro: true, tr: false, instant: true }); await tick(20); snap('8.4 retry-banner');
    }
    S.mode = 'shared';
    // final results modal strings are teacher UI (not audited as learner text)
    const miss = Array.from(IPA.missing).sort();
    return { strings, missing: miss, stats: IPA.stats() };
  });
  res.errors = errs; fs.writeFileSync(outFile, JSON.stringify(res, null, 1));
  const unk = res.strings.filter((s) => s.unk), empty = res.strings.filter((s) => s.emptyIpa);
  console.log(`strings ${res.strings.length} | with unknown words ${unk.length} | visible without IPA ${empty.length} | missing words ${res.missing.length} | page errors ${errs.length}`);
  console.log(res.missing.join(' '));
  await b.close();
})();
