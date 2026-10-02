// Measures real voiceover clips (audio/<id>.mp3|wav) with ffprobe, checks they fit their windows,
// and writes measured start/dur into audio/manifest.json "timing" so captions + highlights re-sync.
// Usage: node scripts/measure_audio.mjs [--write]
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIPS, PAUSE, SCENES } from '../src/timeline.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mfPath = resolve(root, 'audio/manifest.json');
const mf = JSON.parse(readFileSync(mfPath, 'utf8'));
const scene = (t) => SCENES.find(s => t >= s.t0 && t < s.t1);
let bad = 0; const timing = {};
for (const c of CLIPS) {
  const file = mf.clips?.[c.id]; if (!file || !existsSync(resolve(root, file))) { console.log(`PENDING  ${c.id}: no audio file`); bad++; continue; }
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', resolve(root, file)]).toString());
  const sc = scene(c.start);
  const end = c.start + dur;
  const limit = c.id === 'es_speak' ? PAUSE.start + 0.15 : (sc ? sc.t1 - 0.05 : Infinity);
  const ok = end <= limit;
  if (!ok) bad++;
  console.log(`${ok ? 'OK     ' : 'TOO LONG'} ${c.id}: planned ${c.dur.toFixed(2)}s, measured ${dur.toFixed(2)}s, ends ${end.toFixed(2)}s (limit ${limit.toFixed(2)}s)`);
  timing[c.id] = { start: c.start, dur: Math.round(dur * 100) / 100 };
}
if (process.argv.includes('--write')) { mf.timing = timing; writeFileSync(mfPath, JSON.stringify(mf, null, 2) + '\n'); console.log('wrote timing to audio/manifest.json'); }
console.log(bad ? `\n${bad} issue(s). Shorten/regenerate the flagged clips (keep delivery natural; do not speed up).` : '\nAll clips fit their windows.');
process.exit(bad ? 1 : 0);
