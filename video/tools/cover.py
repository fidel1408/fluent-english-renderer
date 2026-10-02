import sys
from playwright.sync_api import sync_playwright
root=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium",args=["--no-sandbox"])
    pg=b.new_page(viewport={"width":1080,"height":1920}); pg.goto(f"file://{root}/web/index.html?export=1"); pg.evaluate("fontsReady()"); pg.evaluate("renderCover()")
    pg.screenshot(path=f"{root}/out/fluent_english_cover_1080x1920.png")
    pg.screenshot(path=f"{root}/out/fluent_english_cover_1080x1350.png",clip={"x":0,"y":285,"width":1080,"height":1350})
    b.close()
