# TYT Fizik · "5 Dakikada TYT" SORU ÇÖZÜMÜ formatı (Şafak Hoca)

İki onaylı formatın birleşimi:

- **Konu videosu** (`FORMAT.md`, "5 Dakikada TYT" motoru, `video/`): koyu masa, sayfalar yan yana, kamera sayfadan sayfaya **uzaklaşıp yakınlaşarak** kayar; fosfor, kalem notları, Takip Et kartı, kapak.
- **Soru Videosu 2. Format** (`format-soru2/FORMAT_2.md`): her soru tek sayfa, "SORU n / N", olay animasyonu, kalemle çözüm, sonuç kutusu ve ✓.

Örnek: **Isı ve Sıcaklık** → içerik `video/isi_sicaklik_soru.js`, kareler `kareler/isi_sicaklik_soru/`.

## Kural: konu videosu → soru videosu

- Konu anlatımında kaç konu (sayfa) varsa soru videosunda **o kadar soru** olur. Isı ve Sıcaklık: **8 konu → 8 soru**.
- Her soru, konu anlatımındaki **aynı sıradaki konudan** gelir ve sayfa başlığında o konunun adı kırmızı etikette yazar.
- Sorular **TYT test** tarzındadır: soru kökü + A–E şıkları (öncüllü "I, II, III" ya da sayısal).
- Cevaplar şıklara dağıtılır; girişte cevap gösterilmez.

## Akış

1. **Giriş (~6 sn):** Konu videosunun girişiyle aynı iskelet: kırmızı "TYT FİZİK", renk geçişli büyük konu başlığı, kelime kelime beliren cümle.
   - Cümle: **"Konuyu anlattık… Haydi şimdi SORU çözelim!"** (anahtar kelime SORU sarı zeminli).
   - Animasyon: konu anlatımındaki 8 konunun kartları (simge + ad) sırayla gelir, sonra her kart dönerek "SORU n" ve boş A–E şıklarına dönüşür. Altta "8 KONU · 8 SORU".
2. **Kapak:** "Ben Şafak Hoca" denince. "5 DAKİKADA TYT", "TYT FİZİK", kanca "Haydi şimdi SORU çözelim!", logo, eğik sarı **"SORU ÇÖZÜMÜ"**, konu adı, "8 konu · 8 soru · animasyonlu çözüm", Takip Et kartı (alt yazısı **"Fizik · soru çözümü"**, `meta.takipAlt`).
3. **Soru sayfaları:** Üst bantta "SORU n / 8" ve konunun adı; sayfada "SORU n" + konu etiketi.
   1. Soru kökü (ve öncüller) konuşmayla aynı hızda **fosforlanır**; şıklar altında basılı durur.
   2. **Olay animasyonu:** soruda anlatılan olay canlandırılır (ısı akışı, termometre yükselmesi, ısıtıcı, karışım, grafik çizimi, çubuğun uzaması…).
   3. **Kalemle çözüm:** her not ait olduğu animasyonun hemen altına; formül parçaları kendi nesnesinin altına; bölmeler kesir (`KS`). Öncüller ✓ / ✗ ile işaretlenir.
   4. **Cevap:** "Cevap: [harf]" kırmızı kutuda + ✓; doğru şık yeşil çerçeveyle işaretlenip hafifçe zıplar.
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
| `isi_sicaklik_soru.js` | Örnek içerik: `meta` (`tur: 'SORU ÇÖZÜMÜ'`, `adim: 'SORU'`, `bitti`), 8 soru sayfası, giriş `hook`, `SK` (şıklar), `dogru` (doğru şık), `CEVAP` |
| `tahmini_sure_soru.js` | Ses yokken tahmini bölüm süreleri |
| `seslendirme/isi_soru_metin.txt` | Seslendirme metni (43 paragraf) |
| `kareler.js` | Onay kareleri: giriş, kapak, her sorunun son hâli, kamera geçişi, kapanış |
| `konu_motor.js` | Ortak motor; `meta.tur`, `meta.adim`, `meta.bitti`, `meta.takipAlt` seçenekleri eklendi (verilmezse konu videosu aynen kalır) |

```bash
cd tyt/video
# Kareler (onay için)
PAGE="$PWD/konu.html?k=isi_sicaklik_soru&s=tahmini_sure_soru" node kareler.js ../kareler/isi_sicaklik_soru
# Ses gelince (paragraf kimlikleri):
IDS=intro,p0r,p0s0,p0s1,p0s2,p0s3,p1r,p1s0,p1s1,p1s2,p1s3,p2r,p2s0,p2s1,p2s2,p2s3,p3r,p3s0,p3s1,p3s2,p3s3,p4r,p4s0,p4s1,p4s2,p4s3,p5r,p5s0,p5s1,p5s2,p5s3,p6r,p6s0,p6s1,p6s2,p6s3,p6s4,p7r,p7s0,p7s1,p7s2,p7s3,outro
python3 -I seslendirme/senk.py seslendirme/isi_soru_metin.txt words.json $IDS sync_isi_soru ses_isi_soru.wav
PAGE="$PWD/konu.html?k=isi_sicaklik_soru&s=sync_isi_soru" node rec.js 30 sessiz.mp4
```

Test videosu (seslendirmesiz, efekt sesli, tahmini sürelerle): EVENTS'i `ev.json` olarak kaydet, sonra
`node rec.js 30 sessiz.mp4` → `python3 -I ses_konu.py ev.json mix.wav` → ffmpeg ile birleştir.
Onaylı kareler ve test videosu: `kareler/isi_sicaklik_soru/`.

Yeni konu için: konu videosunun içerik dosyasındaki sayfa sırasını al, her sayfa için bir test sorusu yaz, `isi_sicaklik_soru.js`'yi örnek al.
