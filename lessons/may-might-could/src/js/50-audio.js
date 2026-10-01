/* 50-audio: one speech channel (no overlaps), code-generated SFX / ambience / music, ducking */
(function () {
  'use strict';
  const FE = window.FE;
  const A = (FE.Audio = {
    ctx: null, vol: { narr: 1, music: 0.35, fx: 0.7 }, mute: { narr: false, music: false, fx: false },
    speech: null, cur: null, silence: false, speaking: false,
    NARR: window.NARR || {},
    /* must be called from a user gesture */
    init() {
      if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext; A.ctx = new AC();
        const c = A.ctx;
        A.gMusic = c.createGain(); A.gFx = c.createGain(); A.gAmb = c.createGain();
        [A.gMusic, A.gFx, A.gAmb].forEach((g) => g.connect(c.destination));
        A.applyVol();
        A.noiseBuf = (() => { const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } return b; })();
      } catch (e) { console.warn('WebAudio unavailable', e); }
    },
    applyVol() {
      if (!A.ctx) return;
      const t = A.ctx.currentTime;
      const duck = A.speaking ? 0.35 : 1, sil = A.silence ? 0 : 1;
      A.gMusic.gain.setTargetAtTime(A.mute.music ? 0 : A.vol.music * 0.28 * duck * sil, t, 0.25);
      A.gAmb.gain.setTargetAtTime(A.mute.music ? 0 : A.vol.music * 0.3 * duck * sil, t, 0.3);
      A.gFx.gain.setTargetAtTime(A.mute.fx ? 0 : A.vol.fx, t, 0.05);
      if (A.speech) A.speech.volume = A.mute.narr ? 0 : FE.clamp(A.vol.narr, 0, 1);
    },
    setSilence(on) { A.silence = on; A.applyVol(); },

    /* ---------- speech ---------- */
    info(key) { return A.NARR[key] || null; },
    dur(key, text) {
      const n = A.NARR[key]; if (n) return n.dur;
      const words = (text || '').trim().split(/\s+/).length; return 0.42 * words + 0.5; // estimate only when no clip exists
    },
    play(key, offset = 0, onend) {
      A.stop();
      const n = A.NARR[key]; if (!n || !n.file) return false;
      const a = A.speech || (A.speech = new Audio()); a.preload = 'auto';
      a.onended = () => { A.speaking = false; A.applyVol(); if (onend) onend(); };
      a.onerror = () => { A.speaking = false; A.applyVol(); console.warn('audio missing', n.file); };
      a.src = n.file; a.volume = A.mute.narr ? 0 : FE.clamp(A.vol.narr, 0, 1);
      try { a.currentTime = Math.max(0, offset); } catch (e) { /* set after metadata */ a.onloadedmetadata = () => { a.currentTime = offset; }; }
      const p = a.play(); if (p && p.catch) p.catch(() => { /* autoplay blocked until gesture */ });
      A.cur = key; A.speaking = true; A.applyVol();
      return true;
    },
    stop() {
      if (A.speech) { A.speech.onended = null; A.speech.onerror = null; A.speech.pause(); }
      A.cur = null; A.speaking = false; A.applyVol();
    },

    /* ---------- code-generated effects ---------- */
    tone(freq, dur, type = 'sine', vol = 0.3, slide = 0, delay = 0) {
      if (!A.ctx || A.mute.fx || A.quiet) return; const c = A.ctx, t = c.currentTime + delay;
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(A.gFx); o.start(t); o.stop(t + dur + 0.05);
    },
    noise(dur, f0, f1, vol = 0.15, delay = 0) {
      if (!A.ctx || A.mute.fx || A.quiet) return; const c = A.ctx, t = c.currentTime + delay;
      const s = c.createBufferSource(); s.buffer = A.noiseBuf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
      f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(A.gFx); s.start(t); s.stop(t + dur + 0.05);
    },
    sfx(name) {
      const T = A.tone.bind(A);
      switch (name) {
        case 'pop': T(520, 0.12, 'sine', 0.25, 380); break;
        case 'snap': T(300, 0.07, 'triangle', 0.3, -120); T(900, 0.05, 'sine', 0.12, 0); break;
        case 'whoosh': A.noise(0.5, 400, 2400, 0.12); break;
        case 'ok': T(660, 0.14, 'sine', 0.25); T(990, 0.22, 'sine', 0.22, 0, 0.09); break;
        case 'no': T(220, 0.2, 'triangle', 0.22, -60); break;
        case 'reject': T(340, 0.1, 'square', 0.1, -140); T(260, 0.14, 'square', 0.08, -90, 0.08); break;
        case 'tick': T(1200, 0.03, 'square', 0.05); break;
        case 'bell': T(880, 0.9, 'sine', 0.18); T(1320, 0.7, 'sine', 0.1, 0, 0.02); break;
        case 'phone': T(1040, 0.09, 'sine', 0.2); T(1040, 0.09, 'sine', 0.2, 0, 0.14); break;
        case 'rumble': A.noise(1.8, 90, 140, 0.25); break;
        case 'reveal': T(440, 0.18, 'sine', 0.2); T(660, 0.26, 'sine', 0.2, 0, 0.1); T(880, 0.4, 'sine', 0.16, 0, 0.2); break;
        default: break;
      }
    },
    /* soft generative pad; ducked under speech, silent during learner-speaking activities */
    musicOn(on) {
      if (!A.ctx) return;
      if (!on) { if (A.musicNodes) { A.musicNodes.forEach((n) => { try { n.stop(); } catch (e) { /* */ } }); A.musicNodes = null; } clearInterval(A.musicTimer); A.musicTimer = null; return; }
      if (A.musicNodes) return;
      const c = A.ctx, lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(A.gMusic);
      A.musicNodes = [];
      const chords = [[220, 277.2, 329.6], [196, 246.9, 293.7], [174.6, 220, 261.6], [196, 246.9, 329.6]];
      let i = 0;
      const play = () => {
        const t = c.currentTime;
        chords[i % chords.length].forEach((f, k) => {
          const o = c.createOscillator(), g = c.createGain(); o.type = k === 0 ? 'triangle' : 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16, t + 2.2); g.gain.linearRampToValueAtTime(0.0001, t + 7.6);
          o.connect(g); g.connect(lp); o.start(t); o.stop(t + 8); });
        i++;
      };
      play(); A.musicTimer = setInterval(play, 6000);
    },
    ambience(kind) {
      if (!A.ctx) return;
      if (A.ambNode) { try { A.ambNode.stop(); } catch (e) { /* */ } A.ambNode = null; }
      if (!kind) return;
      const c = A.ctx, s = c.createBufferSource(); s.buffer = A.noiseBuf; s.loop = true;
      const f = c.createBiquadFilter(); f.type = kind === 'rain' ? 'highpass' : 'lowpass'; f.frequency.value = kind === 'rain' ? 2500 : kind === 'cafe' ? 700 : 500;
      const g = c.createGain(); g.gain.value = kind === 'rain' ? 0.5 : 0.4; s.connect(f); f.connect(g); g.connect(A.gAmb); s.start(); A.ambNode = s;
    },
  });
})();
