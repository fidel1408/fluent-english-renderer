// All music, ambience and effects are generated with Web Audio (no samples). Voices are the pre-rendered Kokoro WAVs.
// One schedule drives both live playback (AudioContext) and the offline export (OfflineAudioContext).
import { rng, clamp } from './util.js';

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function makeBuses(ctx) {
  const master = ctx.createGain(); master.gain.value = 0.66;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.002; limiter.release.value = 0.08;
  master.connect(comp); comp.connect(limiter); limiter.connect(ctx.destination);
  const mk = (v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const b = { master, voice: mk(1), music: mk(0.62), fx: mk(0.8), amb: mk(1) };
  b.duckMusic = mk(1); b.duckAmb = mk(1); b.scene = mk(1);
  b.music.connect(b.duckMusic); b.duckMusic.connect(b.scene); b.scene.connect(master);
  b.amb.connect(b.duckAmb); b.duckAmb.connect(master); b.voice.connect(master); b.fx.connect(master);
  return b;
}

function noiseBuffer(ctx, sec, pink) {
  const n = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0); const r = rng(1234);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < n; i++) { const w = r() * 2 - 1; if (pink) { b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2; } else d[i] = w; }
  return buf;
}

export function scheduleAll(ctx, B, cues, voiceBufs, t0, opts = {}) {
  const NB = noiseBuffer(ctx, 3, false);
  const T = (t) => t0 + t;
  const env = (g, t, a, peak, d, sus = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d); };

  // ---------- voices ----------
  if (opts.voices !== false) for (const l of cues.lines) {
    const buf = voiceBufs[l.id]; if (!buf) continue;
    const d = buf.getChannelData(0); let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] * d[i]; const rms = Math.sqrt(s / (d.length / 4));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 80;
    const pk = ctx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 3200; pk.gain.value = 2.5; pk.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = clamp(0.115 / rms, 0.5, 3.2);
    src.connect(hp); hp.connect(pk); pk.connect(g); g.connect(B.voice); src.start(T(l.start));
  }

  // ---------- ducking + scene dynamics ----------
  for (const l of cues.lines) {
    for (const dk of [B.duckMusic, B.duckAmb]) {
      dk.gain.setTargetAtTime(dk === B.duckMusic ? 0.5 : 0.25, T(l.start - 0.12), 0.07);
      dk.gain.setTargetAtTime(1, T(l.end + 0.08), 0.35);
    }
  }
  const sceneKeys = [[0, 0.45], [3.9, 0.45], [4.3, 1], [10.8, 1], [11.2, 0.9], [17.8, 0.9], [18.3, 0.55], [23.8, 0.55], [24.3, 1], [30, 1]];
  B.scene.gain.setValueAtTime(sceneKeys[0][1], T(0)); for (const [t, v] of sceneKeys.slice(1)) B.scene.gain.linearRampToValueAtTime(v, T(t));

  // ---------- instruments ----------
  const pad = (t, dur, notes, vel, dest = B.music, lp = 1100) => {
    for (const m of notes) for (const det of [-6, 6]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(lp * 0.5, T(t)); f.frequency.linearRampToValueAtTime(lp, T(t + dur * 0.5)); f.Q.value = 0.4;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(vel / (notes.length * 2.2), T(t + Math.min(0.9, dur * 0.4)));
      g.gain.setValueAtTime(vel / (notes.length * 2.2), T(t + dur)); g.gain.linearRampToValueAtTime(0.0001, T(t + dur + 1.3));
      o.connect(f); f.connect(g); g.connect(dest); o.start(T(t)); o.stop(T(t + dur + 1.4));
    }
  };
  const ep = (t, m, vel, dur = 1.6, dest = B.music) => { // soft FM electric piano
    const f0 = mtof(m), c = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    c.type = 'sine'; mod.type = 'sine'; c.frequency.value = f0; mod.frequency.value = f0 * 1.0; lp.type = 'lowpass'; lp.frequency.value = 3200;
    mg.gain.setValueAtTime(f0 * 1.6 * vel, T(t)); mg.gain.exponentialRampToValueAtTime(f0 * 0.05, T(t + 0.5));
    mod.connect(mg); mg.connect(c.frequency);
    g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(0.16 * vel, T(t + 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, T(t + dur));
    c.connect(lp); lp.connect(g); g.connect(dest); c.start(T(t)); mod.start(T(t)); c.stop(T(t + dur + 0.1)); mod.stop(T(t + dur + 0.1));
    // tine overtone
    const o2 = ctx.createOscillator(), g2 = ctx.createGain(); o2.type = 'sine'; o2.frequency.value = f0 * 4; g2.gain.setValueAtTime(0.03 * vel, T(t)); g2.gain.exponentialRampToValueAtTime(0.0001, T(t + 0.22)); o2.connect(g2); g2.connect(dest); o2.start(T(t)); o2.stop(T(t + 0.3));
  };
  const bass = (t, m, dur, vel) => {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'sine'; o.frequency.value = mtof(m); o2.type = 'triangle'; o2.frequency.value = mtof(m + 12); lp.type = 'lowpass'; lp.frequency.value = 600;
    g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(0.2 * vel, T(t + 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, T(t + dur));
    const g2 = ctx.createGain(); g2.gain.value = 0.35; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(B.music); o.start(T(t)); o2.start(T(t)); o.stop(T(t + dur + .1)); o2.stop(T(t + dur + .1));
  };
  const shaker = (t, vel) => {
    const s = ctx.createBufferSource(); s.buffer = NB; const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 7000; hp.Q.value = 0.9; const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(0.05 * vel, T(t + 0.008)); g.gain.exponentialRampToValueAtTime(0.0001, T(t + 0.09)); s.connect(hp); hp.connect(g); g.connect(B.music); s.start(T(t), Math.random() * 0 + 0.3); s.stop(T(t + 0.12));
  };
  const bell = (t, m, vel, dur = 1.2, dest = B.fx) => {
    for (const [mul, a, d] of [[1, 1, dur], [2.76, 0.28, dur * 0.4], [5.4, 0.1, dur * 0.2]]) {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = mtof(m) * mul;
      g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(0.11 * vel * a, T(t + 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, T(t + d)); o.connect(g); g.connect(dest); o.start(T(t)); o.stop(T(t + d + 0.05));
    }
  };
  const whoosh = (t, dur, vel, up = true) => {
    const s = ctx.createBufferSource(); s.buffer = NB; s.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1; const g = ctx.createGain();
    bp.frequency.setValueAtTime(up ? 300 : 3200, T(t)); bp.frequency.exponentialRampToValueAtTime(up ? 3400 : 260, T(t + dur));
    g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(0.16 * vel, T(t + dur * 0.55)); g.gain.linearRampToValueAtTime(0.0001, T(t + dur)); s.connect(bp); bp.connect(g); g.connect(B.fx); s.start(T(t)); s.stop(T(t + dur + 0.05));
  };
  const tick = (t, vel) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(980, T(t)); o.frequency.exponentialRampToValueAtTime(620, T(t + 0.05));
    g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(0.16 * vel, T(t + 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, T(t + 0.09)); o.connect(g); g.connect(B.fx); o.start(T(t)); o.stop(T(t + 0.12));
  };
  const drop = (t, vel) => { // gentle "pause" accent: soft low sine falling + airy bell
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(260, T(t)); o.frequency.exponentialRampToValueAtTime(110, T(t + 0.5));
    g.gain.setValueAtTime(0.0001, T(t)); g.gain.linearRampToValueAtTime(0.22 * vel, T(t + 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, T(t + 0.65)); o.connect(g); g.connect(B.fx); o.start(T(t)); o.stop(T(t + 0.7));
  };
  const swell = (t, dur, vel) => { // reversed-style noise swell into a downbeat
    const s = ctx.createBufferSource(); s.buffer = NB; s.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, T(t)); lp.frequency.exponentialRampToValueAtTime(2400, T(t + dur)); const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, T(t)); g.gain.exponentialRampToValueAtTime(0.1 * vel, T(t + dur)); g.gain.linearRampToValueAtTime(0.0001, T(t + dur + 0.05)); s.connect(lp); lp.connect(g); g.connect(B.fx); s.start(T(t)); s.stop(T(t + dur + 0.1));
  };

  // ---------- conversational murmur (formant-filtered noise, syllable-rate modulation) ----------
  const murmur = (t0m, t1m, level, seed) => {
    const r = rng(seed);
    for (let k = 0; k < 4; k++) {
      const s = ctx.createBufferSource(); s.buffer = NB; s.loop = true; const sum = ctx.createGain(); sum.gain.value = 0;
      const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.Q.value = 4; f2.Q.value = 5;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; const pan = ctx.createStereoPanner(); pan.pan.value = [-0.7, -0.25, 0.3, 0.75][k];
      s.connect(f1); s.connect(f2); f1.connect(sum); f2.connect(sum); sum.connect(lp); lp.connect(pan); pan.connect(B.amb);
      const dur = t1m - t0m; let tt = 0; sum.gain.setValueAtTime(0, T(t0m));
      while (tt < dur) { const sy = 0.11 + r() * 0.14, talk = (Math.sin(tt * 0.9 + k * 2.1) + Math.sin(tt * 1.7 + k)) > -0.4;
        const lv = talk ? Math.pow(r(), 1.5) * level : 0; sum.gain.setTargetAtTime(lv, T(t0m + tt), 0.03);
        f1.frequency.setTargetAtTime(380 + r() * 420 + k * 40, T(t0m + tt), 0.04); f2.frequency.setTargetAtTime(1100 + r() * 1500, T(t0m + tt), 0.04); tt += sy; }
      sum.gain.setTargetAtTime(0, T(t1m), 0.15); s.start(T(t0m), r() * 2); s.stop(T(t1m + 1));
    }
  };
  murmur(0.0, 2.7, 0.55, 21);          // clear but unintelligible murmur, collapsing into the pause
  murmur(4.3, 17.9, 0.09, 33);       // very low café bed under scenes 2-3

  // ---------- music arrangement (beat = 0.5 s) ----------
  const CH = {
    Dm9: [38, 45, 53, 57, 60], Asus: [33, 45, 52, 57, 59],
    C: [48, 55, 59, 62, 64], Am7: [45, 52, 55, 60, 64], F: [41, 48, 52, 57, 60], G: [43, 50, 55, 59, 64],
  };
  const arpPat = [0, 2, 1, 3, 2, 4, 3, 1];
  const comp = (t, name, vel, density) => {
    const ch = CH[name], hi = ch.map(m => m + 12);
    for (let i = 0; i < 4; i++) { if (density === 0) break; const tt = t + i * 0.5; if (density === 1 && i % 2) continue; ep(tt, hi[arpPat[i * 2 % 8] % 5] + (i === 3 ? 0 : 0), vel * (i === 0 ? 1 : 0.7)); }
  };
  // Scene 1 (0-4): unresolved pad, no pulse
  pad(0.0, 2.1, CH.Asus, 0.9, B.music, 800); pad(2.0, 1.9, CH.Dm9, 0.9, B.music, 800);
  swell(2.75, 0.6, 1); drop(3.38, 1); bell(3.4, 81, 0.25, 1.6);
  // Resolution at 4.0: warm major swell + rising motif
  const prog = [[4, 'C'], [6, 'Am7'], [8, 'F'], [10, 'G'], [12, 'C'], [14, 'Am7'], [16, 'F'], [18, 'G']];
  prog.forEach(([t, n], i) => {
    const vel = t < 11 ? 1 : 0.85;
    pad(t, 2.0, CH[n], 0.8, B.music, 1300);
    bass(t, CH[n][0], 1.6, 1); bass(t + 1, CH[n][1] - 12, 0.9, 0.7);
    if (t < 18) { comp(t, n, vel, 2); for (let k = 0; k < 4; k++) shaker(t + k * 0.5 + 0.25, 0.7 + (k % 2) * 0.3); }
  });
  [[4.0, 64], [4.12, 67], [4.24, 72], [4.4, 76]].forEach(([t, m], i) => ep(t, m, 0.9 - i * 0.1, 2.2));
  // Scene 4 (18-24): soft pad, sparse notes, no pulse; countdown ticks, check chime
  pad(18.0, 2.0, CH.G, 0.55, B.music, 900); pad(20.0, 4.0, CH.C, 0.6, B.music, 900);
  ep(20.5, 76, 0.38, 2.2); ep(21.5, 71, 0.32, 2.2); ep(22.5, 67, 0.32, 2.4); ep(23.0, 72, 0.3, 2.6);
  for (const t of [20.2, 21.2, 22.2]) tick(t, 0.8);
  bell(23.22, 79, 0.45, 1.4); bell(23.34, 84, 0.45, 1.8);
  // Scene 5 (24-30): bright return + clean closing accent
  [[24, 'C'], [26, 'F'], [28, 'G']].forEach(([t, n]) => {
    pad(t, t === 28 ? 1.2 : 2.0, CH[n], 0.85, B.music, 1500); bass(t, CH[n][0], 1.6, 1); bass(t + 1, CH[n][1] - 12, 0.9, 0.7);
    if (t < 28.8) { comp(t, n, 0.9, 2); for (let k = 0; k < 4; k++) shaker(t + k * 0.5 + 0.25, 0.7 + (k % 2) * 0.3); }
  });
  pad(29.2, 0.55, CH.C, 1.0, B.music, 2000); bass(29.2, 36, 0.8, 1.2);
  [72, 76, 79, 84].forEach((m, i) => bell(29.2 + i * 0.07, m, 0.7, 0.9 + i * 0.1, B.music));
  // fade out the very end
  B.master.gain.setValueAtTime(B.master.gain.value, T(29.6)); B.master.gain.linearRampToValueAtTime(0.0001, T(29.98));

  // ---------- effects: reveals, transitions ----------
  [[0.15, 69, .5], [4.28, 88, .5], [14.22, 88, .5], [18.1, 88, .5], [24.3, 91, .5], [26.55, 93, .6]].forEach(([t, m, v]) => bell(t, m, v, 0.7));
  [3.72, 10.72, 17.72, 23.72].forEach((t) => whoosh(t, 0.55, 1));
  whoosh(24.75, 0.5, 0.5, false); whoosh(26.5, 0.35, 0.4, true);
}

export async function loadVoices(ctx, cues, base = '') {
  const out = {};
  await Promise.all(cues.lines.map(async (l) => { const ab = await (await fetch(base + l.file)).arrayBuffer(); out[l.id] = await ctx.decodeAudioData(ab); }));
  return out;
}

export function wavFromBuffer(buf) { // 16-bit PCM stereo WAV
  const n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true); out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const d = []; for (let c = 0; c < ch; c++) d.push(buf.getChannelData(c)); let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = clamp(d[c][i], -1, 1); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  return out.buffer;
}
