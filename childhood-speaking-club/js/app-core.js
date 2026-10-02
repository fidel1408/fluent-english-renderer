/* Fluent English – Childhood Speaking Club: core (state, stage, world, actors, bubbles, panels, effects). */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var A = FE.Art, T = FE.t, U = FE.S;
  var SVGNS = "http://www.w3.org/2000/svg";
  var X = (FE.X = {});

  X.$ = function (s, r) { return (r || document).querySelector(s); };
  X.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  X.T = T;
  X.sleep = function (ms, tok) {
    return new Promise(function (res) { setTimeout(function () { res(tok === undefined || tok === X.S.tok); }, ms / (FE.speed || 1)); });
  };
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  X.mk = mk;
  function svg(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in (attrs || {})) e.setAttribute(k, attrs[k]); return e; }

  /* ---------------- state ---------------- */
  var PREF_KEY = "fe.childhood.prefs.v1", DATA_KEY = "fe.childhood.data.v1";
  var defaultsP = { celebrate: true, mode: "class", volume: 1, narration: true, music: false, musicVol: 0.4, sfx: true, reduceMotion: false, autoTimer: true, demoSec: 10, controlsHidden: false, rate: 1, voices: {}, saveData: false };
  function load(key) { try { var s = root.localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  X.P = Object.assign({}, defaultsP, load(PREF_KEY) || {});
  X.savePrefs = function () { try { root.localStorage.setItem(PREF_KEY, JSON.stringify(X.P)); } catch (e) {} };
  X.freshData = function () {
    return { scale: {}, wyr: {}, rank: ["creativity", "friendship", "independence", "cooperation"], rankTop: false,
      plan: { slots: [{ a: null, m: null }, { a: null, m: null }, { a: null, m: null }], backup: null },
      rubric: {}, rubricWho: 1, reflect: {}, marks: {}, notes: "", constraintIdx: 0, students: 6, stars: 0 };
  };
  X.D = X.freshData();
  if (X.P.saveData) { var saved = load(DATA_KEY); if (saved) Object.assign(X.D, saved); }
  X.saveData = function () { if (!X.P.saveData) return; try { root.localStorage.setItem(DATA_KEY, JSON.stringify(X.D)); } catch (e) {} };
  X.clearSaved = function () { try { root.localStorage.removeItem(DATA_KEY); } catch (e) {} };

  X.S = { mode: X.P.mode, ci: 0, si: 0, tok: 0, paused: false, started: false, rev: 0, revMax: 0, phase: "", step: null, chapter: null,
    showStarters: false, showExample: false, narrating: false, playing: false, lineIdx: 0 };
  X.scale = 1;
  X.el = {};
  X.actors = {};
  X.cam = [960, 540, 1];
  X.panelPos = "none";
  X.panelKey = null;
  X.bg = null; X.tod = null; X.memory = false;
  X.propSpecs = [];

  X.chapters = function () { return FE.LESSON.chapters; };
  X.reduceMotion = function () { return X.P.reduceMotion || (root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches); };

  /* ---------------- stage scaling (keeps 16:9, never stretches or crops) ---------------- */
  X.fit = function () {
    var vp = X.el.viewport; if (!vp) return;
    var w = vp.clientWidth, h = vp.clientHeight;
    var s = Math.max(0.1, Math.min(w / 1920, h / 1080));
    X.scale = s;
    X.el.stagebox.style.width = Math.floor(1920 * s) + "px";
    X.el.stagebox.style.height = Math.floor(1080 * s) + "px";
    X.el.stage.style.transform = "scale(" + s + ")";
  };

  /* ---------------- world / camera ---------------- */
  function isFg(n) { return /\bfg\b/.test(n.getAttribute("class") || "") || parseFloat(n.getAttribute("data-d")) >= 1.15; }
  X.buildWorld = function (bg, tod, memory) {
    var holder = svg("svg");
    holder.innerHTML = FE.Scenes.build(bg, { tod: tod, memory: memory });
    var world = X.el.world;
    world.innerHTML = "";
    var kids = Array.prototype.slice.call(holder.childNodes);
    kids.filter(function (n) { return n.nodeName === "defs"; }).forEach(function (n) { world.appendChild(n); });
    var layers = kids.filter(function (n) { return n.nodeName === "g"; });
    layers.filter(function (n) { return !isFg(n); }).forEach(function (n) { world.appendChild(n); });
    X.propsLayer = svg("g", { class: "layer", "data-d": "1" });
    X.castLayer = svg("g", { class: "layer", "data-d": "1" });
    world.appendChild(X.propsLayer); world.appendChild(X.castLayer);
    layers.filter(isFg).forEach(function (n) { world.appendChild(n); });
    X.topLayer = svg("g", { class: "layer", "data-d": "1" });
    world.appendChild(X.topLayer);
    X.bg = bg; X.tod = tod; X.memory = !!memory;
    for (var id in X.actors) X.castLayer.appendChild(X.actors[id].el);
    X.renderProps();
    X.fxRebuild();
    X.applyCam(true);
  };
  X.applyCam = function (instant) {
    var c = X.cam, layers = X.$$("#world > g.layer");
    layers.forEach(function (g) {
      var d = parseFloat(g.getAttribute("data-d")) || 0;
      var z = 1 + (c[2] - 1) * d, cx = 960 + (c[0] - 960) * d, cy = 540 + (c[1] - 540) * d;
      if (instant || X.reduceMotion()) g.style.transition = "none";
      g.style.transform = "translate(960px,540px) scale(" + z + ") translate(" + -cx + "px," + -cy + "px)";
      if (instant || X.reduceMotion()) { void g.getBoundingClientRect(); g.style.transition = ""; }
    });
  };
  X.setCam = function (c) { X.cam = [c[0], c[1], c[2]]; X.applyCam(false); };
  X.proj = function (x, y) { var c = X.cam; return [960 + c[2] * (x - c[0]), 540 + c[2] * (y - c[1])]; };

  /* ---------------- props ---------------- */
  X.setProps = function (list) { X.propSpecs = list || []; X.renderProps(); };
  X.renderProps = function () {
    if (!X.propsLayer) return;
    X.propsLayer.innerHTML = "";
    X.propSpecs.forEach(function (p) {
      var f = FE.World[p.id]; if (!f) return;
      var g = svg("g", { class: "prop-item" });
      g.setAttribute("transform", "translate(" + p.x + "," + p.y + ") scale(" + (p.s || 1) + ")");
      var inner = svg("g", { class: p.cls || "" });
      inner.innerHTML = f();
      g.appendChild(inner);
      X.propsLayer.appendChild(g);
    });
  };

  /* ---------------- actors ---------------- */
  function placeActor(a, instant) {
    var sp = a.spec, sx = sp.flip ? -sp.s : sp.s;
    if (instant) a.el.style.transition = "none";
    a.el.style.transform = "translate(" + sp.x + "px," + sp.y + "px) scale(" + sx + "," + sp.s + ")";
    if (instant) { void a.el.getBoundingClientRect(); a.el.style.transition = ""; }
  }
  function sortActors() {
    var list = Object.keys(X.actors).map(function (k) { return X.actors[k]; }).sort(function (p, q) { return p.spec.y - q.spec.y; });
    list.forEach(function (a) { X.castLayer.appendChild(a.el); });
  }
  X.removeActor = function (id) {
    var a = X.actors[id]; if (!a) return;
    delete X.actors[id];
    a.el.classList.add("gone");
    setTimeout(function () { if (a.el.parentNode) a.el.parentNode.removeChild(a.el); }, 650);
  };
  X.upsertActor = function (id, v) {
    var a = X.actors[id];
    var sig = JSON.stringify([v.kid, v.char, v.extra]);
    if (a && v.kid !== undefined && a.sig !== sig) { X.removeActor(id); a = null; }
    if (!a) {
      var kidIdx = v.kid != null ? v.kid : null;
      var markup = kidIdx != null ? A.kid(kidIdx, v.extra) : A.adult(v.char || id, v.extra);
      var g = svg("g", { class: "actor" }); g.dataset.id = id;
      g.innerHTML = markup;
      a = { id: id, el: g, person: g.querySelector(".person"), spec: { x: v.x, y: v.y, s: v.s, flip: !!v.flip }, sig: sig, kid: kidIdx };
      X.castLayer.appendChild(g);
      X.actors[id] = a;
      var enterY = a.spec.y;
      a.spec.y = enterY + 34; g.style.opacity = "0"; placeActor(a, true);
      a.spec.y = enterY;
      requestAnimationFrame(function () { requestAnimationFrame(function () { g.style.opacity = "1"; placeActor(a, false); }); });
      A.setPose(a.person, v.pose || "rest"); A.setMood(a.person, v.mood || "smile");
    } else {
      ["x", "y", "s", "flip"].forEach(function (k) { if (v[k] !== undefined) a.spec[k] = v[k]; });
      placeActor(a, false);
      if (v.pose) A.setPose(a.person, v.pose);
      if (v.mood) A.setMood(a.person, v.mood);
    }
    sortActors();
  };
  X.setCast = function (spec) {
    for (var id in spec) {
      var v = spec[id];
      if (v === null) X.removeActor(id);
      else if (X.actors[id] || (v.x !== undefined)) X.upsertActor(id, v);
    }
  };
  X.clearCast = function () { Object.keys(X.actors).forEach(X.removeActor); };

  /* ---------------- scenes ---------------- */
  X.applyScene = function (sc) {
    sc = sc || {};
    var bg = sc.bg || X.bg || "living", tod = sc.tod || X.tod || "golden";
    var memory = sc.memory !== undefined ? !!sc.memory : X.memory;
    var changed = !X.worldReady || bg !== X.bg || tod !== X.tod || memory !== X.memory;
    var tok = X.S.tok;
    var p = Promise.resolve();
    if (changed) {
      if (X.worldReady && !X.reduceMotion()) {
        X.el.wipe.classList.add("on");
        p = X.sleep(380, tok).then(function () { X.buildWorld(bg, tod, memory); X.worldReady = true; });
      } else { X.buildWorld(bg, tod, memory); X.worldReady = true; }
    }
    return p.then(function () {
      if (sc.props) X.setProps(sc.props);
      if (sc.cam) X.setCam(sc.cam);
      if (sc.cast) X.setCast(sc.cast);
      if (!("fx" in sc)) X.card(null);       // never leave a title / question / closing card behind after a jump
      if (!("flash" in sc)) X.setFlash(null);
      if ("vig" in sc) X.setVig(sc.vig);
      if ("flash" in sc) X.setFlash(sc.flash);
      if ("fx" in sc) X.fx(sc.fx);
      if (X.el.wipe.classList.contains("on")) setTimeout(function () { X.el.wipe.classList.remove("on"); }, 60);
    });
  };

  X.setVig = function (name) {
    var v = X.el.vig;
    if (!name) { v.hidden = true; v.innerHTML = ""; return; }
    v.innerHTML = FE.Vig[name]();
    A.applyInit(v);
    v.hidden = false;
  };

  /* ---------------- flashback polaroid ---------------- */
  X.flashName = null;
  X.setFlash = function (name, origin) {
    var pl = X.el.polaroid;
    if (!name) { pl.classList.remove("on"); X.flashName = null; return; }
    if (X.flashName === name) return;
    X.flashName = name;
    var open = function () {
      pl.innerHTML = FE.Flash[name]();
      A.applyInit(pl);
      var o = origin || X.objectOrigin || [960, 535];
      pl.style.transformOrigin = (o[0] - 506) + "px " + (o[1] - 292) + "px";
      void pl.offsetWidth;
      pl.classList.add("on");
    };
    if (pl.classList.contains("on")) { pl.classList.remove("on"); setTimeout(open, X.reduceMotion() ? 0 : 450); }
    else open();
  };

  /* ---------------- memory box effects (world, drawn on top of the table) ---------------- */
  var OBJ = {
    drawing: { slot: [-215, 6, 0.46, -6], hover: [0, -330, 1.25] },
    ball:    { slot: [-130, 4, 0.52, 0], hover: [0, -330, 1.25] },
    note:    { slot: [150, 6, 0.5, 6], hover: [0, -330, 1.25] },
    toy:     { slot: [235, 4, 0.44, 0], hover: [0, -330, 1.0] },
  };
  OBJ.mystery = { slot: [0, 0, 0.5, 0], hover: [0, -340, 1.15] };
  OBJ.bell = { slot: [0, 0, 0.5, 0], hover: [0, -340, 1.15] };
  var ORDER = ["drawing", "ball", "note", "toy"];
  var EXTRA = ["mystery", "bell"];
  X.boxState = { shown: false, open: false, obj: null };
  X.fxRebuild = function () {
    if (!X.topLayer) return;
    X.topLayer.innerHTML = "";
    X.boxEl = null;
    if (X.boxState.shown) X.ensureBox();
  };
  X.ensureBox = function () {
    if (X.boxEl && X.boxEl.parentNode) return;
    var g = svg("g", { class: "mbox" });
    g.setAttribute("transform", "translate(960,836)");
    g.innerHTML =
      '<defs><radialGradient id="boxglow"><stop offset="0" stop-color="#FFF1B8" stop-opacity=".95"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse class="bglow" cx="0" cy="-170" rx="260" ry="200" fill="url(#boxglow)" style="opacity:0;transition:opacity .9s"/>' +
      '<g class="bobjs"></g>' +
      '<g class="bbody"><rect x="-122" y="-112" width="244" height="112" rx="12" fill="#C8905A"/><rect x="-122" y="-112" width="244" height="26" rx="10" fill="#B27A47"/>' +
      '<rect x="-16" y="-112" width="32" height="112" fill="#1F9E9A"/><circle cx="0" cy="-60" r="13" fill="#F2B544" stroke="#B27A47" stroke-width="3"/>' +
      '<path d="M-100,-24 H-50 M50,-24 H100" stroke="#8A5A33" stroke-width="5" stroke-linecap="round"/></g>' +
      '<g class="lidc" style="transition:transform .8s cubic-bezier(.3,.8,.3,1),opacity .6s"><rect x="-134" y="-142" width="268" height="34" rx="10" fill="#D9A872"/><rect x="-16" y="-142" width="32" height="34" fill="#1F9E9A"/><path d="M-134,-130 H134" stroke="#B27A47" stroke-width="3"/></g>' +
      '<g class="lido" style="opacity:0;transform-origin:0 -112px;transform:scaleY(.15);transition:transform .9s cubic-bezier(.3,.8,.3,1),opacity .6s"><path d="M-126,-112 L126,-112 L106,-232 L-106,-232Z" fill="#C8905A"/><path d="M-98,-118 L98,-118 L84,-222 L-84,-222Z" fill="#E8C08A"/></g>';
    X.topLayer.appendChild(g);
    X.boxEl = g;
    X.boxState.shown = true;
    // objects
    var holder = g.querySelector(".bobjs");
    ORDER.concat(EXTRA).forEach(function (n) {
      var o = svg("g", { class: "bo bo-" + n });
      o.style.transition = "transform .95s cubic-bezier(.3,.9,.3,1),opacity .6s";
      o.style.opacity = "0";
      var inner = svg("g", { class: "boi" });
      inner.innerHTML = FE.Objects[n]();
      o.appendChild(inner);
      holder.appendChild(o);
      X.placeObject(n, "inside", true);
    });
    if (X.boxState.open) X.setBoxOpen(true, true);
    ORDER.concat(EXTRA).forEach(function (n) { if (X.boxState.placed && X.boxState.placed[n]) X.placeObject(n, X.boxState.placed[n], true); });
  };
  X.placeObject = function (n, where, instant) {
    if (!X.boxEl) return;
    var o = X.boxEl.querySelector(".bo-" + n); if (!o) return;
    var d = OBJ[n], t;
    if (instant) o.style.transition = "none";
    if (where === "hover") { t = "translate(" + d.hover[0] + "px," + d.hover[1] + "px) scale(" + d.hover[2] + ")"; o.style.opacity = "1"; }
    else if (where === "slot") { t = "translate(" + d.slot[0] + "px," + d.slot[1] + "px) scale(" + d.slot[2] + ") rotate(" + d.slot[3] + "deg)"; o.style.opacity = "1"; }
    else { t = "translate(0px,-110px) scale(.2)"; o.style.opacity = "0"; }
    o.style.transform = t;
    if (instant) { void o.getBoundingClientRect(); o.style.transition = "transform .95s cubic-bezier(.3,.9,.3,1),opacity .6s"; }
    X.boxState.placed = X.boxState.placed || {};
    X.boxState.placed[n] = where;
  };
  X.setBoxOpen = function (open, instant) {
    X.boxState.open = open;
    if (!X.boxEl) return;
    var g = X.boxEl, lc = g.querySelector(".lidc"), lo = g.querySelector(".lido"), gl = g.querySelector(".bglow");
    if (instant) { lc.style.transition = lo.style.transition = "none"; }
    lc.style.opacity = open ? "0" : "1"; lc.style.transform = open ? "translateY(-40px) scaleY(.2)" : "none";
    lo.style.opacity = open ? "1" : "0"; lo.style.transform = open ? "scaleY(1)" : "scaleY(.15)";
    gl.style.opacity = open ? "1" : "0";
    if (instant) { void lc.getBoundingClientRect(); lc.style.transition = "transform .8s cubic-bezier(.3,.8,.3,1),opacity .6s"; lo.style.transition = "transform .9s cubic-bezier(.3,.8,.3,1),opacity .6s"; }
  };
  X.card = function (kind, html) {
    var o = X.el.overlays;
    var old = o.querySelector(".card");
    if (old) old.remove();
    if (!kind) return;
    var c = mk("div", "card " + kind, html);
    o.appendChild(c);
  };
  X.fx = function (name) {
    X.boxState.placed = X.boxState.placed || {};
    var obj = /^obj-/.test(name || "") ? name.slice(4) : null;
    if (!obj && X.el.polaroid.classList.contains("on")) X.setFlash(null);
    switch (name) {
      case "title":
        X.boxState.shown = true; X.boxState.open = false; X.boxState.placed = {};
        X.fxRebuild();
        X.card("title", '<div class="t1">' + T("Childhood") + '</div><div class="t2">' + T("Memories, Games, and Growing Up") + '</div><div class="t3">' + T(U.club) + "</div>");
        break;
      case "box-open":
        X.card(null); X.ensureBox(); setTimeout(function () { X.setBoxOpen(true); }, 350);
        break;
      case "question":
        X.setFlash(null);
        ORDER.forEach(function (n) { X.placeObject(n, "slot"); });
        X.card("question", T("What can an ordinary object remind us of?"));
        break;
      case "box-calm":
        X.card(null); X.boxState.shown = true; X.ensureBox(); X.setBoxOpen(true);
        ORDER.forEach(function (n) { X.placeObject(n, "slot"); });
        break;
      case "mystery":
        X.card(null); X.boxState.shown = true; X.ensureBox(); X.setBoxOpen(true);
        ORDER.concat(["bell"]).forEach(function (n) { X.placeObject(n, "inside"); });
        X.placeObject("mystery", "hover");
        break;
      case "mystery-reveal":
        X.card(null); X.boxState.shown = true; X.ensureBox(); X.setBoxOpen(true);
        ORDER.concat(["mystery"]).forEach(function (n) { X.placeObject(n, "inside"); });
        X.placeObject("bell", "hover");
        if (X.confetti) X.confetti(34);
        if (FE.Sound) FE.Sound.star();
        break;
      case "closing":
        X.card("closing", '<div class="big">' + T(U.tagline) + '</div><div class="sub"><img src="assets/fluent_english_logo.png" alt="Fluent English"></div>');
        break;
      default:
        if (obj) {
          X.card(null); X.boxState.shown = true; X.ensureBox(); X.setBoxOpen(true);
          ORDER.forEach(function (n) { if (ORDER.indexOf(n) < ORDER.indexOf(obj)) X.placeObject(n, "slot"); else if (n !== obj) X.placeObject(n, "inside"); });
          X.placeObject(obj, "hover");
          var pr = X.proj(960, 836 - 330 * 1.0);
          X.objectOrigin = [pr[0], pr[1]];
          setTimeout(function () { /* flash is opened by the step via scene.flash; origin is ready */ }, 0);
        } else {
          X.card(null);
          if (name === null || name === "none") { X.boxState.shown = false; X.fxRebuild(); }
        }
    }
  };

  /* ---------------- speech bubble + tail ---------------- */
  X.NAMES = { maya: "Maya", theo: "Theo", alex: "Alex", jordan: "Jordan" };
  function stageRect() { return X.el.stage.getBoundingClientRect(); }
  function rectToStage(r) { var sr = stageRect(), s = X.scale; return { x: (r.left - sr.left) / s, y: (r.top - sr.top) / s, w: r.width / s, h: r.height / s }; }
  X.headBox = function (who) {
    var a = X.actors[who];
    if (!a) return null;
    var h = a.person.querySelector(".head ellipse:nth-of-type(3)") || a.person.querySelector(".head");
    var r = rectToStage(h.getBoundingClientRect());
    return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, a: a };
  };
  X.bubbleState = null;
  X.showBubble = function (who, text, opts) {
    opts = opts || {};
    var b = X.el.bubble;
    var name = opts.name || X.NAMES[who] || "";
    b.className = "bubble" + (opts.sample ? " sample" : "");
    b.innerHTML = (opts.label ? '<div class="lab">' + T(opts.label) + "</div>" : "") +
      (name ? '<div class="nm">' + T(name) + "</div>" : "") + '<div class="bt">' + T(text) + "</div>";
    b.hidden = false;
    X.bubbleState = { who: who };
    X.positionBubble();
    X.trackBubble(1900);
  };
  X.hideBubble = function () {
    X.el.bubble.hidden = true; X.el.tailsvg.innerHTML = ""; X.bubbleState = null;
    X.el.avatar.hidden = true;
  };
  var trackTimer = null;
  X.trackBubble = function (ms) {
    cancelAnimationFrame(trackTimer);
    var t0 = performance.now();
    var loop = function () {
      if (!X.bubbleState) return;
      X.positionBubble();
      if (performance.now() - t0 < ms) trackTimer = requestAnimationFrame(loop);
    };
    trackTimer = requestAnimationFrame(loop);
  };
  function avatarFor(who) {
    var av = X.el.avatar;
    if (!A.CHARS[who]) { av.hidden = true; return null; }
    if (av.dataset.who !== who) {
      av.dataset.who = who;
      av.innerHTML = '<svg viewBox="-96 -604 192 192" preserveAspectRatio="xMidYMid slice"><g>' + A.adult(who) + "</g></svg>";
      A.applyInit(av);
    }
    var p = av.querySelector(".person");
    A.setMood(p, X.S.lineMood || "smile");
    av.hidden = false;
    return av;
  }
  X.positionBubble = function () {
    var st = X.bubbleState; if (!st) return;
    var b = X.el.bubble, tail = X.el.tailsvg;
    var pos = X.panelPos, minX = 48, maxX = 1872;
    if (pos === "R") maxX = 960; else if (pos === "L") minX = 960;
    if (X.regionOverride) { minX = X.regionOverride[0]; maxX = X.regionOverride[1]; }
    var head = X.headBox(st.who), bw, bh, left, top, svgPath = "";
    if (head && (head.cx < 30 || head.cx > 1890)) head = null; // guide is off-stage: use the portrait badge instead
    b.style.left = "0px"; b.style.top = "0px";
    b.style.maxWidth = (maxX - minX) + "px";
    if (head) {
      X.el.avatar.hidden = true;
      bw = b.offsetWidth; bh = b.offsetHeight;
      var headTop = head.cy - head.ry;
      var minTop = function (l) { return 176; };
      left = Math.max(minX, Math.min(maxX - bw, head.cx - bw / 2));
      top = pos === "C" ? 180 : 190;
      if (top + bh + 30 > headTop) top = Math.max(minTop(left), headTop - 34 - bh);
      var overlap = top + bh + 22 > headTop && left < head.cx + head.rx + 18 && left + bw > head.cx - head.rx - 18;
      var side = null;
      if (overlap) {
        var rightRoom = maxX - (head.cx + head.rx + 40), leftRoom = head.cx - head.rx - 40 - minX;
        if (rightRoom >= leftRoom) { left = Math.min(maxX - bw, head.cx + head.rx + 40); side = "left"; }
        else { left = Math.max(minX, head.cx - head.rx - 40 - bw); side = "right"; }
        top = Math.max(minTop(left), Math.min(headTop - 20, 1000 - bh));
      }
      b.style.left = left + "px"; b.style.top = top + "px";
      var tip, bl, br, c1, c2;
      if (!side) {
        var bx = Math.max(left + 80, Math.min(left + bw - 80, head.cx));
        var by = top + bh - 6;
        tip = [head.cx + (head.cx < bx ? 6 : -6), headTop - 6];
        bl = [bx - 24, by]; br = [bx + 24, by];
        var bend = (tip[0] - bx) * 0.2 + (head.cx < left + bw / 2 ? -26 : 26);
        c1 = [(bl[0] + tip[0]) / 2 + bend, (bl[1] + tip[1]) / 2]; c2 = [(br[0] + tip[0]) / 2 + bend, (br[1] + tip[1]) / 2];
      } else {
        var sy = Math.max(top + 50, Math.min(top + bh - 50, head.cy)), sx = side === "left" ? left + 6 : left + bw - 6;
        tip = [side === "left" ? head.cx + head.rx + 8 : head.cx - head.rx - 8, head.cy - head.ry * 0.5];
        bl = [sx, sy - 22]; br = [sx, sy + 22];
        c1 = [(bl[0] + tip[0]) / 2, (bl[1] + tip[1]) / 2 - 24]; c2 = [(br[0] + tip[0]) / 2, (br[1] + tip[1]) / 2 - 24];
      }
      svgPath = "M" + bl[0] + "," + bl[1] + " Q" + c1[0] + "," + c1[1] + " " + tip[0] + "," + tip[1] + " Q" + c2[0] + "," + c2[1] + " " + br[0] + "," + br[1] + " Z";
    } else {
      // speaker is not on stage: show a small portrait badge
      var av = avatarFor(st.who);
      var avLeft = pos === "L" ? 1690 : 56, avTop = pos === "C" ? 190 : 840;
      if (av) { av.style.left = avLeft + "px"; av.style.top = avTop + "px"; }
      var room = (pos === "L" ? 1690 - 40 : maxX) - (avLeft + 176 + 34);
      b.style.maxWidth = Math.max(420, room) + "px";
      bw = b.offsetWidth; bh = b.offsetHeight;
      if (pos === "L") { left = 1690 - 34 - bw; } else left = avLeft + 176 + 34;
      top = pos === "C" ? avTop : Math.min(avTop + 176 - bh, 1016 - bh);
      top = Math.max(176, top);
      b.style.left = left + "px"; b.style.top = top + "px";
      if (av) {
        var cy = Math.max(top + 40, Math.min(top + bh - 40, avTop + 88));
        var fromL = pos !== "L";
        var sx2 = fromL ? left + 6 : left + bw - 6;
        var tip2 = [fromL ? avLeft + 176 + 6 : avLeft - 6, avTop + 88];
        var bl2 = [sx2, cy - 20], br2 = [sx2, cy + 20];
        var c1b = [(bl2[0] + tip2[0]) / 2, (bl2[1] + tip2[1]) / 2 - 18], c2b = [(br2[0] + tip2[0]) / 2, (br2[1] + tip2[1]) / 2 - 18];
        svgPath = "M" + bl2[0] + "," + bl2[1] + " Q" + c1b[0] + "," + c1b[1] + " " + tip2[0] + "," + tip2[1] + " Q" + c2b[0] + "," + c2b[1] + " " + br2[0] + "," + br2[1] + " Z";
      }
    }
    tail.innerHTML = svgPath ? '<path d="' + svgPath + '" fill="#fff" stroke="#0A2E63" stroke-width="4.5" stroke-linejoin="round"/>' : "";
  };

  /* speaking state of the on-stage character */
  X.setTalking = function (who, on) {
    Object.keys(X.actors).forEach(function (id) { A.setTalking(X.actors[id].person, id === who && on); });
    var av = X.el.avatar;
    if (av && !av.hidden) { var p = av.querySelector(".person"); if (p) A.setTalking(p, on && av.dataset.who === who); }
    if (FE.Sound) FE.Sound.duck(on);
  };
  X.lineMoodApply = function (who, mood, pose) {
    var a = X.actors[who];
    X.S.lineMood = mood || "smile";
    if (a) { if (mood) A.setMood(a.person, mood); if (pose) A.setPose(a.person, pose); }
  };

  /* highlight the spoken word inside the bubble */
  X.hlWord = function (charIndex) {
    var bt = X.$(".bubble .bt .tx");
    if (!bt) return;
    var units = X.$$(".wu[data-c0]", bt), hit = null;
    for (var i = 0; i < units.length; i++) {
      var c0 = +units[i].dataset.c0, c1 = +units[i].dataset.c1;
      if (charIndex >= c0 && charIndex < c1 + 1) { hit = units[i]; break; }
      if (c0 > charIndex) { hit = units[i]; break; }
    }
    X.$$(".wu.say", bt).forEach(function (u) { u.classList.remove("say"); });
    if (hit) hit.classList.add("say");
  };

  /* ---------------- panels + reveals ---------------- */
  X.blocks = {};
  X.renderPanel = function (spec) {
    var p = X.el.panel;
    if (!spec || spec.pos === "none" || !spec.blocks || !spec.blocks.length) {
      p.hidden = true; p.innerHTML = ""; X.panelPos = spec && spec.pos === "none" ? "none" : "none"; X.panelKey = spec ? spec.key : null;
      return;
    }
    p.className = "panel " + spec.pos;
    p.innerHTML = spec.blocks.map(function (b) {
      var f = X.blocks[b.k];
      return f ? f(b, spec) : "";
    }).join("");
    p.hidden = false;
    X.panelPos = spec.pos; X.panelKey = spec.key;
    X.S.rev = 0;
    X.computeRevMax();
    X.applyReveal();
    if (X.afterPanel) X.afterPanel(spec);
  };
  X.computeRevMax = function () {
    var m = 0;
    X.$$("#panel [data-rv],#panel [data-rvx]").forEach(function (e) {
      var a = +e.dataset.rv || 0, b = e.dataset.rvx !== undefined ? +e.dataset.rvx : 0;
      m = Math.max(m, a, b);
    });
    X.S.revMax = m;
  };
  X.applyReveal = function () {
    var r = X.S.rev;
    X.$$("#panel [data-rv],#panel [data-rvx]").forEach(function (e) {
      var min = +e.dataset.rv || 0, max = e.dataset.rvx !== undefined ? +e.dataset.rvx : Infinity;
      e.classList.toggle("on", r >= min && r < max);
    });
    X.$$("#panel .check").forEach(function (c) { c.classList.toggle("show", r >= (+c.dataset.ans2 || 99)); });
    if (X.updateBar) X.updateBar();
    if (X.refreshWyr) X.refreshWyr();
  };
  X.setRev = function (n, quiet) {
    n = Math.max(0, Math.min(X.S.revMax, n));
    if (n === X.S.rev) return;
    X.S.rev = n;
    X.applyReveal();
    if (!quiet && FE.Sound) FE.Sound.pop();
  };
})(typeof window !== "undefined" ? window : globalThis);
