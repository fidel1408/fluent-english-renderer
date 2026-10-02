/* ===== UI, loop, export ===== */
const $ = id => document.getElementById(id);
const cv = $('stage'), g = cv.getContext('2d', { alpha: false });
let exporting = null;
const CC_LABEL = ['CC: Off', 'CC: Captions', 'CC + IPA'];

function setStatus(s) { $('status').textContent = s; }
function updateButtons() {
  const s = Show.state, playing = s === 'playing' || s === 'paused';
  $('bStart').textContent = playing ? '▶ Restart' : s === 'ended' ? '↺ Play again' : '▶ Start';
  $('bPause').disabled = !(s === 'playing' || s === 'paused'); $('bPause').textContent = s === 'paused' ? '▶ Resume' : '⏸ Pause';
  $('bReplay').disabled = s === 'idle';
  $('bCC').textContent = CC_LABEL[Show.ccMode]; $('bCC').setAttribute('aria-label', 'Subtítulos e IPA: ' + ['apagado', 'subtítulos', 'subtítulos más IPA'][Show.ccMode]);
  $('startOverlay').classList.toggle('hidden', s !== 'idle');
  $('bMute').disabled = !!exporting;
}
function hardStop() {
  Show.run++; Clock.cancelAll(); Speech.cancel(); Audio_.stopMusic(true);
  Clock.resume(); Audio_.resume && Audio_.ctx && Audio_.resume();
}
function resetShow() { Show.scene = -1; Show.prev = null; Show.ev = [{}, {}, {}, {}, {}]; Show.cap = null; Show.mouth = false; Show.testing = false; Clock.reset(); }
async function begin() {
  Audio_.init(); await Audio_.resume(); Speech.prime();
  hardStop(); resetShow();
  await new Promise(r => setTimeout(r, Speech.ok ? 140 : 0));   // let cancelled speech flush
  const run = ++Show.run; Show.state = 'playing'; updateButtons(); setStatus('Reproduciendo…');
  playShow(run);
}
$('bStart').onclick = begin; $('startOverlay').onclick = begin; $('bReplay').onclick = begin;
$('bPause').onclick = async () => {
  if (Show.state === 'playing') { Clock.pause(); Speech.pause(); await Audio_.suspend(); Show.state = 'paused'; setStatus('En pausa.'); }
  else if (Show.state === 'paused') { await Audio_.resume(); Speech.resume(); Clock.resume(); Show.state = 'playing'; setStatus('Reproduciendo…'); }
  updateButtons();
};
let muted = store.get('mute', '0') === '1';
function applyMute() { Audio_.setMuted(muted); Speech.state.muted = muted; $('bMute').setAttribute('aria-pressed', muted); $('bMute').textContent = muted ? '🔇 Unmute' : '🔊 Mute'; if (muted && Speech.ok) { /* running utterance keeps its volume; applies to the next phrase */ } }
$('bMute').onclick = () => { muted = !muted; store.set('mute', muted ? '1' : '0'); applyMute(); };
$('bCC').onclick = () => { Show.ccMode = (Show.ccMode + 1) % 3; store.set('cc', Show.ccMode); updateButtons(); };
window.addEventListener('fe-ended', () => { updateButtons(); setStatus('Fin. Pulsa Replay para repetir.'); });

/* ---- export: canvas + Web Audio (music & effects). Browser speech is NOT capturable this way. ---- */
function pickMime() {
  const list = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return list.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}
async function recordRun(stream, label, silentSpeech) {
  const mime = pickMime(); if (!mime) { setStatus('Este navegador no soporta MediaRecorder.'); return; }
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8e6, audioBitsPerSecond: 192000 }), chunks = [];
  rec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
  const done = new Promise(r => rec.onstop = r);
  exporting = label; Speech.state.silent = silentSpeech; updateButtons();
  rec.start(250); await begin();
  await new Promise(r => window.addEventListener('fe-ended', r, { once: true }));
  await new Promise(r => setTimeout(r, 600)); rec.stop(); await done;
  Speech.state.silent = false; exporting = null; updateButtons();
  const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm', blob = new Blob(chunks, { type: mime.split(';')[0] });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `fluent-english-actually-currently-${label}.${ext}`; a.click();
  setStatus(`Exportado (${ext.toUpperCase()}, ${(blob.size / 1e6).toFixed(1)} MB).` + (silentSpeech ? ' Contiene música y efectos, sin voces.' : ''));
  return blob;
}
$('bExport').onclick = async () => {
  if (!window.MediaRecorder || !cv.captureStream) { setStatus('Exportar no está disponible en este navegador. Usa la grabación de pantalla.'); return; }
  Audio_.init(); await Audio_.resume(); setStatus('Exportando en tiempo real (~30 s)… las voces no se incluyen.');
  const stream = new MediaStream([...cv.captureStream(30).getVideoTracks(), ...Audio_.exportStream.getAudioTracks()]);
  await recordRun(stream, 'musica-y-efectos', true);
};
$('bRecord').onclick = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) throw new Error('getDisplayMedia no disponible');
    setStatus('Elige “Esta pestaña” y activa “Compartir audio de la pestaña”.');
    const ds = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true, preferCurrentTab: true, selfBrowserSurface: 'include' });
    try { if (window.CropTarget) { const ct = await CropTarget.fromElement(cv); await ds.getVideoTracks()[0].cropTo(ct); } } catch (e) { }
    if (!ds.getAudioTracks().length) setStatus('No se compartió audio de la pestaña: el archivo no tendrá voces.');
    await recordRun(ds, 'con-voces-captura', false); ds.getTracks().forEach(t => t.stop());
  } catch (e) { setStatus('No se pudo iniciar la captura: ' + e.message); }
};
$('bCover').onclick = () => {
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; drawCover(c2.getContext('2d'), 2);
  c2.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'portada-actually-vs-actualmente.png'; a.click(); });
};

/* ---- init ---- */
Speech.load($('selEs'), $('selEn'), $('warn'));
applyMute(); updateButtons();
(async () => {
  try { await Promise.race([document.fonts.load('800 60px Fraunces'), document.fonts.load('800 40px Nunito'), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
  layCache.clear();
  const loop = () => { if (!Show.frozen) renderFrame(g); requestAnimationFrame(loop); }; loop();
})();

/* test hook: render any moment deterministically (used by tools/verify.mjs) */
window.__fe = {
  Show, Clock, Speech, Audio_,
  seek(scene, st, o = {}) {
    hardStop(); Show.testing = true; Show.state = 'playing'; Show.scene = scene; Show.prev = o.prev ?? (scene > 0 ? scene - 1 : null); Show.prevSt = o.prevSt ?? 9;
    Show.ev = [{}, {}, {}, {}, {}]; Show.cap = o.cap ?? null; Show.mouth = !!o.mouth; Show.ccMode = o.cc ?? Show.ccMode;
    Clock.offset = 0; Clock.pausedAt = 100000; Show.sceneStart = 100000 - st * 1000; layCache.clear(); Show.debug = !!o.debug;
  }
};
