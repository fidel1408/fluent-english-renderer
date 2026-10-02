/* Player: owns the video clock, speech sequencing, audio engine and canvas loop.
 * Live mode  → real speech (when voices exist); the clock HOLDS at wait-marks until speech has finished.
 * Virtual    → speech is simulated from `est` durations (export / muted / no voices).               */
window.FE = window.FE || {};

(function (FE) {
  const TL = FE.TL;

  FE.Player = function (canvas, opts) {
    opts = opts || {};
    const ctx2d = canvas.getContext("2d");
    const P = this;
    P.state = "idle"; // idle | playing | paused | ended
    P.T = 0; P.W = 0; P.cc = opts.cc == null ? 1 : opts.cc; P.muted = false;
    P.virtual = !!opts.virtual;        // force simulated speech (export)
    P.noAudio = !!opts.noAudio;
    P.onState = opts.onState || function () {};
    P.audio = null; P.clock = null;
    let sp = null;                       // active speech line
    let cap = null;                      // caption {runs, t0, tEnd}
    let fired, marksDone, sfxDone;
    let lastDuck = -1;
    let ctxA = null;
    P.status = "";

    function reset() {
      P.T = 0; fired = {}; marksDone = {}; sfxDone = {}; sp = null; cap = null; lastDuck = -1; P.holding = false;
    }
    reset();

    // ---------- speech sequencing ----------
    function useVirtual(seg) {
      return P.virtual || P.muted || !FE.Speech.supported || !FE.Speech.has(seg.lang);
    }
    function nextSeg() {
      sp.i++;
      if (sp.i >= sp.cue.segs.length) { finishLine(); return; }
      const seg = sp.cue.segs[sp.i];
      sp.phase = "seg"; sp.t = 0; sp.watch = 0; sp.done = false;
      sp.virtual = useVirtual(seg);
      if (!sp.virtual) {
        const cur = sp;
        cur.h = FE.Speech.speak(seg, { end: () => { cur.done = true; } });
      }
    }
    function startLine(cue) {
      sp = { cue, i: -1, phase: "gap", t: 0, virtual: true, done: false, h: null, watch: 0 };
      cap = { runs: cue.caption, t0: P.W, tEnd: null };
      nextSeg();
    }
    function finishLine() {
      if (cap) cap.tEnd = P.W;
      sp = null;
    }
    function updateSpeech(dt) {
      if (!sp) return;
      if (sp.phase === "seg") {
        const seg = sp.cue.segs[sp.i];
        if (sp.virtual) { sp.t += dt; if (sp.t >= seg.est) { sp.phase = "gap"; sp.t = 0; } }
        else {
          sp.watch += dt;
          if (sp.done) { sp.phase = "gap"; sp.t = 0; }
          else if (sp.watch > seg.est * 2.6 + 2.5) { if (sp.h) sp.h.cancel(); sp.phase = "gap"; sp.t = 0; }
        }
      }
      if (sp && sp.phase === "gap") {
        const last = sp.i >= sp.cue.segs.length - 1;
        sp.t += dt;
        if (last || sp.t >= FE.SEG_GAP) nextSeg();
      }
    }

    // ---------- clock ----------
    function advance(dt) {
      let target = P.T + dt;
      P.holding = false;
      for (let k = 0; k < FE.WAIT_MARKS.length; k++) {
        const m = FE.WAIT_MARKS[k];
        if (marksDone[m] || m < P.T - 1e-6 || m > target) continue;
        if (sp) { target = m; P.holding = true; break; }
        marksDone[m] = true;
      }
      // never let the clock run past an un-fired cue (so cues start exactly on their mark)
      P.T = target;
      // a cue only starts once its own mark has been passed (i.e. the previous line has finished)
      FE.CUES.forEach((c) => {
        if (!fired[c.id] && marksDone[c.at] && P.T >= c.at - 1e-6) { fired[c.id] = true; startLine(c); }
      });
      FE.SFX.forEach((e, i) => {
        if (!sfxDone[i] && P.T >= e.t - 1e-6) { sfxDone[i] = true; if (P.audio && !P.noAudio) P.audio.playSfx(e.n); }
      });
      if (P.T >= TL.total) { P.T = TL.total; if (!sp) end(); }
    }
    function end() {
      P.state = "ended";
      setTimeout(() => { if (P.state === "ended" && P.clock) P.clock.stop(); }, 600);
      P.onState(P.state);
    }

    function duckLevel() {
      const inPause = P.T >= TL.pauseStart - 0.2 && P.T < TL.pauseStart + TL.pauseLen;
      if (sp) return FE.DUCK.speaking;
      if (inPause) return FE.DUCK.pause;
      return FE.DUCK.normal;
    }

    // One simulation step (dt seconds). Used by the live loop and by the offline exporter.
    P.step = function (dt) {
      P.W += dt;
      if (P.state === "playing") {
        updateSpeech(dt);
        advance(dt);
        if (P.audio && !P.noAudio) { const d = duckLevel(); if (d !== lastDuck) { lastDuck = d; P.audio.setDuck(d, d === FE.DUCK.pause ? 0.15 : 0.07); } }
      }
    };

    function snapshot() {
      let caption = null;
      if (cap) {
        const age = P.W - cap.t0;
        let a = Math.min(1, age / 0.18);
        if (cap.tEnd != null) { const lingerAge = P.W - cap.tEnd; a = Math.min(a, 1 - Math.max(0, (lingerAge - 0.3) / 0.25)); }
        if (a > 0.01) caption = { runs: cap.runs, alpha: a };
      }
      const seg = sp && sp.phase === "seg" ? sp.cue.segs[sp.i] : null;
      return {
        T: P.state === "idle" ? 2.5 : P.T, W: P.W, cc: P.cc,
        speakingEn: !!(seg && seg.lang === "en" && !(P.state === "paused")),
        caption: P.state === "idle" ? null : caption,
      };
    }
    P.snapshot = snapshot;
    P.draw = function () { FE.renderFrame(ctx2d, snapshot()); };

    // ---------- live loop ----------
    let raf = 0, last = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.25, (now - last) / 1000); last = now;
      if (P.state !== "paused") P.step(dt);
      P.draw();
    }
    P.run = function () { last = performance.now(); raf = requestAnimationFrame(loop); };

    // ---------- controls ----------
    async function ensureAudio() {
      if (P.noAudio || ctxA) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      ctxA = new AC({ latencyHint: "interactive" });
      P.audio = FE.createAudioEngine(ctxA);
      P.clock = FE.createMusicClock(P.audio, () => P.T);
    }
    P.start = async function () {
      // called from a click: unlocks WebAudio and speech
      await ensureAudio();
      if (ctxA && ctxA.state === "suspended") { try { await ctxA.resume(); } catch (e) {} }
      FE.Speech.unlock();
      P.replayInternal();
    };
    P.replayInternal = function () {
      FE.Speech.cancelAll();
      reset();
      P.state = "playing";
      if (P.audio) { P.audio.newSession(); P.audio.setMuted(P.muted); P.clock.start(); }
      P.onState(P.state);
    };
    P.replay = async function () { await P.start(); };
    P.pause = function () {
      if (P.state !== "playing") return;
      P.state = "paused"; FE.Speech.pause(); if (ctxA) ctxA.suspend(); P.onState(P.state);
    };
    P.resume = function () {
      if (P.state !== "paused") return;
      P.state = "playing"; FE.Speech.resume(); if (ctxA) ctxA.resume(); P.onState(P.state);
    };
    P.stop = function () {
      FE.Speech.cancelAll(); if (P.clock) P.clock.stop(); reset(); P.state = "idle"; P.onState(P.state);
    };
    P.setMuted = function (m) {
      P.muted = m; if (P.audio) P.audio.setMuted(m);
      if (m && sp && !sp.virtual && sp.h) sp.h.cancel(); // silence at once; timing continues from estimates
    };
    P.setCC = function (v) { P.cc = v; };
    P.testVoice = function (lang) {
      FE.Speech.cancelAll();
      const text = lang === "es" ? "Hola, ¿cómo estás?" : "I’m thirty-three years old.";
      FE.Speech.unlock();
      FE.Speech.speak({ lang, text, rate: lang === "en" ? 0.9 : 1 }, {});
    };
  };
})(window.FE);
