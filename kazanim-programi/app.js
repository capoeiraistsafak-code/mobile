/* Kazanım Takip Programı
 * Veriler tarayıcıda (IndexedDB) saklanır. Excel okuma/yazma için SheetJS (vendor/xlsx.full.min.js).
 */
'use strict';

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------
// Kurumlar ve sınıf seviyeleri Ayarlar'dan değiştirilebilir; bunlar yalnızca ilk kurulumdaki varsayılanlardır.
const VARSAYILAN_SEVIYELER = ['5', '6', '7', '8', '9', '10', '11', '12', 'Mezun'];
const VARSAYILAN_KURUMLAR = [
  { key: 'okul_orta', ad: 'Okul – Ortaokul', tip: 'okul', seviyeler: ['5', '6', '7', '8'] },
  { key: 'okul_lise', ad: 'Okul – Lise', tip: 'okul', seviyeler: ['9', '10', '11', '12'] },
  { key: 'kurs_orta', ad: 'Kurs – Ortaokul', tip: 'kurs', seviyeler: ['5', '6', '7', '8'] },
  { key: 'kurs_lise', ad: 'Kurs – Lise', tip: 'kurs', seviyeler: ['9', '10', '11', '12'] },
  { key: 'kurs_mezun', ad: 'Kurs – Mezun', tip: 'kurs', seviyeler: ['Mezun'] },
];
let KURUMLAR = [];   // = S.kurumlar (kurumlariYukle ile)
let KURUM = {};
// Konu başarısına göre durum ve soru çözme önerisi (Yedek / Ayarlar sekmesinden değiştirilebilir)
const VARSAYILAN_AYARLAR = { esikEksik: 50, esikIyi: 80, soruEksik: 40, soruOrta: 20, animasyon: true, animasyonAralik: 5 };
const VARSAYILAN_DERSLER = [
  'Türkçe', 'Matematik', 'Fen Bilimleri', 'T.C. İnkılap Tarihi ve Atatürkçülük', 'Din Kültürü ve Ahlak Bilgisi',
  'İngilizce', 'Sosyal Bilgiler', 'Türk Dili ve Edebiyatı', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya',
  'Felsefe', 'Geometri',
];

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const trLower = s => String(s ?? '').toLocaleLowerCase('tr-TR');
const trUpper = s => String(s ?? '').toLocaleUpperCase('tr-TR');
/** Başlık eşleştirme için: küçük harf, Türkçe karakterler sadeleşmiş, yalnız harf/rakam. */
function norm(s) {
  return trLower(s).replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[âàá]/g, 'a').replace(/[îí]/g, 'i').replace(/[ûú]/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}
