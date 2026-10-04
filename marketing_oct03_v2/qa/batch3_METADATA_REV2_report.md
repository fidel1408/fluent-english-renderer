# October batch 3 - METADATA_REV2 report (metadata/source packaging only)

**No MP4 was rendered, re-encoded or changed. No TTS/new narration, audio, pixel, timing, gain, scene, cue or original change. Status stays QA-pending; this is a QA-status snapshot, not a scheduling receipt.** Creator work: Claude Code, Sonnet 5.5, High, Fast off. The independent review below was performed by an external reviewer (not by this assistant) and is recorded as supplied.

## Before/after media hash proof (SHA256)
| File | Before (locked) | After | Result |
|---|---|---|---|
| `out/FE261026-SINCEFOR_batch3_single-host_narrated_QA-pending.mp4` | 2111868a813c9d01bbe88396b9c16dd62f5c7502ca743c3ef68cf11351171c2f | 2111868a813c9d01bbe88396b9c16dd62f5c7502ca743c3ef68cf11351171c2f | UNCHANGED |
| `out/FE261028-USED_batch3_single-host_narrated_QA-pending.mp4` | 582b5220bd087ab42a2c8cdd2520d4fce337369f6185c4f095a54fbd92052346 | 582b5220bd087ab42a2c8cdd2520d4fce337369f6185c4f095a54fbd92052346 | UNCHANGED |
| `out/FE261030-TRIALFAQ_batch3_single-host_narrated_QA-pending.mp4` | 16b9f63876a09854f45fbc31f7119f6ff4ff00b32f181f636a470f74559a84fb | 16b9f63876a09854f45fbc31f7119f6ff4ff00b32f181f636a470f74559a84fb | UNCHANGED |

Originals and cue WAVs of this batch: 34 files re-hashed against the pre-edit lock: ALL UNCHANGED. Across the whole project all 151 MP4/audio files (every historical MP4, original MP3, cue WAV) have identical hashes before and after (`qa/METADATA_REV2_before_after_media_audio_hashes.txt`). Cue timings, gaps, edit maps and mix gains are unchanged (maps byte-identical to the scratch re-run).

## Exactly what changed (metadata/report paths only)
- `manifest/{since_for,used_to,trial_faq}.alignment.json`, `.cues.json`, `.cues.retimed.json` (9 files): `confidence.phraseBoundaries` now says ASR evidence was "supplied with batch 3, see manifest/batch3_inputs" (it wrongly said batch 2). `confidence.wordLevel` no longer imports the CanHave por/for text; it describes this batch's approximate ASR/waveform evidence: Since/For medium 49/49 (small joins "indica duración", omits the accent in "cuándo"; the spoken realization of "twenty twenty-four" and homophone spellings are ASR-spelling limits, not pronunciation findings); Used To take2 small and medium 52/52 (the incomplete "I used to..." practice is intentional); Trial FAQ take2 medium 50/50 (small differs only in two written accents on "continúas"); no hearing.
- `build/batch3_manifests.js`: generator descriptions corrected (batch 3 wording, per-video `wordLevel`); the scratch re-run reproduced all manifests, cue WAVs and maps byte-identically (see batch2 report).
- `qa/batch3_verification_report.md` (historical, marked SUPERSEDED), `qa/batch3_METADATA_REV2_report.md` (this report), `manifest/final_inputs/*`, `README.md`.

## Independent review results (external, supplied)
- Visual: PASS within documented coverage (510 distinct whole frames, 28 native caption crops, 12 full native stills; all 3,087 encoded frames decoded without errors). No required media correction.
- Key holds measured: Trial FAQ details card 4.400 s; complete practice Since/For 3.167 s and Used To 3.133 s.
- Technical/audio: PASS: Since/For -17.9 LUFS / -4.0 dBTP (min corr 0.998100), Used To -17.5 / -4.3 (0.999353), Trial FAQ -17.5 / -4.9 (0.999525); every cue delay +4.979 ms; originals and every sample once in contiguous partitions; cut-neighbourhood 20 ms RMS max -58.9 dBFS (low-energy boundaries, not a phonetic/listening proof). Homophone spellings, pronunciation/naturalness remain open.
- Not claimed: no genuine listening, pronunciation/naturalness, full subjective AV, or universal native-app/disclosure pass; native-platform coverage is partial per video. The owner said the voice sounds good; that is owner feedback, not an assistant hearing audit. No IPA or character changes.

## Open gates (unchanged)
Genuine listening/full AV; native-app playback/overlay/cover checks; native-speaker copy read; AI-audio and own-brand disclosures (Instagram native AI disclosure held; Facebook/TikTok scheduling is managed separately and is not asserted here); recheck Trial FAQ prices/conditions in the caption before publishing.
