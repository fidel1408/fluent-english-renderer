/* Chapter 6 · 39:00–54:00 · Interactive adult advice mission (3 scenarios, genuinely branching) */
(function (g) {
  'use strict';
  const FE = g.FE, { U, UB, h } = FE, C = FE.C;
  const E = FE.engine;

  /* ------------------------------------------------------------------ scenario data */
  const SC = {
    pres: {
      id: 'pres', name: 'The big presentation', env: ['office', { monitor: false }],
      actors: [['maya', 430, 735, 1.15, 0.35, 'stress'], ['daniel', 760, 745, 0.95, -0.4, 'neutral']], hero: 0,
      problems: [{ icon: 'doc', o: { lines: 2 }, t: 'unfinished outline' }, { icon: 'phone', t: 'buzzing notifications' }, { icon: 'pin', t: 'unsure about the room' }],
      flags: [{ icon: 'doc', o: { lines: 5 }, t: 'outline ready' }, { icon: 'mute', t: 'phone quiet' }, { icon: 'pin', t: 'room known', o: { c: '#2fa36b' } }],
      intro: [['a1', 'Scenario one. The big presentation. Maya presents tomorrow morning.'], ['a2', 'Problem one: the outline is not finished. Problem two: the phone keeps buzzing. Problem three: she is not sure about the room.', { gap: 0.7 }], ['a3', 'Which problem would you solve first?', { gap: 0.8 }]],
      round: ['r1', 'Round one. Maya\'s presentation. Partner A, you are Maya: ask for advice. Partner B, you are the advisor: give a recommendation and a reason. Then choose the path your pair picked.'],
      n1: [
        { icon: 'doc', t: 'finish the outline first', flag: 0, line: ['o1a', 'Maya finishes the outline. She feels calmer, but the phone still buzzes, and the room is still a question.'], ex: 'You should finish the outline first, because it is the biggest problem.' },
        { icon: 'mute', t: 'silence the notifications', flag: 1, line: ['o1b', 'The phone is quiet. Maya can think clearly, but the outline still needs work, and the room is still a question.'], ex: 'I think you should silence your phone, because it breaks your focus.' },
        { icon: 'calendar', t: 'confirm the meeting room', flag: 2, line: ['o1c', 'Maya checks the invitation and finds the building. She knows where to go, but the outline is still unfinished.'], ex: 'You should check the invitation, because you need the right room.' },
      ],
      twist: { icon: 'clock', o: { h: [-6, -20], m: [18, -10] }, t: 'meeting moved earlier', line: ['tw', 'New information! The manager moved the meeting thirty minutes earlier, and the room has changed.'], rev: ['rv', 'Does your advice still work? Listen to Maya\'s needs, and revise your recommendation.'] },
      n2: [
        { icon: 'people', t: 'ask Daniel to check the room', flag: 2, line: ['o2a', 'Daniel checks the room for her. That might save time, and Maya can keep working.'], ex: 'You should ask Daniel to check the room, because Maya has less time now.' },
        { icon: 'slides', t: 'make the talk shorter', flag: 0, line: ['o2b', 'Maya shortens the presentation. The outline is ready, and the shorter version fits the new time.'], ex: 'I think you should make the talk shorter, because the meeting starts earlier.' },
        { icon: 'mute', t: 'turn off the phone and work', flag: 1, line: ['o2c', 'Maya turns off her phone and works faster. She is focused, though other questions remain.'], ex: 'You should turn off your phone, because you need to focus now.' },
      ],
      fin: [['f1', 'Your two steps work together. Maya feels prepared. Nothing is guaranteed, but she has a clear plan.'], ['f2', 'You used the same kind of step twice. Maya improved one thing, but other problems are still open. Another step might help.']],
      model: [0, 0], tw: { a: 'dusk' },
    },
    trip: {
      id: 'trip', name: 'The group trip', env: ['station', {}],
      actors: [['priya', 190, 765, 0.9, 0.35, 'worry'], ['hana', 470, 770, 0.9, 0.2, 'think'], ['marcus', 740, 775, 0.9, -0.3, 'neutral']], hero: 0,
      problems: [{ icon: 'ticket', t: 'tickets not bought' }, { icon: 'clock', t: 'the train leaves early' }, { icon: 'people', t: 'friends live far apart' }],
      flags: [{ icon: 'ticket', t: 'tickets ready', o: {} }, { icon: 'clock', t: 'extra time', o: { h: [-20, -12], m: [12, -28] } }, { icon: 'chat', t: 'plan shared' }],
      intro: [['a1', 'Scenario two. A group trip. Priya, Marcus, and Hana want to take an early train on Saturday.'], ['a2', 'Problem one: nobody has bought the tickets. Problem two: the train leaves very early. Problem three: the friends live far apart.', { gap: 0.7 }], ['a3', 'Which problem would you solve first?', { gap: 0.8 }]],
      round: ['r2', 'Round two. The group trip. Switch roles. Partner B asks for advice. Partner A gives a recommendation and a reason. Then choose the path your pair picked.'],
      n1: [
        { icon: 'ticket', t: 'buy the tickets today', flag: 0, line: ['o1a', 'The tickets are bought. Everyone can board, but the meeting time and the plan are still unclear.'], ex: 'You should buy the tickets today, because prices may go up.' },
        { icon: 'clock', t: 'meet at the station early', flag: 1, line: ['o1b', 'The friends agree to arrive early. There is time to adapt, but the tickets are still not bought.'], ex: 'I think we should meet early, because the train leaves early.' },
        { icon: 'chat', t: 'share the plan in a group message', flag: 2, line: ['o1c', 'The group message shows the plan. Everyone knows the meeting point, but the tickets are still not bought.'], ex: 'You should send a group message, because everyone lives far away.' },
      ],
      twist: { icon: 'train', t: 'the train is late', line: ['tw', 'New information! The train is delayed by forty minutes, and Marcus is still at home.'], rev: ['rv', 'Does your advice still work? Listen to the group\'s needs, and revise your recommendation.'] },
      n2: [
        { icon: 'chat', t: 'send a new message to the group', flag: 2, line: ['o2a', 'Hana sends a message. Marcus sees it and leaves a little later. That might reduce stress for everyone.'], ex: 'You should send a new message, because Marcus does not know about the delay.' },
        { icon: 'coffee', t: 'wait at a café near the station', flag: 1, line: ['o2b', 'Priya and Hana wait at a café near the station. The delay feels shorter, though Marcus still needs to know.'], ex: 'I think we should wait at a café, because it is warm there.' },
        { icon: 'ticket', t: 'check a later train in the app', flag: 0, line: ['o2c', 'Priya checks the app and keeps the tickets flexible. It helps, but the group still needs one clear plan.'], ex: 'You should check the app, because there may be a later train.' },
      ],
      fin: [['f1', 'Your two steps cover different problems. The group has a clearer plan for the delay. Delays can still surprise us, so stay flexible.'], ['f2', 'You repeated one kind of step. The trip improved a little, but other timing problems remain. Another step might help.']],
      model: [2, 1],
    },
    flat: {
      id: 'flat', name: 'The shared apartment', env: ['apartment', {}],
      actors: [['hana', 300, 745, 1.1, 0.4, 'stress'], ['theo', 720, 755, 1.0, -0.4, 'neutral']], hero: 0,
      problems: [{ icon: 'speaker', t: 'loud music at night' }, { icon: 'sleep', t: 'early meetings' }, { icon: 'door', t: 'no clear agreement' }],
      flags: [{ icon: 'chat', t: 'he understands' }, { icon: 'calendar', t: 'agreement made' }, { icon: 'sleep', t: 'time to rest', o: {} }],
      intro: [['a1', 'Scenario three. A shared apartment. Hana has early meetings. Her roommate Theo practices music in the evening.'], ['a2', 'Problem one: the music is loud late at night. Problem two: Hana needs sleep before work. Problem three: they have no clear agreement.', { gap: 0.7 }], ['a3', 'Which problem would you solve first?', { gap: 0.8 }]],
      round: ['r3', 'Round three. The shared apartment. Switch roles again. Partner A asks for advice. Partner B gives a recommendation and a reason. Then choose the path your pair picked.'],
      n1: [
        { icon: 'chat', t: 'talk to Theo calmly tonight', flag: 0, line: ['o1a', 'Hana talks with Theo calmly. He listens, and they understand each other better, though they have no agreement yet.'], ex: 'You should talk to him calmly, because he may not know the problem.' },
        { icon: 'note', t: 'leave a friendly note', flag: 0, line: ['o1b', 'Hana leaves a friendly note. Theo reads it, but he cannot answer right away, so the situation stays unclear.'], ex: 'I think you should leave a friendly note, because it is polite.' },
        { icon: 'headphones', t: 'wear headphones and say nothing', flag: 2, line: ['o1c', 'Hana wears headphones and sleeps better tonight. The problem is not discussed, so it might return tomorrow.'], ex: 'You could wear headphones, but I don\'t think you should stay silent for long.' },
      ],
      twist: { icon: 'calendar', t: 'concert on Saturday', line: ['tw', 'New information! Theo has a concert on Saturday. He needs to practice every evening this week.'], rev: ['rv', 'Does your advice still work? Listen to both people\'s needs, and revise your recommendation.'] },
      n2: [
        { icon: 'calendar', t: 'agree on quiet hours after ten', flag: 1, line: ['o2a', 'They agree: music until ten, and headphones after that. Both people have a plan.'], ex: 'You should agree on quiet hours, because you both have needs.' },
        { icon: 'coffee', t: 'invite Theo for coffee to talk', flag: 0, line: ['o2b', 'Over coffee, Theo explains the concert, and Hana explains her mornings. They understand each other better.'], ex: 'I think you should invite him for coffee, because a friendly talk helps.' },
        { icon: 'clock', t: 'ask Theo to practice earlier', flag: 2, line: ['o2c', 'Theo practices earlier in the evening. Hana can rest, though they still need a clear agreement.'], ex: 'You should ask him to practice earlier, because you start work early.' },
      ],
      fin: [['f1', 'Your steps cover different needs. Hana and Theo can work out a clearer plan. It still depends on both people, so keep talking.'], ['f2', 'Your steps were similar. Some things improved, but one need is still open. Another step might help.']],
      model: [0, 0],
    },
  };
  FE.MISSION = SC;
  const KEYS = ['pres', 'trip', 'flat'];
  const st = (id) => (E.mission[id] = E.mission[id] || { prio: null, n1: null, n2: null, auto1: false, auto2: false });
  const eff = (id, which) => { const s = st(id); if (s[which] != null) return s[which]; return SC[id].model[which === 'n1' ? 0 : 1]; };
  function flagsOf(id, upto) {
    const f = [false, false, false]; const sc = SC[id], s = st(id);
    if (s.n1 != null) f[sc.n1[s.n1].flag] = true;
    if (upto !== 1 && s.n2 != null) f[sc.n2[s.n2].flag] = true;
    return f;
  }
  const count = (f) => f.filter(Boolean).length;
  const moodOf = (n) => (n >= 2 ? 'relief' : n === 1 ? 'think' : 'stress');
  FE.mission_flags = flagsOf;

  /* ------------------------------------------------------------------ shared builders */
  function envFor(S, sc, mood) { S.env(sc.env[0], Object.assign({}, sc.env[1], mood ? { mood } : {})); }
  function actorsFor(S, sc, scaleMul) {
    return sc.actors.map((a) => S.actor(a[0], { x: a[1], y: a[2], scale: a[3] * (scaleMul || 1), facing: a[4], arms: ['rest', 'rest'], expr: a[5] }));
  }
  function tokens(S, sc, layout, flags) {
    const pos = layout === 'wide' ? [[1090, 330], [1390, 330], [1650, 330]] : [[120, 235], [350, 235], [580, 235]];
    const size = layout === 'wide' ? 130 : 96, els = [];
    sc.problems.forEach((p, i) => {
      const el = S.ui('', 'tok anim', { position: 'absolute', left: pos[i][0] + 'px', top: pos[i][1] + 'px', width: (layout === 'wide' ? 250 : 210) + 'px', textAlign: 'center', zIndex: 13, transform: layout === 'wide' ? 'translateX(-20px)' : '' });
      el.style.fontSize = layout === 'wide' ? '30px' : '24px';
      els.push(el); paint(i);
      function paint(k) { const on = flags && flags[k]; const src = on ? sc.flags[k] : sc.problems[k]; el.innerHTML = `<div style="position:relative;display:inline-block;filter:drop-shadow(0 8px 12px rgba(0,0,0,.45))">${FE.iconSVG(src.icon, size, src.o || {})}${on ? '<span style="position:absolute;right:-8px;top:-6px;width:44px;height:44px;border-radius:50%;background:#2fa36b;color:#fff;font-size:30px;line-height:44px;font-weight:800;border:3px solid #fff">&#10003;</span>' : ''}</div><div style="margin-top:4px;padding:2px 10px 6px;border-radius:14px;background:rgba(10,16,30,.8)">${UB(src.t)}</div>`; }
      el._paint = paint;
    });
    return els;
  }
  function setToken(S, els, i, on, sc) {
    const el = els[i]; const src = on ? sc.flags[i] : sc.problems[i]; el._paint(i);
    const f = on; // repaint with status
    const prev = el.innerHTML; // placeholder to keep API simple
    el._on = on; el.innerHTML = el.innerHTML; // no-op
  }
  /* repaint tokens from a flag array */
  function refresh(els, sc, flags, S, pulse) {
    els.forEach((el, k) => {
      const on = flags[k]; const src = on ? sc.flags[k] : sc.problems[k]; const size = el.style.fontSize === '30px' ? 130 : 96;
      el.innerHTML = `<div style="position:relative;display:inline-block;filter:drop-shadow(0 8px 12px rgba(0,0,0,.45))">${FE.iconSVG(src.icon, size, src.o || {})}${on ? '<span style="position:absolute;right:-8px;top:-6px;width:44px;height:44px;border-radius:50%;background:#2fa36b;color:#fff;font-size:30px;line-height:44px;font-weight:800;border:3px solid #fff">&#10003;</span>' : ''}</div><div style="margin-top:4px;padding:2px 10px 6px;border-radius:14px;background:rgba(10,16,30,.8)">${UB(src.t)}</div>`;
      if (pulse === k && S && !S.fast) { el.style.transition = 'transform .4s'; el.style.transform = 'scale(1.22)'; setTimeout(() => { el.style.transform = ''; }, 500); }
    });
  }
  function react(actors, sc, n, S) {
    const hero = actors[sc.hero]; hero.expr(moodOf(n));
    if (n >= 2) { hero.arm('R', 'heart'); setTimeout(() => hero.arm('R', 'rest'), 1400); } else if (n === 0) hero.arm('L', 'chin'); else hero.arm('L', 'rest');
    actors.forEach((a, i) => { if (i !== sc.hero && n >= 1) a.expr('smile'); });
  }
  function speakLine(S, sc, key) { if (S.seg.C[key]) C.playClip(S, key); }
  function textFor(line) { return line[1]; }

  /* ------------------------------------------------------------------ 6.1–6.3 scenario introductions */
  KEYS.forEach((k, idx) => {
    const sc = SC[k];
    FE.seg({
      id: '6.' + (idx + 1), ch: 6, title: 'Scenario ' + ['one', 'two', 'three'][idx] + ': ' + sc.name.toLowerCase().replace(/^the /, 'the '), dur: 45, music: 'warm', lead: 0.8,
      lines: sc.intro.map((l, i) => l.length > 2 ? l : [l[0], l[1]]),
      build(S, L) {
        envFor(S, sc); const actors = actorsFor(S, sc);
        const els = tokens(S, sc, 'wide', null);
        const badges = [0, 1, 2].map((i) => C.badge(S, i + 1, [1090, 1390, 1650][i] + 90, 250));
        els.forEach((e, i) => { S.at('a2>+' + (i * 3.2), () => { S.in(e); S.in(badges[i], 0.2); S.sfx('pop'); actors[sc.hero].expr(['worry', 'stress', 'think'][i]); }); });
        S.at('a1', () => { actors.forEach((a) => a.expr('listen')); actors[sc.hero].gesture('nod'); });
        C.think(S, 'a3>+0.2', 17, 1000, 700, 'Talk');
        C.notes(S, ['Learners understand the scenario and the three problems. They think about which one to solve first.']);
      },
    });
  });

  /* ------------------------------------------------------------------ 6.4 choose priorities */
  FE.seg({
    id: '6.4', ch: 6, title: 'Choose your priorities', dur: 45, music: 'off', lead: 0.6, gate: true, timer: {},
    lines: [['n1', 'Choose the problem to solve first in each scenario. There is no single correct answer. Be ready to explain why.']],
    build(S) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.7);
      const cols = KEYS.map((k, ci) => {
        const sc = SC[k];
        const el = S.ui(`<div class="lab" style="text-align:center">${UB(sc.name)}</div>` + sc.problems.map((p, i) => `<button class="opt" type="button" data-i="${i}" style="width:100%;margin-top:10px;font-size:30px;padding:8px 14px 10px">${FE.iconSVG(p.icon, 56, p.o || {})}<span>${UB(p.t)}</span><span class="star" style="margin-left:auto;font-size:34px;display:none">&#9733;</span></button>`).join(''), 'panel', { left: 70 + ci * 610 + 'px', top: '200px', width: '580px', zIndex: 14 });
        el.querySelectorAll('.opt').forEach((b) => {
          b.onclick = () => { el.querySelectorAll('.opt').forEach((x) => { x.classList.remove('sel'); x.querySelector('.star').style.display = 'none'; }); b.classList.add('sel'); b.querySelector('.star').style.display = 'inline'; st(k).prio = +b.dataset.i; S.sfx('click'); };
          if (st(k).prio === +b.dataset.i) { b.classList.add('sel'); b.querySelector('.star').style.display = 'inline'; }
        });
        return el;
      });
      const reason = S.ui(`<div style="font-size:34px;text-align:center">${UB('Say why. Use: I think … first, because …')}</div>`, 'panel', { left: '70px', top: '700px', width: '1780px', zIndex: 14 });
      S.onReveal(() => { KEYS.forEach((k, ci) => { if (st(k).prio == null) { const b = cols[ci].querySelectorAll('.opt')[0]; b.classList.add('sel'); b.querySelector('.star').style.display = 'inline'; st(k).prio = 0; } }); });
      S.at(S.seg.dur - 5, () => { if (S.mode === 'demo') S.doReveal(); });
      C.notes(S, ['Learners vote or discuss. Any priority is acceptable if the reason is sensible.', 'The star is stored and shown again in the final comparison.']);
    },
  });

  /* ------------------------------------------------------------------ 6.5–6.7 pair rounds with branching decision */
  const ROLES = [['A', 'B'], ['B', 'A'], ['A', 'B']];
  const SUPPORT = ['What should I do?', 'You should…', 'You shouldn\'t…', 'I think you should…', '…because…'];
  KEYS.forEach((k, idx) => {
    const sc = SC[k];
    FE.seg({
      id: '6.' + (5 + idx), ch: 6, title: 'Pair round ' + ['one', 'two', 'three'][idx], dur: 100, music: 'off', lead: 0.6, gate: true, timer: {}, revealAt: 86,
      lines: [[sc.round[0], sc.round[1]]],
      clips: sc.n1.map((o) => [o.line[0], o.line[1]]),
      build(S, L) {
        envFor(S, sc); C.dim(S, 0.55, 'linear-gradient(90deg,rgba(6,9,18,.1),rgba(6,9,18,.5) 40%,rgba(6,9,18,.82))');
        const actors = actorsFor(S, sc, 1);
        const s = st(k); const flags = flagsOf(k, 1);
        const els = tokens(S, sc, 'compact', flags); els.forEach((e) => S.in(e)); refresh(els, sc, flags);
        const asker = ROLES[idx][0], adv = ROLES[idx][1];
        const P = S.ui('', 'panel', { left: '830px', top: '185px', width: '1050px', zIndex: 15, padding: '14px 24px 16px' });
        P.innerHTML = `<div style="display:flex;gap:16px"><div class="paper card" style="position:relative;flex:1;padding:10px 16px 12px;font-size:30px;border-radius:20px"><div class="lab" style="color:#b35f00">${UB('Partner ' + (asker === 'A' ? '{=A|eɪ}' : asker))}</div><div style="display:flex;align-items:center;gap:12px">${FE.iconSVG('ask', 52)}${UB('asks for advice')}</div></div><div class="paper card" style="position:relative;flex:1;padding:10px 16px 12px;font-size:30px;border-radius:20px"><div class="lab" style="color:#0b7a43">${UB('Partner ' + (adv === 'A' ? '{=A|eɪ}' : adv))}</div><div style="display:flex;align-items:center;gap:12px">${FE.iconSVG('bulb', 52)}${UB('gives advice and a reason')}</div></div></div>
          <div class="lab" style="margin-top:14px">${UB('Choose the path your pair picked')}</div><div class="cards" style="display:flex;flex-direction:column;gap:8px;margin-top:6px"></div><div class="ex" style="display:none;margin-top:8px"></div>
          <div class="sup" style="display:none;margin-top:8px"></div><div class="ft" style="display:flex;gap:12px;margin-top:10px"></div>`;
        const cards = P.querySelector('.cards'), ex = P.querySelector('.ex'), sup = P.querySelector('.sup'), ft = P.querySelector('.ft');
        const btns = sc.n1.map((o, i) => {
          const b = h('button', { class: 'opt', type: 'button', style: { fontSize: '32px', padding: '8px 18px 10px' }, html: `<span class="ick">${i + 1}</span>${FE.iconSVG(o.icon, 56, o.o || {})}<span>${UB(o.t)}</span>` });
          b.onclick = () => choose(i, false); cards.appendChild(b); return b;
        });
        sup.innerHTML = SUPPORT.map((t) => `<span class="paper card" style="position:relative;display:inline-block;padding:4px 14px 6px;margin:4px;font-size:27px;border-radius:14px">${UB(t)}</span>`).join('');
        ft.appendChild(h('button', { class: 'btn sm ghost', type: 'button', html: UB('Language help'), onclick: () => { sup.style.display = sup.style.display === 'none' ? 'block' : 'none'; S.sfx('click'); } }));
        S.hint(() => { sup.style.display = 'block'; });
        const note = S.ui('', 'panel', { left: '830px', top: '800px', width: '1050px', zIndex: 15, padding: '12px 22px 16px', display: 'none', fontSize: '32px' });
        function choose(i, auto) {
          if (st(k).n1 != null && !auto && st(k).n1 === i && st(k).lock) return;
          const s2 = st(k); s2.n1 = i; s2.auto1 = !!auto; S.sfx('ok');
          btns.forEach((b, j) => { b.classList.toggle('ok', j === i); b.classList.toggle('dim', j !== i); b.querySelector('.ick').textContent = j === i ? '✓' : String(j + 1); });
          const f = flagsOf(k, 1); refresh(els, sc, f, S, sc.n1[i].flag);
          react(actors, sc, count(f), S);
          sc.n1[i].anim && sc.n1[i].anim(S, actors);
          C.playClip(S, sc.n1[i].line[0]);
          note.style.display = 'block'; note.innerHTML = `<span style="color:#7a5cd0;font-weight:800;background:#fbf8f1;border-radius:10px;padding:0 10px">${UB('maybe')}</span> ${UB(sc.n1[i].line[1])}` + (auto ? `<div style="font-size:24px;color:#ffd48a;margin-top:6px">${UB('This is an example path.')}</div>` : '');
          if (S.fast) { note.style.display = 'block'; }
        }
        S.onReveal(() => {
          ex.style.display = 'block';
          ex.innerHTML = `<div class="lab">${UB('Example advice')}</div>` + sc.n1.map((o) => `<div class="paper card" style="position:relative;margin:4px 0;padding:6px 16px 8px;font-size:29px;border-radius:14px;text-align:left">${UB(o.ex)}</div>`).join('');
          if (st(k).n1 == null) choose(sc.model[0], true); S.sfx('reveal');
        });
        if (s.n1 != null) { btns[s.n1].classList.add('ok'); btns.forEach((b, j) => { if (j !== s.n1) b.classList.add('dim'); }); }
        C.notes(S, ['Partner roles switch each round, so both learners ask and advise.', 'Model answers stay hidden until you press Show answer.', 'Choose the path your pair agreed on. The scene changes with each choice.']);
      },
    });
  });

  /* ------------------------------------------------------------------ 6.8–6.10 new information, revised advice */
  KEYS.forEach((k, idx) => {
    const sc = SC[k];
    FE.seg({
      id: '6.' + (8 + idx), ch: 6, title: 'New information: ' + ['the presentation', 'the group trip', 'the apartment'][idx], dur: 80, music: 'off', lead: 10.5, gate: true, timer: { at: 27 }, revealAt: 66,
      lines: [[sc.twist.line[0], sc.twist.line[1]], [sc.twist.rev[0], sc.twist.rev[1], { gap: 1.2 }]],
      clips: [...sc.n1.map((o) => ['r' + o.line[0], o.line[1]]), ...sc.n2.map((o) => [o.line[0], o.line[1]]), sc.fin[0], sc.fin[1]],
      build(S, L) {
        const pre = flagsOf(k, 1); const s = st(k);
        envFor(S, sc, null); C.dim(S, 0.5, 'linear-gradient(90deg,rgba(6,9,18,.1),rgba(6,9,18,.5) 40%,rgba(6,9,18,.82))');
        const actors = actorsFor(S, sc, 1);
        const els = tokens(S, sc, 'compact', pre); els.forEach((e) => S.in(e)); refresh(els, sc, pre);
        react(actors, sc, count(pre), S);
        // recap of the earlier choice (spoken, example path if none was chosen)
        const n1 = eff(k, 'n1'); if (s.n1 == null) s.auto1 = true;
        const recap = S.ui(`<div class="lab">${UB(s.auto1 && s.n1 == null ? 'Example path so far' : 'Your first step')}</div><div style="display:flex;align-items:center;gap:14px">${FE.iconSVG(sc.n1[n1].icon, 60, sc.n1[n1].o || {})}<div style="font-size:32px">${UB(sc.n1[n1].t)}</div></div>`, 'panel anim', { left: '830px', top: '185px', width: '1050px', zIndex: 15, padding: '12px 22px 14px' });
        S.at(0.5, () => { S.in(recap); C.playClip(S, 'r' + sc.n1[n1].line[0]); });
        if (s.n1 == null) S.at(0.4, () => { if (!st(k).n1 && st(k).n1 !== 0) { /* example state is shown but not stored as a learner choice */ } });
        // flags shown during recap use the example path when nothing was chosen
        if (s.n1 == null) { const f = [false, false, false]; f[sc.n1[n1].flag] = true; refresh(els, sc, f); }
        // twist
        const tw = S.ui(`<div style="display:flex;align-items:center;gap:18px">${FE.iconSVG(sc.twist.icon, 96, sc.twist.o || {})}<div><div class="lab" style="color:#ff9aa8;font-size:30px">${UB('New information')}</div><div style="font-size:42px">${UB(sc.twist.t)}</div></div></div>`, 'panel anim', { left: '830px', top: '300px', width: '1050px', zIndex: 15, borderColor: '#ff9aa8' });
        const tint = S.ui('', 'anim', { position: 'absolute', left: 0, top: 0, width: '1920px', height: '1080px', background: 'radial-gradient(ellipse at 60% 40%,rgba(255,120,90,.0),rgba(80,40,110,.38))', pointerEvents: 'none', zIndex: 6 });
        S.at(sc.twist.line[0], () => { S.in(tw); S.in(tint); S.sfx('ping'); actors.forEach((a) => a.expr('surprise')); S.out(recap); });
        S.at(sc.twist.line[0] + '>', () => { actors.forEach((a) => a.expr('worry')); });
        S.at(sc.twist.rev[0], () => { actors[sc.hero].expr('think'); });
        // revised options
        const P = S.ui('', 'panel', { left: '830px', top: '470px', width: '1050px', zIndex: 15, padding: '14px 22px 16px', display: 'none' });
        P.innerHTML = `<div class="lab">${UB('Choose your revised advice')}</div><div class="cards" style="display:flex;flex-direction:column;gap:8px;margin-top:6px"></div><div class="ex" style="display:none;margin-top:6px"></div>`;
        const cards = P.querySelector('.cards'), ex = P.querySelector('.ex');
        const btns = sc.n2.map((o, i) => { const b = h('button', { class: 'opt', type: 'button', style: { fontSize: '32px', padding: '8px 18px 10px' }, html: `<span class="ick">${i + 1}</span>${FE.iconSVG(o.icon, 52, o.o || {})}<span>${UB(o.t)}</span>` }); b.onclick = () => choose(i, false); cards.appendChild(b); return b; });
        S.at(26.5, () => { P.style.display = 'block'; });
        if (S.fast && S.seg.timerAt <= 26.5) { /* handled by cue replay */ }
        const res = S.ui('', 'panel anim', { left: '830px', top: '830px', width: '1050px', zIndex: 16, padding: '12px 22px 14px', fontSize: '31px' });
        function choose(i, auto) {
          const s2 = st(k); if (s2.n2 != null && s2.done) return; s2.n2 = i; s2.auto2 = !!auto; s2.done = true; S.sfx('ok');
          btns.forEach((b, j) => { b.classList.toggle('ok', j === i); b.classList.toggle('dim', j !== i); b.disabled = true; b.querySelector('.ick').textContent = j === i ? '✓' : String(j + 1); });
          // flags: the example n1 (if none chosen) + chosen n2
          const f = [false, false, false]; f[sc.n1[eff(k, 'n1')].flag] = true; f[sc.n2[i].flag] = true;
          refresh(els, sc, f, S, sc.n2[i].flag);
          S.out(tint); const n = count(f); react(actors, sc, n, S);
          const same = sc.n1[eff(k, 'n1')].flag === sc.n2[i].flag;
          const finKey = sc.fin[same ? 1 : 0][0];
          C.playClip(S, sc.n2[i].line[0]);
          const d = (S.seg.C[sc.n2[i].line[0]] || { dur: 6 }).dur;
          if (!S.fast) S.timeout(() => C.playClip(S, finKey), (d + 0.6) * 1000);
          res.innerHTML = `<span style="color:#7a5cd0;font-weight:800;background:#fbf8f1;border-radius:10px;padding:0 10px">${UB('maybe')}</span> ${UB(sc.n2[i].line[1])}<div style="margin-top:8px;color:#ffd48a">${UB(sc.fin[same ? 1 : 0][1])}</div>` + (auto ? `<div style="font-size:24px;margin-top:6px">${UB('This is an example path.')}</div>` : '');
          S.in(res);
        }
        S.onReveal(() => {
          ex.style.display = 'block'; ex.innerHTML = `<div class="lab">${UB('Example advice')}</div>` + sc.n2.map((o) => `<div class="paper card" style="position:relative;margin:4px 0;padding:5px 14px 7px;font-size:27px;border-radius:14px;text-align:left">${UB(o.ex)}</div>`).join('');
          if (st(k).n2 == null) choose(sc.model[1], true); S.sfx('reveal');
        });
        if (s.n2 != null && s.done) { P.style.display = 'block'; }
        C.notes(S, ['New information changes the situation. Ask: Does your first advice still work?', 'Learners listen to the person\'s needs and revise. They should not repeat a memorized sentence.']);
      },
    });
  });

  /* ------------------------------------------------------------------ 6.11 share and compare reasons */
  FE.seg({
    id: '6.11', ch: 6, title: 'Share and compare your reasons', dur: 120, music: 'off', lead: 0.6, gate: true, timer: { at: 22 },
    lines: [['n1', 'Share your recommendations with another pair. Which path did you choose? What was your reason? Compare your ideas, and listen for different good answers.']],
    build(S, L) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.74);
      KEYS.forEach((k, ci) => {
        const sc = SC[k], s = st(k), n1 = eff(k, 'n1'), n2 = eff(k, 'n2');
        const f = [false, false, false]; f[sc.n1[n1].flag] = true; f[sc.n2[n2].flag] = true;
        const star = s.prio != null ? `<div style="font-size:26px;color:#ffd48a">&#9733; ${UB(sc.problems[s.prio].t)}</div>` : '';
        const el = S.ui(`<div class="lab" style="text-align:center">${UB(sc.name)}</div>${star}
          <div style="margin-top:8px;display:flex;align-items:center;gap:10px;font-size:28px">${FE.iconSVG(sc.n1[n1].icon, 48, sc.n1[n1].o || {})}${UB(sc.n1[n1].t)}${s.n1 == null ? '<span style="color:#ffd48a">*</span>' : ''}</div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:10px;font-size:28px">${FE.iconSVG(sc.n2[n2].icon, 48, sc.n2[n2].o || {})}${UB(sc.n2[n2].t)}${s.n2 == null ? '<span style="color:#ffd48a">*</span>' : ''}</div>
          <div style="display:flex;gap:10px;margin-top:10px;justify-content:center">${sc.flags.map((fl, i) => `<span style="opacity:${f[i] ? 1 : 0.28}">${FE.iconSVG(fl.icon, 54, fl.o || {})}</span>`).join('')}</div>`, 'panel anim', { left: 60 + ci * 610 + 'px', top: '175px', width: '580px', zIndex: 14, padding: '16px 20px 18px' });
        S.at(1 + ci * 0.5, () => S.in(el));
      });
      const q = S.ui(['Which path did you choose?', 'Why? Use because.', 'Do you agree with another pair?'].map((t, i) => `<div class="paper card" style="position:relative;margin:6px 0;padding:8px 20px 10px;font-size:34px;border-radius:18px;text-align:left"><span style="display:inline-block;width:42px;height:42px;border-radius:50%;background:#ffb540;text-align:center;line-height:42px;font-weight:800;margin-right:12px">${i + 1}</span>${UB(t)}</div>`).join('') + `<div style="font-size:24px;margin-top:6px;color:#ffd48a">* ${UB('example path')}</div>`, 'panel anim', { left: '60px', top: '640px', width: '1800px', zIndex: 14, display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' });
      q.style.display = 'block';
      S.at(4, () => S.in(q));
      C.notes(S, ['Pairs share which path they chose and why. Listen for because.', 'There is no single correct path. Praise reasons that match the person\'s needs.']);
    },
  });

  /* ------------------------------------------------------------------ 6.12 mission wrap-up */
  FE.seg({
    id: '6.12', ch: 6, title: 'What the mission showed', dur: 60, music: 'warm', lead: 0.8,
    lines: [
      ['n1', 'Look at what happened. Each choice changed the situation, and new information changed it again.'],
      ['n2', 'Good advisers listen to the person\'s needs. They give a reason. And they revise their advice when the facts change.', { gap: 1.2 }],
      ['n3', 'Notice also: no path was a guarantee. Advice helps, but the result can still be uncertain.', { gap: 1.2 }],
      ['n4', 'Now let us bring our ideas together.', { gap: 1.2 }],
      ['n5', 'Turn to a partner. What new information changed your advice? Say it in one sentence.', { gap: 1.2 }],
    ],
    build(S, L) {
      S.env('office', { monitor: false, lamp: false, mood: 'gold' }); C.dim(S, 0.6);
      const maya = S.actor('maya', { x: 300, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'smile' });
      const chips = [['ear', 'listen to needs', 'chat'], ['reason', 'give a reason', 'bulb'], ['revise', 'revise the advice', 'replay']].map((c, i) => {
        const icon = c[2] === 'replay' ? 'clock' : c[2];
        return S.ui(`<div style="display:flex;align-items:center;gap:20px">${FE.iconSVG(icon, 90)}<div style="font-size:52px">${UB(c[1])}</div></div>`, 'panel anim', { left: '640px', top: 220 + i * 200 + 'px', width: '1160px', zIndex: 14, padding: '16px 28px 20px' });
      });
      S.at('n2', () => { chips[0].classList.add('on'); S.in(chips[0]); }); S.at('n2>-1.8', () => S.in(chips[1])); S.at('n2>-0.8', () => S.in(chips[2]));
      S.at('n3', () => { maya.expr('think'); });
      S.at('n4', () => { maya.expr('confident'); });
      C.think(S, 'n5>+0.2', 20, 1650, 820, 'Pair talk');
      C.notes(S, ['Link back: listening, reasons, revising, and uncertainty.']);
    },
  });
})(window);
