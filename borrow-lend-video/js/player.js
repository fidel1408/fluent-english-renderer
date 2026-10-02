/* Fluent English – live player. Drives the timeline from ACTUAL speech completion, owns the audio graph,
   and handles Start / Pause / Replay / Mute / captions mode. */
(function () {
  const FE = (window.FE = window.FE || {});
  const Speech = FE.Speech;

  const Player = (FE.Player = {
    state: "idle", // idle | playing | paused | ended
    sch: null, bi: 0, u: 0, T: 0, cc: FE.getCC(), muted: false, graph: null, actx: null,
    speaking: false, spStarted: false, spDone: false, fired: null, musicTimer: null, onEnded: null, onState: null,
    init(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext("2d");
      this.sch = FE.buildSchedule({});
      let last = performance.now();
      const loop = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; this.tick(dt); this.render(); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    },
    emit() { if (this.onState) this.onState(this.state); },
    beat() { return this.sch.beats[this.bi]; },
    total() { return this.sch.beats.reduce((a, b) => a + (b.dur || 0), 0); },
    elapsed() { let t = 0; for (let i = 0; i < this.bi; i++) t += this.sch.beats[i].dur; return t + Math.min(this.u, this.beat().dur); },

    start() { // must be called from a user gesture
      this.stopAudio();
      Speech.cancel(); Speech.unlock(); Speech.setMuted(this.muted);
      const AC = window.AudioContext || window.webkitAudioContext;
      this.actx = new AC();
      if (this.actx.state === "suspended") this.actx.resume();
      this.graph = FE.createAudioGraph(this.actx);
      this.graph.setMuted(this.muted);
      this.graph.setDuck(FE.DUCK.rest, this.actx.currentTime, 0.01);
      this.graph.scheduleMusic(this.actx.currentTime + 1.2);
      this.musicTimer = setInterval(() => { if (this.actx && this.actx.state === "running") this.graph.scheduleMusic(this.actx.currentTime + 1.2); }, 120);
      this.sch = FE.buildSchedule({}); this.T = 0;
      this.state = "playing"; this.enter(0); this.emit();
    },
    stopAudio() {
      if (this.musicTimer) clearInterval(this.musicTimer); this.musicTimer = null;
      if (this.actx) { try { this.actx.close(); } catch (e) { /* ignore */ } }
      this.actx = null; this.graph = null;
    },
    enter(i) {
      this.bi = i; this.u = 0; this.fired = new Set(); this.speaking = false; this.spStarted = false;
      const b = this.beat();
      this.spDone = !b.speech;
      if (b.id === "pause" && this.graph) this.graph.setDuck(FE.DUCK.pause, this.actx.currentTime, 0.12);
    },
    startSpeech() {
      const b = this.beat(), my = this.bi, runId = this.runId = (this.runId || 0) + 1;
      this.spStarted = true; this.speaking = true;
      if (this.graph) this.graph.setDuck(FE.DUCK.talk, this.actx.currentTime, 0.06);
      Speech.speak(b.speech).then((r) => {
        if (r.cancelled || my !== this.bi || runId !== this.runId) return;
        this.speaking = false; this.spDone = true; b.speechDur = r.duration;
        b.dur = Math.max(b.min, b.sp + b.speechDur + b.tail);
        if (this.graph) this.graph.setDuck(FE.DUCK.rest, this.actx.currentTime + 0.12, 0.25);
      });
    },
    tick(dt) {
      this.T += dt;
      if (this.state !== "playing") return;
      this.u += dt;
      const b = this.beat();
      if (this.graph) (FE.SFX_CUES[b.id] || []).forEach(([t, name], k) => { if (this.u >= t && !this.fired.has(k)) { this.fired.add(k); this.graph.sfx(name, this.actx.currentTime + 0.02); } });
      if (b.speech && !this.spStarted && this.u >= b.sp) this.startSpeech();
      const ready = this.u >= b.min && this.spDone && (!b.speech || this.u >= b.sp + b.speechDur + b.tail);
      if (ready) {
        if (this.bi < this.sch.beats.length - 1) this.enter(this.bi + 1);
        else {
          this.state = "ended"; this.u = b.dur;
          if (this.graph) this.graph.fadeOutAll(this.actx.currentTime + 0.1, 0.8);
          setTimeout(() => { if (this.state === "ended") this.stopAudio(); }, 1200);
          this.emit(); if (this.onEnded) this.onEnded();
        }
      }
    },
    render() {
      const idle = this.state === "idle";
      const sch = this.sch, bi = idle ? 0 : this.bi, b = sch.beats[bi];
      FE.draw(this.ctx, { sch, bi, u: idle ? 2.7 : this.u, T: this.T, cc: this.cc, speaking: this.state === "playing" || this.state === "paused" ? this.speaking : undefined });
    },
    pause() {
      if (this.state !== "playing") return;
      this.state = "paused"; Speech.cancel();
      if (this.spStarted && !this.spDone) { this.spStarted = false; this.speaking = false; } // the interrupted line restarts from its beginning on resume
      if (this.actx) this.actx.suspend();
      this.emit();
    },
    resume() { if (this.state !== "paused") return; if (this.actx) this.actx.resume(); this.state = "playing"; this.emit(); },
    toggle() { if (this.state === "playing") this.pause(); else if (this.state === "paused") this.resume(); },
    replay() { this.start(); },
    setMuted(m) { this.muted = m; Speech.setMuted(m); if (this.graph) this.graph.setMuted(m); },
    setCC(v) { this.cc = v; FE.setCC(v); },
  });
})();
