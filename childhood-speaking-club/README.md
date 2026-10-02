# Childhood: Memories, Games, and Growing Up
### A 60-minute interactive Speaking Club lesson for Fluent English (adults, intermediate, American English)

This is a **working, narrated, animated HTML/CSS/JavaScript classroom experience** that the teacher shares on Zoom and operates.
Students only watch and speak. They need no devices and no accounts.
It is not a video; it is a live lesson with timers, reveals, choices and teacher controls.

## Launch

1. Open **`childhood-speaking-club/index.html`** in Chrome or Edge (double-click the file; no server, internet, install or account is needed).
2. Choose **Class Mode** (the lesson waits for your students) or **Demo Mode** (a hands-free preview).
3. In Zoom: *Share screen → the browser window*, tick **Share sound** if you want the students to hear the narration, then press **F** for full screen.
4. Press **H** to hide the control bar for the cleanest picture; press **H** again (or click the small *Show controls* button, bottom-right) to bring it back.

> Do not move or rename files inside the folder; `index.html` loads `css/`, `js/` and `assets/` by relative path.
> The folder is separate from the existing Node renderer in this repository, which is untouched.

## The 60-minute plan (planned minutes; timers are shown in the Chapters panel)

| # | Chapter | Min | Inside the chapter |
|---|---|---|---|
| 1 | Animated opening | 1 | Title, memory box, four objects (drawing, ball, note, small toy), "you choose what to share", the big question |
| 2 | Warm-up | 4 | Speaking cycle (24 s); four questions × (think 10 s + answer 22 s + follow-up 17 s) |
| 3 | Useful vocabulary | 7 | Intro 14 s; five words × (scene 20 s + check 10 s + speak 30 s); toolbox 56 s + speak 30 s; word banks 20 s |
| 4 | Childhood dilemmas | 8 | Intro + quick start 30 s; three situations × 150 s (scene 25, think 10, discuss 55, twist 15, revise 30, share 15) |
| 5 | Agree or disagree? | 8 | Intro + quick try 25 s; four claims × 105 s (read, choose, explain 45, challenge 25, respond 10); wrap-up 35 s |
| 6 | Compare and decide | 7 | Intro + quick start 30 s; think 30; explain 90; respond 60; agree 90; new situation 20; discuss 70; wrap-up 30 |
| 7 | Roleplay: meeting an old friend | 7 | Roles 30; model 40; prepare 20; round 80; twist 10; round 70; feedback 20; switch 10; round 2 100; share 40 |
| 8 | Roleplay: planning a childhood games day | 7 | Scenario 30; model 40; plan 30; negotiate 100; constraint 10; adapt 50; switch 10; round 2 100; share plan 50 |
| 9 | Game: would you rather? | 8 | Intro + quick try 30 s; four rounds × 100 s (choice 8, think 10, choose 30, follow-up 30, twist 12, reconsider 10); make your own 50 s |
| 10 | Reflection and exit challenge | 3 | Task 20; prepare 30; speaker A 45; speaker B 45; rubric 15; reflect 20; closing 5 |

Chapter minutes add up to exactly **60**. The Chapters panel (button *Chapters*) also lists the planned **student-speaking time**
(timers on steps where students talk), which is about **41 minutes**.
Class Mode waits for you, so extra discussion, questions or technical pauses will make the real lesson longer than 60 minutes.
Use *Skip*, the timer −30/+30 buttons or the progress strip to stay on time.

## Modes
* **Class Mode** – narration introduces each task, then the lesson **waits**. Speaking timers start automatically after the narration (switch off in Settings), chime when finished, and never advance by themselves. You press **Next**.
* **Demo Mode** – plays the whole lesson hands-free for a preview. Every sample response is shown in a dashed bubble labelled **"Sample response (fictional)"**, and a red ribbon says *Demo Mode*. Timers are shortened (5, 10, 20 or 30 s; Settings → Demo timer length).

## Teacher controls (bottom bar)
Chapter back/next · step back/next · Play/Pause · Replay · Timer start/pause, −30, +30, reset · **Reveal** (next hidden item) · **Starters** (sentence starters) · **Example** (fictional example, also read aloud) · **Words** (the four optional word banks, three words at a time) · **Chapters** (plan and jump) · **Notes** (tally, marks, notes, export) · Mode · Volume · Full screen · Settings · **Hide controls**.
A coloured progress strip above the buttons shows chapters and steps; click any segment to jump.

Keyboard: **Space** play/pause · **←/→** step · **Shift+←/→** chapter · **R** replay · **T** timer · **N** reveal next · **S** starters · **E** example · **W** word banks · **H** hide/show controls · **F** full screen · **?** list. Shortcuts are ignored while you type in a text box.

**Hide controls** removes the bar from the layout completely (the lesson grows to use the space; it is never stretched or cropped), leaves only a small *Show controls* button in the bottom-right corner, and keeps playback, narration, timers, choices, notes and activity state exactly as they were. The hidden/shown state also survives chapter changes, full screen and reloads.

