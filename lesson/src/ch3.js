/* ============================================================
   SECTION 3 — YES, WITH A COMPLETE SHORT ANSWER (07:00)
   ============================================================ */
/* animated arrow on the scene (draws itself) */
function arrow(S, d, head, col = '#ffd978') {
  const g = S.add(`<path d="${d}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" opacity=".95"/><polygon points="0,-15 30,0 0,15" fill="${col}" transform="translate(${head[0]},${head[1]}) rotate(${head[2]})" opacity="0"/>`);
  const path = g.querySelector('path'), tri = g.querySelector('polygon');
  const len = path.getTotalLength();
  path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
  return {
    g, async draw(e, ms = 900) {
      if (reduced()) ms = 1;
      const a = Anim.add(path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' }));
      await a.finished.catch(() => { }); alive(e);
      tri.setAttribute('opacity', 1);
    }
  };
}

function shortYes(o) {
  return {
    id: o.id, title: o.title, sec: 40, bg: 'classroom', es: o.es, music: 'bed',
    build(S) {
      const who = o.pic(S);
      const bub = S.bubble(o.q, 470, 150, { cls: 'q', tail: 60 });
      const turn = S.turn('Your turn: short answer.', 1030, 640); turn.classList.add('hidden-lv');
      const ans = modelChip(S, o.ans, 1130, 330, {});
      const map = S.el(`<div class="note-card" style="left:1030px;top:450px;width:500px;font-size:26px">${T(o.map)}</div>`);
      S.reg(ans, 1); S.reg(map, 1);
      S.levels = 1; S.revLabels = ['Show short answer']; S.sayAt(1, o.ans, { tone: 's' });
      S.onLevel = (n) => { if (n) { turn.classList.add('hidden-lv'); Fx.burst(1280, 380, 16); } };
      S.play = async () => { await S.sleep(500); await S.say(o.q, { tone: 'q', who }); turn.classList.remove('hidden-lv'); };
    }
  };
}

const CH3 = {
  n: 3, title: 'Yes, with a complete short answer', min: 7, bg: 'classroom',
  steps: [
    {
      id: '3.1', title: 'Yes + pronoun + be', sec: 60, es: 'Respuesta corta afirmativa: Yes + pronombre + be. Mira quién pregunta y quién responde: el pronombre depende de la situación.',
      build(S) {
        const b = S.board(300, 120, 1000, 330);
        const q = mk(`<div style="font-family:var(--serif);font-weight:700;font-size:40px;color:var(--cream);margin-bottom:6px"></div>`); b.appendChild(q);
        const ctx = mk(`<div class="chip gold" style="font-size:24px;margin-bottom:6px"></div>`); b.appendChild(ctx);
        const sent = S.sentence(b, [tk('Yes,', 'yes', 'y'), tk('pronoun', 'subj', 's'), tk('be', 'be', 'b'), tk('.', 'punct', 'dot')], { size: 86 });
        const rows = [
          ['Are you ready?', 'You answer for yourself.', 'Yes, I am.', 'I', 'am'],
          ['Am I late?', 'Another person answers about me.', 'Yes, you are.', 'you', 'are'],
          ['Is he ready?', 'We talk about one man.', 'Yes, he is.', 'he', 'is'],
          ['Is she a teacher?', 'We talk about one woman.', 'Yes, she is.', 'she', 'is'],
          ['Is it new?', 'We talk about one thing.', 'Yes, it is.', 'it', 'is'],
          ['Are you ready?', 'A group answers together.', 'Yes, we are.', 'we', 'are'],
          ['Are they here?', 'We talk about other people.', 'Yes, they are.', 'they', 'are']
        ];
        const wrap = S.el(`<div style="left:120px;top:480px;width:1360px;display:flex;flex-wrap:wrap;gap:16px 20px;justify-content:center"></div>`);
        const chips = rows.map(r => { const c = modelChip(S, r[2], 0, 0, { cls: 'sm', style: 'position:static', tone: 's' }); c.style.position = 'static'; c.classList.add('hidden-lv', 'lv'); wrap.appendChild(c); return c; });
        S.play = async () => {
          await S.sleep(500);
          q.innerHTML = T('Yes + pronoun + be.'); await S.say('Yes | plus pronoun | plus be.');
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            q.innerHTML = T(r[0]); ctx.textContent = ''; ctx.innerHTML = T(r[1]);
            await S.say(r[0], { tone: 'q' });
            Aud.sfx('move');
            await sent.morph([tk('Yes,', 'yes', 'y'), tk(r[3], 'subj', 's'), tk(r[4], 'be', 'b'), tk('.', 'punct', 'dot')], 900, S.e);
            chips[i].classList.remove('hidden-lv');
            await S.say(r[2], { tone: 's', after: 300 });
          }
        };
      }
    },
    {
      id: '3.2', title: 'Say the whole be', sec: 30, es: 'En una respuesta corta terminamos con is/are/am completo: «Yes, she is.» «Yes, she’s» no es la respuesta corta. Usamos she’s en frases más largas: «Yes, she’s a teacher.»',
      build(S) {
        const nora = stand(S, 'nora', 230, { pose: 'present', look: [5, 0], job: 'a teacher' });
        S.bubble('Is she a teacher?', 440, 140, { cls: 'q', tail: 50 });
        const ok = S.el(`<div class="paper" style="left:560px;top:290px;width:520px;display:flex;align-items:center;gap:20px"><span class="chip" style="font-size:44px;padding:4px 16px">✓</span><span class="big" style="font-size:56px">${T('Yes, she is.')}</span></div>`);
        const no = S.el(`<div class="paper lv hidden-lv" style="left:560px;top:470px;width:520px;border:4px solid var(--coral);display:flex;align-items:center;gap:20px"><span class="chip coral" style="font-size:44px;padding:4px 16px">✗</span><span><span class="big" style="font-size:56px;text-decoration:line-through;text-decoration-color:var(--coral-d)">${T('Yes, she’s.')}</span><br><span class="tag" style="color:var(--coral-d)">${T('Not the short answer')}</span></span></div>`);
        const why = S.el(`<div class="note-card lv hidden-lv" style="left:1120px;top:300px;width:420px">${T('In a short answer, we end with is.')}<br><span style="font-size:22px;opacity:.9">${T('We use she’s in longer sentences: Yes, she’s a teacher.')}</span></div>`);
        const rp = S.replayBtn('Yes, she is.', 1090, 330, { tone: 's' });
        S.reg(no, 1); S.reg(why, 1); S.levels = 1; S.revLabels = ['Show the contrast'];
        S.onLevel = (n) => { if (n) Aud.sfx('soft'); };
        S.play = async () => {
          await S.sleep(500);
          await S.say('Is she a teacher?', { tone: 'q', who: nora });
          await S.say('Yes, she is.', { tone: 's', who: nora });
          await S.sleep(500); no.classList.remove('hidden-lv'); why.classList.remove('hidden-lv'); Aud.sfx('soft');
          await S.say('In a short answer, | we end with is.', { who: nora });
        };
      }
    },
    shortYes({
      id: '3.3', title: 'Short answer: Maya', q: 'Is she a doctor?', ans: 'Yes, she is.', map: 'she → Yes, she is.',
      es: 'Mira la etiqueta: Maya es doctora. Pregunta: «Is she a doctor?» Respuesta corta: «Yes, she is.»',
      pic(S) { const n = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] }); const m = stand(S, 'maya', 770, { pose: 'rest', look: [-3, 0], job: 'a doctor' }); return n; }
    }),
    shortYes({
      id: '3.4', title: 'Short answer: Alex and Sam', q: 'Are they in class?', ans: 'Yes, they are.', map: 'they → Yes, they are.',
      es: 'Alex y Sam están en clase: «they» = Alex y Sam. Respuesta corta: «Yes, they are.»',
      pic(S) { const n = stand(S, 'nora', 190, { pose: 'present', look: [5, 0] }); stand(S, 'alex', 640, { look: [-3, 0] }); stand(S, 'sam', 860, { look: [-3, 0] }); S.fact('Alex and Sam: in class', 590, 790 - 100, { cls: '' }); return n; }
    }),
    shortYes({
      id: '3.5', title: 'Short answer: the phone', q: 'Is the phone new?', ans: 'Yes, it is.', map: 'it → Yes, it is.',
      es: 'El teléfono tiene una etiqueta NEW (nuevo). Respuesta corta: «Yes, it is.»',
      pic(S) {
        const n = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] });
        S.add(A.obj.desk(430, 560, 520, 70)); S.add(A.obj.phone(690, 612, 2.1));
        S.add(`<g transform="translate(800,470)"><circle r="44" fill="#f4b942" stroke="#a8730c" stroke-width="4"/><text y="9" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="25" fill="#14173f">NEW</text></g>`);
        return n;
      }
    }),
    shortYes({
      id: '3.6', title: 'Short answer: Sam', q: 'Is he a student?', ans: 'Yes, he is.', map: 'he → Yes, he is.',
      es: 'Sam es un estudiante, según su etiqueta. Respuesta corta: «Yes, he is.»',
      pic(S) { const n = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] }); stand(S, 'sam', 780, { look: [-3, 0], job: 'a student' }); return n; }
    }),
    {
      id: '3.7', title: 'Who is “you”? Who is “I”?', sec: 40, es: 'Mira las flechas: «you» es la persona que escucha la pregunta. Cuando Alex responde sobre sí mismo, dice «I».',
      build(S) {
        const nora = stand(S, 'nora', 300, { s: 0.72, y: 780, pose: 'present', look: [5, 0], job: 'a teacher' });
        const alex = stand(S, 'alex', 1300, { s: 0.72, y: 780, pose: 'rest', look: [-5, 0], job: 'a student' });
        S.fact('Alex: ready', 1150, 700, {});
        const b1 = S.bubble('Are <span class="hl-t">you</span> ready?', 110, 150, { cls: 'q', tail: 120 });
        const b2 = S.bubble('Yes, <span class="hl-t">I</span> am.', 1060, 150, { cls: '', tail: 220, style: '' });
        b1.classList.add('lv', 'hidden-lv'); b2.classList.add('lv', 'hidden-lv');
        const a1 = arrow(S, 'M 548 280 C 800 150, 1000 250, 1140 392', [1142, 394, 48]);
        const a2 = arrow(S, 'M 1130 300 C 1020 420, 1120 560, 1240 560', [1242, 560, 10]);
        const l1 = S.el(`<div class="chip lv hidden-lv" style="left:700px;top:430px;font-size:30px">${T('you = the listener: Alex')}</div>`);
        const l2 = S.el(`<div class="chip gold lv hidden-lv" style="left:700px;top:520px;font-size:30px">${T('I = the speaker: Alex')}</div>`);
        S.play = async () => {
          await S.sleep(500);
          b1.classList.remove('hidden-lv'); await S.say('Are you ready?', { tone: 'q', who: nora });
          Aud.sfx('move'); const p = a1.draw(S.e, 1100); await S.sleep(300); await p;
          l1.classList.remove('hidden-lv'); await S.say('You | is Alex, | the listener.', { who: nora });
          await S.sleep(400);
          await alex.pose('chest', 800, S.e);
          b2.classList.remove('hidden-lv'); await S.say('Yes, I am.', { tone: 's', who: alex });
          Aud.sfx('move'); await a2.draw(S.e, 900);
          l2.classList.remove('hidden-lv'); await S.say('I | is Alex, | the speaker.', { who: alex });
        };
      }
    },
    {
      id: '3.8', title: 'Choose and say', sec: 80, es: 'Elige la respuesta corta correcta. Fíjate en quién responde y de quién hablamos. Después dilo en voz alta.',
      build(S) {
        S.supportable = false;
        const R = [
          { q: 'Are you ready?', who: 'nora', ctx: 'A learner answers for themselves.', pic: S => { stand(S, 'nora', 240, { pose: 'present', look: [5, 0] }); S.el(`<div class="note-card" style="left:60px;top:650px;width:560px;font-size:24px">${T('You are the learner. Answer for yourself.')}</div>`); }, opts: ['Yes, he is.', 'Yes, I am.', 'Yes, they are.'], c: 1, say: 'Yes, I am.', hint: ['Nora asks you. Is “he” the learner?', '', 'Nora asks one learner, not other people.'], good: '“You” is the learner, so the learner says “I”: Yes, I am.' },
          { q: 'Is Sam a student?', ctx: 'We talk about Sam (he).', pic: S => { stand(S, 'sam', 330, { look: [3, 0], job: 'a student' }); }, opts: ['Yes, she is.', 'Yes, it is.', 'Yes, he is.'], c: 2, say: 'Yes, he is.', hint: ['Sam is a man. Use “he”.', 'Sam is a person, not a thing.', ''], good: 'Sam is one man: he. Yes, he is.' },
          { q: 'Are Alex and Maya in class?', ctx: 'You are not Alex or Maya.', pic: S => { stand(S, 'alex', 200, { look: [3, 0] }); stand(S, 'maya', 470, { look: [-3, 0] }); ringAt(S, 90, 330, 500, 470, 'dash'); S.el(`<div class="note-card" style="left:120px;top:150px;width:470px;font-size:24px">${T('Alex and Maya: in class. You are not in this group.')}</div>`); }, opts: ['Yes, they are.', 'Yes, we are.', 'Yes, you are.'], c: 0, say: 'Yes, they are.', hint: ['', '“We” includes the speaker. You are not Alex or Maya.', 'The answer is not about the listener.'], good: 'Alex and Maya are other people: they. Yes, they are.' },
          { q: 'Is it a book?', ctx: 'We talk about one thing.', pic: S => { S.add(A.obj.desk(60, 520, 560, 70)); S.add(A.obj.book(220, 560, 2.0, '#ff7a69', 120)); }, opts: ['Yes, they are.', 'Yes, it is.', 'Yes, he is.'], c: 1, say: 'Yes, it is.', hint: ['One book, not many books.', '', 'A book is a thing, not a man.'], good: 'One book is a thing: it. Yes, it is.' }
        ];
        let r = 0, blk = null, nodes = [];
        S.scene();
        const clear = () => { nodes.forEach(n => n.remove()); nodes = []; S.persons = {}; if (S.svg) S.svg.innerHTML = ''; };
        const counter = S.el(`<div class="chip gold" style="left:1160px;top:34px;font-size:22px"></div>`);
        const pager = pagerButtons(S, 1210, 690, () => load(Math.max(0, r - 1)), () => load(Math.min(R.length - 1, r + 1)), 'Next question ▶');
        function load(i) {
          r = i; clear(); FE.setLevel(0, true);
          const d = R[i]; const mark = S.root.children.length;
          counter.innerHTML = T(`Question ${i + 1} of 4`);
          d.pic(S);
          const bub = S.bubble(d.q, 640, 140, { cls: 'q', tail: 60 });
          const cx = S.el(`<div class="chip cream" style="left:640px;top:260px;font-size:24px">${T(d.ctx)}</div>`);
          blk = choiceBlock(S, { x: 700, y: 340, w: 640, options: d.opts, correct: d.c, good: d.good, hints: d.hint, onGood: () => { S.sayNow(d.say, { tone: 's' }).catch(x => { if (x !== CANCEL) console.error(x); }); say.classList.remove('hidden-lv'); } });
          const say = S.turn('Now say it aloud: ' + d.say, 700, 640); say.classList.add('hidden-lv');
          nodes = Array.from(S.root.children).slice(mark);
          S.say(d.q, { tone: 'q' }).catch(x => { if (x !== CANCEL) console.error(x); });
        }
        S.levels = 1; S.revLabels = ['Show the answer'];
        S.onLevel = (n) => { if (!blk) return; if (n) blk.pick(R[r].c); else blk.reset(); };
        S.play = async () => { load(0); };
      }
    },
    {
      id: '3.9', title: 'Ask your own questions', sec: 50, es: 'Elige un objeto o una persona de la imagen y haz dos preguntas con Is… o Are…. Con «Support On» tienes tarjetas de ayuda; con «Support Off» las escondes.',
      build(S) {
        S.supportable = true;
        S.add(A.obj.desk(300, 540, 1000, 80));
        S.add(A.obj.bag(430, 610, 1.5, '#2f6fd8', '#1a3f8c')); S.add(A.obj.books(660, 612, 1.5)); S.add(A.obj.phone(1000, 612, 1.6));
        S.add(`<g transform="translate(1050,455)"><circle r="40" fill="#f4b942" stroke="#a8730c" stroke-width="4"/><text y="9" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="23" fill="#14173f">NEW</text></g>`);
        S.fact('The bag is blue.', 330, 640, {}); S.fact('The books are on the desk.', 600, 650, {}); S.fact('The phone is new.', 930, 640, {});
        const nora = stand(S, 'nora', 130, { s: 0.6, pose: 'present', look: [5, 0] });
        const prompts = ['Ask about the bag.', 'Ask about the books.', 'Ask about the phone.', 'Ask about Nora.'];
        let pi = 0;
        const pr = S.el(`<div class="chip gold" style="left:360px;top:130px;font-size:34px"></div>`);
        const frames = S.el(`<div style="left:360px;top:210px;display:flex;gap:16px;flex-wrap:wrap;width:900px"><span class="chip indigo" style="font-size:34px">${T('Is ___ ___ ?')}</span><span class="chip indigo" style="font-size:34px">${T('Are ___ ___ ?')}</span></div>`);
        const bank = S.el(`<div style="left:360px;top:290px;display:flex;gap:10px;flex-wrap:wrap;width:960px">${['the bag', 'the books', 'the phone', 'she', 'blue', 'new', 'on the desk', 'a teacher'].map(w => `<span class="chip cream" style="font-size:28px">${T(w)}</span>`).join('')}</div>`);
        const ex = modelChip(S, 'Is the bag blue?', 360, 380, { cls: 'sm g', tone: 'q' }), ex2 = modelChip(S, 'Yes, it is.', 760, 380, { cls: 'sm', tone: 's' });
        S.reg(ex, 1); S.reg(ex2, 2);
        const next = S.el(`<button class="btn gold sm" style="left:1250px;top:136px">Next prompt ▶</button>`);
        const setP = () => { pr.innerHTML = T(prompts[pi]); };
        next.onclick = () => { pi = (pi + 1) % prompts.length; setP(); Aud.sfx('card'); };
        S.onSupport = () => { frames.style.display = bank.style.display = CFG.support ? '' : 'none'; };
        S.levels = 2; S.revLabels = ['Show an example question', 'Show the answer']; S.sayAt(1, 'Is the bag blue?', { tone: 'q' }); S.sayAt(2, 'Yes, it is.', { tone: 's' });
        setP(); S.onSupport();
        S.play = async () => {
          await S.sleep(500); await S.say('Choose a picture. | Ask two questions.', { who: nora });
          await S.say('Another learner answers.', { who: nora });
        };
      }
    }
  ]
};
