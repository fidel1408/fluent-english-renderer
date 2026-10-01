/* 92: Chapter 3 (13:00–21:00) Forms and pronunciation · Chapter 4 (21:00–31:00) Guided practice */
(function () {
  'use strict';
  const FE = window.FE, seg = FE.seg;
  const P = (x, flip, pose, face, s = 0.7, y = 1030) => ({ x, y, s, flip, pose, face });
  const say = (who, text, o) => ['say', who, text, o || {}];
  const nar = (text, o) => ['nar', text, o || {}];
  const fx = (name, args, dur) => ['fx', name, args, dur];
  const BX = { x: 960, y: 160, w: 900 };
  const FOUR = { x: 960, y: 150, w: 900 };

  /* ============ CHAPTER 3 ============ */
  seg({
    id: '3.1', ch: 3, title: 'The pattern', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 2,
    cast: [['maya', P(380, 1, 'open', 'smile')], ['daniel', P(1540, -1, 'idle', 'smile')]],
    steps: [
      nar('Every possibility sentence uses the same engine. First, who. Second, a modal: may, might, or could. Third, the base verb.'),
      fx('builder', { title: 'Subject, modal, base verb', x: 300, y: 170, w: 1320, parts: [{ t: 'She', role: 's' }, { t: 'may', role: 'm' }, { t: 'arrive', role: 'v' }, { t: 'early.', role: 't' }] }, 3),
      nar('Now watch the first word change. The modal stays. The verb stays.'),
      ['do', (X) => FE.FX.chipSet(X, 0, 'He', 's')], ['wait', 1.4],
      ['do', (X) => FE.FX.chipSet(X, 0, 'They', 's')], ['wait', 1.4],
      ['do', (X) => FE.FX.chipSet(X, 0, 'The train', 's')], ['wait', 1.4],
      nar('He may arrive. They may arrive. The train may arrive. The verb never changes.'),
    ],
  });

  seg({
    id: '3.2', ch: 3, title: 'No ending, no to, no do', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 2,
    cast: [['maya', P(380, 1, 'stop', 'firm')], ['daniel', P(1540, -1, 'idle', 'curious')]],
    steps: [
      fx('builder', { title: 'Three things that never appear', x: 300, y: 170, w: 1320, parts: [{ t: 'She', role: 's' }, { t: 'might', role: 'm' }, { t: 'arrive', role: 'v' }, { t: 'late.', role: 't' }] }, 1.5),
      nar('With he, she, or it, we usually add an s. But after may, might, or could, the verb stays in its base form. She might arrive. Not she might arrives.'),
      fx('reject', { t: 'arrives', at: 640, note: 'Base verb only: arrive, not arrives.' }, 3),
      nar('We do not add “to”. She could help. Not she could to help.'),
      ['do', (X) => { FE.FX.chipsClear(X); FE.FX.chipSet(X, 1, 'could', 'm'); FE.FX.chipSet(X, 2, 'help', 'v'); }],
      fx('reject', { t: 'to', at: 640, note: 'No “to” after a modal.' }, 3),
      nar('And we do not use do, does, or did to make the sentence. Not she does might arrive.'),
      ['do', (X) => FE.FX.chipsClear(X)],
      fx('reject', { t: 'does', at: 300, note: 'No do, does, or did with a modal.' }, 3),
    ],
  });

  seg({
    id: '3.3', ch: 3, title: 'With be', scene: 'cafe', sceneOpts: { wet: 0.2 }, hold: 2,
    cast: [['daniel', P(400, 1, 'think', 'think')], ['maya', P(1520, -1, 'idle', 'smile')]],
    steps: [
      nar('Be follows the same rule. The modal stays, and be stays be.'),
      fx('builder', { title: 'With be', x: 300, y: 170, w: 1320, parts: [{ t: 'He', role: 's' }, { t: 'might', role: 'm' }, { t: 'be', role: 'v' }, { t: 'at home.', role: 't' }] }, 2.5),
      ['do', (X) => { FE.FX.chipSet(X, 0, 'The train', 's'); FE.FX.chipSet(X, 1, 'could', 'm'); FE.FX.chipSet(X, 3, 'late.', 't'); }],
      nar('He might be at home. The train could be late. Not he might is at home.'),
    ],
  });

  seg({
    id: '3.4', ch: 3, title: 'Uncertain negatives', scene: 'office', sceneOpts: { wet: 0.4 }, hold: 2,
    cast: [['maya', P(380, 1, 'shrug', 'unsure')], ['priya', P(1540, -1, 'idle', 'curious')]],
    steps: [
      nar('For a negative possibility, put not after the modal.'),
      fx('builder', { title: 'Subject, modal, not, base verb', x: 300, y: 170, w: 1320, parts: [{ t: 'She', role: 's' }, { t: 'may', role: 'm' }, { t: 'not', role: 'n' }, { t: 'come.', role: 'v' }] }, 2.5),
      nar('She may not come. She might not come. Both can mean: perhaps she will not come.'),
      ['do', (X) => FE.FX.chipSet(X, 1, 'might', 'm')], ['wait', 1.2],
      ['do', (X) => FE.FX.panel(X, { id: 'warn', x: 380, y: 420, w: 1160, cls: 'warncard', html: `<div style="display:flex;gap:20px;align-items:center">${FE.icon('qmark', 80)}<div><div class="ub mid">${FE.U('Be careful with {n:couldn’t}.')}</div><div class="ub sm">${FE.U('{n:Couldn’t} usually means not able, or not possible. It is not the same as {m:might} {n:not}.')}</div></div></div>`, sfx: 'reveal' })],
      nar('Be careful with couldn’t. Couldn’t usually means not able, or not possible. It is not the same uncertain idea as might not.'),
    ],
  });

  seg({
    id: '3.5', ch: 3, title: 'Natural questions', scene: 'hallway', hold: 2,
    cast: [['tom', P(420, 1, 'phoneChest', 'curious')], ['maya', P(1500, -1, 'think', 'curious')]],
    steps: [
      nar('For a direct question with a modal, the modal goes first. Modal, subject, base verb. Could she come?'),
      fx('builder', { title: 'Modal, subject, base verb', x: 300, y: 160, w: 1320, parts: [{ t: 'Could', role: 'm' }, { t: 'she', role: 's' }, { t: 'come?', role: 'v' }] }, 2.5),
      nar('In everyday speech, these three questions sound very natural.'),
      ['do', (X) => FE.FX.clear(X, 'builder')],
      ['do', (X) => FE.FX.panel(X, { id: 'qcards', x: 300, y: 160, w: 1320, html: `<h3>${FE.U('Natural questions')}</h3><div class="trow" style="opacity:1;transform:none">${FE.UB('“{m:Could} {s:this} {v:be} the right address?”', 'mid')}</div><div class="trow" style="opacity:1;transform:none">${FE.UB('“{n:Do} you {v:think} she {m:might} come?”', 'mid')}</div><div class="trow" style="opacity:1;transform:none">${FE.UB('“What {m:could} happen next?”', 'mid')}</div>`, sfx: 'reveal' })],
      nar('Could this be the right address? Do you think she might come? What could happen next?'),
      nar('Why is do correct in the second question? Because do belongs to the verb think. Do you think. After that, she might come is a normal statement with a modal. This does not make Does she might come correct.'),
    ],
  });

  const W = (t, ov, path, note, key) => ({ t, ov, path, note, key });
  seg({
    id: '3.6', ch: 3, title: 'Say it clearly', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 2,
    cast: [['maya', P(380, 1, 'open', 'smile')], ['daniel', P(1540, -1, 'idle', 'smile')]],
    steps: [
      nar('Now pronunciation. Listen to the three words, one at a time.'),
      fx('pron', {
        title: 'Listen', x: 210, y: 150, w: 1500,
        words: [
          W('may', null, 'M10 50 Q60 10 110 28 T190 40', 'The sound glides.', FE.speechKey('af_heart', 'may', 'mˈeɪ')),
          W('might', null, 'M10 50 Q60 10 100 28 T170 40 M176 18 L176 52', 'Glide, then a stop.', FE.speechKey('af_heart', 'might', 'mˈaɪt')),
          W('could', null, 'M20 40 Q100 20 180 40', 'The [l|el] is silent.', FE.speechKey('af_heart', 'could', 'kˈʊd')),
          W('could', 'kəd', 'M60 40 Q100 30 140 40', 'Fast speech: weak.', FE.speechKey('af_heart', 'could', 'kəd')),
        ],
      }, 1.5),
      nar('may', { ph: 'mˈeɪ', gap: 0.8 }),
      nar('might', { ph: 'mˈaɪt', gap: 0.8 }),
      nar('could', { ph: 'kˈʊd', gap: 0.8 }),
      nar('In could, the l is silent. In fast, natural speech, could often becomes weak, with a short schwa sound. Listen.', { gap: 0.6 }),
      nar('could', { ph: 'kəd', gap: 0.8 }),
      nar('She could arrive early.', { ph: 'ʃi kəd ɚˈaɪv ˈɜːli', gap: 0.4 }),
    ],
  });

  seg({
    id: '3.7', ch: 3, title: 'Listen and repeat', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 1, w: 1,
    cast: [['maya', P(700, 1, 'open', 'smile')], ['daniel', P(1060, -1, 'idle', 'smile')]],
    steps: [nar('Your turn to speak. Listen first. Then repeat each one aloud together. Your teacher can replay any line.')],
    act: {
      type: 'listen', tag: 'Listen and repeat', box: BX, cam: { x: 330, z: 1 }, silent: false, gap: 2.4, lead: 'Say it after the voice.',
      items: [
        { t: 'may', ph: 'mˈeɪ' }, { t: 'might', ph: 'mˈaɪt' }, { t: 'could', ph: 'kˈʊd' },
        { t: '“She {m:may} arrive early.”', cls: 'sm' }, { t: '“She {m:might} arrive early.”', cls: 'sm' }, { t: '“She {m:could} arrive early.”', cls: 'sm' },
        { t: '“Do you think she {m:might} come?”', cls: 'sm' },
        { t: '“She {m:might} not come.”', cls: 'sm' }, { t: '“{m:Could} this be the right address?”', cls: 'sm' }, { t: '“What {m:could} happen next?”', cls: 'sm' },
      ],
    },
  });

  seg({
    id: '3.8', ch: 3, title: 'Not every could is a guess', scene: 'hallway', hold: 2, w: 1,
    cast: [['ken', { x: 560, y: 1000, s: 0.78, flip: 1, pose: 'stop', face: 'firm' }], ['maya', { x: 1280, y: 1010, s: 0.78, flip: -1, pose: 'phoneChest', face: 'unsure' }]],
    steps: [
      nar('Be careful. These words can have other meanings. Could can talk about general ability in the past.'),
      fx('note', { id: 'other', title: 'Other meanings of could', x: 380, y: 150, w: 1160, size: 'sm', lines: ['Past ability: “When I was younger, I {m:could} swim well.”', 'Polite permission: “{m:Could} I leave early?”', 'Polite request: “{m:Could} you check this?”'] }, 1),
      nar('When I was younger, I could swim well. That is ability, not a guess. Could I leave early? That asks permission. Could you check this? That is a polite request.'),
      ['do', (X) => FE.FX.clear(X, 'other')],
      nar('Also, may can mean permission. Look at the door. The guard is speaking.'),
      say('ken', 'You {m:may} not enter.', { face: 'firm', gest: 'stop', to: 'maya' }),
      nar('Here, may not means entry is not allowed. Now look at Maya. She is checking her phone.'),
      say('maya', 'She {m:may} not arrive today.', { face: 'unsure', gest: 'phoneChest', to: 'ken' }),
      nar('Here, may not means perhaps she will not arrive. The scene and the context tell us the meaning.'),
    ],
    act: {
      type: 'quiz', tag: 'Which meaning?', box: BX, cam: { x: 330, z: 1 },
      items: [
        { ctx: { icon: 'stop', text: 'A guard stands at a door.' }, q: '“You may not enter.” means:', okMsg: 'Yes!', expl: 'The guard is giving a rule. The context shows permission, not possibility.',
          opts: [{ t: 'Entry is not allowed.', ok: true }, { t: 'Perhaps you will not enter.', ok: false, why: 'A guard at a door is giving a rule here.' }] },
        { ctx: { icon: 'phone', text: 'Maya checks her phone. No news.' }, q: '“She may not arrive today.” means:', okMsg: 'Yes!', expl: 'Here may not is about uncertainty, not permission.',
          opts: [{ t: 'Perhaps she will not arrive today.', ok: true }, { t: 'She is not allowed to arrive today.', ok: false, why: 'Nobody is giving a rule in this situation.' }] },
        { q: '“Could I leave early?” is:', okMsg: 'Yes!', expl: 'The speaker is asking politely. This could is not a guess.', opts: [{ t: 'A polite question about permission.', ok: true }, { t: 'A guess about the future.', ok: false, why: 'The speaker is asking, not guessing.' }] },
        { q: '“Could you check this?” is:', okMsg: 'Yes!', expl: 'It is a polite request. The speaker wants you to act.', opts: [{ t: 'A polite request.', ok: true }, { t: 'A guess about what you will do.', ok: false, why: 'The speaker is asking for help.' }] },
        { q: '“When I was younger, I could swim well.” means:', okMsg: 'Yes!', expl: 'This could talks about general ability in the past. Could is not always about possibility.', opts: [{ t: 'I had the ability to swim well.', ok: true }, { t: 'Perhaps I will swim tomorrow.', ok: false, why: 'The sentence is about the past.' }] },
      ],
    },
  });

  /* ============ CHAPTER 4 ============ */
  const S4 = (id, title, scene, x1, x2, extra) => Object.assign({ id, ch: 4, title, scene, hold: 1, w: 1, cast: [['maya', { x: x1, y: 1030, s: 0.7, flip: 1, pose: 'think', face: 'curious' }], ['daniel', { x: x2, y: 1030, s: 0.7, flip: -1, pose: 'phoneChest', face: 'neutral' }]] }, extra);

  seg(S4('4.1', 'Build a sentence', 'rooftop', 700, 1060, {
    sceneOpts: { wet: 0.5 }, steps: [nar('Build a sentence about the food truck. It is possibly late.')],
    act: {
      type: 'build', tag: 'Build it', box: FOUR, cam: { x: 330, z: 1 }, q: 'Say that the truck is possibly late.',
      chips: [{ t: 'The truck', role: 's' }, { t: 'may', role: 'm' }, { t: 'might', role: 'm' }, { t: 'could', role: 'm' }, { t: 'not', role: 'n' }, { t: 'be', role: 'v' }, { t: 'arrive', role: 'v' }, { t: 'arrives', role: 'v' }, { t: 'to', role: 'n' }, { t: 'does', role: 'n' }, { t: 'late.', role: 't' }],
      sample: ['The truck', 'might', 'be', 'late.'], sampleText: '“The truck might be late.”', extra: 'May and could work here too.',
      validate: (w) => {
        const M = ['may', 'might', 'could'];
        if (w.includes('arrives')) return { ok: false, msg: 'Use the base verb: arrive, not arrives.' };
        if (w.includes('to')) return { ok: false, msg: 'No “to” after may, might, or could.' };
        if (w.includes('does')) return { ok: false, msg: 'Do not use does with a modal.' };
        if (w[0] !== 'The truck') return { ok: false, msg: 'Start with who: The truck.' };
        if (!M.includes(w[1])) return { ok: false, msg: 'Choose may, might, or could after the subject.' };
        const rest = w.slice(2).join(' ');
        if (['be late.', 'arrive late.', 'not be late.', 'not arrive late.'].includes(rest)) return { ok: true, msg: 'The order is who, modal, base verb. Other modals would also work.' };
        return { ok: false, msg: 'Try: who, modal, then be or arrive, then late.' };
      },
    },
  }));

  seg(S4('4.2', 'Match the picture', 'cafe', 700, 1060, {
    sceneOpts: { wet: 0.3 }, steps: [nar('Look at each picture. Choose the sentence that fits.')],
    act: {
      type: 'quiz', tag: 'Match', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { ctx: { icon: 'cloud', text: 'Dark clouds. No rain yet.' }, q: 'Which sentence fits?', okMsg: 'Yes!', expl: 'The clouds are evidence for a possible future.', opts: [{ t: 'It might rain.', ok: true }, { t: 'It is raining now.', ok: false, why: 'The picture shows clouds before the rain.' }, { t: 'It rained last week.', ok: false, why: 'Nothing in the picture is about last week.' }] },
        { ctx: { icon: 'absent', text: 'An empty chair. No message.' }, q: 'Which sentence fits?', okMsg: 'Yes!', expl: 'We do not know yet, so a possibility sentence fits.', opts: [{ t: 'Sofia may not come.', ok: true }, { t: 'Sofia is sitting here.', ok: false, why: 'The chair is empty.' }, { t: 'Sofia always comes.', ok: false, why: 'That is a fact about habit, not this situation.' }] },
        { ctx: { icon: 'vanLate', text: 'The van is late. Traffic.' }, q: 'Which sentence fits?', okMsg: 'Yes!', expl: 'Could works for a present or future guess.', opts: [{ t: 'The food could be late.', ok: true }, { t: 'The food is on the table.', ok: false, why: 'The van has not arrived.' }, { t: 'The food was cold.', ok: false, why: 'Nothing here is about the past.' }] },
      ],
    },
  }));

  seg(S4('4.3', 'Certain or possible?', 'office', 700, 1060, {
    sceneOpts: { wet: 0.3 }, steps: [nar('Some sentences are certain. Some are possible. Can you tell the difference?')],
    act: {
      type: 'quiz', tag: 'Certain or possible?', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { q: 'Which sentence is certain?', okMsg: 'Yes!', expl: 'The first sentence states it as a fact. The others use a modal, so they are possibilities.', opts: [{ t: 'The party starts at seven.', ok: true }, { t: 'The party might start at seven.', ok: false, why: 'Might makes it possible, not certain.' }, { t: 'The party could start late.', ok: false, why: 'Could makes it possible, not certain.' }] },
        { q: 'Which two sentences show possibility?', multiNote: 'Choose two.', okMsg: 'Yes!', expl: 'May and might both show possibility. The other two are facts.', opts: [{ t: 'Maya may call us.', ok: true }, { t: 'Maya called us.', ok: false, why: 'This is a past fact.' }, { t: 'Maya might call us.', ok: true }, { t: 'Maya is calling us now.', ok: false, why: 'This is happening now, so it is certain.' }] },
      ],
    },
  }));

  seg(S4('4.4', 'May not, might not, couldn’t', 'hallway', 700, 1060, {
    steps: [nar('Now the negatives. Read the situation carefully. The context matters.')],
    act: {
      type: 'quiz', tag: 'What does it mean?', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { ctx: { icon: 'phone', text: 'Priya has not answered.' }, q: '“Priya may not come tonight.” means:', okMsg: 'Yes!', expl: 'May not and might not can both mean perhaps she will not.', opts: [{ t: 'Perhaps she will not come.', ok: true }, { t: 'She is not allowed to come.', ok: false, why: 'Here, no rule is mentioned.' }, { t: 'She definitely will not come.', ok: false, why: 'May not keeps the possibility open.' }] },
        { ctx: { icon: 'stop', text: 'A guard stands at a door.' }, q: 'The guard says: “You may not enter.”', okMsg: 'Yes!', expl: 'Same words, different meaning. The scene tells us.', opts: [{ t: 'Entry is not allowed.', ok: true }, { t: 'Perhaps you will not enter.', ok: false, why: 'A guard is giving a rule here.' }] },
        { ctx: { icon: 'guest', text: 'Someone says: “Look, that man is Tom.”' }, q: '“It couldn’t be Tom. He is in Spain.” means:', okMsg: 'Yes!', expl: 'Couldn’t says it is not possible. It is stronger than might not.', opts: [{ t: 'It is not possible that it is Tom.', ok: true }, { t: 'Perhaps it is not Tom.', ok: false, why: 'That idea is closer to “It might not be Tom.”' }] },
      ],
    },
  }));

  seg(S4('4.5', 'Repair the sentence, part one', 'cafe', 700, 1060, {
    sceneOpts: { wet: 0.2 }, steps: [nar('Each sentence has a mistake. Find the repair. More than one repair can be correct.')],
    act: {
      type: 'quiz', tag: 'Repair', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { bad: '“She might arrives late.”', q: 'Which sentences repair it?', multiNote: 'Choose all that repair it.', okMsg: 'Yes!', expl: 'What changed: arrives became arrive. After may, might, or could, the verb is the base form.', hint: 'Look at the verb after might.', opts: [{ t: 'She might arrive late.', ok: true }, { t: 'She may arrive late.', ok: true }, { t: 'She might arriving late.', ok: false, why: 'Use the base verb: arrive, not arriving.' }, { t: 'She might arrived late.', ok: false, why: 'Use the base verb: arrive, not arrived.' }] },
        { bad: '“He could to help.”', q: 'Which sentences repair it?', multiNote: 'Choose all that repair it.', okMsg: 'Yes!', expl: 'What changed: the word “to” was removed. There is no “to” between a modal and the base verb.', opts: [{ t: 'He could help.', ok: true }, { t: 'He might help.', ok: true }, { t: 'He could helps.', ok: false, why: 'Use the base verb: help, not helps.' }, { t: 'He could helping.', ok: false, why: 'Use the base verb: help, not helping.' }] },
      ],
    },
  }));

  seg(S4('4.6', 'Repair the sentence, part two', 'hallway', 700, 1060, {
    steps: [nar('Two more repairs. Think about what the speaker wants to say.')],
    act: {
      type: 'quiz', tag: 'Repair', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { ctx: { icon: 'qmark', text: 'Maya wonders if Sofia will come.' }, bad: '“Does she may come?”', q: 'Which questions repair it?', multiNote: 'Choose all that repair it.', okMsg: 'Yes!', expl: 'What changed: no does. A direct modal question puts the modal first. Or ask with Do you think, because do belongs to think.', opts: [{ t: 'Could she come?', ok: true }, { t: 'Do you think she might come?', ok: true }, { t: 'May she come?', ok: false, why: 'May she come? usually asks permission. Here we are guessing.' }, { t: 'Does she could come?', ok: false, why: 'Do not use does with a modal.' }] },
        { bad: '“She doesn’t might come.”', q: 'Which sentences repair it?', multiNote: 'Choose all that repair it.', okMsg: 'Yes!', expl: 'What changed: no doesn’t. The negative is modal + not + base verb.', opts: [{ t: 'She might not come.', ok: true }, { t: 'She may not come.', ok: true }, { t: 'She doesn’t may come.', ok: false, why: 'Do not use doesn’t with a modal.' }, { t: 'She couldn’t come.', ok: false, why: 'Couldn’t usually means she is not able. It is not the same uncertain idea.' }] },
      ],
    },
  }));

  seg(S4('4.7', 'Choose all natural answers', 'cafe', 700, 1060, {
    sceneOpts: { wet: 0.2 }, steps: [nar('Tom is late again. Choose all the natural sentences. There may be more than one.')],
    act: {
      type: 'quiz', tag: 'All natural answers', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { ctx: { icon: 'absent', text: 'Tom is late.' }, q: 'Which sentences are natural?', multiNote: 'Choose all that are natural.', okMsg: 'Yes!', expl: 'May, might, and could all work. The last two have form mistakes.', opts: [{ t: 'Tom might be stuck in traffic.', ok: true }, { t: 'Tom could be on the wrong train.', ok: true }, { t: 'Tom may be waiting outside.', ok: true }, { t: 'Tom mights be late.', ok: false, why: 'Modals never change form: might, not mights.' }, { t: 'Tom might to be late.', ok: false, why: 'No “to” after a modal.' }] },
      ],
    },
  }));

  seg(S4('4.8', 'Natural questions', 'office', 700, 1060, {
    sceneOpts: { wet: 0.3 }, steps: [nar('Last interaction. Which questions would people really ask?')],
    act: {
      type: 'quiz', tag: 'Questions', box: FOUR, cam: { x: 330, z: 1 }, items: [
        { q: 'Which questions are natural in everyday English?', multiNote: 'Choose all that are natural.', okMsg: 'Yes!', expl: 'People often ask about possibilities with these patterns. Does she might come? is never correct.', opts: [{ t: 'What could happen next?', ok: true }, { t: 'Do you think she might come?', ok: true }, { t: 'Could this be the right address?', ok: true }, { t: 'Does she might come?', ok: false, why: 'Do not use does with a modal.' }, { t: 'May it rain tomorrow?', ok: false, why: 'It is not the normal everyday question. People usually ask: Do you think it might rain tomorrow?' }] },
      ],
    },
  }));

  seg({
    id: '4.9', ch: 4, title: 'What we fixed', scene: 'office', sceneOpts: { wet: 0.3 }, hold: 2,
    cast: [['maya', P(400, 1, 'open', 'smile')], ['daniel', P(1540, -1, 'idle', 'smile')]],
    steps: [
      fx('note', { id: 'recap', title: 'What we fixed', x: 260, y: 160, w: 1400, size: 'sm', lines: ['{s:She} {m:might} {v:arrive}, not {n:arrives}.', '{s:He} {m:could} {v:help}, not {n:to} help.', '{m:Could} {s:she} {v:come}?, not {n:Does} she {m:could} come?', '{s:She} {m:might} {n:not} {v:come}, not {n:doesn’t} might come.'] }, 1),
      nar('Here is what we fixed. After a modal, the verb stays in its base form. No s. No to. No do, does, or did. For a negative, put not after the modal. For a question, put the modal first.'),
    ],
  });
})();
