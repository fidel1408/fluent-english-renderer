/* Fluent English - Love Speaking Club : chapters 6 - 7 */
(function (g) {
  'use strict';
  const LC = g.LC, I = g.I, CH = g.CH, V = g.V, Lesson = g.Lesson, Voice = g.Voice, Anim = g.Art.Anim;
  const { btn, card, chip, eyebrow, toggle, support, marks } = CH;
  const sum = (a) => a.reduce((x, y) => x + y, 0);

  /* =====================================================================
   * CHAPTER 6  Build Your Relationship Priorities  (7 min, 5 speaking)
   * steps: 0 set-up, 1 proposals, 2 group decision, 3 new circumstance, 4 redistribute, 5 compare
   * ===================================================================== */
  const T = LC.TOKENS, Q = T.qualities;
  const coin = (cls, extra) => `<span class="coin ${cls || ''}" ${extra || ''}></span>`;
  Lesson.register({
    id: 'tokens', steps: 6,
    suggest(ctx, i) { return [0, 90, 90, 0, 120, 60][i]; },
    enter(ctx) {
      const S = ctx.S; S.A = S.A || [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; S.pi = S.pi || 0; S.G = S.G || [0, 0, 0, 0]; S.first = S.first || null; S.H = S.H || [0, 0, 0, 0]; S.circ = !!S.circ;
      ctx.setStage(V.backdrop('apartment'));
      // optional pointer dragging (accessible click controls always work)
      let drag = null;
      const down = (e) => {
        const c = e.target.closest('[data-drag]'); if (!c || !ctx.ch.editable(ctx)) return;
        const rect = c.getBoundingClientRect(); const ghost = document.createElement('div'); ghost.className = 'coin dragging'; ghost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;z-index:99;pointer-events:none`;
        document.body.appendChild(ghost); drag = { src: c.dataset.drag, ghost, w: rect.width / 2 }; c.setPointerCapture && c.setPointerCapture(e.pointerId); e.preventDefault();
      };
      const move = (e) => { if (!drag) return; drag.ghost.style.left = (e.clientX - drag.w) + 'px'; drag.ghost.style.top = (e.clientY - drag.w) + 'px'; };
      const up = (e) => {
        if (!drag) return; drag.ghost.remove(); const t = document.elementFromPoint(e.clientX, e.clientY); const dst = t && t.closest('[data-drop]'); const src = drag.src; drag = null;
        if (!dst) return; const a = ctx.ch.cur(ctx); const sk = src === 'tray' ? -1 : +src.split(':')[1], dk = dst.dataset.drop === 'tray' ? -1 : +dst.dataset.drop;
        if (sk === dk) return; if (sk >= 0 && a[sk] > 0) a[sk]--; else if (sk >= 0) return;
        if (dk >= 0) { if (sum(a) < 10) a[dk]++; else if (sk >= 0) a[sk]++; }
        ctx.refresh();
      };
      ctx.el.addEventListener('pointerdown', down); document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
      ctx.onLeave(() => { ctx.el.removeEventListener('pointerdown', down); document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); });
    },
    editable(ctx) { return [1, 2, 4, 5].includes(ctx.step); },
    cur(ctx) { const S = ctx.S; return ctx.step === 1 ? S.A[S.pi] : (ctx.step === 2 || ctx.step === 3 ? S.G : S.H); },
    onStep(ctx, i, o) {
      const S = ctx.S;
      if (i === 4 && sum(S.H) === 0 && S.first) S.H = S.first.slice();
      ctx.scrim('linear-gradient(180deg, rgba(7,14,34,.82), rgba(7,14,34,.78))');
      ctx.discuss(i === 1 || i === 2 || i === 4 || i === 5);
      if (i === 0) ctx.say(['ch6.intro']);
      if (i === 3 && S.circ && o.replay) ctx.say(['ch6.circ']);
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, L = T.labels; const arr = i === 0 ? [0, 0, 0, 0] : ctx.ch.cur(ctx); const left = 10 - sum(arr);
      const ghost = (i === 4 || i === 5) && S.first ? S.first : (i === 2 && S.first ? S.first : null);
      const edit = ctx.ch.editable(ctx);
      let h = `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(i + 1, ['Set up', 'Propose', 'Decide', 'A change', 'Redistribute', 'Compare'][i])}</div>`;
      if (i === 3) {
        h += card('left:50px;top:110px;width:520px;padding:18px 26px 22px', 'navy', `<div class="t-eyebrow">${I(L.first)}</div><div class="stack" style="gap:8px;margin-top:10px">${Q.map((q, k) => `<div class="row" style="flex-wrap:nowrap;justify-content:space-between"><span class="t-small">${I(q.w)}</span><span class="row" style="gap:4px;flex-wrap:nowrap">${Array.from({ length: (S.first || S.G)[k] }, () => coin('sm')).join('')}</span></div>`).join('')}</div>`, 'g3');
        if (!S.circ) h += `<div style="position:absolute;left:600px;right:60px;top:300px;display:flex;justify-content:center">${btn(L.reveal, 'circ', null, 'btn-coral')}</div>`;
        else {
          h += card('left:600px;right:50px;top:110px;padding:24px 34px 28px', '', `<div class="t-eyebrow">${I('New circumstance')}</div><div class="t-h2" style="margin-top:8px;font-size:44px">${I(T.circ)}</div>${V.twoCities()}`, 'circ');
          h += `<div style="position:absolute;left:50px;right:50px;bottom:34px" class="row"><span class="grow t-body"><b>${I(T.ask3)}</b></span>${btn('Redistribute', 'next', null, 'btn-coral')}</div>`;
        }
        return h;
      }
      // jars
      h += Q.map((q, k) => {
        const n = arr[k], gh = ghost ? ghost[k] : null, d = gh === null ? 0 : n - gh;
        return card(`left:${45 + k * 390}px;top:100px;width:360px;height:424px;padding:12px 18px 10px`, '', `
        <div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start;min-height:150px"><div><div class="t-h3" style="font-size:${q.w.length > 10 ? 25 : 30}px">${I(q.w)}</div><div class="t-micro" style="color:#3C2A5C;font-size:20px">${I(q.hint)}</div></div><div class="count" style="font-size:58px;color:var(--rasp)">${n}</div></div>
        <div class="jar" data-drop="${k}" role="img" aria-label="${q.w} ${n} tokens">${Array.from({ length: n }, () => coin('', `data-drag="jar:${k}"`)).join('')}</div>
        ${gh !== null ? `<div class="row" style="margin-top:8px;gap:6px;flex-wrap:nowrap;min-height:34px"><span class="t-micro">${I('First')}:</span>${Array.from({ length: gh }, () => coin('sm ghost')).join('')}${d ? `<b class="t-small" style="margin-left:auto;color:${d > 0 ? 'var(--tealDk)' : 'var(--raspDk)'}">${d > 0 ? '▲ +' + d : '▼ ' + d}</b>` : ''}</div>` : ''}
        <div class="row center" style="margin-top:10px;gap:12px;flex-wrap:nowrap">${edit ? `${btn(L.plus, 'tok', k + ':1', 'btn-teal xs', (left <= 0 ? 'disabled ' : '') + 'aria-label="Add a token to ' + q.w + '"')}${btn(L.minus, 'tok', k + ':-1', 'btn-ghost ivory xs', (n <= 0 ? 'disabled ' : '') + 'aria-label="Take a token from ' + q.w + '"')}` : ''}</div>`, `jar-${i}-${k}`);
      }).join('');
      // tray
      h += card('left:45px;top:536px;width:1510px;padding:6px 26px 8px', 'navy', `<div class="row" style="flex-wrap:nowrap;gap:24px;align-items:center"><div class="t-body" style="min-width:300px"><b class="num" style="font-size:44px;color:var(--amberLt)">${left}</b> ${I(L.left)}</div><div class="tray" data-drop="tray" aria-label="tray">${Array.from({ length: left }, () => coin('', 'data-drag="tray"')).join('')}</div>${left === 0 ? `<b class="t-small" style="color:var(--tealLt)">${I(L.full)}</b>` : ''}</div>`, 'tray');
      // bottom band
      if (i === 0) {
        h += card('left:45px;right:45px;top:622px;padding:8px 24px 10px', '', `<div class="row" style="flex-wrap:nowrap;gap:24px"><div class="grow"><div class="t-h3" style="font-size:38px">${I(T.intro)}</div><div class="t-small" style="margin-top:6px;color:#3C2A5C">${I(T.disclaimer)}</div></div>${btn('Start proposals', 'next', null, 'btn-coral')}</div>`, 'b0');
      } else if (i === 1) {
        h += card('left:45px;right:45px;top:622px;padding:8px 24px 10px', '', `<div class="row" style="flex-wrap:nowrap;gap:20px;align-items:flex-start"><div class="grow stack" style="gap:8px"><div class="t-h3" style="font-size:28px">${I(T.ask1)}</div><div class="row compact" style="gap:10px">${[0, 1, 2].map((k) => `<button class="btn ${S.pi === k ? 'btn-amber' : 'btn-ghost ivory'} xs" data-act="prop" data-arg="${k}" aria-pressed="${S.pi === k}" type="button">${I(L.proposal)} ${k + 1} <span class="num">(${sum(S.A[k])})</span></button>`).join('')}${support(['I gave … more because …', 'I gave up … to give more to …'])}</div></div>${btn('Decide together', 'next', null, 'btn-coral sm')}</div>`, 'b1');
      } else if (i === 2) {
        h += card('left:45px;right:45px;top:622px;padding:8px 24px 10px', '', `<div class="row" style="flex-wrap:nowrap;gap:20px;align-items:flex-start"><div class="grow stack" style="gap:8px"><div class="t-h3" style="font-size:28px">${I(T.ask2)}</div><div class="row compact" style="gap:10px">${[0, 1, 2].map((k) => `<button class="btn btn-ghost ivory xs" data-act="fromProp" data-arg="${k}" type="button">${I('Start from')} ${I(L.proposal)} ${k + 1}</button>`).join('')}${support(['Could we compromise by …?', 'I am willing to … if …', 'What if we …?'])}</div></div>
          <div class="stack" style="gap:6px;align-items:stretch;width:300px">${S.first && sum(S.first) === 10 && S.first.join() === S.G.join() ? `<b class="t-micro" style="color:var(--tealDk)">${I(L.locked)}</b>` : ''}<div class="row" style="flex-wrap:nowrap;gap:8px">${btn(L.lock, 'lock', null, 'btn-teal xs', sum(S.G) === 10 ? '' : 'disabled')}${btn('Next', 'next', null, 'btn-coral xs', S.first ? '' : 'disabled')}</div></div></div>`, 'b2');
      } else if (i === 4) {
        h += card('left:45px;right:45px;top:622px;padding:8px 24px 10px', '', `<div class="row" style="flex-wrap:nowrap;gap:20px;align-items:flex-start"><div class="grow stack" style="gap:8px"><div class="t-h3" style="font-size:28px">${I(T.ask3)}</div><div class="row compact" style="gap:10px">${btn(L.copy, 'fromFirst', null, 'btn-ghost ivory xs')}${btn(L.reset, 'clear', null, 'btn-ghost ivory xs')}${support(['I would move a token from … to … because …', 'Now … matters more because …'])}</div></div>${btn('Compare', 'next', null, 'btn-coral sm')}</div>`, 'b4');
      } else {
        h += card('left:45px;right:45px;top:622px;padding:8px 24px 10px', '', `<div class="row" style="flex-wrap:nowrap;gap:20px;align-items:flex-start"><div class="grow stack" style="gap:6px"><div class="t-h3" style="font-size:28px">${I(T.ask4)}</div><div class="t-small" style="font-size:26px">${I(T.ask5)}</div></div>${btn('Next chapter', 'next', null, 'btn-coral sm')}</div>`, 'b5');
        h += CH.demo(ctx, T.demo, 'position:absolute;right:50px;top:50px;width:700px;padding:6px 16px 8px');
      }
      if (i >= 1) h += `<div style="position:absolute;left:45px;right:45px;bottom:4px;text-align:center;color:var(--amberLt);font:600 19px/1.0 var(--sans)">${I(T.disclaimer)}</div>`;
      return h;
    },
    acts: {
      tok(ctx, arg) { const [k, d] = arg.split(':').map(Number); const a = ctx.ch.cur(ctx); if (d > 0 && sum(a) >= 10) return false; if (d < 0 && a[k] <= 0) return false; a[k] += d; },
      prop(ctx, arg) { ctx.S.pi = +arg; },
      fromProp(ctx, arg) { ctx.S.G = ctx.S.A[+arg].slice(); },
      lock(ctx) { if (sum(ctx.S.G) === 10) ctx.S.first = ctx.S.G.slice(); },
      circ(ctx) { ctx.S.circ = true; ctx.say(['ch6.circ']); },
      fromFirst(ctx) { if (ctx.S.first) ctx.S.H = ctx.S.first.slice(); },
      clear(ctx) { ctx.S.H = [0, 0, 0, 0]; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { const S = ctx.S; if (i === 1) S.A[0] = [4, 2, 1, 3]; if (i === 2) { S.G = [4, 2, 1, 3]; S.first = S.G.slice(); } if (i === 3) S.circ = true; if (i === 4) S.H = [3, 1, 1, 5]; }
  });

  /* =====================================================================
   * CHAPTER 7  What Would Change Your Mind?  (8 min, 6 speaking)
   * steps: 3 cases x 3 phases (position, evidence + reconsider, questions)
   * ===================================================================== */
  const C = LC.CASES, EV = ['duration', 'plans', 'practical', 'prefs'];
  Lesson.register({
    id: 'cases', steps: 9,
    suggest(ctx, i) { return [60, 90, 60][i % 3]; },
    enter(ctx) { const S = ctx.S; S.pos = S.pos || C.items.map(() => [0, 0, 0]); S.ev = S.ev || C.items.map(() => ({})); S.after = S.after || C.items.map(() => ({ k: 0, c: 0 })); S.stretch = S.stretch || {}; },
    onStep(ctx, i, o) {
      const c = Math.floor(i / 3), ph = i % 3;
      if (ctx.curC !== c || o.replay) { ctx.curC = c; ctx.setStage(V.caseScene(c)); }
      ctx.scrim(ph === 0 ? 'linear-gradient(180deg, rgba(7,14,34,.55), rgba(7,14,34,0) 36%)' : 'linear-gradient(180deg, rgba(7,14,34,.82), rgba(7,14,34,.84))');
      ctx.stage.layers.actors.style.cssText = ph === 0 ? '' : 'opacity:0';
      ctx.discuss(ph > 0);
      if (i === 0) ctx.say(['ch7.intro']);
    },
    view(ctx) {
      const S = ctx.S, i = ctx.step, c = Math.floor(i / 3), ph = i % 3, it = C.items[c], L = C.labels;
      let h = `<div style="position:absolute;left:250px;top:42px;right:520px">${eyebrow(c + 1, 'Case ' + (c + 1) + ' of 3')}</div>`;
      if (ph === 0) {
        h += card('left:50px;top:108px;width:720px;padding:22px 30px 26px', '', `<div class="t-h1" style="font-size:50px">${I(it.title)}</div><div class="t-body" style="margin-top:12px">${I(it.setup)}</div>`, 'c0-' + c);
        h += card('left:810px;top:108px;width:740px;padding:18px 24px 20px', 'navy', `<div class="t-eyebrow">${I(L.choose)}</div><div class="stack" style="gap:10px;margin-top:10px">${it.positions.map((p, k) => `<div class="row" style="flex-wrap:nowrap;gap:12px;align-items:center;background:rgba(255,255,255,.08);border-radius:18px;padding:8px 14px"><div class="grow t-small" style="font-size:29px">${I(p)}</div><span class="row" style="gap:4px;flex-wrap:nowrap;min-width:60px">${marks(S.pos[c][k], k === 0 ? '' : (k === 1 ? 'b' : 'd'), 6)}</span><button class="btn btn-teal xs" style="min-height:44px;padding:0 12px" data-act="pos" data-arg="${k}:1" aria-label="Add a marker" type="button">+</button><button class="btn btn-ghost xs" style="min-height:44px;padding:0 12px" data-act="pos" data-arg="${k}:-1" aria-label="Remove a marker" type="button">−</button></div>`).join('')}</div>`, 'pos-' + c);
        h += `<div style="position:absolute;left:50px;right:50px;bottom:28px" class="row">${support(['I would choose … because …', 'If …, I would …'], true)}<span class="grow"></span>${btn('Find the detail', 'next', null, 'btn-coral')}</div>`;
        h += CH.demo(ctx, it.demo, 'position:absolute;left:50px;top:430px;width:820px;padding:8px 18px 10px');
      } else if (ph === 1) {
        h += card('left:50px;right:50px;top:106px;padding:14px 26px 18px', 'navy', `<div class="t-eyebrow">${I(L.evidence)}</div><div class="row" style="margin-top:10px;gap:14px;flex-wrap:nowrap">${EV.map((k) => `<button class="btn ${S.ev[c][k] ? 'btn-ghost' : 'btn-amber'}" style="flex:1 1 0;font-size:25px;min-height:64px;padding:4px 10px 6px" data-act="ev" data-arg="${k}" aria-pressed="${!!S.ev[c][k]}" type="button">${I(C.evidenceNames[k])}</button>`).join('')}</div>`, 'evb-' + c);
        const shown = EV.filter((k) => S.ev[c][k]);
        h += `<div style="position:absolute;left:50px;right:50px;top:290px;display:grid;grid-template-columns:1fr 1fr;gap:14px">${shown.map((k) => card('position:relative;padding:10px 22px 12px', '', `<div class="t-eyebrow">${I(C.evidenceNames[k])}</div><div class="t-body" style="margin-top:4px;font-size:27px">${I(it.ev[k])}</div>`, `evc-${c}-${k}`)).join('')}</div>`;
        h += card('left:50px;right:50px;top:742px;padding:8px 26px 10px', 'navy', `<div class="row" style="flex-wrap:nowrap;gap:20px;align-items:center"><div class="t-h3 grow" style="font-size:30px">${I(L.reconsider)}</div><span class="t-small">${I(L.kept)}</span><button class="btn btn-teal xs" data-act="af" data-arg="k" type="button">${I('Add')}</button><b class="count" style="font-size:44px">${S.after[c].k}</b><span class="t-small">${I(L.changed)}</span><button class="btn btn-coral xs" data-act="af" data-arg="c" type="button">${I('Add')}</button><b class="count" style="font-size:44px">${S.after[c].c}</b>${btn('Questions', 'next', null, 'btn-coral sm')}</div>`, 'rec-' + c);
        h += CH.demo(ctx, shown.length ? it.demo : '', 'position:absolute;left:50px;top:560px;width:1000px;padding:6px 16px 8px');
      } else {
        h += `<div style="position:absolute;left:100px;right:100px;top:112px" class="stack" >${C.questions.map((q, k) => card('position:relative;padding:20px 34px 24px', k === 0 ? '' : 'tint', `<div class="t-h2" style="font-size:46px">${I(q)}</div>`, `q-${c}-${k}`)).join('')}</div>`;
        h += card('left:100px;right:100px;top:640px;padding:14px 30px 16px', 'navy', `<div class="row" style="flex-wrap:nowrap;gap:24px;align-items:flex-start"><div class="grow stack" style="gap:6px"><div class="t-small"><b>${I(C.grammar)}</b></div>${S.stretch[c] ? `<div class="t-small" style="color:var(--amberLt)"><b>${I(L.stretch)}</b></div>` : ''}</div><div class="stack" style="width:300px;gap:8px;align-items:stretch">${toggle(S.stretch[c], 'Stretch challenge', 'stretch', c)}${btn(c < 2 ? L.nextCase : 'Next chapter', 'next', null, 'btn-coral xs')}</div></div>`, 'g-' + c);
      }
      return h;
    },
    acts: {
      pos(ctx, arg) { const [k, d] = arg.split(':').map(Number); const c = Math.floor(ctx.step / 3); const a = ctx.S.pos[c]; a[k] = Math.max(0, a[k] + d); },
      ev(ctx, arg) { const c = Math.floor(ctx.step / 3); ctx.S.ev[c][arg] = !ctx.S.ev[c][arg]; },
      af(ctx, arg) { const c = Math.floor(ctx.step / 3); ctx.S.after[c][arg] += 1; },
      stretch(ctx, arg) { ctx.S.stretch[arg] = !ctx.S.stretch[arg]; },
      next(ctx) { ctx.next(); return false; }
    },
    demoAct(ctx, i) { const c = Math.floor(i / 3), ph = i % 3; if (ph === 0) { ctx.S.pos[c][0] += 2; ctx.S.pos[c][1] += 1; } if (ph === 1) { ctx.S.ev[c].duration = true; ctx.S.ev[c].plans = true; } }
  });
})(window);
