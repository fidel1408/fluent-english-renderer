/* Fluent English - Love Speaking Club : helpers shared by all chapter modules. */
(function (g) {
  'use strict';
  const LC = g.LC, I = g.I;
  const CH = {};
  CH.btn = (label, act, arg, cls, extra) => `<button class="btn ${cls || 'btn-coral'}" data-act="${act}"${arg != null ? ` data-arg="${arg}"` : ''} type="button"${extra ? ' ' + extra : ''}>${I(label)}</button>`;
  CH.card = (style, cls, inner, k) => `<div class="card ${cls || ''}" style="${style || ''}"${k ? ` data-k="${k}"` : ''}>${inner}</div>`;
  CH.chip = (label, cls) => `<span class="chip ${cls || ''}">${I(label)}</span>`;
  CH.chips = (list, cls) => `<div class="row" style="gap:12px">${list.map((x) => CH.chip(x, cls)).join('')}</div>`;
  CH.eyebrow = (n, label) => `<div class="kicker"><span class="num-badge" aria-hidden="true">${n}</span><span class="t-eyebrow">${I(label)}</span></div>`;
  /* Demo Mode: the sample answer is shown on request through the labeled 'Demo sample' chip (engine.js), so it never competes for space. */
  CH.demo = (ctx, text) => { if (ctx.demo && text) ctx.demoText = text; return ''; };
  CH.dots = (n, cur) => `<div class="dotrow" role="img" aria-label="progress">${Array.from({ length: n }, (_, i) => `<span class="dot${i < cur ? ' on' : ''}${i === cur ? ' cur' : ''}"></span>`).join('')}</div>`;
  /* anonymous marker row */
  CH.marks = (n, cls, cap) => { const m = Math.min(n, cap || 14); return Array.from({ length: m }, () => `<span class="mk ${cls || ''}"></span>`).join('') + (n > m ? `<b class="t-small" style="margin-left:4px">+${n - m}</b>` : ''); };
  CH.next = (ctx, label) => `<button class="btn btn-coral" data-act="next" type="button">${I(label || 'Continue')}</button>`;
  CH.toggle = (on, label, act, arg, light) => `<button class="btn ${on ? 'btn-teal' : (light ? 'btn-ghost ivory' : 'btn-ghost')} xs" data-act="${act}"${arg != null ? ` data-arg="${arg}"` : ''} aria-pressed="${!!on}" type="button">${I(label)}</button>`;
  CH.support = (list, dark) => `<div class="supportbar">${list.map((x) => `<span class="chip ${dark ? 'navy' : ''}">${I(x)}</span>`).join('')}</div>`;
  CH.get = (obj, k, d) => (obj[k] === undefined ? (obj[k] = d) : obj[k]);
  CH.G = (fn) => fn; // marker for readability
  g.CH = CH;
})(window);
