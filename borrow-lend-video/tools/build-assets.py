#!/usr/bin/env python3
"""Builds assets/assets.js: embeds the logo and fonts as data URIs so the canvas is never tainted.
Inputs: ../../fluent_english_logo.png, Nunito woff2 (npm i @fontsource/nunito), DejaVu Sans (IPA glyphs)."""
import base64, io, sys, os
from PIL import Image
from fontTools import subset
from fontTools.ttLib import TTFont
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, "..")
b64 = lambda b: base64.b64encode(b).decode()

logo = Image.open(os.path.join(root, "..", "fluent_english_logo.png")).convert("RGBA")
logo = logo.crop(logo.getbbox())
logo.thumbnail((1000, 1000), Image.LANCZOS)
buf = io.BytesIO(); logo.save(buf, "PNG", optimize=True)

def woff2(path): return open(path, "rb").read()
ipa_chars = "/kæn aɪˈbɑːroʊjʊpelɛdmibuk" + "".join(chr(c) for c in range(32, 127))
opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]
f = TTFont("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
s = subset.Subsetter(opts); s.populate(text=ipa_chars); s.subset(f)
out = io.BytesIO(); f.flavor = "woff2"; f.save(out)

js = "window.FE_ASSETS = {\n"
js += f'  logo: "data:image/png;base64,{b64(buf.getvalue())}",\n  logoSize: [{logo.width}, {logo.height}],\n'
js += f'  nunito800: "data:font/woff2;base64,{b64(woff2(os.path.join(here, "nunito-latin-800-normal.woff2")))}",\n'
js += f'  nunito900: "data:font/woff2;base64,{b64(woff2(os.path.join(here, "nunito-latin-900-normal.woff2")))}",\n'
js += f'  ipaFont: "data:font/woff2;base64,{b64(out.getvalue())}"\n}};\n'
open(os.path.join(root, "assets", "assets.js"), "w").write(js)
print("assets.js", len(js)//1024, "KB; logo", logo.size)
