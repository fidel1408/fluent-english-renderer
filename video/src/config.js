/* Fluent English — "Pide tu café en inglés" — shared configuration.
   Plain global script (no modules) so index.html also works from file://. */
(function () {
  const FE = (window.FE = window.FE || {});

  FE.W = 1080;
  FE.H = 1920;
  FE.FPS = 30;
  FE.DURATION = 30;

  FE.C = {
    ivory: '#FFF6E6', cream: '#F6E7CC', sand: '#E9D2AA', espresso: '#3B2418', mocha: '#6B4430',
    caramel: '#B9783F', teal: '#1F7A7A', deepTeal: '#14575A', mint: '#BFE3DC', coral: '#F26B5B',
    deepCoral: '#C9473A', gold: '#D9A441', paleGold: '#F2D58C', charcoal: '#241915', navy: '#002E5D',
    skin: '#D8A07A', skinShade: '#BC845F', skinLight: '#E8B592', hair: '#2A1C16', white: '#FFFFFF'
  };

  FE.FONT = {
    head: '"DejaVu Serif", Georgia, "Times New Roman", serif',
    body: '"DejaVu Sans", "Segoe UI", Roboto, Arial, sans-serif'
  };

  /* Scenes (seconds) — storyboard. */
  FE.SCENES = [
    { id: 'hook', t0: 0, t1: 4 },
    { id: 'phrase', t0: 4, t1: 11 },
    { id: 'remix', t0: 11, t1: 17 },
    { id: 'speak', t0: 17, t1: 24 },
    { id: 'cta', t0: 24, t1: 30 }
  ];

  /* Voice cues. `t` = start of speech (s). Durations are measured from the
     generated local-TTS files (build/voices.json) for the MP4; the browser
     preview speaks the same `text` with the viewer's own system voices.
     `tts` is what the local engine is fed (spelling tweaks only, e.g. "voz" -> "bos"
     so the Castilian-leaning engine does not say /boθ/); `text` is what is displayed. */
  FE.CUES = [
    { id: 'v1', lang: 'es', t: 1.2, text: '¿Cómo pedirías un café en inglés?', tts: '¿Cómo pedirías un café en inglés?', who: 'narrator' },
    { id: 'v2', lang: 'en', t: 4.7, text: 'Could I have a coffee, please?', tts: 'Could I have a coffee, please?', who: 'customer', phrase: 'p1' },
    { id: 'v3', lang: 'es', t: 8.1, text: 'Una forma amable de pedirlo.', tts: 'Una forma amable de pedirlo.', who: 'narrator' },
    { id: 'v4', lang: 'en', t: 12.55, text: 'Could I have an iced latte, please?', tts: 'Could I have an iced latte, please?', who: 'customer', phrase: 'p2' },
    { id: 'v5', lang: 'es', t: 17.45, text: 'Escoge tu bebida y pídela en voz alta.', tts: 'Escoge tu bebida y pídela en bos alta.', who: 'narrator' },
    { id: 'v6', lang: 'es', t: 24.6, text: 'Practica inglés para tu vida diaria. Escríbenos INGLÉS.', tts: 'Practica inglés para tu vida diaria. Escríbenos inglés.', who: 'narrator' }
  ];

  /* Viewer response pause (no narration). */
  FE.PAUSE = { t0: 20.55, t1: 23.65 };

  /* American-English IPA (General American). Lexical forms follow Oxford Learner's
     Dictionaries NAmE entries as recalled by the author — NOT verified online (the
     sandbox could not reach OLD); cross-checked with eSpeak NG's en-us output.
     Connected speech: "have a" -> /hæv ə/ is kept in citation form for learners. */
  FE.IPA = {
    p1: '/kʊd aɪ hæv ə ˈkɔːfi, pliːz/',
    p2: '/kʊd aɪ hæv ən aɪst ˈlɑːteɪ, pliːz/',
    coffee: '/ə ˈkɔːfi/', latte: '/ən aɪst ˈlɑːteɪ/', tea: '/ə tiː/'
  };

  /* Words of the on-screen English sentences (index used for karaoke highlight). */
  FE.PHRASES = {
    p1: ['Could', 'I', 'have', 'a', 'coffee,', 'please?'],
    p2: ['Could', 'I', 'have', 'an', 'iced', 'latte,', 'please?']
  };

  FE.SFX = [
    { t: 0.5, id: 'doorChime', note: 'Door chime as the customer enters' },
    { t: 3.85, id: 'whoosh', note: 'Soft transition to the phrase scene' },
    { t: 4.0, id: 'accent', note: 'Headline-to-phrase accent' },
    { t: 10.9, id: 'whoosh', note: 'Soft transition' },
    { t: 11.4, id: 'textChange', note: 'Text-change accent as "coffee" becomes "latte" (before the voice)' },
    { t: 12.0, id: 'iceClink', note: 'Ice clink as the iced cup appears (before the voice)' },
    { t: 16.9, id: 'whoosh', note: 'Soft transition to viewer turn' },
    { t: 20.55, id: 'yourTurn', note: 'Gentle "your turn" bloop at start of response pause' },
    { t: 23.55, id: 'doneChime', note: 'Soft end-of-pause chime' },
    { t: 24.45, id: 'cupPlace', note: 'Cup placed on the counter' },
    { t: 27.5, id: 'logoReveal', note: 'Soft sparkle as the logo appears (ducked under narration)' },
    { t: 29.25, id: 'closing', note: 'Original closing accent after the narration ends' }
  ];
})();
