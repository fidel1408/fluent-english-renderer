/* Chapter 7 · 54:00–60:00 · Review, roleplay feedback, and exit check */
(function (g) {
  'use strict';
  const FE = g.FE, { U, UB } = FE, C = FE.C;

  /* 7.1 · connected visual summary */
  FE.seg({
    id: '7.1', ch: 7, title: 'Everything connects', dur: 90, music: 'warm', lead: 0.8,
    lines: [
      ['n1', 'Let us connect everything.'],
      ['n2', 'Advice is a recommendation. It is a useful idea, not a guarantee, and not automatically a rule.', { gap: 0.9 }],
      ['n3', 'For affirmative advice: subject, should, base verb.', { gap: 3.4 }],
      ['n4', 'For negative advice: subject, shouldn\'t, base verb. It recommends against an action.', { gap: 3.4 }],
      ['n5', 'In a direct question, the modal moves before the subject. No do, no does, no did.', { gap: 3.4 }],
      ['n6', 'Short answers match the speaker and the subject: Yes, you should. No, we shouldn\'t.', { gap: 3.4 }],
      ['n7', 'And helpful advice considers the person\'s situation, and often includes a reason.', { gap: 3.4 }],
      ['n8', 'Ask. Recommend. Explain why.', { gap: 2.5 }],
      ['n9', 'Choose one box. Say a new example sentence for it.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.78);
      const cards = [
        ['bulb', 'Advice is a recommendation', '{s|You} {m|should} rest.', 'not a guarantee'],
        ['check', 'Should + base verb', '{s|She} {m|should} {v|ask} for help.', ''],
        ['cross', 'Shouldn\'t + base verb', '{s|He} {n|shouldn\'t} {v|wait}.', ''],
        ['ask', 'Modal before the subject', '{m|Should} {s|I} {v|call} her?', ''],
        ['chat', 'Short answers match', 'Yes, {s|you} {m|should}.', ''],
        ['star', 'Context and a reason', 'You should leave now, {r|because} the road is busy.', ''],
      ];
      const pos = [[60, 170], [690, 170], [1320, 170], [60, 560], [690, 560], [1320, 560]];
      const els = cards.map((c, i) => S.ui(`<div style="display:flex;align-items:center;gap:14px">${FE.iconSVG(c[0], 70)}<div style="font-size:34px;text-align:left;flex:1">${UB(c[1])}</div></div><div style="margin-top:14px;font-size:38px;text-align:center">${U(c[2])}</div>${c[3] ? `<div style="font-size:26px;color:#ffd48a;text-align:center">${UB(c[3])}</div>` : ''}`, 'panel anim', { left: pos[i][0] + 'px', top: pos[i][1] + 'px', width: '560px', height: '330px', zIndex: 14, padding: '18px 20px' }));
      const arrows = S.svg('<g fill="none" stroke="#ffb540" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 16" opacity=".9"><path d="M626 335H684"/><path d="M1256 335H1314"/><path d="M1600 506C1600 540 340 520 340 556" /><path d="M626 725H684"/><path d="M1256 725H1314"/></g>', 'anim');
      ['n2', 'n3', 'n4', 'n5', 'n6', 'n7'].forEach((k, i) => S.at(k, () => { S.in(els[i]); S.sfx('pop'); if (i === 5) S.in(arrows, 0.4); }));
      S.at('n2>', () => S.in(arrows));
      C.think(S, 'n9>+0.2', 16, 880, 905, 'Say it');
      C.notes(S, ['Point to each card as the narration moves. Ask learners to give a new example for each.']);
    },
  });

  /* 7.2 · roleplay feedback (teacher-led, no scores) */
  FE.seg({
    id: '7.2', ch: 7, title: 'Roleplay feedback', dur: 60, music: 'off', lead: 0.6, gate: true, timer: {},
    lines: [['n1', 'Feedback time. Think about the roleplays. Teacher, share one good example you heard, and one thing to improve. Use the checklist if it helps.']],
    build(S) {
      S.env('cafe'); C.dim(S, 0.68, 'linear-gradient(90deg,rgba(6,9,18,.2),rgba(6,9,18,.6) 40%,rgba(6,9,18,.85))');
      const a = S.actor('hana', { x: 230, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'smile' });
      const b = S.actor('marcus', { x: 640, y: 795, scale: 1.0, facing: -0.4, arms: ['rest', 'rest'], expr: 'smile' });
      const checks = ['A clear question for advice', 'Should or shouldn\'t with a base verb', 'A reason with because', 'Listening to new information'];
      const P = S.ui(`<div class="lab">${UB('What did you hear?')}</div>` + checks.map((t) => `<label style="display:flex;align-items:center;gap:14px;margin:8px 0;font-size:36px"><input type="checkbox" style="width:34px;height:34px;accent-color:#ffb540"><span>${UB(t)}</span></label>`).join('') + `<div style="margin-top:12px;font-size:28px;color:#ffd48a">${UB('One good example. One thing to improve.')}</div><div style="font-size:24px;color:#bfcbea;margin-top:4px">${UB('This checklist does not score anyone.')}</div>`, 'panel', { left: '860px', top: '180px', width: '1010px', zIndex: 14 });
      C.hintText(S, 'Praise one clear sentence first.');
      C.notes(S, ['No automatic scores. You decide what you heard.', 'Correct only one or two patterns. Keep feedback supportive.']);
    },
  });

  /* 7.3 · exit check 1 — repair */
  FE.seg({
    id: '7.3', ch: 7, title: 'Exit check one: repair', dur: 55, music: 'off', lead: 0.5, gate: true, timer: {}, revealAt: 47,
    lines: [['n1', 'Exit check, part one. This sentence is incorrect. Choose the repair.']],
    build(S) {
      S.env('office', { monitor: false, lamp: false }); C.dim(S, 0.68);
      const a = S.actor('maya', { x: 280, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' });
      S.onResultFn = (ok) => { a.expr(ok ? 'smile' : 'worry'); };
      FE.act.repair(S, { x: 520, y: 190, w: 1360, label: 'Exit check one of three', items: [
        { bad: ['They', 'should', 'leaves', 'earlier.'], good: ['They', 'should', 'leave', 'earlier.'], edit: { del: [2], add: [2] }, options: [{ t: 'They should leave earlier.', ok: true }, { t: 'They shoulds leave earlier.', ok: false, why: 'Should never takes s.' }, { t: 'They should to leave earlier.', ok: false, why: 'No to after should.' }], why: 'After should, use the base verb: leave. No s on the verb.', spot: 'Look at the verb after should.' },
      ] });
      C.hintText(S, 'What form of the verb follows should?');
      C.notes(S, ['Item one is a single-answer grammar repair. Checking: grammar.']);
    },
  });

  /* 7.4 · exit check 2 — ask for advice (open) */
  FE.seg({
    id: '7.4', ch: 7, title: 'Exit check two: ask', dur: 55, music: 'off', lead: 0.5, gate: true, timer: {}, revealAt: 47,
    lines: [['n1', 'Exit check, part two. Ask for advice in a new situation. Say it aloud or type it in chat. Many questions are possible.']],
    build(S) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.7);
      S.actor('priya', { x: 280, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'worry' });
      FE.act.open(S, { x: 520, y: 190, w: 1360, label: 'Exit check two of three', prompt: 'Your laptop is very slow before an online class. Ask a friend for advice.',
        visual: `<div style="display:flex;justify-content:center;margin:2px 0">${FE.iconSVG('laptop', 120)}</div>`,
        support: ['What should I do?', 'Should I …?', 'Who should I ask?'], models: ['What should I do?', 'Should I restart it?', 'Who should I ask?', 'When should I call the school?'], modelNote: 'Other questions can also be correct.',
        checks: ['should or shouldn\'t is first or after a question word', 'a base verb follows the subject', 'the situation is clear'], typed: true });
      C.notes(S, ['Open task. Accept any grammatical question that fits the situation.', 'The form checker is optional: type a learner sentence to check form only.']);
    },
  });

  /* 7.5 · exit check 3 — give a recommendation and a reason (open) */
  FE.seg({
    id: '7.5', ch: 7, title: 'Exit check three: recommend', dur: 55, music: 'off', lead: 0.5, gate: true, timer: {}, revealAt: 47,
    lines: [['n1', 'Exit check, part three. Your friend has too many emails and feels stressed. Give your own recommendation, and explain why.']],
    build(S) {
      S.env('office', { monitor: false, lamp: false }); C.dim(S, 0.7);
      S.actor('daniel', { x: 280, y: 790, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'stress' });
      FE.act.open(S, { x: 520, y: 190, w: 1360, label: 'Exit check three of three', prompt: 'Give a recommendation and a reason.',
        visual: `<div style="display:flex;justify-content:center;gap:24px;margin:2px 0">${FE.iconSVG('chat', 110)}${FE.iconSVG('bell', 110)}</div>`,
        support: ['You should …', 'You shouldn\'t …', 'I think you should …', '… because …'], models: ['You should answer the urgent emails first, because they are important.', 'I think you should take a short break, because you are tired.', 'You shouldn\'t read every email now, because you need time to think.'], modelNote: 'Many original answers are reasonable.',
        checks: ['should or shouldn\'t with a base verb', 'the idea helps this person', 'a reason with because'], typed: true });
      C.notes(S, ['Open task. Accept any grammatical, sensible recommendation with a reason.', 'You judge the answers. The tool does not score speech or writing.']);
    },
  });

  /* 7.6 · feedback on the exit check */
  FE.seg({
    id: '7.6', ch: 7, title: 'Feedback on the exit check', dur: 25, music: 'calm', lead: 0.6,
    lines: [
      ['n1', 'Here is the feedback. Part one has one correct repair. Parts two and three can have many good answers. Check form, and check usefulness.', { gap: 0.4 }],
    ],
    build(S) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.75);
      const rows = [['They should leave earlier.', 'one correct repair', 'grammar'], ['What should I do?', 'many good questions', 'form and meaning'], ['You should rest, because you are tired.', 'many good answers', 'form, usefulness, reason']];
      rows.forEach((r, i) => { const el = S.ui(`<div style="display:flex;align-items:center;gap:20px"><div style="flex:1;font-size:44px;text-align:left">${UB(r[0])}</div><div style="width:360px;font-size:28px;color:#ffd48a;text-align:center">${UB(r[1])}</div><div style="width:300px;font-size:26px;text-align:center">${UB(r[2])}</div></div>`, 'panel anim', { left: '120px', top: 200 + i * 190 + 'px', width: '1680px', zIndex: 14 }); S.at(3 + i * 4, () => S.in(el)); });
      C.notes(S, ['Give feedback on form first, then on usefulness. No scores are produced by this tool.']);
    },
  });

  /* 7.7 · concise visual conclusion */
  FE.seg({
    id: '7.7', ch: 7, title: 'Well done', dur: 20, music: 'warm', lead: 0.8,
    lines: [['n1', 'Well done. You can ask for advice, give a recommendation, and explain why.'], ['n2', 'Say one sentence you will use this week.', { gap: 1.5 }]],
    build(S) {
      S.env('office', { monitor: false, mood: 'gold' });
      const maya = S.actor('maya', { x: 520, y: 700, scale: 1.25, facing: 0.2, arms: ['rest', 'rest'], expr: 'confident' });
      const dan = S.actor('daniel', { x: 1250, y: 715, scale: 1.2, facing: -0.3, arms: ['rest', 'rest'], expr: 'smile' });
      const t = S.ui(UB('Ask. Recommend. Explain why.'), 'panel anim', { left: '360px', top: '300px', width: '1200px', fontSize: '84px', textAlign: 'center', zIndex: 14, padding: '20px 30px 30px' });
      S.at(2.0, () => { S.in(t); maya.expr('smile'); dan.expr('grin'); maya.arm('R', 'heart'); S.sfx('ok'); });
      C.think(S, 'n2>+0.2', 7, 880, 700, 'Say it');
      C.notes(S, ['End warmly. Ask learners to say one sentence they will use this week.']);
    },
  });
})(window);
