/* ===== Activities 3-5 ===== */
const miniSvg = (people, objs = '') => `<svg viewBox="0 0 300 175" width="100%" aria-hidden="true" style="background:linear-gradient(#fff3da,#f6e2bb);border-radius:12px">${objs}${people.map((p) => Art.person(Object.assign({ y: 168, s: 0.46 }, p))).join('')}</svg>`;

/* ---------- A3 example beats ---------- */
function exampleBeat(e) {   // e.who = the character whose voice says the sentence (omit for the narrator)
  return {
    inv: { kind: 'word-join-example', pronoun: e.p, be: e.be, rest: e.rest, sentence: e.sentence, voice: e.who || 'narrator' },
    title: e.title, talk: 10, turn: `Say: ${e.sentence}`, es: e.es,
    render: () => cols(e.scene(), `<div class="card"><span class="pill ${e.fam}">${tx(e.famLabel)}</span>
      <div class="row" style="margin:.7rem 0;gap:.6rem;min-height:5rem" id="chips"><span class="chip fly l" id="c1">${tx(e.p)}</span><span class="chip ${e.be} fly u" id="c2">${tx(e.be)}</span><span class="chip fly r" id="c3">${tx(e.rest)}</span></div>
      <div class="big-sentence fadein" id="full">${tx(e.sentence, { be: 1 })}</div></div>
      <div class="meaning">${tx(e.note)}</div>`),
    seq: [
      { t: e.intro || 'Watch the words join.', pre: (A) => A.wait(150) },
      { pre: (A) => { A.on('c1'); A.sfx('join'); }, wait: 700 },
      { pre: (A) => { A.on('c2'); A.sfx('join'); }, wait: 700 },
      { pre: (A) => { A.on('c3'); A.sfx('join'); }, wait: 700 },
      { pre: (A) => A.on('full'), t: e.sentence, rate: 0.88, who: e.who },
    ],
  };
}
const A3EX = [
  { who: 'ken', title: 'I → am', p: 'I', be: 'am', rest: 'a student.', fam: 'coral', famLabel: 'I → am', sentence: 'I am a student.', note: 'The speaker says *I*. Use *am* with *I*.', es: '"I" va con "am": I am a student = Soy estudiante.',
    scene: () => SC({ alt: 'Ken holds a notebook and speaks.', ppl: [['ken', 480, { s: 1, poseL: 'hold', held: { L: 'notebook' }, poseR: 'chest' }]], tags: [NT('ken', 480), TG('Ken is speaking', null, 480, 88)] }) },
  { who: 'alex', title: 'You → are', p: 'You', be: 'are', rest: 'ready.', fam: 'violet', famLabel: 'You → are', sentence: 'You are ready.', note: 'The listener is *you*. Use *are* with *you*.', es: '"You" siempre va con "are": You are ready = Estás listo/a.',
    scene: () => SC({ alt: 'Alex talks to Maya, who is ready.', ppl: [['alex', 270, { poseR: 'present', gaze: 0.8 }], ['maya', 690, { gaze: -0.8, expr: 'happy' }]], tags: [NT('alex', 270), NT('maya', 690), TG('Alex is speaking', null, 270, 88)], rings: [RING('rr', 690, 330, 170, 340, 'violet')] }) },
  { title: 'He → is', p: 'He', be: 'is', rest: 'a teacher.', fam: 'teal', famLabel: 'He / She / It → is', sentence: 'He is a teacher.', note: 'One man: *he*. Use *is*.', es: '"He", "she" e "it" van con "is". Con trabajos usamos a/an: a teacher.',
    scene: () => SC({ alt: 'Daniel holds a book.', ppl: [['daniel', 480, { s: 1, poseL: 'holdHi', held: { L: 'book' }, job: null }]], tags: [TG('Daniel', 'he/him · a teacher', 480, 505, '', 'he')] }) },
  { title: 'She → is', p: 'She', be: 'is', rest: 'happy.', fam: 'teal', famLabel: 'He / She / It → is', sentence: 'She is happy.', note: 'One woman: *she*. Use *is*.', es: '"She is happy" = Ella está feliz.',
    scene: () => SC({ alt: 'Lena is smiling.', ppl: [['lena', 480, { s: 1, expr: 'happy' }]], tags: [NT('lena', 480)] }) },
  { title: 'It → is', p: 'It', be: 'is', rest: 'a phone.', fam: 'teal', famLabel: 'He / She / It → is', sentence: 'It is a phone.', note: 'One thing: *it*. Use *is*.', es: '"It is a phone" = Es un teléfono.',
    scene: () => SC({ alt: 'A phone on a table.', ppl: [], objs: [{ raw: Art.table(480, 400, 360) }, { type: 'phone', x: 480, y: 398, s: 2.2 }], tags: [TG('a phone', null, 480, 505, '', 'it')] }) },
  { who: 'alex', title: 'We → are', p: 'We', be: 'are', rest: 'in class.', fam: 'violet', famLabel: 'You / We / They → are', sentence: 'We are in class.', note: 'The speaker and another person: *we*. Use *are*.', es: '"We are in class" = Estamos en clase.',
    scene: () => SC({ alt: 'Alex and Maya in class. Alex speaks.', ppl: [['alex', 380, { poseL: 'chest' }], ['maya', 580, {}]], tags: [NT('alex', 380), NT('maya', 580), TG('Alex is speaking', null, 380, 88)], rings: [RING('rw', 480, 330, 420, 340, 'coral')] }) },
  { title: 'They → are', p: 'They', be: 'are', rest: 'friends.', fam: 'violet', famLabel: 'You / We / They → are', sentence: 'They are friends.', note: 'Other people: *they*. Use *are*.', es: '"They are friends" = Son amigos.',
    scene: () => SC({ alt: 'Omar and Rosa laugh together in a cafe.', bg: 'cafe', ppl: [['omar', 330, { expr: 'happy', gaze: 0.5 }], ['rosa', 630, { expr: 'happy', gaze: -0.5 }]], tags: [NT('omar', 330), NT('rosa', 630)] }) },
].map(exampleBeat);

