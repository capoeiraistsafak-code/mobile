# TYT Fizik · "5 Dakikada TYT" SORU ÇÖZÜMÜ formatı (Şafak Hoca)

İki onaylı formatın birleşimi:

- **Konu videosu** (`FORMAT.md`, "5 Dakikada TYT" motoru, `video/`): koyu masa, sayfalar yan yana, kamera sayfadan sayfaya **uzaklaşıp yakınlaşarak** kayar; fosfor, kalem notları, Takip Et kartı, kapak.
- **Soru Videosu 2. Format** (`format-soru2/FORMAT_2.md`): her soru tek sayfa, "SORU n / N", olay animasyonu, kalemle çözüm, sonuç kutusu ve ✓.

**Görünüm: BEYAZ TEST KAĞIDI (Soru Videosu 1 düzeni).** Koyu masa üzerinde **tek bir beyaz sınav kağıdı**: başlıkta "TYT FİZİK · KONU", "KONU KONU TEST · 8 SORU", Şafak Hoca, Adı Soyadı / Sınıfı / No / Puan alanları ve logo; sorular **iki sütunda dörder** (Soru Videosu 1'deki 10 soruluk yazılı kağıdının 8 soruluk TYT testi hâli).
- Kamera **bütün kağıdı** gösterir → **soruya yakınlaşır** → soru çözülür → **kağıda uzaklaşır** (çözülen sorular kağıtta görünür) → sıradaki soruya yakınlaşır.
- Sonda kamera **puan kutusuna** gider, kırmızı "100" yazılır, sonra bütün kağıt + "8 SORU TAMAM".
- Basılı soru siyah serif, şık harfleri kırmızı, kalem mavi, cevap kutusu kırmızı. Giriş ve kapak koyu kalır.
- Motor: `video/test_motor.js` (konu motorunun kopyası; konu videosu `konu_motor.js` ile aynen kalır). Sayfa: `konu.html?m=test_motor&k=<içerik>&s=<sync>`.

Örnek: **Isı ve Sıcaklık** → içerik `video/isi_sicaklik_soru.js`, kareler `kareler/isi_sicaklik_soru/`.

## Kural: konu videosu → soru videosu

- Konu anlatımında kaç konu (sayfa) varsa soru videosunda **o kadar soru** olur. Isı ve Sıcaklık: **8 konu → 8 soru**.
- Her soru, konu anlatımındaki **aynı sıradaki konudan** gelir ve sayfa başlığında o konunun adı kırmızı etikette yazar.
- Sorular **TYT test** tarzındadır: soru kökü + A–E şıkları (öncüllü "I, II, III" ya da sayısal).
- Cevaplar şıklara dağıtılır; girişte cevap gösterilmez.
- **MEB TYT formatı:** günlük hayattan bağlamlı kök ("Ece, aynı mutfakta…", "Bir öğrenci yaptığı X termometresinde…"), "Buna göre," kalıbı, öncüller I–III ve "yargılarından hangileri doğrudur?", şıklar ÖSYM kitapçığındaki gibi **alt alta A)–E)**.
- **Konu videosundaki görseller tekrar kullanılmaz:** her soru için yeni sahne ve yeni animasyon (ör. kaşıklar ve eller, çaydanlık + iç enerji sütunları, buzlu kapta X ve °C termometresi, K-L-M kapları + grafik, buzlu bardakta yoğuşma, çay + ısınan kaşık, termos kesiti, bükülen bimetal).

## Akış

1. **Giriş (~6 sn):** Konu videosunun girişiyle aynı iskelet: kırmızı "TYT FİZİK", renk geçişli büyük konu başlığı, kelime kelime beliren cümle.
   - Cümle: **"Konuyu anlattık… Haydi şimdi SORU çözelim!"** (anahtar kelime SORU sarı zeminli).
   - Animasyon: konu anlatımındaki 8 konunun kartları (simge + ad) sırayla gelir, sonra her kart dönerek "SORU n" ve boş A–E şıklarına dönüşür. Altta "8 KONU · 8 SORU".
2. **Kapak:** "Ben Şafak Hoca" denince. "5 DAKİKADA TYT", "TYT FİZİK", kanca "Haydi şimdi SORU çözelim!", logo, eğik sarı **"SORU ÇÖZÜMÜ"**, konu adı, "8 konu · 8 soru · animasyonlu çözüm", Takip Et kartı.
3. **Soru sayfaları:** Üst bantta "SORU n / 8" ve konunun adı; sayfada "SORU n" + konu etiketi.
   1. Soru kökü (ve öncüller) konuşmayla aynı hızda **fosforlanır**; şıklar altında basılı durur.
   2. **Animasyon + kalem birlikte (Soru Videosu 2. Format gibi):** soruda anlatılan olay canlandırılır (ısı akışı, termometre yükselmesi, ısıtıcı, karışım, çubuğun uzaması…) ve kalem **şekil üzerinde de çizer**: grafik kalemle çizilir, ışınlar kalemle çekilir, önemli değerlerin altı çizilir, uç noktalar işaretlenir (`MARK`).
   3. **Kalemle çözüm:** her not ait olduğu animasyonun hemen altına; formül parçaları kendi nesnesinin altına; bölmeler kesir (`KS`). Öncüller ✓ / ✗ ile işaretlenir.
   4. **Cevap:** kalem doğru şıkkın etrafına **kırmızı kutu** çizer (`KUTU` + `kutuKur`), kutu kapanınca şık büyüyüp parlar (`kutuIsik`); ardından "Cevap: [harf]" + ✓.
   - **Sesler TYT konu videosundaki gibi** (`ses_konu.py`): kalemle yazma, kalemle çizgi (şekil işaretleri ve kutu dahil düz sürtünme), ✓ tık, sayfa geçişi, Takip Et tıklaması. Seslendirme ve fon müziği yok (test videosu).
   5. Kamera bir sonraki sayfaya **uzaklaşıp yakınlaşarak** geçer; ortadaki geçişte Takip Et kartı bir kez daha çıkar.
