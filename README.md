# Ödev Kontrol

Öğrenciler test kitabının üstünde soruları çözer, cevabı şıkkı daire içine alarak işaretler ve sayfanın fotoğrafını telefonla çeker. Program şunları yapar:

- Basılı yazıyı ve öğrencinin el yazısını birbirinden ayırır.
- Hangi şıkkın işaretlendiğini bulur ve cevap anahtarıyla karşılaştırır.
- Sorunun altına işlem yazılıp yazılmadığına bakar.
- Hangi öğrencinin ödevi yaptığını, yapmadığını ya da boş sayfa gönderdiğini gösterir.
- Eksik kazanımları çıkarır.

**Ücretli yapay zekâ servisi kullanmaz.** Bütün işlem sunucuda, internetsiz çalışır. Bir öğrenci sayfası yaklaşık 1,5 saniyede okunur.

## Nasıl çalışır

1. **Öğretmen** ödev verirken öğrencilerin çözeceği sayfanın **boş** hâlinin fotoğrafını bir kez çeker. Program basılı yazıyı okur (Tesseract OCR) ve her sorunun yerini ve A/B/C/D şıklarının kutularını bulur. Bu yaklaşık 4 saniye sürer.
2. **Öğretmen** cevap anahtarını girer: "1C 2A 3D…" ya da sırayla "CAD…". Girmezse **öğrenci çoğunluğu** geçici anahtar olur: en az 3 öğrencinin en az %60'ı aynı şıkkı seçtiyse. Konu ve kazanım da bu ekrandan girilir.
3. **Öğrenci** fotoğraf çeker. Program fotoğrafı **resim benzerliği** ile boş sayfaya oturtur (OpenCV, ORB özellik noktaları ve homografi). Fotoğraf eğik, gölgeli ya da uzaktan çekilmiş olsa da çalışır.
4. Oturtulmuş fotoğrafta **boş sayfada olmayan her iz el yazısıdır.** Böylece basılı yazı ile el yazısı ayrılır; sonuç ekranında el yazısı maviyle gösterilir.
5. Her soru için:
   - **İşaretlenen şık:** Şık kutularındaki el yazısı miktarına bakılır. En çok iz olan şık, eşiği geçiyor ve rakiplerinden belirgin biçimde fazlaysa işaretli sayılır.
   - **İşlem var mı:** Soru alanındaki el yazısı miktarına bakılır.
6. **Karar:**

| Durum | Sonuç |
|---|---|
| İşaretlenen şık anahtarla aynı | **Doğru** (işlem yoksa "işlemsiz doğru" diye ayrıca işaretlenir: tahmin ya da kopya olabilir) |
| İşaretlenen şık farklı | **Yanlış** |
| İşaret yok, işlem de yok | **Boş** |
| İşlem var ama işaret yok, ya da iki şık işaretli | **Öğretmen bakacak** |
| Sayfada hiç el yazısı yok | Ödev **boş sayfa** sayılır |

Öğretmen her kararı elle değiştirebilir. Anahtar değişince bütün öğrencilerin sonuçları kendiliğinden güncellenir, çünkü karar her seferinde güncel anahtara göre hesaplanır.

## Ortak sayfa havuzu

Boş sayfalar bütün öğretmenlerin ortak havuzundadır. Bir öğretmen daha önce eklenmiş bir sayfanın fotoğrafını çekerse program bunu resim benzerliğiyle tanır ve sayfayı yeniden okumaz; eski sayfayı anahtarı ve konularıyla birlikte kullanır.

## Doğruluk

`npm test` komutu bilgisayarda örnek test sayfaları üretir. Bu sayfaların üstüne öğrenci gibi işlem yazar ve şık daire içine alır. Sonra sayfaları "telefonla çekilmiş" gibi bozar: eğim, perspektif, gölge, bulanıklık, gürültü ve JPEG sıkıştırması ekler. Son ölçüm:

- **Soru bulma:** 16/16
- **Şık okuma:** 128/128
- **İşlem var/yok:** 128/128
- **Ayar için kullanılan ayrı set:** 240 cevaptan 238'i doğru

**Önemli:** Bu sonuçlar yapay sayfalarla alındı. Gerçek kitap sayfaları ve gerçek el yazısıyla ölçülmedi. İlk kullanımda öğretmenin sonuçlara göz atması ve sorunları bildirmesi gerekir.

