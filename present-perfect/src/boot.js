/* boot.js — load fonts + logo, initialise the engine, expose renderAt(t) */
'use strict';
const FONT_LOADS = ['500 40px "Lexend"', '700 40px "Lexend"', '700 40px "Source Serif 4"', '400 24px "FEIPA"', '400 24px "FEIPAGreek"'];
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function boot(canvas, srcs) {
  await Promise.all(FONT_LOADS.map(f => document.fonts.load(f, 'AaIPAɑæɛəɚɝɪʊʌɔŋθðʃʒɡɹˈˌː').catch(() => 0)));
  await document.fonts.ready;
  const logoBlue = await loadImg(srcs.logoBlue);
  Eng.init(window.TIMELINE, GROUPS, { logoBlue });
  // build every caption block up front so missing IPA is discovered at load, not mid-playback
  for (const b of window.TIMELINE.beats) for (const l of b.lines) if (l.phrases) for (const p of l.phrases) capBlock(p.text);
  for (const n of Object.keys(SCENE_BUILDERS)) getScene(n);      // build every scene up front so no frame hitches during playback
  Eng.setCanvas(canvas);
  return Eng;
}
Eng.setCanvas = function (canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false }); this.resize(canvas.width); };
Eng.resize = function (pxW) { this.baseScale = pxW / VW; this.canvas.width = Math.round(VW * this.baseScale); this.canvas.height = Math.round(VH * this.baseScale); this.ctx = this.canvas.getContext('2d', { alpha: false }); };
Eng.draw = function (t) { this.render(this.ctx, t); };
