// Behaviour tests for the Childhood Speaking Club lesson.  node tools/test.mjs [--only name]
// A mock speechSynthesis (this machine has no voices) records what would be spoken, in order, with the chosen voice.
import { chromium } from "playwright-core";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const URL0 = "file://" + path.resolve(here, "../index.html");
const results = [];
function ok(name, cond, detail) { results.push({ name, pass: !!cond, detail: cond ? "" : String(detail ?? "") }); console.log((cond ? "PASS " : "FAIL ") + name + (cond || detail === undefined ? "" : "  -> " + detail)); }
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const want = (g) => !only || only === g;

const MOCK = () => {
  const voices = [
    { name: "Microsoft Aria Online (Natural) - English (United States)", lang: "en-US", voiceURI: "aria", localService: false },
    { name: "Microsoft Guy Online (Natural) - English (United States)", lang: "en-US", voiceURI: "guy", localService: false },
    { name: "Microsoft Jenny Online (Natural) - English (United States)", lang: "en-US", voiceURI: "jenny", localService: false },
    { name: "Microsoft Davis Online (Natural) - English (United States)", lang: "en-US", voiceURI: "davis", localService: false },
    { name: "Microsoft George - English (United Kingdom)", lang: "en-GB", voiceURI: "george", localService: true },
  ];
  window.__spoken = []; window.__active = 0; window.__maxActive = 0; window.__overlap = 0; window.__cancels = 0;
  class Utter { constructor(t) { this.text = t; this.voice = null; this.pitch = 1; this.rate = 1; this.volume = 1; } }
  window.SpeechSynthesisUtterance = Utter;
  const syn = {
    cur: null, getVoices() { return voices; }, addEventListener() {},
    speak(u) {
      if (syn.cur) window.__overlap++;
      syn.cur = u; window.__active++; window.__maxActive = Math.max(window.__maxActive, window.__active);
      window.__spoken.push({ text: u.text, voice: u.voice && u.voice.name, pitch: u.pitch, rate: u.rate, volume: u.volume, t: performance.now() });
      setTimeout(() => {
        if (syn.cur !== u) return;
        u.onstart && u.onstart();
        const words = [...u.text.matchAll(/\S+/g)];
        words.forEach((m, i) => setTimeout(() => { if (syn.cur === u && u.onboundary) u.onboundary({ name: "word", charIndex: m.index }); }, 28 * i));
        u._end = setTimeout(() => { if (syn.cur === u) { syn.cur = null; window.__active--; u.onend && u.onend(); } }, 60 + 28 * words.length);
      }, 5);
    },
    cancel() { if (syn.cur) { const u = syn.cur; syn.cur = null; window.__active--; window.__cancels++; clearTimeout(u._end); setTimeout(() => u.onerror && u.onerror({ error: "canceled" }), 0); } },
  };
  Object.defineProperty(window, "speechSynthesis", { value: syn });
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
async function fresh(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1600, height: 900 }, acceptDownloads: true, reducedMotion: opts.reducedMotion, permissions: [] });
  const page = await ctx.newPage();
  const errs = []; page.__errs = errs; page.__req = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  page.on("request", (r) => { if (!r.url().startsWith("file://") && !r.url().startsWith("data:")) page.__req.push(r.url()); });
  if (opts.mock !== false) await page.addInitScript(MOCK);
  const qs = (opts.query || "?").replace(/\?$/, "?") + (opts.clips ? "" : (opts.query ? "&" : "") + "clips=0");
  await page.goto(URL0 + qs);
  await page.waitForTimeout(250);
  return { ctx, page };
}
const start = async (p, mode = "class") => { await p.click(`[data-start="${mode}"]`); await p.waitForTimeout(300); };

