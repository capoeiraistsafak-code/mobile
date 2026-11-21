// odev-kontrol/Test_Fotograflari/Kelime_Cevapli: kelime cevaplı sayfa ve 3 öğrenci fotoğrafı.
// Öğrencilerin kelimeleri, harf ağının eğitimde HİÇ görmediği el yazısı tarzı yazı tipleriyle yazılır.
// Çalıştırma: node test/kelime-uret.mjs <@fontsource paketlerinin bulunduğu node_modules klasörü>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { layoutPage, studentInk, renderPage, photograph, KELIME_SAYFA } from "./synthetic.js";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const NM = process.argv[2];

const FONTLAR = ["kalam", "patrick-hand", "caveat", "indie-flower"]; // harf ağının görmediği yazı tipleri
const css = FONTLAR.map((ad) => {
  const d = path.join(NM, "@fontsource", ad, "files");
  const f = (alt) => path.join(d, `${ad}-${alt}-400-normal.woff2`);
  return `@font-face{font-family:"${ad}";src:url(data:font/woff2;base64,${fs.readFileSync(f("latin")).toString("base64")});unicode-range:U+0000-00FF;}
@font-face{font-family:"${ad}";src:url(data:font/woff2;base64,${fs.readFileSync(f("latin-ext")).toString("base64")});unicode-range:U+0100-024F;}`;
}).join("\n");
const tarayici = await chromium.launch();
const sayfa = await tarayici.newPage();
await sayfa.setContent(`<style>${css}</style>${FONTLAR.map((f) => `<span style="font-family:${f}">ğşıİ</span>`).join("")}`);
await sayfa.evaluate(async (fontlar) => {
  for (const f of fontlar) await document.fonts.load(`64px "${f}"`, "aerğşıİçöü");
  await document.fonts.ready;
}, FONTLAR);
/** Kelimeyi kalem renginde, saydam zeminli PNG olarak çizer. */
const ciz = (kelime, font, renk) =>
  sayfa.evaluate(({ kelime, font, renk }) => {
    const c = document.createElement("canvas");
    const g = c.getContext("2d");
    g.font = `64px "${font}"`;
    c.width = Math.ceil(g.measureText(kelime).width + 20);
    c.height = 90;
    g.font = `64px "${font}"`;
    g.fillStyle = renk;
    g.textBaseline = "middle";
    g.fillText(kelime, 10, 48);
    return { b64: c.toDataURL("image/png").split(",")[1], w: c.width, h: c.height };
  }, { kelime, font, renk });

const OUT = path.resolve("odev-kontrol/Test_Fotograflari/Kelime_Cevapli");
fs.mkdirSync(OUT, { recursive: true });
const layout = layoutPage(301, KELIME_SAYFA);
fs.writeFileSync(path.join(OUT, "Bos_Sayfa.png"), await renderPage(layout));
const ANAHTAR = { 1: "B", 3: "D", 5: "C", 7: "D" };
const DOGRU = { 2: "ergonomi", 4: "patent", 6: "telif", 8: "marka" };
const OGR = [
  ["101 Ali Kaya.jpg", "kalam", "Hepsi doğru", {}],
  ["102 Buse Er.jpg", "patrick-hand", "8. soruya \"logo\" yazmış (yanlış), 3. soruda A işaretlemiş (yanlış)", { 8: "logo", 3: "A" }],
  ["103 Can Demir.jpg", "caveat", "2. soruya \"ergonami\" yazmış (küçük yazım hatası: benzerlik yüksek), 6. soru boş", { 2: "ergonami", 6: "" }],
];
for (const [ad, font, , fark] of OGR) {
  const renk = ad.startsWith("102") ? "#555555" : "#1b2a6b";
  const cevaplar = [];
  for (const q of layout.questions) {
    const n = q.number;
    if (q.cevap) {
      const v = n in fark ? fark[n] : DOGRU[n];
      cevaplar.push({ number: n, kelimePng: v ? await ciz(v, font, renk) : null, work: false });
    } else cevaplar.push({ number: n, mark: n in fark ? fark[n] : ANAHTAR[n], work: true, style: "circle" });
  }
  fs.writeFileSync(path.join(OUT, ad), await photograph(await renderPage(layout, studentInk(layout, cevaplar, 60 + ad.length)), 90 + ad.length, 0.9));
}
await tarayici.close();
fs.writeFileSync(path.join(OUT, "OKU_BENI.txt"), `KELİME CEVAPLI DENEME (yapay zekânın Türkçe el yazısı okuması)
==============================================================

Bos_Sayfa.png : Teknoloji ve Tasarım testi. 1, 3, 5, 7 şıklı; 2, 4, 6, 8 "yazınız" sorusu.

Nasıl denenir:
  1. Öğrenci listesi: Ogretici/Ornek_Ogrenci_Listesi_8-A.xlsx
  2. Ödevler: 8-A için yeni ödev, "Boş sayfa ekle" ile Bos_Sayfa.png
  3. "Anahtar ve kazanımları gir":
       Soru numaraları okunamadıysa turuncu etiketli numaraları 1, 3, 5, 7 olarak düzeltin.
       Hızlı anahtar: 1B 3D 5C 7D
       "Yazılı cevap alanı çiz" ile her yazılı sorunun "Cevap: ____" çizgisini çerçeveye alın:
         2 → ergonomi,  4 → patent,  6 → telif,  8 → marka
  4. Ödev Kontrol: bu klasördeki 3 fotoğrafı yükleyip "Kontrol et".

Beklenen:
${OGR.map(([a, , b]) => `  ${a.padEnd(20)} ${b}`).join("\n")}

Kelimeler harf harf okunur ve doğru cevaba benzerliğe bakılır: %80 ve üstü doğru,
%50-80 "öğretmen baksın", altı yanlış. Program yanlış okursa "Düzelt" kutusuna öğrencinin
yazdığını yazın: yapay zekâ bundan öğrenir.
`.replace(/\n/g, "\r\n"));
console.log("Kelime cevaplı deneme dosyaları:", fs.readdirSync(OUT).join(", "));
