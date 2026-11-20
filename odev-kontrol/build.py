"""index.html + style.css + app.js + vendor -> tek dosya (OdevKontrol.html).
  python3 build.py   -> OdevKontrol.html (çevrimdışı; bütün kütüphaneler içinde)
"""
import re

h = open('index.html', encoding='utf-8').read()
css = open('style.css', encoding='utf-8').read()


def gom(yol):
    return open(yol, encoding='utf-8').read().replace('</script', '<\\/script')


h = h.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + css + '\n</style>')
# Her <script src="..."> etiketinin yerine dosyanın içeriği konur.
h = re.sub(r'<script src="([^"]+)"[^>]*></script>',
           lambda m: '<script' + (' id="cvjs"' if 'opencv' in m.group(1) else '') + '>\n' + gom(m.group(1)) + '\n</script>', h)
open('OdevKontrol.html', 'w', encoding='utf-8').write(h)
print('OdevKontrol.html hazır:', round(len(h.encode('utf-8')) / 1e6, 1), 'MB')
