// Small Web Audio synthesis toolkit. Everything is generated from oscillators and seeded noise — no samples, no downloads.
// Each builder schedules nodes on a BaseAudioContext (live AudioContext or OfflineAudioContext) and connects them to `out`.

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function rng(seed) {
  let a = seed | 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function makeNoise(ctx, kind, seconds, seed) {
  const n = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0), r = rng(seed);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
  for (let i = 0; i < n; i++) {
    const w = r() * 2 - 1;
    if (kind === 'white') d[i] = w;
    else if (kind === 'pink') { b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; }
    else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }   // brown
  }
  return buf;
}
export function makeImpulse(ctx, seconds, decay, seed) {
  const n = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, n, ctx.sampleRate), r = rng(seed);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / n, decay) * (i < 200 ? i / 200 : 1); }
  return buf;
}

export class Synth {
  constructor(ctx, out, seed = 1) {
    this.ctx = ctx; this.out = out; this.r = rng(seed);
    this.white = makeNoise(ctx, 'white', 2.5, seed + 11); this.pink = makeNoise(ctx, 'pink', 6, seed + 22); this.brown = makeNoise(ctx, 'brown', 6, seed + 33);
    this.verbIn = ctx.createGain(); this.verb = ctx.createConvolver(); this.verb.buffer = makeImpulse(ctx, 1.5, 3.2, seed + 44);
    this.verbOut = ctx.createGain(); this.verbOut.gain.value = 0.9; this.verbIn.connect(this.verb); this.verb.connect(this.verbOut); this.verbOut.connect(out);
  }
  // route helper: gain -> optional pan -> out (+ reverb send)
  _chain(node, { pan = 0, send = 0 } = {}) {
    const c = this.ctx; let n = node;
    if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); n.connect(p); n = p; }
    n.connect(this.out);
    if (send > 0) { const s = c.createGain(); s.gain.value = send; n.connect(s); s.connect(this.verbIn); }
    return n;
  }
  _env(t, a, peak, d, end = 0.0001) { const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); return g; }
  _osc(type, freq, t, dur) { const o = this.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); o.start(t); o.stop(t + dur + 0.05); return o; }
  _noise(buf, t, dur, offset) { const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(t, offset ?? this.r() * (buf.duration - 1)); s.stop(t + dur + 0.05); return s; }
  _filt(type, f, q = 0.7) { const b = this.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }

  // ----- tuned instruments -----
  marimba(t, freq, { dur = 0.5, gain = 0.2, pan = 0, send = 0.18 } = {}) {
    const g = this._env(t, 0.003, gain, dur);
    [[1, 1], [3.97, 0.28], [9.2, 0.07]].forEach(([m, a], i) => {
      const o = this._osc('sine', freq * m, t, dur), h = this.ctx.createGain(); h.gain.setValueAtTime(a, t); h.gain.exponentialRampToValueAtTime(0.0005, t + dur * (i ? 0.35 : 1));
      o.connect(h); h.connect(g);
    });
    this._chain(g, { pan, send });
  }
  pluck(t, freq, { dur = 0.45, gain = 0.15, pan = 0, send = 0.25, bright = 2200 } = {}) {   // harp/guitar-ish
    const g = this._env(t, 0.004, gain, dur), f = this._filt('lowpass', bright, 0.6);
    f.frequency.setValueAtTime(bright, t); f.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.5), t + dur);
    const o = this._osc('triangle', freq, t, dur), o2 = this._osc('sawtooth', freq * 1.003, t, dur), h = this.ctx.createGain(); h.gain.value = 0.25;
    o.connect(f); o2.connect(h); h.connect(f); f.connect(g); this._chain(g, { pan, send });
  }
  rhodes(t, freq, { dur = 0.7, gain = 0.12, pan = 0, send = 0.3 } = {}) {
    const g = this._env(t, 0.006, gain, dur);
    const o = this._osc('sine', freq, t, dur), o2 = this._osc('sine', freq * 2.005, t, dur), tine = this._osc('sine', freq * 7.02, t, 0.2);
    const a2 = this.ctx.createGain(); a2.gain.value = 0.32; const a3 = this.ctx.createGain(); a3.gain.setValueAtTime(0.16, t); a3.gain.exponentialRampToValueAtTime(0.0005, t + 0.18);
    const trem = this._osc('sine', 5.2, t, dur), tg = this.ctx.createGain(); tg.gain.value = 0.06; trem.connect(tg); tg.connect(g.gain);
    o.connect(g); o2.connect(a2); a2.connect(g); tine.connect(a3); a3.connect(g); this._chain(g, { pan, send });
  }
  bass(t, freq, { dur = 0.4, gain = 0.3 } = {}) {
    const g = this._env(t, 0.008, gain, dur), f = this._filt('lowpass', 520, 0.5);
    const o = this._osc('sine', freq, t, dur), o2 = this._osc('triangle', freq, t, dur), h = this.ctx.createGain(); h.gain.value = 0.35;
    o.connect(f); o2.connect(h); h.connect(f); f.connect(g); this._chain(g);
  }
  pad(t, t1, freqs, { gain = 0.05, attack = 0.5, release = 0.7, cutoff = 1500, pan = 0, send = 0.4 } = {}) {
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.setValueAtTime(gain, Math.max(t + attack, t1)); g.gain.exponentialRampToValueAtTime(0.0001, t1 + release);
    const f = this._filt('lowpass', cutoff, 0.4);
    freqs.forEach((fr, i) => [-6, 6].forEach((det) => { const o = this._osc('sawtooth', fr, t, t1 - t + release); o.detune.value = det + i; const a = this.ctx.createGain(); a.gain.value = 1 / (freqs.length * 2); o.connect(a); a.connect(f); }));
    f.connect(g); this._chain(g, { pan, send });
  }
  bell(t, freq, { dur = 1.1, gain = 0.1, pan = 0, send = 0.5 } = {}) {
    const g = this._env(t, 0.002, gain, dur);
    [[1, 1], [2.76, 0.4], [5.4, 0.2], [8.93, 0.1]].forEach(([m, a], i) => { const o = this._osc('sine', freq * m, t, dur), h = this.ctx.createGain(); h.gain.setValueAtTime(a, t); h.gain.exponentialRampToValueAtTime(0.0005, t + dur / (1 + i * 0.7)); o.connect(h); h.connect(g); });
    this._chain(g, { pan, send });
  }
  clarinet(t, freq, { dur = 0.6, gain = 0.1, pan = 0, send = 0.3 } = {}) {   // soft hollow lead for the "oh well" mood
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(gain, t + 0.05); g.gain.setValueAtTime(gain * 0.85, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const o = this._osc('square', freq, t, dur), f = this._filt('lowpass', 1100, 0.7), vib = this._osc('sine', 5.5, t, dur), vg = this.ctx.createGain(); vg.gain.value = 3.5; vib.connect(vg); vg.connect(o.detune);
    o.connect(f); f.connect(g); this._chain(g, { pan, send });
  }
  // ----- percussion -----
  kick(t, gain = 0.5) {
    const g = this._env(t, 0.002, gain, 0.28), o = this._osc('sine', 130, t, 0.3); o.frequency.exponentialRampToValueAtTime(46, t + 0.14); o.connect(g); this._chain(g);
    const c = this._env(t, 0.001, gain * 0.25, 0.012), n = this._noise(this.white, t, 0.02), f = this._filt('lowpass', 3000); n.connect(f); f.connect(c); this._chain(c);
  }
  snap(t, gain = 0.2, pan = 0.1) {
    const g = this._env(t, 0.001, gain, 0.09), n = this._noise(this.white, t, 0.12), f = this._filt('bandpass', 1900, 1.4); n.connect(f); f.connect(g); this._chain(g, { pan, send: 0.2 });
    const g2 = this._env(t, 0.001, gain * 0.5, 0.05), o = this._osc('triangle', 330, t, 0.06); o.connect(g2); this._chain(g2, { pan });
  }
  clap(t, gain = 0.2) { [0, 0.012, 0.024].forEach((d, i) => { const g = this._env(t + d, 0.001, gain * (i === 2 ? 1 : 0.6), i === 2 ? 0.14 : 0.03), n = this._noise(this.white, t + d, 0.2), f = this._filt('bandpass', 1400, 0.9); n.connect(f); f.connect(g); this._chain(g, { send: 0.25 }); }); }
  hat(t, gain = 0.06, open = false, pan = 0.25) {
    const g = this._env(t, 0.001, gain, open ? 0.16 : 0.035), n = this._noise(this.white, t, 0.2), f = this._filt('highpass', 7000, 0.7); n.connect(f); f.connect(g); this._chain(g, { pan });
  }
  shaker(t, gain = 0.05, pan = -0.25) {
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(gain, t + 0.018); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    const n = this._noise(this.white, t, 0.15), f = this._filt('bandpass', 6500, 1.2); n.connect(f); f.connect(g); this._chain(g, { pan });
  }
  rim(t, gain = 0.14) { const g = this._env(t, 0.001, gain, 0.05), o = this._osc('square', 820, t, 0.06), f = this._filt('bandpass', 1700, 2); o.connect(f); f.connect(g); this._chain(g, { send: 0.15, pan: 0.15 }); }
  wood(t, freq = 900, gain = 0.1, pan = 0) { const g = this._env(t, 0.001, gain, 0.06), o = this._osc('sine', freq, t, 0.08); o.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.05); o.connect(g); this._chain(g, { pan, send: 0.1 }); }

  // ----- effects -----
  whoosh(t, dur = 0.5, { up = true, gain = 0.2, pan0 = -0.6, pan1 = 0.6, lo = 280, hi = 4200 } = {}) {
    const n = this._noise(this.pink, t, dur + 0.1), f = this._filt('bandpass', up ? lo : hi, 1.1);
    f.frequency.setValueAtTime(up ? lo : hi, t); f.frequency.exponentialRampToValueAtTime(up ? hi : lo, t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(gain, t + dur * 0.55); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f); f.connect(g);
    if (this.ctx.createStereoPanner) { const p = this.ctx.createStereoPanner(); p.pan.setValueAtTime(pan0, t); p.pan.linearRampToValueAtTime(pan1, t + dur); g.connect(p); p.connect(this.out); const s = this.ctx.createGain(); s.gain.value = 0.25; p.connect(s); s.connect(this.verbIn); } else this._chain(g);
  }
  riser(t, dur = 0.6, gain = 0.12) {
    const n = this._noise(this.white, t, dur + 0.05), f = this._filt('highpass', 800, 0.8); f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.exponentialRampToValueAtTime(gain, t + dur); g.gain.linearRampToValueAtTime(0.00001, t + dur + 0.04);
    n.connect(f); f.connect(g); this._chain(g, { send: 0.2 });
  }
  boom(t, gain = 0.28, freq = 70) { const g = this._env(t, 0.004, gain, 0.7), o = this._osc('sine', freq * 1.8, t, 0.75); o.frequency.exponentialRampToValueAtTime(freq, t + 0.25); o.connect(g); this._chain(g, { send: 0.3 }); }
  pop(t, freq = 520, gain = 0.2, pan = 0) {
    const g = this._env(t, 0.002, gain, 0.14), o = this._osc('sine', freq * 0.7, t, 0.18); o.frequency.exponentialRampToValueAtTime(freq * 1.6, t + 0.05); o.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    o.connect(g); this._chain(g, { pan, send: 0.2 });
    const c = this._env(t, 0.001, gain * 0.4, 0.015), n = this._noise(this.white, t, 0.03), f = this._filt('highpass', 2500); n.connect(f); f.connect(c); this._chain(c, { pan });
  }
  boing(t, gain = 0.16, f0 = 260) {
    const g = this._env(t, 0.004, gain, 0.55), o = this._osc('sine', f0, t, 0.6), vib = this._osc('sine', 18, t, 0.6), vg = this.ctx.createGain(); vg.gain.setValueAtTime(40, t); vg.gain.exponentialRampToValueAtTime(2, t + 0.5);
    o.frequency.exponentialRampToValueAtTime(f0 * 2.3, t + 0.09); o.frequency.exponentialRampToValueAtTime(f0 * 1.1, t + 0.5); vib.connect(vg); vg.connect(o.frequency); o.connect(g); this._chain(g, { send: 0.15, pan: 0.2 });
  }
  thud(t, gain = 0.4) {
    const g = this._env(t, 0.002, gain, 0.22), o = this._osc('sine', 95, t, 0.25); o.frequency.exponentialRampToValueAtTime(48, t + 0.15); o.connect(g); this._chain(g, { send: 0.1 });
    const w = this._env(t, 0.001, gain * 0.35, 0.05), n = this._noise(this.brown, t, 0.08), f = this._filt('bandpass', 700, 1); n.connect(f); f.connect(w); this._chain(w);
  }
  puff(t, gain = 0.07, pan = 0) { const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(gain, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); const n = this._noise(this.pink, t, 0.5), f = this._filt('bandpass', 2400, 0.6); n.connect(f); f.connect(g); this._chain(g, { pan }); }
  ching(t, freq = 2400, gain = 0.1, pan = 0) {
    const g = this._env(t, 0.001, gain, 0.5);
    [[1, 1], [1.5, 0.5], [2.76, 0.3]].forEach(([m, a], i) => { const o = this._osc('sine', freq * m, t, 0.55), h = this.ctx.createGain(); h.gain.setValueAtTime(a, t); h.gain.exponentialRampToValueAtTime(0.0005, t + 0.5 / (1 + i * 0.6)); o.connect(h); h.connect(g); });
    this._chain(g, { pan, send: 0.3 });
  }
  wahwah(t, freq, dur, gain = 0.11, pan = 0) {   // muted-trombone "oh well" accent
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(gain, t + 0.04); g.gain.setValueAtTime(gain, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const o = this._osc('sawtooth', freq, t, dur), f = this._filt('lowpass', 500, 4), vib = this._osc('sine', 5, t, dur), vg = this.ctx.createGain(); vg.gain.value = 6;
    f.frequency.setValueAtTime(380, t); f.frequency.linearRampToValueAtTime(1400, t + dur * 0.35); f.frequency.linearRampToValueAtTime(420, t + dur);
    o.frequency.setValueAtTime(freq, t); o.frequency.setValueAtTime(freq, t + dur * 0.6); o.frequency.exponentialRampToValueAtTime(freq * 0.94, t + dur);
    vib.connect(vg); vg.connect(o.detune); o.connect(f); f.connect(g); this._chain(g, { pan, send: 0.2 });
  }
  // ----- continuous ambience pieces -----
  bed(buf, t0, t1, { filter = 'lowpass', f = 400, q = 0.6, gain = 0.1, fade = 0.5, pan = 0, lfo = 0, lfoRate = 0.2 } = {}) {
    const n = this._noise(buf, t0, t1 - t0 + fade), fl = this._filt(filter, f, q), g = this.ctx.createGain();
    g.gain.setValueAtTime(0.00001, t0); g.gain.linearRampToValueAtTime(gain, t0 + fade); g.gain.setValueAtTime(gain, Math.max(t0 + fade, t1 - fade)); g.gain.linearRampToValueAtTime(0.00001, t1 + fade);
    if (lfo > 0) { const l = this._osc('sine', lfoRate, t0, t1 - t0 + fade), lg = this.ctx.createGain(); lg.gain.value = gain * lfo; l.connect(lg); lg.connect(g.gain); }
    n.connect(fl); fl.connect(g); this._chain(g, { pan }); return g;
  }
}
