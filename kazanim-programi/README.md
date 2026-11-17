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

## Kurum türleri ve sınıflar

- Okul – Ortaokul (5–8), Okul – Lise (9–12)
- Kurs – Ortaokul (5–8), Kurs – Lise (9–12), Kurs – Mezun

Her sınıfa şube/grup adı verilebilir (ör. 10-A, 12 Sayısal-1). Sınıf bilgisi şu sırayla okunur: Excel'deki sınıf/şube sütunu → dosya adı (`11-A.xlsx`) → içe aktarma penceresinde seçtiğiniz değer.

## Kullanım sırası

1. **Sınıflar ve Öğrenciler** → *Ogrenci klasöründen içe aktar* → `Ogrenci` klasörünü seçin. Sütun eşleştirmesi otomatik yapılır, gerekirse düzeltin.
2. **Kazanımlar** → *Kazanim klasöründen içe aktar* → `Kazanim` klasörünü seçin.
3. **Sınavlar** → *Yeni sınav* → soruları ders bazında ekleyin (ör. `Türkçe 40`), her soruya kazanım kodu yazın **veya** cevap anahtarı Excel'ini aktarın (`Soru No | Ders | Kazanım Kodu | Cevap`).
4. **Sonuç Girişi** → sınav ve sınıf seçin; yanlış/boş soruların kutusuna dokunun (D → Y → B). Ya da sonuç Excel'i aktarın: soru numaraları sütun başlığında, hücrelerde öğrencinin şıkkı veya D/Y/B.
5. **Öğrenci Analizi ve Ödev** → öğrencinin çözemediği sorulardan gelen kazanımlar ders ders listelenir (kaç yanlış/boş, hangi sorular). İstediğiniz kazanımları seçip **ödev / çalışma planı hazırla**: başlangıç tarihi, gün sayısı, kazanım başına soru sayısı, tekrar testi, Pazar tatili, son gün genel tekrar. Plan yazdırılabilir, Excel'e aktarılabilir, görevler tamamlandıkça işaretlenebilir.