/* ============ 1. plan and timing (static) ============ */
if (want("plan")) {
  const { ctx, page: p } = await fresh();
  const r = await p.evaluate(() => {
    const X = FE.X, V = FE.Voice, out = { chapters: [], problems: [], speak: 0, total: 0, timers: 0 };
    X.chapters().forEach((c) => {
      const sum = c.steps.reduce((a, s) => a + s.sec, 0);
      out.chapters.push({ n: c.n, min: c.min, sum });
      out.total += sum;
      c.steps.forEach((s) => {
        if (s.speak && s.timer) out.speak += s.timer;
        if (s.timer) out.timers += s.timer;
        const lines = (s.say || []).map((l) => (Array.isArray(l) ? l[1] : l.t));
        const est = lines.reduce((a, t) => a + V.estimate(FE.plain(t)) + 350, 0) / 1000;
        const allow = s.sec - (s.timer || 0);
        if (est > allow + 0.8) out.problems.push(`${c.n}/${s.id}: narration ~${est.toFixed(1)}s > allowance ${allow}s`);
        if (s.timer && s.timer > s.sec) out.problems.push(`${c.n}/${s.id}: timer longer than step`);
        // every non-timed, non-auto step must wait for the teacher (class mode pauses for participation)
        if (!s.timer && !s.auto && !s.wait) out.problems.push(`${c.n}/${s.id}: no wait/auto/timer flag`);
      });
    });
    return out;
  });
  const mins = [1, 4, 7, 8, 8, 7, 7, 7, 8, 3];
  ok("ten chapters", r.chapters.length === 10, r.chapters.length);
  ok("chapter minutes are 1,4,7,8,8,7,7,7,8,3", JSON.stringify(r.chapters.map((c) => c.min)) === JSON.stringify(mins), JSON.stringify(r.chapters.map((c) => c.min)));
  ok("each chapter's step budgets add up exactly to its minutes", r.chapters.every((c) => c.sum === c.min * 60), JSON.stringify(r.chapters.filter((c) => c.sum !== c.min * 60)));
  ok("total planned time is exactly 60:00", r.total === 3600, r.total);
  ok("planned student-speaking time is about 40 minutes (39–43)", r.speak >= 2340 && r.speak <= 2580, (r.speak / 60).toFixed(1) + " min");
  console.log("   speaking minutes planned:", (r.speak / 60).toFixed(1), " timer minutes:", (r.timers / 60).toFixed(1));
  ok("narration fits inside each step's allowance", r.problems.length === 0, r.problems.join("; "));
  const logo = await p.evaluate(() => { const i = document.querySelector("#hud .logo img"); return i.complete ? [i.naturalWidth, i.naturalHeight, i.getBoundingClientRect().width, i.getBoundingClientRect().height] : null; });
  await p.click('[data-start="class"]'); await p.waitForTimeout(500);
  const logo2 = await p.evaluate(() => { const i = document.querySelector("#hud .logo img"); const r = i.getBoundingClientRect(); return [i.naturalWidth, i.naturalHeight, r.width, r.height]; });
  ok("logo is the authentic file (3444x1875) shown with its original proportions", logo2[0] === 3444 && logo2[1] === 1875 && Math.abs(logo2[2] / logo2[3] - 3444 / 1875) < 0.01, JSON.stringify(logo2));
  ok("no external network requests", p.__req.length === 0, p.__req.join(","));
  ok("no console errors (plan)", p.__errs.length === 0, p.__errs.join("|"));
  await ctx.close();
}

/* ============ 2. narration engine ============ */
if (want("narration")) {
  const { ctx, page: p } = await fresh();
  const voices = await p.evaluate(() => FE.Voice.voices.length);
  ok("voices detected (mock)", voices >= 4, voices);
  await start(p);
  await p.waitForFunction(() => window.__spoken.length >= 3, null, { timeout: 15000 });
  const sp = await p.evaluate(() => window.__spoken.map((s) => [s.text, s.voice]));
  ok("opening narration starts with Maya's welcome", /Welcome to Speaking Club/.test(sp[0][0]), sp[0][0]);
  ok("Maya uses a female US voice", /Jenny|Aria/.test(sp[0][1] || ""), sp[0][1]);
  await p.waitForFunction(() => window.__spoken.some((s) => /Meet me at the park/.test(s.text)), null, { timeout: 30000 });
  const note = await p.evaluate(() => window.__spoken.find((s) => /Meet me at the park/.test(s.text)));
  ok("Theo uses a different, male voice", /Guy|Davis/.test(note.voice || ""), note.voice);
  ok("speech text contains no IPA symbols", await p.evaluate(() => window.__spoken.every((s) => !/[ˈˌɑɔəʌɪʊʃʒθðŋɜ]/.test(s.text))));
  ok("never two voices at once so far", await p.evaluate(() => window.__maxActive <= 1 && window.__overlap === 0), await p.evaluate(() => [window.__maxActive, window.__overlap]));
  // rapid navigation must not overlap audio
  await p.evaluate(() => { for (let i = 0; i < 6; i++) FE.X.next(); });
  await p.waitForTimeout(600);
  await p.evaluate(() => FE.X.go(2, 1)); await p.waitForTimeout(50); await p.evaluate(() => FE.X.go(2, 4)); await p.waitForTimeout(50); await p.evaluate(() => FE.X.go(1, 1));
  await p.waitForTimeout(1500);
  ok("rapid navigation never overlaps speech", await p.evaluate(() => window.__maxActive <= 1 && window.__overlap === 0), await p.evaluate(() => [window.__maxActive, window.__overlap]));
  // pause cancels, resume restarts the same line
  await p.evaluate(() => FE.X.go(2, 1));
  await p.waitForFunction(() => window.__active === 1, null, { timeout: 5000 }).catch(() => {});
  const c0 = await p.evaluate(() => window.__cancels);
  await p.evaluate(() => FE.X.pause());
  await p.waitForTimeout(150);
  ok("pause stops the voice", await p.evaluate(() => window.__active === 0));
  const n0 = await p.evaluate(() => window.__spoken.length);
  await p.waitForTimeout(500);
  ok("nothing is spoken while paused", await p.evaluate((n) => window.__spoken.length === n, n0));
  await p.evaluate(() => FE.X.resume());
  await p.waitForTimeout(700);
  const tail = await p.evaluate(() => window.__spoken.slice(-2).map((s) => s.text));
  ok("resume restarts the interrupted line", await p.evaluate((n) => window.__spoken.length > n, n0), tail.join(" / "));
  // timer start stops narration (no narration during discussion)
  await p.evaluate(() => FE.X.go(1, 2)); // warm-up Q1 answer: timer step
  await p.waitForTimeout(500);
  const a1 = await p.evaluate(() => window.__active);
  ok("no narration over a speaking timer", a1 === 0, a1);
  // narration highlight follows the voice
  await p.evaluate(() => FE.X.go(1, 0));
  await p.waitForFunction(() => document.querySelector(".bubble .wu.say"), null, { timeout: 5000 }).catch(() => {});
  ok("current word is highlighted in the bubble while it is spoken", await p.evaluate(() => !!document.querySelector(".bubble .wu.say")));
  // phrase-by-phrase delivery with mood-shaped pitch (less robotic than one flat pass)
  await p.evaluate(() => { FE.X.pause(); window.__spoken.length = 0; FE.Voice.speak("Hello there, my friend. How are you today? I am great!", { role: "theo", mood: "grin" }); });
  await p.waitForTimeout(1800);
  const pr = await p.evaluate(() => window.__spoken.map((s) => [s.text, +s.pitch.toFixed(2), +s.rate.toFixed(2)]));
  ok("a line is spoken in phrases (not one flat pass)", pr.length >= 3, JSON.stringify(pr));
  ok("pitch varies between a statement, a question and an exclamation", new Set(pr.map((x) => x[1])).size >= 3, JSON.stringify(pr));
  const mv = await p.evaluate(() => { window.__spoken.length = 0; FE.Voice.speak("Hello there.", { role: "maya", mood: "neutral" }); return null; });
  await p.waitForTimeout(500);
  const mp = await p.evaluate(() => window.__spoken[0].pitch);
  ok("Theo's voice is pitched lower than Maya's", pr[0][1] < mp, JSON.stringify([pr[0][1], mp]));
  ok("no console errors (narration)", p.__errs.length === 0, p.__errs.join("|"));
  await ctx.close();
}

