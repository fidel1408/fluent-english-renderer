// Visits every step / reveal state / overlay in a real browser and records every displayed word.
//   node tools/crawl.mjs      -> tools/displayed-words.json
import { chromium } from "playwright-core";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const url = "file://" + path.resolve(here, "../index.html");
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(url);
await p.waitForTimeout(500);
const words = {};
const noipa = {};
async function collect(label) {
  const r = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll(".wu[data-w]").forEach((u) => out.push([u.dataset.w, u.classList.contains("noipa")]));
    return out;
  });
  for (const [w, n] of r) { words[w] = (words[w] || 0) + 1; if (n) noipa[w] = label; }
}
await collect("start");
await p.click('[data-start="class"]');
await p.waitForTimeout(600);
await p.evaluate(() => {
  const X = FE.X;
  X.D.scale.a1 = [1, 2, 1, 0, 1]; X.D.scale.a2 = [1, 0, 0, 0, 1]; X.D.scale.a3 = [0, 1, 0, 0, 0]; X.D.scale.a4 = [0, 0, 1, 0, 0];
  X.D.wyr.y1a = [1, 1]; X.D.wyr.y1b = [1, 0]; X.D.wyr.y2a = [2, 0]; X.D.wyr.y3a = [0, 1]; X.D.wyr.y4b = [1, 1];
  X.D.reflect = { "used to": 1, "grow up": 2 }; X.D.marks[1] = [1, 0, 1, 0];
  X.D.rubric[1] = { 0: 3, 1: 2 };
  X.D.plan.slots[0] = { a: "tag", m: 20 }; X.D.plan.backup = "drawing";
  X.D.notes = "";
});
const chapters = await p.evaluate(() => FE.X.chapters().map((c) => c.steps.length));
for (let ci = 0; ci < chapters.length; ci++) {
  for (let si = 0; si < chapters[ci]; si++) {
    await p.evaluate(([c, s]) => { FE.X.S.paused = true; return FE.X.go(c, s); }, [ci, si]);
    await p.waitForTimeout(ci === 0 || si === 0 ? 750 : 500);
    await p.evaluate(() => { const X = FE.X; X.setRev(X.S.revMax, true); document.querySelectorAll(".opts .opt").forEach((o) => o.classList.add("open")); });
    await collect(`c${ci + 1}s${si + 1}`);
    // bubble lines (narration + samples + examples)
    const lines = await p.evaluate(() => {
      const st = FE.X.S.step, out = [];
      (st.say || []).forEach((l) => out.push(Array.isArray(l) ? [l[0], l[1]] : [l.who, l.t]));
      (st.sample || []).forEach((l) => out.push([l[0], l[1], true]));
      return out;
    });
    for (const [who, text, sample] of lines) {
      await p.evaluate(([w, t, s]) => FE.X.showBubble(w, t, { sample: s, label: s ? FE.S.sampleTag : null }), [who, text, sample]);
      await collect(`say c${ci + 1}s${si + 1}`);
    }
    await p.evaluate(() => FE.X.hideBubble());
    for (const kind of ["starters", "example"]) {
      const ok = await p.evaluate((k) => { const st = FE.X.S.step; if (k === "starters" ? !st.starters : !st.example) return false; FE.X.toggleTray(k); return true; }, kind);
      if (ok) { await p.waitForTimeout(80); await collect(kind + ` c${ci + 1}s${si + 1}`); await p.evaluate(() => { FE.X.closeTray(); FE.Voice.cancel(); }); }
    }
  }
}
// overlays
async function overlay(name, fn, arg) { await p.evaluate(fn, arg); await p.waitForTimeout(150); await collect(name); }
await overlay("plan", () => FE.X.openModal("plan"));
for (let i = 0; i < chapters.length; i++) await overlay("plan" + i, (n) => document.querySelector(`[data-pc="${n}"]`).click(), i);
for (const m of ["script", "chart", "about", "help"]) await overlay(m, (k) => FE.X.openModal(k), m);
await p.evaluate(() => FE.X.closeModal());
for (const t of [0, 1, 2, 3]) { await p.evaluate((t) => { FE.X.closeDrawer(); FE.X.openDrawer("notes"); document.querySelector(`[data-nt="${t}"]`).click(); }, t); await p.waitForTimeout(100); await collect("notes" + t); }
await p.evaluate(() => { FE.X.closeDrawer(); FE.X.openDrawer("settings"); }); await collect("settings");
await p.evaluate(() => { FE.X.closeDrawer(); FE.X.openDrawer("words"); for (let k = 0; k < 4; k++) FE.X.bankState.shown[k] = 99; });
for (let k = 0; k < 4; k++) { await p.evaluate((k) => { FE.X.bankState.tab = k; FE.X.refreshBank(); }, k); await p.waitForTimeout(60); await collect("words" + k); }
await p.evaluate(() => FE.X.closeDrawer());
fs.writeFileSync(path.resolve(here, "displayed-words.json"), JSON.stringify(Object.fromEntries(Object.entries(words).sort()), null, 0));
console.log("distinct displayed words:", Object.keys(words).length);
console.log("shown without IPA:", Object.keys(noipa).join(" "));
console.log("errors:", errs.slice(0, 10));
await b.close();
