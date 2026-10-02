# QA report — "Spend or Waste?" (MONEY)

Honest summary of what was actually checked in this build session, and what is still open.

## Still pending / not done (needs you)
| Item | Why | What to do |
|------|-----|-----------|
| **Voiceover audio** | ElevenLabs is listed as a connected service, but its text-to-speech endpoint answered `401 unauthorized` (no credential was injected for `api.elevenlabs.io`, and the listed host `apilelevenlabs.io` returned `502`). Listing public voices worked; generating speech did not. I did not try to work around it, spend credits, or substitute browser/robotic speech. | Provide a working key/connection or record the 7 clips ([docs/SCRIPT.md](SCRIPT.md), [audio/README.md](../audio/README.md)). The MP4s are **silent**. |
| **Voice naturalness & audio/caption sync** | No audio exists, so neither could be judged. Caption timing is a *planned* estimate. | After import, run `measure_audio.mjs --write` (captions/highlights re-time automatically), then re-render and watch once with sound. |
| **Oxford Learner's Dictionaries verification of IPA** | `oxfordlearnersdictionaries.com` is blocked by this environment's network policy (403). | Look up spend, money, on, groceries, waste, wasted, this, gadget at oxfordlearnersdictionaries.com/us and compare with the table in [docs/SCRIPT.md](SCRIPT.md); two items are flagged (/ɑːn/, and /əʊ/ vs Oxford's printed US *oʊ*). |
| Final human review / approval | Required by you. | Nothing has been published, scheduled or sent. |

## Checks that were run
| Check | Method | Result |
|-------|--------|--------|
| Duration / format | `ffprobe` on all 3 MP4s | 28.800 s (864 frames), 1080×1920, 30 fps, H.264 High, yuv420p, faststart, **0 audio streams**. Inside the 25–30 s target. |
| Scene windows | `src/timeline.js` | 0–3.7 hook · 3.7–10.3 spend · 10.3–17.0 waste · 17.0–23.0 speak (3.0 s silent pause 19.9–22.9) · 23.0–28.8 CTA |
| English accuracy | scripted exact-string comparison of rendered sentences | "I spend money on groceries." ✔ · "I wasted money on this gadget." ✔ · "I spend money on ___." ✔ ; Spanish VO/caption texts match the brief word for word |
| Teaching accuracy | manual review against the brief | spend = neutral; waste = speaker's own view; pattern "spend money on …"; "wasted" because it already happened; no claim that groceries are always good / gadgets always wasteful |
| IPA symbols | `scripts/check_ipa.mjs` | every symbol is a Sound Chart symbol (incl. `əʊ`, `ɑː`, `ð`, `dʒ`, `ʌ`, `æ`) plus the stress mark ˈ. Note: the unstressed final **i** in /ˈmʌni/ and /ˈɡrəʊsəriz/ is the Oxford-style "happy" vowel, not a separate chart tile. IPA never appears under Spanish text, punctuation, the blank or the logo (verified visually in modes 1–2 and by construction in `ui.js`). |
| IPA vs Oxford | — | **Not verified** (blocked, see above). Sentence-level transcriptions are my own word-by-word citation forms; no Oxford citation is claimed for them. |
| CC/IPA button | Playwright against the preview | cycles Off → Captions → Captions + IPA; value saved in `localStorage` and restored after reload (tested: Off persisted). |
| Export cleanliness | Playwright, `?export=1` | control bar `display:none`, cursor `none`; no debug text. MP4 has captions burned in per mode. |
| Audio replay overlap | Playwright with synthetic tones (nothing saved) restarting, scrubbing and pausing mid-clip | max **1** clip playing at any moment. (Real audio still pending.) |
| Layout / safe zones | `scripts/qa_layout.mjs`: 1,273 element checks × all 3 modes, every 0.1 s | Captions, cards, logo, CTA stay inside x 60–1020, y 235–1585 and captions never overlap the logo/CTA/cards, except 2 sub-second frames (t=4.1 s, 10.7 s) where the English card's pop-in overshoot briefly pokes ~12 px above y=235. |
| Logo | visual (cover, CTA frames) | authentic supplied `fluent_english_logo_blue.png` (copy of repo file, scaled uniformly, no distortion) on a white card, top of CTA scene and on the cover; no replacement was invented. |
| Claims | text review | no prices, discounts, trials, schedules, seat limits, guarantees, testimonials or statistics. Characters are fictional illustrations. |
| Arm / hand anatomy | rig built from connected joints (shoulder→elbow→wrist→palm→fingers); visual inspection of full-res crops of every distinct pose: hanging + bag grip, raised open palm, apple hold (curled fingers), basket grip, two-hand box hold, open-palm shrug, invitation pose; plus a 1-fps contact sheet of the final MP4 | No detached hands, no floating forearms, five digits per hand, elbows rest near the torso in rest poses, no permanently raised shoulders. Known compromises: the grip fist is stylised (4 finger capsules + thumb over a strap); in the wide "palms-up" poses the forearms are fairly straight. |
| Captions readability | visual at full-res | ≥54 px bold Spanish on a dark pill; English 62 px with 36 px IPA; no caption over a face or hand in any sampled frame. |
| File links | scripted check of relative links in all Markdown files | all resolve. |

## Limits of this review
- I cannot hear audio or judge voice quality; I could not audition voices (preview audio not generated).
- Visual checks were done on sampled frames (1 fps contact sheets + targeted full-res crops), not every one of the 864 frames.
- Rendering was done with Chromium + ffmpeg in a Linux container; fonts are bundled so other machines should render identically.
