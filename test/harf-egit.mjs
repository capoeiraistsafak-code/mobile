// Türkçe el yazısı HARF ağının başlangıç eğitimi.
// Veri: Google'ın açık lisanslı el yazısı tarzı yazı tipleri (npm @fontsource paketleri), Chromium'da
// farklı boyut, eğim, kalınlık ve büyük/küçük harfle çizilir. 4 yazı tipi eğitime hiç girmez, sınamada kullanılır.
// Sonuç baslangic-modeli.js dosyasına "harf" ağı olarak eklenir.
// Çalıştırma: node test/harf-egit.mjs <@fontsource paketlerinin bulunduğu node_modules klasörü>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import tf from "@tensorflow/tfjs-node";
import { yzYukle } from "./lib/yz-yukle.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const YZ = yzYukle(tf);
const NM = process.argv[2];
const HIZLI = process.env.HIZLI === "1";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- Yazı tipleri ----------
const fontlar = fs
  .readdirSync(path.join(NM, "@fontsource"))
  .map((ad) => {
    const d = path.join(NM, "@fontsource", ad, "files");
    const dosya = (alt) => fs.readdirSync(d).find((f) => f === `${ad}-${alt}-400-normal.woff2`);
    const latin = dosya("latin");
    if (!latin) return null;
    const ext = dosya("latin-ext");
    return { ad, latin: path.join(d, latin), ext: ext ? path.join(d, ext) : null };
  })
  .filter(Boolean);
const SINAMA = ["kalam", "patrick-hand", "caveat", "indie-flower"]; // eğitimde hiç kullanılmaz
log(`${fontlar.length} yazı tipi (${fontlar.filter((f) => f.ext).length} tanesinde Türkçe harflerin hepsi var); sınama: ${SINAMA.join(", ")}`);

// Türkçe'ye özgü ve latin-ext gerektiren harfler
const EXT_GEREKLI = new Set([..."ğşıİĞŞ"]);
const KELIMELER = ["ergonomi", "patent", "telif", "marka", "prototip", "eskiz", "denge", "ritim", "vurgu", "üretim", "tüketim", "dağıtım", "şekil", "çiçek", "ığdır", "istanbul", "ölçü", "güneş", "kağıt", "öğretmen", "bilgisayar", "tasarım", "çevre", "ışık", "yüzey", "düşünce", "kaynak", "doğa", "iletişim", "su"];

// ---------- Chromium'da çizim ----------
const tarayici = await chromium.launch();
const sayfa = await tarayici.newPage();
const fontCss = fontlar
  .map((f) => {
    const kaynak = (yol, aralik) => `@font-face{font-family:"${f.ad}";src:url(data:font/woff2;base64,${fs.readFileSync(yol).toString("base64")}) format("woff2");unicode-range:${aralik};}`;
    return kaynak(f.latin, "U+0000-00FF") + (f.ext ? kaynak(f.ext, "U+0100-024F,U+0130-0131,U+011E-011F,U+015E-015F") : "");
  })
  .join("\n");
await sayfa.setContent(`<html><head><style>${fontCss}</style></head><body>${fontlar.map((f) => `<span style="font-family:'${f.ad}'">aığşİçöü</span>`).join("")}</body></html>`);
await sayfa.evaluate(() => document.fonts.ready);
await sayfa.addScriptTag({ content: fs.readFileSync("odev-kontrol/YapayZeka/yapay-zeka.js", "utf8").replace("else kok.YapayZeka = fabrika(kok.tf);", "else kok.YapayZeka = fabrika(null);") });

