/* Ödev Kontrol
   Öğrenciler test kitabının üstünde soruları çözer, şıkkı işaretler ve fotoğrafını öğretmene gönderir.
   Öğretmen fotoğrafları buraya yükler; program (yerel, basit yapay zekâ) el yazısını basılı yazıdan ayırır,
   işaretlenen şıkkı bulur, anahtarla karşılaştırır, ödevin yapılıp yapılmadığını ve eksik kazanımları gösterir.
   Her şey bu bilgisayarda, internetsiz çalışır. Veriler tarayıcının içinde (IndexedDB) saklanır. */
"use strict";

// ---------------------------------------------------------------------------
// Varsayılan ayarlar (Ayarlar sekmesinden değiştirilebilenler işaretli)
// ---------------------------------------------------------------------------
const VARSAYILAN_AYARLAR = {
  tema: "acik",
  eksikSiniri: 60, // * kazanım başarısı bu yüzdenin altındaysa "eksik"
  eksikEnAzSoru: 2, // * eksik demek için o kazanımdan en az kaç soru
  cogunlukOgrenci: 3, // * anahtar girilmediyse: en az bu kadar öğrenci...
  cogunlukOran: 60, // * ...bu yüzdesi aynı şıkkı seçtiyse o şık anahtar olur
  yzKullan: true, // * şıkları sinir ağı okusun (kapalıysa eşik kuralı)
  yzKendiOgren: true, // * ağ ve kural çok emin ve aynı fikirdeyse o okumadan da öğrensin
  yzOtoEgit: 10, // * bu kadar yeni öğretmen düzeltmesi birikince kendiliğinden eğit (0 = kapalı)
};
// Yapay test sayfalarıyla ayarlanmış okuma eşikleri (gerçek ödevlerle yeniden bakılmalı).
const T = {
  minPageMatch: 40, // öğrenci fotoğrafı ile boş sayfa arasında en az bu kadar ortak nokta
  samePageMatch: 120, // aynı boş sayfa ikinci kez eklenirse eskisi kullanılır
  inkDarkness: 55, // boş sayfadan bu kadar koyu nokta = el yazısı (0-255)
  printTolerancePx: 5, // basılı yazıdaki küçük kaymalara tolerans (piksel)
  markMinRatio: 0.008, // şık harfi çevresindeki alanın en az %0,8'i mürekkepse işaretli
  markMultiMin: 0.035, // ikinci şık hem %3,5'i...
  markRivalRatio: 0.5, // ...hem birincinin yarısını geçerse "iki şık işaretli"
  workMinRatio: 0.004, // soru alanının en az %0,4'ü yazıysa "işlem var"
  pageMinInk: 0.002, // sayfanın en az %0,2'si yazıysa ödev yapılmış
};
const PAGE_WIDTH = 1400;
const STUDENT_MAX_SIDE = 1800;
const OCR_SCALE = 1.6;
let A = { ...VARSAYILAN_AYARLAR }; // geçerli ayarlar

// ---------------------------------------------------------------------------
// Kalıcı depolama (tarayıcının IndexedDB'si)
// ---------------------------------------------------------------------------
const STORES = ["siniflar", "ogrenciler", "kazanimlar", "kaynaklar", "odevler", "sayfalar", "gonderimler", "yzOrnekler"];
const D = Object.fromEntries(STORES.map((s) => [s, new Map()]));
const DB = {
  db: null,
  async open() {
    this.db = await new Promise((res, rej) => {
      const r = indexedDB.open("odev-kontrol", 2);
      r.onupgradeneeded = () => {
        const var_ = r.result.objectStoreNames;
        for (const s of STORES) if (!var_.contains(s)) r.result.createObjectStore(s, { keyPath: "id", autoIncrement: true });
        if (!var_.contains("kv")) r.result.createObjectStore("kv");
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    for (const s of STORES) for (const o of await this.req(s, "readonly", (st) => st.getAll())) D[s].set(o.id, o);
    A = { ...VARSAYILAN_AYARLAR, ...((await this.req("kv", "readonly", (st) => st.get("ayarlar"))) || {}) };
  },
  req(store, mode, fn) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(store, mode);
      const r = fn(tx.objectStore(store));
      tx.oncomplete = () => res(r?.result);
      tx.onerror = () => rej(tx.error);
    });
  },
  async put(store, obj) {
    obj.id = await this.req(store, "readwrite", (st) => st.put(obj));
    D[store].set(obj.id, obj);
    return obj;
  },
  async del(store, id) {
    await this.req(store, "readwrite", (st) => st.delete(id));
    D[store].delete(id);
  },
  saveAyarlar() {
    return this.req("kv", "readwrite", (st) => st.put({ ...A }, "ayarlar"));
  },
  async clearAll() {
    for (const s of STORES) {
      await this.req(s, "readwrite", (st) => st.clear());
      D[s].clear();
    }
    await this.req("kv", "readwrite", (st) => st.clear());
    A = { ...VARSAYILAN_AYARLAR };
  },
};
const list = (s, f = () => true) => [...D[s].values()].filter(f);
const simdi = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const trSirala = (a, b) => String(a).localeCompare(String(b), "tr", { numeric: true });
const sinifAdi = (s) => (s ? s.ad + (s.ornek ? " (örnek)" : "") : "");
const ogrAd = (o) => [o.ad, o.soyad].filter(Boolean).join(" ");
const ogrSirala = (a, b) => trSirala(a.no || "", b.no || "") || trSirala(ogrAd(a), ogrAd(b));
const tarihYaz = (s) => {
  if (!s) return "";
  if (s.length === 10) return new Date(s + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return new Date(s).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};
const sadelestir = (s) =>
  String(s ?? "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const bitisik = (s) => sadelestir(s).replace(/ /g, "");

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 3200);
}

/** Yeşil ✓ / kırmızı ✕ sonuç kartı. */
function sonucKarti(ok, baslik, notlar = []) {
  const k = document.createElement("div");
  k.className = `sk ${ok ? "sk-ok" : "sk-hata"}`;
  k.innerHTML = `<div class="sk-ikon">${ok ? "✓" : "✕"}</div><div class="sk-govde"><b>${esc(baslik)}</b>${notlar.map((n) => `<span class="sk-not">${esc(n)}</span>`).join("")}</div><button class="sk-kapat" aria-label="Kapat">×</button>`;
  k.querySelector(".sk-kapat").onclick = () => k.remove();
  document.getElementById("sonucKartlar").prepend(k);
  setTimeout(() => k.remove(), ok ? 9000 : 20000);
}

/** Ortak pencere. dugmeler: [{yazi, deger, sinif}]. Seçilen düğmenin değeri döner. */
function pencere(baslik, html, dugmeler = [{ yazi: "Tamam", deger: true, sinif: "primary" }], hazirla) {
  const dlg = document.getElementById("dlg");
  document.getElementById("dlgBaslik").textContent = baslik;
  document.getElementById("dlgIcerik").innerHTML = html;
  const ey = document.getElementById("dlgEylem");
  ey.innerHTML = "";
  return new Promise((resolve) => {
    for (const d of dugmeler) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `btn ${d.sinif || ""}`;
      b.textContent = d.yazi;
      b.onclick = () => {
        dlg.close();
        resolve(typeof d.deger === "function" ? d.deger() : d.deger);
      };
      ey.append(b);
    }
    dlg.onclose = () => resolve(undefined);
    hazirla?.(document.getElementById("dlgIcerik"));
    dlg.showModal();
  });
}

function oranCubugu(oran) {
  const r = oran >= 80 ? "green" : oran >= A.eksikSiniri ? "orange" : "red";
  return `<span class="bar"><span class="bar-dolu ${r}" style="width:${oran}%"></span></span><b class="small">%${oran}</b>`;
}

// Resimler için geçici adresler; ekran yeniden çizilince serbest bırakılır.
let adresler = [];
const adresi = (blob) => {
  if (!blob) return "";
  const u = URL.createObjectURL(blob);
  adresler.push(u);
  return u;
};
const dosyaSec = ({ coklu = false, tur = "image/*", klasor = false } = {}) =>
  new Promise((resolve) => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = tur;
    inp.multiple = coklu;
    if (klasor) inp.webkitdirectory = true;
    inp.onchange = () => resolve([...inp.files]);
    inp.click();
  });
function birakmaAlani(el, onFiles, filtre = (f) => f.type.startsWith("image/")) {
  el.ondragover = (e) => {
    e.preventDefault();
    el.classList.add("over");
  };
  el.ondragleave = () => el.classList.remove("over");
  el.ondrop = (e) => {
    e.preventDefault();
    el.classList.remove("over");
    onFiles([...e.dataTransfer.files].filter(filtre));
  };
}
function indir(blob, ad) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = ad;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ---------------------------------------------------------------------------
// Excel okuma ve sütun tanıma
// ---------------------------------------------------------------------------
async function excelOku(file) {
  if (!window.XLSX) throw new Error("Excel okuma kütüphanesi yüklenemedi (vendor klasörü eksik olabilir).");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  return wb.SheetNames.map((n) => ({ ad: n, satirlar: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: "", raw: false }) }));
}

/** Başlık satırını bulur ve istenen sütunların yerini döner. esler: {alan: [olası başlıklar]} */
function basliklariBul(satirlar, esler, gerekli) {
  for (let i = 0; i < Math.min(satirlar.length, 30); i++) {
    const hucre = satirlar[i].map(bitisik);
    const yer = {};
    for (const [alan, adlar] of Object.entries(esler)) {
      const j = hucre.findIndex((h) => h && adlar.includes(h));
      if (j >= 0) yer[alan] = j;
    }
    if (gerekli(yer)) return { satir: i, yer };
  }
  return null;
}

/** "9-A", "9/A", "9. Sınıf / A Şubesi", "9A", "Hazırlık-B" → "9-A" */
function sinifAdiCoz(s) {
  const t = String(s || "").toLocaleUpperCase("tr-TR");
  const m = /(HAZIRLIK|\d{1,2})\s*(?:\.?\s*SINIF)?\s*[-/ .]*\s*([A-ZÇĞİÖŞÜ])(?:\s*ŞUBE(?:Sİ)?)?(?![A-ZÇĞİÖŞÜ])/.exec(t);
  return m ? `${m[1] === "HAZIRLIK" ? "Hazırlık" : m[1]}-${m[2]}` : null;
}

const OGRENCI_BASLIK = {
  no: ["ogrencino", "ogrno", "no", "numara", "okulno", "ogrencinumarasi", "okulnumarasi", "numarasi"],
  ad: ["ad", "adi", "isim", "ogrenciadi"],
  soyad: ["soyad", "soyadi"],
  adSoyad: ["adsoyad", "adisoyadi", "adivesoyadi", "ogrenciadisoyadi", "adsoyadi", "ogrenci", "isimsoyisim"],
  sinif: ["sinif", "sube", "sinifsube", "sinifvesube", "sinifi", "subesi", "sinifsubesi"],
};
const KAZANIM_BASLIK = {
  kod: ["kazanimkodu", "kod", "kazanimkod", "kodu", "kazanimno"],
  ders: ["ders", "dersadi"],
  seviye: ["sinif", "seviye", "sinifseviyesi", "duzey", "sinifduzeyi"],
  unite: ["unite", "uniteadi", "ogrenmealani", "unitetema", "tema", "alan"],
  konu: ["konu", "altogrenmealani", "konuadi"],
  metin: ["kazanim", "kazanimmetni", "aciklama", "kazanimaciklamasi", "kazanimlar", "kazanimadi"],
};

/** Öğrenci listesi Excel'i. Sınıf: sütundan → başlık üstündeki yazıdan → dosya adından → öğretmene sorulur. */
async function ogrenciYukle(file) {
  const sayfalar = await excelOku(file);
  let eklenen = 0;
  let guncellenen = 0;
  const siniflar = new Set();
  const yeniSiniflar = [];
  let bulundu = false;
  for (const sh of sayfalar) {
    const b = basliklariBul(sh.satirlar, OGRENCI_BASLIK, (y) => y.no != null && (y.ad != null || y.adSoyad != null));
    if (!b) continue;
    bulundu = true;
    const ustYazi = sh.satirlar.slice(0, b.satir).flat().join(" ");
    let varsayilanSinif = sinifAdiCoz(ustYazi) || sinifAdiCoz(file.name.replace(/\.[^.]+$/, "")) || sinifAdiCoz(sh.ad);
    for (const r of sh.satirlar.slice(b.satir + 1)) {
      const no = String(r[b.yer.no] ?? "").trim();
      let ad = b.yer.ad != null ? String(r[b.yer.ad]).trim() : "";
      let soyad = b.yer.soyad != null ? String(r[b.yer.soyad]).trim() : "";
      if (!ad && b.yer.adSoyad != null) {
        const p = String(r[b.yer.adSoyad]).trim().split(/\s+/);
        soyad = p.length > 1 ? p.pop() : "";
        ad = p.join(" ");
      }
      if (!no || !/^\d+$/.test(no) || !ad) continue;
      let sinifAdi = (b.yer.sinif != null && sinifAdiCoz(r[b.yer.sinif])) || varsayilanSinif;
      if (!sinifAdi) {
        sinifAdi = await pencere(
          "Bu liste hangi sınıfın?",
          `<p><b>${esc(file.name)}</b> dosyasında sınıf bilgisi bulunamadı. Sınıfın adını yazın (ör. 8-A).</p><input id="sinifSor" class="tam" placeholder="8-A">`,
          [{ yazi: "Vazgeç", deger: null }, { yazi: "Tamam", sinif: "primary", deger: () => sinifAdiCoz(document.getElementById("sinifSor").value) || document.getElementById("sinifSor").value.trim() || null }]
        );
        if (!sinifAdi) throw new Error("Sınıf bilgisi bulunamadı.");
        varsayilanSinif = sinifAdi;
      }
      let sinif = list("siniflar", (s) => s.ad === sinifAdi && !s.ornek)[0];
      if (!sinif) {
        sinif = await DB.put("siniflar", { ad: sinifAdi, seviye: parseInt(sinifAdi) || null });
        yeniSiniflar.push(sinifAdi);
      }
      siniflar.add(sinifAdi);
      const eski = list("ogrenciler", (o) => o.sinifId === sinif.id && String(o.no) === no)[0];
      if (eski) {
        Object.assign(eski, { ad, soyad });
        await DB.put("ogrenciler", eski);
        guncellenen++;
      } else {
        await DB.put("ogrenciler", { sinifId: sinif.id, no, ad, soyad });
        eklenen++;
      }
    }
  }
  if (!bulundu) throw new Error("Öğrenci No ve Adı sütunları bulunamadı. Örnek Excel'deki başlıkları kullanın.");
  if (!eklenen && !guncellenen) throw new Error("Dosyada öğrenci satırı bulunamadı.");
  await DB.put("kaynaklar", { tur: "ogrenci", dosya: file.name, tarih: simdi(), sayi: eklenen + guncellenen, aciklama: [...siniflar].join(", ") });
  return { eklenen, guncellenen, siniflar: [...siniflar], yeniSiniflar };
}

async function kazanimYukle(file) {
  const sayfalar = await excelOku(file);
  let eklenen = 0;
  let guncellenen = 0;
  const dersler = new Set();
  let bulundu = false;
  for (const sh of sayfalar) {
    const b = basliklariBul(sh.satirlar, KAZANIM_BASLIK, (y) => y.kod != null && y.metin != null);
    if (!b) continue;
    bulundu = true;
    const ustYazi = sh.satirlar.slice(0, b.satir).flat().join(" ");
    for (const r of sh.satirlar.slice(b.satir + 1)) {
      const kod = String(r[b.yer.kod] ?? "").trim();
      const metin = String(r[b.yer.metin] ?? "").trim();
      if (!kod || !metin) continue;
      const al = (k) => (b.yer[k] != null ? String(r[b.yer[k]]).trim() : "");
      const k = { kod, metin, ders: al("ders") || sh.ad, seviye: al("seviye") || (/(\d{1,2})\s*\.?\s*sınıf/i.exec(ustYazi)?.[1] ?? ""), unite: al("unite"), konu: al("konu") };
      dersler.add(k.ders);
      const eski = list("kazanimlar", (x) => x.kod === kod && !x.ornek)[0];
      if (eski) {
        Object.assign(eski, k);
        await DB.put("kazanimlar", eski);
        guncellenen++;
      } else {
        await DB.put("kazanimlar", k);
        eklenen++;
      }
    }
  }
  if (!bulundu) throw new Error("Kazanım Kodu ve Kazanım sütunları bulunamadı. Örnek Excel'deki başlıkları kullanın.");
  if (!eklenen && !guncellenen) throw new Error("Dosyada kazanım satırı bulunamadı.");
  await DB.put("kaynaklar", { tur: "kazanim", dosya: file.name, tarih: simdi(), sayi: eklenen + guncellenen, aciklama: [...dersler].join(", ") });
  return { eklenen, guncellenen, dersler: [...dersler] };
}

let excelMesgul = false;
async function excelleriYukle(files, tur) {
  if (excelMesgul) return toast("Önceki işlem bitmeden yenisi başlatılamaz.");
  excelMesgul = true;
  try {
    for (const f of files) {
      try {
        if (tur === "ogrenci") {
          const r = await ogrenciYukle(f);
          sonucKarti(true, `${f.name} aktarıldı`, [
            `${r.eklenen} öğrenci eklendi, ${r.guncellenen} güncellendi.`,
            `Sınıf: ${r.siniflar.join(", ")}`,
            ...(r.yeniSiniflar.length ? [`Yeni oluşturulan sınıf: ${r.yeniSiniflar.join(", ")}`] : []),
          ]);
        } else {
          const r = await kazanimYukle(f);
          sonucKarti(true, `${f.name} aktarıldı`, [`${r.eklenen} kazanım eklendi, ${r.guncellenen} güncellendi.`, `Ders: ${r.dersler.join(", ")}`]);
        }
      } catch (e) {
        console.error(e);
        sonucKarti(false, `${f.name} aktarılamadı`, [e.message]);
      }
    }
  } finally {
    excelMesgul = false;
    ciz();
  }
}

// Öğretici örnek Excel dosyaları (birbirine uyumlu: 8-A öğrencileri + 8. sınıf Teknoloji ve Tasarım kazanımları)
const ORNEK_OGRENCI = [
  ["ÖRNEK ÖĞRENCİ LİSTESİ — Nasıl doldurulur: örnek satırları silip kendi öğrencilerinizi aynı sütunlara yazın. Sınıf/Şube boşsa dosya adı (ör. 8-A.xlsx) kullanılır."],
  [],
  ["Öğrenci No", "Adı", "Soyadı", "Sınıf/Şube"],
  ["101", "Ali", "Kaya", "8-A"],
  ["102", "Buse", "Er", "8-A"],
  ["103", "Can", "Demir", "8-A"],
  ["104", "Deniz", "Ak", "8-A"],
  ["105", "Ece", "Tan", "8-A"],
];
const ORNEK_KAZANIM = [
  ["ÖRNEK KAZANIM LİSTESİ — Kodlar ve metinler örnektir; resmî liste için K12'den aldığınız dosyayı kullanın."],
  [],
  ["Kazanım Kodu", "Ders", "Sınıf", "Ünite", "Konu", "Kazanım"],
  ["TT.8.A.1", "Teknoloji ve Tasarım", "8", "Tasarım ve Toplum", "Ergonomi", "Ürünlerin insan vücuduna ve kullanımına uygunluğunu ergonomi açısından değerlendirir."],
  ["TT.8.A.2", "Teknoloji ve Tasarım", "8", "Tasarım ve Toplum", "Fikrî Haklar", "Patent, marka, telif hakkı gibi fikrî hakları ayırt eder."],
  ["TT.8.B.1", "Teknoloji ve Tasarım", "8", "Tasarım Süreci", "Tasarım Süreci", "Tasarım sürecinin aşamalarını sırasıyla açıklar."],
  ["TT.8.B.2", "Teknoloji ve Tasarım", "8", "Tasarım Süreci", "Tasarım İlkeleri", "Denge, vurgu, ritim gibi tasarım ilkelerini örneklerle açıklar."],
  ["TT.8.C.1", "Teknoloji ve Tasarım", "8", "Sürdürülebilirlik", "Geri Dönüşüm", "Geri dönüşümün çevreye ve ekonomiye katkısını açıklar."],
];
function ornekExcel(tur) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tur === "ogrenci" ? ORNEK_OGRENCI : ORNEK_KAZANIM), tur === "ogrenci" ? "8-A" : "Kazanımlar");
  XLSX.writeFile(wb, tur === "ogrenci" ? "Ornek_Ogrenci_Listesi_8-A.xlsx" : "Ornek_Kazanim_Listesi_TT8.xlsx");
}

// ---------------------------------------------------------------------------
// SAYFA DÜZENİ: basılı yazıdan soru ve şık yerlerini bulma
// ---------------------------------------------------------------------------
// Basılı yazı okumasından (OCR) gelen kelimelerden sayfa düzenini çıkarır:
// hangi soru nerede, şıkları (A, B, C, D, E) nerede.
// Saf fonksiyon: resimle uğraşmaz, sadece kelime kutularıyla çalışır.

const LABEL_RE = /^[(\[]?([A-E])\1?[)\].:]/; // "A)", "(A)", "A.", "A:", OCR çift okursa "CC)"
const NUMBER_RE = /^(\d{1,3})[.)]$/; // "12." ya da "12)"
const LETTERS = ["A", "B", "C", "D", "E"];

const median = (a) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};
const cy = (w) => (w.y0 + w.y1) / 2;

