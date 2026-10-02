/* CONTENT 1 — Sections 1–3 */
(function (FE) {
  'use strict';
  const { T, hd, meaning, ans, fact, note, frames, spk, tag, typed, esc } = FE.ui;
  const SECS = FE.SECTIONS = [];
  FE.defSection = (o) => { SECS.push(o); return o; };

  const room = (hl, labels) => `<div class="scene room ${labels === 'rev' ? 'lab-rev' : 'labels'}">${FE.roomScene(hl)}${FE.roomTags.map((t) => tag(t.w, t.x, t.y)).join('')}</div>`;
  const stmt = (t) => `<div class="stmt">${T(t, 'big')}${spk(t, 'Replay statement')}</div>`;

  /* ============ 1. SPOT THE MISMATCH ============ */
  FE.defSection({
    id: 1, title: 'Spot the Mismatch', secs: 300, start: '00:00', end: '05:00', steps: [
      {
        id: '1.1', phase: 'Look', title: 'Look at the room', mus: true,
        say: ['Welcome to Fluent English.', 'Look at the room.', 'What can you see?'],
        es: 'Mira la habitación. Di qué cosas ves. Puedes usar las etiquetas (botón Revelar) para ayudarte. Esto no es un examen.',
        html: () => `${hd({ phase: 'Look', title: 'Look at the room' })}
          <div class="split"><div>${room(null, 'rev')}</div>
          <div class="side">${T('What can you see? Say the things you know.', 'lead')}
            ${note('This is a warm-up. It is not a test.')}
            ${ans(`<div class="chips">${['bag', 'chair', 'desk', 'books', 'phone'].map((w) => `<span class="chip">${T(w, 'sm')}</span>`).join('')}</div>`)}
          </div></div>`
      },
      {
        id: '1.2', phase: 'Match?', title: 'Does it match?', mus: false, model: "The bag isn't red. It's blue.",
        say: ['Look at the picture.', 'The bag is red.', 'Does it match the picture?'],
        onReveal: (c) => c.say("The bag isn't red. It's blue."),
        es: 'La frase dice que la bolsa es roja, pero en el dibujo es azul. No coincide. Corrección: "The bag isn\'t red. It\'s blue."',
        html: () => `${hd({ phase: 'Match?', title: 'Does it match?' })}
          <div class="split"><div>${room(null)}</div>
          <div class="side">${stmt('The bag is red.')}
            ${T('Yes or no? Look at the picture.', 'lead')}
            ${ans(`<div class="verdict no">${FE.icon('cross')}${T('No. The bag is blue.')}</div>
              <div class="model">${T("The bag isn't red. It's blue.", 'big')}${spk("The bag isn't red. It's blue.", 'Replay model')}</div>
              ${meaning('Isn’t red says one thing: red is not true. The picture tells us the real color: blue.')}`)}
          </div></div>`
      },
      {
        id: '1.3', phase: 'Match?', title: 'Does it match?', mus: false,
        say: ['Look at the phone.', 'It is a phone.', 'Does it match?'],
        onReveal: (c) => c.say('Yes. It is a phone.'),
        es: 'La frase "It is a phone" habla del objeto resaltado. Sí coincide: es un teléfono.',
        html: () => `${hd({ phase: 'Match?', title: 'Does it match?' })}
          <div class="split"><div>${room('phone')}</div>
          <div class="side">${stmt('It is a phone.')}
            ${note('It means the object in the gold ring.')}
            ${T('Yes or no? Look at the gold ring.', 'lead')}
            ${ans(`<div class="verdict yes">${FE.icon('check')}${T('Yes. It is a phone. This one matches.')}</div>`)}
          </div></div>`
      },
      {
        id: '1.4', phase: 'Try it', title: 'Try a correction', mus: false, model: "The books aren't on the chair. They're on the desk.",
        say: ['Look at the books.', 'The books are on the chair.', 'Does it match? Try a correction.'],
        onReveal: (c) => c.say("The books aren't on the chair. They're on the desk."),
        es: 'Los libros están sobre el escritorio, no sobre la silla. Intenta decir la corrección tú mismo. Esta parte no tiene puntos.',
        html: () => `${hd({ phase: 'Try it', title: 'Try a correction' })}
          <div class="split"><div>${room(null)}</div>
          <div class="side">${stmt('The books are on the chair.')}
            ${T('It does not match. Can you correct it?', 'lead')}
            <div class="badge soft">${T('Not scored')}</div>
            ${frames(["The books aren't ___ the ___.", "They're ___ the ___."])}
            ${ans(`<div class="model">${T("The books aren't on the chair.", 'big')}${spk("The books aren't on the chair.")}</div>
              <div class="model">${T("They're on the desk.", 'big')}${spk("They're on the desk.")}</div>`)}
          </div></div>`
      },
      {
        id: '1.5', phase: 'Goal', title: 'Today’s goal', mus: true,
        say: ['Today we say what is not true.', 'And we say what is true.'],
        es: 'Hoy aprenderás a decir lo que NO es verdad con am / is / are + not, y a corregirlo.',
        html: () => `${hd({ phase: 'Goal', title: 'Today’s goal' })}
          <div class="goal">
            <div class="blob b1">${T("The bag isn't red.", 'big')}<small>${T('not true')}</small></div>
            <div class="blob b2">${T("It's blue.", 'big')}<small>${T('true')}</small></div>
          </div>
          <ul class="outcomes">
            <li>${T('Make negatives: subject + am / is / are + not.')}</li>
            <li>${T("Use short forms: I'm not, isn't, aren't.")}</li>
            <li>${T('Correct false statements about pictures.')}</li>
            <li>${T('Answer questions: No, I\'m not.')}</li>
          </ul>`
      }
    ]
  });

  /* ============ 2. THE NEGATIVE ENGINE ============ */
  const FAM = (s) => ({ I: 'am', You: 'are', We: 'are', They: 'are', He: 'is', She: 'is', It: 'is' })[s];
  const BUILDS = [
    { s: 'You', rest: 'late', icon: 'clock', scene: 'clock', label: 'Fact', text: 'Class starts at 6:00. You arrive at 5:50.', ref: 'You = the person we are talking to.', bank: ['are', 'You', 'late', 'not', 'am', 'is'], es: 'Aquí el dato está en el reloj: llegas a las 5:50, la clase empieza a las 6:00. You va con are.' },
    { s: 'He', rest: 'a doctor', icon: 'id', scene: 'leo', label: 'Fact', text: 'Leo, engineer. Pronoun: he.', ref: 'He = Leo.', bank: ['a doctor', 'not', 'He', 'is', 'are', 'am'], es: 'La etiqueta dice que Leo es ingeniero. He va con is. Usamos "a" antes de doctor.' },
    { s: 'She', rest: 'angry', icon: 'bubble', scene: 'rosa', label: 'Fact', text: 'Rosa says: "I feel calm." Pronoun: she.', ref: 'She = Rosa.', bank: ['is', 'angry', 'She', 'am', 'not', 'are'], es: 'Rosa dice que se siente tranquila. No adivinamos sentimientos solo por la cara. She va con is.' },
    { s: 'It', rest: 'a chair', icon: 'eye', scene: 'table', label: 'Fact', text: 'This object is a table.', ref: 'It = this object.', bank: ['not', 'a chair', 'is', 'It', 'am', 'are'], es: 'El objeto es una mesa, no una silla. It va con is.' },
    { s: 'We', rest: 'at home', icon: 'pin', scene: 'library', label: 'Fact', text: 'Pablo and Rita are at the library.', ref: 'We = Pablo and Rita.', bank: ['We', 'are', 'at home', 'is', 'not', 'am'], es: 'Pablo y Rita están en la biblioteca. We va con are.' },
    { s: 'They', rest: 'ready', icon: 'list', scene: 'bags', label: 'Fact', text: 'Ready list for Ben and Lina: bags ✗, tickets ✗.', ref: 'They = Ben and Lina.', bank: ['ready', 'are', 'not', 'is', 'They', 'am'], es: 'En la lista de Ben y Lina, las bolsas y los boletos no están marcados. They va con are.' }
  ];
  FE.BUILDS = BUILDS;

  const buildStep = (b, i) => {
    const full = `${b.s} ${FAM(b.s)} not ${b.rest}.`;
    return {
      id: '2.' + (3 + i), phase: 'Build', title: `Build sentence ${i + 1}`, mus: false, model: full, quiet: true,
      say: ['Say the sentence first.'],
      es: b.es + ' Primero dilo en voz alta; después construye la oración.',
      onReveal: (c) => { c.gesture('.person', 1, 'present'); return c.say(full); },
      html: (c) => `${hd({ phase: 'Build', title: `Build sentence ${i + 1} of 6` })}
        <div class="split build">
          <div class="fig">${FE.factScene(b.scene)}<div class="figcap">${T(b.ref, 'sm')}</div></div>
          <div class="side">
            ${fact(b.icon, b.label, b.text)}
            <div class="say-first">${T('Say it first. Then tap the words.', 'lead')}</div>
            <div class="sentence-line" aria-live="polite" data-line>${(c.st.tokens || []).map((t, k) => `<button class="chip built" data-act="unbuild" data-i="${k}">${T(t, 'sm')}</button>`).join('') || `<span class="hint">${T('Tap words below', 'sm')}</span>`}</div>
            <div class="bank">${b.bank.map((w) => `<button class="chip" data-act="pick" data-w="${esc(w)}" ${(c.st.tokens || []).includes(w) ? 'disabled' : ''}>${T(w, 'sm')}</button>`).join('')}</div>
            <div class="row"><button class="btn" data-act="check-build">Check</button><button class="btn ghost" data-act="undo">Undo</button><button class="btn ghost" data-act="clear">Clear</button></div>
            <div class="fb" role="status" aria-live="polite" data-fb></div>
            ${ans(`<div class="model">${T(full, 'big')}${spk(full)}</div>${note(`${b.s} goes with ${FAM(b.s)}. Not comes after ${FAM(b.s)}.`)}`)}
          </div>
        </div>`,
      acts: {
        pick: (c, el) => { c.st.tokens = (c.st.tokens || []).concat(el.dataset.w); c.fx.pop((c.st.tokens.length) - 1); c.rerender(); },
        unbuild: (c, el) => { c.st.tokens.splice(+el.dataset.i, 1); c.fx.tick(); c.rerender(); },
        undo: (c) => { (c.st.tokens || []).pop(); c.fx.tick(); c.rerender(); },
        clear: (c) => { c.st.tokens = []; c.rerender(); },
        'check-build': (c) => {
          const r = FE.ui.diagnose(b.s, c.st.tokens || [], b.rest);
          const fb = c.q('[data-fb]'); fb.className = 'fb ' + (r.ok ? 'ok' : 'try'); fb.textContent = r.msg;
          if (r.ok) { c.st.done = true; c.fx.good(); c.setRevealed(true, true); c.gesture('.person', 1, 'present'); c.say(full); c.stat('builds', 1); } else c.fx.soft();
        }
      }
    };
  };

  FE.defSection({
    id: 2, title: 'The Negative Engine', secs: 420, start: '05:00', end: '12:00', steps: [
      {
        id: '2.1', phase: 'Pattern', title: 'The negative engine', mus: true, model: 'I am not tired.',
        es: 'La fórmula: sujeto + am/is/are + not + el resto. En inglés NOT va DESPUÉS del verbo be (no antes, como el "no" en español).',
        async run(c) {
          await c.say('Look at the pattern.');
          for (let i = 1; i <= 4; i++) { c.beat(i); c.fx.pop(i - 1); await c.wait(750); }
          c.beat(5); c.fx.reveal();
          await c.say('I am not tired.'); await c.wait(500);
          c.beat(6); await c.say('Not comes after am, is, or are.');
        },
        html: () => `${hd({ phase: 'Pattern', title: 'The negative engine' })}
          <div class="engine">
            <div class="formula">
              <div class="slot s1" data-b="1"><small>${T('subject', 'xs')}</small><b>${T('I')}</b></div><span class="plus" data-b="2">+</span>
              <div class="slot s2" data-b="2"><small>${T('be', 'xs')}</small><b>${T('am')}</b></div><span class="plus" data-b="3">+</span>
              <div class="slot s3" data-b="3"><small>${T('not', 'xs')}</small><b>${T('not')}</b></div><span class="plus" data-b="4">+</span>
              <div class="slot s4" data-b="4"><small>${T('the rest', 'xs')}</small><b>${T('tired')}</b></div>
            </div>
            <div class="built" data-b="5">${T('I am not tired.', 'huge')}${spk('I am not tired.')}</div>
            <div class="row2">${fact('battery', 'Fact', 'The speaker’s energy is 90%.')}
            <div class="rule" data-b="6">${T('Not comes after am, is, or are.', 'lead')}</div></div>
          </div>`
      },
      {
        id: '2.2', phase: 'Pattern', title: 'Three form families', mus: true, model: 'I am not tired. He is not a doctor. They are not ready.',
        es: 'Tres familias: I → am not; he / she / it → is not; you / we / they → are not. They también lleva are, incluso para una sola persona que usa "they". Usa la etiqueta del dibujo; no adivines he o she.',
        async run(c) {
          await c.say('Three families.');
          for (let i = 1; i <= 3; i++) { c.beat(i); c.fx.pop(i * 2); await c.wait(500); await c.say(['I am not tired.', 'He is not a doctor.', 'They are not ready.'][i - 1]); await c.wait(350); }
          c.beat(4);
        },
        html: () => `${hd({ phase: 'Pattern', title: 'Three form families' })}
          <div class="families">
            <div class="fam f1" data-b="1"><div class="who">${T('I')}</div><div class="be">${T('am not')}</div><div class="ex">${T('I am not tired.')}</div></div>
            <div class="fam f2" data-b="2"><div class="who">${T('He / She / It')}</div><div class="be">${T('is not')}</div><div class="ex">${T('He is not a doctor.')}</div></div>
            <div class="fam f3" data-b="3"><div class="who">${T('You / We / They')}</div><div class="be">${T('are not')}</div><div class="ex">${T('They are not ready.')}</div></div>
          </div>
          <div class="reminders" data-b="4">${note('They takes are, also for one person who uses they.')}${note('Use the label or the stated pronoun. Do not guess he or she from a picture.')}</div>`
      },
      ...BUILDS.map(buildStep),
      {
        id: '2.9', phase: 'Meaning', title: 'Not true is not the opposite', mus: true,
        say: ['A negative does not always tell us the opposite.', 'Only the picture or a fact can tell us.'],
        onReveal: (c) => c.say("It isn't red. It's blue."),
        es: '"It isn\'t red" solo dice que NO es rojo. No dice de qué color es. Necesitamos un dato o una imagen para decir lo contrario.',
        html: () => `${hd({ phase: 'Meaning', title: 'Not true is not the opposite' })}
          <div class="oppo">
            <div class="card">${T("It isn't red.", 'big')}<div class="swatch q">?</div>${T('We know: it is not red. We do not know the color.', 'sm')}</div>
            <div class="card">${T("She isn't tired.", 'big')}<div class="swatch q">?</div>${T('We do not know what she feels. We need a fact.', 'sm')}</div>
            ${ans(`<div class="card hit">${fact('eye', 'New fact', 'The picture shows a blue bag.')}<div class="swatch blue"></div>${T("It isn't red. It's blue.", 'big')}</div>`)}
          </div>
          ${meaning('Say the opposite only when a picture or a fact tells you.')}`
      }
    ]
  });

  /* ============ 3. CONTRACTIONS ============ */
  const CONV = [
    { full: 'I am not ready.', ok: ["I'm not ready.", 'I am not ready.'], short: ["I'm not ready."], pron: 'I', hint: 'For I, the short form is I’m not.' },
    { full: 'She is not an engineer.', ok: ["She's not an engineer.", "She isn't an engineer.", 'She is not an engineer.'], short: ["She's not an engineer.", "She isn't an engineer."], pron: 'She' },
    { full: 'It is not red.', ok: ["It's not red.", "It isn't red.", 'It is not red.'], short: ["It's not red.", "It isn't red."], pron: 'It' },
    { full: 'You are not tired.', ok: ["You're not tired.", "You aren't tired.", 'You are not tired.'], short: ["You're not tired.", "You aren't tired."], pron: 'You' },
    { full: 'We are not late.', ok: ["We're not late.", "We aren't late.", 'We are not late.'], short: ["We're not late.", "We aren't late."], pron: 'We' },
    { full: 'They are not here.', ok: ["They're not here.", "They aren't here.", 'They are not here.'], short: ["They're not here.", "They aren't here."], pron: 'They' }
  ];
  FE.CONV = CONV;
  const convStep = (q, i) => ({
    id: '3.' + (5 + i), phase: 'Convert', title: `Short form ${i + 1}`, mus: false, quiet: true, model: [q.full, ...q.short],
    say: ['Listen.', q.full],
    es: q.short.length > 1 ? 'Convierte a forma corta. Las dos formas (\'s not / isn\'t, \'re not / aren\'t) son estándar y correctas.' : 'Con I solo hay una forma corta natural: I\'m not.',
    async onReveal(c) { for (const m of q.short) { await c.say(m); await c.wait(350); } },
    html: (c) => `${hd({ phase: 'Convert', title: `Short form ${i + 1} of 6` })}
      <div class="conv">
        <div class="full">${T(q.full, 'huge')}${spk(q.full, 'Replay full form')}</div>
        <div class="phases" role="group" aria-label="Practice phases">${['Listen', 'Repeat', 'Fresh sentence'].map((p, k) => `<button class="pill ph ${(c.st.ph || 0) === k ? 'on' : ''}" data-act="phase" data-k="${k}">${k + 1} · ${p}</button>`).join('')}</div>
        <div class="prompt">${T('Say the short form. Then say a new sentence with the same subject.', 'lead')}</div>
        ${ans(`<div class="forms">${q.short.map((s) => `<div class="form">${FE.icon('check')}${T(s, 'big')}${spk(s)}</div>`).join('')}</div>
          ${q.short.length > 1 ? note('Both short forms are standard. Do not mark one wrong.') : note(q.hint)}`)}
        ${typed(q.ok, q.hint || 'Check the apostrophe and the subject. Is + not and are + not each have two standard short forms.')}
      </div>`,
    acts: { phase: (c, el) => { c.st.ph = +el.dataset.k; c.qa('.ph').forEach((b, k) => b.classList.toggle('on', k === c.st.ph)); c.fx.tick(); } }
  });

  FE.defSection({
    id: 3, title: 'Contractions That Sound Natural', secs: 480, start: '12:00', end: '20:00', steps: [
      {
        id: '3.1', phase: 'Contract', title: 'I am not → I’m not', mus: true, model: ['I am not.', "I'm not."],
        es: 'I am not → I\'m not. La apóstrofe reemplaza la letra "a". Con I hay UNA sola forma corta natural.',
        async run(c) {
          await c.say('I am not.'); await c.wait(500);
          c.beat(2); c.fx.pop(3); await c.wait(900);
          await c.say("I'm not."); c.beat(3);
        },
        html: () => `${hd({ phase: 'Contract', title: 'I am not → I’m not' })}
          <div class="morph">
            <div class="line big1">I<span class="gone" data-x="2">&nbsp;a</span><span class="ap" data-b="2">’</span>m not</div>
            <div class="ipa-line">${T('I am not → I’m not', 'sm')}</div>
            <div class="btns">${spk('I am not.', 'Replay full form')}${spk("I'm not.", 'Replay short form')}</div>
            <div class="rule" data-b="3">${T('For I, there is one natural short form: I’m not.', 'lead')}</div>
          </div>`
      },
      {
        id: '3.2', phase: 'Contract', title: 'Two paths for is not', mus: true, model: ['She is not ready.', "She's not ready.", "She isn't ready."],
        es: 'Con is not hay DOS caminos: She\'s not (se contrae is) o She isn\'t (se contrae not). Los dos son correctos.',
        async run(c) {
          await c.say('She is not ready.'); await c.wait(400);
          c.beat(2); c.fx.pop(2); await c.say("She's not ready."); await c.wait(400);
          c.beat(3); c.fx.pop(4); await c.say("She isn't ready."); c.beat(4);
        },
        html: () => `${hd({ phase: 'Contract', title: 'Two paths for is not' })}
          <div class="paths">
            <div class="start">${T('She is not ready.', 'huge')}</div>
            <div class="two">
              <div class="path a" data-b="2"><div class="lbl">${T('Path 1: is → ’s', 'sm')}</div><div class="line big2">She<span class="gone" data-x="2">&nbsp;i</span><span class="ap" data-b="2">’</span>s not ready.</div>${spk("She's not ready.")}</div>
              <div class="path b" data-b="3"><div class="lbl">${T('Path 2: not → n’t', 'sm')}</div><div class="line big2">She is<span class="gone" data-x="3">&nbsp;</span>n<span class="ap" data-b="3">’</span><span class="gone" data-x="3">o</span>t ready.</div>${spk("She isn't ready.")}</div>
            </div>
            <div class="banner" data-b="4">${T('Both are standard. Both are correct.', 'lead')}</div>
          </div>`
      },
      {
        id: '3.3', phase: 'Contract', title: 'Two paths for are not', mus: true, model: ['They are not here.', "They're not here.", "They aren't here."],
        es: 'Con are not también hay dos caminos: They\'re not o They aren\'t. Igual para you y we.',
        async run(c) {
          await c.say('They are not here.'); await c.wait(400);
          c.beat(2); c.fx.pop(2); await c.say("They're not here."); await c.wait(400);
          c.beat(3); c.fx.pop(4); await c.say("They aren't here."); c.beat(4);
        },
        html: () => `${hd({ phase: 'Contract', title: 'Two paths for are not' })}
          <div class="paths">
            <div class="start">${T('They are not here.', 'huge')}</div>
            <div class="two">
              <div class="path a" data-b="2"><div class="lbl">${T('Path 1: are → ’re', 'sm')}</div><div class="line big2">They<span class="gone" data-x="2">&nbsp;a</span><span class="ap" data-b="2">’</span>re not here.</div>${spk("They're not here.")}</div>
              <div class="path b" data-b="3"><div class="lbl">${T('Path 2: not → n’t', 'sm')}</div><div class="line big2">They are<span class="gone" data-x="3">&nbsp;</span>n<span class="ap" data-b="3">’</span><span class="gone" data-x="3">o</span>t here.</div>${spk("They aren't here.")}</div>
            </div>
            <div class="banner" data-b="4">${T('Both are standard. Both are correct.', 'lead')}</div>
          </div>`
      },
      {
        id: '3.4', phase: 'Listen', title: 'The whole system', mus: false, quiet: true, model: ["I'm not.", "He's not.", "He isn't.", "She's not.", "She isn't.", "It's not.", "It isn't.", "You're not.", "You aren't.", "We're not.", "We aren't.", "They're not.", "They aren't."],
        es: 'Aquí está todo el sistema. Escucha cada modelo con su botón. Escribir la apóstrofe y pronunciar son dos habilidades distintas; esta lección no califica la pronunciación.',
        html: () => {
          const rows = [['I', 'I am not', ["I'm not"]], ['You', 'You are not', ["You're not", "You aren't"]], ['He', 'He is not', ["He's not", "He isn't"]], ['She', 'She is not', ["She's not", "She isn't"]], ['It', 'It is not', ["It's not", "It isn't"]], ['We', 'We are not', ["We're not", "We aren't"]], ['They', 'They are not', ["They're not", "They aren't"]]];
          return `${hd({ phase: 'Listen', title: 'The whole system' })}
          <div class="table-flow">${rows.map((r) => `<div class="trow"><div class="full">${T(r[1], 'sm')}${spk(r[1] + '.', 'Replay full form')}</div><div class="arrow">→</div>${r[2].map((s) => `<div class="short">${T(s, 'md')}${spk(s + '.', 'Replay short form')}</div>`).join('')}${r[2].length < 2 ? '<div class="short none"></div>' : ''}</div>`).join('')}</div>
          <div class="two-notes">${note('Both patterns are standard where shown.')}${note('Spelling the apostrophe and saying the sound are two different skills. This lesson does not grade pronunciation.')}${note('Repeat after each model. Then say a fresh sentence.')}</div>`;
        }
      },
      ...CONV.map(convStep)
    ]
  });
})(window.FE = window.FE || {});
