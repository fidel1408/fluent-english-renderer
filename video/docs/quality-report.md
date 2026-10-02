# Quality report — “Pide tu café en inglés”

Date of checks: 2026-10-02. Everything below was actually run in this sandbox unless marked **PENDING**.

## Output file (ffprobe)
H.264 High, yuv420p, 1080×1920, 30/1 fps, **900 frames, 30.000 s**; AAC-LC 48 kHz stereo, 30.000 s; 8.7 MB. Selected appearance burned in (Captions + IPA); the page’s production controls are hidden in export mode (the MP4 has no interactive CC button).

## Audio (tools/verify-audio.py → docs/audio-report.json)
| Check | Result |
|---|---|
| Narration present and aligned to storyboard | 6 cues, start/end in `docs/narration-script.md` (generated from the measured WAVs) |
| Response pause | Narration stem level is digital silence 20.55–23.65 s (3.10 s); previous line ends 20.53 s |
| Voice vs. bed during speech (voice RMS − music/ambience/effects RMS) | +12.3, +15.0, +11.4, +16.5, +11.5, +10.1 dB (v1…v6) |
| Effects clear of speech | None of door chime / text-change / ice clink / your-turn / done chime / cup-place lands inside a spoken-word window |
| Loudness | −16.2 LUFS integrated, true peak −2.9 dBTP, LRA 2.8; decoded sample peak 0.01 dBFS |
| All layers inside the MP4 | After 5 ms alignment (limiter + codec delay), correlation 0.9976 with the reference mix; regression coefficients voice 2.43 / music 0.85 / ambience 2.01 / effects 2.47 (all > 0), R² 0.995 |
| Clean ending | Whole bed fades 29.55–30.0 s; last 0.2 s at −19 dB, closing accent starts 29.25 s after narration ends (29.12 s) |

Mix was iterated: the first render had only 2–8 dB voice margin and a +1.5 dBFS decoded peak; ambience gain, music ducking and the limiter were changed and the checks re-run.

## Preview behaviour (tools/test-preview.js, 19 checks, 0 failures)
Run in headless Chromium with a **stubbed** `speechSynthesis` (this sandbox has zero speech voices). Verified: nothing plays or speaks before Start; AudioContext running after Start; es-MX + local en-US voices chosen; opening Spanish line and English model spoken once each at the right times; pausing freezes the clock, cancels speech, stops all sources and the audio graph is digitally silent; double-Replay speaks the opening line exactly once, never more than one utterance active, and does not stack audio sources (779 → 784 live sources, i.e. identical schedule); music level changes independently of ambience/effects; starting at 20.0 s speaks nothing through the response pause; clean stop at the end; CC mode cycles and is remembered after reload.
**PENDING:** a run with real system voices on a real device (Chrome/Edge/Safari). Real voices will have different durations; the preview does not time-stretch them.

## Visuals
* Every one of the 900 frames was geometrically audited for the arm rig (`tools/pose-check.js`, `docs/pose-report-summary.json`): maximum upper-arm angle from vertical 62.8° (no raised “chicken-wing” elbows; the peak is the reach to the glass at 25.5 s), forearm/upper-arm lengths stay within rig limits, every hand is built with a palm, four fingers (three phalanges each) and a thumb (digit count is by construction, not a pixel check).
* About 60 distinct frames spanning all five scenes were inspected by eye (contact sheets). Problems found and fixed in that process: elbows flaring at rest, balloon sleeves, twig-like thumbs, a raised hand covering the barista’s face, the customer’s arm crossing his torso to grab the glass, glass hidden behind the torso, choice cards colliding with the phrase card, door out of frame.
* Poses: rest, walk-in swing, present-to-menu, offer, present-to-cards, reach, two-hand wrap grip on the glass (fingers across the front, elbows near the torso). Hands at rest look slightly stiff/claw-like up close — **polish pending** if you want a closer-up treatment.
* Safe margins: UI sits inside roughly 70 px left / 110 px right, below ~220 px at the top and above ~340 px at the bottom (captions end at ≈1,600 px). Captions overlap the lower torso/legs, never faces or hands in the sampled frames. No flashing; only a 0.3 s fade-in at the start.

## Teaching content
* Phrases exactly as briefed: “Could I have a coffee, please?”, “Could I have an iced latte, please?”, cards “a coffee / an iced latte / a tea”, template “Could I have ___, please?”. Articles preserved; no claim that other ordering phrases are wrong.
* **IPA — PENDING Oxford Learner’s Dictionaries verification.** The sandbox’s network policy blocks oxfordlearnersdictionaries.com, so I could not check it. Transcriptions used (General American): `/kʊd aɪ hæv ə ˈkɔːfi, pliːz/`, `/kʊd aɪ hæv ən aɪst ˈlɑːteɪ, pliːz/`, `/ə ˈkɔːfi/`, `/ən aɪst ˈlɑːteɪ/`, `/ə tiː/`. They agree with an independent cross-check against eSpeak NG’s en-US phonemes (kʊd aɪ hæv ɐ kˈɔfi · plˈiːz · ˈaɪst · lˈɑːteɪ · tˈiː), but that is not OLD. Please have someone confirm against OLD before publishing; the strings live in `src/config.js` (`FE.IPA`). Citation-form “have a” /hæv ə/ is kept for learners rather than the reduced /həvə/.
* The template line shows `/kʊd aɪ hæv ____ pliːz/` (blank kept visible, no IPA invented for the blank). No IPA is shown under Spanish text, punctuation or the logo.

## Voices
* MP4: flite `rms` (US English, slowed 30 %) and eSpeak NG `es-419`, post-processed (band-limit, light compression). “voz” is fed to the engine as “bos” so the Castilian-leaning rules do not say /boθ/ (display text unchanged). **I cannot listen to audio here: pronunciation, naturalness and pacing are verified only by measurement. A human listening pass is PENDING** — expect synthetic quality.
* eSpeak NG / flite are installed local engines (GPL / BSD-style); MBROLA voices were deliberately not used because their licence is non-commercial.

## Other notes
* Logo: authentic `fluent_english_logo_blue.png` from the repo (byte-identical to `fluent_english_logo.png`), drawn unmodified except for cropping its transparent margin at draw time. I did not byte-compare it with the three images attached to the request.
* Only “Clases en línea” is used (no platform named). No prices, offers, testimonials or guarantees.
* The preview was not exercised on a phone; layout is responsive CSS only.
