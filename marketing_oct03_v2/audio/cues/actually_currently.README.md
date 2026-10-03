# Narration input contract – ACTUALLY / CURRENTLY

One file per cue in this folder: `actually_currently_cNN.wav` or `.mp3` (any sample rate, mono or stereo), speech only, little leading/trailing silence.
Read exactly the text below (captions may use slightly different punctuation). The pipeline never speeds up, trims or cuts narration.

| File | Text to speak |
|---|---|
| `actually_currently_c01.wav` (or `.mp3`) | ¿Actually significa actualmente? |
| `actually_currently_c02.wav` (or `.mp3`) | Actually suele significar en realidad o de hecho. |
| `actually_currently_c03.wav` (or `.mp3`) | Currently significa actualmente. |
| `actually_currently_c04.wav` (or `.mp3`) | Do you live in London? |
| `actually_currently_c05.wav` (or `.mp3`) | Actually, I live in Monterrey. |
| `actually_currently_c06.wav` (or `.mp3`) | Para decir actualmente: I'm currently studying English. |
| `actually_currently_c07.wav` (or `.mp3`) | Ahora tú. |
| `actually_currently_c08.wav` (or `.mp3`) | ¿Cómo dirías: actualmente trabajo desde casa? |
| `actually_currently_c09.wav` (or `.mp3`) | Escribe tu versión. |

Cue times are NOT fixed. After the files arrive run `node build/retime.js actually_currently`: each cue starts after the previous one plus its pause (`gap` in the manifest), animations and captions follow, and the total length becomes last cue end + 3.0 s static hold (target 28-34 s, reported but never forced).
