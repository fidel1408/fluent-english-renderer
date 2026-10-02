/* UI helpers shared by lesson content and the engine. */
(function (FE) {
  'use strict';
  const U = FE.ui = {};
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  U.esc = esc;
  const fix = (s) => String(s).replace(/'/g, '’'); // typographic apostrophe for display
  U.fix = fix;

  /* T(): English text with an IPA line beneath (shown only in Captions + IPA mode).
     Markup: [[word]] highlights a word. IPA is assembled word-by-word from the lesson dictionary. */
  U.T = function (text, cls = '', opt = {}) {
    const plain = String(text).replace(/\[\[|\]\]/g, '');
    const html = esc(text).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>').replace(/'/g, '’');
    const ip = opt.noipa ? '' : FE.ipaOf(plain);
    return `<span class="tx ${cls}"><span class="en">${html}</span>${ip ? `<span class="ipa" aria-hidden="true">${esc(ip)}</span>` : ''}</span>`;
  };
  U.plain = (t) => String(t).replace(/\[\[|\]\]/g, '');

  /* answer normaliser: case, curly quotes, punctuation, spacing */
  U.norm = (s) => String(s).toLowerCase().replace(/[‘’ʼ`]/g, "'").replace(/[.,!?;:"“”]/g, ' ').replace(/\s+/g, ' ').trim();
  U.accepts = (input, list) => { const n = U.norm(input); return list.some((a) => U.norm(a) === n); };

  U.speaker = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  U.spk = (say, label = 'Replay') => `<button class="spk" data-act="say" data-say="${esc(say)}" aria-label="${esc(label)}: ${esc(say)}" title="${esc(label)}">${U.speaker}</button>`;

  U.hd = (step, sub) => `<div class="hd"><span class="pill phase">${esc(step.phase || '')}</span><h2>${U.T(step.title, 'h')}</h2>${sub ? `<p class="sub">${U.T(sub)}</p>` : ''}</div>`;
  U.meaning = (t) => `<div class="meaning"><b class="lab">${U.T('Meaning')}</b>${U.T(t)}</div>`;
  U.ans = (inner, cls = '') => `<div class="ans ${cls}">${inner}</div>`;
  U.fact = (icon, label, text) => `<div class="fact">${FE.icon(icon)}<div><b>${U.T(label)}</b>${U.T(text)}</div></div>`;
  U.note = (t, cls = '') => `<div class="note ${cls}">${U.T(t)}</div>`;
  U.frames = (lines) => `<div class="frames" data-frames>${lines.map((l) => `<div class="frame">${U.T(l)}</div>`).join('')}</div>`;
  U.tag = (text, x, y) => `<div class="tag" style="left:${x}%;top:${y}%">${U.T(text, 'tg')}</div>`;

  /* typed practice input (optional): checks against every accepted form */
  U.typed = (accepted, hint) => `<div class="typed" data-accepted="${esc(JSON.stringify(accepted))}" data-hint="${esc(hint || '')}">
      <label class="lab2" for="ti-${accepted[0].length}-${Math.abs(U.hash(accepted[0]))}">${U.T('Optional: type your answer', 'sm')}</label>
      <div class="row"><input id="ti-${accepted[0].length}-${Math.abs(U.hash(accepted[0]))}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="fb-typed">
      <button class="btn" data-act="check">Check</button></div>
      <div class="fb" id="fb-typed" role="status" aria-live="polite"></div></div>`;
  U.hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };

  /* feedback for typed contraction / repair answers */
  U.typedFeedback = (input, accepted, hint) => {
    if (!input.trim()) return { ok: false, msg: 'Type a sentence first, or say it aloud and press Reveal.' };
    if (U.accepts(input, accepted)) return { ok: true, msg: 'Yes. That is correct.' + (accepted.length > 1 ? ' Every form shown in the answer list is standard.' : '') };
    const n = U.norm(input);
    if (accepted.some((a) => U.norm(a).replace(/'/g, '') === n.replace(/'/g, ''))) return { ok: false, msg: 'Almost! Check the apostrophe (’). It goes where a letter is missing.' };
    return { ok: false, msg: hint || 'Not yet. Check the subject, the be word, and where not goes.' };
  };

  /* ---------- Sentence-builder diagnosis (agreement + position of not) ---------- */
  const BE = { I: 'am', You: 'are', We: 'are', They: 'are', He: 'is', She: 'is', It: 'is' };
  U.BE = BE;
  U.diagnose = (subj, built, rest) => {
    const be = BE[subj], b = built.map((x) => x.toLowerCase());
    const target = [subj.toLowerCase(), be, 'not', rest.toLowerCase()];
    if (b.join('|') === target.join('|')) return { ok: true, msg: `${subj} goes with ${be}. Not comes after ${be}: ${subj} ${be} not ${rest}.` };
    if (!built.length) return { ok: false, msg: 'Tap the words to build the sentence: subject + be + not + the rest.' };
    const bes = ['am', 'is', 'are'].filter((w) => b.includes(w));
    if (bes.length > 1) return { ok: false, msg: 'Use only one be word. ' + `${subj} goes with ${be}.` };
    if (bes.length === 1 && bes[0] !== be) return { ok: false, msg: `Check agreement: ${subj} goes with ${be}, not ${bes[0]}.` };
    if (!b.includes('not')) return { ok: false, msg: `A negative sentence needs not. Put not after ${be}.` };
    if (b.indexOf('not') < b.indexOf(be) && b.includes(be)) return { ok: false, msg: `Not comes after ${be}, not before it: ${subj} ${be} not …` };
    if (!b.includes(be)) return { ok: false, msg: `Add the be word: ${subj} goes with ${be}.` };
    if (b[0] !== subj.toLowerCase()) return { ok: false, msg: 'Start with the subject: ' + subj + '.' };
    if (!b.includes(rest.toLowerCase())) return { ok: false, msg: 'Add the last part: ' + rest + '.' };
    return { ok: false, msg: `Almost. The order is subject + ${be} + not + ${rest}.` };
  };

  /* CSV/JSON download helper (explicit user action only) */
  U.download = (name, text, mime) => {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
})(window.FE = window.FE || {});
