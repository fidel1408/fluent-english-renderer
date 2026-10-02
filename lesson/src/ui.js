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
    root, beat, my,
    alive: () => my === run,
    check() { if (my !== run) throw CANCEL; },
    async wait(ms) { let left = ms; while (left > 0) { A.check(); if (paused) { await untilResumed(); continue; } const d = Math.min(left, 80); await sleep(d); left -= d; } A.check(); },
    async say(items, o = {}) {
      for (;;) {
        A.check();
        const who = o.who || (typeof items === 'object' && !Array.isArray(items) && items.who);
        if (who) Art.talk(who, true);
        const ok = await Speech.say(items, o);
        if (who) Art.talk(who, false);
        if (ok) return true;
        A.check();
        if (paused) { await untilResumed(); continue; }
        throw SUPER;
      }
    },
    sayBg(items, o) { Speech.say(items, o || {}); },
    sfx: (n) => Sound.sfx(n),
    on: (id) => { const e = document.getElementById(id); if (e) e.classList.add('on'); },
    off: (id) => { const e = document.getElementById(id); if (e) e.classList.remove('on'); },
    pose: (who, side, p, ms) => Art.setPose(who, side, p, ms),
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
  const b = A.beat, act = ACTS[S.a];
  try {
    if (S.b === 0 && !o.noIntro) await A.say([{ t: `Activity ${act.n}. ${act.spoken || act.title}.`, pause: 350 }]);
    if (b.play) await b.play(A);
    if (b.seq) {
      for (const it of b.seq) {
        A.check();
        if (it.pre) await it.pre(A);
        if (it.wait) await A.wait(it.wait);
        if (it.t) await A.say(it, { who: it.who });
        if (it.post) await it.post(A);
      }
    }
  } catch (e) {
    if (e === SUPER) completeVisuals(A.root); else if (e !== CANCEL) console.error(e);
  }
  if (A.alive() && b.turn) showRibbon(A, b.turn);
  if (A.alive() && b.onDone) { try { b.onDone(A); } catch (e) { console.error(e); } }
}

