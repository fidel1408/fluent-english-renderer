// Exports caption files from the timeline: docs/captions_es.srt and docs/captions_en_ipa.srt (planned timing until audio is imported).
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAPTIONS, SENTENCES } from '../src/timeline.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ts = (t) => { const ms = Math.round(t * 1000); const p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
const es = CAPTIONS.map((c, i) => `${i + 1}\n${ts(c.t0)} --> ${ts(c.t1)}\n${c.lines.join('\n')}\n`).join('\n');
writeFileSync(resolve(root, 'docs/captions_es.srt'), es);
let n = 0; const en = Object.values(SENTENCES).map(S => { const text = S.words.map(w => w.w + (w.punct || '')).join(' '); const ipa = S.words.filter(w => w.ipa).map(w => `/${w.ipa}/`).join(' '); const [a, b] = S.shown; return `${++n}\n${ts(a)} --> ${ts(b)}\n${text}\n${ipa}\n`; }).join('\n');
writeFileSync(resolve(root, 'docs/captions_en_ipa.srt'), en);
console.log('wrote docs/captions_es.srt, docs/captions_en_ipa.srt');
