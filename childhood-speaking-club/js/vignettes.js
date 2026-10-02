/* Fluent English – illustrated pieces: world props, flashback scenes, vocabulary vignettes and icons. */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var A = FE.Art, C = A.C;
  var INK = C.ink;

  /* ---------- world props (placed on the floor; origin = bottom centre) ---------- */
  FE.World = {
    ball: function () { return '<g transform="translate(0,-26)">' + A.props.ball() + "</g>"; },
    backpack: function () { return '<g><ellipse cx="0" cy="4" rx="46" ry="10" fill="rgba(60,30,10,.2)"/><rect x="-34" y="-84" width="68" height="84" rx="20" fill="#E98B3C"/><rect x="-24" y="-48" width="48" height="30" rx="8" fill="#F2B544"/><path d="M-22,-84 q22,-26 44,0" fill="none" stroke="#B5601F" stroke-width="7"/></g>'; },
    bridge: function () {
      return '<g><ellipse cx="0" cy="6" rx="190" ry="14" fill="rgba(60,30,10,.2)"/><path d="M-170,0 V-50 Q0,-170 170,-50 V0 H130 V-40 Q0,-130 -130,-40 V0Z" fill="#C8905A" stroke="' + C.woodDark + '" stroke-width="6"/>' +
        '<path d="M-130,-44 Q0,-134 130,-44" fill="none" stroke="' + C.woodDark + '" stroke-width="5"/>' +
        [-90, -45, 0, 45, 90].map(function (x) { return '<path d="M' + x + ',-' + (110 - Math.abs(x) * 0.5) + ' V-48" stroke="' + C.woodDark + '" stroke-width="5"/>'; }).join("") + '<rect x="-4" y="-120" width="8" height="12" fill="#fff" opacity="0"/></g>';
    },
    piece: function () { return '<g><ellipse cx="0" cy="4" rx="34" ry="8" fill="rgba(60,30,10,.2)"/><path d="M-30,0 L-14,-34 L26,-26 L30,0Z" fill="#C8905A" stroke="' + C.woodDark + '" stroke-width="5"/></g>'; },
    cones: function () {
      return [-50, 0, 50].map(function (x, i) { return '<g transform="translate(' + x + ',' + (i === 1 ? -6 : 0) + ')"><ellipse cx="0" cy="4" rx="28" ry="7" fill="rgba(60,30,10,.2)"/><path d="M-24,0 L-8,-76 H8 L24,0Z" fill="#F26B5B"/><path d="M-16,-34 H16 M-12,-52 H12" stroke="#fff" stroke-width="7"/></g>'; }).join("");
    },
    paperstack: function () { return '<g><ellipse cx="0" cy="2" rx="80" ry="10" fill="rgba(60,30,10,.18)"/><rect x="-62" y="-30" width="124" height="26" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="-52" y="-52" width="104" height="24" rx="4" fill="#FFF3B8" stroke="' + INK + '" stroke-width="3"/><rect x="-40" y="-70" width="90" height="20" rx="4" fill="#BFE5F7" stroke="' + INK + '" stroke-width="3"/><circle cx="46" cy="-86" r="12" fill="' + C.coral + '"/></g>'; },
    clock: function () { return '<g class="bob"><circle cx="0" cy="-90" r="70" fill="#fff" stroke="' + INK + '" stroke-width="8"/><circle cx="0" cy="-90" r="56" fill="#FFFDF7"/><path d="M0,-90 V-132 M0,-90 L28,-76" stroke="' + INK + '" stroke-width="7" stroke-linecap="round"/><path d="M0,-90 m0,-56 A56,56 0 0 1 56,-90" fill="none" stroke="' + C.coral + '" stroke-width="10" stroke-linecap="round" opacity=".8"/></g>'; },
  };

  /* ---------- flashback scenes (880 x 570), drawn in a warmer, softer "past" palette ---------- */
  function flashWrap(inner, id) {
    return '<svg viewBox="0 0 880 570" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><radialGradient id="vg' + id + '" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#5A2E0F" stop-opacity="0"/><stop offset="1" stop-color="#5A2E0F" stop-opacity=".42"/></radialGradient></defs>' +
      inner + '<rect width="880" height="570" fill="#F6C98A" opacity=".16"/><rect width="880" height="570" fill="url(#vg' + id + ')"/></svg>';
  }
  function kidAt(n, x, y, s, pose, mood, cls, extra) {
    var e = { pose: pose, mood: mood };
    for (var k in (extra || {})) e[k] = extra[k];
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')" class="' + (cls || "") + '">' + A.kid(n, e) + "</g>";
  }
  FE.Flash = {
    drawing: function () {
      var rain = "";
      for (var i = 0; i < 16; i++) rain += '<path class="rain" style="animation-delay:' + (i * 0.17).toFixed(2) + 's" d="M' + (620 + i * 14) + ',90 l-6,22" stroke="#9FC4DE" stroke-width="3" stroke-linecap="round"/>';
      return flashWrap(
        '<rect width="880" height="570" fill="#F3DDBA"/><rect x="560" y="50" width="260" height="260" rx="14" fill="#C9DEEB" stroke="#fff" stroke-width="12"/><path d="M690,50 V310 M560,180 H820" stroke="#fff" stroke-width="8"/>' + rain +
        '<rect y="410" width="880" height="160" fill="#D9A872"/>' +
        '<g transform="translate(120,300)"><rect x="0" y="0" width="560" height="26" rx="8" fill="#E0A870"/><rect x="40" y="26" width="16" height="140" fill="#8A5A33"/><rect x="500" y="26" width="16" height="140" fill="#8A5A33"/>' +
        '<g transform="rotate(-4 200 -10)"><rect x="110" y="-46" width="250" height="52" rx="4" fill="#fff" stroke="#E2CFA8" stroke-width="3"/>' +
        '<path d="M170,-4 L200,-36 L230,-4Z M200,-36 V-44" fill="#F26B5B" stroke="' + INK + '" stroke-width="2"/><path d="M280,-30 q10,-14 20,0 t20,0" fill="none" stroke="#1F9E9A" stroke-width="3"/></g>' +
        '<g transform="translate(400,-6)"><rect width="110" height="26" rx="4" fill="#F2B544"/><path d="M10,0 V-18 M30,0 V-14 M50,0 V-20 M70,0 V-16 M90,0 V-18" stroke="#F26B5B" stroke-width="7" stroke-linecap="round"/></g></g>' +
        kidAt(3, 300, 470, 0.5, "write", "smile", "bob2"), 1);
    },
    ball: function () {
      return flashWrap(
        '<rect width="880" height="570" fill="#CDE9F6"/><circle cx="740" cy="90" r="46" fill="#FFE18A"/><path d="M-20,330 Q200,270 420,320 T900,310 V420 H-20Z" fill="#B9DFA9"/>' +
        '<rect y="400" width="880" height="170" fill="#8E96A8"/><g stroke="#fff" stroke-width="5" opacity=".8"><path d="M0,520 H880"/><circle cx="440" cy="480" r="40" fill="none"/></g>' +
        '<g class="runA">' + kidAt(0, 220, 470, 0.5, "kidrun", "grin", "", { top: "#F26B5B" }) + "</g>" +
        '<g class="runB">' + kidAt(2, 560, 480, 0.5, "kidrun", "laugh", "", { top: "#3C78C9" }) + "</g>" +
        kidAt(1, 400, 500, 0.5, "cheer", "grin", "hop") + '<g class="bounce" transform="translate(400,380)"><circle r="20" fill="' + C.coral + '"/><path d="M-18,-6 Q0,-18 18,-6" stroke="#fff" stroke-width="3" fill="none"/></g>', 2);
    },
    note: function () {
      return flashWrap(
        '<rect width="880" height="570" fill="#F9D9A6"/><circle cx="700" cy="120" r="150" fill="#FFE9B0" opacity=".7"/><path d="M-20,360 Q220,300 440,350 T900,340 V440 H-20Z" fill="#A9D19A"/><rect y="420" width="880" height="150" fill="#9CC28A"/>' +
        '<g transform="translate(110,300)"><rect x="-40" y="-60" width="26" height="150" fill="#8A5A33"/><circle cx="-26" cy="-140" r="90" fill="#6FB172"/><circle cx="-90" cy="-100" r="56" fill="#5FA666"/></g>' +
        '<g transform="translate(470,430)"><rect x="-120" y="-40" width="240" height="16" rx="6" fill="#B9814F"/><rect x="-120" y="-90" width="240" height="14" rx="6" fill="#B9814F"/><rect x="-100" y="-24" width="12" height="44" fill="#6B4228"/><rect x="88" y="-24" width="12" height="44" fill="#6B4228"/></g>' +
        kidAt(4, 380, 470, 0.5, "hold", "smile", "") + '<g transform="translate(330,330)"><g class="bob2"><g transform="rotate(-8)"><rect x="-20" y="-24" width="44" height="40" fill="#FFF3B8" stroke="#E2BE4C" stroke-width="2"/><path d="M-12,-12 q6,-6 12,0 t12,0 M-12,2 q6,-6 12,0" fill="none" stroke="#7A6B3C" stroke-width="2"/></g></g></g>' +
        '<g class="walkIn">' + kidAt(1, 640, 480, 0.5, "wave", "grin", "") + "</g>", 3);
    },
    toy: function () {
      return flashWrap(
        '<rect width="880" height="570" fill="#F6E0BC"/><rect y="360" width="880" height="210" fill="#E1A877"/><ellipse cx="440" cy="470" rx="400" ry="66" fill="#D8624F" opacity=".92"/><ellipse cx="440" cy="470" rx="340" ry="48" fill="none" stroke="#F8D9A0" stroke-width="5" stroke-dasharray="20 14"/>' +
        '<rect x="620" y="270" width="110" height="110" fill="#E8B77A" stroke="#C8905A" stroke-width="4"/><rect x="700" y="310" width="90" height="70" fill="#F2C48C" stroke="#C8905A" stroke-width="4"/><rect x="560" y="320" width="70" height="60" fill="#D9A872" stroke="#C8905A" stroke-width="4"/>' +
        '<g class="robotWalk"><g transform="translate(200,470) scale(1.1)">' + A.props.toyRobot() + "</g></g>" +
        kidAt(2, 130, 500, 0.5, "kidrun", "laugh", ""), 4);
    },
  };

  /* ---------- vocabulary vignettes (880 x 620) ---------- */
  function vwrap(inner) { return '<svg viewBox="0 0 880 620" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + inner + "</svg>"; }
  function adultAt(name, x, y, s, extra) { return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')" data-adult="' + name + '">' + A.adult(name, extra) + "</g>"; }
  var sky = '<defs><linearGradient id="vs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE9F7"/><stop offset="1" stop-color="#FFF2D6"/></linearGradient></defs>';

  FE.Vig = {
    childhood: function () {
      var figs = [[150, 0.46, "kid", 0], [340, 0.62, "kid", 3], [560, 0.78, "adult", "alex"], [760, 0.9, "adult", "theo"]];
      var s = sky + '<rect width="880" height="620" fill="url(#vs)"/><rect y="470" width="880" height="150" fill="#9AD08B"/>' +
        '<path d="M60,520 H820" stroke="#fff" stroke-width="8" stroke-dasharray="26 16" opacity=".7"/>' +
        '<g><rect x="40" y="70" width="320" height="410" rx="26" fill="#F26B5B" opacity=".14"/><path d="M60,92 H340" stroke="#F26B5B" stroke-width="8" stroke-linecap="round"/><path d="M60,84 v16 M340,84 v16" stroke="#F26B5B" stroke-width="8" stroke-linecap="round"/></g>' +
        '<g transform="translate(110,110)" fill="#F2B544"><circle class="twinkle" r="8"/><circle class="twinkle" cx="190" cy="30" r="6" style="animation-delay:.6s"/><circle class="twinkle" cx="110" cy="-6" r="5" style="animation-delay:1.1s"/></g>';
      figs.forEach(function (f, i) {
        s += f[2] === "kid" ? '<g transform="translate(' + f[0] + ',520) scale(' + f[1] + ')">' + A.kid(f[3] + (i ? 2 : 0), { glasses: false }) + "</g>" : adultAt(f[3], f[0], 520, f[1] * 0.78);
      });
      s += '<path d="M240,596 q160,30 320,0" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" opacity=".5"/><path d="M570,596 l-14,-8 m14,8 l-14,8" stroke="' + INK + '" stroke-width="5" opacity=".5" fill="none"/>';
      return vwrap(s);
    },
    imagination: function () {
      var stars = "";
      for (var i = 0; i < 18; i++) stars += '<circle class="twinkle" style="animation-delay:' + (i * 0.23).toFixed(2) + 's" cx="' + (420 + ((i * 97) % 400)) + '" cy="' + (50 + ((i * 53) % 220)) + '" r="' + (2 + (i % 3)) + '" fill="#fff"/>';
      return vwrap(sky + '<rect width="880" height="620" fill="url(#vs)"/><rect y="470" width="880" height="150" fill="#9AD08B"/>' +
        '<g><ellipse cx="640" cy="170" rx="250" ry="150" fill="#2B3A78"/><circle cx="470" cy="300" r="26" fill="#2B3A78"/><circle cx="420" cy="345" r="14" fill="#2B3A78"/>' + stars +
        '<g class="bob" transform="translate(640,170) rotate(-20)"><path d="M-70,18 L-40,-24 H40 L70,18Z" fill="#fff" stroke="' + INK + '" stroke-width="4"/><path d="M-40,-24 Q0,-90 40,-24Z" fill="' + C.coral + '"/><circle cx="0" cy="-2" r="14" fill="#9FD3F0" stroke="' + INK + '" stroke-width="4"/><path d="M-40,18 L-62,48 L-18,18Z M40,18 L62,48 L18,18Z" fill="' + C.mustard + '"/><path d="M-12,22 q12,40 24,0" fill="#F2B544"/></g></g>' +
        '<g transform="translate(250,520)"><rect x="-110" y="-120" width="220" height="120" fill="#C8905A" stroke="' + C.woodDark + '" stroke-width="5"/><path d="M-110,-120 L-70,-150 H70 L110,-120" fill="#D9A872" stroke="' + C.woodDark + '" stroke-width="5"/><circle cx="0" cy="-70" r="26" fill="#9FD3F0" stroke="' + INK + '" stroke-width="4"/></g>' +
        '<g transform="translate(470,540) scale(.7)">' + A.kid(1) + "</g>");
    },
    independent: function () {
      return vwrap('<rect width="880" height="620" fill="#FBE9D0"/><rect y="440" width="880" height="180" fill="#D9A872"/><rect x="40" y="80" width="260" height="190" rx="10" fill="#fff" stroke="' + C.woodDark + '" stroke-width="8"/><circle cx="170" cy="170" r="50" fill="#9FD3F0"/>' +
        '<rect x="320" y="330" width="520" height="30" rx="8" fill="#B9814F"/><rect x="340" y="360" width="500" height="170" fill="#E0A870"/>' +
        '<g transform="translate(540,330)"><ellipse cx="0" cy="0" rx="90" ry="14" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="-60" y="-26" width="120" height="14" rx="4" fill="#E8B77A"/><rect x="-56" y="-34" width="112" height="9" rx="4" fill="#8DBF8B"/><rect x="-60" y="-46" width="120" height="14" rx="4" fill="#E8B77A"/></g>' +
        '<g transform="translate(440,540) scale(.74)">' + A.kid(2, { pose: "hold" }) + "</g>" +
        '<g transform="translate(130,560) scale(.55)">' + A.adult("theo") + '</g><path d="M96,360 q40,-60 90,-30" fill="none" stroke="' + C.teal + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 14"/>' +
        '<g class="bob" transform="translate(760,250)"><circle r="30" fill="' + C.mustard + '"/><path d="M-12,2 l8,10 l16,-20" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>');
    },
    growup: function () {
      var marks = "";
      for (var i = 0; i < 6; i++) marks += '<path d="M60,' + (520 - i * 62) + ' h60" stroke="' + [C.coral, C.mustard, C.teal, C.plum, C.sage, C.coral][i] + '" stroke-width="7" stroke-linecap="round"/><circle cx="130" cy="' + (520 - i * 62) + '" r="6" fill="' + [C.coral, C.mustard, C.teal, C.plum, C.sage, C.coral][i] + '"/>';
      return vwrap(sky + '<rect width="880" height="620" fill="url(#vs)"/><rect y="500" width="880" height="120" fill="#9AD08B"/>' +
        '<g transform="translate(540,500)">' + [0, 1, 2, 3].map(function (i) { return '<g transform="translate(' + (i * 90 - 40) + ',' + (-60 - (i % 2) * 14) + ')"><rect width="76" height="' + (80 + (i % 3) * 22) + '" fill="' + ["#F2C48C", "#9FD3F0", "#F4A9A0", "#C9E4B2"][i] + '"/><path d="M-8,0 L38,-34 L84,0Z" fill="' + [C.coral, C.plum, C.woodDark, C.teal][i] + '"/></g>'; }).join("") + "</g>" +
        '<rect x="30" y="60" width="150" height="500" rx="10" fill="#E8C08A" stroke="' + C.woodDark + '" stroke-width="8"/>' + marks +
        '<g transform="translate(300,560) scale(.4)">' + A.kid(0) + '</g><g transform="translate(400,560) scale(.58)">' + A.kid(3, { top: "#6B4C9A" }) + '</g><g transform="translate(540,560) scale(.78)">' + A.adult("alex") + "</g>" +
        '<path d="M250,170 H680" stroke="' + INK + '" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round" opacity=".6"/>');
    },
    lookback: function () {
      return vwrap('<rect width="880" height="620" fill="#F8E9CE"/><rect y="470" width="880" height="150" fill="#D9A872"/>' +
        '<g transform="translate(180,470)"><rect x="-120" y="-40" width="240" height="18" rx="6" fill="#B9814F"/><rect x="-120" y="-100" width="240" height="14" rx="6" fill="#B9814F"/><rect x="-100" y="-22" width="12" height="50" fill="#6B4228"/><rect x="88" y="-22" width="12" height="50" fill="#6B4228"/></g>' +
        '<g transform="translate(180,520) scale(.78)">' + A.adult("theo", { pose: "think" }) + "</g>" +
        '<g><circle cx="330" cy="250" r="14" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="380" cy="210" r="22" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
        '<g class="bob"><rect x="410" y="40" width="440" height="330" rx="40" fill="#FFF9EC" stroke="' + INK + '" stroke-width="5"/>' +
        '<rect x="430" y="60" width="400" height="290" rx="30" fill="#F3DDBA"/><rect x="430" y="280" width="400" height="70" fill="#D9A872"/>' +
        '<g transform="translate(520,310) scale(.38)">' + A.adult("maya", {}) + '</g><g transform="translate(700,330) scale(.34)">' + A.kid(2) + '</g>' +
        '<g transform="translate(620,170)"><rect x="-70" y="-60" width="140" height="100" rx="6" fill="#fff" stroke="' + C.woodDark + '" stroke-width="6"/><path d="M-50,22 Q-10,-40 20,0 T56,-30" fill="none" stroke="' + C.coral + '" stroke-width="10" stroke-linecap="round"/><circle cx="30" cy="-30" r="14" fill="' + C.mustard + '"/></g></g></g>');
    },
  };

  /* ---------- icons for claims and Would-you-rather cards (240 x 240) ---------- */
  function iw(inner) { return '<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + "</svg>"; }
  FE.Icons = {
    swing: function () { return iw('<path d="M50,210 L120,30 L190,210" fill="none" stroke="' + C.woodDark + '" stroke-width="12" stroke-linecap="round"/><path d="M120,30 V150" stroke="' + INK + '" stroke-width="4" class="sway"/><g class="sway"><path d="M95,120 L100,170 M145,120 L140,170" stroke="' + INK + '" stroke-width="5"/><rect x="88" y="168" width="64" height="14" rx="6" fill="' + C.coral + '"/></g><circle cx="42" cy="60" r="16" fill="' + C.mustard + '"/>'); },
    broom: function () { return iw('<g transform="rotate(25 120 120)"><rect x="112" y="20" width="14" height="140" rx="6" fill="' + C.woodDark + '"/><path d="M80,160 H158 L170,220 H68Z" fill="' + C.mustard + '"/><path d="M90,170 L84,218 M110,170 L108,218 M130,170 L132,218 M148,170 L156,218" stroke="#B5601F" stroke-width="4"/></g><circle cx="60" cy="60" r="18" fill="' + C.sky + '"/>'); },
    friends: function () { return iw('<g transform="translate(66,200) scale(.32)">' + A.kid(0) + '</g><g transform="translate(150,200) scale(.32)">' + A.kid(2) + '</g><path d="M104,100 q16,-32 32,0 q-16,14 -32,0Z" fill="' + C.coral + '" class="bob"/>'); },
    tablet: function () { return iw('<rect x="48" y="50" width="140" height="130" rx="14" fill="' + INK + '"/><rect x="58" y="60" width="120" height="110" rx="6" fill="#BFE5F7"/><path d="M72,150 Q100,80 128,130 T168,100" fill="none" stroke="' + C.coral + '" stroke-width="8" stroke-linecap="round"/><circle cx="144" cy="84" r="12" fill="' + C.mustard + '"/><g transform="rotate(35 190 190)"><rect x="186" y="110" width="12" height="90" rx="4" fill="' + C.teal + '"/></g>'); },
    ball: function () { return iw('<circle cx="120" cy="124" r="80" fill="' + C.coral + '"/><path d="M44,100 Q120,50 196,100 M44,150 Q120,200 196,150" stroke="#fff" stroke-width="9" fill="none"/><path d="M120,44 V204" stroke="#fff" stroke-width="9"/><circle cx="92" cy="92" r="16" fill="#fff" opacity=".3"/>'); },
    tv: function () { return iw('<path d="M96,40 L120,66 L146,40" stroke="' + INK + '" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="30" y="64" width="180" height="140" rx="22" fill="' + C.coral + '"/><rect x="46" y="80" width="116" height="108" rx="12" fill="#BFE5F7"/><circle cx="188" cy="104" r="9" fill="#fff"/><circle cx="188" cy="136" r="9" fill="#fff"/><path d="M62,160 q26,-50 52,0" fill="none" stroke="' + C.mustard + '" stroke-width="8" stroke-linecap="round"/>'); },
    slide: function () { return iw('<path d="M40,200 V70 H80 M80,70 Q120,60 150,130 Q170,180 210,190" fill="none" stroke="' + C.plum + '" stroke-width="16" stroke-linecap="round"/><path d="M40,70 V54 M62,70 V54 M40,70 H62" stroke="' + INK + '" stroke-width="6"/><path d="M40,200 H200" stroke="' + C.woodDark + '" stroke-width="10" stroke-linecap="round"/><circle cx="200" cy="48" r="18" fill="' + C.mustard + '"/>'); },
    board: function () { return iw('<rect x="34" y="50" width="172" height="150" rx="12" fill="' + C.teal + '"/><g fill="#fff" opacity=".9"><rect x="50" y="66" width="34" height="34"/><rect x="118" y="66" width="34" height="34"/><rect x="84" y="100" width="34" height="34"/><rect x="152" y="100" width="34" height="34"/><rect x="50" y="134" width="34" height="34"/><rect x="118" y="134" width="34" height="34"/></g><g transform="translate(150,60) rotate(14)"><rect width="46" height="46" rx="9" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="14" cy="14" r="4.5" fill="' + INK + '"/><circle cx="32" cy="32" r="4.5" fill="' + INK + '"/><circle cx="23" cy="23" r="4.5" fill="' + INK + '"/></g>'); },
    house: function () { return iw('<rect x="46" y="100" width="148" height="110" fill="#C78B5A"/><path d="M30,104 L120,36 L210,104Z" fill="#8A5A33"/><rect x="100" y="140" width="40" height="70" fill="#6B4228"/><rect x="62" y="120" width="30" height="30" fill="#F3DDBA"/><rect x="150" y="120" width="30" height="30" fill="#F3DDBA"/><circle cx="196" cy="48" r="20" fill="#E8B77A" opacity=".8"/>'); },
    city: function () { return iw('<rect x="30" y="90" width="60" height="120" fill="#6C77B8"/><rect x="96" y="40" width="54" height="170" fill="#3C78C9"/><rect x="156" y="110" width="56" height="100" fill="#1F9E9A"/><g fill="#FFE9A8">' + [0, 1, 2, 3].map(function (i) { return '<rect x="40" y="' + (104 + i * 26) + '" width="12" height="12"/><rect x="62" y="' + (104 + i * 26) + '" width="12" height="12"/><rect x="108" y="' + (56 + i * 34) + '" width="12" height="12"/><rect x="128" y="' + (56 + i * 34) + '" width="12" height="12"/>'; }).join("") + "</g>"); },
    box: function () { return iw('<rect x="38" y="104" width="164" height="100" rx="10" fill="#C8905A"/><rect x="30" y="76" width="180" height="40" rx="8" fill="#D9A872"/><rect x="108" y="76" width="24" height="128" fill="' + C.teal + '"/><circle cx="120" cy="70" r="14" fill="' + C.coral + '"/>'); },
    book: function () { return iw('<path d="M30,60 Q75,40 120,64 V196 Q75,172 30,192Z" fill="#F7EBD2" stroke="' + INK + '" stroke-width="5"/><path d="M210,60 Q165,40 120,64 V196 Q165,172 210,192Z" fill="#FFF9EC" stroke="' + INK + '" stroke-width="5"/><path d="M48,92 Q76,82 100,96 M48,116 Q76,106 100,120 M48,140 Q76,130 100,144 M140,96 Q164,82 192,92 M140,120 Q164,106 192,116" stroke="#9FD3F0" stroke-width="5" fill="none" stroke-linecap="round"/>'); },
  };

  /* ---------- memory-box objects (drawn at local origin, about 150 wide) ---------- */
  FE.Objects = {
    drawing: function () { return '<g transform="rotate(-6)"><rect x="-76" y="-58" width="152" height="116" rx="4" fill="#fff" stroke="#E2CFA8" stroke-width="4"/><path d="M-30,30 L0,-30 L30,30Z" fill="' + C.coral + '" stroke="' + INK + '" stroke-width="3"/><circle cx="0" cy="0" r="9" fill="#9FD3F0" stroke="' + INK + '" stroke-width="3"/><path d="M-60,-36 l6,-8 l6,8 m34,-4 l6,-8 l6,8" stroke="' + C.mustard + '" stroke-width="4" fill="none"/><path d="M-62,44 q14,-12 28,0 t28,0 t28,0" fill="none" stroke="' + C.teal + '" stroke-width="4"/></g>'; },
    ball: function () { return A.props.ball(C.coral).replace('r="26"', 'r="46"'); },
    note: function () { return '<g transform="rotate(8)"><rect x="-56" y="-62" width="112" height="124" fill="#FFF3B8" stroke="#E2BE4C" stroke-width="3"/><path d="M-36,-34 q10,-12 20,0 t20,0 t20,0 M-36,-8 q10,-12 20,0 t20,0 t20,0 M-36,18 q10,-12 20,0 t20,0" fill="none" stroke="#7A6B3C" stroke-width="3.4" stroke-linecap="round"/><path d="M56,62 L22,62 L56,28Z" fill="#E2BE4C" opacity=".6"/></g>'; },
    toy: function () { return '<g transform="scale(1.7) translate(0,26)">' + A.props.toyRobot() + "</g>"; },
  };

  FE.Objects.mystery = function () {
    return '<g><circle r="96" fill="#FFE9A8" opacity=".35"/><path d="M-62,40 Q-70,-40 -10,-66 Q60,-80 68,-8 Q74,52 30,64 Q-30,76 -62,40Z" fill="#14284B"/><text x="0" y="22" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="92" fill="#F2B544">?</text>' +
      '<g fill="#fff"><circle class="twinkle" cx="-80" cy="-50" r="5"/><circle class="twinkle" cx="84" cy="-30" r="4" style="animation-delay:.5s"/><circle class="twinkle" cx="60" cy="70" r="5" style="animation-delay:1s"/></g></g>';
  };
  FE.Objects.bell = function () {
    return '<g><circle r="100" fill="#FFE9A8" opacity=".4"/><circle cx="0" cy="12" r="62" fill="#9AA7B8" stroke="#14284B" stroke-width="5"/><circle cx="0" cy="12" r="44" fill="#C9D3E0"/><path d="M-30,-4 Q0,-34 30,-4" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/><rect x="-10" y="-62" width="20" height="16" rx="4" fill="#14284B"/><circle cx="0" cy="12" r="8" fill="#F26B5B"/>' +
      '<g class="burst" fill="#F2B544"><path d="M-96,-40 l8,-14 l8,14 l-14,-8z" class="twinkle"/><circle class="twinkle" cx="96" cy="-30" r="6" style="animation-delay:.3s"/><circle class="twinkle" cx="80" cy="70" r="5" style="animation-delay:.7s"/><circle class="twinkle" cx="-88" cy="60" r="6" style="animation-delay:.2s"/></g></g>';
  };

  /* hand-held props for characters */
  A.props.bridge = FE.World.bridge;
  A.props.bag = function () { return '<g transform="translate(0,-4)"><rect x="-22" y="-40" width="44" height="44" rx="12" fill="#E98B3C"/></g>'; };
})(typeof window !== "undefined" ? window : globalThis);
