/* 93: Chapter 5 (31:00–46:00) Mission · Chapter 6 (46:00–55:00) New evidence and roleplay · Chapter 7 (55:00–60:00) Review */
(function () {
  'use strict';
  const FE = window.FE, seg = FE.seg;
  const say = (who, text, o) => ['say', who, text, o || {}];
  const nar = (text, o) => ['nar', text, o || {}];
  const fx = (name, args, dur) => ['fx', name, args, dur];
  const P = (x, flip, pose, face, s = 0.7, y = 1030) => ({ x, y, s, flip, pose, face });
  const FOUR = { x: 960, y: 150, w: 900 };

  /* mission state drives the scenery: the same scene builder, different props */
  const mScene = (L) => (L.mission.shelter === 'indoor' ? 'cafe' : 'rooftop');
  const mOpts = (L) => (L.mission.shelter === 'indoor' ? { wet: 0.5 } : { wet: 0.5, tent: true, heaters: true });
  const T = {
    shelter: (L) => (L.mission.shelter === 'indoor' ? 'The party is inside, in the indoor lounge.' : 'The party is on the roof, with a tent.'),
    food: (L) => (L.mission.food === 'backup' ? 'The backup café is bringing smaller trays.' : 'The main caterer is bringing the food.'),
    guest: (L) => (L.mission.guest === 'call' ? 'You called Sofia. She did not answer.' : 'You sent Sofia a text message.'),
  };
  const rebuild = (X) => X.R.rebuild();

  seg({
    id: '5.1', ch: 5, title: 'Mission briefing', scene: 'rooftop', sceneOpts: { wet: 0.5 }, hold: 2,
    cast: [['maya', P(400, 1, 'tablet', 'neutral', 0.74, 1020)], ['priya', P(1520, -1, 'clasp', 'curious', 0.74, 1020)]],
    steps: [
      nar('Your mission. Tomorrow evening, forty guests are coming to the rooftop party. But five things are not certain.'),
      fx('board', { title: 'Five things we do not know', x: 190, y: 160, w: 1540, items: [{ icon: 'cloud', text: 'the weather' }, { icon: 'bus', text: 'the transport' }, { icon: 'table', text: 'the venue' }, { icon: 'vanLate', text: 'the food' }, { icon: 'absent', text: 'the guests' }] }, 4),
      nar('Work with a partner. Make a plan, and a backup plan. Try may, might, and could in your plan.'),
      ['do', (X) => FE.FX.clear(X, 'board')],
      say('maya', 'We need a plan, and a backup plan.', { gest: 'tablet', face: 'neutral', to: 'priya' }),
      say('priya', 'Let’s decide one thing at a time.', { gest: 'openR', face: 'smile', to: 'maya' }),
    ],
  });

  const FACTS = (a, b) => [a, b];
  seg({
    id: '5.2', ch: 5, title: 'Step one: weather and transport', scene: mScene, sceneOpts: (L) => (L.mission.picked && L.mission.picked.shelter ? mOpts(L) : { wet: 0.5 }), hold: 1, w: 3,
    cast: [['maya', P(640, 1, 'think', 'curious', 0.7, 1020)], ['priya', P(960, -1, 'clasp', 'unsure', 0.7, 1020)]],
    steps: [nar('Step one. The weather and the transport. Read the facts. Then choose where the party will be.')],
    act: {
      type: 'branch', tag: 'Team decision', title: 'Weather and transport', key: 'shelter', box: FOUR, cam: { x: 330, z: 1 },
      q: 'Where will the party be?', facts: ['Clouds now. Rain {m:may} start after eight.', 'Two bus lines have delays.', 'Tell your partner: What {m:could} go wrong?'],
      support: ['The rain {m:might} …', 'The guests {m:could} …', 'It {m:may} be …'],
      opts: [{ t: 'On the roof, with a tent.', val: 'tent', icon: 'tent', result: 'The tent is up. Rain {m:might} still blow in.', effect: rebuild }, { t: 'Inside, in the indoor lounge.', val: 'indoor', icon: 'house', result: 'The lounge is dry. It {m:could} feel crowded.', effect: rebuild }],
    },
  });

  seg({
    id: '5.3', ch: 5, title: 'Step two: the food', scene: mScene, sceneOpts: mOpts, hold: 1, w: 3,
    cast: [['maya', P(640, 1, 'think', 'curious', 0.7, 1020)], ['priya', P(960, -1, 'clasp', 'unsure', 0.7, 1020)]],
    steps: [nar('Step two. The food. Traffic is heavy. Choose how to get the food to the party.')],
    act: {
      type: 'branch', tag: 'Team decision', title: 'The food', key: 'food', box: FOUR, cam: { x: 330, z: 1 },
      q: 'Who will bring the food?', facts: ['The main caterer’s van is late. The traffic is heavy.', 'The backup café can send smaller trays.', 'Tell your partner: What {m:might} happen?'],
      support: ['The van {m:could} …', 'There {m:may} be …', 'The food {m:might} …'],
      opts: [
        { t: 'Wait for the main caterer.', val: 'main', icon: 'van', result: 'The van {m:might} arrive late, but it brings everything.', effect: (X) => FE.FX.route(X, { kind: 'main', x: 90, y: 160, w: 780, text: 'It {m:might} arrive late.' }) },
        { t: 'Call the backup café.', val: 'backup', icon: 'tray', result: 'The trays {m:could} arrive faster, but there {m:may} be less food.', effect: (X) => FE.FX.route(X, { kind: 'backup', x: 90, y: 160, w: 780, text: 'It {m:could} arrive faster.' }) },
      ],
    },
  });

  seg({
    id: '5.4', ch: 5, title: 'Step three: the guests', scene: mScene, sceneOpts: mOpts, hold: 1, w: 2,
    cast: [['maya', P(640, 1, 'phoneChest', 'curious', 0.7, 1020)], ['priya', P(960, -1, 'clasp', 'unsure', 0.7, 1020)]],
    steps: [nar('Step three. The guests. Sofia has still not confirmed. How will you reach her?')],
    act: {
      type: 'branch', tag: 'Team decision', title: 'The guests', key: 'guest', box: FOUR, cam: { x: 330, z: 1 },
      q: 'How will you reach Sofia?', facts: ['Sofia has not confirmed.', 'Two other guests {m:may} come late.', 'Tell your partner: Who {m:might} come?'],
      support: ['Sofia {m:may} …', 'The guests {m:might} …', 'She {m:could} …'],
      opts: [
        { t: 'Send her a text message.', val: 'text', icon: 'msg', result: 'She replies: she {m:might} come.', effect: (X) => FE.FX.phone(X, { mode: 'text', x: 90, y: 160, w: 780 }) },
        { t: 'Call her.', val: 'call', icon: 'phone', result: 'She does not answer. She {m:could} be busy.', effect: (X) => FE.FX.phone(X, { mode: 'call', x: 90, y: 160, w: 780 }) },
      ],
    },
  });

  const planModel = ['Plan [A|eɪ]: The weather {m:may} stay dry, so the guests {m:could} enjoy the evening.', 'Plan [B|biː]: If it rains, we {m:might} move the tables.', 'The food {m:could} arrive late, so we {m:might} start with drinks.', 'Sofia {m:may} not come, so we {m:could} keep a seat for her.'];
  seg({
    id: '5.5', ch: 5, title: 'Step four: Plan [A|eɪ] and Plan [B|biː]', scene: mScene, sceneOpts: mOpts, hold: 1, w: 5,
    cast: [['maya', P(640, 1, 'tablet', 'neutral', 0.7, 1020)], ['priya', P(960, -1, 'openR', 'smile', 0.7, 1020)]],
    steps: [nar('Step four. Make Plan A and Plan B. Talk with your partner first. Then say your plans aloud, with may, might, and could.')],
    act: {
      type: 'task', tag: 'Pair work', title: 'Plan [A|eɪ] and Plan [B|biː]', box: { x: 940, y: 150, w: 940 }, cam: { x: 330, z: 1 },
      lead: (L) => T.shelter(L),
      steps: (L) => [T.food(L), T.guest(L), 'Plan [A|eɪ]: say what {m:may} happen if all goes well.', 'Plan [B|biː]: say what you {m:might} do if something goes wrong.'],
      support: ['The weather {m:may} …', 'The food {m:could} …', 'If …, we {m:might} …', 'Sofia {m:may} not …'],
      model: planModel,
    },
  });

  seg({
    id: '5.6', ch: 5, title: 'Step five: share and listen', scene: mScene, sceneOpts: mOpts, hold: 1, w: 3,
    cast: [['maya', P(640, 1, 'open', 'smile', 0.7, 1020)], ['priya', P(960, -1, 'idle', 'smile', 0.7, 1020)]],
    steps: [nar('Step five. Share your plans with another pair. Listen for may, might, and could. Then give one kind comment about the language.')],
    act: {
      type: 'task', tag: 'Share and feedback', title: 'Share your plans', box: { x: 940, y: 150, w: 940 }, cam: { x: 330, z: 1 },
      lead: 'Listen for the language.',
      steps: ['Share Plan [A|eɪ] and Plan [B|biː] with another pair.', 'Listen: did they use {m:may}, {m:might}, or {m:could}?', 'Give one comment: what was clear? What can improve?'],
      hints: ['Teacher check: no ending after a modal.', 'Teacher check: no “to” after a modal.', 'Teacher check: not comes after the modal.'],
      model: ['“We {m:might} move inside if it rains.”', '“The caterer {m:could} be late.”', 'More than one modal is natural in each sentence.'],
    },
  });

  seg({
    id: '5.7', ch: 5, title: 'What the plan looks like', scene: mScene, sceneOpts: mOpts, hold: 2,
    cast: [['maya', P(430, 1, 'open', 'smile', 0.74, 1020)], ['daniel', P(1500, -1, 'idle', 'smile', 0.74, 1020)]],
    steps: [
      nar('Here is the plan your class chose. Look at the scene, and look at the choices.'),
      ['do', (X) => FE.FX.panel(X, { id: 'planbox', x: 300, y: 160, w: 1320, html: `<h3>${FE.U('Our plan')}</h3>${['shelter', 'food', 'guest'].map((k) => `<div class="ub mid" style="display:block;margin:6px 0">${FE.U(T[k](FE.L))}</div>`).join('')}`, sfx: 'reveal' })],
      say('maya', 'OK. What {m:could} go wrong?', { gest: 'open', face: 'curious', to: 'daniel' }),
      say('daniel', 'The weather {m:might} change.', { gest: 'pointUpL', face: 'unsure', to: 'maya' }),
      say('maya', 'And the food {m:could} be late.', { gest: 'think', face: 'unsure', to: 'daniel' }),
      nar('Good teams do not say what will happen. They say what may, might, or could happen, and they get ready.'),
    ],
  });

  /* ============ CHAPTER 6 ============ */
  seg({
    id: '6.1', ch: 6, title: 'New evidence', scene: mScene, sceneOpts: mOpts, hold: 2, amb: 'rain',
    cast: [['maya', P(420, 1, 'tablet', 'worried', 0.74, 1020)], ['daniel', P(960, -1, 'phoneR', 'worried', 0.74, 1020)], ['priya', P(1500, -1, 'phoneChest', 'unsure', 0.74, 1020)]],
    steps: [
      nar('Now new evidence arrives. Three updates. Listen.'),
      ['do', (X) => X.S.setWeather(0.85, 0.7, 6)],
      say('daniel', 'The new forecast says rain {m:could} start at seven, not eight.', { gest: 'phoneR', face: 'worried', to: 'maya' }),
      say('priya', 'My driver says there {m:might} be an accident on the highway.', { gest: 'phoneChest', face: 'unsure', to: 'maya' }),
      say('maya', 'And Sofia says she {m:may} come late.', { gest: 'tablet', face: 'think', to: 'daniel' }),
      fx('board', { title: 'Three updates', x: 300, y: 160, w: 1320, items: [{ icon: 'rain', text: 'rain earlier' }, { icon: 'vanStuck', text: 'a slower delivery' }, { icon: 'msg', text: 'Sofia may be late' }] }, 3),
      nar('Notice: the evidence changed, so our predictions can change too.'),
    ],
  });

  seg({
    id: '6.2', ch: 6, title: 'Revise your predictions', scene: mScene, sceneOpts: mOpts, hold: 1, w: 2, amb: 'rain',
    cast: [['maya', P(640, 1, 'think', 'worried', 0.7, 1020)], ['daniel', P(960, -1, 'phoneR', 'worried', 0.7, 1020)]],
    setup: (X) => X.S.setWeather(0.85, 0.7, 0),
    steps: [nar('Change at least one prediction. Explain your reason. Because the evidence changed, what might happen now?')],
    act: {
      type: 'task', tag: 'Pair work', title: 'Revise and explain', box: { x: 940, y: 150, w: 940 }, cam: { x: 330, z: 1 },
      lead: 'Look at the new evidence.',
      steps: ['Look at the three updates.', 'Change one prediction.', 'Say why: begin with “because”, then the evidence.'],
      support: ['Because …, it {m:might} …', 'The new forecast {m:could} mean …', 'We {m:may} need to …'],
      hints: ['Start with the evidence: The forecast changed.', 'Then add the possibility: so it {m:might} rain earlier.'],
      model: ['“Because the forecast changed, it {m:might} rain earlier.”', '“The driver {m:could} be late, so we {m:might} start with drinks.”', '“Sofia {m:may} come late, so we {m:could} keep a seat for her.”'],
    },
  });

  seg({
    id: '6.3', ch: 6, title: 'Roleplay: the airport', scene: 'airport', hold: 2,
    cast: [['lena', { x: 520, y: 1010, s: 0.8, flip: 1, pose: 'tablet', face: 'apology' }], ['tom', { x: 1180, y: 1010, s: 0.8, flip: -1, pose: 'phoneChest', face: 'worried' }]],
    steps: [
      nar('A different situation. Tom is at the airport. His flight may be delayed. Lena works at the gate.'),
      say('tom', 'Hi. Is my flight on time?', { face: 'worried', gest: 'phoneChest', to: 'lena' }),
      say('lena', 'It {m:might} be delayed. We are waiting for an update.', { face: 'apology', gest: 'tablet', to: 'tom' }),
      say('tom', '{m:Could} I still make my connection?', { face: 'worried', gest: 'shrug', to: 'lena' }),
      say('lena', 'It {m:could} be possible, but I am not sure yet.', { face: 'apology', gest: 'openR', to: 'tom' }),
      nar('Now you try. Each speaker has a real goal.'),
    ],
  });

  const rpModel = ['Tom: “Hi. {m:Could} my flight be late?”', 'Lena: “It {m:might} leave at nine. I do not know yet.”', 'Tom: “Do you think I {m:might} miss my meeting?”', 'Lena: “You {m:may} miss the start. I {m:could} check another flight.”', 'Tom: “Yes, please. What {m:could} happen next?”', 'Lena: “The new flight {m:may} leave at ten. I will tell you soon.”'];
  seg({
    id: '6.4', ch: 6, title: 'Roleplay: you try', scene: 'airport', hold: 1, w: 3,
    cast: [['lena', { x: 380, y: 1020, s: 0.7, flip: 1, pose: 'tablet', face: 'neutral' }], ['tom', { x: 700, y: 1020, s: 0.7, flip: -1, pose: 'phoneChest', face: 'worried' }]],
    steps: [nar('Choose roles. Traveler or gate agent. Try the conversation. The sample answers stay hidden until you ask.')],
    act: {
      type: 'task', tag: 'Roleplay', title: 'At the gate', box: { x: 880, y: 140, w: 1000 }, cam: { x: 330, z: 1 },
      roles: [{ r: '[A|eɪ] · Traveler', t: 'Goal: find out what {m:could} happen. Decide: wait, or change flights.' }, { r: '[B|biː] · Gate agent', t: 'Goal: you do not know yet. Explain the possibilities honestly.' }],
      steps: ['Start: “Hi …”', 'Ask about the flight. Use {m:could}, {m:may}, or {m:might}.', 'Agree on what to do next.', 'Swap roles and try again.'],
      support: ['{m:Could} my flight …?', 'Do you think it {m:might} …?', 'It {m:might} …', 'It {m:may} not …'],
      hints: ['Traveler: use questions. Agent: use possibility sentences.'],
      model: rpModel,
    },
  });

  seg({
    id: '6.5', ch: 6, title: 'A model conversation', scene: 'airport', hold: 2,
    cast: [['lena', { x: 520, y: 1010, s: 0.8, flip: 1, pose: 'tablet', face: 'neutral' }], ['tom', { x: 1180, y: 1010, s: 0.8, flip: -1, pose: 'phoneChest', face: 'worried' }]],
    steps: [
      nar('Here is one model conversation. Yours can be different.'),
      say('tom', 'Hi. {m:Could} my flight be late?', { face: 'worried', gest: 'phoneChest', to: 'lena' }),
      say('lena', 'It {m:might} leave at nine. I do not know yet.', { face: 'apology', gest: 'openR', to: 'tom' }),
      say('tom', 'Do you think I {m:might} miss my meeting?', { face: 'worried', gest: 'shrug', to: 'lena' }),
      say('lena', 'You {m:may} miss the start. I {m:could} check another flight.', { face: 'smile', gest: 'tablet', to: 'tom' }),
      say('tom', 'Yes, please. What {m:could} happen next?', { face: 'curious', gest: 'open', to: 'lena' }),
      say('lena', 'The new flight {m:may} leave at ten. I will tell you soon.', { face: 'smile', gest: 'openR', to: 'tom' }),
      nar('Notice: Lena does not say what will happen. She does not know, so she uses might, could, and may. Tom asks natural questions: Could my flight be late? Do you think I might miss my meeting? What could happen next?'),
    ],
  });

  /* ============ CHAPTER 7 ============ */
  seg({
    id: '7.1', ch: 7, title: 'Everything together', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 2,
    cast: [['maya', P(380, 1, 'open', 'smile', 0.6, 1050)], ['daniel', P(1540, -1, 'idle', 'smile', 0.6, 1050)]],
    steps: [
      fx('summary', {
        x: 90, y: 150, w: 1740,
        nodes: [
          { icon: 'cloud', title: 'Meaning', text: 'Possible, not certain.' },
          { icon: 'check', title: 'Form', text: '{s:She} {m:might} {v:arrive}.' },
          { icon: 'cross', title: 'Negative', text: '{m:might} {n:not} {v:come}' },
          { icon: 'qmark', title: 'Question', text: '{m:Could} {s:she} {v:come}?' },
        ], warn: 'Watch the context: “You may not enter” can mean forbidden. “She may not arrive” means perhaps she will not.',
      }, 6),
      nar('Let us connect everything. Meaning: something is possible, but not certain. Form: subject, modal, base verb. Negative: put not after the modal. Question: modal first, or Do you think.'),
      nar('And one warning. The same words can have different meanings. You may not enter can mean it is forbidden. She may not arrive means perhaps she will not. The scene and the context tell us.'),
    ],
  });

  seg({
    id: '7.2', ch: 7, title: 'Exit check', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 1, w: 3,
    cast: [['maya', P(700, 1, 'think', 'curious', 0.7, 1030)], ['daniel', P(1060, -1, 'idle', 'smile', 0.7, 1030)]],
    steps: [nar('Three questions to finish. Take your time. Some questions have more than one answer.')],
    act: {
      type: 'quiz', tag: 'Exit check', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { q: 'Which sentences show possibility with correct form?', multiNote: 'Choose all that fit.', okMsg: 'Yes!', expl: 'After may, might, or could, use the base verb. “Will” says it is certain.', opts: [{ t: 'She might arrive early.', ok: true }, { t: 'She could arrive early.', ok: true }, { t: 'She will arrive early.', ok: false, why: '“Will” is a prediction without the idea of uncertainty here.' }, { t: 'She might arrives early.', ok: false, why: 'Use the base verb: arrive, not arrives.' }] },
        { ctx: { icon: 'phone', text: 'Maya has no news about Sofia.' }, q: '“Sofia may not come.” means:', okMsg: 'Yes!', expl: 'In this situation, may not is about uncertainty.', opts: [{ t: 'Perhaps she will not come.', ok: true }, { t: 'She is not allowed to come.', ok: false, why: 'No rule is mentioned.' }, { t: 'She cannot come.', ok: false, why: 'Cannot is stronger. It says she is unable.' }] },
        { q: 'Which questions are natural?', multiNote: 'Choose all that are natural.', okMsg: 'Yes!', expl: 'Modal first, or Do you think plus a normal modal statement.', opts: [{ t: 'Could this be the right address?', ok: true }, { t: 'Do you think she might come?', ok: true }, { t: 'Does she might come?', ok: false, why: 'Do not use does with a modal.' }, { t: 'Might this to be the right address?', ok: false, why: 'No “to” after a modal.' }] },
      ],
    },
  });

  seg({
    id: '7.3', ch: 7, title: 'Your own sentence', scene: 'rooftop', sceneOpts: { wet: 0.25 }, hold: 1, w: 2,
    cast: [['maya', P(700, 1, 'open', 'smile', 0.7, 1030)], ['priya', P(1060, -1, 'idle', 'smile', 0.7, 1030)]],
    steps: [nar('Last task. Say one original sentence about tomorrow. Include may, might, or could.')],
    act: {
      type: 'free', tag: 'Your sentence', box: FOUR, cam: { x: 330, z: 1 }, q: 'What may, might, or could happen tomorrow?',
      prompts: ['Think about your day, your work, or the weather.', 'Say it aloud first. Then your teacher can type it.'],
      examples: ['“I {m:might} call a friend.”', '“It {m:could} be sunny.”', '“My team {m:may} finish early.”'],
    },
  });

  seg({
    id: '7.4', ch: 7, title: 'Teacher notes and goodbye', scene: 'rooftop', sceneOpts: { wet: 0.1 }, hold: 3,
    cast: [['maya', P(430, 1, 'wave', 'grin', 0.76, 1020)], ['daniel', P(960, 1, 'idle', 'smile', 0.76, 1030)], ['priya', P(1490, -1, 'idle', 'smile', 0.76, 1020)]],
    steps: [
      ['do', (X) => { X.S.setWeather(0.1, 0, 5); }],
      fx('note', { id: 'tnotes', title: 'Common difficulties to listen for', x: 250, y: 150, w: 1420, size: 'sm', cls: '', lines: ['{s:She} {m:might} {n:arrives}. (an ending after a modal)', '{s:He} {m:could} {n:to} help. (a “to” after a modal)', '{n:Does} she {m:might} come? (do, does, or did with a modal)', '{n:Couldn’t} used for {m:might} {n:not}. (impossible, not uncertain)', '“You {m:may} not enter.” (permission, not possibility)', 'These are common difficulties, not results from this class.'] }, 4),
      nar('Thank you for learning with Fluent English. Today you used may, might, and could to talk about what is possible. See you next time!'),
    ],
  });
})();