const cmpTr = (a, b) => String(a).localeCompare(String(b), 'tr', { numeric: true });
const bugun = () => new Date().toISOString().slice(0, 10);
function tarihTr(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function gunAdi(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR', { weekday: 'long' });
}
function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), g = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${g}`;
}
const PATI_IKON = '<svg class="pati-ikon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.5c-3.6 0-6.3-1.9-6.3-4.6 0-2.9 3-5.6 6.3-5.6s6.3 2.7 6.3 5.6c0 2.7-2.7 4.6-6.3 4.6z"/><ellipse cx="4.6" cy="10.4" rx="2.3" ry="2.9" transform="rotate(-18 4.6 10.4)"/><ellipse cx="9.2" cy="5.6" rx="2.4" ry="3" transform="rotate(-6 9.2 5.6)"/><ellipse cx="14.8" cy="5.6" rx="2.4" ry="3" transform="rotate(6 14.8 5.6)"/><ellipse cx="19.4" cy="10.4" rx="2.3" ry="2.9" transform="rotate(18 19.4 10.4)"/></svg>';
const patili = metin => esc(metin).replace(/🐾/g, PATI_IKON);
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.innerHTML = patili(msg);
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), ms);
}
function opt(value, label, selected) {
  return `<option value="${esc(value)}"${selected ? ' selected' : ''}>${esc(label)}</option>`;
}
function excelIndir(wb, ad) {
  const veri = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  indir(new Blob([veri], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), ad);
}
// Claude'da yayınlanan sürümde (KT_ARTIFACT) sayfa kendisi dosya indiremez ve yazdıramaz;
// indirme, görüntüleyicinin onayıyla "downloads" yeteneği üzerinden yapılır.
const ARTIFACT = !!window.KT_ARTIFACT;
async function indir(blob, ad) {
  if (ARTIFACT) {
    let dl = null;
    try { dl = window.claude && await window.claude.use('downloads'); } catch (e) { dl = null; }
    if (!dl) { toast('Dosya indirme bu görünümde kullanılamıyor. Programın bilgisayar sürümünü kullanın.', 5000); return; }
    try { await dl.save({ filename: ad, data: blob }); toast('Dosya kaydedildi.'); }
    catch (e) {
      if (e && e.code === 'declined') return;
      toast(e && e.code === 'rate_limited' ? 'Bir indirme penceresi zaten açık; biraz sonra tekrar deneyin.' : 'Dosya kaydedilemedi.', 4000);
    }
    return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = ad;
  // Açık modal pencere varken sayfanın geri kalanı etkisizdir; bağlantıyı pencerenin içine koy
  const dlg = document.querySelector('dialog[open]');
  (dlg || document.body).appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// ---------------------------------------------------------------------------
// Kalıcı depolama (IndexedDB, olmazsa localStorage)
// ---------------------------------------------------------------------------
const DB_NAME = 'kazanim-takip', STORE = 'kv', KEY = 'state';
let S = null; // uygulama durumu

function bosDurum() {
  return {
    surum: 1,
    siniflar: [],    // {id, kurum, seviye, sube}
    ogrenciler: [],  // {id, no, ad, soyad, sinifId}
    kazanimlar: [],  // {id, kod, ders, seviye, unite, konu, metin}
    sinavlar: [],    // {id, ad, tarih, kurum, seviye, sorular:[{no, ders, kazanimId, cevap}]}
    sonuclar: {},    // sinavId -> ogrenciId -> {soruNo: 'Y'|'B'}  (yazılmayan = D)
    planlar: [],     // {id, ogrenciId, olusturma, baslik, not, gorevler:[...]}
    kaynaklar: [],   // içe aktarılan Excel listeleri {id, tur, dosya, yol, sayfa, esIsim, ayar, guncelleme, yolKayitli}
    dersler: VARSAYILAN_DERSLER.slice(),
    ayarlar: { ...VARSAYILAN_AYARLAR },
    seviyeler: VARSAYILAN_SEVIYELER.slice(),
    kurumlar: VARSAYILAN_KURUMLAR.map(k => ({ ...k, seviyeler: k.seviyeler.slice() })),
  };
}
/** S.kurumlar / S.seviyeler'i doğrular ve hızlı erişim tablolarını kurar (S her değiştiğinde çağrılır). */
function kurumlariYukle() {
  if (!Array.isArray(S.seviyeler) || !S.seviyeler.length) S.seviyeler = VARSAYILAN_SEVIYELER.slice();
  S.seviyeler = [...new Set(S.seviyeler.map(v => String(v).trim()).filter(Boolean))];
  seviyeleriSirala();
  if (!Array.isArray(S.kurumlar) || !S.kurumlar.length) S.kurumlar = VARSAYILAN_KURUMLAR.map(k => ({ ...k, seviyeler: k.seviyeler.slice() }));
  S.kurumlar.forEach(k => {
    if (!k.tip) k.tip = String(k.key).startsWith('kurs') ? 'kurs' : 'okul';
    k.seviyeler = (k.seviyeler || []).map(String).filter(v => S.seviyeler.includes(v));
  });
  KURUMLAR = S.kurumlar;
  KURUM = Object.fromEntries(KURUMLAR.map(k => [k.key, k]));
}
/** Seviyeler: sayılar küçükten büyüğe, sonra adlı seviyeler (ör. Hazırlık, Mezun) eklendiği sırayla. */
function seviyeleriSirala() {
  const sayi = S.seviyeler.filter(v => /^\d+$/.test(v)).sort((a, b) => a - b);
  S.seviyeler = [...sayi, ...S.seviyeler.filter(v => !/^\d+$/.test(v))];
}
const seviyeAdi = v => /^\d+$/.test(String(v)) ? `${v}. Sınıf` : String(v);
const kurumAl = key => KURUM[key] || KURUMLAR[0];
const kurumTipi = key => KURUM[key]?.tip || (String(key).startsWith('kurs') ? 'kurs' : 'okul');
/** Okul/kurs belirtilmemişse: mevcut sınıfların çoğunun türündeki ilk kurum. */
function varsayilanKurum() { const tip = varsayilanTip(); return (KURUMLAR.find(k => k.tip === tip) || KURUMLAR[0]).key; }
/** Belirli seviyeyi kapsayan (tercihen o türdeki) kurum. */
function seviyeliKurum(seviye, tip) { return (KURUMLAR.find(k => k.tip === tip && k.seviyeler.includes(seviye)) || KURUMLAR.find(k => k.seviyeler.includes(seviye)) || KURUMLAR[0]).key; }
function idbAc() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function yukle() {
  try {
    const db = await idbAc();
    const v = await new Promise((res, rej) => {
      const r = db.transaction(STORE).objectStore(STORE).get(KEY);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    if (v) return v;
  } catch (e) { console.warn('IndexedDB okunamadı', e); }
  try {
    const ls = localStorage.getItem(DB_NAME);
    if (ls) return JSON.parse(ls);
  } catch (e) { /* yok say */ }
  return null;
}
let kaydetZaman = null;
function kaydet() {
  clearTimeout(kaydetZaman);
  kaydetZaman = setTimeout(kaydetHemen, 250);
}
async function kaydetHemen() {
  try {
    const db = await idbAc();
    await new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(S, KEY);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {
    try { localStorage.setItem(DB_NAME, JSON.stringify(S)); }
    catch (e2) { toast('Veriler kaydedilemedi! Lütfen yedek alın.', 5000); }
  }
}

// ---------------------------------------------------------------------------
// Veri erişim yardımcıları
// ---------------------------------------------------------------------------
const sinifBul = id => S.siniflar.find(s => s.id === id);
const ogrenciBul = id => S.ogrenciler.find(o => o.id === id);
const sinavBul = id => S.sinavlar.find(s => s.id === id);
const kazanimBul = id => S.kazanimlar.find(k => k.id === id);
const adSoyad = o => `${o.ad || ''} ${o.soyad || ''}`.trim();
function sinifAdi(s, kisa = false) {
  if (!s) return '—';
  const sev = seviyeAdi(s.seviye);
  const sube = s.sube ? ` / ${s.sube}` : '';
  const ornek = s.ornek ? ' (örnek)' : '';
  return kisa ? `${sev}${sube}${ornek}` : `${KURUM[s.kurum]?.ad || s.kurum} · ${sev}${sube}${ornek}`;
}
function sinifSirala(a, b) {
  const ki = KURUMLAR.findIndex(k => k.key === a.kurum) - KURUMLAR.findIndex(k => k.key === b.kurum);
  return ki || cmpTr(a.seviye, b.seviye) || cmpTr(a.sube, b.sube);
}
function sinifGetirVeyaOlustur(kurum, seviye, sube) {
  sube = trUpper(String(sube || '').trim());
  seviye = String(seviye || '').trim();
  let s = S.siniflar.find(x => !x.ornek && x.kurum === kurum && x.seviye === seviye && trUpper(x.sube) === sube);
  if (!s) {
    s = { id: uid(), kurum, seviye, sube };
    S.siniflar.push(s);
  }
  return s;
}
const sinifOgrencileri = sinifId => S.ogrenciler.filter(o => o.sinifId === sinifId)
  .sort((a, b) => cmpTr(a.no, b.no) || cmpTr(adSoyad(a), adSoyad(b)));
function kazanimEtiket(k) {
  if (!k) return '—';
  return (k.kod ? k.kod + ' – ' : '') + k.metin;
}
function kazanimBulKodVeyaMetin(kodVeyaMetin, ders, ornek = false) {
  const v = String(kodVeyaMetin || '').trim();
  if (!v) return null;
  const n = norm(v);
  // Kendi sınavların yalnızca kendi kazanımlarına, örnek sınav örnek kazanımlara bağlanır
  const havuz = S.kazanimlar.filter(x => !!x.ornek === !!ornek);
  let k = havuz.find(x => x.kod && norm(x.kod) === n);
  if (k) return k;
  // Kod, metnin başında olabilir: "M.8.1.1.1. Kazanım metni"
  const kodAdayi = v.split(/\s+/)[0];
  k = havuz.find(x => x.kod && norm(x.kod) === norm(kodAdayi));
  if (k) return k;
  const adaylar = havuz.filter(x => norm(x.metin) === n || (n.length > 15 && norm(x.metin).startsWith(n)));
  if (ders) return adaylar.find(x => norm(x.ders) === norm(ders)) || adaylar[0] || null;
  return adaylar[0] || null;
}

// ---------------------------------------------------------------------------
// Sekmeler
// ---------------------------------------------------------------------------
let aktifSekme = 'panel';
function sekmeAc(ad) {
  aktifSekme = ad;
  $$('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === ad));
  $$('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + ad));
  ciz();
}
function ciz() {
  ({
    panel: cizPanel, ogrenci: cizOgrenci, kazanim: cizKazanim, sinav: cizSinav,
    sonuc: cizSonuc, analiz: cizAnaliz, sinifanaliz: cizSinifAnaliz, ayar: cizAyar,
  })[aktifSekme]();
}

// ---------------------------------------------------------------------------
// Excel okuma ve sütun eşleştirme
// ---------------------------------------------------------------------------
const ALANLAR_OGRENCI = {
  no: { ad: 'Öğrenci / okul no', alias: ['ogrencino', 'okulno', 'no', 'numara', 'ogrnumara', 'ogrno', 'ogrencinumarasi', 'okulnumarasi', 'numarasi', 'ogrencinumara'] },
  adsoyad: { ad: 'Ad Soyad (tek sütun)', alias: ['adsoyad', 'adisoyadi', 'adsoyadi', 'ogrenciadisoyadi', 'ogrenciadsoyad', 'ogrenci', 'ogrenciadi', 'isimsoyisim', 'adivesoyadi'] },
  ad: { ad: 'Ad', alias: ['ad', 'adi', 'isim', 'ogrenciad'] },
  soyad: { ad: 'Soyad', alias: ['soyad', 'soyadi', 'soyisim', 'ogrencisoyad'] },
  sinif: { ad: 'Sınıf / Şube (ör. 10-A)', alias: ['sinifsube', 'sinif', 'sinifi', 'sinifsubesi', 'sinifvesube', 'subeadi', 'grup'] },
  seviye: { ad: 'Sınıf seviyesi', alias: ['seviye', 'sinifseviyesi', 'duzey'] },
  sube: { ad: 'Şube', alias: ['sube', 'subesi'] },
  kurum: { ad: 'Kurum türü', alias: ['kurum', 'kurumturu', 'okulturu', 'tur'] },
};
const ALANLAR_KAZANIM = {
  kod: { ad: 'Kazanım kodu', alias: ['kod', 'kazanimkodu', 'kazanimkod', 'kodu', 'ciktikodu', 'ogrenmeciktisikodu'] },
  metin: { ad: 'Kazanım metni', alias: ['kazanim', 'kazanimadi', 'kazanimmetni', 'kazanimlar', 'kazanimaciklamasi', 'aciklama', 'ogrenmeciktisi', 'ogrenmeciktilari', 'cikti'] },
  ders: { ad: 'Ders', alias: ['ders', 'dersadi', 'brans', 'dersler'] },
  seviye: { ad: 'Sınıf seviyesi', alias: ['sinif', 'seviye', 'sinifseviyesi', 'sinifi', 'duzey'] },
  unite: { ad: 'Ünite / Tema', alias: ['unite', 'uniteadi', 'tema', 'temaadi', 'ogrenmealani', 'alan'] },
  konu: { ad: 'Konu', alias: ['konu', 'konuadi', 'altogrenmealani', 'altkonu'] },
};
const ALANLAR_ANAHTAR = {
  no: { ad: 'Soru no', alias: ['soruno', 'soru', 'no', 'sira', 'sorunumarasi'] },
  ders: { ad: 'Ders', alias: ['ders', 'dersadi', 'brans', 'test'] },
  konu: { ad: 'Konu', alias: ['konu', 'konuadi', 'altkonu', 'unite', 'uniteadi'] },
  kazanim: { ad: 'Kazanım (kod veya metin)', alias: ['kazanimkodu', 'kazanim', 'kod', 'kazanimadi', 'kazanimmetni', 'ogrenmeciktisi'] },
  cevap: { ad: 'Doğru cevap', alias: ['cevap', 'dogrucevap', 'cevapanahtari', 'anahtar', 'dogru'] },
};

function excelOku(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const wb = XLSX.read(new Uint8Array(r.result), { type: 'array' });
        const sayfalar = wb.SheetNames.map(ad => ({
          sayfa: ad,
          satirlar: XLSX.utils.sheet_to_json(wb.Sheets[ad], { header: 1, raw: false, defval: '' })
            .map(row => row.map(c => String(c ?? '').trim())),
        })).filter(s => s.satirlar.some(r => r.some(c => c !== '')));
        res(sayfalar);
      } catch (e) { rej(e); }
    };
    r.onerror = () => rej(r.error);
    r.readAsArrayBuffer(file);
  });
}
/** Başlık satırını bul (K12 dosyalarında üstte başlık/logo satırları olabilir). */
function baslikSatiriBul(satirlar, alanlar) {
  const tum = new Set(Object.values(alanlar).flatMap(a => a.alias));
  let enIyi = 0, enIyiSkor = -1;
  for (let i = 0; i < Math.min(20, satirlar.length); i++) {
    const skor = satirlar[i].filter(c => tum.has(norm(c))).length;
    if (skor > enIyiSkor) { enIyi = i; enIyiSkor = skor; }
  }
  return enIyi;
}
function otomatikEsle(basliklar, alanlar) {
  const eslesme = {};
  const kullanildi = new Set();
  const nb = basliklar.map(norm);
  // Önce tam eşleşme (alias sırası öncelik)
  for (const [alan, tanim] of Object.entries(alanlar)) {
    for (const a of tanim.alias) {
      const i = nb.findIndex((h, idx) => h === a && !kullanildi.has(idx));
      if (i >= 0) { eslesme[alan] = i; kullanildi.add(i); break; }
    }
  }
  // Sonra "içerir" eşleşmesi
  for (const [alan, tanim] of Object.entries(alanlar)) {
    if (eslesme[alan] !== undefined) continue;
    for (const a of tanim.alias) {
      if (a.length < 4) continue;
      const i = nb.findIndex((h, idx) => h && h.includes(a) && !kullanildi.has(idx));
      if (i >= 0) { eslesme[alan] = i; kullanildi.add(i); break; }
    }
  }
  // Ad Soyad tek sütun bulunduysa ve ayrıca "ad" yanlışlıkla aynı değilse sorun yok.
  return eslesme;
}
/** Dosya yolundan kurum türü tahmini: "Ogrenci/Kurs Lise/11-A.xlsx" gibi. */
function kurumTahmin(metin) {
  const n = norm(metin);
  if (!n) return null;
  // 1) Ayarlardaki kurum adlarıyla eşleştir (en uzun ad önce): "Kurs Lise", "Etüt Merkezi"...
  const adlar = KURUMLAR.slice().sort((a, b) => norm(b.ad).length - norm(a.ad).length);
  const tam = adlar.find(k => norm(k.ad) && n.includes(norm(k.ad)));
  if (tam) return tam.key;
  // 2) Serbest yazım: tür (okul/kurs) + kademe (ortaokul/lise/mezun)
  const tip = (n.includes('kurs') || n.includes('dershane') || n.includes('etut')) ? 'kurs' : (n.replace(/ortaokul/g, '').includes('okul') ? 'okul' : null);
  const kademe = n.includes('mezun') ? ['Mezun'] : n.includes('ortaokul') ? ['5', '6', '7', '8'] : n.includes('lise') ? ['9', '10', '11', '12'] : null;
  if (!kademe || (!tip && kademe[0] !== 'Mezun')) return null;
  const aday = KURUMLAR.find(k => (!tip || k.tip === tip) && kademe.some(v => k.seviyeler.includes(v)));
  return aday ? aday.key : null;
}
/** "10-A", "10/A", "10 A", "11. Sınıf / B Şubesi", "Mezun", "8A" ... */
/** "10-A", "10/A", "11. Sınıf / B", "Mezun", "Hazırlık-A"... (seviyeler Ayarlar'daki listeden) */
function sinifCoz(metin) {
  const m0 = String(metin || '').trim();
  if (!m0) return null;
  const n = norm(m0);
  // Adlı seviyeler (Mezun, Hazırlık...): en uzun ad önce
  const adli = (S?.seviyeler || VARSAYILAN_SEVIYELER).filter(v => !/^\d+$/.test(v)).sort((a, b) => norm(b).length - norm(a).length);
  for (const v of adli) {
    if (norm(v) && n.includes(norm(v))) {
      const parca = m0.split(/[\s\-\/_.]+/).filter(Boolean);
      const son = parca[parca.length - 1] || '';
      // Şube: seviye adının kendi kelimesi olmayan son kısa parça (ör. "Hazırlık-A" → A)
      const adKelimeleri = v.split(/\s+/).map(norm);
      const sube = parca.length > 1 && son.length <= 4 && !adKelimeleri.includes(norm(son)) ? trUpper(son) : '';
      return { seviye: v, sube };
    }
  }
  const m = m0.match(/(\d{1,2})\s*\.?\s*(?:s[ıi]n[ıi]f[ıi]?)?\s*[-\/\s_.]*\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9]{0,6})/i);
  if (!m) return null;
  const sev = String(parseInt(m[1], 10));
  if (!(S?.seviyeler || VARSAYILAN_SEVIYELER).includes(sev)) return null;
  let sube = (m[2] || '').replace(/^(?:şube|sube)/i, '');
  if (/^s[ıi]n[ıi]f/i.test(sube)) sube = '';
  return { seviye: sev, sube: trUpper(sube) };
}
function seviyeCoz(v) {
  const n = norm(v);
  if (!n) return '';
  const adli = (S?.seviyeler || VARSAYILAN_SEVIYELER).filter(x => !/^\d+$/.test(x)).find(x => norm(x) && n.includes(norm(x)));
  if (adli) return adli;
  const m = String(v).match(/\d{1,2}/);
  return m ? String(parseInt(m[0], 10)) : '';
}
function dosyaAdiTemiz(ad) {
  return ad.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();
}

/** Ortak içe aktarma penceresi. kaynaklar: [{dosya, yol, sayfa, satirlar}] */
function iceAktarPenceresi({ baslik, alanlar, kaynaklar, ekAlanlarHtml, kaynakVarsayilan, uygula, onizleme }) {
  const parcalar = kaynaklar.map((k, i) => {
    const bi = baslikSatiriBul(k.satirlar, alanlar);
    const basliklar = k.satirlar[bi] || [];
    const eslesme = otomatikEsle(basliklar, alanlar);
    return { ...k, i, bi, basliklar, eslesme };
  });
  const html = `
    ${ekAlanlarHtml || ''}
    <p class="muted small">${parcalar.length} sayfa okundu. Sütun eşleştirmelerini kontrol edin; yanlış olanları düzeltin.</p>
    ${parcalar.map(p => {
      const veri = p.satirlar.slice(p.bi + 1).filter(r => r.some(c => c));
      const sutunSec = (alan) => `<select data-p="${p.i}" data-alan="${alan}">
          ${opt('', '— yok —')}
          ${p.basliklar.map((h, idx) => opt(idx, h || `Sütun ${idx + 1}`, p.eslesme[alan] === idx)).join('')}
        </select>`;
      return `<div class="import-file">
        <label class="cb"><input type="checkbox" data-p-aktif="${p.i}" checked>
          <b>${esc(p.yol || p.dosya)}</b> <span class="muted">· ${esc(p.sayfa)} · ${veri.length} satır</span></label>
        ${kaynakVarsayilan ? kaynakVarsayilan(p) : ''}
        <div class="map">${Object.entries(alanlar).map(([a, t]) => `<label>${esc(t.ad)}${sutunSec(a)}</label>`).join('')}</div>
        ${onizleme ? `<div class="onizleme" data-onizleme="${p.i}"></div>` : ''}
        <details><summary class="small muted">Önizleme</summary>
          <div class="tablewrap"><table class="preview">
            <tr>${p.basliklar.map(h => `<th>${esc(h)}</th>`).join('')}</tr>
            ${veri.slice(0, 5).map(r => `<tr>${p.basliklar.map((_, ci) => `<td>${esc(r[ci])}</td>`).join('')}</tr>`).join('')}
          </table></div>
        </details>
      </div>`;
    }).join('')}`;
  const oku = p => {
    const es = {};
    $$(`select[data-p="${p.i}"]`).forEach(s => { if (s.value !== '') es[s.dataset.alan] = parseInt(s.value, 10); });
    const veri = p.satirlar.slice(p.bi + 1).filter(r => r.some(c => c));
    const kayitlar = veri.map(r => Object.fromEntries(Object.entries(es).map(([a, ci]) => [a, (r[ci] || '').trim()])));
    const esIsim = Object.fromEntries(Object.entries(es).map(([a, ci]) => [a, p.basliklar[ci] || '']));
    return { ...p, es, esIsim, kayitlar };
  };
  dialogAc(baslik, html, [
    { ad: 'Vazgeç' },
    {
      ad: 'İçe aktar', primary: true, tikla: () => uygula(parcalar.filter(p => $(`[data-p-aktif="${p.i}"]`).checked).map(oku)),
    },
  ]);
  if (onizleme) {
    // Seçimler değiştikçe "ne oluşturulacak" önizlemesini yenile
    const yenile = () => parcalar.forEach(p => {
      const el = $(`[data-onizleme="${p.i}"]`);
      if (el) el.innerHTML = onizleme(oku(p));
    });
    yenile();
    $('#dlgIcerik').oninput = $('#dlgIcerik').onchange = yenile;
  }
}

// ---------------------------------------------------------------------------
// Dosya seçimi ve kayıtlı dosya yolları
// Chrome / Edge'de dosyanın "tanıtıcısı" saklanır; "Güncelle" aynı dosyayı aynı yerden
// yeniden okur. Desteklenmeyen tarayıcılarda güncellerken dosya yeniden seçilir.
// ---------------------------------------------------------------------------
const EXCEL_UZANTI = /\.(xlsx|xls|xlsm|csv)$/i;
const DOSYA_TIPLERI = [{
  description: 'Excel dosyası',
  accept: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xlsm'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv'],
  },
}];
const taniticiDestek = () => !ARTIFACT && typeof window.showOpenFilePicker === 'function';
const klasorTaniticiDestek = () => !ARTIFACT && typeof window.showDirectoryPicker === 'function';
/** FileList / File[] / girdi listesini {file, yol, handle} listesine çevirir. */
function girdiListesi(x) {
  return [...x].map(f => (f instanceof File ? { file: f, yol: f.webkitRelativePath || f.name, handle: null } : f));
}
async function dosyaSecTanitici(coklu) {
  const hs = await window.showOpenFilePicker({ multiple: coklu, types: DOSYA_TIPLERI });
  return Promise.all(hs.map(async h => ({ file: await h.getFile(), yol: h.name, handle: h })));
}
async function klasorSecTanitici() {
  const kok = await window.showDirectoryPicker({ mode: 'read' });
  const out = [];
  async function gez(d, yol, derinlik) {
    for await (const [ad, h] of d.entries()) {
      if (h.kind === 'file') {
        if (EXCEL_UZANTI.test(ad) && !ad.startsWith('~$')) out.push({ file: await h.getFile(), yol: yol + ad, handle: h });
      } else if (derinlik < 4) await gez(h, yol + ad + '/', derinlik + 1);
    }
  }
  await gez(kok, kok.name + '/', 0);
  return out;
}
/** Tek dosya seç (güncelleme için). İptal edilirse null. */
async function tekDosyaSec() {
  if (taniticiDestek()) {
    try { return (await dosyaSecTanitici(false))[0] || null; }
    catch (e) { if (e && e.name === 'AbortError') return null; }
  }
  return new Promise(res => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.xlsx,.xls,.xlsm,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv';
    inp.className = 'dosya-input';
    inp.onchange = () => { res(inp.files[0] ? { file: inp.files[0], yol: inp.files[0].name, handle: null } : null); inp.remove(); };
    (document.querySelector('dialog[open]') || document.body).appendChild(inp);
    inp.click();
  });
}
async function idbIslem(mod, fn) {
  const db = await idbAc();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, mod);
    const r = fn(tx.objectStore(STORE));
    tx.oncomplete = () => res(r && 'result' in r ? r.result : undefined);
    tx.onerror = () => rej(tx.error);
  });
}
async function taniticiKaydet(id, handle) { try { await idbIslem('readwrite', st => st.put(handle, 'h:' + id)); return true; } catch (e) { return false; } }
async function taniticiOku(id) { try { return await idbIslem('readonly', st => st.get('h:' + id)); } catch (e) { return null; } }
async function taniticiSil(id) { try { await idbIslem('readwrite', st => st.delete('h:' + id)); } catch (e) { /* yok say */ } }

async function dosyalariOku(girdiler, filtreKlasor) {
  const dosyalar = girdiListesi(girdiler).filter(g => EXCEL_UZANTI.test(g.file.name) && !g.file.name.startsWith('~$'));
  let secili = dosyalar;
  if (filtreKlasor) {
    // Öğretici (örnek) dosyalar kendi verin değildir; klasörden yüklerken atlanır
    const ogreticisiz = secili.filter(g => !g.yol.split('/').slice(0, -1).some(p => norm(p) === 'ogretici'));
    if (ogreticisiz.length) secili = ogreticisiz;
    // Seçilen klasörün içinde Ogrenci/Kazanim alt klasörü varsa yalnızca onu al
    const alt = dosyalar.filter(g => g.yol.split('/').slice(0, -1).some(p => norm(p) === filtreKlasor));
    if (alt.length) secili = alt;
  }
  if (!secili.length) { toast('Seçilen yerde Excel dosyası bulunamadı.'); return []; }
  const kaynaklar = [];
  for (const g of secili) {
    try {
      const sayfalar = await excelOku(g.file);
      sayfalar.forEach(s => kaynaklar.push({ dosya: g.file.name, yol: g.yol, sayfa: s.sayfa, satirlar: s.satirlar, handle: g.handle, girdi: g }));
    } catch (e) {
      console.error(e);
      sonucGoster([{ ok: false, baslik: `${g.file.name} açılamadı`, detay: 'Dosya bozuk olabilir ya da Excel dosyası değil.' }]);
    }
  }
  return kaynaklar;
}

// ---------------------------------------------------------------------------
// İçe aktarılan listeler (kaynaklar): kalıcı kayıt, güncelleme ve silme
// ---------------------------------------------------------------------------
const kaynakBul = id => S.kaynaklar.find(k => k.id === id);
/** Aynı dosya + sayfa daha önce aktarıldıysa onun kaydını kullan (yeniden aktarma = güncelleme). */
function kaynakKaydiAl(tur, p, ayar) {
  let k = S.kaynaklar.find(x => x.tur === tur && x.yol === p.yol && x.sayfa === p.sayfa);
  if (!k) { k = { id: uid(), tur, eklenme: new Date().toISOString() }; S.kaynaklar.push(k); }
  Object.assign(k, { dosya: p.dosya, yol: p.yol, sayfa: p.sayfa, esIsim: p.esIsim, ayar, guncelleme: new Date().toISOString() });
  return k;
}
async function kaynakTaniticisiniSakla(k, handle) {
  if (handle && await taniticiKaydet(k.id, handle)) k.yolKayitli = true;
}
/** Kayıtlı sütun adlarına göre satırları yeniden okur (sütun yeri değişse de bulur). */
function kaynakSatirlari(k, satirlar) {
  const alanlar = k.tur === 'ogrenci' ? ALANLAR_OGRENCI : ALANLAR_KAZANIM;
  const bi = baslikSatiriBul(satirlar, alanlar);
  const basliklar = satirlar[bi] || [];
  const oto = otomatikEsle(basliklar, alanlar);
  const es = {};
  Object.keys(alanlar).forEach(alan => {
    const isim = k.esIsim?.[alan];
    if (isim !== undefined) {
      const idx = basliklar.findIndex(h => norm(h) === norm(isim));
      if (idx >= 0) { es[alan] = idx; return; }
    }
    if (oto[alan] !== undefined && (isim !== undefined || !k.esIsim)) es[alan] = oto[alan];
  });
  return satirlar.slice(bi + 1).filter(r => r.some(c => c))
    .map(r => Object.fromEntries(Object.entries(es).map(([a, ci]) => [a, (r[ci] || '').trim()])));
}
/** Sınıf Excel'i yeniden yüklendi: eski liste gider, yenisi gelir.
 *  Bu Excel'de geçen sınıflarda, yeni Excel'de olmayan öğrenciler (ve bu listeden gelip artık yer almayanlar) çıkarılır. */
function sinifListesiniYenile(dokunulan, kaynakId) {
  const siniflar = new Set(S.ogrenciler.filter(o => dokunulan.has(o.id)).map(o => o.sinifId));
  const cikan = S.ogrenciler.filter(o => !o.ornek && !dokunulan.has(o.id) && (siniflar.has(o.sinifId) || o.kaynakId === kaynakId));
  if (cikan.length) ogrencileriSil(cikan.map(o => o.id));
  // Öğrencisi kalmayan eski liste kayıtlarını temizle
  S.kaynaklar.filter(k => k.tur === 'ogrenci' && !S.ogrenciler.some(o => o.kaynakId === k.id)).forEach(k => { taniticiSil(k.id); });
  S.kaynaklar = S.kaynaklar.filter(k => k.tur !== 'ogrenci' || S.ogrenciler.some(o => o.kaynakId === k.id));
  return cikan.length;
}
function ogrencileriSil(ids) {
  const set = new Set(ids);
  const etkilenenSinif = new Set(S.ogrenciler.filter(o => set.has(o.id)).map(o => o.sinifId));
  S.ogrenciler = S.ogrenciler.filter(o => !set.has(o.id));
  Object.values(S.sonuclar).forEach(x => ids.forEach(id => delete x[id]));
  S.planlar = S.planlar.filter(p => !set.has(p.ogrenciId));
  // Boş kalan sınıfları kaldır
  S.siniflar = S.siniflar.filter(c => !etkilenenSinif.has(c.id) || S.ogrenciler.some(o => o.sinifId === c.id));
}
function kazanimlariSil(ids) {
  const set = new Set(ids);
  S.kazanimlar = S.kazanimlar.filter(k => !set.has(k.id));
  S.sinavlar.forEach(s => s.sorular.forEach(q => { if (set.has(q.kazanimId)) q.kazanimId = ''; }));
}
/** Dosyada artık olmayan kayıtları sor. */
function cikanlariSor(tur, liste, ozet, ekHtml = '') {
  if (!liste.length) { sonucGoster([{ ok: true, baslik: ozet, html: ekHtml }]); return; }
  const ogr = tur === 'ogrenci';
  const adlar = liste.slice(0, 30).map(x => ogr ? `${x.no ? x.no + ' ' : ''}${adSoyad(x)}` : kazanimEtiket(x));
  setTimeout(() => dialogAc(ogr ? 'Listeden çıkan öğrenciler' : 'Listeden çıkan kazanımlar', `
    <p>${esc(ozet)}</p>${ekHtml}
    <p><b>Excel dosyasında artık olmayan ${liste.length} ${ogr ? 'öğrenci' : 'kazanım'} var:</b></p>
    <ul class="small">${adlar.map(a => `<li>${esc(a)}</li>`).join('')}${liste.length > 30 ? `<li>… ve ${liste.length - 30} tane daha</li>` : ''}</ul>
    <p class="muted small">${ogr ? 'Silinirse bu öğrencilerin sınav sonuçları ve ödev planları da silinir.' : 'Silinirse sınav sorularındaki bu kazanım eşleşmeleri boşalır.'}</p>`, [
    { ad: 'Silme, programda kalsın' },
    { ad: 'Programdan sil', danger: true, tikla: () => { ogr ? ogrencileriSil(liste.map(x => x.id)) : kazanimlariSil(liste.map(x => x.id)); kaydet(); ciz(); toast(`${liste.length} kayıt silindi.`); } },
  ]), 0);
}

// ---------------------------------------------------------------------------
// Öğrenci içe aktarma
// ---------------------------------------------------------------------------
/** Bir öğrenci satırının hangi sınıfa gideceğini bulur (Excel sütunları → dosya adı → pencerede seçilen). */
function sinifCozumle(r, ayar) {
  let kurum = (r.kurum && kurumTahmin(r.kurum)) || (KURUM[ayar.vk] ? ayar.vk : '');
  const acikKurum = !!kurum;
  if (!kurum) kurum = KURUM[ayar.genelKurum] ? ayar.genelKurum : varsayilanKurum();
  let seviye = '', sube = '';
  if (r.sinif) { const c = sinifCoz(r.sinif); if (c) { seviye = c.seviye; sube = c.sube; } }
  if (r.seviye) seviye = seviyeCoz(r.seviye) || seviye;
  if (r.sube) sube = trUpper(r.sube.replace(/şube(si)?/i, '').trim());
  if (!S.seviyeler.includes(seviye)) seviye = '';
  if (!seviye && S.seviyeler.includes(ayar.vs)) seviye = ayar.vs;
  if (!sube) sube = ayar.vsb || '';
  if (!seviye) seviye = kurumAl(kurum).seviyeler[0] || S.seviyeler[0];
  sube = trUpper(String(sube || '').trim());
  // Kurum bu seviyeyi kapsamıyorsa (ör. 10. sınıf + ortaokul, Mezun + okul) aynı türde kapsayan kuruma geç
  if (!kurumAl(kurum).seviyeler.includes(seviye)) kurum = seviyeliKurum(seviye, kurumTipi(kurum));
  // Kurum yazılmamışsa ve aynı seviye-şubede tek bir sınıf varsa o sınıf kullanılır (yeni sınıf açılmaz)
  if (!acikKurum) {
    const ayni = S.siniflar.filter(c => !c.ornek && String(c.seviye) === String(seviye) && trUpper(c.sube) === sube);
    if (ayni.length === 1) kurum = ayni[0].kurum;
  }
  return { kurum, seviye: String(seviye), sube };
}
const sinifVarMi = c => S.siniflar.find(x => !x.ornek && x.kurum === c.kurum && x.seviye === c.seviye && trUpper(x.sube) === c.sube);
/** Öğrenci satırlarını uygular. ayar: {vk, genelKurum, vs, vsb, cakisma} */
function ogrenciSatirlariUygula(kayitlar, ayar, kaynakId) {
  const sonuc = { eklendi: 0, guncellendi: 0, atlandi: 0, hatali: 0, dokunulan: new Set() };
  for (const r of kayitlar) {
    let ad = r.ad || '', soyad = r.soyad || '';
    if (r.adsoyad && !ad && !soyad) {
      const parca = r.adsoyad.trim().split(/\s+/);
      soyad = parca.length > 1 ? parca.pop() : '';
      ad = parca.join(' ');
    } else if (r.adsoyad && !ad) ad = r.adsoyad;
    if (!ad && !soyad) { sonuc.hatali++; continue; }
    const { kurum, seviye, sube } = sinifCozumle(r, ayar);
    const sinif = sinifGetirVeyaOlustur(kurum, seviye, sube);
    const no = (r.no || '').trim();
    const ayniTip = o => kurumTipi(sinifBul(o.sinifId)?.kurum) === kurumTipi(kurum);
    const mevcut = no
      ? S.ogrenciler.find(o => !o.ornek && o.no === no && ayniTip(o) && !sonuc.dokunulan.has(o.id))
      : S.ogrenciler.find(o => !o.ornek && norm(adSoyad(o)) === norm(ad + ' ' + soyad) && o.sinifId === sinif.id && !sonuc.dokunulan.has(o.id));
    if (mevcut) {
      sonuc.dokunulan.add(mevcut.id);
      if (ayar.cakisma === 'atla') { sonuc.atlandi++; continue; }
      Object.assign(mevcut, { ad: ad.trim(), soyad: soyad.trim(), sinifId: sinif.id, kaynakId });
      sonuc.guncellendi++;
    } else {
      const o = { id: uid(), no, ad: ad.trim(), soyad: soyad.trim(), sinifId: sinif.id, kaynakId };
      S.ogrenciler.push(o);
      sonuc.dokunulan.add(o.id);
      sonuc.eklendi++;
    }
  }
  // Yer değiştiren öğrencilerin eski sınıfları boş kaldıysa kaldır
  S.siniflar = S.siniflar.filter(c => S.ogrenciler.some(o => o.sinifId === c.id) || c.elle);
  return sonuc;
}
const ozetMetni = (r, birim) => `${r.eklendi} ${birim} eklendi, ${r.guncellendi} güncellendi${r.atlandi ? `, ${r.atlandi} atlandı` : ''}${r.hatali ? `, ${r.hatali} satır boş/hatalı` : ''}.`;

async function ogrenciIceAktarElle(girdiler, klasor) {
  const kaynaklar = await dosyalariOku(girdiler, klasor ? 'ogrenci' : null);
  if (!kaynaklar.length) return;
  const kurumSec = (ad, sec) => `<select name="${ad}">${KURUMLAR.map(k => opt(k.key, k.ad, k.key === sec)).join('')}</select>`;
  iceAktarPenceresi({
    baslik: 'Öğrenci listesi içe aktar',
    alanlar: ALANLAR_OGRENCI,
    kaynaklar,
    kaynakVarsayilan: p => {
      const eski = S.kaynaklar.find(x => x.tur === 'ogrenci' && x.yol === p.yol && x.sayfa === p.sayfa);
      const kTahmin = eski?.ayar.vk ?? (kurumTahmin(p.yol + ' ' + p.sayfa) || '');
      const sTahmin = eski ? { seviye: eski.ayar.vs, sube: eski.ayar.vsb } : (sinifCoz(dosyaAdiTemiz(p.dosya)) || sinifCoz(p.sayfa) || {});
      const seviyeler = [...new Set(KURUMLAR.flatMap(k => k.seviyeler))];
      return `${eski ? '<p class="small"><span class="chip">Bu dosya daha önce aktarılmış; liste güncellenecek.</span></p>' : ''}<div class="map">
        <label>Kurum türü (Excel'de yoksa)
          <select data-vk="${p.i}">${opt('', '— üstteki genel seçim —')}${KURUMLAR.map(k => opt(k.key, k.ad, k.key === kTahmin)).join('')}</select></label>
        <label>Sınıf seviyesi (Excel'de yoksa)
          <select data-vs="${p.i}">${opt('', '— Excel\'den oku —')}${seviyeler.map(s => opt(s, seviyeAdi(s), s === sTahmin.seviye)).join('')}</select></label>
        <label>Şube (Excel'de yoksa)
          <input data-vsb="${p.i}" value="${esc(sTahmin.sube || '')}" placeholder="ör. A"></label>
      </div>`;
    },
    ekAlanlarHtml: `<div class="form-grid" style="margin-bottom:10px">
        <label>Genel kurum türü (dosyada belirtilmemişse)${kurumSec('genelKurum', varsayilanKurum())}</label>
        <label>Aynı numaralı öğrenci varsa
          <select name="cakisma">${opt('guncelle', 'Bilgilerini ve sınıfını güncelle', true)}${opt('atla', 'Atla (dokunma)')}</select></label>
      </div>`,
    onizleme: p => {
      const ayar = { vk: $(`[data-vk="${p.i}"]`).value, genelKurum: $('[name=genelKurum]').value, vs: $(`[data-vs="${p.i}"]`).value, vsb: $(`[data-vsb="${p.i}"]`).value.trim() };
      const sayac = new Map();
      for (const r of p.kayitlar) {
        if (!r.ad && !r.soyad && !r.adsoyad) continue;
        const c = sinifCozumle(r, ayar);
        const key = `${c.kurum}|${c.seviye}|${c.sube}`;
        if (!sayac.has(key)) sayac.set(key, { ...c, n: 0 });
        sayac.get(key).n++;
      }
      if (!sayac.size) return '<span class="chip orange">Ad veya ad soyad sütunu seçilmedi</span>';
      return `<b class="small">Öğrencilerin gideceği sınıflar:</b> ` + [...sayac.values()].sort(sinifSirala).map(c =>
        `<span class="chip ${sinifVarMi(c) ? '' : 'green'}">${esc(sinifAdi(c))} · ${c.n} öğrenci${sinifVarMi(c) ? '' : ' · <b>yeni sınıf oluşturulacak</b>'}</span>`).join(' ');
    },
    uygula: secilenler => {
      const genelKurum = $('[name=genelKurum]').value;
      const cakisma = $('[name=cakisma]').value;
      const oncekiSiniflar = new Set(S.siniflar.map(c => c.id));
      const toplam = { eklendi: 0, guncellendi: 0, atlandi: 0, hatali: 0 };
      const cikanlar = [];
      for (const p of secilenler) {
        const ayar = { vk: $(`[data-vk="${p.i}"]`).value, genelKurum, vs: $(`[data-vs="${p.i}"]`).value, vsb: $(`[data-vsb="${p.i}"]`).value.trim(), cakisma };
        const k = kaynakKaydiAl('ogrenci', p, ayar);
        const r = ogrenciSatirlariUygula(p.kayitlar, ayar, k.id);
        Object.keys(toplam).forEach(x => { toplam[x] += r[x]; });
        toplam.cikarildi = (toplam.cikarildi || 0) + sinifListesiniYenile(r.dokunulan, k.id);
        kaynakTaniticisiniSakla(k, p.handle).then(() => { kaydet(); ciz(); });
      }
      kaydet(); ciz();
      const yeniSiniflar = S.siniflar.filter(c => !oncekiSiniflar.has(c.id)).sort(sinifSirala);
      cikanlariSor('ogrenci', cikanlar, ozetMetni(toplam, 'öğrenci') + (toplam.cikarildi ? ` ${toplam.cikarildi} öğrenci yeni listede olmadığı için çıkarıldı.` : '') + ' Liste kaydedildi; “İçe aktarılan listeler” bölümünden güncelleyebilir veya silebilirsiniz.',
        yeniSiniflar.length ? `<p><b>Sistemde olmayan ${yeniSiniflar.length} sınıf otomatik oluşturuldu:</b></p><ul>${yeniSiniflar.map(c => `<li>${esc(sinifAdi(c))} · ${S.ogrenciler.filter(o => o.sinifId === c.id).length} öğrenci</li>`).join('')}</ul>` : '');
    },
  });
}

// ---------------------------------------------------------------------------
// Kazanım içe aktarma
// ---------------------------------------------------------------------------
function dersTahmin(metin) {
  const n = norm(metin);
  const dersler = [...new Set([...S.dersler, ...S.kazanimlar.map(k => k.ders)])].filter(Boolean)
    .sort((a, b) => norm(b).length - norm(a).length);
  const d = dersler.find(d => n.includes(norm(d)));
  if (d) return d;
  const kisalt = { mat: 'Matematik', turkce: 'Türkçe', fen: 'Fen Bilimleri', sosyal: 'Sosyal Bilgiler', ingilizce: 'İngilizce', inkilap: 'T.C. İnkılap Tarihi ve Atatürkçülük', din: 'Din Kültürü ve Ahlak Bilgisi', edebiyat: 'Türk Dili ve Edebiyatı', cografya: 'Coğrafya', biyoloji: 'Biyoloji', kimya: 'Kimya', fizik: 'Fizik', tarih: 'Tarih', felsefe: 'Felsefe', geometri: 'Geometri' };
  const k = Object.keys(kisalt).find(k => n.includes(k));
  return k ? kisalt[k] : '';
}
/** Kazanım satırlarını uygular. ayar: {vd, vs} */
function kazanimSatirlariUygula(kayitlar, ayar, kaynakId) {
  const sonuc = { eklendi: 0, guncellendi: 0, atlandi: 0, hatali: 0, dokunulan: new Set() };
  let sonUnite = '', sonKonu = '';
  for (const r of kayitlar) {
    let kod = (r.kod || '').trim(), metin = (r.metin || '').trim();
    // Birleştirilmiş hücreler için ünite/konu bir önceki satırdan devam eder
    if (r.unite) sonUnite = r.unite;
    if (r.konu) sonKonu = r.konu;
    if (!metin && !kod) continue;
    if (!kod) {
      // "M.8.1.1.1. Metin" şeklinde birleşik olabilir
      const m = metin.match(/^([A-ZÇĞİÖŞÜ]{1,6}\.?\s?(?:\d+\.)+\d*\.?)\s+(.+)$/);
      if (m) { kod = m[1].replace(/\.$/, ''); metin = m[2]; }
    }
    if (!metin) { metin = kod; }
    if (/^kazan[ıi]m/i.test(metin) && !kod) { sonuc.hatali++; continue; }
    const ders = (r.ders || ayar.vd || 'Belirtilmemiş').trim();
    const seviye = seviyeCoz(r.seviye) || ayar.vs || '';
    const veri = { kod, ders, seviye, unite: (r.unite || sonUnite).trim(), konu: (r.konu || sonKonu).trim(), metin, kaynakId };
    const mevcut = kod
      ? S.kazanimlar.find(k => !k.ornek && k.kod && norm(k.kod) === norm(kod) && norm(k.ders) === norm(ders))
      : S.kazanimlar.find(k => !k.ornek && norm(k.metin) === norm(metin) && norm(k.ders) === norm(ders) && k.seviye === seviye);
    if (mevcut) { Object.assign(mevcut, veri); sonuc.guncellendi++; sonuc.dokunulan.add(mevcut.id); }
    else { const k = { id: uid(), ...veri }; S.kazanimlar.push(k); sonuc.eklendi++; sonuc.dokunulan.add(k.id); }
    if (ders && !S.dersler.some(d => norm(d) === norm(ders))) S.dersler.push(ders);
  }
  return sonuc;
}
async function kazanimIceAktarElle(girdiler, klasor) {
  const kaynaklar = await dosyalariOku(girdiler, klasor ? 'kazanim' : null);
  if (!kaynaklar.length) return;
  const seviyeler = S.seviyeler;
  iceAktarPenceresi({
    baslik: 'Kazanım listesi içe aktar',
    alanlar: ALANLAR_KAZANIM,
    kaynaklar,
    kaynakVarsayilan: p => {
      const eski = S.kaynaklar.find(x => x.tur === 'kazanim' && x.yol === p.yol && x.sayfa === p.sayfa);
      const metin = p.yol + ' ' + (/^(sheet|sayfa)\d*$/i.test(norm(p.sayfa)) ? '' : p.sayfa);
      const d = eski ? eski.ayar.vd : dersTahmin(metin);
      const sv = eski ? eski.ayar.vs : ((dosyaAdiTemiz(p.dosya).match(/(?:^|\D)(1[0-2]|[5-9])(?:\D|$)/) || [])[1] || '');
      return `${eski ? '<p class="small"><span class="chip">Bu dosya daha önce aktarılmış; liste güncellenecek.</span></p>' : ''}<div class="map">
        <label>Ders (Excel'de yoksa)<input data-vd="${p.i}" value="${esc(d)}" list="dersDL"></label>
        <label>Sınıf seviyesi (Excel'de yoksa)
          <select data-vs="${p.i}">${opt('', '—')}${seviyeler.map(s => opt(s, seviyeAdi(s), s === sv)).join('')}</select></label>
      </div>`;
    },
    ekAlanlarHtml: `<datalist id="dersDL">${S.dersler.map(d => opt(d, d)).join('')}</datalist>`,
    onizleme: p => {
      const vd = $(`[data-vd="${p.i}"]`).value.trim(), vs = $(`[data-vs="${p.i}"]`).value;
      const grup = new Map();
      for (const r of p.kayitlar) {
        if (!r.metin && !r.kod) continue;
        const ders = (r.ders || vd || 'Belirtilmemiş').trim(), seviye = seviyeCoz(r.seviye) || vs || '';
        const key = ders + '|' + seviye;
        if (!grup.has(key)) grup.set(key, { ders, seviye, n: 0 });
        grup.get(key).n++;
      }
      if (!grup.size) return '<span class="chip orange">Kazanım metni veya kodu sütunu seçilmedi</span>';
      return `<b class="small">Kazanımların gideceği ders ve sınıflar:</b> ` + [...grup.values()].sort((a, b) => cmpTr(a.ders, b.ders) || cmpTr(a.seviye, b.seviye)).map(g => {
        const dersVar = S.kazanimlar.some(k => norm(k.ders) === norm(g.ders));
        const grupVar = S.kazanimlar.some(k => norm(k.ders) === norm(g.ders) && k.seviye === g.seviye);
        const not = !dersVar ? ' · <b>yeni ders oluşturulacak</b>' : !grupVar ? ' · <b>yeni sınıf seviyesi</b>' : '';
        return `<span class="chip ${not ? 'green' : ''}">${esc(g.ders)}${g.seviye ? ' · ' + esc(seviyeAdi(g.seviye)) : ''} · ${g.n} kazanım${not}</span>`;
      }).join(' ');
    },
    uygula: secilenler => {
      const toplam = { eklendi: 0, guncellendi: 0, atlandi: 0, hatali: 0 };
      const oncekiDersler = new Set(S.kazanimlar.map(k => norm(k.ders)));
      const oncekiGruplar = new Set(S.kazanimlar.map(k => norm(k.ders) + '|' + k.seviye));
      const cikanlar = [];
      for (const p of secilenler) {
        const ayar = { vd: $(`[data-vd="${p.i}"]`).value.trim(), vs: $(`[data-vs="${p.i}"]`).value };
        const k = kaynakKaydiAl('kazanim', p, ayar);
        const r = kazanimSatirlariUygula(p.kayitlar, ayar, k.id);
        Object.keys(toplam).forEach(x => { toplam[x] += r[x]; });
        cikanlar.push(...S.kazanimlar.filter(z => z.kaynakId === k.id && !r.dokunulan.has(z.id)));
        kaynakTaniticisiniSakla(k, p.handle).then(() => { kaydet(); ciz(); });
      }
      kaydet(); ciz();
      const yeniDersler = [...new Set(S.kazanimlar.filter(k => !oncekiDersler.has(norm(k.ders))).map(k => k.ders))].sort(cmpTr);
      const yeniGruplar = [...new Set(S.kazanimlar.filter(k => oncekiDersler.has(norm(k.ders)) && k.seviye && !oncekiGruplar.has(norm(k.ders) + '|' + k.seviye)).map(k => `${k.ders} · ${seviyeAdi(k.seviye)}`))].sort(cmpTr);
      cikanlariSor('kazanim', cikanlar, ozetMetni(toplam, 'kazanım') + ' Liste kaydedildi; “İçe aktarılan listeler” bölümünden güncelleyebilir veya silebilirsiniz.',
        (yeniDersler.length ? `<p><b>Sistemde olmayan ${yeniDersler.length} ders otomatik oluşturuldu:</b> ${yeniDersler.map(esc).join(', ')}</p>` : '')
        + (yeniGruplar.length ? `<p><b>Mevcut derslere yeni sınıf seviyesi eklendi:</b> ${yeniGruplar.map(esc).join(', ')}</p>` : ''));
    },
  });
}

// ---------------------------------------------------------------------------
// TEK TIKLA İÇE AKTARMA
// Excel seçilince sütunlar otomatik tanınır ve hemen aktarılır; sonuç yeşil ✓ / kırmızı ✗
// kartla gösterilir. Tanınamayan dosyada kart "Sütunları elle eşleştir" seçeneği sunar.
// ---------------------------------------------------------------------------
const genelSayfa = ad => /^(sheet|sayfa)\d*$/i.test(norm(ad));
function otomatikParca(k, alanlar) {
  const bi = baslikSatiriBul(k.satirlar, alanlar);
  const basliklar = k.satirlar[bi] || [];
  const es = otomatikEsle(basliklar, alanlar);
  const veri = k.satirlar.slice(bi + 1).filter(r => r.some(c => c));
  const kayitlar = veri.map(r => Object.fromEntries(Object.entries(es).map(([a, ci]) => [a, (r[ci] || '').trim()])));
  const esIsim = Object.fromEntries(Object.entries(es).map(([a, ci]) => [a, basliklar[ci] || '']));
  return { ...k, bi, basliklar, es, esIsim, kayitlar };
}
/** Okul mu kurs mu belirtilmemişse: mevcut sınıfların çoğu hangisiyse o, hiç yoksa okul. */
function varsayilanTip() {
  const kendi = S.siniflar.filter(c => !c.ornek);
  const kurs = kendi.filter(c => kurumTipi(c.kurum) === 'kurs').length;
  return kurs > kendi.length - kurs ? 'kurs' : 'okul';
}
function otoAyar(tur, p) {
  const eski = S.kaynaklar.find(x => x.tur === tur && x.yol === p.yol && x.sayfa === p.sayfa);
  if (eski) return { ...eski.ayar };
  if (tur === 'ogrenci') {
    const sT = sinifCoz(dosyaAdiTemiz(p.dosya)) || (!genelSayfa(p.sayfa) && sinifCoz(p.sayfa)) || {};
    return { vk: kurumTahmin(p.yol + ' ' + p.sayfa) || '', genelKurum: varsayilanKurum(), vs: sT.seviye || '', vsb: sT.sube || '', cakisma: 'guncelle' };
  }
  const svAday = (dosyaAdiTemiz(p.dosya).match(/(?:^|\D)(\d{1,2})(?:\D|$)/) || [])[1] || '';
  const sv = S.seviyeler.includes(svAday) ? svAday : '';
  return { vd: dersTahmin(p.yol + ' ' + (genelSayfa(p.sayfa) ? '' : p.sayfa)), vs: sv };
}
/** Otomatik aktarmaya engel bir sorun varsa açıklamasını döndürür. */
function otoHata(tur, p, ayar) {
  if (tur === 'ogrenci') {
    if (p.es.ad === undefined && p.es.adsoyad === undefined) return 'Öğrenci adlarının olduğu sütun bulunamadı. Başlık satırında “Adı” ve “Soyadı” (ya da “Ad Soyad”) yazmalı.';
    if (!p.kayitlar.some(r => r.ad || r.soyad || r.adsoyad)) return 'Dosyada öğrenci satırı yok.';
    if (p.es.sinif === undefined && p.es.seviye === undefined && !ayar.vs) return 'Sınıf bilgisi bulunamadı. “Sınıf/Şube” sütunu ekleyin (ör. 9-A) ya da dosyanın adını sınıf yapın (ör. 9-A.xlsx).';
    return '';
  }
  if (p.es.metin === undefined && p.es.kod === undefined) return 'Kazanım sütunu bulunamadı. Başlık satırında “Kazanım” (ve isterseniz “Kazanım Kodu”) yazmalı.';
  if (!p.kayitlar.some(r => r.metin || r.kod)) return 'Dosyada kazanım satırı yok.';
  if (p.es.ders === undefined && !ayar.vd) return 'Ders bulunamadı. “Ders” sütunu ekleyin ya da dosyanın adına dersi yazın (ör. Matematik_9.xlsx).';
  return '';
}
// Aynı anda tek veri işlemi (Excel yükleme, liste güncelleme, yedekten dönüş): ikinci basış beklemeye alınmaz, uyarılır
let islemSuruyor = false;
function tekIslem(fn) {
  return async (...args) => {
    if (islemSuruyor) { toast('Önceki işlem bitmeden yenisi başlatılamaz, birkaç saniye bekle 🐾', 3000); return; }
    islemSuruyor = true;
    try { return await fn(...args); }
    catch (e) { console.error(e); sonucGoster([{ ok: false, baslik: 'İşlem tamamlanamadı', detay: 'Beklenmedik bir hata oldu; bilgilerin değişmedi. Tekrar dener misin?' }]); }
    finally { islemSuruyor = false; }
  };
}
async function hizliAktar(tur, girdiler, klasor) {
  const ogr = tur === 'ogrenci';
  const alanlar = ogr ? ALANLAR_OGRENCI : ALANLAR_KAZANIM;
  const elle = ogr ? ogrenciIceAktarElle : kazanimIceAktarElle;
  const kaynaklar = await dosyalariOku(girdiler, klasor ? tur : null);
  if (!kaynaklar.length) { sonucGoster([{ ok: false, baslik: 'Excel dosyası bulunamadı', detay: 'Seçtiğiniz yerde .xlsx uzantılı bir dosya yok.', ornek: tur }]); return; }
  const oncekiSiniflar = new Set(S.siniflar.map(c => c.id));
  const oncekiDersler = new Set(S.kazanimlar.map(k => norm(k.ders)));
  const dosyalar = new Map();
  kaynaklar.forEach(k => { if (!dosyalar.has(k.yol)) dosyalar.set(k.yol, []); dosyalar.get(k.yol).push(k); });
  const kartlar = [], cikanlar = [];
  for (const [yol, sayfalar] of dosyalar) {
    const denemeler = sayfalar.map(k => { const p = otomatikParca(k, alanlar); const ayar = otoAyar(tur, p); return { p, ayar, hata: otoHata(tur, p, ayar) }; });
    const iyiler = denemeler.filter(d => !d.hata);
    const girdi = sayfalar[0].girdi;
    if (!iyiler.length) {
      kartlar.push({ ok: false, baslik: `${sayfalar[0].dosya} aktarılamadı`, detay: denemeler[0].hata, ornek: tur, elle: girdi ? () => elle([girdi], false) : null });
      continue;
    }
    const top = { eklendi: 0, guncellendi: 0, cikarildi: 0 };
    for (const { p, ayar } of iyiler) {
      const k = kaynakKaydiAl(tur, p, ayar);
      const r = ogr ? ogrenciSatirlariUygula(p.kayitlar, ayar, k.id) : kazanimSatirlariUygula(p.kayitlar, ayar, k.id);
      top.eklendi += r.eklendi; top.guncellendi += r.guncellendi;
      if (ogr) top.cikarildi += sinifListesiniYenile(r.dokunulan, k.id);   // eski liste gider, yenisi gelir
      else cikanlar.push(...S.kazanimlar.filter(z => z.kaynakId === k.id && !r.dokunulan.has(z.id)));
      kaynakTaniticisiniSakla(k, p.handle).then(() => { kaydet(); ciz(); });
    }
    const birim = ogr ? 'öğrenci' : 'kazanım';
    const ozet = [top.eklendi && `${top.eklendi} ${birim} eklendi`, top.guncellendi && `${top.guncellendi} ${birim} güncellendi`, top.cikarildi && `${top.cikarildi} ${birim} yeni listede olmadığı için çıkarıldı`].filter(Boolean).join(', ') || 'Değişiklik yok';
    let hedef = '';
    if (ogr) {
      const ids = new Set(S.ogrenciler.filter(o => iyiler.some(d => kaynakBul(o.kaynakId)?.yol === d.p.yol)).map(o => o.sinifId));
      hedef = [...ids].map(sinifBul).filter(Boolean).sort(sinifSirala).map(c => sinifAdi(c)).join(', ');
      if (top.guncellendi || top.cikarildi) hedef += ' (liste yenilendi)';
    } else {
      hedef = [...new Set(S.kazanimlar.filter(z => iyiler.some(d => kaynakBul(z.kaynakId)?.yol === d.p.yol)).map(z => z.ders))].sort(cmpTr).join(', ');
    }
    kartlar.push({ ok: true, baslik: `${sayfalar[0].dosya} aktarıldı`, detay: `${ozet}.${hedef ? ` ${ogr ? 'Sınıf' : 'Ders'}: ${hedef}.` : ''}` });
  }
  kaydet(); ciz();
  const yeniSiniflar = S.siniflar.filter(c => !oncekiSiniflar.has(c.id)).sort(sinifSirala);
  const yeniDersler = [...new Set(S.kazanimlar.filter(z => !oncekiDersler.has(norm(z.ders))).map(z => z.ders))].sort(cmpTr);
  const ek = ogr ? (yeniSiniflar.length ? `Yeni sınıf oluşturuldu: ${yeniSiniflar.map(c => sinifAdi(c)).join(', ')}` : '')
    : (yeniDersler.length ? `Yeni ders oluşturuldu: ${yeniDersler.join(', ')}` : '');
  if (ek) { const ilkIyi = kartlar.find(k => k.ok); if (ilkIyi) ilkIyi.not = ek; }
  sonucGoster(kartlar);
  if (cikanlar.length) cikanlariSor(tur, cikanlar, 'Excel dosyası güncellendi.');
}
const ogrenciIceAktar = tekIslem((girdiler, klasor) => hizliAktar('ogrenci', girdiler, klasor));
const kazanimIceAktar = tekIslem((girdiler, klasor) => hizliAktar('kazanim', girdiler, klasor));

const anahtarIceAktar = tekIslem(anahtarIceAktarIc);
async function anahtarIceAktarIc(s, file) {
  let sayfalar;
  try { sayfalar = await excelOku(file); } catch (e) { sonucGoster([{ ok: false, baslik: `${file.name} açılamadı`, detay: 'Dosya bozuk olabilir ya da Excel dosyası değil.', ornek: 'anahtar' }]); return; }
  const parcalar = sayfalar.map(x => otomatikParca({ dosya: file.name, yol: file.name, sayfa: x.sayfa, satirlar: x.satirlar }, ALANLAR_ANAHTAR));
  const p = parcalar.find(x => x.es.no !== undefined && (x.es.konu !== undefined || x.es.kazanim !== undefined || x.es.cevap !== undefined));
  if (!p) {
    sonucGoster([{ ok: false, baslik: `${file.name} aktarılamadı`, detay: 'Soru No sütunu ya da Konu / Kazanım Kodu / Cevap sütunlarından hiçbiri bulunamadı. Örnek cevap anahtarındaki başlıkları kullanın.', ornek: 'anahtar', elle: () => anahtarIceAktarElle(s, file) }]);
    return;
  }
  const r = anahtarUygula(s, p.kayitlar);
  kaydet(); cizSinav();
  const kart = { ok: true, baslik: `${file.name} aktarıldı`, detay: `${r.n} soru yüklendi: ${s.ad}.` };
  if (r.bulunamadi) kart.not = `${r.bulunamadi} sorunun kazanım kodu Kazanımlar listesinde yok; o sorularda yalnızca konu kullanılacak.`;
  sonucGoster([kart]);
}
const sonucIceAktar = tekIslem(sonucIceAktarIc);
async function sonucIceAktarIc(fileList) {
  const s = sinavBul(filtre.snSinav);
  if (!s) { sonucGoster([{ ok: false, baslik: 'Önce sınav seçin', detay: 'Sonuçlar hangi sınava ait? Yukarıdan sınavı seçip tekrar deneyin.' }]); return; }
  const kaynaklar = await dosyalariOku(fileList);
  if (!kaynaklar.length) return;
  const kartlar = [];
  let toplam = 0;
  for (const k of kaynaklar) {
    const p = otomatikParca(k, ALANLAR_SONUC);
    if (p.es.no === undefined && p.es.adsoyad === undefined) {
      if (kaynaklar.length === 1) kartlar.push({ ok: false, baslik: `${k.dosya} aktarılamadı`, detay: '“Öğrenci No” ya da “Ad Soyad” sütunu bulunamadı.', ornek: 'sonuc', elle: () => sonucIceAktarElle([k.girdi]) });
      continue;
    }
    const r = sonucParcaUygula(s, p);
    if (!r.n) {
      kartlar.push({ ok: false, baslik: `${k.dosya} aktarılamadı`, detay: !r.soruSutunu && p.es.cevaplar === undefined ? 'Soru numarası sütunları (1, 2, 3…) bulunamadı ya da bu sınavın soru numaralarıyla uyuşmuyor.' : 'Dosyadaki öğrenciler programdaki öğrencilerle eşleşmedi. Öğrenci numaraları aynı olmalı.', ornek: 'sonuc', elle: () => sonucIceAktarElle([k.girdi]) });
      continue;
    }
    toplam += r.n;
    // Sonuçları girilen sınıfı ekranda aç
    const sayac = {};
    Object.keys(S.sonuclar[s.id] || {}).forEach(id => { const c = ogrenciBul(id)?.sinifId; if (c) sayac[c] = (sayac[c] || 0) + 1; });
    const enCok = Object.entries(sayac).sort((a, b) => b[1] - a[1])[0];
    if (enCok) filtre.snSinif = enCok[0];
    const kart = { ok: true, baslik: `${k.dosya} aktarıldı`, detay: `${r.n} öğrencinin sonucu girildi: ${s.ad}.` };
    if (r.bulunamadi.length) kart.not = `Programda bulunamayan ${r.bulunamadi.length} öğrenci atlandı: ${r.bulunamadi.slice(0, 5).join(', ')}${r.bulunamadi.length > 5 ? '…' : ''}`;
    kartlar.push(kart);
  }
  kaydet(); ciz();
  sonucGoster(kartlar);
}

// ---------------------------------------------------------------------------
// Sonuç kartları (yeşil ✓ / kırmızı ✗) ve kutlama
// ---------------------------------------------------------------------------
let kartSayac = 0;
function sonucGoster(kartlar) {
  if (!kartlar.length) return;
  const alan = $('#sonucKartlar');
  kartlar.forEach(k => {
    const id = 'sk' + (++kartSayac);
    const el = document.createElement('div');
    el.className = 'sk ' + (k.ok ? 'sk-ok' : 'sk-hata');
    el.id = id;
    el.setAttribute('role', k.ok ? 'status' : 'alert');
    el.innerHTML = `<div class="sk-ikon" aria-hidden="true">${k.ok ? '✓' : '✕'}</div>
      <div class="sk-govde"><b>${esc(k.baslik)}</b>
        ${k.detay ? `<div>${esc(k.detay)}</div>` : ''}${k.html || ''}
        ${k.not ? `<div class="sk-not">${esc(k.not)}</div>` : ''}
        <div class="sk-eylem">
          ${!k.ok && k.ornek ? `<button type="button" class="btn small" data-sk-ornek="${k.ornek}">Örnek Excel indir</button>` : ''}
          ${k.elle ? '<button type="button" class="btn small" data-sk-elle>Sütunları elle eşleştir</button>' : ''}
        </div></div>
      <button type="button" class="sk-kapat" aria-label="Kapat">×</button>`;
    el.querySelector('.sk-kapat').onclick = () => el.remove();
    const ornek = el.querySelector('[data-sk-ornek]');
    if (ornek) ornek.onclick = () => ornekExcelIndir(k.ornek);
    const elleBtn = el.querySelector('[data-sk-elle]');
    if (elleBtn) elleBtn.onclick = () => { el.remove(); k.elle(); };
    alan.appendChild(el);
    if (k.ok) setTimeout(() => el.remove(), 7000);
  });
  if (kartlar.some(k => k.ok) && !kartlar.some(k => !k.ok)) kutla();
}
function kutla() {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const renkler = ['#8b6cf0', '#ff8fb8', '#5cc8a8', '#ffc857', '#7ec8ff'];
  const kap = document.createElement('div');
  kap.className = 'konfeti';
  for (let i = 0; i < 28; i++) {
    const c = document.createElement('i');
    c.style.left = (10 + Math.random() * 80) + '%';
    c.style.background = renkler[i % renkler.length];
    c.style.animationDelay = (Math.random() * 0.25) + 's';
    c.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
    c.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg');
    kap.appendChild(c);
  }
  document.body.appendChild(kap);
  setTimeout(() => kap.remove(), 1800);
}

// ---------------------------------------------------------------------------
// Kayıtlı listeyi güncelle / sil
// ---------------------------------------------------------------------------
async function kaynakGuncelle(id, sessiz = false) {
  const k = kaynakBul(id);
  if (!k) return null;
  let girdi = null;
  const h = await taniticiOku(k.id);
  if (h) {
    try {
      let izin = await h.queryPermission({ mode: 'read' });
      if (izin !== 'granted') izin = await h.requestPermission({ mode: 'read' });
      if (izin === 'granted') girdi = { file: await h.getFile(), yol: k.yol, handle: h };
    } catch (e) {
      // Dosya taşınmış veya silinmiş olabilir
      if (!sessiz) toast(`“${k.dosya}” kayıtlı yerinde bulunamadı. Dosyayı yeniden seçin.`, 4000);
    }
  }
  if (!girdi) {
    if (sessiz) return { atlandi: true };
    if (!h) toast(`Güncel “${k.dosya}” dosyasını seçin.`, 4000);
    girdi = await tekDosyaSec();
    if (!girdi) return null;
  }
  let sayfalar;
  try { sayfalar = await excelOku(girdi.file); } catch (e) { toast(`${girdi.file.name} okunamadı.`); return null; }
  const sayfa = sayfalar.find(x => x.sayfa === k.sayfa) || sayfalar[0];
  if (!sayfa) { toast('Dosyada veri bulunamadı.'); return null; }
  const kayitlar = kaynakSatirlari(k, sayfa.satirlar);
  const oncekiSiniflar = new Set(S.siniflar.map(c => c.id));
  const oncekiDersler = new Set(S.kazanimlar.map(z => norm(z.ders)));
  const r = k.tur === 'ogrenci' ? ogrenciSatirlariUygula(kayitlar, k.ayar, k.id) : kazanimSatirlariUygula(kayitlar, k.ayar, k.id);
  k.guncelleme = new Date().toISOString();
  if (girdi.handle && girdi.handle !== h) { await kaynakTaniticisiniSakla(k, girdi.handle); k.dosya = girdi.file.name; }
  if (k.tur === 'ogrenci') r.cikarildi = sinifListesiniYenile(r.dokunulan, k.id);   // eski liste gider, yenisi gelir
  const cikanlar = k.tur === 'ogrenci' ? [] : S.kazanimlar.filter(z => z.kaynakId === k.id && !r.dokunulan.has(z.id));
  kaydet(); ciz();
  const yeniSiniflar = S.siniflar.filter(c => !oncekiSiniflar.has(c.id)).sort(sinifSirala);
  const yeniDersler = [...new Set(S.kazanimlar.filter(z => !oncekiDersler.has(norm(z.ders))).map(z => z.ders))].sort(cmpTr);
  const ekHtml = (yeniSiniflar.length ? `<p><b>Sistemde olmayan ${yeniSiniflar.length} sınıf otomatik oluşturuldu:</b> ${yeniSiniflar.map(c => esc(sinifAdi(c))).join(', ')}</p>` : '')
    + (yeniDersler.length ? `<p><b>Sistemde olmayan ${yeniDersler.length} ders otomatik oluşturuldu:</b> ${yeniDersler.map(esc).join(', ')}</p>` : '');
  if (!sessiz) cikanlariSor(k.tur, cikanlar, `“${k.dosya}” güncellendi: ` + ozetMetni(r, k.tur === 'ogrenci' ? 'öğrenci' : 'kazanım') + (r.cikarildi ? ` ${r.cikarildi} öğrenci yeni listede olmadığı için çıkarıldı.` : ''), ekHtml);
  return { ...r, cikanlar };
}
const tumunuGuncelle = tekIslem(tumunuGuncelleIc);
async function tumunuGuncelleIc(tur) {
  const liste = S.kaynaklar.filter(k => k.tur === tur);
  let n = 0, atlanan = 0;
  const cikanlar = [];
  for (const k of liste) {
    const r = await kaynakGuncelle(k.id, true);
    if (!r || r.atlandi) { atlanan++; continue; }
    n++;
    cikanlar.push(...r.cikanlar);
  }
  cikanlariSor(tur, cikanlar, `${n} liste güncellendi.${atlanan ? ` ${atlanan} liste kayıtlı yerinden okunamadı; onları tek tek “Güncelle” ile dosya seçerek güncelleyin.` : ''}`);
}
function kaynakSilDialog(id) {
  const k = kaynakBul(id);
  if (!k) return;
  const ogr = k.tur === 'ogrenci';
  const kayitlar = ogr ? S.ogrenciler.filter(o => o.kaynakId === id) : S.kazanimlar.filter(z => z.kaynakId === id);
  dialogAc('Listeyi sil', `<p><b>${esc(k.dosya)}</b> <span class="muted">· ${esc(k.sayfa)}</span></p>
    <p>Bu listeden gelen <b>${kayitlar.length} ${ogr ? 'öğrenci' : 'kazanım'}</b> var.</p>
    <p class="muted small">${ogr ? 'Öğrencilerle birlikte sınav sonuçları ve ödev planları da silinir; boş kalan sınıflar kaldırılır.' : 'Kazanımlarla birlikte sınav sorularındaki bu kazanım eşleşmeleri boşalır.'} Excel dosyanız bilgisayarınızda olduğu gibi kalır.</p>`, [
    { ad: 'Vazgeç' },
    { ad: 'Yalnız listeyi unut, kayıtlar kalsın', tikla: () => { kaynakKaydiniKaldir(id); toast('Liste kaydı kaldırıldı; kayıtlar programda kaldı.'); } },
    { ad: `${ogr ? 'Öğrencileri' : 'Kazanımları'} de sil`, danger: true, tikla: () => {
      ogr ? ogrencileriSil(kayitlar.map(x => x.id)) : kazanimlariSil(kayitlar.map(x => x.id));
      kaynakKaydiniKaldir(id);
      toast(`${kayitlar.length} ${ogr ? 'öğrenci' : 'kazanım'} silindi.`);
    } },
  ]);
}
function kaynakKaydiniKaldir(id) {
  S.kaynaklar = S.kaynaklar.filter(k => k.id !== id);
  S.ogrenciler.forEach(o => { if (o.kaynakId === id) delete o.kaynakId; });
  S.kazanimlar.forEach(z => { if (z.kaynakId === id) delete z.kaynakId; });
  taniticiSil(id);
  kaydet(); ciz();
}
function kaynakListesiHtml(tur) {
  const liste = S.kaynaklar.filter(k => k.tur === tur).sort((a, b) => cmpTr(a.yol, b.yol));
  if (!liste.length) return '';
  const ogr = tur === 'ogrenci';
  const zaman = iso => new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `<div class="card">
    <div class="kaynak-baslik"><h2>📂 Yüklenen Excel listeleri <span class="muted small">(${liste.length})</span></h2>
      <button class="btn small" data-kaynak-tumu="${tur}">Tümünü güncelle</button></div>
    <p class="muted small">Excel dosyasında değişiklik yaptıysanız <b>Güncelle</b>'ye basın: ${ogr ? 'yeni öğrenciler eklenir, değişenler düzeltilir, listeden çıkanlar size sorularak silinir' : 'yeni kazanımlar eklenir, değişenler düzeltilir'}.</p>
    <div class="tablewrap"><table>
      <tr><th>Dosya</th><th>${ogr ? 'Sınıf' : 'Ders / sınıf'}</th><th class="sag">${ogr ? 'Öğrenci' : 'Kazanım'}</th><th>Son güncelleme</th><th></th></tr>
      ${liste.map(k => {
        const kayit = ogr ? S.ogrenciler.filter(o => o.kaynakId === k.id) : S.kazanimlar.filter(z => z.kaynakId === k.id);
        const hedef = ogr
          ? [...new Set(kayit.map(o => o.sinifId))].map(sinifBul).filter(Boolean).sort(sinifSirala).map(c => sinifAdi(c)).join(', ')
          : [...new Set(kayit.map(z => `${z.ders}${z.seviye ? ' ' + z.seviye : ''}`))].sort(cmpTr).join(', ');
        return `<tr>
          <td><b>${esc(k.dosya)}</b>${k.sayfa ? ` <span class="muted small">· ${esc(k.sayfa)}</span>` : ''}
            <div class="kz-meta">${esc(k.yol)} · ${k.yolKayitli ? '<span class="chip green">dosya yolu kayıtlı</span>' : '<span class="chip">güncellerken dosya seçilir</span>'}</div></td>
          <td class="small">${esc(hedef || '—')}</td>
          <td class="sag">${kayit.length}</td>
          <td class="small" style="white-space:nowrap">${zaman(k.guncelleme)}</td>
          <td style="white-space:nowrap"><button class="btn small" data-kaynak-guncelle="${k.id}">Güncelle</button>
            <button class="btn small danger" data-kaynak-sil="${k.id}">Sil</button></td></tr>`;
      }).join('')}
    </table></div></div>`;
}

// ---------------------------------------------------------------------------
// Öğretici örnek Excel dosyaları
// Hepsi birbirine uyumludur: 9-A öğrencileri, 9. sınıf kazanımları, bu kazanımlara bağlı
// 6 soruluk cevap anahtarı ve aynı öğrencilerin sonuçları. Üstteki açıklama satırlarını
// program okumaz; başlık satırı otomatik bulunur.
// ---------------------------------------------------------------------------
const ORNEK_EXCELLER = {
  ogrenci: {
    dosya: 'Ornek_Ogrenci_Listesi_9-A.xlsx',
    sayfa: 'Öğrenciler',
    baslik: 'ÖĞRENCİ LİSTESİ – ÖRNEK DOSYA',
    aciklama: [
      'Nasıl doldurulur: Aşağıdaki örnek öğrencileri silip kendi öğrencilerinizi aynı sütunlara yazın. Her satır bir öğrencidir.',
      'Sınıf/Şube sütununa 9-A, 10-B, 11-C gibi yazın (9A da olur). Mezun öğrenciler için “Mezun” yazın.',
      'Kurum sütununa şunlardan birini yazın: Okul Ortaokul, Okul Lise, Kurs Ortaokul, Kurs Lise, Kurs Mezun.',
      'Başlık satırını (Öğrenci No, Adı, Soyadı…) değiştirmeyin. Yüklemek için: Öğrenciler → Excel\'den öğrenci yükle.',
    ],
    basliklar: ['Öğrenci No', 'Adı', 'Soyadı', 'Sınıf/Şube', 'Kurum'],
    satirlar: [
      ['901', 'Elif', 'Yılmaz', '9-A', 'Okul Lise'],
      ['902', 'Mehmet Ali', 'Kaya', '9-A', 'Okul Lise'],
      ['903', 'Zeynep', 'Demir', '9-A', 'Okul Lise'],
    ],
    genislik: [12, 14, 14, 12, 16],
  },
  kazanim: {
    dosya: 'Ornek_Kazanim_Listesi_9.xlsx',
    sayfa: 'Kazanımlar',
    baslik: 'KAZANIM LİSTESİ – ÖRNEK DOSYA',
    aciklama: [
      'Nasıl doldurulur: Her satır bir kazanımdır. K12\'den aldığınız kazanım listesini aynı sütunlara koyabilirsiniz; sütun adları biraz farklıysa program aktarırken eşleştirmeyi gösterir.',
      'Kazanım Kodu, cevap anahtarında soruyu kazanıma bağlamak için kullanılır. Konu sütunu, konu analizinde ve “hangi konudan soru çözmeli” önerisinde görünür.',
      'Sınıf sütununa yalnızca sayı yazın (5–12) veya “Mezun”. Aşağıdaki satırlar örnektir; resmî kazanım metinleri için K12 listenizi kullanın.',
      'Yüklemek için: Kazanımlar → Excel\'den kazanım yükle.',
    ],
    basliklar: ['Kazanım Kodu', 'Ders', 'Sınıf', 'Ünite', 'Konu', 'Kazanım'],
    satirlar: [
      ['T.9.3.1', 'Türkçe', '9', 'Okuma', 'Paragraf', 'Metnin konusunu ve ana fikrini belirler.'],
      ['T.9.3.2', 'Türkçe', '9', 'Okuma', 'Sözcükte Anlam', 'Sözcüklerin metindeki anlamlarını belirler.'],
      ['T.9.4.1', 'Türkçe', '9', 'Dil Bilgisi', 'Ses Bilgisi', 'Metindeki ses olaylarını belirler.'],
      ['M.9.1.1.1', 'Matematik', '9', 'Mantık', 'Önermeler', 'Önermeyi ve önermenin doğruluk değerini açıklar.'],
      ['M.9.1.2.1', 'Matematik', '9', 'Kümeler', 'Kümelerde Temel Kavramlar', 'Kümelerle ilgili temel kavramları açıklar.'],
      ['M.9.2.1.1', 'Matematik', '9', 'Denklemler ve Eşitsizlikler', 'Sayı Kümeleri', 'Sayı kümelerini birbiriyle ilişkilendirir.'],
    ],
    genislik: [13, 12, 7, 26, 26, 60],
  },
  anahtar: {
    dosya: 'Ornek_Cevap_Anahtari.xlsx',
    sayfa: 'Cevap Anahtarı',
    baslik: 'CEVAP ANAHTARI VE SORU–KONU EŞLEŞMESİ – ÖRNEK DOSYA',
    aciklama: [
      'Nasıl doldurulur: Her satır sınavdaki bir sorudur. Soru No 1\'den başlayarak sırayla yazılır.',
      'Konu yazmanız konu analizi için yeterlidir. Kazanım Kodu isteğe bağlıdır; yazarsanız Kazanımlar listesindeki kodla aynı olmalıdır.',
      'Cevap sütununa doğru şıkkı yazın (A, B, C, D veya E). Sonuçlarda öğrencinin şıkkı bu cevapla karşılaştırılır.',
      'Yüklemek için: Sınavlar → sınavı seçin (yoksa ➕ Yeni sınav) → Excel\'den cevap anahtarı yükle.',
    ],
    basliklar: ['Soru No', 'Ders', 'Konu', 'Kazanım Kodu', 'Cevap'],
    satirlar: [
      ['1', 'Türkçe', 'Paragraf', 'T.9.3.1', 'B'],
      ['2', 'Türkçe', 'Paragraf', 'T.9.3.1', 'D'],
      ['3', 'Türkçe', 'Sözcükte Anlam', 'T.9.3.2', 'A'],
      ['4', 'Matematik', 'Önermeler', 'M.9.1.1.1', 'C'],
      ['5', 'Matematik', 'Kümelerde Temel Kavramlar', 'M.9.1.2.1', 'E'],
      ['6', 'Matematik', 'Sayı Kümeleri', 'M.9.2.1.1', 'A'],
    ],
    genislik: [9, 12, 26, 14, 8],
  },
  sonuc: {
    dosya: 'Ornek_Sinav_Sonuclari.xlsx',
    sayfa: 'Sonuçlar',
    baslik: 'SINAV SONUÇLARI – ÖRNEK DOSYA',
    aciklama: [
      'Nasıl doldurulur: Her satır bir öğrencidir. 1, 2, 3… sütunları soru numaralarıdır; öğrencinin işaretlediği şıkkı yazın (A–E).',
      'Boş bıraktığı soruyu boş bırakın. Şık yerine D (doğru), Y (yanlış) veya B (boş) da yazabilirsiniz.',
      'Öğrenci No, programdaki öğrenci numarasıyla aynı olmalıdır; numara yoksa Ad Soyad ile eşleştirilir.',
      'Yüklemek için: Sonuç Girişi → sınavı seçin → Excel\'den sonuç yükle.',
    ],
    basliklar: ['Öğrenci No', 'Ad Soyad', '1', '2', '3', '4', '5', '6'],
    satirlar: [
      ['901', 'Elif Yılmaz', 'B', 'D', 'A', 'C', 'E', 'A'],
      ['902', 'Mehmet Ali Kaya', 'B', 'A', 'A', '', 'E', 'C'],
      ['903', 'Zeynep Demir', 'C', 'D', 'B', 'C', 'A', ''],
    ],
    genislik: [12, 20, 5, 5, 5, 5, 5, 5],
  },
};
/** Örnek dosyanın satırları (açıklamalar + boş satır + başlık + örnek satırlar). */
function ornekExcelVeri(tur) {
  const o = ORNEK_EXCELLER[tur];
  const sutun = o.basliklar.length;
  const aoa = [[o.baslik], ...o.aciklama.map(a => [a]), [], o.basliklar, ...o.satirlar];
  // Açıklama satırları tüm sütunlara yayılsın
  const merges = [0, ...o.aciklama.map((_, i) => i + 1)].map(r => ({ s: { r, c: 0 }, e: { r, c: Math.max(sutun - 1, 5) } }));
  return { ...o, aoa, merges };
}
function ornekExcelIndir(tur) {
  const v = ornekExcelVeri(tur);
  const ws = XLSX.utils.aoa_to_sheet(v.aoa);
  ws['!merges'] = v.merges;
  ws['!cols'] = v.genislik.map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, v.sayfa);
  excelIndir(wb, v.dosya);
}

// ---------------------------------------------------------------------------
// Ortak dialog
// ---------------------------------------------------------------------------
function dialogAc(baslik, icerikHtml, butonlar) {
  const dlg = $('#dlg');
  $('#dlgBaslik').textContent = baslik;
  $('#dlgIcerik').innerHTML = icerikHtml;
  const alan = $('#dlgButonlar');
  alan.innerHTML = '';
  butonlar.forEach(b => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'btn' + (b.primary ? ' primary' : '') + (b.danger ? ' danger' : '');
    el.textContent = b.ad;
    el.onclick = () => {
      const sonuc = b.tikla ? b.tikla() : undefined;
      if (sonuc !== false) dlg.close();
    };
    alan.appendChild(el);
  });
  dlg.showModal();
}
function onayla(mesaj, fn) {
  dialogAc('Onay', `<p>${esc(mesaj)}</p>`, [{ ad: 'Vazgeç' }, { ad: 'Evet', danger: true, tikla: fn }]);
}

// ---------------------------------------------------------------------------
// PANEL
// ---------------------------------------------------------------------------
function ornekVeriYukle() {
  if (S.ornek) ornekVeriSil(true);
  // Örnek kayıtlar "ornek: true" ile işaretlenir; kendi verilerinle karışmaz, ayrıca silinebilir
  const sinif = { id: uid(), kurum: seviyeliKurum('11', 'kurs'), seviye: '11', sube: 'A', ornek: true, elle: true };
  const sinif2 = { id: uid(), kurum: seviyeliKurum('8', 'okul'), seviye: '8', sube: 'B', ornek: true, elle: true };
  S.siniflar.push(sinif, sinif2);
  [['1101', 'Ayşe', 'Çelik'], ['1102', 'Mustafa', 'Şahin'], ['1103', 'Fatma Nur', 'Arslan'], ['1104', 'Emre', 'Öztürk']]
    .forEach(([no, ad, soyad]) => S.ogrenciler.push({ id: uid(), no, ad, soyad, sinifId: sinif.id, ornek: true }));
  [['801', 'Can', 'Aydın'], ['802', 'Selin', 'Koç']].forEach(([no, ad, soyad]) => S.ogrenciler.push({ id: uid(), no, ad, soyad, sinifId: sinif2.id, ornek: true }));
  const kz = [
    ['T.9.3.1', 'Türkçe', 'Okuma', 'Metni Anlama', 'Metnin konusunu ve ana fikrini belirler. (örnek)'],
    ['T.9.3.2', 'Türkçe', 'Okuma', 'Metni Anlama', 'Metindeki yardımcı fikirleri belirler. (örnek)'],
    ['T.9.3.3', 'Türkçe', 'Okuma', 'Söz Sanatları', 'Metindeki söz sanatlarını tespit ederek işlevlerini açıklar. (örnek)'],
    ['M.9.1.1.1', 'Matematik', 'Mantık', 'Önermeler', 'Önermeyi ve önermenin doğruluk değerini açıklar. (örnek)'],
    ['M.9.1.2.1', 'Matematik', 'Kümeler', 'Kümelerde Temel Kavramlar', 'Kümeler ile ilgili temel kavramları açıklar. (örnek)'],
    ['M.9.2.2.1', 'Matematik', 'Denklemler ve Eşitsizlikler', 'Bölünebilme Kuralları', 'Bölünebilme kurallarıyla ilgili problemler çözer. (örnek)'],
  ].map(([kod, ders, unite, konu, metin]) => { const k = { id: uid(), kod, ders, seviye: '9', unite, konu, metin, ornek: true }; S.kazanimlar.push(k); return k; });
  // 20 soruluk örnek deneme: bazı soruların kazanımı var, bazılarına yalnızca konu yazılmış
  const plan = [[0, 4], [1, 2], [2, 2], [null, 2, 'Türkçe', 'Sözcükte Anlam'], [3, 3], [4, 3], [5, 2], [null, 2, 'Matematik', 'Problemler']];
  const sorular = [];
  plan.forEach(([ki, n, ders, konu]) => {
    for (let i = 0; i < n; i++) {
      const no = String(sorular.length + 1);
      sorular.push(ki === null ? { no, ders, konu, kazanimId: '', cevap: 'ABCDE'[sorular.length % 5] }
        : { no, ders: kz[ki].ders, konu: '', kazanimId: kz[ki].id, cevap: 'ABCDE'[sorular.length % 5] });
    }
  });
  const sinav = { id: uid(), ad: 'ÖRNEK Deneme 1', tarih: bugun(), kurum: sinif.kurum, seviye: '11', sorular, ornek: true };
  S.sinavlar.push(sinav);
  const og = sinifOgrencileri(sinif.id);
  const yb = (y, b = []) => Object.fromEntries([...y.map(n => [n, 'Y']), ...b.map(n => [n, 'B'])]);
  S.sonuclar[sinav.id] = {
    [og[0].id]: yb([3, 19], [20]),
    [og[1].id]: yb([1, 2, 7, 11, 12, 14, 19], [8, 13, 20]),
    [og[2].id]: yb([5, 9, 15, 17], [10, 16, 18]),
    [og[3].id]: yb([2, 12, 19, 20]),
  };
  S.ornek = true;
  kaydet();
  filtre.anSinif = sinif.id; filtre.anOgrenci = og[1].id;
  toast('Örnek veriler yüklendi. Öğrenci analizi açılıyor.');
  sekmeAc('analiz');
}
/** Yalnızca örnek kayıtları siler; kendi verilerine dokunmaz. */
function ornekVeriSil(sessiz = false) {
  const ogrIds = S.ogrenciler.filter(o => o.ornek).map(o => o.id);
  ogrencileriSil(ogrIds);
  S.siniflar = S.siniflar.filter(c => !c.ornek);
  kazanimlariSil(S.kazanimlar.filter(k => k.ornek).map(k => k.id));
  S.sinavlar.filter(x => x.ornek).forEach(x => { delete S.sonuclar[x.id]; });
  S.sinavlar = S.sinavlar.filter(x => !x.ornek);
  S.ornek = false;
  if (sessiz) return;
  kaydet(); ciz(); toast('Örnek veriler silindi. Senin verilerin yerinde duruyor.');
}

function cizPanel() {
  $('#panelOrnek').innerHTML = !S.ornek
    ? `<div class="card deneme"><div><h2>🎈 Önce bir denemek ister misin?</h2><p class="muted">Örnek bir sınıf, kazanımlar ve sonuçları girilmiş bir deneme yüklenir. Örnekler “(örnek)” diye işaretlenir, senin verilerinle karışmaz; istediğin zaman tek tıkla silebilirsin.</p></div>
       <button class="btn fun" id="btnOrnekYukle">✨ Örnek verilerle dene</button></div>`
    : `<div class="ornek-uyari">🧪 Örnek veriler yüklü. Kendi verilerini yüklesen de örnekler silinmez, karışmaz. <button class="btn small" id="btnOrnekSil">Örnekleri kaldır</button></div>`;
  const sonucSayisi = Object.values(S.sonuclar).reduce((t, x) => t + Object.keys(x).length, 0);
  $('#panelStats').innerHTML = [
    ['Sınıf', S.siniflar.length], ['Öğrenci', S.ogrenciler.length], ['Kazanım', S.kazanimlar.length],
    ['Sınav', S.sinavlar.length], ['Girilen sonuç', sonucSayisi], ['Ödev planı', S.planlar.length],
  ].map(([a, v]) => `<div class="stat"><span class="muted">${a}</span><b>${v}</b></div>`).join('');
  const kurumOzet = KURUMLAR.map(k => {
    const sn = S.siniflar.filter(s => s.kurum === k.key);
    const og = S.ogrenciler.filter(o => sn.some(s => s.id === o.sinifId)).length;
    return `<tr><td>${esc(k.ad)}</td><td>${sn.length}</td><td>${og}</td></tr>`;
  }).join('');
  $('#panelSon').innerHTML = `<div class="kaynak-baslik"><h2>🏫 Kurumlara göre</h2><button type="button" class="btn small" data-kurum-duzenle>✏️ Kurumları düzenle</button></div>
    <div class="tablewrap"><table><tr><th>Kurum türü</th><th>Sınıf</th><th>Öğrenci</th></tr>${kurumOzet}</table></div>`;
}

// ---------------------------------------------------------------------------
// ÖĞRENCİLER
// ---------------------------------------------------------------------------
const filtre = { kurum: '', seviye: '', sinif: '', ara: '', seciliSinav: null, kzDers: '', kzSeviye: '', kzAra: '', snSinav: '', snSinif: '', anSinif: '', anOgrenci: '', saSinav: '', saSinif: '' };

function cizOgrenci() {
  const kurumlar = KURUMLAR;
  $('#fKurum').innerHTML = opt('', 'Tüm kurumlar') + kurumlar.map(k => opt(k.key, k.ad, filtre.kurum === k.key)).join('');
  const seviyeler = filtre.kurum && KURUM[filtre.kurum] ? KURUM[filtre.kurum].seviyeler : S.seviyeler;
  if (!seviyeler.includes(filtre.seviye)) filtre.seviye = '';
  $('#fSeviye').innerHTML = opt('', 'Tüm seviyeler') + seviyeler.map(s => opt(s, seviyeAdi(s), filtre.seviye === s)).join('');
  const siniflar = S.siniflar.filter(s => (!filtre.kurum || s.kurum === filtre.kurum) && (!filtre.seviye || s.seviye === filtre.seviye)).sort(sinifSirala);
  if (filtre.sinif && !siniflar.some(s => s.id === filtre.sinif)) filtre.sinif = '';
  $('#fSinif').innerHTML = opt('', 'Tüm sınıflar') + siniflar.map(s => opt(s.id, sinifAdi(s, !!filtre.kurum), filtre.sinif === s.id)).join('');
  $('#fAra').value = filtre.ara;

  // Sınıf listesi gruplu
  let h = '';
  for (const k of kurumlar) {
    const sn = siniflar.filter(s => s.kurum === k.key);
    if (!sn.length) continue;
    h += `<div class="group-title">${esc(k.ad)}</div>`;
    h += sn.map(s => `<div class="list-item ${filtre.sinif === s.id ? 'sel' : ''}" data-sinif="${s.id}">
      <span>${esc(sinifAdi(s, true))}</span>
      <span><span class="chip">${S.ogrenciler.filter(o => o.sinifId === s.id).length}</span>
      <button class="btn small" data-sinif-duz="${s.id}" title="Düzenle">✎</button></span></div>`).join('');
  }
  $('#sinifListe').innerHTML = h || '<p class="muted">Henüz sınıf yok. Öğrenci listesi içe aktarın veya “+ Sınıf ekle” ile oluşturun.</p>';

  const ara = norm(filtre.ara);
  const ogr = S.ogrenciler.filter(o => {
    const s = sinifBul(o.sinifId);
    if (filtre.sinif && o.sinifId !== filtre.sinif) return false;
    if (filtre.kurum && s?.kurum !== filtre.kurum) return false;
    if (filtre.seviye && s?.seviye !== filtre.seviye) return false;
    if (ara && !norm(adSoyad(o) + o.no).includes(ara)) return false;
    return true;
  }).sort((a, b) => sinifSirala(sinifBul(a.sinifId) || {}, sinifBul(b.sinifId) || {}) || cmpTr(a.no, b.no) || cmpTr(adSoyad(a), adSoyad(b)));
  $('#ogrSayi').textContent = `(${ogr.length})`;
  $('#ogrKaynaklar').innerHTML = kaynakListesiHtml('ogrenci');
  const gosterilen = ogr.slice(0, 500);
  $('#ogrTablo').innerHTML = `<tr><th>No</th><th>Ad Soyad</th><th>Sınıf</th><th></th></tr>` +
    gosterilen.map(o => `<tr><td>${esc(o.no)}</td><td>${esc(adSoyad(o))}</td><td>${esc(sinifAdi(sinifBul(o.sinifId)))}</td>
      <td style="white-space:nowrap"><button class="btn small" data-ogr-analiz="${o.id}">Analiz</button>
      <button class="btn small" data-ogr-duz="${o.id}">✎</button></td></tr>`).join('') +
    (ogr.length > 500 ? `<tr><td colspan="4" class="muted">İlk 500 öğrenci gösteriliyor; filtre kullanın.</td></tr>` : '') +
    (!ogr.length ? `<tr><td colspan="4" class="muted">Öğrenci bulunamadı.</td></tr>` : '');
}

function sinifDialog(sinif) {
  const s = sinif || { kurum: KURUM[filtre.kurum] ? filtre.kurum : varsayilanKurum(), seviye: '', sube: '' };
  const seviyeSecenek = k => kurumAl(k).seviyeler.map(v => opt(v, seviyeAdi(v), v === s.seviye)).join('');
  dialogAc(sinif ? 'Sınıfı düzenle' : 'Yeni sınıf', `<div class="form-grid">
      <label>Kurum türü<select id="dKurum">${KURUMLAR.map(k => opt(k.key, k.ad, k.key === kurumAl(s.kurum).key)).join('')}</select></label>
      <label>Sınıf seviyesi<select id="dSeviye">${seviyeSecenek(s.kurum)}</select></label>
      <label>Şube / grup adı<input id="dSube" value="${esc(s.sube)}" placeholder="ör. A, Sayısal-1"></label>
    </div>`, [
    ...(sinif ? [{
      ad: 'Sınıfı sil', danger: true, tikla: () => {
        const ids = S.ogrenciler.filter(o => o.sinifId === sinif.id).map(o => o.id);
        if (!ids.length) { S.siniflar = S.siniflar.filter(x => x.id !== sinif.id); kaydet(); ciz(); return; }
        setTimeout(() => onayla(`${sinifAdi(sinif)} sınıfı ve içindeki ${ids.length} öğrenci (sınav sonuçları ve ödev planlarıyla birlikte) silinsin mi?`, () => {
          ogrencileriSil(ids);
          S.siniflar = S.siniflar.filter(x => x.id !== sinif.id);
          kaydet(); ciz(); toast('Sınıf silindi.');
        }), 0);
      },
    }] : []),
    { ad: 'Vazgeç' },
    {
      ad: 'Kaydet', primary: true, tikla: () => {
        const kurum = $('#dKurum').value, seviye = $('#dSeviye').value, sube = trUpper($('#dSube').value.trim());
        const ayni = S.siniflar.find(x => x.kurum === kurum && x.seviye === seviye && trUpper(x.sube) === sube && x.id !== sinif?.id);
        if (ayni) { toast('Bu sınıf zaten var.'); return false; }
        if (sinif) Object.assign(sinif, { kurum, seviye, sube });
        else S.siniflar.push({ id: uid(), kurum, seviye, sube, elle: true });
        kaydet(); ciz();
      },
    },
  ]);
  $('#dKurum').onchange = e => { s.seviye = ''; $('#dSeviye').innerHTML = seviyeSecenek(e.target.value); };
}
function ogrenciDialog(ogr) {
  if (!S.siniflar.length) { toast('Önce bir sınıf oluşturun.'); return; }
  const o = ogr || { no: '', ad: '', soyad: '', sinifId: filtre.sinif || S.siniflar.slice().sort(sinifSirala)[0].id };
  dialogAc(ogr ? 'Öğrenciyi düzenle' : 'Yeni öğrenci', `<div class="form-grid">
      <label>Öğrenci no<input id="dNo" value="${esc(o.no)}"></label>
      <label>Ad<input id="dAd" value="${esc(o.ad)}"></label>
      <label>Soyad<input id="dSoyad" value="${esc(o.soyad)}"></label>
      <label>Sınıf<select id="dSinif">${S.siniflar.slice().sort(sinifSirala).map(s => opt(s.id, sinifAdi(s), s.id === o.sinifId)).join('')}</select></label>
    </div>`, [
    ...(ogr ? [{
      ad: 'Öğrenciyi sil', danger: true, tikla: () => {
        S.ogrenciler = S.ogrenciler.filter(x => x.id !== ogr.id);
        Object.values(S.sonuclar).forEach(x => delete x[ogr.id]);
        S.planlar = S.planlar.filter(p => p.ogrenciId !== ogr.id);
        kaydet(); ciz();
      },
    }] : []),
    { ad: 'Vazgeç' },
    {
      ad: 'Kaydet', primary: true, tikla: () => {
        const v = { no: $('#dNo').value.trim(), ad: $('#dAd').value.trim(), soyad: $('#dSoyad').value.trim(), sinifId: $('#dSinif').value };
        if (!v.ad) { toast('Ad boş olamaz.'); return false; }
        if (ogr) Object.assign(ogr, v); else S.ogrenciler.push({ id: uid(), ...v });
        kaydet(); ciz();
      },
    },
  ]);
}

// ---------------------------------------------------------------------------
// KAZANIMLAR
// ---------------------------------------------------------------------------
function cizKazanim() {
  const dersler = [...new Set(S.kazanimlar.map(k => k.ders))].sort(cmpTr);
  $('#kzDers').innerHTML = opt('', 'Tüm dersler') + dersler.map(d => opt(d, d, filtre.kzDers === d)).join('');
  const seviyeler = [...new Set(S.kazanimlar.map(k => k.seviye).filter(Boolean))].sort(cmpTr);
  $('#kzSeviye').innerHTML = opt('', 'Tüm seviyeler') + seviyeler.map(s => opt(s, seviyeAdi(s), filtre.kzSeviye === s)).join('');
  const ara = norm(filtre.kzAra);
  const liste = S.kazanimlar.filter(k => (!filtre.kzDers || k.ders === filtre.kzDers) && (!filtre.kzSeviye || k.seviye === filtre.kzSeviye)
    && (!ara || norm(k.kod + k.metin + k.konu + k.unite).includes(ara)))
    .sort((a, b) => cmpTr(a.ders, b.ders) || cmpTr(a.seviye, b.seviye) || cmpTr(a.kod, b.kod));
  $('#kzKaynaklar').innerHTML = kaynakListesiHtml('kazanim');
  $('#kzSayi').textContent = `${liste.length} kazanım${liste.length > 400 ? ' (ilk 400 gösteriliyor)' : ''}`;
  $('#kzTablo').innerHTML = `<tr><th>Kod</th><th>Ders</th><th>Sınıf</th><th>Ünite / Konu</th><th>Kazanım</th><th></th></tr>` +
    liste.slice(0, 400).map(k => `<tr><td style="white-space:nowrap">${esc(k.kod)}</td><td>${esc(k.ders)}</td><td>${esc(k.seviye)}</td>
      <td class="small">${esc(k.unite)}${k.konu ? '<br><span class="muted">' + esc(k.konu) + '</span>' : ''}</td>
      <td>${esc(k.metin)}</td><td><button class="btn small" data-kz-duz="${k.id}">✎</button></td></tr>`).join('') +
    (!liste.length ? `<tr><td colspan="6" class="muted">Kazanım yok. K12'den aldığınız kazanım Excel'lerini içe aktarın.</td></tr>` : '');
}
function kazanimDialog(kz) {
  const k = kz || { kod: '', ders: filtre.kzDers || '', seviye: filtre.kzSeviye || '', unite: '', konu: '', metin: '' };
  dialogAc(kz ? 'Kazanımı düzenle' : 'Yeni kazanım', `<datalist id="dersDL2">${S.dersler.map(d => opt(d, d)).join('')}</datalist>
    <div class="form-grid">
      <label>Kod<input id="kKod" value="${esc(k.kod)}"></label>
      <label>Ders<input id="kDers" value="${esc(k.ders)}" list="dersDL2"></label>
      <label>Sınıf seviyesi<input id="kSeviye" value="${esc(k.seviye)}" placeholder="ör. 9"></label>
      <label>Ünite / Tema<input id="kUnite" value="${esc(k.unite)}"></label>
      <label>Konu<input id="kKonu" value="${esc(k.konu)}"></label>
    </div>
    <label class="muted small">Kazanım metni<textarea id="kMetin" rows="3">${esc(k.metin)}</textarea></label>`, [
    ...(kz ? [{ ad: 'Sil', danger: true, tikla: () => { S.kazanimlar = S.kazanimlar.filter(x => x.id !== kz.id); kaydet(); ciz(); } }] : []),
    { ad: 'Vazgeç' },
    {
      ad: 'Kaydet', primary: true, tikla: () => {
        const v = { kod: $('#kKod').value.trim(), ders: $('#kDers').value.trim(), seviye: seviyeCoz($('#kSeviye').value), unite: $('#kUnite').value.trim(), konu: $('#kKonu').value.trim(), metin: $('#kMetin').value.trim() };
        if (!v.metin) { toast('Kazanım metni boş olamaz.'); return false; }
        if (kz) Object.assign(kz, v); else S.kazanimlar.push({ id: uid(), ...v });
        if (v.ders && !S.dersler.some(d => norm(d) === norm(v.ders))) S.dersler.push(v.ders);
        kaydet(); ciz();
      },
    },
  ]);
}

// ---------------------------------------------------------------------------
// SINAVLAR
// ---------------------------------------------------------------------------
function cizSinav() {
  const liste = S.sinavlar.slice().sort((a, b) => cmpTr(b.tarih, a.tarih));
  $('#sinavListe').innerHTML = liste.map(s => `<div class="list-item ${filtre.seciliSinav === s.id ? 'sel' : ''}" data-sinav="${s.id}">
      <span><b>${esc(s.ad)}</b><br><span class="small muted">${tarihTr(s.tarih)} · ${esc(KURUM[s.kurum]?.ad || '')} ${s.seviye ? '· ' + esc(s.seviye) : ''} · ${s.sorular.length} soru</span></span></div>`).join('')
    || '<p class="muted">Henüz sınav yok.</p>';
  const s = sinavBul(filtre.seciliSinav);
  if (!s) { $('#sinavDetay').innerHTML = '<p class="muted">Soldan bir sınav seçin veya yeni sınav oluşturun.</p>'; return; }
  const kzSecenekleri = sinavKazanimlari(s);
  const atanmamis = s.sorular.filter(q => !q.kazanimId).length;
  const konusuz = s.sorular.filter(q => soruKonu(q) === KONU_YOK).length;
  $('#sinavDetay').innerHTML = `
    <div class="form-grid">
      <label>Sınav adı<input id="sAd" value="${esc(s.ad)}"></label>
      <label>Tarih<input id="sTarih" type="date" value="${esc(s.tarih)}"></label>
      <label>Kurum türü<select id="sKurum">${KURUMLAR.map(k => opt(k.key, k.ad, k.key === kurumAl(s.kurum).key)).join('')}</select></label>
      <label>Sınıf seviyesi<select id="sSeviye">${opt('', 'Karışık')}${kurumAl(s.kurum).seviyeler.map(v => opt(v, seviyeAdi(v), v === s.seviye)).join('')}</select></label>
    </div>
    <div class="toolbar" style="margin-top:12px">
      <label class="btn primary">📥 Excel'den cevap anahtarı yükle<input type="file" id="anahtarDosya" accept=".xlsx,.xls,.xlsm,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" class="dosya-input"></label>
      <button class="btn" id="btnSoruEkle">➕ Soru</button>
      <button class="btn" id="btnTopluSoru">➕ Toplu soru</button>
      <button class="btn" id="btnTopluKonu">🏷️ Toplu konu ata</button>
      <button class="btn danger" id="btnSinavSil">🗑️ Sınavı sil</button>
    </div>
    <p class="small muted">${s.sorular.length} soru${atanmamis ? ` · <span class="chip orange">${atanmamis} soruya kazanım atanmamış</span>` : ''}${konusuz ? ` · <span class="chip orange">${konusuz} sorunun konusu yok</span>` : ''}.
      Konu analizi için her sorunun <b>konusu</b> yeterli; kazanım atarsanız konu kazanımdan otomatik gelir. Kazanım kutusuna kod veya metin yazarak arayabilirsiniz.</p>
    <datalist id="kzDL">${kzSecenekleri.map(k => `<option value="${esc(kazanimEtiket(k))}">`).join('')}</datalist>
    <datalist id="konuDL">${[...new Set([...S.kazanimlar.map(k => k.konu || k.unite), ...S.sinavlar.flatMap(x => x.sorular.map(q => q.konu))].filter(Boolean))].sort(cmpTr).map(k => `<option value="${esc(k)}">`).join('')}</datalist>
    <datalist id="dersDL3">${S.dersler.map(d => opt(d, d)).join('')}</datalist>
    <div class="tablewrap"><table>
      <tr><th style="width:60px">Soru</th><th style="width:150px">Ders</th><th style="width:190px">Konu</th><th>Kazanım</th><th style="width:70px">Cevap</th><th></th></tr>
      ${s.sorular.map((q, i) => `<tr>
        <td><input data-q="${i}" data-f="no" value="${esc(q.no)}" style="width:52px"></td>
        <td><input data-q="${i}" data-f="ders" value="${esc(q.ders)}" list="dersDL3" style="width:150px"></td>
        <td><input data-q="${i}" data-f="konu" value="${esc(q.konu || '')}" list="konuDL" style="width:180px" placeholder="${esc(q.kazanimId ? soruKonu(q) : 'konu adı')}"></td>
        <td><input data-q="${i}" data-f="kazanim" value="${esc(q.kazanimId ? kazanimEtiket(kazanimBul(q.kazanimId)) : '')}" list="kzDL" style="width:100%" placeholder="kazanım kodu veya metni"></td>
        <td><input data-q="${i}" data-f="cevap" value="${esc(q.cevap)}" style="width:50px"></td>
        <td><button class="btn small" data-q-sil="${i}">✕</button></td></tr>`).join('')}
    </table></div>`;
}
function sinavKazanimlari(s) {
  // Sınav seviyesine uygun kazanımları öne al; mezun sınavlarında tüm lise kazanımları
  let l = S.kazanimlar.filter(k => !!k.ornek === !!s.ornek);
  const sv = s.seviye ? [s.seviye] : kurumAl(s.kurum).seviyeler;
  const uygun = l.filter(k => !k.seviye || sv.includes(k.seviye));
  if (uygun.length) l = uygun;
  return l.slice().sort((a, b) => cmpTr(a.ders, b.ders) || cmpTr(a.kod, b.kod));
}
function yeniSinav() {
  const kurum = KURUM[filtre.kurum] ? filtre.kurum : varsayilanKurum();
  const s = { id: uid(), ad: 'Yeni deneme sınavı', tarih: bugun(), kurum, seviye: '', sorular: [] };
  S.sinavlar.push(s);
  filtre.seciliSinav = s.id;
  kaydet(); cizSinav();
  topluSoruDialog(s);
}
function topluSoruDialog(s) {
  dialogAc('Toplu soru ekle', `<p class="muted small">Her satıra bir ders ve soru sayısı yazın. Örnek: <code>Türkçe 40</code>. Sorular sınavın sonuna sırayla eklenir.</p>
    <textarea id="topluMetin" rows="6" placeholder="Türkçe 40\nMatematik 40\nFen Bilimleri 20\nSosyal Bilgiler 20"></textarea>`, [
    { ad: 'Vazgeç' },
    {
      ad: 'Ekle', primary: true, tikla: () => {
        let no = s.sorular.reduce((m, q) => Math.max(m, parseInt(q.no, 10) || 0), 0);
        let eklenen = 0;
        $('#topluMetin').value.split('\n').forEach(satir => {
          const m = satir.trim().match(/^(.*?)[\s:;,-]+(\d+)$/);
          if (!m) return;
          const ders = m[1].trim(), n = parseInt(m[2], 10);
          for (let i = 0; i < n && i < 300; i++) { s.sorular.push({ no: String(++no), ders, kazanimId: '', cevap: '' }); eklenen++; }
        });
        kaydet(); cizSinav();
        toast(`${eklenen} soru eklendi.`);
      },
    },
  ]);
}
function topluKonuDialog(s) {
  dialogAc('Toplu konu ata', `<p class="muted small">Her satıra soru aralığı ve konu yazın. Örnek:<br><code>1-5 Paragraf</code><br><code>6-10 Sözcükte Anlam</code><br><code>41-45 Kümeler</code><br>Tek soru için <code>12 Üçgenler</code> yazabilirsiniz. Yazılan konu, sorunun mevcut konusunun yerine geçer.</p>
    <textarea id="topluKonu" rows="8"></textarea>`, [
    { ad: 'Vazgeç' },
    {
      ad: 'Uygula', primary: true, tikla: () => {
        let n = 0;
        $('#topluKonu').value.split('\n').forEach(satir => {
          const m = satir.trim().match(/^(\d+)\s*(?:[-–]\s*(\d+))?\s*[:.)]?\s+(.+)$/);
          if (!m) return;
          const bas = parseInt(m[1], 10), son = parseInt(m[2] || m[1], 10), konu = m[3].trim();
          s.sorular.forEach(q => { const no = parseInt(q.no, 10); if (no >= bas && no <= son) { q.konu = konu; n++; } });
        });
        kaydet(); cizSinav();
        toast(`${n} soruya konu atandı.`);
      },
    },
  ]);
}
/** Cevap anahtarı satırlarını sınava uygular (aynı numaralı soruyu günceller, yenisini ekler). */
function anahtarUygula(s, kayitlar) {
  let n = 0, bulunamadi = 0, sira = s.sorular.length;
  for (const r of kayitlar) {
    if (!r.no && !r.kazanim && !r.cevap && !r.konu) continue;
    const no = (r.no ? String(parseInt(r.no, 10) || r.no) : String(++sira));
    let q = s.sorular.find(x => String(x.no) === no);
    if (!q) { q = { no, ders: '', kazanimId: '', cevap: '' }; s.sorular.push(q); }
    if (r.ders) q.ders = r.ders;
    if (r.cevap) q.cevap = trUpper(r.cevap);
    if (r.konu) q.konu = r.konu;
    if (r.kazanim) {
      const k = kazanimBulKodVeyaMetin(r.kazanim, q.ders, s.ornek);
      if (k) { q.kazanimId = k.id; if (!q.ders) q.ders = k.ders; } else bulunamadi++;
    }
    n++;
  }
  s.sorular.sort((a, b) => cmpTr(a.no, b.no));
  return { n, bulunamadi };
}
async function anahtarIceAktarElle(s, file) {
  const sayfalar = await excelOku(file);
  const kaynaklar = sayfalar.map(x => ({ dosya: file.name, yol: file.name, sayfa: x.sayfa, satirlar: x.satirlar }));
  iceAktarPenceresi({
    baslik: 'Cevap anahtarı / kazanım eşleştirmesi',
    alanlar: ALANLAR_ANAHTAR,
    kaynaklar,
    ekAlanlarHtml: `<div class="form-grid"><label>Mevcut sorular
      <select name="anahtarMod">${opt('birlestir', 'Aynı numaralı soruları güncelle, yenileri ekle', true)}${opt('sifirla', 'Tüm soruları sil, Excel\'dekileri yükle')}</select></label></div>`,
    uygula: secilenler => {
      if ($('[name=anahtarMod]').value === 'sifirla') s.sorular = [];
      let n = 0, bulunamadi = 0;
      for (const p of secilenler) { const r = anahtarUygula(s, p.kayitlar); n += r.n; bulunamadi += r.bulunamadi; }
      kaydet(); cizSinav();
      toast(`${n} soru işlendi${bulunamadi ? `, ${bulunamadi} kazanım listede bulunamadı (önce kazanımları içe aktarın)` : ''}.`, 5000);
    },
  });
}

// ---------------------------------------------------------------------------
// SONUÇ GİRİŞİ
// ---------------------------------------------------------------------------
function sinavSiniflari(s) {
  // Sınavın kurum/seviyesine uyan sınıflar + bu sınavda sonucu girilmiş öğrencilerin sınıfları
  const sonucluSiniflar = new Set(Object.keys(S.sonuclar[s.id] || {}).map(id => ogrenciBul(id)?.sinifId).filter(Boolean));
  return S.siniflar.filter(c => sonucluSiniflar.has(c.id) || (c.kurum === s.kurum && (!s.seviye || c.seviye === s.seviye))).sort(sinifSirala);
}
function cizSonuc() {
  const sinavlar = S.sinavlar.slice().sort((a, b) => cmpTr(b.tarih, a.tarih));
  if (!filtre.snSinav && sinavlar[0]) filtre.snSinav = sinavlar[0].id;
  $('#snSinav').innerHTML = opt('', 'Sınav seçin') + sinavlar.map(s => opt(s.id, `${s.ad} (${tarihTr(s.tarih)})`, s.id === filtre.snSinav)).join('');
  const s = sinavBul(filtre.snSinav);
  if (!s) { $('#snSinif').innerHTML = ''; $('#sonucAlan').innerHTML = '<p class="muted">Önce “Sınavlar” sekmesinden bir sınav oluşturun.</p>'; return; }
  const siniflar = sinavSiniflari(s);
  const tumSiniflar = siniflar.length ? siniflar : S.siniflar.slice().sort(sinifSirala);
  if (!tumSiniflar.some(c => c.id === filtre.snSinif)) filtre.snSinif = tumSiniflar[0]?.id || '';
  $('#snSinif').innerHTML = tumSiniflar.map(c => opt(c.id, sinifAdi(c), c.id === filtre.snSinif)).join('');
  if (!s.sorular.length) { $('#sonucAlan').innerHTML = '<p class="muted">Bu sınavda soru yok. “Sınavlar” sekmesinden soru ekleyin.</p>'; return; }
  const ogr = sinifOgrencileri(filtre.snSinif);
  if (!ogr.length) { $('#sonucAlan').innerHTML = '<p class="muted">Bu sınıfta öğrenci yok.</p>'; return; }
  const sn = S.sonuclar[s.id] || {};
  const dersGruplari = [];
  s.sorular.forEach(q => {
    let g = dersGruplari[dersGruplari.length - 1];
    if (!g || g.ders !== q.ders) { g = { ders: q.ders, sorular: [] }; dersGruplari.push(g); }
    g.sorular.push(q);
  });
  $('#sonucAlan').innerHTML = ogr.map(o => {
    const r = sn[o.id];
    const y = r ? Object.values(r).filter(v => v === 'Y').length : 0;
    const b = r ? Object.values(r).filter(v => v === 'B').length : 0;
    const d = s.sorular.length - y - b;
    return `<div class="ogr-sonuc card" data-ogr="${o.id}">
      <div class="ad">${esc(o.no)} ${esc(adSoyad(o))}
        ${r ? `<span class="chip green">${d} D</span><span class="chip red">${y} Y</span><span class="chip orange">${b} B</span>` : '<span class="chip">girilmedi</span>'}
        <button class="btn small" data-sonuc-sil="${o.id}">Sıfırla</button>
        <button class="btn small" data-ogr-analiz="${o.id}">Analiz →</button></div>
      <div class="hizli">
        <label>Yanlış sorular<input data-hizli="Y" inputmode="numeric" value="${esc(hizliMetin(r, 'Y'))}" placeholder="ör. 3 7 12"></label>
        <label>Boş sorular<input data-hizli="B" inputmode="numeric" value="${esc(hizliMetin(r, 'B'))}" placeholder="ör. 5 9"></label>
      </div>
      ${dersGruplari.map(g => `<div class="ders-grup"><span class="dersad">${esc(g.ders || 'Ders yok')}</span><div class="qrow">
        ${g.sorular.map(q => { const v = r?.[q.no] || 'D'; return `<button type="button" class="q ${v}" data-qno="${esc(q.no)}" title="${esc(kazanimEtiket(kazanimBul(q.kazanimId)))}">${esc(q.no)}<small>${v}</small></button>`; }).join('')}
      </div></div>`).join('')}
    </div>`;
  }).join('');
}
function hizliMetin(r, tip) {
  return r ? Object.keys(r).filter(k => r[k] === tip).sort((a, b) => cmpTr(a, b)).join(' ') : '';
}
/** Yanlış / boş soru numaralarını yazarak giriş. */
function hizliGiris(input) {
  const s = sinavBul(filtre.snSinav);
  const kart = input.closest('[data-ogr]');
  const ogrId = kart.dataset.ogr;
  const gecerli = new Set(s.sorular.map(q => String(q.no)));
  const oku = tip => (kart.querySelector(`[data-hizli="${tip}"]`).value.match(/\d+/g) || []).map(x => String(parseInt(x, 10)));
  const y = oku('Y'), b = oku('B');
  const hatali = [...y, ...b].filter(n => !gecerli.has(n));
  const iki = y.filter(n => b.includes(n));
  if (hatali.length) toast(`Sınavda olmayan soru numarası: ${[...new Set(hatali)].join(', ')}`, 4000);
  else if (iki.length) toast(`${iki.join(', ')} hem yanlış hem boş yazılmış; boş olarak kaydedildi.`, 4000);
  const r = {};
  y.filter(n => gecerli.has(n)).forEach(n => { r[n] = 'Y'; });
  b.filter(n => gecerli.has(n)).forEach(n => { r[n] = 'B'; });
  S.sonuclar[s.id] = S.sonuclar[s.id] || {};
  S.sonuclar[s.id][ogrId] = r;
  kaydet();
  // Kartı yenile ve bir sonraki kutuya geç
  const tip = input.dataset.hizli;
  cizSonuc();
  const kartlar = $$('#sonucAlan [data-ogr]');
  const i = kartlar.findIndex(k => k.dataset.ogr === ogrId);
  const hedef = tip === 'Y' ? kartlar[i]?.querySelector('[data-hizli="B"]') : kartlar[i + 1]?.querySelector('[data-hizli="Y"]');
  if (hedef) hedef.focus();
}
function soruDurumDegistir(ogrId, qno, el) {
  const s = sinavBul(filtre.snSinav);
  S.sonuclar[s.id] = S.sonuclar[s.id] || {};
  const r = S.sonuclar[s.id][ogrId] = S.sonuclar[s.id][ogrId] || {};
  const sira = { D: 'Y', Y: 'B', B: 'D' };
  const yeni = sira[r[qno] || 'D'];
  if (yeni === 'D') delete r[qno]; else r[qno] = yeni;
  kaydet();
  el.className = 'q ' + yeni;
  el.querySelector('small').textContent = yeni;
  // özet çiplerini güncelle
  const kart = el.closest('.ogr-sonuc');
  const y = Object.values(r).filter(v => v === 'Y').length, b = Object.values(r).filter(v => v === 'B').length;
  kart.querySelector('[data-hizli="Y"]').value = hizliMetin(r, 'Y');
  kart.querySelector('[data-hizli="B"]').value = hizliMetin(r, 'B');
  const ad = kart.querySelector('.ad');
  $$('.chip', ad).forEach(c => c.remove());
  ad.querySelector('[data-sonuc-sil]').insertAdjacentHTML('beforebegin',
    `<span class="chip green">${s.sorular.length - y - b} D</span><span class="chip red">${y} Y</span><span class="chip orange">${b} B</span>`);
}
/** Sonuç sayfasını sınava uygular: soru numaralı sütunlar ya da tek "cevaplar" sütunu. */
function sonucParcaUygula(s, p) {
  let n = 0;
  const bulunamadi = [];
  const soruSutun = {};
  p.basliklar.forEach((h, ci) => {
    const m = String(h).trim().match(/^(?:s(?:oru)?\.?\s*)?(\d{1,3})\.?$/i);
    if (m && s.sorular.some(q => String(q.no) === String(parseInt(m[1], 10)))) soruSutun[parseInt(m[1], 10)] = ci;
  });
  const veri = p.satirlar.slice(p.bi + 1).filter(r => r.some(c => c));
  veri.forEach((satir, ri) => {
    const k = p.kayitlar[ri];
    let o = null;
    const uygunOgr = x => !!x.ornek === !!s.ornek;
    if (k.no) o = S.ogrenciler.find(x => uygunOgr(x) && x.no === k.no.trim());
    if (!o && k.adsoyad) o = S.ogrenciler.find(x => uygunOgr(x) && norm(adSoyad(x)) === norm(k.adsoyad));
    if (!o) { if (k.no || k.adsoyad) bulunamadi.push(k.adsoyad || k.no); return; }
    const r = {};
    const degerlendir = (q, v) => {
      v = trUpper(String(v ?? '').trim());
      if (['', '-', '*', 'BOŞ', 'BOS'].includes(v)) { r[q.no] = 'B'; return; }
      if (q.cevap && /^[A-E]$/.test(v)) { if (v !== trUpper(q.cevap)) r[q.no] = 'Y'; return; }
      if (['D', '1', '+', 'DOĞRU', 'DOGRU', '✓'].includes(v)) return;
      if (v === 'B') { r[q.no] = 'B'; return; }
      r[q.no] = 'Y'; // Y, 0, YANLIŞ veya anahtarsız şık
    };
    if (Object.keys(soruSutun).length) {
      s.sorular.forEach(q => { const ci = soruSutun[parseInt(q.no, 10)]; if (ci !== undefined) degerlendir(q, satir[ci]); });
    } else if (k.cevaplar !== undefined) {
      const c = String(satir[p.es.cevaplar] ?? '');
      s.sorular.forEach((q, i) => degerlendir(q, c[i] === ' ' ? '' : c[i]));
    } else return;
    S.sonuclar[s.id] = S.sonuclar[s.id] || {};
    S.sonuclar[s.id][o.id] = r;
    n++;
  });
  return { n, bulunamadi, soruSutunu: Object.keys(soruSutun).length };
}
const ALANLAR_SONUC = {
  no: ALANLAR_OGRENCI.no,
  adsoyad: ALANLAR_OGRENCI.adsoyad,
  cevaplar: { ad: 'Cevaplar (tek sütunda, ör. ABCD…)', alias: ['cevaplar', 'ogrencicevaplari', 'cevapdizisi', 'yanitlar'] },
};
async function sonucIceAktarElle(fileList) {
  const s = sinavBul(filtre.snSinav);
  if (!s) { toast('Önce sınav seçin.'); return; }
  const kaynaklar = await dosyalariOku(fileList);
  if (!kaynaklar.length) return;
  // Sonuç dosyası: öğrenci no / ad sütunu + soru numaralı sütunlar (D/Y/B ya da şık) veya tek "cevaplar" sütunu.
  const alanlar = {
    no: ALANLAR_OGRENCI.no,
    adsoyad: ALANLAR_OGRENCI.adsoyad,
    cevaplar: { ad: 'Cevaplar (tek sütunda, ör. ABCD…)', alias: ['cevaplar', 'ogrencicevaplari', 'cevapdizisi', 'yanitlar'] },
  };
  iceAktarPenceresi({
    baslik: `Sonuç içe aktar – ${s.ad}`,
    alanlar,
    kaynaklar,
    ekAlanlarHtml: `<p class="small muted">Desteklenen biçimler: (1) Soru numaraları sütun başlığında (1, 2, 3…) ve hücrelerde D/Y/B, 1/0 veya öğrencinin işaretlediği şık;
      (2) “Cevaplar” sütununda öğrencinin tüm cevapları yan yana (ör. <code>ABCD BDA…</code>, boş = boşluk). Şık girildiğinde sınavdaki cevap anahtarıyla karşılaştırılır.</p>`,
    uygula: secilenler => {
      let n = 0, bulunamadi = [];
      for (const p of secilenler) { const r = sonucParcaUygula(s, p); n += r.n; bulunamadi.push(...r.bulunamadi); }
      kaydet(); ciz();
      toast(`${n} öğrencinin sonucu aktarıldı${bulunamadi.length ? `; ${bulunamadi.length} öğrenci bulunamadı: ${bulunamadi.slice(0, 5).join(', ')}${bulunamadi.length > 5 ? '…' : ''}` : ''}.`, 6000);
    },
  });
}

// ---------------------------------------------------------------------------
// ANALİZ VE ÖDEV PLANI
// ---------------------------------------------------------------------------
const KONU_YOK = 'Konu belirtilmemiş';
function soruDers(q) { return (q.ders || kazanimBul(q.kazanimId)?.ders || 'Ders yok').trim(); }
function soruKonu(q) {
  const k = kazanimBul(q.kazanimId);
  return (q.konu || k?.konu || k?.unite || '').trim() || KONU_YOK;
}
const konuAnahtar = (ders, konu) => ders + '|' + konu;
/** Başarı yüzdesine göre durum ve önerilen soru sayısı. */
function konuDurum(basari) {
  const a = S.ayarlar;
  if (basari < a.esikEksik) return { kod: 'eksik', ad: 'Eksik', renk: 'red', soru: a.soruEksik, oneri: `Konu tekrarı yap, ardından ${a.soruEksik} soru çöz.` };
  if (basari < a.esikIyi) return { kod: 'orta', ad: 'Geliştirilmeli', renk: 'orange', soru: a.soruOrta, oneri: `${a.soruOrta} soru çöz, yanlışlarını kontrol et.` };
  return { kod: 'iyi', ad: 'İyi', renk: 'green', soru: 0, oneri: 'Bu konuda iyi; ara sıra tekrar yeterli.' };
}
/** Öğrencinin seçili sınavlardaki konu bazlı sonucu. */
function konuAnalizi(ogrId, sinavIdler) {
  const harita = new Map();
  for (const sid of sinavIdler) {
    const s = sinavBul(sid);
    const r = S.sonuclar[sid]?.[ogrId];
    if (!s || !r) continue;
    for (const q of s.sorular) {
      const ders = soruDers(q), konu = soruKonu(q), key = konuAnahtar(ders, konu);
      if (!harita.has(key)) harita.set(key, { key, ders, konu, toplam: 0, d: 0, y: 0, b: 0, sorular: [] });
      const e = harita.get(key);
      const durum = r[q.no] || 'D';
      e.toplam++;
      if (durum === 'Y') e.y++; else if (durum === 'B') e.b++; else e.d++;
      if (durum !== 'D') e.sorular.push(`${s.ad} #${q.no}`);
    }
  }
  const liste = [...harita.values()].map(e => {
    const basari = Math.round(100 * e.d / Math.max(1, e.toplam));
    return { ...e, basari, durum: konuDurum(basari) };
  });
  liste.sort((a, b) => cmpTr(a.ders, b.ders) || a.basari - b.basari || cmpTr(a.konu, b.konu));
  return liste;
}
function basariCubugu(yuzde, renk) {
  return `<span class="bar" title="%${yuzde}"><span class="bar-dolu ${renk}" style="width:${Math.max(2, yuzde)}%"></span></span><span class="bar-yazi">%${yuzde}</span>`;
}

/** Öğrencinin çözemediği sorulardan kazanım listesi. */
function eksikKazanimlar(ogrId, sinavIdler) {
  const harita = new Map();
  const kazanimsiz = [];
  for (const sid of sinavIdler) {
    const s = sinavBul(sid);
    const r = S.sonuclar[sid]?.[ogrId];
    if (!s || !r) continue;
    for (const q of s.sorular) {
      const durum = r[q.no];
      if (durum !== 'Y' && durum !== 'B') continue;
      if (!q.kazanimId || !kazanimBul(q.kazanimId)) { kazanimsiz.push({ sinav: s, q, durum }); continue; }
      const k = kazanimBul(q.kazanimId);
      if (!harita.has(k.id)) harita.set(k.id, { k, yanlis: 0, bos: 0, sorular: [] });
      const e = harita.get(k.id);
      if (durum === 'Y') e.yanlis++; else e.bos++;
      e.sorular.push({ sinav: s.ad, no: q.no, durum });
    }
  }
  const liste = [...harita.values()].sort((a, b) => (b.yanlis + b.bos) - (a.yanlis + a.bos) || cmpTr(a.k.ders, b.k.ders) || cmpTr(a.k.kod, b.k.kod));
  return { liste, kazanimsiz };
}
const analizSecim = { sinavlar: null, kazanimlar: null, konular: null, ogrId: null };

function cizAnaliz() {
  const siniflar = S.siniflar.slice().sort(sinifSirala);
  if (!siniflar.some(c => c.id === filtre.anSinif)) filtre.anSinif = siniflar[0]?.id || '';
  $('#anSinif').innerHTML = siniflar.map(c => opt(c.id, sinifAdi(c), c.id === filtre.anSinif)).join('') || opt('', 'Sınıf yok');
  const ogr = sinifOgrencileri(filtre.anSinif);
  if (!ogr.some(o => o.id === filtre.anOgrenci)) filtre.anOgrenci = ogr[0]?.id || '';
  $('#anOgrenci').innerHTML = ogr.map(o => opt(o.id, `${o.no ? o.no + ' – ' : ''}${adSoyad(o)}`, o.id === filtre.anOgrenci)).join('') || opt('', 'Öğrenci yok');
  const o = ogrenciBul(filtre.anOgrenci);
  if (!o) { $('#analizAlan').innerHTML = '<p class="muted">Bir öğrenci seçin.</p>'; return; }

  const girilmis = S.sinavlar.filter(s => S.sonuclar[s.id]?.[o.id]).sort((a, b) => cmpTr(b.tarih, a.tarih));
  if (analizSecim.ogrId !== o.id) { analizSecim.ogrId = o.id; analizSecim.sinavlar = null; analizSecim.kazanimlar = null; analizSecim.konular = null; }
  if (!analizSecim.sinavlar) analizSecim.sinavlar = new Set(girilmis.slice(0, 1).map(s => s.id));
  const { liste, kazanimsiz } = eksikKazanimlar(o.id, [...analizSecim.sinavlar]);
  if (!analizSecim.kazanimlar) analizSecim.kazanimlar = new Set(liste.map(e => e.k.id));
  const konular = konuAnalizi(o.id, [...analizSecim.sinavlar]);
  if (!analizSecim.konular) analizSecim.konular = new Set(konular.filter(k => k.durum.kod !== 'iyi').map(k => k.key));
  const sayac = { eksik: 0, orta: 0, iyi: 0 };
  konular.forEach(k => { sayac[k.durum.kod]++; });
  const onerilen = konular.filter(k => k.durum.kod !== 'iyi').sort((a, b) => a.basari - b.basari || cmpTr(a.ders, b.ders));
  const toplamOneri = onerilen.reduce((t, k) => t + k.durum.soru, 0);
  const konuDers = {};
  konular.forEach(k => { (konuDers[k.ders] = konuDers[k.ders] || []).push(k); });

  const planlar = S.planlar.filter(p => p.ogrenciId === o.id).sort((a, b) => cmpTr(b.olusturma, a.olusturma));
  const dersGrup = {};
  liste.forEach(e => { (dersGrup[e.k.ders] = dersGrup[e.k.ders] || []).push(e); });

  $('#analizAlan').innerHTML = `
  <div class="card">
    <h2>${esc(adSoyad(o))} <span class="muted small">${esc(o.no)} · ${esc(sinifAdi(sinifBul(o.sinifId)))}</span></h2>
    <h3>📝 Sınavlar</h3>
    ${girilmis.length ? girilmis.map(s => {
      const r = S.sonuclar[s.id][o.id];
      const y = Object.values(r).filter(v => v === 'Y').length, b = Object.values(r).filter(v => v === 'B').length;
      return `<label class="kz-row" style="border:0;padding:4px"><input type="checkbox" data-an-sinav="${s.id}" ${analizSecim.sinavlar.has(s.id) ? 'checked' : ''}>
        <span>${esc(s.ad)} <span class="muted small">${tarihTr(s.tarih)}</span>
        <span class="chip green">${s.sorular.length - y - b} D</span> <span class="chip red">${y} Y</span> <span class="chip orange">${b} B</span></span></label>`;
    }).join('') : '<p class="muted">Bu öğrenci için girilmiş sınav sonucu yok. “Sonuç Girişi” sekmesinden girin.</p>'}
  </div>

  ${konular.length ? `<div class="card">
    <h2>🎯 Soru çözme önerisi</h2>
    <p class="muted small">Seçili ${analizSecim.sinavlar.size > 1 ? 'sınavlardaki' : 'sınavdaki'} sonuçlara göre ${esc(o.ad)} şu konulardan soru çözmeli (en zayıf konu en üstte):</p>
    ${onerilen.length ? `<div class="tablewrap"><table class="oneri">
      <tr><th>Ders</th><th>Konu</th><th>Başarı</th><th>Ne yapmalı?</th><th class="sag">Soru</th></tr>
      ${onerilen.map(k => `<tr><td>${esc(k.ders)}</td><td><b>${esc(k.konu)}</b></td>
        <td style="white-space:nowrap"><span class="chip ${k.durum.renk}">%${k.basari}</span></td>
        <td class="small">${esc(k.durum.oneri)}</td><td class="sag"><b>${k.durum.soru}</b></td></tr>`).join('')}
      <tr><td colspan="4"><b>Toplam</b></td><td class="sag"><b>${toplamOneri}</b></td></tr>
    </table></div>
    <div class="toolbar" style="margin-top:10px"><button class="btn" id="btnOneriExcel">Soru çözme listesini Excel'e aktar</button>
      ${ARTIFACT ? '' : '<button class="btn" id="btnOneriYazdir">Öğrenciye vermek için yazdır</button>'}</div>`
    : '<p><span class="chip green">Bütün konularda başarılı</span> Bu sınavlarda eksik konu görünmüyor.</p>'}
  </div>

  <div class="card">
    <h2>📈 Konu analizi <span class="muted small">(${konular.length} konu)</span></h2>
    <div class="toolbar"><span class="chip red">${sayac.eksik} eksik</span><span class="chip orange">${sayac.orta} geliştirilmeli</span><span class="chip green">${sayac.iyi} iyi</span>
      <span class="muted small">Eksik: başarı %${S.ayarlar.esikEksik}'in altında · İyi: %${S.ayarlar.esikIyi} ve üstü</span></div>
    ${Object.entries(konuDers).map(([ders, l]) => {
      const t = l.reduce((a, k) => ({ d: a.d + k.d, n: a.n + k.toplam }), { d: 0, n: 0 });
      const db = Math.round(100 * t.d / Math.max(1, t.n));
      return `<div class="group-title">${esc(ders)} · ${t.n} soru · başarı %${db}</div>
      <div class="tablewrap"><table class="konu-tablo">
        <tr><th></th><th>Konu</th><th class="sag">Soru</th><th class="sag">D</th><th class="sag">Y</th><th class="sag">B</th><th>Başarı</th><th>Durum</th></tr>
        ${l.map(k => `<tr><td><input type="checkbox" data-an-konu="${esc(k.key)}" ${analizSecim.konular.has(k.key) ? 'checked' : ''} aria-label="Plana ekle"></td>
          <td>${esc(k.konu)}${k.sorular.length ? `<div class="kz-meta">Çözemediği: ${k.sorular.map(esc).join(', ')}</div>` : ''}</td>
          <td class="sag">${k.toplam}</td><td class="sag">${k.d}</td><td class="sag">${k.y}</td><td class="sag">${k.b}</td>
          <td style="min-width:120px">${basariCubugu(k.basari, k.durum.renk)}</td>
          <td><span class="chip ${k.durum.renk}">${k.durum.ad}</span></td></tr>`).join('')}
      </table></div>`;
    }).join('')}
    ${konular.some(k => k.konu === KONU_YOK) ? `<p class="small"><span class="chip orange">Bazı soruların konusu yok</span> “Sınavlar” sekmesinden konu veya kazanım atayın.</p>` : ''}
    <div class="toolbar" style="margin-top:10px"><button class="btn primary" id="btnKonuPlan">İşaretli konularla ödev / çalışma planı hazırla</button></div>
  </div>` : ''}

  <div class="card">
    <h2>🧩 Çözemediği sorulara göre kazanımlar <span class="muted small">(${liste.length})</span></h2>
    ${liste.length ? `<div class="toolbar"><button class="btn small" id="kzHepsi">Tümünü seç</button><button class="btn small" id="kzHicbiri">Hiçbirini seçme</button></div>` : ''}
    ${Object.entries(dersGrup).map(([ders, l]) => `<div class="group-title">${esc(ders)} · ${l.length} kazanım</div>` + l.map(e => `
      <label class="kz-row"><input type="checkbox" data-an-kz="${e.k.id}" ${analizSecim.kazanimlar.has(e.k.id) ? 'checked' : ''}>
        <span class="kz-body"><span class="kz-kod">${esc(e.k.kod || '')}</span> ${esc(e.k.metin)}
          <div class="kz-meta">${[e.k.seviye && seviyeAdi(e.k.seviye), e.k.unite, e.k.konu].filter(Boolean).map(esc).join(' · ')}</div>
          <div class="kz-meta">${e.yanlis ? `<span class="chip red">${e.yanlis} yanlış</span> ` : ''}${e.bos ? `<span class="chip orange">${e.bos} boş</span> ` : ''}
          Sorular: ${e.sorular.map(q => `${esc(q.sinav)} #${esc(q.no)}`).join(', ')}</div></span></label>`).join('')).join('')}
    ${!liste.length && girilmis.length ? '<p class="muted">Seçili sınavlarda kazanımı belirli yanlış/boş soru yok.</p>' : ''}
    ${kazanimsiz.length ? `<p class="small"><span class="chip orange">${kazanimsiz.length} yanlış/boş soruya kazanım atanmamış</span>
      (${kazanimsiz.slice(0, 12).map(x => `${esc(x.sinav.ad)} #${esc(x.q.no)}`).join(', ')}${kazanimsiz.length > 12 ? '…' : ''}). “Sınavlar” sekmesinden kazanım atayın.</p>` : ''}
    ${liste.length ? `<div class="toolbar"><button class="btn primary" id="btnPlanHazirla">Seçili kazanımlarla ödev / çalışma planı hazırla</button>
      ${ARTIFACT ? '' : '<button class="btn" id="btnKzListeYazdir">Kazanım listesini yazdır</button>'}</div>` : ''}
  </div>

  <div class="card">
    <h2>🗓️ Ödev / çalışma planları <span class="muted small">(${planlar.length})</span></h2>
    ${planlar.map(p => {
      const tamam = p.gorevler.filter(g => g.tamam).length;
      return `<div class="list-item" data-plan="${p.id}"><span><b>${esc(p.baslik)}</b><br>
        <span class="small muted">${tarihTr(p.gorevler[0]?.tarih)} – ${tarihTr(p.gorevler[p.gorevler.length - 1]?.tarih)} · ${p.gorevler.length} görev · ${tamam}/${p.gorevler.length} tamamlandı</span></span>
        <span class="chip ${tamam === p.gorevler.length ? 'green' : ''}">%${Math.round(100 * tamam / Math.max(1, p.gorevler.length))}</span></div>`;
    }).join('') || '<p class="muted">Henüz plan yok.</p>'}
  </div>`;
}

function kazanimPlanDialog(o) {
  const { liste } = eksikKazanimlar(o.id, [...analizSecim.sinavlar]);
  const secili = liste.filter(e => analizSecim.kazanimlar.has(e.k.id));
  if (!secili.length) { toast('En az bir kazanım seçin.'); return; }
  planDialog(o, secili, false);
}
function konuPlanDialog(o) {
  const secili = konuAnalizi(o.id, [...analizSecim.sinavlar])
    .filter(k => analizSecim.konular.has(k.key))
    .sort((a, b) => a.basari - b.basari)
    .map(k => ({
      k: { id: '', kod: '', ders: k.ders, metin: k.konu, konu: k.konu, unite: '' },
      yanlis: k.y, bos: k.b, soru: k.durum.soru || S.ayarlar.soruOrta,
    }));
  if (!secili.length) { toast('Konu analizinden en az bir konu işaretleyin.'); return; }
  planDialog(o, secili, true);
}
function planDialog(o, secili, konuBazli) {
  const birim = konuBazli ? 'konu' : 'kazanım';
  const gunOneri = Math.min(30, Math.max(7, Math.ceil(secili.length / 2) + 5));
  dialogAc(`Ödev / çalışma planı – ${adSoyad(o)}`, `
    <p class="muted small">${secili.length} ${birim} seçildi. ${konuBazli ? 'En düşük başarılı konular öne alınır; her konunun soru sayısı öneriden gelir (eksik konu ' + S.ayarlar.soruEksik + ', geliştirilmeli ' + S.ayarlar.soruOrta + ' soru).' : 'En çok yanlış/boş yapılan kazanımlar öne alınır.'}</p>
    <div class="plan-ayar">
      <label>Plan başlığı<input id="pBaslik" value="${esc((S.sinavlar.filter(s => analizSecim.sinavlar.has(s.id)).map(s => s.ad).join(', ') || 'Kazanım') + ' – Çalışma planı')}"></label>
      <label>Başlangıç tarihi<input id="pBaslangic" type="date" value="${addDays(bugun(), 1)}"></label>
      <label>Süre (gün)<input id="pGun" type="number" min="1" max="90" value="${gunOneri}"></label>
      ${konuBazli ? '' : '<label>Kazanım başına soru sayısı<input id="pSoru" type="number" min="0" max="200" value="20"></label>'}
      <label>Günde en fazla yeni ${birim}<input id="pGunluk" type="number" min="1" max="20" value="${konuBazli ? 2 : 3}"></label>
      <label class="cb"><input type="checkbox" id="pKonu" checked> Konu tekrarı görevi ekle</label>
      <label class="cb"><input type="checkbox" id="pTekrar" checked> 3 gün sonra tekrar testi ekle</label>
      <label class="cb"><input type="checkbox" id="pPazar" checked> Pazar günü dinlenme</label>
      <label class="cb"><input type="checkbox" id="pGenel" checked> Son gün genel tekrar</label>
    </div>
    <label class="muted small">Öğretmen notu (planın altına yazılır)<textarea id="pNot" rows="2" placeholder="ör. Yanlış yaptığın soruları deftere yazıp tekrar çöz."></textarea></label>`, [
    { ad: 'Vazgeç' },
    {
      ad: 'Planı oluştur', primary: true, tikla: () => {
        const ayar = {
          baslik: $('#pBaslik').value.trim() || 'Çalışma planı',
          baslangic: $('#pBaslangic').value || bugun(),
          gun: Math.max(1, Math.min(90, parseInt($('#pGun').value, 10) || 7)),
          soru: konuBazli ? S.ayarlar.soruOrta : Math.max(0, parseInt($('#pSoru')?.value, 10) || 0),
          gunluk: Math.max(1, parseInt($('#pGunluk').value, 10) || 3),
          konu: $('#pKonu').checked, tekrar: $('#pTekrar').checked, pazar: $('#pPazar').checked, genel: $('#pGenel').checked,
          not: $('#pNot').value.trim(),
        };
        const plan = planOlustur(o, secili, ayar);
        S.planlar.push(plan);
        kaydet(); ciz();
        planGoster(plan.id);
        return false;
      },
    },
  ]);
}

function planOlustur(o, secili, a) {
  // Çalışma günlerini belirle
  const gunler = [];
  for (let i = 0; gunler.length < a.gun && i < a.gun * 2 + 7; i++) {
    const t = addDays(a.baslangic, i);
    if (a.pazar && new Date(t + 'T00:00:00').getDay() === 0) continue;
    gunler.push(t);
  }
  const genelGun = a.genel && gunler.length >= 3 ? gunler.length - 1 : -1;
  const yeniGunSayisi = genelGun >= 0 ? genelGun : gunler.length;
  // Kazanımları günlere dağıt (dengeli, en zor olan önce)
  // Tekrar testlerine yer kalsın diye yeni kazanımlar ilk günlere yayılır (günlük sınırı aşmadan)
  const enAzGun = Math.ceil(secili.length / a.gunluk);
  let calismaGun = a.tekrar ? Math.max(enAzGun, yeniGunSayisi - 3) : yeniGunSayisi;
  calismaGun = Math.max(1, Math.min(yeniGunSayisi, calismaGun, secili.length));
  const gorevler = [];
  secili.forEach((e, i) => {
    const gi = Math.min(yeniGunSayisi - 1, Math.floor(i * calismaGun / secili.length));
    const k = e.k;
    const temel = { ders: k.ders, kod: k.kod, kazanim: k.metin, kazanimId: k.id, tamam: false };
    const parca = [];
    if (a.konu) parca.push(`Konu tekrarı yap: ${k.konu || k.unite || 'konu anlatımını'} oku, kısa özet çıkar.`);
    const soru = e.soru ?? a.soru;
    if (soru) parca.push(`${soru} soru çöz.`);
    if (e.yanlis + e.bos) parca.push(`Sınavda yanlış/boş bıraktığın ${e.yanlis + e.bos} soruyu tekrar çöz.`);
    gorevler.push({ ...temel, tarih: gunler[gi], tur: 'Çalışma', gorev: parca.join(' ') });
    if (a.tekrar) {
      let ti = gi + 3;
      const sinir = genelGun >= 0 ? genelGun - 1 : gunler.length - 1;
      if (ti > sinir) ti = sinir > gi ? sinir : -1;
      if (ti >= 0) gorevler.push({ ...temel, tarih: gunler[ti], tur: 'Tekrar', gorev: `Tekrar testi: ${Math.max(5, Math.round(soru / 2))} soru çöz, yanlışlarını kontrol et.` });
    }
  });
  if (genelGun >= 0) {
    const dersler = [...new Set(secili.map(e => e.k.ders))];
    dersler.forEach(d => gorevler.push({
      ders: d, kod: '', kazanim: 'Genel tekrar (bu plandaki tüm konular)', kazanimId: '', tamam: false,
      tarih: gunler[genelGun], tur: 'Genel tekrar', gorev: `${d}: plandaki konulardan karışık ${Math.max(10, secili.filter(e => e.k.ders === d).length * 3)} soru çöz; sınavdaki yanlışlarını yeniden gözden geçir.`,
    }));
  }
  const turSira = { 'Çalışma': 0, 'Tekrar': 1, 'Genel tekrar': 2 };
  gorevler.sort((x, y) => cmpTr(x.tarih, y.tarih) || turSira[x.tur] - turSira[y.tur] || cmpTr(x.ders, y.ders));
  gorevler.forEach(g => { g.id = uid(); });
  return { id: uid(), ogrenciId: o.id, olusturma: new Date().toISOString(), baslik: a.baslik, not: a.not, gorevler };
}

function planGoster(planId) {
  const p = S.planlar.find(x => x.id === planId);
  if (!p) return;
  const o = ogrenciBul(p.ogrenciId);
  const satirlar = p.gorevler.map(g => `<tr>
      <td><input type="checkbox" data-gorev="${g.id}" ${g.tamam ? 'checked' : ''}></td>
      <td style="white-space:nowrap">${tarihTr(g.tarih)}<br><span class="muted small">${gunAdi(g.tarih)}</span></td>
      <td>${esc(g.ders)}</td>
      <td class="small"><b>${esc(g.kod)}</b> ${esc(g.kazanim)}</td>
      <td class="small"><span class="chip ${g.tur === 'Tekrar' ? 'orange' : g.tur === 'Genel tekrar' ? 'green' : ''}">${esc(g.tur)}</span> ${esc(g.gorev)}</td></tr>`).join('');
  dialogAc(p.baslik, `<p class="muted small">${esc(adSoyad(o))} · ${esc(sinifAdi(sinifBul(o?.sinifId)))} · ${p.gorevler.length} görev. Tamamlanan görevleri işaretleyebilirsiniz.</p>
    <div class="tablewrap"><table><tr><th>✓</th><th>Tarih</th><th>Ders</th><th>Kazanım</th><th>Görev</th></tr>${satirlar}</table></div>
    ${p.not ? `<p><b>Öğretmen notu:</b> ${esc(p.not)}</p>` : ''}`, [
    { ad: 'Planı sil', danger: true, tikla: () => { S.planlar = S.planlar.filter(x => x.id !== p.id); kaydet(); ciz(); } },
    { ad: 'Excel\'e aktar', tikla: () => { planExcel(p); return false; } },
    ...(ARTIFACT ? [] : [{ ad: 'Yazdır', tikla: () => { planYazdir(p); return false; } }]),
    { ad: 'Kapat', primary: true },
  ]);
}
function planExcel(p) {
  const o = ogrenciBul(p.ogrenciId);
  const satirlar = p.gorevler.map(g => ({
    'Tarih': tarihTr(g.tarih), 'Gün': gunAdi(g.tarih), 'Ders': g.ders, 'Kazanım Kodu': g.kod, 'Kazanım': g.kazanim,
    'Tür': g.tur, 'Görev': g.gorev, 'Tamamlandı': g.tamam ? 'Evet' : '',
  }));
  const ws = XLSX.utils.json_to_sheet(satirlar);
  ws['!cols'] = [{ wch: 11 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 60 }, { wch: 12 }, { wch: 70 }, { wch: 11 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plan');
  excelIndir(wb, `Odev_${dosyaAdi(adSoyad(o))}_${p.gorevler[0]?.tarih || ''}.xlsx`);
}
const dosyaAdi = s => String(s)
  .replace(/[çÇğĞıİöÖşŞüÜ]/g, c => ({ ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U' }[c]))
  .replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '_');
function yazdir(html) {
  $('#printArea').innerHTML = html;
  const dlg = $('#dlg');
  const acikti = dlg.open;
  if (acikti) dlg.close();
  setTimeout(() => {
    window.print();
    if (acikti) dlg.showModal();
  }, 50);
}
function planYazdir(p) {
  const o = ogrenciBul(p.ogrenciId);
  yazdir(`<h2>${esc(p.baslik)}</h2>
    <p><b>Öğrenci:</b> ${esc(adSoyad(o))} (${esc(o?.no)}) · <b>Sınıf:</b> ${esc(sinifAdi(sinifBul(o?.sinifId)))} · <b>Hazırlanma:</b> ${tarihTr(p.olusturma.slice(0, 10))}</p>
    <table><tr><th>Tarih</th><th>Ders</th><th>Kazanım</th><th>Görev</th><th>✓</th></tr>
    ${p.gorevler.map(g => `<tr><td>${tarihTr(g.tarih)}<br>${gunAdi(g.tarih)}</td><td>${esc(g.ders)}</td><td><b>${esc(g.kod)}</b> ${esc(g.kazanim)}</td>
      <td><i>${esc(g.tur)}:</i> ${esc(g.gorev)}</td><td><span class="kutu"></span></td></tr>`).join('')}</table>
    ${p.not ? `<p><b>Öğretmen notu:</b> ${esc(p.not)}</p>` : ''}
    <p style="margin-top:30px">Öğretmen: ____________________ &nbsp;&nbsp;&nbsp; Veli: ____________________</p>`);
}
function oneriSatirlari(o) {
  return konuAnalizi(o.id, [...analizSecim.sinavlar]).filter(k => k.durum.kod !== 'iyi').sort((a, b) => a.basari - b.basari || cmpTr(a.ders, b.ders));
}
function oneriExcel(o) {
  const sinavAdlari = S.sinavlar.filter(s => analizSecim.sinavlar.has(s.id)).map(s => s.ad).join(', ');
  const satirlar = oneriSatirlari(o).map(k => ({
    'Ders': k.ders, 'Konu': k.konu, 'Soru': k.toplam, 'Doğru': k.d, 'Yanlış': k.y, 'Boş': k.b, 'Başarı %': k.basari,
    'Durum': k.durum.ad, 'Ne yapmalı?': k.durum.oneri, 'Önerilen soru': k.durum.soru, 'Çözdüm': '',
  }));
  const ws = XLSX.utils.aoa_to_sheet([[`${adSoyad(o)} (${o.no}) – ${sinavAdlari}`], []]);
  XLSX.utils.sheet_add_json(ws, satirlar, { origin: 'A3' });
  ws['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 5 }, { wch: 9 }, { wch: 14 }, { wch: 44 }, { wch: 13 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Soru çözme listesi');
  excelIndir(wb, `Soru_Cozme_${dosyaAdi(adSoyad(o))}.xlsx`);
}
function oneriYazdir(o) {
  const l = oneriSatirlari(o);
  const sinavAdlari = S.sinavlar.filter(s => analizSecim.sinavlar.has(s.id)).map(s => `${s.ad} (${tarihTr(s.tarih)})`).join(', ');
  yazdir(`<h2>Hangi konudan soru çözmeliyim?</h2>
    <p><b>Öğrenci:</b> ${esc(adSoyad(o))} (${esc(o.no)}) · <b>Sınıf:</b> ${esc(sinifAdi(sinifBul(o.sinifId)))}<br><b>Sınav:</b> ${esc(sinavAdlari)}</p>
    <table><tr><th>Ders</th><th>Konu</th><th>Başarı</th><th>Ne yapmalı?</th><th>Soru</th><th>✓</th></tr>
    ${l.map(k => `<tr><td>${esc(k.ders)}</td><td><b>${esc(k.konu)}</b></td><td>%${k.basari}</td><td>${esc(k.durum.oneri)}</td><td>${k.durum.soru}</td><td><span class="kutu"></span></td></tr>`).join('')}
    <tr><td colspan="4"><b>Toplam</b></td><td><b>${l.reduce((t, k) => t + k.durum.soru, 0)}</b></td><td></td></tr></table>
    <p style="margin-top:30px">Öğretmen: ____________________ &nbsp;&nbsp;&nbsp; Veli: ____________________</p>`);
}
function kazanimListesiYazdir(o) {
  const { liste } = eksikKazanimlar(o.id, [...analizSecim.sinavlar]);
  const secili = liste.filter(e => analizSecim.kazanimlar.has(e.k.id));
  const sinavAdlari = S.sinavlar.filter(s => analizSecim.sinavlar.has(s.id)).map(s => `${s.ad} (${tarihTr(s.tarih)})`).join(', ');
  yazdir(`<h2>Eksik kazanımlar</h2>
    <p><b>Öğrenci:</b> ${esc(adSoyad(o))} (${esc(o.no)}) · <b>Sınıf:</b> ${esc(sinifAdi(sinifBul(o.sinifId)))}<br><b>Sınav:</b> ${esc(sinavAdlari)}</p>
    <table><tr><th>Ders</th><th>Kod</th><th>Kazanım</th><th>Yanlış</th><th>Boş</th><th>Sorular</th></tr>
    ${secili.map(e => `<tr><td>${esc(e.k.ders)}</td><td>${esc(e.k.kod)}</td><td>${esc(e.k.metin)}</td><td>${e.yanlis}</td><td>${e.bos}</td>
      <td>${e.sorular.map(q => esc(q.sinav) + ' #' + esc(q.no)).join(', ')}</td></tr>`).join('')}</table>`);
}

// ---------------------------------------------------------------------------
// SINIF KONU ANALİZİ
// ---------------------------------------------------------------------------
function sinifAnaliziHesapla() {
  const s = sinavBul(filtre.saSinav);
  if (!s) return null;
  const sonuc = S.sonuclar[s.id] || {};
  let ogr = Object.keys(sonuc).map(ogrenciBul).filter(Boolean);
  if (filtre.saSinif) ogr = ogr.filter(o => o.sinifId === filtre.saSinif);
  const konular = new Map();
  for (const o of ogr) {
    for (const k of konuAnalizi(o.id, [s.id])) {
      if (!konular.has(k.key)) konular.set(k.key, { key: k.key, ders: k.ders, konu: k.konu, soru: k.toplam, d: 0, n: 0, ogrenciler: [] });
      const e = konular.get(k.key);
      e.d += k.d; e.n += k.toplam;
      e.ogrenciler.push({ o, basari: k.basari, durum: k.durum });
    }
  }
  const liste = [...konular.values()].map(e => {
    const basari = Math.round(100 * e.d / Math.max(1, e.n));
    const eksik = e.ogrenciler.filter(x => x.durum.kod === 'eksik').sort((a, b) => a.basari - b.basari);
    const orta = e.ogrenciler.filter(x => x.durum.kod === 'orta').sort((a, b) => a.basari - b.basari);
    return { ...e, basari, durum: konuDurum(basari), eksik, orta };
  }).sort((a, b) => a.basari - b.basari || cmpTr(a.ders, b.ders));
  return { s, ogr, liste };
}
function cizSinifAnaliz() {
  const sinavlar = S.sinavlar.slice().sort((a, b) => cmpTr(b.tarih, a.tarih));
  if (!sinavBul(filtre.saSinav)) filtre.saSinav = sinavlar[0]?.id || '';
  $('#saSinav').innerHTML = sinavlar.map(s => opt(s.id, `${s.ad} (${tarihTr(s.tarih)})`, s.id === filtre.saSinav)).join('') || opt('', 'Sınav yok');
  const s = sinavBul(filtre.saSinav);
  const girenSiniflar = s ? [...new Set(Object.keys(S.sonuclar[s.id] || {}).map(id => ogrenciBul(id)?.sinifId).filter(Boolean))].map(sinifBul).filter(Boolean).sort(sinifSirala) : [];
  if (filtre.saSinif && !girenSiniflar.some(c => c.id === filtre.saSinif)) filtre.saSinif = '';
  $('#saSinif').innerHTML = opt('', 'Sınava giren tüm sınıflar') + girenSiniflar.map(c => opt(c.id, sinifAdi(c), c.id === filtre.saSinif)).join('');
  const sonuc = sinifAnaliziHesapla();
  if (!sonuc) { $('#sinifAnalizAlan').innerHTML = '<p class="muted">Önce bir sınav oluşturup sonuç girin.</p>'; return; }
  if (!sonuc.ogr.length) { $('#sinifAnalizAlan').innerHTML = '<p class="muted">Bu sınav için girilmiş sonuç yok.</p>'; return; }
  const { liste, ogr } = sonuc;
  const zayif = liste.filter(k => k.durum.kod !== 'iyi');
  $('#sinifAnalizAlan').innerHTML = `
  <div class="card">
    <h2>🔥 Sınıfın en zayıf konuları</h2>
    <p class="muted small">${ogr.length} öğrencinin sonucuna göre. Başarı = konudaki doğru sayısı / sorulan soru. Öğrenci adına dokunarak öğrencinin analizini açabilirsiniz.</p>
    ${zayif.length ? '' : '<p><span class="chip green">Sınıf bütün konularda başarılı</span></p>'}
    <div class="tablewrap"><table class="konu-tablo">
      <tr><th>Ders</th><th>Konu</th><th class="sag">Soru</th><th>Sınıf başarısı</th><th>Durum</th><th>Eksik öğrenciler</th></tr>
      ${liste.map(k => `<tr>
        <td>${esc(k.ders)}</td><td><b>${esc(k.konu)}</b></td><td class="sag">${k.soru}</td>
        <td style="min-width:120px">${basariCubugu(k.basari, k.durum.renk)}</td>
        <td><span class="chip ${k.durum.renk}">${k.durum.ad}</span></td>
        <td class="small">${k.eksik.length ? `<b>${k.eksik.length} eksik:</b> ` + k.eksik.map(x => `<a href="#" class="ogr-link" data-ogr-analiz="${x.o.id}">${esc(adSoyad(x.o))}</a> <span class="muted">%${x.basari}</span>`).join(', ') : '<span class="muted">—</span>'}
          ${k.orta.length ? `<div class="muted">Geliştirilmeli: ${k.orta.map(x => esc(adSoyad(x.o))).join(', ')}</div>` : ''}</td>
      </tr>`).join('')}
    </table></div>
    <div class="toolbar" style="margin-top:10px"><button class="btn" id="btnSinifExcel">Sınıf analizini Excel'e aktar</button></div>
  </div>`;
}
function sinifAnalizExcel() {
  const sonuc = sinifAnaliziHesapla();
  if (!sonuc) return;
  const { s, liste, ogr } = sonuc;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(liste.map(k => ({
    'Ders': k.ders, 'Konu': k.konu, 'Soru': k.soru, 'Sınıf başarısı %': k.basari, 'Durum': k.durum.ad,
    'Eksik öğrenci sayısı': k.eksik.length, 'Eksik öğrenciler': k.eksik.map(x => `${adSoyad(x.o)} (%${x.basari})`).join(', '),
    'Geliştirilmeli': k.orta.map(x => adSoyad(x.o)).join(', '),
  }))), 'Konular');
  // Öğrenci × konu başarı tablosu
  const tablo = ogr.map(o => {
    const satir = { 'No': o.no, 'Öğrenci': adSoyad(o) };
    const ka = new Map(konuAnalizi(o.id, [s.id]).map(k => [k.key, k.basari]));
    liste.forEach(k => { satir[`${k.ders} – ${k.konu}`] = ka.has(k.key) ? ka.get(k.key) : ''; });
    return satir;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tablo), 'Öğrenci x Konu %');
  const sinif = sinifBul(filtre.saSinif);
  excelIndir(wb, `Sinif_Konu_Analizi_${dosyaAdi(s.ad)}${sinif ? '_' + dosyaAdi(sinifAdi(sinif, true)) : ''}.xlsx`);
}

// ---------------------------------------------------------------------------
// AYARLAR / YEDEK
// ---------------------------------------------------------------------------
function kurumAyarCiz() {
  const kl = $('#kurumListe');
  if (!kl) return;
  kl.innerHTML = `<div class="tablewrap"><table><tr><th>Kurum</th><th>Tür</th><th>Seviyeler</th><th class="sag">Sınıf</th><th class="sag">Öğrenci</th><th></th></tr>
    ${KURUMLAR.map(k => {
      const sn = S.siniflar.filter(c => c.kurum === k.key && !c.ornek);
      const og = S.ogrenciler.filter(o => !o.ornek && sn.some(c => c.id === o.sinifId)).length;
      return `<tr><td><b>${esc(k.ad)}</b></td><td>${k.tip === 'kurs' ? 'Kurs' : 'Okul'}</td>
        <td class="small">${k.seviyeler.map(seviyeAdi).map(esc).join(', ') || '<span class="chip orange">seviye yok</span>'}</td>
        <td class="sag">${sn.length}</td><td class="sag">${og}</td>
        <td style="white-space:nowrap"><button type="button" class="btn small" data-kurum-duz="${k.key}">✏️ Düzenle</button>
          <button type="button" class="btn small danger" data-kurum-sil="${k.key}">🗑️ Sil</button></td></tr>`;
    }).join('')}</table></div>`;
  const sl = $('#seviyeListe');
  if (sl) sl.innerHTML = S.seviyeler.map(v => {
    const n = S.siniflar.filter(c => c.seviye === v).length;
    return `<span class="seviye-chip">${esc(seviyeAdi(v))}${n ? ` <span class="muted small">(${n} sınıf)</span>` : ''}<button type="button" class="sk-kapat" data-seviye-sil="${esc(v)}" aria-label="${esc(seviyeAdi(v))} seviyesini sil">×</button></span>`;
  }).join('');
}
/** Kurum ekle / düzenle penceresi. */
function kurumDialog(k) {
  const yeni = !k;
  const v = k || { ad: '', tip: 'okul', seviyeler: [] };
  dialogAc(yeni ? '🏫 Kurum ekle' : '🏫 Kurumu düzenle', `<div class="form-grid">
      <label>Kurum adı<input id="kAd" value="${esc(v.ad)}" placeholder="ör. Etüt Merkezi – Lise" maxlength="60"></label>
      <label>Türü<select id="kTip">${opt('okul', 'Okul', v.tip === 'okul')}${opt('kurs', 'Kurs / dershane', v.tip === 'kurs')}</select></label>
    </div>
    <p class="muted small" style="margin:12px 0 6px">Bu kurumda hangi sınıf seviyeleri var?</p>
    <div class="seviye-sec">${S.seviyeler.map(s => `<label class="cb"><input type="checkbox" value="${esc(s)}" ${v.seviyeler.includes(s) ? 'checked' : ''}> ${esc(seviyeAdi(s))}</label>`).join('')}</div>
    <p class="muted small">Listede olmayan bir seviye için önce Ayarlar → “Sınıf seviyeleri”nden ekle.</p>`, [
    { ad: 'Vazgeç' },
    { ad: yeni ? 'Ekle' : 'Kaydet', primary: true, tikla: () => {
      const ad = $('#kAd').value.trim().replace(/\s+/g, ' ');
      const tip = $('#kTip').value;
      const seviyeler = $$('.seviye-sec input:checked').map(x => x.value);
      if (!ad) { toast('Kurum adını yaz.'); return false; }
      if (KURUMLAR.some(x => x !== k && norm(x.ad) === norm(ad))) { toast('Bu adda bir kurum zaten var.'); return false; }
      if (!seviyeler.length) { toast('En az bir seviye seç.'); return false; }
      if (!yeni) {
        const kullanilan = [...new Set(S.siniflar.filter(c => c.kurum === k.key && !seviyeler.includes(c.seviye)).map(c => c.seviye))];
        if (kullanilan.length) { toast(`Bu kurumda ${kullanilan.map(seviyeAdi).join(', ')} sınıfları var; o seviyeleri kaldıramazsın.`, 4500); return false; }
        Object.assign(k, { ad, tip, seviyeler });
      } else {
        S.kurumlar.push({ key: `${tip}_${uid()}`, ad, tip, seviyeler });
      }
      kurumlariYukle(); kaydet(); ciz();
      toast(yeni ? `“${ad}” eklendi.` : `“${ad}” kaydedildi.`);
    } },
  ]);
}
function kurumSil(key) {
  const k = KURUM[key];
  if (!k) return;
  if (KURUMLAR.length <= 1) { toast('En az bir kurum kalmalı.'); return; }
  const sn = S.siniflar.filter(c => c.kurum === key);
  const ogr = S.ogrenciler.filter(o => sn.some(c => c.id === o.sinifId));
  const sinavlar = S.sinavlar.filter(x => x.kurum === key);
  const mesaj = `“${k.ad}” silinsin mi?` + (sn.length ? ` Bu kurumdaki ${sn.length} sınıf ve ${ogr.length} öğrenci (sınav sonuçları ve ödev planlarıyla) da silinir.` : '')
    + (sinavlar.length ? ` ${sinavlar.length} sınav başka bir kuruma taşınır.` : '');
  onayla(mesaj, () => {
    ogrencileriSil(ogr.map(o => o.id));
    S.siniflar = S.siniflar.filter(c => c.kurum !== key);
    S.kurumlar = S.kurumlar.filter(x => x.key !== key);
    kurumlariYukle();
    sinavlar.forEach(x => { x.kurum = (KURUMLAR.find(y => !x.seviye || y.seviyeler.includes(x.seviye)) || KURUMLAR[0]).key; if (!kurumAl(x.kurum).seviyeler.includes(x.seviye)) x.seviye = ''; });
    if (filtre.kurum === key) filtre.kurum = '';
    kaydet(); ciz(); toast('Kurum silindi.');
  });
}
function seviyeEkle() {
  const inp = $('#yeniSeviye');
  let v = inp.value.trim().replace(/\s+/g, ' ');
  if (/^\d+\.?\s*(sınıf|sinif)?$/i.test(v)) v = String(parseInt(v, 10));   // "4. Sınıf" → 4
  if (!v) { toast('Seviye adını yaz (ör. 4 ya da Hazırlık).'); return; }
  if (v.length > 20) { toast('Seviye adı en fazla 20 harf olabilir.'); return; }
  if (S.seviyeler.some(x => norm(x) === norm(v))) { toast('Bu seviye zaten var.'); return; }
  S.seviyeler.push(v); kurumlariYukle(); kaydet(); inp.value = ''; ciz();
  toast(`“${seviyeAdi(v)}” eklendi. Kullanmak için bir kurumu düzenleyip bu seviyeyi işaretle.`, 4500);
}
function seviyeSil(v) {
  const n = S.siniflar.filter(c => c.seviye === v).length;
  if (n) { toast(`${seviyeAdi(v)} seviyesinde ${n} sınıf var; önce o sınıfları sil ya da taşı.`, 4500); return; }
  const bosKalan = KURUMLAR.filter(k => k.seviyeler.length === 1 && k.seviyeler[0] === v);
  if (bosKalan.length) { toast(`“${bosKalan[0].ad}” kurumunun başka seviyesi yok; önce o kurumu düzenle ya da sil.`, 4500); return; }
  if (S.seviyeler.length <= 1) { toast('En az bir seviye kalmalı.'); return; }
  onayla(`“${seviyeAdi(v)}” seviyesi silinsin mi?`, () => {
    S.seviyeler = S.seviyeler.filter(x => x !== v);
    S.kurumlar.forEach(k => { k.seviyeler = k.seviyeler.filter(x => x !== v); });
    S.sinavlar.forEach(x => { if (x.seviye === v) x.seviye = ''; });
    if (filtre.seviye === v) filtre.seviye = '';
    kurumlariYukle(); kaydet(); ciz(); toast('Seviye silindi.');
  });
}
function cizAyar() {
  miniAyarCiz();
  kurumAyarCiz();
  $('#dersListesi').value = S.dersler.join(', ');
  $('#aEsikEksik').value = S.ayarlar.esikEksik;
  $('#aEsikIyi').value = S.ayarlar.esikIyi;
  $('#aSoruEksik').value = S.ayarlar.soruEksik;
  $('#aSoruOrta').value = S.ayarlar.soruOrta;
}
function tumExcel() {
  const wb = XLSX.utils.book_new();
  const ekle = (ad, veri) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(veri.length ? veri : [{}]), ad);
  ekle('Öğrenciler', S.ogrenciler.map(o => { const s = sinifBul(o.sinifId); return { 'Öğrenci No': o.no, 'Ad': o.ad, 'Soyad': o.soyad, 'Kurum': KURUM[s?.kurum]?.ad || '', 'Sınıf': s?.seviye || '', 'Şube': s?.sube || '' }; }));
  ekle('Kazanımlar', S.kazanimlar.map(k => ({ 'Kod': k.kod, 'Ders': k.ders, 'Sınıf': k.seviye, 'Ünite': k.unite, 'Konu': k.konu, 'Kazanım': k.metin })));
  ekle('Sınav Soruları', S.sinavlar.flatMap(s => s.sorular.map(q => ({ 'Sınav': s.ad, 'Tarih': s.tarih, 'Soru No': q.no, 'Ders': q.ders, 'Kazanım Kodu': kazanimBul(q.kazanimId)?.kod || '', 'Kazanım': kazanimBul(q.kazanimId)?.metin || '', 'Cevap': q.cevap }))));
  ekle('Yanlış-Boş', S.sinavlar.flatMap(s => Object.entries(S.sonuclar[s.id] || {}).flatMap(([oid, r]) => {
    const o = ogrenciBul(oid);
    return Object.entries(r).map(([no, d]) => { const q = s.sorular.find(x => String(x.no) === no); const k = kazanimBul(q?.kazanimId); return { 'Sınav': s.ad, 'Öğrenci No': o?.no, 'Öğrenci': o ? adSoyad(o) : '', 'Soru': no, 'Durum': d === 'Y' ? 'Yanlış' : 'Boş', 'Ders': q?.ders || '', 'Kazanım Kodu': k?.kod || '', 'Kazanım': k?.metin || '' }; });
  })));
  excelIndir(wb, `Kazanim_Takip_${bugun()}.xlsx`);
}

// ---------------------------------------------------------------------------
// Olaylar
// ---------------------------------------------------------------------------
function olaylar() {
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (b) sekmeAc(b.dataset.tab); });

  // Öğrenciler
  $('#ogrFolder').addEventListener('change', e => { ogrenciIceAktar(e.target.files, true); e.target.value = ''; });
  $('#ogrFiles').addEventListener('change', e => { ogrenciIceAktar(e.target.files, false); e.target.value = ''; });
  $('#btnYeniSinif').onclick = () => sinifDialog(null);
  $('#btnYeniOgrenci').onclick = () => ogrenciDialog(null);
  $('#fKurum').onchange = e => { filtre.kurum = e.target.value; filtre.sinif = ''; cizOgrenci(); };
  $('#fSeviye').onchange = e => { filtre.seviye = e.target.value; filtre.sinif = ''; cizOgrenci(); };
  $('#fSinif').onchange = e => { filtre.sinif = e.target.value; cizOgrenci(); };
  $('#fAra').oninput = e => { filtre.ara = e.target.value; cizOgrenci(); $('#fAra').focus(); };
  $('#tab-ogrenci').addEventListener('click', e => {
    const duz = e.target.closest('[data-sinif-duz]');
    if (duz) { e.stopPropagation(); sinifDialog(sinifBul(duz.dataset.sinifDuz)); return; }
    const sn = e.target.closest('[data-sinif]');
    if (sn) { filtre.sinif = filtre.sinif === sn.dataset.sinif ? '' : sn.dataset.sinif; cizOgrenci(); return; }
    const od = e.target.closest('[data-ogr-duz]');
    if (od) { ogrenciDialog(ogrenciBul(od.dataset.ogrDuz)); }
  });
  document.addEventListener('click', e => {
    const an = e.target.closest('[data-ogr-analiz]');
    if (!an) return;
    e.preventDefault();
    const o = ogrenciBul(an.dataset.ogrAnaliz);
    filtre.anSinif = o.sinifId; filtre.anOgrenci = o.id;
    const sinavId = aktifSekme === 'sonuc' ? filtre.snSinav : aktifSekme === 'sinifanaliz' ? filtre.saSinav : '';
    if (sinavId) Object.assign(analizSecim, { ogrId: o.id, sinavlar: new Set([sinavId]), kazanimlar: null, konular: null });
    sekmeAc('analiz');
  });

  // Dosya seçimi: destekleyen tarayıcılarda dosya yolu hatırlanır
  const seciciBagla = (inputId, klasor, fn) => {
    $(inputId).addEventListener('click', e => {
      const destek = klasor ? klasorTaniticiDestek() : taniticiDestek();
      if (!destek || seciciBagla.kapali) return; // tarayıcının kendi penceresi açılır
      e.preventDefault();
      (klasor ? klasorSecTanitici() : dosyaSecTanitici(true)).then(g => fn(g)).catch(err => {
        if (err && err.name === 'AbortError') return;
        console.warn(err);
        seciciBagla.kapali = true;
        toast('Bu tarayıcıda dosya yolu hatırlanamıyor. Lütfen düğmeye tekrar basın.', 4000);
      });
    });
  };
  seciciBagla('#ogrFiles', false, g => ogrenciIceAktar(g, false));
  seciciBagla('#ogrFolder', true, g => ogrenciIceAktar(g, true));
  seciciBagla('#kzFiles', false, g => kazanimIceAktar(g, false));
  seciciBagla('#panelOgrFiles', false, g => ogrenciIceAktar(g, false));
  seciciBagla('#panelKzFiles', false, g => kazanimIceAktar(g, false));
  seciciBagla('#kzFolder', true, g => kazanimIceAktar(g, true));
  document.addEventListener('click', e => {
    const orn = e.target.closest('[data-ornek]');
    if (orn) { ornekExcelIndir(orn.dataset.ornek); return; }
    const g = e.target.closest('[data-kaynak-guncelle]');
    if (g) { tekIslem(kaynakGuncelle)(g.dataset.kaynakGuncelle); return; }
    const sl = e.target.closest('[data-kaynak-sil]');
    if (sl) { kaynakSilDialog(sl.dataset.kaynakSil); return; }
    const t = e.target.closest('[data-kaynak-tumu]');
    if (t) tumunuGuncelle(t.dataset.kaynakTumu);
  });

  // Sürükle-bırak ile Excel aktarma
  const birak = (bolum, fn) => {
    const el = $(bolum);
    let sayac = 0;
    el.addEventListener('dragenter', e => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); sayac++; el.classList.add('surukle'); } });
    el.addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
    el.addEventListener('dragleave', () => { if (--sayac <= 0) { sayac = 0; el.classList.remove('surukle'); } });
    el.addEventListener('drop', e => {
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault(); sayac = 0; el.classList.remove('surukle');
      fn(e.dataTransfer.files);
    });
  };
  birak('#tab-ogrenci', f => ogrenciIceAktar(f, false));
  birak('#tab-kazanim', f => kazanimIceAktar(f, false));
  birak('#tab-sonuc', f => sonucIceAktar(f));
  birak('#tab-sinav', f => { const s = sinavBul(filtre.seciliSinav); if (s) anahtarIceAktar(s, f[0]); else toast('Önce soldan bir sınav seçin.'); });
  // Telefonlarda klasör seçme desteklenmez; o durumda klasör düğmesini gizle
  const klasorDestek = 'webkitdirectory' in document.createElement('input') && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!klasorDestek) ['#ogrFolder', '#kzFolder'].forEach(id => { $(id).closest('label').hidden = true; });

  // Kazanımlar
  $('#kzFolder').addEventListener('change', e => { kazanimIceAktar(e.target.files, true); e.target.value = ''; });
  $('#kzFiles').addEventListener('change', e => { kazanimIceAktar(e.target.files, false); e.target.value = ''; });
  $('#panelOgrFiles').addEventListener('change', e => { ogrenciIceAktar(e.target.files, false); e.target.value = ''; });
  $('#panelKzFiles').addEventListener('change', e => { kazanimIceAktar(e.target.files, false); e.target.value = ''; });
  $('#tab-panel').addEventListener('click', e => { const g = e.target.closest('[data-git]'); if (g) sekmeAc(g.dataset.git); });
  $('#btnYeniKazanim').onclick = () => kazanimDialog(null);
  $('#btnKzSil').onclick = () => onayla('Tüm kazanımlar silinsin mi? Sınavlardaki kazanım eşleştirmeleri de boşalır.', () => {
    S.kazanimlar = []; S.sinavlar.forEach(s => s.sorular.forEach(q => { q.kazanimId = ''; })); kaydet(); ciz();
  });
  $('#kzDers').onchange = e => { filtre.kzDers = e.target.value; cizKazanim(); };
  $('#kzSeviye').onchange = e => { filtre.kzSeviye = e.target.value; cizKazanim(); };
  $('#kzAra').oninput = e => { filtre.kzAra = e.target.value; cizKazanim(); };
  $('#kzTablo').addEventListener('click', e => { const b = e.target.closest('[data-kz-duz]'); if (b) kazanimDialog(kazanimBul(b.dataset.kzDuz)); });

  // Sınavlar
  $('#btnYeniSinav').onclick = yeniSinav;
  $('#sinavListe').addEventListener('click', e => { const b = e.target.closest('[data-sinav]'); if (b) { filtre.seciliSinav = b.dataset.sinav; cizSinav(); } });
  $('#sinavDetay').addEventListener('change', e => {
    const s = sinavBul(filtre.seciliSinav);
    if (!s) return;
    const t = e.target;
    if (t.id === 'sAd') s.ad = t.value.trim() || 'Sınav';
    else if (t.id === 'sTarih') s.tarih = t.value;
    else if (t.id === 'sKurum') { s.kurum = t.value; if (!kurumAl(s.kurum).seviyeler.includes(s.seviye)) s.seviye = ''; }
    else if (t.id === 'sSeviye') s.seviye = t.value;
    else if (t.id === 'anahtarDosya') { const f = t.files[0]; t.value = ''; if (f) anahtarIceAktar(s, f); return; }
    else if (t.dataset.q !== undefined) {
      const q = s.sorular[+t.dataset.q];
      const f = t.dataset.f;
      if (f === 'kazanim') {
        const v = t.value.trim();
        if (!v) q.kazanimId = '';
        else {
          const k = sinavKazanimlari(s).find(k => kazanimEtiket(k) === v) || kazanimBulKodVeyaMetin(v, q.ders, s.ornek);
          if (k) { q.kazanimId = k.id; if (!q.ders) q.ders = k.ders; t.value = kazanimEtiket(k); }
          else { toast('Kazanım bulunamadı. Listeden seçin veya önce kazanımı ekleyin.'); t.value = q.kazanimId ? kazanimEtiket(kazanimBul(q.kazanimId)) : ''; }
        }
      } else if (f === 'no') {
        const eski = String(q.no), yeni = t.value.trim();
        if (yeni && eski !== yeni) {
          if (s.sorular.some(x => x !== q && String(x.no) === yeni)) { toast('Bu numarada soru zaten var.'); t.value = eski; return; }
          q.no = yeni;
          Object.values(S.sonuclar[s.id] || {}).forEach(r => { if (r[eski]) { r[yeni] = r[eski]; delete r[eski]; } });
        }
      } else if (f === 'cevap') q.cevap = trUpper(t.value.trim());
      else q[f] = t.value.trim();
      kaydet();
      if (f === 'kazanim') { const atanmamis = s.sorular.filter(x => !x.kazanimId).length; if (!atanmamis) cizSinav(); }
      return;
    }
    kaydet(); cizSinav();
  });
  $('#sinavDetay').addEventListener('click', e => {
    const s = sinavBul(filtre.seciliSinav);
    if (!s) return;
    if (e.target.id === 'btnSoruEkle') {
      const son = s.sorular[s.sorular.length - 1];
      s.sorular.push({ no: String((parseInt(son?.no, 10) || 0) + 1), ders: son?.ders || '', kazanimId: '', cevap: '' });
      kaydet(); cizSinav();
    } else if (e.target.id === 'btnTopluSoru') topluSoruDialog(s);
    else if (e.target.id === 'btnTopluKonu') topluKonuDialog(s);
    else if (e.target.id === 'btnSinavSil') onayla(`“${s.ad}” ve girilmiş tüm sonuçları silinsin mi?`, () => {
      S.sinavlar = S.sinavlar.filter(x => x.id !== s.id); delete S.sonuclar[s.id]; filtre.seciliSinav = null; kaydet(); ciz();
    });
    else if (e.target.dataset.qSil !== undefined) {
      const q = s.sorular[+e.target.dataset.qSil];
      s.sorular.splice(+e.target.dataset.qSil, 1);
      Object.values(S.sonuclar[s.id] || {}).forEach(r => delete r[q.no]);
      kaydet(); cizSinav();
    }
  });

  // Sonuç girişi
  $('#snSinav').onchange = e => { filtre.snSinav = e.target.value; cizSonuc(); };
  $('#snSinif').onchange = e => { filtre.snSinif = e.target.value; cizSonuc(); };
  $('#snFiles').addEventListener('change', e => { sonucIceAktar(e.target.files); e.target.value = ''; });
  $('#sonucAlan').addEventListener('change', e => { if (e.target.dataset.hizli) hizliGiris(e.target); });
  $('#sonucAlan').addEventListener('click', e => {
    const q = e.target.closest('[data-qno]');
    if (q) { soruDurumDegistir(q.closest('[data-ogr]').dataset.ogr, q.dataset.qno, q); return; }
    const sil = e.target.closest('[data-sonuc-sil]');
    if (sil) {
      const s = sinavBul(filtre.snSinav);
      if (S.sonuclar[s.id]) delete S.sonuclar[s.id][sil.dataset.sonucSil];
      kaydet(); cizSonuc();
    }
  });

  // Analiz
  $('#anSinif').onchange = e => { filtre.anSinif = e.target.value; filtre.anOgrenci = ''; cizAnaliz(); };
  $('#anOgrenci').onchange = e => { filtre.anOgrenci = e.target.value; cizAnaliz(); };
  $('#analizAlan').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.anSinav) {
      t.checked ? analizSecim.sinavlar.add(t.dataset.anSinav) : analizSecim.sinavlar.delete(t.dataset.anSinav);
      analizSecim.kazanimlar = null; analizSecim.konular = null; cizAnaliz();
    } else if (t.dataset.anKonu) {
      t.checked ? analizSecim.konular.add(t.dataset.anKonu) : analizSecim.konular.delete(t.dataset.anKonu);
    } else if (t.dataset.anKz) {
      t.checked ? analizSecim.kazanimlar.add(t.dataset.anKz) : analizSecim.kazanimlar.delete(t.dataset.anKz);
    }
  });
  $('#analizAlan').addEventListener('click', e => {
    const o = ogrenciBul(filtre.anOgrenci);
    if (e.target.id === 'kzHepsi') { analizSecim.kazanimlar = null; cizAnaliz(); }
    else if (e.target.id === 'kzHicbiri') { analizSecim.kazanimlar = new Set(); cizAnaliz(); }
    else if (e.target.id === 'btnPlanHazirla') kazanimPlanDialog(o);
    else if (e.target.id === 'btnKonuPlan') konuPlanDialog(o);
    else if (e.target.id === 'btnOneriExcel') oneriExcel(o);
    else if (e.target.id === 'btnOneriYazdir') oneriYazdir(o);
    else if (e.target.id === 'btnKzListeYazdir') kazanimListesiYazdir(o);
    else { const p = e.target.closest('[data-plan]'); if (p) planGoster(p.dataset.plan); }
  });
  $('#dlgIcerik').addEventListener('change', e => {
    const g = e.target.dataset.gorev;
    if (!g) return;
    for (const p of S.planlar) { const x = p.gorevler.find(y => y.id === g); if (x) { x.tamam = e.target.checked; kaydet(); break; } }
  });
  $('#dlg').addEventListener('close', () => { if (aktifSekme === 'analiz') cizAnaliz(); });

  // Panel
  $('#panelOrnek').addEventListener('click', e => {
    if (e.target.id === 'btnOrnekYukle') ornekVeriYukle();
    else if (e.target.id === 'btnOrnekSil') onayla('Örnek veriler kaldırılsın mı? Senin yüklediğin veriler silinmez.', () => ornekVeriSil());
  });

  // Ayarlar
  $('#btnYedekAl').onclick = () => indir(new Blob([JSON.stringify(S)], { type: 'application/json' }), `kazanim_takip_yedek_${bugun()}.json`);
  $('#yedekDosya').addEventListener('change', async e => {
    if (islemSuruyor) { toast('Önceki işlem bitmeden yenisi başlatılamaz, birkaç saniye bekle 🐾', 3000); e.target.value = ''; return; }
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const v = JSON.parse(await f.text());
      if (!v || !Array.isArray(v.ogrenciler) || !Array.isArray(v.kazanimlar)) throw new Error('biçim');
      onayla('Mevcut tüm veriler yedektekiyle değiştirilsin mi?', () => { S = { ...bosDurum(), ...v }; S.ayarlar = { ...VARSAYILAN_AYARLAR, ...(v.ayarlar || {}) }; kurumlariYukle(); kaydet(); ciz(); toast('Yedek geri yüklendi.'); });
    } catch (err) { toast('Yedek dosyası okunamadı.'); }
  });
  $('#btnTumExcel').onclick = tumExcel;
  $('#btnAyarKaydet').onclick = () => {
    const sayi = (id, v) => { const n = parseInt($(id).value, 10); return Number.isFinite(n) ? n : v; };
    const a = { esikEksik: sayi('#aEsikEksik', 50), esikIyi: sayi('#aEsikIyi', 80), soruEksik: sayi('#aSoruEksik', 40), soruOrta: sayi('#aSoruOrta', 20) };
    if (a.esikEksik >= a.esikIyi) { toast('“Eksik” sınırı “İyi” sınırından küçük olmalı.'); return; }
    S.ayarlar = { ...S.ayarlar, ...a }; kaydet(); toast('Ayarlar kaydedildi.');
  };
  // Sınıf konu analizi
  $('#saSinav').onchange = e => { filtre.saSinav = e.target.value; cizSinifAnaliz(); };
  $('#saSinif').onchange = e => { filtre.saSinif = e.target.value; cizSinifAnaliz(); };
  $('#sinifAnalizAlan').addEventListener('click', e => { if (e.target.id === 'btnSinifExcel') sinifAnalizExcel(); });
  $('#btnDersKaydet').onclick = () => {
    S.dersler = [...new Set($('#dersListesi').value.split(',').map(x => x.trim()).filter(Boolean))];
    kaydet(); toast('Ders listesi kaydedildi.');
  };
  $('#btnKurumEkle').onclick = () => kurumDialog(null);
  $('#btnSeviyeEkle').onclick = seviyeEkle;
  $('#yeniSeviye').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); seviyeEkle(); } });
  document.addEventListener('click', e => {
    const d = e.target.closest('[data-kurum-duz]'); if (d) { kurumDialog(KURUM[d.dataset.kurumDuz]); return; }
    const sl = e.target.closest('[data-kurum-sil]'); if (sl) { kurumSil(sl.dataset.kurumSil); return; }
    const sv = e.target.closest('[data-seviye-sil]'); if (sv) { seviyeSil(sv.dataset.seviyeSil); return; }
    if (e.target.closest('[data-kurum-duzenle]')) { sekmeAc('ayar'); setTimeout(() => $('#kurumKart').scrollIntoView({ block: 'start', behavior: azHareket() ? 'auto' : 'smooth' }), 50); }
  });
  $('#btnFabrika').onclick = () => onayla('Program ilk indirildiği hâline dönsün mü? Tüm öğrenciler, kazanımlar, sınavlar, sonuçlar, ödev planları, yüklenen liste kayıtları ve ayarlar silinir. Önce yedek almanı öneririm.', async () => {
    miniDurdur();
    S = bosDurum(); kurumlariYukle();
    try { localStorage.removeItem(DB_NAME); } catch (e) { /* yok say */ }
    try { await idbIslem('readwrite', st => st.clear()); } catch (e) { /* yok say */ }
    await kaydetHemen();
    toast('Fabrika ayarlarına dönüldü.');
    setTimeout(() => location.reload(), 700);
  });
  $('#btnHepsiniSil').onclick = () => onayla('TÜM veriler (öğrenciler, kazanımlar, sınavlar, sonuçlar, planlar) silinsin mi? Önce yedek almanız önerilir.', () => {
    S = bosDurum(); kurumlariYukle(); kaydet(); ciz(); toast('Tüm veriler silindi.');
  });
}

