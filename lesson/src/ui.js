/* ===== Engine: beats, timers, navigation, controls ===== */
const SUPER = { superseded: true };
let run = 0, paused = false, active = false, resumeWaiters = [], curA = null, revealed = false, timeupFor = -1, lastTick = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const untilResumed = () => new Promise((r) => resumeWaiters.push(r));
let duckT = null;

Speech.onSpeakState = (on) => {
  clearTimeout(duckT);
  if (on) Sound.setSpeaking(true); else duckT = setTimeout(() => Sound.setSpeaking(false), 500);
};
Speech.onCaption = (text, lang) => {
  const c = $('#caption'); if (!c) return;
  if (!text) { c.innerHTML = ''; return; }
  c.innerHTML = `<div>${esc(text.replace(/'/g, '’'))}</div>` + (lang === 'es' ? '' : `<div class="ipa">${esc(IPA.line(text.replace(/\*/g, '')).text)}</div>`);
};

/* ---------- API handed to each beat ---------- */
function makeApi(my, root, beat) {
  const A = {
    root, beat, my, fast: false, log: [], pendingReplay: false,
    alive: () => my === run,
    bgSaid: false,
    check() { if (my !== run) throw CANCEL; if (A.bgSaid && !A.fast) { A.bgSaid = false; throw SUPER; } },   // a Repeat/answer voice interrupts the running sequence
    async wait(ms) { if (A.fast) { A.check(); return; } let left = ms; while (left > 0) { A.check(); if (paused) { await untilResumed(); continue; } const d = Math.min(left, 80); await sleep(d); left -= d; } A.check(); },
    async say(items, o = {}) {
      (Array.isArray(items) ? items : [items]).forEach((i) => { const t = typeof i === 'string' ? i : i && i.t; if (t) A.log.push({ t, who: (typeof i === 'object' && i.who) || o.who || null }); });
      if (A.fast) { A.check(); return true; }   // instant mode: show end state, no speech
      for (;;) {
        A.check();
        const who = o.who || (typeof items === 'object' && !Array.isArray(items) && items.who);
        if (who) Art.talk(who, true);
        const role = who && Art.CAST[who] ? (Art.CAST[who].m ? 'male' : 'female') : undefined;
        const ok = await Speech.say(items, Object.assign({ role }, o));
        if (who) Art.talk(who, false);
        if (ok) return true;
        A.check();
        if (paused) { await untilResumed(); continue; }
        throw SUPER;
      }
    },
    sayBg(items, o) { A.bgSaid = true; Speech.say(items, o || {}); },
    sfx: (n) => Sound.sfx(n),
    on: (id) => { const e = document.getElementById(id); if (e) e.classList.add('on'); },
    off: (id) => { const e = document.getElementById(id); if (e) e.classList.remove('on'); },
    pose: (who, side, p, ms) => Art.setPose(who, side, p, A.fast ? 1 : ms),
    expr: (who, e, g) => Art.setExpr(who, e, g),
    set: (id, html) => { const e = document.getElementById(id); if (e) e.innerHTML = html; },
    onReveal: null, onHide: null,
  };
  return A;
}
function completeVisuals(root) { $$('.fly,.fadein,.fam .box', root).forEach((e) => e.classList.add('on')); }
function showRibbon(A, text) {
  if (!A.alive() || $('.turn', A.root)) return;
  const d = document.createElement('div'); d.className = 'turn'; d.setAttribute('role', 'status');
  d.innerHTML = `<i></i><span>${tx(text, { cls: 'on-dark' })}</span>`;
  A.root.appendChild(d); Sound.sfx('turn');
}
async function runBeat(A, o) {
  const b = A.beat, act = ACTS[S.a], items = b.seq || [];
  let idx = 0, stage = 'pre';
  const step = async (it) => {
    stage = 'pre'; if (it.pre) await it.pre(A);
    if (it.wait) await A.wait(it.wait);
    stage = 'say'; if (it.t) await A.say(it, { who: it.who });
    stage = 'post'; if (it.post) await it.post(A);
  };
  try {
    if (S.b === 0 && !o.noIntro) await A.say([{ t: `Activity ${act.n}. ${act.spoken || act.title}.`, pause: 350 }]);
    if (b.play) await b.play(A);
    for (; idx < items.length; idx++) { A.check(); await step(items[idx]); }
  } catch (e) {
    if (e === SUPER) {
      // another voice took over (e.g. a Repeat button): jump the visuals to the end state of this beat
      A.fast = true; A.bgSaid = false;
      try { const cur = items[idx]; if (cur && cur.post && stage === 'say') await cur.post(A); for (idx++; idx < items.length; idx++) { A.check(); await step(items[idx]); } } catch (e2) { if (e2 !== CANCEL) console.error(e2); }
    } else if (e !== CANCEL) console.error(e);
  }
  if (A.alive() && b.turn) showRibbon(A, b.turn);
  if (A.alive() && b.onDone) { try { b.onDone(A); } catch (e) { console.error(e); } }
}

