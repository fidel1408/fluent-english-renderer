// Original soundtrack, composed in code and tied to the video timeline.
// Four independent stems (voice / music / ambience / effects) are rendered with OfflineAudioContext, so the live preview and the
// MP4 export use exactly the same audio. Music and ambience are ducked under speech and removed from the speaking pause.
import { Synth, mtof } from './synth.js';
import { SCENES, CLIPS, PAUSE, DURATION } from './timeline.js';

export const SR = 44100;
export const LAYERS = ['voice', 'music', 'ambience', 'sfx'];
export const DEFAULT_GAINS = { voice: 1, music: 0.9, ambience: 0.85, sfx: 0.9 };
const BPM = 126, B = 60 / BPM;
const sc = (id) => SCENES.find(s => s.id === id);
const CH = { C: [60, 64, 67], G: [55, 59, 62], Am: [57, 60, 64], F: [53, 57, 60], Dm: [50, 53, 57], G7: [55, 59, 62, 65] };
const ROOT = { C: 36, G: 43, Am: 45, F: 41, Dm: 38 };

// ---------- ducking / quiet-space envelope ----------
// Returns a per-stem gain curve (60 Hz). Under speech the bed drops; in the speaking pause it goes to silence.
export function duckCurve({ depth, pauseGain = 0, lead = 0.12, attack = 0.1, release = 0.5, base = () => 1, fadeEnd = 0.35 }) {
  const rate = 60, n = Math.ceil(DURATION * rate) + 1, out = new Float32Array(n);
  let cur = 1;
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    let target = 1;
    for (const c of CLIPS) if (t >= c.start - lead && t <= c.start + c.dur + 0.08) target = Math.min(target, depth);
    if (t >= PAUSE.start - 0.08 && t <= PAUSE.end - 0.02) target = Math.min(target, pauseGain);
    const k = target < cur ? 1 - Math.exp(-1 / (attack * rate)) : 1 - Math.exp(-1 / (release * rate));
    cur += (target - cur) * k;
    out[i] = cur * base(t) * (t > DURATION - fadeEnd ? Math.max(0, (DURATION - t) / fadeEnd) : 1);
  }
  return out;
}

function withCurve(ctx, curve) {
  const g = ctx.createGain(); g.gain.setValueAtTime(curve[0], 0); g.gain.setValueCurveAtTime(curve, 0, DURATION);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 38; hp.Q.value = 0.7;   // nothing useful below ~40 Hz on phone speakers
  g.connect(hp); hp.connect(ctx.destination); return g;
}
const newCtx = () => new OfflineAudioContext(2, Math.ceil(DURATION * SR), SR);

