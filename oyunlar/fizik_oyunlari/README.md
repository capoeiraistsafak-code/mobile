# Fizik Oyunları · 3D Görev Programı

Akıllı tahtada oynatılmak için hazırlanmış, seslendirmesiz (alt yazılı) 3D fizik oyunları. **TYT ve AYT konularının hepsi tek programda.**

**Açmak için:** `index.html` dosyasına çift tıklayın (internet gerekmez; `three.min.js` ve `logo.png` aynı klasörde olmalı).

**Tablet için:** `oyunlar/fizik_oyunlari_tablet.html` her şeyi (3D kütüphane, logo, yazı tipleri) içinde taşıyan TEK dosyadır; tablete indirip açın, internet gerekmez. Oyun güncellenince bu dosya `python3 araclar/tek_dosya.py fizik_oyunlari <yazı-tipi.css> fizik_oyunlari_tablet.html` ile yeniden üretilir.

## Ana menü
- Üstte iki düzey: **🎒 Lise** ve **🎓 Üniversite**. Lise'nin altında **TYT / AYT**, Üniversite'nin altında **Temel dersler / Seçmeli dersler** sekmeleri.
- Her konu düğmesi üçe bölünür: sol yarı **Konu anlatımı**, ortada konu adı, sağ yarı **Soru çözümü**. Yeşil daire = hazır, kırmızı = yakında.
- **Konu anlatımı** akışı: Merak → Tahmin → Gözle (3D) → Kavram → Keşfet (sürgülerle dene) → Çözümlü örnek → Dikkat (sık yanlışlar) → Özet.
- **Soru çözümü**: her konuda 4 soru, notlar ve 1./2. YOL çözümler.

### Hazır konular
- **TYT (10/10):** Fizik Bilimine Giriş, Madde ve Özellikleri, Hareket ve Kuvvet, Enerji, Isı ve Sıcaklık, Elektrostatik, Elektrik ve Manyetizma, Basınç ve Kaldırma Kuvveti, Dalgalar, Optik.
- **AYT (23/23):** Vektörler'den Modern Fiziğin Uygulamaları'na bütün konular (Çembersel Hareket: 4 görev, 21 soru).
- **Üniversite · Temel (10/10):** Özel Görelilik, Termodinamik ve Entropi, Maxwell Denklemleri ve EM Dalgalar, Young Çift Yarık Deneyi, Dalga–Parçacık İkiliği, Belirsizlik İlkesi, Schrödinger Denklemi ve Kutudaki Parçacık, Kuantum Tünelleme, Hidrojen Atomu ve Spin, Katıhal Fiziği: Kristal ve Bant Yapısı.
- **Üniversite · Seçmeli (8/8):** Yarı İletkenler ve p-n Eklemi, Süperiletkenlik, Lazer Fiziği, Nükleer Fizik, Parçacık Fiziği ve Standart Model, Kuantum Hesaplama, Astrofizik ve Kozmoloji, Genel Görelilik ve Kara Delikler.

Konu dosyaları: `konular/tyt1-3.js`, `konular/ayt1-6.js`, `konular/uni1-5.js` (ortak araçlar `konular/kit.js`). Sorular özgündür; yayınevi sorularından kopya yoktur.

# AYT · Çembersel Hareket

## Görevler
1. 🚀 **Roketi hedefe gönder** – açısal hız, çizgisel hız, merkezcil ivme, ip kopunca teğet hareket (4 soru)
2. 🏎️ **Viraj yarışı** – aynı v ile üç yarıçap: ω = v/r, a = v²/r, periyot (4 soru)
3. 🪣 **Su dökülmesin!** – tepede kuvvetler, en küçük hız √(g·r), yavaş/hızlı dönüş (4 soru)
4. 🎢 **Treni istasyona ulaştır** – tren dipte, yan noktada ve tepede durur; hız, açısal hız, merkezcil ivme, açısal ivme, yay sabiti (9 soru)

## Nasıl oynanır
- Öğretmen **▶ Başlat / Treni sür** düğmesine basar, animasyon ilk durağa kadar gider ve soru sorar.
- **Doğru cevap:** kısa çözüm görünür, Devam ile animasyon sürer.
- **Yanlış cevap:** doğru çözüm adım adım yazılır, sonra devam edilir.
- Her soru 1 yıldız: ilk denemede doğru cevap yıldız kazandırır (üst bantta ★ sayacı). Menüdeki **☆ Yıldızları sıfırla** düğmesi bütün yıldızları siler.
- Birden fazla çözüm yolu olan sorularda çözüm **1. YOL / 2. YOL** diye ayrı yazılır.
- Üst banttaki **Notlar** düğmesi o sorudaki kuvvetlerin ve yönlerin NEDEN öyle olduğunu açıklar. Uzun çözüm ve notlar fare tekerleği, dokunma veya ▲/▼ ile kaydırılır.

Sol alttaki kontrol çubuğu: **⏸ Duraklat / ▶ Devam** ve hız düğmeleri **¼× · ½× · 1× · 2×** (yavaş çekimde ekranda "Yavaş çekim" yazar).

**Ekranı gezme:** sahneyi fareyle sürükleyerek döndürün, tekerlekle yakınlaştırın, sağ tık (ya da Shift) + sürükle ile kaydırın. Tablet/akıllı tahtada: 1 parmak döndürür, 2 parmak yakınlaştırır ve kaydırır. **⌖ Ortala** düğmesi (ya da `O`) görüntüyü ilk haline döndürür. Görev içindeyken üst banttaki **Tam ekran / Küçült** düğmesi (ya da `F`) ekranı büyütüp küçültür.

**Kalem / Lazer:** sol alttaki **✏ Çiz** (ya da `K`) çizim paletini açar ve animasyonu duraklatır. **Kalem** çizgisi kalır (5 renk), **Lazer** çizgisi 1–2 saniyede kaybolur (`L`). **Silgi** (`S`) iki modda çalışır: **Tüm çizgi** (varsayılan) değdiği çizginin tamamını siler, **Parça parça** yalnız değdiği kısmı siler. Renk çemberinden istenen renk seçilir. **Temizle** hepsini siler. Animasyon yeniden başlayınca (Devam / Treni sür / sonraki soru) çizimler kendiliğinden silinir. Fare ile de çizilir. **✋ Yalnız kalem** varsayılan olarak AÇIK: el/parmak dokunuşu çizmez, yalnız kalem (ve fare) çizer; kapatılabilir. Duraklatınca oyun sesleri (araç, roket, tren…) susar, düğme sesleri çalmaya devam eder.

Kısayollar: `1`–`4` şık seç · `Boşluk` devam · `P` duraklat/devam · `−`/`+` hız · `M` ses aç/kapa · `F` tam ekran.

Sesler (roket, motor, tren, su, yay, zil) tarayıcıda üretilir; insan sesi/seslendirme yoktur.