/* ---------- frame ---------- */
function ipaNote() {
  const st = IPA.stats();
  return `IPA notation follows the uploaded Fluent English Sound Chart, which matches current Oxford Learner’s (OALD) NAmE for the vowel in <i>boat</i>: /əʊ/. Each line is <b>assembled word by word</b> from single-word entries (citation forms; real speech reduces small words). Only ${st.verified} of ${st.entries} entries are source-verified; the rest are hand-entered and not yet checked word by word. <b>[?word]</b> would mean no entry exists. No one has listened to every audio line.`;
}
function frame(act, beat) {
  const tl = beat.talk ? (beat.talk >= 60 ? `${Math.floor(beat.talk / 60)} min${beat.talk % 60 ? ' ' + (beat.talk % 60) + ' s' : ''}` : beat.talk + ' s') : '';
  const talk = beat.talk ? `<span class="talkchip" title="Planned learner speaking time on this screen">Learner speaking ≈ ${tl}</span>` : '';
  return `<div class="pane enter"><div class="head"><span class="num" aria-label="Activity ${act.n}">${act.n}</span><h1>${tx(beat.title)}</h1>${beat.sub ? `<span class="sub">${tx(beat.sub)}</span>` : ''}${talk}</div>
    <div class="body" style="display:contents">__BODY__</div>
    <div class="small-note ipa-note" style="display:none">${ipaNote()}</div></div>`;
}
/** Phone layout: copy each picture's name tags and speech bubbles into a legend under the picture (visible via CSS at narrow widths). */
function buildLegends(root) {
  $$('.scene', root).forEach((sc) => {
    if (sc.nextElementSibling && sc.nextElementSibling.classList.contains('scene-legend')) return;
    const items = $$('.ov .tag', sc).concat($$('.bubble', sc)), seen = new Set(), lg = document.createElement('div');
    lg.className = 'scene-legend'; lg.setAttribute('role', 'group'); lg.setAttribute('aria-label', 'Labels in the picture');
    items.forEach((it) => {
      const bub = it.classList.contains('bubble'), html = bub ? `<span class="lg-k" aria-hidden="true">“</span>${it.innerHTML}` : it.outerHTML;
      if (seen.has(html)) return; seen.add(html);
      const c = document.createElement('div'); if (bub) { c.className = 'lg-say'; c.innerHTML = html; } else { c.innerHTML = html; }
      lg.appendChild(c.classList.contains('lg-say') ? c : c.firstElementChild);
    });
    if (lg.children.length) sc.after(lg);
  });
}
function enter(a, b, o = {}) {
  const act = ACTS[a]; b = Math.max(0, Math.min(b, act.beats.length - 1));
  Speech.stop(); const my = ++run; resumeWaiters.splice(0).forEach((f) => f());
  S.a = a; S.b = b; S.visited[a] = true;   // completion is set only by stepping past the last screen (see next())
  revealed = false; closeEs(); active = true;
  const beat = act.beats[b], stage = $('#stage');
  const dummyA = makeApi(my, null, beat);
  const made = beat.make ? beat.make(dummyA) : null;
  const body = made ? made.html : beat.render(dummyA);
  stage.innerHTML = frame(act, beat).replace('__BODY__', body);
  stage.scrollTop = 0;
  const root = $('.pane', stage);
  const A = makeApi(my, root, beat); curA = A;
  buildLegends(root);
  if (made && made.bind) made.bind(A);
  if (beat.bind) beat.bind(A);
  if (paused) stage.insertAdjacentHTML('beforeend', '<div class="pausebadge" id="pbadge">Paused</div>');
  $('#caption').innerHTML = '';
  Sound.setQuiet(!!(beat.quiet || beat.turn));
  if (o.tr !== false) Sound.sfx('whoosh');
  updateUI();
  // paused or instant: show the finished state without speech; on Play the beat is replayed from the start
  if (paused || o.instant) { A.fast = true; A.pendingReplay = !!paused; runBeat(A, o); } else runBeat(A, o);
  save();
}
function next() {
  const act = ACTS[S.a];
  if (S.b < act.beats.length - 1) enter(S.a, S.b + 1);
  else if (S.a < ACTS.length - 1) { S.done[S.a] = true; enter(S.a + 1, 0); }
  else { S.done[S.a] = true; openResults(); }
}
function prev() {
  if (S.b > 0) enter(S.a, S.b - 1);
  else if (S.a > 0) enter(S.a - 1, ACTS[S.a - 1].beats.length - 1, { noIntro: true });
}
const nextAct = () => { if (S.a < ACTS.length - 1) enter(S.a + 1, 0); else toast('This is the last activity.'); };
const prevAct = () => { if (S.b > 0) enter(S.a, 0); else if (S.a > 0) enter(S.a - 1, 0); };
const replay = () => { if (!active) return; if (paused) setPaused(false, true); enter(S.a, S.b, { noIntro: true, tr: false }); };

