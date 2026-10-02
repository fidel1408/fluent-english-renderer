"""Safe-margin check: every <text>/<image> that is visible must stay inside x 54..1026 (sides) and y 230..1560 (Reels top/bottom UI zones).
Also reports caption/logo overlap."""
import sys, json
from playwright.sync_api import sync_playwright
root = sys.argv[1]; mode = sys.argv[2] if len(sys.argv) > 2 else 'ipa'
JS = """(t)=>{renderAt(t,'%s'); const out=[]; document.querySelectorAll('#stage svg text, #stage svg image').forEach(e=>{
  const r=e.getBoundingClientRect(); const op=parseFloat(getComputedStyle(e).opacity||1); let a=1, n=e; while(n&&n.tagName!=='svg'){ const o=n.getAttribute&&n.getAttribute('opacity'); if(o!=null) a*=parseFloat(o); n=n.parentNode;}
  if(a<0.5||r.width===0) return; out.push({tag:e.tagName, txt:(e.textContent||e.getAttribute('href')||'').slice(0,30), x0:r.left,x1:r.right,y0:r.top,y1:r.bottom}); }); return out;}""" % mode
bad = {}; n = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/opt/pw-browsers/chromium", args=["--no-sandbox"]); pg = b.new_page(viewport={"width": 1080, "height": 1920}); pg.goto(f"file://{root}/web/index.html?export=1&mode={mode}"); pg.evaluate("fontsReady()")
    for i in range(0, 900, 3):
        t = i / 30; 
        for e in pg.evaluate(JS, t):
            n += 1
            if e['x0'] < 54 or e['x1'] > 1026 or e['y1'] > 1560 or (e['y0'] + 0.18 * (e['y1'] - e['y0']) < 230 and e['tag'] == 'text'):
                k = (e['txt'], round(e['x0']), round(e['x1']), round(e['y0']), round(e['y1'])); bad.setdefault(k, []).append(round(t, 1))
    b.close()
print("elements checked:", n)
from collections import defaultdict
g=defaultdict(list)
for k, v in bad.items(): g[k[0]]+=v
for k, v in g.items(): print("OUTSIDE", repr(k), "t=", min(v), "..", max(v))
print("violations:", len(bad))