/* ============ 3. Class Mode waits; Demo Mode runs through ============ */
if (want("class")) {
  const { ctx, page: p } = await fresh({ query: "?fast=12" });
  await start(p);
  await p.evaluate(() => FE.X.go(1, 2)); // Q1 answer (22 s timer)
  await p.waitForTimeout(600);
  const t0 = await p.evaluate(() => [FE.X.Tm.running, FE.X.Tm.total]);
  ok("class mode starts the speaking timer after narration", t0[0] === true && t0[1] === 22, JSON.stringify(t0));
  await p.waitForFunction(() => FE.X.Tm.done, null, { timeout: 15000 });
  ok("confetti and a cheer when the speaking time is up", await p.evaluate(() => document.querySelectorAll(".cf").length > 5));
  await p.waitForTimeout(1500);
  const pos = await p.evaluate(() => [FE.X.S.ci, FE.X.S.si]);
  ok("class mode stays on the step after the timer ends (waits for the teacher)", pos[0] === 1 && pos[1] === 2, JSON.stringify(pos));
  const wait = await p.evaluate(() => { FE.X.go(2, 0); return true; });
  await p.waitForTimeout(3000);
  ok("a step marked wait does not advance by itself", await p.evaluate(() => FE.X.S.ci === 2 && FE.X.S.si === 0));
  await ctx.close();
}
if (want("demo")) {
  const { ctx, page: p } = await fresh({ query: "?fast=40" });
  await p.evaluate(() => { localStorage.setItem("fe.childhood.prefs.v1", JSON.stringify({ demoSec: 5 })); });
  await p.reload(); await p.waitForTimeout(300);
  await start(p, "demo");
  const t0 = Date.now();
  const seen = new Set(), sampleLabels = [];
  let last = "";
  while (Date.now() - t0 < 240000) {
    const s = await p.evaluate(() => ({ ci: FE.X.S.ci, si: FE.X.S.si, id: FE.X.S.step.id, lab: !!document.querySelector(".bubble.sample .lab"), ribbon: !document.getElementById("ribbon").hidden, t: FE.X.chapters()[FE.X.S.ci].steps.length }));
    seen.add(s.id);
    if (s.lab) sampleLabels.push(s.id);
    if (s.ribbon !== true) sampleLabels.push("NORIBBON");
    last = s.id;
    if (s.ci === 9 && s.si === 6) break;
    await p.waitForTimeout(150);
  }
  const total = await p.evaluate(() => FE.X.chapters().reduce((a, c) => a + c.steps.length, 0));
  ok("demo mode reaches the final step on its own", last === "e-close", last + " after " + ((Date.now() - t0) / 1000).toFixed(0) + "s (fast x40)");
  ok("demo mode visited (almost) every step", seen.size >= total - 6, seen.size + "/" + total);
  ok("demo sample responses are labelled fictional", sampleLabels.length > 20 && !sampleLabels.includes("NORIBBON"), sampleLabels.length);
  ok("no console errors (demo)", p.__errs.length === 0, p.__errs.join("|"));
  const mem = await p.evaluate(() => ({ heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1, nodes: document.getElementsByTagName("*").length }));
  ok("memory stays modest after the full run (heap < 120 MB, DOM < 9000 nodes)", (mem.heap < 120) && mem.nodes < 9000, JSON.stringify(mem));
  await ctx.close();
}

