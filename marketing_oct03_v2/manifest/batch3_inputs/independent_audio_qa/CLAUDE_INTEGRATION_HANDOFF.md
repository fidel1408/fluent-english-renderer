# Batch 3 independent narration handoff

Prepared 2026-10-04. Offline analysis of all six originals. No genuine listening was possible; no original audio was changed and no voice or video was generated.

## Source choices

Use **Since/For take1; Used To take2; Trial FAQ take2**, provisionally for integration. Selection is based on unprompted recognition and measured phrase spacing, not duration alone or subjective voice quality.

- **Since/For take1:** Medium matches 49/49 normalized script words. Small preserves the content, but joins “indica duración” and omits the accent in “cuándo.” Both identify continuing-now context, FOR duration, SINCE starting point, 2024 twice, and the unanswered practice. Take2 yields the homophone spelling “four” in both models and an “o”/“or” disagreement between models; these do **not** prove bad pronunciation or wrong speech. Take1 also has more measured transition room before the SINCE example (0.664 vs 0.524 s), practice (0.613 vs 0.501 s), and CTA (0.905 vs 0.470 s). The displayed year remains 2024; ASR numeral output cannot prove its exact spoken number realization.
- **Used To take2:** Small and medium each match 52/52 normalized words, including “un hábito de antes que ya cambió,” “used to más verbo base: play,” and the intentionally incomplete “I used to…” practice. Take1 small writes “use” once, which can be a recognition/spelling issue, not proof of an actual defect. Take2 gives a larger measured pause before practice (0.739 vs 0.618 s) and CTA (1.083 vs 0.620 s), useful for clearing solved material.
- **Trial FAQ take2:** Medium matches 50/50 normalized words. Small differs only in two written accents on “continúas.” Take1 small matches 50/50 too. Both alternatives retain no advance payment, no payment if stopping, and payment covering all four weeks including the first if continuing. Take2 offers more measured spacing before the continuation condition (0.400 vs 0.351 s) and details card (0.532 vs 0.383 s). This is an integration preference, not an intelligibility ranking.

“Normalized” means case/punctuation and curly-apostrophe normalization, with 2024 expanded to “twenty twenty four.” Raw text and every discrepancy remain in the evidence. No expected narration, vocabulary hint, prompt, prefix, or hotword was supplied to ASR. No selected-take semantic omission was found by these automated checks. This is not proof of exact pronunciation or auditory quality.

## Technical results and identity

All six originals are mono MP3, 44,100 Hz, 128 kb/s. All fully decode with no FFmpeg error. Zero decoded samples reach |1.0| or |0.999|. This excludes observed decoded full-scale clipping, not every kind of distortion. All-six measured integrated loudness is −18.9 to −16.1 LUFS, with approximate true peaks −1.0 to −0.4 dBFS.

| Chosen original | SHA-256 | Decoded frames / duration | Integrated / true peak |
|---|---|---|---|
| since_for_take1.mp3 | cf0dddd6d55d0844be1801ca26745aa243c80945dead31e402708febb1c41d5b | 1,102,464 / 24.999184 s | −17.7 LUFS / −1.0 dBFS |
| used_to_take2.mp3 | 898c618a8cc2dc945bc1f70e509a451d5852effc7aea27215e9edb88302857c7 | 1,028,736 / 23.327347 s | −16.8 LUFS / −0.7 dBFS |
| trial_faq_take2.mp3 | 7c489dd1eba4e25ef29a51f727b867d1425875d7821a9d83e77cc404088a90d7 | 844,416 / 19.147755 s | −16.1 LUFS / −0.5 dBFS |

Use the exact originals. Preserve every decoded source sample in order, partition contiguously without duplicates/drops, add only silence/read holds, and never time-stretch. Store the decoder/sample-rate basis with the render map. Do not boost gain arbitrarily: peak headroom is limited. Recheck final AAC loudness, true peak, and decode after conversion to the required 48 kHz stereo output.

## Visual synchronization anchors

Times below are **original source seconds before added silence**. “Settle by” means finish the entrance and coherent card replacement by that time; do not start a long entrance then. These are conservative visual targets, **not sample-exact cuts**. ASR min–max is model spread, not a confidence interval. Waveform threshold activity also is not proof of a phonetic boundary.

### Since/For take1

| Visual state | Settle by | ASR phrase onset | Waveform activity resumes near |
|---|---:|---:|---:|
| Complete FOR example + translation + duration rule | 2.75 | 2.94–3.00 | 2.850 |
| FOR duration emphasis, if animated separately | 5.00 | 5.20–5.44 | 5.138 |
| Complete SINCE example + translation + start rule | 8.45 | 8.60–8.62 | 8.566 |
| SINCE starting-point emphasis, if separate | 11.00 | 11.20–11.50 | 11.110 |
| Unanswered practice, solved examples cleared | 15.40 | 15.60–15.70 | 15.569 |
| Complete native-DM CTA | 21.75 | 21.90–22.02 | 21.953 |

