/* Fluent English – panel blocks and teacher-operated widgets. */
(function (root) {
  "use strict";
  var FE = root.FE, X = FE.X, T = FE.t, U = FE.S, esc = FE.esc, L = FE.LESSON;
  var B = X.blocks;

  function rvAttr(rv, rvx) {
    var s = "";
    if (rv != null || rvx != null) s += ' data-rv="' + (rv == null ? 0 : rv) + '"';
    if (rvx != null) s += ' data-rvx="' + rvx + '"';
    return s;
  }
  function spoken(s) { return FE.plain(String(s)).replace(/[“”]/g, "").replace(/\s+/g, " ").trim(); }
  var SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  X.SPK = SPK;
  function sayBtn(text, role) {
    return '<button class="say-btn" data-say="' + esc(spoken(text)) + '" data-role="' + (role || "maya") + '" aria-label="' + esc(U.listen) + '">' + SPK + "</button>";
  }
  X.sayBtn = sayBtn;

  B.tag = function (b) { return '<div class="tag"' + rvAttr(b.rv, b.rvx) + ">" + T(b.t) + "</div>"; };
  B.h = function (b) { return '<h2 class="ph"' + rvAttr(b.rv, b.rvx) + ">" + T(b.t) + "</h2>"; };
  B.q = function (b) { return '<div class="pq"' + rvAttr(b.rv, b.rvx) + ">" + T(b.t) + "</div>"; };
  B.p = function (b) { return '<p class="pp ' + (b.cls || "") + '"' + rvAttr(b.rv, b.rvx) + ">" + T(b.t) + "</p>"; };
  B.note = function (b) { return '<p class="pnote"' + rvAttr(b.rv, b.rvx) + ">" + T(b.t) + "</p>"; };

  B.cycle = function (b) {
    return '<ol class="cycle' + (b.all ? " all" : "") + '">' + b.items.map(function (t, i) { return '<li data-ph="' + esc(t) + '"><span class="n">' + (i + 1) + "</span>" + T(t) + "</li>"; }).join("") + "</ol>";
  };
  X.updatePhase = function (phase) {
    var map = { Think: ["Think"], Answer: ["Answer", "Reason"], Ask: ["Listen", "Ask"] };
    var on = map[phase] || [];
    X.$$("#panel .cycle:not(.all) li").forEach(function (li) { li.classList.toggle("on", on.indexOf(li.dataset.ph) >= 0); });
  };
  B.follow = function (b) {
    var rv = b.rv || 1, n = b.items.length;
    if (b.single) {
      // one prompt at a time: each replaces the previous one
      var until = b.until;
      return '<div class="follow">' + (b.label ? '<div class="lab"' + rvAttr(rv, until || rv + n) + ">" + T(b.label) + "</div>" : "") +
        '<ul style="list-style:none;margin:0;padding:0">' + b.items.map(function (t, i) {
          var last = i === n - 1;
          return "<li" + rvAttr(rv + i, last ? until : rv + i + 1) + ">" + T(t) + "</li>";
        }).join("") + "</ul></div>";
    }
    return '<div class="follow"><div class="lab"' + rvAttr(rv) + ">" + T(b.label || "") + "</div>" +
      '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px">' + b.items.map(function (t, i) { return "<li" + rvAttr(rv + i) + ">" + T(t) + "</li>"; }).join("") + "</ul></div>";
  };
  B.word = function (b) { return '<div class="pword"><span>' + T(b.t) + "</span>" + sayBtn(b.t) + "</div>"; };
  B.quote = function (b) { return '<blockquote class="pquote"' + rvAttr(b.rv, b.rvx) + ">" + T(b.t) + (b.listen ? sayBtn(b.t) : "") + "</blockquote>"; };
  B.check = function (b) {
    var ok = b.ans;
    return '<div class="check"' + rvAttr(b.rv, b.rvx) + ' data-ans2="' + (b.rv + 1) + '"><div class="cq">' + T(b.q) + "</div>" +
      '<div class="opt a' + (ok === "a" ? " corr" : "") + '"><b>A</b>' + T(b.a) + "</div>" +
      '<div class="opt b' + (ok === "b" ? " corr" : "") + '"><b>B</b>' + T(b.b) + "</div>" +
      '<div class="ansline"' + rvAttr(b.rv + 1) + ">" + T(U.showAnswer) + ": <b>" + ok.toUpperCase() + "</b></div></div>";
  };
  B.speakq = function (b) { return '<div class="speakq"' + rvAttr(b.rv) + '><div class="lab">' + T(U.yourTurn) + "</div>" + T(b.t) + "</div>"; };
  B.tool = function (b) {
    return '<div class="tool"' + rvAttr(b.rv, b.rvx) + '><div class="tt">' + T(b.title) + "</div>" +
      (b.ex || []).map(function (e) { return '<div class="ex">' + T(e) + sayBtn(e) + "</div>"; }).join("") +
      (b.note ? '<div class="nt">' + T(b.note) + "</div>" : "") + "</div>";
  };
  B.model = function (b) {
    return '<div class="tool"' + rvAttr(b.rv, b.rvx) + '><div class="tt">' + T(b.items[0]) + '</div><div class="ex">' + T(b.items[1]) + sayBtn(b.items[1]) + "</div></div>";
  };
  B.seq = function (b) { return '<div class="seq' + (b.small ? " small" : "") + '">' + b.items.map(function (t) { return "<span>" + T(t) + "</span>"; }).join("") + "</div>"; };
  B.chips = function (b) {
    var rv = b.rv || 0;
    return '<div class="chips' + (b.big ? " big" : "") + (b.small ? " small" : "") + '"' + (b.each ? "" : rvAttr(b.rv, b.rvx)) + ">" +
      (b.label ? '<div class="lab"' + (b.each ? rvAttr(rv) : "") + ">" + T(b.label) + "</div>" : "") +
      b.items.map(function (t, i) { return '<span class="chip"' + (b.each ? rvAttr(rv + i) : "") + ">" + T(t) + "</span>"; }).join("") + "</div>";
  };
  B.list = function (b) {
    var rv = b.rv || 0;
    return '<ul class="ul' + (b.num ? " num" : "") + " " + (b.cls || "") + '">' + b.items.map(function (t, i) { return "<li" + (b.each ? rvAttr(rv + i) : "") + ">" + T(t) + "</li>"; }).join("") + "</ul>";
  };
  B.checklist = function (b) {
    var rv = b.rv || 0;
    return '<ul class="checklist"' + (b.each ? "" : rvAttr(b.rv, b.rvx)) + ">" + b.items.map(function (t, i) { return "<li" + (b.each ? rvAttr(rv + i) : "") + "><span>" + T(t) + "</span></li>"; }).join("") + "</ul>";
  };
  B.opts = function (b) {
    var rv = b.rv || 1;
    return '<div class="opts' + (b.grid ? " grid" : "") + '">' + b.items.map(function (o, i) {
      return '<button class="opt" data-i="' + i + '"' + rvAttr(rv + i) + '><div class="row"><span class="ltr">' + "ABCD".charAt(i) + "</span><span>" + T(o.t) + "</span></div>" +
        '<div class="res"><span class="lab">' + T(U.optResult) + "</span>" + T(o.res) + "</div></button>";
    }).join("") + "</div>";
  };
  B.twist = function (b) { return '<div class="twist"' + rvAttr(b.rv, b.rvx) + '><span class="lab">' + T(U.twist) + "</span>" + T(b.t) + "</div>"; };
  B.twistbig = function (b) { return '<div class="twistbig"' + rvAttr(b.rv, b.rvx) + ">" + T(b.t) + "</div>"; };
  B.claim = function (b) { return '<div class="claim"><div class="ic">' + FE.Icons[b.icon]() + '</div><div class="ct">' + T(b.t) + "</div></div>"; };
  B.qual = function (b) {
    var rv = b.rv || 0;
    return '<div class="qual' + (b.compact ? " compact" : "") + '">' + b.items.map(function (q, i) {
      return '<div class="qi"' + (b.each ? rvAttr(rv + i) : "") + '><div class="qw">' + T(q.w) + '</div><div class="qd">' + T(q.d) + "</div></div>";
    }).join("") + "</div>";
  };
  B.roles = function (b) {
    return '<div class="roles' + (b.compact ? " compact" : "") + '"' + rvAttr(b.rv, b.rvx) + ">" + b.items.map(function (r) {
      return '<div class="role"><div class="rn">' + T(r.n) + "</div><ul>" + r.lines.map(function (l) { return "<li>" + T(l) + "</li>"; }).join("") + "</ul></div>";
    }).join("") + "</div>";
  };
  B.facts = function (b) { return '<div class="facts"' + rvAttr(b.rv, b.rvx) + '><div class="fl">' + T(b.label || "") + "</div><ul>" + b.items.map(function (t) { return "<li>" + T(t) + "</li>"; }).join("") + "</ul></div>"; };
  B.goal = function (b) { return '<div class="goal"' + rvAttr(b.rv, b.rvx) + '><div class="fl">' + T(b.label || U.goalLabel) + "</div><ul>" + b.items.map(function (t) { return "<li>" + T(t) + "</li>"; }).join("") + "</ul></div>"; };
  B.versions = function (b) {
    return '<div class="versions"' + rvAttr(b.rv, b.rvx) + ">" + [[U.verSupported, U.verSupportedD], [U.verStandard, U.verStandardD], [U.verLonger, U.verLongerD]].map(function (v) { return '<div class="ver"><b>' + T(v[0]) + "</b>" + T(v[1]) + "</div>"; }).join("") + "</div>";
  };

  /* ---------- scale ---------- */
  B["scale-demo"] = function (b) {
    return '<div class="scale demo"><div class="row">' + b.items.map(function (t, i) { return '<div class="sbtn s' + i + '"><span>' + T(t) + '</span><span class="bar" style="width:0"></span></div>'; }).join("") + "</div></div>";
  };
  B.scale = function (b) {
    var counts = X.D.scale[b.id] || (X.D.scale[b.id] = [0, 0, 0, 0, 0]);
    var total = counts.reduce(function (a, c) { return a + c; }, 0) || 1;
    return '<div class="scale" data-id="' + b.id + '"' + rvAttr(b.rv, b.rvx) + '><div class="sl">' + T(U.scaleLabel) + '</div><div class="row">' +
      b.items.map(function (t, i) {
        return '<button class="sbtn s' + i + '" data-i="' + i + '"><span style="text-align:center">' + T(t) + '</span><span class="cnt">' + counts[i] + '</span><span class="bar" style="width:' + (counts[i] / total) * 100 + '%"></span></button>';
      }).join("") + '</div><div class="sh">' + T(U.scaleHint) + "</div></div>";
  };
  function bumpScale(btn, ev) {
    var wrap = btn.closest(".scale"), id = wrap.dataset.id, i = +btn.dataset.i;
    var c = X.D.scale[id] || (X.D.scale[id] = [0, 0, 0, 0, 0]);
    c[i] = Math.max(0, c[i] + (ev.shiftKey || ev.altKey ? -1 : 1));
    var total = c.reduce(function (a, v) { return a + v; }, 0) || 1;
    X.$$(".sbtn", wrap).forEach(function (bt, k) { X.$(".cnt", bt).textContent = c[k]; X.$(".bar", bt).style.width = (c[k] / total) * 100 + "%"; });
    X.saveData(); X.refreshNotes && X.refreshNotes();
  }

  /* ---------- ranking (drag + keyboard-accessible move buttons) ---------- */
  function qualById(id) { return L.QUALITIES.filter(function (q) { return q.id === id; })[0]; }
  function rankHtml() {
    var D = X.D;
    return D.rank.map(function (id, i) {
      var q = qualById(id);
      var label = q.w + ", position " + (i + 1);
      return '<div class="rcard' + (D.rankTop && i < 2 ? " top" : "") + '" role="listitem" tabindex="0" data-id="' + id + '" aria-label="' + esc(label) + '"><span class="pos">' + (i + 1) + '</span><span class="nm">' + T(q.w) + '</span>' +
        '<span class="mv"><button class="btn-s" data-mv="up"' + (i === 0 ? " disabled" : "") + ' aria-label="' + esc(U.rankUp) + " " + esc(q.w) + '">' + T(U.rankUp) + '</button><button class="btn-s" data-mv="down"' + (i === D.rank.length - 1 ? " disabled" : "") + ' aria-label="' + esc(U.rankDown) + " " + esc(q.w) + '">' + T(U.rankDown) + "</button></span></div>";
    }).join("");
  }
  B.rank = function (b) {
    return '<div class="rank-wrap"' + rvAttr(b.rv, b.rvx) + '><div class="rank" role="list" aria-label="Ranking">' + rankHtml() + '</div><div class="rank-tools" style="margin-top:10px"><button class="btn-s" data-rt="top">' + T(U.rankLock) + '</button><button class="btn-s" data-rt="reset">' + T(U.rankReset) + "</button></div></div>";
  };
  function reRank(focusId) {
    var r = X.$("#panel .rank"); if (!r) return;
    r.innerHTML = rankHtml();
    if (focusId) { var f = X.$('.rcard[data-id="' + focusId + '"]', r); if (f) f.focus(); }
    X.saveData(); X.refreshNotes && X.refreshNotes();
  }
  function moveRank(id, delta) {
    var a = X.D.rank, i = a.indexOf(id), j = Math.max(0, Math.min(a.length - 1, i + delta));
    if (i < 0 || i === j) return;
    a.splice(i, 1); a.splice(j, 0, id);
    reRank(id);
  }
  function bindRank(panel) {
    panel.addEventListener("keydown", function (e) {
      var c = e.target.closest && e.target.closest(".rcard");
      if (!c || e.target.tagName === "BUTTON") return;
      if (e.key === "ArrowUp") { e.preventDefault(); moveRank(c.dataset.id, -1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); moveRank(c.dataset.id, 1); }
    });
    var drag = null;
    panel.addEventListener("pointerdown", function (e) {
      var c = e.target.closest && e.target.closest(".rcard");
      if (!c || e.target.closest("button")) return;
      var cards = X.$$(".rcard", panel), h = c.offsetHeight + 10;
      drag = { c: c, y0: e.clientY, i0: cards.indexOf(c), h: h, n: cards.length, id: c.dataset.id };
      c.classList.add("drag"); c.setPointerCapture(e.pointerId);
    });
    panel.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var dy = (e.clientY - drag.y0) / X.scale;
      drag.c.style.transform = "translateY(" + dy + "px)";
    });
    var end = function (e) {
      if (!drag) return;
      var dy = (e.clientY - drag.y0) / X.scale, d = drag; drag = null;
      d.c.classList.remove("drag"); d.c.style.transform = "";
      var to = Math.max(0, Math.min(d.n - 1, d.i0 + Math.round(dy / d.h)));
      if (to !== d.i0) moveRank(d.id, to - d.i0);
    };
    panel.addEventListener("pointerup", end); panel.addEventListener("pointercancel", end);
  }

  /* ---------- planning board ---------- */
  var MINS = [10, 15, 20, 25, 30];
  B.plan = function (b) { return '<div class="plan" data-ro="' + (b.readonly ? 1 : 0) + '"' + rvAttr(b.rv, b.rvx) + "></div>"; };
  X.planSel = 0;
  function planHtml(ro) {
    var P = X.D.plan, tot = 0;
    var rows = P.slots.map(function (s, i) {
      tot += s.m || 0;
      return '<div class="pslot" data-i="' + i + '"' + (ro ? "" : ' tabindex="0" role="button" aria-label="slot ' + (i + 1) + '"') + (!ro && X.planSel === i ? ' style="border-color:var(--teal-l);background:#EAF8F7"' : "") + '><span class="no">' + (i + 1) + '</span><span class="act' + (s.a ? "" : " empty") + '">' + (s.a ? T(s.a) : T(U.planPick)) + '</span><button class="btn-s" data-pm="' + i + '" ' + (ro ? "disabled" : "") + '><span class="mins">' + (s.m || "–") + "</span>" + T(U.minutes) + "</button></div>";
    }).join("");
    var back = '<div class="pslot" data-i="b"' + (ro ? "" : ' tabindex="0" role="button"') + (!ro && X.planSel === "b" ? ' style="border-color:var(--teal-l);background:#EAF8F7"' : "") + '><span class="no" style="background:var(--plum)">+</span><span class="act' + (P.backup ? "" : " empty") + '">' + (P.backup ? T(P.backup) : T(U.planBackup)) + "</span></div>";
    var picker = ro ? "" : '<div class="pick">' + L.activities.map(function (a) { return '<button class="chip" data-pa="' + esc(a) + '" style="font-size:26px">' + T(a) + "</button>"; }).join("") + "</div>";
    return rows + back + '<div class="tot' + (tot === 60 ? " ok" : "") + '">' + T(U.planTotal2) + ": " + tot + " " + T(U.minutes) + "</div>" + picker;
  }
  X.renderPlan = function () { X.$$("#panel .plan").forEach(function (p) { p.innerHTML = planHtml(p.dataset.ro === "1"); }); };

  /* ---------- constraint ---------- */
  B.constraint = function (b) {
    X.constraintItems = b.items;
    var i = X.D.constraintIdx % b.items.length;
    return '<div class="constraint" data-n="' + b.items.length + '">' + T(b.items[i]) + '</div><div><button class="btn-s" data-cn="1">' + T(U.constraintNext) + "</button></div>";
  };

  /* ---------- would you rather ---------- */
  B.wyr = function (b) {
    var a = X.D.wyr[b.id + "a"] || [0, 0], c = X.D.wyr[b.id + "b"] || [0, 0];
    return '<div class="wyr-q">' + T(U.wyrHead) + '</div><div class="wyr" data-id="' + b.id + '">' +
      '<button class="wopt" data-w="0"><span class="ab">A</span><span class="ic">' + FE.Icons[b.ia]() + "</span><span>" + T(b.a) + '</span><span class="cn"><span class="cnn">' + a[0] + "</span></span></button>" +
      '<div class="wor">' + T(U.orWord) + '</div>' +
      '<button class="wopt" data-w="1"><span class="ab">B</span><span class="ic">' + FE.Icons[b.ib]() + "</span><span>" + T(b.b) + '</span><span class="cn"><span class="cnn">' + a[1] + "</span></span></button></div>";
  };
  function bumpWyr(btn, ev) {
    var wrap = btn.closest(".wyr"), id = wrap.dataset.id, after = X.S.rev >= 1;
    var key = id + (after ? "b" : "a"), c = X.D.wyr[key] || (X.D.wyr[key] = [0, 0]);
    var i = +btn.dataset.w;
    c[i] = Math.max(0, c[i] + (ev.shiftKey ? -1 : 1));
    var show = X.D.wyr[id + (after ? "b" : "a")] || [0, 0];
    X.$$(".wopt", wrap).forEach(function (bt, k) { X.$(".cnn", bt).textContent = show[k]; });
    X.saveData(); X.refreshNotes && X.refreshNotes();
  }
  X.refreshWyr = function () {
    var wrap = X.$("#panel .wyr"); if (!wrap) return;
    var id = wrap.dataset.id, after = X.S.rev >= 1, show = X.D.wyr[id + (after ? "b" : "a")] || [0, 0];
    X.$$(".wopt", wrap).forEach(function (bt, k) { X.$(".cnn", bt).textContent = show[k]; });
  };

  /* ---------- rubric ---------- */
  B.rubric = function () { return '<div class="rubric"></div>'; };
  X.renderRubric = function () {
    var r = X.$("#panel .rubric"); if (!r) return;
    var D = X.D, who = D.rubricWho, cur = D.rubric[who] || {};
    var chips = ""; for (var i = 1; i <= D.students; i++) chips += '<button class="btn-s' + (i === who ? " on" : "") + '" data-rw="' + i + '" style="' + (i === who ? "background:var(--ink);color:#fff" : "") + '">S' + i + "</button>";
    r.innerHTML = '<div class="rb-who"><span class="pnote">' + T(U.rubricWho) + "</span>" + chips + "</div>" +
      U.rubricCrit.map(function (c, ci) {
        return '<div class="rb-row"><div class="rc">' + T(c) + '</div><div class="rb-lv">' + U.rubricLevels.map(function (lv, li) { return '<button class="btn-s' + (cur[ci] === li + 1 ? " on" : "") + '" data-rc="' + ci + '" data-rl="' + (li + 1) + '">' + T(lv) + "</button>"; }).join("") + "</div></div>";
      }).join("") + '<p class="pnote">' + T(U.rubricNote) + "</p>";
  };

  /* ---------- reflection ---------- */
  B.reflect = function (b) {
    return '<div class="reflect">' + b.items.map(function (t) { return '<button class="chip" data-ex="' + esc(t) + '">' + T(t) + "<b>" + (X.D.reflect[t] || 0) + "</b></button>"; }).join("") + "</div><p class=\"pnote\">" + T(U.reflectHint) + "</p>";
  };

  /* ---------- word banks (shared by the panel and the Words drawer) ---------- */
  X.bankState = { tab: 0, shown: [3, 3, 3, 3] };
  function bankHtml() {
    var S = X.bankState, cat = L.bank[S.tab];
    var tabs = L.bank.map(function (c, i) { return '<button class="btn-s' + (i === S.tab ? " on" : "") + '" data-bt="' + i + '" style="' + (i === S.tab ? "background:var(--ink);color:#fff" : "") + '">' + T(c.n) + "</button>"; }).join("");
    var words = cat.w.slice(0, S.shown[S.tab]).map(function (w) { return '<span class="chip">' + T(w) + "</span>"; }).join("");
    var done = S.shown[S.tab] >= cat.w.length;
    return '<div class="bank-tabs">' + tabs + '</div><div class="bank-words">' + words + '</div><div>' + (done ? '<span class="pnote">' + T(U.bankDone) + "</span>" : '<button class="btn-s" data-bm="1">' + T(U.bankMore) + "</button>") + "</div>";
  }
  X.bankHtml = bankHtml;
  B.bank = function () { return '<div class="bank">' + bankHtml() + "</div>"; };
  X.refreshBank = function () { X.$$(".bank").forEach(function (b) { b.innerHTML = bankHtml(); }); };
  function bankClick(e) {
    var bt = e.target.closest("[data-bt]"), bm = e.target.closest("[data-bm]");
    if (bt) { X.bankState.tab = +bt.dataset.bt; X.refreshBank(); return true; }
    if (bm) { X.bankState.shown[X.bankState.tab] += 3; X.refreshBank(); return true; }
    return false;
  }
  X.bankClick = bankClick;

  /* ---------- delegated events on the panel ---------- */
  X.afterPanel = function () {
    X.renderPlan(); X.renderRubric();
    X.updatePhase(X.S.step && X.S.step.phase);
  };
  X.bindPanel = function () {
    var panel = X.el.panel;
    bindRank(panel);
    panel.addEventListener("click", function (e) {
      var t = e.target;
      var say = t.closest(".say-btn");
      if (say) { X.listen(say.dataset.say, say.dataset.role); return; }
      var opt = t.closest(".opts .opt");
      if (opt) { var was = opt.classList.contains("open"); X.$$(".opts .opt").forEach(function (o) { o.classList.remove("open"); }); if (!was) opt.classList.add("open"); return; }
      var sb = t.closest(".scale .sbtn"); if (sb && sb.tagName === "BUTTON") { bumpScale(sb, e); return; }
      var mv = t.closest("[data-mv]"); if (mv) { var card = mv.closest(".rcard"); moveRank(card.dataset.id, mv.dataset.mv === "up" ? -1 : 1); return; }
      var rt = t.closest("[data-rt]");
      if (rt) { if (rt.dataset.rt === "top") { X.D.rankTop = !X.D.rankTop; reRank(); } else { X.D.rank = ["creativity", "friendship", "independence", "cooperation"]; X.D.rankTop = false; reRank(); } return; }
      var wo = t.closest(".wopt"); if (wo) { bumpWyr(wo, e); return; }
      if (bankClick(e)) return;
      var pm = t.closest("[data-pm]");
      if (pm) { var s = X.D.plan.slots[+pm.dataset.pm]; var k = MINS.indexOf(s.m); s.m = MINS[(k + 1) % MINS.length]; X.renderPlan(); X.saveData(); return; }
      var pa = t.closest("[data-pa]");
      if (pa) { if (X.planSel === "b") X.D.plan.backup = pa.dataset.pa; else { var sl = X.D.plan.slots[X.planSel]; sl.a = pa.dataset.pa; if (!sl.m) sl.m = 20; X.planSel = Math.min(2, X.planSel + 1); } X.renderPlan(); X.saveData(); return; }
      var ps = t.closest(".pslot");
      if (ps && ps.parentNode.dataset.ro !== "1") { X.planSel = ps.dataset.i === "b" ? "b" : +ps.dataset.i; X.renderPlan(); return; }
      var cn = t.closest("[data-cn]");
      if (cn) { X.D.constraintIdx = (X.D.constraintIdx + 1) % X.constraintItems.length; X.$("#panel .constraint").innerHTML = T(X.constraintItems[X.D.constraintIdx]); X.saveData(); return; }
      var rw = t.closest("[data-rw]"); if (rw) { X.D.rubricWho = +rw.dataset.rw; X.renderRubric(); return; }
      var rc = t.closest("[data-rc]");
      if (rc) { var w = X.D.rubricWho, r = X.D.rubric[w] || (X.D.rubric[w] = {}); var ci = +rc.dataset.rc, lv = +rc.dataset.rl; r[ci] = r[ci] === lv ? 0 : lv; X.renderRubric(); X.saveData(); X.refreshNotes && X.refreshNotes(); return; }
      var ex = t.closest("[data-ex]");
      if (ex) { var key = ex.dataset.ex; X.D.reflect[key] = Math.max(0, (X.D.reflect[key] || 0) + (e.shiftKey ? -1 : 1)); X.$("b", ex).textContent = X.D.reflect[key]; X.saveData(); X.refreshNotes && X.refreshNotes(); return; }
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
