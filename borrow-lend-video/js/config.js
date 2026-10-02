/* Fluent English – BORROW vs LEND. Shared config + timeline (used by the live preview AND the offline export). */
(function () {
  const FE = (window.FE = window.FE || {});

  FE.W = 1080;
  FE.H = 1920;

  FE.C = {
    cobalt: "#1F4FD8", cobaltDark: "#12307F", cobaltLight: "#6F93FF",
    ivory: "#FFF6E3", ivoryDark: "#F2E3C3", coral: "#FF6B57", coralDark: "#D8452F",
    lemon: "#FFD84A", lemonDark: "#E8B90F", ink: "#14213D",
  };

  /* Accurate-looking IPA, General American, in the style of the Oxford Advanced Learner's (American) dictionary.
     NOT verified against a live dictionary in this build (no dictionary access) – see README.
     Punctuation is kept OUT of the IPA; only English teaching phrases carry IPA. */
  FE.IPA = {
    borrowQ: "kæn aɪ ˈbɑːroʊ jʊr bʊk",
    lendQ: "kæn ju lend mi jʊr bʊk",
    penBlank: ["kæn aɪ", "jʊr pen"],
    penFull: "kæn aɪ ˈbɑːroʊ jʊr pen",
  };

  /* Speech segments. `lang` picks the narrator voice (es) or the American-English voice (en).
     English words inside Spanish narration use the English voice so they are pronounced correctly. */
  const es = (text) => ({ lang: "es", text });
  const en = (text) => ({ lang: "en", text });

  /* Beats are played in order. A beat ends when BOTH its minimum duration has elapsed and its speech has finished
     (so transitions follow actual speech completion). `sp` = delay before speech starts, `tail` = breath after.
     `fixed` beats (the practice pause) never stretch or shrink. */
  FE.BEATS = [
    { id: "hook", min: 3.5, sp: 0.25, tail: 0.2,
      speech: [en("Borrow"), es("o"), en("lend?"), es("Mira quién recibe el libro.")],
      caption: "¿Borrow o lend? Mira quién recibe el libro." },
    { id: "borrowAsk", min: 2.2, sp: 0.35, tail: 0.15,
      speech: [en("Can I borrow your book?")], phrase: "borrowQ" },
    { id: "borrowHand", min: 1.5, sp: 0, tail: 0, speech: null, sfx: ["flutter", "tap"] },
    { id: "borrowNarr", min: 2.2, sp: 0.15, tail: 0.2,
      speech: [en("Borrow:"), es("recibir algo prestado.")],
      caption: "Borrow: recibir algo prestado." },
    { id: "rewind", min: 0.75, sp: 0, tail: 0, speech: null, sfx: ["rewind"] },
    { id: "lendAsk", min: 2.3, sp: 0.3, tail: 0.15,
      speech: [en("Can you lend me your book?")], phrase: "lendQ" },
    { id: "lendHand", min: 1.5, sp: 0, tail: 0, speech: null, sfx: ["flutter", "tap"] },
    { id: "lendNarr", min: 2.1, sp: 0.15, tail: 0.2,
      speech: [en("Lend:"), es("prestar algo.")],
      caption: "Lend: prestar algo." },
    { id: "speakPrompt", min: 3.0, sp: 0.2, tail: 0.1,
      speech: [es("Ahora tú. Completa y dilo en voz alta.")],
      caption: "Ahora tú. Completa y dilo en voz alta." },
    { id: "pause", min: 4.0, sp: 0, tail: 0, speech: null, fixed: true },
    { id: "reveal", min: 2.3, sp: 0.45, tail: 0.25,
      speech: [en("Can I borrow your pen?")], phrase: "penFull", sfx: ["chord"] },
    { id: "cta", min: 4.4, sp: 0.4, tail: 0.4,
      speech: [es("Practica con"), en("Fluent English."), es("Escríbenos inglés.")],
      caption: "Practica con Fluent English. Escríbenos “inglés”." },
  ];
  FE.GAP = 0.07; // seconds of silence between speech segments

  /* Rough speech-length estimate (seconds) used only when no voice is available or while muted. */
  FE.estimateSpeech = function (segs) {
    if (!segs) return 0;
    let t = 0;
    for (const s of segs) t += 0.28 + s.text.length * 0.062;
    return t + FE.GAP * (segs.length - 1);
  };

  /* durations: { beatId: speechSeconds }. Returns { beats:[{...beat,start,dur,speechDur}], total } */
  FE.buildSchedule = function (durations) {
    let t = 0;
    const beats = FE.BEATS.map((b, i) => {
      const sd = b.speech ? (durations && durations[b.id] != null ? durations[b.id] : FE.estimateSpeech(b.speech)) : 0;
      const dur = b.fixed ? b.min : Math.max(b.min, b.speech ? b.sp + sd + b.tail : 0);
      const o = Object.assign({}, b, { index: i, start: t, dur, speechDur: sd });
      t += dur;
      return o;
    });
    return { beats, total: t };
  };

  FE.getCC = function () { try { const v = parseInt(localStorage.getItem("fe.cc"), 10); return v >= 0 && v <= 2 ? v : 2; } catch (e) { return 2; } };
  FE.setCC = function (v) { try { localStorage.setItem("fe.cc", String(v)); } catch (e) { /* storage may be blocked */ } };
})();
