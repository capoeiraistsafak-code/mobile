# TYT Fizik videoları

> **Format:** "Konu Anlatımı" oturumunun "1 Dakikada Fizik" motoru (`format-referans/`). TYT videoları `video/` klasöründeki kopyasıyla yapılır:
> `video/konu.html?k=<konu>` · içerik `video/<konu>.js` (meta, sayfalar `P`, giriş `hook`) · kareler/video `node video/rec.js 30 cikti.mp4` · efekt sesleri `python3 video/ses_konu.py`.
> TYT farkları: üst yazılar "5 DAKİKADA TYT · TYT FİZİK", sayfada ve bantta "ADIM" yerine bölümün sorusu, girişte büyük renkli konu başlığı.

5 dakikalık, 1080×1920 dikey, koyu temalı konu anlatımı videoları.

**Video akışı:** Giriş (6 sn animasyon: büyük konu başlığı + soru + hikâye; her zaman 5–7 sn) → Kapak ("5 DAKİKADA TYT") → 7 adım (her adımın altında "TYT TUZAĞI" kutusu, son adım TYT tarzı soru) → Kapanış (KONU BİTTİ + Takip Et)

| Sıra | Konu | Sayfa | Metin | Durum |
|---|---|---|---|---|
| 1 | Isı ve Sıcaklık | `konular/isi_sicaklik.html` | `konular/isi_sicaklik.md` | taslak |
| 1 | Isı ve Sıcaklık · **Soru Çözümü** | `video/konu.html?k=isi_sicaklik_soru` | `video/seslendirme/isi_soru_metin.txt` | kareler onay bekliyor (`FORMAT_SORU.md`) |
| 1 | Isı ve Sıcaklık · **Tuzak Sorular** (10 soru) | `video/konu.html?m=test_motor&k=isi_tuzak&s=sync_isi_tuzak` | `video/seslendirme/isi_tuzak_metin.txt` | **sesli video hazır**: `kareler/isi_tuzak/isi_tuzak_tyt.mp4` (6:51, 2 sayfa × 5 soru, doğru şık yeşil) |
| – | Elektrostatik | `konular/elektrostatik.html` | `konular/elektrostatik.md` | taslak (örnek) |

- `ortak.css`: Tüm konuların ortak stili (renkler, sayfa, kapak, tuzak kutusu)
- `node render_kareler.js <konu>`: `kareler/<konu>/` içine sahne karelerini üretir
- `sh pano.sh <konu>`: Tüm kareleri tek bir panoda (`kareler/<konu>/pano.png`) toplar
- `node render_giris.js <konu>`: Giriş animasyonunun sessiz önizlemesini (`kareler/<konu>/giris_onizleme.mp4`) üretir. Sayfada `?s=giris&t=<sn>` o anı, `?s=giris&oynat=1` canlı oynatmayı gösterir

## Giriş formatı (bütün TYT videolarında aynı)

**Onaylı örnek (Şafak Hoca tarzı):** `konular/isi_sicaklik.html` → `#giris`, video `kareler/isi_sicaklik/giris_onizleme.mp4`

Bu tarzı yapan şeyler:
- **Konu:** Herkesin evinde gördüğü bir sistem seçilir (kalorifer: kombi → borular → petekler).
- **Süreç:** Fiziksel olay adım adım ve sürekli akarak görünür. Su kombide ısınır (mavi → kırmızı), peteklere gider, orada soğur (kırmızı → mavi) ve geri döner.
- **Sonuç:** Odalarda ısınma görünür hâle gelir: petek turuncuya döner, sıcak hava yükselir, konveksiyon okları döner, termometreler artar.
- **Yer:** Mekânlar eşyalarla anlaşılır. Banyo duşakabin, lavabo, fayans ve havluyla gösterilir, pencere yoktur. Oturma odası TV, koltuk, lambader ve pencereyle gösterilir.
- **Düzen:** Kaynak (kombi) üstte, etkilenen yerler altta.

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

## Notların yeri (bütün TYT videolarında)

- **Notun yeri:** Bir animasyonla ilgili kalem notu, o animasyonun **hemen altına** yazılır. Notlar sayfanın altına toplu liste olarak yazılmaz.
  - Örnek: "Sıcaklık: °C · °F · K" termometrenin altında, "Isı: joule · kalori" kalorimetre kabının altında.
- **Formüller:** Bir formül birden fazla nesneye ait parçalardan oluşuyorsa, her parça kendi nesnesinin altına yazılır.
  - Örnek: C/100 °C termometresinin, (F − 32)/180 °F termometresinin, (K − 273)/100 K termometresinin altında; aralarında "=".
- **Bölmeler:** El yazısındaki gibi kesirle yazılır: pay üstte, payda altta, arada kesir çizgisi (`KS(pay, payda)`). "a/b" biçiminde yazılmaz.
- **Genel notlar:** Belirli bir animasyona ait olmayan notlar (ör. "Dikkat" uyarıları) en alta yazılabilir.
