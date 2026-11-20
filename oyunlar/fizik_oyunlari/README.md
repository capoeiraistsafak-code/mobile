# Fizik Oyunları · 3D Görev Programı

Akıllı tahtada oynatılmak için hazırlanmış, seslendirmesiz (alt yazılı) 3D fizik oyunları. **TYT ve AYT konularının hepsi tek programda.**

**Açmak için:** `index.html` dosyasına çift tıklayın (internet gerekmez; `three.min.js` ve `logo.png` aynı klasörde olmalı).

**Tablet için:** `oyunlar/fizik_oyunlari_tablet.html` her şeyi (3D kütüphane, logo, yazı tipleri) içinde taşıyan TEK dosyadır; tablete indirip açın, internet gerekmez. Oyun güncellenince bu dosya `python3 araclar/tek_dosya.py fizik_oyunlari <yazı-tipi.css> fizik_oyunlari_tablet.html` ile yeniden üretilir.

## Ana menü
- Üstte **TYT / AYT** sekmeleri; altında o sınavın konuları ders kitabı sırasıyla, yanları yuvarlak düğmeler hâlinde.
- Düğmenin sonundaki **yeşil daire** = oyunu hazır, **kırmızı daire** = yakında. Hazır konularda kazanılan yıldızlar da yazar.
- Hazır olan konu: **AYT 16 · Çembersel Hareket** (4 görev, 21 soru). Diğer konular sırayla doldurulacak.

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

**Kalem / Lazer:** sol alttaki **✏ Çiz** (ya da `K`) çizim paletini açar ve animasyonu duraklatır. **Kalem** çizgisi kalır (5 renk), **Lazer** çizgisi 1–2 saniyede kaybolur (`L`). **Silgi** (`S`) iki modda çalışır: **Parça parça** yalnız değdiği kısmı siler, **Tüm çizgi** değdiği çizginin tamamını siler. **Temizle** hepsini siler. Animasyon yeniden başlayınca (Devam / Treni sür / sonraki soru) çizimler kendiliğinden silinir. Fare ile de çizilir. **✋ Yalnız kalem** açıkken tablette el/parmak dokunuşu çizmez, yalnız kalem (ve fare) çizer.

Kısayollar: `1`–`4` şık seç · `Boşluk` devam · `P` duraklat/devam · `−`/`+` hız · `M` ses aç/kapa · `F` tam ekran.

Sesler (roket, motor, tren, su, yay, zil) tarayıcıda üretilir; insan sesi/seslendirme yoktur.
