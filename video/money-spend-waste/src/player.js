// Live playback of the four pre-rendered stems. One active source set at a time: every start/seek/replay stops the previous set first,
// so audio can never overlap. Layer gains + mute are independent; the master chain is the same one used for the MP4 export.
import { LAYERS, SR, masterChain } from './soundtrack.js';

export class Player {
  constructor(stems, gains, muted) {
    this.stems = stems; this.gains = { ...gains }; this.muted = muted; this.sources = new Set(); this.startedAtCtx = 0;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SR, latencyHint: 'interactive' });
    this.sum = this.ctx.createGain(); this.layerGain = {}; this.layerMeter = {};
    for (const L of LAYERS) {
      const g = this.ctx.createGain(); g.gain.value = this.gains[L] ?? 1; this.layerGain[L] = g;
      const an = this.ctx.createAnalyser(); an.fftSize = 1024; this.layerMeter[L] = an; g.connect(an); g.connect(this.sum);
    }
    this.muteGain = this.ctx.createGain(); this.muteGain.gain.value = muted ? 0 : 1;
    this.masterMeter = this.ctx.createAnalyser(); this.masterMeter.fftSize = 2048;
    masterChain(this.ctx, this.sum, this.muteGain); this.muteGain.connect(this.masterMeter); this.masterMeter.connect(this.ctx.destination);
  }
  get running() { return this.ctx.state === 'running'; }
  async ensureRunning() { if (this.ctx.state !== 'running') await this.ctx.resume(); }
  start(offset = 0) {
    this.stop();
    const when = this.ctx.currentTime + 0.05;
    for (const L of LAYERS) {
      const s = this.ctx.createBufferSource(); s.buffer = this.stems[L]; s.connect(this.layerGain[L]);
      s.onended = () => this.sources.delete(s); this.sources.add(s); s.start(when, Math.max(0, offset));
    }
    this.startedAtCtx = when - 0 ;   // audio position `offset` is heard at `when`
    this.startedAtCtx = when;
  }
  stop() { for (const s of this.sources) { s.onended = null; try { s.stop(); } catch (e) {} try { s.disconnect(); } catch (e) {} } this.sources.clear(); }
  setGain(L, v) { this.gains[L] = v; this.layerGain[L].gain.setTargetAtTime(v, this.ctx.currentTime, 0.02); }
  setMuted(m) { this.muted = m; this.muteGain.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.02); }
  activeSources() { return this.sources.size; }
  rms(node = this.masterMeter) { const a = new Float32Array(node.fftSize); node.getFloatTimeDomainData(a); let s = 0; for (const v of a) s += v * v; return Math.sqrt(s / a.length); }
  levels() { return { master: this.rms(), ...Object.fromEntries(LAYERS.map(L => [L, this.rms(this.layerMeter[L])])) }; }
}