## Double-click any word
Double-click any word on the screen (lesson text, bubbles, buttons, drawers) to hear and see **its pronunciation, a short definition, and an example sentence**, each with audio. Phrases such as *grow up*, *look back on*, *used to*, *keep in touch* are recognised when you click one of their words. Press **Esc** to close. Every one of the 993 distinct words displayed anywhere in the lesson has an entry (checked automatically by the crawler, see Testing).

## Pronunciation (IPA)
* IPA sits **directly beneath every English word** (word-and-IPA units that wrap together). Punctuation has no IPA. The Fluent English logo is the only displayed text without IPA. Narration reads English only, never IPA symbols.
* The symbols are those on the **Fluent English Sound Chart** (æ e ɪ ɔː ʊ · ə ʌ iː uː ɑː · aɪ eɪ əʊ aʊ ɔɪ · ɑːr er ɔːr ɜːr · and the standard consonants), which you said match Oxford Learner's Dictionaries American English. Following the chart, the "go" vowel is written **əʊ**.
* **Honest limitation:** I could not open Oxford Learner's Dictionaries from the environment where this was built (network access to it was blocked). The transcriptions were therefore **generated automatically from the CMU Pronouncing Dictionary (American English) and converted to the chart's symbols**, with 36 hand-set entries (names such as *Maya*, *Theo*; words whose pronunciation depends on how they are used here, e.g. *read*, *close*, *use*, *perfect*; and hyphenated compounds). They have **not been checked word by word against Oxford** and are not labelled "verified" anywhere. Please spot-check unusual words. Settings → *About the pronunciation* says the same inside the lesson, and the full list of hand-set entries is in `tools/ipa-report.json`.
* Two small conventions that go slightly beyond the chart's 24 vowel symbols, exactly as Oxford writes them: unstressed final **i** (*happy*) and **u**, and syllabic **n / l** (*button*, *little*). `ɪr`/`ʊr` are built from the chart's ɪ/ʊ + r.
* Contextual rule: *used to* is shown as /juːst tuː/, and *(did) use to* as /juːs/.

## Narration and audio
* Narration uses the **speech voices already installed in your browser or operating system** (Web Speech API). Nothing is uploaded and **no paid voice service was used or activated; no credits were consumed**.
* Maya, Theo, Alex and Jordan each get their own voice when your computer has enough English (US) voices; with fewer, the pitch is varied so they still sound different. Settings lists the voices found with an **Audition** button for each character. Chrome and Edge on Windows (Microsoft "Natural" voices) and macOS (Samantha, Ava, Evan…) usually give the best results.
* If no English voice exists, the lesson still runs: captions advance on an estimated reading time, and **Settings → Narration script** shows every line so you can read it aloud.
* Only one voice speaks at a time. Every navigation, pause or Replay cancels the previous line first, so audio never overlaps. Narration stops when a speaking timer starts.
* Word-by-word highlighting follows the voice when the browser reports word boundaries, otherwise an estimate.
* Music is **off by default**, generated live (original, soft, optional) with its own volume; it ducks while someone is speaking. A soft chime plays when a timer ends (Settings → Sound effects).

## Records (teacher-entered, anonymous)
**Notes** has four tabs: *Tally* (opinion scale, would-you-rather choices, ranking, expressions; counted by you), *Marks* (anonymous S1–S6… participation marks), *Notes*, *Data*.
Nothing is saved by default; everything lives in the browser tab until you leave. *Data* offers an opt-in "Save on this computer" (browser local storage only: not cloud, not Google Sheets, and not synchronized), **Export JSON**, **Export CSV**, and a two-step **Reset all notes**. Exports state that they are **teacher observations, not automatic assessment**. The lesson never listens to your students, never identifies Zoom speakers, and never assesses speaking or pronunciation automatically. The rubric (clarity, interaction, vocabulary, relevant accuracy) is operated entirely by you.

## Safeguards built into the lesson
Fictional characters, fictional examples and a **Pass** option are offered for every personal question. No question asks for traumatic memories, real children's details or private family information. Nothing assumes a happy childhood, two parents, siblings, toys, trips or money. Opinions, choices and preferences are never scored as right or wrong.

## Files
```
childhood-speaking-club/
  index.html              open this
  css/ style.css art.css ipa-font.css
  js/  text.js            word + IPA renderer
       art.js scenes.js vignettes.js    code-drawn characters, six settings, flashbacks, icons (SVG)
       data-1.js data-2.js data-3.js    the lesson: 10 chapters, every step, timing, narration
       ui-strings.js                    every interface label
       lexicon-ipa.js lexicon-def.js    generated pronunciation and definitions
       audio.js                         narration, music, chime
       app-core.js app-widgets.js app-run.js   engine and controls
  assets/ fluent_english_logo.png  sound_chart.jpg
  docs/CREDITS.md
  tools/  (developer only: rebuild the lexicon, crawl and test the lesson; not needed to teach)
```

## Rebuilding the lexicon or re-running the tests (optional)
```
cd tools && npm install
node build-lexicon.mjs     # regenerates js/lexicon-*.js from glossary.txt and the CMU dictionary
node crawl.mjs             # visits every step and overlay, records every displayed word
node check.mjs 1600 900    # geometry checks (panels, bubbles, faces) at a laptop size
node test.mjs              # behaviour tests
```
`index.html?fast=10` runs timers and pauses ten times faster (a developer testing aid).
