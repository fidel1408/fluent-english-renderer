// Builds js/ipa-data.js (word -> American IPA, Oxford Learner's Dictionaries US *style*) from CMUdict.
//
// SYMBOLS: the Fluent English Sound Chart (provided by the teacher; same symbols as Oxford Learner's US) is the symbol reference:
//   vowels æ e ɪ ɔː ʊ ə ʌ iː uː ɑː | aɪ eɪ əʊ aʊ ɔɪ | ɑːr er ɔːr ɜːr | consonants p ʒ z s t m n f v d ð θ l dʒ w r b ɡ ʃ tʃ h k ŋ j
//   Oxford additionally writes: stress marks ˈ ˌ, 'i' (happy), 'ər' (unstressed -er), 'ɪr' / 'ʊr', and syllabic l / n.
//
// HONEST METHOD NOTE (also in docs/IPA-METHOD.md):
//  * www.oxfordlearnersdictionaries.com was NOT reachable from the build environment (proxy 403), so the transcriptions
//    here are NOT copied from, or individually verified against, Oxford.
//  * They are generated from CMUdict (American English) and converted into Oxford's US symbol conventions
//    (e.g. iː ɑː ɔː uː, ɜːr / ər, oʊ, aʊ, ɡ, primary ˈ and secondary ˌ stress marks before the stressed syllable).
//  * tools/ipa-overrides.json holds hand-set exceptions (names, homographs, function words).
//  * docs/ipa-review.csv lists every entry with its Oxford URL so a teacher can spot-check quickly.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const words = JSON.parse(fs.readFileSync(path.join(here, 'cache', 'words.json'), 'utf8'));
const over = JSON.parse(fs.readFileSync(path.join(here, 'ipa-overrides.json'), 'utf8'));

/* ---- CMUdict ---- */
const cmu = new Map();
for (const line of fs.readFileSync(path.join(here, 'cache', 'cmudict.dict'), 'utf8').split('\n')) {
  if (!line || line.startsWith(';;;')) continue;
  const sp = line.indexOf(' '); let w = line.slice(0, sp); const ph = line.slice(sp + 1).trim().split(' ');
  if (/\(\d+\)$/.test(w)) continue;           // first pronunciation only
  if (!cmu.has(w)) cmu.set(w, ph);
}

const V = { AA: 'ɑː', AE: 'æ', AH: 'ʌ', AO: 'ɔː', AW: 'aʊ', AY: 'aɪ', EH: 'e', ER: 'ɜːr', EY: 'eɪ', IH: 'ɪ', IY: 'iː', OW: 'əʊ', OY: 'ɔɪ', UH: 'ʊ', UW: 'uː' };
const C = { B: 'b', CH: 'tʃ', D: 'd', DH: 'ð', F: 'f', G: 'ɡ', HH: 'h', JH: 'dʒ', K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ŋ', P: 'p', R: 'r', S: 's', SH: 'ʃ', T: 't', TH: 'θ', V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ' };
const isV = (p) => /\d$/.test(p);
const base = (p) => p.replace(/\d$/, '');
const ONSET2 = new Set(['P L', 'P R', 'B L', 'B R', 'T R', 'D R', 'K L', 'K R', 'G L', 'G R', 'F L', 'F R', 'TH R', 'SH R', 'S P', 'S T', 'S K', 'S M', 'S N', 'S L', 'S W', 'T W', 'K W', 'D W', 'G W', 'TH W', 'S F', 'HH Y', 'P Y', 'B Y', 'K Y', 'M Y', 'F Y', 'V Y', 'T Y', 'D Y', 'N Y', 'S Y', 'L Y', 'Z Y', 'TH Y']);
const ONSET3 = new Set(['S P L', 'S P R', 'S T R', 'S K R', 'S K W', 'S K L', 'S P Y', 'S T Y', 'S K Y']);

