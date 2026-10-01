/* Should for Advice — narration player (one voice at a time), generated sound effects and quiet ducked music */
(function (g) {
  'use strict';
  const FE = g.FE;
  FE.CLIPS = FE.CLIPS || {};      // id -> data URI (embedded by the build)
  FE.MANIFEST = FE.MANIFEST || {}; // id -> {d: seconds, e: mouth envelope string}

  const A = (FE.audio = {
    ctx: null, ready: false, vol: { nar: 1, mus: 0.7, fx: 0.8 }, mute: { nar: false, mus: false, fx: false },
    cur: null, token: 0, blobs: {}, el: null, musicMode: 'off', musicOn: false, nodes: {}, narrating: false, paused: false,
  });
  try { const sv = JSON.parse(localStorage.getItem('fe-should-vol') || 'null'); if (sv) { Object.assign(A.vol, sv.vol || {}); Object.assign(A.mute, sv.mute || {}); } } catch (e) { /* ignore */ }
  function save() { try { localStorage.setItem('fe-should-vol', JSON.stringify({ vol: A.vol, mute: A.mute })); } catch (e) { /* ignore */ } }

  A.init = function () {
    if (A.ready) { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); return; }
    try {
      const AC = g.AudioContext || g.webkitAudioContext; A.ctx = new AC();
      const c = A.ctx, N = A.nodes;
      N.master = c.createGain(); N.master.gain.value = 0.9; N.master.connect(c.destination);
      N.music = c.createGain(); N.music.gain.value = 0; N.music.connect(N.master);
      N.fx = c.createGain(); N.fx.gain.value = 1; N.fx.connect(N.master);
      // small reverb for the pad
      const len = c.sampleRate * 2.4, imp = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = imp.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      N.rev = c.createConvolver(); N.rev.buffer = imp; const rg = c.createGain(); rg.gain.value = 0.55; N.rev.connect(rg); rg.connect(N.music);
      N.padBus = c.createGain(); N.padBus.gain.value = 1; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.Q.value = 0.4;
      N.padBus.connect(lp); lp.connect(N.music); lp.connect(N.rev);
      A.ready = true;
    } catch (e) { A.ready = false; }
    A.el = A.el || new Audio(); A.el.preload = 'auto';
    A.applyVol();
  };

  A.setVol = function (k, v) { A.vol[k] = v; save(); A.applyVol(); };
  A.setMute = function (k, m) { A.mute[k] = m; save(); A.applyVol(); };
  A.applyVol = function () {
    if (A.el) A.el.volume = A.mute.nar ? 0 : Math.min(1, A.vol.nar);
    if (!A.ready) return;
    const N = A.nodes, t = A.ctx.currentTime;
    const base = A.musicMode === 'off' ? 0 : 0.085 * (A.mute.mus ? 0 : A.vol.mus);
    const duck = A.narrating ? 0.32 : 1;
    N.music.gain.cancelScheduledValues(t); N.music.gain.setTargetAtTime(base * duck, t, 0.5);
    N.fx.gain.setTargetAtTime(A.mute.fx ? 0 : A.vol.fx, t, 0.05);
  };

  /* ---------------- narration ---------------- */
  function urlFor(id) {
    if (A.blobs[id]) return A.blobs[id];
    const uri = FE.CLIPS[id]; if (!uri) return null;
    try {
      const b64 = uri.slice(uri.indexOf(',') + 1), bin = atob(b64), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      A.blobs[id] = URL.createObjectURL(new Blob([u8], { type: 'audio/mpeg' }));
    } catch (e) { A.blobs[id] = uri; }
    return A.blobs[id];
  }
  A.stop = function () {
    A.token++; A.cur = null; A.narrating = false;
    if (A.el) { try { A.el.pause(); } catch (e) { /* ignore */ } }
    A.applyVol();
  };
  /* play clip id from offset seconds. Only one narration clip can ever exist: starting one cancels the previous. */
  A.play = function (id, offset, who) {
    A.stop();
    const url = urlFor(id); if (!url || !A.el) return false;
    const tok = ++A.token, el = A.el;
    A.cur = { id, who: who || 'narr', env: (FE.MANIFEST[id] || {}).e || null, tok };
    el.src = url;
    const go = () => { if (tok !== A.token) return; try { if (offset > 0.05) el.currentTime = offset; } catch (e) { /* ignore */ } A.narrating = true; A.applyVol(); if (!A.paused) { const p = el.play(); if (p && p.catch) p.catch(() => {}); } };
    if (el.readyState >= 1) go(); else el.addEventListener('loadedmetadata', go, { once: true });
    el.onended = () => { if (tok === A.token) { A.narrating = false; A.cur = null; A.applyVol(); } };
    return true;
  };
  A.pause = function () { A.paused = true; if (A.el) A.el.pause(); if (A.ctx && A.ctx.state === 'running') A.ctx.suspend(); };
  A.resume = function () { A.paused = false; if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); if (A.cur && A.el && A.el.paused && A.el.src) { const p = A.el.play(); if (p && p.catch) p.catch(() => {}); } };
  A.mouthLevel = function () {
    const c = A.cur; if (!c || !c.env || A.paused || !A.el) return 0;
    const i = Math.floor(A.el.currentTime * 25); const ch = c.env.charCodeAt(i);
    if (isNaN(ch)) return 0; return Math.min(1, (ch - 48) / 8);
  };
  A.currentWho = () => (A.cur ? A.cur.who : null);

  /* ---------------- sound effects (generated) ---------------- */
  function tone(f, t0, dur, type, vol, f2) {
    const c = A.ctx, o = c.createOscillator(), gn = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn); gn.connect(A.nodes.fx); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, vol, f0, f1) {
    const c = A.ctx, n = c.sampleRate * dur, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.3); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(gn); gn.connect(A.nodes.fx); s.start(t0); s.stop(t0 + dur + 0.05);
  }
  const SFX = {
    click: (t) => tone(620, t, 0.07, 'triangle', 0.16),
    pop: (t) => tone(380, t, 0.12, 'sine', 0.2, 760),
    ok: (t) => { tone(523, t, 0.16, 'sine', 0.2); tone(784, t + 0.1, 0.28, 'sine', 0.2); },
    no: (t) => { tone(220, t, 0.18, 'triangle', 0.16, 170); },
    whoosh: (t) => noise(t, 0.5, 0.12, 400, 2600),
    buzz: (t) => { tone(95, t, 0.14, 'sawtooth', 0.08); tone(100, t + 0.2, 0.14, 'sawtooth', 0.08); },
    ping: (t) => { tone(1318, t, 0.35, 'sine', 0.12); tone(1760, t + 0.02, 0.25, 'sine', 0.06); },
    reveal: (t) => { tone(440, t, 0.2, 'sine', 0.13); tone(660, t + 0.08, 0.3, 'sine', 0.13); tone(880, t + 0.16, 0.4, 'sine', 0.12); },
    bell: (t) => { tone(880, t, 0.9, 'sine', 0.14); tone(1320, t, 0.7, 'sine', 0.06); },
    tick: (t) => tone(900, t, 0.04, 'square', 0.04),
    swipe: (t) => noise(t, 0.22, 0.08, 1200, 500),
    fade: (t) => tone(500, t, 0.5, 'sine', 0.1, 200),
    page: (t) => noise(t, 0.18, 0.07, 3000, 900),
  };
  A.sfx = function (name) {
    if (!A.ready || A.mute.fx || A.paused || A.ctx.state !== 'running') return;
    const f = SFX[name]; if (f) f(A.ctx.currentTime + 0.01);
  };

  /* ---------------- quiet generative music (warm pad) ---------------- */
  const CH = {
    warm: [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 392]],
    calm: [[196, 293.7, 392, 440], [174.6, 261.6, 349.2, 392], [220, 329.6, 392, 493.9], [164.8, 246.9, 329.6, 392]],
  };
  let chordIx = 0, mTimer = 0;
  function playChord() {
    if (!A.ready || A.paused || A.musicMode === 'off') return;
    const c = A.ctx, t = c.currentTime, set = CH[A.musicMode] || CH.warm, ch = set[chordIx++ % set.length];
    ch.forEach((f, i) => {
      [0, 1].forEach((k) => {
        const o = c.createOscillator(), gn = c.createGain(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = f * (k ? 1.004 : 0.996) / (i === 0 ? 2 : 1);
        gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.05, t + 3); gn.gain.linearRampToValueAtTime(0.0001, t + 9);
        o.connect(gn); gn.connect(A.nodes.padBus); o.start(t); o.stop(t + 9.2);
      });
    });
    if (Math.random() < 0.7) { const f = ch[Math.floor(Math.random() * 4)] * 2; const o = c.createOscillator(), gn = c.createGain(); o.type = 'sine'; o.frequency.value = f; const tt = t + 2 + Math.random() * 3; gn.gain.setValueAtTime(0.0001, tt); gn.gain.exponentialRampToValueAtTime(0.035, tt + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, tt + 2.2); o.connect(gn); gn.connect(A.nodes.padBus); o.start(tt); o.stop(tt + 2.4); }
  }
  A.music = function (mode) {
    mode = mode || 'off'; if (mode === A.musicMode && (mTimer || mode === 'off')) { A.applyVol(); return; }
    A.musicMode = mode;
    if (!A.ready) return;
    A.applyVol();
    clearInterval(mTimer);
    if (A.musicMode !== 'off') { playChord(); mTimer = setInterval(playChord, 6000); }
  };
  A.setNarrating = function (v) { A.narrating = v; A.applyVol(); };
})(window);
