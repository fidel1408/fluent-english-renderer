# Batch 1 independent ASR timing handoff

Prepared 2026-10-04. Scope: three preferred take2 originals; current marketing_oct03_v2 cue maps. This is genuine independent automated recognition evidence, not an auditory listening pass.

## Required visual correction

Schedule weekend entrance currently starts about 8.313 seconds. Move the visual-only weekend entrance to about **7.60 seconds** in the current video timeline. Independent runs place the onset of “sábado” at **7.630–7.830 seconds**. Thus 8.313 is late in every run. Complete the needed weekday entrance sooner, reducing decorative clock/entrance duration so its fully settled reading hold still reaches 2.5 seconds before its exit starts. Measure settled hold after the last entrance animation and before the exit animation. Do not insert a speech cut or change the original source partitions on the strength of ASR timestamps. Revalidate the actual rendered transition; entrance duration matters, not just its anchor.

Schedule “viernes” end estimates span 7.480–7.770 seconds, overlapping the inter-model onset spread for “sábado.” There is no ASR-certified sample-exact gap. A visual transition around 7.60 is a practical synchronization correction, not a newly established acoustic cut.

## Key timing evidence

All times below are seconds. Onset ranges are the spread of independent full-file and cue-sized small/medium runs, not statistical confidence intervals.

- Schedule c02: source start 2.970249, current video start 3.770; recorded offset **+0.799751**. “sábado” source onset **6.830249–7.030249**, current video **7.630–7.830**. Word probability estimates approximately 0.991–0.993. Full intended phrase “lunes a viernes, sábado o domingo” appears in every relevant run.
- CanHave c06: source start 9.367120, current video start 11.967; recorded offset **+2.599880**. Practice “water” onset **10.440–10.560 source**, **13.040–13.160 current video**. Practice “juice” onset **11.427120–11.660 source**, **14.027–14.260 current video**. If highlighting individual terms, these are useful candidate windows, not exact phonetic boundaries. “water” probability estimates are comparatively weak (0.294–0.665); retain localized pronunciation/listening review.

## Content and broad cue-map findings

- Small-model unprompted full-file transcription matches every normalized script word: CanHave 38/38, Borrow/Lend 51/51, Schedule 47/47. Case and punctuation were normalized; the script was not supplied to the decoder.
- Medium full-file Schedule also matches every word. Medium full-file CanHave writes “for” in place of “por”; both medium and small cue-sized auto/es runs recover “Ahora cambia water por juice.” Treat this as model code-switch ambiguity, not evidence of an audio defect.
- Medium full-file Borrow/Lend writes “Clase es” instead of “Clases”; medium cue-sized auto/es both recover “Clases en línea.” No supported repeat/omission defect is established. The intentional “Can I ... your charger?” practice blank remains unfilled in all relevant unprompted runs.
- Broad phrase/cue assignments align plausibly. No wrong phrase or wrong source cut is established. Some full-file word estimates include preceding silence and straddle a source partition: Borrow “I,” “Te,” and “Ahora”; medium Schedule “domingo” extends 22 ms beyond c02, while its cue-sized recheck ends well inside. These are alignment uncertainties, not evidence that speech was physically clipped. Those CSV rows are explicitly flagged. Do not move source cuts based on them.
- All three analyzed MP3 SHA-256 hashes match the original master hashes in the current render maps.

## Source identity

- can_have_take2.mp3: 894d781de770c73a4b10ff0b8cf2997af69fff777dfd7af944c8599540a51421
- borrow_lend_take2.mp3: 6ec2a46e11a2472fadc0b77ae16a9f26f8c6ce197d595727cb31fb6a7bf4e24d
- schedule_options_take2.mp3: d3fe80fb45faea05e6db191619fce56c2003bec892d2362b435e09950b405565

## Run provenance and limitations

faster-whisper 1.2.1 / CTranslate2 4.8.2, CPU int8; official SYSTRAN multilingual small and medium models. Model revisions: small 536b0662742c02347bc0e980a01041f333bce120; medium 08e178d48790749d25932bbc082711ddcfdfbc4f. Installed from PyPI in an isolated temporary directory; public model downloads only. FFmpeg decoded originals to mono float32 at 16 kHz. First passes used language auto, task transcribe, multilingual true, beam 5, word timestamps true, no prompt/prefix/hotwords, no VAD and no previous-text conditioning. Cue-sized passes were unprompted auto and supplementary language-only es; English request also had an en corroboration. Forced es can translate intact English and is never counted alone as an audio defect.

No paid transcription service, new narration generation, credentials, alternate take inspection, or source/video edits were used. Model probabilities are not calibrated human-intelligibility scores. No real listening, pronunciation approval, full audiovisual subjective pass, or target-app playback gate is cleared.

Raw full-file runs: *_take2_{small,medium}_unprompted.json. Raw supplementary runs: cue_transcripts.json. Mapped word estimates: *_word_timings.csv and cue_word_timings.csv. Exact source sample ranges and current recorded offsets: current_cue_offsets.json. Preserve raw files separately from this concise handoff.

Official references: https://github.com/SYSTRAN/faster-whisper ; https://huggingface.co/Systran/faster-whisper-small ; https://huggingface.co/Systran/faster-whisper-medium
