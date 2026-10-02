/* ============================================================
   CORE — state, text/IPA rendering, runner, timers, UI
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mk = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
const fmt = (sec) => { const neg = sec < 0; sec = Math.abs(Math.round(sec)); return (neg ? '+' : '') + String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); };
const SVGNS = 'http://www.w3.org/2000/svg';
const CANCEL = { cancelled: true };
const KEY = 'fluent-english.be-yes-no.v1';

/* ---------------- settings & state ---------------- */
const CFG0 = { cc: 2, es: false, voiceEn: '', voiceEs: '', rate: 0.85, vSpeech: 1, vMusic: 0.6, vSfx: 0.8, rm: 'auto', support: true, vocab: false };
const CFG = Object.assign({}, CFG0);
let ST = null;
const freshState = () => ({
  v: 1, started: false, paused: true, ch: 0, st: 0, visited: {}, completed: {},
  timers: LESSON.map(c => ({ def: c.min * 60, rem: c.min * 60, spent: 0, ext: 0, skip: 0, visited: false, over: false })),
  clock: { active: 0, paused: 0 },
  assess: { mode: 'class', answers: {}, submitted: false, first: null, retryAnswers: {}, retry: null, retried: false },
  tally: { asked: 0, answered: 0, original: 0, followup: 0 },
  exit: { be: '', order: '', persp: '', indep: '' },
  notes: ''
});
const Store = {
  load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } },
  save() { try { localStorage.setItem(KEY, JSON.stringify({ cfg: CFG, st: ST })); } catch (e) { } },
  clear() { try { localStorage.removeItem(KEY); } catch (e) { } }
};
let saveT = null;
const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(() => Store.save(), 400); };

/* ---------------- text with IPA beneath every English word ---------------- */
const IPAMISS = new Set();
function wordIPA(w) {
  const k = w.toLowerCase().replace(/’/g, "'");
  if (Object.prototype.hasOwnProperty.call(IPA, k)) return IPA[k];
  IPAMISS.add(k); return null;
}
function wrapWord(core) {
  const ip = wordIPA(core);
  return ip ? `<span class="w"><span class="t">${core}</span><span class="p">/${ip}/</span></span>` : `<span class="w"><span class="t">${core}</span></span>`;
}
function wrapTok(tok) {
  const m = tok.match(/^([“"'(\[¿¡‘]*)(.*?)([”"'.,?!:;)\]…’]*)$/);
  let lead = m[1], core = m[2], trail = m[3];
  if (!core) return tok;
  if (!/[A-Za-z0-9]/.test(core)) return tok;
  if (/^_+$/.test(core)) return `<span class="w"><span class="t">${lead}${core}${trail}</span></span>`;
  if (core.indexOf('/') > 0 && !/^\d/.test(core)) {
    const parts = core.split('/');
    return `<span class="sl">${lead}${parts.map(wrapWord).join('<span class="w"><span class="t">/</span></span>')}${trail}</span>`;
  }
  const ip = (core === 'A' && /^,/.test(trail)) ? 'eɪ' : wordIPA(core);
  const t = `${lead}${core}${trail}`;
  return ip ? `<span class="w"><span class="t">${t}</span><span class="p">/${ip}/</span></span>` : `<span class="w"><span class="t">${t}</span></span>`;
}
/* T(): English text -> HTML (words get IPA, tags pass through, punctuation exempt) */
function T(str) {
  return String(str).split(/(<[^>]+>)/).map(seg => seg.charAt(0) === '<' ? seg : seg.replace(/[^\s]+/g, wrapTok)).join('');
}

/* ---------------- runner: epoch, pause-aware waiting ---------------- */
const Run = { epoch: 0, S: null };
const alive = (e) => { if (e !== Run.epoch) throw CANCEL; };
const sleep = async (ms, e = Run.epoch) => {
  let left = ms, last = performance.now();
  while (left > 0) {
    await new Promise(r => setTimeout(r, 40));
    alive(e);
    const now = performance.now(), d = now - last; last = now;
    if (!ST.paused) left -= d;
  }
};
const waitUnpaused = async (e) => { while (ST.paused) { await new Promise(r => setTimeout(r, 80)); alive(e); } };
const reduced = () => document.body.classList.contains('rm');

/* ---------------- animation registry (pausable) ---------------- */
const Anim = {
  set: new Set(),
  add(a) { if (ST && ST.paused) a.pause(); this.set.add(a); const done = () => this.set.delete(a); a.finished.then(done, done); return a; },
  pause() { this.set.forEach(a => { try { a.pause(); } catch (e) { } }); },
  play() { this.set.forEach(a => { try { a.play(); } catch (e) { } }); },
  clear() { this.set.forEach(a => { try { a.cancel(); } catch (e) { } }); this.set.clear(); }
};

/* ---------------- captions ---------------- */
function setCaption(text, lang) {
  const cc = $('#cc');
  if (!text) { cc.className = 'empty'; cc.innerHTML = ''; return; }
  cc.className = '';
  cc.innerHTML = lang === 'es' ? `<span class="sp">${esc(text)}</span>` : T(esc(text));
}

/* ---------------- sparkles (calm, no flashing) ---------------- */
const Fx = {
  ps: [], running: false,
  burst(x, y, n = 18, cols = ['#ffd978', '#5fe3da', '#fff6e5']) {
    if (reduced()) return;
    for (let i = 0; i < n; i++) this.ps.push({ x, y, vx: (Math.random() - 0.5) * 2.2, vy: -Math.random() * 2 - 0.4, life: 1, r: 2 + Math.random() * 3, c: cols[i % cols.length] });
    this.run();
  },
  drift(n = 40) { // slow rising motes for the final recap
    if (reduced()) return;
    for (let i = 0; i < n; i++) this.ps.push({ x: Math.random() * 1600, y: 900 + Math.random() * 100, vx: (Math.random() - 0.5) * 0.4, vy: -0.5 - Math.random() * 0.8, life: 1.6, r: 2 + Math.random() * 4, c: ['#ffd978', '#5fe3da', '#fff6e5'][i % 3], g: 0 });
    this.run();
  },
  run() {
    if (this.running) return; this.running = true;
    const cv = $('#fx'), g = cv.getContext('2d');
    const step = () => {
      g.clearRect(0, 0, 1600, 900);
      if (!ST.paused) this.ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += p.g === undefined ? 0.03 : 0; p.life -= 0.012; });
      this.ps = this.ps.filter(p => p.life > 0);
      this.ps.forEach(p => { g.globalAlpha = Math.max(0, Math.min(1, p.life)) * 0.8; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); });
      if (this.ps.length) requestAnimationFrame(step); else { this.running = false; g.clearRect(0, 0, 1600, 900); }
    };
    requestAnimationFrame(step);
  }
};

