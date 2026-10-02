# Voice lines for the MP4 (replace the robotic placeholders)

Generate each line with any natural voice you are licensed to use (an Edge "Natural" voice, ElevenLabs, a human
recording…), save as **mono or stereo WAV, 44.1/48 kHz** with the file name shown, and put it in this folder.
Then run `NODE_PATH=$(npm root -g) node tools/export.mjs` — timing, music ducking and captions refit automatically.
Leave out leading/trailing silence if you can. Keep the English lines clear and slightly slow.

| File | Voice | Line |
|---|---|---|
| hook.wav    | Spanish (Mexico), friendly | ¿Ya sabes qué pedir, pero no cómo decirlo en inglés? |
| phrase.wav  | American English | I'll have two tacos, please. |
| intro.wav   | Spanish (Mexico) | Para pedir, puedes empezar con |
| introEn.wav | American English | I'll have… |
| morph.wav   | American English | I'll have a sandwich, please. |
| turn.wav    | Spanish (Mexico) | Ahora tú. Pide una limonada en voz alta. |
| reveal.wav  | American English | I'll have a lemonade, please. |
| cta.wav     | Spanish (Mexico) | Practica frases que sí vas a usar. Escríbenos "inglés". |
