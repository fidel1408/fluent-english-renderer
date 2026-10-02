import { createRequire } from "module"; const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");
import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const jobs = process.argv.slice(2).map(s => { const [id,u,cc]=s.split(":"); return {id,u:+u,cc:+(cc??2)}; });
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--no-sandbox"] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on("console", m => console.log("[page]", m.text())); pg.on("pageerror", e => console.log("[err]", e.message));
await pg.goto("file://" + path.join(here, "test.html")); await pg.evaluate(() => FE.ready);
for (const j of jobs) {
  await pg.evaluate(({id,u,cc}) => FE.shot(id,u,cc), j);
  const el = await pg.$("#c"); const f = `/tmp/shot_${j.id}_${j.u}.png`;
  await el.screenshot({ path: f }); console.log(f);
}
await b.close();
