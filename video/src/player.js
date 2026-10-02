/* Live preview engine: beat-driven timeline synchronised to real speech, plus UI wiring. */
(function () {
  const FE = (window.FE = window.FE || {});
  const $ = (id) => document.getElementById(id);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const BEATS = FE.BEATS;
  const CC_LABELS = ['CC: Off', 'CC: Captions', 'CC: Captions + IPA'];

  const run = {
    state: 'idle',        // idle | playing | paused | ended
    clock: 0, idx: -1, phase: 'none', phaseT0: 0, beats: {},
    spoken: false, speechStart: false, speechHandle: null, spokenAt: 0, voiceProblem: false,
    audio: null, ctx: null, muted: store.get('fe_mute', '0') === '1',
    cc: parseInt(store.get('fe_cc', '2'), 10),
    sfxDone: {},
  };
  if (!(run.cc >= 0 && run.cc <= 2)) run.cc = 2;
  FE.run = run;

  let canvas, g, statusEl;

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

  /* ---------- audio lifecycle ---------- */
  function newAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const a = FE.createAudio(ctx);
    a.setMuted(run.muted);
    run.ctx = ctx; run.audio = a;
    a.scheduleMusic(ctx.currentTime + 0.08, 52);
    return a;
  }
  function killAudio() {
    if (run.ctx) { try { run.ctx.close(); } catch (e) { /* already closed */ } }
    run.ctx = null; run.audio = null;
  }

  /* ---------- timeline ---------- */
  function resetRun() {
    FE.Speech.stop();
    run.clock = 0; run.idx = -1; run.phase = 'none'; run.beats = {}; run.spoken = false;
    run.speechStart = false; run.speechHandle = null; run.voiceProblem = false; run.sfxDone = {};
  }

  function startBeat(i) {
    run.idx = i; const b = BEATS[i];
    run.beats[b.k] = { s: run.clock, say0: null, say1: null, end: null, est: b.say ? FE.Speech.estimate(b.say.text, b.say.lang) : 0 };
    run.phase = b.wait ? 'wait' : 'pre'; run.phaseT0 = run.clock;
    // sound effects keyed to this beat
    if (run.audio) {
      FE.SFX.filter((e) => e.beat === b.k).forEach((e) => run.audio.sfx(e.fx, run.ctx.currentTime + e.at, e));
      if (b.wait) run.audio.duckTo(FE.DUCK.silence, run.ctx.currentTime, 0.25);
    }
    setStatus(`Beat ${i + 1}/${BEATS.length}: ${b.k}`);
  }

  function beginSpeech(b) {
    const mark = run.beats[b.k];
    run.phase = 'speaking'; run.phaseT0 = run.clock; mark.say0 = run.clock;
    run.spoken = false; run.speechStart = false;
    if (run.audio) run.audio.duckTo(FE.DUCK.speech, run.ctx.currentTime, 0.08);
    if (run.muted || !FE.Speech.supported) { run.fallback = true; return; }
    run.fallback = false;
    run.speechHandle = FE.Speech.speak(b.say.lang, b.say.text, {
      onstart() { run.speechStart = true; mark.say0 = run.clock; },
      onend() { run.spoken = true; },
      onfail() { run.voiceProblem = true; run.fallback = true; },
    });
  }

  function endSpeech(b) {
    const mark = run.beats[b.k];
    mark.say1 = run.clock; run.phase = 'post'; run.phaseT0 = run.clock;
    if (run.audio) run.audio.duckTo(FE.DUCK.open, run.ctx.currentTime + 0.05, 0.25);
  }

  function tick(dt) {
    if (run.state !== 'playing') return;
    run.clock += dt;
    const b = BEATS[run.idx];
    if (!b) return;
    const mark = run.beats[b.k];
    if (run.phase === 'wait') {
      if (run.clock - run.phaseT0 >= b.wait) {
        mark.end = run.clock;
        if (run.audio) run.audio.duckTo(FE.DUCK.open, run.ctx.currentTime, 0.3);
        next();
      }
    } else if (run.phase === 'pre') {
      if (run.clock - run.phaseT0 >= (b.pre || 0)) { if (b.say) beginSpeech(b); else next(); }
    } else if (run.phase === 'speaking') {
      const el = run.clock - run.phaseT0;
      const est = mark.est;
      // fall back to a timed beat if the browser never starts the voice, or the voice is muted/unavailable
      if (!run.speechStart && !run.fallback && el > 2.5) { run.fallback = true; run.voiceProblem = true; FE.Speech.stop(); }
      let done = run.spoken;
      if (run.fallback && el >= est) done = true;
      if (el > est * 3 + 6) done = true; // safety net: onend never fired
      if (done) endSpeech(b);
    } else if (run.phase === 'post') {
      if (run.clock - run.phaseT0 >= (b.post || 0)) { mark.end = run.clock; next(); }
    }
  }

  function next() {
    if (run.idx + 1 < BEATS.length) startBeat(run.idx + 1);
    else finish();
  }

  function finish() {
    run.state = 'ended'; run.phase = 'done';
    if (run.audio && run.ctx) { run.audio.fadeOut(run.ctx.currentTime + 0.1, 1.0); }
    setStatus(run.voiceProblem ? 'Done (no browser voice was available — timing used silent fallback)' : 'Done — press Replay to watch again');
    syncButtons();
  }

  /* ---------- transport ---------- */
  async function start() {
    if (run.state === 'paused') return resume();
    if (run.state === 'playing') return;
    resetRun(); killAudio();
    newAudio();
    if (run.ctx && run.ctx.state === 'suspended') { try { await run.ctx.resume(); } catch (e) { /* needs gesture */ } }
    run.state = 'playing'; startBeat(0); syncButtons();
  }
  function pause() {
    if (run.state !== 'playing') return;
    run.state = 'paused'; FE.Speech.pause();
    if (run.ctx) run.ctx.suspend();
    setStatus('Paused'); syncButtons();
  }
  function resume() {
    if (run.state !== 'paused') return;
    run.state = 'playing'; FE.Speech.resume();
    if (run.ctx) run.ctx.resume();
    setStatus('Playing'); syncButtons();
  }
  function stop() {
    FE.Speech.stop(); killAudio(); resetRun(); run.state = 'idle'; syncButtons(); setStatus('Stopped');
  }
  async function replay() { stop(); await start(); }

  function setMuted(m) {
    run.muted = m; store.set('fe_mute', m ? '1' : '0');
    if (run.audio) run.audio.setMuted(m);
    if (m) FE.Speech.stop(); // drop any queued/ongoing speech; the beat finishes on its estimated length
    $('btnMute').textContent = m ? 'Unmute' : 'Mute';
    $('btnMute').setAttribute('aria-pressed', String(m));
  }
  function setCC(n) {
    run.cc = n; store.set('fe_cc', String(n));
    $('btnCC').textContent = CC_LABELS[n];
    document.querySelectorAll('[data-cc]').forEach((el) => el.setAttribute('aria-checked', String(+el.dataset.cc === n)));
  }

  function syncButtons() {
    const s = run.state;
    $('btnStart').textContent = s === 'paused' ? 'Resume' : s === 'ended' ? 'Start again' : 'Start';
    $('btnStart').disabled = s === 'playing';
    $('btnPause').disabled = s !== 'playing';
    $('btnReplay').disabled = s === 'idle';
  }

  /* ---------- voices UI ---------- */
  function fillVoices() {
    ['es', 'en'].forEach((lang) => {
      const sel = $('voice_' + lang); sel.innerHTML = '';
      const list = FE.Speech.ranked(lang);
      const saved = store.get('fe_voice_' + lang, '');
      if (!list.length) {
        const o = document.createElement('option'); o.textContent = 'No ' + (lang === 'es' ? 'Spanish' : 'English') + ' voice found — timing will use a silent fallback'; sel.appendChild(o); sel.disabled = true; return;
      }
      sel.disabled = false;
      list.forEach((v) => { const o = document.createElement('option'); o.value = v.voiceURI; o.textContent = `${v.name} (${v.lang})`; sel.appendChild(o); });
      const pick = list.find((v) => v.voiceURI === saved) ? saved : list[0].voiceURI;
      sel.value = pick; FE.Speech.setVoice(lang, pick);
    });
  }

  function previewVoice(lang) {
    FE.Speech.stop();
    FE.Speech.speak(lang, lang === 'es' ? 'Hola, así suena esta voz.' : "I'll have two tacos, please.", {});
  }

  /* ---------- frame loop ---------- */
  function frame(now) {
    const dt = Math.min(0.1, (now - (frame.last || now)) / 1000); frame.last = now;
    tick(dt);
    if (run.state === 'idle') FE.Scenes.cover(g);
    else FE.Scenes.render(g, { t: run.clock, beats: run.beats, cc: run.cc });
    const clockEl = $('clock'); if (clockEl) clockEl.textContent = run.state === 'idle' ? '0.0 s' : run.clock.toFixed(1) + ' s';
    requestAnimationFrame(frame);
  }

  function fit() {
    const stage = $('stage'); const rect = stage.getBoundingClientRect();
    const maxH = Math.min(window.innerHeight - 24, rect.width * 16 / 9);
    canvas.style.height = maxH + 'px'; canvas.style.width = (maxH * 9 / 16) + 'px';
  }

  async function boot() {
    canvas = $('cv'); g = canvas.getContext('2d'); statusEl = $('status');
    canvas.width = FE.W; canvas.height = FE.H;
    try { await Promise.all(['600 100px FEHead', '700 100px FEHead', '700 40px FEBody', '400 40px FEIPA'].map((f) => document.fonts.load(f, 'Aa ɑ'))); } catch (e) { /* fall back to system fonts */ }
    await FE.Scenes.loadAssets('');
    setCC(run.cc); setMuted(run.muted);
    $('btnStart').onclick = start; $('btnPause').onclick = pause; $('btnReplay').onclick = replay;
    $('btnMute').onclick = () => setMuted(!run.muted);
    $('btnCC').onclick = () => setCC((run.cc + 1) % 3);
    document.querySelectorAll('[data-cc]').forEach((el) => { el.onclick = () => setCC(+el.dataset.cc); });
    $('voice_es').onchange = (e) => { store.set('fe_voice_es', e.target.value); FE.Speech.setVoice('es', e.target.value); };
    $('voice_en').onchange = (e) => { store.set('fe_voice_en', e.target.value); FE.Speech.setVoice('en', e.target.value); };
    $('test_es').onclick = () => previewVoice('es'); $('test_en').onclick = () => previewVoice('en');
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
      if (e.code === 'Space') { e.preventDefault(); run.state === 'playing' ? pause() : start(); }
    });
    window.addEventListener('resize', fit); fit(); syncButtons();
    if (!FE.Speech.supported) setStatus('This browser has no speech synthesis — the video will play with music/effects and silent timing.');
    FE.Speech.init().then(() => { fillVoices(); if (!FE.Speech.voices.length) setStatus('No speech voices reported by this browser/device yet. You can still press Start.'); else setStatus('Ready. Press Start (this unlocks audio).'); });
    requestAnimationFrame(frame);
  }
  FE.boot = boot;
  window.addEventListener('DOMContentLoaded', () => { if (!/[?&]export=1/.test(location.search)) boot(); });
})();
