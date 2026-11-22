# "TYT Tuzak Sorular" video formatı (Şafak Hoca) — tam paket

Onaylı örnek: **Isı ve Sıcaklık · 10 Tuzak Soru** → `kareler/isi_tuzak/isi_tuzak_bolum1.mp4` (2:46), `isi_tuzak_bolum2.mp4` (2:50), kapaklar `kapak_bolum1.png`, `kapak_bolum2.png`.

Bu format üç formatın birleşimidir:
- **5 Dakikada TYT konu videosu** (`FORMAT.md`): HTML motoru, fosfor, kalem notları, kapak, Takip Et kartı, efekt sesleri.
- **Soru Videosu 1** (Yazılı Video Kiti): sınav kağıdı üzerinde soru soru yakınlaşma, puan kutusu.
- **Soru Videosu 2**: animasyon + kalem birlikte, kalem şekil üzerinde de çizer, sonuç kutusu ve ✓.

---

## 1. İçerik kuralları

- Konu: **"TYT'de çıkabilecek tuzak sorular ve çözümleri"**, bir konudan **10 tuzak soru**, test (A–E).
- **MEB TYT formatı:** günlük hayattan bağlamlı kök, "Buna göre," kalıbı, öncüller I–III ve "yargılarından hangileri doğrudur?"; şıklar ÖSYM kitapçığındaki gibi **alt alta**.
- Her soru tek bir yanılgıyı hedefler; kalem bunu kırmızı **"⚠ Tuzak: …"** notu olarak yazar.
- **Konu videosundaki görseller tekrar kullanılmaz;** her soru için yeni sahne ve yeni animasyon.
- Cevaplar şıklara dağıtılır (10 soruda A–E ikişer). Girişte cevap gösterilmez.
- Yanlış öncül notunda **hüküm başta** yazılır ("II ✗ yanlış: delik küçülmez, levha gibi büyür"); doğru bilgi asla "✗" ile bitmez.
- Öncül cümlelerinde özne net olmalı (ör. "**levha** ısıtıldıktan sonra", "bilye, ısıtıldıktan sonra" değil).
- Her sorunun cevabı yayından önce tek tek çözülerek kontrol edilir.
- **Çözümler ve animasyonlar fizik kanunlarına uygun olur.** Örnek: iletkende yalnız elektronlar hareket eder; animasyonda "+" (proton) yürümez, yerinde kalır ya da yüzeyde belirir. Kuvvetlerin yönü ve büyüklüğü (etki-tepki, itme-çekme) doğru çizilir.

## 2. Görünüm

- 1080×1920 dikey, 30 fps. Koyu masa üzerinde **beyaz test kağıdı**.
- **Sayfa başına 5 soru, 3 sütun**, sorular **sütun sütun**: 1–2 | 3–4 | 5. Ara sayfanın boş yuvasında "Diğer sayfaya geçiniz ➜" / "Devamı 2. bölümde ➜", son sayfanınkinde PUAN kutusu.
- Kağıt başlığı: "TYT FİZİK · KONU", "TYT TUZAK SORULARI · 10 SORU · n. SAYFA", Şafak Hoca, Adı Soyadı / Sınıfı / No / Puan, logo.
- Basılı soru siyah serif; şık harfleri kırmızı; kalem notları mavi el yazısı (Caveat); tuzak notu kırmızı.
- **Doğru şık YEŞİL:** kalem şıkkın etrafına **yeşil kutu** çizer (`#16A34A`), kutu **şıkkın yazısı kadardır**; kutu kapanınca şık hafifçe büyüyüp yeşil tonla parlar. "Cevap: X ✓" kutusu da yeşil.
- Üst bantta "TUZAK n / 10" ve sorunun konusu.

## 3. Akış

1. **Giriş (~6 sn):** kırmızı "TYT FİZİK", renk geçişli büyük konu başlığı, "TYT'de bu TUZAKLARA düşme!" kelime kelime; 10 kırmızı "⚠️ TUZAK n" kartı dönüp "SORU n"e dönüşür; altta "n. BÖLÜM · TUZAK a–b" (bölümün kartları öne çıkar).
2. **Kapak:** "Ben Şafak Hoca" denince. "3 DAKİKADA TYT", "TYT FİZİK", kanca, logo, eğik sarı "TUZAK SORULAR", kırmızı **"n. BÖLÜM"** rozeti, konu, "Tuzak a–b", Takip Et kartı.
3. **Test kağıdı:** önce sayfanın tamamı → 1. soruya yakınlaşma. Her soruda:
   1. Kök ve öncüller konuşmayla aynı hızda **fosforlanır**.
   2. **Animasyon** oynar; kalem **şekil üzerinde çizer** (alt çizgi, grafik, ışın, uç işareti).
   3. Kalem öncülleri ✓ / ✗ ile yazar, sonra kırmızı "⚠ Tuzak: …".
   4. Kalem doğru şıkka **yeşil kutu** çizer, "Cevap: X ✓".
