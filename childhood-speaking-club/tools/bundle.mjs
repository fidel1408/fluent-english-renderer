// Builds ONE self-contained HTML file (CSS, JS, logo and chart inlined) for hosting where only a single page can be published.
//   node tools/bundle.mjs <logo.png> <out.html>
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const [logoPath, out] = process.argv.slice(2);
const rd = (p) => fs.readFileSync(path.resolve(root, p), "utf8");
const b64 = (p, mime) => `data:${mime};base64,` + fs.readFileSync(p).toString("base64");
let html = rd("index.html");
const css = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => rd(m[1])).join("\n");
const scripts = [...html.matchAll(/<script src="([^"]+)"(?: onerror="void 0")?><\/script>/g)].map((m) => rd(m[1]).replace(/src="assets\/fluent_english_logo\.png"/g, `src="' + window.__LOGO + '"`).replace(/src="assets\/sound_chart\.jpg"/g, `src="' + window.__CHART + '"`)).join("\n;\n");
const body = html.slice(html.indexOf("<body>") + 6, html.indexOf("<script src=")).trim().replace(/<img src="assets\/fluent_english_logo\.png" alt="Fluent English">/, '<img id="hudlogo" alt="Fluent English">');
const title = html.match(/<title>(.*?)<\/title>/)[1];
const safe = (s) => s.replace(/<\/script/gi, "<\\/script");
const page = `<title>${title}</title>
<style>${css}</style>
${body}
<script>window.__LOGO=${JSON.stringify(b64(logoPath, "image/png"))};window.__CHART=${JSON.stringify(b64(path.resolve(root, "assets/sound_chart.jpg"), "image/jpeg"))};document.getElementById("hudlogo").src=window.__LOGO;</script>
<script>${safe(scripts)}</script>
`;
fs.writeFileSync(out, page);
console.log("bytes", page.length);
