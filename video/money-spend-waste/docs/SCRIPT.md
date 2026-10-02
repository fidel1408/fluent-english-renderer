# Voiceover script, on-screen text and IPA — "Spend or Waste?" (MONEY)

**Status of audio: PENDING.** No voiceover has been generated or recorded (see QA_REPORT.md). The times below are
*planning estimates* for a natural, unhurried delivery; they become real once the clips exist and
`node scripts/measure_audio.mjs --write` has measured them. Do not speed the voice up to fit — shorten the text instead.

## Voice direction
- **Spanish narrator (es-MX):** warm, conversational, friendly adult male. Natural pauses, no announcer voice, no pitch shifting.
  Say "Spend", "Waste" and "Fluent English" with clear English pronunciation inside the Spanish line.
- **English examples (en-US):** clear General American, medium pace, slight stress on **spend** / **wasted**. May be the same voice or a second US voice.

## Clips (file name = `audio/<id>.mp3` or `.wav`, listed in `audio/manifest.json`)

| # | id | Window (planned) | Exact text | Notes |
|---|----|-----------------|-----------|-------|
| 1 | `es_hook`  | 0.25 – 3.55 s  | ¿Gastar dinero y desperdiciarlo se dicen igual en inglés? | Curious, light smile. |
| 2 | `en_spend` | 4.10 – 6.00 s  | I spend money on groceries. | Neutral/positive tone. |
| 3 | `es_spend` | 6.50 – 9.90 s  | Spend es gastar. No significa que sea algo malo. | Reassuring. |
| 4 | `en_waste` | 10.70 – 12.80 s | I wasted money on this gadget. | Sheepish, relatable — not judgmental. |
| 5 | `es_waste` | 13.30 – 16.20 s | Waste expresa que no valió la pena. | Gentle. |
| 6 | `es_speak` | 17.40 – 19.90 s | ¿Y tú? Completa la frase en voz alta. | Inviting. |
| – | *(silence)* | 19.90 – 22.90 s | — deliberate 3-second pause for the viewer to speak — | Keep silent. No music sting. |
| 7 | `es_cta`   | 23.30 – 28.40 s | Practica inglés con Fluent English. Escríbenos “INGLÉS” por mensaje. | Warm, unhurried. |

Total planned duration: **28.8 s** (inside the 25–30 s target). The Spanish explanations were kept as supplied (not shortened).

## On-screen text by scene

| Scene | Time | Always visible (graphics) | Captions (CC mode ≥ 1) | IPA (CC mode 2) |
|-------|------|---------------------------|------------------------|-----------------|
| Hook  | 0 – 3.7 | SPEND MONEY / WASTE MONEY cards, “?” badge | ¿Gastar dinero y desperdiciarlo / se dicen igual en inglés? | /spend ˈmʌni/ · /weɪst ˈmʌni/ under each phrase |
| Spend | 3.7 – 10.3 | — | **I spend money on groceries.** · Spend es gastar. · No significa que sea algo malo. | /aɪ/ /spend/ /ˈmʌni/ /ɑːn/ /ˈɡrəʊsəriz/ |
| Waste | 10.3 – 17.0 | — | **I wasted money on this gadget.** · Waste expresa que no valió la pena. | /aɪ/ /ˈweɪstɪd/ /ˈmʌni/ /ɑːn/ /ðɪs/ /ˈɡædʒɪt/ |
| Speak | 17.0 – 23.0 | “I spend money on ___.” card, 4 picture choices (books, food, games, travel), mic/countdown ring | ¿Y tú? · Completa la frase en voz alta. | /aɪ/ /spend/ /ˈmʌni/ /ɑːn/ (nothing under the blank or the period) |
| CTA   | 23.0 – 28.8 | Fluent English logo, online-class illustration, **Escríbenos INGLÉS** button | Practica inglés con Fluent English. · Escríbenos “INGLÉS” por mensaje. | — |

CC/IPA modes: **Off** (graphics only), **Captions** (adds Spanish captions + the English example cards), **Captions + IPA** (adds IPA). IPA is never placed under Spanish text, punctuation, blanks or the logo.

## IPA (Fluent English Sound Chart symbols; US)

| Word | IPA used | Source / status |
|------|----------|-----------------|
| I | /aɪ/ | chart symbols `aɪ` |
| spend | /spend/ | chart `e` |
| money | /ˈmʌni/ | chart `ʌ`; final unstressed **i** is the Oxford-style "happy" vowel (no separate chart tile) |
| on | /ɑːn/ | US `ɑː` — **to confirm in Oxford (US)** |
| groceries | /ˈɡrəʊsəriz/ | uses the chart's **əʊ** tile as instructed (Oxford's own US page may print *oʊ*; swap if you prefer) |
| waste | /weɪst/ | chart `eɪ` |
| wasted | /ˈweɪstɪd/ | chart `eɪ`, `ɪ` |
| this | /ðɪs/ | chart `ð`, `ɪ` |
| gadget | /ˈɡædʒɪt/ | chart `æ`, `dʒ`, `ɪ` |

**Verification status:** every symbol is checked against the Sound Chart by `node scripts/check_ipa.mjs` (passes). The dictionary lookups themselves were **not** verified against Oxford Learner's Dictionaries because that site is blocked from this build environment — see QA_REPORT.md. The full-sentence transcriptions are my own constructed word-by-word transcriptions (citation-form, no connected-speech reductions) and are **not** attributed to Oxford.
