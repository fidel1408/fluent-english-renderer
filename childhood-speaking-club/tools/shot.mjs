// usage: node shot.mjs <url> <out.png> [w] [h]
import { chromium } from "playwright-core";
const [url, out, w = 1920, h = 1080] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(url);
await p.waitForTimeout(1500);
await p.screenshot({ path: out });
console.log("errors:", errs);
await b.close();
