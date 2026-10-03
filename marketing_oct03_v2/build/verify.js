#!/usr/bin/env node
// node build/verify.js <mp4> [name]  -> technical QA report (JSON) + exit code. Does NOT judge visuals; frames are reviewed separately.
const cp = require('child_process'), fs = require('fs'), path = require('path'); const L = require('./lib');
const file = path.resolve(process.argv[2]), name = process.argv[3] || 'i_agree', m = L.loadManifest(name), R = { file: path.basename(file), manifestStatus: m.status, checks: {} };
const pj = JSON.parse(cp.execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]));
const v = pj.streams.find(s => s.codec_type === 'video'), a = pj.streams.find(s => s.codec_type === 'audio'), ck = (k, ok, info) => { R.checks[k] = { ok: !!ok, info }; };
ck('h264_high_yuv420p', v.codec_name === 'h264' && v.pix_fmt === 'yuv420p', `${v.codec_name}/${v.profile}/${v.pix_fmt}`);
ck('1080x1920', v.width === 1080 && v.height === 1920, `${v.width}x${v.height}`);
ck('30fps', v.r_frame_rate === '30/1', v.r_frame_rate);
ck('duration', Math.abs(parseFloat(pj.format.duration) - m.duration) < .05, pj.format.duration);
ck('frames', +v.nb_frames === Math.round(m.duration * m.fps), v.nb_frames);
ck('aac_audio', a && a.codec_name === 'aac', a && `${a.codec_name} ${a.sample_rate} Hz ${a.channels}ch`);
const head = fs.readFileSync(file).subarray(0, 65536); ck('faststart', head.indexOf('moov') > 0 && head.indexOf('moov') < (head.indexOf('mdat') < 0 ? 1e9 : head.indexOf('mdat')), `moov@${head.indexOf('moov')}`);
const dec = cp.spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-']); ck('full_decode_no_errors', dec.status === 0 && dec.stderr.length === 0, dec.stderr.toString().slice(0, 200) || 'clean');
const vol = t0 => { const o = cp.spawnSync('ffmpeg', ['-v', 'info', '-ss', String(t0[0]), '-t', String(t0[1] - t0[0]), '-i', file, '-vn', '-af', 'volumedetect', '-f', 'null', '-']).stderr.toString(); const mm = /max_volume: (-?[\d.]+|-inf)/.exec(o); return mm ? +mm[1] : -99; };
const peak = vol([0, m.duration]); ck('no_clipping', peak < -1, `peak ${peak} dBFS`);
if (m.status === 'TIMED_FROM_SUPPLIED_AUDIO') {
  const meanOf = (f, w) => { const o = cp.spawnSync('ffmpeg', ['-v', 'info', '-ss', String(w[0]), '-t', String(w[1] - w[0]), '-i', f, '-vn', '-af', 'volumedetect', '-f', 'null', '-']).stderr.toString(); const mm = /mean_volume: (-?[\d.]+|-inf)/.exec(o); return mm && mm[1] !== '-inf' ? +mm[1] : -99; };
  const sfx = path.join(L.ROOT, 'build', 'tmp', `${name}_sfx.wav`);
  const weak = m.cues.filter(q => { const w = [q.start + .05, q.end - .05]; return meanOf(file, w) - meanOf(sfx, w) < 10 || meanOf(file, w) < -45; }).map(q => q.id);
  ck('narration_audible_in_every_cue_window (>=10 dB above SFX-only mix)', !weak.length, weak.length ? 'weak/silent: ' + weak.join(',') : 'all ' + m.cues.length + ' windows');
  ck('narration_not_cut_off', m.cues.every(q => q.end <= m.duration - .3 && q.audioSeconds && Math.abs((q.end - q.start) - q.audioSeconds) < .01), 'last cue ends ' + m.cues[m.cues.length - 1].end);
}
R.label = m.status === 'TIMED_FROM_SUPPLIED_AUDIO' ? 'NARRATED CANDIDATE – QA-pending, NOT final: technical checks only; auditory approval still required before publishing' : 'PREVIEW – narration pending – NOT publish-ready';
R.pass = Object.values(R.checks).every(c => c.ok); fs.writeFileSync(path.join(L.ROOT, 'qa', path.basename(file, '.mp4') + '.verify.json'), JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 1)); process.exit(R.pass ? 0 : 1);
