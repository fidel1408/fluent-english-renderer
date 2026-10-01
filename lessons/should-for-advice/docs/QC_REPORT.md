# Should for Advice — quality-control report

Date of last full run: see `docs/qa-results.json` and `docs/qa-audio-results.json` (machine-written by the test scripts).
Rule used in this report: **“Tested”** means a script or an inspected screenshot actually exercised it. **“Not verified”** means exactly that.

## 1. What was built
* One self-contained interactive file: `dist/should-for-advice.html` (≈8 MB; fonts, the supplied Fluent English logo, IPA lexicon and 265 narration clips embedded; no network needed).
* 7 chapters, **54 segments**, planned total exactly **3600 s** (5/8/8/8/10/15/6 minutes). 28 activity gates in CLASS mode.
* 6 original adult characters (articulated SVG, spring-animated, blinks, breathing, gaze, lip-sync from the audio envelope), 5 layered environments (office, café, apartment, coworking space, train station), 30+ vector icons, organic speech bubbles whose tails follow the speaker.
* About 15.2 minutes of spoken narration/dialogue across 242 timeline lines (plus on-demand clips); the rest of the hour is thinking, speaking, pair work, interaction and countdown time.

## 2. Tests actually performed (all passing at the last run)
**`tools/qa-crawl.mjs`** – visits every one of the 54 segments (start, middle, end, every activity item, reveal, hint): 0 script errors, 0 missing IPA, 0 empty IPA.

**`tools/qa-controls.mjs`** – 73 checks in headless Chromium 1194, 73 passed, including:
* exact title/IPA units on the opening card; logo aspect ratio preserved (3444×1875 asset, drawn `object-fit: contain` on a white card, never recoloured or stretched);
* **collapsible bar:** hidden by default after Start; viewport height grows by exactly the bar height (844→900 px) and the bar’s own height is 0 – *no empty strip*; Show button 48×48 px, bottom-right, keyboard-focusable; `H` toggles; `H` ignored in a text field; hide/show during playback leaves clock, chapter and audio token unchanged; works while paused; state survives chapter jumps, window resize (1280×720, 1000×900 letterboxing at exactly 16:9, never cropped), **fullscreen enter/leave**, and `prefers-reduced-motion` removes the transition;
* every bar button with real clicks: play/pause, ±5 s, previous/next chapter, replay, hint, answer reveal, timer pause/restart/skip/+1:00, mode switch, narration/music/effects sliders + mute, notes, restart-with-confirmation (cancel keeps position);
* **CLASS mode:** all 54 segments reached, clock ends at 60:00, the clock is *held* at a gate until Continue; **DEMO mode:** runs 3600 s with 0 gates; “more time” extends beyond the planned end;
* genuine validation: wrong option marked wrong, right one accepted with an explanation; multi-select “all reasonable ideas” accepts the three reasonable ideas and does not credit an unhelpful one; sentence builder rejects “asks”/“to” with a specific reason; repair task keeps the sentence marked incorrect until the right repair is chosen;
* **branching mission:** different first choices give different scene states and different outcome narration; revised advice that repeats a step is recognised as “same kind”, complementary steps as “good”; the hero’s mood follows the state;
* IPA structure: 7,790 rendered word units across all segments – every one has a non-empty `/…/` line directly beneath; no English words rendered outside word-over-IPA units; every “+” has /plʌs/;
* form checker: 11 sample sentences (5 genuine learner errors + 6 correct forms) all classified correctly;
* resource use: simulated 60 minutes in DEMO mode – DOM never above ~1,800 nodes, heap ≈ 15 MB at the end, at most 2 actors alive.

**`tools/qa-audio.mjs`** – real wall-clock playback with the real `<audio>` element (9/9): narration begins within 0.05–0.15 s of the planned time; only one clip plays at a time; seeking, chapter jumps and replay never create extra audio elements; pause freezes narration and resume continues it; lip-sync level follows the clip’s envelope of the speaking character; ~16.7 ms median frame time in a dialogue scene (headless software rendering); the render loop stops when paused.

## 3. Visual review
I looked at screenshots of **all 54 segments** (contact sheets, then full-size screenshots of the problem ones) and fixed: speech bubbles re-appearing after seeks, text overflowing fork cards, cards/panels covering a speaker’s face, a desk-lamp prop crossing a face, token labels running off the right edge, countdown widget covering panel headers, wrong-looking distractor tiles that gave the answer away, a ghost button invisible on white cards. This is my review of still images; it is not a frame-by-frame viewing of the hour.

