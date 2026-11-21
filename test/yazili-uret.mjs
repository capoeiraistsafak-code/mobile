// odev-kontrol/Test_Fotograflari/Yazili_Cevapli: yazılı cevaplı matematik sayfası ve 3 öğrenci fotoğrafı.
// Öğrencilerin rakamları MNIST TEST kümesinden (rakam ağı bunları eğitimde hiç görmedi).
// Çalıştırma: node test/yazili-uret.mjs <mnist klasörü>
import fs from "node:fs";
import path from "node:path";
import { layoutPage, studentInk, renderPage, photograph, YAZILI_SAYFA } from "./synthetic.js";

const MNIST = process.argv[2];
const npy = (d) => { const b = fs.readFileSync(path.join(MNIST, d)); const hl = b.readUInt16LE(8); return b.subarray(10 + hl); };
const X = npy("x_test.npy");
const Y = npy("y_test.npy");
let sira = 500; // her rakam için sıradaki uygun test görüntüsü
const rakam = (d) => { while (Y[sira % 10000] !== d) sira++; const i = sira++ % 10000; return new Uint8Array(X.subarray(i * 784, i * 784 + 784)); };
const yaz = (s) => [...s].map((c) => rakam(+c));

const OUT = path.resolve("odev-kontrol/Test_Fotograflari/Yazili_Cevapli");
fs.mkdirSync(OUT, { recursive: true });
const layout = layoutPage(201, YAZILI_SAYFA);
fs.writeFileSync(path.join(OUT, "Bos_Sayfa.png"), await renderPage(layout));
const ANAHTAR = { 1: "B", 3: "C", 6: "C", 8: "C" };
const DOGRU = { 2: "96", 4: "180", 5: "82", 7: "7" };
const OGR = [
  ["101 Ali Kaya.jpg", "Hepsi doğru", {}],
  ["102 Buse Er.jpg", "5. soruya 72 yazmış (yanlış), 3. soruda D işaretlemiş (yanlış)", { 5: "72", 3: "D" }],
  ["103 Can Demir.jpg", "4. soru boş, 8. soruyu boş bırakmış", { 4: "", 8: null }],
];
for (const [ad, , fark] of OGR) {
  const cevaplar = layout.questions.map((q) => {
    const n = q.number;
    if (q.cevap) { const v = n in fark ? fark[n] : DOGRU[n]; return { number: n, rakamlar: v ? yaz(v) : [], work: !!v }; }
    const v = n in fark ? fark[n] : ANAHTAR[n];
    return { number: n, mark: v, work: !!v, style: "circle" };
  });
  fs.writeFileSync(path.join(OUT, ad), await photograph(await renderPage(layout, studentInk(layout, cevaplar, 40 + ad.length)), 70 + ad.length, 0.9));
}
fs.writeFileSync(path.join(OUT, "OKU_BENI.txt"), `YAZILI CEVAPLI DENEME (yapay zekânın el yazısı rakam okuması)
=============================================================

Bos_Sayfa.png : Matematik testi. 1, 3, 6, 8 şıklı; 2, 4, 5, 7 "cevabı yazınız" sorusu.

Nasıl denenir:
  1. Öğrenci listesi: Ogretici/Ornek_Ogrenci_Listesi_8-A.xlsx
  2. Ödevler: 8-A için yeni ödev, "Boş sayfa ekle" ile Bos_Sayfa.png
  3. "Anahtar ve kazanımları gir":
       Hızlı anahtar: 1B 3C 6C 8C
       "Yazılı cevap alanı çiz" düğmesine basıp her yazılı sorunun "Cevap: ____" çizgisini
       (öğrencinin rakam yazacağı yeri) fareyle çerçeveye alın; açılan pencerede soru
       numarasını ve doğru cevabı yazın:  2 → 96,  4 → 180,  5 → 82,  7 → 7
  4. Ödev Kontrol: bu klasördeki 3 fotoğrafı yükleyip "Kontrol et".

Beklenen:
${OGR.map(([a, b]) => `  ${a.padEnd(20)} ${b}`).join("\r\n")}

Program bir rakamı yanlış okursa sonuç ekranındaki "Düzelt" kutusuna öğrencinin yazdığını
yazın: yapay zekâ bundan öğrenir.
`.replace(/\n/g, "\r\n"));
console.log("Yazılı cevaplı deneme dosyaları:", fs.readdirSync(OUT).join(", "));