// ---------- MUSIC ----------
function music() {
  const ctx = newCtx();
  const bus = withCurve(ctx, duckCurve({
    depth: 0.24, pauseGain: 0, release: 0.55,
    base: (t) => { const s = SCENES.find(x => t >= x.t0 && t < x.t1); return 1.6 * (({ hook: 0.8, spend: 1, waste: 0.85, speak: 0.7, cta: 1.05 })[s?.id] ?? 1); },
  }));
  const S = new Synth(ctx, bus, 7);
  const mel = (t0, notes, mk, g) => notes.forEach(([b, m, d]) => mk(t0 + b * B, mtof(m), { dur: (d ?? 0.9) * B * 1.1, gain: g }));
  const stab = (t, ch, g, pan) => CH[ch].forEach((m, i) => S.rhodes(t, mtof(m + 12), { dur: 0.45, gain: g, pan: pan + (i - 1) * 0.12 }));

  // --- hook: curious, light, un-resolved (question) ---
  {
    const t0 = sc('hook').t0;
    S.pad(t0, t0 + 4 * B, CH.C.map(m => mtof(m)), { gain: 0.05, cutoff: 1100 }); S.pad(t0 + 4 * B, t0 + 8 * B, CH.G.map(m => mtof(m)), { gain: 0.05, cutoff: 1100 });
    for (let k = 0; k < 16; k++) S.shaker(t0 + k * B / 2, k % 2 ? 0.035 : 0.025);
    [0, 2, 4, 6].forEach((b, i) => S.bass(t0 + b * B, mtof(i < 2 ? 36 : 43), { dur: 0.45, gain: 0.26 }));
    [1, 3].forEach(b => S.wood(t0 + (b + 4) * B, 1100, 0.06, 0.2));
    mel(t0, [[0.5, 76], [1, 79], [1.5, 81], [2, 79], [2.5, 76], [3, 79], [4, 81], [4.5, 83], [5, 86], [6, 83], [6.5, 81], [7, 86, 1.6]], (t, f, o) => S.marimba(t, f, { ...o, pan: 0.15 }), 0.2);
  }
  // --- spend: positive groove (C G Am F) ---
  {
    const sp = sc('spend'), t0 = sp.t0, end = sp.t1, prog = ['C', 'G', 'Am', 'F'];
    const nb = Math.floor((end - t0) / B);
    for (let b = 0; b < nb; b++) {
      const bar = Math.floor(b / 4) % 4, ch = prog[bar], beat = b % 4, t = t0 + b * B, odd = bar % 2 === 1;
      if (beat === 0) S.pad(t, t + 4 * B, CH[ch].map(m => mtof(m)), { gain: 0.035, cutoff: 1300 });
      if (beat === 0 || beat === 2) S.kick(t, 0.42);
      if (beat === 3 && odd) S.kick(t + B / 2, 0.3);
      if (beat === 1 || beat === 3) S.snap(t, 0.22);
      S.hat(t, 0.045); S.hat(t + B / 2, 0.075, beat === 3 && odd);
      if (beat === 0) S.bass(t, mtof(ROOT[ch]), { dur: 0.38, gain: 0.32 });
      if (beat === 1) S.bass(t + B / 2, mtof(ROOT[ch]), { dur: 0.25, gain: 0.26 });
      if (beat === 2) S.bass(t, mtof(ROOT[ch] + 12), { dur: 0.3, gain: 0.22 });
      if (beat === 3) S.bass(t + B / 2, mtof(ROOT[ch] + 7), { dur: 0.3, gain: 0.24 });
      if (beat === 0) stab(t + B / 2, ch, 0.05, -0.3);
      if (beat === 2) stab(t + B / 2, ch, 0.05, 0.3);
    }
    const phrase = [
      [[0, 76], [1, 79], [1.5, 81], [2, 79], [3, 76]], [[0, 74], [1, 79], [2, 83], [2.5, 81], [3, 79]],
      [[0, 72], [1, 76], [1.5, 79], [2, 81], [3.5, 79]], [[0, 81], [1, 79], [2, 77], [2.5, 76], [3, 72]],
    ];
    for (let bar = 0; bar < 4; bar++) for (const [b, m] of phrase[bar]) { const t = t0 + (bar * 4 + b) * B; if (t < end - 0.2) S.marimba(t, mtof(m), { dur: 0.5, gain: 0.17, pan: 0.2 }); }
  }
  // --- waste: wistful, "oh well" (Am F G Am), kick-less ---
  {
    const w = sc('waste'), t0 = w.t0, prog = ['Am', 'F', 'G', 'Am'], nb = Math.floor((w.t1 - t0) / B);
    for (let b = 0; b < nb; b++) {
      const bar = Math.floor(b / 4) % 4, ch = prog[bar], beat = b % 4, t = t0 + b * B;
      if (beat === 0) { S.pad(t, t + 4 * B, CH[ch].map(m => mtof(m)), { gain: 0.045, cutoff: 900 }); S.bass(t, mtof(ROOT[ch]), { dur: 0.9, gain: 0.3 }); }
      if (beat === 2) S.bass(t, mtof(ROOT[ch] + 7), { dur: 0.5, gain: 0.2 });
      if (beat === 1 || beat === 3) S.rim(t, 0.09);
      S.hat(t + B / 2, 0.035);
      if (beat === 0 || beat === 2) S.pluck(t + B * 0.5, mtof(CH[ch][beat ? 2 : 1] + 12), { dur: 0.5, gain: 0.07, pan: -0.25 });
    }
    const lead = [[0, 76, 2], [2.5, 74, 0.5], [3, 72, 1], [4, 69, 1.5], [5.5, 72, 0.5], [6, 69, 2], [8, 71, 2], [10, 74, 1], [11, 67, 1], [12, 69, 3]];
    lead.forEach(([b, m, d]) => { const t = t0 + b * B; if (t < w.t1 - 0.3) S.clarinet(t, mtof(m), { dur: d * B, gain: 0.09, pan: 0.1 }); });
  }
  // --- speak: airy harp over F C G, then stops for the challenge ---
  {
    const sp = sc('speak'), t0 = sp.t0, prog = ['F', 'C', 'G', 'F'];
    for (let b = 0; b < 8; b++) {
      const t = t0 + b * B; if (t > PAUSE.start - 0.25) break;
      const ch = prog[Math.floor(b / 4)], beat = b % 4;
      if (beat === 0) S.pad(t, Math.min(t + 4 * B, PAUSE.start - 0.1), CH[ch].map(m => mtof(m)), { gain: 0.05, cutoff: 1200, release: 0.35 });
      [0, 1].forEach(h => S.pluck(t + h * B / 2, mtof(CH[ch][(beat * 2 + h) % 3] + 12 + (h ? 12 : 0)), { dur: 0.6, gain: 0.08, pan: h ? 0.3 : -0.3 }));
      if (beat === 0) S.bass(t, mtof(ROOT[ch]), { dur: 0.9, gain: 0.22 });
      S.shaker(t, 0.025); S.shaker(t + B / 2, 0.02);
    }
  }
  // --- cta: full, optimistic (F G C C) ---
  {
    const c = sc('cta'), t0 = c.t0, prog = ['F', 'G', 'C', 'C'], nb = Math.floor((c.t1 - t0) / B);
    for (let b = 0; b < nb; b++) {
      const bar = Math.floor(b / 4) % 4, ch = prog[bar], beat = b % 4, t = t0 + b * B;
      if (beat === 0) S.pad(t, t + 4 * B, CH[ch].map(m => mtof(m)), { gain: 0.04, cutoff: 1500 });
      S.kick(t, 0.38); if (beat === 1 || beat === 3) S.clap(t, 0.16);
      S.hat(t + B / 2, 0.075); S.shaker(t, 0.03); S.shaker(t + B / 4, 0.02); S.shaker(t + B * 3 / 4, 0.02);
      if (beat === 0) S.bass(t, mtof(ROOT[ch]), { dur: 0.4, gain: 0.3 });
      if (beat === 1) S.bass(t + B / 2, mtof(ROOT[ch]), { dur: 0.25, gain: 0.25 });
      if (beat === 2) S.bass(t, mtof(ROOT[ch] + 12), { dur: 0.3, gain: 0.22 });
      if (beat === 3) S.bass(t + B / 2, mtof(ROOT[ch] + 7), { dur: 0.3, gain: 0.24 });
      if (beat === 0) stab(t + B / 2, ch, 0.05, -0.3); if (beat === 2) stab(t + B / 2, ch, 0.05, 0.3);
    }
    const phrase = [[[0, 81], [0.5, 79], [1, 77], [2, 79], [3, 81]], [[0, 83], [1, 81], [2, 79], [2.5, 81], [3, 83]], [[0, 84], [1, 79], [2, 76], [3, 79]], [[0, 84, 3]]];
    for (let bar = 0; bar < 3; bar++) for (const [b, m] of phrase[bar]) { const t = t0 + (bar * 4 + b) * B; if (t < c.t1 - 0.4) S.marimba(t, mtof(m), { dur: 0.55, gain: 0.17, pan: 0.2 }); }
    // finale: warm major chord + shimmer as the narration lands, ringing to the fade
    const tf = 28.5;
    S.pad(tf, tf + 0.3, CH.C.map(m => mtof(m)), { gain: 0.07, cutoff: 2200, release: 0.5, attack: 0.05 });
    CH.C.forEach((m, i) => S.rhodes(tf, mtof(m + 12), { dur: 0.8, gain: 0.07, pan: (i - 1) * 0.25 }));
    S.bell(tf, mtof(96), { dur: 1.0, gain: 0.06 }); S.bell(tf + 0.08, mtof(103), { dur: 0.9, gain: 0.04 }); S.bass(tf, mtof(36), { dur: 0.7, gain: 0.3 });
  }
  return ctx.startRendering();
}