4. **Kamera:** sorular arasında **azıcık geri çekilip kayar** (1,6 sn, `dip 0.45`); sayfa geçişinde biraz daha geri çekilip yan sayfaya geçer (2,6 sn, `dipSayfa 1.1`). Yakınlık logaritmik ve yumuşak değişir; abartı yok, ani kesme yok.
5. **Son:** puan kutusuna kırmızı "100", sayfanın tamamı, "10 TUZAK ÇÖZÜLDÜ · Sıradaki: …" ve Takip Et.

## 4. Seslendirme

- **Ses:** ElevenLabs "Safak Ulusoy Ses 2" (`yc417FKH7xlKI5Rt09Km`), model `eleven_v4`.
- **Ton:** öğretmen gibi, **"siz" hitabı**, düzgün Türkçe; öğrenciyi ekrana bağlayan cümleler ("Ekrana bakın", "Okları takip edin", "Kaleminizi alın ve ekrana odaklanın").
- **Etiketler doğru yerde, ton değişimi paragraf başında** (ses birden fırlamasın):

  | Bölüm | Etiket | Örnek |
  |---|---|---|
  | Soru okunurken | `[warmly]` | "Birinci soru. K kabında…" |
  | Animasyon | `[curious]` | "Ekrana bakın. …" |
  | Öncüller | `[warmly]` | "Birinci yargı yanlış, çünkü cisim ısı İÇERMEZ — …" |
  | Tuzak | `[firmly]` | "Dikkat! Tuzak şu — …" |
  | Cevap | `[excited]` | "Doğru cevap E şıkkı, iki ve üç!" |
  | Giriş / kapanış | `[warmly]` → `[excited]` | "… Haydi başlayalım!" / "… hepsini birlikte çözdük!" |

- Soru başına **tek** BÜYÜK harfli vurgu; vurgu duraklaması "—"; sayılar yazıyla; ünlem yalnızca cevapta, girişte ve kapanışta.
- Her paragraf motordaki bir bölüme karşılık gelir: `intro, p0r, p0s0…p0s3, …, p9s3, outro` (10 soru → 52 paragraf).

### ElevenLabs kuralları (kesin)

- **Kullanıcıya sormadan ve onayı alınmadan ElevenLabs KESİNLİKLE kullanılmaz.**
- Önce `estimate_only` ile **maliyeti söyle**, **ikinci onayı al**, sonra **tek üretim** (`generations_count: 1`).
- `eleven_v4` tek seferde **en fazla 5.000 karakter** alır: metni soru sınırından ikiye böl (her parça ayrı tek üretim), aralarına 0,6 sn sessizlik koyup birleştir. Bölmenin de onayı alınır.
- Hatalı üretimi asla kendiliğinden tekrar deneme.
- Kelime zamanları: `eleven_scribe_v1` yazıya dökme **ücretsiz** (0 kredi), TTS düğümüne `connect_from` ile bağlanır.

### Ses işleme

1. `seslendirme/senk.py` — paragraf sınırlarını **metin ile yazıya dökmeyi hizalayarak** bulur (kelime bölünmeleri farklı olabilir; "—" kelime sayılmaz), kesimleri sessizliğe taşır.
2. `ses_duzle.py` — paragraf seviyelerini ortancanın **±2 dB**'sine yumuşakça çeker (coşku duyulur, ses fırlamaz).
3. `ses_konu.py` — efekt sesleri (kalem yazma -40 dB, kalemle çizgi -42 dB, ✓ tık, sayfa geçişi, Takip Et tıklaması) + seslendirme; **fon müziği yok**.
4. Son karışım **-14 LUFS**.

## 5. Bölümler ve hız (Instagram)

- Video **iki bölüm**, her biri 5 soru (bir sayfa), her biri **3:00'ın altında**.
- Her bölüm **1,3× hızlandırılır**: görüntü `setpts=PTS/1.3`, ses `atempo=1.3` (**perde korunur**, ses incelmez).
- İki bölüm de **aynı giriş konuşmasını** kullanır; kapanış konuşması 2. bölümde. 1. bölüm "5 TUZAK ÇÖZÜLDÜ · Sıradaki: 2. bölüm" ile biter, puan yok.
- Yeni ses üretilmez; tek seslendirme `sync_<konu>_b1/b2` ile bölünür.

## 6. Üretim sırası

1. Sorular (MEB TYT formatı) → **fotoğraflı sunum / kareler** → kullanıcı kontrol eder, onay. İstenmeden video çıkarılmaz.
2. Seslendirme metni → onay.
3. Maliyet → ikinci onay → ses (tek üretim, gerekirse 2 parça).
4. Yazıya dökme (ücretsiz) → `senk.py` → `ses_duzle.py`.
5. `./uret.sh` ile bölüm 1 ve 2 (1,3×) → ses eşleşmesi ve -14 LUFS kontrolü.
6. `kapak.js` ile Instagram kapakları (Takip Et kartı olmadan).

