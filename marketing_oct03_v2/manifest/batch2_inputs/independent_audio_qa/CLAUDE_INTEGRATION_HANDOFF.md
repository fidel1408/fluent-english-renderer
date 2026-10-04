# Batch 2 independent narration handoff

Prepared 2026-10-04. Offline analysis only. No listening, voice generation, original-byte modification, or video production was performed.

## Source choice and unresolved gate

Use **take1 provisionally for all three**. This is an editorial integration choice based on unprompted recognition and measured phrase spacing, not a finding of superior voice performance.

- **CLARIFY: exact-script/caption agreement is NOT cleared.** The manifest says “Ahora cambia the deadline **por** the next step.” Small and medium full-file take1, medium full-file take2, and medium Spanish-constrained practice-span runs for both takes write **“for.”** Small full-file take2 writes “por.” Auto-language span recognition also translates some Spanish to English. This cannot distinguish a spoken mismatch from code-switch recognition bias without genuine listening. Inspect roughly take1 **14.2–15.2 source seconds**. Do not silently caption “por,” claim exact narration, regenerate audio, or substitute a new word based on this analysis. Take1 preserves both English model questions in both full-file models. Take2 recovers both questions verbatim in independent isolated auto/en spans, so its full-file translation/misrecognition is **not evidence of missing English**.
- **TELL ME MORE: automated normalized content agreement only.** Take1 small and medium each match **50/50** script words; take2 small matches 50/50. Take1 has a measured 0.825 s low-energy pause before “Ahora tú” versus 0.555 s for take2, and 0.944 s before Speaking Club versus 0.615 s. Those give more transition room. Human intelligibility, pronunciation, timbre, delivery, and full AV hearing remain unrun.
- **PRIVATE/COMPANY: automated normalized content agreement only.** Take1 small and medium each match **44/44** script words; take2 small matches 44/44. Both preserve private 1–3, company maximum ten, online company classes, and both DM keywords. Take1 has a 0.465 s low-energy pause before “Manda” versus 0.344 s for take2, plus clearer measured gaps inside the two-keyword CTA. No subjective speech-quality superiority is established.

All six MP3s are mono, 44.1 kHz, 128 kb/s. Each fully decodes without an FFmpeg error; zero decoded samples reach |1.0| or |0.999|. This excludes observed decoded full-scale clipping, not all possible distortion. Take1 loudness/true peak: Clarify −17.1 LUFS / about −0.8 dBFS; More −16.0 / −0.7; Private −16.8 / −0.9. Peaks have little headroom: do not apply an arbitrary gain boost. Recheck final AAC loudness and true peak if mastering changes.

## Source identity

- clarify_deadline_take1.mp3 — **71b48ddaf4925317155c959ddbef206e7759f493e9b3b315d121ce3c3f3dcc21**; decoded 957,312 frames at 44,100 Hz; 21.707755 s.
- tell_me_more_take1.mp3 — **7eec96c982d2a6a51c1f32ff803d69ed52c2ab7a5cbb3593df843391f813a4ed**; decoded 1,035,648 frames; 23.484082 s.
- private_company_take1.mp3 — **c71f2d26df7b889bf3dc37dc73c685423530ed98ff6bde4e30b1aa5a933bbef7**; decoded 767,232 frames; 17.397551 s.

Use these exact originals. Probe/container duration differs by tiny rounding amounts from decoded sample count. Store the actual decoder/sample-rate basis in the render map, partition it contiguously without dropped/duplicated source samples, and add only silence/read holds. No narration time stretch. Do not derive audio cuts from ASR word timestamps.

## Source-relative synchronization anchors

These are **source MP3 seconds**, before any inserted silence. Ranges below are small/medium estimate spread, **not confidence intervals**; true errors may be larger. The full phrase and word evidence is in chosen_phrase_timings.json/.csv and *_word_timings.csv. Threshold silence is a waveform aid, not proof of a phonetic boundary.

