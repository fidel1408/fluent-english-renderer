/* 20-ipa: every visible English word is an indivisible word-over-IPA unit.
   Markup in strings:  {s:She} {m:may} {v:arrive}   role-coloured words
                       [could|kəd]                  per-instance IPA override
                       Punctuation is attached to the unit but never gets IPA. */
(function () {
  'use strict';
  const FE = window.FE;
  FE.IPA = FE.IPA || {};
  FE.ipaMissing = new Set();
  /* dictionary loader: "word ipa" per line (IPA data file calls FE.addIPA`...`) */
  FE.addIPA = (text) => {
    String(text).split('\n').forEach((ln) => {
      ln = ln.trim(); if (!ln || ln[0] === '#') return;
      const i = ln.indexOf(' '); if (i < 0) return;
      FE.IPA[ln.slice(0, i).toLowerCase()] = ln.slice(i + 1).trim();
    });
  };
  const LEAD = /^[“"‘'(¿¡\[]+/;
  const TRAIL = /[.,!?;:”"’)…\]—–-]+$/;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  FE.tokens = (text) => {
    const out = [];
    const re = /[“"‘'(]*\{[a-z]+:[^}]+\}[^\s{]*|[“"‘'(]*\[[^\]|]+\|[^\]]+\][^\s{]*|\S+/g;
    let m;
    while ((m = re.exec(text))) {
      let tk = m[0], role = '', ov = null, pre = '', post = '', mm;
      if ((mm = /^([“"‘'(]*)\{([a-z]+):([^}]+)\}(.*)$/.exec(tk))) {
        pre = mm[1]; role = mm[2]; post = mm[4]; tk = mm[3];
        if (tk.includes('|')) { const q = tk.split('|'); tk = q[0]; ov = q[1]; }
        tk = pre + tk + post;
      } else if ((mm = /^([“"‘'(]*)\[([^\]|]+)\|([^\]]+)\](.*)$/.exec(tk))) { ov = mm[3]; tk = mm[1] + mm[2] + mm[4]; }
      let lead = '', trail = '';
      const ml = LEAD.exec(tk); if (ml) { lead = ml[0]; tk = tk.slice(lead.length); }
      const mt = TRAIL.exec(tk); if (mt && tk.length > mt[0].length) { trail = mt[0]; tk = tk.slice(0, tk.length - trail.length); }
      out.push({ word: tk, lead, trail, role, ov });
    }
    return out;
  };
  /* all plain words of a string (for speech text & audits) */
  FE.plain = (text) => FE.tokens(text).map((t) => t.lead + t.word + t.trail).join(' ');

  FE.ipaOf = (tk) => {
    if (tk.ov) return tk.ov;
    const key = tk.word.toLowerCase().replace(/’/g, "'");
    let v = FE.IPA[key];
    if (v == null) { FE.ipaMissing.add(key); v = '?'; }
    return v;
  };

  /* word-over-IPA units. opts: {cls, id} */
  FE.U = (text, opts = {}) => {
    const toks = FE.tokens(text);
    return toks.map((t, i) => {
      const ipa = FE.ipaOf(t);
      const r = t.role ? ' r-' + t.role : '';
      const lead = t.lead ? `<i class="pn l">${esc(t.lead)}</i>` : '';
      const trail = t.trail ? `<i class="pn t">${esc(t.trail)}</i>` : '';
      const pad = (t.lead ? ' pl' : '') + (t.trail ? ' pt' : '');
      return `<span class="wu${r}${pad}" data-i="${i}"><span class="w">${lead}${esc(t.word)}${trail}</span><span class="p">/${esc(ipa)}/</span></span>`;
    }).join(' ');
  };
  /* convenience: a block of units */
  FE.UB = (text, cls = '') => `<span class="ub ${cls}">${FE.U(text)}</span>`;
  /* plain text of a unit-marked string without markup (for aria/speech) */
  FE.stripMarkup = (text) => FE.tokens(text).map((t) => t.lead + t.word + t.trail).join(' ');
})();