## 7. Dosyalar (`tyt/video/`)

| Dosya | Görevi |
|---|---|
| `konu.html` | Sayfa: `?m=test_motor&k=<icerik>&b=<bölüm>&s=<sync>` |
| `test_motor.js` | Test kağıdı motoru (sayfa/sütun, yumuşak kamera, puan, bölüm desteği: `ilk`, `toplam`, `puanYok`, `bosYazi`, `bolum`, `kalemMin`, `dip`, `dipSayfa`) |
| `konu_motor.js` | Konu videosu motoru (kapak, bant, kalem; test motoru bunun kopyası) |
| `konu_yardim.js` | Çizim yardımcıları: `H` kalem notu, `PL` kalemle çizgi, `CK` ✓, `SCENE`, `ARR`, `EM` |
| `isi_tuzak.js` | Örnek içerik: 10 tuzak soru; `SK` şıklar, `MARK` kalemle şekil işareti, `KUTU`/`kutuKur`/`kutuIsik` yeşil cevap kutusu, `TZ` tuzak notu, `yerlestir` (sahne şıkların altına kayar), bölüm seçimi (`b=1/2`) |
| `tahmini_sure_tuzak.js` | Ses yokken tahmini süreler (kareler için) |
| `kareler.js` | Onay kareleri (kağıt, her soru, geçişler, puan, kapanış) |
| `olaylar.js` | Zaman çizelgesini (EVENTS) JSON'a yazar |
| `rec.js` | Kareleri video olarak kaydeder |
| `ses_konu.py`, `sesler/` | Efekt sesleri + seslendirme karışımı |
| `ses_duzle.py` | Paragraf seviyelerini ±2 dB'ye yumuşatır |
| `seslendirme/senk.py` | Metin ↔ kelime zamanı hizalaması |
| `seslendirme/isi_tuzak_metin.txt` | Örnek seslendirme metni (52 paragraf, etiketli) |
| `uret.sh` | Tek komutla sesli video (bölüm ve hız seçenekli) |
| `kapak.js` | Instagram kapağı |

```bash
cd tyt/video
# Kareler (onay için, ses yokken)
PAGE="$PWD/konu.html?m=test_motor&k=isi_tuzak&s=tahmini_sure_tuzak" node kareler.js ../kareler/isi_tuzak
# Ses gelince
IDS=intro$(for i in $(seq 0 9); do printf ",p${i}r"; for k in 0 1 2 3; do printf ",p${i}s${k}"; done; done),outro
python3 -I seslendirme/senk.py seslendirme/isi_tuzak_metin.txt words.json $IDS sync_isi_tuzak ses_isi_tuzak.wav
python3 -I ses_duzle.py ses_isi_tuzak.wav sync_isi_tuzak.json ses_isi_tuzak_duz.wav
# Bölümler (1,3×)
./uret.sh isi_tuzak sync_isi_tuzak_b1 ses_isi_tuzak_duz.wav ../kareler/isi_tuzak/isi_tuzak_bolum1.mp4 1 1.3
./uret.sh isi_tuzak sync_isi_tuzak_b2 ses_isi_tuzak_duz.wav ../kareler/isi_tuzak/isi_tuzak_bolum2.mp4 2 1.3
```

## 8. Popüler fizik videolarında kullanılabilecek parçalar

Bunlar konudan bağımsızdır; doğrudan alınabilir:

- **Seslendirme tonu ve etiket düzeni** (bölüm 4): öğretmen sesi, "siz" hitabı, paragraf başında ton geçişi, tek vurgu, "—" duraklaması.
- **ElevenLabs kuralları:** onaysız kullanmama, maliyet + ikinci onay, tek üretim, 5.000 karakter bölme, ücretsiz yazıya dökme.
- **Ses zinciri:** `senk.py` (hizalama) → `ses_duzle.py` (±2 dB, ses fırlamaz) → efekt karışımı → -14 LUFS.
- **Yumuşak kamera:** logaritmik yakınlık + hafif geri çekilme (`camAt` + `dip`), abartısız geçişler.
- **Kalem sistemi:** animasyonla birlikte şekil üzerinde çizim (`MARK`), yazı ve çizgi sesleri, kalemin konuşmaya yetişmesi (`kalemMin`).
- **Instagram kesimi:** 3 dakika sınırı için bölüm + 1,3× hız (perde korunur), her bölüme aynı giriş, kapakta bölüm rozeti.
- **Üretim disiplini:** önce kareler/sunum, sonra metin, sonra maliyet ve onay, en son video.
