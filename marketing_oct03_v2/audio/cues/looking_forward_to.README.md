# Narration input contract – LOOKING FORWARD TO

One file per cue in this folder: `looking_forward_to_cNN.wav` or `.mp3` (any sample rate, mono or stereo), speech only, little leading/trailing silence.
Read exactly the text below (captions may use slightly different punctuation). The pipeline never speeds up, trims or cuts narration.

| File | Text to speak |
|---|---|
| `looking_forward_to_c01.wav` (or `.mp3`) | ¿Cómo dices: tengo muchas ganas de verte? |
| `looking_forward_to_c02.wav` (or `.mp3`) | See you on Saturday! |
| `looking_forward_to_c03.wav` (or `.mp3`) | I'm looking forward to seeing you. |
| `looking_forward_to_c04.wav` (or `.mp3`) | Después de look forward to, usa un verbo en ing. |
| `looking_forward_to_c05.wav` (or `.mp3`) | Como seeing. |
| `looking_forward_to_c06.wav` (or `.mp3`) | O un sustantivo: I'm looking forward to the weekend. |
| `looking_forward_to_c07.wav` (or `.mp3`) | Ahora tú: I'm looking forward to... |
| `looking_forward_to_c08.wav` (or `.mp3`) | ¿Cómo la completas? |

Cue times are NOT fixed. After the files arrive run `node build/retime.js looking_forward_to`: each cue starts after the previous one plus its pause (`gap` in the manifest), animations and captions follow, and the total length becomes last cue end + 3.3 s static hold (target 28-34 s, reported but never forced).
