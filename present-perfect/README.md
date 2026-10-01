# Present Perfect — Fluent English animated grammar lesson

A self-contained, code-drawn 16:9 animation (Canvas 2D) with a real timeline, play/pause/replay, scrubber, chapter navigation,
captions, four interactive practice checks, and a narration + music soundtrack.

* **Open `dist/present-perfect.html`** in Chrome, Edge or Safari. One file: fonts, logo, timeline, IPA dictionary, narration and music are embedded.
* Teaching on Zoom: share the browser tab (tick *share tab audio*) or the window. Press **Space** to pause, **1/2/3** to pick an answer.
* No MP4 is included. Exporting a video is a **separate, explicit step** (see below). The HTML file is the product; do not call it a rendered MP4.

## STATUS — read this first

| Item | State |
|---|---|
| Animation, art, teaching graphics, practice checks, player | Done and tested (see QA) |
| **Narration voice** | **Temporary stand-in.** The audio in `dist/` is a local open-source voice (Kokoro v1.0) used only to produce measured timings. **ElevenLabs is the chosen voice engine** and has not generated any audio yet, because the build container could not reach `api.elevenlabs.io` until late in the session (a new session is needed for the new network/credential settings to apply). |
| IPA | **Not verified against Oxford Learner's Dictionaries (US)**: that site is blocked from the build environment. See `docs/ipa_report.md`. No Fluent English sound chart was supplied. |
| Length | **5:40** with the stand-in voice (includes four 5.5 s thinking pauses and a 7 s speaking pause). Slightly over the 4–5 min target; see "Length" below. |

### Finish the ElevenLabs narration (one command each)

Prerequisite: the environment must allow `api.elevenlabs.io` and inject the key (Environment settings → API credentials: header `xi-api-key`, allowed website `api.elevenlabs.io`) or have `ELEVENLABS_API_KEY` set. The key is never stored in this repo.

```bash
cd present-perfect
pip install kokoro-onnx piper-tts soundfile scipy numpy cmudict      # only the helpers; Kokoro is not needed for the ElevenLabs run
python tools/tts_generate.py --list-voices                            # confirm the voice ids in src/script.json -> "elevenlabs" (they are UNVERIFIED defaults)
python tools/tts_generate.py --audition <voice_id> <voice_id> ...     # renders the audition sample into build/audition/
python tools/tts_generate.py --engine eleven                          # ~4,000 characters = ~4k credits on eleven_multilingual_v2; per-line caching, re-runs are free
python tools/music.py && python tools/build.py                        # music ducking follows the new timing; rebuilds dist/present-perfect.html
```
Then re-run `python tools/asr_check.py <whisper-small.en dir>` (objective intelligibility check) and **listen** to: *I've, you've, she's, haven't, hasn't, have/has, been, gone, eaten, done* and the four practice lines.
Scene timing, captions, mouth movement, bubbles and music ducking all re-derive from the measured audio automatically (`build/timeline.json`).

## What is in the lesson (≈5½ minutes, 10 chapters)

