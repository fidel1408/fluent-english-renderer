// Geometry checks for every step and every reveal level (in stage coordinates).
//   node tools/check.mjs [w] [h]
import { chromium } from "playwright-core";
import path from "path";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const [w = 1600, h = 900] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("file://" + path.resolve(here, "../index.html"));
await p.waitForTimeout(300);
await p.click('[data-start="class"]');
await p.waitForTimeout(300);
const dims = await p.evaluate(() => FE.X.chapters().map((c) => c.steps.length));
const problems = [];
const inspect = () => p.evaluate(() => {
  const X = FE.X, st = document.getElementById("stage").getBoundingClientRect(), s = X.scale;
  const R = (el) => { if (!el || el.hidden) return null; const r = el.getBoundingClientRect(); if (!r.width) return null; return { x: (r.left - st.left) / s, y: (r.top - st.top) / s, w: r.width / s, h: r.height / s }; };
  const out = { issues: [] };
  const panel = document.getElementById("panel");
  const pr = R(panel);
  if (pr) {
    if (panel.scrollHeight > panel.clientHeight + 2) out.issues.push("panel overflow " + panel.scrollHeight + ">" + panel.clientHeight);
    if (pr.y + pr.h > 990) out.issues.push("panel bottom " + Math.round(pr.y + pr.h));
    if (pr.x + pr.w > 1875 || pr.x < 40) out.issues.push("panel x " + Math.round(pr.x));
    // any child clipped horizontally
    panel.querySelectorAll(".on, :not([data-rv])").forEach((c) => { if (c.scrollWidth > c.clientWidth + 3 && getComputedStyle(c).overflow !== "visible") out.issues.push("child x-overflow " + c.className); });
  }
  const bub = document.getElementById("bubble"), br = R(bub);
  if (br) {
    if (br.x < 8 || br.x + br.w > 1912 || br.y < 120 || br.y + br.h > 1050) out.issues.push("bubble off-stage " + JSON.stringify([br.x, br.y, br.w, br.h].map(Math.round)));
    const logo = { x: 36, y: 22, w: 300, h: 150 }, hudr = { x: 1500, y: 20, w: 380, h: 150 };
    const hit = (a, c) => a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y;
    if (hit(br, logo)) out.issues.push("bubble over logo");
    if (hit(br, hudr)) out.issues.push("bubble over HUD");
    if (pr && hit(br, pr)) out.issues.push("bubble over panel");
    const vg = R(document.getElementById("vig")); if (vg && hit(br, vg)) out.issues.push("bubble over vignette");
    Object.values(X.actors).forEach((a) => {
      const hd = a.person.querySelector(".head ellipse:nth-of-type(3)"); const hr = R(hd);
      if (hr && hit({ x: br.x, y: br.y, w: br.w, h: br.h }, { x: hr.x + 8, y: hr.y + 8, w: hr.w - 16, h: hr.h - 16 })) out.issues.push("bubble over face of " + a.id);
    });
    const av = R(document.getElementById("avatar")); if (av && hit(br, av)) out.issues.push("bubble over avatar");
  }
  // actors hidden by the panel (adult guides should stay visible when on stage)
  Object.values(X.actors).forEach((a) => {
    const hr = R(a.person.querySelector(".head ellipse:nth-of-type(3)")); if (!hr) return;
    if (a.el.classList.contains("gone")) return;
    if (pr && hr.x < pr.x + pr.w && hr.x + hr.w > pr.x && hr.y < pr.y + pr.h && hr.y + hr.h > pr.y) out.issues.push("face of " + a.id + " under panel");
    
  });
  return out;
});
for (let ci = 0; ci < dims.length; ci++) {
  for (let si = 0; si < dims[ci]; si++) {
    await p.evaluate(([c, s]) => { FE.X.S.paused = true; return FE.X.go(c, s); }, [ci, si]);
    await p.waitForTimeout(si === 0 ? 1300 : 800);
    const info = await p.evaluate(() => { const X = FE.X, st = X.S.step; return { id: st.id, revMax: X.S.revMax, rev: X.S.rev, say: (st.say || []).map((l) => (Array.isArray(l) ? [l[0], l[1]] : [l.who, l.t])), sample: (st.sample || []).map((l) => [l[0], l[1]]) }; });
    // reveal levels
    for (let r = info.rev; r <= info.revMax; r++) {
      await p.evaluate((r) => FE.X.setRev(r, true), r);
      await p.waitForTimeout(60);
      const res = await inspect();
      res.issues.filter((i) => !/^bubble/.test(i) && !/face of/.test(i)).forEach((i) => problems.push(`c${ci + 1} ${info.id} rev${r}: ${i}`));
    }
    await p.evaluate((rm) => FE.X.setRev(rm, true), info.revMax);
    for (const [who, text] of [...info.say, ...info.sample]) {
      await p.evaluate(([w, t]) => FE.X.showBubble(w, t, {}), [who, text]);
      await p.waitForTimeout(260);
      const res = await inspect();
      res.issues.filter((i) => /^bubble|face of/.test(i)).forEach((i) => problems.push(`c${ci + 1} ${info.id} "${text.slice(0, 40)}": ${i}`));
    }
    await p.evaluate(() => FE.X.hideBubble());
  }
}
console.log("problems:", problems.length);
console.log(problems.join("\n"));
console.log("errors:", errs.slice(0, 5));
await b.close();
