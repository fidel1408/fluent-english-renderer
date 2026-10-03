# REV3 single-host: verification report (3 tips; narrated, QA-PENDING, NOT final, NOT publish-ready)

Nobody has listened to any of these files. Pronunciation, voice quality, emotion, bilingual delivery and SFX balance are **UNVERIFIED**. Machine ASR and waveform tests do not establish them.

## Files (out/)

- `i_agree_oct03_v2_REV3_single-host_narrated_QA-pending.mp4` (27.6 s) + `i_agree_oct03_v2_REV3_captions.srt/.vtt`
- `actually_currently_oct03_v2_REV3_single-host_narrated_QA-pending.mp4` (31.1 s) + `actually_currently_oct03_v2_REV3_captions.srt/.vtt`
- `looking_forward_to_oct03_v2_REV3_single-host_narrated_QA-pending.mp4` (28.3 s) + `looking_forward_to_oct03_v2_REV3_captions.srt/.vtt`

Previous versions are preserved unchanged (REV2, FINAL-CANDIDATE, PREVIEW files).

## What changed
- Both small avatars replaced by ONE adult male host (src/host.js): defined jaw, neck, collared shirt, shoulders and torso, neat short hair, light stubble, five-finger hands with normal joints. Every bubble tail, eye-line and emphasis nod belongs to him; the mouth opens only inside measured speech islands. He models both quoted dialogue lines (Pregunta/Respuesta, Alguien dice/Tú respondes chips + alternating hand gestures). He leaves for the clean static CTA hold.
- Scene content is drawn through a shared scaled group (KIT.content) so the host's head, shoulders and chest sit above the caption bar.
- I AGREE keeps take 1, audio cuts, timeline, SFX and every REV2 fix. Caption override bug fixed (burned captions now wrap and draw `caption || text`, identical to SRT/VTT, so `-ing` and `…` appear as approved).
- Actually/Currently: opening ¿ in the main hook; 'Actually' never marked wrong; unanswered practice; GRUPO CTA. Looking forward to: construction-specific rule + noun variant; focus changes timed to the supplied speech.

## Source integrity and edit maps
Original MP3 SHA256 verified for all four files (audio/originals/SHA256SUMS.txt). New tips: decoded PCM sample counts match the handoff (1,099,008 and 837,504); partitions are the handoff's explicit sample indices, contiguous, no fades/resampling/stretch; reconstruction from cue WAVs differs from the source in 0 samples; every cue WAV has exactly its partition's sample count; max |sample| at any cut: 43 and 29 (of 32,768). Only silence was added (lead, gaps, end hold). Maps: `qa/<video>_source_to_final_edit_map.json` with video_time(source_time) = cue.finalStart + source_time - cue.sourceStart.

### I AGREE: 27.6 s final, 17.475 s source, 10.125 s added silence (take 1 (unchanged cuts; silence-padded cuts with 8 ms fades inside silence))

| cue | source samples [a,b) | source s | final start-end s | speech activity in final (captions) | caption text |
|---|---|---|---|---|---|
| c01 | 0-46922 | 0.000-1.064 | 0.500-1.564 | 0.50-1.38 | ¿Estás de acuerdo? |
| c02 | 57771-144075 | 1.310-3.267 | 2.364-4.321 | 2.54-4.14 | Evita: I am agree. |
| c03 | 152410-231084 | 3.456-5.240 | 5.621-7.405 | 5.80-7.22 | Di: I agree. |
| c04 | 242638-388653 | 5.502-8.813 | 7.755-11.066 | 7.93-10.89 | Agree ya es verbo; aquí no necesitas am. |
| c05 | 398708-454142 | 9.041-10.298 | 12.266-13.523 | 12.45-13.34 | I agree with you. |
| c06 | 460625-529994 | 10.445-12.018 | 13.923-15.495 | 14.10-15.31 | Estoy de acuerdo contigo. |
| c07 | 551559-664234 | 12.507-15.062 | 16.495-19.050 | 16.68-18.87 | ¿Cómo dirías: no estoy de acuerdo? |
| c08 | 667101-702910 | 15.127-15.939 | 19.350-20.162 | 19.53-19.98 | Comenta. |
| c09 | 713847-853335 | 16.187-19.350 | 20.862-24.025 | 21.04-23.84 | Clases en línea: manda GRUPO por privado. |

### ACTUALLY / CURRENTLY: 31.1 s final, 24.922 s source, 6.178 s added silence (contiguous source partitions)

