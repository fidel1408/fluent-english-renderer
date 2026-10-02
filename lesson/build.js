const fs = require('fs'), path = require('path');
const D = path.join(__dirname, 'src');
const rd = f => fs.readFileSync(path.join(D, f), 'utf8');
const b64 = f => fs.readFileSync(path.join(D, f)).toString('base64');
const order = ['ipa.js', 'art.js', 'audio.js', 'core.js', 'lesson-helpers.js', 'ch1.js', 'ch2.js', 'ch3.js', 'ch4.js', 'ch5.js', 'ch6.js', 'ch7.js', 'ch8.js', 'ch9.js', 'lesson-index.js'].filter(f => fs.existsSync(path.join(D, f)));
const js = order.map(rd).join('\n\n') + "\n\nif (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();\n";
let html = rd('index.template.html')
  .replace('/*CSS*/', () => rd('style.css'))
  .replace('/*JS*/', () => js.replace(/<\/script>/g, '<\\/script>'))
  .replace(/__WORDWHITE__/g, b64('word-white.png'))
  .replace(/__GLOBE__/g, b64('globe.png'));
const out = path.join(__dirname, 'fluent-english-be-yes-no-questions.html');
fs.writeFileSync(out, html);
console.log('built', out, (html.length / 1024).toFixed(0) + ' KB');
