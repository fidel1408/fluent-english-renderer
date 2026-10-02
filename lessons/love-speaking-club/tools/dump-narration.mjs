import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(here, '..', 'js', 'content.js'), 'utf8'), ctx);
const LC = ctx.window.LC;
fs.mkdirSync(path.join(here, 'cache'), { recursive: true });
fs.writeFileSync(path.join(here, 'cache', 'narration.json'), JSON.stringify({ voices: LC.VOICES, lines: LC.NAR }, null, 1));
console.log(Object.keys(LC.NAR).length, 'lines');
