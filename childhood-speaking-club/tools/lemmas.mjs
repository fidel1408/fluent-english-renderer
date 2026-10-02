// prints the lemma candidates still missing from the glossary
import fs from "fs";
const dir = new URL(".", import.meta.url).pathname;
const disp = Object.keys(JSON.parse(fs.readFileSync(dir + "displayed-words.json", "utf8")));
const forms = new Map();
for (const line of fs.readFileSync(dir + "forms.txt", "utf8").split("\n")) { if (!line.trim() || line[0] === "#") continue; const [l, list] = line.split(":").map((x) => x.trim()); for (const f of list.split(/\s+/)) forms.set(f.toLowerCase(), l.toLowerCase()); }
const gloss = new Set(fs.readFileSync(dir + "glossary.txt", "utf8").split("\n").filter((l) => l.trim() && l[0] !== "#").map((l) => l.split("|")[0].trim().toLowerCase()));
const cand = new Set();
for (const w of disp) {
  if (gloss.has(w)) continue;
  if (forms.has(w)) { cand.add(forms.get(w)); continue; }
  const tries = [];
  if (w.endsWith("ies")) tries.push(w.slice(0, -3) + "y");
  if (w.endsWith("es")) tries.push(w.slice(0, -2));
  if (w.endsWith("s")) tries.push(w.slice(0, -1));
  if (w.endsWith("ied")) tries.push(w.slice(0, -3) + "y");
  if (w.endsWith("ed")) tries.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("ing")) tries.push(w.slice(0, -3), w.slice(0, -3) + "e");
  if (w.endsWith("ly")) tries.push(w.slice(0, -2));
  if (w.endsWith("er")) tries.push(w.slice(0, -2), w.slice(0, -1));
  if (/(.)\1(ed|ing|er)$/.test(w)) tries.push(w.replace(/(.)\1(ed|ing|er)$/, "$1"));
  const hit = tries.find((t) => gloss.has(t) || disp.includes(t));
  cand.add(hit || w);
}
const list = [...cand].filter((c) => !gloss.has(c)).sort();
console.log(list.length);
console.log(list.join(" "));
