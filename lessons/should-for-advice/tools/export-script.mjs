// Dumps every narration/dialogue clip (and the human-readable script + timing map) from the built lesson.
import { chromium } from 'playwright-core';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage(); await p.goto('file://' + root + '/dist/should-for-advice.html'); await p.waitForTimeout(400);
const data = await p.evaluate(() => ({
  chapters: FE.chapters,
  segs: FE.segs.map((s) => ({ id: s.id, ch: s.ch, title: s.title, start: s.start, dur: s.dur, timer: !!s.timer, gate: !!s.gate,
    lines: s.lines.map((l) => ({ k: l.k, who: l.who, voice: l.voice, sp: l.sp, text: FE.plain(l.text), spoken: l.spoken, id: l.id, start: l.start, end: l.end })),
    clips: Object.values(s.C || {}).map((c) => ({ k: c.k, who: c.who, voice: c.voice, sp: c.sp, text: FE.plain(c.text), spoken: c.spoken, id: c.id })) })),
}));
const clips = {};
for (const s of data.segs) for (const l of [...s.lines, ...s.clips]) clips[l.id] = { id: l.id, voice: l.voice, sp: l.sp, spoken: l.spoken, who: l.who };
fs.mkdirSync(path.join(root, 'narration'), { recursive: true });
fs.writeFileSync(path.join(root, 'narration/script.json'), JSON.stringify({ clips: Object.values(clips), segs: data.segs, chapters: data.chapters }, null, 1));
console.log('segments', data.segs.length, 'unique clips', Object.keys(clips).length, 'words', Object.values(clips).reduce((a, c) => a + c.spoken.split(/\s+/).length, 0));
await b.close();
