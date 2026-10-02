/* ============================================================
   SECTION 5 — WHO IS ANSWERING? (07:00)
   ============================================================ */
const ICON_SIZE = 1.1;
function roleIcon(S, kind, x, y) { // 'ask' | 'hear' | 'about'
  const f = { ask: A.icon.voice, hear: A.icon.ear, about: A.icon.point }[kind];
  const col = { ask: '#ffd978', hear: '#5fe3da', about: '#ff9a8d' }[kind];
  return S.add(`<g class="lv">${f(x, y, ICON_SIZE, col)}</g>`);
}
const ICON_LABEL = { ask: 'asks', hear: 'answers', about: 'is talked about' };

/* six perspective challenges share this builder */
function whoStep(o) {
  return {
    id: o.id, title: o.title, sec: 60, bg: 'classroom', es: o.es, music: 'bed',
    build(S) {
      const P = {}; o.cast.forEach(c => { P[c.k] = stand(S, c.k, c.x, { s: 0.62, pose: c.pose || 'rest', look: c.look || [0, 0] }); });
      if (o.facts) o.facts.forEach(f => S.fact(f[0], f[1], f[2], { cls: f[3] || '' }));
      const asker = P[o.asker], answerer = P[o.answerer];
      // role icons above heads
      const icons = [];
      const place = (k, kind) => { const c = o.cast.find(x => x.k === k); const g = roleIcon(S, kind, c.x, 255); icons.push(g); const lab = S.el(`<div class="chip lv ${kind === 'ask' ? 'gold' : kind === 'hear' ? '' : 'coral'}" style="left:${c.x - 70}px;top:${290}px;font-size:20px;padding:2px 12px;transform:translateX(0)">${T(ICON_LABEL[kind])}</div>`); lab.style.transform = 'translateX(-30%)'; icons.push(lab); };
      place(o.asker, 'ask'); place(o.answerer, 'hear'); if (o.about && o.about !== o.answerer) place(o.about, 'about');
      icons.forEach(g => g.classList.add('hidden-lv'));
      const bub = S.bubble(o.q, o.bx, 140, { cls: 'q', tail: 70 });
      const turnA = S.turn('Who asks? Who answers? Who is “' + o.pr + '”?', 330, 700); turnA.classList.add('hidden-lv');
      // referent rings + label (level 1)
      const rg = o.rings.map(r => S.el(`<div class="ring ${r[4] || ''} lv hidden-lv" style="left:${r[0]}px;top:${r[1]}px;width:${r[2]}px;height:${r[3]}px"></div>`));
      const who = S.el(`<div class="chip gold lv hidden-lv" style="left:${o.lx}px;top:${o.ly}px;font-size:30px">${T(o.who)}</div>`);
      const ans = modelChip(S, o.ans, o.ax, o.ay, { cls: o.neg ? 'n' : '', tone: 's' });
      const why = S.el(`<div class="note-card lv hidden-lv" style="left:${o.ax}px;top:${o.ay + 100}px;width:560px;font-size:26px">${T(o.why)}</div>`);
      const pointer = S.el(`<div class="chip cream lv hidden-lv" style="left:${o.ax}px;top:${o.ay - 62}px;font-size:24px">${T(o.say2)}</div>`);
      S.reg(who, 1); rg.forEach(r => S.reg(r, 1)); S.reg(ans, 2); S.reg(why, 2); S.reg(pointer, 2);
      S.levels = 2; S.revLabels = ['Who is the pronoun?', 'Show the complete answer'];
      S.sayAt(1, o.sayWho, { who: asker }); S.sayAt(2, o.ans, { tone: 's', who: answerer });
      S.onLevel = (n) => { if (n) { turnA.classList.add('hidden-lv'); Fx.burst(o.ax + 100, o.ay, 12); } };
      if (o.extra) o.extra(S, P);
      S.play = async () => {
        await S.sleep(250);
        icons.forEach(g => g.classList.remove('hidden-lv'));
        await S.say(o.q, { tone: 'q', who: asker });
        turnA.classList.remove('hidden-lv');
      };
    }
  };
}

