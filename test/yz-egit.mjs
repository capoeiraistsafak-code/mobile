// Yapay zekânın BAŞLANGIÇ eğitimi (bu bilgisayarda, TensorFlow ile).
// Sonuç: odev-kontrol/YapayZeka/baslangic-modeli.js  (program ilk açılışta bunu kullanır,
// sonra öğretmenin düzeltmeleriyle tarayıcının içinde kendini eğitmeye devam eder).
// Çalıştırma: node test/yz-egit.mjs <mnist klasörü>   (klasörde x_train.npy, y_train.npy, x_test.npy, y_test.npy)
import fs from "node:fs";
import path from "node:path";
import tf from "@tensorflow/tfjs-node";
import { yzYukle } from "./lib/yz-yukle.js";
import { layoutPage, studentInk, renderPage, photograph, rng, YAZILI_SAYFA } from "./synthetic.js";
import { readTemplate, readStudentPage, shutdownVision } from "./lib/vision.js";

const YZ = yzYukle(tf);
const MNIST = process.argv[2];
const HIZLI = process.env.HIZLI === "1";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- MNIST (.npy) ----------
function npy(dosya) {
  const b = fs.readFileSync(path.join(MNIST, dosya));
  const hl = b.readUInt16LE(8);
  const baslik = b.subarray(10, 10 + hl).toString();
  const sekil = /'shape': \(([^)]*)\)/.exec(baslik)[1].split(",").map((x) => parseInt(x)).filter((x) => x > 0);
  return { veri: b.subarray(10 + hl), sekil };
}
const xtr = npy("x_train.npy");
const ytr = npy("y_train.npy");
const xte = npy("x_test.npy");
const yte = npy("y_test.npy");
const mnist = (x, y, i) => ({ x: new Uint8Array(x.veri.subarray(i * 784, i * 784 + 784)), y: y.veri[i] });

// ---------- Sahte öğrenci sayfaları ----------
const STILLER = ["circle", "circle", "tick", "cross", "underline", "fill"];


