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
7. **Birden fazla çözüm yolu** olan sorularda çözüm "1. YOL", "2. YOL" başlıklarıyla ayrı ayrı yazılır (ör. a = v²/r ve a = ω²·r; T = 2πr/v ve T = 2π/ω).
8. **Fizik oyunları — Yıldız:** Her soru 1 yıldızdır (ilk denemede doğru cevap); menüde yıldızlar gösterilir ve onaylı "Yıldızları sıfırla" düğmesi bulunur.
9. **Yazım (bütün oyun/video/notlarda):** Kesirler bilgisayar dili gibi "1/2", "v²/r" diye yazılmaz; el yazısındaki gibi üstte pay, çizgi, altta payda (bölü çizgili) yazılır. Formüller köşeleri yuvarlatılmış **sarı çerçeve** içinde gösterilir. Notlarda her not birbirinden çizgiyle ayrılır.
10. **Taşma olmaz:** Alt yazı, üst bant, kart ve kutulardaki yazılar taşmaz; gerekirse yazı küçültülür, kısaltılır ya da kaydırma eklenir. Her değişiklikten sonra ekran görüntüsüyle kontrol edilir.
11. **Fizik oyunları tek programdır:** `oyunlar/fizik_oyunlari/index.html`. Ana menüde TYT ve AYT sekmeleri, konular ders sırasıyla yanları yuvarlak düğmeler; düğmenin sonunda hazırsa **yeşil**, değilse **kırmızı** daire. Yeni bir konunun oyunu ayrı program yapılmaz; bu programa eklenir (`KONULAR` listesi + `HAZIR` kaydı) ve düğmesi yeşile döner. Her güncellemeden sonra tablet için tek dosya sürümü (`oyunlar/fizik_oyunlari_tablet.html`, `oyunlar/araclar/tek_dosya.py` ile) ve ZIP de yenilenir.
