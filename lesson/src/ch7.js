/* ============================================================
   SECTION 7 — SPEAKING LAB: ASK, ANSWER, CHECK (07:00)
   ============================================================ */
/* anonymous, teacher-entered participation checklist (local only) */
function tallyPanel(S, x, y) {
  const rows = [['asked', 'Questions asked'], ['answered', 'Short answers given'], ['original', 'Original questions'], ['followup', 'Follow-up answers']];
  const d = S.el(`<div class="glass" style="left:${x}px;top:${y}px;width:300px;padding:10px 14px"><div class="tag" style="margin-bottom:4px">${T('Participation checklist')}</div><div style="font-size:15px;opacity:.85;margin-bottom:6px">Anonymous · tap + as you hear it · stays on this device. The app cannot hear or identify learners.</div></div>`);
  rows.forEach(([k, label]) => {
    const r = mk(`<div class="cnt" style="width:100%;justify-content:space-between;margin-top:6px;font-size:18px;padding:4px 10px"><span>${esc(label)}</span><span style="display:inline-flex;align-items:center;gap:6px"><button aria-label="Fewer: ${esc(label)}">–</button><output>${ST.tally[k]}</output><button aria-label="More: ${esc(label)}">+</button></span></div>`);
    const [m, p] = r.querySelectorAll('button'), o = r.querySelector('output');
    m.onclick = () => { ST.tally[k] = Math.max(0, ST.tally[k] - 1); o.textContent = ST.tally[k]; saveSoon(); };
    p.onclick = () => { ST.tally[k]++; o.textContent = ST.tally[k]; Aud.sfx('tick'); saveSoon(); };
    d.appendChild(r);
  });
  return d;
}

/* card deck used by the three rounds */
function deckStep(o) {
  return {
    id: o.id, title: o.title, sec: 130, bg: 'night', es: o.es, music: 'off', quiet: true, supportDefault: o.support, veil: 0.3,
    build(S) {
      S.supportable = true; S.scene();
      const order = o.cards.map((_, i) => i); let pos = 0;
      const sl = S.el(`<div class="chip gold" style="left:340px;top:186px;font-size:22px">${T(o.level)}</div>`);
      const cnt = S.el(`<div class="chip indigo" style="left:850px;top:186px;font-size:22px"></div>`);
      const card = S.paper(340, 262, 760, 450, { cls: 'tilt1' });
      card.style.display = 'flex'; card.style.flexDirection = 'column'; card.style.alignItems = 'center'; card.style.gap = '6px';
      const art = mk(`<svg viewBox="0 0 800 330" width="700" height="230" style="overflow:visible"></svg>`); card.appendChild(art);
      const prompt = mk(`<div class="big" style="font-size:40px;text-align:center;line-height:1.15"></div>`); card.appendChild(prompt);
      const fact = mk(`<div class="fact" style="font-size:24px;margin-top:2px"></div>`); card.appendChild(fact);
      const sup = mk(`<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:6px"></div>`); card.appendChild(sup);
      const opt = mk(`<div class="tag" style="margin-top:2px"></div>`); card.appendChild(opt);
      const q = modelChip(S, '', 1130, 200, { cls: 'sm g', tone: 'q', style: 'white-space:normal;max-width:430px;font-size:28px' }), a = modelChip(S, '', 1130, o.follow ? 565 : 318, { cls: 'sm', tone: 's', style: 'font-size:28px' });
      const follow = S.el(`<div class="lv hidden-lv" style="left:1130px;top:330px;width:430px"></div>`);
      const tal = tallyPanel(S, 24, 262); tal.style.width = '300px';
      const nb = pagerButtons(S, 340, 724, () => go(-1), () => go(1), 'Next card ▶');
      S.reg(q, o.qAt || 1); S.reg(a, o.aAt || 2);
      function draw() {
        const c = o.cards[order[pos]];
        cnt.innerHTML = T(`Card ${pos + 1} of ${o.cards.length}`);
        art.innerHTML = c.art; prompt.innerHTML = T(c.prompt); fact.innerHTML = T(c.fact); fact.style.display = c.fact ? '' : 'none';
        opt.innerHTML = c.optional ? T('Optional · you can invent your answer.') : '';
        sup.innerHTML = (CFG.support && o.sup) ? o.sup(c).map(w => `<span class="chip cream" style="font-size:22px;padding:2px 12px">${T(w)}</span>`).join('') : '';
        q.querySelector('span').innerHTML = T(c.q || ''); a.querySelector('span').innerHTML = T(c.a || '');
        q.querySelector('button').onclick = () => FE.speakOne(c.q, 'q'); a.querySelector('button').onclick = () => FE.speakOne(c.a, 's');
        if (o.follow) { follow.innerHTML = `<div class="paper" style="padding:14px 20px"><div class="tag">${T('Follow-up picture question')}</div><div class="big" style="font-size:38px">${T(c.f)}</div><div style="margin:6px 0">${c.fart || ''}</div></div>`; }
        S.sayAtMap = o.sayMap(c);
        FE.setLevel(0, true);
      }
      function go(d) { pos = (pos + d + order.length) % order.length; Aud.sfx('card'); S.interrupt(); draw(); if (o.speakCard) S.say(o.speakCard(o.cards[order[pos]]).t, { tone: o.speakCard(o.cards[order[pos]]).tone }).catch(x => { if (x !== CANCEL) console.error(x); }); }
      S.onSupport = () => draw();
      S.levels = o.levels; S.revLabels = o.revLabels;
      if (o.follow) S.reg(follow, 2), S.reg(a, 3);
      S.onLevel = (n) => { if (n) Fx.burst(1360, 280, 10); };
      draw();
      S.play = async () => {
        await S.sleep(250);
        await S.say(o.intro, {});
        if (o.speakCard) { const sc = o.speakCard(o.cards[order[pos]]); await S.say(sc.t, { tone: sc.tone }); }
      };
    }
  };
}

