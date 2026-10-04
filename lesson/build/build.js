// Bundles lesson/src/* into one self-contained HTML file.
const fs = require('fs'), path = require('path');
const src = (f) => fs.readFileSync(path.join(__dirname, '../src', f), 'utf8');
const assets = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets.json'), 'utf8'));
// regenerate the IPA dictionary: hand-typed list + owner-verified overrides (build/ipa-verified.csv)
const dict = {}, status = {}, sources = {};
fs.readFileSync(path.join(__dirname, 'ipa-words.txt'), 'utf8').split('\n').forEach((l) => { l = l.trim(); if (!l) return; const i = l.indexOf(' '); dict[l.slice(0, i)] = l.slice(i + 1); status[l.slice(0, i)] = 'hand'; });
fs.readFileSync(path.join(__dirname, 'ipa-verified.csv'), 'utf8').split('\n').slice(1).forEach((l) => { l = l.trim(); if (!l) return; const [w, ip, ...src] = l.split(','); dict[w] = ip; status[w] = 'verified'; sources[w] = src.join(','); });
fs.writeFileSync(path.join(__dirname, '../src/ipa-dict.js'), "/* Generated from build/ipa-words.txt (hand-entered) + build/ipa-verified.csv (source-verified). Do not edit. */\nObject.assign(IPA.D, " + JSON.stringify(dict) + ");\nObject.assign(IPA.STATUS, " + JSON.stringify(Object.fromEntries(Object.entries(status).filter(([, v]) => v === 'verified'))) + ");\nIPA.SOURCES = " + JSON.stringify(sources) + ";\n");
fs.writeFileSync(path.join(__dirname, 'ipa-status.json'), JSON.stringify(Object.fromEntries(Object.keys(dict).sort().map((w) => [w, { ipa: dict[w], status: status[w], source: sources[w] || 'hand-entered; notation follows uploaded Sound Chart / OALD NAmE conventions; not word-level checked' }])), null, 1));
const js = ['audio.js', 'art.js', 'ipa.js', 'ipa-dict.js', 'core.js', 'content-0.js', 'content-1.js', 'content-2.js', 'content-3.js', 'content-4.js', 'ui.js'].map(src).join('\n') + '\ninit();\n';
let html = src('index.html').replace('/*CSS*/', () => src('style.css')).replace('/*JS*/', () => js.replace(/<\/script/gi, '<\\/script'));
html = html.split('__SOUND_WEBM__').join('data:video/webm;base64,' + fs.readFileSync(path.join(__dirname, 'chart.webm')).toString('base64'));
html = html.split('__SOUND_VIDEO__').join('data:video/mp4;base64,' + fs.readFileSync(path.join(__dirname, 'chart.mp4')).toString('base64'));
html = html.split('__SOUND_CHART__').join('data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, 'chart.webp')).toString('base64'));
html = html.split('__LOGO_FULL__').join(assets.full).split('__LOGO_GLOBE__').join(assets.globe);
const out = path.join(__dirname, '../fluent-english-be-lesson.html');
fs.writeFileSync(out, html);
console.log('built', out, (html.length / 1024).toFixed(0) + ' KB');

// Private-preview variant for the Claude artifact viewer: the viewer wraps pages in its own skeleton, so strip the document tags and use a name-style title.
let prev = html.replace(/<!doctype html>\s*/i, '').replace(/<html[^>]*>\s*/i, '').replace(/<head>\s*/i, '').replace(/<meta[^>]*>\s*/gi, '').replace(/<title>[^<]*<\/title>/i, '<title>Fluent English Pronouns and Be</title>').replace(/<\/head>\s*/i, '').replace(/<body[^>]*>\s*/i, '').replace(/<\/body>\s*/i, '').replace(/<\/html>\s*/i, '');
fs.mkdirSync(path.join(__dirname, '../preview'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../preview/fluent-english-be-lesson.artifact.html'), prev);
console.log('built preview variant', (prev.length / 1024).toFixed(0) + ' KB');
