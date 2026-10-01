/* 41-fx2: thinking-time prompt, evidence tags, mission board, delivery route, phone, notes */
(function () {
  'use strict';
  const FE = window.FE, FX = FE.FX;

  /* thinking time inside a film: a real, visible countdown (not filler) */
  FX.ask = (X, o) => {
    const sec = o.sec || 8;
    FX.panel(X, { id: 'ask', x: o.x != null ? o.x : 520, y: o.y != null ? o.y : 150, w: o.w || 880, cls: 'askcard', sfx: 'bell',
      html: `<div style="display:flex;align-items:center;gap:26px"><div class="askring"><svg viewBox="0 0 100 100" width="96" height="96"><circle cx="50" cy="50" r="42" fill="none" stroke="#d6dcef" stroke-width="10"/><circle class="askc" cx="50" cy="50" r="42" fill="none" stroke="#be185d" stroke-width="10" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="0" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset ${sec}s linear"/></svg></div><div><span class="tag">${FE.U('Predict')}</span><div class="ub mid" style="margin-top:6px">${FE.U(o.q)}</div><div class="note">${FE.U('Think. Then say it to a partner.')}</div></div></div>` });
    if (!FE.Tween.instant) requestAnimationFrame(() => requestAnimationFrame(() => { const c = FE.$('#fx_ask .askc'); if (c) c.setAttribute('stroke-dashoffset', 264); }));
  };

  FX.tags = (X, o) => {
    const html = `<div class="tagrow">${o.items.map((it, i) => `<div class="tg" style="transition-delay:${0.2 + i * 0.5}s">${FE.icon(it.icon, 84)}<div class="ub sm">${FE.U(it.text)}</div></div>`).join('')}</div>`;
    return FX.panel(X, { id: 'tags', x: o.x || 460, y: o.y || 170, w: o.w || 1000, cls: 'tagcard', html, sfx: 'reveal' });
  };

  FX.hot = (i) => FE.$$('#fx_trio .trow').forEach((r, k) => r.classList.toggle('hot', k === i));

  /* generic information card from markup lines */
  FX.note = (X, o) => FX.panel(X, { id: o.id || 'note', x: o.x || 400, y: o.y || 170, w: o.w || 1100, cls: o.cls || '', html: (o.title ? `<h3>${FE.U(o.title)}</h3>` : '') + o.lines.map((l) => `<div class="ub ${o.size || 'mid'}" style="display:block;margin:6px 0">${FE.U(l)}</div>`).join('') });

  /* five-point mission board */
  FX.board = (X, o) => {
    const html = `<h3>${FE.U(o.title || 'The mission')}</h3><div class="tagrow">${o.items.map((it, i) => `<div class="tg" style="transition-delay:${0.2 + i * 0.35}s">${FE.icon(it.icon, 72)}<div class="ub xs">${FE.U(it.text)}</div></div>`).join('')}</div>`;
    return FX.panel(X, { id: 'board', x: o.x || 200, y: o.y || 160, w: o.w || 1520, cls: 'tagcard', html });
  };

  /* delivery route: main caterer's van (slow, traffic) vs backup scooter-tray (fast, small) — a real visual difference */
  FX.route = (X, o) => {
    const main = o.kind === 'main';
    const html = `<h3>${FE.U(main ? 'The main caterer' : 'The backup café')}</h3><div class="route"><div class="rs">${FE.icon(main ? 'van' : 'tray', 84)}</div><div class="rl ${main ? 'slow' : 'fast'}"><svg viewBox="0 0 600 40" width="600" height="40"><path d="M10 20H590" stroke="#1d4ed8" stroke-width="7" stroke-dasharray="4 16" stroke-linecap="round" fill="none"/></svg><span class="rv ${main ? 'slow' : 'fast'}">${FE.icon(main ? 'vanStuck' : 'tray', 72)}</span></div><div class="rd">${FE.icon('table', 84)}</div></div><div class="ub sm">${FE.U(o.text)}</div>`;
    return FX.panel(X, { id: 'route', x: o.x || 300, y: o.y || 170, w: o.w || 1000, cls: 'routecard', html });
  };

  /* phone card: a text message with a reply, or a call that rings */
  FX.phone = (X, o) => {
    const text = o.mode === 'text';
    const html = `<h3>${FE.U(text ? 'A text message' : 'A phone call')}</h3><div class="phn">${FE.icon('phone', 110)}<div class="msgs">${text
      ? `<div class="mg out">${FE.UB('Can you come tomorrow, Sofia?', 'xs')}</div><div class="mg in">${FE.UB('I {m:might} come. I will tell you later.', 'xs')}</div>`
      : `<div class="mg ring">${FE.U('Ring, ring, ring…')}</div><div class="mg in">${FE.UB('Please leave a message.', 'xs')}</div>`}</div></div>`;
    return FX.panel(X, { id: 'phone', x: o.x || 300, y: o.y || 170, w: o.w || 1000, cls: 'phonecard', html, sfx: text ? 'phone' : 'bell' });
  };
})();
