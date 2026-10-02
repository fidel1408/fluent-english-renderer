/* CONTENT 3 — Sections 7–9 */
(function (FE) {
  'use strict';
  const { T, hd, meaning, ans, fact, note, frames, spk, tag, typed, esc } = FE.ui;

  /* ============ 7. SPEAKING LAB ============ */
  const SETS = [
    { desc: 'a yellow chair, a blue bag, one phone and one gold book', A: ["The chair isn't blue.", "The bag isn't yellow.", "The chair isn't red."], Bf: 'The bag is red.', Bm: "The bag isn't red. It's blue.", Bd: ['The chair is yellow.', 'There is one phone.'], X: ['The chair isn\'t blue, but it\'s yellow.', "The bag isn't red, but it's blue."], tags: [['chair', 14, 40], ['bag', 36, 93], ['phone', 70, 36]] },
    { desc: 'a red chair, a green bag and two books', A: ["The chair isn't green.", "The bag isn't red.", "The books aren't on the chair."], Bf: 'The chair is green.', Bm: "The chair isn't green. It's red.", Bd: ['The bag is green.', 'The books are on the table.'], X: ["The chair isn't green, but it's red.", "The bag isn't red, but it's green."], tags: [['chair', 14, 40], ['bag', 36, 93], ['books', 70, 36]] },
    { desc: 'a blue chair, a red bag, one phone and one gold book', A: ["The chair isn't red.", "The bag isn't blue.", "The chair isn't yellow."], Bf: 'The chair is yellow.', Bm: "The chair isn't yellow. It's blue.", Bd: ['The bag is red.', 'There is one phone.'], X: ["The chair isn't yellow, but it's blue.", "The bag isn't blue, but it's red."], tags: [['chair', 14, 40], ['bag', 36, 93], ['phone', 70, 36]] }
  ];
  FE.SETS = SETS;
  const objScene = (S) => { const k = S.lab.pic % 3; return `<div class="scene det">${FE.objectSet(k)}${SETS[k].tags.map((t) => tag(t[0], t[1], t[2])).join('')}</div>`; };

  const labbar = (S, round) => `<div class="labbar" role="group" aria-label="Lab controls">
      <button class="tog ${S.support ? 'on' : ''}" data-act="support" aria-pressed="${!!S.support}">Support: ${S.support ? 'On' : 'Off'}</button>
      <button class="tog ${S.lab.extra ? 'on' : ''}" data-act="extra" aria-pressed="${!!S.lab.extra}">Extra Challenge: ${S.lab.extra ? 'On' : 'Off'}</button>
      ${round !== 'C' ? '<button class="btn ghost" data-act="newpic">New picture</button>' : ''}
      <button class="btn" data-act="turn">Next turn · Turn ${S.lab.turn}</button>
    </div>`;
  const parts = (S) => {
    const rows = [];
    for (let n = 1; n <= S.parts.n; n++) {
      const r = S.parts.rows[n] || {};
      rows.push(`<tr><th scope="row">${n}</th>${['A', 'B', 'C'].map((k) => `<td><input type="checkbox" data-act="ptog" data-n="${n}" data-r="${k}" aria-label="Learner ${n}, round ${k}" ${r[k] ? 'checked' : ''}></td>`).join('')}</tr>`);
    }
    return `<details class="parts"><summary>Participation checklist (local, anonymous)</summary>
      <table><thead><tr><th>#</th><th>A</th><th>B</th><th>C</th></tr></thead><tbody>${rows.join('')}</tbody></table>
      <div class="row"><button class="btn ghost" data-act="padd">+ Learner</button><button class="btn ghost" data-act="prem">− Learner</button></div>
      <p class="small">This stays on this device. It is not connected to call audio. The app does not hear or score students.</p></details>`;
  };

  FE.defSection({
    id: 7, title: 'Speaking Lab: What Isn’t True?', secs: 420, start: '42:00', end: '49:00', steps: [
      {
        id: '7.1', phase: 'Plan', title: 'How the lab works', mus: true,
        say: ['Three rounds. Less help each time.'],
        es: 'Tres rondas con cada vez menos ayuda. El maestro controla los turnos. Puedes activar o quitar el apoyo (Support) y pedir un reto extra.',
        html: (c) => `${hd({ phase: 'Plan', title: 'How the lab works' })}
          <div class="lab-plan">
            <div class="rd"><b>A</b>${T('Say two things the picture is not.', 'md')}</div>
            <div class="rd"><b>B</b>${T('Correct a false statement. Add one true detail.', 'md')}</div>
            <div class="rd"><b>C</b>${T('Make your own negative sentence. Ask another learner a question with be.', 'md')}</div>
          </div>
          ${labbar(c.S, '')}
          ${note('The teacher manages turns. Learners speak as themselves. No roles are needed.')}
          ${parts(c.S)}`
      },
      {
        id: '7.2', phase: 'Round A', title: 'What is the picture not?', mus: false, quiet: true, enter: (c) => c.setSupport(true),
        say: ['Say two things the picture is not.'],
        es: 'Ronda A: describe dos cosas que el dibujo NO es. Ejemplo: "The chair isn\'t blue." Los datos verdaderos vienen del dibujo.',
        html: (c) => { const k = c.S.lab.pic % 3, s = SETS[k]; return `${hd({ phase: 'Round A', title: 'What is the picture not?' })}
          <div class="split"><div>${objScene(c.S)}</div>
          <div class="side">${T('Say two things the picture is not.', 'lead')}
            ${frames(["The ___ isn't ___.", "The ___ aren't ___."])}
            ${c.S.lab.extra ? `<div class="extra">${T('Extra Challenge: add a contrast. Say what it is: The chair isn’t blue, but it’s yellow.', 'sm')}</div>` : ''}
            ${ans(`<div class="small-title">${T('Examples that are true for this picture', 'sm')}</div>${s.A.map((x) => `<div class="model">${T(x, 'md')}${spk(x)}</div>`).join('')}
              ${c.S.lab.extra ? s.X.map((x) => `<div class="model">${T(x, 'md')}${spk(x)}</div>`).join('') : ''}${note('Picture: ' + s.desc + '.')}`)}
            ${labbar(c.S, 'A')}
          </div></div>${parts(c.S)}`; }
      },
      {
        id: '7.3', phase: 'Round B', title: 'Correct it and add a detail', mus: false, quiet: true, enter: (c) => c.setSupport(true),
        say: ['Correct the false statement. Add one true detail.'],
        es: 'Ronda B: corrige la frase falsa y añade un detalle verdadero que se vea en el dibujo.',
        html: (c) => { const k = c.S.lab.pic % 3, s = SETS[k]; return `${hd({ phase: 'Round B', title: 'Correct it and add a detail' })}
          <div class="split"><div>${objScene(c.S)}</div>
          <div class="side"><div class="stmt">${T(s.Bf, 'big')}${spk(s.Bf, 'Replay statement')}</div>
            ${T('It does not match the picture. Correct it. Add one true detail.', 'lead')}
            ${frames(["The ___ isn't ___. It's ___.", 'Also, ___.'])}
            ${c.S.lab.extra ? `<div class="extra">${T('Extra Challenge: add one more contrast with but.', 'sm')}</div>` : ''}
            ${ans(`<div class="model">${T(s.Bm, 'big')}${spk(s.Bm)}</div><div class="small-title">${T('True details you can add', 'sm')}</div>${s.Bd.map((x) => `<div class="model">${T(x, 'md')}${spk(x)}</div>`).join('')}${note('Picture: ' + s.desc + '.')}`)}
            ${labbar(c.S, 'B')}
          </div></div>${parts(c.S)}`; }
      },
      {
        id: '7.4', phase: 'Round C', title: 'Your sentence, your question', mus: false, quiet: true, enter: (c) => c.setSupport(false),
        say: ['Make your own negative sentence. Then ask a question.'],
        es: 'Ronda C: di una oración negativa propia (real o inventada) y hazle una pregunta con be a otro compañero. Ejemplo: "I\'m not a pilot. Are you a pilot?"',
        html: (c) => `${hd({ phase: 'Round C', title: 'Your sentence, your question' })}
          <div class="lab-c">
            ${T('Say one negative sentence about you. It can be real or invented. Then ask another learner a simple question with be.', 'lead')}
            ${frames(["I'm not ___.", 'Are you ___?'])}
            ${c.S.lab.extra ? `<div class="extra">${T('Extra Challenge: add a contrast. I’m not tired, but I’m hungry.', 'sm')}</div>` : ''}
            ${ans(`<div class="model">${T("I'm not a pilot.", 'big')}${spk("I'm not a pilot.")}</div><div class="model">${T('Are you a pilot?', 'big')}${spk('Are you a pilot?')}</div>${c.S.lab.extra ? `<div class="model">${T("I'm not late, but I'm not ready.", 'md')}${spk("I'm not late, but I'm not ready.")}</div>` : ''}${note('Another learner answers with a short answer: No, I’m not. or Yes, I am.')}`)}
            ${labbar(c.S, 'C')}
          </div>${parts(c.S)}`
      }
    ]
  });

  /* ============ 8. TEN-QUESTION CHECK ============ */
  const Q = [
    { n: 1, inst: 'Complete with a full negative form.', stem: 'I ___ tired.', opts: ['is not', 'am not', 'are not', 'not am'], a: 1, why: 'I goes with am. Not comes after am: I am not tired.', say: 'I am not tired.' },
    { n: 2, inst: 'Complete with a full negative form.', stem: 'She ___ a doctor.', opts: ['am not', 'are not', 'is not', 'do not'], a: 2, why: 'She goes with is: She is not a doctor.', say: 'She is not a doctor.' },
    { n: 3, inst: 'Complete with a full negative form.', stem: 'They ___ at home.', opts: ['are not', 'is not', 'am not', 'does not'], a: 0, why: 'They goes with are: They are not at home.', say: 'They are not at home.' },
    { n: 4, inst: 'Choose the standard contraction.', stem: 'I am not ready.', opts: ["I isn't ready.", "I aren't ready.", 'I not am ready.', "I'm not ready."], a: 3, why: 'The apostrophe replaces the letter a in am: I’m not ready.', say: "I'm not ready." },
    { n: 5, inst: 'Choose the version that contracts is + not.', stem: 'He is not here.', opts: ["He aren't here.", "He isn't here.", 'He not is here.', 'He am not here.'], a: 1, why: 'Is + not becomes isn’t. (He’s not here is also standard, but this question asks for is + not.)', say: "He isn't here." },
    { n: 6, inst: 'Choose the version that contracts are + not.', stem: 'We are not late.', opts: ["We aren't late.", "We isn't late.", 'We not are late.', 'We am not late.'], a: 0, why: 'Are + not becomes aren’t. (We’re not late is also standard, but this question asks for are + not.)', say: "We aren't late." },
    { n: 7, inst: 'Repair the sentence: She not is tired.', stem: 'Choose the correct sentence.', opts: ['She is tired not.', 'She are not tired.', 'She is not tired.', 'She does not tired.'], a: 2, why: 'Not comes after is: She is not tired.', say: 'She is not tired.' },
    { n: 8, inst: 'The person answering is a teacher. Choose the negative short answer.', stem: 'Are you a doctor?', fact: 'The person answering is a teacher.', opts: ['No, I not am.', "No, I isn't.", 'Yes, I am.', "No, I'm not."], a: 3, why: 'The person is a teacher, so the answer is no. For I, use I’m not.', say: "No, I'm not." },
    { n: 9, inst: 'The bag is blue. Complete with a full negative form.', stem: 'It ___ red.', scene: 1, opts: ['are not', 'is not', 'am not', 'not is'], a: 1, why: 'The bag is blue, so it is not red. It goes with is.', say: 'It is not red.' },
    { n: 10, inst: 'The two books are on the desk. Correct the sentence: The books are on the chair.', stem: 'Choose the correct statement.', scene: 3, opts: ["The books aren't on the chair.", "The books isn't on the chair.", "The books aren't on the desk.", 'The books not are on the chair.'], a: 0, why: 'Books is plural, so use aren’t. The books are on the desk, so on the chair is false.', say: "The books aren't on the chair." }
  ];
  FE.QUIZ = Q;
  const L = ['A', 'B', 'C', 'D'];
  FE.quizLetter = (n) => L[Q[n - 1].a];

  const quizState = (S) => S.quiz;
  const firstScore = (S) => Q.reduce((t, q) => t + (S.quiz.answers[q.n] === L[q.a] ? 1 : 0), 0);
  const missed = (S) => Q.filter((q) => S.quiz.answers[q.n] !== L[q.a]).map((q) => q.n);
  FE.quizScores = (S) => {
    const qz = S.quiz, first = qz.submitted ? firstScore(S) : null, miss = qz.submitted ? missed(S) : [];
    const retry = qz.retrySubmitted ? miss.filter((n) => qz.ra[n] === L[Q[n - 1].a]).length : null;
    return { first, total: Q.length, retry, retryTotal: qz.retrySubmitted ? miss.length : null, missed: miss };
  };
  const scoreLabel = (S) => S.quiz.mode === 'shared' ? 'Class activity score' : 'Individual score (this device)';

  const qStep = (q) => ({
    id: '8.' + (q.n + 1), phase: 'Question ' + q.n, title: 'Question ' + q.n + ' of 10', mus: false, quiet: true, noAuto: true, model: q.say,
    es: 'Elige A, B, C o D. Las respuestas permanecen ocultas hasta enviar todo. Puedes escuchar la pregunta con el botón.',
    html: (c) => {
      const S = c.S, qz = S.quiz;
      const retryActive = qz.retry && qz.submitted && !qz.retrySubmitted && missed(S).includes(q.n);
      const locked = qz.submitted && !retryActive;
      const chosen = retryActive ? qz.ra[q.n] : qz.answers[q.n];
      const wasMissed = qz.submitted && qz.answers[q.n] !== L[q.a];
      const showResult = qz.submitted && (!qz.retry || !missed(S).includes(q.n) || qz.retrySubmitted);
      const dots = Q.map((x) => { const a = qz.answers[x.n]; const done = qz.submitted ? (a === L[x.a] ? 'ok' : 'no') : (a ? 'on' : ''); return `<span class="dot ${done} ${x.n === q.n ? 'cur' : ''}" aria-label="Question ${x.n}${a ? ' answered' : ''}"></span>`; }).join('');
      const pic = q.scene ? `<div class="fig small">${FE.detectiveScene(q.scene)}</div>` : '';
      const fct = q.fact ? fact('id', 'Fact', q.fact) : '';
      let note2 = '';
      if (showResult) {
        const ok = (retryActive ? false : true) && qz.answers[q.n] === L[q.a];
        note2 = `<div class="explain-box ${wasMissed ? 'miss' : 'hit'}"><b>${wasMissed ? (qz.retrySubmitted ? (qz.ra[q.n] === L[q.a] ? 'Retry: correct' : 'Retry: not yet') : 'Not this time') : 'Correct'}</b> <span class="ansL">Answer ${L[q.a]}</span> ${T(q.opts[q.a])}${T(q.why, 'sm')}<button class="btn ghost" data-act="say" data-say="${esc(q.say)}">Say it aloud</button><button class="btn ghost" data-act="sayext" data-say="${esc(q.say)}">Spoken extension</button></div>`;
      } else if (retryActive) {
        note2 = `<div class="explain-box"><b>Retry</b> ${T('Choose again. This item was missed on the first attempt.', 'sm')}</div>`;
      } else if (qz.submitted && qz.retry && !missed(S).includes(q.n)) {
        note2 = `<div class="explain-box hit"><b>Correct on the first attempt</b> ${T('Nothing to retry here.', 'sm')}</div>`;
      }
      const opts = q.opts.map((o, i) => {
        const l = L[i];
        let cls = chosen === l ? 'sel' : '';
        if (showResult) { if (i === q.a) cls += ' right'; else if (qz.answers[q.n] === l) cls += ' wrong'; }
        return `<button class="opt ${cls}" data-act="choose" data-l="${l}" role="radio" aria-checked="${chosen === l}" ${locked ? 'disabled' : ''}><span class="L">${l}</span>${T(o, 'md')}</button>`;
      }).join('');
      const submitBtn = qz.submitted
        ? (retryActive || (qz.retry && !qz.retrySubmitted) ? '<button class="btn" data-act="submit-retry">Submit retry</button>' : '<button class="btn ghost" data-act="goresults">See results</button>')
        : '<button class="btn" data-act="submit">Submit answers</button>';
      return `${hd({ phase: 'Question ' + q.n, title: 'Question ' + q.n + ' of 10' })}
        <div class="quiz">
          <div class="dots" role="img" aria-label="Progress">${dots}</div>
          <div class="qwrap">
            <div class="inst">${T(q.inst, 'sm')}</div>
            <div class="stem">${T(q.stem, 'huge')}<button class="spk" data-act="sayq" aria-label="Listen to the question">${FE.ui.speaker}</button></div>
            ${pic}${fct}
            <div class="opts" role="radiogroup" aria-label="Answer choices">${opts}</div>
            ${note2}
            <div class="row">${submitBtn}<span class="count">${qz.submitted ? '' : Object.keys(qz.answers).length + ' of 10 answered'}</span></div>
          </div>
        </div>`;
    },
    acts: {
      choose: (c, el) => {
        const qz = c.S.quiz;
        if (!Object.keys(qz.answers).length && !qz.submitted) qz.locked = true;
        const retryActive = qz.retry && qz.submitted && !qz.retrySubmitted && missed(c.S).includes(q.n);
        if (qz.submitted && !retryActive) return;
        (retryActive ? qz.ra : qz.answers)[q.n] = el.dataset.l; c.fx.tick(); c.save(); c.rerender();
      },
      sayq: (c) => c.say(q.stem.replace('___', 'blank'), {}),
      sayext: async (c) => { await c.say(q.say); await c.wait(500); await c.say('Now you say it.'); }
    }
  });

  FE.defSection({
    id: 8, title: 'Ten-Question Check', secs: 420, start: '49:00', end: '56:00', steps: [
      {
        id: '8.1', phase: 'Check', title: 'Ten-question check', mus: false, quiet: true, noAuto: true,
        es: 'Diez preguntas de opción múltiple (A–D), un punto cada una. Elige el modo: clase compartida (el maestro ingresa la respuesta de la clase) o individual (tu propia copia).',
        html: (c) => { const qz = c.S.quiz, lockedMode = Object.keys(qz.answers).length > 0 || qz.submitted; return `${hd({ phase: 'Check', title: 'Ten-question check' })}
          <div class="quiz-intro">
            ${T('Ten questions. One point each. Answers stay hidden until you submit.', 'lead')}
            <div class="modes" role="radiogroup" aria-label="Scoring mode">
              <button class="mode ${qz.mode === 'shared' ? 'on' : ''}" role="radio" aria-checked="${qz.mode === 'shared'}" data-act="mode" data-m="shared" ${lockedMode ? 'disabled' : ''}><b>Shared class</b><span>The teacher clicks the answer the class chooses. Result: class activity score.</span></button>
              <button class="mode ${qz.mode === 'individual' ? 'on' : ''}" role="radio" aria-checked="${qz.mode === 'individual'}" data-act="mode" data-m="individual" ${lockedMode ? 'disabled' : ''}><b>Individual</b><span>One person answers on their own copy. Result is saved only on this device.</span></button>
            </div>
            ${lockedMode ? '<p class="small">The mode is locked after the first answer. Use Reset to start over.</p>' : ''}
            ${note('This is a class activity check, not a measure of individual mastery.')}
          </div>`; },
        acts: { mode: (c, el) => { c.S.quiz.mode = el.dataset.m; c.fx.tick(); c.save(); c.rerender(); } }
      },
      ...Q.map(qStep),
      {
        id: '8.12', phase: 'Results', title: 'Check results', mus: false, quiet: true, noAuto: true,
        es: 'Resultados. Puedes reintentar solo las preguntas falladas; el puntaje del primer intento y el del reintento se guardan por separado.',
        html: (c) => {
          const S = c.S, qz = S.quiz;
          if (!qz.submitted) return `${hd({ phase: 'Results', title: 'Check results' })}<div class="quiz-intro">${T('Answers are hidden until you submit all ten.', 'lead')}<div class="row"><button class="btn" data-act="submit">Submit answers</button></div></div>`;
          const sc = FE.quizScores(S);
          const list = Q.map((q) => { const ok = qz.answers[q.n] === L[q.a]; return `<li class="${ok ? 'ok' : 'no'}">${FE.icon(ok ? 'check' : 'cross')}<span>${q.n}. ${T(q.stem.replace('___', '____') , 'sm', { noipa: true })}</span><em>${qz.answers[q.n] || '—'} → ${L[q.a]}</em></li>`; }).join('');
          return `${hd({ phase: 'Results', title: 'Check results' })}
          <div class="results-grid">
            <div class="scorecard"><small>${scoreLabel(S)}</small><div class="big">${sc.first}<span>/10</span></div><small>First attempt</small>
              ${qz.mode === 'shared' ? '<p class="small">Teacher-entered shared answers. This is not individual mastery.</p>' : '<p class="small">Saved only on this device.</p>'}</div>
            <div class="scorecard alt"><small>Retry score</small><div class="big">${sc.retry == null ? '—' : sc.retry}<span>${sc.retryTotal == null ? '' : '/' + sc.retryTotal}</span></div><small>Missed items only</small></div>
            <ul class="reslist">${list}</ul>
          </div>
          <div class="row center">${sc.missed.length && !qz.retry ? '<button class="btn" data-act="retry">Retry missed items</button>' : ''}${qz.retry && !qz.retrySubmitted ? '<button class="btn" data-act="retry">Go to missed items</button>' : ''}${!sc.missed.length ? T('All ten correct on the first attempt. Nothing to retry.', 'lead') : ''}<button class="btn ghost" data-act="openresults">Results & export</button></div>`;
        },
        acts: {
          retry: (c) => { const qz = c.S.quiz; qz.retry = true; const m = missed(c.S)[0]; c.save(); c.goto(7, m); },
          openresults: (c) => c.openResults()
        }
      }
    ]
  });

  /* ============ 9. EXIT & RECAP ============ */
  const EX_BANK = ['Are you a pilot?', 'Are you at the airport?', 'Are you angry?', 'Are you in a taxi?', 'Are you a doctor?', 'Are you at the beach?'];
  const exitTable = (S) => {
    const crit = [['be', 'Be form'], ['not', 'Not placement'], ['con', 'Contraction'], ['ind', 'Independent']];
    const rows = [];
    for (let n = 1; n <= S.exit.n; n++) {
      const r = S.exit.rows[n] || {};
      rows.push(`<tr><th scope="row">${n}</th>${crit.map(([k, l]) => `<td><input type="checkbox" data-act="etog" data-n="${n}" data-k="${k}" aria-label="Learner ${n}: ${l}" ${r[k] ? 'checked' : ''}></td>`).join('')}</tr>`);
    }
    return `<details class="parts" open><summary>Teacher checklist (local, anonymous)</summary>
      <table><thead><tr><th>#</th>${crit.map((c) => `<th>${c[1]}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>
      <div class="row"><button class="btn ghost" data-act="eadd">+ Learner</button><button class="btn ghost" data-act="erem">− Learner</button></div>
      <p class="small">Tick what you hear. The app does not listen or grade speech.</p></details>`;
  };

  FE.defSection({
    id: 9, title: 'Independent Exit and Recap', secs: 240, start: '56:00', end: '60:00', steps: [
      {
        id: '9.1', phase: 'Exit', title: 'Independent exit', mus: false, quiet: true, enter: (c) => c.setSupport(false),
        say: ['Support is hidden. Try it on your own.'],
        es: 'Salida independiente: cada estudiante dice (1) una oración "I\'m not" propia, (2) una oración negativa sobre un dibujo con isn\'t o aren\'t, (3) una respuesta corta negativa. El apoyo está oculto; el maestro puede mostrarlo.',
        html: (c) => { const k = c.S.lab.pic % 3, s = SETS[k], qi = (c.st.qi || 0) % EX_BANK.length; return `${hd({ phase: 'Exit', title: 'Independent exit' })}
          <div class="exit-grid">
            <div class="ecard"><b>1</b>${T('Say one original I’m not sentence.', 'md')}<div class="deco" aria-hidden="true">…</div></div>
            <div class="ecard pic"><b>2</b>${T('Say one negative sentence about the picture. Use isn’t or aren’t.', 'md')}<div class="scene det small">${objScene(c.S).replace('class="scene det"', 'class="scene det"')}</div></div>
            <div class="ecard"><b>3</b>${T('Answer the teacher’s question with a negative short answer.', 'md')}<div class="stmt q">${T(EX_BANK[qi], 'big')}${spk(EX_BANK[qi], 'Replay question')}</div><button class="btn ghost" data-act="exq">New question</button></div>
          </div>
          <div class="row center"><button class="tog ${c.S.support ? 'on' : ''}" data-act="support" aria-pressed="${!!c.S.support}">Support: ${c.S.support ? 'On' : 'Off'}</button><button class="btn ghost" data-act="newpic">New picture</button></div>
          ${frames(["I'm not ___.", "The ___ isn't ___.", "No, I'm not."])}
          ${ans(`<div class="model">${T("I'm not tired.", 'md')}${spk("I'm not tired.")}</div><div class="model">${T(s.A[0], 'md')}${spk(s.A[0])}</div><div class="model">${T("No, I'm not.", 'md')}${spk("No, I'm not.")}</div>${note('Examples only. Learners should say their own sentences.')}`)}
          ${exitTable(c.S)}`; },
        acts: { exq: (c) => { c.st.qi = ((c.st.qi || 0) + 1) % EX_BANK.length; c.rerender(); c.say(EX_BANK[c.st.qi]); } }
      },
      {
        id: '9.2', phase: 'Recap', title: 'Three form families', mus: true, finishFx: true,
        es: '¡Buen trabajo! Resumen: I am not / is not / are not y sus formas cortas.',
        async run(c) {
          for (let i = 1; i <= 3; i++) { c.beat(i); c.fx.pop(i * 2); await c.wait(550); }
          c.beat(4); c.fx.endChord(); await c.say('Great work today.'); await c.wait(300); await c.say('Remember: not comes after be.');
        },
        html: () => `${hd({ phase: 'Recap', title: 'Three form families' })}
          <div class="recap">
            <div class="rfam" data-b="1"><div class="who">${T('I')}</div><div class="full">${T('am not')}</div><div class="shortf">${T("I'm not", 'md')}</div></div>
            <div class="rfam" data-b="2"><div class="who">${T('He / She / It')}</div><div class="full">${T('is not')}</div><div class="shortf">${T("He's not", 'md')}${T("He isn't", 'md')}</div></div>
            <div class="rfam" data-b="3"><div class="who">${T('You / We / They')}</div><div class="full">${T('are not')}</div><div class="shortf">${T("You're not", 'md')}${T("You aren't", 'md')}</div></div>
          </div>
          <div class="complete" data-b="4">${FE.completionArt()}<div class="doneText">${T('Great work today.', 'huge')}${T('Not comes after be.', 'lead')}</div></div>`
      },
      {
        id: '9.3', phase: 'Optional', title: 'After-class practice', mus: false, outside: true,
        es: 'Tarea opcional de 2 minutos para después de la clase. No forma parte de los 60 minutos de la lección.',
        html: (c) => `${hd({ phase: 'Optional', title: 'After-class practice' })}
          <div class="after">
            <div class="badge soft">${T('Optional · about two minutes · outside the 60-minute lesson timer')}</div>
            <ol class="tasks"><li>${T('Write three true sentences with I’m not.')}</li><li>${T('Write two negative sentences about things near you. Use isn’t or aren’t.')}</li><li>${T('Ask yourself: Are you at the beach? Say a short answer.')}</li></ol>
            <div class="row center"><button class="btn" data-act="after-timer">Start 2-minute practice timer</button><span class="aftertime" id="aftertime" aria-live="off">02:00</span></div>
            <div class="row center"><button class="btn ghost" data-act="openresults">Results &amp; export</button></div>
          </div>`,
        acts: {
          'after-timer': (c) => c.afterTimer(),
          openresults: (c) => c.openResults()
        }
      }
    ]
  });
})(window.FE = window.FE || {});
