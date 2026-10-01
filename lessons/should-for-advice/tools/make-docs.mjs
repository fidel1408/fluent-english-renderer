// Generates docs/NARRATION_SCRIPT.md and docs/CHAPTER_TIMING.md from narration/script.json + generated manifest.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sc = JSON.parse(fs.readFileSync(path.join(root, 'narration/script.json'), 'utf8'));
const man = JSON.parse(fs.readFileSync(path.join(root, 'src/generated/manifest.json'), 'utf8'));
const mmss = (x) => String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(Math.round(x % 60)).padStart(2, '0');
const voiceName = { af_heart: 'Narrator (af_heart)', af_bella: 'Maya (af_bella)', am_michael: 'Daniel (am_michael)', af_sarah: 'Priya (af_sarah)', am_eric: 'Marcus (am_eric)', af_sky: 'Hana (af_sky)', am_liam: 'Theo (am_liam)' };
let md = '# Should for Advice — complete narration and dialogue script\n\nGenerated from the lesson source by `tools/make-docs.mjs`. Every line below is a real audio clip in the lesson (Kokoro-82M voices, see README). Times are the *planned* start of each line inside its segment. IPA is shown on screen in the lesson and is never read aloud.\n\n';
let totalSpeech = 0, nLines = 0;
for (const ch of sc.chapters) {
  md += `\n## Chapter ${ch.n} · ${mmss(ch.a)}–${mmss(ch.b)} · ${ch.title}\n`;
  for (const s of sc.segs.filter((x) => x.ch === ch.n)) {
    md += `\n### ${s.id} · ${s.title}  _(planned ${mmss(s.start)}–${mmss(s.start + s.dur)}, ${s.dur} s${s.timer ? ', learner activity with countdown' : ''}${s.gate ? ', CLASS-mode gate' : ''})_\n\n`;
    for (const l of s.lines) { const d = (man[l.id] || {}).d || 0; totalSpeech += d; nLines++; md += `- **${voiceName[l.voice] || l.voice}** · +${l.start.toFixed(1)} s · ${d.toFixed(1)} s — ${l.text}${l.spoken.startsWith('PH:') ? '  _(weak form: spoken from phonemes)_' : ''}\n`; }
    if (s.clips.length) { md += '\n  _On-demand clips (played when the teacher reveals, a learner chooses a path, or a button is pressed):_\n'; for (const c of s.clips) md += `  - ${voiceName[c.voice] || c.voice} — ${c.text}\n`; }
    if (!s.lines.length && !s.clips.length) md += '- _(no narration)_\n';
  }
}
md += `\n---\nTimeline narration: ${nLines} lines, ${(totalSpeech / 60).toFixed(1)} minutes of speech in the 60:00 plan.\n`;
fs.writeFileSync(path.join(root, 'docs/NARRATION_SCRIPT.md'), md);
let t = '# Should for Advice — chapter timing map\n\nPlanned lesson time (the 60:00 plan). Actual classroom time can be longer if the teacher pauses, replays, extends a timer, or lingers at a CLASS-mode gate.\n\n| Chapter | Planned window | Length | Segments |\n|---|---|---|---|\n';
for (const ch of sc.chapters) t += `| ${ch.n}. ${ch.title} | ${mmss(ch.a)}–${mmss(ch.b)} | ${(ch.b - ch.a) / 60} min | ${sc.segs.filter((x) => x.ch === ch.n).length} |\n`;
t += '\n| Seg | Start | Length | Title | Narration | Learner timer |\n|---|---|---|---|---|---|\n';
for (const s of sc.segs) { const sp = s.lines.reduce((a, l) => a + ((man[l.id] || {}).d || 0), 0); t += `| ${s.id} | ${mmss(s.start)} | ${s.dur} s | ${s.title} | ${sp.toFixed(0)} s | ${s.timer ? 'yes' : '—'} |\n`; }
fs.writeFileSync(path.join(root, 'docs/CHAPTER_TIMING.md'), t);
console.log('docs written; speech', (totalSpeech / 60).toFixed(1), 'min over', nLines, 'timeline lines');
