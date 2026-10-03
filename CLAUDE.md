# Project guidance for Claude Code

This repository holds the Fluent English slide renderer (`src/`, Node/TypeScript) and code-built social videos
(`video/` = first 30 s browser draft, `marketing_oct03_v2/` = deterministic H.264 render pipeline).
Do not overwrite existing videos or published artifacts; new work goes in a new, clearly named folder.

## Standing video-production rules (apply to every video task)
- **All videos are produced through Claude Code, always on Sonnet 5.5.** Effort: Medium by default; High only for genuinely
  difficult design/debugging or final QA; Fast mode off. Never switch models (Opus or other) silently; ask first.
- **ElevenLabs is only for SHORT marketing/social videos**, only with the already-included plan credits, and only through
  files the owner supplies (WAV/MP3). Claude Code does not call ElevenLabs, create credentials, connect accounts, buy, upgrade or exceed credits.
- **Never use ElevenLabs for the long (about 60-minute) grammar or Speaking Club lessons.** Those need separately verified
  free, licensed audio and resumable, benchmarked segments. Do not start long-video jobs unless explicitly told to.
- Browser/system speech synthesis is a rehearsal aid only. It is never the final embedded voice.
- No new plugins, connections, credentials, permissions, purchases, PRs, merges or public sharing unless the owner asks.
- Be truthful about status. A file without real narration is a **PREVIEW (audio pending)**, never final or publish-ready.
  List every check that was not done (for example a real listening pass).

Details, commands and the QA checklist: `.claude/skills/video-production/SKILL.md`.
