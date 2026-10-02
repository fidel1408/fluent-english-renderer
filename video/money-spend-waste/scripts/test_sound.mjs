// Behavioural test of the interactive preview's sound (headless Chromium, real Web Audio graph + analysers):
// Start -> audible, pause, resume, replay x3, scrub across scenes while playing, speaking-pause silence, mute, per-layer sliders.
// "Audible" is measured with AnalyserNodes on the actual output graph; "no overlap" = never more than 4 live sources (one per stem).
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.wav': 'audio/wav' };
const server = createServer((req, res) => { const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html'); if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); }).listen(0);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 900, height: 1100 } }); const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(`http://localhost:${server.address().port}/index.html`); await p.waitForFunction('window.__ready===true');
const results = []; const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); };
const lv = () => p.evaluate(() => window.__player()?.levels());
const maxOver = async (ms, step = 40) => { // sample levels + live source count for ms; return maxima
  const t0 = Date.now(); const m = { master: 0, voice: 0, music: 0, ambience: 0, sfx: 0, src: 0 };
  while (Date.now() - t0 < ms) { const r = await p.evaluate(() => { const pl = window.__player(); return pl ? { ...pl.levels(), src: pl.activeSources() } : null; }); if (r) for (const k in m) m[k] = Math.max(m[k], r[k]); await p.waitForTimeout(step); }
  return m;
};
const setT = (t) => p.evaluate((t) => { const s = document.getElementById('scrub'); s.value = t; s.dispatchEvent(new Event('input')); }, t);
const timeNow = async () => parseFloat((await p.textContent('#time')).split('/')[0]);
await p.waitForFunction(() => /Sound ready|Narration missing/.test(document.getElementById('audioBadge').textContent), null, { timeout: 60000 });
check('soundtrack prepared in page', true, await p.textContent('#audioBadge'));
check('label reads "Start" before first press', (await p.textContent('#play')) === 'Start');
await p.click('#play'); await p.waitForTimeout(300);
check('AudioContext running after Start', await p.evaluate(() => window.__player().ctx.state) === 'running');
let m = await maxOver(1500);
check('audible right after Start (master RMS)', m.master > 0.01, `master ${m.master.toFixed(3)} voice ${m.voice.toFixed(3)} music ${m.music.toFixed(3)} amb ${m.ambience.toFixed(4)} sfx ${m.sfx.toFixed(3)}`);
check('narration layer audible in first line', m.voice > 0.02); check('music layer audible', m.music > 0.003); check('ambience layer audible', m.ambience > 0.0005); check('exactly 4 live sources (one per layer)', m.src === 4, 'src=' + m.src);
const t1 = await timeNow(); await p.waitForTimeout(600); const t2 = await timeNow(); check('visual clock advances with audio', t2 > t1 + 0.4, `${t1} -> ${t2}`);
// pause
await p.click('#play'); await p.waitForTimeout(250); m = await maxOver(500);
check('Pause silences everything and frees sources', m.master < 0.0005 && m.src === 0, `master ${m.master.toFixed(5)} src ${m.src}`);
check('label reads "Resume"', (await p.textContent('#play')) === 'Resume');
const tp = await timeNow(); await p.waitForTimeout(500); check('time frozen while paused', Math.abs((await timeNow()) - tp) < 0.05);
await p.click('#play'); m = await maxOver(900); check('Resume plays again (4 sources, audible)', m.src === 4 && m.master > 0.003, `src ${m.src} master ${m.master.toFixed(3)}`);
// replay x3 quickly
let maxSrc = 0; for (let i = 0; i < 3; i++) { await p.click('#restart'); const r = await maxOver(350); maxSrc = Math.max(maxSrc, r.src); }
check('Restart x3 never overlaps (<=4 sources)', maxSrc <= 4, 'max sources ' + maxSrc);
// scene changes while playing: scrub across every boundary
const bounds = [3.7, 10.8, 16.8, 22.8]; let sceneMax = 0, sceneAud = true;
for (const t of bounds) { await setT(t); const r = await maxOver(450); sceneMax = Math.max(sceneMax, r.src); if (!(r.master > 0.003)) sceneAud = false; }
check('scrubbing across 4 scene boundaries keeps single source set', sceneMax <= 4, 'max ' + sceneMax); check('audible at every scene entry', sceneAud);
// speaking pause: real silence
await setT(20.5); await p.waitForTimeout(150); m = await maxOver(1200);
check('speaking pause (20.5–21.7 s) is quiet', m.master < 0.004 && m.voice < 0.0005 && m.music < 0.0005 && m.ambience < 0.0005, `master ${m.master.toFixed(4)} voice ${m.voice.toFixed(5)} music ${m.music.toFixed(5)} amb ${m.ambience.toFixed(5)} sfx ${m.sfx.toFixed(4)}`);
// layers independent
await setT(5.0); await p.waitForTimeout(100);
await p.evaluate(() => { const e = document.getElementById('vol_voice'); e.value = 0; e.dispatchEvent(new Event('input')); }); await p.waitForTimeout(150); m = await maxOver(700);
check('Voice slider 0 silences narration only', m.voice < 0.0005 && m.music > 0.002, `voice ${m.voice.toFixed(5)} music ${m.music.toFixed(4)}`);
await p.evaluate(() => { const e = document.getElementById('vol_voice'); e.value = 100; e.dispatchEvent(new Event('input')); const f = document.getElementById('vol_music'); f.value = 0; f.dispatchEvent(new Event('input')); }); await p.waitForTimeout(150); m = await maxOver(700);
check('Music slider 0 silences music only', m.music < 0.0005 && m.voice > 0.01, `music ${m.music.toFixed(5)} voice ${m.voice.toFixed(3)}`);
await p.evaluate(() => { const f = document.getElementById('vol_music'); f.value = 90; f.dispatchEvent(new Event('input')); });
// mute
await p.click('#mute'); await p.waitForTimeout(200); m = await maxOver(500); check('Mute silences output while layers keep running', m.master < 0.0005 && m.src === 4, `master ${m.master.toFixed(5)} src ${m.src}`);
await p.click('#mute'); await p.waitForTimeout(200); m = await maxOver(500); check('Unmute restores sound', m.master > 0.003);
// end + replay
await setT(28.5); await p.waitForTimeout(1200); check('ends cleanly (label "Replay", 0 sources)', (await p.textContent('#play')) === 'Replay' && (await p.evaluate(() => window.__player().activeSources())) === 0);
await p.click('#play'); m = await maxOver(900); check('Replay after end restarts with sound', m.master > 0.01 && m.src === 4);
check('no page errors', errs.length === 0, errs.join('; '));
await b.close(); server.close();
console.log(results.every(Boolean) ? '\nALL SOUND TESTS PASSED' : '\nSOME SOUND TESTS FAILED'); process.exit(results.every(Boolean) ? 0 : 1);
