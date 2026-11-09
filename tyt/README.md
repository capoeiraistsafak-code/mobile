# TYT Fizik videoları

5 dakikalık, 1080×1920 dikey, koyu temalı konu anlatımı videoları.

**Video akışı:** Giriş (6 sn animasyon: büyük konu başlığı + soru + hikâye; her zaman 5–7 sn) → Kapak ("5 DAKİKADA TYT") → 7 adım (her adımın altında "TYT TUZAĞI" kutusu, son adım TYT tarzı soru) → Kapanış (KONU BİTTİ + Takip Et)

| Sıra | Konu | Sayfa | Metin | Durum |
|---|---|---|---|---|
| 1 | Isı ve Sıcaklık | `konular/isi_sicaklik.html` | `konular/isi_sicaklik.md` | taslak |
| – | Elektrostatik | `konular/elektrostatik.html` | `konular/elektrostatik.md` | taslak (örnek) |

- `ortak.css`: Tüm konuların ortak stili (renkler, sayfa, kapak, tuzak kutusu)
- `node render_kareler.js <konu>`: `kareler/<konu>/` içine sahne karelerini üretir
- `sh pano.sh <konu>`: Tüm kareleri tek bir panoda (`kareler/<konu>/pano.png`) toplar
- `node render_giris.js <konu>`: Giriş animasyonunun sessiz önizlemesini (`kareler/<konu>/giris_onizleme.mp4`) üretir. Sayfada `?s=giris&t=<sn>` o anı, `?s=giris&oynat=1` canlı oynatmayı gösterir

## Giriş formatı (bütün TYT videolarında aynı)

Örnek: `konular/isi_sicaklik.html` → `#giris`

- **Süre:** 6 sn (her zaman 5–7 sn arası).
- **Arka plan:** Diğer sahnelerle aynı koyu arka plan; tam ekran renkli sahne yok.
- **Üst kısım, yukarıdan aşağı:**
  1. Kırmızı "TYT FİZİK" etiketi.
  2. Büyük konu başlığı, BÜYÜK HARFLE (`.hk-baslik`): sarı → turuncu → kırmızı renk geçişi, hafif turuncu parlama, altında aynı renkte çizgi.
  3. Merak uyandıran soru (60 px), anahtar kelime turuncu (`<em>`); kelime kelime belirir.
- **Animasyon (alt kısım):**
  - Herkesin günlük hayattan tanıdığı bir olayı adım adım canlandırır.
  - Yerler yazıyla değil, eşyalarla tanıtılır. Örneğin banyo duşakabin ve lavaboyla, oturma odası televizyon ve koltukla gösterilir.
  - Sayı ve sıcaklık gibi değerler küçük etiket ya da termometreyle gösterilir.
- **Altta:** Cevabın ipucunu veren tek satır.
- **Üretim sırası:** Önce fotoğraf (son kare) gönderilir; onaydan sonra sessiz önizleme videosu çıkarılır.
- **Seslendirme:** Kullanıcı onay vermeden asla yapılmaz.
