// Static corpus scan: every string literal in the lesson source that looks like English prose, tokenised and checked against the IPA dictionary.
const fs = require('fs'), path = require('path');
const dictSrc = fs.readFileSync(path.join(__dirname, '../src/ipa-dict.js'), 'utf8');
const D = JSON.parse(dictSrc.match(/Object\.assign\(IPA\.D, (\{.*?\})\);/s)[1]);
const files = ['content-0.js', 'content-1.js', 'content-2.js', 'content-3.js', 'content-4.js', 'core.js', 'ui.js'];
const miss = {}, strings = new Set();
const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
for (const f of files) {
  const src = fs.readFileSync(path.join(__dirname, '../src', f), 'utf8');
  let m; while ((m = re.exec(src))) {
    let t = (m[1] ?? m[2] ?? m[3]).replace(/\$\{[^}]*\}/g, ' ');
    if (/[<>=;{}\\]|^[#.\[]|=>|\bfunction\b|px|rem\b|var\(|data-|^\s*$/.test(t)) continue;
    if (!/[A-Za-z]{2,}\s+[A-Za-z]{2,}|^[A-Z][a-z]+[.!?]?$/.test(t) && !/^[A-Za-z']+$/.test(t)) continue;
    strings.add(t);
    t.replace(/[’‘]/g, "'").replace(/\*/g, '').split(/[\s\/–—…-]+/).map((w) => w.replace(/^[^\w']+|[^\w']+$/g, '').toLowerCase()).filter((w) => /^[a-z][a-z']*$/.test(w)).forEach((w) => { if (D[w] === undefined) (miss[w] = miss[w] || []).push(t.slice(0, 60)); });
  }
}
const out = Object.entries(miss).sort();
console.log(out.length + ' distinct words not in dictionary (from ' + strings.size + ' strings)');
out.forEach(([w, ex]) => console.log(w.padEnd(16), '|', ex[0]));
