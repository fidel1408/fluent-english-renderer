import { W, H, FPS, DURATION, C, clamp, lerp, smooth, easeOut, seg, track, rng, rrect } from './util.js';
import { drawCharacter, defaultPose } from './character.js';
import * as S from './scenes.js';
import { makeBuses, scheduleAll, loadVoices, wavFromBuffer } from './audio.js';

const Q = new URLSearchParams(location.search);
const RENDER = Q.has('render');
let CC = +(Q.get('cc') ?? 2);              // 0 off, 1 captions, 2 captions + IPA
const canvas = document.getElementById('stage'), ctx = canvas.getContext('2d');
let cues, logo; const lineById = {};

const PHRASE1 = { words: ['Could', 'you', 'say', 'that', 'again,', 'please?'], ipa: ['kʊd', 'ju', 'seɪ', 'ðæt', 'əˈɡɛn', 'pliz'] };
const PHRASE2 = { words: ['A', 'little', 'more', 'slowly,', 'please.'], ipa: ['ə', 'ˈlɪɾəl', 'mɔr', 'ˈsloʊli', 'pliz'] };
const SPEECH_TEXT = { es_intro: ['¿No entendiste lo que te dijeron? Prueba esta frase.', 'es'], en_repeat: ['Could you say that again, please?', 'en'], es_repeat: ['¿Podrías repetirlo, por favor?', 'es'],
  es_slowly: ['Y si necesitas que hablen más despacio…', 'es'], en_slowly: ['A little more slowly, please.', 'en'], es_yourturn: ['Ahora dilo tú.', 'es'], es_cta: ['Practica inglés con Fluent English. Escríbenos inglés por mensaje.', 'es'] };

// ---------- timeline helpers ----------
const wordIndex = (id, t) => { const l = lineById[id]; const ws = l.chunks.flatMap(c => c.words); if (t < l.start) return null; for (let i = 0; i < ws.length; i++) if (t < ws[i].t1) return i; return ws.length; };
const mouthAt = (t) => { for (const id of ['en_repeat', 'en_slowly']) { const l = lineById[id]; if (t >= l.start && t <= l.end) { const f = (t - l.start) * FPS, i = Math.floor(f), a = l.env[i] ?? 0, b = l.env[i + 1] ?? 0; return clamp(Math.pow(lerp(a, b, f - i), 0.7) * 1.25); } } return 0; };
const beat = (t) => { let v = 0; for (const id of ['en_repeat', 'en_slowly']) for (const c of lineById[id].chunks) for (const w of c.words) if (t >= w.t0) v += Math.exp(-(t - w.t0) / 0.16) * 0.55; return clamp(v, 0, 1); };
const blinkAt = (t) => { for (const b of [1.3, 3.1, 5.6, 8.4, 10.2, 12.6, 15.5, 17.2, 19.8, 22.0, 25, 27.5]) { const d = t - b; if (d >= 0 && d < 0.16) return Math.sin(d / 0.16 * Math.PI); } return 0; };

// arm keyframes: x is offset from the body centre (px), y/z in scene units
const ARM_R = [[0, { x: 178, y: 1238, z: 150, ang: -66, curl: .3, spread: .12, thumbOut: 0 }], [2.0, { x: 178, y: 1238, z: 150, ang: -66, curl: .3, spread: .12, thumbOut: 0 }], [2.5, { x: 135, y: 1170, z: 170, ang: -30, curl: .35, spread: .1, thumbOut: 0 }],
  [3.3, { x: 178, y: 1238, z: 150, ang: -66, curl: .3, spread: .12, thumbOut: 0 }],
  [4.5, { x: 205, y: 1085, z: 120, ang: -9, curl: 0, spread: .55, thumbOut: .45 }], [6.5, { x: 210, y: 1090, z: 130, ang: -12, curl: 0, spread: .5, thumbOut: .4 }],
  [7.2, { x: 160, y: 1115, z: 215, ang: -22, curl: .02, spread: .65, thumbOut: .5 }], [8.9, { x: 165, y: 1120, z: 215, ang: -22, curl: .02, spread: .65, thumbOut: .5 }],
  [9.5, { x: 180, y: 1236, z: 150, ang: -62, curl: .28, spread: .15, thumbOut: 0 }], [11.3, { x: 180, y: 1236, z: 150, ang: -62, curl: .28, spread: .15, thumbOut: 0 }],
  [12.0, { x: 190, y: 1110, z: 150, ang: -12, curl: .04, spread: .5, thumbOut: .4 }], [13.7, { x: 190, y: 1110, z: 150, ang: -12, curl: .04, spread: .5, thumbOut: .4 }],
  [14.3, { x: 190, y: 1090, z: 235, ang: -80, curl: .05, spread: .3, thumbOut: .1 }], [16.2, { x: 190, y: 1150, z: 235, ang: -80, curl: .05, spread: .3, thumbOut: .1 }],
  [17.2, { x: 180, y: 1236, z: 150, ang: -62, curl: .28, spread: .15, thumbOut: 0 }], [18.2, { x: 180, y: 1236, z: 150, ang: -62, curl: .28, spread: .15, thumbOut: 0 }],
  [18.7, { x: 150, y: 1105, z: 330, ang: -5, curl: 0, spread: .6, thumbOut: .5 }], [20.0, { x: 160, y: 1125, z: 280, ang: -8, curl: .02, spread: .5, thumbOut: .4 }], [23.6, { x: 160, y: 1125, z: 280, ang: -8, curl: .02, spread: .5, thumbOut: .4 }],
  [24.0, { x: 180, y: 1236, z: 150, ang: -62, curl: .28, spread: .15, thumbOut: 0 }]];
