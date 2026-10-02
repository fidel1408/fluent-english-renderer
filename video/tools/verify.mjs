// Headless end-to-end check: plays the whole show (simulated speech timings), logs scene times,
// then runs the in-page export and saves the file for ffprobe/ffmpeg inspection.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..'), out = process.argv[2] || '.';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'] });
const ctx = await b.newContext({ viewport: { width: 700, height: 1000 }, acceptDownloads: true });
const p = await ctx.newPage();
p.on('pageerror', e => console.log('[pageerror]', e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load/.test(m.text())) console.log('[error]', m.text()); });
await p.goto('file://' + join(root, 'index.html')); await p.waitForTimeout(800);
console.log('voices:', await p.evaluate(() => speechSynthesis.getVoices().length), 'mime:', await p.evaluate(() => ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/webm;codecs=vp9,opus'].map(m => MediaRecorder.isTypeSupported(m))));
await p.evaluate(() => { window.__log = []; const f = enterScene; window.__t0 = performance.now(); });
// scene timeline logger
await p.evaluate(() => { let last = -2; setInterval(() => { const s = __fe.Show; if (s.scene !== last) { last = s.scene; __log.push([s.scene, +((__fe.Clock.now()) / 1000).toFixed(2)]); } }, 20); });
await p.click('#bStart');
await p.evaluate(() => new Promise(r => window.addEventListener('fe-ended', r, { once: true })));
console.log('scene starts (s):', JSON.stringify(await p.evaluate(() => __log)), 'end:', await p.evaluate(() => +(__fe.Clock.now() / 1000).toFixed(2)));
// export
const dl = p.waitForEvent('download', { timeout: 90000 });
await p.evaluate(() => { document.getElementById('bExport').click(); });
const d = await dl; const path = join(out, d.suggestedFilename()); await d.saveAs(path); console.log('exported', path, await p.textContent('#status'));
await b.close();
