/* CONTENT 2 — Sections 4–6 */
(function (FE) {
  'use strict';
  const { T, hd, meaning, ans, fact, note, frames, spk, tag, typed, esc } = FE.ui;

  /* ============ 4. PICTURE DETECTIVES ============ */
  const DET = [
    { n: 1, ref: 'Reference: the bag', stmt: 'The bag is red.', neg: "The bag isn't red.", aff: "It's blue.", ev: 'The bag is blue. Look at the picture.', frames: ["The bag isn't ___.", "It's ___."], full: 'The bag is not red. It is blue.', tags: [['the bag', 52, 44]], es: 'La bolsa es azul. Primero la corrección negativa, luego la afirmativa con la evidencia del dibujo.' },
    { n: 2, ref: 'Reference: It = the object in the gold frame', stmt: 'It is a book.', neg: "It isn't a book.", aff: "It's a phone.", ev: 'The object in the gold frame is one phone.', frames: ["It isn't a ___.", "It's a ___."], full: 'It is not a book. It is a phone.', tags: [['It', 50, 37]], es: '"It" es el objeto dentro del marco dorado. Es un teléfono, no un libro. Recuerda a antes de phone.' },
    { n: 3, ref: 'Reference: the books', stmt: 'The books are on the chair.', neg: "The books aren't on the chair.", aff: "They're on the desk.", ev: 'Two books are on the desk. The chair is empty.', frames: ["The books aren't on the ___.", "They're on the ___."], full: 'The books are not on the chair. They are on the desk.', tags: [['chair', 15, 42], ['desk', 62, 64]], es: 'Books es plural: usa are / aren\'t. Están en el escritorio (desk), no en la silla (chair).' },
    { n: 4, ref: 'Reference: Alex (label: teacher, he)', stmt: 'Alex is a doctor.', neg: "Alex isn't a doctor.", aff: "He's a teacher.", ev: 'The label says: Alex, teacher, pronoun he.', frames: ["Alex isn't a ___.", "He's a ___."], full: 'Alex is not a doctor. He is a teacher.', badge: true, es: 'La etiqueta dice que Alex es profesor y usa "he". No adivinamos el trabajo por la apariencia.' },
    { n: 5, ref: 'Reference: They = the three people in the classroom', stmt: 'They are at home.', neg: "They aren't at home.", aff: "They're in a classroom.", ev: 'The sign says: Classroom. The three people are inside it.', frames: ["They aren't at ___.", "They're in a ___."], full: 'They are not at home. They are in a classroom.', sign: true, es: 'El letrero dice "Classroom". Están en un salón de clases, no en casa. They va con are.' },
    { n: 6, ref: 'Reference: Maya (label: she)', stmt: 'Maya is sad.', neg: "Maya isn't sad.", aff: "She's happy.", ev: 'Maya’s thought bubble says: I feel happy.', frames: ["Maya isn't ___.", "She's ___."], full: 'Maya is not sad. She is happy.', bubble: true, es: 'El globo de pensamiento dice "I feel happy". Por eso no está triste. La etiqueta dice she.' }
  ];
  const detScene = (d) => {
    let ov = '';
    (d.tags || []).forEach((t) => (ov += tag(t[0], t[1], t[2])));
    if (d.badge) ov += `<div class="idcard" style="left:39%;top:46%;font-size:.78em">${T('Alex', 'b')}${T('teacher', 'sm')}${T('pronoun: he', 'xs')}</div>`;
    if (d.sign) ov += `<div class="sign" style="left:50%;top:6%">${T('Classroom', 'b')}</div>`;
    if (d.bubble) { ov += `<div class="thought" style="left:69%;top:24%">${T('I feel happy.', 'b')}</div><div class="idcard" style="left:20%;top:76%">${T('Maya', 'b')}${T('pronoun: she', 'xs')}</div>`; }
    return `<div class="scene det">${FE.detectiveScene(d.n)}${ov}</div>`;
  };
  const detStep = (d) => ({
    id: '4.' + d.n, phase: 'Detect', title: `Picture detective ${d.n}`, mus: false, quiet: true, model: [d.neg, d.aff],
    say: ['Look carefully.', d.stmt],
    es: d.es + ' Primero con ayuda (frases), luego sin ayuda.',
    async onReveal(c) { if (d.n === 4) c.gesture('.c-alex', 1, 'present'); if (d.n === 6) c.gesture('.c-maya', 1, 'point'); await c.say(d.neg); await c.wait(250); await c.say(d.aff); },
    html: (c) => `${hd({ phase: 'Detect', title: `Picture detective ${d.n} of 6` })}
      <div class="split det-split ${c.st.nf ? 'nf' : ''}">
        <div>${detScene(d)}<div class="refchip">${T(d.ref, 'sm')}</div></div>
        <div class="side">
          <div class="stmt">${T(d.stmt, 'big')}${spk(d.stmt, 'Replay statement')}</div>
          <div class="steps2"><span class="pill on">1 · ${'Negative correction'}</span><span class="pill on">2 · ${'True correction'}</span></div>
          ${frames(d.frames)}
          <div class="row"><button class="btn ghost" data-act="nf">${c.st.nf ? 'Show frames again' : 'Try again without frames'}</button></div>
          ${ans(`<div class="model neg">${FE.icon('cross')}${T(d.neg, 'big')}${spk(d.neg)}</div>
            <div class="model aff">${FE.icon('check')}${T(d.aff, 'big')}${spk(d.aff)}</div>
            ${note('Evidence: ' + d.ev, 'ev')}
            ${note('Full forms are also correct: ' + d.full)}`)}
        </div>
      </div>`,
    acts: { nf: (c) => { c.st.nf = !c.st.nf; c.q('.det-split').classList.toggle('nf', !!c.st.nf); c.q('[data-act="nf"]').textContent = c.st.nf ? 'Show frames again' : 'Try again without frames'; c.fx.tick(); } },
    onReveal2: null
  });

  FE.defSection({
    id: 4, title: 'Picture Detectives', secs: 480, start: '20:00', end: '28:00',
    steps: DET.map(detStep)
  });

  /* ============ 5. FIX THE SENTENCE ============ */
  const FIX = [
    { bad: 'I not am tired.', fix: 'I am not tired.', ok: ['I am not tired.', "I'm not tired."], why: 'Not goes after am.', frame: '___ goes after ___.' },
    { bad: "She aren't here.", fix: "She isn't here.", ok: ["She isn't here.", "She's not here.", 'She is not here.'], why: 'She goes with is.', frame: '___ goes with ___.' },
    { bad: "They isn't ready.", fix: "They aren't ready.", ok: ["They aren't ready.", "They're not ready.", 'They are not ready.'], why: 'They goes with are.', frame: '___ goes with ___.' },
    { bad: "I amn't late.", fix: "I'm not late.", ok: ["I'm not late.", 'I am not late.'], why: 'With I, the short form is I’m not.', frame: 'With ___, the short form is ___.' },
    { bad: "He doesn't be a doctor.", fix: "He isn't a doctor.", ok: ["He isn't a doctor.", "He's not a doctor.", 'He is not a doctor.'], why: 'With be, we do not use doesn’t. He goes with is.', frame: 'With be, we use ___.' },
    { bad: 'We not at home.', fix: 'We are not at home.', ok: ['We are not at home.', "We're not at home.", "We aren't at home."], why: 'We goes with are. Add are before not.', frame: '___ goes with ___.' }
  ];
  FE.FIX = FIX;
  const fixStep = (f, i) => ({
    id: '5.' + (i + 1), phase: 'Repair', title: `Fix sentence ${i + 1}`, mus: false, quiet: true, model: f.fix,
    say: ['Find the problem. Say the correct sentence.'],
    es: 'Encuentra el error y di la oración correcta. Puedes usar la forma completa o la contraída. Luego explica con palabras simples.',
    async onReveal(c) { await c.say(f.fix); },
    async run(c) { await c.say('Find the problem. Say the correct sentence.'); await c.wait(9000); c.q('.bad') && c.q('.bad').classList.add('dim'); },
    html: () => `${hd({ phase: 'Repair', title: `Fix sentence ${i + 1} of 6` })}
      <div class="fixwrap">
        <div class="bad" aria-label="Incorrect model"><span class="tagbad">${FE.icon('cross')}${T('Incorrect model', 'xs')}</span><span class="badtxt">${T(f.bad, 'big', { noipa: true })}</span></div>
        <div class="gone-note">${T('The incorrect model is now hidden.', 'xs')}</div>
        ${ans(`<div class="model good">${FE.icon('check')}${T(f.fix, 'huge')}${spk(f.fix)}</div>
          <div class="why">${T('Explain it: ' + f.why, 'lead')}</div>
          ${note('Full forms and short forms are both fine if they are grammatical.')}`)}
        <div class="explain">${T('Say why, in simple words. Frame: ' + f.frame, 'sm')}</div>
        ${typed(f.ok, 'Check the be word and where not goes. Do not add do / does / don’t / doesn’t with be.')}
      </div>`
  });
  FE.defSection({
    id: 5, title: 'Fix the Sentence', secs: 420, start: '28:00', end: '35:00', steps: [
      ...FIX.map(fixStep),
      {
        id: '5.7', phase: 'Recap', title: 'Correct sentences', mus: true, model: FIX.map((f) => f.fix),
        es: 'Resumen: estas son las seis oraciones correctas. Léelas en voz alta.',
        html: () => `${hd({ phase: 'Recap', title: 'Correct sentences' })}
          <div class="recap-list">${FIX.map((f) => `<div class="rl">${FE.icon('check')}${T(f.fix, 'big')}${spk(f.fix)}</div>`).join('')}</div>`
      }
    ]
  });

  /* ============ 6. NEGATIVE SHORT ANSWERS ============ */
  const QA = [
    { q: 'Are you tired?', a: ["No, I'm not."], full: ['No, I am not.'], icon: 'battery', scene: 'energy', fact: 'Practice fact: your energy is 90%.', ref: 'you → I', es: 'La pregunta usa "you"; tu respuesta usa "I". Con I solo existe: No, I\'m not.' },
    { q: 'Is she a doctor?', a: ["No, she isn't.", "No, she's not."], full: ['No, she is not.'], icon: 'id', scene: 'rosa', fact: 'Rosa, teacher. Pronoun: she.', ref: 'she = Rosa', es: 'Rosa es profesora (dato en la etiqueta). La respuesta usa she. Ambas formas cortas son correctas.' },
    { q: 'Is it red?', a: ["No, it isn't.", "No, it's not."], full: ['No, it is not.'], icon: 'eye', scene: 'chair', fact: 'The chair is green.', ref: 'it = the chair', es: 'La silla es verde, así que no es roja. "No" solo no dice el color; el dibujo sí.' },
    { q: 'Are they at home?', a: ["No, they aren't.", "No, they're not."], full: ['No, they are not.'], icon: 'pin', scene: 'cafe', fact: 'Ben and Lina are at the café.', ref: 'they = Ben and Lina', es: 'Ben y Lina están en el café. They va con are: aren\'t / \'re not.' }
  ];
  const guidedStep = (g, i) => ({
    id: '6.' + (4 + i), phase: 'Answer', title: `Guided answer ${i + 1}`, mus: false, quiet: true, model: [g.q, ...g.a],
    say: [g.q],
    es: g.es,
    async onReveal(c) { c.gesture('.person', 1, 'present'); for (const a of g.a) { await c.say(a); await c.wait(300); } },
    html: () => `${hd({ phase: 'Answer', title: `Guided answer ${i + 1} of 4` })}
      <div class="split">
        <div class="fig">${g.scene ? FE.factScene(g.scene) : `<div class="bigicon">${FE.icon(g.icon)}</div>`}<div class="figcap">${T(g.ref, 'sm')}</div></div>
        <div class="side">
          <div class="stmt q">${T(g.q, 'huge')}${spk(g.q, 'Replay question')}</div>
          ${fact(g.icon, 'Fact', g.fact)}
          ${T('Say a negative short answer.', 'lead')}
          ${ans(`<div class="forms">${g.a.map((s) => `<div class="form">${FE.icon('check')}${T(s, 'big')}${spk(s)}</div>`).join('')}</div>
            ${note('Also correct: ' + g.full.join(' / '))}`)}
          ${typed([...g.a, ...g.full], 'Start with No, then the pronoun, then be + not. Check the apostrophe.')}
        </div>
      </div>`
  });

  const BANK = ['Are you a pilot?', 'Are you at the airport?', 'Are you angry?', 'Are you in a taxi?', 'Are you a doctor?', 'Are you at the beach?'];
  const origStep = (k) => ({
    id: '6.' + (8 + k), phase: 'Your answer', title: `Your own answer ${k + 1}`, mus: false, quiet: true,
    say: ['Now answer as yourself.'],
    es: 'Responde como tú mismo, o inventa un dato para que tu respuesta sea No. Usa una respuesta corta negativa. El maestro puede cambiar la pregunta.',
    html: (c) => { const idx = (c.st.qi == null ? (k * 2) : c.st.qi) % BANK.length; c.st.qi = idx; return `${hd({ phase: 'Your answer', title: `Your own answer ${k + 1} of 2` })}
      <div class="orig">
        <div class="stmt q" data-q>${T(BANK[idx], 'huge')}${spk(BANK[idx], 'Replay question')}</div>
        <div class="row center"><button class="btn" data-act="nextq">New question</button></div>
        ${T('Use a real fact or an invented fact. Make your answer No.', 'lead')}
        ${note('You do not need to share private information. Invented facts are fine.')}
        ${frames(["No, I'm not.", "No, I'm not ___."])}
        ${ans(`<div class="forms"><div class="form">${FE.icon('check')}${T("No, I'm not.", 'big')}${spk("No, I'm not.")}</div><div class="form">${FE.icon('check')}${T('No, I am not.', 'big')}${spk('No, I am not.')}</div></div>`)}
      </div>`; },
    acts: { nextq: (c) => { c.st.qi = ((c.st.qi || 0) + 1) % BANK.length; c.rerender(); c.say(BANK[c.st.qi]); } }
  });

  FE.defSection({
    id: 6, title: 'Negative Short Answers', secs: 420, start: '35:00', end: '42:00', steps: [
      {
        id: '6.1', phase: 'Pattern', title: 'Questions and short answers', mus: true, model: QA.flatMap((g) => [g.q, g.a[0]]),
        es: 'Repaso rápido: en la pregunta, be va primero. En la respuesta corta negativa: No + sujeto + be + not (contraído).',
        async run(c) {
          for (let i = 0; i < QA.length; i++) { c.beat(i + 1); c.fx.pop(i); await c.say(QA[i].q); await c.wait(400); await c.say(QA[i].a[0]); await c.wait(300); }
          c.beat(5);
        },
        html: () => `${hd({ phase: 'Pattern', title: 'Questions and short answers' })}
          <div class="qa-grid">${QA.map((g, i) => `<div class="qa" data-b="${i + 1}"><div class="q">${T(g.q, 'big')}</div><div class="arrow">→</div><div class="a">${g.a.map((s) => T(s, 'big')).join('')}</div></div>`).join('')}</div>
          <div class="rule" data-b="5">${T('No, + subject + be + not.', 'lead')}</div>`
      },
      {
        id: '6.2', phase: 'Pattern', title: 'You → I, and we', mus: true, model: ['Are you tired?', "No, I'm not.", 'Are you at home?', "No, we aren't."],
        es: 'Si te preguntan "Are you…?" a ti solo, respondes con I. Si le preguntan a dos personas juntas, responden con we. Aquí, Pablo y Rita están en la biblioteca.',
        async run(c) {
          c.beat(1); await c.say('Are you tired?'); await c.wait(400); c.beat(2); c.fx.pop(2); await c.say("No, I'm not."); await c.wait(500);
          c.beat(3); await c.say('Are you at home?'); await c.wait(400); c.beat(4); c.fx.pop(4); await c.say("No, we aren't."); c.beat(5);
        },
        html: () => `${hd({ phase: 'Pattern', title: 'You → I, and we' })}
          <div class="split yi">
            <div class="card one"><div class="qline" data-b="1">${T('Are you tired?', 'big')}<small>${T('Question to one learner', 'xs')}</small></div>
              <div class="swap" data-b="2"><span>you</span><i>→</i><span class="to">I</span></div>
              <div class="aline" data-b="2">${T("No, I'm not.", 'big')}</div></div>
            <div class="card many"><div class="fig small">${FE.factScene('library')}</div>
              <div class="qline" data-b="3">${T('Are you at home?', 'big')}<small>${T('Question to Pablo and Rita together. They are at the library.', 'xs')}</small></div>
              <div class="swap" data-b="4"><span>you</span><i>→</i><span class="to">we</span></div>
              <div class="aline" data-b="4">${T("No, we aren't.", 'big')}<small>${T("Also: No, we're not.", 'xs')}</small></div></div>
          </div>
          ${note('We means the speaker and other people together. Show the group before you use we.', '')}`
      },
      {
        id: '6.3', phase: 'Reminder', title: 'Positive short answers stay complete', mus: true, model: ['Yes, I am.', 'Yes, she is.', 'Yes, they are.'],
        es: 'Recordatorio breve: la respuesta corta afirmativa se queda completa: Yes, I am. (no "Yes, I\'m"). Hoy practicamos las negativas.',
        async run(c) { c.beat(1); await c.say('Yes, I am.'); await c.wait(300); c.beat(2); await c.say('Yes, she is.'); await c.wait(300); c.beat(3); await c.say('Yes, they are.'); c.beat(4); },
        html: () => `${hd({ phase: 'Reminder', title: 'Positive short answers stay complete' })}
          <div class="remind">
            <div class="pos" data-b="1">${T('Yes, I am.', 'huge')}${spk('Yes, I am.')}</div>
            <div class="pos" data-b="2">${T('Yes, she is.', 'big')}${spk('Yes, she is.')}</div>
            <div class="pos" data-b="3">${T('Yes, they are.', 'big')}${spk('Yes, they are.')}</div>
          </div>
          <div data-b="4">${note('A positive short answer is complete. Do not shorten it. Negative short answers can use short forms.')}</div>`
      },
      ...QA.map(guidedStep),
      origStep(0), origStep(1)
    ]
  });
})(window.FE = window.FE || {});
