// Renders the clean cover frame (1080x1920 PNG) "SPEND OR WASTE?"
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf' };
const server = createServer((req, res) => { const p = join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html'); if (!p.startsWith(root) || !existsSync(p)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); }).listen(0);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`http://localhost:${server.address().port}/index.html?cover=1`); await p.waitForFunction('window.__ready===true'); await p.waitForTimeout(300);
const out = resolve(root, 'output/cover_spend-or-waste.png'); mkdirSync(dirname(out), { recursive: true });
await p.screenshot({ path: out }); await b.close(); server.close(); console.log('wrote', out);