/** Sayfada: bir metni rastgele boyut/eğim/kalınlıkla çizer, mürekkep haritasını döndürür. */
const cizici = async (isler) =>
  sayfa.evaluate((isler) => {
    const c = document.createElement("canvas");
    const g = c.getContext("2d", { willReadFrequently: true });
    const sonuc = [];
    for (const is of isler) {
      const boy = is.boy;
      g.font = `${boy}px "${is.font}"`;
      const gen = Math.ceil(g.measureText(is.metin).width + boy * 1.2);
      c.width = gen;
      c.height = Math.ceil(boy * 2.2);
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
      g.save();
      g.translate(c.width / 2, c.height / 2);
      g.rotate(is.aci);
      g.transform(1, 0, is.egim, 1, 0, 0);
      g.font = `${boy}px "${is.font}"`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = g.strokeStyle = "#000";
      g.lineWidth = is.kalem;
      g.fillText(is.metin, 0, 0);
      if (is.kalem > 0) g.strokeText(is.metin, 0, 0);
      g.restore();
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const ink = new Uint8Array(c.width * c.height);
      for (let i = 0; i < ink.length; i++) ink[i] = d[i * 4] < 128 ? 255 : 0;
      if (is.tek) {
        const x = YapayZeka.tekParca(ink, c.width, c.height);
        sonuc.push(x ? Array.from(x) : null);
      } else {
        const parcalar = YapayZeka.harfleriBul(ink, c.width, c.height, { x0: 0, y0: 0, x1: c.width, y1: c.height });
        const kodla = (p) => ({ x: Array.from(p.x), bolunmus: p.bolunmus?.map(kodla) });
        sonuc.push(parcalar.map(kodla));
      }
    }
    return sonuc;
  }, isler);

const rnd = (a, b) => a + Math.random() * (b - a);
const isUret = (font, metin, tek) => ({ font, metin, tek, boy: Math.round(rnd(40, 80)), aci: rnd(-0.14, 0.14), egim: rnd(-0.25, 0.25), kalem: Math.random() < 0.5 ? 0 : rnd(0.5, 2.5) });

// ---------- Harf örnekleri ----------
async function harfVerisi(fontListesi, tekrar) {
  const isler = [];
  for (const f of fontListesi)
    for (const harf of YZ.HARFLER)
      for (const ch of new Set([harf, harf.toLocaleUpperCase("tr-TR")])) {
        if (!f.ext && EXT_GEREKLI.has(ch)) continue;
        for (let k = 0; k < tekrar; k++) isler.push({ ...isUret(f.ad, ch, true), y: YZ.harfSinifi(ch) });
      }
  const out = [];
  for (let i = 0; i < isler.length; i += 400) {
    const parca = isler.slice(i, i + 400);
    const x = await cizici(parca);
    parca.forEach((is, j) => x[j] && out.push({ x: new Uint8Array(x[j]), y: is.y }));
  }
  return out;
}
const egitimFont = fontlar.filter((f) => !SINAMA.includes(f.ad));
const sinamaFont = fontlar.filter((f) => SINAMA.includes(f.ad));
log("Harf örnekleri çiziliyor…");
const egitim = await harfVerisi(egitimFont, HIZLI ? 3 : 14);
const sinama = await harfVerisi(sinamaFont, HIZLI ? 2 : 5);
log(`Eğitim: ${egitim.length} harf (${egitimFont.length} yazı tipi), sınama: ${sinama.length} harf (${sinamaFont.length} yazı tipi, eğitimde hiç yok)`);

