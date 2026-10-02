# Fluent English — MONEY: "Spend or Waste?" (9:16, 28.8 s)

Animated vertical video for Adult Spanish-speaking learners in Mexico. Source is HTML + SVG + JavaScript (no video-editing project needed);
the MP4s are rendered from it frame-by-frame.

> **Status:** video ✅ · captions/IPA ✅ · **sound ✅ (narration + music + ambience + effects, all generated locally — no API keys, services or uploaded voice files)** · nothing published.
> Not verifiable by a machine: how the voices *sound to a human ear* — please listen once (see [docs/QA_REPORT.md](docs/QA_REPORT.md)).

## What to open
| File | What it is |
|------|-----------|
| [output/spend-or-waste_mode2.mp4](output/spend-or-waste_mode2.mp4) | **Main MP4** — burned-in Spanish captions + English cards + IPA. 1080×1920, 30 fps, H.264 + AAC stereo, 28.9 s, **with sound** |
| [output/spend-or-waste_mode1.mp4](output/spend-or-waste_mode1.mp4) | Same, captions without IPA |
| [output/spend-or-waste_mode0.mp4](output/spend-or-waste_mode0.mp4) | Same, no captions/IPA (graphics only) |
| [output/cover_spend-or-waste.png](output/cover_spend-or-waste.png) | Clean cover frame "SPEND OR WASTE?" (1080×1920) |
| [index.html](index.html) | Interactive browser preview (needs a local server, see below) |
| [docs/SCRIPT.md](docs/SCRIPT.md) | Exact voiceover script, timings, on-screen text, IPA table |
| [docs/SOUND.md](docs/SOUND.md) | Sound design: layers, cues, ducking, mix levels |
| [voice/README.md](voice/README.md) | How the narration voices were chosen and built |
| [docs/SOCIAL_COPY.md](docs/SOCIAL_COPY.md) | Instagram/Facebook caption + shorter WhatsApp Status caption (drafts) |
| [docs/NOTES.md](docs/NOTES.md) | Two alternative hooks, teaching-accuracy notes, design choices |
| [docs/QA_REPORT.md](docs/QA_REPORT.md) | Checks actually run and what is still pending |
| [docs/captions_es.srt](docs/captions_es.srt), [docs/captions_en_ipa.srt](docs/captions_en_ipa.srt) | Caption files (planned timing until audio exists) |

## Preview in a browser (with sound)
```bash
cd video/money-spend-waste
npm run preview            # http://localhost:8765   (or: python3 -m http.server 8765)
```
Press **Start** (big button, toolbar, or Space). Controls: Pause/Resume, Restart, scrubber, **CC/IPA** button (Off → Captions → Captions + IPA, remembered; key `C`), **Mute** (`M`), independent **Voice / Music / Ambience / Effects** sliders (remembered), Safe zones. The page first builds the soundtrack in the background (~8 s, badge shows "Sound ready").
An MP4 cannot keep an interactive button — the chosen caption mode is *burned in* when exporting, and the export page (`?export=1&mode=N`) has no buttons, debug text or cursor.

## Export an MP4 with sound
```bash
npm install                      # playwright (set CHROMIUM_PATH to your Chromium if needed); ffmpeg on PATH
bash scripts/finish_with_audio.sh   # soundtrack -> 3 MP4 variants -> proof that every layer is in the MP4
# or step by step:
node scripts/render_audio.mjs                                                   # audio/export/soundtrack.wav (+ stems)
node scripts/render.mjs --mode 2 --audio audio/export/soundtrack.wav --out output/spend-or-waste_mode2.mp4   # mode 0|1|2
```
The audio is computed offline with the same Web Audio code as the preview, not recorded from a browser, so no layer can be lost in export. ~100–130 s per MP4 on 4 cores (2 browser workers, <1 GB RAM). Cover: `node scripts/cover.mjs`.

## Re-make the narration (optional)
`bash voice/setup_voices.sh` (downloads open-source models, ~0.6 GB) → `python3 voice/build_narration.py`. See [voice/README.md](voice/README.md).

## Checks you can re-run
`node scripts/check_ipa.mjs` (IPA symbols ⊂ Sound Chart) · `node scripts/qa_layout.mjs` (safe-zone / overlap scan) · `node scripts/test_sound.mjs` (24 sound behaviour tests) · `python3 scripts/verify_video_audio.py output/spend-or-waste_mode2.mp4` (every layer is inside the MP4) · `python3 scripts/verify_av_sync.py …` · `python3 scripts/analyze_audio.py` · `node scripts/export_captions.mjs`.

## Layout of the source
`src/timeline.js` (timing/script/IPA) · `src/soundtrack.js` + `src/synth.js` + `src/player.js` (sound) · `voice/` (narration) · `src/man.js` (jointed character: arms, hands, fingers, face) · `src/props.js` · `src/scenes.js` · `src/ui.js` (cards, captions, CTA) · `src/main.js` (player, CC/IPA, audio) · `assets/` (authentic Fluent English logo, bundled OFL fonts).