/**
 * @param {{text:string,x0:number,y0:number,x1:number,y1:number}[]} words OCR kelimeleri
 * @param {number} W sayfa genişliği (piksel)
 * @param {number} H sayfa yüksekliği (piksel)
 * @returns {{number:number, region:Rect, options:{letter:string, box:Rect}[]}[]}
 */
function detectQuestions(words, W, H) {
  words = words.filter((w) => w.text && w.x1 > w.x0 && w.y1 > w.y0);
  const labels = words
    .map((w) => {
      // OCR'nin sık karıştırdığı işaretler: "©)" ve "€)" aslında "C)".
      const m = LABEL_RE.exec(w.text.trim().replace(/^[©€¢]/, "C"));
      return m ? { ...w, L: m[1], used: false } : null;
    })
    .filter(Boolean)
    .sort((a, b) => cy(a) - cy(b) || a.x0 - b.x0);
  if (!labels.length) return [];
  const lh = median(labels.map((l) => l.y1 - l.y0)) || 20; // satır yüksekliği

  // 1) A'dan başlayıp B, C, D, E'yi zincirle. Tek bir harf okunamadıysa atlanır, yeri sonra tahmin edilir.
  const findNext = (prev, a, letter, maxRows) => {
    let best = null;
    let bestD = Infinity;
    for (const l of labels) {
      if (l.used || l.L !== letter) continue;
      const dy = cy(l) - cy(prev);
      const sameLine = Math.abs(dy) < lh * 1.1 && l.x0 > prev.x1 && l.x0 - a.x0 < W * 0.48;
      // Alt satırdaki şık A'nın ya da bir önceki şıkkın hizasında olmalı (alt alta ya da 2x2 düzen);
      // değilse başka sütundaki bir sorunun şıkkıdır.
      const aligned = Math.abs(l.x0 - a.x0) < lh * 2.5 || Math.abs(l.x0 - prev.x0) < lh * 2.5;
      const below = dy > lh * 1.1 && dy < lh * maxRows && aligned;
      if (!sameLine && !below) continue;
      const d = Math.hypot(l.x0 - prev.x0, dy * 1.5);
      if (d < bestD) {
        bestD = d;
        best = l;
      }
    }
    return best;
  };
  const chains = [];
  // A'dan (A okunamadıysa B'den) başlayıp sonraki harfleri zincirle.
  const build = (start, from) => {
    const chain = { [start.L]: start };
    let prev = start;
    let skipped = 0;
    for (let i = from + 1; i < LETTERS.length; i++) {
      let next = findNext(prev, start, LETTERS[i], 7);
      if (!next && skipped === 0 && i + 1 < LETTERS.length) {
        // Bu harf okunamamış olabilir: bir sonrakini dene.
        next = findNext(prev, start, LETTERS[i + 1], 12);
        if (next) {
          skipped++;
          i++;
        }
      }
      if (!next) break;
      chain[next.L] = next;
      prev = next;
    }
    const found = Object.keys(chain).length;
    if (found >= 3 && (chain.D || chain.C)) {
      Object.values(chain).forEach((l) => (l.used = true));
      chains.push(fillMissing(chain, lh));
    }
  };
  for (const a of labels.filter((l) => l.L === "A")) if (!a.used) build(a, 0);
  for (const b of labels.filter((l) => l.L === "B")) if (!b.used) build(b, 1);
  if (!chains.length) return [];

  // 2) Her zincire soru numarasını bul: A'nın üstünde, aynı sütunda, en yakın "12." gibi kelime.
  const numbers = words
    .map((w) => {
      const m = NUMBER_RE.exec(w.text.trim());
      return m ? { ...w, n: Number(m[1]) } : null;
    })
    .filter(Boolean);
  const qs = chains.map((chain) => {
    const a = chain[0];
    const top = Math.min(...chain.map((l) => l.y0));
    let num = null;
    for (const n of numbers) {
      if (n.y0 > top + lh * 0.3) continue; // numara şıkların üstünde ya da aynı satırda olmalı
      if (n.x0 > a.x0 + W * 0.1 || a.x0 - n.x0 > W * 0.35) continue;
      if (!num || n.y0 > num.y0) num = n;
    }
    return { chain, num, anchorX: Math.min(a.x0, num ? num.x0 : a.x0) };
  });
  // Aynı numara iki soruya verildiyse alttakine bırakmaz (en yakın olan kalır).
  const byNum = new Map();
  for (const q of qs) {
    if (!q.num) continue;
    const prev = byNum.get(q.num);
    if (!prev || q.chain[0].y0 < prev.chain[0].y0) byNum.set(q.num, q);
  }
  for (const q of qs) if (q.num && byNum.get(q.num) !== q) q.num = null;

  // 3) Sütunlar: soru başlangıçlarının x konumlarını grupla.
  const xs = [...new Set(qs.map((q) => q.anchorX))].sort((a, b) => a - b);
  const colStarts = [];
  for (const x of xs) if (!colStarts.length || x - colStarts[colStarts.length - 1] > W * 0.25) colStarts.push(x);
  const colOf = (x) => {
    let c = 0;
    for (let i = 0; i < colStarts.length; i++) if (x >= colStarts[i] - W * 0.12) c = i;
    return c;
  };
  for (const q of qs) {
    q.col = colOf(q.anchorX);
    q.top = q.num ? q.num.y0 : Math.min(...q.chain.map((l) => l.y0));
  }

  // 4) Soru alanı: kendi başından aynı sütundaki bir sonraki sorunun başına kadar.
  const pad = lh * 0.4;
  const optBottom = (q) => Math.max(...q.chain.map((l) => l.y1));
  for (const q of qs) {
    const prevInCol = qs.filter((o) => o.col === q.col && o.top < q.top - lh).sort((a, b) => b.top - a.top)[0];
    // Numarasız soruda alanın üstü: bir önceki sorunun şıklarının altı.
    q.regionTop = q.num
      ? q.num.y0 - pad
      : prevInCol
        ? optBottom(prevInCol) + lh
        : Math.max(0, q.top - lh * 8);
  }
  const out = [];
  for (const q of qs) {
    const colLeft = Math.max(0, q.col === 0 ? 0 : colStarts[q.col] - W * 0.03);
    const colRight = q.col + 1 < colStarts.length ? colStarts[q.col + 1] - W * 0.02 : W;
    const next = qs.filter((o) => o.col === q.col && o.top > q.top + lh).sort((a, b) => a.top - b.top)[0];
    const bottom = next ? Math.max(optBottom(q) + lh, next.regionTop) : H - pad;
    const region = clampRect({ x0: colLeft, y0: q.regionTop, x1: colRight, y1: bottom }, W, H);

    // Şık kutuları: harfin çevresi + aynı satırdaki şık metni (bir sonraki harfe kadar).
    const options = q.chain.map((l, i) => {
      const next = q.chain[i + 1];
      const nextSameLine = next && Math.abs(cy(next) - cy(l)) < lh * 1.1 ? next : null;
      const limit = nextSameLine ? nextSameLine.x0 - lh * 0.3 : Math.min(colRight, l.x1 + W * 0.3);
      let textRight = l.x1;
      for (const w of words) {
        if (Math.abs(cy(w) - cy(l)) < lh * 0.6 && w.x0 > l.x1 - 1 && w.x1 <= limit + lh) textRight = Math.max(textRight, w.x1);
      }
      return {
        letter: l.L,
        box: clampRect(
          { x0: l.x0 - lh * 0.6, y0: l.y0 - lh * 0.45, x1: Math.min(limit, Math.max(textRight, l.x1 + lh)) + lh * 0.3, y1: l.y1 + lh * 0.45 },
          W,
          H
        ),
      };
    });
    splitOverlaps(options.map((o) => o.box));
    out.push({ number: q.num?.n ?? null, col: q.col, region, options });
  }

  // Okuma sırası: sütun sütun, yukarıdan aşağı. Numarası okunamayanlara sıra numarası ver.
  out.sort((a, b) => a.col - b.col || a.region.y0 - b.region.y0);
  const taken = new Set(out.map((q) => q.number).filter((n) => n != null));
  let k = 1;
  for (const q of out) {
    if (q.number == null) {
      while (taken.has(k)) k++;
      q.number = k;
      q.numberGuessed = true;
      taken.add(k);
    }
    delete q.col;
  }
  return out;
}

/**
 * Okunamayan şıkkın yerini diğerlerinden tahmin eder (A-D arası).
 * Düzenler: yan yana, 2x2, alt alta.
 */
function fillMissing(chain, lh) {
  const L = ["A", "B", "C", "D"];
  const has = (k) => !!chain[k];
  const make = (x, y, like) => ({ ...like, text: "?", L: "", x0: x, x1: x + (like.x1 - like.x0), y0: y, y1: y + (like.y1 - like.y0), guessed: true });
  const known = L.filter(has).map((k) => chain[k]);
  const ref = known[0];
  // Düzeni bul: aynı sütundaki şıklar alt alta mı, yan yana mı?
  const sameX = (p, q) => Math.abs(p.x0 - q.x0) < lh * 1.5;
  const below = (p, q) => cy(q) - cy(p) > lh * 1.1;
  const stacked = (a, b) => has(a) && has(b) && sameX(chain[a], chain[b]) && below(chain[a], chain[b]);
  const beside = (a, b) => has(a) && has(b) && !sameX(chain[a], chain[b]);
  let layout = "row";
  if ((stacked("A", "C") || stacked("B", "D")) && (beside("A", "B") || beside("C", "D"))) layout = "grid";
  else if (known.every((k) => sameX(k, ref))) layout = "col";
  for (let i = 0; i < 4; i++) {
    const k = L[i];
    if (has(k)) continue;
    let p = null;
    if (layout === "grid") {
      const colMate = chain[L[i ^ 2]]; // A<->C, B<->D aynı sütun
      const rowMate = chain[L[i ^ 1]]; // A<->B, C<->D aynı satır
      if (colMate && rowMate) p = make(colMate.x0, rowMate.y0, ref);
    } else {
      const prev = chain[L[i - 1]];
      const next = chain[L[i + 1]];
      if (prev && next) p = make((prev.x0 + next.x0) / 2, (prev.y0 + next.y0) / 2, ref);
      else if (prev && chain[L[i - 2]]) {
        const pp = chain[L[i - 2]];
        p = make(prev.x0 * 2 - pp.x0, prev.y0 * 2 - pp.y0, ref);
      } else if (next && chain[L[i + 2]]) {
        // A okunamadı: B ile C arasındaki adımı geriye uygula.
        const nn = chain[L[i + 2]];
        p = make(next.x0 * 2 - nn.x0, next.y0 * 2 - nn.y0, ref);
      }
    }
    if (p) {
      p.L = k;
      chain[k] = p;
    }
  }
  return [...L, "E"].filter(has).map((k) => chain[k]);
}

function clampRect(r, W, H) {
  const x0 = Math.min(W - 1, Math.max(0, Math.round(r.x0)));
  const y0 = Math.min(H - 1, Math.max(0, Math.round(r.y0)));
  return { x0, y0, x1: Math.max(x0 + 1, Math.min(W, Math.round(r.x1))), y1: Math.max(y0 + 1, Math.min(H, Math.round(r.y1))) };
}

/** Üst üste binen şık kutularını ortadan böler (alt alta dizilmiş şıklar için). */
function splitOverlaps(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ox <= 0 || oy <= 0) continue;
      if (Math.min(ox, oy) > Math.min(a.x1 - a.x0, a.y1 - a.y0, b.x1 - b.x0, b.y1 - b.y0) * 0.8) continue; // tamamen üst üste: bölme
      if (oy < ox) {
        const [up, down] = a.y0 <= b.y0 ? [a, b] : [b, a];
        const mid = Math.round((up.y1 + down.y0) / 2);
        up.y1 = mid;
        down.y0 = mid;
      } else {
        const [l, r] = a.x0 <= b.x0 ? [a, b] : [b, a];
        const mid = Math.round((l.x1 + r.x0) / 2);
        l.x1 = mid;
        r.x0 = mid;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// FOTOĞRAF OKUMA (yerel yapay zekâ): OpenCV + Tesseract, ikisi de vendor klasöründe
// ---------------------------------------------------------------------------
let cv = null;
const cvHazir = new Promise((resolve, reject) => {
  const tag = document.getElementById("cvjs");
  const bitti = () => {
    const m = window.cv;
    if (!m) return reject(new Error("Resim işleme kütüphanesi (OpenCV) yüklenemedi."));
    if (m instanceof Promise) m.then((x) => resolve((cv = x)));
    else if (m.Mat) resolve((cv = m));
    else {
      m.onRuntimeInitialized = () => resolve((cv = m));
      // Kütüphane programdan önce yüklendiyse hazır olduğu an kaçırılabilir: ara ara bak.
      const t = setInterval(() => m.Mat && (clearInterval(t), resolve((cv = m))), 200);
    }
  };
  if (window.cv) bitti();
  else if (tag) {
    tag.addEventListener("load", bitti);
    tag.addEventListener("error", () => reject(new Error("Resim işleme kütüphanesi (OpenCV) yüklenemedi.")));
  } else reject(new Error("OpenCV bulunamadı."));
});

// Yazı okuma motoru tamamen gömülü çalışır: çekirdek + Türkçe veri + işçi tek parça olarak başlatılır.
let ocrP = null;
function ocrMotoru() {
  if (!ocrP) {
    if (!window.Tesseract || !window.TESS_WORKER_SRC || !window.TESS_CORE_SRC || !window.TESS_TUR_GZ_B64)
      throw new Error("Yazı okuma motoru dosyaları eksik (vendor klasörü).");
    const ara =
      "self.__TUR=" + JSON.stringify(window.TESS_TUR_GZ_B64) + ";" +
      "const __f=self.fetch;self.fetch=(u,o)=>String(u).endsWith('tur.traineddata.gz')?Promise.resolve(new Response(Uint8Array.from(atob(self.__TUR),c=>c.charCodeAt(0)))):__f(u,o);";
    const isci = URL.createObjectURL(new Blob([window.TESS_CORE_SRC, "\n;\n", ara, "\n;\n", window.TESS_WORKER_SRC], { type: "text/javascript" }));
    ocrP = Tesseract.createWorker("tur", Tesseract.OEM.LSTM_ONLY, {
      workerPath: isci,
      workerBlobURL: false,
      langPath: "https://yerel.invalid/tessdata",
      cacheMethod: "none",
      errorHandler: (e) => console.error("Tesseract:", e),
    })
      .then(async (w) => {
        await w.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT });
        return w;
      })
      .catch((e) => {
        ocrP = null;
        throw e;
      });
  }
  return ocrP;
}

function scope(fn) {
  const mats = [];
  const keep = (m) => (mats.push(m), m);
  try {
    return fn(keep);
  } catch (e) {
    if (typeof e === "number" && cv.exceptionFromPtr) throw new Error(`OpenCV: ${cv.exceptionFromPtr(e).msg}`);
    throw e;
  } finally {
    for (const m of mats) if (m && !m.isDeleted?.()) m.delete();
  }
}

async function griMat(blob, { width, maxSide }) {
  const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
  const s = width ? width / bmp.width : Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  const rgba = cv.matFromImageData(g.getImageData(0, 0, c.width, c.height));
  const gray = new cv.Mat();
  cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY);
  rgba.delete();
  return gray;
}

/** Işık farklarını düzeltir: kağıt beyaz, yazı koyu. */
function duzle(gray, keep) {
  const k = Math.max(15, Math.round(Math.max(gray.cols, gray.rows) / 60) | 1);
  const bg = keep(new cv.Mat());
  cv.dilate(gray, bg, keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(k, k))));
  cv.GaussianBlur(bg, bg, new cv.Size(k * 2 + 1, k * 2 + 1), 0);
  const out = new cv.Mat();
  cv.divide(gray, bg, out, 255);
  return out;
}
function matTuval(mat) {
  const c = document.createElement("canvas");
  cv.imshow(c, mat);
  return c;
}
const tuvalBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));

async function fotoKucult(blob, maxSide = 2400) {
  const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
  const s = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  return tuvalBlob(c, "image/jpeg", 0.88);
}

async function kelimeler(tuval) {
  const big = document.createElement("canvas");
  big.width = Math.round(tuval.width * OCR_SCALE);
  big.height = Math.round(tuval.height * OCR_SCALE);
  const g = big.getContext("2d");
  g.imageSmoothingQuality = "high";
  g.drawImage(tuval, 0, 0, big.width, big.height);
  const r = await (await ocrMotoru()).recognize(big, {}, { blocks: true });
  const k = 1 / OCR_SCALE;
  const out = [];
  for (const b of r.data.blocks || [])
    for (const p of b.paragraphs)
      for (const l of p.lines)
        for (const wd of l.words) out.push({ text: wd.text, conf: wd.confidence, x0: wd.bbox.x0 * k, y0: wd.bbox.y0 * k, x1: wd.bbox.x1 * k, y1: wd.bbox.y1 * k });
  return out;
}

/** Boş sayfa fotoğrafı → şablon + sorular ve şık kutuları. */
async function bosSayfaOku(foto) {
  await cvHazir;
  const gray = await griMat(foto, { width: PAGE_WIDTH });
  const { tuval, W, H } = scope((keep) => {
    keep(gray);
    const flat = keep(duzle(gray, keep));
    return { tuval: matTuval(flat), W: flat.cols, H: flat.rows };
  });
  const words = await kelimeler(tuval);
  const sorular = detectQuestions(words, W, H);
  const iyi = words.filter((w) => w.conf > 30 && w.text.trim().length > 1);
  const ustY = Math.min(...iyi.map((w) => w.y0));
  const baslik = iyi.filter((w) => w.y0 < ustY + 25).sort((a, b) => a.x0 - b.x0).map((w) => w.text).join(" ").slice(0, 120);
  return { sablon: await tuvalBlob(tuval, "image/png"), genislik: W, yukseklik: H, sorular, baslik };
}

function ozellikler(img, keep) {
  const orb = keep(new cv.ORB(4000));
  const kp = keep(new cv.KeyPointVector());
  const des = keep(new cv.Mat());
  orb.detectAndCompute(img, keep(new cv.Mat()), kp, des);
  return { kp, des };
}
/** Fotoğrafı şablona oturtan dönüşüm; inliers = resim benzerliği (ortak nokta sayısı). */
function oturt(tmpl, stud, keep) {
  const a = ozellikler(tmpl, keep);
  const b = ozellikler(stud, keep);
  if (a.des.rows < 10 || b.des.rows < 10) return null;
  const bf = keep(new cv.BFMatcher(cv.NORM_HAMMING, false));
  const knn = keep(new cv.DMatchVectorVector());
  bf.knnMatch(b.des, a.des, knn, 2);
  const src = [];
  const dst = [];
  for (let i = 0; i < knn.size(); i++) {
    const m = knn.get(i);
    if (m.size() < 2) continue;
    const m0 = m.get(0);
    if (m0.distance < 0.75 * m.get(1).distance) {
      const p = b.kp.get(m0.queryIdx).pt;
      const q = a.kp.get(m0.trainIdx).pt;
      src.push(p.x, p.y);
      dst.push(q.x, q.y);
    }
  }
  const n = src.length / 2;
  if (n < 12) return { H: null, inliers: 0 };
  const mask = keep(new cv.Mat());
  const H = cv.findHomography(keep(cv.matFromArray(n, 1, cv.CV_32FC2, src)), keep(cv.matFromArray(n, 1, cv.CV_32FC2, dst)), cv.RANSAC, 4, mask);
  if (H.empty()) {
    H.delete();
    return { H: null, inliers: 0 };
  }
  return { H: keep(H), inliers: cv.countNonZero(mask) };
}

async function enBenzerSayfa(foto, sayfalar) {
  await cvHazir;
  const img = await griMat(foto, { width: PAGE_WIDTH });
  let best = { id: null, puan: 0 };
  for (const p of sayfalar) {
    const tm = await griMat(p.sablon, { width: PAGE_WIDTH });
    scope((keep) => {
      keep(tm);
      const h = oturt(tm, img, keep);
      if (h?.inliers > best.puan) best = { id: p.id, puan: h.inliers };
    });
  }
  img.delete();
  return best;
}

const alan = (r) => (r.x1 - r.x0) * (r.y1 - r.y0);
function murekkep(ink, r) {
  const x0 = Math.max(0, Math.min(ink.cols - 1, r.x0));
  const y0 = Math.max(0, Math.min(ink.rows - 1, r.y0));
  const x1 = Math.max(x0 + 1, Math.min(ink.cols, r.x1));
  const y1 = Math.max(y0 + 1, Math.min(ink.rows, r.y1));
  const roi = ink.roi(new cv.Rect(x0, y0, x1 - x0, y1 - y0));
  const n = cv.countNonZero(roi);
  roi.delete();
  return n;
}

