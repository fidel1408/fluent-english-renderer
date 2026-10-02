/* ============================================================
   SECTION 2 — BUILD THE QUESTION (08:00)
   ============================================================ */
function challenge(o) {
  return {
    id: o.id, title: o.title, sec: 40, bg: o.bg || 'classroom', es: o.es, music: 'bed',
    build(S) {
      const P = pair(o.s, o.b, o.c);
      const who = o.pic(S);
      const stmt = modelChip(S, P.sText, 740, 130, { cls: 'g', tone: 's', who });
      const turn = S.turn('Your turn: say the question.', 740, 232); turn.classList.add('hidden-lv');
      const g = orderGame(S, { pair: P, y: 320, scramble: o.scramble, expl: o.expl });
      S.levels = 1; S.revLabels = ['Reveal the question'];
      S.onLevel = async (n) => { if (n === 1) { turn.classList.add('hidden-lv'); const e = S.interrupt(); await g.auto(e); await S.say(P.qText, { tone: 'q' }); } else g.reset(); };
      if (o.extra) o.extra(S);
      S.play = async () => {
        await S.sleep(400);
        await S.say(P.sText, { tone: 's', who });
        turn.classList.remove('hidden-lv');
      };
    }
  };
}
const room = (S, x, y, txt) => S.el(`<div class="fact gold" style="left:${x}px;top:${y}px">${T(txt)}</div>`);