// ---------------------------------------------------------------------------
// Başlat
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ÖĞRETİCİ: Üzüm koşarak gelir, patisiyle gösterir, manga bulutunda anlatır
// ---------------------------------------------------------------------------
// Yandan görünen, koşabilen Üzüm (sağa bakıyor). viewBox 150×112.
// Gri-mavi British Shorthair; boynunda mor tasma ve üzüm salkımı. Pati ucu: sağa (127, 68), yukarı (140, 44); yüzün yanından uzanır. Uzarken yalnız kol uzar, pati şeklini korur.
const UZUM_KOSAN = `<svg viewBox="0 0 150 112" width="150" height="112" aria-hidden="true">
  <defs><radialGradient id="uk-govde" cx="45%" cy="30%" r="70%"><stop offset="0" stop-color="#b9c1cf"/><stop offset=".6" stop-color="#99a3b5"/><stop offset="1" stop-color="#7b8598"/></radialGradient>
<radialGradient id="uk-kafa" cx="55%" cy="35%" r="62%"><stop offset="0" stop-color="#bec6d3"/><stop offset=".6" stop-color="#9ca6b8"/><stop offset="1" stop-color="#7d8799"/></radialGradient>
<linearGradient id="uk-bacak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d97a9"/><stop offset=".5" stop-color="#a3adbe"/><stop offset="1" stop-color="#8b95a7"/></linearGradient>
<linearGradient id="uk-bacak-arka" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#778193"/><stop offset="1" stop-color="#848ea0"/></linearGradient>
<linearGradient id="uk-kuyruk" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8b95a8"/><stop offset="1" stop-color="#9ea8ba"/></linearGradient>
<radialGradient id="uk-goz" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#ffd47a"/><stop offset=".55" stop-color="#f29a2e"/><stop offset="1" stop-color="#b8601a"/></radialGradient></defs>
  <path class="kuyruk" d="M31 63 C 15 61, 7 49, 11 33 C 12.5 27, 18.5 26, 19.5 32 C 17.5 43, 21 52, 33 56 Z" fill="url(#uk-kuyruk)"/>
<g class="bacak ar1"><path d="M31.5 76 A6.75 5.5 0 0 1 45 76 C45.4 86, 44.5 91, 44 98 L33 98 C32.5 91, 31.1 86, 31.5 76 Z" fill="url(#uk-bacak-arka)"/><path d="M32 100 C32 95.4, 47.2 95.2, 47.2 100.4 C47.2 104.6, 32 104.6, 32 100 Z" fill="url(#uk-bacak-arka)"/><g fill="#e2b9c4"><ellipse cx="35.8" cy="102.2" rx="1.4" ry=".9"/><ellipse cx="39.6" cy="102.7" rx="1.5" ry=".9"/><ellipse cx="43.4" cy="102.2" rx="1.4" ry=".9"/></g></g>
<g class="bacak on1"><path d="M83.5 76 A6.75 5.5 0 0 1 97 76 C97.4 86, 96.5 91, 96 98 L85 98 C84.5 91, 83.1 86, 83.5 76 Z" fill="url(#uk-bacak-arka)"/><path d="M84 100 C84 95.4, 99.2 95.2, 99.2 100.4 C99.2 104.6, 84 104.6, 84 100 Z" fill="url(#uk-bacak-arka)"/><g fill="#e2b9c4"><ellipse cx="87.8" cy="102.2" rx="1.4" ry=".9"/><ellipse cx="91.6" cy="102.7" rx="1.5" ry=".9"/><ellipse cx="95.4" cy="102.2" rx="1.4" ry=".9"/></g></g>
<g class="bacak ar2"><path d="M43.5 76 A6.75 5.5 0 0 1 57 76 C57.4 86, 56.5 91, 56 98 L45 98 C44.5 91, 43.1 86, 43.5 76 Z" fill="url(#uk-bacak)"/><path d="M44 100 C44 95.4, 59.2 95.2, 59.2 100.4 C59.2 104.6, 44 104.6, 44 100 Z" fill="url(#uk-bacak)"/><g fill="#e2b9c4"><ellipse cx="47.8" cy="102.2" rx="1.4" ry=".9"/><ellipse cx="51.6" cy="102.7" rx="1.5" ry=".9"/><ellipse cx="55.4" cy="102.2" rx="1.4" ry=".9"/></g></g>
<g class="bacak on2"><path class="kol" d="M93.5 76 A6.75 5.5 0 0 1 107 76 C107.4 86, 106.5 91, 106 98 L95 98 C94.5 91, 93.1 86, 93.5 76 Z" fill="url(#uk-bacak)"/><g class="pati-g"><path class="pati-yan" d="M94 100 C94 95.4, 109.2 95.2, 109.2 100.4 C109.2 104.6, 94 104.6, 94 100 Z" fill="url(#uk-bacak)"/><g class="pati-yan" fill="#e2b9c4"><ellipse cx="97.8" cy="102.2" rx="1.4" ry=".9"/><ellipse cx="101.6" cy="102.7" rx="1.5" ry=".9"/><ellipse cx="105.4" cy="102.2" rx="1.4" ry=".9"/></g><g class="pati-iz"><ellipse cx="101.5" cy="102.2" rx="7.8" ry="7" fill="url(#uk-bacak)"/><path d="M98.3 100.8 C98.3 98.4, 104.7 98.4, 104.7 100.8 C104.7 103.2, 103 103.4, 101.5 102.7 C100 103.4, 98.3 103.2, 98.3 100.8 Z" fill="#e2b9c4" stroke="#d59fb0" stroke-width=".4"/><g fill="#e2b9c4" stroke="#d59fb0" stroke-width=".4"><ellipse cx="96.4" cy="104.6" rx="1.4" ry="1.7"/><ellipse cx="99.7" cy="106.2" rx="1.4" ry="1.7"/><ellipse cx="103.3" cy="106.2" rx="1.4" ry="1.7"/><ellipse cx="106.6" cy="104.6" rx="1.4" ry="1.7"/></g></g></g></g>
<g class="govde">
  <ellipse cx="66" cy="66" rx="41" ry="21" fill="url(#uk-govde)"/>
  <g class="kafa">
    <path d="M82 32 C 79 21, 80 12.5, 84 11 C 88 10, 94 15, 97 20 Z" fill="#8f99ac"/>
    <path d="M126 32 C 129 21, 128 12.5, 124 11 C 120 10, 114 15, 111 20 Z" fill="#8f99ac"/>
    <path d="M85 27 C 84 20, 84.6 15.4, 86.4 14.8 C 88.4 14.4, 91.6 17.4, 93.6 20.6 Z" fill="#e2b9c4"/>
    <path d="M123 27 C 124 20, 123.4 15.4, 121.6 14.8 C 119.6 14.4, 116.4 17.4, 114.4 20.6 Z" fill="#e2b9c4"/>
    <ellipse cx="104" cy="40" rx="24.5" ry="21.5" fill="url(#uk-kafa)"/>
    <ellipse cx="104" cy="50.5" rx="7.6" ry="5" fill="#c9cfda"/>
    <circle cx="95" cy="38.5" r="6.2" fill="#4b3c32"/><circle cx="113" cy="38.5" r="6.2" fill="#4b3c32"/>
    <circle cx="95" cy="38.5" r="5.5" fill="url(#uk-goz)"/><circle cx="113" cy="38.5" r="5.5" fill="url(#uk-goz)"/>
    <ellipse cx="95.3" cy="39" rx="2.8" ry="4.1" fill="#1e1a1b"/><ellipse class="goz" cx="113.3" cy="39" rx="2.8" ry="4.1" fill="#1e1a1b"/>
    <circle cx="93.4" cy="36.4" r="1.7" fill="#fff"/><circle cx="111.4" cy="36.4" r="1.7" fill="#fff"/>
    <circle cx="97" cy="41.4" r=".7" fill="#fff"/><circle cx="115" cy="41.4" r=".7" fill="#fff"/>
    <ellipse cx="84" cy="46" rx="2.2" ry="3.4" fill="#f2a9be" opacity=".55"/><ellipse cx="124" cy="46" rx="2.2" ry="3.4" fill="#f2a9be" opacity=".55"/>
    <path d="M101.6 46.4 Q104 45.4 106.4 46.4 Q105.4 48.5 104 48.9 Q102.6 48.5 101.6 46.4 Z" fill="#6c7487"/>
    <path d="M104 48.9 v1.3 M104 50.2 q-1.5 1.7 -3.2 .6 M104 50.2 q1.5 1.7 3.2 .6" stroke="#5a6174" stroke-width="1" fill="none" stroke-linecap="round"/>
    <g stroke="#f4f6fa" stroke-width=".6" stroke-linecap="round" fill="none" opacity=".95">
      <path d="M97.5 49 Q88 47.4 78 47.8"/><path d="M97.5 50.6 Q88 50.6 78.5 52.6"/><path d="M98 52 Q90 53.6 81 57.4"/>
      <path d="M110.5 49 Q120 47.4 130 47.8"/><path d="M110.5 50.6 Q120 50.6 129.5 52.6"/><path d="M110 52 Q118 53.6 127 57.4"/>
    </g>
    <path d="M88 58.5 Q104 65.5 120 58.5" stroke="#7c5ce6" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="102.4" cy="64.6" r="1.8" fill="#8e5bd6"/><circle cx="105.6" cy="64.6" r="1.8" fill="#8e5bd6"/><circle cx="104" cy="67.2" r="1.8" fill="#7a46c2"/>
    <path d="M104 62.8 q.8 -1.6 2.2 -1.6" stroke="#4f9a4a" stroke-width=".9" fill="none" stroke-linecap="round"/>
  </g>
</g>
</svg>`;
const KEDI_W = 150, KEDI_H = 112;
const PATI_SAG = { x: 127, y: 68, aci: 100 };  // sağa (hafif yukarı) işaret
const PATI_UST = { x: 140, y: 44, aci: 125, uzat: 1.9 };  // yukarı işaret (manga gibi uzayan pati)
const BAS_X = 104, BAS_Y = 19;                 // bulutun bağlandığı kafa tepesi