/* ---------- A3 age + feelings ---------- */
const A3AGE = {
  title: 'Age and feelings with be', talk: 10, turn: 'Say: I’m … years old. (An invented age is fine.)',
  es: 'En inglés la edad se dice con be: I’m 33 years old (no "I have 33"). Los sentimientos también: I’m happy. Y siempre decimos el sujeto: I’m tired, no "Am tired".',
  render: () => cols(SC({ alt: 'Alex speaks about his age.', ppl: [['alex', 480, { s: 1, poseL: 'chest', expr: 'smile' }]], tags: [NT('alex', 480), TG('Alex is speaking', null, 480, 88)], bub: [BUB('bAge', 480, 104, "I'm 33 years old.")] }),
    `<div class="card fadein" id="ag1"><span class="pill">${tx('Age')}</span><div class="big-sentence" style="margin-top:.3rem">${tx('I am *33* years old.', { be: 1 })}</div><div class="mid-sentence">${tx("I'm 33 years old.")}</div></div>
     <div class="card fadein" id="ag2"><span class="pill coral">${tx('Feeling')}</span><div class="big-sentence" style="margin-top:.3rem">${tx('She is *happy*.', { be: 1 })}</div><div class="mid-sentence">${tx("I'm tired.")}</div></div>
     <div class="card fadein" id="ag3"><div class="mid-sentence"><span class="ok-mark">✓</span> ${tx("I'm tired.")} &nbsp; <span class="bad-mark">✗</span> <span class="strike">${tx('Am tired.')}</span></div><div class="meaning" style="margin-top:.4rem">${tx('English usually needs a subject. Say *I* or *she* or *they* first, then be.')}</div></div>`),
  seq: [
    { t: 'In English, we use be for age.' },
    { pre: (A) => { A.on('ag1'); A.on('bAge'); A.sfx('pop'); }, t: "I'm thirty-three years old.", who: 'alex', rate: 0.88 },
    { pre: (A) => { A.on('ag2'); A.sfx('pop'); }, t: "She is happy. I'm tired.", rate: 0.88 },
    { pre: (A) => { A.on('ag3'); A.sfx('pop'); }, t: 'English usually needs the subject. Say I, she, or they first.' },
  ],
};