/* ---------------- people: smooth joint-angle tweening ---------------- */
function PersonHandle(svg, o) {
  const wrap = document.createElementNS(SVGNS, 'g');
  svg.appendChild(wrap);
  const base = Object.assign({ pose: 'rest' }, o);
  const preset = A.poses[base.pose];
  const cur = { L: Object.assign({}, preset.L, base.armL || {}), R: Object.assign({}, preset.R, base.armR || {}) };
  const draw = () => { wrap.innerHTML = A.person(Object.assign({}, base, { pose: 'rest', armL: cur.L, armR: cur.R })); };
  draw();
  const self = {
    g: wrap, o: base,
    talk(on) { const p = wrap.querySelector('.person'); if (p) p.classList.toggle('talking', !!on); },
    async pose(name, ms = 700, e = Run.epoch) {
      const tgt = typeof name === 'string' ? A.poses[name] : name;
      const from = JSON.parse(JSON.stringify(cur));
      const to = { L: Object.assign({}, cur.L, tgt.L || {}), R: Object.assign({}, cur.R, tgt.R || {}) };
      if (reduced() || ms <= 0) { cur.L = to.L; cur.R = to.R; draw(); return; }
      let t = 0, last = performance.now();
      await new Promise(res => {
        const f = () => {
          if (e !== Run.epoch) return res();
          const now = performance.now(); if (!ST.paused) t += now - last; last = now;
          const k = Math.min(1, t / ms), ez = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          ['L', 'R'].forEach(s => { cur[s] = Object.assign({}, k > 0.45 ? to[s] : from[s], { a: from[s].a + (to[s].a - from[s].a) * ez, f: from[s].f + (to[s].f - from[s].f) * ez }); });
          draw();
          if (k < 1) requestAnimationFrame(f); else res();
        };
        requestAnimationFrame(f);
      });
    },
    look(dx, dy) { base.look = [dx, dy]; draw(); }
  };
  return self;
}

