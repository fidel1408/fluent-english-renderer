# Asset licence list

| Asset | Source | Licence / status |
|---|---|---|
| Fluent English logo (`web/img/logo_blue.png`, `logo_white.png`) | Supplied by you (repo root `fluent_english_logo_*.png`) | Yours; used unmodified (only scaled) |
| Characters, scenes, icons, animation | Hand-coded SVG in `web/person.js`, `web/scene.js` | Original to this project |
| Music, sound effects, ambience | Synthesised from scratch in `tools/make_audio.py` (numpy/scipy) — no samples | Original; no third-party audio |
| Narration + English teaching voice | Kokoro-82M ONNX model (`kokoro-onnx`, hexgrad/Kokoro) | Apache-2.0. Voices are model outputs; **placeholder until ElevenLabs is run** (ElevenLabs output licence then depends on your ElevenLabs plan) |
| Fonts: Plus Jakarta Sans, Gentium Plus (IPA), Source Serif 4 (unused) | Fontsource npm packages | SIL Open Font License 1.1 |
| Word alignment | `pocketsphinx` (BSD-style) | Tooling only |
| Libraries | Playwright, ffmpeg (system), pyloudnorm, librosa, scipy, numpy, soundfile | OSS tooling; not shipped in the video |

No copyrighted songs, no stock footage, no real-person likenesses or testimonials. Illustrated characters are fictional; no private student data.
