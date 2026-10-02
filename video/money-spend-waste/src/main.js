import { C, f, seg, smooth, pop } from './util.js';
import { SCENES, CLIPS, CAPTIONS, SENTENCES, HOOK_PHRASES, DURATION, applyTiming } from './timeline.js';
import { sceneHook, sceneSpend, sceneWaste, sceneSpeak, sceneCta } from './scenes.js';
import { sentenceCard, captionPill, ctaButton, measure } from './ui.js';

const params = new URLSearchParams(location.search);
const EXPORT = params.has('export');
const LOGO = 'assets/fluent_english_logo.png';
const MODE_LABELS = ['CC/IPA: Off', 'CC/IPA: Captions', 'CC/IPA: Captions + IPA'];
const MODE_KEY = 'fluentEnglishCcMode';

let mode = 2;
try { const v = parseInt(localStorage.getItem(MODE_KEY), 10); if ([0, 1, 2].includes(v)) mode = v; } catch (e) { /* storage unavailable */ }
if (params.has('mode')) mode = Math.max(0, Math.min(2, parseInt(params.get('mode'), 10) || 0));

const stage = document.getElementById('stage');

function hookCards(t, mode) {
  let s = '';
  HOOK_PHRASES.forEach((p, i) => {
    const k = pop(t, p.at, .55);
    if (k <= 0) return;
    const showIpa = mode >= 2;
    const h = showIpa ? 146 : 122, y = 345 + i * 176;
    const wob = Math.sin(t * 3 + i * 2) * 0.6;
    s += `<g data-ui="hookcard" transform="translate(540 ${f(y)}) rotate(${f(wob + (i ? 0.8 : -0.8))}) scale(${f(k)})">
      <rect x="-380" y="${-h / 2 + 10}" width="760" height="${h}" rx="42" fill="#000" opacity=".28"/>
      <rect x="-380" y="${-h / 2}" width="760" height="${h}" rx="42" fill="${p.color}" stroke="#fff" stroke-width="7"/>
      <text x="0" y="${showIpa ? -10 : 28}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="82" fill="#fff" letter-spacing="2">${p.w}</text>
      ${showIpa ? `<text x="0" y="46" text-anchor="middle" font-family="Noto Sans" font-weight="500" font-size="38" fill="#fff" opacity=".95">/${p.ipa}/</text>` : ''}</g>`;
  });
  const q = pop(t, 1.9, .5);
  if (q > 0) s += `<g transform="translate(930 ${f(345 + 84)}) scale(${f(q)})"><circle r="46" fill="${C.gold}" stroke="#fff" stroke-width="6"/><text y="24" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="68" fill="${C.navy}">?</text></g>`;
  return s;
}