/** Öğrenci fotoğrafını ödevin boş sayfalarından birine oturtur, el yazısını ayırır, cevapları okur. */
async function ogrenciSayfasiOku(foto, sayfalar) {
  await cvHazir;
  const studGray = await griMat(foto, { maxSide: STUDENT_MAX_SIDE });
  const tmpls = [];
  for (const p of sayfalar) tmpls.push(await griMat(p.sablon, { width: PAGE_WIDTH }));
  const r = scope((keep) => {
    keep(studGray);
    tmpls.forEach(keep);
    const stud = keep(duzle(studGray, keep));
    let best = null;
    sayfalar.forEach((p, i) => {
      const h = oturt(tmpls[i], stud, keep);
      if (h?.H && (!best || h.inliers > best.h.inliers)) best = { p, h, tmpl: tmpls[i] };
    });
    if (!best || best.h.inliers < T.minPageMatch) return { eslesti: false };
    const { p, h, tmpl } = best;
    const size = new cv.Size(tmpl.cols, tmpl.rows);
    const warped = keep(new cv.Mat());
    cv.warpPerspective(stud, warped, h.H, size, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255));
    const valid = keep(new cv.Mat());
    cv.warpPerspective(keep(new cv.Mat(stud.rows, stud.cols, cv.CV_8UC1, new cv.Scalar(255))), valid, h.H, size, cv.INTER_NEAREST, cv.BORDER_CONSTANT, new cv.Scalar(0));
    cv.erode(valid, valid, keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9))));
    // El yazısı = öğrenci sayfasında olup boş sayfada olmayan koyu izler.
    const tmin = keep(new cv.Mat());
    cv.erode(tmpl, tmin, keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(T.printTolerancePx, T.printTolerancePx))));
    const diff = keep(new cv.Mat());
    cv.subtract(tmin, warped, diff);
    const ink = keep(new cv.Mat());
    cv.threshold(diff, ink, T.inkDarkness, 255, cv.THRESH_BINARY);
    cv.bitwise_and(ink, valid, ink);
    cv.morphologyEx(ink, ink, cv.MORPH_OPEN, keep(cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2))));
    const sayfaMurekkep = cv.countNonZero(ink) / (ink.rows * ink.cols);

    // Yapay zekâ için: her şıkkın görüntüsü ve yazılı cevap alanlarındaki rakamlar.
    const yzVeri = window.YapayZeka
      ? p.sorular.map((q) =>
          q.tip === "yazili"
            ? { no: q.no, kelime: kelimeSorusu(q), parcalar: (kelimeSorusu(q) ? YapayZeka.harfleriBul : YapayZeka.rakamlariBul)(ink.data, ink.cols, ink.rows, q.bolge) }
            : { no: q.no, kirp: Object.fromEntries(q.siklar.map((o) => [o.letter, YapayZeka.isaretKirp(ink.data, ink.cols, ink.rows, o.box)])) }
        )
      : [];
    const cevaplar = p.sorular.map((q) => {
      if (q.tip === "yazili") return { no: q.no, tip: "yazili", okunan: "", guven: 0, parcalar: [] };
      const opt = q.siklar.map((o) => {
        const n = murekkep(ink, o.box);
        // İz, şık harfinin boyuna göre sabit bir alana oranlanır (uzun şık metni oranı düşürmesin; tik de okunsun).
        const h = o.box.y1 - o.box.y0;
        return { harf: o.letter, n, oran: n / (h * h * 2.5) };
      });
      const [bir, iki] = [...opt].sort((a, b) => b.oran - a.oran);
      const toplam = opt.reduce((s, o) => s + o.n, 0);
      let durum = "none";
      let isaret = null;
      if (bir && bir.oran >= T.markMinRatio) {
        if (iki && iki.oran >= T.markMultiMin && iki.oran > bir.oran * T.markRivalRatio) durum = "multi";
        else {
          durum = "ok";
          isaret = bir.harf;
        }
      }
      // Soru alanının üstünde aynı sütunda yazılı cevap sorusu varsa, onun alanı ve üstü bu sorudan sayılmaz.
      const bolge = { ...q.bolge };
      const sikUst = Math.min(...q.siklar.map((o) => o.box.y0));
      for (const y of p.sorular.filter((x) => x.tip === "yazili")) {
        const yatayOrtak = Math.min(y.bolge.x1, bolge.x1) - Math.max(y.bolge.x0, bolge.x0);
        if (yatayOrtak > 0 && y.bolge.y1 <= sikUst && y.bolge.y1 > bolge.y0) bolge.y0 = y.bolge.y1 + 4;
      }
      const bolgeAlani = alan(bolge) - q.siklar.reduce((s, o) => s + alan(o.box), 0);
      const islemOrani = Math.max(0, murekkep(ink, bolge) - toplam) / Math.max(1, bolgeAlani);
      return {
        no: q.no,
        isaret,
        durum,
        pay: toplam ? (bir?.n ?? 0) / toplam : 0,
        oranlar: Object.fromEntries(opt.map((o) => [o.harf, Math.round(o.oran * 1000) / 1000])),
        islemOrani,
        islem: islemOrani >= T.workMinRatio,
      };
    });
    // Görsel: oturtulmuş sayfa, el yazısı maviye boyalı.
    const rgba = keep(new cv.Mat());
    cv.cvtColor(warped, rgba, cv.COLOR_GRAY2RGBA);
    const d = rgba.data;
    const m = ink.data;
    for (let i = 0; i < m.length; i++)
      if (m[i]) {
        d[i * 4] = 20;
        d[i * 4 + 1] = 90;
        d[i * 4 + 2] = 230;
      }
    return { eslesti: true, sayfaId: p.id, puan: h.inliers, sayfaMurekkep, cevaplar, yzVeri, sorular: p.sorular, tuval: matTuval(rgba) };
  });
  if (r.eslesti) {
    r.kaplama = await tuvalBlob(r.tuval, "image/jpeg", 0.8);
    await yzOku(r);
  }
  delete r.tuval;
  return r;
}

// ---------------------------------------------------------------------------
// YAPAY ZEKÂ: sinir ağları (YapayZeka klasörü). Okur, öğretmen düzelttikçe kendini eğitir.
// ---------------------------------------------------------------------------
const YZ = { isaret: null, rakam: null, harf: null, bilgi: null, hazir: false, egitimde: false, ilerleme: "", hata: null };
const AG_ADI = { isaret: "İşaret", rakam: "Rakam", harf: "Harf" };
const yzVar = () => !!(window.YapayZeka && window.tf && window.YZ_BASLANGIC);

/** Kayıtlı modeli (yoksa başlangıç modelini) yükler. */
async function yzYukle() {
  if (!yzVar()) return;
  try {
    const kayit = await DB.req("kv", "readonly", (st) => st.get("yzModel"));
    const kaynak = kayit?.isaret ? kayit : window.YZ_BASLANGIC;
    YZ.isaret?.dispose?.();
    YZ.rakam?.dispose?.();
    YZ.harf?.dispose?.();
    YZ.isaret = await YapayZeka.modelAc(kaynak.isaret);
    YZ.rakam = await YapayZeka.modelAc(kaynak.rakam);
    // Harf ağı sonradan eklendi: eski kayıtlarda yoksa başlangıç modelindeki kullanılır.
    const harfKaynak = kaynak.harf || window.YZ_BASLANGIC.harf;
    YZ.harf = harfKaynak ? await YapayZeka.modelAc(harfKaynak) : null;
    YZ.bilgi = kayit?.isaret ? kayit : { surum: 0, gecmis: [], baslangic: true };
    YZ.hazir = true;
    YZ.hata = null;
  } catch (e) {
    console.error(e);
    YZ.hata = e.message;
  }
  motorDurumu();
}
async function yzKaydet(isaretAgi, rakamAgi, harfAgi, gecmisEk) {
  const eski = YZ.bilgi?.baslangic ? { gecmis: [] } : YZ.bilgi || { gecmis: [] };
  const kayit = {
    surum: (eski.surum || 0) + 1,
    tarih: simdi(),
    isaret: await YapayZeka.modelPaketle(isaretAgi),
    rakam: await YapayZeka.modelPaketle(rakamAgi),
    harf: harfAgi ? await YapayZeka.modelPaketle(harfAgi) : null,
    gecmis: [...(eski.gecmis || []), ...(gecmisEk ? [gecmisEk] : [])],
    sonDuzeltmeSayisi: list("yzOrnekler", (o) => o.kaynak === "ogretmen").length,
  };
  await DB.req("kv", "readwrite", (st) => st.put(kayit, "yzModel"));
  YZ.bilgi = kayit;
}

/** Okunan sayfaya sinir ağlarının görüşünü ekler. */
async function yzOku(r) {
  if (!YZ.hazir || !r.yzVeri?.length) return;
  for (const v of r.yzVeri) {
    const c = r.cevaplar.find((x) => x.no === v.no);
    if (!c) continue;
    if (v.parcalar && v.kelime) {
      // Kelime cevabı: harf ağı okur, doğru cevaba benzerliği hesaplanır.
      if (!YZ.harf) continue;
      const q = r.sorular?.find((x) => x.no === v.no);
      const o = await YapayZeka.kelimeOku(YZ.harf, v.parcalar, q?.dogruCevap || "");
      Object.assign(c, { tur: "kelime", parcalar: o.harfler, okunan: o.metin, guven: o.guven, benzerlik: o.benzerlik, islem: !!o.harfler.length });
    } else if (v.parcalar) {
      // Sayı cevabı: her parçayı rakam ağı okur.
      const o = await YapayZeka.sayiOku(YZ.rakam, v.parcalar);
      c.parcalar = o.rakamlar;
      c.okunan = o.metin;
      c.guven = o.guven;
      c.islem = !!o.rakamlar.length;
    } else {
      const harfler = Object.keys(v.kirp);
      const p = await YapayZeka.isaretTahmin(YZ.isaret, harfler.map((h) => v.kirp[h]));
      c.kirp = v.kirp;
      c.yz = Object.fromEntries(harfler.map((h, i) => [h, Math.round(p[i] * 1000) / 1000]));
      c.kural = { durum: c.durum, isaret: c.isaret };
      if (A.yzKullan) {
        // İki yöntem (sinir ağı ve eşik kuralı) aynı şeyi okursa kesin; farklıysa öğretmen baksın.
        const isaretli = harfler.filter((h) => c.yz[h] >= 0.5);
        const yzDurum = isaretli.length === 0 ? "none" : isaretli.length === 1 ? "ok" : "multi";
        const yzIsaret = isaretli.length === 1 ? isaretli[0] : null;
        c.okuyan = "yz";
        if (yzDurum === c.kural.durum && yzIsaret === c.kural.isaret) {
          if (yzIsaret) c.pay = c.yz[yzIsaret];
        } else {
          c.durum = "farkli";
          c.isaret = null;
          c.yzOkuma = { durum: yzDurum, isaret: yzIsaret };
        }
      }
    }
  }
}

/** Kendi kendine öğrenme: ağ ve kural çok emin ve aynı fikirdeyse bu okumadan örnek çıkar. */
async function yzOtomatikOrnekler(g) {
  if (!A.yzKendiOgren || !YZ.hazir) return;
  for (const c of g.cevaplar) {
    if (!c.yz || !c.kural) continue;
    const eminYz = Object.values(c.yz).every((p) => p > 0.95 || p < 0.05);
    const ayni = c.kural.durum === c.durum && c.kural.isaret === c.isaret;
    if (!eminYz || !ayni || c.durum === "multi") continue;
    for (const [h, x] of Object.entries(c.kirp)) await DB.put("yzOrnekler", { tur: "isaret", x, y: c.yz[h] >= 0.5 ? 1 : 0, kaynak: "otomatik", gonderimId: g.id, no: c.no, tarih: simdi() });
  }
  // Otomatik örnekler sınırsız büyümesin: en yeni 3000 kalsın.
  const oto = list("yzOrnekler", (o) => o.kaynak === "otomatik").sort((a, b) => a.id - b.id);
  for (const o of oto.slice(0, Math.max(0, oto.length - 3000))) await DB.del("yzOrnekler", o.id);
}

/** Öğretmen düzeltmesi → eğitim örnekleri (aynı soru için eskileri silinir). */
async function yzDuzeltmeKaydet(g, c) {
  for (const o of list("yzOrnekler", (o) => o.gonderimId === g.id && o.no === c.no)) await DB.del("yzOrnekler", o.id);
  if (c.tip === "yazili" && c.tur === "kelime") {
    const yazi = YapayZeka.sadeKelime(c.duzeltmeYazi ?? "");
    if (c.duzeltmeYazi != null && yazi.length === c.parcalar.length)
      for (let i = 0; i < yazi.length; i++) await DB.put("yzOrnekler", { tur: "harf", x: c.parcalar[i].x, y: YapayZeka.harfSinifi(yazi[i]), kaynak: "ogretmen", gonderimId: g.id, no: c.no, tarih: simdi() });
  } else if (c.tip === "yazili") {
    const yazi = String(c.duzeltmeYazi ?? "").replace(/\D/g, "");
    if (c.duzeltmeYazi != null && yazi.length === c.parcalar.length)
      for (let i = 0; i < yazi.length; i++) await DB.put("yzOrnekler", { tur: "rakam", x: c.parcalar[i].x, y: +yazi[i], kaynak: "ogretmen", gonderimId: g.id, no: c.no, tarih: simdi() });
  } else if (c.duzeltme && c.kirp) {
    for (const [h, x] of Object.entries(c.kirp)) await DB.put("yzOrnekler", { tur: "isaret", x, y: h === c.duzeltme ? 1 : 0, kaynak: "ogretmen", gonderimId: g.id, no: c.no, tarih: simdi() });
  }
  const yeni = list("yzOrnekler", (o) => o.kaynak === "ogretmen").length - (YZ.bilgi?.sonDuzeltmeSayisi || 0);
  if (A.yzOtoEgit > 0 && yeni >= A.yzOtoEgit) yzEgit("otomatik");
}

/** Ağları öğretmenin düzeltmeleriyle (ve emin okumalarla) yeniden eğitir. Kötüleşirse eskisini korur. */
async function yzEgit(neden = "elle") {
  if (!YZ.hazir || YZ.egitimde) return;
  YZ.egitimde = true;
  YZ.ilerleme = "Hazırlanıyor…";
  yenidenCiz();
  const sonuc = { tarih: simdi(), neden, turler: {} };
  try {
    const yeniAglar = {};
    for (const tur of ["isaret", "rakam", "harf"]) {
      const eski = YZ[tur];
      if (!eski) continue;
      const ogretmen = list("yzOrnekler", (o) => o.tur === tur && o.kaynak === "ogretmen").sort(() => Math.random() - 0.5);
      const otomatik = list("yzOrnekler", (o) => o.tur === tur && o.kaynak === "otomatik");
      if (!ogretmen.length && !otomatik.length) {
        yeniAglar[tur] = eski;
        continue;
      }
      const sinamaSayisi = ogretmen.length >= 10 ? Math.ceil(ogretmen.length * 0.2) : 0;
      const sinama = ogretmen.slice(0, sinamaSayisi);
      const tekrar = (window.YZ_BASLANGIC.tekrar[tur] || []).map(([x, y]) => ({ x: YapayZeka.b64.oku(x), y }));
      const egitim = [...ogretmen.slice(sinamaSayisi).map((o) => ({ ...o, agirlik: 3 })), ...otomatik, ...tekrar];
      const yeni = await YapayZeka.modelAc(await YapayZeka.modelPaketle(eski));
      const once = { sinama: await YapayZeka.dogruluk(eski, tur, sinama), tekrar: await YapayZeka.dogruluk(eski, tur, tekrar) };
      await YapayZeka.egit(yeni, tur, egitim, {
        epoch: 6,
        ogrenmeOrani: 0.0005,
        ilerleme: async (e, n) => {
          YZ.ilerleme = `${AG_ADI[tur]} ağı eğitiliyor: ${e}/${n}`;
          motorDurumu();
          if (G.tab === "yz") yenidenCiz();
          await new Promise((r) => setTimeout(r, 0));
        },
      });
      const sonra = { sinama: await YapayZeka.dogruluk(yeni, tur, sinama), tekrar: await YapayZeka.dogruluk(yeni, tur, tekrar) };
      // Koruma: ayrılan öğretmen örneklerinde kötüleşirse ya da eski bilgisini unutursa kabul etme.
      const kabul = (sonra.sinama == null || sonra.sinama >= once.sinama) && sonra.tekrar >= once.tekrar - 0.03;
      sonuc.turler[tur] = { ogretmen: ogretmen.length, otomatik: otomatik.length, once, sonra, kabul };
      if (kabul) yeniAglar[tur] = yeni;
      else {
        yeni.dispose();
        yeniAglar[tur] = eski;
      }
    }
    const degisti = Object.values(sonuc.turler).some((t) => t.kabul);
    sonuc.kabul = degisti;
    for (const tur of ["isaret", "rakam", "harf"]) if (!yeniAglar[tur]) yeniAglar[tur] = YZ[tur];
    await yzKaydet(yeniAglar.isaret, yeniAglar.rakam, yeniAglar.harf, sonuc);
    for (const tur of ["isaret", "rakam", "harf"]) if (yeniAglar[tur] && yeniAglar[tur] !== YZ[tur]) { YZ[tur].dispose(); YZ[tur] = yeniAglar[tur]; }
    const ozet = Object.entries(sonuc.turler).map(([t, v]) => `${AG_ADI[t]} ağı: ${v.kabul ? "güncellendi" : "eskisi korundu (yeni eğitim daha iyi değildi)"}${v.sonra.sinama != null ? `, sınama %${Math.round(v.once.sinama * 100)} → %${Math.round(v.sonra.sinama * 100)}` : ""}`);
    sonucKarti(true, Object.keys(sonuc.turler).length ? "Yapay zekâ eğitildi" : "Eğitilecek örnek yok", ozet.length ? ozet : ["Önce sonuç ekranında birkaç okumayı düzeltin."]);
  } catch (e) {
    console.error(e);
    sonucKarti(false, "Yapay zekâ eğitilemedi", [e.message]);
  } finally {
    YZ.egitimde = false;
    YZ.ilerleme = "";
    yenidenCiz();
  }
}

/** Eğitimi (ağların öğrendikleri + eğitim örnekleri) tek dosyaya kaydeder. */
async function yzDisaAktar() {
  const kayit = (await DB.req("kv", "readonly", (st) => st.get("yzModel"))) || null;
  const veri = {
    program: "odev-kontrol-yapay-zeka",
    surum: 1,
    tarih: simdi(),
    model: kayit, // null: henüz eğitilmedi (başlangıç modeli kullanılıyor)
    ornekler: list("yzOrnekler").map((o) => ({ tur: o.tur, x: YapayZeka.b64.yaz(o.x), y: o.y, kaynak: o.kaynak, tarih: o.tarih })),
  };
  indir(new Blob([JSON.stringify(veri)], { type: "application/json" }), `OdevKontrol_YapayZeka_${new Date().toISOString().slice(0, 10)}.json`);
}
async function yzIceAktar(dosya) {
  const veri = JSON.parse(await dosya.text());
  if (veri.program !== "odev-kontrol-yapay-zeka") throw new Error("Bu dosya bir Ödev Kontrol yapay zekâ yedeği değil.");
  if (veri.model) await YapayZeka.modelAc(veri.model.isaret); // bozuk dosyayı yüklemeden önce yakala
  for (const o of list("yzOrnekler")) await DB.del("yzOrnekler", o.id);
  for (const o of veri.ornekler || []) await DB.put("yzOrnekler", { ...o, x: YapayZeka.b64.oku(o.x) });
  if (veri.model) await DB.req("kv", "readwrite", (st) => st.put(veri.model, "yzModel"));
  else await DB.req("kv", "readwrite", (st) => st.delete("yzModel"));
  await yzYukle();
  return { ornek: (veri.ornekler || []).length, surum: veri.model?.surum || 0 };
}
async function yzBaslangicaDon() {
  await DB.req("kv", "readwrite", (st) => st.delete("yzModel"));
  await yzYukle();
}

// ---------------------------------------------------------------------------
// İş sırası: fotoğraflar sırayla işlenir
// ---------------------------------------------------------------------------
let sira = Promise.resolve();
let sirada = 0;
function siraya(fn) {
  sirada++;
  motorDurumu();
  const p = sira.then(fn, fn).finally(() => {
    sirada--;
    motorDurumu();
    yenidenCiz();
  });
  sira = p.catch(() => {});
  return p;
}

async function sayfaIsle(sayfa) {
  try {
    const havuz = sayfa.ornek ? [] : list("sayfalar", (p) => p.id !== sayfa.id && p.durum === "hazir" && !p.ornek);
    if (havuz.length) {
      const m = await enBenzerSayfa(sayfa.foto, havuz);
      if (m.id && m.puan >= T.samePageMatch) {
        await DB.del("sayfalar", sayfa.id);
        return m.id;
      }
    }
    const t = await bosSayfaOku(sayfa.foto);
    Object.assign(sayfa, {
      sablon: t.sablon,
      genislik: t.genislik,
      yukseklik: t.yukseklik,
      durum: "hazir",
      baslik: sayfa.baslik || t.baslik || "Adsız sayfa",
      sorular: t.sorular.map((q) => ({ no: q.number, tahmin: !!q.numberGuessed, bolge: q.region, siklar: q.options, anahtar: null, kazanimKod: "", konu: "" })),
      hata: t.sorular.length ? null : "Sayfada şık (A, B, C, D) bulunamadı. Sayfayı düz, gölgesiz ve yakından tekrar çekin.",
    });
    delete sayfa.foto;
    await DB.put("sayfalar", sayfa);
    return sayfa.id;
  } catch (e) {
    console.error(e);
    sayfa.durum = "hata";
    sayfa.hata = String(e.message || e);
    await DB.put("sayfalar", sayfa);
    return sayfa.id;
  }
}

async function gonderimIsle(g) {
  try {
    g.durum = "isleniyor";
    yenidenCiz();
    const odev = D.odevler.get(g.odevId);
    const sayfalar = (odev?.sayfaIds || []).map((id) => D.sayfalar.get(id)).filter((p) => p?.durum === "hazir");
    if (!sayfalar.length) throw new Error("Bu ödeve henüz boş sayfa eklenmemiş.");
    const r = await ogrenciSayfasiOku(g.foto, sayfalar);
    if (!r.eslesti) throw new Error("Fotoğraf bu ödevin sayfalarına benzemiyor. Doğru sayfa mı? Bütün sayfa görünüyor mu?");
    Object.assign(g, { durum: "bitti", hata: null, sayfaId: r.sayfaId, kaplama: r.kaplama, eslesme: r.puan, murekkep: r.sayfaMurekkep, yazili: r.sayfaMurekkep >= T.pageMinInk || r.cevaplar.some((c) => (c.tip === "yazili" ? c.parcalar.length : c.durum !== "none")), cevaplar: r.cevaplar });
    await yzOtomatikOrnekler(g);
  } catch (e) {
    console.error(e);
    g.durum = "hata";
    g.hata = String(e.message || e);
  }
  await DB.put("gonderimler", g);
}

