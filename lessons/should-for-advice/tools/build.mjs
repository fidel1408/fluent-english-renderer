// Bundles src/ into dist/should-for-advice.html (self-contained: fonts, logo, IPA lexicon, narration clips all embedded).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const b64 = (p, mime) => `data:${mime};base64,` + fs.readFileSync(path.join(root, p)).toString('base64');
const noClips = process.argv.includes('--no-clips');

let css = rd('src/css/styles.css');
css = css.replace(/url\("fonts\/([^"]+)"\)/g, (_, f) => `url("${b64('assets/fonts/' + f, 'font/woff2')}")`);
const jsDir = path.join(root, 'src/js');
const files = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js')).sort();
const pre = files.filter((f) => !f.startsWith('99-')), boot = files.filter((f) => f.startsWith('99-'));
const read = (f) => `/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(jsDir, f), 'utf8');
let data = `window.FE = window.FE || {};\nFE.LOGO = ${JSON.stringify(b64('assets/fluent_english_logo_720.png', 'image/png'))};\n`;
const lexP = path.join(root, 'src/generated/lexicon.json');
data += `FE.LEX = ${fs.existsSync(lexP) ? fs.readFileSync(lexP, 'utf8') : '{}'};\n`;
const manP = path.join(root, 'src/generated/manifest.json');
data += `FE.MANIFEST = ${fs.existsSync(manP) ? fs.readFileSync(manP, 'utf8') : '{}'};\n`;
const clipDir = path.join(root, 'narration/clips');
let nClips = 0, bytes = 0;
const clips = {};
const used = new Set(JSON.parse(fs.readFileSync(path.join(root, 'narration/script.json'), 'utf8')).clips.map((c) => c.id));
if (!noClips && fs.existsSync(clipDir)) for (const f of fs.readdirSync(clipDir)) if (f.endsWith('.mp3') && used.has(f.slice(0, -4))) { const buf = fs.readFileSync(path.join(clipDir, f)); clips[f.slice(0, -4)] = 'data:audio/mpeg;base64,' + buf.toString('base64'); nClips++; bytes += buf.length; }
data += `FE.CLIPS = ${JSON.stringify(clips)};\n`;
let html = rd('src/index.html');
const put = (tag, val) => { html = html.split(tag).join('\u0000'); html = html.replace('\u0000', () => val); };
put('/*__CSS__*/', css); put('/*__DATA__*/', data);
put('/*__JS__*/', [...pre, ...boot].map(read).join('\n'));
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/should-for-advice.html'), html);
console.log(`built dist/should-for-advice.html  ${(html.length / 1e6).toFixed(2)} MB  clips=${nClips} (${(bytes / 1e6).toFixed(2)} MB mp3)`);
