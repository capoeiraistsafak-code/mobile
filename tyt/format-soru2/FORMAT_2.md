# Soru Videosu 2. Format

Bu format sadece bu oturumda kullanılır. Örnek: `11Sinif_Atislar_Soru1_Instagram.mp4` (kaynak: `atis_el.py`).

## Görünüm
- Instagram Reels: 1080×1920, 30 fps, H.264 + sessiz AAC iz, sessiz video.
- Beyaz sayfa. Sol üstte "11. SINIF FİZİK" ve konu satırı, altında ince çizgi.
- Basılı soru metni siyah serif yazı. Çözüm mavi el yazısı (Caveat), sonuçlar kırmızı kutuda, en sonda kırmızı ✓.

## Akış
1. **Giriş:** Logo (`logo.png`, Şafak Hoca) sol üstte büyük açılır. Altında "11. SINIF FİZİK, 1. DÖNEM 1. SINAV için ÇALIŞMA SORULARI" ve konu satırı belirir. Logo küçülerek sağ üst köşeye geçer ve video boyunca orada kalır.
2. **Soru sayfası:** Soru metni ve şekil belirir.
3. **Olay animasyonu:** Sorudaki olay gerçekten canlandırılır. Örneğin top ateşlenir: geri tepme, alev, duman, gülle parabol çizip uçar, yere çarpınca toz kalkar.
4. **El çözer:** Sadece el ve kalem, kol yok. El dik durur ve dönmez (Twemoji ✍, ten rengine boyalı, `el.svg`). Kalem ucu yazının ilerleyen ucunu takip eder. El şekil üstünde de işaretleme yapar (örneğin menzil oku).
5. **Kapanış:** Olay yavaş çekimde tekrar oynar, fiziksel büyüklükler canlı gösterilir (örneğin vₓ sabit, v_y artıyor). Sonra kısa bir bekleme.

## Müfredat
- Türkiye Yüzyılı Maarif Modeli.
- Atışlar: FİZ.11.1.3, iki boyutta sabit ivmeli hareket. Hareket yatay ve düşey bileşenlere ayrılarak çözülür. g = 10 m/s², hava direnci önemsiz.

## Komutlar
```bash
./render.sh onizleme    # 540x960 hızlı önizleme
./render.sh instagram   # son video
```

## Not
El çizimi Twemoji (CC-BY 4.0). Gönderi açıklamasına "El çizimi: Twemoji (CC-BY 4.0)" yazılmalı.

## Çok sorulu seri (her sınıf 5 soru)
- Her soru tek sayfa. Sorular arasında sayfa çevirme efekti var: eski sayfa sol kenardan menteşe gibi dönerek kalkar, yenisi altından çıkar.
- Her sayfada sınıf, ünite ve konu satırı, "SORU n / 5" ve sağda öğrenme çıktısı kodu (FİZ.x.y.z; 12. sınıfta eski programın 12.1.x kodu).
- Sonda "5 SORU TAMAM!" kapanışı, logo ortada büyük.
- Dosyalar: `f2.py` (ortak altyapı), `fizik9.py`, `fizik10.py`, `fizik11.py`, `fizik12.py`.

## Seslendirme akışı
1. Metinler `metinler/ses_<sınıf>.txt` dosyalarında: 7 paragraf (giriş, 5 soru, kapanış), aralarında boş satır.
   Her paragraf "… soru." ile başlar, iki nokta üst üste yok, sayılar yazıyla, ünlem sadece giriş ve kapanışta.
2. ElevenLabs'te tek parça seslendirilir, `ses/ses_<sınıf>.mp3` olarak konur.
3. `./render2.sh <sınıf> sesli` komutu:
   - paragraf sınırlarını bulur (`sinirlar_<sınıf>.txt`; bu dosya varsa yeniden hesaplanmaz, elle düzeltilebilir),
   - animasyon sürelerini ölçer,
   - her soruyu kendi paragrafı başladığında açar ve çözümü anlatım süresine yayar,
   - 3 dakikayı aşarsa ses ve görüntüyü birlikte hızlandırır.
   Çıktı: `cikti/Fizik<sınıf>_Instagram.mp4`.

## Animasyonlar (her soruda otomatik, f2.py)
- Sayfa çevrilince logo nabız gibi atar; soru satırları sırayla kayarak gelir; şekil parçaları çizilerek belirir.
- Kırmızı sonuç kutusu çizilince cevap büyüyüp parlar; ✓ zıplayarak çıkar, altın parıltılar saçılır.
- Kapak yazısı: "animasyonlu çözüm".

## Yeni oturumda kurulum
```bash
./kurulum.sh                 # Manim, ffmpeg, Caveat fontu
./render2.sh 11 onizleme     # sessiz önizleme
./render2.sh 11 sesli        # ses/ses_11.mp3 gerekli
G=11 ~/manim-venv/bin/manim -s -r 1080,1920 kapak.py Kapak   # kapak
```
Notlar: Paralel render için her sınıfa ayrı `--media_dir` verin (render2.sh bunu yapar). LaTeX kurulu değil;
sayıları `DecimalNumber` yerine `self.timer(...)` ile gösterin. Yeni soru eklerken `page()` → şekil → `show_page()` →
olay animasyonu → `place_lines()` → `solve()` → `check()` sırasını izleyin.

## Müfredat uyumu
Kullanıcının ortak kaynağı "Fizik Kazanım ve Senaryo Rehberi" (https://claude.ai/artifact/ChXoHn8kTJKXfJAxN1QFnK):
her soru tek öğrenme çıktısına bağlanır, 1. yazılıya yalnızca tablonun 1. yazılı sütunundaki çıktılar girer, sorular açık uçlu olur.
Bu oturumdaki 9. sınıf videosunda vektör toplama soruları (dik/zıt kuvvetlerin bileşkesi, FİZ.9.2.4) 2. yazılı kapsamındadır.