const pic = {
  pen: () => `<g transform="translate(400,170)">${A.obj.pen(0, 0, 2.6)}</g>`,
  laptop: () => `<g transform="translate(400,250)">${A.obj.laptop(0, 0, 1.8)}${newTag(150, -150, 46)}</g>`,
  books: () => `<g transform="translate(300,230)">${A.obj.books(0, 0, 2.6)}</g>`,
  bag: () => `<g transform="translate(400,270)">${A.obj.bag(0, 0, 2.2)}</g>`,
  phone: () => `<g transform="translate(400,300)">${A.obj.phone(0, 0, 2.8)}${newTag(110, -190, 44)}</g>`,
  one: (k, x = 400, s = 0.55) => A.person({ k, x, y: 320, s, pose: 'rest', look: [0, 0] }),
  two: (k1, k2) => A.person({ k: k1, x: 280, y: 320, s: 0.55, pose: 'rest', look: [3, 0] }) + A.person({ k: k2, x: 520, y: 320, s: 0.55, pose: 'rest', look: [-3, 0] }),
  door: () => `<g transform="translate(400,330) scale(.95)">${A.obj.door(0, 0, 1, '12')}</g>`,
  self: () => `<g transform="translate(400,170)">${A.icon.person(0, 0, 4, '#4a4fa8')}<text x="90" y="-10" font-family="Georgia,serif" font-weight="700" font-size="120" fill="#ff6f61">?</text></g>`,
  shelfBooks: () => `<g transform="translate(180,170)">${A.obj.shelf(0, 0, 300, true)}</g><g transform="translate(500,320)">${A.obj.desk(-200, -100, 360, 40)}</g>`,
  house: () => `<g transform="translate(250,200)">${A.obj.house(0, 0, 2.3)}</g><g transform="translate(540,170)">${A.icon.person(0, 0, 2.2, '#4a4fa8')}</g>`
};