/* ---------------- sentence tokens that move ---------------- */
function Sentence(parent, tokens, o = {}) {
  const el = document.createElement('div');
  el.className = 'sent' + (o.cls ? ' ' + o.cls : '');
  el.style.fontSize = (o.size || 84) + 'px';
  parent.appendChild(el);
  const nodes = new Map();
  const make = (tk) => { const n = document.createElement('span'); n.className = 'tok ' + (tk.role || ''); n.dataset.id = tk.id; n.innerHTML = T(tk.t); n._t = tk.t; return n; };
  const self = {
    el, nodes, tokens: [],
    set(toks) { el.innerHTML = ''; nodes.clear(); toks.forEach(tk => { const n = make(tk); el.appendChild(n); nodes.set(tk.id, n); }); self.tokens = toks; return self; },
    async morph(toks, ms = 1200, e = Run.epoch) {
      if (reduced()) ms = 1;
      const sc = FE.scale || 1;
      const first = new Map(); nodes.forEach((n, id) => first.set(id, n.getBoundingClientRect()));
      const elr = el.getBoundingClientRect();
      const keep = new Set(toks.map(t => t.id));
      // leaving nodes become absolutely positioned ghosts
      const ghosts = [];
      nodes.forEach((n, id) => { if (!keep.has(id)) { const r = first.get(id); n.style.position = 'absolute'; n.style.left = ((r.left - elr.left) / sc) + 'px'; n.style.top = ((r.top - elr.top) / sc) + 'px'; ghosts.push(n); nodes.delete(id); } });
      const fresh = [];
      toks.forEach(tk => {
        let n = nodes.get(tk.id);
        if (!n) { n = make(tk); n.style.opacity = '0'; nodes.set(tk.id, n); fresh.push(n); }
        else { n.className = 'tok ' + (tk.role || ''); if (n._t !== tk.t) { const nn = n; n._t = tk.t; setTimeout(() => { nn.innerHTML = T(tk.t); }, ms * 0.42); } }
        el.appendChild(n);
      });
      const anims = [];
      let k = 0;
      toks.forEach(tk => {
        const n = nodes.get(tk.id), r0 = first.get(tk.id);
        if (!r0) return;
        const r1 = n.getBoundingClientRect(), dx = (r0.left - r1.left) / sc, dy = (r0.top - r1.top) / sc;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          n.classList.add('moving');
          const a = n.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'translate(0,0)' }], { duration: ms, delay: k * 70, easing: 'cubic-bezier(.45,.05,.2,1)', fill: 'backwards' });
          a.finished.then(() => n.classList.remove('moving'), () => { });
          anims.push(Anim.add(a)); k++;
        }
      });
      fresh.forEach(n => { anims.push(Anim.add(n.animate([{ opacity: 0, transform: 'translateY(16px) scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: ms * 0.5, delay: ms * 0.55, easing: 'ease-out', fill: 'both' }))); n.style.opacity = ''; });
      ghosts.forEach(n => { anims.push(Anim.add(n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms * 0.5, fill: 'forwards' }))); setTimeout(() => n.remove(), ms * 0.6 + 100); });
      self.tokens = toks;
      await Promise.all(anims.map(a => a.finished.catch(() => { })));
      alive(e);
    }
  };
  return self.set(tokens);
}
/* token helpers: tk('are','be') etc. */
const tk = (t, role, id) => ({ id: id || t.toLowerCase().replace(/[^a-z]/g, '') || 'p', t, role });
const toks = (arr) => arr.map(a => (typeof a === 'string' ? tk(a) : tk(a[0], a[1], a[2])));

/* ---------------- step context ---------------- */
function makeCtx(step, e) {
  const root = $('#content');
  const S = {
    e, step, root, levels: 0, lv: 0, es: step.es || '', svg: null, persons: {}, supportable: false,
    alive() { alive(S.e); },
    sleep: (ms) => sleep(ms, S.e),
    regs: [], sayAtMap: {},
    reg(el, at, o = {}) { S.regs.push({ el, at, until: o.until }); el.classList.add('lv'); el.classList.toggle('hidden-lv', S.lv < at); return el; },
    sayAt(n, text, o) { S.sayAtMap[n] = { text, o: o || {} }; },
    interrupt() { const e2 = ++Run.epoch; Sp.cancel(); S.e = e2; return e2; },
    async sayNow(text, o = {}) { const e2 = ++Run.epoch; Sp.cancel(); S.e = e2; await waitUnpaused(e2); await S.say(text, o); },
    sfx: (n) => Aud.sfx(n),
    /* spoken phrase(s); "|" marks a natural phrase break */
    async say(text, o = {}) {
      const e = S.e; alive(e);
      const plain = text.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
      const lang = o.lang || 'en';
      if (o.caption !== false) setCaption(o.cap || plain, lang);
      if (o.who) o.who.talk(true);
      Sp.n = (Sp.n || 0) + 1; Aud.duck(true);
      try {
        const parts = text.split('|');
        for (let i = 0; i < parts.length; i++) {
          const ph = parts[i].trim(); if (!ph) continue;
          for (; ;) {
            await waitUnpaused(e);
            const r = await Sp.once(ph, { lang, pitch: o.tone === 'q' ? 1.08 : (o.tone === 's' ? 0.97 : 1), rate: o.rate }, e);
            alive(e);
            if (r === 'done') break;
          }
          if (i < parts.length - 1) await sleep(o.gap || 260, e);
        }
      } finally {
        if (o.who) o.who.talk(false);
        Sp.n = Math.max(0, (Sp.n || 1) - 1); if (!Sp.n) Aud.duck(false);
      }
      if (o.after) await sleep(o.after, e);
    },
    html(h, style, cls) { const d = mk(`<div class="${cls || ''}" style="${style || ''}">${h}</div>`); root.appendChild(d); return d; },
    el(h) { const d = mk(h); root.appendChild(d); return d; },
    scene() { if (!S.svg) { S.svg = document.createElementNS(SVGNS, 'svg'); S.svg.setAttribute('class', 'scene'); S.svg.setAttribute('viewBox', '0 0 1600 900'); root.appendChild(S.svg); } return S.svg; },
    add(markup) { const g = document.createElementNS(SVGNS, 'g'); g.innerHTML = markup; S.scene().appendChild(g); return g; },
    person(o) { const p = PersonHandle(S.scene(), o); S.persons[o.k + (o.id || '')] = p; return p; },
    label(text, x, y, o = {}) {
      const d = mk(`<div class="nametag ${o.cls || ''}" style="left:${x}px;top:${y}px;${o.style || ''}">${T(text)}</div>`);
      if (o.noCenter) d.style.transform = 'none';
      root.appendChild(d); return d;
    },
    fact(text, x, y, o = {}) { const d = mk(`<div class="fact ${o.cls || ''}" style="left:${x}px;top:${y}px;${o.style || ''}">${T(text)}</div>`); root.appendChild(d); return d; },
    bubble(text, x, y, o = {}) {
      const d = mk(`<div class="bubble ${o.cls || ''}" style="left:${x}px;top:${y}px;${o.w ? 'width:' + o.w + 'px;' : ''}${o.style || ''}${o.tail ? '--tail:' + o.tail + 'px;' : ''}">${T(text)}</div>`);
      root.appendChild(d); return d;
    },
    board(x, y, w, h, o = {}) { const d = mk(`<div class="board ${o.cls || ''}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`); root.appendChild(d); return d; },
    paper(x, y, w, h, o = {}) { const d = mk(`<div class="paper ${o.cls || ''}" style="left:${x}px;top:${y}px;${w ? 'width:' + w + 'px;' : ''}${h ? 'height:' + h + 'px;' : ''}${o.style || ''}"></div>`); root.appendChild(d); return d; },
    sentence(parent, toks_, o) { return Sentence(parent, toks_, o); },
    replayBtn(text, x, y, o = {}) {
      const b = mk(`<button class="rp ${o.sm ? 'sm' : ''}" style="left:${x}px;top:${y}px" aria-label="Replay: ${esc(text)}" title="Replay"><svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.500 3A4.500 4.500 0 0014 7.970v8.050c1.500-.7 2.500-2.200 2.500-4.020zM14 3.230v2.060c2.890.86 5 3.540 5 6.710s-2.110 5.850-5 6.710v2.060c4.010-.91 7-4.490 7-8.770s-2.990-7.860-7-8.770z"/></svg></button>`);
      b.onclick = () => FE.speakOne(text, o.tone, o.who);
      root.appendChild(b); return b;
    },
    turn(text, x, y) { return S.el(`<div class="turn lv" style="left:${x}px;top:${y}px"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#14173f" stroke-width="3"/><path d="M12 22q4 6 8 0M14 15h.1M26 15h.1" stroke="#14173f" stroke-width="3.5" stroke-linecap="round" fill="none"/></svg><span>${T(text)}</span></div>`); },
    setLevel(n, silent) { return FE.setLevel(n, silent); }
  };
  return S;
}

/* ============================================================
   FE — the teacher-controlled lesson engine
   ============================================================ */
const FE = {
  scale: 1, bgCur: '', bgFlip: false,
  flat: [],
  buildFlat() { this.flat = []; LESSON.forEach((c, ci) => c.steps.forEach((s, si) => this.flat.push({ ci, si }))); },
  idx() { return this.flat.findIndex(f => f.ci === ST.ch && f.si === ST.st); },
  cur() { return LESSON[ST.ch].steps[ST.st]; },

  setBg(name) {
    if (name === this.bgCur) return; this.bgCur = name;
    const a = $('#bgA'), b = $('#bgB'), nxt = this.bgFlip ? a : b, prv = this.bgFlip ? b : a;
    nxt.innerHTML = A.bg[name](); nxt.style.opacity = 1; prv.style.opacity = 0; this.bgFlip = !this.bgFlip;
  },
  enter(ci, si, o = {}) {
    Run.epoch++; const e = Run.epoch;
    Sp.cancel(); Anim.clear(); setCaption('');
    ST.ch = ci; ST.st = si;
    const chap = LESSON[ci], step = chap.steps[si];
    ST.visited[step.id] = true; ST.timers[ci].visited = true;
    const content = $('#content'); content.innerHTML = '';
    const S = makeCtx(step, e); Run.S = S;
    $('#kick').textContent = `Section ${chap.n} · ${chap.time}`;
    $('#title').innerHTML = step.hideTitle ? '' : T(step.title);
    $('#chPill').innerHTML = `<b>${chap.n}/${LESSON.length}</b> ${esc(chap.title)}`;
    if (step.supportDefault !== undefined) CFG.support = step.supportDefault;
    this.setBg(step.bg || chap.bg);
    $('#veil').style.opacity = step.veil === undefined ? 1 : step.veil;
    Aud.setMode(step.music || 'bed'); Aud.setQuiet(!!step.quiet);
    $('#esText').textContent = step.es || '';
    $('#live').textContent = `Section ${chap.n}: ${chap.title}. ${step.title}`;
    try { step.build(S); } catch (err) { console.error('step build failed', step.id, err); }
    this.updateDock();
    if (S.levels) this.setLevel(0, true);
    if (S.play && ST.started) { (async () => { try { await waitUnpaused(e); await S.play(); } catch (x) { if (x !== CANCEL) console.error(x); } })(); }
    saveSoon();
  },
  goFlat(i) { i = Math.max(0, Math.min(this.flat.length - 1, i)); const f = this.flat[i]; this.enter(f.ci, f.si); },
  next() { const i = this.idx(); if (i < this.flat.length - 1) this.goFlat(i + 1); else UI.toast('That was the last step. Open Results to review and export.'); },
  prev() { const i = this.idx(); if (i > 0) this.goFlat(i - 1); },
  replay() { this.enter(ST.ch, ST.st); },
  setLevel(n, silent) {
    const S = Run.S; if (!S) return;
    const prev = S.lv; S.lv = n;
    S.regs.forEach(r => r.el.classList.toggle('hidden-lv', n < r.at || (r.until !== undefined && n >= r.until)));
    const sa = S.sayAtMap[n];
    if (sa && n > prev && !silent) S.sayNow(sa.text, sa.o).catch(x => { if (x !== CANCEL) console.error(x); });
    if (S.onLevel) { Promise.resolve(S.onLevel(n, prev, !!silent)).catch(x => { if (x !== CANCEL) console.error(x); }); }
    this.updateDock();
  },
  reveal() {
    const S = Run.S; if (!S || !S.levels) return;
    if (S.lv < S.levels) { Aud.sfx('reveal'); this.setLevel(S.lv + 1); }
    else { Aud.sfx('tick'); this.setLevel(0); }
  },
  async speakOne(text, tone, who) { // individual Replay buttons: clear queue, speak just this phrase
    Aud.init();
    const S = Run.S || makeCtx({}, Run.epoch);
    try { await S.sayNow(text, { tone: tone || (/\?/.test(text) ? 'q' : 's'), who }); } catch (x) { if (x !== CANCEL) console.error(x); }
  },
  updateDock() {
    const S = Run.S, i = this.idx();
    $('#bPrev').disabled = i <= 0;
    $('#bNext').disabled = i >= this.flat.length - 1;
    const rb = $('#bReveal');
    if (!S || !S.levels) { rb.disabled = true; $('#revTxt').textContent = S && S.noRevealMsg ? 'Answers hidden' : 'Reveal Answer'; rb.title = S && S.noRevealMsg ? S.noRevealMsg : 'Nothing to reveal in this step'; }
    else { rb.disabled = false; $('#revTxt').textContent = S.lv < S.levels ? (S.revLabels && S.revLabels[S.lv] || 'Reveal Answer') : 'Hide Answer'; rb.title = 'Reveal / Hide answer (R)'; }
    $('#bSupport').disabled = !(S && S.supportable);
    $('#bSupport').setAttribute('aria-pressed', CFG.support ? 'true' : 'false');
    $('#bSupport span').textContent = S && S.supportable ? `Support: ${CFG.support ? 'On' : 'Off'}` : 'Support: n/a';
    const chap = LESSON[ST.ch];
    $('#stepInfo').innerHTML = `Step ${i + 1} of ${this.flat.length}<br><small>${esc(chap.title)} · ${ST.st + 1}/${chap.steps.length}</small>`;
    const pt = !ST.started ? 'Start Lesson' : (ST.paused ? 'Play' : 'Pause');
    $('#playTxt').textContent = pt;
    $('#playIco').innerHTML = (ST.started && !ST.paused) ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
    document.body.classList.toggle('paused', ST.paused);
  },

  /* ---------- play / pause / start ---------- */
  start(resume) {
    Aud.init(); Aud.setVol('music', CFG.vMusic); Aud.setVol('sfx', CFG.vSfx);
    $('#start').style.display = 'none';
    ST.started = true; ST.paused = false;
    Aud.setPaused(false);
    $('#live').textContent = 'Lesson started';
    this.enter(ST.ch, ST.st);
    Store.save();
  },
  setPaused(p) {
    if (!ST.started) return this.start();
    ST.paused = p; Aud.setPaused(p);
    if (p) { Sp.cancel(); Anim.pause(); } else { Anim.play(); }
    this.updateDock(); UI.tick(); Store.save();
  },
  togglePlay() { this.setPaused(!ST.paused); }
};

/* ============================================================
   UI — top bar, dock, drawers, modals, timers, results
   ============================================================ */
const UI = {
  toast(msg, ms = 3800) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), ms); },
  modal(html, onMount) { const m = $('#modal'); m.innerHTML = html; $('#modalBg').classList.add('open'); const f = m.querySelector('button,input,textarea'); if (onMount) onMount(m); f && f.focus(); m.scrollTop = 0; },
  closeModal() { $('#modalBg').classList.remove('open'); $('#modal').innerHTML = ''; },
  drawer(id, open) { const d = $('#' + id); d.classList.toggle('open', open); if (open) { if (id === 'chapDrawer') this.buildChapters(); if (id === 'setDrawer') this.buildSettings(); } },
  closeDrawers() { $$('.drawer').forEach(d => d.classList.remove('open')); },

  applyCfg() {
    const b = document.body;
    b.classList.remove('cc0', 'cc1', 'cc2'); b.classList.add('cc' + CFG.cc);
    b.classList.toggle('ipa', CFG.cc === 2);
    b.classList.toggle('es', !!CFG.es);
    b.classList.toggle('vocab', !!CFG.vocab);
    const mq = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    b.classList.toggle('rm', CFG.rm === 'on' || (CFG.rm === 'auto' && mq));
    $$('#ccSeg button').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.cc === CFG.cc)));
    $('#esBtn').setAttribute('aria-pressed', String(!!CFG.es));
    Aud.setVol('music', CFG.vMusic); Aud.setVol('sfx', CFG.vSfx);
  },
  setCC(n) { CFG.cc = n; this.applyCfg(); Store.save(); },
  toggleEs() { CFG.es = !CFG.es; this.applyCfg(); Store.save(); },
  toggleSupport() { CFG.support = !CFG.support; FE.updateDock(); const S = Run.S; if (S && S.onSupport) S.onSupport(); Store.save(); },
  toggleChrome() { document.body.classList.toggle('nochrome'); this.fit(); },
  fit() {
    const w = $('#stageWrap'), c = $('#canvas');
    const W = w.clientWidth, H = w.clientHeight, s = Math.min(W / 1600, H / 900);
    FE.scale = s;
    c.style.transform = `translate(${(W - 1600 * s) / 2}px,${(H - 900 * s) / 2}px) scale(${s})`;
  },

  /* ---------- timers ---------- */
  tick() {
    if (!ST) return;
    const t = ST.timers[ST.ch];
    const now = performance.now(), dt = this._last ? Math.min(1, (now - this._last) / 1000) : 0; this._last = now;
    if (ST.started) {
      if (!ST.paused) {
        t.rem -= dt; t.spent += dt; ST.clock.active += dt;
        if (t.rem <= 0 && !t.over) { t.over = true; Aud.sfx('chime'); UI.toast(`Time is up for section ${LESSON[ST.ch].n}. Extend the timer, or go on when your class is ready — the class will run longer than 60:00.`, 6000); }
      } else ST.clock.paused += dt;
    }
    const total = Math.max(1, t.def + t.ext), frac = Math.max(0, Math.min(1, t.rem / total));
    $('#tText').textContent = fmt(t.rem);
    $('#tSub').textContent = t.rem < 0 ? 'over time' : (ST.started ? (ST.paused ? 'paused' : 'this section') : 'ready');
    $('#tRing').style.strokeDashoffset = String((1 - frac) * 100.5);
    $('#tRing').style.stroke = t.rem < 0 ? '#ff9a8d' : '#5fe3da';
    $('#timerBtn').classList.toggle('over', t.rem < 0);
    if (Math.floor(ST.clock.active) % 5 === 0) saveSoon();
  },
  extend(sec) {
    const t = ST.timers[ST.ch]; t.rem += sec; t.ext += sec; if (t.rem > 0) t.over = false;
    this.tick(); Store.save();
    this.toast(`Added ${sec === 30 ? '30 seconds' : '1 minute'} to section ${LESSON[ST.ch].n}. The class will run about that much longer than 60:00.`);
  },
  skipTimer() {
    const t = ST.timers[ST.ch], left = Math.max(0, t.rem);
    t.skip += left; t.rem = 0; t.over = true;
    const i = FE.idx(); const nextChap = ST.ch + 1 < LESSON.length;
    this.toast(`Section ${LESSON[ST.ch].n} timer skipped (${fmt(left)} of planned time removed). The class will finish earlier than 60:00.`);
    if (nextChap) FE.enter(ST.ch + 1, 0); else this.toast('This was the last section. Open Results to review and export.');
    Store.save();
  },
  projected() {
    let total = 0, remaining = 0;
    ST.timers.forEach(t => { total += t.spent + Math.max(0, t.rem); remaining += Math.max(0, t.rem); });
    return { total, remaining };
  },
  timerPanel() {
    const p = this.projected(), planned = LESSON.reduce((a, c) => a + c.min * 60, 0);
    const end = new Date(Date.now() + p.remaining * 1000);
    const rows = LESSON.map((c, i) => { const t = ST.timers[i]; return `<tr><td>${c.n}</td><td>${esc(c.title)}</td><td>${fmt(t.def)}</td><td>${t.ext ? '+' + fmt(t.ext) : '–'}</td><td>${t.skip ? '−' + fmt(t.skip) : '–'}</td><td>${fmt(t.spent)}</td><td>${fmt(t.rem)}</td></tr>`; }).join('');
    this.modal(`<h2>Class time</h2>
      <div class="box">Default timers: <b>${fmt(planned)}</b>. At the pace set so far the lesson is projected to take <b>${fmt(p.total)}</b> of teaching time (${p.total - planned >= 0 ? '+' : '−'}${fmt(Math.abs(p.total - planned))} vs plan). If you continue now, it would end at about <b>${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>.</div>
      <div class="box">Only <b>unpaused</b> time counts on the section timers. <b>Pausing</b> (${fmt(ST.clock.paused)} so far), <b>extending</b>, <b>revisiting</b> and <b>skipping</b> change the real length of your class — the wall clock keeps running while the timers stand still.</div>
      <table><thead><tr><th>#</th><th>Section</th><th>Planned</th><th>Added</th><th>Skipped</th><th>Used</th><th>Left</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="acts"><button class="btn" id="mClose">Close</button></div>`, m => { $('#mClose', m).onclick = () => UI.closeModal(); });
  },

  /* ---------- chapters ---------- */
  buildChapters() {
    const b = $('#chapBody');
    b.innerHTML = LESSON.map((c, i) => {
      const t = ST.timers[i];
      return `<div class="chitem ${i === ST.ch ? 'cur' : ''}"><button class="hd" data-go="${i}:0"><span class="num">${c.n}</span><span><b>${esc(c.title)}</b><br><span class="meta">${c.time} · planned ${fmt(t.def)}${t.ext ? ' +' + fmt(t.ext) : ''}${t.skip ? ' −' + fmt(t.skip) : ''} · left ${fmt(t.rem)} · ${c.steps.filter(s => ST.visited[s.id]).length}/${c.steps.length} visited</span></span></button>
      <div class="steps">${c.steps.map((s, j) => `<button data-go="${i}:${j}" class="${i === ST.ch && j === ST.st ? 'cur' : ''} ${ST.visited[s.id] ? 'vis' : ''}" title="${esc(s.title)}">${s.id}</button>`).join('')}</div></div>`;
    }).join('') + `<p class="note">Jumping to a section revisits it. Each section keeps its own timer, so revisiting adds real class time. Step buttons with a turquoise edge have been visited.</p>`;
    $$('[data-go]', b).forEach(x => x.onclick = () => { const [a, c] = x.dataset.go.split(':').map(Number); this.drawer('chapDrawer', false); FE.enter(a, c); });
  },

  /* ---------- settings ---------- */
  refreshVoices() { if ($('#setDrawer').classList.contains('open')) this.buildSettings(); },
  buildSettings() {
    const en = Sp.list('en'), es = Sp.list('es');
    const sel = (list, cur, id) => `<select id="${id}"><option value="">Automatic (best match)</option>${list.map(v => `<option value="${esc(v.voiceURI)}" ${cur === v.voiceURI ? 'selected' : ''}>${esc(v.name)} — ${esc(v.lang)}</option>`).join('')}</select>`;
    const warn = Sp.none ? '<p class="note" style="color:var(--coral-l)">No speech voices were found on this device/browser. The lesson still runs with on-screen captions and timed pauses.</p>' : (!Sp.hasUS() ? '<p class="note" style="color:var(--gold-l)">No American-English (en-US) voice found. The lesson will use another English voice, which may not sound American.</p>' : '');
    $('#setBody').innerHTML = `
      <h3>English model voice</h3>${sel(en, CFG.voiceEn, 'vEn')}
      <h3>Spanish Help voice</h3>${sel(es, CFG.voiceEs, 'vEs')}
      ${warn}
      <label for="rate">Speaking rate: <span id="rateV">${CFG.rate.toFixed(2)}</span>×</label><input type="range" id="rate" min="0.55" max="1.2" step="0.05" value="${CFG.rate}">
      <p><button class="btn sm" id="testEn">▶ Test English</button> <button class="btn sm ghost" id="testEs">▶ Prueba español</button></p>
      <h3>Volume</h3>
      <label for="vSp">Speech</label><input type="range" id="vSp" min="0" max="1" step="0.05" value="${CFG.vSpeech}">
      <label for="vMu">Music</label><input type="range" id="vMu" min="0" max="1" step="0.05" value="${CFG.vMusic}">
      <label for="vSf">Effects</label><input type="range" id="vSf" min="0" max="1" step="0.05" value="${CFG.vSfx}">
      <p class="note">Music is lowered under speech and is silent during learner responses and the assessment.</p>
      <h3>Motion &amp; pictures</h3>
      <label for="rmSel">Reduced motion</label><select id="rmSel"><option value="auto" ${CFG.rm === 'auto' ? 'selected' : ''}>Follow my device setting</option><option value="on" ${CFG.rm === 'on' ? 'selected' : ''}>On (no flying words, no sparkles)</option><option value="off" ${CFG.rm === 'off' ? 'selected' : ''}>Off</option></select>
      <label><input type="checkbox" id="vocabChk" ${CFG.vocab ? 'checked' : ''}> Show vocabulary labels on pictures</label>
      <h3>About voices &amp; IPA</h3>
      <p class="note">Voices are your device's own speech synthesis, so quality and accent vary. Rising or falling intonation is only <i>modelled</i> using punctuation and pitch; the lesson cannot measure learner pronunciation.</p>
      <p class="note">IPA uses the symbols of the Fluent English Sound Chart (the same symbols as Oxford Learner's Dictionaries, American English). Each word's IPA was written by hand in that style. <b>No live Oxford lookup was made</b> when this lesson was built (the site could not be reached), so please check any word you are unsure of. Sentences are transcribed word by word from these entries; Oxford did not supply full-sentence transcriptions.</p>
      <button class="btn sm" id="ipaKeyBtn">IPA key (sound chart)</button>
      <h3>Local data</h3>
      <p class="note">Settings, progress and scores are stored only in this browser. No names or emails are collected and nothing is uploaded.</p>
      <button class="btn sm coral" id="clrData">Clear all local data…</button>`;
    const b = $('#setBody');
    $('#vEn', b).onchange = e => { CFG.voiceEn = e.target.value; Store.save(); };
    $('#vEs', b).onchange = e => { CFG.voiceEs = e.target.value; Store.save(); };
    $('#rate', b).oninput = e => { CFG.rate = +e.target.value; $('#rateV', b).textContent = CFG.rate.toFixed(2); Store.save(); };
    $('#vSp', b).oninput = e => { CFG.vSpeech = +e.target.value; Store.save(); };
    $('#vMu', b).oninput = e => { CFG.vMusic = +e.target.value; Aud.setVol('music', CFG.vMusic); Store.save(); };
    $('#vSf', b).oninput = e => { CFG.vSfx = +e.target.value; Aud.setVol('sfx', CFG.vSfx); Store.save(); };
    $('#rmSel', b).onchange = e => { CFG.rm = e.target.value; UI.applyCfg(); Store.save(); };
    $('#vocabChk', b).onchange = e => { CFG.vocab = e.target.checked; UI.applyCfg(); Store.save(); };
    $('#testEn', b).onclick = () => { Aud.init(); FE.speakOne('Are you ready?', 'q'); };
    $('#testEs', b).onclick = () => { Aud.init(); const e = ++Run.epoch; Sp.cancel(); const S = makeCtx({}, e); S.say('¿Estás listo?', { lang: 'es' }).catch(() => { }); };
    $('#ipaKeyBtn', b).onclick = () => UI.ipaKey();
    $('#clrData', b).onclick = () => UI.modal(`<h2>Clear all local data?</h2><p>This removes saved settings, progress, scores and notes from this browser. It cannot be undone.</p><div class="acts"><button class="btn coral" id="yes">Clear everything</button><button class="btn ghost" id="no">Cancel</button></div>`, m => { $('#no', m).onclick = () => UI.closeModal(); $('#yes', m).onclick = () => { Store.clear(); location.reload(); }; });
  },

  ipaKey() {
    const G = [
      ['Short vowels', [['æ', 'am'], ['e', 'yes'], ['ɪ', 'is'], ['ʊ', 'book'], ['ʌ', 'up'], ['ə', 'a']]],
      ['Long vowels', [['iː', 'he'], ['uː', 'you'], ['ɑː', 'on'], ['ɔː', 'or']]],
      ['Diphthongs', [['aɪ', 'I'], ['eɪ', 'late'], ['əʊ', 'no'], ['aʊ', 'now'], ['ɔɪ', 'voice']]],
      ['Vowel + r', [['ɑːr', 'are'], ['er', 'there'], ['ɔːr', 'door'], ['ɜːr', 'turn'], ['ɪr', 'here']]],
      ['Consonants', [['p', 'pen'], ['b', 'bag'], ['t', 'teacher'], ['d', 'door'], ['k', 'book'], ['g', 'goes'], ['f', 'for'], ['v', 'voice'], ['θ', 'three'], ['ð', 'the'], ['s', 'say'], ['z', 'is'], ['ʃ', 'she'], ['ʒ', 'television'], ['h', 'he'], ['tʃ', 'teacher'], ['dʒ', 'jobs'], ['m', 'am'], ['n', 'no'], ['ŋ', 'speaking'], ['l', 'late'], ['r', 'right'], ['w', 'we'], ['j', 'yes']]]
    ];
    const ipaOf = w => w === 'television' ? 'ˈtelɪvɪʒn' : (IPA[w.toLowerCase()] || '');
    this.modal(`<h2>IPA key</h2><div class="box">Symbols follow the Fluent English Sound Chart (Oxford Learner's American English symbols). Each example word is from this lesson.</div>` +
      G.map(g => `<h3 style="margin:14px 0 6px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-l)">${g[0]}</h3><div style="display:flex;flex-wrap:wrap;gap:8px">${g[1].map(([sy, w]) => `<div style="background:rgba(255,246,229,.08);border:1px solid rgba(255,246,229,.25);border-radius:12px;padding:6px 12px;min-width:112px;text-align:center"><div style="font-family:var(--ipa);font-size:26px;color:var(--gold-l)">${sy}</div><div style="font-size:15px">${w}</div><div style="font-family:var(--ipa);font-size:13px;opacity:.85">/${ipaOf(w)}/</div></div>`).join('')}</div>`).join('') +
      `<div class="box" style="margin-top:14px">Unstressed final “y” (ready, happy) is written <span style="font-family:var(--ipa)">i</span>, as in Oxford. Stress marks: <span style="font-family:var(--ipa)">ˈ</span> main, <span style="font-family:var(--ipa)">ˌ</span> secondary.</div><div class="acts"><button class="btn" id="mClose">Close</button></div>`, m => { $('#mClose', m).onclick = () => UI.closeModal(); });
  },

  /* ---------- reset ---------- */
  resetDialog() {
    this.modal(`<h2>Reset the lesson?</h2><p>This returns to Section 1, restores all nine timers to their defaults (total 60:00) and clears section progress.</p>
      <p><label><input type="checkbox" id="rScores"> Also clear scores, checklists and notes</label></p>
      <div class="acts"><button class="btn coral" id="rYes">Reset</button><button class="btn ghost" id="rNo">Keep going</button></div>`, m => {
      $('#rNo', m).onclick = () => UI.closeModal();
      $('#rYes', m).onclick = () => {
        const keep = !$('#rScores', m).checked ? { assess: ST.assess, tally: ST.tally, exit: ST.exit, notes: ST.notes } : null;
        const wasStarted = ST.started;
        ST = freshState(); if (keep) Object.assign(ST, keep);
        ST.started = wasStarted; ST.paused = false;
        UI.closeModal(); UI.closeDrawers(); Aud.setPaused(false);
        FE.enter(0, 0); UI.tick(); Store.save(); UI.toast('Lesson reset. Timers restored to 60:00.');
      };
    });
  },

  /* ---------- results & export ---------- */
  scoreLabel() { return ST.assess.mode === 'class' ? 'Class activity score (teacher-entered shared answers)' : 'Individual score (this copy of the lesson, on this device only)'; },
  buildExport() {
    const a = ST.assess, p = this.projected();
    return {
      lesson: 'Fluent English – Be: Yes/No Questions (A1)',
      exportedAt: new Date().toISOString(),
      privacy: 'Created locally in this browser. No names, emails or recordings. Nothing is uploaded or emailed automatically.',
      timing: {
        plannedSeconds: LESSON.reduce((s, c) => s + c.min * 60, 0), projectedTeachingSeconds: Math.round(p.total),
        activeSeconds: Math.round(ST.clock.active), pausedSeconds: Math.round(ST.clock.paused),
        sections: LESSON.map((c, i) => ({ section: c.n, title: c.title, plannedSeconds: ST.timers[i].def, addedSeconds: ST.timers[i].ext, skippedSeconds: Math.round(ST.timers[i].skip), usedSeconds: Math.round(ST.timers[i].spent), visited: ST.timers[i].visited }))
      },
      completedActivities: { note: 'A step counts as visited when the teacher opened it; the app cannot tell whether learners finished speaking.', visitedSteps: Object.keys(ST.visited), sectionsFullyVisited: LESSON.filter(c => c.steps.every(s => ST.visited[s.id])).map(c => c.n) },
      assessment: {
        scoreType: this.scoreLabel(), mode: a.mode, outOf: 10,
        firstAttempt: a.first ? { score: a.first.score, items: a.first.items } : null,
        retry: a.retry ? { score: a.retry.score, outOf: a.retry.outOf, items: a.retry.items, note: 'Retry covers only the items missed on the first attempt. The first-attempt score is never overwritten.' } : null
      },
      speakingLabChecklist: { note: 'Anonymous counts entered by the teacher. The app does not hear or identify learners.', questionsAsked: ST.tally.asked, shortAnswersGiven: ST.tally.answered, originalQuestions: ST.tally.original, followUpAnswers: ST.tally.followup },
      independentExitChecklist: { note: 'Class-level teacher observations.', beAgreement: ST.exit.be || 'not set', questionWordOrder: ST.exit.order || 'not set', pronounPerspective: ST.exit.persp || 'not set', independentProduction: ST.exit.indep || 'not set' },
      teacherNotes: ST.notes || ''
    };
  },
  buildCSV() {
    const x = this.buildExport(), rows = [['section', 'item', 'value']];
    const add = (s, i, v) => rows.push([s, i, v]);
    add('lesson', 'title', x.lesson); add('lesson', 'exportedAt', x.exportedAt);
    add('timing', 'plannedSeconds', x.timing.plannedSeconds); add('timing', 'projectedTeachingSeconds', x.timing.projectedTeachingSeconds); add('timing', 'activeSeconds', x.timing.activeSeconds); add('timing', 'pausedSeconds', x.timing.pausedSeconds);
    x.timing.sections.forEach(s => { add('timing.section' + s.section, 'title', s.title); add('timing.section' + s.section, 'plannedSeconds', s.plannedSeconds); add('timing.section' + s.section, 'addedSeconds', s.addedSeconds); add('timing.section' + s.section, 'skippedSeconds', s.skippedSeconds); add('timing.section' + s.section, 'usedSeconds', s.usedSeconds); add('timing.section' + s.section, 'visited', s.visited); });
    add('completed', 'visitedSteps', x.completedActivities.visitedSteps.join(' ')); add('completed', 'sectionsFullyVisited', x.completedActivities.sectionsFullyVisited.join(' '));
    add('assessment', 'scoreType', x.assessment.scoreType); add('assessment', 'mode', x.assessment.mode);
    add('assessment', 'firstAttemptScore', x.assessment.firstAttempt ? x.assessment.firstAttempt.score + '/10' : 'not submitted');
    if (x.assessment.firstAttempt) x.assessment.firstAttempt.items.forEach(it => add('assessment.first', 'item' + it.n, `${it.answer || '-'} (${it.ok ? 'correct' : 'incorrect'}; key ${it.key})`));
    add('assessment', 'retryScore', x.assessment.retry ? x.assessment.retry.score + '/' + x.assessment.retry.outOf : 'not attempted');
    if (x.assessment.retry) x.assessment.retry.items.forEach(it => add('assessment.retry', 'item' + it.n, `${it.answer || '-'} (${it.ok ? 'correct' : 'incorrect'}; key ${it.key})`));
    Object.entries(x.speakingLabChecklist).forEach(([k, v]) => add('speakingLab', k, v));
    Object.entries(x.independentExitChecklist).forEach(([k, v]) => add('independentExit', k, v));
    add('notes', 'teacherNotes', x.teacherNotes);
    return rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  },
  download(name, text, mime) {
    const b = new Blob([text], { type: mime }), u = URL.createObjectURL(b), a = document.createElement('a');
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000);
  },
  results() {
    const a = ST.assess, x = this.buildExport();
    const secRows = LESSON.map((c, i) => `<tr><td>${c.n}</td><td>${esc(c.title)}</td><td>${c.steps.filter(s => ST.visited[s.id]).length}/${c.steps.length}</td><td>${fmt(ST.timers[i].spent)}</td></tr>`).join('');
    const first = a.first ? `${a.first.score} / 10` : 'not submitted yet';
    const retry = a.retry ? `${a.retry.score} / ${a.retry.outOf} of the missed items` : 'not attempted';
    this.modal(`<h2>Results (local)</h2>
      <div class="box">Everything here is stored only in this browser. Nothing is uploaded or emailed. Download is always your choice.</div>
      <h3 style="margin:8px 0 4px">Activities visited</h3>
      <table><thead><tr><th>#</th><th>Section</th><th>Steps visited</th><th>Time used</th></tr></thead><tbody>${secRows}</tbody></table>
      <h3 style="margin:14px 0 4px">Ten-question check</h3>
      <div class="box"><b>${esc(this.scoreLabel())}</b><br>First attempt: <b>${first}</b><br>Retry of missed items: <b>${retry}</b><br><span style="opacity:.85">First-attempt and retry scores are kept separately. A shared teacher-entered score describes the class activity, not any one learner's mastery.</span></div>
      <h3 style="margin:14px 0 4px">Speaking lab (anonymous, teacher-entered)</h3>
      <div class="box">Questions asked: ${ST.tally.asked} · Short answers: ${ST.tally.answered} · Original questions: ${ST.tally.original} · Follow-up answers: ${ST.tally.followup}</div>
      <h3 style="margin:14px 0 4px">Independent exit (class-level)</h3>
      <div class="box">Be agreement: ${esc(ST.exit.be || '—')} · Word order: ${esc(ST.exit.order || '—')} · Pronoun perspective: ${esc(ST.exit.persp || '—')} · Independent production: ${esc(ST.exit.indep || '—')}</div>
      <h3 style="margin:14px 0 4px"><label for="notesTa">Anonymous teacher notes (no names, please)</label></h3>
      <textarea id="notesTa" placeholder="e.g. Class needed more practice with Am I…? and No, you aren't.">${esc(ST.notes)}</textarea>
      <div class="acts"><button class="btn" id="dlJson">Download JSON</button><button class="btn" id="dlCsv">Download CSV</button><button class="btn ghost" id="mClose">Close</button></div>`, m => {
      $('#notesTa', m).oninput = e => { ST.notes = e.target.value; saveSoon(); };
      $('#dlJson', m).onclick = () => UI.download('fluent-english-be-yes-no-results.json', JSON.stringify(UI.buildExport(), null, 2), 'application/json');
      $('#dlCsv', m).onclick = () => UI.download('fluent-english-be-yes-no-results.csv', UI.buildCSV(), 'text/csv');
      $('#mClose', m).onclick = () => UI.closeModal();
    });
  },

  /* ---------- wire everything ---------- */
  wire() {
    $('#ccSeg').onclick = e => { const b = e.target.closest('button'); if (b) UI.setCC(+b.dataset.cc); };
    $('#esBtn').onclick = () => UI.toggleEs();
    $('#esMin').onclick = () => $('#esCard').classList.toggle('min');
    $('#esSpeak').onclick = () => { Aud.init(); const S = Run.S; const txt = (S && S.es) || ''; if (!txt) return; const e = ++Run.epoch; Sp.cancel(); if (S) S.e = e; makeCtx({}, e).say(txt, { lang: 'es' }).catch(() => { }); };
    $('#resBtn').onclick = () => UI.results();
    $('#setBtn').onclick = () => UI.drawer('setDrawer', !$('#setDrawer').classList.contains('open'));
    $('#fsBtn').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => UI.toast('Fullscreen was blocked by the browser.')); };
    $('#timerBtn').onclick = () => UI.timerPanel();
    $('#bPrev').onclick = () => FE.prev();
    $('#bNext').onclick = () => FE.next();
    $('#bPlay').onclick = () => FE.togglePlay();
    $('#bReplay').onclick = () => { Aud.init(); FE.replay(); };
    $('#bReveal').onclick = () => FE.reveal();
    $('#bExt30').onclick = () => UI.extend(30);
    $('#bExt60').onclick = () => UI.extend(60);
    $('#bSkip').onclick = () => UI.skipTimer();
    $('#bChap').onclick = () => UI.drawer('chapDrawer', !$('#chapDrawer').classList.contains('open'));
    $('#bSupport').onclick = () => UI.toggleSupport();
    $('#bReset').onclick = () => UI.resetDialog();
    $('#bHide').onclick = () => UI.toggleChrome();
    $('#showChrome').onclick = () => UI.toggleChrome();
    $$('[data-close]').forEach(b => b.onclick = () => UI.drawer(b.dataset.close, false));
    $('#modalBg').onclick = e => { if (e.target.id === 'modalBg') UI.closeModal(); };
    document.addEventListener('keydown', e => {
      if (e.target.matches('input,textarea,select')) return;
      if (e.key === 'Escape') { UI.closeModal(); UI.closeDrawers(); return; }
      if ($('#modalBg').classList.contains('open') || $('#start').style.display !== 'none') return;
      if (e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
      const k = e.key.toLowerCase();
      if (Run.S && Run.S.captureKeys && /^[a-d]$/.test(k)) { Run.S.onKey(e); return; }
      if (e.key === ' ') { e.preventDefault(); FE.togglePlay(); }
      else if (e.key === 'ArrowRight') FE.next(); else if (e.key === 'ArrowLeft') FE.prev();
      else if (k === 'r') FE.reveal(); else if (k === 'e') FE.replay(); else if (k === 's') UI.toggleEs();
      else if (k === 'c') UI.setCC((CFG.cc + 1) % 3); else if (k === 'm') UI.drawer('chapDrawer', !$('#chapDrawer').classList.contains('open'));
      else if (k === 'f') $('#fsBtn').click(); else if (k === 'h') UI.toggleChrome();
      else if (Run.S && Run.S.onKey) Run.S.onKey(e);
    });
    window.addEventListener('resize', () => UI.fit());
    new ResizeObserver(() => UI.fit()).observe($('#stageWrap'));
    setInterval(() => UI.tick(), 250);
    window.addEventListener('beforeunload', () => Store.save());
    document.addEventListener('visibilitychange', () => { if (document.hidden) Store.save(); });
  }
};

