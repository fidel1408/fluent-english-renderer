/* Chapter 2 · 05:00–13:00 · Discover the meaning of advice */
(function (g) {
  'use strict';
  const FE = g.FE, { U, UB } = FE, C = FE.C;

  /* 2.1 · coworking: a coworker needs help organizing a task */
  FE.seg({
    id: '2.1', ch: 2, title: 'Scene one: too many tasks', dur: 110, music: 'warm', lead: 1.0,
    lines: [
      ['n1', 'Scene one. A coworking space. Daniel has six tasks, and only one afternoon.'],
      ['n2', 'He feels overwhelmed. He asks his coworker Priya for help.', { gap: 0.4 }],
      ['d1', 'I have so many tasks! What should I do?', { who: 'daniel', gap: 1.0 }],
      ['n3', 'What could Priya say? Think of one idea.', { gap: 0.8 }],
      ['p1', 'I think you should start with the most urgent task.', { who: 'priya', gap: 9.5 }],
      ['n4', 'Watch the action. Daniel finds the urgent task and puts it first.', { gap: 0.8 }],
      ['n5', 'Why does this advice fit? Daniel has too many choices. Priya recommends one clear, useful next step.', { gap: 6.5 }],
      ['d2', 'That is a good idea. Thanks for the advice.', { who: 'daniel', gap: 0.7 }],
      ['n6', 'Now your turn. What else could Priya recommend?', { gap: 1.0 }],
      ['n7', 'For example: You should ask a coworker to help with one task. Or: You should make a short list. Many ideas can work.', { gap: 8 }],
      ['n8', 'Repeat after me: You should start with the most urgent task.', { gap: 1.0 }],
      ['n9', 'Good. Now tell your partner a problem, and give one recommendation.', { gap: 12 }],
      ['n10', 'Thank you.', { gap: 13 }],
    ],
    build(S, L) {
      S.env('cowork', { laptop: false });
      const dan = S.actor('daniel', { x: 470, y: 715, scale: 1.22, facing: 0.35, arms: ['desk', 'desk'], expr: 'stress' });
      const pri = S.actor('priya', { x: 1420, y: 715, scale: 1.22, facing: -0.4, arms: ['desk', 'desk'], expr: 'listen' });
      const cols = ['#f6d66b', '#f2a0b4', '#8fd0c0', '#9ec5ea', '#d9684c', '#f6d66b'];
      const spots = [[760, 330], [880, 420], [1000, 330], [820, 520], [960, 540], [1090, 430]];
      const notes = cols.map((c, i) => {
        const w = S.svg(`<g class="mv" style="transform:translate(${spots[i][0]}px,${spots[i][1]}px)"><g transform="scale(1.9) rotate(${i % 2 ? 7 : -8})" filter="url(#fe-sh2)">${FE.icon('note', { c })}</g></g>`, 'anim');
        return w;
      });
      notes.forEach((n, i) => S.at(0.3 + i * 0.25, () => { S.in(n); }));
      const mv = (i) => notes[i].querySelector('.mv');
      const urgent = 4;
      S.at('n1', () => { dan.arm('R', 'hold'); dan.set({ gx: 0.8 }); });
      S.at('n2', () => { dan.arm('R', 'rest2'); dan.set({ headRot: -3 }); });
      C.say(S, 'd1', dan, 0, 0, { x: 760, y: 220, side: 'right', group: 'a', w: 560 });
      S.at('d1', () => { dan.arm('L', 'talk'); pri.expr('listen'); pri.set({ gx: -0.8 }); });
      S.at('n3', () => { dan.arm('L', 'rest2'); pri.expr('think'); pri.arm('R', 'chin'); });
      C.think(S, 'n3>+0.2', 8.5, 880, 600);
      C.say(S, 'p1', pri, 0, 0, { x: 1150, y: 250, side: 'left', group: 'b', w: 640 });
      S.at('p1', () => { pri.arm('R', 'point'); pri.expr('confident'); });
      S.at('p1>', () => { pri.arm('R', 'rest2'); });
      S.at('n4>+0.1', () => {
        S.sfx('whoosh');
        S.move(mv(urgent), 850, 600, 1100, 0);
        [0, 1, 2, 3, 5].forEach((i, k) => S.move(mv(i), 560 + k * 118, 800, 1000, 0));
      });
      S.at('n4>+1.4', () => { C.badge(S, 1, 800, 540); S.in(S.ui_.lastChild); dan.expr('relief'); dan.arm('R', 'point'); });
      S.at('n5', () => { dan.arm('R', 'rest2'); dan.expr('smile'); });
      C.say(S, 'd2', dan, 0, 0, { x: 760, y: 250, side: 'right', group: 'a' });
      S.at('n6', () => { dan.expr('listen'); pri.expr('smile'); pri.arm('R', 'rest'); });
      C.think(S, 'n6>+0.3', 11, 880, 600);
      const a1 = S.bubble({ id: 'alt1', text: 'You should ask a coworker for help.', x: 640, y: 255, w: 520, actor: pri, side: 'left', dx: 0 });
      const a2 = S.bubble({ id: 'alt2', text: 'You should make a short list.', x: 1220, y: 160, w: 520, actor: pri, side: 'left' });
      S.at('n7', () => { a1.show(S.fast); });
      S.at('n7>+0.5', () => { a2.show(S.fast); });
      C.hintText(S, 'Start with the biggest problem.');
      C.think(S, 'n8>+0.2', 10, 880, 600, 'Say it');
      C.think(S, 'n9>+0.2', 12, 880, 600, 'Pair talk');
      C.notes(S, ['Pause at the think ring. Let learners suggest advice aloud.', 'Accept every sensible idea. Point out the shape: You should + verb.', 'Advice is a useful idea. It is not a guarantee.']);
    },
  });

  /* 2.2 · travel: avoid being late */
  FE.seg({
    id: '2.2', ch: 2, title: 'Scene two: do not be late', dur: 110, music: 'warm', lead: 1.0,
    lines: [
      ['n1', 'Scene two. A train station. Priya has an early train tomorrow, and she does not want to be late.'],
      ['p1', 'My train leaves early tomorrow. What should I do?', { who: 'priya', gap: 1.0 }],
      ['n2', 'Her friend Marcus sees two paths. Look at the paths. Which path is more useful?', { gap: 0.8 }],
      ['n3', 'Think about the road, the weather, and the time.', { gap: 1.0 }],
      ['m1', 'I think you should leave an hour earlier. The road may be busy.', { who: 'marcus', gap: 7.5 }],
      ['n4', 'The useful path becomes clear. The other path fades.', { gap: 1.0 }],
      ['n5', 'Why does this fit? Priya wants to avoid stress. A little extra time is a simple, useful action.', { gap: 7.0 }],
      ['n6', 'But notice: the result is only possible. Maybe the road is quiet. Maybe not. Advice gives a good next step, not a promise.', { gap: 1.5 }],
      ['p2', 'Good idea. Thanks for the advice.', { who: 'priya', gap: 0.7 }],
      ['n7', 'Your turn. Give Priya another reason to leave earlier.', { gap: 1.2 }],
      ['n8', 'For example: because the station may be crowded.', { gap: 11 }],
      ['n9', 'Share your reason with a partner.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('station');
      const pri = S.actor('priya', { x: 400, y: 735, scale: 1.2, facing: 0.35, arms: ['rest', 'rest'], expr: 'worry' });
      const mar = S.actor('marcus', { x: 1500, y: 745, scale: 1.2, facing: -0.4, arms: ['rest', 'rest'], expr: 'listen' });
      const f = FE.act.fork(S, { x: 540, y: 260, w: 820, h: 520, cardH: 200, problem: { icon: 'clock', o: { h: [-14, -22], m: [0, -30] }, label: 'early train' }, options: [{ icon: 'car', label: 'leave at the usual time' }, { icon: 'clock', label: 'leave an hour earlier', o: { h: [-20, -12], m: [10, -28] } }], nodeX: 80, cardX: 250, size: 32 });
      C.say(S, 'p1', pri, 0, 0, { x: 640, y: 250, side: 'right', group: 'a', w: 700 });
      S.at('p1', () => { pri.arm('R', 'talk'); pri.set({ gx: 0.6 }); mar.set({ gx: -1 }); });
      S.at('n2', () => { f.showProblem(); pri.expr('think'); pri.arm('R', 'rest'); });
      S.at('n2>+0.4', () => f.showOptions(0.6));
      C.think(S, 'n3>', 7, 280, 560);
      C.say(S, 'm1', mar, 0, 0, { x: 1350, y: 250, side: 'left', group: 'b', w: 800 });
      S.at('m1', () => { mar.arm('R', 'talk'); mar.expr('confident'); });
      S.at('m1>', () => { mar.arm('R', 'rest'); });
      S.at('n4', () => { f.mark(1, 'advice'); f.mark(0, 'avoid'); });
      S.at('n4>+0.8', () => { f.conseq(1, 'more time and less stress'); f.conseq(0, 'the road could be slow'); pri.expr('relief'); });
      S.at('n6', () => { pri.expr('think'); });
      C.say(S, 'p2', pri, 0, 0, { x: 640, y: 250, side: 'right', group: 'a' });
      S.at('p2', () => { pri.expr('smile'); pri.gesture('nod'); });
      C.think(S, 'n7>+0.2', 10, 780, 640, 'Think');
      C.think(S, 'n9>+0.2', 14, 780, 640, 'Pair talk');
      C.notes(S, ['Show the two paths. Learners choose one and say why.', 'The faded path is not forbidden. It is just less useful here.', 'Consequences are only possible: maybe.']);
    },
  });

  /* 2.3 · apartment: roommates and noise, politely */
  FE.seg({
    id: '2.3', ch: 2, title: 'Scene three: a polite talk', dur: 110, music: 'calm', lead: 1.0,
    lines: [
      ['n1', 'Scene three. An apartment. Hana has early meetings. Her roommate Theo practices music late at night.'],
      ['h1', 'The music is loud at night, and I start work early. What should I do?', { who: 'hana', gap: 1.0 }],
      ['n2', 'Her friend Marcus is visiting. Should she say nothing? Should she be angry? Think about a polite option.', { gap: 0.8 }],
      ['m1', 'I think you should talk to him calmly. Tell him what you need.', { who: 'marcus', gap: 7.5 }],
      ['n3', 'Watch the action. Hana talks with Theo, and the music changes.', { gap: 1.0 }],
      ['t1', 'Oh, sorry! I can use headphones after ten.', { who: 'theo', gap: 2.0 }],
      ['n4', 'Why does this fit? A calm talk respects both people. It gives Theo a chance to help.', { gap: 1.2 }],
      ['n5', 'Again, there is no guarantee. Theo might forget tomorrow. Advice is a useful next step, and context matters.', { gap: 1.0 }],
      ['n6', 'Your turn. What else can Hana say to Theo? Share one polite sentence with a partner.', { gap: 1.2 }],
      ['n7', 'Good. Polite advice helps people listen.', { gap: 18 }],
    ],
    build(S, L) {
      S.env('apartment');
      const han = S.actor('hana', { x: 400, y: 735, scale: 1.2, facing: 0.35, arms: ['rest', 'rest'], expr: 'stress' });
      const mar = S.actor('marcus', { x: 1000, y: 745, scale: 1.2, facing: -0.45, arms: ['rest', 'rest'], expr: 'listen' });
      const theo = S.actor('theo', { x: 1560, y: 745, scale: 1.2, facing: -0.4, arms: ['rest', 'rest'], expr: 'neutral', look: [-0.2, 0] });
      const spk = C.prop(S, 'speaker', 1790, 560, 1.7, { waves: true });
      const waves = S.svg('<g class="wv">' + [0, 1, 2].map((i) => `<path d="M${1690 - i * 38} ${560 - 36 - i * 14}Q${1650 - i * 44} 560 ${1690 - i * 38} ${560 + 36 + i * 14}" fill="none" stroke="#f0b33f" stroke-width="${7 - i}" stroke-linecap="round" opacity="${0.9 - i * 0.2}"/>`).join('') + '</g>', 'anim');
      S.at(0.4, () => { S.in(spk); S.in(waves, 0.2); });
      C.say(S, 'h1', han, 0, 0, { x: 650, y: 150, side: 'right', group: 'a', w: 760 });
      S.at('h1', () => { han.arm('R', 'talk'); mar.set({ gx: -1 }); });
      S.at('n2', () => { han.arm('R', 'rest'); mar.expr('think'); });
      C.say(S, 'm1', mar, 0, 0, { x: 1030, y: 190, side: 'left', group: 'b', w: 700 });
      S.at('m1', () => { mar.arm('R', 'talk'); mar.expr('confident'); });
      S.at('m1>', () => { mar.arm('R', 'rest'); han.expr('think'); });
      S.at('n3', () => { han.set({ facing: 0.7 }); han.expr('listen'); S.sfx('whoosh'); });
      C.say(S, 't1', theo, 0, 0, { x: 1400, y: 240, side: 'left', group: 'c', w: 600 });
      S.at('t1', () => { theo.expr('smile'); theo.arm('R', 'talk'); waves.style.transition = 'opacity .6s'; waves.style.opacity = '.15'; han.expr('relief'); theo.set({ facing: -0.5 }); });
      S.at('n4', () => { theo.arm('R', 'rest'); });
      S.at('n5', () => { han.expr('think'); });
      C.think(S, 'n6>+0.2', 17, 880, 620, 'Pair talk');
      C.notes(S, ['Ask: What polite options does Hana have?', 'Focus: Marcus recommends a useful next step. Theo may or may not remember.']);
    },
  });

  /* 2.4 · advice is not a rule; context changes strength */
  FE.seg({
    id: '2.4', ch: 2, title: 'Advice or rule?', dur: 70, music: 'calm', lead: 0.8, gate: true, timer: {}, revealAt: 62,
    lines: [
      ['n1', 'Let us compare advice with a rule.'],
      ['p1', 'You must wear a badge in this building.', { who: 'priya', gap: 0.8 }],
      ['n2', 'This is a rule. There is no choice.', { gap: 0.5 }],
      ['p2', 'You should arrive early tomorrow.', { who: 'priya', gap: 1.4 }],
      ['n3', 'This is advice. It is a useful idea, and you can think about it.', { gap: 0.5 }],
      ['n4', 'Context also changes how strong advice sounds. The same sentence from a close friend feels gentle. From a manager, it can feel stronger.', { gap: 1.2 }],
      ['n5', 'So listen to the person, the place, and the situation.', { gap: 1.0 }],
      ['n6', 'Quick check. Is each sentence a rule, or is it advice?', { gap: 1.4 }],
    ],
    build(S, L) {
      S.env('cowork', { laptop: false });
      const pri = S.actor('priya', { x: 430, y: 735, scale: 1.2, facing: 0.3, arms: ['rest', 'rest'], expr: 'neutral' });
      const dan = S.actor('daniel', { x: 1500, y: 745, scale: 1.2, facing: -0.35, arms: ['rest', 'rest'], expr: 'listen' });
      C.dim(S, 0.35);
      const rule = S.ui(`<div style="display:flex;align-items:center;gap:20px">${FE.iconSVG('lock', 84)}<div><div class="lab" style="font-size:34px">${UB('rule')}</div><div style="font-size:30px">${UB('no choice')}</div></div></div>`, 'panel anim', { left: '690px', top: '210px', width: '470px', zIndex: 14 });
      const adv = S.ui(`<div style="display:flex;align-items:center;gap:20px">${FE.iconSVG('bulb', 84)}<div><div class="lab" style="font-size:34px">${UB('advice')}</div><div style="font-size:30px">${UB('you can choose')}</div></div></div>`, 'panel anim', { left: '1190px', top: '210px', width: '500px', zIndex: 14 });
      C.say(S, 'p1', pri, 0, 0, { x: 660, y: 480, side: 'right', group: 'a', w: 640 });
      C.say(S, 'p2', pri, 0, 0, { x: 700, y: 480, side: 'right', group: 'a', w: 640 });
      S.at('p1', () => { pri.arm('R', 'point'); S.in(rule); });
      S.at('n2', () => { dan.expr('worry'); pri.arm('R', 'rest'); });
      S.at('p2', () => { pri.arm('R', 'talk'); dan.expr('listen'); S.in(adv); });
      S.at('n3', () => { dan.expr('smile'); dan.gesture('nod'); });
      const sl = S.ui(`<div class="lab">${UB('how strong does it sound?')}</div><div style="position:relative;height:90px;margin-top:10px"><div style="position:absolute;left:0;right:0;top:44px;height:10px;border-radius:6px;background:linear-gradient(90deg,#55dc95,#ffb540,#ff6f86)"></div><div class="m1" style="position:absolute;left:12%;top:0;text-align:center;transform:translateX(-50%)">${FE.iconSVG('people', 56)}</div><div class="m2" style="position:absolute;left:84%;top:0;text-align:center;transform:translateX(-50%)">${FE.iconSVG('megaphone', 56)}</div></div><div style="display:flex;justify-content:space-between;font-size:28px"><span>${UB('a {=close|kləʊs} friend')}</span><span>${UB('a manager')}</span></div>`, 'panel anim', { left: '690px', top: '600px', width: '1000px', zIndex: 14 });
      S.at('n4', () => { S.out(rule); S.out(adv); S.bubbles.forEach((b) => b.hide(S.fast)); S.in(sl); });
      S.at('n6', () => { S.out(sl); });
      S.at('n5>', () => { S.out(sl); });
      const qc = FE.act.choice(S, { x: 690, y: 190, w: 1170, label: 'Rule or advice?', cols: 2, optSize: 48, items: [
        { prompt: 'You must show your ticket.', options: [{ t: 'rule', ok: true, why: 'Yes. Must means there is no choice here.' }, { t: 'advice', why: 'Advice leaves a choice. Must does not.' }] },
        { prompt: 'You should bring water.', options: [{ t: 'rule', why: 'Should is a recommendation, not a strict rule.' }, { t: 'advice', ok: true, why: 'Yes. It is a useful idea. You can choose.' }] },
        { prompt: 'You should rest this weekend.', options: [{ t: 'rule', why: 'No. This is a friendly recommendation.' }, { t: 'advice', ok: true, why: 'Yes. A useful idea, and the person decides.' }] },
      ] });
      S.at('n6', () => { qc.panel.style.zIndex = 20; });
      {
        const per = (S.seg.dur - S.seg.timerAt) / 3;
        [0, 1, 2].forEach((i) => { S.at(S.seg.timerAt + per * (i + 0.7), () => { if (S.mode === 'demo') { qc.goto(i, true); qc.reveal(); } }); if (i) S.at(S.seg.timerAt + per * i - 0.2, () => { if (S.mode === 'demo') qc.goto(i, true); }); });
      }
      C.notes(S, ['Rule: must. Advice: should. Do not teach must in detail here.', 'Strength depends on the relationship and the situation.']);
    },
  });

  /* 2.5 · several reasonable answers */
  FE.seg({
    id: '2.5', ch: 2, title: 'Many good answers', dur: 40, music: 'calm', lead: 0.6,
    lines: [
      ['n1', 'A problem can have more than one good answer. Daniel will be late for a meeting.'],
      ['n2', 'Three ideas are reasonable. One idea is not useful.', { gap: 3.0 }],
      ['n3', 'Good advice depends on the person, the place, and the time.', { gap: 3.0 }],
      ['n4', 'Your turn. Give a fifth idea. Start with: You should.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('office', { monitor: false });
      const dan = S.actor('daniel', { x: 420, y: 715, scale: 1.2, facing: 0.35, arms: ['rest', 'rest'], expr: 'worry' });
      const f = FE.act.fork(S, { x: 780, y: 170, w: 1080, h: 700, problem: { icon: 'clock', o: { h: [14, -18], m: [-4, -30] }, label: 'late for a meeting' }, options: [{ icon: 'chat', label: 'send a short message' }, { icon: 'car', label: 'take a faster route' }, { icon: 'bell', label: 'call the office' }, { icon: 'cross', label: 'ignore the meeting' }], nodeX: 80, cardX: 290, size: 34 });
      S.at('n1>+0.2', () => { f.showProblem(); });
      S.at('n1>+0.8', () => f.showOptions(0.45));
      S.at('n2>+1.0', () => { f.mark(0, 'ok'); f.mark(1, 'ok'); f.mark(2, 'ok'); f.mark(3, 'avoid'); dan.expr('think'); });
      S.at('n2>+2.2', () => { f.conseq(0, 'the team may feel respected'); f.conseq(1, 'you might save a few minutes'); });
      S.at('n3', () => { dan.expr('relief'); });
      C.think(S, 'n4>+0.2', 10, 560, 300, 'Think');
      C.notes(S, ['Ask learners for a fourth good idea.', 'Only the last path is unhelpful.']);
    },
  });

  /* 2.6 · should as expectation (not the target meaning) */
  FE.seg({
    id: '2.6', ch: 2, title: 'A different meaning', dur: 40, music: 'calm', lead: 0.6, gate: true, timer: {}, revealAt: 36,
    lines: [
      ['n1', 'One more thing. Look at this sentence.'],
      ['p1', 'The train should arrive soon.', { who: 'priya', gap: 0.6 }],
      ['n2', 'Here, should means we expect something. Nobody is giving advice. It is not the meaning we study today.', { gap: 0.6 }],
      ['n3', 'In this class, should means a useful recommendation.', { gap: 1.2 }],
      ['n4', 'Which sentence gives advice?', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('station');
      const pri = S.actor('priya', { x: 470, y: 735, scale: 1.2, facing: 0.35, arms: ['rest', 'rest'], expr: 'neutral', look: [0.7, -0.1] });
      C.dim(S, 0.4);
      const ex = S.ui(`<div style="display:flex;align-items:center;gap:18px">${FE.iconSVG('train', 84)}<div><div class="lab" style="font-size:32px">${UB('we expect it')}</div><div style="font-size:30px">${UB('not advice')}</div></div></div>`, 'panel anim', { left: '800px', top: '300px', width: '470px', zIndex: 14 });
      const ad = S.ui(`<div style="display:flex;align-items:center;gap:18px">${FE.iconSVG('bulb', 84)}<div><div class="lab" style="font-size:32px">${UB('we recommend it')}</div><div style="font-size:30px">${UB('advice')}</div></div></div>`, 'panel anim', { left: '1310px', top: '300px', width: '520px', zIndex: 14 });
      C.say(S, 'p1', pri, 0, 0, { x: 760, y: 180, side: 'right', group: 'a', w: 640 });
      S.at('p1', () => { pri.set({ gx: 1 }); });
      S.at('n2', () => { S.in(ex); });
      S.at('n3', () => { S.in(ad); pri.expr('smile'); });
      S.at('n4', () => { S.out(ex); S.out(ad); });
      FE.act.choice(S, { x: 690, y: 230, w: 1170, label: 'Which sentence gives advice?', cols: 1, optSize: 44, items: [{ prompt: '', options: [
        { t: 'The train should arrive soon.', ok: false, why: 'No. Here should means we expect it.' },
        { t: 'You should check the schedule.', ok: true, why: 'Yes. This recommends a useful action.' },
        { t: 'The meeting should start at nine.', ok: false, why: 'No. This is an expectation, not advice.' }] }] });
      C.notes(S, ['Keep this short. The assessed core is advice only.', 'Optional extension for strong classes: should have plus a past participle is a different structure.']);
    },
  });
})(window);