// Öğretici adımları. hedef: CSS seçici; sekme: önce açılacak sekme; tikla: kullanıcı hedefe tıklayınca otomatik geç.
const OGRETICI_ADIMLAR = [
  { metin: 'Merhaba! Ben Üzüm 🐾 Bu programı birlikte öğreneceğiz. Hazırsan “Devam”a bas, ben de koşa koşa göstereyim!' },
  { metin: 'Bu program ne işe yarar? 📚 Öğrencilerinin deneme sınavı sonuçlarına bakar ve her birinin hangi konularda eksiği olduğunu bulur. Sonra her öğrenciye hangi konudan kaç soru çözmesi gerektiğini söyler; istersen ödev ve çalışma planı da hazırlar. Sınıfın genelinde en zayıf konuları da gösterir. Amacımız: her öğrenci doğru konuya, doğru miktarda çalışsın! 🐾' },
  { sekme: 'panel', hedef: '[data-tab=panel]', metin: 'Burası Ana Sayfa. Ne yapacağını unutursan buraya gel; 4 adımın hepsi burada yazıyor.' },
  { sekme: 'panel', hedef: '#tab-panel .adim:nth-child(1) [data-ornek]', metin: 'Her adımın bir “Örnek Excel”i var. Örneği indirip kendine göre doldurursun, sonra doldurduğun Excel’i yüklersin. Gel, her sayfada nerede olduklarını göstereyim!' },
  { hedef: '[data-tab=ogrenci]', tikla: true, metin: 'Şimdi “Öğrenciler”e tıkla.' },
  { sekme: 'ogrenci', hedef: '#tab-ogrenci [data-ornek=ogrenci]', metin: 'Buradan örnek öğrenci Excel’ini indirebilirsin 📄 Örnek öğrencileri silip kendi öğrencilerini aynı sütunlara yaz ve kaydet.' },
  { sekme: 'ogrenci', hedef: '#tab-ogrenci .toolbar label.btn.primary', metin: 'Sonra doldurduğun Excel’i buradan yükleyebilirsin 📥 Her şey yolundaysa yeşil ✓, bir sorun varsa kırmızı ✕ çıkar. Sınıf yoksa ben oluştururum!' },
  { hedef: '[data-tab=kazanim]', tikla: true, metin: '“Kazanımlar”a tıkla.' },
  { sekme: 'kazanim', hedef: '#tab-kazanim [data-ornek=kazanim]', metin: 'Buradan örnek kazanım Excel’ini indirebilirsin 📄 Kazanımlarını bu örnekteki sütunlara yazarak doldurabilirsin.' },
  { sekme: 'kazanim', hedef: '#tab-kazanim .toolbar label.btn.primary', metin: 'Doldurduğun Excel’i ya da K12’den aldığın kazanım listesini buradan yükleyebilirsin 📥' },
  { hedef: '[data-tab=sinav]', tikla: true, metin: '“Sınavlar”a tıkla.' },
  { sekme: 'sinav', hedef: '#tab-sinav [data-ornek=anahtar]', metin: 'Buradan örnek cevap anahtarı Excel’ini indirebilirsin 📄 Her soru için soru numarasını, dersini, konusunu ve doğru cevabı yazarak doldur.' },
  { sekme: 'sinav', hedef: '#btnYeniSinav', metin: 'Sonra buradan yeni sınav oluştur ve doldurduğun cevap anahtarı Excel’ini yükle 📥 Her sorunun konusu yazılı olsun ki eksik konuları bulabileyim.' },
  { hedef: '[data-tab=sonuc]', tikla: true, metin: '“Sonuç Girişi”ne tıkla.' },
  { sekme: 'sonuc', hedef: '#tab-sonuc [data-ornek=sonuc]', metin: 'Buradan örnek sonuç Excel’ini indirebilirsin 📄 Her öğrencinin her soruda işaretlediği şıkkı yazarak doldur.' },
  { sekme: 'sonuc', hedef: '#tab-sonuc label.btn.primary', metin: 'Doldurduğun sonuç Excel’ini buradan yükleyebilirsin 📥 İstersen öğrencinin yanlış yaptığı soru numaralarını da yazabilirsin: 3 7 12 gibi.' },
  { hedef: '[data-tab=analiz]', tikla: true, metin: 'Şimdi en güzel kısım! “Öğrenci Analizi”ne tıkla.' },
  { sekme: 'analiz', hedef: '#anOgrenci', metin: 'Buradan öğrenciyi seç. Hangi konuda eksiği olduğunu ve hangi konudan kaç soru çözmesi gerektiğini aşağıda görürsün. İstersen ödev planı da hazırlarım.' },
  { hedef: '[data-tab=sinifanaliz]', tikla: true, metin: 'Sınıfın geneline bakmak için “Sınıf Analizi”ne tıkla.' },
  { sekme: 'sinifanaliz', hedef: '#saSinav', metin: 'Sınavı seç: sınıfın en zayıf konularını ve o konuda eksik olan öğrencileri gösteririm.' },
  { hedef: '[data-tab=ayar]', tikla: true, metin: 'Son olarak “Ayarlar”a tıkla.' },
  { sekme: 'ayar', hedef: '#btnYedekAl', metin: 'Arada bir buradan yedek almayı unutma! 💾 Bilgiler bu bilgisayarda saklanıyor.' },
  { sekme: 'panel', metin: 'Hepsi bu kadar! 🎉 Takılırsan yukarıdaki kediye ya da ana sayfadaki düğmeye bas, yine gelirim. Miyav! 🐾', son: true },
];

