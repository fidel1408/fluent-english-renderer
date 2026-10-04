/* Real-viewport reachability test: portrait phone 390x844, landscape phone 844x390, desktop 1280x720.
   NOT expanded-height: it checks what a user can actually see and reach by scrolling at the true device size. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const path = require('path'); const fs = require('fs');
const FILE = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '../fluent-english-be-lesson.html'); const URL = 'file://' + FILE;
const VPS = [{ n: 'phone-portrait-390x844', w: 390, h: 844, minStage: 200 }, { n: 'phone-landscape-844x390', w: 844, h: 390, minStage: 120 }, { n: 'desktop-1280x720', w: 1280, h: 720, minStage: 280 }];
let pass = 0, fail = 0; const failures = [], report = {};
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; failures.push(m); console.log('  FAIL', m); } };
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const vp of VPS) {
    console.log(`\n# ${vp.n}`);
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL);
    const res = await p.evaluate(async (minStage) => {
      S.started = true; document.getElementById('start').hidden = true; S.settings.cc = 'ipa'; S.settings.mute = true; S.settings.rm = true; applySettings();
      const out = { beats: 0, over: [], stageMin: 1e9, stageMinAt: '', thin: [], dockHidden: [], ctlCovered: [], ctlOff: [], lastCovered: [], ipaSmall: [], ctlCount: 0 };
      const inVp = (r) => r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1;
      const hit = (e) => { const r = e.getBoundingClientRect(), x = Math.min(innerWidth - 2, Math.max(2, r.left + r.width / 2)), y = Math.min(innerHeight - 2, Math.max(2, r.top + r.height / 2)); const t = document.elementFromPoint(x, y); return !!t && (e === t || e.contains(t) || t.contains(e)); };
      for (let a = 0; a < ACTS.length; a++) for (let b = 0; b < ACTS[a].beats.length; b++) {
        const id = `${a + 1}.${b + 1}`; __lesson.enter(a, b, { noIntro: true, tr: false, instant: true }); await new Promise((r) => setTimeout(r, 40)); out.beats++;
        if (document.documentElement.scrollWidth > innerWidth + 1) out.over.push(id);
        const st = document.getElementById('stage'), sh = st.getBoundingClientRect().height; if (sh < out.stageMin) { out.stageMin = sh; out.stageMinAt = id; } if (sh < minStage) out.thin.push(id + ':' + Math.round(sh));
        // teacher dock buttons: must be scrollable into view and clickable (not clipped) at this viewport
        ['b-prev', 'b-play', 'b-next', 'b-replay', 'b-chap', 'b-cc', 'b-ts', 'b-es', 'b-reveal', 'b-skip', 'b-res'].forEach((bid) => { const e = document.getElementById(bid); if (!e) return; e.scrollIntoView({ block: 'nearest', inline: 'center' }); const r = e.getBoundingClientRect(); if (!(inVp(r) && hit(e))) out.dockHidden.push(`${id} #${bid}`); });
        // in-stage controls: scroll the stage to each and confirm it is on screen and not covered
        const ctl = Array.from(st.querySelectorAll('button:not([disabled]), input, select, textarea, summary')).filter((e) => e.offsetParent !== null && !e.closest('.es-panel'));
        for (const e of ctl) { out.ctlCount++; e.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = e.getBoundingClientRect(); if (!inVp(r)) { out.ctlOff.push(`${id} ${(e.id || e.className || e.tagName).toString().slice(0, 24)}`); continue; } if (!hit(e)) out.ctlCovered.push(`${id} ${(e.id || e.className || e.tagName).toString().slice(0, 24)}`); }
        // bottom of the content must be reachable (not hidden behind the sticky ribbon, caption or dock)
        st.scrollTop = st.scrollHeight; const pane = st.querySelector('.pane'); const kids = Array.from(pane.children).filter((k) => !k.classList.contains('turn') && !k.classList.contains('ipa-note') && k.offsetHeight > 0); const last = kids[kids.length - 1]; const rib = pane.querySelector('.turn');
        if (last) { const r = last.getBoundingClientRect(), sr = st.getBoundingClientRect(); const limit = rib && getComputedStyle(rib).position === 'sticky' ? rib.getBoundingClientRect().top : sr.bottom; if (r.bottom > limit + 3 && r.top < sr.bottom) out.lastCovered.push(`${id} last bottom ${Math.round(r.bottom)} > ${Math.round(limit)}`); }
        st.querySelectorAll('.ipa').forEach((e) => { if (getComputedStyle(e).display === 'none') return; const px = parseFloat(getComputedStyle(e).fontSize); if (px < 12) out.ipaSmall.push(`${id} ${px.toFixed(1)}px in .${(e.closest('.tag,.chip,.tile,.opt,.bigpill,.bubble,.pill,.meaning,.small-note,.turn,.card') || e.parentElement).className.toString().split(' ')[0]} "${e.textContent.slice(0, 14)}"`); });
        st.scrollTop = 0; window.scrollTo(0, 0);
      }
      return out;
    }, vp.minStage);
    report[vp.n] = { beats: res.beats, minStageHeightPx: Math.round(res.stageMin), minStageAt: res.stageMinAt, controlsChecked: res.ctlCount, horizontalOverflow: res.over, thinStage: res.thin, dockButtonsUnreachable: res.dockHidden.length, stageControlsOffscreen: res.ctlOff.length, stageControlsCovered: res.ctlCovered.length, contentBehindRibbon: res.lastCovered.length, ipaBelow12px: res.ipaSmall.length, examples: { dock: res.dockHidden.slice(0, 4), off: res.ctlOff.slice(0, 4), covered: res.ctlCovered.slice(0, 4), behind: res.lastCovered.slice(0, 4), thin: res.thin.slice(0, 4), ipaSmall: res.ipaSmall.slice(0, 6) } };
    console.log(`   ${res.beats} steps, ${res.ctlCount} in-stage controls scrolled to; smallest visible stage ${Math.round(res.stageMin)}px at step ${res.stageMinAt}`);
    ok(res.over.length === 0, `${vp.n}: no horizontal overflow` + (res.over.length ? ' — ' + res.over.slice(0, 4) : ''));
    ok(res.thin.length === 0, `${vp.n}: stage keeps ≥ ${vp.minStage}px visible height on every step` + (res.thin.length ? ' — ' + res.thin.slice(0, 4) : ''));
    ok(res.dockHidden.length === 0, `${vp.n}: every teacher control can be scrolled to and clicked` + (res.dockHidden.length ? ' — ' + res.dockHidden.slice(0, 4) : ''));
    ok(res.ctlOff.length === 0, `${vp.n}: every in-stage control can be scrolled fully into view` + (res.ctlOff.length ? ' — ' + res.ctlOff.slice(0, 4) : ''));
    ok(res.ctlCovered.length === 0, `${vp.n}: no in-stage control is covered by another element after scrolling` + (res.ctlCovered.length ? ' — ' + res.ctlCovered.slice(0, 4) : ''));
    ok(res.lastCovered.length === 0, `${vp.n}: bottom of content is not hidden behind the ribbon` + (res.lastCovered.length ? ' — ' + res.lastCovered.slice(0, 4) : ''));
    ok(res.ipaSmall.length === 0, `${vp.n}: no visible IPA below 12px`);
    ok(errs.length === 0, `${vp.n}: no page errors`);
    await ctx.close();
  }
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`); if (fail) console.log('FAILED:\n - ' + failures.join('\n - '));
  fs.writeFileSync(process.env.QA_OUT || '/tmp/viewports-summary.json', JSON.stringify({ file: path.basename(FILE), pass, fail, failures, report }, null, 1));
  process.exit(fail ? 1 : 0);
})();
