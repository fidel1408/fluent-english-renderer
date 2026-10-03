# marketing_oct03_v2 – Fluent English code-built social videos

New, isolated output folder. Nothing outside this folder was modified (the 30 s `video/` project and the published artifact are untouched).

## Status (truthful)

| Item | Status |
|---|---|
| Video 1 – I AGREE, 20 s, 1080×1920, 30 fps | **Rendered** (`out/i_agree_oct03_v2_PREVIEW_audio-pending.mp4`) |
| Narration | **Pending.** Waiting for supplied licensed WAV/MP3 files (see `audio/cues/README.md`). No browser/system speech is used. |
| Audio in the preview MP4 | Original synthesized SFX only (peak about −20 dBFS, ducked 9 dB under planned narration windows). |
| Captions | `out/*_PLANNED-TIMING_captions.srt/.vtt` follow *planned* windows and are re-timed from real audio after `retime`. |
| Publish-ready | **No.** Preview only until narrated render + human listen + frame review. |
| Videos 2 and 3 | Not started (brief orders them after video 1 is verified with audio). |

### ElevenLabs findings (read-only, nothing sent, no credentials touched)
No ElevenLabs tool, MCP server or credential variable exists in this Claude Code session. The only trace is a session note naming the host `apilelevenlabs.io`, which is not ElevenLabs' API domain (`api.elevenlabs.io`). Requests to an unverifiable host would carry whatever the proxy injects, so none were made. Balance, plan, commercial rights and voice/model licence were therefore **not verified here**; narration comes from files you supply.

## Build (Node 20+, ffmpeg with libx264/aac, Playwright Chromium)
```
node build/retime.js i_agree          # after narration files are in audio/cues/ (optional for preview)
node build/render.js i_agree          # -> out/*.mp4 ; name is *_PREVIEW_audio-pending.mp4 unless all 9 cues are present
node build/captions.js i_agree out/i_agree_captions
node build/verify.js out/<file>.mp4   # technical QA json in qa/
node build/stills.js i_agree qa/stills 1.2 4.3 18.5   # PNG stills from the same renderer
```
`PLAYWRIGHT_PATH` can point at another Playwright install. Output spec: H.264 High, yuv420p, bt709, 1080×1920, 30 fps, AAC 48 kHz stereo 192 kb/s, `+faststart`.

## Layout
`src/engine.js` shared vector engine · `src/videos/i_agree.js` scene timeline (pure function of time) · `manifest/i_agree.cues.json` cues, scene windows, SFX events · `assets/logo/fluent_english_logo_white.png` original logo, byte-identical to the repo file (SHA256.txt; drawn by cropping its transparent margin, never redrawn) · `assets/fonts` Fredoka (SIL OFL) · `build/` pipeline.

Logo note: no file named `approved_logo.png` exists in this environment. The attached image matches `fluent_english_logo_white.png` (white wordmark, 1.2 % RMSE only from WebP compression), which is the file used.

## Verified on the preview MP4 (see `qa/`)
ffprobe: h264 High, yuv420p, 1080×1920, 30/1 fps, 600 frames, 20.000 s, AAC 48 kHz stereo, moov before mdat. Full decode of video+audio with no errors. Frames reviewed from the encoded MP4 at 1 s intervals and at 0.15 s steps around the *am* removal and every scene change. Audio contract tested in a scratch copy with synthetic tones (mixed WAV/MP3, mono/stereo, 24/44.1 kHz): retime, mix, render and verify all work, and a silent cue file correctly fails the audibility check. Those tone files are not in this folder.
