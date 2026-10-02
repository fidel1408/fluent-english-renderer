# Fluent English — “Actually” vs “Currently” (30 s vertical video)

Open `index.html` in Chrome, Edge or Safari (no server, API keys or uploaded audio needed) and press **Start**.
Everything is generated in code: canvas animation (1080×1920, 9:16), browser speech synthesis, and a Web Audio music bed + effects.

* Rebuild after editing `src/`: `node build.mjs` (inlines the JS, CSS and logo into `index.html`).
* Controls: Start, Pause/Resume, Replay, Mute, Spanish and English voice selectors, and a **CC** button that cycles
  Off → Captions → Captions + IPA (remembered in `localStorage`).
* Voices: Spanish prefers es‑MX → es‑US → any Spanish; English prefers en‑US (male‑sounding voices favoured for the on‑screen man).
  English words inside Spanish narration (“Actually”, “currently”, “Fluent English”) are spoken by the English voice.
  Voice quality differs a lot between devices; do not expect every device to sound equally natural.
* Timing: scene changes follow speech completion, so the real length is ~30–33 s depending on the voices. The learner’s pause is a fixed
  4.0 s with no speech and the music ducked to near silence; no ticking.

## Export — what is and is not captured
* **Exportar video (música + efectos)** records the canvas + Web Audio mix with `MediaRecorder` (MP4 where supported, else WebM). It uses estimated
  speech timings and **does not contain the voices**: browser speech synthesis cannot be captured from a canvas or from Web Audio.
  Verified in headless Chromium: 1080×1920 VP9 + Opus, ~31 s, continuous music, quiet (≈ −40 dB) during the 4 s pause, peak ≈ −2.3 dBFS, burned‑in captions/IPA as selected.
* **Grabar con voces** uses tab capture (`getDisplayMedia`, cropped to the canvas where `CropTarget` exists). Choose “This tab” and tick “Share tab audio”.
  This path could not be tested in the headless build environment — treat it as best‑effort — or screen‑record the device with system audio.
* The CC/IPA mode is burned into the picture at export time; it is not interactive in the MP4/WebM.

## IPA
Transcriptions follow General American in Oxford‑style notation (e.g. actually /ˈæktʃuəli/, currently /ˈkɜːrəntli/, prefer /prɪˈfɜːr/, studying /ˈstʌdiɪŋ/,
learning /ˈlɜːrnɪŋ/, English /ˈɪŋɡlɪʃ/). They were **not checked against Oxford’s website** (it was unreachable from the build environment) — please verify before publishing.

## Checks in `tools/`
`frames.mjs` (render any moment), `verify.mjs` (full run + export), `speechmock.mjs` (real speech code path against a fake `speechSynthesis`:
sequential phrases, clean cancel on Replay, 4 s silent gap).
