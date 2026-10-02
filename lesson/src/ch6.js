/* ============================================================
   SECTION 6 — ASK ABOUT THE SCENE (08:00)
   ============================================================ */
const newTag = (x, y, r = 40) => `<g transform="translate(${x},${y})"><circle r="${r}" fill="#f4b942" stroke="#a8730c" stroke-width="4"/><text y="${r * 0.22}" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="${r * 0.58}" fill="#14173f">NEW</text></g>`;

/* A scene with explicit fact cards, a subject chooser, support cards and reveal levels */
function sceneAct(o) {
  return {
    id: o.id, title: o.title, sec: 110, bg: o.bg || 'classroom', es: o.es, music: 'bed', supportDefault: true,
    build(S) {
      S.supportable = true;
      S.scene();
      o.draw(S);
      (o.vocab || []).forEach(v => S.el(`<div class="vl" style="left:${v[0]}px;top:${v[1]}px">${T(v[2])}</div>`));
      let cur = -1;
      const used = new Set();
      const row = S.el(`<div style="left:40px;top:186px;width:1060px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;background:rgba(15,19,71,.62);border-radius:20px;padding:6px 14px"><span class="tag" style="margin-right:6px">${T('1 · Choose a subject')}</span></div>`);
      const chips = o.subjects.map((s, i) => { const b = mk(`<button class="chip indigo" style="font-size:25px;padding:4px 16px">${T(s.label)}</button>`); b.onclick = () => choose(i, true); row.appendChild(b); return b; });
      const ring = S.el(`<div class="ring hidden-lv lv" style="left:0;top:0;width:10px;height:10px"></div>`);
      const phaseChip = S.el(`<div class="chip gold" style="left:1120px;top:186px;font-size:24px;padding:2px 16px"></div>`);
      const sup = S.el(`<div class="note-card" style="left:1120px;top:236px;width:440px;font-size:22px;padding:8px 14px"></div>`);
      const wrapSt = 'white-space:normal;max-width:440px;font-size:28px;padding:6px 12px 10px 18px';
      const exQ = modelChip(S, '', 1120, 440, { cls: 'sm g', tone: 'q', style: wrapSt }), exA = modelChip(S, '', 1120, 552, { cls: 'sm', tone: 's', style: wrapSt });
      const ev = S.el(`<div class="fact lv hidden-lv" style="left:1120px;top:656px;font-size:19px;width:440px"></div>`);
      const note = ev;
      const nextB = mk(`<button class="btn gold sm" style="display:none"></button>`);
      const vocB = mk(`<button class="btn ghost sm" style="display:none"></button>`);
      row.append(nextB, vocB);
      S.reg(exQ, 1); S.reg(exA, 2); S.reg(ev, 2);
      const PH = ['1 · Choose a subject', '2 · Ask · 3 · Answer', '4 · One possible example'];
      const setPh = (n) => { phaseChip.innerHTML = T(PH[n <= 0 ? 0 : n === 1 ? 1 : 2]); };
      function renderSup() {
        const s = o.subjects[cur];
        if (!CFG.support) { sup.style.display = 'none'; return; }
        sup.style.display = '';
        const plural = s && s.plural;
        sup.innerHTML = `<div class="tag">${T('Support')}</div>${T(plural ? 'Are + subject + ... ?' : 'Is + subject + ... ?')}${s ? '  ' + T('Pronoun: ' + s.pron) : ''}<div style="margin-top:4px;display:flex;gap:5px;flex-wrap:wrap">${o.bank.map(w => `<span class="chip cream" style="font-size:16px;padding:0 9px">${T(w)}</span>`).join('')}</div>`;
      }
      function choose(i, user) {
        if (user) S.interrupt();
        cur = i; used.add(i); Aud.sfx('tick');
        const s = o.subjects[i], h = s.hot;
        ring.style.cssText = `left:${h[0]}px;top:${h[1]}px;width:${h[2]}px;height:${h[3]}px;border-radius:${Math.min(h[2], h[3]) > 200 ? 40 : 50}px`;
        ring.classList.remove('hidden-lv');
        chips.forEach((c, j) => { c.style.background = j === i ? 'var(--gold)' : ''; c.style.color = j === i ? 'var(--ink)' : ''; });
        FE.setLevel(0, true);
        exQ.querySelector('span').innerHTML = T(s.q); exA.querySelector('span').innerHTML = T(s.a);
        exQ.querySelectorAll('button')[0].onclick = () => FE.speakOne(s.q, 'q'); exA.querySelectorAll('button')[0].onclick = () => FE.speakOne(s.a, 's');
        ev.innerHTML = T(s.ev) + `<div style="font-size:15px;opacity:.8;margin-top:2px">${T('One possible question. Other questions are fine too.')}</div>`;
        S.sayAtMap = { 1: { text: s.q, o: { tone: 'q' } }, 2: { text: s.a, o: { tone: 's' } } };
        setPh(1); renderSup();
        nextB.style.display = vocB.style.display = '';
      }
      nextB.innerHTML = 'Next subject ▶';
      nextB.onclick = () => { let k = (cur + 1) % o.subjects.length, n = 0; while (used.has(k) && n++ < o.subjects.length) k = (k + 1) % o.subjects.length; choose(k, true); };
      vocB.innerHTML = 'Vocabulary labels';
      vocB.onclick = () => { CFG.vocab = !CFG.vocab; UI.applyCfg(); Store.save(); };
      S.onSupport = () => renderSup();
      S.levels = 2; S.revLabels = ['Show an example question', 'Show the answer'];
      const base = S.onLevel;
      S.onLevel = (n, pv, silent) => { if (cur < 0) { if (n === 0) return; choose(0, false); FE.setLevel(n, true); return; } setPh(n === 0 ? 1 : 3); if (n === 2) Fx.burst(1300, 560, 14); };
      sup.innerHTML = `<div class="tag">${T('Support')}</div>${T('Choose a subject first.')}`;
      if (!CFG.support) sup.style.display = 'none';
      setPh(0);
      S.play = async () => {
        await S.sleep(250);
        await S.say('Choose a subject.', {}); await S.say('Make a yes/no question.', {}); await S.say('Another learner answers.', {});
      };
    }
  };
}