async function parmakIzi(blob) {
  const b = new Uint8Array(await blob.arrayBuffer());
  let h1 = 0x811c9dc5;
  let h2 = 0;
  for (let i = 0; i < b.length; i++) {
    h1 = Math.imul(h1 ^ b[i], 16777619);
    h2 = (h2 + b[i] * (i + 1)) | 0;
  }
  return `${b.length}-${(h1 >>> 0).toString(16)}-${(h2 >>> 0).toString(16)}`;
}

// ---------------------------------------------------------------------------
// Puanlama
// ---------------------------------------------------------------------------
/** Bir soruya öğrenci oyları {A: 3, C: 1} (her öğrenci bir kez). */
function oylar(sayfaId, no) {
  const by = {};
  const gordum = new Set();
  for (const g of list("gonderimler", (x) => x.sayfaId === sayfaId && x.durum === "bitti")) {
    const c0 = g.cevaplar.find((x) => x.no === no);
    const c = c0 && duzeltilmis(c0);
    if (!c || c.tip === "yazili" || c.durum !== "ok" || gordum.has(`${g.ogrenciId}:${c.isaret}`)) continue;
    gordum.add(`${g.ogrenciId}:${c.isaret}`);
    by[c.isaret] = (by[c.isaret] || 0) + 1;
  }
  return by;
}
/** Anahtar: önce öğretmenin girdiği, yoksa öğrenci çoğunluğu. */
function anahtar(sayfa, q) {
  if (q.anahtar) return { harf: q.anahtar, kaynak: "ogretmen" };
  const v = oylar(sayfa.id, q.no);
  const top = Object.values(v).reduce((a, b) => a + b, 0);
  const [harf, n] = Object.entries(v).sort((a, b) => b[1] - a[1])[0] || [];
  if (top >= A.cogunlukOgrenci && n / top >= A.cogunlukOran / 100) return { harf, kaynak: "cogunluk" };
  return { harf: null, kaynak: null };
}
/** Doğru cevabında harf varsa kelime sorusudur (harf ağı okur), yoksa sayı sorusu (rakam ağı). */
const kelimeSorusu = (q) => /[a-zçğıöşüA-ZÇĞİÖŞÜ]/.test(q?.dogruCevap || "");

/** Öğretmenin "öğrenci aslında şunu işaretledi / yazdı" düzeltmesini uygular. */
function duzeltilmis(c) {
  if (c.tip === "yazili") return c.duzeltmeYazi != null ? { ...c, okunan: c.duzeltmeYazi, guven: 1 } : c;
  if (!c.duzeltme) return c;
  return c.duzeltme === "yok" ? { ...c, durum: "none", isaret: null } : { ...c, durum: "ok", isaret: c.duzeltme };
}
const sadeCevap = (s) => String(s ?? "").replace(/\s+/g, "").replace(/,/g, ".").toLocaleLowerCase("tr-TR");
function karar(c, k, q) {
  if (c.karar) return { sonuc: c.karar, neden: "Öğretmen kararı." };
  if (c.tip === "yazili" && kelimeSorusu(q)) {
    if (!c.okunan) return { sonuc: "bos", neden: "Cevap yazılmamış." };
    if (c.duzeltmeYazi != null)
      return YapayZeka.sadeKelime(c.duzeltmeYazi) === YapayZeka.sadeKelime(q.dogruCevap) ? { sonuc: "dogru", neden: `"${c.duzeltmeYazi}" yazılmış.` } : { sonuc: "yanlis", neden: `"${c.duzeltmeYazi}" yazılmış, doğrusu ${q.dogruCevap}.` };
    const b = Math.round((c.benzerlik ?? 0) * 100);
    if (b >= 80) return { sonuc: "dogru", neden: `"${c.okunan}" okundu; doğru cevaba benzerlik %${b}.` };
    if (b >= 50) return { sonuc: "kontrol", neden: `"${c.okunan}" okundu; doğru cevaba benzerlik %${b}, öğretmen baksın.` };
    // Harflerin çoğu bulunamadıysa (ör. bitişik yazı) yanlış demek yerine öğretmene bırak.
    const harfSayisi = [...YapayZeka.sadeKelime(c.okunan)].length, beklenen = [...YapayZeka.sadeKelime(q.dogruCevap)].length;
    if (harfSayisi < beklenen * 0.6) return { sonuc: "kontrol", neden: `"${c.okunan}" okundu; harflerin bir kısmı okunamadı, öğretmen baksın.` };
    return { sonuc: "yanlis", neden: `"${c.okunan}" okundu; doğru cevaba benzerlik %${b}.` };
  }
  if (c.tip === "yazili") {
    if (!c.okunan) return { sonuc: "bos", neden: "Cevap yazılmamış." };
    if (!q?.dogruCevap) return { sonuc: "anahtaryok", neden: "Doğru cevap girilmemiş." };
    if (c.guven < 0.6) return { sonuc: "kontrol", neden: `El yazısı tam okunamadı ("${c.okunan}" okundu).` };
    return sadeCevap(c.okunan) === sadeCevap(q.dogruCevap)
      ? { sonuc: "dogru", neden: `"${c.okunan}" yazılmış.` }
      : { sonuc: "yanlis", neden: `"${c.okunan}" yazılmış, doğrusu ${q.dogruCevap}.` };
  }
  if (c.durum === "multi") return { sonuc: "kontrol", neden: "Birden fazla şık işaretlenmiş gibi görünüyor." };
  if (c.durum === "farkli") {
    const yaz = (d, h) => (d === "ok" ? h : d === "none" ? "işaretsiz" : "birden fazla");
    return { sonuc: "kontrol", neden: `Yapay zekâ "${yaz(c.yzOkuma.durum, c.yzOkuma.isaret)}", kural "${yaz(c.kural.durum, c.kural.isaret)}" okudu.` };
  }
  if (c.durum === "none") return c.islem ? { sonuc: "kontrol", neden: "İşlem yazılmış ama şık işaretlenmemiş." } : { sonuc: "bos", neden: "Boş bırakılmış." };
  if (!k.harf) return { sonuc: "anahtaryok", neden: "Cevap anahtarı yok." };
  if (c.isaret === k.harf) return { sonuc: "dogru", neden: c.islem ? "Doğru." : "Doğru ama işlem görünmüyor.", islemsiz: !c.islem };
  return { sonuc: "yanlis", neden: `${c.isaret} işaretlenmiş, doğrusu ${k.harf}.` };
}
const SONUC = { dogru: "Doğru", yanlis: "Yanlış", bos: "Boş", kontrol: "Öğretmen baksın", anahtaryok: "Anahtar yok" };
const SONUC_RENK = { dogru: "green", yanlis: "red", bos: "gray", kontrol: "orange", anahtaryok: "orange" };
const sonucCip = (s) => `<span class="chip ${SONUC_RENK[s]}">${SONUC[s]}</span>`;

/** Bir gönderimin cevapları, güncel anahtara göre kararlarıyla. */
function degerlendir(g) {
  const p = D.sayfalar.get(g.sayfaId);
  if (!p || g.durum !== "bitti") return [];
  return g.cevaplar.map((c0) => {
    const c = duzeltilmis(c0);
    const q = p.sorular.find((x) => x.no === c.no) || { siklar: [] };
    const k = q.tip === "yazili" ? { harf: q.dogruCevap || null, kaynak: "ogretmen" } : anahtar(p, q);
    return { ...c, q, sayfa: p, ogrenciId: g.ogrenciId, anahtarHarf: k.harf, anahtarKaynak: k.kaynak, ...karar(c, k, q) };
  });
}
function say(satirlar) {
  const c = { n: satirlar.length, dogru: 0, yanlis: 0, bos: 0, kontrol: 0, anahtaryok: 0, islemsiz: 0 };
  for (const r of satirlar) {
    c[r.sonuc]++;
    if (r.islemsiz) c.islemsiz++;
  }
  return c;
}
/** Kazanımı koduyla bulur; örnek sayfalar örnek kazanımları, kendi sayfaların kendi kazanımlarını önce dener. */
const kazanimBul = (kod, ornek = false) => {
  if (!kod) return null;
  const hepsi = list("kazanimlar", (k) => k.kod === kod);
  return hepsi.find((k) => !!k.ornek === !!ornek) || hepsi[0] || null;
};
const PUAN = { dogru: 1, yanlis: 0, bos: 0 };
/** Kazanım (yoksa konu) bazında başarı. */
function kazanimOzeti(satirlar) {
  const map = new Map();
  for (const r of satirlar) {
    if (!(r.sonuc in PUAN)) continue;
    const kz = kazanimBul(r.q.kazanimKod, r.sayfa.ornek);
    const anahtarAd = r.q.kazanimKod || r.q.konu || "Kazanım girilmemiş";
    const o = map.get(anahtarAd) || { anahtarAd, kod: r.q.kazanimKod, metin: kz?.metin || "", konu: r.q.konu || kz?.konu || "", ders: kz?.ders || r.sayfa.ders || "", soru: 0, puan: 0, dogru: 0, yanlis: 0, bos: 0, ogr: new Map() };
    o.soru++;
    o.puan += PUAN[r.sonuc];
    o[r.sonuc]++;
    const p = o.ogr.get(r.ogrenciId) || { n: 0, s: 0 };
    p.n++;
    p.s += PUAN[r.sonuc];
    o.ogr.set(r.ogrenciId, p);
    map.set(anahtarAd, o);
  }
  return [...map.values()]
    .map((o) => {
      const oran = o.puan / o.soru;
      const eksikOgr = [...o.ogr.entries()].filter(([, p]) => p.n >= A.eksikEnAzSoru && (p.s / p.n) * 100 < A.eksikSiniri).map(([id]) => id);
      return { ...o, oran: Math.round(oran * 100), eksik: o.soru >= A.eksikEnAzSoru && oran * 100 < A.eksikSiniri, eksikOgr };
    })
    .sort((a, b) => a.oran - b.oran);
}
const ogrenciSatirlari = (id) => list("gonderimler", (g) => g.ogrenciId === id).flatMap(degerlendir);

const DURUM = { yapti: "Yaptı", eksik: "Eksik sayfa", gec: "Geç teslim", yapmadi: "Yapmadı", bos: "Boş sayfa", isleniyor: "Okunuyor" };
const DURUM_RENK = { yapti: "green", eksik: "orange", gec: "orange", yapmadi: "red", bos: "red", isleniyor: "gray" };
const durumCip = (s) => `<span class="chip ${DURUM_RENK[s]}">${DURUM[s]}</span>`;
function odevDurumu(odev, ogrId) {
  const gs = list("gonderimler", (g) => g.odevId === odev.id && g.ogrenciId === ogrId).sort((a, b) => a.tarih.localeCompare(b.tarih));
  const bitti = gs.filter((g) => g.durum === "bitti");
  const sayfa = new Set(bitti.map((g) => g.sayfaId)).size;
  let durum = "yapmadi";
  if (gs.some((g) => g.durum === "bekliyor" || g.durum === "isleniyor")) durum = "isleniyor";
  else if (bitti.length && bitti.every((g) => !g.yazili)) durum = "bos";
  else if (bitti.length) {
    const gec = odev.sonTarih && bitti[0].tarih.slice(0, 10) > odev.sonTarih;
    durum = gec ? "gec" : odev.sayfaIds.length && sayfa < odev.sayfaIds.length ? "eksik" : "yapti";
  }
  return { durum, sayfa, gs, kopya: gs.some((g) => g.kopyaId), ...say(bitti.flatMap(degerlendir)) };
}

// ---------------------------------------------------------------------------
// ÖRNEK VERİLER: "Örnek verilerle dene" (Teknoloji ve Tasarım 8. sınıf).
// Örnek kayıtlar "ornek: true" ile işaretlenir; kendi verilerinle karışmaz ve tek tıkla silinir.
// Fotoğraflar programın içindeki gerçek okuma motoruyla okunur (vendor/ornek-veri.js).
// ---------------------------------------------------------------------------
const ornekVar = () => STORES.some((s) => list(s, (x) => x.ornek).length);
let ornekYukleniyor = false;
async function ornekVeriYukle() {
  const V = window.ORNEK_VERI;
  if (!V) return sonucKarti(false, "Örnek veriler bulunamadı", ["vendor klasöründeki ornek-veri.js dosyası eksik."]);
  if (ornekYukleniyor || excelMesgul) return toast("Önceki işlem bitmeden yenisi başlatılamaz.");
  ornekYukleniyor = true;
  ciz();
  try {
    await ornekVeriSil(true);
    const blob = (b64) => new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], { type: "image/jpeg" });
    const sinif = await DB.put("siniflar", { ad: "8-A", seviye: 8, ornek: true });
    const ogr = {};
    for (const [no, ad, soyad] of ORNEK_OGRENCI.slice(3)) ogr[no] = await DB.put("ogrenciler", { sinifId: sinif.id, no, ad, soyad, ornek: true });
    for (const [kod, ders, seviye, unite, konu, metin] of ORNEK_KAZANIM.slice(3)) await DB.put("kazanimlar", { kod, ders, seviye, unite, konu, metin, ornek: true });
    const sayfa = await DB.put("sayfalar", { baslik: "", ders: "Teknoloji ve Tasarım", durum: "isleniyor", foto: blob(V.bosSayfa), sorular: [], tarih: simdi(), ornek: true });
    const odev = await DB.put("odevler", { sinifId: sinif.id, baslik: "Fikrî Haklar – Test 1", ders: "Teknoloji ve Tasarım", sonTarih: null, sayfaIds: [sayfa.id], tarih: simdi(), ornek: true });
    await siraya(() => sayfaIsle(sayfa));
    if (sayfa.durum !== "hazir") throw new Error(sayfa.hata || "Örnek sayfa okunamadı.");
    for (const q of sayfa.sorular) {
      q.anahtar = V.anahtar[q.no - 1] || null;
      q.kazanimKod = V.kodlar[q.no - 1] || "";
      q.konu = kazanimBul(q.kazanimKod, true)?.konu || "";
    }
    await DB.put("sayfalar", sayfa);
    const isler = [];
    for (const f of V.fotolar) {
      const foto = blob(f.b64);
      const g = await DB.put("gonderimler", { ogrenciId: ogr[f.no].id, odevId: odev.id, foto, parmakIzi: await parmakIzi(foto), kopyaId: null, durum: "bekliyor", cevaplar: [], tarih: simdi(), dosyaAdi: f.dosya, ornek: true });
      isler.push(siraya(() => gonderimIsle(g)));
    }
    await Promise.all(isler);
    sonucKarti(true, "Örnek veriler yüklendi", [
      "8-A (örnek) sınıfı, 5 öğrenci, 5 kazanım ve \"Fikrî Haklar – Test 1\" ödevi eklendi.",
      "Boş sayfa ve 4 öğrenci fotoğrafı programın kendi motoruyla okundu.",
    ]);
    G.kontrol = { odevId: odev.id, gonderimId: null };
  } catch (e) {
    console.error(e);
    sonucKarti(false, "Örnek veriler yüklenemedi", [e.message]);
  } finally {
    ornekYukleniyor = false;
  }
  if (G.tab === "panel") git("kontrol");
  else ciz();
}
async function ornekVeriSil(sessiz = false) {
  for (const s of STORES) for (const x of list(s, (x) => x.ornek)) await DB.del(s, x.id);
  for (let i = kuyruk.length - 1; i >= 0; i--) if (!D.odevler.has(kuyruk[i].odevId)) kuyruk.splice(i, 1);
  if (!sessiz) {
    sonucKarti(true, "Örnek veriler kaldırıldı", ["Senin yüklediğin veriler silinmedi."]);
    ciz();
  }
}

// ---------------------------------------------------------------------------
// Ekran durumu ve sekmeler
// ---------------------------------------------------------------------------
const G = {
  tab: "panel",
  ogrenci: { sinifId: null, ara: "" },
  kazanim: { ders: "", ara: "" },
  odev: { id: null, sayfaId: null },
  kontrol: { odevId: null, gonderimId: null },
  analiz: { sinifId: null, ogrenciId: null },
  sinifanaliz: { sinifId: null },
};
const kuyruk = []; // yüklenmeyi bekleyen fotoğraflar: { odevId, dosya, adres, ogrenciId, gId }

function git(tab, durum) {
  G.tab = tab;
  if (durum) Object.assign(G[tab], durum);
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".tab").forEach((s) => s.classList.toggle("active", s.id === `tab-${tab}`));
  ciz();
  window.scrollTo(0, 0);
}
const EKRAN = {};
function ciz() {
  adresler.forEach((u) => URL.revokeObjectURL(u));
  adresler = [];
  const el = document.getElementById(`tab-${G.tab}`);
  try {
    EKRAN[G.tab](el);
  } catch (e) {
    console.error(e);
    el.innerHTML = `<div class="card uyari">⚠ ${esc(e.message)}</div>`;
  }
  motorDurumu();
}
// Arka planda iş bitince ekranı tazele (yazı yazılırken bölmeden).
let bekleyenCizim = false;
function yenidenCiz() {
  clearTimeout(yenidenCiz.t);
  yenidenCiz.t = setTimeout(() => {
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.type !== "file") return (bekleyenCizim = true);
    const y = window.scrollY;
    ciz();
    window.scrollTo(0, y);
  }, 250);
}
document.addEventListener("focusout", () => {
  if (bekleyenCizim) {
    bekleyenCizim = false;
    setTimeout(yenidenCiz, 50);
  }
});

function motorDurumu() {
  const el = document.getElementById("motor");
  if (!el) return;
  const yz = YZ.egitimde ? ` · <span class="spinner"></span> 🧠 ${esc(YZ.ilerleme)}` : YZ.hazir ? " · 🧠" : "";
  el.innerHTML = (sirada ? `<span class="spinner"></span> ${sirada} iş sırada` : cv ? "● Hazır" : `<span class="spinner"></span> Hazırlanıyor…`) + yz;
}

const sinifSecenekleri = (secili, bos = "Sınıf seçin") =>
  `<option value="">${bos}</option>` + list("siniflar").sort((a, b) => trSirala(a.ad, b.ad)).map((s) => `<option value="${s.id}" ${+secili === s.id ? "selected" : ""}>${esc(sinifAdi(s))}</option>`).join("");
const sinifOgrencileri = (sinifId) => list("ogrenciler", (o) => o.sinifId === sinifId).sort(ogrSirala);
const excelDugmesi = (id, yazi, sinif = "primary") =>
  `<label class="btn ${sinif}">${yazi}<input type="file" id="${id}" accept=".xlsx,.xls,.xlsm,.csv" multiple class="dosya-input"></label>`;
function excelBagla(el, id, tur) {
  el.querySelector(`#${id}`)?.addEventListener("change", (e) => {
    const f = [...e.target.files];
    e.target.value = "";
    if (f.length) excelleriYukle(f, tur);
  });
}

