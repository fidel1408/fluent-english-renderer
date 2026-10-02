/* player.js — transport, audio sync, scrubber, chapters, interaction, adaptive quality.
   Timing model: a master clock t (seconds).  While playing, t advances by elapsed wall-clock time between
   requestAnimationFrame callbacks and is re-synchronised to the narration <audio> element whenever they drift
   by more than 80 ms.  Nothing runs when paused or when the tab is hidden.                                 */
'use strict';
(function () {
  const $ = id => document.getElementById(id);
  const cv = $('cv'), stage = $('stage');
  const P = { dtEma: 0, t: 0, playing: false, rate: 1, raf: 0, base: { perf: 0, t: 0 }, lastDraw: 0, fps: 30, autoPause: true, ema: 8, lowCount: 0, highCount: 0, scale: 1, maxPx: 1920, audioOK: false, lastCh: -1, ptDone: -1 };
  window.__lesson = P;
  const store = { get(k, d) { try { const v = localStorage.getItem('fe_pp_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('fe_pp_' + k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } } };
  const fmt = s => { s = Math.max(0, s); return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); };
  let narr, music;

  /* A track of consecutive audio files ("parts"): the lesson is an hour long, so narration and music are cut at silent gaps.
     Each part is fetched into a blob URL when needed (exact seeking), the next part is prefetched, and the clock decides when to switch. */
  function makeSeq(parts, key, vol) {
    const S = { i: -1, el: null, vol, muted: false, rate: 1, playing: false, tok: 0, cache: new Map(), els: [], failed: false };
    const idxAt = t => { let k = 0; for (let j = 0; j < parts.length; j++) if (t >= parts[j].t0 - 1e-6) k = j; return k; };
    const url = i => { let p = S.cache.get(i); if (!p) { const src = parts[i][key]; p = (location.protocol === 'file:' ? Promise.reject(new Error('file')) : fetch(src)).then(r => { if (!r.ok) throw new Error('http'); return r.blob(); }).then(b => URL.createObjectURL(b)).catch(() => src); S.cache.set(i, p); } return p; };
    const getEl = i => {
      let el = S.els[i]; if (el) return el;
      el = new Audio(); el.preload = 'auto'; el.volume = S.vol; el.muted = S.muted; el.playbackRate = S.rate; S.els[i] = el;
      el.addEventListener('error', () => { if (!S.failed) { S.failed = true; if (S.onError) S.onError(); } });
      url(i).then(u => { el.src = u; }); return el;
    };
    const ready = el => new Promise(res => { if (el.readyState >= 1) return res(); const f = () => { el.removeEventListener('loadedmetadata', f); el.removeEventListener('error', f); res(); }; el.addEventListener('loadedmetadata', f); el.addEventListener('error', f); setTimeout(res, 8000); });
    const prefetch = i => { if (i >= 0 && i < parts.length) getEl(i); };
    const prune = k => { S.cache.forEach((p, j) => { if (Math.abs(j - k) > 1) { p.then(u => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); }); S.cache.delete(j); if (S.els[j]) { S.els[j].removeAttribute('src'); S.els[j].load(); S.els[j] = null; } } }); };
    S.seek = t => {
      const k = idxAt(t), tok = ++S.tok, el = getEl(k);
      if (S.el && S.el !== el) S.el.pause();
      S.i = k; S.el = el; prefetch(k + 1); prune(k);
      ready(el).then(() => { if (tok !== S.tok) return; try { el.currentTime = Math.max(0, t - parts[k].t0); } catch (e) { /* not seekable yet */ } el.playbackRate = S.rate; if (S.playing) { const p = el.play(); if (p && p.catch) p.catch(() => { if (S.onBlocked) S.onBlocked(); }); } });
    };
    S.play = t => { S.playing = true; S.seek(t); };
    S.pause = () => { S.playing = false; S.tok++; if (S.el) S.el.pause(); };
    S.time = () => (S.el && !S.el.paused && S.el.readyState >= 2 && S.i >= 0) ? parts[S.i].t0 + S.el.currentTime : null;
    S.tick = t => { if (!S.playing) return; if (idxAt(t) !== S.i) S.seek(t); else if (S.i + 1 < parts.length && t > parts[S.i].t1 - 25) prefetch(S.i + 1); };
    S.setVol = v => { S.vol = v; S.els.forEach(e => { if (e) e.volume = v; }); };
    S.setMuted = m => { S.muted = m; S.els.forEach(e => { if (e) e.muted = m; }); };
    S.setRate = r => { S.rate = r; S.els.forEach(e => { if (e) e.playbackRate = r; }); };
    S.first = () => ready(getEl(idxAt(0)));
    return S;
  }

  async function init() {
    const loaderMsg = $('loaderMsg');
    try {
      await boot(cv, { logoBlue: window.ASSETS.logoBlue });
    } catch (e) { loaderMsg.textContent = 'Could not start the lesson: ' + e.message; console.error(e); return; }
    if (window.__missingIPA && window.__missingIPA.size) console.warn('Missing IPA for:', [...window.__missingIPA].join(', '));
    P.dur = Eng.duration;
    // audio: a lesson-length list of parts (each a narration file and a music file that start at part.t0)
    const A = window.ASSETS, parts = A.parts || [{ t0: 0, t1: P.dur, n: A.narration, m: A.music }];
    P.parts = parts;
    narr = makeSeq(parts.map(x => ({ t0: x.t0, t1: x.t1, n: x.n })), 'n', store.get('vn', 1));
    music = makeSeq(parts.map(x => ({ t0: x.t0, t1: x.t1, m: x.m })), 'm', store.get('vm', 0.55));
    narr.onError = () => { P.audioOK = false; toast('Audio could not be loaded. The lesson will play silently.'); };
    narr.onBlocked = () => { P.audioOK = false; };
    $('loaderMsg').textContent = 'Loading audio\u2026';
    await Promise.race([narr.first(), new Promise(r => setTimeout(r, 6000))]);
    P.audioOK = !narr.failed;
    buildUI();
    sizeCanvas();
    seek(0, true);
    $('loader').hidden = true;
    $('btnPlay').focus({ preventScroll: true });
    const fitCtl = () => document.documentElement.style.setProperty('--ctl-h', $('bar').hidden ? '12px' : (document.getElementById('controls').offsetHeight + document.getElementById('transcript').offsetHeight + 16) + 'px');
    fitCtl(); new ResizeObserver(fitCtl).observe($('controls'));
    P.fitCtl = fitCtl;
    new ResizeObserver(() => { sizeCanvas(); drawOnce(); }).observe(stage);
    document.addEventListener('visibilitychange', () => { if (document.hidden && P.playing) { pause(); toast('Paused because this tab is hidden.'); } });
  }

  /* ------------------------------------------------------------ canvas sizing + adaptive quality */
  function sizeCanvas() {
    const r = stage.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    P.maxPx = Math.min(1920, Math.max(640, Math.round(r.width * dpr)));
    applyScale();
  }
  function applyScale() { const px = Math.round(P.maxPx * P.scale / 16) * 16; if (cv.width !== px) Eng.resize(px); }
  function adapt(ms) {
    P.ema = P.ema * 0.9 + ms * 0.1; const budget = 1000 / P.fps * 0.7;
    const lagging = P.dtEma > 1000 / P.fps * 1.4;      // frames arriving late = GPU/compositor bound; recording time alone would not show it
    if (P.ema > budget || lagging) { if (++P.lowCount > 18 && P.scale > 0.55) { P.scale = Math.max(0.55, P.scale * 0.85); applyScale(); P.lowCount = 0; P.ema = ms * 0.8; } } else P.lowCount = 0;
    if (P.ema < budget * 0.3) { if (++P.highCount > 240 && P.scale < 1) { P.scale = Math.min(1, P.scale * 1.15); applyScale(); P.highCount = 0; } } else P.highCount = 0;
  }

  /* ------------------------------------------------------------ transport */
  function drawOnce() { if (!Eng.ctx) return; Eng.draw(P.t); announceChapter(); updateUI(); }
  function frame(now) {
    if (!P.playing) return;
    P.raf = requestAnimationFrame(frame);
    const minGap = 1000 / P.fps - 2; if (now - P.lastDraw < minGap) return;   // frame cap: 30 fps by default
    const t0 = performance.now();
    let t = P.base.t + (now - P.base.perf) / 1000 * P.rate;
    narr.tick(t); music.tick(t);
    if (P.audioOK) { const a = narr.time(); if (a !== null && Math.abs(a - t) > 0.08) { t = a; P.base = { perf: now, t }; } }
    { const m = music.time(); if (m !== null && Math.abs(m - t) > 0.25) music.seek(t); }
    const prev = P.t;
    // practice pause points (thinking time), only when playing forward through them
    if (P.apMode !== 'off') for (const pp of Eng.pausePoints) if (prev < pp.t && t >= pp.t && P.ptDone !== pp.t && (P.apMode === 'item' || pp.kind !== 'item')) { P.ptDone = pp.t; P.t = pp.t; pause(); toast('Class time. Discuss it, then press Play to continue.', 6000); drawOnce(); return; }
    if (t >= P.dur) { P.t = P.dur; pause(); drawOnce(); return; }
    { const gap = P.lastDraw ? now - P.lastDraw : 0; if (gap > 0 && gap < 500) P.dtEma = P.dtEma ? P.dtEma * 0.9 + gap * 0.1 : gap; }
    P.t = t; P.lastDraw = now;
    Eng.draw(t); updateUI(); announceChapter();
    adapt(performance.now() - t0);
  }
  function play() {
    if (P.playing) return;
    if (P.t >= P.dur - 0.05) P.t = 0;
    narr.setRate(P.rate); music.setRate(P.rate); narr.play(P.t); music.play(P.t);
    P.playing = true; P.base = { perf: performance.now(), t: P.t }; P.lastDraw = 0;
    $('btnPlay').setAttribute('aria-label', 'Pause'); $('btnPlay').dataset.state = 'playing'; hideToast();
    P.raf = requestAnimationFrame(frame);
  }
  function pause() {
    P.playing = false; cancelAnimationFrame(P.raf); if (narr) { narr.pause(); music.pause(); }
    $('btnPlay').setAttribute('aria-label', 'Play'); $('btnPlay').dataset.state = 'paused';
  }
  function seek(t, silent) {
    P.t = clamp(t, 0, P.dur); if (narr) { narr.seek(P.t); music.seek(P.t); }
    P.base = { perf: performance.now(), t: P.t }; P.ptDone = -1;
    for (const pp of Eng.pausePoints) if (pp.t <= P.t) P.ptDone = pp.t;      // do not re-trigger points already passed
    drawOnce();
  }
  function replay() { pause(); seek(0); play(); }
  P.audioState = () => { const f = q => ({ part: q.i, ct: q.el ? +q.el.currentTime.toFixed(2) : null, paused: q.el ? q.el.paused : null, rs: q.el ? q.el.readyState : null, err: q.el && q.el.error ? q.el.error.code : null }); return { narr: f(narr), music: f(music), ok: P.audioOK }; };
  P.play = play; P.pause = pause; P.seek = seek; P.replay = replay; P.draw = drawOnce;

  /* ------------------------------------------------------------ UI */
  function buildUI() {
    const TL = Eng.TL, dur = P.dur;
    $('dur').textContent = fmt(dur);
    const sc = $('scrub'); sc.max = dur; sc.step = 0.05;
    const marks = $('marks');
    Eng.chapterStart.forEach((s, i) => { const m = document.createElement('i'); m.className = 'tick'; m.style.left = (s / dur * 100) + '%'; m.title = TL.chapters[i].label; marks.appendChild(m); });
    Eng.pausePoints.filter(pp => pp.kind !== 'item').forEach(pp => { const m = document.createElement('b'); m.className = 'star'; m.style.left = (pp.t / dur * 100) + '%'; m.title = pp.label || 'Practice'; m.textContent = '★'; marks.appendChild(m); });
    const cs = $('chapSel');
    TL.chapters.forEach((c, i) => { const o = document.createElement('option'); o.value = i; o.textContent = c.label + '  (' + fmt(Eng.chapterStart[i]) + ')'; cs.appendChild(o); });
    cs.addEventListener('change', () => { seek(Eng.chapterStart[+cs.value]); if (!P.playing) play(); cs.blur(); });
    sc.addEventListener('input', () => { const was = P.playing; if (was) pause(); seek(+sc.value); if (was) play(); });
    $('btnPlay').addEventListener('click', () => (P.playing ? pause() : play()));
    $('btnReplay').addEventListener('click', replay);
    const vn = $('vn'), vm = $('vm'); vn.value = narr.vol; vm.value = music.vol;
    vn.addEventListener('input', () => { narr.setVol(+vn.value); store.set('vn', +vn.value); });
    vm.addEventListener('input', () => { music.setVol(+vm.value); store.set('vm', +vm.value); });
    const mute = $('mute'); mute.addEventListener('click', () => { const m = !narr.muted; narr.setMuted(m); music.setMuted(m); mute.setAttribute('aria-pressed', m); mute.textContent = m ? 'Unmute' : 'Mute'; });
    const cc = $('cc'); Eng.captions = store.get('cc', true); cc.setAttribute('aria-pressed', Eng.captions); cc.addEventListener('click', () => { Eng.captions = !Eng.captions; cc.setAttribute('aria-pressed', Eng.captions); store.set('cc', Eng.captions); drawOnce(); });
    const ap = $('autopause'); P.apMode = store.get('apm', 'round'); if (!['off', 'round', 'item'].includes(P.apMode)) P.apMode = 'round'; ap.value = P.apMode; ap.addEventListener('change', () => { P.apMode = ap.value; store.set('apm', ap.value); });
    const setBar = hide => { $('bar').hidden = hide; $('mini').hidden = !hide; store.set('hide', hide); P.fitCtl && P.fitCtl(); sizeCanvas(); drawOnce(); };
    $('hideBar').addEventListener('click', () => setBar(true)); $('showBar').addEventListener('click', () => setBar(false)); $('miniPlay').addEventListener('click', () => (P.playing ? pause() : play()));
    P.setBar = setBar; if (store.get('hide', false)) setTimeout(() => setBar(true), 0);
    $('prevAct').addEventListener('click', () => jumpActivity(-1)); $('nextAct').addEventListener('click', () => jumpActivity(1));
    const sp = $('speed'); P.rate = store.get('rate', 1); sp.value = String(P.rate); sp.addEventListener('change', () => { P.rate = +sp.value; store.set('rate', P.rate); narr.setRate(P.rate); music.setRate(P.rate); P.base = { perf: performance.now(), t: P.t }; });
    const fp = $('fps'); P.fps = store.get('fps', 30); fp.value = String(P.fps); fp.addEventListener('change', () => { P.fps = +fp.value; store.set('fps', P.fps); });
    $('full').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else { const r = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (r && r.catch) r.catch(() => toast('Full screen is not available here. Use the browser full-screen shortcut (F11).')); } });
    // transcript for screen readers / teachers (plain text, no IPA)
    const tr = $('transcriptBody'); let html = '';
    for (const b of TL.beats) for (const l of b.lines) if (l.text && l.kind !== 'hold') html += `<p><strong>${({ N: 'Teacher', D: 'Daniel', M: 'Maya', S: 'Sofia' })[l.who] || ''}${l.kind === 'thought' ? ' (thinking)' : ''}:</strong> ${l.text.replace(/</g, '&lt;')}</p>`;
    tr.innerHTML = html;
    // canvas interaction (checks)
    const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH]; };
    cv.addEventListener('click', e => { const [x, y] = pt(e); if (Eng.click(x, y)) { drawOnce(); } });
    cv.addEventListener('pointermove', e => { const [x, y] = pt(e); cv.style.cursor = Eng.cursorAt(x, y) ? 'pointer' : 'default'; });
    Eng.onPick = (id, i) => { live(`Answer chosen: option ${i + 1}.`); if (!P.playing) setTimeout(drawOnce, 0); };
    document.addEventListener('keydown', onKey);
  }
  function onKey(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' && e.target.type === 'range' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
    if (tag === 'select') return;
    const k = e.key;
    if (k === ' ' && tag !== 'button') { e.preventDefault(); P.playing ? pause() : play(); }
    else if (k === 'ArrowRight') { seek(P.t + 5); }
    else if (k === 'ArrowLeft') { seek(P.t - 5); }
    else if (k === ']') { jumpChapter(1); } else if (k === '[') { jumpChapter(-1); }
    else if (k === 'n' || k === 'N') jumpActivity(1); else if (k === 'p' || k === 'P') jumpActivity(-1);
    else if (k === 'c' || k === 'C') $('cc').click();
    else if (k === 'm' || k === 'M') $('mute').click();
    else if (k === 'f' || k === 'F') $('full').click();
    else if (k === 'h' || k === 'H') P.setBar(!$('bar').hidden);
    else if (k === 'r' || k === 'R') replay();
    else if (/^[1-4]$/.test(k)) { const h = Eng.hot[+k - 1]; if (h) { h.fn(); drawOnce(); } }
  }
  function jumpActivity(d) {
    const G = Eng.groups; let tt = null;
    if (d > 0) { const g = G.find(g => g.t0 > P.t + 0.6); tt = g ? g.t0 : null; }
    else { for (const g of G) if (g.t0 < P.t - 2) tt = g.t0; if (tt === null) tt = 0; }
    if (tt !== null) { const was = P.playing; if (was) pause(); seek(tt); if (was) play(); }
  }
  function curChapter() { let c = 0; Eng.chapterStart.forEach((s, i) => { if (P.t >= s - 0.01) c = i; }); return c; }
  function jumpChapter(d) { const c = curChapter(); let n = clamp(c + d, 0, Eng.chapterStart.length - 1); if (d < 0 && P.t - Eng.chapterStart[c] > 2) n = c; seek(Eng.chapterStart[n]); }
  function updateUI() {
    const sc = $('scrub'); sc.value = P.t; sc.style.setProperty('--p', (P.t / P.dur * 100) + '%'); $('time').textContent = fmt(P.t);
    sc.setAttribute('aria-valuetext', fmt(P.t) + ' of ' + fmt(P.dur));
    const cs = $('chapSel'); if (cs && document.activeElement !== cs) cs.value = String(curChapter());
  }
  function announceChapter() { const c = curChapter(); if (c !== P.lastCh) { P.lastCh = c; live('Chapter: ' + Eng.TL.chapters[c].label); } }
  let toastTimer = 0;
  function toast(msg, ms = 3500) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, ms); live(msg); }
  function hideToast() { $('toast').hidden = true; }
  function live(msg) { $('live').textContent = ''; setTimeout(() => { $('live').textContent = msg; }, 30); }

  window.addEventListener('DOMContentLoaded', init);
})();
