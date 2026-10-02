/* ===== Activity 2: Subject pronouns ===== */
const duoScene = () => SC({
  alt: 'Alex on the left and Maya on the right face each other.', s: 1.05,
  ppl: [['alex', 250, { y: 470, gaze: 0.8, id: 'alex' }], ['maya', 710, { y: 470, gaze: -0.8, id: 'maya' }]],
  tags: [NT('alex', 250), NT('maya', 710), PILL('I', 110, 250, 'pI', 'coral', 1), PILL('you', 850, 250, 'pU', 'violet', 1)],
  bub: [BUB('bAl', 250, 98, "I'm Alex. You're Maya."), BUB('bMa', 710, 98, "I'm Maya. You're Alex.")],
});
const chk = (label) => `<span class="pill green">✓ ${label}</span>`;

ACTS.push({
  n: 2, title: 'Subject Pronouns: Who Are We Talking About?', spoken: 'Subject pronouns. Who are we talking about?',
  es: 'Pronombres sujeto: I, you, he, she, it, we, they. "I" y "you" cambian según quién habla.',
  beats: [
    { title: 'I and you change with the speaker', talk: 15, es: 'Cuando Alex habla, "I" es Alex y "you" es Maya. Cuando habla Maya, cambian: "I" es Maya y "you" es Alex.',
      render: () => cols(duoScene(), `${sentenceCard("I'm Alex. You're Maya.", 'Alex is speaking. *I* = Alex. *you* = Maya.')}<div class="card"><div class="fadein" id="rule1"><span class="bigpill coral">${tx('I')}</span> = ${tx('the speaker')} &nbsp; <span class="bigpill violet">${tx('you')}</span> = ${tx('the listener')}</div></div>`),
      seq: [
        { t: 'Alex is speaking.', pre: (A) => { A.on('tg-x'); A.on('pI'); A.on('pU'); A.pose('alex', 'L', 'chest', 600); } },
        { t: "I'm Alex.", who: 'alex', rate: 0.85, pre: (A) => { A.on('bAl'); A.sfx('pop'); } },
        { t: "You're Maya.", who: 'alex', rate: 0.85, pre: (A) => { A.pose('alex', 'L', 'rest', 400); A.pose('alex', 'R', 'present', 700); } },
        { t: 'I is the speaker. You is the listener.', pre: (A) => A.on('rule1') },
      ], turn: 'Say after the voice: I’m Alex. You’re Maya.' },
    { title: 'Now the speaker changes', talk: 30, es: 'Ahora habla Maya: "I" cambia a Maya y "you" cambia a Alex. Practica con tu nombre (o un nombre inventado).',
      render: () => cols(duoScene(), `${sentenceCard("I'm Maya. You're Alex.", 'Maya is speaking now. *I* = Maya. *you* = Alex.')}<div class="card"><div class="mid-sentence">${tx("I'm *…* (your name). You're *…* (your partner).")}</div><div class="small-note">${tx('Use your real name or an invented name.')}</div></div>`),
      seq: [
        { t: 'Now Maya is speaking.', pre: (A) => { A.on('pI'); A.on('pU'); } },
        { t: 'Look. I and you change places.', pre: (A) => { A.sfx('whoosh'); mv('pI', 850, 250); mv('pU', 110, 250); A.pose('maya', 'R', 'chest', 600); } },
        { t: "I'm Maya.", who: 'maya', rate: 0.85, pre: (A) => { A.on('bMa'); A.sfx('pop'); } },
        { t: "You're Alex.", who: 'maya', rate: 0.85, pre: (A) => { A.pose('maya', 'R', 'rest', 400); A.pose('maya', 'L', 'present', 700); } },
        { t: 'I and you change with the speaker.' },
      ], turn: 'Your turn: I’m … You’re … (names)' },
    { title: 'He, she, and it', talk: 15, es: 'Usamos el pronombre que la persona nos dice (he/him, she/her). No lo adivinamos por la foto. "It" es para una cosa concreta.',
      render: () => cols(SC({
        alt: 'Alex, Maya and a phone on a table.', ppl: [['alex', 170, {}], ['maya', 380, {}]], objs: [{ raw: Art.table(650, 392, 200) }, { type: 'phone', x: 650, y: 390, s: 1.1 }],
        tags: [NT('alex', 170, 510, 'n1'), NT('maya', 380, 510, 'n2'), TG('a phone', null, 650, 510, 'n3', 'it'), PILL('he', 170, 112, 'p1', 'teal'), PILL('she', 380, 112, 'p2', 'coral'), PILL('it', 650, 250, 'p3', 'gold')],
      }), `<div class="card"><div class="mid-sentence fadein" id="r1">${tx('Alex — *he*/him')}</div><div class="mid-sentence fadein" id="r2" style="margin-top:.3rem">${tx('Maya — *she*/her')}</div><div class="mid-sentence fadein" id="r3" style="margin-top:.3rem">${tx('a phone — *it*')}</div></div>
         <div class="meaning fadein" id="r4">${tx('We use the pronouns people give us. We do not guess from a picture.')}</div>
         <div class="meaning fadein" id="r5">${tx('Use *it* for one clear thing, like a phone or a book.')}</div>`),
      seq: [
        { t: 'Alex. He.', pre: (A) => { A.on('n1'); A.on('p1'); A.on('r1'); A.sfx('pop'); }, post: (A) => A.wait(300) },
        { t: 'Maya. She.', pre: (A) => { A.on('n2'); A.on('p2'); A.on('r2'); A.sfx('pop'); }, post: (A) => A.wait(300) },
        { t: 'A phone. It.', pre: (A) => { A.on('n3'); A.on('p3'); A.on('r3'); A.sfx('pop'); } },
        { t: 'We use the pronouns people tell us.', pre: (A) => A.on('r4') },
        { t: 'It is for one clear thing.', pre: (A) => A.on('r5') },
      ], turn: 'Say: Alex — he. Maya — she. A phone — it.' },
    { title: 'We and they', talk: 15, es: '"We" = yo + otras personas. "They" = otras personas (yo no estoy). "They" también puede ser cosas, y siempre va con "are".',
      render: () => cols(SC({
        alt: 'Alex and Maya stand together on the left. Daniel and Sofia stand together on the right.', s: 0.9,
        ppl: [['alex', 120, { id: 'alex', gaze: 0.6 }], ['maya', 290, { id: 'maya' }], ['daniel', 640, { id: 'daniel' }], ['sofia', 810, { id: 'sofia' }]],
        tags: [NT('alex', 120), NT('maya', 290), NT('daniel', 640), NT('sofia', 810), PILL('we', 205, 112, 'pw', 'coral'), PILL('they', 725, 112, 'pt', 'violet'), TG('Alex is speaking', null, 205, 36, 'sp', '')],
        rings: [RING('rgw', 205, 320, 330, 330, 'coral'), RING('rgt', 725, 320, 330, 330, 'violet')],
      }), `<div class="card fadein" id="w1"><div class="mid-sentence">${tx('*we* = I + other people')}</div></div><div class="card fadein" id="w2"><div class="mid-sentence">${tx('*they* = other people (not me)')}</div></div><div class="meaning fadein" id="w3">${tx('*they* can also mean things: two phones → they.')}</div>
        <details class="card"><summary><b>Optional teacher note</b></summary><div class="small-note" style="margin-top:.3rem">${tx('Some people use *they* for one person. It still takes *are*.')}</div></details>`),
      seq: [
        { t: 'Alex is speaking.', pre: (A) => A.on('sp') },
        { t: 'Alex and Maya: we.', pre: (A) => { A.on('rgw'); A.on('pw'); A.on('w1'); A.sfx('pop'); } },
        { t: 'Daniel and Sofia: they.', pre: (A) => { A.on('rgt'); A.on('pt'); A.on('w2'); A.sfx('pop'); } },
        { t: 'We includes the speaker. They is other people.', pre: (A) => A.on('w3') },
      ], turn: 'Say: Alex and Maya — we. Daniel and Sofia — they.' },
    { title: 'You: one person or many people', talk: 10, es: '"You" sirve para una persona o para varias. Es igual.',
      render: () => `<div class="cols even"><div class="stack">${SC({ alt: 'Maya talks to Alex.', s: 0.8, ppl: [['maya', 240, { id: 'm1', gaze: 0.8, poseR: 'present' }], ['alex', 700, { id: 'a1', gaze: -0.8 }]], tags: [NT('maya', 240), NT('alex', 700), PILL('you', 700, 120, 'y1', 'violet')], rings: [RING('ry1', 700, 320, 190, 340, 'violet')] })}<div class="card center"><b>${tx('you = 1 person')}</b></div></div>
        <div class="stack">${SC({ alt: 'Maya talks to Alex and Omar.', s: 0.8, ppl: [['maya', 150, { id: 'm2', gaze: 0.8, poseR: 'present' }], ['alex', 520, { id: 'a2', gaze: -0.4 }], ['omar', 790, { id: 'o2', gaze: -0.4 }]], tags: [NT('maya', 150), NT('alex', 520), NT('omar', 790), PILL('you', 655, 120, 'y2', 'violet')], rings: [RING('ry2', 655, 320, 420, 340, 'violet')] })}<div class="card center"><b>${tx('you = 2 people (plural)')}</b></div></div></div>
        <div class="meaning fadein" id="yy">${tx('English uses the same word, *you*, for one person or for many people.')}</div>`,
      seq: [
        { t: 'Maya talks to Alex. You. One person.', pre: (A) => { A.on('ry1'); A.on('y1'); } },
        { t: 'Maya talks to Alex and Omar. You. Two people.', pre: (A) => { A.on('ry2'); A.on('y2'); } },
        { t: 'The word is the same.', pre: (A) => A.on('yy') },
      ], turn: 'Say: You — one person. You — two people.' },
    ...[
      { c: 'Challenge 1 of 6', who: 'alex', instr: 'Talk about Alex. Which pronoun? Say a sentence.', frame: '___ is Alex.', big: 'he', sentence: 'He is Alex.', why: 'Alex is one man (he/him), so we use *he*.', sc: () => SC({ alt: 'Alex sits alone at a desk.', ppl: [['alex', 480, { s: 1, poseL: 'desk', poseR: 'desk' }]], tags: [NT('alex', 480)] }), es: 'Desafío 1: Hablamos de Alex (he/him): "He is Alex."' },
      { c: 'Challenge 2 of 6', instr: 'Maya is talking about Maya. Which pronoun?', frame: '___ am Maya.', big: 'I', sentence: 'I am Maya.', why: 'The speaker uses *I* for herself.', sc: () => SC({ alt: 'Maya speaks alone.', ppl: [['maya', 480, { s: 1, poseL: 'chest' }]], tags: [NT('maya', 480), TG('Maya is speaking', null, 480, 110)] }), es: 'Desafío 2: Maya habla de sí misma: "I am Maya."' },
      { c: 'Challenge 3 of 6', instr: 'Maya talks to Alex. Which pronoun does Maya use for Alex?', frame: '___ are Alex.', big: 'you', sentence: 'You are Alex.', why: 'Alex is the listener, so Maya says *you*.', sc: () => SC({ alt: 'Maya speaks to Alex.', ppl: [['maya', 270, { poseR: 'present', gaze: 0.8 }], ['alex', 690, { gaze: -0.8 }]], tags: [NT('maya', 270), NT('alex', 690), TG('Maya is speaking', null, 270, 110)], rings: [RING('r3', 690, 330, 170, 340, 'violet')] }), es: 'Desafío 3: Maya habla con Alex: para él usa "you".' },
      { c: 'Challenge 4 of 6', instr: 'Look at the picture: one thing. Which pronoun?', frame: '___ is a phone.', big: 'it', sentence: 'It is a phone.', why: 'One thing: *it*.', sc: () => SC({ alt: 'One phone on a table.', ppl: [], objs: [{ raw: Art.table(480, 400, 360) }, { type: 'phone', x: 480, y: 398, s: 2.2 }], tags: [TG('a phone', null, 480, 505, '', 'it')] }), es: 'Desafío 4: Una cosa: "It is a phone."' },
      { c: 'Challenge 5 of 6', instr: 'Alex talks about Alex and Maya. Which pronoun?', frame: '___ are friends.', big: 'we', sentence: 'We are friends.', why: 'Alex is in the group, so we use *we*.', sc: () => SC({ alt: 'Alex and Maya together. Alex speaks.', ppl: [['alex', 380, { poseL: 'chest' }], ['maya', 580, {}]], tags: [NT('alex', 380), NT('maya', 580), TG('Alex is speaking', null, 380, 110)], rings: [RING('r5', 480, 330, 420, 340, 'coral')] }), es: 'Desafío 5: Alex habla de Alex y Maya: "We are friends."' },
      { c: 'Challenge 6 of 6', instr: 'Alex talks about Daniel and Sofia. Which pronoun?', frame: '___ are friends.', big: 'they', sentence: 'They are friends.', why: 'Daniel and Sofia are other people, not Alex: *they*.', sc: () => SC({ alt: 'Alex looks at Daniel and Sofia.', ppl: [['alex', 170, { poseR: 'point', gaze: 0.8 }], ['daniel', 580, {}], ['sofia', 780, {}]], tags: [NT('alex', 170), NT('daniel', 580), NT('sofia', 780), TG('Alex is speaking', null, 170, 110)], rings: [RING('r6', 680, 330, 420, 340, 'violet')] }), es: 'Desafío 6: Alex habla de Daniel y Sofia: "They are friends."' },
    ].map((d, i) => promptBeat({
      title: d.c, talk: 15, es: d.es, scene: d.sc, instr: d.instr, frame: d.frame, big: d.big, sentence: d.sentence, why: d.why,
      say: [{ t: d.instr }], turn: `Say the whole sentence: ${d.frame.replace('___', '…')}`,
      ansSay: [d.big === 'I' ? 'I.' : d.big + '.', d.sentence],
    })),
    { title: 'Recall round: one minute', talk: 35, es: 'Ronda de repaso de un minuto con imágenes nuevas. Di el pronombre y una frase completa. Revela las respuestas al final.',
      render: () => {
        const items = [
          { n: 1, a: 'he', s: SC({ alt: 'Omar.', s: 0.62, ppl: [['omar', 480, { y: 480 }]], tags: [NT('omar', 480, 505)] }) },
          { n: 2, a: 'she', s: SC({ alt: 'Lena.', s: 0.62, bg: 'cafe', ppl: [['lena', 480, { y: 480 }]], tags: [NT('lena', 480, 505)] }) },
          { n: 3, a: 'they', s: SC({ alt: 'Two laptops.', s: 0.62, bg: 'office', ppl: [], objs: [{ type: 'laptop', x: 330, y: 440, s: 2 }, { type: 'laptop', x: 640, y: 440, s: 2 }], tags: [TG('two laptops', null, 480, 505, '', 'grp')] }) },
          { n: 4, a: 'we', s: SC({ alt: 'Ken speaks with Rosa.', s: 0.62, bg: 'cafe', ppl: [['ken', 330, { y: 480, poseL: 'chest' }], ['rosa', 620, { y: 480 }]], tags: [NT('ken', 330, 505), NT('rosa', 620, 505), TG('Ken is speaking', null, 330, 130)], rings: [RING('rr4', 480, 320, 400, 280, 'coral')] }) },
        ];
        return `<div class="row" style="justify-content:space-between"><div class="row"><div class="ringtimer" id="rt" role="timer" aria-label="One minute timer"><b id="rt-n">60</b></div><button class="btn" id="rt-go">Start 60 seconds</button></div><div class="instr">${tx('Which pronoun? Say a sentence.')}</div></div>
          <div class="cols even" style="grid-template-columns:1fr 1fr">${items.map((it) => `<div class="card"><div class="row" style="margin-bottom:.3rem"><span class="pill">${it.n}</span><span class="ans inl pill green" style="margin-left:auto"><b>${tx(it.a)}</b></span></div>${it.s}</div>`).join('')}</div>`;
      },
      seq: [{ t: 'Recall time. Look at the four new pictures.' }],
      bind: (A) => {
        $('#rt-go', A.root).onclick = () => A.spawn && A.spawn();
        let running = false;
        $('#rt-go', A.root).onclick = async () => {
          if (running) return; running = true; Sound.sfx('turn');
          try { for (let s = 60; s >= 0; s--) { $('#rt-n', A.root).textContent = s; $('#rt', A.root).style.setProperty('--p', ((60 - s) / 60) * 100); if (s === 0) break; await A.wait(1000); } Sound.sfx('timeup'); A.sayBg(['Time is up. Check the answers.']); } catch (e) { if (e !== CANCEL) console.error(e); }
        };
      },
      ansSay: ['He. She. They. We.'],
    },
  ],
});
