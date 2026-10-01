/* 80-ui: HUD, seek bar, clocks, activity timer, caption, modals, keyboard */
(function () {
  'use strict';
  const FE = window.FE, { $, h } = FE, A = FE.Audio, R = FE.R, L = FE.L;
  const ic = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    prevCh: ic('<path d="M6 5v14M19 5L9 12l10 7z"/>'), back5: ic('<path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="8.2" y="16.2" font-size="6.5" font-family="sans-serif" font-weight="700">5</text>'),
    play: ic('<path d="M7 4l13 8-13 8z"/>'), pause: ic('<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'),
    fwd5: ic('<path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="8.2" y="16.2" font-size="6.5" font-family="sans-serif" font-weight="700">5</text>'),
    nextCh: ic('<path d="M18 5v14M5 5l10 7L5 19z"/>'), replay: ic('<path d="M12 5a7 7 0 1 1-6.9 8H3l3.5-4 3.5 4H7.1A5 5 0 1 0 12 7V5z"/>'),
    voice: ic('<path d="M3 9v6h4l5 4V5L7 9zM15 8a5 5 0 0 1 0 8M17.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
    sound: ic('<path d="M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zm10-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/>'), full: ic('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
    restart: ic('<path d="M12 4a8 8 0 1 0 8 8h-2.5a5.5 5.5 0 1 1-5.5-5.5V10l5-4-5-4z"/>'),
  };
  const hb = (id, icon, tip, cls = '') => `<button class="hb ${cls}" id="${id}" data-tip="${tip}" aria-label="${tip}">${icon}</button>`;
  const UI = (FE.UI = {});

  UI.build = () => {
    const st = $('#stage');
    st.insertAdjacentHTML('beforeend', `
      <div id="chrome">
        <div class="plate" id="logoPlate"><img src="assets/fluent_english_logo_trimmed.png" alt="Fluent English"></div>
        <div id="chip"><span class="no"></span><span class="ttl"></span></div>
        <div id="clock"><div class="c"><span class="l">Lesson plan</span><span class="v" id="ckPlan">0:00</span></div><div class="c"><span class="l">Actual</span><span class="v" id="ckAct">0:00</span></div><div class="c"><span class="l" id="ckDl">Ahead / behind</span><span class="v" id="ckDiff">0:00</span></div></div>
        <div id="modeTag"></div>
        <div class="timer" id="timer" style="display:none"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="60" fill="rgba(14,26,51,.82)" stroke="rgba(255,255,255,.2)" stroke-width="10"/><circle id="ring" cx="70" cy="70" r="60" fill="none" stroke="#f2b84b" stroke-width="10" stroke-linecap="round" transform="rotate(-90 70 70)" stroke-dasharray="377" stroke-dashoffset="0"/></svg><div class="t"><span id="tv">0:00</span><small id="tl">activity</small></div>
          <div class="tc"><button class="tb" id="tbPause" title="Pause or resume activity timer" aria-label="Pause or resume activity timer">❚❚</button><button class="tb" id="tbRestart" title="Restart activity timer" aria-label="Restart activity timer">↺</button><button class="tb" id="tbExtend" title="Add one minute" aria-label="Add one minute">+1</button><button class="tb" id="tbSkip" title="Skip to end of activity" aria-label="Skip to end of activity">⏭</button></div></div>
        <div id="cap" style="display:none"></div>
      </div>
      <div id="hud">
        <div id="seek" role="slider" tabindex="0" aria-label="Lesson timeline" aria-valuemin="0" aria-valuemax="3600" aria-valuenow="0"><div class="tr"></div><div class="kn"></div></div>
        <div class="row">
          ${hb('bPrevCh', ICONS.prevCh, 'Previous chapter  [PgUp]')}${hb('bBack', ICONS.back5, 'Back 5 seconds  [←]')}${hb('bPlay', ICONS.play, 'Play / pause  [Space]', 'big')}${hb('bFwd', ICONS.fwd5, 'Forward 5 seconds  [→]')}${hb('bNextCh', ICONS.nextCh, 'Next chapter  [PgDn]')}${hb('bReplay', ICONS.replay, 'Replay this example  [R]')}
          <div class="sp"></div>
          <div class="seg2" role="group" aria-label="Playback mode"><button id="mClass" class="on" title="Class Mode: pauses at each activity until you continue">CLASS</button><button id="mDemo" title="Demo Mode: runs the planned 60 minutes automatically, with planned answer reveals">DEMO</button></div>
          ${hb('bNext', ICONS.nextCh, 'Continue to next step  [N]', 'gold')}
          <div class="sp"></div>
          <button class="hb txt" id="bCC" aria-pressed="false" data-tip="Captions: show the narration as text  [C]" aria-label="Captions on or off">CC</button><button class="hb txt" id="bIPA" aria-pressed="true" data-tip="Show or hide the IPA under each word  [I]" aria-label="IPA on or off">IPA</button>
          ${hb('bVoice', ICONS.voice, 'Narration on / off  [M]')}${hb('bSound', ICONS.sound, 'Sound settings')}${hb('bFull', ICONS.full, 'Fullscreen  [F]')}${hb('bRestart', ICONS.restart, 'Restart lesson')}
        </div>
      </div>
      <div id="vol"><label>Narration <input type="range" id="vN" min="0" max="1" step="0.05" value="1"><input type="checkbox" id="mN" title="mute narration" aria-label="mute narration"></label><label>Music &amp; ambience <input type="range" id="vM" min="0" max="1" step="0.05" value="0.35"><input type="checkbox" id="mM" aria-label="mute music"></label><label>Effects <input type="range" id="vF" min="0" max="1" step="0.05" value="0.7"><input type="checkbox" id="mF" aria-label="mute effects"></label><div style="font-size:14px;color:#9fb0d9;margin-top:6px">Checked = muted. Music is off during learner-speaking activities.</div></div>
      <div id="toast"></div>`);
    $('#bNext').innerHTML = ICONS.nextCh.replace('<path d="M18 5v14M5 5l10 7L5 19z"/>', '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>');
    // seek track segments: one block per chapter, proportional to the plan
    const tr = $('#seek .tr');
    L.chapters.forEach((c) => { tr.insertAdjacentHTML('beforeend', `<i style="flex:${c.e - c.s}" data-ch="${c.n}" title="Chapter ${c.n}"><b></b></i>`); });
    UI.wire(); UI.restorePrefs();
    UI.fit(); addEventListener('resize', UI.fit);
  };
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage may be blocked */ } } };
  UI.cc = false; UI.ipa = true;
  UI.setCC = (on, quiet) => {
    UI.cc = on; $('#bCC').setAttribute('aria-pressed', on); store.set('fe-cc', on ? '1' : '0');
    const it = R.hlItem;
    if (on && it && it.kind === 'nar') UI.cap(it); else if (!on) UI.capHide(false, null, true);
    if (!quiet) UI.toast(on ? 'Captions on' : 'Captions off', 1400);
  };
  UI.setIPA = (on, quiet) => {
    UI.ipa = on; $('#bIPA').setAttribute('aria-pressed', on); $('#stage').classList.toggle('no-ipa', !on); store.set('fe-ipa', on ? '1' : '0');
    if (!quiet) UI.toast(on ? 'IPA shown' : 'IPA hidden', 1400);
  };
  UI.restorePrefs = () => { if (store.get('fe-cc') === '1') UI.setCC(true, true); if (store.get('fe-ipa') === '0') UI.setIPA(false, true); };
  UI.fit = () => { const s = Math.min(innerWidth / 1920, innerHeight / 1080); $('#stage').style.transform = `scale(${s})`; UI.scale = s; };
  UI.toast = (msg, ms = 2200) => { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(UI._tt); UI._tt = setTimeout(() => t.classList.remove('on'), ms); };

  UI.wire = () => {
    $('#bPlay').onclick = () => R.toggle();
    $('#bBack').onclick = () => R.rel(-5); $('#bFwd').onclick = () => R.rel(5);
    $('#bPrevCh').onclick = () => R.chapter(-1); $('#bNextCh').onclick = () => R.chapter(1);
    $('#bReplay').onclick = () => R.replay(); $('#bNext').onclick = () => { R.nextSeg(1); };
    $('#bFull').onclick = () => UI.fullscreen();
    $('#bCC').onclick = () => UI.setCC(!UI.cc);
    $('#bIPA').onclick = () => UI.setIPA(!UI.ipa);
    $('#bVoice').onclick = () => { A.mute.narr = !A.mute.narr; $('#mN').checked = A.mute.narr; $('#bVoice').classList.toggle('on', A.mute.narr); A.applyVol(); UI.toast(A.mute.narr ? 'Narration muted' : 'Narration on'); };
    $('#bSound').onclick = () => $('#vol').classList.toggle('open');
    $('#bRestart').onclick = () => UI.confirm('Restart the lesson from 0:00?', 'Restart', () => R.restart());
    $('#mClass').onclick = () => R.setMode('class'); $('#mDemo').onclick = () => R.setMode('demo');
    $('#vN').oninput = (e) => { A.vol.narr = +e.target.value; A.applyVol(); }; $('#vM').oninput = (e) => { A.vol.music = +e.target.value; A.applyVol(); }; $('#vF').oninput = (e) => { A.vol.fx = +e.target.value; A.applyVol(); };
    $('#mN').onchange = (e) => { A.mute.narr = e.target.checked; A.applyVol(); }; $('#mM').onchange = (e) => { A.mute.music = e.target.checked; A.applyVol(); if (A.ctx) A.musicOn(!A.mute.music && R.playing); }; $('#mF').onchange = (e) => { A.mute.fx = e.target.checked; A.applyVol(); };
    $('#tbPause').onclick = () => { R.timer.pause(); UI.updateTimer(R, R.seg()); };
    $('#tbRestart').onclick = () => { R.timer.restart(); UI.updateTimer(R, R.seg()); };
    $('#tbExtend').onclick = () => { R.timer.extend(); UI.updateTimer(R, R.seg()); UI.toast('+1:00 added to this activity'); };
    $('#tbSkip').onclick = () => { R.timer.skip(); UI.updateTimer(R, R.seg()); };
    // seek bar
    const seek = $('#seek');
    const seekAt = (e) => { const r = seek.getBoundingClientRect(); R.seekP(FE.clamp((e.clientX - r.left) / r.width, 0, 1) * 3600); };
    let drag = false; seek.addEventListener('pointerdown', (e) => { drag = true; seek.setPointerCapture(e.pointerId); seekAt(e); });
    seek.addEventListener('pointermove', (e) => { if (drag) seekAt(e); }); seek.addEventListener('pointerup', () => { drag = false; });
    seek.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { R.rel(5); e.preventDefault(); } if (e.key === 'ArrowLeft') { R.rel(-5); e.preventDefault(); } });
    // hud auto-hide
    let hideT; const show = () => { $('#hud').classList.remove('hide'); clearTimeout(hideT); hideT = setTimeout(() => { if (R.playing && !document.activeElement.closest('#hud') && !$('#vol').classList.contains('open')) $('#hud').classList.add('hide'); }, 3500); };
    addEventListener('mousemove', show); addEventListener('keydown', show); addEventListener('pointerdown', show); $('#hud').addEventListener('focusin', show);
    // keyboard
    addEventListener('keydown', (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (!R.seg()) return;
      const k = e.key;
      if (k === ' ' && e.target.tagName !== 'BUTTON' && e.target.id !== 'seek') { R.toggle(); e.preventDefault(); }
      else if (k === 'ArrowRight' && e.target.id !== 'seek') R.rel(5); else if (k === 'ArrowLeft' && e.target.id !== 'seek') R.rel(-5);
      else if (k === 'PageDown') R.chapter(1); else if (k === 'PageUp') R.chapter(-1);
      else if (k === 'r' || k === 'R') R.replay(); else if (k === 'n' || k === 'N') R.nextSeg(1);
      else if (k === 'f' || k === 'F') UI.fullscreen(); else if (k === 'm' || k === 'M') $('#bVoice').click();
      else if (k === 'c' || k === 'C') $('#bCC').click(); else if (k === 'i' || k === 'I') $('#bIPA').click();
      else if (k === 'Escape') { $('#vol').classList.remove('open'); }
    });
    // pronunciation card replay (teacher-controlled)
    $('#fx').addEventListener('click', (e) => {
      const c = e.target.closest('.pcard'); if (!c || !c.dataset.key) return;
      A.init(); R.pause(); A.play(c.dataset.key); c.classList.add('ring'); setTimeout(() => c.classList.remove('ring'), 1200);
    });
  };

  UI.fullscreen = () => { const d = document; if (!d.fullscreenElement) (d.documentElement.requestFullscreen || (() => {})).call(d.documentElement).catch(() => UI.toast('Fullscreen is blocked in this window')); else d.exitFullscreen(); };
  UI.confirm = (msg, ok, fn) => {
    const m = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': msg }, `<div class="card"><div class="qq ub mid" style="margin-bottom:16px">${FE.U(msg.replace(/[?]$/, '?'))}</div><div class="ctr" style="gap:16px"><button class="btn" data-x="no">${FE.U('Cancel')}</button><button class="btn gold" data-x="yes">${FE.U(ok)}</button></div></div>`);
    $('#stage').appendChild(m); const was = R.playing; if (was) R.pause();
    const done = (y) => { m.remove(); if (y) fn(); else if (was) R.play(); };
    m.addEventListener('click', (e) => { const x = e.target.closest('[data-x]'); if (x) done(x.dataset.x === 'yes'); });
    m.addEventListener('keydown', (e) => { if (e.key === 'Escape') done(false); });
    FE.$('[data-x="no"]', m).focus();
  };

  /* ---------- callbacks from the runner ---------- */
  UI.clearOverlays = () => { FE.$$('#fx > *').forEach((e) => e.remove()); UI.capHide(true); $('#timer').style.display = 'none'; FE.$$('#chrome .banner').forEach((b) => b.remove()); };
  UI.onSegment = (seg, r) => {
    const ch = L.chapters[seg.ch - 1];
    $('#chip .no').textContent = ch.n; $('#chip .ttl').innerHTML = FE.U(ch.t);
    $('#chip').classList.toggle('long', ch.t.length > 24);
    if (seg.idx === 0 || (r.t < 0.5 && L.segs[seg.idx - 1] && L.segs[seg.idx - 1].ch !== seg.ch)) FE.FX.banner(r.X, ch);
    A.ambience(null); A.setSilence(false);
    if (seg.amb && A.ctx) A.ambience(seg.amb);
    UI.onMode(r.mode);
  };
  UI.onGate = (seg, r) => {
    if (seg.act) { $('#timer').style.display = 'block'; UI.updateTimer(r, seg); }
  };
  UI.onPlay = (p) => { $('#bPlay').innerHTML = p ? ICONS.pause : ICONS.play; $('#bPlay').dataset.tip = p ? 'Pause  [Space]' : 'Play  [Space]'; };
  UI.onMode = (m) => {
    $('#mClass').classList.toggle('on', m === 'class'); $('#mDemo').classList.toggle('on', m === 'demo');
    $('#stage').classList.toggle('mode-demo', m === 'demo');
    $('#modeTag').textContent = m === 'class' ? 'CLASS MODE · waits for you at each activity' : 'DEMO MODE · fixed 60-minute run';
    ['tbRestart', 'tbExtend', 'tbSkip'].forEach((id) => { $('#' + id).disabled = m === 'demo'; });
    $('#bNext').style.display = '';
  };
  UI.onEnd = () => UI.toast('End of the lesson. Well done!', 5000);
  UI.onTimesUp = (r) => { const c = FE.$('#fx_act .cont'); if (c && r.mode === 'class') c.classList.add('pulse'); UI.toast(r.mode === 'class' ? 'Time is up. Extend, or continue when ready.' : 'Time is up.', 4000); };
  UI.clearWall = () => { };
  UI.updateTimer = (r, seg) => {
    if (!r.gate || !seg.act) { $('#timer').style.display = 'none'; return; }
    const total = seg.actDur + r.extra, left = total - r.actT;
    $('#tv').textContent = (left < 0 ? '+' : '') + FE.fmt(Math.abs(left)); $('#tl').textContent = r.actPaused ? 'paused' : left < 0 ? 'over' : 'activity';
    $('#ring').setAttribute('stroke-dashoffset', (377 * FE.clamp(r.actT / Math.max(1, total), 0, 1)).toFixed(1));
    $('#timer').classList.toggle('low', left < 15);
    $('#tbPause').textContent = r.actPaused ? '▶' : '❚❚';
  };
  UI.updateClock = () => {
    const p = R.pos(), w = R.wall(), d = w - p;
    $('#ckPlan').textContent = FE.fmt(p) + ' / 60:00'; $('#ckAct').textContent = FE.fmt(w);
    const dv = $('#ckDiff'); dv.textContent = (d >= 0 ? '+' : '−') + FE.fmt(Math.abs(d)); dv.classList.toggle('over', d > 30);
    $('#ckDl').textContent = d >= 0 ? 'Over plan' : 'Ahead';
    const seg = R.seg(); if (seg) {
      FE.$$('#seek .tr i').forEach((i) => { const c = L.chapters[+i.dataset.ch - 1]; i.firstChild.style.width = FE.clamp((p - c.s) / (c.e - c.s), 0, 1) * 100 + '%'; });
      $('#seek .kn').style.left = (p / 3600) * 100 + '%'; $('#seek').setAttribute('aria-valuenow', Math.round(p));
    }
  };
  setInterval(() => { if (R.started && !R.playing) UI.updateClock(); }, 1000);
  setInterval(() => { if (R.started && R.playing) { /* clock text refreshes in rAF */ } }, 5000);

  /* narrated caption (example sentences) with word highlighting */
  UI.cap = (it) => {
    const c = $('#cap'); c.style.display = 'block'; c.classList.toggle('cc', !it.o.cap); UI.capItem = it;
    c.innerHTML = `<div class="card capc ${it.o.cap ? '' : 'dark'}"><span class="ub ${it.o.cap ? 'mid' : 'sm'}">${FE.U(it.text)}</span></div>`; UI.capUnits = FE.$$('.wu', c);
  };
  UI.capHL = (i) => { if (UI.capUnits) UI.capUnits.forEach((u, k) => u.classList.toggle('hl', k === i)); };
  /* hide the caption: only for the line that owns it (a new line may already have replaced it), or when forced */
  UI.capHide = (force, it, keepExplicit) => {
    const c = $('#cap'); if (!c) return;
    if (!force && it && UI.capItem !== it) return;
    if (keepExplicit && UI.capItem && UI.capItem.o.cap) return;
    c.style.display = 'none'; c.innerHTML = ''; UI.capUnits = null; UI.capItem = null;
  };
})();
