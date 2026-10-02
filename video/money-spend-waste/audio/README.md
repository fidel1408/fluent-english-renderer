# Voiceover audio — PENDING

No audio is included. Record or generate the 7 clips from `docs/SCRIPT.md`, save them here as `<id>.mp3` or `.wav`
(`es_hook`, `en_spend`, `es_spend`, `en_waste`, `es_waste`, `es_speak`, `es_cta`) and list them in `manifest.json`:

```json
{ "clips": { "es_hook": "audio/es_hook.mp3", "en_spend": "audio/en_spend.mp3", "es_spend": "audio/es_spend.mp3",
             "en_waste": "audio/en_waste.mp3", "es_waste": "audio/es_waste.mp3", "es_speak": "audio/es_speak.mp3",
             "es_cta": "audio/es_cta.mp3" } }
```

Then:
1. `node scripts/measure_audio.mjs --write` — measures real durations, flags clips that overrun their window, stores timing so captions/highlights re-sync.
2. Open `index.html` through a local server (`npm run preview`) — the badge turns green when all 7 clips load; replay never overlaps audio.
3. `node scripts/mix_audio.mjs` → `audio/voiceover_mix.wav` (positioned at each clip's start, loudness-normalised, 2 s of silence preserved for the speaking pause).
4. `node scripts/render.mjs --mode 2 --audio audio/voiceover_mix.wav --out output/spend-or-waste_final.mp4`

`scripts/generate_voiceover.mjs` can create the clips with ElevenLabs using **your** API key (untested here; it spends your credits only when you run it). Audition voices first (`--list`), and listen to every clip before using it.

**Shortcut:** once the 7 clips are in `audio/` and listed in `manifest.json`, run `bash scripts/finish_with_audio.sh` (measure → mix → render all 3 variants with sound). The measure/mix/mux chain was tested with synthetic tones; the real voice has not been heard.
