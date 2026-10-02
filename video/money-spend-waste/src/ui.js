// On-screen text: English teaching cards (with IPA), Spanish caption pills, CTA button.
import { C, f, esc, pop, seg, smooth } from './util.js';

let _ctx;
export function measure(text, font) {
  if (!_ctx) _ctx = document.createElement('canvas').getContext('2d');
  _ctx.font = font;
  return _ctx.measureText(text).width;
}
export const ENG_FONT = (px) => `900 ${px}px Nunito`;
export const IPA_FONT = (px) => `500 ${px}px "Noto Sans"`;

// mode: 0 = off, 1 = captions, 2 = captions + IPA
export function sentenceCard(S, t, mode, opts = {}) {
  if (mode < 1) return '';
  const [a, b] = S.shown;
  if (t < a || t > b) return '';
  const cx = opts.cx ?? 540, cy = opts.cy ?? 400, maxW = opts.maxW ?? 760;
  const engPx = opts.engPx ?? 62, ipaPx = 36;
  const showIpa = mode >= 2;
  const gap = 30;
  // build columns
  const cols = S.words.map((w, i) => {
    const ew = measure(w.w, ENG_FONT(engPx));
    const pw = w.punct ? measure(w.punct, ENG_FONT(engPx)) : 0;
    const iw = showIpa && w.ipa ? measure('/' + w.ipa + '/', IPA_FONT(ipaPx)) : 0;
    return { ...w, i, ew, pw, iw, cw: Math.max(ew, iw) };
  });
  // wrap: single line if it fits, otherwise the most balanced 2-line split
  const colW = (c) => c.cw + c.pw;
  const rowW = (arr) => arr.reduce((a, c, i) => a + colW(c) + (i ? gap : 0), 0);
  let lines = [cols];
  if (rowW(cols) > maxW) {
    let best = null;
    for (let k = 1; k < cols.length; k++) { const a = cols.slice(0, k), b = cols.slice(k); const m = Math.max(rowW(a), rowW(b)); if (!best || m < best.m) best = { m, a, b }; }
    lines = [best.a, best.b];
  }
  const lineH = engPx + (showIpa ? ipaPx + 20 : 0) + 18;
  const widths = lines.map(rowW);
  const innerW = Math.max(...widths);
  const cardW = innerW + 90, cardH = lines.length * lineH + 44;
  const sc = pop(t, a, 0.5);
  const fade = 1 - seg(t, b - 0.3, b);
  const x0 = -cardW / 2, y0 = -cardH / 2;
  let body = '';
  lines.forEach((l, li) => {
    let x = -widths[li] / 2;
    const base = y0 + 22 + li * lineH + engPx * 0.82;
    l.forEach((c) => {
      const mid = x + c.cw / 2;
      const hlIdx = S.hl.findIndex((v, k) => t >= v && t < (S.hl[k + 1] ?? v + 0.5));
      const isHl = hlIdx === c.i;
      const isFocus = S.focus.includes(c.w.toLowerCase());
      const fill = isHl ? S.color : (isFocus ? S.color : C.navy);
      const isBlank = c.w === '___';
      const wiggle = isHl ? -4 : 0;
      if (isBlank) {
        const blink = 0.55 + 0.45 * Math.sin(t * 5);
        body += `<rect x="${f(mid - c.ew / 2)}" y="${f(base - 8)}" width="${f(c.ew)}" height="9" rx="4.5" fill="${C.gold}" opacity="${f(blink)}"/>`;
      } else {
        body += `<text x="${f(mid)}" y="${f(base + wiggle)}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="${engPx}" fill="${fill}">${esc(c.w)}</text>`;
        if (isFocus) body += `<rect x="${f(mid - c.ew / 2)}" y="${f(base + 10 + wiggle)}" width="${f(c.ew)}" height="6" rx="3" fill="${S.color}" opacity=".9"/>`;
      }
      if (c.punct) body += `<text x="${f(x + c.cw / 2 + c.ew / 2 + 1)}" y="${f(base)}" font-family="Nunito" font-weight="900" font-size="${engPx}" fill="${C.navy}">${esc(c.punct)}</text>`;
      if (showIpa && c.ipa) body += `<text x="${f(mid)}" y="${f(base + 14 + ipaPx)}" text-anchor="middle" font-family="Noto Sans" font-weight="500" font-size="${ipaPx}" fill="${isHl ? S.color : '#35507A'}">/${esc(c.ipa)}/</text>`;
      x += c.cw + c.pw + gap;
    });
  });
  return `<g data-ui="card" transform="translate(${cx} ${cy}) scale(${f(sc)})" opacity="${f(fade)}">
    <rect x="${f(x0 + 6)}" y="${f(y0 + 10)}" width="${f(cardW)}" height="${f(cardH)}" rx="38" fill="#000" opacity=".22"/>
    <rect x="${f(x0)}" y="${f(y0)}" width="${f(cardW)}" height="${f(cardH)}" rx="38" fill="${C.ivory}" stroke="${S.color}" stroke-width="7"/>
    ${body}</g>`;
}

export function captionPill(lines, t, c, mode, opts = {}) {
  if (mode < 1 || !c) return '';
  const cy = opts.cy ?? 1470, px = 54, lh = 66;
  const w = Math.max(...lines.map(l => measure(l, `800 ${px}px Nunito`))) + 76;
  const h = lines.length * lh + 34;
  const a = smooth(seg(t, c.t0, c.t0 + 0.18)) * (1 - smooth(seg(t, c.t1 - 0.18, c.t1)));
  if (a <= 0.01) return '';
  const dy = (1 - a) * 14;
  let txt = '';
  lines.forEach((l, i) => { txt += `<text x="0" y="${f(-h / 2 + 17 + lh * (i + 0.76))}" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="${px}" fill="${C.ivory}">${highlightEs(l)}</text>`; });
  return `<g data-ui="caption" transform="translate(540 ${f(cy + dy)})" opacity="${f(a)}">
    <rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(44, h / 2))}" fill="#071731" opacity=".9"/>${txt}</g>`;
}
function highlightEs(l) {
  return esc(l).replace(/(Spend|Waste|Fluent English|“INGLÉS”)/g, `<tspan fill="${C.gold}">$1</tspan>`);
}

export function ctaButton(t, a) {
  const k = pop(t, a, 0.55);
  if (k <= 0) return '';
  const pulse = 1 + Math.sin(t * 4.2) * 0.012;
  const font = `900 58px Nunito`;
  const w1 = measure('Escríbenos ', font), w2 = measure('INGLÉS', font);
  const W = w1 + w2 + 190, H = 128;
  return `<g data-ui="cta" transform="translate(540 1236) scale(${f(k * pulse)})">
    <rect x="${f(-W / 2 + 6)}" y="${-H / 2 + 10}" width="${f(W)}" height="${H}" rx="64" fill="#000" opacity=".25"/>
    <rect x="${f(-W / 2)}" y="${-H / 2}" width="${f(W)}" height="${H}" rx="64" fill="${C.emerald}" stroke="#fff" stroke-width="6"/>
    <g transform="translate(${f(-W / 2 + 62)} 0)"><circle r="34" fill="#fff"/><path d="M-17,-2 L19,-17 L9,19 L2,5Z M2,5 L19,-17" fill="${C.emerald}" stroke="${C.emerald}" stroke-width="3" stroke-linejoin="round"/></g>
    <text x="${f(-W / 2 + 118)}" y="20" font-family="Nunito" font-weight="900" font-size="58" fill="#fff">Escríbenos <tspan fill="${C.gold}">INGLÉS</tspan></text></g>`;
}
