// DOM audit: every English text node in the teaching stage should sit inside a .tx (which carries an IPA line).
// Excluded (documented in QA report): control bar/header chrome, modals, button labels, timers, Spanish help, talk-time chip.
const { chromium, launchOpts } = require('./pw'); const path = require('path'); const fs = require('fs');
const file = process.argv[2] || path.resolve(__dirname, '../fluent-english-be-lesson.html'); const out = process.argv[3];
const W = +(process.env.W || 1280), H = +(process.env.H || 760);
(async () => {
  const b = await chromium.launch({ ...launchOpts }); const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto('file://' + file); await p.evaluate(() => localStorage.clear()); await p.goto('file://' + file);
  const res = await p.evaluate(async (W) => {
    S.started = true; document.getElementById('start').hidden = true; S.settings.cc = 'ipa'; S.settings.mute = true; applySettings();
    const L = window.__lesson, out = { missingIPA: [], hiddenIPA: [], emptyIPA: [], beats: 0 };
    const skip = (e) => e.closest('.tx,button,.talkchip,.pausebadge,.timeup,.es-panel,.ipa-note,.num,.pill.ui,[data-ui]');
    for (let a = 0; a < L.ACTS.length; a++) for (let b = 0; b < L.ACTS[a].beats.length; b++) {
      L.enter(a, b, { noIntro: true, tr: false, instant: true }); await new Promise((r) => setTimeout(r, 60)); out.beats++;
      const root = document.querySelector('#stage .pane'); const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (!/[A-Za-z]{2,}/.test(t)) continue; const el = n.parentElement; if (skip(el)) continue; out.missingIPA.push(`${a + 1}.${b + 1} "${t.slice(0, 50)}"`); }
      root.querySelectorAll('.tx').forEach((x) => { const i = x.querySelector('.ipa'); if (!i || !i.textContent.trim()) { if (/[A-Za-z]/.test(x.textContent)) out.emptyIPA.push(`${a + 1}.${b + 1} "${x.textContent.slice(0, 40)}"`); } else if (i.classList.contains('unk')) out.emptyIPA.push(`${a + 1}.${b + 1} UNKNOWN-WORD "${x.textContent.slice(0, 40)}"`); else if (getComputedStyle(i).display === 'none' || (W < 700 && x.closest('.scene'))) { out.hiddenIPA.push(`${a + 1}.${b + 1} "${x.textContent.slice(0, 40)}"`); } });
    }
    return out;
  }, W);
  const txt = JSON.stringify(res, null, 1); if (out) fs.writeFileSync(out, txt);
  console.log('beats', res.beats, '| text without IPA:', res.missingIPA.length, '| empty/unknown IPA:', res.emptyIPA.length, '| IPA hidden on screen:', res.hiddenIPA.length);
  await b.close();
})();