/* ---------- A3 builds ---------- */
const A3B = [
  { instr: 'Say the sentence about Sofia (she/her). Then build it.', target: ['She', 'is', 'a', 'doctor.'], extra: ['am', 'are', 'He'], tips: { am: 'With *she* we use *is*, not *am*.', are: 'With *she* we use *is*, not *are*.', He: 'Sofia uses she/her, so we choose *she*.' }, explain: '*She* goes with *is*. A job needs *a*: a doctor.', pic: () => SC({ alt: 'Sofia wears a white coat.', ppl: [['sofia', 480, { s: 1, job: 'doctor', poseR: 'hip' }]], tags: [TG('Sofia', 'she/her · a doctor', 480, 505, '', 'she')] }), es: 'Construye: She is a doctor. "She" va con "is".' },
  { instr: 'Ken talks about Ken. Say it. Then build it.', target: ['I', 'am', 'a', 'student.'], extra: ['is', 'are', 'He'], tips: { is: 'With *I* we use *am*.', are: 'With *I* we use *am*.', He: 'Ken is the speaker, so Ken says *I*.' }, explain: '*I* goes with *am*.', pic: () => SC({ alt: 'Ken holds a notebook and speaks.', ppl: [['ken', 480, { s: 1, job: 'student', poseL: 'hold', held: { L: 'notebook' }, poseR: 'chest' }]], tags: [TG('Ken', 'he/him · a student', 480, 505, '', 'he'), TG('Ken is speaking', null, 480, 88)] }), es: 'Ken habla de sí mismo: I am a student.' },
  { instr: 'Talk about Omar and Rosa. Say it. Then build it.', target: ['They', 'are', 'friends.'], extra: ['is', 'am', 'We'], tips: { is: '*They* is plural: use *are*.', am: '*Am* is only for *I*.', We: 'We are not in the picture: Omar and Rosa are other people, so *they*.' }, explain: '*They* goes with *are*.', pic: () => SC({ alt: 'Omar and Rosa in a cafe.', bg: 'cafe', ppl: [['omar', 330, { expr: 'happy', gaze: 0.5 }], ['rosa', 630, { expr: 'happy', gaze: -0.5 }]], tags: [NT('omar', 330), NT('rosa', 630)] }), es: 'Omar y Rosa son otras personas: They are friends.' },
  { instr: 'Look at the laptop. Say it. Then build it.', target: ['It', 'is', 'a', 'laptop.'], extra: ['They', 'are', 'am'], tips: { They: 'One laptop: use *it*, not *they*.', are: 'One thing: use *is*.', am: '*Am* is only for *I*.' }, explain: 'One thing: *it* + *is*.', pic: () => SC({ alt: 'One laptop on a desk.', bg: 'office', ppl: [], objs: [{ raw: Art.table(480, 400, 360) }, { type: 'laptop', x: 480, y: 398, s: 2.2 }], tags: [TG('a laptop', null, 480, 505, '', 'it')] }), es: 'Una sola cosa: It is a laptop.' },
  { instr: 'Ken talks about Ken and Lena. Say it. Then build it.', target: ['We', 'are', 'in', 'class.'], extra: ['They', 'is', 'am'], tips: { They: 'Ken is speaking and is part of the group: *we*.', is: '*We* goes with *are*.', am: '*Am* is only for *I*.' }, explain: '*We* goes with *are*.', pic: () => SC({ alt: 'Ken and Lena in class. Ken speaks.', ppl: [['ken', 380, { poseL: 'chest' }], ['lena', 580, {}]], tags: [NT('ken', 380), NT('lena', 580), TG('Ken is speaking', null, 380, 88)], rings: [RING('rb', 480, 330, 420, 340, 'coral')] }), es: 'Ken y Lena: We are in class.' },
  { instr: 'Talk about Daniel (he/him). Say it. Then build it.', target: ['He', 'is', 'an', 'engineer.'], extra: ['a', 'am', 'She'], tips: { a: 'Engineer starts with a vowel sound: use *an*.', am: '*Am* is only for *I*.', She: 'Daniel uses he/him, so we choose *he*.' }, explain: 'Use *an* before a vowel sound: an engineer.', pic: () => SC({ alt: 'Daniel wears a hard hat.', ppl: [['daniel', 480, { s: 1, job: 'engineer', poseR: 'hip' }]], tags: [TG('Daniel', 'he/him · an engineer', 480, 505, '', 'he')] }), es: 'Antes de sonido vocal usamos "an": an engineer.' },
].map((it, i) => ({ inv: { kind: 'build', id: 'B' + (i + 1), instruction: it.instr, tiles: it.target.concat(it.extra), answerKey: it.target, sentence: it.full || it.target.join(' '), tipsForWrongTiles: it.tips, explanation: it.explain }, title: `Build it ${i + 1} of 6`, talk: 20, turn: 'Say the sentence first.', es: it.es, make: () => Comp.build(Object.assign({}, it, { pic: it.pic() }), i + 3), seq: [{ t: it.instr }] }));

/* ---------- A3 word bank ---------- */
const WB = { pron: ['I', 'you', 'he', 'she', 'it', 'we', 'they'], be: ['am', 'is', 'are'], words: ['a student', 'a teacher', 'a doctor', 'happy', 'tired', 'ready', 'friends', 'in class', 'a phone'] };
/** Word-bank pattern check (pure function, unit-tested). tokens = the words the learner clicked, in order.
 *  Checks pronoun + be agreement and whether the finishing phrase fits. It does NOT judge pronunciation or full meaning.
 *  Returns {ok, level: 'good'|'incomplete'|'hint', code, msg} */