/* ---------- reveal ---------- */
function toggleReveal() {
  if (!curA) return;
  const A = curA, root = A.root;
  if (!revealed) {
    if (A.onReveal) { const r = A.onReveal(); if (r === false) return; }
    else if (root.querySelector('.ans')) {
      root.classList.add('revealed'); Sound.sfx('reveal');
      if (A.beat.ansSay) A.sayBg(A.beat.ansSay);
    } else { toast('There is no hidden answer on this screen.'); return; }
    revealed = true;
  } else {
    root.classList.remove('revealed'); A.onHide && A.onHide(); revealed = false; Speech.stop();
  }
  updateUI();
}

/* ---------- Spanish help ---------- */
function closeEs() { const p = $('#es-panel'); if (p) p.remove(); const b = $('#b-es'); if (b) b.setAttribute('aria-pressed', 'false'); }
function toggleEs() {
  if ($('#es-panel')) { closeEs(); return; }
  if (!curA) return;
  const act = ACTS[S.a], text = curA.beat.es || act.es || 'Sin ayuda adicional para esta pantalla.';
  const d = document.createElement('div'); d.id = 'es-panel'; d.className = 'es-panel'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Spanish help');
  d.innerHTML = `<b class="hd">Ayuda en español</b><div>${esc(text)}</div><div class="row" style="margin-top:.4rem"><button class="btn sm alt" id="es-read">Leer en voz alta</button><button class="btn sm alt" id="es-x">Cerrar</button></div>`;
  $('#stage').appendChild(d); $('#b-es').setAttribute('aria-pressed', 'true');
  $('#es-read').onclick = () => { Speech.say([{ t: text, lang: 'es', rate: 1 }], {}); };
  $('#es-x').onclick = closeEs;
}

/* ---------- time ---------- */
const allot = (i) => ACT_MIN[i] * 60 + S.extra[i] - S.skipped[i];   // budget; actual elapsed time is S.spent[i] and is never altered by Skip
function updateClock() {
  const i = S.a, rem = allot(i) - S.spent[i];
  const big = $('#clk-big'); big.textContent = fmt(rem); big.classList.toggle('over', rem < 0); big.classList.toggle('paused', paused);
  $('#clk-lab').textContent = rem < 0 ? 'over planned time' : 'left in this activity';
  $('#clk-bar').style.width = Math.max(0, Math.min(100, (S.spent[i] / Math.max(1, allot(i))) * 100)) + '%';
  const planned = 3600, now = ACT_MIN.reduce((a, b, k) => a + allot(k), 0), el = S.spent.reduce((a, b) => a + b, 0);
  $('#clk-total').textContent = `Class: ${fmt(el)} actual · plan ${fmt(planned)}${now !== planned ? ' → now ' + fmt(now) : ''}`;
}
function tick() {
  const t = performance.now(), dt = Math.min(90, (t - lastTick) / 1000); lastTick = t;
  if (!S.started || !active || paused) { updateClock(); return; }
  S.spent[S.a] += dt;
  const rem = allot(S.a) - S.spent[S.a];
  if (rem <= 0 && timeupFor !== S.a) { timeupFor = S.a; showTimeup(); }
  if (rem > 0 && timeupFor === S.a) { timeupFor = -1; const b = $('#timeup'); if (b) b.remove(); }
  updateClock();
  if (Math.floor(t / 5000) !== tick.last) { tick.last = Math.floor(t / 5000); save(); }
}
function showTimeup() {
  if ($('#timeup')) return;
  Sound.sfx('timeup');
  const d = document.createElement('div'); d.id = 'timeup'; d.className = 'timeup'; d.setAttribute('role', 'alert');
  d.innerHTML = `<span>Planned time for this activity is up.</span><button class="btn sm" data-x="30">+30 s</button><button class="btn sm" data-x="60">+1 min</button><button class="btn sm alt" data-nx="1">Next activity</button><button class="btn sm alt" data-ok="1">Keep going</button>`;
  $('#stage').appendChild(d);
  d.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.x) extend(+b.dataset.x); else if (b.dataset.nx) { d.remove(); nextAct(); } else d.remove(); };
}
function extend(sec) { S.extra[S.a] += sec; toast(`Added ${sec === 60 ? '1 minute' : sec + ' seconds'} to activity ${S.a + 1}. The real class will run longer.`); const b = $('#timeup'); if (b && allot(S.a) - S.spent[S.a] > 0) { b.remove(); timeupFor = -1; } updateClock(); save(); }
function skipTimer() {
  // Skip ends this activity's countdown by shrinking its budget. Actual elapsed time (S.spent) is untouched.
  const rem = allot(S.a) - S.spent[S.a];
  if (rem > 0) { S.skipped[S.a] += rem; toast(`Skipped ${fmt(rem)} of this activity's timer. Actual elapsed time is unchanged; the class budget is now shorter.`); }
  updateClock(); save();
}

