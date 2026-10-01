// Collect every English word that could be displayed (all string literals in src/js) -> generated/words.json
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src/js'); const words = new Set();
const RE = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
function take(s) {
  s = s.replace(/\\(['"`])/g, '$1').replace(/<[^>]*>/g, ' ').replace(/\{=([^|}]+)\|[^}]+\}/g, ' $1 ').replace(/\{[a-z]+\|/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\\u[0-9a-f]{4}/gi, ' ').replace(/’/g, "'");
  for (const w of s.match(/[A-Za-z\u00C0-\u00FF]+(?:['\-][A-Za-z\u00C0-\u00FF]+)*/g) || []) words.add(w.toLowerCase());
}
function walk(src) {
  let m; const re = new RegExp(RE.source, 'g');
  while ((m = re.exec(src))) {
    const s = m[1] ?? m[2] ?? m[3]; if (!s) continue;
    if (m[3] != null && s.includes('${')) { walk(s); take(s.replace(/\$\{[^]*?\}/g, ' ')); } else take(s);
  }
}
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js') || /^(10|11|12)-/.test(f)) continue;
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  walk(src);
}
fs.mkdirSync(path.join(root, 'src/generated'), { recursive: true });
fs.writeFileSync(path.join(root, 'src/generated/words.json'), JSON.stringify([...words].sort()));
console.log('words:', words.size);
