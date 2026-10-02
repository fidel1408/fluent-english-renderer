/* AUDIO — all sound is generated in code. Music/effects: Web Audio. Voice: browser speechSynthesis. */
(function (FE) {
  'use strict';
  const A = FE.Audio = {};
  let ctx = null, master, comp, musicBus, fxBus, wet, bedNodes = [], bedTimer = null, bedOn = false;
  const vol = { music: 0.5, fx: 0.7 };
  let ducked = false, quiet = false, speaking = false;

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  A.unlock = function () {
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16; comp.knee.value = 24; comp.ratio.value = 6; comp.attack.value = 0.005; comp.release.value = 0.25;
        master = ctx.createGain(); master.gain.value = 0.8;
        master.connect(comp); comp.connect(ctx.destination);
        musicBus = ctx.createGain(); fxBus = ctx.createGain();
        musicBus.connect(master); fxBus.connect(master);
        // procedural reverb tail
        const len = ctx.sampleRate * 1.8, ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
        const conv = ctx.createConvolver(); conv.buffer = ir;
        wet = ctx.createGain(); wet.gain.value = 0.22; conv.connect(wet); wet.connect(master);
        A._conv = conv;
        A.applyVolumes();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    } catch (e) { return false; }
  };
  A.ready = () => !!ctx;
  A._tap = () => { const an = ctx.createAnalyser(); an.fftSize = 2048; comp.connect(an); return an; }; // test hook: observe the final mix
  A.debug = () => ({ state: ctx ? ctx.state : 'none', ducked, quiet, speaking, bedOn, musicTarget: targetMusic(), master: master ? master.gain.value : null });

  function targetMusic() {
    let g = vol.music * 0.5;
    if (quiet) g = 0;
    else if (ducked) g *= 0.3;
    return g;
  }
  A.applyVolumes = function () {
    if (!ctx) return;
    const t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t); musicBus.gain.setTargetAtTime(targetMusic(), t, quiet ? 0.6 : 0.25);
    fxBus.gain.setTargetAtTime(vol.fx * 0.9, t, 0.05);
  };
  A.setVolume = (k, v) => { vol[k] = v; A.applyVolumes(); };
  A.setQuiet = (q) => { quiet = q; A.applyVolumes(); };
  A.setSpeaking = (s) => { speaking = s; ducked = s; A.applyVolumes(); };

  /* generic soft note: sine+triangle with fast attack, exponential decay, optional reverb send */
  function note(freq, t0, dur, g = 0.12, bus = 'fx', type = 'sine', send = 0.5) {
    if (!ctx) return;
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), gn = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq; o2.type = 'sine'; o2.frequency.value = freq * 2.001;
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    lp.type = 'lowpass'; lp.frequency.value = 4200;
    gn.gain.setValueAtTime(0.0001, t0);
    gn.gain.linearRampToValueAtTime(g, t0 + 0.012);
    gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(gn); o2.connect(g2); g2.connect(gn); gn.connect(lp);
    lp.connect(bus === 'music' ? musicBus : fxBus);
    if (send && A._conv) { const s = ctx.createGain(); s.gain.value = send; lp.connect(s); s.connect(A._conv); }
    o.start(t0); o2.start(t0); o.stop(t0 + dur + 0.05); o2.stop(t0 + dur + 0.05);
  }

  /* ----- Original opening theme (~11 s): rising pentatonic motif over a warm Cmaj9 pad ----- */
  A.theme = function () {
    if (!ctx) return 0;
    const t = ctx.currentTime + 0.1, bpm = 84, b = 60 / bpm;
    // pad
    [[48, 55, 64, 71], [45, 52, 60, 67], [53, 60, 65, 72], [43, 50, 59, 66]].forEach((ch, i) =>
      ch.forEach((m) => note(mtof(m), t + i * 4 * b, 4.2 * b, 0.05, 'music', 'triangle', 0.6)));
    // melody: C major pentatonic
    const mel = [[72, 0, 1], [76, 1, 1], [79, 2, 1.5], [76, 3.5, 0.5], [74, 4, 1], [72, 5, 1], [69, 6, 1.5], [72, 7.5, 0.5],
      [77, 8, 1], [76, 9, 1], [74, 10, 1], [79, 11, 1], [84, 12, 3.5]];
    mel.forEach(([m, s, d]) => note(mtof(m), t + s * b, d * b * 1.4, 0.1, 'music', 'sine', 0.7));
    // gentle sparkle arpeggio
    [84, 88, 91, 95].forEach((m, i) => note(mtof(m), t + (12.2 + i * 0.25) * b, 1.2, 0.035, 'music', 'sine', 0.8));
    return 16 * b * 1000;
  };

  /* ----- Ambient bed: slow chord loop, very soft; stopped/faded during learner speaking ----- */
  const CHORDS = [[48, 55, 59, 64], [45, 52, 57, 64], [41, 48, 57, 64], [43, 50, 55, 62]];
  let ci = 0;
  function bedChord() {
    if (!bedOn || !ctx) return;
    const t = ctx.currentTime + 0.05, d = 6.5;
    CHORDS[ci % 4].forEach((m) => note(mtof(m), t, d, 0.05, 'music', 'triangle', 0.7));
    note(mtof(CHORDS[ci % 4][3] + 12), t + 1.2, 3, 0.03, 'music', 'sine', 0.8);
    ci++;
    bedTimer = setTimeout(bedChord, 6000);
  }
  A.bed = function (on) {
    if (on === bedOn) return;
    bedOn = on;
    clearTimeout(bedTimer);
    if (on && ctx) bedChord();
  };

  /* ----- Effects (all soft; no buzzers) ----- */
  const SC = [60, 62, 64, 67, 69, 72, 74, 76];
  A.pop = (i = 0) => { if (!ctx) return; note(mtof(SC[i % 8] + 12), ctx.currentTime + 0.01, 0.35, 0.11, 'fx', 'triangle', 0.35); };
  A.tick = () => { if (!ctx) return; note(mtof(84), ctx.currentTime, 0.12, 0.05, 'fx', 'sine', 0.1); };
  A.reveal = () => { if (!ctx) return; const t = ctx.currentTime; note(mtof(76), t, 0.7, 0.09, 'fx', 'sine', 0.6); note(mtof(83), t + 0.09, 0.8, 0.07, 'fx', 'sine', 0.6); };
  A.good = () => { if (!ctx) return; const t = ctx.currentTime; note(mtof(72), t, 0.5, 0.09); note(mtof(76), t + 0.1, 0.5, 0.09); note(mtof(79), t + 0.2, 0.9, 0.09, 'fx', 'sine', 0.6); };
  // gentle "not yet": one soft, warm, falling tone — never a buzzer
  A.soft = () => { if (!ctx) return; const t = ctx.currentTime; note(mtof(64), t, 0.45, 0.07, 'fx', 'sine', 0.4); note(mtof(60), t + 0.16, 0.6, 0.06, 'fx', 'sine', 0.4); };
  A.whoosh = () => {
    if (!ctx) return;
    const t = ctx.currentTime, len = ctx.sampleRate * 0.5, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.45);
    const g = ctx.createGain(); g.gain.value = 0.05;
    s.connect(f); f.connect(g); g.connect(fxBus); s.start(t);
    note(mtof(79), t + 0.12, 0.5, 0.05, 'fx', 'sine', 0.6);
  };
  A.timeUp = () => { if (!ctx) return; const t = ctx.currentTime; [72, 76, 79].forEach((m, i) => note(mtof(m), t + i * 0.28, 1.0, 0.07, 'fx', 'sine', 0.7)); };
  A.endChord = () => {
    if (!ctx) return;
    const t = ctx.currentTime + 0.05;
    [48, 55, 59, 64, 67, 71, 74, 79].forEach((m, i) => note(mtof(m), t + i * 0.09, 4.2, 0.06, 'fx', 'sine', 0.9));
  };

  /* ================= Speech ================= */
  const Sp = FE.Speech = { voices: [], en: null, es: null, rate: 0.85, vol: 1, mute: false, token: 0, pending: null };
  const ss = window.speechSynthesis;
  Sp.supported = !!(ss && window.SpeechSynthesisUtterance);

  Sp.loadVoices = function () {
    if (!Sp.supported) return [];
    Sp.voices = ss.getVoices() || [];
    return Sp.voices;
  };
  const isEn = (v) => /^en[-_]/i.test(v.lang) || /^en$/i.test(v.lang);
  const isUS = (v) => /^en[-_]US/i.test(v.lang);
  Sp.enVoices = () => Sp.voices.filter(isEn).sort((a, b) => (isUS(b) - isUS(a)) || a.name.localeCompare(b.name));
  Sp.esVoices = () => Sp.voices.filter((v) => /^es/i.test(v.lang)).sort((a, b) => a.name.localeCompare(b.name));
  Sp.pick = function (enName, esName) {
    const en = Sp.enVoices(), es = Sp.esVoices();
    Sp.en = en.find((v) => v.voiceURI === enName || v.name === enName) || en.find(isUS) || en[0] || null;
    Sp.es = es.find((v) => v.voiceURI === esName || v.name === esName) || es.find((v) => /^es[-_](MX|US|419)/i.test(v.lang)) || es[0] || null;
  };
  Sp.init = function (onChange) {
    if (!Sp.supported) return;
    const upd = () => { Sp.loadVoices(); onChange && onChange(); };
    upd();
    if (ss.addEventListener) ss.addEventListener('voiceschanged', upd); else ss.onvoiceschanged = upd;
    // some browsers never fire voiceschanged: poll briefly
    let n = 0; const iv = setInterval(() => { if (Sp.voices.length || ++n > 20) clearInterval(iv); else upd(); }, 400);
  };

  /* Cancel everything queued/speaking; any pending say() resolves so sequences can unwind. */
  Sp.cancel = function () {
    Sp.token++;
    if (Sp.pending) { const p = Sp.pending; Sp.pending = null; clearTimeout(p.wd); p.done(false); }
    if (Sp.supported) try { ss.cancel(); } catch (e) {}
    A.setSpeaking(false);
    FE.onSpeakEnd && FE.onSpeakEnd();
  };

  /* say(): resolves true when finished, false when cancelled/muted. Never overlaps: cancels prior. */
  Sp.say = function (text, opts = {}) {
    const lang = opts.lang || 'en';
    const my = ++Sp.token;
    if (Sp.pending) { const p = Sp.pending; Sp.pending = null; clearTimeout(p.wd); p.done(false); if (Sp.supported) try { ss.cancel(); } catch (e) {} }
    const est = Math.max(900, text.length * 75 / (opts.rate || Sp.rate));
    return new Promise((resolve) => {
      const voice = lang === 'es' ? Sp.es : Sp.en;
      if ((Sp.mute && !opts.force) || !Sp.supported) {
        // silent: keep a short, text-length based pause so animation order is preserved
        const wd = setTimeout(() => { if (Sp.token === my) { Sp.pending = null; FE.onSpeakEnd && FE.onSpeakEnd(); } resolve(true); }, Math.min(est * 0.6, 2200));
        Sp.pending = { wd, done: (ok) => { clearTimeout(wd); resolve(ok); } };
        FE.onSpeakStart && FE.onSpeakStart(text, lang);
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'es' ? (voice ? voice.lang : 'es-MX') : 'en-US';
      if (voice) u.voice = voice;
      u.rate = Math.min(1.6, Math.max(0.4, opts.rate || Sp.rate));
      u.volume = Sp.vol;
      let finished = false;
      const finish = (ok) => {
        if (finished) return; finished = true;
        if (Sp.token === my) { Sp.pending = null; A.setSpeaking(false); FE.onSpeakEnd && FE.onSpeakEnd(); }
        resolve(ok);
      };
      const wd = setTimeout(() => finish(true), est * 2.5 + 2500); // watchdog: some devices never fire onend
      Sp.pending = { wd, done: (ok) => { clearTimeout(wd); finished = true; resolve(ok); } };
      u.onstart = () => { if (Sp.token === my) { A.setSpeaking(true); } };
      u.onend = () => { clearTimeout(wd); finish(true); };
      u.onerror = (e) => { clearTimeout(wd); finish(e && (e.error === 'canceled' || e.error === 'interrupted') ? false : true); };
      FE.onSpeakStart && FE.onSpeakStart(text, lang);
      try { ss.cancel(); ss.speak(u); if (ss.paused) ss.resume(); } catch (e) { finish(true); }
    });
  };
})(window.FE = window.FE || {});
