// Single source of truth for timing, script, captions and IPA.
// IPA uses the Fluent English Sound Chart symbols (same set as Oxford Learner's Dictionaries, US).
// NOTE: audio is PENDING. Clip start/dur are planning estimates until real voiceover is imported
// (see audio/manifest.json and scripts/measure_audio.mjs).
export const DURATION = 28.9;
export const FPS = 30;

export const SCENES = [
  { id: 'hook',  t0: 0.0,  t1: 3.8 },
  { id: 'spend', t0: 3.8,  t1: 10.9 },
  { id: 'waste', t0: 10.9, t1: 16.9 },
  { id: 'speak', t0: 16.9, t1: 22.9 },
  { id: 'cta',   t0: 22.9, t1: 28.9 },
];

// Voice clips: real durations (seconds) of the locally synthesised narration in audio/*.wav (see voice/build_narration.py).
// Starts are placed so every clip sits inside its scene; audio/manifest.json "timing" can override after re-synthesis.
export const CLIPS = [
  { id: 'es_hook',  lang: 'es', start: 0.25,  dur: 3.34, text: '¿Gastar dinero y desperdiciarlo se dicen igual en inglés?' },
  { id: 'en_spend', lang: 'en', start: 4.2,   dur: 1.82, text: 'I spend money on groceries.' },
  { id: 'es_spend', lang: 'es', start: 6.45,  dur: 4.09, text: 'Spend es gastar. No significa que sea algo malo.' },
  { id: 'en_waste', lang: 'en', start: 11.3,  dur: 1.86, text: 'I wasted money on this gadget.' },
  { id: 'es_waste', lang: 'es', start: 13.9,  dur: 2.49, text: 'Waste expresa que no valió la pena.' },
  { id: 'es_speak', lang: 'es', start: 17.3,  dur: 2.71, text: '¿Y tú? Completa la frase en voz alta.' },
  // 20.01 – 22.9 s: deliberate silent pause for the viewer to speak (no voice, music/ambience/effects ducked out)
  { id: 'es_cta',   lang: 'es', start: 23.2,  dur: 5.22, text: 'Practica inglés con Fluent English. Escríbenos “INGLÉS” por mensaje.' },
];

export const PAUSE = { start: 20.05, end: 22.9 };

// Spanish caption chunks (never carry IPA). f0/f1 are fractions of the clip's duration, so captions
// re-sync automatically when real audio durations are imported (see applyTiming). end:'pause' = end of speaking pause.
export const CAPTIONS = [
  { clip: 'es_hook',  f0: 0,    f1: 1,    lines: ['¿Gastar dinero y desperdiciarlo', 'se dicen igual en inglés?'] },
  { clip: 'es_spend', f0: 0,    f1: .39, lines: ['Spend es gastar.'] },
  { clip: 'es_spend', f0: .43, f1: 1.04, lines: ['No significa que', 'sea algo malo.'] },
  { clip: 'es_waste', f0: 0,    f1: 1.06, lines: ['Waste expresa que', 'no valió la pena.'] },
  { clip: 'es_speak', f0: 0,    f1: .30,  lines: ['¿Y tú?'] },
  { clip: 'es_speak', f0: .30,  end: 'pause', lines: ['Completa la frase', 'en voz alta.'] },
  { clip: 'es_cta',   f0: 0,    f1: .47,  lines: ['Practica inglés con', 'Fluent English.'] },
  { clip: 'es_cta',   f0: .53,  f1: 1.05, lines: ['Escríbenos “INGLÉS”', 'por mensaje.'] },
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
    hlf: [.015, .165, .41, .605, .69], hl: [],
    shown: [4.05, 10.8],
  },
  waste: {
    key: 'waste', color: '#E04A36', focus: ['wasted'],
    words: [
      { w: 'I', ipa: 'aɪ' }, { w: 'wasted', ipa: 'ˈweɪstɪd' }, { w: 'money', ipa: 'ˈmʌni' },
      { w: 'on', ipa: 'ɑːn' }, { w: 'this', ipa: 'ðɪs' }, { w: 'gadget', ipa: 'ˈɡædʒɪt', punct: '.' },
    ],
    hlf: [.015, .12, .36, .52, .60, .73], hl: [],
    shown: [11.15, 16.8],
  },
  speak: {
    key: 'speak', color: '#B87400', focus: ['spend'],
    words: [
      { w: 'I', ipa: 'aɪ' }, { w: 'spend', ipa: 'spend' }, { w: 'money', ipa: 'ˈmʌni' },
      { w: 'on', ipa: 'ɑːn' }, { w: '___', ipa: null, punct: '.' },
    ],
    hl: [], shown: [17.1, 22.9],
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
