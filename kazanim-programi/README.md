# Kazanım Takip Programı

Öğrenci bazlı kazanım takibi: sınavda çözülemeyen sorulardan öğrencinin eksik kazanımlarını bulur, isterseniz bu kazanımlara göre ödev / çalışma planı hazırlar.

## Üzüm ile öğren 🐾

Ana Sayfa'daki **“Üzüm, bana bu programı kullanmayı öğretir misin?”** düğmesine (ya da üstteki kediye) bas. Üzüm ekranın solundan koşarak gelir, gösterdiği yeri kırmızı yumuşak köşeli kutuya alır, patisiyle işaret eder ve kafasının üstündeki düşünce bulutunda ne yapacağını anlatır. “Şuraya tıkla” adımlarında gerçekten tıklarsan kendiliğinden devam eder; *Geri*, *Devam* ve *Bitir* düğmeleri de var (Esc de kapatır).

## Üzüm'ün mini animasyonları

Ayarlar → **Üzüm'ün mini animasyonları**: açma/kapama düğmesi (varsayılan açık) ve yanında **Ne sıklıkla?** seçimi: her 1 / 5 / 15 / 30 dakikada ya da her 1 / 2 / 3 / 5 saatte bir (varsayılan 5 dakika). Animasyonlar rastgele gelir ama aynı animasyon hiçbir zaman arka arkaya iki kez gelmez. Ana Sayfa'da kedinin altındaki **🧶 Üzüm'le oyna** düğmesi beklemeden hemen bir animasyon oynatır (animasyonlar kapalıyken de çalışır). Seçilen sıklıkta 10 animasyondan biri (ip yumağı, kelebek, fare, lazer, balık, kutu, cee, uyku, kalpler, üzüm salkımı) 3–6 saniye oynar; tıklamalara engel olmaz. Hepsi aynı yerden tek tek izlenebilir.

## Örnek veriler ayrı durur

“Örnek verilerle dene” ile gelen sınıf, öğrenci, kazanım ve sınavlar **(örnek)** olarak işaretlenir. Kendi Excel'ini yüklediğinde örnekler silinmez ve senin kayıtlarınla karışmaz (aynı numara ya da aynı sınıf adı olsa bile). “Örnekleri kaldır” yalnızca örnekleri siler.

## Tek tıkla Excel yükleme

Excel'i seçtiğinde program sütunları kendisi tanır ve hemen yükler, ayar penceresi açılmaz:

- ✅ **Yeşil kart:** “aktarıldı”, kaç kayıt eklendiği/güncellendiği, hangi sınıfa/derse gittiği ve oluşturulan yeni sınıf/dersler.
- ❌ **Kırmızı kart:** “aktarılamadı” ve nedeni (ör. “Sınıf bilgisi bulunamadı”). Kartta *Örnek Excel indir* ve, K12 dosyası gibi başlıkları farklı dosyalar için, *Sütunları elle eşleştir* seçenekleri vardır.

En kolay yol: **Örnek Excel**'i indir, örnek satırları silip kendi bilgilerini yaz, sonra yükle. Okul/kurs bilgisi Excel'de yoksa, programdaki sınıfların çoğu hangisiyse o seçilir (hiç sınıf yoksa Okul).

## Açmak

`index.html` dosyasına çift tıklayın (Chrome veya Edge önerilir). Kurulum ve internet gerekmez; Excel okuma kütüphanesi `vendor/` klasöründe.
Veriler o bilgisayardaki tarayıcıda saklanır → **Yedek / Ayarlar** sekmesinden düzenli yedek alın.

## Klasörler

