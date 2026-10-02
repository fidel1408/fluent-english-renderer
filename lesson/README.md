# Fluent English — Subject Pronouns and Be (A1)

A teacher-led, 60-minute interactive lesson for adult Spanish-speaking beginners. One self-contained file:

**`lesson/fluent-english-be-lesson.html`** (≈505 KB, no network, no API keys, no uploads)

## Launch

1. Open the file in a current desktop browser (Chrome or Edge recommended for the widest choice of speech voices).
2. Share your browser tab/window in your online class.
3. Click **Start Lesson** (this unlocks audio). Use **Teacher guide** on the start screen for the controls.

Or serve it locally: `npx http-server lesson -p 8080` and open `http://localhost:8080/fluent-english-be-lesson.html`.

## What is in it

Nine activities with default timers of 5 · 7 · 8 · 6 · 7 · 8 · 7 · 8 · 4 minutes = **exactly 60:00** (100 teacher-paced steps):
warm-up + 3-item ungraded diagnostic · pronouns (six challenges + 1-minute recall) · am/is/are (3 families, 7 word-joining examples, age and feelings, 6 click-to-build, word-bank round) · contractions · negatives (4 true/false corrections, 2 learner sentences) · questions and short answers · speaking lab (12 items, 3 rounds, starters, Extra Challenge, participation checklist) · ten-question check (A–D, hidden answers, explanation + speaking extension, review, retry, first-attempt and retry kept separate) · exit speaking, teacher checklist, recap, optional 2-minute after-class task (not in the timer).
Planned collective learner-speaking time is **35.0 minutes** (shown per screen and in the Teacher guide; it is whole-class practice time, not per-learner).

Teacher controls: Start, Play/Pause, Replay, Step ◀▶, Activity ⏮⏭, Chapter menu, +30 s / +1 min / Skip timer, Reveal/Hide answer, Español, CC/IPA (Off · Captions · Captions + IPA), voice choice + preview, speaking rate, separate speech/music/effects volume, mute narration, fullscreen, reduced motion, results, reset with confirmation. Keyboard: Space, ← →, Shift+← →, R, A, S, C, M, F, H.

**Timers change the real class length.** Extending, pausing, skipping and revisiting are your decisions; the header shows "plan 60:00 → now …". The lesson never advances by itself when a timer reaches zero.

## Data and privacy

Progress, settings, scores and checklists are saved only in this browser (`localStorage`) — no names or emails. A refresh offers **Resume**. JSON/CSV export happens only when you press a download button. On a shared screen the check is a **class activity score** (teacher-entered class answers), not individual mastery; "Individual mode" is for someone using their own copy and is labeled differently.

## Rebuilding from source

```
node lesson/build/make-assets.js   # (optional) re-derive embedded logo images from fluent_english_logo.png
node lesson/build/build.js         # bundles lesson/src/* into the single HTML file
```
Source: `lesson/src/` (`art.js` vector people/scenes, `audio.js` Web Audio + speech, `core.js`, `ui.js`, `content-*.js`, `ipa*.js`, `style.css`). The Fluent English logo is the supplied `fluent_english_logo*.png`, downscaled.

## Tests actually run (Chromium via Playwright, `lesson/build/test*.js`)

- `test.js` — 65 checks: timers total 60:00; 2100 s planned speaking; 10 items × 4 distinct options with the specified keys; AudioContext only after Start; opening-theme level; timer runs / stops on pause; +30 s / +1 min / skip; no auto-advance; navigation, chapter menu, keyboard; revisit keeps time; reveal/hide; Spanish panel; CC/IPA cycle; click-to-build feedback; full ten-question flow with 8/10 first attempt, retry 2/2 kept separate, shared vs individual labels; checklist; JSON + CSV download; resume after reload; reset confirmation. **65 passed, 0 failed.**
- `test-speech.js` — a mock `speechSynthesis`: narration order, no overlapping voices, nothing spoken while paused, resume, old lines not spoken after navigating, Spanish only on request, mute still shows captions. **14 passed.**
- `test-audio.js` — measured Web Audio levels: peaks ≤ 0.11 (no clipping), ambient ducks ≈12 dB under speech and ≈ −35 dB in quiet mode.
- Chart check: the dictionary contains no symbol outside the chart (test.js), and the Sound chart panel loads.
- `probe.js` — visits all 100 steps: 0 console/page errors, 0 words missing from the IPA dictionary.
- Screenshots reviewed at 1280×760, 1366×768 and 1920×1080, including IPA mode.

## Limitations — please read

- **IPA follows your Fluent English sound chart, but is not Oxford-checked.** Oxford lookup was unreachable from the build environment. Every entry (`build/ipa-words.txt`, ~350 words) was typed by hand using only the 36 symbols on your `Sound_Chart.mp4` (plus stress marks ˈ ˌ), e.g. the sailboat vowel is written **əʊ**, as on the chart. `ɪr` and `ʊr` (here, you’re) are not separate chart cells; they are ɪ/ʊ + r, like the chart’s `er`. Sentence lines are *assembled word by word from citation forms* (small words are not reduced). Spot-check before relying on it. The chart is built in: dock → **Sound chart**.
- **Voices were not heard by the author.** Real speech quality depends on the voices installed on your device; I tested sequencing with a mock and measured music/effects levels, but did not listen to real voices or to the music. Preview a voice in **Voice & volume** first. Some devices have no English (or no Spanish) voice; captions still run and Spanish read-aloud is skipped.
- Tested only in Chromium on Linux. Safari/Firefox, touch devices, and real Zoom/Meet screen-sharing audio were not tested.
- No microphone, speech recognition or pronunciation scoring — by design. Repeating after a synthetic voice does not prove accuracy.
- A shared screen cannot collect separate answers from remote learners; answers are entered by the teacher.
- No video export is provided. A flattened video would lose the buttons, branching and answer reveal, and browser speech synthesis is not captured by canvas recording.
- Character art is original SVG (five-digit hands, kinematic arms). I reviewed screenshots but it has not had an artist's review; some objects (book, palette) are simple.
