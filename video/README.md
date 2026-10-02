# Fluent English — «¿Te bloqueas al hablar?» (30 s vertical reel)

**Status: ready for your review. Nothing has been published, scheduled or sent.**

## Deliverables (`out/`)
| File | What |
|---|---|
| `fluent_english_reel.mp4` | **Main video** — 1080×1920, 30 fps, 30.0 s, burned-in captions **+ IPA** |
| `fluent_english_reel_captions_only.mp4` | Same, captions without IPA |
| `fluent_english_cover_1080x1920.png`, `…_1080x1350.png` | Cover (9:16 and 4:5 grid-safe) |
| `audio_layers/*.flac` | Separate layers: narration, english, music, sfx, ambience, + `mix_master.flac` |
| `review_contact_sheet.png` | Frames I inspected |
| `../docs/` (in `video/docs/`) | Voiceover scripts, sound cue sheet, captions (IG/FB + WhatsApp), licence list, **quality report (read this first)** |

## ⚠ Two things to know before approving
1. **Voices are placeholders** (local Kokoro). The ElevenLabs request could not run — the session proxy holds the key for a misspelled host. See `docs/QUALITY_REPORT.md` §1 for the 1-minute fix.
2. **IPA not yet checked against Oxford Learner's** (site blocked here) and **audio not yet heard by a human.**

## Browser preview (not the MP4)
```bash
cd video/web && python3 -m http.server 8000   # then open http://localhost:8000/index.html
```
CC / IPA button: Off · Captions · Captions + IPA (remembered). Per-layer volume sliders and **Importar** buttons to swap any audio layer for your own file. The controls are production tools and are not part of the exported video.

## Rebuild / export
```bash
cd video && python3 -m venv .venv && . .venv/bin/activate
pip install kokoro-onnx soundfile numpy scipy pillow pyloudnorm librosa pocketsphinx playwright
# models (≈350 MB, gitignored): kokoro-v1.0.onnx + voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 → video/models/
python tools/make_voice.py            # or tools/make_voice_elevenlabs.py (see its header)
python tools/make_timeline.py         # alignment + web/timeline.js
python tools/make_audio.py            # music, sfx, ambience, ducking, loudness → audio/
python tools/render.py --mode ipa     # frames via headless Chromium → MP4  (~100 s, 3 workers, ~150 MB temp)
python tools/render.py --mode cc --out out/fluent_english_reel_captions_only.mp4
python tools/cover.py $PWD            # cover PNGs
python tools/qa_layout.py $PWD ipa    # safe-margin scan
```
Rendering is light (≈2 min on 4 cores); no paid services are used by the pipeline except the optional ElevenLabs script.

## Code map
`web/person.js` character rig (forward-kinematic arms, hand shapes) · `web/scene.js` all six scenes, captions, transitions, cover · `web/player.js` preview + export hooks · `tools/` audio/render/QA.