// ---------- AMBIENCE ----------
function ambience() {
  const ctx = newCtx();
  const bus = withCurve(ctx, duckCurve({ depth: 0.4, pauseGain: 0, release: 0.6, attack: 0.15, base: () => 2.6 }));
  const S = new Synth(ctx, bus, 21);
  const h = sc('hook'), sp = sc('spend'), w = sc('waste'), s4 = sc('speak'), c = sc('cta');
  // street outside the shops
  S.bed(S.brown, h.t0, h.t1, { f: 220, gain: 0.16, fade: 0.2, lfo: 0.3, lfoRate: 0.35 }); S.bed(S.pink, h.t0, h.t1, { filter: 'bandpass', f: 1300, q: 0.5, gain: 0.02, fade: 0.25, lfo: 0.4, lfoRate: 0.5 });
  S.bell(1.45, 1568, { dur: 0.9, gain: 0.025, pan: -0.5, send: 0.7 }); S.whoosh(2.5, 0.9, { up: true, gain: 0.04, lo: 160, hi: 700, pan0: 0.8, pan1: -0.8 });
  // grocery: crowd murmur, fridge hum, scanner beeps, cart rattle, PA chime
  S.bed(S.pink, sp.t0, sp.t1, { filter: 'bandpass', f: 380, q: 0.9, gain: 0.07, fade: 0.4, lfo: 0.5, lfoRate: 0.31, pan: -0.3 });
  S.bed(S.pink, sp.t0, sp.t1, { filter: 'bandpass', f: 760, q: 0.8, gain: 0.05, fade: 0.4, lfo: 0.6, lfoRate: 0.23, pan: 0.3 });
  S.bed(S.pink, sp.t0, sp.t1, { filter: 'bandpass', f: 1250, q: 1.0, gain: 0.025, fade: 0.4, lfo: 0.7, lfoRate: 0.41 });
  S.bed(S.brown, sp.t0, sp.t1, { f: 140, gain: 0.07, fade: 0.4 });
  for (let t = sp.t0 + 0.9; t < sp.t1 - 0.2; t += 1.35 + S.r() * 0.9) { const g = S._env(t, 0.003, 0.03, 0.07), o = S._osc('square', 2500, t, 0.08); o.connect(g); S._chain(g, { pan: (S.r() - 0.5) * 1.2, send: 0.1 }); }
  for (let k = 0; k < 14; k++) S.wood(sp.t0 + 1.2 + k * 0.43 + S.r() * 0.1, 260 + S.r() * 80, 0.03, -0.5);
  S.bell(sp.t0 + 0.55, mtof(76), { dur: 0.8, gain: 0.03, send: 0.6 }); S.bell(sp.t0 + 1.05, mtof(72), { dur: 1.0, gain: 0.03, send: 0.6 });
  // home: quiet room tone, ticking clock, distant street
  S.bed(S.pink, w.t0, w.t1, { f: 500, gain: 0.05, fade: 0.4 }); S.bed(S.brown, w.t0, w.t1, { f: 120, gain: 0.06, fade: 0.4 });
  for (let k = 0; ; k++) { const t = w.t0 + 0.35 + k * 1.0; if (t > w.t1 - 0.2) break; S.wood(t, k % 2 ? 1500 : 1900, 0.035, 0.4); }
  // speak: airy shimmer that fades before the pause
  S.bed(S.pink, s4.t0, PAUSE.start, { filter: 'highpass', f: 3500, q: 0.4, gain: 0.012, fade: 0.4 });
  // cta: calm studio room + soft typing while the invitation is read
  S.bed(S.pink, c.t0, c.t1, { f: 800, gain: 0.03, fade: 0.5 });
  for (let t = c.t0 + 0.8; t < c.t0 + 3.4; t += 0.09 + S.r() * 0.2) S.wood(t, 2300 + S.r() * 700, 0.02 + S.r() * 0.01, (S.r() - 0.5) * 0.5);
  return ctx.startRendering();
}

