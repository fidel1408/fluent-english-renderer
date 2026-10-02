/* Script, timeline and IPA data for "How to say your age" (Fluent English).
 * All times are nominal seconds on the video clock (T). In the live preview, T *holds* at the
 * wait-idle marks until the real speech has finished, so scenes follow actual speech completion.
 * In the export, speech is virtual and uses the `est` durations, so nothing ever holds.        */
window.FE = window.FE || {};

(function (FE) {
  // IPA: Oxford-style American English (OALD US conventions: ɜːr, t̬ flap, oʊ).
  // "33" is transcribed as the spoken form "thirty-three". Cross-checked against CMUdict
  // (TH ER1 T/D IY2 · TH R IY1 · Y IH1 R Z · OW1 L D · HH AW1 · AA1 R · Y UW1 · AY1 M · HH AE1 V).
  // NOT looked up in Oxford itself (that site was unreachable from the build sandbox).
  FE.IPA = {
    bad: "/aɪ hæv ˌθɜːrt̬i ˈθriː jɪrz/",
    short: "/aɪm ˌθɜːrt̬i ˈθriː/",
    full: "/aɪm ˌθɜːrt̬i ˈθriː jɪrz oʊld/",
    how: "/haʊ oʊld ɑːr juː/",
    blank: "/aɪm  ___  jɪrz oʊld/",
  };

  FE.COLORS = {
    emeraldDeep: "#04271e",
    emerald: "#0a4a3a",
    emeraldMid: "#12684f",
    emeraldLight: "#2a9a76",
    gold: "#e9d19a",
    goldDeep: "#b88f3c",
    goldBright: "#fbe9b8",
    cream: "#fcf3df",
    creamShade: "#e8d9b8",
    rasp: "#c2185b",
    raspDark: "#7d0f3a",
    raspLight: "#ec5c8c",
    ink: "#1d120c",
  };

  // Voice cues. `est` = estimated seconds, used for muted/no-voice playback and for the export.
  // English phrases are spoken with the number spelled out ("thirty-three") for natural TTS.
  FE.CUES = [
    {
      id: "hook", at: 0.45,
      segs: [
        { lang: "es", text: "¿Dices", est: 0.55 },
        { lang: "en", text: "I have thirty-three years", est: 1.45, rate: 0.9 },
        { lang: "es", text: "para decir tu edad?", est: 1.3 },
      ],
      caption: [{ t: "¿Dices ‘" }, { t: "I have 33 years", en: 1 }, { t: "’ para decir tu edad?" }],
    },
    {
      id: "fix", at: 5.4,
      segs: [{ lang: "en", text: "I’m thirty-three.", est: 1.15, rate: 0.9 }],
      caption: [{ t: "I’m thirty-three.", en: 1 }],
    },
    {
      id: "be", at: 6.9,
      segs: [
        { lang: "es", text: "En inglés, para la edad usamos el verbo", est: 2.55 },
        { lang: "en", text: "be.", est: 0.4, rate: 0.85 },
      ],
      caption: [{ t: "En inglés, para la edad usamos el verbo " }, { t: "be", en: 1 }, { t: "." }],
    },
    {
      id: "full", at: 11.2,
      segs: [{ lang: "en", text: "I’m thirty-three years old.", est: 1.85, rate: 0.9 }],
      caption: [{ t: "I’m thirty-three years old.", en: 1 }],
    },
    {
      id: "how", at: 15.3,
      segs: [{ lang: "en", text: "How old are you?", est: 1.2, rate: 0.92 }],
      caption: [{ t: "How old are you?", en: 1 }],
    },
    {
      id: "practice", at: 16.9,
      segs: [{ lang: "es", text: "Practica con una edad inventada.", est: 2.2 }],
      caption: [{ t: "Practica con una edad inventada." }],
    },
    {
      id: "close1", at: 24.0,
      segs: [{ lang: "es", text: "Pequeños cambios, más confianza.", est: 2.3 }],
      caption: [{ t: "Pequeños cambios, más confianza." }],
    },
    {
      id: "close2", at: 26.5,
      segs: [{ lang: "es", text: "Escríbenos ‘inglés’.", est: 1.4 }],
      caption: [{ t: "Escríbenos ‘inglés’." }],
    },
  ];
  FE.SEG_GAP = 0.1;
  FE.cueEst = (c) => c.segs.reduce((a, s) => a + s.est, 0) + FE.SEG_GAP * (c.segs.length - 1);

  // Timeline anchors used by drawing + audio.
  FE.TL = {
    total: 30.0,
    bubbleIn: 0.5,
    strike: 4.3,       // incorrect words struck through
    morphA: 4.7,       // "have"/"years" collapse into I’m 33.
    correctAt: 5.35,   // morph settled → correct sentence, confetti, chime
    beChip: 7.0,
    ribbon: 10.3,      // ribbon extends the sentence
    tengo: 12.0,
    pair: 13.4,        // both versions shown as correct
    howIn: 15.15,
    blankIn: 17.0,
    pauseStart: 19.4,  // 4 s learner pause starts (after Spanish prompt has finished)
    pauseLen: 4.0,
    closeIn: 23.8,
    ex2: 25.0,
    ctaIn: 26.7,
    chord: 28.0,
  };

  // Hold the clock here until the speaker is idle (live preview only).
  FE.WAIT_MARKS = Array.from(new Set(
    FE.CUES.map((c) => c.at).concat([4.3, 10.2, 15.0, 19.4, 28.0])
  )).sort((a, b) => a - b);
})(window.FE);
