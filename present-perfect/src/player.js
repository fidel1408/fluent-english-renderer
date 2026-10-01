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

  async function init() {
    const loaderMsg = $('loaderMsg');
    try {
      await boot(cv, { logoBlue: window.ASSETS.logoBlue });
    } catch (e) { loaderMsg.textContent = 'Could not start the lesson: ' + e.message; console.error(e); return; }
    if (window.__missingIPA && window.__missingIPA.size) console.warn('Missing IPA for:', [...window.__missingIPA].join(', '));
    P.dur = Eng.duration;
    // audio (blob URLs from embedded base64 so seeking is exact and memory is not duplicated)
    narr = new Audio(); music = new Audio(); narr.preload = music.preload = 'auto';
    narr.src = window.ASSETS.narration; music.src = window.ASSETS.music;
    narr.volume = store.get('vn', 1); music.volume = store.get('vm', 0.55); music.loop = false;
    narr.addEventListener('canplaythrough', () => { P.audioOK = true; }, { once: true });
    narr.addEventListener('error', () => { P.audioOK = false; toast('Audio could not be loaded. The lesson will play silently.'); });
    buildUI();
    sizeCanvas();
    seek(0, true);
    $('loader').hidden = true;
    $('btnPlay').focus({ preventScroll: true });
    const fitCtl = () => document.documentElement.style.setProperty('--ctl-h', (document.getElementById('controls').offsetHeight + document.getElementById('transcript').offsetHeight + 16) + 'px');
    fitCtl(); new ResizeObserver(fitCtl).observe($('controls'));
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
    if (P.audioOK && !narr.paused) { const a = narr.currentTime; if (Math.abs(a - t) > 0.08) { t = a; P.base = { perf: now, t }; } }
    if (music && !music.paused && Math.abs(music.currentTime - t) > 0.2) music.currentTime = t;
    const prev = P.t;
    // practice pause points (thinking time), only when playing forward through them
    if (P.autoPause) for (const pp of Eng.pausePoints) if (prev < pp.t && t >= pp.t && P.ptDone !== pp.t) { P.ptDone = pp.t; P.t = pp.t; pause(); toast('Practice time. Discuss it, then press Play to hear the answer.', 6000); drawOnce(); return; }
    if (t >= P.dur) { P.t = P.dur; pause(); drawOnce(); return; }
    { const gap = P.lastDraw ? now - P.lastDraw : 0; if (gap > 0 && gap < 500) P.dtEma = P.dtEma ? P.dtEma * 0.9 + gap * 0.1 : gap; }
    P.t = t; P.lastDraw = now;
    Eng.draw(t); updateUI(); announceChapter();
    adapt(performance.now() - t0);
  }
  function play() {
    if (P.playing) return;
    if (P.t >= P.dur - 0.05) P.t = 0;
    narr.currentTime = P.t; music.currentTime = P.t; narr.playbackRate = music.playbackRate = P.rate;
    const pr = narr.play(); if (pr && pr.catch) pr.catch(() => { P.audioOK = false; });
    const pm = music.play(); if (pm && pm.catch) pm.catch(() => {});
    P.playing = true; P.base = { perf: performance.now(), t: P.t }; P.lastDraw = 0;
    $('btnPlay').setAttribute('aria-label', 'Pause'); $('btnPlay').dataset.state = 'playing'; hideToast();
    P.raf = requestAnimationFrame(frame);
  }
  function pause() {
    P.playing = false; cancelAnimationFrame(P.raf); if (narr) { narr.pause(); music.pause(); }
    $('btnPlay').setAttribute('aria-label', 'Play'); $('btnPlay').dataset.state = 'paused';
  }
  function seek(t, silent) {
    P.t = clamp(t, 0, P.dur); if (narr) { narr.currentTime = P.t; music.currentTime = P.t; }
    P.base = { perf: performance.now(), t: P.t }; P.ptDone = -1;
    for (const pp of Eng.pausePoints) if (pp.t <= P.t) P.ptDone = pp.t;      // do not re-trigger points already passed
    drawOnce();
  }
  function replay() { pause(); seek(0); play(); }
  P.play = play; P.pause = pause; P.seek = seek; P.replay = replay; P.draw = drawOnce;

  /* ------------------------------------------------------------ UI */
  function buildUI() {
    const TL = Eng.TL, dur = P.dur;
    $('dur').textContent = fmt(dur);
    const sc = $('scrub'); sc.max = dur; sc.step = 0.05;
    const marks = $('marks');
    Eng.chapterStart.forEach((s, i) => { const m = document.createElement('i'); m.className = 'tick'; m.style.left = (s / dur * 100) + '%'; m.title = TL.chapters[i].label; marks.appendChild(m); });
    Eng.pausePoints.forEach(pp => { const m = document.createElement('b'); m.className = 'star'; m.style.left = (pp.t / dur * 100) + '%'; m.title = pp.label || 'Practice'; m.textContent = '★'; marks.appendChild(m); });
    const chs = $('chapters');
    TL.chapters.forEach((c, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chap'; b.textContent = c.label; b.dataset.i = i; b.addEventListener('click', () => { seek(Eng.chapterStart[i]); if (!P.playing) play(); }); chs.appendChild(b); });
    sc.addEventListener('input', () => { const was = P.playing; if (was) pause(); seek(+sc.value); if (was) play(); });
    $('btnPlay').addEventListener('click', () => (P.playing ? pause() : play()));
    $('btnReplay').addEventListener('click', replay);
    const vn = $('vn'), vm = $('vm'); vn.value = narr.volume; vm.value = music.volume;
    vn.addEventListener('input', () => { narr.volume = +vn.value; store.set('vn', +vn.value); });
    vm.addEventListener('input', () => { music.volume = +vm.value; store.set('vm', +vm.value); });
    const mute = $('mute'); mute.addEventListener('click', () => { const m = !narr.muted; narr.muted = music.muted = m; mute.setAttribute('aria-pressed', m); mute.textContent = m ? 'Unmute' : 'Mute'; });
    const cc = $('cc'); Eng.captions = store.get('cc', true); cc.setAttribute('aria-pressed', Eng.captions); cc.addEventListener('click', () => { Eng.captions = !Eng.captions; cc.setAttribute('aria-pressed', Eng.captions); store.set('cc', Eng.captions); drawOnce(); });
    const ap = $('autopause'); P.autoPause = store.get('ap', true); ap.checked = P.autoPause; ap.addEventListener('change', () => { P.autoPause = ap.checked; store.set('ap', ap.checked); });
    const sp = $('speed'); P.rate = store.get('rate', 1); sp.value = String(P.rate); sp.addEventListener('change', () => { P.rate = +sp.value; store.set('rate', P.rate); narr.playbackRate = music.playbackRate = P.rate; P.base = { perf: performance.now(), t: P.t }; });
    const fp = $('fps'); P.fps = store.get('fps', 30); fp.value = String(P.fps); fp.addEventListener('change', () => { P.fps = +fp.value; store.set('fps', P.fps); });
    $('full').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); });
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
    else if (k === 'c' || k === 'C') $('cc').click();
    else if (k === 'm' || k === 'M') $('mute').click();
    else if (k === 'f' || k === 'F') $('full').click();
    else if (k === 'r' || k === 'R') replay();
    else if (/^[1-4]$/.test(k)) { const h = Eng.hot[+k - 1]; if (h) { h.fn(); drawOnce(); } }
  }
  function curChapter() { let c = 0; Eng.chapterStart.forEach((s, i) => { if (P.t >= s - 0.01) c = i; }); return c; }
  function jumpChapter(d) { const c = curChapter(); let n = clamp(c + d, 0, Eng.chapterStart.length - 1); if (d < 0 && P.t - Eng.chapterStart[c] > 2) n = c; seek(Eng.chapterStart[n]); }
  function updateUI() {
    const sc = $('scrub'); sc.value = P.t; sc.style.setProperty('--p', (P.t / P.dur * 100) + '%'); $('time').textContent = fmt(P.t);
    sc.setAttribute('aria-valuetext', fmt(P.t) + ' of ' + fmt(P.dur));
    const c = curChapter(); document.querySelectorAll('.chap').forEach((b, i) => b.setAttribute('aria-current', i === c ? 'true' : 'false'));
  }
  function announceChapter() { const c = curChapter(); if (c !== P.lastCh) { P.lastCh = c; live('Chapter: ' + Eng.TL.chapters[c].label); } }
  let toastTimer = 0;
  function toast(msg, ms = 3500) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(hideToast, ms); live(msg); }
  function hideToast() { $('toast').hidden = true; }
  function live(msg) { $('live').textContent = ''; setTimeout(() => { $('live').textContent = msg; }, 30); }

  window.addEventListener('DOMContentLoaded', init);
})();
