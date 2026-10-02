/* ============================================================
   SECTION 1 — A QUESTION CHANGES THE CONVERSATION (05:00)
   ============================================================ */
function picQ(o) {
  return {
    id: o.id, title: o.title, sec: o.sec, bg: 'classroom', es: o.es, music: 'bed',
    build(S) {
      S.add(A.obj.desk(430, 560, 740, 70));
      S.add(o.obj);
      const nora = stand(S, 'nora', 220, { pose: 'present', look: [5, 0], s: 0.66 });
      const bub = S.bubble(o.q, 500, 168, { cls: 'q', tail: 70 });
      const chip = S.el(`<div class="chip gold" style="left:1130px;top:34px;font-size:22px">${T('Quick look · not graded')}</div>`);
      const turn = S.turn('Your turn: yes or no?', 1070, 600);
      turn.classList.add('hidden-lv');
      const yes = S.el(`<div class="chip lv" style="left:1230px;top:350px;font-size:44px;font-family:var(--serif)">${T('Yes.')}</div>`);
      const full = modelChip(S, o.ans, 1130, 450, { cls: '' });
      S.reg(yes, 1); S.reg(full, 2);
      S.levels = 2; S.revLabels = ['Say: yes', 'Show short answer'];
      S.sayAt(1, 'Yes.', { tone: 's' }); S.sayAt(2, o.ans, { tone: 's' });
      S.onLevel = (n) => { if (n > 0) Fx.burst(1330, 400, 14); };
      if (o.vocab) o.vocab.forEach(v => S.add && S.el(`<div class="vl" style="left:${v[0]}px;top:${v[1]}px">${T(v[2])}</div>`));
      S.play = async () => {
        await S.sleep(250);
        await S.say(o.q, { tone: 'q', who: nora });
        turn.classList.remove('hidden-lv');
      };
    }
  };
}

