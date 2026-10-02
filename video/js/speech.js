/* Browser speech synthesis: async voice loading, best-voice picking, user override.
 * Quality depends entirely on the voices installed on the viewer's device. */
window.FE = window.FE || {};

(function (FE) {
  const synth = window.speechSynthesis || null;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  const S = {
    supported: !!(synth && window.SpeechSynthesisUtterance),
    voices: [],
    pref: { es: store.get("fe.voice.es") || "auto", en: store.get("fe.voice.en") || "auto" },
    listeners: [],
    keep: [], // hold references: some browsers garbage-collect utterances and never fire onend
    active: null,
  };

  const norm = (l) => (l || "").replace("_", "-").toLowerCase();

  function scoreVoice(v, lang) {
    const l = norm(v.lang), n = v.name || "";
    let s = 0;
    if (lang === "es") {
      if (!l.startsWith("es")) return -1000;
      if (l === "es-mx") s += 30; else if (l === "es-us" || l === "es-419") s += 26;
      else if (l === "es-es") s += 10; else s += 6;
      if (/paulina|dalia|jorge|juan|sabina|diego|angelica|paloma|jesus|mónica|monica|elvira|alvaro|helena/i.test(n)) s += 6;
    } else {
      if (!l.startsWith("en")) return -1000;
      if (l === "en-us") s += 30; else if (l === "en-gb") s += 6; else s += 3;
      if (/aria|jenny|guy|davis|christopher|michelle|eric|roger|ana\b|samantha|ava\b|allison|evan|nathan|zoe|joelle|noelle|tom\b|alex|nicky/i.test(n)) s += 6;
    }
    if (/natural|neural|online/i.test(n)) s += 22;
    if (/premium|enhanced|siri/i.test(n)) s += 16;
    if (/google/i.test(n)) s += 9;
    if (/espeak|compact|eloquence|novelty|bad news|bahh|bells|boing|cellos|deranged|good news|hysterical|pipe organ|trinoids|whisper|zarvox|albert|fred|junior|kathy|ralph|organ/i.test(n)) s -= 60;
    if (v.localService) s += 2;
    return s;
  }

  S.refresh = function () {
    if (!S.supported) return;
    S.voices = synth.getVoices() || [];
    S.listeners.forEach((f) => f());
  };
  S.onChange = (f) => S.listeners.push(f);

  S.listFor = (lang) =>
    S.voices
      .filter((v) => norm(v.lang).startsWith(lang))
      .sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));

  S.voiceFor = function (lang) {
    const list = S.listFor(lang);
    if (S.pref[lang] && S.pref[lang] !== "auto") {
      const f = list.find((v) => v.voiceURI === S.pref[lang] || v.name === S.pref[lang]);
      if (f) return f;
    }
    return list[0] || null;
  };
  S.setPref = function (lang, id) { S.pref[lang] = id; store.set("fe.voice." + lang, id); };
  S.has = (lang) => !!S.voiceFor(lang);

  // Resolves once voices have loaded (or after a timeout — some browsers never report any).
  S.ready = function () {
    return new Promise((res) => {
      if (!S.supported) return res();
      S.refresh();
      if (S.voices.length) return res();
      let done = false;
      const fin = () => { if (!done) { done = true; S.refresh(); res(); } };
      try { synth.addEventListener("voiceschanged", () => { S.refresh(); if (S.voices.length) fin(); }); } catch (e) {}
      setTimeout(fin, 1800);
    });
  };
  if (S.supported) {
    try { synth.addEventListener("voiceschanged", S.refresh); } catch (e) {}
    S.refresh();
  }

  // Must be called from a user gesture (Start): primes engines (iOS/Safari) with a silent utterance.
  S.unlock = function () {
    if (!S.supported) return;
    try {
      const u = new SpeechSynthesisUtterance(" "); u.volume = 0; synth.speak(u);
    } catch (e) {}
  };

  // Speak one segment. Returns a handle {cancel}. Callbacks fire at most once.
  S.speak = function (seg, cb) {
    const u = new SpeechSynthesisUtterance(seg.text);
    const v = S.voiceFor(seg.lang);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = seg.lang === "es" ? "es-MX" : "en-US";
    u.rate = Math.min(1.6, Math.max(0.5, (seg.rate || 1) * (S.rateScale || 1)));
    u.pitch = 1; u.volume = 1;
    let done = false;
    const fin = () => { if (done) return; done = true; S.keep = S.keep.filter((x) => x !== u); cb.end && cb.end(); };
    u.onstart = () => cb.start && cb.start();
    u.onend = fin; u.onerror = fin;
    S.keep.push(u);
    const h = { cancel() { try { synth.cancel(); } catch (e) {} fin(); } };
    S.active = h;
    try { synth.speak(u); } catch (e) { fin(); }
    return h;
  };
  S.cancelAll = function () {
    if (!S.supported) return;
    try { synth.cancel(); } catch (e) {}
    S.keep = []; S.active = null;
  };
  S.pause = function () { if (S.supported) try { synth.pause(); } catch (e) {} };
  S.resume = function () { if (S.supported) try { synth.resume(); } catch (e) {} };

  FE.Speech = S;
})(window.FE);
