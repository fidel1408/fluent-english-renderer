/* Fluent English — "I'll have two tacos, please." 9:16 short.
 * Classic scripts (no modules) so index.html also works from file://.
 * Everything hangs off window.FE.
 */
(function () {
  const FE = (window.FE = window.FE || {});

  FE.W = 1080;
  FE.H = 1920;

  FE.COLORS = {
    terracotta: '#C65A3E', terracottaDark: '#9C3F2A', terracottaLight: '#E58A62',
    lime: '#B5D335', limeDark: '#7FA01E', limeLight: '#DDF07A',
    cream: '#FFF3DA', creamDark: '#F0DDB6', creamShade: '#E3C99A',
    teal: '#0F4F55', tealDark: '#0A363B', tealLight: '#1B7078',
    ink: '#2B1810', skin: '#C48A62', skinDark: '#9E6A47', skinLight: '#DBA67E',
  };

  /* Oxford American English (OALD US) citation forms, written out by hand.
   * NOT looked up live — the sandbox had no access to the Oxford site.
   * Weak form of "a" is /ə/; "have" is shown in its strong form because it is
   * the main verb of the order.  See README for the verification note. */
  FE.IPA = {
    "I'll have": '/aɪl hæv/',
    'two tacos,': '/tuː ˈtɑːkoʊz/',
    'a sandwich,': '/ə ˈsænwɪtʃ/',
    'a lemonade,': '/ə ˌleməˈneɪd/',
    'please.': '/pliːz/',
    '___,': '',
  };

  /* Beat list. Each beat = optional lead-in ("pre"), optional speech, tail ("post").
   * A "wait" beat is a fixed-length silence (the learner's turn).
   * Times are seconds. Speech beats end when the voice actually finishes;
   * the export tool feeds the real clip lengths into the same list. */
  FE.BEATS = [
    { k: 'hook', pre: 0.55, post: 0.30,
      say: { lang: 'es', text: '¿Ya sabes qué pedir, pero no cómo decirlo en inglés?' } },

    { k: 'phrase', pre: 0.70, post: 0.35,
      say: { lang: 'en', text: "I'll have two tacos, please.", chunks: ["I'll have", 'two tacos,', 'please.'],
             weights: [2, 3, 1.4] } },
    { k: 'intro', pre: 0.0, post: 0.0,
      say: { lang: 'es', text: 'Para pedir, puedes empezar con' } },
    { k: 'introEn', pre: 0.12, post: 0.65,
      say: { lang: 'en', text: "I'll have…" } },

    { k: 'morph', pre: 1.05, post: 0.8,
      say: { lang: 'en', text: "I'll have a sandwich, please.", chunks: ["I'll have", 'a sandwich,', 'please.'],
             weights: [2, 3, 1.4] } },

    { k: 'turn', pre: 0.75, post: 0.30,
      say: { lang: 'es', text: 'Ahora tú. Pide una limonada en voz alta.' } },
    { k: 'silence', wait: 4.0 },
    { k: 'reveal', pre: 0.55, post: 0.60,
      say: { lang: 'en', text: "I'll have a lemonade, please.", chunks: ["I'll have", 'a lemonade,', 'please.'],
             weights: [2, 3.5, 1.4] } },

    { k: 'cta', pre: 0.75, post: 1.2,
      say: { lang: 'es', text: 'Practica frases que sí vas a usar. Escríbenos “inglés”.' } },
  ];

  /* Sound effects, relative to the start of a beat's marks.
   * ref: 'start' (beat start) | 'say' (speech start) | 'end' (speech end) */
  FE.SFX = [
    { beat: 'hook', ref: 'start', at: 0.18, fx: 'plate' },
    { beat: 'phrase', ref: 'start', at: 0.05, fx: 'rustle' },
    { beat: 'morph', ref: 'start', at: 0.05, fx: 'swish' },
    { beat: 'morph', ref: 'start', at: 0.62, fx: 'plate', soft: true },
    { beat: 'turn', ref: 'start', at: 0.05, fx: 'glass' },
    { beat: 'reveal', ref: 'start', at: 0.02, fx: 'success' },
    { beat: 'cta', ref: 'start', at: 0.05, fx: 'accent' },
  ];

  /* Music level (0..1) by event: speech => ducked, silence => nearly muted. */
  FE.DUCK = { open: 0.9, speech: 0.26, silence: 0.02 };

  /* Captions (what appears in the bottom bar when CC is on). */
  FE.CAPTIONS = {
    hook: '¿Ya sabes qué pedir, pero no cómo decirlo en inglés?',
    intro: 'Para pedir, puedes empezar con…',
    introEn: null,
    turn: 'Ahora tú. Pide una limonada en voz alta.',
    cta: 'Practica frases que sí vas a usar. Escríbenos “inglés”.',
  };

  FE.COVER_TEXT = ['PIDE COMIDA', 'EN INGLÉS'];
  FE.SUGGESTED_CAPTION =
    'Una frase para tu próximo viaje 🌮 ‘I’ll have two tacos, please.’ Ahora cambia la comida y dilo en voz alta. ' +
    'Guarda este video y escríbenos INGLÉS para conocer nuestras clases en línea 💬';
})();
