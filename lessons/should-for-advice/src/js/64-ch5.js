/* Chapter 5 · 29:00–39:00 · Guided practice and common mistakes (eight-plus genuine interactions) */
(function (g) {
  'use strict';
  const FE = g.FE, { U, UB } = FE, C = FE.C;

  const PX = 520, PY = 190, PW = 1360;
  function stage5(S, envName, actorKey, opt) {
    S.env(envName || 'cowork', { laptop: false, monitor: false, lamp: false }); C.dim(S, 0.64);
    const a = S.actor(actorKey || 'daniel', { x: 280, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' });
    S.onResultFn = (ok) => { a.expr(ok ? 'smile' : 'worry'); if (ok) a.gesture('nod'); else a.gesture('shrug'); };
    return a;
  }
  /* demo mode: reveal each item near the end of its share of the timer, then move on */
  function autoplay(S, ctl, n, startAt, endAt) {
    const per = (endAt - startAt) / n;
    for (let i = 0; i < n; i++) {
      S.at(startAt + per * (i + 0.72), () => { if (S.mode === 'demo') { ctl.goto && ctl.goto(i, true); ctl.reveal(); } });
    }
    for (let i = 1; i < n; i++) S.at(startAt + per * i - 0.2, () => { if (S.mode === 'demo' && ctl.goto) ctl.goto(i, true); });
  }
  const tag = (S, text, kind) => C.caption(S, text, 1320, 142, { size: 24 });

  /* 5.1 · match advice to a situation */
  FE.seg({
    id: '5.1', ch: 5, title: 'Match advice to a situation', dur: 60, music: 'off', lead: 0.5, gate: true, timer: {}, revealAt: 52,
    lines: [['n1', 'Practice one. Match each advice to its problem. We are checking meaning.']],
    build(S) {
      stage5(S, 'office', 'maya');
      FE.act.match(S, { x: PX, y: PY, w: PW, label: 'Match advice with problem', pairs: [
        { advice: 'You should charge your phone.', icon: 'phone', situation: 'The battery is low before a long trip.', why: 'A charged phone helps on a long trip.' },
        { advice: 'She should check the calendar.', icon: 'calendar', situation: 'She forgot the meeting time.', why: 'The calendar has the time.' },
        { advice: 'We should take a taxi.', icon: 'car', situation: 'The station is far and we are late.', why: 'A taxi can save time.' },
        { advice: 'He shouldn\'t wait until midnight.', icon: 'sleep', situation: 'He has an early train tomorrow.', why: 'He needs sleep before an early train.' },
      ] });
      C.hintText(S, 'Find the problem that needs this action.');
      C.notes(S, ['Check meaning, not only grammar. Ask learners to explain each match.']);
    },
  });

  /* 5.2 · build a correct sentence */
  FE.seg({
    id: '5.2', ch: 5, title: 'Build a correct sentence', dur: 60, music: 'off', lead: 0.5, gate: true, timer: {},
    lines: [['n1', 'Practice two. Build the sentence. Some tiles are traps. We are checking grammar.']],
    build(S) {
      stage5(S, 'cowork', 'priya');
      const ctl = FE.act.build(S, { x: PX, y: PY, w: PW, label: 'Build a correct sentence', items: [
        { prompt: 'Advice: ask for help', bank: ['She:s', 'should:m', 'ask:v', 'for:o', 'help:o', 'asks:d', 'to:d'], answers: [['she', 'should', 'ask', 'for', 'help']], final: '{s|She} {m|should} {v|ask} for help.', why: 'Correct: subject, should, base verb.', diag: (t) => (t.includes('to') ? 'No to after should.' : t.includes('asks') ? 'Use the base verb. No s.' : null) },
        { prompt: 'Advice against: do not share it', bank: ['You:s', 'shouldn\'t:n', 'share:v', 'your:o', 'password:o', 'shares:d', 'don\'t:d'], answers: [['you', 'shouldn\'t', 'share', 'your', 'password']], final: '{s|You} {n|shouldn\'t} {v|share} your password.', why: 'Shouldn\'t recommends against sharing it.', diag: (t) => (t.includes('don\'t') ? 'Use shouldn\'t, not don\'t.' : t.includes('shares') ? 'Use the base verb. No s.' : null) },
      ] });
      autoplay(S, ctl, 2, S.seg.timerAt, S.seg.dur - 2);
      C.hintText(S, 'Subject first. Then should or shouldn\'t. Then the base verb.');
      C.notes(S, ['Two items. Tell the teacher which tile you choose; you tap.']);
    },
  });

  /* 5.3 · choose should or shouldn't from context */
  FE.seg({
    id: '5.3', ch: 5, title: 'Should or shouldn\'t?', dur: 60, music: 'off', lead: 0.5, gate: true, timer: {},
    lines: [['n1', 'Practice three. Read the situation. Choose should or shouldn\'t.']],
    build(S) {
      stage5(S, 'office', 'daniel');
      const mkv = (icon, t) => `<div style="display:flex;align-items:center;gap:14px;justify-content:center;margin:6px 0 10px">${FE.iconSVG(icon, 60)}<div style="font-size:30px;color:#ffd48a">${UB(t)}</div></div>`;
      const ctl = FE.act.choice(S, { x: PX, y: PY, w: PW, label: 'Choose the best word', cols: 2, optSize: 52, items: [
        { prompt: 'You ___ be late.', visual: mkv('clock', 'The meeting starts in five minutes.'), options: [{ t: '{m|should}', why: 'That would mean: be late. That is not useful here.' }, { t: '{n|shouldn\'t}', ok: true, why: 'Yes. Being late is not a good idea.' }], reveal: 'Shouldn\'t: recommends against being late.' },
        { prompt: 'You ___ save it.', visual: mkv('laptop', 'This file has your only copy.'), options: [{ t: '{m|should}', ok: true, why: 'Yes. Saving protects the only copy.' }, { t: '{n|shouldn\'t}', why: 'That would recommend against saving. It is not useful here.' }], reveal: 'Should: saving is useful.' },
        { prompt: 'You ___ share it.', visual: mkv('lock', 'This password is private.'), options: [{ t: '{m|should}', why: 'Sharing a private password is not a good idea.' }, { t: '{n|shouldn\'t}', ok: true, why: 'Yes. A private password is not for sharing.' }], reveal: 'Shouldn\'t: do not share it.' },
      ] });
      autoplay(S, ctl, 3, S.seg.timerAt, S.seg.dur - 2);
      C.hintText(S, 'Is the action useful, or not useful?');
      C.notes(S, ['The situation decides the answer. Ask learners to say the reason.']);
    },
  });

  /* 5.4 · repair five genuine learner errors */
  FE.seg({
    id: '5.4', ch: 5, title: 'Repair the mistake', dur: 150, music: 'off', lead: 0.5, gate: true, timer: {},
    lines: [['n1', 'Practice four. These sentences are incorrect. Find the mistake and repair it. We are checking grammar.']],
    build(S) {
      stage5(S, 'cafe', 'hana');
      const mk = (t, ok, why) => ({ t, ok, why });
      const ctl = FE.act.repair(S, { x: PX, y: PY, w: PW, label: 'Repair the incorrect sentence', items: [
        { bad: ['She', 'should', 'calls', 'him.'], good: ['She', 'should', 'call', 'him.'], edit: { del: [2], add: [2] }, options: [mk('She should call him.', true), mk('She shoulds call him.', false, 'Should never takes s.'), mk('She should called him.', false, 'After should, do not use the past form.')], why: 'After should, use the base verb: call. The verb does not take s.', spot: 'Look at the verb after should.' },
        { bad: ['You', 'should', 'to', 'ask.'], good: ['You', 'should', 'ask.'], edit: { del: [2], add: [] }, options: [mk('You should ask.', true), mk('You to should ask.', false, 'To does not belong in this pattern.'), mk('You should to asks.', false, 'Still has to and an s.')], why: 'Remove to. We say should plus the base verb: ask.', spot: 'Look for the extra word.' },
        { bad: ['He', 'doesn\'t', 'should', 'wait.'], good: ['He', 'shouldn\'t', 'wait.'], edit: { del: [1, 2], add: [1] }, options: [mk('He shouldn\'t wait.', true), mk('He doesn\'t should waits.', false, 'Still two helper words.'), mk('He not should wait.', false, 'Use shouldn\'t for the negative.')], why: 'Should already works as the helper. The negative is shouldn\'t. No doesn\'t.', spot: 'Two words are doing one job.' },
        { bad: ['Do', 'I', 'should', 'call?'], good: ['Should', 'I', 'call?'], edit: { del: [0, 1, 2, 3], add: [0, 1, 2] }, options: [mk('Should I call?', true), mk('Do I should to call?', false, 'Still has do and to.'), mk('I should call?', false, 'That is statement order. A yes or no question puts should before the subject: Should I call?')], why: 'Move should before the subject. Do not use do: Should I call?', spot: 'Look at the first word.' },
        { bad: ['What', 'I', 'should', 'do?'], good: ['What', 'should', 'I', 'do?'], edit: { del: [1, 2], add: [1, 2] }, options: [mk('What should I do?', true), mk('What do I should do?', false, 'Do not add do.'), mk('What I do should?', false, 'Should comes right after what.')], why: 'After the question word, put should before the subject: What should I do?', spot: 'Look at the order after What.' },
      ] });
      autoplay(S, ctl, 5, S.seg.timerAt, S.seg.dur - 2);
      C.hintText(S, 'Which word is extra, or which word is in the wrong place?');
      C.notes(S, ['Incorrect sentences stay red until repaired. Ask the class first.', 'Explain exactly what changed: base verb, no to, shouldn\'t, question order.']);
    },
  });

  /* 5.5 · build an advice question */
  FE.seg({
    id: '5.5', ch: 5, title: 'Build an advice question', dur: 60, music: 'off', lead: 0.5, gate: true, timer: {},
    lines: [['n1', 'Practice five. Build the question. Remember: should goes before the subject.']],
    build(S) {
      stage5(S, 'station', 'priya');
      const ctl = FE.act.build(S, { x: PX, y: PY, w: PW, label: 'Build an advice question', items: [
        { prompt: 'Ask: Priya wants to know about calling her sister.', bank: ['Should:m', 'I:s', 'call:v', 'her?:o', 'Do:d', 'to:d'], answers: [['should', 'i', 'call', 'her?']], final: '{m|Should} {s|I} {v|call} her?', why: 'Should, subject, base verb.', diag: (t) => (t.includes('do') ? 'Do not use do with should.' : t[0] !== 'should' ? 'Start with should.' : null) },
        { prompt: 'Ask: you do not know the next step.', bank: ['What:q', 'should:m', 'I:s', 'do:v', 'does:d'], answers: [['what', 'should', 'i', 'do?'.replace('?', '')]], final: '{q|What} {m|should} {s|I} {v|do}?', why: 'Question word, should, subject, base verb.', diag: (t) => (t.includes('does') ? 'Do not add does.' : null) },
        { prompt: 'Ask about time: you are leaving together.', bank: ['When:q', 'should:m', 'we:s', 'leave:v', 'do:d'], answers: [['when', 'should', 'we', 'leave']], final: '{q|When} {m|should} {s|we} {v|leave}?', why: 'Question word, should, subject, base verb.', diag: (t) => (t.includes('do') ? 'Do not add do.' : null) },
      ] });
      autoplay(S, ctl, 3, S.seg.timerAt, S.seg.dur - 2);
      C.hintText(S, 'Start with should, or with a question word.');
      C.notes(S, ['Check punctuation: question marks at the end.']);
    },
  });

  /* 5.6 · select an appropriate short answer */
  FE.seg({
    id: '5.6', ch: 5, title: 'Choose the short answer', dur: 55, music: 'off', lead: 0.5, gate: true, timer: {},
    lines: [['n1', 'Practice six. Choose the short answer that matches the question.']],
    build(S) {
      stage5(S, 'station', 'marcus');
      const q = (t, ctx) => `<div class="paper card" style="position:relative;margin:4px 0 10px;text-align:center;font-size:46px;padding:10px 22px 14px">${UB(t)}<div style="font-size:26px;color:#4f5d7d;margin-top:2px">${UB(ctx)}</div></div>`;
      const ctl = FE.act.choice(S, { x: PX, y: PY, w: PW, label: 'Choose the short answer', cols: 1, optSize: 44, items: [
        { prompt: 'Priya asks Marcus. He thinks she should call.', visual: q('Should I call her?', 'Marcus says yes.'), options: [{ t: 'Yes, you should.', ok: true, why: 'Yes. I changes to you, and should comes back.' }, { t: 'Yes, I should.', why: 'Marcus answers Priya. Use you, not I.' }, { t: 'Yes, you do.', why: 'Use should in the answer: Yes, you should.' }], reveal: 'Yes, you should.' },
        { prompt: 'The taxi is not here yet.', visual: q('Should we leave now?', 'The answer is no.'), options: [{ t: 'No, we don\'t.', why: 'Use shouldn\'t in the answer.' }, { t: 'No, they shouldn\'t.', why: 'The question is about we. Use we.' }, { t: 'No, we shouldn\'t.', ok: true, why: 'Yes. We stays we, and shouldn\'t is the negative.' }], reveal: 'No, we shouldn\'t.' },
      ] });
      autoplay(S, ctl, 2, S.seg.timerAt, S.seg.dur - 2);
      C.hintText(S, 'Who is speaking? Who is the answer about?');
      C.notes(S, ['Say the whole exchange aloud. Pronouns match the speaker.']);
    },
  });

  /* 5.7 · add a useful reason */
  FE.seg({
    id: '5.7', ch: 5, title: 'Add a useful reason', dur: 55, music: 'off', lead: 0.5, gate: true, timer: {},
    lines: [['n1', 'Practice seven. Add a useful reason. A reason starts with because.']],
    build(S) {
      stage5(S, 'cowork', 'priya');
      const ctl = FE.act.choice(S, { x: PX, y: PY, w: PW, label: 'Add a reason', cols: 1, optSize: 40, items: [
        { prompt: 'You should call her, ___', options: [{ t: 'because she needs an answer.', ok: true, why: 'A good reason: it explains why calling is useful.' }, { t: 'because the blue phone.', why: 'This is not a reason. It does not explain the advice.' }, { t: 'because call her.', why: 'After because, we need a full idea.' }], reveal: 'Because she needs an answer.' },
        { prompt: 'You shouldn\'t send the file yet, ___ (choose all useful reasons)', multi: true, options: [{ t: 'because it still has mistakes.', ok: true }, { t: 'because Daniel has not checked the numbers.', ok: true }, { t: 'because blue is a nice color.', ok: false }, { t: 'because the file is on the desk.', ok: false }], good: 'Yes. Both reasons explain why waiting is useful.', partial: 'Two reasons explain the advice. The others do not.', reveal: 'Useful reasons explain the advice.' },
      ] });
      autoplay(S, ctl, 2, S.seg.timerAt, S.seg.dur - 2);
      C.hintText(S, 'Does the reason explain why the advice helps?');
      C.notes(S, ['A good reason explains the benefit or the risk.']);
    },
  });

  /* 5.8 · grammar versus usefulness */
  FE.seg({
    id: '5.8', ch: 5, title: 'Grammar and usefulness', dur: 30, music: 'calm', lead: 0.6,
    lines: [
      ['n1', 'Two different questions. Is the sentence grammatical? And is the advice useful in this situation?', { gap: 0.4 }],
      ['n2', 'You should ignore the meeting: the grammar is correct, but the advice is not helpful.', { gap: 3.4 }],
      ['n3', 'You should to call her: the idea may be fine, but the grammar needs repair.', { gap: 3.0 }],
    ],
    build(S) {
      S.env('office', { monitor: false, lamp: false }); C.dim(S, 0.55);
      const maya = S.actor('maya', { x: 280, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' });
      const card = (sent, g, u, x, y) => `<div style="display:flex;align-items:center;gap:20px"><div style="flex:1;font-size:44px;text-align:left">${UB(sent)}</div><div style="width:190px;text-align:center;font-size:26px"><div>${UB('grammar')} <b style="color:${g ? '#55dc95' : '#ff8a9b'};font-size:38px">${g ? '&#10003;' : '&#10007;'}</b></div><div>${UB('useful')} <b style="color:${u ? '#55dc95' : '#ff8a9b'};font-size:38px">${u ? '&#10003;' : '&#10007;'}</b></div></div></div>`;
      const c1 = S.ui(card('You should call her.', true, true), 'panel anim', { left: '560px', top: '230px', width: '1300px', zIndex: 14 });
      const c2 = S.ui(card('You should ignore the meeting.', true, false), 'panel anim', { left: '560px', top: '410px', width: '1300px', zIndex: 14 });
      const c3 = S.ui(card('You should to call her.', false, true), 'panel anim', { left: '560px', top: '590px', width: '1300px', zIndex: 14 });
      S.at('n1>-1.2', () => S.in(c1)); S.at('n2', () => { S.in(c2); maya.expr('worry'); }); S.at('n3', () => { S.in(c3); maya.expr('think'); });
      C.notes(S, ['Always say which dimension you are checking: grammar or usefulness.']);
    },
  });

  /* 5.9 · identify ALL reasonable recommendations */
  FE.seg({
    id: '5.9', ch: 5, title: 'Find all the reasonable ideas', dur: 70, music: 'off', lead: 0.5, gate: true, timer: {}, revealAt: 62,
    lines: [['n1', 'Practice eight. Daniel has a meeting in ten minutes, but his slides are not ready. Choose all the reasonable recommendations. We are checking usefulness.']],
    build(S) {
      stage5(S, 'office', 'daniel');
      FE.act.choice(S, { x: PX, y: PY, w: PW, label: 'Choose all the reasonable ideas', cols: 1, optSize: 34, gap: 8, items: [
        { multi: true, prompt: '', options: [
          { t: 'He should ask for five more minutes.', ok: true }, { t: 'He should send a short message to the team.', ok: true }, { t: 'He should finish the most important slide first.', ok: true },
          { t: 'He should ignore the meeting.', ok: false }, { t: 'He should delete all the slides.', ok: false }, { t: 'He should take a very long break.', ok: false } ],
          good: 'Yes. Many ideas are reasonable. Other ideas can also work.', partial: 'Look at the green outlines. Other reasonable ideas are possible too.', reveal: 'Several ideas are reasonable. Accept other sensible ideas.' },
      ] });
      C.hintText(S, 'Which ideas help him with the problem?');
      C.notes(S, ['Accept any other sensible idea from learners, such as asking a coworker to help.', 'This task checks usefulness. All grammar here is correct.']);
    },
  });
})(window);
