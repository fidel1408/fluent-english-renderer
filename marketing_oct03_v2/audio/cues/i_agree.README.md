# Narration input contract – I AGREE

One file per cue in this folder: `i_agree_cNN.wav` or `.mp3` (any sample rate, mono or stereo), speech only, little leading/trailing silence.
Read exactly the text below (captions may use slightly different punctuation). The pipeline never speeds up, trims or cuts narration.

| File | Text to speak |
|---|---|
| `i_agree_c01.wav` (or `.mp3`) | ¿Estás de acuerdo? |
| `i_agree_c02.wav` (or `.mp3`) | Evita: I am agree. |
| `i_agree_c03.wav` (or `.mp3`) | Di: I agree. |
| `i_agree_c04.wav` (or `.mp3`) | Agree ya es verbo; aquí no necesitas am. |
| `i_agree_c05.wav` (or `.mp3`) | I agree with you. |
| `i_agree_c06.wav` (or `.mp3`) | Estoy de acuerdo contigo. |
| `i_agree_c07.wav` (or `.mp3`) | ¿Cómo dirías: no estoy de acuerdo? |
| `i_agree_c08.wav` (or `.mp3`) | Comenta. |
| `i_agree_c09.wav` (or `.mp3`) | Clases en línea: manda GRUPO por privado. |

Cue times are NOT fixed. After the files arrive run `node build/retime.js i_agree`: each cue starts after the previous one plus its pause (`gap` in the manifest), animations and captions follow, and the total length becomes last cue end + 2.8 s static hold (target 25-30 s, reported but never forced).
