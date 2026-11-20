# Ödev Kontrol

Öğrenciler test kitabının üstünde soruları çözer, cevabı şıkkı daire içine alarak işaretler ve sayfanın fotoğrafını öğretmene gönderir (ör. WhatsApp ile). Öğretmen fotoğrafları bilgisayarındaki programa sürükleyip bırakır. Program şunları yapar:

- Basılı yazıyı ve öğrencinin el yazısını birbirinden ayırır.
- Hangi şıkkın işaretlendiğini bulur ve cevap anahtarıyla karşılaştırır.
- Sorunun altına işlem yazılıp yazılmadığına bakar.
- Hangi öğrencinin ödevi yaptığını, yapmadığını ya da boş sayfa gönderdiğini gösterir.
- Eksik kazanımları çıkarır.

**Program öğretmenin bilgisayarında çalışır.** Ücretli yapay zekâ servisi kullanmaz, internetsiz çalışır. Bir sayfa yaklaşık 1,5 saniyede kontrol edilir.

İsterseniz öğrenciler ve veliler kendi kodlarıyla girip fotoğrafı kendileri de yükleyebilir. Ancak bu isteğe bağlıdır; bunun için programın internete açık bir sunucuda çalışması gerekir.

## Nasıl çalışır

1. **Öğretmen** ödev verirken öğrencilerin çözeceği sayfanın **boş** hâlinin fotoğrafını bir kez çeker. Program basılı yazıyı okur (Tesseract OCR) ve her sorunun yerini ve A/B/C/D şıklarının kutularını bulur. Bu yaklaşık 4 saniye sürer.
2. **Öğretmen** cevap anahtarını girer: "1C 2A 3D…" ya da sırayla "CAD…". Girmezse **öğrenci çoğunluğu** geçici anahtar olur: en az 3 öğrencinin en az %60'ı aynı şıkkı seçtiyse. Konu ve kazanım da bu ekrandan girilir.
3. **Öğrencinin fotoğrafı** yüklenince program fotoğrafı **resim benzerliği** ile boş sayfaya oturtur (OpenCV, ORB özellik noktaları ve homografi). Fotoğraf eğik, gölgeli ya da uzaktan çekilmiş olsa da çalışır.
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

## Kurulum (bir kez)

1. https://nodejs.org adresinden **LTS** sürümünü indirip kurun.
2. Programı indirip bir klasöre çıkarın.
3. **Windows:** `baslat.bat` dosyasına çift tıklayın. **Mac:** `baslat.command` dosyasına sağ tıklayıp "Aç" deyin.

İlk açılışta gerekli parçalar internetten indirilir; bu birkaç dakika sürer. Sonra tarayıcıda program kendiliğinden açılır (http://localhost:3000). Siyah komut penceresi açık kaldığı sürece program çalışır. Sonraki açılışlarda yine aynı dosyaya çift tıklamanız yeterli.

Komut satırından da çalıştırabilirsiniz:

```bash
npm install
```

```bash
npm start
```

## Kullanım

1. **Öğretmen hesabı açın**, sınıf ekleyin ve öğrenci adlarını alt alta yapıştırın.
2. **Ödev verin.** Öğrencilerin çözeceği sayfaların **boş** hâlinin fotoğrafını ekleyin. Sonra "Anahtar ve konuları gir" ekranından anahtarı yazın ("1C 2A 3D…" ya da sırayla "CAD…"), isterseniz konu ve kazanım da ekleyin.
3. **Öğrencilerden gelen fotoğrafları yükleyin.** Ödev ekranındaki "Öğrenci fotoğraflarını yükle" alanına fotoğrafları sürükleyin ya da "Fotoğrafları seç" deyin.
   - Her fotoğrafın yanında öğrenciyi seçin.
   - Dosya adında öğrencinin adı geçiyorsa (ör. `ali-kaya-1.jpg`) öğrenci kendiliğinden seçilir.
   - Bir öğrencinin fotoğraflarını tablodaki **"📎 Yükle"** düğmesiyle de ekleyebilirsiniz; o zaman öğrenci zaten seçili gelir.
4. **"Kontrol et"e basın.** Sonuçlar birkaç saniyede gelir ve "Kim yaptı?" tablosu güncellenir. Bir öğrencinin adına tıklayarak sayfalarını ve eksik kazanımlarını görürsünüz.
5. Yanlış öğrenciye yüklenen bir fotoğrafı, sonuç sayfasının altındaki **"Bu fotoğrafı sil"** düğmesiyle silebilirsiniz.

Aynı fotoğraf iki ayrı öğrenciye yüklenirse tabloda **"Kopya foto"** uyarısı çıkar.

**Verileriniz** program klasöründeki `data` klasöründe durur (veritabanı ve fotoğraflar). Bu klasörü silmeyin, ara sıra yedekleyin.

## Test

```bash
npm test
```

Bu komut doğruluk testini çalıştırır; yaklaşık 40 saniye sürer.

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
