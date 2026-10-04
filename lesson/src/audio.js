/* ===== Audio: all music + effects synthesized with Web Audio; speech via browser speechSynthesis ===== */
const Sound = (() => {
  let ctx, master, comp, musicBus, duck, sfxBus;
  const vol = { music: 0.5, sfx: 0.7 };
  let mode = 'off';            // 'off' | 'ambient'
  let speaking = false, quiet = false, halted = false;
  let amb = null, ambN = 0;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 20; comp.ratio.value = 8; comp.attack.value = 0.005; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = 0.8;
    musicBus = ctx.createGain(); musicBus.gain.value = vol.music;
    duck = ctx.createGain(); duck.gain.value = 1;
    sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx;
    musicBus.connect(duck); duck.connect(master); sfxBus.connect(master);
    master.connect(comp); comp.connect(ctx.destination);
    return true;
  }
  function setVol(kind, v) {
    vol[kind] = v;
    if (!ctx) return;
    (kind === 'music' ? musicBus : sfxBus).gain.setTargetAtTime(kind === 'music' ? v : v * (speaking ? 0.4 : 1), ctx.currentTime, 0.05);
  }
  function applyDuck() {
    if (!ctx) return;
    const t = halted ? 0 : quiet ? 0.02 : speaking ? 0.22 : 1;
    duck.gain.setTargetAtTime(t, ctx.currentTime, quiet || halted ? 0.25 : 0.12);
    sfxBus.gain.setTargetAtTime(vol.sfx * (speaking ? 0.4 : 1), ctx.currentTime, 0.05);
  }
  function setSpeaking(v) { speaking = v; applyDuck(); }
  function setQuiet(v) { quiet = v; applyDuck(); }
  function setHalted(v) { halted = v; applyDuck(); if (v) stopAmbient(); else if (mode === 'ambient') startAmbient(); }

  // --- primitives ---
  function tone({ f, t = 0, d = 0.4, type = 'sine', g = 0.2, a = 0.01, r = 0.25, bus = 'music', lp = 0, det = 0 }) {
    if (!ctx) return;
    const t0 = ctx.currentTime + t;
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0);
    e.gain.linearRampToValueAtTime(g, t0 + a);
    e.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d + r);
    let n = o;
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); n = fl; }
    n.connect(e); e.connect(bus === 'music' ? musicBus : sfxBus);
    o.start(t0); o.stop(t0 + a + d + r + 0.05);
  }
  function pluck(m, t, g = 0.12, d = 0.35) { tone({ f: mtof(m), t, d, g, type: 'triangle', a: 0.006, r: 0.5, lp: 2600 }); tone({ f: mtof(m + 12), t, d: d * 0.5, g: g * 0.25, type: 'sine', a: 0.004, r: 0.3 }); }
  function pad(notes, t, d, g = 0.035) {
    notes.forEach((m) => { [-6, 6].forEach((c) => tone({ f: mtof(m), t, d, g, type: 'sawtooth', a: Math.min(1.2, d * 0.4), r: 1.4, lp: 650, det: c })); });
  }
  function noise(t, d, f0, f1, g, bus = 'sfx') {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * (d + 0.1));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
    const t0 = ctx.currentTime + t;
    bp.frequency.setValueAtTime(f0, t0); bp.frequency.exponentialRampToValueAtTime(f1, t0 + d);
    const e = ctx.createGain(); e.gain.setValueAtTime(0.0001, t0); e.gain.linearRampToValueAtTime(g, t0 + d * 0.4); e.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    src.connect(bp); bp.connect(e); e.connect(bus === 'music' ? musicBus : sfxBus);
    src.start(t0); src.stop(t0 + d + 0.1);
  }

  // --- themes ---
  const CH = [[50, 57, 61, 66], [47, 54, 59, 62], [43, 50, 55, 62], [45, 52, 57, 61]]; // D, Bm, G, A(add)
  function opening() {
    if (!init()) return 0;
    const beat = 60 / 84;
    CH.forEach((c, i) => {
      const t = i * beat * 4 + 0.05;
      pad(c, t, beat * 4, 0.03);
      tone({ f: mtof(c[0] - 12), t, d: beat * 3.4, g: 0.09, type: 'sine', a: 0.05, r: 0.6 });
      const arp = [c[1] + 12, c[2] + 12, c[3] + 12, c[2] + 24, c[3] + 12, c[2] + 12, c[1] + 12, c[2] + 12];
      arp.forEach((m, k) => pluck(m, t + k * beat * 0.5, 0.075 + (k % 2 ? 0 : 0.02), 0.28));
    });
    const mel = [[78, 0], [81, 1], [83, 2], [81, 3], [78, 4], [74, 5.5], [76, 7], [74, 8], [71, 9], [74, 10], [78, 12], [76, 13], [74, 14]];
    mel.forEach(([m, b]) => tone({ f: mtof(m), t: 0.05 + b * beat * 0.9, d: 0.35, g: 0.07, type: 'sine', a: 0.02, r: 0.6 }));
    const tEnd = 4 * beat * 4 + 0.05;
    pad([50, 57, 62, 66, 69], tEnd, 3, 0.03);
    [74, 78, 81, 86].forEach((m, k) => pluck(m, tEnd + k * 0.12, 0.09, 0.9));
    return 4 * beat * 4 + 3;
  }
  function ending() {
    if (!init()) return;
    const t = 0.1;
    [62, 66, 69, 74, 78, 81, 86].forEach((m, k) => pluck(m, t + k * 0.28, 0.08, 0.7));
    pad([50, 57, 62, 66], t + 0.2, 6, 0.03);
    pad([50, 57, 64, 69], t + 2.2, 5, 0.025);
    [74, 81, 86, 90].forEach((m, k) => tone({ f: mtof(m), t: t + 2.4 + k * 0.18, d: 1.4, g: 0.045, type: 'sine', a: 0.02, r: 1.5 }));
  }
  const PENTA = [62, 64, 66, 69, 71, 74, 76];
  function ambTick() {
    if (!ctx || mode !== 'ambient' || halted) { amb = null; return; }
    ambN++;
    const m = PENTA[Math.floor(Math.random() * PENTA.length)];
    pluck(m, 0, 0.055, 0.5);
    if (ambN % 4 === 1) pad(CH[(ambN >> 2) % 4].map((x) => x), 0, 7, 0.018);
    amb = setTimeout(ambTick, 2600 + Math.random() * 2400);
  }
  function startAmbient() { if (!ctx || amb) return; amb = setTimeout(ambTick, 900); }
  function stopAmbient() { clearTimeout(amb); amb = null; }
  function setMode(m) { mode = m; if (m === 'ambient' && !halted) startAmbient(); else stopAmbient(); }

  // --- effects (soft, never harsh) ---
  const FX = {
    whoosh: () => noise(0, 0.55, 380, 1700, 0.05),
    join: () => { tone({ f: mtof(76), d: 0.12, g: 0.09, type: 'triangle', bus: 'sfx', lp: 3000 }); tone({ f: mtof(81), t: 0.09, d: 0.2, g: 0.09, type: 'triangle', bus: 'sfx', lp: 3000 }); },
    pop: () => tone({ f: mtof(88), d: 0.05, g: 0.07, type: 'sine', a: 0.003, r: 0.08, bus: 'sfx' }),
    click: () => tone({ f: 520, d: 0.03, g: 0.05, type: 'sine', a: 0.002, r: 0.05, bus: 'sfx' }),
    correct: () => { tone({ f: mtof(81), d: 0.25, g: 0.1, bus: 'sfx', r: 0.5 }); tone({ f: mtof(85), t: 0.1, d: 0.3, g: 0.09, bus: 'sfx', r: 0.6 }); },
    gentle: () => { tone({ f: mtof(64), d: 0.12, g: 0.07, type: 'sine', a: 0.03, r: 0.3, bus: 'sfx' }); },
    reveal: () => [76, 81, 85].forEach((m, k) => tone({ f: mtof(m), t: k * 0.07, d: 0.15, g: 0.06, type: 'triangle', bus: 'sfx', lp: 3500, r: 0.4 })),
    timeup: () => { tone({ f: 660, d: 0.3, g: 0.07, bus: 'sfx', r: 1.0 }); tone({ f: 523, t: 0.35, d: 0.4, g: 0.07, bus: 'sfx', r: 1.2 }); },
    turn: () => tone({ f: mtof(72), d: 0.2, g: 0.05, type: 'sine', a: 0.05, r: 0.7, bus: 'sfx' }),
    save: () => tone({ f: mtof(79), d: 0.06, g: 0.05, bus: 'sfx', r: 0.2 }),
  };
  function sfx(n) { if (!ctx || !FX[n]) return; try { FX[n](); } catch (e) {} }

  function tap() { init(); const a = ctx.createAnalyser(); a.fftSize = 2048; comp.connect(a); return a; }
  return { tap, init, setVol, setSpeaking, setQuiet, setHalted, opening, ending, setMode, sfx, get ready() { return !!ctx; }, get vol() { return vol; } };
})();