const ARM_L = [[0, { x: -178, y: 1238, z: 150, ang: 66, curl: .3, spread: .12, thumbOut: 0 }], [3.3, { x: -178, y: 1238, z: 150, ang: 66, curl: .3, spread: .12, thumbOut: 0 }],
  [4.7, { x: -180, y: 1236, z: 150, ang: 62, curl: .28, spread: .15, thumbOut: 0 }], [7.2, { x: -165, y: 1115, z: 215, ang: 22, curl: .02, spread: .65, thumbOut: .5 }], [8.9, { x: -165, y: 1120, z: 215, ang: 22, curl: .02, spread: .65, thumbOut: .5 }],
  [9.6, { x: -180, y: 1236, z: 150, ang: 62, curl: .28, spread: .15, thumbOut: 0 }], [13.8, { x: -180, y: 1236, z: 150, ang: 62, curl: .28, spread: .15, thumbOut: 0 }],
  [14.3, { x: -190, y: 1090, z: 235, ang: 80, curl: .05, spread: .3, thumbOut: .1 }], [16.2, { x: -190, y: 1150, z: 235, ang: 80, curl: .05, spread: .3, thumbOut: .1 }],
  [17.2, { x: -180, y: 1236, z: 150, ang: 62, curl: .28, spread: .15, thumbOut: 0 }], [24, { x: -180, y: 1236, z: 150, ang: 62, curl: .28, spread: .15, thumbOut: 0 }]];

export function computePose(t) {
  const p = defaultPose(); const b = beat(t);
  p.breath = Math.sin(t * 1.75) * 3; p.sway = Math.sin(t * 0.8) * 3;
  p.blink = blinkAt(t);
  // expression: confusion/hesitation -> relief -> calm confidence
  const worry = track([[0, 0], [0.4, .65], [2.2, .65], [2.7, 0], [30, 0]], t);
  const raise = track([[0, 0], [0.4, .25], [2.2, .25], [2.7, .7], [3.4, .4], [4.2, .1], [11.2, .1], [11.6, .45], [13.8, .3], [14.3, .05], [18.2, .3], [19.5, .1], [30, .1]], t);
  p.brow = { raise, worry };
  p.smile = track([[0, .05], [2.0, 0], [2.9, .3], [3.8, .35], [4.5, .95], [11.0, .9], [11.6, .5], [14.2, .85], [18, .95], [30, 1]], t);
  p.cheeks = track([[0, .1], [4, .2], [5, .75], [11, .6], [14, .8], [30, .9]], t);
  p.look = { x: track([[0, -.2], [0.35, -1], [2.0, -1], [2.6, 0], [30, 0]], t), y: track([[0, 0], [2.6, 0], [3.1, -.2], [3.9, 0], [11.4, 0], [12.2, -.35], [13.5, -.35], [14.2, 0], [30, 0]], t) };
  const nod = Math.exp(-Math.pow((t - 2.2) / 0.16, 2)) * 17 + (t > 2.35 && t < 2.8 ? 0 : 0);
  const nod2 = Math.exp(-Math.pow((t - 19.55) / 0.22, 2)) * 10 + Math.exp(-Math.pow((t - 23.25) / 0.25, 2)) * 10;
  p.head = { dx: track([[0, -4], [0.5, -14], [2.1, -14], [2.8, 0], [30, 0]], t), dy: nod + nod2 + b * 5 + track([[3.2, 0], [3.7, 5], [4.5, -2], [30, -2]], t) * 1, tilt: track([[0, 0], [0.4, -3], [2.1, -3], [2.8, 0], [5, 2], [8, -2], [11.2, 0], [12, 4], [13.7, 4], [14.4, -1], [18, 2], [30, 0]], t), pitch: 0 };
  p.shoulderLift = track([[0, -6], [2.2, -8], [3.0, -8], [3.8, 8], [4.6, 0], [30, 0]], t) + (t < 3.4 ? 0 : 0);
  p.mouth = mouthAt(t);
  const r = track(ARM_R, t), l = track(ARM_L, t);
  p.R = { ...p.R, ...r, x: r.x, y: r.y - b * 14, vis: 1, scale: 1.35 }; p.L = { ...p.L, ...l, vis: 1, scale: 1.35 };
  // hesitation fidget in scene 1: hands shift slightly
  if (t < 3.4) { p.L.y += Math.sin(t * 3) * 2; p.R.y += Math.cos(t * 2.6) * 2; }
  return p;
}