const CH2 = {
  n: 2, title: 'Build the question', min: 8, bg: 'classroom',
  steps: [
    {
      id: '2.1', title: 'Be moves to the front', sec: 45, es: 'En una pregunta, el verbo be va primero: sujeto + be + complemento se convierte en Be + sujeto + complemento + ?',
      build(S) {
        const nora = stand(S, 'nora', 190, { pose: 'present', look: [5, 0] });
        const b = S.board(340, 130, 930, 300);
        const g = [tk('Subject', 'subj', 's'), tk('be', 'be', 'b'), tk('complement', 'comp', 'c0'), tk('.', 'punct', 'dot')];
        const gq = [tk('Be', 'be', 'b'), tk('subject', 'subj', 's'), tk('complement', 'comp', 'c0'), tk('?', 'punct', 'qm')];
        const sent = S.sentence(b, g, { size: 90 });
        const c1 = S.el(`<div class="note-card hidden-lv lv" style="left:340px;top:470px;width:440px"><div class="tag">${T('Statement')}</div>${T('Subject + be + complement.')}</div>`);
        const c2 = S.el(`<div class="note-card hidden-lv lv" style="left:830px;top:470px;width:440px;border-color:var(--turq-l)"><div class="tag">${T('Question')}</div>${T('Be + subject + complement + ?')}</div>`);
        const leg = S.el(`<div class="hidden-lv lv" style="left:340px;top:620px;width:930px;display:flex;gap:18px;justify-content:center"><span class="chip">${T('subject')}</span><span class="chip gold">${T('be')}</span><span class="chip cream">${T('complement')}</span></div>`);
        S.play = async () => {
          await S.sleep(500);
          await S.say('Subject | be | complement.', { who: nora });
          c1.classList.remove('hidden-lv'); await S.sleep(500);
          Aud.sfx('move'); await sent.morph(gq, 1500, S.e); Aud.sfx('question');
          await S.say('Be | subject | complement | question mark.', { who: nora });
          c2.classList.remove('hidden-lv'); leg.classList.remove('hidden-lv');
          await S.say('Be moves to the front.', { who: nora });
        };
      }
    },
    {
      id: '2.2', title: 'Three examples', sec: 75, es: 'Primero di la pregunta tú mismo. Luego el profesor pulsa «Revelar»: be se mueve al principio.',
      build(S) {
        const nora = stand(S, 'nora', 190, { pose: 'present', look: [5, 0] });
        const EX = [pair('You', 'are', 'ready'), pair('She', 'is', 'a teacher'), pair('They', 'are', 'at home')];
        const b = S.board(340, 130, 930, 330);
        const label = mk(`<div class="tag" style="font-size:24px"></div>`); b.appendChild(label);
        const sent = S.sentence(b, EX[0].stmt, { size: 98 });
        const turn = S.turn('Your turn: say the question.', 440, 500);
        const note = S.el(`<div class="note-card" style="left:340px;top:610px;width:930px;text-align:center">${T('Say it first. Then the teacher reveals it.')}</div>`);
        S.levels = 5; S.revLabels = ['Make the question', 'Next example', 'Make the question', 'Next example', 'Make the question'];
        const tags = ['Example 1 · statement', 'Example 1 · question', 'Example 2 · statement', 'Example 2 · question', 'Example 3 · statement', 'Example 3 · question'];
        S.onLevel = async (n, prev, silent) => {
          const ex = Math.floor(n / 2), q = n % 2 === 1, P = EX[ex];
          label.innerHTML = T(tags[n]);
          turn.classList.toggle('hidden-lv', q);
          if (silent || Math.abs(n - prev) !== 1) { sent.set(q ? P.quest : P.stmt); return; }
          const e = S.interrupt();
          if (q) { Aud.sfx('move'); await sent.morph(P.quest, 1300, e); Aud.sfx('question'); Fx.burst(800, 280, 16); await S.say(P.qText, { tone: 'q', who: nora }); }
          else { sent.set(P.stmt); await S.say(P.sText, { tone: 's', who: nora }); }
        };
        S.play = async () => { await S.sleep(500); await S.say(EX[0].sText, { tone: 's', who: nora }); };
        S.onLevel(0, 0, true);
      }
    },
    {
      id: '2.3', title: 'Seven question patterns', sec: 90, es: 'Be cambia con el sujeto: I → am; he, she, it → is; you, we, they → are. Pulsa cada burbuja para oír el ejemplo.',
      build(S) {
        const PATS = [['I', 'am', 'late'], ['You', 'are', 'ready'], ['He', 'is', 'tired'], ['She', 'is', 'happy'], ['It', 'is', 'new'], ['We', 'are', 'in class'], ['They', 'are', 'at home']];
        const X = [150, 350, 560, 800, 1040, 1250, 1450], Y = [640, 560, 495, 470, 495, 560, 640];
        const card = S.paper(400, 130, 800, 200, { cls: 'tilt1' });
        card.style.display = 'flex'; card.style.alignItems = 'center'; card.style.justifyContent = 'center';
        const sent = S.sentence(card, pair(...PATS[0]).stmt, { size: 76 });
        const orbs = PATS.map((p, i) => {
          const o = S.el(`<button class="orb" style="left:${X[i] - 100}px;top:${Y[i] - 100}px;width:200px;height:200px;font-size:33px" aria-label="${capw(p[1])} ${p[0]}"><span style="white-space:nowrap">${T(capw(p[1]) + ' ' + (p[0] === 'I' ? 'I' : p[0].toLowerCase()))}</span></button>`);
          o.onclick = () => show(i, true); return o;
        });
        const ag = S.el(`<div class="lv hidden-lv" style="left:240px;top:722px;width:1120px;display:flex;gap:22px;justify-content:center;align-items:center"><span class="chip">${T('I → am')}</span><span class="chip gold">${T('he · she · it → is')}</span><span class="chip coral">${T('you · we · they → are')}</span></div>`);
        let cur = -1;
        async function show(i, user) {
          orbs.forEach((o, j) => o.classList.toggle('on', j === i)); cur = i;
          const P = pair(...PATS[i]);
          const e = user ? S.interrupt() : S.e;
          sent.set(P.stmt); Aud.sfx('tick');
          await sleepE(500, e);
          Aud.sfx('move'); await sent.morph(P.quest, 1100, e);
          await S.say(P.qText, { tone: 'q' });
        }
        const sleepE = (ms, e) => sleep(ms, e);
        S.levels = 7; S.revLabels = PATS.map((p, i) => 'Next pattern');
        S.onLevel = (n, prev, silent) => { if (silent || n === 0) { orbs.forEach(o => o.classList.remove('on')); return; } show(n - 1, true).catch(x => { if (x !== CANCEL) console.error(x); }); };
        S.play = async () => {
          await S.sleep(400);
          for (let i = 0; i < PATS.length; i++) { await show(i, false); await S.sleep(250); }
          ag.classList.remove('hidden-lv');
          await S.say('I, am. | He, she, it, is. | You, we, they, are.');
        };
      }
    },
    {
      id: '2.4', title: 'You can be one person or many', sec: 30, es: '«You» sirve para una persona o para varias. Una persona que usa «they» también usa «are»: Are they ready?',
      build(S) {
        const n1 = stand(S, 'nora', 130, { s: 0.5, pose: 'present', look: [4, 0], y: 780 });
        const a1 = stand(S, 'alex', 440, { s: 0.5, pose: 'rest', look: [-4, 0], y: 780 });
        const n2 = stand(S, 'nora', 880, { s: 0.5, pose: 'present', look: [4, 0], y: 780 });
        const a2 = stand(S, 'alex', 1100, { s: 0.5, pose: 'rest', look: [-4, 0], y: 780 }), s2 = stand(S, 'sam', 1250, { s: 0.5, pose: 'rest', look: [-4, 0], y: 780 }), m2 = stand(S, 'maya', 1400, { s: 0.5, pose: 'rest', look: [-4, 0], y: 780 });
        S.bubble('Are you ready?', 90, 270, { cls: 'q', tail: 60, style: 'font-size:34px' });
        S.bubble('Are you ready?', 840, 270, { cls: 'q', tail: 60, style: 'font-size:34px' });
        ringAt(S, 395, 440, 130, 340, 'dash');
        ringAt(S, 1050, 440, 440, 340, 'dash');
        S.el(`<div class="chip" style="left:230px;top:215px;font-size:28px">${T('you = one person')}</div>`);
        S.el(`<div class="chip gold" style="left:1010px;top:215px;font-size:28px">${T('you = more than one')}</div>`);
        const they = S.el(`<div class="note-card hidden-lv lv" style="left:360px;top:130px;width:880px;text-align:center;font-size:30px">${T('One person who uses they? Still: Are they ready?')}</div>`);
        S.levels = 1; S.revLabels = ['Show: one person who uses they']; S.reg(they, 1);
        S.play = async () => {
          await S.sleep(500);
          await S.say('Are you ready?', { tone: 'q', who: n1 }); await S.say('You means one person.', { who: n1 });
          await S.sleep(300);
          await S.say('Are you ready?', { tone: 'q', who: n2 }); await S.say('You can also mean more than one person.', { who: n2 });
        };
      }
    },
    challenge({
      id: '2.5', title: 'Order the words: you', s: 'You', b: 'are', c: 'a student', expl: 'Move “are” before “you”. Then add a question mark: Are you a student?', scramble: [3, 1, 4, 0, 2],
      es: 'Ordena las palabras. Be (are) va antes del sujeto (you). Piensa y di la pregunta antes de revelarla.',
      pic(S) { const n = stand(S, 'nora', 220, { s: 0.58, pose: 'present', look: [5, 0], y: 780 }); const a = stand(S, 'alex', 520, { s: 0.58, pose: 'rest', look: [-5, 0], y: 780, job: 'a student' }); room(S, 130, 650, 'Alex: a student').style.fontSize = '24px'; return n; }
    }),
    challenge({
      id: '2.6', title: 'Order the words: he', s: 'He', b: 'is', c: 'ready', expl: 'Move “is” before “he”. Then add a question mark: Is he ready?', scramble: [2, 0, 3, 1],
      es: 'Ordena: is va antes de he. Sam es el hombre de la imagen: Sam (he).',
      pic(S) { const s = stand(S, 'sam', 360, { s: 0.62, pose: 'rest', look: [3, 0], y: 780 }); room(S, 190, 700, 'Sam: ready').style.fontSize = '26px'; return s; }
    }),
    challenge({
      id: '2.7', title: 'Order the words: it', s: 'It', b: 'is', c: 'new', expl: 'Move “is” before “it”. Then add a question mark: Is it new?', scramble: [3, 1, 0, 2],
      es: 'Ordena: is va antes de it. El portátil tiene una etiqueta «NEW» (nuevo).',
      pic(S) {
        S.add(A.obj.desk(60, 520, 560, 70)); S.add(A.obj.laptop(330, 570, 1.6));
        S.add(`<g transform="translate(470,430)"><circle r="46" fill="#f4b942" stroke="#a8730c" stroke-width="4"/><text y="9" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="26" fill="#14173f">NEW</text></g>`);
        return null;
      }
    }),
    challenge({
      id: '2.8', title: 'Order the words: they', s: 'They', b: 'are', c: 'here', expl: 'Move “are” before “they”. Then add a question mark: Are they here?', scramble: [2, 0, 3, 1],
      es: 'Ordena: are va antes de they. Alex y Maya están aquí: «they» = Alex y Maya.',
      pic(S) { const a = stand(S, 'alex', 190, { s: 0.58, pose: 'rest', look: [3, 0], y: 780 }); const m = stand(S, 'maya', 470, { s: 0.58, pose: 'rest', look: [-3, 0], y: 780 }); ringAt(S, 100, 340, 480, 450, 'dash'); room(S, 160, 800 - 20, 'Alex and Maya: here').style.display = 'none'; S.el(`<div class="chip gold" style="left:210px;top:230px;font-size:28px">${T('they = Alex and Maya')}</div>`); return a; }
    }),
    challenge({
      id: '2.9', title: 'Order the words: we', s: 'We', b: 'are', c: 'late', expl: 'Move “are” before “we”. Then add a question mark: Are we late?', scramble: [3, 0, 2, 1],
      es: 'Ordena: are va antes de we. «We» = Alex y Sam (quien habla y otra persona). El reloj marca las 9:10 y la clase empieza a las 9:00.',
      pic(S) {
        S.add(A.obj.clock(340, 250, 1.35, 9, 10));
        const a = stand(S, 'alex', 190, { s: 0.55, pose: 'rest', look: [3, 0], y: 780 }); const m = stand(S, 'sam', 490, { s: 0.55, pose: 'rest', look: [-3, 0], y: 780 });
        ringAt(S, 100, 410, 470, 380, 'dash'); room(S, 150, 120, 'Class starts: 9:00').style.fontSize = '26px'; return a;
      }
    }),
    challenge({
      id: '2.10', title: 'Order the words: I', s: 'I', b: 'am', c: 'in the right room', bg: 'doorway', expl: 'Move “am” before “I”. Keep the capital I. Then add a question mark: Am I in the right room?', scramble: [5, 2, 0, 4, 1, 3, 6],
      es: 'Ordena: am va antes de I. Contexto: Alex está en la puerta, el cartel dice «Room 12» y su tarjeta dice «My class: Room 12». Vocabulario: right = correcto; room = sala, aula.',
      pic(S) {
        const a = stand(S, 'alex', 330, { s: 0.6, pose: 'present', look: [4, 0], y: 780 });
        S.el(`<div class="fact" style="left:90px;top:250px;font-size:26px">${T('My class: Room 12')}</div>`);
        const v = S.el(`<div class="lv hidden-lv" style="left:60px;top:640px;display:flex;flex-direction:column;gap:8px"><span class="chip cream" style="font-size:24px">${T('right = correct')}</span><span class="chip cream" style="font-size:24px">${T('room = a place with a door')}</span></div>`);
        const btn = S.el(`<button class="btn gold sm" style="left:60px;top:590px">Vocabulary help</button>`);
        btn.onclick = () => v.classList.toggle('hidden-lv');
        return a;
      }
    })
  ]
};
