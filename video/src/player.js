/* Browser preview player. Exports hook in via ?export=1 (see tools/export.js). */
(function () {
  const FE = (window.FE = window.FE || {});
  const $ = (id) => document.getElementById(id);
  const qs = new URLSearchParams(location.search);
  const cv = $('cv'), ctx = cv.getContext('2d');
  const MODES = ['Off', 'Captions', 'Captions + IPA'];
  let mode = 2;
  try { const s = localStorage.getItem('fe-cc-mode'); if (s != null && +s >= 0 && +s <= 2) mode = +s; } catch (_) { /* storage unavailable */ }
  if (qs.has('mode')) mode = +qs.get('mode');
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (_) { /* ignore */ } };
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (_) { return d; } };

  /* ---------- export hooks ---------- */
  window.__renderAt = (t, m) => { FE.render(ctx, t, { mode: m != null ? m : mode }); };
  window.__ready = () => FE.logoReady();
  window.__renderCover = () => FE.render(ctx, 7.0, { mode: 0, cover: true });
  if (qs.has('export')) { document.body.classList.add('export'); FE.render(ctx, 0, { mode }); window.__exportMode = true; return; }
  if (qs.has('t')) { const t = +qs.get('t'); const go = () => FE.render(ctx, t, { mode }); go(); FE.logoImg.addEventListener('load', go); window.__still = true; return; }

  /* ---------- state ---------- */
  let t = 0, playing = false, started = false, last = 0, session = 0, ended = false;
  let live = null; const spoken = new Set();
  const synth = window.speechSynthesis;
  let voices = [], chosen = { es: null, en: null }, rate = +load('fe-rate', 0.92);

  function refreshVoices() {
    voices = synth ? synth.getVoices() : [];
    const rank = (v, lang) => {
      const l = (v.lang || '').replace('_', '-').toLowerCase(); let s = 0;
      if (lang === 'es') { if (l === 'es-mx') s += 100; else if (l === 'es-419') s += 70; else if (l === 'es-us') s += 55; else if (l.startsWith('es')) s += 15; else return -1; if (/paulina|juan|sabina|raul|angelica|jorge|dalia|mónica|monica/i.test(v.name)) s += 8; }
      else { if (l === 'en-us') s += 100; else if (l.startsWith('en')) s += 20; else return -1; if (/aaron|alex|evan|guy|david|mark|daniel|fred|ryan|andrew|brian|tom/i.test(v.name)) s += 12; }
      if (v.localService) s += 40; if (/natural|neural|premium|enhanced/i.test(v.name)) s += 6;
      return s;
    };
    ['es', 'en'].forEach((lang) => {
      const sel = $('vo-' + lang), ranked = voices.map((v) => [rank(v, lang), v]).filter((x) => x[0] >= 0).sort((a, b) => b[0] - a[0]);
      sel.innerHTML = '';
      ranked.forEach(([, v]) => { const o = document.createElement('option'); o.value = v.voiceURI; o.textContent = `${v.name} (${v.lang})${v.localService ? '' : ' — online'}`; sel.appendChild(o); });
      const saved = load('fe-voice-' + lang, null);
      const pickV = ranked.find(([, v]) => v.voiceURI === saved) || ranked[0];
      chosen[lang] = pickV ? pickV[1] : null; if (pickV) sel.value = pickV[1].voiceURI;
    });
    const msg = [];
    msg.push(chosen.es ? `ES: ${chosen.es.name} (${chosen.es.lang})` : 'No Spanish voice found');
    msg.push(chosen.en ? `EN: ${chosen.en.name} (${chosen.en.lang})` : 'No English voice found');
    $('voiceStatus').textContent = msg.join(' · ') + (chosen.es && chosen.en ? '' : ' — the preview will play silently for missing voices.');
    $('voiceNote').textContent = 'Voices are your device’s own. If a chosen voice is “online”, your browser may send the text to its speech service. Timing varies by voice; the exported MP4 uses locally generated narration with verified timing.';
  }
  if (synth) { refreshVoices(); if (synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices); }
  ['es', 'en'].forEach((lang) => $('vo-' + lang).addEventListener('change', (e) => { chosen[lang] = voices.find((v) => v.voiceURI === e.target.value) || null; store('fe-voice-' + lang, e.target.value); }));
  $('rate').value = rate; $('rate').addEventListener('input', (e) => { rate = +e.target.value; store('fe-rate', rate); });

  function speak(q, sess) {
    if (!synth || sess !== session) return;
    const voice = chosen[q.lang]; if (!voice) return;
    const u = new SpeechSynthesisUtterance(q.text.replace(/INGLÉS/g, 'inglés').replace(/voz alta/, 'voz alta'));
    u.voice = voice; u.lang = voice.lang; u.rate = q.lang === 'en' ? Math.min(rate, 0.9) * 0.95 : rate; u.pitch = 1; u.volume = live ? live.levels.voice : 1;
    synth.speak(u);
  }
  function stopAll() { session++; if (synth) synth.cancel(); if (live) live.stop(); }

  /* ---------- transport ---------- */
  function ensureAudio() {
    if (!live) { try { live = new FE.AudioEngine.Live(); } catch (e) { live = null; console.warn('Web Audio unavailable', e); } }
    if (live && live.ctx.state === 'suspended') live.ctx.resume();
  }
  function play(fromT) {
    stopAll(); ensureAudio();
    t = fromT; ended = false; spoken.clear(); playing = true; last = performance.now(); started = true;
    // cues already in progress at resume time: re-speak if only just started, otherwise skip
    FE.CUES.forEach((q) => { const d = FE.VOICES ? FE.VOICES.cues[q.id].dur : 2.5; if (t > q.t + d * 0.45) spoken.add(q.id); });
    if (live) live.start(t);
    $('playBtn').textContent = '⏸ Pause';
  }
  function pause() { playing = false; stopAll(); $('playBtn').textContent = '▶ Resume'; }
  $('startBtn').addEventListener('click', () => { $('overlay').classList.add('hidden'); play(0); });
  $('playBtn').addEventListener('click', () => { if (!started) return; if (playing) pause(); else play(ended ? 0 : t); });
  $('replayBtn').addEventListener('click', () => { if (!started) { $('overlay').classList.add('hidden'); } play(0); });
  document.addEventListener('keydown', (e) => { if (e.code === 'Space' && started && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') { e.preventDefault(); $('playBtn').click(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) pause(); });
  ['voice', 'music', 'amb', 'sfx'].forEach((k) => $('lv-' + k).addEventListener('input', (e) => { if (!live) ensureAudio(); if (k === 'voice') { if (live) live.levels.voice = +e.target.value; } else if (live) live.setLevel(k, +e.target.value); store('fe-lv-' + k, e.target.value); }));
  ['voice', 'music', 'amb', 'sfx'].forEach((k) => { const v = load('fe-lv-' + k, null); if (v != null) $('lv-' + k).value = v; });

  function updateCC() { $('ccBtn').textContent = 'CC: ' + MODES[mode]; }
  $('ccBtn').addEventListener('click', () => { mode = (mode + 1) % 3; store('fe-cc-mode', mode); updateCC(); if (!playing) FE.render(ctx, t, { mode }); });
  updateCC();

  function frame(now) {
    if (playing) {
      t += (now - last) / 1000; last = now;
      if (t >= FE.DURATION) { t = FE.DURATION - 0.001; playing = false; ended = true; if (live) live.stop(); $('playBtn').textContent = '▶ Play again'; }
      FE.CUES.forEach((q) => { if (!spoken.has(q.id) && t >= q.t) { spoken.add(q.id); speak(q, session); } });
    }
    FE.render(ctx, t, { mode });
    $('clock').textContent = t.toFixed(1) + ' / ' + FE.DURATION.toFixed(1) + ' s';
    requestAnimationFrame(frame);
  }
  FE.logoImg.addEventListener('load', () => FE.render(ctx, 0, { mode }));
  FE.render(ctx, 0, { mode });
  requestAnimationFrame((n) => { last = n; frame(n); });
  window.__fe = { get live() { return live; }, get t() { return t; }, get playing() { return playing; }, play, pause, get session() { return session; } };
})();
