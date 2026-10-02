# Fluent English · “Cómo decir tu edad en inglés” (vertical video, ~30 s)

A 1080 × 1920 (9:16) animated lesson built entirely with code: canvas illustration, Web Audio music and
sound effects, and browser speech synthesis for the voices. Nothing is published or scheduled.

```
video/
├─ index.html            ← the preview (open it in Chrome / Edge / Safari; no build, no network)
├─ js/                   ← script+timeline, audio engine, speech, art, player
├─ assets/               ← logo/globe/fonts (embedded into js/assets-data.js)
├─ exports/              ← rendered MP4s, cover, soundtrack (see "Export")
└─ CAPTION.md            ← cover text + suggested caption
tools/
├─ build-assets.mjs      ← re-embeds assets after changing them
├─ export-video.mjs      ← frame-exact MP4 export (Playwright + ffmpeg)
├─ test-sequencing.mjs   ← speech/clock sequencing test (mock voices)
└─ still.mjs             ← render still frames at given times for review
```

## Preview

Open `video/index.html` and press **Start** (the click is what unlocks browser audio and speech).

| Control | What it does |
|---|---|
| Start / Pause / Replay | Replay cancels queued speech and restarts music and clock from 0. Pause freezes picture, music and speech. |
| Mute | Silences music, effects and speech. Timing keeps running from estimated durations. |
| CC | Cycles **Off → Captions → Captions + IPA**. Remembered on the device (`localStorage`). `?cc=0/1/2` in the URL overrides it. |
| Spanish / English voice | Auto picks the best installed voice (prefers es‑MX / es‑US / es‑419 and en‑US, and “Natural/Neural/Online/Premium” voices). Your choice is remembered. ▶ tests a voice. |
| `?clean=1` | Hides the control panel (useful for screen recording). |

**Sync with speech.** Every scene is anchored to nominal times, but the clock *holds* at the marks in
`FE.WAIT_MARKS` until the line being spoken has actually finished, so a slower voice stretches the video a little
instead of cutting lines off. Voices are never queued on top of each other. The learner pause is always exactly
4.0 s with no narration, and the player waits for the Spanish prompt to finish before starting it. If a voice is
missing, or you are muted, those lines run silently on their estimated duration (captions still show). If a browser never
fires `onend`, a watchdog moves on.

## Timeline (nominal)

| Time | Scene | Audio |
|---|---|---|
| 0–4.3 | Birthday scene, 3 + 3 number candles, man smiles. Bubble “I have 33 years.” tagged **INCORRECTO PARA LA EDAD** | ES “¿Dices” · EN “I have thirty‑three years” · ES “para decir tu edad?” — playful marimba “hm?” then a brief musical pause (no buzzer) |
| 4.3–10.2 | Incorrect words are struck out and the sentence collapses into **I’m 33.** (kept on screen ~10 s, longer than the incorrect one’s ~4.5 s). Confetti burst. Chip “I’m = I am · verbo BE” | EN “I’m thirty‑three.” · ES “En inglés, para la edad usamos el verbo” + EN “be” |
| 10.2–15 | A gold satin ribbon extends it to **I’m 33 years old.** + “Tengo 33 años.”; then both shown with ✓ and “Las dos son correctas” | EN “I’m thirty‑three years old.” |
| 15–23.6 | “How old are you?” and “I’m ___ years old.”; then a 4 s silent-ish pause with a quiet ring countdown (4‑3‑2‑1, no ticking) | EN question · ES “Practica con una edad inventada.” · music ducked to ≈ −26 dB for the pause |
| 23.6–30 | Presenter gestures at **I’m 33.** and **I’m 33 years old.** → Fluent English logo, “Escríbenos INGLÉS.”, “Clases en línea” | ES “Pequeños cambios, más confianza.” · ES “Escríbenos ‘inglés’.” · final chord + tiny confetti |

No prices, discounts, testimonials, guarantees or meeting-platform names. “Clases en línea” is the only delivery wording.
Viewers are asked to use an invented age, never their real one, and not to post it.

## Audio

* **Music + SFX** are original Web Audio synthesis: C‑maj7 · Am7 · Fmaj7 · G6/9 loop at 96 BPM, soft kick/rim/shaker,
  marimba arpeggio, warm triangle pad, and an original bell motif (not “Happy Birthday” or any other known tune).
  SFX: bubble pop, “hm?”, pencil strike, correction swish, chime, confetti pops, ribbon, final chord.
* **Mix:** music goes through a ducking gain (≈ −9 dB under narration, ≈ −26 dB during the learner pause), a soft
  compressor and a brick‑wall limiter. Voices come from `speechSynthesis`, which can’t be routed through Web Audio, so
  the page ducks the music around them instead of mixing them.
* **Speech:** English phrases spell the number out (“thirty‑three”). “be” is spoken by the English voice inside the
  Spanish sentence. Voice quality depends entirely on what is installed on the device; don’t expect identical results
  everywhere.

## CC / IPA

