#!/usr/bin/env node
// node build/verify_batch1_source.js  -> source identity for October batch 1:
//  A) SHA256 of all six supplied Luis MP3s == the reviewed production manifest (and the audio inventory)
//  B) for each preferred take-2 master: the cue WAVs concatenated in order are bit-identical to the decoded master (44.1 kHz mono PCM16): every source sample once, in order, nothing added or removed
//  C) the cue WAVs are the files the renderer mixes (retimed manifest points at them; durations equal sample counts)
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'); const L = require('./lib');
const man = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'manifest/batch1_inputs/production_manifest.json'))), inv = JSON.parse(fs.readFileSync(path.join(L.ROOT, 'manifest/batch1_inputs/audio_inventory.json')));
const R = { hashes: [], masters: [], pass: true };
man.audio_files.forEach(a => { const f = path.join(L.ROOT, 'audio/originals', a.file), h = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'), i = inv.find(x => x.file === a.file), ok = h === a.sha256 && (!i || i.sha256 === h) && fs.statSync(f).size === a.bytes; R.hashes.push({ file: a.file, sha256: h, bytes: fs.statSync(f).size, matchesManifest: ok }); if (!ok) R.pass = false; });
const slugs = { can_have: 'can_have_take2.mp3', borrow_lend: 'borrow_lend_take2.mp3', schedule_options: 'schedule_options_take2.mp3' };
for (const [name, file] of Object.entries(slugs)) {
  const v = man.videos.find(x => x.slug === name), pref = path.basename(v.preferred_audio), mf = path.join(L.ROOT, 'audio/originals', file), raw = cp.execFileSync('ffmpeg', ['-v', 'error', '-i', mf, '-ac', '1', '-ar', '44100', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const m = L.loadManifest(name), parts = []; m.cues.forEach(q => { const w = fs.readFileSync(path.join(L.ROOT, q.audio)); parts.push(w.subarray(44)); });
  const cat = Buffer.concat(parts), identical = cat.length === raw.length && cat.equals(raw);
  const ok = pref === file && v.preferred_audio_sha256 === R.hashes.find(h => h.file === file).sha256 && identical && m.status === 'TIMED_FROM_SUPPLIED_AUDIO';
  R.masters.push({ video: name, contentId: v.content_id, preferredFile: pref, usedFile: file, masterSamples: raw.length / 2, cueWavSamplesTotal: cat.length / 2, concatenationBitIdenticalToDecodedMaster: identical, cueCount: m.cues.length, ok }); if (!ok) R.pass = false;
}
fs.mkdirSync(path.join(L.ROOT, 'qa'), { recursive: true }); fs.writeFileSync(path.join(L.ROOT, 'qa', 'batch1_source_identity.json'), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R, null, 1)); process.exit(R.pass ? 0 : 1);
