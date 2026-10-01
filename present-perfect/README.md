# Present Perfect — Fluent English whole-class lesson (≈ 60 minutes)

A code-drawn 16:9 animated lesson (Canvas 2D, no raster art) for adult A2–B1 learners of American English, designed to be **shared by a teacher on Zoom and practised with the whole class**: short explanations, then choral repetition, drills, quizzes, sorting games, error correction, timed pair work, skits and an exit ticket. Everything is on a real timeline with Play/Pause, scrubber, chapters, captions with American IPA under every word, and narration + music.

**Open `dist/lesson/index.html`** in Chrome, Edge or Safari (keep the `audio/` folder next to it; it also works when hosted on any web server). Share the browser tab in Zoom with *Share tab audio* ticked.

## Status — read this first

| Item | State |
|---|---|
| Animation, teaching graphics, 54 activities, player | Built and tested (see QA) |
| **Narration voice** | **Kokoro v1.0 (open-source, runs locally) is the production voice** — chosen after the 5-minute version. ElevenLabs is optional and was never used (`tools/tts_generate.py --engine eleven` still works if you ever want it). No account or credit is needed. |
| IPA | **Not verified against Oxford Learner's Dictionaries (US)** (the site is unreachable from the build environment) and no Fluent English sound chart was supplied. Converted from CMUdict + 60 hand overrides; every word is listed in `docs/ipa_report.md` for checking. |
| Listening | **Nobody has listened to the narration or music** (the build environment has no audio output). Only objective checks were run (Whisper round-trip, level measurements). Please listen to a few chapters before teaching with it. |
| Length | **59:48** of video. In class it will run longer, because the teacher can pause at every practice round. |

## What is in the hour (13 chapters)

| Chapter | Starts | What happens |
|---|---|---|
| Welcome | 0:00 | agenda, meet Maya / Daniel / Sofia, warm-up questions |
| Past and now | 1:34 | *I lost my keys yesterday* vs *I've lost my keys*; quiz; choral repeat |
| Form | 3:08 | have/has + past participle, contractions, check; have/has drill (10 items); choral; quiz |
| Participles | 6:39 | regular -ed sounds, four groups of irregular verbs, each followed by a say-the-participle drill; 8-question quiz |
| Negatives and questions | 13:17 | short forms, haven't/hasn't, questions, short answers, question words; quiz; **pair work** |
| Experience | 21:55 | ever / never / once / twice / before; ask-the-question drill; quiz; **pair work**; class sharing |
| Result | 30:28 | just / already / yet; skit at the office; quiz; "what's the result?" drill |
| Still true | 34:07 | for vs since sorting game; *how long*; drill; quiz; **pair work** |
| Time periods | 41:21 | today / this week; finished-time words → simple past; skit; present perfect vs simple past quiz |
| Notes | 44:40 | American English (simple past with just/already/yet is normal); *been* vs *gone*; present perfect continuous is *not* covered |
| Mixed practice | 46:00 | find-the-mistake (7), tense sorting game, 10-question quiz show |
| Speaking | 51:14 | café skit, 4-minute role-play, class sharing |
| Review | 57:31 | summary, 4-question exit ticket, speaking invitation, end card |

Minute-by-minute plan, instructions and **answer keys for every activity**: `docs/teacher_guide.md` (generated from the same data as the video).

Pair work is 3–4 minutes each (about 14 minutes in total); class sharing about 2 minutes; the rest is explanation, choral repetition, drills and quizzes. Quiz distractors are unambiguously wrong in context (time words such as *yesterday, last year, ago, in 2019* or *ever, never, already, yet, for, since* decide each item).

## Controls
Play/Pause · Replay · scrubber (ticks = chapters, ★ = start of a practice round) · 13 chapter buttons with start times · **« Activity / Activity »** (also **N / P**) · Voice and Music sliders · Mute · Captions (with IPA) · speed 0.8/1/1.2 · 30/60 fps · full screen · transcript.
**Class pauses**: *At each activity* (default: stops before the first question of each round so you can set it up), *At every question*, or *Off*. While paused, press Play to continue. Click an option/bin on screen (or press 1–4) to show a student's answer; the reveal still follows the narration.
Keys: Space, ←/→ 5 s, [ ] chapter, N P activity, 1–4 answer, C captions, M mute, F full screen, R replay.