const CH1 = {
  n: 1, title: 'A question changes the conversation', min: 5, bg: 'classroom',
  steps: [
    {
      id: '1.1', title: 'Be: Yes/No Questions', sec: 45, music: 'theme', veil: 0.28, hideTitle: true,
      es: 'Hoy aprendemos a hacer preguntas de sí o no con el verbo be: Am I…? Are you…? Is she…?',
      build(S) {
        S.add(A.obj.desk(580, 600, 440, 56));
        S.add(A.obj.phone(690, 640, 0.95)); S.add(A.obj.books(770, 646, 0.95)); S.add(A.obj.bag(950, 650, 0.62));
        const ppl = [['nora', 120, 'present', 'a teacher'], ['sam', 370, 'rest', 'a student'], ['maya', 1250, 'rest', 'a doctor'], ['alex', 1450, 'presentL', 'a student']]
          .map(([k, x, pose, job]) => { const p = stand(S, k, x, { pose, look: [x < 800 ? 5 : -5, 0], job }); p.tag.style.opacity = 0; p.tag.style.transition = 'opacity .6s'; return p; });
        const b = S.board(450, 100, 700, 330);
        b.innerHTML = `<div class="tag">${T('Fluent English · A1')}</div><div class="big" style="font-size:56px;line-height:1.05;text-align:center">${T('Be: Yes/No Questions')}</div><div style="margin-top:6px;font-size:32px;color:var(--turq-l);font-family:var(--serif);font-weight:700">${T('Am I…? Are you…? Is she…?')}</div>`;
        b.style.opacity = 0; b.style.transition = 'opacity 1.4s';
        S.play = async () => {
          await S.sleep(250); b.style.opacity = 1; Fx.burst(800, 250, 26);
          await S.sleep(2600);
          await S.say('Welcome to Fluent English.', { who: ppl[0], after: 100 });
          await S.say('Today, we ask yes/no questions | with be.', { who: ppl[0] });
          await S.sleep(200);
          await S.say('Meet the people in our pictures.', { who: ppl[0] });
          for (let i = 0; i < 4; i++) { ppl[i].tag.style.opacity = 1; Aud.sfx('tick'); await S.say(['Nora.', 'Sam.', 'Maya.', 'Alex.'][i], { who: ppl[i], after: 100 }); }
        };
      }
    },
    {
      id: '1.2', title: 'A statement and a question', sec: 90, es: 'Una frase como «You are ready» da información. Una pregunta como «Are you ready?» pide información. En muchas preguntas de sí o no, la voz sube al final.',
      build(S) {
        const nora = stand(S, 'nora', 190, { pose: 'present', look: [5, 0] });
        const alex = stand(S, 'alex', 1410, { pose: 'rest', look: [-5, 0] });
        const b = S.board(360, 120, 880, 330);
        const kind = mk(`<div class="tag" style="font-size:24px">${T('A statement')}</div>`); b.appendChild(kind);
        const P = pair('You', 'are', 'ready');
        const sent = S.sentence(b, P.stmt, { size: 92 });
        const cStmt = S.el(`<div class="note-card hidden-lv lv" style="left:270px;top:480px;width:520px"><b>${T('A statement')}</b> ${T('gives information.')}</div>`);
        const cQ = S.el(`<div class="note-card hidden-lv lv" style="left:830px;top:480px;width:540px;border-color:var(--turq-l)"><b>${T('A question')}</b> ${T('asks for information.')}</div>`);
        const cI = S.el(`<div class="note-card hidden-lv lv" style="left:300px;top:590px;width:1000px;text-align:center;font-size:26px;white-space:nowrap">${T('In many yes/no questions, the voice goes up at the end.')} <span style="color:var(--gold-l);font-size:34px">↗</span></div>`);
        const m1 = modelChip(S, 'You are ready.', 300, 680, { cls: 'sm', tone: 's' }), m2 = modelChip(S, 'Are you ready?', 800, 680, { cls: 'sm', tone: 'q' });
        m1.classList.add('hidden-lv', 'lv'); m2.classList.add('hidden-lv', 'lv');
        const show = el => el.classList.remove('hidden-lv');
        S.play = async () => {
          await S.sleep(200);
          await S.say('You are ready.', { tone: 's', who: nora });
          await S.sleep(250);
          Aud.sfx('move'); kind.innerHTML = T('A question');
          await sent.morph(P.quest, 1400, S.e); Aud.sfx('question');
          await S.say('Are you ready?', { tone: 'q', who: nora });
          await S.sleep(250);
          show(cStmt); Aud.sfx('tick'); await S.say('A statement gives information.', { who: nora });
          show(cQ); Aud.sfx('tick'); await S.say('A question asks for information.', { who: nora });
          await S.sleep(250);
          show(cI); await S.say('In many yes/no questions, | the voice goes up at the end.', { who: nora });
          show(m1); show(m2);
        };
      }
    },
    picQ({
      id: '1.3', title: 'Look and answer: the phone', sec: 55, q: 'Is it a phone?', ans: 'Yes, it is.',
      es: 'Mira la imagen. ¿Sí o no? Primero acepta «yes» o «no». Después modela la respuesta corta: «Yes, it is.»',
      obj: A.obj.phone(800, 612, 2.3), vocab: [[800, 640, 'phone']]
    }),
    picQ({
      id: '1.4', title: 'Look and answer: the books', sec: 55, q: 'Are they books?', ans: 'Yes, they are.',
      es: 'Mira la imagen: hay dos libros. Primero «yes» o «no»; después la respuesta corta: «Yes, they are.»',
      obj: A.obj.books(690, 614, 2.3), vocab: [[800, 640, 'books']]
    }),
    picQ({
      id: '1.5', title: 'Look and answer: the bag', sec: 55, q: 'Is the bag blue?', ans: 'Yes, it is.',
      es: 'Mira la imagen: la mochila es azul. Primero «yes» o «no»; después la respuesta corta: «Yes, it is.»',
      obj: A.obj.bag(800, 616, 2.0), vocab: [[800, 640, 'bag']]
    })
  ]
};
