/* ============================================================
   AUDIO — Web Audio music + effects, Web Speech voices
   No audio files, no API keys, no microphone.
   ============================================================ */
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

const Aud = {
  ctx: null, master: null, comp: null, musicBus: null, duckG: null, levelG: null, sfxBus: null, rev: null, revSend: null,
  musicOn: false, mode: 'off', nextBar: 0, bar: 0, timer: null, speechDuck: false, quiet: false, paused: true, ok: true,
  vol: { music: 0.6, sfx: 0.8 },

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.ok = false; return; }
    const c = this.ctx = new AC();
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -16; this.comp.knee.value = 24; this.comp.ratio.value = 6; this.comp.attack.value = 0.006; this.comp.release.value = 0.28;
    this.master = c.createGain(); this.master.gain.value = 0.8;
    this.master.connect(this.comp); this.comp.connect(c.destination);
    // reverb (generated impulse response — soft room)
    const len = c.sampleRate * 2.4, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    this.rev = c.createConvolver(); this.rev.buffer = ir;
    const revOut = c.createGain(); revOut.gain.value = 0.55; this.rev.connect(revOut); revOut.connect(this.master);
    this.revSend = c.createGain(); this.revSend.gain.value = 1; this.revSend.connect(this.rev);
    // music chain: bus -> level -> duck -> master
    this.musicBus = c.createGain(); this.musicBus.gain.value = this.vol.music;
    this.levelG = c.createGain(); this.levelG.gain.value = 0;
    this.duckG = c.createGain(); this.duckG.gain.value = 1;
    this.musicBus.connect(this.levelG); this.levelG.connect(this.duckG); this.duckG.connect(this.master);
    const mrev = c.createGain(); mrev.gain.value = 0.35; this.levelG.connect(mrev); mrev.connect(this.revSend);
    this.sfxBus = c.createGain(); this.sfxBus.gain.value = this.vol.sfx; this.sfxBus.connect(this.master);
    const srev = c.createGain(); srev.gain.value = 0.4; this.sfxBus.connect(srev); srev.connect(this.revSend);
  },
  setVol(kind, v) {
    this.vol[kind] = v;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (kind === 'music') this.musicBus.gain.setTargetAtTime(v, t, 0.05);
    if (kind === 'sfx') this.sfxBus.gain.setTargetAtTime(v, t, 0.05);
  },
  /* level of the music bed: theme 1, bed .42, quiet 0 (learner response / assessment) */
  applyLevel() {
    if (!this.ctx) return;
    const target = (!this.musicOn || this.paused || this.quiet) ? 0 : (this.mode === 'theme' || this.mode === 'finale' ? 1 : this.mode === 'bed' ? 0.4 : 0);
    this.levelG.gain.setTargetAtTime(target, this.ctx.currentTime, this.quiet ? 0.25 : 0.6);
  },
  setMode(mode) { // 'off' | 'bed' | 'theme' | 'finale'
    this.mode = mode;
    if (!this.ctx) return;
    if (mode === 'off') { this.applyLevel(); return; }
    if (mode === 'theme') { this.bar = 0; }
    if (!this.timer) this.startSched();
    this.musicOn = mode !== 'off';
    this.applyLevel();
  },
  setQuiet(q) { this.quiet = q; this.applyLevel(); },
  setPaused(p) { this.paused = p; this.applyLevel(); if (this.ctx) { if (p) this.speechDuck = false; } },
  duck(on) {
    if (!this.ctx) return;
    this.speechDuck = on;
    this.duckG.gain.setTargetAtTime(on ? 0.22 : 1, this.ctx.currentTime, on ? 0.07 : 0.5);
  },
  startSched() {
    if (this.timer) return;
    this.nextBar = this.ctx.currentTime + 0.15;
    this.musicOn = true;
    this.timer = setInterval(() => this.sched(), 120);
  },
  stopSched() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },
  sched() {
    if (!this.ctx || this.mode === 'off' || this.mode === 'finale') return;
    const beat = 60 / 76;
    while (this.nextBar < this.ctx.currentTime + 0.7) {
      this.playBar(this.bar, this.nextBar, beat);
      this.nextBar += beat * 4; this.bar++;
    }
  },
  note(type, freq, t, dur, vol, o = {}) {
    const c = this.ctx, g = c.createGain(), osc = c.createOscillator(), f = c.createBiquadFilter();
    osc.type = type; osc.frequency.value = freq; if (o.detune) osc.detune.value = o.detune;
    f.type = 'lowpass'; f.frequency.value = o.cut || 2400; f.Q.value = 0.4;
    const a = o.att || 0.008, r = o.rel || dur;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    if (o.sus) { g.gain.setValueAtTime(vol, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + r); }
    else g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur);
    osc.connect(f); f.connect(g); g.connect(o.dest || this.musicBus);
    osc.start(t); osc.stop(t + a + dur + (o.sus ? r : 0) + 0.05);
  },
  bell(freq, t, dur, vol, dest) { // soft marimba/bell: sine + partials
    this.note('sine', freq, t, dur, vol, { dest, att: 0.004 });
    this.note('sine', freq * 2.01, t, dur * 0.5, vol * 0.28, { dest, att: 0.003 });
    this.note('sine', freq * 3.98, t, dur * 0.22, vol * 0.1, { dest, att: 0.002 });
  },
  playBar(bar, t, beat) {
    const prog = [
      { pad: [60, 64, 67, 71], bass: 48 },  // Cmaj7
      { pad: [57, 60, 64, 67], bass: 45 },  // Am7
      { pad: [53, 57, 60, 64], bass: 41 },  // Fmaj7
      { pad: [55, 59, 62, 64], bass: 43 }   // G6/9
    ];
    const ch = prog[bar % 4], dur = beat * 4;
    // warm pad
    ch.pad.forEach((m, i) => {
      this.note('triangle', mtof(m), t, dur * 0.95, 0.032, { att: 0.9, rel: 1.4, sus: true, cut: 1100, detune: -5, dest: this.musicBus });
      this.note('sine', mtof(m), t, dur * 0.95, 0.026, { att: 1.1, rel: 1.4, sus: true, cut: 900, detune: 4, dest: this.musicBus });
    });
    // bass
    this.note('sine', mtof(ch.bass), t, beat * 3.6, 0.1, { att: 0.05, cut: 500 });
    const theme = this.mode === 'theme' && bar < 8;
    if (theme) {
      const A1 = [[0, 76, 1.5], [1.5, 79, .5], [2, 81, 2], [4, 79, 1], [5, 76, 1], [6, 74, 2], [8, 72, 1.5], [9.5, 74, .5], [10, 76, 1], [11, 79, 1], [12, 74, 2], [14, 76, 2]];
      const B1 = [[0, 79, 1.5], [1.5, 81, .5], [2, 84, 2], [4, 81, 1], [5, 79, 1], [6, 76, 2], [8, 77, 1.5], [9.5, 76, .5], [10, 74, 1], [11, 72, 1], [12, 74, 1], [13, 76, 1], [14, 72, 2]];
      const ph = bar < 4 ? A1 : B1, base = (bar % 4) * 4;
      ph.filter(n => n[0] >= base && n[0] < base + 4).forEach(([b, m, d]) => this.bell(mtof(m), t + (b - base) * beat, d * beat * 1.2, 0.07));
    }
    // gentle pentatonic pluck pattern (sparser in the bed)
    const pent = [72, 74, 76, 79, 81, 84];
    const dens = theme ? 0.5 : 0.34;
    for (let i = 0; i < 8; i++) {
      if (Math.abs(Math.sin(bar * 12.9898 + i * 78.233) * 43758.5453) % 1 > dens) continue;
      const m = pent[Math.floor(Math.abs(Math.sin(bar * 3.1 + i * 1.7)) * pent.length) % pent.length];
      this.bell(mtof(m - (theme ? 12 : 0)), t + i * beat * 0.5, beat * 1.4, theme ? 0.03 : 0.045);
    }
  },
  finale() { // warm final chord
    if (!this.ctx) return;
    this.stopSched(); this.mode = 'finale'; this.musicOn = true; this.quiet = false; this.applyLevel();
    const t = this.ctx.currentTime + 0.1;
    [36, 48, 55, 64, 71, 74, 79].forEach((m, i) => {
      this.note('triangle', mtof(m), t + i * 0.12, 3.6, 0.07, { att: 1.2, rel: 3.2, sus: true, cut: 1600, detune: -4 });
      this.note('sine', mtof(m), t + i * 0.12, 3.6, 0.06, { att: 1.4, rel: 3.2, sus: true, cut: 1200, detune: 5 });
    });
    this.bell(mtof(88), t + 1.1, 3, 0.06); this.bell(mtof(83), t + 1.5, 3, 0.05);
    setTimeout(() => { if (this.mode === 'finale') { this.mode = 'off'; this.applyLevel(); } }, 9000);
  },

  /* ---------- effects ---------- */
  sfx(name) {
    if (!this.ctx || this.vol.sfx <= 0) return;
    const c = this.ctx, t = c.currentTime + 0.01, d = this.sfxBus;
    const noise = (dur, f0, f1, vol) => {
      const n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), x = b.getChannelData(0);
      for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / x.length);
      n.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = c.createGain(); g.gain.value = vol; n.connect(bp); bp.connect(g); g.connect(d); n.start(t);
    };
    switch (name) {
      case 'move': noise(0.42, 500, 1700, 0.09); this.note('sine', 330, t, 0.3, 0.025, { dest: d, att: 0.05, cut: 1200 }); break;
      case 'whoosh': noise(0.7, 300, 1200, 0.08); break;
      case 'place': this.note('triangle', 520, t, 0.16, 0.07, { dest: d, cut: 2000 }); this.note('sine', 780, t, 0.1, 0.03, { dest: d }); break;
      case 'tick': this.note('triangle', 700, t, 0.05, 0.04, { dest: d }); break;
      case 'reveal': this.bell(mtof(88), t, 0.9, 0.07, d); this.bell(mtof(95), t + 0.11, 1.1, 0.06, d); break;
      case 'good': this.bell(mtof(84), t, 0.7, 0.075, d); this.bell(mtof(88), t + 0.1, 0.9, 0.075, d); break;
      case 'soft': this.note('sine', 233, t, 0.22, 0.06, { dest: d, att: 0.03, cut: 700 }); this.note('sine', 220, t + 0.12, 0.25, 0.05, { dest: d, att: 0.03, cut: 700 }); break;
      case 'question': [79, 83, 86, 91].forEach((m, i) => this.bell(mtof(m), t + i * 0.07, 0.8, 0.04, d)); break;
      case 'chime': [79, 84, 88].forEach((m, i) => this.bell(mtof(m), t + i * 0.2, 1.3, 0.06, d)); break;
      case 'card': noise(0.18, 1800, 900, 0.05); this.note('triangle', 600, t + 0.05, 0.08, 0.03, { dest: d }); break;
    }
  }
};

