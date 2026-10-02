const fs = require('fs'), path = require('path'), L = require('./lib');
(async () => {
  const srv = await L.serve(), b = await L.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(srv.url + '/index.html?export=1'); await p.waitForFunction('window.__ready && window.__ready()');
  const d = await p.evaluate(() => { window.__renderCover(); return document.getElementById('cv').toDataURL('image/png'); });
  fs.mkdirSync(path.join(L.ROOT, 'out'), { recursive: true });
  fs.writeFileSync(path.join(L.ROOT, 'out/cover-pide-tu-cafe-en-ingles.png'), Buffer.from(d.split(',')[1], 'base64'));
  await b.close(); srv.close(); console.log('cover written');
})();