const WB_BE = { i: 'am', he: 'is', she: 'is', it: 'is', you: 'are', we: 'are', they: 'are' };
const WB_PERSON_NOUN = ['a student', 'a teacher', 'a doctor'], WB_THING_NOUN = ['a phone'], WB_PLURAL_NOUN = ['friends'], WB_FEELING = ['happy', 'tired', 'ready'], WB_PLACE = ['in class'];
function checkPattern(tokens) {
  const t = (tokens || []).map((x) => String(x).trim()).filter(Boolean);
  const res = (ok, level, code, msg) => ({ ok, level, code, msg });
  if (!t.length) return res(false, 'incomplete', 'empty', 'Choose a pronoun from the word bank to start.');
  const p = t[0].toLowerCase(), P = p === 'i' ? 'I' : p;           // "I" is stored upper-case in the bank; always compare lower-case
  if (!Object.prototype.hasOwnProperty.call(WB_BE, p)) return res(false, 'hint', 'start', 'Start with a pronoun: I, you, he, she, it, we, or they.');
  if (t.length < 2) return res(false, 'incomplete', 'need-be', `Good start. Now add *${WB_BE[p]}* after *${P}*.`);
  const be = t[1].toLowerCase();
  if (!['am', 'is', 'are'].includes(be)) return res(false, 'hint', 'not-be', `After *${P}* we need *${WB_BE[p]}*.`);
  if (be !== WB_BE[p]) return res(false, 'hint', 'agreement', `With *${P}* we use *${WB_BE[p]}*, not *${be}*.`);
  if (t.length < 3) return res(false, 'incomplete', 'need-end', `Good: *${P} ${be}*. Add a word or phrase to finish the sentence.`);
  if (t.length > 3) return res(false, 'hint', 'too-long', 'Use one pronoun, one form of be, and one finishing phrase.');
  const c = t[2].toLowerCase(), plural = ['we', 'they'].includes(p), pers = ['i', 'he', 'she', 'you'].includes(p);
  const known = [...WB_PERSON_NOUN, ...WB_THING_NOUN, ...WB_PLURAL_NOUN, ...WB_FEELING, ...WB_PLACE];
  if (!known.includes(c)) return res(false, 'hint', 'unknown-end', 'Choose a finishing phrase from the word bank.');
  if ([...WB_PERSON_NOUN, ...WB_THING_NOUN].includes(c) && plural) return res(false, 'hint', 'plural-subject', `*${P}* is plural, so use a plural word like *friends*: ${P} ${be} friends.`);
  if (WB_PLURAL_NOUN.includes(c) && ['i', 'he', 'she', 'it'].includes(p)) return res(false, 'hint', 'singular-subject', `*friends* is plural. Use *you*, *we*, or *they*.`);
  if (WB_THING_NOUN.includes(c) && p !== 'it') return res(false, 'hint', 'thing-noun', `*${c}* is a thing. Use *it* for one thing.`);
  if (WB_PERSON_NOUN.includes(c) && p === 'it') return res(false, 'hint', 'person-noun', `Use *it* for things. For a person, use I, you, he, or she.`);
  void pers;
  return res(true, 'good', 'ok', `Pattern OK: ${P[0].toUpperCase() + P.slice(1)} ${be} ${c}. (This checks only pronoun + be and whether the words fit. It does not judge pronunciation.)`);
}

const A3WB = {
  inv: { kind: 'word-bank-check', rules: { be: WB_BE, personNouns: WB_PERSON_NOUN, thingNouns: WB_THING_NOUN, pluralNouns: WB_PLURAL_NOUN, feelings: WB_FEELING, places: WB_PLACE }, note: 'pattern check only: pronoun + be agreement and word fit; no pronunciation judgement' },
  title: 'Your own sentences', talk: 40, turn: 'Say your sentence aloud.', es: 'Usa el banco de palabras para crear tus frases. El pronombre y be deben coincidir: I-am, he/she/it-is, you/we/they-are. Es una revisión simple del patrón.',
  render: () => cols(SC({ alt: 'Four people in a bright room.', ppl: [['alex', 150, {}], ['maya', 330, {}], ['daniel', 580, {}], ['sofia', 780, {}]], tags: [NT('alex', 150), NT('maya', 330), NT('daniel', 580), NT('sofia', 780)] }),
    `<div class="card"><div class="slotline" id="wb-line" aria-live="polite"></div><div class="row" style="margin-top:.4rem"><button class="btn sm" id="wb-check">Check the pattern</button><button class="btn sm alt" id="wb-say">Listen</button><button class="btn sm alt" id="wb-clear">Clear</button></div><div id="wb-fb" aria-live="polite" style="margin-top:.4rem"></div></div>
     <div class="card"><b class="pill">${tx('Word bank')}</b><div class="row" style="margin-top:.4rem">${WB.pron.map((w) => `<button class="tile" data-w="${w}">${tx(w)}</button>`).join('')}</div><div class="row" style="margin-top:.4rem">${WB.be.map((w) => `<button class="tile" data-w="${w}" style="border-color:var(--be-${w})">${tx(w)}</button>`).join('')}</div><div class="row" style="margin-top:.4rem">${WB.words.map((w) => `<button class="tile" data-w="${w}">${tx(w)}</button>`).join('')}</div></div>`),
  seq: [{ t: 'Make your own sentence. Use the word bank. Say it out loud.' }],
  bind: (A) => {
    const r = A.root, line = $('#wb-line', r), fb = $('#wb-fb', r); let toks = [];
    const draw = () => { line.innerHTML = toks.map((t) => `<span class="chip">${tx(t, { be: 1 })}</span>`).join(''); };
    $$('[data-w]', r).forEach((b) => b.addEventListener('click', () => { toks.push(b.dataset.w); draw(); Sound.sfx('click'); fb.innerHTML = ''; }));
    $('#wb-clear', r).onclick = () => { toks = []; draw(); fb.innerHTML = ''; };
    $('#wb-say', r).onclick = () => { if (toks.length) A.sayBg([toks.join(' ') + '.']); };
    $('#wb-check', r).onclick = () => {
      const m = checkPattern(toks);
      fb.innerHTML = `<div class="meaning" style="${m.ok ? 'border-color:#1c8a5a;background:#e6f6ee' : m.level === 'incomplete' ? '' : 'border-color:#c9644d;background:#fdf0ec'}">${tx(m.msg)}</div>`; Sound.sfx(m.ok ? 'correct' : 'gentle');
    };
  },
};

