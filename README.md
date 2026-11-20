# Ödev Kontrol

Öğrenciler ödev sayfalarının fotoğrafını telefonla çeker. Yapay zekâ (Claude) şu adımları yapar:

1. **Basılı soruyu ve öğrencinin el yazısını ayırır.** Yayınevi, sayfa ve soru numarasını da okur.
2. **Cevap anahtarını bulur ya da üretir.** Aynı soru daha önce başka bir öğrenciden geldiyse hazır anahtarı kullanır. Gelmediyse soruyu çözer; adımları, konuyu ve MEB kazanımını kaydeder.
3. **Öğrencinin çözümünü anahtarla karşılaştırır.** Son cevaba ve çözüm yoluna ayrı ayrı bakar.
4. **Eksik kazanımları çıkarır.** Öğretmen, öğrenci ve veli raporlarında gösterir.
5. **Ödevin yapılıp yapılmadığını gösterir.** Öğretmen hangi öğrencinin ödevi yaptığını, yapmadığını, geç teslim ettiğini ya da boş sayfa gönderdiğini görür.

Program telefonda tarayıcıdan açılan bir web uygulamasıdır. "Ana ekrana ekle" ile uygulama gibi kullanılır; Android ve iPhone'da çalışır.

## Kurulum

Node.js 22.13 veya üstü gerekir.

```bash
npm install
```

```bash
cp .env.example .env
```

`.env` dosyasına Claude API anahtarını yazın. Anahtar https://console.anthropic.com adresinden alınır.

```bash
npm start
```

Tarayıcıda http://localhost:3000 adresini açın.

API anahtarı yoksa program **deneme modunda** açılır. Bu modda yapay zekâ yerine örnek sorular ve cevaplar kullanılır; arayüzü ücretsiz deneyebilirsiniz.

## Kullanım

1. **Öğretmen** hesap açar, sınıf ekler ve öğrenci adlarını alt alta yapıştırır.
2. Program her öğrenciye ve her veliye ayrı **6 haneli giriş kodu** üretir. Öğretmen kodları yazdırıp dağıtır.
3. Öğretmen **ödev verir** (başlık, ders, son gün).
4. **Öğrenci** koduyla girer, ödevi seçer ve sayfanın fotoğrafını çeker. Sonuç 30-60 saniyede gelir.
5. **Öğretmen** şunları görür:
   - Ödevi kim yaptı, kim yapmadı
   - Sınıfın eksik kazanımları
   - Kontrol bekleyen cevap anahtarları
6. **Veli** koduyla girip çocuğunun raporunu görür.

## Puanlama kuralı

Tek bir benzerlik yüzdesi yerine iki ayrı ölçüm kullanılır:

| Durum | Karar |
|---|---|
| Son cevap doğru ve çözüm yolu %70 veya üstü | **Doğru** |
| Son cevap doğru ama çözüm yolu %70'in altında | **Kısmen doğru** (çözüm yazılmamış ya da eksik) |
| Son cevap yanlış ama çözüm yolu %70 veya üstü | **Kısmen doğru** (işlem hatası) |
| Son cevap yanlış ve çözüm yolu %40-70 arası | **Kısmen doğru** |
| Son cevap yanlış ve çözüm yolu %40'ın altında | **Yanlış** |
| Test sorusu | Yalnız işaretlenen şıka bakılır |
| El yazısı okuma güveni %60'ın altında | **Öğretmen bakacak** |

**Çözüm yolu puanı** şöyle hesaplanır: anahtardaki her adım için doğru yapılan adım 1 puan, hatalı yapılan adım 0,25 puan alır. Öğrenci farklı ama geçerli bir yol izlediyse o yol ayrıca puanlanır.

**Eksik kazanım:** Bir kazanımda en az 2 soru çözülmüş ve başarı %60'ın altındaysa o kazanım "eksik" sayılır. Kısmen doğru cevap yarım puan sayılır.

Bütün eşikler `server/grading.js` dosyasının başındaki `THRESHOLDS` bölümündedir. Gerçek ödevlerle denedikten sonra buradan ayarlanabilir.

## Cevap anahtarlarının güvenilirliği

Yapay zekânın hazırladığı her anahtar önce **"doğrulanmadı"** olarak kaydedilir. Bir anahtarın durumu şöyle değişir:

- **Doğrulandı:** 3 öğrencinin son cevabı anahtarla aynı çıkarsa ya da öğretmen onaylarsa.
- **Şüpheli:** 3 veya daha fazla öğrenci aynı farklı cevabı verirse ya da yapay zekâ çözümüne az güvenirse. Bu anahtarlar öğretmenin listesinde en üstte çıkar.
- **Öğretmen düzeltirse** o soruyu çözen bütün öğrenciler otomatik olarak yeniden puanlanır.
- **Öğretmen her kararı elle değiştirebilir.**

## Kopya kontrolü

- Aynı fotoğraf iki ayrı öğrenci hesabından yüklenirse işaretlenir.
- Öğrenci yazısı olmayan boş sayfa "Boş sayfa" olarak görünür.

## Maliyet

Her fotoğraf için Claude'a birkaç çağrı yapılır:

- 1 okuma çağrısı
- Sayfadaki her soru için 1 karşılaştırma çağrısı
- Soru havuzda yoksa 1 çözme çağrısı

Aynı yayının sorusu bir kez çözüldükten sonra diğer öğrenciler için tekrar çözülmez; bu yüzden sınıf büyüdükçe soru başına maliyet düşer. Bir öğrencinin günde yükleyebileceği fotoğraf sayısı `DAILY_UPLOAD_LIMIT` ile sınırlıdır (varsayılan 30). Fotoğraflar telefonda küçültülerek gönderilir.

## Yapı

```
server/
  index.js     Sunucu ve API (giriş, sınıflar, ödevler, yükleme, raporlar)
  pipeline.js  Fotoğrafın baştan sona işlenmesi
  ai.js        Claude çağrıları: okuma, çözme, karşılaştırma (+ deneme modu)
  grading.js   Puanlama eşikleri, soru eşleştirme, kazanım analizi
  db.js        SQLite veritabanı (data/odev.db)
public/        Telefon arayüzü (PWA)
```

Veriler `data/` klasöründe tutulur: veritabanı ve yüklenen fotoğraflar. Bu klasörü düzenli olarak yedekleyin.

## Bilinen sınırlar

- **Kazanım kodları** yapay zekânın bilgisinden gelir ve yanlış olabilir. Öğretmen anahtar ekranından düzeltebilir. İleride resmî MEB kazanım listesi programa yüklenebilir.
- **Şekilli ve grafikli sorular** okunur, ancak şekil metinle tarif edildiği için çözüm hatası riski daha yüksektir.
- **Açık uçlu sorular** (Türkçe, sosyal bilgiler) anlam karşılaştırmasıyla puanlanır. Bu puanlama matematiğe göre daha az kesindir; öğretmen kontrolü önerilir.
- **İnternette yayınlarken** https kullanın ve `.env` içinde `HTTPS=1` yapın. Öğrenci fotoğrafları kişisel veridir (KVKK).