const ogretici = { aktif: false, adim: 0, kedi: null, balon: null, vurgu: null, noktalar: [], x: -200, y: 200, yon: 1, hedefEl: null, tiklaDinle: null, zaman: null, poz: null };
const azHareket = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

function ogreticiBaslat() {
  miniDurdur();
  if (ogretici.aktif) ogreticiBitir(true);
  const dlg = $('#dlg'); if (dlg.open) dlg.close();
  ogretici.aktif = true;
  ogretici.adim = 0;
  const kedi = document.createElement('div');
  kedi.className = 'uzum-kedi';
  kedi.innerHTML = `<div class="uzum-ic">${UZUM_KOSAN}</div>`;
  const vurgu = document.createElement('div'); vurgu.className = 'uzum-vurgu'; vurgu.hidden = true;
  const balon = document.createElement('div'); balon.className = 'uzum-balon'; balon.hidden = true;
  balon.setAttribute('role', 'dialog'); balon.setAttribute('aria-live', 'polite'); balon.setAttribute('aria-label', 'Üzüm anlatıyor');
  const noktalar = [0, 1, 2].map(i => { const d = document.createElement('div'); d.className = 'uzum-nokta n' + i; d.hidden = true; return d; });
  document.body.append(vurgu, kedi, ...noktalar, balon);
  Object.assign(ogretici, { kedi, balon, vurgu, noktalar });
  // Ekranın sol kenarından, üstten biraz ortaya yakın bir yerden girer
  ogretici.x = -KEDI_W - 20;
  ogretici.y = Math.round(window.innerHeight * 0.3);
  ogretici.yon = 1;
  kediyiKoy(false);
  ogreticiAdim(0);
}
function kediyiKoy(animasyon, sure = 0) {
  const k = ogretici.kedi;
  k.style.transition = animasyon ? `transform ${sure}ms linear` : 'none';
  k.style.transform = `translate(${ogretici.x}px, ${ogretici.y}px)`;
  k.querySelector('.uzum-ic').style.transform = ogretici.yon < 0 ? 'scaleX(-1)' : 'none';
}
/** Kediyi (x, y)'ye koşturur; varınca söz verir. */
function kos(x, y) {
  return new Promise(res => {
    const k = ogretici.kedi;
    const dx = x - ogretici.x, dy = y - ogretici.y;
    const mesafe = Math.hypot(dx, dy);
    if (Math.abs(dx) > 2) ogretici.yon = dx < 0 ? -1 : 1;
    ogretici.x = x; ogretici.y = y;
    k.classList.remove('isaret');
    if (azHareket() || mesafe < 4) { kediyiKoy(false); res(); return; }
    const sure = Math.max(450, Math.min(1700, mesafe / 0.55));
    k.classList.add('kosuyor');
    // Tarayıcının başlangıç konumunu çizmesine izin ver, sonra koştur
    requestAnimationFrame(() => requestAnimationFrame(() => kediyiKoy(true, sure)));
    clearTimeout(ogretici.zaman);
    ogretici.zaman = setTimeout(() => { k.classList.remove('kosuyor'); res(); }, sure + 40);
  });
}
/** Hedefe göre kedinin duracağı yer ve patisinin yönü. */
function hedefPozu(r) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const kenar = 6;
  // Üst çubuktaki (sekme) hedefler: kedi altında durur, patisini yukarı kaldırır
  if (r.top < 90 && r.bottom < 140) {
    // Patiyi hedefin sol alt köşesine yakın uzatır; kafası hedefin yazısını kapatmaz
    const ic = Math.min(22, r.width * 0.25);
    let x = r.left + ic - PATI_UST.x, yon = 1;
    if (x < kenar) { x = r.right - ic - (KEDI_W - PATI_UST.x); yon = -1; }
    x = Math.min(Math.max(x, kenar), vw - KEDI_W - kenar);
    return { x, y: r.bottom + 2 - PATI_UST.y, yon, pati: PATI_UST };
  }
  // Diğerleri: hedefin solunda durur, patisiyle sağa işaret eder; yer yoksa sağında durur
  const hedefY = r.top + Math.min(r.height / 2, 26);
  let y = Math.min(Math.max(hedefY - PATI_SAG.y, 70), vh - KEDI_H - kenar);
  if (r.left - PATI_SAG.x >= kenar) return { x: r.left + 4 - PATI_SAG.x, y, yon: 1, pati: PATI_SAG };
  if (r.right + KEDI_W <= vw - kenar) return { x: r.right - 4 - (KEDI_W - PATI_SAG.x), y, yon: -1, pati: PATI_SAG };
  // Çok geniş hedef (telefon): altında durur ve yukarı işaret eder
  let x = Math.min(Math.max(r.left + 30 - PATI_UST.x, kenar), vw - KEDI_W - kenar);
  return { x, y: Math.min(r.bottom + 2 - PATI_UST.y, vh - KEDI_H - kenar), yon: 1, pati: PATI_UST };
}
function vurguYerlestir() {
  const el = ogretici.hedefEl, v = ogretici.vurgu;
  if (!el) { v.hidden = true; return; }
  const r = el.getBoundingClientRect(), p = 6;
  Object.assign(v.style, { left: (r.left - p) + 'px', top: (r.top - p) + 'px', width: (r.width + 2 * p) + 'px', height: (r.height + 2 * p) + 'px' });
  v.hidden = false;
}
/** Düşünce bulutunu kedinin kafasının üstüne (yer yoksa altına) koyar. */
function balonYerlestir() {
  const b = ogretici.balon, vw = window.innerWidth, vh = window.innerHeight;
  b.hidden = false;
  b.style.width = Math.min(340, vw - 24) + 'px';
  const bw = b.offsetWidth, bh = b.offsetHeight;
  const basX = ogretici.x + (ogretici.yon < 0 ? KEDI_W - BAS_X : BAS_X), basY = ogretici.y + BAS_Y;
  let ust = basY - 46 - bh, altta = false;
  if (ust < 8) { ust = ogretici.y + KEDI_H + 40; altta = true; }
  if (ust + bh > vh - 8) ust = Math.max(8, vh - 8 - bh);
  let sol = Math.min(Math.max(basX - bw / 2, 12), vw - bw - 12);
  b.style.left = sol + 'px'; b.style.top = ust + 'px';
  // Manga düşünce bulutu: kafadan bulutun kenarına doğru büyüyen üç küçük daire
  const bx = Math.min(Math.max(basX, sol + 30), sol + bw - 30), by = altta ? ust : ust + bh;
  const kx = basX, ky = altta ? ogretici.y + KEDI_H - 4 : basY;
  ogretici.noktalar.forEach((n, i) => {
    const t = [0.22, 0.5, 0.78][i];
    n.style.left = (kx + (bx - kx) * t) + 'px';
    n.style.top = (ky + (by - ky) * t) + 'px';
    n.hidden = false;
  });
}
function balonGizle() { ogretici.balon.hidden = true; ogretici.noktalar.forEach(n => { n.hidden = true; }); }
function tiklaDinleKaldir() {
  if (ogretici.tiklaDinle) { ogretici.tiklaDinle.el.removeEventListener('click', ogretici.tiklaDinle.fn); ogretici.tiklaDinle = null; }
}
async function ogreticiAdim(i) {
  if (!ogretici.aktif) return;
  tiklaDinleKaldir();
  ogretici.adim = i;
  const a = OGRETICI_ADIMLAR[i];
  balonGizle();
  ogretici.vurgu.hidden = true;
  ogretici.hedefEl = null;
  if (a.sekme && aktifSekme !== a.sekme) sekmeAc(a.sekme);
  let poz;
  const el = a.hedef ? $(a.hedef) : null;
  if (el) {
    const r0 = el.getBoundingClientRect();
    if (r0.top < 70 || r0.bottom > window.innerHeight - 40) {
      el.scrollIntoView({ block: 'center', behavior: azHareket() ? 'auto' : 'smooth' });
      await new Promise(r => setTimeout(r, 450));
    }
    ogretici.hedefEl = el;
    poz = hedefPozu(el.getBoundingClientRect());
  } else {
    // Hedefsiz adım: ekranın ortasına yakın bir yere koşar
    poz = { x: Math.round(window.innerWidth * 0.5 - KEDI_W / 2), y: Math.round(window.innerHeight * 0.45), yon: 1, pati: null };
  }
  if (!ogretici.aktif || ogretici.adim !== i) return;
  ogretici.poz = poz;
  await kos(poz.x, poz.y);
  if (!ogretici.aktif || ogretici.adim !== i) return;
  ogretici.yon = poz.yon;
  kediyiKoy(false);
  const k = ogretici.kedi;
  if (poz.pati) { k.style.setProperty('--aci', `${-poz.pati.aci}deg`); k.style.setProperty('--uzat', poz.pati.uzat || 1); k.classList.add('isaret'); }
  else k.classList.add('sallan');
  setTimeout(() => k.classList.remove('sallan'), 900);
  vurguYerlestir();
  // Bulut
  const b = ogretici.balon;
  const son = i === OGRETICI_ADIMLAR.length - 1;
  b.innerHTML = `<div class="uzum-adim">${i + 1} / ${OGRETICI_ADIMLAR.length}</div>
    <p>${patili(a.metin)}</p>
    <div class="uzum-dugmeler">
      ${i > 0 && !son ? '<button type="button" class="btn small" data-og="geri">← Geri</button>' : ''}
      ${son ? '' : '<button type="button" class="btn small" data-og="bitir">Bitir</button>'}
      <button type="button" class="btn small primary" data-og="ileri">${son ? 'Teşekkürler Üzüm! ❤️' : a.tikla ? 'Benim yerime tıkla ➜' : 'Devam ➜'}</button>
    </div>`;
  balonYerlestir();
  b.querySelector('[data-og=ileri]').focus({ preventScroll: true });
  // "Şuraya tıkla" adımı: kullanıcı gerçekten tıklarsa kendiliğinden ilerle
  if (a.tikla && el) {
    const fn = () => setTimeout(() => ogreticiIleri(), 60);
    el.addEventListener('click', fn);
    ogretici.tiklaDinle = { el, fn };
  }
}
function ogreticiIleri() {
  if (!ogretici.aktif) return;
  const a = OGRETICI_ADIMLAR[ogretici.adim];
  if (a.son) { ogreticiBitir(); return; }
  if (a.tikla && ogretici.hedefEl) { tiklaDinleKaldir(); ogretici.hedefEl.click(); }
  ogreticiAdim(ogretici.adim + 1);
}
async function ogreticiBitir(hemen = false) {
  if (!ogretici.aktif) return;
  ogretici.aktif = false;
  tiklaDinleKaldir();
  const { kedi, balon, vurgu, noktalar } = ogretici;
  balon.remove(); vurgu.remove(); noktalar.forEach(n => n.remove());
  if (!hemen) {
    kedi.classList.remove('isaret');
    // Geldiği yere, sola doğru koşarak çıkar
    await kos(-KEDI_W - 40, Math.round(window.innerHeight * 0.3));
  }
  kedi.remove();
}
function ogreticiYenidenYerlestir() {
  if (!ogretici.aktif || !ogretici.poz) return;
  if (ogretici.hedefEl) {
    const p = hedefPozu(ogretici.hedefEl.getBoundingClientRect());
    ogretici.poz = p;
    Object.assign(ogretici, { x: p.x, y: p.y, yon: p.yon });
    kediyiKoy(false);
    vurguYerlestir();
  }
  if (!ogretici.balon.hidden) balonYerlestir();
}
function ogreticiOlaylari() {
  $('#btnOgretici').addEventListener('click', ogreticiBaslat);
  $('#btnLogoOgretici').addEventListener('click', ogreticiBaslat);
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-og]');
    if (!b) return;
    if (b.dataset.og === 'ileri') ogreticiIleri();
    else if (b.dataset.og === 'geri') ogreticiAdim(Math.max(0, ogretici.adim - 1));
    else if (b.dataset.og === 'bitir') ogreticiBitir();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ogretici.aktif && !$('#dlg').open) ogreticiBitir(); });
  let bekle = 0;
  const yenile = () => { cancelAnimationFrame(bekle); bekle = requestAnimationFrame(ogreticiYenidenYerlestir); };
  window.addEventListener('resize', yenile);
  window.addEventListener('scroll', () => { if (!ogretici.kedi?.classList.contains('kosuyor')) yenile(); }, { passive: true });
}

