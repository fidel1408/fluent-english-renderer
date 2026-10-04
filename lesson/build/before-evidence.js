// Demonstrates the reported defects on the UNCHANGED v4 baseline (lesson/versions/lesson-v4-baseline.html).
const { chromium, launchOpts } = require('./pw'); const path = require('path');
(async () => {
  const b = await chromium.launch({ ...launchOpts }); const p = await b.newPage({ viewport: { width: 1280, height: 780 } });
  await p.goto('file://' + path.resolve(__dirname, '../versions/lesson-v4-baseline.html'));
  const r = await p.evaluate(async () => { S.started = true; document.getElementById('start').hidden = true; S.settings.mute = true; applySettings(); const out = {}; const L = __lesson; const w = (ms) => new Promise((r) => setTimeout(r, ms));
    L.enter(2, 15, { noIntro: true, tr: false }); await w(300); const click = (x) => document.querySelector(`[data-w="${x}"]`).click(); click('I'); click('am'); click('a student'); document.getElementById('wb-check').click(); out['1 word bank: I + am + a student →'] = document.getElementById('wb-fb').firstChild.textContent.split('/')[0];
    out['2 quiz Q4 options that are contractions (should be exactly 1)'] = MCQ_ITEMS[3].opts.filter((o) => /[’']/.test(o) && !/They’s/.test(o) && !/Their/.test(o)).join(' | ');
    out['3 quiz Q4 prompt'] = MCQ_ITEMS[3].ctx; out['3b Q6 prompt'] = MCQ_ITEMS[5].ctx; out['3c Q8 prompt'] = MCQ_ITEMS[7].ctx; out['3d Q3 extension'] = MCQ_ITEMS[2].ext;
    L.enter(0, 1, { noIntro: true, tr: false }); await w(2300); const before = S.spent[0]; document.getElementById('b-skip').click(); out['6 Skip timer: actual elapsed before → after (seconds)'] = `${before.toFixed(1)} → ${S.spent[0].toFixed(1)}`;
    L.enter(3, 4, { noIntro: true, tr: false }); out['8 jumped to last screen of activity 4: marked completed?'] = !!S.done[3];
    document.getElementById('b-dock').click(); out['7 after Hide: show-button exists?'] = !!document.getElementById('show-dock') + ' (only the H key restores)'; document.body.classList.remove('nodock');
    out['9 IPA.line("Please repeat and speak aloud")'] = IPA.line('Please repeat and speak aloud').text; out['9b IPA.line("The answer is B.")'] = IPA.line('The answer is B.').text; out['9c IPA.line("Short form A")'] = IPA.line('Short form A').text;
    out['10 narration contains "I is the speaker"'] = ACTS[1].beats[0].seq.some((s) => /I is the speaker/.test(s.t || ''));
    out['export keys per mode'] = Object.keys(collectResults().ten_question_check.shared_class_activity).join(', ') + ' (no per-question answers)';
    L.enter(4, 2, { noIntro: true, tr: false }); await w(6500); const rows = Array.from(document.querySelectorAll('table.t tr.fadein')); out['15 negatives table (A5 step 3): rows with opacity 1 after 6.5 s'] = rows.filter((r) => getComputedStyle(r).opacity === '1').length + ' of ' + rows.length + ' (rows never fade in)';
    const saved = JSON.stringify({ v: 1, started: true, a: 2, b: 4, spent: [1, 1, 1, 0, 0, 0, 0, 0, 0], extra: [0, 0, 0, 0, 0, 0, 0, 0, 0], visited: {}, done: {}, diag: {}, mode: 'shared', mcq: { shared: { first: {}, retry: {} }, individual: { first: {}, retry: {} } }, retry: { active: false }, settings: { cc: 'ipa' } }); mergeState(JSON.parse(saved)); out['14 resumed old save: settings.vMusic'] = String(S.settings.vMusic) + ' (undefined → AudioParam non-finite error)';
    return out; });
  console.log('BEFORE (v4 baseline) — defect demonstrations'); for (const [k, v] of Object.entries(r)) console.log(' ', k.padEnd(62), String(v)); await b.close();
})();