/* ============ 4. controls bar: hide / show, state kept ============ */
if (want("bar")) {
  const { ctx, page: p } = await fresh({ query: "?fast=1" });
  await start(p);
  await p.evaluate(() => FE.X.go(3, 3)); // dilemma A discuss (55 s timer)
  await p.waitForTimeout(700);
  await p.evaluate(() => { FE.X.setRev(3, true); FE.X.D.scale.a1 = [2, 1, 0, 0, 0]; FE.X.D.notes = "keep me"; FE.X.Tm.start(); });
  await p.waitForTimeout(1200);
  const before = await p.evaluate(() => { const X = FE.X; return { ci: X.S.ci, si: X.S.si, rev: X.S.rev, left: X.Tm.left, running: X.Tm.running, scale: JSON.stringify(X.D.scale.a1), notes: X.D.notes, barH: document.getElementById("controlbar").getBoundingClientRect().height, stageH: document.getElementById("stagebox").getBoundingClientRect().height, paused: X.S.paused }; });
  ok("controls bar occupies space when shown", before.barH > 60, before.barH);
  await p.keyboard.press("h");
  await p.waitForTimeout(250);
  const after = await p.evaluate(() => { const X = FE.X; const bar = document.getElementById("controlbar"), sb = document.getElementById("showbar"); return { ci: X.S.ci, si: X.S.si, rev: X.S.rev, left: X.Tm.left, running: X.Tm.running, scale: JSON.stringify(X.D.scale.a1), notes: X.D.notes, barDisplay: getComputedStyle(bar).display, barH: bar.getBoundingClientRect().height, stageH: document.getElementById("stagebox").getBoundingClientRect().height, showVisible: !sb.hidden && sb.getBoundingClientRect().width > 0, showRect: sb.getBoundingClientRect().toJSON(), expanded: document.getElementById("cb-hide").getAttribute("aria-expanded"), paused: X.S.paused, vh: innerHeight, scroll: document.scrollingElement.scrollHeight }; });
  ok("H hides the bar and removes it from the layout", after.barDisplay === "none" && after.barH === 0, JSON.stringify([after.barDisplay, after.barH]));
  ok("hiding reclaims the space (the stage gets taller)", after.stageH > before.stageH + 50, `${before.stageH} -> ${after.stageH}`);
  ok("a small Show controls button remains, in a corner", after.showVisible && after.showRect.right > 1400 && after.showRect.bottom > 800 && after.showRect.width < 200, JSON.stringify(after.showRect));
  ok("hiding does not reset step, reveals, timer, choices, notes", after.ci === before.ci && after.si === before.si && after.rev === before.rev && after.running === true && after.left < before.left + 0.5 && after.scale === before.scale && after.notes === before.notes && after.paused === false, JSON.stringify([before, after]));
  ok("page does not scroll with the bar hidden", after.scroll <= after.vh + 1, JSON.stringify([after.scroll, after.vh]));
  // state kept over chapter change and reload
  await p.keyboard.press("Shift+ArrowRight"); await p.waitForTimeout(500);
  ok("hidden state survives a chapter change", await p.evaluate(() => getComputedStyle(document.getElementById("controlbar")).display === "none" && FE.X.S.ci === 4));
  // H must not fire while typing
  await p.click("#showbar"); await p.waitForTimeout(150);
  ok("Show controls button restores the bar", await p.evaluate(() => getComputedStyle(document.getElementById("controlbar")).display !== "none" && document.getElementById("cb-hide").getAttribute("aria-expanded") === "true"));
  await p.click("#cb-notes"); await p.waitForTimeout(200);
  await p.click('[data-nt="2"]'); await p.waitForTimeout(100);
  await p.focus("#notesTa"); await p.keyboard.type("hhh");
  const typed = await p.evaluate(() => ({ v: document.getElementById("notesTa").value, bar: getComputedStyle(document.getElementById("controlbar")).display, ae: document.activeElement.tagName }));
  ok("H is ignored while typing in a text box", typed.v.includes("hhh") && typed.bar !== "none", JSON.stringify(typed));
  await p.evaluate(() => FE.X.closeDrawer());
  // keyboard focus visibility + aria
  const aria = await p.evaluate(() => ({ hide: document.getElementById("cb-hide").getAttribute("aria-controls"), pressed: document.getElementById("cb-play").getAttribute("aria-pressed"), btnsNamed: [...document.querySelectorAll("#controlbar button")].every((b) => (b.getAttribute("aria-label") || b.textContent).trim().length > 0) }));
  ok("controls have accessible labels and aria-controls", aria.hide === "controlbar" && aria.btnsNamed, JSON.stringify(aria));
  await p.focus("#cb-next"); const outline = await p.evaluate(() => getComputedStyle(document.getElementById("cb-next")).outlineStyle); await p.keyboard.press("Tab"); await p.keyboard.press("Shift+Tab");
  const fo = await p.evaluate(() => { document.getElementById("cb-next").focus(); return getComputedStyle(document.getElementById("cb-next")).outlineWidth; });
  ok("keyboard focus shows an outline", parseFloat(fo) >= 2 || outline !== "none", fo + " " + outline);
  await p.reload(); await p.waitForTimeout(300);
  ok("(hide state) persisted across reload", await p.evaluate(() => JSON.parse(localStorage.getItem("fe.childhood.prefs.v1") || "{}").controlsHidden === false));
  await ctx.close();
}