export function frameSVG(t, m = mode) {
  let out = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1920" viewBox="0 0 1080 1920" font-family="Nunito"><defs><clipPath id="stageclip"><rect width="1080" height="1920"/></clipPath></defs><g clip-path="url(#stageclip)">`;
  const fns = { hook: sceneHook, spend: sceneSpend, waste: sceneWaste, speak: sceneSpeak, cta: (tt, mm) => sceneCta(tt, mm, LOGO) };
  SCENES.forEach((sc, i) => {
    const fadeIn = i === 0 ? 1 : smooth(seg(t, sc.t0 - 0.01, sc.t0 + 0.28));
    const fadeOut = i === SCENES.length - 1 ? 1 : 1 - smooth(seg(t, sc.t1 - 0.01, sc.t1 + 0.22));
    const o = Math.min(fadeIn, fadeOut);
    if (t < sc.t0 - 0.01 || t > sc.t1 + 0.25 || o <= 0.001) return;
    const zoom = 1 + (1 - fadeIn) * 0.03;
    out += `<g opacity="${f(o)}" transform="translate(540 960) scale(${f(zoom)}) translate(-540 -960)">${fns[sc.id](t, m)}</g>`;
  });
  // ---- overlays: always-on teaching graphics ----
  if (t < SCENES[0].t1 + 0.1) out += `<g opacity="${f(1 - smooth(seg(t, 3.45, 3.7)))}">${hookCards(t, m)}</g>`;
  if (t >= SENTENCES.speak.shown[0] - 0.1 && t < SCENES[3].t1 + .2) out += sentenceCard(SENTENCES.speak, t, Math.max(m, 1), { cy: 585, engPx: 58, maxW: 800 });
  out += sentenceCard(SENTENCES.spend, t, m, { cy: 400 });
  out += sentenceCard(SENTENCES.waste, t, m, { cy: 400 });
  const cap = CAPTIONS.find(c => t >= c.t0 && t <= c.t1);
  if (cap) out += captionPill(cap.lines, t, cap, m, { cy: t < 3.7 ? 1500 : (cap.lines.length > 1 ? 1470 : 1450) });
  if (t >= 23.9) out += ctaButton(t, 23.9);
  out += '</g></svg>';
  return out;
}

// ---------- cover frame: "SPEND OR WASTE?" ----------
export function coverSVG() {
  const t = 1.2;
  const tx = (txt, y, size, fill, extra = '') => `<text x="540" y="${y}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="${size}" fill="${fill}" stroke="#fff" stroke-width="14" paint-order="stroke" stroke-linejoin="round" ${extra}>${txt}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><g><rect width="1080" height="200" fill="#0B2347"/><g transform="translate(0 90)">${sceneHook(t, 0)}</g>
    <g transform="rotate(-3 540 400)"><text x="540" y="372" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="200" fill="#000" opacity=".25" stroke="#000" stroke-width="14" transform="translate(6 10)">SPEND</text>${tx('SPEND', 342, 200, C.emerald)}
    ${tx('OR', 440, 92, C.gold)}${tx('WASTE?', 600, 200, C.coral)}</g>
    <g transform="translate(540 1600)"><rect x="-215" y="-117" width="430" height="234" rx="32" fill="#fff"/><image href="${LOGO}" x="-200" y="-109" width="400" height="218" preserveAspectRatio="xMidYMid meet"/></g></g></svg>`;
}

// ---------- audio (preview only; real clips are optional and currently pending) ----------
const audio = { clips: {}, available: 0 };
async function loadAudio() {
  let manifest = null;
  try { manifest = await (await fetch('audio/manifest.json', { cache: 'no-store' })).json(); } catch (e) { /* none */ }
  const map = manifest?.clips ?? {};
  if (manifest?.timing) applyTiming(manifest.timing);   // measured durations from real audio (scripts/measure_audio.mjs)
  for (const c of CLIPS) {
    const file = map[c.id];
    if (!file) continue;
    try {
      const r = await fetch(file, { method: 'HEAD' });
      if (!r.ok) continue;
      const a = new Audio(file); a.preload = 'auto';
      audio.clips[c.id] = a; audio.available++;
    } catch (e) { /* missing */ }
  }
  const badge = document.getElementById('audioBadge');
  if (badge) {
    badge.textContent = audio.available === CLIPS.length ? 'Voiceover: loaded' : `Voiceover PENDING (${audio.available}/${CLIPS.length} clips)`;
    badge.className = audio.available === CLIPS.length ? 'ok' : 'pending';
  }
}
function stopAll() { for (const a of Object.values(audio.clips)) { try { a.pause(); a.currentTime = 0; } catch (e) {} } started.clear(); }
const started = new Set();
function syncAudio(t, playing) {
  if (!playing || muted) return;
  for (const c of CLIPS) {
    const a = audio.clips[c.id]; if (!a) continue;
    if (!started.has(c.id) && t >= c.start && t < c.start + c.dur + 0.4) {
      started.add(c.id);
      try { a.currentTime = Math.max(0, t - c.start); a.play().catch(() => {}); } catch (e) {}
    }
  }
}

// ---------- preview player ----------
let T = 0, playing = false, last = 0, muted = false;
function draw(t) { stage.innerHTML = frameSVG(t, mode); const r = document.getElementById('time'); if (r) { r.textContent = t.toFixed(1) + ' / ' + DURATION.toFixed(1) + ' s'; document.getElementById('scrub').value = t; } }
function tick(now) {
  if (playing) {
    T += (now - last) / 1000;
    if (T >= DURATION) { T = DURATION; setPlaying(false); }
    syncAudio(T, true);
  }
  last = now; draw(T);
  requestAnimationFrame(tick);
}
function setPlaying(p) {
  playing = p;
  document.getElementById('play').textContent = p ? 'Pause' : (T >= DURATION ? 'Replay' : 'Play');
  if (!p) for (const a of Object.values(audio.clips)) { try { a.pause(); } catch (e) {} }
  else if (T >= DURATION) { T = 0; stopAll(); }
}
function setMode(m) {
  mode = m; try { localStorage.setItem(MODE_KEY, String(m)); } catch (e) {}
  const b = document.getElementById('cc'); if (b) b.textContent = MODE_LABELS[m];
}

async function init() {
  await Promise.all([
    document.fonts.load('900 60px Nunito'), document.fonts.load('800 60px Nunito'), document.fonts.load('500 40px "Noto Sans"'),
    document.fonts.load('700 40px "Noto Sans"'),
  ]);
  await document.fonts.ready;
  try { const mf = await (await fetch('audio/manifest.json', { cache: 'no-store' })).json(); if (mf?.timing) applyTiming(mf.timing); } catch (e) { /* no manifest */ }
  // preload logo so exported frames never miss it
  await new Promise((res) => { const i = new Image(); i.onload = res; i.onerror = res; i.src = LOGO; });
  window.__frame = (t, m = mode) => { stage.innerHTML = frameSVG(t, m); return new Promise(r => requestAnimationFrame(() => r(true))); };
  window.__duration = DURATION;
  window.__ready = true;
  window.__cover = () => { stage.innerHTML = coverSVG(); return new Promise(r => requestAnimationFrame(() => r(true))); };
  if (params.has('cover')) { document.body.classList.add('export'); stage.innerHTML = coverSVG(); return; }
  if (EXPORT) { document.body.classList.add('export'); draw(0); return; }
  await loadAudio();
  setMode(mode);
  const scrub = document.getElementById('scrub'); scrub.max = DURATION; scrub.step = 0.02;
  scrub.oninput = () => { stopAll(); T = parseFloat(scrub.value); if (playing) { } draw(T); };
  document.getElementById('play').onclick = () => { if (!playing) { if (T >= DURATION) { T = 0; } stopAll(); } setPlaying(!playing); if (playing) { for (const c of CLIPS) if (T > c.start + c.dur) started.add(c.id); } };
  document.getElementById('restart').onclick = () => { stopAll(); T = 0; setPlaying(true); };
  document.getElementById('cc').onclick = () => setMode((mode + 1) % 3);
  document.getElementById('mute').onclick = (e) => { muted = !muted; e.target.textContent = muted ? 'Unmute' : 'Mute'; if (muted) stopAll(); };
  document.getElementById('safe').onclick = () => document.body.classList.toggle('showsafe');
  addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); document.getElementById('play').click(); } if (e.key === 'c') document.getElementById('cc').click(); });
  const fit = () => { const s = Math.min((innerHeight - 96) / 1920, innerWidth / 1080); document.getElementById('wrap').style.transform = `scale(${s})`; document.getElementById('holder').style.width = 1080 * s + 'px'; document.getElementById('holder').style.height = 1920 * s + 'px'; };
  addEventListener('resize', fit); fit();
  requestAnimationFrame((n) => { last = n; tick(n); });
}
init();
