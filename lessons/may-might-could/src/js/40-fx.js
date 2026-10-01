/* 40-fx: code-drawn explainers (possibility fork, trio, builder, time axis, pronunciation, summary) */
(function () {
  'use strict';
  const FE = window.FE, { h } = FE;
  const FX = (FE.FX = {});

  /* ---------- icon library (viewBox 0 0 100 100) ---------- */
  const cl = (f = '#fff', s = '#8fa3c0', x = 0, y = 0, k = 1) => `<g transform="translate(${x},${y}) scale(${k})"><path d="M26 66h50a15 15 0 0 0 1-30 20 20 0 0 0-38-6 17 17 0 0 0-13 36z" fill="${f}" stroke="${s}" stroke-width="3" stroke-linejoin="round"/></g>`;
  const sunSvg = (x = 50, y = 50, r = 17) => `<g transform="translate(${x},${y})"><circle r="${r}" fill="#ffc933" stroke="#e69a00" stroke-width="3"/>${Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${-r - 6}" x2="0" y2="${-r - 15}" stroke="#e69a00" stroke-width="4" stroke-linecap="round" transform="rotate(${i * 45})"/>`).join('')}</g>`;
  const person = (c, skin) => `<circle cx="50" cy="36" r="15" fill="${skin}" stroke="#3b2a1f" stroke-width="2.5"/><path d="M20 86c0-20 14-30 30-30s30 10 30 30z" fill="${c}" stroke="#3b2a1f" stroke-width="2.5"/>`;
  const van = (c) => `<path d="M10 66V40a6 6 0 0 1 6-6h40a6 6 0 0 1 5 3l14 17h8a6 6 0 0 1 6 6v6z" fill="${c}" stroke="#1d2a44" stroke-width="3" stroke-linejoin="round"/><path d="M56 40l10 14H46V40z" fill="#cfe8ff" stroke="#1d2a44" stroke-width="2.5"/><circle cx="30" cy="70" r="9" fill="#2b2f3a" stroke="#fff" stroke-width="3"/><circle cx="72" cy="70" r="9" fill="#2b2f3a" stroke="#fff" stroke-width="3"/>`;
  const clock = `<circle cx="50" cy="50" r="30" fill="#fff" stroke="#1d2a44" stroke-width="4"/>${Array.from({ length: 12 }, (_, i) => `<line x1="50" y1="24" x2="50" y2="29" stroke="#1d2a44" stroke-width="3" transform="rotate(${i * 30} 50 50)"/>`).join('')}<path d="M50 50V32M50 50l13 8" stroke="#1d2a44" stroke-width="4" stroke-linecap="round"/>`;
  FE.ICON = {
    cloud: () => cl('#8a96ab', '#5b667c', 0, 4, 1.05),
    rain: () => cl('#8a96ab', '#5b667c', 0, -6) + `<g stroke="#3d7fe0" stroke-width="4" stroke-linecap="round"><path d="M34 70l-5 12M50 70l-5 12M66 70l-5 12"/></g>`,
    sun: () => sunSvg(),
    sunCloud: () => sunSvg(40, 40, 15) + cl('#fff', '#9db0c9', 8, 12, 0.85),
    umbrella: () => `<path d="M50 20C26 22 14 42 14 56h72C86 42 74 22 50 20z" fill="#3c5fa8" stroke="#1d2a44" stroke-width="3"/><path d="M50 56v26a8 8 0 0 1-16 0" fill="none" stroke="#1d2a44" stroke-width="4" stroke-linecap="round"/>`,
    van: () => van('#e8943a'), vanLate: () => van('#e8943a') + `<g transform="translate(62,6) scale(.45)">${clock}</g>`,
    vanStuck: () => van('#e8943a') + `<g transform="translate(0,0)"><rect x="82" y="24" width="12" height="30" rx="5" fill="#1d2a44"/><circle cx="88" cy="32" r="3.6" fill="#e8483a"/><circle cx="88" cy="43" r="3.6" fill="#555"/></g>`,
    guest: () => person('#2f6fb0', '#e9b894'), absent: () => `<g opacity=".55" stroke-dasharray="6 5">${person('#c9d3e3', '#e6e9f0').replace(/stroke="#3b2a1f"/g, 'stroke="#7a859c"')}</g>`,
    phone: () => `<rect x="30" y="10" width="40" height="80" rx="9" fill="#1b2230" stroke="#0c111a" stroke-width="3"/><rect x="35" y="20" width="30" height="56" rx="4" fill="#7fd4ff"/><path d="M40 34h20M40 46h14M40 58h20" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
    clock: () => clock, door: () => `<rect x="24" y="10" width="52" height="82" rx="4" fill="#5b7a8a" stroke="#1d2a44" stroke-width="3"/><circle cx="66" cy="54" r="4.5" fill="#d8b86a"/><rect x="32" y="20" width="36" height="28" rx="3" fill="#4d6a79"/>`,
    train: () => `<rect x="20" y="16" width="60" height="62" rx="12" fill="#d9dee6" stroke="#1d2a44" stroke-width="3"/><rect x="28" y="26" width="44" height="22" rx="5" fill="#27384f"/><circle cx="34" cy="62" r="5" fill="#ffe27a"/><circle cx="66" cy="62" r="5" fill="#ffe27a"/><path d="M26 84h48M34 78l-8 12M66 78l8 12" stroke="#1d2a44" stroke-width="4" stroke-linecap="round"/>`,
    plane: () => `<path d="M10 52l30-8-14-26h8l26 24 24-6a6 6 0 0 1 3 12l-24 8 8 24h-8L44 62 14 66z" fill="#eef2f7" stroke="#1d2a44" stroke-width="3" stroke-linejoin="round"/>`,
    tent: () => `<path d="M10 84L50 20l40 64z" fill="#f4efe4" stroke="#1d2a44" stroke-width="3" stroke-linejoin="round"/><path d="M50 20v64M30 84l20-34 20 34" fill="none" stroke="#1d2a44" stroke-width="3"/>`,
    house: () => `<path d="M12 50L50 18l38 32v34H12z" fill="#f0d9b0" stroke="#1d2a44" stroke-width="3" stroke-linejoin="round"/><rect x="42" y="56" width="16" height="28" fill="#8d6139"/>`,
    tray: () => `<ellipse cx="50" cy="66" rx="40" ry="10" fill="#cfd6dd" stroke="#1d2a44" stroke-width="3"/><path d="M18 62c0-24 64-24 64 0z" fill="#e8eef3" stroke="#1d2a44" stroke-width="3"/><circle cx="50" cy="32" r="5" fill="#1d2a44"/>`,
    check: () => `<circle cx="50" cy="50" r="34" fill="#16a36a"/><path d="M33 52l12 12 23-26" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
    cross: () => `<circle cx="50" cy="50" r="34" fill="#d64545"/><path d="M36 36l28 28M64 36L36 64" stroke="#fff" stroke-width="9" stroke-linecap="round"/>`,
    qmark: () => `<circle cx="50" cy="50" r="34" fill="#f2b84b"/><path d="M38 40a12 12 0 1 1 18 10c-5 3-6 6-6 11" fill="none" stroke="#1d2a44" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="75" r="5" fill="#1d2a44"/>`,
    stop: () => `<circle cx="50" cy="50" r="34" fill="#d64545"/><rect x="28" y="43" width="44" height="14" rx="3" fill="#fff"/>`,
    msg: () => `<path d="M14 22h72a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H48L30 88V70H14a6 6 0 0 1-6-6V28a6 6 0 0 1 6-6z" fill="#fff" stroke="#1d2a44" stroke-width="3" stroke-linejoin="round"/><path d="M26 40h48M26 54h32" stroke="#6b7596" stroke-width="5" stroke-linecap="round"/>`,
    bus: () => `<rect x="12" y="22" width="76" height="52" rx="10" fill="#3b8a5a" stroke="#1d2a44" stroke-width="3"/><rect x="20" y="30" width="60" height="20" rx="4" fill="#cfe8ff"/><circle cx="30" cy="76" r="8" fill="#2b2f3a" stroke="#fff" stroke-width="3"/><circle cx="70" cy="76" r="8" fill="#2b2f3a" stroke="#fff" stroke-width="3"/>`,
    table: () => `<ellipse cx="50" cy="40" rx="38" ry="12" fill="#fff" stroke="#1d2a44" stroke-width="3"/><path d="M50 52v32M34 88h32" stroke="#1d2a44" stroke-width="5" stroke-linecap="round"/><circle cx="36" cy="34" r="6" fill="#e8685b"/><circle cx="58" cy="36" r="6" fill="#f2b84b"/>`,
    cake: () => `<rect x="22" y="48" width="56" height="34" rx="6" fill="#f0c8a0" stroke="#1d2a44" stroke-width="3"/><path d="M22 58c10 8 16-4 28 4s18-2 28 4" fill="none" stroke="#fff" stroke-width="5"/><path d="M50 48V32" stroke="#1d2a44" stroke-width="3"/><path d="M50 22c6 6 0 10 0 10s-6-4 0-10z" fill="#ff9a2e"/>`,
  };
  FE.icon = (name, size = 96, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${(FE.ICON[name] || FE.ICON.qmark)()}</svg>`;

  /* ---------- overlay plumbing ---------- */
  FX.panel = (X, o) => {
    const fx = FE.$('#fx');
    if (o.id) { const old = FE.$('#fx_' + o.id); if (old) old.remove(); }
    const p = h('div', { class: 'card fxp ' + (o.cls || ''), id: o.id ? 'fx_' + o.id : null }, o.html);
    p.style.cssText = `left:${o.x}px;top:${o.y}px;${o.w ? 'width:' + o.w + 'px;' : ''}${o.style || ''}`;
    fx.appendChild(p);
    if (FE.Tween.instant) p.classList.add('in', 'noanim'); else requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('in')));
    if (!FE.Tween.instant) FE.Audio.sfx(o.sfx || 'pop');
    return p;
  };
  FX.clear = (X, id) => {
    const fx = FE.$('#fx'); if (!fx) return;
    if (!id || /^fork/.test(id)) FX.stepForward(X);
    (id ? FE.$$('#fx_' + id, fx) : FE.$$('.fxp', fx)).forEach((e) => { if (FE.Tween.instant) e.remove(); else { e.classList.remove('in'); setTimeout(() => e.remove(), 400); } });
  };
  FX.show = (X, id, delay = 0) => { const e = FE.$('#fx_' + id); if (e) setTimeout(() => e.classList.add('in'), FE.Tween.instant ? 0 : delay); };
  FX.step = (X, sel, on = true) => FE.$$(sel).forEach((e) => e.classList.toggle('in', on));
  FX.caption = (X, text, o = {}) => FX.panel(X, { id: o.id || 'caption', x: o.x != null ? o.x : 360, y: o.y != null ? o.y : 150, w: o.w, cls: 'cap ' + (o.cls || ''), html: `<div class="ctr ${o.size || 'mid'}">${FE.U(text)}</div>` + (o.sub ? `<div class="note" style="margin-top:6px">${FE.U(o.sub)}</div>` : ''), sfx: 'pop' });

  /* ---------- possibility fork ----------
     o: {x,y,w, evidence:{icon,label}, branches:[{icon,text,tone}], certain:false, title} */
  FX.fork = (X, o) => {
    const n = o.branches.length, W = o.w || 1380, H = o.h || 520, x0 = 150, y0 = H / 2;
    const rowH = (H - 60) / n;
    let svg = '', cards = '';
    o.branches.forEach((b, i) => {
      const cy = 30 + rowH * i + rowH / 2, cx = 520;
      const d = o.certain ? `M${x0 + 70},${y0} L${cx},${y0}` : `M${x0 + 70},${y0} C${x0 + 220},${y0} ${cx - 150},${cy} ${cx},${cy}`;
      svg += `<path class="br" d="${d}" fill="none" stroke="${b.tone === 'no' ? '#b84308' : '#1d4ed8'}" stroke-width="7" stroke-linecap="round" ${o.certain ? '' : 'stroke-dasharray="4 16"'} style="transition-delay:${0.5 + i * 0.4}s"/>`;
      cards += `<div class="oc" style="top:${cy - rowH / 2 + 8}px;height:${rowH - 16}px;transition-delay:${1 + i * 0.4}s"><div class="oci">${FE.icon(b.icon, Math.min(128, rowH - 20))}</div><div class="ocs ${o.certain ? 'solid' : ''}">${FE.U(b.text)}</div></div>`;
    });
    const ev = o.evidence ? `<div class="evn"><div class="evi">${FE.icon(o.evidence.icon, 128)}</div>${o.evidence.label ? `<div class="evl">${FE.U(o.evidence.label)}</div>` : ''}</div>` : '';
    const html = `<div class="fork" style="height:${H}px;width:${W}px"><svg class="fsv" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>${ev}<div class="ocs-wrap">${cards}</div>${o.certain ? '<div class="stamp">' + FE.icon('check', 70) + '</div>' : ''}</div>`;
    const pn = FX.panel(X, { id: o.id || 'fork', x: o.x != null ? o.x : 280, y: o.y != null ? o.y : 250, cls: 'forkcard', html, sfx: 'whoosh' });
    FX.stepBack(X, pn);
    return pn;
  };
  /* the characters step back (smaller, feet fixed) so a card never covers a head; restored when the card goes */
  const BACK = 0.8;
  FX.stepBack = (X, pn) => {
    const S = X && X.S; if (!S || !S.chars) return;
    let minTop = 1e9;
    Object.values(S.chars).forEach((c) => {
      if (c._sBase == null) c._sBase = c.P.s;
      const a = c.anchor(), top = S.toScreen(a.x, a.top).y, feet = S.toScreen(a.x, c.P.y).y;
      minTop = Math.min(minTop, feet - (feet - top) * (BACK * c._sBase / c.P.s));
      FE.Tween.to(c.P, { s: c._sBase * BACK }, 0.7, 'inOut');
    });
    const room = minTop - 16 - pn.offsetTop, k = Math.max(0.8, Math.min(1, room / pn.offsetHeight));
    pn.style.setProperty('--k', k.toFixed(3));
  };
  FX.stepForward = (X) => {
    const S = X && X.S; if (!S || !S.chars) return;
    Object.values(S.chars).forEach((c) => { if (c._sBase != null) { FE.Tween.to(c.P, { s: c._sBase }, 0.6, 'inOut'); c._sBase = null; } });
  };

  /* ---------- modal trio ---------- */
  FX.trio = (X, o) => {
    const rows = o.rows;
    const html = `<h3>${FE.U(o.title || 'Same possibility')}</h3>` + rows.map((r, i) => `<div class="trow" style="transition-delay:${0.3 + i * 0.35}s"><span class="tdot">${FE.icon(o.icon || 'sunCloud', 64)}</span><span class="ub mid">${FE.U(r)}</span></div>`).join('');
    return FX.panel(X, { id: 'trio', x: o.x || 420, y: o.y || 300, w: o.w || 1080, cls: 'triocard', html });
  };

  /* ---------- time axis ---------- */
  FX.timeAxis = (X, o) => {
    const cues = o.cues || ['right now', 'at the moment', 'today', 'tonight', 'tomorrow', 'next week'];
    const html = `<h3>${FE.U('Time cues')}</h3><div class="axis"><div class="ax-line"></div><div class="ax-now">${FE.U('now')}</div><div class="ax-later">${FE.U('later')}</div>${cues.map((c, i) => `<div class="ax-cue" style="left:${6 + i * (88 / (cues.length - 1))}%;transition-delay:${0.2 + i * 0.25}s"><span class="chip t"><span>${FE.U(c)}</span></span></div>`).join('')}</div>` + (o.sentences ? `<div class="ax-s">${o.sentences.map((s, i) => `<div class="trow" style="transition-delay:${1.8 + i * 0.5}s">${FE.UB(s, 'sm')}</div>`).join('')}</div>` : '');
    return FX.panel(X, { id: 'axis', x: o.x || 240, y: o.y || 300, w: o.w || 1440, cls: 'axiscard', html });
  };

  /* ---------- sentence builder (animated explainer) ----------
     o: {parts:[{t,role}], intruder:{t,why}, subjects:[...]} */
  FX.builder = (X, o) => {
    const html = `<h3>${FE.U(o.title || 'Build it')}</h3><div class="legend"><span class="lg" style="color:var(--subj);border-color:var(--subj)">${FE.U('who')}</span><span class="lg" style="color:var(--modal);border-color:var(--modal)">${FE.U('modal')}</span><span class="lg" style="color:var(--neg);border-color:var(--neg);border-style:dashed">${FE.U('not')}</span><span class="lg" style="color:var(--verb);border-color:var(--verb)">${FE.U('base verb')}</span></div>
      <div class="brow">${o.parts.map((p, i) => `<span class="chip ${p.role}" data-i="${i}" style="transition-delay:${0.2 + i * 0.35}s"><span class="ub">${FE.U(`{${p.role}:${p.t}}`)}</span></span>`).join('')}</div><div class="bnote note"></div>`;
    return FX.panel(X, { id: 'builder', x: o.x || 300, y: o.y || 330, w: o.w || 1320, cls: 'buildcard', html });
  };
  /* swap one chip's text (e.g. subject) with a small bounce */
  FX.chipSet = (X, i, text, role) => {
    const c = FE.$(`#fx_builder .chip[data-i="${i}"]`); if (!c) return;
    c.innerHTML = `<span class="ub">${FE.U(`{${role}:${text}}`)}</span>`; c.classList.remove('pulse'); void c.offsetWidth; if (!FE.Tween.instant) c.classList.add('pulse');
    if (!FE.Tween.instant) FE.Audio.sfx('snap');
  };
  /* an unwanted token flies toward the verb, hits a shield and is rejected */
  FX.reject = (X, o) => {
    const b = FE.$('#fx_builder'); if (!b) return;
    const row = FE.$('.brow', b);
    const t = h('span', { class: 'intr' + (FE.Tween.instant ? ' done' : '') }, `<span class="ub">${FE.U(`{n:${o.t}}`)}</span><span class="x">${FE.icon('cross', 44)}</span>`);
    t.style.left = (o.at != null ? o.at : 640) + 'px'; row.appendChild(t);
    FE.$('.bnote', b).innerHTML = FE.U(o.note || '');
    if (!FE.Tween.instant) { FE.Audio.sfx('reject'); setTimeout(() => t.classList.add('done'), 1500); }
  };
  FX.chipsClear = (X) => { const b = FE.$('#fx_builder'); if (b) { FE.$$('.intr', b).forEach((e) => e.remove()); FE.$('.bnote', b).innerHTML = ''; } };

  /* ---------- pronunciation cards ---------- */
  FX.pron = (X, o) => {
    const cards = o.words.map((w, i) => `<button class="pcard" data-key="${w.key || ''}" aria-label="replay" style="transition-delay:${0.2 + i * 0.3}s"><div class="pw">${FE.U(w.ov ? `{m:${w.t}|${w.ov}}` : `{m:${w.t}}`)}</div><svg class="glide" viewBox="0 0 200 70"><path d="${w.path}" fill="none" stroke="#be185d" stroke-width="7" stroke-linecap="round" stroke-dasharray="${w.dash || '0'}"/></svg><div class="pnote">${w.note ? FE.U(w.note) : ''}</div><div class="bars">${Array.from({ length: 14 }, (_, k) => `<i style="animation-delay:${k * 0.06}s"></i>`).join('')}</div></button>`).join('');
    return FX.panel(X, { id: 'pron', x: o.x || 210, y: o.y || 250, w: o.w || 1500, cls: 'proncard', html: `<h3>${FE.U(o.title || 'Say it')}</h3><div class="prow">${cards}</div>` });
  };

  /* ---------- connected summary map ---------- */
  FX.summary = (X, o) => {
    const nodes = o.nodes;
    const html = `<div class="smap">${nodes.map((n, i) => `<div class="sn" style="transition-delay:${0.3 + i * 0.6}s"><div class="si">${FE.icon(n.icon, 74)}</div><div class="st">${FE.U(n.title)}</div><div class="sx">${FE.UB(n.text, 'xs')}</div></div>${i < nodes.length - 1 ? `<div class="sa" style="transition-delay:${0.6 + i * 0.6}s"><svg viewBox="0 0 60 40" width="60" height="40"><path d="M4 20h44M38 8l12 12-12 12" fill="none" stroke="#1c2340" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` : ''}`).join('')}</div>` + (o.warn ? `<div class="warnbar" style="transition-delay:${0.6 + nodes.length * 0.6}s">${FE.icon('qmark', 54)}<span class="ub sm">${FE.U(o.warn)}</span></div>` : '');
    return FX.panel(X, { id: 'summary', x: o.x || 90, y: o.y || 180, w: o.w || 1740, cls: 'sumcard', html });
  };

  /* chapter banner (overlay only; no timeline time) */
  /* a new chapter: the chapter chip glows briefly (nothing is drawn over the lesson, so captions and cards never collide) */
  FX.banner = (X, ch) => {
    const c = FE.$('#chip'); if (!c || FE.Tween.instant) return;
    c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 3000);
  };
})();
