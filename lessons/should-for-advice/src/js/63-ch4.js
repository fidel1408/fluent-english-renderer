/* Chapter 4 · 21:00–29:00 · Ask for advice and practice pronunciation */
(function (g) {
  'use strict';
  const FE = g.FE, { U, UB } = FE, C = FE.C;

  /* 4.1 · should moves before the subject */
  FE.seg({
    id: '4.1', ch: 4, title: 'Should moves to the front', dur: 60, music: 'calm', lead: 0.8,
    lines: [
      ['n1', 'Now we ask for advice. Priya\'s sister is waiting for an answer, and Priya is not sure what to do.'],
      ['n2', 'Look at the statement: I should call her.', { gap: 1.0 }],
      ['n3', 'To make a direct question, move should in front of the subject.', { gap: 3.0 }],
      ['n4', 'Should, then the subject, then the base verb. No do. No does. No did.', { gap: 4.0 }],
      ['p1', 'Should I call her?', { who: 'priya', gap: 1.2 }],
      ['n5', 'That is a natural question. Listen for should at the start.', { gap: 0.8 }],
      ['n6', 'Your turn. Ask me a question with should. For example: Should I send the email?', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('cafe'); C.dim(S, 0.5);
      const pri = S.actor('priya', { x: 300, y: 770, scale: 1.05, facing: 0.4, arms: ['phone', 'rest'], expr: 'worry' });
      pri.holdProp('R', FE.icon('phone', {}), 'rotate(8) scale(.8) translate(0 -22)');
      const tr = C.sortChips(S, { x: 640, y: 300, size: 74, h: 200, items: [{ t: 'I', role: 's' }, { t: 'should', role: 'm' }, { t: 'call', role: 'v' }, { t: 'her.', role: 'o' }] });
      const lab = S.ui(`<div class="lab" id="mm">${UB('statement')}</div>`, 'anim', { position: 'absolute', left: '640px', top: '240px', zIndex: 14, fontSize: '34px' });
      const ghost = S.ui(`<div style="font-size:60px;opacity:.95">${U('{x|Do}')}</div>`, 'anim', { position: 'absolute', left: '660px', top: '480px', zIndex: 14 });
      const ban = S.ui(`<div style="font-size:30px;color:#ff8a9b;font-weight:800">&#10007; ${UB('no do, does, did')}</div>`, 'anim', { position: 'absolute', left: '860px', top: '500px', zIndex: 14 });
      tr.layout([0, 1, 2, 3]);
      S.at('n2', () => { S.in(lab); });
      S.at('n3>-1.6', () => { tr.set(3, 'her?', 'o'); tr.layout([1, 0, 2, 3]); lab.firstChild.innerHTML = UB('question'); S.sfx('swipe'); pri.expr('think'); });
      S.at('n4', () => { S.in(ghost); S.in(ban, 0.4); });
      S.at('n4>', () => { ghost.classList.add('hide'); });
      C.say(S, 'p1', pri, 0, 0, { x: 760, y: 640, side: 'right', w: 560, dark: false });
      S.at('p1', () => { pri.expr('worry'); pri.arm('L', 'talk'); });
      C.think(S, 'n6>+0.2', 11, 1500, 600, 'Say it');
      C.notes(S, ['Say: statement, then question. The modal moves in front of the subject.', 'Priya asks Marcus. The question is about what she should do next.']);
    },
  });

  /* 4.2 · question words */
  FE.seg({
    id: '4.2', ch: 4, title: 'Add a question word', dur: 60, music: 'calm', lead: 0.8,
    lines: [
      ['n1', 'We can add a question word at the start: what, when, who, or where.'],
      ['n2', 'Question word, plus should, plus subject, plus base verb.', { gap: 1.0 }],
      ['q1', 'What should I do?', { who: 'maya', gap: 1.4 }],
      ['n3', 'A useful question when you do not know the next step.', { gap: 0.6 }],
      ['q2', 'When should we leave?', { who: 'hana', gap: 1.4 }],
      ['n4', 'This asks about time.', { gap: 0.6 }],
      ['q3', 'Who should I ask?', { who: 'daniel', gap: 1.4 }],
      ['n5', 'This asks about a person. Where should we meet? This asks about a place.', { gap: 0.6 }],
      ['n6', 'Pair practice. Ask your partner a question with what, when, or who.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.62);
      const ch = FE.act.chips(S, { x: 1240, y: 170, center: true, size: 54, items: [{ t: 'What', role: 'q', label: 'question word' }, { plus: true }, { t: 'should', role: 'm', label: 'advice word' }, { plus: true }, { t: 'I', role: 's', label: 'subject' }, { plus: true }, { t: 'do', role: 'v', label: 'base verb' }] });
      const rows = [['q1', 'doc', 'What should I do?', 'an action', 'maya'], ['q2', 'clock', 'When should we leave?', 'a time', 'hana'], ['q3', 'people', 'Who should I ask?', 'a person', 'daniel']].map((r, i) => {
        const el = S.ui(`<div style="display:flex;align-items:center;gap:22px">${FE.iconSVG(r[1], 84)}<div style="flex:1;text-align:left;font-size:54px">${U('{q|' + r[2].split(' ')[0] + '} {m|should} {s|' + r[2].split(' ')[2] + '} {v|' + r[2].split(' ')[3].replace('?', '') + '}?')}</div><div style="width:240px;font-size:30px;color:#ffd48a;text-align:center">${UB(r[3])}</div></div>`, 'panel anim', { left: '600px', top: 400 + i * 190 + 'px', width: '1290px', padding: '14px 26px 18px', zIndex: 14 });
        return el;
      });
      // movable mini-actors on the left, one per question
      const ac = { maya: S.actor('maya', { x: 270, y: 780, scale: 0.95, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' }) };
      S.at('n2', () => ch.showAll(0.28));
      ['q1', 'q2', 'q3'].forEach((k, i) => { S.at(k + '>-1.2', () => { S.in(rows[i]); S.sfx('pop'); }); });
      S.at('q1', () => { ac.maya.arm('R', 'talk'); ac.maya.expr('worry'); });
      S.at('q2', () => { ac.maya.arm('R', 'rest'); ac.maya.expr('think'); });
      S.at('q3', () => { ac.maya.arm('R', 'point'); });
      S.at('n5', () => { ac.maya.arm('R', 'rest'); ac.maya.expr('smile'); });
      C.think(S, 'n6>+0.2', 19, 230, 250, 'Pair talk');
      C.notes(S, ['Link each question word to meaning: what = action, when = time, who = person, where = place.']);
    },
  });

  /* 4.3 · a short animated conversation (every line replayable) */
  FE.seg({
    id: '4.3', ch: 4, title: 'A conversation in a café', dur: 90, music: 'warm', lead: 0.8,
    lines: [
      ['n1', 'A café. Hana is giving a short talk on Monday. She asks Marcus for advice.'],
      ['h1', 'I am giving a short talk on Monday. What should I do?', { who: 'hana', gap: 0.9 }],
      ['n2', 'What would Marcus say? Think.', { gap: 0.8 }],
      ['m1', 'Have you practiced out loud?', { who: 'marcus', gap: 5.5 }],
      ['h2', 'Not yet. Should I practice with my slides?', { who: 'hana', gap: 1.0 }],
      ['m2', 'Yes, you should. And you should time yourself.', { who: 'marcus', gap: 1.0 }],
      ['h3', 'When should I start?', { who: 'hana', gap: 1.0 }],
      ['m3', 'I think you should start tonight. Then you can change things tomorrow.', { who: 'marcus', gap: 1.0 }],
      ['h4', 'That is a good idea. Thanks for the advice.', { who: 'hana', gap: 1.0 }],
      ['n3', 'Notice the turns: a question, a short answer, a reason. Tap any line to hear it again.', { gap: 1.2 }],
      ['n4', 'Now role-play the first three lines with a partner.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('cafe');
      const han = S.actor('hana', { x: 430, y: 745, scale: 1.2, facing: 0.4, arms: ['desk', 'desk'], expr: 'worry' });
      const mar = S.actor('marcus', { x: 1450, y: 755, scale: 1.2, facing: -0.4, arms: ['desk', 'desk'], expr: 'listen' });
      const bub = (k, a, x, y, side, w) => C.say(S, k, a, 0, 0, { x, y, side, w: w || 700 });
      const hb = ['h1', 'h2', 'h3', 'h4'].map((k, i) => bub(k, han, 760, 300 + (i % 2) * 40, 'right', i === 0 ? 800 : 700));
      const mb = ['m1', 'm2', 'm3'].map((k, i) => bub(k, mar, 1160, 300 + (i % 2) * 40, 'left', i === 2 ? 820 : 640));
      [...hb, ...mb].forEach((b, i) => { b.noRp = true; });
      S.at('h1', () => { han.arm('R', 'talk'); mar.set({ gx: -1 }); han.set({ gx: 0.8 }); mar.expr('listen'); });
      S.at('n2', () => { han.arm('R', 'rest'); mar.expr('think'); mar.arm('L', 'chin'); });
      C.think(S, 'n2>+0.2', 5, 880, 560);
      S.at('m1', () => { mar.arm('L', 'rest'); mar.arm('R', 'talk'); mar.expr('smile'); });
      S.at('h2', () => { mar.arm('R', 'rest'); han.arm('R', 'talk'); han.expr('think'); });
      S.at('m2', () => { han.arm('R', 'rest'); mar.arm('R', 'point'); mar.expr('confident'); });
      S.at('h3', () => { mar.arm('R', 'rest'); han.arm('R', 'talk'); });
      S.at('m3', () => { han.arm('R', 'rest'); mar.arm('R', 'talk'); han.gesture('nod'); });
      S.at('h4', () => { mar.arm('R', 'rest'); han.expr('relief'); han.arm('R', 'heart'); });
      S.at('n3', () => { han.arm('R', 'rest'); han.expr('smile'); S.bubbles.forEach((b) => b.hide(S.fast)); });
      const tr = C.transcript(S, ['h1', 'm1', 'h2', 'm2', 'h3', 'm3', 'h4'], 640, 150, 1240);
      S.at('n3>-1.0', () => S.in(tr));
      C.think(S, 'n4>+0.2', 24, 1700, 720, 'Pair talk');
      C.notes(S, ['Ask learners to predict what Marcus will say before the line plays.', 'Replay any line from the transcript. Focus: question, short answer, reason.']);
    },
  });

  /* 4.4 · short answers with matching pronouns, plus a reason or alternative */
  FE.seg({
    id: '4.4', ch: 4, title: 'Short answers', dur: 60, music: 'calm', lead: 0.8,
    lines: [
      ['n1', 'Short answers repeat should. The pronoun matches the speaker.'],
      ['p1', 'Should I call her?', { who: 'priya', gap: 1.0 }],
      ['m1', 'Yes, you should.', { who: 'marcus', gap: 0.8 }],
      ['n2', 'I changes to you. And do not forget the comma. Or the negative:', { gap: 0.8 }],
      ['m2', 'No, you shouldn\'t.', { who: 'marcus', gap: 0.8 }],
      ['p2', 'Should we leave now?', { who: 'priya', gap: 1.2 }],
      ['m3', 'Yes, we should.', { who: 'marcus', gap: 0.8 }],
      ['n3', 'We stays we. A helpful answer can add a reason or an alternative:', { gap: 0.8 }],
      ['m4', 'No, you shouldn\'t. You should check first.', { who: 'marcus', gap: 0.8 }],
      ['n4', 'Short answer, then reason. That is helpful advice.', { gap: 0.8 }],
      ['n5', 'Pair practice. Ask, answer, and add a reason.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('station'); C.dim(S, 0.45);
      const pri = S.actor('priya', { x: 300, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'worry' });
      const mar = S.actor('marcus', { x: 1560, y: 795, scale: 1.0, facing: -0.4, arms: ['rest', 'rest'], expr: 'listen' });
      const mk = (id, html, y) => S.ui(html, 'panel anim', { left: '520px', top: y + 'px', width: '940px', zIndex: 14, padding: '8px 24px 12px' });
      const t1 = mk('t1', `<div style="display:flex;align-items:center;gap:20px;font-size:36px"><div style="flex:1;text-align:right">${U('Should {s|I} call her?')}</div><span style="font-size:50px">&#8594;</span><div style="flex:1;text-align:left">${U('Yes, {s|you} {m|should}.')}</div></div>`, 410);
      const t2 = mk('t2', `<div style="display:flex;align-items:center;gap:20px;font-size:36px"><div style="flex:1;text-align:right">${U('Should {s|I} call her?')}</div><span style="font-size:50px">&#8594;</span><div style="flex:1;text-align:left">${U('No, {s|you} {n|shouldn\'t}.')}</div></div>`, 540);
      const t3 = mk('t3', `<div style="display:flex;align-items:center;gap:20px;font-size:36px"><div style="flex:1;text-align:right">${U('Should {s|we} leave now?')}</div><span style="font-size:50px">&#8594;</span><div style="flex:1;text-align:left">${U('Yes, {s|we} {m|should}.')}</div></div>`, 670);
      const t4 = mk('t4', `<div style="font-size:42px;text-align:center">${U('No, you shouldn\'t.')}${U('+')}${U('{r|You should check first.}')}</div><div style="text-align:center;font-size:28px;color:#ffd48a;margin-top:6px">${UB('short answer plus reason or alternative')}</div>`, 800);
      C.say(S, 'p1', pri, 0, 0, { x: 620, y: 270, side: 'right', w: 500, dark: false });
      C.say(S, 'm1', mar, 0, 0, { x: 1330, y: 270, side: 'left', w: 480 });
      C.say(S, 'm2', mar, 0, 0, { x: 1330, y: 270, side: 'left', w: 500 });
      C.say(S, 'p2', pri, 0, 0, { x: 620, y: 270, side: 'right', w: 520 });
      C.say(S, 'm3', mar, 0, 0, { x: 1330, y: 270, side: 'left', w: 480 });
      C.say(S, 'm4', mar, 0, 0, { x: 1280, y: 270, side: 'left', w: 720 });
      S.at('m1', () => { S.in(t1); mar.arm('R', 'talk'); mar.expr('smile'); });
      S.at('m2', () => { S.in(t2); mar.expr('confident'); });
      S.at('m3', () => { S.in(t3); });
      S.at('m4', () => { S.in(t4); mar.arm('R', 'point'); });
      S.at('n4', () => { mar.arm('R', 'rest'); pri.expr('relief'); });
      C.think(S, 'n5>+0.2', 14, 1730, 400, 'Pair talk');
      C.notes(S, ['Pronouns: I becomes you. We stays we. Practice both short answers.', 'Common mistakes: Yes, you do. / Yes, you should to. / no comma.']);
    },
  });

  /* 4.5 · pronunciation: strong and weak forms */
  FE.seg({
    id: '4.5', ch: 4, title: 'The sound of should', dur: 70, music: 'calm', lead: 0.8,
    lines: [
      ['n1', 'Listen to the word should. The letter l is silent.'],
      ['w1', 'should', { gap: 1.0, sp: 0.8 }],
      ['n2', 'In a strong form, it sounds like this. Use it when you stress the word, or when it comes at the end.', { gap: 0.8 }],
      ['w2', 'Yes, you should.', { gap: 1.0 }],
      ['n3', 'In connected speech, the word is often shorter and weaker.', { gap: 1.4 }],
      ['w3', 'You should call her.', { gap: 1.0, tts: 'PH:juː ʃəd kˈɔːl hɜː.' }],
      ['n4', 'You do not have to use the weak form every time. The strong form is always clear and correct.', { gap: 1.2 }],
      ['w4', 'shouldn\'t', { gap: 1.2, sp: 0.8 }],
      ['n5', 'Shouldn\'t has two syllables. The last t is very light.', { gap: 1.0 }],
      ['n6', 'Now you try. Say should, strong. Then say: You should call her.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('cafe'); C.dim(S, 0.72);
      const han = S.actor('hana', { x: 260, y: 800, scale: 0.95, facing: 0.4, arms: ['rest', 'rest'], expr: 'listen' });
      const letters = ['s', 'h', 'o', 'u', 'l', 'd'];
      const sound = ['ʃ', 'ʃ', 'ʊ', 'ʊ', '', 'd'];
      const sp = S.ui('<div style="display:flex;gap:10px;justify-content:center;align-items:flex-end">' + letters.map((l, i) => {
        const silent = l === 'l';
        return `<div style="text-align:center"><div style="width:76px;height:100px;border-radius:16px;background:${silent ? '#3a2a30' : '#fbf8f1'};color:${silent ? '#ff8a9b' : '#121b33'};font-size:66px;font-weight:800;line-height:100px;${silent ? 'text-decoration:line-through;text-decoration-thickness:6px;opacity:.9' : ''}">${l}</div><div style="font-family:var(--ipaf);font-size:34px;color:${silent ? '#ff8a9b' : '#ffd48a'};margin-top:4px;height:44px">${silent ? '&#215;' : sound[i]}</div></div>`; }).join('') + '</div>', 'panel anim', { left: '600px', top: '190px', width: '520px', zIndex: 14, padding: '16px 24px 18px' });
      const big = S.ui(`<div style="font-size:120px">${UB('should')}</div><div style="font-size:30px;color:#ffd48a">${UB('the l is silent')}</div>`, 'panel anim', { left: '1160px', top: '190px', width: '700px', zIndex: 14, textAlign: 'center' });
      const sw = S.ui(`<div style="display:flex;gap:26px;align-items:stretch;justify-content:center"><div style="flex:1;text-align:center"><div class="lab">${UB('strong form')}</div><div style="font-size:64px">${UB('{=should|ʃʊd}')}</div><div style="font-size:30px;margin-top:8px">${UB('Yes, you should.')}</div></div><div style="width:2px;background:rgba(255,255,255,.25)"></div><div style="flex:1;text-align:center"><div class="lab">${UB('weak form')}</div><div style="font-size:64px">${UB('{=should|ʃəd}')}</div><div style="font-size:30px;margin-top:8px">${UB('You should call her.')}</div></div></div>`, 'panel anim', { left: '600px', top: '470px', width: '1260px', zIndex: 14 });
      const nt = S.ui(`<div style="display:flex;align-items:center;justify-content:center;gap:30px"><div style="font-size:84px">${UB('shouldn\'t')}</div><div style="font-size:30px;color:#ffd48a">${UB('two syllables')}</div></div>`, 'panel anim', { left: '600px', top: '800px', width: '1260px', zIndex: 14, padding: '10px 24px 14px' });
      S.at('n1', () => { S.in(sp); S.in(big, 0.4); });
      S.at('w1', () => { han.arm('R', 'talk'); big.querySelectorAll('.u').forEach((u) => u.classList.add('hot')); });
      S.at('n2', () => { han.arm('R', 'rest'); S.in(sw); });
      S.at('w3', () => { han.expr('smile'); });
      S.at('n4', () => { });
      S.at('w4', () => { S.in(nt); });
      const hear = (el, key, x, y) => { const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn sm ghost'; btn.style.cssText = `position:absolute;left:${x}px;top:${y}px;z-index:20`; btn.innerHTML = FE.ui.svgIcon('play').replace('<svg', '<svg style="width:24px;height:24px"') + UB('hear it'); btn.onclick = () => { const ln = S.seg.L[key]; if (!FE.qa) FE.audio.play(ln.id, 0, 'narr'); S.sfx('click'); }; S.ui_.appendChild(btn); btn.classList.add('anim'); return btn; };
      const hb1 = hear(sw, 'w2', 1000, 482), hb2 = hear(sw, 'w3', 1640, 482), hb3 = hear(nt, 'w4', 1560, 830);
      S.at('n2', () => { S.in(hb1); S.in(hb2); }); S.at('w4', () => S.in(hb3));
      C.think(S, 'n6>+0.2', 13, 400, 480, 'Say it');
      C.notes(S, ['Model the strong form first. Then the weak form in a sentence.', 'Do not demand the weak form. Clear speech is the goal.', 'Use the replay button to repeat this segment.']);
    },
  });

  /* 4.6 · listen and repeat (no recognition, no scoring) */
  FE.seg({
    id: '4.6', ch: 4, title: 'Listen and repeat', dur: 80, music: 'off', lead: 0.6, gate: true, timer: { at: 40 },
    lines: [
      ['n1', 'Listen and repeat. First at natural speed, then slowly.'],
      ['r1', 'You should call her.', { gap: 2.2 }], ['s1', 'You should call her.', { gap: 3.8, sp: 0.7 }],
      ['r2', 'Should I call her?', { gap: 3.8 }], ['s2', 'Should I call her?', { gap: 3.8, sp: 0.7 }],
      ['r3', 'What should I do?', { gap: 3.8 }], ['s3', 'What should I do?', { gap: 3.8, sp: 0.7 }],
      ['r4', 'You shouldn\'t ignore the message.', { gap: 3.8 }], ['s4', 'You shouldn\'t ignore the message.', { gap: 3.8, sp: 0.7 }],
    ],
    build(S, L) {
      S.env('cafe'); C.dim(S, 0.62);
      const mar = S.actor('marcus', { x: 280, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'listen' });
      const ls = FE.act.listen(S, { x: 560, y: 170, w: 1320, label: 'Listen, then say it aloud', rows: [
        { t: 'You should call her.', normal: 'r1', slow: 's1' }, { t: 'Should I call her?', normal: 'r2', slow: 's2' },
        { t: 'What should I do?', normal: 'r3', slow: 's3' }, { t: 'You shouldn\'t ignore the message.', normal: 'r4', slow: 's4', size: 36 }] });
      const warn = C.caption(S, 'The teacher listens. This lesson does not listen or score speech.', 560, 940, { size: 24 });
      S.at(0.8, () => S.in(warn));
      ['r1', 'r2', 'r3', 'r4'].forEach((k) => S.at(k + '>', () => ls.turn(3.2)));
      ['s1', 's2', 's3', 's4'].forEach((k) => S.at(k + '>', () => ls.turn(3.2)));
      S.at('r1', () => mar.arm('R', 'talk')); S.at('s1>', () => mar.arm('R', 'rest'));
      C.notes(S, ['Learners repeat after each model. You listen and give feedback.', 'This program cannot hear or score pronunciation.', 'Use the normal and slow buttons to repeat any sentence.']);
    },
  });

  /* 4.7 · I think you should… and natural responses */
  FE.seg({
    id: '4.7', ch: 4, title: 'Soften advice and respond', dur: 60, music: 'warm', lead: 0.8,
    lines: [
      ['n1', 'You can soften advice with: I think you should.'],
      ['m1', 'I think you should ask for help.', { who: 'marcus', gap: 0.8 }],
      ['n2', 'To recommend against something, say: I don\'t think you should.', { gap: 0.8 }],
      ['m2', 'I don\'t think you should send it yet.', { who: 'marcus', gap: 0.8 }],
      ['n3', 'You can also say: You shouldn\'t send it yet. Both are natural. The I don\'t think form often sounds softer.', { gap: 1.0 }],
      ['n4', 'How can you respond? You can accept the advice, or you can say you are not sure.', { gap: 1.2 }],
      ['h1', 'That is a good idea.', { who: 'hana', gap: 0.8 }],
      ['h2', 'Thanks for the advice.', { who: 'hana', gap: 0.8 }],
      ['h3', 'I am not sure that will work.', { who: 'hana', gap: 0.8 }],
      ['n5', 'Pair practice. Give advice with I think you should, and respond.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('cafe'); C.dim(S, 0.4);
      const han = S.actor('hana', { x: 430, y: 745, scale: 1.2, facing: 0.4, arms: ['desk', 'desk'], expr: 'neutral' });
      const mar = S.actor('marcus', { x: 1450, y: 755, scale: 1.2, facing: -0.4, arms: ['desk', 'desk'], expr: 'smile' });
      C.say(S, 'm1', mar, 0, 0, { x: 1160, y: 270, side: 'left', w: 680 });
      C.say(S, 'm2', mar, 0, 0, { x: 1160, y: 270, side: 'left', w: 760 });
      C.say(S, 'h1', han, 0, 0, { x: 740, y: 270, side: 'right', w: 520 });
      C.say(S, 'h2', han, 0, 0, { x: 740, y: 270, side: 'right', w: 520 });
      C.say(S, 'h3', han, 0, 0, { x: 760, y: 270, side: 'right', w: 640 });
      const card = (icon, label, x) => S.ui(`<div style="text-align:center">${FE.iconSVG(icon, 78)}<div style="font-size:30px;margin-top:6px">${UB(label)}</div></div>`, 'panel anim', { left: x + 'px', top: '640px', width: '400px', zIndex: 14, padding: '12px 14px 14px' });
      const k1 = card('bulb', 'I think you should…', 560), k2 = card('cross', 'I don\'t think you should…', 1000);
      const r1 = card('check', 'That is a good idea.', 440), r2 = card('star', 'Thanks for the advice.', 880), r3 = card('ask', 'I am not sure that will work.', 1320);
      r3.style.width = '480px';
      S.at('m1', () => { S.in(k1); mar.arm('R', 'talk'); han.expr('listen'); });
      S.at('m2', () => { S.in(k2); mar.expr('think'); mar.arm('R', 'point'); });
      S.at('n3', () => { mar.arm('R', 'rest'); });
      S.at('n4', () => { S.out(k1); S.out(k2); });
      S.at('h1', () => { S.in(r1); han.expr('smile'); han.gesture('nod'); });
      S.at('h2', () => { S.in(r2); han.expr('relief'); });
      S.at('h3', () => { S.in(r3); han.expr('think'); han.arm('R', 'shrug'); });
      C.think(S, 'n5>+0.2', 13, 880, 430, 'Pair talk');
      C.notes(S, ['Do not label the other placement wrong. Both are natural.', 'Responses are polite and honest: accept, thank, or say you are unsure.']);
    },
  });
})(window);
