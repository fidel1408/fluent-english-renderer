/* ============================================================
   SECTION 4 — NO, WITH THE RIGHT NEGATIVE (07:00)
   ============================================================ */
function shortNo(o) {
  return {
    id: o.id, title: o.title, sec: 50, bg: 'classroom', es: o.es, music: 'bed',
    build(S) {
      const who = o.pic(S);
      S.bubble(o.q, 470, 150, { cls: 'q', tail: 60 });
      const turn = S.turn('Your turn: answer with No.', 1030, 650); turn.classList.add('hidden-lv');
      const a1 = modelChip(S, o.ans, 1000, 300, { cls: 'n', tone: 's' });
      const a2 = modelChip(S, o.ans + ' ' + o.add, 1000, 420, { cls: 'sm', tone: 's' });
      const ev = S.el(`<div class="fact no" style="left:1000px;top:540px;font-size:24px">${T(o.ev)}</div>`);
      S.reg(a1, 1); S.reg(a2, 2); S.reg(ev, 2);
      S.levels = 2; S.revLabels = ['Show the negative answer', 'Add a true sentence'];
      S.sayAt(1, o.ans, { tone: 's' }); S.sayAt(2, o.ans + ' ' + o.add, { tone: 's' });
      S.onLevel = (n) => { if (n) { turn.classList.add('hidden-lv'); Fx.burst(1200, 350, 12, ['#ff9a8d', '#ffd978', '#fff6e5']); } };
      S.play = async () => { await S.sleep(250); await S.say(o.q, { tone: 'q', who }); turn.classList.remove('hidden-lv'); };
    }
  };
}

const NEG = [
  ['I', ['No, I’m not.', 'No, I am not.'], null],
  ['you', ['No, you aren’t.', 'No, you’re not.', 'No, you are not.']],
  ['he', ['No, he isn’t.', 'No, he’s not.', 'No, he is not.']],
  ['she', ['No, she isn’t.', 'No, she’s not.', 'No, she is not.']],
  ['it', ['No, it isn’t.', 'No, it’s not.', 'No, it is not.']],
  ['we', ['No, we aren’t.', 'No, we’re not.', 'No, we are not.']],
  ['they', ['No, they aren’t.', 'No, they’re not.', 'No, they are not.']]
];

