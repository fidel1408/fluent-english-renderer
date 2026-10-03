---
name: video-production
description: Build, re-time, render and QA Fluent English vertical social videos (1080x1920 H.264/AAC MP4) with the marketing_oct03_v2 pipeline, using supplied narration files. Use for I agree, Actually/Currently, Looking forward to, and similar short tips.
---

# Video production (Fluent English)

Standing rules are in `CLAUDE.md`: Sonnet 5.5 only, Medium default (High for hard design/debugging or final QA, Fast off),
ElevenLabs only for short marketing/social videos via supplied files, never for long grammar/Speaking Club lessons.

## Pipeline (`marketing_oct03_v2/`)
- `manifest/<video>.cues.json`: narration cues (`text` is exactly what is spoken, optional `caption`), planned `est` seconds and `gap` pauses.
- `src/timelines/<video>.js`: every visual/SFX moment is keyed to cue times. `src/videos/<video>.js`: pure `draw(c, t, cues, K)`.
- Audio input: `audio/cues/<video>_cNN.wav|mp3`, one file per cue, speech only. Never speed up, trim or cut narration.
- Commands (from the folder):
  - `node build/retime.js <video>`: measure the real files, recompute cue times AND total duration (length follows natural speech).
  - `node build/render.js <video>`: deterministic frames -> H.264 High yuv420p, AAC 48 kHz, faststart. Output name is `*_PREVIEW_audio-pending.mp4` unless every cue file is present, then `*_narrated.mp4`.
  - `node build/captions.js <video> out/<prefix>`: SRT/VTT from the active manifest (planned timing until retimed).
  - `node build/verify.js out/<file>.mp4 <video>`: ffprobe, full decode, faststart, clipping, narration-above-SFX per cue.
  - `node build/align_split.js <video> audio/originals/<master>.mp3`: for a continuous narration master, find speech islands, split only inside silences into cue WAVs, prove no speech was lost, write `manifest/<video>.alignment.json`.
  - `node build/verify_sync.js out/<file>.mp4 <video>`: cue-vs-MP4 cross-correlation, burned-caption presence, loudness. Evidence only, not a listening test.
  - `node build/stills.js <video> <dir> t1 t2 ...`: PNG stills from the same renderer for visual review.
- Logo: draw the original `assets/logo/fluent_english_logo_white.png` (crop transparent margin only). Never redraw or recolor it.
- Palette: navy #101E34, cream #FFF7EB, mint #72D8C6, teal #0D625F, coral #F47558. Social UI reserve: right 140 px, bottom 420 px, top 200 px.
- CTA text is only: "Clases en línea; manda GRUPO por mensaje privado." No prices, testimonials or guarantees.

## Final-delivery QA (all required before calling anything final)
1. `verify.js` passes (dimensions, fps, duration, AAC, faststart, full decode, no clipping, narration audible in every cue window).
2. Representative frames extracted from the encoded MP4 at every scene change and the final static CTA hold.
3. Captions checked against real speech timing (SRT generated after `retime`).
4. A genuine listening pass (pronunciation, completeness, no cut-off words, SFX quieter than speech). ffprobe is not a listening check.
5. Report which checks were not done. Keep PREVIEW status until narration and QA pass.
