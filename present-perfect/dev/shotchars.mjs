import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file://' + path.resolve('dev/chars.html')); await p.waitForTimeout(800);
await p.screenshot({ path: process.argv[2], clip: { x: 0, y: 0, width: 700, height: 700 } }); await b.close();
