/* Procedural audio (Web Audio only — no samples, no network). Works on AudioContext (live preview)
   and OfflineAudioContext (stem export). Layers: music, ambience, sfx. Voices are handled elsewhere. */
(function () {
  const FE = (window.FE = window.FE || {});
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4, SWING = 0.57;
  FE.MUSIC = { BPM, BAR };

  const CHORDS = [
    { n: 'Cmaj7', v: [52, 55, 59, 64], root: 36, fifth: 43, tones: [72, 76, 79, 83, 74] },
    { n: 'Am7', v: [52, 57, 60, 64], root: 33, fifth: 40, tones: [69, 72, 76, 79, 74] },
    { n: 'Dm7', v: [53, 57, 60, 64], root: 38, fifth: 45, tones: [74, 77, 81, 72, 76] },
    { n: 'G7', v: [53, 55, 59, 65], root: 31, fifth: 38, tones: [71, 74, 79, 77, 76] }
  ];
  const FINAL = { n: 'Cmaj9', v: [52, 59, 62, 67, 71], root: 36, fifth: 43 };

  function noiseBuf(ctx, secs, seed) {
    const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), r = FE.U.rng(seed || 7);
    let b0 = 0, b1 = 0, b2 = 0; // pink-ish
    for (let i = 0; i < n; i++) { const w = r() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; }
    return b;
  }
  function impulse(ctx, secs, decay) {
    const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, n, ctx.sampleRate), r = FE.U.rng(99);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }

  /* voice windows used for ducking (start, end, level) */
  function windows() {
    const w = [];
    FE.CUES.forEach((q) => {
      const d = FE.VOICES && FE.VOICES.cues[q.id] ? FE.VOICES.cues[q.id].dur : 2.6;
      w.push({ s: q.t - 0.05, e: q.t + d + 0.45, m: q.lang === 'en' ? 0.1 : 0.2, a: q.lang === 'en' ? 0.35 : 0.5 });
    });
    w.push({ s: FE.PAUSE.t0, e: FE.PAUSE.t1, m: 0.55, a: 0.7 });
    return w.sort((a, b) => a.s - b.s);
  }
  FE.duckWindows = windows;

  /* base = context time corresponding to video time fromT. layers: {music, amb, sfx} booleans. */
  function schedule(ctx, out, base, fromT, layers) {
    layers = layers || { music: 1, amb: 1, sfx: 1 };
    const srcs = [], nodes = [];
    const at = (t) => base + (t - fromT);
    const on = (t) => t >= fromT - 1e-6;
    const g = (v) => { const n = ctx.createGain(); n.gain.value = v == null ? 1 : v; nodes.push(n); return n; };
    const track = (s) => { srcs.push(s); return s; };

    // ---- buses with ducking ----
    const musicIn = g(1), musicDuck = g(1), ambIn = g(1), ambDuck = g(1), sfxIn = g(1);
    musicIn.connect(musicDuck); musicDuck.connect(out.music); ambIn.connect(ambDuck); ambDuck.connect(out.amb); sfxIn.connect(out.sfx);
    const W = windows();
    [[musicDuck, 'm'], [ambDuck, 'a']].forEach(([node, k]) => {
      node.gain.setValueAtTime(1, Math.max(0, at(fromT)));
      W.forEach((w) => {
        if (w.e < fromT) return;
        const s = Math.max(w.s, fromT);
        node.gain.setTargetAtTime(w[k], at(s), 0.07);
        node.gain.setTargetAtTime(1, at(w.e), 0.28);
      });
    });
    // gentle end fade (clean ending)
    [musicIn, ambIn].forEach((n) => { n.gain.setValueAtTime(1, at(Math.max(fromT, 29.55))); n.gain.linearRampToValueAtTime(0.0001, at(30)); });

    // ---- reverb send ----
    const rev = ctx.createConvolver(); rev.buffer = impulse(ctx, 1.8, 2.6); const revG = g(0.32); rev.connect(revG); revG.connect(musicIn); nodes.push(rev);
    const sfxRev = ctx.createConvolver(); sfxRev.buffer = impulse(ctx, 1.4, 2.8); const sfxRevG = g(0.28); sfxRev.connect(sfxRevG); sfxRevG.connect(sfxIn); nodes.push(sfxRev);

    const keysBus = g(1); keysBus.connect(musicIn); keysBus.connect(rev);
    const env = (gn, t, a, peak, dec, rel) => { gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); };
    const osc = (type, f, t0, t1, dest) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.connect(dest); o.start(t0); o.stop(t1); track(o); return o; };

    /* ---- instruments ---- */
    function rhodes(m, t, dur, vel, dest) {
      const f = mtof(m), t0 = at(t), amp = g(0), mod = g(f * 1.6), car = ctx.createOscillator(), md = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = f; md.type = 'sine'; md.frequency.value = f;
      mod.gain.setValueAtTime(f * 2.4, t0); mod.gain.exponentialRampToValueAtTime(f * 0.25, t0 + 0.4);
      md.connect(mod); mod.connect(car.frequency); car.connect(amp);
      const tine = ctx.createOscillator(), tg = g(0); tine.frequency.value = f * 7; tine.connect(tg); tg.connect(amp);
      tg.gain.setValueAtTime(vel * 0.05, t0); tg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
      env(amp, t0, 0.006, vel * 0.16, dur, 0);
      amp.connect(dest); [car, md, tine].forEach((o) => { o.start(t0); o.stop(t0 + dur + 0.1); track(o); });
    }
    function bass(m, t, dur, vel) {
      const f = mtof(m), t0 = at(t), amp = g(0), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; nodes.push(lp);
      const o = osc('triangle', f, t0, t0 + dur + 0.1, amp), o2 = osc('sine', f * 2, t0, t0 + dur + 0.1, amp);
      void o; void o2; env(amp, t0, 0.008, vel * 0.5, dur, 0); amp.connect(lp); lp.connect(musicIn);
    }
    function kick(t, vel) {
      const t0 = at(t), o = ctx.createOscillator(), a = g(0); o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(48, t0 + 0.12);
      env(a, t0, 0.003, vel * 0.5, 0.2, 0); o.connect(a); a.connect(musicIn); o.start(t0); o.stop(t0 + 0.3); track(o);
    }
    const nb = noiseBuf(ctx, 2, 3);
    function noiseHit(t, dest, type, freq, q, vel, dec, att) {
      const t0 = at(t), s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const a = g(0); env(a, t0, att || 0.004, vel, dec, 0); s.connect(f); f.connect(a); a.connect(dest); s.start(t0, Math.random() * 0 + (t * 0.37) % 1); s.stop(t0 + dec + (att || 0.004) + 0.05); track(s); nodes.push(f);
    }
    function vibe(m, t, dur, vel) {
      const f = mtof(m), t0 = at(t), amp = g(0), o = ctx.createOscillator(), o2 = ctx.createOscillator(), o3 = ctx.createOscillator(), g2 = g(0.25), g3 = g(0.06);
      o.frequency.value = f; o2.frequency.value = f * 4; o3.frequency.value = f * 10; o.connect(amp); o2.connect(g2); g2.connect(amp); o3.connect(g3); g3.connect(amp);
      g2.gain.setValueAtTime(0.25, t0); g2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
      env(amp, t0, 0.004, vel * 0.13, dur, 0);
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null; if (pan) { pan.pan.value = 0.25; amp.connect(pan); pan.connect(musicIn); pan.connect(rev); nodes.push(pan); } else { amp.connect(musicIn); amp.connect(rev); }
      [o, o2, o3].forEach((x) => { x.start(t0); x.stop(t0 + dur + 0.1); track(x); });
    }

    /* ---- MUSIC ---- */
    if (layers.music) {
      const r = FE.U.rng(2024);
      const swing = (beat) => { const f = beat % 1; return Math.floor(beat) + (f >= 0.5 ? 0.5 + (f - 0.5) + (SWING - 0.5) : f * 1); };
      const nBars = 12;
      for (let b = 0; b < nBars; b++) {
        const ch = CHORDS[b % 4], t0 = b * BAR;
        const bt = (beat) => t0 + swing(beat) * BEAT;
        // comping: sparse in the intro, fuller later
        const hits = b < 2 ? [0] : [0, 1.5, 3];
        hits.forEach((h, i) => { const tt = bt(h); if (!on(tt) || tt > 29.5) return; ch.v.forEach((m, k) => rhodes(m, tt + k * 0.012, i === 0 ? 1.9 : 0.55, i === 0 ? 0.9 : 0.62, keysBus)); });
        if (b >= 2) {
          [[0, ch.root, 0.9], [1.5, ch.root + 12, 0.35], [2, ch.fifth, 0.5], [3.5, ch.root + 7, 0.4]].forEach(([h, m, d]) => { const tt = bt(h); if (on(tt) && tt < 29.4) bass(m, tt, d * BEAT * 1.1, 0.8); });
          [0, 2.5].forEach((h) => { const tt = bt(h); if (on(tt) && tt < 29.4) kick(tt, h ? 0.5 : 0.8); });
          [1, 3].forEach((h) => { const tt = bt(h); if (on(tt) && tt < 29.4) noiseHit(tt, musicIn, 'bandpass', 2600, 0.8, 0.09, 0.16, 0.01); });
          for (let e = 0; e < 8; e++) { const tt = bt(e * 0.5); if (on(tt) && tt < 29.4) noiseHit(tt, musicIn, 'highpass', 7500, 0.7, e % 2 ? 0.035 : 0.02, 0.05); }
          const tt = bt(2.5); if (on(tt) && tt < 29.4) noiseHit(tt, musicIn, 'bandpass', 1900, 3, 0.05, 0.05); // soft rim
        }
        // vibraphone melody from bar 4 (after the phrase scene begins)
        if (b >= 4 && b < 11) {
          for (let e = 0; e < 8; e++) {
            if (r() < (b % 2 ? 0.42 : 0.55)) { const m = ch.tones[Math.floor(r() * ch.tones.length)]; const tt = bt(e * 0.5); if (on(tt) && tt < 29) vibe(m, tt, 0.9, 0.7 + r() * 0.3); }
          }
        }
      }
      // final Cmaj9 resolve (bar 12 starts at 28.8 s)
      const tf = nBars * BAR;
      if (on(tf)) { FINAL.v.forEach((m, k) => rhodes(m, tf + k * 0.03, 1.3, 1.0, keysBus)); bass(FINAL.root, tf, 1.1, 0.9); kick(tf, 0.7); }
    }

    /* ---- AMBIENCE ---- */
    if (layers.amb) {
      const mk = (type, f, q, vol, seed) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf(ctx, 6, seed); s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const a = g(vol); s.connect(fl); fl.connect(a); a.connect(ambIn); s.start(base); track(s); nodes.push(fl); return a; };
      mk('lowpass', 700, 0.5, 0.09, 5);
      [[480, 0.05, 0.11, 8], [850, 0.04, 0.17, 9], [1400, 0.025, 0.23, 10]].forEach(([f, v, rate, sd]) => {
        const a = mk('bandpass', f, 1.2, v, sd); const l = ctx.createOscillator(), lg = g(v * 0.7); l.frequency.value = rate; l.connect(lg); lg.connect(a.gain); l.start(base); track(l);
      });
      // occasional cups / spoon, kept out of voice windows
      const r = FE.U.rng(55);
      const W2 = windows();
      for (let t = 1.6; t < 29; t += 1.4 + r() * 2.6) {
        if (!on(t) || W2.some((w) => t > w.s - 0.1 && t < w.e + 0.1)) continue;
        const f = 2600 + r() * 2200, t0 = at(t), a = g(0); env(a, t0, 0.002, 0.016, 0.13 + r() * 0.1, 0);
        [1, 2.7].forEach((mult, i) => { const o = ctx.createOscillator(); o.frequency.value = f * mult; const gg = g(i ? 0.3 : 1); o.connect(gg); gg.connect(a); o.start(t0); o.stop(t0 + 0.4); track(o); });
        a.connect(ambIn);
      }
      // brief steam-wand hiss (away from speech)
      [[15.35, 1.0]].forEach(([t, d]) => { if (on(t)) { const t0 = at(t), s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3800; const a = g(0); a.gain.setValueAtTime(0.0001, t0); a.gain.linearRampToValueAtTime(0.03, t0 + 0.25); a.gain.linearRampToValueAtTime(0.0001, t0 + d); s.connect(f); f.connect(a); a.connect(ambIn); s.start(t0); s.stop(t0 + d + 0.1); track(s); nodes.push(f); } });
    }

    /* ---- SFX ---- */
    if (layers.sfx) {
      const bell = (f, t, vol, dec, dest) => {
        const t0 = at(t); [[1, 1, dec], [2.76, 0.35, dec * 0.5], [5.4, 0.15, dec * 0.25]].forEach(([m, v, d]) => {
          const o = ctx.createOscillator(), a = g(0); o.frequency.value = f * m; env(a, t0, 0.003, vol * v, d, 0); o.connect(a); a.connect(dest || sfxIn); a.connect(sfxRev); o.start(t0); o.stop(t0 + d + 0.1); track(o);
        });
      };
      const S = {
        doorChime: (t) => { bell(1318.5, t, 0.13, 0.9); bell(1046.5, t + 0.38, 0.13, 1.0); },
        whoosh: (t) => { const t0 = at(t), s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(350, t0); f.frequency.exponentialRampToValueAtTime(2400, t0 + 0.45); const a = g(0); env(a, t0, 0.18, 0.07, 0.3, 0); s.connect(f); f.connect(a); a.connect(sfxIn); s.start(t0); s.stop(t0 + 0.7); track(s); nodes.push(f); },
        accent: (t) => { bell(784, t, 0.07, 0.5); bell(1046.5, t + 0.1, 0.07, 0.7); },
        textChange: (t) => { const t0 = at(t), o = ctx.createOscillator(), a = g(0); o.type = 'sine'; o.frequency.setValueAtTime(660, t0); o.frequency.exponentialRampToValueAtTime(1100, t0 + 0.11); env(a, t0, 0.01, 0.1, 0.16, 0); o.connect(a); a.connect(sfxIn); a.connect(sfxRev); o.start(t0); o.stop(t0 + 0.3); track(o); bell(1976, t + 0.07, 0.04, 0.3); },
        iceClink: (t) => { [0, 0.075, 0.17].forEach((d, i) => { const tt = t + d; noiseHit(tt, sfxIn, 'bandpass', 5200 + i * 700, 2.2, 0.07, 0.03, 0.001); bell(3100 + i * 380, tt, 0.045, 0.28, sfxIn); }); },
        yourTurn: (t) => { const t0 = at(t), o = ctx.createOscillator(), a = g(0); o.frequency.setValueAtTime(392, t0); o.frequency.exponentialRampToValueAtTime(523, t0 + 0.18); env(a, t0, 0.02, 0.09, 0.3, 0); o.connect(a); a.connect(sfxIn); a.connect(sfxRev); o.start(t0); o.stop(t0 + 0.5); track(o); },
        doneChime: (t) => { bell(1046.5, t, 0.07, 0.6); bell(1318.5, t + 0.12, 0.06, 0.8); },
        cupPlace: (t) => { const t0 = at(t), o = ctx.createOscillator(), a = g(0); o.frequency.setValueAtTime(520, t0); o.frequency.exponentialRampToValueAtTime(300, t0 + 0.07); env(a, t0, 0.002, 0.14, 0.1, 0); o.connect(a); a.connect(sfxIn); o.start(t0); o.stop(t0 + 0.2); track(o);
          const o2 = ctx.createOscillator(), a2 = g(0); o2.frequency.setValueAtTime(130, t0); o2.frequency.exponentialRampToValueAtTime(70, t0 + 0.1); env(a2, t0, 0.002, 0.2, 0.14, 0); o2.connect(a2); a2.connect(sfxIn); o2.start(t0); o2.stop(t0 + 0.3); track(o2);
          noiseHit(t, sfxIn, 'bandpass', 2400, 1.5, 0.08, 0.04, 0.001); bell(4200, t + 0.03, 0.03, 0.16, sfxIn); },
        logoReveal: (t) => { [1046.5, 1318.5, 1568, 2093].forEach((f, i) => bell(f, t + i * 0.07, 0.022, 0.9)); },
        closing: (t) => {
          [523.25, 659.25, 784, 987.77, 1174.7, 1046.5].forEach((f, i) => bell(f, t + i * 0.08, 0.075, 1.25));
          const t0 = at(t), a = g(0); a.gain.setValueAtTime(0.0001, t0); a.gain.linearRampToValueAtTime(0.06, t0 + 0.35); a.gain.linearRampToValueAtTime(0.0001, at(30));
          [130.8, 196, 329.6].forEach((f) => osc('sine', f, t0, at(30) + 0.05, a)); a.connect(sfxIn);
        }
      };
      FE.SFX.forEach((e) => { if (on(e.t) && S[e.id]) S[e.id](e.t); });
    }

    return {
      dispose() {
        srcs.forEach((s) => { try { s.stop(); } catch (_) { /* already stopped */ } });
        [musicIn, musicDuck, ambIn, ambDuck, sfxIn, revG, sfxRevG].forEach((n) => { try { n.disconnect(); } catch (_) { /* */ } });
      }
    };
  }

  /* Live engine: master + four separately controllable layers (voice level is applied to speech volume). */
  function Live() {
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain(); this.master.gain.value = 0.9;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
    this.master.connect(comp); comp.connect(c.destination);
    this.bus = { music: c.createGain(), amb: c.createGain(), sfx: c.createGain() };
    this.levels = { music: 0.55, amb: 0.7, sfx: 0.8, voice: 1 };
    Object.keys(this.bus).forEach((k) => { this.bus[k].gain.value = this.levels[k]; this.bus[k].connect(this.master); });
    this.session = null;
  }
  Live.prototype.setLevel = function (k, v) { this.levels[k] = v; if (this.bus[k]) this.bus[k].gain.setTargetAtTime(v, this.ctx.currentTime, 0.03); };
  Live.prototype.start = function (fromT) {
    this.stop();
    this.session = schedule(this.ctx, this.bus, this.ctx.currentTime + 0.08, fromT);
  };
  Live.prototype.stop = function () { if (this.session) { this.session.dispose(); this.session = null; } };

  /* Offline stem render (used by tools/render-audio.js). Returns {name: Int16Array[ch0,ch1]} */
  async function renderStems(sr) {
    sr = sr || 48000;
    const out = {};
    for (const layer of ['music', 'amb', 'sfx']) {
      const ctx = new OfflineAudioContext(2, 30 * sr, sr);
      const bus = { music: ctx.createGain(), amb: ctx.createGain(), sfx: ctx.createGain() };
      Object.values(bus).forEach((n) => n.connect(ctx.destination));
      schedule(ctx, bus, 0, 0, { music: layer === 'music', amb: layer === 'amb', sfx: layer === 'sfx' });
      const buf = await ctx.startRendering();
      const L = buf.getChannelData(0), R = buf.getChannelData(1), pcm = new Int16Array(L.length * 2);
      for (let i = 0; i < L.length; i++) { pcm[2 * i] = Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))); pcm[2 * i + 1] = Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))); }
      let bin = ''; const u8 = new Uint8Array(pcm.buffer); for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
      out[layer] = btoa(bin);
    }
    return out;
  }
  FE.AudioEngine = { schedule, Live, renderStems };
})();
