# Fluent English — Be: Yes/No Questions (A1, 60 minutes)

A complete, teacher-led, interactive grammar lesson for adult Spanish-speaking beginners.
It is **one self-contained HTML file** (no server, no API keys, no audio files, no microphone):

```
lesson/fluent-english-be-yes-no-questions.html
```

## Launch

1. Open the file in Chrome, Edge or Safari (double-click it or drag it into a browser tab).
2. In your online class, share that **tab** (and tab audio, if you want learners to hear the voices and music).
3. Press **Start Lesson** — this unlocks browser audio. If you refreshed earlier, you can **Resume** instead.
4. Use the dock at the bottom: Previous · Play/Pause · Replay Example · Reveal/Hide Answer · Next · +30 s · +1 min · Skip Timer · Chapters · Support On/Off · Reset · Hide controls.
   Keyboard: Space play/pause, ←/→ steps, R reveal, E replay, S Spanish Help, C CC/IPA, M chapters, F fullscreen, H hide controls, A–D answer in the ten-question check.

Rebuild after editing anything in `lesson/src/`: `node lesson/build.js`.
Run the browser tests: `NODE_PATH=<dir with playwright-core> CHROMIUM=<chromium binary> node lesson/tests/e2e.js`.

## What is in it (default timers total exactly 60:00)

| # | Section | Time | Timer |
|---|---|---|---|
| 1 | A question changes the conversation | 00:00–05:00 | 5:00 |
| 2 | Build the question | 05:00–13:00 | 8:00 |
| 3 | Yes, with a complete short answer | 13:00–20:00 | 7:00 |
| 4 | No, with the right negative | 20:00–27:00 | 7:00 |
| 5 | Who is answering? | 27:00–34:00 | 7:00 |
| 6 | Ask about the scene | 34:00–42:00 | 8:00 |
| 7 | Speaking lab: ask, answer, check | 42:00–49:00 | 7:00 |
| 8 | Ten-question check | 49:00–56:00 | 7:00 |
| 9 | Independent exit | 56:00–60:00 | 4:00 |

65 steps in all: animated statement→question morphs, seven pattern bubbles, six click-to-order challenges, short-answer pictures, a "who is you / who is I" viewpoint animation, six perspective challenges (including the context-specific *we* with the answerer inside/outside the circle), four labelled scenes, three speaking rounds with decreasing support, exactly ten A–D items with retry, an independent exit with a teacher checklist, an animated recap with a warm final chord, and an optional two-minute after-class task (outside the timer).

**Pause, extend, skip and revisit change the real class length.** Section timers only run while the lesson is playing. The clock (click it) shows planned vs projected time, paused time and the likely end time. Each section has its own timer, so revisiting a section adds real time.

## Teacher tools
Start, Play/Pause (also pauses speech, animation, music and timers), Replay Example (clears queued speech), Previous/Next, chapter menu, Reveal/Hide Answer, Spanish Help (shown on demand; Spanish is spoken only when you press its button), 3-mode CC/IPA (Off · Captions · Captions + IPA), voice pickers, speaking rate, separate speech/music/effects volume, fullscreen, reduced motion (follows your device or force on/off), Extend +30 s / +1 min, Skip Timer, Reset (with confirmation), Support On/Off, vocabulary labels, IPA key.

## Results and export
Settings, progress, scores and notes are saved in this browser only (`localStorage`) with a resume choice after refresh. **Results** shows activities visited, the ten-question scores, the anonymous speaking-lab checklist, the class-level exit checklist and optional anonymous notes. **Download JSON / CSV** are explicit buttons; nothing is uploaded or emailed. A shared teacher-entered score is labelled **"class activity score"**; the individual mode is labelled as this copy on this device. First-attempt and retry scores are stored separately.

## IPA
IPA is written beneath every English teaching word in *Captions + IPA* mode, using the symbols of the Fluent English **Sound Chart** (the Oxford Learner's American English symbol set, e.g. `əʊ`, `ɑːr`, `ɔːr`, `ɜːr`, `er`, `ʒ`, `tʃ`, `dʒ`), with an **IPA key** in Settings.
**The IPA was written by hand in Oxford style. No live Oxford lookup was made** — the Oxford site was blocked from the build environment — so spot-check any entry you are unsure of. Sentence IPA is assembled word by word from those entries (never presented as an Oxford full-sentence transcription). Names are not Oxford headwords. The final unstressed "y" (ready, happy) uses `i`, as Oxford does.

## Tests actually run
`lesson/tests/e2e.js` (headless Chromium, 80 checks, all passing at the last run) covers: section minutes and time ranges, the exact 3600 s total, pacing guide sums, ten items with four distinct options, the ten required correct answers, balanced answer positions, no competing acceptable negatives; Start/audio unlock, countdown, pause stopping the timer, extend ±, skip, previous/next, chapter jump, reveal/hide; CC modes, IPA placement, Spanish Help, reduced motion, hide controls; the order-the-words feedback; the whole assessment flow (answers hidden before submit, keyboard A–D, score 7/10, retry 2/3, separate storage, labels, JSON and CSV downloads); refresh/resume, reset confirmation; pause/resume/replay of narration; every one of the 65 steps builds with every level revealed and **no English word lacking IPA**; all ten effects schedule; no page errors.
I also reviewed screenshots of the sections by eye.

## Known limitations
* **Voices are your device's own speech synthesis.** Quality and accent vary; an American (en-US) voice is preferred when present, otherwise another English voice is used and Settings says so. With no voices at all the lesson runs on captions and timed pauses. Yes/no intonation is only modelled with punctuation and pitch; the app does not measure pronunciation or hear learners.
* Headless tests cannot judge how the voices, music and effects *sound*. Web Audio is built to layer, duck under speech, go silent in learner response and assessment steps, and pass through a limiter, but please listen once before class.
* Tested in Chromium only (not Firefox/Safari, not touch devices). Layout is a scaled 16:9 stage designed for a shared laptop screen.
* Characters, rooms and props are original SVG drawings with joint-based arms and five-digit hands; I checked them in screenshots, not with a professional art review.
* No video export is included (a flattened video would lose buttons, branching and assessment, and browser speech is not captured in canvas recordings).
* Participation and checklist counters are teacher-entered; nothing identifies individual learners.
