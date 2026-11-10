# TYT Fizik · "5 Dakikada TYT" video formatı (Şafak Hoca)

Onaylı örnek: **Isı ve Sıcaklık** → `tyt/kareler/isi_sicaklik_motor/isi_sicaklik_tyt.mp4` (4:12) ve kapağı `kapak_isi_sicaklik.png`.

Bu format, "Konu Anlatımı" oturumundaki **"1 Dakikada Fizik" motorunun** (`tyt/format-referans/`) TYT kopyasıdır (`tyt/video/`). Motorun yapısı değiştirilmez; yalnızca aşağıdaki TYT farkları vardır.

---

## 1. Genel

- **Görüntü:** 1080×1920 dikey (Instagram), koyu tema.
- **Süre:** 4–6 dakika. Ünitenin tamamı, MEB sırasıyla, **konu konu** anlatılır ("adım adım" değil).
- **İçerik:** Her sayfa bir **soru** ile başlar (ör. "Isı nedir? Sıcaklık nedir? Farkı ne?"). Ünite, ilgili son konuyla ve öncekilerle ilişkisi kurularak biter.

## 2. Akış

1. **Giriş (soru + hikâye animasyonu, ~6 sn):**
   - Koyu arka plan, tam ekran renkli sahne yok.
   - En üstte kırmızı **"TYT FİZİK"** etiketi.
   - Altında büyük konu başlığı, büyük harfle (`meta.hookBaslik`): sarı → turuncu → kırmızı renk geçişi, hafif turuncu parlama, altında aynı renkte çizgi.
   - Merak uyandıran soru kelime kelime belirir; anahtar kelime BÜYÜK harfle yazılır ve sarı zeminle vurgulanır.
   - Altta **günlük hayattan** bir olayın canlandırması. Örnek: kombide ısınan su banyo ve oturma odasındaki peteklere gider, soğuyup döner.
   - Yerler **yazıyla değil eşyayla** gösterilir (banyo: duşakabin, lavabo, fayans, havlu, pencere yok; oturma odası: TV, koltuk, lambader, pencere).
   - Kaynak (kombi) üstte, etkilenen yerler altta. Değerler küçük etiket ya da termometreyle gösterilir.
2. **Kapak:** "Ben Şafak Hoca" denince gelir. Üstte kırmızı "⏱ 5 DAKİKADA TYT", altında sarı "TYT FİZİK", soru (anahtar kelime sarı zeminli), logo, eğik sarı "KONU ANLATIMI", konu adı, alt başlık, "TYT · 2026-2027", en altta "Şafak Hoca · Fizik". Kapakla birlikte "Takip Et" kartı gelir; butona basılınca "Takip ediliyor ✓" olur.
3. **Sayfalar:** Koyu masada sayfalar yan yana dizilir, kamera sayfadan sayfaya kayar. Her sayfada:
   - Üstteki sarı bantta o bölümün sorusu.
   - Tanım konuşmayla aynı hızda satır satır fosforlanır.
   - Adımlarda sahne animasyonu ve kurşun kalem ✏️ notları.
   - "Takip Et" kartı ortada bir kez daha çıkar.
4. **Kapanış:** "KONU BİTTİ · Sıradaki: …" bandı ve "Takip Et" kartı.

## 3. Sayfa yazım kuralları

- **Notun yeri:** Bir animasyonla ilgili kalem notu, **o animasyonun hemen altına** yazılır; sayfanın altına toplu liste yapılmaz.
  - Örnek: "Sıcaklık: °C · °F · K" termometrenin altında, "Isı: joule · kalori" kalorimetre kabının altında.
- **Formül parçaları:** Bir formülün parçaları farklı nesnelere aitse her parça **kendi nesnesinin altına** yazılır.
  - Örnek: C/100 °C termometresinin, (F − 32)/180 °F'nin, (K − 273)/100 K'nin altında.
  - Aradaki "=" işaretleri iki nesnenin **tam ortasında** ve kesir çizgisi hizasında olur.
- **Bölmeler:** El yazısındaki gibi **kesirle** yazılır: pay üstte, payda altta, arada çizgi (`KS(pay, payda)`). "a/b" biçimi kullanılmaz.
- **Genel notlar:** Belirli bir animasyona ait olmayan notlar ("Dikkat: …" gibi) sayfanın en altında kalabilir.
- **TYT tuzakları:** Kalem notu olarak, "Dikkat" ile verilir.

## 4. Ses

