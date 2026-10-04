/* ===== IPA: notation follows the uploaded Fluent English Sound Chart, which agrees with current Oxford Learner's (OALD) NAmE
   transcriptions for the GOAT vowel (əʊ: boat /bəʊt/, no /nəʊ/, go /ɡəʊ/). The separate Oxford Advanced American dictionary writes /oʊ/;
   that is a different transcription standard and is NOT mixed in here.
   Status per word: 'verified' = checked against OALD NAmE evidence supplied by the course owner; 'hand' = typed by hand in the same
   notation, NOT word-level checked against OALD. Sentence lines are ASSEMBLED word by word from citation forms. Nobody has listened to
   every audio line. Words missing from the dictionary are shown as [?word] and flagged, never as plain spelling. ===== */
const IPA = (() => {
  const D = {}, STATUS = {};            // filled by ipa-dict.js
  const missing = new Set(), cache = {};
  const LETTER = { a: 'eɪ', b: 'biː', c: 'siː', d: 'diː' };
  const isLetterName = (t, toks, i) => {
    if (!/^[A-D]$/.test(t)) return false;
    if (t !== 'A') return true;                       // B, C, D are never articles
    const prev = (toks[i - 1] || '').toLowerCase();
    return /^(round|answer|form|option|choice|letter|is)$/.test(prev) || /^A[:.?!]$/.test(toks.raw[i]);
  };
  function word(w) {
    const k = w.toLowerCase().replace(/[’‘]/g, "'");
    if (D[k] !== undefined) return D[k];
    missing.add(k); return null;
  }
  /** returns {text:'/…/', unk:bool, words:[{w, ipa, status}], assembled:true} */
  function line(text) {
    if (cache[text]) return cache[text];
    const clean = text.replace(/[’‘]/g, "'").replace(/\*/g, '');
    const raw = clean.split(/[\s\/–—-]+|…/).filter(Boolean);
    const toks = raw.map((t) => t.replace(/^[^\w'_]+|[^\w'_]+$/g, '')); toks.raw = raw;
    let unk = false; const words = [];
    const out = [];
    toks.forEach((t, i) => {
      if (!t || /^'+$/.test(t)) return;
      if (/^_+$/.test(t)) { out.push('___'); return; }
      if (isLetterName(t, toks, i)) { const p = LETTER[t.toLowerCase()]; out.push(p); words.push({ w: t, ipa: p, status: 'letter-name' }); return; }
      const p = word(t);
      if (p === null) { unk = true; out.push('[?' + t + ']'); words.push({ w: t, ipa: null, status: 'missing' }); return; }
      out.push(p); words.push({ w: t, ipa: p, status: STATUS[t.toLowerCase()] || 'hand' });
    });
    const r = { text: out.length ? '/' + out.join(' ') + '/' : '', unk, words, assembled: true };
    cache[text] = r; return r;
  }
  const stats = () => { const k = Object.keys(D); return { entries: k.length, verified: k.filter((w) => STATUS[w] === 'verified').length }; };
  return { D, STATUS, line, missing, stats };
})();
