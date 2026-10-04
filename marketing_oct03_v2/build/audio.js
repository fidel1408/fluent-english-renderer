#!/usr/bin/env node
// node build/audio.js i_agree -> build/tmp/<name>_mix.wav (SFX ducked under narration; narration from supplied files if present)
const fs = require('fs'), path = require('path'), cp = require('child_process'); const L = require('./lib');
const name = process.argv[2] || 'i_agree', m = L.loadManifest(name), tmp = path.join(L.ROOT, 'build', 'tmp'); fs.mkdirSync(tmp, { recursive: true });
const { buf, peakDb } = L.synthSfx(m); const sfx = path.join(tmp, `${name}_sfx.wav`); fs.writeFileSync(sfx, buf);
const files = m.cues.map(q => ({ q, f: L.findCueAudio(m, q) })).filter(x => x.f);
const mix = path.join(tmp, `${name}_mix.wav`), args = ['-y', '-v', 'error', '-i', sfx];
files.forEach(x => args.push('-i', x.f));
let fc = '[0:a]aresample=48000,aformat=channel_layouts=stereo[s]';
files.forEach((x, i) => { const ms = Math.round(x.q.start * 1000); fc += `;[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[n${i}]`; });
fc += `;[s]${files.map((_, i) => `[n${i}]`).join('')}amix=inputs=${files.length + 1}:normalize=0:duration=longest[m];[m]alimiter=limit=0.89:level=false${m.mixGainDb ? `,volume=${m.mixGainDb}dB` : ''},atrim=0:${m.duration},apad=whole_dur=${m.duration}[o]`;
args.push('-filter_complex', fc, '-map', '[o]', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', mix);
cp.execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log(JSON.stringify({ mix: path.relative(L.ROOT, mix), narrationFiles: files.length, sfxPeakDbFS: +peakDb.toFixed(1) }));
