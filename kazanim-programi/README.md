# Kazanım Takip Programı

Öğrenci bazlı kazanım takibi: sınavda çözülemeyen sorulardan öğrencinin eksik kazanımlarını bulur, isterseniz bu kazanımlara göre ödev / çalışma planı hazırlar.

## Açmak

`index.html` dosyasına çift tıklayın (Chrome veya Edge önerilir). Kurulum ve internet gerekmez; Excel okuma kütüphanesi `vendor/` klasöründe.
Veriler o bilgisayardaki tarayıcıda saklanır → **Yedek / Ayarlar** sekmesinden düzenli yedek alın.

## Klasörler

| Klasör | İçine ne konur |
|---|---|
| `Ogrenci/` | K12'den aldığınız öğrenci listeleri (Excel). Alt klasör adları kurum türünü belirler: `Ogrenci/Kurs Lise/11-A.xlsx`, `Ogrenci/Okul Ortaokul/8-B.xlsx`, `Ogrenci/Kurs Mezun/…` |
| `Kazanim/` | K12'den aldığınız kazanım listeleri (Excel). Bir dosyada birden çok ders/sınıf olabilir. |
| `Sinav/` | Sınavın cevap anahtarı + soru-kazanım eşleşmesi ve öğrenci sonuçları (Excel). |

`ORNEK_` ile başlayan dosyalar biçim örneğidir; kendi dosyalarınızı koyduktan sonra silebilirsiniz.

## İçe aktarılan listeler: kalıcı kayıt, Güncelle ve Sil

Aktardığınız her Excel dosyası (ör. `11-A.xlsx`) sınıfıyla birlikte **İçe aktarılan listeler** bölümüne kaydedilir. Programı kapatıp açsanız da öğrenciler ve liste kaydı kalır.

- **Güncelle:** Excel'de değişiklik yaptıktan sonra basın. Aynı dosya yeniden okunur: yeni öğrenciler eklenir, değişen ad/sınıf bilgileri düzeltilir, dosyadan çıkan öğrenciler için “silinsin mi?” diye sorulur. Sütunların yeri değişse de başlık adından bulunur.
- **Tümünü güncelle:** kayıtlı bütün listeleri tek seferde günceller.
- **Sil:** listeyi ve ondan gelen öğrencileri (sonuçları ve planlarıyla) siler; ya da yalnızca liste kaydını unutup öğrencileri bırakır. Excel dosyanız bilgisayarınızda olduğu gibi kalır.
- **Dosya yolu:** Chrome ve Edge'de program dosyanın yerini hatırlar (*dosya yolu kayıtlı*); Güncelle'ye basınca dosya oradan okunur, ilk seferde tarayıcı okuma izni sorar. Diğer tarayıcılarda ve Claude'da yayınlanan sayfada Güncelle'ye basınca güncel dosyayı seçmeniz istenir.
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
