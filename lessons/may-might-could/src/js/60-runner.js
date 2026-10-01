/* 60-runner: planned 60:00 timeline, seekable segment compiler, Class / Demo modes */
(function () {
  'use strict';
  const FE = window.FE, A = FE.Audio;
  const L = (FE.L = { chapters: [], segs: [], store: {}, mission: { shelter: 'tent', food: 'main', guest: 'text', picked: {} } });
  /* exact chapter allocations (seconds) */
  L.chapters = [
    { n: 1, t: 'Hook and diagnostic', s: 0, e: 300 }, { n: 2, t: 'Discover the core meaning', s: 300, e: 780 },
    { n: 3, t: 'Build the forms and pronunciation', s: 780, e: 1260 }, { n: 4, t: 'Guided practice and common mistakes', s: 1260, e: 1860 },
    { n: 5, t: 'Adult decision-making mission', s: 1860, e: 2760 }, { n: 6, t: 'New evidence and roleplay', s: 2760, e: 3300 },
    { n: 7, t: 'Review and exit check', s: 3300, e: 3600 },
  ];
  FE.seg = (d) => { d.idx = L.segs.length; L.segs.push(d); return d; };
  FE.VOICE = { nar: 'af_heart', maya: 'af_sarah', daniel: 'am_michael', priya: 'af_bella', tom: 'am_fenrir', lena: 'af_nova', ken: 'am_adam' };
  FE.speechKey = (voice, text, ph) => 'k' + FE.hash(voice + '|' + (ph || '') + '|' + FE.stripMarkup(text)).toString(36);

  /* ---------- compile steps → timed events ---------- */
  function compile(seg) {
    if (seg._c && seg._cn === A.NARR) return seg._c;
    let t = 0; const events = [], speech = [];
    const add = (tt, fn) => events.push({ t: tt, fn });
    for (const st of seg.steps || []) {
      const k = st[0];
      if (k === 'nar' || k === 'say') {
        const who = k === 'nar' ? 'nar' : st[1], text = k === 'nar' ? st[1] : st[2], o = (k === 'nar' ? st[2] : st[3]) || {};
        const voice = FE.VOICE[who], key = FE.speechKey(voice, text, o.ph), dur = A.dur(key, FE.stripMarkup(text));
        const it = { t0: t, t1: t + dur, who, text, key, o, kind: k, voice };
        speech.push(it);
        add(t, (X) => X.R.speechStart(it));
        if (o.on) o.on.forEach(([off, fn]) => add(t + (off < 1 ? off * dur : off), fn));
        if (k === 'say') add(t + dur + (o.hold != null ? o.hold : 0.9), (X) => { if (!o.keep) X.R.speechEnd(it); });
        else add(t + dur + 0.6, (X) => X.R.capHide(it));
        t += dur + (o.gap != null ? o.gap : k === 'say' ? 0.3 : 0.4);
      } else if (k === 'do') add(t, st[1]);
      else if (k === 'wait') t += st[1];
      else if (k === 'fx') { const nm = st[1], ar = st[2]; add(t, (X) => FE.FX[nm](X, ar)); if (st[3]) t += st[3]; }
    }
    events.sort((a, b) => a.t - b.t);
    seg._c = { events, speech, film: t }; seg._cn = A.NARR;
    return seg._c;
  }
  FE.compileSeg = compile;

  /* ---------- plan: whole-second plan per segment, chapter totals exact ---------- */
  FE.plan = () => {
    for (const ch of L.chapters) {
      const segs = L.segs.filter((s) => s.ch === ch.n), T = ch.e - ch.s;
      const info = segs.map((s) => { const c = compile(s); const hold = s.hold != null ? s.hold : 2; return { s, film: c.film + hold, w: s.act ? (s.w || 1) : 0 }; });
      const filmSum = info.reduce((a, b) => a + b.film, 0), wsum = info.reduce((a, b) => a + b.w, 0) || 1;
      const rest = T - filmSum;
      ch.rest = rest;
      let acc = 0; const plans = [];
      info.forEach((q, i) => {
        let p = q.film + (q.w ? (Math.max(rest, 0) * q.w) / wsum : 0);
        p = i === info.length - 1 ? T - acc : Math.round(p);
        plans.push(p); acc += p;
      });
      let st = ch.s;
      info.forEach((q, i) => { q.s.plan = plans[i]; q.s.start = st; q.s.filmDur = q.film - (q.s.hold != null ? q.s.hold : 2); q.s.actDur = Math.max(0, plans[i] - q.s.filmDur); st += plans[i]; });
      ch.fits = rest >= 0;
    }
    return L.segs.reduce((a, s) => a + s.plan, 0);
  };

  /* ---------- the runner ---------- */
  const R = (FE.R = {
    mode: 'class', playing: false, started: false, idx: 0, t: 0, actT: 0, extra: 0, actPaused: false, gate: false, timesUp: false,
    cursor: 0, X: null, curSpeech: null, wall0: 0, wallPause: 0, act: null, rafId: 0, last: 0,
    init(stage) { R.S = stage; R.X = { S: stage, R, L }; },
    seg() { return L.segs[R.idx]; },
    /* scheduled lesson position (seconds) */
    pos() { const s = R.seg(); if (!s) return 0; const lt = R.gate ? s.filmDur + Math.min(R.actT, s.actDur + R.extra) : Math.min(R.t, s.filmDur); return s.start + Math.min(lt, s.plan); },
    wall() { return R.started ? (performance.now() - R.wall0) / 1000 : 0; },

    load(i, t = 0) {
      i = FE.clamp(i, 0, L.segs.length - 1);
      R.stopSpeech();
      const seg = L.segs[i], c = compile(seg);
      R.idx = i; R.cursor = 0; R.gate = false; R.timesUp = false; R.actT = 0; R.extra = 0; R.actPaused = false;
      if (R.act) { R.act.destroy(); R.act = null; }
      FE.UI.clearOverlays();
      A.quiet = true; FE.Tween.instant = true;
      const so = typeof seg.sceneOpts === 'function' ? seg.sceneOpts(L) : seg.sceneOpts || {};
      R.S.load(typeof seg.scene === 'function' ? seg.scene(L) : seg.scene, so);
      (seg.cast || []).forEach(([id, o]) => R.S.add(id, R.fixCast(seg, o)));
      if (seg.weather) R.S.setWeather(seg.weather[0], seg.weather[1], 0);
      if (seg.setup) seg.setup(R.X);
      R.t = 0;
      R.runEvents(Math.min(t, c.film));
      FE.Tween.instant = false; A.quiet = false;
      FE.Tween.finish();
      if (t >= c.film) R.enterGate(t - c.film, true);
      R.t = Math.min(t, c.film);
      FE.UI.onSegment(seg, R);
      R.sync(true);
      R.draw(0);
    },
    runEvents(upTo) {
      const ev = compile(R.seg()).events;
      while (R.cursor < ev.length && ev[R.cursor].t <= upTo + 1e-6) { try { ev[R.cursor].fn(R.X); } catch (e) { console.error('event', R.seg().id, e); } R.cursor++; }
    },
    enterGate(actT = 0, quiet) {
      const seg = R.seg(); R.gate = true; R.actT = actT; R.timesUp = false;
      if (seg.act && FE.FX && FE.FX.clear) { FE.$$('#fx > .fxp').forEach((e) => e.remove()); }
      if (seg.act) {
        R.act = FE.ACT.mount(seg, R.X);
        if (seg.act.cam) R.S.camTo(Object.assign({ x: 0, y: 0, z: 1 }, seg.act.cam), quiet ? 0 : 1.2);
        A.setSilence(seg.act.silent !== false);
      } else A.setSilence(false);
      if (actT > 0 && R.act && R.act.fastForward) R.act.fastForward(actT);
      FE.UI.onGate(seg, R);
    },
    /* ---------- speech ---------- */
    speechStart(it) {
      R.curSpeech = it; it.started = true;
      const S = R.S;
      if (it.kind === 'say') {
        const c = S.char(it.who);
        it.rec = S.bubble(it.who, it.text, { at: it.o.at, maxW: it.o.maxW, keepOthers: it.o.keepOthers });
        if (c) {
          if (it.o.face) c.face(it.o.face, 0.3);
          if (it.o.gest) c.pose(it.o.gest, 0.7, 'back');
          if (it.o.look) c.look(it.o.look[0], it.o.look[1], 0.3);
          else if (it.o.to) { const o = S.char(it.o.to); if (o) c.look(o.P.x > c.P.x ? 0.8 : -0.8, 0, 0.3); }
          if (it.o.turn) c.turn(it.o.turn, 0.4);
        }
      } else if (it.o.cap || FE.UI.cc) FE.UI.cap(it);
    },
    speechEnd(it) {
      if (R.S.char(it.who) && R.curSpeech === it) R.S.char(it.who).stopTalk();
      if (it.rec) R.S.removeBubble(it.rec, FE.Tween.instant);
      if (R.curSpeech === it) R.curSpeech = null;
    },
    capHide(it) { FE.UI.capHide(false, it); },
    stopSpeech() {
      A.stop();
      if (R.S) for (const id in R.S.chars) R.S.chars[id].stopTalk();
      R.talking = null; R.syncKey = null;
    },
    /* align audio + mouth + word highlights with local time (also used after seeks / while paused) */
    sync(force) {
      const seg = R.seg(); const c = compile(seg); const t = R.t;
      let it = null;
      if (!R.gate || t < c.film) it = c.speech.find((s) => t >= s.t0 && t < s.t1) || null;
      const key = it ? it.t0 : null;
      if (key !== R.syncKey || force) {
        R.stopSpeech(); R.syncKey = key;
        if (it && !(R.playing === false && !force)) {
          if (!it.rec && it.kind === 'say') { /* bubble exists after events ran */ }
          if (R.playing) {
            const off = t - it.t0;
            if (A.info(it.key)) A.play(it.key, off);
            if (it.kind === 'say' && R.S.char(it.who)) { const e = FE.env(it.key); if (e) R.S.char(it.who).startTalk(e, off); }
          }
        }
        R.hlItem = it;
      }
      // word highlight
      if (it) {
        const w = FE.wordIndex(it, t - it.t0);
        if (it.kind === 'say' && it.rec) R.S.highlight(it.rec, w);
        else if (it.o.cap || FE.UI.cc) FE.UI.capHL(w);
      }
    },
    /* ---------- frame ---------- */
    draw(dt) { R.S.tick(dt); FE.UI.updateClock(); },
    tick(dt) {
      const seg = R.seg(), c = compile(seg);
      if (!R.gate) {
        R.t += dt; R.runEvents(R.t); R.sync();
        if (R.t >= c.film) {
          const tail = seg.hold != null ? seg.hold : 2;
          if (seg.act && seg.actDur > 1.5) { const over = R.t - c.film; R.runEvents(1e9); R.stopSpeech(); R.enterGate(Math.max(0, over)); }
          else if (R.t >= c.film + tail) R.advance(R.t - c.film - tail);
        }
      } else {
        if (!R.actPaused) R.actT += dt;
        const total = seg.actDur + R.extra;
        if (R.act && R.act.tick) R.act.tick(R.actT, total, dt);
        FE.UI.updateTimer(R, seg);
        if (R.actT >= total && !R.timesUp) { R.timesUp = true; A.sfx('bell'); FE.UI.onTimesUp(R); }
        if (R.mode === 'demo' && R.actT >= total) R.advance(R.actT - total);
      }
      R.draw(dt);
    },
    advance(over = 0) { if (R.idx < L.segs.length - 1) R.load(R.idx + 1, Math.min(Math.max(over, 0), 5)); else { R.pause(); FE.UI.onEnd(); } },
    loop(now) {
      if (!R.playing) { R.rafId = 0; return; }
      const dt = Math.min(0.1, (now - R.last) / 1000); R.last = now;
      R.tick(dt); R.rafId = requestAnimationFrame(R.loop);
    },
    play() {
      if (!R.started) { R.started = true; R.wall0 = performance.now(); }
      A.init(); R.playing = true; R.last = performance.now(); R.syncKey = null; R.sync(true);
      if (A.ctx) { A.musicOn(!A.mute.music); }
      FE.UI.onPlay(true);
      if (!R.rafId) R.rafId = requestAnimationFrame(R.loop);
    },
    pause() { R.playing = false; R.stopSpeech(); cancelAnimationFrame(R.rafId); R.rafId = 0; if (A.ctx) A.musicOn(false); FE.UI.onPlay(false); R.draw(0); },
    toggle() { R.playing ? R.pause() : R.play(); },
    /* absolute scheduled position (seconds) */
    seekP(p) {
      p = FE.clamp(p, 0, 3599.5);
      const i = L.segs.findIndex((s) => p >= s.start && p < s.start + s.plan);
      const s = L.segs[Math.max(0, i)];
      const lt = p - s.start, was = R.playing;
      if (was) R.stopSpeech();
      R.load(Math.max(0, i), lt);
      if (was) { R.syncKey = null; R.sync(true); }
    },
    rel(d) { R.seekP(R.pos() + d); },
    chapterOf() { return R.seg().ch; },
    chapter(d) {
      const cur = R.seg().ch, tgt = FE.clamp(cur + d, 1, 7);
      const from = d < 0 && R.pos() - L.chapters[cur - 1].s > 6 ? cur : tgt;
      R.seekP(L.chapters[from - 1].s + 0.01);
    },
    nextSeg(d = 1) { R.load(FE.clamp(R.idx + d, 0, L.segs.length - 1), 0); },
    /* rebuild the current scene from mission state (visible consequence of a branch choice) */
    /* presenter layout: behind the office desk the figures stand higher so the torso shows above it */
    fixCast(seg, o) { const sc = typeof seg.scene === 'function' ? seg.scene(L) : seg.scene; return sc === 'office' && o.y > 960 ? Object.assign({}, o, { y: 905 }) : o; },
    rebuild() {
      const seg = R.seg(), keep = FE.$$('#fx > *');
      A.quiet = true; const wasI = FE.Tween.instant; FE.Tween.instant = true;
      const so = typeof seg.sceneOpts === 'function' ? seg.sceneOpts(L) : seg.sceneOpts || {};
      R.S.load(typeof seg.scene === 'function' ? seg.scene(L) : seg.scene, so);
      keep.forEach((e) => FE.$('#fx').appendChild(e));
      (seg.cast || []).forEach(([id, o]) => R.S.add(id, R.fixCast(seg, o)));
      if (seg.act && seg.act.cam) Object.assign(R.S.cam, seg.act.cam);
      FE.Tween.instant = wasI; A.quiet = false; FE.Tween.finish();
      if (!R.playing) R.draw(0);
    },
    replay() { const g = R.act; R.load(R.idx, 0); },
    restart() { R.pause(); L.store = {}; L.mission = { shelter: 'tent', food: 'main', guest: 'text', picked: {} }; R.started = false; R.load(0, 0); FE.UI.clearWall(); },
    setMode(m) { R.mode = m; FE.UI.onMode(m); },
    /* activity timer controls (Class Mode) */
    timer: {
      pause() { R.actPaused = !R.actPaused; },
      restart() { R.actT = 0; R.extra = 0; R.timesUp = false; },
      skip() { const s = R.seg(); R.actT = s.actDur + R.extra; },
      extend() { R.extra += 60; R.timesUp = false; },
    },
  });

  /* envelopes (30 Hz, base64 uint8) and word timing */
  const envCache = {};
  FE.env = (key) => {
    const n = A.NARR[key]; if (!n || !n.env) return null;
    if (!envCache[key]) { const b = atob(n.env), d = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) d[i] = b.charCodeAt(i); envCache[key] = { rate: n.rate || 30, data: d }; }
    return envCache[key];
  };
  FE.wordIndex = (it, rel) => {
    const toks = FE.tokens(it.text); if (!toks.length) return -1;
    const n = A.NARR[it.key];
    if (n && n.words && n.words.length >= toks.length * 2) {
      for (let i = 0; i < toks.length; i++) if (rel < n.words[i * 2 + 1]) return rel >= n.words[i * 2] - 0.04 ? i : (i > 0 ? i - 1 : -1);
      return -1;
    }
    const dur = Math.max(0.2, it.t1 - it.t0 - 0.2), wt = toks.map((k) => k.word.length + 2), sum = wt.reduce((a, b) => a + b, 0);
    let acc = 0; for (let i = 0; i < toks.length; i++) { acc += (wt[i] / sum) * dur; if (rel < acc) return i; }
    return -1;
  };
})();
