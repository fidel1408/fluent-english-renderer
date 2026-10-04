# October batch 2 - METADATA_REV2 report (metadata/source packaging only)

**No MP4 was rendered, re-encoded or changed. No TTS/new narration, audio, pixel, timing, gain, scene, cue or original change. Status stays QA-pending; this is a QA-status snapshot, not a scheduling receipt.** Creator work: Claude Code, Sonnet 5.5, High, Fast off. The independent review below was performed by an external reviewer (not by this assistant) and is recorded as supplied.

## Before/after media hash proof (SHA256)
| File | Before (locked) | After | Result |
|---|---|---|---|
| `out/FE261019-CLARIFY_batch2_single-host_narrated_QA-pending.mp4` | eda56cf5a4f75ce068e7f5372248e6644dbcc4776599366cf0d77c5f25fc4504 | eda56cf5a4f75ce068e7f5372248e6644dbcc4776599366cf0d77c5f25fc4504 | UNCHANGED |
| `out/FE261021-MORE_batch2_single-host_narrated_QA-pending.mp4` | 1dd02ceccf8347fb394ba1ec4c7b8341ac927cd7bb743d6ef7a1a9cb419acd3a | 1dd02ceccf8347fb394ba1ec4c7b8341ac927cd7bb743d6ef7a1a9cb419acd3a | UNCHANGED |
| `out/FE261023-PRIVATE_batch2_single-host_narrated_QA-pending.mp4` | a6cd1e900c7896f060eeb57d797fbab0b02b3e4e48135c60934605086b3845a4 | a6cd1e900c7896f060eeb57d797fbab0b02b3e4e48135c60934605086b3845a4 | UNCHANGED |

Originals and cue WAVs of this batch: 32 files re-hashed against the pre-edit lock: ALL UNCHANGED. Across the whole project all 151 MP4/audio files (every historical MP4, original MP3, cue WAV) have identical hashes before and after (`qa/METADATA_REV2_before_after_media_audio_hashes.txt`). Cue timings, gaps, edit maps and mix gains are unchanged (maps byte-identical to the scratch re-run).

## Exactly what changed (metadata/report paths only)
- `manifest/{clarify_deadline,tell_me_more,private_company}.alignment.json`, `.cues.json`, `.cues.retimed.json` (9 files): `confidence.wordLevel` no longer cites the previous batch's CanHave por/for example. Clarify now states its OWN unresolved item (por vs ASR "for", source ~14.2-15.2 s = final ~16.55-17.55 s, caption exactness PROVISIONAL, code-switch bias possible, not cleared); More/Private state automated normalized content agreement only (50/50, 44/44 script words) with ASR uncertainty and no hearing. Clarify's cue `captionStatus` (PROVISIONAL) is unchanged.
- `build/batch2_manifests.js`: the generator now takes the per-video `wordLevel` text (no inherited CanHave string); a scratch re-run reproduced all six batch2/3 alignment/cues manifests, every cue WAV and every source-to-final map byte-identically (retimed manifests differ only in the pre-existing absolute `_file` path).
- `src/timelines/clarify_deadline.js`: ONLY the `K.holds` bookkeeping: `practice_unanswered` -> `practice_unanswered_full_blank` counted from the complete visible blank (underline grown and "?" shown) at final 19.233 s (frame 577), plus an informational `practice_text_only_stable` entry from the 19.066 s text-only entry. Proven: every other key of `K` and the whole SFX list are identical to the previous file (render path untouched; the MP4 was not re-rendered).
- `qa/clarify_deadline_holds_encoded.json`: re-measured on the EXISTING MP4: full blank settled 3.03 s (19.23-22.25 s; the independent review measured 3.033 s, frames 577-667); text-only region stable 3.2 s; complete post-question window 3.37 s. Requirement 3 s: met.
- `qa/batch2_verification_report.md` (historical, marked SUPERSEDED), `qa/batch2_METADATA_REV2_report.md` (this report), `manifest/final_inputs/*` (supplied brief, index and independent reports), `README.md`.

## Independent review results (external, supplied)
- Visual: PASS within documented coverage (498 distinct whole encoded frames - Clarify 164, More 186, Private 148 - 26 native caption crops, 11 full native stills; all 2,892 frames decoded without errors; decoding is not human inspection of every frame). No required media correction.
- Technical/audio: PASS for format, decode, faststart, original/cue/sample identity, final audio placement and levels: Clarify -17.5 LUFS / -4.2 dBTP (min cue correlation 0.998774), More -17.6 / -5.2 (0.999310), Private -17.5 / -4.4 (0.999614); every cue delay +4.979 ms, no drift; all six originals byte-identical; every decoded sample once in contiguous partitions.
- Clarify practice: complete blank first fully settled at frame 577 / 19.233 s, last 22.233 s = 91 frames = 3.033 s (passes 3 s). More practice keeps 3.100 s after the spoken question. Clarify por/for (source 14.2-15.2 s = final 16.55049-17.55049 s, c07 offset +2.35049 s) remains UNRESOLVED/PROVISIONAL: unprompted ASR is not a hearing determination.
- Not claimed: no genuine listening, pronunciation/naturalness, full subjective AV, or universal native-app/disclosure pass; native-platform coverage is partial per video. The owner said the voice sounds good; that is owner feedback, not an assistant hearing audit. No IPA or character changes.

## Open gates (unchanged)
Genuine listening/full AV; native-app playback/overlay/cover checks; native-speaker copy read; AI-audio and own-brand disclosures (Instagram native AI disclosure held; Facebook/TikTok scheduling is managed separately and is not asserted here); Clarify's specific por/for word (final ~16.55-17.55 s) stays held and PROVISIONAL.
