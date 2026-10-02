# ¿No entendiste? — 30 s vertical animation for Fluent English

Deliverables (in `out/`): `fluent_english_no_entendiste_cc2.mp4` (1080×1920, 30 fps, 30.000 s, H.264 High + AAC stereo, **Captions + IPA burned in**), `cover_no_entendiste.png` (cover "¿NO ENTENDISTE?"), `audio_mix.wav` (the exact audio muxed into the MP4). Caption for the post: `CAPTION_ES.txt`. Audio cues: `AUDIO_CUE_SHEET.md`. Nothing has been published or scheduled.

## Run / re-render
```bash
cd video && node tools/serve.js 8123        # open http://localhost:8123/  → live preview (▶, CC button, Voz/Música/Efectos sliders)
node tools/render.js --cc 2                 # export (needs Playwright + Chromium + ffmpeg); --cc 0|1|2, --stems for stem WAVs
python3 tools/build_voices.py <model_dir>   # only to re-synthesize voices (Kokoro model files, ~350 MB, not committed)
```
`?render=1&cc=N` hides the production controls; `?cover=1` draws the cover. CC button cycles **Off → Captions → Captions + IPA** (Off hides all caption cards, including the English phrase card; headline, scene tags, countdown, logo and CTA stay).

## How it is built
* `js/character.js` – layered adult male cartoon; arms use 3-D two-bone IK (shoulder → elbow → wrist) with a pole vector that keeps elbows tucked, sleeves with rolled cuffs, coherent wrists, hands with exactly 4 tapered fingers (3 phalanges, own curl) + thumb, palm and back-of-hand views, wrist that follows the forearm. Gestures are spring-smoothed targets (ease, slight overshoot, idle drift, small beats on stressed words); hands rest out of sight below the table edge between gestures. Mouth is lip-synced from the real English voice envelope.
* `js/scenes.js` – parallax room, props, captions (IPA centered under every English word), countdown, slow-down wave, wipes, final scene. The logo is the supplied `fluent_english_logo.png`, drawn unaltered.
* `js/audio.js` – all music, ambience and effects are generated with Web Audio; one schedule feeds both the live preview and the offline export; separate voice / music / fx / ambience buses with ducking under speech.
* `assets/cues.json` – single timeline for voice start times, word/chunk timings, and mouth envelopes.

## Voices (what is real and what is not)
Speech-synthesis engine: **Kokoro v1.0** run locally (no account, key, upload or paid API; ElevenLabs/Speechelo were not used). Spanish narrator `ef_dora`; American-English male `am_michael`, both at natural pace with a light EQ/compression/room finish (`finish()` in `tools/build_voices.py`). Kokoro has **no es-MX voice**, so the Spanish is a neutral synthetic voice, not verified Mexican. It is still a free local neural voice: expect it to sound better than classic TTS but clearly short of a human or a premium cloud voice. The preview's "Voces del navegador" option picks `es-MX` / `en-US` from the device's real voice list and shows the names it found — it was **not testable in this headless environment** (no system voices), and it is not captured in the MP4.

## Verification performed / not performed
* File: ffprobe → 1080×1920, 30 fps, 900 frames, 30.000 s, AAC 44.1 kHz stereo; mix −16.1 LUFS, sample peak −0.6 dBFS.
* Sync: each voice onset in the exported voice stem is within 42 ms (≈1 frame; includes 30 ms of trimmed lead-in) of its cue. Voice RMS is exactly 0 from 19.4 to 24.4 s (practice time); music stays at its soft scene level.
* Pronunciation: an offline recognizer (PocketSphinx) transcribes both English phrases exactly from the voice stem; with music it is less reliable ("good to say that again please" for the first phrase, "a little more slowly pleads" for the second), so a **human listen is still needed**. Spanish lines could not be machine-checked here (no Spanish recognizer available offline) and music/ambience were not auditioned by ear.
* IPA (American English), checked against the CMU Pronouncing Dictionary: kʊd · ju · seɪ · ðæt · əˈɡɛn · pliz and ə · ˈlɪɾəl · mɔr · ˈsloʊli · pliz. "little" is written with the American flap [ɾ] (CMU lists /t/); no phonetician has reviewed it.
* Word highlighting is estimated (phoneme-count proportions snapped to energy dips), not forced alignment.
* Anatomy/layout: reviewed on frames at every pose change and a 1-frame-per-second sweep of the final MP4 (no extra digits, floating hands or outward elbows seen); not every one of the 900 frames was inspected.

## Additions to your brief (please approve or tell me to remove)
Scene tags "PIDE QUE REPITAN" / "PIDE MÁS DESPACIO" / "TU TURNO", the cover tagline "No finjas que sí." (from the concept line), and the laptop video-call illustration. "clases en línea" is the only description of the classes; no platform, price, offer, handle or result is shown.
