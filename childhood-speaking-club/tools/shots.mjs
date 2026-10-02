// screenshots of every step (paused), at a chosen size; optional full reveal.
//   node tools/shots.mjs <outdir> [w] [h] [reveal=0|1] [chapter filter e.g. 3] [hide=0|1]
import { chromium } from "playwright-core";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const [out, w = 1600, h = 900, reveal = "0", only = "", hide = "0"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("file://" + path.resolve(here, "../index.html"));
await p.waitForTimeout(400);
await p.click('[data-start="class"]');
await p.waitForTimeout(400);
if (hide === "1") await p.evaluate(() => FE.X.setBarHidden(true));
const chapters = await p.evaluate(() => FE.X.chapters().map((c) => c.steps.map((s) => s.id)));
for (let ci = 0; ci < chapters.length; ci++) {
  if (only && String(ci + 1) !== only) continue;
  for (let si = 0; si < chapters[ci].length; si++) {
    await p.evaluate(([c, s]) => { FE.X.S.paused = true; return FE.X.go(c, s); }, [ci, si]);
    await p.waitForTimeout(si === 0 ? 1300 : 900);
    // show the first narration line as a teacher would see it
    await p.evaluate((rv) => {
      const X = FE.X, st = X.S.step;
      if (rv === "1") X.setRev(X.S.revMax, true);
      const l = (st.say && st.say[0]) || (st.sample && [st.sample[0][0], st.sample[0][1]]);
      if (l && !st.silent) { const u = Array.isArray(l) ? { who: l[0], t: l[1] } : l; X.lineMoodApply(u.who, l[2], l[3]); X.showBubble(u.who, u.t, {}); }
      if (st.timer) { /* ring shows idle */ }
    }, reveal);
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${out}/c${String(ci + 1).padStart(2, "0")}-${String(si + 1).padStart(2, "0")}-${chapters[ci][si]}.png` });
  }
}
console.log("errors:", errs.slice(0, 10));
await b.close();
