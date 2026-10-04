/* ===== Activities 8-9 ===== */
const LET = ['A', 'B', 'C', 'D'];
const MCQ_ITEMS = [
  { q: '___ am a student.', ctx: 'Choose the correct word.', opts: ['He', 'I', 'You', 'They'], ok: 1, why: '*I* goes with *am*: I am a student.', sp: 'I goes with am.', ext: 'Say: I am a student. (Or invent a job.)', es: 'I va con am.' },
  { q: 'She ___ happy.', ctx: 'Choose the correct word.', opts: ['am', 'are', 'be', 'is'], ok: 3, why: '*She* goes with *is*: She is happy.', sp: 'She goes with is.', ext: 'Say a sentence about a person in a picture: She is …', es: 'She va con is.' },
  { q: 'We ___ ready.', ctx: 'Choose the correct word.', opts: ['are', 'is', 'am', 'be'], ok: 0, why: '*We* goes with *are*: We are ready.', sp: 'We goes with are.', ext: 'Say: We are ready. Or say: We are in class.', es: 'We va con are.' },
  { q: 'They are friends.', ctx: 'Write the same sentence with the contraction of They are.', opts: ["They’s friends.", 'Their friends.', "They’re friends.", "Theyre friends."], ok: 2, why: '*They are* → *They’re*. The apostrophe replaces the letter *a*.', sp: "They are becomes They're.", ext: "Say a sentence with They’re.", es: 'They are → They’re.' },
  { q: 'I am not tired.', ctx: 'Which is the correct contraction with I?', opts: ["I amn’t tired.", "I’m not tired.", "I isn’t tired.", "I aren’t tired."], ok: 1, why: 'With *I* we say *I’m not*. We do not use *I amn’t*.', sp: "With I, we say I'm not.", ext: 'Say: I’m not … (a safe word: late, at work, hungry).', es: 'Con I: I’m not.' },
  { q: 'He is a teacher.', ctx: 'Make the standard yes/no question: move is before he.', opts: ['Does he a teacher?', 'He is a teacher?', 'Are he a teacher?', 'Is he a teacher?'], ok: 3, why: 'Move *is* before *he*: Is he a teacher? We do not use does with be.', sp: 'Move is before he. Is he a teacher?', ext: 'Ask a partner a question with Is he … ? or Is she … ?', es: 'Mueve is antes de he.' },
  { q: 'Are you ready?', ctx: 'One learner says yes. Which short answer?', opts: ['Yes, I am.', "Yes, I’m.", 'Yes, you are.', 'Yes, we are.'], ok: 0, why: 'One learner answers about *I*. A positive short answer ends with a full form: *Yes, I am.*', sp: 'Yes, I am. We do not end with I’m.', ext: "Ask: Are you ready? Answer: Yes, I am. / No, I’m not.", es: 'Yes, I am. (no Yes, I’m).' },
  { q: 'Is Maya a teacher?', ctx: 'Story fact: Maya has one job. She is a doctor. Which short answer?', opts: ['Yes, she is.', "Yes, she’s.", "No, she isn’t.", "No, they aren’t."], ok: 2, why: 'The picture says Maya is a doctor, so the answer is *No, she isn’t.*', sp: "The picture shows a doctor. No, she isn't.", ext: "Say: No, she isn’t. She’s a doctor.", scene: true, es: 'Maya es doctora: No, she isn’t.' },
  { q: 'My phone ___ new.', ctx: 'Choose the correct word.', opts: ['are', 'is', 'am', 'be'], ok: 1, why: '*My phone* is one thing: *it*. Use *is*.', sp: 'My phone is one thing, like it. Use is.', ext: 'Say: My phone is … (new, old, small).', es: 'My phone = it → is.' },
  { q: 'Alex and I are students.', ctx: 'Replace the subject with a pronoun.', opts: ['They are students.', 'You are students.', 'I am students.', 'We are students.'], ok: 3, why: 'Alex and I includes the speaker: *we*. We are students.', sp: 'Alex and I includes the speaker. We are students.', ext: "Say: Alex and I are … Then say: We are …", es: 'Alex y yo = we.' },
];
const modeLabel = () => (S.mode === 'shared' ? 'Class activity: enter the class’s answer' : 'Individual mode — own copy on this device');
function firstMissed(rec) { for (let i = 0; i < 10; i++) { const a = rec.first[i]; if (a && !a.ok && !rec.retry[i]) return i; } return -1; }