/** Bir sayfa üretir, "fotoğraflar", programın okuma yoluyla okur; ağlar için etiketli örnekler döner. */
async function sayfaOrnekleri(sayfaNo, rakamKaynagi, sablonOnbellek) {
  const r = rng(77 + sayfaNo * 13);
  const yazili = sayfaNo % 3 === 0;
  const layout = layoutPage(200 + (yazili ? 1 : sayfaNo), yazili ? YAZILI_SAYFA : null);
  // Boş sayfa (şablon): aynı düzen için bir kez okunur.
  const anahtar = yazili ? "Y" : String(200 + sayfaNo);
  if (!sablonOnbellek.has(anahtar)) {
    const t = await readTemplate(await renderPage(layout));
    const k = t.width / 1240;
    const yaziliAlan = layout.questions.filter((q) => q.cevap).map((q) => ({ key: q.number, rect: { x0: (q.cevap.x - 10) * k, y0: (q.cevap.y - 8) * k, x1: (q.cevap.x + q.cevap.w + 10) * k, y1: (q.cevap.y + q.cevap.h + 6) * k } }));
    sablonOnbellek.set(anahtar, { t, yaziliAlan });
  }
  const { t, yaziliAlan } = sablonOnbellek.get(anahtar);
  const cevaplar = layout.questions.map((q) => {
    if (q.cevap) {
      const n = 1 + Math.floor(r() * 3);
      const rakamlar = Array.from({ length: n }, () => rakamKaynagi(r));
      return { number: q.number, rakamlar: rakamlar.map((d) => d.x), etiket: rakamlar.map((d) => d.y), work: r() < 0.5 };
    }
    const x = r();
    if (x < 0.15) return { number: q.number, mark: null, work: x < 0.07 };
    const mark = "ABCD"[Math.floor(r() * 4)];
    if (x < 0.23) return { number: q.number, mark, mark2: "ABCD".replace(mark, "")[Math.floor(r() * 3)], work: true, style: "circle" };
    return { number: q.number, mark, work: r() < 0.7, style: STILLER[Math.floor(r() * STILLER.length)] };
  });
  const foto = await photograph(await renderPage(layout, studentInk(layout, cevaplar, 1000 + sayfaNo)), 5000 + sayfaNo, 0.7 + r() * 0.6);
  const sonuc = await readStudentPage(foto, [{ id: 1, png: t.png, questions: t.questions.map((q) => ({ ...q, key: q.number })), yazili: yaziliAlan }]);
  if (!sonuc.matched) return { isaret: [], rakam: [], yaziliSoru: [] };
  // Etiketler KONUMA göre: bulunan şık kutusunun içinde üretecin hangi şıkkı varsa etiket odur
  // (soru numarasına göre eşlemek, numarası okunamayan sorularda etiketleri kaydırıyordu).
  const k = t.width / 1240;
  const isaret = [];
  for (const q of t.questions) {
    for (const o of q.options) {
      let bulunan = null;
      for (const lq of layout.questions)
        for (const lo of lq.options) {
          const cx = (lo.x + lo.w / 2) * k;
          const cy = (lo.y + lo.h / 2) * k;
          if (cx >= o.box.x0 && cx <= o.box.x1 && cy >= o.box.y0 && cy <= o.box.y1) bulunan = { no: lq.number, harf: lo.letter };
        }
      if (!bulunan) continue; // kutu bir şıkla eşleşmedi: etiketi bilinmiyor, kullanma
      const c = cevaplar.find((a) => a.number === bulunan.no);
      isaret.push({ x: sonuc.yzKirp[q.number][o.letter], y: c && (c.mark === bulunan.harf || c.mark2 === bulunan.harf) ? 1 : 0, stil: c?.style, grup: `${sayfaNo}-${q.number}` });
    }
  }
  // Yazılı cevaplar: bulunan parça sayısı yazılan rakam sayısına eşitse her parça etiketlenebilir.
  const rakam = [];
  const yaziliSoru = [];
  for (const y of sonuc.yazililar) {
    const c = cevaplar.find((a) => a.number === y.key);
    yaziliSoru.push({ dogru: c.etiket.join(""), parcalar: y.rakamlar });
    // Etiketleme: parça sayısı yazılan rakam sayısına eşitse (gerekirse bölünmüş hâliyle) her parça bir örnek.
    const acik = y.rakamlar.flatMap((p) => p.bolunmus || [p]);
    const liste = y.rakamlar.length === c.etiket.length ? y.rakamlar : acik.length === c.etiket.length ? acik : null;
    if (liste) liste.forEach((p, i) => rakam.push({ x: p.x, y: c.etiket[i] }));
  }
  return { isaret, rakam, yaziliSoru };
}

async function topla(baslangic, adet, rakamKaynagi) {
  const out = { isaret: [], rakam: [], yaziliSoru: [] };
  const onbellek = new Map();
  for (let i = 0; i < adet; i++) {
    const s = await sayfaOrnekleri(baslangic + i, rakamKaynagi, onbellek);
    out.isaret.push(...s.isaret);
    out.rakam.push(...s.rakam);
    out.yaziliSoru.push(...s.yaziliSoru);
    if ((i + 1) % 10 === 0) log(`  ${i + 1}/${adet} sayfa`);
  }
  return out;
}

