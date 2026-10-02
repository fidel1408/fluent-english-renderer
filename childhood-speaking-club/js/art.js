/* Fluent English – "Memory Box" art kit: code-drawn people, props and helpers (SVG).
 * Characters are drawn at a standing height of about 540 units with the origin at the feet. */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var A = (FE.Art = FE.Art || {});

  var INK = "#0A2E63";
  A.C = {
    ink: INK, paper: "#FFF7E8", paper2: "#F7EBD2", coral: "#F26B5B", mustard: "#F2B544", teal: "#1F9E9A",
    sage: "#8DBF8B", plum: "#6B4C9A", sky: "#9FD3F0", cream: "#FFFDF7", wood: "#B9814F", woodDark: "#8A5A33",
    skin1: "#F2C9A5", skin2: "#D99A6C", skin3: "#A9693F", skin4: "#7A4A2D", skin5: "#E8B592",
  };
  var C = A.C;

  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  A.shade = shade;

  /* ---------- pose table: [upperArm, foreArm] angles for the arm on the screen-LEFT, then screen-RIGHT.
   * 0 = hanging down. For the left arm, positive angles swing outward/up; for the right arm negative do. */
  A.POSES = {
    rest:   { L: [6, 6],     R: [-6, -6] },
    open:   { L: [52, 18],   R: [-52, -18] },
    wave:   { L: [6, 6],     R: [-150, -14], wave: "R" },
    point:  { L: [6, 6],     R: [-84, -4] },
    pointL: { L: [84, 4],    R: [-6, -6] },
    think:  { L: [6, 6],     R: [32, 142] },
    thinkL: { L: [-32, -142], R: [-6, -6] },
    hold:   { L: [-26, -68], R: [26, 68] },
    shrug:  { L: [40, 70],   R: [-40, -70] },
    cheer:  { L: [150, 14],  R: [-150, -14] },
    clap:   { L: [-30, -96], R: [30, 96] },
    hips:   { L: [32, -88],  R: [-32, 88] },
    present: { L: [6, 6],    R: [-62, -50] },
    presentL: { L: [62, 50], R: [-6, -6] },
    lift:   { L: [-6, -6],   R: [-110, -80] },
    reach:  { L: [6, 6],     R: [-100, -10] },
    write:  { L: [-20, -78], R: [20, 90] },
    kidrun: { L: [40, -40],  R: [-40, 40] },
  };

  A.MOODS = {
    neutral:   { m: "smile", b: "none", e: "open" },
    smile:     { m: "smile", b: "none", e: "open" },
    warm:      { m: "smile", b: "soft", e: "open" },
    grin:      { m: "grin", b: "up", e: "open" },
    laugh:     { m: "laugh", b: "up", e: "happy" },
    surprised: { m: "o", b: "up", e: "wide" },
    curious:   { m: "think", b: "curious", e: "open" },
    thinking:  { m: "think", b: "curious", e: "open", look: "up" },
    worried:   { m: "worry", b: "worry", e: "open" },
    shy:       { m: "smile", b: "worry", e: "open", look: "down" },
    flat:      { m: "flat", b: "none", e: "open" },
    proud:     { m: "grin", b: "soft", e: "happy" },
    sad:       { m: "worry", b: "worry", e: "open", look: "down" },
  };

  /* ---------- hair ---------- */
  function hairBack(style, col) {
    switch (style) {
      case "long":
        return '<path d="M-58,-470 Q-70,-560 0,-562 Q70,-560 58,-470 Q66,-410 54,-366 L-54,-366 Q-66,-410 -58,-470Z" fill="' + col + '"/>';
      case "bun":
        return '<circle cx="0" cy="-566" r="26" fill="' + col + '"/>';
      case "curly":
        return '<g fill="' + col + '"><circle cx="-50" cy="-500" r="28"/><circle cx="-26" cy="-538" r="32"/><circle cx="14" cy="-548" r="34"/><circle cx="48" cy="-520" r="30"/><circle cx="58" cy="-478" r="22"/><circle cx="-60" cy="-462" r="20"/></g>';
      default:
        return "";
    }
  }
  function hairFront(style, col) {
    switch (style) {
      case "short":
        return '<path d="M-56,-482 Q-62,-548 0,-550 Q62,-548 56,-482 Q46,-516 6,-522 Q-34,-516 -56,-482Z" fill="' + col + '"/>';
      case "wavy":
        return '<path d="M-58,-478 Q-70,-552 -4,-556 Q64,-556 58,-478 Q50,-512 22,-520 Q4,-502 -24,-518 Q-46,-512 -58,-478Z" fill="' + col + '"/>';
      case "buzz":
        return '<path d="M-54,-486 Q-58,-538 0,-540 Q58,-538 54,-486 Q40,-520 0,-522 Q-40,-520 -54,-486Z" fill="' + col + '" opacity=".9"/>';
      case "bun":
        return '<path d="M-56,-482 Q-62,-546 0,-548 Q62,-546 56,-482 Q40,-520 0,-522 Q-40,-520 -56,-482Z" fill="' + col + '"/>';
      case "long":
        return '<path d="M-58,-474 Q-66,-550 0,-552 Q66,-550 58,-474 Q40,-520 6,-526 Q-30,-520 -58,-474Z" fill="' + col + '"/>';
      case "curly":
        return '<g fill="' + col + '"><circle cx="-34" cy="-522" r="22"/><circle cx="0" cy="-534" r="24"/><circle cx="34" cy="-522" r="22"/><circle cx="-50" cy="-494" r="14"/><circle cx="50" cy="-494" r="14"/></g>';
      default:
        return "";
    }
  }

  /* ---------- eyes / mouths ---------- */
  function eye(side) {
    var x = side === "L" ? -21 : 21;
    return '<g class="eye eye' + side + '" transform="translate(' + x + ',-2)">' +
      '<g class="eye-open"><ellipse rx="11" ry="12.5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<g class="pupil"><circle r="6.6" fill="' + INK + '"/><circle cx="2.4" cy="-2.4" r="2.2" fill="#fff"/></g></g>' +
      '<path class="eye-happy" d="M-11,3 Q0,-12 11,3" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
      "</g>";
  }
  function mouths() {
    return '<g class="mouth" transform="translate(0,26)">' +
      '<path class="m-smile" d="M-17,-2 Q0,15 17,-2" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
      '<g class="m-grin"><path d="M-21,-4 Q0,28 21,-4 Q0,2 -21,-4Z" fill="#7B2433"/><path d="M-17,-3 Q0,6 17,-3 Q0,0 -17,-3Z" fill="#fff"/></g>' +
      '<g class="m-laugh"><path d="M-24,-6 Q0,38 24,-6 Z" fill="#7B2433"/><ellipse cx="0" cy="14" rx="9" ry="5" fill="#E8766F"/></g>' +
      '<ellipse class="m-o" cx="0" cy="6" rx="7" ry="9" fill="#7B2433"/>' +
      '<path class="m-flat" d="M-12,4 L12,4" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path class="m-think" d="M-12,6 Q2,-1 15,3" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path class="m-worry" d="M-14,8 Q0,-6 14,8" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
      '<g class="m-talk"><ellipse cx="0" cy="6" rx="10" ry="8" fill="#7B2433"/><ellipse cx="0" cy="11" rx="6" ry="3" fill="#E8766F"/></g>' +
      "</g>";
  }

  /* ---------- the person ---------- */
  /* o: skin, hair, hairStyle, top, inner, bottom, shoe, glasses, beard, scarf, kid, topStyle, id */
  A.person = function (o) {
    o = o || {};
    var skin = o.skin || C.skin1, skinD = shade(skin, -26);
    var hair = o.hair || "#3B2A20";
    var top = o.top || C.mustard, inner = o.inner || C.cream, bottom = o.bottom || "#2F4A7A", shoe = o.shoe || "#3A2A24";
    var kid = !!o.kid;
    var hs = kid ? 1.3 : 1.1; // head scale
    var bodyH = kid ? 0.7 : 1;
    var drop = kid ? 105 : 0; // kids: shorter legs, body sits lower
    var armLen = 98, foreLen = 92;

    var topShape;
    if (o.topStyle === "cardigan") {
      topShape = '<path d="M-60,-398 Q0,-418 60,-398 L70,-244 Q0,-226 -70,-244Z" fill="' + top + '"/>' +
        '<path d="M-16,-406 L0,-250 L16,-406 Q0,-396 -16,-406Z" fill="' + inner + '"/>' +
        '<path d="M-16,-406 L-2,-248 M16,-406 L2,-248" stroke="' + shade(top, -34) + '" stroke-width="3" fill="none"/>';
    } else if (o.topStyle === "jacket") {
      topShape = '<path d="M-60,-398 Q0,-418 60,-398 L70,-244 Q0,-226 -70,-244Z" fill="' + top + '"/>' +
        '<path d="M-22,-408 L0,-330 L22,-408 L10,-250 L-10,-250Z" fill="' + inner + '"/>' +
        '<path d="M-22,-408 L-4,-336 M22,-408 L4,-336" stroke="' + shade(top, -40) + '" stroke-width="3.5" fill="none"/>' +
        '<circle cx="0" cy="-300" r="3.2" fill="' + shade(top, -50) + '"/><circle cx="0" cy="-270" r="3.2" fill="' + shade(top, -50) + '"/>';
    } else {
      topShape = '<path d="M-60,-398 Q0,-418 60,-398 L70,-244 Q0,-226 -70,-244Z" fill="' + top + '"/>' +
        '<path d="M-22,-410 Q0,-384 22,-410" fill="' + skin + '" stroke="' + shade(top, -34) + '" stroke-width="4"/>' +
        '<path d="M-56,-262 Q0,-248 56,-262" stroke="' + shade(top, -26) + '" stroke-width="4" fill="none"/>';
    }

    function arm(side) {
      var sx = side === "L" ? -62 : 62;
      return '<g class="arm arm' + side + '" transform="translate(' + sx + ',-384)">' +
        '<g class="ua" style="transform:rotate(' + (side === "L" ? 6 : -6) + 'deg)">' +
        '<path d="M-17,-4 L-14,' + armLen + ' L14,' + armLen + ' L17,-4 Q0,-20 -17,-4Z" fill="' + top + '"/>' +
        '<g transform="translate(0,' + armLen + ')"><g class="fa" style="transform:rotate(' + (side === "L" ? 6 : -6) + 'deg)">' +
        '<path d="M-13,-3 L-11,' + (foreLen - 8) + ' L11,' + (foreLen - 8) + ' L13,-3Z" fill="' + top + '"/>' +
        '<rect x="-13" y="' + (foreLen - 26) + '" width="26" height="8" fill="' + shade(top, -22) + '" opacity=".55"/>' +
        '<circle cx="0" cy="' + (foreLen) + '" r="15" fill="' + skin + '"/>' +
        '<g class="prop prop' + side + '" transform="translate(0,' + foreLen + ')"></g>' +
        "</g></g></g></g>";
    }

    var pants = '<g class="legs"' + (kid ? ' transform="scale(1,' + ((246 - drop) / 246).toFixed(3) + ')"' : '') + '>' +
      '<path d="M-36,-246 L-34,-26 L-6,-26 L-4,-246Z" fill="' + bottom + '"/>' +
      '<path d="M4,-246 L6,-26 L34,-26 L36,-246Z" fill="' + bottom + '"/>' +
      "</g>";
    var shoes = '<path d="M-42,-26 Q-22,-4 -4,-12 L-4,-26Z" fill="' + shoe + '"/>' +
      '<path d="M42,-26 Q22,-4 4,-12 L4,-26Z" fill="' + shoe + '"/>' +
      '<ellipse cx="-22" cy="-6" rx="30" ry="12" fill="' + shoe + '"/><ellipse cx="22" cy="-6" rx="30" ry="12" fill="' + shoe + '"/>';
    var legs = pants + (kid ? "" : "") + '<g class="shoes">' + shoes + "</g>";
    var upper = function (inner) { return kid ? '<g transform="translate(0,' + drop + ')">' + inner + "</g>" : inner; };
    var belt = '<path d="M-62,-252 L62,-252 L70,-240 L-70,-240Z" fill="' + shade(bottom, -16) + '"/>';

    var scarf = o.scarf ?
      '<path d="M-44,-406 Q0,-380 44,-406 Q50,-388 40,-376 Q0,-358 -40,-376 Q-50,-388 -44,-406Z" fill="' + o.scarf + '"/>' +
      '<path d="M18,-380 L30,-318 L8,-318 L2,-372Z" fill="' + shade(o.scarf, -24) + '"/>' : "";

    var beard = o.beard ?
      '<path d="M-44,-476 Q-50,-420 0,-408 Q50,-420 44,-476 Q34,-446 0,-444 Q-34,-446 -44,-476Z" fill="' + hair + '"/>' : "";

    var glasses = o.glasses ?
      '<g fill="rgba(255,255,255,.14)" stroke="' + (o.glasses === true ? INK : o.glasses) + '" stroke-width="3"><circle cx="-21" cy="-2" r="19.5"/><circle cx="21" cy="-2" r="19.5"/><path d="M-2,-4 Q0,-8 2,-4" fill="none"/><path d="M-40,-4 L-52,-8 M40,-4 L52,-8" fill="none"/></g>' : "";

    var face =
      '<g class="face" data-m="smile" data-b="none" data-e="open" data-look="">' +
      '<ellipse cx="-34" cy="14" rx="9" ry="6" fill="#F2837A" opacity=".35"/><ellipse cx="34" cy="14" rx="9" ry="6" fill="#F2837A" opacity=".35"/>' +
      eye("L") + eye("R") +
      '<path d="M-3,10 Q1,18 7,12" fill="none" stroke="' + skinD + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '<g class="brows"><rect class="brow browL" x="-34" y="-30" width="26" height="5.5" rx="2.7" fill="' + hair + '"/><rect class="brow browR" x="8" y="-30" width="26" height="5.5" rx="2.7" fill="' + hair + '"/></g>' +
      glasses + "</g>";

    var head =
      '<g class="head" style="transform-origin:0px -420px">' +
      hairBack(o.hairStyle, hair) +
      '<rect x="-15" y="-430" width="30" height="34" rx="10" fill="' + skinD + '"/>' +
      '<ellipse cx="-53" cy="-474" rx="9" ry="13" fill="' + skin + '"/><ellipse cx="53" cy="-474" rx="9" ry="13" fill="' + skin + '"/>' +
      '<ellipse cx="0" cy="-474" rx="53" ry="59" fill="' + skin + '"/>' +
      beard +
      hairFront(o.hairStyle, hair) +
      '<g transform="translate(0,-474)">' + face.replace('<g class="mouth"', '<g class="mouth"') + "</g>" +
      "</g>";
    // mouths live inside .face but must be added (after face creation so beard sits underneath)
    head = head.replace('<g class="brows">', mouths().replace('translate(0,26)', 'translate(0,24)') + '<g class="brows">');

    var headWrap = kid
      ? '<g transform="translate(0,-420) scale(' + hs + ') translate(0,420)">' + head + "</g>"
      : head;

    return '<g class="person' + (o.glasses ? " glasses" : "") + (o.cls ? " " + o.cls : "") + '" data-char="' + (o.id || "") + '"' + (o.pose ? ' data-init-pose="' + o.pose + '"' : "") + (o.mood ? ' data-init-mood="' + o.mood + '"' : "") + ">" +
      '<ellipse class="shadow" cx="0" cy="2" rx="86" ry="12" fill="rgba(10,46,99,.16)"/>' +
      '<g class="body" transform="scale(' + bodyH + ')" style="transform-origin:0 0">' +
      '<g class="idle">' +
      legs +
      upper(belt + '<g class="torso">' + topShape + "</g>" + scarf + headWrap + arm("L") + arm("R")) +
      "</g></g></g>";
  };

  /* ---------- named adult cast ---------- */
  A.CHARS = {
    maya:   { id: "maya",   skin: C.skin3, hair: "#2A1A14", hairStyle: "curly", top: C.mustard, inner: C.cream, bottom: "#34507F", topStyle: "cardigan", shoe: "#5B3A2A" },
    theo:   { id: "theo",   skin: C.skin1, hair: "#4A3224", hairStyle: "short", top: C.teal, inner: "#E9F4F2", bottom: "#3C3C4A", topStyle: "sweater", beard: true, glasses: true, shoe: "#2A2A33" },
    alex:   { id: "alex",   skin: C.skin5, hair: "#6B4A2E", hairStyle: "bun", top: "#7BA37E", inner: C.cream, bottom: "#3E4B63", topStyle: "cardigan", shoe: "#4B3B33", glasses: "#6B4C9A" },
    jordan: { id: "jordan", skin: C.skin2, hair: "#1E1E26", hairStyle: "wavy", top: C.coral, inner: "#FFF1DE", bottom: "#2E3B55", topStyle: "jacket", scarf: "#F2B544", shoe: "#2B2B35" },
  };
  var KID_SET = [
    { skin: C.skin1, hair: "#4A3224", hairStyle: "short", top: "#F26B5B", bottom: "#3E5B8C" },
    { skin: C.skin3, hair: "#241713", hairStyle: "curly", top: "#F2B544", bottom: "#4A6B5C" },
    { skin: C.skin5, hair: "#7A5232", hairStyle: "long", top: "#1F9E9A", bottom: "#5B4B8A" },
    { skin: C.skin2, hair: "#17171C", hairStyle: "buzz", top: "#6B4C9A", bottom: "#3B4A6E" },
    { skin: C.skin4, hair: "#120D0B", hairStyle: "bun", top: "#8DBF8B", bottom: "#44506A" },
    { skin: C.skin1, hair: "#B0703A", hairStyle: "wavy", top: "#3C78C9", bottom: "#555E78" },
  ];
  A.kid = function (n, extra) {
    var base = KID_SET[((n % KID_SET.length) + KID_SET.length) % KID_SET.length];
    var o = {};
    for (var k in base) o[k] = base[k];
    o.kid = true; o.topStyle = "sweater"; o.shoe = "#3A2A24"; o.id = "kid" + n;
    if (extra) for (var e in extra) o[e] = extra[e];
    return A.person(o);
  };
  A.adult = function (name, extra) {
    var o = {};
    var base = A.CHARS[name];
    for (var k in base) o[k] = base[k];
    if (extra) for (var e in extra) o[e] = extra[e];
    return A.person(o);
  };

  /* ---------- runtime controls for a mounted person element ---------- */
  A.setPose = function (el, name) {
    var p = A.POSES[name] || A.POSES.rest;
    var armL = el.querySelector(".armL"), armR = el.querySelector(".armR");
    function set(arm, pair) {
      arm.querySelector(".ua").style.transform = "rotate(" + pair[0] + "deg)";
      arm.querySelector(".fa").style.transform = "rotate(" + pair[1] + "deg)";
    }
    set(armL, p.L); set(armR, p.R);
    el.classList.toggle("wave-R", p.wave === "R");
    el.dataset.pose = name;
  };
  A.setMood = function (el, name) {
    var m = A.MOODS[name] || A.MOODS.neutral;
    var f = el.querySelector(".face");
    f.dataset.m = m.m; f.dataset.b = m.b; f.dataset.e = m.e; f.dataset.look = m.look || "";
    el.dataset.mood = name;
  };
  A.applyInit = function (rootEl) {
    var list = rootEl.querySelectorAll(".person[data-init-pose],.person[data-init-mood]");
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      if (el.dataset.initPose) A.setPose(el, el.dataset.initPose);
      if (el.dataset.initMood) A.setMood(el, el.dataset.initMood);
    }
  };
  A.setTalking = function (el, on) { el.classList.toggle("talking", !!on); };
  A.setProp = function (el, hand, svg) {
    var g = el.querySelector(".prop" + hand);
    if (g) g.innerHTML = svg || "";
  };

  /* ---------- small prop library (each returns an SVG string at local origin) ---------- */
  A.props = {
    ball: function (c) { c = c || C.coral; return '<circle r="26" fill="' + c + '"/><path d="M-24,-8 Q0,-24 24,-8 M-24,10 Q0,26 24,10" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/><circle cx="-9" cy="-10" r="7" fill="#fff" opacity=".28"/>'; },
    paper: function () { return '<g transform="rotate(-8)"><rect x="-28" y="-62" width="56" height="70" rx="3" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M-16,-44 H16 M-16,-30 H10 M-16,-16 H16" stroke="#9FD3F0" stroke-width="4" stroke-linecap="round"/></g>'; },
    cup: function () { return '<g transform="translate(0,-18)"><rect x="-16" y="-24" width="32" height="38" rx="6" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M16,-14 q16,2 0,18" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M-6,-34 q-6,-8 0,-14 M6,-34 q-6,-8 0,-14" stroke="#B9814F" stroke-width="3" fill="none" stroke-linecap="round"/></g>'; },
    marker: function () { return '<g transform="rotate(30)"><rect x="-5" y="-40" width="10" height="46" rx="3" fill="#F26B5B"/><rect x="-5" y="-48" width="10" height="10" fill="#222"/></g>'; },
    note: function () { return '<g transform="rotate(-6)"><rect x="-26" y="-54" width="52" height="60" fill="#FFF3B8" stroke="#E2BE4C" stroke-width="2"/><path d="M-16,-40 q6,-6 12,0 t12,0 M-16,-26 q6,-6 12,0 t12,0 M-16,-12 q6,-6 12,0" fill="none" stroke="#7A6B3C" stroke-width="2.4"/></g>'; },
    clipboard: function () { return '<g transform="rotate(-6)"><rect x="-30" y="-70" width="60" height="78" rx="5" fill="#B9814F"/><rect x="-24" y="-62" width="48" height="62" fill="#fff"/><rect x="-10" y="-76" width="20" height="10" rx="3" fill="#8A5A33"/><path d="M-16,-46 H16 M-16,-32 H16 M-16,-18 H8" stroke="#9FD3F0" stroke-width="4" stroke-linecap="round"/></g>'; },
    kite: function () { return '<g transform="translate(0,-110) rotate(14)"><path d="M0,-60 L40,0 L0,70 L-40,0Z" fill="' + C.coral + '"/><path d="M0,-60 L0,70 M-40,0 L40,0" stroke="#fff" stroke-width="3"/><path d="M0,70 q-14,18 4,34 q20,18 0,40" fill="none" stroke="' + C.teal + '" stroke-width="4" stroke-linecap="round"/></g>'; },
    toyRobot: function () { return '<g transform="translate(0,-42)"><rect x="-24" y="-22" width="48" height="40" rx="8" fill="#9FD3F0" stroke="' + INK + '" stroke-width="3"/><rect x="-20" y="-54" width="40" height="30" rx="8" fill="#F2B544" stroke="' + INK + '" stroke-width="3"/><circle cx="-8" cy="-40" r="5" fill="#fff"/><circle cx="8" cy="-40" r="5" fill="#fff"/><circle cx="-8" cy="-40" r="2" fill="' + INK + '"/><circle cx="8" cy="-40" r="2" fill="' + INK + '"/><path d="M0,-54 V-66" stroke="' + INK + '" stroke-width="3"/><circle cx="0" cy="-68" r="4" fill="#F26B5B"/><rect x="-12" y="-10" width="24" height="12" rx="3" fill="#F26B5B"/></g>'; },
    pencil: function () { return '<g transform="rotate(35)"><rect x="-5" y="-50" width="10" height="46" fill="#F2B544"/><path d="M-5,-4 L0,10 L5,-4Z" fill="#F2C9A5"/><rect x="-5" y="-56" width="10" height="8" fill="#F26B5B"/></g>'; },
  };
})(typeof window !== "undefined" ? window : globalThis);
