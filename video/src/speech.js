/* ===== Browser speech synthesis, controlled in code. Voice quality depends on the device. ===== */
const Speech = (() => {
  const ok = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voices = [], pending = new Set(), keep = [];
  const sel = { es: null, en: null };           // chosen voice names ('' = automatic)
  const state = { silent: false, muted: false }; // silent: simulate timing only (used for export)
  const MALE_HINT = /\b(guy|davis|aaron|alex|daniel|fred|tom|david|mark|eric|roger|christopher|brian|andrew|ryan|jorge|diego|juan|carlos|male|jason|james|arthur|gordon|thomas|lee)\b/i;
  const QUALITY = /natural|online|neural|premium|enhanced|siri|wavenet/i;

  function score(v, lang) {
    const l = v.lang.replace('_', '-');
    let s = 0;
    if (lang === 'es') s = l === 'es-MX' ? 100 : l === 'es-US' ? 80 : l === 'es-419' ? 75 : l.startsWith('es') ? 50 : -1000;
    else s = l === 'en-US' ? 100 : l.startsWith('en') ? 30 : -1000;
    if (QUALITY.test(v.name)) s += 25;
    if (/google/i.test(v.name)) s += 8;
    if (lang === 'en' && MALE_HINT.test(v.name)) s += 12;   // the on-screen speaker is a man
    if (lang === 'es' && /(jorge|juan|diego|carlos|male)/i.test(v.name)) s += 4;
    if (/compact|novelty|whisper|bad|good news|bubbles|cellos|zarvox|trinoids|organ|bells|boing/i.test(v.name)) s -= 200;
    return s;
  }
  function best(lang) {
    const name = sel[lang];
    if (name) { const v = voices.find(x => x.name === name); if (v) return v; }
    const ranked = voices.map(v => [score(v, lang), v]).filter(x => x[0] > -500).sort((a, b) => b[0] - a[0]);
    return ranked.length ? ranked[0][1] : null;
  }
  function fillSelect(el, lang) {
    const list = voices.filter(v => score(v, lang) > -500).sort((a, b) => score(b, lang) - score(a, lang));
    const prev = sel[lang] ?? store.get('voice.' + lang, '');
    el.innerHTML = '';
    const auto = document.createElement('option'); auto.value = ''; auto.textContent = list.length ? 'Automática (mejor disponible)' : 'Sin voz disponible'; el.appendChild(auto);
    list.forEach(v => { const o = document.createElement('option'); o.value = v.name; o.textContent = `${v.name} (${v.lang})`; el.appendChild(o); });
    el.value = list.some(v => v.name === prev) ? prev : '';
    sel[lang] = el.value;
  }
  function refresh(esEl, enEl, warnEl) {
    if (!ok) { warnEl.textContent = 'Este navegador no ofrece síntesis de voz: la animación avanza con tiempos estimados y sin narración.'; return; }
    voices = speechSynthesis.getVoices();
    fillSelect(esEl, 'es'); fillSelect(enEl, 'en');
    const w = [];
    if (!voices.length) w.push('Cargando voces del dispositivo…');
    else {
      if (!voices.some(v => v.lang.replace('_', '-').startsWith('es'))) w.push('No hay voz en español en este dispositivo; se usará la voz por defecto (puede sonar poco natural).');
      if (!voices.some(v => v.lang.replace('_', '-') === 'en-US')) w.push('No hay voz en inglés americano (en-US); se usará la mejor voz en inglés disponible.');
      w.push('La calidad y naturalidad de las voces dependen del dispositivo y del navegador; no todas suenan igual de natural.');
    }
    warnEl.textContent = w.join(' ');
  }
  function load(esEl, enEl, warnEl, onChange) {
    refresh(esEl, enEl, warnEl);
    if (ok) {
      speechSynthesis.onvoiceschanged = () => refresh(esEl, enEl, warnEl);
      let n = 0; const iv = setInterval(() => { if (voices.length || ++n > 24) clearInterval(iv); else refresh(esEl, enEl, warnEl); }, 250);
    }
    esEl.onchange = () => { sel.es = esEl.value; store.set('voice.es', esEl.value); onChange && onChange(); };
    enEl.onchange = () => { sel.en = enEl.value; store.set('voice.en', enEl.value); onChange && onChange(); };
  }
  function prime() { // unlock speech on iOS/Safari inside the Start gesture
    if (!ok) return; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) { }
  }
  function cancel() {
    if (ok) try { speechSynthesis.cancel(); } catch (e) { }
    const p = [...pending]; pending.clear(); keep = []; p.forEach(r => r.rej(CANCEL));
  }
  function pause() { if (ok) try { speechSynthesis.pause(); } catch (e) { } }
  function resume() { if (ok) try { speechSynthesis.resume(); } catch (e) { } }

  /* Speak one phrase. Resolves when it has finished (or its estimated time has elapsed). */
  function seg(s, hooks = {}) {
    return new Promise((res, rej) => {
      const rec = { rej }; pending.add(rec);
      let done = false, simulated = false;
      const finish = () => { if (done) return; done = true; pending.delete(rec); hooks.end && hooks.end(); res(); };
      const simulate = () => { if (simulated || done) return; simulated = true; hooks.start && hooks.start(); Clock.sleep(s.d).then(finish, () => { }); };
      const v = state.silent || !ok ? null : best(s.l);
      if (!v) { simulate(); return; }
      const u = new SpeechSynthesisUtterance(s.t);
      u.voice = v; u.lang = v.lang; u.rate = s.l === 'es' ? 1.0 : 0.93; u.pitch = s.l === 'en' ? 0.96 : 1; u.volume = state.muted ? 0 : 1;
      let started = false;
      u.onstart = () => { started = true; hooks.start && hooks.start(); };
      u.onend = finish;
      u.onerror = e => { if (e.error === 'canceled' || e.error === 'interrupted') return; simulate(); };
      keep.push(u);
      Clock.sleep(2800).then(() => { if (!started && !done) { try { speechSynthesis.cancel(); } catch (e) { } simulate(); } }, () => { });
      Clock.sleep(s.d * 2.4 + 3500).then(() => { if (!done) { try { speechSynthesis.cancel(); } catch (e) { } finish(); } }, () => { });
      try { speechSynthesis.speak(u); } catch (e) { simulate(); }
    });
  }
  /* A sequence of phrases (possibly mixing es/en voices) with short natural gaps. */
  async function say(segs, hooks = {}) {
    for (let i = 0; i < segs.length; i++) {
      await seg(segs[i], { start: () => hooks.segStart && hooks.segStart(segs[i], i), end: () => hooks.segEnd && hooks.segEnd(segs[i], i) });
      if (i < segs.length - 1) await Clock.sleep(segs[i].gap ?? 70);
    }
  }
  return { ok, state, load, prime, cancel, pause, resume, say, best, get voices() { return voices; } };
})();
