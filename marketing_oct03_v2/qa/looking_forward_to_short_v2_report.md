# Looking forward to — SHORT v2 (QA-pending) — factual report, 2026-10-06

Status: **PREVIEW / QA-pending.** Not published, scheduled or sent anywhere. No genuine listening pass and no full AV review were done.

File: `out/looking_forward_to_oct06_SHORT_v2_QA-pending.mp4`
SHA256 `f65d8d78c6c1dd1b631a0d7e5106558922b59b645074aba171a524192234be5d`; 1,835,462 bytes.
H.264 High yuv420p, 1080x1920, 30 fps, 330 frames, 11.000 s; AAC 48 kHz 2ch; faststart; clean full decode.

## What changed vs v1 (text/layout only)
- "Tu primera semana de inglés GRATIS" is in a persistent offer card from frame 0 (large type, coral GRATIS pill).
- "Solo pagas si decides continuar." fades in at 1.3 s inside the same card.
- The English example "I'm looking forward to seeing you." and the Spanish meaning "Tengo muchas ganas de verte." sit in the lesson card under the offer from ~1.9 s (English from the start).
- Every GRUPO CTA is replaced with "Escríbenos SEMANA GRATIS". Because the offer card grows once the lesson leaves, it appears in the final card only. There is no early CTA, since there was no room without crowding.
- The final offer + CTA card is held to the end of the clip (holds check below).
- Four-week payment terms are NOT on screen; leave them to the post caption. No fifth week is implied; the forbidden-string audit rejects "quinta", "5 semanas", "extra" and similar.

## Unchanged (measured)
- Mix WAV SHA256 is identical to v1: `37d64178…f0d`.
- Decoded AAC PCM SHA256 is identical for v1 and v2: `acb67a0d2a49d7a90e425230a3dda22b2630b22d2f33f52cbb033bf0404c7399`.
- Same cue WAVs, timing, mixGainDb (+1.3 dB) and SFX list; same logo and host. No TTS, no new ElevenLabs calls, no credits used.
- v1 MP4 SHA256 is still `bb9b36f6e5f0e580d29cb316ed3953e80fc030266bf4fbcc9fa338f51261775c`. Every previously locked MP4/WAV/MP3 hash matches the pre-task lock.

## Automated checks on the encoded file (all pass)
- verify: format, duration 11.0 s, no clipping (peak -5.2 dBFS), narration audible in every cue.
- sync and levels: pass. Captions: 2 cues (0.469–1.942 s and 4.569–6.042 s), matching the narration islands.
- mouth: 2 islands; 79/79 open frames inside the islands, 0 outside; one speaking mouth only.
- holds (encoded): pass.
- text audit over 330 frames: pass. 13 strings were measured, with no overlaps and no forbidden strings. Minimum effective type is **12.9 px at 270x480**, slightly under the ~13 px target. This is the smallest text, a secondary line, and is noted as a residual risk.
- caption reserve (x100–860, y180–1420): pass.
- Frames viewed by me: 0, 0.5, 1, 1.5, 2, 2.5, 2.95, 5, 6.7–7.6, 8.5, 10.5 (crop) and 10.9 s. The offer is fully legible from frame 0 and the first three seconds read cleanly.

## Not done
- Real listening pass; full AV review on a phone; platform preview.
