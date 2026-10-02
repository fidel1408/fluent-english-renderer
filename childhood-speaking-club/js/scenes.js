/* Fluent English – settings (backgrounds). Each builder returns SVG markup made of parallax layers:
 *   <g class="layer" data-d="0.3"> … </g>      d = how strongly the layer follows camera moves.
 * No readable text is drawn inside decorative backgrounds. */
(function (root) {
  "use strict";
  var FE = (root.FE = root.FE || {});
  var A = FE.Art;
  var C = A.C;
  var S = (FE.Scenes = {});

  var SKY = {
    day:    ["#BFE5F7", "#EAF6FB", "#FFF3D6"],
    golden: ["#F7C99A", "#FBE3B8", "#FFF1D2"],
    dusk:   ["#6C77B8", "#E9A98F", "#FBD9A8"],
    night:  ["#1D2A5B", "#37508F", "#7C87BF"],
  };

  function layer(d, inner, cls) { return '<g class="layer' + (cls ? " " + cls : "") + '" data-d="' + d + '">' + inner + "</g>"; }

  function defsFor(tod) {
    var s = SKY[tod] || SKY.day;
    return '<defs>' +
      '<linearGradient id="sky-' + tod + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s[0] + '"/><stop offset=".6" stop-color="' + s[1] + '"/><stop offset="1" stop-color="' + s[2] + '"/></linearGradient>' +
      '<radialGradient id="glow"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".95"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="floorg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A872"/><stop offset="1" stop-color="#B9814F"/></linearGradient>' +
      '<linearGradient id="grassg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD08B"/><stop offset="1" stop-color="#6FB172"/></linearGradient>' +
      '<linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4C8" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4C8" stop-opacity="0"/></linearGradient>' +
      "</defs>";
  }

  function cloud(x, y, s, cls) {
    return '<g class="' + (cls || "") + '" transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')" fill="#fff" opacity=".92">' +
      '<ellipse cx="0" cy="0" rx="90" ry="30"/><ellipse cx="-50" cy="-14" rx="46" ry="30"/><ellipse cx="22" cy="-26" rx="56" ry="38"/><ellipse cx="68" cy="-4" rx="42" ry="26"/></g>';
  }
  function tree(x, y, s, col) {
    col = col || "#6FB172";
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-16" y="-170" width="32" height="170" rx="8" fill="#8A5A33"/>' +
      '<g class="sway"><circle cx="0" cy="-230" r="104" fill="' + col + '"/><circle cx="-76" cy="-190" r="66" fill="' + A.shade(col, -14) + '"/><circle cx="80" cy="-196" r="70" fill="' + A.shade(col, 8) + '"/><circle cx="-18" cy="-284" r="56" fill="' + A.shade(col, 14) + '"/></g></g>';
  }
  function windowBox(x, y, w, h, tod, frame) {
    frame = frame || "#fff";
    return '<g transform="translate(' + x + ',' + y + ')"><rect width="' + w + '" height="' + h + '" rx="10" fill="url(#sky-' + tod + ')" stroke="' + frame + '" stroke-width="12"/>' +
      '<path d="M' + w / 2 + ',0 V' + h + ' M0,' + h / 2 + ' H' + w + '" stroke="' + frame + '" stroke-width="9"/></g>';
  }
  function frame(x, y, w, h, col) {
    col = col || C.coral;
    return '<g transform="translate(' + x + ',' + y + ')"><rect width="' + w + '" height="' + h + '" rx="6" fill="#fff" stroke="' + C.woodDark + '" stroke-width="9"/>' +
      '<circle cx="' + w * 0.32 + '" cy="' + h * 0.4 + '" r="' + Math.min(w, h) * 0.2 + '" fill="' + col + '"/><path d="M12,' + (h - 14) + ' Q' + w * 0.4 + ',' + h * 0.45 + ' ' + (w - 12) + ',' + (h - 14) + 'Z" fill="' + C.teal + '" opacity=".85"/></g>';
  }
  function plant(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><path d="M-34,0 L-26,-70 H26 L34,0Z" fill="#C8654F"/>' +
      '<g class="sway"><path d="M0,-70 Q-60,-130 -80,-210 Q-20,-170 0,-70 Q10,-170 70,-230 Q40,-120 0,-70 Q-10,-190 -4,-250 Q30,-170 0,-70Z" fill="#4E9B63"/></g></g>';
  }
  function lamp(x, y, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')"><circle cx="0" cy="-250" r="170" fill="url(#glow)"/><rect x="-5" y="-230" width="10" height="230" fill="#6B4C3A"/><ellipse cx="0" cy="0" rx="46" ry="10" fill="#6B4C3A"/><path d="M-50,-228 L-30,-290 H30 L50,-228Z" fill="#F7D98C" stroke="#E2B65A" stroke-width="3"/></g>';
  }
  function bookshelf(x, y, w, h) {
    var s = '<g transform="translate(' + x + ',' + y + ')"><rect width="' + w + '" height="' + h + '" rx="8" fill="' + C.woodDark + '"/>';
    var rows = 4, rh = (h - 20) / rows, cols = ["#F26B5B", "#F2B544", "#1F9E9A", "#6B4C9A", "#8DBF8B", "#3C78C9", "#E98B3C"];
    for (var r = 0; r < rows; r++) {
      s += '<rect x="10" y="' + (14 + r * rh) + '" width="' + (w - 20) + '" height="' + (rh - 8) + '" fill="#6B4228"/>';
      var bx = 16, k = 0;
      while (bx < w - 40) {
        var bw = 16 + ((k * 7 + r * 5) % 14), bh = rh - 18 - ((k * 11 + r * 3) % 22);
        s += '<rect x="' + bx + '" y="' + (14 + r * rh + (rh - 8) - bh) + '" width="' + bw + '" height="' + bh + '" rx="2" fill="' + cols[(k + r * 3) % cols.length] + '"/>';
        bx += bw + 3; k++;
      }
    }
    return s + "</g>";
  }
  function bunting(x1, y1, x2, y2, n, cols) {
    var s = '<path d="M' + x1 + ',' + y1 + ' Q' + (x1 + x2) / 2 + ',' + ((y1 + y2) / 2 + 80) + ' ' + x2 + ',' + y2 + '" fill="none" stroke="#6B4C3A" stroke-width="4"/>';
    for (var i = 1; i <= n; i++) {
      var t = i / (n + 1);
      var x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
      var y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + 80) + t * t * y2;
      s += '<path d="M' + (x - 22) + ',' + (y - 2) + ' L' + (x + 22) + ',' + (y - 2) + ' L' + x + ',' + (y + 46) + 'Z" fill="' + cols[i % cols.length] + '"/>';
    }
    return s;
  }
  function floorBoards(y, h, col1, col2) {
    var s = '<rect x="-200" y="' + y + '" width="2320" height="' + h + '" fill="url(#floorg)"/>';
    for (var i = 0; i < 9; i++) s += '<path d="M' + (-200 + i * 280) + ',' + y + ' L' + (-400 + i * 330) + ',' + (y + h) + '" stroke="rgba(90,52,28,.18)" stroke-width="3"/>';
    return s;
  }
  function dust(n) {
    var s = "";
    for (var i = 0; i < n; i++) s += '<circle class="twinkle" style="animation-delay:' + (i * 0.37).toFixed(2) + 's" cx="' + (180 + ((i * 337) % 1500)) + '" cy="' + (140 + ((i * 211) % 560)) + '" r="' + (2 + (i % 3)) + '" fill="#FFF6D2"/>';
    return s;
  }

  /* ---------------- LIVING ROOM / MEMORY TABLE ---------------- */
  S.living = function (o) {
    o = o || {};
    var tod = o.tod || "golden";
    var wall = tod === "night" || tod === "dusk" ? "#E9C9A6" : "#F6E2C3";
    var s = defsFor(tod);
    s += layer(0.15, '<rect x="-300" y="-200" width="2520" height="1200" fill="' + wall + '"/>' +
      '<rect x="-300" y="640" width="2520" height="30" fill="#E4C08F"/>');
    s += layer(0.35, windowBox(150, 150, 360, 420, tod) +
      '<path d="M150,150 L-40,70 L-40,700 L150,570Z" fill="#E8B77A" opacity=".5"/>' +
      '<path d="M510,150 L700,70 L700,700 L510,570Z" fill="#E8B77A" opacity=".5"/>' +
      '<polygon points="170,570 520,570 820,980 -120,980" fill="url(#beam)"/>');
    s += layer(0.55, bookshelf(1380, 190, 420, 470) + frame(930, 190, 220, 160, C.coral) + frame(1190, 260, 150, 120, C.mustard) + lamp(1300, 700, 1));
    s += layer(0.8, floorBoards(660, 460) + '<ellipse cx="900" cy="860" rx="660" ry="130" fill="#D8624F" opacity=".92"/><ellipse cx="900" cy="860" rx="560" ry="100" fill="none" stroke="#F8D9A0" stroke-width="6" stroke-dasharray="26 18"/>');
    if (o.sofa !== false && !o.memory) {
      s += layer(0.95, '<g transform="translate(470,540)"><rect x="-300" y="-30" width="640" height="220" rx="46" fill="#6B8FC9"/><rect x="-330" y="40" width="70" height="170" rx="30" fill="#5878B4"/><rect x="310" y="40" width="70" height="170" rx="30" fill="#5878B4"/><rect x="-250" y="-100" width="540" height="130" rx="40" fill="#7AA0DA"/><circle cx="-130" cy="40" r="40" fill="#F2B544"/><rect x="60" y="0" width="90" height="80" rx="18" fill="#F26B5B" transform="rotate(-8 100 40)"/></g>');
    }
    if (o.memory) {
      s += layer(1.0, '<g transform="translate(960,860)"><ellipse cx="0" cy="130" rx="330" ry="40" fill="rgba(60,30,10,.28)"/><rect x="-26" y="-20" width="52" height="150" fill="#8A5A33"/><ellipse cx="0" cy="-20" rx="330" ry="56" fill="#C8905A"/><ellipse cx="0" cy="-30" rx="330" ry="56" fill="#E0A870"/><ellipse cx="0" cy="-32" rx="270" ry="38" fill="none" stroke="#C8905A" stroke-width="4" opacity=".7"/></g>', 'fg');
    }
    s += layer(1.2, plant(1780, 1010, 1.15) + dust(14));
    return s;
  };

  /* ---------------- SCHOOLYARD ---------------- */
  S.schoolyard = function (o) {
    o = o || {};
    var tod = o.tod || "day";
    var s = defsFor(tod);
    s += layer(0.1, '<rect x="-300" y="-200" width="2520" height="1000" fill="url(#sky-' + tod + ')"/>' +
      '<circle cx="1560" cy="180" r="74" fill="#FFE18A"/><circle cx="1560" cy="180" r="120" fill="url(#glow)"/>' +
      cloud(380, 170, 1.2, "drift") + cloud(1100, 120, 0.9, "drift") + cloud(1700, 300, 0.7));
    s += layer(0.3, '<path d="M-100,560 Q300,420 640,540 T1300,520 T2100,540 V700 H-100Z" fill="#B9DFA9"/>');
    s += layer(0.5,
      '<g transform="translate(250,230)"><rect width="1000" height="420" fill="#D9805F"/><rect y="-34" width="1000" height="40" fill="#B5603F"/>' +
      [0, 1, 2, 3, 4].map(function (i) { return '<rect x="' + (50 + i * 190) + '" y="64" width="110" height="130" rx="6" fill="#BFE5F7" stroke="#fff" stroke-width="10"/><path d="M' + (105 + i * 190) + ',64 V194 M' + (50 + i * 190) + ',129 H' + (160 + i * 190) + '" stroke="#fff" stroke-width="6"/>'; }).join("") +
      '<rect x="420" y="250" width="160" height="170" rx="10" fill="#7A4A2D"/><rect x="440" y="270" width="55" height="150" fill="#BFE5F7" opacity=".8"/><rect x="505" y="270" width="55" height="150" fill="#BFE5F7" opacity=".8"/>' +
      '<path d="M0,-34 L500,-120 L1000,-34Z" fill="#9B4B34"/></g>' + tree(120, 700, 1) + tree(1700, 700, 1.1, "#7DBD74"));
    s += layer(0.7, '<rect x="-300" y="690" width="2520" height="14" fill="#8A5A33"/>' +
      Array.apply(null, Array(32)).map(function (_, i) { return '<rect x="' + (-100 + i * 70) + '" y="640" width="12" height="66" fill="#D9A872"/>'; }).join("") +
      '<rect x="-300" y="660" width="2520" height="9" fill="#C8905A"/>');
    s += layer(0.9, '<rect x="-300" y="700" width="2520" height="420" fill="#8E96A8"/><rect x="-300" y="700" width="2520" height="14" fill="#7B8397"/>' +
      '<g stroke="#fff" stroke-width="8" fill="none" opacity=".9">' +
      '<rect x="360" y="820" width="90" height="90"/><rect x="450" y="820" width="90" height="90"/><rect x="450" y="910" width="90" height="90"/><rect x="540" y="910" width="90" height="90"/><rect x="540" y="1000" width="90" height="70"/>' +
      '<path d="M1180,760 H1700 M1180,980 H1700 M1440,760 V980"/><circle cx="1440" cy="870" r="48"/></g>' +
      '<g transform="translate(1790,560)"><rect x="-6" y="0" width="12" height="250" fill="#6B7280"/><rect x="-60" y="-70" width="120" height="84" rx="6" fill="#fff" stroke="#6B7280" stroke-width="6"/><ellipse cx="0" cy="22" rx="38" ry="9" fill="none" stroke="#F26B5B" stroke-width="7"/></g>');
    s += layer(1.15, '<g transform="translate(120,1030)"><ellipse cx="0" cy="0" rx="130" ry="46" fill="#5FA666"/><ellipse cx="90" cy="14" rx="100" ry="38" fill="#74B879"/></g>');
    return s;
  };

  /* ---------------- NEIGHBORHOOD STREET ---------------- */
  S.street = function (o) {
    o = o || {};
    var tod = o.tod || "day";
    var s = defsFor(tod);
    var house = function (x, y, w, h, wall, roof) {
      return '<g transform="translate(' + x + ',' + y + ')"><rect width="' + w + '" height="' + h + '" fill="' + wall + '"/>' +
        '<path d="M-24,0 L' + w / 2 + ',' + (-h * 0.42) + ' L' + (w + 24) + ',0Z" fill="' + roof + '"/>' +
        '<rect x="' + w * 0.12 + '" y="' + h * 0.2 + '" width="' + w * 0.26 + '" height="' + h * 0.26 + '" rx="6" fill="#FFE9A8" stroke="#fff" stroke-width="8"/>' +
        '<rect x="' + w * 0.62 + '" y="' + h * 0.2 + '" width="' + w * 0.26 + '" height="' + h * 0.26 + '" rx="6" fill="#FFE9A8" stroke="#fff" stroke-width="8"/>' +
        '<rect x="' + w * 0.4 + '" y="' + h * 0.52 + '" width="' + w * 0.2 + '" height="' + h * 0.48 + '" rx="8" fill="' + A.shade(roof, -10) + '"/></g>';
    };
    s += layer(0.1, '<rect x="-300" y="-200" width="2520" height="1000" fill="url(#sky-' + tod + ')"/>' + (tod === "day" ? cloud(300, 210, 1.1, "drift") + cloud(1300, 150, 1) : '<circle cx="1500" cy="190" r="66" fill="#FFE9A8"/><circle cx="1500" cy="190" r="140" fill="url(#glow)"/>'));
    s += layer(0.25, '<path d="M-100,520 Q240,380 560,500 T1180,470 T1800,500 T2100,470 V700 H-100Z" fill="#A5CFA1"/>');
    s += layer(0.5, house(120, 370, 330, 300, "#F2C48C", "#C8654F") + house(520, 330, 360, 340, "#9FD3F0", "#6B4C9A") + house(960, 380, 320, 290, "#F4A9A0", "#8A5A33") + house(1350, 340, 380, 330, "#C9E4B2", "#D9805F") + tree(1830, 700, 0.95));
    s += layer(0.8, '<rect x="-300" y="670" width="2520" height="60" fill="#D8D2C4"/><rect x="-300" y="730" width="2520" height="400" fill="#7E8798"/>' +
      '<g stroke="#FFE9A8" stroke-width="10" stroke-dasharray="70 56"><path d="M-100,900 H2100"/></g>' +
      '<g transform="translate(1420,670)"><rect x="-6" y="-290" width="12" height="290" fill="#44506A"/><path d="M-4,-290 q50,-4 70,30" fill="none" stroke="#44506A" stroke-width="10"/><circle cx="66" cy="-250" r="20" fill="#FFE9A8"/><circle cx="66" cy="-250" r="70" fill="url(#glow)"/></g>' +
      '<g transform="translate(180,690)"><rect x="-120" y="-40" width="240" height="18" rx="6" fill="#B9814F"/><rect x="-120" y="-90" width="240" height="14" rx="6" fill="#B9814F"/><rect x="-100" y="-22" width="12" height="40" fill="#44506A"/><rect x="88" y="-22" width="12" height="40" fill="#44506A"/></g>');
    s += layer(1.15, tree(40, 1060, 0.9, "#5FA666") + '<g transform="translate(1850,1010)"><ellipse cx="0" cy="0" rx="100" ry="40" fill="#5FA666"/></g>');
    return s;
  };

  /* ---------------- ART CORNER ---------------- */
  S.art = function (o) {
    o = o || {};
    var tod = o.tod || "day";
    var s = defsFor(tod);
    var jar = function (x, y, col) { return '<g transform="translate(' + x + ',' + y + ')"><rect x="-22" y="-60" width="44" height="60" rx="8" fill="#fff" opacity=".85" stroke="' + C.ink + '" stroke-width="3"/><rect x="-18" y="-24" width="36" height="20" rx="5" fill="' + col + '"/><path d="M-8,-60 L-12,-96 M0,-60 L2,-100 M8,-60 L14,-92" stroke="#8A5A33" stroke-width="5" stroke-linecap="round"/><circle cx="-12" cy="-98" r="5" fill="' + col + '"/><circle cx="2" cy="-102" r="5" fill="' + col + '"/></g>'; };
    s += layer(0.15, '<rect x="-300" y="-200" width="2520" height="1200" fill="#FBE9D0"/>' +
      '<g opacity=".5">' + Array.apply(null, Array(14)).map(function (_, i) { return '<circle cx="' + (60 + i * 150) + '" cy="' + (90 + (i % 3) * 60) + '" r="5" fill="#E9C9A6"/>'; }).join("") + "</g>");
    s += layer(0.35, windowBox(1180, 120, 460, 400, "day", "#fff") + '<polygon points="1200,520 1640,520 1500,1000 700,1000" fill="url(#beam)"/>' +
      bunting(60, 120, 900, 150, 9, [C.coral, C.mustard, C.teal, C.plum, C.sage]));
    s += layer(0.55,
      '<g transform="translate(110,300)"><rect width="520" height="14" fill="' + C.woodDark + '"/><rect y="170" width="520" height="14" fill="' + C.woodDark + '"/><rect x="20" y="14" width="10" height="150" fill="#6B4228" opacity="0"/>' +
      jar(80, 0, C.coral) + jar(160, 0, C.mustard) + jar(240, 0, C.teal) + jar(320, 0, C.plum) + jar(400, 0, C.sage) +
      '<rect x="40" y="110" width="110" height="60" rx="6" fill="#F26B5B"/><rect x="170" y="100" width="90" height="70" rx="6" fill="#1F9E9A"/><rect x="280" y="120" width="120" height="50" rx="6" fill="#F2B544"/><rect x="420" y="90" width="70" height="80" rx="6" fill="#6B4C9A"/></g>' +
      '<g transform="translate(700,340)"><path d="M0,0 L120,0" stroke="#6B4C3A" stroke-width="4"/>' + frame(-10, 10, 120, 160, C.teal) + "</g>" +
      '<g transform="translate(1000,200)">' + frame(0, 0, 150, 190, C.coral) + "</g>");
    s += layer(0.8, floorBoards(700, 400) +
      '<g transform="translate(1500,740)"><path d="M-70,0 L-10,-420 M70,0 L10,-420 M0,0 L0,-300" stroke="' + C.woodDark + '" stroke-width="12" stroke-linecap="round"/><rect x="-150" y="-440" width="300" height="230" rx="8" fill="#fff" stroke="' + C.woodDark + '" stroke-width="10"/><path d="M-120,-230 Q-60,-380 0,-300 T120,-340" fill="none" stroke="' + C.coral + '" stroke-width="16" stroke-linecap="round"/><circle cx="60" cy="-390" r="30" fill="' + C.mustard + '"/><path d="M-130,-236 H130" stroke="' + C.teal + '" stroke-width="12"/></g>');
    s += layer(1.0, '<g transform="translate(260,860)"><ellipse cx="0" cy="70" rx="230" ry="30" fill="rgba(60,30,10,.2)"/><rect x="-210" y="-20" width="420" height="30" rx="8" fill="#C8905A"/><rect x="-190" y="10" width="18" height="70" fill="#8A5A33"/><rect x="172" y="10" width="18" height="70" fill="#8A5A33"/>' +
      '<ellipse cx="-90" cy="-26" rx="46" ry="10" fill="' + C.coral + '"/><ellipse cx="0" cy="-26" rx="40" ry="9" fill="' + C.teal + '"/><ellipse cx="90" cy="-26" rx="44" ry="10" fill="' + C.mustard + '"/>' +
      '<g class="bob"><rect x="130" y="-90" width="60" height="64" rx="6" fill="#fff" stroke="' + C.ink + '" stroke-width="3"/></g></g>');
    s += layer(1.2, dust(10));
    return s;
  };

  /* ---------------- COMMUNITY ROOM ---------------- */
  S.community = function (o) {
    o = o || {};
    var tod = o.tod || "day";
    var s = defsFor(tod);
    var table = function (x, y, w) {
      return '<g transform="translate(' + x + ',' + y + ')"><ellipse cx="' + w / 2 + '" cy="96" rx="' + w * 0.52 + '" ry="16" fill="rgba(60,30,10,.2)"/><rect x="0" y="0" width="' + w + '" height="26" rx="8" fill="#E0A870"/><rect x="18" y="26" width="14" height="80" fill="#8A5A33"/><rect x="' + (w - 32) + '" y="26" width="14" height="80" fill="#8A5A33"/>' +
        '<rect x="30" y="-18" width="56" height="20" rx="3" fill="#fff" stroke="' + C.ink + '" stroke-width="2"/><rect x="100" y="-24" width="50" height="26" rx="3" fill="#FFF3B8"/><circle cx="' + (w - 70) + '" cy="-8" r="14" fill="' + C.coral + '"/></g>';
    };
    s += layer(0.15, '<rect x="-300" y="-200" width="2520" height="1200" fill="#F4E4C9"/><rect x="-300" y="560" width="2520" height="90" fill="#E3C79C"/>');
    s += layer(0.35, windowBox(120, 140, 300, 340, "day") + windowBox(520, 140, 300, 340, "day") + windowBox(1100, 140, 300, 340, "day") + windowBox(1500, 140, 300, 340, "day") +
      bunting(-20, 90, 960, 110, 12, [C.coral, C.mustard, C.teal, C.sage, C.plum]) + bunting(940, 110, 1940, 80, 12, [C.mustard, C.teal, C.coral, C.plum, C.sage]));
    s += layer(0.55,
      '<g transform="translate(900,200)"><rect width="150" height="330" rx="10" fill="#C8905A" stroke="' + C.woodDark + '" stroke-width="8"/><rect x="14" y="14" width="122" height="302" fill="#E8C08A"/>' +
      '<rect x="26" y="30" width="46" height="60" fill="#fff" transform="rotate(-4 50 60)"/><rect x="82" y="40" width="44" height="50" fill="#9FD3F0" transform="rotate(5 100 60)"/><rect x="30" y="120" width="50" height="60" fill="#FFF3B8" transform="rotate(3 55 150)"/><rect x="88" y="130" width="40" height="70" fill="#F4A9A0" transform="rotate(-5 108 160)"/><rect x="40" y="220" width="70" height="60" fill="#C9E4B2"/></g>' +
      '<g transform="translate(1780,420)">' + [0, 1, 2, 3].map(function (i) { return '<rect x="' + (-30) + '" y="' + (-i * 26) + '" width="90" height="22" rx="5" fill="' + (i % 2 ? "#6B4C9A" : "#1F9E9A") + '"/>'; }).join("") + "</g>");
    s += layer(0.85, floorBoards(640, 460) + '<ellipse cx="960" cy="850" rx="760" ry="120" fill="#9FD3F0" opacity=".45"/>');
    s += layer(1.0, table(80, 830, 380) + table(1470, 840, 400));
    s += layer(1.2, plant(60, 1030, 0.9) + dust(10));
    return s;
  };

  /* ---------------- JOURNAL PAGE (abstract) ---------------- */
  S.journal = function (o) {
    o = o || {};
    var s = defsFor("day");
    var doodles = "";
    var cols = [C.coral, C.mustard, C.teal, C.plum, C.sage];
    for (var i = 0; i < 22; i++) {
      var x = 40 + ((i * 193) % 1840), y = 40 + ((i * 127) % 1000);
      if (x > 220 && x < 1700 && y > 150 && y < 940) continue;
      var c = cols[i % cols.length];
      doodles += i % 3 === 0 ? '<path d="M' + x + ',' + y + ' l14,34 l-37,-22 h46 l-37,22z" fill="' + c + '" opacity=".7" transform="scale(.7) translate(' + x * 0.43 + ',' + y * 0.43 + ')"/>' :
        i % 3 === 1 ? '<circle cx="' + x + '" cy="' + y + '" r="' + (10 + (i % 4) * 4) + '" fill="none" stroke="' + c + '" stroke-width="5" opacity=".7"/>' :
        '<path d="M' + x + ',' + y + ' q20,-30 40,0 t40,0" fill="none" stroke="' + c + '" stroke-width="5" stroke-linecap="round" opacity=".7"/>';
    }
    s += layer(0.1, '<rect x="-300" y="-200" width="2520" height="1500" fill="#F6E7CC"/>' +
      '<rect x="40" y="30" width="1840" height="1020" rx="30" fill="#FFF9EC" stroke="#E8CFA6" stroke-width="6"/>' +
      Array.apply(null, Array(22)).map(function (_, i) { return '<path d="M80,' + (160 + i * 40) + ' H1840" stroke="#CFE3F2" stroke-width="2" opacity=".55"/>'; }).join("") +
      '<path d="M200,40 V1040" stroke="#F4A9A0" stroke-width="3" opacity=".7"/>');
    s += layer(0.4, doodles + '<rect x="30" y="20" width="150" height="46" fill="#F2B544" opacity=".75" transform="rotate(-8 100 40)"/><rect x="1750" y="990" width="150" height="46" fill="#1F9E9A" opacity=".65" transform="rotate(-8 1800 1010)"/>');
    return s;
  };

  S.build = function (id, o) {
    var f = S[id];
    return f ? f(o) : S.journal(o);
  };
})(typeof window !== "undefined" ? window : globalThis);
