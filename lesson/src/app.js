/* APP — lesson engine: state, timers, narration runner, controls, persistence, results. */
(function (FE) {
  'use strict';
  const { T, esc } = FE.ui, A = FE.Audio, Sp = FE.Speech;
  const SECTIONS = FE.SECTIONS;
  const KEY_P = 'fe-be-neg:progress:v1', KEY_S = 'fe-be-neg:settings:v1';
  const $ = (id) => document.getElementById(id);
  const CANCEL = { cancelled: true };
  const TOTAL = SECTIONS.reduce((t, s) => t + s.secs, 0);
  FE.TOTAL_SECONDS = TOTAL;

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };

  const defaults = () => ({ cc: 0, es: false, voiceEn: '', voiceEs: '', rate: 0.85, vSpeech: 1, vMusic: 0.5, vFx: 0.7, mute: false, auto: true, rm: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) });
  const fresh = () => ({
    v: 1, started: false, sec: 0, step: 0, paused: false,
    remain: SECTIONS.map((s) => s.secs), elapsed: SECTIONS.map(() => 0), tu: {}, visited: {}, rev: {}, data: {}, stats: {},
    support: true, lab: { extra: false, turn: 1, pic: 0 }, parts: { n: 8, rows: {} }, exit: { n: 8, rows: {} },
    quiz: { mode: 'shared', answers: {}, submitted: false, retry: false, ra: {}, retrySubmitted: false },
    notes: '', savedAt: 0
  });
  let cfg = Object.assign(defaults(), store.get(KEY_S) || {});
  let S = fresh();
  FE.getState = () => S; FE.getCfg = () => cfg;

  const saved = store.get(KEY_P);
  const hasSaved = !!(saved && saved.started && saved.v === 1);

  let saveT = null;
  function save() { clearTimeout(saveT); saveT = setTimeout(saveNow, 150); }
  function saveNow() { S.savedAt = Date.now(); store.set(KEY_P, S); }
  function saveCfg() { store.set(KEY_S, cfg); }

  /* ---------- run / cancel (all narration is a cancellable run) ---------- */
  let runId = 0; const waiters = new Set();
  function cancelRun() {
    runId++;
    waiters.forEach((w) => { clearTimeout(w.h); w.rej(CANCEL); }); waiters.clear();
    Sp.cancel();
  }
  FE.cancelRun = cancelRun;
  const stage = () => $('stage');
  const cur = () => SECTIONS[S.sec].steps[S.step];

  function setCaption(text, lang) {
    FE.cap = { text, lang };
    const box = $('caption'); if (!box) return;
    if (!text) { box.innerHTML = ''; return; }
    box.innerHTML = lang === 'es' ? `<span class="tx es"><span class="en">${esc(text)}</span></span>` : T(text, 'capt');
  }

  function makeCtx(auto) {
    const c = {
      S, cfg, fx: A, step: cur(), st: (S.data[cur().id] = S.data[cur().id] || {}), id: runId, auto: !!auto, taken: false,
      q: (s) => stage().querySelector(s), qa: (s) => [...stage().querySelectorAll(s)],
      async say(t, o) {
        if (c.auto && !c.taken) { cancelRun(); c.id = runId; c.taken = true; }
        // interactive (button) contexts end quietly when something newer takes over the voice
        if (c.id !== runId) { if (c.auto) return; throw CANCEL; }
        setCaption(t, o && o.lang);
        await Sp.say(t, o);
        if (c.id !== runId && !c.auto) throw CANCEL;
      },
      wait(ms) {
        if (c.auto && !c.taken) { cancelRun(); c.id = runId; c.taken = true; }
        return new Promise((res, rej) => {
          if (c.id !== runId) return rej(CANCEL);
          const w = { rej, h: setTimeout(() => { waiters.delete(w); c.id !== runId ? rej(CANCEL) : res(); }, ms) };
          waiters.add(w);
        });
      },
      beat(n) {
        c.qa('[data-b]').forEach((e) => e.classList.toggle('on', +e.dataset.b <= n));
        c.qa('[data-x]').forEach((e) => e.classList.toggle('out', +e.dataset.x <= n));
      },
      gesture(sel, side, pose, hold = 2400) {
        const el = c.q(sel); if (!el || cfg.rm) return;
        FE.setPose(el, side, pose); setTimeout(() => FE.setPose(el, side, 'rest'), hold);
      },
      rerender: () => rerender(), save, goto, openResults, afterTimer,
      stat(k, n) { const o = (S.stats[k] = S.stats[k] || { n: 0 }); o.n += n; save(); },
      setSupport(on) { S.support = on; document.body.classList.toggle('no-support', !on); syncSupportBtn(); save(); },
      setRevealed: (on, silent) => setRevealed(on, silent)
    };
    return c;
  }

  function startRun(fn) {
    cancelRun();
    const c = makeCtx(false);
    Promise.resolve().then(() => fn(c)).catch((e) => { if (e !== CANCEL) console.error(e); });
    return c;
  }

  /* ---------- rendering ---------- */
  function render(anim) {
    const step = cur();
    const c = makeCtx(true);
    stage().innerHTML = step.html(c);
    stage().className = 'stage' + (S.rev[step.id] ? ' rev' : '') + (anim === false ? ' noanim' : '');
    stage().dataset.step = step.id;
    c.beat(99);
    updateReveal();
  }
  function rerender() {
    const sc = stage().scrollTop;
    render(false);
    stage().scrollTop = sc;
  }

  function updateReveal() {
    const b = $('btnReveal'), has = !!stage().querySelector('.ans');
    const on = !!S.rev[cur().id];
    b.disabled = !has;
    b.setAttribute('aria-pressed', on);
    b.querySelector('span').textContent = on ? 'Hide Answer' : 'Reveal Answer';
    b.title = has ? '' : (cur().noAuto ? 'Answers appear after you submit' : 'Nothing to reveal on this screen');
  }
  function setRevealed(on, silent) {
    const step = cur();
    S.rev[step.id] = on;
    stage().classList.toggle('rev', on);
    updateReveal(); save();
    if (on) { const a = stage().querySelector('.ans'); a && a.scrollIntoView && a.scrollIntoView({ block: 'nearest', behavior: cfg.rm ? 'auto' : 'smooth' }); }
    if (on && !silent) { A.reveal(); if (step.onReveal) startRun((c) => step.onReveal(c)); }
  }

  /* ---------- navigation ---------- */
  function goto(si, i, opt = {}) {
    cancelRun();
    const prevSec = S.sec;
    S.sec = si; S.step = i;
    const step = cur(); S.visited[step.id] = true;
    stage().scrollTop = 0;
    if (step.enter) step.enter(makeCtx(true));
    render(true);
    if (S.started && prevSec !== si) A.whoosh();
    document.body.classList.toggle('calm', !!(step.quiet));
    document.body.classList.toggle('no-support', !S.support);
    A.setQuiet(!step.mus); A.bed(!!(step.mus && S.started && !S.paused));
    setCaption(step.say ? step.say[0] : '', 'en');
    $('live').textContent = `Section ${SECTIONS[si].id}, ${step.title.replace(/[→]/g, 'to')}`;
    updateChrome(); updateEs();
    if (step.finishFx && S.started) { /* ending chord is part of the step run */ }
    if (S.started && !S.paused && cfg.auto && !step.noAuto) narrate(step, opt.delay || 0);
    save();
  }
  function narrate(step, delay) {
    if (!step.run && !step.say) return;
    stage().querySelectorAll('[data-b]').length && makeCtx(true).beat(0);
    startRun(async (c) => {
      if (delay) await c.wait(delay);
      await c.wait(350);
      if (step.run) await step.run(c);
      else for (const l of step.say) { await c.say(l); await c.wait(300); }
      c.beat(99);
    });
  }
  function replay() {
    const step = cur(); if (S.paused) setPaused(false, true);
    if (step.noAuto && !step.model) return;
    stage().querySelectorAll('[data-b]').length && step.run && makeCtx(true).beat(0);
    startRun(async (c) => {
      if (step.run) { await step.run(c); c.beat(99); return; }
      const m = step.model ? [].concat(step.model) : (step.say || []);
      for (const l of m) { await c.say(l); await c.wait(500); }
    });
  }
  function next() {
    const sec = SECTIONS[S.sec];
    if (S.step < sec.steps.length - 1) goto(S.sec, S.step + 1);
    else if (S.sec < SECTIONS.length - 1) goto(S.sec + 1, 0);
    else openResults();
  }
  function prev() {
    if (S.step > 0) goto(S.sec, S.step - 1);
    else if (S.sec > 0) goto(S.sec - 1, SECTIONS[S.sec - 1].steps.length - 1);
  }
  function skipTimer() {
    if (S.sec < SECTIONS.length - 1) { toast('Timer skipped. Next section.'); goto(S.sec + 1, 0); }
    else { S.remain[S.sec] = 0; renderTimer(); openResults(); }
  }
  function extend(sec) {
    S.remain[S.sec] += sec; if (S.remain[S.sec] > 0) delete S.tu[S.sec];
    renderTimer(); save(); toast(sec >= 60 ? 'Added 1 minute' : 'Added 30 seconds');
  }
  function setPaused(p, silent) {
    S.paused = p;
    $('btnPlay').setAttribute('aria-pressed', p);
    $('btnPlay').querySelector('span').textContent = p ? 'Play' : 'Pause';
    $('pausedBadge').hidden = !p;
    if (p) { cancelRun(); A.bed(false); makeCtx(true).beat(99); }
    else { A.bed(!!cur().mus); if (!silent) replay(); }
    save();
  }

  /* ---------- timer ---------- */
  const mmss = (s) => { const a = Math.abs(Math.round(s)); return String(Math.floor(a / 60)).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0'); };
  FE.mmss = mmss;
  const outside = () => !!cur().outside;
  function renderTimer() {
    const r = S.remain[S.sec], over = r < 0;
    const tl = $('tleft'); tl.textContent = (over ? '+' : '') + mmss(r); $('timer').classList.toggle('over', over);
    $('tsec').textContent = outside() ? 'Optional' : 'Section ' + SECTIONS[S.sec].id;
    const el = S.elapsed.reduce((a, b) => a + b, 0);
    $('tall').textContent = outside() ? 'outside the 60-minute timer' : 'Elapsed ' + mmss(el) + ' · planned ' + mmss(TOTAL);
  }
  let lastTick = performance.now(), ticks = 0;
  setInterval(() => {
    const now = performance.now(); let dt = Math.min((now - lastTick) / 1000, 2); lastTick = now;
    if (!S.started || S.paused || outside() || $('overlayStart') && !$('overlayStart').hidden) return;
    S.remain[S.sec] -= dt; S.elapsed[S.sec] += dt;
    if (S.remain[S.sec] <= 0 && !S.tu[S.sec]) { S.tu[S.sec] = 1; A.timeUp(); toast('Time is up for this section. Extend, or move on when you are ready.'); }
    renderTimer();
    if (++ticks % 20 === 0) saveNow();
  }, 250);

  /* ---------- chrome ---------- */
  function buildChips() {
    $('chips').innerHTML = SECTIONS.map((s, i) => `<button class="chip-sec" data-sec="${i}" aria-label="Section ${s.id}: ${esc(s.title)}"><b>${s.id}</b></button>`).join('');
  }
  function updateChrome() {
    $('chips').querySelectorAll('.chip-sec').forEach((b, i) => {
      const s = SECTIONS[i], v = s.steps.filter((st) => S.visited[st.id]).length;
      b.classList.toggle('cur', i === S.sec); b.classList.toggle('done', v === s.steps.length && i !== S.sec);
      b.setAttribute('aria-current', i === S.sec ? 'step' : 'false');
      b.title = `${s.title} (${s.start}–${s.end})`;
    });
    $('secTitle').textContent = SECTIONS[S.sec].title + ' · ' + (S.step + 1) + '/' + SECTIONS[S.sec].steps.length;
    $('btnPrev').disabled = S.sec === 0 && S.step === 0;
    renderTimer(); updateReveal();
  }
  function updateEs() {
    const box = $('es'); box.hidden = !cfg.es;
    if (!cfg.es) return;
    const t = cur().es || 'Sin ayuda para esta pantalla.';
    box.querySelector('.estext').textContent = t; box.dataset.t = t;
  }
  function applyCfg() {
    document.body.dataset.cc = cfg.cc; document.body.classList.toggle('ipa-on', cfg.cc === 2); document.body.classList.toggle('cc-on', cfg.cc >= 1);
    document.body.classList.toggle('rm', !!cfg.rm);
    $('btnCC').querySelector('span').textContent = ['Off', 'Captions', 'Captions + IPA'][cfg.cc];
    $('btnCC').setAttribute('aria-label', 'CC/IPA: ' + ['Off', 'Captions', 'Captions and IPA'][cfg.cc] + '. Press to change.');
    $('btnES').setAttribute('aria-pressed', cfg.es);
    $('caption').hidden = cfg.cc === 0;
    Sp.rate = cfg.rate; Sp.vol = cfg.vSpeech; Sp.mute = cfg.mute;
    A.setVolume('music', cfg.vMusic); A.setVolume('fx', cfg.vFx);
    $('btnMute').setAttribute('aria-pressed', cfg.mute); $('btnMute').querySelector('span').textContent = cfg.mute ? 'Narration muted' : 'Narration on';
    $('rate').value = cfg.rate; $('rateOut').textContent = cfg.rate.toFixed(2) + '×'; $('rate2').value = cfg.rate;
    $('vSpeech').value = cfg.vSpeech; $('vMusic').value = cfg.vMusic; $('vFx').value = cfg.vFx;
    $('chkMute').checked = cfg.mute; $('chkAuto').checked = cfg.auto; $('chkRm').checked = cfg.rm;
    saveCfg(); updateEs();
    if (FE.cap) setCaption(FE.cap.text, FE.cap.lang);
    if (cfg.es === false && $('es')) $('es').hidden = true;
  }
  FE.applyCfg = applyCfg;

  /* ---------- toast / confirm ---------- */
  let toastT;
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3200); }
  FE.toast = toast;
  function confirmDlg(title, text, ok = 'Confirm') {
    return new Promise((res) => {
      const d = $('dlgConfirm'); $('cfTitle').textContent = title; $('cfText').textContent = text; $('cfOk').textContent = ok;
      const done = (v) => { d.close(); res(v); };
      $('cfOk').onclick = () => done(true); $('cfNo').onclick = () => done(false); d.oncancel = () => res(false);
      d.showModal(); $('cfNo').focus();
    });
  }
  FE.confirm = confirmDlg;

  /* ---------- global stage actions ---------- */
  const NORM = FE.ui;
  const GLOBAL = {
    say: (c, el) => startRun((r) => r.say(el.dataset.say)),
    check: (c, el) => {
      const box = el.closest('.typed'), inp = box.querySelector('input'), fb = box.querySelector('.fb');
      const r = NORM.typedFeedback(inp.value, JSON.parse(box.dataset.accepted), box.dataset.hint);
      fb.textContent = r.msg; fb.className = 'fb ' + (r.ok ? 'ok' : 'try');
      const st = (S.stats[cur().id] = S.stats[cur().id] || { n: 0, tries: 0, ok: 0 }); st.tries = (st.tries || 0) + 1;
      if (r.ok) { st.ok = 1; A.good(); setRevealed(true, true); } else A.soft();
      save();
    },
    support: () => { S.support = !S.support; document.body.classList.toggle('no-support', !S.support); A.tick(); save(); rerender(); syncSupportBtn(); },
    extra: () => { S.lab.extra = !S.lab.extra; A.tick(); save(); rerender(); },
    newpic: () => { S.lab.pic = (S.lab.pic + 1) % 3; A.tick(); save(); rerender(); },
    turn: () => { S.lab.turn++; A.tick(); save(); rerender(); },
    ptog: (c, el) => { const r = (S.parts.rows[el.dataset.n] = S.parts.rows[el.dataset.n] || {}); r[el.dataset.r] = el.checked; save(); },
    padd: () => { S.parts.n = Math.min(30, S.parts.n + 1); save(); rerender(); const d = stage().querySelector('details'); d && (d.open = true); },
    prem: () => { const n = S.parts.n; delete S.parts.rows[n]; S.parts.n = Math.max(1, n - 1); save(); rerender(); const d = stage().querySelector('details'); d && (d.open = true); },
    etog: (c, el) => { const r = (S.exit.rows[el.dataset.n] = S.exit.rows[el.dataset.n] || {}); r[el.dataset.k] = el.checked; save(); },
    eadd: () => { S.exit.n = Math.min(30, S.exit.n + 1); save(); rerender(); },
    erem: () => { const n = S.exit.n; delete S.exit.rows[n]; S.exit.n = Math.max(1, n - 1); save(); rerender(); },
    submit: async () => {
      const qz = S.quiz, un = FE.QUIZ.filter((q) => !qz.answers[q.n]).length;
      if (un && !(await confirmDlg('Submit with unanswered questions?', un + ' unanswered question' + (un > 1 ? 's' : '') + ' will count as incorrect.', 'Submit'))) return;
      qz.submitted = true; A.good(); save(); goto(7, 11);
    },
    'submit-retry': () => { S.quiz.retrySubmitted = true; A.good(); save(); goto(7, 11); },
    goresults: () => goto(7, 11)
  };
  function syncSupportBtn() { const b = $('btnSupport'); b.setAttribute('aria-pressed', !!S.support); b.querySelector('span').textContent = 'Support: ' + (S.support ? 'On' : 'Off'); }

  function onStageClick(e) {
    const el = e.target.closest('[data-act]'); if (!el || !stage().contains(el)) return;
    const act = el.dataset.act, step = cur(), c = makeCtx(true);
    const h = (step.acts && step.acts[act]) || GLOBAL[act];
    if (h) Promise.resolve(h(c, el, e)).catch((err) => { if (err !== CANCEL) console.error(err); });
  }

  /* ---------- after-class optional timer (outside the lesson clock) ---------- */
  let afterIv = null;
  function afterTimer() {
    clearInterval(afterIv); let left = 120; const out = () => ($('aftertime') ? ($('aftertime').textContent = mmss(left)) : 0);
    out(); afterIv = setInterval(() => { left--; out(); if (left <= 0) { clearInterval(afterIv); A.timeUp(); toast('Practice time finished.'); } }, 1000);
  }

  /* ---------- results & export ---------- */
  function summary() {
    const sections = SECTIONS.map((s, i) => {
      const v = s.steps.filter((st) => S.visited[st.id]).length;
      return { id: s.id, title: s.title, plannedSeconds: s.secs, elapsedSeconds: Math.round(S.elapsed[i]), stepsVisited: v, stepsTotal: s.steps.length, completed: v === s.steps.length };
    });
    const sc = FE.quizScores(S);
    const qz = S.quiz;
    const label = qz.mode === 'shared' ? 'Class activity score (teacher-entered shared answers)' : 'Individual score (this device only)';
    const items = FE.QUIZ.map((q) => ({ question: q.n, chosen: qz.answers[q.n] || null, correct: FE.quizLetter(q.n), firstAttemptCorrect: qz.answers[q.n] === FE.quizLetter(q.n), retryChoice: qz.ra[q.n] || null, retryCorrect: qz.ra[q.n] ? qz.ra[q.n] === FE.quizLetter(q.n) : null }));
    const cnt = (rows, keys) => Object.keys(rows).map((n) => ({ learner: +n, ...Object.fromEntries(keys.map((k) => [k, !!rows[n][k]])) }));
    return {
      lesson: 'Fluent English — Be: Negatives (A1)', exportedAt: new Date().toISOString(), note: 'Anonymous local summary. No names or contact details are stored.',
      plannedMinutes: TOTAL / 60, sections,
      assessment: { mode: qz.mode, scoreLabel: label, submitted: qz.submitted, firstAttempt: qz.submitted ? { score: sc.first, outOf: 10 } : null, retry: qz.retrySubmitted ? { score: sc.retry, outOf: sc.retryTotal } : null, items },
      participationChecklist: { note: 'Teacher-entered, anonymous learner numbers', rounds: ['A', 'B', 'C'], learners: cnt(S.parts.rows, ['A', 'B', 'C']) },
      exitChecklist: { criteria: ['beForm', 'notPlacement', 'contraction', 'independent'], learners: cnt(S.exit.rows, ['be', 'not', 'con', 'ind']) },
      practiceInteractions: S.stats, teacherNotes: S.notes
    };
  }
  FE.summary = summary;
  const csvE = (v) => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  function toCSV(s) {
    const L = [['section', 'id', 'title', 'planned_seconds', 'elapsed_seconds', 'steps_visited', 'steps_total', 'completed']];
    s.sections.forEach((r) => L.push(['section', r.id, r.title, r.plannedSeconds, r.elapsedSeconds, r.stepsVisited, r.stepsTotal, r.completed]));
    L.push([]); L.push(['assessment_item', 'question', 'chosen', 'correct', 'first_attempt_correct', 'retry_choice', 'retry_correct']);
    s.assessment.items.forEach((i) => L.push(['assessment_item', i.question, i.chosen, i.correct, i.firstAttemptCorrect, i.retryChoice, i.retryCorrect]));
    L.push([]); L.push(['score', 'label', 'mode', 'first_attempt', 'retry']);
    L.push(['score', s.assessment.scoreLabel, s.assessment.mode, s.assessment.firstAttempt ? s.assessment.firstAttempt.score + '/10' : '', s.assessment.retry ? s.assessment.retry.score + '/' + s.assessment.retry.outOf : '']);
    L.push([]); L.push(['participation', 'learner', 'round_A', 'round_B', 'round_C']);
    s.participationChecklist.learners.forEach((r) => L.push(['participation', r.learner, r.A, r.B, r.C]));
    L.push([]); L.push(['exit_checklist', 'learner', 'be_form', 'not_placement', 'contraction', 'independent']);
    s.exitChecklist.learners.forEach((r) => L.push(['exit_checklist', r.learner, r.be, r.not, r.con, r.ind]));
    L.push([]); L.push(['teacher_notes', s.teacherNotes]);
    return L.map((r) => r.map(csvE).join(',')).join('\n');
  }
  FE.toCSV = toCSV;
  function openResults() {
    cancelRun();
    const s = summary(), qz = S.quiz;
    $('resBody').innerHTML = `
      <h3>Lesson sections</h3>
      <table class="rt"><thead><tr><th>Section</th><th>Planned</th><th>Actual</th><th>Screens visited</th><th>Status</th></tr></thead><tbody>
      ${s.sections.map((r) => `<tr><td>${r.id}. ${esc(r.title)}</td><td>${mmss(r.plannedSeconds)}</td><td>${mmss(r.elapsedSeconds)}</td><td>${r.stepsVisited}/${r.stepsTotal}</td><td>${r.completed ? 'Completed' : r.stepsVisited ? 'In progress' : 'Not started'}</td></tr>`).join('')}
      </tbody></table>
      <h3>Ten-question check</h3>
      <p><b>${esc(s.assessment.scoreLabel)}</b></p>
      <p>First attempt: <b>${s.assessment.firstAttempt ? s.assessment.firstAttempt.score + ' / 10' : 'not submitted'}</b> &nbsp; Retry (missed items only): <b>${s.assessment.retry ? s.assessment.retry.score + ' / ' + s.assessment.retry.outOf : 'not done'}</b></p>
      <p class="small">${qz.mode === 'shared' ? 'Shared mode: the teacher entered the class’s choices. This is a class activity score, not individual mastery.' : 'Individual mode: this score lives only in this browser.'}</p>
      <h3>Teacher notes (anonymous)</h3>
      <label class="sr" for="notes">Teacher notes</label><textarea id="notes" rows="4" placeholder="No names or personal details, please.">${esc(S.notes || '')}</textarea>
      <p class="small">Nothing is uploaded or emailed. Downloads happen only when you press a button.</p>`;
    $('notes').addEventListener('input', (e) => { S.notes = e.target.value; save(); });
    $('dlgRes').showModal();
  }
  FE.openResults = openResults;

  /* ---------- start / resume / reset ---------- */
  function showApp() { $('app').hidden = false; $('overlayStart').hidden = true; }
  function beginAudio() { A.unlock(); A.applyVolumes(); }
  function startNew() {
    store.del(KEY_P); S = fresh(); S.started = true;
    beginAudio(); showApp(); $('btnPlay').querySelector('span').textContent = 'Pause'; $('pausedBadge').hidden = true;
    A.theme(); goto(0, 0, { delay: 3200 });
  }
  function resume() {
    S = Object.assign(fresh(), saved); S.paused = false; S.started = true;
    beginAudio(); showApp(); A.whoosh();
    document.body.classList.toggle('no-support', !S.support); syncSupportBtn();
    goto(S.sec, S.step);
  }
  async function reset() {
    if (!(await confirmDlg('Reset the lesson?', 'This clears progress, timers, scores, checklists and notes on this device. Your voice and display settings stay.', 'Reset lesson'))) return;
    cancelRun(); A.bed(false); store.del(KEY_P); S = fresh();
    $('app').hidden = true; $('overlayStart').hidden = false; $('resumeBox').hidden = true; $('btnStart').textContent = 'Start Lesson';
    document.body.classList.remove('calm'); toast('Lesson reset.');
    $('btnStart').focus();
  }

  /* ---------- voices UI ---------- */
  function fillVoices() {
    const en = Sp.enVoices(), es = Sp.esVoices();
    const opt = (v) => `<option value="${esc(v.voiceURI)}">${esc(v.name)} (${esc(v.lang)})</option>`;
    $('selEn').innerHTML = '<option value="">Automatic (best American English voice)</option>' + en.map(opt).join('');
    $('selEs').innerHTML = '<option value="">Automatic (Spanish)</option>' + es.map(opt).join('');
    $('selEn').value = cfg.voiceEn; $('selEs').value = cfg.voiceEs;
    Sp.pick(cfg.voiceEn, cfg.voiceEs);
    $('voiceNote').textContent = !Sp.supported ? 'This browser has no speech synthesis. Captions and visuals still work.'
      : (en.length ? `${en.length} English and ${es.length} Spanish voice${es.length === 1 ? '' : 's'} found. Voice quality depends on your device and browser.` : 'No English voices are loaded yet. Voices may appear in a moment. Captions work either way.');
  }

  /* ---------- boot ---------- */
  function boot() {
    document.body.insertAdjacentHTML('afterbegin', FE.defs);
    buildChips(); applyCfg();
    Sp.init(fillVoices);
    $('overlayStart').hidden = false;
    if (hasSaved) {
      const st = SECTIONS[saved.sec], step = st.steps[saved.step];
      $('resumeBox').hidden = false;
      $('resumeInfo').textContent = `Saved lesson found: Section ${st.id}, ${step.title.replace(/→/g, 'to')} · ${mmss(saved.remain[saved.sec])} left in this section.`;
    }
    $('btnStart').onclick = async () => {
      if (hasSaved && !(await confirmDlg('Start a new lesson?', 'The saved lesson on this device will be cleared.', 'Start new'))) return;
      startNew();
    };
    $('btnResume').onclick = resume;
    stage().addEventListener('click', onStageClick);
    stage().addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('.typed input')) { e.preventDefault(); e.target.closest('.typed').querySelector('[data-act="check"]').click(); } });
    $('chips').addEventListener('click', (e) => { const b = e.target.closest('.chip-sec'); if (b) goto(+b.dataset.sec, 0); });

    $('btnPrev').onclick = prev; $('btnNext').onclick = next;
    $('btnPlay').onclick = () => setPaused(!S.paused);
    $('btnReplay').onclick = replay;
    $('btnReveal').onclick = () => { if (!$('btnReveal').disabled) setRevealed(!S.rev[cur().id]); };
    $('btnExt30').onclick = () => extend(30); $('btnExt60').onclick = () => extend(60);
    $('btnSkip').onclick = skipTimer; $('btnReset').onclick = reset;
    $('btnSupport').onclick = () => { GLOBAL.support(); };
    $('btnCC').onclick = () => { cfg.cc = (cfg.cc + 1) % 3; applyCfg(); A.tick(); };
    $('btnES').onclick = () => { cfg.es = !cfg.es; applyCfg(); };
    $('btnEsSay').onclick = () => { const t = $('es').dataset.t; if (t) startRun((c) => c.say(t, { lang: 'es' })); };
    $('btnMute').onclick = () => { cfg.mute = !cfg.mute; if (cfg.mute) Sp.cancel(); applyCfg(); };
    $('btnSet').onclick = () => $('dlgSet').showModal();
    $('btnMenu').onclick = openMenu;
    $('btnRes').onclick = openResults;
    $('btnKeys').onclick = () => $('dlgKeys').showModal();
    const fs = $('btnFull');
    if (!document.documentElement.requestFullscreen) fs.hidden = true;
    fs.onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => toast('Fullscreen is not available here.')); };
    document.addEventListener('fullscreenchange', () => { fs.setAttribute('aria-pressed', !!document.fullscreenElement); });

    const bindRange = (id, fn) => $(id).addEventListener('input', (e) => { fn(parseFloat(e.target.value)); applyCfg(); });
    bindRange('rate', (v) => (cfg.rate = v)); bindRange('rate2', (v) => (cfg.rate = v));
    bindRange('vSpeech', (v) => (cfg.vSpeech = v)); bindRange('vMusic', (v) => (cfg.vMusic = v)); bindRange('vFx', (v) => (cfg.vFx = v));
    $('chkMute').onchange = (e) => { cfg.mute = e.target.checked; if (cfg.mute) Sp.cancel(); applyCfg(); };
    $('chkAuto').onchange = (e) => { cfg.auto = e.target.checked; applyCfg(); };
    $('chkRm').onchange = (e) => { cfg.rm = e.target.checked; applyCfg(); };
    $('selEn').onchange = (e) => { cfg.voiceEn = e.target.value; Sp.pick(cfg.voiceEn, cfg.voiceEs); saveCfg(); };
    $('selEs').onchange = (e) => { cfg.voiceEs = e.target.value; Sp.pick(cfg.voiceEn, cfg.voiceEs); saveCfg(); };
    $('btnTestEn').onclick = () => { beginAudio(); startRun((c) => c.say("I'm not tired. She isn't here.")); };
    $('btnTestEs').onclick = () => { beginAudio(); startRun((c) => c.say('Hola. Esta es la voz de ayuda en español.', { lang: 'es' })); };
    $('btnTestFx').onclick = () => { beginAudio(); A.good(); };
    $('btnTestMusic').onclick = () => { beginAudio(); A.theme(); };
    document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => $(b.dataset.close).close()));
    $('btnJson').onclick = () => FE.ui.download('fluent-english-be-negatives-summary.json', JSON.stringify(summary(), null, 2), 'application/json');
    $('btnCsv').onclick = () => FE.ui.download('fluent-english-be-negatives-summary.csv', toCSV(summary()), 'text/csv');

    document.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', saveNow);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
  }

  function openMenu() {
    $('menuBody').innerHTML = SECTIONS.map((s, i) => `<section class="msec ${i === S.sec ? 'cur' : ''}"><h4><b>${s.id}</b> ${esc(s.title)} <small>${s.start}–${s.end} · ${mmss(s.secs)}</small></h4><div class="msteps">${s.steps.map((st, k) => `<button class="mstep ${i === S.sec && k === S.step ? 'cur' : ''} ${S.visited[st.id] ? 'seen' : ''}" data-go="${i}:${k}">${esc(st.title.replace(/→/g, 'to'))}</button>`).join('')}</div></section>`).join('');
    $('menuBody').onclick = (e) => { const b = e.target.closest('[data-go]'); if (!b) return; const [i, k] = b.dataset.go.split(':').map(Number); $('dlgMenu').close(); goto(i, k); };
    $('dlgMenu').showModal();
  }

  function onKey(e) {
    if (e.target.closest('input,textarea,select') || document.querySelector('dialog[open]') || e.ctrlKey || e.metaKey || e.altKey) return;
    if ($('app').hidden) return;
    const k = e.key;
    if (k === 'ArrowRight') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (k === ' ' && !e.target.closest('button,summary,a')) { e.preventDefault(); setPaused(!S.paused); }
    else if (k === 'r' || k === 'R') replay();
    else if (k === 'a' || k === 'A') $('btnReveal').click();
    else if (k === 'c' || k === 'C') $('btnCC').click();
    else if (k === 's' || k === 'S') $('btnES').click();
    else if (k === 'm' || k === 'M') $('btnMute').click();
    else if (k === 'f' || k === 'F') $('btnFull').click();
    else if (k === '?') $('btnKeys').click();
  }

  // speech events -> caption highlight
  FE.onSpeakStart = () => document.body.classList.add('speaking');
  FE.onSpeakEnd = () => document.body.classList.remove('speaking');

  // test hooks (used by the automated test script; harmless in normal use)
  FE.api = { goto, next, prev, replay, setPaused, extend, skipTimer, summary, toCSV, state: () => S, cfg: () => cfg, SECTIONS, startNew, resume, cur, GLOBAL, setRevealed, cancelRun, renderTimer, mmss };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.FE = window.FE || {});
