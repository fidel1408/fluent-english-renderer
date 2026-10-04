/* ===== Lesson content: helpers + Activity 1 ===== */
const ACTS = [];
const NAMEC = (who) => Art.CAST[who];
const prCls = (who) => (NAMEC(who).pr.startsWith('he') ? 'he' : 'she');
/** Overlay name tag: "Alex / he/him" at svg coords (x, y). */
const tagY = (y) => (y >= 480 ? [446, ' tagtop'] : [y, '']);
const NT = (who, x, y = 508, id) => { const [yy, c] = tagY(y); return { x, y: yy, id, cls: (id ? 'fadein' : '') + c, html: `<div class="tag ${prCls(who)}">${tx(`${NAMEC(who).name} · ${NAMEC(who).pr}`)}</div>` }; };   // one text line + one IPA line, so it fits under the picture
const TG = (title, sub, x, y, id, cls = '') => { const [yy, c] = tagY(y); return { x, y: yy, id, cls: (id ? 'fadein' : '') + c, html: `<div class="tag ${cls}">${tx(sub ? `${title} · ${sub}` : title)}</div>` }; };
const PILL = (text, x, y, id, color = 'coral', mv) => ({ x, y, id, cls: (mv ? 'mv ' : '') + 'fadein', html: `<span class="bigpill ${color}">${tx(text)}</span>` });
const BUB = (id, x, y, text) => ({ id, x, y, html: tx(text, { be: 0 }) });
const RING = (id, x, y, w, h, cls = '') => ({ id, x, y, w, h, cls });
/** Scene shortcut. ppl: [[who, x, opts]] */
const GROUND = 46; // everything sits this much higher so tag + IPA lines fit underneath
function SC(o) {
  return Art.scene({
    bg: o.bg || 'class', alt: o.alt || '', cls: o.cls,
    people: (o.ppl || []).map(([who, x, p = {}]) => Object.assign({ who, x, s: o.s || 0.95, id: who }, p, { y: (p.y || 470) - GROUND })),
    objs: (o.objs || []).map((a) => (a.raw ? { raw: `<g transform="translate(0 ${-GROUND})">${a.raw}</g>` } : Object.assign({}, a, { y: a.y - GROUND }))),
    ov: o.tags, bubbles: o.bub, rings: (o.rings || []).map((r) => Object.assign({}, r, { y: r.y - 30 })), back: o.back,
  });
}
const cols = (l, r, cls = '') => `<div class="cols ${cls}"><div>${l}</div><div class="stack">${r}</div></div>`;
const card = (inner, cls = '') => `<div class="card ${cls}">${inner}</div>`;
const sentenceCard = (text, note, id) => `<div class="card ${id ? 'fadein' : ''}" ${id ? `id="${id}"` : ''}><div class="big-sentence">${tx(text, { be: 1 })}</div>${note ? `<div class="meaning" style="margin-top:.4rem">${tx(note)}</div>` : ''}</div>`;
const mv = (id, x, y) => { const e = document.getElementById(id); if (e) { e.style.left = (x / 9.6).toFixed(2) + '%'; e.style.top = (y / 5.4).toFixed(2) + '%'; } };
const cut = (s) => s.replace(/\s+/g, ' ').trim();

/** Picture + prompt + hidden answer. Used for challenges, T/F, Q&A and the Speaking Lab. */
function promptBeat(o) {
  const lab = !!o.lab;
  return {
    inv: { kind: 'prompt', instruction: o.instr, statementOrQuestion: o.frame || null, facts: o.facts || null, answerKey: o.sentence.split(' / '), verdict: o.big || null, explanation: o.why || null, starters: o.starters || null, extraChallenge: o.extra || null, speakerRole: o.lab ? 'teacher chooses learner' : null },
    title: o.title, sub: o.sub, talk: o.talk, turn: o.turn, es: o.es, quiet: o.quiet, ansSay: o.ansSay || (o.sentence ? [o.sentence.split(' / ')[0]] : null),
    render: () => cols(o.scene(), `
      ${o.facts ? `<div class="card" style="border-left:6px solid var(--violet)"><b class="pill violet">${tx('Facts')}</b><div class="mid-sentence" style="margin-top:.3rem">${tx(o.facts)}</div></div>` : ''}
      <div class="card"><div class="instr">${tx(o.instr)}</div>${o.frame ? `<div class="big-sentence" style="margin:.5rem 0">${tx(o.frame, { be: 0 })}</div>` : ''}</div>
      ${o.starters ? `<div class="card" data-starters><b class="pill gold">${tx('Sentence starters')}</b><div class="mid-sentence" style="margin-top:.35rem">${o.starters.map((s) => `<div>${tx(s)}</div>`).join('')}</div></div>` : ''}
      ${o.extra ? `<div class="row"><button class="btn alt sm" data-extra aria-pressed="false">Extra challenge</button></div><div class="card" data-extra-box style="display:none;border-color:var(--violet)"><b class="pill violet">${tx('Extra challenge')}</b><div class="instr" style="margin-top:.3rem">${tx(o.extra)}</div></div>` : ''}
      ${lab ? `<div class="row"><button class="btn alt sm" data-chk>Participation checklist</button></div>` : ''}
      <div class="ans ans-box${o.bad ? ' bad' : ''}">${o.big ? `<div class="mid-sentence"><b>${tx(o.big)}</b></div>` : ''}<div class="mid-sentence">${o.sentence.split(' / ').map((s) => `<div>${tx(s, { be: 1 })}</div>`).join('')}</div>${o.why ? `<div class="meaning" style="margin-top:.4rem">${tx(o.why)}</div>` : ''}</div>`),
    seq: o.say,
    bind: (A) => {
      const r = A.root, b = $('[data-extra]', r);
      if (b) b.onclick = () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.textContent = on ? 'Back to support' : 'Extra challenge'; const st = $('[data-starters]', r); if (st) st.style.display = on ? 'none' : ''; $('[data-extra-box]', r).style.display = on ? '' : 'none'; };
      const c = $('[data-chk]', r); if (c) c.onclick = () => openChecklist('part');
    },
  };
}

