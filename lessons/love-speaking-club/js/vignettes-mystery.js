/* Fluent English - Love Speaking Club
 * vignettes-mystery.js : "The Missing Piece" split-screen: Maya's table (left), Alex's desk (right).
 * Reveals are called by the teacher's click only.
 */
(function (g) {
  'use strict';
  const Art = g.Art, S = Art.S, f = Art.f, P = Art.P, SC = Art.SC, ease = Art.ease, V = g.V, OBJ = V.OBJ;
  const frag = (m) => Art.SVGfrag(m);
  const cast = (id) => Art.Cast.make(id);

  V.mystery = () => {
    const st = new Art.Stage('night', { vignette: true });
    const svg = st.svg;
    // ---------- left panel : the restaurant by the river
    const cafe = SC.cafe();
    const L = S('g', { 'clip-path': 'url(#mysL)' }), R = S('g', { 'clip-path': 'url(#mysR)' });
    const defs = S('defs', {}, S('clipPath', { id: 'mysL' }, S('rect', { x: 0, y: 0, width: 800, height: 900 })), S('clipPath', { id: 'mysR' }, S('rect', { x: 800, y: 0, width: 800, height: 900 })));
    st.layers.bg.appendChild(defs);
    const Lg = S('g', { transform: 'translate(-330,0)' }); Lg.innerHTML = cafe.bg; L.appendChild(Lg);
    const T = 700;
    // dim and warm-light the left panel
    L.appendChild(frag(`<rect width="800" height="900" fill="#1a0b14" opacity=".28"/>`));
    const tableL = S('g'); tableL.innerHTML = P.tableBand(330, T, 700, '#a8683c', '#5a2f22'); L.appendChild(tableL);
    // an empty chair opposite Maya + second place setting
    const chair = S('g'); chair.innerHTML = `${P.chair(600, 880, 1.15, '#6c2f2d', true)}`; L.insertBefore(chair, tableL);
    const props = S('g'); props.innerHTML = `${P.candle(450, T + 22)}${P.flowers(560, T + 22, .8)}<g transform="translate(610,${T + 14})"><ellipse rx="52" ry="10" fill="#FBF4E6"/><ellipse rx="34" ry="6" fill="#E6D4B3"/></g>`;
    L.appendChild(props);
    st.layers.fg.appendChild(frag(`<g transform="translate(300,${T + 16})"><ellipse rx="56" ry="11" fill="#FBF4E6"/><ellipse rx="36" ry="6.5" fill="#E6D4B3"/></g>`));
    st.layers.mid.appendChild(L);
    // ---------- right panel : Alex's evening
    const apt = SC.apartment();
    const Rg = S('g', { transform: 'translate(300,0)' }); Rg.innerHTML = apt.bg; R.appendChild(Rg);
    R.appendChild(frag(`<rect x="800" width="800" height="900" fill="#050a1a" opacity=".15"/>`));
    const deskG = S('g'); deskG.innerHTML = P.tableBand(1220, T + 10, 700, '#e8d8b8', '#6a4a30'); R.appendChild(deskG);
    const deskProps = S('g'); deskProps.innerHTML = `${P.laptop(1230, T + 34, 1.0, '#1F3366', true)}${P.mug(1010, T + 34, '#FF6B57', 1, true)}`; st.layers.fg.appendChild(deskProps);
    st.layers.mid.appendChild(R);
    // fog over Alex's side until Reveal 2
    const fog = S('g', { style: 'transition:opacity 1.2s' });
    fog.innerHTML = `<rect x="800" width="800" height="900" fill="#08102a" opacity=".93"/><g opacity=".5"><circle cx="1200" cy="470" r="150" fill="url(#glowTeal)"/></g><text x="1200" y="540" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="220" fill="#7FD6CC" opacity=".7">?</text>`;
    st.layers.fx.appendChild(fog);
    // divider
    st.layers.fx.appendChild(frag(`<rect x="797" y="0" width="6" height="900" fill="#F5B544" opacity=".55"/><rect x="788" y="0" width="24" height="900" fill="url(#glowAmber)" opacity=".28"/>`));
    // ---------- characters
    const M = cast('maya'), A = cast('alex');
    const sc = 1.04, oy = T - 170 * sc + 36;
    st.addFigure(M, 330, oy, sc, { clipY: T + 28 });
    M.set({ expr: 'listening', yaw: .35, aL: [20, 60, 0, 'relaxed'], aR: [20, 60, 0, 'relaxed'], ey: .1 });
    st.addFigure(A, 1220, oy + 10, sc, { clipY: T + 38 });
    A.set({ expr: 'focused', yaw: -.15, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'], lean: 4 });
    const phoneM = OBJ.phone(false, '#1F3366');
    // envelope flight path
    const env = S('g', { style: 'opacity:0' }); env.innerHTML = `<g><rect x="-34" y="-22" width="68" height="44" rx="6" fill="#FBF4E6"/><path d="M-34,-18 L0,6 L34,-18" fill="none" stroke="#B5214F" stroke-width="4"/></g>`;
    st.layers.fx.appendChild(env);
    const arc = (t) => { const x0 = 1180, y0 = 360, x1 = 420, y1 = 360, cx = 800, cy = 130; const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; return [a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1]; };

    const api = { stage: st, M, A };
    api.bind = () => { g.Voice.bind('maya', M); g.Voice.bind('alex', A); };
    api.setup = () => { fog.style.opacity = 1; env.style.opacity = 0; M.detach('R'); M.set({ expr: 'listening', yaw: .35, head: 0, aL: [20, 60, 0, 'relaxed'], aR: [20, 60, 0, 'relaxed'], ey: .1 }); };
    api.fly = (done) => {
      env.style.opacity = 1; const tw = { dur: 1500, ease: ease.inOut, update: (e) => { const [x, y] = arc(e); env.setAttribute('transform', `translate(${f(x)},${f(y)}) scale(${f(1 - e * .3)})`); }, done: () => { env.style.opacity = 0; done && done(); } };
      Art.Anim.add(tw);
    };
    api.r1 = (done) => { // phone buzzes; message arrives
      M.pose({ expr: 'curious', head: -4 }, 500);
      api.fly(() => { M.attach('R', OBJ.phone(true, '#1F3366'), 0, 0, 0); M.pose({ aR: M.ik('R', 40, 40, 'relaxed').concat(['relaxed']), ey: .9, expr: 'concerned', head: 6 }, 800); done && done(); });
    };
    api.r2 = () => { fog.style.opacity = 0; A.pose({ expr: 'tired', aL: A.ik('L', -36, 152).concat(['relaxed']), aR: A.ik('R', 36, 152).concat(['relaxed']), lean: 6, head: 3, ey: .4 }, 900); };
    api.r3 = () => { M.pose({ expr: 'thinking', head: -3 }, 700); A.pose({ expr: 'thinking', lean: 2, head: 3 }, 700); };
    api.freeze = (n) => { // n = number of reveals shown
      api.setup(); fog.style.transition = 'none';
      if (n >= 1) { M.attach('R', OBJ.phone(true, '#1F3366'), 0, 0, 0); M.set({ aR: M.ik('R', 40, 40).concat(['relaxed']), ey: .9, expr: 'concerned', head: 6 }); }
      if (n >= 2) { fog.style.opacity = 0; A.set({ expr: 'tired', aL: A.ik('L', -36, 152).concat(['relaxed']), aR: A.ik('R', 36, 152).concat(['relaxed']), lean: 6, head: 3, ey: .4 }); }
      if (n >= 3) { M.set({ expr: 'thinking', head: -3 }); A.set({ expr: 'thinking', lean: 2, head: 3 }); }
      setTimeout(() => { fog.style.transition = 'opacity 1.2s'; }, 50);
    };
    return api;
  };
})(window);
