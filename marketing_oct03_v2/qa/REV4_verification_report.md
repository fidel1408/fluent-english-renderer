# REV4 verification report: Actually/Currently + Looking forward to (narrated, QA-PENDING, NOT final, NOT publish-ready)

**Nobody has listened to any of these files.** Pronunciation, voice quality, emotion, bilingual delivery and subjective SFX balance are UNVERIFIED. No hearing, release approval or in-app overlay playback is claimed. I AGREE REV3 is unchanged.

## Files
- `out/actually_currently_oct03_v2_REV4_single-host_narrated_QA-pending.mp4` (31.4 s) + `out/actually_currently_oct03_v2_REV4_captions.srt/.vtt`
- `out/looking_forward_to_oct03_v2_REV4_single-host_narrated_QA-pending.mp4` (29.1 s) + `out/looking_forward_to_oct03_v2_REV4_captions.srt/.vtt`
- Unchanged: `out/i_agree_oct03_v2_REV3_single-host_narrated_QA-pending.mp4` (SHA256 7c2f9140…05ceee7, identical to the delivered REV3; cue WAVs, alignment and manifest have no git diff).
- Earlier versions are preserved in the repository (not in the upload ZIP).

## Fixes (scope: the two new tips only)
1. **Looking: noun teaching state.** One coherent state at a time. State A (seeing you + "+ verbo en -ing" + "Tengo muchas ganas de verte.") exits completely (16.52-16.77 s); the whole noun state (the weekend + "+ sustantivo" + the noun translation) then enters together (16.82 s, full at 17.32 s). Source-state proof over every 30 fps frame from 15.52 to 20.42 s: 147 frames, 0 contradictory (never "+ sustantivo" with seeing you or its translation). Per-frame look at the encoded transition (16.35-17.62 s) confirms a neutral beat then the entrance, no overlapping text.
2. **Looking: reading time.** The noun translation is stationary at full opacity from 17.32 s to 20.02 s by design = **2.70 s** (was 0.49 s). Pixel measurement of the encoded file: longest run within 3 % of the translation's plateau = 2.93 s (17.13-20.06 s); requirement 2.5 s. Added silence only: the c07 gap was increased by 0.5 s (speech untouched); the scene exit now starts at 20.02 s and the practice card enters at 20.35 s (no overlap).
3. **Both: dialogue labels.** Role chips replaced by 60 px source tabs ("Pregunta", "Respuesta", "Alguien dice", "Tú respondes") = 12.9 px effective at 270x480 (60 x 0.86 group scale x 0.25), was about 7 px. The dialogue stacks were reflowed so no tab covers English text, the translation, the presenter or the safe margins (checked on 270x480 frames of the encoded files).
4. **Both: CTA.** Reflowed into three short lines ("Clases en línea" 74 px; "Manda [GRUPO]" 62 px; "por mensaje privado." 62 px) = 15.9 / 13.3 / 13.3 px effective at 270x480 (was about 10 px in one row). Same factual wording, no offers. The CTA now appears after the host has slid away (no overlap) and the end holds were lengthened so static CTA time is not reduced.
5. **Documentation precision (no I AGREE re-render).** `qa/i_agree_source_to_final_edit_map.json` now separates the full master (859392 samples = 19.487346939 s) from the retained cues (770648 samples = 17.475011338 s; 88744 master samples lie in no cue), marks its cut endpoints APPROXIMATE (derived from rounded times; within 26 samples = 0.59 ms of the actual cue WAV lengths; speech retention was proven bit-exact separately) and adds actual `cueWavSamples`. The two new tips use exact integer partitions and sample-based summaries: Actually 1099008 = 24.920816327 s, retained 1099008, final 31.4 s, added silence 6.479184 s; Looking 837504 = 18.991020408 s, retained 837504, final 29.1 s, added silence 10.10898 s.

## Automated checks on the ENCODED REV4 files (all pass)
| check | Actually/Currently | Looking forward to |
|---|---|---|
| H.264 High yuv420p, 1080x1920, 30 fps, AAC 48 kHz stereo, faststart, clean full decode | pass | pass |
| frames / duration | 942 / 31.4 s | 873 / 29.1 s |
| narration vs encoded audio correlation, lag | 0.986-0.999, +5 ms (uniform) | 0.986-1.000, +5 ms (uniform) |
| burned captions present at every cue / absent in every gap | pass | pass |
| static seconds after last speech (CTA held, captions off) | 3.69 s (fully static CTA frame 2.69 s) | 4.04 s (fully static CTA frame 3.04 s) |
| integrated LUFS / LRA / true peak after AAC | -16.5 / 5.1 / -3.9 dBTP | -18.1 / 6.4 / -3.6 dBTP |
| host mouth open in speech-island frames / outside islands | 502/502 / 0 | 425/425 / 0 |

Audio preservation: both masters' cue WAVs are unchanged (exact partitions, 0 differing samples on reconstruction); the encoded narration correlates 0.986-1.000 with each cue; SFX peak -20 dBFS unchanged and ducked under speech. The CTA region differs by only 0.2-0.36 % RMSE between the start and end of each hold (stationary).

## I AGREE regression checks (current source)
Label readable 2.10 s before phrase text 2.30 s; 0 coral pixels above the card during QUITA AM; 0 dark text pixels below the example card. The unchanged REV3 MP4 passes verify/sync/mouth (narration 0.989-1.000, -17.2 LUFS, -4.2 dBTP; mouth open 300/300 in-island, 0 outside). Frames rendered from the current source match the REV3 MP4 within about 1.4-1.6 % RMSE (H.264 loss only).

## NOT done (do not claim)
1. **No listening happened** (no one in this workflow can listen): pronunciation of every word including English inside Spanish (Actually, I'm currently, look forward to, isolated -ing / seeing), accent, emotion, pacing, subjective SFX balance, syllable edges. ASR disagreements remain open questions, not defects.
2. No in-app overlay / safe-zone playback, no real-time phone playback, no native-speaker read of the copy. Word-level timing not measured (phrase/island level; marks use measured pauses plus small offsets).
3. ElevenLabs licence/credits are the owner's to confirm. No ElevenLabs call, credential, connection, speech generation or long-video job was used or started.
