/* 91: Chapter 1 (00:00–05:00) Hook and diagnostic · Chapter 2 (05:00–13:00) Core meaning */
(function () {
  'use strict';
  const FE = window.FE, seg = FE.seg, FX = () => FE.FX;
  // shorthand for presenter layout: small characters at the bottom, panels above
  const P = (x, flip, pose, face, s = 0.74, y = 1010) => ({ x, y, s, flip, pose, face });
  const say = (who, text, o) => ['say', who, text, o || {}];
  const nar = (text, o) => ['nar', text, o || {}];
  const wait = (s) => ['wait', s];
  const fx = (name, args, dur) => ['fx', name, args, dur];
  const clear = (id) => ['do', (X) => FE.FX.clear(X, id)];

  /* ============ CHAPTER 1 ============ */
  seg({
    id: '1.1', ch: 1, title: 'Welcome', scene: 'rooftop', sceneOpts: { wet: 0.2 }, hold: 2,
    cast: [['maya', P(430, 1, 'idle', 'smile', 0.8, 1000)], ['daniel', P(960, 1, 'idle', 'smile', 0.8, 1010)], ['priya', P(1490, -1, 'idle', 'smile', 0.8, 1000)]],
    steps: [
      ['do', (X) => { X.S.char('maya').pose('wave', 0.8, 'back'); FE.FX.panel(X, { id: 'title', x: 260, y: 190, w: 1400, cls: 'titlecard', html: `<div class="ctr big" style="--fs:100px">${FE.U('{m:May}, {m:Might}, and {m:Could}')}</div><div class="ctr mid" style="margin-top:10px">${FE.U('Talking about things that are possible')}</div>`, sfx: 'reveal' }); }],
      nar('Welcome to Fluent English. Today we are learning May, Might, and Could. We use these words to talk about things that are possible, but not certain.'),
      ['do', (X) => { X.S.char('maya').pose('idle', 0.8); }],
    ],
  });

  seg({
    id: '1.2', ch: 1, title: 'Preparing the party', scene: 'rooftop', sceneOpts: { wet: 0.55 }, amb: 'wind', hold: 1.5,
    cast: [['maya', { x: 520, flip: 1, pose: 'tablet', face: 'worried' }], ['daniel', { x: 1010, flip: -1, pose: 'phoneChest', face: 'neutral' }], ['priya', { x: 1440, flip: -1, pose: 'clasp', face: 'unsure' }]],
    steps: [
      ['do', (X) => FE.FX.clear(X)],
      nar('It is Friday afternoon. Maya and her team are getting a rooftop party ready for tomorrow evening.'),
      ['do', (X) => { X.S.camTo({ z: 1.06, y: -30 }, 9); X.S.char('maya').look(0, -1, 0.5); }],
      say('maya', 'Look at those clouds, Daniel. It {m:might} rain tomorrow.', { gest: 'pointUpR', face: 'worried', to: 'daniel' }),
      ['do', (X) => { X.S.char('daniel').pose('phoneR', 0.7); }],
      say('daniel', 'And the food delivery is late. The truck {m:could} be stuck in traffic.', { face: 'unsure', gest: 'phoneR', to: 'maya' }),
      say('priya', 'Sofia has not answered my message. She {m:may} come, or she {m:might} not.', { face: 'unsure', gest: 'shrug', to: 'maya' }),
      ['do', (X) => { X.S.char('maya').pose('think', 0.9); X.S.char('maya').face('think'); }],
      nar('Three things are not certain. The weather. The delivery. And one guest. Nobody knows yet what will happen.'),
      fx('tags', { items: [{ icon: 'cloud', text: 'the weather' }, { icon: 'vanLate', text: 'the delivery' }, { icon: 'absent', text: 'one guest' }] }, 4),
    ],
  });

  seg({
    id: '1.3', ch: 1, title: 'What might happen?', scene: 'rooftop', sceneOpts: { wet: 0.55 }, hold: 1, w: 2,
    cast: [['maya', P(640, 1, 'think', 'curious', 0.7, 1020)], ['daniel', P(960, 1, 'phoneChest', 'neutral', 0.7, 1030)], ['priya', P(1260, -1, 'clasp', 'unsure', 0.7, 1020)]],
    steps: [nar('Now it is your turn. What might happen at the party? Think about the clouds, the delivery, and Sofia.')],
    act: {
      type: 'task', tag: 'Predict', title: 'What might happen?', box: { x: 1010, y: 160, w: 850 }, cam: { x: 330, z: 1 },
      lead: 'Tell your partner what {m:might} happen.',
      steps: ['Look at the clouds, the delivery, and Sofia.', 'Say two or three possible outcomes.', 'Say {m:might} in your sentences.'],
      hints: ['Start with: It {m:might} …', 'You can also say: The truck {m:could} …'],
      model: ['“It {m:might} rain tomorrow.”', '“The food {m:could} arrive late.”', '“Sofia {m:may} not come.”', 'All three {m:modals} can fit these ideas.'],
    },
  });

  seg({
    id: '1.4', ch: 1, title: 'Today’s goal', scene: 'rooftop', sceneOpts: { wet: 0.4 }, hold: 2,
    cast: [['maya', P(400, 1, 'open', 'smile', 0.78, 1010)], ['daniel', P(1500, -1, 'idle', 'smile', 0.78, 1010)]],
    steps: [
      ['do', (X) => FE.FX.panel(X, { id: 'goal', x: 300, y: 210, w: 1320, cls: 'goalcard', html: `<h3>${FE.U('Today’s goal')}</h3><div class="mid">${FE.UB('I can use {m:may}, {m:might}, and {m:could} to talk about possible things.', 'mid')}</div>`, sfx: 'reveal' })],
      nar('Here is our goal. By the end of this class, you can use may, might, and could to talk about things that are possible.'),
    ],
  });

  seg({
    id: '1.5', ch: 1, title: 'Warm-up check', scene: 'rooftop', sceneOpts: { wet: 0.55 }, hold: 1, w: 3,
    cast: [['maya', P(700, 1, 'think', 'curious', 0.7, 1020)], ['priya', P(1080, -1, 'idle', 'smile', 0.7, 1020)]],
    steps: [nar('A quick warm-up. This is not a test. There is no score. Choose all the answers that fit.')],
    act: {
      type: 'quiz', tag: 'Warm-up · no score', box: { x: 960, y: 160, w: 900 }, cam: { x: 300, z: 1 },
      items: [
        { ctx: { icon: 'cloud', text: 'We look at the dark clouds.' }, q: '“It ___ rain tomorrow.”', multiNote: 'We are not sure. Choose all that fit.', okMsg: 'Yes!', expl: 'May, might, and could can all fit here. They overlap, so more than one answer is natural.',
          opts: [{ t: 'may', ok: true }, { t: 'might', ok: true }, { t: 'could', ok: true }, { t: 'will definitely', ok: false, why: '“Will definitely” says we are completely sure. Here, nobody is sure.' }] },
        { ctx: { icon: 'absent', text: 'Sofia has not answered yet.' }, q: 'Which sentences say Sofia coming is possible, but not certain?', okMsg: 'Yes!', expl: 'Three modals, three natural sentences. The last one says she is sure to come.',
          opts: [{ t: 'Sofia may come.', ok: true }, { t: 'Sofia might come.', ok: true }, { t: 'Sofia could come.', ok: true }, { t: 'Sofia will come, for sure.', ok: false, why: '“For sure” makes it certain, not possible.' }] },
        { q: 'Which sentence has the correct form?', okMsg: 'Yes!', expl: 'After might, use the base verb: arrive. Do not add an ending, “to”, or “does”.', hint: 'Look at the verb after might.',
          opts: [{ t: 'She might arrive late.', ok: true }, { t: 'She might arrives late.', ok: false, why: 'Use the base verb: arrive, not arrives.' }, { t: 'She might to arrive late.', ok: false, why: 'No “to” after a modal.' }, { t: 'She does might arrive late.', ok: false, why: 'No “does” with a modal.' }] },
      ],
    },
  });

  /* ============ CHAPTER 2 ============ */
  seg({
    id: '2.1', ch: 2, title: 'Certain or possible?', scene: 'rooftop', sceneOpts: { wet: 0.5 }, hold: 2,
    cast: [['maya', P(380, 1, 'tablet', 'neutral', 0.7, 1030)], ['daniel', P(1540, -1, 'pointUpL', 'curious', 0.7, 1030)]],
    steps: [
      nar('When we are sure, we say it directly. The forecast says rain at six. So Maya says: It will rain.'),
      fx('fork', { id: 'fork1', certain: true, h: 300, w: 1200, x: 360, y: 180, evidence: { icon: 'phone', label: 'the forecast' }, branches: [{ icon: 'rain', text: 'It {c:will} rain.' }] }, 3.2),
      nar('But now look at the sky. Dark clouds are evidence. They do not show one future. They show more than one possible future.'),
      ['do', (X) => FE.FX.clear(X, 'fork1')],
      fx('fork', { id: 'fork2', h: 380, w: 1300, x: 310, y: 160, evidence: { icon: 'cloud', label: 'dark clouds' }, branches: [{ icon: 'rain', text: 'It {m:may} rain.' }, { icon: 'sun', text: 'It {m:may} stay dry.' }] }, 3),
      nar('Possible means it can happen, but it is not certain. May, might, and could do not have secret numbers. We use them because we are not sure.'),
    ],
  });

  seg({
    id: '2.2', ch: 2, title: 'One idea, three modals', scene: 'platform', hold: 2,
    cast: [['maya', P(420, 1, 'idle', 'curious', 0.74, 1020)]],
    setup: (X) => { X.S.trainX = 1800; },
    steps: [
      ['do', (X) => { X.S.camTo({ x: 0 }, 1); FE.Tween.to(X.S, { trainX: 700 }, 20, 'out'); }],
      nar('Maya is waiting at the station for Priya. The train is coming fast today. Listen to three natural sentences.'),
      fx('trio', { rows: ['“{s:She} {m:may} {v:arrive} early.”', '“{s:She} {m:might} {v:arrive} early.”', '“{s:She} {m:could} {v:arrive} early.”'], icon: 'train', x: 400, y: 160, w: 1100 }),
      nar('She may arrive early.'), ['do', () => FE.FX.hot(0)],
      nar('She might arrive early.'), ['do', () => FE.FX.hot(1)],
      nar('She could arrive early.'), ['do', () => FE.FX.hot(2)],
      nar('All three are natural. They show the same idea: early is possible, but not certain. Sometimes might sounds a little more tentative, but that depends on the situation and the speaker. It is not a fixed ladder.'),
    ],
  });

  seg({
    id: '2.3', ch: 2, title: 'Predict, watch, explain: now', scene: 'cafe', sceneOpts: { wet: 0.2 }, hold: 1.5, w: 1,
    cast: [['maya', { x: 560, flip: 1, pose: 'coffee', face: 'curious' }], ['daniel', { x: 1180, flip: -1, pose: 'phoneR', face: 'neutral' }]],
    steps: [
      nar('In the café, Maya and Daniel are waiting for Tom. He is late.'),
      say('maya', 'Tom is not here yet. Where is he?', { face: 'curious', to: 'daniel' }),
      fx('ask', { q: 'Where is Tom right now?', sec: 9 }, 9),
      ['do', (X) => FE.FX.clear(X, 'ask')],
      say('daniel', 'He {m:might} be at home.', { gest: 'openR', face: 'think', to: 'maya' }),
      say('maya', 'Or he {m:could} be on the bus.', { gest: 'think', face: 'smile', to: 'daniel' }),
      fx('fork', { id: 'fork3', h: 330, w: 1250, x: 330, y: 170, evidence: { icon: 'absent', label: 'an empty chair' }, branches: [{ icon: 'house', text: 'He {m:might} {v:be} at home.' }, { icon: 'bus', text: 'He {m:could} {v:be} on the bus.' }] }, 2),
      nar('Notice the verb be. Tom is somewhere right now, and we do not know where. So we say: He might be at home. The modal stays the same, and the next word is the base form: be.'),
    ],
    act: {
      type: 'quiz', tag: 'Explain', box: { x: 960, y: 160, w: 900 }, cam: { x: 300, z: 1 },
      items: [
        { q: 'What does “He might be at home” mean?', okMsg: 'Yes!', expl: 'It is about now. Perhaps Tom is at home at this moment.',
          opts: [{ t: 'Perhaps he is at home now.', ok: true }, { t: 'He was at home yesterday.', ok: false, why: 'Nothing in the sentence points to yesterday.' }, { t: 'He is definitely at home.', ok: false, why: 'Might does not say “definitely”.' }] },
        { q: '“Tom is not here. He ___ be on the bus.”', multiNote: 'Choose all that fit.', okMsg: 'Yes!', expl: 'All three are natural. Might, may, and could overlap here.',
          opts: [{ t: 'may', ok: true }, { t: 'might', ok: true }, { t: 'could', ok: true }, { t: 'do', ok: false, why: '“Do” is not a modal. We do not say “He do be”.' }] },
      ],
    },
  });

  seg({
    id: '2.4', ch: 2, title: 'Predict, watch, explain: later', scene: 'platform', hold: 1.5, w: 1,
    cast: [['maya', { x: 560, flip: 1, pose: 'idle', face: 'neutral' }], ['daniel', { x: 1100, flip: -1, pose: 'phoneR', face: 'unsure' }]],
    setup: (X) => { X.S.trainX = 2200; },
    steps: [
      nar('Now the future. Maya and Daniel are waiting for the six o’clock train.'),
      say('daniel', 'There is a signal problem on this line.', { face: 'unsure', gest: 'phoneR', to: 'maya' }),
      say('maya', 'Then the train {m:could} be late.', { face: 'worried', gest: 'think', to: 'daniel' }),
      fx('ask', { q: 'What might happen next?', sec: 9 }, 9),
      ['do', (X) => { FE.FX.clear(X, 'ask'); FE.Audio.sfx('rumble'); FE.Tween.to(X.S, { trainX: 120 }, 5, 'out'); }],
      wait(5),
      say('daniel', 'Look! It is here, and it is on time.', { face: 'relief', gest: 'pointR', to: 'maya' }),
      fx('fork', { id: 'fork4', h: 330, w: 1450, x: 230, y: 160, evidence: { icon: 'stop', label: 'a signal problem' }, branches: [{ icon: 'clock', text: 'The train {m:could} {v:be} late.' }, { icon: 'train', text: 'The train {m:could} {v:be} on time.' }] }, 2),
      nar('This time the train was on time. But before it arrived, both futures were possible. That is what could does here. It looks ahead.'),
    ],
    act: {
      type: 'quiz', tag: 'Explain', box: { x: 960, y: 160, w: 900 }, cam: { x: 300, z: 1 },
      items: [{ q: 'Before the train arrives, which sentences are natural?', multiNote: 'Choose all that fit.', okMsg: 'Yes!', expl: 'May, might, and could can all describe this future possibility.',
        opts: [{ t: 'The train could be late.', ok: true }, { t: 'The train might be late.', ok: true }, { t: 'The train may be late.', ok: true }, { t: 'The train coulds be late.', ok: false, why: 'Modals never change form: could, not coulds.' }] }],
    },
  });

  seg({
    id: '2.5', ch: 2, title: 'Time cues', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 2,
    cast: [['daniel', P(400, 1, 'idle', 'smile', 0.7, 1030)], ['maya', P(1500, -1, 'idle', 'smile', 0.7, 1030)]],
    steps: [
      nar('Possibility can be about now, or about later. Time cues help us. Right now, at the moment, today, tonight, tomorrow, next week.'),
      fx('timeAxis', { x: 240, y: 160, w: 1440, cues: ['right now', 'at the moment', 'today', 'tonight', 'tomorrow', 'next week'], sentences: ['{s:Sofia} {m:could} {v:be} in a meeting {t:right now}.', '{s:It} {m:could} {v:rain} {t:tomorrow}.'] }, 5),
      nar('Could can point to now, or to later. May and might can do the same. The situation and the time cue tell us which one.'),
    ],
  });

  seg({
    id: '2.6', ch: 2, title: 'Now, later, or either?', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 1, w: 2,
    cast: [['daniel', P(720, 1, 'think', 'curious', 0.7, 1030)]],
    steps: [nar('Read each sentence. Is the possibility about now, later, or either?')],
    act: {
      type: 'sort', tag: 'Sort', box: { x: 800, y: 150, w: 1060 }, cam: { x: 330, z: 1 },
      items: [
        { t: '“He might be at home right now.”', ans: 'now', why: '“Right now” is a time cue for the present.' },
        { t: '“It could rain tomorrow.”', ans: 'later', why: '“Tomorrow” points to the future.' },
        { t: '“The guest could be outside.”', ans: 'both', why: 'There is no time cue. It could be now, or soon.' },
        { t: '“The delivery may arrive tonight.”', ans: 'later', why: '“Tonight” points ahead.' },
        { t: '“Sofia might be in a meeting at the moment.”', ans: 'now', why: '“At the moment” means now.' },
      ],
    },
  });

  seg({
    id: '2.7', ch: 2, title: 'Predict, watch, explain: a question', scene: 'hallway', hold: 1.5, w: 1,
    cast: [['tom', { x: 760, flip: 1, pose: 'phoneChest', face: 'unsure' }]],
    steps: [
      nar('Tom is looking for the party. He checks the address on his phone.'),
      say('tom', '{m:Could} this be the right address?', { face: 'curious', gest: 'phoneChest' }),
      fx('ask', { q: 'Who might open the door?', sec: 8 }, 8),
      ['do', (X) => { FE.FX.clear(X, 'ask'); X.S.add('daniel', { x: 1180, flip: -1, pose: 'open', face: 'grin', alpha: 0 }); X.S.char('daniel').to({ alpha: 1 }, 0.6); X.S.char('tom').look(0.8, 0, 0.3); }],
      say('daniel', 'Tom! Yes, you found us. Come in!', { face: 'grin', gest: 'open', to: 'tom' }),
      nar('Notice the question: Could this be the right address? The modal comes first, then the subject, then be. We use this question when we are guessing.'),
    ],
    act: {
      type: 'quiz', tag: 'Explain', box: { x: 960, y: 160, w: 900 }, cam: { x: 300, z: 1 },
      items: [{ q: 'Tom is guessing. Which question is natural?', okMsg: 'Yes!', expl: 'Modal first, then the subject, then the base verb. No “does”.',
        opts: [{ t: 'Could this be the right address?', ok: true }, { t: 'Does this could be the right address?', ok: false, why: 'Do not use “does” with a modal.' }, { t: 'Could this is the right address?', ok: false, why: 'After could, use be, not is.' }] }],
    },
  });
})();
