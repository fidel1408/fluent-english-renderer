// Behavioural test of the browser preview (index.html) with a stubbed speechSynthesis (no voices exist in this sandbox).
const L = require('./lib');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const srv = await L.serve(), b = await L.launch(['--autoplay-policy=no-user-gesture-required']);
  const ctxb = await b.newContext({ viewport: { width: 700, height: 1100 } }); const p = await ctxb.newPage();
  p.on('pageerror', (e) => { console.log('pageerror', e.message); process.exitCode = 1; });
  await p.addInitScript(() => {
    const voices = [{ name: 'Paulina', lang: 'es-MX', localService: true, voiceURI: 'paulina' }, { name: 'Aaron', lang: 'en-US', localService: true, voiceURI: 'aaron' }, { name: 'Google US English', lang: 'en-US', localService: false, voiceURI: 'gus' }];
    const log = { speaks: [], cancels: 0, active: 0, maxActive: 0 };
    window.__log = log; let timers = [];
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => voices, addEventListener() {},
      speak(u) { log.speaks.push({ text: u.text, voice: u.voice && u.voice.name, at: performance.now() }); log.active++; log.maxActive = Math.max(log.maxActive, log.active); timers.push(setTimeout(() => { log.active = Math.max(0, log.active - 1); }, 2000)); },
      cancel() { log.cancels++; log.active = 0; timers.forEach(clearTimeout); timers = []; }, pause() {}, resume() {}
    } });
    // count live (not yet stopped) oscillator/buffer sources
    const live = new Set(); window.__live = live;
    ['OscillatorNode', 'AudioBufferSourceNode'].forEach((n) => { const P = window[n].prototype, s = P.start, st = P.stop; P.start = function () { live.add(this); this.onended = () => live.delete(this); return s.apply(this, arguments); }; P.stop = function () { try { return st.apply(this, arguments); } finally { if (arguments.length === 0 || arguments[0] === 0) live.delete(this); } }; });
  });
  await p.goto(srv.url + '/index.html');
  await p.waitForFunction('FE.logoReady()');
  // 1. before Start: no audio, not playing
  ok(await p.evaluate(() => !__fe.playing && !__fe.live && __log.speaks.length === 0), 'nothing plays or speaks before Start');
  ok(/ES: Paulina \(es-MX\).*EN: Aaron \(en-US\)/.test(await p.textContent('#voiceStatus')), 'voice picker chose es-MX + local en-US voice: ' + await p.textContent('#voiceStatus'));
  // CC button cycles + remembered
  const cc = async () => p.textContent('#ccBtn');
  ok((await cc()).includes('Captions + IPA'), 'default mode = Captions + IPA'); await p.click('#ccBtn'); ok((await cc()).endsWith('Off'), 'click -> Off');
  await p.reload(); await p.waitForFunction('FE.logoReady()'); ok((await cc()).endsWith('Off'), 'mode remembered after reload'); await p.click('#ccBtn'); await p.click('#ccBtn'); ok((await cc()).endsWith('Captions + IPA'), 'cycles back to Captions + IPA');
  // 2. start
  await p.click('#startBtn');
  await p.waitForFunction('__fe.t > 5.3', null, { timeout: 15000 });
  const s1 = await p.evaluate(() => ({ ctx: __fe.live && __fe.live.ctx.state, speaks: __log.speaks.map((x) => x.text), live: __live.size }));
  ok(s1.ctx === 'running', 'AudioContext running after Start'); ok(s1.speaks.length === 2 && /café/.test(s1.speaks[0]) && /Could I have a coffee/.test(s1.speaks[1]), 'v1 (es) and v2 (en) spoken once each: ' + JSON.stringify(s1.speaks)); ok(s1.live > 10, 'procedural sources scheduled (' + s1.live + ')');
  const analyse = (ms) => p.evaluate(async (ms) => { const c = __fe.live.ctx, an = c.createAnalyser(); an.fftSize = 2048; __fe.live.master.connect(an); await new Promise((r) => setTimeout(r, ms)); const d = new Float32Array(2048); an.getFloatTimeDomainData(d); __fe.live.master.disconnect(an); return Math.sqrt(d.reduce((s, v) => s + v * v, 0) / d.length); }, ms);
  const lvl1 = await analyse(300); ok(lvl1 > 1e-4, 'audio graph carries signal while playing (rms ' + lvl1.toExponential(2) + ')');
  // 3. pause
  await p.click('#playBtn'); const t0 = await p.evaluate(() => __fe.t); await p.waitForTimeout(900); const t1 = await p.evaluate(() => __fe.t);
  ok(Math.abs(t1 - t0) < 0.02, 'clock frozen while paused'); const lvlP = await analyse(400); ok(lvlP < 1e-5, 'audio silent while paused (rms ' + lvlP.toExponential(2) + ')');
  ok(await p.evaluate(() => __log.cancels >= 1 && __log.active === 0 && __live.size < 3), 'speech cancelled + sources stopped on pause (live ' + await p.evaluate(() => __live.size) + ')');
  // 4. resume + replay twice quickly (no overlap)
  await p.click('#playBtn'); await p.waitForTimeout(300); await p.click('#replayBtn'); await p.waitForTimeout(150); await p.click('#replayBtn');
  const before = await p.evaluate(() => __log.speaks.length); await p.waitForFunction('__fe.t > 1.6'); await p.waitForTimeout(200);
  const st = await p.evaluate(() => ({ n: __log.speaks.length, last: __log.speaks[__log.speaks.length - 1].text, maxActive: __log.maxActive, live: __live.size, t: __fe.t }));
  ok(st.n - before === 1 && /café/.test(st.last), 'after double replay the opening line is spoken exactly once (' + (st.n - before) + ')'); ok(st.maxActive <= 1, 'never more than one utterance active (max ' + st.maxActive + ')');
  // source count after replay should match a fresh start (no doubled schedule)
  const liveNow = st.live; await p.click('#replayBtn'); await p.waitForTimeout(250); const liveAfter = await p.evaluate(() => __live.size);
  ok(Math.abs(liveAfter - liveNow) < liveNow * 0.25, 'replay does not stack audio sources (' + liveNow + ' -> ' + liveAfter + ')');
  // 5. mixer controls are separate
  await p.evaluate(() => __fe.live.setLevel('music', 0.1)); await p.waitForTimeout(400);
  const lv = await p.evaluate(() => ({ m: __fe.live.bus.music.gain.value, a: __fe.live.bus.amb.gain.value, s: __fe.live.bus.sfx.gain.value }));
  ok(Math.abs(lv.m - 0.1) < 0.02 && Math.abs(lv.a - 0.7) < 0.01 && Math.abs(lv.s - 0.8) < 0.01, 'music level changes independently of ambience/effects ' + JSON.stringify(lv));
  // 6. run to the end: speaking pause has no speech
  const n0 = await p.evaluate(() => __log.speaks.length);
  await p.evaluate(() => __fe.play(20.0)); await p.waitForFunction('__fe.t > 23.7', null, { timeout: 15000 });
  const sp = await p.evaluate((n) => __log.speaks.slice(n).map((x) => x.text), n0);
  ok(sp.length === 0, 'starting at 20.0 s: v5 (already underway) is skipped and nothing is spoken through the response pause (spoken: ' + JSON.stringify(sp) + ')');
  await p.waitForFunction('__fe.t > 29.9', null, { timeout: 15000 }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => !__fe.playing && __live.size < 3), 'stops cleanly at the end');
  await b.close(); srv.close();
})();
