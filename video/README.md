# Fluent English — “I'll have two tacos, please.” (9:16 short)

A ~31-second vertical animated lesson for Spanish-speaking adults in Mexico. Everything is code: canvas illustration,
Web Audio music and effects, and browser speech synthesis for the live preview. Nothing is published or scheduled.

## Open the preview

Open `index.html` in Chrome, Edge or Safari (double-click works; or `npx http-server video`).
Press **Start** — that unlocks browser audio. Controls: Start, Pause/Resume, Replay, Mute, Spanish and English voice
pickers (with Test buttons), and the **CC** control (Off / Captions / Captions + IPA; remembered between visits).

* Scene changes follow the *actual end* of each spoken line (`onend`), so slow or fast voices stay in sync.
* The learner's four-second pause is a fixed 4.0 s with the music faded to almost nothing and no ticking.
* Replay/Stop cancel the speech queue and rebuild the audio graph, so voices never overlap.
* If a device has no voices, the video still plays with music/effects and estimated timing (a notice is shown).
* Voice quality depends on the device. Natural/neural voices (Edge “Online (Natural)”, Chrome with Google voices,
  macOS/iOS enhanced voices) sound best. Voices are auto-ranked es-MX > es-US > other Spanish, en-US first.

## Deliverables in `export/`

| File | What it is |
|---|---|
| `fluent-english-tacos_captions-ipa.mp4` | 1080×1920, 30 fps, H.264 + AAC, captions + IPA burned in |
| `fluent-english-tacos_captions.mp4` | captions only |
| `fluent-english-tacos_cc-off.mp4` | no captions, no IPA (the phrase card itself is always shown) |
| `cover.png` | cover frame — “PIDE COMIDA EN INGLÉS” + a vector taco |
| `schedule.json` | the exact timeline used for the render |
| `voices/*.wav` | the voice clips used in the MP4 (replaceable, see below) |
| `suggested-caption.txt` | the post caption |

Re-create them with `npm run export` (needs `ffmpeg`, Playwright Chromium, and `espeak-ng` + `mbrola-us2` for the
fallback voices): `NODE_PATH=$(npm root -g) node tools/export.mjs [--cc=2,1,0] [--no-voice]`.

### Important: voices in the MP4 vs. in the preview

Browser `speechSynthesis` plays through the OS and **cannot be captured by a canvas/MediaRecorder export**, and the
sandbox used to build this had no browser voices, no internet access to commercial TTS and no keys. So:

* The **preview** uses your device's real speech voices (as requested).
* The **MP4** voice track is made from offline clips (`espeak-ng`; MBROLA US male for English, Latin-American Spanish
  for narration). They are intelligible and perfectly timed but **clearly synthetic — not human-quality**.
  The music, effects, ducking and silence are real and were measured (below).
* To get a better MP4: drop your own recordings (or clips from any TTS you license) into `export/voices/` using the
  same names — `hook.wav`, `phrase.wav`, `intro.wav`, `introEn.wav`, `morph.wav`, `turn.wav`, `reveal.wav`, `cta.wav` —
  and run the export again. Timing, ducking and captions re-fit to the new clip lengths automatically.

### Recording the preview with the device's own voices

1. Pick the voices in the preview, choose the CC mode you want, make sure nothing else is making sound.
2. Use a screen recorder that captures **system/internal audio** (OBS “Window/Display + Desktop Audio”, macOS 14+ /
   iOS/Android screen recording with device audio, or Edge/Chrome tab-audio capture). Set the browser window to 9:16
   (e.g. DevTools device mode 1080×1920) and hide the control panel (browser zoom or full-screen the canvas).
3. Press **Start**, record until the final card, then trim to ~31 s. Do not use the microphone as the audio source.

## Teaching content check

* Target: **“I'll have two tacos, please.”** presented as *a useful ordering expression*; the video never says other
  forms are wrong (“Can I have…?” / “I'd like…” are not mentioned). The Spanish gloss is **“Voy a pedir…”**, never “tendré”.
* Pattern slide: *I'll have* stays fixed, the middle chunk changes (tacos → sandwich → lemonade).
* “a lemonade” is presented as one serving in an ordering context; no general rule about uncountable nouns is taught.
* The viewer practices as themselves: no roles, no roleplay. No prices, discounts, testimonials, guarantees or meeting platform.

### IPA — read this

IPA is American English, Oxford-style (OALD US citation forms), **entered by hand and NOT looked up live**:
the sandbox could not reach oxfordlearnersdictionaries.com (HTTP 403 through the proxy), so no Oxford lookup was
performed and none is claimed. Please confirm against OALD before publishing:

| Chunk | IPA shown | Notes |
|---|---|---|
| I'll have | /aɪl hæv/ | strong form of *have* (main verb of the order); the weak form /həv/ is also natural |
| two tacos, | /tuː ˈtɑːkoʊz/ | |
| a sandwich, | /ə ˈsænwɪtʃ/ | /ˈsænwɪdʒ/ also occurs |
| a lemonade, | /ə ˌleməˈneɪd/ | |
| please. | /pliːz/ | |

IPA appears only under the English teaching chunks (never under Spanish text, punctuation or the logo).
Glyphs use the bundled Charis SIL font (OFL) so ɑ ɪ ʊ ə ʃ ː ˈ ˌ render on every device.

## Layout of this folder

```
index.html            preview page (controls)
src/config.js         script, beat timings, IPA, captions, SFX/duck cues  ← edit the lesson here
src/audio.js          original music + effects (Web Audio; also used offline)
src/speech.js         speechSynthesis wrapper (async voices, ranking, cancel)
src/art.js            café, character, hands, food (canvas paths)
src/scenes.js         scene composition, captions, phrase card, transitions
src/player.js         live engine + UI
src/export-api.js     hooks for the exporter
tools/export.mjs      MP4 exporter;  tools/preview-test.mjs  headless smoke test
assets/               fonts (OFL: Fredoka, Nunito, Charis SIL) and logo crops from fluent_english_logo_blue.png
```

## QA performed (see bottom of this file for numbers)

* Timeline: all beats in order; the silent window is exactly 4.00 s in both the live engine (mocked voices, 4.02 s
  measured at frame granularity) and the MP4 schedule.
* Audio on the final MP4: speech present in every speech beat (mean ≈ −17…−22 dB), the learner's pause measures
  ≈ −57 dB mean (music nearly silent, no ticking), mix peak ≈ −1 dB (no clipping).
* Anatomy: five fingers per hand, thumbs on the medial side, elbows kept close to the ribs, forearms resting on the
  counter; no raised/waving hands; frames inspected across the whole timeline.
* Live preview tested headlessly with a mocked speech engine: start, pause/resume, replay, mute, CC persistence,
  speech-completion sync, no console errors. **Not tested here:** real browser voices on a real device.
