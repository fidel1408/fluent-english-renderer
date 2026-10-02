/* Fluent English – narration (browser speech synthesis) and original, optional sound.
 * - Uses only the voices already installed in the teacher's browser: nothing is purchased or uploaded.
 * - One utterance at a time; every navigation cancels the previous one (no overlapping audio).
 * - If no English voice exists, lines are "spoken" silently with an estimated duration so captions still run.
 */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var syn = root.speechSynthesis || null;

  var FEM = /aria|jenny|samantha|ava\b|allison|zira|susan|michelle|emma|joanna|salli|kendra|kimberly|ivy|nicole|amy|olivia|sonia|libby|natasha|karen|tessa|victoria|serena|moira|fiona|female|jessa|sara|siri.*(female)?|google us english/i;
  var MAL = /guy|davis|tony|jason|aaron|evan|nathan|tom\b|alex\b|fred|david|mark\b|eric|brandon|roger|matthew|joey|justin|steffan|ryan|andrew|brian|christopher|daniel|male|jacob|gordon|lee\b/i;
  var ROLES = ["maya", "theo", "alex", "jordan"];
  var BASE = {
    maya:   { pitch: 1.06, rate: 1.0, g: "f" },
    theo:   { pitch: 0.92, rate: 0.98, g: "m" },
    alex:   { pitch: 0.98, rate: 1.0, g: "f" },
    jordan: { pitch: 1.0, rate: 1.0, g: "m" },
  };

  /* developer-only testing aid: index.html?fast=10 runs timers and pauses ten times faster */
  FE.speed = (function () { try { var n = parseFloat(new URLSearchParams(root.location.search).get("fast")); return n > 0 ? n : 1; } catch (e) { return 1; } })();
  var V = (FE.Voice = {
    voices: [], assign: {}, rate: 1, volume: 1, enabled: true, speaking: false, supported: !!syn,
    onSpeakingChange: null,
  });
  var tok = 0, curUtter = null, keep = [], timers = [];

  function isEnglish(v) { return /^en[-_]/i.test(v.lang || ""); }
  function isUS(v) { return /^en[-_]US$/i.test(v.lang || ""); }
  function score(v) {
    var s = 0, n = v.name || "";
    if (isUS(v)) s += 40; else if (/^en[-_](CA|AU)/i.test(v.lang)) s += 6; else if (isEnglish(v)) s += 4;
    if (/natural/i.test(n)) s += 30;
    if (/online/i.test(n)) s += 18;
    if (/google/i.test(n)) s += 8;
    if (/samantha|ava\b|allison|evan|nathan|zoe|siri/i.test(n)) s += 10;
    if (/compact|novelty|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|organ|trinoids|whisper|zarvox|albert|jester/i.test(n)) s -= 60;
    if (v.localService) s += 1;
    return s;
  }
  function gender(v) { var n = v.name || ""; if (MAL.test(n)) return "m"; if (FEM.test(n)) return "f"; return "?"; }

  function refresh() {
    V.voices = syn ? syn.getVoices().filter(isEnglish).sort(function (a, b) { return score(b) - score(a); }) : [];
    autoAssign();
    if (V.onVoices) V.onVoices(V.voices);
  }
  function autoAssign() {
    var saved = V.saved || {};
    var us = V.voices.filter(isUS);
    var pool = us.length ? us : V.voices;
    var fem = pool.filter(function (v) { return gender(v) === "f"; });
    var mal = pool.filter(function (v) { return gender(v) === "m"; });
    var any = pool;
    var pick = {
      maya: fem[0] || any[0], theo: mal[0] || any[1] || any[0],
      alex: fem[1] || fem[0] || any[0], jordan: mal[1] || mal[0] || any[1] || any[0],
    };
    ROLES.forEach(function (r) {
      var v = null;
      if (saved[r]) v = V.voices.filter(function (x) { return x.voiceURI === saved[r]; })[0];
      V.assign[r] = v || pick[r] || null;
    });
  }
  V.setVoice = function (role, uri) {
    var v = V.voices.filter(function (x) { return x.voiceURI === uri; })[0];
    V.assign[role] = v || null;
    V.saved = V.saved || {};
    V.saved[role] = uri;
  };
  function params(role) {
    var b = BASE[role] || BASE.maya;
    var v = V.assign[role] || null;
    var p = b.pitch, r = b.rate;
    // when two roles share a voice (or the voice's gender does not match), vary the pitch so they stay distinct
    if (v) {
      var g = gender(v);
      if (g === "f" && b.g === "m") p = 0.78;
      if (g === "m" && b.g === "f") p = 1.22;
      var shared = ROLES.filter(function (x) { return x !== role && V.assign[x] === v; });
      if (shared.length && (role === "alex" || role === "jordan")) p = role === "alex" ? p * 0.92 : p * 1.1;
    }
    return { voice: v, pitch: p, rate: r * V.rate };
  }

  V.init = function () {
    if (!syn) return;
    refresh();
    if (syn.addEventListener) syn.addEventListener("voiceschanged", refresh);
    else syn.onvoiceschanged = refresh;
  };

  /* duration estimate in ms for a text */
  V.estimate = function (text) {
    var words = String(text).trim().split(/\s+/).length;
    var commas = (String(text).match(/[,;:.!?]/g) || []).length;
    return Math.round(((words / (2.6 * V.rate)) * 1000 + commas * 120 + 250) / FE.speed);
  };

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function setSpeaking(on) { if (V.speaking !== on) { V.speaking = on; if (V.onSpeakingChange) V.onSpeakingChange(on); } }

  V.cancel = function () {
    tok++;
    clearTimers();
    if (syn) { try { syn.cancel(); } catch (e) {} }
    curUtter = null;
    setSpeaking(false);
    if (V._resolve) { var r = V._resolve; V._resolve = null; r(false); }
  };

  /* Speak one text. Resolves true when it finished, false when cancelled.
   * opts: role, onWord(charIndex), onStart(), muted (force silent timing) */
  V.speak = function (text, opts) {
    opts = opts || {};
    V.cancel();
    var my = ++tok;
    return new Promise(function (resolve) {
      V._resolve = resolve;
      var done = function (ok) { if (my !== tok) return; V._resolve = null; clearTimers(); setSpeaking(false); resolve(ok); };
      var silent = !syn || !V.enabled || opts.muted || !V.voices.length || V.volume === 0 && false;
      var est = V.estimate(text);

      // word-level timing used when there are no boundary events (or no voice)
      var starts = [];
      var re = /\S+/g, m;
      while ((m = re.exec(text))) starts.push(m.index);
      var scheduleEstimate = function (from) {
        var total = est, n = starts.length;
        for (var i = from; i < n; i++) {
          (function (idx) { timers.push(setTimeout(function () { if (my === tok && opts.onWord) opts.onWord(starts[idx]); }, (starts[idx] / Math.max(1, text.length)) * total * 0.96)); })(i);
        }
      };

      if (silent) {
        setSpeaking(true);
        if (opts.onStart) opts.onStart();
        scheduleEstimate(0);
        timers.push(setTimeout(function () { done(true); }, est));
        return;
      }

      var p = params(opts.role || "maya");
      var u = new root.SpeechSynthesisUtterance(text);
      if (p.voice) { u.voice = p.voice; u.lang = p.voice.lang; } else u.lang = "en-US";
      u.pitch = p.pitch; u.rate = p.rate; u.volume = Math.max(0, Math.min(1, V.volume));
      var gotBoundary = false;
      u.onstart = function () {
        setSpeaking(true);
        if (opts.onStart) opts.onStart();
        timers.push(setTimeout(function () { if (my === tok && !gotBoundary) scheduleEstimate(0); }, 700));
      };
      u.onboundary = function (e) { if (my !== tok) return; if (e.name && e.name !== "word") return; gotBoundary = true; if (opts.onWord) opts.onWord(e.charIndex); };
      u.onend = function () { done(true); };
      u.onerror = function (e) { if (my !== tok) return; done(e && (e.error === "canceled" || e.error === "interrupted") ? false : true); };
      keep.push(u); if (keep.length > 8) keep.shift();
      curUtter = u;
      // some browsers drop a speak() issued right after cancel()
      timers.push(setTimeout(function () {
        if (my !== tok) return;
        try { syn.speak(u); } catch (e) { done(true); }
        // safety net: if nothing starts within 4 s, fall back to the estimate so the lesson never stalls
        timers.push(setTimeout(function () { if (my === tok && !V.speaking) { try { syn.cancel(); } catch (e) {} setSpeaking(true); scheduleEstimate(0); timers.push(setTimeout(function () { done(true); }, est)); } }, 4000));
      }, 60));
    });
  };

  /* ---------------- original, optional sound ---------------- */
  var ctx = null, master = null, musicGain = null, musicOn = false, musicTimer = null, musicVol = 0.4, sfxOn = true;
  var duck = 1;
  function ensureCtx() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(master);
    return ctx;
  }
  FE.Sound = {
    unlock: function () { ensureCtx(); },
    setSfx: function (on) { sfxOn = !!on; },
    setMusicVolume: function (v) { musicVol = v; this._applyMusic(); },
    setMasterVolume: function (v) { if (master) master.gain.value = v; this._master = v; },
    _applyMusic: function () { if (musicGain) musicGain.gain.setTargetAtTime(musicOn ? musicVol * 0.16 * duck : 0, ctx.currentTime, 0.4); },
    duck: function (on) { duck = on ? 0.4 : 1; if (ctx && musicOn) this._applyMusic(); },
    chime: function () {
      if (!sfxOn) return; var c = ensureCtx(); if (!c) return;
      var t = c.currentTime;
      [[880, 0.07], [1318.5, 0.04], [1760, 0.02]].forEach(function (p) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = "sine"; o.frequency.value = p[0];
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(p[1], t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.7);
      });
    },
    tick: function () {
      if (!sfxOn) return; var c = ensureCtx(); if (!c) return;
      var t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = "triangle"; o.frequency.value = 660;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.025, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
    },
    music: function (on) {
      musicOn = !!on;
      var c = ensureCtx(); if (!c) return;
      this._applyMusic();
      clearInterval(musicTimer);
      if (!on) return;
      var chords = [[261.6, 329.6, 392.0, 493.9], [220.0, 261.6, 329.6, 392.0], [174.6, 220.0, 261.6, 329.6], [196.0, 246.9, 293.7, 392.0]];
      var penta = [523.3, 587.3, 659.3, 784.0, 880.0], step = 0;
      var play = function () {
        if (!musicOn || !ctx) return;
        var t = ctx.currentTime, ch = chords[Math.floor(step / 3) % chords.length];
        if (step % 3 === 0) {
          ch.forEach(function (f, i) {
            var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
            o.type = i % 2 ? "triangle" : "sine"; o.frequency.value = f / (i === 0 ? 2 : 1); o.detune.value = (i - 1.5) * 4;
            lp.type = "lowpass"; lp.frequency.value = 900;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 2.2); g.gain.linearRampToValueAtTime(0, t + 7.8);
            o.connect(lp); lp.connect(g); g.connect(musicGain); o.start(t); o.stop(t + 8);
          });
        }
        if (Math.random() < 0.6) {
          var o2 = ctx.createOscillator(), g2 = ctx.createGain();
          o2.type = "sine"; o2.frequency.value = penta[Math.floor(Math.random() * penta.length)];
          g2.gain.setValueAtTime(0, t + 0.3); g2.gain.linearRampToValueAtTime(0.1, t + 0.35); g2.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
          o2.connect(g2); g2.connect(musicGain); o2.start(t + 0.3); o2.stop(t + 2.6);
        }
        step++;
      };
      play(); musicTimer = setInterval(play, 2600);
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