/* ============ 5. layouts at several window sizes, bar shown and hidden, plus fullscreen ============ */
if (want("layout")) {
  const sizes = [[1280, 720], [1366, 768], [1536, 864], [1920, 1080], [1024, 768]];
  for (const [w, h] of sizes) {
    const { ctx, page: p } = await fresh({ viewport: { width: w, height: h } });
    await start(p);
    await p.evaluate(() => FE.X.go(3, 3)); await p.waitForTimeout(900);
    for (const hide of [false, true]) {
      await p.evaluate((hd) => FE.X.setBarHidden(hd), hide); await p.waitForTimeout(250);
      const g = await p.evaluate(() => { const sb = document.getElementById("stagebox").getBoundingClientRect(), vp = document.getElementById("viewport").getBoundingClientRect(); return { w: sb.width, h: sb.height, vw: vp.width, vh: vp.height, ratio: sb.width / sb.height, scrollH: document.scrollingElement.scrollHeight, scrollW: document.scrollingElement.scrollWidth, ih: innerHeight, iw: innerWidth }; });
      ok(`${w}x${h} ${hide ? "collapsed" : "expanded"}: stage stays 16:9 and fits without scrolling`, Math.abs(g.ratio - 16 / 9) < 0.01 && g.w <= g.vw + 1 && g.h <= g.vh + 1 && g.scrollH <= g.ih + 1 && g.scrollW <= g.iw + 1, JSON.stringify(g));
      const small = await p.evaluate(() => { const r = [...document.querySelectorAll("#panel .wt")].filter((e) => e.offsetParent && e.getBoundingClientRect().width).map((e) => parseFloat(getComputedStyle(e).fontSize) * FE.X.scale); return Math.min(...r); });
      if (hide && w === 1280) ok("1280x720 collapsed: visible panel text is at least ~15.5 px on screen", small >= 15.5, small.toFixed(1));
    }
    // simulated fullscreen: the fullscreenchange handler must re-fit and keep hidden state
    await p.evaluate(() => FE.X.setBarHidden(true));
    let fs = false;
    try { await p.evaluate(() => document.documentElement.requestFullscreen()); await p.waitForTimeout(500); fs = await p.evaluate(() => !!document.fullscreenElement); } catch (e) {}
    const f = await p.evaluate(() => { const sb = document.getElementById("stagebox").getBoundingClientRect(); return { ratio: sb.width / sb.height, hidden: getComputedStyle(document.getElementById("controlbar")).display === "none", w: sb.width, iw: innerWidth, ih: innerHeight, h: sb.height }; });
    ok(`${w}x${h} fullscreen${fs ? "" : " (not supported headless; handler path)"}: stage fits, 16:9, bar still hidden`, Math.abs(f.ratio - 16 / 9) < 0.01 && f.hidden && f.w <= f.iw + 1 && f.h <= f.ih + 1, JSON.stringify(f));
    if (fs) { await p.evaluate(() => document.exitFullscreen()); await p.waitForTimeout(300); }
    ok(`${w}x${h} no console errors`, p.__errs.length === 0, p.__errs.join("|"));
    await ctx.close();
  }
}

