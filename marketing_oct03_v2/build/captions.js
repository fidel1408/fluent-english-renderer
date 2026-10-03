#!/usr/bin/env node
// node build/captions.js i_agree <outPrefix>  -> .srt and .vtt from the active manifest
const fs = require('fs'); const L = require('./lib'); const name = process.argv[2] || 'i_agree', pre = process.argv[3];
const m = L.loadManifest(name), f = (t, c) => { const ms = Math.round(t * 1000), p = (n, w) => String(n).padStart(w, '0'); return `${p(Math.floor(ms / 3600000), 2)}:${p(Math.floor(ms / 60000) % 60, 2)}:${p(Math.floor(ms / 1000) % 60, 2)}${c}${p(ms % 1000, 3)}`; };
fs.writeFileSync(pre + '.srt', m.cues.map((q, i) => `${i + 1}\n${f(q.cs ?? q.start, ',')} --> ${f(q.ce ?? q.end, ',')}\n${q.caption || q.text}\n`).join('\n'));
fs.writeFileSync(pre + '.vtt', 'WEBVTT\n\n' + m.cues.map(q => `${f(q.cs ?? q.start, '.')} --> ${f(q.ce ?? q.end, '.')}\n${q.caption || q.text}\n`).join('\n'));
console.log('captions from', m.status);