1. **Past and now** – adult story (Daniel/Maya): *I lost my keys yesterday* vs *I've lost my keys*; what the speaker communicates; past-to-now connection.
2. **Form** – subject + have/has + past participle (colour-coded puzzle tiles *and* first/second/third labels), I/you/we/they have – he/she/it has, third verb form (work/see/go/be/eat; no *has went*), contractions (*I've*, *She's* = has here, can also be *is*). **Check 1** have/has.
3. **Negatives and questions** – haven't/hasn't, Have/Has + subject, short answers, no do/does, question words (*What have you done? How long have you lived here?*). **Check 2** participle.
4. **Experience** (*Have you ever visited Canada? / I've never… / I visited Canada in 2022*).
5. **Result** (report; *already*/*yet* placement).
6. **Still true** (*for* = length, *since* = start; *for/since* do not always force present perfect). **Check 3** for/since.
7. **Today** (unfinished period vs *yesterday*; labelled *Advanced note* on speaker's view).
8. **Past time** (finished-time words → simple past). **Check 4** present perfect vs simple past.
9. **Notes** – American English: simple past with just/already/yet is normal too; *been* vs *gone*; present perfect continuous is a separate form, not in this lesson.
10. **Review** + spoken-production invitation + end card with the real logo.

Suggested follow-up episodes: *Present perfect continuous*; *Present perfect vs simple past: mixed practice*.

### Length
The brief asks for 4–5 minutes and also lists 14 required points. Covering all of them accurately with four checks takes ~5:30. Teaching speech is ~4:15; the rest is practice time and pauses. To get nearer 5:00 without dropping content: speak faster (ElevenLabs speaking rate), or trim `src/script.json` lines marked as secondary (*c3, f4, u5, p3*), then re-run the pipeline.

## Controls
Play/Pause · Replay · scrubber (ticks = chapters, ★ = practice) · chapter buttons · Voice / Music sliders · Mute · Captions (with IPA) · **Pause at practice questions** (default on: stops at each check so students can answer, then Play reveals the answer) · speed 0.8/1/1.2 · 30/60 fps · full screen · transcript.
Keys: Space, ←/→ (5 s), [ ] chapter, 1–3 pick, C captions, M mute, F full screen, R replay.

## Performance design
* Rendering is a pure function of time `render(t)`, so seeking/replay are exact; the master clock is elapsed `requestAnimationFrame` time re-synced to the narration `<audio>` whenever it drifts > 80 ms.
* Nothing runs when paused (no rAF) or when the tab is hidden (auto-pause). 30 fps cap by default (60 optional).
* All five scenes are drawn once into offscreen canvases (before play starts); characters are vector paths with reusable gradients; speech bubbles reuse a cached outline and only the tail is recomputed.
* Adaptive resolution: if frames take > 70 % of the frame budget the canvas backing size drops (down to 55 %) and rises again when idle.
* No video, no per-frame pixel effects, no unbounded loops. `dist/present-perfect.html` ≈ 9.8 MB.

## Rebuild / edit
```
src/script.json      narration + chapters + voices (single source of truth for the words that are spoken)
src/lesson1-3.js     scene choreography and every teaching graphic (one `group` per scene)
src/chars.js         procedural cast (Daniel, Maya, Sofia): rig, faces, hair, hands, expressions
src/scenes.js        five code-drawn environments        src/gfx.js bubbles/ribbons/tiles/icons
src/text.js          word+IPA layout (a word and its IPA are one unit; punctuation gets no IPA)
tools/tts_generate.py  voices (ElevenLabs or Kokoro stand-in) -> build/timeline.json     tools/music.py  original music + SFX + ducking
tools/ipa_build.py   IPA dictionary + report       tools/build.py single-file build     tools/asr_check.py  intelligibility check
tools/export_mp4.mjs OPTIONAL MP4 export (explicit, streamed, --dry-run / --seconds N)
dev/                 screenshot + QA harness (Playwright)
```
When on-screen text changes: `node dev/dumpwords.mjs` → `python tools/ipa_build.py build/words.json` → `python tools/build.py`. The player logs/reports any word without IPA (`window.__missingIPA`).

## Optional MP4 export (separate, explicit step)
```
node tools/export_mp4.mjs --dry-run                       # prints the plan only
node tools/export_mp4.mjs --seconds 10 --out dist/test.mp4  # 10-second test
node tools/export_mp4.mjs --out dist/present-perfect.mp4    # full export, streamed to ffmpeg, no frame files on disk
```
Not executed during development. Estimated 15–40 minutes of one CPU core.

## QA that was actually run
* Built file loaded in headless Chromium: 0 console/page errors; 0 missing IPA entries; full-timeline sweep (1,700 frames) 0 exceptions.
* One frame from every one of the 29 beats (all 10 chapters) inspected by eye in the built file; layout defects found and fixed (overlaps, clipped banners, hidden heads, label collisions).
* Frame cost, measured with a forced canvas flush so rasterisation is included, in **software-rendered** headless Chromium (no GPU) at 1312×738: average 18 ms, p95 26 ms, max 45 ms per frame (scene ≈7 ms, characters ≈6.5, teaching graphics ≈4.7, captions/logo ≈1.4). That fits a 30 fps budget even without a GPU; with a GPU it is far lower. Adaptive resolution handles slower machines. (Unflushed timings look deceptively tiny because Chrome batches canvas work.)
* Text geometry: 1,185 word units, every one wide enough for its own IPA; 139 caption phrases all single-line, ≤ 1,560 px.
* Interaction: keyboard `3` and mouse click both set the answer; reveal shows ✓/✗; auto-pause stops at 71.77 s (expected 71.77 s); hidden tab pauses; chapter buttons, scrubber, replay verified.
* Audio: music sits ≈12 dB under the voice during speech and ducks 6.3 dB between speech and gaps (measured). Whisper round-trip of the **stand-in** voice: 2.1 % word errors; weak "I've" in one line and "been" heard as "Ben" (see `docs/asr_report_standin_voice.md`).
* **Not done:** no human listening (no audio output in the build environment); no verification against Oxford; no MP4; no testing on Safari/Firefox or on a real GPU.

## Known limits / judgement calls
* Player chrome (button labels, hints) is ordinary HTML text, not part of the lesson frames, and has no IPA. Everything drawn inside the lesson canvas (titles, examples, options, feedback, captions, labels) has IPA.
* IPA shows citation forms (e.g. *have* /hæv/); the voice uses natural connected-speech reductions.
* Symbol style: `i`/`u` without length marks, `ɑː ɔː ɜːr` with — copied from the repository's renderer sample data, the only symbol evidence available. If the real Fluent English chart or Oxford US uses `iː`/`uː`, flip `IPA_STYLE.keepLongIU` in `src/text.js`.
* Logo: real `fluent_english_logo_blue.png` (downscaled copy embedded) on a white plate; white/black variants are in `assets/logo/`.
* Fonts: Lexend, Source Serif 4, Andika (IPA) and a Noto Sans Greek subset for θ — all SIL OFL / open licences, embedded.
* Music and effects are original (generated by `tools/music.py`).