## How it is built
```
tools/lesson_hour.py   the whole lesson: 13 chapters of narration + activities (edit this to change the lesson)
tools/lessonlib.py     builders: info, table, choral, say, choose, fix, sort, pair, timer, skit  ->  src/script.json, build/activities.js
src/script_core.json   the five-minute explanation core (title, story, contrast, form, checks, notes, summary)
src/lesson1-3.js       hand-choreographed core scenes     src/lesson4.js  renderers for the activity types
src/chars.js scenes.js gfx.js text.js engine.js player.js   cast rigs, five scenes, graphics, word+IPA layout, timeline renderer, player
tools/tts_generate.py  Kokoro (or ElevenLabs) -> per-line audio -> build/timeline.json     tools/music.py  original music + effects + ducking
tools/ipa_build.py     IPA dictionary + report      tools/build.py  -> dist/lesson (index.html + audio parts)      tools/teacher_guide.py
tools/asr_check.py     Whisper round-trip intelligibility check
```
Rebuild: `python tools/lesson_hour.py && python tools/tts_generate.py && python tools/music.py && node dev/dumpwords.mjs && python tools/ipa_build.py build/words.json && python tools/build.py && python tools/teacher_guide.py` (per-line audio is cached, so only changed lines are re-synthesised; the music render takes a few minutes). Models: Kokoro v1.0 and piper-tts's espeak data are needed locally (not stored in the repo).

## Performance design
* Rendering is a pure function of time `render(t)`, so seeking, chapter jumps and replay are exact. The master clock is elapsed `requestAnimationFrame` time, re-synced to the narration audio when it drifts by more than 80 ms; 30 fps cap by default; nothing runs when paused or when the tab is hidden.
* Backgrounds are drawn once into offscreen canvases; characters are vector paths; adaptive resolution lowers the canvas size if frames run long.
* Audio is 6 narration files + 6 music files (≈ 9 min each, cut at silent gaps between beats, 47 MB in total). The player fetches the current part, prefetches the next and switches on the clock. Opening from `file://` works (audio played directly); hosted, parts are fetched into blob URLs for exact seeking.

## QA that was actually run
* Full-timeline sweep of the built page: 1,795 frames (every 2 s over 59:48), **0 exceptions**, 0 missing IPA entries; average 16.6 ms per frame (forced canvas flush, software-rendered headless Chromium, 1600×900 viewport).
* Every one of the 54 activities was rendered at its start, mid-question, reveal and last reveal and inspected by eye (layout defects found and fixed: overflowing rows, labels over text, hidden heads, bins over characters, tiny sentences).
* Interaction (headless Chromium): option click sets the pick, bin click sets the pick, auto-pause *each activity / every question / off* stop (or do not stop) at the expected times; part switching at 9:22 and 18:37 plays the next narration and music part aligned to the clock (within 0.02 s); works from `file://` and over HTTP; next/previous activity.
* Audio measured: music ≈ 6 dB lower while anyone speaks; long pair-work holds duck the music further and drop the tick sound until the last 10 s.
* ASR round-trip of the generated narration lines with Whisper small.en: Whisper small.en heard 5.7% of words differently (225/3,928; `docs/asr_report.md`). Most differences are isolated one-word drill lines (*eat, see, been* heard as *meat, C, Ben*) and number/hyphen formatting; please listen to the drill lines for *been, eaten, seen, have* to judge them.
* **Not done:** no human listening; no verification against Oxford; no Safari/Firefox/real-GPU test; no test on an actual Zoom call; no MP4 (it was dropped; see git history for the earlier exporter).

## Known limits / judgement calls
* Player chrome (buttons, hints) is ordinary HTML and has no IPA; everything drawn in the lesson canvas does. Page numbers/digits in a timer are not words and have no IPA.
* IPA shows citation forms (e.g. *have* /hæv/); the voice uses natural connected speech. Symbol style (`i`/`u` without length marks) follows the repository's renderer sample data — flip `IPA_STYLE.keepLongIU` in `src/text.js` if the Fluent English chart uses `iː`/`uː`.
* Logo: real `fluent_english_logo_blue.png` on a white plate. Fonts: Lexend, Source Serif 4, Andika, Noto Sans Greek subset (open licences). Music and effects are original (generated by `tools/music.py`).