* *Captions* show each spoken line (Spanish in white, English in gold italics).
* *Captions + IPA* adds IPA directly under the on‑screen English teaching phrases only — the incorrect bubble, “I’m 33.”,
  “I’m 33 years old.”, “How old are you?”, “I’m ___ years old.” and the two closing examples. No IPA on Spanish text,
  punctuation, or the logo. “33” is transcribed as its spoken form *thirty‑three*.
* Transcriptions use Oxford (American) conventions (ɜːr, flapped t̬, oʊ, ɑːr). **Verification:** I cross‑checked each word
  against CMUdict (`TH ER1 T/D IY2`, `TH R IY1`, `Y IH1 R Z`, `OW1 L D`, `HH AW1`, `AA1 R`, `Y UW1`, `AY1 M`, `HH AE1 V`).
  I did **not** look anything up in Oxford itself — the site wasn’t reachable from the build sandbox — so please spot‑check the
  six strings in `js/script.js` (`FE.IPA`) against Oxford Learner’s Dictionaries (American) before publishing.

## Export (MP4 with burned‑in captions)

```bash
node tools/export-video.mjs                 # → video/exports/  (captions + captions‑and‑IPA versions)
node tools/export-video.mjs --cc off        # also: --cc cc | --cc ipa  (repeatable)
```

Needs Node 20+, Playwright with Chromium, and ffmpeg with libx264/AAC. It renders every frame deterministically
(900 frames @ 30 fps), renders the soundtrack offline with the same engine, and muxes them.

Produced files (`video/exports/`):

| File | |
|---|---|
| `fluent-english-edad-33-subtitulos.mp4` | H.264 1080×1920, 30 fps, 30.0 s, AAC stereo — **captions burned in** |
| `fluent-english-edad-33-subtitulos-ipa.mp4` | same, **captions + IPA burned in** |
| `portada.png` | cover “¿I HAVE 33 YEARS? 🎂” |
| `soundtrack-musica-y-efectos.wav` | the music + SFX bed alone (44.1 kHz stereo) |

A flattened MP4 can’t keep CC/IPA interactive; each file contains exactly one caption mode.

### ⚠️ The MP4s do NOT contain the voices

Speech synthesis is produced by the browser/operating system’s audio stack, not by Web Audio, so neither
`canvas.captureStream()`, `MediaRecorder` nor an offline render can capture it — and a headless server has no voices
to render anyway. The exported audio track is therefore the **music + sound effects bed only** (ducked as if narration were
present, and nearly silent during the 4 s pause).

**Checked in the exported files** (ffprobe / ffmpeg): H.264 + AAC streams both present, 30.0 s; integrated loudness
≈ −21.4 LUFS, peak −3.4 dBFS (no clipping); learner pause 19.4–23.4 s ≈ −56 dB mean vs ≈ −28 dB under narration; SFX/chord
transients visible in the spectrogram at the expected times.

**To get a file with the voices**, record the live preview with system audio:

1. Use Chrome or Edge on a device with good Spanish (es‑MX) and English (en‑US) voices; choose them in the selectors and press ▶ to hear them.
2. Open `video/index.html?clean=1&cc=2` (or `cc=1`) in a window about 9:16 and note the CC mode you want burned in.
3. In OBS Studio: add a *Window Capture* (or *Display Capture*) source and an *Audio Output / Desktop Audio* source; set the canvas to 1080 × 1920 (Settings → Video) and the audio sample rate to 44.1/48 kHz. macOS needs a loopback audio device (e.g. BlackHole) to capture system audio; Windows can use Desktop Audio directly.
4. Start recording, click **Start** on the page, let it play to the end (~30–34 s depending on the voices), stop recording.
5. Play the result back and confirm that both languages are audible and the music dips under them. Then trim to the first frame and export MP4.

Chrome’s “share this tab with audio” screen‑capture option can work too, but whether it includes OS speech voices depends on
the browser, OS and voice, so verify by listening before relying on it.

## Checks performed

* **Sequencing test** (`node tools/test-sequencing.mjs`, mock voices at 1.0× and 1.6× speed): all 11 voice segments play in the
  right order; zero overlapping speech requests; learner pause 4.0 s ±0.05 with no speech inside it; total 30.1 s with typical
  voices, ≈ 34 s with slow voices (clock holds for them). **Not tested with real system voices** — the build sandbox has none, so
  naturalness, pronunciation of “be” and the number words are for you to judge on your device.
* **Art / anatomy** (reviewed frame by frame at 1080 × 1920): five‑fingered hands; shoulder → elbow → wrist rig with elbow flexion
  ≤ ~135° and the upper arm kept near the torso (no folded‑flat forearms, no flared “chicken‑wing” elbows); relaxed palm‑up gestures.
  Candles read as “3” and “3”.
* **Text:** spelling and punctuation match the brief (“¿Dices ‘I have 33 years’ para decir tu edad?”, “Tengo 33 años.”,
  “Escríbenos INGLÉS.”). “I have 33 years.” is tagged *incorrect for age* only; the video never says that other uses
  such as “33 years of experience” are wrong.
* **Safe areas:** key text sits between y ≈ 250 and 1000; captions end above y ≈ 1540; side margins ≥ 72 px.