const CH6 = {
  n: 6, title: 'Ask about the scene', min: 8, bg: 'classroom',
  steps: [
    {
      id: '6.1', title: 'How we ask about a scene', sec: 40, es: 'Cuatro pasos: 1) elige un sujeto, 2) haz una pregunta de sí o no, 3) otro estudiante responde con la evidencia, 4) el profesor muestra un ejemplo. Solo usamos los datos de la imagen.',
      build(S) {
        S.supportable = false;
        const steps = [['1', 'A learner chooses a subject.', 120, 330], ['2', 'The learner makes a yes/no question.', 470, 250], ['3', 'Another learner answers with the evidence.', 830, 330], ['4', 'The teacher shows one possible question.', 1180, 250]];
        S.add(`<path d="M 200 520 C 420 360, 560 360, 700 480 S 1020 600, 1380 430" fill="none" stroke="#ffd978" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round" opacity=".8"/>`);
        const cards = steps.map(s => { const c = S.paper(s[2], s[3] + 40, 330, 200, { cls: 'tilt' + (1 + (s[0] % 2)) }); c.innerHTML = `<div class="chip gold" style="font-size:34px;margin-bottom:8px">${s[0]}</div><div style="font-size:30px;font-weight:700;line-height:1.2">${T(s[1])}</div>`; c.classList.add('lv', 'hidden-lv'); return c; });
        const note = S.el(`<div class="note-card lv hidden-lv" style="left:200px;top:700px;width:1200px;text-align:center;font-size:26px">${T('Use only the facts in the picture. Do not guess jobs or feelings from faces or clothes.')}</div>`);
        S.play = async () => {
          await S.sleep(250);
          const say = ['First, a learner chooses a subject.', 'Then, the learner makes a yes/no question.', 'Another learner answers, using the evidence.', 'Last, the teacher shows one possible question.'];
          for (let i = 0; i < 4; i++) { cards[i].classList.remove('hidden-lv'); Aud.sfx('card'); await S.say(say[i], { after: 100 }); }
          note.classList.remove('hidden-lv'); await S.say('Use only the facts in the picture.');
        };
      }
    },
    sceneAct({
      id: '6.2', title: 'Scene 1: the desk', es: 'Escena 1: objetos en la mesa. Elige un objeto, haz una pregunta y responde con los datos de las tarjetas.',
      bank: ['the pen', 'the laptop', 'the books', 'the bag', 'blue', 'new', 'red', 'on the desk'],
      draw(S) {
        S.add(A.obj.desk(80, 500, 920, 80));
        S.add(A.obj.pen(270, 565, 1.3)); S.add(A.obj.laptop(500, 572, 1.2)); S.add(newTag(590, 430, 36)); S.add(A.obj.books(660, 574, 1.35)); S.add(A.obj.bag(900, 578, 0.78, '#d8453a', '#8f2a22'));
        S.fact('The pen is blue.', 40, 640, { style: 'font-size:21px' }); S.fact('The laptop is new.', 330, 640, { style: 'font-size:21px' }); S.fact('The bag is red.', 650, 640, { style: 'font-size:21px' }); S.fact('The books are on the desk.', 40, 706, { style: 'font-size:21px' });
      },
      vocab: [[270, 535, 'pen'], [500, 390, 'laptop'], [730, 500, 'books'], [900, 450, 'bag'], [520, 600, 'desk']],
      subjects: [
        { label: 'the pen', pron: 'it', hot: [190, 515, 180, 90], q: 'Is the pen blue?', a: 'Yes, it is.', ev: 'Evidence: The pen is blue.' },
        { label: 'the laptop', pron: 'it', hot: [390, 405, 240, 185], q: 'Is the laptop new?', a: 'Yes, it is.', ev: 'Evidence: The laptop is new.' },
        { label: 'the books', pron: 'they', plural: true, hot: [640, 495, 230, 100], q: 'Are the books on the desk?', a: 'Yes, they are.', ev: 'Evidence: The books are on the desk.' },
        { label: 'the bag', pron: 'it', hot: [820, 445, 170, 150], q: 'Is the bag blue?', a: 'No, it isn’t.', ev: 'Evidence: The bag is red.' }
      ]
    }),
    sceneAct({
      id: '6.3', title: 'Scene 2: our class', es: 'Escena 2: personas con tarjetas de información. Usa solo lo que dicen las tarjetas.',
      bank: ['she', 'he', 'they', 'a teacher', 'a student', 'a doctor', 'ready', 'tired', 'late'],
      draw(S) {
        const P = [['nora', 130, 'a teacher'], ['alex', 390, 'a student'], ['maya', 650, 'a doctor'], ['sam', 910, 'a student']];
        P.forEach(([k, x, job]) => stand(S, k, x, { s: 0.55, y: 690, job, look: [x < 600 ? 3 : -3, 0] }));
        S.fact('Nora: ready', 40, 712, { style: 'font-size:20px' }); S.fact('Alex: ready', 290, 712, { style: 'font-size:20px' }); S.fact('Maya says: I am tired.', 530, 712, { style: 'font-size:20px' }); S.fact('Sam: late today', 830, 712, { style: 'font-size:20px' });
      },
      subjects: [
        { label: 'Nora', pron: 'she', hot: [50, 330, 160, 370], q: 'Is she a teacher?', a: 'Yes, she is.', ev: 'Evidence: Nora (she): a teacher.' },
        { label: 'Alex', pron: 'he', hot: [310, 330, 160, 370], q: 'Is he ready?', a: 'Yes, he is.', ev: 'Evidence: Alex: ready.' },
        { label: 'Maya', pron: 'she', hot: [570, 330, 160, 370], q: 'Is she tired?', a: 'Yes, she is.', ev: 'Evidence: Maya says: I am tired.' },
        { label: 'Sam', pron: 'he', hot: [830, 330, 160, 370], q: 'Is he late?', a: 'Yes, he is.', ev: 'Evidence: Sam: late today.' },
        { label: 'Alex and Sam', pron: 'they', plural: true, hot: [300, 320, 700, 390], q: 'Are they students?', a: 'Yes, they are.', ev: 'Evidence: Alex and Sam: students.' }
      ]
    }),
    sceneAct({
      id: '6.4', title: 'Scene 3: the doors', bg: 'doorwayL', es: 'Escena 3: dos puertas. La clase es en la sala 12. Usa los datos de las tarjetas.',
      bank: ['he', 'they', 'it', 'in the right room', 'at the door', 'Room 12', 'Room 14'],
      draw(S) {
        stand(S, 'alex', 300, { s: 0.6, look: [3, 0] }); stand(S, 'sam', 780, { s: 0.6, look: [-3, 0] });
        S.fact('Our class: Room 12.', 450, 262, { cls: 'gold', style: 'font-size:22px' }); S.fact('Alex is at Room 12.', 120, 700, { style: 'font-size:21px' }); S.fact('Sam is at Room 14.', 600, 700, { style: 'font-size:21px' });
      },
      vocab: [[300, 172, 'door'], [780, 172, 'door']],
      subjects: [
        { label: 'Sam', pron: 'he', hot: [690, 320, 180, 450], q: 'Is he in the right room?', a: 'No, he isn’t.', ev: 'Evidence: Our class: Room 12. Sam is at Room 14.' },
        { label: 'Alex', pron: 'he', hot: [210, 320, 180, 450], q: 'Is he in the right room?', a: 'Yes, he is.', ev: 'Evidence: Our class: Room 12. Alex is at Room 12.' },
        { label: 'Alex and Sam', pron: 'they', plural: true, hot: [190, 300, 700, 500], q: 'Are they at the door?', a: 'Yes, they are.', ev: 'Evidence: They are at the doors.' },
        { label: 'the door of Room 12', pron: 'it', hot: [225, 185, 150, 100], q: 'Is it Room 12?', a: 'Yes, it is.', ev: 'Evidence: The sign says 12.' }
      ]
    }),
    sceneAct({
      id: '6.5', title: 'Scene 4: at home', bg: 'home', es: 'Escena 4: en casa. Usa solo lo que dicen las tarjetas.',
      bank: ['he', 'they', 'it', 'at home', 'blue', 'new', 'tired'],
      draw(S) {
        S.add(A.obj.sofa(900, 765, 0.9)); S.add(A.obj.lamp(170, 705, 1.0, true)); S.add(newTag(170, 440, 34));
        stand(S, 'alex', 440, { s: 0.6, y: 790, look: [3, 0] }); stand(S, 'sam', 640, { s: 0.6, y: 790, look: [-3, 0] });
        S.fact('Alex and Sam: at home.', 380, 262, { cls: 'gold', style: 'font-size:22px' }); S.fact('Alex says: I am tired.', 260, 700, { style: 'font-size:20px' }); S.fact('The sofa is blue.', 760, 690, { style: 'font-size:20px' }); S.fact('The lamp is new.', 40, 724, { style: 'font-size:20px' });
      },
      vocab: [[900, 580, 'sofa'], [170, 490, 'lamp'], [1220, 110, 'window']],
      subjects: [
        { label: 'Alex', pron: 'he', hot: [360, 370, 170, 430], q: 'Is he tired?', a: 'Yes, he is.', ev: 'Evidence: Alex says: I am tired.' },
        { label: 'Sam', pron: 'he', hot: [560, 370, 170, 430], q: 'Is he at home?', a: 'Yes, he is.', ev: 'Evidence: Alex and Sam: at home.' },
        { label: 'Alex and Sam', pron: 'they', plural: true, hot: [340, 360, 400, 450], q: 'Are they at home?', a: 'Yes, they are.', ev: 'Evidence: Alex and Sam: at home.' },
        { label: 'the sofa', pron: 'it', hot: [740, 590, 340, 180], q: 'Is the sofa blue?', a: 'Yes, it is.', ev: 'Evidence: The sofa is blue.' },
        { label: 'the lamp', pron: 'it', hot: [90, 390, 170, 330], q: 'Is the lamp new?', a: 'Yes, it is.', ev: 'Evidence: The lamp is new.' }
      ]
    })
  ]
};
