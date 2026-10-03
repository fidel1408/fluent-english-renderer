# Narration input contract – I AGREE (20 s)

Drop one file per cue in this folder. Extensions `.wav` or `.mp3`, any sample rate, mono or stereo.
Speech only (no music), little leading/trailing silence, one take per file, **exactly the text in the last column**
(the punctuation is for captions; read it naturally). The pipeline never speeds up, slows down or trims narration.

| File | Planned window (s) | Scene | Text to speak |
|---|---|---|---|
| `i_agree_c01.wav` (or `.mp3`) | 0.35–1.95 | hook | ¿Estás de acuerdo? |
| `i_agree_c02.wav` (or `.mp3`) | 2.65–4.35 | incorrect | Evita: I am agree. |
| `i_agree_c03.wav` (or `.mp3`) | 5.25–6.45 | correct | Di: I agree. |
| `i_agree_c04.wav` (or `.mp3`) | 6.65–9.15 | correct | Agree ya es verbo; aquí no necesitas am. |
| `i_agree_c05.wav` (or `.mp3`) | 9.65–11.15 | example | I agree with you. |
| `i_agree_c06.wav` (or `.mp3`) | 11.35–13.15 | example | Estoy de acuerdo contigo. |
| `i_agree_c07.wav` (or `.mp3`) | 13.70–16.00 | practice | ¿Cómo dirías: no estoy de acuerdo? |
| `i_agree_c08.wav` (or `.mp3`) | 16.20–16.85 | practice | Comenta. |
| `i_agree_c09.wav` (or `.mp3`) | 17.05–19.55 | practice | Clases en línea: manda GRUPO por privado. |

Scene windows from the brief: hook 0–2.4 · incorrect phrase 2.4–5 · correct 5–9.4 · example 9.4–13.4 · practice 13.4–20.
Each file must fit before the end of its scene window (c09 before 19.65 s). `node build/retime.js i_agree` measures the
real durations, places each cue at its planned start (or just after the previous cue), and reports any cue that does not fit.
