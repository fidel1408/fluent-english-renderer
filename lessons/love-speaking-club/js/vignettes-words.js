/* Fluent English - Love Speaking Club
 * vignettes-words.js : five short animated examples for the target words.
 * Each returns { stage, bind(), play(done), reset(), freeze() }. Voices are timed with Voice.timeline.
 */
(function (g) {
  'use strict';
  const Art = g.Art, S = Art.S, f = Art.f, P = Art.P, ease = Art.ease, V = g.V, OBJ = V.OBJ, LC = g.LC;
  const frag = (m) => Art.SVGfrag(m);
  const cast = (id) => Art.Cast.make(id);
  const ik = (fig, side, x, y, hand, bend) => fig.ik(side, x, y, bend).concat(hand ? [hand] : []);
  const fxAdd = (st, markup, anim) => { const gEl = S('g'); gEl.innerHTML = markup; if (anim !== false) gEl.style.cssText = 'animation:pop .6s var(--ease) both;transform-box:fill-box;transform-origin:center'; st.layers.fx.appendChild(gEl); return gEl; };
  const sparkMarkup = (x, y, n, col) => { let m = ''; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r1 = 24, r2 = 52 + (i % 2) * 16; m += `<path d="M${f(x + Math.cos(a) * r1)},${f(y + Math.sin(a) * r1)} L${f(x + Math.cos(a) * r2)},${f(y + Math.sin(a) * r2)}" stroke="${col || '#FFD98A'}" stroke-width="5" stroke-linecap="round"/>`; } return `<g>${m}<circle cx="${x}" cy="${y}" r="90" fill="url(#glowAmber)" opacity=".85"/></g>`; };

  /* generic builder: figs = {key:{cast,x,s,pose,who}} ; script(st,F,tl,at) schedules */
  function build(cfg) {
    const st = new Art.Stage(cfg.scene, cfg.stageOpts || {});
    const F = {};
    const T = st.table ? st.table.T : (cfg.T || 700);
    for (const k in cfg.figs) {
      const c = cfg.figs[k]; const fig = cast(c.cast); F[k] = fig;
      const sc = c.s || 1.2; const oy = c.y !== undefined ? c.y : T - 170 * sc;
      st.addFigure(fig, c.x, oy, sc, c.opts); fig.set(c.pose || {});
    }
    if (cfg.setup) cfg.setup(st, F);
    const self = { stage: st, F, playing: false, done: false };
    self.bind = () => { for (const k in cfg.figs) if (cfg.figs[k].who) g.Voice.bind(cfg.figs[k].who, F[k]); };
    self.reset = () => { st.layers.fx.innerHTML = ''; for (const k in cfg.figs) { F[k].stopTalk(); F[k].set(Object.assign({ lean: 0, head: 0, yaw: 0 }, cfg.figs[k].pose || {})); } if (cfg.reset) cfg.reset(st, F); self.done = false; };
    self.freeze = () => { self.reset(); if (cfg.final) cfg.final(st, F); self.done = true; };
    self.play = (done) => {
      self.playing = true; self.reset();
      const tl = g.Voice.timeline(cfg.lines, cfg.gap == null ? 420 : cfg.gap);
      const at = (i) => tl.lines[i].at, dur = (i) => tl.lines[i].dur;
      cfg.script(st, F, tl, at, dur, ik);
      g.Voice.say(cfg.lines, { gap: cfg.gap == null ? 420 : cfg.gap });
      st.later(() => { self.playing = false; self.done = true; if (cfg.final) cfg.final(st, F); done && done(); }, tl.total + 500);
    };
    return self;
  }

  const SCENES = {};

  /* ---------------------------------------------------------------- chemistry: first conversation in a cafe */
  SCENES.chemistry = () => build({
    scene: 'cafe', lines: ['chem.1', 'chem.2', 'chem.n'],
    figs: { m: { cast: 'maya', x: 545, who: 'maya', pose: { expr: 'shy', yaw: .45, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'] } },
      a: { cast: 'alex', x: 1055, who: 'alex', pose: { expr: 'wry', yaw: -.45, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'] } } },
    script(st, F, tl, at, dur) {
      const { m, a } = F;
      st.later(() => m.pose({ expr: 'curious', aL: ik(m, 'L', -70, 96, 'open'), lean: 3, head: -3 }, 600), at(0));
      st.later(() => a.pose({ expr: 'surprised', head: 3 }, 500), at(0) + 400);
      st.later(() => { a.pose({ expr: 'delight', aR: ik(a, 'R', 60, 100, 'open'), lean: -3, head: -3 }, 600); m.pose({ expr: 'delight', aL: [20, 66, 0, 'relaxed'], lean: 4 }, 600); }, at(1));
      st.later(() => { fxAdd(st, sparkMarkup(800, 470, 12)); }, at(2) + 200);
      st.later(() => { fxAdd(st, `<g fill="none" stroke="#FFD98A" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M650,430 Q800,330 950,430"/><path d="M670,470 Q800,390 930,470" opacity=".6"/></g>`); }, at(2) + 900);
    },
    final(st, F) { F.m.set({ expr: 'delight', lean: 4, yaw: .45 }); F.a.set({ expr: 'delight', lean: -3, yaw: -.45 }); fxAdd(st, sparkMarkup(800, 470, 12), false); fxAdd(st, `<g fill="none" stroke="#FFD98A" stroke-width="4" stroke-linecap="round" opacity=".85"><path d="M650,430 Q800,330 950,430"/><path d="M670,470 Q800,390 930,470" opacity=".6"/></g>`, false); }
  });

  /* ---------------------------------------------------------------- commitment: finishing a bookshelf together */
  function shelfMarkup(stage) { // stage 0..3
    const boards = [[0, 0], [0, 1], [0, 2]]; let m = '';
    m += `<rect x="-120" y="-250" width="16" height="250" fill="#C98B4C"/><rect x="104" y="-250" width="16" height="250" fill="#C98B4C"/>`;
    if (stage >= 1) m += `<rect x="-120" y="-60" width="240" height="14" fill="#E0A862"/>`;
    if (stage >= 2) m += `<rect x="-120" y="-150" width="240" height="14" fill="#E0A862"/>`;
    if (stage >= 3) m += `<rect x="-120" y="-250" width="240" height="14" fill="#E0A862"/>${P.books(-100, -150, 7, 4)}${P.books(10, -60, 6, 9)}`;
    return m;
  }
  SCENES.commitment = () => build({
    scene: 'apartment', stageOpts: { table: { cx: 800, T: 712, w: 980, col: '#e8d8b8', front: '#7a5a3a' } }, lines: ['comm.1', 'comm.2', 'comm.n'],
    figs: { m: { cast: 'maya', x: 520, who: 'maya', pose: { expr: 'focused', yaw: .4, aL: [20, 62, 0, 'relaxed'], aR: [20, 62, 0, 'relaxed'] } },
      a: { cast: 'alex', x: 1080, who: 'alex', pose: { expr: 'tired', yaw: -.4, aL: [20, 60, 0, 'relaxed'], aR: [20, 60, 0, 'relaxed'] } } },
    setup(st, F) {
      st.shelf = S('g', { transform: 'translate(800,690)' }); st.shelf.innerHTML = shelfMarkup(1); st.layers.mid.appendChild(st.shelf);
      st.shelf.setAttribute('transform', 'translate(800,690) rotate(-5)');
      st.layers.props.appendChild(frag(`<g transform="translate(560,716)"><rect x="-60" y="-8" width="120" height="14" rx="3" fill="#C98B4C"/><rect x="-50" y="-22" width="100" height="14" rx="3" fill="#E0A862"/></g><g transform="translate(1040,718)"><circle cx="-30" cy="-4" r="5" fill="#9aa3b8"/><circle cx="-14" cy="-6" r="5" fill="#9aa3b8"/><rect x="0" y="-12" width="40" height="8" rx="3" fill="#FF6B57"/></g>`));
    },
    reset(st) { st.shelf.innerHTML = shelfMarkup(1); st.shelf.setAttribute('transform', 'translate(800,690) rotate(-5)'); },
    script(st, F, tl, at) {
      const { m, a } = F;
      st.later(() => a.pose({ expr: 'tired', aR: ik(a, 'R', 50, -40, 'relaxed'), head: 5, lean: 2 }, 700), at(0));
      st.later(() => m.pose({ expr: 'warm', aL: ik(m, 'L', -60, 100, 'open'), head: -3 }, 700), at(1));
      st.later(() => { a.pose({ expr: 'smile', aR: [20, 60, 0, 'relaxed'], head: -2, lean: -1 }, 700); st.shelf.innerHTML = shelfMarkup(2); st.shelf.setAttribute('transform', 'translate(800,690) rotate(-2)'); }, at(1) + dur0(tl, 1) * .6);
      st.later(() => { st.shelf.innerHTML = shelfMarkup(3); st.shelf.setAttribute('transform', 'translate(800,690) rotate(0)'); m.pose({ expr: 'delight', lean: 3 }, 500); a.pose({ expr: 'proud' }, 500); }, at(2) + 300);
    },
    final(st, F) { st.shelf.innerHTML = shelfMarkup(3); st.shelf.setAttribute('transform', 'translate(800,690) rotate(0)'); F.m.set({ expr: 'delight', lean: 3 }); F.a.set({ expr: 'proud' }); }
  });
  function dur0(tl, i) { return tl.lines[i].dur; }

  /* ---------------------------------------------------------------- affectionate: a scarf on a cold evening */
  SCENES.affectionate = () => build({
    scene: 'park', stageOpts: { clipY: null }, T: 700, lines: ['affe.1', 'affe.2', 'affe.n'],
    figs: { s: { cast: 'sam', x: 930, y: 640, s: 1.5, who: 'sam', pose: { expr: 'neutral', yaw: -.4, lean: -2, aL: ik0('L', 14, 110), aR: ik0('R', 14, 110) } },
      n: { cast: 'nora', x: 650, y: 650, s: 1.5, who: 'nora', pose: { expr: 'warm', yaw: .4, aL: [8, 12, 0, 'relaxed'], aR: [8, 12, 0, 'relaxed'] } } },
    setup(st, F) { st.scarf = S('g'); st.scarf.innerHTML = ''; st.layers.actors.appendChild(st.scarf); },
    script(st, F, tl, at) {
      const { s, n } = F;
      st.later(() => s.pose({ lean: -4, aL: [28, 95, 0, 'fist'], aR: [28, 95, 0, 'fist'], expr: 'sorry' }, 700), at(0) - 200);
      st.later(() => { n.pose({ expr: 'listening', head: -4 }, 600); }, at(0) + 600);
      st.later(() => { n.pose({ expr: 'warm', aR: ik(n, 'R', 150, -10, 'relaxed'), head: -4, lean: 2 }, 700); }, at(1) - 100);
      st.later(() => { st.scarf.innerHTML = `<g transform="translate(930,${640 - 10})"><path d="M-62,-4 Q0,48 62,-4 L56,34 Q0,76 -56,34Z" fill="#B5214F"/><path d="M-62,-4 Q0,48 62,-4 L56,34 Q0,76 -56,34Z" fill="url(#shadeSide)"/><path d="M-30,36 L-20,110 L6,104 L-4,40Z" fill="#9b1b46"/></g>`; s.pose({ expr: 'warm', aL: [10, 20, 0, 'relaxed'], aR: [10, 20, 0, 'relaxed'], lean: 0 }, 600); }, at(1) + 500);
      st.later(() => { n.pose({ aR: ik(n, 'R', 100, 130, 'relaxed') }, 700); s.pose({ aL: ik(s, 'L', -120, 130, 'relaxed'), expr: 'smile' }, 700); }, at(2) + 100);
      st.later(() => { fxAdd(st, `<g><circle cx="790" cy="560" r="150" fill="url(#glowAmber)" opacity=".7"/></g>`); }, at(2) + 800);
    },
    final(st, F) { F.s.set({ expr: 'smile', aL: ik(F.s, 'L', -120, 130, 'relaxed'), aR: [10, 20, 0, 'relaxed'] }); F.n.set({ expr: 'warm', aR: ik(F.n, 'R', 100, 130, 'relaxed') }); st.scarf.innerHTML = `<g transform="translate(930,630)"><path d="M-62,-4 Q0,48 62,-4 L56,34 Q0,76 -56,34Z" fill="#B5214F"/><path d="M-62,-4 Q0,48 62,-4 L56,34 Q0,76 -56,34Z" fill="url(#shadeSide)"/><path d="M-30,36 L-20,110 L6,104 L-4,40Z" fill="#9b1b46"/></g>`; fxAdd(st, `<g><circle cx="790" cy="560" r="150" fill="url(#glowAmber)" opacity=".7"/></g>`, false); },
    reset(st) { st.scarf.innerHTML = ''; }
  });
  function ik0(side, s, e) { return [s, e, 0, 'relaxed']; }

  /* ---------------------------------------------------------------- compatible: different routines, shared values */
  function lifestyleCard(x, y, kind) {
    const sun = `<circle cx="0" cy="-20" r="22" fill="#F5B544"/><path d="M-40,12 Q0,-18 40,12Z" fill="#FF6B57"/><path d="M-46,12 H46" stroke="#14224A" stroke-width="4"/>`;
    const moon = `<rect x="-60" y="-66" width="120" height="76" rx="10" fill="#14224A"/><path d="M10,-40 A26,26 0 1 0 28,-6 A20,20 0 1 1 10,-40Z" fill="#F3E7D0"/><circle cx="-24" cy="-26" r="3" fill="#FFD98A"/><circle cx="-6" cy="-8" r="2.4" fill="#FFD98A"/>`;
    return `<g transform="translate(${x},${y})"><rect x="-120" y="-90" width="240" height="180" rx="22" fill="#FBF4E6"/><rect x="-120" y="-90" width="240" height="180" rx="22" fill="url(#shadeDown)" opacity=".3"/>
      <g transform="translate(0,-12)">${kind === 'a' ? sun : moon}</g>
      <rect x="-90" y="42" width="${kind === 'a' ? 120 : 150}" height="12" rx="6" fill="${kind === 'a' ? '#FF6B57' : '#34508F'}"/><rect x="-90" y="62" width="80" height="10" rx="5" fill="#E6D4B3"/></g>`;
  }
  const link = (x1, x2, y) => `<path d="M${x1},${y} Q${(x1 + x2) / 2},${y - 70} ${x2},${y}" fill="none" stroke="#1FA8A0" stroke-width="8" stroke-linecap="round"/><circle cx="${(x1 + x2) / 2}" cy="${y - 36}" r="24" fill="#1FA8A0"/><path d="M${(x1 + x2) / 2 - 11},${y - 36} l8,9 l15,-17" stroke="#FBF4E6" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const valIcon = (x, y, k) => `<g transform="translate(${x},${y})"><circle r="46" fill="#FBF4E6"/><circle r="46" fill="url(#shadeDown)" opacity=".25"/>${k === 'check' ? '<path d="M-20,2 l14,15 l28,-30" stroke="#0E7370" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M-26,8 L0,-22 L26,8 L26,28 L-26,28Z" fill="#B5214F"/><rect x="-7" y="10" width="14" height="18" fill="#FBF4E6"/>'}</g>`;
  SCENES.compatible = () => build({
    scene: 'apartment', stageOpts: { clipY: null }, lines: ['comp.n'],
    figs: { a: { cast: 'alex', x: 430, y: 640, s: 1.4, pose: { expr: 'warm', yaw: .35, aL: [8, 12, 0, 'relaxed'], aR: [8, 12, 0, 'relaxed'] } },
      m: { cast: 'maya', x: 1170, y: 650, s: 1.4, pose: { expr: 'tired', yaw: -.35, aL: [8, 12, 0, 'relaxed'], aR: [8, 12, 0, 'relaxed'] } } },
    script(st, F, tl, at, dur) {
      const { a, m } = F; const total = tl.total;
      st.later(() => { fxAdd(st, lifestyleCard(500, 250, 'a')); a.pose({ aR: ik(a, 'R', 120, -30, 'open'), expr: 'smile' }, 600); }, 1700);
      st.later(() => { fxAdd(st, lifestyleCard(1100, 250, 'm')); m.pose({ expr: 'tired', head: 5, aL: ik(m, 'L', -60, 40, 'relaxed') }, 700); }, 3400);
      st.later(() => { fxAdd(st, link(620, 980, 260)); a.pose({ expr: 'smile', head: -2 }, 500); m.pose({ expr: 'smile', head: 2 }, 500); }, 5600);
      st.later(() => { fxAdd(st, valIcon(700, 500, 'check') + valIcon(900, 500, 'home')); a.pose({ expr: 'delight', aR: [10, 20, 0, 'relaxed'] }, 600); m.pose({ expr: 'delight', aL: [10, 20, 0, 'relaxed'], head: 0 }, 600); }, Math.max(7600, total - 3600));
    },
    final(st, F) { fxAdd(st, lifestyleCard(500, 250, 'a') + lifestyleCard(1100, 250, 'm') + link(620, 980, 260) + valIcon(700, 500, 'check') + valIcon(900, 500, 'home'), false); F.a.set({ expr: 'delight' }); F.m.set({ expr: 'delight' }); }
  });

  /* ---------------------------------------------------------------- work things out: a knot between two people */
  const KNOTS = [
    'M-150,0 C-120,-70 -80,50 -40,-40 C-10,-90 30,60 60,-30 C90,-80 120,30 150,0',
    'M-150,0 C-120,-45 -80,25 -40,-20 C-10,-50 30,35 60,-10 C90,-40 120,15 150,0',
    'M-150,0 C-120,-18 -80,8 -40,-6 C-10,-16 30,10 60,-2 C90,-12 120,5 150,0',
    'M-150,0 L150,0'];
  const ropeMarkup = (k) => `<g transform="translate(800,698)"><path d="${KNOTS[k]}" fill="none" stroke="#1b1220" stroke-width="18" stroke-linecap="round" opacity=".35" transform="translate(0,5)"/><path d="${KNOTS[k]}" fill="none" stroke="${k === 3 ? '#1FA8A0' : '#FF6B57'}" stroke-width="14" stroke-linecap="round"/><path d="${KNOTS[k]}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-dasharray="5 9" stroke-linecap="round"/></g>`;
  SCENES.workout = () => build({
    scene: 'cafe', lines: ['work.1', 'work.2', 'work.n'],
    figs: { m: { cast: 'maya', x: 545, who: 'maya', pose: { expr: 'sad', yaw: .45, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'], head: 4 } },
      a: { cast: 'alex', x: 1055, who: 'alex', pose: { expr: 'neutral', yaw: -.45, aL: [20, 66, 0, 'relaxed'], aR: [20, 66, 0, 'relaxed'] } } },
    setup(st) { st.rope = S('g'); st.rope.innerHTML = ropeMarkup(0); st.layers.props.appendChild(st.rope); },
    reset(st) { st.rope.innerHTML = ropeMarkup(0); },
    script(st, F, tl, at, dur) {
      const { m, a } = F;
      st.later(() => m.pose({ expr: 'sad', aL: ik(m, 'L', -60, 96, 'open'), head: 5 }, 600), at(0));
      st.later(() => a.pose({ expr: 'sorry', head: 4, lean: 3 }, 700), at(0) + 900);
      st.later(() => { a.pose({ expr: 'sorry', aR: ik(a, 'R', 60, 98, 'open') }, 600); st.rope.innerHTML = ropeMarkup(1); }, at(1));
      st.later(() => { m.pose({ expr: 'listening', head: 0 }, 700); st.rope.innerHTML = ropeMarkup(2); }, at(1) + dur(1) * .8);
      st.later(() => { st.rope.innerHTML = ropeMarkup(3); m.pose({ expr: 'smile', head: -2 }, 700); a.pose({ expr: 'smile', head: -2, lean: 0 }, 700); }, at(2) + 200);
    },
    final(st, F) { st.rope.innerHTML = ropeMarkup(3); F.m.set({ expr: 'smile' }); F.a.set({ expr: 'smile' }); }
  });

  V.word = (id) => (SCENES[id] || SCENES.chemistry)();
  V.wordScenes = SCENES;
})(window);
