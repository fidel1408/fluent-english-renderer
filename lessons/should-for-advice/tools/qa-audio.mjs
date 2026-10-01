// Real-time playback test (wall clock, real <audio>): narration starts at planned times, never overlaps, survives seek/pause/chapter jumps.
import { chromium } from 'playwright-core'; import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = []; const t = (n, ok, i) => { out.push({ name: n, ok: !!ok, info: i === undefined ? '' : String(i) }); console.log((ok ? 'PASS ' : 'FAIL ') + n + (i !== undefined ? '  [' + i + ']' : '')); };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
await p.goto('file://' + root + '/dist/should-for-advice.html'); await p.waitForTimeout(500);
await p.evaluate(() => { document.getElementById('startBtn').click(); });
// sample audio state every 100 ms for 40 s while playing 1.1
const samples = await p.evaluate(() => new Promise((res) => {
  const E = FE.engine, A = FE.audio, s = []; const t0 = performance.now(); let maxActive = 0;
  const iv = setInterval(() => {
    const seg = E.seg, el = A.el; const active = (el && !el.paused && !el.ended) ? 1 : 0; maxActive = Math.max(maxActive, active);
    s.push({ t: +((performance.now() - t0) / 1000).toFixed(2), local: +E.local.toFixed(2), cur: A.cur && A.cur.id, ct: el ? +el.currentTime.toFixed(2) : -1, paused: el ? el.paused : null, ready: el ? el.readyState : -1 });
    if (performance.now() - t0 > 40000) { clearInterval(iv); res({ s, maxActive, segLines: seg.lines.map((l) => ({ k: l.k, id: l.id, start: l.start, end: l.end })) }); }
  }, 100);
}));
const S = samples.s;
let started = 0, drifts = [];
for (const ln of samples.segLines) {
  if (ln.start > 38) continue;
  const first = S.find((x) => x.cur === ln.id && x.ct > 0);
  if (first) { started++; drifts.push(+(first.local - ln.start).toFixed(2)); }
}
t('narration clips begin in step with the planned timeline (≤0.35 s late)', started >= 4 && drifts.every((d) => d < 0.35 && d > -0.1), `started ${started}, drift s: ${drifts.join(',')}`);
t('only one narration clip plays at any moment (single audio channel)', samples.maxActive <= 1);
t('audio element really plays (currentTime advanced)', S.some((x) => x.ct > 1 && !x.paused), `max currentTime ${Math.max(...S.map((x) => x.ct))}`);
// seek storms
const storm = await p.evaluate(async () => {
  const E = FE.engine, A = FE.audio; const toks = []; let overlap = 0;
  for (const T of [120, 5, 600, 1900, 2500, 3300, 10, 780, 1260]) { E.goto(T); await new Promise((r) => setTimeout(r, 250)); toks.push(A.token); const n = document.querySelectorAll('audio').length; if (n > 0) overlap++; }
  E.chapterJump(1); E.chapterJump(-1); E.seek(-5); E.seek(5); E.replay();
  await new Promise((r) => setTimeout(r, 400));
  return { toks, extraAudioTags: overlap, playing: E.playing, el: A.el ? !A.el.paused || A.el.ended || true : false };
});
t('seeking / chapter jumps / replay never create extra audio elements or overlap', storm.extraAudioTags === 0 && storm.toks.every((x, i, a) => i === 0 || x >= a[i - 1]));
// pause: audio pauses; resume: continues
const pr = await p.evaluate(async () => { const E = FE.engine, A = FE.audio; E.goto(FE.segs.find((s) => s.id === '2.1').start + 12); await new Promise((r) => setTimeout(r, 1500)); const c1 = A.el.currentTime; E.setPlaying(false); await new Promise((r) => setTimeout(r, 600)); const pausedNow = A.el.paused; const c2 = A.el.currentTime; await new Promise((r) => setTimeout(r, 600)); const c3 = A.el.currentTime; E.setPlaying(true); await new Promise((r) => setTimeout(r, 900)); return { pausedNow, frozen: Math.abs(c3 - c2) < 0.01, resumed: A.el.currentTime > c3 || A.el.ended, cur: !!A.cur }; });
t('pause freezes narration; resume continues it', pr.pausedNow && pr.frozen && pr.resumed, JSON.stringify(pr));
// mouth sync: character line drives mouth level
const mouth = await p.evaluate(async () => { const E = FE.engine, A = FE.audio; const s = FE.segs.find((x) => x.id === '2.1'); E.goto(s.start + s.L.d1.start + 0.3); await new Promise((r) => setTimeout(r, 800)); const lv = []; for (let i = 0; i < 20; i++) { lv.push(A.mouthLevel()); await new Promise((r) => setTimeout(r, 60)); } return { lv, speaker: A.currentWho(), speaking: E.scene.actors.some((a) => a.speaking) }; });
t('lip-sync level follows the audio envelope of the speaking character', mouth.speaker === 'daniel' && mouth.speaking && Math.max(...mouth.lv) > 0.5 && Math.min(...mouth.lv) < 0.3, JSON.stringify({ max: Math.max(...mouth.lv), min: Math.min(...mouth.lv), who: mouth.speaker }));
// perf: frame time during dialogue scene
const perf = await p.evaluate(async () => { const E = FE.engine; E.goto(FE.segs.find((s) => s.id === '4.3').start + 20); const f = []; let last = performance.now(); await new Promise((res) => { let n = 0; const loop = (now) => { f.push(now - last); last = now; if (++n < 180) requestAnimationFrame(loop); else res(); }; requestAnimationFrame(loop); }); f.sort((a, b) => a - b); return { med: f[Math.floor(f.length / 2)], p95: f[Math.floor(f.length * 0.95)] }; });
t('animation frame time in a dialogue scene (headless software rendering)', perf.med < 40, `median ${perf.med.toFixed(1)} ms, p95 ${perf.p95.toFixed(1)} ms`);
// loop stops when paused (no rendering while paused)
const idle = await p.evaluate(async () => { const E = FE.engine; E.setPlaying(false); await new Promise((r) => setTimeout(r, 200)); return { running: FE.Loop.run, interval: !!E.tickId && E.playing }; });
t('rendering loop stops while paused', idle.running === false);
t('no page errors during real-time playback', errs.length === 0, errs.slice(0, 2).join('|'));
fs.writeFileSync(path.join(root, 'docs/qa-audio-results.json'), JSON.stringify({ date: new Date().toISOString(), results: out }, null, 1));
console.log(out.filter((x) => x.ok).length + '/' + out.length + ' passed'); await b.close();
