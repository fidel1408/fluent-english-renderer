# Love: Connection, Trust, and Relationships — Fluent English Speaking Club

A 60-minute interactive discussion show for adult learners (American English). The teacher shares the screen on Zoom and
operates it while students speak. It is a separate lesson in `lessons/love-speaking-club/`; nothing else in this repository was changed.

## Launch

1. Open `lessons/love-speaking-club/index.html` in Chrome, Edge or Safari (double-click works; no server, no network, no install).
2. Click **Start the show** (this is what allows sound to start). Share the browser window (or the tab) in Zoom.
3. **F** = full screen, **H** = hide/show the bottom controls, **→ / ←** next / back, **R** replay, **P** pause, **M** music.

Optional local server instead of double-click: `cd lessons/love-speaking-club && python3 -m http.server 8000` and open http://localhost:8000.

## What you get

| # | Chapter | Min | Speaking | Interaction pattern |
|---|---|---|---|---|
| 1 | Cinematic opening | 1 | 0 | four wordless scenes (remembering, supporting, laughing, listening) → "What makes a connection worth keeping?" |
| 2 | Choose Your Side | 5 | 4 | two sides + It depends + Pass markers, then a surprise twist question |
| 3 | Words That Change the Conversation | 6 | 4 | one word at a time: scene → meaning check → open question |
| 4 | The Missing Piece | 8 | 6 | split-screen mystery, three teacher-clicked reveals, first vs final interpretation |
| 5 | Defend It, Then Challenge It | 8 | 6 | opinion scale (before/after markers), three rounds per statement |
| 6 | Build Your Relationship Priorities | 7 | 5 | ten tokens in four jars (buttons or drag), negotiation, six-month change, redistribution, compare |
| 7 | What Would Change Your Mind? | 8 | 6 | three case files with four evidence buttons and reconsider counters |
| 8 | Would You Rather? With a Twist | 7 | 5 | two illustrated doors, follow-up, optional twist (pair 4 is labeled an imaginative hypothetical) |
| 9 | Make Your Case | 7 | 5 | draw a quality → claim → follow-up → response with a target expression; anonymous speaking-goal record |
| 10 | Final Takeaway | 3 | 2 | choose a sentence, final response with two target expressions + a question, teacher checklist, "Keep Speaking. Keep Growing." |

Total 60 planned minutes, 43 planned student-speaking minutes. **These are classroom targets. The app never measures speaking time.**
**There is no roleplay anywhere.** Alex, Maya and the other fictional adults only appear in short animated cases that students observe and discuss.

## Teacher controls

Bottom bar: Back, Pause/Play (freezes narration *and* scene motion), Replay, Next, Chapters (full 60-minute plan, jump to any chapter, typed teacher notes),
Timer (optional, never advances anything), Words (word bank + the Sound Chart), Starters (sentence starters), Sound (recorded voice / teacher reads / narration off,
volume, optional original quiet music, reduce motion), Mode (Class / Demo), Full screen, Hide controls.

* **Hide controls** removes the bar from the layout so the lesson genuinely grows; a small button stays in the bottom-right corner. Choices, tokens, timers, reveals and audio are untouched.
* **Class Mode**: every reveal and every step waits for your click. **Demo Mode**: a labeled *Demo sample* chip (top right) opens a sample answer on request; an optional autoplay moves on only after the adjustable demo timer.
* Progress, choices, notes and the hidden-controls state are saved in this browser (`localStorage`) and survive navigation, fullscreen and reload. Clear with `?fresh=1` in the address.
* Participation records (chapter 9) are anonymous, teacher-entered, stored only in this browser, and can be exported as JSON or CSV. There is no ranking.

## Honest limits

* The app **does not listen** to Zoom participants, transcribe, or assess pronunciation. Every branch and piece of feedback is pre-written or teacher-selected.
* Voice naturalness could **not be judged by ear** in the build environment — see `docs/VOICES.md` before class and audition the clips.
* IPA is generated from CMUdict with the Fluent English Sound Chart symbols; it is **not** copied from or checked word by word against Oxford (blocked in the build environment) — see `docs/IPA-METHOD.md`.
* No MP4 is delivered. Live choices cannot survive as video.

## Files

`index.html` · `css/` · `js/` (art, rig, scenes, content, engine, chapters, IPA data) · `audio/` (38 narration clips + manifest) · `assets/` (Fluent English logos, sound chart) ·
`docs/` (VOICES, IPA-METHOD, TESTING-REPORT, TEACHER-NARRATION-SCRIPT, ipa-review.csv, screenshots) · `tools/` (build scripts and the acceptance test).

## Rebuild / test

`node tools/test-acceptance.mjs` (needs Playwright + Chromium) runs 44 checks. `node tools/collect-words.mjs && node tools/build-ipa.mjs` regenerates the IPA after editing text.
`node tools/dump-narration.mjs && python tools/gen-audio.py --model-dir <dir>` regenerates the voices (see the script header).

## Credits and licenses

Artwork: original, drawn in code. Fonts: Source Sans 3, Source Serif 4, Charis SIL (SIL Open Font License; copies in `assets/fonts-src`). Voices: Kokoro-82M (Apache-2.0), run locally, no paid service.
Pronunciation data: CMUdict (BSD-style). Logo: the authentic Fluent English logo supplied in the repository, cropped and resized only.
