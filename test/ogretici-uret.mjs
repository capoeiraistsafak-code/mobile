// odev-kontrol/Ogretici klasöründeki örnek dosyaları üretir:
// örnek öğrenci ve kazanım Excel'leri, Teknoloji ve Tasarım boş test sayfası, örnek öğrenci fotoğrafları.
// Çalıştırma: node test/ogretici-uret.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { layoutPage, studentInk, renderPage, photograph } from "./synthetic.js";

const OUT = path.resolve("odev-kontrol/Ogretici");
fs.mkdirSync(path.join(OUT, "Ornek_Ogrenci_Fotograflari"), { recursive: true });

// --- Excel: programın içindeki örneklerle aynı (app.js'ten okunur) ---
const app = fs.readFileSync("odev-kontrol/app.js", "utf8");
const al = (ad) => vm.runInNewContext(app.slice(app.indexOf(`const ${ad} = `) + `const ${ad} = `.length, app.indexOf("];", app.indexOf(`const ${ad} = `)) + 1));
const XLSX = (() => {
  const ctx = { module: { exports: {} } };
  ctx.exports = ctx.module.exports;
  vm.runInNewContext(fs.readFileSync("odev-kontrol/vendor/xlsx.full.min.js", "utf8"), ctx);
  return ctx.module.exports.utils ? ctx.module.exports : ctx.XLSX;
})();
for (const [ad, veri, sayfa] of [
  ["Ornek_Ogrenci_Listesi_8-A.xlsx", al("ORNEK_OGRENCI"), "8-A"],
  ["Ornek_Kazanim_Listesi_TT8.xlsx", al("ORNEK_KAZANIM"), "Kazanımlar"],
]) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(veri), sayfa);
  fs.writeFileSync(path.join(OUT, ad), XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

// --- Teknoloji ve Tasarım test sayfası ---
// Anahtar: 1B 2C 3A 4D 5C 6A 7D 8B
export const SORULAR = [
  { lines: ["Ürünlerin insan vücuduna uygun", "tasarlanmasını inceleyen alan hangisidir?"], options: ["Ekoloji", "Ergonomi", "Estetik", "Ekonomi"], kod: "TT.8.A.1" },
  { lines: ["Yeni bir buluşun izinsiz üretilmesini", "önleyen fikrî hak hangisidir?"], options: ["Marka", "Telif", "Patent", "Logo"], kod: "TT.8.A.2" },
  { lines: ["Tasarım sürecinin ilk aşaması", "hangisidir?"], options: ["Problemi belirlemek", "Prototip yapmak", "Ürünü satmak", "Ürünü test etmek"], kod: "TT.8.B.1" },
  { lines: ["Öğelerin görsel ağırlığının eşit", "dağılmasına ne denir?"], options: ["Ritim", "Vurgu", "Zıtlık", "Denge"], kod: "TT.8.B.2" },
  { lines: ["Kullanılmış ürünün hammaddeye", "dönüştürülmesine ne denir?"], options: ["Tüketim", "Üretim", "Geri dönüşüm", "Dağıtım"], kod: "TT.8.C.1" },
  { lines: ["Bir firmanın ürünlerini diğerlerinden", "ayıran işaret hangisidir?"], options: ["Marka", "Patent", "Telif", "Taslak"], kod: "TT.8.A.2" },
  { lines: ["Tasarımın denenmek için yapılan", "ilk çalışan modeli hangisidir?"], options: ["Eskiz", "Afiş", "Rapor", "Prototip"], kod: "TT.8.B.1" },
  { lines: ["Kitap ve şarkı gibi eserlerin", "sahibini koruyan hak hangisidir?"], options: ["Patent", "Telif hakkı", "Marka", "Faydalı model"], kod: "TT.8.A.2" },
];
export const ANAHTAR = "BCADCADB";
const content = { header: "Teknoloji ve Tasarım – 8. Sınıf – Fikrî Haklar ve Tasarım – Test 1", questions: SORULAR };
const layout = layoutPage(21, content);
const bos = await renderPage(layout);
fs.writeFileSync(path.join(OUT, "Ornek_Bos_Sayfa_Yazdir.png"), bos);
fs.writeFileSync(path.join(OUT, "Ornek_Bos_Sayfa_Foto.jpg"), await photograph(bos, 61, 0.6));

const yanlis = (h) => "ABCD"[("ABCD".indexOf(h) + 1) % 4];
const OGRENCILER = [
  // dosya adı, açıklama, cevaplar
  ["101.jpg", "Ali Kaya (No 101): hepsi doğru, işlem/not var", (i, k) => ({ mark: k, work: true })],
  ["Buse Er.jpg", "Buse Er: 5 doğru, 3 yanlış", (i, k) => ({ mark: i < 5 ? k : yanlis(k), work: true })],
  ["IMG-20261120-WA0012.jpg", "Can Demir: 4 doğru (2'si işlemsiz), 4 boş", (i, k) => ({ mark: i % 2 ? k : null, work: i % 2 === 1 && i > 3 })],
  ["IMG-20261120-WA0013.jpg", "Deniz Ak: boş sayfa (ödev yapılmamış)", () => ({ mark: null, work: false })],
];
for (const [ad, , f] of OGRENCILER) {
  const answers = layout.questions.map((q, i) => ({ number: q.number, ...f(i, ANAHTAR[i]) }));
  const ink = studentInk(layout, answers, 300 + ad.length);
  fs.writeFileSync(path.join(OUT, "Ornek_Ogrenci_Fotograflari", ad), await photograph(await renderPage(layout, ink), 900 + ad.length, 1));
}

// --- odev-kontrol/Test_Fotograflari: farklı durumları deneyen 4 fotoğraf (aynı test sayfası) ---
const TEST = path.resolve("odev-kontrol/Test_Fotograflari");
fs.mkdirSync(TEST, { recursive: true });
export const TEST_FOTOLARI = [
  // dosya, açıklama, cevap üretici, fotoğraf zorluğu
  ["105 Ece Tan.jpg", "7 doğru, 1 yanlış (4. soru); bazı şıklar tik ile işaretli", (i, k) => ({ mark: i === 3 ? yanlis(k) : k, work: true, style: i % 3 === 0 ? "tick" : "circle" }), 1],
  ["101 Ali Kaya.jpg", "Daha eğik ve karanlık çekilmiş; 6 doğru, 2 boş (3. ve 7. soru)", (i, k) => (i === 2 || i === 6 ? { mark: null, work: false } : { mark: k, work: true }), 1.25],
  ["102 Buse Er.jpg", "6. soruda iki şık işaretli (öğretmen baksın); kalan 7 soru doğru", (i, k) => (i === 5 ? { mark: k, mark2: k === "A" ? "C" : "A", work: true } : { mark: k, work: true }), 1],
  ["103 Can Demir.jpg", "Hepsi doğru ama hiç işlem yok: 8 işlemsiz doğru (kopya şüphesi)", (i, k) => ({ mark: k, work: false }), 1],
];
for (const [ad, , f, zorluk] of TEST_FOTOLARI) {
  const answers = layout.questions.map((q, i) => ({ number: q.number, ...f(i, ANAHTAR[i]) }));
  const ink = studentInk(layout, answers, 700 + ad.length);
  fs.writeFileSync(path.join(TEST, ad), await photograph(await renderPage(layout, ink), 1300 + ad.length, zorluk));
}
fs.writeFileSync(
  path.join(TEST, "OKU_BENI.txt"),
  `TEST FOTOĞRAFLARI
=================

Bu 4 fotoğraf, programı denemek için hazırlanmış öğrenci ödev fotoğraflarıdır.
Hepsi aynı test sayfası: Ogretici/Ornek_Bos_Sayfa_Foto.jpg
(Teknoloji ve Tasarım 8. sınıf, Fikrî Haklar – Test 1, anahtar: ${ANAHTAR})

Nasıl denenir:
  1. Ana Sayfa > 1. adım: Ogretici/Ornek_Ogrenci_Listesi_8-A.xlsx dosyasını yükle.
  2. Ana Sayfa > 2. adım: Ogretici/Ornek_Kazanim_Listesi_TT8.xlsx dosyasını yükle.
  3. Ödevler: 8-A için yeni ödev oluştur, "Boş sayfa ekle" ile
     Ogretici/Ornek_Bos_Sayfa_Foto.jpg dosyasını seç.
     "Anahtar ve kazanımları gir": Hızlı anahtar = ${ANAHTAR}
     Toplu kazanım (her satır ayrı):
${SORULAR.map((q, i) => `       ${i + 1} ${q.kod}`).join("\n")}
  4. Ödev Kontrol: bu klasördeki 4 fotoğrafı sürükle (ya da "Klasörden yükle" ile
     bu klasörü seç). Dosya adında numara ve ad olduğu için öğrenciler kendiliğinden
     seçilir. "Kontrol et"e bas.

Beklenen sonuçlar:
${TEST_FOTOLARI.map(([ad, a]) => `  ${ad.padEnd(20)} ${a}`).join("\n")}
  Deniz Ak (104)       fotoğraf yok -> "Yapmadı"
`.replace(/\n/g, "\r\n")
);

// --- Programın "Örnek verilerle dene" düğmesi için gömülü örnekler (vendor/ornek-veri.js) ---
const sharp = (await import("sharp")).default;
const kucuk = async (buf) => (await sharp(buf).resize({ width: 1800, height: 1800, fit: "inside" }).jpeg({ quality: 82 }).toBuffer()).toString("base64");
const NO = { "101.jpg": "101", "Buse Er.jpg": "102", "IMG-20261120-WA0012.jpg": "103", "IMG-20261120-WA0013.jpg": "104" };
const veri = {
  bosSayfa: await kucuk(fs.readFileSync(path.join(OUT, "Ornek_Bos_Sayfa_Foto.jpg"))),
  anahtar: ANAHTAR,
  kodlar: SORULAR.map((q) => q.kod),
  fotolar: [],
};
for (const [ad] of OGRENCILER) veri.fotolar.push({ dosya: ad, no: NO[ad], b64: await kucuk(fs.readFileSync(path.join(OUT, "Ornek_Ogrenci_Fotograflari", ad))) });
fs.writeFileSync(
  "odev-kontrol/vendor/ornek-veri.js",
  "// Ana Sayfa'daki \"Örnek verilerle dene\" için gömülü örnekler (test/ogretici-uret.mjs üretir).\n" +
    "// Teknoloji ve Tasarım 8. sınıf: boş test sayfası, anahtar, kazanım kodları, 4 öğrenci fotoğrafı.\n" +
    "window.ORNEK_VERI = " + JSON.stringify(veri) + ";\n"
);

fs.writeFileSync(
  path.join(OUT, "BENI_OKU.txt"),
  `ÖĞRETİCİ KLASÖRÜ
================

Bu klasördeki dosyalar sadece ÖRNEKTİR. Programı denemek ve Excel'i nasıl
dolduracağını görmek için buradalar. Kendi verilerini yükleyince bu dosyalar
silinmez, değişmez.

Sırayla dene:
  1. Ornek_Ogrenci_Listesi_8-A.xlsx   -> Ana Sayfa 1. adım ya da Öğrenciler sekmesi
  2. Ornek_Kazanim_Listesi_TT8.xlsx   -> Ana Sayfa 2. adım ya da Kazanımlar sekmesi
  3. Ödevler sekmesi: 8-A için yeni ödev oluştur ("Fikrî Haklar – Test 1", ders: Teknoloji ve Tasarım)
     -> "Boş sayfa ekle" ile Ornek_Bos_Sayfa_Foto.jpg dosyasını seç
     -> "Anahtar ve kazanımları gir":
          Hızlı anahtar:  ${ANAHTAR}
          Toplu kazanım:
${SORULAR.map((q, i) => `            ${i + 1} ${q.kod}`).join("\n")}
  4. Ödev Kontrol sekmesi: Ornek_Ogrenci_Fotograflari klasöründeki 4 fotoğrafı sürükle.
     101.jpg ve "Buse Er.jpg" öğrencisi kendiliğinden seçilir; IMG-... dosyaları için
     öğrenciyi sen seç. Sonra "Kontrol et".

Beklenen sonuçlar:
${OGRENCILER.map(([ad, a]) => `  ${ad.padEnd(26)} ${a}`).join("\n")}
  Ece Tan (No 105): fotoğraf göndermedi -> "Yapmadı"

Ornek_Bos_Sayfa_Yazdir.png sayfasını yazdırıp kendin çözebilir, telefonla
fotoğrafını çekip programda deneyebilirsin.

Kazanım kodları ve metinleri ÖRNEKTİR; resmî liste için K12'den aldığın dosyayı kullan.
`.replace(/\n/g, "\r\n")
);
console.log("Ogretici dosyaları üretildi:", fs.readdirSync(OUT).join(", "));
