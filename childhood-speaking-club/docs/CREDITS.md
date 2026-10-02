# Credits and licences

## Fluent English logo
`assets/fluent_english_logo.png` is the existing Fluent English logo from this repository
(`fluent_english_logo.png`, 3444 × 1875, transparent background). It is displayed unchanged,
with its original proportions, on a white card. No substitute or imitation logo is used anywhere.

## Sound chart
`assets/sound_chart.jpg` is a frame taken from the Fluent English "Sound Chart" video supplied for this project.
It is only shown on request (Settings → Sound chart). The pronunciation symbols in the lesson follow this chart.

## IPA font
`css/ipa-font.css` embeds a subset (Latin, IPA and punctuation ranges only) of **DejaVu Sans**,
which is free to use, copy and embed under the Bitstream Vera / DejaVu licence
(<https://dejavu-fonts.github.io/License.html>). It is embedded so that the IPA symbols display correctly
on any teaching laptop, without needing an installed font.

## Pronunciation data (build time only)
IPA was generated at build time from the **CMU Pronouncing Dictionary** (American English), via the npm package
`cmu-pronouncing-dictionary` (BSD-style licence), and converted to the Fluent English Sound Chart symbols by `tools/ipa.mjs`.
The lesson itself loads none of this; only the generated `js/lexicon-ipa.js`.

## Definitions and examples
`tools/glossary.txt` was written for this lesson. No dictionary text was copied.

## Music and sound
Background music and the timer chime are generated live in the browser by `js/audio.js` (simple sine and triangle tones).
They are original, contain no recorded or copyrighted material, and are optional. No childhood songs or television audio are used.

## Narration voices (recorded)
The mp3 files in `audio/` were generated once, on the build machine, with **Kokoro-82M** (open-source neural text-to-speech by hexgrad, Apache-2.0 licence)
through `kokoro-onnx` (MIT licence), using the voices `af_heart` (Maya) and `am_michael` (Theo). Phonemes come from espeak-ng, which was used only while generating the audio.
Nothing is uploaded when the lesson runs, no paid voice service was used and no credits were consumed. If a recording is missing, the browser's own speech voices are used instead.