/* ================= ACTIVITY 3 ================= */
ACTS.push({
  n: 3, title: 'Build Sentences with Am, Is, and Are', spoken: 'Build sentences with am, is, and are',
  es: 'Construimos frases: I → am; he/she/it → is; you/we/they → are.',
  beats: [
    { title: 'Three families of be', talk: 0, es: 'Tres familias: I con am (coral); he, she, it con is (verde azulado); you, we, they con are (violeta).',
      render: () => `<div class="fam" style="flex-direction:row;gap:.8rem">
        <div class="card box am" id="f1" style="flex:1;border:3px solid var(--be-am)">${miniSvg([{ who: 'alex', x: 150, poseL: 'chest' }])}<div class="row c" style="margin-top:.5rem"><span class="chip fly l" id="c11">${tx('I')}</span><span class="chip am fly r" id="c12">${tx('am')}</span></div></div>
        <div class="card box is" id="f2" style="flex:1;border:3px solid var(--be-is)">${miniSvg([{ who: 'daniel', x: 70 }, { who: 'sofia', x: 150 }], Art.obj('phone', 235, 160, 0.8))}<div class="row c" style="margin-top:.5rem"><span class="chip fly l" id="c21">${tx('He / She / It')}</span><span class="chip is fly r" id="c22">${tx('is')}</span></div></div>
        <div class="card box are" id="f3" style="flex:1;border:3px solid var(--be-are)">${miniSvg([{ who: 'maya', x: 60, poseR: 'present' }, { who: 'omar', x: 150 }, { who: 'rosa', x: 235 }])}<div class="row c" style="margin-top:.5rem"><span class="chip fly l" id="c31">${tx('You / We / They')}</span><span class="chip are fly r" id="c32">${tx('are')}</span></div><div class="small-note center" style="text-align:center">${tx('*you* = one or many')}</div></div></div>
        <div class="meaning fadein" id="fam-n">${tx('Be changes with the subject: *am*, *is*, *are*.')}</div>`,
      seq: [
        { t: 'Three families.', pre: (A) => A.wait(100) },
        { pre: (A) => { A.on('f1'); A.on('c11'); A.sfx('join'); A.on('c12'); }, t: 'I goes with am.' },
        { pre: (A) => { A.on('f2'); A.on('c21'); A.sfx('join'); A.on('c22'); }, t: 'He, she, and it go with is.' },
        { pre: (A) => { A.on('f3'); A.on('c31'); A.sfx('join'); A.on('c32'); }, t: 'You, we, and they go with are.' },
        { pre: (A) => A.on('fam-n'), t: 'Be changes with the subject.' },
      ] },
    ...A3EX,
    A3AGE,
    ...A3B,
    A3WB,
  ],
});

/* ================= ACTIVITY 4: contractions ================= */
const CONTR = [
  { p: 'I', rm: 'a', rest: 'm', full: 'I am', c: "I'm", s: "I'm a student." },
  { p: 'you', rm: 'a', rest: 're', full: 'you are', c: "you're", s: "You're ready." },
  { p: 'he', rm: 'i', rest: 's', full: 'he is', c: "he's", s: "He's a teacher." },
  { p: 'she', rm: 'i', rest: 's', full: 'she is', c: "she's", s: "She's happy." },
  { p: 'it', rm: 'i', rest: 's', full: 'it is', c: "it's", s: "It's a phone." },
  { p: 'we', rm: 'a', rest: 're', full: 'we are', c: "we're", s: "We're in class." },
  { p: 'they', rm: 'a', rest: 're', full: 'they are', c: "they're", s: "They're friends." },
];
const crow = (c, i, big) => `<div class="card crow" id="cr${i}" style="display:flex;flex-wrap:wrap;gap:.6rem;align-items:center"><span class="chip">${tx(c.p)}</span><span class="chip be">${tx('*' + c.rm + '*' + c.rest)}</span><span style="font-size:1.6rem">→</span><span class="chip fly r" id="rs${i}" style="${big ? 'font-size:2.6rem' : ''}">${tx(c.c)}</span><span class="mid-sentence fadein" id="se${i}">${tx(c.s)}</span><button class="btn sm alt" data-rep="${i}" aria-label="Repeat ${esc(c.s)}">Repeat</button></div>`;
const crowSeq = (i) => [
  { pre: (A) => { A.root.querySelector('#cr' + i).classList.add('cut'); A.sfx('click'); }, wait: 600 },
  { pre: (A) => { A.on('rs' + i); A.sfx('pop'); }, wait: 400 },
  { pre: (A) => A.on('se' + i), t: CONTR[i].s, rate: 0.88, pause: 350 },
];
const repBind = (A) => $$('[data-rep]', A.root).forEach((b) => b.addEventListener('click', () => { A.sayBg([{ t: CONTR[+b.dataset.rep].s, rate: 0.85 }]); }));

