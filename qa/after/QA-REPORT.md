# QA report — Fluent English · Subject Pronouns and Be (A1) · improvement pass

Generated 2026-10-04T07:31:49.685Z from the actual outputs in this folder. Nothing below is typed from memory: pass/fail counts are parsed from the test output files.

## 1. What was preserved first
Baselines are preserved untouched: git tags `lesson-v1-initial → 350e4a6`, `lesson-v2-chart → f6523ec`, `lesson-v3-video → 0676e57`, `lesson-v4-baseline-before-improvement-pass → b1ea916`; the four HTML builds are in `lesson/versions/`; the owner's original Sound Chart video is kept byte-identical at `lesson/assets/original/Sound_Chart.mp4` (SHA-256 ff922a12…49718e matches the upload). The embedded chart image/video inside the lesson are derivatives (cropped/compressed). Model/effort: this pass ran as Sonnet 5.5; the session cannot set effort/fast-mode from inside, so those settings are as the session was started.
Files attached earlier in this conversation (an interim HTML + bundle) are superseded by the final attachments; the final HTML adds the negatives-table fix and wrap-safe tags for crowded scenes. Two stale screenshot folders from my own earlier pass (`qa/after/shots`, `qa/after/contact-sheets`, pre-fix and washed-out) were removed and regenerated; nothing else was deleted.

## 2. Baseline defects (v4) and status
| # | Defect (baseline v4) | Evidence before | Status now |
|---|---|---|---|
| 1 | Word bank rejected correct "I am …" (lower-cased "I" looked up under "I") | `qa/before/repro-bugs.txt` | Fixed; pure `checkPattern()`; all 189 pronoun×be×phrase combinations match an explicit grammar table |
| 2 | Quiz Q4 ambiguous ("uses a contraction" – C and D both did) | repro | Prompt now asks for the contraction of *They are*; distractor D "Theyre friends."; oracle test: exactly one valid option for every question |
| 3 | Quiz Q6 echo-question ambiguity, Q8 "doctor" did not exclude "teacher", Q3 extension invited "We are class" | source review | Q6 asks for the standard inverted yes/no form; Q8 states a story fact (one job: doctor); Q3 extension "We are ready / in class" |
| 4 | Exports had summaries only | repro | Local answer sheet: question ID, prompt, options, selected, correct, attempt number/type, correctness, ISO timestamp; JSON, full CSV and a separate answer-sheet CSV; summaries preserved |
| 5 | CSV formula injection via notes | source review | Cells starting = + - @ are prefixed with an apostrophe |
| 6 | Skip timer wrote the whole budget into elapsed time | source review | Actual elapsed time never altered; skipped time tracked separately and shown separately |
| 7 | Mobile Hide removed the dock; only the H key restored it | source review | Visible "Show controls" button |
| 8 | Chapter completion marked by merely jumping to the last screen | source review | Completed only by stepping past the last screen |
| 9 | 50 text nodes with no IPA; missing words shown as plain spelling in /slashes/; letter "A" rendered as schwa; 348 IPA lines hidden on phone | `qa/before/ipa-audit-*.json` | 0 un-IPA'd text nodes; unknown words render as [?word] and none remain; letter names fixed; phone shows labels + IPA in a legend (nothing hidden) |
| 10 | Narration "I is the speaker", "They is other people" | source review | Rewritten as grammatical metalanguage |
| 11 | Answers inferred from a smile / generic scene (not tired, not doctor, not late) and ambiguous referent for *It isn't blue* | source review | Explicit "Facts" cards; apple/chair referent stated |
| 12 | Paused navigation left half-built silent screens; Replay while paused did nothing; Repeat was cut off by narration | code review + tests | Instant fast-forward state, replay on Play, Repeat interrupts and fast-forwards |
| 13 | Space re-clicked focused buttons; Escape closed every dialog; no focus trap; timer ticks capped at 1 s | code review | Fixed (P key too); only top dialog closes; focus trapped; cap 90 s |
| 14 | Resume of older saves left settings keys undefined (AudioParam NaN error) | found by new test | `mergeState` rewritten: defaults first |
| 16 | Negatives table (activity 5, step 3, "Two natural short forms") rendered as an empty table: rows were fade-in elements that nothing ever revealed (present since v1) | `qa/before/before-evidence.txt` (item 15) | Rows reveal one by one; new test fails if any fade-in/fly-in element is left invisible after a step finishes |
| 17 | **Privacy regression found by the owner's independent audit (introduced in this pass):** selecting an online voice and then enabling "On-device voices only" still returned the online voice, because saved names were looked up across all voices | owner audit; reproduced by `test-regression.js` K2 on the intermediate build | Selection is looked up only inside the allowed pool; saved online choices are cleared; with no on-device voice the lesson is silent (captions only) with a clear notice and never falls back to an online voice. Tests cover selected-before-toggle, persisted presets, narrator/male/female individually, Spanish, and the no-local-voice case |
| 18 | Activity 5 step 10 "Your negative sentence 2": model answers "He isn't a teacher / She isn't a student" were not entailed by the facts (roles can overlap) | owner audit | Facts now state the negative roles explicitly; premise test checks every negative model answer against its Facts card (B2) |
| 19 | Test-suite quality: one assertion ended in `|| true` (retry bookkeeping), one storage check was always true, and the IPA corpus test read a non-bundled /tmp file | owner audit | Replaced by real invariants (retry mode ends; retry keys = missed set; first-attempt records unchanged; on-screen 6/10, 3/4, 9/10). The corpus is now generated by the test itself. Scripts locate Playwright/Chromium via build/pw.js (PW_CHROMIUM override) so the bundle is reproducible |
| 15 | Over-claimed IPA wording ("Oxford-style"), chart-only whitelist test | owner clarification | Notation statement corrected, see §5 |