/* ---------- pause ---------- */
function setPaused(p, noReplay) {
  paused = p; Sound.setHalted(p);
  const b = $('#b-play'); b.innerHTML = p ? `${ICON.play}<span>Play</span>` : `${ICON.pause}<span>Pause</span>`; b.setAttribute('aria-label', p ? 'Play (timer and lesson resume)' : 'Pause (timer and speech stop)'); b.classList.toggle('primary', p);
  const st = $('#stage'), old = $('#pbadge');
  if (p) { Speech.stop(); if (!old) st.insertAdjacentHTML('beforeend', '<div class="pausebadge" id="pbadge">Paused</div>'); }
  else { if (old) old.remove(); resumeWaiters.splice(0).forEach((f) => f()); if (!noReplay && curA && curA.pendingReplay && active) { updateClock(); enter(S.a, S.b, { noIntro: true, tr: false }); return; } }
  updateClock();
}

/* ---------- UI refresh ---------- */
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>', pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>',
};
function updateUI() {
  const act = ACTS[S.a];
  $$('#chapters button').forEach((b, i) => { b.setAttribute('aria-current', i === S.a ? 'true' : 'false'); b.classList.toggle('done', !!S.done[i]); });
  $('#b-reveal').innerHTML = (revealed ? 'Hide answer' : 'Reveal answer');
  const hasAns = curA && (curA.onReveal || (curA.root && curA.root.querySelector('.ans')));
  $('#b-reveal').disabled = !hasAns;
  $('#b-reveal').title = hasAns ? 'Show or hide the answer (A)' : 'This screen has no hidden answer';
  $('#pos').textContent = `Activity ${act.n} · step ${S.b + 1}/${act.beats.length}`;
  $('#b-prev').disabled = S.a === 0 && S.b === 0;
  $('#b-next').innerHTML = (S.a === ACTS.length - 1 && S.b === act.beats.length - 1) ? 'Finish ▸' : 'Step <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
  $('#top-title').textContent = act.title;
  updateClock();
}
function applyCC() {
  document.body.dataset.cc = S.settings.cc;
  const lab = { off: 'Off', cap: 'Captions', ipa: 'Captions + IPA' }[S.settings.cc];
  $('#b-cc').innerHTML = `CC/IPA: <b>${lab}</b>`; $('#b-cc').setAttribute('aria-pressed', S.settings.cc !== 'off');
  $$('.ipa-note').forEach((n) => (n.style.display = S.settings.cc === 'ipa' ? 'block' : 'none'));
}
const TS = [['Standard', 1], ['Large', 1.2], ['Extra large', 1.5]];
/** Safety floor: no IPA line is ever rendered below 12 px, whatever the surrounding component size. */
function ipaFloor(root) { $$('.ipa', root || document).forEach((e) => { if (e.style.fontSize) return; if (parseFloat(getComputedStyle(e).fontSize) < 12) e.style.fontSize = '12px'; }); }
let ipaFloorT = null;
function scheduleIpaFloor() { clearTimeout(ipaFloorT); ipaFloorT = setTimeout(() => { $$('.ipa[data-floor]').forEach((e) => { e.style.fontSize = ''; e.removeAttribute('data-floor'); }); $$('.ipa', document).forEach((e) => { if (parseFloat(getComputedStyle(e).fontSize) < 12) { e.style.fontSize = '12px'; e.setAttribute('data-floor', '1'); } }); }, 30); }
function applyTS() { const t = TS[S.settings.ts] || TS[1]; document.documentElement.style.setProperty('--tscale', t[1]); scheduleIpaFloor(); const b = $('#b-ts'); if (b) b.innerHTML = `Text: <b>${t[0]}</b>`; }
function applyRM() { document.body.classList.toggle('rm', !!S.settings.rm); document.body.classList.toggle('rm-off', !S.settings.rm); }
function applyAudio() {
  const st = S.settings; Speech.cfg.rate = st.rate; Speech.cfg.volume = st.vSpeech; Speech.cfg.mute = st.mute; Speech.cfg.en = st.voice; Speech.cfg.male = st.voiceMale; Speech.cfg.female = st.voiceFemale; Speech.cfg.es = st.voiceEs; Speech.cfg.localOnly = !!st.localOnly;
  Sound.setVol('music', st.vMusic); Sound.setVol('sfx', st.vSfx);
  const m = $('#b-mute'); m.setAttribute('aria-pressed', st.mute); m.innerHTML = st.mute ? 'Narration muted' : 'Mute narration';
}

