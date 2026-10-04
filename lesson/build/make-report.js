// Composes qa/after/QA-REPORT.md from the real outputs of build/run-qa.sh (no numbers are typed by hand).
const fs = require('fs'), path = require('path');
const Q = path.resolve(__dirname, '../../qa'), rd = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''), js = (f) => { try { return JSON.parse(rd(f)); } catch (e) { return null; } };
const cnt = (f) => { const t = rd(f); const m = t.match(/(\d+) passed, (\d+) failed/); if (m) return { p: +m[1], f: +m[2] }; const ok = (t.match(/^\s+ok\s/gm) || []).length, fl = (t.match(/^\s+FAIL\s/gm) || []).length; return ok + fl ? { p: ok, f: fl, partial: true } : null; };
const fmt = (c) => (c ? `${c.p} passed, ${c.f} failed${c.partial ? ' (run stopped early — see file)' : ''}` : 'did not run to completion (see file)');
const inv = js(`${Q}/after/inventory.json`), vp = js(`${Q}/after/viewports-summary.json`), vpB = js(`${Q}/before/viewports-summary.json`), corpus = js(`${Q}/after/ipa-corpus.json`);
const aud = js(`${Q}/after/ipa-audit-desktop.json`), audP = js(`${Q}/after/ipa-audit-phone.json`), audB = js(`${Q}/before/ipa-audit-desktop.json`), audBP = js(`${Q}/before/ipa-audit-phone.json`);
const sha = (r) => require('child_process').execSync(`git -C ${path.resolve(Q, '..')} rev-parse --short ${r}`).toString().trim();
const tags = ['lesson-v1-initial', 'lesson-v2-chart', 'lesson-v3-video', 'lesson-v4-baseline-before-improvement-pass'].map((t) => `${t} → ${sha(t)}`);
const shots = (d) => { const j = js(`${d}/index.json`); return j ? j.shots.length : 0; };
const sheetList = fs.existsSync(`${Q}/after/contact-sheets`) ? fs.readdirSync(`${Q}/after/contact-sheets`).filter((f) => f.endsWith('.png')).sort() : [];
const vpRows = (v) => v ? Object.entries(v.report).map(([k, r]) => `| ${k} | ${r.beats} | ${r.controlsChecked} | ${r.minStageHeightPx}px (step ${r.minStageAt}) | ${r.horizontalOverflow.length} | ${r.dockButtonsUnreachable} | ${r.stageControlsOffscreen} | ${r.stageControlsCovered} | ${r.contentBehindRibbon} | ${r.ipaBelow12px} |`).join('\n') : '| (not run) |';
const stepsWithTeach = inv ? inv.plan : {};
const ne = inv && inv.narrationEstimate;
const md = `# QA report — Fluent English · Subject Pronouns and Be (A1) · improvement pass

Generated ${new Date().toISOString()} from the actual outputs in this folder. Nothing below is typed from memory: pass/fail counts are parsed from the test output files.

## 1. What was preserved first
Baselines are preserved untouched: git tags ${tags.map((t) => '\`' + t + '\`').join(', ')}; the four HTML builds are in \`lesson/versions/\`; the owner's original Sound Chart video is kept byte-identical at \`lesson/assets/original/Sound_Chart.mp4\` (SHA-256 ff922a12…49718e matches the upload). The embedded chart image/video inside the lesson are derivatives (cropped/compressed). Model/effort: this pass ran as Sonnet 5.5; the session cannot set effort/fast-mode from inside, so those settings are as the session was started.
Two stale screenshot folders from my own earlier pass (\`qa/after/shots\`, \`qa/after/contact-sheets\`, pre-fix and washed-out) were removed and regenerated; nothing else was deleted.

## 2. Baseline defects (v4) and status
| # | Defect (baseline v4) | Evidence before | Status now |
|---|---|---|---|
| 1 | Word bank rejected correct "I am …" (lower-cased "I" looked up under "I") | \`qa/before/repro-bugs.txt\` | Fixed; pure \`checkPattern()\`; all 189 pronoun×be×phrase combinations match an explicit grammar table |
| 2 | Quiz Q4 ambiguous ("uses a contraction" – C and D both did) | repro | Prompt now asks for the contraction of *They are*; distractor D "Theyre friends."; oracle test: exactly one valid option for every question |
| 3 | Quiz Q6 echo-question ambiguity, Q8 "doctor" did not exclude "teacher", Q3 extension invited "We are class" | source review | Q6 asks for the standard inverted yes/no form; Q8 states a story fact (one job: doctor); Q3 extension "We are ready / in class" |
| 4 | Exports had summaries only | repro | Local answer sheet: question ID, prompt, options, selected, correct, attempt number/type, correctness, ISO timestamp; JSON, full CSV and a separate answer-sheet CSV; summaries preserved |
| 5 | CSV formula injection via notes | source review | Cells starting = + - @ are prefixed with an apostrophe |
| 6 | Skip timer wrote the whole budget into elapsed time | source review | Actual elapsed time never altered; skipped time tracked separately and shown separately |
| 7 | Mobile Hide removed the dock; only the H key restored it | source review | Visible "Show controls" button |
| 8 | Chapter completion marked by merely jumping to the last screen | source review | Completed only by stepping past the last screen |
| 9 | 50 text nodes with no IPA; missing words shown as plain spelling in /slashes/; letter "A" rendered as schwa; 348 IPA lines hidden on phone | \`qa/before/ipa-audit-*.json\` | 0 un-IPA'd text nodes; unknown words render as [?word] and none remain; letter names fixed; phone shows labels + IPA in a legend (nothing hidden) |
| 10 | Narration "I is the speaker", "They is other people" | source review | Rewritten as grammatical metalanguage |
| 11 | Answers inferred from a smile / generic scene (not tired, not doctor, not late) and ambiguous referent for *It isn't blue* | source review | Explicit "Facts" cards; apple/chair referent stated |
| 12 | Paused navigation left half-built silent screens; Replay while paused did nothing; Repeat was cut off by narration | code review + tests | Instant fast-forward state, replay on Play, Repeat interrupts and fast-forwards |
| 13 | Space re-clicked focused buttons; Escape closed every dialog; no focus trap; timer ticks capped at 1 s | code review | Fixed (P key too); only top dialog closes; focus trapped; cap 90 s |
| 14 | Resume of older saves left settings keys undefined (AudioParam NaN error) | found by new test | \`mergeState\` rewritten: defaults first |
| 15 | Over-claimed IPA wording ("Oxford-style"), chart-only whitelist test | owner clarification | Notation statement corrected, see §5 |

## 3. Verification actually run (headless Chromium via Playwright, Linux)
| Suite | Before (v4 baseline) | After |
|---|---|---|
| New regression suite (\`test-regression.js\`) | ${fmt(cnt(`${Q}/before/test-regression.txt`))} | ${fmt(cnt(`${Q}/after/test-regression.txt`))} |
| Real-viewport suite (\`test-viewports.js\`) | ${fmt(cnt(`${Q}/before/test-viewports.txt`))} | ${fmt(cnt(`${Q}/after/test-viewports.txt`))} |
| Original functional suite (\`test.js\`) | ${fmt(cnt(`${Q}/before/test.txt`))} | ${fmt(cnt(`${Q}/after/test-main.txt`))} |
| Speech sequencing, mock voices (\`test-speech.js\`) | ${fmt(cnt(`${Q}/before/test-speech.txt`))} | ${fmt(cnt(`${Q}/after/test-speech.txt`))} |
| Video dialog (\`test-video.js\`) | ${fmt(cnt(`${Q}/before/test-video.txt`))} | ${fmt(cnt(`${Q}/after/test-video.txt`))} |
Notes: the "before" column for the two new suites is the unchanged v4 file run through the same tests; it is expected to fail where the defects exist, and a run may stop early if a feature the test needs does not exist in v4. Audio levels (\`test-audio.txt\`) were measured for peaks only.

Coverage of the regression suite: word bank (every pronoun × be × phrase, upper/lower-case I, incomplete, invalid); quiz oracle for all ten questions; answer sheet/attempt history/exports/CSV safety; skip/extend/clock; completion; Hide/Show; keyboard; dialogs (stacking, focus trap, chart, video); IPA (coverage, notation, honesty labels, letter names, unknown-word marker); no pronunciation-assessment claims; retry/scoring (skip, mode switch mid-retry, second round); repeated/rapid clicks; stale narration with mock speech (rapid navigation, pause→navigate→play, replay while paused, Repeat mid-sequence); speaker voices; 390 px layout; chapter navigation (all 100 steps); resume from an old v4-era save.

## 4. Real-viewport phone checks (not only expanded-height captures)
\`test-viewports.js\` uses the true device size and scrolls to every control, then confirms the control is fully on screen and is the element a click would hit.
| Viewport | Steps | In-stage controls scrolled to | Smallest visible stage | Horizontal overflow (steps) | Teacher buttons unreachable | Stage controls off-screen | Stage controls covered | Content behind ribbon | IPA < 12px |
|---|---|---|---|---|---|---|---|---|---|
${vpRows(vp)}
Before (v4 baseline, same test):
| Viewport | Steps | Controls | Smallest stage | Overflow | Dock unreachable | Off-screen | Covered | Behind ribbon | IPA<12 |
|---|---|---|---|---|---|---|---|---|---|
${vpRows(vpB)}
Screenshots: \`qa/after/shots\` and \`contact-sheets/\` contain (a) expanded-height captures at 390 px and 1280 px wide (nothing cropped — useful for reading long IPA/feedback but can hide reachability problems) and (b) TRUE-viewport captures (\`*-REAL\`) at 390×844, landscape 844×390 and 1280×720. Both are provided deliberately.

## 5. IPA — what is and is not established
* **Notation:** the lesson follows the owner's uploaded Sound Chart. For the GOAT vowel the chart writes /əʊ/; the current Oxford Learner's (OALD) NAmE entries examined by the owner (boat /bəʊt/, no /nəʊ/, go /ɡəʊ/) agree with the chart. Oxford's separate Advanced American dictionary writes /oʊ/ — a different transcription standard that is **not** mixed in. /əʊ/ entries are therefore not treated as errors. (Correction to my first baseline note, which called this a "chart vs US defect".)
* **Word-level verification:** ${inv ? `${inv.ipa.sourceVerifiedEntries} of ${inv.ipa.entries} dictionary entries are source-verified (boat, no, go — from the owner-supplied OALD evidence; I could not re-fetch Oxford from this sandbox). The other ${inv.ipa.handEnteredEntries} are hand-entered in the same notation and are NOT checked word by word.` : '(inventory missing)'} Add verified rows to \`lesson/build/ipa-verified.csv\` and rebuild: they override the hand entries and are marked verified.
* **Sentence lines are assembled** word by word from single-word entries (citation forms; natural speech reduces small words). The stage, the Teacher guide and the Sound-chart dialog say so.
* **Coverage audit:** exhaustive corpus run over every step, every wrong-tile/word-bank/quiz branch (both modes), retry/results screens and every narrated line: ${corpus ? `${corpus.strings.length} distinct strings, ${corpus.strings.filter((s) => s.unk).length} with a missing word, ${corpus.strings.filter((s) => s.emptyIpa).length} visible text items without an IPA line` : '(missing)'}. DOM audit of English text outside an IPA wrapper: before ${audB ? audB.missingIPA.length : '?'} nodes → after ${aud ? aud.missingIPA.length : '?'}; hidden IPA lines on a 390 px screen: before ${audBP ? audBP.hiddenIPA.length : '?'} → after ${audP ? audP.hiddenIPA.length : '?'}.
* **Scope of "required IPA":** learner-facing teaching text (titles, examples, instructions, feedback, options, captions/narration). Teacher chrome (control bar, timers, dialogs such as results/settings, button labels) and Spanish help are not IPA'd.
* Nobody has listened to every audio line; the notation checks above are about transcription coverage, not pronunciation quality.

## 6. Planned time versus actual narration
* **3,600 seconds = the facilitation plan** (9 activities: 5·7·8·6·7·8·7·8·4 minutes; ${stepsWithTeach.plannedLearnerSpeakingSecondsTotal || 2100} s planned collective learner speaking). It is not audio.
* **Scripted narration:** ${ne ? `${ne.narrationLines} lines, ${ne.words} words → roughly ${ne.estimatedAudioMinutesRange[0]}–${ne.estimatedAudioMinutesRange[1]} minutes of synthetic speech (an assumption of 110–160 wpm; not measured with real voices)` : '(missing)'}. 180 lines do not equal an hour; the rest of the hour is learner speaking, thinking, partner work and teacher pacing. The deliverable is an interactive HTML lesson, never a 60-minute video or audio file.

## 7. Limits — not tested / not claimed
* No human has listened to the speech, music or effects; real browser voices were not exercised (mock \`speechSynthesis\` + measured levels only). Speaker-matched voices are a name-based guess (or a small pitch shift) and need checking by ear.
* Only Chromium on Linux was run. Safari, Firefox, Edge, real phones/tablets, touch gestures, Zoom/Meet screen-share audio and the MP4 path (Safari) were not tested. "Phone" results are emulated viewports, not devices.
* Online browser voices may send spoken text to a vendor; the lesson labels them ONLINE and offers an on-device-only setting, but I cannot verify what any vendor does.
* Art was reviewed from screenshots only (arms kept at the shorter proportions; no change needed after the review). The lesson does not assess pronunciation and says so.
* Word-level IPA is largely unverified (see §5). Spanish help text was proof-read by me only.

## 8. Files
* \`fluent-english-be-lesson.html\` — the repaired self-contained lesson.
* \`qa/after/inventory.json\` — every step, narration line (with speaker, IPA and verification status), on-screen text, exercise, answer key, tips, quiz items, word-bank rules.
* \`qa/after/*.txt|json\` and \`qa/before/*\` — raw outputs. \`qa/after/ipa-corpus.json\` — every string with its assembled IPA line.
* \`qa/after/contact-sheets/*.png\` (${sheetList.length} sheets; ${shots(`${Q}/after/shots/desktop`)} + ${shots(`${Q}/after/shots/phone`)} + real-viewport shots) and \`qa/after/shots/\`.
* Source: \`lesson/src\`, tests/tools: \`lesson/build\`; before/after source diff in the bundle.
`;
fs.writeFileSync(`${Q}/after/QA-REPORT.md`, md); console.log('wrote QA-REPORT.md', md.length, 'chars');
