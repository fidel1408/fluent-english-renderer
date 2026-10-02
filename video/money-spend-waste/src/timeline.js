// Single source of truth for timing, script, captions and IPA.
// IPA uses the Fluent English Sound Chart symbols (same set as Oxford Learner's Dictionaries, US).
// NOTE: audio is PENDING. Clip start/dur are planning estimates until real voiceover is imported
// (see audio/manifest.json and scripts/measure_audio.mjs).
export const DURATION = 28.8;
export const FPS = 30;

export const SCENES = [
  { id: 'hook',  t0: 0.0,  t1: 3.7 },
  { id: 'spend', t0: 3.7,  t1: 10.3 },
  { id: 'waste', t0: 10.3, t1: 17.0 },
  { id: 'speak', t0: 17.0, t1: 23.0 },
  { id: 'cta',   t0: 23.0, t1: 28.8 },
];

// Voice clips. lang: es-MX narration / en-US example. Estimated durations (pending real audio).
export const CLIPS = [
  { id: 'es_hook',  lang: 'es', start: 0.25,  dur: 3.3, text: '¿Gastar dinero y desperdiciarlo se dicen igual en inglés?' },
  { id: 'en_spend', lang: 'en', start: 4.1,   dur: 1.9, text: 'I spend money on groceries.' },
  { id: 'es_spend', lang: 'es', start: 6.5,   dur: 3.4, text: 'Spend es gastar. No significa que sea algo malo.' },
  { id: 'en_waste', lang: 'en', start: 10.7,  dur: 2.1, text: 'I wasted money on this gadget.' },
  { id: 'es_waste', lang: 'es', start: 13.3,  dur: 2.9, text: 'Waste expresa que no valió la pena.' },
  { id: 'es_speak', lang: 'es', start: 17.4,  dur: 2.5, text: '¿Y tú? Completa la frase en voz alta.' },
  // 19.9 – 22.9 s: deliberate silent pause for the viewer to speak
  { id: 'es_cta',   lang: 'es', start: 23.3,  dur: 5.1, text: 'Practica inglés con Fluent English. Escríbenos “INGLÉS” por mensaje.' },
];

export const PAUSE = { start: 19.9, end: 22.9 };

// Spanish caption chunks (never carry IPA). f0/f1 are fractions of the clip's duration, so captions
// re-sync automatically when real audio durations are imported (see applyTiming). end:'pause' = end of speaking pause.
export const CAPTIONS = [
  { clip: 'es_hook',  f0: 0,    f1: 1,    lines: ['¿Gastar dinero y desperdiciarlo', 'se dicen igual en inglés?'] },
  { clip: 'es_spend', f0: 0,    f1: .426, lines: ['Spend es gastar.'] },
  { clip: 'es_spend', f0: .426, f1: 1.06, lines: ['No significa que', 'sea algo malo.'] },
  { clip: 'es_waste', f0: 0,    f1: 1.03, lines: ['Waste expresa que', 'no valió la pena.'] },
  { clip: 'es_speak', f0: 0,    f1: .42,  lines: ['¿Y tú?'] },
  { clip: 'es_speak', f0: .42,  end: 'pause', lines: ['Completa la frase', 'en voz alta.'] },
  { clip: 'es_cta',   f0: 0,    f1: .51,  lines: ['Practica inglés con', 'Fluent English.'] },
  { clip: 'es_cta',   f0: .51,  f1: 1.06, lines: ['Escríbenos “INGLÉS”', 'por mensaje.'] },
];

// English teaching sentences. words[]: {w: display text, ipa: US IPA (no slashes), punct: trailing punctuation}
export const SENTENCES = {
  spend: {
    key: 'spend', color: '#0E9F6E', focus: ['spend'],
    words: [
      { w: 'I', ipa: 'aɪ' }, { w: 'spend', ipa: 'spend' }, { w: 'money', ipa: 'ˈmʌni' },
      { w: 'on', ipa: 'ɑːn' }, { w: 'groceries', ipa: 'ˈɡrəʊsəriz', punct: '.' },
    ],
    // word highlight times (absolute s) while spoken (estimated until audio is imported)
    hlf: [0, .13, .39, .63, .79], hl: [],
    shown: [3.95, 10.1],
  },
  waste: {
    key: 'waste', color: '#E04A36', focus: ['wasted'],
    words: [
      { w: 'I', ipa: 'aɪ' }, { w: 'wasted', ipa: 'ˈweɪstɪd' }, { w: 'money', ipa: 'ˈmʌni' },
      { w: 'on', ipa: 'ɑːn' }, { w: 'this', ipa: 'ðɪs' }, { w: 'gadget', ipa: 'ˈɡædʒɪt', punct: '.' },
    ],
    hlf: [0, .12, .38, .6, .71, .88], hl: [],
    shown: [10.55, 17.0],
  },
  speak: {
    key: 'speak', color: '#B87400', focus: ['spend'],
    words: [
      { w: 'I', ipa: 'aɪ' }, { w: 'spend', ipa: 'spend' }, { w: 'money', ipa: 'ˈmʌni' },
      { w: 'on', ipa: 'ɑːn' }, { w: '___', ipa: null, punct: '.' },
    ],
    hl: [], shown: [17.2, 23.0],
  },
};

export const HOOK_PHRASES = [
  { w: 'SPEND MONEY', ipa: 'spend ˈmʌni', color: '#0E9F6E', at: 0.35 },
  { w: 'WASTE MONEY', ipa: 'weɪst ˈmʌni', color: '#FF6B57', at: 1.05 },
];

// Resolve caption windows + word highlights from clip start/dur. Call again after importing real audio timings.
export function applyTiming(overrides = {}) {
  for (const c of CLIPS) if (overrides[c.id]) Object.assign(c, overrides[c.id]);
  const clip = Object.fromEntries(CLIPS.map(c => [c.id, c]));
  for (const cap of CAPTIONS) {
    const c = clip[cap.clip];
    cap.t0 = c.start + cap.f0 * c.dur;
    cap.t1 = cap.end === 'pause' ? PAUSE.end : c.start + cap.f1 * c.dur;
  }
  const en = { spend: clip.en_spend, waste: clip.en_waste };
  for (const k of ['spend', 'waste']) SENTENCES[k].hl = SENTENCES[k].hlf.map(x => en[k].start + x * en[k].dur);
}
applyTiming();