// ---------- 1) Eğitim ve deneme sayfaları ----------
const SAYFA_EGITIM = HIZLI ? 12 : 90;
const SAYFA_DENEME = HIZLI ? 6 : 30;
// Üretilen veri bir kez kaydedilir (ONBELLEK=dosya), sonraki denemelerde yeniden kullanılır.
const ONBELLEK = process.env.ONBELLEK;
const kodla = (v) => ({ ...v, isaret: v.isaret.map((o) => ({ ...o, x: Buffer.from(o.x).toString("base64") })), rakam: v.rakam.map((o) => ({ ...o, x: Buffer.from(o.x).toString("base64") })), yaziliSoru: v.yaziliSoru.map((o) => ({ ...o, parcalar: o.parcalar.map(parcaKodla) })) });
function parcaKodla(p) { return { ...p, x: Buffer.from(p.x).toString("base64"), bolunmus: p.bolunmus?.map(parcaKodla) }; }
function parcaCoz(p) { return { ...p, x: new Uint8Array(Buffer.from(p.x, "base64")), bolunmus: p.bolunmus?.map(parcaCoz) }; }
const coz = (v) => ({ ...v, isaret: v.isaret.map((o) => ({ ...o, x: new Uint8Array(Buffer.from(o.x, "base64")) })), rakam: v.rakam.map((o) => ({ ...o, x: new Uint8Array(Buffer.from(o.x, "base64")) })), yaziliSoru: v.yaziliSoru.map((o) => ({ ...o, parcalar: o.parcalar.map(parcaCoz) })) });
let egitim, deneme;
if (ONBELLEK && fs.existsSync(ONBELLEK)) {
  ({ egitim, deneme } = JSON.parse(fs.readFileSync(ONBELLEK, "utf8")));
  egitim = coz(egitim);
  deneme = coz(deneme);
  log("Önbellekten okundu:", ONBELLEK);
} else {
  log(`Eğitim sayfaları üretiliyor (${SAYFA_EGITIM})…`);
  egitim = await topla(0, SAYFA_EGITIM, (r) => mnist(xtr, ytr, Math.floor(r() * 60000)));
  log(`Deneme sayfaları üretiliyor (${SAYFA_DENEME}, eğitimde hiç görülmemiş rakamlarla)…`);
  deneme = await topla(10000, SAYFA_DENEME, (r) => mnist(xte, yte, Math.floor(r() * 10000)));
  if (ONBELLEK) fs.writeFileSync(ONBELLEK, JSON.stringify({ egitim: kodla(egitim), deneme: kodla(deneme) }));
}
await shutdownVision();
log(`İşaret örnekleri: eğitim ${egitim.isaret.length}, deneme ${deneme.isaret.length}; sayfadan rakam: eğitim ${egitim.rakam.length}, deneme ${deneme.rakam.length}`);

// ---------- 2) İşaret ağı ----------
const isaretAgi = YZ.isaretModeliKur();
await YZ.egit(isaretAgi, "isaret", egitim.isaret, { epoch: HIZLI ? 4 : 18, ogrenmeOrani: 0.002, ilerleme: (e, n, l) => e % 3 === 0 && log(`  işaret ağı ${e}/${n}: kayıp ${l.loss.toFixed(3)}`) });
const isaretDeneme = await YZ.dogruluk(isaretAgi, "isaret", deneme.isaret);
const stilDogruluk = {};
for (const st of ["circle", "tick", "cross", "underline", "fill"]) {
  const o = deneme.isaret.filter((x) => x.stil === st && x.y === 1);
  if (o.length) stilDogruluk[st] = await YZ.dogruluk(isaretAgi, "isaret", o);
}
log(`İşaret ağı deneme doğruluğu: %${(isaretDeneme * 100).toFixed(1)} (${deneme.isaret.length} şık)`, stilDogruluk);

