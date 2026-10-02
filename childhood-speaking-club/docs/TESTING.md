# Testing summary (factual)

Run in headless Chromium (Playwright) on the build machine. Scripts are in `tools/`; raw results in `tools/test-results.json`.

## What was run and what it showed
| Check | Result |
|---|---|
| `node tools/test.mjs` – 105 automated assertions across plan, narration, class/demo flow, controls bar, layouts, dictionary, widgets, exports, content | **105 passed, 0 failed** |
| `node tools/check.mjs 1600 900` – geometry at every step **and every reveal level** (panel overflow, panel bottom edge, bubble vs logo / HUD / panel / vignette / faces) | **0 problems** (it found and I fixed ~180 during the build) |
| `node tools/crawl.mjs` – visits every step, reveal state, tray, drawer tab, modal and the word banks and records every displayed word | **993 distinct words; 0 shown without IPA; 0 without a definition** |
| Console errors on every run (start, all chapters, demo, widgets, dictionary, layouts) | **none** |
| Network requests | **none** (everything loads from local files) |

## Specific behaviours verified
* **Plan:** ten chapters of 1, 4, 7, 8, 8, 7, 7, 7, 8 and 3 minutes; each chapter's step budgets add up exactly; total exactly 3600 s; narration estimate fits inside each step's allowance; planned student-speaking timers total 41.8 min.
* **Narration (mock voices):** Maya and Theo get different (female/male) voices; speech text contains no IPA; **never two utterances at once** even under rapid Next/Back/jump; Pause stops the voice and nothing is spoken while paused; Resume restarts the interrupted line; starting a speaking timer silences narration; the spoken word is highlighted.
* **Class Mode** starts the timer after narration and then **waits** (stays on the step after the timer ends); steps marked wait never advance on their own. **Demo Mode** (run at ×40 speed) reaches the final step by itself, visits the steps, labels every sample response "Sample response (fictional)" with a ribbon, and ends with a modest memory footprint (heap < 120 MB, < 9000 DOM nodes).
* **Hide controls (H):** the bar is removed from layout (`display: none`, height 0) and the stage grows; a small Show controls button remains bottom-right; step, reveals, running timer, tallies and notes are unchanged; the state survives chapter changes and reload; H is ignored while typing in a text box; buttons have accessible names, `aria-controls` / `aria-expanded`, and a visible focus outline.
* **Layouts** at 1280×720, 1366×768, 1536×864, 1920×1080 and 1024×768, bar shown and hidden, plus real fullscreen: the stage stays exactly 16:9, fits without scrolling, and is never stretched or cropped. At 1280×720 with the bar hidden the smallest visible panel text is ≥ 15.5 px on screen.
* **Double-click dictionary:** opens a popover with word + IPA, meaning, example; speaks word → meaning → example; recognises phrases (grow up, look back on); also works on control-bar labels; Esc closes.
* **Widgets:** opinion-scale tallies (shift-click removes), ranking by drag, by Move up/down buttons and by arrow keys, Top two, games-day plan board, would-you-rather tallies before/after the twist, teacher rubric, participation marks, JSON and CSV export (labelled as teacher observations), nothing saved by default, opt-in local save, two-step reset that also clears the saved copy.
* **Fallbacks:** reduced-motion preference respected; with **no voices** the lesson still runs on captions, Settings says so, and a narration script lists every line.
* **Content:** the five core words, four warm-up questions, four claims, four would-you-rather pairs, three dilemmas with four options + a twist + a revise step each, all requested functional phrases, the four qualities, pass options, "Keep Speaking. Keep Growing."; no opinion is scored.

## Bugs the tests found and I fixed
Overlapping panels and bubbles (all chapters); title/question card left on screen after jumping into the middle of the lesson; panels and characters missing when jumping to a step that builds on earlier steps (now rebuilt from the chapter start); bubble tails pointing off-stage for guides who have left the scene (portrait badge instead); countdown text overflowing its ring; check block ignoring its hide limit.

## Not verified / honest limitations
1. **IPA is not verified against Oxford Learner's Dictionaries.** Network access to oxfordlearnersdictionaries.com was blocked in the build environment, so transcriptions come from the CMU Pronouncing Dictionary, converted to your Sound Chart symbols, plus 36 hand-set entries (`tools/ipa-report.json`). Nothing is labelled "verified".
2. **The British Council past-habits page could not be opened** (also blocked). The *used to* / *be used to* / *get used to* / *would* notes follow standard rules I know (used to for past habits and states; would only for repeated actions once the past is established and not for states; *did you use to / didn't use to*), but I did not compare them with that page line by line.
3. **Real voice quality could not be heard here.** The build machine has no speech voices, so narration logic was tested with a mock speech engine. How natural Maya and Theo sound, and whether word highlighting follows the voice exactly, depends on the voices installed in your browser; use Settings → Audition. No paid or credit-based voice service was used.
4. **No MP4 export** is provided; the HTML lesson is the deliverable and it is live and interactive.
5. Tested in Chromium only (Chrome/Edge engine). Firefox/Safari were not tested.
6. Class Mode waits for you, so a real lesson can run longer than the 60-minute plan.
