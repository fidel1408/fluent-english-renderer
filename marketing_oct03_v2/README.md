# marketing_oct03_v2: Fluent English code-built social videos

Isolated output folder. The 30 s `video/` project and the published artifact are untouched.
Standing rules (Sonnet 5.5 only, ElevenLabs only for short social videos via supplied files, never for long lessons) are in `/CLAUDE.md` and `/.claude/skills/video-production/SKILL.md`.

## Status (truthful)

| Video | Planned length | Rendered file | Status |
|---|---|---|---|
| I AGREE | 28.4 s (estimates) | `out/i_agree_oct03_v2_PREVIEW_audio-pending.mp4` | **PREVIEW, narration pending** |
| ACTUALLY / CURRENTLY | 31.1 s | `out/actually_currently_oct03_v2_PREVIEW_audio-pending.mp4` | **PREVIEW, narration pending** |
| LOOKING FORWARD TO | 30.0 s | `out/looking_forward_to_oct03_v2_PREVIEW_audio-pending.mp4` | **PREVIEW, narration pending** |

None of these is final or publish-ready. They contain picture, planned captions and original synthesized SFX only (peak about -20 dBFS, ducked 9 dB under the planned narration windows). No speech of any kind, and no browser/system speech.
Lengths are **estimates**: the real length is last narration end + static hold, computed from the supplied files.

## How timing now works (audio-first)
Cue times are not fixed. `start = previous end + gap`, `end = start + real audio duration`. Every animation, caption and SFX is keyed to those times
(`src/timelines/<video>.js`). `node build/retime.js <video>` measures the supplied files and rewrites cue times and total duration. Nothing is sped up, trimmed or cut.
Videos longer or shorter than the target (I AGREE 25-30 s, the other two about 28-34 s) get a printed warning only; pacing is reviewed with the owner, not forced.
Tested in a scratch copy: with c04 = 5.2 s and c09 = 4.8 s of audio, I AGREE re-timed itself to 32.2 s with all cues intact and flagged the target overrun.

## Supplying narration
`audio/cues/<video>.README.md` lists the exact file names and the exact text to read for each video (nine, nine and eight cues). Then:
```
node build/retime.js i_agree          # also actually_currently, looking_forward_to
node build/render.js i_agree          # -> out/i_agree_oct03_v2_narrated.mp4 once all cues exist
node build/captions.js i_agree out/i_agree_oct03_v2_captions   # captions from real timing
node build/verify.js out/i_agree_oct03_v2_narrated.mp4 i_agree
```
Requirements: Node 20+, ffmpeg (libx264, aac), Playwright Chromium (`PLAYWRIGHT_PATH` to override). Output: H.264 High yuv420p bt709, 1080x1920, 30 fps, AAC 48 kHz stereo, faststart.

## Checks done on the three previews (from the encoded MP4s)
ffprobe: h264/High/yuv420p, 1080x1920, 30/1 fps, exact frame counts (852 / 933 / 900), AAC 48 kHz stereo, moov before mdat. Full ffmpeg decode of video+audio with no errors.
Frames extracted from the encoded files at 2 s steps and around every transition were reviewed (I AGREE also at 0.15 s steps around the "am" removal). Peak levels -20 dBFS.
Audio contract (WAV/MP3, mono/stereo, mixed sample rates) tested with synthetic tones in scratch copies: retime, mix, render and verify work, and a silent cue file is rejected. Those tones are not in this folder.

## NOT done (disclosed)
- No real narration exists yet, so there was **no listening check** (pronunciation, completeness, SFX balance against speech) and no caption sync check against real speech.
- ElevenLabs was not used or verified in this environment (no tool, key or verified host; the session note names `apilelevenlabs.io`, which is not ElevenLabs' API domain). Balance and licence are for the owner's web account.
- SFX were checked by level only; I cannot listen to audio here.
- Visual review was by representative frames, not a real-time playback on a phone.
- Spanish/English copy was written from the brief; a native-speaker read of on-screen text is still advised.

## Layout
`src/engine.js`, `src/kit.js` shared vector engine and scene pieces · `src/timelines/` cue-driven timing + SFX events · `src/videos/` scenes · `manifest/<video>.cues.json` cues, gaps, estimates · `assets/logo` original logo (byte-identical to the repo file, SHA256.txt; margin cropped, never redrawn) · `assets/fonts` Fredoka (SIL OFL) · `build/` pipeline · `qa/` verify reports.
Logo note: no `approved_logo.png` exists here; the attached image matches `fluent_english_logo_white.png`, which is used.
Facts shown on screen: only the lesson content from the brief and the CTA "Clases en línea; manda GRUPO por mensaje privado". The practice prompts are deliberately left unanswered.
