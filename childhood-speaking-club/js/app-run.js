/* Fluent English – engine: steps, modes, timer, controls, overlays, dictionary, boot. */
(function (root) {
  "use strict";
  var FE = root.FE, X = FE.X, T = FE.t, U = FE.S, esc = FE.esc, L = FE.LESSON, S = X.S, P = X.P, A = FE.Art;
  var $ = X.$, $$ = X.$$, mk = X.mk, V = FE.Voice;

  /* ---------------- icons ---------------- */
  function ic(d, extra) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (extra || "") + ">" + d + "</svg>"; }
  var IC = {
    chPrev: ic('<path d="M6 5h2v14H6zM20 5v14L9 12z"/>'), chNext: ic('<path d="M16 5h2v14h-2zM4 5v14l11-7z"/>'),
    back: ic('<path d="M15 5v14L5 12z"/>'), next: ic('<path d="M9 5v14l10-7z"/>'),
    play: ic('<path d="M7 4v16l13-8z"/>'), pause: ic('<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'),
    replay: ic('<path d="M12 5V2L7 6.5 12 11V8a5 5 0 11-5 5H5a7 7 0 107-8z"/>'),
    timer: ic('<path d="M9 2h6v2H9zM12 6a8 8 0 100 16 8 8 0 000-16zm1 4v5h-2v-6h2z"/>'),
    reveal: ic('<path d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.300-3.100 11-7c-1.700-3.900-6-7-11-7zm0 11a4 4 0 110-8 4 4 0 010 8z"/>'),
    starters: ic('<path d="M4 4h16v12H8l-4 4z"/>'), example: ic('<path d="M9 21h6v-1H9zM12 2a7 7 0 00-4 12.700V17h8v-2.300A7 7 0 0012 2z"/>'), star: ic('<path d="M12 2l2.900 6.300 6.900.8-5.100 4.700 1.400 6.800L12 17.200l-6.100 3.400 1.400-6.800L2.200 9.100l6.900-.8z"/>'),
    words: ic('<path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z"/>'),
    chapters: ic('<path d="M4 5h16v3H4zM4 10.500h16v3H4zM4 16h16v3H4z"/>'), notes: ic('<path d="M3 17.300V21h3.700L17.800 9.900l-3.700-3.700zM20.700 7a1 1 0 000-1.400l-2.300-2.300a1 1 0 00-1.400 0l-1.800 1.800 3.700 3.700z"/>'),
    mode: ic('<path d="M7 7h10V4l5 5-5 5v-3H7zM17 17H7v3l-5-5 5-5v3h10z"/>'),
    vol: ic('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 8.500a5 5 0 010 7" fill="none" stroke="currentColor" stroke-width="2"/>'),
    full: ic('<path d="M4 4h6v2H6v4H4zM14 4h6v6h-2V6h-4zM4 14h2v4h4v2H4zM18 14h2v6h-6v-2h4z"/>'),
    exit: ic('<path d="M8 4h2v6H4V8h4zM14 4h2v4h4v2h-6zM4 14h6v6H8v-4H4zM14 14h6v2h-4v4h-2z"/>'),
    gear: ic('<path d="M19.400 13a7.500 7.500 0 000-2l2.100-1.600-2-3.500-2.500 1a7.500 7.500 0 00-1.700-1L15 3.200h-4l-.4 2.700a7.500 7.500 0 00-1.700 1l-2.500-1-2 3.500L6.600 11a7.500 7.500 0 000 2l-2.100 1.600 2 3.500 2.500-1a7.500 7.500 0 001.700 1l.4 2.700h4l.4-2.700a7.500 7.500 0 001.700-1l2.500 1 2-3.500zM13 15.500a3.500 3.500 0 110-7 3.500 3.500 0 010 7z"/>'),
    hide: ic('<path d="M6 9l6 6 6-6z"/>'), show: ic('<path d="M6 15l6-6 6 6z"/>'),
    close: ic('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>'),
  };
  X.IC = IC;

  /* ---------------- timer ---------------- */
  var Tm = (X.Tm = { total: 0, left: 0, running: false, done: false, last: 0, id: null, waiters: [], wasRunning: false, has: false });
  var CIRC = 2 * Math.PI * 54;
  function fmt(s) { s = Math.max(0, Math.ceil(s)); var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r; }
  Tm.set = function (sec) {
    Tm.total = sec; Tm.left = sec; Tm.running = false; Tm.done = false; Tm.has = sec > 0;
    clearInterval(Tm.id);
    Tm.render();
  };
  Tm.start = function () {
    if (!Tm.has) return;
    if (Tm.left <= 0) { Tm.left = Tm.total; Tm.done = false; }
    Tm.running = true; Tm.last = performance.now();
    clearInterval(Tm.id);
    Tm.id = setInterval(Tm.tick, 200);
    Tm.render();
  };
  Tm.pause = function () { Tm.wasRunning = Tm.running; Tm.running = false; clearInterval(Tm.id); Tm.render(); };
  Tm.reset = function () { Tm.left = Tm.total; Tm.done = false; Tm.running = false; clearInterval(Tm.id); Tm.render(); };
  Tm.adjust = function (d) { if (!Tm.has) return; Tm.left = Math.max(0, Tm.left + d); Tm.total = Math.max(Tm.total, Tm.left); Tm.done = false; Tm.render(); if (Tm.running && Tm.left === 0) Tm.finish(); };
  Tm.stop = function () { clearInterval(Tm.id); Tm.running = false; Tm.has = false; Tm.done = false; Tm.render(); };
  Tm.tick = function () {
    if (!Tm.running) return;
    var now = performance.now(); Tm.left -= ((now - Tm.last) / 1000) * (FE.speed || 1); Tm.last = now;
    if (Tm.left <= 0) { Tm.left = 0; Tm.finish(); }
    Tm.render();
  };
  Tm.finish = function () {
    Tm.running = false; Tm.done = true; clearInterval(Tm.id);
    if (FE.Sound) FE.Sound.chime();
    if (X.onTimeUp) X.onTimeUp();
    var w = Tm.waiters; Tm.waiters = []; w.forEach(function (f) { f(true); });
    Tm.render();
  };
  Tm.waitDone = function (tok) {
    return new Promise(function (res) {
      if (Tm.done) return res(true);
      Tm.waiters.push(function () { res(tok === S.tok); });
    });
  };
  Tm.render = function () {
    var ring = $("#hud .ring");
    if (ring) {
      ring.hidden = !Tm.has;
      ring.classList.toggle("done", Tm.done); ring.classList.toggle("idle", !Tm.running && !Tm.done);
      $(".fg", ring).style.strokeDashoffset = CIRC * (1 - (Tm.total ? Tm.left / Tm.total : 0));
      $(".t", ring).textContent = Tm.has ? fmt(Tm.left) : "";
    }
    var r = $("#tmr"); if (r) r.textContent = Tm.has ? fmt(Tm.left) : "--:--";
    X.updateBar && X.updateBar();
  };
  X.timerToggle = function () {
    if (!Tm.has) return;
    if (Tm.running) Tm.pause(); else { Tm.start(); if (V) { /* speaking time: narration stays quiet */ V.cancel(); X.setTalking(null, false); X.hideBubble(); } }
  };

  /* ---------------- narration and flows ---------------- */
  var waiters = [];
  function waitResume() { return new Promise(function (r) { waiters.push(r); }); }
  function flushWaiters() { var w = waiters; waiters = []; w.forEach(function (f) { f(); }); }
  function unpackLine(l) { return Array.isArray(l) ? { who: l[0], t: l[1], mood: l[2], pose: l[3] } : l; }

  async function sayLine(line, tok, opts) {
    opts = opts || {};
    var ln = unpackLine(line);
    X.lineMoodApply(ln.who, ln.mood, ln.pose);
    if (S.step && S.step.silent && !opts.sample) X.hideBubble(); else X.showBubble(ln.who, ln.t, { sample: opts.sample, label: opts.label, name: opts.name });
    var plain = FE.plain(ln.t);
    for (;;) {
      while (S.paused || S.listening) { await waitResume(); if (tok !== S.tok) return; }
      X.setTalking(ln.who, true);
      S.narrating = true;
      var ok = await V.speak(plain, { role: ln.who, mood: ln.mood, onWord: X.hlWord, muted: !P.narration });
      S.narrating = false;
      X.setTalking(ln.who, false);
      if (tok !== S.tok) return;
      if (ok) break;
    }
    $$(".bubble .wu.say").forEach(function (u) { u.classList.remove("say"); });
  }
  async function narrate(lines, tok) {
    for (var i = 0; i < lines.length; i++) {
      if (tok !== S.tok) return false;
      S.lineIdx = i;
      await sayLine(lines[i], tok);
      if (tok !== S.tok) return false;
      await X.sleep(S.mode === "demo" ? 250 : 350, tok);
    }
    return tok === S.tok;
  }
  async function hold(ms, tok) {
    var left = ms;
    while (left > 0) {
      if (tok !== S.tok) return false;
      if (S.paused || S.listening) { await waitResume(); continue; }
      await X.sleep(100, tok); left -= 100;
    }
    return tok === S.tok;
  }

  async function demoFlow(step, tok) {
    // reveal everything progressively, with the sample responses clearly labelled as fictional
    var gap = $("#panel [data-rvx]") ? 2400 : 800;
    var limit = step.revealTo != null ? step.revealTo : S.revMax;
    while (S.rev < limit && tok === S.tok) { if (!(await hold(gap, tok))) return; X.setRev(S.rev + 1); }
    var sec = step.timer ? Math.min(step.timer, P.demoSec) : 0;
    if (step.timer) { Tm.set(sec); Tm.start(); }
    var samples = step.sample || [];
    for (var i = 0; i < samples.length; i++) {
      if (tok !== S.tok) return;
      await sayLine([samples[i][0], samples[i][1], "smile", null], tok, { sample: true, label: U.sampleTag });
      if (tok !== S.tok) return;
      await X.sleep(250, tok);
    }
    X.hideBubble(); X.setTalking(null, false);
    if (step.timer) { var ok = await Tm.waitDone(tok); if (!ok) return; await hold(400, tok); }
    else await hold(step.wait ? 1600 : 700, tok);
    if (tok === S.tok && !S.paused) X.next(true);
  }
  async function classFlow(step, tok) {
    if (step.timer) {
      if (P.autoTimer) { Tm.start(); }
      return;
    }
    if (step.auto || !step.wait) {
      var ok = await hold(step.auto ? 900 : 1200, tok);
      if (ok && tok === S.tok) X.next(true);
    }
  }
  async function runStep(tok) {
    var step = S.step;
    await narrate(step.say || [], tok);
    if (tok !== S.tok) return;
    X.hideBubble(); X.setTalking(null, false);
    if (S.mode === "demo") await demoFlow(step, tok); else await classFlow(step, tok);
  }

  /* ---------------- memory jar, confetti, celebration ---------------- */
  var JAR_GOAL = 20, STAR_PATH = "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.100l6.9-.8z";
  X.updateJar = function (grew) {
    var jar = X.el.jar; if (!jar) return;
    jar.hidden = !S.started;
    var n = X.D.stars || 0, pct = Math.min(1, n / JAR_GOAL);
    $("#jarlevel").style.transform = "translateY(" + (-100 * pct) + "px)";
    $("#jarcount").textContent = n;
    jar.classList.toggle("full", n >= JAR_GOAL);
    if (grew) {
      var g = $("#jarstars"), x = 26 + Math.random() * 48, y = 112 - Math.random() * Math.max(10, 90 * pct);
      g.insertAdjacentHTML("beforeend", '<path transform="translate(' + x + "," + y + ') scale(.5)" d="' + STAR_PATH + '" fill="#fff" opacity=".9"/>');
    }
  };
  X.confetti = function (n) {
    if (X.reduceMotion()) return;
    var cols = ["#F26B5B", "#F2B544", "#1F9E9A", "#6B4C9A", "#8DBF8B", "#3C78C9", "#FF8FA3"];
    for (var i = 0; i < n; i++) {
      var e = document.createElement("i"); e.className = "cf";
      e.style.left = Math.round(80 + Math.random() * 1760) + "px";
      e.style.background = cols[i % cols.length];
      e.style.setProperty("--dx", Math.round(-160 + Math.random() * 320) + "px");
      e.style.setProperty("--rot", Math.round(360 + Math.random() * 720) + "deg");
      e.style.animationDelay = (Math.random() * 0.5).toFixed(2) + "s";
      e.style.animationDuration = (1.6 + Math.random() * 1.2).toFixed(2) + "s";
      X.el.stage.appendChild(e);
      setTimeout(function (el) { el.remove(); }.bind(null, e), 3600);
    }
  };
  X.addStar = function () {
    if (!S.started) return;
    var before = X.D.stars || 0;
    X.D.stars = before + 1; X.saveData();
    if (FE.Sound) FE.Sound.star();
    var st = document.createElement("div"); st.className = "flystar";
    st.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + STAR_PATH + '" fill="#FFC93C" stroke="#0A2E63" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    X.el.stage.appendChild(st);
    if (!X.reduceMotion() && st.animate) {
      var a = st.animate([{ transform: "translate(0,0) scale(.2) rotate(0)", opacity: 0 }, { transform: "translate(0,-40px) scale(1.6) rotate(120deg)", opacity: 1, offset: 0.35 }, { transform: "translate(-860px,500px) scale(.45) rotate(360deg)", opacity: 1 }], { duration: 950, easing: "cubic-bezier(.4,.1,.3,1)" });
      a.onfinish = function () { st.remove(); X.updateJar(true); };
    } else { st.remove(); X.updateJar(true); }
    if (X.D.stars === JAR_GOAL) setTimeout(function () { X.confetti(70); X.toast(U.jarFull); }, 900);
    if (X.refreshNotes) X.refreshNotes();
  };
  var cheerTok = 0;
  X.onTimeUp = function () {
    X.confetti(S.mode === "demo" ? 10 : 22);
    ["maya", "theo"].forEach(function (id) {
      var a = X.actors[id]; if (!a) return;
      var pose = a.person.dataset.pose || "rest", mood = a.person.dataset.mood || "smile";
      A.setPose(a.person, "cheer"); A.setMood(a.person, "laugh");
      setTimeout(function () { if (X.actors[id] === a) { A.setPose(a.person, pose); A.setMood(a.person, mood); } }, 1900);
    });
    if (S.mode === "demo" || !P.celebrate || S.listening) return;
    var my = ++cheerTok, who = Math.random() < 0.5 ? "maya" : "theo", text = U.cheers[Math.floor(Math.random() * U.cheers.length)];
    X.showBubble(who, text, {});
    X.el.bubble.classList.add("cheer");
    X.setTalking(who, true);
    V.speak(FE.plain(text), { role: who, mood: "grin", muted: !P.narration }).then(function () {
      X.setTalking(who, false);
      setTimeout(function () { if (my === cheerTok && X.bubbleState && X.bubbleState.who === who && !S.narrating) X.hideBubble(); }, 1400);
    });
  };

  /* ---------------- HUD ---------------- */
  X.updateHUD = function () {
    var ch = S.chapter, st = S.step;
    $("#hud .chip").innerHTML = '<span class="n">' + ch.n + "</span>" + T(ch.title);
    var ph = $("#hud .phase");
    ph.innerHTML = st.phase ? T(st.phase) : "";
    ph.hidden = !st.phase;
    X.el.ribbon.hidden = S.mode !== "demo";
  };

  /* ---------------- navigation ---------------- */
  /* The scene and panel of a step may build on earlier steps of the same chapter (cast, camera, props, panel).
   * Rebuilding them from the chapter start makes any step correct however the teacher arrived at it
   * (next, back, progress strip, chapter list). */
  X.mergedScene = function (ci, si) {
    var steps = X.chapters()[ci].steps, m = { cast: {} };
    for (var i = 0; i <= si; i++) {
      var sc = steps[i].scene; if (!sc) continue;
      for (var k in sc) {
        if (k === "cast") {
          for (var id in sc.cast) {
            var v = sc.cast[id];
            if (v === null) m.cast[id] = null;
            else { var prev = m.cast[id] || {}; var o = {}; for (var a in prev) o[a] = prev[a]; for (var b in v) o[b] = v[b]; m.cast[id] = o; }
          }
        } else if (k !== "region") m[k] = sc[k];
      }
    }
    return m;
  };
  X.panelFor = function (ci, si) {
    var steps = X.chapters()[ci].steps;
    for (var i = si; i >= 0; i--) if ("panel" in steps[i]) return steps[i].panel;
    return null;
  };
  X.go = async function (ci, si, opts) {
    opts = opts || {};
    var chs = X.chapters();
    ci = Math.max(0, Math.min(chs.length - 1, ci));
    si = Math.max(0, Math.min(chs[ci].steps.length - 1, si));
    S.tok++; var tok = S.tok; cheerTok++;
    if (S.started && FE.Sound && (ci !== S.ci || si !== S.si)) FE.Sound.whoosh();
    V.cancel(); flushWaiters(); Tm.waiters = [];
    X.hideBubble(); X.setTalking(null, false);
    Tm.stop();
    var chapterChanged = ci !== S.ci || !S.step;
    S.ci = ci; S.si = si; S.chapter = chs[ci]; S.step = chs[ci].steps[si];
    S.listening = false; S.narrating = false;
    X.closeTray();
    var step = S.step;
    X.regionOverride = (step.scene && step.scene.region) || null;
    X.updateHUD();
    await X.applyScene(X.mergedScene(ci, si));
    if (tok !== S.tok) return;
    var pn = X.panelFor(ci, si);
    if (pn === null) { if (X.panelKey !== null || !X.el.panel.hidden) X.renderPanel(null); X.panelKey = null; }
    else if (pn.key !== X.panelKey || opts.forcePanel) X.renderPanel(pn);
    if (step.reveal != null) X.setRev(Math.max(S.rev, step.reveal), true);
    X.updatePhase(step.phase);
    X.refreshWyr && X.refreshWyr();
    X.updateHUD();
    if (step.timer) Tm.set(step.timer); else Tm.render();
    X.updateBar();
    X.buildStrip && X.buildStripState();
    X.updateJar();
    X.saveSession();
    runStep(tok);
  };
  X.next = function (auto) {
    var chs = X.chapters();
    if (S.si < S.chapter.steps.length - 1) X.go(S.ci, S.si + 1);
    else if (S.ci < chs.length - 1) X.go(S.ci + 1, 0);
    else { S.tok++; V.cancel(); }
  };
  X.back = function () {
    if (S.si > 0) X.go(S.ci, S.si - 1);
    else if (S.ci > 0) X.go(S.ci - 1, X.chapters()[S.ci - 1].steps.length - 1);
  };
  X.chapNext = function () { if (S.ci < X.chapters().length - 1) X.go(S.ci + 1, 0); };
  X.chapPrev = function () { if (S.si > 0) X.go(S.ci, 0); else if (S.ci > 0) X.go(S.ci - 1, 0); };
  X.replay = function () { S.paused = false; X.go(S.ci, S.si); };
  X.pause = function () { if (S.paused) return; S.paused = true; V.cancel(); X.setTalking(null, false); Tm.pause(); X.updateBar(); };
  X.resume = function () { if (!S.paused) return; S.paused = false; if (Tm.wasRunning) Tm.start(); flushWaiters(); X.updateBar(); };
  X.togglePlay = function () { if (S.paused) X.resume(); else X.pause(); };
  X.saveSession = function () { try { root.sessionStorage.setItem("fe.childhood.pos", JSON.stringify([S.ci, S.si])); } catch (e) {} };

  X.listen = async function (text, role) {
    if (!text) return;
    S.listening = true;
    X.setTalking(null, false);
    await V.speak(text, { role: role || "maya", muted: !P.narration });
    S.listening = false;
    flushWaiters();
  };

  X.setMode = function (m) {
    if (S.mode === m) return;
    S.mode = m; P.mode = m; X.savePrefs();
    root.document.getElementById("app").dataset.mode = m;
    X.updateHUD(); X.updateBar();
    S.paused = false;
    X.go(S.ci, S.si);
  };

  /* ---------------- tray: starters + fictional example ---------------- */
  X.closeTray = function () { S.showStarters = false; S.showExample = false; var t = $("#tray"); if (t) t.remove(); X.updateBar && X.updateBar(); };
  X.reflowTray = function () {};
  function openTray(kind) {
    var step = S.step, old = $("#tray"); if (old) old.remove();
    S.showStarters = kind === "starters"; S.showExample = kind === "example";
    var html, label;
    if (kind === "starters") {
      if (!step.starters || !step.starters.length) { S.showStarters = false; return; }
      html = '<div class="tt">' + T(U.cStarters) + '</div><div class="chips">' + step.starters.map(function (s) { return '<span class="chip">' + T(s) + "</span>"; }).join("") + "</div>";
    } else {
      if (!step.example) { S.showExample = false; return; }
      var ex = step.example;
      html = '<div class="tt">' + T(ex[2] || U.exampleTag) + (X.NAMES[ex[0]] ? " · " + T(X.NAMES[ex[0]]) : "") + '</div><div class="exq">' + T(ex[1]) + X.sayBtn(ex[1], ex[0]) + "</div>";
    }
    var tray = mk("div", "", html); tray.id = "tray";
    var pos = X.panelPos;
    var left = pos === "R" ? 990 : pos === "L" ? 48 : pos === "C" ? 300 : 360;
    var width = pos === "C" ? 1320 : pos === "none" ? 1200 : 882;
    tray.style.left = left + "px"; tray.style.width = width + "px"; tray.style.bottom = "128px";
    X.el.stage.appendChild(tray);
    if (kind === "example" && step.example) X.listen(FE.plain(step.example[1]).replace(/[“”]/g, ""), step.example[0]);
    X.updateBar();
  }
  X.toggleTray = function (kind) {
    if ((kind === "starters" && S.showStarters) || (kind === "example" && S.showExample)) X.closeTray();
    else openTray(kind);
  };

  /* ---------------- control bar ---------------- */
  var btnDefs = {};
  function cbtn(id, icon, label, aria, cls) {
    btnDefs[id] = { label: label };
    return '<button class="cb ' + (cls || "") + '" id="cb-' + id + '" data-act="' + id + '" aria-label="' + esc(aria || label) + '"><span class="ic">' + icon + '</span><span class="lb">' + T(label) + "</span></button>";
  }
  function setLabel(id, label, icon) {
    var b = $("#cb-" + id); if (!b) return;
    if (b.dataset.lab !== label) { $(".lb", b).innerHTML = T(label); b.dataset.lab = label; }
    if (icon && b.dataset.icn !== icon) { $(".ic", b).innerHTML = IC[icon]; b.dataset.icn = icon; }
  }
  X.buildBar = function () {
    var bar = X.el.bar;
    bar.innerHTML =
      '<div id="strip" role="group" aria-label="Lesson progress"></div><div id="cbrow">' +
      '<div class="cg">' + cbtn("chPrev", IC.chPrev, U.cPrevChapter, U.aPrevChapter) + cbtn("back", IC.back, U.cBack, U.aBack) + cbtn("play", IC.pause, U.cPause, U.cPause, "accent") + cbtn("next", IC.next, U.cNext, U.aNext) + cbtn("chNext", IC.chNext, U.cNextChapter, U.aNextChapter) + "</div>" +
      '<div class="cg">' + cbtn("replay", IC.replay, U.cReplay) +
      '<div class="tmwrap"><button class="cb mini" id="cb-tmMinus" data-act="tmMinus" aria-label="' + esc(U.aTimerMinus) + '"><span class="ic">−30</span></button>' +
      '<button class="cb" id="cb-timer" data-act="timer" aria-label="' + esc(U.cTimer) + '"><span class="ic tmr" id="tmr">--:--</span><span class="lb">' + T(U.cStart) + '</span></button>' +
      '<button class="cb mini" id="cb-tmPlus" data-act="tmPlus" aria-label="' + esc(U.aTimerPlus) + '"><span class="ic">+30</span></button>' +
      '<button class="cb mini" id="cb-tmReset" data-act="tmReset" aria-label="' + esc(U.cReset) + '"><span class="ic">' + IC.replay + "</span></button></div></div>" +
      '<div class="cg">' + cbtn("reveal", IC.reveal, U.cReveal) + cbtn("star", IC.star, U.cStar, U.aStar, "starbtn") + cbtn("starters", IC.starters, U.cStarters) + cbtn("example", IC.example, U.cExample) + cbtn("words", IC.words, U.cWords) + "</div>" +
      '<div class="cg">' + cbtn("chapters", IC.chapters, U.cChapters) + cbtn("notes", IC.notes, U.cNotes) + cbtn("mode", IC.mode, U.cClass) + "</div>" +
      '<div class="cg"><label class="volwrap"><input id="vol" type="range" min="0" max="100" value="' + Math.round(P.volume * 100) + '" aria-label="' + esc(U.cVolume) + '"><span>' + T(U.cVolume) + "</span></label>" +
      cbtn("full", IC.full, U.cFull) + cbtn("settings", IC.gear, U.cSettings) + '<button class="cb" id="cb-hide" data-act="hide" aria-controls="controlbar" aria-expanded="true" aria-label="' + esc(U.cHide) + '"><span class="ic">' + IC.hide + '</span><span class="lb">' + T(U.cHide) + "</span></button></div></div>";
    X.el.showbar.innerHTML = '<span class="ic">' + IC.show + "</span><span>" + T(U.cShow) + "</span>";
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]"); if (!b) return;
      barAct(b.dataset.act);
    });
    $("#vol").addEventListener("input", function (e) { P.volume = e.target.value / 100; V.volume = P.volume; if (FE.Sound) FE.Sound.setMasterVolume(P.volume); X.savePrefs(); });
    X.buildStrip();
  };
  function barAct(a) {
    switch (a) {
      case "chPrev": X.chapPrev(); break; case "back": X.back(); break; case "play": X.togglePlay(); break;
      case "next": X.next(); break; case "chNext": X.chapNext(); break; case "replay": X.replay(); break;
      case "timer": X.timerToggle(); break; case "tmMinus": Tm.adjust(-30); break; case "tmPlus": Tm.adjust(30); break; case "tmReset": Tm.reset(); break;
      case "reveal": X.setRev(S.rev + 1); break;
      case "star": X.addStar(); break;
      case "starters": X.toggleTray("starters"); break; case "example": X.toggleTray("example"); break;
      case "words": X.openDrawer("words"); break; case "chapters": X.openModal("plan"); break; case "notes": X.openDrawer("notes"); break;
      case "mode": X.setMode(S.mode === "class" ? "demo" : "class"); break;
      case "full": X.toggleFull(); break; case "settings": X.openDrawer("settings"); break; case "hide": X.setBarHidden(true); break;
    }
  }
  X.updateBar = function () {
    if (!$("#cb-play")) return;
    var st = S.step;
    var playing = !S.paused;
    setLabel("play", playing ? U.cPause : U.cPlay, playing ? "pause" : "play");
    $("#cb-play").setAttribute("aria-pressed", String(!playing));
    $("#cb-play").classList.toggle("accent", true);
    setLabel("timer", Tm.running ? U.cStop : U.cStart);
    $("#cb-timer").disabled = !Tm.has; $("#cb-tmMinus").disabled = $("#cb-tmPlus").disabled = $("#cb-tmReset").disabled = !Tm.has;
    $("#cb-timer").classList.toggle("on", Tm.running);
    var rv = $("#cb-reveal"); rv.disabled = !(S.revMax > 0 && S.rev < S.revMax);
    var lb = $(".lb", rv); var cnt = S.revMax ? " " : "";
    var cEl = $(".cnt", rv); if (!cEl) { cEl = mk("span", "cnt"); rv.appendChild(cEl); }
    cEl.textContent = S.revMax ? S.rev + "/" + S.revMax : "";
    var stb = $("#cb-starters"), exb = $("#cb-example");
    stb.disabled = !(st && st.starters && st.starters.length); exb.disabled = !(st && st.example);
    stb.classList.toggle("on", S.showStarters); exb.classList.toggle("on", S.showExample);
    stb.setAttribute("aria-pressed", String(S.showStarters)); exb.setAttribute("aria-pressed", String(S.showExample));
    setLabel("mode", S.mode === "class" ? U.cClass : U.cDemo);
    $("#cb-mode").setAttribute("aria-label", "Mode: " + (S.mode === "class" ? "Class" : "Demo") + ". Press to switch.");
    var fs = !!document.fullscreenElement;
    setLabel("full", fs ? U.cExitFull : U.cFull, fs ? "exit" : "full");
    $("#cb-back").disabled = S.ci === 0 && S.si === 0;
    var last = S.ci === X.chapters().length - 1 && S.si === S.chapter.steps.length - 1;
    $("#cb-next").disabled = last;
    $("#cb-chPrev").disabled = S.ci === 0 && S.si === 0; $("#cb-chNext").disabled = S.ci === X.chapters().length - 1;
  };
  X.buildStrip = function () {
    var strip = $("#strip"); if (!strip) return;
    strip.innerHTML = X.chapters().map(function (c, ci) {
      return '<div class="sg" data-ci="' + ci + '" style="flex:' + c.min + '">' + c.steps.map(function (s, si) {
        return '<button class="st" data-ci="' + ci + '" data-si="' + si + '" style="flex:' + s.sec + '" aria-label="Chapter ' + c.n + ", step " + (si + 1) + '"></button>';
      }).join("") + "</div>";
    }).join("");
    strip.addEventListener("click", function (e) { var b = e.target.closest(".st"); if (b) X.go(+b.dataset.ci, +b.dataset.si); });
  };
  X.buildStripState = function () {
    $$("#strip .sg").forEach(function (g) { g.classList.toggle("cur", +g.dataset.ci === S.ci); });
    $$("#strip .st").forEach(function (b) {
      var ci = +b.dataset.ci, si = +b.dataset.si;
      b.classList.toggle("cur", ci === S.ci && si === S.si);
      b.classList.toggle("done", ci < S.ci || (ci === S.ci && si < S.si));
    });
  };

  /* collapsible bar: removes it from the layout (the stage grows) and leaves a small Show button */
  X.setBarHidden = function (h) {
    P.controlsHidden = !!h; X.savePrefs();
    X.el.bar.hidden = !!h; X.el.showbar.hidden = !h;
    var hb = $("#cb-hide"); if (hb) hb.setAttribute("aria-expanded", String(!h));
    X.el.showbar.setAttribute("aria-expanded", "false");
    X.fit();
    if (h) X.el.showbar.focus({ preventScroll: true }); else { var b = $("#cb-hide"); if (b) b.focus({ preventScroll: true }); }
  };
  X.toggleFull = function () {
    var d = document;
    if (d.fullscreenElement) d.exitFullscreen && d.exitFullscreen();
    else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(function () { X.toast("Full screen is not available here."); });
  };
  X.toast = function (msg) {
    var t = $("#toast"); if (t) t.remove();
    t = mk("div", "", esc(msg)); t.id = "toast"; t.setAttribute("role", "status");
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  };

  /* ---------------- drawers + modals ---------------- */
  var drawerKind = null;
  X.closeDrawer = function () { var d = X.el.drawer; d.hidden = true; d.innerHTML = ""; drawerKind = null; };
  X.openDrawer = function (kind) {
    if (drawerKind === kind) { X.closeDrawer(); return; }
    X.closeModal();
    drawerKind = kind;
    var d = X.el.drawer; d.hidden = false;
    d.setAttribute("role", "dialog");
    if (kind === "notes") renderNotes(d);
    else if (kind === "settings") renderSettings(d);
    else if (kind === "words") renderWords(d);
    d.addEventListener("click", drawerClick);
    var x = $(".dr-x", d); if (x) x.focus();
  };
  function head(title) { return '<div class="dr-h"><h2>' + T(title) + '</h2><button class="dr-x" data-close="1" aria-label="' + esc(U.cClose) + '">' + T(U.cClose) + "</button></div>"; }
  function drawerClick(e) {
    if (e.target.closest("[data-close]")) { X.closeDrawer(); return; }
    if (drawerKind === "words" && X.bankClick(e)) { renderWords(X.el.drawer, true); }
  }
  function renderWords(d, keep) {
    d.innerHTML = head(U.bankTitle) + '<div class="dr-b"><div class="bank">' + X.bankHtml() + "</div></div>";
  }
  X.refreshBank = (function (orig) { return function () { orig(); if (drawerKind === "words") renderWords(X.el.drawer, true); }; })(X.refreshBank);

  /* ---- notes drawer ---- */
  var notesTab = 0;
  function renderNotes(d) {
    d.innerHTML = head(U.nTitle) + '<div class="dr-tabs" role="tablist">' + U.nTabs.map(function (t, i) { return '<button role="tab" data-nt="' + i + '" aria-selected="' + (i === notesTab) + '">' + T(t) + "</button>"; }).join("") + '</div><div class="dr-b" id="nbody"></div>';
    fillNotes();
    d.onclick = function (e) {
      if (e.target.closest("[data-close]")) { X.closeDrawer(); return; }
      var nt = e.target.closest("[data-nt]"); if (nt) { notesTab = +nt.dataset.nt; renderNotes(d); return; }
      notesClick(e);
    };
  }
  X.refreshNotes = function () { if (drawerKind === "notes" && notesTab === 0) fillNotes(); };
  var QTXT = ["one", "two", "three", "four"];
  function tallyHtml() {
    var D = X.D, out = [];
    for (var i = 1; i <= 4; i++) { var c = D.scale["a" + i]; if (c && c.some(Boolean)) out.push('<div class="tally-item"><div class="ti">' + T(U.claimLbl + " " + QTXT[i - 1]) + '</div><div class="tb">' + c.map(function (n, k) { return "<span>" + T(L.SCALE[k]) + ": <b>" + n + "</b></span>"; }).join("") + "</div></div>"); }
    for (var r = 1; r <= 4; r++) { var a = D.wyr["y" + r + "a"], b = D.wyr["y" + r + "b"]; if ((a && a.some(Boolean)) || (b && b.some(Boolean))) out.push('<div class="tally-item"><div class="ti">' + T(U.roundLbl + " " + QTXT[r - 1]) + '</div><div class="tb"><span>A: <b>' + (a ? a[0] : 0) + "</b> · B: <b>" + (a ? a[1] : 0) + "</b></span><span>" + T(U.wyrAgain) + " A: <b>" + (b ? b[0] : 0) + "</b> · B: <b>" + (b ? b[1] : 0) + "</b></span></div></div>"); }
    var rk = D.rank.map(function (id) { return T(L.QUALITIES.filter(function (q) { return q.id === id; })[0].w); }).join(" › ");
    out.push('<div class="tally-item"><div class="ti">' + T(U.rankingLbl) + '</div><div class="tb">' + rk + "</div></div>");
    var rf = Object.keys(D.reflect).filter(function (k) { return D.reflect[k]; });
    if (rf.length) out.push('<div class="tally-item"><div class="ti">' + T(U.reuseLbl) + '</div><div class="tb">' + rf.map(function (k) { return "<span>" + T(k) + ": <b>" + D.reflect[k] + "</b></span>"; }).join("") + "</div></div>");
    return out.length > 1 ? out.join("") : out.join("") + '<p class="nt">' + T(U.nNoTally) + "</p>";
  }
  function fillNotes() {
    var b = $("#nbody"); if (!b) return;
    var D = X.D;
    if (notesTab === 0) b.innerHTML = '<p class="nt">' + T(U.nTallyNote) + "</p>" + tallyHtml();
    else if (notesTab === 1) {
      var rows = ""; for (var i = 1; i <= D.students; i++) {
        var m = D.marks[i] || [0, 0, 0, 0];
        rows += "<tr><td>S" + i + "</td>" + m.map(function (v, k) { return '<td><span class="cntb"><button data-mk="' + i + "," + k + ',-1" aria-label="minus">−</button><b>' + v + '</b><button data-mk="' + i + "," + k + ',1" aria-label="plus">+</button></span></td>'; }).join("") + "</tr>";
      }
      b.innerHTML = '<p class="nt">' + T(U.nMarksNote) + '</p><table class="mk"><tr><th></th>' + U.nMarkCols.map(function (c) { return "<th>" + T(c) + "</th>"; }).join("") + "</tr>" + rows + '</table><div class="dr-row"><button class="btn" data-addst="1">+ S' + (D.students + 1) + '</button></div><p class="nt">' + T(U.nObs) + "</p>";
    } else if (notesTab === 2) {
      b.innerHTML = '<p class="nt">' + T(U.nNotesNote) + '</p><textarea id="notesTa" aria-label="Teacher notes">' + esc(D.notes) + "</textarea>";
      $("#notesTa").addEventListener("input", function (e) { D.notes = e.target.value; X.saveData(); });
    } else {
      b.innerHTML = '<p>' + T(U.nDataNote) + '</p><label class="sw"><input type="checkbox" id="saveChk"' + (P.saveData ? " checked" : "") + "><span>" + T(U.nSave) + '</span></label><p class="nt">' + T(U.nSaveWarn) + '</p><div class="dr-row"><button class="btn" data-exp="json">' + T(U.nExportJson) + '</button><button class="btn" data-exp="csv">' + T(U.nExportCsv) + '</button><button class="btn warn" id="resetAll" data-reset="1">' + T(U.nResetAll) + '</button></div><p class="nt">' + T(U.nObs) + "</p>";
      $("#saveChk").addEventListener("change", function (e) {
        P.saveData = e.target.checked; X.savePrefs();
        if (P.saveData) X.saveData(); else X.clearSaved();
      });
    }
  }
  function notesClick(e) {
    var D = X.D, t = e.target;
    var mk_ = t.closest("[data-mk]");
    if (mk_) { var p = mk_.dataset.mk.split(","); var m = D.marks[p[0]] || (D.marks[p[0]] = [0, 0, 0, 0]); m[+p[1]] = Math.max(0, m[+p[1]] + +p[2]); X.saveData(); fillNotes(); return; }
    if (t.closest("[data-addst]")) { D.students = Math.min(12, D.students + 1); fillNotes(); return; }
    var ex = t.closest("[data-exp]"); if (ex) { exportData(ex.dataset.exp); return; }
    var rs = t.closest("[data-reset]");
    if (rs) {
      if (!rs.classList.contains("arm")) { rs.classList.add("arm"); rs.innerHTML = T(U.nConfirm); setTimeout(function () { rs.classList.remove("arm"); rs.innerHTML = T(U.nResetAll); }, 3500); }
      else { X.D = Object.assign(X.D, X.freshData()); X.clearSaved(); X.renderPlan(); X.renderRubric(); notesTab = 3; fillNotes(); X.toast("Cleared."); if (X.panelKey) X.go(S.ci, S.si, { forcePanel: true }); }
    }
  }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  X.exportObject = function () {
    var D = X.D;
    return { type: "teacher-observations", note: "Entered by the teacher. Anonymous. Not automatic assessment of speaking or pronunciation.", lesson: "Childhood: Memories, Games, and Growing Up", exportedAt: new Date().toISOString(),
      memoryJarStars: D.stars || 0, opinionScale: D.scale, wouldYouRather: D.wyr, ranking: D.rank, rankingTopTwoMarked: D.rankTop, gamesDayPlan: D.plan, rubric: D.rubric, reflection: D.reflect, participationMarks: D.marks, marksColumns: ["Speaking", "Clear reason", "Vocabulary", "Listening"], notes: D.notes };
  };
  X.exportCsv = function () {
    var o = X.exportObject(), rows = [["section", "item", "field", "value"]];
    Object.keys(o.opinionScale).forEach(function (k) { o.opinionScale[k].forEach(function (n, i) { rows.push(["opinion scale", k, L.SCALE[i], n]); }); });
    Object.keys(o.wouldYouRather).forEach(function (k) { o.wouldYouRather[k].forEach(function (n, i) { rows.push(["would you rather", k, i ? "B" : "A", n]); }); });
    o.ranking.forEach(function (id, i) { rows.push(["ranking", id, "position", i + 1]); });
    Object.keys(o.participationMarks).forEach(function (s) { o.participationMarks[s].forEach(function (n, i) { rows.push(["participation marks (teacher)", "S" + s, o.marksColumns[i], n]); }); });
    Object.keys(o.rubric).forEach(function (s) { Object.keys(o.rubric[s]).forEach(function (c) { rows.push(["rubric (teacher)", "S" + s, U.rubricCrit[c], o.rubric[s][c]]); }); });
    Object.keys(o.reflection).forEach(function (k) { rows.push(["reflection", k, "count", o.reflection[k]]); });
    rows.push(["memory jar", "stars", "count", o.memoryJarStars]);
    rows.push(["notes", "teacher", "text", o.notes]);
    return rows.map(function (r) { return r.map(function (c) { c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\n");
  };
  function exportData(kind) {
    var stamp = new Date().toISOString().slice(0, 10);
    if (kind === "json") download("speaking-club-childhood-" + stamp + ".json", JSON.stringify(X.exportObject(), null, 2), "application/json");
    else download("speaking-club-childhood-" + stamp + ".csv", X.exportCsv(), "text/csv");
  }

  /* ---- settings drawer ---- */
  function renderSettings(d) {
    var roles = ["maya", "theo", "alex", "jordan"];
    var voices = V.voices;
    var vrows = voices.length ? roles.map(function (r) {
      var cur = V.assign[r] && V.assign[r].voiceURI;
      return '<div class="vrow"><span class="vn">' + T(U.sRoles[r]) + '</span><select data-vr="' + r + '" aria-label="' + esc(U.sRoles[r]) + '">' + voices.map(function (v) { return '<option value="' + esc(v.voiceURI) + '"' + (v.voiceURI === cur ? " selected" : "") + ">" + esc(v.name + " (" + v.lang + ")") + "</option>"; }).join("") + '</select><button class="btn" data-aud="' + r + '">' + T(U.sAudition) + "</button></div>";
    }).join("") : "<p>" + T(U.sVoiceNone) + "</p>";
    function sw(id, label, on, note) { return '<label class="sw"><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + "><span>" + T(label) + (note ? '<br><span class="nt">' + T(note) + "</span>" : "") + "</span></label>"; }
    d.innerHTML = head(U.sTitle) + '<div class="dr-b">' +
      "<h3 style=\"margin:0\">" + T(U.sVoices) + "</h3>" + vrows +
      '<div class="vrow"><span class="vn">' + T(U.sRate) + '</span><input type="range" id="rateR" min="70" max="130" value="' + Math.round(P.rate * 100) + '" aria-label="' + esc(U.sRate) + '"></div>' +
      sw("narrChk", U.sNarr, P.narration) + sw("musicChk", U.sMusic, P.music, U.sMusicD) +
      '<div class="vrow"><span class="vn">' + T(U.sMusicVol) + '</span><input type="range" id="musicV" min="0" max="100" value="' + Math.round(P.musicVol * 100) + '" aria-label="' + esc(U.sMusicVol) + '"></div>' +
      sw("sfxChk", U.sSfx, P.sfx) + sw("celChk", U.sCelebrate, P.celebrate) + sw("autoChk", U.sAuto, P.autoTimer) + sw("motionChk", U.sMotion, P.reduceMotion) +
      '<div class="vrow"><span class="vn" style="width:auto">' + T(U.sDemoSec) + '</span><select id="demoSel" aria-label="' + esc(U.sDemoSec) + '">' + [5, 10, 20, 30].map(function (n) { return '<option value="' + n + '"' + (P.demoSec === n ? " selected" : "") + ">" + n + " s</option>"; }).join("") + "</select></div>" +
      '<div class="dr-row"><button class="btn" data-m="script">' + T(U.sScript) + '</button><button class="btn" data-m="chart">' + T(U.sChart) + '</button><button class="btn" data-m="about">' + T(U.sAbout) + '</button><button class="btn" data-m="help">' + T(U.sShort) + '</button></div>' +
      '<div class="dr-row"><button class="btn warn" data-sreset="1">' + T(U.sReset) + "</button></div></div>";
    d.onclick = function (e) {
      if (e.target.closest("[data-close]")) { X.closeDrawer(); return; }
      var m = e.target.closest("[data-m]"); if (m) { X.openModal(m.dataset.m); return; }
      var au = e.target.closest("[data-aud]"); if (au) { X.listen(U.hello + " " + U.sRoles[au.dataset.aud] + ". " + U.audLine, au.dataset.aud); return; }
      if (e.target.closest("[data-sreset]")) { Object.assign(P, { music: false, sfx: true, autoTimer: true, demoSec: 10, reduceMotion: false, rate: 1, narration: true, voices: {} }); V.saved = {}; V.rate = 1; V.enabled = true; X.savePrefs(); applyPrefs(); renderSettings(d); }
    };
    d.onchange = function (e) {
      var t = e.target;
      if (t.dataset.vr) { V.setVoice(t.dataset.vr, t.value); P.voices = V.saved; X.savePrefs(); }
      else if (t.id === "narrChk") { P.narration = t.checked; V.enabled = t.checked; if (!t.checked) V.cancel(); X.savePrefs(); }
      else if (t.id === "musicChk") { P.music = t.checked; FE.Sound.unlock(); FE.Sound.music(P.music); X.savePrefs(); }
      else if (t.id === "sfxChk") { P.sfx = t.checked; FE.Sound.setSfx(P.sfx); X.savePrefs(); }
      else if (t.id === "celChk") { P.celebrate = t.checked; X.savePrefs(); }
      else if (t.id === "autoChk") { P.autoTimer = t.checked; X.savePrefs(); }
      else if (t.id === "motionChk") { P.reduceMotion = t.checked; applyPrefs(); X.savePrefs(); }
      else if (t.id === "demoSel") { P.demoSec = +t.value; X.savePrefs(); }
    };
    d.oninput = function (e) {
      var t = e.target;
      if (t.id === "rateR") { P.rate = t.value / 100; V.rate = P.rate; X.savePrefs(); }
      else if (t.id === "musicV") { P.musicVol = t.value / 100; FE.Sound.setMusicVolume(P.musicVol); X.savePrefs(); }
    };
  }

  /* ---- modals ---- */
  X.closeModal = function () { var m = X.el.modal; m.hidden = true; m.innerHTML = ""; };
  var planOpen = -1;
  function speakSecs(ch) { return ch.steps.reduce(function (a, s) { return a + (s.speak && s.timer ? s.timer : 0); }, 0); }
  X.speakSecs = speakSecs;
  function mmss(s) { return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }
  function planHtml() {
    var chs = X.chapters(), totalSec = 0, speak = 0;
    var rows = chs.map(function (c, ci) {
      var sp = speakSecs(c); totalSec += c.min * 60; speak += sp;
      var det = ci === planOpen ? '<div class="plan-det">' + c.steps.map(function (s) { return '<div class="sr' + (s.speak ? " sp" : "") + '"><i>' + mmss(s.sec) + "</i><span>" + T(s.t) + "</span></div>"; }).join("") + "</div>" : "";
      return '<div class="plan-row' + (ci === S.ci ? " cur" : "") + '" data-pc="' + ci + '" role="button" tabindex="0"><span class="pn">' + c.n + '</span><span class="pt">' + T(c.title) + "</span><span>" + c.min + " " + T(U.minutes) + "</span><span>" + mmss(sp) + '</span><button class="btn pri" data-go="' + ci + '">' + T(U.go) + "</button></div>" + det;
    }).join("");
    return '<div class="plan-head"><span></span><span>' + T(U.chapter) + '</span><span>' + T(U.planCols[1]) + "</span><span>" + T(U.planCols[2]) + "</span><span></span></div>" + rows +
      '<p class="nt" style="margin-top:8px"><b>' + T(U.planTotal) + ":</b> " + (totalSec / 60) + " " + T(U.minutes) + " · " + T(U.planSpeak) + ": " + mmss(speak) + " (" + (Math.round(speak / 6) / 10) + " " + T(U.minutes) + ")</p><p class=\"nt\">" + T(U.planNote) + "</p>";
  }
  X.openModal = function (kind) {
    X.closeDrawer();
    var m = X.el.modal; m.hidden = false;
    var title, body;
    if (kind === "plan") { title = U.planTitle; body = planHtml(); }
    else if (kind === "script") {
      title = U.scriptTitle;
      body = '<p class="nt">' + T(U.scriptNote) + "</p>" + X.chapters().map(function (c) {
        return '<h3 style="margin:10px 0 2px">' + c.n + ". " + T(c.title) + "</h3>" + c.steps.filter(function (s) { return s.say && s.say.length; }).map(function (s) {
          return s.say.map(function (l) { var u = unpackLine(l); return '<div class="script-line"><span class="sn">' + T(X.NAMES[u.who] || u.who) + "</span><span>" + T(u.t) + "</span></div>"; }).join("");
        }).join("");
      }).join("");
    } else if (kind === "chart") { title = U.chartTitle; body = '<img class="chartimg" src="assets/sound_chart.jpg" alt="Fluent English sound chart">'; }
    else if (kind === "about") { title = U.aboutTitle; body = U.aboutLines.map(function (l) { return "<p>" + T(l) + "</p>"; }).join("") + '<p class="nt">' + T(U.aboutDot) + "</p>"; }
    else { title = U.hTitle; body = U.hKeys.map(function (k) { return '<div class="keyrow"><kbd>' + T(k[0]) + "</kbd><span>" + T(k[1]) + "</span></div>"; }).join(""); }
    m.innerHTML = '<div class="mbox" role="dialog" aria-modal="true">' + head(title) + '<div class="dr-b">' + body + "</div></div>";
    m.onclick = function (e) {
      if (e.target === m || e.target.closest("[data-close]")) { X.closeModal(); return; }
      var go = e.target.closest("[data-go]"); if (go) { X.closeModal(); X.go(+go.dataset.go, 0); return; }
      var pc = e.target.closest("[data-pc]"); if (pc && !e.target.closest("button")) { planOpen = planOpen === +pc.dataset.pc ? -1 : +pc.dataset.pc; X.openModal("plan"); }
    };
    if (kind === "plan" && planOpen < 0) { planOpen = S.ci; X.openModal("plan"); return; }
    var x = $(".dr-x", m); if (x) x.focus();
  };

  /* ---------------- double-click dictionary ---------------- */
  var dictTok = 0;
  function wordAtPoint(e) {
    var u = e.target.closest && e.target.closest(".wu[data-w]");
    if (u) return { key: u.dataset.w, el: u };
    // fall back to the browser's word selection (teacher-typed text, option labels, etc.)
    var sel = window.getSelection && window.getSelection().toString().trim();
    if (sel && /^[A-Za-z'’-]+$/.test(sel)) return { key: FE.keyOf(sel), el: e.target };
    return null;
  }
  function phraseAround(u) {
    var sib = $$(".wu[data-w]", u.closest(".tx") || u.parentNode);
    var keys = sib.map(function (s) { return s.dataset.w; }), i = sib.indexOf(u);
    var best = null;
    (FE.LEX_PHRASES || []).forEach(function (ph) {
      for (var s = Math.max(0, i - ph.length + 1); s <= i; s++) {
        var ok = true; for (var k = 0; k < ph.length; k++) if (keys[s + k] !== ph[k]) { ok = false; break; }
        if (ok && (!best || ph.length > best.length)) best = ph;
      }
    });
    return best;
  }
  X.showDefinition = function (hit, ev) {
    var key = hit.key, ph = hit.el && hit.el.classList && hit.el.classList.contains("wu") ? phraseAround(hit.el) : null;
    var entry = (ph && FE.LEX_DEF[ph.join(" ")]) || FE.LEX_DEF[key] || FE.LEX_DEF[key.replace(/'s$/, "")];
    var show = ph && FE.LEX_DEF[ph.join(" ")] ? ph.join(" ") : key;
    var pop = X.el.popover; pop.hidden = false;
    var ipa = FE.ipaFor(ph ? ph.join(" ") : key) || (ph ? ph.map(function (k) { return FE.ipaFor(k) || ""; }).join(" ") : "");
    var ipaFix = ph ? "" : ipa;
    var wordHtml = T(show);
    var body = '<button class="dr-x xx" data-close="1" aria-label="' + esc(U.cClose) + '">' + T(U.cClose) + "</button>" +
      '<div class="pw">' + wordHtml + '<button class="sb" data-dp="word" aria-label="' + esc(U.dictWord) + '">' + X.SPK + "</button></div>";
    if (entry) {
      body += '<span class="pos">' + T(entry.pos) + "</span>" + (entry.lemma && entry.lemma !== show ? ' <span class="nt">' + T(U.dictForm) + " " + T(entry.lemma) + "</span>" : "") +
        '<div class="lbl">' + T(U.dictMeaning) + ' <button class="sb" style="width:32px;height:32px" data-dp="def" aria-label="' + esc(U.dictMeaning) + '">' + X.SPK + '</button></div><div class="def">' + T(entry.def) + "</div>" +
        '<div class="lbl">' + T(U.dictExample) + ' <button class="sb" style="width:32px;height:32px" data-dp="ex" aria-label="' + esc(U.dictExample) + '">' + X.SPK + '</button></div><div class="exs">' + T(entry.ex) + "</div>" +
        '<div class="pb"><button class="btn pri" data-dp="all">' + T(U.dictPlay) + '</button><button class="btn" data-dp="stop">' + T(U.dictStop) + "</button></div>";
    } else body += '<p class="def">' + T(U.dictNone) + "</p>";
    pop.innerHTML = body;
    var r = (hit.el.getBoundingClientRect ? hit.el.getBoundingClientRect() : { left: ev.clientX, bottom: ev.clientY, top: ev.clientY });
    var pw = Math.min(560, window.innerWidth * 0.94), ph2 = pop.offsetHeight;
    var left = Math.max(8, Math.min(window.innerWidth - pw - 8, r.left - 20));
    var top = r.bottom + 12; if (top + ph2 > window.innerHeight - 8) top = Math.max(8, r.top - ph2 - 12);
    pop.style.left = left + "px"; pop.style.top = top + "px";
    var my = ++dictTok;
    var texts = entry ? { word: FE.plain(show), def: FE.plain(entry.def), ex: FE.plain(entry.ex) } : { word: FE.plain(show) };
    async function play(seq) {
      var t2 = ++dictTok; S.listening = true; V.cancel();
      for (var i = 0; i < seq.length; i++) { if (t2 !== dictTok) break; var ok = await V.speak(texts[seq[i]], { role: "maya", muted: !P.narration }); if (!ok && t2 !== dictTok) break; await X.sleep(150); }
      if (t2 === dictTok) { S.listening = false; flushWaiters(); }
    }
    pop.onclick = function (e) {
      if (e.target.closest("[data-close]")) { X.closePopover(); return; }
      var b = e.target.closest("[data-dp]"); if (!b) return;
      var k = b.dataset.dp;
      if (k === "stop") { dictTok++; V.cancel(); S.listening = false; flushWaiters(); }
      else if (k === "all") play(["word", "def", "ex"]);
      else play([k]);
    };
    if (entry) play(["word", "def", "ex"]); else play(["word"]);
  };
  X.closePopover = function () { dictTok++; V.cancel(); S.listening = false; X.el.popover.hidden = true; X.el.popover.innerHTML = ""; flushWaiters(); };

  /* ---------------- preferences ---------------- */
  function applyPrefs() {
    document.getElementById("app").classList.toggle("reduce-motion", X.reduceMotion());
    V.volume = P.volume; V.rate = P.rate; V.enabled = P.narration; V.saved = P.voices || {};
    if (FE.Sound) { FE.Sound.setSfx(P.sfx); FE.Sound.setMusicVolume(P.musicVol); FE.Sound.setMasterVolume(P.volume); }
  }

  /* ---------------- keyboard ---------------- */
  function typing(t) { return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)); }
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (e.key === "Escape") {
      if (!X.el.popover.hidden) X.closePopover(); else if (!X.el.modal.hidden) X.closeModal(); else if (drawerKind) X.closeDrawer(); else if ($("#tray")) X.closeTray();
      return;
    }
    if (typing(t) || !S.started) return;
    var onBtn = t.tagName === "BUTTON" || t.tagName === "A";
    var k = e.key;
    if (k === "h" || k === "H") { e.preventDefault(); X.setBarHidden(!P.controlsHidden); }
    else if (k === "f" || k === "F") { e.preventDefault(); X.toggleFull(); }
    else if (k === " " && !onBtn) { e.preventDefault(); X.togglePlay(); }
    else if (k === "ArrowRight" && !(t.closest && t.closest(".rcard"))) { e.preventDefault(); e.shiftKey ? X.chapNext() : X.next(); }
    else if (k === "ArrowLeft" && !(t.closest && t.closest(".rcard"))) { e.preventDefault(); e.shiftKey ? X.chapPrev() : X.back(); }
    else if (k === "r" || k === "R") X.replay();
    else if (k === "t" || k === "T") X.timerToggle();
    else if (k === "n" || k === "N") X.setRev(S.rev + 1);
    else if (k === "s" || k === "S") X.toggleTray("starters");
    else if (k === "e" || k === "E") X.toggleTray("example");
    else if (k === "w" || k === "W") X.openDrawer("words");
    else if (k === "j" || k === "J") X.addStar();
    else if (k === "?") X.openModal("help");
  });
  document.addEventListener("dblclick", function (e) {
    if (e.target.closest("#start") && !S.started && !e.target.closest(".wu")) return;
    var hit = wordAtPoint(e);
    if (!hit) return;
    if (window.getSelection) window.getSelection().removeAllRanges();
    X.showDefinition(hit, e);
  });
  document.addEventListener("mousedown", function (e) {
    if (!X.el.popover.hidden && !e.target.closest("#popover")) X.closePopover();
  });
  document.addEventListener("fullscreenchange", function () { X.fit(); X.updateBar(); });

  /* ---------------- start screen + boot ---------------- */
  function startHtml() {
    var n = V.voices.length;
    return '<div class="start-in"><img class="lg" src="assets/fluent_english_logo.png" alt="Fluent English">' +
      "<h1>" + T(U.lessonTitle) + '</h1><div class="sub">' + T(U.club) + "</div>" +
      '<div class="modes"><div class="mcard"><h2>' + T(U.classModeT) + "</h2><div>" + T(U.classModeD) + '</div><button class="mbtn" data-start="class">' + T(U.startClass) + "</button></div>" +
      '<div class="mcard"><h2>' + T(U.demoModeT) + "</h2><div>" + T(U.demoModeD) + '</div><button class="mbtn alt" data-start="demo">' + T(U.startDemo) + "</button></div></div>" +
      '<div class="start-info"><div>' + T(U.startTime) + "</div>" +
      '<div class="row"><b>' + T(U.audioCheck) + ":</b> " + (n ? T(U.audioOk) + " <b id=\"vcount\">" + n + "</b>" : T(U.audioNone)) + '<button class="btn" data-test="1">' + T(U.audioTest) + "</button></div>" +
      '<div class="row"><label class="stog"><input type="checkbox" id="stMusic"' + (P.music ? " checked" : "") + "> " + T(U.startMusic) + '</label><label class="stog"><input type="checkbox" id="stSfx"' + (P.sfx ? " checked" : "") + "> " + T(U.startSfx) + "</label></div>" +
      "<div>" + T(U.tipH) + " " + T(U.tipDbl) + "</div><div>" + T(U.tipShare) + "</div></div></div>";
  }
  X.refreshStart = function () { if (!S.started) $("#start").innerHTML = startHtml(); };

  X.boot = function () {
    ["jar", "viewport", "stagebox", "stage", "world", "tailsvg", "wipe", "vig", "polaroid", "overlays", "bubble", "avatar", "panel", "hud", "ribbon", "drawer", "modal", "popover", "start", "showbar"].forEach(function (id) { X.el[id] = document.getElementById(id); });
    X.el.bar = document.getElementById("controlbar");
    X.el.ribbon.innerHTML = T(U.demoShort) + " · " + T(U.sampleTag);
    applyPrefs();
    V.init();
    X.buildBar();
    X.bindPanel();
    new ResizeObserver(X.fit).observe(X.el.viewport);
    window.addEventListener("resize", X.fit);
    X.fit();
    X.el.showbar.addEventListener("click", function () { X.setBarHidden(false); });
    X.setBarHidden(!!P.controlsHidden);
    X.updateBar();
    document.getElementById("app").dataset.mode = S.mode;
    $("#start").innerHTML = startHtml();
    V.onVoices = function () { X.refreshStart(); };
    $("#start").addEventListener("change", function (e) {
      if (e.target.id === "stMusic") { P.music = e.target.checked; X.savePrefs(); }
      if (e.target.id === "stSfx") { P.sfx = e.target.checked; FE.Sound.setSfx(P.sfx); X.savePrefs(); }
    });
    $("#start").addEventListener("click", function (e) {
      var st = e.target.closest("[data-start]");
      if (st) { startLesson(st.dataset.start); return; }
      if (e.target.closest("[data-test]")) { FE.Sound.unlock(); X.listen(U.welcomeTest, "maya"); }
    });
    X.updateHUD && (S.chapter = X.chapters()[0], S.step = S.chapter.steps[0]);
    // build the first scene behind the start screen so it is ready
    X.applyScene({ bg: "living", tod: "dusk", memory: true, cam: [960, 560, 1], cast: {} });
    X.ready = true;
  };
  function startLesson(mode) {
    FE.Sound.unlock();
    S.mode = mode; P.mode = mode; X.savePrefs();
    document.getElementById("app").dataset.mode = mode;
    S.started = true; X.el.start.hidden = true;
    if (P.music) FE.Sound.music(true);
    X.go(0, 0);
  }
  X.startLesson = startLesson;

  document.addEventListener("DOMContentLoaded", X.boot);
})(typeof window !== "undefined" ? window : globalThis);