/* ---------------- boot ---------------- */
function boot() {
  const saved = Store.load();
  if (saved && saved.cfg) Object.assign(CFG, saved.cfg);
  ST = freshState();
  let canResume = false;
  if (saved && saved.st && saved.st.v === 1 && saved.st.started && Array.isArray(saved.st.timers) && saved.st.timers.length === LESSON.length) {
    canResume = true; window.__saved = saved.st;
  }
  FE.buildFlat(); Sp.init(); UI.wire(); UI.applyCfg(); UI.fit();
  document.getElementById('app').insertAdjacentHTML('beforebegin', A.defs);
  // preview the first step behind the start card (no audio, nothing runs)
  FE.setBg('classroom');
  const rb = $('#resumeBox');
  if (canResume) {
    const s = window.__saved, c = LESSON[s.ch] || LESSON[0];
    rb.style.display = 'block'; rb.style.marginBottom = '12px'; rb.style.fontSize = '15px';
    rb.innerHTML = `<b>Saved progress found.</b> Section ${c.n} “${esc(c.title)}”, step ${s.st + 1}. Your timers, scores and notes are kept if you resume.`;
    $('#startBtn').textContent = '▶ Resume where we left off';
    $('#startFresh').style.display = 'inline-flex';
    $('#startBtn').onclick = () => { ST = Object.assign(freshState(), s); ST.paused = false; FE.start(true); };
    $('#startFresh').onclick = () => { Store.clear(); ST = freshState(); $('#startBtn').textContent = '▶ Start Lesson'; FE.start(false); };
  } else {
    $('#startBtn').onclick = () => FE.start(false);
  }
  $('#startBtn').focus();
  FE.updateDock(); UI.tick();
}