const CH5 = {
  n: 5, title: 'Who is answering?', min: 7, bg: 'classroom',
  steps: [
    {
      id: '5.1', title: 'Who asks? Who answers? Who is it about?', sec: 60, es: 'Antes de responder mira tres cosas: quién pregunta, quién responde y de quién hablamos. El pronombre de la respuesta depende de esto.',
      build(S) {
        const al = stand(S, 'alex', 280, { s: 0.62, pose: 'present', look: [4, 0] });
        const ma = stand(S, 'maya', 800, { s: 0.62, pose: 'rest', look: [-4, 0] });
        const sa = stand(S, 'sam', 1320, { s: 0.62, pose: 'rest', look: [-4, 0] });
        const g1 = roleIcon(S, 'ask', 280, 262), g2 = roleIcon(S, 'hear', 800, 262), g3 = roleIcon(S, 'about', 1320, 262);
        const l1 = S.el(`<div class="chip gold lv" style="left:200px;top:296px;font-size:26px">${T('asks')}</div>`), l2 = S.el(`<div class="chip lv" style="left:700px;top:296px;font-size:26px">${T('answers (listens)')}</div>`), l3 = S.el(`<div class="chip coral lv" style="left:1160px;top:296px;font-size:26px">${T('is talked about')}</div>`);
        const bq = S.bubble('Is he ready?', 140, 130, { cls: 'q', tail: 140, style: 'font-size:34px' });
        const ba = S.bubble('Yes, he is.', 700, 130, { cls: '', tail: 100, style: 'font-size:34px' });
        S.fact('Sam: ready', 1180, 700, {});
        const ring = ringAt(S, 1190, 330, 250, 420, 'coral');
        const items = [[g1, l1], [g2, l2], [g3, l3, ring], [bq], [ba]];
        items.forEach(a => a.forEach(el => el.classList.add('hidden-lv', 'lv')));
        const reveal = (i) => items[i].forEach(el => el.classList.remove('hidden-lv'));
        S.play = async () => {
          await S.sleep(250);
          await S.say('Look at three things.', { who: al });
          reveal(0); Aud.sfx('tick'); await S.say('Who asks?', { who: al, tone: 'q' });
          reveal(1); Aud.sfx('tick'); await S.say('Who answers?', { who: al, tone: 'q' });
          reveal(2); Aud.sfx('tick'); await S.say('Who do we talk about?', { who: al, tone: 'q' });
          await S.sleep(250);
          reveal(3); await S.say('Is he ready?', { tone: 'q', who: al });
          reveal(4); await S.say('Yes, he is.', { tone: 's', who: ma });
          await S.say('“He” is Sam, | the person we talk about.', { who: ma });
        };
      }
    },
    whoStep({
      id: '5.2', title: 'You → I', cast: [{ k: 'nora', x: 330, pose: 'present', look: [4, 0] }, { k: 'alex', x: 1190, look: [-4, 0] }], facts: [['Alex: ready', 1050, 700]],
      asker: 'nora', answerer: 'alex', about: 'alex', q: 'Are you ready?', bx: 130, pr: 'you',
      rings: [[1060, 330, 260, 420]], who: 'you = Alex (the listener)', lx: 700, ly: 330, sayWho: '“You” is Alex, the listener.',
      ans: 'Yes, I am.', ax: 700, ay: 440, say2: 'Alex answers about himself.', why: 'The listener says “I” when the question is about the listener.',
      es: 'Nora le pregunta a Alex: «Are you ready?» «You» es Alex, la persona que escucha. Alex responde sobre sí mismo: «Yes, I am.»'
    }),
    whoStep({
      id: '5.3', title: 'Am I…? → you', cast: [{ k: 'alex', x: 330, pose: 'present', look: [4, 0] }, { k: 'maya', x: 1190, look: [-4, 0] }], facts: [['Alex: on time', 180, 700, 'gold']],
      asker: 'alex', answerer: 'maya', about: 'alex', q: 'Am I late?', bx: 130, pr: 'I', neg: true,
      rings: [[200, 330, 260, 420]], who: '“I” = Alex (the speaker)', lx: 700, ly: 330, sayWho: '“I” is Alex, the person who asks.',
      ans: 'No, you aren’t.', ax: 700, ay: 440, say2: 'Maya answers about Alex.', why: 'Maya talks to Alex, so she says “you”.',
      es: 'Alex pregunta: «Am I late?» «I» es Alex. Alex llega a tiempo. Maya responde sobre Alex, y a Alex le dice «you»: «No, you aren’t.»'
    }),
    whoStep({
      id: '5.4', title: 'Is she…? → she', cast: [{ k: 'sam', x: 330, pose: 'present', look: [4, 0] }, { k: 'nora', x: 800, look: [0, 0] }, { k: 'maya', x: 1270, look: [-4, 0] }], facts: [['Maya: in class', 1120, 700]],
      asker: 'sam', answerer: 'nora', about: 'maya', q: 'Is she in class?', bx: 110, pr: 'she',
      rings: [[1140, 330, 250, 420, 'coral']], who: 'she = Maya (we talk about her)', lx: 600, ly: 220, sayWho: '“She” is Maya. We talk about Maya.',
      ans: 'Yes, she is.', ax: 560, ay: 520, say2: 'Nora answers about Maya.', why: 'The question and the answer both talk about Maya: she.',
      es: 'Sam le pregunta a Nora sobre Maya: «Is she in class?» «She» es Maya. Nora responde con el mismo pronombre: «Yes, she is.»'
    }),
    whoStep({
      id: '5.5', title: 'Plural you → we', cast: [{ k: 'nora', x: 300, pose: 'present', look: [4, 0] }, { k: 'alex', x: 1050, look: [-4, 0] }, { k: 'maya', x: 1330, look: [-4, 0] }], facts: [['Alex and Maya: ready', 960, 700]],
      asker: 'nora', answerer: 'alex', about: 'alex', q: 'Are you ready?', bx: 110, pr: 'you',
      rings: [[930, 310, 520, 450, 'dash']], who: 'you = Alex and Maya (a group)', lx: 560, ly: 330, sayWho: '“You” means a group: Alex and Maya.',
      ans: 'Yes, we are.', ax: 560, ay: 440, say2: 'The group answers together.', why: 'The group answers about the group, and the speakers are inside it: “we”.',
      es: 'Nora le pregunta a dos personas: Alex y Maya. «You» es plural: el grupo. El grupo responde junto, incluyéndose: «Yes, we are.»'
    }),
    whoStep({
      id: '5.6', title: 'They → they', cast: [{ k: 'sam', x: 240, pose: 'present', look: [4, 0] }, { k: 'nora', x: 640, look: [0, 0] }, { k: 'alex', x: 1060, look: [-4, 0] }, { k: 'maya', x: 1340, look: [-4, 0] }], facts: [['Alex and Maya: on time', 960, 700, 'gold']],
      asker: 'sam', answerer: 'nora', about: 'alex', q: 'Are they late?', bx: 110, pr: 'they', neg: true,
      rings: [[930, 310, 520, 450, 'coral']], who: 'they = Alex and Maya', lx: 620, ly: 330, sayWho: '“They” are Alex and Maya, the other people.',
      ans: 'No, they aren’t.', ax: 640, ay: 530, say2: 'Nora answers about them.', why: 'Nora is not in the group, so she says “they”.',
      es: 'Sam le pregunta a Nora sobre Alex y Maya: «Are they late?» Ellos llegan a tiempo. Nora responde: «No, they aren’t.»'
    }),
    {
      id: '5.7', title: 'Are we late? Who is inside “we”?', sec: 60, es: '«We» incluye a quien habla. Mira el círculo: si la persona que responde está dentro, dice «we». Si está fuera, dice «you».',
      build(S) {
        S.supportable = false;
        const al = stand(S, 'alex', 330, { s: 0.62, pose: 'present', look: [4, 0] }), sa = stand(S, 'sam', 800, { s: 0.62, look: [0, 0] }), no = stand(S, 'nora', 1270, { s: 0.62, look: [-4, 0] });
        S.fact('Class: 9:00. Alex and Sam: 8:55.', 520, 198, { cls: 'gold', style: 'font-size:23px' });
        const ring = ringAt(S, 190, 330, 780, 440, 'dash'); const rl = S.el(`<div class="chip lv" style="left:230px;top:282px;font-size:26px">${T('we = Alex and Sam')}</div>`);
        const bub = S.bubble('Are we late?', 110, 140, { cls: 'q', tail: 130 });
        let mode = 'A';
        const toggle = S.el(`<div class="tabrow" style="left:700px;top:128px"><button class="btn sm" id="mA">Alex asks Sam</button><button class="btn sm ghost" id="mB">Alex asks Nora</button></div>`);
        const ear = S.el(`<div class="chip lv" style="left:0;top:0;font-size:22px;padding:2px 12px">${T('answers')}</div>`);
        const inout = S.el(`<div class="note-card lv hidden-lv" style="left:300px;top:630px;width:1000px;font-size:28px;text-align:center"></div>`);
        const ans = modelChip(S, 'No, we aren’t.', 560, 700, { cls: 'n', tone: 's' }); ans.classList.add('hidden-lv', 'lv');
        const ans2 = modelChip(S, 'No, you aren’t.', 560, 700, { cls: 'n', tone: 's' }); ans2.classList.add('hidden-lv', 'lv');
        function setMode(m) {
          mode = m; $('#mA', toggle).classList.toggle('ghost', m !== 'A'); $('#mB', toggle).classList.toggle('ghost', m !== 'B');
          const x = m === 'A' ? 800 : 1270; ear.style.left = (x - 50) + 'px'; ear.style.top = '318px';
          FE.setLevel(0, true);
          inout.innerHTML = m === 'A' ? T('Sam is inside the circle. So Sam says “we”.') : T('Nora is outside the circle. So Nora says “you”.');
          S.sayAtMap = { 1: { text: m === 'A' ? 'Sam is inside the circle.' : 'Nora is outside the circle.', o: {} }, 2: { text: m === 'A' ? 'No, we aren’t.' : 'No, you aren’t.', o: { tone: 's' } } };
          al.look(m === 'A' ? 4 : 5, 0);
        }
        $('#mA', toggle).onclick = () => { setMode('A'); S.sayNow('Alex asks Sam: Are we late?', { tone: 'q' }).catch(() => { }); };
        $('#mB', toggle).onclick = () => { setMode('B'); S.sayNow('Alex asks Nora: Are we late?', { tone: 'q' }).catch(() => { }); };
        S.reg(rl, 1); S.reg(inout, 1);
        S.levels = 2; S.revLabels = ['Is the answerer inside “we”?', 'Show the complete answer'];
        S.onLevel = (n) => { ans.classList.toggle('hidden-lv', !(n >= 2 && mode === 'A')); ans2.classList.toggle('hidden-lv', !(n >= 2 && mode === 'B')); if (n) Fx.burst(800, 600, 12); };
        setMode('A');
        S.play = async () => { await S.sleep(250); await S.say('Are we late?', { tone: 'q', who: al }); await S.say('Alex and Sam are in the circle. | Who answers?', { who: al }); };
      }
    }
  ]
};
