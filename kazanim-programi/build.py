"""index.html + style.css + app.js -> tek dosya.
  python3 build.py              -> KazanimTakip.html (çevrimdışı, kütüphane içinde)
  python3 build.py --artifact X -> Claude'da yayın için sayfa (kütüphane cdnjs'den)
"""
import sys, re
h = open('index.html', encoding='utf-8').read()
css = open('style.css', encoding='utf-8').read()
js = open('app.js', encoding='utf-8').read()
CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
if '--artifact' in sys.argv:
    out = sys.argv[sys.argv.index('--artifact') + 1]
    body = h[h.index('<body>') + 6:h.index('</body>')]
    body = body.replace('<script src="vendor/xlsx.full.min.js"></script>', f'<script src="{CDN}"></script>')
    body = body.replace('<script src="app.js"></script>', '<script>window.KT_ARTIFACT = true;\n' + js + '\n</script>')
    page = ('<title>Kazanım Takip Programı</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
            '<style>\n' + css + '\nbody::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bar); }\n</style>\n' + body)
    open(out, 'w', encoding='utf-8').write(page)
else:
    x = open('vendor/xlsx.full.min.js', encoding='utf-8').read().replace('</script', '<\\/script')
    h = h.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>')
    h = h.replace('<script src="vendor/xlsx.full.min.js"></script>', '<script>' + x + '</script>')
    h = h.replace('<script src="app.js"></script>', '<script>\n' + js + '\n</script>')
    open('KazanimTakip.html', 'w', encoding='utf-8').write(h)
