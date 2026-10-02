# Fluent English – “I agree” (30 s vertical video)

Open `index.html` in Chrome or Edge (double-click works; serve over `npx serve video` if you prefer), press **Start**.
Everything is generated in the browser: picture (Canvas 2D, 1080×1920), speech cues (browser `speechSynthesis`),
music and effects (Web Audio). No service, key or recording is used. Fonts (Fredoka, Noto Sans) load from Google Fonts and fall back to system fonts when offline.

Files: `index.html` (UI), `main.js` (scenes + timeline), `character.js` (articulated character), `audio.js` (music/FX), `speech.js` (clock + voices), `logo_data.js` (Fluent English logo, white version, embedded).

## Controls
Start / Replay, Pause, Mute (applies from the next phrase), Spanish and English voice selectors with Test buttons,
CC / IPA (off · captions · captions + IPA, saved in localStorage), safe-zone guide overlay, WebM recorder, copy buttons for cover title and post caption.

## Timeline behaviour
The timeline waits for each utterance’s real `end` event, so voices never overlap or get cut off; gaps are short.
Measured with silent estimated timing: ~30.0 s. With real voices the length depends on the voices and rate (expect roughly 30–33 s).
The 4 s answer window is fixed: music fades to near silence, only a quiet ring countdown, no sounds or narration.

## Honest limits
* **IPA is not Oxford-verified.** Oxford’s dictionary site was unreachable from the build environment, so the General American IPA
  (/aɪ/, /əˈɡriː/, /wɪð/, /ju/, /ˈlɜːrnɪŋ/, /ˈɪŋɡlɪʃ/, /teɪks/, /ˈpræktɪs/) was written by hand. Please check it before publishing.
* **Voice quality = whatever is installed.** Basic system voices can sound robotic; Edge “Natural” voices (Windows/Edge) or good macOS voices sound best.
  The selector ranks es-MX / en-US and neural voices first.
* **Exported video has no narration.** The in-page recorder (`⏺ Record WebM`) captures canvas + the Web Audio mix (music + effects, verified: VP9 1080×1920 + Opus, peaks ≈ −8 dBFS, quiet answer window)
  but browsers cannot route `speechSynthesis` into MediaRecorder. Burned-in captions/IPA follow the selected CC mode; the on-page buttons are not in the file.
* To get a file **with** voices: play the preview in a window and screen-record with audio capture (not tested here), e.g.
  OBS Studio: Window Capture of the browser + “Audio Output Capture”/Desktop Audio; crop to 9:16 and set the canvas to 1080×1920;
  or Chrome tab-capture tools that include tab audio. Check the result’s audio track before posting. Then trim the head/tail.

## Copy
Cover title: `¿I’M AGREE? 👀`

Caption: `¿También decías ‘I’m agree’? 👀 Prueba: ‘I agree with you.’ Dilo en voz alta y guárdalo para tu próxima conversación. ¿Quieres practicar más? Escríbenos INGLÉS 💬`

Nothing was published or scheduled.
