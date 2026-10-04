// Locates Playwright + a Chromium binary so the scripts also run outside the original sandbox.
// Set PW_CHROMIUM=/path/to/chrome to override; `npm i playwright` makes require('playwright') work.
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const fs = require('fs'); const guess = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const exe = process.env.PW_CHROMIUM || (fs.existsSync(guess) ? guess : undefined);
module.exports = { chromium: pw.chromium, launchOpts: exe ? { executablePath: exe } : {} };
