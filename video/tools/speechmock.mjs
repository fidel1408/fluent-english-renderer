// Exercises the REAL speech code path with a fake speechSynthesis (voices list, onstart/onend, cancel, pause).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 700, height: 1000 } });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.addInitScript(() => {
  const V = [{ name: 'Microsoft Dalia Online (Natural)', lang: 'es-MX' }, { name: 'Google español', lang: 'es-ES' }, { name: 'Microsoft Guy Online (Natural)', lang: 'en-US' }, { name: 'Samantha', lang: 'en-US' }];
  window.__calls = []; let cur = null, q = [], busy = false, timer = null;
  const next = () => { if (busy || !q.length) return; const u = q.shift(); busy = true; cur = u; __calls.push({ t: Math.round(performance.now()), text: u.text, voice: u.voice && u.voice.name, rate: u.rate, ev: 'speak' });
    setTimeout(() => { u.onstart && u.onstart({}); }, 30);
    timer = setTimeout(() => { busy = false; cur = null; __calls.push({ t: Math.round(performance.now()), text: u.text, ev: 'end' }); u.onend && u.onend({}); next(); }, 120 + u.text.length * 55); };
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => V, speak: u => { q.push(u); next(); }, cancel: () => { q = []; if (cur) { clearTimeout(timer); const u = cur; cur = null; busy = false; __calls.push({ t: Math.round(performance.now()), ev: 'cancel' }); u.onerror && u.onerror({ error: 'canceled' }); } }, pause() { }, resume() { }, onvoiceschanged: null } });
});
await p.goto('file://' + join(root, 'index.html')); await p.waitForTimeout(600);
console.log('es options:', await p.$$eval('#selEs option', o => o.map(x => x.textContent)));
console.log('en options:', await p.$$eval('#selEn option', o => o.map(x => x.textContent)));
await p.click('#bStart'); await p.waitForTimeout(6000);
await p.click('#bReplay');   // replay mid-show must cancel cleanly
await p.evaluate(() => new Promise(r => window.addEventListener('fe-ended', r, { once: true })));
const calls = await p.evaluate(() => __calls);
const t0 = calls.find(c => c.ev === 'speak' && c.text === '¡Cuidado!' && calls.indexOf(c) > 3)?.t ?? 0;
let overlap = 0, open = 0; calls.forEach(c => { if (c.ev === 'speak') { open++; if (open > 1) overlap++; } if (c.ev === 'end' || c.ev === 'cancel') open = Math.max(0, open - 1); });
console.log('cancel events:', calls.filter(c => c.ev === 'cancel').length, 'overlaps:', overlap);
const last = calls.slice(calls.findLastIndex(c => c.ev === 'cancel') + 1).filter(c => c.ev !== 'cancel');
last.filter(c => c.ev === 'speak').forEach(c => console.log(((c.t - last[0].t) / 1000).toFixed(2).padStart(6), c.voice.padEnd(34), c.rate, c.text));
// silent gap between narration "Dilo en inglés." end and the English answer start
const ends = last.filter(c => c.ev === 'end'), spk = last.filter(c => c.ev === 'speak');
const i = spk.findIndex(c => c.text === "I'm currently learning English."), j = ends.findIndex(c => c.text === 'Dilo en inglés.');
console.log('silence before answer (s):', ((spk[i].t - ends[j].t) / 1000).toFixed(2));
await b.close();