// ---------- EFFECTS (cues tied to what happens on screen) ----------
function effects() {
  const ctx = newCtx();
  const bus = withCurve(ctx, duckCurve({ depth: 0.72, pauseGain: 1, release: 0.25, attack: 0.05, lead: 0.02, base: () => 1.15 }));
  const S = new Synth(ctx, bus, 33);
  const h = sc('hook'), sp = sc('spend'), w = sc('waste'), s4 = sc('speak'), c = sc('cta');
  // scene changes: swoosh + soft low hit on the downbeat
  S.riser(sp.t0 - 0.45, 0.45, 0.07); S.whoosh(sp.t0 - 0.1, 0.5, { gain: 0.2 }); S.boom(sp.t0, 0.22);
  S.whoosh(w.t0 - 0.1, 0.45, { gain: 0.16, up: false, pan0: 0.6, pan1: -0.6 }); S.boom(w.t0, 0.16, 62);
  S.whoosh(s4.t0 - 0.1, 0.5, { gain: 0.17 }); S.boom(s4.t0, 0.16);
  S.riser(c.t0 - 0.6, 0.55, 0.05);   // small lift out of the quiet
  S.whoosh(c.t0 - 0.12, 0.6, { gain: 0.2, lo: 400, hi: 6000 }); S.boom(c.t0, 0.24, 66); [84, 88, 91, 96].forEach((m, i) => S.bell(c.t0 + 0.04 + i * 0.07, mtof(m), { dur: 0.9, gain: 0.05, pan: (i - 1.5) * 0.3 }));
  // hook: phrase cards pop in, "?" bounces
  S.pop(0.35, 560, 0.2, -0.2); S.pop(1.05, 420, 0.2, 0.2); S.boing(1.9, 0.14, 250);
  // spend: the English sentence card, coins "ching" as they land on the shelf
  S.pop(sp.t0 + 0.25, 600, 0.16);
  for (let i = 0; i < 4; i++) for (let k = 0; ; k++) { const st = sp.t0 + 0.9 + i * 0.28 + k * 1.4; const tl = st + 1.4 * 0.78; if (tl > sp.t1 - 0.15) break; S.ching(tl, mtof([84, 88, 91, 93, 96][(i + k * 2) % 5]), 0.06 + 0.02 * ((i + k) % 2), 0.3 + 0.1 * i - 0.3); }
  // waste: card pop, "oh well" wah-wah, box lands on the table, dust puff
  S.pop(w.t0 + 0.25, 340, 0.16);
  S.wahwah(13.22, mtof(60), 0.3, 0.1); S.wahwah(13.55, mtof(58), 0.55, 0.1);
  const land = w.t0 + 3.3 + 0.55; S.thud(land, 0.38); S.puff(land + 0.5, 0.05, 0.1); S.whoosh(w.t0 + 3.7, 0.5, { gain: 0.07, pan0: -0.3, pan1: 0.3, lo: 200, hi: 1800 });
  // speak: four picture cards pop up the scale, listening cue, and a gentle "time" ding
  [84, 88, 91, 96].forEach((m, i) => S.marimba(s4.t0 + 0.3 + i * 0.18, mtof(m), { dur: 0.4, gain: 0.14, pan: (i - 1.5) * 0.35 }));
  S.bell(PAUSE.start + 0.02, mtof(91), { dur: 0.7, gain: 0.05, send: 0.3 }); S.bell(PAUSE.start + 0.2, mtof(96), { dur: 0.9, gain: 0.05, send: 0.3 });
  S.bell(PAUSE.end - 0.1, mtof(84), { dur: 0.8, gain: 0.05, send: 0.3 });
  // cta: logo sparkle, online-class scene whoosh, greeting bubble, button ding + message swoosh
  S.whoosh(c.t0 + 0.35, 0.6, { gain: 0.1, lo: 500, hi: 3500 }); S.pop(c.t0 + 1.0, 660, 0.14, 0.3);
  S.ching(c.t0 + 0.9, 3000, 0.07); S.ching(c.t0 + 0.97, 4000, 0.05); S.whoosh(c.t0 + 1.1, 0.35, { gain: 0.08, lo: 900, hi: 5000, pan0: -0.3, pan1: 0.9 });
  S.bell(c.t0 + 1.12, mtof(91), { dur: 0.6, gain: 0.04, pan: 0.6 }); S.bell(c.t0 + 1.26, mtof(96), { dur: 0.7, gain: 0.04, pan: 0.6 });
  return ctx.startRendering();
}

