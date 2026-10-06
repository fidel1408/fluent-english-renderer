# Looking forward to — SHORT v3 (QA-pending) — factual report, 2026-10-06

Status: **PREVIEW / QA-pending.** Not published, scheduled or sent anywhere. No genuine listening pass and no full AV review were done.

File: `out/looking_forward_to_oct06_SHORT_v3_QA-pending.mp4`
SHA256 `9a4e07bd6474159683e7617278de95bfd0248f2695f6516a6fcaf17e81e6320b`.
H.264 High yuv420p, 1080x1920, 30 fps, 330 frames, 11.000 s; AAC 48 kHz 2ch.

## The fix (only change vs v2)
In v2 the "Escríbenos / SEMANA GRATIS" row started fading in while the offer card was still growing, so the pill extended below the card bottom (around 7.23–7.33 s).
In v3 the CTA row (divider, "Escríbenos", "SEMANA GRATIS" pill) is drawn only after the card has finished growing (u = 1, at 7.54 s), then fades in over 0.2 s. It is therefore always inside the card.
Side effects: the CTA is fully visible from 7.74 s instead of ~7.6 s, and the final hold is 3.17 s (planned from 7.84 s; minimum 3.0 s: OK). The required-string and hold windows in the v3 timeline were moved by +0.2 s accordingly.
The scene source is `src/videos/looking_forward_to_short_v3.js`; the timeline is `src/timelines/looking_forward_to_short_v3.js`.

## Encoded-frame containment check, 6.7–7.933 s (38 frames; `qa/looking_forward_to_short_v3_transition_containment_6.7-7.9.json`)
Method: on each decoded frame, the card's bottom stroke is located on its straight section (x≈200), then the band 3–30 px below the card bottom is scanned across the CTA columns (x 330–750) for the coral pill colour.
- Control (v2): coral below the card in 2 frames, 30 px at 7.267 s and 19 px at 7.300 s. The 7.300 s value matches the reported ~20 px, so the check can see the defect.
- v3: 0 coral pixels below the card in all 38 frames.
- Viewed v3 frames 7.2, 7.3, 7.5 and 7.7 s: the card is empty below the condition until the CTA fades in inside the finished card.
- Limits: this is a colour-band detector for the pill, not a general geometry proof. The band is 30 px, and a pill protrusion beyond 30 px would have been flagged at its first 30 px.

## Unchanged (measured)
- Decoded audio PCM SHA256 is identical for v1, v2 and v3: `acb67a0d2a49d7a90e425230a3dda22b2630b22d2f33f52cbb033bf0404c7399`; mix WAV `37d64178…` is identical for v2 and v3. Same cue WAVs, timing, mix gain and SFX list. No TTS, no new narration, no credits used.
- Duration 11.000 s; captions (SRT) are byte-identical to v2.
- Frames before 6.7 s differ from v2 only by encoder noise (mean luma difference 0.005/255 over those frames, max 0.09). The first-frame offer, the lesson, the condition, the logo and the host are unchanged.
- v1 MP4 (`bb9b36f6…775c`) and v2 MP4 (`f65d8d78…be5d`) are unchanged. Every previously locked MP4, WAV and MP3 still matches its earlier hash.

## Automated checks on the v3 file (all pass)
verify (format, no clipping, narration audible in every cue), sync and levels, mouth (single speaking mouth, inside islands), holds (lesson card 4.8 s, closing offer/CTA 3.17 s), caption reserve, and the text audit over 330 frames: no overlaps, no forbidden strings, "Tu primera semana de inglés GRATIS" present at full opacity in every frame from 0 s. Minimum effective type is still **12.9 px at 270x480**, slightly under the ~13 px target (same secondary line as v2).
Viewed first-three-second frames at 0, 1, 2 and 2.97 s, plus the final frame at 10.9 s: the offer is legible from frame 0, and the final card shows the headline, condition, "Escríbenos" and the "SEMANA GRATIS" pill with clear margins.

## Not done
Real listening pass; full AV review on a phone; platform preview.
