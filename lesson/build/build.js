// Bundles lesson/src/* into one self-contained HTML file.
const fs = require('fs'), path = require('path');
const src = (f) => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8');
const assets = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets.json'), 'utf8'));
// regenerate the IPA dictionary from the hand-typed word list
const dict = {}; fs.readFileSync(path.join(__dirname, 'ipa-words.txt'), 'utf8').split('\n').forEach((l) => { l = l.trim(); if (!l) return; const i = l.indexOf(' '); dict[l.slice(0, i)] = l.slice(i + 1); });
fs.writeFileSync(path.join(__dirname, '../src/ipa-dict.js'), "/* Hand-typed American English IPA (Oxford-style notation), citation forms. NOT verified against Oxford. Generated from build/ipa-words.txt */\nObject.assign(IPA.D, " + JSON.stringify(dict) + ");\nIPA.LET = { A: 'eɪ', B: 'biː', C: 'siː', D: 'diː' };\n");
const js = ['audio.js', 'art.js', 'ipa.js', 'ipa-dict.js', 'core.js', 'content-0.js', 'content-1.js', 'content-2.js', 'content-3.js', 'content-4.js', 'ui.js'].map(src).join('\n') + '\ninit();\n';
let html = src('index.html').replace('/*CSS*/', () => src('style.css')).replace('/*JS*/', () => js.replace(/<\/script/gi, '<\\/script'));
html = html.split('__LOGO_FULL__').join(assets.full).split('__LOGO_GLOBE__').join(assets.globe);
const out = path.join(__dirname, '../fluent-english-be-lesson.html');
fs.writeFileSync(out, html);
console.log('built', out, (html.length / 1024).toFixed(0) + ' KB');
