# Quality report — what was actually checked, and what is still pending

## Verified by measurement (this session)
| Check | Result | How |
|---|---|---|
| Format | H.264 High, yuv420p, 1080×1920 (9:16), 30 fps, **900 frames, 30.000 s**; AAC 256 kbps 48 kHz stereo; +faststart | `ffprobe` on `out/fluent_english_reel.mp4` |
| Loudness | **−14.2 LUFS integrated**, **−1.3 dBTP**, LRA 6.2 LU | ffmpeg `ebur128` on the MP4 audio; matches pyloudnorm (−14.26) in `audio/metrics.json` |
| Clipping | 0 clipped samples | script |
| Voice vs. bed | Voice sits 9.9–19.2 dB above music+SFX+ambience (RMS, per clip; lowest: hook 9.9 dB, “Empieza…” 10.9 dB) | `audio/metrics.json` |
| Loudness jumps | Largest momentary step ≈16 LU — between speech and the deliberately quiet 3.2 s speaking space; no jumps inside the music bed | pyloudnorm, 0.5 s windows |
| Mono | Mix is effectively centre-weighted (L/R correlation 1.0), mono loudness identical (−14.26 LUFS) → no phase cancellation | script |
| English word timing | Highlight times come from pocketsphinx segmentation of the actual English audio (e.g. normal pass: I’d 8.78–8.93, like 8.94–9.09, to 9.10–9.19, learn 9.20–9.49, English 9.50–10.05) | `audio/timeline.json` |
| Spanish caption timing | Chunk starts = real clip start; split point = lowest-energy point near the comma | `tools/make_timeline.py` |
| Safe margins | Automated bounding-box scan of every text/logo element, 300 sampled frames, both modes: sides ≥54 px, y ≤1560 px, text cap-height ≥230 px. **1 transient hit** (question-bubble pop-in overshoot at 0.5 s, 1 frame) | `tools/qa_layout.py` |
| Preview page | Loads without console errors; CC/IPA button cycles Off / Captions / Captions+IPA, hides/shows IPA and captions correctly, mode remembered after reload; play/scrub run; per-layer volume + import controls present | Playwright test |
| Business copy | No price, discount, schedule, guarantee, testimonial, or statistic. “Zoom” removed everywhere per your request | text search |
| Brand | Authentic supplied logo used unmodified (blue version on ivory; white version on navy cover) | files in `web/img/` |

## Visually inspected (by me, on rendered frames)
Contact sheets of the final MP4 (`out/review_contact_sheet.png`) plus larger crops of S1–S6 and the cover. Poses reviewed: hands resting on desk, hand-to-chin thinking pose, open-hand presenting pose, relaxed seated pose, and the class-tile characters. Anatomy fixes made after first inspection: lengthened arms to head-to-body proportion, replaced IK with forward kinematics so elbows stay near the torso, redrew hands (five distinct digits, no fused fingers), lowered shoulders, moved hands onto the desk so they have object contact.
**Not exhaustive:** I did not view all 900 frames. Mid-transition frames (e.g. t≈2.3 s, right arm travelling from desk to chin) pass in front of the torso; this reads as a normal motion but is the frame most worth a second look.

## NOT done / pending — please do not treat as verified
1. **ElevenLabs voice (you asked for it): not generated.** The session’s credential proxy is configured for host `apilelevenlabs.io` (typo) — calls to the real `api.elevenlabs.io` return 401 “no xi-api-key”. Fix the connector host (claude.ai → Customize → Connectors) and start a new session, or run `ELEVENLABS_API_KEY=… python tools/make_voice_elevenlabs.py --audition` locally. The script is written but **untested**. Until then the video uses the local Kokoro voices as a **placeholder**.
2. **Voice naturalness and the mix by ear: not checked.** I cannot listen. Only objective checks exist (speech intelligibility: pocketsphinx recognised the English phrase correctly in both takes; pitch-range comparison used to choose between candidate voices). Kokoro’s Spanish is Latin-American phonemes (seseo) but **not a native Mexican accent**. A phone-speaker *simulation* (`audio/mix_phone_sim.wav`, band-limited + saturation) and a mono file were generated, not a real device test. Please listen on headphones and a phone before approving.
3. **IPA not verified against Oxford Learner’s Dictionaries** — the site is blocked by this environment’s network policy. Transcriptions used (American English): I’d /aɪd/, like /laɪk/, to /tə/ (weak form, as in connected speech; strong form /tu/), learn /lɜːrn/, English /ˈɪŋɡlɪʃ/. These match my knowledge of the OLD US style but **need your/our check against OLD**. They are per-word citation forms, not an Oxford quotation of the whole sentence.
4. Platform UI zones (top ≈230 px, bottom ≈360 px, right edge) are standard approximations, not measured from the live apps.
5. The animation is a CSS/SVG illustration style: expressive but simpler than hand-animated film.