/* ===== Speech: Web Speech API, one voice at a time, completion events drive sequencing ===== */
const Speech = (() => {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voices = [], token = 0, onCaption = () => {}, onSpeakState = () => {};
  const cfg = { en: '', male: '', female: '', es: '', rate: 0.9, volume: 1, mute: false, localOnly: false };
  let curDone = null;
  function load() { if (!supported) return; voices = speechSynthesis.getVoices() || []; onVoices && onVoices(voices); }
  let onVoices = null;
  if (supported) {
    load();
    speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', load);
    let n = 0; const iv = setInterval(() => { load(); if (voices.length || ++n > 12) clearInterval(iv); }, 400);
  }
  /* Voice classification is a best-effort guess from the voice NAME only; browsers do not expose gender. Not listening-verified. */
  const MALE = /\b(david|mark|guy|alex|daniel|fred|aaron|evan|ryan|tom|james|george|richard|christopher|eric|roger|steffan|davis|jason|brian|male|rishi|arthur|gordon|oliver|thomas|junior|ralph|bruce|lee)\b/i;
  const FEMALE = /\b(zira|aria|jenny|samantha|allison|ava|karen|susan|victoria|female|serena|moira|tessa|fiona|kate|emma|michelle|nicky|joanna|ivy|kendra|kimberly|salli|amy|libby|sonia|hazel|catherine|linda|heather|jessa|monica|paulina|helena|sabina)\b/i;
  const isMale = (v) => MALE.test(v.name) && !FEMALE.test(v.name);
  const isFemale = (v) => FEMALE.test(v.name) && !MALE.test(v.name);
  const remote = (v) => !v.localService;            // online voices may send the spoken text to a remote service
  const rank = (v) => {
    let s = 0; const n = v.name.toLowerCase();
    if (/en[-_]us/i.test(v.lang)) s += 50;
    if (/natural|online|neural/.test(n)) s += 8;
    if (/google us english|samantha|aria|jenny|ava|allison|zira|guy|evan|nicky/.test(n)) s += 6;
    if (v.localService) s += 12;                      // prefer on-device voices
    return s;
  };
  const pool = () => voices.filter((v) => /^en/i.test(v.lang) && (!cfg.localOnly || v.localService)).sort((a, b) => rank(b) - rank(a));
  function enVoices() { return voices.filter((v) => /^en/i.test(v.lang)).sort((a, b) => rank(b) - rank(a)); }
  function esVoices() { return voices.filter((v) => /^es/i.test(v.lang) && (!cfg.localOnly || v.localService)).sort((a, b) => (/es[-_](us|mx)/i.test(b.lang) - /es[-_](us|mx)/i.test(a.lang))); }
  /** role: 'male' | 'female' | undefined (narrator). Returns {voice, pitch}. */
  function pick(lang, role) {
    if (lang === 'es') { const l = esVoices(); return { voice: l.find((v) => v.name === cfg.es) || l[0] || null, pitch: 1 }; }
    const p = pool(), find = (name) => (name ? voices.find((v) => v.name === name) : null);
    const narr = find(cfg.en) || p.find((v) => /en[-_]us/i.test(v.lang) && !isMale(v)) || p[0] || null;
    if (!role) return { voice: narr, pitch: 1 };
    const chosen = find(role === 'male' ? cfg.male : cfg.female);
    const auto = p.find((v) => /en[-_]us/i.test(v.lang) && (role === 'male' ? isMale(v) : isFemale(v) && v !== narr)) || p.find((v) => role === 'male' ? isMale(v) : isFemale(v) && v !== narr);
    const voice = chosen || auto || narr;
    // if no distinct voice exists, shift pitch a little so speakers still sound different (a rough cue, not a real voice change)
    const distinct = voice && narr && voice.name !== narr.name;
    return { voice, pitch: distinct ? 1 : (role === 'male' ? 0.82 : 1.15) };
  }
  const est = (text, rate) => Math.max(800, text.length * 62 / Math.max(0.5, rate));
  function speakOne(text, lang, rate, role) {
    return new Promise((res) => {
      let done = false, tm = null;
      const fin = () => { if (done) return; done = true; clearTimeout(tm); curDone = null; res(); };
      curDone = fin;
      const pk = supported && !cfg.mute ? pick(lang, role) : { voice: null, pitch: 1 };
      if (!supported || cfg.mute || !pk.voice) { tm = setTimeout(fin, est(text, 1.3)); return; } // no voice: captions-only timing
      const u = new SpeechSynthesisUtterance(text);
      u.voice = pk.voice; u.lang = pk.voice.lang;
      u.rate = Math.min(1.5, Math.max(0.5, rate)); u.volume = cfg.volume; u.pitch = pk.pitch;
      u.onend = fin; u.onerror = fin;
      tm = setTimeout(fin, est(text, rate) + 6000); // safety net if a browser never fires onend
      try { speechSynthesis.speak(u); } catch (e) { fin(); }
    });
  }
  const norm = (items) => (Array.isArray(items) ? items : [items]).filter(Boolean).map((i) => (typeof i === 'string' ? { t: i } : i));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  /** Speak a list; a new call or stop() cancels it (no overlapping voices). Resolves true if finished. opts.role = 'male'|'female' */
  async function say(items, opts = {}) {
    const my = ++token;
    hardStop();
    onSpeakState(true, opts);
    let ok = true;
    for (const it of norm(items)) {
      if (my !== token) { ok = false; break; }
      const lang = it.lang || 'en';
      const rate = cfg.rate * (it.rate || 1);
      if (!opts.noCaption) onCaption(it.cap || it.t, lang);
      await speakOne(it.t, lang, rate, it.role || opts.role);
      if (my !== token) { ok = false; break; }
      await sleep(it.pause != null ? it.pause : 260);
    }
    if (my === token) { onSpeakState(false, opts); }
    return ok;
  }
  function hardStop() { if (curDone) curDone(); if (supported) try { speechSynthesis.cancel(); } catch (e) {} }
  function stop() { token++; hardStop(); onSpeakState(false, {}); onCaption('', 'en'); }
  return {
    supported, cfg, say, stop, enVoices, esVoices, isMale, isFemale, remote,
    set onCaption(f) { onCaption = f; }, set onSpeakState(f) { onSpeakState = f; }, set onVoices(f) { onVoices = f; load(); },
    get hasEn() { return enVoices().length > 0; },
    current(lang, role) { return pick(lang || 'en', role); },
  };
})();
