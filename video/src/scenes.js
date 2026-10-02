/* Scene composition: pure function of (time, beat marks, caption mode). */
(function () {
  const FE = (window.FE = window.FE || {});
  const C = FE.COLORS, A = FE.Art;
  const { ease, clamp, lerp } = A;
  const TAU = Math.PI * 2;
  const W = FE.W, H = FE.H;
  const S = (FE.Scenes = {});

  const HEAD = '"FEHead", "Fredoka", "Trebuchet MS", sans-serif';
  const BODY = '"FEBody", "Nunito", "Segoe UI", sans-serif';
  const IPAF = '"FEIPA", "Charis SIL", "Gentium Plus", "DejaVu Sans", serif';

  const SCENE_OF = { hook: 'A', phrase: 'B', intro: 'B', introEn: 'B', morph: 'B', turn: 'C', silence: 'C', reveal: 'C', cta: 'D' };
  const ORDER = FE.BEATS.map((b) => b.k);

  /* ---------- text helpers ---------- */
  function txt(g, s, x, y, o) {
    g.save();
    g.font = o.font; g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
    if (o.alpha != null) g.globalAlpha *= o.alpha;
    if (o.shadow) { g.shadowColor = o.shadow[0]; g.shadowBlur = o.shadow[1]; g.shadowOffsetX = 0; g.shadowOffsetY = o.shadow[2] || 0; }
    if (o.stroke) { g.lineJoin = 'round'; g.lineWidth = o.stroke[1]; g.strokeStyle = o.stroke[0]; g.strokeText(s, x, y); }
    g.fillStyle = o.color || C.cream; g.fillText(s, x, y);
    g.restore();
  }
  function measure(g, s, font) { g.save(); g.font = font; const w = g.measureText(s).width; g.restore(); return w; }
  function wrapLines(g, s, font, maxW) {
    const words = s.split(' '); const out = []; let cur = '';
    g.save(); g.font = font;
    words.forEach((w) => { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
    if (cur) out.push(cur); g.restore(); return out;
  }
  function pill(g, cx, cy, w, h, fill, shadow) {
    g.save();
    if (shadow !== false) A.shadowOn(g, 'rgba(30,8,0,0.38)', 26, 0, 12);
    g.fillStyle = fill; A.rr(g, cx - w / 2, cy - h / 2, w, h, h / 2); g.fill();
    g.restore();
  }
  function pop(g, cx, cy, p, fn) { // pop-in with overshoot
    if (p <= 0) return;
    const s = A.ease.back(clamp(p, 0, 1));
    g.save(); g.translate(cx, cy); g.scale(s, s); g.globalAlpha *= clamp(p * 3, 0, 1); g.translate(-cx, -cy); fn(); g.restore();
  }

  /* ---------- phrase card (3 chunk lines + optional IPA) ---------- */
  // lines: [{text, ipa, state: 'idle'|'active'|'done'|'dim', alpha, dy, blank}]
  function phraseCard(g, cx, top, lines, o) {
    const size = (o.size || 118), ipaSize = Math.round(size * 0.48);
    const pitch = o.ipa ? size * 1.7 : size * 1.28;
    const w = o.w || 940, h = pitch * lines.length + size * 0.48;
    g.save();
    g.translate(cx, top + h / 2); const sc = o.scale == null ? 1 : o.scale; g.scale(sc, sc); g.translate(-cx, -(top + h / 2));
    g.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    A.shadowOn(g, 'rgba(30,8,0,0.45)', 40, 0, 18);
    g.fillStyle = C.cream; A.rr(g, cx - w / 2, top, w, h, 56); g.fill(); A.shadowOff(g);
    g.strokeStyle = C.teal; g.lineWidth = 8; A.rr(g, cx - w / 2 + 12, top + 12, w - 24, h - 24, 46); g.stroke();
    lines.forEach((ln, i) => {
      const cy = top + size * 0.24 + pitch * i + size * 0.55 + (ln.dy || 0);
      g.save(); g.globalAlpha *= ln.alpha == null ? 1 : ln.alpha;
      const font = `600 ${size}px ${HEAD}`;
      const tw = ln.blank ? measure(g, 'XXXXXX', font) : measure(g, ln.text, font);
      if (ln.state === 'active' || ln.state === 'done') {
        const pw = Math.max(tw + 64, 300), ph = size * 1.04;
        g.fillStyle = ln.state === 'active' ? C.limeLight : 'rgba(181,211,53,0.30)';
        A.rr(g, cx - pw / 2, cy - ph / 2 - 4, pw, ph, ph / 2); g.fill();
        if (ln.state === 'active') { g.strokeStyle = C.limeDark; g.lineWidth = 5; A.rr(g, cx - pw / 2, cy - ph / 2 - 4, pw, ph, ph / 2); g.stroke(); }
      }
      if (ln.blank) {
        const pulse = 0.6 + 0.4 * Math.sin((o.t || 0) * 2.2);
        g.strokeStyle = C.terracotta; g.globalAlpha *= 0.55 + 0.45 * pulse; g.lineWidth = 12; g.lineCap = 'round';
        g.beginPath(); g.moveTo(cx - tw / 2 + 20, cy + size * 0.18); g.lineTo(cx + tw / 2 - 20, cy + size * 0.18); g.stroke();
      } else {
        txt(g, ln.text, cx, cy, { font, color: ln.state === 'active' ? C.tealDark : C.teal });
      }
      if (o.ipa && ln.ipa) txt(g, ln.ipa, cx, cy + size * 0.76, { font: `400 ${ipaSize}px ${IPAF}`, color: '#6B2A1A' });
      g.restore();
    });
    g.restore();
    return { h, bottom: top + h * (1 + (sc - 1) / 2) };
  }

  /* chunk states from speech progress */
  function chunkStates(say, prog, started, ended, n) {
    const out = [];
    const cum = []; let acc = 0; const tot = say.weights.reduce((a, b) => a + b, 0);
    say.weights.forEach((w) => { acc += w; cum.push(acc / tot); });
    for (let i = 0; i < n; i++) {
      if (!started) out.push('idle');
      else if (ended) out.push('done');
      else {
        const lo = i ? cum[i - 1] : 0;
        out.push(prog >= cum[i] ? 'done' : prog >= lo ? 'active' : 'idle');
      }
    }
    return out;
  }

  /* ---------- scene bits ---------- */
  function counterAndBg(g, t, blur) {
    g.drawImage(blur ? A.bgBlur : A.bg, 0, 0);
    if (!blur) g.drawImage(A.counter, 0, 0);
  }

  function hookBanner(g, t, p) {
    pop(g, W / 2, 400, p, () => {
      const f1 = `700 124px ${HEAD}`, f2 = `700 124px ${HEAD}`;
      const w1 = measure(g, 'PÍDELO EN', f1), w2 = measure(g, 'INGLÉS', f2) + 150;
      const bw = Math.max(w1, w2) + 110, bh = 330;
      A.shadowOn(g, 'rgba(30,8,0,0.45)', 36, 0, 16);
      g.fillStyle = C.cream; A.rr(g, W / 2 - bw / 2, 400 - bh / 2, bw, bh, 70); g.fill(); A.shadowOff(g);
      g.fillStyle = C.teal; A.rr(g, W / 2 - bw / 2 + 14, 400 - bh / 2 + 14, bw - 28, bh - 28, 58); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.08)'; A.rr(g, W / 2 - bw / 2 + 14, 400 - bh / 2 + 14, bw - 28, (bh - 28) / 2, 58); g.fill();
      txt(g, 'PÍDELO EN', W / 2, 345, { font: f1, color: C.cream, shadow: ['rgba(0,0,0,0.35)', 0, 6] });
      const tw = measure(g, 'INGLÉS', f2);
      txt(g, 'INGLÉS', W / 2 - 65, 462, { font: f2, color: C.limeLight, shadow: ['rgba(0,0,0,0.35)', 0, 6] });
      A.tacoIcon(g, W / 2 + tw / 2 + 10, 468, 1.2);
    });
  }

  function captionBar(g, st, text) {
    if (!text) return;
    const font = `700 54px ${BODY}`;
    const lines = wrapLines(g, text, font, 880);
    const lh = 70, bh = lines.length * lh + 44, cy = 1700;
    g.save(); g.fillStyle = 'rgba(8,30,34,0.82)'; A.rr(g, W / 2 - 480, cy - bh / 2, 960, bh, 36); g.fill();
    g.strokeStyle = 'rgba(181,211,53,0.55)'; g.lineWidth = 3; A.rr(g, W / 2 - 480, cy - bh / 2, 960, bh, 36); g.stroke(); g.restore();
    lines.forEach((l, i) => txt(g, l, W / 2, cy - (lines.length - 1) * lh / 2 + i * lh, { font, color: C.cream }));
  }

  /* ---------- scenes ---------- */
  function sceneA(g, st, ts) {
    const t = st.t;
    g.save();
    const z = 1 + 0.02 * clamp(ts / 5, 0, 1); g.translate(W / 2, 1000); g.scale(z, z); g.translate(-W / 2, -1000);
    g.drawImage(A.bg, 0, 0);
    // character (anchored at counter edge)
    const gp = 0;
    A.customer(g, { x: W / 2, y: A.COUNTER_Y, s: 1, t, gesture: gp, mood: { smile: 0.8, brow: 0.2 + 0.2 * Math.sin(ts * 1.4), lookY: 0.5 }, nod: 0.5 * Math.sin(t * 1.2) });
    g.drawImage(A.counter, 0, 0);
    A.customerHands(g, { x: W / 2, y: A.COUNTER_Y, s: 1, t, gesture: gp });
    // tacos slide in (plate sound at 0.12 s)
    const sp = ease.out((ts - 0.12) / 0.34);
    const px = lerp(1500, 540, sp), py = 1506;
    A.plate(g, px, py, 0.78);
    A.taco(g, px - 108, py - 14, 0.53, -0.04, 3);
    A.taco(g, px + 108, py - 9, 0.53, 0.05, 5);
    A.lime(g, px + 250, py + 8, 0.62, 0.2);
    const landed = clamp((ts - 0.46) / 0.5, 0, 1);
    if (landed > 0 && landed < 1) A.sparkle(g, px - 40, py - 170, 24 * (1 - landed), 1 - landed, landed * 2);
    g.restore();
    A.motes(g, t, 1);
    hookBanner(g, t, ease.out((ts - 0.35) / 0.5));
  }

  function foodScene(g, st, ts, tm) {
    // blurred closeup background with warm light
    const t = st.t;
    g.save(); const z = 1 + 0.03 * clamp(ts / 8, 0, 1); g.translate(W / 2, 1300); g.scale(z, z); g.translate(-W / 2, -1300);
    g.drawImage(A.bgBlur, 0, 0);
    // plate (always the same, shared by tacos and sandwich → morph looks intentional)
    const cy = 1440;
    A.plate(g, W / 2, cy + 20, 1.2);
    const tp = tm; // 0..1 morph progress
    const bob = Math.sin(t * 1.6) * 4;
    if (tp < 1) {
      const s1 = 1 - ease.inOut(tp);
      g.save(); g.globalAlpha = clamp(1 - tp * 1.5, 0, 1);
      g.translate(W / 2, cy - 15 + bob); g.scale(lerp(1, 0.45, ease.inOut(tp)), lerp(1, 0.45, ease.inOut(tp))); g.rotate(-0.25 * ease.inOut(tp)); g.translate(-W / 2, -(cy - 15 + bob));
      A.taco(g, W / 2 - 172, cy - 10 + bob, 1.0, -0.04, 3);
      A.taco(g, W / 2 + 172, cy - 2 + bob, 1.0, 0.05, 5);
      g.restore();
    }
    if (tp > 0) {
      const q = clamp((tp - 0.35) / 0.65, 0, 1), s2 = ease.back(q);
      g.save(); g.globalAlpha = clamp(q * 2.2, 0, 1);
      g.translate(W / 2, cy + 8 + bob); g.scale(lerp(0.4, 1.12, s2), lerp(0.4, 1.12, s2)); g.rotate(0.2 * (1 - q)); g.translate(-W / 2, -(cy + 8 + bob));
      A.sandwich(g, W / 2, cy + 8 + bob, 1.0, 0, 9);
      g.restore();
    }
    // magic swirl while transforming
    if (tp > 0 && tp < 1) {
      A.burst(g, W / 2, cy - 90, tp, 13, 360);
      for (let i = 0; i < 5; i++) A.sparkle(g, W / 2 + Math.cos(i * 1.7 + tp * 6) * 250 * (0.5 + tp * 0.5), cy - 100 + Math.sin(i * 1.7 + tp * 6) * 120, 22, Math.sin(tp * Math.PI), tp * 3 + i);
    }
    g.restore();
    A.motes(g, t, 0.8);
  }

  function sceneB(g, st, ts) {
    const t = st.t, bt = (k) => (st.beats[k] ? t - st.beats[k].s : -1);
    const mT = st.beats.morph ? clamp((t - st.beats.morph.s) / 0.95, 0, 1) : 0;
    foodScene(g, st, ts, mT);

    // card lines
    const ipaOn = st.cc === 2;
    const sayOf = (k) => FE.BEATS.find((b) => b.k === k).say;
    let states = ['idle', 'idle', 'idle'], mid = 'two tacos,', mid2 = null, midMix = 0;
    const b = st.beats;
    const prog = (k) => {
      const be = b[k]; if (!be || be.say0 == null) return { started: false, ended: false, p: 0 };
      const end = be.say1 != null ? be.say1 : be.say0 + (be.est || 2);
      return { started: true, ended: be.say1 != null && t >= be.say1, p: clamp((t - be.say0) / Math.max(0.1, end - be.say0), 0, 0.999) };
    };
    let alphas = [1, 1, 1];
    if (b.morph) {
      const q = clamp((t - b.morph.s) / 0.95, 0, 1);
      midMix = ease.inOut(clamp((q - 0.25) / 0.5, 0, 1));
      mid2 = 'a sandwich,';
      const pr = prog('morph');
      states = chunkStates(sayOf('morph'), pr.p, pr.started, pr.ended, 3);
      if (!pr.started) states = ['done', 'idle', 'done'].map((s, i) => (i === 1 ? 'idle' : 'idle'));
    } else if (b.introEn) {
      const pr = prog('introEn'); states = [pr.started && !pr.ended ? 'active' : 'done', 'dim', 'dim'];
      alphas = [1, 0.5, 0.5];
    } else if (b.intro) {
      states = ['active', 'dim', 'dim']; alphas = [1, 0.5, 0.5];
    } else if (b.phrase) {
      const pr = prog('phrase'); states = chunkStates(sayOf('phrase'), pr.p, pr.started, pr.ended, 3);
    }
    const cardP = ease.out(bt('phrase') / 0.45);
    const lines = [
      { text: "I'll have", ipa: FE.IPA["I'll have"], state: states[0], alpha: alphas[0] },
      { text: mid, ipa: FE.IPA[mid], state: states[1], alpha: alphas[1] * (1 - midMix), dy: -midMix * 40 },
      { text: 'please.', ipa: FE.IPA['please.'], state: states[2], alpha: alphas[2] },
    ];
    phraseCard(g, W / 2, 205, lines, { ipa: ipaOn, scale: 0.55 + 0.45 * ease.back(cardP), alpha: clamp(cardP * 2, 0, 1), t, size: 112 });
    if (mid2 && midMix > 0) {
      // second line (sandwich) drawn as an overlay on the same card slot
      const size = 112, pitch = ipaOn ? size * 1.7 : size * 1.28;
      const cy = 205 + size * 0.24 + pitch + size * 0.55 + (1 - midMix) * 40;
      g.save(); g.globalAlpha = midMix;
      const ln = { text: mid2, state: states[1] };
      const font = `600 ${size}px ${HEAD}`, tw = measure(g, mid2, font);
      if (ln.state === 'active' || ln.state === 'done') {
        const pw = Math.max(tw + 64, 300), ph = size * 1.04;
        g.fillStyle = ln.state === 'active' ? C.limeLight : 'rgba(181,211,53,0.30)'; A.rr(g, W / 2 - pw / 2, cy - ph / 2 - 4, pw, ph, ph / 2); g.fill();
        if (ln.state === 'active') { g.strokeStyle = C.limeDark; g.lineWidth = 5; A.rr(g, W / 2 - pw / 2, cy - ph / 2 - 4, pw, ph, ph / 2); g.stroke(); }
      }
      txt(g, mid2, W / 2, cy, { font, color: ln.state === 'active' ? C.tealDark : C.teal });
      if (ipaOn) txt(g, FE.IPA[mid2], W / 2, cy + size * 0.76, { font: `400 ${Math.round(size * 0.48)}px ${IPAF}`, color: '#6B2A1A' });
      g.restore();
    }
    // meaning chip: "I'll have = Voy a pedir…"
    const cardH = (ipaOn ? 112 * 1.7 : 112 * 1.28) * 3 + 112 * 0.48;
    const gp = ease.out(bt('introEn') / 0.4);
    if (b.introEn && gp > 0) {
      pop(g, W / 2, 205 + cardH + 78, gp, () => {
        const f = `700 52px ${BODY}`, s1 = "I'll have", s2 = '= Voy a pedir…';
        const w = measure(g, s1, `700 52px ${HEAD}`) + measure(g, s2, f) + 100;
        pill(g, W / 2, 205 + cardH + 78, w, 98, C.teal);
        txt(g, s1, W / 2 - w / 2 + 48 + measure(g, s1, `700 52px ${HEAD}`) / 2, 205 + cardH + 78, { font: `700 52px ${HEAD}`, color: C.limeLight });
        txt(g, s2, W / 2 + w / 2 - 48 - measure(g, s2, f) / 2, 205 + cardH + 78, { font: f, color: C.cream });
      });
    }
    // "natural option" tag
    const np = ease.out(bt('intro') / 0.4);
    if (b.intro && !b.morph && np > 0 && !b.introEn) { /* shown with chip later */ }
  }

  function sceneC(g, st, ts) {
    const t = st.t, b = st.beats;
    const bt = (k) => (b[k] ? t - b[k].s : -1);
    const ipaOn = st.cc === 2;
    g.save(); const z = 1 + 0.025 * clamp(ts / 9, 0, 1); g.translate(W / 2, 1300); g.scale(z, z); g.translate(-W / 2, -1300);
    g.drawImage(A.bgBlur, 0, 0);
    const gx = 420, gy = 1585;
    const revealP = b.reveal ? clamp(bt('reveal') / 0.8, 0, 1) : 0;
    if (revealP > 0) { // soft success glow behind glass
      g.fillStyle = A.rad(g, gx, gy - 260, 20, 420, [[0, `rgba(255,243,170,${0.6 * Math.sin(revealP * Math.PI)})`], [1, 'rgba(255,243,170,0)']]);
      g.fillRect(0, gy - 700, W, 800);
    }
    const sp = ease.out(bt('turn') / 0.6);
    A.lemonade(g, gx, gy + (1 - sp) * 260, 1.0 * (0.9 + 0.1 * sp), t);
    g.restore();
    A.motes(g, t, 0.7);

    // title chip
    const tp = ease.out(bt('turn') / 0.5);
    pop(g, W / 2, 265, tp, () => {
      const f = `700 66px ${HEAD}`, s = 'Ahora pide una limonada.';
      const w = measure(g, s, f) + 90; pill(g, W / 2, 265, Math.min(w, 1000), 112, C.teal);
      txt(g, s, W / 2, 268, { font: f, color: C.cream });
    });
    // support card
    let mid = '___,', st1 = 'idle', states = ['idle', 'idle', 'idle'], blank = true;
    if (b.reveal) {
      const pr = b.reveal.say0 != null ? { started: true, ended: b.reveal.say1 != null && t >= b.reveal.say1, p: clamp((t - b.reveal.say0) / Math.max(0.1, (b.reveal.say1 != null ? b.reveal.say1 : b.reveal.say0 + (b.reveal.est || 2)) - b.reveal.say0), 0, 0.999) } : { started: false };
      states = chunkStates(FE.BEATS.find((x) => x.k === 'reveal').say, pr.p || 0, pr.started, pr.ended, 3);
      if (bt('reveal') > 0.12) { mid = 'a lemonade,'; blank = false; }
    }
    const cp = ease.out((bt('turn') - 0.15) / 0.5);
    const cardScale = 0.82, size = 112;
    const ipaMid = FE.IPA[mid];
    const lines = [
      { text: "I'll have", ipa: FE.IPA["I'll have"], state: states[0] },
      { text: mid, ipa: blank ? '' : ipaMid, state: blank ? 'idle' : states[1], blank },
      { text: 'please.', ipa: FE.IPA['please.'], state: states[2] },
    ];
    phraseCard(g, W / 2, 360, lines, { ipa: ipaOn, scale: cardScale * (0.6 + 0.4 * ease.back(cp)), alpha: clamp(cp * 2, 0, 1), t, size });
    if (revealP > 0 && revealP < 1) A.burst(g, W / 2, 640, revealP, 21, 330);

    // quiet countdown (visual only) during the silent window
    const sil = b.silence;
    if (sil) {
      const el = t - sil.s, dur = FE.BEATS.find((x) => x.k === 'silence').wait;
      const fade = ease.out(el / 0.5) * (1 - ease.inOut((el - (dur - 0.4)) / 0.4));
      if (b.reveal === undefined || bt('reveal') < 0.2) {
        const cx = 800, cy = 1260, r = 104, frac = clamp(1 - el / dur, 0, 1);
        g.save(); g.globalAlpha = clamp(fade, 0, 1) * (b.reveal ? 1 - bt('reveal') / 0.2 : 1);
        g.fillStyle = 'rgba(8,40,44,0.72)'; g.beginPath(); g.arc(cx, cy, r + 26, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(255,243,218,0.18)'; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
        g.strokeStyle = C.limeLight; g.lineWidth = 16; g.lineCap = 'round';
        g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * frac); g.stroke();
        const n = Math.max(1, Math.ceil(dur - el));
        txt(g, String(n), cx, cy + 4, { font: `700 112px ${HEAD}`, color: C.cream });
        txt(g, 'Tu turno', cx, cy + r + 66, { font: `700 50px ${BODY}`, color: C.cream, shadow: ['rgba(0,0,0,0.6)', 14, 2] });
        g.restore();
      }
    }
  }

  function sceneD(g, st, ts) {
    const t = st.t, b = st.beats;
    g.save();
    const z = 1 + 0.02 * clamp(ts / 5, 0, 1); g.translate(W / 2, 1000); g.scale(z, z); g.translate(-W / 2, -1000);
    g.drawImage(A.bg, 0, 0);
    const cs = 0.72;
    const hop = 0.5 * ease.inOut(clamp((ts - 0.4) / 0.4, 0, 1));
    A.customer(g, { x: W / 2, y: A.COUNTER_Y, s: cs, t, gesture: 0, mood: { smile: 0.95, brow: 0.35 }, nod: Math.sin(t * 1.4) * 0.4 });
    g.drawImage(A.counter, 0, 0);
    A.customerHands(g, { x: W / 2, y: A.COUNTER_Y, s: cs, t, gesture: 0 });
    // the three examples, shown on the counter
    const pops = [0.25, 0.55, 0.85].map((d) => ease.back((ts - d) / 0.5));
    if (pops[0] > 0) { g.save(); g.translate(250, 1475); g.scale(pops[0], pops[0]); g.translate(-250, -1475); A.plate(g, 250, 1480, 0.5); A.taco(g, 205, 1470, 0.36, -0.04, 3); A.taco(g, 300, 1474, 0.36, 0.05, 5); g.restore(); }
    if (pops[1] > 0) { g.save(); g.translate(580, 1500); g.scale(pops[1], pops[1]); g.translate(-580, -1500); A.sandwich(g, 580, 1505, 0.62, 0, 9); g.restore(); }
    if (pops[2] > 0) { g.save(); g.translate(880, 1560); g.scale(pops[2], pops[2]); g.translate(-880, -1560); A.lemonade(g, 880, 1565, 0.5, t); g.restore(); }
    g.restore();
    A.motes(g, t, 1);

    const be = b.cta, f = be.say0 != null ? (t - be.say0) / Math.max(0.5, (be.say1 != null ? be.say1 : be.say0 + (be.est || 4.5)) - be.say0) : -1;
    const lp = ease.out((ts - 0.1) / 0.55);
    pop(g, W / 2, 310, lp, () => {
      const lw = 600, lh = lw * 534 / 1200;
      A.shadowOn(g, 'rgba(30,8,0,0.45)', 36, 0, 16);
      g.fillStyle = '#FFFFFF'; A.rr(g, W / 2 - lw / 2 - 52, 310 - lh / 2 - 36, lw + 104, lh + 72, 54); g.fill(); A.shadowOff(g);
      g.strokeStyle = C.lime; g.lineWidth = 8; A.rr(g, W / 2 - lw / 2 - 40, 310 - lh / 2 - 24, lw + 80, lh + 48, 44); g.stroke();
      if (A.logo) g.drawImage(A.logo, W / 2 - lw / 2, 310 - lh / 2, lw, lh);
      else txt(g, 'Fluent English', W / 2, 310, { font: `700 90px ${HEAD}`, color: '#003366' });
    });
    const cp = ease.out((f - 0.12) / 0.15);
    pop(g, W / 2, 560, cp, () => {
      const s = 'Clases en línea', fnt = `700 62px ${HEAD}`;
      pill(g, W / 2, 560, measure(g, s, fnt) + 100, 100, C.teal);
      txt(g, s, W / 2, 564, { font: fnt, color: C.cream });
    });
    const ep = ease.out((f - 0.55) / 0.15);
    pop(g, W / 2, 690, ep, () => {
      const s = 'Escríbenos INGLÉS.', fnt = `700 80px ${HEAD}`;
      const w = measure(g, s, fnt) + 90;
      A.shadowOn(g, 'rgba(30,8,0,0.45)', 30, 0, 14); g.fillStyle = C.lime; A.rr(g, W / 2 - w / 2, 690 - 62, w, 124, 62); g.fill(); A.shadowOff(g);
      g.fillStyle = 'rgba(255,255,255,0.22)'; A.rr(g, W / 2 - w / 2 + 8, 690 - 54, w - 16, 48, 24); g.fill();
      txt(g, s, W / 2, 696, { font: fnt, color: C.tealDark });
    });
  }

  /* ---------- scene driver with wipe transition ---------- */
  function wipe(g, p, drawNew, drawOld) {
    // p 0..1 : diagonal lime/cream swipe sweeping left -> right revealing the new scene
    const e = lerp(-300, W + 380, ease.inOut(p)), slant = 260;
    drawOld();
    g.save();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(e + slant, 0); g.lineTo(e - slant, H); g.lineTo(0, H); g.closePath(); g.clip();
    drawNew(); g.restore();
    [[0, C.limeLight, 70], [70, C.lime, 46], [116, C.teal, 60]].forEach(([off, col, wd]) => {
      g.fillStyle = col; g.beginPath();
      g.moveTo(e + slant + off, 0); g.lineTo(e + slant + off + wd, 0); g.lineTo(e - slant + off + wd, H); g.lineTo(e - slant + off, H); g.closePath(); g.fill();
    });
  }

  const DRAW = { A: sceneA, B: sceneB, C: sceneC, D: sceneD };
  function sceneIndexAt(st) {
    for (let i = ORDER.length - 1; i >= 0; i--) if (st.beats[ORDER[i]]) return SCENE_OF[ORDER[i]];
    return 'A';
  }
  function sceneStart(st, id) {
    for (const k of ORDER) if (SCENE_OF[k] === id && st.beats[k]) return st.beats[k].s;
    return 0;
  }
  const PREV = { B: 'A', C: 'B', D: 'C' };

  // Only expose what has already happened at time t (export passes the whole schedule up front).
  function causal(st) {
    const beats = {};
    Object.keys(st.beats).forEach((k) => {
      const b = st.beats[k]; if (!b || b.s > st.t) return;
      const ok = (v) => (v != null && v <= st.t ? v : null);
      beats[k] = { s: b.s, say0: ok(b.say0), say1: ok(b.say1), end: ok(b.end), est: b.est };
    });
    return { t: st.t, beats, cc: st.cc };
  }

  S.render = function (g, st0) {
    A.init();
    const st = causal(st0);
    const id = sceneIndexAt(st), ts = st.t - sceneStart(st, id);
    g.clearRect(0, 0, W, H);
    const wp = (id !== 'A') ? clamp(ts / 0.5, 0, 1) : 1;
    if (id !== 'A' && wp < 1) {
      const pid = PREV[id], pts = st.t - sceneStart(st, pid);
      wipe(g, wp, () => DRAW[id](g, st, ts), () => DRAW[pid](g, st, pts));
    } else DRAW[id](g, st, ts);

    // captions (burned in whenever CC is on)
    if (st.cc >= 1) {
      for (const k of ORDER) {
        const be = st.beats[k]; if (!be || !FE.CAPTIONS[k]) continue;
        const end = be.end != null ? be.end : Infinity;
        if (st.t >= be.s && st.t <= end + 0.01) captionBar(g, st, FE.CAPTIONS[k]);
      }
    }
  };

  S.cover = function (g) {
    A.init(); g.clearRect(0, 0, W, H);
    g.drawImage(A.bg, 0, 0);
    A.customer(g, { x: W / 2, y: A.COUNTER_Y, s: 1, t: 1.4, gesture: 0, mood: { smile: 0.95, brow: 0.5 } });
    g.drawImage(A.counter, 0, 0);
    A.customerHands(g, { x: W / 2, y: A.COUNTER_Y, s: 1, t: 1.4, gesture: 0 });
    A.plate(g, 540, 1440, 0.9); A.taco(g, 420, 1420, 0.62, -0.04, 3); A.taco(g, 660, 1426, 0.62, 0.05, 5);
    A.sandwich(g, 200, 1500, 0.46, 0, 9); A.lemonade(g, 880, 1560, 0.5, 1.1);
    const f = `700 150px ${HEAD}`;
    const w1 = measure(g, 'PIDE COMIDA', f), w2 = measure(g, 'EN INGLÉS', f) + 170;
    const bw = Math.min(1000, Math.max(w1, w2) + 90), bh = 420;
    A.shadowOn(g, 'rgba(30,8,0,0.5)', 40, 0, 18); g.fillStyle = C.cream; A.rr(g, W / 2 - bw / 2, 310 - bh / 2 + 80, bw, bh, 80); g.fill(); A.shadowOff(g);
    g.fillStyle = C.teal; A.rr(g, W / 2 - bw / 2 + 16, 310 - bh / 2 + 96, bw - 32, bh - 32, 66); g.fill();
    txt(g, 'PIDE COMIDA', W / 2, 270, { font: f, color: C.cream, shadow: ['rgba(0,0,0,0.35)', 0, 6] });
    txt(g, 'EN INGLÉS', W / 2 - 80, 440, { font: f, color: C.limeLight, shadow: ['rgba(0,0,0,0.35)', 0, 6] });
    A.tacoIcon(g, W / 2 + measure(g, 'EN INGLÉS', f) / 2 - 20, 452, 1.6);
    if (A.globe) { g.save(); g.beginPath(); g.arc(940, 1000, 70, 0, TAU); g.clip(); g.drawImage(A.globe, 870, 930, 140, 140); g.restore(); }
  };

  S.loadAssets = function (base) {
    base = base || '';
    const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = base + src; });
    return Promise.all([load('assets/logo.png'), load('assets/globe.png')]).then(([logo, globe]) => {
      A.logo = logo; A.globe = globe; A.init();
      // pre-blurred copy of the café for close-ups (depth of field)
      const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      g.filter = 'blur(16px)'; g.drawImage(A.bg, -40, -40, W + 80, H + 80); g.drawImage(A.counter, -40, -40, W + 80, H + 80); g.filter = 'none';
      g.fillStyle = A.lin(g, 0, 0, 0, H, [[0, 'rgba(60,15,5,0.25)'], [0.5, 'rgba(60,15,5,0.05)'], [1, 'rgba(10,30,34,0.25)']]); g.fillRect(0, 0, W, H);
      A.bgBlur = c;
    });
  };
})();
