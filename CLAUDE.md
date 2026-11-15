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

