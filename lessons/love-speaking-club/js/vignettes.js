/* Fluent English - Love Speaking Club
 * vignettes.js : animated scenes (the opening, vocabulary mini-scenes, the mystery) and supporting illustrations.
 * Characters are original and fictional. They are only ever *observed* by learners - nobody plays them.
 */
(function (g) {
  'use strict';
  const Art = g.Art, S = Art.S, f = Art.f, Anim = Art.Anim, P = Art.P, PAL = Art.PAL, ease = Art.ease, LC = g.LC;
  const V = {};
  const frag = (m) => Art.SVGfrag(m);
  const cast = (id, over) => Art.Cast.make(id, over);

  /* ------------------------------------------------------------ hand-held objects (origin = wrist) */
  const OBJ = {
    bag() { return frag(`<g transform="translate(0,34) rotate(-4)"><path d="M-30,-6 L30,-6 L34,56 L-34,56Z" fill="#E7C28A"/><path d="M-30,-6 L30,-6 L34,56 L-34,56Z" fill="url(#shadeSide)"/><path d="M-30,-6 L-18,-18 L18,-18 L30,-6Z" fill="#d6aa6c"/><rect x="-20" y="-30" width="40" height="14" fill="#0E7370" transform="rotate(-6)"/><rect x="-20" y="-30" width="40" height="14" fill="url(#shadeSide)" transform="rotate(-6)"/><path d="M-30,18 L30,18" stroke="#fff" stroke-opacity=".28"/><path d="M-6,-6 L0,10 L6,-6" fill="#B5214F"/><circle cx="0" cy="12" r="4" fill="#B5214F"/></g>`); },
    mug(col) { return frag(`<g transform="translate(0,30) scale(.62)">${P.mug(0, 34, col || '#FBF4E6', 1, false)}</g>`); },
    phone(on, col) { return frag(`<g transform="translate(0,30) rotate(8) scale(.72)">${P.phone(0, 0, 0, 1, on !== false, col || '#1F3366')}</g>`); },
    cards() { return frag(`<g transform="translate(0,34)"><rect x="-24" y="-26" width="46" height="62" rx="4" fill="#F3E7D0" transform="rotate(-14)"/><rect x="-22" y="-28" width="46" height="62" rx="4" fill="#FBF4E6" transform="rotate(-2)"/><rect x="-22" y="-28" width="46" height="62" rx="4" fill="#FFFFFF" transform="rotate(10)"/><path d="M-12,-8 H12 M-12,2 H12 M-12,12 H6" stroke="#8d96b8" stroke-width="3" transform="rotate(10)"/></g>`); },
    book(col) { return frag(`<g transform="translate(0,34) rotate(-6)"><rect x="-26" y="-34" width="52" height="68" rx="3" fill="${col || '#B5214F'}"/><rect x="-26" y="-34" width="52" height="68" rx="3" fill="url(#shadeSide)"/><rect x="-20" y="-24" width="40" height="8" fill="#FBF4E6" opacity=".85"/></g>`); },
    scarf() { return frag(`<g transform="translate(0,20)"><path d="M-30,-4 Q0,10 30,-4 L26,12 Q0,26 -26,12Z" fill="#B5214F"/></g>`); }
  };
  V.OBJ = OBJ;

  /* thought bubble / sparkle helpers (placed in the stage fx layer) */
  function fx(st, markup, anim) { const g = S('g', { class: 'fxitem' }); g.innerHTML = markup; if (anim !== false) { g.style.cssText = 'animation:pop .6s var(--ease) both;transform-box:fill-box;transform-origin:center'; } st.layers.fx.appendChild(g); return g; }
  const bubbleIcon = {
    book: `<g transform="translate(-26,-18)"><path d="M0,6 Q26,-6 52,6 L52,44 Q26,32 0,44Z" fill="#FBF4E6" stroke="#B5214F" stroke-width="3"/><path d="M26,0 L26,38" stroke="#B5214F" stroke-width="3"/><path d="M8,16 Q17,12 22,16 M8,26 Q17,22 22,26 M30,16 Q35,12 44,16 M30,26 Q35,22 44,26" stroke="#8d96b8" stroke-width="2.4" fill="none"/></g>`,
    tea: `<g transform="translate(-24,-22)"><path d="M0,10 L40,10 L36,44 Q20,52 4,44Z" fill="#FBF4E6" stroke="#B5214F" stroke-width="3"/><path d="M40,16 Q56,16 52,32 Q48,40 38,38" fill="none" stroke="#B5214F" stroke-width="3"/><path d="M12,2 q-5,-6 0,-12 M22,2 q-5,-6 0,-12" stroke="#B5214F" stroke-width="3" fill="none" stroke-linecap="round"/></g>`
  };
  function thought(st, x, y, icon, tail) {
    const tx = tail ? tail[0] : x - 60, ty = tail ? tail[1] : y + 80;
    return fx(st, `<g><circle cx="${f(tx + (x - tx) * .12)}" cy="${f(ty + (y - ty) * .12)}" r="9" fill="#FBF4E6" opacity=".95"/><circle cx="${f(tx + (x - tx) * .38)}" cy="${f(ty + (y - ty) * .38)}" r="15" fill="#FBF4E6" opacity=".95"/>
      <g transform="translate(${x},${y})"><ellipse rx="86" ry="62" fill="#FBF4E6"/><ellipse cx="-50" cy="-30" rx="38" ry="30" fill="#FBF4E6"/><ellipse cx="46" cy="-34" rx="40" ry="30" fill="#FBF4E6"/><ellipse cx="62" cy="14" rx="36" ry="30" fill="#FBF4E6"/><ellipse cx="-62" cy="18" rx="34" ry="28" fill="#FBF4E6"/>
      <ellipse rx="86" ry="62" fill="url(#shadeDown)" opacity=".25"/>${bubbleIcon[icon] || ''}</g></g>`);
  }
  function sparks(st, x, y, n, col) {
    let m = ''; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r1 = 22, r2 = 46 + (i % 2) * 14; m += `<path d="M${f(x + Math.cos(a) * r1)},${f(y + Math.sin(a) * r1)} L${f(x + Math.cos(a) * r2)},${f(y + Math.sin(a) * r2)}" stroke="${col || '#FFD98A'}" stroke-width="5" stroke-linecap="round"/>`; }
    return fx(st, `<g>${m}<circle cx="${x}" cy="${y}" r="70" fill="url(#glowAmber)" opacity=".8"/></g>`);
  }

  /* ------------------------------------------------------------ backdrops (no characters) */
  V.backdrop = (name, o) => { const st = new Art.Stage(name, Object.assign({ label: '' }, o || {})); return st; };

  /* a helper to add a figure with pose and idle */
  function put(st, fig, x, y, s, pose, opts) { st.addFigure(fig, x, y, s, opts); if (pose) fig.set(pose); return fig; }
  const ik = (fig, side, x, y, hand, bend) => fig.ik(side, x, y, bend).concat(hand ? [hand] : []);

  /* ============================================================ OPENING (4 vignettes x 5.5 s) */
  const OPEN = [];

  /* 1. remembering someone's interests: park, a wrapped book that was mentioned weeks ago */
  OPEN.push(() => {
    const st = new Art.Stage('park', { clipY: null }); const A = cast('alex'), M = cast('maya');
    const bag = OBJ.bag();
    put(st, A, 500, 668, 1.42, { expr: 'warm', yaw: .5, head: 3, aL: [7, 8, 0, 'relaxed'], aR: ik(A, 'R', 70, 150, 'relaxed') });
    put(st, M, 1090, 668, 1.42, { expr: 'listening', yaw: -.5, head: -2, aL: [6, 14, 0, 'relaxed'], aR: [6, 14, 0, 'relaxed'] });
    A.attach('R', bag, 0, 0, 0);
    st.run = () => {
      st.later(() => A.pose({ aR: ik(A, 'R', 178, 118, 'cup'), lean: 2, expr: 'smile' }, 900, ease.out), 600);
      st.later(() => M.pose({ expr: 'surprised', aL: ik(M, 'L', -150, 120, 'open'), head: -5 }, 700), 1500);
      st.later(() => { thought(st, 660, 330, 'book', [560, 440]); }, 2000);
      st.later(() => M.pose({ expr: 'delight', head: -7 }, 600), 2900);
      st.later(() => { A.detach('R'); M.attach('L', OBJ.bag(), 0, 0, 0); A.pose({ aR: [8, 20, 0, 'relaxed'], expr: 'proud' }, 700); M.pose({ aL: ik(M, 'L', -44, 78, 'cup'), aR: ik(M, 'R', 30, 96, 'cup'), expr: 'delight', head: -3 }, 900, ease.out); }, 3700);
      st.later(() => { sparks(st, 800, 430, 10); }, 4300);
    };
    return st;
  });

  /* 2. supporting a goal: apartment, rehearsing a presentation */
  OPEN.push(() => {
    const st = new Art.Stage('apartment', { clipY: null }); const Pr = cast('priya'), Le = cast('leo');
    put(st, Pr, 560, 660, 1.4, { expr: 'focused', yaw: .2, aL: ik(Pr, 'L', -60, 96, 'relaxed'), aR: ik(Pr, 'R', 80, 80, 'relaxed') });
    put(st, Le, 1080, 690, 1.4, { expr: 'listening', yaw: -.5, head: 3, aL: ik(Le, 'L', -40, 110, 'relaxed'), aR: [10, 40, 0, 'relaxed'] });
    Pr.attach('L', OBJ.cards(), 0, 0, 0);
    st.run = () => {
      st.later(() => Pr.startTalk(() => .35 + .5 * Math.abs(Math.sin(performance.now() / 130))), 300);
      st.later(() => Pr.pose({ aR: ik(Pr, 'R', 130, 70, 'open'), expr: 'focused', head: 2 }, 700), 700);
      st.later(() => { Pr.stopTalk(); Pr.pose({ expr: 'sorry', aR: ik(Pr, 'R', 50, -70, 'relaxed'), head: 5, ey: .8 }, 700); }, 1900);
      st.later(() => Le.pose({ expr: 'warm', lean: 4, aR: ik(Le, 'R', 150, 40, 'thumbs'), head: 3 }, 800), 2400);
      st.later(() => Pr.pose({ expr: 'smile', aR: ik(Pr, 'R', 120, 60, 'open'), head: -2, ey: 0 }, 800), 3400);
      st.later(() => { Pr.startTalk(() => .3 + .5 * Math.abs(Math.sin(performance.now() / 140))); Le.pose({ aR: ik(Le, 'R', 70, 100, 'relaxed'), expr: 'proud' }, 600); }, 4000);
      st.later(() => Pr.stopTalk(), 5200);
    };
    return st;
  });

  /* 3. laughing together: cafe */
  OPEN.push(() => {
    const st = new Art.Stage('cafe'); const Sm = cast('sam'), No = cast('nora');
    const T = st.table.T, sc = 1.38, oy = T - 170 * sc;
    put(st, No, 555, oy, sc, { expr: 'warm', yaw: .45, aL: ik(No, 'L', -60, 150, 'relaxed'), aR: ik(No, 'R', 40, 160, 'relaxed') });
    put(st, Sm, 1045, oy, sc, { expr: 'warm', yaw: -.45, aL: ik(Sm, 'L', -40, 160, 'relaxed'), aR: ik(Sm, 'R', 60, 150, 'relaxed') });
    const shake = (fig, amp, n) => { let k = 0; const step = () => { if (k++ > n) { fig.set({ lean: 0 }); return; } fig.set({ lean: (k % 2 ? 1 : -1) * amp }); st.later(step, 110); }; step(); };
    st.run = () => {
      st.later(() => { No.pose({ expr: 'laugh', head: -6, aL: ik(No, 'L', -30, 40, 'relaxed') }, 500); No.fakeLaugh = true; }, 700);
      st.later(() => { Sm.pose({ expr: 'laugh', head: 6, lean: -4 }, 500); }, 1200);
      st.later(() => { shake(No, 1.8, 14); shake(Sm, 2.2, 14); }, 1700);
      st.later(() => { Sm.pose({ aR: ik(Sm, 'R', 90, 140, 'flat') }, 300); }, 2100);
      st.later(() => { sparks(st, 800, 560, 12, '#FFD98A'); }, 2600);
      st.later(() => { Sm.pose({ aR: ik(Sm, 'R', 60, 150, 'relaxed'), lean: 0 }, 600); No.pose({ expr: 'smile', head: -3 }, 700); }, 4300);
    };
    return st;
  });

  /* 4. listening carefully: balcony, phone face down */
  OPEN.push(() => {
    const st = new Art.Stage('balcony'); const A = cast('alex'), M = cast('maya');
    const oy = 640 - 170 * 1.4;
    put(st, M, 540, oy, 1.4, { expr: 'concerned', yaw: .45, head: 3, aL: ik(M, 'L', -50, 100, 'open'), aR: ik(M, 'R', 70, 90, 'relaxed') });
    put(st, A, 1060, oy, 1.4, { expr: 'neutral', yaw: -.15, aL: ik(A, 'L', -40, 150, 'relaxed'), aR: ik(A, 'R', 50, 108, 'relaxed') });
    A.attach('R', OBJ.phone(true), 0, 0, 0);
    st.run = () => {
      st.later(() => M.startTalk(() => .3 + .5 * Math.abs(Math.sin(performance.now() / 140))), 200);
      st.later(() => M.pose({ aL: ik(M, 'L', -90, 60, 'open'), aR: ik(M, 'R', 110, 70, 'open'), head: 5 }, 900), 600);
      st.later(() => A.pose({ aR: ik(A, 'R', 20, 154, 'relaxed') }, 700), 1000);
      st.later(() => { A.detach('R'); st.layers.props.appendChild(frag(`<g transform="translate(1010,628) rotate(8)"><rect x="-26" y="-6" width="52" height="12" rx="4" fill="#10162a"/><rect x="-26" y="-6" width="52" height="12" rx="4" fill="url(#shadeDown)"/></g>`)); A.pose({ aR: ik(A, 'R', 60, 150, 'relaxed'), lean: 5, yaw: -.5, expr: 'listening' }, 800); }, 1800);
      st.later(() => A.pose({ head: 4 }, 600), 3000);
      st.later(() => A.pose({ head: -2 }, 600), 3800);
      st.later(() => { M.stopTalk(); M.pose({ expr: 'warm', head: 2, aL: ik(M, 'L', -70, 110, 'relaxed') }, 900); A.pose({ expr: 'warm' }, 800); }, 4300);
    };
    return st;
  });
  V.opening = OPEN;

  g.V = V;
})(window);
