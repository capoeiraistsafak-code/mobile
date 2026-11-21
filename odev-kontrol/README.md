# Ödev Kontrol Programı

Öğrenciler test kitabının üstünde soruları çözer, cevabı şıkkı daire içine alarak işaretler ve sayfanın fotoğrafını öğretmene gönderir (ör. WhatsApp ile). Öğretmen fotoğrafları programa yükler. Program şunları yapar:

- Basılı yazıyı ve öğrencinin el yazısını birbirinden ayırır.
- Her soruda işaretlenen şıkkı bulur ve cevap anahtarıyla karşılaştırır.
- Soru alanına işlem ya da not yazılıp yazılmadığına bakar.
- Hangi öğrencinin ödevi yaptığını, yapmadığını, eksik ya da boş sayfa gönderdiğini gösterir.
- Eksik kazanımları kodlarıyla birlikte çıkarır.

**Her şey bu bilgisayarda, internetsiz çalışır.** Fotoğraflar hiçbir yere gönderilmez; ücretli yapay zekâ servisi kullanılmaz. Bir sayfa 1-2 saniyede okunur.

## Açmak

- **Windows:** `Ödev Kontrol.lnk` kısayoluna çift tıklayın.
- **Ya da:** `odev-kontrol/index.html` dosyasına çift tıklayın. Chrome veya Edge önerilir.

Kurulum ve internet gerekmez; kütüphaneler `vendor/` klasöründe durur. Sağ üstte **● Hazır** yazınca program kullanılabilir.

Veriler o bilgisayardaki tarayıcının içinde saklanır. **Ayarlar** sekmesinden düzenli yedek alın.

## Örnek verilerle dene 🎈

Ana Sayfa'daki **✨ Örnek verilerle dene** düğmesi programı tanımak için hazır bir deneme yükler:

- 8-A sınıfı (5 öğrenci)
- 5 Teknoloji ve Tasarım kazanımı
- "Fikrî Haklar – Test 1" ödevi: boş sayfa, cevap anahtarı ve kazanım kodları
- 4 öğrencinin ödev fotoğrafı

Fotoğraflar programın kendi okuma motoruyla, sizin fotoğraflarınız gibi okunur; yaklaşık 15 saniye sürer. Sonra Ödev Kontrol ekranı açılır. Beklenen sonuçlar:

