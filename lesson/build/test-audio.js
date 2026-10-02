const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../fluent-english-be-lesson.html'));
  const out = await p.evaluate(async () => {
    Sound.init(); const an = Sound.tap(); const buf = new Float32Array(2048); let peak = 0, sum = 0, n = 0;
    const iv = setInterval(() => { an.getFloatTimeDomainData(buf); for (const v of buf) { const a = Math.abs(v); peak = Math.max(peak, a); sum += v * v; n++; } }, 40);
    const measure = async (ms) => { peak = 0; sum = 0; n = 0; await new Promise((r) => setTimeout(r, ms)); return { peak: +peak.toFixed(4), rms: +Math.sqrt(sum / Math.max(1, n)).toFixed(5) }; };
    const r = {};
    Sound.setMode('ambient'); await new Promise((r) => setTimeout(r, 3000));
    r.ambient = await measure(9000);
    Sound.setSpeaking(true); await new Promise((r) => setTimeout(r, 1500)); r.ambientDuckedBySpeech = await measure(7000); Sound.setSpeaking(false);
    Sound.setQuiet(true); await new Promise((r) => setTimeout(r, 2500)); r.ambientQuiet = await measure(7000); Sound.setQuiet(false); Sound.setMode('off');
    await new Promise((r) => setTimeout(r, 1500));
    for (const f of ['whoosh', 'join', 'pop', 'click', 'correct', 'gentle', 'reveal', 'timeup', 'turn', 'save']) { const pr = measure(1800); Sound.sfx(f); r['sfx_' + f] = (await pr).peak; }
    const pr = measure(9000); Sound.ending(); r.ending = await pr;
    const pr2 = measure(14500); Sound.opening(); r.opening = await pr2;
    clearInterval(iv); return r;
  });
  console.log(JSON.stringify(out, null, 1)); console.log('errors', errs.length); await b.close();
})();
