// Headless smoke test of the live preview with a mocked speechSynthesis (headless Chromium has no voices).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://127.0.0.1:8123/index.html';
const browser = await chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.addInitScript(() => {
  const voices = [{ name: 'Mock Paulina', lang: 'es-MX', voiceURI: 'es1', localService: true }, { name: 'Mock Samantha', lang: 'en-US', voiceURI: 'en1', localService: true }];
  let timers = []; window.__spoken = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  const synth = { getVoices: () => voices, addEventListener() {}, speaking: false,
    speak(u) { window.__spoken.push({ text: u.text, at: performance.now() });
      timers.push(setTimeout(() => u.onstart && u.onstart(), 80));
      timers.push(setTimeout(() => u.onend && u.onend(), 80 + u.text.length * 62)); },
    cancel() { timers.forEach(clearTimeout); timers = []; }, pause() {}, resume() {} };
  Object.defineProperty(window, 'speechSynthesis', { value: synth });
});
await page.goto(url);
await page.waitForFunction(() => document.getElementById('voice_es').options.length > 0);
console.log('voices:', await page.$$eval('#voice_es option, #voice_en option', (o) => o.map((x) => x.textContent)));
// CC persistence
await page.click('#btnCC'); const cc1 = await page.evaluate(() => [FE.run.cc, localStorage.getItem('fe_cc')]);
await page.click('[data-cc="2"]'); const cc2 = await page.evaluate(() => [FE.run.cc, localStorage.getItem('fe_cc')]);
console.log('cc after click (->0):', cc1, ' after set 2:', cc2);
await page.click('#btnStart');
await page.waitForTimeout(3000);
await page.click('#btnPause'); const tp = await page.evaluate(() => FE.run.clock); await page.waitForTimeout(1200);
const tp2 = await page.evaluate(() => FE.run.clock); console.log('paused clock stable:', tp === tp2);
await page.click('#btnStart');
await page.waitForFunction(() => FE.run.state === 'ended', null, { timeout: 90000 });
const r = await page.evaluate(() => ({ beats: FE.run.beats, spoken: window.__spoken.map((s) => s.text), clock: FE.run.clock, audioState: FE.run.ctx && FE.run.ctx.state }));
for (const [k, b] of Object.entries(r.beats)) console.log(k.padEnd(8), JSON.stringify(Object.fromEntries(Object.entries(b).map(([a, v]) => [a, v == null ? v : +v.toFixed(2)]))));
console.log('silence length:', (r.beats.silence.end - r.beats.silence.s).toFixed(2), 's; spoken lines:', r.spoken.length, '; total', r.clock.toFixed(1), 's; audio ctx', r.audioState);
// replay clears queue and restarts
await page.click('#btnReplay'); await page.waitForTimeout(1500);
console.log('replay state:', await page.evaluate(() => [FE.run.state, FE.run.idx, Object.keys(FE.run.beats).length]));
await page.click('#btnMute'); console.log('muted:', await page.evaluate(() => FE.run.muted));
await page.screenshot({ path: 'out/preview.png' });
console.log('errors:', errors);
await browser.close();