// ---------- frame ----------
function captionLayer(t) {
  const fade = (a, b, f = 0.18) => clamp(Math.min((t - a) / f, (b - t) / f));
  const out = [];
  const es = (id) => { const l = lineById[id]; for (const c of l.chunks) { const a = fade(c.t0 - 0.12, c.t1 + 0.3); if (a > 0) out.push({ k: 'es', text: c.words.map(w => w.w).join(' '), a }); } };
  ['es_intro', 'es_repeat', 'es_slowly', 'es_yourturn'].forEach(es);
  // English teaching phrase 1 (4.25-7.0, 9.2-11.0, and practice 19.7-24.0)
  const p1 = (a) => out.push({ k: 'ph', P: PHRASE1, a, hi: null });
  const w1 = wordIndex('en_repeat', t);
  const a1 = fade(4.25, 6.95) , a1b = fade(9.2, 10.95), a1c = fade(19.7, 23.85, 0.25);
  if (a1 > 0) out.push({ k: 'ph', P: PHRASE1, a: a1, hi: w1 != null && w1 < PHRASE1.words.length ? w1 : null });
  if (a1b > 0) out.push({ k: 'ph', P: PHRASE1, a: a1b, hi: null });
  if (a1c > 0) { // silent practice: guided highlight at the narrated pace, then a settled state
    const l = lineById.en_repeat, tt = t - 20.2 + l.start, hi = t < 20.2 ? null : (t > 22.4 ? null : wordIndex('en_repeat', tt));
    out.push({ k: 'ph', P: PHRASE1, a: a1c, hi: hi != null && hi < 6 ? hi : null });
  }
  const w2 = wordIndex('en_slowly', t), a2 = fade(14.2, 17.95);
  if (a2 > 0) out.push({ k: 'ph', P: PHRASE2, a: a2, hi: w2 != null && w2 < PHRASE2.words.length ? w2 : null });
  return out;
}

export function drawFrame(t, ccMode = CC) {
  t = clamp(t, 0, DURATION - 1 / FPS);
  ctx.save(); ctx.clearRect(0, 0, W, H);
  if (t >= 24.0) { S.drawFinal(ctx, t, logo, null); finalCaptions(t, ccMode); S.sceneWipe(ctx, t); ctx.restore(); return; }
  const mood = track([[0, 0], [3.9, .05], [4.6, 1], [30, 1]], t);
  S.drawBackground(ctx, t, mood);
  S.sparkles(ctx, t, 4.2, 11, 5); S.sparkles(ctx, t, 14.5, 18, 9); S.sparkles(ctx, t, 23.1, 24, 12);
  S.murmurBubble(ctx, t);
  const pose = computePose(t); drawCharacter(ctx, pose);
  S.drawTable(ctx, t, mood);
  S.pauseRing(ctx, t, 540, 690);
  S.thinkDots(ctx, t, 790, 520);
  S.slowWave(ctx, t); S.countdown(ctx, t);
  S.headline(ctx, t);
  const ta = (a, b) => smooth(seg(t, a + 0.25, a + 0.6)) * (1 - smooth(seg(t, b - 0.4, b - 0.05)));
  S.titlePill(ctx, 'PIDE QUE REPITAN', ta(4, 11)); S.titlePill(ctx, 'PIDE MÁS DESPACIO', ta(11, 18), 262, C.tealD); S.titlePill(ctx, 'TU TURNO', ta(18, 24), 262, C.coralD);
  if (ccMode > 0) for (const c of captionLayer(t)) { if (c.k === 'es') S.captionES(ctx, c.text, c.a, ccMode); else S.captionPhrase(ctx, c.P.words, c.P.ipa, c.hi, c.a, ccMode); }
  S.sceneWipe(ctx, t); ctx.restore();
}
function finalCaptions(t, ccMode) {
  if (ccMode === 0) return; const l = lineById.es_cta;
  for (const c of l.chunks) { const a = clamp(Math.min((t - (c.t0 - 0.12)) / 0.18, (c.t1 + 0.35 - t) / 0.18)); if (a > 0) S.captionES(ctx, c.words.map(w => w.w).join(' '), a, ccMode, 1330, 60); }
  // keep the last chunk visible to the end
  const last = l.chunks[l.chunks.length - 1]; if (t > last.t1 + 0.2) S.captionES(ctx, last.words.map(w => w.w).join(' '), clamp((t - last.t1 - 0.2) / 0.1), ccMode, 1330, 60);
}