function mcqBeat(i) {
  const it = MCQ_ITEMS[i];
  return {
    inv: { kind: 'mcq', id: 'Q' + (i + 1), prompt: it.q, context: it.ctx, options: it.opts.map((o, k) => LET[k] + '. ' + o), answerKey: LET[it.ok] + '. ' + it.opts[it.ok], explanation: it.why, speakingExtension: it.ext },
    title: `Question ${i + 1} of 10`, talk: 27, quiet: true, es: `Pregunta ${i + 1} de 10. ${it.es} Las respuestas permanecen ocultas hasta que envíes la respuesta de la clase.`,
    make: () => {
      const scenePart = it.scene ? SC({ alt: 'Maya wears a white coat and stethoscope. The picture says she is a doctor.', ppl: [['maya', 480, { s: 1, job: 'doctor', poseR: 'hip' }]], tags: [TG('Maya', 'she/her · a doctor (her only job)', 480, 505, '', 'she')] }) : '';
      const html = `${it.scene ? `<div class="cols narrow-left"><div>${scenePart}</div><div id="mq-body" class="stack"></div></div>` : '<div id="mq-body" class="stack" style="max-width:58rem;width:100%;align-self:center"></div>'}`;
      const bind = (A) => {
        let sel = null, nextOkAt = 0;   // nextOkAt: ignore a double-click that lands on 'Next' right after Submit
        const body = $('#mq-body', A.root);
        const state = () => { const rec = S.mcq[S.mode], retryMode = S.retry.active && S.retry.mode === S.mode && rec.first[i] && !rec.first[i].ok; return { rec, retryMode, done: retryMode ? rec.retry[i] : rec.first[i] }; };
        const draw = () => {
          const { retryMode, done } = state();
          body.innerHTML = `<div class="row"><span class="pill">${tx(`Question ${i + 1} of 10`)}</span><span class="pill ${S.mode === 'shared' ? 'violet' : 'gold'}">${tx(modeLabel())}</span>${retryMode ? `<span class="pill coral">${tx('Retry round')}</span>` : ''}</div>
            <div class="card"><div class="big-sentence">${tx(it.q)}</div><div class="instr" style="margin-top:.4rem">${tx(it.ctx)}</div></div>
            ${it.opts.map((o, k) => { let c = 'opt'; if (done) c += k === it.ok ? ' right' : (LET[k] === done.c ? ' wrong' : ' dim'); return `<button class="${c}" data-k="${k}" aria-pressed="${sel === k}" ${done ? 'disabled' : ''}><span class="L">${LET[k]}</span><span>${tx(o)}</span></button>`; }).join('')}
            ${done ? '' : `<div class="row"><button class="btn" id="mq-sub" ${sel === null ? 'disabled' : ''}>Submit answer</button><button class="btn alt sm" id="mq-skip">Skip question</button></div><div class="small-note">${tx('The answer stays hidden until you submit.')}</div>`}
            ${done ? `<div class="ans-box ${done.ok ? '' : 'bad'}" style="display:block"><div class="mid-sentence"><b>${tx((done.skipped ? 'Skipped' : done.ok ? 'Correct ✓' : 'Not this time') + ' — answer ' + LET[it.ok] + ': ' + it.opts[it.ok])}</b></div><div class="meaning" style="margin-top:.4rem">${tx(it.why)}</div><div class="mid-sentence" style="margin-top:.5rem"><span class="pill violet">${tx('Speaking extension')}</span> ${tx(it.ext)}</div></div>
              <div class="row"><button class="btn gold" id="mq-next">${retryMode ? 'Next missed question ▸' : i < 9 ? 'Next question ▸' : 'See results ▸'}</button></div>` : ''}`;
          $$('.opt', body).forEach((b) => b.addEventListener('click', () => { if (done) return; sel = +b.dataset.k; Sound.sfx('click'); draw(); }));
          const sub = $('#mq-sub', body); if (sub) sub.onclick = () => submit(false);
          const sk = $('#mq-skip', body); if (sk) sk.onclick = () => submit(true);
          const nx = $('#mq-next', body); if (nx) nx.onclick = () => { if (Date.now() < nextOkAt) return; const { rec, retryMode: rm } = state(); if (rm) { const nm = firstMissed(rec); if (nm >= 0) { enter(7, nm); return; } enter(7, 10); return; } next(); };
        };
        const submit = (skip) => {
          if (state().done) return;   // already answered: ignore repeated Submit/Skip clicks
          nextOkAt = Date.now() + 500;
          const { rec, retryMode } = state(); const ok = !skip && sel === it.ok;
          const r = { c: skip ? '-' : LET[sel], ok, skipped: !!skip };
          (retryMode ? rec.retry : rec.first)[i] = r; save();
          logAnswer({ qid: 'Q' + (i + 1), prompt: `${it.q} ${it.ctx}`, options: it.opts, selected: skip ? null : sel, correct: it.ok, attempt: attemptCount('Q' + (i + 1), S.mode) + 1, attemptType: retryMode ? `retry-${S.retryRound || 1}` : 'first', ok, skipped: !!skip });
          Sound.sfx(ok ? 'correct' : 'gentle'); draw();
          A.sayBg([{ t: skip ? 'Skipped.' : ok ? 'Correct.' : 'Not this time.', pause: 250 }, { t: `The answer is ${LET[it.ok]}. ${it.sp}`, pause: 350 }, { t: 'Speaking extension. ' + it.ext.replace(/\s*…\s*/g, ' blank ') }]);
          showRibbon(A, 'Speaking extension: ' + it.ext);
        };
        A.onReveal = () => { toast(state().done ? 'The answer and explanation are already showing.' : 'Submit an answer first — answers stay hidden until the class chooses.'); return false; };
        draw();
        const d = state().done; if (d) setTimeout(() => showRibbon(A, 'Speaking extension: ' + it.ext), 200);
      };
      return { html, bind };
    },
    seq: [{ t: i === 0 ? 'Ten questions. Choose the best answer. The class decides together.' : `Question ${i + 1}.` }],
  };
}
const resultsBeat = {
  title: 'Check results', talk: 0, quiet: true, es: 'Resultados: puntuación del primer intento y del reintento por separado. En pantalla compartida es la "puntuación de actividad de la clase", no el dominio individual.',
  make: () => {
    const rec = S.mcq[S.mode], sc = Comp.mcq.score(rec), answered = Object.keys(rec.first).length;
    const label = S.mode === 'shared' ? 'Class activity score' : 'Individual score';
    const missed = MCQ_ITEMS.map((q, i) => i).filter((i) => rec.first[i] && !rec.first[i].ok);
    const unans = MCQ_ITEMS.map((q, i) => i).filter((i) => !rec.first[i]);
    const html = `<div class="cols even"><div class="stack"><div class="card" style="border:3px solid var(--violet)"><span class="pill violet">${tx(label)}</span>
      <table class="t" style="margin-top:.5rem"><tr><th>${tx('Attempt')}</th><th>${tx('Score')}</th></tr><tr><td><b>${tx('First attempt')}</b></td><td><b>${sc.first} / 10</b> ${tx(`(${answered} answered)`)}</td></tr><tr><td>${tx('Retry (missed questions)')}</td><td>${sc.retryOk} / ${sc.missed}</td></tr><tr><td>${tx('After retry')}</td><td>${sc.after} / 10</td></tr></table>
      <div class="small-note" style="margin-top:.4rem">${tx(S.mode === 'shared' ? 'These are the answers the teacher entered for the whole class. They are a class activity score, not individual mastery.' : 'Individual mode: this score belongs to one person using their own copy on this device.')}</div></div>
      <div class="row"><button class="btn alt" id="rs-mode">${S.mode === 'shared' ? 'Switch to individual mode (own copy)' : 'Switch to shared class mode'}</button><button class="btn" id="rs-open">Open results summary / download</button></div>
      ${unans.length ? `<div class="meaning">${tx('Not answered yet: ' + unans.map((x) => x + 1).join(', ') + '.')}</div>` : ''}
      <div class="row">${missed.length ? `<button class="btn gold" id="rs-retry">${S.retry.active ? 'Continue retry' : 'Retry missed questions'} (${missed.length})</button>` : ''}</div></div>
      <div class="stack"><div class="card"><b class="pill">${tx('Review')}</b>${MCQ_ITEMS.map((q, i) => { const a = rec.first[i], r = rec.retry[i]; return `<div style="display:flex;gap:.5rem;align-items:flex-start;margin:.35rem 0"><span class="pill ${!a ? '' : a.ok ? 'green' : 'coral'}">${i + 1}</span><div class="small-note"><b>${tx(!a ? 'not answered' : a.ok ? 'correct' : 'missed')}</b>${a && !a.ok ? ` — answer ${LET[q.ok]}: ${esc(q.opts[q.ok].replace(/’/g, "'"))}${r ? (r.ok ? ' · retry ✓' : ' · retry ✗') : ''}` : ''}${a && !a.ok ? `<div>${tx(q.why)}</div>` : ''}</div></div>`; }).join('')}</div></div></div>`;
    const bind = (A) => {
      $('#rs-open', A.root).onclick = openResults;
      $('#rs-mode', A.root).onclick = () => { S.mode = S.mode === 'shared' ? 'individual' : 'shared'; save(); enter(7, 10, { noIntro: true, tr: false }); };
      const rt = $('#rs-retry', A.root);
      if (rt) rt.onclick = () => { const r = S.mcq[S.mode]; if (!S.retry.active) { r.retry = {}; S.retryRound = (S.retryRound || 0) + 1; } S.retry = { active: true, mode: S.mode }; save(); const nm = firstMissed(r); if (nm >= 0) enter(7, nm, { noIntro: true }); else toast('All missed questions have been retried.'); };
      if (S.retry.active && S.retry.mode === S.mode && missed.length && firstMissed(rec) < 0) { S.retry.active = false; save(); }
    };
    return { html, bind };
  },
  seq: [{ t: 'Here are the results. First attempt and retry are kept separate.' }],
};
ACTS.push({
  n: 8, title: 'Ten-Question Check', spoken: 'Ten-question check',
  es: 'Evaluación de 10 preguntas (A–D). Una opción correcta por pregunta. Las respuestas se muestran después de enviar. En pantalla compartida, el resultado es la "puntuación de actividad de la clase".',
  beats: [...MCQ_ITEMS.map((q, i) => mcqBeat(i)), resultsBeat],
});