/* ---------- dialogs ---------- */
function openChapters() {
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>Chapter menu</h2><p class="small-note">Jump to any activity or step. Time already used in each activity is kept, so you can revisit without losing progress.</p>
    ${ACTS.map((a, i) => `<div class="card" style="margin:.4rem 0"><div class="row"><button class="btn ${i === S.a ? 'gold' : ''}" data-go="${i}:0">${a.n}. ${esc(a.title)}</button><span class="pill">${ACT_MIN[i]} min${S.extra[i] ? ' +' + fmt(S.extra[i]) : ''}</span><span class="small-note">actual ${fmt(S.spent[i])}${S.skipped[i] ? ' · skipped ' + fmt(S.skipped[i]) : ''} · ${S.done[i] ? 'completed' : S.visited[i] ? 'visited' : 'not started'}</span></div>
      <div class="row" style="margin-top:.3rem">${a.beats.map((b, j) => `<button class="btn alt sm" data-go="${i}:${j}" title="${esc(b.title)}" aria-label="Activity ${a.n} step ${j + 1}: ${esc(b.title)}" ${i === S.a && j === S.b ? 'style="outline:3px solid var(--gold)"' : ''}>${j + 1}</button>`).join('')}</div></div>`).join('')}`, { label: 'Chapter menu' });
  m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (!b) return; const [i, j] = b.dataset.go.split(':').map(Number); m.close(); enter(i, j); });
}
function voiceOptions(list, cur) { return `<option value="">Automatic (best match)</option>` + list.map((v) => `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name)} — ${esc(v.lang)} — ${v.localService ? 'on-device' : 'ONLINE'}</option>`).join(''); }
function openSettings() {
  const st = S.settings;
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>Voice, volume and display</h2>
    <p class="small-note">Voices come from your browser or device (speech synthesis). Quality differs by device; they are not human recordings, and no one has verified by listening how any particular voice sounds.</p>
    <p class="small-note"><b>Privacy:</b> this lesson’s own code uploads nothing and keeps scores on this device only. But a voice marked <b>ONLINE</b> is run by your browser’s vendor and may send the spoken text to their server. Choose an <b>on-device</b> voice, tick “On-device voices only”, or mute narration to avoid that.</p>
    <label style="margin:.3rem 0"><input type="checkbox" id="c-local" ${st.localOnly ? 'checked' : ''}> On-device voices only (hide online voices)</label>
    <div class="grid2"><div><label for="v-en">Narrator voice (American English preferred)</label><select id="v-en">${voiceOptions(Speech.enVoices(), st.voice)}</select>
    <button class="btn sm alt" id="v-prev" style="margin-top:.3rem">Preview voice</button><div class="small-note" id="v-none"></div></div>
    <div><label for="v-male">Male character voice (Alex, Daniel, Omar, Ken)</label><select id="v-male">${voiceOptions(Speech.enVoices(), st.voiceMale)}</select>
    <label for="v-female">Female character voice (Maya, Sofia, Lena, Rosa)</label><select id="v-female">${voiceOptions(Speech.enVoices(), st.voiceFemale)}</select>
    <div class="small-note">Automatic choice guesses gender from the voice name; browsers do not report it. If only one voice exists, pitch is shifted slightly. Check by ear and choose manually.</div></div>
    <div><label for="v-es">Spanish voice (for Spanish Help read-aloud)</label><select id="v-es">${voiceOptions(Speech.esVoices(), st.voiceEs)}</select></div></div>
    <label for="r-rate">Speaking rate: <span id="r-rate-v">${st.rate.toFixed(2)}</span>×</label><input type="range" id="r-rate" min="0.6" max="1.2" step="0.05" value="${st.rate}">
    <div class="grid2"><div><label for="r-sp">Speech volume</label><input type="range" id="r-sp" min="0" max="1" step="0.05" value="${st.vSpeech}"></div>
    <div><label for="r-mu">Music volume</label><input type="range" id="r-mu" min="0" max="1" step="0.05" value="${st.vMusic}"></div>
    <div><label for="r-fx">Effects volume</label><input type="range" id="r-fx" min="0" max="1" step="0.05" value="${st.vSfx}"></div>
    <div><label>&nbsp;</label><button class="btn alt sm" id="t-fx">Test effect</button></div></div>
    <div class="row" style="margin-top:.6rem"><label style="margin:0"><input type="checkbox" id="c-rm" ${st.rm ? 'checked' : ''}> Reduce motion</label>
    <label style="margin:0 0 0 1rem"><input type="checkbox" id="c-ind" ${S.mode === 'individual' ? 'checked' : ''}> Individual mode (someone using their own copy)</label></div>
    <p class="small-note">Individual mode only changes how the ten-question check is labeled and stored. On a shared screen, leave it off: the lesson cannot collect separate answers from remote learners.</p>`, { label: 'Settings' });
  const none = () => { $('#v-none', m.el).textContent = Speech.supported ? (Speech.hasEn ? '' : 'No English voices found yet. Captions still work; some browsers load voices a moment after opening.') : 'This browser has no speech synthesis. Captions still work.'; };
  none();
  Speech.onVoices = () => { if (!document.body.contains(m.el)) return; ['en', 'male', 'female'].forEach((k) => { $('#v-' + k, m.el).innerHTML = voiceOptions(Speech.enVoices(), S.settings[{ en: 'voice', male: 'voiceMale', female: 'voiceFemale' }[k]]); }); $('#v-es', m.el).innerHTML = voiceOptions(Speech.esVoices(), S.settings.voiceEs); none(); };
  $('#v-en', m.el).onchange = (e) => { st.voice = e.target.value; applyAudio(); save(); };
  $('#v-male', m.el).onchange = (e) => { st.voiceMale = e.target.value; applyAudio(); save(); };
  $('#v-female', m.el).onchange = (e) => { st.voiceFemale = e.target.value; applyAudio(); save(); };
  $('#c-local', m.el).onchange = (e) => { st.localOnly = e.target.checked; applyAudio(); save(); toast(st.localOnly ? 'On-device voices only.' : 'Online voices allowed (they may send spoken text to the browser vendor).'); };
  $('#v-es', m.el).onchange = (e) => { st.voiceEs = e.target.value; applyAudio(); save(); };
  $('#v-prev', m.el).onclick = () => { Speech.say([{ t: "Narrator: I'm ready. You're here. It's a book." }, { t: "I'm Alex. You're Maya.", role: 'male' }, { t: "I'm Maya. You're Alex.", role: 'female' }], {}); };
  $('#r-rate', m.el).oninput = (e) => { st.rate = +e.target.value; $('#r-rate-v', m.el).textContent = st.rate.toFixed(2); applyAudio(); save(); };
  $('#r-sp', m.el).oninput = (e) => { st.vSpeech = +e.target.value; applyAudio(); save(); };
  $('#r-mu', m.el).oninput = (e) => { st.vMusic = +e.target.value; applyAudio(); save(); };
  $('#r-fx', m.el).oninput = (e) => { st.vSfx = +e.target.value; applyAudio(); save(); };
  $('#t-fx', m.el).onclick = () => { Sound.init(); Sound.sfx('correct'); };
  $('#c-rm', m.el).onchange = (e) => { st.rm = e.target.checked; applyRM(); save(); };
  $('#c-ind', m.el).onchange = (e) => { S.mode = e.target.checked ? 'individual' : 'shared'; save(); toast(S.mode === 'individual' ? 'Individual mode on (own copy).' : 'Shared class mode on.'); };
}
function openVideo() {
  if ($('#chart-vid')) return;
  // The video has its own sound: pause the lesson (timer, voice, music) while it plays, then restore.
  const wasPaused = paused; if (!wasPaused) setPaused(true);
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>Fluent English sound chart — video</h2>
    <video id="chart-vid" controls preload="metadata" playsinline style="width:100%;border-radius:10px;background:#000" aria-label="Sound chart video: each English sound with its symbol and picture"><source src="__SOUND_WEBM__" type="video/webm"><source src="__SOUND_VIDEO__" type="video/mp4"></video>
    <p class="small-note">The lesson is paused while this video is open (timer, narration and music stop). Closing the video resumes the lesson${wasPaused ? ' — it was already paused, so it stays paused' : ''}.</p>
    <div class="ft"><button class="btn alt" id="vid-chart">Open the still chart</button></div>`, { label: 'Sound chart video', cls: 'wide', onClose: () => { const v = document.getElementById('chart-vid'); if (v) v.pause(); if (!wasPaused) setPaused(false); } });
  $('#vid-chart', m.el).onclick = () => { m.close(); openChart(); };
  const v = $('#chart-vid', m.el); v.play().catch(() => {});
}
function openChart() {
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>Fluent English sound chart</h2>
    <img src="__SOUND_CHART__" alt="Sound chart: 36 English sounds with their IPA symbols and a picture for each" style="width:100%;border-radius:10px;border:1px solid var(--cream-3)">
    <p class="small-note">This is your original chart (cropped image; the unaltered video file is kept in the project). The lesson’s IPA follows this notation, including <b>əʊ</b> as in boat, which matches current Oxford Learner’s (OALD) NAmE entries (boat /bəʊt/). Oxford’s separate Advanced American dictionary writes /oʊ/ — a different transcription standard that this lesson does not mix in. <b>ɪr</b> and <b>ʊr</b> (here, you’re) are ɪ or ʊ plus r, like <b>er</b> on the chart. Stress marks ˈ ˌ are added. Word entries are hand-entered unless marked verified.</p><div class="ft"><button class="btn" id="chart-watch">▶ Watch the video</button></div>`, { label: 'Sound chart' });
  $('#chart-watch', m.el).onclick = () => { m.close(); openVideo(); };
}
function openGuide() {
  const spk = ACTS.map((a) => a.beats.reduce((s, b) => s + (b.talk || 0), 0));
  const tot = spk.reduce((a, b) => a + b, 0);
  modal(`<button class="btn alt sm x" data-close>Close</button><div class="guide"><h2>Teacher guide</h2>
    <div class="warn"><b>The timers change the real class length.</b> Default activity timers add up to exactly <b>60:00</b>. Extending, skipping, pausing and revisiting are teacher decisions: if you add time to an activity or pause for a discussion, the class really will run longer than 60 minutes (the header shows “plan 60:00 → now …”). If you skip a timer, the lesson does not shorten itself — you decide what to cover.</div>
    <table class="t"><tr><th>#</th><th>Activity</th><th>Default time</th><th>Planned learner speaking</th></tr>${ACTS.map((a, i) => `<tr><td>${a.n}</td><td>${esc(a.title)}</td><td>${ACT_MIN[i]}:00</td><td>${(spk[i] / 60).toFixed(1)} min</td></tr>`).join('')}
    <tr><td></td><td><b>Total</b></td><td><b>60:00</b></td><td><b>${(tot / 60).toFixed(1)} min</b></td></tr></table>
    <p class="small-note">“Learner speaking” is collective practice time (whole class, partners, or turns you choose) — not a claim that each learner speaks that long.</p>
    <dl><dt>Start Lesson</dt><dd>Unlocks browser audio. Speech, music and effects begin only after you click it.</dd>
    <dt>Step ◀ ▶ (← →)</dt><dd>Moves through the screens of an activity. Pause (Space) stops the timer, voice and music; Play continues. Replay (R) plays the current example again.</dd>
    <dt>Activity ⏮ ⏭ (Shift + ← →) and Chapters</dt><dd>Jump anywhere. Time used and scores stay saved.</dd>
    <dt>+30 s / +1 min / Skip timer</dt><dd>Adjust the current activity’s timer. When it reaches zero the lesson never advances by itself.</dd>
    <dt>Reveal / Hide answer (A)</dt><dd>Show or hide the answer on the current screen. In the ten-question check, answers stay hidden until the class answer is submitted.</dd>
    <dt>Español (S)</dt><dd>Concise Spanish help for the current screen, only when you ask for it.</dd>
    <dt>CC/IPA (C)</dt><dd>Off, Captions, or Captions + IPA. IPA uses the notation of your uploaded Sound Chart (which agrees with current OALD NAmE for /əʊ/ as in boat). Lines are assembled word by word. Entries are hand-entered; only those listed in <code>build/ipa-verified.csv</code> are source-verified. Words with no entry show as [?word]. Open <b>Sound chart</b> for the chart, or the video.</dd>
    <dt>Text size (T)</dt><dd>Standard, Large or Extra large for captions, IPA and labels. Use Large or Extra large when learners watch on a phone.</dd>\n    <dt>Settings</dt><dd>Choose and preview voices, speaking rate, speech/music/effects volume, reduced motion.</dd></dl>
    <p class="small-note"><b>Limits:</b> no microphone, speech recognition or pronunciation scoring — you listen and judge. Synthetic voices are models for rhythm, not proof of accuracy. Progress is saved only in this browser. Results leave the browser only if you press a download button.</p>
    <p class="small-note">Keyboard: Space or P pause/play · ← → step · Shift+← → activity · R replay · A reveal · S Spanish · C CC/IPA · T text size · M mute narration · F fullscreen · H hide controls.</p></div>`, { label: 'Teacher guide' });
}
function openReset() {
  confirmBox('Reset the lesson?', 'This clears saved progress, timers, scores, checklists and notes from this browser and returns to the start. Settings (voices, volume) are kept.', 'Reset everything', () => {
    const keep = S.settings; Speech.stop(); S = fresh(); S.settings = keep; save(true); active = false; timeupFor = -1; paused = false; setPaused(false); showStart();
  });
}

