#!/usr/bin/env node
// node build/verify_layout.js <video> [rootDir]   Pixel tests on a FLAT-GREY background render (so dark text cannot hide in the scene):
//  T1 label-before-text   : the coral EVITA label is visible no later than the first phrase text pixel
//  T2 label states        : in the "fix" window no coral pixels exist above the card (am/dust cannot cross or imitate the label)
//  T3 example card spill  : no dark text pixels below the card bottom while "with you." enters
// Frames are rendered at 30 fps from the same deterministic renderer used for the MP4.
const path = require('path'); const root = path.resolve(process.argv[3] || path.join(__dirname, '..')); const L = require(path.join(root, 'build', 'lib.js'));
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright');
(async () => {
  const name = process.argv[2] || 'i_agree', m = L.loadManifest(name), { K } = L.plan(name, m.cues), S = await L.serve(), b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(S.url + '/src/index.html?video=' + name); await p.evaluate(() => window.ready); await p.evaluate(c => { window.__FLAT = true; window.setCues(c); }, m.cues);
  // pixel counting happens inside the page (only a number leaves the browser)
  const cnt = (t, x0, y0, x1, y1, kind) => p.evaluate(([t, x0, y0, x1, y1, kind]) => { window.renderFrame(t); const d = document.getElementById('c').getContext('2d').getImageData(x0, y0, x1 - x0, y1 - y0).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (kind === 'coral' ? (Math.abs(r - 244) < 14 && Math.abs(g - 117) < 14 && Math.abs(b - 88) < 14) : (r < 55 && g < 60 && b < 80)) n++; } return n; }, [t, x0, y0, x1, y1, kind]);
  const R = { video: name, T1: null, T2: null, T3: null };
  // T1
  let firstLabel = null, firstText = null; for (let k = Math.round((K.badIn - .05) * 30); k < Math.round((K.badIn + .8) * 30); k++) { const t = k / 30, lab = await cnt(t, 250, 400, 780, 500, 'coral'), tx = await cnt(t, 120, 560, 900, 700, 'navy');
    if (firstLabel === null && lab > 400) firstLabel = { t: +t.toFixed(3), coralPx: lab }; if (firstText === null && tx > 150) firstText = { t: +t.toFixed(3), navyPx: tx }; }
  R.T1 = { firstReadableLabel: firstLabel, firstPhraseText: firstText, pass: !!firstLabel && !!firstText && firstLabel.t <= firstText.t };
  // T2: while the label should be neutral (strikeS..flip) no coral above the card top (y<498)
  let maxCoral = 0, frames = 0; for (let k = Math.round(K.strikeS * 30) + 2; k < Math.round(K.flip * 30); k++) { const n = await cnt(k / 30, 60, 340, 1020, 498, 'coral'); maxCoral = Math.max(maxCoral, n); frames++; }
  R.T2 = { framesChecked: frames, maxCoralPxAboveCard: maxCoral, pass: maxCoral === 0 };
  // T3: dark text pixels below the card bottom during the example entrance
  let worst = 0, wt = 0, nf = 0; for (let k = Math.round((K.grow0 - .1) * 30); k < Math.round((K.hl + .9) * 30); k++) { const t = k / 30, g = Math.min(1, Math.max(0, (t - K.grow0) / (K.grow1 - K.grow0))), e = g < .5 ? 4 * g * g * g : 1 - Math.pow(-2 * g + 2, 3) / 2, bottom = Math.round(500 + 240 + 150 * e);
    const n = await cnt(t, 90, bottom + 8, 930, Math.min(1090, bottom + 170), 'navy'); nf++; if (n > worst) { worst = n; wt = +t.toFixed(3); } }
  R.T3 = { framesChecked: nf, worstDarkTextPxBelowCard: worst, atT: wt, pass: worst === 0 };
  R.pass = R.T1.pass && R.T2.pass && R.T3.pass; console.log(JSON.stringify(R, null, 1)); await b.close(); S.srv.close(); process.exit(R.pass ? 0 : 1);
})();