ACTS.push({
  n: 4, title: 'Contractions: Make It Natural', spoken: 'Contractions. Make it natural',
  es: 'Contracciones: unimos pronombre + be y el apóstrofo reemplaza la letra que falta: I am → I’m.',
  beats: [
    { title: 'I am → I’m', talk: 10, es: 'En "I am" quitamos la "a" y ponemos un apóstrofo: I’m. El apóstrofo ocupa el lugar de la letra que falta.', turn: "Say: I'm a student.",
      render: () => `${crow(CONTR[0], 0, true)}<div class="meaning fadein" id="rl">${tx("The apostrophe (’) takes the place of the missing letter.")}</div>`,
      seq: [{ t: 'We can join two words. I am becomes I’m.' }, ...crowSeq(0), { pre: (A) => A.on('rl'), t: 'The apostrophe replaces the missing letter.' }], bind: repBind },
    { title: 'Three more contractions', talk: 30, es: 'you are → you’re; he is → he’s; she is → she’s. Escucha y repite.', turn: 'Repeat each sentence.',
      render: () => `${[1, 2, 3].map((i) => crow(CONTR[i], i)).join('')}<div class="small-note">${tx('Repeating after a computer voice practices rhythm. It does not prove your pronunciation is accurate.')}</div>`,
      seq: [...crowSeq(1), ...crowSeq(2), ...crowSeq(3)], bind: repBind },
    { title: 'Last three contractions', talk: 25, es: 'it is → it’s; we are → we’re; they are → they’re. Nota opcional: "it’s" (it is) no es "its" (posesivo).', turn: 'Repeat each sentence.',
      render: () => `${[4, 5, 6].map((i) => crow(CONTR[i], i)).join('')}<details class="card"><summary><b>${tx('Optional teacher note')}</b></summary><div class="small-note" style="margin-top:.3rem">${tx("It's = it is. The word its (no apostrophe) is a different word.")}</div></details>`,
      seq: [...crowSeq(4), ...crowSeq(5), ...crowSeq(6)], bind: repBind },
    { title: 'Change to contractions', talk: 45, es: 'Convierte las frases a contracciones. Di la frase y luego revela la respuesta.', turn: 'Say each sentence with a contraction.',
      render: () => `<div class="instr">${tx('Say each sentence with a contraction.')}</div>${[['I am happy.', "I'm happy."], ['She is a nurse.', "She's a nurse."], ['We are ready.', "We're ready."], ['They are in class.', "They're in class."]].map(([a, b], i) => `<div class="card" style="display:flex;flex-wrap:wrap;gap:.8rem;align-items:center"><span class="pill">${i + 1}</span><span class="mid-sentence">${tx(a, { be: 1 })}</span><span style="font-size:1.5rem">→</span><span class="ans inl mid-sentence" style="color:var(--teal-800)"><b>${tx(b)}</b></span></div>`).join('')}`,
      seq: [{ t: 'Change four sentences. Use a contraction.' }], ansSay: ["I'm happy. She's a nurse. We're ready. They're in class."] },
    { title: 'Your own contractions', talk: 70, es: 'Di dos frases con contracciones sobre ti o sobre una persona inventada. Puedes usar datos inventados.', turn: 'Say two sentences with I’m, he’s, she’s, we’re, or they’re.',
      render: () => cols(SC({ alt: 'Four friends.', bg: 'cafe', ppl: [['alex', 150, { expr: 'happy' }], ['maya', 330, {}], ['omar', 580, {}], ['lena', 780, { expr: 'tired' }]], tags: [NT('alex', 150), NT('maya', 330), NT('omar', 580), NT('lena', 780)] }),
        `<div class="card"><b class="pill gold">${tx('Starters')}</b><div class="mid-sentence" style="margin-top:.4rem">${["I'm …", "He's …", "She's …", "We're …", "They're …"].map((s) => `<div>${tx(s)}</div>`).join('')}</div></div><div class="card"><b class="pill">${tx('Ideas')}</b><div class="mid-sentence" style="margin-top:.3rem">${tx('ready · happy · tired · a student · a teacher · in class')}</div></div><div class="meaning">${tx('Use your own information, a person in the picture, or invented details.')}</div>`),
      seq: [{ t: 'Say two sentences. About you, or about a person in the picture.' }] },
  ],
});