Keep “Empezó antes y sigue ahora” visible from the opening. Duration emphasizes the timeline length; SINCE emphasizes 2024 as its start. Both complete example cards must be coherent, not a new rule paired with the old translation. The practice is “I’ve studied English ___ six months.” Keep the blank empty with no selected FOR/SINCE answer. ASR places “six” at 17.74–17.86, but waveform contains a 18.052–18.393 pause inside the combined recognized phrase: do not use that word estimate as a cut or exact highlighting boundary. The intentional gap is not an omission to repair.

### Used To take2

| Visual state | Settle by | ASR phrase onset | Waveform activity resumes near |
|---|---:|---:|---:|
| Full quoted example + Spanish translation | 2.25 | 2.36–2.54 | 2.435 |
| Changed-habit rule card | 7.80 | 8.10–8.28 | about 8.095* |
| USED TO + base emphasis, if separate | 10.40 | 10.58–10.82 | 10.529 |
| Unanswered practice, prior answer cleared | 14.40 | 14.56–14.70 | 14.592 |
| Complete native-DM CTA | 19.60 | 19.78–19.98 | 19.955 |

*There is a single-sample −40 dB threshold crossing near 7.9275, followed by low energy until approximately 8.095. The 7.80 settle target conservatively precedes both.

Translation onset is estimated 4.80–5.08; it belongs on the example card already settled at 2.25. “Que ya cambió” belongs on the next rule card from its start. Do not imply the person can never play soccer now, or that used to describes habits only. The spoken “I used to…” fragment and the blank are intentional. Do not insert “play” or another answer into that practice. Model fragment end times extend into the measured 16.985–17.594 pause; do not cut there from ASR alone.

### Trial FAQ take2 (TikTok-only)

| Visual state | Settle by | ASR phrase onset | Waveform activity resumes near |
|---|---:|---:|---:|
| First-week/no-upfront-payment card | 2.20 | 2.36–2.40 | 2.399 |
| “Si no continúas, no pagas” emphasis, if separate | 7.05 | 7.16–7.30 | 7.195 |
| Whole continuation-payment condition + four-week bracket | 9.10 | 9.28–9.36 | 9.319 |
| Details/eligibility/caption pointer | 14.55 | 14.72–14.80 | 14.794 |
| Complete GRUPO o CLUB private-message CTA | 16.65 | 16.82–16.90 | 16.827 |

Display the entire conditional payment statement together. Four-week wording starts about 11.20–11.28; “incluida la primera” starts about 13.00–13.18. Week 1 must remain **inside the same four-week bracket** throughout. Never draw a fifth week, label the trial unconditionally free, or drop the “Si continúas” qualifier while showing payment coverage.

The source gives only about 2.1 s between the proposed settled details card and CTA; add a read hold (around 4 s settled is a sensible working target for those three lines, then verify at 270×480). The CTA would have only about 2.50 s until source end, so at least another ~0.51 s is needed for a 3 s settled CTA on this illustrative map. Final entrance/exit timings may require more. Hold time must be measured in the rendered final timeline, not assumed from these numbers.

## Integration and release gates

1. Source anchor → final time = final cue start + (source anchor − source cue start). Every inserted gap shifts later anchors. Validate the actual contiguous sample map and inspect final frames immediately before, at, and after each transition.
2. Cards expand before wrapped text enters. Keep solved bilingual examples fully settled ≥2.5 s, unanswered practice ≥3 s, CTA ≥3 s after its entrance. Add silence at a verified interphrase location when needed. Do not sacrifice reading holds to a nominal 25–35 s target.
3. Opening words begin near the start of each source. Have the opening visual ready immediately or add pre-roll silence. No speech hidden under an entrance fade.
4. Preserve the single adult host/sole speaking mouth, exact approved captions and on-screen teaching roles, and one DM marketing action. Trial FAQ stays TikTok-only. Current manifest takes precedence over older scripts.
5. **Still unrun:** genuine full-file listening for intelligibility, bilingual pronunciation (including since/for, used to, and spoken 2024), timbre, delivery, artifacts, and exact speech/caption agreement; subjective full-AV hearing; final MP4/source identity and sync; final encode QA; target-app overlay/cover/playback; required AI/own-brand disclosures. This report grants no release clearance. Recheck Trial FAQ prices/conditions before publishing.

## Evidence

Included: all-six metadata/hashes, FFmpeg logs, 10 ms waveform bins, small full-file ASR for both alternatives, medium full-file ASR for all selected takes plus Since/For take2, raw word estimates, strict comparison, phrase timings, annotated waveform plots, visual-anchor evidence, manifest snapshot, and reproduction scripts. No span checks were needed to resolve a chosen-take semantic question; homophone spelling and subjective hearing cannot be settled by repeated ASR guesses.

Models: official SYSTRAN faster-whisper small revision 536b0662742c02347bc0e980a01041f333bce120 and medium 08e178d48790749d25932bbc082711ddcfdfbc4f; faster-whisper 1.2.1, CPU int8, already-cached offline models only. Full-file recognition used auto language, transcribe, multilingual, beam 5, no VAD, no previous-text conditioning. Expected text was used only for post-recognition comparison/indexing. See analysis_provenance.json.
