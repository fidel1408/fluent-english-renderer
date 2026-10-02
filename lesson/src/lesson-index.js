/* ============================================================
   LESSON — nine sections, default timers total exactly 60:00
   ============================================================ */
const LESSON = [CH1, CH2, typeof CH3 !== 'undefined' && CH3, typeof CH4 !== 'undefined' && CH4, typeof CH5 !== 'undefined' && CH5, typeof CH6 !== 'undefined' && CH6, typeof CH7 !== 'undefined' && CH7, typeof CH8 !== 'undefined' && CH8, typeof CH9 !== 'undefined' && CH9].filter(Boolean);
(function () {
  let t = 0; const mm = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  LESSON.forEach(c => { c.time = mm(t) + '–' + mm(t + c.min * 60); t += c.min * 60; });
})();
