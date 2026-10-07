# FE261007_FORWARD_HAIKU_offer_v1 — QA report (7 Oct 2026)

Status: **QA-pending preview.** Not published, scheduled or sent. Listening and full audio-visual review were NOT performed; all checks below are automated or frame-level visual inspection of decoded frames.

## Files
- MP4: `out/FE261007_FORWARD_HAIKU_offer_v1_QA-pending.mp4` — 1080x1920, H.264 High, 30 fps, 873 frames, 29.100 s, AAC 48 kHz stereo, 4.43 MB.
  SHA256 `df1218a51d8e9ad335843e1790fa98f7c6409c0e40bd2f099c04902b52cfd6f4`
- Captions: `..._captions.srt` / `.vtt` (8 cues, same timing as REV4).
- First frame (0 s): `dist/FE261007_FORWARD_HAIKU_offer_v1_package/first_frame_0s.png`
- 360-px phone preview: `dist/.../phone360_preview.mp4` (SHA256 `35ec7e87…3b3b`)
- Post caption with the four-week terms: `dist/.../post_caption_es.txt` (SHA256 `7deec19a…cf41`)
- Source package: `dist/FE261007_FORWARD_HAIKU_offer_v1_package.zip`

## Audio preservation (measured)
- Decoded AAC PCM (s16le, 48 kHz, stereo) of the new MP4 is byte-identical to the REV4 original: SHA256 `f3b7ed12f05525add2e15edb18c3a37ceb163a8c931eb8759c031ec9de7a26c3` for both.
- The cue manifest is identical to REV4 (`cues` array equal; duration 29.1 s). The same eight existing ElevenLabs cue WAVs (`audio/cues/looking_forward_to_c01…c08.wav`) and the same SFX list are used. No TTS, no new narration, no credits.
- Note: the seven REV4 sound effects tied to the old calendar and hook-exit moments (3.5, 4.1, 4.2, 4.6, 5.6, 6.4 and 8.9 s) were kept exactly, as required. They now land on the lesson card, which has no visual change at those moments. This is a known audio/visual mismatch in the sound effects; the owner can decide later whether to re-time them.
- Audio levels: integrated −18.1 LUFS, true peak −3.6 dBTP, no clipping, narration audible in all 8 cue windows.
- Original master, REV4 MP4, SHORT v1/v2/v3 MP4s and all previously locked media hashes: unchanged (151 locked files compared, 0 changed).

## Content and layout (what is on screen)
- **0 s (frame 0):** offer card "Tu primera semana de inglés GRATIS" with "Solo pagas si decides continuar." and the lesson card "I’m looking forward to seeing you." / "Tengo muchas ganas de verte." — all at full opacity from the first frame, no fade-in. Logo top-left, host present.
- **0–9 s:** offer card stays. Lesson card shows the English example and Spanish meaning.
- **9.25–16.2 s:** rule state: "look forward to" / "+ verbo en -ing" / "I’m looking forward to" / "seeing you." (highlight on "seeing you.").
- **16.8–19.7 s:** noun state: "look forward to" / "+ sustantivo" / "I’m looking forward to" / "the weekend." (highlight).
- **20.35–24.8 s:** practice: "I’m looking forward to ____" with "¿Cómo la completas?".
- **25.06–29.1 s:** CTA hold (≈4 s): fixed card with "Escríbenos" and coral pill "SEMANA GRATIS"; logo below. Offer card stays above.
- The four-week payment terms are NOT on screen; they are in the post caption only. No "fifth week", "extra week", or unconditional free week is shown or implied.

## Automated checks (all pass)
- **Text audit** (every frame, 873 frames): all required strings present at full opacity in their windows; no overlaps; no forbidden strings (GRUPO, Manda, mensaje privado, Clases en línea, CLUB, prices, "extra", "quinta" etc.); exactly one CTA, first shown at 25.06 s, "SEMANA GRATIS" never shown earlier. Minimum effective type at 270x480 = **12.9 px** (the same 60-px secondary line limit used in the earlier shorts; this is slightly under the ~13 px target and is a residual risk).
- **Caption reserve** (encoded, 53 samples): inside x100–860 / y180–1420; text bounds x 102–858, bottom 1398.8. Required `capFit: true` on the cues (visual only) — the first render without it overflowed to x 904 and y 1455 and was fixed before this report.
- **Holds** (encoded): offer card 29.1 s stationary; lesson example 8.47 s stationary; closing CTA 3.53 s stationary (min 3 s).
- **Mouth ownership**: one adult host; 12 speech islands, 425/425 open-mouth frames inside islands, 0 outside, 0 for the second character.
- **Sync / captions**: all eight cues in place; narration not cut off (last cue ends 24.94 s); captions match cue islands.
- **Container**: H.264 High yuv420p, 30 fps, 873 frames, faststart, clean full decode.

## Visual inspection
- Viewed contact sheets of 14 decoded frames: 0, 1.5, 2.9, 9.0, 9.5, 16.4, 16.7, 19.9, 20.25, 20.6, 25.0, 25.4, 27.0, 29.0 s.
- Confirmed: frame 0 offer and English/Spanish; condition visible through the first 3 s; each lesson state readable; the CTA pill sits fully inside the fixed CTA card; final hold readable.
- Known visual gaps: between states the lesson card is briefly empty (about 0.3 s around 20.0–20.3 s). The pill containment was verified by fixed card geometry and the contact sheet only; no pixel-level containment scan was run on this version.

## Not done / limits
- No listening pass. No full audio-visual review on a real phone or in a platform preview.
- No claim about enrolment or conversion impact.
- No publishing, scheduling, account or PR changes. No other videos changed.
