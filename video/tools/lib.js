// Shared helpers for the export/verification tools.
const http = require('http'), fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.wav': 'audio/wav', '.svg': 'image/svg+xml' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((q, r) => {
      const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res({ url: 'http://127.0.0.1:' + srv.address().port, close: () => srv.close() }));
  });
}
function playwright() { return require(cp.execSync('npm root -g').toString().trim() + '/playwright'); }
async function launch(args) { return playwright().chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args: args || [] }); }
module.exports = { ROOT, serve, launch, playwright };