const CH4 = {
  n: 4, title: 'No, with the right negative', min: 7, bg: 'classroom',
  steps: [
    {
      id: '4.1', title: 'No + pronoun + be + not', sec: 60, es: 'Respuesta corta negativa: No + pronombre + be + not. Se puede contraer: is not → isn’t, o it is → it’s not. Las tres formas son correctas.',
      build(S) {
        const nora = stand(S, 'nora', 190, { pose: 'present', look: [5, 0] });
        const b = S.board(340, 120, 960, 320);
        const q = mk(`<div style="font-family:var(--serif);font-weight:700;font-size:42px;margin-bottom:8px">${T('Is it a book?')}</div>`); b.appendChild(q);
        const lab = mk(`<div class="tag" style="font-size:22px">${T('Full form')}</div>`); b.appendChild(lab);
        const full = [tk('No,', 'no', 'y'), tk('it', 'subj', 's'), tk('is', 'be', 'b'), tk('not', 'not', 'n'), tk('.', 'punct', 'dot')];
        const c1 = [tk('No,', 'no', 'y'), tk('it', 'subj', 's'), tk('isn’t', 'not', 'b'), tk('.', 'punct', 'dot')];
        const c2 = [tk('No,', 'no', 'y'), tk('it’s', 'subj', 's'), tk('not', 'not', 'n'), tk('.', 'punct', 'dot')];
        const sent = S.sentence(b, full, { size: 88 });
        const chips = S.el(`<div class="lv hidden-lv" style="left:100px;top:470px;width:1400px;display:flex;gap:16px;justify-content:center;flex-wrap:nowrap"></div>`);
        ['No, it is not.', 'No, it isn’t.', 'No, it’s not.'].forEach(t => { const c = modelChip(S, t, 0, 0, { cls: 'sm n', tone: 's', style: 'position:static' }); c.style.position = 'static'; chips.appendChild(c); });
        const ok = S.el(`<div class="chip lv hidden-lv" style="left:560px;top:620px;font-size:30px">${T('All three are correct.')}</div>`);
        S.play = async () => {
          await S.sleep(250);
          await S.say('Is it a book?', { tone: 'q', who: nora });
          await S.say('No, it is not.', { tone: 's', who: nora, after: 100 });
          lab.innerHTML = T('Short form: is + not'); Aud.sfx('move'); await sent.morph(c1, 1200, S.e);
          await S.say('No, it isn’t.', { tone: 's', who: nora, after: 100 });
          lab.innerHTML = T('Short form: it + is'); Aud.sfx('move'); await sent.morph(c2, 1200, S.e);
          await S.say('No, it’s not.', { tone: 's', who: nora });
          chips.classList.remove('hidden-lv'); ok.classList.remove('hidden-lv'); Aud.sfx('reveal');
          await S.say('All three are correct.', { who: nora });
        };
      }
    },
    {
      id: '4.2', title: 'Seven negative answers', sec: 60, es: 'Pulsa cada burbuja para ver las formas correctas. Con I decimos «I’m not».',
      build(S) {
        const X = [150, 350, 560, 800, 1040, 1250, 1450], Y = [650, 580, 530, 510, 530, 580, 650];
        const card = S.paper(330, 125, 940, 330, { cls: 'tilt1' });
        card.style.display = 'flex'; card.style.flexDirection = 'column'; card.style.gap = '10px'; card.style.alignItems = 'center'; card.style.justifyContent = 'center';
        const hd = mk(`<div class="tag" style="font-size:22px"></div>`); card.appendChild(hd);
        const list = mk(`<div style="display:flex;flex-direction:column;gap:10px;align-items:center"></div>`); card.appendChild(list);
        const note = mk(`<div style="font-size:24px;font-weight:600;color:var(--coral-d);min-height:30px"></div>`); card.appendChild(note);
        const orbs = NEG.map((n, i) => {
          const o = S.el(`<button class="orb" style="left:${X[i] - 80}px;top:${Y[i] - 80}px;width:160px;height:160px;font-size:40px" aria-label="${n[0]}"><span>${T(n[0])}</span></button>`);
          o.onclick = () => show(i, true); return o;
        });
        function render(i) {
          const n = NEG[i]; hd.innerHTML = T(`Short answers with ${n[0]}`);
          list.innerHTML = '';
          n[1].forEach(t => { const c = modelChip(S, t, 0, 0, { cls: 'sm n', tone: 's' }); c.style.position = 'static'; list.appendChild(c); });
          note.innerHTML = n[0] === 'I' ? T('For I, we say I’m not.') : T('Full forms are also correct.');
          orbs.forEach((o, j) => o.classList.toggle('on', j === i));
        }
        async function show(i, user) { const e = user ? S.interrupt() : S.e; render(i); Aud.sfx('tick'); await S.say(NEG[i][1][0], { tone: 's' }); }
        S.levels = 7; S.revLabels = NEG.map(() => 'Next pronoun');
        S.onLevel = (n, p, silent) => { if (silent || n === 0) { orbs.forEach(o => o.classList.remove('on')); list.innerHTML = ''; hd.innerHTML = T('Choose a pronoun'); note.innerHTML = ''; return; } show(n - 1, true).catch(x => { if (x !== CANCEL) console.error(x); }); };
        S.play = async () => {
          hd.innerHTML = T('Choose a pronoun');
          await S.sleep(250);
          for (let i = 0; i < NEG.length; i++) { await show(i, false); await S.sleep(250); }
        };
      }
    },
    shortNo({
      id: '4.3', title: 'A false statement: the bag', q: 'Is it red?', ans: 'No, it isn’t.', add: 'It’s blue.', ev: 'Evidence: the bag is blue.',
      es: 'La mochila es azul, así que la respuesta es negativa. Como la imagen muestra que es azul, podemos añadir: «It’s blue.»',
      pic(S) { const n = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] }); S.add(A.obj.desk(430, 560, 520, 70)); S.add(A.obj.bag(690, 612, 1.9)); S.fact('The bag is blue.', 580, 660, {}); return n; }
    }),
    shortNo({
      id: '4.4', title: 'A false statement: the phone', q: 'Is it a book?', ans: 'No, it isn’t.', add: 'It’s a phone.', ev: 'Evidence: there is one phone.',
      es: 'Hay un teléfono, no un libro. La respuesta es «No, it isn’t.» Podemos añadir «It’s a phone.» porque lo vemos.',
      pic(S) { const n = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] }); S.add(A.obj.desk(430, 560, 520, 70)); S.add(A.obj.phone(690, 612, 2.0)); S.fact('One phone.', 640, 665, {}); return n; }
    }),
    shortNo({
      id: '4.5', title: 'A false statement: in class', q: 'Are they at home?', ans: 'No, they aren’t.', add: 'They’re in class.', ev: 'Evidence: Alex and Sam are in class.',
      es: 'La etiqueta dice que Alex y Sam están en clase. Respuesta: «No, they aren’t.» Y podemos añadir «They’re in class.»',
      pic(S) { const n = stand(S, 'nora', 190, { pose: 'present', look: [5, 0] }); stand(S, 'alex', 600, { look: [-3, 0] }); stand(S, 'sam', 820, { look: [-3, 0] }); S.fact('Alex and Sam: in class', 560, 680, {}); return n; }
    }),
    shortNo({
      id: '4.6', title: 'A false statement: Maya', q: 'Is she a teacher?', ans: 'No, she isn’t.', add: 'She’s a doctor.', ev: 'Evidence: Maya is a doctor.',
      es: 'La etiqueta dice que Maya es doctora. Respuesta: «No, she isn’t.» Podemos añadir «She’s a doctor.»',
      pic(S) { const n = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] }); stand(S, 'maya', 730, { look: [-3, 0], job: 'a doctor' }); return n; }
    }),
    {
      id: '4.7', title: 'Do not guess', sec: 40, es: 'Cuidado: «No» no nos dice qué es. La tarjeta dice que no es un teléfono, pero no vemos qué es. No digas «It’s a book» sin evidencia.',
      build(S) {
        const nora = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] });
        S.add(A.obj.desk(430, 560, 520, 70));
        S.add(`<g transform="translate(690,612)"><ellipse cx="0" cy="6" rx="130" ry="12" fill="#000" opacity=".25" filter="url(#blur3)"/><path d="M-120,0 Q-110,-70 -50,-110 Q0,-140 50,-110 Q110,-70 120,0 Q60,12 0,8 Q-60,12 -120,0Z" fill="#f6e7c8" stroke="#cdb487" stroke-width="3"/><path d="M-60,-20 Q-30,-70 -10,-100 M40,-10 Q50,-60 30,-100" stroke="#cdb487" stroke-width="3" fill="none"/><text y="-30" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="56" fill="#a8730c">?</text></g>`);
        S.fact('Information: it is not a phone.', 470, 665, { cls: 'no' });
        S.bubble('Is it a phone?', 470, 150, { cls: 'q', tail: 60 });
        const a1 = modelChip(S, 'No, it isn’t.', 1010, 300, { cls: 'n', tone: 's' });
        const x = S.el(`<div class="paper lv hidden-lv" style="left:1000px;top:430px;width:500px;border:4px solid var(--coral)"><span class="chip coral" style="font-size:30px">✗</span> <span class="big" style="font-size:40px;text-decoration:line-through;text-decoration-color:var(--coral-d)">${T('It’s a book.')}</span><div class="small" style="margin-top:8px">${T('We cannot see it. Do not guess.')}</div></div>`);
        S.reg(a1, 1); S.reg(x, 2); S.levels = 2; S.revLabels = ['Show the answer', 'Careful: do not guess']; S.sayAt(1, 'No, it isn’t.', { tone: 's' }); S.sayAt(2, 'We cannot see it. | Do not guess.');
        S.play = async () => { await S.sleep(250); await S.say('Is it a phone?', { tone: 'q', who: nora }); await S.say('The information card says: | it is not a phone.', { who: nora }); };
      }
    },
    {
      id: '4.8', title: 'Which answers are acceptable?', sec: 60, es: 'Marca todas las respuestas negativas aceptables. Las contracciones y la forma completa son correctas. «No, he not» y «Yes, he isn’t» no lo son.',
      build(S) {
        const nora = stand(S, 'nora', 200, { pose: 'present', look: [5, 0] });
        stand(S, 'sam', 560, { look: [-3, 0] }); S.fact('Sam: on time', 490, 700, {});
        S.bubble('Is he late?', 470, 140, { cls: 'q', tail: 60 });
        const OPT = [['No, he isn’t.', 1], ['No, he’s not.', 1], ['No, he is not.', 1], ['No, he not.', 0], ['Yes, he isn’t.', 0]];
        const sel = new Set();
        const wrap = S.el(`<div style="left:840px;top:130px;width:700px;display:flex;flex-direction:column;gap:12px"></div>`);
        const btns = OPT.map((o, i) => { const b = mk(`<button class="opt" style="font-size:32px;padding:8px 20px"><span class="k">${'ABCDE'[i]}</span><span>${T(o[0])}</span></button>`); b.onclick = () => { Aud.sfx('tick'); if (sel.has(i)) { sel.delete(i); b.classList.remove('sel'); } else { sel.add(i); b.classList.add('sel'); } }; wrap.appendChild(b); return b; });
        const chk = mk(`<button class="btn gold">Check answers</button>`); const fb = mk(`<div class="fb hint" style="display:none"></div>`); wrap.append(chk, fb);
        function check() {
          let ok = true;
          btns.forEach((b, i) => { const good = !!OPT[i][1], on = sel.has(i); b.classList.remove('good', 'bad', 'sel'); if (good) b.classList.add('good'); else b.classList.add('bad', 'dim'); if (good !== on) ok = false; });
          fb.style.display = 'block'; fb.className = 'fb ' + (ok ? 'good' : 'hint');
          fb.innerHTML = T((ok ? 'Yes! ' : 'Look at the green and red answers. ') + 'A, B and C are all acceptable. D has no is. E says Yes, but he is not late.');
          Aud.sfx(ok ? 'good' : 'soft');
        }
        function reset() { sel.clear(); btns.forEach(b => b.className = 'opt'); fb.style.display = 'none'; }
        chk.onclick = check;
        S.levels = 1; S.revLabels = ['Show which are acceptable']; S.onLevel = (n) => { if (n) { OPT.forEach((o, i) => { if (o[1]) sel.add(i); else sel.delete(i); }); check(); } else reset(); };
        S.play = async () => { await S.sleep(250); await S.say('Is he late?', { tone: 'q', who: nora }); await S.say('Sam is on time. | Choose all the acceptable answers.', { who: nora }); };
      }
    }
  ]
};