/* ============================================================
   SPEECH — browser speech synthesis (voices depend on device)
   ============================================================ */
const Sp = {
  voices: [], ready: false, none: false, cur: null, loaded: false,
  init() {
    if (!('speechSynthesis' in window)) { this.none = true; this.ready = true; return; }
    const load = () => {
      const v = speechSynthesis.getVoices();
      if (v && v.length) { this.voices = v; this.ready = true; this.loaded = true; UI.refreshVoices && UI.refreshVoices(); }
    };
    load();
    speechSynthesis.onvoiceschanged = load;           // voices often arrive asynchronously
    let tries = 0;
    const poll = setInterval(() => { load(); if (this.loaded || ++tries > 20) { clearInterval(poll); if (!this.loaded) { this.none = true; this.ready = true; UI.refreshVoices && UI.refreshVoices(); } } }, 250);
  },
  list(lang) {
    const pre = lang === 'es' ? 'es' : 'en';
    return this.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(pre))
      .sort((a, b) => this.score(b, lang) - this.score(a, lang));
  },
  score(v, lang) {
    let s = 0; const n = v.name || '', l = (v.lang || '').replace('_', '-');
    if (lang === 'es') { if (/es-(MX|US|419)/i.test(l)) s += 3; else if (/es-ES/i.test(l)) s += 2; }
    else { if (/en-US/i.test(l)) s += 6; else if (/en-(GB|AU|CA|IN)/i.test(l)) s += 1; }
    if (/natural|neural|online|enhanced|premium/i.test(n)) s += 3;
    if (/google|samantha|aria|jenny|ava|allison|zira|david|mark|guy|nicky|alex|paulina|monica|sabina|dalia/i.test(n)) s += 2;
    if (v.localService) s += 0.5;
    return s;
  },
  pick(lang) {
    const uri = lang === 'es' ? CFG.voiceEs : CFG.voiceEn;
    const l = this.list(lang);
    return l.find(v => v.voiceURI === uri) || l[0] || null;
  },
  hasUS() { return this.list('en').some(v => /en[-_]US/i.test(v.lang)); },
  cancel() { try { speechSynthesis.cancel(); } catch (e) { } this.cur = null; },
  est(text, rate) { return Math.max(700, text.length * 68 / Math.max(0.4, rate) + 450); },
  /* speak one phrase once; resolves 'done' or 'stop' */
  once(text, o, e) {
    return new Promise(res => {
      const lang = o.lang || 'en';
      const rate = (CFG.rate || 0.85) * (o.rate || 1);
      if (this.none || !this.voices.length) { // captions-only fallback keeps the lesson flowing
        const ms = this.est(text, rate); let left = ms, last = performance.now();
        const iv = setInterval(() => {
          const now = performance.now(), dt = now - last; last = now;
          if (e !== Run.epoch) { clearInterval(iv); res('stop'); return; }
          if (ST.paused) { clearInterval(iv); res('stop'); return; }
          left -= dt; if (left <= 0) { clearInterval(iv); res('done'); }
        }, 50);
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      const v = this.pick(lang); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang === 'es' ? 'es-MX' : 'en-US';
      u.rate = Math.min(2, Math.max(0.4, rate)); u.pitch = o.pitch || 1; u.volume = CFG.vSpeech;
      let fin = false;
      const done = (r) => { if (fin) return; fin = true; clearTimeout(wd); clearInterval(poll); this.cur = null; res(r); };
      u.onend = () => done(e !== Run.epoch || ST.paused ? 'stop' : 'done');
      u.onerror = () => done(e !== Run.epoch || ST.paused ? 'stop' : 'done');
      const wd = setTimeout(() => done(e !== Run.epoch || ST.paused ? 'stop' : 'done'), this.est(text, rate) * 2 + 4000);
      const poll = setInterval(() => { if (e !== Run.epoch || ST.paused) { try { speechSynthesis.cancel(); } catch (x) { } done('stop'); } }, 60);
      this.cur = u;
      setTimeout(() => { if (!fin) { try { speechSynthesis.speak(u); } catch (x) { done('done'); } } }, 40);
    });
  }
};