/* ---------- small portrait svg (head + shoulders) for the feeling cards ---------- */
function bust(who, expr, extra = '') {
  return `<svg viewBox="-62 -330 124 120" width="100%" aria-hidden="true">${Art.person({ who, x: 0, y: 0, s: 1, expr, id: 'b' + who + expr })}${extra}</svg>`;
}

/* ================= ACTIVITY 1 ================= */
const warmScene = () => SC({
  alt: 'Alex and Maya stand near a book on a table. A group of three people stands on the right.',
  ppl: [['alex', 130, { gaze: 0.8 }], ['maya', 290, { gaze: -0.8, flip: true }], ['daniel', 640, { s: 0.8, y: 452 }], ['lena', 735, { s: 0.8, y: 452 }], ['ken', 830, { s: 0.8, y: 452 }]],
  objs: [{ raw: Art.table(450, 392, 160) }, { type: 'book', x: 450, y: 390, s: 0.9 }],
  tags: [NT('alex', 130, 510, 'tg-alex'), NT('maya', 290, 510, 'tg-maya'), TG('a group', null, 735, 510, 'tg-grp', 'grp'), TG('a book', null, 450, 292, 'tg-book', 'it')],
  rings: [RING('rg-alex', 130, 330, 130, 330, 'teal'), RING('rg-maya', 290, 330, 130, 330, 'violet'), RING('rg-grp', 735, 340, 290, 300, 'coral'), RING('rg-book', 450, 350, 110, 100)],
  bub: [BUB('bA', 130, 128, "I'm ready."), BUB('bM', 290, 128, "It's a book."), BUB('bA2', 130, 128, "You're here.")],
});
const warmSide = (text, note) => `<div class="stack">${sentenceCard(text, note)}</div>`;

