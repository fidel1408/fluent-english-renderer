/* Pausable clock + browser speech synthesis controller (no external services). */
const ABORT = { aborted: true };

const Clock = {
  t: 0, paused: false, timers: [],
  reset() { this.t = 0; this.paused = false; this.abortAll(); },
  abortAll() { const ts = this.timers; this.timers = []; ts.forEach(x => x.rej(ABORT)); },
  tick(dt) {
    if (this.paused) return;
    this.t += dt;
    const due = this.timers.filter(x => x.at <= this.t || (x.poll && x.poll()));
    if (due.length) { this.timers = this.timers.filter(x => !due.includes(x)); due.forEach(x => x.res()); }
  },
  wait(sec) { return new Promise((res, rej) => this.timers.push({ at: this.t + sec, res, rej })); },
  after(sec, fn) { this.wait(sec).then(fn, () => {}); },
};

const Speech = (() => {
  const synth = window.speechSynthesis || null;
  let voices = [], sel = { es: null, en: null }, muted = false, current = null;
  const BASE_RATE = { es: 1.0, en: 0.95 };
  let speed = +(localStorage.getItem('fe_speed') || 1);
  const rate = k => BASE_RATE[k] * speed;
  const ROLE = { es: { lang: 'es', gender: 'f' }, en: { lang: 'en', gender: 'm' } };  // narrator = female, on-screen man = male
  const LANG = { es: 'es-MX', en: 'en-US' };
  const GOOD = /natural|neural|online|premium|enhanced|siri/i;
  // Browsers do not expose gender, so it is inferred from well-known voice names.
  const MALE = /\b(jorge|juan|diego|alvaro|álvaro|alonso|pablo|raul|raúl|carlos|miguel|gonzalo|tomas|tomás|jesus|jesús|enrique|arnau|ricardo|david|mark|guy|davis|jason|tony|andrew|brian|christopher|eric|roger|steffan|alex|daniel|tom|fred|aaron|arthur|evan|gordon|oliver|rishi|reed|male|ryan|william|liam|james|thomas|george|luca)\b/i;
  const FEMALE = /\b(dalia|elvira|paloma|salome|salomé|sabina|helena|laura|lucia|lucía|paulina|monica|mónica|marisol|esperanza|carmen|ximena|catalina|elena|zira|aria|jenny|sara|michelle|ana|emma|ava|samantha|allison|susan|victoria|karen|moira|tessa|fiona|libby|sonia|female|nicky|amy|joanna|kendra|kimberly|salli|ivy)\b/i;
  function gender(v) { const n = v.name; if (MALE.test(n) && !FEMALE.test(n)) return 'm'; if (FEMALE.test(n) && !MALE.test(n)) return 'f'; return '?'; }

  function score(v, kind) {
    const l = v.lang.replace('_', '-').toLowerCase(), r = ROLE[kind]; let s = 0;
    if (!l.startsWith(r.lang)) return -1000;
    if (kind === 'es') s += l === 'es-mx' ? 100 : l === 'es-us' ? 80 : l === 'es-419' ? 75 : 35;
    else s += l === 'en-us' ? 100 : 30;
    const g = gender(v); s += g === r.gender ? 70 : g === '?' ? 0 : -300;
    if (GOOD.test(v.name)) s += 60; else if (/google/i.test(v.name)) s += 15;
    if (/compact|espeak/i.test(v.name)) s -= 40;
    if (v.localService) s += 2;
    return s;
  }
  function quality(v) {
    if (!v) return 'No voice found – timing falls back to estimated durations (silent).';
    if (GOOD.test(v.name)) return 'Neural/enhanced voice – best available quality.';
    if (/google/i.test(v.name)) return 'Google browser voice – decent, may need internet.';
    return 'Basic system voice – intelligible but can sound robotic. Install a neural voice (e.g. Edge “Natural” voices) for a better result.';
  }
  function load() {
    voices = synth ? synth.getVoices() : [];
    ['es', 'en'].forEach(k => {
      const list = voices.map(v => ({ v, s: score(v, k) })).filter(x => x.s > -500).sort((a, b) => b.s - a.s);
      const saved = localStorage.getItem('fe_voice_' + k);
      const keep = saved && list.find(x => x.v.voiceURI === saved);
      sel[k] = keep ? keep.v : (list[0] ? list[0].v : null);
      Speech.lists[k] = list.map(x => x.v);
    });
    Speech.onVoices && Speech.onVoices();
  }
  function choose(k, uri) {
    const v = voices.find(x => x.voiceURI === uri) || null; sel[k] = v;
    try { localStorage.setItem('fe_voice_' + k, uri); } catch (e) {}
  }
  const estimate = (text, kind) => Math.max(0.5, text.replace(/[“”"¿?¡!.,…]/g, '').length * 0.062 / rate(kind) + 0.25);

  function cancel() { if (synth) { try { synth.cancel(); } catch (e) {} } current = null; }

  // Resolves when the utterance has really finished (or after a clock-time safety limit).
  function say(kind, text, o = {}) {
    return new Promise((res, rej) => {
      const est = estimate(text, kind), v = sel[kind];
      let done = false;
      const entry = { at: Infinity, res, rej, poll: null };
      const finish = () => { if (done) return; done = true; Clock.timers = Clock.timers.filter(x => x !== entry); Aud.setSpeaking(false); o.onEnd && o.onEnd(); res(); };
      Aud.setSpeaking(true); o.onStart && o.onStart();
      if (!synth || !v) {                       // silent fallback keeps timeline realistic
        entry.at = Clock.t + est; entry.res = finish; Clock.timers.push(entry); return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.voice = v; u.lang = v.lang || LANG[kind]; u.rate = rate(kind); u.pitch = 1; u.volume = muted ? 0 : 1;
      current = u; // keep reference so it is not garbage collected mid-speech
      u.onend = finish; u.onerror = e => { if (e.error === 'canceled' || e.error === 'interrupted') { return; } finish(); };
      if (o.onBoundary) u.onboundary = e => o.onBoundary(e);
      const start = Clock.t;
      entry.poll = () => Clock.t - start > est * 2 + 3;
      entry.res = () => { cancel(); finish(); };
      entry.rej = x => { done = true; Aud.setSpeaking(false); rej(x); };
      Clock.timers.push(entry);
      synth.speak(u);
    });
  }
  function unlock() { if (synth) { try { synth.cancel(); const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch (e) {} } }
  function setMuted(m) { muted = m; }
  function pause() { if (synth) try { synth.pause(); } catch (e) {} }
  function resume() { if (synth) try { synth.resume(); } catch (e) {} }
  if (synth) { synth.onvoiceschanged = load; }
  function setSpeed(x) { speed = x; try { localStorage.setItem('fe_speed', x); } catch (e) {} }
  return { gender, ROLE, setSpeed, get speed() { return speed; }, lists: { es: [], en: [] }, load, choose, say, cancel, unlock, setMuted, pause, resume, quality, get sel() { return sel; }, get supported() { return !!synth; }, onVoices: null };
})();