/* ---------- frame ---------- */
function frame(act, beat) {
  const tl = beat.talk ? (beat.talk >= 60 ? `${Math.floor(beat.talk / 60)} min${beat.talk % 60 ? ' ' + (beat.talk % 60) + ' s' : ''}` : beat.talk + ' s') : '';
  const talk = beat.talk ? `<span class="talkchip" title="Planned learner speaking time on this screen">Learner speaking ≈ ${tl}</span>` : '';
  return `<div class="pane enter"><div class="head"><span class="num" aria-label="Activity ${act.n}">${act.n}</span><h1>${tx(beat.title)}</h1>${beat.sub ? `<span class="sub">${tx(beat.sub)}</span>` : ''}${talk}</div>
    <div class="body" style="display:contents">__BODY__</div>
    <div class="small-note ipa-note" style="display:none">IPA: American English, written with the symbols of the Fluent English sound chart (button: Sound chart) and assembled word by word from citation forms. Entered by hand, not checked against Oxford; natural speech reduces small words.</div></div>`;
}
function enter(a, b, o = {}) {
  const act = ACTS[a]; b = Math.max(0, Math.min(b, act.beats.length - 1));
  Speech.stop(); const my = ++run; resumeWaiters.splice(0).forEach((f) => f());
  S.a = a; S.b = b; S.visited[a] = true; if (b === act.beats.length - 1) S.done[a] = true;
  revealed = false; closeEs(); active = true;
  const beat = act.beats[b], stage = $('#stage');
  const pre = { root: null };
  const dummyA = makeApi(my, null, beat);
  const made = beat.make ? beat.make(dummyA) : null;
  const body = made ? made.html : beat.render(dummyA);
  stage.innerHTML = frame(act, beat).replace('__BODY__', body);
  stage.scrollTop = 0;
  const root = $('.pane', stage);
  const A = makeApi(my, root, beat); curA = A;
  if (made && made.bind) made.bind(A);
  if (beat.bind) beat.bind(A);
  if (paused) stage.insertAdjacentHTML('beforeend', '<div class="pausebadge" id="pbadge">Paused</div>');
  $('#caption').innerHTML = '';
  Sound.setQuiet(!!(beat.quiet || beat.turn));
  if (o.tr !== false) Sound.sfx('whoosh');
  updateUI();
  if (paused) { completeVisuals(root); } else runBeat(A, o);
  save();
  if (a === 8 && b === act.beats.length - 1 && !o.noEnd) { /* ending theme is triggered by the beat itself */ }
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
const replay = () => { if (!active) return; enter(S.a, S.b, { noIntro: true, tr: false }); };

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
const allot = (i) => ACT_MIN[i] * 60 + S.extra[i];
function updateClock() {
  const i = S.a, rem = allot(i) - S.spent[i];
  const big = $('#clk-big'); big.textContent = fmt(rem); big.classList.toggle('over', rem < 0); big.classList.toggle('paused', paused);
  $('#clk-lab').textContent = rem < 0 ? 'over planned time' : 'left in this activity';
  $('#clk-bar').style.width = Math.max(0, Math.min(100, (S.spent[i] / allot(i)) * 100)) + '%';
  const planned = 3600, now = ACT_MIN.reduce((a, b, k) => a + allot(k), 0), el = S.spent.reduce((a, b) => a + b, 0);
  $('#clk-total').textContent = `Class: ${fmt(el)} used · plan ${fmt(planned)}${now !== planned ? ' → now ' + fmt(now) : ''}`;
}
function tick() {
  const t = performance.now(), dt = Math.min(1, (t - lastTick) / 1000); lastTick = t;
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
  const rem = allot(S.a) - S.spent[S.a];
  if (rem > 0) { S.spent[S.a] = allot(S.a); toast('Activity timer skipped. The class clock now shows less time than planned.'); }
  updateClock(); save();
}

/* ---------- pause ---------- */
function setPaused(p) {
  paused = p; Sound.setHalted(p);
  const b = $('#b-play'); b.innerHTML = p ? `${ICON.play}<span>Play</span>` : `${ICON.pause}<span>Pause</span>`; b.setAttribute('aria-label', p ? 'Play (timer and lesson resume)' : 'Pause (timer and speech stop)'); b.classList.toggle('primary', p);
  const st = $('#stage'), old = $('#pbadge');
  if (p) { Speech.stop(); if (!old) st.insertAdjacentHTML('beforeend', '<div class="pausebadge" id="pbadge">Paused</div>'); }
  else { if (old) old.remove(); resumeWaiters.splice(0).forEach((f) => f()); }
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
function applyRM() { document.body.classList.toggle('rm', !!S.settings.rm); document.body.classList.toggle('rm-off', !S.settings.rm); }
function applyAudio() {
  const st = S.settings; Speech.cfg.rate = st.rate; Speech.cfg.volume = st.vSpeech; Speech.cfg.mute = st.mute; Speech.cfg.en = st.voice; Speech.cfg.es = st.voiceEs;
  Sound.setVol('music', st.vMusic); Sound.setVol('sfx', st.vSfx);
  const m = $('#b-mute'); m.setAttribute('aria-pressed', st.mute); m.innerHTML = st.mute ? 'Narration muted' : 'Mute narration';
}

/* ---------- dialogs ---------- */
function openChapters() {
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>Chapter menu</h2><p class="small-note">Jump to any activity or step. Time already used in each activity is kept, so you can revisit without losing progress.</p>
    ${ACTS.map((a, i) => `<div class="card" style="margin:.4rem 0"><div class="row"><button class="btn ${i === S.a ? 'gold' : ''}" data-go="${i}:0">${a.n}. ${esc(a.title)}</button><span class="pill">${ACT_MIN[i]} min${S.extra[i] ? ' +' + fmt(S.extra[i]) : ''}</span><span class="small-note">used ${fmt(S.spent[i])} · ${S.done[i] ? 'completed' : S.visited[i] ? 'visited' : 'not started'}</span></div>
      <div class="row" style="margin-top:.3rem">${a.beats.map((b, j) => `<button class="btn alt sm" data-go="${i}:${j}" title="${esc(b.title)}" aria-label="Activity ${a.n} step ${j + 1}: ${esc(b.title)}" ${i === S.a && j === S.b ? 'style="outline:3px solid var(--gold)"' : ''}>${j + 1}</button>`).join('')}</div></div>`).join('')}`, { label: 'Chapter menu' });
  m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (!b) return; const [i, j] = b.dataset.go.split(':').map(Number); m.close(); enter(i, j); });
}
function voiceOptions(list, cur) { return `<option value="">Automatic (best match)</option>` + list.map((v) => `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name)} — ${esc(v.lang)}</option>`).join(''); }
function openSettings() {
  const st = S.settings;
  const m = modal(`<button class="btn alt sm x" data-close>Close</button><h2>Voice, volume and display</h2>
    <p class="small-note">Voices come from your browser or device (speech synthesis). Quality differs by device; they are not human recordings.</p>
    <div class="grid2"><div><label for="v-en">English voice (American English preferred)</label><select id="v-en">${voiceOptions(Speech.enVoices(), st.voice)}</select>
    <button class="btn sm alt" id="v-prev" style="margin-top:.3rem">Preview voice</button><div class="small-note" id="v-none"></div></div>
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
  Speech.onVoices = () => { if (!document.body.contains(m.el)) return; $('#v-en', m.el).innerHTML = voiceOptions(Speech.enVoices(), S.settings.voice); $('#v-es', m.el).innerHTML = voiceOptions(Speech.esVoices(), S.settings.voiceEs); none(); };
  $('#v-en', m.el).onchange = (e) => { st.voice = e.target.value; applyAudio(); save(); };
  $('#v-es', m.el).onchange = (e) => { st.voiceEs = e.target.value; applyAudio(); save(); };
  $('#v-prev', m.el).onclick = () => { Speech.say(["Hello. I'm ready. You're here. It's a book."], {}); };
  $('#r-rate', m.el).oninput = (e) => { st.rate = +e.target.value; $('#r-rate-v', m.el).textContent = st.rate.toFixed(2); applyAudio(); save(); };
  $('#r-sp', m.el).oninput = (e) => { st.vSpeech = +e.target.value; applyAudio(); save(); };
  $('#r-mu', m.el).oninput = (e) => { st.vMusic = +e.target.value; applyAudio(); save(); };
  $('#r-fx', m.el).oninput = (e) => { st.vSfx = +e.target.value; applyAudio(); save(); };
  $('#t-fx', m.el).onclick = () => { Sound.init(); Sound.sfx('correct'); };
  $('#c-rm', m.el).onchange = (e) => { st.rm = e.target.checked; applyRM(); save(); };
  $('#c-ind', m.el).onchange = (e) => { S.mode = e.target.checked ? 'individual' : 'shared'; save(); toast(S.mode === 'individual' ? 'Individual mode on (own copy).' : 'Shared class mode on.'); };
}
function openChart() {
  modal(`<button class="btn alt sm x" data-close>Close</button><h2>Fluent English sound chart</h2>
    <img src="__SOUND_CHART__" alt="Sound chart: 36 English sounds with their IPA symbols and a picture for each" style="width:100%;border-radius:10px;border:1px solid var(--cream-3)">
    <p class="small-note">The IPA in this lesson uses these symbols. Extra marks: ˈ primary stress, ˌ secondary stress. <b>ɪr</b> and <b>ʊr</b> (here, you’re) are ɪ or ʊ followed by r, like <b>er</b> on the chart. Stress marks and spaces between words are the only additions.</p>`, { label: 'Sound chart' });
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
    <dt>CC/IPA (C)</dt><dd>Off, Captions, or Captions + IPA. IPA uses only the symbols on the Fluent English sound chart (open it with <b>Sound chart</b>), plus stress marks. It is typed by hand and assembled word by word; it was <b>not</b> checked against Oxford (lookup was unavailable).</dd>
    <dt>Settings</dt><dd>Choose and preview voices, speaking rate, speech/music/effects volume, reduced motion.</dd></dl>
    <p class="small-note"><b>Limits:</b> no microphone, speech recognition or pronunciation scoring — you listen and judge. Synthetic voices are models for rhythm, not proof of accuracy. Progress is saved only in this browser. Results leave the browser only if you press a download button.</p>
    <p class="small-note">Keyboard: Space pause/play · ← → step · Shift+← → activity · R replay · A reveal · S Spanish · C CC/IPA · M mute narration · F fullscreen · H hide controls.</p></div>`, { label: 'Teacher guide' });
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
function applySettings() { applyCC(); applyRM(); applyAudio(); }
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
  on('#b-chart', openChart);
  on('#b-cc', () => { const o = ['off', 'cap', 'ipa'], i = o.indexOf(S.settings.cc); S.settings.cc = o[(i + 1) % 3]; applyCC(); save(); toast('CC/IPA: ' + { off: 'Off', cap: 'Captions', ipa: 'Captions + IPA' }[S.settings.cc]); });
  on('#b-30', () => extend(30)); on('#b-60', () => extend(60)); on('#b-skip', skipTimer);
  on('#b-set', openSettings); on('#b-res', openResults); on('#b-reset', openReset);
  on('#b-mute', () => { S.settings.mute = !S.settings.mute; applyAudio(); if (S.settings.mute) Speech.stop(); save(); });
  on('#b-full', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); });
  on('#b-dock', () => { document.body.classList.toggle('nodock'); });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,textarea,select,[role=dialog]')) return;
    if ($('#start') && !$('#start').hidden) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === ' ' && e.target === document.body) { e.preventDefault(); setPaused(!paused); }
    else if (k === 'ArrowRight') { e.preventDefault(); e.shiftKey ? nextAct() : next(); }
    else if (k === 'ArrowLeft') { e.preventDefault(); e.shiftKey ? prevAct() : prev(); }
    else if (k === 'r' || k === 'R') replay();
    else if (k === 'a' || k === 'A') { if (!$('#b-reveal').disabled) toggleReveal(); }
    else if (k === 's' || k === 'S') toggleEs();
    else if (k === 'c' || k === 'C') $('#b-cc').click();
    else if (k === 'm' || k === 'M') $('#b-mute').click();
    else if (k === 'f' || k === 'F') $('#b-full').click();
    else if (k === 'h' || k === 'H') $('#b-dock').click();
  });
  window.addEventListener('beforeunload', () => save(true));
  document.addEventListener('visibilitychange', () => save(true));
  applySettings(); setInterval(tick, 250); lastTick = performance.now();
  $('#b-play').innerHTML = `${ICON.pause}<span>Pause</span>`;
  showStart();
  window.__lesson = { get S() { return S; }, enter, next, prev, ACTS, get curA() { return curA; }, toggleReveal, setPaused };
}
