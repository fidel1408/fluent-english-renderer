# October batch 1 - verification report (CANHAVE / BORROW / SCHEDULE)

**Status of all three files: NARRATED, QA-PENDING. Not final, not publish-ready, not scheduled. Nobody has listened to any of the audio.**
Created in Claude Code, Sonnet 5.5, High effort, Fast off. No TTS, ElevenLabs call, external service, purchase, key, PR or publication was used.

## Files and checksums (SHA256)
| ID | File | Duration | SHA256 |
|---|---|---|---|
| FE261012-CANHAVE | `out/FE261012-CANHAVE_batch1_single-host_narrated_QA-pending.mp4` | 25.5 s | 45b75ba86f5c60c88ab0f85131cd9dda6b120aaacd463fe36994f99cd54eeeb9 |
| FE261014-BORROW | `out/FE261014-BORROW_batch1_single-host_narrated_QA-pending.mp4` | 34.9 s | e65311b0db4729b2eb8d440473e718d850151b28b9c738eb4fa655a147ee89b4 |
| FE261016-SCHEDULE (TikTok-only) | `out/FE261016-SCHEDULE_batch1_single-host_narrated_QA-pending.mp4` | 26.1 s | cdb56fef9979533bdcbbab7974e0cb656e334bee0828d6170b5680ecf4b69a8c |

Captions (`out/FE26*_batch1_captions.srt|vtt`) are the exact spoken text per cue, timed to measured speech activity. Previous media is byte-identical: I AGREE REV3 `7c2f9140...ceee7`, Actually/Currently REV4 `9ed2d608...857e`, Looking REV4 `9818666c...dc0` (re-hashed after this batch).

## Sources (qa/batch1_source_identity.json)
- All six Luis MP3s: SHA256 and byte size equal the reviewed production manifest and audio inventory (`manifest/batch1_inputs/`). Both takes per topic are preserved in `audio/originals/`. Used: `can_have_take2`, `borrow_lend_take2`, `schedule_options_take2` (chosen by the owner for pacing, NOT an audition result).
- For each master the cue WAVs concatenated in order are bit-identical to the decoded master (731,520 / 1,059,840 / 774,144 samples, 44.1 kHz mono): every source sample is kept exactly once, nothing trimmed, faded, stretched or sped up. Cut points are integer sample midpoints of measured silences (largest sample magnitude at any cut: 33 / 36 / 6 of 32768, i.e. below -60 dBFS; no fades). Silence added only: 8.91 s / 10.87 s / 8.55 s (lead, gaps, end hold) - see `qa/*_source_to_final_edit_map.json` (exact integer sample ranges; final start times are rounded to 1 ms by the mixer delay).

## Alignment method and its limits
No speech-recognition or forced-alignment model exists offline here. Boundaries were measured from the waveform (silencedetect -38 dB, >= 120 ms; islands < 60 ms dropped). The measured island counts (10 / 16 / 6) equal the pause structure of the scripts exactly and the build fails if they differ; each cue is a declared group of consecutive islands. The mapping island -> script phrase is therefore **structural, not verified by ear or ASR**. Specific uncertainty: in SCHEDULE c02 the 0.12 s pause inside "...lunes a viernes, sábado o domingo." is used only to time the weekend panel; whether it falls before "sábado" or before "o domingo" is not verified (either way the panel appears with the end of the sentence). In CANHAVE c06 the sub-pauses are used as "after water" / "juice" marks (consistent with the island durations, not heard). Word-level timing is NOT measured; captions are per cue/phrase.

