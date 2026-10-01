// Build the playable lesson: node tools/build.mjs
// Output: release/index.html (self-contained except audio/) and release/may-might-could-standalone.html (audio embedded)
import fs from 'fs'; import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rd = (p, enc = 'utf8') => fs.readFileSync(path.join(root, p), enc);
const b64 = (p) => rd(p, null).toString('base64');
const mime = { woff2: 'font/woff2', png: 'image/png', mp3: 'audio/mpeg' };
let css = rd('src/css/style.css').replace(/url\(\.\.\/\.\.\/assets\/fonts\/([\w-]+)\.woff2\)/g, (m, n) => `url(data:font/woff2;base64,${b64('assets/fonts/' + n + '.woff2')})`);
const jsFiles = fs.readdirSync(path.join(root, 'src/js')).filter((f) => f.endsWith('.js')).sort();
const logo = 'data:image/png;base64,' + b64('assets/fluent_english_logo_trimmed.png');
const make = (embedAudio) => {
  let scripts = jsFiles.map((f) => {
    let s = rd('src/js/' + f);
    if (f === '05-narration.js' && embedAudio) s = s.replace(/file:\s*'audio\/([\w]+)\.mp3'/g, (m, k) => `file:'data:audio/mpeg;base64,${b64('release/audio/' + k + '.mp3')}'`);
    return `<script>/* ${f} */\n${s.replace(/<\/script/gi, '<\\/script')}</script>`;
  }).join('\n');
  let html = rd('src/index.html').replace('<link rel="stylesheet" href="css/style.css">', () => `<style>${css}</style>`).replace('<!--SCRIPTS-->', () => scripts).replaceAll('assets/fluent_english_logo_trimmed.png', () => logo);
  return html;
};
fs.mkdirSync(path.join(root, 'release'), { recursive: true });
fs.writeFileSync(path.join(root, 'release/index.html'), make(false));
console.log('release/index.html', (fs.statSync(path.join(root, 'release/index.html')).size / 1e6).toFixed(2) + ' MB');
if (process.argv.includes('--standalone')) {
  fs.writeFileSync(path.join(root, 'release/may-might-could-standalone.html'), make(true));
  console.log('standalone', (fs.statSync(path.join(root, 'release/may-might-could-standalone.html')).size / 1e6).toFixed(2) + ' MB');
}
