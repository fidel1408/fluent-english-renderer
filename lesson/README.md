# Fluent English — Be: Negatives (A1) interactive lesson

A teacher-led, 60-minute browser lesson. The deliverable is one self-contained file:
**`fluent-english-be-negatives.html`** (no server, no API keys, no external requests).

## Launch
1. Open `fluent-english-be-negatives.html` in a current Chrome/Edge (Firefox/Safari should work but were not tested).
2. Share the browser tab in your online class, press **Start Lesson** (this unlocks audio), and teach.
3. Settings (voice, speaking rate, speech/music/effects volumes, reduce motion) are in **Settings**; **?** lists keyboard shortcuts.

Rebuild after editing `src/`: `cd lesson && npm install && npm run build`. Run checks: `npm test`.

## Structure (default timers = exactly 60:00)
| # | Section | Clock | Timer |
|---|---|---|---|
| 1 | Spot the Mismatch | 00:00–05:00 | 5:00 |
| 2 | The Negative Engine (6 click-to-build sentences) | 05:00–12:00 | 7:00 |
| 3 | Contractions That Sound Natural (6 conversions) | 12:00–20:00 | 8:00 |
| 4 | Picture Detectives (6 scenes) | 20:00–28:00 | 8:00 |
| 5 | Fix the Sentence (6 repairs + corrected recap) | 28:00–35:00 | 7:00 |
| 6 | Negative Short Answers (4 guided + 2 original) | 35:00–42:00 | 7:00 |
| 7 | Speaking Lab (3 rounds, Support, Extra Challenge, anonymous checklist) | 42:00–49:00 | 7:00 |
| 8 | Ten-Question Check (A–D, retry, shared/individual) | 49:00–56:00 | 7:00 |
| 9 | Independent Exit and Recap (+ optional 2-minute task, outside the timer) | 56:00–60:00 | 4:00 |

Timers are per section; the teacher can **+30 s**, **+1 min**, **Skip Timer**, pause, jump via **Chapters**, or **Reset** (with confirmation).
At zero the timer chimes softly and counts overtime; it never advances by itself.

## Notes for teachers
- **Voices** are your device's speech synthesis (American English by default; Spanish Help voice optional). Quality varies by device. Spanish Help is text only until you press *Escuchar*.
- **Music and effects** are generated in code (Web Audio). Music ducks under speech and is silent in learner-speaking and assessment screens.
- **No microphone, no speech recognition, no pronunciation scores.** Speaking is judged by the teacher (anonymous local checklists in Sections 7 and 9).
- **Data** stays in this browser (localStorage). Nothing is uploaded or emailed. Results → *Download JSON / CSV* are explicit buttons. Shared-class assessment is labelled **Class activity score**, not individual mastery.
- After a refresh, a **Resume** choice appears.

## IPA / CC
**CC/IPA** cycles Off → Captions → Captions + IPA. IPA uses only the symbols on the Fluent English Sound Chart (American English). 
Press **Sound Chart** in the header to view the chart (embedded image; "Play original video" plays `assets/Sound_Chart.mp4` if it sits next to the HTML).
**Verification status:** Oxford Learner's Dictionaries could not be reached from the build environment, so word transcriptions were written from the chart's symbol set and are **not verified against Oxford**. Sentence lines are assembled word by word from citation forms (articles weak), not copied from Oxford. Incorrect models in Section 5 intentionally have no IPA. Spanish text has none.

## Tests actually run (`npm test`, 138 checks, headless Chromium, mocked speechSynthesis)
Timers sum to 3600 s and clock ranges are contiguous; start unlocks Web Audio; narration order, no overlapping utterances, replay/navigation cancel speech, rate and mute; pause/extend/skip/reset; CC/IPA modes and IPA coverage of every displayed word and every `say()` string; every IPA symbol is on the Sound Chart; builder feedback (agreement/position of *not*); typed answers accept both contractions, curly apostrophes and full forms and reject *amn't*/*doesn't be*; ten-question structure (one valid option each, A–D balance, hidden answers, first vs retry scores, shared/individual labels); resume after reload; JSON/CSV export (no names); animation sequencing waits for speech; theme/effects audible and not clipping; five digits per hand and no raised-elbow poses; ~260 in-lesson buttons clicked with no errors; no overflow at 1280×720; AA contrast for key colour pairs; no network requests; microphone never requested.

## Limitations (please read)
- Tests used a **mock** speech engine: real device voices, their pacing and pronunciation were **not** heard or evaluated. Real-browser audio output (listening to the music) was not auditioned by a person.
- Visuals were reviewed from screenshots in Chromium only. Firefox, Safari, tablets and phones were not tested.
- Oxford IPA verification not done (see above). The Spanish Help text was written without a native-speaker review.
- No video export is included (browser speech is not captured by canvas recording, and a flat video would lose the interaction).
- Only key colour pairs were contrast-checked; not a full accessibility audit or screen-reader test.
