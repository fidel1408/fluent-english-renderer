// usage: node dev/acts.mjs id1,id2,...   -> dev/out/acts/<id>_<k>.png  (frames: early, mid-hold of an item, reveal, last reveal)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path';
const ids = (process.argv[2] || '').split(',');
const b = await chromium.launch({ args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{ width:1920, height:1080 } });
p.on('pageerror', e => console.log('[pageerror]', e.message));
await p.goto('file://' + path.resolve(process.env.PAGE || 'dev/play.html'));
await p.waitForFunction('window.__done||window.__err', null, { timeout: 60000 });
for (const id of ids) {
  const ts = await p.evaluate((id) => {
    const a = window.ACTIVITIES.find(x => x.id === id); const b = Eng.BEAT[a.beat]; const L = k => Eng.LINE[k];
    const out = [b.t0 + 1.2];
    const items = a.items || [];
    if (items.length) { const it = items[0], h = L(it.h || it.m); out.push((h.t0 + h.t1) / 2); if (it.a) out.push(L(it.a).t0 + 1.8); const l = items[items.length - 1]; if (l.a) out.push(L(l.a).t0 + 1.8); else if (l.h) out.push(L(l.h).t0 + 0.8); }
    else if (a.rows) { out.push(b.t0 + (b.t1 - b.t0) * 0.5, b.t1 - 1); }
    else if (a.h1) { out.push(L(a.h1).t0 + 20, L(a.h2).t0 + 10, L(a.sw).t0 + 0.4); }
    else if (a.h) { out.push(L(a.h).t0 + 10); }
    else { const ls = b.lines; out.push(ls[Math.floor(ls.length / 2)].t0 + 1, b.t1 - 1); }
    return out;
  }, id);
  let k = 0;
  for (const t of ts) { await p.evaluate(`window.renderAt(${t})`); await p.screenshot({ path: `dev/out/acts/${id}_${k++}.png` }); }
  console.log(id, ts.map(x => x.toFixed(1)).join(' '));
}
await b.close();
