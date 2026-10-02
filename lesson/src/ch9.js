/* ============================================================
   SECTION 9 — INDEPENDENT EXIT (04:00)
   ============================================================ */
const CH9 = {
  n: 9, title: 'Independent exit', min: 4, bg: 'classroom',
  steps: [
    {
      id: '9.1', title: 'Your turn: four tasks', sec: 100, supportDefault: false, es: 'Sin ayuda: 1) una pregunta con is, 2) una pregunta con are, 3) una respuesta corta afirmativa, 4) una respuesta corta negativa. Usa los datos de las tarjetas. El profesor puede encender «Support» si hace falta.',
      build(S) {
        S.supportable = true; S.scene();
        const P = [['nora', 120, 'a teacher'], ['alex', 370, 'a student'], ['maya', 620, 'a doctor'], ['sam', 870, 'a student']];
        P.forEach(([k, x, job]) => stand(S, k, x, { s: 0.5, y: 700, job, look: [x < 700 ? 3 : -3, 0] }));
        S.fact('Nora: ready', 30, 716, { style: 'font-size:20px' }); S.fact('Alex: ready', 280, 716, { style: 'font-size:20px' }); S.fact('Maya: in class', 520, 716, { style: 'font-size:20px' }); S.fact('Sam: late today', 790, 716, { style: 'font-size:20px' });
        const tasks = ['Ask one question with is.', 'Ask one question with are.', 'Give one positive short answer.', 'Give one negative short answer.'];
        const card = S.paper(1060, 130, 500, 600, { cls: 'tilt2' }); card.style.padding = '14px 20px';
        card.innerHTML = `<div class="tag">${T('Four tasks')}</div>` + tasks.map((t, i) => `<div class="t9" style="display:flex;gap:10px;align-items:flex-start;margin:10px 0;font-size:24px;font-weight:700;line-height:1.15;opacity:.55"><span class="chip gold" style="font-size:22px;padding:2px 12px">${i + 1}</span><span>${T(t)}</span></div>`).join('');
        const sup = S.el(`<div class="note-card" style="left:200px;top:196px;width:820px;font-size:24px;display:none">${T('Be + subject + complement + ?   ·   Yes, + pronoun + be.   ·   No, + pronoun + be + not.')}</div>`);
        S.onSupport = () => { sup.style.display = CFG.support ? '' : 'none'; };
        S.onSupport();
        const rows = $$('.t9', card);
        S.levels = 4; S.revLabels = ['Task 1', 'Task 2', 'Task 3', 'Task 4'];
        S.onLevel = (n) => { rows.forEach((r, i) => r.style.opacity = i === n - 1 ? 1 : (i < n - 1 ? 0.85 : 0.5)); if (n) Aud.sfx('card'); };
        S.sayAtMap = { 1: { text: tasks[0], o: {} }, 2: { text: tasks[1], o: {} }, 3: { text: tasks[2], o: {} }, 4: { text: tasks[3], o: {} } };
        S.play = async () => { await S.sleep(500); await S.say('Now it is your turn. | Support is hidden.'); await S.say('Use the facts on the cards.'); };
      }
    },
    {
      id: '9.2', title: 'Teacher checklist', sec: 40, bg: 'night', music: 'off', quiet: true, es: 'Lista para el profesor (a nivel de clase, sin nombres): concordancia de be, orden de palabras, perspectiva del pronombre y producción independiente.',
      build(S) {
        S.supportable = false; S.noRevealMsg = 'Nothing to reveal here.';
        const items = [['be', 'Be agreement: am / is / are'], ['order', 'Question word order: be + subject'], ['persp', 'Pronoun perspective: who is answering?'], ['indep', 'Independent production: no support needed']];
        const box = S.paper(200, 130, 1200, 480, {});
        box.innerHTML = `<div class="tag">${T('Class-level · anonymous · teacher-entered')}</div>`;
        items.forEach(([k, t]) => {
          const r = mk(`<div class="chk" style="margin-top:12px;background:rgba(20,23,63,.07)"><span>${T(t)}</span><span class="tri"></span></div>`);
          const tri = r.querySelector('.tri');
          [['Most', 'most'], ['Some', 'some'], ['Not yet', 'not yet']].forEach(([lab, v]) => {
            const b = mk(`<button aria-pressed="${ST.exit[k] === v}">${lab}</button>`);
            b.onclick = () => { ST.exit[k] = v; [...tri.children].forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); saveSoon(); Aud.sfx('tick'); };
            tri.appendChild(b);
          });
          box.appendChild(r);
        });
        S.el(`<div class="note-card" style="left:200px;top:640px;width:1200px;font-size:22px">${T('Notes from your own listening. The app does not hear or grade learners.')}</div>`);
        S.play = async () => { await S.sleep(400); await S.say('Teacher: | note what you heard.'); };
      }
    },
    {
      id: '9.3', title: 'Recap', sec: 60, es: 'Resumen: Be va primero en la pregunta. Respuesta corta afirmativa: Yes + pronombre + be. Negativa: No + pronombre + be + not. Piensa en quién pregunta y quién responde.',
      build(S) {
        S.supportable = false;
        const nora = stand(S, 'nora', 170, { pose: 'present', look: [5, 0] }), alex = stand(S, 'alex', 1430, { pose: 'rest', look: [-5, 0] });
        const b = S.board(330, 125, 940, 320);
        const lab = mk(`<div class="tag" style="font-size:24px">${T('Statement')}</div>`); b.appendChild(lab);
        const P = pair('You', 'are', 'ready');
        const sent = S.sentence(b, P.stmt, { size: 90 });
        const list = S.el(`<div class="lv hidden-lv" style="left:230px;top:470px;width:1140px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center"></div>`);
        ['Am I…?', 'Are you…?', 'Is he…?', 'Is she…?', 'Is it…?', 'Are we…?', 'Are they…?'].forEach(t => list.appendChild(mk(`<span class="chip indigo" style="font-size:34px">${T(t)}</span>`)));
        const ans = S.el(`<div class="lv hidden-lv" style="left:230px;top:600px;width:1140px;display:flex;gap:16px;justify-content:center"><span class="chip">${T('Yes, I am.')}</span><span class="chip coral">${T('No, I’m not.')}</span></div>`);
        S.play = async () => {
          await S.sleep(500);
          await S.say('You are ready.', { tone: 's', who: nora }); await S.sleep(500);
          lab.innerHTML = T('Question'); Aud.sfx('move'); await sent.morph(P.quest, 1300, S.e); Aud.sfx('question');
          await S.say('Are you ready?', { tone: 'q', who: nora }); await S.sleep(300);
          await S.say('Be goes first.', { who: nora });
          list.classList.remove('hidden-lv'); Aud.sfx('reveal');
          await S.say('Am I, | are you, | is he, | is she, | is it, | are we, | are they?', { who: nora, gap: 200 });
          await sent.morph([tk('Yes,', 'yes', 'y'), tk('I', 'subj', 's'), tk('am', 'be', 'b'), tk('.', 'punct', 'dot')], 1000, S.e);
          lab.innerHTML = T('Positive short answer'); ans.classList.remove('hidden-lv');
          await S.say('Yes, I am.', { tone: 's', who: alex });
          await sent.morph([tk('No,', 'no', 'y'), tk('I’m', 'subj', 's'), tk('not', 'not', 'n'), tk('.', 'punct', 'dot')], 1000, S.e);
          lab.innerHTML = T('Negative short answer');
          await S.say('No, I’m not.', { tone: 's', who: alex });
          await S.say('Think: who asks? | Who answers?', { who: nora });
        };
      }
    },
    {
      id: '9.4', title: 'Well done!', sec: 40, music: 'finale', es: '¡Buen trabajo! Hoy preguntasteis y respondisteis con be. Práctica opcional de dos minutos para después de la clase (fuera del temporizador de 60 minutos).',
      build(S) {
        S.supportable = false; S.scene();
        const P = [['nora', 110, 'present'], ['sam', 340, 'rest'], ['maya', 570, 'rest'], ['alex', 800, 'presentL']];
        P.forEach(([k, x, pose]) => stand(S, k, x, { s: 0.55, y: 770, pose, look: [x < 450 ? 4 : -4, 0] }));
        const b = S.board(300, 110, 900, 230);
        b.innerHTML = `<div class="big" style="font-size:54px;text-align:center;line-height:1.05">${T('You asked. You answered.')}</div><div style="font-size:36px;margin-top:6px;color:var(--turq-l);font-family:var(--serif);font-weight:700">${T('Great work today!')}</div>`;
        const home = S.paper(930, 360, 620, 330, { cls: 'tilt2' }); home.style.padding = '14px 18px'; home.style.fontSize = '24px';
        home.innerHTML = `<div class="tag">${T('After class · optional · 2 minutes')}</div><div style="font-weight:700;font-size:25px;line-height:1.2;margin-top:4px">${['Write one question with is.', 'Write one question with are.', 'Write one Yes short answer.', 'Write one No short answer.'].map((t, i) => `<div>${i + 1}. ${T(t)}</div>`).join('')}</div><div style="font-size:18px;margin-top:6px;opacity:.85">${T('This is outside the 60-minute timer.')}</div>`;
        const res = S.el(`<button class="btn gold" style="left:930px;top:715px;font-size:24px">Open results &amp; export</button>`);
        res.onclick = () => UI.results();
        S.play = async () => {
          await S.sleep(600); Aud.finale(); Fx.drift(50);
          await S.say('Great work today!', {}); await S.say('You asked questions. | You answered with be.', {});
          await S.say('Try the optional practice after class.', {});
        };
      }
    }
  ]
};
