/* Fluent English – preview UI wiring */
(function () {
  const FE = window.FE, P = FE.Player, S = FE.Speech;
  const $ = (id) => document.getElementById(id);
  const canvas = $("c");

  FE.loadAssets().then(() => { P.init(canvas); });

  /* --- buttons --- */
  function begin() { $("overlay").classList.add("hide"); P.start(); }
  $("bigStart").onclick = (e) => { e.stopPropagation(); begin(); };
  $("overlay").onclick = begin;
  $("overlay").onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") begin(); };
  $("bStart").onclick = () => { if (P.state === "paused") P.resume(); else begin(); };
  $("bPause").onclick = () => P.toggle();
  $("bReplay").onclick = () => begin();
  $("bMute").onclick = () => { const m = !P.muted; P.setMuted(m); $("bMute").setAttribute("aria-pressed", m); $("bMute").textContent = m ? "🔇 Unmute" : "🔊 Mute"; };
  document.addEventListener("keydown", (e) => { if (e.target.tagName === "SELECT") return; if (e.key === "p" || e.key === "P") P.toggle(); if (e.key === "r" || e.key === "R") begin(); if (e.key === "m" || e.key === "M") $("bMute").click(); });

  P.onState = (st) => {
    $("bPause").disabled = !(st === "playing" || st === "paused");
    $("bPause").textContent = st === "paused" ? "▶ Resume" : "⏸ Pause";
    $("bReplay").disabled = st === "idle";
    $("bStart").textContent = st === "paused" ? "▶ Resume" : st === "playing" ? "▶ Playing" : "▶ Start";
  };
  setInterval(() => {
    const t = P.state === "idle" ? 0 : P.elapsed(), tot = P.sch ? P.total() : 30;
    $("prog").style.width = Math.min(100, (t / tot) * 100) + "%";
    $("clock").innerHTML = `<b>${P.state}</b> · ${t.toFixed(1)} s / ~${tot.toFixed(1)} s${P.state !== "idle" ? " · " + P.beat().id : ""}`;
  }, 100);

  /* --- CC / IPA --- */
  const ccBtns = [...document.querySelectorAll("[data-cc]")];
  function paintCC() { ccBtns.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.cc === P.cc))); }
  ccBtns.forEach((b) => (b.onclick = () => { P.setCC(+b.dataset.cc); paintCC(); }));
  paintCC();

  /* --- voices --- */
  function fill(sel, list, kind) {
    const cur = S[kind + "Pick"];
    sel.innerHTML = "";
    const a = document.createElement("option"); a.value = "auto"; a.textContent = list.length ? "Auto (best available): " + list[0].name : "No voice found"; sel.appendChild(a);
    list.forEach((v) => { const o = document.createElement("option"); o.value = v.voiceURI; o.textContent = `${v.name} (${v.lang})${v.localService ? "" : " · online"}`; sel.appendChild(o); });
    sel.value = list.some((v) => v.voiceURI === cur) ? cur : "auto";
  }
  function refreshVoices() {
    S._choose();
    fill($("selEs"), S.rankedEs || [], "es"); fill($("selEn"), S.rankedEn || [], "en");
    const msg = [];
    if (!S.supported) msg.push('<span class="warn">This browser has no speech synthesis: you will see captions but hear only music and effects.</span>');
    else {
      msg.push(`Narrator: <b>${S.es ? S.es.name + " (" + S.es.lang + ")" : "none"}</b><br>English: <b>${S.en ? S.en.name + " (" + S.en.lang + ")" : "none"}</b>`);
      if (!S.es) msg.push('<span class="warn">No Spanish voice installed – install one in your OS speech settings.</span>');
      if (!S.en) msg.push('<span class="warn">No English voice installed.</span>');
      msg.push("Voice quality depends on the voices on this device.");
    }
    $("voiceStatus").innerHTML = msg.join("<br>");
  }
  try { S.esPick = localStorage.getItem("fe.es") || "auto"; S.enPick = localStorage.getItem("fe.en") || "auto"; } catch (e) { /* ignore */ }
  S.onChange(refreshVoices); S.load().then(refreshVoices);
  $("selEs").onchange = (e) => { S.setPick("es", e.target.value); try { localStorage.setItem("fe.es", e.target.value); } catch (x) { /* ignore */ } refreshVoices(); };
  $("selEn").onchange = (e) => { S.setPick("en", e.target.value); try { localStorage.setItem("fe.en", e.target.value); } catch (x) { /* ignore */ } refreshVoices(); };
  $("bTest").onclick = () => { S.cancel(); S.unlock(); S.speak([{ lang: "es", text: "Borrow: recibir algo prestado." }, { lang: "en", text: "Can you lend me your book?" }]); };

  /* --- recording --- */
  function pickMime() { const c = ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]; return c.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || ""; }
  async function record(withTabAudio) {
    const msg = $("recMsg"); msg.textContent = "";
    if (!window.MediaRecorder || !canvas.captureStream) { msg.textContent = "This browser cannot record a canvas."; return; }
    let tabStream = null;
    try {
      if (withTabAudio) {
        tabStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true, preferCurrentTab: true, selfBrowserSurface: "include" });
        if (!tabStream.getAudioTracks().length) { msg.textContent = "No tab audio was shared – tick “Share tab audio”."; tabStream.getTracks().forEach((t) => t.stop()); return; }
        if (P.muted) $("bMute").click();
      }
      $("overlay").classList.add("hide"); P.start();
      const tracks = [...canvas.captureStream(30).getVideoTracks()];
      if (withTabAudio) tracks.push(...tabStream.getAudioTracks());
      else { const d = P.graph.streamDestination(); if (d) tracks.push(...d.stream.getAudioTracks()); }
      const mime = pickMime(), rec = new MediaRecorder(new MediaStream(tracks), mime ? { mimeType: mime, videoBitsPerSecond: 8e6 } : undefined), chunks = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        if (tabStream) tabStream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "video/webm" }), a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "fluent-english-borrow-lend" + (/mp4/.test(blob.type) ? ".mp4" : ".webm"); a.click();
        msg.textContent = "Saved " + a.download + (withTabAudio ? " – play it to confirm the voices were captured." : " – music and effects only (no voices).");
      };
      rec.start(250);
      msg.textContent = "Recording in real time…";
      P.onEnded = () => setTimeout(() => { rec.state !== "inactive" && rec.stop(); P.onEnded = null; }, 900);
    } catch (e) { msg.textContent = "Recording cancelled: " + (e.message || e); }
  }
  $("bRec").onclick = () => record(false);
  $("bRecTab").onclick = () => record(true);
})();