// ---------------------------------------------------------------------------
// ÜZÜM'ÜN MİNİ ANİMASYONLARI (3–6 sn). Ayarlar'dan açılıp kapanır (varsayılan: açık).
// Tıklamaları engellemez; öğretici, açık pencere ya da arka plandaki sekme sırasında oynamaz.
// ---------------------------------------------------------------------------
const MINI_SVG = {
  yumak: `<svg width="36" height="36" viewBox="0 0 36 36" overflow="visible"><circle cx="18" cy="18" r="15" fill="#c58be8"/><path d="M6 14 Q18 8 30 16 M5 20 Q18 14 31 22 M8 27 Q18 20 28 28 M14 4 Q10 18 16 32 M22 4 Q26 18 20 32" stroke="#9d5fc9" stroke-width="1.6" fill="none"/><path d="M30 27 Q40 30 36 38" stroke="#c58be8" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  kelebek: `<svg width="34" height="28" viewBox="0 0 34 28"><g class="kanat"><ellipse cx="10" cy="10" rx="9" ry="8" fill="#ff8fb8"/><ellipse cx="11" cy="21" rx="6" ry="5" fill="#ffc24b"/><ellipse cx="24" cy="10" rx="9" ry="8" fill="#ff8fb8"/><ellipse cx="23" cy="21" rx="6" ry="5" fill="#ffc24b"/></g><rect x="15.8" y="6" width="2.4" height="18" rx="1.2" fill="#4a3f6b"/><path d="M17 6 q-3 -5 -6 -5 M17 6 q3 -5 6 -5" stroke="#4a3f6b" fill="none"/></svg>`,
  fare: `<svg width="42" height="24" viewBox="0 0 42 24"><path d="M8 16 Q0 18 2 9" stroke="#9aa1ad" fill="none" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="21" cy="15" rx="13" ry="8" fill="#b8bec9"/><circle cx="29" cy="7.5" r="4.2" fill="#b8bec9"/><circle cx="29" cy="7.5" r="2.3" fill="#f2a9be"/><circle cx="33.5" cy="13.5" r="1.3" fill="#2a2a33"/><circle cx="38.2" cy="16.4" r="1.5" fill="#e7849d"/></svg>`,
  balik: `<svg width="44" height="26" viewBox="0 0 44 26"><path d="M4 13 Q16 0 30 13 Q16 26 4 13 Z" fill="#ff9f43"/><path d="M30 13 L42 4 L40 13 L42 22 Z" fill="#ff7f11"/><circle cx="11" cy="11" r="1.7" fill="#2a2a33"/><path d="M17 8 q3 5 0 10" stroke="#e8822a" fill="none" stroke-width="1.4"/></svg>`,
  kutu: `<svg width="96" height="70" viewBox="-6 0 102 70"><path d="M4 24 L86 24 L86 68 L4 68 Z" fill="#d9a066"/><path d="M4 24 L86 24 L86 32 L4 32 Z" fill="#c48a52"/><path d="M4 24 L-5 10 L40 10 L45 24 Z" fill="#e5b07a"/><path d="M86 24 L95 10 L50 10 L45 24 Z" fill="#e5b07a"/><path d="M30 48 h30" stroke="#b07a45" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  kalp: `<svg width="22" height="20" viewBox="0 0 22 20"><path d="M11 19 C-4 9 2 -2 11 5 C20 -2 26 9 11 19 Z" fill="#ff5c7a"/></svg>`,
  uzum: `<svg width="32" height="40" viewBox="0 0 32 40"><path d="M16 8 q2 -6 8 -6" stroke="#4f9a4a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M16 8 q7 -3 10 1 q-6 3 -10 -1z" fill="#6fbf5a"/><g fill="#8e5bd6"><circle cx="9" cy="14" r="4.6"/><circle cx="16" cy="13" r="4.6"/><circle cx="23" cy="14" r="4.6"/><circle cx="12.5" cy="21" r="4.6"/><circle cx="19.5" cy="21" r="4.6"/><circle cx="16" cy="28" r="4.6"/></g><g fill="#fff" opacity=".45"><circle cx="7.6" cy="12.6" r="1.2"/><circle cx="14.6" cy="11.6" r="1.2"/><circle cx="21.6" cy="12.6" r="1.2"/><circle cx="11" cy="19.6" r="1.2"/><circle cx="18" cy="19.6" r="1.2"/><circle cx="14.6" cy="26.6" r="1.2"/></g></svg>`,
  kafa: `<svg width="72" height="72" aria-hidden="true"><use href="#kedi"/></svg>`,
};
const mini = { calisiyor: false, zaman: null, son: -1, sahne: null };
const beklet = ms => new Promise(r => setTimeout(r, ms));
function miniSahne() {
  if (!mini.sahne) { mini.sahne = document.createElement('div'); mini.sahne.id = 'miniSahne'; mini.sahne.setAttribute('aria-hidden', 'true'); document.body.appendChild(mini.sahne); }
  return mini.sahne;
}
function nesne(html, cls = '') {
  const d = document.createElement('div');
  d.className = 'mini-nesne ' + cls;
  d.innerHTML = html;
  miniSahne().appendChild(d);
  return d;
}
const S_KEDI = 0.72, KW = 150 * S_KEDI, KH = 112 * S_KEDI;
/** Küçük, koşan Üzüm. sol=true: sola bakar. */
function miniKedi(sol = false) {
  const d = nesne(`<div class="uzum-ic">${UZUM_KOSAN}</div>`, 'uzum-kedi mini-kedi');
  d.yon = sol => { d.sol = sol; d.firstChild.style.transform = sol ? 'scaleX(-1)' : 'none'; };
  d.yon(sol);
  d.x = 0; d.y = 0;
  return d;
}
const T = (x, y, ek = '') => ({ transform: `translate(${x}px, ${y}px)${ek}` });
const TK = (x, y) => ({ transform: `translate(${x}px, ${y}px) scale(${S_KEDI})` });
function oynat(el, kareler, ms, easing = 'linear', delay = 0) {
  // fill 'both': gecikmeli parça, sırası gelene kadar köşede görünmez; ilk karesinde bekler
  return el.animate(kareler, { duration: ms, easing, delay, fill: 'both' }).finished;
}
function miniBalon(metin, x, y, ms = 1100) {
  const b = nesne(`<div class="mini-balon">${esc(metin)}</div>`);
  b.style.transform = `translate(${x}px, ${y}px)`;
  return oynat(b, [{ opacity: 0, transform: `translate(${x}px, ${y + 8}px) scale(.6)` }, { opacity: 1, transform: `translate(${x}px, ${y}px) scale(1)`, offset: .2 }, { opacity: 1, transform: `translate(${x}px, ${y}px)`, offset: .8 }, { opacity: 0, transform: `translate(${x}px, ${y - 10}px)` }], ms);
}
const ekran = () => ({ w: window.innerWidth, h: window.innerHeight });

