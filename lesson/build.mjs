// Builds the single-file lesson: node lesson/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(here, p), 'utf8');
const b64 = (p) => 'data:image/webp;base64,' + fs.readFileSync(path.join(here, p)).toString('base64');
const order = ['art', 'audio', 'ipa', 'ui', 'content1', 'content2', 'content3', 'app'];
const js = order.map((n) => `/* ===== ${n}.js ===== */\n` + read(`src/${n}.js`)).join('\n').replace(/<\/script/gi, '<\\/script');
const out = read('src/template.html')
  .replace('{{CSS}}', () => read('src/style.css'))
  .replace('{{JS}}', () => js)
  .replace('{{LOGO_WHITE}}', () => b64('assets/logo-white.webp'))
  .replace('{{LOGO_BLUE}}', () => b64('assets/logo-blue.webp'));
const dest = path.join(here, 'fluent-english-be-negatives.html');
fs.writeFileSync(dest, out);
console.log('built', dest, (out.length / 1024).toFixed(0) + ' KB');
