/* Fluent English - Love Speaking Club : chapters 8 - 10 */
(function (g) {
  'use strict';
  const LC = g.LC, I = g.I, CH = g.CH, V = g.V, Lesson = g.Lesson, Voice = g.Voice, Anim = g.Art.Anim, Timer = g.Timer, State = g.State;
  const { btn, card, chip, eyebrow, toggle, support, marks } = CH;

  /* =====================================================================
   * CHAPTER 8  Would You Rather? With a Twist  (7 min, 5 speaking)
   * steps: 4 pairs x 5 phases (choose, reason, follow-up, response, twist)
   * ===================================================================== */
  const R = LC.RATHER;
  Lesson.register({
    id: 'rather', steps: 20,
    suggest(ctx, i) { return [30, 45, 30, 45, 45][i % 5]; },
    enter(ctx) { const S = ctx.S; S.c = S.c || R.items.map(() => ({ a: 0, b: 0 })); S.after = S.after || R.items.map(() => ({ k: 0, c: 0 })); S.alt = S.alt || {}; S.follow = S.follow || {}; S.stretch = S.stretch || {}; ctx.setStage(V.backdrop('night')); },
    onStep(ctx, i, o) {
      const v = Math.floor(i / 5), ph = i % 5;
      ctx.scrim('linear-gradient(180deg, rgba(7,14,34,.35), rgba(7,14,34,.6))');
      ctx.discuss(ph > 0);
      if (i === 0) ctx.say(['ch8.intro']);
      else if (v === 3 && ph === 0) ctx.say(['ch8.hyp']);
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, v = Math.floor(i / 5), ph = i % 5, it = R.items[v], c = S.c[v], a = S.after[v], L = R.labels;
      let h = `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(v + 1, 'Pair ' + (v + 1) + ' of 4')}</div>`;
      h += `<div style="position:absolute;left:0;right:0;top:100px;text-align:center" class="row center" >${R.steps.map((s, k) => `<span class="chip ${k === ph ? '' : 'navy'}" style="${k === ph ? 'background:var(--amber);border-color:var(--amberLt)' : ''};font-size:26px">${I(s)}</span>`).join('')}${it.hyp ? `<span class="chip" style="background:var(--rasp);color:var(--ivory);border-color:var(--rasp);font-size:26px">${I(L.hyp)}</span>` : ''}</div>`;
      const door = (k, label, n, kind) => card(`left:${k === 'a' ? 50 : 830}px;top:148px;width:720px;height:386px;padding:0;overflow:hidden`, 'flat', `<div class="doorart" aria-hidden="true">${V.panel(it.id + k)}</div><div style="padding:12px 24px 14px"><div class="row" style="flex-wrap:nowrap;gap:10px;justify-content:space-between"><div class="t-h3" style="font-size:38px;color:${k === 'a' ? 'var(--tealDk)' : 'var(--raspDk)'}">${I(label)}</div><div class="row" style="gap:6px;flex-wrap:nowrap">${marks(n, k === 'a' ? '' : 'b', 6)}</div></div><div class="row" style="margin-top:6px;gap:10px;flex-wrap:nowrap">${btn('Add marker', 'mk', `${k}:1`, k === 'a' ? 'btn-teal xs' : 'btn-coral xs')}${btn('Remove marker', 'mk', `${k}:-1`, 'btn-ghost ivory xs')}</div></div>`, `door-${v}-${k}`);
      h += door('a', it.a, c.a) + door('b', it.b, c.b);
      h += `<div style="position:absolute;left:760px;top:290px;width:80px;height:80px;border-radius:50%;background:var(--amber);color:var(--ink);display:flex;align-items:center;justify-content:center;font:700 34px/1 var(--serif);box-shadow:0 8px 20px rgba(0,0,0,.4)" class="ormark" aria-hidden="true">${I('or')}</div>`;
      const ask = [['Choose a door. You may say it depends, or pass.', 'Choose a door'], ['Give a reason.', 'Reason'], ['Another speaker asks a follow-up question.', 'Follow-up'], ['Respond. Then decide: keep your choice, or change it?', 'Response'], ['An optional twist.', 'Twist']][ph][0];
      if (ph === 4) {
        const tw = S.alt[v] ? it.twist2 : it.twist;
        h += card('left:50px;right:50px;top:548px;padding:10px 26px 12px', '', `<div class="row" style="flex-wrap:nowrap;gap:24px;align-items:flex-start"><div class="grow stack" style="gap:6px"><div class="t-eyebrow">${I('The twist')}</div><div class="t-h2" style="font-size:42px">${I(tw)}</div></div><div class="stack">${toggle(S.alt[v], L.twistAlt, 'alt', v, true)}${btn(v < 3 ? L.next : 'Next chapter', 'next', null, 'btn-coral sm')}</div></div>`, 'tw-' + v + (S.alt[v] ? 'b' : 'a'));
      } else {
        h += card('left:50px;right:50px;top:548px;padding:10px 26px 12px', 'navy', `<div class="row" style="flex-wrap:nowrap;gap:24px;align-items:flex-start"><div class="grow stack" style="gap:8px"><div class="t-h2" style="font-size:32px">${I(ask)}</div>
          ${ph === 1 ? support(['I would choose … because …', 'It matters to me because …'], true) : ''}${ph === 2 ? `<div class="compact">${support(['Could you give an example?', 'What would that look like?', 'What if …?'], true)}</div>${S.follow[v] ? `<div class="t-small" style="color:var(--amberLt)">${it.follow.map((x) => I(x)).join(' &nbsp;•&nbsp; ')}</div>` : ''}` : ''}${S.stretch[v] ? `<div class="t-small" style="color:var(--amberLt)"><b>${I(L.stretch)}</b></div>` : ''}${ph === 3 ? `<div class="row" style="gap:16px"><span class="t-small">${I('Kept my choice')}</span>${btn('Add', 'af', 'k', 'btn-teal xs')}<b class="count" style="font-size:40px">${a.k}</b><span class="t-small">${I('Changed my choice')}</span>${btn('Add', 'af', 'c', 'btn-coral xs')}<b class="count" style="font-size:40px">${a.c}</b></div>` : ''}</div>
          <div class="stack" style="width:300px;gap:8px;align-items:stretch">${ph === 2 ? toggle(S.follow[v], L.follow, 'follow', v) : ''}${toggle(S.stretch[v], 'Stretch challenge', 'stretch', v)}${btn(ph === 3 ? 'Optional twist' : 'Next', 'next', null, 'btn-coral xs')}</div></div>${CH.demo(ctx, ph === 1 ? it.demo : '', 'margin-top:10px')}`, 'bt-' + v + '-' + ph);
      }
      return h;
    },
    acts: {
      mk(ctx, arg) { const [k, d] = arg.split(':'); const v = Math.floor(ctx.step / 5); const c = ctx.S.c[v]; c[k] = Math.max(0, c[k] + (+d)); },
      af(ctx, arg) { const v = Math.floor(ctx.step / 5); ctx.S.after[v][arg] += 1; },
      alt(ctx, arg) { ctx.S.alt[arg] = !ctx.S.alt[arg]; },
      follow(ctx, arg) { ctx.S.follow[arg] = !ctx.S.follow[arg]; },
      stretch(ctx, arg) { ctx.S.stretch[arg] = !ctx.S.stretch[arg]; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { const v = Math.floor(i / 5), ph = i % 5; if (ph === 0) { ctx.S.c[v].a += 2; ctx.S.c[v].b += 2; } }
  });

  /* =====================================================================
   * CHAPTER 9  Make Your Case  (7 min, 5 speaking)
   * one live screen: draw a quality, run three stages for each speaker
   * ===================================================================== */
  const C9 = LC.CASE;
  const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400); };
  Lesson.register({
    id: 'case', steps: 1,
    suggest(ctx) { return [45, 30, 45][ctx.S.stage || 0]; },
    enter(ctx) {
      const S = ctx.S; if (S.n == null) S.n = 6; S.cur = S.cur || 0; S.stage = S.stage || 0; S.q = S.q == null ? null : S.q; S.pi = S.pi || 0; S.chal = S.chal == null ? null : S.chal; S.target = S.target == null ? null : S.target;
      S.goals = S.goals || {}; S.fu = S.fu || 0; S.used = S.used || []; S.dir = S.dir || null; S.modal = null; S.started = !!S.started;
      ctx.setStage(V.spotlight());
    },
    onStep(ctx, i, o) { ctx.scrim('none'); ctx.discuss(!!ctx.S.started); if (!ctx.S.started) ctx.say(['ch9.intro']); },
    goalsOf(S) { return S.goals[S.cur] || (S.goals[S.cur] = [false, false, false]); },
    view(ctx) {
      const S = ctx.S, L = C9.labels, st = C9.stages[S.stage], gl = ctx.ch.goalsOf(S), all = gl.every(Boolean);
      let h = `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(S.stage + 1, 'Make your case')}</div>`;
      // speaker row
      h += `<div style="position:absolute;left:240px;right:50px;top:96px;gap:10px;flex-wrap:nowrap" class="row">${Array.from({ length: S.n }, (_, k) => { const gk = S.goals[k] || [false, false, false]; const done = gk.every(Boolean); return `<button class="chip ${k === S.cur ? '' : 'navy'}" style="${k === S.cur ? 'background:var(--amber);border-color:var(--amberLt)' : ''};font-size:26px;min-width:56px;justify-content:center" data-act="spk" data-arg="${k}" aria-pressed="${k === S.cur}" aria-label="${L.speaker} ${k + 1}" type="button">${k + 1}${done ? ' ✓' : ''}</button>`; }).join('')}<button class="chip navy" style="font-size:24px" data-act="n" data-arg="1" type="button" aria-label="More speakers">+</button><button class="chip navy" style="font-size:24px" data-act="n" data-arg="-1" type="button" aria-label="Fewer speakers">−</button><span class="grow"></span><button class="chip navy" style="font-size:22px" data-act="modal" data-arg="rec" type="button">${I(L.record)}</button><button class="chip navy" style="font-size:22px" data-act="next" type="button">${I('Next chapter')}</button></div>`;
      if (!S.started) {
        h += card('left:240px;right:240px;top:200px;padding:30px 40px 34px;text-align:center', 'navy', `<div class="t-h1">${I('Make Your Case')}</div><div class="t-h3" style="margin-top:12px;color:var(--amberLt)">${I(C9.intro)}</div><div class="row center" style="margin-top:18px;gap:14px">${C9.stages.map((s, k) => `<span class="chip navy" style="font-size:28px">${I(s.title)}</span>`).join('')}</div><div class="row center" style="margin-top:26px;gap:16px">${btn(L.draw, 'draw', null, 'btn-coral')}${btn(L.record, 'modal', 'rec', 'btn-ghost')}</div>`, 'c0');
        return h;
      }
      const q = C9.qualities[S.q];
      const rel = (cls, inner, k) => card('position:relative', cls, inner, k);
      const sel = (on) => on ? 'background:var(--amber);border-color:var(--amberLt)' : '';
      // left column: stage + zone
      let left = rel('', `<div class="t-eyebrow">${I(st.title)}</div><div class="t-small" style="margin-top:2px;font-size:26px;font-weight:700">${I(st.ask)}</div><div class="row compact" style="margin-top:6px;gap:10px"><span class="t-micro" style="color:#3C2A5C;font-size:21px">${I(st.time)}</span></div><div class="row compact" style="margin-top:6px;gap:10px">${btn(L.timer, 'timer', null, 'btn-amber xs')}${S.stage < 2 ? btn(L.stage, 'stage', 1, 'btn-coral xs') : btn(L.nextSpeaker, 'nextSpk', null, 'btn-coral xs')}${S.stage > 0 ? btn('Back', 'stage', -1, 'btn-ghost ivory xs') : ''}</div>`, 'sc-' + S.stage);
      if (S.stage === 1) {
        left += rel('navy', `<div class="t-eyebrow">${I(L.challenge)}</div><div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px;min-width:0">${C9.challenges.map((c, k) => `<button class="chip ${k === S.chal ? '' : 'navy'}" style="font-size:24px;justify-content:flex-start;text-align:left;${sel(k === S.chal)}" data-act="chal" data-arg="${k}" aria-pressed="${k === S.chal}" type="button">${I(c)}</button>`).join('')}</div><div class="t-micro" style="margin-top:8px;color:var(--amberLt)">${I('Genuine follow-ups')}:</div><div class="row" style="margin-top:4px;gap:10px;flex-wrap:nowrap;align-items:center"><span class="chip" style="font-size:26px;flex:1 1 auto;justify-content:flex-start;background:var(--ivory)">${I(C9.followups[S.fu % C9.followups.length])}</span>${btn('Another', 'fu', null, 'btn-ghost xs')}</div>`, 'z1');
      } else if (S.stage === 2) {
        left += rel('navy', `<div class="t-eyebrow">${I(L.target)}</div><div class="row" style="margin-top:8px;gap:8px">${LC.TARGETS.map((c, k) => `<button class="chip ${k === S.target ? '' : 'navy'}" style="font-size:25px;${sel(k === S.target)}" data-act="target" data-arg="${k}" aria-pressed="${k === S.target}" type="button">${I(c)}</button>`).join('')}</div><div class="row" style="margin-top:10px;gap:10px">${toggle(S.dir === 's', C9.strengthen, 'dir', 's')}${toggle(S.dir === 'r', C9.revise, 'dir', 'r')}</div>`, 'z2');
      } else {
        left += rel('navy', `<div class="t-small">${I('Use a reason, a detail, or an example. A short pause to think is welcome.')}</div>`, 'z0');
      }
      h += `<div style="position:absolute;left:50px;top:146px;width:740px;display:flex;flex-direction:column;gap:8px">${left}</div>`;
      // right column: quality + goals
      let right = rel('navy', `<div class="row" style="flex-wrap:nowrap;gap:18px;align-items:center"><div style="width:90px;height:90px;flex:0 0 auto" aria-hidden="true">${V.qualityIcon(q.id)}</div><div><div class="t-eyebrow">${I('Quality')}</div><div class="t-h1" style="font-size:${q.w.length > 12 ? 36 : 46}px">${I(q.w)}</div></div><span class="grow"></span>${btn('Draw', 'draw', null, 'btn-coral xs')}</div>
        <div style="margin-top:10px;background:var(--amber);color:var(--ink);border-radius:18px;padding:6px 18px 8px" class="t-small bubble"><b>${I(q.p[S.pi])}</b></div><div class="row compact" style="margin-top:8px;gap:8px"><span class="t-micro" style="color:var(--amberLt)">${I('Another prompt')}:</span>${q.p.map((p, k) => `<button class="chip ${k === S.pi ? '' : 'navy'}" style="font-size:24px;min-width:48px;justify-content:center;${sel(k === S.pi)}" data-act="prompt" data-arg="${k}" aria-pressed="${k === S.pi}" aria-label="Prompt ${k + 1}" type="button">${k + 1}</button>`).join('')}</div>`, 'qc-' + S.q);
      right += rel('', `<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div class="t-eyebrow">${I('Speaking goals')}</div>${all ? `<span class="ack chip" style="background:var(--teal);color:var(--ink);border-color:var(--tealLt);font-size:24px;padding:0 14px 2px"><svg class="spark" width="26" height="26" viewBox="0 0 34 34" aria-hidden="true" style="margin-right:6px"><circle cx="17" cy="17" r="15" fill="none" stroke="#0B1630" stroke-width="3"/><path d="M9 17l6 7 11-14" stroke="#0B1630" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>${I(C9.ack)}</span>` : ''}</div><div class="stack" style="gap:6px;margin-top:6px">${C9.goals.map((x, k) => `<button  class="goal ${gl[k] ? 'on' : ''}" style="padding:2px 14px 4px" data-act="goal" data-arg="${k}" aria-pressed="${gl[k]}" type="button"><span class="gbox" aria-hidden="true">${gl[k] ? '✓' : ''}</span><span class="t-body" style="font-size:26px">${I(x)}</span></button>`).join('')}</div>`, 'goals');
      h += `<div style="position:absolute;left:830px;top:150px;width:720px;display:flex;flex-direction:column;gap:10px">${right}</div>`;
      CH.demo(ctx, C9.demo);
      if (S.modal === 'rec') {
        const rows = Array.from({ length: S.n }, (_, k) => { const gk = S.goals[k] || [false, false, false]; return `<div class="row" style="flex-wrap:nowrap;justify-content:space-between;padding:6px 0;border-bottom:2px solid var(--ivory3)"><b class="t-body">${I(L.speaker)} ${k + 1}</b><span class="t-body">${C9.goals.map((x, j) => `<span class="chip ${gk[j] ? 'sel' : ''}" style="font-size:24px;margin-left:6px">${I(x)}</span>`).join('')}</span></div>`; }).join('');
        h += `<div style="position:absolute;inset:0;background:rgba(7,14,34,.65)"></div>` + card('left:150px;right:150px;top:110px;padding:24px 36px 28px;max-height:740px;overflow:auto', '', `<div class="t-h2">${I(L.record)}</div><div class="t-small" style="margin:6px 0 10px;color:#3C2A5C">${I(L.limits)}</div>${rows}<div class="row" style="margin-top:16px;gap:12px">${btn(L.exportJ, 'expJson', null, 'btn-teal xs')}${btn(L.exportC, 'expCsv', null, 'btn-teal xs')}${btn(L.clear, 'clearRec', null, 'btn-ghost ivory xs')}<span class="grow"></span>${btn('Close', 'modal', '', 'btn-coral xs')}</div><div class="t-micro" style="margin-top:12px;color:#3C2A5C">${I('There is no ranking. The record only shows which speaking goals were completed.')}</div>`, 'rec');
      }
      return h;
    },
    acts: {
      draw(ctx) { const S = ctx.S; const pool = C9.qualities.map((_, k) => k).filter((k) => !S.used.includes(k)); const k = (pool.length ? pool : C9.qualities.map((_, x) => x))[Math.floor(Math.random() * (pool.length || C9.qualities.length))]; if (!pool.length) S.used = []; S.used.push(k); S.q = k; S.pi = 0; S.started = true; S.stage = 0; S.chal = null; S.target = null; S.dir = null; ctx.discuss(true); Voice.stop(); },
      prompt(ctx, arg) { ctx.S.pi = +arg; },
      stage(ctx, arg) { const S = ctx.S; S.stage = Math.max(0, Math.min(2, S.stage + (+arg))); Timer.hide(); },
      chal(ctx, arg) { ctx.S.chal = +arg; },
      target(ctx, arg) { const S = ctx.S; S.target = +arg; ctx.ch.goalsOf(S)[2] = true; },
      dir(ctx, arg) { ctx.S.dir = ctx.S.dir === arg ? null : arg; },
      goal(ctx, arg) { const gl = ctx.ch.goalsOf(ctx.S); gl[+arg] = !gl[+arg]; },
      spk(ctx, arg) { const S = ctx.S; S.cur = +arg; S.stage = 0; Timer.hide(); },
      n(ctx, arg) { const S = ctx.S; S.n = Math.max(2, Math.min(14, S.n + (+arg))); if (S.cur >= S.n) S.cur = 0; },
      nextSpk(ctx) { const S = ctx.S; S.cur = (S.cur + 1) % S.n; S.stage = 0; Timer.hide(); ctx.ch.acts.draw(ctx); },
      timer(ctx) { Timer.set([45, 30, 45][ctx.S.stage]); Timer.start(); },
      fu(ctx) { ctx.S.fu = ((ctx.S.fu || 0) + 1) % C9.followups.length; },
      modal(ctx, arg) { ctx.S.modal = arg || null; },
      expJson(ctx) { const S = ctx.S; dl('make-your-case-record.json', JSON.stringify({ note: 'Teacher-entered record. Stored only in this browser. No names required. Not a ranking.', speakers: Array.from({ length: S.n }, (_, k) => ({ speaker: k + 1, goals: Object.fromEntries(C9.goals.map((x, j) => [x, !!(S.goals[k] || [])[j]])) })) }, null, 2), 'application/json'); return false; },
      expCsv(ctx) { const S = ctx.S; const lines = ['speaker,' + C9.goals.map((x) => '"' + x + '"').join(',')]; for (let k = 0; k < S.n; k++) lines.push((k + 1) + ',' + C9.goals.map((x, j) => ((S.goals[k] || [])[j] ? 'yes' : 'no')).join(',')); dl('make-your-case-record.csv', lines.join('\n'), 'text/csv'); return false; },
      clearRec(ctx) { ctx.S.goals = {}; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx) { const S = ctx.S; if (!S.started) ctx.ch.acts.draw(ctx); }
  });

  /* =====================================================================
   * CHAPTER 10  Final Takeaway  (3 min, 2 speaking)
   * ===================================================================== */
  const F = LC.FINAL;
  Lesson.register({
    id: 'final', steps: 3,
    suggest(ctx, i) { return i === 0 ? 45 : (i === 1 ? 60 : 0); },
    enter(ctx) { const S = ctx.S; S.stem = S.stem == null ? null : S.stem; S.used = S.used || []; S.ask = !!S.ask; S.check = S.check || [false, false, false, false]; S.modal = null; ctx.setStage(V.finalScene()); },
    onStep(ctx, i, o) {
      ctx.scrim(i === 2 ? 'radial-gradient(ellipse at 50% 45%, rgba(7,14,34,.15), rgba(7,14,34,.6))' : 'linear-gradient(180deg, rgba(7,14,34,.78), rgba(7,14,34,.8))');
      ctx.discuss(i < 2);
      if (i === 0) ctx.say(['ch10.intro']);
      if (i === 2) ctx.say(['ch10.close']);
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, L = F.labels;
      let h = i < 2 ? `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(i + 1, i === 0 ? 'Complete one sentence' : 'Final response')}</div>` : '';
      if (i === 0) {
        h += `<div style="position:absolute;left:80px;right:80px;top:112px" class="stack" style="gap:16px">${F.stems.map((s, k) => `<button class="stemcard ${S.stem === k ? 'sel' : ''}" data-act="stem" data-arg="${k}" aria-pressed="${S.stem === k}" type="button"><span class="t-h2" style="font-size:46px">${I(s)}</span></button>`).join('')}</div>`;
        h += `<div style="position:absolute;left:80px;right:80px;bottom:34px" class="row"><span class="grow t-body"><b>${I(F.intro)}</b> ${I('Choose one.')}</span>${CH.demo(ctx, F.demo, 'width:760px;padding:6px 16px 8px')}${btn('Final response', 'next', null, 'btn-coral')}</div>`;
      } else if (i === 1) {
        h += card('left:100px;right:100px;top:116px;padding:26px 38px 30px', '', `<div class="t-h2" style="font-size:50px">${I(F.final)}</div><div class="t-eyebrow" style="margin-top:18px">${I('Target expressions')}</div><div class="row" style="margin-top:10px;gap:12px">${LC.TARGETS.map((t, k) => `<button class="chip ${S.used.includes(k) ? 'sel' : ''}" style="font-size:34px;padding:8px 24px 10px" data-act="use" data-arg="${k}" aria-pressed="${S.used.includes(k)}" type="button">${I(t)}</button>`).join('')}</div>
          <div class="row" style="margin-top:20px;gap:18px"><span class="t-body"><b class="num" style="font-size:44px;color:var(--rasp)">${Math.min(S.used.length, 2)}</b> / <b class="num">2</b> ${I(L.used)}</span>${toggle(S.ask, L.ask, 'ask', null, true)}</div>
          ${S.used.length >= 2 && S.ask ? `<div class="t-body" style="margin-top:12px;color:var(--tealDk)"><b>${I(LC.CASE.ack)}</b></div>` : ''}`, 'fin');
        h += `<div style="position:absolute;left:100px;right:100px;bottom:34px" class="row">${btn(L.checklist, 'modal', 'chk', 'btn-ghost')}<span class="grow"></span>${btn('Closing', 'next', null, 'btn-coral')}</div>`;
        if (S.modal === 'chk') h += `<div style="position:absolute;inset:0;background:rgba(7,14,34,.65)"></div>` + card('left:200px;right:200px;top:150px;padding:26px 38px 30px', '', `<div class="t-h2">${I(L.checklist)}</div><div class="t-small" style="margin:8px 0 14px;color:#3C2A5C">${I(F.checkNote)}</div><div class="stack" style="gap:10px">${F.checklist.map((x, k) => `<button class="goal ${S.check[k] ? 'on' : ''}" data-act="chk" data-arg="${k}" aria-pressed="${S.check[k]}" type="button"><span class="gbox" aria-hidden="true">${S.check[k] ? '✓' : ''}</span><span class="t-body">${I(x)}</span></button>`).join('')}</div><div class="row" style="margin-top:20px;gap:12px">${btn('Clear', 'chkClear', null, 'btn-ghost ivory xs')}<span class="grow"></span>${btn('Close', 'modal', '', 'btn-coral xs')}</div>`, 'chkm');
      } else {
        h += `<div style="position:absolute;left:0;right:0;top:250px;text-align:center"><img src="assets/fluent_english_logo_white.png" alt="Fluent English" style="width:420px;display:block;margin:0 auto 20px"><div class="t-hero fade" style="font-size:96px;color:var(--ivory)">${I(F.close)}</div><div class="t-h3" style="margin-top:18px;color:var(--amberLt)">${I(L.thanks)}</div></div>`;
        h += `<div style="position:absolute;left:0;right:0;bottom:34px;text-align:center">${btn('Back to the start', 'restart', null, 'btn-ghost sm')}</div>`;
      }
      return h;
    },
    acts: {
      stem(ctx, arg) { ctx.S.stem = +arg; },
      use(ctx, arg) { const k = +arg, a = ctx.S.used, ix = a.indexOf(k); if (ix >= 0) a.splice(ix, 1); else a.push(k); },
      ask(ctx) { ctx.S.ask = !ctx.S.ask; },
      modal(ctx, arg) { ctx.S.modal = arg || null; },
      chk(ctx, arg) { ctx.S.check[+arg] = !ctx.S.check[+arg]; },
      chkClear(ctx) { ctx.S.check = [false, false, false, false]; },
      restart(ctx) { Lesson.go(0, 0); return false; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { if (i === 0) ctx.S.stem = 0; if (i === 1) { ctx.S.used = [0, 3]; ctx.S.ask = true; } }
  });
})(window);
