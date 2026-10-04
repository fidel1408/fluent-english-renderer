/* Should for Advice — interaction components with genuine validation (closed tasks) and teacher-judged open tasks */
(function (g) {
  'use strict';
  const FE = g.FE, { h, U, UB, $ } = FE;
  const act = (FE.act = {});
  const E = () => FE.engine;

  const panelAt = (S, cfg, cls) => S.ui('', cls || 'panel', { left: cfg.x + 'px', top: cfg.y + 'px', width: cfg.w + 'px', zIndex: 14 });
  const letter = (i) => String(i + 1);
  const res = (S, ok) => { if (S.onResultFn) S.onResultFn(ok); };
  function feedback(el, kind, html) { el.className = 'feedback ' + kind; el.innerHTML = html; el.style.display = html ? 'block' : 'none'; }
  const okIcon = '<span class="fbicon" style="color:#55dc95" aria-hidden="true">&#10003;</span>', noIcon = '<span class="fbicon" style="color:#ff8a9b" aria-hidden="true">&#10007;</span>', infoIcon = '<span class="fbicon" style="color:#ffd48a" aria-hidden="true">&#9679;</span>';
  act.okIcon = okIcon; act.noIcon = noIcon;

  /* ---------------------------------------------------------------- CHOICE (single answer, multi-select, several items) */
  act.choice = function (S, cfg) {
    const P = panelAt(S, cfg);
    const items = cfg.items || [cfg];
    const ctl = S.reg({ i: 0, done: {}, sel: {}, revealed: {}, items });
    P.innerHTML = `${cfg.label ? `<div class="lab">${UB(cfg.label)}</div>` : ''}<div class="pr"></div><div class="vis"></div><div class="os"></div><div class="feedback" style="display:none"></div><div class="ft" style="display:flex;gap:14px;margin-top:12px;align-items:center"></div>`;
    const pr = $('.pr', P), vis = $('.vis', P), os = $('.os', P), fb = $('.feedback', P), ft = $('.ft', P);
    pr.style.cssText = `font-size:${cfg.promptSize || 40}px;margin:6px 0 12px;text-align:center`;
    os.style.cssText = `display:grid;grid-template-columns:repeat(${cfg.cols || 1},1fr);gap:${cfg.gap || 12}px`;
    function render(i, fast) {
      ctl.i = i; const it = items[i]; const multi = it.multi != null ? it.multi : cfg.multi;
      pr.innerHTML = it.prompt ? UB(it.prompt) : ''; vis.innerHTML = it.visual || '';
      os.innerHTML = ''; ctl.sel[i] = ctl.sel[i] || new Set();
      it.options.forEach((o, j) => {
        const b = h('button', { class: 'opt', type: 'button', style: { fontSize: (cfg.optSize || 34) + 'px' }, html: `<span class="ick">${letter(j)}</span><span>${UB(o.t)}</span>` });
        b.dataset.j = j; b.addEventListener('click', () => pick(i, j, b));
        os.appendChild(b);
      });
      feedback(fb, 'note', '');
      ft.innerHTML = '';
      if (multi) { const c = h('button', { class: 'btn sm', type: 'button', html: UB('Check'), onclick: () => check(i) }); ft.appendChild(c); }
      if (items.length > 1) {
        ft.appendChild(h('span', { style: { flex: 1 } }));
        ft.appendChild(h('span', { class: 'lab', html: String(i + 1) + ' / ' + items.length }));
        if (i < items.length - 1) ft.appendChild(h('button', { class: 'btn sm ghost', type: 'button', html: UB('Next') + UI_ARROW, onclick: () => render(i + 1) }));
      }
      if (ctl.done[i]) paintAll(i);
    }
    const UI_ARROW = '<svg viewBox="0 0 24 24" style="width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2.6;stroke-linecap:round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    function pick(i, j, b) {
      if (ctl.done[i]) return; const it = items[i], o = it.options[j]; const multi = it.multi != null ? it.multi : cfg.multi;
      S.sfx('click');
      if (multi) { const s = ctl.sel[i]; if (s.has(j)) { s.delete(j); b.classList.remove('sel'); } else { s.add(j); b.classList.add('sel'); } return; }
      if (o.ok) { ctl.done[i] = true; paintAll(i, j); S.sfx('ok'); feedback(fb, 'good', okIcon + UB(o.why || it.why || 'Yes, that works well.')); res(S, true); }
      else { b.classList.add('no', 'shake'); b.disabled = true; b.querySelector('.ick').textContent = '✗'; S.sfx('no'); res(S, false); feedback(fb, 'bad', noIcon + UB(o.why || 'Not quite. Try another answer.')); setTimeout(() => b.classList.remove('shake'), 400); }
    }
    function check(i) {
      if (ctl.done[i]) return; const it = items[i], s = ctl.sel[i]; ctl.done[i] = true; paintAll(i);
      const right = it.options.every((o, j) => !!o.ok === s.has(j));
      S.sfx(right ? 'ok' : 'no'); res(S, right);
      feedback(fb, right ? 'good' : 'note', (right ? okIcon : infoIcon) + UB(right ? (it.good || 'Yes. Those are all reasonable.') : (it.partial || 'Look at the green outlines. Several ideas can work.')));
    }
    function paintAll(i, picked) {
      const it = items[i]; const bs = os.querySelectorAll('.opt');
      bs.forEach((b, j) => {
        const o = it.options[j], s = ctl.sel[i], multi = it.multi != null ? it.multi : cfg.multi;
        b.disabled = true; b.classList.remove('sel', 'no', 'ok', 'dim', 'miss');
        if (multi) {
          if (o.ok) b.classList.add(s.has(j) ? 'ok' : 'miss'); else if (s.has(j)) b.classList.add('no'); else b.classList.add('dim');
          b.querySelector('.ick').textContent = o.ok ? '✓' : (s.has(j) ? '✗' : letter(j));
        } else {
          if (o.ok) { b.classList.add('ok'); b.querySelector('.ick').textContent = '✓'; } else { b.classList.add(picked === j ? 'no' : 'dim'); if (picked === j) b.querySelector('.ick').textContent = '✗'; }
        }
      });
    }
    ctl.reveal = function () {
      const i = ctl.i, it = items[i]; if (ctl.revealed[i]) return false; ctl.revealed[i] = true;
      if (!ctl.done[i]) { ctl.done[i] = true; paintAll(i); }
      const multi = it.multi != null ? it.multi : cfg.multi;
      feedback(fb, 'note', infoIcon + UB(it.reveal || it.why || (multi ? 'These are the reasonable ideas.' : 'This is the best answer.')));
      S.sfx('reveal'); return true;
    };
    ctl.goto = (i, fast) => { render(i, fast); if (FE.engine) FE.engine.emit('revealstate'); };
    ctl.panel = P; render(0, true);
    S.onReveal(() => ctl.reveal(), () => !ctl.revealed[ctl.i]);
    return ctl;
  };

  /* ---------------------------------------------------------------- BUILD (sentence tiles) */
  act.build = function (S, cfg) {
    const P = panelAt(S, cfg); const items = cfg.items || [cfg]; const ctl = S.reg({ i: 0, items, done: {}, revealed: {} });
    P.innerHTML = `${cfg.label ? `<div class="lab">${UB(cfg.label)}</div>` : ''}<div class="pr" style="text-align:center;margin:4px 0 10px"></div><div class="slots"></div><div class="line" style="text-align:center;min-height:0;font-size:38px;margin-top:6px"></div><div class="tray" style="margin-top:14px"></div><div class="feedback" style="display:none"></div><div class="ft" style="display:flex;gap:12px;margin-top:12px;align-items:center"></div>`;
    const pr = $('.pr', P), slots = $('.slots', P), tray = $('.tray', P), fb = $('.feedback', P), ft = $('.ft', P), line = $('.line', P);
    let placed = [];
    const tileHTML = (tk) => { const [w, r] = tk.split(':'); return `<span class="tile-in">${U(r && r !== 'd' ? `{${r}|${w}}` : w)}</span>`; };
    const roleOf = (tk) => { const r = tk.split(':')[1]; return !r || r === 'd' ? 'o' : r; };
    function render(i) {
      ctl.i = i; const it = items[i]; placed = [];
      pr.innerHTML = it.prompt ? UB(it.prompt) : ''; pr.style.fontSize = (cfg.promptSize || 34) + 'px';
      slots.className = 'slots'; line.innerHTML = ''; feedback(fb, 'note', '');
      draw();
      ft.innerHTML = '';
      ft.append(h('button', { class: 'btn sm', type: 'button', html: UB('Check'), onclick: check }), h('button', { class: 'btn sm ghost', type: 'button', html: UB('Clear'), onclick: clearAll }));
      if (items.length > 1) { ft.append(h('span', { style: { flex: 1 } }), h('span', { class: 'lab', text: i + 1 + ' / ' + items.length })); if (i < items.length - 1) ft.append(h('button', { class: 'btn sm ghost', type: 'button', html: UB('Next'), onclick: () => render(i + 1) })); }
    }
    /* Clear = a genuinely fresh attempt: placed tiles, done/revealed flags, verdict and feedback are all reset. */
    function clearAll() {
      placed = []; ctl.done[ctl.i] = false; ctl.revealed[ctl.i] = false; slots.className = 'slots'; line.innerHTML = ''; feedback(fb, 'note', ''); S.sfx('click'); draw();
      if (FE.engine) FE.engine.emit('revealstate');
    }
    function draw() {
      const it = items[ctl.i];
      slots.innerHTML = ''; tray.innerHTML = '';
      placed.forEach((ix, k) => { const b = h('button', { class: 'tile t-' + roleOf(it.bank[ix]), type: 'button', html: tileHTML(it.bank[ix]) }); b.onclick = () => { if (ctl.done[ctl.i]) return; placed.splice(k, 1); S.sfx('click'); draw(); }; slots.appendChild(b); });
      if (!placed.length) slots.appendChild(h('span', { style: { opacity: 0.55, fontSize: '28px', alignSelf: 'center' }, html: UB(it.slotHint || 'Tap the words in order') }));
      it.bank.forEach((tk, ix) => { const b = h('button', { class: 'tile t-' + roleOf(tk), type: 'button', html: tileHTML(tk), disabled: placed.includes(ix) }); b.onclick = () => { if (ctl.done[ctl.i]) return; placed.push(ix); S.sfx('click'); draw(); }; tray.appendChild(b); });
    }
    function words(ixs, it) { return ixs.map((ix) => it.bank[ix].split(':')[0].toLowerCase()); }
    function check() {
      const it = items[ctl.i]; if (ctl.done[ctl.i]) return;
      const got = words(placed, it).join(' ');
      if (it.answers.some((a) => a.join(' ').toLowerCase() === got)) {
        ctl.done[ctl.i] = true; slots.className = 'slots ok'; S.sfx('ok'); res(S, true); line.innerHTML = UB(it.final || '');
        feedback(fb, 'good', okIcon + UB(it.why || 'Yes. That is correct.'));
      } else {
        slots.className = 'slots no'; S.sfx('no'); res(S, false);
        const msg = it.diag ? it.diag(words(placed, it)) : null;
        feedback(fb, 'bad', noIcon + UB(msg || (placed.length < it.answers[0].length ? 'Add more words.' : 'Check the order of the words.')));
        slots.classList.add('shake'); setTimeout(() => slots.classList.remove('shake'), 400);
      }
    }
    ctl.reveal = function () {
      if (ctl.revealed[ctl.i]) return false; ctl.revealed[ctl.i] = true;
      const it = items[ctl.i]; const a = it.answers[0];
      placed = []; const used = new Set();
      a.forEach((w) => { const ix = it.bank.findIndex((tk, k) => !used.has(k) && tk.split(':')[0].toLowerCase() === w); if (ix >= 0) { used.add(ix); placed.push(ix); } });
      ctl.done[ctl.i] = true; draw(); slots.className = 'slots ok'; line.innerHTML = UB(it.final || '');
      feedback(fb, 'note', infoIcon + UB(it.why || 'This is one correct order.')); S.sfx('reveal'); return true;
    };
    ctl.goto = (i) => { render(i); if (FE.engine) FE.engine.emit('revealstate'); }; ctl.panel = P; render(0);
    S.onReveal(() => ctl.reveal(), () => !ctl.revealed[ctl.i]);
    return ctl;
  };

  /* ---------------------------------------------------------------- REPAIR (incorrect sentences stay visibly incorrect until repaired) */
  act.repair = function (S, cfg) {
    const P = panelAt(S, cfg); const items = cfg.items; const ctl = S.reg({ i: 0, items, done: {}, revealed: {} });
    P.innerHTML = `${cfg.label ? `<div class="lab">${UB(cfg.label)}</div>` : ''}<div class="bad" style="display:flex;align-items:center;justify-content:center;gap:16px;margin:6px 0 14px;padding:12px 18px;border-radius:22px;background:rgba(214,51,79,.16);border:2.5px solid #ff6f86"><span class="badge" style="font-size:26px;color:#ff8a9b;font-weight:800;white-space:nowrap">&#10007;</span><div class="sent" style="font-size:54px"></div></div><div class="os"></div><div class="feedback" style="display:none"></div><div class="ft" style="display:flex;gap:12px;margin-top:12px;align-items:center"></div>`;
    const sent = $('.sent', P), os = $('.os', P), fb = $('.feedback', P), ft = $('.ft', P), bad = $('.bad', P), badge = $('.badge', P);
    os.style.cssText = 'display:grid;grid-template-columns:1fr;gap:10px';
    function render(i) {
      ctl.i = i; const it = items[i];
      bad.style.borderColor = '#ff6f86'; bad.style.background = 'rgba(214,51,79,.16)'; badge.innerHTML = '&#10007; ' + UB('incorrect'); badge.style.color = '#ff8a9b';
      sent.innerHTML = it.bad.map((w) => U(w)).join(''); os.innerHTML = ''; feedback(fb, 'note', '');
      it.options.forEach((o, j) => { const b = h('button', { class: 'opt', type: 'button', style: { fontSize: '36px' }, html: `<span class="ick">${letter(j)}</span><span>${UB(o.t)}</span>` }); b.onclick = () => pick(j, b); os.appendChild(b); });
      ft.innerHTML = '';
      if (items.length > 1) { ft.append(h('span', { class: 'lab', text: i + 1 + ' / ' + items.length }), h('span', { style: { flex: 1 } })); if (i < items.length - 1) ft.append(h('button', { class: 'btn sm ghost', type: 'button', html: UB('Next'), onclick: () => render(i + 1) })); }
      if (ctl.done[i]) applyRepair(true);
    }
    function pick(j, b) {
      const it = items[ctl.i]; if (ctl.done[ctl.i]) return; S.sfx('click');
      if (it.options[j].ok) { applyRepair(false); b.classList.add('ok'); b.querySelector('.ick').textContent = '✓'; S.sfx('ok'); res(S, true); }
      else { b.classList.add('no', 'shake'); b.disabled = true; b.querySelector('.ick').textContent = '✗'; S.sfx('no'); res(S, false); feedback(fb, 'bad', noIcon + UB(it.options[j].why || 'That is not the best repair. Try again.')); setTimeout(() => b.classList.remove('shake'), 400); }
    }
    function applyRepair(instant) {
      const it = items[ctl.i]; ctl.done[ctl.i] = true;
      os.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (it.options[j].ok) { b.classList.add('ok'); b.querySelector('.ick').textContent = '✓'; } else b.classList.add('dim'); });
      // show the changed words, then replace them
      const units = sent.querySelectorAll('.u');
      it.edit.del.forEach((d) => units[d] && units[d].classList.add('r-x'));
      const finish = () => {
        sent.innerHTML = it.good.map((w, k) => U(w)).join('');
        sent.querySelectorAll('.u').forEach((u, k) => { if (it.edit.add.includes(k)) u.classList.add('r-g'); });
        bad.style.borderColor = '#55dc95'; bad.style.background = 'rgba(47,163,107,.18)'; badge.innerHTML = '&#10003; ' + UB('correct'); badge.style.color = '#7ff0b0';
        feedback(fb, 'good', okIcon + UB(it.why));
      };
      if (instant || S.fast) finish(); else { feedback(fb, 'note', infoIcon + UB(it.spot || 'Look at the marked words.')); S.later(finish, 1400); }
    }
    ctl.reveal = function () { if (ctl.revealed[ctl.i] || ctl.done[ctl.i]) return false; ctl.revealed[ctl.i] = true; applyRepair(S.fast); S.sfx('reveal'); return true; };
    ctl.goto = (i) => { render(i); if (FE.engine) FE.engine.emit('revealstate'); }; ctl.panel = P; render(0);
    S.onReveal(() => ctl.reveal(), () => !ctl.done[ctl.i] && !ctl.revealed[ctl.i]);
    return ctl;
  };

  /* ---------------------------------------------------------------- MATCH (advice sentence -> situation) */
  act.match = function (S, cfg) {
    const P = panelAt(S, cfg); const ctl = S.reg({ done: {}, revealed: false });
    P.innerHTML = `${cfg.label ? `<div class="lab">${UB(cfg.label)}</div>` : ''}<div class="mt" style="display:grid;grid-template-columns:1.25fr 1fr;gap:12px 26px;margin-top:8px"></div><div class="feedback" style="display:none"></div>`;
    const mt = $('.mt', P), fb = $('.feedback', P); let selL = null;
    const L = cfg.pairs.map((p, i) => ({ i, t: p.advice })), R = cfg.pairs.map((p, i) => ({ i, p })).sort((a, b) => ((a.i * 7 + 3) % 5) - ((b.i * 7 + 3) % 5));
    const lb = [], rb = [];
    L.forEach((l, k) => {
      const a = h('button', { class: 'opt', type: 'button', style: { fontSize: '33px' }, html: `<span class="ick">${l.i + 1}</span><span>${UB(l.t)}</span>` });
      const r = R[k]; const b = h('button', { class: 'opt', type: 'button', style: { fontSize: '30px' }, html: `<span class="ick" style="background:transparent;width:70px;height:60px">${FE.iconSVG(r.p.icon, 62)}</span><span>${UB(r.p.situation)}</span>` });
      a.onclick = () => { if (a.disabled) return; S.sfx('click'); lb.forEach((x) => x.classList.remove('sel')); a.classList.add('sel'); selL = l.i; };
      b.onclick = () => {
        if (b.disabled) return; if (selL == null) { feedback(fb, 'note', infoIcon + UB('First choose an advice sentence.')); return; }
        if (selL === r.i) { b.disabled = true; lb[selL].disabled = true; b.classList.add('ok'); lb[selL].classList.remove('sel'); lb[selL].classList.add('ok'); b.querySelector('.ick').insertAdjacentHTML('beforeend', ''); lb[selL].querySelector('.ick').textContent = '✓'; S.sfx('ok'); res(S, true); ctl.done[selL] = true; feedback(fb, 'good', okIcon + UB(cfg.pairs[selL].why)); selL = null; }
        else { b.classList.add('no', 'shake'); setTimeout(() => b.classList.remove('no', 'shake'), 600); S.sfx('no'); res(S, false); feedback(fb, 'bad', noIcon + UB('Not this one. Think about the problem and the next useful step.')); }
      };
      lb.push(a); rb.push(b); mt.append(a, b);
    });
    ctl.reveal = function () { if (ctl.revealed) return false; ctl.revealed = true; cfg.pairs.forEach((p, i) => { lb[i].classList.add('ok'); lb[i].disabled = true; lb[i].querySelector('.ick').textContent = '✓'; }); rb.forEach((b) => { b.classList.add('ok'); b.disabled = true; }); feedback(fb, 'note', infoIcon + UB('Each advice fits one problem. Other ideas can also work.')); S.sfx('reveal'); return true; };
    ctl.panel = P; S.onReveal(() => ctl.reveal(), () => !ctl.revealed); return ctl;
  };

  /* ---------------------------------------------------------------- LISTEN & REPEAT (no recognition, no scoring) */
  act.listen = function (S, cfg) {
    const P = panelAt(S, cfg);
    P.innerHTML = `${cfg.label ? `<div class="lab">${UB(cfg.label)}</div>` : ''}<div class="rows" style="display:flex;flex-direction:column;gap:12px;margin-top:8px"></div><div class="yt" style="margin-top:14px;display:none;align-items:center;gap:16px"><div style="font-size:30px;color:#ffd48a;font-weight:800">${UB('Your turn')}</div><div style="flex:1;height:14px;border-radius:8px;background:rgba(255,255,255,.14);overflow:hidden"><i class="yb" style="display:block;height:100%;width:100%;background:#55dc95;transform-origin:left"></i></div></div>`;
    const rows = $('.rows', P), yt = $('.yt', P), yb = $('.yb', P);
    const ctl = S.reg({ P });
    let turnT = null;
    function turn(sec) {
      yt.style.display = 'flex'; let el = 0; yb.style.transition = 'none'; yb.style.transform = 'scaleX(1)'; if (turnT) turnT.dead = true;
      turnT = S.ticker((dt) => { el += dt; yb.style.transform = `scaleX(${Math.max(0, 1 - el / sec).toFixed(3)})`; if (el >= sec + 0.3) { yt.style.display = 'none'; turnT.dead = true; } });
    }
    cfg.rows.forEach((r) => {
      const row = h('div', { class: 'paper card', style: { position: 'relative', padding: '10px 22px 12px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: (r.size || 40) + 'px' } });
      row.appendChild(h('div', { style: { flex: 1, textAlign: 'left' }, html: UB(r.t) }));
      const play = (key, slow) => { const c = S.seg.C[key] || S.seg.L[key]; if (!c) return; S.sfx('click'); FE.audio.play(c.id, 0, 'narr'); const sec = Math.max(3, c.dur * (slow ? 1.2 : 1.3) + 1.5); S.timeout(() => turn(sec), c.dur * 1000 + 200); };
      row.appendChild(h('button', { class: 'btn sm', type: 'button', html: `${FE.ui.svgIcon('play').replace('<svg', '<svg style="width:26px;height:26px"')}${UB('normal')}`, onclick: () => play(r.normal, false) }));
      row.appendChild(h('button', { class: 'btn sm ghost', type: 'button', html: `${FE.ui.svgIcon('play').replace('<svg', '<svg style="width:26px;height:26px"')}${UB('slow')}`, onclick: () => play(r.slow, true) }));
      rows.appendChild(row);
    });
    ctl.turn = turn; return ctl;
  };

  /* ---------------------------------------------------------------- OPEN TASK (teacher-judged; never auto-scored) */
  const VERBS = ('ask call check save leave wait send write finish practice talk speak explain listen share buy book arrive plan tell text message email invite bring pack charge set turn mute close open take make try use start stop keep give get go come meet find show review prepare rehearse schedule confirm choose decide apologize thank reply answer ignore interrupt borrow clean cook move change follow look read rest sleep drink eat walk drive park pay ride order remember forget join help offer wear worry relax breathe delete download update upload print copy record be have do see know think say sit stand run wake cancel postpone arrange discuss compare focus pick sort tidy wash fix repair label double-check travel begin continue consider improve silence revise shorten respond repeat mean need want rest visit meet stay return reach contact call join sign pass hold carry bring fill clear plan test try cover drop add skip').split(/\s+/);
  const IRREG = { went: 'go', gone: 'go', took: 'take', taken: 'take', saw: 'see', seen: 'see', came: 'come', made: 'make', got: 'get', gave: 'give', given: 'give', told: 'tell', said: 'say', left: 'leave', met: 'meet', wrote: 'write', written: 'write', bought: 'buy', sent: 'send', kept: 'keep', found: 'find', thought: 'think', ran: 'run', ate: 'eat', eaten: 'eat', drank: 'drink', slept: 'sleep', spoke: 'speak', woke: 'wake', was: 'be', were: 'be', is: 'be', am: 'be', are: 'be', been: 'be', has: 'have', had: 'have', does: 'do', did: 'do', done: 'do', goes: 'go', knew: 'know', known: 'know', sat: 'sit', stood: 'stand', paid: 'pay', brought: 'bring', began: 'begin', chose: 'choose', forgot: 'forget', wore: 'wear', read: 'read' };
  FE.VERBS = new Set(VERBS);
  const PRON = new Set(['i', 'you', 'he', 'she', 'we', 'they', 'it']);
  const DET = new Set(['the', 'a', 'an', 'my', 'our', 'your', 'his', 'her', 'their', 'this', 'that', 'these', 'those', 'some', 'every', 'each', 'no']);
  const WH = ['what', 'when', 'where', 'who', 'whom', 'how', 'why', 'which'];
  const ADV = new Set(['always', 'also', 'probably', 'really', 'definitely', 'just', 'never', 'certainly', 'simply', 'still', 'usually', 'even', 'only', 'maybe', 'first', 'now', 'again']);
  const V = FE.VERBS;
  /* returns the base verb if t is an inflected form of a known verb (calls, called, calling, tries, planned...), else null */
  function baseOf(t) {
    if (IRREG[t] && IRREG[t] !== t) return IRREG[t];
    const c = [];
    if (/ies$/.test(t)) c.push(t.slice(0, -3) + 'y');
    if (/es$/.test(t)) c.push(t.slice(0, -2));
    if (/s$/.test(t) && !/ss$/.test(t)) c.push(t.slice(0, -1));
    if (/ied$/.test(t)) c.push(t.slice(0, -3) + 'y');
    if (/ed$/.test(t)) { c.push(t.slice(0, -2), t.slice(0, -1)); if (/(.)\1ed$/.test(t)) c.push(t.slice(0, -3)); }
    if (/ing$/.test(t)) { c.push(t.slice(0, -3), t.slice(0, -3) + 'e'); if (/(.)\1ing$/.test(t)) c.push(t.slice(0, -4)); }
    return c.find((b) => b.length > 1 && V.has(b) && b !== t) || null;
  }
  const verbish = (t) => V.has(t) || t === 'to' || !!baseOf(t);
  const stripAdv = (a) => { a = a.slice(); while (a.length && ADV.has(a[0])) a.shift(); return a; };

  /* Form-only checker for typed advice (e.g. a learner's chat message the teacher types in).
     formOk === true   : the whole should/shouldn't pattern is PROVEN (pronoun/determiner/name subject, known base verb)
     formOk === false  : a definite pattern error was found
     formOk === null   : cannot be proven by this simple checker -> neutral teacher-review wording, never a green tick */
  FE.checkForm = function (raw) {
    const txt0 = String(raw || '').trim().replace(/[“”"]/g, '').replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ');
    const res = { msgs: [], formOk: null, kind: '' };
    const add = (tone, t) => res.msgs.push({ tone, t });
    const bad = (t) => { add('bad', t); res.formOk = false; };
    const finish = (ok) => {
      if (res.formOk === false) { /* already flagged */ }
      else if (ok) { res.formOk = true; add('good', 'The pattern checks out: should or shouldn\'t with a base verb.'); }
      else res.formOk = null;
      add('note', 'This checks the should / shouldn\'t pattern only. Meaning, politeness and usefulness are for the teacher to judge.');
      return res;
    };
    if (!txt0) { add('note', 'Type a sentence first.'); return res; }
    const isQ = /\?\s*$/.test(txt0);
    const body = txt0.replace(/[.!?]+$/, '');
    const orig = body.split(/[\s,]+/).filter(Boolean), tk = orig.map((w) => w.toLowerCase());
    // spelling of the modal
    const ix = tk.findIndex((w) => w === 'should' || w === "shouldn't" || w === 'shouldnt');
    if (ix < 0) {
      if (tk.some((w) => /^shoulds$|^shoulded$|^shoulding$/.test(w))) { bad('Should never takes -s or -ed. Use should.'); return finish(false); }
      add('note', 'I cannot find should or shouldn\'t. Other advice phrases can be fine, but this checker only looks at should.'); res.formOk = null; return res;
    }
    if (tk[ix] === 'shouldnt') { bad('Write shouldn\'t with an apostrophe: shouldn\'t (or should not).'); return finish(false); }
    const before = tk.slice(0, ix), after = tk.slice(ix + 1), neg = tk[ix] === "shouldn't";
    // do / does / did never help to build questions or negatives with should
    if (['do', 'does', 'did'].includes(tk[0]) && ix > 0 && ix <= 3 && !(before.length > 2)) { bad('Do not use do, does, or did with should. Start with should: Should I call?'); return finish(false); }
    if (before.length && ['do', 'does', 'did', "don't", "doesn't", "didn't"].includes(before[before.length - 1])) { bad('Do not use do, does, or did with should. For negative advice use shouldn\'t: He shouldn\'t wait.'); return finish(false); }
    const whFirst = WH.includes(before[0]);
    const questionShape = before.length === 0 || (whFirst && before.length === 1);
    /* ---- short answers: Yes, you should. / No, you shouldn't. ---- */
    if (after.length === 0 && before.length <= 2 && (before.length === 0 || ['yes', 'no'].includes(before[0]))) {
      if (before.length === 2 && PRON.has(before[1])) { res.kind = 'short-answer'; return finish(true); }
      if (before.length === 0) { bad('Add a subject before should.'); return finish(false); }
      if (before.length === 1) { add('note', 'This works only as a short answer with a pronoun: Yes, you should.'); return finish(false); }
    }
    if (after.length === 0 && before.length === 1 && PRON.has(before[0])) { add('note', 'This works only as a short answer, for example: Yes, you should. It is not a full piece of advice.'); return finish(false); }
    /* ---- direct questions: (wh) should + subject + base verb ---- */
    if (questionShape) {
      res.kind = 'question';
      if (!isQ) add('note', 'This looks like a question. Add a question mark.');
      if (neg) { add('note', 'Negative questions (Shouldn\'t I call?) are real English but are outside this checker.'); return finish(false); }
      const rest = after.slice();
      // who/what as the subject: "Who should call her?"
      if (before.length === 1 && ['who', 'what'].includes(before[0]) && rest.length && verbish(rest[0])) {
        const v = rest[0];
        if (v === 'to') { bad('No to after should. Use the base verb.'); return finish(false); }
        if (!V.has(v)) { bad(`After should, use the base verb: ${baseOf(v)}.`); return finish(false); }
        return finish(true);
      }
      const j = rest.findIndex(verbish);
      if (rest.length === 0) { bad('Add a subject and a base verb after should: Should I call her?'); return finish(false); }
      if (j === -1) { add('note', `I cannot find a base verb after the subject. If "${rest[rest.length - 1]}" is not a verb, the sentence may need be (Should I be happy?). Teacher: check by eye.`); return finish(false); }
      if (j === 0) { bad('Add a subject after should: Should I call?'); return finish(false); }
      let subj = rest.slice(0, j); const subjOrig = orig.slice(ix + 1, ix + 1 + j);
      while (subj.length > 1 && ADV.has(subj[subj.length - 1])) { subj.pop(); subjOrig.pop(); }
      const v = rest[j];
      if (v === 'to') { bad('No to after the subject. Use the base verb: Should I call?'); return finish(false); }
      if (!V.has(v)) { bad(`After the subject use the base verb: ${baseOf(v)}. (Should he call her?)`); return finish(false); }
      const subjOk = (subj.length === 1 && PRON.has(subj[0])) || (subj.length >= 2 && DET.has(subj[0]) && !DET.has(subj[subj.length - 1])) || (subj.length === 1 && /^[A-Z]/.test(subjOrig[0]) && !PRON.has(subj[0]));
      if (!subjOk) { add('note', 'I cannot be sure what the subject is here. Teacher: check by eye that the order is should + subject + base verb.'); return finish(false); }
      return finish(true);
    }
    /* ---- statements ---- */
    res.kind = 'statement';
    if (whFirst && before.length > 1) { bad('Put should right after the question word: What should I do?'); return finish(false); }
    if (isQ && before.length === 1) {
      bad('A standard yes/no question puts should first: Should I call? (Rising intonation can make an echo question in speech, but this lesson teaches the standard inverted form.)'); return finish(false);
    }
    let a = after.slice();
    if (!neg && a[0] === 'not') a = a.slice(1);
    if (a[0] === 'to') { bad('No to after should. Say: You should ask.'); return finish(false); }
    a = stripAdv(a);
    const v = a[0];
    if (!v) { bad('Add a base verb after should: You should call her.'); return finish(false); }
    if (!V.has(v)) {
      const b = baseOf(v);
      if (b) { bad(`After should, use the base verb: ${b}. The verb never takes -s, -ed or -ing here.`); return finish(false); }
      add('note', `I cannot prove that "${v}" is a base verb. If it is an adjective or a noun the sentence may need be (You should be ${v}). Teacher: check by eye.`);
      return finish(false);
    }
    return finish(true);
  };

  act.open = function (S, cfg) {
    const P = panelAt(S, cfg);
    P.innerHTML = `${cfg.label ? `<div class="lab">${UB(cfg.label)}</div>` : ''}<div class="pr" style="margin:6px 0 10px;text-align:center;font-size:${cfg.promptSize || 38}px"></div><div class="vis"></div><div class="sup" style="display:none;margin:8px 0"></div><div class="mod" style="display:none"></div><div class="chk" style="display:none"></div><div class="feedback" style="display:none"></div><div class="ft" style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap"></div>`;
    $('.pr', P).innerHTML = UB(cfg.prompt); if (cfg.visual) $('.vis', P).innerHTML = cfg.visual;
    const sup = $('.sup', P), mod = $('.mod', P), chk = $('.chk', P), ft = $('.ft', P), fb = $('.feedback', P);
    const ctl = S.reg({ P, shown: false });
    if (cfg.support) {
      sup.innerHTML = cfg.support.map((s) => `<span class="paper card" style="position:relative;display:inline-block;padding:6px 14px 8px;margin:4px;font-size:30px;border-radius:16px">${UB(s)}</span>`).join('');
      ft.appendChild(h('button', { class: 'btn sm ghost', type: 'button', html: UB('Language support'), onclick: () => { sup.style.display = sup.style.display === 'none' ? 'block' : 'none'; S.sfx('click'); } }));
      ctl.support = () => { sup.style.display = 'block'; };
    }
    if (cfg.models) mod.innerHTML = `<div class="lab" style="margin-top:6px">${UB('Possible answers')}</div>` + cfg.models.map((m) => `<div class="paper card" style="position:relative;margin:6px 0;padding:8px 18px 10px;font-size:34px;border-radius:18px;text-align:left">${UB(m)}</div>`).join('') + (cfg.modelNote ? `<div style="font-size:26px;margin-top:6px;color:#ffd48a">${UB(cfg.modelNote)}</div>` : '');
    if (cfg.checks) {
      chk.innerHTML = `<div class="lab">${UB('Teacher checks')}</div>` + cfg.checks.map((c, i) => `<label style="display:flex;align-items:center;gap:12px;margin:5px 0;font-size:28px"><input type="checkbox" style="width:28px;height:28px;accent-color:#ffb540">${UB(c)}</label>`).join('') + `<div style="font-size:24px;margin-top:6px;color:#bfcbea">${UB('You judge the answers. This tool does not score speech.')}</div>`;
      ft.appendChild(h('button', { class: 'btn sm ghost', type: 'button', html: UB('Teacher checks'), onclick: () => { chk.style.display = chk.style.display === 'none' ? 'block' : 'none'; } }));
    }
    if (cfg.typed) {
      const row = h('div', { style: { display: 'flex', gap: '10px', width: '100%', marginTop: '6px', alignItems: 'center' } });
      const inp = h('input', { type: 'text', 'aria-label': 'Type a sentence to check its form', placeholder: 'Type a learner sentence', style: { flex: 1, fontSize: '30px', padding: '10px 16px', borderRadius: '16px', border: '2px solid #4a6bb5', background: '#fff', color: '#121b33', fontFamily: 'var(--ui)' } });
      const go = () => { const r = FE.checkForm(inp.value); feedback(fb, r.formOk === true ? 'good' : r.formOk === false ? 'bad' : 'note', r.msgs.map((m) => (m.tone === 'good' ? okIcon : m.tone === 'bad' ? noIcon : infoIcon) + UB(m.t)).join('<br>')); };
      inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') go(); });
      row.append(inp, h('button', { class: 'btn sm', type: 'button', html: UB('Check form'), onclick: go })); ft.appendChild(row);
    }
    ctl.reveal = () => { if (ctl.shown) return false; ctl.shown = true; mod.style.display = 'block'; S.sfx('reveal'); return true; };
    if (cfg.models) S.onReveal(() => ctl.reveal(), () => !ctl.shown);
    if (cfg.support) S.hint(() => ctl.support());
    return ctl;
  };

  /* ---------------------------------------------------------------- FORK: problem -> several paths -> advice highlights one */
  act.fork = function (S, cfg) {
    const W = cfg.w, H = cfg.h, n = cfg.options.length;
    const root = S.ui('', 'forkroot', { left: cfg.x + 'px', top: cfg.y + 'px', width: W + 'px', height: H + 'px', position: 'absolute', zIndex: 8, pointerEvents: 'none' });
    const nodeX = cfg.nodeX != null ? cfg.nodeX : 96, nodeY = H / 2, cardX = cfg.cardX != null ? cfg.cardX : 330, cardW = W - cardX, cardH = cfg.cardH || Math.min(170, (H - 24) / n - 14);
    const ys = cfg.options.map((o, i) => (H / (n + 1)) * (i + 1));
    let svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" style="position:absolute;left:0;top:0;overflow:visible">';
    ys.forEach((y, i) => { svg += `<path class="pth pth${i}" d="M${nodeX + 70} ${nodeY}C${nodeX + 190} ${nodeY} ${cardX - 120} ${y} ${cardX - 8} ${y}" fill="none" stroke="#9db4e8" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 16" opacity="0"/>`; });
    svg += '</svg>';
    root.innerHTML = svg;
    const node = h('div', { class: 'anim forknode', style: { position: 'absolute', left: nodeX - 74 + 'px', top: nodeY - 74 + 'px', width: '148px', height: '148px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%,#fff,#e5ecff)', boxShadow: '0 12px 34px rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }, html: FE.iconSVG(cfg.problem.icon, 100, cfg.problem.o || {}) });
    const nlab = h('div', { class: 'anim forklab', style: { position: 'absolute', left: nodeX - 130 + 'px', top: nodeY + 84 + 'px', width: '260px', textAlign: 'center', fontSize: '30px', color: '#ffd48a', fontWeight: 800 }, html: UB(cfg.problem.label) });
    root.append(node, nlab);
    const cards = cfg.options.map((o, i) => {
      const c = h('div', { class: 'anim card forkcard', style: { position: 'absolute', left: cardX + 'px', top: ys[i] - cardH / 2 + 'px', width: cardW + 'px', height: cardH + 'px', borderRadius: '26px', background: '#fbf8f1', boxShadow: '0 10px 30px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 22px', fontSize: (cfg.size || 36) + 'px', border: '4px solid transparent', pointerEvents: 'none' }, html: `<span style="flex:none">${FE.iconSVG(o.icon, Math.min(92, cardH - 20), o.o || {})}</span><div style="flex:1;text-align:left"><div class="lb">${UB(o.label)}</div><div class="cq" style="display:none;font-size:.62em;margin-top:2px;border-top:2px dashed #a8b2cc;padding-top:2px"></div></div><span class="bd" style="flex:none;width:58px;height:58px;display:none;align-items:center;justify-content:center"></span>` });
      root.appendChild(c); return c;
    });
    const ctl = { root, cards };
    ctl.showProblem = () => { S.in(node); S.in(nlab, 0.2); S.sfx('pop'); };
    ctl.showOptions = (stagger) => cards.forEach((c, i) => { root.querySelector('.pth' + i).setAttribute('opacity', '.8'); S.in(c, (stagger != null ? stagger : 0.35) * i); if (!S.fast) S.timeout(() => S.sfx('pop'), (stagger != null ? stagger : 0.35) * i * 1000); });
    ctl.mark = (i, state) => {
      const c = cards[i], p = root.querySelector('.pth' + i), bd = c.querySelector('.bd');
      if (state === 'advice') {
        c.style.borderColor = '#ffb540'; c.style.boxShadow = '0 0 0 6px rgba(255,181,64,.35),0 10px 40px rgba(255,181,64,.5)'; c.style.transform = 'scale(1.03)'; c.style.opacity = 1;
        p.setAttribute('stroke', '#ffb540'); p.setAttribute('stroke-width', '12'); p.setAttribute('stroke-dasharray', '14 10'); p.setAttribute('opacity', '1'); p.classList.add('flow'); p.style.filter = 'drop-shadow(0 0 8px #ffb540)';
        bd.style.display = 'flex'; bd.innerHTML = FE.iconSVG('check', 58); S.sfx('ok');
      } else if (state === 'avoid') {
        c.style.borderColor = '#d6334f'; c.style.opacity = 0.42; c.style.filter = 'grayscale(.7)'; c.style.transform = 'scale(.97)';
        p.setAttribute('stroke', '#6b7794'); p.setAttribute('stroke-dasharray', '2 14'); p.setAttribute('opacity', '.25');
        bd.style.display = 'flex'; bd.innerHTML = FE.iconSVG('cross', 58); S.sfx('no');
      } else if (state === 'ok') {
        c.style.borderColor = '#1f9d62'; bd.style.display = 'flex'; bd.innerHTML = FE.iconSVG('check', 58, { c: '#7fbf9a' });
      } else if (state === 'clear') { c.style.borderColor = 'transparent'; c.style.opacity = 1; c.style.filter = ''; c.style.transform = ''; c.style.boxShadow = '0 10px 30px rgba(0,0,0,.4)'; bd.style.display = 'none'; p.setAttribute('stroke', '#9db4e8'); p.setAttribute('stroke-width', '7'); p.setAttribute('stroke-dasharray', '2 16'); p.setAttribute('opacity', '.8'); p.classList.remove('flow'); p.style.filter = ''; }
    };
    ctl.conseq = (i, label, maybe) => { const q = cards[i].querySelector('.cq'); q.style.display = 'block'; q.innerHTML = (maybe === false ? '' : `<span style="color:#7a5cd0;font-weight:800">${UB('maybe')}</span> `) + UB(label); S.sfx('page'); };
    return ctl;
  };

  /* ---------------------------------------------------------------- CHIPS: colour + label + position grammar formula */
  act.chips = function (S, cfg) {
    const root = S.ui('', 'chiproot', { left: cfg.x + 'px', top: cfg.y + 'px', position: 'absolute', display: 'flex', alignItems: 'flex-start', gap: '14px', zIndex: 12, fontSize: (cfg.size || 66) + 'px', transform: cfg.center ? 'translateX(-50%)' : '' });
    const els = [];
    cfg.items.forEach((it, i) => {
      if (it.plus) { const p = h('div', { class: 'anim', style: { alignSelf: 'flex-start', marginTop: '0.35em' }, html: U('+') }); p.querySelector('.u').style.setProperty('--ipa', '#bfcbea'); root.appendChild(p); els.push(p); return; }
      const c = h('div', { class: 'anim chip', style: { textAlign: 'center' }, html: `<div class="tile t-${it.role}" style="padding:6px 22px 8px;font-size:1em;position:relative;box-shadow:0 8px 0 rgba(0,0,0,.28);cursor:default"><span class="cw">${U(it.role && it.t ? `{${it.role}|${it.t}}` : it.t || '')}</span></div><div style="font-size:.36em;margin-top:.5em;color:#ffd48a;font-weight:800">${it.label ? UB(it.label) : ''}</div>` });
      root.appendChild(c); els.push(c);
    });
    const ctl = { root, els };
    ctl.showAll = (gap) => els.forEach((e, i) => S.in(e, (gap || 0.35) * i));
    ctl.set = (i, t, role) => { const cw = els[i].querySelector('.cw'); cw.innerHTML = U(role ? `{${role}|${t}}` : t); };
    return ctl;
  };

  act.sequence = function (S, ctl, plan) { // demo mode helper: [{at, fn}]
    plan.forEach((p) => S.at(p.at, () => { if (S.mode === 'demo' || p.always) p.fn(); }));
  };
})(window);
