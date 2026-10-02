/* Fluent English – narration (browser speech synthesis) and original, optional sound.
 * - Uses only the voices already installed in the teacher's browser: nothing is purchased or uploaded.
 * - One utterance at a time; every navigation cancels the previous one (no overlapping audio).
 * - If no English voice exists, lines are "spoken" silently with an estimated duration so captions still run.
 */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var syn = root.speechSynthesis || null;

  var FEM = /aria|jenny|emma|michelle|ana\b|aria|libby|clara|sonia|samantha|ava\b|allison|zira|susan|michelle|emma|joanna|salli|kendra|kimberly|ivy|nicole|amy|olivia|sonia|libby|natasha|karen|tessa|victoria|serena|moira|fiona|female|jessa|sara|siri.*(female)?|google us english/i;
  var MAL = /andrew|brian|ryan|christopher|eric|steffan|roger|guy|davis|tony|jason|aaron|evan|nathan|tom\b|alex\b|fred|david|mark\b|eric|brandon|roger|matthew|joey|justin|steffan|ryan|andrew|brian|christopher|daniel|male|jacob|gordon|lee\b/i;
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
  var tok = 0, curUtter = null, keep = [], timers = [], curAudio = null;

  function isEnglish(v) { return /^en[-_]/i.test(v.lang || ""); }
  function isUS(v) { return /^en[-_]US$/i.test(v.lang || ""); }
  function score(v) {
    var s = 0, n = v.name || "";
    if (isUS(v)) s += 40; else if (/^en[-_](CA|AU)/i.test(v.lang)) s += 6; else if (isEnglish(v)) s += 4;
    if (/natural|neural|premium|enhanced|wavenet/i.test(n)) s += 34;
    if (/microsoft .*online/i.test(n)) s += 10;
    if (/online/i.test(n)) s += 18;
    if (/google/i.test(n)) s += 2;
    if (/samantha|ava\b|allison|evan|nathan|zoe|siri|serena|daniel/i.test(n)) s += 12;
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
    if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; }
    if (V._resolve) { var r = V._resolve; V._resolve = null; r(false); }
  };

  /* ---- how mood changes the voice: [rate multiplier, pitch multiplier] ---- */
  var MOOD = {
    grin: [1.07, 1.10], laugh: [1.08, 1.14], proud: [1.02, 1.08], surprised: [1.05, 1.16], warm: [0.96, 1.02], smile: [1.0, 1.04],
    curious: [0.97, 1.07], thinking: [0.92, 1.0], worried: [0.92, 0.95], shy: [0.9, 0.97], sad: [0.88, 0.92], flat: [0.98, 0.98], neutral: [1, 1],
  };
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
  V.clipKey = function (role, text) { return (role || "maya") + ":" + hash(text.replace(/\s+/g, " ").trim()); };
  V.clips = V.clips || {}; V.useClips = true;
  try { if (new URLSearchParams(root.location.search).get("clips") === "0") { V.useClips = false; V.clipsOff = true; } } catch (e) {}

  /* split a line into phrases so the voice can breathe: sentences, and long clauses at commas */
  function phrases(text) {
    var re = /[^,.!?…;:\n]+[,.!?…;:\n]*\s*/g, m, out = [];
    while ((m = re.exec(text))) { if (m[0].trim()) out.push({ t: m[0], s: m.index }); }
    var merged = [];
    out.forEach(function (c) {
      var prev = merged[merged.length - 1];
      var words = c.t.trim().split(/\s+/).length;
      if (prev && (words <= 2 || /,\s*$/.test(prev.t) && prev.t.trim().split(/\s+/).length <= 2)) { prev.t += c.t; } else merged.push({ t: c.t, s: c.s });
    });
    return merged.length ? merged : [{ t: text, s: 0 }];
  }
  function gapAfter(t) { return /[.!?…]\s*$/.test(t) ? (/\?\s*$/.test(t) ? 210 : 190) : /[;:]\s*$/.test(t) ? 120 : 70; }

  /* Speak one text. Resolves true when it finished, false when cancelled.
   * opts: role, mood, onWord(charIndex), onStart(), muted (force silent timing) */
  V.speak = function (text, opts) {
    opts = opts || {};
    V.cancel();
    var my = ++tok;
    return new Promise(function (resolve) {
      V._resolve = resolve;
      var done = function (ok) { if (my !== tok) return; V._resolve = null; clearTimers(); setSpeaking(false); resolve(ok); };
      var silent = !syn || !V.enabled || opts.muted || !V.voices.length;
      var est = V.estimate(text);
      var starts = []; var re = /\S+/g, mm;
      while ((mm = re.exec(text))) starts.push(mm.index);
      var scheduleRange = function (from, to, totalMs) {
        var idxs = starts.filter(function (s) { return s >= from && s < to; });
        idxs.forEach(function (s) { timers.push(setTimeout(function () { if (my === tok && opts.onWord) opts.onWord(s); }, ((s - from) / Math.max(1, to - from)) * totalMs * 0.96)); });
      };

      /* 1. a pre-recorded clip, when one exists for this exact line and character */
      var clip = !opts.muted && V.enabled && V.useClips && V.clips[V.clipKey(opts.role, text)];
      if (clip && root.Audio) {
        var au = new root.Audio(); au.preload = "auto"; curAudio = au;
        var packed = clip.s > 0 || !!clip.p, fell = false, begun = false;
        var key = V.clipKey(opts.role, text);
        var fallback = function () { if (fell || my !== tok) return; fell = true; if (curAudio === au) { try { au.pause(); } catch (e) {} curAudio = null; } delete V.clips[key]; V._resolve = null; V.speak(text, opts).then(resolve); };
        var finish = function () { if (my !== tok) return; try { au.pause(); } catch (e) {} if (curAudio === au) curAudio = null; done(true); };
        au.onplaying = function () {
          if (begun || my !== tok) return; begun = true;
          au.volume = Math.max(0, Math.min(1, V.volume));
          setSpeaking(true); if (opts.onStart) opts.onStart();
          var ms = (clip.d || au.duration || est / 1000) * 1000;
          scheduleRange(0, text.length, ms);
          if (packed) timers.push(setTimeout(finish, ms + 30));
        };
        au.onended = finish;
        au.onerror = fallback;
        var go = function () { var pl = au.play(); if (pl && pl.catch) pl.catch(fallback); };
        if (packed) {
          au.addEventListener("loadedmetadata", function () { au.addEventListener("seeked", go, { once: true }); try { au.currentTime = clip.s; } catch (e) { fallback(); } }, { once: true });
        }
        au.src = clip.f;
        if (!packed) go();
        return;
      }

      if (silent) {
        setSpeaking(true);
        if (opts.onStart) opts.onStart();
        scheduleRange(0, text.length, est);
        timers.push(setTimeout(function () { done(true); }, est));
        return;
      }

      /* 2. browser voice, phrase by phrase with mood-shaped prosody */
      var cs = phrases(text), ci = 0, base = params(opts.role || "maya"), mood = MOOD[opts.mood] || MOOD.neutral, started = false;
      var next = function () {
        if (my !== tok) return;
        if (ci >= cs.length) { done(true); return; }
        var ch = cs[ci++], last = ci === cs.length, raw = ch.t, lead = raw.length - raw.replace(/^\s+/, "").length, t2 = raw.trim();
        var pitch = base.pitch * mood[1], rate = base.rate * mood[0];
        if (/\?\s*$/.test(t2)) pitch *= 1.07; else if (/!\s*$/.test(t2)) { pitch *= 1.09; rate *= 1.04; } else if (last && /[.…]\s*$/.test(t2)) pitch *= 0.97;
        pitch *= 1 + (Math.random() - 0.5) * 0.04; rate *= 1 + (Math.random() - 0.5) * 0.03;
        var u = new root.SpeechSynthesisUtterance(t2);
        if (base.voice) { u.voice = base.voice; u.lang = base.voice.lang; } else u.lang = "en-US";
        u.pitch = Math.max(0.5, Math.min(1.8, pitch)); u.rate = Math.max(0.6, Math.min(1.35, rate)); u.volume = Math.max(0, Math.min(1, V.volume));
        var gotB = false, off = ch.s + lead;
        u.onstart = function () {
          if (!started) { started = true; setSpeaking(true); if (opts.onStart) opts.onStart(); }
          timers.push(setTimeout(function () { if (my === tok && !gotB) scheduleRange(off, off + t2.length, V.estimate(t2)); }, 600));
        };
        u.onboundary = function (e) { if (my !== tok) return; if (e.name && e.name !== "word") return; gotB = true; if (opts.onWord) opts.onWord(off + (e.charIndex || 0)); };
        u.onend = function () { if (my !== tok) return; timers.push(setTimeout(next, gapAfter(t2))); };
        u.onerror = function (e) { if (my !== tok) return; if (e && (e.error === "canceled" || e.error === "interrupted")) { done(false); } else timers.push(setTimeout(next, 60)); };
        keep.push(u); if (keep.length > 10) keep.shift();
        curUtter = u;
        timers.push(setTimeout(function () {
          if (my !== tok) return;
          try { syn.speak(u); } catch (er) { timers.push(setTimeout(next, 60)); return; }
          if (ci === 1) timers.push(setTimeout(function () { if (my === tok && !started) { try { syn.cancel(); } catch (er2) {} started = true; setSpeaking(true); scheduleRange(0, text.length, est); timers.push(setTimeout(function () { done(true); }, est)); } }, 4000));
        }, ci === 1 ? 60 : 0));
      };
      next();
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
    pop: function () {
      if (!sfxOn) return; var c = ensureCtx(); if (!c) return;
      var t = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.09);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
    },
    whoosh: function () {
      if (!sfxOn) return; var c = ensureCtx(); if (!c) return;
      var t = c.currentTime, len = Math.floor(c.sampleRate * 0.35), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var s = c.createBufferSource(); s.buffer = buf;
      var f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2400, t + 0.3);
      var g = c.createGain(); g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      s.connect(f); f.connect(g); g.connect(master); s.start(t);
    },
    star: function () {
      if (!sfxOn) return; var c = ensureCtx(); if (!c) return;
      var t = c.currentTime;
      [880, 1174.7, 1568].forEach(function (f, i) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.09); g.gain.exponentialRampToValueAtTime(0.07, t + i * 0.09 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.5);
        o.connect(g); g.connect(master); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.55);
      });
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