## 3. Verification actually run (headless Chromium via Playwright, Linux)
| Suite | Before (v4 baseline) | After |
|---|---|---|
| New regression suite (`test-regression.js`) | did not run to completion (see file) | 164 passed, 0 failed |
| Real-viewport suite (`test-viewports.js`) | 19 passed, 5 failed | 24 passed, 0 failed |
| Original functional suite (`test.js`) | 69 passed, 0 failed | 69 passed, 0 failed |
| Speech sequencing, mock voices (`test-speech.js`) | 14 passed, 0 failed | 14 passed, 0 failed |
| Video dialog (`test-video.js`) | 7 passed, 0 failed | 7 passed, 0 failed |
Notes: the "before" column for the two new suites is the unchanged v4 file run through the same tests; it is expected to fail where the defects exist, and a run may stop early if a feature the test needs does not exist in v4. Audio levels (`test-audio.txt`) were measured for peaks only.

Coverage of the regression suite: word bank (every pronoun × be × phrase, upper/lower-case I, incomplete, invalid); quiz oracle for all ten questions; answer sheet/attempt history/exports/CSV safety; skip/extend/clock; completion; Hide/Show; keyboard; dialogs (stacking, focus trap, chart, video); IPA (coverage, notation, honesty labels, letter names, unknown-word marker); no pronunciation-assessment claims; retry/scoring (skip, mode switch mid-retry, second round); repeated/rapid clicks; stale narration with mock speech (rapid navigation, pause→navigate→play, replay while paused, Repeat mid-sequence); speaker voices; 390 px layout; chapter navigation (all 100 steps); resume from an old v4-era save.

## 4. Real-viewport phone checks (not only expanded-height captures)
`test-viewports.js` uses the true device size and scrolls to every control, then confirms the control is fully on screen and is the element a click would hit.
| Viewport | Steps | In-stage controls scrolled to | Smallest visible stage | Horizontal overflow (steps) | Teacher buttons unreachable | Stage controls off-screen | Stage controls covered | Content behind ribbon | IPA < 12px |
|---|---|---|---|---|---|---|---|---|---|
| phone-portrait-390x844 | 100 | 272 | 597px (step 1.1) | 0 | 0 | 0 | 0 | 0 | 0 |
| phone-landscape-844x390 | 100 | 272 | 308px (step 1.1) | 0 | 0 | 0 | 0 | 0 | 0 |
| desktop-1280x720 | 100 | 272 | 483px (step 1.1) | 0 | 0 | 0 | 0 | 0 | 0 |
Before (v4 baseline, same test):
| Viewport | Steps | Controls | Smallest stage | Overflow | Dock unreachable | Off-screen | Covered | Behind ribbon | IPA<12 |
|---|---|---|---|---|---|---|---|---|---|
| phone-portrait-390x844 | 100 | 271 | 469px (step 6.15) | 0 | 0 | 0 | 0 | 0 | 11 |
| phone-landscape-844x390 | 100 | 271 | 0px (step 6.15) | 0 | 0 | 3 | 0 | 0 | 207 |
| desktop-1280x720 | 100 | 271 | 453px (step 1.1) | 0 | 0 | 0 | 0 | 0 | 64 |
Screenshots: `qa/after/shots` and `contact-sheets/` contain (a) expanded-height captures at 390 px and 1280 px wide (nothing cropped — useful for reading long IPA/feedback but can hide reachability problems) and (b) TRUE-viewport captures (`*-REAL`) at 390×844, landscape 844×390 and 1280×720. Both are provided deliberately.

