# Production notes — "Spend or Waste?"

## Two alternative opening hooks (0–3 s)
1. **"¿Gastas dinero… o lo desperdicias? En inglés no se dice igual."** (on-screen: SPEND vs WASTE, same visuals)
2. **"Una palabra cambia todo: ¿spend o waste?"** (character holds the bag, shrugs, two phrases pop in)
To use one: change the `es_hook` text in `src/timeline.js` (CLIPS + the first CAPTIONS entry), re-record that clip, run `measure_audio.mjs --write`.

## Teaching accuracy (as implemented)
- *Spend money* = use money to pay for something; no inherent judgment. The scene never says groceries are "good".
- *Waste money* = the speaker's own opinion that the spending was unnecessary/not worthwhile. The gadget is that fictional speaker's view only.
- Pattern shown: **spend money on + something**. The waste example uses **wasted** (past) because the purchase already happened.

## Design choices worth knowing
- Layout (1080×1920): teaching text on top (y≈250–560), character in the middle, Spanish captions at the bottom (y≈1390–1560). Platform UI zones (top ≈250 px, bottom ≈340 px) stay free of captions/logo/CTA. Preview → "Safe zones" button.
- Colors: deep navy, warm ivory, emerald, teal, coral, gold. Fonts (bundled, OFL): Nunito, Noto Sans (IPA glyph coverage).
- Character rig (`src/man.js`): shoulder → elbow → wrist → palm → 3-segment fingers + thumb; arms always connected. Forearm foreshortening (`fs`) is used for forward-reaching poses. Poses: hanging + bag grip, raised open palm (wave), apple hold with curled fingers, two-hand box hold, open-palm shrug, invitation gesture.
- Caption/IPA timing is derived from clip start/duration, so importing real audio re-syncs captions and word highlights automatically.
- The animation is a pure function of time (`frameSVG(t)`), which is why frame-by-frame MP4 export is deterministic.

## Not included on purpose
Background music (none supplied/licensed), prices/offers, testimonials, real-person likenesses.
