/* Shared scene pieces for all videos (depends on engine.js). */
const KIT = (() => {
  const { CX, C, E, seg, text, tokens, pill, card, tail, avatar, caption, measure, rr, FONT } = FE;
  const CARD_X = 72, CARD_W = 868;
  const fit = (c, s, maxW, font, weight = 700) => Math.min(font, maxW / measure(c, s, 100, weight) * 100);
  function logoSmall(c, a) { if (a <= 0 || !window.LOGO) return; const w = 330, h = w * 1181 / 2640; c.save(); c.globalAlpha *= a; c.drawImage(window.LOGO, 405, 348, 2640, 1181, 72, 205, w, h); c.restore(); }
  function logoBig(c, w, cy, a) { if (a <= 0 || !window.LOGO) return; const h = w * 1181 / 2640; c.save(); c.globalAlpha *= a; c.drawImage(window.LOGO, 405, 348, 2640, 1181, CX - w / 2, cy, w, h); c.restore(); }
  // woman left / man right, peeking over the ledge. mood/talk per frame. y,sc let dense scenes use smaller heads.
  function pair(c, t, { enter = 1, out = 0, moodW = 'listen', moodM = 'listen', talkW = 0, talkM = 0, y = 1205, sc = 1.4 } = {}) {
    if (out >= 1) return; const dy = (1 - E.back(enter)) * 300 + E.in(out) * 330;
    avatar(c, 'woman', 190, y + dy, t, { mood: moodW, talk: talkW, sc }); avatar(c, 'man', 790, y + dy, t, { mood: moodM, talk: talkM, sc });
  }
  // generic rounded box (bubble) with optional tail; fill/stroke colours
  function box(c, x, y, w, h, { fill = C.cream, stroke = null, a = 1, sc = 1, r = 56 } = {}) {
    c.save(); c.globalAlpha *= a; c.translate(x + w / 2, y + h / 2); c.scale(sc, sc); c.translate(-(x + w / 2), -(y + h / 2));
    c.shadowColor = 'rgba(4,10,20,.45)'; c.shadowBlur = 34; c.shadowOffsetY = 14; c.fillStyle = fill; rr(c, x, y, w, h, r); c.fill(); c.shadowColor = 'transparent';
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 8; rr(c, x + 4, y + 4, w - 8, h - 8, r - 4); c.stroke(); } c.restore();
  }
  function commentBox(c, t, y, a, placeholder, caret = true) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a; c.fillStyle = C.navy2; rr(c, CARD_X, y, CARD_W, 110, 40); c.fill(); c.strokeStyle = C.mint; c.lineWidth = 5; rr(c, CARD_X, y, CARD_W, 110, 40); c.stroke();
    text(c, placeholder, CARD_X + 44, y + 72, 52, 'rgba(255,247,235,.62)', { weight: 500, align: 'left' });
    if (caret && Math.floor(t * 1.8) % 2 === 0) { c.fillStyle = C.mint; c.fillRect(CARD_X + 44 + measure(c, placeholder, 52, 500) + 10, y + 30, 6, 60); } c.restore();
  }
  // discreet CTA block: factual text only
  function cta(c, y, a) {
    if (a <= 0) return; c.save(); c.globalAlpha *= a;
    c.fillStyle = 'rgba(16,30,52,.92)'; rr(c, CARD_X, y, CARD_W, 190, 44); c.fill(); c.strokeStyle = 'rgba(114,216,198,.5)'; c.lineWidth = 3; rr(c, CARD_X, y, CARD_W, 190, 44); c.stroke();
    text(c, 'Clases en línea', CX, y + 82, 66, C.cream);
    c.font = `700 46px ${FONT}`; const pw = 214, w1 = c.measureText('Manda ').width, w2 = c.measureText(' por mensaje privado').width, tot = w1 + pw + 22 + w2, x0 = CX - tot / 2;
    text(c, 'Manda', x0 + w1 / 2, y + 156, 46, C.cream);
    c.fillStyle = C.coral; rr(c, x0 + w1, y + 110, pw, 60, 30); c.fill(); text(c, 'GRUPO', x0 + w1 + pw / 2, y + 155, 42, C.navy);
    text(c, 'por mensaje privado', x0 + w1 + pw + 22 + w2 / 2, y + 156, 46, C.cream); c.restore();
  }
  // 1 only while the educator is actually speaking: measured speech islands (silence padding excluded); whole speech window only for audio-pending previews
  function speaking(t, cues) {
    for (const q of cues) {
      if (q.islands && q.islands.length) { for (const i of q.islands) if (t >= q.start + i.s && t <= q.start + i.e) return 1; }
      else if (!q.audio && t >= (q.cs ?? q.start) && t <= (q.ce ?? q.end)) return 1;
    }
    return 0;
  }
  function clipRR(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); c.clip(); }
  return { speaking, clipRR, CARD_X, CARD_W, fit, logoSmall, logoBig, pair, box, commentBox, cta };
})();