// ---------- Eğitim ----------
const ag = YZ.harfModeliKur();
await YZ.egit(ag, "harf", egitim, { epoch: HIZLI ? 2 : 12, ogrenmeOrani: 0.001, cesit: true, ilerleme: (e, n, l) => log(`  harf ağı ${e}/${n}: kayıp ${l.loss.toFixed(3)}`) });
const harfDogruluk = await YZ.dogruluk(ag, "harf", sinama);
log(`Harf doğruluğu (hiç görülmemiş yazı tiplerinde): %${(harfDogruluk * 100).toFixed(1)}`);
// Hangi harfler karışıyor?
const tah = await YZ.harfTahmin(ag, sinama.map((o) => o.x));
const karisma = {};
tah.forEach((t, i) => { if (t.sinif !== sinama[i].y) { const k = `${YZ.HARFLER[sinama[i].y]}→${t.harf}`; karisma[k] = (karisma[k] || 0) + 1; } });
log("En çok karışanlar:", Object.entries(karisma).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k}:${v}`).join(" "));

// ---------- Kelime sınaması: doğru cevabı tanıyor, yanlış cevabı ayırıyor mu? ----------
const kelimeIsleri = [];
for (const f of sinamaFont) for (const k of KELIMELER) kelimeIsleri.push({ ...isUret(f.ad, Math.random() < 0.3 ? k.toLocaleUpperCase("tr-TR") : k, false), kelime: k });
const kelimeParcalari = [];
for (let i = 0; i < kelimeIsleri.length; i += 100) kelimeParcalari.push(...(await cizici(kelimeIsleri.slice(i, i + 100))));
await tarayici.close();
const coz = (p) => ({ x: new Uint8Array(p.x), bolunmus: p.bolunmus?.map(coz) });
let tam = 0, dogruKabul = 0, yanlisRed = 0, ortaDogru = 0, ortaYanlis = 0;
for (let i = 0; i < kelimeIsleri.length; i++) {
  const parcalar = kelimeParcalari[i].map(coz);
  const dogru = kelimeIsleri[i].kelime;
  const baska = KELIMELER[(KELIMELER.indexOf(dogru) + 7) % KELIMELER.length];
  const a = await YZ.kelimeOku(ag, parcalar, dogru);
  const b = await YZ.kelimeOku(ag, parcalar, baska);
  if (a.metin === dogru) tam++;
  if (a.benzerlik >= 0.8) dogruKabul++;
  else if (a.benzerlik >= 0.5) ortaDogru++;
  if (b.benzerlik < 0.5) yanlisRed++;
  else if (b.benzerlik < 0.8) ortaYanlis++;
}
const N = kelimeIsleri.length;
log(`Kelimeler (${N}, hiç görülmemiş yazı tipleri): harfi harfine doğru okunan ${tam}`);
log(`  Doğru cevap → "doğru" (benzerlik ≥%80): ${dogruKabul}, "öğretmen baksın" (%50-80): ${ortaDogru}, "yanlış": ${N - dogruKabul - ortaDogru}`);
log(`  Başka bir kelime → "yanlış" (<%50): ${yanlisRed}, "öğretmen baksın": ${ortaYanlis}, yanlışlıkla "doğru": ${N - yanlisRed - ortaYanlis}`);

// ---------- baslangic-modeli.js'e ekle ----------
const dosya = "odev-kontrol/YapayZeka/baslangic-modeli.js";
const metin = fs.readFileSync(dosya, "utf8");
const paket = JSON.parse(metin.slice(metin.indexOf("{"), metin.lastIndexOf("}") + 1));
paket.harf = await YZ.modelPaketle(ag);
paket.tekrar.harf = [...egitim].sort(() => Math.random() - 0.5).slice(0, 600).map((o) => [YZ.b64.yaz(o.x), o.y]);
paket.olcum.harf = +harfDogruluk.toFixed(4);
paket.olcum.kelimeTam = `${tam}/${N}`;
paket.olcum.kelimeDogruKabul = `${dogruKabul}/${N}`;
paket.olcum.kelimeYanlisRed = `${yanlisRed}/${N}`;
paket.aciklama = "Başlangıç modeli: işaret ağı sahte test sayfalarıyla, rakam ağı MNIST el yazısı rakamlarıyla, harf ağı açık lisanslı el yazısı tarzı yazı tipleriyle (Türkçe harfler dahil) eğitildi.";
fs.writeFileSync(dosya, metin.slice(0, metin.indexOf("window.YZ_BASLANGIC")) + `window.YZ_BASLANGIC = ${JSON.stringify(paket)};\n`);
log(`Kaydedildi: ${dosya} (${(fs.statSync(dosya).size / 1024).toFixed(0)} KB)`);
