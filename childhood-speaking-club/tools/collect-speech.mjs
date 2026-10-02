// Lists every line the lesson can speak (narration, samples, examples, cheers, auditions, dictionary words/meanings/examples)
// so natural recordings can be generated for exactly those lines.   node tools/collect-speech.mjs -> tools/speech-lines.json
import { chromium } from "playwright-core";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto("file://" + path.resolve(here, "../index.html") + "?fast=40");
await p.waitForTimeout(500);
await p.evaluate(() => {
  window.__sp = [];
  const V = FE.Voice, orig = V.speak;
  V.speak = function (t, o) { window.__sp.push({ role: (o && o.role) || "maya", mood: (o && o.mood) || "", text: t }); return orig.apply(V, arguments); };
});
// 1. a hands-free demo run visits every narration + sample line
await p.click('[data-start="demo"]');
await p.waitForFunction(() => FE.X.S.ci === FE.X.chapters().length - 1 && FE.X.S.si >= FE.X.chapters()[FE.X.S.ci].steps.length - 1, null, { timeout: 280000 }).catch(() => {});
await p.waitForTimeout(1500);
const demo = await p.evaluate(() => window.__sp.length);
// 2. every step, statically: say, sample, example, data-say buttons at full reveal
const extra = await p.evaluate(async () => {
  const X = FE.X, out = [];
  const add = (role, text, mood) => out.push({ role, mood: mood || "", text: FE.plain(text) });
  X.S.paused = true;
  const chapters = X.chapters();
  for (let ci = 0; ci < chapters.length; ci++) for (let si = 0; si < chapters[ci].steps.length; si++) {
    const st = chapters[ci].steps[si];
    (st.say || []).forEach((l) => (Array.isArray(l) ? add(l[0], l[1], l[2]) : add(l.who, l.t, l.mood)));
    (st.sample || []).forEach((l) => add(l[0], l[1], ""));
    if (st.example) add(st.example[0], FE.plain(st.example[1]).replace(/[“”]/g, ""));
    await X.go(ci, si); X.setRev(X.S.revMax, true);
    document.querySelectorAll("[data-say]").forEach((e) => add(e.dataset.role || "maya", e.dataset.say));
  }
  FE.S.cheers.forEach((c, i) => add(i % 2 ? "theo" : "maya", c, "grin"));
  FE.S.cheers.forEach((c) => { add("maya", c, "grin"); add("theo", c, "grin"); });
  ["maya", "theo", "alex", "jordan"].forEach((r) => add(r, FE.S.hello + " " + FE.S.sRoles[r] + ". " + FE.S.audLine));
  add("maya", FE.S.welcomeTest);
  return out;
});
// 3. dictionary: word, meaning, example (Maya reads these)
const dict = await p.evaluate(() => {
  const out = [];
  Object.keys(FE.LEX_DEF).forEach((k) => { const e = FE.LEX_DEF[k]; out.push({ k, word: FE.plain(k), def: FE.plain(e.def), ex: FE.plain(e.ex) }); });
  return out;
});
const all = await p.evaluate((n) => window.__sp.slice(0, n), demo);
const seen = new Map();
for (const l of [...all, ...extra]) {
  const text = l.text.replace(/\s+/g, " ").trim();
  if (!text) continue;
  const key = l.role + "|" + text;
  if (!seen.has(key)) seen.set(key, { role: l.role, text, mood: l.mood || "" });
  else if (!seen.get(key).mood && l.mood) seen.get(key).mood = l.mood;
}
const lines = [...seen.values()];
fs.writeFileSync(path.join(here, "speech-lines.json"), JSON.stringify({ lines, dict }, null, 1));
const chars = lines.reduce((n, l) => n + l.text.length, 0);
const roles = {}; lines.forEach((l) => (roles[l.role] = (roles[l.role] || 0) + 1));
console.log("demo calls", demo, "| narration lines", lines.length, "characters", chars, JSON.stringify(roles), "| dictionary entries", dict.length, "| errors", JSON.stringify(errs));
await b.close();