// ---------- cover ----------
export function drawCover() {
  // dedicated cover composition (1080x1920): headline top, friendly character, brand plate; key content stays inside the central 1080x1350 crop
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FBF5E6'); g.addColorStop(1, '#EADFC6'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(31,163,160,.14)'; ctx.beginPath(); ctx.arc(930, 300, 330, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(242,107,91,.13)'; ctx.beginPath(); ctx.arc(120, 1180, 300, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(242,184,75,.16)'; ctx.beginPath(); ctx.arc(900, 1300, 220, 0, 7); ctx.fill();
  const p = computePose(5.1); p.mouth = 0.28; p.smile = 0.95; p.brow = { raise: .25, worry: 0 }; p.blink = 0; p.look = { x: 0, y: 0 };
  p.R = { ...p.R, x: 255, y: 1085, z: 160, ang: -10, curl: 0, spread: .55, thumbOut: .45, scale: 1.35, vis: 1 };
  ctx.save(); ctx.translate(0, 330); drawCharacter(ctx, p); ctx.restore();
  ctx.fillStyle = '#145A63'; ctx.fillRect(0, 1602, W, 400); ctx.fillStyle = C.tealL; ctx.fillRect(0, 1602, W, 8);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const line = (txt, y, size, fill) => { ctx.font = S.FONT(900, size); ctx.lineWidth = 26; ctx.strokeStyle = C.ivory; ctx.strokeText(txt, W / 2, y); ctx.fillStyle = fill; ctx.fillText(txt, W / 2, y); };
  line('¿NO', 300, 210, C.navy); line('ENTENDISTE?', 485, 132, C.navy);
  ctx.strokeStyle = C.coral; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(150, 572); ctx.quadraticCurveTo(540, 598, 930, 562); ctx.stroke();
  ctx.fillStyle = C.navy; rrect(ctx, 150, 650, 780, 112, 56); ctx.fill(); ctx.fillStyle = C.ivory; ctx.font = S.FONT(900, 58); ctx.fillText('No finjas que sí.', W / 2, 708);
  ctx.fillStyle = C.ivory; rrect(ctx, 270, 1650, 540, 230, 36); ctx.fill(); const lw = 500, lh = lw * logo.height / logo.width; ctx.drawImage(logo, W / 2 - lw / 2, 1765 - lh / 2, lw, lh);
}

// ---------- boot ----------
async function boot() {
  cues = await (await fetch('assets/cues.json')).json(); cues.lines.forEach(l => lineById[l.id] = l);
  logo = new Image(); logo.src = 'assets/logo_fluent_english.png'; await logo.decode();
  const faces = [['Nunito', 'assets/fonts/nunito-latin-900-normal.woff2', 900], ['Nunito', 'assets/fonts/nunito-latin-ext-900-normal.woff2', 900], ['DejaVu Sans', 'assets/fonts/DejaVuSans.ttf', 400]];
  for (const [fam, url, w] of faces) { const f = new FontFace(fam, `url(${url})`, { weight: String(w) }); await f.load(); document.fonts.add(f); }
  await document.fonts.load('900 60px Nunito'); await document.fonts.load("38px 'DejaVu Sans'");
  if (Q.has('cover')) { drawCover(); window.__ready = true; return; }
  const tq = Q.get('t'); drawFrame(tq ? +tq : 0);
  window.__ready = true;
  if (!RENDER) initUI();
}
window.drawAt = (t, cc) => drawFrame(t, cc ?? CC);
window.renderAudioWav = async (stem = 'mix') => { // offline mix of all layers -> base64 WAV
  const oc = new OfflineAudioContext(2, 44100 * DURATION, 44100); const bufs = await loadVoices(oc, cues); const B = makeBuses(oc); if (stem !== 'mix') for (const k of ['voice', 'music', 'fx', 'amb']) if (k !== stem) B[k].gain.value = 0;
  scheduleAll(oc, B, cues, bufs, 0); const out = await oc.startRendering(); const ab = wavFromBuffer(out); let s = ''; const u = new Uint8Array(ab);
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s);
};