/* ================= ACTIVITY 9 ================= */
const exitScene = () => SC({ alt: 'Alex, Maya, Daniel and Sofia smile.', bg: 'class', ppl: [['alex', 150, { expr: 'smile' }], ['maya', 330, { expr: 'happy' }], ['daniel', 580, {}], ['sofia', 780, { expr: 'happy' }]], tags: [NT('alex', 150), NT('maya', 330), NT('daniel', 580), NT('sofia', 780)] });
const exitTask = (n, title, instr, examples, es, extraSay) => promptBeat({ title, sub: `${n} of 4`, talk: 45, quiet: true, es, scene: exitScene, instr, sentence: examples.join(' / '), why: 'These are examples only. Your own sentence is just as good.', say: [{ t: extraSay }], ansSay: [examples[0]], turn: 'Speak with little help.' });

ACTS.push({
  n: 9, title: 'Exit Speaking and Recap', spoken: 'Exit speaking and recap',
  es: 'Cierre: cuatro producciones con poca ayuda (afirmativa, negativa, pregunta, respuesta corta) y un repaso visual.',
  beats: [
    { title: 'Exit speaking: four sentences', talk: 0, quiet: true, es: 'Vas a producir cuatro cosas con poca ayuda: una frase afirmativa, una negativa, una pregunta con be y una respuesta corta. Puedes hablar de las imágenes o inventar.',
      render: () => `<div class="cols even" style="grid-template-columns:repeat(4,1fr)">${[['1', 'An affirmative sentence', 'coral'], ['2', 'A negative sentence', 'teal'], ['3', 'A question with be', 'violet'], ['4', 'A short answer', 'gold']].map(([n, t, c]) => `<div class="card fadein" id="ex${n}"><span class="pill ${c === 'teal' ? '' : c}">${n}</span><div class="mid-sentence" style="margin-top:.4rem">${tx(t)}</div></div>`).join('')}</div>
        ${exitScene()}<div class="meaning">${tx('Talk about the pictures, about you, or use invented details.')}</div>`,
      seq: [{ t: 'Four short tasks. Use the pictures, your own life, or invented details.' }, ...[1, 2, 3, 4].map((n) => ({ pre: (A) => { A.on('ex' + n); A.sfx('pop'); }, wait: 450 }))] },
    exitTask(1, 'Exit task: affirmative', 'Say one affirmative sentence with am, is, or are.', ['She is happy.', "He's a teacher.", 'We are in class.'], 'Tarea 1: una frase afirmativa con am, is o are.', 'Say one affirmative sentence.'),
    exitTask(2, 'Exit task: negative', 'Say one negative sentence with be.', ["He isn't tired.", "I'm not late.", "They aren't students."], 'Tarea 2: una frase negativa con be.', 'Say one negative sentence.'),
    exitTask(3, 'Exit task: question', 'Ask one question with be.', ['Is she a doctor?', 'Are you ready?', 'Are they friends?'], 'Tarea 3: una pregunta con be (no uses do/does).', 'Ask one question with be.'),
    exitTask(4, 'Exit task: short answer', 'Answer a question with a short answer.', ['Yes, I am.', "No, she isn't.", 'Yes, they are.'], 'Tarea 4: una respuesta corta apropiada (Yes, I am. / No, she isn’t.).', 'A partner asks a question. Give a short answer.'),
    { title: 'Teacher checklist', talk: 0, quiet: true, es: 'Lista opcional para el profesor: elección del sujeto, concordancia de be, orden de palabras y producción independiente. No hay puntuación automática de pronunciación.',
      render: () => `<div class="meaning">${tx('Optional. Use anonymous labels. This is your observation — the lesson does not score speech.')}</div><div id="chk-ex"></div>`,
      seq: [{ t: 'Optional teacher checklist.' }], bind: (A) => renderChecklist('exit', $('#chk-ex', A.root)) },
    { title: 'Recap', talk: 15, es: 'Repaso: 1) pronombre + be, 2) contracciones, 3) negativos, 4) preguntas, 5) respuestas cortas.',
      render: () => `<div class="cols even" style="grid-template-columns:repeat(5,1fr);align-items:stretch">${[
        ['1', 'Pronoun + be', ['I am', 'he is', 'they are'], 'coral'], ['2', 'Contractions', ["I'm", "he's", "they're"], 'teal'], ['3', 'Negatives', ["He isn't.", "I'm not."], 'violet'], ['4', 'Questions', ['Is he …?', 'Are you …?'], 'gold'], ['5', 'Short answers', ['Yes, I am.', "No, he isn't."], 'coral'],
      ].map(([n, t, ex, c], i) => `<div class="card fadein" id="rc${i}" style="border-top:6px solid var(--${c === 'teal' ? 'teal-600' : c === 'gold' ? 'gold' : c === 'violet' ? 'violet' : 'coral'})"><span class="pill ${c === 'teal' ? '' : c}">${n}</span><h3 style="margin-top:.4rem">${tx(t)}</h3>${ex.map((e) => `<div class="mid-sentence">${tx(e, { be: 1 })}</div>`).join('')}</div>`).join('')}</div>${exitScene()}`,
      seq: [{ t: 'Our recap.' }, { pre: (A) => { A.on('rc0'); A.sfx('join'); }, t: 'Pronoun plus be. I am. He is. They are.' }, { pre: (A) => { A.on('rc1'); A.sfx('join'); }, t: "Contractions. I'm. He's. They're." }, { pre: (A) => { A.on('rc2'); A.sfx('join'); }, t: "Negatives. He isn't. I'm not." }, { pre: (A) => { A.on('rc3'); A.sfx('join'); }, t: 'Questions. Is he? Are you?' }, { pre: (A) => { A.on('rc4'); A.sfx('join'); }, t: "Short answers. Yes, I am. No, he isn't." }] },
    { title: 'Great practice today', talk: 15, es: 'Mensaje final: cada frase que dices es práctica. Tarea opcional de 2 minutos para después de la clase (no incluida en los 60 minutos).',
      render: () => `<div class="cols even"><div class="stack"><div class="card teal"><h3>${tx('Every sentence you say is practice.')}</h3><div class="big-sentence" style="color:var(--cream)">${tx('Keep going, one sentence at a time.')}</div></div>
        <div class="card"><span class="pill gold">${tx('Optional · after class · about 2 minutes')}</span><div class="mid-sentence" style="margin-top:.4rem">${tx('Say three sentences about people or things near you: one with am, is, or are; one negative; one question with a short answer.')}</div><div class="small-note">${tx('This is not part of the 60-minute lesson timer.')}</div></div>
        <div class="row"><button class="btn gold" id="fin-res">Open results summary</button></div></div>${SC({ alt: 'Four adults wave goodbye warmly.', ppl: [['alex', 170, { expr: 'happy' }], ['maya', 350, { expr: 'happy' }], ['daniel', 580, { expr: 'happy' }], ['sofia', 780, { expr: 'happy' }]], tags: [NT('alex', 170), NT('maya', 350), NT('daniel', 580), NT('sofia', 780)] })}</div>`,
      play: async (A) => { Sound.ending(); await A.say([{ t: 'Great practice today.', pause: 500 }, { t: 'Every sentence you say is practice. Keep going, one sentence at a time.' }]); },
      bind: (A) => { $('#fin-res', A.root).onclick = openResults; } },
  ],
});