// ---------- VOICE ----------
function voice(buffers) {
  const ctx = newCtx(), out = ctx.createGain(); out.gain.value = 1.0;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 75;
  const pres = ctx.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 3200; pres.Q.value = 0.8; pres.gain.value = 2.2;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -24; comp.ratio.value = 2.5; comp.attack.value = 0.01; comp.release.value = 0.14; comp.knee.value = 10;
  hp.connect(pres); pres.connect(comp); comp.connect(out); out.connect(ctx.destination);
  for (const c of CLIPS) { const b = buffers?.[c.id]; if (!b) continue; const s = ctx.createBufferSource(); s.buffer = b; s.connect(hp); s.start(c.start); }
  return ctx.startRendering();
}

export async function loadVoiceBuffers(base = '') {
  let manifest = null;
  try { manifest = await (await fetch(base + 'audio/manifest.json', { cache: 'no-store' })).json(); } catch (e) { /* none */ }
  const dec = new OfflineAudioContext(1, 1, SR), out = {};
  for (const c of CLIPS) {
    const url = base + (manifest?.clips?.[c.id] ?? `audio/${c.id}.wav`);
    try { const r = await fetch(url); if (!r.ok) continue; out[c.id] = await dec.decodeAudioData(await r.arrayBuffer()); } catch (e) { /* missing clip */ }
  }
  return out;
}

