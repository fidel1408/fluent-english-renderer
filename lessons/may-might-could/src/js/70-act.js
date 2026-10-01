/* 70-act: interactive activities with genuine validation and meaningful feedback */
(function () {
  'use strict';
  const FE = window.FE, { h } = FE, A = FE.Audio;
  const ACT = (FE.ACT = {});
  const U = FE.U;

  /* ---------- small rule-based form checker (NOT an AI/meaning assessor) ---------- */
  const BASE = 'arrive come be help rain leave start happen finish call wait stay work take win cancel change delay forget need run move close open cost get go have see know say think try bring send meet reach miss lose snow clear improve stop begin join'.split(' ');
  const S3 = {}; BASE.forEach((v) => { const s = v === 'have' ? 'has' : v === 'go' ? 'goes' : v.endsWith('y') && !/[aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : /(s|sh|ch|x)$/.test(v) ? v + 'es' : v + 's'; S3[s] = v; });
  Object.assign(S3, { is: 'be', are: 'be', am: 'be', was: 'be', were: 'be', does: 'do', did: 'do' });
  const G = (FE.G = {
    MODAL: ['may', 'might', 'could'],
    check(sent) {
      const w = sent.toLowerCase().replace(/[“”"]/g, '').replace(/[.,!?;]/g, ' ').replace(/’/g, "'").split(/\s+/).filter(Boolean);
      const out = [];
      const mi = w.findIndex((x) => ['may', 'might', 'could', "couldn't", 'couldnt'].includes(x));
      if (mi < 0) return [{ k: 'none', msg: 'No may, might, or could found.' }];
      const m = w[mi];
      if (m === "couldn't" || m === 'couldnt') out.push({ k: 'couldnt', msg: "couldn't usually means inability or impossibility. For an uncertain negative, use may not or might not." });
      const prev = w.slice(Math.max(0, mi - 2), mi);
      if (prev.some((x) => ['do', 'does', 'did', "don't", "doesn't", "didn't"].includes(x)) && !(w[mi - 3] === 'you' && false)) {
        const think = w.slice(0, mi).some((x) => ['think', 'know', 'believe'].includes(x));
        if (!think) out.push({ k: 'aux', msg: 'Do, does, or did is not used with may, might, or could. Put the modal first: Could she come?' });
      }
      if (['will', 'can', 'must', 'should', 'would'].includes(w[mi - 1])) out.push({ k: 'two', msg: 'Use only one modal here.' });
      let j = mi + 1;
      // question: modal + subject + base verb → skip a subject
      if (mi === 0 || ['what', 'where', 'when', 'who', 'how', 'why'].includes(w[mi - 1])) { if (w[j] && !['not'].includes(w[j]) && !BASE.includes(w[j]) && !S3[w[j]] && w[j] !== 'to') j++; }
      if (w[j] === 'not') j++;
      const nx = w[j];
      if (nx === 'to') out.push({ k: 'to', msg: 'No “to” after may, might, or could: she might arrive, not she might to arrive.' });
      else if (nx && S3[nx]) out.push({ k: 's', msg: S3[nx] === 'be' ? 'After a modal, use be: she might be late.' : `After a modal, use the base verb “${S3[nx]}”. Do not add an ending.` });
      else if (nx && /(ing|ed)$/.test(nx) && BASE.includes(nx.replace(/(ing|ed)$/, '')) ) out.push({ k: 'ing', msg: 'After a modal, use the base verb. Do not add an ending.' });
      if (!nx) out.push({ k: 'short', msg: 'The sentence stops after the modal. Add a base verb, for example: might arrive.' });
      return out;
    },
  });

  /* ---------- frame helpers ---------- */
  const ib = (label, id, icon, cls = '') => `<button class="btn ${cls}" data-do="${id}">${icon ? `<span class="bi">${icon}</span>` : ''}${U(label)}</button>`;
  const frame = (spec, body, foot, tag) => `<div class="ah"><span class="tag">${U(tag || spec.tag || 'Your turn')}</span>${spec.title ? `<span class="atl">${U(spec.title)}</span>` : ''}</div>${body}<div class="afoot">${foot}</div>`;
  const I = { hint: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 21h6M10 17h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>', eye: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>', check: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>', next: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>', play: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>', redo: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>' };
  const BOX = { x: 960, y: 140, w: 900 };

  /* base class */
  class Base {
    constructor(seg, X) {
      this.seg = seg; this.X = X; this.spec = seg.act; this.R = X.R;
      this.st = FE.L.store[seg.id] || (FE.L.store[seg.id] = {});
      const b = Object.assign({}, BOX, this.spec.box || {});
      this.el = h('div', { class: 'card actp', id: 'fx_act', role: 'group', 'aria-label': 'activity' });
      this.el.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;${b.h ? 'height:' + b.h + 'px;' : ''}`;
      FE.$('#fx').appendChild(this.el);
      this.el.addEventListener('click', (e) => { const t = e.target.closest('[data-do],[data-opt]'); if (t) this.onClick(t, e); });
      this.render();
      if (FE.Tween.instant) this.el.classList.add('in', 'noanim'); else requestAnimationFrame(() => this.el.classList.add('in'));
    }
    destroy() { this.el.remove(); }
    onClick() { /* subclass */ }
    render() { /* subclass */ }
    tick() { /* subclass (demo auto-play) */ }
  }

  /* ---------- quiz: one or more items, single/multi answer, fair to overlapping answers ---------- */
  class Quiz extends Base {
    render() {
      const st = this.st; st.i = st.i || 0; st.sel = st.sel || {}; st.done = st.done || {}; st.hint = st.hint || {};
      this.draw();
    }
    item() { return this.spec.items[this.st.i]; }
    draw() {
      const st = this.st, it = this.item(), n = this.spec.items.length, sel = st.sel[st.i] || [], done = st.done[st.i];
      const multi = it.multi || it.opts.filter((o) => o.ok).length > 1;
      const ctx = it.ctx ? `<div class="qctx">${it.ctx.icon ? FE.icon(it.ctx.icon, 70) : ''}<span class="ub sm">${U(it.ctx.text)}</span></div>` : '';
      const bad = it.bad ? `<div class="qbad"><span class="tag bad">${U('Error')}</span><span class="ub mid">${U(it.bad)}</span></div>` : '';
      const opts = it.opts.map((o, k) => {
        let c = 'opt'; const on = sel.includes(k);
        if (done) { if (o.ok && on) c += ' right'; else if (!o.ok && on) c += ' wrong'; else if (o.ok && !on) c += (it.multi || multi) ? ' missed' : ' right'; }
        else if (on) c += ' sel';
        const mk = done ? (o.ok && (on || !multi) ? '✓' : !o.ok && on ? '✗' : o.ok ? '+' : '') : (on ? '✓' : '');
        return `<button class="${c}" data-opt="${k}" aria-pressed="${on}"><span class="mk" aria-hidden="true">${mk}</span><span class="ub sm">${U(o.t)}</span></button>`;
      }).join('');
      const fb = st.fb && st.fb[st.i] ? `<div class="fb ${st.fb[st.i].ok ? 'ok' : 'no'}" role="status">${st.fb[st.i].html}</div>` : '';
      const hint = st.hint[st.i] && it.hint ? `<div class="fb">${I.hint}<span class="ub sm" style="margin-left:8px">${U(it.hint)}</span></div>` : '';
      const dots = n > 1 ? `<div class="dots">${this.spec.items.map((_, k) => `<i class="${k === st.i ? 'cur' : st.done[k] ? 'dn' : ''}"></i>`).join('')}</div>` : '';
      const foot = [it.hint && !done ? ib('Hint', 'hint', I.hint) : '', !done ? (multi ? ib('Check', 'check', I.check, 'gold') : '') + ib('Show answer', 'reveal', I.eye) : '', done && st.i < n - 1 ? ib('Next question', 'nextq', I.next, 'gold') : '', done && this.spec.noScore !== true && it.expl ? '' : ''].join('');
      this.el.innerHTML = frame(this.spec, `${dots}${ctx}${bad}<div class="qq ub mid">${U(it.q)}</div>${multi ? `<div class="note">${U(this.spec.multiNote || 'Choose all that fit.')}</div>` : ''}<div class="opts">${opts}</div>${hint}${fb}`, foot);
    }
    onClick(t) {
      const st = this.st, it = this.item(), i = st.i;
      const multi = it.multi || it.opts.filter((o) => o.ok).length > 1;
      if (t.dataset.opt != null) {
        if (st.done[i]) return;
        const k = +t.dataset.opt; const sel = (st.sel[i] = st.sel[i] || []);
        if (multi) { const p = sel.indexOf(k); if (p >= 0) sel.splice(p, 1); else sel.push(k); A.sfx('pop'); this.draw(); }
        else { st.sel[i] = [k]; this.evaluate(); }
        return;
      }
      const d = t.dataset.do;
      if (d === 'check') this.evaluate();
      else if (d === 'reveal') { st.sel[i] = it.opts.map((o, k) => (o.ok ? k : -1)).filter((k) => k >= 0); this.evaluate(true); }
      else if (d === 'hint') { st.hint[i] = true; this.draw(); }
      else if (d === 'nextq') { st.i = Math.min(st.i + 1, this.spec.items.length - 1); this.draw(); }
    }
    evaluate(revealed) {
      const st = this.st, it = this.item(), i = st.i, sel = st.sel[i] || [];
      const right = it.opts.map((o, k) => (o.ok ? k : -1)).filter((k) => k >= 0);
      const wrongSel = sel.filter((k) => !it.opts[k].ok), missed = right.filter((k) => !sel.includes(k));
      const ok = !wrongSel.length && !missed.length && sel.length > 0;
      let html = '';
      if (revealed) html = `<b>${U('Here are the natural answers.')}</b> `;
      else if (ok) html = `<b>${U(it.okMsg || 'Yes!')}</b> `;
      else if (!sel.length) html = `<b>${U('Choose at least one answer.')}</b>`;
      else html = `<b>${U(missed.length && !wrongSel.length ? 'Good, and there is more.' : 'Not quite.')}</b> `;
      if (!sel.length && !revealed) { st.fb = st.fb || {}; st.fb[i] = { ok: false, html }; this.draw(); return; }
      wrongSel.forEach((k) => { if (it.opts[k].why) html += `<div class="ub sm">${U(it.opts[k].why)}</div>`; });
      if (!ok && missed.length && !revealed) missed.forEach((k) => { if (it.opts[k].why) html += `<div class="ub sm">${U(it.opts[k].why)}</div>`; });
      if (it.expl && (ok || revealed || wrongSel.length || missed.length)) html += `<div class="ub sm" style="margin-top:6px">${U(it.expl)}</div>`;
      st.done[i] = true; st.fb = st.fb || {}; st.fb[i] = { ok: ok || !!revealed, html };
      A.sfx(ok || revealed ? 'ok' : 'no'); this.draw();
    }
    /* Demo Mode: model-answer reveal scheduled across the activity window */
    tick(t, total) {
      if (this.R.mode !== 'demo') return;
      const n = this.spec.items.length, slot = total / n, k = Math.min(n - 1, Math.floor(t / slot)), f = (t - k * slot) / slot;
      const st = this.st;
      if (st.i < k) { if (!st.done[st.i]) { st.sel[st.i] = this.item().opts.map((o, q) => (o.ok ? q : -1)).filter((q) => q >= 0); this.evaluate(true); } st.i = k; this.draw(); }
      if (f > 0.62 && !st.done[st.i]) { st.sel[st.i] = this.item().opts.map((o, q) => (o.ok ? q : -1)).filter((q) => q >= 0); this.evaluate(true); }
    }
  }

  /* ---------- task: pair / group work with timer, optional support & model answers ---------- */
  class Task extends Base {
    render() {
      const st = this.st, sp0 = this.spec, V = (x) => (typeof x === 'function' ? x(FE.L) : x);
      const sp = Object.assign({}, sp0, { lead: V(sp0.lead), steps: V(sp0.steps), support: V(sp0.support), model: V(sp0.model), hints: V(sp0.hints) });
      const steps = (sp.steps || []).map((s, i) => `<li><span class="n">${i + 1}</span><span class="ub sm">${U(s)}</span></li>`).join('');
      const roles = sp.roles ? `<div class="roles">${sp.roles.map((r) => `<div class="role"><span class="tag">${U(r.r)}</span><div class="ub sm">${U(r.t)}</div></div>`).join('')}</div>` : '';
      const sup = st.sup && sp.support ? `<div class="fb"><b>${U('Language help')}</b>${sp.support.map((s) => `<div class="ub sm">${U(s)}</div>`).join('')}</div>` : '';
      const mod = st.model && sp.model ? `<div class="fb ok"><b>${U('Sample answers')}</b>${sp.model.map((s) => `<div class="ub sm">${U(s)}</div>`).join('')}</div>` : '';
      const hint = st.hint && sp.hints ? `<div class="fb">${sp.hints.map((s) => `<div class="ub sm">${U(s)}</div>`).join('')}</div>` : '';
      const foot = [sp.hints ? ib('Hint', 'hint', I.hint) : '', sp.support ? ib(st.sup ? 'Hide help' : 'Language help', 'sup', I.hint) : '', sp.model ? ib(st.model ? 'Hide samples' : 'Sample answers', 'model', I.eye) : ''].join('');
      this.el.innerHTML = frame(sp, `${sp.lead ? `<div class="qq ub mid">${U(sp.lead)}</div>` : ''}${roles}<ol class="steps">${steps}</ol>${hint}${sup}${mod}`, foot, sp.tag || 'Pair work');
    }
    onClick(t) { const d = t.dataset.do, st = this.st; if (d === 'hint') st.hint = !st.hint; if (d === 'sup') st.sup = !st.sup; if (d === 'model') st.model = !st.model; this.render(); }
    tick(t, total) { if (this.R.mode === 'demo' && this.spec.model && !this.st.model && t > total * 0.7) { this.st.model = true; this.render(); } }
  }

  /* ---------- listen & repeat ---------- */
  class Listen extends Base {
    render() {
      const sp = this.spec, st = this.st;
      const rows = sp.items.map((it, i) => `<div class="lrow ${st.cur === i ? 'cur' : ''}"><button class="hb pl" data-do="play" data-i="${i}" aria-label="play">${I.play}</button><span class="ub ${it.cls || 'mid'}">${U(it.t)}</span></div>`).join('');
      this.el.innerHTML = frame(sp, `${sp.lead ? `<div class="qq ub mid">${U(sp.lead)}</div>` : ''}<div class="lrows">${rows}</div><div class="note">${U('Listen. Then say it aloud together.')}</div>`, ib('Play all', 'all', I.play, 'gold') + ib('Stop', 'stop', I.redo), sp.tag || 'Listen and repeat');
    }
    onClick(t) {
      const d = t.dataset.do;
      if (d === 'play') { this.playOne(+t.dataset.i); }
      if (d === 'all') this.all();
      if (d === 'stop') { clearTimeout(this.to); A.stop(); this.st.cur = -1; this.render(); }
    }
    playOne(i) { const it = this.spec.items[i]; this.st.cur = i; this.render(); A.init(); A.play(FE.speechKey(FE.VOICE.nar, it.t, it.ph)); }
    all() {
      const items = this.spec.items; let i = 0; clearTimeout(this.to);
      const go = () => { if (i >= items.length) { this.st.cur = -1; this.render(); return; } this.playOne(i); const d = A.dur(FE.speechKey(FE.VOICE.nar, items[i].t, items[i].ph), items[i].t) + (this.spec.gap || 2.2); i++; this.to = setTimeout(go, d * 1000); };
      go();
    }
    destroy() { clearTimeout(this.to); A.stop(); super.destroy(); }
    tick(t) { if (this.R.mode === 'demo' && !this.started && t > 1) { this.started = true; this.all(); } }
  }

  /* ---------- sort: now / later / either ---------- */
  class Sort extends Base {
    render() {
      const st = this.st, sp = this.spec; st.ans = st.ans || {};
      const rows = sp.items.map((it, i) => {
        const a = st.ans[i], ok = a != null && (it.ans === a);
        const btn = (v, lab) => `<button class="sbtn ${a === v ? (st.chk ? (it.ans === v ? 'right' : 'wrong') : 'sel') : ''} ${st.chk && it.ans === v && a !== v ? 'missed' : ''}" data-do="sort" data-i="${i}" data-v="${v}">${U(lab)}</button>`;
        return `<div class="srow"><span class="ub sm">${U(it.t)}</span><span class="sb">${btn('now', 'now')}${btn('later', 'later')}${btn('both', 'either')}</span>${st.chk && !ok ? `<div class="why ub xs">${U(it.why || '')}</div>` : ''}</div>`;
      }).join('');
      const fb = st.chk ? `<div class="fb ${sp.items.every((it, i) => st.ans[i] === it.ans) ? 'ok' : 'no'}">${U(sp.items.every((it, i) => st.ans[i] === it.ans) ? 'Yes. Could can point to now or later. The time cue and the situation help us decide.' : 'Look at the time cue in each sentence. Some sentences work for both.')}</div>` : '';
      this.el.innerHTML = frame(sp, `<div class="qq ub mid">${U(sp.q || 'Is the possibility about now, later, or either?')}</div><div class="srows">${rows}</div>${fb}`, ib('Check', 'check', I.check, 'gold') + ib('Show answers', 'reveal', I.eye), sp.tag || 'Sort');
    }
    onClick(t) { const st = this.st, d = t.dataset.do; if (d === 'sort') { st.ans[+t.dataset.i] = t.dataset.v; st.chk = false; A.sfx('pop'); } if (d === 'check') { st.chk = true; A.sfx('ok'); } if (d === 'reveal') { this.spec.items.forEach((it, i) => (st.ans[i] = it.ans)); st.chk = true; A.sfx('ok'); } this.render(); }
    tick(t, total) { if (this.R.mode === 'demo' && !this.st.chk && t > total * 0.7) { this.spec.items.forEach((it, i) => (this.st.ans[i] = it.ans)); this.st.chk = true; this.render(); } }
  }

  /* ---------- build a sentence from word chips ---------- */
  class Build extends Base {
    render() {
      const st = this.st, sp = this.spec; st.words = st.words || [];
      const used = new Set(st.words.map((w) => w.i));
      const chips = sp.chips.map((c, i) => `<span class="chip ${c.role} ${used.has(i) ? 'used' : ''}" data-do="add" data-i="${i}" role="button" tabindex="0">${U(`{${c.role}:${c.t}}`)}</span>`).join('');
      const line = st.words.map((w, k) => `<span class="chip ${w.role}" data-do="rm" data-k="${k}" role="button" tabindex="0">${U(`{${w.role}:${w.t}}`)}</span>`).join('');
      const fb = st.fb ? `<div class="fb ${st.fb.ok ? 'ok' : 'no'}">${st.fb.html}</div>` : '';
      this.el.innerHTML = frame(sp, `<div class="qq ub mid">${U(sp.q)}</div><div class="legend" style="margin:8px 0"><span class="lg" style="color:var(--subj);border-color:var(--subj)">${U('who')}</span><span class="lg" style="color:var(--modal);border-color:var(--modal)">${U('modal')}</span><span class="lg" style="color:var(--neg);border-color:var(--neg);border-style:dashed">${U('not')}</span><span class="lg" style="color:var(--verb);border-color:var(--verb)">${U('base verb')}</span></div><div class="bline">${line || `<span class="note">${U('Tap the words in order.')}</span>`}</div><div class="bank">${chips}</div>${fb}`, ib('Check', 'check', I.check, 'gold') + ib('Clear', 'clear', I.redo) + ib('Show a sample', 'reveal', I.eye), sp.tag || 'Build it');
    }
    onClick(t) {
      const st = this.st, sp = this.spec, d = t.dataset.do;
      if (d === 'add') { const i = +t.dataset.i; st.words.push({ i, t: sp.chips[i].t, role: sp.chips[i].role }); st.fb = null; A.sfx('snap'); }
      else if (d === 'rm') { st.words.splice(+t.dataset.k, 1); st.fb = null; }
      else if (d === 'clear') { st.words = []; st.fb = null; }
      else if (d === 'check') this.check();
      else if (d === 'reveal') { st.words = sp.sample.map((w) => { const i = sp.chips.findIndex((c) => c.t === w); return { i, t: w, role: sp.chips[i].role }; }); st.fb = { ok: true, html: `<b>${U('One good model:')}</b> <span class="ub sm">${U(sp.sampleText)}</span><div class="ub sm">${U(sp.extra || 'Other modals can also work here.')}</div>` }; A.sfx('ok'); }
      this.render();
    }
    check() {
      const st = this.st, sp = this.spec, words = st.words.map((w) => w.t);
      const r = sp.validate(words);
      st.fb = { ok: r.ok, html: `<b>${U(r.ok ? 'Yes!' : 'Not yet.')}</b> <span class="ub sm">${U(r.msg)}</span>` };
      A.sfx(r.ok ? 'ok' : 'no');
    }
    tick(t, total) { if (this.R.mode === 'demo' && !this.st.fb && t > total * 0.7) this.onClick({ dataset: { do: 'reveal' } }); }
  }

  /* ---------- mission branch: choices change the animated scenario ---------- */
  class Branch extends Base {
    render() {
      const st = this.st, sp = this.spec, cur = FE.L.mission[sp.key];
      const opts = sp.opts.map((o, k) => `<button class="opt ${st.pick === k ? 'sel' : ''}" data-opt="${k}"><span class="mk">${st.pick === k ? '✓' : ''}</span><span class="oi">${o.icon ? FE.icon(o.icon, 64) : ''}</span><span class="ub sm">${U(o.t)}</span></button>`).join('');
      const out = st.pick != null ? `<div class="fb ok"><b>${U('Now watch the scene.')}</b> <span class="ub sm">${U(sp.opts[st.pick].result)}</span></div>` : '';
      const sup = st.sup ? `<div class="fb"><b>${U('Language help')}</b>${sp.support.map((s) => `<div class="ub sm">${U(s)}</div>`).join('')}</div>` : '';
      this.el.innerHTML = frame(sp, `<div class="qq ub mid">${U(sp.q)}</div>${sp.facts ? `<ul class="facts">${sp.facts.map((f) => `<li class="ub sm">${U(f)}</li>`).join('')}</ul>` : ''}<div class="opts">${opts}</div>${out}${sup}`, ib('Language help', 'sup', I.hint), sp.tag || 'Team decision');
      void cur;
    }
    pick(k) { const st = this.st, sp = this.spec, o = sp.opts[k]; st.pick = k; FE.L.mission[sp.key] = o.val; (FE.L.mission.picked = FE.L.mission.picked || {})[sp.key] = true; A.sfx('whoosh'); if (o.effect) o.effect(this.X); this.render(); }
    onClick(t) { if (t.dataset.opt != null) this.pick(+t.dataset.opt); else if (t.dataset.do === 'sup') { this.st.sup = !this.st.sup; this.render(); } }
    fastForward() { const st = this.st; if (st.pick != null) { /* apply persisted choice visually */ const o = this.spec.opts[st.pick]; if (o.effect) o.effect(this.X); } }
    tick(t, total) { if (this.R.mode === 'demo' && this.st.pick == null && t > total * 0.35) this.pick(0); }
  }

  /* ---------- free sentence + rule-based form check ---------- */
  class Free extends Base {
    render() {
      const sp = this.spec, st = this.st;
      let fb = '';
      if (st.res) fb = st.res.length ? `<div class="fb no"><b>${U('Form check:')}</b>${st.res.map((r) => `<div class="ub sm">${U(r.msg)}</div>`).join('')}<div class="note" style="margin-top:6px">${U('This checker only looks for a few form patterns. Always check the meaning aloud.')}</div></div>` : `<div class="fb ok"><b>${U('No form problems found.')}</b> <span class="ub sm">${U('Now say it aloud. Does it match what you mean?')}</span><div class="note" style="margin-top:6px">${U('This checker only looks for a few form patterns. It cannot judge meaning.')}</div></div>`;
      this.el.innerHTML = frame(sp, `<div class="qq ub mid">${U(sp.q)}</div>${sp.prompts ? `<ul class="facts">${sp.prompts.map((f) => `<li class="ub sm">${U(f)}</li>`).join('')}</ul>` : ''}<label class="sr" for="freeIn">sentence</label><textarea id="freeIn" class="free" rows="2" spellcheck="false">${st.txt || ''}</textarea>${fb}`, ib('Check form', 'check', I.check, 'gold') + ib('Show examples', 'ex', I.eye), sp.tag || 'Your sentence');
      const ta = this.el.querySelector('textarea'); ta.addEventListener('input', () => { st.txt = ta.value; });
      ta.addEventListener('keydown', (e) => e.stopPropagation());
      if (st.ex) this.el.querySelector('.afoot').insertAdjacentHTML('beforebegin', `<div class="fb">${sp.examples.map((s) => `<div class="ub sm">${U(s)}</div>`).join('')}</div>`);
    }
    onClick(t) { const d = t.dataset.do, st = this.st; if (d === 'check') { const ta = this.el.querySelector('textarea'); st.txt = ta.value; st.res = st.txt.trim() ? FE.G.check(st.txt) : [{ msg: 'Type a sentence first.' }]; A.sfx(st.res.length ? 'no' : 'ok'); } if (d === 'ex') st.ex = !st.ex; this.render(); }
    tick(t, total) { if (this.R.mode === 'demo' && !this.st.ex && t > total * 0.6) { this.st.ex = true; this.render(); } }
  }

  /* ---------- quiet discussion prompt ---------- */
  class Discuss extends Task { }

  const TYPES = { quiz: Quiz, task: Task, listen: Listen, sort: Sort, build: Build, branch: Branch, free: Free, discuss: Discuss };
  ACT.mount = (seg, X) => new TYPES[seg.act.type](seg, X);
})();