// ---------- preview UI ----------
function initUI() {
  document.body.classList.add('ui'); const $ = (id) => document.getElementById(id);
  let actx = null, B = null, t0 = 0, playing = false, raf = 0, bufs = null, speechTimers = [];
  const btnPlay = $('play'), btnCC = $('cc'), clock = $('clock'), vsel = $('vsrc'), vinfo = $('vinfo');
  const ccNames = ['CC: Off', 'CC: Captions', 'CC: Captions + IPA']; const setCC = () => { btnCC.textContent = ccNames[CC]; if (!playing) drawFrame(pausedT); };
  let pausedT = 0; setCC(); btnCC.onclick = () => { CC = (CC + 1) % 3; setCC(); };
  const pickVoices = () => { const vs = speechSynthesis.getVoices(); const pick = (tests) => { for (const f of tests) { const v = vs.find(f); if (v) return v; } return null; };
    return { es: pick([v => /es[-_]MX/i.test(v.lang), v => /es[-_]419/i.test(v.lang), v => /es[-_]US/i.test(v.lang), v => /^es/i.test(v.lang)]), en: pick([v => /en[-_]US/i.test(v.lang)]) }; };
  const showVoices = () => { const v = pickVoices(); vinfo.textContent = vsel.value === 'browser' ? `Voz ES: ${v.es ? v.es.name + ' (' + v.es.lang + ')' : 'no disponible'} · Voz EN: ${v.en ? v.en.name + ' (' + v.en.lang + ')' : 'no disponible'}` : 'Voces grabadas con Kokoro (es: ef_dora, en-US: am_michael)'; };
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = showVoices; vsel.onchange = showVoices; showVoices();
  const stop = () => { cancelAnimationFrame(raf); speechTimers.forEach(clearTimeout); speechTimers = []; try { speechSynthesis.cancel(); } catch (e) { } if (actx) { actx.close(); actx = null; } playing = false; btnPlay.textContent = '▶ Reproducir'; };
  const start = async () => {
    stop(); actx = new AudioContext(); B = makeBuses(actx); const browser = vsel.value === 'browser';
    if (!browser) bufs = await loadVoices(actx, cues); else bufs = {};
    applyVol(); t0 = actx.currentTime + 0.15; scheduleAll(actx, B, cues, bufs, t0, { voices: !browser });
    if (browser && 'speechSynthesis' in window) { const v = pickVoices(); for (const l of cues.lines) { const [txt, lang] = SPEECH_TEXT[l.id], vv = v[lang]; speechTimers.push(setTimeout(() => { const u = new SpeechSynthesisUtterance(txt); if (vv) { u.voice = vv; u.lang = vv.lang; } else u.lang = lang === 'es' ? 'es-MX' : 'en-US'; u.rate = 0.92; speechSynthesis.speak(u); }, (l.start + 0.15) * 1000)); } }
    playing = true; btnPlay.textContent = '⏸ Pausar';
    const loop = () => { const t = actx.currentTime - t0; pausedT = clamp(t, 0, DURATION); drawFrame(t); clock.textContent = Math.max(0, t).toFixed(1) + ' / 30 s'; if (t < DURATION) raf = requestAnimationFrame(loop); else { playing = false; btnPlay.textContent = '↻ Repetir'; } }; loop();
  };
  btnPlay.onclick = async () => { if (!actx || !playing && actx.state !== 'suspended') return start(); if (actx.state === 'running') { await actx.suspend(); try { speechSynthesis.pause(); } catch (e) { } btnPlay.textContent = '▶ Continuar'; } else { await actx.resume(); try { speechSynthesis.resume(); } catch (e) { } btnPlay.textContent = '⏸ Pausar'; } };
  $('restart').onclick = start;
  const applyVol = () => { if (!B) return; B.voice.gain.value = +$('vVoice').value; B.music.gain.value = +$('vMusic').value * 0.62; B.fx.gain.value = +$('vFx').value * 0.8; B.amb.gain.value = +$('vMusic').value; };
  ['vVoice', 'vMusic', 'vFx'].forEach(id => $(id).oninput = applyVol);
  addEventListener('keydown', (e) => { if (e.key === 'c') btnCC.click(); if (e.key === ' ') { e.preventDefault(); btnPlay.click(); } });
}
boot();
