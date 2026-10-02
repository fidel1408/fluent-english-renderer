/* ============================================================
   SECTION 8 — TEN-QUESTION CHECK (07:00)
   exactly ten four-option items, one point each, one correct answer each
   ============================================================ */
const ITEMS = [
  { n: 1, stem: '“You are ready.” Make a yes/no question with be.', speak: 'You are ready. Make a yes no question with be.', opts: ['Do you are ready?', 'Are you ready?', 'Are ready you?', 'Is you ready?'], key: 'B', ex: 'Be goes before the subject: Are you ready?', say: 'Are you ready?', ext: 'Say the question. Then ask a partner: “Are you a student?”', pic: () => `<g transform="translate(300,300)">${A.icon.person(0, 0, 3.4, '#fff6e5')}</g>` },
  { n: 2, stem: '___ she a teacher?', speak: 'Blank, she a teacher?', opts: ['Am', 'Are', 'Is', 'Do'], key: 'C', ex: 'She goes with is: Is she a teacher?', say: 'Is she a teacher?', ext: 'Ask your own question with is and she or he.', fact: 'Nora (she): a teacher.', who: ['nora'] },
  { n: 3, stem: '___ they at home?', speak: 'Blank, they at home?', opts: ['Is', 'Am', 'Do', 'Are'], key: 'D', ex: 'They goes with are: Are they at home?', say: 'Are they at home?', ext: 'Ask your own question with are and they.', fact: 'Alex and Sam: at home.', who: ['alex', 'sam'], house: true },
  { n: 4, stem: '___ I in the right room?', speak: 'Blank, I in the right room?', opts: ['Am', 'Is', 'Are', 'Do'], key: 'A', ex: 'I goes with am: Am I in the right room?', say: 'Am I in the right room?', ext: 'Say it. Then say: Am I late?', door: true, fact: 'My class: Room 12.' },
  { n: 5, stem: '“Are you a student?” One learner answers yes about themselves.', speak: 'Are you a student? One learner answers yes about themselves.', opts: ['Yes, you are.', 'Yes, he is.', 'Yes, I am.', 'Yes, I’m.'], key: 'C', ex: 'One learner speaks about themselves: I. A short yes answer ends with am: Yes, I am. “Yes, I’m.” is not a complete short answer.', say: 'Yes, I am.', ext: 'Ask a partner: “Are you a student?” and answer: Yes, I am.', self: true },
  { n: 6, stem: '“Is he ready?” His information card says he is not ready.', speak: 'Is he ready? His information card says he is not ready.', opts: ['No, he isn’t.', 'Yes, he is.', 'No, he aren’t.', 'No, she isn’t.'], key: 'A', ex: 'He goes with is, and the card says not ready: No, he isn’t. (No, he’s not. would also be correct, but it is not listed.)', say: 'No, he isn’t.', ext: 'Say the answer. Then say: No, he’s not.', fact: 'Sam (he): not ready.', who: ['sam'], no: true },
  { n: 7, stem: '“Is the bag blue?” The bag is blue.', speak: 'Is the bag blue? The bag is blue.', opts: ['Yes, he is.', 'No, it isn’t.', 'Yes, it’s.', 'Yes, it is.'], key: 'D', ex: 'The bag is a thing and it is blue: Yes, it is. A short yes answer cannot end in it’s.', say: 'Yes, it is.', ext: 'Ask: “Is the bag blue?” and answer: Yes, it is.', bag: true },
  { n: 8, stem: '“Are the books on the desk?” They are visibly on a shelf.', speak: 'Are the books on the desk? They are on a shelf.', opts: ['Yes, they are.', 'No, they aren’t.', 'No, it isn’t.', 'Yes, we are.'], key: 'B', ex: 'The books are not on the desk. Books: they. No, they aren’t.', say: 'No, they aren’t.', ext: 'Add a true sentence: They’re on the shelf.', shelf: true },
  { n: 9, stem: 'Alex asks Maya, “Am I late?” Alex is explicitly on time. Maya answers.', speak: 'Alex asks Maya, am I late? Alex is on time. Maya answers.', opts: ['No, you aren’t.', 'No, I’m not.', 'Yes, you are.', 'No, we aren’t.'], key: 'A', ex: 'Maya talks to Alex about Alex, so she says you. Alex is on time: No, you aren’t.', say: 'No, you aren’t.', ext: 'Say: No, you aren’t. Then change places and ask: Am I late?', fact: 'Alex: on time.', who: ['alex', 'maya'], no: true },
  { n: 10, stem: 'A teacher asks two learners, “Are you ready?” Both are ready and answer together.', speak: 'A teacher asks two learners, are you ready? Both are ready and answer together.', opts: ['Yes, I am.', 'Yes, you are.', 'Yes, they are.', 'Yes, we are.'], key: 'D', ex: 'Two learners answer about themselves together: we. Yes, we are.', say: 'Yes, we are.', ext: 'Say it together: Yes, we are.', fact: 'Both learners: ready.', who: ['nora', 'alex', 'maya'], group: true }
];