| Klasör | İçinde |
|---|---|
| `Ogretici/` | **Sadece öğrenme amaçlı** örnek Excel dosyaları ve `BENI_OKU.txt`. Kendi verini yükleyince bunlar silinmez, değişmez. |
| `Ogrenci/` | **Kendi** öğrenci listelerin (ör. `9-A.xlsx`). Alt klasör adı kurum türünü de belirtebilir: `Ogrenci/Kurs Lise/11-A.xlsx`. |
| `Kazanim/` | **Kendi** kazanım listelerin (K12'den aldıkların). |
| `Sinav/` | **Kendi** cevap anahtarı ve sonuç dosyaların. |

“Klasörden yükle” ile program klasörünü seçersen `Ogretici` klasöründeki örnekler atlanır.

## Örnek (öğretici) Excel dosyaları

`Ogretici` klasöründeki `Ornek_…` dosyaları ve programdaki **Örnek Excel indir** düğmeleri (Panel'de hepsi bir arada; ayrıca her sekmede ilgili olan) programın doğrudan okuyabildiği hazır şablonlardır. Her dosyanın üstünde Türkçe “nasıl doldurulur” açıklaması vardır; örnek satırları silip kendi bilgilerinizi aynı sütunlara yazmanız yeterli.

| Dosya | İçinde | Nereden aktarılır |
|---|---|---|
| `Ogretici/Ornek_Ogrenci_Listesi_9-A.xlsx` | 9-A sınıfı, 3 öğrenci (Öğrenci No, Adı, Soyadı, Sınıf/Şube, Kurum) | Sınıflar ve Öğrenciler |
| `Ogretici/Ornek_Kazanim_Listesi_9.xlsx` | 9. sınıf Türkçe ve Matematik (Kazanım Kodu, Ders, Sınıf, Ünite, Konu, Kazanım) | Kazanımlar |
| `Ogretici/Ornek_Cevap_Anahtari.xlsx` | 6 soru (Soru No, Ders, Konu, Kazanım Kodu, Cevap) | Sınavlar → sınav seçin |
| `Ogretici/Ornek_Sinav_Sonuclari.xlsx` | 3 öğrencinin işaretlediği şıklar (Öğrenci No, Ad Soyad, 1…6) | Sonuç Girişi |

Dört dosya birbirine uyumludur: bu sırayla aktarırsanız 9-A sınıfı, kazanımlar, 6 soruluk bir sınav ve sonuçları hazır olur, analiz hemen görünür. Kazanım metinleri örnektir; resmî liste için K12'den aldığınız dosyayı kullanın.

## İçe aktarılan listeler: kalıcı kayıt, Güncelle ve Sil

Aktardığınız her Excel dosyası (ör. `11-A.xlsx`) sınıfıyla birlikte **İçe aktarılan listeler** bölümüne kaydedilir. Programı kapatıp açsanız da öğrenciler ve liste kaydı kalır.

- **Güncelle:** Excel'de değişiklik yaptıktan sonra basın. Aynı dosya yeniden okunur: yeni öğrenciler eklenir, değişen ad/sınıf bilgileri düzeltilir, dosyadan çıkan öğrenciler için “silinsin mi?” diye sorulur. Sütunların yeri değişse de başlık adından bulunur.
- **Tümünü güncelle:** kayıtlı bütün listeleri tek seferde günceller.
- **Sil:** listeyi ve ondan gelen öğrencileri (sonuçları ve planlarıyla) siler; ya da yalnızca liste kaydını unutup öğrencileri bırakır. Excel dosyanız bilgisayarınızda olduğu gibi kalır.
- **Dosya yolu:** Chrome ve Edge'de program dosyanın yerini hatırlar (*dosya yolu kayıtlı*); Güncelle'ye basınca dosya oradan okunur, ilk seferde tarayıcı okuma izni sorar. Diğer tarayıcılarda ve Claude'da yayınlanan sayfada Güncelle'ye basınca güncel dosyayı seçmeniz istenir.
- **Yeni sınıf / ders otomatik oluşur:** Excel'deki sınıf (ör. 9-B) sistemde yoksa içe aktarırken otomatik oluşturulur; elle sınıf eklemeniz gerekmez. İçe aktarma penceresinde her dosya için öğrencilerin gideceği sınıflar ve hangilerinin **yeni oluşturulacağı** gösterilir, işlem bitince oluşturulan sınıflar listelenir. Kazanımlarda da yeni dersler ve sınıf seviyeleri aynı şekilde oluşturulup gösterilir.
- Aynı dosyayı yeniden içe aktarmak da o listeyi günceller. Kazanım listeleri de aynı şekilde çalışır.
- Bir sınıfı ✎ → *Sınıfı sil* ile öğrencileriyle birlikte silebilirsiniz.

## Kurum türleri ve sınıflar

- Okul – Ortaokul (5–8), Okul – Lise (9–12)
- Kurs – Ortaokul (5–8), Kurs – Lise (9–12), Kurs – Mezun

Her sınıfa şube/grup adı verilebilir (ör. 10-A, 12 Sayısal-1). Sınıf bilgisi şu sırayla okunur: Excel'deki sınıf/şube sütunu → dosya adı (`11-A.xlsx`) → içe aktarma penceresinde seçtiğiniz değer.

## Kullanım sırası

1. **Sınıflar ve Öğrenciler** → *Ogrenci klasöründen içe aktar* → `Ogrenci` klasörünü seçin. Sütun eşleştirmesi otomatik yapılır, gerekirse düzeltin.
2. **Kazanımlar** → *Kazanim klasöründen içe aktar* → `Kazanim` klasörünü seçin.
3. **Sınavlar** → *Yeni sınav* → soruları ders bazında ekleyin (ör. `Türkçe 40`). Her soruya **konu** yazın (*Toplu konu ata*: `1-5 Paragraf`, `6-10 Sözcükte Anlam` …) ve isterseniz kazanım atayın; kazanım atanırsa konu kazanımdan gelir. Ya da cevap anahtarı Excel'ini aktarın (`Soru No | Ders | Konu | Kazanım Kodu | Cevap`).
4. **Sonuç Girişi** → sınav ve sınıf seçin; her öğrenci için *Yanlış sorular* ve *Boş sorular* kutularına numaraları yazın (ör. `3 7 12`, Enter ile sonraki kutuya geçer) ya da soru kutularına dokunun (D → Y → B). Ya da sonuç Excel'i aktarın: soru numaraları sütun başlığında, hücrelerde öğrencinin şıkkı veya D/Y/B.
5. **Öğrenci Analizi ve Ödev** → **Soru çözme önerisi**: öğrencinin hangi konudan kaç soru çözmesi gerektiği (en zayıf konu en üstte; Excel'e aktarılabilir, yazdırılabilir). **Konu analizi**: her konuda soru / doğru / yanlış / boş ve başarı yüzdesi; durum *Eksik* (%50 altı), *Geliştirilmeli* veya *İyi* (%80 ve üstü). Sınırlar ve önerilen soru sayıları “Yedek / Ayarlar”dan değiştirilebilir.
6. **Sınıf Konu Analizi** → bir sınavda sınıfın en zayıf konuları ve her konuda eksik kalan öğrenciler; Excel'e öğrenci × konu başarı tablosu olarak aktarılabilir.
7. **Kazanım ve ödev planı** (Öğrenci Analizi sekmesinde) → öğrencinin çözemediği sorulardan gelen kazanımlar ders ders listelenir (kaç yanlış/boş, hangi sorular). İstediğiniz kazanımları seçip **ödev / çalışma planı hazırla**: başlangıç tarihi, gün sayısı, kazanım başına soru sayısı, tekrar testi, Pazar tatili, son gün genel tekrar. Plan yazdırılabilir, Excel'e aktarılabilir, görevler tamamlandıkça işaretlenebilir.
