# Fluent English — MONEY: "Spend or Waste?" (9:16, 28.8 s)

Animated vertical video for Adult Spanish-speaking learners in Mexico. Source is HTML + SVG + JavaScript (no video-editing project needed);
the MP4s are rendered from it frame-by-frame.

> **Status:** video ✅ rendered & checked · captions/IPA ✅ · **voiceover ⏳ PENDING** (silent MP4s) · Oxford lookup of the IPA ⏳ not possible from this environment · **nothing published**.
> Full list in [docs/QA_REPORT.md](docs/QA_REPORT.md).

## What to open
| File | What it is |
|------|-----------|
| [output/spend-or-waste_mode2.mp4](output/spend-or-waste_mode2.mp4) | **Main MP4** — burned-in Spanish captions + English cards + IPA. 1080×1920, 30 fps, H.264, 28.8 s, **no audio track (voiceover pending)** |
| [output/spend-or-waste_mode1.mp4](output/spend-or-waste_mode1.mp4) | Same, captions without IPA |
| [output/spend-or-waste_mode0.mp4](output/spend-or-waste_mode0.mp4) | Same, no captions/IPA (graphics only) |
| [output/cover_spend-or-waste.png](output/cover_spend-or-waste.png) | Clean cover frame "SPEND OR WASTE?" (1080×1920) |
| [index.html](index.html) | Interactive browser preview (needs a local server, see below) |
| [docs/SCRIPT.md](docs/SCRIPT.md) | Exact voiceover script, on-screen text, IPA table |
| [docs/SOCIAL_COPY.md](docs/SOCIAL_COPY.md) | Instagram/Facebook caption + shorter WhatsApp Status caption (drafts) |
| [docs/NOTES.md](docs/NOTES.md) | Two alternative hooks, teaching-accuracy notes, design choices |
| [docs/QA_REPORT.md](docs/QA_REPORT.md) | Checks actually run and what is still pending |
| [docs/captions_es.srt](docs/captions_es.srt), [docs/captions_en_ipa.srt](docs/captions_en_ipa.srt) | Caption files (planned timing until audio exists) |

## Preview in a browser
```bash
cd video/money-spend-waste
npm run preview            # http://localhost:8765   (or: python3 -m http.server 8765)
```
Controls: Play / Restart / scrubber, **CC/IPA button** (Off → Captions → Captions + IPA; remembered in `localStorage`; key `C`), Mute, Safe zones (shows platform UI zones). A badge shows whether voiceover clips were found.
An MP4 cannot keep an interactive button — the chosen mode is *burned in* when exporting, and the export page (`?export=1&mode=N`) has no buttons, debug text or cursor.

## Export an MP4
```bash
npm install                                  # playwright (uses your Chromium; set CHROMIUM_PATH if needed) ; ffmpeg must be on PATH
node scripts/render.mjs --mode 2 --out output/spend-or-waste_mode2.mp4      # mode 0 | 1 | 2
```
Cost: 864 PNG frames at 1080×1920, 2 browser workers. About 100–130 s on 4 cores, <1 GB RAM. `--workers 1` for a lighter run.
Cover frame: `node scripts/cover.mjs`.

## Add the voiceover (pending)
See [audio/README.md](audio/README.md): save 7 clips → `node scripts/measure_audio.mjs --write` → `node scripts/mix_audio.mjs` → `node scripts/render.mjs --mode 2 --audio audio/voiceover_mix.wav`.

## Checks you can re-run
`node scripts/check_ipa.mjs` (IPA symbols ⊂ Sound Chart) · `node scripts/qa_layout.mjs` (safe-zone / overlap scan, all modes) · `node scripts/export_captions.mjs`.

## Layout of the source
`src/timeline.js` (timing/script/IPA) · `src/man.js` (jointed character: arms, hands, fingers, face) · `src/props.js` · `src/scenes.js` · `src/ui.js` (cards, captions, CTA) · `src/main.js` (player, CC/IPA, audio) · `assets/` (authentic Fluent English logo, bundled OFL fonts).