## Encoded-file checks (all on the delivered MP4s)
- ffprobe / full decode (`qa/FE26*.verify.json`, `qa/FE26*_ffprobe.json`): H.264 High, yuv420p, 1080x1920, 30/1 fps, exact frame counts (765 / 1047 / 783), AAC LC 48 kHz stereo, moov before mdat (faststart), whole-file decode with no errors, no clipping (peaks -3.9 / -3.8 / -3.9 dBFS), narration >= 10 dB above SFX in every cue window.
- Audio alignment (`qa/*_sync_and_levels.json`): decoded MP4 audio vs each cue WAV cross-correlation >= 0.986 (min over cues) at a uniform +5 ms (4.9 ms on a few cues); burned captions present at every cue midpoint and absent in every gap. Integrated loudness -17.6 / -17.4 / -14.5 LUFS, true peak -3.9 / -3.8 / -3.9 dBTP (SCHEDULE is ~3 LU louder: the take itself is hotter; not equalised).
- Speaker mouth (`qa/*_mouth_casting.json`): one visible speaking mouth (the adult host). Open mouth in 319/319, 452/452, 437/437 frames inside measured speech islands and 0 frames outside. A first SCHEDULE run flagged 1 outside frame; cause: the 4-line caption bar covered the host's mouth. Fixed by auto-fitting captions to <= 3 lines (cue field `capFit`; old videos unaffected).
- Settled holds (`qa/*_holds_encoded.json`, measured on encoded luma inside opaque cards, 30 fps): CANHAVE request 4.10 s, response 2.63 s, practice after the juice card 3.17 s, CTA 6.33 s; BORROW borrow state 2.77 s, lend state 2.70 s, practice 3.07 s after the question ends, CTA 6.20 s; SCHEDULE weekday 2.97 s, weekend 2.67 s, Monterrey+Club 2.83 s, CTA 6.43 s. Requirements: examples >= 2.5 s, practice >= 3 s, CTA >= 3 s (all met). The practice windows for BORROW and CANHAVE run from the end of the spoken question / the juice card entrance, so "unanswered" time is real.
- Scene sequence (`build/holds_plan.js`): every teaching state fully leaves before the next enters (no overlap); cards enter first and their text fades in about 0.35 s later (no wrapped text on an expanding card). Rule/example/translation are one unit per state. BORROW resets everything (trays, roles, arrow, pen, example) between borrow and lend.
- Text audit of every frame (`qa/*_text_audit.json`): smallest settled text 12.9 px at 270x480 (60 px source type under the 0.86 content group; larger for teaching text; captions 13.5-16 px); zero text-vs-text overlaps; burned captions never above y = 1211 (below the mouth); required strings present at full opacity in their windows (labels, translations, times, keyword); no answer reveal (no "Can I have some juice, please?", no borrow/lend/recibir/prestar text from the BORROW practice onward); no contact/child-data request, no extra CTA, no price/guarantee/assigned-class/start/teacher claim; the CTA text never appears before its entrance.
- Frames: `qa/batch1_frames/` has encoded-frame contact sheets at phone size (270x480 tiles, 0.1 s steps) around every scene boundary and settled-hold frames. Reviewed by me: clean sequential transitions, empty-card-then-text entrances, no cross-scene overlap.

## Content notes
- One host only; all quoted lines are his demonstration, labelled (EJEMPLO: PEDIR, RESPUESTA DE EJEMPLO, EJEMPLO: YO PIDO / YO PRESTO). "Here you go." is an example response shown with a hand + glass; no second face or speaker.
- BORROW: zones YO / TÚ stay fixed. Borrow: YO RECIBE, TÚ PRESTA, tag "tu pluma", arrow and pen move toward YO. Lend: viewpoint reset; YO PRESTA, TÚ RECIBE, tag "mi pluma", arrow and pen move toward TÚ. The practice shows a neutral blank with the charger (no roles, no arrow, no answer).
- CANHAVE: practice shows the sentence with the blank and a "juice" card; the completed sentence is never shown. CTA addresses mamás y papás, keyword NIÑOS, no request for age/name/photo/contact.
- SCHEDULE: all weekday (Mon-Fri, one hour a day, starts on the hour 7 a. m. to 9 p. m.) and weekend (Saturday OR Sunday; 7 a. m.-12 p. m. OR 1-6 p. m.) options, each with "Hora de Monterrey"; Club intermedios y avanzados; no assigned class, start, teacher or capacity. TikTok-only adaptation (no platform marks; scheduling/disclosures are the owner's).
- One marketing CTA each (native private message: NIÑOS / GRUPO / HORARIO). No fake input boxes in this batch.

## NOT done (open gates)
1. Real listening / audition of all three tracks: pronunciation, completeness of words at cue edges, tone, SFX balance, that the audio says what the script says.
2. Word-level caption/animation timing by ear (only phrase level measured).
3. Target-app (TikTok / Reels / Facebook) cover, overlay, safe-zone and playback checks; real-time phone playback.
4. Native-speaker read of on-screen copy; the realistic-AI-audio and own-brand disclosures at scheduling; duplicate-schedule check.
5. ElevenLabs plan/licence/credit confirmation (owner's).
6. Independent QA by someone else; this report is creator self-checking evidence, not a release.
