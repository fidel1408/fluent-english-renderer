/* ============================================================
   LESSON HELPERS — shared builders for steps
   ============================================================ */
const FLOOR = 770;
const PRON = { alex: 'he', sam: 'he', nora: 'she', maya: 'she' };
const JOB = { nora: 'a teacher', alex: 'a student', sam: 'a student', maya: 'a doctor' };
const capw = w => w.charAt(0).toUpperCase() + w.slice(1);

/* statement <-> question token pair (be moves to the front) */
function pair(s, b, c) {
  const sub = s === 'I' ? 'I' : s.toLowerCase();
  const cw = c.split(' ');
  const comp = cw.map((w, i) => tk(w, 'comp', 'c' + i));
  return {
    stmt: [tk(capw(s), 'subj', 's'), tk(b, 'be', 'b'), ...comp, tk('.', 'punct', 'dot')],
    quest: [tk(capw(b), 'be', 'b'), tk(sub, 'subj', 's'), ...comp.map(x => ({ ...x })), tk('?', 'punct', 'qm')],
    sText: `${capw(s)} ${b} ${c}.`, qText: `${capw(b)} ${sub} ${c}?`
  };
}

/* a person standing on the classroom floor with a name label above */
function stand(S, k, x, o = {}) {
  const s = o.s || 0.62, y = o.y || FLOOR;
  const p = S.person({ k, x, y, s, pose: o.pose || 'rest', look: o.look || [0, 0], seated: !!o.seated, tilt: o.tilt || 0 });
  if (o.tag !== false) {
    const c = A.cast[k];
    const lab = S.label(`${c.name} (${PRON[k]})${o.job ? '<br><small>' + o.job + '</small>' : ''}`, x, y - 555 * s - (o.job ? 94 : 62));
    p.tag = lab;
  }
  return p;
}

/* a chip with a model sentence and its own Replay button */
function modelChip(S, text, x, y, o = {}) {
  const d = S.el(`<div class="mchip ${o.cls || ''}" style="left:${x}px;top:${y}px;${o.style || ''}"><span>${T(text)}</span></div>`);
  const b = mk(`<button class="rp sm" aria-label="Replay: ${esc(text)}" title="Replay"><svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.500 3A4.500 4.500 0 0014 7.970v8.050c1.500-.7 2.500-2.200 2.500-4.020zM14 3.230v2.060c2.890.86 5 3.540 5 6.710s-2.110 5.850-5 6.710v2.060c4.010-.91 7-4.490 7-8.770s-2.990-7.860-7-8.770z"/></svg></button>`);
  b.onclick = () => FE.speakOne(text.replace(/\|/g, ''), o.tone, o.who);
  d.appendChild(b);
  return d;
}

/* name-tag stack beside a scene: "Alex (he) — a student" */
function factCard(S, text, x, y, cls) { return S.fact(text, x, y, { cls }); }

/* rounds inside one step (small pager used by choose / lab activities) */
function pagerButtons(S, x, y, onPrev, onNext, label) {
  const d = S.el(`<div style="left:${x}px;top:${y}px;display:flex;gap:12px;align-items:center"></div>`);
  const a = mk(`<button class="btn ghost sm">◀ Back</button>`), b = mk(`<button class="btn gold sm">${label || 'Next ▶'}</button>`);
  a.onclick = onPrev; b.onclick = onNext; d.append(a, b); return { el: d, next: b, prev: a };
}

/* a 'who is who' helper to ring things on the picture */
function ringAt(S, x, y, w, h, cls) { const r = S.el(`<div class="ring ${cls || ''}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`); return r; }

/* multiple-choice block (options array of strings, correct index) — returns controller */
function choiceBlock(S, o) {
  const wrap = S.el(`<div style="left:${o.x}px;top:${o.y}px;width:${o.w || 620}px;display:flex;flex-direction:column;gap:14px"></div>`);
  const fb = mk('<div class="fb hint" style="display:none"></div>');
  const btns = o.options.map((t, i) => {
    const b = mk(`<button class="opt"><span class="k">${'ABCD'[i]}</span><span>${T(t)}</span></button>`);
    b.onclick = () => pick(i); wrap.appendChild(b); return b;
  });
  wrap.appendChild(fb);
  let done = false;
  async function pick(i) {
    if (done) return;
    Aud.init();
    if (i === o.correct) {
      done = true; btns.forEach((b, j) => { b.classList.toggle('good', j === i); b.classList.toggle('dim', j !== i); b.disabled = true; });
      Aud.sfx('good'); fb.className = 'fb good'; fb.style.display = 'block'; fb.innerHTML = T(o.good);
      const r = btns[i].getBoundingClientRect(); Fx.burst((r.left + 80), (r.top + 30), 14);
      if (o.onGood) o.onGood();
    } else {
      Aud.sfx('soft'); btns[i].classList.add('bad'); btns[i].classList.add('dim'); fb.className = 'fb hint'; fb.style.display = 'block';
      fb.innerHTML = T((o.hints && o.hints[i]) || o.hint || 'Look again at who answers.');
    }
  }
  return { wrap, btns, fb, pick, reset() { done = false; btns.forEach(b => { b.className = 'opt'; b.disabled = false; }); fb.style.display = 'none'; }, get done() { return done; } };
}

