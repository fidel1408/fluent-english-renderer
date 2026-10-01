/* text.js — word + IPA paired layout.
   Every English word is a "unit": the word with its American IPA centred directly beneath it.
   Punctuation attaches to its word but never receives IPA, and wrapping can never separate a word
   from its IPA because a unit is measured and placed as one block.                                */
'use strict';

const F_WORD = '"Lexend", system-ui, "Segoe UI", sans-serif';
const F_IPA = '"FEIPA", "FEIPAGreek", "Andika", "Noto Sans", "DejaVu Sans", "Segoe UI", sans-serif';
const F_SERIF = '"Source Serif 4", Georgia, serif';

const IPA_STYLE = { // see README: symbol conventions follow the Fluent English renderer samples (i, u without length mark)
  keepLongIU: false,
};
const _miss = new Set(), _used = new Set();
window.__missingIPA = _miss; window.__usedWords = _used;

const _mctx = document.createElement('canvas').getContext('2d');
const _wm = new Map();
function measure(font, str) { const k = font + '|' + str; let w = _wm.get(k); if (w === undefined) { _mctx.font = font; w = _mctx.measureText(str).width; _wm.set(k, w); } return w; }

const OPEN = new Set(['“', '‘', '(', '"', '¿', '¡']);
function ipaFor(word, override) {
  if (override) return override;
  const key = word.toLowerCase().replace(/’/g, "'");
  _used.add(key);
  let v = (window.IPA_DICT || {})[key];
  if (v == null) { _miss.add(key); return '?'; }
  if (IPA_STYLE.keepLongIU) v = v.replace(/i(?!ː)/g, 'iː').replace(/u(?!ː)/g, 'uː');
  return v;
}

