# Visual & motion test results, cost model, and realistic production plan

## 1. The original benchmark frame (`benchmark/cycles_960_32.png`)
**Demonstrated:** headless Cycles works; warm practical light, soft window key, depth of field, AgX tone-mapping, SSS-capable materials.
**Missing (and visibly so):** it used primitive capsule people (floating heads), no rigging, no cloth, no skin/eye/hair work, no animation. It proves the *pipeline*, not the *look*.

## 2. Character asset (see 05_ASSET_LICENSES.md - provisional)
Retrieved from npm/PyPI (the only open channels): MakeHuman base mesh, CC0 body/expression targets, 163-bone skeleton with face bones, skin weights, eye/teeth/tongue/brow/lash/hair/clothes proxies. Built reproducibly by `blender/mh_character.py` (+ `characters.py`, `materials.py`).
Maya = female, 42, via macro targets; knit top, long hair, procedural skin micro-relief + SSS.

## 3. Test shot MS-01 (silent acting; no lip-sync, mouth stays closed)
Beats (4 s): listens (small breathing, weight sway) -> eye saccade, then head turn to the clock (camera-left) -> blink -> returns; right hand lifts in an open-hand "hold on" gesture; brows/mouth shift from guarded to about-to-speak; slow push-in with depth of field tracked to her eye. Files: `renders/keyframes/*.png`, `renders/MS01_motion_test_640p.mp4`.

### What the test honestly shows
- Better than expected for free parts: believable adult proportions, convincing knit fabric, skin that reads as skin in medium shots, working blinks/brow shifts via CC0 expression targets, readable eye-line.
- Still short of "premium semi-photoreal": faces are slightly mannequin/game-grade (limited expression range, flat eye shading); hair is alpha-card geometry (no strand physics); hands curl stiffly; clothes are fitted by offsets and can clip when arms move; FK posing needs per-shot tuning; **no tested lip-sync**; facial close-ups beyond medium-close will expose these limits.
- Mitigation inside the brief: medium/over-the-shoulder shots, shallow depth of field, reaction shots, evidence inserts; avoid extreme close-ups of dialogue. A second, higher-quality tier (Blender-community characters you download locally, see below) would raise realism but needs files I cannot fetch.

## 4. Measured render speeds (this container: 4 vCPU, no GPU, Cycles CPU, OIDN denoise)
| Test | Measured |
|---|---|
| Primitive room, 960x540, 32 spp | 15.4 s/frame |
| Primitive room, 1920x1080, 64 spp | 111 s/frame |
| Maya shot still, 960x540, 32 spp | ~33 s |
| Maya shot still, 1280x720, 64 spp | 108-112 s |
| Maya shot animation, 640x360, 24 spp | 10.9 s/frame (96 frames ~ 17.5 min, measured) |
| Eevee (software GL) | not usable here |

### Estimates for a 25 s sample (600 frames @24 fps) - ESTIMATES, scene complexity will vary
Time scales roughly with pixels x samples (measured ~1.9 us per pixel-sample). This is an assumption that I only checked between 540p and 720p; 1080p is extrapolated.
| Setting | Est. per frame | Est. total in this container |
|---|---|---|
| 640x360, 24 spp (preview) | 11 s (measured) | ~1.8 h |
| 1280x720, 32 spp | ~55 s | ~9 h |
| 1920x1080, 64 spp | ~245 s | ~41 h |
**Conclusion:** previews fit in the cloud; final 1080p does not. Final renders should run on your PC (GPU Cycles/OptiX is typically many times faster than this 4-core CPU, but I have not measured your machine and will not assume a number). I will not start a local render without your approval.

## 5. Voices (item 6)
Evaluated PyPI/npm TTS options (piper-tts, kokoro-onnx, kittentts, supertonic, pocket-tts, Coqui `tts`): all packages are code only (2-480 KB wheels) and fetch voice models from Hugging Face/GitHub, which the network policy blocks. Offline robotic voices (espeak class) would fail the "natural adult American voice" requirement, so none were used. **Nothing is voiced.** The test video is silent by design.
Options for you to decide (no decision forced): (a) generate voices locally on your PC with a free engine whose voice licence you verify, and I supply scripts/timing; (b) a recording script with timestamps for whoever you choose (not necessarily you); (c) captions-only version. I will not assume you will record every character.

## 6. Oxford IPA (item 7) - see 02_SOUND_CHART_CROSSWALK.md
Chart read in full. Mismatches/uncertainties vs Oxford North American: əʊ (chart) vs oʊ (Oxford US, from prior knowledge); the "3" glyph (ʒ?); no ɪr/ʊr/ər on the chart. **Not verified against Oxford** - the site is blocked from this container. I changed nothing in your chart.
Exact evidence I need to close this: the OALD pronunciation-guide page text (oxfordlearnersdictionaries.com/us/about/english/pronunciation_english) pasted or saved, plus entry pages for any word whose transcription must be audited.

## 7. Realistic production plan (if you approve the direction)
1. You decide the three open questions (character route/licences, voices, local-render approval).
2. Build Leon, Tess, Adrian with the same pipeline (same face rig + expression keys), plus Sam (technician) as needed.
3. Shots: reuse one workshop set; ~25 shots for the whole episode, mostly 2-5 s, medium/OTS/inserts. Render previews here; finals on your PC in resumable image sequences.
4. Lip-sync only for medium-close dialogue if a tested free phoneme method is available locally; otherwise reaction/OTS staging.
5. Player + captions + IPA data from the audited pronunciation list; QA report only for tests actually run.
Time reality: the full episode is many hours of final rendering regardless of tool; a 20-30 s polished sample is realistic after approval.

## 8. Exact files/evidence still needed from you
- MakeHuman licence page text (or your decision on provisional use) - for character clearance.
- Optional: any free CC0 rigged adult .blend/.glb files you download on your PC (e.g., from sources you trust) if you want a higher-quality tier.
- OALD pronunciation page text for the Oxford crosswalk.
- Decision on voices.
