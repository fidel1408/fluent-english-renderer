/* Should for Advice — HUD, collapsible control bar, start card, gate, notes, tooltips, keyboard */
(function (g) {
  'use strict';
  const FE = g.FE, E = FE.engine, A = FE.audio;
  const { h, $, U, UB } = FE;
  const UI = (FE.ui = { barHidden: false, scale: 1 });

  const IC = {
    play: '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>', pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" stroke="none"/>',
    prev: '<path d="M6 5v14M19 5l-9 7 9 7z"/>', next: '<path d="M18 5v14M5 5l9 7-9 7z"/>',
    back5: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5"/><text x="12" y="16" font-size="9" font-weight="800" fill="currentColor" stroke="none" text-anchor="middle">5</text>',
    fwd5: '<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"/><text x="12" y="16" font-size="9" font-weight="800" fill="currentColor" stroke="none" text-anchor="middle">5</text>',
    replay: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/><path d="M12 8v4l3 2"/>', full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    vol: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    hint: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    tpause: '<circle cx="12" cy="13" r="8"/><path d="M10 10v6M14 10v6M9 3h6"/>', tplay: '<circle cx="12" cy="13" r="8"/><path d="M10.5 9.5v7l5.5-3.5zM9 3h6" />',
    trestart: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 3h6"/><path d="M4 4l3 3"/>', tskip: '<path d="M5 5l9 7-9 7zM18 5v14"/>', tplus: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
    notes: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>', flag: '<path d="M5 4v17M5 5h13l-2.5 4 2.5 4H5"/>', down: '<path d="M6 9l6 6 6-6"/>', up: '<path d="M5 19h14M6 14l6-6 6 6"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  };
  UI.svgIcon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

  /* tooltip made of word-over-IPA units */
  const tip = h('div', { id: 'tip', role: 'tooltip' });
  function tipShow(btn, label) {
    tip.innerHTML = UB(label); tip.style.display = 'block';
    const r = btn.getBoundingClientRect(), w = tip.offsetWidth;
    tip.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, r.left + r.width / 2 - w / 2)) + 'px';
    tip.style.top = Math.max(6, r.top - tip.offsetHeight - 8) + 'px';
  }
  function tipHide() { tip.style.display = 'none'; }
  function withTip(btn, label) {
    btn.setAttribute('aria-label', FE.plain(label)); btn.dataset.tip = label;
    btn.addEventListener('mouseenter', () => tipShow(btn, btn.dataset.tip)); btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) tipShow(btn, btn.dataset.tip); });
    btn.addEventListener('mouseleave', tipHide); btn.addEventListener('blur', tipHide); btn.addEventListener('click', tipHide);
    return btn;
  }
  function ib(icon, label, fn, cls) {
    const b = h('button', { class: 'ib ' + (cls || ''), type: 'button', html: UI.svgIcon(icon), onclick: fn });
    return withTip(b, label);
  }

  UI.build = function (root) {
    const app = (UI.app = h('div', { id: 'app' }));
    const vp = (UI.vp = h('div', { id: 'viewport' }));
    const stage = (UI.stage = h('div', { id: 'stage' }));
    vp.appendChild(stage);
    const mk = (id, cls) => { const d = h('div', { id, class: 'layer ' + (cls || '') }); stage.appendChild(d); return d; };
    const back = mk('envBack'), actorsL = mk('actorsL'), front = mk('envFront'), propsL = mk('propsL'), ui = mk('ui');
    actorsL.innerHTML = '<svg viewBox="0 0 1920 1080"><g id="actorsG"></g></svg>'; propsL.innerHTML = '<svg viewBox="0 0 1920 1080"><g id="propsG"></g></svg>';
    ui.style.pointerEvents = 'none';
    E.layers = { back, front, actors: $('#actorsG', actorsL), props: $('#propsG', propsL), ui };
    // global defs
    const defs = h('div', { html: '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + FE.SHARED_DEFS + '</defs></svg>' }); stage.appendChild(defs.firstChild);

    /* HUD */
    const hud = h('div', { id: 'hud' });
    hud.innerHTML = `<div class="logo-card"><img id="logoImg" alt="Fluent English" src="${FE.LOGO}"></div>
      <div id="hudTitle"><div id="hudCh"></div><div id="hudSeg"></div></div><div class="chips" id="chips"></div>
      <div id="hudRight"><div class="clock" id="clkPlan"><b>00:00 / 60:00</b>${UB('planned')}</div><div class="clock" id="clkAct"><b>00:00</b>${UB('class time')}</div></div>`;
    stage.appendChild(hud);
    stage.appendChild(h('div', { id: 'actTimer', html: `<div><div class="tm" id="tmVal">00:00</div></div><div class="tl">${UB('time')}</div><div class="bar"><i id="tmBar"></i></div>` }));
    const at = $('#actTimer', stage);
    at.insertBefore(h('button', { class: 'tbtn', type: 'button', id: 'tmPause', html: UI.svgIcon('tpause'), onclick: () => E.toggle() }), at.firstChild);
    at.appendChild(h('button', { class: 'tbtn', type: 'button', id: 'tmPlus', html: UI.svgIcon('tplus'), onclick: () => E.extend(60) }));
    at.appendChild(h('button', { class: 'tbtn', type: 'button', id: 'tmHint', html: UI.svgIcon('hint'), onclick: () => UI.hint() }));
    at.appendChild(h('button', { class: 'tbtn', type: 'button', id: 'tmReveal', html: UI.svgIcon('eye'), onclick: () => UI.reveal() }));
    withTip($('#tmPause', at), 'pause timer'); withTip($('#tmPlus', at), 'more time'); withTip($('#tmHint', at), 'hint'); withTip($('#tmReveal', at), 'show answer');
    stage.appendChild(h('div', { id: 'gate' }));
    stage.appendChild(h('div', { id: 'notes', class: 'panel' }));
    stage.appendChild(h('div', { id: 'toast' }));
    stage.appendChild(h('div', { id: 'modal' }));
    stage.appendChild(UI.buildStart());

    /* control bar */
    const bar = (UI.bar = h('div', { id: 'bar', role: 'toolbar', 'aria-label': 'Lesson controls' }));
    UI.playBtn = ib('play', 'play', () => E.toggle(), 'big');
    bar.append(UI.playBtn, ib('prev', 'previous chapter', () => E.chapterJump(-1)), ib('back5', 'back five seconds', () => E.seek(-5)), ib('fwd5', 'forward five seconds', () => E.seek(5)), ib('next', 'next chapter', () => E.chapterJump(1)), ib('replay', 'replay this example', () => E.replay()));
    bar.appendChild(h('span', { class: 'sep' }));
    const tl = h('div', { class: 'tl' });
    UI.tCur = h('span', { text: '00:00' }); UI.tTot = h('span', { text: '60:00' });
    UI.slider = h('input', { type: 'range', min: 0, max: FE.TOTAL - 1, step: 1, value: 0, 'aria-label': 'Lesson timeline' });
    const tk = h('div', { class: 'tk' }); const ticks = h('div', { class: 'ticks' });
    FE.chapters.forEach((c) => ticks.appendChild(h('i', { style: { left: (c.a / FE.TOTAL * 100) + '%' } })));
    tk.append(ticks, UI.slider); tl.append(UI.tCur, tk, UI.tTot); bar.appendChild(tl);
    UI.slider.addEventListener('input', () => { UI.seeking = true; UI.tCur.textContent = FE.fmtTime(+UI.slider.value); });
    UI.slider.addEventListener('change', () => { UI.seeking = false; E.goto(+UI.slider.value); });
    bar.appendChild(h('span', { class: 'sep' }));
    bar.append(ib('hint', 'hint', () => UI.hint()), ib('eye', 'show answer', () => UI.reveal()));
    bar.append(UI.tPause = ib('tpause', 'pause timer', () => E.toggle()), ib('trestart', 'restart timer', () => E.restartTimer()), ib('tskip', 'skip', () => E.skipTimer()), ib('tplus', 'more time', () => E.extend(60)));
    bar.appendChild(h('span', { class: 'sep' }));
    UI.modeBtn = h('button', { class: 'modeb', type: 'button', onclick: () => E.setMode(E.mode === 'class' ? 'demo' : 'class') });
    withTip(UI.modeBtn, 'switch mode'); bar.appendChild(UI.modeBtn);
    // sound popover
    const pop = (UI.pop = h('div', { class: 'pop', id: 'soundPop', role: 'group', 'aria-label': 'Sound' }));
    [['nar', 'narration'], ['mus', 'music'], ['fx', 'effects']].forEach(([k, label]) => {
      const rng = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: A.vol[k], 'aria-label': label, oninput: (e) => A.setVol(k, +e.target.value) });
      const mb = h('button', { class: 'ib', type: 'button', html: UI.svgIcon(A.mute[k] ? 'mute' : 'vol'), onclick: () => { A.setMute(k, !A.mute[k]); mb.innerHTML = UI.svgIcon(A.mute[k] ? 'mute' : 'vol'); } });
      withTip(mb, 'mute ' + label);
      pop.appendChild(h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [mb, h('span', { html: UB(label), style: { minWidth: '90px' } }), rng]));
    });
    app.appendChild(pop);
    UI.soundBtn = ib('vol', 'sound', () => { pop.classList.toggle('on'); const r = UI.soundBtn.getBoundingClientRect(); pop.style.left = Math.max(6, Math.min(innerWidth - 260, r.left - 100)) + 'px'; });
    bar.append(UI.soundBtn, ib('notes', 'teacher notes', () => UI.toggleNotes()), UI.fsBtn = ib('full', 'full screen', () => UI.fullscreen()), ib('flag', 'restart lesson', () => UI.confirmRestart()));
    const hb = h('button', { class: 'hidebtn', type: 'button', id: 'hideBtn', 'aria-expanded': 'true', 'aria-controls': 'bar', html: UI.svgIcon('down') + UB('hide controls'), onclick: () => UI.setBar(true, true) });
    hb.setAttribute('aria-label', 'Hide controls'); hb.dataset.tip = 'hide controls (H)'; bar.append(h('span', { style: { flex: '0 0 4px' } }), hb);

    const show = (UI.showBtn = h('button', { id: 'showBtn', type: 'button', 'aria-label': 'Show controls', 'aria-controls': 'bar', 'aria-expanded': 'false', html: UI.svgIcon('up'), onclick: () => UI.setBar(false, true) }));
    show.style.color = '#fff'; show.querySelector('svg').style.cssText = 'stroke:#fff;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round';
    withTip(show, 'show controls (H)');
    app.append(vp, bar, show, tip); root.appendChild(app);
    document.body.classList.toggle('reduced', FE.reduced());

    // fitting
    const fit = () => {
      const r = vp.getBoundingClientRect(); const s = Math.min(r.width / 1920, r.height / 1080);
      UI.scale = s; stage.style.transform = `scale(${s})`;
      stage.style.left = Math.round((r.width - 1920 * s) / 2) + 'px'; stage.style.top = Math.round((r.height - 1080 * s) / 2) + 'px';
    };
    UI.fit = fit;
    new ResizeObserver(fit).observe(vp); window.addEventListener('resize', fit); fit();
    document.addEventListener('fullscreenchange', () => { fit(); UI.fsBtn.classList.toggle('on', !!document.fullscreenElement); });

    UI.bindKeys(); UI.bindEngine();
    UI.setBar(false, false); UI.renderMode(); UI.renderState();
  };

  /* ---------- collapsible bar: hides, releases its layout space, remembers state ---------- */
  UI.setBar = function (hidden, moveFocus) {
    UI.barHidden = !!hidden;
    UI.app.classList.toggle('bar-hidden', UI.barHidden);
    UI.bar.setAttribute('aria-hidden', UI.barHidden ? 'true' : 'false');
    if (UI.barHidden) UI.bar.setAttribute('inert', ''); else UI.bar.removeAttribute('inert');
    $('#hideBtn').setAttribute('aria-expanded', String(!UI.barHidden)); UI.showBtn.setAttribute('aria-expanded', String(!UI.barHidden));
    if (UI.pop) UI.pop.classList.remove('on');
    if (moveFocus) { if (UI.barHidden) UI.showBtn.focus({ preventScroll: true }); else $('#hideBtn').focus({ preventScroll: true }); }
    UI.fit && UI.fit(); // immediate fit; ResizeObserver refines while the height transition runs
    E.emit('bar', UI.barHidden);
  };
  UI.toggleBar = () => UI.setBar(!UI.barHidden, true);
  UI.fullscreen = function () {
    if (document.fullscreenElement) document.exitFullscreen && document.exitFullscreen();
    else (document.documentElement.requestFullscreen || (() => {})).call(document.documentElement).catch(() => {});
  };

  UI.hint = function () { if (E.scene && !E.scene.doHint()) UI.toast('no hint here'); };
  UI.reveal = function () { if (E.scene) { if (E.scene.revealFns.length) E.scene.doReveal(); else UI.toast('nothing to reveal'); } };
  UI.toast = function (label, ms) { const t = $('#toast'); t.innerHTML = UB(label); t.classList.add('on'); clearTimeout(UI._tt); UI._tt = setTimeout(() => t.classList.remove('on'), ms || 1800); };
  UI.confirmRestart = function () {
    const m = $('#modal'); m.classList.add('on');
    m.innerHTML = `<div class="panel"><div>${UB('Restart the lesson from the beginning?')}</div><div style="margin-top:26px;display:flex;gap:20px;justify-content:center"><button class="btn" id="mYes" type="button">${UB('Restart')}</button><button class="btn ghost" id="mNo" type="button">${UB('Cancel')}</button></div></div>`;
    $('#mYes').onclick = () => { m.classList.remove('on'); E.restart(); UI.showStart(); }; $('#mNo').onclick = () => m.classList.remove('on');
    $('#mNo').focus();
  };
  UI.toggleNotes = function () {
    const n = $('#notes'); n.classList.toggle('on');
    if (n.classList.contains('on')) UI.renderNotes();
  };
  UI.renderNotes = function () {
    const n = $('#notes'); if (!n.classList.contains('on')) return;
    const s = E.scene; const html = (s && s.notesHTML) || '';
    n.innerHTML = `<h4>${UB('Teacher notes')}</h4>` + (html || `<p>${UB('Let learners speak first. Praise sensible ideas. Then reveal the model.')}</p>`);
  };

  /* ---------- start card ---------- */
  UI.buildStart = function () {
    const s = h('div', { id: 'start' });
    s.innerHTML = `<div class="logo-card" style="left:80px;top:90px;width:520px;height:283px;border-radius:30px"><img alt="Fluent English" src="${FE.LOGO}"></div>
      <div style="position:absolute;left:80px;top:420px;width:620px;font-size:36px;line-height:1.1">${UB('An interactive class for adult learners', 'ub')}</div>
      <div style="position:absolute;left:80px;top:640px;width:640px;font-size:27px;line-height:1.12;color:#cdd8f2">${UB('You share your screen. Learners answer aloud, in pairs, or in chat.')}</div>
      <div class="box"><h1 id="startTitle"></h1>
        <div class="lab" style="font-size:30px;margin-top:6px">${UB('Choose a mode')}</div>
        <div class="modes">
          <button class="mode sel" type="button" data-m="class"><h3>${UB('Class mode')}</h3><div class="d">${UB('Pauses at each activity until you continue.')}</div></button>
          <button class="mode" type="button" data-m="demo"><h3>${UB('Demo mode')}</h3><div class="d">${UB('Follows the sixty minute plan by itself.')}</div></button>
        </div>
        <div class="tips"><span class="kbd">H</span><div>${UB('Hide or show the controls. A small button stays in the corner.')}</div></div>
        <button class="btn bigstart" id="startBtn" type="button">${UI.svgIcon('play').replace('<svg', '<svg style="width:46px;height:46px"')}${UB('Start the lesson')}</button>
      </div>
      <div class="ptr" style="left:1700px;top:900px;font-size:26px;text-align:center;width:210px">${UB('Controls are here')}<div style="font-size:60px;line-height:1">&#8595;</div></div>`;
    s.querySelector('#startTitle').innerHTML = U('Should for Advice');
    s.querySelectorAll('.mode').forEach((b) => b.addEventListener('click', () => { s.querySelectorAll('.mode').forEach((x) => x.classList.toggle('sel', x === b)); E.mode = b.dataset.m; UI.renderMode(); }));
    s.querySelector('#startBtn').addEventListener('click', () => { UI.hideStart(); E.start(E.mode); UI.setBar(true, false); UI.toast('Press H to show the controls', 4500); });
    UI.startEl = s; return s;
  };
  UI.hideStart = function () { UI.startEl.style.display = 'none'; };
  UI.showStart = function () { UI.startEl.style.display = ''; UI.setBar(false, false); };

  /* ---------- HUD + state rendering ---------- */
  UI.renderMode = function () {
    UI.modeBtn.innerHTML = (E.mode === 'class' ? UB('Class mode') : UB('Demo mode'));
    UI.modeBtn.classList.toggle('on', E.mode === 'demo');
    UI.startEl.querySelectorAll('.mode').forEach((x) => x.classList.toggle('sel', x.dataset.m === E.mode));
  };
  UI.renderState = function () {
    UI.playBtn.innerHTML = UI.svgIcon(E.playing ? 'pause' : 'play');
    UI.playBtn.setAttribute('aria-label', E.playing ? 'Pause' : 'Play'); UI.playBtn.dataset.tip = E.playing ? 'pause' : 'play';
    const tp = $('#tmPause'); if (tp) tp.innerHTML = UI.svgIcon(E.playing ? 'tpause' : 'tplay');
    if (UI.tPause) UI.tPause.innerHTML = UI.svgIcon(E.playing ? 'tpause' : 'tplay');
  };
  UI.renderSeg = function () {
    const s = E.seg; if (!s) return;
    const c = FE.chapters[s.ch - 1];
    $('#hudCh').innerHTML = `<span class="chn">${s.ch}</span>${UB(c.title)}`;
    $('#hudSeg').innerHTML = UB(s.title);
    $('#chips').innerHTML = FE.chapters.map((x) => `<i class="${x.n < s.ch ? 'done' : x.n === s.ch ? 'cur' : ''}" data-n="${x.n}"></i>`).join('');
    UI.renderNotes();
    $('#gate').classList.remove('on');
  };
  UI.renderClocks = function () {
    if (!UI.seeking) { UI.slider.value = Math.floor(E.T); UI.tCur.textContent = FE.fmtTime(E.T); }
    $('#clkPlan b').textContent = FE.fmtTime(E.T) + ' / 60:00';
    $('#clkAct b').textContent = FE.fmtTime(E.actual());
    const cur = $('#chips i.cur'); if (cur) { const c = FE.chapters[E.seg.ch - 1]; cur.style.setProperty('--p', (100 * (E.T - c.a) / (c.b - c.a)).toFixed(1) + '%'); }
    const ti = E.timerInfo(), at = $('#actTimer');
    if (ti && (ti.started || ti.gate)) {
      at.classList.add('on'); const rem = Math.ceil(ti.rem - 0.001);
      $('#tmHint').style.display = E.scene.hints.length ? '' : 'none'; $('#tmReveal').style.display = E.scene.revealFns.length ? '' : 'none';
      $('#tmVal').textContent = FE.fmtTime(rem); $('#tmBar').style.setProperty('--p', Math.min(100, 100 * ti.rem / ti.total) + '%');
      at.classList.toggle('low', rem <= 10 && rem > 0); at.classList.toggle('over', E.gate);
    } else at.classList.remove('on');
    const ds = ti ? 'inline-flex' : 'none';
  };
  UI.renderGate = function (on) {
    const gt = $('#gate');
    if (!on) { gt.classList.remove('on'); return; }
    const s = E.scene, canRev = s && s.revealFns.length && !s.revealed;
    gt.innerHTML = `<div>${UB('Time is up. Continue when you are ready.')}</div>` +
      (canRev ? `<button class="btn ghost" id="gReveal" type="button">${UB('Show answer')}</button>` : '') +
      `<button class="btn ghost" id="gMore" type="button">${UB('More time')}</button><button class="btn" id="gGo" type="button">${UB('Continue')}</button>`;
    gt.classList.add('on');
    const gr = $('#gReveal'); if (gr) gr.onclick = () => { s.doReveal(); gr.remove(); };
    $('#gMore').onclick = () => { E.gate = false; gt.classList.remove('on'); E.ext = 60; E.local = E.seg.dur; };
    $('#gGo').onclick = () => E.continueGate(); $('#gGo').focus({ preventScroll: true });
    A.sfx('bell');
  };

  UI.bindEngine = function () {
    E.on('seg', () => { UI.renderSeg(); UI.renderClocks(); });
    E.on('state', UI.renderState); E.on('mode', () => { UI.renderMode(); });
    E.on('gate', (on) => UI.renderGate(on));
    E.on('toast', (l) => { if (l === 'extend') UI.toast('One more minute'); });
    E.on('restarted', () => { UI.renderSeg(); });
    E.on('finish', () => UI.toast('The lesson is finished'));
    let last = 0;
    E.on('tick', () => { const n = performance.now(); if (n - last > 200) { last = n; UI.renderClocks(); } });
    setInterval(() => { if (E.started) UI.renderClocks(); }, 1000);
  };

  UI.bindKeys = function () {
    document.addEventListener('keydown', (e) => {
      const t = e.target, tag = t && t.tagName, editable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') { $('#modal').classList.remove('on'); $('#notes').classList.remove('on'); UI.pop.classList.remove('on'); return; }
      const textual = tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && t.type !== 'range' && t.type !== 'checkbox') || (t && t.isContentEditable);
      if (textual) return;
      const k = e.key;
      if (k === 'h' || k === 'H') { e.preventDefault(); UI.toggleBar(); return; }
      if (!E.started) return;
      if (tag === 'BUTTON' && (k === ' ' || k === 'Enter')) return;
      if (tag === 'INPUT' && t.type === 'range') return;
      if (k === ' ') { e.preventDefault(); E.toggle(); }
      else if (k === 'ArrowRight') { e.preventDefault(); E.seek(5); } else if (k === 'ArrowLeft') { e.preventDefault(); E.seek(-5); }
      else if (k === 'f' || k === 'F') UI.fullscreen(); else if (k === 'n' || k === 'N') E.chapterJump(1); else if (k === 'p' || k === 'P') E.chapterJump(-1);
      else if (k === 'r' || k === 'R') E.replay();
    });
    document.addEventListener('click', (e) => { const path = e.composedPath ? e.composedPath() : []; if (UI.pop && !path.includes(UI.pop) && !path.includes(UI.soundBtn)) UI.pop.classList.remove('on'); });
  };
})(window);
