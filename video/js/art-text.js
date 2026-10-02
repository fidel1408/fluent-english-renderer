/* Typography: the hero sentence (morphing tokens + ribbon), IPA lines, tags, countdown, captions, end card. */
window.FE = window.FE || {};

(function (FE) {
  const U = FE.U, C = FE.COLORS, TL = FE.TL;
  const DISPLAY = '"FE Display","Playfair Display",Georgia,"Times New Roman",serif';
  const TEXT = '"FE Text","Noto Sans","DejaVu Sans","Segoe UI",Arial,sans-serif';
  FE.FONTS = { DISPLAY, TEXT };

  // ----- helpers -----
  function goldFill(ctx, x0, y0, x1, y1) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "#fbe9b8"); g.addColorStop(0.5, "#e9c970"); g.addColorStop(1, "#c79a42");
    return g;
  }
  function softShadow(ctx, blur, a) { ctx.shadowColor = "rgba(0,0,0," + (a == null ? 0.45 : a) + ")"; ctx.shadowBlur = blur; ctx.shadowOffsetY = blur * 0.25; }
  function noShadow(ctx) { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

  // IPA line (only in "Captions + IPA" mode). Rendered directly beneath English teaching phrases.
  FE.drawIPA = function (ctx, text, x, y, alpha, S, size, color) {
    if (S.cc !== 2 || alpha <= 0.01) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    size = size || 44;
    ctx.font = "500 " + size + "px " + TEXT;
    if (!color) softShadow(ctx, 8, 0.6);
    ctx.fillStyle = color || "#fff0c4";
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Tag stamp: ✗ INCORRECTO / ✓ CORRECTO (icons are vector paths, not font glyphs).
  FE.drawTag = function (ctx, x, y, kind, alpha, scale, text) {
    if (alpha <= 0.01) return;
    const bad = kind === "bad";
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(scale || 1, scale || 1); ctx.rotate((bad ? -2.5 : 2) * Math.PI / 180);
    const label = text || (bad ? "INCORRECTO" : "CORRECTO");
    ctx.font = "800 " + (text ? 34 : 40) + "px " + TEXT; const tw = ctx.measureText(label).width;
    const w = tw + 112, h = 72;
    softShadow(ctx, 14, 0.4);
    U.rr(ctx, -w / 2, -h / 2, w, h, 36);
    ctx.fillStyle = bad ? C.rasp : "#0f7a55"; ctx.fill(); noShadow(ctx);
    ctx.lineWidth = 4; ctx.strokeStyle = bad ? "#f6c3d4" : C.gold; ctx.stroke();
    // icon circle
    const ix = -w / 2 + 40;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ix, 0, 20, 0, 7); ctx.fill();
    ctx.strokeStyle = bad ? C.rasp : "#0f7a55"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    if (bad) { ctx.moveTo(ix - 8, -8); ctx.lineTo(ix + 8, 8); ctx.moveTo(ix + 8, -8); ctx.lineTo(ix - 8, 8); }
    else { ctx.moveTo(ix - 9, 1); ctx.lineTo(ix - 2, 9); ctx.lineTo(ix + 10, -8); }
    ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(label, ix + 34, 3);
    ctx.restore();
  };

  // ----- hero sentence -----
  const Hm = {}; // measured widths @ 100px
  function measure(ctx) {
    if (Hm.ok === FE.fontsReady) return;
    ctx.save(); ctx.font = "700 100px " + DISPLAY;
    ["I", "have", "’m", "33", "years", "old", ".", " "].forEach((s) => (Hm[s] = ctx.measureText(s).width));
    ctx.restore(); Hm.ok = FE.fontsReady;
  }
  // Left x (relative to centre, at 100px) of each token in each layout.
  function layouts() {
    const sp = Hm[" "], w = (k) => Hm[k];
    const A = {}, B = {}, Cc = {};
    // A: I have 33 years.
    let tot = w("I") + sp + w("have") + sp + w("33") + sp + w("years") + w(".");
    let x = -tot / 2;
    A.I = x; x += w("I") + sp; A.have = x; A.m = x; x += w("have") + sp; A["33"] = x; x += w("33") + sp; A.years = x; A.old = x + w("years"); x += w("years"); A["."] = x; A.wA = tot;
    // B: I’m 33.
    tot = w("I") + w("’m") + sp + w("33") + w(".");
    x = -tot / 2; B.I = x; x += w("I"); B.m = x; B.have = x; x += w("’m") + sp; B["33"] = x; x += w("33"); B.years = x; B.old = x; B["."] = x; B.wB = tot;
    // C: I’m 33 years old.
    tot = w("I") + w("’m") + sp + w("33") + sp + w("years") + sp + w("old") + w(".");
    x = -tot / 2; Cc.I = x; x += w("I"); Cc.m = x; Cc.have = x; x += w("’m") + sp; Cc["33"] = x; x += w("33") + sp; Cc.years = x; x += w("years") + sp; Cc.old = x; x += w("old"); Cc["."] = x; Cc.wC = tot;
    return { A, B, C: Cc };
  }

  // Satin ribbon wiping from x0 → x1 around y (reveal front), with a tail that retracts into an underline flourish.
  function drawRibbon(ctx, x0, x1, y, h, W, alpha) {
    if (x1 - x0 < 4) return;
    ctx.save(); ctx.globalAlpha = alpha;
    const wave = (x) => Math.sin(x * 0.011 + W * 4) * 10 + Math.sin(x * 0.027 - W * 3) * 4;
    const path = (off) => {
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 8) { const yy = y + wave(x) - h / 2 + off; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
      for (let x = x1; x >= x0; x -= 8) ctx.lineTo(x, y + wave(x) + h / 2 + off);
      ctx.closePath();
    };
    softShadow(ctx, 18, 0.35);
    path(0);
    const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
    g.addColorStop(0, "#fbe9b8"); g.addColorStop(0.45, "#e6c46c"); g.addColorStop(0.55, "#b88f3c"); g.addColorStop(1, "#f1d98e");
    ctx.fillStyle = g; ctx.fill(); noShadow(ctx);
    // sheen
    ctx.save(); path(0); ctx.clip();
    const sh = ctx.createLinearGradient(x0, 0, x1, 0);
    const p = ((W * 0.6) % 1);
    sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(Math.min(0.98, p), "rgba(255,255,255,0.45)"); sh.addColorStop(Math.min(1, p + 0.08), "rgba(255,255,255,0)");
    ctx.fillStyle = sh; ctx.fillRect(x0, y - h, x1 - x0, h * 2); ctx.restore();
    // folded end
    ctx.fillStyle = "#b88f3c"; ctx.beginPath();
    const ex = x1, ey = y + wave(x1);
    ctx.moveTo(ex, ey - h / 2); ctx.lineTo(ex + 20, ey - h / 2 + 12); ctx.lineTo(ex + 6, ey + 4); ctx.lineTo(ex + 20, ey + h / 2 - 8); ctx.lineTo(ex, ey + h / 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawToken(ctx, txt, x, y, size, a, S, opts) {
    if (a <= 0.005) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = "700 " + size + "px " + DISPLAY; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    softShadow(ctx, size * 0.12, 0.45);
    ctx.fillStyle = opts && opts.gold ? goldFill(ctx, x, y - size * 0.7, x, y) : C.cream;
    ctx.fillText(txt, x, y);
    ctx.restore();
  }

  FE.drawHero = function (ctx, S) {
    const T = S.T, W = S.W;
    measure(ctx);
    const L = layouts();
    const u1 = U.inOut(U.prog(T, TL.morphA, TL.morphA + 0.65));
    const u2 = U.inOut(U.prog(T, TL.ribbon, TL.ribbon + 0.5));
    const appear = T < TL.bubbleIn ? 0 : U.outBack(U.prog(T, TL.bubbleIn, TL.bubbleIn + 0.45));
    const out = 1 - U.prog(T, TL.pair - 0.05, TL.pair + 0.35);
    if (T < TL.bubbleIn || out <= 0) return;

    // bubble (incorrect scene), dissolving as the correction starts
    const bubbleA = (1 - U.prog(T, TL.strike + 0.1, TL.morphA + 0.4)) * U.clamp(appear, 0, 1);
    if (bubbleA > 0.01) {
      ctx.save(); ctx.globalAlpha = bubbleA;
      const bx = 540, by = 560, bw = 920, bh = S.cc === 2 ? 330 : 280;
      ctx.translate(bx, by); ctx.scale(0.9 + 0.1 * Math.min(1, appear), 0.9 + 0.1 * Math.min(1, appear)); ctx.translate(-bx, -by);
      softShadow(ctx, 30, 0.45);
      ctx.beginPath();
      const x0 = bx - bw / 2, y0 = by - bh / 2, r = 64;
      ctx.moveTo(x0 + r, y0); ctx.arcTo(x0 + bw, y0, x0 + bw, y0 + bh, r); ctx.arcTo(x0 + bw, y0 + bh, x0, y0 + bh, r);
      ctx.lineTo(700, y0 + bh); ctx.quadraticCurveTo(704, y0 + bh + 60, 720, y0 + bh + 112); ctx.quadraticCurveTo(656, y0 + bh + 40, 620, y0 + bh);
      ctx.arcTo(x0, y0 + bh, x0, y0, r); ctx.arcTo(x0, y0, x0 + bw, y0, r); ctx.closePath();
      const g = ctx.createLinearGradient(0, y0, 0, y0 + bh); g.addColorStop(0, "#fffaf0"); g.addColorStop(1, "#f1e1bf");
      ctx.fillStyle = g; ctx.fill(); noShadow(ctx);
      ctx.lineWidth = 7; ctx.strokeStyle = C.rasp; ctx.stroke();
      ctx.restore();
    }
    const inBubble = bubbleA > 0.01;

    // interpolated layout
    const ids = ["I", "have", "m", "33", "years", "old", "."];
    const pos = {};
    ids.forEach((k) => (pos[k] = U.lerp(U.lerp(L.A[k], L.B[k], u1), L.C[k], u2)));
    const sA = 0.96, sB = 2.25, sC = 1.03;
    const scale = U.lerp(U.lerp(sA, sB, u1), sC, u2);
    const size = 100 * scale;
    const baseY = U.lerp(U.lerp(560, 640, u1), 575, u2) + (1 - U.clamp(appear, 0, 1)) * 30;
    const cx = 540;
    const X = (k) => cx + pos[k] * scale;

    const aAppear = U.clamp(appear, 0, 1) * out;
    const dark = inBubble;
    // text colour inside bubble is ink; draw tokens with colour switch
    function tok(txt, k, a, extra) {
      ctx.save();
      if (dark) {
        // dark text on cream bubble, fades to cream text as the bubble dissolves
        ctx.globalAlpha = a * aAppear * bubbleA; ctx.font = "700 " + size + "px " + DISPLAY; ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#2a1a14"; ctx.fillText(txt, X(k), baseY + (extra && extra.dy || 0));
      }
      ctx.restore();
      drawToken(ctx, txt, X(k), baseY + (extra && extra.dy || 0), size, a * aAppear * (1 - (dark ? bubbleA : 0)), S, extra);
    }
    const haveA = 1 - u1, mA = u1;
    tok("I", "I", 1);
    tok("have", "have", haveA, { dy: -u1 * 30 });
    tok("’m", "m", mA, { dy: (1 - u1) * 30 });
    tok("33", "33", 1, { gold: T >= TL.correctAt - 0.2 });
    // years: A→B collapse; C reveal via ribbon wipe
    const yearsA1 = 1 - U.prog(u1, 0, 0.8);
    if (T < TL.ribbon) tok("years", "years", yearsA1, { dy: u1 * 24 });
    const frontP = U.out3(U.prog(T, TL.ribbon + 0.4, TL.ribbon + 1.2));
    const xStart = X("33") + Hm["33"] * scale + 6;
    const xEnd = cx + (L.C.old + Hm.old) * sC + 6;
    const front = U.lerp(xStart - 10, xEnd, frontP);
    // ribbon
    if (T >= TL.ribbon + 0.4) {
      const retract = U.prog(T, TL.ribbon + 1.2, TL.ribbon + 1.8);
      // satin band sweeps in, then settles as a slim underline under the whole sentence
      const bandH = U.lerp(46, 12, U.inOut(retract));
      const yy = U.lerp(baseY - size * 0.3, baseY + size * 0.37, U.inOut(retract));
      const left = U.lerp(xStart - 30, cx + L.C.I * sC, U.inOut(retract));
      drawRibbon(ctx, left, front + 14 * (1 - retract), yy, bandH, W, out);
    }
    // reveal front of ribbon
    if (T >= TL.ribbon + 0.4) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, baseY - size, front - 8, size * 1.5); ctx.clip();
      tok("years", "years", 1); tok("old", "old", 1);
      ctx.restore();
    }
    let dotA = 1;
    if (T >= TL.ribbon) dotA = T < TL.ribbon + 0.4 ? 1 - U.prog(T, TL.ribbon, TL.ribbon + 0.15) : U.clamp((front - (X(".") - 26)) / 40, 0, 1);
    tok(".", ".", dotA);

    // strike-through of the incorrect words
    const sk = U.prog(T, TL.strike, TL.strike + 0.4);
    if (sk > 0 && T < TL.morphA + 0.6) {
      const fade = 1 - U.prog(T, TL.morphA + 0.2, TL.morphA + 0.6);
      ctx.save(); ctx.globalAlpha = fade * out; ctx.strokeStyle = C.rasp; ctx.lineWidth = 11; ctx.lineCap = "round";
      [["have", Hm.have, -4], ["years", Hm.years, 3]].forEach(([k, w, tilt]) => {
        const xw = w * sA;
        const sx = cx + L.A[k] * sA - 6, ex = sx + xw + 12;
        ctx.beginPath(); ctx.moveTo(sx, baseY - size * 0.3 + tilt); ctx.lineTo(U.lerp(sx, ex, sk), baseY - size * 0.3 + tilt - (tilt * 2 * sk)); ctx.stroke();
      });
      ctx.restore();
    }
    // labels
    const tagA = U.clamp(appear, 0, 1) * out;
    const tagBad = tagA * (1 - U.prog(T, TL.morphA, TL.morphA + 0.3));
    FE.drawTag(ctx, 540, 330, "bad", tagBad, 0.9 + 0.1 * Math.min(1, appear), "INCORRECTO PARA LA EDAD");
    const goodIn = U.prog(T, TL.correctAt - 0.05, TL.correctAt + 0.4);
    FE.drawTag(ctx, 540, 380, "good", goodIn * out, U.outBack(goodIn) * 1);

    // IPA directly under the sentence (spoken form of 33)
    const ipaY = baseY + 40 + size * 0.2 + (T < TL.morphA ? (inBubble ? 20 : 0) : 0);
    const aIpa = (1 - U.prog(T, TL.strike + 0.2, TL.morphA + 0.15)) * U.clamp(appear - 0.2, 0, 1);
    FE.drawIPA(ctx, FE.IPA.bad, 540, ipaY, aIpa * out, S, 44, "#7d0f3a");
    const aShort = U.prog(T, TL.morphA + 0.4, TL.morphA + 0.8) * (1 - U.prog(T, TL.ribbon, TL.ribbon + 0.25));
    FE.drawIPA(ctx, FE.IPA.short, 540, baseY + 60 + size * 0.18, aShort * out, S, 46);
    const aFull = U.prog(T, TL.ribbon + 1.1, TL.ribbon + 1.5);
    FE.drawIPA(ctx, FE.IPA.full, 540, baseY + 92, aFull * out, S, 40);

    // "I'm = I am" chip (very light touch of grammar), appears while Spanish names the verb
    const chip = U.prog(T, TL.beChip, TL.beChip + 0.4) * (1 - U.prog(T, TL.ribbon - 0.2, TL.ribbon + 0.1));
    if (chip > 0.01) {
      ctx.save(); ctx.globalAlpha = chip; ctx.translate(540, 812 + (1 - chip) * 14); ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "italic 600 54px " + DISPLAY; softShadow(ctx, 10, 0.5);
      ctx.fillStyle = goldFill(ctx, -260, -30, 260, 30);
      ctx.fillText("I’m  =  I am   ·   verbo BE", 0, 0);
      ctx.restore();
    }
    // Spanish meaning
    const tg = U.prog(T, TL.tengo, TL.tengo + 0.5) * out;
    if (tg > 0.01) {
      ctx.save(); ctx.globalAlpha = tg; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.font = "italic 500 58px " + DISPLAY; softShadow(ctx, 10, 0.5); ctx.fillStyle = "#f3e2b6";
      ctx.fillText("Tengo 33 años.", 540, baseY + (S.cc === 2 ? 190 : 140) + (1 - tg) * 10);
      ctx.restore();
    }
  };

  // ----- both-correct pair (13.4 → 15.0) -----
  FE.drawPair = function (ctx, S) {
    const T = S.T;
    const a = U.prog(T, TL.pair, TL.pair + 0.5) * (1 - U.prog(T, TL.howIn - 0.25, TL.howIn + 0.1));
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center";
    ctx.font = "italic 600 54px " + DISPLAY; softShadow(ctx, 10, 0.5); ctx.fillStyle = FE.COLORS.gold;
    ctx.fillText("Las dos son correctas", 540, 360);
    ctx.restore();
    const row = (txt, ipa, y, k, size) => {
      const p = U.prog(T, TL.pair + 0.15 + k * 0.18, TL.pair + 0.65 + k * 0.18);
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = a * p; ctx.translate(0, (1 - U.out3(p)) * 18);
      ctx.font = "700 " + size + "px " + DISPLAY; const w = ctx.measureText(txt).width;
      const x0 = 540 - w / 2 - 20;
      // check badge
      ctx.fillStyle = "#0f7a55"; ctx.beginPath(); ctx.arc(x0 - 46, y - 40, 34, 0, 7); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = FE.COLORS.gold; ctx.stroke();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(x0 - 60, y - 40); ctx.lineTo(x0 - 49, y - 28); ctx.lineTo(x0 - 30, y - 54); ctx.stroke();
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; softShadow(ctx, 12, 0.5); ctx.fillStyle = FE.COLORS.cream;
      ctx.fillText(txt, x0, y); ctx.restore();
      FE.drawIPA(ctx, ipa, 540, y + 58, a * p, S, 40);
    };
    row("I’m 33.", FE.IPA.short, 540, 0, 118);
    row("I’m 33 years old.", FE.IPA.full, 730, 1, 94);
  };

  // ----- challenge scene (15 → 23.6) -----
  FE.drawChallenge = function (ctx, S) {
    const T = S.T;
    const inA = U.prog(T, TL.howIn, TL.howIn + 0.5), outA = 1 - U.prog(T, TL.closeIn - 0.4, TL.closeIn);
    const a = inA * outA;
    if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.translate(0, (1 - U.out3(inA)) * 24);
    ctx.font = "700 106px " + DISPLAY; softShadow(ctx, 14, 0.5); ctx.fillStyle = C.cream;
    ctx.fillText("How old are you?", 540, 450);
    ctx.restore();
    FE.drawIPA(ctx, FE.IPA.how, 540, 520, a, S, 44);
    // support line
    const b = U.prog(T, TL.blankIn, TL.blankIn + 0.5) * outA;
    if (b > 0.01) {
      ctx.save(); ctx.globalAlpha = b; ctx.translate(0, (1 - U.out3(b)) * 18);
      ctx.font = "600 94px " + DISPLAY; softShadow(ctx, 12, 0.5);
      const p1 = "I’m", p2 = "years old.", gapW = 240, sp = 28;
      const w1 = ctx.measureText(p1).width, w2 = ctx.measureText(p2).width, tot = w1 + sp + gapW + sp + w2;
      let x = 540 - tot / 2; ctx.textAlign = "left"; ctx.fillStyle = C.cream; ctx.fillText(p1, x, 690);
      const gx = x + w1 + sp;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(gx, 690); ctx.lineTo(gx + gapW, 690); ctx.stroke();
      ctx.fillText(p2, gx + gapW + sp, 690);
      ctx.restore();
      FE.drawIPA(ctx, FE.IPA.blank, 540, 752, b, S, 40);
    }
    // calm countdown (visual only, no ticking)
    const cdIn = U.prog(T, TL.pauseStart - 0.3, TL.pauseStart + 0.1) * (1 - U.prog(T, TL.pauseStart + TL.pauseLen, TL.pauseStart + TL.pauseLen + 0.4));
    if (cdIn > 0.01) {
      const el = U.clamp(T - TL.pauseStart, 0, TL.pauseLen), rem = TL.pauseLen - el;
      const cx = 440, cy = 920, r = 60;
      ctx.save(); ctx.globalAlpha = cdIn;
      ctx.textAlign = "center"; ctx.font = "italic 500 46px " + DISPLAY; softShadow(ctx, 10, 0.5); ctx.fillStyle = "#f3e2b6";
      ctx.fillText("Dilo en voz alta", cx, 826); noShadow(ctx);
      ctx.lineWidth = 8; ctx.strokeStyle = "rgba(233,209,154,0.22)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
      ctx.strokeStyle = C.gold; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (rem / TL.pauseLen) * Math.PI * 2); ctx.stroke();
      ctx.fillStyle = C.cream; ctx.font = "600 64px " + DISPLAY; ctx.textBaseline = "middle";
      ctx.fillText(String(Math.max(1, Math.ceil(rem - 0.0001))), cx, cy + 4);
      ctx.restore();
    }
  };

  // ----- closing examples + end card -----
  FE.drawClose = function (ctx, S) {
    const T = S.T;
    const a0 = U.prog(T, TL.closeIn, TL.closeIn + 0.5);
    const fade = 1 - U.prog(T, TL.ctaIn - 0.15, TL.ctaIn + 0.3);
    const ex = (txt, ipa, y, t0, size) => {
      const p = U.prog(T, t0, t0 + 0.5) * fade; if (p <= 0.01) return;
      ctx.save(); ctx.globalAlpha = p; ctx.translate(0, (1 - U.out3(p)) * 20); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      ctx.font = "700 " + size + "px " + DISPLAY; softShadow(ctx, 14, 0.5); ctx.fillStyle = C.cream; ctx.fillText(txt, 540, y); ctx.restore();
      FE.drawIPA(ctx, ipa, 540, y + 56, p, S, 42);
    };
    ex("I’m 33.", FE.IPA.short, 500, TL.closeIn + 0.2, 150);
    ex("I’m 33 years old.", FE.IPA.full, 725, TL.ex2, 108);

    // end card
    const c = U.prog(T, TL.ctaIn, TL.ctaIn + 0.7);
    if (c > 0.01) {
      const g = FE.lockupImg;
      ctx.save(); ctx.globalAlpha = c;
      const lw = 620, lh = g ? lw * (g.height / g.width) : 280, ly = 250 + (1 - U.out3(c)) * 30;
      if (g) {
        softShadow(ctx, 24, 0.35); ctx.drawImage(g, 540 - lw / 2, ly, lw, lh); noShadow(ctx);
        // one soft glint sweeping over the lockup after the chord
        const gp = U.prog(T, TL.chord, TL.chord + 0.9);
        if (gp > 0 && gp < 1) {
          ctx.save(); ctx.beginPath(); ctx.rect(540 - lw / 2, ly, lw, lh); ctx.clip();
          const gx = U.lerp(540 - lw / 2 - 120, 540 + lw / 2 + 60, gp);
          const gg = ctx.createLinearGradient(gx - 60, 0, gx + 60, 0);
          gg.addColorStop(0, "rgba(255,255,255,0)"); gg.addColorStop(0.5, "rgba(255,255,255,0.28)"); gg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = gg; ctx.fillRect(gx - 60, ly, 120, lh); ctx.restore();
        }
      }
      // CTA ribbon
      const cp = U.prog(T, TL.ctaIn + 0.35, TL.ctaIn + 1.0);
      ctx.globalAlpha = cp;
      ctx.translate(540, 665 + (1 - U.out3(cp)) * 24);
      ctx.font = "800 62px " + TEXT; const label = "Escríbenos INGLÉS.";
      const tw = ctx.measureText(label).width, w = tw + 110, h = 116;
      softShadow(ctx, 22, 0.45);
      U.rr(ctx, -w / 2, -h / 2, w, h, 58);
      const bg = ctx.createLinearGradient(0, -h / 2, 0, h / 2); bg.addColorStop(0, "#e1306f"); bg.addColorStop(1, "#a30f46");
      ctx.fillStyle = bg; ctx.fill(); noShadow(ctx);
      ctx.lineWidth = 5; ctx.strokeStyle = C.gold; ctx.stroke();
      ctx.fillStyle = "#fff8ea"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, 0, 4);
      ctx.restore();
      // sub line
      const sp = U.prog(T, TL.ctaIn + 0.8, TL.ctaIn + 1.3);
      if (sp > 0) {
        ctx.save(); ctx.globalAlpha = sp; ctx.textAlign = "center"; ctx.font = "italic 500 46px " + DISPLAY; softShadow(ctx, 10, 0.5);
        ctx.fillStyle = "#f3e2b6"; ctx.fillText("Clases en línea", 540, 782); ctx.restore();
      }
    }
  };

  // ----- captions (burned in; follows the selected mode) -----
  FE.drawCaption = function (ctx, S) {
    if (S.cc === 0 || !S.caption) return;
    const runs = S.caption.runs, a = S.caption.alpha; if (a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a;
    const size = 46, maxW = 880, lineH = 62;
    // tokenize with style
    const toks = [];
    runs.forEach((r) => r.t.split(/(\s+)/).forEach((w) => w && toks.push({ w, en: !!r.en })));
    const fnt = (en) => (en ? "italic 700 " : "600 ") + size + "px " + TEXT;
    const lines = [[]]; let lw = 0;
    toks.forEach((t) => {
      ctx.font = fnt(t.en); const tw = ctx.measureText(t.w).width;
      if (lw + tw > maxW && lines[lines.length - 1].length && !/^\s+$/.test(t.w)) { lines.push([]); lw = 0; }
      if (/^\s+$/.test(t.w) && lw === 0) return;
      lines[lines.length - 1].push({ ...t, tw }); lw += tw;
    });
    const widths = lines.map((l) => l.reduce((s, t) => s + t.tw, 0));
    const boxW = Math.min(960, Math.max(...widths) + 90), boxH = lines.length * lineH + 36;
    const cy = 1468 - (lines.length - 1) * lineH / 2;
    U.rr(ctx, 540 - boxW / 2, cy - boxH / 2, boxW, boxH, 38);
    ctx.fillStyle = "rgba(4,24,18,0.78)"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(233,209,154,0.55)"; ctx.stroke();
    ctx.textBaseline = "middle"; ctx.textAlign = "left";
    lines.forEach((l, i) => {
      let x = 540 - widths[i] / 2; const y = cy - ((lines.length - 1) * lineH) / 2 + i * lineH + 2;
      l.forEach((t) => { ctx.font = fnt(t.en); ctx.fillStyle = t.en ? "#f6dc94" : "#ffffff"; ctx.fillText(t.w, x, y); x += t.tw; });
    });
    ctx.restore();
  };
})(window.FE);
