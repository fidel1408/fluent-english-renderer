#!/usr/bin/env node
/**
 * OPTIONAL, EXPLICIT STEP — renders dist/present-perfect.html to an MP4 (H.264 + AAC).
 * It is NOT run by any build step and nothing here is started automatically.
 *
 * Why it is safe for a normal computer:
 *   - frames are rendered one at a time and streamed straight into ffmpeg (no PNG/JPEG files on disk),
 *   - single browser, single ffmpeg, sequential, no parallel workers,
 *   - --dry-run prints the plan without rendering anything; --seconds N renders only the first N seconds as a test;
 *   - Ctrl+C stops it immediately.
 * Expect roughly 15-40 minutes of one CPU core for the full 5:40 lesson at 1920x1080/30 fps (machine dependent).
 * The soundtrack is build/narration.wav (voice) + build/bed.wav (music/effects, already ducked) mixed once by ffmpeg.
 *
 * Usage:  node tools/export_mp4.mjs --dry-run
 *         node tools/export_mp4.mjs --seconds 10 --out dist/test.mp4          (quick test)
 *         node tools/export_mp4.mjs --width 1920 --fps 30 --out dist/present-perfect.mp4
 * Needs: playwright (npm i -D playwright; use the browser you already have), ffmpeg on PATH.
 */
import { spawn } from 'node:child_process';
import path from 'node:path'; import fs from 'node:fs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const W = +arg('width', 1920), H = Math.round(W * 9 / 16), FPS = +arg('fps', 30), OUT = arg('out', 'dist/present-perfect.mp4'), LIMIT = +arg('seconds', 0), DRY = !!arg('dry-run', false), CRF = +arg('crf', 20);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = path.join(root, 'dist/present-perfect.html'), nar = path.join(root, 'build/narration.wav'), bed = path.join(root, 'build/bed.wav');
for (const f of [html, nar, bed]) if (!fs.existsSync(f)) { console.error('missing', f, '- run the build first'); process.exit(1); }
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');   // PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs if not installed locally
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.addStyleTag({ content: '' }).catch(() => {});
await page.goto('file://' + html); await page.waitForFunction('document.getElementById("loader").hidden===true', null, { timeout: 120000 });
await page.addStyleTag({ content: `#controls,#transcript{display:none!important}#app,#stageWrap{height:100vh!important;padding:0!important}#stage{width:${W}px!important;height:${H}px!important;max-width:none!important;max-height:none!important}#cv{border-radius:0!important;box-shadow:none!important}` });
await page.evaluate(w => { __lesson.pause(); __lesson.scale = 1; __lesson.maxPx = w; Eng.resize(w); Eng.captions = true; }, W);
const dur = await page.evaluate('Eng.duration'); const secs = LIMIT ? Math.min(LIMIT, dur) : dur; const frames = Math.ceil(secs * FPS);
console.log(`plan: ${W}x${H} @ ${FPS} fps, ${secs.toFixed(1)} s = ${frames} frames -> ${OUT}  (CRF ${CRF})`);
if (DRY) { await browser.close(); console.log('dry run only; nothing rendered.'); process.exit(0); }
fs.mkdirSync(path.dirname(path.resolve(OUT)), { recursive: true });
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', nar, '-i', bed,
  '-filter_complex', '[1:a]aresample=48000,volume=1.0[n];[2:a]aresample=48000,volume=0.9[m];[n][m]amix=inputs=2:normalize=0:duration=longest[a]', '-map', '0:v', '-map', '[a]',
  '-t', String(secs), '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
process.on('SIGINT', () => { ff.kill('SIGINT'); process.exit(130); });
for (let i = 0; i < frames; i++) {
  const url = await page.evaluate(t => { Eng.draw(t); return document.getElementById('cv').toDataURL('image/jpeg', 0.94); }, i / FPS);
  const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % (FPS * 10) === 0) process.stdout.write(`\r${Math.round(i / frames * 100)}%`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close(); console.log('\ndone ->', OUT);