## 4. IPA – exactly what was and was not verified
* **Oxford Learner’s Dictionaries could not be reached** from this environment (HTTP 403 through the proxy). **No entry has been verified against Oxford.**
* Method: American English pronunciations from the **CMU Pronouncing Dictionary** converted algorithmically to Oxford-NAmE-style notation (ɑː, ɔː, oʊ, ɜːr, ˈ/ˌ placed before the stressed syllable, monosyllables unmarked, syllabic n/l written as in OLD, unstressed final *i*), plus a reviewed manual override file (`tools/lexicon-manual.json`) for function words, names, contractions and heteronyms (*close* verb, *use* verb, *live* verb, *read*).
* I read through all 496 distinct displayed words and corrected the ones I found wrong (e.g. *close*, *use*, *live*, *online*, *pronunciation*, *usual*, *doesn’t*, *Partner A*). Some entries may still differ from Oxford in small details (secondary stress, optional variants). **Please treat the lexicon as “carefully generated and reviewed”, not “dictionary-verified”.**
* Function words are shown in their dictionary **citation/strong** form (*to* /tuː/, *of* /ʌv/, *and* /ænd/ …) except *a* /ə/ and *the* /ðə/. Weak forms are taught only for *should* (/ʃəd/ vs /ʃʊd/), with the weak-form audio produced from an explicit phoneme string.
* Incorrect teaching sentences display IPA for the words actually shown (e.g. *calls* /kɔːlz/), not for a corrected form.
* Typed text in the optional form checker is not shown back, so no learner-typed word is ever displayed without IPA.

## 5. Narration voice – honest account
* ElevenLabs is listed as a connected host in this session, but a test request returned `401 needs_authorization`; it was **not** used (and no paid service, key or subscription was used).
* Free, authorized, local option used: **Kokoro-82M** via `kokoro-onnx` (Apache-2.0, model downloaded from its public GitHub release).
* “Audition”: I rendered a test passage with 16 American voices and compared them with objective measures only (duration, longest pause, peak level/clipping, pitch median and spread) plus the model authors’ published voice-quality grades. `af_heart` (grade A, steady pace, no clipping) became the narrator; `af_nicole` was rejected (very slow, 1 s pauses); `am_adam` clipped. **I cannot listen to audio, so no one has judged warmth or naturalness by ear. Please audition a few clips (`narration/clips/`) before class.** Any clip can be replaced by an MP3 with the same file name or regenerated with another Kokoro voice (`tools/gen-narration.py`).
* Loudness is normalised per clip (≈ −21 dBFS RMS, peak-limited) and silence is trimmed. Background music is a quiet generated pad that ducks under narration and is silent during timed activities; sound effects are generated in the browser. Narration, music and effects have separate volume and mute controls.
* Word highlighting inside bubbles is spread across the *actual* clip duration in proportion to word length; per-word timestamps do not exist, so highlight timing within a line is an estimate.

## 6. Requirement audit
| Requirement | Status |
|---|---|
| Exact title “Should for Advice”, IPA under each word | tested |
| Seven chapters totalling 60:00; planned vs actual time shown separately | tested |
| should/shouldn’t, questions, short answers, *I think you should*, *I don’t think you should*, responses, advice vs rule vs expectation | implemented; content reviewed by me, not by a second teacher |
| should have + past participle | deliberately not taught on screen (teacher note only) |
| Genuine closed-task validation; open tasks accept many answers | tested |
| Branching mission with plausible, non-guaranteed consequences | tested (state + narration change with choices) |
| Bar hides, space reclaimed, Show button, `H`, survives chapter/resize/fullscreen | tested |
| No claims about microphone / Zoom chat / scores | the lesson says so on screen (listen–repeat, roleplay checklist, form checker) |
| Existing repository files untouched | all new files are under `lessons/should-for-advice/` |

## 7. Not done / not verified (please read)
* **No 60-minute passive MP4.** A frame-by-frame render of an hour of interactive SVG would be a very heavy job and was deliberately not attempted; the interactive HTML is the deliverable.
* **I did not watch or listen to the full hour in real time.** CLASS/DEMO were run on a simulated clock for the whole hour, and wall-clock playback with real audio was tested for 40 s plus targeted seeks. Any timing drift over a full real hour is therefore untested (narration is scheduled from the same millisecond clock that drives the animation, and every segment starts its clips from that clock, so a late clip cannot push later clips; the 40 s test measured ≤0.15 s lateness).
* Tested in Chromium only (headless, software rendering). Firefox, Safari, Edge-on-Windows and real Zoom screen-sharing (including audio capture) are untested. Touch input is untested.
* Audio is MP3 at 40 kbps mono, 24 kHz: clear speech, not studio quality.
* Pedagogical content was written and checked by me against your specification; it has not been class-tested with learners.
* The characters are stylised vector illustrations. They are layered and shaded, but they are not a film-studio animation; hands are simplified.
