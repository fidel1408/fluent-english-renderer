import { createRequire } from "module"; const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");
import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const pg = await b.newPage({ viewport: { width: 1280, height: 1000 } });
pg.on("console", m => console.log("[page]", m.text())); pg.on("pageerror", e => console.log("[ERR]", e.message));
await pg.goto("file://" + path.join(here, "..", "index.html"));
await pg.waitForTimeout(1500);
await pg.screenshot({ path: "/tmp/live_idle.png" });
console.log("voices:", await pg.evaluate(() => FE.Speech.voices.length), await pg.evaluate(() => document.getElementById("voiceStatus").innerText));
await pg.click("#bStart");
const t0 = Date.now(); let lastBeat = "";
while (Date.now() - t0 < 45000) {
  const st = await pg.evaluate(() => ({ s: FE.Player.state, id: FE.Player.beat().id, el: FE.Player.elapsed() }));
  if (st.id !== lastBeat) { console.log(((Date.now() - t0) / 1000).toFixed(1), st.id, st.el.toFixed(1)); lastBeat = st.id; }
  if (st.id === "pause" && !globalThis.shot1) { globalThis.shot1 = 1; await pg.screenshot({ path: "/tmp/live_pause.png" }); }
  if (st.s === "ended") break; await pg.waitForTimeout(100);
}
console.log("ended after", ((Date.now() - t0) / 1000).toFixed(1), "s");
await pg.screenshot({ path: "/tmp/live_end.png" });
await b.close();
