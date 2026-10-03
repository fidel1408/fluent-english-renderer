#!/usr/bin/env node
// node build/stills.js i_agree out_dir t1 t2 ...   -> PNG stills from the same deterministic renderer
const path = require('path'), fs = require('fs'); const L = require('./lib'); const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright');
(async () => { const [name, dir, ...ts] = process.argv.slice(2); const m = L.loadManifest(name); fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERR', e.message));
  const S = await L.serve(); await p.goto(S.url + '/src/index.html?video=' + name); await p.evaluate(() => window.ready); await p.evaluate(c => window.setCues(c), m.cues);
  for (const t of ts) { const d = await p.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png').slice(22); }, +t); fs.writeFileSync(path.join(dir, `t${String(t).padStart(5, '0')}.png`), Buffer.from(d, 'base64')); }
  await b.close(); S.srv.close(); })();
