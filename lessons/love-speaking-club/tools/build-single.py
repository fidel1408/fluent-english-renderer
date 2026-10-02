#!/usr/bin/env python3
"""Builds love-speaking-club.html: one self-contained file (CSS, JS, fonts, logo, sound chart and all narration clips inlined as data URIs).
Use it where relative files are not loaded (e.g. an editor/preview pane, email, a shared drive)."""
import base64, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
b64 = lambda p, mime: f"data:{mime};base64," + base64.b64encode((root / p).read_bytes()).decode()
html = (root / 'index.html').read_text()
assets = {'assets/fluent_english_logo_white.png': b64('assets/fluent_english_logo_white.png', 'image/png'),
          'assets/fluent_english_logo_blue.png': b64('assets/fluent_english_logo_blue.png', 'image/png'),
          'assets/sound-chart.jpg': b64('assets/sound-chart.jpg', 'image/jpeg')}
def sub_assets(t):
    for k, v in assets.items(): t = t.replace(k, v)
    return t
def inline_css(m):
    return '<style>\n' + (root / m.group(1)).read_text() + '\n</style>'
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_css, html)
def inline_js(m):
    p = m.group(1); t = (root / p).read_text()
    if p == 'audio/manifest.js':
        t = re.sub(r'"f": "(audio/[^"]+)"', lambda mm: '"f": "' + b64(mm.group(1), 'audio/mpeg') + '"', t)
    t = sub_assets(t).replace('</script>', '<\\/script>')
    return '<script>\n' + t + '\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', inline_js, html)
html = sub_assets(html)
out = root / 'love-speaking-club.html'; out.write_text(html)
print(out.name, round(out.stat().st_size / 1048576, 2), 'MB')

# ---- artifact variant: a fragment (no doctype/html/head/body) for hosts that wrap the page themselves ----
import re as _re
frag = html
frag = _re.sub(r'<!doctype html>\s*', '', frag, flags=_re.I)
frag = _re.sub(r'<html[^>]*>\s*', '', frag); frag = frag.replace('</html>', '')
frag = _re.sub(r'<meta[^>]*>\s*', '', frag)
frag = frag.replace('<head>', '').replace('</head>', '').replace('<body>', '').replace('</body>', '')
frag = _re.sub(r'<title>.*?</title>', '<title>Love Speaking Club</title>', frag, count=1)
frag = frag.replace('<style>\n', '<style>\n:root { color-scheme: dark; }\n', 1)
(root / 'love-speaking-club.artifact.html').write_text(frag.strip() + '\n')
print('artifact fragment', round((root / 'love-speaking-club.artifact.html').stat().st_size / 1048576, 2), 'MB')
