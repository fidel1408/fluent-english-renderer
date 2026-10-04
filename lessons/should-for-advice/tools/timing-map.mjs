// Prints/writes the chapter timing map with narration seconds and slack per segment.
import { chromium } from 'playwright-core'; import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage(); await p.goto('file://' + root + '/dist/should-for-advice.html'); await p.waitForTimeout(400);
const rows = await p.evaluate(() => FE.segs.map((s) => ({ id: s.id, ch: s.ch, title: s.title, start: s.start, dur: s.dur, speech: s.lines.reduce((a, l) => a + l.dur, 0), speechEnd: s.speechEnd || 0, timer: s.timer ? s.dur - s.timerAt : 0, interactive: !!s.timer || /Pair|think|Think/.test(s.title) })));
const f = (x) => String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(Math.round(x % 60)).padStart(2, '0');
let md = '| Seg | Planned start | Planned length | Title | Narration | Silent/response time |\n|---|---|---|---|---|---|\n';
for (const r of rows) { console.log(r.id.padEnd(5), f(r.start), String(r.dur).padStart(4), 'speech', r.speech.toFixed(0).padStart(3), 'end', r.speechEnd.toFixed(0).padStart(3), 'timer', String(Math.round(r.timer)).padStart(3), r.title); md += `| ${r.id} | ${f(r.start)} | ${r.dur} s | ${r.title} | ${r.speech.toFixed(0)} s | ${(r.dur - r.speech).toFixed(0)} s |\n`; }
const tot = rows.reduce((a, r) => a + r.speech, 0); console.log('total speech', tot.toFixed(0), 's of 3600 s');
fs.writeFileSync(new URL('../docs/timing.md', import.meta.url), md); await b.close();
