/* Procedural audio: music bed, transition swishes and effects, all generated with Web Audio. */
const Aud = (() => {
  let ac, musicIn, musicFilter, musicDuck, master, comp, muteG, recDest, sfxBus;
  let section = 'off', speaking = 0, muted = false, stepN = 0, nextT = 0, timer = null, frozenMusic = false;
  const BPM = 96, STEP = 60 / BPM / 4;
  const BASE = { off: 0, hook: 0.5, groove: 0.75, pause: 0.025, lift: 0.95, end: 0.65 };
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // F maj7 / A min7 / D min9 / C add9
  const CHORDS = [
    { root: 41, notes: [53, 57, 60, 64, 67] },
    { root: 45, notes: [57, 60, 64, 67, 72] },
    { root: 38, notes: [50, 53, 57, 60, 64] },
    { root: 36, notes: [48, 52, 55, 62, 67] },
  ];
  let noiseBuf;

  function init() {
    if (ac) { ac.resume(); return; }
    ac = new (window.AudioContext || window.webkitAudioContext)();
    comp = ac.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 10; comp.attack.value = 0.01; comp.release.value = 0.25;
    muteG = ac.createGain(); muteG.gain.value = muted ? 0 : 1;
    master = ac.createGain(); master.gain.value = 0.8;
    recDest = ac.createMediaStreamDestination();
    master.connect(comp); comp.connect(muteG); muteG.connect(ac.destination); comp.connect(recDest);
    musicIn = ac.createGain(); musicFilter = ac.createBiquadFilter(); musicFilter.type = 'lowpass'; musicFilter.frequency.value = 9000;
    musicDuck = ac.createGain(); musicDuck.gain.value = 0;
    musicIn.connect(musicFilter); musicFilter.connect(musicDuck); musicDuck.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master);
    const len = ac.sampleRate * 2; noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    nextT = ac.currentTime + 0.1;
    timer = setInterval(schedule, 25);
  }

  function updateDuck() {
    if (!ac) return;
    const target = frozenMusic ? 0 : BASE[section] * (speaking > 0 ? 0.3 : 1);
    musicDuck.gain.setTargetAtTime(target * 0.8, ac.currentTime, section === 'pause' ? 0.7 : 0.14);
  }
  function setSection(s) { section = s; updateDuck(); }
  function setSpeaking(on) { speaking = Math.max(0, speaking + (on ? 1 : -1)); updateDuck(); }
  function resetSpeaking() { speaking = 0; updateDuck(); }
  function setMuted(m) { muted = m; if (muteG) muteG.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.03); }
  function suspend() { if (ac) ac.suspend(); }
  function resume() { if (ac) ac.resume(); }
  function stream() { return recDest ? recDest.stream : null; }
  function ready() { return !!ac; }

  // ---- voices
  function tone(t, f, dur, { type = 'sine', gain = 0.1, a = 0.005, lp = 0, bus = musicIn, glideTo = 0, detune = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune;
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); node = f2; }
    node.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { type = 'bandpass', f = 2000, q = 1, gain = 0.1, a = 0.003, bus = musicIn, fTo = 0, pan = 0 } = {}) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (fTo) fl.frequency.exponentialRampToValueAtTime(fTo, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g);
    if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(bus); } else g.connect(bus);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  function pad(t, chord, dur, level) {
    chord.notes.forEach((n, i) => {
      [-6, 6].forEach(dt => tone(t, mtof(n), dur, { type: 'triangle', gain: level / (chord.notes.length), a: 0.5, lp: 1100, detune: dt }));
    });
  }

  function schedule() {
    if (!ac || ac.state !== 'running') { nextT = Math.max(nextT, ac ? ac.currentTime : 0); return; }
    while (nextT < ac.currentTime + 0.18) {
      step(stepN, nextT); stepN++; nextT += STEP;
    }
  }
  function step(n, t) {
    if (section === 'off' || frozenMusic) return;
    const s = n % 16, bar = Math.floor(n / 16), ch = CHORDS[bar % 4];
    const full = section === 'groove' || section === 'lift' || section === 'end';
    if (section === 'pause') { if (s === 0) pad(t, ch, STEP * 16, 0.5); return; }
    // soft kick on 1 and 3 (and a pickup on lift)
    if (s === 0 || s === 8 || (section === 'lift' && s === 14)) tone(t, 120, 0.22, { gain: 0.34, glideTo: 46, a: 0.002 });
    // shaker, off-beat accent
    if (s % 2 === 0) noise(t, 0.05, { type: 'highpass', f: 6500, gain: s % 4 === 2 ? 0.06 : 0.032 });
    if (section === 'lift' && s % 4 === 3) noise(t, 0.04, { type: 'highpass', f: 8000, gain: 0.03 });
    if (!full) return;
    // warm bass pluck
    if ([0, 3, 6, 10, 12].includes(s)) tone(t, mtof(ch.root + (s === 6 ? 12 : 0)), 0.32, { type: 'triangle', gain: 0.26, a: 0.008, lp: 700 });
    // marimba-ish pluck arpeggio
    const pat = section === 'lift' ? [0, 2, 3, 5, 6, 8, 10, 11, 13, 14] : [2, 5, 8, 11, 14];
    if (pat.includes(s)) {
      const k = pat.indexOf(s), note = ch.notes[(k * 2 + bar) % ch.notes.length] + (section === 'lift' && k % 3 === 2 ? 12 : 0);
      tone(t, mtof(note), 0.28, { type: 'sine', gain: 0.1, a: 0.004 });
      tone(t, mtof(note) * 2, 0.12, { type: 'sine', gain: 0.025, a: 0.003 });
    }
    if (s === 0) pad(t, ch, STEP * 16, section === 'lift' ? 0.34 : 0.22);
  }

  // ---- sound effects
  function swish(pan = 0) {
    if (!ac) return; const t = ac.currentTime;
    noise(t, 0.42, { f: 500, fTo: 3200, q: 0.9, gain: 0.16, a: 0.12, bus: sfxBus, pan });
    noise(t + 0.05, 0.3, { type: 'highpass', f: 3000, gain: 0.04, a: 0.1, bus: sfxBus });
  }
  function pop() { // soft speech-bubble appear
    if (!ac) return; const t = ac.currentTime;
    tone(t, 360, 0.12, { gain: 0.14, glideTo: 640, bus: sfxBus, a: 0.003 });
    noise(t, 0.04, { f: 2200, gain: 0.05, bus: sfxBus });
  }
  function recordStop() { // gentle "vinyl stop": falling tone + muffled music
    if (!ac) return; const t = ac.currentTime;
    frozenMusic = true; musicDuck.gain.cancelScheduledValues(t); musicDuck.gain.setTargetAtTime(0, t, 0.22);
    musicFilter.frequency.cancelScheduledValues(t); musicFilter.frequency.setValueAtTime(9000, t); musicFilter.frequency.exponentialRampToValueAtTime(260, t + 0.55);
    tone(t, 330, 0.62, { type: 'triangle', gain: 0.17, glideTo: 38, lp: 1500, bus: sfxBus, a: 0.01 });
    noise(t, 0.6, { type: 'lowpass', f: 900, fTo: 120, gain: 0.06, bus: sfxBus });
  }
  function resumeMusic() {
    if (!ac) return; const t = ac.currentTime;
    frozenMusic = false; musicFilter.frequency.cancelScheduledValues(t); musicFilter.frequency.setValueAtTime(900, t); musicFilter.frequency.exponentialRampToValueAtTime(9000, t + 0.8);
    nextT = Math.max(nextT, t + 0.02); stepN = Math.ceil(stepN / 16) * 16; updateDuck();
  }
  function pull() { // tactile removal: tiny suction + cork pop
    if (!ac) return; const t = ac.currentTime;
    noise(t, 0.22, { f: 600, fTo: 2400, q: 3, gain: 0.07, bus: sfxBus, a: 0.08 });
    tone(t + 0.24, 780, 0.1, { gain: 0.2, glideTo: 240, bus: sfxBus, a: 0.002 });
    noise(t + 0.24, 0.05, { f: 1900, q: 1.4, gain: 0.12, bus: sfxBus, a: 0.001 });
  }
  function dissolve() { // sparkly dust
    if (!ac) return; const t = ac.currentTime;
    [1760, 2349, 2794, 3520, 2637].forEach((f, i) => tone(t + i * 0.05, f, 0.2, { gain: 0.035, bus: sfxBus, a: 0.003 }));
  }
  function land() { // warm confirmation
    if (!ac) return; const t = ac.currentTime;
    [[523.25, 0], [659.25, 0.07], [783.99, 0.14]].forEach(([f, d]) => {
      tone(t + d, f, 0.7, { gain: 0.1, bus: sfxBus, a: 0.01 }); tone(t + d, f * 2, 0.35, { gain: 0.025, bus: sfxBus });
    });
    tone(t, 130, 0.25, { gain: 0.22, glideTo: 60, bus: sfxBus });
  }
  function chord() { // warm resolution chord (Fmaj9)
    if (!ac) return; const t = ac.currentTime;
    [53, 57, 60, 64, 67, 72].forEach((m, i) => {
      tone(t + i * 0.025, mtof(m), 2.4, { type: 'triangle', gain: 0.07, a: 0.04, lp: 2200, bus: sfxBus });
      tone(t + i * 0.025, mtof(m), 2.2, { type: 'sine', gain: 0.04, a: 0.05, bus: sfxBus });
    });
    tone(t, mtof(29), 2.2, { gain: 0.22, a: 0.03, bus: sfxBus });
  }
  function sparkle() {
    if (!ac) return; const t = ac.currentTime;
    [72, 76, 79, 83, 88].forEach((m, i) => tone(t + i * 0.06, mtof(m), 0.45, { gain: 0.045, bus: sfxBus, a: 0.004 }));
  }
  function finale() {
    if (!ac) return; const t = ac.currentTime;
    [53, 60, 64, 69, 72, 76].forEach((m, i) => {
      tone(t + i * 0.03, mtof(m), 2.2, { type: 'triangle', gain: 0.06, a: 0.03, lp: 2400, bus: sfxBus });
    });
    tone(t, mtof(29), 2.0, { gain: 0.2, a: 0.03, bus: sfxBus });
    sparkle();
  }
  function stopAll() { section = 'off'; frozenMusic = false; speaking = 0; if (ac) { musicFilter.frequency.setValueAtTime(9000, ac.currentTime); updateDuck(); } }

  return { init, setSection, setSpeaking, resetSpeaking, setMuted, suspend, resume, stream, ready, swish, pop, recordStop, resumeMusic, pull, dissolve, land, chord, sparkle, finale, stopAll, get ctx() { return ac; } };
})();
