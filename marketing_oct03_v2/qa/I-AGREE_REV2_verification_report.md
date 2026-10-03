# I AGREE REV2: verification report (narrated, QA-pending; NOT final)

File: `out/i_agree_oct03_v2_REV2_narrated_QA-pending.mp4`. Previous candidate preserved: `out/i_agree_oct03_v2_FINAL-CANDIDATE_narrated_QA-pending.mp4`. Originals untouched in `audio/originals/` (SHA256SUMS.txt). Cue WAVs, alignment and manifest are byte-unchanged from the previous commit.

## Findings fixed (verified on the encoded REV2 frames)
| # | Finding | Result |
|---|---|---|
| 1 | Casting | Man open-mouth in 300/300 settled in-island frames, 0 outside speech islands; woman open-mouth 0 frames (previous candidate: woman 100 frames, man open outside islands 11). Tail of opening bubble points to the man. |
| 2 | Labels | Label full strength at 2.10 s, phrase text from 2.30 s (previous: text 2.233 s before readable label 2.267 s). EVITA to 4.40 s, QUITA AM 4.43-5.60 s, DI ASÍ from 5.63 s; correct phrase never under EVITA. Every frame 2.00-2.60 s, 4.30-6.00 s and 4.37-5.77 s at 1/30 s steps reviewed. |
| 3 | "am" path | "am" and dust are clipped to the card; flat-background test: 0 coral pixels above the card in all 34 fix frames (previous source: up to 39,966 px). |
| 4 | Example card | Card fully expanded at 12.12 s, before "with you." appears; flat-background test: 0 dark text pixels below the card in 57 entrance frames (previous source reproduces the defect: dark text below the card at 12.200-12.367 s, up to 13,989 px). Every frame 11.80-12.87 s reviewed. |
| 5 | Other tips | Source only: single educator / silent listener, bubble tail to the man, opening ¿ added to the Actually/Currently hook card ("¿Actually significa actualmente?"). Their silent preview MP4s were not re-rendered and no longer match their source. |

## Technical checks (REV2 MP4)
H.264 High yuv420p bt709, 1080x1920, 30/1 fps, 828 frames, 27.600 s; AAC LC 48 kHz stereo; moov before mdat; full decode clean. Narration vs encoded audio correlation 0.989-1.000 per cue at uniform +5 ms; captions present at all cue midpoints (min 5,135 px), absent in all gaps and the final hold; SRT identical to previous candidate. Integrated -17.2 LUFS, LRA 4.4 LU, true peak -4.2 dBTP. Only SFX timing changed by about 50 ms (label flip), SFX levels unchanged (peak -20 dBFS, ducked).

## NOT done
No one has listened (isolated "Di" and "am", pronunciation, emotion, SFX balance, edge clipping). Word-level timing not measured. No real-time phone playback, no in-app safe-zone check, no native-speaker copy read. ElevenLabs licence/credits are the owner's to confirm. Status stays QA-pending; do not publish.
