// Mixes the individual voice clips onto one timeline (audio/voiceover_mix.wav) using each clip's start time.
// Usage: node scripts/mix_audio.mjs   then   node scripts/render.mjs --audio audio/voiceover_mix.wav
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIPS, DURATION } from '../src/timeline.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mf = JSON.parse(readFileSync(resolve(root, 'audio/manifest.json'), 'utf8'));
const inputs = [], filters = [];
CLIPS.forEach((c) => {
  const file = mf.clips?.[c.id]; if (!file || !existsSync(resolve(root, file))) throw new Error(`Missing audio for ${c.id} — mix aborted (audio is still pending).`);
  const start = mf.timing?.[c.id]?.start ?? c.start;
  inputs.push('-i', resolve(root, file));
  filters.push(`[${inputs.length / 2 - 1}:a]aresample=48000,aformat=channel_layouts=mono,adelay=${Math.round(start * 1000)}:all=1[a${inputs.length / 2 - 1}]`);
});
const labels = CLIPS.map((_, i) => `[a${i}]`).join('');
const fc = `${filters.join(';')};${labels}amix=inputs=${CLIPS.length}:normalize=0,apad=whole_dur=${DURATION},atrim=0:${DURATION},loudnorm=I=-16:TP=-1.5:LRA=7[out]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '[out]', '-ac', '2', resolve(root, 'audio/voiceover_mix.wav')], { stdio: 'inherit' });
console.log('wrote audio/voiceover_mix.wav');
