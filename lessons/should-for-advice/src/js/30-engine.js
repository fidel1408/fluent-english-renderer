/* Should for Advice — lesson engine: 60:00 planned timeline, CLASS / DEMO modes, narration scheduling, gates, timers */
(function (g) {
  'use strict';
  const FE = g.FE;

  FE.chapters = [
    { n: 1, title: 'The problem: what should I do?', a: 0, b: 300 },
    { n: 2, title: 'Discover the meaning of advice', a: 300, b: 780 },
    { n: 3, title: 'Build affirmative and negative forms', a: 780, b: 1260 },
    { n: 4, title: 'Ask for advice and practice pronunciation', a: 1260, b: 1740 },
    { n: 5, title: 'Guided practice and common mistakes', a: 1740, b: 2340 },
    { n: 6, title: 'Interactive adult advice mission', a: 2340, b: 3240 },
    { n: 7, title: 'Review, roleplay feedback, and exit check', a: 3240, b: 3600 },
  ];
  FE.TOTAL = 3600;
  FE.segs = [];
  FE.layoutIssues = [];

  /* clip identity: voice + speed + spoken text. Same function is used by tools/gen-narration.py via the exported script. */
  FE.spoken = function (t) {
    return t.replace(/\{=([^|}]+)\|[^}]+\}/g, '$1').replace(/\{[a-z]+\|/g, '').replace(/\}/g, '').replace(/’/g, "'").replace(/\s+/g, ' ').trim();
  };
  FE.clipId = function (voice, speed, text) { return FE.hash(voice + '|' + speed + '|' + text).toString(16).padStart(8, '0'); };

  /* define a segment. lines: [key, text, {who, gap, tts, sp}] */
  FE.seg = function (def) {
    def.C = {};
    (def.clips || []).forEach((l) => {
      const o = l[2] || {}; const who = o.who || 'narr', voice = who === 'narr' ? 'af_heart' : FE.CHARS[who].voice;
      const spoken = o.tts || FE.spoken(l[1]), sp = o.sp || (who === 'narr' ? 0.98 : 1);
      def.C[l[0]] = { k: l[0], text: l[1], who, voice, spoken, sp, id: FE.clipId(voice, sp, spoken) };
    });
    def.lines = (def.lines || []).map((l) => {
      const o = l[2] || {};
      const who = o.who || 'narr', voice = who === 'narr' ? 'af_heart' : FE.CHARS[who].voice;
      const spoken = o.tts || FE.spoken(l[1]);
      const sp = o.sp || (who === 'narr' ? 0.98 : 1);
      return { k: l[0], text: l[1], who, voice, spoken, sp, gap: o.gap != null ? o.gap : 0.55, id: FE.clipId(voice, sp, spoken), opts: o };
    });
    FE.segs.push(def); return def;
  };

  function estDur(text) { return 0.45 + FE.wordCount(text) * 0.34; }
  FE.lineDur = (ln) => { const m = FE.MANIFEST[ln.id]; return m ? m.d : estDur(ln.text); };

  FE.finalize = function () {
    FE.layoutIssues = [];
    FE.chapters.forEach((c) => {
      let t = c.a;
      FE.segs.filter((s) => s.ch === c.n).forEach((s) => { s.start = t; s.end = t + s.dur; t += s.dur; });
      if (Math.abs(t - c.b) > 0.001) FE.layoutIssues.push(`chapter ${c.n}: segments sum to ${t - c.a}s, expected ${c.b - c.a}s`);
    });
    FE.segs.sort((a, b) => a.start - b.start);
    FE.segs.forEach((s, i) => { s.idx = i; });
    FE.segs.forEach((s) => { Object.values(s.C || {}).forEach((c) => { c.dur = FE.lineDur(c); }); });
    FE.segs.forEach((s) => {
      const L = {}; let t = s.lead != null ? s.lead : 0.4;
      s.lines.forEach((ln) => { t += ln.gap; ln.start = t; ln.dur = FE.lineDur(ln); ln.end = t + ln.dur; t = ln.end; L[ln.k] = ln; });
      s.L = L; s.speechEnd = t;
      if (s.lines.length && t + 0.15 > s.dur) FE.layoutIssues.push(`segment ${s.id}: narration ends ${t.toFixed(1)}s, segment is ${s.dur}s`);
      if (s.timer) s.timerAt = s.timer.at != null ? s.timer.at : Math.min(s.dur - 5, t + 0.4);
    });
    const last = FE.segs[FE.segs.length - 1];
    if (!last || Math.abs(last.end - FE.TOTAL) > 0.001) FE.layoutIssues.push('timeline does not end at 3600s');
  };

  const E = (FE.engine = {
    mode: 'class', started: false, playing: false, finished: false, T: 0, local: 0, seg: null, scene: null, lineIx: 0,
    gate: false, ext: 0, extPending: 0, startedAt: 0, handlers: {}, tickId: 0, lastNow: 0, layers: null, mission: {}, visited: {},
  });
  E.on = (ev, fn) => { (E.handlers[ev] = E.handlers[ev] || []).push(fn); };
  E.emit = (ev, a) => (E.handlers[ev] || []).forEach((f) => f(a));
  E.chapterOf = (T) => FE.chapters.find((c) => T >= c.a && T < c.b) || FE.chapters[FE.chapters.length - 1];
  E.segAt = (T) => { for (let i = FE.segs.length - 1; i >= 0; i--) if (T >= FE.segs[i].start) return FE.segs[i]; return FE.segs[0]; };

  E.enter = function (seg, off) {
    off = off || 0;
    if (E.scene) E.scene.destroy();
    FE.audio.stop();
    E.seg = seg; E.local = off; E.T = seg.start + off; E.gate = false; E.ext = 0; E.extPending = 0; E.lineIx = 0;
    const S = (E.scene = FE.Scene(seg, seg.L, E.layers));
    S.mode = E.mode;
    S.fast = true;
    S.idle = seg.timer ? 0.4 : 1;
    try { seg.build(S, seg.L); } catch (e) { console.error('build failed', seg.id, e); throw e; }
    // catch-up: apply every cue before the offset instantly
    S.cues.sort((a, b) => a.t - b.t);
    S.cues.forEach((c) => { if (c.t <= off) { c.done = true; try { c.fn(); } catch (e) { console.error('cue', seg.id, e); } } });
    S.fast = false;
    // narration position
    seg.lines.forEach((ln, i) => { if (ln.end <= off + 0.02) E.lineIx = i + 1; });
    const act = seg.lines[E.lineIx];
    if (act && act.start <= off && off < act.end - 0.05 && E.playing && !FE.qa) { FE.audio.play(act.id, off - act.start, act.who); E.lineIx++; }
    else if (act && act.start <= off) E.lineIx++;
    FE.audio.music(seg.timer ? 'off' : seg.music || 'calm');
    // demo mode: model answers appear at the planned moment (skipped in catch-up if already past)
    if (seg.revealAt != null) { S.at(seg.revealAt, () => { if (E.mode === 'demo') S.doReveal(); }); S.cues.sort((a, b) => a.t - b.t); S.cues.forEach((c) => { if (c.t <= off && !c.done) { c.done = true; c.fn(); } }); }
    E.visited[seg.id] = true;
    E.emit('seg', seg);
    if (off >= seg.dur) E.segmentEnd();
  };

  E.goto = function (T, opts) {
    T = Math.max(0, Math.min(FE.TOTAL - 0.01, T));
    const seg = E.segAt(T);
    E.finished = false;
    E.enter(seg, Math.max(0, T - seg.start));
    E.emit('tick');
  };
  E.timerInfo = function () {
    const s = E.seg; if (!s || !s.timer) return null;
    const total = s.dur - s.timerAt, rem = Math.max(0, s.dur - Math.max(E.local, s.timerAt)) + Math.max(E.ext, 0);
    return { total, rem, started: E.local >= s.timerAt, ext: E.ext, gate: E.gate };
  };

  E.advance = function (dt) {
    if (!E.scene || E.finished) return;
    const s = E.seg, S = E.scene;
    if (E.gate) { return; }
    if (E.ext > 0 && E.local >= s.dur) { E.ext = Math.max(0, E.ext - dt); if (E.ext <= 0) E.afterExt(); E.emit('tick'); return; }
    const prev = E.local;
    E.local = Math.min(s.dur, E.local + dt);
    E.T = s.start + E.local;
    // cues
    const cues = S.cues;
    for (let i = 0; i < cues.length; i++) { const c = cues[i]; if (!c.done && c.t <= E.local) { c.done = true; try { c.fn(); } catch (e) { console.error('cue error', s.id, e); } } }
    // narration
    while (s.lines[E.lineIx] && s.lines[E.lineIx].start <= E.local) {
      const ln = s.lines[E.lineIx++];
      if (!FE.qa && E.playing) FE.audio.play(ln.id, Math.max(0, E.local - ln.start - 0.05), ln.who);
    }
    if (E.local >= s.dur && prev < s.dur) E.segmentEnd();
    E.emit('tick');
  };
  E.segmentEnd = function () {
    const s = E.seg;
    if (E.extPending > 0) { E.ext = E.extPending; E.extPending = 0; return; }
    E.afterExt();
  };
  E.afterExt = function () {
    const s = E.seg;
    if (E.mode === 'class' && s.gate) { E.gate = true; E.emit('gate', true); return; }
    E.next();
  };
  E.next = function () {
    E.gate = false; E.emit('gate', false);
    const i = E.seg.idx + 1;
    if (i >= FE.segs.length) { E.finish(); return; }
    E.enter(FE.segs[i], 0);
  };
  E.finish = function () { E.finished = true; E.setPlaying(false); E.emit('finish'); };
  E.continueGate = function () { if (E.gate) E.next(); };
  E.extend = function (sec) {
    sec = sec || 60;
    if (E.local >= E.seg.dur) { E.ext += sec; E.emit('tick'); } else { E.extPending += sec; E.emit('tick'); }
    E.emit('toast', 'extend');
  };
  E.skipTimer = function () {
    E.extPending = 0; E.ext = 0;
    if (E.gate) { E.next(); return; }
    E.next();
  };
  E.restartTimer = function () {
    const s = E.seg; if (!s || !s.timer) return;
    E.enter(s, s.timerAt);
  };

  E.setPlaying = function (v) {
    if (v && E.finished) return;
    E.playing = !!v;
    clearInterval(E.tickId);
    if (E.playing) {
      FE.audio.resume(); FE.Loop.start(); E.lastNow = performance.now();
      E.tickId = setInterval(() => { const n = performance.now(); const dt = Math.min(0.5, (n - E.lastNow) / 1000); E.lastNow = n; E.advance(dt); }, 50);
      // resume narration mid-line after a pause is handled by the audio element; if a line should be active but isn't loaded (after seek while paused), restart it
      const s = E.seg; if (s && !FE.qa) {
        const cur = s.lines[E.lineIx - 1];
        if (cur && cur.start <= E.local && E.local < cur.end - 0.05 && !FE.audio.cur) FE.audio.play(cur.id, E.local - cur.start, cur.who);
      }
    } else { FE.audio.pause(); FE.Loop.stop(); }
    E.emit('state');
  };
  E.toggle = () => E.setPlaying(!E.playing);
  E.seek = (d) => { E.goto(E.T + d); };
  E.replay = () => { if (E.seg) E.goto(E.seg.start); };
  E.chapterJump = function (dir) {
    const c = E.chapterOf(E.T);
    if (dir > 0) { const n = FE.chapters[c.n]; if (n) E.goto(n.a); else E.goto(FE.TOTAL - 0.02); }
    else if (E.T - c.a > 4) E.goto(c.a); else { const p = FE.chapters[c.n - 2]; E.goto(p ? p.a : 0); }
  };
  E.setMode = function (m) { E.mode = m; if (E.scene) E.scene.mode = m; if (m === 'demo' && E.gate) E.next(); E.emit('mode', m); };
  E.restart = function () {
    E.mission = {}; E.visited = {}; E.finished = false;
    E.startedAt = Date.now(); E.goto(0); E.setPlaying(false); E.emit('restarted');
  };
  E.start = function (mode) {
    E.mode = mode || E.mode; E.started = true; E.startedAt = Date.now();
    FE.audio.init();
    E.goto(0); E.setPlaying(true); E.emit('started');
  };
  E.actual = () => (E.started ? (Date.now() - E.startedAt) / 1000 : 0);
})(window);
