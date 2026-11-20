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


# ⚛️ FİZİK KURALLARINA BİREBİR UYUM (zorunlu)

Şu oturumlarda/çalışmalarda **kesinlikle** uygulanır: TYT soru video, konu video, popüler fizik videoları, sınav videosu, animasyon programı, soru çözüm oluşturucu 1-2, konu anlatımı fasikül, hap video, soru bankası, fizik oyunları. (Diğer oturumlarda gerekmez.)

1. Her animasyon, soru, çözüm, görsel ve ok fizik yasalarıyla **birebir** uyumlu olur. Her iş bitince ve her yeni soru/sahne eklenince şu kontrol yapılır:
   - **Kuvvet okları:** yön, uygulama noktası (cismin üzerinde) ve büyüklük oranı doğru. Ağırlık (mg) her zaman düşey aşağı.
   - **Tepki kuvveti (N):** yüzeye dik ve yüzeyden cisme doğrudur. mg'nin zıttı olmak zorunda DEĞİLDİR (ör. döngünün ya da kovanın tepesinde ray/kova tabanı cismin üstünde olduğu için N AŞAĞI, mg ile aynı yöndedir). N ile mg etki-tepki çifti değildir.
   - **Hız** teğet; **ivme** merkezcil (a_m) ve teğetsel (a_t) bileşen olarak ayrı gösterilir; hız büyüklüğü değişiyorsa yalnız merkezcil ok "a" diye etiketlenmez.
   - **Ok uzunlukları:** aynı tür nicelikler (kuvvet–kuvvet, ivme–ivme, hız–hız) gerçek oranla çizilir.
   - Enerji/momentum korunumu, birimler, sayısal sonuçlar, süreler ve ölçek birbiriyle tutarlıdır.
   - Fiziksel olarak imkânsız durum çizilmez (havada asılı cisim, kuvvetsiz yavaşlayan/duran cisim, tepede durmuş su dolu kova vb.). Anlatım için gerekiyorsa açıkça "görüntü donduruldu / yavaş çekim / fren" diye belirtilir.
2. Kullanıcı fiziksel olarak yanlış bir değişiklik isterse yapılmadan önce nedeni kibarca açıklanır ve doğru hali önerilir.
3. **Fizik oyunları:** Yeni soru gelince o sorunun görselleri öne çıkarılır (ilgili ok ve etiketler parlar, sorulan nicelik "x = ?" etiketiyle gösterilir, diğerleri sönükleşir).
4. **Fizik oyunları — Notlar:** Her soruya bir "Notlar" (neden böyle?) açıklaması yazılır ve ekranda küçük bir **Notlar** düğmesiyle açılır: o sorudaki kuvvetlerin (N, mg, F, sürtünme…), hız ve ivmenin yönleri ve NEDEN öyle oldukları, sık yapılan yanlışlar (ör. "N her zaman mg'nin tersi değildir") anlatılır; gerekirse gerçek oranlı küçük çizim eklenir.
5. **Fizik oyunları — Kaydırma:** Çözüm ve not kutuları taşarsa fare tekerleği, dokunma, kaydırma çubuğu ve ▲/▼ düğmeleriyle aşağı-yukarı kaydırılabilir olur.
6. **Soruda ipucu verilmez (bütün soru/oyun/videolarda):** Soru metni cevabı ele veren sıfat içermez ("yavaş/hızlı çevirirsek", "tamamen teğet olan…" gibi). Bunun yerine sayısal değer verilir ("tepeden v = 2 m/s ile geçerse"); "yavaş/hızlı" yorumu yalnızca çözümde/cevapta söylenir. Cevaptan önceki alt yazı ve düğme yazıları da ipucu vermez.
