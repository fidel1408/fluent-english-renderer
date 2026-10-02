/* Fluent English - Love Speaking Club : chapters 1 - 3 */
(function (g) {
  'use strict';
  const LC = g.LC, I = g.I, CH = g.CH, V = g.V, Lesson = g.Lesson, Voice = g.Voice, Anim = g.Art.Anim;
  const { btn, card, chip, eyebrow, demo, dots, marks, toggle, support } = CH;

  /* =====================================================================
   * CHAPTER 1  Cinematic opening  (1 min, 0 speaking)
   * ===================================================================== */
  Lesson.register({
    id: 'opening', steps: 1,
    enter(ctx) { ctx.setStage(V.backdrop('night')); },
    onStep(ctx, i, o) {
      const S = ctx.S;
      if (S.done && !o.replay) { S.phase = 'q'; ctx.setStage(V.backdrop('night')); ctx.scrim('radial-gradient(ellipse at 50% 50%, rgba(7,14,34,.2), rgba(7,14,34,.7))'); return; }
      S.phase = 'seq'; S.done = false; ctx.scrim('none');
      const seq = V.opening; const each = 5500;
      seq.forEach((mk, k) => Anim.later(() => { if (ctx.S.phase !== 'seq') return; const st = mk(); ctx.setStage(st); st.run(); }, k * each));
      Anim.later(() => ctx.ch.finish(ctx), seq.length * each);
    },
    finish(ctx) {
      const S = ctx.S; S.phase = 'q'; S.done = true; ctx.setStage(V.backdrop('night'));
      ctx.scrim('radial-gradient(ellipse at 50% 50%, rgba(7,14,34,.2), rgba(7,14,34,.7))');
      ctx.say(['ch1.q']); ctx.refresh();
    },
    view(ctx) {
      const O = LC.OPENING, S = ctx.S;
      if (S.phase === 'q') {
        return card('left:110px;right:110px;top:200px;text-align:center;padding:34px 40px 38px', 'navy', `<div class="t-eyebrow">${I('Our big question')}</div><div class="t-hero" style="margin-top:12px;font-size:70px">${I(O.question)}</div>
          <div class="row center" style="margin-top:26px;gap:24px">${btn(O.replay, 'again', null, 'btn-ghost')}${btn(O.cont, 'next', null, 'btn-coral')}</div>`, 'q');
      }
      return `<div class="stagebar"><i style="width:100%;transition:width 22s linear"></i></div><div style="position:absolute;right:40px;bottom:36px">${btn('Skip to the question', 'skip', null, 'btn-ghost sm')}</div>`;
    },
    acts: {
      skip(ctx) { Anim.cancelAll(); ctx.ch.finish(ctx); return false; },
      again(ctx) { ctx.S.done = false; Lesson.replay(); return false; },
      next(ctx) { ctx.next(); return false; }
    }
  });

  /* =====================================================================
   * CHAPTER 2  Choose Your Side  (5 min, 4 speaking)
   * ===================================================================== */
  const W = LC.WARM;
  const warmScenes = ['cafe', 'park', 'balcony', 'apartment'];
  Lesson.register({
    id: 'warm', steps: 12,
    suggest(ctx, i) { const ph = i % 3; return ph === 1 ? 45 : (ph === 2 ? 45 : 0); },
    enter(ctx) {
      const S = ctx.S; S.counts = S.counts || W.prompts.map(() => ({ a: 0, b: 0, d: 0, p: 0 })); S.after = S.after || W.prompts.map(() => ({ k: 0, c: 0 }));
      S.alt = S.alt || W.prompts.map(() => false); S.stretch = S.stretch || {};
    },
    onStep(ctx, i, o) {
      const p = Math.floor(i / 3), ph = i % 3;
      if (ctx.sceneP !== p) { ctx.sceneP = p; ctx.setStage(V.backdrop(warmScenes[p])); }
      ctx.scrim('linear-gradient(180deg, rgba(7,14,34,.72), rgba(7,14,34,.5) 45%, rgba(7,14,34,.82))');
      ctx.discuss(ph > 0);
      if (!o.replay || true) {
        if (i === 0) ctx.say(['ch2.intro', 'ch2.q1']);
        else if (ph === 0) ctx.say(['ch2.q' + (p + 1)]);
        else if (ph === 2) ctx.say(['ch2.t' + (p + 1)]);
      }
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, p = Math.floor(i / 3), ph = i % 3, P = W.prompts[p], c = S.counts[p], a = S.after[p];
      const side = (k, label, cls, n, emb) => card(`${k === 'a' ? 'left:60px' : 'left:840px'};top:118px;width:700px;height:314px;padding:10px 30px`, '', `
        <div class="row" style="flex-wrap:nowrap;gap:20px;align-items:center"><div style="width:100px;height:100px;flex:0 0 auto" aria-hidden="true">${V.emblem(P.id + k)}</div>
        <div class="t-h2" style="font-size:${label.length > 16 ? 38 : 46}px;flex:1 1 auto;color:${k === 'a' ? 'var(--tealDk)' : 'var(--raspDk)'}">${I(label)}</div></div>
        <div class="row" style="margin-top:14px;min-height:54px;gap:8px">${marks(n, k === 'a' ? '' : 'b', 12)}</div>
        <div class="row" style="margin-top:12px;gap:12px">${btn('Add marker', 'mk', `${k}:1`, k === 'a' ? 'btn-teal xs' : 'btn-coral xs')}${btn('Remove marker', 'mk', `${k}:-1`, 'btn-ghost ivory xs')}<span class="count" style="margin-left:auto">${n}</span></div>`, `side-${p}-${k}`);
      let h = `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(p + 1, 'Prompt ' + (p + 1) + ' of 4')}</div>`;
      h += side('a', P.a, 'a', c.a) + side('b', P.b, 'b', c.b);
      h += `<div style="position:absolute;left:760px;top:238px;width:80px;height:80px;border-radius:50%;background:var(--amber);color:var(--ink);display:flex;align-items:center;justify-content:center;font:700 34px/1 var(--serif);box-shadow:0 8px 20px rgba(0,0,0,.4)" class="ormark" aria-hidden="true">${I('or')}</div>`;
      // middle row: pass / it depends / after-twist counters
      const mini = (title, k, cls, n, k2) => card(`left:${k}px;top:442px;width:${k2}px;height:112px;padding:6px 20px 8px`, 'navy', `<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span class="t-body"><b>${I(title)}</b></span><span class="row" style="gap:8px;flex-wrap:nowrap">${btn('Add', 'mk', cls + ':1', 'btn-amber xs', 'aria-label="Add a marker to ' + title + '"')}${btn('Remove', 'mk', cls + ':-1', 'btn-ghost xs', 'aria-label="Remove a marker from ' + title + '"')}</span></div><div class="row" style="margin-top:2px;gap:6px;min-height:40px">${marks(n, cls, 10)}</div>`, 'mini-' + cls);
      h += mini(W.labels.pass, 60, 'p', c.p, 390) + mini(W.labels.depends, 470, 'd', c.d, 560);
      if (ph === 2) {
        h += card('left:1050px;top:442px;width:490px;height:112px;padding:10px 22px', 'navy', `<div class="t-small"><b>${I('After the twist')}</b></div><div class="row" style="margin-top:6px;gap:12px;flex-wrap:nowrap">${btn('Kept', 'ak', 'k', 'btn-teal xs')}<b class="count" style="font-size:40px">${a.k}</b>${btn('Changed', 'ak', 'c', 'btn-coral xs')}<b class="count" style="font-size:40px">${a.c}</b></div>`, 'after');
      }
      // bottom band
      if (ph === 0) {
        h += card('left:60px;right:60px;top:566px;padding:10px 34px 12px', 'navy', `<div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start;gap:24px"><div class="grow stack" style="gap:8px"><div class="t-h3" style="font-size:34px"><b>${I('Choose a side, or say it depends and name the condition.')}</b></div><div class="t-small" style="font-size:24px;color:var(--amberLt)">${I(W.privacy)}</div></div>${btn('Continue', 'next', null, 'btn-coral')}</div>${CH.demo(ctx, P.demo, 'margin-top:10px')}`, 'bot0');
      } else if (ph === 1) {
        h += card('left:60px;right:60px;top:566px;padding:10px 30px 12px', 'navy', `<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:30px"><div class="grow stack" style="gap:8px"><div class="t-h3" style="font-size:30px">${I('Explain why.')} <span style="color:var(--amberLt)">${I(P.perspective)}</span></div>
          ${ctx.demo ? '' : `<div class="compact">${support(['I choose … because …', 'It depends on …', 'One reason is …'], true)}</div>`}${S.stretch[p] ? `<div class="t-small" style="color:var(--amberLt)"><b>${I(P.stretch)}</b></div>` : ''}${CH.demo(ctx, P.demo)}</div>
          <div class="stack" style="width:260px;gap:8px;align-items:stretch">${btn('Continue', 'next', null, 'btn-coral xs')}${toggle(S.stretch[p], 'Stretch challenge', 'stretch', p)}</div></div>`, 'bot1');
      } else {
        const tw = S.alt[p] ? P.twist2 : P.twist;
        h += card('left:60px;right:60px;top:566px;padding:10px 30px 12px', '', `<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:30px"><div class="grow stack" style="gap:6px"><div class="t-eyebrow">${I('A surprising follow-up')}</div><div class="t-h2" style="font-size:40px">${I(tw)}</div></div>
          <div class="stack" style="width:260px;gap:8px;align-items:stretch">${p < 3 ? btn('Next prompt', 'next', null, 'btn-coral xs') : btn('Next chapter', 'next', null, 'btn-coral xs')}${toggle(S.alt[p], 'Another twist', 'alt', p, true)}</div></div>`, 'bot2-' + p);
      }
      return h;
    },
    acts: {
      mk(ctx, arg) { const [k, d] = arg.split(':'); const p = Math.floor(ctx.step / 3); const c = ctx.S.counts[p]; c[k] = Math.max(0, c[k] + (+d)); },
      ak(ctx, arg) { const p = Math.floor(ctx.step / 3); const a = ctx.S.after[p]; a[arg] += 1; },
      alt(ctx, arg) { const p = +arg; ctx.S.alt[p] = !ctx.S.alt[p]; },
      stretch(ctx, arg) { ctx.S.stretch[arg] = !ctx.S.stretch[arg]; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { const p = Math.floor(i / 3), ph = i % 3; if (ph === 0) { const c = ctx.S.counts[p]; c.a += 2; c.b += 2; c.d += 1; } }
  });

  /* =====================================================================
   * CHAPTER 3  Words That Change the Conversation  (6 min, 4 speaking)
   * ===================================================================== */
  const WD = LC.WORDS;
  Lesson.register({
    id: 'words', steps: 15,
    suggest(ctx, i) { const ph = i % 3; return ph === 2 ? 60 : 0; },
    enter(ctx) { const S = ctx.S; S.played = S.played || {}; S.pick = S.pick || {}; S.alt = S.alt || {}; S.stretch = S.stretch || {}; },
    onStep(ctx, i, o) {
      const w = Math.floor(i / 3), ph = i % 3, it = WD.items[w];
      if (ctx.curWord !== w || o.replay) {
        ctx.curWord = w; const sc = V.word(it.id); ctx.setStage(sc.stage); ctx.scene = sc;
        sc.bind();
        if (ctx.S.played[it.id] && !o.replay) sc.freeze();
      }
      ctx.scrim(ph === 0 ? 'linear-gradient(180deg, rgba(7,14,34,.55), rgba(7,14,34,0) 24%, rgba(7,14,34,0) 62%, rgba(7,14,34,.7))' : 'linear-gradient(180deg, rgba(7,14,34,.78), rgba(7,14,34,.82))');
      ctx.discuss(ph === 2);
      ctx.stage.layers.actors.style.cssText = (ph === 0 ? 'transition:opacity .5s;opacity:1' : 'transition:none;opacity:0');
      if (i === 0 && !o.replay) ctx.say(['ch3.intro']);
      if (o.replay && ph === 0) { ctx.S.played[it.id] = true; ctx.scene.play(() => ctx.refresh()); }
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, w = Math.floor(i / 3), ph = i % 3, it = WD.items[w], L = WD.labels;
      const played = !!S.played[it.id], pick = S.pick[it.id];
      let h = `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(w + 1, 'Word ' + (w + 1) + ' of 5')}</div>`;
      if (ph === 0) {
        h += card('left:180px;right:180px;top:96px;padding:8px 30px 12px', 'navy', `<div class="row" style="flex-wrap:nowrap;justify-content:center;gap:26px;align-items:center"><div class="t-hero" style="font-size:${it.w.length > 12 ? 54 : 74}px;text-align:center">${I(it.w)}</div><div class="stack" style="gap:10px;align-items:center">${chip(it.pos, 'navy')}</div>${!played ? btn(L.show, 'play', null, 'btn-coral') : btn(L.replay, 'play', null, 'btn-ghost sm')}</div>`, 'w0-' + w);
        if (played) h += card('left:130px;right:130px;top:724px;padding:8px 30px 10px;text-align:center', '', `<div class="t-h3" style="font-size:34px">${I(it.ex)}</div>`, 'ex-' + w + (played ? 'p' : ''));
      } else if (ph === 1) {
        const fb = pick !== undefined ? (pick === it.check.ok ? 'good' : 'no') : null;
        const rel = (cls, inner, k) => card('position:relative', cls, inner, k);
        const fbCard = fb ? rel(fb === 'good' ? 'tint' : '', `<div class="t-h3" style="font-size:32px;color:${fb === 'good' ? 'var(--tealDk)' : 'var(--raspDk)'}">${I(fb === 'good' ? L.right : L.notYet)}</div><div class="t-small" style="margin-top:4px;font-size:26px">${I(it.check.why)}</div>${fb === 'no' ? `<div class="t-micro" style="margin-top:6px;color:#3C2A5C;font-size:22px">${I('The best match is shown in teal.')}</div>` : ''}`, 'fb-' + w + fb) : '';
        h += `<div style="position:absolute;left:60px;top:112px;width:690px;display:flex;flex-direction:column;gap:12px">${rel('', `<div class="row" style="gap:12px"><div class="t-h1" style="font-size:48px;color:var(--rasp)">${I(it.w)}</div><span class="t-micro" style="color:#3C2A5C">${I(it.pos)}</span></div><div class="t-small" style="font-size:30px">${I(it.def)}</div><div class="hr" style="margin:12px 0"></div><div class="t-small" style="color:#3C2A5C;font-size:25px">${I(it.note)}</div>`, 'def-' + w)}${fbCard}</div>`;
        h += `<div style="position:absolute;left:790px;right:60px;top:112px;display:flex;flex-direction:column;gap:12px">${rel('navy', `<div class="t-eyebrow">${I(L.check)}</div><div class="t-h3" style="margin:4px 0 8px;font-size:32px">${I(it.check.q)}</div><div class="stack" style="gap:8px">${it.check.opts.map((o, k) => `<button class="btn ${pick === k ? (k === it.check.ok ? 'btn-teal' : 'btn-rasp') : (pick !== undefined && k === it.check.ok ? 'btn-teal' : 'btn-ivory')}" style="justify-content:flex-start;text-align:left;font-size:24px;min-height:0;padding:4px 14px 6px" data-act="pick" data-arg="${k}" type="button">${I(o)}</button>`).join('')}</div>`, 'chk-' + w)}</div>`;
        h += `<div style="position:absolute;right:60px;bottom:30px;display:flex">${btn('Talk about it', 'next', null, 'btn-coral')}</div>`;
      } else {
        const q = S.alt[it.id] ? it.talk2 : it.talk;
        h += card('left:110px;right:110px;top:170px;padding:34px 44px 38px', '', `<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div class="t-eyebrow">${I(L.talk)}</div><span class="chip">${I(it.w)}</span></div><div class="t-hero" style="font-size:66px;margin-top:12px">${I(q)}</div>
          ${S.stretch[it.id] ? `<div class="t-body" style="margin-top:20px;color:var(--rasp)"><b>${I(it.stretch)}</b></div>` : ''}${CH.demo(ctx, it.demo, 'margin-top:20px')}
          <div class="row" style="margin-top:24px;gap:16px">${toggle(S.alt[it.id], L.talk2, 'alt', it.id, true)}${toggle(S.stretch[it.id], 'Stretch challenge', 'stretch', it.id, true)}<span class="grow"></span>${btn(w < 4 ? L.next : 'Next chapter', 'next', null, 'btn-coral')}</div>`, 'talk-' + w);
        h += `<div style="position:absolute;left:110px;right:110px;top:742px">${support(['I think … because …', 'For example, …', 'It depends on …', 'In my experience, …'], true)}</div>`;
      }
      h += `<div style="position:absolute;right:36px;top:112px"></div>`;
      return h;
    },
    acts: {
      play(ctx) { const it = WD.items[Math.floor(ctx.step / 3)]; ctx.S.played[it.id] = true; Voice.stop(); Anim.cancelAll(); Anim.resume(); ctx.scene.reset(); ctx.scene.play(() => ctx.refresh()); },
      pick(ctx, arg) { const it = WD.items[Math.floor(ctx.step / 3)]; ctx.S.pick[it.id] = +arg; },
      alt(ctx, arg) { ctx.S.alt[arg] = !ctx.S.alt[arg]; },
      stretch(ctx, arg) { ctx.S.stretch[arg] = !ctx.S.stretch[arg]; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { const w = Math.floor(i / 3), ph = i % 3, it = WD.items[w]; if (ph === 1) ctx.S.pick[it.id] = it.check.ok; }
  });
})(window);