// ---- Gerçek kedi hızında hareket yardımcıları ----------------------------------------
const HIZ_KOS = 300, HIZ_YURU = 135, UST_SINIR = 76;          // piksel/saniye; üst menünün altı
const rnd = (a, b) => a + Math.random() * (b - a);
const sec = l => l[Math.floor(Math.random() * l.length)];
const sureHiz = (d, hiz, en = 2400) => Math.min(en, Math.max(350, d / hiz * 1000));
/** Ekranın içinde, kedinin tamamen görüneceği rastgele bir nokta (kedinin sol üstü). */
function icNokta(xa = 0, xb = 1) {
  const { w, h } = ekran();
  const x0 = 30, x1 = Math.max(x0 + 10, w - KW - 30);
  return [rnd(x0 + (x1 - x0) * xa, x0 + (x1 - x0) * xb), rnd(UST_SINIR + 10, Math.max(UST_SINIR + 20, h - KH - 14))];
}
/** Ekran dışında giriş/çıkış noktaları. */
function kenar(ad) {
  const { w, h } = ekran();
  return {
    solUst: [-KW - 30, UST_SINIR + 20], sagUst: [w + 30, UST_SINIR + 20],
    solOrta: [-KW - 30, h * .45], sagOrta: [w + 30, h * .45],
    solAlt: [-KW - 30, h - KH - 14], sagAlt: [w + 30, h - KH - 14],
  }[ad];
}
// Kedi dönüşümü: konum + kendi merkezinde dönme + küçültme
const kTr = (x, y, r = 0) => `translate(${x}px, ${y}px) translate(${KW / 2}px, ${KH / 2}px) rotate(${r}deg) translate(${-KW / 2}px, ${-KH / 2}px) scale(${S_KEDI})`;
function kKoy(k, x, y) { k.x = x; k.y = y; k.style.transform = kTr(x, y); }
/** Koşar (ya da yürür); yönünü kendi çevirir. */
async function mKos(k, x, y, hiz = HIZ_KOS, easing = 'ease-in-out', sure = 0) {
  const d = Math.hypot(x - k.x, y - k.y);
  if (d < 3) return;
  if (Math.abs(x - k.x) > 4) k.yon(x < k.x);
  k.classList.add('kosuyor');
  k.classList.toggle('yuruyor', hiz < 150);
  const a = k.animate([{ transform: kTr(k.x, k.y) }, { transform: kTr(x, y) }], { duration: sure || sureHiz(d, hiz), easing, fill: 'both' });
  k.x = x; k.y = y;
  await a.finished;
  k.classList.remove('kosuyor', 'yuruyor');
}
/** Kavisli zıplama. */
async function mZipla(k, x, y, yuk = 60, ms = 620) {
  if (Math.abs(x - k.x) > 4) k.yon(x < k.x);
  const egim = k.sol ? 14 : -14;
  const a = k.animate([{ transform: kTr(k.x, k.y) }, { transform: kTr((k.x + x) / 2, Math.min(k.y, y) - yuk, egim), offset: .45 }, { transform: kTr(x, y, -egim / 2), offset: .85 }, { transform: kTr(x, y) }], { duration: ms, easing: 'ease-in-out', fill: 'both' });
  k.x = x; k.y = y;
  await a.finished;
}
/** Yerde yuvarlanır (bir tam tur). */
async function mYuvarlan(k, dx, ms = 1150) {
  const x = k.x + dx;
  const a = k.animate([{ transform: kTr(k.x, k.y, 0) }, { transform: kTr(k.x + dx / 2, k.y + 6, dx < 0 ? -180 : 180), offset: .5 }, { transform: kTr(x, k.y, dx < 0 ? -360 : 360) }], { duration: ms, easing: 'ease-in-out', fill: 'both' });
  k.x = x;
  await a.finished;
  k.animate([{ transform: kTr(k.x, k.y) }, { transform: kTr(k.x, k.y) }], { duration: 1, fill: 'both' });
}
async function mPati(k) { k.classList.add('pati-at'); await beklet(480); k.classList.remove('pati-at'); }
async function mHazirlan(k, ms = 750) { k.classList.add('hazirlan'); await beklet(ms); k.classList.remove('hazirlan'); }
/** Kedinin patisi nesneye değecek şekilde yanına koşar. */
function yanNokta(k, o, ow = 36, oh = 36, oda = false) {
  // oda: pati atılacak; kedi nesnenin, önünde (baktığı yönde) boşluk kalan tarafına geçer
  const solda = oda ? (o.x + ow / 2) < ekran().w / 2 : (k.x + KW / 2) < (o.x + ow / 2);
  const x = solda ? o.x - KW * .8 : o.x + ow - KW * .2;
  const { h } = ekran();
  const y = Math.min(Math.max(o.y + oh / 2 - KH * .72, UST_SINIR - 10), h - KH - 6);
  return [x, y];
}
async function yanina(k, o, ow, oh, hiz = HIZ_KOS, oda = false) {
  const [x, y] = yanNokta(k, o, ow, oh, oda);
  // Nesnenin öbür yanına geçecekse içinden geçmesin: önce nesnenin altından/üstünden dolaşır
  const kc = k.x + KW / 2, oc = o.x + ow / 2, hc = x + KW / 2;
  if ((kc - oc) * (hc - oc) < 0 && Math.abs(kc - oc) < KW * 1.6) {
    const { h } = ekran();
    const dolY = o.y + oh / 2 > h * .55 ? Math.max(UST_SINIR, o.y - KH - 10) : Math.min(h - KH - 10, o.y + oh + 10);
    await mKos(k, oc - KW / 2, dolY, hiz);
  }
  await mKos(k, x, y, hiz);
  k.yon(x > o.x);
}
/** Kaçış/fırlatma hedefi: (vx, vy) yönünde, ekranın içinde, en az "enAz" uzakta en uygun nokta. */
function yondekiNokta(o, vx, vy, ow = 36, oh = 36, enAz = 200) {
  const { w, h } = ekran();
  const L = Math.hypot(vx, vy) || 1; vx /= L; vy /= L;
  const ox = o.x + ow / 2, oy = o.y + oh / 2;
  let en = null, enSkor = -1e9;
  for (let t = 0; t < 60; t++) {
    const x = rnd(30, w - ow - 30), y = rnd(UST_SINIR + 20, h - oh - 16);
    const dx = x + ow / 2 - ox, dy = y + oh / 2 - oy, d = Math.hypot(dx, dy);
    if (d < enAz) continue;
    const hiza = (dx * vx + dy * vy) / d;                  // 1: tam o yönde, -1: ters yönde
    const skor = hiza * 3 + Math.min(d, 650) / 650 + rnd(0, .4);
    if (skor > enSkor) { enSkor = skor; en = [x, y]; }
  }
  return en || [Math.min(Math.max(o.x + vx * 260, 30), w - ow - 30), Math.min(Math.max(o.y + vy * 260, UST_SINIR + 20), h - oh - 16)];
}
/** Kaçan, kediden UZAĞA kaçar. */
function uzaklas(o, k, ow = 36, oh = 36) {
  return yondekiNokta(o, o.x + ow / 2 - (k.x + KW / 2), o.y + oh / 2 - (k.y + KH / 2), ow, oh);
}
/** Pati, kedinin BAKTIĞI yöne atılır. */
function ileri(o, k, ow = 36, oh = 36) { return yondekiNokta(o, k.sol ? -1 : 1, rnd(-.45, .45), ow, oh); }
/** Kediden uzak taraftaki ekran kenarı (çıkış). */
function uzakKenar(o, k, ow = 36, oh = 36) {
  const { w } = ekran();
  const sag = (o.x + ow / 2) >= (k.x + KW / 2);
  return { nesne: [sag ? w + 20 : -ow - 20, o.y], kedi: [sag ? w + 30 : -KW - 30, o.y + oh / 2 - KH * .72] };
}
/** Kovalamaca: kaçan önce yola çıkar; kedi biraz sonra ARKASINDAN koşar ve hep ondan sonra varır. */
async function kovala(k, o, hedef, hiz, ow = 36, oh = 36, secenek = {}, kediHedef = null) {
  const [x, y] = hedef;
  const kacSure = sureHiz(Math.hypot(x - o.x, y - o.y), hiz, 3000);
  const kac = oGit(o, x, y, hiz, { easing: 'ease-out', ...secenek });
  const gecikme = 260;
  await beklet(gecikme);
  const [cx, cy] = kediHedef || yanNokta(k, { x, y }, ow, oh);
  const dogal = sureHiz(Math.hypot(cx - k.x, cy - k.y), HIZ_KOS + 60);
  await Promise.all([kac, mKos(k, cx, cy, HIZ_KOS, 'ease-in-out', Math.max(dogal, kacSure - gecikme + 220))]);
  if (!kediHedef) k.yon(cx > x);
}
// Nesne hareketi (yuvarlanan top, uçan kelebek, kaçan fare...)
function oKoy(o, x, y, r = 0) { o.x = x; o.y = y; o.r = r; o.sx = o.sx || 1; o.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scaleX(${o.sx})`; }
async function oGit(o, x, y, hiz, { easing = 'ease-out', don = true, ark = 0, yaricap = 18, yonlu = false } = {}) {
  const d = Math.hypot(x - o.x, y - o.y);
  const r2 = don ? o.r + (x - o.x) / yaricap * 57.3 : o.r;
  if (yonlu && Math.abs(x - o.x) > 3) o.sx = x < o.x ? -1 : 1;
  const tr = (xx, yy, rr) => `translate(${xx}px, ${yy}px) rotate(${rr}deg) scaleX(${o.sx || 1})`;
  const kf = [{ transform: tr(o.x, o.y, o.r) }];
  if (ark) kf.push({ transform: tr((o.x + x) / 2, Math.min(o.y, y) - ark, (o.r + r2) / 2), offset: .5 });
  kf.push({ transform: tr(x, y, r2) });
  const a = o.animate(kf, { duration: sureHiz(d, hiz, 3000), easing, fill: 'both' });
  o.x = x; o.y = y; o.r = r2;
  await a.finished;
}
async function oKaybol(o) { await o.animate([{ opacity: 1 }, { opacity: 0, transform: `translate(${o.x}px, ${o.y}px) scale(.2)` }], { duration: 260, fill: 'both' }).finished; }
const kBalon = (k, metin, ms = 1300) => miniBalon(metin, k.x + (k.sol ? KW * .05 : KW * .5), k.y - 26, ms);
/** Nesneyi ekranın öbür yarısında bir noktaya gönderir. */
function karsiNokta(o, ow = 36, oh = 36) {
  const { w, h } = ekran();
  const x = o.x < w / 2 ? rnd(w * .55, w - ow - 40) : rnd(40, w * .45 - ow);
  return [x, rnd(UST_SINIR + 40, h - oh - 20)];
}

// 1) İp yumağı: girer, Üzüm arkasından gelip yakalar, yuvarlanır; pati attıkça yumak İLERİ gider, Üzüm peşinden koşar; 3. patide yumak ekrandan çıkar
async function animIpYumagi() {
  const [g] = sec([['sagUst'], ['solAlt'], ['sagAlt'], ['solUst'], ['solOrta'], ['sagOrta']]).map(kenar);
  const top = nesne(MINI_SVG.yumak), k = miniKedi();
  const icerden = g[0] < 0 ? 1 : -1;
  oKoy(top, g[0] < 0 ? -40 : g[0] + 10, g[1] + KH * .5);
  kKoy(k, g[0] - icerden * 90, g[1]);                 // kedi yumağın arkasında, ekranın dışında
  const [ax, ay] = icNokta(.25, .75);
  await kovala(k, top, [ax, ay + KH * .5], 340);
  for (let tur = 0; tur < 3; tur++) {
    await yanina(k, top, 36, 36, HIZ_KOS, true);       // önünde boşluk olan tarafa geçer
    if (tur === 0) {
      await mHazirlan(k);
      await mZipla(k, k.x + (k.sol ? -18 : 18), k.y, 40, 520);
      const dx = k.sol ? -70 : 70;
      await Promise.all([mYuvarlan(k, dx), oGit(top, top.x + dx, top.y, 70, { easing: 'ease-in-out' })]);
      await beklet(150);
      k.yon(top.x < k.x);
    } else {
      await beklet(150);
    }
    await mPati(k);
    if (tur < 2) await kovala(k, top, ileri(top, k), 430);
    else { const c = uzakKenar(top, k); await kovala(k, top, c.nesne, 430, 36, 36, { easing: 'ease-in' }, c.kedi); }
  }
}
// 2) Lazer: ekranın farklı yerlerine tutulur; Üzüm her seferinde peşinden koşar, bazen üstüne atlar
async function animLazer() {
  const [g, c] = sec([['sagAlt', 'solUst'], ['solAlt', 'sagUst'], ['sagUst', 'solAlt'], ['solOrta', 'sagOrta']]).map(kenar);
  const { w, h } = ekran();
  const nokta = nesne('<div class="lazer"></div>'), k = miniKedi();
  kKoy(k, g[0], g[1]);
  oKoy(nokta, rnd(w * .3, w * .7), rnd(UST_SINIR + 40, h - 40), 0);
  await nokta.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'both' }).finished;
  for (let i = 0; i < 4; i++) {
    if (i > 0) {
      const [px, py] = karsiNokta(nokta, 12, 12);
      await oGit(nokta, px, py, 1100, { don: false, easing: 'ease-in-out' });
    }
    await yanina(k, nokta, 12, 12, 340);
    if (i % 2 === 1) { await mHazirlan(k, 450); await mZipla(k, k.x + (k.sol ? -26 : 26), k.y, 34, 480); }
    else await beklet(120);
    await mPati(k);
  }
  await oGit(nokta, c[0] < 0 ? -30 : c[0], c[1] + KH * .6, 900, { don: false, easing: 'ease-in' });
  await mKos(k, c[0], c[1], 340);
}
// 3) Kelebek: konduğu yere sinsice yaklaşır, atlar; kelebek kaçar; üçüncüsünde uçup gider
async function animKelebek() {
  const [g, c] = sec([['solAlt', 'sagUst'], ['sagAlt', 'solUst'], ['solOrta', 'sagAlt'], ['sagUst', 'solOrta']]).map(kenar);
  const kb = nesne(MINI_SVG.kelebek, 'kelebek'), k = miniKedi();
  oKoy(kb, g[0] < 0 ? -40 : g[0], g[1] - 30);
  kKoy(k, g[0], g[1]);
  for (let i = 0; i < 2; i++) {
    const [bx, by] = icNokta(i % 2 ? .5 : .05, i % 2 ? .95 : .5);
    const kon = { x: bx + KW * .45, y: by + KH * .2 };
    await oGit(kb, kon.x, kon.y, 260, { don: false, ark: 50, easing: 'ease-in-out' });   // önce kelebek konar
    await yanina(k, kon, 34, 28, HIZ_YURU);                                                // sonra Üzüm sinsice yaklaşır
    await mHazirlan(k, 750);
    const kac = uzaklas(kb, k, 34, 28);
    await Promise.all([mZipla(k, k.x + (k.sol ? -30 : 30), k.y - 6, 70, 600), beklet(200).then(() => oGit(kb, kac[0], kac[1] - 60, 420, { don: false, ark: 80 }))]);
    kb.x = kac[0]; kb.y = kac[1] - 60;
  }
  await Promise.all([oGit(kb, kb.x + (kb.x > k.x ? 1 : -1) * 900, UST_SINIR - 80, 320, { don: false, ark: 40, easing: 'ease-in' }), kBalon(k, 'Hıh! 😼', 1100)]);
  await mKos(k, c[0], c[1]);
}
// 4) Oyuncak fare: fare hep kediden UZAĞA kaçar, Üzüm hep ARKASINDAN kovalar; yakalayıp pati ile ileri fırlatır; fare kaçıp gider
async function animFare() {
  const [g] = sec([['sagAlt'], ['solAlt'], ['sagOrta'], ['solUst'], ['solOrta'], ['sagUst']]).map(kenar);
  const f = nesne(MINI_SVG.fare), k = miniKedi();
  const icerden = g[0] < 0 ? 1 : -1;
  oKoy(f, g[0] < 0 ? -50 : g[0], g[1] + KH * .6);
  kKoy(k, g[0] - icerden * 120, g[1]);                // kedi farenin arkasında
  for (let i = 0; i < 3; i++) {
    await kovala(k, f, uzaklas(f, k, 42, 24), 480, 42, 24, { don: false, yonlu: true, easing: 'ease-in-out' });
    if (i === 1) {
      await mHazirlan(k, 600);
      await mZipla(k, k.x + (k.sol ? -20 : 20), k.y, 45, 520);
      await kBalon(k, 'Yakaladım!', 1000);
      await mPati(k);
      const [fx, fy] = ileri(f, k, 42, 24);              // pati ile ileri fırlatır, yine arkasından koşar
      await kovala(k, f, [f.x + (fx - f.x) * .45, f.y + (fy - f.y) * .45], 320, 42, 24, { don: true, yaricap: 10 });
    } else {
      await mPati(k);
    }
  }
  const c = uzakKenar(f, k, 42, 24);
  await kovala(k, f, c.nesne, 520, 42, 24, { don: false, yonlu: true, easing: 'ease-in' }, c.kedi);
}
// 5) Balık: süzülen balığa iki kez zıplar; ilkinde balık kaçar, ikincisinde "Ham!"
async function animBalik() {
  const [g, c] = sec([['solAlt', 'sagAlt'], ['sagAlt', 'solUst'], ['solOrta', 'sagOrta'], ['sagUst', 'solAlt']]).map(kenar);
  const { h } = ekran();
  const b = nesne(MINI_SVG.balik, 'suzul'), k = miniKedi();
  kKoy(k, g[0], g[1]);
  const [bx] = icNokta(.2, .8);
  oKoy(b, bx, Math.max(UST_SINIR + 30, h * .4), 0);
  b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'both' });
  for (let i = 0; i < 2; i++) {
    const altX = b.x - KW * .35, altY = Math.min(b.y + 90, h - KH - 14);
    await mKos(k, altX, altY, i ? HIZ_KOS : HIZ_YURU);
    k.yon(b.x < k.x + KW / 2 - 20);
    await mHazirlan(k, 800);
    const zip = mZipla(k, k.x + (k.sol ? -10 : 10), altY, altY - b.y + 10, 760);
    if (i === 0) {
      await beklet(260);
      const [nx] = karsiNokta(b, 44, 26);
      await oGit(b, nx, Math.max(UST_SINIR + 30, b.y + rnd(-40, 40)), 220, { don: false, ark: 50 });
      await zip;
      await kBalon(k, 'Hıh!', 800);
    } else {
      await beklet(330);
      oKaybol(b);
      await zip;
      await kBalon(k, 'Ham! 🐟', 1300);
    }
  }
  await mYuvarlan(k, k.sol ? -60 : 60);
  await mKos(k, c[0], c[1]);
}
// 6) Karton kutu: etrafında koşar, içine atlar, kafasını çıkarır, sonra fırlayıp çıkar
async function animKutu() {
  const [g, c] = sec([['solAlt', 'sagAlt'], ['sagAlt', 'solAlt'], ['solUst', 'sagAlt'], ['sagUst', 'solAlt']]).map(kenar);
  const { w, h } = ekran();
  const bx = sec([w * .2, w * .45, w * .7]), by = h - 74;
  const kutu = nesne(MINI_SVG.kutu), k = miniKedi();
  oKoy(kutu, bx, h + 10);
  kKoy(k, g[0], g[1]);
  await oGit(kutu, bx, by, 300, { don: false });
  const kY = h - KH - 8;
  await mKos(k, bx + (g[0] < bx ? -KW - 20 : 120), kY);
  await beklet(400);
  await mHazirlan(k, 700);
  await mZipla(k, bx + 45 - KW / 2, by - KH * .55, 70, 650);
  await k.animate([{ transform: kTr(k.x, k.y), opacity: 1 }, { transform: kTr(k.x, k.y + 40), opacity: 0 }], { duration: 250, fill: 'both' }).finished;
  const salla = () => kutu.animate([0, -6, 6, -4, 0].map(r => ({ transform: `translate(${bx}px, ${by}px) rotate(${r}deg)` })), { duration: 650 }).finished;
  await salla();
  // Kafa, kutunun ağzının üstünde kesilen bir pencerenin içinde yükselir; kutunun altından görünmez
  const kafaX = bx + 12;
  const pencere = nesne(`<div class="kafa-ic">${MINI_SVG.kafa}</div>`, 'arkada kutu-pencere');
  pencere.style.transform = `translate(${kafaX}px, ${by - 50}px)`;
  const kafa = pencere.firstChild;
  await oynat(kafa, [T(0, 76), T(0, 4)], 450, 'ease-out');
  await miniBalon('Miyav!', kafaX + 60, by - 74, 1200);
  await oynat(kafa, [T(0, 4), T(0, 76)], 350, 'ease-in');
  await salla(); await salla();
  pencere.remove();
  kKoy(k, bx + 45 - KW / 2, by - KH * .55);
  k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: 'both' });
  await mZipla(k, bx + 45 - KW / 2 + (c[0] < bx ? -110 : 110), kY, 80, 700);
  await Promise.all([mKos(k, c[0], c[1]), oGit(kutu, bx, h + 10, 200, { don: false, easing: 'ease-in' })]);
}
// 7) Cee: ekranın farklı kenarlarından üç kez kafasını çıkarır
async function animCee() {
  const { w, h } = ekran();
  const sira = [0, 1, 2].sort(() => Math.random() - .5);
  for (const i of sira) {
    const kafa = nesne(MINI_SVG.kafa);
    let gizli, acik, balonX, balonY;
    if (i === 0) { const x = rnd(w * .15, w * .8); gizli = T(x, h + 4); acik = T(x, h - 62); balonX = x + 62; balonY = h - 104; }
    else if (i === 1) { const y = rnd(UST_SINIR + 40, h - 140); gizli = T(-76, y, ' rotate(90deg)'); acik = T(-14, y, ' rotate(90deg)'); balonX = 64; balonY = y - 10; }
    else { const y = rnd(UST_SINIR + 40, h - 140); gizli = T(w + 4, y, ' rotate(-90deg)'); acik = T(w - 58, y, ' rotate(-90deg)'); balonX = w - 150; balonY = y - 10; }
    await oynat(kafa, [gizli, acik], 650, 'ease-out');
    miniBalon('Cee! 👀', balonX, balonY, 1300);
    const t = acik.transform;
    await oynat(kafa, [{ transform: t }, { transform: t + ' rotate(-9deg)' }, { transform: t + ' rotate(9deg)' }, { transform: t }], 1300);
    await oynat(kafa, [acik, gizli], 500, 'ease-in');
    kafa.remove();
    await beklet(500);
  }
}
// 8) Uyku: yavaşça gelir, bir köşede kıvrılıp uyur, Z'ler yükselir, uyanıp gerinir, gider
async function animUyku() {
  const [g, c] = sec([['solAlt', 'sagAlt'], ['sagAlt', 'solOrta'], ['solOrta', 'sagUst'], ['sagUst', 'solAlt']]).map(kenar);
  const { w, h } = ekran();
  const k = miniKedi();
  kKoy(k, g[0], g[1]);
  const yer = [sec([40, w * .5 - KW / 2, w - KW - 40]), h - KH - 10];
  await mKos(k, yer[0], yer[1], HIZ_YURU);
  k.classList.add('uyu');
  await beklet(500);
  const zler = [0, 1, 2, 3, 4].map(i => {
    const z = nesne(`<span class="zzz" style="font-size:${15 + (i % 3) * 6}px">Z</span>`);
    const x0 = k.x + (k.sol ? KW * .1 : KW * .7), y0 = k.y + 10;
    return oynat(z, [{ opacity: 0, transform: `translate(${x0}px, ${y0}px)` }, { opacity: 1, offset: .25 }, { opacity: 0, transform: `translate(${x0 + 40}px, ${y0 - 110}px)` }], 1800, 'ease-out', i * 650);
  });
  await Promise.all(zler);
  k.classList.remove('uyu');
  await kBalon(k, 'Miyav? 😺', 1000);
  await k.animate([{ transform: kTr(k.x, k.y) }, { transform: kTr(k.x, k.y) + ' scale(1.12, .92)', offset: .5 }, { transform: kTr(k.x, k.y) }], { duration: 800, fill: 'both' }).finished;
  await mKos(k, c[0], c[1], HIZ_YURU + 30);
}
// 9) Kalpler: bir yerde durup kalpler saçar, yuvarlanır, başka yerde yine kalpler, el sallayıp gider
async function animKalpler() {
  const [g, c] = sec([['sagAlt', 'solAlt'], ['solAlt', 'sagUst'], ['sagOrta', 'solOrta'], ['solUst', 'sagAlt']]).map(kenar);
  const k = miniKedi();
  kKoy(k, g[0], g[1]);
  const kalpSac = (n = 6) => Promise.all(Array.from({ length: n }, (_, i) => {
    const kp = nesne(MINI_SVG.kalp), sx = k.x + KW * .35 + rnd(-20, 30);
    return oynat(kp, [{ opacity: 0, transform: `translate(${sx}px, ${k.y + 10}px) scale(.5)` }, { opacity: 1, offset: .2 }, { opacity: 0, transform: `translate(${sx + rnd(-40, 40)}px, ${k.y - 110}px) scale(1.2)` }], 1600, 'ease-out', i * 230);
  }));
  const [ax, ay] = icNokta(.1, .5), [bx, by] = icNokta(.5, .9);
  const ilk = g[0] < 0 ? [ax, ay] : [bx, by], ikinci = g[0] < 0 ? [bx, by] : [ax, ay];
  await mKos(k, ...ilk, HIZ_YURU + 40);
  await kalpSac();
  await mYuvarlan(k, k.sol ? -70 : 70);
  await mKos(k, ...ikinci);
  await kalpSac(5);
  await mPati(k);
  await mKos(k, c[0], c[1]);
}
// 10) Üzüm salkımı: zıplayarak gelir; Üzüm iki kez pati atar, salkım sekerek kaçar; sonunda yakalar
async function animUzum() {
  const [g, c] = sec([['solAlt', 'sagAlt'], ['sagUst', 'solAlt'], ['solOrta', 'sagUst'], ['sagAlt', 'solOrta']]).map(kenar);
  const u = nesne(MINI_SVG.uzum), k = miniKedi();
  oKoy(u, g[0] < 0 ? -40 : g[0], g[1] + KH * .4);
  kKoy(k, c[0], c[1]);   // Üzüm öbür taraftan gelir
  const [ax, ay] = icNokta(.3, .7);
  await oGit(u, ax, ay + KH * .4, 260, { ark: 70, yaricap: 16 });   // önce salkım zıplayarak gelip durur
  for (let i = 0; i < 2; i++) {
    await yanina(k, u, 32, 40, HIZ_KOS, true);
    await mPati(k);
    await kovala(k, u, ileri(u, k, 32, 40), 320, 32, 40, { ark: 90, yaricap: 16 });
  }
  await yanina(k, u, 32, 40);
  await mHazirlan(k, 700);
  await mZipla(k, k.x + (k.sol ? -24 : 24), k.y, 50, 560);
  oKaybol(u);
  await kBalon(k, 'Miyav! 🍇', 1300);
  await mKos(k, g[0], g[1]);
}
const MINI_ANIMLER = [
  { ad: 'İp yumağının peşinde', ikon: '🧶', fn: animIpYumagi },
  { ad: 'Kelebek kovalamaca', ikon: '🦋', fn: animKelebek },
  { ad: 'Oyuncak fare', ikon: '🐭', fn: animFare },
  { ad: 'Lazer noktası', ikon: '🔴', fn: animLazer },
  { ad: 'Balık avı', ikon: '🐟', fn: animBalik },
  { ad: 'Karton kutu', ikon: '📦', fn: animKutu },
  { ad: 'Cee!', ikon: '👀', fn: animCee },
  { ad: 'Uykulu Üzüm', ikon: '💤', fn: animUyku },
  { ad: 'Kalpler', ikon: '❤️', fn: animKalpler },
  { ad: 'Üzüm salkımı', ikon: '🍇', fn: animUzum },
];
// Animasyon turu: her animasyon bir turda en fazla 3 kez gelir, hiçbiri arka arkaya iki kez gelmez;
// 10 animasyonun hepsi en az 1 kez gösterilince tur başa sarar. Tur durumu kaydedilir.
const TUR_EN_FAZLA = 3;
function animTuru() {
  const n = MINI_ANIMLER.length;
  const t = S.animTuru;
  if (!t || !Array.isArray(t.sayac) || t.sayac.length !== n) {
    S.animTuru = { sayac: new Array(n).fill(0), son: Number.isInteger(S.sonAnim) ? S.sonAnim : -1, tur: 1 };
  }
  return S.animTuru;
}
/** Kurallara göre rastgele bir animasyon seçer. */
function miniRastgele() {
  const t = animTuru();
  const adaylar = t.sayac.map((c, i) => i).filter(i => t.sayac[i] < TUR_EN_FAZLA && i !== t.son);
  // (Kurallar gereği aday her zaman vardır; yine de güvenlik için yalnız "arka arkaya olmasın" kuralına düş)
  const havuz = adaylar.length ? adaylar : t.sayac.map((c, i) => i).filter(i => i !== t.son);
  return havuz[Math.floor(Math.random() * havuz.length)];
}
/** Oynayan animasyonu tura işler; hepsi en az 1 kez gösterildiyse yeni tur başlar. */
function turaIsle(i) {
  const t = animTuru();
  t.sayac[i] = (t.sayac[i] || 0) + 1;
  t.son = i;
  if (t.sayac.every(c => c >= 1)) { t.sayac = t.sayac.map(() => 0); t.tur = (t.tur || 1) + 1; }
  S.sonAnim = i;
}
async function miniOynat(i) {
  if (mini.calisiyor || ogretici.aktif) return false;
  mini.calisiyor = true; mini.son = i;
  turaIsle(i); kaydet();   // program kapanıp açılsa da tur kaldığı yerden devam eder
  miniTurGoster();          // yalnızca Ayarlar'daki küçük sayaç
  try { await MINI_ANIMLER[i].fn(); }
  catch (e) { /* durduruldu */ }
  finally { if (mini.sahne) mini.sahne.innerHTML = ''; mini.calisiyor = false; }
  return true;
}
function miniDurdur() {
  clearTimeout(mini.zaman);
  if (mini.sahne) { mini.sahne.getAnimations({ subtree: true }).forEach(a => a.cancel()); mini.sahne.innerHTML = ''; }
  mini.calisiyor = false;
}
// Seçilebilen sıklıklar (dakika)
const MINI_ARALIKLAR = [
  [1, 'Her 1 dakikada bir'], [5, 'Her 5 dakikada bir'], [15, 'Her 15 dakikada bir'], [30, 'Her 30 dakikada bir'],
  [60, 'Her 1 saatte bir'], [120, 'Her 2 saatte bir'], [180, 'Her 3 saatte bir'], [300, 'Her 5 saatte bir'],
];
const miniAralikDk = () => MINI_ARALIKLAR.some(([d]) => d === S.ayarlar.animasyonAralik) ? S.ayarlar.animasyonAralik : 5;
/** Seçilen sıklıkta bir sonraki animasyonu planlar (sayaç her çağrıda baştan başlar). */
function miniPlanla() {
  clearTimeout(mini.zaman);
  if (!S.ayarlar.animasyon) return;
  mini.zaman = setTimeout(miniOtomatik, miniAralikDk() * 60000);
}
async function miniOtomatik() {
  if (!S.ayarlar.animasyon) return;
  // O an uygun değilse (öğretici, açık pencere, arka plandaki sekme) tüm aralığı beklemeden 30 sn sonra tekrar dene
  if (document.hidden || ogretici.aktif || $('#dlg').open || azHareket() || mini.calisiyor) { clearTimeout(mini.zaman); mini.zaman = setTimeout(miniOtomatik, 30000); return; }
  await miniOynat(miniRastgele());
  miniPlanla();
}
/** Ayarlar'daki sayaç: bu turda kaç farklı animasyon görüldü (ör. 4 / 10). Başka yerde gösterilmez. */
function miniTurGoster() {
  const el = $('#miniTur');
  if (!el) return;
  const gorulen = animTuru().sayac.filter(c => c >= 1).length;
  el.textContent = `Görülen animasyonlar: ${gorulen} / ${MINI_ANIMLER.length}`;
}
function miniAyarCiz() {
  miniTurGoster();
  const t = $('#aAnimasyon');
  if (t) t.checked = !!S.ayarlar.animasyon;
  const a = $('#aAnimAralik');
  if (a) { if (!a.options.length) a.innerHTML = MINI_ARALIKLAR.map(([d, ad]) => opt(d, ad)).join(''); a.value = String(miniAralikDk()); }
  const l = $('#miniListe');
  if (l && !l.childElementCount) l.innerHTML = MINI_ANIMLER.map((a, i) => `<button type="button" class="btn small" data-mini="${i}"><span aria-hidden="true">${a.ikon}</span> ${esc(a.ad)} ▶</button>`).join('');
}
function miniOlaylari() {
  $('#aAnimasyon').addEventListener('change', e => {
    S.ayarlar.animasyon = e.target.checked;
    kaydetHemen();
    if (e.target.checked) { toast('Üzüm ara sıra oynayacak 🐾'); miniOynat(miniRastgele()).then(() => miniPlanla()); }
    else { miniDurdur(); toast('Mini animasyonlar kapatıldı.'); }
  });
  $('#aAnimAralik').addEventListener('change', e => {
    S.ayarlar.animasyonAralik = parseInt(e.target.value, 10);
    kaydetHemen();
    const ad = MINI_ARALIKLAR.find(([d]) => d === S.ayarlar.animasyonAralik)[1].toLocaleLowerCase('tr-TR');
    if (S.ayarlar.animasyon) { miniPlanla(); toast(`Üzüm artık ${ad} oynayacak 🐾`); }
    else toast(`Sıklık kaydedildi: ${ad}. Animasyonları açınca bu sıklıkta oynar.`);
  });
  // Ana sayfadaki "Üzüm'le oyna": beklemeden rastgele bir animasyon; otomatik sayaç baştan başlar
  $('#btnUzumOyna').addEventListener('click', async () => {
    if (mini.calisiyor) { toast('Üzüm şu an zaten oynuyor 🐾'); return; }
    await miniOynat(miniRastgele());
    miniPlanla();
  });
  $('#miniListe').addEventListener('click', e => { const b = e.target.closest('[data-mini]'); if (b) miniOynat(+b.dataset.mini); });
}

(async function baslat() {
  const v = await yukle();
  S = v ? { ...bosDurum(), ...v } : bosDurum();
  S.ayarlar = { ...VARSAYILAN_AYARLAR, ...(S.ayarlar || {}) };
  kurumlariYukle();
  olaylar();
  ogreticiOlaylari();
  miniOlaylari();
  ciz();
  miniAyarCiz();
  miniPlanla();
})();
