"""Fizik Oyunları'nı TEK bir HTML dosyasına paketler (internetsiz, tablette indirip açmak için).
three.min.js, logo.png ve yazı tipleri (Inter, Caveat: latin, latin-ext, greek) dosyanın içine gömülür.
Kullanım: python3 tek_dosya.py <fizik_oyunlari klasörü> <yazı tipi css> <çıktı.html>
"""
import base64, re, sys, urllib.request, os

kl, css_yol, cikti = sys.argv[1], sys.argv[2], sys.argv[3]
html = open(os.path.join(kl, 'index.html'), encoding='utf-8').read()
three = open(os.path.join(kl, 'three.min.js'), encoding='utf-8').read()
logo = base64.b64encode(open(os.path.join(kl, 'logo.png'), 'rb').read()).decode()

# yazı tipleri: yalnız Türkçe/Yunanca harfler için gerekli alt kümeler
css = open(css_yol, encoding='utf-8').read()
bloklar = re.findall(r'/\* ([a-z-]+) \*/\s*(@font-face \{.*?\})', css, re.S)
gom, onbellek = [], {}
for alt, blok in bloklar:
    if alt not in ('latin', 'latin-ext', 'greek'):
        continue
    url = re.search(r'url\((https://[^)]+)\)', blok).group(1)
    if url not in onbellek:
        istek = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        onbellek[url] = base64.b64encode(urllib.request.urlopen(istek).read()).decode()
    gom.append(blok.replace(url, 'data:font/woff2;base64,' + onbellek[url]))
font_css = '\n'.join(gom)

html = re.sub(r'<link href="https://fonts.googleapis.com[^>]+>', '<style>' + font_css + '</style>', html)
html = html.replace('<script src="three.min.js"></script>', '<script>' + three.replace('</script', '<\\/script') + '</script>')
for m in re.findall(r'<script src="(konular/[^"]+)"></script>', html):
    js = open(os.path.join(kl, m), encoding='utf-8').read()
    html = html.replace(f'<script src="{m}"></script>', '<script>' + js.replace('</script', '<\\/script') + '</script>')
html = html.replace('url(logo.png)', 'url(data:image/png;base64,' + logo + ')')
assert '<script src="three.min.js">' not in html and 'url(logo.png)' not in html
open(cikti, 'w', encoding='utf-8').write(html)
print(cikti, round(len(html.encode()) / 1e6, 2), 'MB', len(onbellek), 'yazı tipi dosyası')
