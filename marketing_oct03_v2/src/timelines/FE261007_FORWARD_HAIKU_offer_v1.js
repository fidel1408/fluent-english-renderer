/* FE261007_FORWARD_HAIKU_offer_v1 – LOOKING FORWARD TO (REV4 timing, cues and SFX kept exactly; visuals rebuilt around the free-week offer). */
(function (root) {
  const NAME = 'FE261007_FORWARD_HAIKU_offer_v1';
  function plan(cues) {
    const c = {}; cues.forEach(q => c[q.id] = q); const S = q => q.cs ?? q.start, E = q => q.ce ?? q.end, mk = (q, k, d) => (q.marks && q.marks[k] !== undefined) ? q.marks[k] : d, K = {};
    // --- identical to looking_forward_to (REV4) so the cue audio and SFX land on the same samples
    K.hookEnd = E(c.c01) + .45; K.calIn = S(c.c02) - .5; K.b1 = S(c.c02) - .1; K.travelS = S(c.c02) + .15; K.travelE = K.travelS + 1.0; K.b2 = S(c.c03) - .1; K.dlgOut = E(c.c03) + .9;
    K.fcIn = S(c.c04) - .5; K.rule = S(c.c04) + .1; K.ruleIng = c.c04.start + mk(c.c04, 'ingStart', 2.37) - .05; K.seeHl = S(c.c05) + .2; K.tr1 = S(c.c05) + .45;
    K.nounChip = S(c.c06) + .55; K.noun = K.nounChip + .3; K.nounHl = c.c06.start + mk(c.c06, 'nounStart', 1.4) + .85; K.swap = K.noun;
    K.nounHold = 2.7; K.nvOut = Math.max(E(c.c06) + .55, K.noun + .5 + K.nounHold);
    K.prIn = S(c.c07) - .5; K.q = S(c.c08) - .1; K.box = S(c.c07) + 1.4; K.cta = E(c.c08) + .25; K.avOut = K.cta - .1;
    K.end = Math.round((E(c.c08) + 4.29) * 10) / 10;  // = 29.1 s (manifest duration): CTA hold is K.cta .. end (~3.8 s)
    const sfx = [{ type: 'pop', at: .12 }, { type: 'swish', at: K.hookEnd - .3 }, { type: 'swish', at: K.calIn }, { type: 'pop', at: K.b1 }, { type: 'whoosh', at: K.travelS }, { type: 'ding', at: K.travelE },
      { type: 'pop', at: K.b2 }, { type: 'swish', at: K.dlgOut }, { type: 'pop', at: K.fcIn }, { type: 'tick', at: K.rule }, { type: 'tick', at: K.ruleIng }, { type: 'tick', at: K.seeHl }, { type: 'tick', at: K.tr1 },
      { type: 'swish', at: K.nounChip }, { type: 'tick', at: K.noun }, { type: 'tick', at: K.nounHl }, { type: 'swish', at: K.nvOut }, { type: 'pop', at: K.prIn + .1 }, { type: 'pop', at: K.q }, { type: 'tick', at: K.box }, { type: 'swish', at: K.cta - .2 }, { type: 'tick', at: K.cta + .3 }];
    // --- visual windows (states of the one lesson card; each state fades out before the next fades in)
    K.stA = [0, K.fcIn - .3]; K.stR = [K.fcIn, K.nounChip - .3]; K.stN = [K.nounChip, K.nvOut - .3]; K.stP = [K.prIn, K.cta - .3]; K.stC = [K.cta + .05, K.end];
    K.holds = [
      { id: 'offer_card_frame0_to_end', from: 0, to: K.end, min: 3.0, rects: [[110, 468, 900, 820]] },
      { id: 'lesson_example_settled', from: .5, to: K.fcIn - .3, min: 2.5, rects: [[110, 832, 900, 1100]] },
      { id: 'closing_cta_hold', from: K.cta + .5, to: null, min: 3.0, rects: [[110, 468, 900, 1100]] }];
    K.required = [
      ['Tu primera semana', 0, K.end], ['de inglés', 0, K.end], ['GRATIS', 0, K.end],
      ['Solo pagas si decides', 0, K.end], ['continuar.', 0, K.end],
      ['I’m looking forward', 0, K.fcIn - .3], ['to seeing you.', 0, K.fcIn - .3], ['Tengo muchas ganas', 0, K.fcIn - .3], ['de verte.', 0, K.fcIn - .3],
      ['look forward to', K.fcIn + .3, K.nounChip - .3], ['+ verbo en -ing', K.fcIn + .3, K.nounChip - .3], ['seeing you.', K.fcIn + .3, K.nounChip - .3],
      ['+ sustantivo', K.nounChip + .3, K.nvOut - .3], ['the weekend.', K.nounChip + .3, K.nvOut - .3],
      ['¿Cómo la completas?', K.prIn + .4, K.cta - .3],
      ['Escríbenos', K.cta + .5, K.end], ['SEMANA GRATIS', K.cta + .5, K.end]];
    return { K, sfx };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { plan }; else (root.TL = root.TL || {})[NAME] = { plan };
})(typeof window !== 'undefined' ? window : globalThis);