function itemPic(S, it) {
  S.scene();
  if (it.pic) { S.add(it.pic()); return; }
  if (it.who) {
    const xs = it.who.length === 1 ? [300] : it.who.length === 2 ? [200, 440] : [140, 340, 520];
    it.who.forEach((k, i) => stand(S, k, xs[i], { s: 0.5, y: 760, look: [i ? -3 : 3, 0] }));
    if (it.group) ringAt(S, 270, 330, 330, 440, 'dash');
    if (it.house) S.add(A.obj.house(330, 290, 1.2));
  }
  if (it.door) S.add(A.obj.door(300, 640, 1.05, '12'));
  if (it.bag) { S.add(A.obj.desk(40, 480, 520, 70)); S.add(A.obj.bag(300, 530, 1.9)); }
  if (it.shelf) { S.add(A.obj.shelf(60, 380, 460, true)); S.add(A.obj.desk(80, 560, 420, 60)); }
  if (it.self) S.add(`<g transform="translate(300,330)">${A.icon.person(0, 0, 3.4, '#fff6e5')}</g>`);
  if (it.fact) S.fact(it.fact, 40, 200, { style: 'font-size:23px' });
}

function scoreOf(answers, ids) {
  const items = ids.map(n => { const it = ITEMS[n - 1]; const ans = answers[n] || ''; return { n, answer: ans, key: it.key, ok: ans === it.key }; });
  return { score: items.filter(x => x.ok).length, items };
}

