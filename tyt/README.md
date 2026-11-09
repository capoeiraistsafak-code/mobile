# TYT Fizik videoları

5 dakikalık, 1080×1920 dikey, koyu temalı konu anlatımı videoları.

**Video akışı:** Giriş (soru + hikâye) → Kapak ("5 DAKİKADA TYT") → 7 adım (her adımın altında "TYT TUZAĞI" kutusu, son adım TYT tarzı soru) → Kapanış (KONU BİTTİ + Takip Et)

| Sıra | Konu | Sayfa | Metin | Durum |
|---|---|---|---|---|
| 1 | Isı ve Sıcaklık | `konular/isi_sicaklik.html` | `konular/isi_sicaklik.md` | taslak |
| – | Elektrostatik | `konular/elektrostatik.html` | `konular/elektrostatik.md` | taslak (örnek) |

- `ortak.css`: Tüm konuların ortak stili (renkler, sayfa, kapak, tuzak kutusu)
- `node render_kareler.js <konu>`: `kareler/<konu>/` içine sahne karelerini üretir
- `sh pano.sh <konu>`: Tüm kareleri tek bir panoda (`kareler/<konu>/pano.png`) toplar
