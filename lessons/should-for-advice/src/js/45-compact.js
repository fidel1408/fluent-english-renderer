/* Should for Advice — adaptive layout.
   Wide screens: the 1920x1080 stage is simply scaled (unchanged).
   Small screens (stage scale < 0.5, i.e. text would be < 17 px): the cinematic art stays scaled in an "artbox",
   and everything a person has to READ or TOUCH moves into a native-size dock below / beside it:
     #capdock  – the current spoken line (English + IPA, speaker name, replay button)
     #dockhead – chapter / segment title, plan and class clocks, activity timer
     #dockbody – scrollable: every panel, card, question, option, tile, feedback and hint of the active segment
   Speech bubbles are replaced by the caption. Nothing is hidden: IPA stays on unless the learner switches it off. */
(function (g) {
  'use strict';
  const FE = g.FE, E = FE.engine, UI = FE.ui;
  const { h, $, UB } = FE;
  const Q = 0.5;
  UI.compact = false; UI.orient = 'wide';

  const KEEP_IN_ART = '.dimveil,.bubble,.badge,.keepart';
  const OVERLAYS = ['#gate', '#notes', '#toast', '#modal', '#finishNote'];   // stage overlays -> viewport-level panels
  const HEAD = ['#hudTitle', '#hudRight'];                                    // HUD pieces -> scrolling dock head
  const BAR = ['#actTimer'];                                                  // activity timer stays pinned above the scrolling area
  const homes = [];

  UI.layoutMode = function () {
    const vw = g.innerWidth, vh = g.innerHeight;
    const s = Math.min(vw / 1920, (vh - 56) / 1080);
    return s < Q ? (vw >= vh * 1.15 ? 'side' : 'stack') : 'wide';
  };

  function move(sel, to, before) {
    const el = $(sel); if (!el) return;
    if (!homes.find((x) => x.el === el)) homes.push({ el, parent: el.parentNode, next: el.nextSibling });
    if (before) to.insertBefore(el, before); else to.appendChild(el);
  }
  function restore() { homes.forEach(({ el, parent, next }) => { if (next && next.parentNode === parent) parent.insertBefore(el, next); else parent.appendChild(el); }); }

  UI.applyLayout = function (mode) {
    const wasCompact = UI.compact, was = UI.orient;
    if (mode === was) return;
    const app = UI.app;
    UI.orient = mode; UI.compact = mode !== 'wide';
    app.classList.toggle('compact', UI.compact); app.classList.toggle('side', mode === 'side'); app.classList.toggle('stack', mode === 'stack');
    if (UI.compact && !wasCompact) {
      HEAD.forEach((s) => move(s, UI.dockhead)); BAR.forEach((s) => move(s, UI.dockbar));
      OVERLAYS.forEach((s) => move(s, UI.vp));
      move('#start', app);
      UI.sync();
    } else if (!UI.compact && wasCompact) {
      // everything returns to the stage, in creation order
      [...UI.dockbody.children].filter((el) => el.classList.contains('indock')).forEach((el) => { el.classList.remove('indock'); el.style.zoom = ''; el.style.removeProperty('--z'); UI.layers().ui.appendChild(el); });
      restore();
      UI.capdock.innerHTML = '';
    }
    // the same segment is re-entered at the same moment so every element is built for the new layout
    if (wasCompact !== UI.compact && E.started && E.scene) { const playing = E.playing; E.goto(E.T); if (playing !== E.playing) E.setPlaying(playing); }
    E.emit('layout', mode);
  };
  UI.layers = () => E.layers;

  /* ---- docking ---- */
  UI.sync = function () {
    UI._tokrow = UI._tokrow && UI._tokrow.isConnected ? UI._tokrow : null;
    if (!UI.compact || !E.layers) return;
    [...E.layers.ui.children].forEach((el) => {
      if (el.matches(KEEP_IN_ART)) return;
      el.classList.add('indock');
      // scenario status tokens sit in one row AFTER the interactive panels, so the thing to answer is never pushed off-screen
      if (el.classList.contains('tok')) { UI.tokRow().appendChild(el); UI.dockbody.appendChild(UI.tokRow()); } else UI.dockbody.insertBefore(el, UI.tokRow(true));
      UI.normalize(el.classList.contains('tok') ? UI.tokRow() : el);
    });
  };
  UI.tokRow = function (peek) {
    let r = UI._tokrow;
    if (r && r.isConnected) return r;
    if (peek) return null;
    r = UI._tokrow = h('div', { class: 'indock tokrow' }); UI.dockbody.appendChild(r); return r;
  };
  UI.clearDock = function () { if (UI.dockbody) [...UI.dockbody.querySelectorAll(':scope>.indock')].forEach((n) => n.remove()); };
  /* one uniform zoom per docked item so its smallest English word is ~17 px on screen (IPA >= 11 px by CSS) */
  UI.normalize = function (el) {
    let m = Infinity, M = 0;
    el.querySelectorAll('.u .w').forEach((w) => { const f = parseFloat(getComputedStyle(w).fontSize); if (f && f < m) m = f; if (f > M) M = f; });
    // smallest word ~18 px; but never let the biggest word grow past ~40 px (smallest stays >= 17 px)
    const z = m === Infinity ? 1 : Math.max(0.25, Math.min(1.5, Math.max(17.2 / m, Math.min(18.5 / m, 40 / M))));
    el.style.zoom = z.toFixed(3); el.style.setProperty('--z', z.toFixed(3));
  };
  UI.ensureVisible = function (el) {
    if (!UI.compact || !el || !el.closest || !el.closest('#dockbody')) return;
    if (!el.querySelector('button,input,.opt,.tile,.btn')) return;
    try { el.scrollIntoView({ block: 'nearest', behavior: FE.reduced() ? 'auto' : 'smooth' }); } catch (e) { /* ignore */ }
  };

  /* ---- captions: current line, readable ---- */
  UI.caption = function (ln) {
    if (!UI.compact) return;
    const box = UI.capdock;
    if (!ln || (ln.who === 'narr' && !UI.cc)) { box.innerHTML = ''; box.classList.remove('has'); return; }
    const nm = ln.who !== 'narr' && FE.CHARS[ln.who] ? FE.CHARS[ln.who].name : '';
    box.innerHTML = `<button class="capreplay" type="button" aria-label="Replay this line"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg></button>` +
      (nm ? `<div class="capwho">${UB(nm)}</div>` : '') + `<div class="captxt">${UB(ln.text)}</div>`;
    box.classList.add('has');
    box.querySelector('.capreplay').onclick = () => { if (!FE.qa) FE.audio.play(ln.id, 0, ln.who); };
  };

  UI.compactInit = function () {
    // anything added to the stage UI layer later (cues, clicks) is docked as it appears
    new MutationObserver(() => UI.sync()).observe(E.layers.ui, { childList: true });
    // text added to a docked item after it was docked (feedback, reveal, next item) re-normalises that item
    const pend = new Set(); let queued = false;
    new MutationObserver((recs) => {
      recs.forEach((r) => { let n = r.target.nodeType === 1 ? r.target : r.target.parentElement; while (n && n.parentElement !== UI.dockbody) n = n.parentElement; if (n && n.classList.contains('indock')) pend.add(n); });
      if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; pend.forEach((n) => { if (n.isConnected) UI.normalize(n); }); pend.clear(); }); }
    }).observe(UI.dockbody, { childList: true, subtree: true, characterData: true });
  };
})(window);