/* ================= ACTIVITY 5: negatives ================= */
const bagScene = () => SC({ alt: 'A red bag on a table.', bg: 'class', ppl: [], objs: [{ raw: Art.table(480, 400, 380) }, { type: 'bag', x: 480, y: 398, s: 2.4 }], tags: [TG('a red bag', null, 480, 505, '', 'it')] });
ACTS.push({
  n: 5, title: 'Negatives: Change the Meaning', spoken: 'Negatives. Change the meaning',
  es: 'Negativos con be: sujeto + be + not. Contracciones: She’s not / She isn’t. Con "I" solo: I’m not.',
  beats: [
    { title: 'The picture and the sentence', talk: 0, es: 'La bolsa es roja. La frase "It is blue" no coincide con la imagen.',
      render: () => cols(bagScene(), `<div class="card"><div class="big-sentence" id="s1">${tx('It is blue.', { be: 1 })}</div><div class="fadein bad-mark" id="x1" style="font-size:1.6rem">✗ ${tx('Not true')}</div></div><div class="meaning fadein" id="mm">${tx('The bag is red. We change the meaning with *not*.')}</div>`),
      seq: [{ t: 'Look at the bag. It is red.' }, { t: 'This sentence says: It is blue. No.', pre: (A) => { A.on('x1'); A.sfx('gentle'); } }, { t: 'We change the meaning with not.', pre: (A) => A.on('mm') }] },
    { title: 'Subject + be + not', talk: 0, es: 'La fórmula: sujeto + be + not. It is not blue.',
      render: () => cols(bagScene(), `<div class="card"><div class="row" id="nrow" style="gap:.5rem;min-height:4.5rem"><span class="chip">${tx('It')}</span><span class="chip is">${tx('is')}</span><span class="chip not fly u" id="nnot">${tx('not')}</span><span class="chip">${tx('blue.')}</span></div><div class="big-sentence fadein" id="nfull" style="margin-top:.5rem">${tx('It is not blue.', { be: 1 })}</div></div><div class="card fadein" id="nred"><div class="big-sentence">${tx("It's red.")}</div></div><div class="card center"><b>${tx('subject + be + *not*')}</b></div>`),
      seq: [{ t: 'Subject, be, not.' }, { pre: (A) => { A.on('nnot'); A.sfx('join'); }, wait: 700 }, { pre: (A) => A.on('nfull'), t: 'It is not blue.' }, { pre: (A) => A.on('nred'), t: 'It is red.' }] },
    { title: 'Two natural short forms', talk: 10, es: 'Dos contracciones: "It’s not blue" (pronombre + be, not) o "It isn’t blue" (be + n’t). Las dos son correctas.', turn: 'Repeat: It’s not blue. It isn’t blue.',
      render: () => cols(bagScene(), `<div class="card"><table class="t"><tr><th>${tx('Full form')}</th><th>${tx('Short form A')}</th><th>${tx('Short form B')}</th></tr>${[['I am not', "I'm not", '—'], ['You are not', "You're not", "You aren't"], ['He is not', "He's not", "He isn't"], ['She is not', "She's not", "She isn't"], ['It is not', "It's not", "It isn't"], ['We are not', "We're not", "We aren't"], ['They are not', "They're not", "They aren't"]].map((r) => `<tr class="fadein" style="display:table-row"><td>${tx(r[0])}</td><td>${tx(r[1])}</td><td>${r[2] === '—' ? '—' : tx(r[2])}</td></tr>`).join('')}</table></div>`, 'narrow-left'),
      seq: [{ t: 'Two common short forms.' }, { t: "It's not blue. It isn't blue.", rate: 0.88 }, { t: "We're not late. We aren't late.", rate: 0.88 }, { t: 'Both are correct.' }] },
    { title: 'With I: only I’m not', talk: 10, es: 'Con "I" solo decimos "I’m not". No decimos "I amn’t" en inglés estándar americano.', turn: 'Say: I’m not tired.',
      render: () => `<div class="cols even"><div class="card" style="border:3px solid var(--good)"><div class="big-sentence">${tx("I am not tired.")}</div><div style="font-size:1.8rem;margin:.3rem 0">↓</div><div class="big-sentence">${tx("I'm not tired.")} <span class="ok-mark">✓</span></div></div><div class="card" style="border:3px solid #c9644d"><div class="big-sentence" style="text-decoration:line-through;opacity:.7">${tx("I amn't tired.")} <span class="bad-mark">✗</span></div><div class="meaning" style="margin-top:.5rem;border-color:#c9644d">${tx('We do not use *I amn’t* in standard American English.')}</div></div></div>${SC({ alt: 'Alex looks fresh and awake.', ppl: [['alex', 480, { s: 1, expr: 'smile', poseL: 'chest' }]], tags: [NT('alex', 480), TG('Alex is speaking', null, 480, 88)] })}`,
      seq: [{ t: "With I, we say I'm not." }, { t: "I'm not tired.", rate: 0.88 }, { t: 'We do not say I amn’t in standard American English.' }] },
    ...[
      { c: 'True or false? 1 of 4', sc: () => SC({ alt: 'One phone on a table.', ppl: [], objs: [{ raw: Art.table(480, 400, 360) }, { type: 'phone', x: 480, y: 398, s: 2.2 }], tags: [TG('a phone', null, 480, 505, '', 'it')] }), frame: 'They are phones.', big: 'False ✗', sentence: 'It is a phone.', facts: 'There is one phone.', why: 'Change three things: they → it, are → is, phones → a phone.', say: 'The picture shows one phone. Is the sentence true? If false, correct it.', ansSay: ['False. It is a phone.'], es: 'Falso: hay un solo teléfono. Cambia 3 cosas: they→it, are→is, phones→a phone.', bad: true },
      { c: 'True or false? 2 of 4', sc: () => SC({ alt: 'Maya wears a white coat and stethoscope.', ppl: [['maya', 480, { s: 1, job: 'doctor', poseR: 'hip' }]], tags: [NT('maya', 480)] }), frame: 'She is a teacher.', big: 'False ✗', sentence: "She isn't a teacher. / She's a doctor.", facts: 'Maya has one job. She is a doctor.', why: 'Maya’s only job is doctor, so she is not a teacher.', say: 'Read the fact. Is the sentence true? If false, correct it with a negative sentence.', ansSay: ["False. She isn't a teacher. She's a doctor."], es: 'Falso: Maya es doctora. Corrige: She isn’t a teacher. She’s a doctor.', bad: true },
      { c: 'True or false? 3 of 4', sc: () => SC({ alt: 'Omar and Alex are smiling.', bg: 'cafe', ppl: [['omar', 330, { expr: 'happy', gaze: 0.5 }], ['alex', 630, { expr: 'happy', gaze: -0.5 }]], tags: [NT('omar', 330), NT('alex', 630)] }), frame: 'They are tired.', big: 'False ✗', sentence: "They aren't tired. / They're happy.", facts: 'Omar is happy and rested. Alex is happy and rested. Neither of them is tired.', why: 'The facts say neither person is tired, so the sentence is false.', say: 'Read the facts. Is the sentence true? If false, correct it.', ansSay: ["False. They aren't tired. They're happy."], es: 'Falso: los dos sonríen. Corrige: They aren’t tired. They’re happy.', bad: true },
      { c: 'True or false? 4 of 4', sc: () => bagScene(), frame: 'It is red.', big: 'True ✓', sentence: "It is red. / It isn't blue.", facts: 'The bag is red.', why: 'The bag is red. Add a true negative sentence too.', say: 'Is this sentence true? Then add a negative sentence about the bag.', ansSay: ["True. It is red. It isn't blue."], es: 'Verdadero. Añade una negativa verdadera: It isn’t blue.' },
    ].map((d) => promptBeat({ title: d.c, talk: 35, es: d.es, scene: d.sc, instr: 'True or false? If it is false, say the correct sentence.', frame: d.frame, facts: d.facts, big: d.big, sentence: d.sentence, why: d.why, say: [{ t: d.say }], ansSay: d.ansSay, turn: 'Say: true or false. Then correct it.', bad: d.bad })),
    promptBeat({ title: 'Your negative sentence 1', talk: 40, es: 'Habla de la manzana (it) con una frase negativa. La manzana es verde, así que "It isn’t blue" es verdadera.', turn: 'Say one negative sentence about the apple.',
      scene: () => SC({ alt: 'A blue chair and a green apple.', bg: 'plain', ppl: [], objs: [{ type: 'chair', x: 360, y: 450, s: 1.7, o: { color: '#2d6fd0' } }, { type: 'apple', x: 640, y: 440, s: 2.6, o: { color: '#3fa856' } }], tags: [TG('the blue chair', null, 360, 505, '', 'it'), TG('the green apple', null, 640, 505, '', 'it')] }),
      facts: 'The apple is green. The chair is blue.', instr: 'Talk about the green apple. It = the apple. Say one negative sentence with it.', starters: ["It isn't …", "It's not …"], extra: "Now talk about the chair. It = the chair. Say: It isn't green.", sentence: "It isn't blue. / It isn't red. / It's not a chair.", why: 'Here *it* = the apple. The apple is green, so *it isn’t blue* and *it isn’t red* are true.', say: [{ t: 'Talk about the green apple. It means the apple. Say one negative sentence with it.' }], ansSay: ["It isn't blue. It isn't red."] }),
    promptBeat({ title: 'Your negative sentence 2', talk: 40, es: 'Lee los datos y habla de Alex y Maya con una frase negativa.', turn: 'Say one negative sentence about the people.',
      scene: () => SC({ alt: 'Alex and Maya in class.', ppl: [['alex', 330, {}], ['maya', 630, {}]], tags: [NT('alex', 330), NT('maya', 630)] }),
      facts: 'Alex is a student. Maya is a teacher. Neither of them is tired.', instr: 'Use the facts. Talk about the people. Say one negative sentence.', starters: ["He isn't …", "She isn't …", "They aren't …"], sentence: "He isn't a teacher. / She isn't a student. / They aren't tired.", why: 'Check the subject, then be + not. Each sentence matches the facts.', say: [{ t: 'Read the facts. Talk about Alex and Maya. Say one negative sentence.' }], ansSay: ["He isn't a teacher. They aren't tired."] }),
  ],
});