// ---------------------------------------------------------------------------
// ANA SAYFA
// ---------------------------------------------------------------------------
EKRAN.panel = (el) => {
  const nOgr = D.ogrenciler.size;
  const nKz = D.kazanimlar.size;
  const odevler = list("odevler").sort((a, b) => b.id - a.id);
  const anahtarli = odevler.some((o) => o.sayfaIds.some((id) => D.sayfalar.get(id)?.sorular?.some((q) => q.anahtar)));
  const kontrol = list("gonderimler", (g) => g.durum === "bitti").length;
  const tamam = (b) => (b ? `<span class="tamam">✓ Tamam</span>` : "");
  el.innerHTML = `
    <div class="hero"><div class="logo-buyuk" aria-hidden="true">✔</div><div>
      <h1>Ödev Kontrol</h1>
      <p>Öğrencilerin gönderdiği ödev fotoğraflarını yükle; program her sayfada işaretlenen şıkkı bulur, anahtarla karşılaştırır, ödevi yapan ve yapmayanları, eksik kazanımları gösterir. Her şey bu bilgisayarda, internetsiz çalışır.</p>
    </div></div>
    ${ornekYukleniyor
      ? `<div class="ornek-uyari"><span class="spinner"></span> Örnek veriler yükleniyor; boş sayfa ve 4 öğrenci fotoğrafı okunuyor… (yaklaşık 15 saniye)</div>`
      : !ornekVar()
        ? `<div class="card deneme"><div><h2>🎈 Önce bir denemek ister misin?</h2><p class="muted">Örnek bir sınıf (8-A), Teknoloji ve Tasarım kazanımları ve bir ödev yüklenir; 4 öğrencinin ödev fotoğrafı programın kendisi tarafından okunur. Örnekler “(örnek)” diye işaretlenir, senin verilerinle karışmaz; istediğin zaman tek tıkla silebilirsin.</p></div>
           <button class="btn fun" id="ornekYukle">✨ Örnek verilerle dene</button></div>`
        : `<div class="ornek-uyari">🧪 Örnek veriler yüklü. Kendi verilerini yüklesen de örnekler silinmez, karışmaz. <button class="btn small" id="ornekSil">Örnekleri kaldır</button></div>`}
    <div class="adimlar">
      <div class="adim"><div class="adim-no">1</div><h2>Öğrencileri yükle</h2><p>Öğrenci listesinin olduğu Excel'i seç (K12 listesi de olur).</p>${tamam(nOgr)}
        <div class="adim-btn">${excelDugmesi("pOgr", "📥 Excel seç")}<button class="btn" data-ornek="ogrenci">📄 Örnek Excel</button></div></div>
      <div class="adim"><div class="adim-no">2</div><h2>Kazanımları yükle</h2><p>K12'den aldığın kazanım listesini seç. İstersen bu adımı atlayabilirsin.</p>${tamam(nKz)}
        <div class="adim-btn">${excelDugmesi("pKz", "📥 Excel seç")}<button class="btn" data-ornek="kazanim">📄 Örnek Excel</button></div></div>
      <div class="adim"><div class="adim-no">3</div><h2>Ödev ver</h2><p>Ödevi oluştur, sayfanın boş hâlinin fotoğrafını ekle ve cevap anahtarını gir.</p>${tamam(anahtarli)}
        <div class="adim-btn"><button class="btn primary" data-git="odev">📝 Ödevlere git</button></div></div>
      <div class="adim"><div class="adim-no">4</div><h2>Fotoğrafları kontrol et</h2><p>Öğrencilerden gelen fotoğrafları yükle, sonuçları gör.</p>${tamam(kontrol)}
        <div class="adim-btn"><button class="btn primary" data-git="kontrol">📷 Ödev kontrole git</button></div></div>
    </div>
    <div class="stats">
      <div class="stat"><b>${D.siniflar.size}</b>Sınıf</div><div class="stat"><b>${nOgr}</b>Öğrenci</div>
      <div class="stat"><b>${nKz}</b>Kazanım</div><div class="stat"><b>${odevler.length}</b>Ödev</div><div class="stat"><b>${kontrol}</b>Kontrol edilen sayfa</div>
    </div>
    <div class="card"><h2>Son ödevler</h2>
      ${odevler.slice(0, 8).map((o) => {
        const ogr = sinifOgrencileri(o.sinifId);
        const yapan = ogr.filter((x) => ["yapti", "gec", "eksik"].includes(odevDurumu(o, x.id).durum)).length;
        return `<div class="list-item" data-kontrol="${o.id}"><span><b>${esc(o.baslik)}</b> <span class="muted small">${esc(sinifAdi(D.siniflar.get(o.sinifId)))}${o.sonTarih ? " · son gün " + tarihYaz(o.sonTarih) : ""}</span></span><span class="chip ${yapan === ogr.length && ogr.length ? "green" : "orange"}">${yapan}/${ogr.length} yaptı</span></div>`;
      }).join("") || `<p class="muted">Henüz ödev yok.</p>`}
    </div>`;
  excelBagla(el, "pOgr", "ogrenci");
  excelBagla(el, "pKz", "kazanim");
  el.querySelector("#ornekYukle")?.addEventListener("click", ornekVeriYukle);
  el.querySelector("#ornekSil")?.addEventListener("click", () => confirm("Örnek veriler kaldırılsın mı? Senin yüklediğin veriler silinmez.") && ornekVeriSil());
  el.querySelectorAll("[data-ornek]").forEach((b) => (b.onclick = () => ornekExcel(b.dataset.ornek)));
  el.querySelectorAll("[data-git]").forEach((b) => (b.onclick = () => git(b.dataset.git)));
  el.querySelectorAll("[data-kontrol]").forEach((b) => (b.onclick = () => git("kontrol", { odevId: +b.dataset.kontrol, gonderimId: null })));
};

