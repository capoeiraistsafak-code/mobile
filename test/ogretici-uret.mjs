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
