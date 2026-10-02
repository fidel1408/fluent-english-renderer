# Narration (local neural speech synthesis — no API, no key, no upload)

`python3 voice/build_narration.py` writes `audio/<clip>.wav` for the 7 clips. Models are open-source and run on CPU (`bash voice/setup_voices.sh` downloads them; ~0.6 GB).

## What was available and what was chosen
| Source | Result |
|-------|--------|
| Browser / OS voices (`speechSynthesis.getVoices()`) in this environment's Chromium | **none** (empty list). Browser speech also cannot be captured into an MP4 export, so it is not used. |
| eSpeak-NG / MBROLA (apt) | available but formant/diphone-robotic; not used |
| Piper **es_MX claude (high)** | **chosen — Spanish narrator** (Mexican Spanish). Round-trip Whisper word error 0.08 on the script lines vs 0.28 for Piper es_MX ald (medium) and 0.37–0.46 for Kokoro's Spanish voices |
| Kokoro **am_michael** | **chosen — English examples** ("I spend money on groceries.", "I wasted money on this gadget.") — US male voice matches the on-screen character; 0 % word errors, natural pitch movement (≈3 semitone s.d.) |
| Kokoro **af_sarah** | **chosen — the English words inside Spanish lines** (*Spend*, *Waste*, *Fluent English*): the Spanish model never pronounces them |
| Rejected English candidates | Piper lessac-high said "spent" for "spend" (WER 0.27); Kokoro am_eric said "Zbend"; others fine but less even |

"Previewing" here means synthesising every candidate on the real script lines and measuring them objectively (speech-to-text round trip with Whisper, pitch variation, speaking rate) — I cannot listen, so **the final choice still needs a human ear** (see QA report).

## Pacing, pauses, emphasis, pronunciation
- Per-clip speed (0.92–1.08), explicit pauses between phrases (0.3–0.4 s before the second sentence), silences trimmed to 30 ms, levels matched (−21 dBFS RMS) and 8 ms fades.
- English words are spoken by English voices so *Spend / Waste / Fluent English* are correct.
- **Known weak spot (found and worked around):** the Spanish voice under-voices a *word-initial* "g" in "gastar" (heard as "castar"/"hasta"; every Piper and Kokoro Spanish voice tested did this). The build therefore renders extra takes and keeps only a take that **both** Whisper models transcribe correctly ("gastar dinero y desperdiciarlo…", "es gastar…"), using a lead-in word that is cut away at an acoustic valley. No audio is edited by hand. This is a quality-control loop, not a guarantee — please listen to the hook and the "Spend es gastar" line.
- Result per clip is logged in `audio/narration_report.json` (duration, level, what Whisper heard).

## Licences
Piper es_MX claude: Apache-2.0 · Kokoro: Apache-2.0 · Whisper: MIT (checking only). The generated audio is yours to use.
