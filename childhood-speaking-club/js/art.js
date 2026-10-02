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
  var OL = ' stroke="#0A2E63" stroke-opacity=".55" stroke-width="2.6" stroke-linejoin="round"';
  function hairBack(style, col) {
    var hi = shade(col, 34);
    switch (style) {
      case "long":
        return '<path d="M-60,-470 Q-74,-566 0,-568 Q74,-566 60,-470 Q70,-410 56,-362 L-56,-362 Q-70,-410 -60,-470Z" fill="' + col + '"' + OL + '/><path d="M-40,-540 Q-52,-450 -44,-380" stroke="' + hi + '" stroke-width="5" fill="none" opacity=".5"/>';
      case "bun":
        return '<circle cx="0" cy="-570" r="28" fill="' + col + '"' + OL + '/><path d="M-12,-584 Q0,-596 12,-584" stroke="' + hi + '" stroke-width="5" fill="none" opacity=".6"/>';
      case "curly":
        return '<g fill="' + col + '"' + OL + '><circle cx="-52" cy="-500" r="30"/><circle cx="-28" cy="-540" r="34"/><circle cx="14" cy="-552" r="36"/><circle cx="50" cy="-522" r="32"/><circle cx="60" cy="-478" r="24"/><circle cx="-62" cy="-462" r="22"/></g><g fill="' + hi + '" opacity=".45"><circle cx="-30" cy="-548" r="9"/><circle cx="20" cy="-560" r="9"/><circle cx="52" cy="-528" r="8"/></g>';
      default:
        return "";
    }
  }
  function hairFront(style, col) {
    var hi = shade(col, 36);
    switch (style) {
      case "short":
        return '<path d="M-57,-482 Q-64,-552 0,-554 Q64,-552 57,-482 Q47,-518 6,-524 Q-34,-518 -57,-482Z" fill="' + col + '"' + OL + '/>';
      case "quiff":
        return '<path d="M-55,-490 Q-62,-546 -6,-555 Q36,-562 60,-534 Q64,-510 55,-486 Q48,-512 20,-520 Q-8,-526 -30,-514 Q-46,-504 -55,-490Z" fill="' + col + '"' + OL + '/><path d="M-30,-540 Q4,-554 38,-540" stroke="' + hi + '" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"/><path d="M-57,-486 L-56,-452 M57,-486 L56,-452" stroke="' + col + '" stroke-width="12" stroke-linecap="round"/>';
      case "crop":
        return '<path d="M-54,-488 Q-60,-546 0,-548 Q60,-546 54,-488 Q44,-516 0,-518 Q-44,-516 -54,-488Z" fill="' + col + '"' + OL + '/>';
      case "wavy":
        return '<path d="M-60,-478 Q-72,-556 -4,-560 Q66,-560 60,-478 Q52,-514 24,-522 Q4,-504 -24,-520 Q-48,-514 -60,-478Z" fill="' + col + '"' + OL + '/><path d="M-30,-540 Q0,-554 34,-540" stroke="' + hi + '" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>';
      case "bun":
        return '<path d="M-58,-482 Q-64,-548 0,-550 Q64,-548 58,-482 Q42,-520 0,-522 Q-42,-520 -58,-482Z" fill="' + col + '"' + OL + '/><path d="M-26,-536 Q0,-546 26,-536" stroke="' + hi + '" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>';
      case "long":
        return '<path d="M-60,-474 Q-68,-552 0,-554 Q68,-552 60,-474 Q42,-522 6,-528 Q-30,-522 -60,-474Z" fill="' + col + '"' + OL + '/>';
      case "buzz":
        return '<path d="M-54,-486 Q-58,-540 0,-542 Q58,-540 54,-486 Q40,-520 0,-522 Q-40,-520 -54,-486Z" fill="' + col + '" opacity=".92"/>';
      case "curly":
        return '<g fill="' + col + '"' + OL + '><circle cx="-34" cy="-526" r="23"/><circle cx="0" cy="-538" r="25"/><circle cx="34" cy="-526" r="23"/><circle cx="-52" cy="-496" r="15"/><circle cx="52" cy="-496" r="15"/></g>';
      default:
        return "";
    }
  }

  /* ---------- eyes / mouths ---------- */
  function eye(side, male, iris) {
    var x = side === "L" ? -21 : 21;
    var rx = male ? 10.5 : 11.5, ry = male ? 11 : 12.8;
    return '<g class="eye eye' + side + '" transform="translate(' + x + ',-2)">' +
      '<g class="eye-open"><ellipse rx="' + rx + '" ry="' + ry + '" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<g class="pupil"><circle r="7.2" fill="' + (iris || "#3B2A20") + '"/><circle r="3.6" fill="' + INK + '"/><circle cx="2.6" cy="-2.6" r="2.4" fill="#fff"/></g>' +
      (male ? "" : '<path d="M' + (side === "L" ? "-11,-4 l-6,-5 M-12,0 l-7,-1" : "11,-4 l6,-5 M12,0 l7,-1") + '" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>') + "</g>" +
      '<path class="eye-happy" d="M-11,3 Q0,-12 11,3" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
      "</g>";
  }
  function mouths(male) {
    var sw = male ? 4 : 4.5;
    return '<g class="mouth" transform="translate(0,26)">' +
      '<path class="m-smile" d="M-17,-2 Q0,15 17,-2" fill="none" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<g class="m-grin"><path d="M-21,-4 Q0,28 21,-4 Q0,2 -21,-4Z" fill="#7B2433"/><path d="M-17,-3 Q0,6 17,-3 Q0,0 -17,-3Z" fill="#fff"/></g>' +
      '<g class="m-laugh"><path d="M-24,-6 Q0,38 24,-6 Z" fill="#7B2433"/><path d="M-20,-5 Q0,6 20,-5 Q0,-1 -20,-5Z" fill="#fff"/><ellipse cx="0" cy="14" rx="9" ry="5" fill="#E8766F"/></g>' +
      '<ellipse class="m-o" cx="0" cy="6" rx="7" ry="9" fill="#7B2433"/>' +
      '<path class="m-flat" d="M-12,4 L12,4" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<path class="m-think" d="M-11,5 Q3,12 15,-1" fill="none" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<path class="m-worry" d="M-14,8 Q0,-6 14,8" fill="none" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<g class="m-talk"><ellipse cx="0" cy="6" rx="10" ry="8" fill="#7B2433"/><ellipse cx="0" cy="11" rx="6" ry="3" fill="#E8766F"/></g>' +
      "</g>";
  }

  /* ---------- the person ---------- */
  /* o: build ("f" | "m"), skin, hair, hairStyle, top, inner, bottom, shoe, glasses, beard, scarf, kid, topStyle, rolled, iris, id */
  A.person = function (o) {
    o = o || {};
    var male = o.build === "m";
    var skin = o.skin || C.skin1, skinD = shade(skin, -28), skinL = shade(skin, 14);
    var hair = o.hair || "#3B2A20";
    var top = o.top || C.mustard, inner = o.inner || C.cream, bottom = o.bottom || "#2F4A7A", shoe = o.shoe || "#3A2A24";
    var kid = !!o.kid;
    var hs = kid ? 1.3 : male ? 1.06 : 1.1;
    var bodyH = kid ? 0.7 : 1;
    var drop = kid ? 105 : 0;
    var sh = male ? 84 : 62;                 // shoulder half-width
    var armLen = 98, foreLen = 92, uw = male ? 21 : 17, fw = male ? 16 : 13;

    /* torso */
    var torsoPath = male
      ? "M-86,-398 Q0,-424 86,-398 L80,-330 L74,-244 Q0,-226 -74,-244 L-80,-330Z"
      : "M-60,-398 Q0,-418 60,-398 L58,-322 Q64,-282 72,-244 Q0,-226 -72,-244 Q-64,-282 -58,-322Z";
    var shadeR = male
      ? '<path d="M36,-410 L86,-398 L80,-330 L74,-244 Q50,-236 30,-236 Q52,-320 36,-410Z" fill="rgba(8,24,60,.16)"/>'
      : '<path d="M26,-410 L60,-398 L58,-322 Q64,-282 72,-244 Q50,-236 28,-236 Q42,-320 26,-410Z" fill="rgba(8,24,60,.15)"/>';
    var topShape = '<path d="' + torsoPath + '" fill="' + top + '"' + OL + "/>" + shadeR +
      '<path d="M-' + (sh - 14) + ',-392 Q-' + (sh - 30) + ',-330 -' + (sh - 10) + ',-262" stroke="rgba(255,255,255,.22)" stroke-width="7" fill="none" stroke-linecap="round"/>';
    if (o.topStyle === "cardigan") {
      topShape += '<path d="M-17,-408 L0,-250 L17,-408 Q0,-396 -17,-408Z" fill="' + inner + '"/><path d="M-17,-408 L-2,-248 M17,-408 L2,-248" stroke="' + shade(top, -38) + '" stroke-width="3" fill="none"/>' +
        '<circle cx="-4" cy="-340" r="3.6" fill="' + shade(top, -50) + '"/><circle cx="-4" cy="-296" r="3.6" fill="' + shade(top, -50) + '"/>' +
        '<path d="M-60,-262 Q0,-250 60,-262" stroke="' + shade(top, -28) + '" stroke-width="6" fill="none"/>';
    } else if (o.topStyle === "jacket") {
      topShape += '<path d="M-24,-410 L0,-330 L24,-410 L11,-250 L-11,-250Z" fill="' + inner + '"/><path d="M-24,-410 L-4,-336 M24,-410 L4,-336" stroke="' + shade(top, -44) + '" stroke-width="4" fill="none"/>' +
        '<circle cx="0" cy="-300" r="3.6" fill="' + shade(top, -54) + '"/><circle cx="0" cy="-270" r="3.6" fill="' + shade(top, -54) + '"/>';
    } else if (o.topStyle === "henley") {
      topShape += '<path d="M-26,-412 Q0,-392 26,-412" fill="' + skin + '" stroke="' + shade(top, -40) + '" stroke-width="4"/>' +
        '<path d="M0,-404 V-340" stroke="' + shade(top, -44) + '" stroke-width="5"/><circle cx="0" cy="-384" r="4.2" fill="' + shade(top, -58) + '"/><circle cx="0" cy="-360" r="4.2" fill="' + shade(top, -58) + '"/>' +
        '<path d="M-70,-266 Q0,-252 70,-266" stroke="' + shade(top, -30) + '" stroke-width="6" fill="none"/>' +
        '<path d="M-60,-352 Q-46,-340 -58,-326 M52,-340 Q66,-330 56,-312" stroke="rgba(8,24,60,.22)" stroke-width="4" fill="none" stroke-linecap="round"/>';
    } else {
      topShape += '<path d="M-24,-412 Q0,-386 24,-412" fill="' + skin + '" stroke="' + shade(top, -38) + '" stroke-width="4"/>' +
        '<path d="M-58,-262 Q0,-248 58,-262" stroke="' + shade(top, -28) + '" stroke-width="5" fill="none"/>';
    }
    var belt = '<path d="M-' + (male ? 76 : 72) + ',-252 L' + (male ? 76 : 72) + ',-252 L' + (male ? 80 : 76) + ',-238 L-' + (male ? 80 : 76) + ',-238Z" fill="' + shade(bottom, -18) + '"/>' +
      (male ? '<rect x="-12" y="-251" width="24" height="12" rx="2" fill="#C9A24B" stroke="#7A5A1E" stroke-width="2"/>' : "");

    function arm(side) {
      var sx = side === "L" ? -sh : sh, rolled = male && o.rolled;
      var sleeve = '<path d="M-' + uw + ',-4 L-' + (uw - 3) + ',' + armLen + ' L' + (uw - 3) + ',' + armLen + ' L' + uw + ',-4 Q0,-22 -' + uw + ',-4Z" fill="' + top + '"' + OL + "/>" +
        '<path d="M' + (uw - 8) + ',2 L' + (uw - 9) + ',' + (armLen - 4) + '" stroke="rgba(8,24,60,.16)" stroke-width="9" fill="none"/>';
      var fore = rolled
        ? '<path d="M-' + (fw - 1) + ',-3 L-' + (fw - 3) + ',' + (foreLen - 8) + ' L' + (fw - 3) + ',' + (foreLen - 8) + ' L' + (fw - 1) + ',-3Z" fill="' + skin + '"' + OL + '/><path d="M-' + (fw + 4) + ',-6 L' + (fw + 4) + ',-6 L' + (fw + 3) + ',12 L-' + (fw + 3) + ',12Z" fill="' + shade(top, -16) + '"' + OL + '/>' +
          '<path d="M-6,22 q3,6 0,12 M6,30 q3,6 0,12" stroke="' + skinD + '" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>'
        : '<path d="M-' + fw + ',-3 L-' + (fw - 2) + ',' + (foreLen - 8) + ' L' + (fw - 2) + ',' + (foreLen - 8) + ' L' + fw + ',-3Z" fill="' + top + '"' + OL + '/>' +
          '<rect x="-' + fw + '" y="' + (foreLen - 26) + '" width="' + fw * 2 + '" height="8" fill="' + shade(top, -26) + '" opacity=".6"/>';
      var hr = male ? 17 : 15;
      return '<g class="arm arm' + side + '" transform="translate(' + sx + ',-384)">' +
        '<circle cx="0" cy="-2" r="' + (uw + 2) + '" fill="' + top + '"' + OL + "/>" +
        '<g class="ua" style="transform:rotate(' + (side === "L" ? 6 : -6) + 'deg)">' + sleeve +
        '<g transform="translate(0,' + armLen + ')"><g class="fa" style="transform:rotate(' + (side === "L" ? 6 : -6) + 'deg)">' + fore +
        '<circle cx="0" cy="' + foreLen + '" r="' + hr + '" fill="' + skin + '"' + OL + '/><ellipse cx="' + (side === "L" ? 11 : -11) + '" cy="' + (foreLen - 6) + '" rx="5.5" ry="8" fill="' + skin + '" transform="rotate(' + (side === "L" ? -20 : 20) + " " + (side === "L" ? 11 : -11) + " " + (foreLen - 6) + ')"/>' +
        '<g class="prop prop' + side + '" transform="translate(0,' + foreLen + ')"></g>' +
        "</g></g></g></g>";
    }

    var lw = male ? 46 : 38, gap = male ? 5 : 5;
    var pants = '<g class="legs"' + (kid ? ' transform="scale(1,' + ((246 - drop) / 246).toFixed(3) + ')"' : '') + '>' +
      '<path d="M-' + (lw - 2) + ',-246 L-' + (lw - 8) + ',-26 L-' + gap + ',-26 L-' + (gap - 1) + ',-246Z" fill="' + bottom + '"' + OL + '/>' +
      '<path d="M' + (gap - 1) + ',-246 L' + gap + ',-26 L' + (lw - 8) + ',-26 L' + (lw - 2) + ',-246Z" fill="' + bottom + '"' + OL + '/>' +
      '<path d="M' + (gap + 14) + ',-240 L' + (gap + 15) + ',-40" stroke="rgba(8,24,60,.18)" stroke-width="8" fill="none"/>' +
      "</g>";
    var shoes = '<g class="shoes"><path d="M-' + (lw + 6) + ',-26 Q-22,-2 -3,-12 L-3,-26Z" fill="' + shoe + '"' + OL + '/><path d="M' + (lw + 6) + ',-26 Q22,-2 3,-12 L3,-26Z" fill="' + shoe + '"' + OL + '/>' +
      '<ellipse cx="-22" cy="-6" rx="' + (male ? 34 : 30) + '" ry="12" fill="' + shoe + '"' + OL + '/><ellipse cx="22" cy="-6" rx="' + (male ? 34 : 30) + '" ry="12" fill="' + shoe + '"' + OL + '/>' +
      '<path d="M-52,0 Q-22,8 8,0 M52,0 Q22,8 -8,0" stroke="rgba(255,255,255,.55)" stroke-width="4" fill="none"/><path d="M-30,-14 l8,4 M-22,-17 l8,4 M30,-14 l-8,4 M22,-17 l-8,4" stroke="rgba(255,255,255,.7)" stroke-width="2.4" stroke-linecap="round"/></g>';
    var legs = pants + shoes;
    var upper = function (inner2) { return kid ? '<g transform="translate(0,' + drop + ')">' + inner2 + "</g>" : inner2; };

    var scarf = o.scarf ?
      '<path d="M-46,-408 Q0,-380 46,-408 Q52,-388 42,-376 Q0,-358 -42,-376 Q-52,-388 -46,-408Z" fill="' + o.scarf + '"' + OL + '/>' +
      '<path d="M18,-380 L32,-316 L8,-316 L2,-372Z" fill="' + shade(o.scarf, -26) + '"' + OL + '/><path d="M-30,-394 Q0,-378 30,-394" stroke="rgba(255,255,255,.3)" stroke-width="4" fill="none"/>' : "";

    /* head */
    var jaw = male
      ? "M-52,-510 C-58,-474 -54,-442 -36,-422 Q0,-402 36,-422 C54,-442 58,-474 52,-510 Q0,-542 -52,-510Z"
      : "";
    var headShape = male
      ? '<path d="' + jaw + '" fill="' + skin + '"' + OL + "/>"
      : '<ellipse cx="0" cy="-474" rx="53" ry="59" fill="' + skin + '"' + OL + "/>";
    var headShade = male
      ? '<path d="M24,-528 Q58,-490 50,-446 Q40,-424 14,-410 Q44,-460 24,-528Z" fill="rgba(120,50,20,.13)"/>'
      : '<path d="M22,-526 Q58,-490 50,-440 Q40,-422 14,-414 Q44,-464 22,-526Z" fill="rgba(120,50,20,.12)"/>';
    var neck = '<rect x="-' + (male ? 21 : 15) + '" y="-432" width="' + (male ? 42 : 30) + '" height="36" rx="10" fill="' + skinD + '"/>';
    var ears = '<ellipse cx="-' + (male ? 56 : 53) + '" cy="-474" rx="' + (male ? 10 : 9) + '" ry="' + (male ? 15 : 13) + '" fill="' + skin + '"' + OL + '/><ellipse cx="' + (male ? 56 : 53) + '" cy="-474" rx="' + (male ? 10 : 9) + '" ry="' + (male ? 15 : 13) + '" fill="' + skin + '"' + OL + '/>';
    var beard = o.beard
      ? '<path d="M-50,-486 Q-58,-426 -28,-408 Q0,-396 28,-408 Q58,-426 50,-486 Q40,-456 24,-450 Q0,-441 -24,-450 Q-40,-456 -50,-486Z" fill="' + hair + '"' + OL + '/>' +
        '<path d="M-24,-452 Q0,-464 24,-452 Q12,-444 0,-446 Q-12,-444 -24,-452Z" fill="' + hair + '"/>' +
        '<path d="M-40,-432 Q-28,-414 0,-410 M40,-432 Q28,-414 0,-410" stroke="' + shade(hair, 30) + '" stroke-width="3" fill="none" opacity=".55"/>'
      : "";
    var stubble = male && !o.beard ? '<g fill="rgba(40,24,16,.35)">' + [[-24, -430], [-10, -424], [6, -426], [20, -430], [-34, -442], [32, -444], [0, -418]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.8"/>'; }).join("") + "</g>" : "";
    var glasses = o.glasses
      ? '<g fill="rgba(255,255,255,.14)" stroke="' + (o.glasses === true ? INK : o.glasses) + '" stroke-width="3.4"><rect x="-42" y="-20" width="38" height="34" rx="' + (male ? 8 : 16) + '"/><rect x="4" y="-20" width="38" height="34" rx="' + (male ? 8 : 16) + '"/><path d="M-4,-6 Q0,-10 4,-6" fill="none"/><path d="M-42,-8 L-52,-12 M42,-8 L52,-12" fill="none"/></g>'
      : "";
    var cheeks = male ? "" : '<ellipse cx="-34" cy="14" rx="9" ry="6" fill="#F2837A" opacity=".38"/><ellipse cx="34" cy="14" rx="9" ry="6" fill="#F2837A" opacity=".38"/>';
    var nose = male
      ? '<path d="M-4,4 Q-8,16 -2,20 Q4,22 9,18" fill="none" stroke="' + skinD + '" stroke-width="3.6" stroke-linecap="round"/>'
      : '<path d="M-3,10 Q1,18 7,12" fill="none" stroke="' + skinD + '" stroke-width="3.2" stroke-linecap="round"/>';
    var browH = male ? 8 : 5.5, browW = male ? 30 : 26;
    var face =
      '<g class="face" data-m="smile" data-b="none" data-e="open" data-look="">' + cheeks + eye("L", male, o.iris) + eye("R", male, o.iris) + nose +
      '<g class="brows"><rect class="brow browL" x="-36" y="' + (male ? -33 : -30) + '" width="' + browW + '" height="' + browH + '" rx="' + browH / 2 + '" fill="' + hair + '"/><rect class="brow browR" x="' + (36 - browW) + '" y="' + (male ? -33 : -30) + '" width="' + browW + '" height="' + browH + '" rx="' + browH / 2 + '" fill="' + hair + '"/></g>' +
      glasses + "</g>";

    var head =
      '<g class="head" style="transform-origin:0px -420px">' +
      hairBack(o.hairStyle, hair) + neck + ears + headShape + headShade + stubble + beard + hairFront(o.hairStyle, hair) +
      '<g transform="translate(0,-474)">' + face + "</g></g>";
    head = head.replace('<g class="brows">', mouths(male).replace("translate(0,26)", "translate(0,24)") + '<g class="brows">');
    var headWrap = kid
      ? '<g transform="translate(0,-420) scale(' + hs + ') translate(0,420)">' + head + "</g>"
      : '<g transform="translate(0,-420) scale(' + hs + ') translate(0,420)">' + head + "</g>";

    return '<g class="person' + (o.glasses ? " glasses" : "") + (o.beard ? " bearded" : "") + (male ? " male" : "") + (o.cls ? " " + o.cls : "") + '" data-char="' + (o.id || "") + '"' + (o.pose ? ' data-init-pose="' + o.pose + '"' : "") + (o.mood ? ' data-init-mood="' + o.mood + '"' : "") + ">" +
      '<ellipse class="shadow" cx="0" cy="3" rx="' + (male ? 96 : 84) + '" ry="13" fill="rgba(10,46,99,.2)"/>' +
      '<g class="body" transform="scale(' + bodyH + ')" style="transform-origin:0 0"><g class="bsway"><g class="idle">' +
      legs +
      upper(belt + '<g class="torso">' + topShape + "</g>" + scarf + headWrap + arm("L") + arm("R")) +
      "</g></g></g></g>";
  };

  /* ---------- named adult cast ---------- */
  A.CHARS = {
    maya:   { id: "maya",   build: "f", skin: C.skin3, hair: "#241410", hairStyle: "curly", top: "#F4A52F", inner: "#FFF4DC", bottom: "#2D4A86", topStyle: "cardigan", shoe: "#B23A48", iris: "#4A2A18", scarf: "#E2503F" },
    theo:   { id: "theo",   build: "m", skin: C.skin1, hair: "#3A2418", hairStyle: "quiff", top: "#1B8A86", inner: "#EAF6F5", bottom: "#2E3548", topStyle: "henley", beard: true, rolled: true, glasses: "#1A2A44", shoe: "#4A3020", iris: "#2F5D7A" },
    alex:   { id: "alex",   build: "f", skin: C.skin5, hair: "#6B4A2E", hairStyle: "bun", top: "#6FAE7C", inner: C.cream, bottom: "#3E4B63", topStyle: "cardigan", shoe: "#4B3B33", glasses: "#6B4C9A" },
    jordan: { id: "jordan", build: "m", skin: C.skin2, hair: "#1E1E26", hairStyle: "crop", top: C.coral, inner: "#FFF1DE", bottom: "#2E3B55", topStyle: "jacket", shoe: "#2B2B35" },
  };
  var KID_SET = [
    { build: "f", skin: C.skin1, hair: "#4A3224", hairStyle: "short", top: "#F26B5B", bottom: "#3E5B8C" },
    { build: "f", skin: C.skin3, hair: "#241713", hairStyle: "curly", top: "#F4B33A", bottom: "#3F7A66" },
    { build: "f", skin: C.skin5, hair: "#7A5232", hairStyle: "long", top: "#1FA8A2", bottom: "#6A4FA0" },
    { build: "f", skin: C.skin2, hair: "#17171C", hairStyle: "buzz", top: "#7E57C2", bottom: "#3B4A6E" },
    { build: "f", skin: C.skin4, hair: "#120D0B", hairStyle: "bun", top: "#7CC48A", bottom: "#44506A" },
    { build: "f", skin: C.skin1, hair: "#B0703A", hairStyle: "wavy", top: "#3C8CE0", bottom: "#555E78" },
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
