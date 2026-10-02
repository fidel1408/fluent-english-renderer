// Drives the real player with a mock speechSynthesis (voices of configurable speed) and checks
// sequencing: no overlapping speech, correct order, exact 4 s learner pause, clock holds for slow voices.
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");
const page0 = join(dirname(fileURLToPath(import.meta.url)), "..", "video", "index.html");

const mockSrc = (mult) => `(() => {
  const log = []; window.__speechLog = log; let current = null, queue = [];
  const voices = [{ name: "Mock Paulina", lang: "es-MX", voiceURI: "mock-es", localService: true }, { name: "Mock Aria", lang: "en-US", voiceURI: "mock-en", localService: true }];
  class U { constructor(t) { this.text = t; this.rate = 1; this.voice = null; this.lang = ""; this.volume = 1; this.pitch = 1; } }
  window.SpeechSynthesisUtterance = U;
  function pump() {
    if (current || !queue.length) return; const u = queue.shift(); current = u;
    const blank = !u.text.trim();
    const dur = blank ? 5 : Math.max(450, u.text.split(/\\s+/).length * 330 / (u.rate || 1)) * ${mult};
    if (!blank) { log.push({ ev: "start", text: u.text, lang: u.voice && u.voice.lang, t: performance.now() }); }
    u.onstart && u.onstart();
    u._t = setTimeout(() => { if (!blank) log.push({ ev: "end", text: u.text, t: performance.now() }); current = null; u.onend && u.onend(); pump(); }, dur);
  }
  const synth = { getVoices: () => voices, addEventListener() {}, removeEventListener() {},
    speak(u) { if (current && u.text.trim()) log.push({ ev: "OVERLAP-REQUEST", text: u.text, t: performance.now() }); queue.push(u); pump(); },
    cancel() { queue = []; if (current) { const c = current; current = null; clearTimeout(c._t); log.push({ ev: "cancel", text: c.text, t: performance.now() }); c.onend && c.onend(); } },
    pause() {}, resume() {} };
  Object.defineProperty(window, "speechSynthesis", { value: synth });
})();`;

async function run(browser, mult) {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.addInitScript(mockSrc(mult));
  await page.goto(pathToFileURL(page0).href + "?clean=1");
  await page.waitForFunction(() => window.FE && FE.player && FE.lockupImg);
  await page.evaluate(() => {
    window.__trace = []; const t0 = performance.now();
    setInterval(() => window.__trace.push([performance.now() - t0, FE.player.T, FE.player.state]), 40);
    window.__t0 = t0;
  });
  await page.evaluate(() => FE.player.start());
  const wall0 = await page.evaluate(() => performance.now());
  await page.waitForFunction(() => FE.player.state === "ended", null, { timeout: 90000, polling: 200 });
  const res = await page.evaluate(() => ({ log: window.__speechLog, trace: window.__trace, t0: window.__t0, ended: performance.now() }));
  await page.close();
  return { ...res, wall0 };
}

function report(name, r) {
  const L = r.log.filter((e) => e.ev !== "cancel");
  const overlaps = r.log.filter((e) => e.ev === "OVERLAP-REQUEST");
  const starts = L.filter((e) => e.ev === "start");
  console.log(`\n== ${name} ==`);
  starts.forEach((s) => { const en = L.find((e) => e.ev === "end" && e.text === s.text && e.t > s.t); console.log(`  ${((s.t - r.wall0) / 1000).toFixed(2)}s  [${s.lang}] "${s.text}"  (${(((en ? en.t : s.t) - s.t) / 1000).toFixed(2)}s)`); });
  console.log("  overlap requests:", overlaps.length, overlaps.map((o) => o.text + "@" + ((o.t - r.wall0) / 1000).toFixed(2)).join(", "));
  // pause window: wall time for video T 19.4 → 23.4
  const tr = r.trace;
  // (the clock may HOLD at 19.4 waiting for the Spanish prompt to finish; measure from 19.5 so that wait is excluded)
  const a = tr.find((x) => x[1] >= 19.5), b = tr.find((x) => x[1] >= 23.4);
  const pauseWall = (b[0] - a[0]) / 1000 + 0.1;
  const inPause = starts.filter((s) => { const w = s.t - r.t0; return w > a[0] && w < b[0]; });
  console.log(`  learner pause wall time: ${pauseWall.toFixed(2)}s (target 4.00); speech starts inside pause: ${inPause.length}`);
  const total = (r.ended - r.wall0) / 1000;
  console.log(`  total wall time: ${total.toFixed(2)}s`);
  // holds: wall time spent with T frozen
  let frozen = 0; for (let i = 1; i < tr.length; i++) if (tr[i][1] === tr[i - 1][1] && tr[i][2] === "playing") frozen += (tr[i][0] - tr[i - 1][0]) / 1000;
  console.log(`  clock held waiting for voice: ${frozen.toFixed(2)}s`);
  const order = starts.map((s) => s.text).join(" | ");
  const expect = ["¿Dices", "I have thirty-three years", "para decir tu edad?", "I’m thirty-three.", "En inglés, para la edad usamos el verbo", "be.", "I’m thirty-three years old.", "How old are you?", "Practica con una edad inventada.", "Pequeños cambios, más confianza.", "Escríbenos ‘inglés’."].join(" | ");
  console.log("  order ok:", order === expect);
  return { ok: overlaps.length === 0 && Math.abs(pauseWall - 4) < 0.15 && inPause.length === 0 && order === expect, total };
}

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const only = process.env.ONLY;
const results = only ? [await run(browser, 1), await run(browser, +only)] : await Promise.all([run(browser, 1), run(browser, 1.6)]);
if (process.env.DUMP) console.log(JSON.stringify(results[1].log.map((e) => [e.ev, e.text, +((e.t - results[1].wall0) / 1000).toFixed(2)])));
const r1 = report("typical voices (1.0×)", results[0]);
const r2 = report("slow voices (1.6×)", results[1]);
await browser.close();
console.log("\nRESULT:", r1.ok && r2.ok ? "PASS" : "FAIL");
process.exit(r1.ok && r2.ok ? 0 : 1);
