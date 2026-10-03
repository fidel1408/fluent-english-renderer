# Status: Gate F (visual-direction approval) - NOT yet reached

Done and real: environment tests, sound-chart inspection + crosswalk, locked-facts ledger, benchmark Blender scene (`blender/benchmark_scene.py`) and test renders (`benchmark/`).
Not done (nothing claimed): no animated sample, no voices, no music, no player, no captions/IPA data, no Oxford verification.

## Honest findings that change the plan
1. **Semi-photoreal humans are not achievable in this cloud container**: every character-asset host is blocked and there is no GPU. The benchmark render proves the room/lighting pipeline, but stand-in primitives look nothing like the target.
2. **Cloud rendering cost**: ~15 s/frame (540p) or ~111 s/frame (1080p) -> a full episode is infeasible here.
3. **No natural free voices reachable**; **Oxford is unreachable**, so IPA cannot be dictionary-verified here.

## Your decisions (the only blockers)
- **Visual route** - (1) *Stylised 3D*: Blender, hand-built characters I can fully script and render (consistent, honest quality; recommended). (2) *Semi-photoreal*: needs you to download free rigged characters (e.g. MPFB/MakeHuman, licence CC0) on your Windows PC and render locally; I supply scripts. (3) *Hybrid*: stylised characters now, upgrade later.
- **Rendering location**: cloud preview (540p) + your PC for finals? (I will ask before any heavy local render.)
- **Voices**: you record, or you generate locally with a licence you verify.
- Chart items: əʊ vs oʊ; the "3" glyph; adding ɪr/ʊr/ər.
