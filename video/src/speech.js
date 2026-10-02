/* Browser speech synthesis wrapper: async voice loading, best-voice picking,
 * stale-callback protection and queue clearing. No keys, no recordings. */
(function () {
  const FE = (window.FE = window.FE || {});
  const synth = window.speechSynthesis;
  const keep = []; // hold references so Chrome does not garbage-collect utterances mid-speech
  let voices = [];
  let token = 0;
  const chosen = { es: null, en: null };

  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|princess/i;
  const QUALITY = /natural|neural|online|premium|enhanced|siri|google|studio|wavenet/i;

  function score(v, lang) {
    const l = (v.lang || '').replace('_', '-').toLowerCase();
    let s = 0;
    if (lang === 'es') {
      if (!l.startsWith('es')) return -1;
      s = l === 'es-mx' ? 50 : l === 'es-us' || l === 'es-419' ? 42 : l === 'es-es' ? 26 : 18;
    } else {
      if (!l.startsWith('en')) return -1;
      s = l === 'en-us' ? 50 : l === 'en-gb' ? 16 : 8;
    }
    if (/natural|neural|online|studio|wavenet/i.test(v.name)) s += 34;
    else if (/premium|enhanced/i.test(v.name)) s += 28;
    else if (/google/i.test(v.name)) s += 20;
    else if (/siri/i.test(v.name)) s += 24;
    if (NOVELTY.test(v.name)) s -= 40;
    if (v.localService) s += 2;
    return s;
  }

  function loadVoices() {
    if (!synth) return [];
    voices = synth.getVoices() || [];
    return voices;
  }

  FE.Speech = {
    supported: !!synth,
    get voices() { return voices; },
    get chosen() { return chosen; },

    /** Resolves once voices are available (or after a timeout — some browsers have none). */
    init() {
      return new Promise((resolve) => {
        if (!synth) return resolve([]);
        let done = false;
        const finish = () => { if (done) return; done = true; resolve(loadVoices()); };
        if (loadVoices().length) return finish();
        synth.addEventListener('voiceschanged', () => { loadVoices(); finish(); }, { once: false });
        let tries = 0;
        const poll = setInterval(() => {
          if (loadVoices().length || ++tries > 20) { clearInterval(poll); finish(); }
        }, 150);
      });
    },

    ranked(lang) {
      return voices.map((v) => ({ v, s: score(v, lang) })).filter((x) => x.s >= 0)
        .sort((a, b) => b.s - a.s).map((x) => x.v);
    },

    autoPick(lang) { return (this.ranked(lang)[0]) || null; },

    setVoice(lang, voiceURI) {
      chosen[lang] = voices.find((v) => v.voiceURI === voiceURI) || this.autoPick(lang);
      return chosen[lang];
    },

    voiceFor(lang) { return chosen[lang] || this.autoPick(lang); },

    /** Rough duration estimate (s) — used when no voice exists or events never fire. */
    estimate(text, lang) {
      const words = text.trim().split(/\s+/).length;
      return Math.max(0.9, words * (lang === 'es' ? 0.36 : 0.42) + 0.3);
    },

    /** Speak one utterance. Returns {cancel}. callbacks fire only if still current. */
    speak(lang, text, cb) {
      cb = cb || {};
      if (!synth) { cb.onfail && cb.onfail('unsupported'); return { cancel() {} }; }
      const my = ++token;
      const u = new SpeechSynthesisUtterance(text.replace(/…/g, '...'));
      const v = this.voiceFor(lang);
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = lang === 'es' ? 'es-MX' : 'en-US'; }
      u.rate = lang === 'es' ? 1.0 : 0.92;
      u.pitch = 1; u.volume = 1;
      keep.push(u); if (keep.length > 8) keep.shift();
      u.onstart = () => { if (my === token) cb.onstart && cb.onstart(); };
      u.onend = () => { if (my === token) cb.onend && cb.onend(); };
      u.onerror = (e) => {
        if (my !== token) return;
        if (e && (e.error === 'canceled' || e.error === 'interrupted')) return;
        cb.onfail && cb.onfail(e && e.error);
      };
      u.onboundary = (e) => { if (my === token && e.name === 'word') cb.onboundary && cb.onboundary(e.charIndex); };
      synth.speak(u);
      return { cancel: () => { if (my === token) token++; synth.cancel(); } };
    },

    /** Stop everything and drop queued utterances. */
    stop() { token++; if (synth) { synth.cancel(); } },
    pause() { if (synth) synth.pause(); },
    resume() { if (synth) synth.resume(); },
  };
})();
