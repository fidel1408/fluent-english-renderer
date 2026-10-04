/* ===== Core helpers, state, persistence, reusable components ===== */
const CANCEL = { cancel: true };
const ACT_MIN = [5, 7, 8, 6, 7, 8, 7, 8, 4];          // default activity minutes (sum = 60)
const KEY = 'fluent-english-be-lesson-v1';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (sec) => { sec = Math.round(sec); const s = Math.abs(sec); return (sec < 0 ? '+' : '') + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

/** Teaching text with IPA line directly beneath. *word* = highlight. o.be colors am/is/are. */
function tx(text, o = {}) {
  const plain = text.replace(/\*/g, '');
  const parts = text.split(/(\*[^*]+\*)/).map((p) => {
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return `<b class="hl">${esc(p.slice(1, -1).replace(/'/g, '’'))}</b>`;
    let h = esc(p.replace(/'/g, '’'));
    if (o.be) h = h.replace(/\b(am|is|are)\b/g, (m) => `<span class="be-${m}">${m}</span>`);
    return h;
  }).join('');
  const ip = IPA.line(plain);
  return `<span class="tx${o.block ? ' block' : ''}${o.cls ? ' ' + o.cls : ''}"><span class="w">${parts}</span><span class="ipa${ip.unk ? ' unk' : ''}">${esc(ip.text)}</span></span>`;
}
const P = (text, cls = '') => `<div class="${cls}">${tx(text)}</div>`;
const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const shuffle = (arr, seed) => { const a = arr.slice(), r = rng(seed * 977 + 13); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- state ---------- */
const fresh = () => ({
  v: 1, started: false, a: 0, b: 0, spent: Array(9).fill(0), extra: Array(9).fill(0), skipped: Array(9).fill(0), visited: {}, done: {}, answerLog: [], retryRound: 0,
  diag: {}, picks: {}, mode: 'shared',
  mcq: { shared: { first: {}, retry: {} }, individual: { first: {}, retry: {} } }, retry: { active: false },
  classScore: '', labels: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'], part: {}, exit: {}, notes: '', savedAt: 0,
  settings: { ts: 1, cc: 'cap', voice: '', voiceMale: '', voiceFemale: '', voiceEs: '', localOnly: false, rate: 0.9, vSpeech: 1, vMusic: 0.5, vSfx: 0.7, mute: false, rm: false },
});
let S = fresh();
function loadSaved() { try { const j = JSON.parse(localStorage.getItem(KEY)); return j && j.v === 1 ? j : null; } catch (e) { return null; } }
let saveT = null;
function save(now) {
  const go = () => { try { S.savedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  if (now) go(); else { clearTimeout(saveT); saveT = setTimeout(go, 400); }
}
function mergeState(saved) {
  const f = fresh(), defSettings = f.settings, defMcq = f.mcq;
  S = Object.assign(f, saved);
  S.settings = Object.assign({}, defSettings, saved.settings || {});          // defaults first, so keys added in newer versions exist
  S.mcq = { shared: Object.assign({ first: {}, retry: {} }, (saved.mcq || {}).shared), individual: Object.assign({ first: {}, retry: {} }, (saved.mcq || {}).individual) };
  S.retry = Object.assign({ active: false }, saved.retry || {});
  ['spent', 'extra', 'skipped'].forEach((k) => { if (!Array.isArray(S[k]) || S[k].length !== 9) S[k] = Array(9).fill(0); });
  if (!Array.isArray(S.answerLog)) S.answerLog = [];
  void defMcq;
}
function toast(msg, ms = 2200) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), ms); }

/* ---------- modal ---------- */
const MODALS = [];
function modal(html, o = {}) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${o.cls || ''}" role="dialog" aria-modal="true" aria-label="${esc(o.label || 'Dialog')}" tabindex="-1">${html}</div>`;
  const prev = document.activeElement;
  const m = $('.modal', bg);
  const onKey = (e) => {
    if (MODALS[MODALS.length - 1] !== close) return;          // only the top-most dialog reacts
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(); }
    else if (e.key === 'Tab') {                                // keep keyboard focus inside the dialog
      const f = $$('button,[href],input,select,textarea,video,[tabindex]:not([tabindex="-1"])', m).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) { e.preventDefault(); m.focus(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === m)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  function close() {
    const i = MODALS.indexOf(close); if (i < 0) return; MODALS.splice(i, 1);
    bg.remove(); document.removeEventListener('keydown', onKey, true);
    if (prev && prev.focus && document.body.contains(prev)) prev.focus();
    o.onClose && o.onClose();
  }
  MODALS.push(close);
  document.addEventListener('keydown', onKey, true);
  bg.addEventListener('mousedown', (e) => { if (e.target === bg) close(); });
  $('#modal-root').appendChild(bg);
  m.focus();
  $$('[data-close]', bg).forEach((b) => b.addEventListener('click', close));
  return { el: m, close };
}
function confirmBox(title, text, okLabel, onOk) {
  const m = modal(`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="ft"><button class="btn alt" data-close>Cancel</button><button class="btn coral" id="cfm-ok">${esc(okLabel)}</button></div>`, { label: title });
  $('#cfm-ok', m.el).addEventListener('click', () => { m.close(); onOk(); });
}

/* ---------- components ---------- */
const Comp = {};

/** Click-to-build sentence. it: {pic, instr, target[], extra[], tips{}, explain, say(prompt), full(sentence to speak)} */
Comp.build = (it, seed) => {
  const toks = it.target, all = shuffle(toks.concat(it.extra || []), seed || 1);
  const sentence = it.full || toks.join(' ');
  const html = `<div class="cols"><div>${it.pic || ''}</div>
    <div class="stack" data-build>
      <div class="instr">${tx(it.instr)}</div>
      <div class="slotline" data-slot aria-label="Your sentence"></div>
      <div class="row" data-tiles>${all.map((t, i) => `<button class="tile" data-t="${esc(t)}" data-i="${i}">${tx(t.replace(/'/g, "'"))}</button>`).join('')}</div>
      <div class="fb" data-fb aria-live="polite"></div>
      <div class="row"><button class="btn alt sm" data-reset>Clear</button></div>
      <div class="ans ans-box" data-done><div class="mid-sentence">${tx(sentence, { be: 1 })}</div><div class="meaning" style="margin-top:.4rem">${tx(it.explain)}</div></div>
    </div></div>`;
  const bind = (A) => {
    const root = A.root; let pos = 0, finished = false;
    const slot = $('[data-slot]', root), fb = $('[data-fb]', root);
    const setFb = (m, bad) => { fb.innerHTML = m ? `<div class="meaning" style="${bad ? 'border-color:#c9644d;background:#fdf0ec' : 'border-color:#1c8a5a;background:#e6f6ee'}">${tx(m)}</div>` : ''; };
    const finish = (viaReveal) => {
      finished = true; slot.innerHTML = toks.map((t) => `<span class="chip">${tx(t, { be: 1 })}</span>`).join('');
      $$('.tile', root).forEach((b) => b.classList.add('used'));
      setFb(''); root.classList.add('revealed');   // the explanation is shown once, in the answer box
      if (!viaReveal) { Sound.sfx('correct'); A.sayBg([sentence]); } else A.sayBg([sentence]);
    };
    $$('.tile', root).forEach((b) => b.addEventListener('click', () => {
      if (finished) return;
      const t = b.dataset.t;
      if (t === toks[pos]) {
        pos++; slot.insertAdjacentHTML('beforeend', `<span class="chip">${tx(t, { be: 1 })}</span>`); b.classList.add('used'); Sound.sfx('join'); setFb('');
        if (pos === toks.length) finish(false);
      } else {
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); Sound.sfx('gentle');
        setFb(toks.includes(t) ? `Good word, but not yet. Next we need "${toks[pos].replace(/\?$|\.$/g, '')}".` : ((it.tips || {})[t] || it.tip || 'Not this one. Check the subject and the picture.'), true);
      }
    }));
    $('[data-reset]', root).addEventListener('click', () => { pos = 0; finished = false; slot.innerHTML = ''; setFb(''); root.classList.remove('revealed'); $$('.tile', root).forEach((b) => b.classList.remove('used')); });
    A.onReveal = () => { if (!finished) finish(true); else A.sayBg([sentence]); };
    A.onHide = () => { root.classList.remove('revealed'); };
  };
  return { html, bind };
};

/** Multiple-choice component (assessment). */
Comp.mcq = {
  list: () => MCQ_ITEMS,
  mode: () => S.mode,
  rec: () => S.mcq[S.mode],
  score(rec) { let f = 0, r = 0, rn = 0; MCQ_ITEMS.forEach((q, i) => { const a = rec.first[i]; if (a && a.ok) f++; else if (a) { rn++; if (rec.retry[i] && rec.retry[i].ok) r++; } }); return { first: f, retryOk: r, missed: rn, after: f + r }; },
};

/** Checklist (anonymous learner labels, local only). kind: 'part' or 'exit' */
function renderChecklist(kind, host) {
  const cols = kind === 'part'
    ? [['A', 'Round A'], ['B', 'Round B'], ['C', 'Round C']]
    : [['subj', 'Subject choice'], ['agree', 'Be agreement'], ['order', 'Word order'], ['indep', 'Independent production']];
  const store = S[kind];
  const draw = () => {
    const rows = S.labels.map((l, i) => `<tr><td><input type="text" value="${esc(l)}" data-lab="${i}" aria-label="Anonymous label ${i + 1}" style="width:6rem"></td>${cols.map(([k, n]) => `<td class="tick"><input class="chk" type="checkbox" data-l="${i}" data-k="${k}" aria-label="${esc(n)} for ${esc(l)}" ${(store[l] || {})[k] ? 'checked' : ''}></td>`).join('')}</tr>`).join('');
    host.innerHTML = `<table class="t"><tr><th>${tx('Anonymous label')}</th>${cols.map(([, n]) => `<th>${tx(n)}</th>`).join('')}</tr>${rows}</table><div class="row" style="margin-top:.4rem"><button class="btn sm" data-add>Add a label</button></div>`;
    $$('input[data-lab]', host).forEach((inp) => inp.addEventListener('change', () => { const i = +inp.dataset.lab, old = S.labels[i], nv = inp.value.trim() || old; ['part', 'exit'].forEach((k) => { if (S[k][old]) { S[k][nv] = S[k][old]; if (nv !== old) delete S[k][old]; } }); S.labels[i] = nv; save(); }));
    $$('input[data-k]', host).forEach((inp) => inp.addEventListener('change', () => { const l = S.labels[+inp.dataset.l]; (store[l] = store[l] || {})[inp.dataset.k] = inp.checked; save(); }));
    $('[data-add]', host).onclick = () => { S.labels.push('L' + (S.labels.length + 1)); save(); draw(); };
  };
  draw();
}
function openChecklist(kind) {
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>${kind === 'part' ? 'Participation checklist' : 'Teacher checklist: exit speaking'}</h2>
    <p class="small-note">Local to this browser. Use anonymous labels (L1, L2…) — no names are needed. Nothing is uploaded. This is the teacher’s own observation, not an automatic score.</p><div id="chk-body"></div>`, { label: 'Checklist' });
  renderChecklist(kind, $('#chk-body', m.el));
}

/* ---------- answer sheet (local only) ---------- */
const LETTERS = ['A', 'B', 'C', 'D'];
/** Append one attempt to the local answer sheet. e: {qid, prompt, options[], selected(index|null), correct(index|null), attempt, ok, skipped, ungraded, mode} */
function logAnswer(e) {
  const sel = e.selected == null ? null : e.selected;
  S.answerLog.push({
    ts: new Date().toISOString(), mode: e.mode || S.mode, qid: e.qid, ungraded: !!e.ungraded, prompt: e.prompt,
    options: e.options.map((t, i) => `${LETTERS[i]}. ${t}`), selected: sel == null ? null : `${LETTERS[sel]}. ${e.options[sel]}`,
    selectedLetter: sel == null ? null : LETTERS[sel], correct: e.correct == null ? null : `${LETTERS[e.correct]}. ${e.options[e.correct]}`,
    correctLetter: e.correct == null ? null : LETTERS[e.correct], attempt: e.attempt, attemptType: e.attemptType, ok: e.ungraded ? null : !!e.ok, skipped: !!e.skipped,
  });
  save();
}
const attemptCount = (qid, mode) => S.answerLog.filter((x) => x.qid === qid && x.mode === mode).length;
const csvSafe = (v) => { let t = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };   // neutralise spreadsheet formulas

/* ---------- results + export ---------- */
function collectResults() {
  const acts = ACTS.map((a, i) => ({ n: i + 1, title: a.title, plannedMin: ACT_MIN[i], actualElapsedSec: Math.round(S.spent[i]), addedSec: S.extra[i], skippedSec: Math.round(S.skipped[i]), visited: !!S.visited[i], completed: !!S.done[i] }));
  const mk = (m) => { const rec = S.mcq[m], sc = Comp.mcq.score(rec); return { answered: Object.keys(rec.first).length, firstAttemptScore: sc.first, retryCorrect: sc.retryOk, retryAttempted: Object.keys(rec.retry).length, missedOnFirst: sc.missed, scoreAfterRetry: sc.after, outOf: 10, label: m === 'shared' ? 'class activity score (teacher-entered answers)' : 'individual score (this device only)' }; };
  return {
    app: 'Fluent English - Subject Pronouns and Be (A1)', exportedAt: new Date().toISOString(),
    note: 'Local data only. No names, emails or student accounts. Anonymous labels are teacher-chosen. Nothing was uploaded by this lesson.',
    activities: acts, diagnostic_ungraded: S.diag,
    ten_question_check: { shared_class_activity: mk('shared'), individual_mode: mk('individual'), teacherEnteredClassScoreNote: S.classScore },
    answer_sheet: S.answerLog,
    participation_checklist: S.part, exit_checklist: S.exit, teacher_notes: S.notes,
  };
}
const SHEET_COLS = ['timestamp', 'mode', 'question_id', 'ungraded', 'prompt', 'option_A', 'option_B', 'option_C', 'option_D', 'selected', 'correct_answer', 'attempt_number', 'attempt_type', 'correct', 'skipped'];
function sheetRows(r) {
  return r.answer_sheet.map((x) => [x.ts, x.mode, x.qid, x.ungraded, x.prompt, ...[0, 1, 2, 3].map((i) => x.options[i] || ''), x.selected == null ? '' : x.selected, x.correct == null ? '' : x.correct, x.attempt, x.attemptType, x.ok == null ? '' : x.ok, x.skipped]);
}
function sheetCSV(r) { return [SHEET_COLS].concat(sheetRows(r)).map((x) => x.map(csvSafe).join(',')).join('\n'); }
function toCSV(r) {
  const rows = [['section', 'item', 'field', 'value']];
  r.activities.forEach((a) => ['title', 'plannedMin', 'actualElapsedSec', 'addedSec', 'skippedSec', 'visited', 'completed'].forEach((f) => rows.push(['activity', a.n, f, a[f]])));
  Object.entries(r.diagnostic_ungraded).forEach(([k, v]) => rows.push(['diagnostic_ungraded', k, 'choice', v.choice]));
  ['shared_class_activity', 'individual_mode'].forEach((m) => Object.entries(r.ten_question_check[m]).forEach(([k, v]) => rows.push(['ten_question_check', m, k, v])));
  r.answer_sheet.forEach((x, i) => SHEET_COLS.forEach((c, j) => rows.push(['answer_sheet', i + 1, c, sheetRows({ answer_sheet: [x] })[0][j]])));
  ['participation_checklist', 'exit_checklist'].forEach((sec) => Object.entries(r[sec]).forEach(([lab, o]) => Object.entries(o).forEach(([k, v]) => rows.push([sec, lab, k, v]))));
  rows.push(['teacher_notes', '', 'text', r.teacher_notes]);
  return rows.map((x) => x.map(csvSafe).join(',')).join('\n');
}
function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function openResults() {
  const r = collectResults(), sh = r.ten_question_check.shared_class_activity, ind = r.ten_question_check.individual_mode;
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>Local results summary</h2>
    <p class="small-note">Stored only in this browser. This lesson uploads nothing. Downloads happen only when you press a button.</p>
    <table class="t"><tr><th>#</th><th>Activity</th><th>Planned</th><th>Actual time</th><th>Added</th><th>Skipped</th><th>Status</th></tr>
    ${r.activities.map((a) => `<tr><td>${a.n}</td><td>${esc(a.title)}</td><td>${a.plannedMin}:00</td><td>${fmt(a.actualElapsedSec)}</td><td>${a.addedSec ? '+' + fmt(a.addedSec) : '—'}</td><td>${a.skippedSec ? '−' + fmt(a.skippedSec) : '—'}</td><td>${a.completed ? 'Completed' : a.visited ? 'Visited' : 'Not started'}</td></tr>`).join('')}</table>
    <p class="small-note">“Completed” means the teacher pressed Step ▶ past the last screen of that activity; jumping to a screen does not complete it.</p>
    <h3>Ten-question check</h3>
    <table class="t"><tr><th>Mode</th><th>First attempt</th><th>Retry (of missed)</th><th>After retry</th></tr>
      <tr><td><b>Class activity score</b><br><span class="mini">teacher-entered class answers — not individual mastery</span></td><td>${sh.firstAttemptScore} / 10</td><td>${sh.retryCorrect} / ${sh.missedOnFirst}</td><td>${sh.scoreAfterRetry} / 10</td></tr>
      <tr><td><b>Individual score</b><br><span class="mini">own copy on this device</span></td><td>${ind.firstAttemptScore} / 10</td><td>${ind.retryCorrect} / ${ind.missedOnFirst}</td><td>${ind.scoreAfterRetry} / 10</td></tr></table>
    <p class="small-note">Answer sheet: ${r.answer_sheet.length} recorded attempt${r.answer_sheet.length === 1 ? '' : 's'} (question ID, prompt, options, selected answer, correct answer, attempt number, correctness, timestamp).</p>
    <label for="cs">Class activity score — optional teacher note (e.g. “7/10 as a class”)</label><input type="text" id="cs" value="${esc(S.classScore)}">
    <label for="notes">Participation notes (anonymous labels only)</label><textarea id="notes" rows="3">${esc(S.notes)}</textarea>
    <p class="small-note">Diagnostic answers are recorded ungraded (${Object.keys(S.diag).length}/3). Checklists: ${Object.keys(S.part).length} participation rows, ${Object.keys(S.exit).length} exit rows.</p>
    <div class="ft"><button class="btn alt" id="dl-sheet">Download answer sheet (CSV)</button><button class="btn alt" id="dl-csv">Download CSV</button><button class="btn" id="dl-json">Download JSON</button></div>`, { label: 'Results summary' });
  $('#cs', m.el).addEventListener('input', (e) => { S.classScore = e.target.value; save(); });
  $('#notes', m.el).addEventListener('input', (e) => { S.notes = e.target.value; save(); });
  $('#dl-json', m.el).addEventListener('click', () => download('fluent-english-be-results.json', JSON.stringify(collectResults(), null, 2), 'application/json'));
  $('#dl-csv', m.el).addEventListener('click', () => download('fluent-english-be-results.csv', toCSV(collectResults()), 'text/csv'));
  $('#dl-sheet', m.el).addEventListener('click', () => download('fluent-english-be-answer-sheet.csv', sheetCSV(collectResults()), 'text/csv'));
}
