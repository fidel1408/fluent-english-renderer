/* ===== IPA: hand-typed, Oxford-style American English, assembled word by word (citation forms). =====
   NOT supplied or verified by Oxford: the Oxford lookup was unreachable when this lesson was built. */
const IPA = (() => {
  const D = {};   // filled by ipa-dict.js
  const missing = new Set();
  const cache = {};
  function word(w) {
    const k = w.toLowerCase().replace(/[’‘]/g, "'");
    if (D[k] !== undefined) return D[k];
    missing.add(k); return null;
  }
  /** returns {text:'/…/', unk:bool} */
  function line(text) {
    if (cache[text]) return cache[text];
    const clean = text.replace(/[’‘]/g, "'").replace(/\*/g, '');
    const toks = clean.split(/[\s\/–—-]+|…/).map((t) => t.replace(/^[^\w'_]+|[^\w'_]+$/g, '')).filter((t) => t && !/^'+$/.test(t));
    let unk = false;
    const out = toks.map((t, i) => {
      if (/^_+$/.test(t)) return '___';
      if (/^[A-D]$/.test(t) && i > 0 && /^(round|answer|form)$/i.test(toks[i - 1])) return IPA.LET[t];
      const p = word(t); if (p === null) { unk = true; return t; } return p;
    }).filter((x) => x !== '');
    const r = { text: out.length ? '/' + out.join(' ') + '/' : '', unk };
    cache[text] = r; return r;
  }
  return { D, line, missing };
})();