ACTS.push({
  n: 1, title: 'Visual Warm-up: People, Things, and Me', spoken: 'Visual warm-up: people, things, and me',
  es: 'Calentamiento visual: miramos personas y cosas para usar I, you e it.',
  beats: [
    { title: 'People, things, and me', talk: 0, es: 'Mira la imagen: dos personas (Alex y Maya), un grupo y un libro. Hoy usamos palabras cortas para hablar de ellos: I, you, it…',
      render: () => cols(warmScene(), `<div class="card"><h3>${tx('In this picture')}</h3>
        <div class="fadein" id="li1" style="margin:.4rem 0"><span class="pill">1</span> <span class="mid-sentence">${tx('Two people: *Alex* and *Maya*')}</span></div>
        <div class="fadein" id="li2" style="margin:.4rem 0"><span class="pill coral">2</span> <span class="mid-sentence">${tx('A group of three people')}</span></div>
        <div class="fadein" id="li3" style="margin:.4rem 0"><span class="pill gold">3</span> <span class="mid-sentence">${tx('A book')}</span></div></div>`),
      seq: [
        { t: 'Look at the picture.', pre: (A) => { A.on('tg-alex'); A.on('tg-maya'); } },
        { t: 'Two people. Alex and Maya.', pre: (A) => { A.on('li1'); A.on('rg-alex'); A.on('rg-maya'); A.sfx('pop'); } },
        { t: 'A group.', pre: (A) => { A.off('rg-alex'); A.off('rg-maya'); A.on('li2'); A.on('rg-grp'); A.on('tg-grp'); A.sfx('pop'); } },
        { t: 'And a book.', pre: (A) => { A.off('rg-grp'); A.on('li3'); A.on('rg-book'); A.on('tg-book'); A.sfx('pop'); } },
      ] },
    { title: "Model 1: I’m ready.", talk: 20, turn: "Repeat once: I'm ready.", es: '"I" es la persona que habla. "I’m ready" significa "Estoy listo/a". En inglés siempre decimos el sujeto (I).',
      render: () => cols(warmScene(), warmSide("I'm ready.", '*I* = the person who is speaking.')),
      seq: [
        { pre: (A) => { ['tg-alex', 'tg-maya', 'tg-grp'].forEach((i) => A.on(i)); A.on('rg-alex'); A.pose('alex', 'L', 'chest', 600); A.on('bA'); A.sfx('pop'); }, t: "I'm ready.", who: 'alex', rate: 0.85, pause: 500 },
        { post: (A) => { A.pose('alex', 'L', 'rest', 600); }, t: 'Your turn.' },
      ] },
    { title: "Model 2: You’re here.", talk: 20, turn: "Repeat once: You're here.", es: '"You" es la persona que escucha. Alex habla con Maya, entonces Maya es "you".',
      render: () => cols(warmScene(), warmSide("You're here.", '*you* = the person who is listening.')),
      seq: [
        { pre: (A) => { ['tg-alex', 'tg-maya', 'tg-grp'].forEach((i) => A.on(i)); A.on('rg-maya'); A.pose('alex', 'R', 'point', 700); A.on('bA2'); A.sfx('pop'); }, t: "You're here.", who: 'alex', rate: 0.85, pause: 500 },
        { post: (A) => { A.pose('alex', 'R', 'rest', 600); }, t: 'Your turn.' },
      ] },
    { title: "Model 3: It’s a book.", talk: 20, turn: "Repeat once: It's a book.", es: '"It" es para una cosa. Aquí: un libro.',
      render: () => cols(warmScene(), warmSide("It's a book.", '*it* = one thing.')),
      seq: [
        { pre: (A) => { ['tg-alex', 'tg-maya', 'tg-grp'].forEach((i) => A.on(i)); A.on('rg-book'); A.on('tg-book'); A.pose('maya', 'L', 'point', 700); A.on('bM'); A.sfx('pop'); }, t: "It's a book.", who: 'maya', rate: 0.85, pause: 500 },
        { post: (A) => { A.pose('maya', 'L', 'rest', 600); }, t: 'Your turn.' },
      ] },
    (() => {
      const words = [['ready', 'maya', 'smile', 'ready = I am in the right state to start.'], ['happy', 'omar', 'happy', 'happy = a good feeling.'], ['tired', 'lena', 'tired', 'tired = I need rest.']];
      return {
        inv: { kind: 'choice-ungraded', options: words.map((w) => w[0]), note: 'any choice is acceptable' }, title: 'Complete the sentence: I’m …', talk: 90, es: 'Elige una palabra: ready, happy o tired, y di la frase completa: "I’m ___". "Ready" es un estado (cómo estamos), no una emoción como "happy".',
        render: () => `<div class="cols narrow-left"><div class="stack"><div class="card center" style="min-height:7rem"><div class="big-sentence" id="feel-s">${tx("I'm ___.")}</div></div>
          <div class="meaning">${tx('*ready* is a state: how we are now. *happy* and *tired* are feelings.')}</div>
          <div class="small-note" id="feel-t"></div></div>
          <div class="row c" style="gap:.8rem;align-items:stretch">${words.map(([w, who, ex], i) => `<button class="card" data-w="${w}" style="width:11rem;text-align:center;cursor:pointer"><div style="background:linear-gradient(#fff3da,#f6e2bb);border-radius:10px;overflow:hidden">${bust(who, ex)}</div><div class="mid-sentence">${tx(w)}</div></button>`).join('')}</div></div>`,
        seq: [{ t: 'Choose one word. Then say the whole sentence.' }],
        bind: (A) => {
          $$('[data-w]', A.root).forEach((b) => b.addEventListener('click', () => {
            const w = b.dataset.w; S.picks[w] = (S.picks[w] || 0) + 1; save();
            $('#feel-s', A.root).innerHTML = tx(`I'm *${w}*.`);
            $('#feel-t', A.root).textContent = 'Tally this session (teacher’s count): ' + Object.entries(S.picks).map(([k, v]) => `${k} ${v}`).join(' · ');
            Sound.sfx('click'); A.sayBg([`I'm ${w}.`]);
          }));
        },
        turn: 'Say: I’m ready / happy / tired.',
      };
    })(),
    ...[
      { q: '___ is a teacher.', opts: ['He', 'She', 'They'], ok: 'She', sc: () => SC({ alt: 'Maya holds a book.', ppl: [['maya', 480, { s: 1, poseL: 'hold', held: { L: 'book' }, expr: 'smile' }]], tags: [NT('maya', 480)] }), es: 'Mini prueba 1 de 3 (sin nota). Maya es "she/her". Elige el pronombre.' },
      { q: 'We ___ in class.', opts: ['am', 'is', 'are'], ok: 'are', sc: () => SC({ alt: 'Alex and Maya in class. Alex is speaking.', ppl: [['alex', 380, { poseR: 'present', gaze: 0.5 }], ['maya', 580, { gaze: -0.5 }]], tags: [NT('alex', 380), NT('maya', 580), TG('Alex is speaking', null, 380, 88)], rings: [RING('rg1', 480, 330, 400, 340, 'coral')] }), es: 'Mini prueba 2 de 3 (sin nota). Alex habla de él y Maya: "we".' },
      { q: 'I ___ happy.', opts: ['am', 'is', 'are'], ok: 'am', sc: () => SC({ alt: 'Alex is smiling and speaking.', ppl: [['alex', 480, { s: 1, expr: 'happy', poseL: 'chest' }]], tags: [NT('alex', 480), TG('Alex is speaking', null, 480, 88)] }), es: 'Mini prueba 3 de 3 (sin nota). Alex habla de sí mismo: "I".' },
    ].map((d, i) => ({
      inv: { kind: 'diagnostic-ungraded', id: 'D' + (i + 1), prompt: d.q, options: d.opts, answerKey: d.ok }, title: 'Quick check (not graded)', sub: `${i + 1} of 3`, talk: 0, es: d.es,
      render: () => cols(d.sc(), `<div class="card"><div class="big-sentence">${tx(d.q)}</div></div><div class="stack" id="dg">${d.opts.map((o) => `<button class="opt" data-o="${o}" aria-pressed="${S.diag['d' + (i + 1)] && S.diag['d' + (i + 1)].choice === o}"><span class="mid-sentence">${tx(o)}</span></button>`).join('')}</div><div class="small-note" id="dg-note" aria-live="polite">${S.diag['d' + (i + 1)] ? tx('Recorded for your teacher. No score is shown now.') : tx('Teacher: click the answer the class chooses. It is saved locally and not graded here.')}</div>`),
      seq: [{ t: i === 0 ? 'A quick check. No score now. Choose the best word.' : 'Choose the best word.' }],
      bind: (A) => {
        $$('[data-o]', A.root).forEach((b) => b.addEventListener('click', () => {
          S.diag['d' + (i + 1)] = { item: d.q, choice: b.dataset.o }; save();
          logAnswer({ qid: 'D' + (i + 1), ungraded: true, mode: 'diagnostic', prompt: d.q, options: d.opts, selected: d.opts.indexOf(b.dataset.o), correct: d.opts.indexOf(d.ok), attempt: attemptCount('D' + (i + 1), 'diagnostic') + 1, attemptType: 'diagnostic', ok: null });
          $$('[data-o]', A.root).forEach((x) => x.setAttribute('aria-pressed', x === b));
          $('#dg-note', A.root).innerHTML = tx('Recorded for your teacher. No score is shown now.'); Sound.sfx('save');
        }));
      },
    })),
    { title: 'Today’s goals', talk: 0, es: 'Hoy aprenderás a elegir pronombres, usar am/is/are, contracciones, negativos, preguntas y respuestas cortas, y a hablar de personas y cosas.',
      render: () => `<div class="cols even"><div class="stack">${['Choose I, you, he, she, it, we, or they.', 'Use am, is, and are.', 'Say I’m, you’re, he’s, she’s…', 'Make negative sentences.', 'Ask questions. Give short answers.', 'Talk about people and things.'].map((g, i) => `<div class="card fadein" id="gl${i}" style="display:flex;gap:.7rem;align-items:center"><span class="pill green">✓</span><span class="mid-sentence">${tx(g)}</span></div>`).join('')}</div>
        <div>${SC({ alt: 'Four adults smiling.', ppl: [['alex', 200, {}], ['maya', 380, {}], ['daniel', 580, {}], ['sofia', 760, {}]], tags: [NT('alex', 200), NT('maya', 380), NT('daniel', 580), NT('sofia', 760)] })}</div></div>`,
      seq: [{ t: 'Today you can learn six things.' }, ...[0, 1, 2, 3, 4, 5].map((i) => ({ pre: (A) => { A.on('gl' + i); A.sfx('pop'); }, wait: 450 })), { t: 'Let’s begin.' }] },
  ],
});