| cue | source samples [a,b) | source s | final start-end s | speech activity in final (captions) | caption text |
|---|---|---|---|---|---|
| c01 | 0-112816 | 0.000-2.558 | 0.350-2.908 | 0.46-2.60 | ¿Actually significa actualmente? |
| c02 | 112816-291651 | 2.558-6.613 | 3.208-7.263 | 3.52-6.90 | Actually suele significar en realidad o de hecho. |
| c03 | 291651-428315 | 6.613-9.712 | 7.263-10.362 | 7.63-9.96 | Currently significa actualmente. |
| c04 | 428315-500178 | 9.712-11.342 | 10.862-12.492 | 11.27-12.23 | Do you live in London? |
| c05 | 500178-604234 | 11.342-13.701 | 12.592-14.952 | 12.85-14.46 | Actually, I live in Monterrey. |
| c06 | 604234-814844 | 13.701-18.477 | 15.852-20.628 | 16.34-20.23 | Para decir actualmente: I'm currently studying English. |
| c07 | 814844-872138 | 18.477-19.776 | 20.928-22.227 | 21.33-21.80 | Ahora tú. |
| c08 | 872138-1034950 | 19.776-23.468 | 22.227-25.919 | 22.65-25.58 | ¿Cómo dirías: actualmente trabajo desde casa? |
| c09 | 1034950-1099008 | 23.468-24.921 | 26.019-27.472 | 26.36-27.46 | Escribe tu versión. |

### LOOKING FORWARD TO: 28.3 s final, 18.991 s source, 9.309 s added silence (contiguous source partitions)

| cue | source samples [a,b) | source s | final start-end s | speech activity in final (captions) | caption text |
|---|---|---|---|---|---|
| c01 | 0-141360 | 0.000-3.205 | 0.350-3.555 | 0.47-3.34 | ¿Cómo dices: tengo muchas ganas de verte? |
| c02 | 141360-206847 | 3.205-4.690 | 4.455-5.940 | 4.67-5.82 | See you on Saturday! |
| c03 | 206847-290619 | 4.690-6.590 | 6.440-8.340 | 6.56-8.03 | I'm looking forward to seeing you. |
| c04 | 290619-452446 | 6.590-10.260 | 9.440-13.110 | 9.75-12.93 | Después de look forward to, usa un verbo en -ing. |
| c05 | 452446-508230 | 10.260-11.524 | 13.510-14.775 | 13.69-14.57 | Como seeing. |
| c06 | 508230-655182 | 11.524-14.857 | 15.775-19.107 | 15.97-18.86 | O un sustantivo: I'm looking forward to the weekend. |
| c07 | 655182-780330 | 14.857-17.695 | 20.107-22.945 | 20.35-22.73 | Ahora tú: I'm looking forward to… |
| c08 | 780330-837504 | 17.695-18.991 | 23.145-24.441 | 23.36-24.31 | ¿Cómo la completas? |

## Automated checks on the ENCODED MP4s (all pass)

| check | I AGREE | ACTUALLY/CURRENTLY | LOOKING FORWARD TO |
|---|---|---|---|
| H.264 High yuv420p, 1080x1920, 30 fps, AAC 48 kHz, faststart, clean full decode | pass | pass | pass |
| frames / duration | 828 / 27.6 s | 933 / 31.1 s | 849 / 28.3 s |
| narration vs encoded audio correlation (min-max), lag | 0.989-1.000, +5 ms | 0.986-0.999, +5 ms | 0.986-0.999, +5 ms |
| burned captions present at every cue midpoint / absent in every gap | pass | pass | pass |
| static seconds after last speech (captions off, CTA held) | 3.51 s | 3.39 s | 3.74 s |
| integrated LUFS / LRA / true peak (after AAC) | -17.2 / 4.4 / -4.2 dBTP | -16.5 / 5.1 / -3.9 dBTP | -18.1 / 6.3 / -3.6 dBTP |
| host mouth open in speech-island frames / outside islands | 300/300 / 0 | 502/502 / 0 | 425/425 / 0 |

I AGREE layout tests (flat-grey background pixel tests, scaled layout): label readable at 2.10 s before phrase text 2.30 s; 0 coral pixels above the card during QUITA AM (34 frames); 0 dark text pixels below the example card (57 frames). See qa/i_agree_layout_REV3.json.

## Frames reviewed (actual encoded MP4s, phone-size 270x480 plus detail crops)
Every cue's speaking midpoint and the final hold for all three; I AGREE every frame 2.00-2.47 s, 4.30-5.90 s (0.1 s steps) and 11.80-12.87 s; Actually/Currently and Looking forward to at every scene change, marker move, focus swap (including a per-frame look at the seeing -> the weekend swap after a fix), practice and CTA entrance, plus a mouth open/closed crop pair. Issues found and fixed during review: overlapping role chips/tails, chip size at phone scale, overlapping text during the seeing/the-weekend swap, and an over-strict caption probe (final hold).

## NOT done (do not claim)
1. **No listening happened.** Pronunciation of every word (English inside Spanish: Actually, I'm currently, look forward to, the isolated -ing/seeing, I AGREE's Di and final am), accent, emotion, pacing, subjective SFX balance, and clipping of syllables at cue edges are unverified. ASR disagreements in the handoff are unresolved uncertainties, not defects.
2. Word-level timing was not measured (phrase/island level only). Marks for the I'm-currently highlight, noun swap and -ing chip are timed from measured pauses plus small offsets.
3. No real-time phone playback, no in-app safe-zone check, no native-speaker copy read.
4. The host's likeness/appeal and whether he now reads as a clear adult man matching the voice is a visual judgement for the owner; the automated tests only prove mouth routing.
5. ElevenLabs licence/credits were reported by the owner; not verifiable here. No ElevenLabs call, credential, connection or new generation was used in this environment.
