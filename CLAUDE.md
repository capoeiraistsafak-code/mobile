# ⛔ ELEVENLABS KURALI (EN ÖNEMLİ KURAL — her şeyin önünde gelir)

Kullanıcının ElevenLabs kredisi sınırlıdır (aylık 30.000). Daha önce bir oturum izinsiz ~15.250 kredi harcadı. Bu yüzden:

1. Kullanıcı açıkça istemeden **hiçbir ElevenLabs aracı çağrılmaz**: ses, video, görsel, müzik, ses tasarımı, yazıya dökme, maliyet tahmini (`estimate_only`) dahil — HİÇBİRİ.
2. Kullanıcı isterse bile üretimden önce **İKİ AYRI ONAY** alınır:
   - **ONAY 1:** Ne üretileceği (metin/ses/model) ve tahmini kredi tutarı yazılır, "ONAY 1: Bu üretimi onaylıyor musunuz?" diye sorulur. Kullanıcının cevabı beklenir.
   - **ONAY 2:** Onay 1 gelince ayrı bir mesajla tekrar "ONAY 2: Emin misiniz? X kredi harcanacak." diye sorulur. Kullanıcının cevabı beklenir.
   - İki onay da açıkça "evet/onaylıyorum" ise **tek** üretim yapılır (`generations_count: 1`). Biri eksikse hiçbir şey yapılmaz.
3. Onay başka bir üretime taşınmaz: her yeni üretim için Onay 1 + Onay 2 baştan alınır.
4. Kullanıcı "video yap", "ses lazım" gibi genel bir şey söylerse bu ONAY DEĞİLDİR; önce ne istediği sorulur.
5. Seslendirme gerekirse önce kredisiz yol önerilir (kullanıcı kendi sesini mp3 olarak gönderir).
6. **SESLENDİRME HER ZAMAN EN SON yapılır** ve yalnızca kullanıcı "seslendirme yap" dediğinde başlar. Önce görüntü/animasyon/video seslendirmesiz bitirilir ve onaylanır; seslendirme metni bile kullanıcı istemeden yazılmaz ve önerilmez.

7. **Seslendirme akışı:** Önce seslendirme metni ElevenLabs formatında yazılır (ton etiketleri [curious] [warmly] [excited], BÜYÜK harf vurgu, "…" duraklama, sayılar yazıyla, her paragraf bir sahne) ve kullanıcıya verilir. Kullanıcı metni okur. Ses üretimine ancak kullanıcı isterse ve Onay 1 + Onay 2 verirse geçilir.

# Kurallar

- **Seslendirme metni lise öğretmeni anlatımıyla yazılır:** Sınıfa anlatır gibi ("Arkadaşlar", "dikkat edin", "bakın", "not edin"), sorular sorup cevaplayarak, adım adım; ton etiketleri öğretmen tonunda ([warmly] açıklama, [curious] soru, [firmly] önemli kural, [excited] sonuç). Ses üretilirse de aynı öğretmen tonunda olur.
- **"Sıradaki konu" yazılmaz ve söylenmez:** Videoların kapanışında ve seslendirme metninde sıradaki konuya hiç girilmez.
- **Ekrandaki terimler anlamlı ve okunaklı olur (bütün videolarda):** Emir kipi kısaltmalar yazılmaz ("Hızlı dön" değil "Hızlı dönerse"; "Yavaş dön" değil "Yavaş dönerse"). Sembol yalnız bırakılmaz, adıyla yazılır: "Hız (v) → her an TEĞET", "Kuvvet (F) ve ivme (a) → MERKEZE", "Açısal hız: ω = v/r", "İvme: a = v²/r", "Potansiyel enerji: Ep = m·g·h". Kesik ifadeler tam cümleye çevrilir ("r küçük, a BÜYÜK" değil "r küçülünce a BÜYÜR"; "Altta" değil "Döngünün dibinde"; "En az hız" değil "Tepede en küçük hız"). Notlar ekrana sığar, ✓/✗ yazının üstüne binmez.
- **Seslendirme metni ekrandaki terimlerle aynı olur:** Ekranda ne yazıyorsa metinde de aynı terim ve sırayla söylenir (ör. ekranda "Hızlı dönerse" → metinde "Kova hızlı dönerse").
- **Kapak yazısı "⏱ 3 DAKİKADA TYT/AYT"** olur ("5 DAKİKADA" değil), çünkü videolar en fazla 2:59.
- **Video süresi: EN FAZLA 2:59.** Hiçbir video 3:00 veya üstü olamaz (seslendirme eklendikten sonra da). Uzarsa sahneler kısaltılır ya da video bölümlere ayrılır; çıkarmadan önce süre kontrol edilir.
- 3D fizik videoları: TYT formatı (`ccr-794836ce-0eqad8` dalı, `tyt/FORMAT*.md`) — arka plan, logo, başlık, efekt sesleri aynen; soru çözümü yok; Tinkercad/SolidWorks tarzı 3D animasyon (Three.js), gerçekçi değil.
