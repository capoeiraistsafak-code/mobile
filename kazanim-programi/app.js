/* Kazanım Takip Programı
 * Veriler tarayıcıda (IndexedDB) saklanır. Excel okuma/yazma için SheetJS (vendor/xlsx.full.min.js).
 */
'use strict';

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------
const KURUMLAR = [
  { key: 'okul_orta', ad: 'Okul – Ortaokul', seviyeler: ['5', '6', '7', '8'] },
  { key: 'okul_lise', ad: 'Okul – Lise', seviyeler: ['9', '10', '11', '12'] },
  { key: 'kurs_orta', ad: 'Kurs – Ortaokul', seviyeler: ['5', '6', '7', '8'] },
  { key: 'kurs_lise', ad: 'Kurs – Lise', seviyeler: ['9', '10', '11', '12'] },
  { key: 'kurs_mezun', ad: 'Kurs – Mezun', seviyeler: ['Mezun'] },
];
const KURUM = Object.fromEntries(KURUMLAR.map(k => [k.key, k]));
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
function toast(msg, ms = 2600) {
  const t = $('#toast');
  t.textContent = msg;
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
    dersler: VARSAYILAN_DERSLER.slice(),
  };
}
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
  const sev = s.seviye === 'Mezun' ? 'Mezun' : `${s.seviye}. Sınıf`;
  const sube = s.sube ? ` / ${s.sube}` : '';
  return kisa ? `${sev}${sube}` : `${KURUM[s.kurum]?.ad || s.kurum} · ${sev}${sube}`;
}
function sinifSirala(a, b) {
  const ki = KURUMLAR.findIndex(k => k.key === a.kurum) - KURUMLAR.findIndex(k => k.key === b.kurum);
  return ki || cmpTr(a.seviye, b.seviye) || cmpTr(a.sube, b.sube);
}
function sinifGetirVeyaOlustur(kurum, seviye, sube) {
  sube = trUpper(String(sube || '').trim());
  seviye = String(seviye || '').trim();
  let s = S.siniflar.find(x => x.kurum === kurum && x.seviye === seviye && trUpper(x.sube) === sube);
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
function kazanimBulKodVeyaMetin(kodVeyaMetin, ders) {
  const v = String(kodVeyaMetin || '').trim();
  if (!v) return null;
  const n = norm(v);
  let k = S.kazanimlar.find(x => x.kod && norm(x.kod) === n);
  if (k) return k;
  // Kod, metnin başında olabilir: "M.8.1.1.1. Kazanım metni"
  const kodAdayi = v.split(/\s+/)[0];
  k = S.kazanimlar.find(x => x.kod && norm(x.kod) === norm(kodAdayi));
  if (k) return k;
  const adaylar = S.kazanimlar.filter(x => norm(x.metin) === n || (n.length > 15 && norm(x.metin).startsWith(n)));
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
    sonuc: cizSonuc, analiz: cizAnaliz, ayar: cizAyar,
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
  if (n.includes('mezun')) return 'kurs_mezun';
  const tur = n.includes('ortaokul') ? 'orta' : n.includes('lise') ? 'lise' : null;
  if (!tur) return null;
  if (n.includes('kurs') || n.includes('dershane') || n.includes('etut')) return 'kurs_' + tur;
  if (n.replace(/ortaokul/g, '').includes('okul')) return 'okul_' + tur;
  return null;
}
/** "10-A", "10/A", "10 A", "11. Sınıf / B Şubesi", "Mezun", "8A" ... */
function sinifCoz(metin) {
  const m0 = String(metin || '').trim();
  if (!m0) return null;
  if (norm(m0).includes('mezun')) {
    const sb = m0.replace(/mezun/i, '').replace(/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/g, ' ').trim();
    return { seviye: 'Mezun', sube: sb.split(/\s+/)[0] || '' };
  }
  const m = m0.match(/(\d{1,2})\s*\.?\s*(?:s[ıi]n[ıi]f[ıi]?)?\s*[-\/\s_.]*\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9]{0,6})/i);
  if (!m) return null;
  const sev = parseInt(m[1], 10);
  if (sev < 1 || sev > 12) return null;
  let sube = (m[2] || '').replace(/^(?:şube|sube)/i, '');
  if (/^s[ıi]n[ıi]f/i.test(sube)) sube = '';
  return { seviye: String(sev), sube: trUpper(sube) };
}
function seviyeCoz(v) {
  const n = norm(v);
  if (!n) return '';
  if (n.includes('mezun')) return 'Mezun';
  const m = String(v).match(/\d{1,2}/);
  return m ? String(parseInt(m[0], 10)) : '';
}
function dosyaAdiTemiz(ad) {
  return ad.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();
}

/** Ortak içe aktarma penceresi. kaynaklar: [{dosya, yol, sayfa, satirlar}] */
function iceAktarPenceresi({ baslik, alanlar, kaynaklar, ekAlanlarHtml, kaynakVarsayilan, uygula }) {
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
        <details><summary class="small muted">Önizleme</summary>
          <div class="tablewrap"><table class="preview">
            <tr>${p.basliklar.map(h => `<th>${esc(h)}</th>`).join('')}</tr>
            ${veri.slice(0, 5).map(r => `<tr>${p.basliklar.map((_, ci) => `<td>${esc(r[ci])}</td>`).join('')}</tr>`).join('')}
          </table></div>
        </details>
      </div>`;
    }).join('')}`;
  dialogAc(baslik, html, [
    { ad: 'Vazgeç' },
    {
      ad: 'İçe aktar', primary: true, tikla: () => {
        const secilenler = parcalar.filter(p => $(`[data-p-aktif="${p.i}"]`).checked).map(p => {
          const es = {};
          $$(`select[data-p="${p.i}"]`).forEach(s => { if (s.value !== '') es[s.dataset.alan] = parseInt(s.value, 10); });
          const veri = p.satirlar.slice(p.bi + 1).filter(r => r.some(c => c));
          const kayitlar = veri.map(r => Object.fromEntries(Object.entries(es).map(([a, ci]) => [a, (r[ci] || '').trim()])));
          return { ...p, es, kayitlar };
        });
        return uygula(secilenler);
      },
    },
  ]);
}

