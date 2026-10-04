/* Should for Advice — shared helpers for chapter content */
(function (g) {
  'use strict';
  const FE = g.FE, { h, U, UB } = FE;
  const C = (FE.C = {});

  /* optional hint card (text only appears when requested) */
  C.hintText = function (S, text, pos) {
    S.hint(() => {
      const el = S.ui(`<div class="lab">${UB('Hint')}</div><div style="font-size:32px">${UB(text)}</div>`, 'paper card hintcard anim', pos || {});
      el.style.position = 'absolute'; S.sfx('pop'); S.in(el);
      S.timeout(() => S.out(el), 14000);
    });
  };
  C.playClip = function (S, key) { if (!S.fast && !FE.qa && S.seg.C[key]) FE.audio.play(S.seg.C[key].id, 0, S.seg.C[key].who); };
  /* play clips in order as one chain: a later clip never replaces an earlier one that is still speaking (and pause/seek/replay cancel the whole chain) */
  C.playSeq = function (S, keys) {
    if (S.fast || FE.qa) return;
    const cl = keys.map((k) => S.seg.C[k]).filter(Boolean).map((c) => ({ id: c.id, who: c.who }));
    if (cl.length) FE.audio.play(cl[0].id, 0, cl[0].who, cl.slice(1));
  };
  /* big labelled prop floating over the scene */
  C.prop = function (S, name, x, y, s, o) {
    const gEl = S.svg(`<g class="pv"><g transform="translate(${x} ${y}) scale(${s || 2})" filter="url(#fe-sh)">${FE.icon(name, o || {})}</g></g>`, 'anim');
    return gEl;
  };
  C.badge = function (S, n, x, y) { // numbered round badge, digit only
    return S.ui(String(n), 'anim badge', { position: 'absolute', left: x + 'px', top: y + 'px', width: '64px', height: '64px', borderRadius: '50%', background: '#ffb540', color: '#2a1a00', fontWeight: 800, fontSize: '40px', textAlign: 'center', lineHeight: '64px', boxShadow: '0 6px 16px rgba(0,0,0,.4)', zIndex: 15 });
  };
  /* Plain label with word-over-IPA, white caption pill */
  C.caption = function (S, text, x, y, o) {
    o = o || {};
    return S.ui(UB(text), 'anim', { position: 'absolute', left: x + 'px', top: y + 'px', width: o.w ? o.w + 'px' : '', textAlign: 'center', padding: '8px 22px 10px', borderRadius: '20px', background: o.dark === false ? '#fbf8f1' : 'rgba(10,16,30,.82)', border: '1.5px solid rgba(255,255,255,.18)', fontSize: (o.size || 38) + 'px', zIndex: 16, color: o.dark === false ? '#121b33' : '#fff', '--ipa': o.dark === false ? '#4f5d7d' : '#bfcbea' });
  };
  C.say = function (S, key, actor, x, y, extra) {
    return S.say(key, Object.assign({ actor, x, y, side: 'right' }, extra || {}));
  };
  /* soft dark veil behind panels so the scene stays visible but quiet */
  C.dim = function (S, op, color) {
    const d = S.ui('', 'dimveil', { position: 'absolute', left: 0, top: 0, width: '1920px', height: '1080px', background: color || `linear-gradient(90deg,rgba(6,9,18,${op * 0.45}),rgba(6,9,18,${op}) 38%,rgba(6,9,18,${op}))`, pointerEvents: 'none', zIndex: 5 });
    return d;
  };
  /* thinking time ring (visual only: learners think / speak) */
  C.think = function (S, ref, secs, x, y, label) {
    const R = 54, circ = 2 * Math.PI * R;
    const el = S.ui(`<svg width="130" height="130" viewBox="-65 -65 130 130" style="position:absolute;left:0;top:0"><circle r="${R}" fill="rgba(10,16,30,.85)" stroke="rgba(255,255,255,.2)" stroke-width="9"/><circle class="tr" r="${R}" fill="none" stroke="#ffb540" stroke-width="9" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="${circ}" stroke-dashoffset="0"/></svg><div style="position:absolute;left:-30px;top:132px;width:190px;text-align:center;font-size:30px;color:#ffd48a;font-weight:800">${UB(label || 'Think')}</div>`, 'anim', { position: 'absolute', left: x + 'px', top: y + 'px', width: '130px', height: '130px', zIndex: 16 });
    const t0 = S.t(ref); if (t0 + secs > S.seg.dur - 0.3) FE.layoutIssues.push(`segment ${S.seg.id}: ring ends ${(t0 + secs).toFixed(1)}s > ${S.seg.dur}s`);
    // the ring is driven by the scene clock (not a CSS transition) so pause freezes it
    S.at(t0, () => { if (S.fast) return; S.in(el); const tr = el.querySelector('.tr'); let el_t = 0; S.ticker((dt) => { el_t += dt; tr.style.strokeDashoffset = String(Math.min(1, el_t / secs) * circ); }); });
    S.at(t0 + secs, () => { S.out(el); });
    return el;
  };
  /* click a bubble to hear the line again */
  C.replayable = function (S, bubble, key) {
    bubble.el.classList.add('rp');
    bubble.el.querySelector('.txt').insertAdjacentHTML('beforeend', '<span class="rpi" aria-hidden="true">&#9654;</span>');
    bubble.el.setAttribute('role', 'button'); bubble.el.setAttribute('tabindex', '0'); bubble.el.setAttribute('aria-label', 'Replay this line');
    const go = () => { const ln = S.seg.L[key]; if (!FE.qa) FE.audio.play(ln.id, 0, ln.who); S.sfx('click'); };
    bubble.el.addEventListener('click', go); bubble.el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  };
  /* word tiles that slide between two orders (statement -> question) */
  C.sortChips = function (S, cfg) {
    const root = S.ui('', 'sortroot', { position: 'absolute', left: cfg.x + 'px', top: cfg.y + 'px', height: (cfg.h || 150) + 'px', width: (cfg.w || 1200) + 'px', fontSize: (cfg.size || 70) + 'px', zIndex: 14 });
    const els = cfg.items.map((it) => {
      const b = document.createElement('div'); b.className = 'tile t-' + (it.role || 'o'); b.style.cssText = `font-size:${cfg.size || 70}px;position:absolute;left:0;top:0;transition:left .9s cubic-bezier(.4,0,.2,1),top .9s cubic-bezier(.4,0,.2,1),opacity .5s;cursor:default`;
      b.innerHTML = '<span class="tile-in">' + U(it.role ? `{${it.role}|${it.t}}` : it.t) + '</span>'; root.appendChild(b); return b;
    });
    const ctl = { root, els, items: cfg.items };
    ctl.set = (i, t, role) => { els[i].querySelector('.tile-in').innerHTML = U(role ? `{${role}|${t}}` : t); };
    ctl.layout = (order, row) => {
      let x = 0; const gap = cfg.gap || 18;
      order.forEach((i) => { const e = els[i]; e.style.transition = S.fast ? 'none' : ''; e.style.left = x + 'px'; e.style.top = (row || 0) * (cfg.rowH || 0) + 'px'; e.style.opacity = 1; x += e.offsetWidth + gap; });
      els.forEach((e, i) => { if (!order.includes(i)) e.style.opacity = 0; });
      if (FE.ui && FE.ui.compact) { order.forEach((i) => { els[i].style.display = ''; root.appendChild(els[i]); }); els.forEach((e, i) => { if (!order.includes(i)) e.style.display = 'none'; }); } // small screens: tiles reflow in the new order
    };
    return ctl;
  };
  /* tappable transcript (teacher can replay individual lines) */
  C.transcript = function (S, keys, x, y, w) {
    const rows = keys.map((k) => { const ln = S.seg.L[k]; const nm = ln.who === 'narr' ? '' : FE.CHARS[ln.who].name; return `<div data-k="${k}" role="button" tabindex="0" style="display:flex;align-items:center;gap:14px;padding:6px 10px;border-radius:14px;cursor:pointer;font-size:30px" class="trow"><span style="width:44px;height:44px;border-radius:50%;background:#ffb540;color:#2a1a00;display:flex;align-items:center;justify-content:center;flex:none"><svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#2a1a00"><path d="M8 5v14l11-7z"/></svg></span><span style="width:120px;flex:none;color:#ffd48a;font-weight:800">${nm ? UB(nm) : ''}</span><span style="text-align:left">${UB(ln.text)}</span></div>`; }).join('');
    const el = S.ui(`<div class="lab">${UB('Tap a line to hear it again')}</div>${rows}`, 'panel anim', { left: x + 'px', top: y + 'px', width: w + 'px', zIndex: 15, padding: '14px 18px 16px' });
    el.querySelectorAll('.trow').forEach((r) => { const go = () => { const ln = S.seg.L[r.dataset.k]; if (!FE.qa) FE.audio.play(ln.id, 0, ln.who); S.sfx('click'); el.querySelectorAll('.trow').forEach((q) => { q.style.background = ''; }); r.style.background = 'rgba(255,181,64,.2)'; }; r.addEventListener('click', go); r.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); });
    return el;
  };
  C.notes = function (S, items) {
    S.notes(items.map((t) => `<p>${UB(t)}</p>`).join(''));
  };
  /* arrange an actor's gaze to another actor */
  C.face = function (a, b) { a.lookAtActor(b); };
  C.step = function (a, pose) { a.setArms(pose[0], pose[1]); };
})(window);
