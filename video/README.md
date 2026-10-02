# Fluent English — “Pide tu café en inglés” (30 s, 9:16)

Everything here is code: a deterministic canvas animation (`src/`), procedural Web Audio (`src/audio.js`), a browser preview (`index.html`), and an exporter that renders the real frames + audio to MP4 (`tools/`). The only supplied asset is the authentic Fluent English logo (`assets/fluent_english_logo_blue.png`, copied unmodified from the repo root).

**Deliverables for approval** (nothing has been published, scheduled or sent):

| File | What it is |
|---|---|
| `out/pide-tu-cafe-en-ingles.mp4` | Exported video, 1080×1920, 30 fps, H.264 + AAC, 30.000 s, burned-in **Captions + IPA** |
| `out/cover-pide-tu-cafe-en-ingles.png` | Cover “PIDE TU CAFÉ EN INGLÉS” (1080×1920) |
| `docs/caption.txt` | The caption, verbatim |
| `docs/narration-script.md` | Timed narration script + scene map |
| `docs/audio-cue-sheet.md` | Timestamped voice / SFX / music / ducking cue sheet |
| `docs/quality-report.md` | Checks actually run, results, and what is still pending |
| `index.html` | Browser **preview** (not a video) — open it directly or via any static server |

## Browser preview

Open `video/index.html` in Chrome/Edge/Safari and press **Start** (audio is gated behind that click). Controls: Pause/Resume (space), Replay, **CC button — Off / Captions / Captions + IPA** (remembered in `localStorage`), and a *Mixer & voices* panel with separate Voice / Music / Ambience / Effects levels, Spanish and English voice pickers, and voice speed.

The preview speaks with **your device’s own voices** (`speechSynthesis`), ranking `es-MX` first for Spanish and `en-US` for English, preferring local (non-online) voices. If a chosen voice is marked “online”, your browser may send text to its own speech service — we add nothing external. Voice duration varies by voice; the MP4’s timing is the verified one.

Semantics of the CC button: **Off** hides the narration subtitles and all IPA; **Captions** shows subtitles; **Captions + IPA** also shows IPA under the featured English phrases. The storyboard’s designed on-screen text (headline, phrase card, drink cards, “TU TURNO”, CTA) is always shown.

## Rebuild / export

Requirements: Node 20+, `playwright` with Chromium (set `CHROMIUM=/path/to/chrome` if needed), `ffmpeg`/`ffprobe`, `flite` (voice `rms`), `espeak-ng`, Python 3 + numpy (verification only).

```bash
cd video
npm install            # installs playwright (or use a global one)
npm run voices         # local TTS -> build/voices/*.wav, build/voices.json, src/voices-data.js
npm run audio          # procedural stems (OfflineAudioContext) + narration stem
npm run docs           # regenerate narration script + cue sheet
node tools/export.js --mode 2     # --mode 0 Off | 1 Captions | 2 Captions + IPA  (burned in; controls hidden)
npm run cover
npm run verify         # audio numbers, per-frame pose audit, preview behaviour test
```

### Honest limits of export
* **Browsers cannot capture `speechSynthesis` output** (it is not routed through Web Audio or MediaRecorder), so a purely in-browser recording cannot include the system voices. That is why the MP4 narration is generated with local command-line engines instead.
* The MP4 voices are **flite `rms`** (male US English) and **eSpeak NG `es-419`** (Latin American Spanish). They are intelligible but synthetic; they are not human-quality. To get nicer system voices in the MP4, replace the two `sh(...)` calls in `tools/gen-voices.js` with a better local engine available on your machine (for example macOS `say -v Paulina` / `say -v Aaron`, **not implemented or tested here**) and re-run `npm run all`.
* No external voice service, paid API, account or key is used anywhere.
