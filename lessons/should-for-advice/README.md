# Should for Advice — Fluent English interactive class (60:00 planned)

A complete, code-built, animated 16:9 class for **adult learners**, designed for a teacher who shares a computer screen on Zoom.
Everything (art, characters, animation, IPA, narration audio, sound effects, interactions) is inside **one self-contained HTML file**:

```
lessons/should-for-advice/dist/should-for-advice.html      ← open this (≈8 MB, no internet needed)
```

## Opening it (60 seconds)

1. Double-click `dist/should-for-advice.html` (Chrome or Edge recommended; Firefox/Safari should work but were not tested).
2. The opening card shows the exact title **Should for Advice**, the supplied Fluent English logo, and the two modes (below).
   The controls bar is visible on this card so you can see it. The arrow points to the controls.
3. Choose **Class mode** or **Demo mode**, then click **Start the lesson** (this click is also what lets the browser play sound).
4. **Zoom:** *Share Screen → the browser window (or tab)* and tick **Share sound** (or “Share computer audio”) so learners hear the narration. Press **F** for full screen first.

### Hide / show the controls (important)

* After you press **Start**, the bottom bar is **hidden by default** and its space is **returned to the lesson** (the 16:9 picture simply gets larger — nothing is cropped or stretched; if the window is not 16:9 you get quiet black letterbox bands).
* A small round **Show controls** button stays in the bottom-right corner (48 px, keyboard-focusable). **Press `H`** at any time to toggle the bar (H is ignored while you type in a text field).
* Hiding the bar never pauses, restarts or interrupts narration, animation, timers or activities. The visibility state is kept across chapter changes, window resizing and full screen.
* While the bar is hidden, everything learners need stays **inside the lesson scene**: instructions, answer choices, the activity countdown (with pause, +1:00, hint and show-answer buttons), and the CLASS-mode “Continue” banner.

### Captions and pronunciation switches
* **CC** shows the narrator's current sentence as on-screen captions (off by default).
* **IPA** shows or hides the pronunciation line under every word (on by default; the lesson is designed with IPA on).
* Both live in the control bar and also in the bottom-left corner while the bar is hidden. Shortcuts: `C` and `I`.

### Keyboard shortcuts
`H` hide/show bar · `C` captions · `I` IPA · `Space` play/pause · `←` / `→` back/forward 5 s · `N` / `P` next/previous chapter · `R` replay current example · `F` full screen · `Esc` close panels.

## Two modes (explained on the opening card)

| | **CLASS mode** | **DEMO mode** |
|---|---|---|
| Story/explanation segments | play automatically | play automatically |
| Activities | run their countdown, then **hold at a gate** until you press *Continue* (you can also *Show answer* or add *More time*) | follow the fixed plan; model answers appear at the planned moment |
| Best for | live teaching | rehearsal, self-running demonstration |

The **60:00** is the *planned* lesson clock (top-right of the screen). Next to it, **class time** shows the real elapsed time. They differ when you pause, replay, add time, or stay at a CLASS-mode gate — the lesson never claims that an open-ended classroom will last exactly one hour.

## What learners do
Learners answer **aloud, in pairs, or in Zoom chat**. You click for them. The lesson does **not** listen to speech, read Zoom chat or score anyone. Closed tasks (match, build, choose, repair, short answer) are genuinely validated; open tasks show *possible* answers only when you reveal them, and the optional **form checker** (typed learner sentence) checks *form only* (should/shouldn’t + base verb, no *to*, no *-s*, no *do/does/did*) and says so.

## Plan (planned time)
| Chapter | Window | Content |
|---|---|---|
| 1 The problem: what should I do? | 00:00–05:00 | Maya’s three problems, learners suggest ideas, goal |
| 2 Discover the meaning of advice | 05:00–13:00 | Three scenes (coworking, station, apartment), advice vs rule, many good answers, *should* as expectation |
| 3 Build affirmative and negative forms | 13:00–21:00 | Word-over-IPA pattern builder, extra words vanish, *be*, matching, *shouldn’t*, build-the-sentence |
| 4 Ask for advice and practice pronunciation | 21:00–29:00 | Questions, question words, café conversation, short answers, sound of *should*, listen–repeat, *I think you should…* |
| 5 Guided practice and common mistakes | 29:00–39:00 | Nine interactions incl. five genuine learner-error repairs |
| 6 Interactive adult advice mission | 39:00–54:00 | 3 scenarios, priorities (3 min), pair rounds (5), new information & revised advice (4), share & compare (3) |
| 7 Review, roleplay feedback, and exit check | 54:00–60:00 | Connected summary, feedback checklist, 3-part exit check, conclusion |

Full timing map: `docs/CHAPTER_TIMING.md`. Full narration and dialogue script: `docs/NARRATION_SCRIPT.md`. Quality-control report: `docs/QC_REPORT.md`.

## Narration voices (what they are)
Locally synthesized with **Kokoro-82M** (model/voices declare Apache-2.0; the `kokoro-onnx` 0.6.1 wrapper is MIT; the phoneme tools have their own, separate licences — see `docs/MEDIA_PROVENANCE.md`; no commercial clearance is claimed). Free, runs offline on CPU, no API key. Narrator: `af_heart`; dialogue voices: Maya `af_bella`, Daniel `am_michael`, Priya `af_sarah`, Marcus `am_eric`, Hana `af_sky`, Theo `am_liam`. They are good neural voices, not human recordings; the QC report explains how they were chosen and what could not be verified. Every line is a separate replaceable MP3 (`narration/clips/<id>.mp3`, listed in `narration/script.json`).

## Rebuilding / editing (optional)
Source is plain JavaScript/CSS in `src/`. No bundler is needed:
```
cd lessons/should-for-advice
node tools/extract-words.mjs && python3 tools/gen-lexicon.py   # IPA lexicon (needs: pip install cmudict)
node tools/build.mjs --no-clips && node tools/export-script.mjs  # build + list narration clips
python3 tools/gen-narration.py /path/to/kokoro-model            # needs: pip install kokoro-onnx soundfile numpy; ffmpeg
node tools/build.mjs                                            # final single HTML (embeds fonts, logo, IPA, audio)
cd tools && npm i && cd .. && node tools/qa-controls.mjs        # behavioural tests (playwright-core + Chromium)
```
**Where the heavy work happens:** only *building* (voice synthesis ≈ 5 minutes of CPU, done once in a cloud container, not on your computer). *Playing* the lesson is light: a few SVG elements animate with `requestAnimationFrame`, and the render loop stops while paused.
