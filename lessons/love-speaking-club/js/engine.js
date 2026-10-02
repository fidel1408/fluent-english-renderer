/* Fluent English - Love Speaking Club
 * engine.js : state + persistence, artboard scaling, control bar (hideable), drawers, timer, narration
 * (recorded voice / teacher reads / off), optional original generative music, chapter navigation, Demo mode.
 * The teacher operates everything. Nothing here listens to students or advances by itself in Class Mode.
 */
(function (g) {
  'use strict';
  const LC = g.LC, I = g.I, Art = g.Art, Anim = Art.Anim;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const qs = new URLSearchParams(location.search);

  /* =========================================================== STATE */
  const KEY = 'fe-love-speaking-club-v1';
  const DEF = () => ({ v: 1, mode: 'class', ch: 0, step: {}, controls: 'shown', vol: 0.9, music: false, musicVol: 0.25, voice: 'voice', reduced: 'auto', demoSecs: 20, demoAuto: false, c: {}, notes: '', roster: { n: 6, rec: {} }, started: false });
  const State = {
    d: DEF(), _t: null, ok: true,
    load() { try { const raw = localStorage.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && o.v === 1) this.d = Object.assign(DEF(), o); } } catch (e) { this.ok = false; } },
    save() { clearTimeout(this._t); this._t = setTimeout(() => this.flush(), 120); },
    flush() { try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch (e) { this.ok = false; } },
    c(id) { return this.d.c[id] || (this.d.c[id] = {}); },
    wipe() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } this.d = DEF(); }
  };
  if (!qs.get('fresh')) State.load();

  /* =========================================================== BOARD FIT */
  const app = $('#app'), wrap = $('#stageWrap'), board = $('#board');
  function fit() {
    const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
    const s = Math.min(w / 1600, h / 900);
    board.style.transform = `translate(${-800 * s}px,${-450 * s}px) scale(${s})`;
    board.dataset.scale = s.toFixed(4);
    document.documentElement.style.setProperty('--bs', s);
  }
  new ResizeObserver(fit).observe(wrap); window.addEventListener('resize', fit);

  /* =========================================================== ICONS */
  const IC = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1"/><rect x="13.8" y="5" width="4.2" height="14" rx="1"/></svg>',
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/></svg>',
    chapters: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
    timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9v5l3 2M9.5 3h5"/></svg>',
    words: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4z"/><path d="M9 9h6M9 13h4"/></svg>',
    starters: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    mode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    hide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l7 7 7-7"/><path d="M4 20h16"/></svg>',
    show: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15l7-7 7 7"/><path d="M4 4h16"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  g.FE_IC = IC;

  /* =========================================================== VOICE (narration) */
  const MAN = g.AUDIO_MANIFEST || {};
  const Voice = {
    el: new Audio(), tok: 0, cur: null, state: 'idle', bound: {}, fakeTimer: null, pendingTeacher: null,
    bind(who, fig) { this.bound[who] = fig; }, unbindAll() { this.bound = {}; },
    dur(id) { const m = MAN[id]; if (m) return m.d * 1000; const n = LC.NAR[id]; return n ? Math.max(1200, n.text.length * 62) : 1500; },
    /* offsets (ms) of each line if played in order with a gap */
    timeline(ids, gap) { gap = gap == null ? 380 : gap; let t = 0; const out = []; ids.forEach((id) => { out.push({ id, at: t, dur: this.dur(id) }); t += this.dur(id) + gap; }); return { lines: out, total: t - gap }; },
    mode() { return State.d.voice; },
    stop() {
      this.tok++; this.state = 'idle'; this.cur = null;
      try { this.el.pause(); } catch (e) { /* ignore */ }
      this.el.onended = null; this.el.onerror = null;
      this.stopTalk(); clearTimeout(this.fakeTimer);
      Narr.hide(); Music.setTalk(null);
    },
    stopTalk() { Object.values(this.bound).forEach((f) => { try { f.stopTalk(); } catch (e) { /* ignore */ } }); },
    pause() { if (this.state === 'playing') { this.el.pause(); this.state = 'paused'; Anim.pause(); this.stopTalkFrozen = true; } else if (this.state === 'idle') { Anim.pause(); this.state = 'paused-anim'; } },
    resume() { if (this.state === 'paused') { this.el.play().catch(() => { }); this.state = 'playing'; } this.state = this.state === 'paused-anim' ? 'idle' : this.state; Anim.resume(); },
    togglePause() { if (this.state === 'playing' || (this.state === 'idle' && !Anim.paused)) { this.pause(); return true; } this.resume(); return false; },
    isPaused() { return Anim.paused; },
    /* Say a list of narration ids in order. Never overlaps: a new say() cancels the previous one first. */
    say(ids, o) {
      o = o || {}; ids = [].concat(ids); this.stop(); const tok = this.tok; this.cur = ids;
      const mode = this.mode();
      return new Promise((resolve) => {
        const run = (i) => {
          if (tok !== this.tok) return resolve(false);
          if (i >= ids.length) { this.state = 'idle'; Music.setTalk(null); this.stopTalk(); if (o.onDone) o.onDone(); return resolve(true); }
          const id = ids[i], line = LC.NAR[id]; if (!line) return run(i + 1);
          const fig = this.bound[line.who];
          const m = MAN[id];
          const next = () => { if (tok !== this.tok) return; this.stopTalk(); const t = setTimeout(() => run(i + 1), (o.gap == null ? 380 : o.gap)); this.fakeTimer = t; };
          Music.setTalk(line.who);
          if (mode === 'off') { this.fakeTalk(fig, this.dur(id)); this.fakeTimer = setTimeout(next, this.dur(id)); this.state = 'playing'; return; }
          if (mode === 'teacher' || !m) { Narr.show(line.who, [line.text], this.dur(id)); this.fakeTalk(fig, this.dur(id)); this.fakeTimer = setTimeout(next, this.dur(id)); this.state = 'playing'; return; }
          const el = this.el; el.src = m.f; el.volume = clamp(State.d.vol, 0, 1);
          el.onended = () => { if (tok === this.tok) next(); };
          el.onerror = () => { if (tok !== this.tok) return; Narr.show(line.who, [line.text], this.dur(id)); this.fakeTalk(fig, this.dur(id)); this.fakeTimer = setTimeout(next, this.dur(id)); };
          const pr = el.play();
          this.state = 'playing';
          if (pr && pr.catch) pr.catch(() => { if (tok !== this.tok) return; Narr.show(line.who, [line.text], this.dur(id)); this.fakeTalk(fig, this.dur(id)); this.fakeTimer = setTimeout(next, this.dur(id)); });
          if (fig && m.env) { const env = m.env; fig.startTalk(() => { const t = el.currentTime; const k = Math.floor(t * 25); const v = env.charCodeAt(k) - 48; return isNaN(v) || v < 0 ? 0 : v / 9; }); }
        };
        run(0);
      });
    },
    fakeTalk(fig, ms) { if (!fig) return; const t0 = performance.now(); fig.startTalk(() => { const e = performance.now() - t0; if (e > ms) return 0; return .35 + .55 * Math.abs(Math.sin(e / 135)) * (.6 + .4 * Math.sin(e / 410)); }); },
    replayCurrent() { if (this.cur) return this.say(this.cur); return Promise.resolve(false); }
  };

  /* narration card for "Teacher reads" mode and failed audio */
  const Narr = {
    el: $('#narr'),
    names: { nar: 'Narrator', alex: 'Alex', maya: 'Maya', sam: 'Sam', nora: 'Nora' },
    show(who, lines, ms) {
      clearTimeout(this.t); this.t = setTimeout(() => this.hide(), Math.max(7000, (ms || 0) + 3500));
      this.el.innerHTML = `<div class="who">${I(this.names[who] || 'Narrator')}</div>` + lines.map((t) => `<div class="line">${I(t)}</div>`).join('') + `<button class="btn btn-ink sm" data-narr-close type="button" style="background:var(--navy2);color:var(--ivory)">${I('Done reading')}</button>`;
      this.el.classList.add('on');
    },
    hide() { this.el.classList.remove('on'); }
  };
  $('#narr').addEventListener('click', (e) => { if (e.target.closest('[data-narr-close]')) Narr.hide(); });

  /* =========================================================== MUSIC (original, generative, optional) */
  const Music = {
    ctx: null, master: null, on: false, talkWho: null, discuss: false, timer: null, step: 0, nodes: [], pluckT: null,
    ensure() {
      if (this.ctx) return true;
      const AC = g.AudioContext || g.webkitAudioContext; if (!AC) return false;
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0;
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = .4;
      this.lp = lp; lp.connect(this.master); this.master.connect(this.ctx.destination);
      return true;
    },
    /* chord progression: Am9 - Fmaj7 - Cadd9 - G6 ; slow, soft, original */
    chords: [[110, 164.81, 196, 246.94, 329.63], [87.31, 130.81, 174.61, 220, 329.63], [130.81, 196, 261.63, 329.63, 392], [98, 146.83, 196, 246.94, 293.66]],
    pent: [440, 493.88, 587.33, 659.25, 783.99, 880],
    startLoop() {
      if (this.timer) return; const ctx = this.ctx; const bar = 6.0;
      const playChord = () => {
        const t = ctx.currentTime; const ch = this.chords[this.step % 4]; this.step++;
        ch.forEach((f, i) => {
          const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 2) * 3;
          gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(.075 / (1 + i * .25), t + 2.2); gn.gain.linearRampToValueAtTime(0, t + bar + 1.4);
          o.connect(gn); gn.connect(this.lp); o.start(t); o.stop(t + bar + 1.6);
        });
      };
      const pluck = () => {
        if (!this.on) return; const t = ctx.currentTime; const f = this.pent[Math.floor(Math.random() * this.pent.length)];
        const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = 'sine'; o.frequency.value = f;
        gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(.05, t + .02); gn.gain.exponentialRampToValueAtTime(.0008, t + 2.6);
        o.connect(gn); gn.connect(this.lp); o.start(t); o.stop(t + 2.8);
        this.pluckT = setTimeout(pluck, 2600 + Math.random() * 3600);
      };
      playChord(); this.timer = setInterval(playChord, bar * 1000); this.pluckT = setTimeout(pluck, 1800);
    },
    stopLoop() { clearInterval(this.timer); this.timer = null; clearTimeout(this.pluckT); },
    target() { if (!this.on) return 0; if (this.discuss) return 0; const duck = this.talkWho ? 0.18 : 1; return clamp(State.d.musicVol, 0, 1) * 0.9 * duck; },
    apply() { if (!this.ctx) return; const t = this.ctx.currentTime; this.master.gain.cancelScheduledValues(t); this.master.gain.setTargetAtTime(this.target(), t, this.discuss ? .9 : .5); },
    set(on) { State.d.music = on; State.save(); if (on) { if (!this.ensure()) return; if (this.ctx.state === 'suspended') this.ctx.resume(); this.on = true; this.startLoop(); } else { this.on = false; if (this.ctx) { this.apply(); setTimeout(() => { if (!this.on) this.stopLoop(); }, 2500); } } this.apply(); updateBar(); },
    setTalk(who) { this.talkWho = who; this.apply(); },
    setDiscuss(v) { this.discuss = !!v; this.apply(); }
  };

  /* =========================================================== TIMER (optional, never advances anything in Class Mode) */
  const Timer = {
    total: 0, left: 0, running: false, iv: null, shown: false, done: false,
    fmt(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
    set(secs) { this.total = secs; this.left = secs; this.done = false; this.shown = secs > 0; this.stop(); this.paint(); },
    start() { if (this.left <= 0) this.left = this.total; if (this.left <= 0) return; this.running = true; this.done = false; this.t0 = performance.now(); this.l0 = this.left; clearInterval(this.iv); this.iv = setInterval(() => this.tick(), 200); this.paint(); },
    stop() { this.running = false; clearInterval(this.iv); this.iv = null; },
    pause() { this.stop(); this.paint(); },
    reset() { this.stop(); this.left = this.total; this.done = false; this.paint(); },
    add(d) { this.total = Math.max(5, this.total + d); this.left = Math.max(0, this.left + d); this.shown = true; this.done = false; if (this.running) { this.t0 = performance.now(); this.l0 = this.left; } this.paint(); },
    hide() { this.stop(); this.shown = false; this.done = false; this.total = 0; this.left = 0; this.paint(); },
    tick() { this.left = Math.max(0, this.l0 - (performance.now() - this.t0) / 1000); if (this.left <= 0) { this.stop(); this.done = true; this.onDone && this.onDone(); } this.paint(); },
    paint() {
      const chip = $('#timerChip'); if (!chip) return;
      chip.classList.toggle('on', this.shown); chip.classList.toggle('done', this.done);
      const frac = this.total ? this.left / this.total : 0; const r = 13, c = 2 * Math.PI * r;
      chip.innerHTML = `<svg class="ring" viewBox="0 0 32 32"><circle cx="16" cy="16" r="${r}" fill="none" stroke="#E6D4B3" stroke-width="5"/><circle class="ring-svg" cx="16" cy="16" r="${r}" fill="none" stroke="${this.done ? '#0B1630' : '#B5214F'}" stroke-width="5" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}" stroke-linecap="round" style="transform-origin:16px 16px"/></svg><span>${this.fmt(this.left)}</span>`;
      chip.setAttribute('aria-label', 'Timer ' + this.fmt(this.left)); chip.setAttribute('role', 'timer');
      Drawers.refreshTimer();
    },
    onDone: null
  };

  /* =========================================================== DRAWERS */
  const dEl = $('#drawers');
  const Drawers = {
    open: null,
    spec: {
      chapters: { cls: 'left:60px;top:110px;width:1100px;height:690px', title: 'Chapters and plan' },
      words: { cls: 'right:60px;top:110px;width:980px;height:690px', title: 'Word bank' },
      starters: { cls: 'right:60px;top:110px;width:900px;height:690px', title: 'Sentence starters' },
      timer: { cls: 'right:60px;bottom:30px;width:720px;height:520px', title: 'Timer' },
      sound: { cls: 'right:60px;bottom:30px;width:820px;height:620px', title: 'Sound' },
      mode: { cls: 'right:60px;bottom:30px;width:860px;height:620px', title: 'Mode' }
    },
    init() {
      Object.keys(this.spec).forEach((k) => {
        const s = this.spec[k]; const d = document.createElement('section'); d.className = 'drawer'; d.id = 'dr-' + k; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', s.title);
        d.style.cssText = s.cls; d.innerHTML = `<header><div class="t-h3">${I(s.title)}</div><button class="btn btn-amber sm" data-dr-close type="button" aria-label="Close">${I('Close')}</button></header><div class="dbody"></div>`;
        dEl.appendChild(d);
      });
      dEl.addEventListener('click', (e) => {
        if (e.target.closest('[data-dr-close]')) { this.close(); return; }
        const a = e.target.closest('[data-dr]'); if (!a) return; this.act(a.dataset.dr, a.dataset.arg, a);
      });
      dEl.addEventListener('input', (e) => { const a = e.target.closest('[data-dri]'); if (a) this.input(a.dataset.dri, a); });
    },
    toggle(name) { if (this.open === name) this.close(); else this.show(name); },
    show(name) {
      this.close(true); this.open = name; const d = $('#dr-' + name); this.build(name); d.classList.add('open');
      const b = $('[data-dr-close]', d); if (b) b.focus({ preventScroll: true });
      updateBar();
    },
    close(silent) { if (!this.open) return; const d = $('#dr-' + this.open); d.classList.remove('open'); const was = this.open; this.open = null; if (!silent) { updateBar(); const t = $(`#bar [data-bar="${was}"]`); if (t && State.d.controls !== 'hidden') t.focus({ preventScroll: true }); } },
    body(name) { return $('.dbody', $('#dr-' + name)); },
    build(name) {
      const b = this.body(name); const U = LC.UI;
      if (name === 'chapters') {
        const tot = LC.PLAN.reduce((a, p) => ({ m: a.m + p.minutes, s: a.s + p.speak }), { m: 0, s: 0 });
        let h = `<div class="plan-row" style="cursor:default;font-weight:700"><span></span><span class="t-small">${I('Chapter')}</span><span class="t-small">${I('Minutes')}</span><span class="t-small">${I('Speaking')}</span></div>`;
        LC.PLAN.forEach((p, i) => {
          h += `<button class="plan-row${i === State.d.ch ? ' cur' : ''}" data-dr="go" data-arg="${i}" type="button"><span class="badge">${i + 1}</span><span class="t-small">${I(p.title)}</span><span class="t-small num">${p.minutes}</span><span class="t-small num">${p.speak}</span></button>`;
          h += `<div class="plan-seg">${p.segs.map((s) => I(s[0]) + ' <b class="num">(' + s[1] + ' / ' + s[2] + ')</b>').join(' &nbsp; ')}</div>`;
        });
        h += `<div class="plan-row" style="cursor:default;border-top:3px solid var(--ivory3);margin-top:8px"><span></span><span class="t-small"><b>${I('Planned time')} · ${I('Planned student speaking')}</b></span><span class="t-small num"><b>${tot.m}</b></span><span class="t-small num"><b>${tot.s}</b></span></div>`;
        h += `<div class="hr" style="margin:16px 0"></div><div class="t-small">${I(U.teacherNote)}</div><textarea class="note" data-dri="notes" aria-label="Teacher notes">${esc2(State.d.notes)}</textarea><div class="t-small" style="margin-top:12px">${I(U.honest)}</div>`;
        b.innerHTML = h;
      } else if (name === 'words') {
        let h = `<div class="t-small" style="margin-bottom:6px">${I('Open only when it helps. These words can support any speaking turn.')}</div>`;
        LC.BANK.forEach((w) => { h += `<div class="bank-item"><div><div class="t-h3">${I(w.w)}</div><div class="t-micro" style="color:#3C2A5C">${I(w.pos)}</div></div><div class="t-small">${I(w.def)}</div></div>`; });
        h += `<div class="t-micro" style="margin:18px 0 8px;color:var(--raspDk)">${I('Target words from this lesson')}</div><div class="row">${LC.TARGETS.map((t) => `<span class="chip">${I(t)}</span>`).join('')}</div>`;
        h += `<div class="row" style="margin-top:18px"><button class="btn ${this.chart ? 'btn-teal' : 'btn-ghost ivory'} sm" data-dr="chart" aria-pressed="${!!this.chart}" type="button">${I('Sound chart')}</button></div>${this.chart ? '<img src="assets/sound-chart.jpg" alt="Sound chart" style="width:100%;margin-top:14px;border-radius:14px;border:3px solid var(--ivory3)">' : ''}`;
        b.innerHTML = h;
      } else if (name === 'starters') {
        const S = LC.STARTERS; const grp = (t, l) => `<div class="t-micro" style="margin:12px 0 6px;color:var(--raspDk)">${I(t)}</div><div class="row">${l.map((x) => `<span class="chip">${I(x)}</span>`).join('')}</div>`;
        b.innerHTML = grp('Give an opinion', S.opinion) + grp('Disagree politely', S.debate) + grp('Ask a follow-up', S.followup) + grp('Reconsider', S.reconsider) + grp('Imagine a situation', S.conditional) + grp('Negotiate', S.negotiate);
      } else if (name === 'timer') this.buildTimer(b);
      else if (name === 'sound') this.buildSound(b);
      else if (name === 'mode') this.buildMode(b);
    },
    buildTimer(b) {
      const U = LC.UI.timer; const pre = [30, 45, 60, 90, 120, 180];
      const sugg = Lesson.suggest();
      b.innerHTML = `<div class="stack"><div class="row" style="justify-content:space-between"><div class="count" id="tdRead">${Timer.fmt(Timer.left)}</div><div class="row">
        <button class="btn btn-coral sm" data-dr="tstart" type="button">${I(Timer.running ? U.pause : U.start)}</button><button class="btn btn-ghost ivory sm" data-dr="treset" type="button">${I(U.reset)}</button></div></div>
        <div class="row">${pre.map((s) => `<button class="btn btn-teal xs" data-dr="tset" data-arg="${s}" type="button">${Timer.fmt(s)}</button>`).join('')}</div>
        <div class="row"><button class="btn btn-ghost ivory xs" data-dr="tadd" data-arg="15" type="button">+ 0:15</button><button class="btn btn-ghost ivory xs" data-dr="tadd" data-arg="-15" type="button">− 0:15</button>
        ${sugg ? `<button class="btn btn-amber xs" data-dr="tsugg" data-arg="${sugg}" type="button">${I(U.use)} (${Timer.fmt(sugg)})</button>` : ''}<button class="btn btn-ghost ivory xs" data-dr="thide" type="button">${I(U.off)}</button></div>
        <div class="t-small">${I('The timer is optional. When it ends, nothing moves until you click.')}</div></div>`;
    },
    refreshTimer() { const r = $('#tdRead'); if (r) r.textContent = Timer.fmt(Timer.left); if (this.open === 'timer') { const b = $('[data-dr="tstart"]'); if (b) b.innerHTML = I(Timer.running ? LC.UI.timer.pause : LC.UI.timer.start); } },
    buildSound(b) {
      const S = State.d, U = LC.UI;
      const seg = (k, l) => `<button class="btn ${S.voice === k ? 'btn-coral' : 'btn-ghost ivory'} sm" data-dr="voice" data-arg="${k}" aria-pressed="${S.voice === k}" type="button">${I(l)}</button>`;
      b.innerHTML = `<div class="stack"><div class="t-small"><b>${I(U.sound.voiceMode)}</b></div><div class="row">${seg('voice', U.voice.voice)}${seg('teacher', U.voice.teacher)}${seg('off', U.voice.off)}</div>
        <div class="row"><span class="t-small" style="min-width:230px">${I(U.sound.volume)}</span><input class="range grow" type="range" min="0" max="100" value="${Math.round(S.vol * 100)}" data-dri="vol" aria-label="Volume"></div>
        <div class="hr"></div><div class="row"><button class="btn ${S.music ? 'btn-teal' : 'btn-ghost ivory'} sm" data-dr="music" aria-pressed="${S.music}" type="button">${I(U.sound.music)}: ${I(S.music ? 'On' : 'Off')}</button>
        <span class="t-small" style="min-width:230px">${I(U.sound.musicVol)}</span><input class="range grow" type="range" min="0" max="100" value="${Math.round(S.musicVol * 100)}" data-dri="mvol" aria-label="Music volume"></div>
        <div class="t-micro" style="color:#3C2A5C">${I('Optional original music. It fades down while narration plays and stops during discussion.')}</div><div class="hr"></div>
        <div class="row"><button class="btn ${S.reduced === '1' ? 'btn-teal' : 'btn-ghost ivory'} sm" data-dr="reduced" aria-pressed="${S.reduced === '1'}" type="button">${I(U.sound.reduced)}: ${I(S.reduced === '1' ? 'On' : 'Off')}</button></div></div>`;
    },
    buildMode(b) {
      const S = State.d, U = LC.UI;
      const seg = (k, l) => `<button class="btn ${S.mode === k ? 'btn-coral' : 'btn-ghost ivory'}" data-dr="mode" data-arg="${k}" aria-pressed="${S.mode === k}" type="button">${I(l)}</button>`;
      b.innerHTML = `<div class="stack"><div class="row">${seg('class', 'Class')}${seg('demo', 'Demo')}</div>
        <div class="t-small">${I(S.mode === 'class' ? U.modeClass : U.modeDemo)}</div>
        <div class="hr"></div><div class="row"><span class="t-small" style="min-width:300px">${I(U.demoSpeed)}: <b class="num">${S.demoSecs}</b></span><input class="range grow" type="range" min="5" max="60" step="5" value="${S.demoSecs}" data-dri="demoSecs" aria-label="Demo timer length" ${S.mode === 'demo' ? '' : 'disabled'}></div>
        <div class="row"><button class="btn ${S.demoAuto ? 'btn-teal' : 'btn-ghost ivory'} sm" data-dr="demoAuto" aria-pressed="${S.demoAuto}" ${S.mode === 'demo' ? '' : 'disabled'} type="button">${I(U.demoAuto)}: ${I(S.demoAuto ? 'On' : 'Off')}</button></div>
        <div class="t-micro" style="color:#3C2A5C">${I('In Demo Mode, sample answers are clearly labeled. Autoplay only moves ahead after the demo timer. Class Mode never moves by itself.')}</div></div>`;
    },
    act(a, arg, el) {
      if (a === 'chart') { this.chart = !this.chart; this.build('words'); }
      else if (a === 'go') { this.close(true); Lesson.go(+arg, 0); updateBar(); }
      else if (a === 'tset') { Timer.set(+arg); Timer.start(); this.buildTimer(this.body('timer')); }
      else if (a === 'tstart') { if (Timer.running) Timer.pause(); else { if (!Timer.total) Timer.set(60); Timer.start(); } this.buildTimer(this.body('timer')); }
      else if (a === 'treset') { Timer.reset(); this.buildTimer(this.body('timer')); }
      else if (a === 'tadd') { if (!Timer.shown) { Timer.set(60); } Timer.add(+arg); this.buildTimer(this.body('timer')); }
      else if (a === 'tsugg') { Timer.set(+arg); Timer.start(); this.buildTimer(this.body('timer')); }
      else if (a === 'thide') { Timer.hide(); this.buildTimer(this.body('timer')); }
      else if (a === 'voice') { State.d.voice = arg; State.save(); Voice.stop(); this.buildSound(this.body('sound')); }
      else if (a === 'music') { Music.set(!State.d.music); this.buildSound(this.body('sound')); }
      else if (a === 'reduced') { setReduced(State.d.reduced === '1' ? 'auto' : '1'); this.buildSound(this.body('sound')); }
      else if (a === 'mode') { setMode(arg); this.buildMode(this.body('mode')); }
      else if (a === 'demoAuto') { State.d.demoAuto = !State.d.demoAuto; State.save(); this.buildMode(this.body('mode')); Lesson.demoKick(); }
    },
    input(k, el) {
      if (k === 'notes') { State.d.notes = el.value; State.save(); }
      else if (k === 'vol') { State.d.vol = +el.value / 100; Voice.el.volume = State.d.vol; State.save(); }
      else if (k === 'mvol') { State.d.musicVol = +el.value / 100; Music.apply(); State.save(); }
      else if (k === 'demoSecs') { State.d.demoSecs = +el.value; State.save(); el.closest('.stack').querySelector('b.num').textContent = el.value; }
    }
  };
  const esc2 = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* =========================================================== CONTROL BAR */
  const BAR = [
    { id: 'back', ic: 'back', l: 'Back' }, { id: 'play', ic: 'pause', l: 'Pause' }, { id: 'replay', ic: 'replay', l: 'Replay' }, { id: 'next', ic: 'next', l: 'Next', primary: true }, 'sep',
    { id: 'chapters', ic: 'chapters', l: 'Chapters', drawer: true }, { id: 'timer', ic: 'timer', l: 'Timer', drawer: true }, { id: 'words', ic: 'words', l: 'Words', drawer: true }, { id: 'starters', ic: 'starters', l: 'Starters', drawer: true }, 'sep',
    { id: 'sound', ic: 'sound', l: 'Sound', drawer: true }, { id: 'mode', ic: 'mode', l: 'Mode', drawer: true }, { id: 'full', ic: 'full', l: 'Full screen' }, 'spacer', { id: 'hide', ic: 'hide', l: 'Hide controls' }
  ];
  function buildBar() {
    const bar = $('#bar'); bar.innerHTML = '';
    BAR.forEach((b) => {
      if (b === 'sep') { const s = document.createElement('div'); s.className = 'sep'; bar.appendChild(s); return; }
      if (b === 'spacer') { const s = document.createElement('div'); s.className = 'spacer'; bar.appendChild(s); return; }
      const el = document.createElement('button'); el.type = 'button'; el.className = 'bb' + (b.primary ? ' primary' : ''); el.dataset.bar = b.id; el.setAttribute('aria-label', b.l);
      el.innerHTML = `<span class="ic" aria-hidden="true">${IC[b.ic]}</span><span class="lab">${I(b.l)}</span>`;
      el.addEventListener('click', () => barAct(b.id));
      bar.appendChild(el);
    });
    updateBar();
  }
  function setBar(id, icon, label, pressed) {
    const el = $(`#bar [data-bar="${id}"]`); if (!el) return;
    el.querySelector('.ic').innerHTML = IC[icon]; el.querySelector('.lab').innerHTML = I(label); el.setAttribute('aria-label', label);
    if (pressed !== undefined) el.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }
  function updateBar() {
    const playing = !Anim.paused && (Voice.state === 'playing' || Voice.state === 'idle');
    const key = Anim.paused ? 'Play' : 'Pause'; setBar('play', Anim.paused ? 'play' : 'pause', key);
    setBar('full', 'full', document.fullscreenElement ? 'Exit full screen' : 'Full screen', !!document.fullscreenElement);
    ['chapters', 'timer', 'words', 'starters', 'sound', 'mode'].forEach((k) => { const el = $(`#bar [data-bar="${k}"]`); if (el) el.setAttribute('aria-pressed', Drawers.open === k ? 'true' : 'false'); });
    const modeEl = $('#bar [data-bar="mode"] .lab'); if (modeEl) modeEl.innerHTML = I(State.d.mode === 'demo' ? 'Demo' : 'Class');
    const sEl = $('#bar [data-bar="sound"]'); if (sEl) sEl.classList.toggle('active', State.d.music);
    const nx = $('#bar [data-bar="next"]'); if (nx) nx.disabled = false;
    $('#showControls').setAttribute('aria-label', 'Show controls');
    paintHud();
  }
  function barAct(id) {
    if (id === 'back') Lesson.back();
    else if (id === 'next') Lesson.next();
    else if (id === 'play') { Voice.togglePause(); updateBar(); }
    else if (id === 'replay') Lesson.replay();
    else if (id === 'full') toggleFull();
    else if (id === 'hide') setControls('hidden');
    else Drawers.toggle(id);
  }
  function setControls(v) {
    State.d.controls = v; app.dataset.controls = v; State.save();
    if (v === 'hidden') { const s = $('#showControls'); setTimeout(() => s.focus({ preventScroll: true }), 30); } else { const nx = $('#bar [data-bar="hide"]'); setTimeout(() => nx && nx.focus({ preventScroll: true }), 30); }
    requestAnimationFrame(fit);
  }
  function toggleFull() {
    const el = document.documentElement;
    if (!document.fullscreenElement) { (el.requestFullscreen || el.webkitRequestFullscreen || (() => Promise.resolve())).call(el).catch(() => { }); }
    else { (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
  }
  document.addEventListener('fullscreenchange', () => { updateBar(); requestAnimationFrame(fit); });
  $('#showControls').addEventListener('click', () => setControls('shown'));
  $('#showControls').innerHTML = IC.show;

  function setReduced(v) { State.d.reduced = v; State.save(); applyReduced(); }
  function applyReduced() {
    const mq = g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const on = State.d.reduced === '1' || (State.d.reduced === 'auto' && mq);
    Anim.reduced = !!on; app.dataset.reduced = State.d.reduced === '1' ? '1' : 'auto'; if (State.d.reduced === 'auto' && !mq) app.dataset.reduced = '0';
  }
  function setMode(m) {
    State.d.mode = m; State.save(); paintHud(); Lesson.demoKick(); Lesson.refresh();
  }
  function paintHud() {
    const c = $('#hud .corner'); if (!c) return;
    const pl = LC.PLAN[State.d.ch];
    c.querySelector('.chapterPill').innerHTML = `<span class="pill">${I((State.d.ch + 1) + ' / 10')}</span>` .replace(/<span class="wu[^]*?<\/span><\/span>/g, (m) => m);
    const label = pl ? pl.title : '';
    c.querySelector('.chapterPill').innerHTML = `<span class="pill"><span aria-hidden="true">${State.d.ch + 1} / ${LC.PLAN.length}</span> ${I(label)}</span>`;
    c.querySelector('.modePill').innerHTML = State.d.mode === 'demo' ? `<span class="pill demo">${I('Demo Mode')}</span>` : '';
  }

  /* =========================================================== LESSON (chapter navigation + rendering) */
  const ui = $('#ui'), artEl = $('#art'), scrim = $('#scrim');
  const Lesson = {
    chapters: [], idx: -1, step: 0, ctx: null, shown: new Set(), demoIv: null, entered: false,
    register(ch) { this.chapters.push(ch); },
    suggest() { const c = this.chapters[this.idx]; if (!c || !c.suggest) return 0; return c.suggest(this.ctx, this.step) || 0; },
    go(i, step, o) {
      o = o || {}; i = clamp(i, 0, this.chapters.length - 1);
      const ch = this.chapters[i]; step = clamp(step == null ? 0 : step, 0, ch.steps - 1);
      Voice.stop(); Voice.unbindAll(); Anim.resume(); Anim.cancelAll(); Timer.hide(); clearInterval(this.demoIv); Drawers.close(true); this.demoOpen = false;
      const changed = this.idx !== i;
      if (changed || o.rebuild) {
        if (this.ctx) { (this.ctx.cleanups || []).forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } }); if (this.ctx.stage) this.ctx.stage.destroy(); }
        this.idx = i; State.d.ch = i; this.shown = new Set();
        this.ctx = this.makeCtx(ch); artEl.innerHTML = ''; ui.innerHTML = '';
        ch.enter(this.ctx);
      }
      this.step = step; State.d.step[ch.id] = step; State.save(); this.ctx.step = step;
      this.shown = o.keepShown ? this.shown : (changed ? new Set() : this.shown);
      Music.setDiscuss(false);
      ch.onStep(this.ctx, step, { dir: o.dir || 0, replay: !!o.replay });
      this.refresh();
      paintHud(); updateBar();
      this.demoKick();
    },
    makeCtx(ch) {
      const self = this;
      const ctx = {
        ch, id: ch.id, S: State.c(ch.id), el: ui, stage: null, step: 0, I, cleanups: [],
        onLeave(fn) { this.cleanups.push(fn); },
        get demo() { return State.d.mode === 'demo'; },
        get mode() { return State.d.mode; },
        save() { State.save(); },
        refresh() { self.refresh(); },
        setStage(st) { if (this.stage) this.stage.destroy(); this.stage = st; artEl.innerHTML = ''; artEl.appendChild(st.el); return st; },
        scrim(css) { scrim.style.background = css || 'none'; },
        say(ids, o) { return Voice.say(ids, o); },
        bind(who, fig) { Voice.bind(who, fig); },
        discuss(v) { Music.setDiscuss(v); },
        next() { Lesson.next(); }, back() { Lesson.back(); },
        goStep(n) { Lesson.go(self.idx, n, { keepShown: true }); }
      };
      return ctx;
    },
    refresh() {
      const ch = this.chapters[this.idx]; if (!ch) return;
      const active = document.activeElement; const key = active && active.closest && active.closest('#ui') ? (active.dataset.act || '') + '|' + (active.dataset.arg || '') : null;
      const sc = ui.scrollTop;
      this.ctx.demoText = '';
      ui.innerHTML = ch.view(this.ctx);
      this.paintDemo();
      $$('[data-k]', ui).forEach((el) => { const k = el.dataset.k; if (!this.shown.has(k)) { el.classList.add('pop'); this.shown.add(k); } });
      if (key) { const [a, arg] = key.split('|'); const el = $$('[data-act]', ui).find((e) => (e.dataset.act || '') === a && (e.dataset.arg || '') === arg); if (el) el.focus({ preventScroll: true }); }
      ui.scrollTop = sc;
      State.save();
    },
    demoOpen: false,
    paintDemo() {
      const chip = $('#hud .demoChip'); const t = this.ctx && this.ctx.demoText; if (!chip) return;
      if (!t || State.d.mode !== 'demo') { chip.innerHTML = ''; this.demoOpen = false; return; }
      chip.innerHTML = `<button class="chip demobtn" data-eng="demo" type="button" aria-pressed="${this.demoOpen}" style="background:var(--amber);color:var(--ink);border-color:var(--amberLt);font-size:24px;pointer-events:auto;margin-right:12px">${I('Demo sample')}</button>`;
      if (this.demoOpen) { const d = document.createElement('div'); d.className = 'card demo-box demo-pop pe'; d.dataset.k = 'demo-pop'; d.style.cssText = 'position:absolute;left:200px;right:200px;top:330px;z-index:50;padding:14px 26px 18px;box-shadow:0 24px 70px rgba(0,0,0,.65)'; d.innerHTML = `<span class="demo-label">${I('Demo sample')}</span><div class="t-body" style="margin-top:6px">${I(t)}</div><div class="row" style="margin-top:10px"><button class="btn btn-ink xs" data-eng="demo" type="button" style="background:var(--navy2);color:var(--ivory)">${I('Close')}</button></div>`; ui.appendChild(d); }
    },
    act(el, ev) {
      const ch = this.chapters[this.idx]; const a = el.dataset.act; if (!ch || !ch.acts || !ch.acts[a]) return;
      const r = ch.acts[a](this.ctx, el.dataset.arg, el, ev);
      if (r !== false) this.refresh();
      updateBar();
    },
    next() { const ch = this.chapters[this.idx]; if (this.step < ch.steps - 1) this.go(this.idx, this.step + 1, { dir: 1, keepShown: true }); else if (this.idx < this.chapters.length - 1) this.go(this.idx + 1, 0, { dir: 1 }); },
    back() { if (this.step > 0) this.go(this.idx, this.step - 1, { dir: -1, keepShown: true }); else if (this.idx > 0) { const p = this.chapters[this.idx - 1]; this.go(this.idx - 1, p.steps - 1, { dir: -1 }); } },
    replay() { const ch = this.chapters[this.idx]; Voice.stop(); Anim.resume(); Anim.cancelAll(); ch.onStep(this.ctx, this.step, { dir: 0, replay: true }); this.refresh(); updateBar(); },
    /* Demo Mode: sample answers are labeled. Autoplay (optional) moves ahead only after the demo timer. */
    demoKick() {
      clearInterval(this.demoIv); this.demoIv = null;
      if (State.d.mode !== 'demo' || !State.d.demoAuto) return;
      const ch = this.chapters[this.idx]; if (!ch) return;
      const secs = State.d.demoSecs; Timer.set(secs); Timer.onDone = () => { Timer.onDone = null; const c = this.chapters[this.idx]; if (c && c.demoAct) c.demoAct(this.ctx, this.step); setTimeout(() => this.next(), 700); };
      Timer.start();
    }
  };
  g.Lesson = Lesson; g.Voice = Voice; g.Music = Music; g.Timer = Timer; g.Drawers = Drawers; g.State = State;

  /* delegated clicks on the chapter UI */
  document.addEventListener('click', (e) => { const de = e.target.closest('[data-eng="demo"]'); if (de) { Lesson.demoOpen = !Lesson.demoOpen; Lesson.refresh(); } });
  ui.addEventListener('click', (e) => { const el = e.target.closest('[data-act]'); if (el && !el.disabled) { if (Music.ctx && Music.ctx.state === 'suspended') Music.ctx.resume(); Lesson.act(el, e); } });

  ui.addEventListener('input', (e) => { const el = e.target.closest('[data-in]'); if (!el) return; const ch = Lesson.chapters[Lesson.idx]; if (ch && ch.onInput) { ch.onInput(Lesson.ctx, el.dataset.in, el.value, el); State.save(); } });

  /* =========================================================== KEYBOARD */
  function typing(t) { return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); }
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (typing(e.target)) { if (e.key === 'Escape') e.target.blur(); return; }
    const k = e.key;
    if (k === 'h' || k === 'H') { e.preventDefault(); setControls(State.d.controls === 'hidden' ? 'shown' : 'hidden'); }
    else if (k === 'Escape') { if (Drawers.open) Drawers.close(); else Narr.hide(); }
    else if (k === 'ArrowRight' && !$('#startOverlay.on')) { e.preventDefault(); Lesson.next(); }
    else if (k === 'ArrowLeft' && !$('#startOverlay.on')) { e.preventDefault(); Lesson.back(); }
    else if (k === 'f' || k === 'F') { e.preventDefault(); toggleFull(); }
    else if (k === 'r' || k === 'R') { Lesson.replay(); }
    else if (k === 'p' || k === 'P') { Voice.togglePause(); updateBar(); }
    else if (k === 'm' || k === 'M') { Music.set(!State.d.music); }
  });

  /* =========================================================== START OVERLAY (user-initiated audio) */
  function buildStart() {
    const o = $('#startOverlay'); const O = LC.OPENING;
    const resumed = State.d.started && (State.d.ch > 0 || (State.d.step.opening || 0) > 0);
    o.innerHTML = `<div class="stage-fill"></div>
      <div class="startcard pe"><img class="slogo" src="assets/fluent_english_logo_white.png" alt="Fluent English"><div class="t-eyebrow">${I(O.club)}</div>
      <h1 class="t-hero">${I(O.title)}</h1><div class="t-h2" style="margin-top:6px;color:var(--amberLt)">${I(O.sub)}</div>
      <div class="row" style="margin-top:22px;justify-content:center"><button class="btn btn-coral" id="startBtn" type="button" style="font-size:38px;min-height:90px;padding:8px 50px 12px">${I(resumed ? 'Resume the lesson' : O.start)}</button></div>
      <div class="t-small" style="margin-top:16px;color:#C9D3F5">${I(O.hint)}</div></div>`;
    o.classList.add('on');
    const stage = new Art.Stage('night', { label: '' }); $('.stage-fill', o).appendChild(stage.el); o._stage = stage;
    const A = Art.Cast.make('alex'), M = Art.Cast.make('maya');
    $('#startBtn').addEventListener('click', () => {
      State.d.started = true; State.save();
      try { const ac = Music.ensure(); if (ac && Music.ctx.state === 'suspended') Music.ctx.resume(); } catch (e) { /* ignore */ }
      try { Voice.el.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='; Voice.el.play().catch(() => { }); } catch (e) { /* ignore */ }
      o.classList.remove('on'); stage.destroy(); o.innerHTML = '';
      if (State.d.music) Music.set(true);
      const ch = State.d.ch || 0; Lesson.go(ch, State.d.step[LC.PLAN[ch].id] || 0);
    });
    $('#startBtn').focus();
    return [A, M];
  }

  /* =========================================================== BOOT */
  g.FE_BOOT = function () {
    Art.mountDefs(); applyReduced(); fit();
    $('#hud .logo').src = 'assets/fluent_english_logo_white.png';
    app.dataset.controls = State.d.controls || 'shown';
    Drawers.init(); buildBar(); Timer.paint(); paintHud();
    document.documentElement.lang = 'en-US';
    if (qs.get('skipstart')) { State.d.started = true; Lesson.go(State.d.ch || 0, State.d.step[LC.PLAN[State.d.ch || 0].id] || 0); }
    else buildStart();
    requestAnimationFrame(fit);
  };
  g.addEventListener('beforeunload', () => State.flush());
  g.FE = { State, Voice, Music, Timer, Drawers, Lesson, setControls, setMode, fit, updateBar };
})(window);
