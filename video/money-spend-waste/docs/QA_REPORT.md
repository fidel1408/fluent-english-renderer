# QA report — "Spend or Waste?" (MONEY), with sound

What was actually checked, and what only a person can still judge.

## Needs a human (cannot be machine-verified)
| Item | Why / what to do |
|------|------------------|
| **How the voices sound** | I cannot listen. Voices were chosen by objective proxies (Whisper speech-to-text round trip, pitch variation, pace) — see [voice/README.md](../voice/README.md). Please play the MP4 once and judge naturalness of the Spanish narrator and the two English voices. |
| **"gastar" in the hook and in "Spend es gastar"** | The Spanish model under-voices a word-initial "g" (heard as "castar"). The build keeps only takes that both Whisper models transcribe correctly, so both lines *were* recognised as "gastar" — but a human ear should confirm. If it bothers you, say so and I'll re-voice those words. |
| **Oxford Learner's Dictionaries check of the IPA** | oxfordlearnersdictionaries.com is blocked from this environment. IPA symbols are verified against your Sound Chart; word transcriptions still need an Oxford lookup (flags: /ɑːn/, and /əʊ/ in "groceries" vs Oxford's printed US *oʊ*). |
| Final approval | Nothing was published, scheduled or sent. |

## Sound — checks run
| Check | Method | Result |
|-------|--------|--------|
| No paid service / key / upload | design | narration: open-source models run locally (Piper, Kokoro); music, ambience, effects: Web Audio code. ElevenLabs is not used. Browser/OS voices: none exist in this Chromium (`getVoices()` → []), and browser speech cannot be captured in an export, so the chosen local voices serve both preview and export. |
| Sound plays after pressing Start | `scripts/test_sound.mjs` — headless Chromium, real Web Audio graph with analysers on every layer and the master | **24/24 PASS**: context running; master/voice/music/ambience all audible within 1.5 s; 4 live sources (one per layer); visual clock follows the audio clock |
| Pause / resume | same | pause → master level 0.00000, 0 sources, time frozen; resume → audible again |
| Replay without overlap | same | Restart ×3 in quick succession, replay after the end: never more than 4 sources (one set) |
| Scene changes | same | scrubbing across all 4 scene boundaries while playing keeps a single source set and is audible at each entry |
| Mute | same | master → 0.00005 while sources keep running (stays in sync); unmute restores |
| Independent layers | same | Voice slider 0 silences narration only; Music slider 0 silences music only |
| Quiet space for the speaking challenge | same + `scripts/analyze_audio.py` | 20.5–21.7 s: master 0.0005 (voice/music/ambience exactly 0); in the final MP4 the pause window is −54 dBFS vs −18 dBFS during speech |
| Ducking | `analyze_audio.py` | music −31 dB RMS under speech vs −27 dB in gaps; whole bed sits ≈ 11.5 dB below the narration while it speaks |
| **Final MP4 really contains every layer** | `scripts/verify_video_audio.py`: decodes the MP4's own AAC track, aligns it (0 samples lag) and least-squares fits it to the four stems | coefficients voice 0.90 · music 0.80 · ambience 0.78 · effects 0.92 (≈ their mix gains), **R² 0.935**; level inside the MP4 audio: voice −0.8 dB, music −12.1, effects −16.2, ambience −18.7 (rel. total). **PASS** |
| …and the check can fail | negative control: re-exported with music = 0 and ambience = 0 | coefficients fell to −0.001 / 0.003 (−68/−66 dB) → **FAIL** as it should, then the correct mix was restored |
| Export capture problem? | By design none: the audio is rendered offline with the same Web Audio code and muxed; nothing is recorded from speakers or a tab. One real defect found and fixed: Web Audio's compressor delays the mix by 6 ms, now compensated so audio stays sample-aligned with the stems/picture. |
| A/V sync on the delivered MP4 | `scripts/verify_av_sync.py` | pause cue audio onset 20.071 s vs mic badge first visible 20.067 s (**4 ms**); box-landing thud found at 14.75 s = landing time; first caption appears within 0.18 s of the first word |
| Loudness / clipping | ffmpeg ebur128 | −16.3 LUFS integrated, LRA 3.3 LU, sample peak −4.5 dBFS, no clipping, no DC offset, no NaN |
| Narration accuracy | Whisper round trip on each final clip (`audio/narration_report.json`) | all lines transcribed as scripted (English words inside Spanish lines recognised as "Spend", "Waste", "Fluent English"; "INGLÉS" heard as "inglés") |
| No product named | grep | the online-class illustration is never labelled; copy says "clases en línea" |

## Visual / script checks (unchanged from the silent version, re-run after re-timing)
| Check | Result |
|-------|--------|
| Format | 1080×1920, 30 fps, H.264 + AAC, **28.9 s**, three variants (captions+IPA / captions / none) |
| English text & teaching accuracy | exact-string check passes; spend = neutral, waste = speaker's view; "spend money on …"; "wasted" because it already happened |
| IPA | `scripts/check_ipa.mjs`: all symbols are Sound-Chart symbols (+ stress mark); never under Spanish text, punctuation, the blank or the logo |
| CC/IPA button | cycles Off → Captions → Captions + IPA, remembered across reloads |
| Export cleanliness | export page has no controls/cursor/debug; modes burned in |
| Layout / safe zones | `scripts/qa_layout.mjs` 1,277 element checks × 3 modes: captions/cards/logo/CTA inside x 60–1020, y 235–1585; captions never overlap them; only exception: 2 sub-second frames of the card pop-in overshoot (~12 px) |
| Arms / hands | rig of connected joints; visual inspection of full-resolution crops of every distinct pose + 1-fps contact sheets; no detached hands, five digits, natural rest elbows. Compromises: stylised grip fist; straight-ish forearms in the wide palms-up poses |
| Logo | authentic supplied file, undistorted, CTA scene + cover |
| Claims | no prices, discounts, trials, schedules, guarantees, testimonials, statistics |
| File links | all relative links in the Markdown files resolve |

## Limits
Visual inspection used sampled frames, not all 867. Audio was judged by measurements, not by ear. The synthesised music is "tasteful stock-style" by design; taste is subjective — tell me what to change (tempo, instruments, level).