function itemStep(it) {
  return {
    id: '8.' + (it.n + 1), title: `Question ${it.n} of 10`, sec: 25, bg: 'night', music: 'off', quiet: true, veil: 0.2, es: 'Lee la pregunta y elige una opción. Las respuestas correctas se muestran solo después de enviar todas.',
    build(S) {
      const AS = ST.assess, sub = AS.submitted;
      S.noRevealMsg = sub ? '' : 'Answers stay hidden until you submit.';
      itemPic(S, it);
      const stem = S.paper(660, 120, 900, 0, { cls: '' });
      stem.style.fontSize = '36px'; stem.style.fontWeight = '700'; stem.style.fontFamily = 'var(--serif)'; stem.style.padding = '12px 26px';
      stem.innerHTML = T(it.stem);
      const modeTag = S.el(`<div class="chip ${AS.mode === 'class' ? 'gold' : 'cream'}" style="left:660px;top:50px;font-size:20px;padding:2px 14px">${AS.mode === 'class' ? 'Class activity · teacher enters the class’s choice' : 'Individual · this copy, this device'}</div>`);
      const wrap = S.el(`<div style="left:660px;top:290px;width:900px;display:flex;flex-direction:column;gap:8px"></div>`);
      const btns = it.opts.map((t, i) => {
        const L = 'ABCD'[i];
        const b = mk(`<button class="opt" style="font-size:28px;padding:5px 18px"><span class="k" style="flex:0 0 44px;height:44px;font-size:24px">${L}</span><span>${T(t)}</span></button>`);
        b.onclick = () => {
          if (AS.submitted) return;
          Aud.sfx('tick'); AS.answers[it.n] = L; saveSoon();
          btns.forEach((x, j) => x.classList.toggle('sel', j === i));
          note.textContent = `Answer ${L} saved. You can change it until you submit.`;
        };
        wrap.appendChild(b); return b;
      });
      const note = mk(`<div class="small" style="opacity:.9;font-size:20px;min-height:26px"></div>`); wrap.appendChild(note);
      const cur = AS.answers[it.n];
      if (cur) btns['ABCD'.indexOf(cur)].classList.add('sel');
      if (sub) {
        btns.forEach((b, i) => { const L = 'ABCD'[i]; b.disabled = true; b.classList.remove('sel'); if (L === it.key) b.classList.add('good'); else if (L === cur) b.classList.add('bad'); else b.classList.add('dim'); });
        const ok = cur === it.key;
        const ex = S.el(`<div class="fb ${ok ? 'good' : 'hint'}" style="left:660px;top:612px;width:820px;font-size:22px;padding:6px 14px">${T((ok ? 'Correct. ' : 'The answer is ' + it.key + '. ') + it.ex)}</div>`);
        const ext = S.el(`<div class="chip cream" style="left:660px;top:748px;font-size:19px;padding:2px 14px;max-width:900px;white-space:normal">${T('Speaking extension (optional): ' + it.ext)}</div>`);
        const rp = S.replayBtn(it.say, 1496, 626, { sm: true, tone: /\?$/.test(it.say) ? 'q' : 's' });
        note.textContent = '';
      } else {
        const rd = S.el(`<button class="btn ghost sm" style="left:1330px;top:56px">Read the choices aloud</button>`);
        rd.onclick = async () => { Aud.init(); const e = S.interrupt(); try { for (let i = 0; i < 4; i++) await S.say('ABCD'[i] + '. ' + it.opts[i].replace('___', 'blank'), { after: 250 }); } catch (x) { if (x !== CANCEL) console.error(x); } };
      }
      S.captureKeys = true;
      S.onKey = (e) => { const k = e.key.toUpperCase(); if ('ABCD'.includes(k) && k.length === 1 && !sub) btns['ABCD'.indexOf(k)].click(); };
      S.play = async () => { if (sub) return; await S.sleep(400); await S.say(it.speak, { tone: /\?/.test(it.speak) && it.n < 5 ? 'q' : 's' }); };
    }
  };
}