/* ---------- start / resume ---------- */
function showStart() {
  const st = $('#start'); st.hidden = false; $('#stage').innerHTML = ''; active = false;
  const saved = loadSaved();
  const box = $('#resume-box');
  if (saved && saved.started) {
    const a = ACTS[saved.a], mins = Math.round(saved.spent.reduce((x, y) => x + y, 0) / 60);
    box.hidden = false;
    box.innerHTML = `<b>Saved progress found on this device</b><p>Activity ${saved.a + 1}: ${esc(a.title)} · step ${saved.b + 1} · about ${mins} min used.</p><div class="row"><button class="btn gold" id="b-resume">Resume where we stopped</button><button class="btn alt" id="b-fresh">Start from the beginning</button></div>`;
    $('#b-resume').onclick = () => { mergeState(saved); applySettings(); beginLesson(true); };
    $('#b-fresh').onclick = () => confirmBox('Start from the beginning?', 'Saved timers, scores and checklists will be cleared.', 'Clear and start', () => { const keep = saved.settings; S = fresh(); S.settings = Object.assign(S.settings, keep); applySettings(); beginLesson(false); });
  } else box.hidden = true;
}
function applySettings() { applyCC(); applyRM(); applyAudio(); applyTS(); }
async function beginLesson(resume) {
  Sound.init(); applyAudio(); S.started = true; $('#start').hidden = true; lastTick = performance.now();
  Sound.setMode('ambient');
  if (resume) { enter(S.a, S.b, { noIntro: true }); return; }
  active = false;
  const st = $('#stage');
  st.innerHTML = `<div class="pane center" style="gap:1rem"><img src="__LOGO_FULL__" alt="Fluent English" style="width:min(28rem,70%);border-radius:18px;background:#fff;padding:.6rem;box-shadow:var(--shadow)"><h1 style="font-family:var(--serif);font-size:2.4rem;margin:.2rem;color:var(--teal-900)">${tx('Subject Pronouns and Be')}</h1><div class="instr">${tx('A1 English for adults')}</div><button class="btn gold" id="b-begin" style="font-size:1.2rem;padding:.7rem 1.6rem">Begin Activity 1</button></div>`;
  updateUI(); const my = ++run; let go = false;
  const begin = () => { if (go) return; go = true; run++; Speech.stop(); enter(0, 0, { tr: true }); };
  $('#b-begin').onclick = begin;
  Sound.opening();
  await sleep(4200); if (go || my !== run) return;
  await Speech.say([{ t: 'Welcome to Fluent English.', pause: 400 }, { t: 'Today: subject pronouns, and the verb be.' }], {});
  await sleep(2800); if (go || my !== run) return;
  begin();
}

