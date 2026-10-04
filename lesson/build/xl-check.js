const { chromium, launchOpts } = require('./pw'); const path = require('path');
(async () => { const b = await chromium.launch({ ...launchOpts }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
 await p.goto('file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html'));
 await p.evaluate(async () => { S.started = true; document.getElementById('start').hidden = true; S.settings.mute = true; S.settings.rm = true; S.settings.ts = 2; S.settings.cc = 'ipa'; applySettings(); __lesson.enter(2, 15, { noIntro: true, tr: false, instant: true }); await new Promise(r => setTimeout(r, 300)); });
 await p.screenshot({ path: process.argv[2], clip: { x: 0, y: 60, width: 760, height: 520 } }); await b.close(); })();