## Eşikler

Bütün eşikler `server/grading.js` dosyasının başındaki `THRESHOLDS` bölümündedir:

| Eşik | Değer | Anlamı |
|---|---|---|
| `markMinRatio` | 0.01 | Şık kutusunun en az %1'i izse işaretli sayılır |
| `markMultiMin`, `markRivalRatio` | 0.045, 0.55 | İkinci şık da güçlüyse "iki şık işaretli" denir |
| `workMinRatio` | 0.004 | Soru alanının en az %0,4'ü el yazısıysa "işlem var" denir |
| `minPageMatch` | 40 | Öğrenci fotoğrafı ile boş sayfa arasında en az 40 ortak nokta olmalı |
| `crowdMinStudents`, `crowdMinShare` | 3, 0.6 | Öğrenci çoğunluğundan anahtar çıkarma koşulu |
| `weakOutcomeRate` | 0.6 | Bir kazanımda başarı %60'ın altındaysa "eksik" sayılır |

## Kurulum

Node.js 22.13 veya üstü gerekir.

```bash
npm install
```

```bash
npm start
```

Tarayıcıda http://localhost:3000 adresini açın. İsterseniz `.env.example` dosyasını `.env` adıyla kopyalayıp ayarları değiştirebilirsiniz.

```bash
npm test
```

Bu komut doğruluk testini çalıştırır; yaklaşık 40 saniye sürer.

## Kullanım

1. **Öğretmen** hesap açar, sınıf ekler ve öğrenci adlarını alt alta yapıştırır. Program her öğrenciye ve veliye 6 haneli giriş kodu üretir.
2. **Öğretmen** ödev verir ve öğrencilerin çözeceği sayfaların boş hâlinin fotoğrafını çeker. Sonra "Anahtar ve konuları gir" ekranından anahtarı, konuyu ve kazanımı girer.
3. **Öğrenci** koduyla girer, ödevi seçer ve her sayfanın fotoğrafını çeker. Sonuç birkaç saniyede gelir.
4. **Öğretmen** ödev ekranında kimin yaptığını ve kimin yapmadığını görür; sınıf ekranında eksik kazanımları görür.
5. **Veli** koduyla girer ve çocuğunun raporunu görür.

## Bilinen sınırlar

- **Şıklar "A)", "A.", "(A)" biçiminde yazılmış olmalı.** Daire içinde harf (optik form gibi) ya da harfsiz şıklar şu an bulunamaz. Bir soru bulunamazsa sayfa ekranında "X. soru bulunamadı" uyarısı çıkar. Bu durumda sayfa daha düz ve net çekilip yeniden eklenmelidir.
- **Bulunan sorular elle düzeltilemez.** Soru ya da şık kutusu yanlış bulunduysa tek çözüm sayfayı yeniden çekmektir.
- **Açık uçlu sorular puanlanmaz.** Sadece işaretlenen şık kontrol edilir; yazılan çözümün doğruluğu okunmaz. Çözüm için sadece "işlem yazılmış mı" bilgisi verilir.
- **İşaretler şıkkın etrafına yapılmalı.** Daire içine almak, tik ya da çarpı işareti çalışır. Şıkkı karalayıp silmek "iki şık işaretli" görünebilir; bu sorular öğretmene düşer.
- **Kazanım kodları** öğretmen tarafından girilir.
- **İnternette yayınlarken** https kullanın ve `.env` dosyasında `HTTPS=1` yapın. Öğrenci fotoğrafları kişisel veridir (KVKK).

## Yapı

```
server/
  index.js     Sunucu ve API (giriş, sınıflar, ödevler, sayfalar, yükleme, raporlar)
  pipeline.js  İş kuyruğu: boş sayfa işleme, öğrenci fotoğrafı işleme
  vision.js    Resim işleme: OCR, sayfa oturtma, el yazısı ayırma, şık okuma
  layout.js    OCR kelimelerinden soru ve şık yerlerini çıkarma
  grading.js   Eşikler, karar, öğrenci çoğunluğu anahtarı, kazanım raporu
  db.js        SQLite veritabanı (data/odev-kontrol.db)
public/        Telefon arayüzü (PWA)
test/          Yapay sayfa üretici ve doğruluk testi
```
