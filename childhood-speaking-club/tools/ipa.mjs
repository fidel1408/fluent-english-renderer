// Converts CMU Pronouncing Dictionary (American English, ARPAbet) entries into IPA
// that uses ONLY the symbols on the Fluent English Sound Chart (which match the
// Oxford Learner's Dictionaries American English notation):
//   æ e ɪ ɔː ʊ · ə ʌ iː uː ɑː · aɪ eɪ əʊ aʊ ɔɪ · ɑːr er ɔːr ɜːr
//   p ʒ z s t m n f v d ð θ l dʒ w r b ɡ ʃ tʃ h k ŋ j
// Plus the standard helper marks used with them: ˈ ˌ (stress), ː (length),
// and, exactly as Oxford does, final unstressed "i", unstressed "u",
// syllabic n / l, and ɪr / ʊr built from chart symbols.
// This is an automatic conversion. It is NOT a word-by-word check against Oxford.

import { dictionary } from "cmu-pronouncing-dictionary";

const VOWELS = new Set(["AA","AE","AH","AO","AW","AY","EH","ER","EY","IH","IY","OW","OY","UH","UW"]);

const CONS = {
  B: "b", CH: "tʃ", D: "d", DH: "ð", F: "f", G: "ɡ", HH: "h", JH: "dʒ", K: "k", L: "l",
  M: "m", N: "n", NG: "ŋ", P: "p", R: "r", S: "s", SH: "ʃ", T: "t", TH: "θ", V: "v",
  W: "w", Y: "j", Z: "z", ZH: "ʒ",
};

function vowelIpa(base, stress) {
  switch (base) {
    case "AA": return "ɑː";
    case "AE": return "æ";
    case "AH": return stress === 0 ? "ə" : "ʌ";
    case "AO": return "ɔː";
    case "AW": return "aʊ";
    case "AY": return "aɪ";
    case "EH": return "e";
    case "ER": return stress === 0 ? "ər" : "ɜːr";
    case "EY": return "eɪ";
    case "IH": return "ɪ";
    case "IY": return stress === 0 ? "i" : "iː";
    case "OW": return "əʊ";
    case "OY": return "ɔɪ";
    case "UH": return "ʊ";
    case "UW": return stress === 0 ? "u" : "uː";
    default: throw new Error("vowel? " + base);
  }
}

const ONSET2 = new Set([
  "P L","B L","K L","G L","F L","S L","P R","B R","T R","D R","K R","G R","F R","TH R","SH R",
  "S P","S T","S K","S M","S N","S F","S W","T W","D W","K W","G W","TH W","HH Y",
  "P Y","B Y","K Y","G Y","F Y","M Y","V Y",
]);
const ONSET3 = new Set(["S P R","S P L","S T R","S K R","S K W","S K L","S P Y","S K Y"]);

function validOnset(cs) {
  if (cs.length === 0) return true;
  if (cs.length === 1) return cs[0] !== "NG";
  if (cs.length === 2) return ONSET2.has(cs.join(" "));
  if (cs.length === 3) return ONSET3.has(cs.join(" "));
  return false;
}

// phones: ["HH","AW1","S"] -> IPA string
export function arpabetToIpa(phoneStr) {
  let ph = phoneStr.trim().split(/\s+/);
  const items = ph.map((p) => {
    const m = p.match(/^([A-Z]+)([0-2])?$/);
    return { base: m[1], stress: m[2] === undefined ? null : Number(m[2]), vowel: VOWELS.has(m[1]) };
  });

  // syllabic l / n (Oxford style: little /ˈlɪtl/, button /ˈbʌtn/)
  const n = items.length;
  if (n >= 3 && items[n - 1].base === "L" && items[n - 2].base === "AH" && items[n - 2].stress === 0 && !items[n - 3].vowel) {
    items[n - 2].elide = true;
  }
  if (n >= 3 && items[n - 1].base === "N" && items[n - 2].base === "AH" && items[n - 2].stress === 0 && ["T","D","S","Z","SH","ZH"].includes(items[n - 3].base)) {
    items[n - 2].elide = true;
  }
  const seq = items;

  // syllabify
  const vIdx = seq.map((x, i) => (x.vowel ? i : -1)).filter((i) => i >= 0);
  if (vIdx.length === 0) return seq.map((x) => CONS[x.base]).join("");
  const starts = [0]; // syllable start indexes
  for (let k = 0; k < vIdx.length - 1; k++) {
    const a = vIdx[k], b = vIdx[k + 1];
    const cluster = seq.slice(a + 1, b).map((x) => x.base);
    let take = 0;
    for (let len = Math.min(3, cluster.length); len >= 0; len--) {
      if (validOnset(cluster.slice(cluster.length - len))) { take = len; break; }
    }
    starts.push(b - take);
  }
  const syllCount = vIdx.length;
  let out = "";
  for (let s = 0; s < syllCount; s++) {
    const from = starts[s];
    const to = s + 1 < syllCount ? starts[s + 1] : seq.length;
    const nucleus = seq[vIdx[s]];
    let mark = "";
    if (syllCount > 1) {
      if (nucleus.stress === 1) mark = "ˈ";
      else if (nucleus.stress === 2) {
        const nxt = seq[vIdx[s + 1]];
        const reduced = ["IH", "AH", "EH"].includes(nucleus.base);
        const clash = nxt && (nxt.stress === 1 || (nxt.stress === 2 && nucleus.base === "IH"));
        mark = reduced && clash && s === 0 ? "" : "ˌ";
      }
    }
    let body = "";
    for (let i = from; i < to; i++) {
      const x = seq[i];
      if (x.vowel) body += x.elide ? "" : vowelIpa(x.base, x.stress);
      else body += CONS[x.base];
    }
    out += mark + body;
  }
  return out;
}

export function cmuLookup(word) {
  const w = word.toLowerCase();
  const v = dictionary[w];
  if (!v) return null;
  return arpabetToIpa(v);
}

export function cmuVariants(word) {
  const w = word.toLowerCase();
  const out = [];
  const tryAdd = (k) => { try { out.push(arpabetToIpa(dictionary[k])); } catch (e) { /* skip odd entries */ } };
  if (dictionary[w]) tryAdd(w);
  for (let i = 1; i < 6; i++) if (dictionary[`${w}(${i})`]) tryAdd(`${w}(${i})`);
  return out;
}

export function cmuRaw(word) {
  return dictionary[word.toLowerCase()] || null;
}
