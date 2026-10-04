# Should for Advice — repair QA report (final bundle)

Build: `should-for-advice-final.html`, sha256 `829d981b06b4643fb78a52be90b84a5b5049d186fba3b2dd7fb4eeaea6b46949`, 8086827 bytes.
Audited original: sha256 `f0c15a2bf1c1f8e633739e39eb27a9ad61f41fb1f51d29bedbc26e92dd121bb2` — preserved byte-for-byte in `baseline/` (zip + hashes + provenance).

## Results (one suite, `tools/regress.mjs`, 100 assertions; every result file carries the SHA-256 of the build it ran on)
| Build | Pass |
|---|---|
| Original audited build | 45 / 100 (`regress-baseline.json`, same suite, original HTML extracted from `baseline/`) |
| Checkpoint 1 (previous delivery) on this final suite | 53 / 100 (`regress-checkpoint1-on-final-suite.json`) |
| **This final build** | **100 / 100** (`regress-checkpoint2.json`) |
Other suites on this build: qa-controls 81/81, qa-audio 9/9 (real playback), qa-crawl 54 segments, 0 errors.

## Repairs
1. **Form checker.** Strict clause grammar: every `should` clause validated; stacked modals, "not should", determiner-only subject, repeated should, `to`/inflected verbs in any clause are rejected; subjects: pronouns, determiner+nouns, names, possessives, "X and Y"; harmless adverbs and "I think…" frames allowed. Anything outside the grammar is **needs teacher review** (never green, never red). Fuzz: 1,810 generated invalid sentences never green; 200 generated valid ones accepted; 38-sentence positive / negative / unknown matrix; 75-sentence fixture table. Confidence label (checked / definite error / needs teacher review) and a standing limitation note are visible in the UI.
2. **Reveal** is item-scoped; the gate's Show answer button is always built from the current item (tested visible + unobstructed + working, desktop and 390 px).
3. **Build Clear** gives a fresh attempt.
4. **Branch facts**: lamps follow the actual final facts (27 combinations + twist invalidation + "later train ≠ tickets").
5. **Pause**: scene clock is pausable; consequence→closing comment is one ordered audio chain. **Delayed callbacks** (repair result) are item-scoped, cancelled by Next/seek, and shown immediately when paused.
6. **Phones**: art stays cinematic; captions with English+IPA, native-size dock, wrapping control bar, persistent Show-controls button. Checked at 390×844, 844×390, 1600×900 (words ≥17 px / IPA ≥12 px by design on phones; test thresholds 16/11 px). **Switching layout no longer rebuilds the scene**: same scene object, attempts, typed text, branch facts, reveal state, lesson time and play/pause state survive both directions, mid-answer and post-answer (48 switch tests).
7. **IPA**: n't, Priya's, Maya's, role-play, new words filled; /əʊ/ convention per the owner's instruction; sh/ou grouped in the phoneme diagram.
8. **Echo question** names the standard inverted form; class clock freezes at the end; planned-vs-actual is explained.

## Limits — please read
* Audio pronunciation and emotion were **not** verified (no ASR, no listening). Weak-form clip came from an explicit phoneme string, also unverified.
* IPA is generated from CMUdict plus manual overrides; **not** verified against Oxford. I have not seen the owner's uploaded chart; /əʊ/ was applied as instructed. Please confirm which notation is canonical.
* The free-text checker proves only simple should/shouldn't sentences; the structured builder reliably assesses should + base verb; open reflection has no automatic score.
* My own earlier QA (before this repair) skipped choice/match/listen/open items because those controllers were not registered; that gap is closed (controllers register and are exercised).
* Layout was verified in headless Chromium at three viewports, not on physical phones or other browsers (CSS `zoom` is used in the phone dock).
* Licensing: see `docs/MEDIA_PROVENANCE.md`. Components are separate (model/voices Apache-2.0 as declared upstream; kokoro-onnx 0.6.1 wrapper MIT; phonemizer/eSpeak-NG GPL obligations only if their runtime is redistributed — not shipped). No commercial clearance is claimed. Model/voice hashes are **recorded and publicly corroborated, not re-hashed locally** (binaries absent). 261/265 MP3s and the logo are byte-identical to the audited build; 4 closing-comment clips were intentionally replaced.
* Existing private artifact (claude.ai/artifact/7GDqXNW6DD8S2kg1mAp649) was **not** updated: I cannot confirm from here that it is owner-only and was told not to change permissions. It still contains the pre-repair build.
