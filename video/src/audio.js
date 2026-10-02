/* Original music + sound effects, built from oscillators and noise.
 * Works with AudioContext (live preview) and OfflineAudioContext (MP4 export). */
(function () {
  const FE = (window.FE = window.FE || {});

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // Tiny seeded RNG so the offline render is identical to every run.
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  }

  FE.createAudio = function (ctx, opts) {
    opts = opts || {};
    const rand = rng(7);

    // ---- graph: music -> duck -> musicBus \
    //            sfx ---------> sfxBus ------> mute -> comp -> master -> out
    //            voice (export only) -> voiceBus /
    const out = ctx.destination;
    const master = ctx.createGain(); master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 12; comp.ratio.value = 6;
    comp.attack.value = 0.006; comp.release.value = 0.22;
    const mute = ctx.createGain(); mute.gain.value = 1;
    const duck = ctx.createGain(); duck.gain.value = FE.DUCK.open;
    const musicBus = ctx.createGain(); musicBus.gain.value = 0.62;
    const sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9;
    const voiceBus = ctx.createGain(); voiceBus.gain.value = 1.0;
    duck.connect(musicBus); musicBus.connect(mute); sfxBus.connect(mute); voiceBus.connect(mute);
    mute.connect(comp); comp.connect(master); master.connect(out);

    // shared echo for the melody (dotted-eighth feel)
    const echoIn = ctx.createGain(); echoIn.gain.value = 0.28;
    const delay = ctx.createDelay(1.0); delay.delayTime.value = 0.459;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    echoIn.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(duck);

    // noise buffer
    const nlen = Math.floor(ctx.sampleRate * 2);
    const noiseBuf = ctx.createBuffer(1, nlen, ctx.sampleRate);
    { const d = noiseBuf.getChannelData(0); const r = rng(99); for (let i = 0; i < nlen; i++) d[i] = r() * 2 - 1; }

    function noise(when, dur, off) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      s.start(when, off || 0, dur); return s;
    }
    function env(param, when, attack, peak, decay) {
      param.setValueAtTime(0.0001, when);
      param.linearRampToValueAtTime(peak, when + attack);
      param.exponentialRampToValueAtTime(0.0001, when + attack + decay);
    }

    function osc(type, freq, when, dur, dest, gainEnv) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
      const g = ctx.createGain(); gainEnv(g.gain);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + dur);
      return { o, g };
    }

    // ---------- instruments ----------
    function pluckBass(when, midi, vel, len) {
      const f = mtof(midi);
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 520;
      lpf.connect(duck);
      osc('triangle', f, when, len + 0.1, lpf, (p) => env(p, when, 0.012, vel, len));
      osc('sine', f * 2, when, len, lpf, (p) => env(p, when, 0.008, vel * 0.18, len * 0.5));
    }
    function epiano(when, midi, vel, len) {
      const f = mtof(midi);
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1900;
      lpf.connect(duck);
      osc('sine', f, when, len + 0.1, lpf, (p) => env(p, when, 0.01, vel, len));
      osc('sine', f * 2.01, when, len, lpf, (p) => env(p, when, 0.006, vel * 0.35, len * 0.35));
      osc('triangle', f * 0.5, when, len, lpf, (p) => env(p, when, 0.01, vel * 0.2, len * 0.6));
    }
    function marimba(when, midi, vel, len) {
      const f = mtof(midi);
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 3200;
      lpf.connect(duck); lpf.connect(echoIn);
      osc('sine', f, when, len + 0.2, lpf, (p) => env(p, when, 0.004, vel, len));
      osc('sine', f * 4, when, len, lpf, (p) => env(p, when, 0.002, vel * 0.22, 0.16));
      osc('triangle', f, when, len, lpf, (p) => env(p, when, 0.006, vel * 0.3, len * 0.6));
    }
    function kick(when, vel) {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(120, when); o.frequency.exponentialRampToValueAtTime(48, when + 0.12);
      const g = ctx.createGain(); env(g.gain, when, 0.004, vel, 0.22);
      o.connect(g); g.connect(duck); o.start(when); o.stop(when + 0.3);
    }
    function rim(when, vel) {
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 4;
      const g = ctx.createGain(); env(g.gain, when, 0.002, vel, 0.05);
      const n = noise(when, 0.08, rand() * 1.5); n.connect(f); f.connect(g); g.connect(duck);
      osc('sine', 880, when, 0.08, duck, (p) => env(p, when, 0.002, vel * 0.4, 0.05));
    }
    function shaker(when, vel) {
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6500;
      const g = ctx.createGain(); env(g.gain, when, 0.012, vel, 0.05);
      const n = noise(when, 0.09, rand() * 1.5); n.connect(f); f.connect(g); g.connect(duck);
    }

    // ---------- music score (original) ----------
    const BPM = 98, BEAT = 60 / BPM;
    const CHORDS = [ // G maj7 | E m7 | C maj7 | D7
      { root: 43, fifth: 50, tones: [59, 62, 66, 69] },
      { root: 40, fifth: 47, tones: [59, 62, 67, 71] },
      { root: 36, fifth: 43, tones: [59, 64, 67, 71] },
      { root: 38, fifth: 45, tones: [57, 62, 66, 72] },
    ];
    const MOTIF = [
      [[0, 71, 0.9], [1, 74, 0.5], [1.5, 76, 1.0], [3, 74, 0.9]],
      [[0, 71, 1.0], [1.5, 69, 0.5], [2, 71, 0.9], [3.5, 67, 0.5]],
      [[0, 72, 1.0], [1, 76, 0.5], [1.5, 74, 0.5], [2, 72, 1.0], [3.5, 71, 0.4]],
      [[0, 69, 1.0], [1.5, 72, 0.5], [2, 71, 1.0], [3, 74, 0.9]],
    ];
    function scheduleMusic(t0, dur) {
      const bars = Math.ceil(dur / (BEAT * 4));
      for (let b = 0; b < bars; b++) {
        const c = CHORDS[b % 4], bt = t0 + b * BEAT * 4;
        const intro = b < 2; // lighter first two bars
        const v = intro ? 0.7 : 1;
        pluckBass(bt, c.root, 0.20 * v, BEAT * 1.2);
        pluckBass(bt + BEAT * 1.5, c.fifth, 0.13 * v, BEAT * 0.8);
        pluckBass(bt + BEAT * 2, c.root, 0.16 * v, BEAT * 1.0);
        pluckBass(bt + BEAT * 3.5, c.fifth, 0.11 * v, BEAT * 0.6);
        [0.5, 1.5, 3].forEach((q, i) => c.tones.forEach((m, k) =>
          epiano(bt + q * BEAT + k * 0.012, m, 0.030 * v * (i === 1 ? 0.8 : 1), BEAT * 0.9)));
        kick(bt, 0.20 * v); kick(bt + BEAT * 2, 0.15 * v);
        rim(bt + BEAT * 1.5, 0.05); rim(bt + BEAT * 3.5, 0.04);
        for (let e = 0; e < 8; e++) shaker(bt + e * BEAT * 0.5, e % 2 ? 0.020 : 0.034);
        if (b >= 1) MOTIF[b % 4].forEach(([q, m, l]) => marimba(bt + q * BEAT, m, 0.11, l * BEAT * 1.1));
      }
    }

    // ---------- sound effects ----------
    function bell(freq, when, gain, decay, dest) {
      dest = dest || sfxBus;
      osc('sine', freq, when, decay + 0.1, dest, (p) => env(p, when, 0.004, gain, decay));
      osc('sine', freq * 2.76, when, decay * 0.5, dest, (p) => env(p, when, 0.003, gain * 0.22, decay * 0.4));
      osc('sine', freq * 5.4, when, decay * 0.3, dest, (p) => env(p, when, 0.002, gain * 0.07, decay * 0.2));
    }
    const FX = {
      plate(when, o) { // slide, soft thud, ceramic ting
        const k = o && o.soft ? 0.55 : 1;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
        f.frequency.setValueAtTime(1100, when); f.frequency.exponentialRampToValueAtTime(520, when + 0.3);
        const g = ctx.createGain(); env(g.gain, when, 0.05, 0.10 * k, 0.28);
        const n = noise(when, 0.4, rand()); n.connect(f); f.connect(g); g.connect(sfxBus);
        const t = when + 0.30;
        const th = ctx.createOscillator(); th.type = 'sine';
        th.frequency.setValueAtTime(130, t); th.frequency.exponentialRampToValueAtTime(58, t + 0.12);
        const tg = ctx.createGain(); env(tg.gain, t, 0.004, 0.32 * k, 0.16);
        th.connect(tg); tg.connect(sfxBus); th.start(t); th.stop(t + 0.25);
        [[2350, 0.075], [3480, 0.045], [5210, 0.022]].forEach(([fr, gn]) => bell(fr, t + 0.005, gn * k, 0.32));
      },
      rustle(when) { // soft paper menu
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3600; f.Q.value = 0.7;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500;
        f.connect(hp); hp.connect(sfxBus);
        for (let i = 0; i < 7; i++) {
          const t = when + i * 0.06 + rand() * 0.04;
          const g = ctx.createGain(); env(g.gain, t, 0.01, 0.035 + rand() * 0.04, 0.05 + rand() * 0.05);
          const n = noise(t, 0.14, rand() * 1.6); n.connect(g); g.connect(f);
        }
      },
      swish(when) { // transition whoosh + little rising accent
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.1;
        f.frequency.setValueAtTime(350, when); f.frequency.exponentialRampToValueAtTime(3800, when + 0.38);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, when);
        g.gain.linearRampToValueAtTime(0.13, when + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.5);
        const n = noise(when, 0.6, rand()); n.connect(f); f.connect(g); g.connect(sfxBus);
        bell(mtof(74), when + 0.30, 0.06, 0.5); bell(mtof(79), when + 0.40, 0.07, 0.7);
      },
      glass(when) { // glass + ice
        [[0, 3150], [0.13, 4180], [0.31, 3520]].forEach(([dt, fr]) => bell(fr, when + dt, 0.05, 0.22));
        [[0.05, 2700], [0.2, 2100]].forEach(([dt, fr]) => bell(fr, when + dt, 0.025, 0.14));
        const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 5200;
        const g = ctx.createGain(); env(g.gain, when + 0.02, 0.2, 0.022, 0.8);
        const n = noise(when, 1.2, rand()); n.connect(f); f.connect(g); g.connect(sfxBus);
        const th = ctx.createOscillator(); th.type = 'sine';
        th.frequency.setValueAtTime(150, when); th.frequency.exponentialRampToValueAtTime(70, when + 0.1);
        const tg = ctx.createGain(); env(tg.gain, when, 0.004, 0.18, 0.12);
        th.connect(tg); tg.connect(sfxBus); th.start(when); th.stop(when + 0.2);
      },
      success(when) { // short warm chord, G add9
        [67, 71, 74, 79, 81].forEach((m, i) => bell(mtof(m), when + i * 0.045, 0.06 - i * 0.004, 1.3));
        [55].forEach((m) => osc('triangle', mtof(m), when, 1.1, sfxBus, (p) => env(p, when, 0.02, 0.07, 1.0)));
      },
      accent(when) { bell(mtof(79), when, 0.06, 0.9); bell(mtof(86), when + 0.07, 0.035, 0.7); },
    };

    return {
      ctx, master, duck, musicBus, sfxBus, voiceBus, mute,
      scheduleMusic,
      sfx(name, when, o) { FX[name](when, o); },
      duckTo(level, when, tc) {
        duck.gain.cancelScheduledValues(when);
        duck.gain.setTargetAtTime(Math.max(level, 0.0005), when, tc || 0.12);
      },
      setMuted(m) { mute.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.02); },
      /** fade whole mix out (end of video) */
      fadeOut(when, dur) {
        master.gain.setValueAtTime(master.gain.value, when);
        master.gain.linearRampToValueAtTime(0.0001, when + dur);
      },
    };
  };
})();
