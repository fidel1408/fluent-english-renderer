# Voices: what was done, and what is still unresolved

## Quality gate status: **NATURALNESS NOT VERIFIED BY EAR — treat as UNRESOLVED until you audition the clips**

The build environment cannot play or listen to audio. I can report measurements and engineering choices, not how the voices sound to a person.
Please play three or four clips (open `audio/` — e.g. `ch2_intro.mp3`, `ch4_r2.mp3`, `ch6_circ.mp3`, `comp_n.mp3`) before class. If they do not meet your standard,
use **Sound → Teacher reads** (each line appears on screen with the exact script in `docs/TEACHER-NARRATION-SCRIPT.md`) or **Narration off**. Nothing is presented as a finished natural-voice solution.

## What was inspected

* Local system: no TTS voices installed (no espeak/festival/flite/piper). Nothing "default" was reused.
* ElevenLabs: the project proxy lists an ElevenLabs connection, but the API answered 401/502 without a usable authorized key, and no paid credits may be spent without permission. Not used.
* Browser `speechSynthesis` voices: not used (the previous experience's robotic problem).
* **Kokoro-82M** (neural TTS, Apache-2.0, open weights, runs offline on CPU): downloaded and auditioned on a real lesson passage ("When someone says, I can't make it tonight, what do you know, and what are you only assuming?") and on Alex's cancellation message.
  Audition was by acoustic measurement only (median pitch, range, silence/pacing), not by listening.

## Voice assignment (American English, no pitch shifting, speed 0.93–0.98)

| Role | Voice | Measured median f0 (10th–90th percentile) |
|---|---|---|
| Narrator | `af_heart` | 200 Hz (168–262) |
| Maya | `af_bella` | 202 Hz (177–247) |
| **Alex** | `am_michael` | **117 Hz (95–149)** — natural adult male medium-low register; selected over `am_adam` (124), `am_fenrir`, `am_liam`, `am_eric` (higher, wider range). `am_onyx` (90 Hz) is reserved for Sam, an older character. No artificial lowering was applied. |
| Sam | `am_onyx` | 90 Hz (80–114) |
| Nora | `af_nova` | 166 Hz (130–248) |

Clips are loudness-normalised (-18 LUFS), trimmed, and stored as 64 kbps mono MP3 (1.2 MB total). No effects, no rate extremes.

## Playback behavior (tested)

One voice channel: starting any line first stops the previous one, so replays, chapter changes and reveals never overlap or restart unexpectedly. Pause freezes the clip and the scene; resume continues from the same point.
Narration plays only after a teacher click and never during discussion steps. Character mouths follow a loudness envelope extracted from each clip. Music (optional, original, generated live in the browser) is off by default, ducks under narration and is silenced during discussion.

## Regenerating or swapping voices

`tools/gen-audio.py` rebuilds all clips and `audio/manifest.js`. Replace the model/voice names there (or drop in your own recorded files with the same names and update the manifest durations) to use a different, authorized voice.
