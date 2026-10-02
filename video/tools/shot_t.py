import sys
from playwright.sync_api import sync_playwright
ts=[float(x) for x in sys.argv[2].split(',')]; mode=sys.argv[3] if len(sys.argv)>3 else 'ipa'; scale=float(sys.argv[4]) if len(sys.argv)>4 else 0.5
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium",args=["--no-sandbox"])
    pg=b.new_page(viewport={"width":1080,"height":1920},device_scale_factor=scale)
    msgs=[]; pg.on("console",lambda m:msgs.append(m.text)); pg.on("pageerror",lambda e:msgs.append("ERR "+str(e)))
    pg.goto("file://"+sys.argv[1]+"/web/index.html?export=1&mode="+mode); pg.evaluate("fontsReady()")
    for t in ts:
        pg.evaluate(f"renderAt({t},'{mode}')"); pg.screenshot(path=f"{sys.argv[1]}/out/build_t{t:05.2f}.png")
    print("\n".join(msgs[:10])); b.close()
