# Testing report

Run with `node tools/test-acceptance.mjs` (Playwright + Chromium 1194, headless, file:// URL, no network). Result of the final run: **44/44 checks passed**.
Screenshots from the final build are in `docs/screenshots/`.

## Automated checks

| Result | Check | Detail |
|---|---|---|
| PASS | Plan: ten chapters with the exact minutes and speaking minutes | 1/0 5/4 6/4 8/6 8/6 7/5 8/6 7/5 7/5 3/2 |
| PASS | Plan totals 60 classroom minutes and 43 planned speaking minutes | 60/43 |
| PASS | Plan: segment minutes add up to each chapter total |  |
| PASS | Ten chapter modules registered in plan order |  |
| PASS | No page or console errors while walking all steps in Class and Demo Mode |  |
| PASS | Zero roleplay: no role cards, acting, assigned identities or "switch roles" text anywhere |  |
| PASS | All ten chapters and branches rendered | 406 states |
| PASS | IPA: every displayed English word unit has aligned /IPA/ beneath it (stage, drawers, controls) |  |
| PASS | IPA: no English word is displayed outside a word+IPA unit |  |
| PASS | Layout: no text, card, control or face overlaps in any state |  |
| PASS | Layout: every card and control stays inside the 16:9 board |  |
| PASS | Control: mystery evidence appears only after the teacher clicks Reveal | {"r":false} |
| PASS | Control: vocabulary scene plays only after the teacher clicks Play the scene |  |
| PASS | Control: when a timer ends, nothing moves until the teacher clicks | done=true ch=2 step=0 |
| PASS | Control: warm-up twist, new circumstance, case evidence and twist wait for clicks |  |
| PASS | Hide controls @1600x900: bar removed from layout, H toggles back |  |
| PASS | Board expands when hidden, stays 16:9 and uncropped @1600x900 | shown 1426x802 / hidden 1600x900 |
| PASS | Hide controls @1920x1080: bar removed from layout, H toggles back |  |
| PASS | Board expands when hidden, stays 16:9 and uncropped @1920x1080 | shown 1712x963 / hidden 1920x1080 |
| PASS | Hide controls @1366x768: bar removed from layout, H toggles back |  |
| PASS | Board expands when hidden, stays 16:9 and uncropped @1366x768 | shown 1214x683 / hidden 1365x768 |
| PASS | Hide controls @1280x720: bar removed from layout, H toggles back |  |
| PASS | Board expands when hidden, stays 16:9 and uncropped @1280x720 | shown 1138x640 / hidden 1280x720 |
| PASS | Hide controls @1024x768: bar removed from layout, H toggles back |  |
| PASS | Board expands when hidden, stays 16:9 and uncropped @1024x768 | shown 1024x576 / hidden 1024x576 |
| PASS | Hiding controls keeps tokens, timer and the on-stage timer chip | {"A":[[3,3,2,2],[0,0,0,0],[0,0,0,0]],"left":90} |
| PASS | Fullscreen: hidden-controls state works and survives the mode change |  |
| PASS | H does not toggle controls while typing in a text field |  |
| PASS | Progress and hidden-menu state survive chapter navigation |  |
| PASS | Progress, choices and hidden-menu state are restored after reload (localStorage) |  |
| PASS | Every on-stage, bar and drawer button was clicked without error | 676 clicks;  |
| PASS | Next and Back walk through the whole lesson in both directions |  |
| PASS | Accessible names on all controls; document language en-US |  |
| PASS | Keyboard focus is available (visible focus ring defined for :focus-visible) |  |
| PASS | Demo Mode: clearly labeled sample answers and a Demo pill |  |
| PASS | Demo Mode autoplay moves ahead only after the adjustable demo timer | 0->0->1 |
| PASS | Class Mode ignores the demo autoplay setting |  |
| PASS | Every narration line has a recorded clip that loads |  |
| PASS | Audio: a new narration cancels the old one (single voice channel, no overlap) |  |
| PASS | Audio: pause freezes narration and resume continues without restarting |  |
| PASS | Contrast: all word and IPA text on opaque surfaces is at least 4.5:1 | 1248 text runs checked;  |
| PASS | Authentic Fluent English logo files (unredrawn, cropped copies of the originals) are present |  |
| PASS | No external network dependencies in index.html |  |
| PASS | Lightweight delivery (js, css, audio, assets) | 2.32 MB |

## What the automated run covers (406 rendered states, Class and Demo Mode)

Every chapter step plus its branches: marker counts, evidence buttons, wrong/right meaning-check answers, all three mystery reveals and modals, token jars filled, all ten "Make Your Case" qualities × three stages, final checklist, all drawers.
For each state it checks IPA alignment, loose text, text/card/control/face overlaps, and that cards stay inside the 16:9 board. Animations are switched to reduced motion for measurement so mid-animation positions do not count.

## Not verified — please be aware

* **Voice naturalness** was not heard by a person (see `docs/VOICES.md`). Clips load and play/pause/resume correctly; how they *sound* is unverified.
* **IPA vs. Oxford** was not checked entry by entry (Oxford was unreachable) — see `docs/IPA-METHOD.md`.
* **Zoom screen-share** itself, Safari, Firefox and a real touch screen were not tested; only Chromium. Zoom compresses small text, so share a window or tab at 1280×720 or larger.
* Artwork was reviewed by me from rendered screenshots, not by a human art director; Alex's design (broad shoulders, defined jaw, short textured hair, neat stubble, structured overshirt, rolled sleeves, watch) is visible in `docs/screenshots/ch3.jpg` and `ch5.jpg`.
* Contrast was measured automatically for all word and IPA text on opaque surfaces in ten representative screens (≥4.5:1). Text over scene artwork always sits on a card or a dark scrim, but only the measured screens are proven.
* No MP4 export was made (live choices cannot survive as video).
* Browser `localStorage` can be cleared by the browser; the app works without it but then forgets progress.

## Issues found and fixed during testing

Overlapping cards/controls on many screens, narration card covering content in Teacher-reads mode, IPA colour contrast on ivory, tokens/evidence layouts, demo boxes crowding stages (now a labeled on-request chip), a brow-direction bug that made worried faces look angry, and missing IPA for a few control labels.
