# May, Might, and Could — build progress (handoff note)

Status: IN PROGRESS. Nothing here is a finished lesson yet.

## Done
- Folder scaffold, embedded fonts (Source Serif 4, Source Sans 3, Noto Sans subset for IPA), trimmed logo copy (original logo files untouched).
- src/js/00-util.js (helpers, easing, tween engine)
- src/js/10-rig.js (articulated SVG character rig + 6-person cast) — NOT yet rendered or visually checked.

## Environment findings
- No Present Perfect lesson exists in this repo (it is a PNG slide-renderer API). Reference dropped at user's request.
- ElevenLabs host is NOT usable here (api.elevenlabs.io returns 401; the injected host 502s). No API keys were used.
- Oxford Learner's Dictionaries is blocked by the network proxy. IPA CANNOT be verified against Oxford; must be disclosed.
- Local open-source TTS works: Kokoro ONNX (venv + model in the session scratchpad, not in the repo). Needs a symlink for espeak data (see session notes). Planned voices: af_heart narrator; am_michael / af_bella etc. for dialogue. I cannot listen to audio; selection is by published voice grades plus objective checks.
- Playwright 1.56 + Chromium are available for testing.

## Next
1. Art test page: render the rig, fix proportions (screenshots).
2. Scenes, bubbles, IPA word-unit component, timeline/runner, UI.
3. Content for the 7 chapters (45 segments totalling exactly 60:00), then generate audio and build.
