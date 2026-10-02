/* Boot + UI wiring. */
(function (FE) {
  const $ = (id) => document.getElementById(id);
  const qs = new URLSearchParams(location.search);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const CC_LABELS = ["CC: Off", "CC: Captions", "CC: Captions + IPA"];

  function loadImg(src) {
    return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  }

  FE.boot = async function () {
    const A = FE.ASSETS;
    const faces = [
      new FontFace("FE Display", "url(" + A.fonts.display + ")", { weight: "400 900" }),
      new FontFace("FE Display", "url(" + A.fonts.displayItalic + ")", { weight: "400 900", style: "italic" }),
      new FontFace("FE Text", "url(" + A.fonts.text + ")", { weight: "100 900" }),
    ];
    try {
      await Promise.all(faces.map((f) => f.load()));
      faces.forEach((f) => document.fonts.add(f));
    } catch (e) { console.warn("Embedded fonts failed, using system fallbacks", e); }
    FE.fontsReady = (FE.fontsReady || 0) + 1;
    FE.lockupImg = await loadImg(A.lockup);
  };

  async function main() {
    if (qs.get("clean") === "1") document.body.classList.add("clean");
    await FE.boot();
    const canvas = $("cv");
    let cc = parseInt(qs.get("cc") != null ? qs.get("cc") : store.get("fe.cc"), 10);
    if (!(cc >= 0 && cc <= 2)) cc = 1;

    const player = new FE.Player(canvas, { cc, onState: sync });
    FE.player = player;
    player.run();

    const bStart = $("bStart"), bPause = $("bPause"), bReplay = $("bReplay"), bMute = $("bMute"), bCC = $("bCC");
    function sync() {
      const s = player.state;
      $("overlay").hidden = s !== "idle";
      bStart.disabled = s === "playing" || s === "paused";
      bPause.disabled = !(s === "playing" || s === "paused");
      bPause.textContent = s === "paused" ? "▶ Resume" : "⏸ Pause";
      bPause.setAttribute("aria-pressed", s === "paused" ? "true" : "false");
      bReplay.disabled = s === "idle";
    }
    const go = async () => { await player.start(); };
    bStart.onclick = go; $("bigStart").onclick = go;
    bPause.onclick = () => (player.state === "paused" ? player.resume() : player.pause());
    bReplay.onclick = () => player.replay();
    bMute.onclick = () => {
      const m = !player.muted; player.setMuted(m);
      bMute.setAttribute("aria-pressed", m ? "true" : "false");
      bMute.textContent = m ? "🔇 Muted" : "🔊 Sound on";
    };
    bCC.textContent = CC_LABELS[cc];
    bCC.onclick = () => { cc = (cc + 1) % 3; player.setCC(cc); store.set("fe.cc", String(cc)); bCC.textContent = CC_LABELS[cc]; };
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !/^(SELECT|BUTTON|INPUT)$/.test(e.target.tagName)) {
        e.preventDefault();
        if (player.state === "idle" || player.state === "ended") go();
        else bPause.onclick();
      }
    });

    // clock readout
    setInterval(() => { $("clock").textContent = player.T.toFixed(1) + " s / " + FE.TL.total + " s" + (player.holding ? "  · waiting for voice" : ""); }, 150);

    // voices
    function fill(sel, lang) {
      const list = FE.Speech.listFor(lang), cur = FE.Speech.pref[lang];
      sel.innerHTML = "";
      const auto = document.createElement("option"); auto.value = "auto";
      const best = list[0];
      auto.textContent = best ? "Auto — best available (" + best.name + ")" : "Auto — no " + (lang === "es" ? "Spanish" : "English") + " voice found";
      sel.appendChild(auto);
      list.forEach((v) => { const o = document.createElement("option"); o.value = v.voiceURI || v.name; o.textContent = v.name + " (" + v.lang + ")"; sel.appendChild(o); });
      sel.value = [...sel.options].some((o) => o.value === cur) ? cur : "auto";
    }
    function status() {
      const es = FE.Speech.voiceFor("es"), en = FE.Speech.voiceFor("en");
      const el = $("vStatus");
      if (!FE.Speech.supported) { el.className = "note warn"; el.textContent = "This browser has no speech synthesis. The video plays silently with captions (music + effects still play)."; return; }
      if (!es || !en) {
        el.className = "note warn";
        el.textContent = "Missing " + [!es && "Spanish", !en && "English"].filter(Boolean).join(" and ") + " voice — those lines play silently (captions and timing still run). Install a voice in your OS language settings.";
      } else { el.className = "note"; el.textContent = "Using: " + es.name + " · " + en.name; }
    }
    const refresh = () => { fill($("vEs"), "es"); fill($("vEn"), "en"); status(); };
    FE.Speech.onChange(refresh);
    refresh(); FE.Speech.ready().then(refresh);
    $("vEs").onchange = (e) => { FE.Speech.setPref("es", e.target.value); status(); };
    $("vEn").onchange = (e) => { FE.Speech.setPref("en", e.target.value); status(); };
    $("tEs").onclick = () => player.testVoice("es");
    $("tEn").onclick = () => player.testVoice("en");
    sync();
  }
  main();
})(window.FE);
