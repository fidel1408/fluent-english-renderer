# Looking forward to - SHORT v1 (11.0 s) - verification report

**QA-pending. Not final, not published, not scheduled. Nobody has listened; every check below is a measurement, not a hearing.**
File: `out/looking_forward_to_oct06_SHORT_v1_QA-pending.mp4` SHA256 bb9b36f6e5f0e580d29cb316ed3953e80fc030266bf4fbcc9fa338f51261775c. Captions: `out/looking_forward_to_oct06_SHORT_v1_captions.srt|vtt`.

## What it is
- Phrase on screen from frame 0: "I’m looking forward to seeing you." (card + burned caption at speech start 0.469 s); Spanish meaning "Tengo muchas ganas de verte." fades in by 2.3 s (inside the first 3 s); both complete with punctuation. Compact CTA "Clases en línea. Manda GRUPO por mensaje privado." appears at 1.3 s below the card (does not cover it), then the lesson card leaves and the same CTA card moves up and grows; closing CTA held 3.3 s (about 3 s requirement).
- Narration: ONLY the existing licensed ElevenLabs master (`audio/originals/elevenlabs_looking_forward_to_*.mp3`, unchanged). Existing cue c03 "I'm looking forward to seeing you." (exact existing sample partition 206847-290619) is played twice (second time = "listen again"; same samples, easily removable). No speed/pitch change, no fades, no new speech, no TTS, no new credits. The CTA and Spanish meaning are honest on-screen text (not spoken).
- NOT used: the existing Spanish tail "tengo muchas ganas de verte" (inside existing cue c01). Its measured final pitch contour rises (about 97 Hz -> 235 Hz over the last 0.15 s: question-like, inherited from "¿Cómo dices: ...?"), which would contradict the statement caption. A statement-intonation spoken Spanish line would be a missing line; none was generated. (Pitch contour is an automatic estimate, not hearing.)
- No prices, Zoom wording, start date, outcome promise or IPA. Original logo and host artwork reused; one adult host; mouth open only inside measured speech islands.

## Measured checks (encoded file)
- H.264 High yuv420p, 1080x1920, 30/1 fps, 330 frames = 11.0 s, AAC 48 kHz stereo, faststart, whole-file decode clean.
- Cuts: cue WAVs identical to existing cue samples (edge samples |x|<=11; 20 ms RMS around cut edges [-61.1, -63.8] / [-87.3, -87] dBFS = silence). Not a listening check.
- Sync: cue correlation c01 0.995, c02 0.999, uniform +5 ms; captions present at cue midpoints, absent in the gap.
- Level: -17.6 LUFS, true peak -5.2 dBTP, no clipping (final-mix +1.3 dB only; peak headroom is ample; originals/cue WAVs untouched).
- Mobile-safe layout: caption glyph bounds x 104.5-855.5, bottom y 1398.8 (reserve x100-860, y180-1420); encoded check: no caption pixels outside the reserve; smallest settled text 12.9 px at 270x480; lesson card settled 4.1 s; no text overlaps.
- Mouth: open in 79/79 island frames, 0 outside.
- Frames reviewed at 0, 0.5, 1, 1.5, 2, 2.5, 3 s and around the CTA move (6.7-7.9 s): sequential, no overlap, nothing covers the lesson.
- All 151 pre-existing MP4/audio files re-hashed: unchanged.

## NOT done
Genuine listening (including the repeat and the pitch of the English phrase), full AV playback, native-app overlay/cover checks, native-speaker copy read, AI-audio/own-brand disclosures. This is not a release approval; nothing was published or scheduled.