// ---------- 3) Rakam ağı ----------
const rakamAgi = YZ.rakamModeliKur();
const mnistEgitim = Array.from({ length: HIZLI ? 6000 : 60000 }, (_, i) => mnist(xtr, ytr, i));
await YZ.egit(rakamAgi, "rakam", mnistEgitim, { epoch: HIZLI ? 1 : 4, ogrenmeOrani: 0.001, cesit: true, ilerleme: (e, n, l) => log(`  rakam ağı (MNIST) ${e}/${n}: kayıp ${l.loss.toFixed(3)}`) });
const mnistTest = Array.from({ length: 10000 }, (_, i) => mnist(xte, yte, i));
log(`Rakam ağı MNIST test doğruluğu: %${((await YZ.dogruluk(rakamAgi, "rakam", mnistTest)) * 100).toFixed(2)}`);
const sayfaOncesi = await YZ.dogruluk(rakamAgi, "rakam", deneme.rakam);
// Fotoğraftan okunmuş rakamlarla ince ayar (MNIST'ten bir parçayla karıştırılarak, unutmasın diye)
const ince = [...egitim.rakam.map((o) => ({ ...o, agirlik: 2 })), ...mnistEgitim.slice(0, 4000)];
await YZ.egit(rakamAgi, "rakam", ince, { epoch: HIZLI ? 2 : 6, ogrenmeOrani: 0.0005 });
const sayfaSonrasi = await YZ.dogruluk(rakamAgi, "rakam", deneme.rakam);
log(`Fotoğraftaki rakamlar: ince ayar öncesi %${(sayfaOncesi * 100).toFixed(1)} → sonrası %${(sayfaSonrasi * 100).toFixed(1)} (${deneme.rakam.length} rakam)`);
// Bütün cevap (çok basamaklı sayı) doğruluğu
let cevapDogru = 0;
for (const s of deneme.yaziliSoru) if ((await YZ.sayiOku(rakamAgi, s.parcalar)).metin === s.dogru) cevapDogru++;
log(`Yazılı cevap (bütün sayı) doğruluğu: ${cevapDogru}/${deneme.yaziliSoru.length}`);

// ---------- 4) Kaydet ----------
const sec = (liste, n) => [...liste].sort(() => Math.random() - 0.5).slice(0, n);
const tekrarIsaret = [...sec(egitim.isaret.filter((o) => o.y === 1), 250), ...sec(egitim.isaret.filter((o) => o.y === 0), 250)];
const tekrarRakam = [...sec(egitim.rakam, 300), ...sec(mnistEgitim, 500)];
const paket = {
  surum: 1,
  tarih: new Date().toISOString(),
  aciklama: "Başlangıç modeli: sahte test sayfaları ve MNIST el yazısı rakamlarıyla eğitildi.",
  olcum: {
    isaretDeneme: +isaretDeneme.toFixed(4),
    isaretStil: Object.fromEntries(Object.entries(stilDogruluk).map(([k, v]) => [k, +v.toFixed(4)])),
    rakamFotograf: +sayfaSonrasi.toFixed(4),
    yaziliCevap: `${cevapDogru}/${deneme.yaziliSoru.length}`,
  },
  isaret: await YZ.modelPaketle(isaretAgi),
  rakam: await YZ.modelPaketle(rakamAgi),
  // Kendi kendine eğitimde ağ eski bilgisini unutmasın diye küçük bir "tekrar" kümesi.
  tekrar: {
    isaret: tekrarIsaret.map((o) => [YZ.b64.yaz(o.x), o.y]),
    rakam: tekrarRakam.map((o) => [YZ.b64.yaz(o.x), o.y]),
  },
};
const out = "odev-kontrol/YapayZeka/baslangic-modeli.js";
// Harf ağı ayrı eğitilir (test/harf-egit.mjs): dosyada varsa korunur.
if (fs.existsSync(out)) {
  const eski = fs.readFileSync(out, "utf8");
  const e = JSON.parse(eski.slice(eski.indexOf("{"), eski.lastIndexOf("}") + 1));
  if (e.harf) {
    paket.harf = e.harf;
    paket.tekrar.harf = e.tekrar?.harf;
    for (const k of ["harf", "kelimeTam", "kelimeDogruKabul", "kelimeYanlisRed"]) paket.olcum[k] = e.olcum?.[k];
    paket.aciklama = e.aciklama;
  }
}
fs.writeFileSync(out, `// Ödev Kontrol yapay zekâsının başlangıç modeli (test/yz-egit.mjs üretir; elle değiştirmeyin).\nwindow.YZ_BASLANGIC = ${JSON.stringify(paket)};\n`);
log(`Kaydedildi: ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
