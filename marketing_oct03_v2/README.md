# marketing_oct03_v2: Fluent English code-built social videos

Isolated output folder. The 30 s `video/` project and the published artifact are untouched.
Standing rules (Sonnet 5.5 only, ElevenLabs only for short social videos via supplied files, never for long lessons) are in `/CLAUDE.md` and `/.claude/skills/video-production/SKILL.md`.

## Status (truthful)

| Tip | Length | File | Status |
|---|---|---|---|
| I AGREE (REV3, single host) | 27.6 s | `out/i_agree_oct03_v2_REV3_single-host_narrated_QA-pending.mp4` | **Narrated, QA-pending. NOT final, NOT publish-ready. Nobody has listened.** |
| ACTUALLY / CURRENTLY (REV3, single host) | 31.1 s | `out/actually_currently_oct03_v2_REV3_single-host_narrated_QA-pending.mp4` | **Narrated, QA-pending. NOT final, NOT publish-ready. Nobody has listened.** |
| LOOKING FORWARD TO (REV3, single host) | 28.3 s | `out/looking_forward_to_oct03_v2_REV3_single-host_narrated_QA-pending.mp4` | **Narrated, QA-pending. NOT final, NOT publish-ready. Nobody has listened.** |
| Earlier versions | | `out/*REV2*`, `out/*FINAL-CANDIDATE*`, `out/*PREVIEW_audio-pending*` | Preserved unchanged (older, two-avatar design or silent) |

Full evidence, source-to-final edit maps and the list of checks NOT done: `qa/REV3_verification_report.md`.

### REV3: one adult male host, three tips
Replaces the two small avatars with ONE clearly adult male host (`src/host.js`) for the supplied Luis voice; mouth only inside measured speech islands; he models quoted dialogue lines; scene content is drawn through a scaled group (`KIT.content`) so his head, shoulders and torso stay visible above the caption bar. New narrations for Actually/Currently and Looking forward to are cut at the handoff's explicit sample partitions (`build/partition_split.js`, bit-exact coverage proof, no fades/stretch). Burned captions now use the same text as SRT/VTT (`caption || text`).

### REV2 changes (one bundled revision; audio cuts, narration, timeline, SFX levels, teaching content and CTA unchanged)
1. Casting: the right male character is the single educator for all speech; the left woman is a silent listener (closed mouth, raised brows). The opening bubble tail points to the man. His mouth is driven only by the measured speech islands (not padding or whole cue windows).
2. Labels: `EVITA ESTA FRASE` reaches full strength before the phrase text; `QUITA AM` (neutral) while "am" is being removed; `DI ASÍ` exactly when only the correct phrase remains (5.62 s). Label pop never starts below 85 % scale.
3. The departing "am" travels inside the card (clipped to it); dust is clipped too, so nothing can cross the label.
4. The example card finishes growing (12.12 s) before "with you." appears; all card content is clipped to the card.
5. Other two tips (source only, not re-rendered): same single-educator/silent-listener rule; missing opening ¿ added to the Actually/Currently hook card.

### I AGREE narrated candidate: how it was made
- Narration: the owner-supplied ElevenLabs **take 1** (`audio/originals/`, byte-identical to the upload, SHA256SUMS.txt). Take 2 is preserved untouched; nobody has listened to either, so take 1 was chosen only because it was requested (slower).
- No browser speech, no new generation, no music. Only quiet original synthesized SFX (peak -20 dBFS, ducked 9 dB under speech).
- The master is one continuous recording. `build/align_split.js` found 15 speech islands from the waveform (pause structure), grouped them into the nine known phrases, and cut **only inside silences** (<= 0.18 s padding, 8 ms fades) into `audio/cues/i_agree_c01..c09.wav`. Proof in `manifest/i_agree.alignment.json`: all 562,852 speech samples are reproduced bit-exactly; no word was cut.
- Alignment is **phrase-level from the real waveform**. No speech-recognition/forced-alignment model was available offline, so word-level timing and the actual spoken content are NOT verified. Two measured marks drive animation: start of the phrase "I am agree" (a real pause after "Evita:") and start of "aquí no necesitas am" (the real pause after the semicolon). Everything else is keyed to phrase start/end.
- Pauses between phrases were lengthened (silence added) so the corrections and reading text have time: lead 0.5 s, gaps 0.3-1.3 s, 3.5 s end hold. Natural speech speed is untouched. Total 27.6 s.

### Evidence from the encoded MP4 (`qa/`)
- (REV2 and previous candidate share these numbers) ffprobe: H.264 High yuv420p bt709, 1080x1920, 30/1 fps, 828 frames, AAC LC 48 kHz stereo, 27.600 s, moov before mdat; full decode with no errors.
- `verify_sync.js`: narration of all nine cues correlates 0.989-1.000 with the decoded MP4 audio at a uniform +5 ms lag; burned captions are present at every cue midpoint (5,137-22,323 cream-text pixels) and absent in every gap and in the final hold.
- Levels: integrated -17.2 LUFS, LRA 4.4 LU, true peak -4.2 dBTP (mono master was -16.8 LUFS / -1.2 dBTP; the stereo upmix lowers it ~3 dB). No clipping.
- Representative encoded frames at each cue midpoint, the "am" removal, the correction flip, the CTA entrance and the final hold were reviewed.

### Remaining QA (not done)
1. **Human listening**: pronunciation of every word (especially English "I am agree / I agree / I agree with you"), emotion, that the words match the script, SFX balance, and that no syllable is clipped at the cue edges.
2. Confirm take 1 vs take 2 by ear (take 2 was only checked for structure).
3. Word-level caption/animation timing by ear (only phrase-level was measured).
4. Real-time playback on a phone; native-speaker read of on-screen copy; platform safe-zone check in the target app.
5. ElevenLabs plan/licensing is the owner's to confirm; not verifiable here.

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
`build/align_split.js` master-narration aligner/splitter · `build/verify_sync.js` sync/caption/level evidence · `audio/originals` preserved takes.
`src/engine.js`, `src/kit.js` shared vector engine and scene pieces · `src/timelines/` cue-driven timing + SFX events · `src/videos/` scenes · `manifest/<video>.cues.json` cues, gaps, estimates · `assets/logo` original logo (byte-identical to the repo file, SHA256.txt; margin cropped, never redrawn) · `assets/fonts` Fredoka (SIL OFL) · `build/` pipeline · `qa/` verify reports.
Logo note: no `approved_logo.png` exists here; the attached image matches `fluent_english_logo_white.png`, which is used.
Facts shown on screen: only the lesson content from the brief and the CTA "Clases en línea; manda GRUPO por mensaje privado". The practice prompts are deliberately left unanswered.
