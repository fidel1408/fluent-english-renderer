// Render still frames of the video at given times: node tools/still.mjs <outDir> <cc 0|1|2> <T> [T...]
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");
const [outDir, cc, ...ts] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const page0 = join(dirname(fileURLToPath(import.meta.url)), "..", "video", "index.html");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[page]", m.text()); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(pathToFileURL(page0).href + "?clean=1");
await page.waitForFunction(() => window.FE && FE.player && FE.lockupImg);
for (const t of ts) {
  const url = await page.evaluate(([t, cc]) => {
    const cv = document.getElementById("cv"); const ctx = cv.getContext("2d");
    const P = FE.player; P.state = "idle";
    const T = parseFloat(t);
    // find caption for this T (virtual): active cue window
    let cap = null;
    FE.CUES.forEach((c) => { const e = c.at + FE.cueEst(c); if (T >= c.at && T < e + 0.3) cap = { runs: c.caption, alpha: 1 }; });
    let sp = false;
    FE.CUES.forEach((c) => { if (T >= c.at && T < c.at + FE.cueEst(c) && c.segs.some((s) => s.lang === "en")) sp = false; });
    FE.renderFrame(ctx, { T, W: T, cc: +cc, speakingEn: false, caption: cap });
    return cv.toDataURL("image/jpeg", 0.9);
  }, [t, cc]);
  writeFileSync(join(outDir, `f_${cc}_${String(t).replace(".", "_")}.jpg`), Buffer.from(url.split(",")[1], "base64"));
}
await browser.close();
