/* Should for Advice — core utilities, word-over-IPA unit renderer, easing, RNG */
(function (g) {
  'use strict';
  const FE = (g.FE = g.FE || {});
  FE.LEX = FE.LEX || {};
  FE.missing = new Set();
  FE.SVGNS = 'http://www.w3.org/2000/svg';

  FE.$ = (s, r) => (r || document).querySelector(s);
  FE.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  FE.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  FE.lerp = (a, b, t) => a + (b - a) * t;
  FE.ease = {
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  };
  FE.rng = function (seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s += 0x6d2b79f5; let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  FE.hash = function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  FE.esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let uid = 0;
  FE.uid = (p) => (p || 'u') + (++uid);

  FE.h = function (tag, attrs, kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach((c) => c != null && e.append(c.nodeType ? c : document.createTextNode(c)));
    return e;
  };

  /* ------------------------------------------------------------------
     Word-over-IPA units.
     Markup inside strings:
       {s|You} {m|should}   role colour wrappers (s subject, m modal, n negative, v verb,
                            o object, q question word, r reason, x wrong, g good)
       {=should|ʃəd}        explicit IPA override for the next word (weak form, etc.)
       +                    plus sign, rendered with /plʌs/ underneath
     Punctuation never receives IPA; it hangs off the word it belongs to.
  ------------------------------------------------------------------ */
  const WORD = /^[A-Za-z\u00C0-\u00FF]+(?:['’\-][A-Za-z\u00C0-\u00FF]+)*/;
  const LEAD = '“‘("[¿¡';
  const TRAIL = '.,?!:;”’)"]…';

  FE.tokenize = function (str) {
    const out = [];
    let i = 0, role = null, pendingLead = '', override = null;
    const roleStack = [];
    while (i < str.length) {
      const rest = str.slice(i);
      let m;
      if ((m = rest.match(/^\{=([^|}]+)\|([^}]+)\}/))) {
        // explicit IPA override: {=word|ipa} -> becomes a word token with given ipa
        out.push({ type: 'word', text: m[1], ipa: m[2].replace(/^\/|\/$/g, ''), role, lead: pendingLead, trail: '' });
        pendingLead = ''; i += m[0].length; continue;
      }
      if ((m = rest.match(/^\{([a-z]+)\|/))) { roleStack.push(role); role = m[1]; i += m[0].length; continue; }
      if (rest[0] === '}') { role = roleStack.pop() || null; i += 1; continue; }
      if (rest[0] === ' ' || rest[0] === '\n') { i++; continue; }
      if (rest[0] === '+') { out.push({ type: 'plus', role, lead: pendingLead }); pendingLead = ''; i++; continue; }
      if ((m = rest.match(WORD))) {
        out.push({ type: 'word', text: m[0], role, lead: pendingLead, trail: '' });
        pendingLead = ''; i += m[0].length; continue;
      }
      const ch = rest[0];
      if (LEAD.includes(ch)) { pendingLead += ch; i++; continue; }
      if (TRAIL.includes(ch)) {
        const last = out[out.length - 1];
        if (last && last.type === 'word') last.trail += ch; else out.push({ type: 'sym', text: ch });
        i++; continue;
      }
      out.push({ type: 'sym', text: ch }); i++;
    }
    return out;
  };

  FE.ipaOf = function (word) {
    const k = word.toLowerCase().replace(/’/g, "'");
    const v = FE.LEX[k];
    if (v == null) { FE.missing.add(k); return null; }
    return v;
  };

  FE.unitHTML = function (t, extraCls, idx) {
    const roleCls = t.role ? ' r-' + t.role : '';
    const ix = idx != null ? ' data-i="' + idx + '"' : '';
    if (t.type === 'plus') {
      return '<span class="u plus' + roleCls + '"' + ix + '><span class="w">+</span><span class="p">/plʌs/</span></span>';
    }
    if (t.type === 'sym') return '<span class="sym">' + FE.esc(t.text) + '</span>';
    const ipa = t.ipa != null ? t.ipa : FE.ipaOf(t.text);
    const lead = t.lead ? '<i class="lp">' + FE.esc(t.lead) + '</i>' : '';
    const trail = t.trail ? '<i class="tp">' + FE.esc(t.trail) + '</i>' : '';
    const cls = 'u' + roleCls + (t.lead ? ' hl' : '') + (t.trail ? ' ht' : '') + (extraCls ? ' ' + extraCls : '');
    return '<span class="' + cls + '"' + ix + ' data-w="' + FE.esc(t.text.toLowerCase()) + '"><span class="w">' + lead + FE.esc(t.text) + trail +
      '</span><span class="p">' + (ipa == null ? '/?/' : '/' + FE.esc(ipa) + '/') + '</span></span>';
  };

  /* U(str) -> HTML string of units. Options: {idx:true} numbers each word unit. */
  FE.U = function (str, opt) {
    const toks = FE.tokenize(str);
    let n = 0;
    return toks.map((t) => FE.unitHTML(t, opt && opt.cls, opt && opt.idx && t.type === 'word' ? n++ : null)).join('');
  };
  /* Block wrapper so a unit string behaves as a wrapping line of units */
  FE.UB = function (str, cls, opt) { return '<span class="ub ' + (cls || '') + '">' + FE.U(str, opt) + '</span>'; };
  FE.wordCount = (str) => FE.tokenize(str).filter((t) => t.type === 'word').length;
  /* plain text of a unit string (for aria labels, validation) */
  FE.plain = function (str) {
    return FE.tokenize(str).map((t) => (t.type === 'plus' ? '+' : (t.lead || '') + (t.text || '') + (t.trail || ''))).join(' ');
  };

  /* shade a hex colour: amt -1..1 */
  FE.shade = function (hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
    r = f(r); gg = f(gg); b = f(b);
    return '#' + ((1 << 24) | (r << 16) | (gg << 8) | b).toString(16).slice(1);
  };
  FE.mix = function (a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  };
  FE.fmtTime = function (s) {
    s = Math.max(0, Math.floor(s));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };
  FE.reduced = () => g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches;
})(window);
