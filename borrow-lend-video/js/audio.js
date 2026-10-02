/* Fluent English – generative audio (Web Audio). Original music bed + layered sound effects, all synthesized in code.
   The same code runs live (AudioContext) and offline (OfflineAudioContext, used by the video export). */
(function () {
  const FE = (window.FE = window.FE || {});

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* When the sound effects fire, in seconds from the start of each beat (matches the animation). */
  FE.SFX_CUES = {
    hook: [[0.2, "pop"], [0.45, "pop"], [0.55, "whoosh"]],
    borrowAsk: [[0.0, "pop"]],
    borrowHand: [[0.04, "flutter"], [0.6, "tap"]],
    rewind: [[0.0, "rewind"]],
    lendAsk: [[0.0, "pop"]],
    lendHand: [[0.04, "flutter"], [0.6, "tap"]],
    lendNarr: [[0.2, "pop"]],
    speakPrompt: [[0.0, "pop"], [0.55, "sparkle"]],
    reveal: [[0.0, "chord"]],
    cta: [[0.0, "chime"], [2.3, "sparkle"]],
  };

  /* Chord loop: C – Am – F – G (bright, friendly). */
  const CHORDS = [
    { bass: 36, pad: [55, 59, 62, 64], arp: [72, 76, 79, 83, 74] },
    { bass: 33, pad: [52, 55, 60, 64], arp: [69, 72, 76, 79, 71] },
    { bass: 41, pad: [57, 60, 64, 65], arp: [72, 69, 77, 76, 79] },
    { bass: 43, pad: [55, 59, 62, 64], arp: [74, 71, 79, 76, 83] },
  ];
  const BPM = 96, BEAT = 60 / BPM, BAR = BEAT * 4;
  const ARP_SEQ = [0, 1, 2, 1, 3, 2, 4, 2], ARP_MASK = [1, 0, 1, 1, 0, 1, 1, 1];

  FE.createAudioGraph = function (ctx) {
    const sr = ctx.sampleRate;
    const rnd = prng(20240601);
    // noise buffer
    const nb = ctx.createBuffer(1, sr * 2, sr), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;

    const out = ctx.createGain(); out.gain.value = 0.9; // master (mute lives here)
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 6; comp.attack.value = 0.004; comp.release.value = 0.22;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.08;
    const mix = ctx.createGain(); mix.gain.value = 0.85;
    const musicBus = ctx.createGain(); musicBus.gain.value = 0.5;
    const duck = ctx.createGain(); duck.gain.value = 0.9;
    const sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9;
    // light room reverb (generated impulse) for pads and chords
    const verb = ctx.createConvolver(); {
      const len = Math.floor(sr * 1.6), ir = ctx.createBuffer(2, len, sr);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      verb.buffer = ir;
    }
    const verbSend = ctx.createGain(); verbSend.gain.value = 0.35; const verbRet = ctx.createGain(); verbRet.gain.value = 0.5;
    musicBus.connect(duck); duck.connect(mix); musicBus.connect(verbSend); verbSend.connect(verb); verb.connect(verbRet); verbRet.connect(duck);
    sfxBus.connect(mix); mix.connect(comp); comp.connect(limiter); limiter.connect(out); out.connect(ctx.destination);
    let streamDest = null;
    const g = { ctx, out, duck, musicBus, sfxBus };
    g.streamDestination = function () { if (!streamDest && ctx.createMediaStreamDestination) { streamDest = ctx.createMediaStreamDestination(); out.connect(streamDest); } return streamDest; };

    const env = (gain, t0, a, peak, d, sustain) => { gain.gain.setValueAtTime(0.0001, t0); gain.gain.linearRampToValueAtTime(peak, t0 + a); gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain || 0.0001), t0 + a + d); };
    const panned = (node, p) => { if (ctx.createStereoPanner) { const s = ctx.createStereoPanner(); s.pan.value = p; node.connect(s); return s; } return node; };

    /* ---- music ---- */
    function pluck(t, midi, vel, pan, dest) {
      const f = mtof(midi), o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), gn = ctx.createGain(), lp = ctx.createBiquadFilter();
      o1.type = "sine"; o2.type = "triangle"; o1.frequency.value = f; o2.frequency.value = f * 2.0; o2.detune.value = 4;
      lp.type = "lowpass"; lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(1400, t + 0.35);
      const g2 = ctx.createGain(); g2.gain.value = 0.28; o2.connect(g2);
      o1.connect(lp); g2.connect(lp); lp.connect(gn); panned(gn, pan).connect(dest);
      env(gn, t, 0.004, 0.2 * vel, 0.42, 0.0001);
      o1.start(t); o2.start(t); o1.stop(t + 0.6); o2.stop(t + 0.6);
    }
    function pad(t, notes, dur, dest) {
      notes.forEach((m, i) => {
        [-5, 5].forEach((det) => {
          const o = ctx.createOscillator(), gn = ctx.createGain(), lp = ctx.createBiquadFilter();
          o.type = "triangle"; o.frequency.value = mtof(m); o.detune.value = det;
          lp.type = "lowpass"; lp.frequency.value = 1100;
          o.connect(lp); lp.connect(gn); panned(gn, (i - 1.5) * 0.25).connect(dest);
          gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.034, t + 0.6); gn.gain.setValueAtTime(0.034, t + dur - 0.5); gn.gain.linearRampToValueAtTime(0.0001, t + dur + 0.5);
          o.start(t); o.stop(t + dur + 0.6);
        });
      });
    }
    function bass(t, midi, vel, dest) {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = "sine"; o.frequency.value = mtof(midi); o.connect(gn); gn.connect(dest);
      env(gn, t, 0.01, 0.34 * vel, 0.9, 0.0001); o.start(t); o.stop(t + 1.2);
    }
    function shaker(t, vel, dest) {
      const s = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), gn = ctx.createGain();
      s.buffer = nb; hp.type = "highpass"; hp.frequency.value = 7000; s.connect(hp); hp.connect(gn); gn.connect(dest);
      env(gn, t, 0.002, 0.05 * vel, 0.05, 0.0001); s.start(t, rnd() * 1.5, 0.12);
    }
    let nextBar = 0;
    /* Schedules every bar that starts before `upTo` (seconds on the context clock). */
    g.scheduleMusic = function (upTo) {
      while (nextBar * BAR < upTo) {
        const t0 = nextBar * BAR, ch = CHORDS[nextBar % 4];
        pad(t0, ch.pad, BAR, musicBus);
        bass(t0, ch.bass, 1, musicBus); bass(t0 + BEAT * 2.5, ch.bass + (nextBar % 2 ? 7 : 0), 0.6, musicBus);
        for (let i = 0; i < 8; i++) {
          const t = t0 + i * BEAT * 0.5;
          if (ARP_MASK[i]) pluck(t, ch.arp[ARP_SEQ[i]], i % 2 ? 0.65 : 1, ((i % 4) - 1.5) * 0.35, musicBus);
        }
        for (let i = 0; i < 16; i++) if (i % 2 === 1 || i % 4 === 0) shaker(t0 + i * BEAT * 0.25, i % 4 === 2 ? 1 : 0.6, musicBus);
        nextBar++;
      }
    };
    g.resetMusic = function () { nextBar = 0; };

    /* Music ducking under narration; nearly silent during the practice pause. */
    g.setDuck = function (level, when, tc) {
      duck.gain.cancelScheduledValues(when);
      duck.gain.setTargetAtTime(level, when, tc == null ? 0.08 : tc);
    };
    g.fadeOutAll = function (when, dur) { out.gain.setValueAtTime(out.gain.value, when); out.gain.linearRampToValueAtTime(0.0001, when + dur); };
    g.setMuted = function (m) { out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.02); };

    /* ---- sound effects ---- */
    const SFX = {
      pop(t) { // soft bubble pop
        const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = "sine";
        o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(760, t + 0.07);
        o.connect(gn); gn.connect(sfxBus); env(gn, t, 0.004, 0.16, 0.12, 0.0001); o.start(t); o.stop(t + 0.2);
      },
      whoosh(t) {
        const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gn = ctx.createGain();
        s.buffer = nb; bp.type = "bandpass"; bp.Q.value = 1.6; bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.7);
        s.connect(bp); bp.connect(gn); gn.connect(sfxBus); env(gn, t, 0.25, 0.12, 0.55, 0.0001); s.start(t, 0.3, 1.0);
      },
      flutter(t) { // soft page flutter: a burst of short, filtered noise grains
        for (let i = 0; i < 11; i++) {
          const tt = t + i * 0.036 + (i % 3) * 0.006, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gn = ctx.createGain();
          s.buffer = nb; bp.type = "bandpass"; bp.frequency.value = 2600 + ((i * 937) % 2400); bp.Q.value = 1.1;
          s.connect(bp); bp.connect(gn); gn.connect(sfxBus); env(gn, tt, 0.004, 0.2 * (1 - i / 14), 0.03, 0.0001); s.start(tt, (i * 0.17) % 1.5, 0.08);
        }
      },
      tap(t) { // gentle handover tap
        const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = "sine";
        o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.1);
        o.connect(gn); gn.connect(sfxBus); env(gn, t, 0.002, 0.5, 0.16, 0.0001); o.start(t); o.stop(t + 0.25);
        const s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), gn2 = ctx.createGain();
        s.buffer = nb; lp.type = "lowpass"; lp.frequency.value = 1500; s.connect(lp); lp.connect(gn2); gn2.connect(sfxBus); env(gn2, t, 0.001, 0.22, 0.05, 0.0001); s.start(t, 0.7, 0.1);
      },
      rewind(t) { // tape-style rewind swish
        const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gn = ctx.createGain();
        s.buffer = nb; bp.type = "bandpass"; bp.Q.value = 2.4; bp.frequency.setValueAtTime(5200, t); bp.frequency.exponentialRampToValueAtTime(380, t + 0.62);
        s.connect(bp); bp.connect(gn); gn.connect(sfxBus); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.4, t + 0.12); gn.gain.linearRampToValueAtTime(0.0001, t + 0.7); s.start(t, 0.2, 0.8);
        const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(1100, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.6);
        o.connect(og); og.connect(sfxBus); og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.07, t + 0.1); og.gain.linearRampToValueAtTime(0.0001, t + 0.65); o.start(t); o.stop(t + 0.75);
        SFX.tap(t + 0.66);
      },
      sparkle(t) {
        [76, 79, 83].forEach((m, i) => {
          const o = ctx.createOscillator(), gn = ctx.createGain(), tt = t + i * 0.07; o.type = "sine"; o.frequency.value = mtof(m);
          o.connect(gn); panned(gn, i === 1 ? 0.4 : -0.4).connect(sfxBus); env(gn, tt, 0.003, 0.07, 0.4, 0.0001); o.start(tt); o.stop(tt + 0.6);
        });
      },
      chime(t) {
        [79, 84].forEach((m, i) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = "triangle"; o.frequency.value = mtof(m); o.connect(gn); gn.connect(sfxBus); gn.connect(verbSend); env(gn, t + i * 0.12, 0.004, 0.16, 0.9, 0.0001); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 1.2); });
      },
      chord(t) { // warm answer-reveal chord (Cmaj9) + shimmer
        [48, 60, 64, 67, 71, 74].forEach((m, i) => {
          const o = ctx.createOscillator(), o2 = ctx.createOscillator(), gn = ctx.createGain(), lp = ctx.createBiquadFilter();
          o.type = "triangle"; o2.type = "sine"; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 2; o.detune.value = i % 2 ? 5 : -5;
          lp.type = "lowpass"; lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(900, t + 1.6);
          const g2 = ctx.createGain(); g2.gain.value = 0.2; o2.connect(g2); o.connect(lp); g2.connect(lp); lp.connect(gn); panned(gn, (i - 2.5) * 0.18).connect(sfxBus); gn.connect(verbSend);
          env(gn, t + i * 0.025, 0.02, 0.1, 1.9, 0.0001); o.start(t); o2.start(t); o.stop(t + 2.4); o2.stop(t + 2.4);
        });
        SFX.sparkle(t + 0.12);
      },
    };
    g.sfx = function (name, when) { if (SFX[name]) SFX[name](when); };
    return g;
  };

  /* ---- plan shared by live and offline: duck levels ---- */
  FE.DUCK = { talk: 0.34, rest: 0.9, pause: 0.04 };

  /* Offline render for export: returns Int16 stereo samples at `sr`. */
  FE.renderOfflineAudio = async function (schedule, sr) {
    sr = sr || 44100;
    const total = schedule.total + 0.8;
    const ctx = new OfflineAudioContext(2, Math.ceil(total * sr), sr);
    const g = FE.createAudioGraph(ctx);
    g.scheduleMusic(total + 1);
    g.setDuck(FE.DUCK.rest, 0, 0.01);
    schedule.beats.forEach((b) => {
      (FE.SFX_CUES[b.id] || []).forEach(([dt, name]) => g.sfx(name, b.start + dt));
      if (b.id === "pause") { g.setDuck(FE.DUCK.pause, b.start - 0.05, 0.1); }
      else if (b.speech) {
        g.setDuck(FE.DUCK.talk, b.start + b.sp - 0.06, 0.06);
        g.setDuck(FE.DUCK.rest, b.start + b.sp + b.speechDur + 0.1, 0.25);
      }
    });
    g.fadeOutAll(schedule.total - 0.7, 0.7);
    const buf = await ctx.startRendering();
    const L = buf.getChannelData(0), R = buf.getChannelData(1), n = Math.ceil(schedule.total * sr), out = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) { out[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767; out[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
    let bin = ""; const u8 = new Uint8Array(out.buffer);
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(bin);
  };
})();