/* parse "Have you {read|rɛd} it?" -> units */
function parseUnits(str) {
  const re = /\{([^|}]+)\|([^}]+)\}|([A-Za-z0-9]+(?:['’][A-Za-z]+)*)|(\s+)|([^\sA-Za-z0-9])/g;
  const units = []; let lead = '', m, pendingSpace = false;
  while ((m = re.exec(str))) {
    if (m[1] || m[3]) {
      const word = m[1] || m[3];
      units.push({ lead, word, trail: '', ipa: ipaFor(word, m[2]), sp: pendingSpace || units.length === 0 });
      lead = ''; pendingSpace = false;
    } else if (m[4]) pendingSpace = true;
    else {
      const ch = m[5];
      if (OPEN.has(ch) || !units.length) lead += ch; else units[units.length - 1].trail += ch;
    }
  }
  return units;
}

/* style: {size, ipa(size), wfont, wweight, ifont} -> measured units */
const _lay = new Map();
function measureUnits(str, o) {
  const key = str + '|' + o.size + '|' + (o.ipa || '') + '|' + (o.weight || '') + '|' + (o.serif ? 1 : 0);
  let L = _lay.get(key); if (L) return L;
  const size = o.size, isz = o.ipa || Math.round(size * 0.58);
  const wf = `${o.weight || 500} ${size}px ${o.serif ? F_SERIF : F_WORD}`, lf = `${o.serif ? 700 : o.weight || 500} ${size}px ${o.serif ? F_SERIF : F_WORD}`, inf = `400 ${isz}px ${F_IPA}`;
  const units = parseUnits(str);
  for (const u of units) {
    u.ww = measure(wf, u.word); u.lw = u.lead ? measure(wf, u.lead) : 0; u.tw = u.trail ? measure(wf, u.trail) : 0;
    u.iw = measure(inf, u.ipa);
    const half = Math.max(u.ww / 2 + Math.max(u.lw, u.tw), u.iw / 2 + 2);
    u.w = half * 2;
  }
  L = { units, size, isz, wf, inf, gap: Math.round(size * 0.30), lineH: Math.round(size * 1.12 + isz * 1.38 + 6), str };
  _lay.set(key, L); return L;
}

/* wrap units into lines no wider than maxW (0 = single line). returns {lines:[{idx:[],w}], w, h} */
function flow(L, maxW) {
  const lines = []; let cur = [], cw = 0;
  L.units.forEach((u, i) => {
    const add = u.w + (cur.length ? L.gap : 0);
    if (maxW && cur.length && cw + add > maxW) { lines.push({ idx: cur, w: cw }); cur = [i]; cw = u.w; }
    else { cur.push(i); cw += add; }
  });
  if (cur.length) lines.push({ idx: cur, w: cw });
  const w = Math.max(0, ...lines.map(l => l.w));
  return { lines, w, h: lines.length * L.lineH - 6 };
}
function balancedFlow(L, maxW) { // try to avoid a dangling single word on the last line
  let f = flow(L, maxW);
  if (f.lines.length > 1) {
    let lo = Math.max(...L.units.map(u => u.w)), hi = maxW, best = f;
    for (let i = 0; i < 9; i++) { const mid = (lo + hi) / 2, g = flow(L, mid); if (g.lines.length <= f.lines.length) { best = g; hi = mid; } else lo = mid; }
    f = best;
  }
  return f;
}

/* draw: (x,y) = top-left of the block. align 'c' centres each line inside `w`. opts: color(i)|string, ipaColor, alpha, hi:{idx:color}, strike:Set */
function drawFlow(ctx, L, F, x, y, o = {}) {
  const w = o.w || F.w, align = o.align || 'c';
  ctx.save(); ctx.textBaseline = 'alphabetic';
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  const base = L.size * 0.86;
  F.lines.forEach((ln, li) => {
    let cx = align === 'c' ? x + (w - ln.w) / 2 : align === 'l' ? x : x + w - ln.w;
    const by = y + li * L.lineH + base;
    for (const i of ln.idx) {
      const u = L.units[i], mid = cx + u.w / 2;
      const col = typeof o.color === 'function' ? o.color(i, u) : (o.color || '#14213D');
      const ic = typeof o.ipaColor === 'function' ? o.ipaColor(i, u) : (o.ipaColor || 'rgba(20,33,61,.72)');
      if (o.hi && o.hi[i]) {
        ctx.fillStyle = o.hi[i]; ctx.beginPath(); rrect(ctx, mid - u.w / 2 - 6, by - L.size * 0.86 - 2, u.w + 12, L.lineH - 8, 12); ctx.fill();
      }
      ctx.font = L.wf; ctx.fillStyle = col; ctx.textAlign = 'center';
      ctx.fillText(u.word, mid, by);
      if (u.lead) { ctx.textAlign = 'right'; ctx.fillText(u.lead, mid - u.ww / 2, by); }
      if (u.trail) { ctx.textAlign = 'left'; ctx.fillText(u.trail, mid + u.ww / 2, by); }
      if (o.strike && o.strike.has(i)) { ctx.strokeStyle = o.strikeColor || '#D64550'; ctx.lineWidth = Math.max(3, L.size * 0.08); ctx.beginPath(); ctx.moveTo(mid - u.ww / 2 - 4, by - L.size * 0.3); ctx.lineTo(mid + u.ww / 2 + 4, by - L.size * 0.34); ctx.stroke(); }
      ctx.font = L.inf; ctx.fillStyle = ic; ctx.textAlign = 'center';
      ctx.fillText(u.ipa, mid, by + L.isz * 1.28 + 2);
      cx += u.w + L.gap;
    }
  });
  ctx.restore();
}

/* A reusable text block: T('She has finished.', {size:56}) -> {draw(ctx,x,y,opts), w, h, L, F} */
function T(str, o = {}) {
  o = Object.assign({ size: 44, maxW: 0, balanced: true }, o);
  const L = measureUnits(str, o), F = o.maxW ? (o.balanced ? balancedFlow(L, o.maxW) : flow(L, o.maxW)) : flow(L, 0);
  return { L, F, w: F.w, h: F.h, str, draw(ctx, x, y, opts) { drawFlow(ctx, L, F, x, y, opts); },
    // centre of unit i relative to block top-left (for arrows/brackets)
    unitBox(i) { for (let li = 0; li < F.lines.length; li++) { const ln = F.lines[li]; if (ln.idx.includes(i)) { let cx = (F.w - ln.w) / 2; for (const j of ln.idx) { if (j === i) return { x: cx, y: li * L.lineH, w: L.units[j].w, h: L.lineH - 8, cx: cx + L.units[j].w / 2 }; cx += L.units[j].w + L.gap; } } } return null; } };
}
function wordIndex(t, word) { return t.L.units.findIndex(u => u.word.toLowerCase() === word.toLowerCase()); }
