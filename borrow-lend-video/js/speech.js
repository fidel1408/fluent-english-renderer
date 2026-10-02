/* Fluent English – speech controller (Web Speech API, browser/device voices only).
   Picks the best available voices, lets the user override them, speaks language-tagged segments one after another,
   never overlaps, and can be cancelled instantly. Quality depends entirely on the voices installed on this device. */
(function () {
  const FE = (window.FE = window.FE || {});
  const synth = window.speechSynthesis;

  const BAD = /eSpeak|espeak|Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Junior|Kathy|Organ|Princess|Ralph|Trinoids|Whisper|Wobble|Zarvox|Fred|Superstar/i;
  function scoreEn(v) {
    let s = 0; const l = v.lang.replace("_", "-");
    if (/^en-US$/i.test(l)) s += 100; else if (/^en/i.test(l)) s += 30; else return -999;
    if (/Natural|Neural|Online|Premium|Enhanced/i.test(v.name)) s += 60;
    if (/Google US English/i.test(v.name)) s += 40;
    if (/Samantha|Ava|Allison|Susan|Zira|Aria|Jenny|Guy|Siri|Evan|Nicky|Joelle|Noelle|Tom\b|Alex\b/i.test(v.name)) s += 25;
    if (v.localService) s += 5;
    if (/Compact/i.test(v.name)) s -= 10;
    if (BAD.test(v.name)) s -= 200;
    return s;
  }
  function scoreEs(v) {
    let s = 0; const l = v.lang.replace("_", "-");
    if (/^es-MX$/i.test(l)) s += 120; else if (/^es-US$/i.test(l)) s += 100; else if (/^es-419$/i.test(l)) s += 95;
    else if (/^es/i.test(l)) s += 45; else return -999;
    if (/Natural|Neural|Online|Premium|Enhanced/i.test(v.name)) s += 60;
    if (/Google espa/i.test(v.name)) s += 30;
    if (/Paulina|Juan|Sabina|Dalia|Jorge|Mónica|Monica|Angelica|Paola|Siri|Diego|Carlos|Marisol|Jimena/i.test(v.name)) s += 25;
    if (v.localService) s += 5;
    if (/Compact/i.test(v.name)) s -= 10;
    if (BAD.test(v.name)) s -= 200;
    return s;
  }

  const Speech = (FE.Speech = {
    supported: !!synth, voices: [], es: null, en: null, esPick: "auto", enPick: "auto", muted: false, token: 0, current: null,
    rate: { es: 0.98, en: 0.92 },
    _listeners: [],
    onChange(fn) { this._listeners.push(fn); },
    /* Voice lists load asynchronously and sometimes arrive late (Chrome) – poll + listen for up to ~4 s. */
    load() {
      if (!synth) return Promise.resolve([]);
      const self = this;
      return new Promise((resolve) => {
        const grab = () => { const v = synth.getVoices(); if (v && v.length) { self.voices = v.slice(); self._choose(); return true; } return false; };
        if (grab()) { resolve(self.voices); }
        let tries = 0;
        const iv = setInterval(() => { tries++; if (grab() || tries > 16) { clearInterval(iv); resolve(self.voices); self._listeners.forEach((f) => f()); } }, 250);
        synth.addEventListener && synth.addEventListener("voiceschanged", () => { grab(); self._listeners.forEach((f) => f()); });
        setTimeout(() => resolve(self.voices), 4200);
      });
    },
    _choose() {
      const best = (fn) => this.voices.map((v) => [fn(v), v]).filter((x) => x[0] > 0).sort((a, b) => b[0] - a[0]);
      this.rankedEs = best(scoreEs).map((x) => x[1]); this.rankedEn = best(scoreEn).map((x) => x[1]);
      const pick = (list, uri) => (uri && uri !== "auto" && list.find((v) => v.voiceURI === uri)) || list[0] || null;
      this.es = pick(this.rankedEs, this.esPick); this.en = pick(this.rankedEn, this.enPick);
    },
    setPick(kind, uri) { this[kind + "Pick"] = uri; this._choose(); },
    estimate(segs) { return FE.estimateSpeech(segs); },
    cancel() { this.token++; this.current = null; try { synth && synth.cancel(); } catch (e) { /* ignore */ } },
    setMuted(m) { this.muted = m; if (m && this.current && synth) { try { synth.cancel(); } catch (e) { /* ignore */ } } },

    /* Speaks segments in order. Resolves with {duration, spoken} when finished or cancelled. Never rejects. */
    speak(segs, hooks) {
      const self = this, my = ++this.token, t0 = performance.now();
      hooks = hooks || {};
      return new Promise(async (resolve) => {
        const finish = (spoken) => { if (self.token === my) self.current = null; resolve({ duration: (performance.now() - t0) / 1000, spoken, cancelled: self.token !== my }); };
        self.current = { token: my };
        if (hooks.onStart) hooks.onStart();
        for (let i = 0; i < segs.length; i++) {
          if (self.token !== my) return finish(false);
          const seg = segs[i], voice = seg.lang === "es" ? self.es : self.en;
          const est = 0.28 + seg.text.length * 0.062;
          await new Promise((done) => {
            if (!synth || !voice || self.muted) { setTimeout(done, est * 1000); return; } // silent but time-faithful
            const u = new SpeechSynthesisUtterance(seg.text);
            u.voice = voice; u.lang = voice.lang; u.rate = self.rate[seg.lang]; u.pitch = 1; u.volume = 1;
            let over = false; const end = () => { if (!over) { over = true; clearTimeout(wd); done(); } };
            const wd = setTimeout(end, (est * 2.2 + 2) * 1000); // Chrome sometimes never fires onend
            u.onend = end;
            u.onerror = () => { if (self.token === my && self.muted) setTimeout(end, est * 600); else end(); };
            try { synth.speak(u); } catch (e) { end(); }
          });
          if (i < segs.length - 1) await new Promise((r) => setTimeout(r, FE.GAP * 1000));
        }
        finish(true);
      });
    },
    /* Warm-up inside the Start click so iOS/Safari allow later speech. */
    unlock() { if (!synth) return; try { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; synth.speak(u); } catch (e) { /* ignore */ } },
  });
})();