export async function renderStems(voiceBuffers) {
  const [v, m, a, s] = await Promise.all([voice(voiceBuffers), music(), ambience(), effects()]);
  return { voice: v, music: m, ambience: a, sfx: s };
}

// Master chain shared by live playback and export: gentle glue compression, then makeup.
export function masterChain(ctx, input, dest) {
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.006; comp.release.value = 0.2;
  const mk = ctx.createGain(); mk.gain.value = 1.15; input.connect(comp); comp.connect(mk); mk.connect(dest); return mk;
}

export async function mixdown(stems, gains = DEFAULT_GAINS) {
  // The Web Audio DynamicsCompressor has a fixed 6 ms look-ahead delay; render 6 ms extra and trim it so the mix stays sample-aligned with the stems/video.
  const PRE = Math.round(0.006 * SR), N = stems.voice.length, ctx = new OfflineAudioContext(2, N + PRE, SR), sum = ctx.createGain();
  for (const L of LAYERS) { const s = ctx.createBufferSource(); s.buffer = stems[L]; const g = ctx.createGain(); g.gain.value = gains[L] ?? 1; s.connect(g); g.connect(sum); s.start(0); }
  masterChain(ctx, sum, ctx.destination);
  const r = await ctx.startRendering(), out = new AudioBuffer({ length: N, numberOfChannels: 2, sampleRate: SR });
  for (let c = 0; c < 2; c++) out.copyToChannel(r.getChannelData(c).subarray(PRE, PRE + N), c);
  return out;
}

export function toWav(buf) {
  const n = buf.length, ch = buf.numberOfChannels, data = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) data.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); data.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVEfmt '); data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, ch, true);
  data.setUint32(24, buf.sampleRate, true); data.setUint32(28, buf.sampleRate * ch * 2, true); data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true); w(36, 'data'); data.setUint32(40, n * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, c) => buf.getChannelData(c)); let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, chans[c][i])); data.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  return data.buffer;
}
