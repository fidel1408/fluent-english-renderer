/* FE261028-USED – keyed to measured speech activity of the supplied take-2 narration. A past habit that changed (not a claim soccer is impossible now); the completion stays blank. */
(function (root) {
  const NAME = 'used_to';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.start + q.marks[k] : d, K = {};
    K.hookOut = S(c.c02) - 1.25;
    K.exIn = S(c.c02) - .9; K.exOut = S(c.c04) - 1.25;                  // quoted example + translation as one state
    K.ruIn = S(c.c04) - .9; K.usedAt = mk(c.c05, 'usedToStart', S(c.c05)); K.playAt = mk(c.c05, 'playStart', S(c.c05) + 2.9); K.ruOut = S(c.c06) - 1.25;
    K.prIn = S(c.c06) - .9; K.quIn = S(c.c08) - .45; K.prOut = S(c.c09) - 1.25;
    K.cta = S(c.c09) - .9; K.avOut = 1e9; K.end = E(c.c10) + 3.5;
    K.scenes = [{ id: 'hook', in: .0, end: K.hookOut + .3 }, { id: 'example', in: K.exIn, end: K.exOut + .3 }, { id: 'rule', in: K.ruIn, end: K.ruOut + .3 }, { id: 'practice', in: K.prIn, end: K.prOut + .3 }, { id: 'cta', in: K.cta, end: K.end + 1 }];
    const ST = [90, 455, 925, 610], CD = [110, 675, 900, 1090];
    K.holds = [
      { id: 'example_bilingual', from: K.exIn + .75, to: K.exOut, min: 2.5, rects: [ST, CD] },
      { id: 'rule_card', from: K.playAt + .55, to: K.ruOut, min: 2.5, rects: [ST, CD] },
      { id: 'practice_unanswered', from: K.prIn + .8, to: K.prOut, min: 3.0, rects: [[110, 505, 900, 900]] },
      { id: 'practice_after_question', from: E(c.c08), to: K.prOut, min: 3.0, rects: [[110, 505, 900, 900]] },
      { id: 'cta', from: K.cta + .95, to: null, min: 3.0, rects: [[110, 490, 900, 830]] }];
    K.required = [['Algo que', 0.6, S(c.c02) - 1.25], ['I used to play', S(c.c02) - .1, E(c.c03)], ['soccer after school.', S(c.c02) - .1, E(c.c03)], ['Antes jugaba fútbol', S(c.c02) - .1, E(c.c03)], ['EJEMPLO', S(c.c02) - .1, E(c.c03)],
      ['Un hábito de antes', S(c.c04) - .1, E(c.c05)], ['que ya cambió', S(c.c04) - .1, E(c.c05)], ['USED TO + verbo base', S(c.c04) - .1, E(c.c05)], ['play', S(c.c04) - .1, E(c.c05)], ['I used to', K.prIn + .8, K.prOut], ['¿Cómo completarías', S(c.c08) - .1, K.prOut], ['GRUPO', K.cta + .9, K.end]];
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookOut }, { type: 'pop', at: K.exIn + .1 }, { type: 'swish', at: K.exOut }, { type: 'pop', at: K.ruIn + .1 }, { type: 'tick', at: K.usedAt }, { type: 'tick', at: K.playAt }, { type: 'swish', at: K.ruOut },
      { type: 'pop', at: K.prIn + .1 }, { type: 'tick', at: K.quIn }, { type: 'swish', at: K.prOut }, { type: 'pop', at: K.cta + .1 }, { type: 'tick', at: K.cta + .6 }];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
