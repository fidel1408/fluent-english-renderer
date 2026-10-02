import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const d = join(dirname(fileURLToPath(import.meta.url)), 'src'), r = f => readFileSync(join(d, f), 'utf8');
const logo = readFileSync(join(d, 'logo.png')).toString('base64');
const js = `const LOGO_DATA="data:image/png;base64,${logo}";\n` + ['core.js', 'audio.js', 'speech.js', 'art.js', 'scenes.js', 'main.js'].map(r).join('\n');
const html = r('template.html').replace('/*CSS*/', () => r('style.css')).replace('/*JS*/', () => js.replace(/<\/script/gi, '<\\/script'));
writeFileSync(join(d, '..', 'index.html'), html);
console.log('index.html', (html.length / 1024).toFixed(0) + ' KB');
