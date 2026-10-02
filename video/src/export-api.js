/* Hooks used by tools/export.mjs (headless Chromium) to render deterministic frames and the offline audio mix. */
(function () {
  const FE = (window.FE = window.FE || {});
  const exp = (FE.exp = {});

  exp.init = async function () {
    const cv = document.getElementById('cv'); exp.g = cv.getContext('2d'); exp.cv = cv;
    cv.width = FE.W; cv.height = FE.H;
    await Promise.all(['600 100px FEHead', '700 100px FEHead', '700 40px FEBody', '400 40px FEIPA'].map((f) => document.fonts.load(f, 'Aa ɑ')));
    await FE.Scenes.loadAssets('');
    return true;
  };

  /** Draw one frame at time t; returns a PNG data URL. */
  exp.frame = function (beats, t, cc, kind) {
    if (kind === 'cover') FE.Scenes.cover(exp.g);
    else FE.Scenes.render(exp.g, { t, beats, cc });
    return exp.cv.toDataURL('image/png');
  };

  function b64ToBuf(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; }

  function wavBase64(bufL, bufR, sr) {
    const n = bufL.length, data = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) data.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); data.setUint32(4, 36 + n * 4, true); w(8, 'WAVE'); w(12, 'fmt '); data.setUint32(16, 16, true);
    data.setUint16(20, 1, true); data.setUint16(22, 2, true); data.setUint32(24, sr, true); data.setUint32(28, sr * 4, true);
    data.setUint16(32, 4, true); data.setUint16(34, 16, true); w(36, 'data'); data.setUint32(40, n * 4, true);
    let o = 44, peak = 0;
    for (let i = 0; i < n; i++) {
      for (const ch of [bufL, bufR]) { const v = Math.max(-1, Math.min(1, ch[i])); peak = Math.max(peak, Math.abs(v)); data.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    }
    const bytes = new Uint8Array(data.buffer); let s = ''; const CH = 0x8000;
    for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
    return { b64: btoa(s), peak };
  }

  /**
   * Offline mix = music + effects + (optional) voice clips, using the same schedule that drives the frames.
   * voices: { beatKey: base64 wav }  (may be empty)
   */
  exp.audio = async function (beats, voices, total, opts) {
    opts = opts || {};
    const sr = 44100;
    const ctx = new OfflineAudioContext(2, Math.ceil(sr * total), sr);
    const a = FE.createAudio(ctx);
    a.scheduleMusic(0.02, total + 1);
    // fade-in at the very start, fade-out at the very end
    a.master.gain.setValueAtTime(0.0001, 0); a.master.gain.linearRampToValueAtTime(0.9, 0.35);
    a.master.gain.setValueAtTime(0.9, total - 0.9); a.master.gain.linearRampToValueAtTime(0.0001, total - 0.02);
    // effects
    FE.SFX.forEach((e) => { const b = beats[e.beat]; if (b) a.sfx(e.fx, b.s + e.at, e); });
    // ducking: music under speech, almost silent in the learner's pause
    FE.BEATS.forEach((bt) => {
      const m = beats[bt.k]; if (!m) return;
      if (bt.wait) { a.duckTo(FE.DUCK.silence, m.s, 0.2); a.duckTo(FE.DUCK.open, m.end - 0.05, 0.3); }
      else if (bt.say) { a.duckTo(FE.DUCK.speech, m.say0 - 0.06, 0.06); a.duckTo(FE.DUCK.open, m.say1 + 0.12, 0.3); }
    });
    // voices
    const keys = Object.keys(voices || {});
    for (const k of keys) {
      const buf = await ctx.decodeAudioData(b64ToBuf(voices[k]));
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(a.voiceBus); src.start(beats[k].say0);
    }
    const out = await ctx.startRendering();
    const res = wavBase64(out.getChannelData(0), out.getChannelData(1), sr);
    return res;
  };
})();