/* ============ 6. dictionary on double-click ============ */
if (want("dict")) {
  const { ctx, page: p } = await fresh();
  await start(p);
  await p.evaluate(() => FE.X.go(2, 1)); await p.waitForTimeout(1200);
  await p.evaluate(() => { window.__spoken.length = 0; });
  const target = await p.$('#panel .pquote .wu[data-w="imagination"], #panel .pquote .wu[data-w="childhood"]');
  await target.dblclick();
  await p.waitForSelector("#popover:not([hidden])", { timeout: 3000 });
  const pop = await p.evaluate(() => ({ word: document.querySelector("#popover .pw .wt").textContent, ipa: document.querySelector("#popover .pw .wi").textContent, def: !!document.querySelector("#popover .def .wu"), ex: !!document.querySelector("#popover .exs .wu"), noIpa: document.querySelectorAll("#popover .wu.noipa").length, buttons: document.querySelectorAll("#popover [data-dp]").length }));
  ok("double-click opens a popover with the word, IPA, meaning and example", pop.def && pop.ex && /\//.test(pop.ipa) && pop.noIpa === 0, JSON.stringify(pop));
  await p.waitForTimeout(1500);
  const heard = await p.evaluate(() => window.__spoken.map((s) => s.text));
  ok("the popover speaks the word, then the meaning, then the example", heard.length >= 3, JSON.stringify(heard));
  await p.keyboard.press("Escape");
  ok("Esc closes the popover", await p.evaluate(() => document.getElementById("popover").hidden));
  // phrase recognition and a control label
  await p.evaluate(() => FE.X.go(2, 10)); await p.waitForTimeout(1200); // grow up: meaning step
  const grow = await p.$('#panel .pword .wu');
  await grow.dblclick(); await p.waitForTimeout(300);
  const ph = await p.evaluate(() => document.querySelector("#popover .pw").textContent);
  ok("phrases are recognised (grow up)", /grow/i.test(ph) && /up/i.test(ph), ph);
  await p.keyboard.press("Escape");
  const lbl = await p.$("#cb-replay .wu");
  await lbl.dblclick(); await p.waitForTimeout(300);
  ok("control-bar labels have definitions too", await p.evaluate(() => !document.getElementById("popover").hidden && !!document.querySelector("#popover .def .wu")));
  await p.keyboard.press("Escape");
  ok("no console errors (dictionary)", p.__errs.length === 0, p.__errs.join("|"));
  await ctx.close();
}

/* ============ 7. widgets: scale, ranking, plan, wyr, rubric, exports, local save, reset ============ */
if (want("widgets")) {
  const { ctx, page: p } = await fresh();
  await start(p);
  await p.evaluate(() => FE.X.go(4, 3)); await p.waitForTimeout(1200); // a1-choose
  await p.evaluate(() => FE.X.setRev(1, true));
  const b = await p.$$("#panel .scale .sbtn");
  await b[1].click(); await b[1].click(); await b[3].click();
  await b[1].click({ modifiers: ["Shift"] });
  const sc = await p.evaluate(() => FE.X.D.scale.a1);
  ok("opinion scale counts by click and shift-click removes", JSON.stringify(sc) === JSON.stringify([0, 1, 0, 1, 0]), JSON.stringify(sc));
  ok("scale offers five choices (strongly agree … strongly disagree)", b.length === 5);
  // ranking
  await p.evaluate(() => FE.X.go(5, 3)); await p.waitForTimeout(1300);
  const order0 = await p.evaluate(() => [...document.querySelectorAll("#panel .rcard")].map((c) => c.dataset.id));
  await p.click('#panel .rcard[data-id="creativity"] [data-mv="down"]');
  const order1 = await p.evaluate(() => FE.X.D.rank.slice());
  ok("ranking: Move down button works", order1[1] === "creativity" && order0[0] === "creativity", JSON.stringify([order0, order1]));
  await p.focus('#panel .rcard[data-id="independence"]'); await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowUp");
  const order2 = await p.evaluate(() => FE.X.D.rank.slice());
  ok("ranking: keyboard arrows move the focused card", order2[0] === "independence", JSON.stringify(order2));
  const card = await p.$('#panel .rcard[data-id="cooperation"]'); const bx = await card.boundingBox();
  await p.mouse.move(bx.x + 30, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + 30, bx.y - 200, { steps: 8 }); await p.mouse.up();
  const order3 = await p.evaluate(() => FE.X.D.rank.slice());
  ok("ranking: dragging moves a card", order3.indexOf("cooperation") < order2.indexOf("cooperation"), JSON.stringify([order2, order3]));
  await p.click('[data-rt="top"]');
  ok("ranking: Top two marks the first two", await p.evaluate(() => document.querySelectorAll("#panel .rcard.top").length === 2));
  // mystery clues
  await p.evaluate(() => FE.X.go(6, 1)); await p.waitForTimeout(1300);
  const cl0 = await p.evaluate(() => ({ clues: [...document.querySelectorAll("#panel .clue")].filter((e) => e.offsetParent).length, ans: !!(document.querySelector("#panel .answer") && document.querySelector("#panel .answer").offsetParent) }));
  ok("mystery clues start with two visible and the answer hidden", cl0.clues === 2 && !cl0.ans, JSON.stringify(cl0));
  await p.evaluate(() => FE.X.setRev(5, true));
  const cl1 = await p.evaluate(() => ({ clues: [...document.querySelectorAll("#panel .clue")].filter((e) => e.offsetParent).length, ans: !!(document.querySelector("#panel .answer") && document.querySelector("#panel .answer").offsetParent) }));
  ok("revealing shows all four clues and the answer", cl1.clues === 4 && cl1.ans, JSON.stringify(cl1));
  // story cards
  await p.evaluate(() => FE.X.go(7, 1)); await p.waitForTimeout(1300);
  ok("story spinner starts with four face-down cards", await p.evaluate(() => [...document.querySelectorAll("#panel .scard .back")].filter((e) => e.offsetParent).length === 4));
  await p.click('#panel [data-draw="next"]'); await p.click('#panel [data-draw="next"]');
  const t0 = await p.evaluate(() => [...document.querySelectorAll("#panel .scard .front")].filter((e) => e.offsetParent).map((e) => e.querySelector(".st").textContent));
  ok("drawing reveals one card at a time (two drawn = two faces up)", t0.length === 2 && t0.every(Boolean), JSON.stringify(t0));
  await p.click('#panel [data-draw="again"]');
  const t1 = await p.evaluate(() => [...document.querySelectorAll("#panel .scard .front")].filter((e) => e.offsetParent).map((e) => e.querySelector(".st").textContent));
  ok("Draw again replaces the latest card with a different one", t1.length === 2 && t1[0] === t0[0] && t1[1] !== t0[1], JSON.stringify([t0, t1]));
  // memory jar and stars
  await p.keyboard.press("j"); await p.waitForTimeout(1300);
  await p.click("#cb-star"); await p.waitForTimeout(1300);
  ok("J and the Star button add stars to the memory jar", await p.evaluate(() => FE.X.D.stars === 2 && document.getElementById("jarcount").textContent === "2"), await p.evaluate(() => FE.X.D.stars));
  await p.evaluate(() => { FE.X.D.stars = 19; FE.X.updateJar(); }); await p.keyboard.press("j"); await p.waitForTimeout(1500);
  ok("a full jar glows and celebrates", await p.evaluate(() => document.getElementById("jar").classList.contains("full") && document.querySelectorAll(".cf").length > 10));
  // would you rather
  await p.evaluate(() => FE.X.go(8, 2)); await p.waitForTimeout(1300);
  const w = await p.$$("#panel .wopt"); await w[0].click(); await w[0].click(); await w[1].click();
  await p.evaluate(() => FE.X.setRev(1, true)); await (await p.$$("#panel .wopt"))[1].click();
  const wy = await p.evaluate(() => JSON.stringify(FE.X.D.wyr));
  ok("would-you-rather tallies before and after the twist", /"y1a":\[2,1\]/.test(wy) && /"y1b":\[0,1\]/.test(wy), wy);
  // rubric
  await p.evaluate(() => FE.X.go(9, 4)); await p.waitForTimeout(1200);
  await p.click('#panel [data-rc="0"][data-rl="3"]');
  ok("rubric is operated by the teacher (clarity=3)", await p.evaluate(() => FE.X.D.rubric[1][0] === 3));
  ok("rubric says it is not automatic assessment", await p.evaluate(() => /Teacher observation only/.test([...document.querySelectorAll("#panel .rubric .wt")].map((e) => e.textContent).join(" "))));
  // notes drawer and exports
  await p.click("#cb-notes"); await p.waitForTimeout(150);
  await p.click('[data-nt="1"]'); await p.click('[data-mk="1,0,1"]'); await p.click('[data-mk="1,0,1"]');
  ok("participation marks count", await p.evaluate(() => FE.X.D.marks[1][0] === 2));
  await p.click('[data-nt="3"]');
  ok("nothing is saved by default", await p.evaluate(() => localStorage.getItem("fe.childhood.data.v1") === null));
  const [dl] = await Promise.all([p.waitForEvent("download"), p.click('[data-exp="json"]')]);
  const jsonTxt = fs.readFileSync(await dl.path(), "utf8"); const jo = JSON.parse(jsonTxt);
  ok("JSON export has the teacher data and says it is not automatic assessment", jo.participationMarks["1"][0] === 2 && /not automatic/i.test(jo.note) && jo.opinionScale.a1[1] === 1, jsonTxt.slice(0, 120));
  const [dl2] = await Promise.all([p.waitForEvent("download"), p.click('[data-exp="csv"]')]);
  const csv = fs.readFileSync(await dl2.path(), "utf8");
  ok("CSV export has rows", /section,item,field,value/.test(csv) && /participation marks \(teacher\)/.test(csv), csv.slice(0, 100));
  await p.click("#saveChk");
  ok("opt-in local save writes only to this browser", await p.evaluate(() => localStorage.getItem("fe.childhood.data.v1") !== null));
  await p.click("#resetAll"); await p.waitForTimeout(100); ok("reset needs a second press", await p.evaluate(() => FE.X.D.marks[1] && FE.X.D.marks[1][0] === 2));
  await p.click("#resetAll"); await p.waitForTimeout(300);
  ok("reset clears notes, marks, tallies and the saved copy", await p.evaluate(() => Object.keys(FE.X.D.marks).length === 0 && FE.X.D.scale.a1 === undefined && localStorage.getItem("fe.childhood.data.v1") === null));
  ok("no console errors (widgets)", p.__errs.length === 0, p.__errs.join("|"));
  await ctx.close();
}

/* ============ 8. reduced motion + no-voice fallback + word banks ============ */
if (want("misc")) {
  const { ctx, page: p } = await fresh({ reducedMotion: "reduce" });
  await start(p);
  ok("prefers-reduced-motion is respected", await p.evaluate(() => document.getElementById("app").classList.contains("reduce-motion")));
  await ctx.close();
  const n = await fresh({ mock: false });
  await start(n.page);
  await n.page.waitForTimeout(2500);
  const st = await n.page.evaluate(() => ({ voices: FE.Voice.voices.length, bubble: !document.getElementById("bubble").hidden || FE.X.S.si > 0 }));
  ok("without any voice the lesson still runs on captions", st.voices === 0 && st.bubble, JSON.stringify(st));
  await n.page.click("#cb-settings"); await n.page.waitForTimeout(150);
  ok("settings explain that no voice is available", await n.page.evaluate(() => /No English voice/.test([...document.querySelectorAll("#drawer .wt")].map((e) => e.textContent).join(" "))));
  await n.page.click('[data-m="script"]'); await n.page.waitForTimeout(200);
  ok("a usable narration script is available", await n.page.evaluate(() => document.querySelectorAll(".script-line").length > 40));
  await n.page.keyboard.press("Escape");
  await n.page.click("#cb-words"); await n.page.waitForTimeout(150);
  const bank0 = await n.page.evaluate(() => document.querySelectorAll("#drawer .bank-words .chip").length);
  await n.page.click("#drawer [data-bm]");
  const bank1 = await n.page.evaluate(() => document.querySelectorAll("#drawer .bank-words .chip").length);
  ok("word banks reveal three words at a time", bank0 === 3 && bank1 === 6, `${bank0} -> ${bank1}`);
  const words = await n.page.evaluate(() => FE.LESSON.bank.map((c) => c.w.length));
  ok("word banks hold 7, 7, 8 and 5 items", JSON.stringify(words) === "[7,7,8,5]", JSON.stringify(words));
  ok("no console errors (misc)", n.page.__errs.length === 0, n.page.__errs.join("|"));
  await n.ctx.close();
}

/* ============ 9. content checks ============ */
if (want("content")) {
  const { ctx, page: p } = await fresh();
  const r = await p.evaluate(() => {
    const L = FE.LESSON, all = JSON.stringify(L.chapters), out = {};
    out.vocab = ["childhood", "imagination", "independent", "grow up", "look back on"].map((w) => all.includes('"' + w + '"') || all.includes(w));
    out.claims = ["Children need more free play than organized activities.", "Having chores helps children become independent.".replace("become independent", "become more independent"), "Childhood friendships can be just as important as friendships made later.", "Technology gives children more opportunities to be creative."].map((t) => all.includes(t));
    out.warm = ["What games or activities did you enjoy when you were younger?", "What did you use to do after school or during your free time?", "What is something you liked as a child but feel differently about now?", "What do you think has changed most about childhood?"].map((t) => all.includes(t));
    out.exprs = ["I see your point, but", "In some situations", "One example would be", "I would prioritize", "This matters because", "Did you use to", "Where did you keep it", "What was it made of", "At first", "After that", "In the end", "I'd rather"].map((t) => all.includes(t));
    out.wyr = ["play your favorite childhood game again", "watch your favorite childhood show again", "invent a new playground game", "design a new board game", "revisit a childhood place as it was then", "see how it has changed today", "keep one meaningful childhood object", "preserve one childhood story in a book"].map((t) => all.includes(t));
    out.dil = ["Make the teams uneven", "Hide the damage", "Vote, and the majority decides"].map((t) => all.includes(t));
    out.pass = (all.match(/pass/gi) || []).length;
    out.keep = all.includes("Keep speaking. Keep growing.") || FE.S.tagline === "Keep Speaking. Keep Growing.";
    out.qual = L.QUALITIES.map((q) => q.w).join();
    out.opts = L.chapters[3].steps.filter((s) => s.panel && s.panel.blocks).map((s) => s.panel.blocks.filter((b) => b.k === "opts").map((b) => b.items.length)).flat();
    out.twists = L.chapters[3].steps.filter((s) => /twist/.test(s.id)).length;
    out.revise = L.chapters[3].steps.filter((s) => /revise/.test(s.id)).length;
    out.facts = true;
    // no scoring of opinions: no 'score', 'correct' used for opinion steps outside vocabulary check
    out.noScore = !/correct answer|you scored|points for/i.test(all.replace(/Which sentence is about childhood|Which question is natural/g, ""));
    return out;
  });
  ok("five core words present", r.vocab.every(Boolean), JSON.stringify(r.vocab));
  ok("four agree/disagree claims verbatim", r.claims.every(Boolean), JSON.stringify(r.claims));
  ok("four warm-up questions verbatim", r.warm.every(Boolean), JSON.stringify(r.warm));
  ok("all required functional expressions are offered", r.exprs.every(Boolean), JSON.stringify(r.exprs));
  ok("four would-you-rather pairs verbatim", r.wyr.every(Boolean), JSON.stringify(r.wyr));
  ok("dilemma options present, four per situation", r.opts.length === 3 && r.opts.every((n) => n === 4), JSON.stringify(r.opts));
  ok("each dilemma has a twist and a revise step", r.twists === 3 && r.revise === 3);
  ok("exit line 'Keep Speaking. Keep Growing.' present", r.keep);
  ok("qualities are creativity, friendship, independence, cooperation", r.qual === "Creativity,Friendship,Independence,Cooperation", r.qual);
  ok("pass options are mentioned in the content", r.pass >= 4, r.pass);
  ok("opinions are never scored", r.noScore);
  const g = await p.evaluate(() => ({ titles: FE.LESSON.chapters.map((c) => c.title), rp: /roleplay|role-play|Organizer/i.test(JSON.stringify(FE.LESSON.chapters)), theo: FE.Art.adult("theo"), maya: FE.Art.adult("maya"), deck: Object.values(FE.LESSON.storyDeck).map((d) => d.length) }));
  ok("the roleplay chapters are gone (replaced by two games)", !g.rp && !g.titles.some((t) => /roleplay/i.test(t)) && /mystery/i.test(g.titles[6]) && /story/i.test(g.titles[7]), JSON.stringify(g.titles));
  ok("story deck has six cards in each of four categories", JSON.stringify(g.deck) === "[6,6,6,6]", JSON.stringify(g.deck));
  ok("Theo is drawn with a masculine build and a beard; Maya is not", /person[^"]*bearded[^"]*male|person[^"]*male[^"]*bearded/.test(g.theo.slice(0, 200)) && !/male/.test(g.maya.slice(0, 120)), g.theo.slice(0, 120));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
fs.writeFileSync(path.resolve(here, "test-results.json"), JSON.stringify(results, null, 1));
process.exit(failed.length ? 1 : 0);
