#!/usr/bin/env python3
"""Inline style, art, app and narration data into dist/daddy-takes-care.html (artifact fragment)
and dist/standalone.html (complete document for local use)."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda *p: open(os.path.join(ROOT, *p), encoding='utf-8').read()
tpl = rd('src', 'index.html')
out = tpl.replace('{{STYLE}}', rd('src', 'style.css')).replace('{{ART}}', rd('src', 'art.js')).replace('{{APP}}', rd('src', 'app.js'))
out = out.replace('{{DATA}}', rd('build', 'narration.json').replace('</', '<\\/'))
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
with open(os.path.join(ROOT, 'dist', 'daddy-takes-care.html'), 'w', encoding='utf-8') as f: f.write(out)
cut = out.index('</style>') + len('</style>')
head, body = out[:cut], out[cut:]
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="theme-color" content="#FFF1D9">\n' + head + '\n</head>\n<body>' + body + '\n</body>\n</html>\n')
with open(os.path.join(ROOT, 'dist', 'standalone.html'), 'w', encoding='utf-8') as f: f.write(doc)
# website build: same document plus share-card / home-screen metadata
SITE_URL = os.environ.get('SITE_URL', 'https://bhav1111.github.io/daddy-takes-care/')
DESC = 'An interactive picture book that reads aloud, animates every word, and lets Dad record his own voice.'
meta = ('<meta name="robots" content="noindex, nofollow">\n<meta name="description" content="%s">\n<meta property="og:type" content="website">\n<meta property="og:title" content="Daddy Takes Care">\n'
        '<meta property="og:description" content="%s">\n<meta property="og:url" content="%s">\n<meta property="og:image" content="%scover.png">\n'
        '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">\n'
        '<link rel="icon" type="image/png" href="icon.png">\n<link rel="apple-touch-icon" href="icon.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Daddy Takes Care">\n') % (DESC, DESC, SITE_URL, SITE_URL)
site = doc.replace('<meta name="theme-color" content="#FFF1D9">\n', '<meta name="theme-color" content="#FFF1D9">\n' + meta, 1)
os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True)
with open(os.path.join(ROOT, 'docs', 'index.html'), 'w', encoding='utf-8') as f: f.write(site)
open(os.path.join(ROOT, 'docs', '.nojekyll'), 'w').close()
print('docs/index.html written for', SITE_URL)
print('dist/daddy-takes-care.html %.0f KB, dist/standalone.html %.0f KB' % (len(out.encode()) / 1024, len(doc.encode()) / 1024))