- **Seslendirme:** ElevenLabs, "Safak Ulusoy Ses 2" sesi (`yc417FKH7xlKI5Rt09Km`), `eleven_v4`, varsayılan ayarlar.
  - Metinde duygu etiketleri kullanılır: [excited], [curious], [warmly].
  - Vurgulanacak kelimeler BÜYÜK harfle, duraklamalar "…" ile yazılır.
  - İlk cümle merak uyandıran bir sorudur.
  - Rakamlar **yazıyla** yazılır (kelime eşlemesi kaymasın).
  - Her paragraf motordaki bir bölüme karşılık gelir: `intro, p0r, p0s0…, outro`.
- **KREDİ KURALI (çok önemli):**
  - Ses **üretmeden önce** kullanıcıya kaç kredi tutacağını söyle (`estimate_only`) ve **onay al**.
  - **Tek üretim** yap (`generations_count: 1`). 2 seçenek, kredinin iki katıdır.
  - Seslendirmeyi kullanıcı onay vermeden **asla** yapma.
  - Yazıya dökme (kelime zamanları için `eleven_scribe_v1`) ücretsizdir.
- **İşleme:** Ses ham kalır; yalnızca 60 Hz altı kesilir. Son karışım **-14 LUFS**. Ek gürültü yok, **fon müziği yok**.
- **Efekt sesleri** (`tyt/sesler/`, `ses_konu.py`):
  - `kalem.wav`: kalemle yazma (-40 dB) ve düz çizgi (-42 dB).
  - `gecis.wav`: sayfa geçişi.
  - `tik.wav`: "Takip Et" kartı çıkınca ve tıklanınca.
  - ✓ işaretinde küçük bir tık sesi. Fosforun sesi yok.

## 5. Üretim sırası (kullanıcı kuralı)

1. **Önce fotoğraf** (kareler) gönderilir, onay alınır. Kullanıcı istemeden video çıkarılmaz.
2. Seslendirme metni yazılır.
3. Maliyet söylenir, onay alınır, **tek** ses üretilir.
4. Kelime zamanları alınır (yazıya dökme), video çıkarılır, ses ile görüntünün eşleşmesi kontrol edilir.
5. **Instagram kapağı:** Videodaki kapak, "Takip Et" kartı olmadan (`kapak_<konu>.png`).

## 6. Dosyalar ve komutlar (`tyt/video/`)

| Dosya | Görevi |
|---|---|
| `konu.html` | Sayfa (`?k=<içerik>&s=<sync>`) |
| `konu_motor.js` | Motor (TYT kopyası: `meta.ust1/ust2`, `p.soru`, `meta.hookBaslik`) |
| `konu_yardim.js` | Çizim yardımcıları: `H` (kalem notu), `PL` (kalemle çizgi), `CK` (✓), `SCENE`, `ARR`, `EM` |
| `isi_sicaklik.js` | Örnek içerik: `meta`, sayfalar `P` (`html`, `steps`, `late`), giriş `hook`, `KS`/`TERMO`/`PETEK` yardımcıları |
| `tahmini_sure.js` | Ses yokken tahmini bölüm süreleri (~5 dk) |
| `sync_isi.js/.json` | Gerçek ses zamanları (`senk.py` üretir) |
| `ses_konu.py` | Efekt sesleri + seslendirme karışımı |
| `rec.js` | Kareleri video olarak kaydeder |
| `seslendirme/senk.py` | Metin paragraflarını kelime zamanlarına eşler |
| `seslendirme/isi_metin.txt` | Örnek seslendirme metni |
| `logo_taslak.png` | Logo |

Bir videonun üretimi:

```bash
cd tyt/video
# 1) Fotoğraf: belirli anlar (sn)
PAGE="$PWD/konu.html?k=<konu>&s=tahmini_sure" node rec.js 30 kare "5,8,20,40"
# 2) Ses → kelime zamanları → bölüm eşlemesi
ffmpeg -i ses.mp3 -ac 1 -ar 44100 ses_<konu>.wav
python3 -I seslendirme/senk.py seslendirme/<konu>_metin.txt words.json <ids> sync_<konu> ses_<konu>.wav
# 3) Olaylar + video + ses
node -e "…EVENTS'i ev.json olarak kaydet…"   # bkz. README/oturum geçmişi
PAGE="$PWD/konu.html?k=<konu>&s=sync_<konu>" node rec.js 30 sessiz.mp4
python3 -I ses_konu.py ev.json mix.wav ses_<konu>.wav sync_<konu>.json
ffmpeg -i sessiz.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart <konu>.mp4
```