const CH8 = {
  n: 8, title: 'Ten-question check', min: 7, bg: 'night',
  steps: [
    {
      id: '8.1', title: 'The ten-question check', sec: 30, bg: 'night', music: 'off', quiet: true, es: 'Diez preguntas, cuatro opciones (A–D), un punto cada una. Las respuestas correctas se ocultan hasta enviar. Después podéis repetir las falladas. Elige si es una actividad de clase (el profesor introduce la respuesta de la clase) o individual.',
      build(S) {
        S.supportable = false; const AS = ST.assess;
        const box = S.paper(100, 190, 1400, 470, { cls: '' });
        box.style.display = 'flex'; box.style.gap = '30px'; box.style.alignItems = 'flex-start';
        const left = mk(`<div style="flex:0 0 560px"><div class="h2" style="font-size:34px">${T('Ten questions · one point each')}</div>
          <ul style="font-size:25px;line-height:1.3;margin:8px 0 0;padding-left:24px"><li>${T('Choose A, B, C or D.')}</li><li>${T('Correct answers stay hidden until you submit.')}</li><li>${T('Then you see a short explanation.')}</li><li>${T('You can retry the questions you missed.')}</li></ul></div>`);
        const right = mk(`<div style="flex:1"></div>`);
        box.append(left, right);
        const mk2 = (v, title, sub) => mk(`<button class="opt" style="font-size:28px;margin-bottom:14px"><span class="k">${v === 'class' ? 'C' : 'I'}</span><span>${esc(title)}<br><span style="font-size:20px;font-family:var(--sans);font-weight:500">${esc(sub)}</span></span></button>`);
        const bc = mk2('class', 'Class activity', 'The teacher clicks the class’s shared choice. Score label: “class activity score”.');
        const bi = mk2('individual', 'Individual', 'Used in your own copy of the lesson. Score label: “individual score (this device only)”.');
        right.append(bc, bi);
        const sync = () => { bc.classList.toggle('sel', AS.mode === 'class'); bi.classList.toggle('sel', AS.mode === 'individual'); const locked = Object.keys(AS.answers).length > 0; bc.disabled = bi.disabled = locked; };
        bc.onclick = () => { AS.mode = 'class'; sync(); saveSoon(); };
        bi.onclick = () => { AS.mode = 'individual'; sync(); saveSoon(); };
        sync();
        S.el(`<div class="note-card" style="left:100px;top:690px;width:1400px;font-size:22px">${T('A shared teacher-entered score describes the class activity. It is not any one learner’s mastery.')}</div>`);
        S.play = async () => { await S.sleep(400); await S.say('Ten questions. | One point for each.'); await S.say('Correct answers stay hidden until you submit.'); };
      }
    },
    ...ITEMS.map(itemStep),
    {
      id: '8.12', title: 'Submit and review', sec: 80, bg: 'night', music: 'off', quiet: true, es: 'Envía las respuestas. Verás la puntuación del primer intento, la explicación de cada pregunta y podrás repetir las falladas.',
      build(S) {
        const AS = ST.assess; S.noRevealMsg = 'Nothing to reveal here.';
        const panel = S.paper(120, 125, 1360, 590, {}); panel.style.overflow = 'auto';
        const label = () => ST.assess.mode === 'class' ? 'Class activity score (teacher-entered shared answers)' : 'Individual score (this copy, this device only)';
        function render() {
          if (!AS.submitted) {
            const n = Object.keys(AS.answers).length;
            panel.innerHTML = `<div class="h2">${T('Ready to submit?')}</div><div style="display:flex;gap:10px;margin:14px 0;flex-wrap:wrap">${ITEMS.map(it => `<span class="chip ${AS.answers[it.n] ? 'gold' : 'indigo'}" style="font-size:24px">${it.n}: ${AS.answers[it.n] || '–'}</span>`).join('')}</div><p style="font-size:26px">${n} of 10 answered. Unanswered questions score 0.</p>`;
            const b = mk(`<button class="btn gold" style="font-size:26px">Submit answers</button>`);
            b.onclick = () => { AS.first = scoreOf(AS.answers, ITEMS.map(i => i.n)); AS.submitted = true; Store.save(); Aud.sfx('reveal'); Fx.burst(800, 300, 24); render(); S.say(`Your first attempt score is ${AS.first.score} out of 10.`).catch(() => { }); };
            panel.appendChild(b);
          } else {
            const f = AS.first;
            const missed = f.items.filter(x => !x.ok);
            panel.innerHTML = `<div class="tag">${esc(label())}</div><div class="h2" style="font-size:54px">${T('First attempt: ' + f.score + ' / 10')}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">${f.items.map(x => `<span class="chip ${x.ok ? '' : 'coral'}" style="font-size:22px">${x.n} ${x.ok ? '✓' : '✗'}</span>`).join('')}</div>
              <div style="font-size:23px;line-height:1.3">${missed.length ? '<div class="tag">' + T('Questions to check') + '</div>' : ''}${missed.map(x => `<div style="margin:6px 0"><b>${x.n}.</b> ${T('Answer ' + x.key + ' — ' + ITEMS[x.n - 1].ex)}</div>`).join('')}</div>
              <p style="font-size:23px;margin-top:10px"><b>${T('Optional speaking extension:')}</b> ${T('say a correct sentence aloud, then ask your own question like it.')}</p>`;
            const row = mk(`<div class="acts" style="display:flex;gap:12px;margin-top:10px"></div>`);
            if (missed.length) { const r = mk(`<button class="btn coral">Retry ${missed.length} missed question${missed.length > 1 ? 's' : ''} ▶</button>`); r.onclick = () => FE.enter(ST.ch, ST.st + 1); row.appendChild(r); }
            else row.appendChild(mk(`<span class="chip">${T('No questions to retry. Well done!')}</span>`));
            const rs = mk(`<button class="btn ghost">Open results & export</button>`); rs.onclick = () => UI.results(); row.appendChild(rs);
            panel.appendChild(row);
          }
        }
        S.render = render; render();
        S.play = async () => { await S.sleep(300); await S.say(AS.submitted ? 'Here is your first attempt.' : 'Check your answers. Then submit.'); };
      }
    },
    {
      id: '8.13', title: 'Retry the missed questions', sec: 60, bg: 'night', music: 'off', quiet: true, es: 'Repite solo las preguntas falladas. La puntuación del primer intento no cambia: el reintento se guarda aparte.',
      build(S) {
        const AS = ST.assess; S.noRevealMsg = 'Nothing to reveal here.';
        const panel = S.paper(120, 125, 1360, 600, {}); panel.style.overflow = 'auto';
        let ids = AS.first ? AS.first.items.filter(x => !x.ok).map(x => x.n) : [];
        function render() {
          if (!AS.submitted) { panel.innerHTML = `<div class="h2">${T('Submit the first attempt first.')}</div>`; return; }
          if (!ids.length) { panel.innerHTML = `<div class="h2">${T('No missed questions. Great work!')}</div>`; return; }
          if (AS.retry) {
            const r = AS.retry;
            panel.innerHTML = `<div class="tag">${esc(ST.assess.mode === 'class' ? 'Class activity score (teacher-entered shared answers)' : 'Individual score (this copy, this device only)')}</div>
              <div class="h2" style="font-size:44px">${T('First attempt: ' + AS.first.score + ' / 10')} <span style="font-size:24px">${T('(unchanged)')}</span></div>
              <div class="h2" style="font-size:44px;color:var(--turq-d)">${T('Retry: ' + r.score + ' / ' + r.outOf + ' of the missed questions')}</div>
              <p style="font-size:24px">${T('After retry (combined): ' + (AS.first.score + r.score) + ' / 10. The first-attempt and retry scores are stored separately.')}</p>
              <div style="font-size:22px;line-height:1.3">${r.items.map(x => `<div><b>${x.n}.</b> ${x.ok ? '✓' : '✗'} ${T((x.ok ? 'Correct' : 'Answer ' + x.key) + ' — ' + ITEMS[x.n - 1].ex)}</div>`).join('')}</div>`;
            const b = mk(`<button class="btn ghost" style="margin-top:12px">Try the retry again</button>`); b.onclick = () => { AS.retry = null; AS.retryAnswers = {}; render(); }; panel.appendChild(b);
            return;
          }
          panel.innerHTML = `<div class="h2">${T('Retry: choose again')}</div>`;
          ids.forEach(n => {
            const it = ITEMS[n - 1];
            const blk = mk(`<div style="margin:10px 0;padding:10px 14px;background:rgba(20,23,63,.08);border-radius:16px"><div style="font-size:26px;font-weight:700;font-family:var(--serif)">${n}. ${T(it.stem)}</div><div class="rb" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px"></div></div>`);
            const rb = blk.querySelector('.rb');
            it.opts.forEach((t, i) => { const L = 'ABCD'[i]; const b = mk(`<button class="chip cream" style="font-size:24px;border:3px solid transparent"><b>${L}</b> ${T(t)}</button>`); if (AS.retryAnswers[n] === L) b.style.borderColor = 'var(--gold)'; b.onclick = () => { AS.retryAnswers[n] = L; Aud.sfx('tick'); [...rb.children].forEach(x => x.style.borderColor = 'transparent'); b.style.borderColor = 'var(--gold)'; saveSoon(); }; rb.appendChild(b); });
            panel.appendChild(blk);
          });
          const sb = mk(`<button class="btn gold">Submit retry</button>`);
          sb.onclick = () => { const r = scoreOf(AS.retryAnswers, ids); AS.retry = { score: r.score, outOf: ids.length, items: r.items }; AS.retried = true; Store.save(); Aud.sfx('reveal'); Fx.burst(800, 300, 20); render(); };
          panel.appendChild(sb);
        }
        render();
        S.play = async () => { await S.sleep(300); await S.say(ids.length ? 'Try the missed questions again.' : 'There is nothing to retry.'); };
      }
    }
  ]
};
