# Timestamped audio cue sheet

All audio is code-generated: narration by local speech engines (MP4) / the viewer’s own `speechSynthesis` voices (browser preview); music, ambience and effects by Web Audio synthesis (`src/audio.js`). Music: 100 BPM swung C-major groove (Cmaj7 – Am7 – Dm7 – G7 loop, final Cmaj9 at 28.8 s): electric-piano (FM), plucked bass, soft kick, brushed snare, shaker, vibraphone melody from 11.5 s.

## Voice

| Time | Cue | Level / ducking |
|---|---|---|
| 1.20–3.89 | v1 ES: “¿Cómo pedirías un café en inglés?” | music → 20%, ambience → 50% |
| 4.70–6.79 | v2 EN: “Could I have a coffee, please?” | music → 10%, ambience → 35% |
| 8.10–10.26 | v3 ES: “Una forma amable de pedirlo.” | music → 20%, ambience → 50% |
| 12.55–15.13 | v4 EN: “Could I have an iced latte, please?” | music → 10%, ambience → 35% |
| 17.45–20.53 | v5 ES: “Escoge tu bebida y pídela en voz alta.” | music → 20%, ambience → 50% |
| 24.60–29.12 | v6 ES: “Practica inglés para tu vida diaria. Escríbenos INGLÉS.” | music → 20%, ambience → 50% |
| 20.55–23.65 | RESPONSE PAUSE — no narration | music → 55%, ambience → 70% |

## Effects

| Time | Effect | Note |
|---|---|---|
| 0.50 | doorChime | Door chime as the customer enters |
| 3.85 | whoosh | Soft transition to the phrase scene |
| 4.00 | accent | Headline-to-phrase accent |
| 10.90 | whoosh | Soft transition |
| 11.40 | textChange | Text-change accent as "coffee" becomes "latte" (before the voice) |
| 12.00 | iceClink | Ice clink as the iced cup appears (before the voice) |
| 16.90 | whoosh | Soft transition to viewer turn |
| 20.55 | yourTurn | Gentle "your turn" bloop at start of response pause |
| 23.55 | doneChime | Soft end-of-pause chime |
| 24.45 | cupPlace | Cup placed on the counter |
| 27.50 | logoReveal | Soft sparkle as the logo appears (ducked under narration) |
| 29.25 | closing | Original closing accent after the narration ends |

## Ambience (continuous)

Room tone (filtered pink noise), three slowly modulated murmur bands, occasional cup/spoon pings (scheduled only outside speech windows), one short steam-wand hiss at 15.35 s. Whole bed fades out 29.55–30.0 s.

## Mix

Stem gains (see `tools/mix.json`): voice 1.0, music 0.34, ambience 0.8, effects 1.0; then loudnorm −16 LUFS / −3 dBTP and a limiter.
