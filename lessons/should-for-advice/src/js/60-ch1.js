/* Chapter 1 · 00:00–05:00 · The problem: what should I do? */
(function (g) {
  'use strict';
  const FE = g.FE, { U, UB } = FE, C = FE.C;

  function office(S, opt) {
    S.env('office', Object.assign({ monitor: false }, opt || {}));
    const maya = S.actor('maya', { x: 470, y: 700, scale: 1.22, facing: 0.35, arms: ['type', 'type'], expr: 'neutral' });
    return maya;
  }

  /* 1.1 · cinematic mini-story: three manageable problems */
  FE.seg({
    id: '1.1', ch: 1, title: 'Maya has a big day', dur: 70, music: 'warm', lead: 1.6,
    lines: [
      ['n1', 'Meet Maya. Tomorrow morning, she has an important presentation.'],
      ['n2', 'Tonight, she has three small problems.', { gap: 0.5 }],
      ['n3', 'First, her outline is not finished.', { gap: 0.9 }],
      ['n4', 'Second, her phone keeps buzzing with notifications.', { gap: 2.2 }],
      ['n5', 'Third, she is not sure where the meeting will be.', { gap: 2.4 }],
      ['n6', 'These problems are manageable. But Maya feels stuck.', { gap: 1.8 }],
      ['m1', 'Hmm. What should I do?', { who: 'maya', gap: 1.1 }],
      ['n7', 'This question is the key to our class. When we need help, we ask: What should I do?', { gap: 0.9 }],
      ['n8', 'Now take a moment. Tell a partner about a small problem you have this week.', { gap: 1.4 }],
      ['n9', 'Thank you. In this class, you will practice natural English for exactly this.', { gap: 18.5 }],
    ],
    build(S, L) {
      const maya = office(S);
      const doc = C.prop(S, 'doc', 1190, 470, 2.7, { lines: 2 });
      const phone = C.prop(S, 'phone', 1500, 500, 2.5, {});
      const pin = C.prop(S, 'pin', 1730, 460, 2.2, {});
      const b1 = C.badge(S, 1, 1120, 300), b2 = C.badge(S, 2, 1430, 300), b3 = C.badge(S, 3, 1660, 300);
      const l1 = C.caption(S, 'unfinished outline', 1055, 640, { w: 270, size: 32 }), l2 = C.caption(S, 'many notifications', 1365, 640, { w: 270, size: 32 }), l3 = C.caption(S, 'unknown place', 1595, 640, { w: 270, size: 32 });
      S.at('n1', () => { maya.setArms('type', 'type'); maya.set({ facing: 0.15, gx: 0.3 }); maya.expr('listen'); });
      S.at('n1>+0.3', () => maya.gesture('nod'));
      S.at('n3', () => { S.in(doc); S.in(b1, 0.2); S.in(l1, 0.5); S.sfx('pop'); maya.expr('worry'); maya.look(0.8, 0.1, 0.5); });
      S.at('n3>+0.4', () => { maya.arm('R', 'point'); });
      S.at('n4', () => { S.in(phone); S.in(b2, 0.2); S.in(l2, 0.5); S.sfx('buzz'); phone.querySelector('.pv').classList.add('buzz'); maya.arm('R', 'rest'); maya.set({ headRot: -3, gx: 1 }); maya.expr('stress'); });
      S.at('n4>+0.6', () => { S.sfx('buzz'); });
      S.at('n5', () => { S.in(pin); S.in(b3, 0.2); S.in(l3, 0.5); S.sfx('pop'); maya.expr('worry'); maya.arm('L', 'chin'); maya.arm('R', 'rest'); maya.set({ headRot: 3, gy: -0.2 }); });
      S.at('n6', () => { maya.arm('L', 'rest'); maya.expr('stress'); maya.set({ headRot: 0, headY: 3 }); });
      S.at('m1', () => { maya.arm('R', 'talk'); maya.set({ facing: 0.1, gx: 0, gy: -0.2 }); });
      C.say(S, 'm1', maya, 800, 300, { think: true, dx: 20, side: 'right' });
      S.at('n7', () => { maya.expr('think'); maya.arm('R', 'rest'); S.out(l1); S.out(l2); S.out(l3); });
      C.think(S, 'n8>+0.2', 17, 860, 760, 'Talk');
      C.notes(S, ['This opening has no grammar yet. Ask: What are the problems?', 'Do not teach should now. Let learners notice the question.']);
    },
  });

  /* 1.2–1.4 · three problems: learners suggest, teacher reveals */
  function problem(id, title, probIcon, probO, probLabel, intro, rvText, options, hint, plan) {
    FE.seg({
      id, ch: 1, title, dur: 55, music: 'calm', gate: true, timer: {}, revealAt: 38,
      lines: [['p', intro]], clips: [['rv', rvText]],
      build(S, L) {
        const maya = office(S, plan.env);
        plan.setup && plan.setup(S, maya);
        maya.expr('think'); maya.set({ gx: 0.7, gy: -0.15 });
        const f = FE.act.fork(S, { x: 860, y: 190, w: 1000, h: 640, problem: { icon: probIcon, o: probO, label: probLabel }, options, cardX: 330, size: 38 });
        S.at('p', () => f.showProblem());
        S.at('p>+0.5', () => { maya.gesture('talk'); });
        S.onReveal(() => { f.showOptions(0.5); maya.expr('smile'); C.playClip(S, 'rv'); S.timeout(() => maya.gesture('nod'), 800); });
        C.hintText(S, hint);
        C.notes(S, ['Learners suggest ideas aloud or in chat. Accept every sensible idea.', 'Reveal the ideas after thinking time. Ask: Which one would you try first?']);
      },
    });
  }
  problem('1.2', 'Problem one: the unfinished outline', 'doc', { lines: 2 }, 'unfinished outline',
    'Problem one. Maya has not finished her outline. What can she do? Think for a moment.', 'Here are some ideas. Which one would you try first?',
    [{ icon: 'doc', label: 'write the missing points' }, { icon: 'people', label: 'ask Daniel to read it' }, { icon: 'slides', label: 'start the slides first' }],
    'Think about the very next small step.', {});
  problem('1.3', 'Problem two: the notifications', 'phone', {}, 'too many notifications',
    'Problem two. Her phone keeps buzzing. It is hard to focus. What can Maya do?', 'Here are some ideas. Which one is realistic for you?',
    [{ icon: 'mute', label: 'turn off notifications' }, { icon: 'door', label: 'put the phone in another room' }, { icon: 'clock', label: 'check messages at a break' }],
    'How can she protect her time to work?', {});
  problem('1.4', 'Problem three: the meeting place', 'pin', {}, 'unsure about the place',
    'Problem three. Maya is not sure where the meeting will be. What can she do?', 'Here are some ideas. Do you have another one?',
    [{ icon: 'calendar', label: 'check the invitation' }, { icon: 'chat', label: 'ask a coworker' }, { icon: 'map', label: 'look at the building map' }],
    'Where can she find the correct information?', {});

  /* 1.5 · learning goal, then the target language in action */
  FE.seg({
    id: '1.5', ch: 1, title: 'Our goal today', dur: 65, music: 'warm',
    lines: [
      ['g0', 'Today you will learn three things.'],
      ['g1', 'First, you can ask for advice.', { gap: 0.7 }],
      ['g2', 'Second, you can give a useful recommendation.', { gap: 1.0 }],
      ['g3', 'Third, you can explain a reason.', { gap: 1.0 }],
      ['g4', 'Now watch Maya and her coworker Daniel.', { gap: 1.2 }],
      ['d1', 'What should I do?', { who: 'maya', gap: 1.2 }],
      ['d2', 'I think you should finish the outline first, because it is the biggest problem.', { who: 'daniel', gap: 0.7 }],
      ['d3', 'That is a good idea. Thanks for the advice.', { who: 'maya', gap: 0.7 }],
      ['g5', 'Ask. Recommend. Explain why. Let us begin.', { gap: 1.0 }],
      ['g6', 'Turn to a partner. Say the three goals: ask, recommend, explain.', { gap: 1.0 }],
      ['g7', 'Well done.', { gap: 17 }],
    ],
    build(S, L) {
      S.env('office', { monitor: false });
      const maya = S.actor('maya', { x: 430, y: 700, scale: 1.22, facing: 0.4, arms: ['type', 'type'], expr: 'smile' });
      const dan = S.actor('daniel', { x: 1500, y: 715, scale: 1.22, facing: -0.4, arms: ['rest', 'rest'], expr: 'listen', mirror: false });
      const rows = [
        ['chat', 'ask for advice', 'What should I do?', 'g1'],
        ['bulb', 'give a recommendation', 'You should finish the outline.', 'g2'],
        ['plan', 'explain a reason', '… because it is the biggest problem.', 'g3'],
      ].map((r, i) => {
        const el = S.ui(`<div style="display:flex;align-items:center;gap:22px">${FE.iconSVG(r[0], 96)}<div style="text-align:left"><div style="font-size:40px;color:#fff">${UB(r[1])}</div><div style="font-size:30px;color:#ffd48a;margin-top:2px">${UB(r[2])}</div></div></div>`, 'panel anim', { left: '600px', top: 190 + i * 190 + 'px', width: '800px', padding: '12px 24px', zIndex: 14 });
        S.at(r[3], () => { S.in(el); S.sfx('pop'); });
        return el;
      });
      S.at('g4', () => { rows.forEach((r) => S.out(r)); });
      S.at('d1', () => { maya.set({ facing: 0.6, gx: 1 }); dan.set({ gx: -1 }); dan.expr('smile'); });
      C.say(S, 'd1', maya, 880, 330, { group: 'a', dx: 0 });
      C.say(S, 'd2', dan, 1230, 270, { group: 'b', side: 'left', w: 640 });
      C.say(S, 'd3', maya, 880, 520, { group: 'a' });
      S.at('d2', () => { dan.arm('R', 'talk'); maya.expr('listen'); maya.gesture('nod'); });
      S.at('d3', () => { maya.expr('relief'); dan.arm('R', 'rest'); dan.expr('smile'); });
      S.at('g5', () => { S.bubbles.forEach((b) => b.hide(S.fast)); maya.expr('confident'); });
      C.think(S, 'g6>+0.2', 15, 1120, 560, 'Talk');
      C.notes(S, ['Say the three goals slowly. Learners repeat: ask, recommend, explain.', 'The dialogue previews the language. Do not explain it yet.']);
    },
  });
})(window);
