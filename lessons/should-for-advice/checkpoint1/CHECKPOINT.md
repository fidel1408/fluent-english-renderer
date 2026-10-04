# Should for Advice — repair checkpoint 1

HTML: should-for-advice-checkpoint1.html  (sha256 dc56a36bd387982f47483ee42b475757e9febae35247b52e95a0d757c8563120)
Original audited build: sha256 f0c15a2bf1c1f8e633739e39eb27a9ad61f41fb1f51d29bedbc26e92dd121bb2 (preserved in the ZIP under baseline/).

Regression suite (tools/regress.mjs, identical assertions on both builds):
- original build: 11/42 pass (regress-baseline.json)
- this checkpoint: 42/42 pass (regress-checkpoint1.json)

Implemented: form validator (items 1), item-scoped Reveal (2), Build Clear reset (3), facts-based scenario state with twist invalidation (4), pausable scene clock + ordered audio chain (5), adaptive phone layout with captions/dock (6), IPA gaps + /əʊ/ convention + sh/ou grouping (7), echo-question wording + frozen class clock + planned-vs-actual note (8).

Not yet done: screenshot/contact-sheet evidence set, QA report, tests that operate the dock layout by touch (clicking answers at 390 px), artifact update.
Limits: audio pronunciation/emotion NOT verified (no ASR/listening); IPA is generated + reviewed, not verified against Oxford or the owner's chart (not seen). Only 4 new Kokoro clips were synthesised locally; all other recorded media unchanged.