// ---------------------------------------------------------------------------
// ÖĞRENCİLER
// ---------------------------------------------------------------------------
EKRAN.ogrenci = (el) => {
  const siniflar = list("siniflar").sort((a, b) => trSirala(a.ad, b.ad));
  if (!D.siniflar.has(G.ogrenci.sinifId)) G.ogrenci.sinifId = siniflar[0]?.id ?? null;
  const s = D.siniflar.get(G.ogrenci.sinifId);
  const ara = sadelestir(G.ogrenci.ara);
  const ogr = (s ? sinifOgrencileri(s.id) : []).filter((o) => !ara || sadelestir(`${o.no} ${ogrAd(o)}`).includes(ara));
  const kaynaklar = list("kaynaklar", (k) => k.tur === "ogrenci").sort((a, b) => b.id - a.id);
  el.innerHTML = `
    <h1>🎒 Öğrenciler</h1>
    <div class="toolbar">${excelDugmesi("oExcel", "📥 Excel'den öğrenci yükle")}<button class="btn" data-ornek="ogrenci">📄 Örnek Excel</button>
      <button class="btn" id="yeniSinif">➕ Sınıf</button>${s ? `<button class="btn" id="yeniOgr">➕ Öğrenci</button>` : ""}</div>
    <p class="muted small">İpucu: Excel dosyasını bu sayfanın üzerine sürükleyip bırakabilirsin. Aynı sınıfın listesini yeniden yüklersen yeni öğrenciler eklenir, var olanlar güncellenir.</p>
    ${kaynaklar.length ? `<div class="card"><h2>İçe aktarılan listeler</h2>${kaynaklar.slice(0, 10).map((k) => `<div class="list-item"><span><b>${esc(k.dosya)}</b> <span class="muted small">${esc(k.aciklama)} · ${k.sayi} öğrenci · ${tarihYaz(k.tarih)}</span></span><button class="link danger" data-kaynak="${k.id}">Kaydı sil</button></div>`).join("")}</div>` : ""}
    <div class="grid2">
      <div class="card"><h2>Sınıflar</h2>
        ${siniflar.map((x) => `<div class="list-item ${x.id === s?.id ? "sel" : ""}" data-sinif="${x.id}"><b>${esc(sinifAdi(x))}</b><span class="chip">${sinifOgrencileri(x.id).length}</span></div>`).join("") || `<p class="muted">Henüz sınıf yok. Excel yükleyince kendiliğinden oluşur.</p>`}
      </div>
      <div class="card">
        ${s ? `<div class="kaynak-baslik row" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><h2 style="margin:0">${esc(sinifAdi(s))} <span class="muted small">${ogr.length} öğrenci</span></h2>
          <span><button class="btn small" id="sinifAd">✎ Adını değiştir</button> <button class="btn small danger" id="sinifSil">🗑️ Sınıfı sil</button></span></div>
          <div class="filters" style="margin-top:10px"><input id="oAra" placeholder="🔎 Öğrenci ara (ad, numara)" value="${esc(G.ogrenci.ara)}"></div>
          <div class="tablewrap"><table><tr><th>No</th><th>Adı Soyadı</th><th class="sag">Kontrol edilen sayfa</th><th></th></tr>
          ${ogr.map((o) => `<tr><td>${esc(o.no)}</td><td><a href="#" data-analiz="${o.id}">${esc(ogrAd(o))}</a></td><td class="sag">${list("gonderimler", (g) => g.ogrenciId === o.id && g.durum === "bitti").length}</td><td class="sag"><button class="link danger" data-ogrsil="${o.id}">Sil</button></td></tr>`).join("")}</table></div>`
          : `<p class="muted">Sınıf seçin ya da Excel'den öğrenci yükleyin.</p>`}
      </div>
    </div>`;
  excelBagla(el, "oExcel", "ogrenci");
  birakmaAlani(el, (f) => f.length && excelleriYukle(f, "ogrenci"), (f) => /\.(xlsx|xls|xlsm|csv)$/i.test(f.name));
  el.querySelector("[data-ornek]").onclick = () => ornekExcel("ogrenci");
  el.querySelectorAll("[data-sinif]").forEach((b) => (b.onclick = () => ((G.ogrenci.sinifId = +b.dataset.sinif), ciz())));
  el.querySelectorAll("[data-analiz]").forEach((a) => (a.onclick = (e) => {
    e.preventDefault();
    const o = D.ogrenciler.get(+a.dataset.analiz);
    git("analiz", { sinifId: o.sinifId, ogrenciId: o.id });
  }));
  el.querySelector("#oAra")?.addEventListener("input", (e) => {
    G.ogrenci.ara = e.target.value;
    const pos = e.target.selectionStart;
    ciz();
    const i = document.getElementById("oAra");
    i.focus();
    i.setSelectionRange(pos, pos);
  });
  el.querySelector("#yeniSinif").onclick = async () => {
    const ad = await pencere("Yeni sınıf", `<label class="alan">Sınıf adı<input id="yS" placeholder="8-A"></label>`, [{ yazi: "Vazgeç", deger: null }, { yazi: "Ekle", sinif: "primary", deger: () => document.getElementById("yS").value.trim() }]);
    if (!ad) return;
    const x = await DB.put("siniflar", { ad: sinifAdiCoz(ad) || ad, seviye: parseInt(ad) || null });
    G.ogrenci.sinifId = x.id;
    ciz();
  };
  el.querySelector("#yeniOgr")?.addEventListener("click", async () => {
    const v = await pencere("Öğrenci ekle", `<div class="form-grid"><label>Numara<input id="yNo"></label><label>Adı<input id="yAd"></label><label>Soyadı<input id="ySoyad"></label></div>`, [
      { yazi: "Vazgeç", deger: null },
      { yazi: "Ekle", sinif: "primary", deger: () => ({ no: document.getElementById("yNo").value.trim(), ad: document.getElementById("yAd").value.trim(), soyad: document.getElementById("ySoyad").value.trim() }) },
    ]);
    if (!v?.ad) return;
    await DB.put("ogrenciler", { sinifId: s.id, ...v, ...(s.ornek ? { ornek: true } : {}) });
    ciz();
  });
  el.querySelector("#sinifAd")?.addEventListener("click", async () => {
    const ad = await pencere("Sınıfın adı", `<input id="yS" class="tam" value="${esc(s.ad)}">`, [{ yazi: "Vazgeç", deger: null }, { yazi: "Kaydet", sinif: "primary", deger: () => document.getElementById("yS").value.trim() }]);
    if (!ad) return;
    s.ad = ad;
    await DB.put("siniflar", s);
    ciz();
  });
  el.querySelector("#sinifSil")?.addEventListener("click", async () => {
    if (!confirm(`${sinifAdi(s)} sınıfı; öğrencileri, ödevleri ve yüklenen fotoğraflarıyla birlikte silinsin mi?`)) return;
    for (const o of sinifOgrencileri(s.id)) await ogrenciSil(o.id);
    for (const o of list("odevler", (x) => x.sinifId === s.id)) await DB.del("odevler", o.id);
    await DB.del("siniflar", s.id);
    ciz();
  });
  el.querySelectorAll("[data-ogrsil]").forEach((b) => (b.onclick = async () => {
    const o = D.ogrenciler.get(+b.dataset.ogrsil);
    if (!confirm(`${ogrAd(o)} ve yüklenen fotoğrafları silinsin mi?`)) return;
    await ogrenciSil(o.id);
    ciz();
  }));
  el.querySelectorAll("[data-kaynak]").forEach((b) => (b.onclick = async () => {
    await DB.del("kaynaklar", +b.dataset.kaynak);
    ciz();
  }));
};
async function ogrenciSil(id) {
  for (const g of list("gonderimler", (x) => x.ogrenciId === id)) await DB.del("gonderimler", g.id);
  await DB.del("ogrenciler", id);
}

// ---------------------------------------------------------------------------
// KAZANIMLAR
// ---------------------------------------------------------------------------
EKRAN.kazanim = (el) => {
  const dersler = [...new Set(list("kazanimlar").map((k) => k.ders))].sort(trSirala);
  const ara = sadelestir(G.kazanim.ara);
  const kz = list("kazanimlar", (k) => (!G.kazanim.ders || k.ders === G.kazanim.ders) && (!ara || sadelestir(`${k.kod} ${k.konu} ${k.metin}`).includes(ara))).sort((a, b) => trSirala(a.kod, b.kod));
  el.innerHTML = `
    <h1>📚 Kazanımlar</h1>
    <div class="toolbar">${excelDugmesi("kExcel", "📥 Excel'den kazanım yükle")}<button class="btn" data-ornek="kazanim">📄 Örnek Excel</button>
      ${D.kazanimlar.size ? `<button class="btn danger" id="kzSil">🗑️ Tümünü sil</button>` : ""}</div>
    <p class="muted small">K12'den aldığın kazanım listesini yükle. Ödevdeki her soruya buradaki bir kazanımı bağlayınca eksik kazanımlar kodlarıyla görünür. İpucu: Excel dosyasını bu sayfanın üzerine sürükleyip bırakabilirsin.</p>
    <div class="filters"><select id="kDers"><option value="">Bütün dersler</option>${dersler.map((d) => `<option ${d === G.kazanim.ders ? "selected" : ""}>${esc(d)}</option>`).join("")}</select>
      <input id="kAra" placeholder="🔎 Kazanım ara (kod, konu, metin)" value="${esc(G.kazanim.ara)}"></div>
    <div class="card"><div class="muted small">${kz.length} kazanım</div><div class="tablewrap"><table><tr><th>Kod</th><th>Ders</th><th>Sınıf</th><th>Konu</th><th>Kazanım</th></tr>
      ${kz.slice(0, 500).map((k) => `<tr><td><b>${esc(k.kod)}</b>${k.ornek ? ` <span class="chip orange">örnek</span>` : ""}</td><td>${esc(k.ders)}</td><td>${esc(k.seviye)}</td><td>${esc(k.konu || k.unite)}</td><td>${esc(k.metin)}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">Henüz kazanım yok.</td></tr>`}</table></div></div>`;
  excelBagla(el, "kExcel", "kazanim");
  birakmaAlani(el, (f) => f.length && excelleriYukle(f, "kazanim"), (f) => /\.(xlsx|xls|xlsm|csv)$/i.test(f.name));
  el.querySelector("[data-ornek]").onclick = () => ornekExcel("kazanim");
  el.querySelector("#kDers").onchange = (e) => ((G.kazanim.ders = e.target.value), ciz());
  el.querySelector("#kAra").addEventListener("input", (e) => {
    G.kazanim.ara = e.target.value;
    ciz();
    const i = document.getElementById("kAra");
    i.focus();
    i.setSelectionRange(i.value.length, i.value.length);
  });
  el.querySelector("#kzSil")?.addEventListener("click", async () => {
    if (!confirm("Bütün kazanımlar silinsin mi? (Sorulara yazılmış kazanım kodları kalır.)")) return;
    for (const k of list("kazanimlar")) await DB.del("kazanimlar", k.id);
    ciz();
  });
};

// ---------------------------------------------------------------------------
// ÖDEVLER
// ---------------------------------------------------------------------------
EKRAN.odev = (el) => {
  if (G.odev.sayfaId && D.sayfalar.get(G.odev.sayfaId)) return sayfaEkrani(el, D.sayfalar.get(G.odev.sayfaId));
  if (G.odev.id && D.odevler.get(G.odev.id)) return odevEkrani(el, D.odevler.get(G.odev.id));
  G.odev = { id: null, sayfaId: null };
  const odevler = list("odevler").sort((a, b) => (b.sonTarih || "9999").localeCompare(a.sonTarih || "9999") || b.id - a.id);
  el.innerHTML = `
    <h1>📝 Ödevler</h1>
    <div class="yanyana">
      <div class="card"><h2>Ödev listesi</h2>
        ${odevler.map((o) => `<div class="list-item" data-odev="${o.id}"><span><b>${esc(o.baslik)}</b><br><span class="muted small">${esc(sinifAdi(D.siniflar.get(o.sinifId)))} · ${o.sayfaIds.length} sayfa · ${o.sonTarih ? "son gün " + tarihYaz(o.sonTarih) : "süresiz"}</span></span><span class="chip">Aç →</span></div>`).join("") || `<p class="muted">Henüz ödev yok.</p>`}
      </div>
      <div class="card"><h2>Yeni ödev</h2>
        ${D.siniflar.size ? `<div class="form-grid">
          <label>Sınıf<select id="nSinif">${sinifSecenekleri(G.analiz.sinifId)}</select></label>
          <label>Ders<input id="nDers" placeholder="Teknoloji ve Tasarım"></label>
          <label style="grid-column:1/-1">Ödevin adı<input id="nBaslik" placeholder="ör. Fikrî Haklar – Test 2"></label>
          <label>Son gün<input id="nTarih" type="date"></label></div>
          <p><button class="btn primary" id="nEkle">➕ Ödevi oluştur</button></p>`
          : `<p class="muted">Önce <a href="#" id="gOgr">Öğrenciler</a> sekmesinden öğrenci listesini yükleyin.</p>`}
      </div>
    </div>`;
  el.querySelectorAll("[data-odev]").forEach((b) => (b.onclick = () => ((G.odev.id = +b.dataset.odev), ciz())));
  el.querySelector("#gOgr")?.addEventListener("click", (e) => (e.preventDefault(), git("ogrenci")));
  el.querySelector("#nEkle")?.addEventListener("click", async () => {
    const sinifId = +document.getElementById("nSinif").value;
    const baslik = document.getElementById("nBaslik").value.trim();
    if (!sinifId || !baslik) return toast("Sınıf ve ödevin adını yazın.");
    const o = await DB.put("odevler", { ...(D.siniflar.get(sinifId)?.ornek ? { ornek: true } : {}), sinifId, baslik, ders: document.getElementById("nDers").value.trim(), sonTarih: document.getElementById("nTarih").value || null, sayfaIds: [], tarih: simdi() });
    G.odev.id = o.id;
    ciz();
  });
};

function eksikNumaralar(p) {
  const n = p.sorular.map((q) => q.no);
  return Array.from({ length: Math.max(0, ...n) }, (_, i) => i + 1).filter((x) => !n.includes(x));
}

function odevEkrani(el, o) {
  const sayfalar = o.sayfaIds.map((id) => D.sayfalar.get(id)).filter(Boolean);
  const kutuphane = list("sayfalar", (p) => p.durum === "hazir" && !o.sayfaIds.includes(p.id) && !!p.ornek === !!o.ornek);
  el.innerHTML = `
    <div class="yolu"><a href="#" id="geri">← Ödevler</a></div>
    <h1>📝 ${esc(o.baslik)}</h1>
    <div class="toolbar"><span class="chip">${esc(sinifAdi(D.siniflar.get(o.sinifId)))}</span>${o.ders ? `<span class="chip">${esc(o.ders)}</span>` : ""}<span class="chip">${o.sonTarih ? "Son gün " + tarihYaz(o.sonTarih) : "Süresiz"}</span>
      <button class="btn small" id="duzenle">✎ Düzenle</button><button class="btn small danger" id="sil">🗑️ Ödevi sil</button>
      <button class="btn mint" id="kontrolGit">📷 Fotoğrafları kontrol et →</button></div>
    <h2>Boş sayfalar ve cevap anahtarı</h2>
    ${sayfalar.map((p) => {
      const eksik = p.durum === "hazir" ? eksikNumaralar(p) : [];
      const anahtarSayi = p.durum === "hazir" ? p.sorular.filter((q) => (q.tip === "yazili" ? q.dogruCevap : anahtar(p, q).harf)).length : 0;
      const kzSayi = p.durum === "hazir" ? p.sorular.filter((q) => q.kazanimKod || q.konu).length : 0;
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><b>${esc(p.baslik || "Sayfa")}</b>
          <span>${p.durum === "isleniyor" ? `<span class="spinner"></span> Okunuyor…` : p.durum === "hata" ? `<span class="chip red">Okunamadı</span>` : `<span class="chip">${p.sorular.length} soru</span> <span class="chip ${anahtarSayi === p.sorular.length ? "green" : "orange"}">${anahtarSayi} anahtar</span> <span class="chip ${kzSayi === p.sorular.length ? "green" : "gray"}">${kzSayi} kazanım</span>`}</span></div>
        ${p.hata ? `<p class="small" style="color:var(--danger)">${esc(p.hata)}</p>` : ""}
        ${eksik.length ? `<p class="small" style="color:var(--danger)">⚠ ${eksik.join(", ")}. soru bulunamadı. Sayfayı daha düz ve net çekip yeniden ekleyin.</p>` : ""}
        <div class="toolbar" style="margin:8px 0 0">${p.durum === "hazir" ? `<button class="btn primary" data-sayfa="${p.id}">🔑 Anahtar ve kazanımları gir</button>` : ""}<button class="btn small" data-cikar="${p.id}">Ödevden çıkar</button></div>
      </div>`;
    }).join("") || `<p class="muted">Henüz sayfa yok. Öğrencilerin çözeceği sayfanın <b>boş</b> (işaretsiz) hâlinin fotoğrafını ekleyin.</p>`}
    <div class="card">
      <div class="birak" id="bos">Boş sayfanın fotoğrafını buraya sürükleyin<br><button class="btn primary" id="bosEkle" style="margin-top:10px">📷 Boş sayfa ekle</button></div>
      ${kutuphane.length ? `<div class="toolbar" style="margin:12px 0 0"><select id="kut" style="flex:1"><option value="">…ya da daha önce eklenen bir sayfayı seçin</option>${kutuphane.map((p) => `<option value="${p.id}">${esc(p.baslik)}</option>`).join("")}</select><button class="btn" id="kutEkle">Ekle</button></div>` : ""}
      <p class="muted small" style="margin:10px 0 0">Sayfayı düz koyun, gölge düşürmeyin, bütün sayfa görünsün. Program soruları ve A-B-C-D şıklarını kendisi bulur. Aynı sayfa daha önce eklendiyse anahtarıyla birlikte yeniden kullanılır.</p>
    </div>`;
  el.querySelector("#geri").onclick = (e) => (e.preventDefault(), (G.odev.id = null), ciz());
  el.querySelector("#kontrolGit").onclick = () => git("kontrol", { odevId: o.id, gonderimId: null });
  el.querySelectorAll("[data-sayfa]").forEach((b) => (b.onclick = () => ((G.odev.sayfaId = +b.dataset.sayfa), ciz())));
  el.querySelectorAll("[data-cikar]").forEach((b) => (b.onclick = async () => {
    if (!confirm("Bu sayfa ödevden çıkarılsın mı?")) return;
    o.sayfaIds = o.sayfaIds.filter((x) => x !== +b.dataset.cikar);
    await DB.put("odevler", o);
    ciz();
  }));
  el.querySelector("#sil").onclick = async () => {
    if (!confirm("Bu ödev ve yüklenen bütün öğrenci fotoğrafları silinsin mi?")) return;
    for (const g of list("gonderimler", (x) => x.odevId === o.id)) await DB.del("gonderimler", g.id);
    await DB.del("odevler", o.id);
    G.odev.id = null;
    ciz();
  };
  el.querySelector("#duzenle").onclick = async () => {
    const v = await pencere("Ödevi düzenle", `<div class="form-grid"><label style="grid-column:1/-1">Ödevin adı<input id="dB" value="${esc(o.baslik)}"></label><label>Ders<input id="dD" value="${esc(o.ders || "")}"></label><label>Son gün<input id="dT" type="date" value="${o.sonTarih || ""}"></label></div>`, [
      { yazi: "Vazgeç", deger: null },
      { yazi: "Kaydet", sinif: "primary", deger: () => ({ baslik: document.getElementById("dB").value.trim() || o.baslik, ders: document.getElementById("dD").value.trim(), sonTarih: document.getElementById("dT").value || null }) },
    ]);
    if (!v) return;
    Object.assign(o, v);
    await DB.put("odevler", o);
    ciz();
  };
  const ekle = async (files) => {
    for (const f of files) {
      const p = await DB.put("sayfalar", { baslik: "", ders: o.ders, durum: "isleniyor", foto: f, sorular: [], tarih: simdi(), ...(o.ornek ? { ornek: true } : {}) });
      o.sayfaIds.push(p.id);
      await DB.put("odevler", o);
      siraya(async () => {
        const kullanilan = await sayfaIsle(p);
        if (kullanilan !== p.id) {
          o.sayfaIds = [...new Set(o.sayfaIds.map((x) => (x === p.id ? kullanilan : x)))];
          await DB.put("odevler", o);
          sonucKarti(true, "Bu sayfa daha önce eklenmişti", ["Hazır anahtarı ve kazanımlarıyla kullanılıyor."]);
        }
      });
    }
    ciz();
  };
  el.querySelector("#bosEkle").onclick = async () => ekle(await dosyaSec({ coklu: true }));
  birakmaAlani(el.querySelector("#bos"), ekle);
  el.querySelector("#kutEkle")?.addEventListener("click", async () => {
    const v = +document.getElementById("kut").value;
    if (!v) return;
    o.sayfaIds.push(v);
    await DB.put("odevler", o);
    ciz();
  });
}

const kutu = (b, cls, yazi = "") =>
  `<rect class="${cls}" x="${b.x0}" y="${b.y0}" width="${b.x1 - b.x0}" height="${b.y1 - b.y0}" rx="6" />` + (yazi ? `<text class="${cls}-t" x="${b.x0 + 8}" y="${b.y0 + 34}">${esc(yazi)}</text>` : "");
const sekil = (blob, W, H, icerik) => `<div class="fig"><img src="${adresi(blob)}" alt="Sayfa" draggable="false"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${icerik}</svg></div>`;

let YAZILI_CIZIM = false;
function sayfaEkrani(el, p) {
  const odev = D.odevler.get(G.odev.id);
  const kzler = list("kazanimlar", (k) => !!k.ornek === !!p.ornek && (!p.ders || !odev?.ders || sadelestir(k.ders) === sadelestir(p.ders || odev.ders))).sort((a, b) => trSirala(a.kod, b.kod));
  const tumKz = kzler.length ? kzler : list("kazanimlar");
  const eksik = eksikNumaralar(p);
  const icerik = p.sorular.map((q) => (q.tip === "yazili" ? kutu(q.bolge, "m-yz", `✍${q.no}`) : kutu(q.bolge, "q-reg", String(q.no)) + q.siklar.map((o) => kutu(o.box, anahtar(p, q).harf === o.letter ? "m-ok" : "opt")).join(""))).join("");
  el.innerHTML = `
    <div class="yolu"><a href="#" id="geri">← ${esc(odev?.baslik || "Ödev")}</a></div>
    <h1>🔑 Anahtar ve kazanımlar</h1>
    ${p.sorular.some((q) => q.tahmin) ? `<div class="card dikkat">Bazı soru numaraları okunamadı ve sırasına göre tahmin edildi (turuncu etiketli). Resimle karşılaştırıp yanlışsa numarayı düzeltin.</div>` : ""}
    ${eksik.length ? `<div class="card uyari">⚠ <b>${eksik.join(", ")}. soru bulunamadı.</b> Bu sorular kontrol edilemez. Sayfayı daha düz, yakın ve gölgesiz çekip yeniden ekleyin.</div>` : ""}
    <datalist id="kzListe">${tumKz.map((k) => `<option value="${esc(k.kod)}">${esc(k.kod)} — ${esc(k.konu ? k.konu + ": " : "")}${esc(k.metin.slice(0, 90))}</option>`).join("")}</datalist>
    <div class="yanyana">
      <div>${sekil(p.sablon, p.genislik, p.yukseklik, icerik)}
        <p class="muted small">Turuncu: soru alanı · gri: şık kutusu · yeşil: doğru şık · mor: yazılı cevap alanı. Program ${p.sorular.filter((q) => q.tip !== "yazili").length} şıklı soru buldu.</p>
        <div class="card"><h2 style="margin:0 0 6px">✍️ Yazılı cevap sorusu</h2><p class="muted small" style="margin:0 0 8px">Öğrencinin cevabı elle yazdığı sorular için: düğmeye basın, sonra resimde cevabın yazılacağı yeri fareyle çerçeve içine alın. Doğru cevap sayıysa yapay zekâ rakamları okur; kelimeyse Türkçe harfleri okuyup doğru cevaba benzerliğine bakar (%80 ve üstü doğru, %50–80 öğretmen baksın).</p>
          <button class="btn" id="yaziliCiz">${YAZILI_CIZIM ? "✖ Çizmekten vazgeç" : "✍️ Yazılı cevap alanı çiz"}</button></div></div>
      <div>
        <div class="card"><div class="form-grid">
          <label style="grid-column:1/-1">Sayfanın adı (yayın, kitap, sayfa)<input id="sB" value="${esc(p.baslik)}"></label>
          <label>Ders<input id="sD" value="${esc(p.ders || odev?.ders || "")}"></label>
          <label>Hızlı anahtar ("1C 2A…" ya da sırayla "CA…")<input id="sA" placeholder="${esc(p.sorular.map((q) => q.no + (q.anahtar || "?")).join(" "))}" style="text-transform:uppercase"></label>
          <label style="grid-column:1/-1">Toplu kazanım ("1-4 TT.8.A.2" — her satıra bir aralık)<textarea id="sK" style="min-height:60px" placeholder="1-4 TT.8.A.2&#10;5-8 TT.8.B.1"></textarea></label>
          </div><p style="margin-bottom:0"><button class="btn primary" id="sKaydet">💾 Kaydet</button></p></div>
        ${p.sorular.map((q, i) => {
          if (q.tip === "yazili")
            return `<div class="soru-kart" data-q="${i}">
              <div class="ust"><b>Soru ${q.no} <span class="chip" style="background:var(--pink-soft)">✍️ Yazılı cevap</span></b><button class="link danger" data-sil="${i}">Sil</button></div>
              <div class="form-grid"><label>Doğru cevap (sayı ya da kelime)<input name="dogruCevap" value="${esc(q.dogruCevap || "")}" placeholder="ör. 96 ya da patent"></label><label>Kazanım kodu<input name="kazanimKod" list="kzListe" value="${esc(q.kazanimKod)}"></label><label>Konu<input name="konu" value="${esc(q.konu || "")}"></label></div></div>`;
          const v = oylar(p.id, q.no);
          const k = anahtar(p, q);
          const kz = kazanimBul(q.kazanimKod, p.ornek);
          return `<div class="soru-kart" data-q="${i}">
            <div class="ust"><span><b>Soru</b> <input type="number" min="1" max="200" data-no="${i}" value="${q.no}" style="width:70px;padding:4px 8px" title="Program numarayı yanlış okuduysa düzeltin">${q.tahmin ? ` <span class="chip orange" title="Soru numarası okunamadı; sırasına göre tahmin edildi">numara tahmini — kontrol edin</span>` : ""}</span><span class="muted small">${Object.keys(v).length ? "Öğrenciler: " + Object.entries(v).map(([h, n]) => `${h} ${n}`).join(", ") : ""}</span></div>
            <div class="harfler">${q.siklar.map((o) => `<button class="harf ${q.anahtar === o.letter ? "sec" : ""}" data-h="${o.letter}">${o.letter}</button>`).join("")}
              ${q.anahtar ? `<button class="link" data-h="">Temizle</button>` : k.kaynak === "cogunluk" ? `<span class="small muted">Öğrenci çoğunluğu: <b>${k.harf}</b></span>` : `<span class="small muted">Anahtar yok</span>`}</div>
            <div class="form-grid"><label>Kazanım kodu<input name="kazanimKod" list="kzListe" value="${esc(q.kazanimKod)}" placeholder="Kod yazın ya da seçin"></label><label>Konu<input name="konu" value="${esc(q.konu || "")}" placeholder="${esc(kz?.konu || "")}"></label></div>
            ${kz ? `<div class="small muted">${esc(kz.metin)}</div>` : q.kazanimKod ? `<div class="small" style="color:var(--warn-ink)">Bu kod kazanım listesinde yok.</div>` : ""}
          </div>`;
        }).join("")}
      </div>
    </div>`;
  el.querySelector("#geri").onclick = (e) => (e.preventDefault(), (G.odev.sayfaId = null), ciz());
  const kaydet = async (msg = "Kaydedildi.") => {
    await DB.put("sayfalar", p);
    toast(msg);
  };
  el.querySelector("#sKaydet").onclick = async () => {
    p.baslik = document.getElementById("sB").value.trim();
    p.ders = document.getElementById("sD").value.trim();
    const a = document.getElementById("sA").value.toUpperCase();
    const ciftler = [...a.matchAll(/(\d+)\s*[-.:)]?\s*([A-E])/g)];
    const sikli = (n) => p.sorular.find((x) => x.no === n && x.tip !== "yazili");
    if (ciftler.length) for (const [, n, h] of ciftler) { const q = sikli(+n); if (q) q.anahtar = h; }
    else a.replace(/[^A-E]/g, "").split("").forEach((h, i) => { const q = sikli(i + 1); if (q) q.anahtar = h; });
    for (const satir of document.getElementById("sK").value.split(/\n/)) {
      const m = /^\s*(\d+)\s*(?:-\s*(\d+))?\s+(\S+)\s*(.*)$/.exec(satir);
      if (!m) continue;
      for (let n = +m[1]; n <= +(m[2] || m[1]); n++) {
        const q = p.sorular.find((x) => x.no === n);
        if (q) {
          q.kazanimKod = m[3];
          if (m[4]) q.konu = m[4].trim();
        }
      }
    }
    await kaydet();
    ciz();
  };
  // Yazılı cevap alanı çizme (fareyle çerçeve)
  el.querySelector("#yaziliCiz").onclick = () => ((YAZILI_CIZIM = !YAZILI_CIZIM), ciz());
  const fig = el.querySelector(".fig");
  if (YAZILI_CIZIM) {
    fig.style.cursor = "crosshair";
    fig.style.outline = "3px dashed var(--pink)";
    const svg = fig.querySelector("svg");
    let bas = null;
    let gecici = null;
    const nokta = (e) => {
      const r = fig.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * p.genislik, y: ((e.clientY - r.top) / r.height) * p.yukseklik };
    };
    fig.ondragstart = (e) => e.preventDefault();
    fig.onpointerdown = (e) => {
      e.preventDefault();
      fig.setPointerCapture?.(e.pointerId);
      bas = nokta(e);
      gecici = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      gecici.setAttribute("class", "m-yz");
      svg.append(gecici);
    };
    fig.onpointermove = (e) => {
      if (!bas) return;
      const n = nokta(e);
      gecici.setAttribute("x", Math.min(bas.x, n.x));
      gecici.setAttribute("y", Math.min(bas.y, n.y));
      gecici.setAttribute("width", Math.abs(n.x - bas.x));
      gecici.setAttribute("height", Math.abs(n.y - bas.y));
    };
    fig.onpointerup = async (e) => {
      if (!bas) return;
      const n = nokta(e);
      const bolge = { x0: Math.round(Math.min(bas.x, n.x)), y0: Math.round(Math.min(bas.y, n.y)), x1: Math.round(Math.max(bas.x, n.x)), y1: Math.round(Math.max(bas.y, n.y)) };
      bas = null;
      if (bolge.x1 - bolge.x0 < 20 || bolge.y1 - bolge.y0 < 15) return gecici.remove();
      const enBuyuk = Math.max(0, ...p.sorular.map((q) => q.no));
      const v = await pencere("Yazılı cevap sorusu", `<div class="form-grid"><label>Soru numarası<input id="yNo" type="number" value="${enBuyuk + 1}"></label><label>Doğru cevap (sayı ya da kelime)<input id="yCvp" placeholder="ör. 96 ya da patent"></label><label>Kazanım kodu<input id="yKz" list="kzListe"></label></div>`, [
        { yazi: "Vazgeç", deger: null },
        { yazi: "Ekle", sinif: "primary", deger: () => ({ no: +document.getElementById("yNo").value || enBuyuk + 1, dogruCevap: document.getElementById("yCvp").value.trim(), kazanimKod: document.getElementById("yKz").value.trim() }) },
      ]);
      YAZILI_CIZIM = false;
      if (v) {
        if (p.sorular.some((q) => q.no === v.no && q.tip !== "yazili")) toast(`Uyarı: ${v.no}. numarada şıklı bir soru da var; numarasını düzeltin.`);
        p.sorular = p.sorular.filter((q) => q.no !== v.no || q.tip !== "yazili");
        p.sorular.push({ no: v.no, tip: "yazili", bolge, siklar: [], dogruCevap: v.dogruCevap, kazanimKod: v.kazanimKod, konu: kazanimBul(v.kazanimKod, p.ornek)?.konu || "", anahtar: null });
        p.sorular.sort((a, b) => a.no - b.no);
        await kaydet("Yazılı cevap sorusu eklendi.");
      }
      ciz();
    };
  }
  el.querySelectorAll("[data-no]").forEach((inp) => (inp.onchange = async () => {
    const q = p.sorular[+inp.dataset.no];
    const yeni = +inp.value;
    if (!yeni || p.sorular.some((x) => x !== q && x.no === yeni)) {
      toast("Bu numara başka bir soruda var.");
      return ciz();
    }
    q.no = yeni;
    q.tahmin = false;
    p.sorular.sort((a, b) => a.no - b.no);
    await kaydet("Soru numarası düzeltildi.");
    ciz();
  }));
  el.querySelectorAll("[data-sil]").forEach((b) => (b.onclick = async () => {
    if (!confirm("Bu yazılı cevap sorusu silinsin mi?")) return;
    p.sorular.splice(+b.dataset.sil, 1);
    await kaydet("Silindi.");
    ciz();
  }));
  el.querySelectorAll("[data-q]").forEach((kart) => {
    const q = p.sorular[+kart.dataset.q];
    kart.querySelectorAll("[data-h]").forEach((b) => (b.onclick = async () => { q.anahtar = b.dataset.h || null; await kaydet(); ciz(); }));
    kart.querySelectorAll("input[name]").forEach((inp) => (inp.onchange = async () => {
      q[inp.name] = inp.value.trim();
      if (inp.name === "kazanimKod" && !q.konu) q.konu = kazanimBul(q.kazanimKod, p.ornek)?.konu || "";
      await kaydet();
      yenidenCiz();
    }));
  });
}

// ---------------------------------------------------------------------------
// ÖDEV KONTROL: fotoğraf yükleme, kim yaptı, sonuç
// ---------------------------------------------------------------------------
function ogrenciTahmin(dosya, ogrenciler) {
  const yol = sadelestir((dosya.webkitRelativePath || "").replace(/\.[^.]+$/, "") + " " + dosya.name.replace(/\.[^.]+$/, ""));
  const f = ` ${yol} `;
  const no = ogrenciler.filter((o) => o.no && f.includes(` ${o.no} `));
  if (no.length === 1) return no[0].id;
  const tam = ogrenciler.filter((o) => f.includes(` ${sadelestir(ogrAd(o))} `));
  if (tam.length === 1) return tam[0].id;
  const ilk = ogrenciler.filter((o) => f.includes(` ${sadelestir(o.ad).split(" ")[0]} `));
  return ilk.length === 1 ? ilk[0].id : "";
}

EKRAN.kontrol = (el) => {
  const odevler = list("odevler").sort((a, b) => b.id - a.id);
  if (!D.odevler.has(G.kontrol.odevId)) G.kontrol.odevId = odevler[0]?.id ?? null;
  const o = D.odevler.get(G.kontrol.odevId);
  if (G.kontrol.gonderimId && D.gonderimler.has(G.kontrol.gonderimId)) return sonucEkrani(el, D.gonderimler.get(G.kontrol.gonderimId));
  G.kontrol.gonderimId = null;
  const secim = `<select id="kOdev" style="min-width:280px">${odevler.map((x) => `<option value="${x.id}" ${x.id === o?.id ? "selected" : ""}>${esc(sinifAdi(D.siniflar.get(x.sinifId)))} · ${esc(x.baslik)}</option>`).join("")}</select>`;
  if (!o) {
    el.innerHTML = `<h1>📷 Ödev Kontrol</h1><div class="card"><p>Önce <a href="#" id="gOdev">Ödevler</a> sekmesinden bir ödev oluşturun ve boş sayfasını ekleyin.</p></div>`;
    el.querySelector("#gOdev").onclick = (e) => (e.preventDefault(), git("odev"));
    return;
  }
  const ogr = sinifOgrencileri(o.sinifId);
  const hazirSayfa = o.sayfaIds.some((id) => D.sayfalar.get(id)?.durum === "hazir");
  const durumlar = ogr.map((x) => ({ x, ...odevDurumu(o, x.id) }));
  const sayi = (k) => durumlar.filter((d) => d.durum === k).length;
  const bekleyen = kuyruk.filter((k) => k.odevId === o.id);
  el.innerHTML = `
    <h1>📷 Ödev Kontrol</h1>
    <div class="toolbar"><b>Ödev:</b> ${secim} <button class="btn small" id="odevAc">📝 Ödevi aç</button></div>
    ${!hazirSayfa ? `<div class="card dikkat">Bu ödeve henüz boş sayfa eklenmemiş. Önce <a href="#" id="odevAc2">ödevi açıp</a> boş sayfanın fotoğrafını ekleyin.</div>` : ""}
    <div class="card">
      <h2>Öğrencilerden gelen fotoğrafları yükle</h2>
      <div class="birak" id="foto">📥 Fotoğrafları buraya sürükleyin<br>
        <span class="toolbar" style="justify-content:center;margin:10px 0 0"><button class="btn primary" id="fotoSec">🖼️ Fotoğrafları seç</button><button class="btn" id="klasorSec">📁 Klasörden yükle</button></span></div>
      <p class="muted small" style="margin:10px 0 0">Her fotoğraf için öğrenciyi seçip <b>Kontrol et</b>'e bas. Dosya ya da klasör adında öğrencinin numarası veya adı geçiyorsa (ör. <i>101.jpg</i>, <i>ali-kaya.jpg</i>, <i>Odev/Ali Kaya/1.jpg</i>) öğrenci kendiliğinden seçilir. Tablodaki <b>📎 Yükle</b> ile bir öğrencinin fotoğraflarını doğrudan ekleyebilirsin.</p>
      ${bekleyen.length ? `<div class="kuyruk">${bekleyen.map((k) => {
        const i = kuyruk.indexOf(k);
        const g = k.gId ? D.gonderimler.get(k.gId) : null;
        let alt;
        if (!g) alt = `<select data-ks="${i}"><option value="">— Öğrenci seçin —</option>${ogr.map((x) => `<option value="${x.id}" ${+k.ogrenciId === x.id ? "selected" : ""}>${esc(x.no ? x.no + " · " : "")}${esc(ogrAd(x))}</option>`).join("")}</select><button class="link danger" data-kc="${i}">Kaldır</button>`;
        else {
          const c = say(degerlendir(g));
          alt = `<b>${esc(ogrAd(D.ogrenciler.get(g.ogrenciId) || {}))}</b>` + (g.durum === "hata" ? `<span class="small" style="color:var(--danger)">⚠ ${esc(g.hata)}</span>` : g.durum === "bitti" ? `<a href="#" class="small" data-sonuc="${g.id}">${!g.yazili ? "Boş sayfa" : c.anahtaryok === c.n ? "Anahtar yok" : `${c.dogru}/${c.n} doğru`} →</a>` : `<span class="small"><span class="spinner"></span> Okunuyor…</span>`);
        }
        return `<div class="kuyruk-oge"><img src="${k.adres}" alt=""><div><span class="dosya-adi" title="${esc(k.dosya.name)}">${esc(k.dosya.name)}</span>${alt}</div></div>`;
      }).join("")}</div>
      <div class="toolbar">${bekleyen.some((k) => !k.gId) ? `<button class="btn mint big" id="baslat">✔ ${bekleyen.filter((k) => !k.gId).length} fotoğrafı kontrol et</button>` : `<button class="btn" id="temizle">Listeyi temizle</button>`}</div>` : ""}
    </div>
    <h2>Kim yaptı?</h2>
    <div class="stats"><div class="stat"><b>${sayi("yapti")}</b>Yaptı</div><div class="stat"><b>${sayi("eksik") + sayi("gec")}</b>Eksik / geç</div><div class="stat"><b>${sayi("bos")}</b>Boş sayfa</div><div class="stat"><b>${sayi("yapmadi")}</b>Yapmadı</div></div>
    <div class="card"><div class="tablewrap"><table>
      <tr><th>No</th><th>Öğrenci</th><th>Durum</th><th class="sag">Sayfa</th><th class="sag">Doğru</th><th class="sag">Yanlış</th><th class="sag">Boş</th><th class="sag">İşlemsiz doğru</th><th></th></tr>
      ${durumlar.map((d) => `<tr><td>${esc(d.x.no)}</td><td><a href="#" data-analiz="${d.x.id}">${esc(ogrAd(d.x))}</a> ${d.kopya ? `<span class="chip red">Kopya foto</span>` : ""}${d.kontrol ? ` <span class="chip orange">${d.kontrol} soruya bak</span>` : ""}</td>
        <td>${durumCip(d.durum)}</td><td class="sag">${d.sayfa}/${o.sayfaIds.length}</td><td class="sag">${d.n ? d.dogru : "–"}</td><td class="sag">${d.n ? d.yanlis : "–"}</td><td class="sag">${d.n ? d.bos : "–"}</td><td class="sag">${d.islemsiz || "–"}</td>
        <td class="sag">${d.gs.filter((g) => g.durum === "bitti").map((g) => `<a href="#" class="small" data-sonuc="${g.id}" title="Sonucu gör">📄</a>`).join(" ")} <button class="btn small" data-yukle="${d.x.id}">📎 Yükle</button></td></tr>`).join("") || `<tr><td colspan="9" class="muted">Bu sınıfta öğrenci yok.</td></tr>`}
    </table></div>
    <p class="muted small">"İşlemsiz doğru": doğru şık işaretlenmiş ama soru alanında yazı yok (tahmin ya da kopya olabilir). "Kopya foto": aynı fotoğraf başka bir öğrenci için de yüklenmiş.</p></div>`;

  el.querySelector("#kOdev").onchange = (e) => ((G.kontrol.odevId = +e.target.value), ciz());
  const odevAc = (e) => (e?.preventDefault(), git("odev", { id: o.id, sayfaId: null }));
  el.querySelector("#odevAc").onclick = odevAc;
  el.querySelector("#odevAc2")?.addEventListener("click", odevAc);
  const ekle = (files, ogrenciId) => {
    for (const f of files) kuyruk.push({ odevId: o.id, dosya: f, adres: URL.createObjectURL(f), ogrenciId: ogrenciId ?? ogrenciTahmin(f, ogr), gId: null });
    ciz();
  };
  el.querySelector("#fotoSec").onclick = async () => ekle(await dosyaSec({ coklu: true }));
  el.querySelector("#klasorSec").onclick = async () => ekle((await dosyaSec({ coklu: true, klasor: true })).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f.name) && !/ogretici/i.test(f.webkitRelativePath)));
  birakmaAlani(el.querySelector("#foto"), ekle);
  el.querySelectorAll("[data-yukle]").forEach((b) => (b.onclick = async () => ekle(await dosyaSec({ coklu: true }), +b.dataset.yukle)));
  el.querySelectorAll("[data-ks]").forEach((s) => (s.onchange = () => (kuyruk[+s.dataset.ks].ogrenciId = s.value)));
  el.querySelectorAll("[data-kc]").forEach((b) => (b.onclick = () => { const k = kuyruk.splice(+b.dataset.kc, 1)[0]; URL.revokeObjectURL(k.adres); ciz(); }));
  el.querySelectorAll("[data-sonuc]").forEach((a) => (a.onclick = (e) => (e.preventDefault(), (G.kontrol.gonderimId = +a.dataset.sonuc), ciz())));
  el.querySelectorAll("[data-analiz]").forEach((a) => (a.onclick = (e) => (e.preventDefault(), git("analiz", { sinifId: o.sinifId, ogrenciId: +a.dataset.analiz }))));
  el.querySelector("#temizle")?.addEventListener("click", () => {
    for (let i = kuyruk.length - 1; i >= 0; i--) if (kuyruk[i].odevId === o.id) { URL.revokeObjectURL(kuyruk[i].adres); kuyruk.splice(i, 1); }
    ciz();
  });
  el.querySelector("#baslat")?.addEventListener("click", async () => {
    const yapilacak = bekleyen.filter((k) => !k.gId);
    if (yapilacak.some((k) => !k.ogrenciId)) return toast("Her fotoğraf için öğrenci seçin.");
    for (const k of yapilacak) {
      const ogrenciId = +k.ogrenciId;
      const iz = await parmakIzi(k.dosya);
      if (list("gonderimler", (g) => g.parmakIzi === iz && g.ogrenciId === ogrenciId && g.durum !== "hata").length) {
        toast(`${ogrAd(D.ogrenciler.get(ogrenciId))}: bu fotoğraf zaten yüklenmiş.`);
        kuyruk.splice(kuyruk.indexOf(k), 1);
        continue;
      }
      const kopya = list("gonderimler", (g) => g.parmakIzi === iz && g.ogrenciId !== ogrenciId && !!g.ornek === !!o.ornek)[0];
      const g = await DB.put("gonderimler", { ...(o.ornek ? { ornek: true } : {}), ogrenciId, odevId: o.id, foto: await fotoKucult(k.dosya), parmakIzi: iz, kopyaId: kopya?.id || null, durum: "bekliyor", cevaplar: [], tarih: simdi(), dosyaAdi: k.dosya.name });
      k.gId = g.id;
      siraya(() => gonderimIsle(g));
    }
    ciz();
  });
};

