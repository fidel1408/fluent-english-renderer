/* Original generated music + SFX (Web Audio). No samples, no copyrighted melodies.
 * The same engine drives the live preview (AudioContext) and the offline export (OfflineAudioContext). */
window.FE = window.FE || {};

(function (FE) {
  const BPM = 96;
  const BEAT = 60 / BPM;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function prng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Four-bar loop: Cmaj7 – Am7 – Fmaj7 – G6/9 (warm, major, unmistakably not "Happy Birthday").
  const CHORDS = [
    { bass: 48, pad: [55, 59, 64, 67], arp: [60, 64, 67, 71] },
    { bass: 45, pad: [57, 60, 64, 67], arp: [57, 60, 64, 67] },
    { bass: 41, pad: [53, 57, 60, 64], arp: [65, 69, 72, 76] },
    { bass: 43, pad: [55, 59, 62, 64], arp: [62, 67, 71, 74] },
  ];
  const ARP_PATTERN = [0, -1, 2, 1, -1, 3, 2, -1]; // eighth-note slots in a bar half… indexed per beat*2+i
  // Original 16-beat motif (beat position within the 4-bar loop, MIDI note, duration in beats).
  const MOTIF = [
    [0, 76, 1], [1, 79, 1], [2, 81, 1.5], [3.5, 79, 0.5],
    [4, 76, 1], [5, 74, 1], [6, 72, 2],
    [8, 77, 1], [9, 81, 1], [10, 79, 1.5], [11.5, 76, 0.5],
    [12, 74, 1.5], [13.5, 71, 0.5], [14, 72, 2],
  ];

  // What the music is doing at video time T.
  FE.musicSection = function (T) {
    const L = FE.TL;
    const full = { bass: 1, perc: 1, arp: 1, motif: 1, pad: 1 };
    if (T < 4.3) {
      if (T >= 0.5 && T < 1.5) return { bass: 0, perc: 0, arp: 0, motif: 0, pad: 0.5 }; // playful pause
      return { bass: 0.8, perc: 0.55, arp: 0.9, motif: 0, pad: 0.7 };
    }
    if (T < L.pauseStart - 0.6) return full;
    if (T < L.pauseStart + L.pauseLen) return { bass: 0, perc: 0, arp: 0, motif: 0, pad: 0.35 }; // learner pause
    if (T < L.closeIn) return { bass: 0, perc: 0, arp: 0, motif: 0, pad: 0.6 };
    if (T < L.chord) return full;
    return { bass: 0.6, perc: 0.3, arp: 0, motif: 0, pad: 0.7 };
  };

  // Sound effects at nominal video time (live preview fires them when T crosses; export schedules them).
  FE.SFX = [
    { t: 0.5, n: "pop" }, { t: 0.62, n: "question" },
    { t: 4.3, n: "strike" }, { t: 4.7, n: "swish" },
    { t: 5.35, n: "correct" }, { t: 5.35, n: "confetti" },
    { t: 7.0, n: "soft" },
    { t: 10.3, n: "ribbon" },
    { t: 12.0, n: "soft" },
    { t: 13.4, n: "soft" },
    { t: 15.1, n: "swish" },
    { t: 17.0, n: "soft" },
    { t: 23.45, n: "swish" },
    { t: 24.1, n: "pop" }, { t: 25.0, n: "pop" },
    { t: 26.7, n: "ribbon" },
    { t: 28.0, n: "chord" }, { t: 28.0, n: "confetti2" },
  ];

  FE.createAudioEngine = function (ctx) {
    const rnd = prng(20240601);
    // Shared noise buffer (seeded → the export is reproducible).
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;

    const master = ctx.createGain();
    master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 6;
    comp.attack.value = 0.005; comp.release.value = 0.25;
    const limiter = ctx.createDynamicsCompressor(); // brick-wall style safety net
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.001; limiter.release.value = 0.06;
    master.connect(comp); comp.connect(limiter); limiter.connect(ctx.destination);

    let sess, musicBus, duck, sfxBus;
    function newSession() {
      if (sess) {
        const old = sess;
        try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setTargetAtTime(0, ctx.currentTime, 0.015); } catch (e) {}
        setTimeout(() => { try { old.disconnect(); } catch (e) {} }, 400);
      }
      sess = ctx.createGain();
      sess.connect(master);
      duck = ctx.createGain();
      musicBus = ctx.createGain();
      musicBus.gain.value = 0.9;
      sfxBus = ctx.createGain();
      sfxBus.gain.value = 1.0;
      musicBus.connect(duck); duck.connect(sess); sfxBus.connect(sess);
    }
    newSession();

    // ---------- instruments ----------
    function env(g, t, a, peak, dur) {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    function osc(type, f, t, dur, dest, peak, a, detune) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
      if (detune) o.detune.value = detune;
      const g = ctx.createGain(); env(g, t, a, peak, dur);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
      return o;
    }
    // Soft Rhodes/glock-ish bell
    function bell(m, t, dur, vel, bus) {
      const f = mtof(m);
      osc("sine", f, t, dur, bus, vel, 0.006);
      osc("sine", f * 2, t, dur * 0.55, bus, vel * 0.3, 0.004);
      osc("sine", f * 3.01, t, dur * 0.25, bus, vel * 0.1, 0.003);
    }
    // Warm marimba-like pluck
    function pluck(m, t, vel, bus) {
      const f = mtof(m);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; lp.connect(bus);
      osc("sine", f, t, 0.5, lp, vel, 0.004);
      osc("triangle", f * 2, t, 0.18, lp, vel * 0.25, 0.003);
      osc("sine", f * 4, t, 0.07, lp, vel * 0.12, 0.002);
    }
    function bass(m, t, dur, vel, bus) {
      const f = mtof(m);
      osc("sine", f, t, dur, bus, vel, 0.012);
      osc("triangle", f, t, dur * 0.7, bus, vel * 0.25, 0.012);
    }
    function pad(notes, t, dur, vel, bus) {
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100; lp.Q.value = 0.3; lp.connect(bus);
      notes.forEach((m) => {
        const f = mtof(m);
        [-5, 5].forEach((d) => {
          const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f; o.detune.value = d;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(vel, t + 0.45);
          g.gain.setValueAtTime(vel, t + Math.max(0.5, dur - 0.4));
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.5);
          o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur + 0.6);
        });
      });
    }
    function noiseHit(t, dur, ftype, f0, f1, q, peak, a, bus, offset) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const flt = ctx.createBiquadFilter(); flt.type = ftype; flt.Q.value = q;
      flt.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) flt.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = ctx.createGain(); env(g, t, a, peak, dur);
      s.connect(flt); flt.connect(g); g.connect(bus);
      s.start(t, offset == null ? rnd() * 1.5 : offset, dur + 0.05);
    }
    function kick(t, vel, bus) {
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.14);
      const g = ctx.createGain(); env(g, t, 0.004, vel, 0.28);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400;
      o.connect(g); g.connect(lp); lp.connect(bus); o.start(t); o.stop(t + 0.35);
    }

    // ---------- music: one beat at a time ----------
    function scheduleBeat(beatIdx, when, sec) {
      const bar = Math.floor(beatIdx / 4), beat = beatIdx % 4;
      const ch = CHORDS[bar % 4];
      const mb = musicBus;
      if (sec.pad > 0 && beat === 0) pad(ch.pad, when, BEAT * 4, 0.028 * sec.pad, mb);
      if (sec.bass > 0 && (beat === 0 || beat === 2)) bass(ch.bass, when, BEAT * 1.3, 0.2 * sec.bass, mb);
      if (sec.perc > 0) {
        if (beat === 0 || beat === 2) kick(when, 0.2 * sec.perc, mb);
        if (beat === 1 || beat === 3) noiseHit(when, 0.05, "bandpass", 1900, 1900, 1.2, 0.035 * sec.perc, 0.002, mb);
        noiseHit(when, 0.045, "highpass", 6500, 6500, 0.7, 0.03 * sec.perc, 0.003, mb);
        noiseHit(when + BEAT / 2, 0.04, "highpass", 7000, 7000, 0.7, 0.045 * sec.perc, 0.003, mb);
      }
      if (sec.arp > 0) {
        for (let i = 0; i < 2; i++) {
          const idx = ARP_PATTERN[(beat * 2 + i) % 8];
          if (idx >= 0) pluck(ch.arp[idx], when + i * BEAT / 2, 0.075 * sec.arp, mb);
        }
      }
      if (sec.motif > 0) {
        const lb = (bar % 4) * 4 + beat;
        MOTIF.forEach(([b, m, d]) => {
          if (Math.floor(b) === lb) bell(m, when + (b - lb) * BEAT, d * BEAT * 0.9 + 0.35, 0.085 * sec.motif, mb);
        });
      }
    }

    // ---------- SFX ----------
    const sfx = {
      pop(t) {
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(480, t); o.frequency.exponentialRampToValueAtTime(980, t + 0.07);
        const g = ctx.createGain(); env(g, t, 0.004, 0.14, 0.14);
        o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.2);
      },
      question(t) { bell(76, t + 0.02, 0.5, 0.1, sfxBus); bell(81, t + 0.2, 0.9, 0.11, sfxBus); },
      strike(t) { noiseHit(t, 0.3, "bandpass", 2400, 3800, 1.4, 0.05, 0.03, sfxBus); },
      swish(t) {
        noiseHit(t, 0.4, "bandpass", 700, 5200, 2.2, 0.15, 0.14, sfxBus);
        osc("sine", 240, t + 0.2, 0.18, sfxBus, 0.04, 0.01);
      },
      correct(t) {
        bell(79, t, 1.2, 0.1, sfxBus); bell(84, t + 0.08, 1.2, 0.1, sfxBus); bell(88, t + 0.16, 1.3, 0.08, sfxBus);
      },
      soft(t) { bell(84, t, 0.7, 0.07, sfxBus); },
      ribbon(t) {
        noiseHit(t, 0.7, "bandpass", 900, 3800, 1.6, 0.11, 0.25, sfxBus);
        [84, 88, 91].forEach((m, i) => bell(m, t + 0.1 + i * 0.12, 0.8, 0.06, sfxBus));
      },
      confetti(t, n, spread) {
        n = n || 14; spread = spread || 0.4;
        for (let i = 0; i < n; i++) {
          const tt = t + 0.02 + rnd() * spread;
          noiseHit(tt, 0.03, "bandpass", 1600 + rnd() * 2200, 1600 + rnd() * 2200, 1.0, 0.045 + rnd() * 0.03, 0.002, sfxBus);
          if (rnd() < 0.5) osc("sine", 2400 + rnd() * 2800, tt + 0.01, 0.07, sfxBus, 0.012, 0.002);
        }
      },
      confetti2(t) { sfx.confetti(t, 8, 0.25); },
      chord(t) {
        [48, 55, 64, 71, 74, 79].forEach((m, i) => bell(m, t + i * 0.035, 2.6, i === 0 ? 0.13 : 0.085, sfxBus));
        pad([48, 55, 64, 71, 74], t, 2.0, 0.03, sfxBus);
      },
    };

    return {
      ctx, BEAT, scheduleBeat, sfx, newSession,
      get duck() { return duck; },
      setDuck(level, tc) {
        duck.gain.cancelScheduledValues(ctx.currentTime);
        duck.gain.setTargetAtTime(level, ctx.currentTime, tc || 0.08);
      },
      setMuted(m) { master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.03); },
      playSfx(name, t) { if (sfx[name]) sfx[name](t == null ? ctx.currentTime + 0.01 : t); },
    };
  };

  // Live music clock: schedules beats just ahead of the audio clock, section chosen from the video time.
  FE.createMusicClock = function (engine, getT) {
    let timer = null, t0 = 0, next = 0;
    return {
      start() {
        this.stop();
        t0 = engine.ctx.currentTime + 0.12; next = 0;
        timer = setInterval(() => {
          const ctx = engine.ctx;
          while (t0 + next * engine.BEAT < ctx.currentTime + 0.4) {
            const when = t0 + next * engine.BEAT;
            const ahead = Math.max(0, when - ctx.currentTime);
            engine.scheduleBeat(next, when, FE.musicSection(getT() + ahead));
            next++;
          }
        }, 60);
      },
      stop() { if (timer) clearInterval(timer); timer = null; },
    };
  };

  // Level the music should sit at, given what's happening (shared by live + export).
  FE.DUCK = { speaking: 0.34, pause: 0.05, normal: 1.0 };

  // Render the full soundtrack (music + SFX, ducked under the nominal narration windows) offline.
  FE.renderSoundtrack = async function (opts) {
    opts = opts || {};
    const sr = 44100, dur = FE.TL.total + 1.2;
    const ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
    const eng = FE.createAudioEngine(ctx);
    const total = FE.TL.total;
    for (let b = 0; b * eng.BEAT < total + 0.5; b++) {
      const t = b * eng.BEAT;
      eng.scheduleBeat(b, t, FE.musicSection(t));
    }
    FE.SFX.forEach((e) => eng.sfx[e.n] && eng.sfx[e.n](e.t));
    // ducking automation: one level function (pause beats narration beats normal), sampled at every change point
    const speakIv = FE.CUES.map((c) => [c.at - 0.05, c.at + FE.cueEst(c) + 0.15]);
    const pauseIv = [FE.TL.pauseStart - 0.25, FE.TL.pauseStart + FE.TL.pauseLen - 0.05];
    const inIv = (t, iv) => t >= iv[0] && t < iv[1];
    const levelAt = (t) => (inIv(t, pauseIv) ? FE.DUCK.pause : speakIv.some((iv) => inIv(t, iv)) ? FE.DUCK.speaking : FE.DUCK.normal);
    const pts = [0].concat(speakIv.flat(), pauseIv).sort((a, b) => a - b);
    const d = eng.duck.gain; d.setValueAtTime(1, 0);
    let prev = 1;
    pts.forEach((t) => {
      const lv = levelAt(t + 1e-4);
      if (lv !== prev) { d.setTargetAtTime(lv, Math.max(0, t), lv < prev ? (lv === FE.DUCK.pause ? 0.12 : 0.05) : 0.3); prev = lv; }
    });
    // gentle fade at the very end
    const buf = await ctx.startRendering();
    const fadeStart = Math.floor((total + 0.3) * sr), n = buf.length;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const data = buf.getChannelData(c);
      for (let i = fadeStart; i < n; i++) data[i] *= Math.max(0, 1 - (i - fadeStart) / (n - fadeStart));
    }
    return buf;
  };

  FE.encodeWav = function (buf) {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate;
    const out = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); out.setUint32(4, 36 + n * ch * 2, true); w(8, "WAVE"); w(12, "fmt ");
    out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
    out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true);
    out.setUint16(34, 16, true); w(36, "data"); out.setUint32(40, n * ch * 2, true);
    const chans = []; for (let c = 0; c < ch; c++) chans.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      out.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
    }
    return new Uint8Array(out.buffer);
  };
})(window.FE);
