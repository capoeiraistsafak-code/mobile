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

- **Video süresi: EN FAZLA 2:59.** Hiçbir video 3:00 veya üstü olamaz (seslendirme eklendikten sonra da). Uzarsa sahneler kısaltılır ya da video bölümlere ayrılır; çıkarmadan önce süre kontrol edilir.
- 3D fizik videoları: TYT formatı (`ccr-794836ce-0eqad8` dalı, `tyt/FORMAT*.md`) — arka plan, logo, başlık, efekt sesleri aynen; soru çözümü yok; Tinkercad/SolidWorks tarzı 3D animasyon (Three.js), gerçekçi değil.