function sonucEkrani(el, g) {
  const ogr = D.ogrenciler.get(g.ogrenciId);
  const o = D.odevler.get(g.odevId);
  const ust = `
    <div class="yolu"><a href="#" id="geri">← ${esc(o?.baslik || "Ödev Kontrol")}</a></div>
    <h1>📄 ${esc(ogrAd(ogr || {}))}</h1>
    <div class="toolbar"><span class="chip">${tarihYaz(g.tarih)}</span>${g.dosyaAdi ? `<span class="chip">${esc(g.dosyaAdi)}</span>` : ""}</div>
    ${g.kopyaId ? `<div class="card uyari">⚠ Bu fotoğrafın aynısı başka bir öğrenci için de yüklenmiş.</div>` : ""}
    ${g.durum === "bitti" && !g.yazili ? `<div class="card uyari">⚠ Sayfada öğrenci yazısı bulunamadı; ödev yapılmamış görünüyor.</div>` : ""}`;
  const alt = `<details class="card"><summary>Gönderilen fotoğraf</summary><img src="${adresi(g.foto)}" alt="" style="max-width:100%;margin-top:8px;border-radius:12px"></details>
    <button class="btn danger" id="gSil">🗑️ Bu fotoğrafı sil (yanlış öğrenciye yüklendiyse)</button>`;
  if (g.durum !== "bitti") {
    el.innerHTML = ust + (g.durum === "hata" ? `<div class="card uyari">⚠ ${esc(g.hata)}</div>` : `<div class="card"><span class="spinner"></span> Okunuyor…</div>`) + alt;
  } else {
    const satirlar = degerlendir(g);
    const p = D.sayfalar.get(g.sayfaId);
    const c = say(satirlar);
    const icerik = satirlar.map((r) => {
      if (r.tip === "yazili") return kutu(r.q.bolge, r.sonuc === "dogru" ? "m-ok" : r.sonuc === "yanlis" ? "m-bad" : "m-mid", `✍${r.no}`) + (r.parcalar || []).map((p) => kutu(p.kutu, "m-yz")).join("");
      let s = `<text class="qn" x="${r.q.bolge.x0 + 8}" y="${r.q.bolge.y0 + 30}">${r.no}</text>`;
      for (const op of r.q.siklar) {
        if (r.isaret === op.letter) s += kutu(op.box, r.sonuc === "dogru" ? "m-ok" : r.sonuc === "yanlis" ? "m-bad" : "m-mid");
        else if (r.anahtarHarf === op.letter && r.sonuc === "yanlis") s += kutu(op.box, "m-key");
        else if (r.durum === "multi" && r.oranlar[op.letter] >= T.markMultiMin) s += kutu(op.box, "m-mid");
      }
      return s;
    }).join("");
    el.innerHTML = ust + `
      <div class="stats"><div class="stat"><b>${c.dogru}</b>Doğru</div><div class="stat"><b>${c.yanlis}</b>Yanlış</div><div class="stat"><b>${c.bos}</b>Boş</div>${c.kontrol ? `<div class="stat"><b>${c.kontrol}</b>Bakılacak</div>` : ""}${c.anahtaryok ? `<div class="stat"><b>${c.anahtaryok}</b>Anahtar yok</div>` : ""}</div>
      <div class="yanyana">
        <div>${sekil(g.kaplama, p.genislik, p.yukseklik, icerik)}
          <p class="muted small">Mavi: öğrencinin el yazısı (basılı yazıdan ayrıldı). Yeşil kutu: doğru işaret · kırmızı: yanlış işaret · kesikli yeşil: doğru şık · sarı: bakılacak.</p></div>
        <div class="card"><div class="tablewrap"><table><tr><th>Soru</th><th>İşaret</th><th>Doğru</th><th>Sonuç</th><th>İşlem</th></tr>
          ${satirlar.map((r, i) => {
            const kz = kazanimBul(r.q.kazanimKod, p.ornek);
            return `<tr><td><b>${r.no}</b>${r.q.kazanimKod || r.q.konu ? `<br><span class="muted small">${esc(r.q.kazanimKod || "")} ${esc(r.q.konu || kz?.konu || "")}</span>` : ""}</td>
              <td>${r.tip === "yazili"
                ? `${r.okunan ? `<b>${esc(r.okunan)}</b> ${r.tur === "kelime" && r.duzeltmeYazi == null ? `<span class="muted small" title="Doğru cevaba benzerlik">≈%${Math.round((r.benzerlik ?? 0) * 100)}</span>` : `<span class="muted small" title="Yapay zekânın okuma güveni">%${Math.round(r.guven * 100)}</span>`}` : "–"}<br><span class="small"><input data-yazi="${i}" value="${esc(g.cevaplar[i].duzeltmeYazi ?? "")}" placeholder="Düzelt" style="width:80px;padding:3px 6px"></span>`
                : `${r.isaret ? `<b>${r.isaret}</b> <span class="muted small" title="${r.okuyan === "yz" ? "Yapay zekânın güveni" : "İşaretin bu şıkta yoğunlaşma oranı"}">%${Math.round(r.pay * 100)}</span>` : r.durum === "multi" ? "Birden fazla" : r.durum === "farkli" ? `<span class="small" title="${esc(r.neden)}">🧠 ${r.yzOkuma.isaret || (r.yzOkuma.durum === "none" ? "–" : "çok")} / 📏 ${r.kural.isaret || (r.kural.durum === "none" ? "–" : "çok")}</span>` : "–"}${r.okuyan === "yz" && r.durum !== "farkli" ? ` <span title="Yapay zekâ ve kural aynı okudu">🧠</span>` : ""}
                  <br><select data-duzelt="${i}" class="small" style="padding:3px 6px;margin-top:4px" title="Öğrenci aslında hangi şıkkı işaretledi? (Yapay zekâ bundan öğrenir)"><option value="">Doğru okundu</option>${r.q.siklar.map((o) => `<option value="${o.letter}" ${g.cevaplar[i].duzeltme === o.letter ? "selected" : ""}>Aslında ${o.letter}</option>`).join("")}<option value="yok" ${g.cevaplar[i].duzeltme === "yok" ? "selected" : ""}>Aslında işaretsiz</option></select>`}</td>
              <td>${r.anahtarHarf ? `<b>${r.anahtarHarf}</b>${r.anahtarKaynak === "cogunluk" ? ` <span class="muted small" title="Öğrenci çoğunluğundan">(ç)</span>` : ""}` : "?"}</td>
              <td>${sonucCip(r.sonuc)}<br><select data-karar="${i}" class="small" style="padding:3px 6px;margin-top:4px"><option value="">Otomatik</option>${["dogru", "yanlis", "bos"].map((x) => `<option value="${x}" ${r.karar === x ? "selected" : ""}>${SONUC[x]}</option>`).join("")}</select></td>
              <td>${r.islem ? "✓ var" : `<span class="muted">yok</span>`}</td></tr>`;
          }).join("")}</table></div>
          <p class="muted small">🧠: yapay zekâ ve eşik kuralı aynı okudu. "🧠 A / 📏 B": ikisi farklı okudu; öğretmen baksın. Program yanlış okuduysa <b>"Doğru okundu"</b> kutusundan öğrencinin aslında işaretlediği şıkkı, yazılı cevaplarda <b>"Düzelt"</b> kutusuna öğrencinin yazdığını seç/yaz: sonuç düzelir ve yapay zekâ bundan öğrenir. "Otomatik" kutusu yalnızca sonucu değiştirir. (ç): anahtar öğrenci çoğunluğundan geldi.</p></div>
      </div>` + alt;
    el.querySelectorAll("[data-duzelt]").forEach((s) => (s.onchange = async () => {
      const c = g.cevaplar[+s.dataset.duzelt];
      c.duzeltme = s.value || null;
      await DB.put("gonderimler", g);
      await yzDuzeltmeKaydet(g, c);
      toast(s.value ? "Düzeltildi; yapay zekâ bundan öğrenecek." : "Düzeltme kaldırıldı.");
      ciz();
    }));
    el.querySelectorAll("[data-yazi]").forEach((inp) => (inp.onchange = async () => {
      const c = g.cevaplar[+inp.dataset.yazi];
      c.duzeltmeYazi = inp.value.trim() === "" ? null : inp.value.trim();
      await DB.put("gonderimler", g);
      await yzDuzeltmeKaydet(g, c);
      toast(c.duzeltmeYazi != null ? "Düzeltildi; yapay zekâ bundan öğrenecek." : "Düzeltme kaldırıldı.");
      ciz();
    }));
    el.querySelectorAll("[data-karar]").forEach((s) => (s.onchange = async () => {
      g.cevaplar[+s.dataset.karar].karar = s.value || null;
      await DB.put("gonderimler", g);
      toast("Karar kaydedildi.");
      ciz();
    }));
  }
  el.querySelector("#geri").onclick = (e) => (e.preventDefault(), (G.kontrol.gonderimId = null), ciz());
  el.querySelector("#gSil").onclick = async () => {
    if (!confirm("Bu fotoğraf ve sonuçları silinsin mi?")) return;
    await DB.del("gonderimler", g.id);
    G.kontrol.gonderimId = null;
    ciz();
  };
}

// ---------------------------------------------------------------------------
// ÖĞRENCİ ANALİZİ
// ---------------------------------------------------------------------------
EKRAN.analiz = (el) => {
  if (!D.siniflar.has(G.analiz.sinifId)) G.analiz.sinifId = list("siniflar").sort((a, b) => trSirala(a.ad, b.ad))[0]?.id ?? null;
  const ogrler = G.analiz.sinifId ? sinifOgrencileri(G.analiz.sinifId) : [];
  if (!ogrler.some((o) => o.id === G.analiz.ogrenciId)) G.analiz.ogrenciId = ogrler[0]?.id ?? null;
  const ogr = D.ogrenciler.get(G.analiz.ogrenciId);
  let govde = `<p class="muted">Öğrenci seçin.</p>`;
  if (ogr) {
    const satirlar = ogrenciSatirlari(ogr.id);
    const c = say(satirlar);
    const ozet = kazanimOzeti(satirlar);
    const eksik = ozet.filter((x) => x.eksik);
    const odevler = list("odevler", (o) => o.sinifId === ogr.sinifId).sort((a, b) => (b.sonTarih || "9999").localeCompare(a.sonTarih || "9999") || b.id - a.id);
    const durumlar = odevler.map((o) => ({ o, ...odevDurumu(o, ogr.id) }));
    govde = `
      <h2 style="margin-top:6px">${esc(ogrAd(ogr))} <span class="muted small">${esc(ogr.no || "")} · ${esc(sinifAdi(D.siniflar.get(ogr.sinifId)))}</span></h2>
      <div class="stats"><div class="stat"><b>${durumlar.filter((d) => ["yapti", "gec", "eksik"].includes(d.durum)).length}/${odevler.length}</b>Yapılan ödev</div>
        <div class="stat"><b>${c.dogru}</b>Doğru</div><div class="stat"><b>${c.yanlis}</b>Yanlış</div><div class="stat"><b>${c.bos}</b>Boş</div><div class="stat"><b>${c.islemsiz}</b>İşlemsiz doğru</div></div>
      <div class="card"><h2>Eksik olduğu kazanımlar</h2>
        ${eksik.length ? `<div class="tablewrap"><table><tr><th>Kazanım</th><th>Konu</th><th class="sag">Soru</th><th>Başarı</th></tr>${eksik.map((k) => `<tr><td><b>${esc(k.kod || "—")}</b>${k.metin ? `<br><span class="small">${esc(k.metin)}</span>` : ""}</td><td>${esc(k.konu)}</td><td class="sag">${k.soru}</td><td>${oranCubugu(k.oran)}</td></tr>`).join("")}</table></div>`
          : `<p class="muted">${!ozet.length ? "Henüz yeterli veri yok." : `Eksik kazanım görünmüyor. (Bir kazanımda başarı %${A.eksikSiniri}'in altındaysa ve en az ${A.eksikEnAzSoru} soru varsa eksik sayılır.)`}</p>`}</div>
      <div class="card"><h2>Ödevler</h2><div class="tablewrap"><table><tr><th>Ödev</th><th>Son gün</th><th>Durum</th><th class="sag">Doğru</th><th class="sag">Yanlış</th><th class="sag">Boş</th><th></th></tr>
        ${durumlar.map((d) => `<tr><td>${esc(d.o.baslik)}</td><td>${tarihYaz(d.o.sonTarih)}</td><td>${durumCip(d.durum)}</td><td class="sag">${d.n ? d.dogru : "–"}</td><td class="sag">${d.n ? d.yanlis : "–"}</td><td class="sag">${d.n ? d.bos : "–"}</td>
          <td class="sag">${d.gs.filter((g) => g.durum === "bitti").map((g) => `<a href="#" class="small" data-sonuc="${g.id}" data-odev="${d.o.id}">📄 Sayfa</a>`).join(" ")}</td></tr>`).join("") || `<tr><td colspan="7" class="muted">Ödev yok.</td></tr>`}</table></div></div>
      ${ozet.length ? `<div class="card"><h2>Bütün kazanımlar</h2><div class="tablewrap"><table><tr><th>Kazanım</th><th>Konu</th><th class="sag">Soru</th><th class="sag">Doğru</th><th>Başarı</th></tr>${ozet.map((k) => `<tr><td><b>${esc(k.kod || "—")}</b>${k.metin ? `<br><span class="small muted">${esc(k.metin)}</span>` : ""}</td><td>${esc(k.konu)}</td><td class="sag">${k.soru}</td><td class="sag">${k.dogru}</td><td>${oranCubugu(k.oran)}</td></tr>`).join("")}</table></div></div>` : ""}`;
  }
  el.innerHTML = `
    <h1>🔍 Öğrenci Analizi</h1>
    <div class="filters no-print"><select id="aSinif">${sinifSecenekleri(G.analiz.sinifId)}</select>
      <select id="aOgr">${ogrler.map((o) => `<option value="${o.id}" ${o.id === ogr?.id ? "selected" : ""}>${esc(o.no ? o.no + " · " : "")}${esc(ogrAd(o))}</option>`).join("")}</select>
      ${ogr ? `<button class="btn" id="yazdir">🖨️ Yazdır</button>` : ""}</div>
    ${govde}`;
  el.querySelector("#aSinif").onchange = (e) => ((G.analiz.sinifId = +e.target.value || null), (G.analiz.ogrenciId = null), ciz());
  el.querySelector("#aOgr").onchange = (e) => ((G.analiz.ogrenciId = +e.target.value), ciz());
  el.querySelector("#yazdir")?.addEventListener("click", () => window.print());
  el.querySelectorAll("[data-sonuc]").forEach((a) => (a.onclick = (e) => (e.preventDefault(), git("kontrol", { odevId: +a.dataset.odev, gonderimId: +a.dataset.sonuc }))));
};

