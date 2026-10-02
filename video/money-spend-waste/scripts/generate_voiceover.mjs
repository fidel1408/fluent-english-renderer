// OPTIONAL helper — NOT RUN in the delivery session (ElevenLabs auth was unavailable there).
// Generates the 7 clips with ElevenLabs using YOUR key. Spends your ElevenLabs credits, so it only runs when you start it.
//   ELEVENLABS_API_KEY=... node scripts/generate_voiceover.mjs --list            # preview available voices
//   ELEVENLABS_API_KEY=... ES_VOICE=<id> EN_VOICE=<id> node scripts/generate_voiceover.mjs
// Any other TTS/human recording works too: just save audio/<clip id>.mp3 (or .wav) and list it in audio/manifest.json.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIPS } from '../src/timeline.js';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const key = process.env.ELEVENLABS_API_KEY; if (!key) { console.error('Set ELEVENLABS_API_KEY'); process.exit(1); }
const H = { 'xi-api-key': key, 'content-type': 'application/json' };
if (process.argv.includes('--list')) {
  const r = await (await fetch('https://api.elevenlabs.io/v1/voices', { headers: H })).json();
  for (const v of r.voices) console.log(v.voice_id, '|', v.name, '|', Object.values(v.labels || {}).join(','), '| preview:', v.preview_url);
  process.exit(0);
}
const ES = process.env.ES_VOICE, EN = process.env.EN_VOICE || ES;
if (!ES) { console.error('Set ES_VOICE (and optionally EN_VOICE). Audition voices with --list first.'); process.exit(1); }
mkdirSync(resolve(root, 'audio'), { recursive: true });
const mfPath = resolve(root, 'audio/manifest.json'); const mf = JSON.parse(readFileSync(mfPath, 'utf8')); mf.clips ??= {};
for (const c of CLIPS) {
  const voice = c.lang === 'es' ? ES : EN;
  // English examples are plain sentences; Spanish clips keep their own punctuation for natural pausing.
  const body = { text: c.text, model_id: 'eleven_multilingual_v2', ...(c.lang === 'es' ? { language_code: 'es' } : { language_code: 'en' }),
    voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, speed: 1.0 } };
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  if (!r.ok) { console.error(c.id, r.status, await r.text()); process.exit(1); }
  writeFileSync(resolve(root, `audio/${c.id}.mp3`), Buffer.from(await r.arrayBuffer()));
  mf.clips[c.id] = `audio/${c.id}.mp3`; console.log('wrote', c.id);
}
writeFileSync(mfPath, JSON.stringify(mf, null, 2) + '\n');
console.log('Next: listen to every clip, then node scripts/measure_audio.mjs --write && node scripts/mix_audio.mjs');
