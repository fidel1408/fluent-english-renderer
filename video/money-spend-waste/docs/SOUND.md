# Sound design — "Spend or Waste?"

Everything except the narration is synthesised **in code** (Web Audio oscillators, filters and seeded noise — no samples, no downloads, no services): `src/synth.js` (instruments), `src/soundtrack.js` (composition, cues, ducking, mix). The narration is locally synthesised speech ([voice/README.md](../voice/README.md)).

## Four independent layers (preview sliders + separate stems)
| Layer | What it contains |
|-------|------------------|
| **Voice** | Spanish narrator (Piper es-MX), English example voice, English words inside Spanish lines. Light high-pass, +2 dB presence, gentle compression. |
| **Music** | Original piece at 126 BPM, restarted on each scene's downbeat. Hook: curious marimba question over a soft pad (unresolved). Spend: C–G–Am–F groove — soft kick, finger snaps, hats, plucked bass, Rhodes offbeats, marimba melody. Waste: A-minor/F/G, kick-less, rim clicks, a hollow clarinet "oh well" line. Speak: airy harp arpeggios, then **stops**. CTA: F–G–C–C, four-on-the-floor, claps, brighter melody, a warm major-chord finale with bell shimmer under the last words. |
| **Ambience** | Hook: street rumble + distant shop bell + passing car. Spend: market murmur (3 filtered crowd beds), fridge hum, scanner beeps, cart rattle, store chime. Waste: quiet room tone, ticking clock. Speak: airy shimmer that fades out. CTA: calm room + soft keyboard typing while "Escríbenos INGLÉS" is read. |
| **Effects** | Whoosh + low hit on every scene change (a riser lifts out of the quiet before the CTA); pops for each card/phrase; a "?" boing; coins "ching" in a pentatonic scale as they land on the shelf; muted-trombone "oh well" after the gadget line; box thud + dust puff; four rising marimba pops for the picture choices; a soft two-note "your turn" cue and a "time" ding bracketing the pause; logo sparkle, laptop whoosh, greeting pop, button ding + message swoosh. |

## Mixing rules (implemented in `duckCurve`)
- **Under speech** (from 0.12 s before each clip until it ends): music −12 dB, ambience −8 dB, effects −3 dB; attack 0.1 s, release 0.5 s.
- **Speaking challenge, 20.05–22.9 s:** music and ambience go to *true silence*; the only sounds are a soft two-note cue at the start and a single ding at the end. Measured: pause-window RMS −54 dBFS in the final MP4 audio vs −18 dBFS during speech.
- Master: glue compressor (−14 dB threshold, 3:1) → loudness-normalised to −16 LUFS integrated, true peak ≤ −1.5 dBTP (measured −15.3 LUFS / −3.5 dBFS peak).
- Measured layer levels inside the delivered audio (relative to the whole file): voice −0.8 dB, music −12.1 dB, effects −16.2 dB, ambience −18.7 dB.

## Preview controls
`Start` (button or big overlay, Space) · `Pause/Resume` · `Restart` · scrubber · `Mute` (M) · Voice / Music / Ambience / Effects sliders (remembered). One source set per layer plays at any time; start/seek/replay always stop the previous set, so audio never overlaps. Visuals follow the audio clock.

## Export (nothing is "recorded")
`node scripts/render_audio.mjs` renders the four stems and the mix **offline** with the same code → `audio/export/*.wav`; `scripts/render.mjs --audio audio/export/soundtrack.wav` muxes it as AAC 192 kb/s. Because the audio is computed rather than captured from a browser tab, speech/music/effects cannot go missing; `scripts/verify_video_audio.py` then decodes the MP4 and proves each layer is inside it (see QA report).