/* order-the-words challenge (click tiles; or Reveal to auto-order) */
function orderGame(S, o) {
  const P = o.pair, words = P.quest;
  const area = S.el(`<div style="left:${o.x || 720}px;top:${o.y || 250}px;width:${o.w || 830}px"></div>`);
  const slots = mk('<div style="display:flex;flex-wrap:wrap;gap:10px;min-height:128px;align-items:flex-start;padding:14px 18px;border-radius:26px;background:rgba(15,19,71,.62);border:3px dashed rgba(255,217,120,.55);margin-bottom:26px;font-size:62px"></div>');
  const tray = mk('<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;min-height:110px"></div>');
  const fb = mk('<div class="fb hint" style="margin-top:20px;display:none"></div>');
  area.append(slots, tray, fb);
  const scr = o.scramble || words.map((_, i) => i).reverse();
  let placed = 0, tiles = [];
  const role = (t) => t.role;
  const hintFor = (clicked) => {
    const exp = words[placed], ct = words.find(w => w.t === clicked);
    if (placed === 0) return clicked === '?' ? 'The question mark comes last.' : (ct.role === 'be' ? '' : `A question starts with be: “${exp.t}”. Be goes before the subject.`);
    if (placed === 1) return clicked === '?' ? 'The question mark comes last.' : `After be comes the subject: “${exp.t}”.`;
    if (clicked === '?') return 'The question mark comes last.';
    return `Keep the rest in the same order. Next: “${exp.t}”.`;
  };
  function addTok(w) {
    const n = mk(`<span class="tok ${role(w)}" style="font-family:var(--serif);font-weight:700">${T(w.t)}</span>`);
    slots.appendChild(n); return n;
  }
  function place(i, fromEl) {
    const w = words[i], t = tiles[i];
    t.classList.add('used');
    const r0 = fromEl ? fromEl.getBoundingClientRect() : null;
    const n = addTok(w);
    if (r0 && !reduced()) { const r1 = n.getBoundingClientRect(), sc = FE.scale || 1; Anim.add(n.animate([{ transform: `translate(${(r0.left - r1.left) / sc}px,${(r0.top - r1.top) / sc}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.3,.7,.2,1)' })); }
    Aud.sfx('place'); placed++;
  }
  function finish(auto) {
    fb.className = 'fb good'; fb.style.display = 'block';
    fb.innerHTML = T(o.expl);
    Aud.sfx('good'); Fx.burst(1000, 330, 22);
    if (!auto) S.sayNow(P.qText, { tone: 'q' }).catch(x => { if (x !== CANCEL) console.error(x); });
  }
  scr.forEach(i => {
    const w = words[i];
    const b = mk(`<button class="tile">${T(w.t)}</button>`);
    b.onclick = () => {
      Aud.init();
      if (placed >= words.length || b.classList.contains('used')) return;
      let ok = words[placed].t === w.t;
      if (ok) { place(i, b); if (placed === words.length) finish(false); else { fb.style.display = 'none'; } }
      else {
        Aud.sfx('soft'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        fb.className = 'fb hint'; fb.style.display = 'block'; fb.innerHTML = T(hintFor(w.t));
      }
    };
    tray.appendChild(b); tiles[i] = b;
  });
  return {
    area, slots, tray, fb,
    async auto(e) {   // Reveal: place every tile in order, then explain
      reset(); for (let i = 0; i < words.length; i++) { place(i, tiles[i]); await sleep(420, S.e); }
      finish(true);
    },
    reset
  };
  function reset() { slots.innerHTML = ''; placed = 0; tiles.forEach(t => { t.classList.remove('used'); }); fb.style.display = 'none'; }
}