// ---------------------------------------------------------------------------
// SINIF ANALİZİ
// ---------------------------------------------------------------------------
EKRAN.sinifanaliz = (el) => {
  if (!D.siniflar.has(G.sinifanaliz.sinifId)) G.sinifanaliz.sinifId = G.analiz.sinifId || list("siniflar").sort((a, b) => trSirala(a.ad, b.ad))[0]?.id || null;
  const s = D.siniflar.get(G.sinifanaliz.sinifId);
  let govde = `<p class="muted">Sınıf seçin.</p>`;
  if (s) {
    const ogrler = sinifOgrencileri(s.id);
    const odevler = list("odevler", (o) => o.sinifId === s.id).sort((a, b) => a.id - b.id);
    const ozet = kazanimOzeti(ogrler.flatMap((o) => ogrenciSatirlari(o.id)));
    govde = `
      <div class="card"><h2>Ödev yapma tablosu</h2><div class="tablewrap"><table><tr><th>Öğrenci</th>${odevler.map((o) => `<th>${esc(o.baslik)}</th>`).join("")}<th class="sag">Yaptığı</th></tr>
        ${ogrler.map((x) => {
          const d = odevler.map((o) => odevDurumu(o, x.id));
          return `<tr><td><a href="#" data-analiz="${x.id}">${esc(ogrAd(x))}</a></td>${d.map((y) => `<td>${durumCip(y.durum)}${y.n ? ` <span class="small muted">${y.dogru}/${y.n}</span>` : ""}</td>`).join("")}<td class="sag"><b>${d.filter((y) => ["yapti", "gec", "eksik"].includes(y.durum)).length}/${odevler.length}</b></td></tr>`;
        }).join("") || `<tr><td class="muted">Öğrenci yok.</td></tr>`}</table></div></div>
      <div class="card"><h2>Sınıfın kazanımları</h2>
        ${ozet.length ? `<p class="muted small">En zayıf kazanım en üstte. Bir öğrenci, bir kazanımda %${A.eksikSiniri}'in altındaysa (en az ${A.eksikEnAzSoru} soru) "eksik" sayılır.</p><div class="tablewrap"><table><tr><th>Kazanım</th><th>Konu</th><th class="sag">Soru</th><th>Sınıf başarısı</th><th>Eksik olan öğrenciler</th></tr>
          ${ozet.map((k) => `<tr><td><b>${esc(k.kod || "—")}</b>${k.metin ? `<br><span class="small muted">${esc(k.metin)}</span>` : ""}</td><td>${esc(k.konu)}</td><td class="sag">${k.soru}</td><td>${oranCubugu(k.oran)}</td><td class="small">${k.eksikOgr.map((id) => esc(ogrAd(D.ogrenciler.get(id) || {}))).join(", ") || "–"}</td></tr>`).join("")}</table></div>`
          : `<p class="muted">Henüz kontrol edilmiş ödev yok.</p>`}</div>`;
  }
  el.innerHTML = `
    <h1>📊 Sınıf Analizi</h1>
    <div class="filters no-print"><select id="sSinif">${sinifSecenekleri(G.sinifanaliz.sinifId)}</select>${s ? `<button class="btn" id="excel">📤 Excel'e aktar</button><button class="btn" id="yazdir">🖨️ Yazdır</button>` : ""}</div>
    ${govde}`;
  el.querySelector("#sSinif").onchange = (e) => ((G.sinifanaliz.sinifId = +e.target.value || null), ciz());
  el.querySelector("#yazdir")?.addEventListener("click", () => window.print());
  el.querySelectorAll("[data-analiz]").forEach((a) => (a.onclick = (e) => (e.preventDefault(), git("analiz", { sinifId: s.id, ogrenciId: +a.dataset.analiz }))));
  el.querySelector("#excel")?.addEventListener("click", () => {
    const ogrler = sinifOgrencileri(s.id);
    const odevler = list("odevler", (o) => o.sinifId === s.id).sort((a, b) => a.id - b.id);
    const t1 = [["No", "Adı Soyadı", ...odevler.flatMap((o) => [`${o.baslik} – Durum`, `${o.baslik} – Doğru`, `${o.baslik} – Yanlış`, `${o.baslik} – Boş`])]];
    for (const x of ogrler) t1.push([x.no, ogrAd(x), ...odevler.flatMap((o) => { const d = odevDurumu(o, x.id); return [DURUM[d.durum], d.dogru, d.yanlis, d.bos]; })]);
    const ozet = kazanimOzeti(ogrler.flatMap((o) => ogrenciSatirlari(o.id)));
    const t2 = [["Kazanım Kodu", "Kazanım", "Konu", "Soru", "Sınıf başarısı (%)", "Eksik olan öğrenciler"]];
    for (const k of ozet) t2.push([k.kod, k.metin, k.konu, k.soru, k.oran, k.eksikOgr.map((id) => ogrAd(D.ogrenciler.get(id) || {})).join(", ")]);
    const t3 = [["No", "Adı Soyadı", ...ozet.map((k) => k.kod || k.konu)]];
    for (const x of ogrler) {
      const oz = kazanimOzeti(ogrenciSatirlari(x.id));
      t3.push([x.no, ogrAd(x), ...ozet.map((k) => oz.find((y) => y.anahtarAd === k.anahtarAd)?.oran ?? "")]);
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(t1), "Ödev durumu");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(t2), "Kazanımlar");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(t3), "Öğrenci x kazanım (%)");
    XLSX.writeFile(wb, `Odev_Kontrol_${s.ad}${s.ornek ? "_ornek" : ""}.xlsx`);
  });
};

// ---------------------------------------------------------------------------
// YAPAY ZEKÂ sekmesi
// ---------------------------------------------------------------------------
EKRAN.yz = (el) => {
  if (!yzVar()) {
    el.innerHTML = `<h1>🧠 Yapay Zekâ</h1><div class="card uyari">Yapay zekâ dosyaları bulunamadı (YapayZeka klasörü ya da vendor/tf.min.js eksik). Program eşik kuralıyla çalışmaya devam ediyor.</div>`;
    return;
  }
  const b = window.YZ_BASLANGIC;
  const ornek = (tur, kaynak) => list("yzOrnekler", (o) => o.tur === tur && o.kaynak === kaynak).length;
  const ogretmen = ornek("isaret", "ogretmen") + ornek("rakam", "ogretmen") + ornek("harf", "ogretmen");
  const yeni = list("yzOrnekler", (o) => o.kaynak === "ogretmen").length - (YZ.bilgi?.sonDuzeltmeSayisi || 0);
  const gecmis = [...(YZ.bilgi?.gecmis || [])].reverse();
  const yuzde = (v) => (v == null ? "–" : `%${Math.round(v * 100)}`);
  el.innerHTML = `
    <h1>🧠 Yapay Zekâ</h1>
    <div class="hero" style="margin-bottom:16px"><div class="logo-buyuk" aria-hidden="true">🧠</div><div>
      <h2 style="margin:0 0 4px">Kendini eğiten el yazısı okuyucu</h2>
      <p>Üç küçük sinir ağı (TensorFlow.js) bu bilgisayarda çalışır: <b>işaret ağı</b> şıklardaki daire, tik, çarpı gibi işaretleri; <b>rakam ağı</b> elle yazılmış sayıları; <b>harf ağı</b> Türkçe harfleri (ç, ğ, ı, i, ö, ş, ü dahil) okur.
      Sonuç ekranında yanlış okunanları düzelttikçe örnekler birikir ve ağ kendini yeniden eğitir. Yeni eğitim eskisinden kötüyse kabul edilmez.</p></div></div>
    ${YZ.hata ? `<div class="card uyari">⚠ Model yüklenemedi: ${esc(YZ.hata)}</div>` : ""}
    <div class="stats">
      <div class="stat"><b>${YZ.bilgi?.baslangic ? "Başlangıç" : `${YZ.bilgi?.surum}. sürüm`}</b>Model</div>
      <div class="stat"><b>${ornek("isaret", "ogretmen")}</b>İşaret düzeltmesi</div>
      <div class="stat"><b>${ornek("rakam", "ogretmen")}</b>Rakam düzeltmesi</div>
      <div class="stat"><b>${ornek("harf", "ogretmen")}</b>Harf düzeltmesi</div>
      <div class="stat"><b>${ornek("isaret", "otomatik")}</b>Kendi öğrendiği örnek</div>
      <div class="stat"><b>${Math.max(0, yeni)}</b>Eğitimi bekleyen düzeltme</div>
    </div>
    <div class="yanyana">
      <div>
        <div class="card"><h2>Eğitim</h2>
          ${YZ.egitimde ? `<p><span class="spinner"></span> ${esc(YZ.ilerleme)}</p>` : `<p class="muted small" style="margin-top:0">${ogretmen ? `${ogretmen} öğretmen düzeltmesi var.` : "Henüz düzeltme yok. Ödev Kontrol'de bir sayfanın sonucunu açıp yanlış okunanları düzeltin."}</p>`}
          <div class="toolbar"><button class="btn primary" id="yzEgit" ${YZ.egitimde || !YZ.hazir ? "disabled" : ""}>🧠 Şimdi eğit</button></div>
          <div class="form-grid">
            <label>Şıkları yapay zekâ okusun<select id="yzKullan"><option value="1" ${A.yzKullan ? "selected" : ""}>Evet</option><option value="0" ${!A.yzKullan ? "selected" : ""}>Hayır (eşik kuralı)</option></select></label>
            <label>Kendi kendine öğrensin<select id="yzKendi"><option value="1" ${A.yzKendiOgren ? "selected" : ""}>Evet (çok emin olduğu okumalardan)</option><option value="0" ${!A.yzKendiOgren ? "selected" : ""}>Hayır (sadece düzeltmelerden)</option></select></label>
            <label>Kendiliğinden eğit: her … düzeltmede<input type="number" id="yzOto" min="0" max="500" value="${A.yzOtoEgit}"></label>
          </div>
          <p class="muted small">0 yazarsanız kendiliğinden eğitmez; "Şimdi eğit" ile siz başlatırsınız.</p>
          <button class="btn" id="yzAyar">💾 Kaydet</button></div>
        <div class="card"><h2>Yedek</h2>
          <p class="muted small" style="margin-top:0">Yapay zekânın öğrendikleri (ağlar ve bütün eğitim örnekleri) tek bir dosyaya kaydedilir. Başka bir bilgisayara taşıyabilir ya da sonra geri yükleyebilirsiniz. (Ayarlar'daki genel yedek de yapay zekâyı içerir.)</p>
          <div class="toolbar"><button class="btn primary" id="yzDisa">📤 Eğitimi dışa aktar</button><label class="btn">📥 Eğitimi içe aktar<input type="file" id="yzIce" accept=".json" class="dosya-input"></label></div>
          <div class="toolbar"><button class="btn small danger" id="yzSifirla">↩️ Başlangıç modeline dön</button><button class="btn small danger" id="yzOrnekSil">🗑️ Eğitim örneklerini sil</button></div></div>
      </div>
      <div>
        <div class="card"><h2>Eğitim geçmişi</h2>
          ${gecmis.length ? `<div class="tablewrap"><table><tr><th>Tarih</th><th>Ağ</th><th class="sag">Örnek</th><th>Sınama doğruluğu</th><th>Sonuç</th></tr>
            ${gecmis.flatMap((g) => Object.entries(g.turler || {}).map(([t, v]) => `<tr><td class="small">${tarihYaz(g.tarih)}${g.neden === "otomatik" ? " (oto)" : ""}</td><td>${AG_ADI[t]}</td><td class="sag">${v.ogretmen}+${v.otomatik}</td><td>${yuzde(v.once.sinama)} → ${yuzde(v.sonra.sinama)}</td><td>${v.kabul ? `<span class="chip green">Güncellendi</span>` : `<span class="chip orange">Eskisi korundu</span>`}</td></tr>`)).join("")}</table></div>`
            : `<p class="muted">Henüz eğitim yapılmadı; başlangıç modeli kullanılıyor.</p>`}</div>
        <div class="card"><h2>Başlangıç modeli</h2><p class="small muted" style="margin-top:0">${esc(b.aciklama)}</p>
          <table><tr><td>İşaret ağı (denenmemiş sayfalarda)</td><td class="sag"><b>${yuzde(b.olcum.isaretDeneme)}</b></td></tr>
          <tr><td>Fotoğraftaki el yazısı rakamlar</td><td class="sag"><b>${yuzde(b.olcum.rakamFotograf)}</b></td></tr>
          <tr><td>Yazılı cevap (bütün sayı)</td><td class="sag"><b>${esc(b.olcum.yaziliCevap)}</b></td></tr>
          ${b.olcum.harf != null ? `<tr><td>Türkçe harfler (hiç görülmemiş yazı tiplerinde)</td><td class="sag"><b>${yuzde(b.olcum.harf)}</b></td></tr>
          <tr><td>Doğru yazılmış kelimeyi "doğru" sayma</td><td class="sag"><b>${esc(b.olcum.kelimeDogruKabul)}</b></td></tr>
          <tr><td>Başka kelimeyi "yanlış" sayma</td><td class="sag"><b>${esc(b.olcum.kelimeYanlisRed)}</b></td></tr>` : ""}</table>
          <p class="small muted">Bu ölçümler bilgisayarda üretilmiş sayfalarla yapıldı. Gerçek öğrenci yazısında ilk başta daha düşük olabilir; düzelttikçe artar.</p></div>
      </div>
    </div>`;
  el.querySelector("#yzEgit").onclick = () => yzEgit("elle");
  el.querySelector("#yzAyar").onclick = async () => {
    A.yzKullan = el.querySelector("#yzKullan").value === "1";
    A.yzKendiOgren = el.querySelector("#yzKendi").value === "1";
    A.yzOtoEgit = Math.max(0, Math.min(500, +el.querySelector("#yzOto").value || 0));
    await DB.saveAyarlar();
    sonucKarti(true, "Yapay zekâ ayarları kaydedildi");
    ciz();
  };
  el.querySelector("#yzDisa").onclick = () => yzDisaAktar().catch((e) => sonucKarti(false, "Dışa aktarılamadı", [e.message]));
  el.querySelector("#yzIce").onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f || !confirm("Yapay zekânın şu anki eğitimi silinip dosyadaki eğitim yüklenecek. Devam edilsin mi?")) return;
    try {
      const r = await yzIceAktar(f);
      sonucKarti(true, "Yapay zekâ eğitimi yüklendi", [`${r.ornek} eğitim örneği`, r.surum ? `${r.surum}. sürüm model` : "Başlangıç modeli"]);
    } catch (err) {
      sonucKarti(false, "İçe aktarılamadı", [err.message]);
    }
    ciz();
  };
  el.querySelector("#yzSifirla").onclick = async () => {
    if (!confirm("Ağ başlangıç modeline dönsün mü? Eğitim örnekleri silinmez; istediğinizde yeniden eğitebilirsiniz.")) return;
    await yzBaslangicaDon();
    sonucKarti(true, "Başlangıç modeline dönüldü");
    ciz();
  };
  el.querySelector("#yzOrnekSil").onclick = async () => {
    if (!confirm("Bütün eğitim örnekleri silinsin mi? (Ağın şu ana kadar öğrendikleri kalır.)")) return;
    for (const o of list("yzOrnekler")) await DB.del("yzOrnekler", o.id);
    ciz();
  };
};

// ---------------------------------------------------------------------------
// AYARLAR / YEDEK
// ---------------------------------------------------------------------------
async function yedekAl() {
  const veri = { program: "odev-kontrol", surum: 1, tarih: simdi(), ayarlar: A, yzModel: (await DB.req("kv", "readonly", (st) => st.get("yzModel"))) || null };
  const dataUrl = (b) => new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
  for (const s of STORES) {
    veri[s] = [];
    for (const o of D[s].values()) {
      const c = { ...o };
      for (const k of Object.keys(c)) if (c[k] instanceof Blob) c[k] = { $blob: await dataUrl(c[k]) };
      veri[s].push(JSON.parse(JSON.stringify(c, (k, v) => (v instanceof Uint8Array ? { $u8: YapayZeka.b64.yaz(v) } : v))));
    }
  }
  indir(new Blob([JSON.stringify(veri)], { type: "application/json" }), `OdevKontrol_Yedek_${new Date().toISOString().slice(0, 10)}.json`);
}
async function yedektenYukle(dosya) {
  const veri = JSON.parse(await dosya.text());
  if (veri.program !== "odev-kontrol") throw new Error("Bu dosya bir Ödev Kontrol yedeği değil.");
  await DB.clearAll();
  for (const s of STORES)
    for (const o0 of veri[s] || []) {
      const o = JSON.parse(JSON.stringify(o0), (k, v) => (v && typeof v === "object" && v.$u8 != null ? YapayZeka.b64.oku(v.$u8) : v));
      for (const k of Object.keys(o)) if (o[k]?.$blob) o[k] = await (await fetch(o[k].$blob)).blob();
      await DB.put(s, o);
    }
  if (veri.yzModel) await DB.req("kv", "readwrite", (st) => st.put(veri.yzModel, "yzModel"));
  A = { ...VARSAYILAN_AYARLAR, ...(veri.ayarlar || {}) };
  await DB.saveAyarlar();
  temaUygula();
  await yzYukle();
}
function temaUygula() {
  document.documentElement.dataset.tema = A.tema === "koyu" ? "koyu" : "acik";
}

EKRAN.ayar = (el) => {
  el.innerHTML = `
    <h1>⚙️ Ayarlar</h1>
    <div class="yanyana">
      <div>
        <div class="card"><h2>Görünüm</h2><button class="btn" id="tema">${A.tema === "koyu" ? "☀️ Açık mod" : "🌙 Koyu mod"}</button></div>
        <div class="card"><h2>Değerlendirme</h2><div class="form-grid">
          <label>Kazanım "eksik" sınırı (%)<input type="number" min="1" max="100" id="eS" value="${A.eksikSiniri}"></label>
          <label>Eksik demek için en az soru<input type="number" min="1" max="50" id="eN" value="${A.eksikEnAzSoru}"></label>
          <label>Öğrenci çoğunluğu: en az öğrenci<input type="number" min="1" max="100" id="cN" value="${A.cogunlukOgrenci}"></label>
          <label>Öğrenci çoğunluğu: en az oran (%)<input type="number" min="50" max="100" id="cO" value="${A.cogunlukOran}"></label></div>
          <p class="muted small">Öğrenci çoğunluğu: bir sorunun anahtarı girilmediyse, en az bu kadar öğrencinin bu orandan fazlası aynı şıkkı işaretlediğinde o şık geçici anahtar olur.</p>
          <button class="btn primary" id="kaydet">💾 Kaydet</button></div>
      </div>
      <div>
        <div class="card"><h2>Yedek</h2><p class="muted small">Veriler bu bilgisayardaki tarayıcının içinde saklanır. Tarayıcının "tüm site verilerini temizle" seçeneği verileri siler. Düzenli yedek alın.</p>
          <div class="toolbar"><button class="btn primary" id="yedek">💾 Yedek al</button><label class="btn">📂 Yedekten yükle<input type="file" id="geriYukle" accept=".json" class="dosya-input"></label></div></div>
        <div class="card"><h2>Fabrika ayarları</h2><p class="muted small">Bütün sınıflar, öğrenciler, kazanımlar, ödevler, fotoğraflar ve ayarlar silinir; program ilk hâline döner.</p>
          <button class="btn danger" id="fabrika">♻️ Fabrika ayarlarına dön</button></div>
        <div class="card"><h2>Hakkında</h2><p class="small muted">Ödev Kontrol bütün işlemleri bu bilgisayarda yapar; fotoğraflar hiçbir yere gönderilmez ve internet gerekmez. Fotoğraf okuma: OpenCV (sayfa eşleştirme, el yazısı ayırma) ve Tesseract (basılı yazı okuma). Excel: SheetJS.</p></div>
      </div>
    </div>`;
  el.querySelector("#tema").onclick = async () => {
    A.tema = A.tema === "koyu" ? "acik" : "koyu";
    temaUygula();
    await DB.saveAyarlar();
    ciz();
  };
  el.querySelector("#kaydet").onclick = async () => {
    const sayi = (id, min, max) => Math.min(max, Math.max(min, +document.getElementById(id).value || min));
    Object.assign(A, { eksikSiniri: sayi("eS", 1, 100), eksikEnAzSoru: sayi("eN", 1, 50), cogunlukOgrenci: sayi("cN", 1, 100), cogunlukOran: sayi("cO", 50, 100) });
    await DB.saveAyarlar();
    sonucKarti(true, "Ayarlar kaydedildi");
  };
  el.querySelector("#yedek").onclick = () => yedekAl().catch((e) => sonucKarti(false, "Yedek alınamadı", [e.message]));
  el.querySelector("#geriYukle").onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f || !confirm("Şu anki bütün veriler silinip yedekteki veriler yüklenecek. Devam edilsin mi?")) return;
    try {
      await yedektenYukle(f);
      sonucKarti(true, "Yedek yüklendi", [f.name]);
      ciz();
    } catch (err) {
      sonucKarti(false, "Yedek yüklenemedi", [err.message]);
    }
  };
  el.querySelector("#fabrika").onclick = async () => {
    if (!confirm("Bütün bilgiler silinecek. Emin misiniz?")) return;
    await DB.clearAll();
    kuyruk.length = 0;
    temaUygula();
    await yzYukle();
    sonucKarti(true, "Program ilk hâline döndü");
    git("panel");
  };
};

// ---------------------------------------------------------------------------
// Başlat
// ---------------------------------------------------------------------------
document.querySelectorAll("#tabs button").forEach((b) => (b.onclick = () => git(b.dataset.tab)));
(async () => {
  try {
    await DB.open();
  } catch (e) {
    document.querySelector("main").innerHTML = `<div class="card uyari">Veri deposu açılamadı: ${esc(e.message)}. Dosyayı Chrome ya da Edge ile açın.</div>`;
    return;
  }
  temaUygula();
  motorDurumu();
  await yzYukle();
  cvHazir.then(motorDurumu, (e) => (document.getElementById("motor").innerHTML = `⚠ ${esc(e.message)}`));
  // Yarım kalan işleri yeniden sıraya al.
  for (const p of list("sayfalar", (x) => x.durum === "isleniyor" && x.foto)) siraya(() => sayfaIsle(p));
  for (const g of list("gonderimler", (x) => x.durum === "bekliyor" || x.durum === "isleniyor")) siraya(() => gonderimIsle(g));
  git("panel");
})();
