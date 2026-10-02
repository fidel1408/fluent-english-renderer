# Sound cue sheet (all sounds original, synthesised in `tools/make_audio.py`)

Layers (separate files in `out/audio_layers/`, already ducked so they sum to the master): narration · english · music · sfx · ambience.

**Music** (96 BPM, 12 bars = 30 s, no lyrics): Am9 → Dm7 (mild tension, dark pad + low bass, rising texture) → *dip at 3.95 s* → F maj (warm, soft plucks) → Cadd9 → Am7 (lowered, sparse for the English model) → F → C → Am7 (quiet practice space: very soft pad + airy shimmer only) → F → G (lift: pad, plucks, soft band-limited shaker) → F → C resolved (confident close).
**Ducking:** music −7.5 dB under Spanish narration, −11 dB under the English teaching voice; SFX −5 / −18 dB; ambience −3 / −6 dB; 0.5 s release.

| Time (s) | Layer | Cue | Notes |
|---|---|---|---|
| 0.12 / 0.30 | SFX | Incoming-question ping (2 soft notes) | with the question bubble + ripple |
| 1.52 | SFX | “Understood” check tick | very soft |
| 2.35–3.95 | SFX | Soft rising texture | filtered noise swell, then the pause |
| 3.95 | SFX | Bloom whoosh | scene “opens up” |
| 5.75, 5.90, 6.05, 6.20, 6.40 | SFX | 5 word-placement clicks (pitch creeps up) | sentence assembling |
| 6.40 | SFX | Soft sparkle; 6.38 cloth movement | open-hand gesture |
| 7.95 | SFX | Sweep to lesson card | ends before the English model (8.75) |
| 8.75–12.65 | — | **No effects**; music at −11 dB duck | English model + slow repeat |
| 12.80 | SFX | Blank-slot soft tick | after the model audio ends |
| 13.95 | SFX | Sweep to viewer scene | |
| 14.95 / 15.37 / 15.79 | SFX | Option-card soft pops (under narration, −31 dB) | |
| 16.55–19.75 | Music/Amb | Quiet texture only | speaking space, no effects |
| 19.80 | SFX | Single soft chime | time’s up |
| 19.95 | SFX | Sweep + warm musical lift | |
| 20.50 / 21.0 / 22.0 / 22.45 | SFX | Logo shimmer, call-window pop, chat bubbles | quiet |
| 24.80 | SFX | Sweep to CTA | |
| 26.4–27.0 | SFX | 6 soft typing ticks (letters of “INGLÉS”) | |
| 28.25–28.37 | SFX | Closing accent (3 bell notes) | after the last word; tail rings to 30.0 s, faded in the last 50 ms |
