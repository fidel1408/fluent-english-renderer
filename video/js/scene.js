/* Composes one frame. Pure function of the state object S = {T, W, cc, speakingEn, caption}. */
window.FE = window.FE || {};

(function (FE) {
  const U = FE.U, TL = FE.TL;
  const CAKE_X = 270;

  FE.renderFrame = function (ctx, S) {
    ctx.save();
    ctx.clearRect(0, 0, U.W, U.H);
    FE.drawBackground(ctx);
    // soft bokeh breathing (kept very quiet — only a hint of life)
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 5; i++) {
      const x = 140 + i * 210, y = 470 + ((i * 137) % 400), a = 0.05 + 0.03 * Math.sin(S.W * 0.7 + i * 1.7);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 70); g.addColorStop(0, "rgba(255,225,160," + a + ")"); g.addColorStop(1, "rgba(255,225,160,0)");
      ctx.fillStyle = g; ctx.fillRect(x - 70, y - 70, 140, 140);
    }
    ctx.restore();

    FE.drawPresenter(ctx, S);
    FE.drawTable(ctx);
    FE.drawCake(ctx, CAKE_X, S.W, true);

    FE.drawHero(ctx, S);
    FE.drawPair(ctx, S);
    FE.drawChallenge(ctx, S);
    FE.drawClose(ctx, S);
    FE.drawConfetti(ctx, S.T);
    FE.drawCaption(ctx, S);

    // fade up from emerald at the start, tiny fade at the very end
    const f = 1 - U.prog(S.T, 0, 0.45);
    if (f > 0) { ctx.fillStyle = "rgba(4,39,30," + f + ")"; ctx.fillRect(0, 0, U.W, U.H); }
    ctx.restore();
  };

  // Cover image: "¿I HAVE 33 YEARS? 🎂"  (kept inside the central 3:4 crop used by profile grids)
  FE.renderCover = function (ctx) {
    const S = { T: 1.6, W: 0.4, cc: 0, speakingEn: false, caption: null };
    ctx.save();
    ctx.clearRect(0, 0, U.W, U.H);
    FE.drawBackground(ctx);
    FE.drawPresenter(ctx, S); FE.drawTable(ctx); FE.drawCake(ctx, CAKE_X, 0.4, true);
    // soft scrim behind the headline
    const sg = ctx.createRadialGradient(540, 640, 60, 540, 640, 620);
    sg.addColorStop(0, "rgba(3,28,21,0.62)"); sg.addColorStop(1, "rgba(3,28,21,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, 240, U.W, 800);
    ctx.textBaseline = "alphabetic";
    const D = FE.FONTS.DISPLAY;
    FE.drawTag(ctx, 540, 372, "bad", 1, 1.05, "INCORRECTO PARA LA EDAD");
    ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
    ctx.textAlign = "center";
    ctx.font = "800 176px " + D; ctx.fillStyle = FE.COLORS.cream; ctx.fillText("¿I HAVE", 540, 580);
    // line 2: "33 YEARS?" + cake emoji, centred as one unit
    ctx.font = "800 150px " + D;
    const t2 = "33 YEARS?", w2 = ctx.measureText(t2).width, ew = 128, gap = 26, x0 = 540 - (w2 + gap + ew) / 2;
    const g = ctx.createLinearGradient(0, 640, 0, 780); g.addColorStop(0, "#fbe9b8"); g.addColorStop(1, "#d3a44a");
    ctx.textAlign = "left"; ctx.fillStyle = g; ctx.fillText(t2, x0, 760);
    ctx.shadowColor = "transparent";
    ctx.font = "112px 'Noto Color Emoji','Apple Color Emoji','Segoe UI Emoji',sans-serif"; ctx.fillStyle = "#fff";
    ctx.fillText("🎂", x0 + w2 + gap, 752);
    ctx.restore();
  };
})(window.FE);
