/* Fluent English - Love Speaking Club : chapters 4 - 5 */
(function (g) {
  'use strict';
  const LC = g.LC, I = g.I, CH = g.CH, V = g.V, Lesson = g.Lesson, Voice = g.Voice, Anim = g.Art.Anim;
  const { btn, card, chip, eyebrow, demo, dots, marks, toggle, support } = CH;

  /* =====================================================================
   * CHAPTER 4  The Missing Piece  (8 min, 6 speaking)
   * steps: 0 set-up, 1 reveal 1, 2 reveal 2, 3 reveal 3, 4 first vs final interpretation
   * ===================================================================== */
  const M = LC.MYSTERY;
  const esc = (v) => String(v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const modalCard = (inner, k) => `<div style="position:absolute;inset:0;background:rgba(7,14,34,.62)" data-k="mb-${k}"></div>` + card('left:150px;right:150px;top:104px;padding:20px 36px 24px;max-height:770px;overflow:auto', '', inner, 'mc-' + k);
  const interpChips = (sel, act) => `<div class="stack" style="gap:12px">${M.interp.map((t, k) => `<button class="chip${sel.includes(k) ? ' sel' : ''}" style="font-size:30px;text-align:left;justify-content:flex-start" data-act="${act}" data-arg="${k}" aria-pressed="${sel.includes(k)}" type="button">${I(t)}</button>`).join('')}</div>`;
  const summary = (sel) => sel.length ? sel.map((k) => `<div class="t-small" style="margin-top:6px">• ${I(M.interp[k])}</div>`).join('') : `<div class="t-small" style="color:var(--amberLt)">${I('Not recorded yet')}</div>`;

  Lesson.register({
    id: 'mystery', steps: 5,
    suggest(ctx, i) { return i >= 1 && i <= 3 ? 90 : (i === 4 ? 60 : 0); },
    enter(ctx) {
      const S = ctx.S; S.r = S.r || [false, false, false]; S.first = S.first || []; S.final = S.final || []; S.why = S.why || []; S.note1 = S.note1 || ''; S.note2 = S.note2 || ''; S.know = S.know || {}; S.assume = S.assume || [];
      const api = V.mystery(); ctx.mys = api; ctx.setStage(api.stage); api.bind();
    },
    onStep(ctx, i, o) {
      const S = ctx.S, api = ctx.mys; api.bind(); const n = S.r.filter(Boolean).length;
      S.modal = null;
      api.freeze(i === 0 ? 0 : (i >= 4 ? n : (S.r[i - 1] ? Math.min(n, i) : Math.min(n, i - 1))));
      ctx.scrim(i === 4 ? 'rgba(7,14,34,.78)' : 'none');
      ctx.stage.layers.actors.style.cssText = i === 4 ? 'opacity:0' : '';
      ctx.discuss(i >= 1);
      if (i === 0) ctx.say(['ch4.intro']);
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, T = M.setup;
      let h = `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(i + 1, i === 0 ? 'The Missing Piece' : (i === 4 ? 'Compare your thinking' : M.reveals[i - 1].label))}</div>`;
      if (i === 0) {
        h += card('left:260px;right:260px;top:92px;text-align:center;padding:10px 30px 12px', 'navy', `<div class="t-h2">${I(T.title)}</div><div class="t-small" style="margin-top:4px;color:var(--amberLt)">${I(T.line)}</div><div class="t-micro" style="margin-top:4px;font-size:23px">${I(T.note)}</div>`, 's0');
        h += `<div style="position:absolute;left:0;right:0;bottom:60px;display:flex;justify-content:center">${btn('Continue', 'next', null, 'btn-coral')}</div>`;
        return h;
      }
      if (i >= 1 && i <= 3) {
        const R = M.reveals[i - 1], shown = S.r[i - 1];
        if (!shown) {
          h += `<div style="position:absolute;left:0;right:0;bottom:112px;display:flex;justify-content:center">${btn(R.label, 'reveal', i - 1, 'btn-coral')}</div>`;
          if (i > 1) h += `<div style="position:absolute;left:0;right:0;bottom:18px;text-align:center" class="t-small">${I('You choose when the new information appears.')}</div>`;
          return h;
        }
        // evidence cards (top band)
        if (R.kind === 'message') {
          h += card('left:60px;top:100px;width:700px;padding:0', 'flat', `<div style="background:var(--navy2);color:var(--ivory);padding:12px 28px;border-radius:30px 30px 0 0" class="row mhead"><b class="t-small">${I('Message from Alex')}</b><span class="grow"></span><b class="t-small num">${R.time}</b></div><div style="padding:12px 28px 16px"><div style="background:var(--teal);color:var(--ink);border-radius:26px 26px 26px 6px;padding:14px 24px 18px" class="t-h3 bubble">${I(R.text)}</div></div>`, 'ev1');
          h += card('left:840px;top:105px;width:700px;padding:20px 30px 24px', 'navy', `<div class="t-eyebrow">${I('First interpretation')}</div>${summary(S.first)}<div style="margin-top:14px">${btn(S.first.length ? 'Change it' : 'Record it', 'modal', 'first', 'btn-amber xs')}</div>`, 'fi1');
        } else if (R.kind === 'email') {
          h += card('left:840px;top:105px;width:700px;padding:0', 'flat', `<div style="background:var(--navy2);color:var(--ivory);padding:12px 28px;border-radius:30px 30px 0 0" class="row mhead"><b class="t-small">${I(R.from)}</b><span class="grow"></span><b class="t-small num">${R.time}</b></div><div style="padding:10px 28px 14px"><div class="t-h3" style="font-size:34px">${I(R.subject)}</div><div class="t-small" style="margin-top:4px;font-size:27px">${I(R.text)}</div></div>`, 'ev2');
          h += card('left:60px;top:105px;width:700px;padding:16px 28px 20px', 'navy', `<div class="t-eyebrow">${I('First interpretation')}</div>${summary(S.first)}`, 'fi2');
        } else {
          h += card('left:60px;top:105px;width:700px;padding:18px 28px 22px', '', `<div class="t-eyebrow">${I('Maya remembers')}</div><div class="t-h3" style="margin-top:6px">${I(R.maya)}</div>`, 'mm');
          h += card('left:840px;top:105px;width:700px;padding:18px 28px 22px', '', `<div class="t-eyebrow">${I('Alex remembers')}</div><div class="t-h3" style="margin-top:6px">${I(R.alex)}</div>`, 'ma');
          h += card('left:200px;right:200px;top:584px;padding:6px 26px 8px', 'navy', `<div class="row" style="flex-wrap:nowrap;gap:30px;align-items:flex-start">${R.chat.map(([n, t]) => `<div class="grow"><b class="t-micro" style="color:var(--amberLt);font-size:22px">${I(n)}</b><div class="t-micro" style="font-size:24px">${I(t)}</div></div>`).join('')}</div>`, 'chat');
        }
        // discussion band: prompts grid + buttons (no overlaps)
        const prompts = i === 1 ? M.prompts.slice(0, 3) : M.prompts;
        h += `<div style="position:absolute;left:50px;top:738px;width:1130px;display:grid;grid-template-columns:1fr 1fr;gap:10px">${prompts.map((p) => `<span class="chip" style="font-size:28px;padding:4px 18px 6px;background:var(--ivory);justify-content:flex-start">${I(p)}</span>`).join('')}</div>`;
        h += `<div style="position:absolute;left:1210px;top:738px;width:340px;display:flex;flex-direction:column;gap:10px;align-items:stretch">${btn('Sample ideas', 'modal', 'ideas', 'btn-ghost xs')}${btn(i < 3 ? 'Next reveal' : 'Compare views', 'next', null, 'btn-coral sm')}</div>`;
        h += CH.demo(ctx, M.demo[i - 1], 'position:absolute;left:50px;top:330px;width:700px;padding:8px 18px 10px');
        // modals
        if (S.modal === 'first') h += modalCard(`<div class="t-h2">${I('What is the group’s first interpretation?')}</div><div class="t-small" style="margin:8px 0 16px">${I('Choose one or more. You can change this later.')}</div>${interpChips(S.first, 'pickFirst')}<div class="row" style="margin-top:16px"><span class="t-small">${I(M.interpLabel.custom)}:</span><input class="in grow" data-in="note1" value="${esc(S.note1)}" aria-label="Teacher note, typed"></div><div class="row" style="margin-top:20px">${btn('Done', 'modal', '', 'btn-coral')}</div>`, 'first');
        if (S.modal === 'ideas') {
          h += modalCard(`<div class="t-h2">${I('Sample ideas for the teacher')}</div><div class="row" style="align-items:flex-start;gap:30px;flex-wrap:nowrap;margin-top:14px"><div class="grow"><div class="t-eyebrow">${I('What we know')}</div>${R.facts.map((x) => `<div class="t-small" style="margin-top:6px;font-size:26px">• ${I(x)}</div>`).join('')}</div>
            <div class="grow"><div class="t-eyebrow">${I('Possible assumptions')}</div>${M.assumeIdeas.map((x) => `<div class="t-small" style="margin-top:6px;font-size:26px">• ${I(x)}</div>`).join('')}</div>
            <div class="grow"><div class="t-eyebrow">${I('Questions to ask')}</div>${M.wonderIdeas.map((x) => `<div class="t-small" style="margin-top:6px;font-size:26px">• ${I(x)}</div>`).join('')}</div></div><div class="row" style="margin-top:20px">${btn('Close', 'modal', '', 'btn-coral')}</div>`, 'ideas');
        }
        return h;
      }
      // step 4: side by side
      h += card('left:60px;top:104px;width:740px;padding:14px 30px 16px', '', `<div class="t-eyebrow">${I(M.interpLabel.first)}</div>${summary(S.first)}${S.note1 ? `<div class="t-micro" style="margin-top:10px;color:#6B2F5A">${I(M.interpLabel.custom)}: ${I.raw(S.note1)}</div>` : ''}`, 'cmp1');
      h += card('left:840px;top:104px;width:700px;padding:14px 30px 16px', '', `<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div class="t-eyebrow">${I(M.interpLabel.final)}</div>${btn(S.final.length ? 'Change it' : 'Record it', 'modal', 'final', 'btn-amber xs')}</div>${summary(S.final)}${S.note2 ? `<div class="t-micro" style="margin-top:10px;color:#6B2F5A">${I(M.interpLabel.custom)}: ${I.raw(S.note2)}</div>` : ''}`, 'cmp2');
      h += card('left:60px;right:60px;top:300px;padding:10px 30px 12px', 'navy', `<div class="t-eyebrow">${I(M.interpLabel.why)}</div><div class="row" style="margin-top:8px;gap:10px">${M.why.map((w, k) => `<button class="chip navy${S.why.includes(k) ? ' sel' : ''}" style="font-size:25px;padding:2px 14px 4px" data-act="pickWhy" data-arg="${k}" aria-pressed="${S.why.includes(k)}" type="button">${I(w)}</button>`).join('')}</div>`, 'why');
      h += `<div style="position:absolute;left:60px;right:60px;top:480px;color:var(--amberLt)" class="t-small"><b>${I(M.reward)}</b></div>`;
      h += `<div style="position:absolute;left:50px;top:650px;width:1130px;display:grid;grid-template-columns:1fr 1fr;gap:10px">${M.prompts.map((p) => `<span class="chip" style="font-size:27px;padding:4px 18px 6px;background:var(--ivory);justify-content:flex-start">${I(p)}</span>`).join('')}</div>`;
      h += `<div style="position:absolute;left:1210px;top:650px;width:340px">${btn('Next chapter', 'next', null, 'btn-coral')}</div>`;
      h += `<div style="position:absolute;left:50px;top:790px;width:1500px" class="t-micro"><b>${I(M.stretch)}</b></div>`;
      h += CH.demo(ctx, M.demo[2], 'position:absolute;left:60px;top:300px;width:1000px;padding:6px 16px 8px');
      if (S.modal === 'final') h += modalCard(`<div class="t-h2">${I('What is the group’s final interpretation?')}</div><div class="t-small" style="margin:8px 0 16px">${I('Choose one or more. It may match the first one, or it may be different.')}</div>${interpChips(S.final, 'pickFinal')}<div class="row" style="margin-top:16px"><span class="t-small">${I(M.interpLabel.custom)}:</span><input class="in grow" data-in="note2" value="${esc(S.note2)}" aria-label="Teacher note, typed"></div><div class="row" style="margin-top:20px">${btn('Done', 'modal', '', 'btn-coral')}</div>`, 'final');
      return h;
    },
    onInput(ctx, k, v) { ctx.S[k] = v; },
    acts: {
      reveal(ctx, arg) {
        const n = +arg, api = ctx.mys, S = ctx.S; S.r[n] = true;
        if (n === 0) { Voice.stop(); api.r1(() => { ctx.refresh(); }); ctx.say(['ch4.r1a', 'ch4.r1b'], { gap: 300 }); }
        else if (n === 1) { api.r2(); ctx.say(['ch4.r2']); }
        else { api.r3(); ctx.say(['ch4.r3']); }
      },
      modal(ctx, arg) { ctx.S.modal = arg || null; },
      pickFirst(ctx, arg) { const k = +arg, a = ctx.S.first, ix = a.indexOf(k); if (ix >= 0) a.splice(ix, 1); else a.push(k); },
      pickFinal(ctx, arg) { const k = +arg, a = ctx.S.final, ix = a.indexOf(k); if (ix >= 0) a.splice(ix, 1); else a.push(k); },
      pickWhy(ctx, arg) { const k = +arg, a = ctx.S.why, ix = a.indexOf(k); if (ix >= 0) a.splice(ix, 1); else a.push(k); },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { const S = ctx.S; if (i >= 1 && i <= 3 && !S.r[i - 1]) { S.r[i - 1] = true; ctx.ch.acts.reveal(ctx, i - 1); } if (i === 1 && !S.first.length) S.first = [3]; if (i === 3) S.final = [1]; }
  });

  /* =====================================================================
   * CHAPTER 5  Defend It, Then Challenge It  (8 min, 6 speaking)
   * steps: 4 statements x 4 phases (set-up, round one, round two, round three)
   * ===================================================================== */
  const D = LC.DEBATE;
  const dcols = ['sd', 'd', 'it', 'a', 'sa'];
  Lesson.register({
    id: 'debate', steps: 16,
    suggest(ctx, i) { return i % 4 === 0 ? 0 : 45; },
    enter(ctx) { const S = ctx.S; S.scale = S.scale || D.items.map(() => ({ b: [0, 0, 0, 0, 0], a: [0, 0, 0, 0, 0] })); S.sample = S.sample || {}; },
    onStep(ctx, i, o) {
      const s = Math.floor(i / 4), ph = i % 4;
      if (ctx.curS !== s || o.replay) { ctx.curS = s; const st = V.debate(s); ctx.setStage(st); }
      ctx.scrim('linear-gradient(90deg, rgba(7,14,34,.92) 0%, rgba(7,14,34,.82) 48%, rgba(7,14,34,.15) 66%, rgba(7,14,34,0) 100%)');
      ctx.discuss(ph > 0);
      if (i === 0) ctx.say(['ch5.intro']);
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, s = Math.floor(i / 4), ph = i % 4, it = D.items[s], sc = S.scale[s], R = D.rounds, L = D.labels;
      const rel = (cls, inner, k) => card('position:relative', cls, inner, k);
      let h = `<div style="position:absolute;left:250px;top:30px;right:520px" class="row">${eyebrow(s + 1, 'Statement ' + (s + 1) + ' of 4')}<span class="chip" style="font-size:22px;padding:0 14px 2px;background:var(--ivory2)">${I('A debatable opinion, not a fact.')}</span></div>`;
      let col = rel('', `<div class="t-h1" style="font-size:42px">${I(it.s)}</div>`, 'st-' + s);
      if (ph === 0) {
        col += rel('navy', `<div class="t-body">${I(D.note)}</div><div class="row" style="margin-top:16px">${R.map((r) => `<span class="chip navy">${I(r.title)}</span>`).join('')}</div>`, 'setup');
        h += `<div style="position:absolute;left:50px;top:100px;width:900px;display:flex;flex-direction:column;gap:12px">${col}</div><div style="position:absolute;left:50px;top:700px">${btn('Round one', 'next', null, 'btn-coral')}</div>`;
        return h;
      }
      const r = R[ph - 1], needDep = (ph === 3 ? sc.a[2] : sc.b[2]) > 0;
      col += rel('navy', `<div class="row" style="gap:8px">${R.map((x, k) => `<span class="chip ${k === ph - 1 ? '' : 'navy'}" style="font-size:24px;${k === ph - 1 ? 'background:var(--amber);border-color:var(--amberLt)' : ''}">${I(x.title)}</span>`).join('')}</div><div class="t-h3" style="font-size:33px;margin-top:6px">${I(r.ask)}</div>${needDep ? `<div class="t-small" style="color:var(--amberLt);margin-top:4px"><b>${I(L.dependsAsk)}</b></div>` : ''}`, 'ask-' + i);
      const cell = (k) => `<div style="flex:1 1 0;text-align:center;border-left:${k ? 2 : 0}px solid rgba(11,22,48,.14);padding:0 4px;gap:4px" class="stack"><div class="t-micro" style="min-height:58px;display:flex;align-items:flex-start;justify-content:center;font-size:22px;color:${k === 2 ? 'var(--raspDk)' : 'var(--ink)'}"><b>${I(D.scale[k])}</b></div>
        <div class="row center" style="gap:4px;flex-wrap:nowrap"><button class="btn btn-teal xs" style="min-height:40px;padding:0 10px;min-height:38px" data-act="sc" data-arg="b:${k}:1" aria-label="Add before marker" type="button">+</button><b class="count" style="font-size:38px;min-width:30px">${sc.b[k]}</b><button class="btn btn-ghost ivory xs" style="min-height:40px;padding:0 10px;min-height:38px" data-act="sc" data-arg="b:${k}:-1" aria-label="Remove before marker" type="button">−</button></div>
        <div class="row center" style="gap:4px;flex-wrap:nowrap;margin-top:2px"><button class="btn btn-coral xs" style="min-height:40px;padding:0 10px;min-height:38px" data-act="sc" data-arg="a:${k}:1" aria-label="Add after marker" type="button">+</button><b class="count" style="font-size:38px;min-width:30px">${sc.a[k]}</b><button class="btn btn-ghost ivory xs" style="min-height:40px;padding:0 10px;min-height:38px" data-act="sc" data-arg="a:${k}:-1" aria-label="Remove after marker" type="button">−</button></div></div>`;
      col += rel('', `<div class="row" style="gap:0;flex-wrap:nowrap;align-items:stretch"><div class="stack" style="width:100px;padding-top:62px;gap:20px"><b class="t-micro" style="color:var(--tealDk);font-size:24px">${I(L.before)}</b><b class="t-micro" style="color:var(--raspDk);font-size:24px">${I(L.after)}</b></div>${dcols.map((_, k) => cell(k)).join('')}</div>`, 'scale');
      h += `<div style="position:absolute;left:50px;top:100px;width:900px;display:flex;flex-direction:column;gap:10px">${col}</div>`;
      const lang = ['I see your point, but …', 'That depends on …', 'A possible exception is …', 'I would agree if …', 'One argument someone might make is …'];
      if (S.sample[s]) h += card('right:40px;top:100px;width:560px;padding:6px 16px 8px', '', `<div class="t-micro" style="font-size:22px"><b>${I(L.pro)}:</b> ${I(it.pro)}</div><div class="t-micro" style="margin-top:2px;font-size:22px"><b>${I(L.con)}:</b> ${I(it.con)}</div><div class="t-micro" style="margin-top:2px;font-size:22px"><b>${I(L.exc)}:</b> ${I(it.exc)}</div>`, 'smp-' + s);
      else h += card('right:40px;top:104px;width:560px;padding:8px 16px 10px', 'navy', `<div class="t-micro" style="color:var(--amberLt);font-size:22px"><b>${I('Useful language')}</b></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">${lang.map((x) => `<span class="chip navy" style="font-size:20px;padding:0 10px 2px;min-width:0">${I(x)}</span>`).join('')}</div>`, 'lang');
      h += `<div style="position:absolute;right:40px;bottom:30px;display:flex;gap:14px;align-items:flex-end;flex-direction:column"><div class="row">${toggle(S.sample[s], L.sample, 'sample', s)}</div>${btn(ph < 3 ? 'Next round' : (s < 3 ? 'Next statement' : 'Next chapter'), 'next', null, 'btn-coral sm')}</div>`;
      CH.demo(ctx, it.demo);
      return h;
    },
    acts: {
      sc(ctx, arg) { const [w, k, d] = arg.split(':'); const s = Math.floor(ctx.step / 4); const a = ctx.S.scale[s][w]; a[+k] = Math.max(0, a[+k] + (+d)); },
      sample(ctx, arg) { ctx.S.sample[arg] = !ctx.S.sample[arg]; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { const s = Math.floor(i / 4), ph = i % 4; const sc = ctx.S.scale[s]; if (ph === 1) { sc.b[3] += 2; sc.b[2] += 1; sc.b[1] += 1; } if (ph === 3) { sc.a[3] += 1; sc.a[2] += 2; sc.a[1] += 1; } }
  });
})(window);
