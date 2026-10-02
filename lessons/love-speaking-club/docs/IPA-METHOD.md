# IPA: method and honest verification status

**Reference requested:** Oxford Learner's Dictionaries, American pronunciation. **Not reachable from the build environment** (the network proxy refused `www.oxfordlearnersdictionaries.com`, HTTP 403).
Therefore the transcriptions are **not copied from, and not individually verified against, Oxford**, and they are not described as Oxford-verified.

## What was done

1. A headless run of the real lesson (every chapter, step, branch, drawer, both modes) records every English token passed through the IPA renderer: **925 distinct tokens**.
2. Each token is transcribed from **CMUdict** (American English), then converted to the symbol set of the **Fluent English Sound Chart** you supplied (same symbols as Oxford's US dictionary): `iː ɪ e æ ɑː ɔː ʊ uː ʌ ə ɜː`, `eɪ aɪ ɔɪ aʊ əʊ`, `ɑːr ɔːr ɜːr ɪr er ʊr`, consonants `p b t d k ɡ f v θ ð s z ʃ ʒ h tʃ dʒ m n ŋ l r w j`.
   Oxford conventions added: `ˈ` / `ˌ` before the stressed syllable, `i` in *happy*, `ər` for unstressed *-er*, syllabic *l/n* (`ˈpiːpl`).
3. `tools/ipa-overrides.json` fixes names (Alex, Maya, Priya, Leo, Nora, Dev), the verb/noun *close/use/export/record* readings, weak forms (*an, and, of, was*) and words missing from CMUdict.
4. The automated test confirms **every displayed word has its own `/IPA/` unit directly beneath it** (stage, drawers, control bar, timer chip), no English word appears outside a unit, and **no symbol outside the Sound Chart set is used** (`tools/build-ipa.mjs` prints "symbols outside the sound chart set: none").
   Punctuation receives no IPA; narration reads English, never the symbols.

## Known limits (please spot-check)

* Single reading per spelling (the isolated-word, citation form). Context can change weak forms (*to, for, and*), and homographs outside the overrides use CMUdict's first entry.
* Compound spellings such as *follow-up* and *long-distance* show the two parts' transcriptions side by side.
* `docs/ipa-review.csv` lists all 937 entries with a direct Oxford US URL so a teacher or editor can verify quickly; entries that differ from Oxford can be corrected in `tools/ipa-overrides.json` and rebuilt (`node tools/build-ipa.mjs`).