- Ali: 8/8
- Buse: 5 doğru, 3 yanlış
- Can: 4 doğru, 4 boş (2'si işlemsiz)
- Deniz: boş sayfa
- Ece: yapmadı

**Örnekler ayrı durur:**

- "(örnek)" diye işaretlenir.
- Kendi Excel'inizi yükleyince örnekler silinmez ve sizin kayıtlarınızla karışmaz; aynı sınıf adı ya da aynı kazanım kodu olsa bile.
- **Örnekleri kaldır** yalnızca örnekleri siler.

## 🧠 Yapay Zekâ (kendini eğiten el yazısı okuyucu)

Program bu bilgisayarda, internetsiz çalışan üç küçük sinir ağı (TensorFlow.js) kullanır:

- **İşaret ağı:** Şıklardaki daire, tik, çarpı, altını çizme ve doldurma işaretlerini tanır. Eşik kuralıyla birlikte çalışır: ikisi aynı okursa sonuç kesin sayılır, farklı okursa soru "öğretmen baksın" olur.
- **Rakam ağı:** "Cevabı yazınız" sorularında öğrencinin elle yazdığı sayıları okur. MNIST ile eğitildi; MNIST, Google/Keras'ın yayımladığı 70.000 gerçek el yazısı rakamdan oluşan veri seti.
- **Harf ağı:** Türkçe harfleri okur (ç, ğ, ı, i, ö, ş, ü dahil). Kelime cevaplarında yazılan kelimenin doğru cevaba benzerliğine bakılır: %80 ve üstü doğru, %50–80 "öğretmen baksın", altı yanlış. Harflerin çoğu okunamadıysa "yanlış" yerine "öğretmen baksın" der.

**Yazılı cevap sorusu nasıl eklenir:** Anahtar ekranında **✍️ Yazılı cevap alanı çiz** düğmesine basın. Resimde cevabın yazılacağı yeri fareyle çerçeveye alın, sonra doğru cevabı (sayı ya da kelime) yazın.

**Kendini eğitme:**

1. Sonuç ekranında program yanlış okuduysa öğrencinin aslında işaretlediğini ya da yazdığını düzeltin.
2. Her düzeltme bir eğitim örneği olur. Ağ ve kural çok emin olduğu okumalardan kendi kendine de örnek çıkarır.
3. Yeterli düzeltme birikince (varsayılan 10) ağ kendiliğinden eğitilir. **Yapay Zekâ** sekmesindeki **Şimdi eğit** düğmesiyle siz de başlatabilirsiniz.
4. Yeni eğitim, ayrılan sınama örneklerinde eskisinden kötü sonuç verirse kabul edilmez.

**Yedek:** Yapay Zekâ sekmesindeki **Eğitimi dışa aktar** düğmesi, ağların öğrendiklerini ve bütün eğitim örneklerini tek dosyaya kaydeder. **Eğitimi içe aktar** ile geri yüklenir. Ayarlar'daki genel yedek de yapay zekâyı içerir.

Ayrıntılar ve başlangıç ölçümleri: `YapayZeka/BENI_OKU.txt`

Deneme dosyaları:

- `Test_Fotograflari/Yazili_Cevapli/`: sayı cevapları
- `Test_Fotograflari/Kelime_Cevapli/`: Türkçe kelime cevapları

Her birinin içinde `OKU_BENI.txt` var.

## Kullanım sırası

1. **Öğrencileri yükle** (Ana Sayfa 1. adım ya da Öğrenciler sekmesi): Öğrenci listesinin Excel'ini seçin. Sütunlar kendiliğinden tanınır; K12 listeleri de olur.
   - Sınıf bilgisi şu sırayla aranır: önce sınıf/şube sütunu, sonra başlığın üstündeki yazı (ör. "8. Sınıf / A Şubesi"), sonra dosya adı (`8-A.xlsx`). Hiçbiri yoksa program sorar.
   - Sistemde olmayan sınıf kendiliğinden oluşturulur.
   - Sonuç yeşil ✓ ya da kırmızı ✕ kartla gösterilir.
2. **Kazanımları yükle** (2. adım ya da Kazanımlar sekmesi): K12'den aldığınız kazanım listesini seçin. Gerekli sütunlar: Kazanım Kodu, Ders, Sınıf, Ünite, Konu, Kazanım.
3. **Ödev ver** (Ödevler sekmesi):
   1. Sınıfı, dersi, ödevin adını ve son günü yazın.
   2. **Boş sayfa ekle** ile öğrencilerin çözeceği sayfanın **boş** (işaretsiz) hâlinin fotoğrafını ekleyin. Program soruları ve A-B-C-D şıklarını kendisi bulur. Aynı sayfa daha önce eklendiyse anahtarıyla birlikte yeniden kullanılır.
   3. **Anahtar ve kazanımları gir** ekranında şunları girin:
      - **Hızlı anahtar:** `1B 2C 3A…` ya da sırayla `BCA…`
      - **Toplu kazanım:** Her satıra bir aralık yazın (ör. `1-4 TT.8.A.2`). Kazanım kodu, yüklenen listeden seçilebilir.
4. **Fotoğrafları kontrol et** (Ödev Kontrol sekmesi):
   1. Öğrencilerden gelen fotoğrafları sürükleyin ya da **Fotoğrafları seç** / **Klasörden yükle** ile ekleyin.
   2. Her fotoğrafın öğrencisini seçin. Dosya ya da klasör adında öğrencinin numarası veya adı geçiyorsa (`101.jpg`, `ali-kaya.jpg`, `Odev/Ali Kaya/1.jpg`) öğrenci kendiliğinden seçilir. Tablodaki **📎 Yükle** düğmesiyle bir öğrencinin fotoğraflarını doğrudan da ekleyebilirsiniz.
   3. **Kontrol et**'e basın. **Kim yaptı?** tablosu güncellenir.
   4. 📄 simgesine basınca sayfanın sonucu açılır:
      - Öğrencinin el yazısı mavi gösterilir.
      - Doğru işaret yeşil, yanlış işaret kırmızı kutuyla, doğru şık kesikli çizgiyle gösterilir.
      - Program yanlış okuduysa sonucu elle değiştirebilirsiniz.
5. **Öğrenci Analizi:** Öğrencinin ödevleri, doğru/yanlış/boş sayıları ve eksik kazanımları. Yazdırılabilir.
6. **Sınıf Analizi:** Öğrenci × ödev tablosu ve sınıfın kazanımları (her kazanımda eksik olan öğrenciler). **Excel'e aktar** ile üç sayfalık bir Excel dosyası iner.

## Nasıl karar veriyor

| Durum | Sonuç |
|---|---|
| İşaretlenen şık anahtarla aynı | **Doğru**. Soru alanında yazı yoksa ayrıca **işlemsiz doğru** sayılır; tahmin ya da kopya olabilir. |
| İşaretlenen şık farklı | **Yanlış** |
| İşaret de yazı da yok | **Boş** |
| Yazı var ama işaret yok, ya da iki şık işaretli | **Öğretmen baksın** |
| Sayfada hiç el yazısı yok | Ödev **boş sayfa** sayılır |
| Aynı fotoğraf iki öğrenciye yüklendi | **Kopya foto** uyarısı çıkar |

**Anahtar girilmediyse:** En az 3 öğrencinin %60'ı aynı şıkkı seçtiyse o şık geçici anahtar olur. Bu durum ekranda "(ç)" ile gösterilir.

**Eksik kazanım:** Bir kazanımda başarı %60'ın altındaysa ve o kazanımdan en az 2 soru çözülmüşse kazanım "eksik" sayılır.

Bu değerler Ayarlar'dan değiştirilebilir.

## Klasörler

| Klasör | İçinde |
|---|---|
| `Ogretici/` | Sadece öğrenme amaçlı örnek dosyalar ve `BENI_OKU.txt`. İçinde Teknoloji ve Tasarım 8. sınıf örnekleri var: öğrenci listesi, kazanım listesi, boş test sayfası (yazdırılabilir ve fotoğraflı) ve 4 örnek öğrenci fotoğrafı. Beklenen sonuçlar `BENI_OKU.txt` dosyasında yazılı. |
| `Test_Fotograflari/` | Programı denemek için 4 öğrenci fotoğrafı ve `OKU_BENI.txt`. Fotoğraflar farklı durumları gösterir: tik ile işaretleme, eğik ve karanlık çekim, iki şık işaretleme, hiç işlem yazmadan işaretleme. Dosya adında numara ve ad olduğu için öğrenci kendiliğinden seçilir. |
| `Ogrenci/` | **Kendi** öğrenci listeleriniz (ör. `8-A.xlsx`) |
| `Kazanim/` | **Kendi** kazanım listeleriniz (K12) |
| `Odev/` | Öğrencilerden gelen fotoğraflar; her ödev için ayrı bir alt klasör açabilirsiniz |
| `vendor/` | Kütüphaneler. Bu klasörü silmeyin. |

## Tek dosyalık sürüm

`python3 build.py` komutu, her şeyin içinde olduğu tek bir `OdevKontrol.html` dosyası üretir (yaklaşık 21 MB). Bu dosya tek başına taşınabilir ve internetsiz çalışır.

## Bilinen sınırlar

- **Şıklar "A)", "A.", "(A)" biçiminde basılmış olmalı.** Optik formdaki gibi daire içinde harf olan şıklar şu an tanınmaz. Bir soru bulunamazsa anahtar ekranında "X. soru bulunamadı" uyarısı çıkar; sayfayı daha düz ve net çekip yeniden ekleyin.
- **Çözüm adımları okunmaz.** Şıklı sorularda işaretlenen şık, yazılı cevap sorularında sayı ya da tek kelimelik cevap değerlendirilir. Uzun cümleler ve paragraflar okunmaz.
- **İşaretler şıkkın harfinin üstüne ya da çevresine yapılmalı.** Daire içine almak ve tik atmak çalışır. Karalayıp silmek "iki şık işaretli" görünebilir; bu sorular öğretmene bırakılır.
- **Okuma eşikleri yapay test sayfalarıyla ayarlandı.** Bu sayfalarda 16/16 soru bulundu ve 128/128 şık doğru okundu. Gerçek kitap sayfaları ve gerçek el yazısıyla henüz ölçülmedi.
- **Örnek kazanım kodları uydurmadır.** Resmî liste için K12'den aldığınız dosyayı kullanın.