async function dosyalariOku(fileList, filtreKlasor) {
  const dosyalar = [...fileList].filter(f => /\.(xlsx|xls|xlsm|csv)$/i.test(f.name) && !f.name.startsWith('~$'));
  let secili = dosyalar;
  if (filtreKlasor) {
    // Seçilen klasörün içinde Ogrenci/Kazanim alt klasörü varsa yalnızca onu al
    const alt = dosyalar.filter(f => (f.webkitRelativePath || '').split('/').slice(0, -1).some(p => norm(p) === filtreKlasor));
    if (alt.length) secili = alt;
  }
  if (!secili.length) { toast('Seçilen yerde Excel dosyası bulunamadı.'); return []; }
  const kaynaklar = [];
  for (const f of secili) {
    try {
      const sayfalar = await excelOku(f);
      sayfalar.forEach(s => kaynaklar.push({ dosya: f.name, yol: f.webkitRelativePath || f.name, sayfa: s.sayfa, satirlar: s.satirlar }));
    } catch (e) {
      console.error(e);
      toast(`${f.name} okunamadı.`);
    }
  }
  return kaynaklar;
}

// ---------------------------------------------------------------------------
// Öğrenci içe aktarma
// ---------------------------------------------------------------------------
async function ogrenciIceAktar(fileList, klasor) {
  const kaynaklar = await dosyalariOku(fileList, klasor ? 'ogrenci' : null);
  if (!kaynaklar.length) return;
  const kurumSec = (ad, sec) => `<select name="${ad}">${KURUMLAR.map(k => opt(k.key, k.ad, k.key === sec)).join('')}</select>`;
  iceAktarPenceresi({
    baslik: 'Öğrenci listesi içe aktar',
    alanlar: ALANLAR_OGRENCI,
    kaynaklar,
    kaynakVarsayilan: p => {
      const kTahmin = kurumTahmin(p.yol + ' ' + p.sayfa) || '';
      const sTahmin = sinifCoz(dosyaAdiTemiz(p.dosya)) || sinifCoz(p.sayfa) || {};
      const seviyeler = [...new Set(KURUMLAR.flatMap(k => k.seviyeler))];
      return `<div class="map">
        <label>Kurum türü (Excel'de yoksa)
          <select data-vk="${p.i}">${opt('', '— üstteki genel seçim —')}${KURUMLAR.map(k => opt(k.key, k.ad, k.key === kTahmin)).join('')}</select></label>
        <label>Sınıf seviyesi (Excel'de yoksa)
          <select data-vs="${p.i}">${opt('', '— Excel\'den oku —')}${seviyeler.map(s => opt(s, s === 'Mezun' ? 'Mezun' : s + '. Sınıf', s === sTahmin.seviye)).join('')}</select></label>
        <label>Şube (Excel'de yoksa)
          <input data-vsb="${p.i}" value="${esc(sTahmin.sube || '')}" placeholder="ör. A"></label>
      </div>`;
    },
    ekAlanlarHtml: `<div class="form-grid" style="margin-bottom:10px">
        <label>Genel kurum türü (dosyada belirtilmemişse)${kurumSec('genelKurum', 'kurs_lise')}</label>
        <label>Aynı numaralı öğrenci varsa
          <select name="cakisma">${opt('guncelle', 'Bilgilerini ve sınıfını güncelle', true)}${opt('atla', 'Atla (dokunma)')}</select></label>
      </div>`,
    uygula: secilenler => {
      const genelKurum = $('[name=genelKurum]').value;
      const cakisma = $('[name=cakisma]').value;
      let eklendi = 0, guncellendi = 0, atlandi = 0, hatali = 0;
      for (const p of secilenler) {
        const vk = $(`[data-vk="${p.i}"]`).value;
        const vs = $(`[data-vs="${p.i}"]`).value;
        const vsb = $(`[data-vsb="${p.i}"]`).value.trim();
        for (const r of p.kayitlar) {
          let ad = r.ad || '', soyad = r.soyad || '';
          if (r.adsoyad && !ad && !soyad) {
            const parca = r.adsoyad.trim().split(/\s+/);
            soyad = parca.length > 1 ? parca.pop() : '';
            ad = parca.join(' ');
          } else if (r.adsoyad && !ad) ad = r.adsoyad;
          if (!ad && !soyad) { hatali++; continue; }
          let kurum = (r.kurum && kurumTahmin(r.kurum)) || vk || genelKurum;
          let seviye = '', sube = '';
          if (r.sinif) { const c = sinifCoz(r.sinif); if (c) { seviye = c.seviye; sube = c.sube; } }
          if (r.seviye) seviye = seviyeCoz(r.seviye) || seviye;
          if (r.sube) sube = trUpper(r.sube.replace(/şube(si)?/i, '').trim());
          if (!seviye) seviye = vs;
          if (!sube) sube = vsb;
          if (seviye === 'Mezun') kurum = 'kurs_mezun';
          if (!seviye) seviye = KURUM[kurum].seviyeler[0];
          // Seviye kurumla uyumsuzsa kurumu düzelt (ör. 10. sınıf + ortaokul)
          if (!KURUM[kurum].seviyeler.includes(seviye)) {
            const tip = kurum.startsWith('okul') ? 'okul' : 'kurs';
            const alt = KURUMLAR.find(k => k.key.startsWith(tip) && k.seviyeler.includes(seviye));
            if (alt) kurum = alt.key;
          }
          const sinif = sinifGetirVeyaOlustur(kurum, seviye, sube);
          const no = (r.no || '').trim();
          const mevcut = no ? S.ogrenciler.find(o => o.no === no && sinifBul(o.sinifId)?.kurum.split('_')[0] === kurum.split('_')[0])
            : S.ogrenciler.find(o => norm(adSoyad(o)) === norm(ad + ' ' + soyad) && o.sinifId === sinif.id);
          if (mevcut) {
            if (cakisma === 'atla') { atlandi++; continue; }
            Object.assign(mevcut, { ad: ad.trim(), soyad: soyad.trim(), sinifId: sinif.id });
            guncellendi++;
          } else {
            S.ogrenciler.push({ id: uid(), no, ad: ad.trim(), soyad: soyad.trim(), sinifId: sinif.id });
            eklendi++;
          }
        }
      }
      kaydet(); ciz();
      toast(`${eklendi} öğrenci eklendi, ${guncellendi} güncellendi${atlandi ? `, ${atlandi} atlandı` : ''}${hatali ? `, ${hatali} satır boş/hatalı` : ''}.`, 5000);
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
async function kazanimIceAktar(fileList, klasor) {
  const kaynaklar = await dosyalariOku(fileList, klasor ? 'kazanim' : null);
  if (!kaynaklar.length) return;
  const seviyeler = ['5', '6', '7', '8', '9', '10', '11', '12', 'Mezun'];
  iceAktarPenceresi({
    baslik: 'Kazanım listesi içe aktar',
    alanlar: ALANLAR_KAZANIM,
    kaynaklar,
    kaynakVarsayilan: p => {
      const metin = p.yol + ' ' + (/^(sheet|sayfa)\d*$/i.test(norm(p.sayfa)) ? '' : p.sayfa);
      const d = dersTahmin(metin);
      const sv = (dosyaAdiTemiz(p.dosya).match(/(?:^|\D)(1[0-2]|[5-9])(?:\D|$)/) || [])[1] || '';
      return `<div class="map">
        <label>Ders (Excel'de yoksa)<input data-vd="${p.i}" value="${esc(d)}" list="dersDL"></label>
        <label>Sınıf seviyesi (Excel'de yoksa)
          <select data-vs="${p.i}">${opt('', '—')}${seviyeler.map(s => opt(s, s === 'Mezun' ? 'Mezun' : s + '. Sınıf', s === sv)).join('')}</select></label>
      </div>`;
    },
    ekAlanlarHtml: `<datalist id="dersDL">${S.dersler.map(d => opt(d, d)).join('')}</datalist>`,
    uygula: secilenler => {
      let eklendi = 0, guncellendi = 0, hatali = 0;
      for (const p of secilenler) {
        const vd = $(`[data-vd="${p.i}"]`).value.trim();
        const vs = $(`[data-vs="${p.i}"]`).value;
        let sonUnite = '', sonKonu = '';
        for (const r of p.kayitlar) {
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
          if (/^kazan[ıi]m/i.test(metin) && !kod) { hatali++; continue; }
          const ders = (r.ders || vd || 'Belirtilmemiş').trim();
          const seviye = seviyeCoz(r.seviye) || vs || '';
          const veri = { kod, ders, seviye, unite: (r.unite || sonUnite).trim(), konu: (r.konu || sonKonu).trim(), metin };
          const mevcut = kod
            ? S.kazanimlar.find(k => k.kod && norm(k.kod) === norm(kod) && norm(k.ders) === norm(ders))
            : S.kazanimlar.find(k => norm(k.metin) === norm(metin) && norm(k.ders) === norm(ders) && k.seviye === seviye);
          if (mevcut) { Object.assign(mevcut, veri); guncellendi++; }
          else { S.kazanimlar.push({ id: uid(), ...veri }); eklendi++; }
          if (ders && !S.dersler.some(d => norm(d) === norm(ders))) S.dersler.push(ders);
        }
      }
      kaydet(); ciz();
      toast(`${eklendi} kazanım eklendi, ${guncellendi} güncellendi.`, 5000);
    },
  });
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
  const sinif = sinifGetirVeyaOlustur('kurs_lise', '11', 'A');
  const sinif2 = sinifGetirVeyaOlustur('okul_orta', '8', 'B');
  [['1101', 'Örnek', 'Öğrenci Bir'], ['1102', 'Örnek', 'Öğrenci İki'], ['1103', 'Örnek', 'Öğrenci Üç'], ['1104', 'Örnek', 'Öğrenci Dört']]
    .forEach(([no, ad, soyad]) => S.ogrenciler.push({ id: uid(), no, ad, soyad, sinifId: sinif.id }));
  [['801', 'Deneme', 'Kişi Bir'], ['802', 'Deneme', 'Kişi İki']].forEach(([no, ad, soyad]) => S.ogrenciler.push({ id: uid(), no, ad, soyad, sinifId: sinif2.id }));
  const kz = [
    ['T.9.3.1', 'Türkçe', 'Okuma', 'Metni Anlama', 'Metnin konusunu ve ana fikrini belirler. (örnek)'],
    ['T.9.3.2', 'Türkçe', 'Okuma', 'Metni Anlama', 'Metindeki yardımcı fikirleri belirler. (örnek)'],
    ['T.9.3.3', 'Türkçe', 'Okuma', 'Söz Sanatları', 'Metindeki söz sanatlarını tespit ederek işlevlerini açıklar. (örnek)'],
    ['M.9.1.1.1', 'Matematik', 'Mantık', 'Önermeler', 'Önermeyi ve önermenin doğruluk değerini açıklar. (örnek)'],
    ['M.9.1.2.1', 'Matematik', 'Kümeler', 'Kümelerde Temel Kavramlar', 'Kümeler ile ilgili temel kavramları açıklar. (örnek)'],
    ['M.9.2.2.1', 'Matematik', 'Denklemler ve Eşitsizlikler', 'Bölünebilme Kuralları', 'Bölünebilme kurallarıyla ilgili problemler çözer. (örnek)'],
  ].map(([kod, ders, unite, konu, metin]) => { const k = { id: uid(), kod, ders, seviye: '9', unite, konu, metin }; S.kazanimlar.push(k); return k; });
  const cevap = 'ABCDEABC';
  const sorular = [0, 1, 2, 0, 3, 4, 5, 5].map((ki, i) => ({ no: String(i + 1), ders: kz[ki].ders, kazanimId: kz[ki].id, cevap: cevap[i] }));
  const sinav = { id: uid(), ad: 'ÖRNEK Deneme 1', tarih: bugun(), kurum: 'kurs_lise', seviye: '11', sorular };
  S.sinavlar.push(sinav);
  const og = sinifOgrencileri(sinif.id);
  S.sonuclar[sinav.id] = { [og[0].id]: { 3: 'Y' }, [og[1].id]: { 1: 'Y', 4: 'Y', 6: 'Y', 8: 'B' }, [og[2].id]: { 2: 'B', 5: 'Y', 7: 'Y' }, [og[3].id]: {} };
  S.ornek = true;
  kaydet();
  filtre.anSinif = sinif.id; filtre.anOgrenci = og[1].id;
  toast('Örnek veriler yüklendi. Öğrenci analizi açılıyor.');
  sekmeAc('analiz');
}
function ornekVeriSil() {
  S = bosDurum(); kaydet(); ciz(); toast('Örnek veriler silindi.');
}

function cizPanel() {
  const bos = !S.ogrenciler.length && !S.kazanimlar.length && !S.sinavlar.length;
  $('#panelOrnek').innerHTML = bos
    ? `<div class="card"><h2>Hemen denemek ister misiniz?</h2><p class="muted">Örnek bir sınıf, kazanımlar ve sonuçları girilmiş bir deneme sınavı yüklenir. Kendi verilerinizi aktarmadan önce silebilirsiniz.</p>
       <button class="btn primary" id="btnOrnekYukle">Örnek verilerle dene</button></div>`
    : S.ornek ? `<div class="ornek-uyari">Şu an örnek veriler yüklü. Kendi verilerinizi aktarmadan önce <button class="btn small" id="btnOrnekSil">Örnek verileri sil</button></div>` : '';
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
  $('#panelSon').innerHTML = `<h2>Kurumlara göre</h2>
    <div class="tablewrap"><table><tr><th>Kurum türü</th><th>Sınıf</th><th>Öğrenci</th></tr>${kurumOzet}</table></div>`;
}

// ---------------------------------------------------------------------------
// ÖĞRENCİLER
// ---------------------------------------------------------------------------
const filtre = { kurum: '', seviye: '', sinif: '', ara: '', seciliSinav: null, kzDers: '', kzSeviye: '', kzAra: '', snSinav: '', snSinif: '', anSinif: '', anOgrenci: '' };

function cizOgrenci() {
  const kurumlar = KURUMLAR;
  $('#fKurum').innerHTML = opt('', 'Tüm kurumlar') + kurumlar.map(k => opt(k.key, k.ad, filtre.kurum === k.key)).join('');
  const seviyeler = filtre.kurum ? KURUM[filtre.kurum].seviyeler : [...new Set(KURUMLAR.flatMap(k => k.seviyeler))];
  if (!seviyeler.includes(filtre.seviye)) filtre.seviye = '';
  $('#fSeviye').innerHTML = opt('', 'Tüm seviyeler') + seviyeler.map(s => opt(s, s === 'Mezun' ? 'Mezun' : s + '. Sınıf', filtre.seviye === s)).join('');
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
  const gosterilen = ogr.slice(0, 500);
  $('#ogrTablo').innerHTML = `<tr><th>No</th><th>Ad Soyad</th><th>Sınıf</th><th></th></tr>` +
    gosterilen.map(o => `<tr><td>${esc(o.no)}</td><td>${esc(adSoyad(o))}</td><td>${esc(sinifAdi(sinifBul(o.sinifId)))}</td>
      <td style="white-space:nowrap"><button class="btn small" data-ogr-analiz="${o.id}">Analiz</button>
      <button class="btn small" data-ogr-duz="${o.id}">✎</button></td></tr>`).join('') +
    (ogr.length > 500 ? `<tr><td colspan="4" class="muted">İlk 500 öğrenci gösteriliyor; filtre kullanın.</td></tr>` : '') +
    (!ogr.length ? `<tr><td colspan="4" class="muted">Öğrenci bulunamadı.</td></tr>` : '');
}

function sinifDialog(sinif) {
  const s = sinif || { kurum: filtre.kurum || 'kurs_lise', seviye: '', sube: '' };
  const seviyeSecenek = k => KURUM[k].seviyeler.map(v => opt(v, v === 'Mezun' ? 'Mezun' : v + '. Sınıf', v === s.seviye)).join('');
  dialogAc(sinif ? 'Sınıfı düzenle' : 'Yeni sınıf', `<div class="form-grid">
      <label>Kurum türü<select id="dKurum">${KURUMLAR.map(k => opt(k.key, k.ad, k.key === s.kurum)).join('')}</select></label>
      <label>Sınıf seviyesi<select id="dSeviye">${seviyeSecenek(s.kurum)}</select></label>
      <label>Şube / grup adı<input id="dSube" value="${esc(s.sube)}" placeholder="ör. A, Sayısal-1"></label>
    </div>`, [
    ...(sinif ? [{
      ad: 'Sınıfı sil', danger: true, tikla: () => {
        const n = S.ogrenciler.filter(o => o.sinifId === sinif.id).length;
        if (n) { toast(`Bu sınıfta ${n} öğrenci var; önce öğrencileri taşıyın veya silin.`, 4000); return false; }
        S.siniflar = S.siniflar.filter(x => x.id !== sinif.id); kaydet(); ciz();
      },
    }] : []),
    { ad: 'Vazgeç' },
    {
      ad: 'Kaydet', primary: true, tikla: () => {
        const kurum = $('#dKurum').value, seviye = $('#dSeviye').value, sube = trUpper($('#dSube').value.trim());
        const ayni = S.siniflar.find(x => x.kurum === kurum && x.seviye === seviye && trUpper(x.sube) === sube && x.id !== sinif?.id);
        if (ayni) { toast('Bu sınıf zaten var.'); return false; }
        if (sinif) Object.assign(sinif, { kurum, seviye, sube });
        else S.siniflar.push({ id: uid(), kurum, seviye, sube });
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
  $('#kzSeviye').innerHTML = opt('', 'Tüm seviyeler') + seviyeler.map(s => opt(s, s === 'Mezun' ? 'Mezun' : s + '. Sınıf', filtre.kzSeviye === s)).join('');
  const ara = norm(filtre.kzAra);
  const liste = S.kazanimlar.filter(k => (!filtre.kzDers || k.ders === filtre.kzDers) && (!filtre.kzSeviye || k.seviye === filtre.kzSeviye)
    && (!ara || norm(k.kod + k.metin + k.konu + k.unite).includes(ara)))
    .sort((a, b) => cmpTr(a.ders, b.ders) || cmpTr(a.seviye, b.seviye) || cmpTr(a.kod, b.kod));
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
  $('#sinavDetay').innerHTML = `
    <div class="form-grid">
      <label>Sınav adı<input id="sAd" value="${esc(s.ad)}"></label>
      <label>Tarih<input id="sTarih" type="date" value="${esc(s.tarih)}"></label>
      <label>Kurum türü<select id="sKurum">${KURUMLAR.map(k => opt(k.key, k.ad, k.key === s.kurum)).join('')}</select></label>
      <label>Sınıf seviyesi<select id="sSeviye">${opt('', 'Karışık')}${KURUM[s.kurum].seviyeler.map(v => opt(v, v === 'Mezun' ? 'Mezun' : v + '. Sınıf', v === s.seviye)).join('')}</select></label>
    </div>
    <div class="toolbar" style="margin-top:12px">
      <button class="btn" id="btnSoruEkle">+ Soru ekle</button>
      <button class="btn" id="btnTopluSoru">+ Toplu soru ekle (ders bazında)</button>
      <label class="btn">Cevap anahtarı / kazanım Excel'i aktar<input type="file" id="anahtarDosya" accept=".xlsx,.xls,.csv" hidden></label>
      <button class="btn danger" id="btnSinavSil">Sınavı sil</button>
    </div>
    <p class="small muted">${s.sorular.length} soru${atanmamis ? ` · <span class="chip orange">${atanmamis} soruya kazanım atanmamış</span>` : ''}. Kazanım kutusuna kod veya metin yazarak arayabilirsiniz.</p>
    <datalist id="kzDL">${kzSecenekleri.map(k => `<option value="${esc(kazanimEtiket(k))}">`).join('')}</datalist>
    <datalist id="dersDL3">${S.dersler.map(d => opt(d, d)).join('')}</datalist>
    <div class="tablewrap"><table>
      <tr><th style="width:60px">Soru</th><th style="width:160px">Ders</th><th>Kazanım</th><th style="width:70px">Cevap</th><th></th></tr>
      ${s.sorular.map((q, i) => `<tr>
        <td><input data-q="${i}" data-f="no" value="${esc(q.no)}" style="width:52px"></td>
        <td><input data-q="${i}" data-f="ders" value="${esc(q.ders)}" list="dersDL3" style="width:150px"></td>
        <td><input data-q="${i}" data-f="kazanim" value="${esc(q.kazanimId ? kazanimEtiket(kazanimBul(q.kazanimId)) : '')}" list="kzDL" style="width:100%" placeholder="kazanım kodu veya metni"></td>
        <td><input data-q="${i}" data-f="cevap" value="${esc(q.cevap)}" style="width:50px"></td>
        <td><button class="btn small" data-q-sil="${i}">✕</button></td></tr>`).join('')}
    </table></div>`;
}
function sinavKazanimlari(s) {
  // Sınav seviyesine uygun kazanımları öne al; mezun sınavlarında tüm lise kazanımları
  let l = S.kazanimlar;
  if (s.seviye && s.seviye !== 'Mezun') {
    const uygun = l.filter(k => !k.seviye || k.seviye === s.seviye);
    if (uygun.length) l = uygun;
  } else if (s.kurum.endsWith('lise') || s.kurum === 'kurs_mezun') {
    const uygun = l.filter(k => !k.seviye || ['9', '10', '11', '12', 'Mezun'].includes(k.seviye));
    if (uygun.length) l = uygun;
  } else if (s.kurum.endsWith('orta')) {
    const uygun = l.filter(k => !k.seviye || ['5', '6', '7', '8'].includes(k.seviye));
    if (uygun.length) l = uygun;
  }
  return l.slice().sort((a, b) => cmpTr(a.ders, b.ders) || cmpTr(a.kod, b.kod));
}
function yeniSinav() {
  const kurum = filtre.kurum || 'kurs_lise';
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
async function anahtarIceAktar(s, file) {
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
      let n = 0, bulunamadi = 0, sira = s.sorular.length;
      for (const p of secilenler) {
        for (const r of p.kayitlar) {
          if (!r.no && !r.kazanim && !r.cevap) continue;
          const no = r.no || String(++sira);
          let q = s.sorular.find(x => String(x.no) === String(no));
          if (!q) { q = { no, ders: '', kazanimId: '', cevap: '' }; s.sorular.push(q); }
          if (r.ders) q.ders = r.ders;
          if (r.cevap) q.cevap = trUpper(r.cevap);
          if (r.kazanim) {
            const k = kazanimBulKodVeyaMetin(r.kazanim, q.ders);
            if (k) { q.kazanimId = k.id; if (!q.ders) q.ders = k.ders; } else bulunamadi++;
          }
          n++;
        }
      }
      s.sorular.sort((a, b) => cmpTr(a.no, b.no));
      kaydet(); cizSinav();
      toast(`${n} soru işlendi${bulunamadi ? `, ${bulunamadi} kazanım listede bulunamadı (önce kazanımları içe aktarın)` : ''}.`, 5000);
    },
  });
}

// ---------------------------------------------------------------------------
// SONUÇ GİRİŞİ
// ---------------------------------------------------------------------------
function sinavSiniflari(s) {
  return S.siniflar.filter(c => c.kurum === s.kurum && (!s.seviye || c.seviye === s.seviye)).sort(sinifSirala);
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
      ${dersGruplari.map(g => `<div class="ders-grup"><span class="dersad">${esc(g.ders || 'Ders yok')}</span><div class="qrow">
        ${g.sorular.map(q => { const v = r?.[q.no] || 'D'; return `<button type="button" class="q ${v}" data-qno="${esc(q.no)}" title="${esc(kazanimEtiket(kazanimBul(q.kazanimId)))}">${esc(q.no)}<small>${v}</small></button>`; }).join('')}
      </div></div>`).join('')}
    </div>`;
  }).join('');
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
  const ad = kart.querySelector('.ad');
  $$('.chip', ad).forEach(c => c.remove());
  ad.querySelector('[data-sonuc-sil]').insertAdjacentHTML('beforebegin',
    `<span class="chip green">${s.sorular.length - y - b} D</span><span class="chip red">${y} Y</span><span class="chip orange">${b} B</span>`);
}
async function sonucIceAktar(fileList) {
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
      for (const p of secilenler) {
        const soruSutun = {};
        p.basliklar.forEach((h, ci) => {
          const m = String(h).trim().match(/^(?:s(?:oru)?\.?\s*)?(\d{1,3})\.?$/i);
          if (m && s.sorular.some(q => String(q.no) === String(parseInt(m[1], 10)))) soruSutun[parseInt(m[1], 10)] = ci;
        });
        const veri = p.satirlar.slice(p.bi + 1).filter(r => r.some(c => c));
        veri.forEach((satir, ri) => {
          const k = p.kayitlar[ri];
          let o = null;
          if (k.no) o = S.ogrenciler.find(x => x.no === k.no.trim());
          if (!o && k.adsoyad) o = S.ogrenciler.find(x => norm(adSoyad(x)) === norm(k.adsoyad));
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
      }
      kaydet(); ciz();
      toast(`${n} öğrencinin sonucu aktarıldı${bulunamadi.length ? `; ${bulunamadi.length} öğrenci bulunamadı: ${bulunamadi.slice(0, 5).join(', ')}${bulunamadi.length > 5 ? '…' : ''}` : ''}.`, 6000);
    },
  });
}

// ---------------------------------------------------------------------------
// ANALİZ VE ÖDEV PLANI
// ---------------------------------------------------------------------------
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
const analizSecim = { sinavlar: null, kazanimlar: null, ogrId: null };

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
  if (analizSecim.ogrId !== o.id) { analizSecim.ogrId = o.id; analizSecim.sinavlar = null; analizSecim.kazanimlar = null; }
  if (!analizSecim.sinavlar) analizSecim.sinavlar = new Set(girilmis.slice(0, 1).map(s => s.id));
  const { liste, kazanimsiz } = eksikKazanimlar(o.id, [...analizSecim.sinavlar]);
  if (!analizSecim.kazanimlar) analizSecim.kazanimlar = new Set(liste.map(e => e.k.id));

  const planlar = S.planlar.filter(p => p.ogrenciId === o.id).sort((a, b) => cmpTr(b.olusturma, a.olusturma));
  const dersGrup = {};
  liste.forEach(e => { (dersGrup[e.k.ders] = dersGrup[e.k.ders] || []).push(e); });

  $('#analizAlan').innerHTML = `
  <div class="card">
    <h2>${esc(adSoyad(o))} <span class="muted small">${esc(o.no)} · ${esc(sinifAdi(sinifBul(o.sinifId)))}</span></h2>
    <h3>Sınavlar</h3>
    ${girilmis.length ? girilmis.map(s => {
      const r = S.sonuclar[s.id][o.id];
      const y = Object.values(r).filter(v => v === 'Y').length, b = Object.values(r).filter(v => v === 'B').length;
      return `<label class="kz-row" style="border:0;padding:4px"><input type="checkbox" data-an-sinav="${s.id}" ${analizSecim.sinavlar.has(s.id) ? 'checked' : ''}>
        <span>${esc(s.ad)} <span class="muted small">${tarihTr(s.tarih)}</span>
        <span class="chip green">${s.sorular.length - y - b} D</span> <span class="chip red">${y} Y</span> <span class="chip orange">${b} B</span></span></label>`;
    }).join('') : '<p class="muted">Bu öğrenci için girilmiş sınav sonucu yok. “Sonuç Girişi” sekmesinden girin.</p>'}
  </div>

  <div class="card">
    <h2>Çözemediği sorulara göre kazanımlar <span class="muted small">(${liste.length})</span></h2>
    ${liste.length ? `<div class="toolbar"><button class="btn small" id="kzHepsi">Tümünü seç</button><button class="btn small" id="kzHicbiri">Hiçbirini seçme</button></div>` : ''}
    ${Object.entries(dersGrup).map(([ders, l]) => `<div class="group-title">${esc(ders)} · ${l.length} kazanım</div>` + l.map(e => `
      <label class="kz-row"><input type="checkbox" data-an-kz="${e.k.id}" ${analizSecim.kazanimlar.has(e.k.id) ? 'checked' : ''}>
        <span class="kz-body"><span class="kz-kod">${esc(e.k.kod || '')}</span> ${esc(e.k.metin)}
          <div class="kz-meta">${[e.k.seviye && (e.k.seviye + '. sınıf'), e.k.unite, e.k.konu].filter(Boolean).map(esc).join(' · ')}</div>
          <div class="kz-meta">${e.yanlis ? `<span class="chip red">${e.yanlis} yanlış</span> ` : ''}${e.bos ? `<span class="chip orange">${e.bos} boş</span> ` : ''}
          Sorular: ${e.sorular.map(q => `${esc(q.sinav)} #${esc(q.no)}`).join(', ')}</div></span></label>`).join('')).join('')}
    ${!liste.length && girilmis.length ? '<p class="muted">Seçili sınavlarda kazanımı belirli yanlış/boş soru yok.</p>' : ''}
    ${kazanimsiz.length ? `<p class="small"><span class="chip orange">${kazanimsiz.length} yanlış/boş soruya kazanım atanmamış</span>
      (${kazanimsiz.slice(0, 12).map(x => `${esc(x.sinav.ad)} #${esc(x.q.no)}`).join(', ')}${kazanimsiz.length > 12 ? '…' : ''}). “Sınavlar” sekmesinden kazanım atayın.</p>` : ''}
    ${liste.length ? `<div class="toolbar"><button class="btn primary" id="btnPlanHazirla">Seçili kazanımlarla ödev / çalışma planı hazırla</button>
      ${ARTIFACT ? '' : '<button class="btn" id="btnKzListeYazdir">Kazanım listesini yazdır</button>'}</div>` : ''}
  </div>

  <div class="card">
    <h2>Ödev / çalışma planları <span class="muted small">(${planlar.length})</span></h2>
    ${planlar.map(p => {
      const tamam = p.gorevler.filter(g => g.tamam).length;
      return `<div class="list-item" data-plan="${p.id}"><span><b>${esc(p.baslik)}</b><br>
        <span class="small muted">${tarihTr(p.gorevler[0]?.tarih)} – ${tarihTr(p.gorevler[p.gorevler.length - 1]?.tarih)} · ${p.gorevler.length} görev · ${tamam}/${p.gorevler.length} tamamlandı</span></span>
        <span class="chip ${tamam === p.gorevler.length ? 'green' : ''}">%${Math.round(100 * tamam / Math.max(1, p.gorevler.length))}</span></div>`;
    }).join('') || '<p class="muted">Henüz plan yok.</p>'}
  </div>`;
}

function planDialog(o) {
  const { liste } = eksikKazanimlar(o.id, [...analizSecim.sinavlar]);
  const secili = liste.filter(e => analizSecim.kazanimlar.has(e.k.id));
  if (!secili.length) { toast('En az bir kazanım seçin.'); return; }
  const gunOneri = Math.min(30, Math.max(7, Math.ceil(secili.length / 2) + 5));
  dialogAc(`Ödev / çalışma planı – ${adSoyad(o)}`, `
    <p class="muted small">${secili.length} kazanım seçildi. En çok yanlış/boş yapılan kazanımlar öne alınır.</p>
    <div class="plan-ayar">
      <label>Plan başlığı<input id="pBaslik" value="${esc((S.sinavlar.filter(s => analizSecim.sinavlar.has(s.id)).map(s => s.ad).join(', ') || 'Kazanım') + ' – Çalışma planı')}"></label>
      <label>Başlangıç tarihi<input id="pBaslangic" type="date" value="${addDays(bugun(), 1)}"></label>
      <label>Süre (gün)<input id="pGun" type="number" min="1" max="90" value="${gunOneri}"></label>
      <label>Kazanım başına soru sayısı<input id="pSoru" type="number" min="0" max="200" value="20"></label>
      <label>Günde en fazla yeni kazanım<input id="pGunluk" type="number" min="1" max="20" value="3"></label>
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
          soru: Math.max(0, parseInt($('#pSoru').value, 10) || 0),
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
    if (a.soru) parca.push(`${a.soru} soru çöz.`);
    parca.push(`Sınavda yanlış/boş bıraktığın ${e.yanlis + e.bos} soruyu tekrar çöz.`);
    gorevler.push({ ...temel, tarih: gunler[gi], tur: 'Çalışma', gorev: parca.join(' ') });
    if (a.tekrar) {
      let ti = gi + 3;
      const sinir = genelGun >= 0 ? genelGun - 1 : gunler.length - 1;
      if (ti > sinir) ti = sinir > gi ? sinir : -1;
      if (ti >= 0) gorevler.push({ ...temel, tarih: gunler[ti], tur: 'Tekrar', gorev: `Tekrar testi: ${Math.max(5, Math.round(a.soru / 2))} soru çöz, yanlışlarını kontrol et.` });
    }
  });
  if (genelGun >= 0) {
    const dersler = [...new Set(secili.map(e => e.k.ders))];
    dersler.forEach(d => gorevler.push({
      ders: d, kod: '', kazanim: 'Genel tekrar (bu plandaki tüm kazanımlar)', kazanimId: '', tamam: false,
      tarih: gunler[genelGun], tur: 'Genel tekrar', gorev: `${d}: plandaki kazanımlardan karışık ${Math.max(10, secili.filter(e => e.k.ders === d).length * 3)} soru çöz; sınavdaki yanlışlarını yeniden gözden geçir.`,
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
// AYARLAR / YEDEK
// ---------------------------------------------------------------------------
function cizAyar() {
  $('#dersListesi').value = S.dersler.join(', ');
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
    const o = ogrenciBul(an.dataset.ogrAnaliz);
    filtre.anSinif = o.sinifId; filtre.anOgrenci = o.id;
    if (aktifSekme === 'sonuc' && filtre.snSinav) analizSecim.ogrId = o.id, analizSecim.sinavlar = new Set([filtre.snSinav]), analizSecim.kazanimlar = null;
    sekmeAc('analiz');
  });

  // Kazanımlar
  $('#kzFolder').addEventListener('change', e => { kazanimIceAktar(e.target.files, true); e.target.value = ''; });
  $('#kzFiles').addEventListener('change', e => { kazanimIceAktar(e.target.files, false); e.target.value = ''; });
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
    else if (t.id === 'sKurum') { s.kurum = t.value; if (!KURUM[s.kurum].seviyeler.includes(s.seviye)) s.seviye = ''; }
    else if (t.id === 'sSeviye') s.seviye = t.value;
    else if (t.id === 'anahtarDosya') { if (t.files[0]) anahtarIceAktar(s, t.files[0]); return; }
    else if (t.dataset.q !== undefined) {
      const q = s.sorular[+t.dataset.q];
      const f = t.dataset.f;
      if (f === 'kazanim') {
        const v = t.value.trim();
        if (!v) q.kazanimId = '';
        else {
          const k = sinavKazanimlari(s).find(k => kazanimEtiket(k) === v) || kazanimBulKodVeyaMetin(v, q.ders);
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
      analizSecim.kazanimlar = null; cizAnaliz();
    } else if (t.dataset.anKz) {
      t.checked ? analizSecim.kazanimlar.add(t.dataset.anKz) : analizSecim.kazanimlar.delete(t.dataset.anKz);
    }
  });
  $('#analizAlan').addEventListener('click', e => {
    const o = ogrenciBul(filtre.anOgrenci);
    if (e.target.id === 'kzHepsi') { analizSecim.kazanimlar = null; cizAnaliz(); }
    else if (e.target.id === 'kzHicbiri') { analizSecim.kazanimlar = new Set(); cizAnaliz(); }
    else if (e.target.id === 'btnPlanHazirla') planDialog(o);
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
    else if (e.target.id === 'btnOrnekSil') onayla('Örnek veriler ve şu ana kadar girilen her şey silinsin mi?', ornekVeriSil);
  });

  // Ayarlar
  $('#btnYedekAl').onclick = () => indir(new Blob([JSON.stringify(S)], { type: 'application/json' }), `kazanim_takip_yedek_${bugun()}.json`);
  $('#yedekDosya').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const v = JSON.parse(await f.text());
      if (!v || !Array.isArray(v.ogrenciler) || !Array.isArray(v.kazanimlar)) throw new Error('biçim');
      onayla('Mevcut tüm veriler yedektekiyle değiştirilsin mi?', () => { S = { ...bosDurum(), ...v }; kaydet(); ciz(); toast('Yedek geri yüklendi.'); });
    } catch (err) { toast('Yedek dosyası okunamadı.'); }
  });
  $('#btnTumExcel').onclick = tumExcel;
  $('#btnDersKaydet').onclick = () => {
    S.dersler = [...new Set($('#dersListesi').value.split(',').map(x => x.trim()).filter(Boolean))];
    kaydet(); toast('Ders listesi kaydedildi.');
  };
  $('#btnHepsiniSil').onclick = () => onayla('TÜM veriler (öğrenciler, kazanımlar, sınavlar, sonuçlar, planlar) silinsin mi? Önce yedek almanız önerilir.', () => {
    S = bosDurum(); kaydet(); ciz(); toast('Tüm veriler silindi.');
  });
}

// ---------------------------------------------------------------------------
// Başlat
// ---------------------------------------------------------------------------
(async function baslat() {
  const v = await yukle();
  S = v ? { ...bosDurum(), ...v } : bosDurum();
  olaylar();
  ciz();
})();