**Clarify**
- English “Could you clarify…” onset 2.28–2.40; Spanish translation 4.40. Pair ends around 6.06–6.22.
- “Para confirmar” onset 6.94–7.06; “Do you mean…” 8.40–8.54; Spanish translation 10.20–10.24. Pair ends 11.42–11.60.
- Practice onset 12.54–12.62; “the deadline” 13.46–13.58; disputed connector 14.26–14.54; “the next step” 14.84–15.12. Practice ends 16.28–16.46.
- CTA offer onset estimate is unusually wide, **16.80–17.30**, while −40 dB activity resumes around 17.25 after a measured gap from 16.42. Let the visual CTA settle early in that gap; do not treat 16.80 as the exact start of speech. “Manda” onset 19.14–19.34; finish 21.50–21.58.

**Tell Me More**
- Hook finishes 1.52–1.74. Quoted setup “I tried…” starts 2.06–2.10, ends 3.10–3.28.
- “Oh, nice! What was it like?” starts 3.76–3.84. Translation starts 6.40 and finishes 6.86–7.04.
- Alternative lead starts 7.72–7.76; “Tell me more…” starts 9.04–9.22; “Cuéntame más” starts 10.86–10.90, ends 11.56–11.74.
- Practice lead 12.52–12.62; movie statement 13.76–13.82; question 15.82–15.84, ends 16.78–17.08.
- Speaking Club CTA 17.98–18.24; “Manda CLUB” 20.90–21.20; final end 23.20–23.32.

**Private/Company**
- Private scene: ASR onset 3.24–3.30, but waveform activity already resumes **about 3.09**. Settle the private card by roughly **3.00** source seconds, not at the ASR midpoint. Counts “una, dos o tres” 4.50–4.66 through 5.98–6.12.
- Company scene: ASR 7.10–7.18, but waveform activity resumes **about 6.96**. Settle the company card by roughly **6.90** source seconds. “En línea” 8.42–8.50; “un máximo de diez” 9.36–9.46 onward; “diez” itself 10.04–10.16. The capacity must already be visible then.
- “Cuéntanos” CTA/question 11.42–11.60; “Manda PRIVADO o EMPRESA” 13.62–13.84; final end 17.20–17.26. Show the entire requested CTA as one coherent card, rather than delaying it until the final word.

## Integration rules that prevent late visual changes

1. For every source partition, record source start/end samples and final video start/end. Map an internal speech anchor by **final cue start + (source anchor − source cue start)**. Adding silence before a cue shifts every later anchor. Never paste these source times directly into the stretched final video timeline.
2. Have a replacement card finish entering at or slightly before its associated spoken phrase; do not begin a long entrance at the phrase onset. Use the earlier plausible onset and waveform evidence conservatively. Recheck actual rendered frames immediately before, at, and after each switch. Preserve the full previous card’s reading hold before its exit.
3. Expand cards before text wraps into them. Rule/example/translation replacements must be coherent and non-overlapping. Retain ≥2.5 s fully settled holds for solved bilingual examples, ≥3 s for unanswered practice, and ≥3 s for the final CTA after its entrance. If needed, insert silence after a complete phrase, not inside a spoken word. In More, the quoted setup lasts only about 1.2 s; if styled as a solved example requiring 2.5 s, add an appropriate hold before the response.
4. The first word in each file starts at the beginning of the ASR timeline. Do not hide it behind an opening fade; use pre-roll silence if the opening visual needs an entrance.
5. No answer key should leak into unanswered practice. No second speaking face. Private/Company remains TikTok-only, as specified by the manifest.

## Evidence and remaining gates

source_metadata.json has all six hashes, probe results, decoded counts, peaks and loudness. comparison_summary.json records every normalized mismatch. disputed_spans.json retains the Clarify evidence. Raw *_unprompted.json, *.log, *_energy10ms.json and reproduction scripts are included. Expected scripts were never supplied to an ASR decoder. Full-file passes: auto language, transcribe, multilingual, beam 5, no initial prompt/prefix/hotwords, no VAD, no previous-text conditioning. Follow-up runs use only source spans and optional language. Models: official SYSTRAN faster-whisper small revision 536b0662742c02347bc0e980a01041f333bce120 and medium 08e178d48790749d25932bbc082711ddcfdfbc4f; faster-whisper 1.2.1, CPU int8; already-cached offline models only.

This handoff does not clear genuine listening, pronunciation, full subjective AV, final-source identity/sync, final encode quality, or target-app playback gates. Clarify additionally retains the explicit por/for exact-script/caption blocker. A human auditory check or explicit owner direction is still needed before release under the production contract.