## 5. IPA — what is and is not established
* **Notation:** the lesson follows the owner's uploaded Sound Chart. For the GOAT vowel the chart writes /əʊ/; the current Oxford Learner's (OALD) NAmE entries examined by the owner (boat /bəʊt/, no /nəʊ/, go /ɡəʊ/) agree with the chart. Oxford's separate Advanced American dictionary writes /oʊ/ — a different transcription standard that is **not** mixed in. /əʊ/ entries are therefore not treated as errors. (Correction to my first baseline note, which called this a "chart vs US defect".)
* **Word-level verification:** 3 of 417 dictionary entries are source-verified (boat, no, go — from the owner-supplied OALD evidence; I could not re-fetch Oxford from this sandbox). The other 414 are hand-entered in the same notation and are NOT checked word by word. Add verified rows to `lesson/build/ipa-verified.csv` and rebuild: they override the hand entries and are marked verified.
* **Sentence lines are assembled** word by word from single-word entries (citation forms; natural speech reduces small words). The stage, the Teacher guide and the Sound-chart dialog say so.
* **Coverage audit:** exhaustive corpus run over every step, every wrong-tile/word-bank/quiz branch (both modes), retry/results screens and every narrated line: 1793 distinct strings, 0 with a missing word, 0 visible text items without an IPA line. DOM audit of English text outside an IPA wrapper: before 50 nodes → after 0; hidden IPA lines on a 390 px screen: before 348 → after 212.
* **Scope of "required IPA":** learner-facing teaching text (titles, examples, instructions, feedback, options, captions/narration). Teacher chrome (control bar, timers, dialogs such as results/settings, button labels) and Spanish help are not IPA'd.
* Nobody has listened to every audio line; the notation checks above are about transcription coverage, not pronunciation quality.

## 6. Planned time versus actual narration
* **3,600 seconds = the facilitation plan** (9 activities: 5·7·8·6·7·8·7·8·4 minutes; 2100 s planned collective learner speaking). It is not audio.
* **Scripted narration:** 180 lines, 1073 words → roughly 6.7–9.8 minutes of synthetic speech (an assumption of 110–160 wpm; not measured with real voices). 180 lines do not equal an hour; the rest of the hour is learner speaking, thinking, partner work and teacher pacing. The deliverable is an interactive HTML lesson, never a 60-minute video or audio file.

## 7. Limits — not tested / not claimed
* No human has listened to the speech, music or effects; real browser voices were not exercised (mock `speechSynthesis` + measured levels only). Speaker-matched voices are a name-based guess (or a small pitch shift) and need checking by ear.
* Only Chromium on Linux was run. Safari, Firefox, Edge, real phones/tablets, touch gestures, Zoom/Meet screen-share audio and the MP4 path (Safari) were not tested. "Phone" results are emulated viewports, not devices.
* Online browser voices may send spoken text to a vendor; the lesson labels them ONLINE and offers an on-device-only setting, but I cannot verify what any vendor does.
* Art was reviewed only through the contact sheets (arms kept at the shorter proportions from the previous pass; I changed no figure drawings in this pass). It has not had a professional art review. The lesson does not assess pronunciation and says so.
* Word-level IPA is largely unverified (see §5). Spanish help text was proof-read by me only.

## 8. Files
* `fluent-english-be-lesson.html` — the repaired self-contained lesson.
* `qa/after/inventory.json` — every step, narration line (with speaker, IPA and verification status), on-screen text, exercise, answer key, tips, quiz items, word-bank rules.
* `qa/after/*.txt|json` and `qa/before/*` — raw outputs. `qa/after/ipa-corpus.json` — every string with its assembled IPA line.
* `qa/after/contact-sheets/*.png` (144 sheets; 198 + 198 + real-viewport shots) and `qa/after/shots/`.
* Source: `lesson/src`, tests/tools: `lesson/build`; before/after source diff in the bundle.