const CH7 = {
  n: 7, title: 'Speaking lab: ask, answer, check', min: 7, bg: 'night',
  steps: [
    {
      id: '7.1', title: 'The speaking lab', sec: 30, bg: 'night', music: 'bed', es: 'Tres rondas con menos ayuda cada vez: A) haz una pregunta, B) responde con una respuesta corta, C) haz tu propia pregunta. Las preguntas personales son opcionales y puedes inventar la respuesta.',
      build(S) {
        S.supportable = false;
        const R = [['A', 'Ask one question', 'Support: frame and word cards', 3], ['B', 'Answer with a complete short answer', 'Support: answer frame', 2], ['C', 'Ask your own question. Answer a follow-up picture question.', 'Support: none', 1]];
        const cards = R.map((r, i) => { const c = S.paper(70 + i * 330, 150 + (i === 1 ? 40 : 0), 300, 380, { cls: 'tilt' + (1 + i % 2) }); c.innerHTML = `<div class="chip gold" style="font-size:38px;margin-bottom:8px">${r[0]}</div><div style="font-size:30px;font-weight:700;line-height:1.2">${T(r[1])}</div><div style="margin-top:14px;display:flex;gap:6px">${[1, 2, 3].map(n => `<i style="display:block;width:44px;height:14px;border-radius:7px;background:${n <= r[3] ? 'var(--turq)' : 'rgba(20,23,63,.2)'}"></i>`).join('')}</div><div class="small" style="margin-top:6px;font-size:20px;color:var(--turq-d);font-weight:700">${T(r[2])}</div>`; c.classList.add('lv', 'hidden-lv'); return c; });
        const note = S.el(`<div class="note-card lv hidden-lv" style="left:70px;top:600px;width:980px;font-size:26px">${T('Personal questions are optional. You can invent your answer.')}</div>`);
        tallyPanel(S, 1130, 200);
        S.play = async () => {
          await S.sleep(250);
          const t = ['Round A: ask one question.', 'Round B: answer with a short answer.', 'Round C: ask your own question.'];
          for (let i = 0; i < 3; i++) { cards[i].classList.remove('hidden-lv'); Aud.sfx('card'); await S.say(t[i], { after: 100 }); }
          note.classList.remove('hidden-lv'); await S.say('Personal questions are optional. | You can invent your answer.');
        };
      }
    },
    deckStep({
      id: '7.2', title: 'Round A: ask one question', level: 'Round A · most support', support: true, levels: 2, revLabels: ['Show an example question', 'Show the answer'],
      intro: 'Take a card. Ask one question.', es: 'Ronda A: toma una tarjeta y haz una pregunta. Si «Support» está encendido, ves una guía. Después otro estudiante responde.',
      sup: c => c.bank, sayMap: c => ({ 1: { text: c.q, o: { tone: 'q' } }, 2: { text: c.a, o: { tone: 's' } } }),
      cards: [
        { art: pic.pen(), prompt: 'Ask about the pen.', fact: 'The pen is blue.', bank: ['Is the pen ___ ?', 'blue'], q: 'Is the pen blue?', a: 'Yes, it is.' },
        { art: pic.laptop(), prompt: 'Ask about the laptop.', fact: 'The laptop is new.', bank: ['Is the laptop ___ ?', 'new'], q: 'Is the laptop new?', a: 'Yes, it is.' },
        { art: pic.books(), prompt: 'Ask about the books.', fact: 'The books are on the desk.', bank: ['Are the books ___ ?', 'on the desk'], q: 'Are the books on the desk?', a: 'Yes, they are.' },
        { art: pic.one('nora'), prompt: 'Ask about Nora.', fact: 'Nora (she): a teacher.', bank: ['Is she ___ ?', 'a teacher'], q: 'Is she a teacher?', a: 'Yes, she is.' },
        { art: pic.one('sam'), prompt: 'Ask about Sam.', fact: 'Sam (he): late today.', bank: ['Is he ___ ?', 'late'], q: 'Is he late?', a: 'Yes, he is.' },
        { art: pic.two('alex', 'maya'), prompt: 'Ask about Alex and Maya.', fact: 'Alex and Maya: in class.', bank: ['Are they ___ ?', 'in class'], q: 'Are they in class?', a: 'Yes, they are.' },
        { art: pic.door(), prompt: 'Ask about the door.', fact: 'Our class: Room 12.', bank: ['Is it ___ ?', 'Room 12'], q: 'Is it Room 12?', a: 'Yes, it is.' },
        { art: pic.self(), prompt: 'Ask a partner: are you ready?', fact: '', optional: true, bank: ['Are you ___ ?', 'ready'], q: 'Are you ready?', a: 'Yes, I am.' }
      ]
    }),
    deckStep({
      id: '7.3', title: 'Round B: answer with a short answer', level: 'Round B · medium support', support: true, levels: 2, qAt: 1, aAt: 2, revLabels: ['Show the model question', 'Show the short answer'],
      speakCard: c => ({ t: c.q, tone: 'q' }),
      intro: 'I ask. You answer.', es: 'Ronda B: escucha la pregunta y responde con una respuesta corta completa. Con «Support» ves una guía de respuesta.',
      sup: c => c.bank, sayMap: c => ({ 1: { text: c.q, o: { tone: 'q' } }, 2: { text: c.a, o: { tone: 's' } } }),
      cards: [
        { art: pic.pen(), prompt: 'Is the pen red?', fact: 'The pen is blue.', bank: ['No, ___ ___ not.', 'it', 'isn’t'], q: 'Is the pen red?', a: 'No, it isn’t.' },
        { art: pic.one('maya'), prompt: 'Is Maya a doctor?', fact: 'Maya (she): a doctor.', bank: ['Yes, ___ ___ .', 'she', 'is'], q: 'Is Maya a doctor?', a: 'Yes, she is.' },
        { art: pic.two('alex', 'sam'), prompt: 'Are Alex and Sam at home?', fact: 'Alex and Sam: in class.', bank: ['No, ___ ___ not.', 'they', 'aren’t'], q: 'Are Alex and Sam at home?', a: 'No, they aren’t.' },
        { art: pic.laptop(), prompt: 'Is the laptop new?', fact: 'The laptop is new.', bank: ['Yes, ___ ___ .', 'it', 'is'], q: 'Is the laptop new?', a: 'Yes, it is.' },
        { art: pic.shelfBooks(), prompt: 'Are the books on the shelf?', fact: 'The books are on the desk.', bank: ['No, ___ ___ not.', 'they', 'aren’t'], q: 'Are the books on the shelf?', a: 'No, they aren’t.' },
        { art: pic.one('sam'), prompt: 'Is Sam late?', fact: 'Sam (he): late today.', bank: ['Yes, ___ ___ .', 'he', 'is'], q: 'Is Sam late?', a: 'Yes, he is.' },
        { art: pic.one('nora'), prompt: 'Is Nora a student?', fact: 'Nora (she): a teacher.', bank: ['No, ___ ___ not.', 'she', 'isn’t'], q: 'Is Nora a student?', a: 'No, she isn’t.' },
        { art: pic.self(), prompt: 'Are you ready?', fact: '', optional: true, bank: ['Yes, I am.', 'No, I’m not.'], q: 'Are you ready?', a: 'Yes, I am. / No, I’m not.' }
      ]
    }),
    deckStep({
      id: '7.4', title: 'Round C: your own question', level: 'Round C · least support', support: false, levels: 3, follow: true, qAt: 1, aAt: 3, revLabels: ['Show an example question', 'Show the follow-up picture question', 'Show the follow-up answer'],
      intro: 'Ask your own question. Then answer one more.', es: 'Ronda C: haz tu propia pregunta sobre la imagen. Después el profesor muestra una pregunta de seguimiento y otro estudiante la responde.',
      sup: c => [c.frame], sayMap: c => ({ 1: { text: c.q, o: { tone: 'q' } }, 2: { text: c.f, o: { tone: 'q' } }, 3: { text: c.a, o: { tone: 's' } } }),
      cards: [
        { art: `<g transform="translate(150,150)">${pic.pen().replace('translate(400,170)', 'translate(60,10)')}</g><g transform="translate(330,250)">${A.obj.laptop(0, 0, 1.2)}</g><g transform="translate(560,250)">${A.obj.books(0, 0, 1.6)}</g>`, prompt: 'Topic: classroom objects', fact: 'The pen is blue. The laptop is new. The books are on the desk.', frame: 'Is / Are ___ ___ ?', q: 'Is the pen blue?', f: 'Are the books on the shelf?', a: 'No, they aren’t.' },
        { art: pic.one('nora', 150, 0.5) + pic.one('alex', 400, 0.5) + pic.one('sam', 650, 0.5), prompt: 'Topic: readiness', fact: 'Nora: ready. Alex: ready. Sam: not ready.', frame: 'Is / Are ___ ___ ?', q: 'Is Sam ready?', f: 'Is Alex ready?', a: 'Yes, he is.' },
        { art: pic.house(), prompt: 'Topic: places', fact: 'Sam is at home. Maya is in class.', frame: 'Is / Are ___ ___ ?', q: 'Is Sam at home?', f: 'Is Maya at home?', a: 'No, she isn’t.' },
        { art: pic.door(), prompt: 'Topic: labeled facts', fact: 'Our class: Room 12. Alex is in Room 12.', frame: 'Is / Are ___ ___ ?', q: 'Is Alex in Room 12?', f: 'Is he in the right room?', a: 'Yes, he is.' },
        { art: `<g transform="translate(250,300)">${A.obj.bag(0, 0, 1.8, '#d8453a', '#8f2a22')}</g><g transform="translate(560,300)">${A.obj.phone(0, 0, 2.2)}${newTag(90, -150, 40)}</g>`, prompt: 'Topic: classroom objects', fact: 'The bag is red. The phone is new.', frame: 'Is / Are ___ ___ ?', q: 'Is the phone new?', f: 'Is the bag blue?', a: 'No, it isn’t.' },
        { art: pic.two('alex', 'maya'), prompt: 'Topic: readiness', fact: 'Alex and Maya: ready.', frame: 'Is / Are ___ ___ ?', q: 'Are they ready?', f: 'Are they late?', a: 'No, they aren’t.' }
      ]
    })
  ]
};
