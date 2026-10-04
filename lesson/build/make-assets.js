// Downscales the supplied Fluent English logo into small embeddable data URIs (uses Chromium canvas).
const { chromium, launchOpts } = require('./pw');
const fs = require('fs'), path = require('path');
(async () => {
  const root = path.resolve(__dirname, '../..');
  const b64 = fs.readFileSync(path.join(root, 'fluent_english_logo.png')).toString('base64');
  const b = await chromium.launch({ ...launchOpts });
  const p = await b.newPage();
  const out = await p.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const k = img.width / 2000; // overlay coords were given at 2000px width
    const mk = (sx, sy, sw, sh, w) => { const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * sh / sw);
      c.getContext('2d').drawImage(img, sx * k, sy * k, sw * k, sh * k, 0, 0, c.width, c.height); return c.toDataURL('image/webp', 0.9); };
    return { full: mk(200, 180, 1620, 740, 640), globe: mk(228, 200, 700, 692, 256) };
  }, b64);
  fs.writeFileSync('assets.json', JSON.stringify(out));
  console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])));
  await b.close();
})();
