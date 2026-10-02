/* ===== Web Audio: original music bed + synthesized effects (no samples, no network) ===== */
const Audio_ = (() => {
  let ctx, master, limiter, musicBus, musicLP, musicDuck, sfxBus, reverb, revSend, exportDest, noiseBuf;
  let an, endTimer = null, muted = false, running = false, nextT = 0, stepIdx = 0, timer = null, endAt = Infinity, started = 0;
  const MB = 1.5, BPM = 88, EIGHTH = 60 / BPM / 2;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const CHORDS = [
    { bass: 41, notes: [57, 60, 64, 67] }, // Fmaj9 (no root in the voicing)
    { bass: 43, notes: [59, 62, 64, 69] }, // G6/9
    { bass: 40, notes: [55, 59, 62, 67] }, // Em7
    { bass: 45, notes: [55, 60, 64, 67] }  // Am7
  ];
  const MEL = [
    [76, 0, 0, 72, 0, 74, 0, 0], [79, 0, 76, 0, 74, 0, 72, 0],
    [71, 0, 0, 74, 0, 76, 0, 0], [72, 0, 76, 0, 79, 0, 76, 74]
  ];
  const KICK = [1, 0, 0, 1, 1, 0, 0, 0], RIM = [0, 0, 1, 0, 0, 0, 1, 0];

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain(); master.gain.value = 0.9;
    limiter = ctx.createDynamicsCompressor();
    Object.assign(limiter.threshold, { value: -8 }); limiter.knee.value = 6; limiter.ratio.value = 14;
    limiter.attack.value = 0.003; limiter.release.value = 0.18;
    master.connect(limiter); limiter.connect(ctx.destination);
    exportDest = ctx.createMediaStreamDestination(); limiter.connect(exportDest);
    // noise buffer
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); let seed = 7;
    for (let i = 0; i < d.length; i++) { seed = (seed * 16807) % 2147483647; d[i] = (seed / 1073741823.5) - 1; }
    // reverb IR
    const len = Math.floor(ctx.sampleRate * 1.8), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const ch = ir.getChannelData(c); let lp = 0, s = 11 + c * 5;
      for (let i = 0; i < len; i++) { s = (s * 16807) % 2147483647; const n = s / 1073741823.5 - 1; lp += (n - lp) * 0.35; ch[i] = lp * Math.pow(1 - i / len, 2.6); } }
    reverb = ctx.createConvolver(); reverb.buffer = ir;
    revSend = ctx.createGain(); revSend.gain.value = 0.22; revSend.connect(reverb); reverb.connect(master);
    musicLP = ctx.createBiquadFilter(); musicLP.type = 'lowpass'; musicLP.frequency.value = 5200; musicLP.Q.value = 0.4;
    musicDuck = ctx.createGain(); musicDuck.gain.value = 1;
    musicBus = ctx.createGain(); musicBus.gain.value = MB;
    musicBus.connect(musicLP); musicLP.connect(musicDuck); musicDuck.connect(master); musicDuck.connect(revSend);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master); sfxBus.connect(revSend);
    return ctx;
  }

  /* envelope helper: attack/decay-to-sustain/release on a gain node */
  function env(g, t, a, peak, d, sus, hold, r) {
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * sus), t + a + d);
    g.gain.setValueAtTime(Math.max(0.0002, peak * sus), t + a + d + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + hold + r);
    return t + a + d + hold + r;
  }
  function tone(bus, type, f, t, o) {
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = type; osc.frequency.setValueAtTime(f, t);
    if (o.detune) osc.detune.value = o.detune;
    if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t + (o.glideT || 0.1));
    let node = osc;
    if (o.lp) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; lp.Q.value = 0.5; osc.connect(lp); node = lp; }
    node.connect(g); g.connect(bus);
    const end = env(g, t, o.a ?? 0.01, o.g, o.d ?? 0.3, o.sus ?? 0.3, o.hold ?? 0, o.r ?? 0.3);
    osc.start(t); osc.stop(end + 0.05);
    return osc;
  }
  function noise(bus, t, dur, o) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q ?? 1;
    f.frequency.setValueAtTime(o.f0, t);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
    const g = ctx.createGain(); src.connect(f); f.connect(g); g.connect(bus);
    const a = Math.min(o.a ?? dur * 0.35, dur * .6);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(o.g, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.start(t, Math.random() * 1.5); src.stop(t + dur + 0.05);
  }

  /* --- music voices --- */
  function rhodes(t, notes, len) {
    notes.forEach((m, i) => {
      const f = mtof(m), tt = t + i * 0.012;
      tone(musicBus, 'sine', f, tt, { g: 0.055, a: 0.012, d: 0.9, sus: 0.35, hold: len - 1.0, r: 0.5, detune: -4 });
      tone(musicBus, 'triangle', f, tt, { g: 0.03, a: 0.012, d: 0.6, sus: 0.25, hold: len - 1.0, r: 0.45, detune: 5, lp: 1600 });
      tone(musicBus, 'sine', f * 2, tt, { g: 0.012, a: 0.004, d: 0.25, sus: 0.1, hold: 0, r: 0.3 }); // tine
    });
  }
  function bass(t, m, len) { tone(musicBus, 'sine', mtof(m), t, { g: 0.19, a: 0.01, d: 0.35, sus: 0.5, hold: len - 0.4, r: 0.18, lp: 420 }); }
  function pluck(t, m) {
    tone(musicBus, 'sine', mtof(m), t, { g: 0.06, a: 0.004, d: 0.5, sus: 0.02, r: 0.2 });
    tone(musicBus, 'triangle', mtof(m) * 2, t, { g: 0.015, a: 0.002, d: 0.12, sus: 0.02, r: 0.1 });
  }
  function kick(t) { tone(musicBus, 'sine', 120, t, { g: 0.2, a: 0.003, d: 0.16, sus: 0.02, r: 0.05, glideTo: 46, glideT: 0.12 }); }
  function rim(t) { noise(musicBus, t, 0.09, { f0: 1800, q: 2.2, g: 0.035, a: 0.004 }); }
  function hat(t, v) { noise(musicBus, t, 0.05, { type: 'highpass', f0: 7000, q: 0.5, g: v, a: 0.004 }); }

  function schedule() {
    if (!running) return;
    while (nextT < ctx.currentTime + 0.3) {
      const bar = Math.floor(stepIdx / 8), s = stepIdx % 8, c = CHORDS[bar % 4];
      const swing = (s % 2) ? EIGHTH * 0.14 : 0, t = nextT + swing;
      if (t < endAt) {
        if (s === 0) { rhodes(t, c.notes, EIGHTH * 8); }
        if (s === 0 || s === 4) bass(t, c.bass, EIGHTH * 4);
        if (bar >= 1) {
          if (KICK[s]) kick(t); if (RIM[s]) rim(t);
          hat(t, s % 2 ? 0.014 : 0.008);
        }
        const m = MEL[bar % 4][s]; if (m && bar >= 0) pluck(t, m);
      }
      nextT += EIGHTH; stepIdx++;
    }
  }

  /* --- public --- */
  const api = {
    meter() { if (!an) { an = ctx.createAnalyser(); an.fftSize = 2048; limiter.connect(an); } const b = new Float32Array(2048); an.getFloatTimeDomainData(b); let m = 0, pk = 0; for (const v of b) { m += v * v; pk = Math.max(pk, Math.abs(v)); } return { rmsDb: +(20 * Math.log10(Math.sqrt(m / b.length) + 1e-9)).toFixed(1), peak: +pk.toFixed(2) }; },
    debug() { return { t: +ctx.currentTime.toFixed(2), running, nextT: +nextT.toFixed(2), mb: +musicBus.gain.value.toFixed(3), md: +musicDuck.gain.value.toFixed(3), lp: Math.round(musicLP.frequency.value), sb: +sfxBus.gain.value.toFixed(2), state: ctx.state }; },
    init, get ctx() { return ctx; }, get exportStream() { return exportDest && exportDest.stream; },
    resume() { return ctx && ctx.state !== 'running' ? ctx.resume() : Promise.resolve(); },
    suspend() { return ctx && ctx.suspend(); },
    setMuted(m) { muted = m; if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.03); },
    startMusic() {
      init(); this.stopMusic(true); running = true; stepIdx = 0; endAt = Infinity; nextT = ctx.currentTime + 0.08;
      musicBus.gain.cancelScheduledValues(ctx.currentTime); musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
      musicBus.gain.linearRampToValueAtTime(MB, ctx.currentTime + 0.5);
      musicLP.frequency.setValueAtTime(5200, ctx.currentTime);
      musicDuck.gain.setValueAtTime(1, ctx.currentTime);
      timer = setInterval(schedule, 40); schedule();
    },
    stopMusic(hard) {
      if (timer) clearInterval(timer); timer = null; running = false; if (endTimer) clearTimeout(endTimer); endTimer = null;
      if (ctx && hard) { const t = ctx.currentTime; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setTargetAtTime(0.0001, t, 0.03); }
    },
    /* closing: let the last chord ring, then fade the bed */
    endMusic(sec = 1.6) {
      if (!ctx || !running) return; const t = ctx.currentTime;
      endAt = t + 0.05; musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(musicBus.gain.value, t);
      musicBus.gain.linearRampToValueAtTime(0.0001, t + sec);
      endTimer = setTimeout(() => this.stopMusic(), (sec + 0.3) * 1000);
      this.sfx.revealChord(0.55);
    },
    /* level while voices speak / during the learner's silence */
    duck(mode) {
      if (!ctx) return; const lv = { idle: 1, voice: 0.36, silent: 0.025 }[mode] ?? 1, t = ctx.currentTime;
      musicDuck.gain.cancelScheduledValues(t); musicDuck.gain.setTargetAtTime(lv, t, mode === 'silent' ? 0.25 : 0.12);
      sfxBus.gain.setTargetAtTime(mode === 'silent' ? 0.0 : mode === 'voice' ? 0.7 : 0.9, t, 0.1);
    },
    /* brief, friendly musical interruption: filter closes, a soft "bloop", then the bed returns */
    interrupt() {
      if (!ctx) return; const t = ctx.currentTime;
      musicLP.frequency.cancelScheduledValues(t); musicLP.frequency.setValueAtTime(5200, t);
      musicLP.frequency.exponentialRampToValueAtTime(260, t + 0.14);
      musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(MB, t);
      musicBus.gain.linearRampToValueAtTime(0.0001, t + 0.18);
      musicBus.gain.setValueAtTime(0.0001, t + 0.62); musicBus.gain.linearRampToValueAtTime(MB, t + 0.95);
      musicLP.frequency.setValueAtTime(260, t + 0.62); musicLP.frequency.exponentialRampToValueAtTime(5200, t + 0.95);
      tone(sfxBus, 'sine', 523, t + 0.1, { g: 0.1, a: 0.01, d: 0.22, sus: 0.05, r: 0.12, glideTo: 392, glideT: 0.2 });
      tone(sfxBus, 'sine', 392, t + 0.34, { g: 0.09, a: 0.01, d: 0.2, sus: 0.05, r: 0.12, glideTo: 311, glideT: 0.18 });
    },
    sfx: {
      swish(dir = 1, dur = 0.38, g = 0.16) { if (!ctx) return; const t = ctx.currentTime; noise(sfxBus, t, dur, { f0: dir > 0 ? 500 : 3200, f1: dir > 0 ? 3200 : 500, q: 0.9, g, a: dur * 0.45 }); },
      paperFlip() {
        if (!ctx) return; const t = ctx.currentTime;
        noise(sfxBus, t, 0.2, { f0: 900, f1: 3600, q: 1.1, g: 0.2, a: 0.07 });
        [0.0, 0.07, 0.115, 0.15].forEach((d, i) => noise(sfxBus, t + 0.12 + d, 0.035, { type: 'highpass', f0: 3200 + i * 500, g: 0.07 - i * 0.012, a: 0.004 }));
        noise(sfxBus, t + 0.2, 0.09, { type: 'lowpass', f0: 1300, q: 0.4, g: 0.16, a: 0.006 });
      },
      cup(pitch = 1) {
        if (!ctx) return; const t = ctx.currentTime;
        tone(sfxBus, 'sine', 170 * pitch, t, { g: 0.26, a: 0.003, d: 0.12, sus: 0.02, r: 0.05, glideTo: 75, glideT: 0.1 });
        noise(sfxBus, t, 0.03, { type: 'highpass', f0: 2600, g: 0.08, a: 0.003 });
        tone(sfxBus, 'sine', 2050 * pitch, t, { g: 0.045, a: 0.002, d: 0.18, sus: 0.01, r: 0.1 });
        tone(sfxBus, 'sine', 3320 * pitch, t, { g: 0.025, a: 0.002, d: 0.12, sus: 0.01, r: 0.08 });
      },
      pop(f = 660) { if (!ctx) return; const t = ctx.currentTime; tone(sfxBus, 'sine', f, t, { g: 0.1, a: 0.004, d: 0.09, sus: 0.03, r: 0.05, glideTo: f * 1.45, glideT: 0.07 }); },
      pluck(m = 84) { if (!ctx) return; const t = ctx.currentTime; tone(sfxBus, 'sine', mtof(m), t, { g: 0.09, a: 0.003, d: 0.5, sus: 0.02, r: 0.2 }); tone(sfxBus, 'triangle', mtof(m) * 2, t, { g: 0.02, a: 0.002, d: 0.15, sus: 0.02, r: 0.1 }); },
      sparkle() { if (!ctx) return; const t = ctx.currentTime; [1568, 2093, 2637].forEach((f, i) => tone(sfxBus, 'sine', f, t + i * 0.07, { g: 0.035, a: 0.003, d: 0.25, sus: 0.01, r: 0.15 })); },
      scribble() { if (!ctx) return; const t = ctx.currentTime; for (let i = 0; i < 6; i++) noise(sfxBus, t + i * 0.13, 0.1, { f0: 2200 + (i % 3) * 400, f1: 3000, q: 1.5, g: 0.03, a: 0.03 }); },
      revealChord(g = 1) {
        if (!ctx) return; const t = ctx.currentTime;
        [48, 60, 64, 67, 71, 74].forEach((m, i) => {
          tone(sfxBus, 'sine', mtof(m), t + i * 0.025, { g: 0.07 * g, a: 0.03, d: 1.1, sus: 0.4, hold: 0.5, r: 1.1 });
          tone(sfxBus, 'triangle', mtof(m), t + i * 0.025, { g: 0.03 * g, a: 0.03, d: 0.9, sus: 0.3, hold: 0.3, r: 0.9, lp: 2200, detune: 6 });
        });
        tone(sfxBus, 'sine', 2093, t + 0.1, { g: 0.02 * g, a: 0.05, d: 0.9, sus: 0.1, r: 0.8 });
      },
      chime() { if (!ctx) return; const t = ctx.currentTime; [79, 83, 86].forEach((m, i) => tone(sfxBus, 'sine', mtof(m), t + i * 0.09, { g: 0.06, a: 0.004, d: 0.6, sus: 0.02, r: 0.4 })); }
    }
  };
  return api;
})();