function toIpa(ph) {
  // 1. syllabify (max-onset) -> [{on:[], v:'AE1', co:[]}]
  const idx = ph.map((p, i) => (isV(p) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return ph.map((p) => C[p] || '').join('');
  const syl = idx.map((vi) => ({ v: ph[vi], on: [], co: [] }));
  syl[0].on = ph.slice(0, idx[0]);
  for (let s = 0; s < idx.length; s++) {
    const a = idx[s], b = s + 1 < idx.length ? idx[s + 1] : ph.length; const cons = ph.slice(a + 1, b);
    if (s + 1 === idx.length) { syl[s].co = cons; continue; }
    let k = cons.length; // number of consonants that go to the next onset
    let take = 0;
    for (let n = Math.min(3, cons.length); n >= 1; n--) {
      const seg = cons.slice(cons.length - n); const key = seg.join(' ');
      if (n === 1 || (n === 2 && ONSET2.has(key)) || (n === 3 && ONSET3.has(key))) { take = n; break; }
    }
    if (take === 0) take = Math.min(1, cons.length);
    syl[s].co = cons.slice(0, cons.length - take); syl[s + 1].on = cons.slice(cons.length - take);
  }
  // 2. phoneme -> IPA with context rules
  const flat = []; // {s: syllable index or -1, ipa}
  syl.forEach((sy, si) => {
    sy.on.forEach((p) => flat.push({ s: si, ipa: C[p] || '', c: p, onset: true }));
    flat.push({ s: si, v: sy.v, ipa: '', vowel: true });
    sy.co.forEach((p) => flat.push({ s: si, ipa: C[p] || '', c: p }));
  });
  for (let i = 0; i < flat.length; i++) {
    const x = flat[i]; if (!x.vowel) continue;
    const b = base(x.v), st = +x.v.slice(-1);
    let ipa;
    if (b === 'AH') ipa = st === 0 ? 'ə' : 'ʌ';
    else if (b === 'ER') ipa = st === 0 ? 'ər' : 'ɜːr';
    else if (b === 'IY') ipa = st === 0 ? 'i' : 'iː';
    else if (b === 'IH' && st === 0) ipa = 'ɪ';
    else ipa = V[b];
    x.ipa = ipa;
    const nx = flat[i + 1];
    if (nx && nx.c === 'R' && !nx.onset) { // r-coloured vowels written with r
      if (b === 'AA') { x.ipa = 'ɑːr'; nx.ipa = ''; } else if (b === 'AO') { x.ipa = 'ɔːr'; nx.ipa = ''; } else if (b === 'IH' || (b === 'IY' && st)) { x.ipa = 'ɪr'; nx.ipa = ''; } else if (b === 'EH') { x.ipa = 'er'; nx.ipa = ''; } else if (b === 'UH') { x.ipa = 'ʊr'; nx.ipa = ''; }
    }
    if (nx && nx.vowel && nx.v.startsWith('ER') && (b === 'AY' || b === 'AW')) { /* fire / hour: keep aɪər */ }
  }
  // 3. syllabic l / n at the end of the word (little, possible, button, reason)
  const last = flat.length - 1;
  for (let i = 1; i <= 2; i++) { /* placeholder to keep structure clear */ }
  const lastV = flat.map((x, i) => (x.vowel ? i : -1)).filter((i) => i >= 0).pop();
  if (lastV !== undefined && flat[lastV].v === 'AH0' && lastV === last - 1 && lastV > 0) {
    const nx = flat[last], pv = flat[lastV - 1];
    if (nx.c === 'L' && pv && !pv.vowel && ['P', 'B', 'T', 'D', 'K', 'G', 'F', 'V', 'S', 'Z', 'TH', 'SH', 'N', 'M'].includes(pv.c)) { flat[lastV].ipa = ''; }
    else if (nx.c === 'N' && pv && ['T', 'D', 'S', 'Z'].includes(pv.c)) { flat[lastV].ipa = ''; }
  }
  // 4. stress marks before the onset of the stressed syllable
  const out = [];
  const marked = new Set();
  const stress = syl.map((sy) => +sy.v.slice(-1));
  const prim = stress.indexOf(1);
  let lastSec = -1;
  stress.forEach((st, si) => { if (st === 2 && (prim < 0 || si < prim)) lastSec = si; });   // Oxford-style: keep only the secondary stress closest to the primary, and none after it
  stress.forEach((st, si) => {
    if (idx.length < 2) return;
    if (st === 1) marked.add(si);
    else if (st === 2 && si === lastSec) marked.add(si);
  });
  let prevS = -1;
  flat.forEach((x) => {
    if (x.s !== prevS) { prevS = x.s; if (marked.has(x.s)) out.push(+syl[x.s].v.slice(-1) === 1 ? 'ˈ' : 'ˌ'); }
    out.push(x.ipa);
  });
  let s = out.join('');
  // syllabic consonant spellings tidy
  s = s.replace(/ˈ+$/, '');
  return s;
}

const NUM = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 14: 'fourteen', 15: 'fifteen', 20: 'twenty', 30: 'thirty', 45: 'forty-five', 60: 'sixty' };
const result = {}; const rows = []; const missing = [];
const norm = (w) => w.replace(/’/g, "'");
function lookupWord(w) {
  if (over[w] !== undefined) return { ipa: over[w], src: 'override' };
  const bare = w.split('~')[0];
  if (over[bare] !== undefined && w === bare) return { ipa: over[bare], src: 'override' };
  if (cmu.has(bare)) return { ipa: toIpa(cmu.get(bare)), src: 'cmudict' };
  // possessive / contractions: x's
  const m = bare.match(/^(.+)'s$/);
  if (m && (cmu.has(m[1]) || over[m[1]] !== undefined)) { const b = over[m[1]] !== undefined ? over[m[1]] : toIpa(cmu.get(m[1])); const lastC = b.replace(/[ˈˌ]/g, '').slice(-1); const suf = /[szʃʒ]|dʒ|tʃ/.test(b.slice(-2)) ? 'ɪz' : (/[ptkfθ]/.test(lastC) ? 's' : 'z'); return { ipa: b + suf, src: 'cmudict+s' }; }
  if (/^\d+$/.test(bare) && NUM[+bare]) { const nw = NUM[+bare]; const ps = nw.split('-').map((x) => toIpa(cmu.get(x))).join(' '); return { ipa: ps, src: 'number' }; }
  return null;
}
for (let w0 of words) {
  const w = norm(w0).toLowerCase();
  if (/^[\d:.,%]+$/.test(w) && !/^\d+$/.test(w)) continue;      // clock readouts etc. are not words
  if (w.includes('-')) { const parts = w.split('-'); const ps = []; let ok = true; for (const p of parts) { const r = lookupWord(p); if (!r) { ok = false; break; } ps.push(r.ipa); } if (ok) { result[w] = ps.join(' '); rows.push([w, result[w], 'compound']); } else missing.push(w); continue; }
  const r = lookupWord(w);
  if (!r) { missing.push(w); continue; }
  result[w] = r.ipa; rows.push([w, r.ipa, r.src]);
}
// components for hyphen compounds also (runtime joins parts)
for (const w of words) { const k = norm(w).toLowerCase(); if (k.includes('-')) for (const p of k.split('-')) { if (!result[p]) { const r = lookupWord(p); if (r) { result[p] = r.ipa; rows.push([p, r.ipa, r.src]); } } } }
const sorted = Object.fromEntries(Object.keys(result).sort().map((k) => [k, result[k]]));
fs.writeFileSync(path.join(root, 'js', 'ipa-data.js'), '/* generated by tools/build-ipa.mjs - do not edit by hand. See docs/IPA-METHOD.md */\nwindow.IPA_DICT = ' + JSON.stringify(sorted, null, 0).replace(/,"/g, ',\n"') + ';\n');
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
const csv = ['word,ipa,source,oxford_us_url'].concat(rows.sort((a, b) => a[0].localeCompare(b[0])).map(([w, i, s]) => `"${w}","/${i}/",${s},https://www.oxfordlearnersdictionaries.com/us/definition/american_english/${encodeURIComponent(w.replace(/'/g, ''))}`));
fs.writeFileSync(path.join(root, 'docs', 'ipa-review.csv'), csv.join('\n'));
console.log('entries:', Object.keys(sorted).length, 'missing:', missing.length); if (missing.length) console.log(missing.join(' | '));

// chart-conformance check
const allowed = new Set('æeɪɔːʊəʌiuɑɜaʃʒθðŋɡbdfhjklmnprstvwzˈˌ '.split(''));
const bad = {}; for (const [w, i] of Object.entries(sorted)) for (const ch of i) if (!allowed.has(ch)) (bad[ch] = bad[ch] || []).push(w);
console.log('symbols outside the sound chart set:', Object.keys(bad).length ? JSON.stringify(bad) : 'none');