4. **Kapanış:** "8 SORU TAMAM · Sıradaki: …" bandı ve Takip Et kartı.

Süre: ~5–6 dakika (ses gelince sese göre).

## Ses (değişmedi)

- ElevenLabs "Safak Ulusoy Ses 2", `eleven_v4`, etiketler [excited] [curious] [warmly], BÜYÜK harf vurgu, "…" duraklama, sayılar yazıyla.
- Her paragraf bir bölüm: `intro, p0r, p0s0…, outro`. Soru paragrafları "Birinci soru." … ile başlar; son adım "Cevap X şıkkı".
- **ElevenLabs kullanıcıya sorulmadan ve onayı alınmadan KESİNLİKLE kullanılmaz** (ne ses üretimi, ne maliyet tahmini, ne başka bir araç). Önce kullanıcıya sorulur; onay gelirse tutar söylenir, ikinci onayla **tek** üretim yapılır.
- Ses ham, 60 Hz altı kesilir, -14 LUFS, fon müziği yok. Efektler `ses_konu.py` ile (kalem, geçiş, tık).

## Üretim sırası

1. Kareler (fotoğraf) → onay. İstenmeden video çıkarılmaz.
2. Seslendirme metni → onay.
3. Ses (yalnızca kullanıcı onayıyla, ya da kullanıcı kendi mp3'ünü gönderir) → `senk.py` → video → karışım.
4. Instagram kapağı: videodaki kapak, Takip Et kartı olmadan.

## Dosyalar ve komutlar (`video/`)

| Dosya | Görevi |
|---|---|
| `isi_sicaklik_soru.js` | Örnek içerik: `meta` (`tur: 'SORU ÇÖZÜMÜ'`, `adim: 'SORU'`, `bitti`), 8 soru sayfası, giriş `hook`, `SK` (şıklar), `MARK` (kalemle şekil işareti), `KUTU`/`kutuKur`/`kutuIsik` (doğru şıkka kalemle kutu), `CEVAP` |
| `tahmini_sure_soru.js` | Ses yokken tahmini bölüm süreleri |
| `seslendirme/isi_soru_metin.txt` | Seslendirme metni (42 paragraf) |
| `kareler.js` | Onay kareleri: giriş, kapak, her sorunun son hâli, kamera geçişi, kapanış |
| `konu_motor.js` | Ortak motor; `meta.tur`, `meta.adim`, `meta.bitti` seçenekleri eklendi (verilmezse konu videosu aynen kalır) |

```bash
cd tyt/video
# Kareler (onay için)
PAGE="$PWD/konu.html?m=test_motor&k=isi_sicaklik_soru&s=tahmini_sure_soru" node kareler.js ../kareler/isi_sicaklik_soru
# Ses gelince (paragraf kimlikleri):
IDS=intro,p0r,p0s0,p0s1,p0s2,p0s3,p1r,p1s0,p1s1,p1s2,p1s3,p2r,p2s0,p2s1,p2s2,p2s3,p3r,p3s0,p3s1,p3s2,p3s3,p4r,p4s0,p4s1,p4s2,p4s3,p5r,p5s0,p5s1,p5s2,p5s3,p6r,p6s0,p6s1,p6s2,p6s3,p7r,p7s0,p7s1,p7s2,p7s3,outro
python3 -I seslendirme/senk.py seslendirme/isi_soru_metin.txt words.json $IDS sync_isi_soru ses_isi_soru.wav
PAGE="$PWD/konu.html?m=test_motor&k=isi_sicaklik_soru&s=sync_isi_soru" node rec.js 30 sessiz.mp4
```

Yeni konu için: konu videosunun içerik dosyasındaki sayfa sırasını al, her sayfa için bir test sorusu yaz, `isi_sicaklik_soru.js`'yi örnek al.

## Tuzak sorular videosu (aynı format)

"TYT'de çıkabilecek tuzak sorular ve çözümleri": konunun 10 tuzak sorusu, test kağıdı (2 sütun × 5), MEB TYT formatı.
- Bantta ve sayfada "TUZAK n / 10" (`meta.adim: 'TUZAK'`), kapakta "TUZAK SORULAR", kapanışta "10 TUZAK ÇÖZÜLDÜ".
- Giriş: "TYT'de bu TUZAKLARA düşme!"; 10 kırmızı "⚠️ TUZAK n" kartı dönüp "SORU n"e dönüşür.
- Her soruda kalem, öğrencinin düştüğü yanılgıyı kırmızı **"⚠ Tuzak: …"** notu olarak yazar (`TZ`), sonra cevap kutusu.
- Sahne ve notlar şıkların bittiği yere kendiliğinden yerleşir (`yerlestir`).
- Örnek: `video/isi_tuzak.js`, `video/tahmini_sure_tuzak.js`, `video/seslendirme/isi_tuzak_metin.txt` (52 paragraf: intro, p0r, p0s0…p0s3, …, p9s3, outro), kareler `kareler/isi_tuzak/`.

```bash
PAGE="$PWD/konu.html?m=test_motor&k=isi_tuzak&s=tahmini_sure_tuzak" node kareler.js ../kareler/isi_tuzak
```