/* ---------- init ---------- */
function init() {
  const saved = loadSaved();
  if (saved) S.settings = Object.assign(S.settings, saved.settings || {});
  else if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) S.settings.rm = true;
  $('#chapters').innerHTML = ACTS.map((a, i) => `<button title="${esc(a.title)}" aria-label="Activity ${a.n}: ${esc(a.title)}">${a.n}</button>`).join('');
  $('#chapters').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; enter($$('#chapters button').indexOf(b), 0); });
  const on = (id, f) => $(id).addEventListener('click', f);
  on('#b-start', () => beginLesson(false));
  on('#b-guide0', openGuide); on('#b-guide', openGuide);
  on('#b-play', () => setPaused(!paused));
  on('#b-replay', replay); on('#b-prev', prev); on('#b-next', next); on('#b-pa', prevAct); on('#b-na', nextAct);
  on('#b-chap', openChapters); on('#b-reveal', toggleReveal); on('#b-es', toggleEs);
  on('#b-ts', () => { S.settings.ts = ((S.settings.ts == null ? 1 : S.settings.ts) + 1) % 3; applyTS(); save(); toast('Text size: ' + TS[S.settings.ts][0]); });
  on('#b-chart', openChart); on('#b-video', openVideo);
  on('#b-cc', () => { const o = ['off', 'cap', 'ipa'], i = o.indexOf(S.settings.cc); S.settings.cc = o[(i + 1) % 3]; applyCC(); save(); toast('CC/IPA: ' + { off: 'Off', cap: 'Captions', ipa: 'Captions + IPA' }[S.settings.cc]); });
  on('#b-30', () => extend(30)); on('#b-60', () => extend(60)); on('#b-skip', skipTimer);
  on('#b-set', openSettings); on('#b-res', openResults); on('#b-reset', openReset);
  on('#b-mute', () => { S.settings.mute = !S.settings.mute; applyAudio(); if (S.settings.mute) Speech.stop(); save(); });
  on('#b-full', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); });
  on('#b-dock', () => { document.body.classList.add('nodock'); $('#show-dock').focus(); });
  on('#show-dock', () => { document.body.classList.remove('nodock'); $('#b-dock').focus(); });
  $('#dock').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b && e.detail > 0) b.blur(); });  // mouse clicks must not leave focus on a button (Space would re-click it)
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,textarea,select,[role=dialog]')) return;
    if ($('#start') && !$('#start').hidden) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if ((k === ' ' && (e.target === document.body || e.target.id === 'stage')) || k === 'p' || k === 'P') { e.preventDefault(); setPaused(!paused); }
    else if (k === 'ArrowRight') { e.preventDefault(); e.shiftKey ? nextAct() : next(); }
    else if (k === 'ArrowLeft') { e.preventDefault(); e.shiftKey ? prevAct() : prev(); }
    else if (k === 'r' || k === 'R') replay();
    else if (k === 'a' || k === 'A') { if (!$('#b-reveal').disabled) toggleReveal(); }
    else if (k === 's' || k === 'S') toggleEs();
    else if (k === 'c' || k === 'C') $('#b-cc').click();
    else if (k === 'm' || k === 'M') $('#b-mute').click();
    else if (k === 't' || k === 'T') $('#b-ts').click();
    else if (k === 'f' || k === 'F') $('#b-full').click();
    else if (k === 'h' || k === 'H') (document.body.classList.contains('nodock') ? $('#show-dock') : $('#b-dock')).click();
  });
  window.addEventListener('beforeunload', () => save(true));
  document.addEventListener('visibilitychange', () => save(true));
  new MutationObserver(scheduleIpaFloor).observe(document.getElementById('stage'), { childList: true, subtree: true });
  window.addEventListener('resize', scheduleIpaFloor);
  applySettings(); setInterval(tick, 250); lastTick = performance.now();
  $('#b-play').innerHTML = `${ICON.pause}<span>Pause</span>`;
  showStart();
  window.__lesson = { get S() { return S; }, enter, next, prev, ACTS, get curA() { return curA; }, toggleReveal, setPaused };
}
