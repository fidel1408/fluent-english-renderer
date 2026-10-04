/* Chapter 3 · 13:00–21:00 · Build affirmative and negative forms */
(function (g) {
  'use strict';
  const FE = g.FE, { U, UB } = FE, C = FE.C;

  function bigLine(S, html, y, o) {
    o = o || {};
    return S.ui(html, 'panel anim', { left: (o.x || 640) + 'px', top: y + 'px', width: (o.w || 1220) + 'px', textAlign: 'center', fontSize: (o.size || 70) + 'px', zIndex: 14, padding: '14px 24px 22px' });
  }
  function guide(S, key, x, expr) {
    S.env(key || 'office', { monitor: false, laptop: false, lamp: false });
    C.dim(S, 0.55);
  }

  /* 3.1 · the pattern, built from movable units */
  FE.seg({
    id: '3.1', ch: 3, title: 'The advice pattern', dur: 70, music: 'calm', lead: 0.8,
    lines: [
      ['n1', 'Let us build advice. We need three pieces.'],
      ['n2', 'First, a subject. Who is the advice for? You, she, we, they.', { gap: 1.0 }],
      ['n3', 'Second, the advice word: should.', { gap: 2.2 }],
      ['n4', 'Third, the base verb. This is the simple verb: check, call, ask, save.', { gap: 2.2 }],
      ['n5', 'Add the rest of the idea, and you have advice.', { gap: 1.8 }],
      ['n6', 'Subject, plus should, plus base verb.', { gap: 1.6 }],
      ['n7', 'Say it with me: You should check the address.', { gap: 1.4 }],
      ['n8', 'Your turn. Make your own sentence: a subject, should, and a base verb.', { gap: 1.0 }],
      ['n9', 'For example: We should leave earlier. Share it with a partner.', { gap: 13 }],
    ],
    build(S, L) {
      guide(S, 'office');
      const pri = S.actor('priya', { x: 300, y: 770, scale: 1.05, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' });
      const ch = FE.act.chips(S, { x: 1240, y: 190, center: true, size: 62, items: [{ t: 'You', role: 's', label: 'subject' }, { plus: true }, { t: 'should', role: 'm', label: 'advice word' }, { plus: true }, { t: 'check', role: 'v', label: 'base verb' }] });
      const sent = bigLine(S, UB('{s|You} {m|should} {v|check} {o|the address}.'), 560, {});
      const ex = C.caption(S, 'Example', 640, 490, { size: 26 });
      S.at('n2>+0.2', () => { S.in(ch.els[0]); S.sfx('pop'); });
      S.at('n3>+0.1', () => { S.in(ch.els[1]); S.in(ch.els[2]); S.sfx('pop'); });
      S.at('n4>+0.1', () => { S.in(ch.els[3]); S.in(ch.els[4]); S.sfx('pop'); });
      S.at('n5', () => { S.in(ex); S.in(sent); pri.expr('smile'); });
      S.at('n6', () => { ch.els.forEach((e) => { e.style.transition = e.style.transition; }); S.sfx('ok'); });
      S.at('n7', () => { pri.arm('R', 'talk'); pri.expr('confident'); });
      const pin = C.prop(S, 'pin', 330, 380, 1.5, {});
      S.at('n5', () => S.in(pin));
      C.think(S, 'n8>+0.2', 12, 470, 250, 'Say it');
      C.notes(S, ['Say each piece. Learners repeat: subject, should, base verb.', 'The plus signs show the pieces. The sentence can continue after the verb.']);
    },
  });

  /* 3.2 · should never changes */
  FE.seg({
    id: '3.2', ch: 3, title: 'Should never changes', dur: 60, music: 'calm', lead: 0.6,
    lines: [
      ['n1', 'Now watch the word should. Change the subject, and look.'],
      ['s1', 'I should call.', { gap: 0.9 }], ['s2', 'You should call.', { gap: 0.8 }], ['s3', 'He should call.', { gap: 0.8 }],
      ['s4', 'She should call.', { gap: 0.8 }], ['s5', 'We should call.', { gap: 0.8 }], ['s6', 'They should call.', { gap: 0.8 }],
      ['n2', 'Should stays the same. The verb stays the same too. No s, no ending.', { gap: 1.0 }],
      ['n3', 'Tap a subject and try it yourself.', { gap: 0.8 }],
      ['n4', 'Say each sentence aloud with a partner. Change the subject each time.', { gap: 0.8 }],
    ],
    build(S, L) {
      guide(S, 'cowork');
      const mar = S.actor('marcus', { x: 300, y: 770, scale: 1.05, facing: 0.4, arms: ['rest', 'rest'], expr: 'listen' });
      const subs = ['I', 'You', 'He', 'She', 'We', 'They'];
      const row = S.ui('', 'tray', { position: 'absolute', left: '620px', top: '200px', width: '1260px', zIndex: 14 });
      const sent = bigLine(S, '', 440, { size: 84 });
      const lock = S.ui(`<div style="display:flex;align-items:center;gap:14px">${FE.iconSVG('lock', 64)}<div style="font-size:34px">${UB('does not change')}</div></div>`, 'panel anim', { left: '860px', top: '690px', width: '700px', zIndex: 14 });
      const btns = subs.map((p, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tile t-s'; b.style.fontSize = '56px'; b.innerHTML = '<span class="tile-in">' + U('{s|' + p + '}') + '</span>';
        b.onclick = () => set(i); row.appendChild(b); return b;
      });
      function set(i) {
        btns.forEach((b, k) => { b.style.outline = k === i ? '5px solid #ffb540' : ''; });
        sent.innerHTML = UB('{s|' + subs[i] + '} {m|should} {v|call}.'); sent.classList.add('on'); S.sfx('click');
        sent.querySelectorAll('.r-m').forEach((u) => { u.classList.add('hot'); });
      }
      sent.classList.add('anim', 'on'); sent.innerHTML = UB('{s|You} {m|should} {v|call}.');
      subs.forEach((p, i) => S.at('s' + (i + 1), () => { set(i); if (i === 5) mar.expr('smile'); }));
      S.at('n2', () => { S.in(lock); mar.arm('R', 'talk'); });
      S.at('n3', () => { mar.arm('R', 'rest'); });
      C.think(S, 'n4>+0.2', 18, 1640, 700, 'Pair talk');
      C.notes(S, ['Learners can say the sentence with each subject.', 'Ask: Which word changes? The subject changes. Should and call do not.']);
    },
  });

  /* 3.3 · common incorrect additions vanish */
  FE.seg({
    id: '3.3', ch: 3, title: 'Three extra words to remove', dur: 60, music: 'calm', lead: 0.6,
    lines: [
      ['n1', 'Many learners add extra words. Let us remove them.'],
      ['n2', 'First, no s. After should, use the base verb. Not calls.', { gap: 1.2 }],
      ['n3', 'Second, no to. After should, do not say to.', { gap: 3.0 }],
      ['n4', 'Third, no does or doesn\'t. Should already works as the helper. The negative is shouldn\'t.', { gap: 3.0 }],
      ['n5', 'So remember four things. Base verb. No s. No to. No do, does, or did.', { gap: 3.0 }],
      ['n6', 'Your turn. Fix this sentence aloud: She should goes home.', { gap: 1.0 }],
      ['n7', 'The answer: She should go home. Base verb, no s.', { gap: 9 }],
    ],
    build(S, L) {
      guide(S, 'office');
      const han = S.actor('hana', { x: 300, y: 770, scale: 1.05, facing: 0.4, arms: ['rest', 'rest'], expr: 'listen' });
      const rows = [
        ['She should {x|calls} him.', 'She should call him.', 'extra s', 'n2'],
        ['You should {x|to} ask.', 'You should ask.', 'extra to', 'n3'],
        ['He {x|doesn\'t} should wait.', 'He shouldn\'t wait.', 'extra doesn\'t', 'n4'],
      ];
      rows.forEach((r, i) => {
        const wrap = S.ui(`<div style="display:flex;align-items:center;gap:20px"><div class="bd" style="width:64px;font-size:44px;color:#ff8a9b;font-weight:800">&#10007;</div><div class="ln" style="flex:1;text-align:left;font-size:58px">${UB(r[0])}</div><div style="font-size:26px;color:#ffd48a;width:210px;text-align:center">${UB(r[2])}</div></div>`, 'panel anim', { left: '600px', top: 190 + i * 190 + 'px', width: '1290px', zIndex: 14, padding: '14px 26px 18px' });
        S.at(r[3], () => { S.in(wrap); });
        S.at(r[3] + '>+1.6', () => {
          const ln = wrap.querySelector('.ln'); const xs = ln.querySelectorAll('.r-x'); xs.forEach((u) => u.classList.add('gone')); S.sfx('swipe');
          S.later(() => { ln.innerHTML = UB(r[1]); wrap.querySelector('.bd').innerHTML = '&#10003;'; wrap.querySelector('.bd').style.color = '#55dc95'; S.sfx('ok'); }, S.fast ? 0 : 700);
          if (S.fast) { ln.innerHTML = UB(r[1]); wrap.querySelector('.bd').innerHTML = '&#10003;'; wrap.querySelector('.bd').style.color = '#55dc95'; }
        });
      });
      const sum = S.ui(['base verb', 'no s', 'no to', 'no do, does, did'].map((t) => `<span class="paper card" style="position:relative;display:inline-block;margin:6px;padding:8px 18px 10px;font-size:34px;border-radius:18px">${UB(t)}</span>`).join(''), 'anim', { position: 'absolute', left: '600px', top: '770px', width: '1290px', textAlign: 'center', zIndex: 14 });
      S.at('n5', () => { S.in(sum); han.expr('confident'); });
      const fixme = S.ui(`<div style="display:flex;align-items:center;gap:20px"><div class="bd2" style="font-size:44px;color:#ff8a9b;font-weight:800">&#10007;</div><div class="ln2" style="font-size:54px">${UB('She should {x|goes} home.')}</div></div>`, 'panel anim', { left: '600px', top: '890px', width: '1290px', zIndex: 14, padding: '8px 26px 12px' });
      S.at('n6', () => S.in(fixme));
      S.at('n7', () => { fixme.querySelector('.ln2').innerHTML = UB('She should {g|go} home.'); const b = fixme.querySelector('.bd2'); b.innerHTML = '&#10003;'; b.style.color = '#55dc95'; S.sfx('ok'); });
      C.think(S, 'n6>+0.2', 8, 380, 260, 'Think');
      C.notes(S, ['The wavy red word is the extra word. Ask learners to predict what disappears.', 'Do not add questions here. Questions come in the next chapter.']);
    },
  });

  /* 3.4 · be */
  FE.seg({
    id: '3.4', ch: 3, title: 'Should with be', dur: 40, music: 'calm', lead: 0.6,
    lines: [
      ['n1', 'The verb be also works. Keep be after should.'],
      ['p1', 'You should be on time.', { who: 'priya', gap: 1.0 }],
      ['n2', 'Not: you should are. Not: you should is. Just be.', { gap: 0.7 }],
      ['p2', 'You shouldn\'t be rude.', { who: 'priya', gap: 1.0 }],
      ['n3', 'Good advice can be positive or negative.', { gap: 1.0 }],
      ['n4', 'Your turn. Make a sentence with be. What should a good coworker be?', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('office', { monitor: false }); C.dim(S, 0.35);
      const pri = S.actor('priya', { x: 430, y: 735, scale: 1.2, facing: 0.35, arms: ['rest', 'rest'], expr: 'neutral' });
      const dan = S.actor('daniel', { x: 1480, y: 745, scale: 1.2, facing: -0.35, arms: ['rest', 'rest'], expr: 'listen' });
      const c1 = S.ui(`<div style="display:flex;align-items:center;gap:14px">${FE.iconSVG('clock', 92)}<div style="font-size:30px">${UB('{s|You} {m|should} {v|be} on time.')}</div></div>`, 'panel anim', { left: '690px', top: '560px', width: '540px', zIndex: 14 });
      const c2 = S.ui(`<div style="display:flex;align-items:center;gap:14px">${FE.iconSVG('megaphone', 92)}<div style="font-size:30px">${UB('{s|You} {n|shouldn\'t} {v|be} rude.')}</div></div>`, 'panel anim', { left: '1250px', top: '560px', width: '600px', zIndex: 14 });
      C.say(S, 'p1', pri, 0, 0, { x: 760, y: 280, side: 'right', w: 520 });
      C.say(S, 'p2', pri, 0, 0, { x: 760, y: 280, side: 'right', w: 520 });
      S.at('p1', () => { pri.arm('R', 'talk'); S.in(c1); dan.expr('smile'); });
      S.at('n2', () => { pri.arm('R', 'rest'); });
      S.at('p2', () => { pri.arm('R', 'point'); S.in(c2); dan.expr('worry'); });
      S.at('n3', () => { pri.arm('R', 'rest'); dan.expr('relief'); });
      C.think(S, 'n4>+0.2', 12, 900, 730, 'Think');
      C.notes(S, ['Be stays be: should be, shouldn\'t be.']);
    },
  });

  /* 3.5 · scene matching */
  FE.seg({
    id: '3.5', ch: 3, title: 'Match advice to a scene', dur: 70, music: 'off', lead: 0.6, gate: true, timer: {}, revealAt: 62,
    lines: [['n1', 'Match each advice sentence to the best situation. Tap an advice sentence, then tap a scene.']],
    build(S, L) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.62);
      const dan = S.actor('daniel', { x: 280, y: 780, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' });
      S.onResultFn = (ok) => { dan.expr(ok ? 'smile' : 'worry'); if (ok) dan.gesture('nod'); };
      FE.act.match(S, {
        x: 520, y: 190, w: 1360, label: 'Match the advice with the situation',
        pairs: [
          { advice: 'You should check the address.', icon: 'pin', situation: 'The driver cannot find the house.', why: 'The address is the missing information.' },
          { advice: 'She should ask for help.', icon: 'chat', situation: 'She cannot solve the problem alone.', why: 'Help is the useful next step.' },
          { advice: 'We should leave earlier.', icon: 'clock', situation: 'The road is busy and the train is soon.', why: 'More time helps when the road is busy.' },
          { advice: 'You should save your work.', icon: 'laptop', situation: 'The battery is almost empty.', why: 'Saving protects your work.' },
        ],
      });
      C.hintText(S, 'Read the problem first. What is missing?');
      C.notes(S, ['Learners say the match aloud. Accept alternatives if they can explain.', 'Ask: Why does this advice fit?']);
    },
  });

  /* 3.6 · should / shouldn't in one situation */
  FE.seg({
    id: '3.6', ch: 3, title: 'Should and shouldn\'t', dur: 70, music: 'calm', lead: 0.8,
    lines: [
      ['n1', 'Daniel has an important file open. His laptop battery is low.'],
      ['m1', 'You should save your work.', { who: 'marcus', gap: 1.0 }],
      ['n2', 'That is positive advice. Save is a useful action.', { gap: 1.0 }],
      ['m2', 'And you shouldn\'t close the file yet.', { who: 'marcus', gap: 1.4 }],
      ['n3', 'That is negative advice. It recommends against one action. Closing the file now is not a helpful path.', { gap: 1.2 }],
      ['n4', 'The full form is should not. The short form is shouldn\'t. Both are correct. In speech, we usually say shouldn\'t.', { gap: 1.4 }],
      ['n5', 'Shouldn\'t is not a strict rule like mustn\'t. It means: this is not a good idea.', { gap: 1.0 }],
      ['n6', 'Your turn. Tell a partner one thing you should do, and one thing you shouldn\'t do, before an important meeting.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('office', { monitor: false }); C.dim(S, 0.3);
      const dan = S.actor('daniel', { x: 400, y: 735, scale: 1.2, facing: 0.35, arms: ['type', 'type'], expr: 'worry' });
      const mar = S.actor('marcus', { x: 1500, y: 745, scale: 1.2, facing: -0.4, arms: ['rest', 'rest'], expr: 'listen' });
      const f = FE.act.fork(S, { x: 620, y: 380, w: 700, h: 420, problem: { icon: 'laptop', label: 'battery is low' }, options: [{ icon: 'check', label: 'save the file' }, { icon: 'cross', label: 'close the file now' }], nodeX: 80, cardX: 260, size: 32 });
      S.at('n1>-1.2', () => f.showProblem());
      S.at('n1>-0.6', () => f.showOptions(0.4));
      C.say(S, 'm1', mar, 0, 0, { x: 1130, y: 250, side: 'left', w: 640 });
      C.say(S, 'm2', mar, 0, 0, { x: 1130, y: 250, side: 'left', w: 700 });
      S.at('m1', () => { mar.arm('R', 'talk'); mar.expr('confident'); });
      S.at('n2', () => { f.mark(0, 'advice'); dan.expr('relief'); dan.arm('R', 'point'); mar.arm('R', 'rest'); });
      S.at('m2', () => { mar.arm('R', 'point'); dan.arm('R', 'type'); dan.expr('think'); });
      S.at('n3', () => { f.mark(1, 'avoid'); mar.arm('R', 'rest'); });
      const merge = S.ui(`<div style="display:flex;align-items:center;gap:16px;font-size:54px">${UB('should')}${UB('+')}${UB('not')}<span style="font-size:60px">&#8594;</span>${UB('{n|shouldn\'t}')}</div>`, 'panel anim', { left: '640px', top: '820px', width: '1000px', zIndex: 14, padding: '10px 26px 16px' });
      S.at('n4', () => { S.in(merge); S.sfx('pop'); });
      S.at('n5', () => { dan.expr('relief'); });
      C.think(S, 'n6>+0.2', 18, 1700, 250, 'Pair talk');
      C.notes(S, ['Contrast the two actions: save is helpful, closing now is not.', 'Do not teach mustn\'t. Just say shouldn\'t is not a strict ban.']);
    },
  });

  /* 3.7 · build sentences */
  FE.seg({
    id: '3.7', ch: 3, title: 'Build the sentence', dur: 70, music: 'off', lead: 0.6, gate: true, timer: {}, revealAt: 62,
    lines: [['n1', 'Build each sentence. Tap the words in order. Watch for extra words.']],
    build(S, L) {
      S.env('cowork', { laptop: false }); C.dim(S, 0.62);
      const pri = S.actor('priya', { x: 280, y: 780, scale: 1.0, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' });
      S.onResultFn = (ok) => { pri.expr(ok ? 'smile' : 'worry'); if (ok) pri.gesture('nod'); };
      FE.act.build(S, {
        x: 520, y: 190, w: 1360, label: 'Build the advice',
        items: [
          { prompt: 'Advice: save the file', bank: ['You:s', 'should:m', 'save:v', 'your:o', 'work:o', 'saves:d', 'to:d'], answers: [['you', 'should', 'save', 'your', 'work']], final: '{s|You} {m|should} {v|save} your work.', why: 'Subject, should, base verb. Correct.', diag: (t) => (t.includes('to') ? 'No to after should.' : t.includes('saves') ? 'Use the base verb. No s after should.' : null) },
          { prompt: 'Advice against: do not interrupt', bank: ['He:s', 'shouldn\'t:n', 'interrupt:v', 'his:o', 'coworkers:o', 'interrupts:d', 'doesn\'t:d'], answers: [['he', 'shouldn\'t', 'interrupt', 'his', 'coworkers']], final: '{s|He} {n|shouldn\'t} {v|interrupt} his coworkers.', why: 'Shouldn\'t is already negative. Use the base verb.', diag: (t) => (t.includes('doesn\'t') ? 'Do not use doesn\'t with should. Use shouldn\'t.' : t.includes('interrupts') ? 'Use the base verb. No s.' : null) },
          { prompt: 'Advice: leave sooner', bank: ['We:s', 'should:m', 'leave:v', 'earlier:o', 'leaves:d', 'to:d'], answers: [['we', 'should', 'leave', 'earlier']], final: '{s|We} {m|should} {v|leave} earlier.', why: 'The same shape again. Correct.', diag: (t) => (t.includes('to') ? 'No to after should.' : t.includes('leaves') ? 'Use the base verb.' : null) },
        ],
      });
      C.hintText(S, 'Start with the subject. Then should or shouldn\'t.');
      C.notes(S, ['Learners can tell you the order, and you tap for them.', 'Wrong tiles are real distractors: s, to, and does.']);
    },
  });

  /* 3.8 · meaningful transformations */
  FE.seg({
    id: '3.8', ch: 3, title: 'Make the negative meaningful', dur: 40, music: 'calm', lead: 0.6,
    lines: [
      ['n1', 'Do not make a negative just by adding n\'t. Ask: does it make sense?'],
      ['n2', 'If the address might be wrong, you should check it. You shouldn\'t check it? That does not help.', { gap: 1.0 }],
      ['n3', 'But if a message from your manager arrives, you shouldn\'t ignore it. That makes sense.', { gap: 1.2 }],
      ['n4', 'Choose the action first. Then decide: is it useful, or is it not useful?', { gap: 1.0 }],
      ['n5', 'Your turn. Say one meaningful negative sentence.', { gap: 1.0 }],
    ],
    build(S, L) {
      S.env('office', { monitor: false, lamp: false }); C.dim(S, 0.5);
      const maya = S.actor('maya', { x: 300, y: 770, scale: 1.05, facing: 0.4, arms: ['rest', 'rest'], expr: 'think' });
      const a = S.ui(`<div class="lab">${UB('The address might be wrong.')}</div><div style="font-size:40px;margin-top:6px">${U('{s|You} {m|should} {v|check} it.')}<span style="color:#55dc95;margin-left:12px">&#10003;</span></div><div style="font-size:40px;margin-top:8px;opacity:.9">${U('{s|You} {n|shouldn\'t} {v|check} it.')}<span style="color:#ff8a9b;margin-left:12px">&#10007;</span></div>`, 'panel anim', { left: '600px', top: '260px', width: '600px', zIndex: 14 });
      const b = S.ui(`<div class="lab">${UB('A message from your manager arrived.')}</div><div style="font-size:40px;margin-top:6px">${U('{s|You} {n|shouldn\'t} {v|ignore} it.')}<span style="color:#55dc95;margin-left:12px">&#10003;</span></div><div style="font-size:40px;margin-top:8px;opacity:.9">${U('{s|You} {m|should} {v|ignore} it.')}<span style="color:#ff8a9b;margin-left:12px">&#10007;</span></div>`, 'panel anim', { left: '1240px', top: '260px', width: '640px', zIndex: 14 });
      S.at('n2', () => { S.in(a); maya.expr('worry'); });
      S.at('n3', () => { S.in(b); maya.expr('think'); });
      S.at('n4', () => { maya.expr('confident'); });
      C.think(S, 'n5>+0.2', 9, 1000, 640, 'Think');
      C.notes(S, ['Both lines show a polarity check: choose should or shouldn\'t by meaning.']);
    },
  });
})(window);
