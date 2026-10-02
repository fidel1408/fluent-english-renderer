/* Fluent English - Love Speaking Club
 * vignettes-misc.js : emblems for the warm-up, debate scenes, case scenes, "door" panels, quality icons, spotlight, finale.
 * No words are drawn inside artwork.
 */
(function (g) {
  'use strict';
  const Art = g.Art, S = Art.S, f = Art.f, P = Art.P, ease = Art.ease, V = g.V, OBJ = V.OBJ;
  const cast = (id) => Art.Cast.make(id);
  const ik = (fig, side, x, y, hand, bend) => fig.ik(side, x, y, bend).concat(hand ? [hand] : []);
  const svg = (vb, inner, extra) => `<svg viewBox="${vb}" width="100%" height="100%" ${vb === '0 0 720 300' ? 'preserveAspectRatio="xMidYMid slice"' : ''} ${extra || ''} xmlns="http://www.w3.org/2000/svg" role="presentation">${inner}</svg>`;

  /* ---------------------------------------------------------------- emblems (150 x 150) for Choose Your Side */
  const star = (x, y, r, col) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r; d += (i ? 'L' : 'M') + f(x + Math.cos(a) * rr) + ',' + f(y + Math.sin(a) * rr); } return `<path d="${d}Z" fill="${col}"/>`; };
  const EMB = {
    w1a: svg('0 0 150 150', `<circle cx="58" cy="75" r="40" fill="#1FA8A0" opacity=".9"/><circle cx="92" cy="75" r="40" fill="#FF6B57" opacity=".9"/><path d="M75,40 A40,40 0 0 1 75,110 A40,40 0 0 1 75,40Z" fill="#FFD98A"/>${star(75, 75, 22, '#FBF4E6')}`),
    w1b: svg('0 0 150 150', `<path d="M14,22 H92 Q104,22 104,34 V74 Q104,86 92,86 H48 L28,104 V86 H26 Q14,86 14,74Z" fill="#1FA8A0"/><path d="M56,64 H122 Q136,64 136,78 V112 Q136,126 122,126 H116 V144 L96,126 H62 Q56,126 56,118Z" fill="#FF6B57" opacity=".95"/><circle cx="40" cy="54" r="5" fill="#FBF4E6"/><circle cx="58" cy="54" r="5" fill="#FBF4E6"/><circle cx="76" cy="54" r="5" fill="#FBF4E6"/><path d="M76,96 H116 M76,108 H104" stroke="#FBF4E6" stroke-width="6" stroke-linecap="round"/>`),
    w2a: svg('0 0 150 150', `<rect x="10" y="30" width="58" height="90" rx="16" fill="#1FA8A0"/><rect x="82" y="30" width="58" height="90" rx="16" fill="#1FA8A0"/>${star(39, 75, 24, '#FFD98A')}${star(111, 75, 24, '#FFD98A')}<path d="M68,75 H82" stroke="#0B1630" stroke-width="6" stroke-linecap="round"/>`),
    w2b: svg('0 0 150 150', `<rect x="8" y="26" width="64" height="98" rx="16" fill="#FF6B57"/><rect x="78" y="26" width="64" height="98" rx="16" fill="#1FA8A0"/><circle cx="40" cy="62" r="18" fill="#FFD98A"/><path d="M104,48 A20,20 0 1 0 122,78 A16,16 0 1 1 104,48Z" fill="#FBF4E6"/><path d="M20,112 L40,84 L60,112Z" fill="#B5214F"/><path d="M92,112 H128" stroke="#0B1630" stroke-width="6" stroke-linecap="round"/>`),
    w3a: svg('0 0 150 150', `<g stroke="#FFD98A" stroke-width="7" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${f(75 + Math.cos(a) * 18)},${f(70 + Math.sin(a) * 18)} L${f(75 + Math.cos(a) * (46 + (i % 2) * 14))},${f(70 + Math.sin(a) * (46 + (i % 2) * 14))}" stroke="${i % 3 === 0 ? '#FF6B57' : (i % 3 === 1 ? '#FFD98A' : '#FBF4E6')}"/>`; }).join('')}</g><circle cx="75" cy="70" r="12" fill="#FBF4E6"/><path d="M75,118 V144" stroke="#FBF4E6" stroke-width="6"/>`),
    w3b: svg('0 0 150 150', `<path d="M10,120 H140" stroke="#FBF4E6" stroke-width="5" stroke-linecap="round"/>${[0, 1, 2, 3, 4].map((k) => `<circle cx="${22 + k * 26}" cy="${108 - k * 14}" r="${9 + k * 1.5}" fill="${k % 2 ? '#FF6B57' : '#1FA8A0'}"/><circle cx="${22 + k * 26}" cy="${108 - k * 14}" r="${15 + k * 1.5}" fill="#FFD98A" opacity=".25"/>`).join('')}<path d="M22,108 L48,94 L74,80 L100,66 L126,52" stroke="#FBF4E6" stroke-width="3" stroke-dasharray="4 8" fill="none"/>`),
    w4a: svg('0 0 150 150', `<circle cx="62" cy="75" r="46" fill="#1FA8A0" opacity=".92"/><circle cx="88" cy="75" r="46" fill="#FF6B57" opacity=".85"/><path d="M75,33 A46,46 0 0 1 75,117 A46,46 0 0 1 75,33Z" fill="#FFD98A"/>`),
    w4b: svg('0 0 150 150', `<circle cx="38" cy="75" r="30" fill="#1FA8A0"/><circle cx="112" cy="75" r="30" fill="#FF6B57"/><path d="M68,75 H82" stroke="#FBF4E6" stroke-width="5" stroke-dasharray="3 7" stroke-linecap="round"/><path d="M60,44 Q75,24 90,44" fill="none" stroke="#FFD98A" stroke-width="5" stroke-linecap="round"/>`)
  };
  V.emblem = (id) => EMB[id] || '';

  /* ---------------------------------------------------------------- debate scenes (figures on the right half) */
  V.debate = (s) => {
    let st;
    if (s === 0) {
      st = new Art.Stage('apartment', { table: { cx: 1260, T: 706, w: 640, col: '#e8d8b8', front: '#7a5a3a' } });
      const A = cast('alex'), M = cast('maya');
      st.addFigure(A, 1130, 706 - 170 * 1.05 + 46, 1.05); st.addFigure(M, 1400, 706 - 170 * 1.05 + 46, 1.05);
      A.set({ expr: 'focused', yaw: .4, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'], lean: 3 }); M.set({ expr: 'thinking', yaw: -.4, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'] });
      st.addMarkup('fg', `${P.flowers(1262, 736, .8)}<g transform="translate(1320,732) rotate(-6)"><rect x="-70" y="-10" width="140" height="22" rx="3" fill="#FBF4E6"/><path d="M-50,0 H50" stroke="#8d96b8" stroke-width="4"/><path d="M-50,-4 l20,-8 l20,10 l30,-6" stroke="#FF6B57" stroke-width="4" fill="none"/></g>`);
      A.attach('R', OBJ.mug('#FF6B57'), 0, 0, 0);
      setTimeout(() => { A.pose({ aR: ik(A, 'R', 30, 128, 'cup'), expr: 'thinking' }, 800); }, 200);
    } else if (s === 1) {
      st = new Art.Stage('park', { clipY: null });
      const L = cast('leo'), Pr = cast('priya');
      st.addFigure(L, 1120, 700, 1.25); st.addFigure(Pr, 1430, 704, 1.25);
      L.set({ expr: 'warm', yaw: .4, aL: [8, 12, 0, 'relaxed'], aR: ik(L, 'R', 130, 70, 'open') }); Pr.set({ expr: 'smile', yaw: -.4, aL: ik(Pr, 'L', -50, 110, 'relaxed'), aR: [10, 14, 0, 'relaxed'] });
      st.later(() => { L.pose({ aR: ik(L, 'R', 120, 40, 'open'), head: -3 }, 800); Pr.pose({ head: 3, expr: 'delight' }, 800); }, 800);
    } else if (s === 2) {
      st = new Art.Stage('night');
      const panel = (x, y, w, h, bg, fn) => { const id = 'vp' + Math.round(x + y); const gg = S('g'); gg.innerHTML = `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26"/></clipPath></defs><g clip-path="url(#${id})">${bg}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="none" stroke="#FBF4E6" stroke-width="6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="url(#shadeDown)" opacity=".12"/>`; st.layers.mid.appendChild(gg); return id; };
      const topBg = `<rect x="940" y="110" width="600" height="300" fill="#0b1636"/>${P.stars(4, 20, 400).replace(/cx="(\d+(?:\.\d+)?)"/g, (m, a) => `cx="${f(940 + a * .375)}"`).replace(/cy="(\d+(?:\.\d+)?)"/g, (m, a) => `cy="${f(110 + a * .6)}"`)}<g transform="translate(940,110) scale(.375)">${P.skyline({ base: 760, minH: 100, maxH: 300, color: '#14224a', seed: 5, win: '#FFD98A', winOp: .85, density: .35 })}</g><circle cx="1400" cy="170" r="30" fill="#F3E7D0"/>`;
      const botBg = `<rect x="940" y="440" width="600" height="300" fill="#FFC27A"/><rect x="940" y="440" width="600" height="150" fill="#7FD6CC" opacity=".55"/><circle cx="1400" cy="520" r="44" fill="#FFF1CF"/><g transform="translate(940,440) scale(.375)">${P.skyline({ base: 800, minH: 60, maxH: 200, color: '#8a5a7a', seed: 8, win: null })}</g>`;
      const idT = panel(940, 330, 600, 240, `<g transform="translate(0,220)">${topBg}</g>`); const idB = panel(940, 590, 600, 240, `<g transform="translate(0,150)">${botBg}</g>`);
      const A = cast('alex'), M = cast('maya');
      // clip figures to panels
      const clipFig = (fig, id, x, y, sc) => { const w = S('g', { 'clip-path': `url(#${id})` }); w.appendChild(fig.el); st.layers.actors.appendChild(w); fig.pos(x, y, sc); st.figs.push(fig); fig.idle(true); };
      clipFig(A, idT, 1240, 565 - 150 * .62 + 20, .62); clipFig(M, idB, 1240, 825 - 150 * .62 + 20, .62);
      A.set({ expr: 'warm', yaw: -.1, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'] }); M.set({ expr: 'delight', yaw: .1, aL: ik(M, 'L', -60, 40, 'open'), aR: [20, 66, 0, 'relaxed'] });
      st.addMarkup('fx', `<g transform="translate(1240,580)"><circle r="26" fill="#FF6B57"/><path d="M-11,-4 l6,-8 h10 l6,8 v14 h-22z" fill="#FBF4E6" transform="scale(.9)"/></g><path d="M1240,566 V582" stroke="#F5B544" stroke-width="5" stroke-dasharray="4 6"/>`);
    } else {
      st = new Art.Stage('cafe', { table: { cx: 1240, T: 700, w: 760, col: '#a8683c', front: '#5a2f22' } });
      const Pr = cast('priya'); st.addFigure(Pr, 1160, 700 - 170 * 1.1 + 70, 1.1);
      Pr.set({ expr: 'warm', yaw: -.2, aL: ik(Pr, 'L', -30, 130, 'relaxed'), aR: [20, 66, 0, 'relaxed'] });
      Pr.attach('L', OBJ.book('#1FA8A0'), 0, 0, 0);
      st.addMarkup('mid', P.chair(1440, 880, 1.15, '#6c2f2d', true));
      st.addMarkup('fg', `${P.mug(1400, 730, '#FBF4E6', .9, false)}${P.mug(1280, 730, '#F5B544', .9, true)}`);
      st.later(() => { Pr.pose({ head: -3, expr: 'smile' }, 900); }, 700);
    }
    return st;
  };

  /* ---------------------------------------------------------------- case scenes */
  V.caseScene = (c) => {
    let st;
    if (c === 0) {
      st = new Art.Stage('travel', { clipY: null });
      const Pr = cast('priya'), D = cast('dev');
      st.addFigure(Pr, 520, 730, 1.0); st.addFigure(D, 1060, 734, 1.0);
      Pr.set({ expr: 'delight', yaw: .4, aL: ik(Pr, 'L', -40, 60, 'relaxed'), aR: [10, 14, 0, 'relaxed'] }); Pr.attach('L', OBJ.cards(), 0, 0, 0);
      D.set({ expr: 'curious', yaw: -.4, aL: [10, 16, 0, 'relaxed'], aR: ik(D, 'R', 60, 100, 'open') });
      st.later(() => { Pr.pose({ expr: 'warm', head: -3 }, 700); D.pose({ expr: 'warm', head: 3 }, 700); }, 1200);
    } else if (c === 1) {
      st = new Art.Stage('park', { clipY: null });
      const L = cast('leo'), M = cast('maya');
      st.addFigure(L, 560, 760, 1.0); st.addFigure(M, 1060, 760, 1.0);
      L.set({ expr: 'warm', yaw: .45, aL: [10, 14, 0, 'relaxed'], aR: ik(L, 'R', 100, 90, 'open') }); M.set({ expr: 'curious', yaw: -.45, aL: ik(M, 'L', -60, 100, 'open'), aR: [10, 14, 0, 'relaxed'] });
      // signpost with two arrows (no words)
      st.addMarkup('mid', `<g transform="translate(810,640)"><rect x="-8" y="-250" width="16" height="260" fill="#5a3326"/><path d="M8,-240 H110 L134,-214 L110,-188 H8Z" fill="#1FA8A0"/><path d="M-8,-170 H-110 L-134,-144 L-110,-118 H-8Z" fill="#FF6B57"/><circle cx="0" cy="-262" r="14" fill="#F5B544"/></g>`);
    } else {
      st = new Art.Stage('apartment', { clipY: null });
      const D = cast('dev'), Pr = cast('priya');
      st.addFigure(D, 470, 734, 1.0); st.addFigure(Pr, 1130, 734, 1.0);
      D.set({ expr: 'smile', yaw: .3, aL: ik(D, 'L', -30, 70, 'relaxed'), aR: [10, 16, 0, 'relaxed'] }); D.attach('L', OBJ.phone(true, '#1FA8A0'), 0, 0, 0);
      Pr.set({ expr: 'warm', yaw: -.3, aL: [10, 16, 0, 'relaxed'], aR: ik(Pr, 'R', 30, 70, 'relaxed') }); Pr.attach('R', OBJ.phone(true, '#FF6B57'), 0, 0, 0);
      const bub = (x, y, w, col, d) => `<g style="animation:pop .5s ${d}s var(--ease) both;transform-box:fill-box;transform-origin:center"><rect x="${x}" y="${y}" width="${w}" height="38" rx="19" fill="${col}"/></g>`;
      st.addMarkup('fx', `${bub(330, 440, 70, '#7FD6CC', .4)}${bub(390, 400, 56, '#7FD6CC', .8)}${bub(320, 360, 80, '#7FD6CC', 1.2)}${bub(380, 320, 60, '#7FD6CC', 1.6)}${bub(1160, 400, 220, '#FFB4A6', 1.0)}`);
    }
    return st;
  };

  /* ---------------------------------------------------------------- two cities (priority change) */
  V.twoCities = () => svg('0 0 900 190', `<defs><linearGradient id="tcg" x1="0" x2="1"><stop offset="0" stop-color="#14224A"/><stop offset="1" stop-color="#34508F"/></linearGradient></defs><rect width="900" height="190" rx="20" fill="url(#tcg)"/>
    <g transform="translate(0,0)">${P.skyline({ x0: 20, x1: 340, base: 170, minH: 40, maxH: 120, color: '#0b1636', seed: 31, win: '#FFD98A', winOp: .8, density: .4, wMin: 22, wMax: 44 })}</g>
    <g>${P.skyline({ x0: 560, x1: 880, base: 170, minH: 40, maxH: 120, color: '#0b1636', seed: 32, win: '#FFD98A', winOp: .8, density: .4, wMin: 22, wMax: 44 })}</g>
    <path d="M360,120 Q450,20 540,120" fill="none" stroke="#F5B544" stroke-width="5" stroke-dasharray="4 12" stroke-linecap="round"/><circle cx="450" cy="62" r="20" fill="#F5B544"/><path d="M440,62 h20 M452,54 l8,8 l-8,8" stroke="#0B1630" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`, 'style="margin-top:14px;display:block;border-radius:20px"');

  /* ---------------------------------------------------------------- "door" panels for Would You Rather (720 x 300) */
  const PAN = {};
  PAN.v1a = svg('0 0 720 300', `<defs><linearGradient id="p1a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1FA8A0"/><stop offset="1" stop-color="#F5B544"/></linearGradient></defs><rect width="720" height="300" fill="url(#p1a)"/><circle cx="560" cy="110" r="46" fill="#FFF1CF"/><circle cx="560" cy="110" r="100" fill="url(#glowWhite)"/>
    <path d="M30,230 Q200,60 360,150 T690,80" fill="none" stroke="#FBF4E6" stroke-width="5" stroke-dasharray="3 14" stroke-linecap="round"/><g transform="translate(360,150) rotate(-8)"><path d="M-40,0 L30,-10 L46,-14 L30,0 L-30,8Z" fill="#FBF4E6"/><path d="M-4,-2 L8,-26 L16,-26 L10,-4Z" fill="#E6D4B3"/></g>
    <g transform="translate(110,270)"><ellipse cx="0" cy="4" rx="64" ry="9" fill="#000" opacity=".25"/><rect x="-52" y="-96" width="104" height="96" rx="14" fill="#B5214F"/><rect x="-52" y="-96" width="104" height="96" rx="14" fill="url(#shadeSide)"/><path d="M-14,-96 v-14 q0,-8 8,-8 h12 q8,0 8,8 v14" fill="none" stroke="#10162a" stroke-width="6"/></g>${P.ticket(250, 250, -8, .9)}`);
  PAN.v1b = svg('0 0 720 300', `<defs><radialGradient id="p1b" cx=".7" cy=".1" r=".9"><stop offset="0" stop-color="#FFD98A"/><stop offset=".5" stop-color="#7a3b36"/><stop offset="1" stop-color="#2a1424"/></radialGradient></defs><rect width="720" height="300" fill="url(#p1b)"/>
    <path d="M520,10 L560,10 L600,90 L480,90Z" fill="#E7A24A"/><rect x="536" y="90" width="8" height="120" fill="#222"/><ellipse cx="540" cy="215" rx="56" ry="10" fill="#222"/>
    <rect x="0" y="236" width="720" height="64" fill="#5a2f22"/><g transform="translate(230,150) rotate(-4)"><rect x="-130" y="-70" width="260" height="170" rx="6" fill="#FBF4E6"/><path d="M-96,-36 H96 M-96,-8 H96 M-96,20 H96 M-96,48 H20" stroke="#B5214F" stroke-width="5" stroke-linecap="round" opacity=".75"/><path d="M60,70 q20,-30 40,0" stroke="#1F3366" stroke-width="5" fill="none"/></g>
    ${Array.from({ length: 6 }, (_, k) => `<g transform="translate(${440 + (k % 3) * 80},${232 - Math.floor(k / 3) * 22}) rotate(${(k % 2) * 4 - 2})"><rect x="-34" y="-14" width="68" height="40" rx="4" fill="#F3E7D0"/><path d="M-34,-14 L0,12 L34,-14" fill="none" stroke="#cdb98f" stroke-width="2"/><circle cx="0" cy="12" r="5" fill="#B5214F"/></g>`).join('')}<path d="M330,230 L480,170" stroke="#1F3366" stroke-width="8" stroke-linecap="round"/>`);
  const bike = (x, y, col) => `<g transform="translate(${x},${y})" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><circle cx="-34" cy="0" r="24"/><circle cx="34" cy="0" r="24"/><path d="M-34,0 L-8,-34 H22 L34,0 M-8,-34 L6,0 H-34 M22,-34 L18,-46 H30"/></g>`;
  const guitar = (x, y, col) => `<g transform="translate(${x},${y}) rotate(25)"><ellipse cx="0" cy="22" rx="30" ry="36" fill="${col}"/><ellipse cx="0" cy="-12" rx="22" ry="26" fill="${col}"/><circle cx="0" cy="22" r="9" fill="#10162a"/><rect x="-5" y="-80" width="10" height="64" fill="#5a3326"/><rect x="-9" y="-92" width="18" height="16" rx="3" fill="#10162a"/></g>`;
  const tent = (x, y, col) => `<g transform="translate(${x},${y})"><path d="M-48,0 L0,-62 L48,0Z" fill="${col}"/><path d="M0,-62 L18,0 H-18Z" fill="#10162a" opacity=".5"/><path d="M-60,0 H60" stroke="#10162a" stroke-width="5"/></g>`;
  PAN.v2a = svg('0 0 720 300', `<defs><linearGradient id="p2a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14224A"/><stop offset="1" stop-color="#1F3366"/></linearGradient></defs><rect width="720" height="300" fill="url(#p2a)"/><rect y="240" width="720" height="60" fill="#0b1636"/>${bike(110, 190, '#7FD6CC')}${bike(260, 190, '#7FD6CC')}${guitar(410, 170, '#FFB4A6')}${guitar(500, 170, '#FFB4A6')}${tent(620, 238, '#F5B544')}<path d="M40,60 H680" stroke="#FBF4E6" stroke-opacity=".25" stroke-width="3" stroke-dasharray="6 10"/>${star(360, 54, 20, '#FFD98A')}`);
  PAN.v2b = svg('0 0 720 300', `<defs><linearGradient id="p2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34508F"/><stop offset="1" stop-color="#F5B544"/></linearGradient></defs><rect width="720" height="300" fill="url(#p2b)"/><rect y="250" width="720" height="50" fill="#0b1636"/>${guitar(120, 180, '#FF6B57')}<g transform="translate(600,190)"><path d="M-36,60 L-30,-36 H30 L36,60Z" fill="#1FA8A0"/><path d="M-36,60 L-30,-36 H30 L36,60Z" fill="url(#shadeSide)"/><path d="M-20,-36 L-8,-96 M0,-36 L0,-104 M20,-36 L10,-96" stroke="#B5214F" stroke-width="8" stroke-linecap="round"/><circle cx="-8" cy="-100" r="8" fill="#FF6B57"/><circle cx="0" cy="-108" r="8" fill="#F5B544"/><circle cx="10" cy="-100" r="8" fill="#FBF4E6"/></g>
    <path d="M220,250 Q360,90 500,250" fill="none" stroke="#FBF4E6" stroke-width="14" stroke-linecap="round"/><g transform="translate(360,126)"><circle r="44" fill="url(#glowAmber)"/><circle r="22" fill="#FBF4E6"/><path d="M0,-14 L6,0 L0,14 L-6,0Z" fill="#B5214F"/><path d="M-14,0 L0,-6 L14,0 L0,6Z" fill="#14224A" opacity=".6"/></g>`);
  PAN.v3a = svg('0 0 720 300', `<rect width="720" height="300" fill="#10163a"/>${P.stars(3, 40, 160)}${[[160, 100, '#FF6B57'], [360, 70, '#FFD98A'], [560, 110, '#7FD6CC']].map(([x, y, c]) => `<g stroke="${c}" stroke-width="6" stroke-linecap="round">${Array.from({ length: 14 }, (_, i) => { const a = i * Math.PI / 7; return `<path d="M${f(x + Math.cos(a) * 14)},${f(y + Math.sin(a) * 14)} L${f(x + Math.cos(a) * (46 + (i % 2) * 18))},${f(y + Math.sin(a) * (46 + (i % 2) * 18))}"/>`; }).join('')}</g><circle cx="${x}" cy="${y}" r="70" fill="${c}" opacity=".12"/>`).join('')}
    <path d="M0,40 Q180,90 360,40 T720,40" fill="none" stroke="#FBF4E6" stroke-width="3"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${k * 90 + 8},${46 + Math.sin(k) * 10} l30,0 l-15,30z" fill="${['#FF6B57', '#F5B544', '#1FA8A0'][k % 3]}"/>`).join('')}
    <rect y="236" width="720" height="64" fill="#2a1424"/><rect x="120" y="204" width="480" height="40" rx="6" fill="#FBF4E6"/><g transform="translate(360,204)"><rect x="-44" y="-50" width="88" height="50" rx="8" fill="#FF8C79"/><rect x="-34" y="-84" width="68" height="40" rx="8" fill="#FBF4E6"/><path d="M0,-84 v-18" stroke="#FFD98A" stroke-width="5"/><path class="flame" d="M0,-110 c-7,10 -6,16 0,18 c6,-2 7,-8 0,-18z" fill="#FFD98A"/></g>`);
  const glyph = (k, x, y) => ['<path d="M-10,-10 H10 V4 Q0,12 -10,4Z M10,-6 q8,0 6,8" fill="#FBF4E6" stroke="none"/>', '<rect x="-10" y="-12" width="20" height="24" rx="3" fill="#FBF4E6"/><path d="M-6,-4 H6 M-6,2 H4" stroke="#B5214F" stroke-width="2.4"/>', `<circle r="7" fill="#FFD98A"/>${Array.from({ length: 6 }, (_, i) => `<ellipse cx="${f(Math.cos(i * 1.05) * 10)}" cy="${f(Math.sin(i * 1.05) * 10)}" rx="5" ry="3.4" fill="#FBF4E6" transform="rotate(${i * 60} ${f(Math.cos(i * 1.05) * 10)} ${f(Math.sin(i * 1.05) * 10)})"/>`).join('')}`, '<path d="M-14,2 Q0,-16 14,2Z" fill="#FBF4E6"/><path d="M0,2 V12 q0,4 4,4" stroke="#FBF4E6" stroke-width="2.6" fill="none"/>', '<path d="M-12,-8 Q0,-14 12,-8 V10 Q0,4 -12,10Z" fill="#FBF4E6"/><path d="M0,-10 V6" stroke="#B5214F" stroke-width="2"/>', `<path d="M0,-12 L3,-3 L13,-3 L5,3 L8,12 L0,6 L-8,12 L-5,3 L-13,-3 L-3,-3Z" fill="#FFD98A"/>`][k % 6].replace(/^/, `<g transform="translate(${x},${y})">`) + '</g>';
  PAN.v3b = svg('0 0 720 300', `<defs><linearGradient id="p3b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E7370"/><stop offset="1" stop-color="#14224A"/></linearGradient></defs><rect width="720" height="300" fill="url(#p3b)"/>${Array.from({ length: 12 }, (_, k) => { const cx = 70 + (k % 6) * 116, cy = 100 + Math.floor(k / 6) * 110; return `<g><circle cx="${cx}" cy="${cy}" r="42" fill="url(#glowAmber)" opacity=".55"/><circle cx="${cx}" cy="${cy}" r="30" fill="${k % 2 ? '#FF6B57' : '#B5214F'}"/>${glyph(k, cx, cy)}</g>`; }).join('')}`);
  PAN.v4a = svg('0 0 720 300', `<defs><linearGradient id="p4a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1F3366"/><stop offset="1" stop-color="#B5214F"/></linearGradient></defs><rect width="720" height="300" fill="url(#p4a)"/><g transform="translate(250,150)"><rect x="-120" y="-120" width="240" height="250" rx="16" fill="#FBF4E6"/><rect x="-108" y="-108" width="216" height="226" rx="10" fill="#34508F"/><circle cx="0" cy="-34" r="38" fill="#D69C6E"/><path d="M-70,118 Q-70,30 0,30 Q70,30 70,118Z" fill="#0E7370"/><path d="M-38,-48 Q0,-84 38,-48 Q30,-62 0,-66 Q-30,-62 -38,-48Z" fill="#2a1e1c"/></g>
    ${[0, 1, 2, 3].map((k) => `<g transform="translate(470,${60 + k * 56})"><rect width="30" height="30" rx="6" fill="#FBF4E6"/><path d="M6,16 l8,8 l12,-14" stroke="#0E7370" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="46" y="8" width="${150 - k * 20}" height="14" rx="7" fill="#FBF4E6" opacity=".85"/></g>`).join('')}`);
  PAN.v4b = svg('0 0 720 300', `<defs><linearGradient id="p4b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14224A"/><stop offset="1" stop-color="#34508F"/></linearGradient><radialGradient id="p4l" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD98A" stop-opacity=".95"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient></defs><rect width="720" height="300" fill="url(#p4b)"/>
    <g opacity=".55"><ellipse cx="500" cy="230" rx="300" ry="60" fill="#FBF4E6" opacity=".25"/><ellipse cx="640" cy="170" rx="200" ry="50" fill="#FBF4E6" opacity=".22"/></g>
    <path d="M60,300 Q220,230 380,200 T700,120" fill="none" stroke="#FBF4E6" stroke-opacity=".5" stroke-width="40" stroke-linecap="round"/>${[[110, 276], [190, 248], [270, 224], [350, 204]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="9" fill="#FFD98A" opacity="${1 - k * .2}"/>`).join('')}
    <g transform="translate(150,200)"><circle r="96" fill="url(#p4l)"/><rect x="-10" y="-30" width="20" height="30" rx="4" fill="#F5B544"/><path d="M-12,-30 L0,-46 L12,-30Z" fill="#14224A"/><path d="M0,-6 V-26" stroke="#FFF1CF" stroke-width="4"/></g>
    <g transform="translate(560,130)"><rect x="-44" y="-84" width="88" height="140" rx="10" fill="#1F3366" stroke="#FBF4E6" stroke-width="5"/><path d="M-44,-84 L-4,-70 V70 L-44,56Z" fill="#0b1636" opacity=".6"/><circle cx="26" cy="-6" r="5" fill="#FFD98A"/></g>`);
  V.panel = (id) => PAN[id] || '';

  /* ---------------------------------------------------------------- quality icons (120 x 120) */
  const ico = (inner) => svg('0 0 120 120', `<circle cx="60" cy="60" r="56" fill="#1F3366" stroke="#F5B544" stroke-width="4"/>${inner}`);
  const QI = {
    honesty: ico('<circle cx="60" cy="60" r="30" fill="none" stroke="#7FD6CC" stroke-width="8"/><path d="M44,60 l11,12 l22,-26" stroke="#FFD98A" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    humor: ico('<circle cx="60" cy="60" r="32" fill="#F5B544"/><path d="M42,52 q6,-8 12,0 M66,52 q6,-8 12,0" stroke="#0B1630" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40,66 Q60,92 80,66Z" fill="#0B1630"/><path d="M46,70 Q60,76 74,70" stroke="#FBF4E6" stroke-width="4" fill="none"/>'),
    reliability: ico('<circle cx="60" cy="62" r="32" fill="none" stroke="#7FD6CC" stroke-width="8"/><path d="M60,62 V42 M60,62 L74,70" stroke="#FFD98A" stroke-width="7" stroke-linecap="round"/><rect x="50" y="18" width="20" height="10" rx="4" fill="#7FD6CC"/>'),
    curiosity: ico('<circle cx="54" cy="54" r="24" fill="none" stroke="#7FD6CC" stroke-width="8"/><path d="M72,72 L94,94" stroke="#FFD98A" stroke-width="10" stroke-linecap="round"/><path d="M44,52 q10,-14 22,0" stroke="#FBF4E6" stroke-width="4" fill="none" stroke-linecap="round"/>'),
    kindness: ico('<path d="M60,88 C26,62 30,32 48,32 C56,32 60,38 60,42 C60,38 64,32 72,32 C90,32 94,62 60,88Z" fill="#FF6B57"/><path d="M44,44 q4,-6 10,-4" stroke="#FBF4E6" stroke-width="4" fill="none" stroke-linecap="round"/>'),
    patience: ico('<path d="M38,24 H82 L62,60 L82,96 H38 L58,60Z" fill="none" stroke="#7FD6CC" stroke-width="7" stroke-linejoin="round"/><path d="M48,92 H72 L60,76Z" fill="#FFD98A"/><path d="M52,34 H68 L60,48Z" fill="#FFD98A" opacity=".7"/>'),
    independence: ico('<path d="M24,76 Q60,30 96,76" fill="none" stroke="#7FD6CC" stroke-width="8" stroke-linecap="round"/><path d="M40,70 L60,44 L80,70" fill="none" stroke="#FFD98A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="60" cy="86" r="8" fill="#FF6B57"/>'),
    shared: ico('<circle cx="48" cy="60" r="26" fill="#1FA8A0" opacity=".9"/><circle cx="72" cy="60" r="26" fill="#FF6B57" opacity=".85"/><path d="M60,38 A26,26 0 0 1 60,82 A26,26 0 0 1 60,38Z" fill="#FFD98A"/>'),
    support: ico('<path d="M24,78 Q40,56 60,64 Q80,56 96,78 L60,98Z" fill="#7FD6CC"/><circle cx="60" cy="40" r="14" fill="#FFD98A"/><path d="M38,66 Q60,48 82,66" stroke="#FBF4E6" stroke-width="5" fill="none" stroke-linecap="round"/>'),
    respect: ico('<path d="M60,22 L92,34 V62 Q92,86 60,100 Q28,86 28,62 V34Z" fill="#7FD6CC"/><path d="M44,60 l11,12 l22,-24" stroke="#14224A" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
  };
  V.qualityIcon = (id) => QI[id] || QI.honesty;

  /* ---------------------------------------------------------------- spotlight stage for "Make Your Case" */
  V.spotlight = () => {
    const st = new Art.Stage('night');
    st.addMarkup('extra', `<g opacity=".9"><path d="M300,0 L1300,0 L1700,900 L-100,900Z" fill="url(#glowWhite)" opacity=".10"/><path d="M800,0 L1000,0 L1100,900 L500,900Z" fill="url(#glowAmber)" opacity=".10"/></g><ellipse cx="800" cy="860" rx="700" ry="90" fill="#000" opacity=".4"/><ellipse cx="800" cy="840" rx="620" ry="70" fill="#14224A"/><ellipse cx="800" cy="836" rx="560" ry="56" fill="#1F3366"/><ellipse cx="800" cy="832" rx="520" ry="48" fill="none" stroke="#F5B544" stroke-width="3" opacity=".5"/>`);
    return st;
  };

  /* ---------------------------------------------------------------- finale: sunrise over the skyline */
  V.finalScene = () => {
    const st = new Art.Stage('night', { vignette: true });
    st.addMarkup('bg', `<defs><linearGradient id="fnSky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0B1630"/><stop offset=".45" stop-color="#34508F"/><stop offset=".72" stop-color="#FF6B57"/><stop offset="1" stop-color="#F5B544"/></linearGradient></defs><rect width="1600" height="900" fill="url(#fnSky)"/><circle cx="800" cy="700" r="320" fill="url(#glowAmber)"/><circle cx="800" cy="700" r="90" fill="#FFF1CF"/>${P.stars(21, 50, 300)}`);
    st.addMarkup('mid', `${P.skyline({ base: 820, minH: 80, maxH: 280, color: '#3a2a63', seed: 71, win: '#FFD98A', winOp: .6, density: .2 })}${P.skyline({ base: 870, minH: 60, maxH: 220, color: '#1d1c47', seed: 72, win: '#FFD98A', winOp: .8, density: .3 })}<rect y="860" width="1600" height="40" fill="#0d1233"/>`);
    st.addMarkup('fx', `<g fill="#0B1630" opacity=".7">${[[320, 220], [420, 180], [1180, 250], [1260, 200]].map(([x, y]) => `<path d="M${x},${y} q12,-14 24,0 q12,-14 24,0 q-12,6 -24,14 q-12,-8 -24,-14Z"/>`).join('')}</g>`);
    return st;
  };
})(window);
