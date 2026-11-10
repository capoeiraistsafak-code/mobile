// TYT · Isı ve Sıcaklık · SORU ÇÖZÜMÜ ("5 Dakikada TYT" motoru + Soru Videosu 2. Format) · BEYAZ TEST KAĞIDI
// Konu anlatımındaki 8 konunun her birinden bir TYT test sorusu. Kamera sayfadan sayfaya uzaklaşıp yakınlaşır.
// Her sayfa: soru kökü fosforla okunur → sahne animasyonu → kalem şekil üzerinde işaretler ve çözümü yazar (not kendi animasyonunun altında)
// → kalem doğru şıkkın etrafına kırmızı kutu çizer, şık büyüyüp parlar, "Cevap" + ✓. Sesler konu videosundaki gibi (kalem, çizgi, ✓, geçiş).

document.head.insertAdjacentHTML('beforeend', `<style>
.sk{display:grid;grid-template-columns:repeat(3,1fr);gap:1px 6px;margin-top:6px;font:14.5px/1.35 "Noto Serif",serif}
.sk.c1{grid-template-columns:1fr}
.sk>span{padding:1px 6px;border-radius:7px;border:2px solid transparent}
.sk>span>b{color:#D62828!important;font-family:Inter;font-weight:800;margin-right:3px}
.koyu .bx{color:#f87171;border-color:#f87171}
.hk-kart{position:absolute;width:440px;height:200px;border-radius:26px;background:#2a303c;border:4px solid #475569;opacity:0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;transform-origin:50% 50%}
.hk-kart .yz{display:flex;flex-direction:column;align-items:center;gap:8px}
.hk-kart .ik{font-family:"Noto Color Emoji";font-size:64px;line-height:1}
.hk-kart .ad{font:800 38px Inter;color:#e5e7eb;white-space:nowrap}
.hk-kart .ar{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;opacity:0}
.hk-kart .sn{font:900 50px Inter;color:#F5C400}
.hk-kart .op{display:flex;gap:12px}
.hk-kart .op i{width:46px;height:46px;border-radius:50%;border:3px solid #94a3b8;font:800 24px/40px Inter;font-style:normal;color:#cbd5e1;text-align:center}
.hk-alt{position:absolute;left:0;right:0;top:1030px;text-align:center;font:900 64px Inter;color:#fff;opacity:0}
.hk-alt b{color:#1f232c;background:#F5C400;padding:0 14px;border-radius:14px}
</style>`);

// ---------- yardımcılar ----------
const T = (id, x, y, txt, col = '#16181D', sz = 15, extra = '') => `<text id="${id}" x="${x}" y="${y}" font-family="Inter" font-weight="800" font-size="${sz}" fill="${col}" ${extra}>${txt}</text>`;
const KS = (pay, payda) => `<span class="ks"><span>${pay}</span><span>${payda}</span></span>`;
const TN = (p, n, x0, y0, w, h, col, r = 6) => Array.from({length: n}, (_, i) => {
  const cx = x0 + 22 + (i % 5) * (w - 44) / 4, cy = y0 + 22 + Math.floor(i / 5) * (h - 44) / Math.max(1, Math.ceil(n / 5) - 1);
  return `<circle id="${p}${i}" data-x="${cx}" data-y="${cy}" cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; }).join('');
const titre = (p, n, t, A, w) => { for (let i = 0; i < n; i++) { const e = $(p + i); if (!e) continue; const x = +e.dataset.x, y = +e.dataset.y;
  e.setAttribute('cx', x + A * Math.sin(t * w + i * 1.7)); e.setAttribute('cy', y + A * Math.cos(t * w * 1.3 + i * 2.3)); } };
const TERMO = (id, x, top, alt, col = '#ef4444') => `<rect x="${x - 9}" y="${top}" width="18" height="${alt - top}" rx="9" fill="#f1f5f9" stroke="#475569" stroke-width="2.5"/>
  <circle cx="${x}" cy="${alt + 8}" r="15" fill="${col}" stroke="#475569" stroke-width="2.5"/><rect id="${id}" x="${x - 4.5}" y="${alt}" width="9" height="0" fill="${col}"/>`;
const termo = (id, alt, h) => { at(id, 'y', alt - h); at(id, 'height', h + 4); };
// beher (kap) + içindeki sıvı
const BEHER = (p, x, y, w, h, sv, col) => `<path d="M${x} ${y} v${h - 14} q0 14 14 14 h${w - 28} q14 0 14 -14 v-${h - 14}" fill="none" stroke="#475569" stroke-width="3"/>
  <rect id="${p}s" x="${x + 4}" y="${y + h - sv}" width="${w - 8}" height="${sv - 4}" rx="10" fill="${col}" opacity=".85"/>`;
const ALEV = (id, x, y) => `<g id="${id}" opacity="0" transform="translate(${x} ${y})"><path d="M0 0 q-14 -18 0 -38 q14 20 0 38z" fill="#f97316"/><path d="M0 0 q-7 -10 0 -22 q7 12 0 22z" fill="#fde047"/></g>`;
const alev = (id, x, y, s, t) => { at(id, 'opacity', s); at(id, 'transform', `translate(${x} ${y}) scale(${(0.6 + 0.4 * s) * (1 + 0.08 * Math.sin(t * 17))})`); };
const S = {};   // sayfalar arası durum (adım → late)

// şıklar: 'ABCDE' sırasıyla; kol = sütun sayısı
const SK = (i, ops, kol = 3) => `<div class="sk${kol === 1 ? ' c1' : ''}">${ops.map((o, j) => `<span id="p${i}o${'ABCDE'[j]}"><b>${'ABCDE'[j]})</b>${o}</span>`).join('')}</div>`;
// kalemle şekil üzerine işaret (alt çizgi, ışın, grafik): motorun kalemi çizer, çizgi sesi çıkar
const MARK = (o, x1, y1, x2, y2, col = '#1D3FB8', w = 3, id = '') => PL(o, x1, y1, x2, y2, `${id ? `id="${id}" ` : ''}style="stroke:${col};stroke-width:${w}"`);
// doğru şıkkın etrafına kalemle kırmızı kutu (Soru Videosu 2. Format): 4 kenar, o0 … o0+3
const KUTU = (i, o0) => `<svg width="441" height="640" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">${[0, 1, 2, 3].map(k =>
  PL(o0 + k, 0, 0, 0, 0, `id="p${i}b${k}" style="stroke:#D62828;stroke-width:3.5"`)).join('')}</svg>`;
const kutuKur = (i, h) => { const e = $(`p${i}o${h}`), x = e.offsetLeft - 4, y = e.offsetTop - 3, w = e.offsetWidth + 8, hh = e.offsetHeight + 6;
  [[x, y, x + w, y], [x + w, y, x + w, y + hh], [x + w, y + hh, x, y + hh], [x, y + hh, x, y]].forEach((q, k) => {
    const l = $(`p${i}b${k}`); ['x1', 'y1', 'x2', 'y2'].forEach((a, j) => l.setAttribute(a, q[j])); }); };
// kutu kapanınca doğru şık büyüyüp parlar
const kutuIsik = (i, h) => { const k = drawnK(`p${i}b3`), e = $(`p${i}o${h}`);
  e.style.background = `rgba(214,40,40,${0.10 * k})`; e.style.transform = `scale(${1 + 0.1 * Math.sin(Math.PI * k)})`; };
const CEVAP = (o, h, x, y) => H(o, `Cevap: <span class="bx">${h}</span> ` + CK, x, y, 'cevap');

// bimetal şerit: k = 0 (düz) … 1 (en çok bükülmüş); bakır dışta (üstte), aşağı bükülür
const bimetalYol = (k, off) => { const L = 320, kap = 0.0042 * k, n = 32; let d = '';
  for (let j = 0; j <= n; j++) { const u = L * j / n, th = kap * u; const x = kap ? Math.sin(th) / kap : u, y = kap ? (1 - Math.cos(th)) / kap : 0;
    d += (j ? 'L' : 'M') + (40 + x - off * Math.sin(th)).toFixed(1) + ' ' + (60 + y + off * Math.cos(th)).toFixed(1) + ' '; } return d; };
const bimetal = k => { at('p7u', 'd', bimetalYol(k, -4.5)); at('p7a', 'd', bimetalYol(k, 4.5)); };
const bimetalUc = k => { const kap = 0.0042 * k, th = kap * 320; return [40 + Math.sin(th) / kap, 60 + (1 - Math.cos(th)) / kap]; };

window.KONU = {
  meta: {satir: 670, sinif: 'TYT', ust1: '5 DAKİKADA TYT', ust2: 'TYT FİZİK', baslik: 'Isı ve Sıcaklık', unite: 'Isı ve Sıcaklık', kazanim: 'TYT',
    tur: 'SORU ÇÖZÜMÜ', adim: 'SORU', bitti: '8 SORU TAMAM',
    kapakAlt: '8 konu · 8 soru · animasyonlu çözüm', sonraki: 'Elektrostatik', kanca: 'Haydi şimdi SORU çözelim!',
    hookBaslik: 'ISI VE SICAKLIK', introSure: 8.2},
  P: [
  // 1 · Isı ve Sıcaklık · metal ve tahta kaşık ------------------------------------
  {konu: 'Isı ve Sıcaklık',
   html: `<span class="qt">Ece, uzun süredir aynı mutfakta duran metal ve tahta kaşıklara aynı anda dokunuyor ve metal kaşığı daha soğuk hissediyor.<br>Buna göre,<br>
     I. Kaşıkların sıcaklıkları eşittir.<br>II. Metal kaşık, elden birim zamanda daha çok ısı alır.<br>III. Tahta kaşığın sıcaklığı metal kaşığınkinden büyüktür.<br>
     yargılarından hangileri doğrudur?</span>` +
    SK(0, ['Yalnız I', 'Yalnız III', 'I ve II', 'II ve III', 'I, II ve III'], 1) +
    SCENE(392, 152, `<line x1="0" y1="128" x2="441" y2="128" stroke="#94a3b8" stroke-width="3"/>
      <g><ellipse cx="62" cy="112" rx="34" ry="12" fill="#cbd5e1" stroke="#475569" stroke-width="2"/><rect x="94" y="108" width="100" height="8" rx="4" fill="#cbd5e1" stroke="#475569" stroke-width="2"/></g>
      <g><ellipse cx="282" cy="112" rx="34" ry="12" fill="#d6a85c" stroke="#92400e" stroke-width="2"/><rect x="314" y="108" width="100" height="8" rx="4" fill="#d6a85c" stroke="#92400e" stroke-width="2"/></g>
      ${T('p0a', 30, 146, 'Metal: 22 °C', '#16181D', 14)}${T('p0b', 250, 146, 'Tahta: 22 °C', '#16181D', 14)}
      ${Array.from({length: 6}, (_, i) => `<circle id="p0m${i}" cx="${52 + (i % 3) * 10}" cy="60" r="4" fill="#ef4444" opacity="0"/>`).join('')}
      ${Array.from({length: 2}, (_, i) => `<circle id="p0w${i}" cx="${276 + i * 10}" cy="60" r="4" fill="#ef4444" opacity="0"/>`).join('')}
      ${T('p0s', 110, 70, 'brr… soğuk!', '#1D4ED8', 15, 'opacity="0"')}${T('p0n', 330, 70, 'normal', '#92400e', 15, 'opacity="0"')}` +
      MARK(1, 76, 151, 120, 151) + MARK(2, 296, 151, 340, 151), false,
      EM('p0h1', '👇', 40, -20, 40, 'opacity:0') + EM('p0h2', '👇', 260, -20, 40, 'opacity:0')) +
    H(3, 'I. Aynı ortam → sıcaklıklar eşit ✓', 0, 548, 'ortam') + H(4, 'II. Metal iyi iletken → ısıyı hızlı alır ✓', 0, 580, 'iletken') +
    H(5, 'III. Sıcaklıklar eşit ✗', 0, 612, 'eşit') + KUTU(0, 6) + CEVAP(10, 'C', 250, 612),
   init: () => kutuKur(0, 'C'),
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0, 0.9)); st('p0h1', {opacity: prog(s, 0, 0.3), top: (-20 + 34 * k) + 'px'}); st('p0h2', {opacity: prog(s, 0, 0.3), top: (-20 + 34 * k) + 'px'});
       S.p0 = prog(s, 0.9, 1.2); at('p0s', 'opacity', prog(s, 1.6, 2.0)); at('p0n', 'opacity', prog(s, 1.6, 2.0)); }},
     {d: 0.6, o: [1, 2, 3, 4], f: () => {}},
     {d: 0.6, o: [5], f: () => {}},
     {d: 0.6, o: [6, 7, 8, 9, 10], f: () => {}},
   ],
   late: time => { kutuIsik(0, 'C'); const a = S.p0 || 0;
     for (let i = 0; i < 6; i++) { const f = (time * 1.6 + i / 6) % 1; at('p0m' + i, 'cy', 60 + 42 * f); at('p0m' + i, 'opacity', a * (1 - f * 0.6)); }
     for (let i = 0; i < 2; i++) { const f = (time * 0.4 + i / 2) % 1; at('p0w' + i, 'cy', 60 + 42 * f); at('p0w' + i, 'opacity', a * (1 - f * 0.6)); } }},

  // 2 · Ölçme · çaydanlık ve bardak ------------------------------------------------
  {konu: 'Ölçme',
   html: `<span class="qt">Bir çaydanlıktaki 1 kg su ile bir bardaktaki 0,2 kg suyun sıcaklıkları termometreyle ölçülüyor ve ikisi de 90 °C bulunuyor.<br>Buna göre,<br>
     I. Suların sıcaklıkları eşittir.<br>II. Suların iç enerjileri eşittir.<br>III. Termometreyle ölçülen büyüklük, suyun içerdiği ısıdır.<br>
     yargılarından hangileri doğrudur?</span>` +
    SK(1, ['Yalnız I', 'Yalnız II', 'I ve II', 'II ve III', 'I, II ve III'], 1) +
    SCENE(392, 156, `<path d="M20 150 h140 q4 -78 -70 -86 q-74 8 -70 86z" fill="#94a3b8" stroke="#475569" stroke-width="2.5"/>
      <path d="M150 112 q30 -6 42 -34" fill="none" stroke="#475569" stroke-width="9" stroke-linecap="round"/><rect x="74" y="56" width="32" height="10" rx="5" fill="#475569"/>
      <path d="M220 74 h70 l-8 76 h-54z" fill="#bfdbfe" stroke="#475569" stroke-width="2.5"/>` +
      TERMO('p1t1', 60, 0, 108) + TERMO('p1t2', 255, 0, 108) +
      T('p1a', 74, 30, '', '#D62828', 15) + T('p1b', 268, 30, '', '#D62828', 15) + T('p1m1', 66, 140, '1 kg', '#fff', 15) + T('p1m2', 236, 140, '0,2 kg', '#1D3FB8', 13) +
      `<rect id="p1e1" x="330" y="150" width="34" height="0" fill="#f59e0b"/><rect id="p1e2" x="384" y="150" width="34" height="0" fill="#f59e0b"/>
       <line x1="320" y1="150" x2="430" y2="150" stroke="#16181D" stroke-width="2"/>` + T('p1et', 330, 14, 'İç enerji', '#16181D', 14), false) +
    H(1, 'I. İkisi de 90 °C ✓', 0, 552, 'ikisi') + H(2, 'II. Kütle büyük → iç enerji büyük ✗', 0, 584, 'kütle') +
    H(3, 'III. Termometre sıcaklığı ölçer ✗', 0, 616, 'sıcaklığı') + KUTU(1, 4) + CEVAP(8, 'A', 300, 616) + MARK(9, 0, 0, 0, 0),
   init: () => { termo('p1t1', 108, 8); termo('p1t2', 108, 8); kutuKur(1, 'A'); },
   steps: [
     {d: 3.4, o: [], f: s => { const k = ease(prog(s, 0, 1.8)); termo('p1t1', 108, 8 + 72 * k); termo('p1t2', 108, 8 + 72 * k);
       $('p1a').textContent = s > 0.1 ? Math.round(20 + 70 * k) + ' °C' : ''; $('p1b').textContent = s > 0.1 ? Math.round(20 + 70 * k) + ' °C' : '';
       const e = ease(prog(s, 1.8, 3.2)); at('p1e1', 'y', 150 - 120 * e); at('p1e1', 'height', 120 * e); at('p1e2', 'y', 150 - 24 * e); at('p1e2', 'height', 24 * e); }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3], f: () => {}},
     {d: 0.6, o: [4, 5, 6, 7, 8], f: () => {}},
   ],
   late: () => kutuIsik(1, 'A')},

  // 3 · Termometreler · öğrencinin X termometresi --------------------------------
  {konu: 'Termometreler',
   html: `<span class="qt">Bir öğrenci yaptığı X termometresinde buzun erime noktasını 20, suyun kaynama noktasını 120 olarak işaretliyor. Isıtılan su, Celsius termometresinde 30 °C'yi gösterdiği anda X termometresi kaç °X'i gösterir?</span>` +
    SK(2, ['40', '50', '60', '70', '80'], 1) +
    SCENE(262, 190, BEHER('p2k', 110, 40, 220, 110, 80, '#bfdbfe') +
      `<rect id="p2i1" x="150" y="94" width="26" height="22" rx="4" fill="#f8fafc" stroke="#93c5fd" stroke-width="2"/><rect id="p2i2" x="262" y="100" width="24" height="20" rx="4" fill="#f8fafc" stroke="#93c5fd" stroke-width="2"/>
       <rect x="120" y="166" width="200" height="12" rx="5" fill="#64748b"/>` + ALEV('p2f1', 180, 166) + ALEV('p2f2', 260, 166) +
      TERMO('p2x', 190, 0, 130, '#2563eb') + TERMO('p2c', 250, 0, 130) +
      T('p2xn', 146, 12, 'X', '#2563eb', 17) + T('p2cn', 268, 12, '°C', '#D62828', 15) +
      T('p2xa', 150, 136, '20', '#2563eb', 12) + T('p2xb', 144, 34, '120', '#2563eb', 12) + T('p2ca', 266, 136, '0', '#D62828', 12) + T('p2cb', 266, 34, '100', '#D62828', 12) +
      T('p2xv', 92, 0, '', '#2563eb', 16) + T('p2cv', 280, 0, '', '#D62828', 16) + MARK(1, 120, 100, 320, 100, '#B45309', 2.5), false) +
    H(2, KS('X − 20', '100'), 140, 456, 'iks') + H(3, '=', 222, 468, 'eşittir') + H(4, KS('30', '100'), 244, 456, 'otuz') +
    H(5, 'X − 20 = 30  →  X = 50 °X', 0, 520, 'elli') + KUTU(2, 6) + CEVAP(10, 'B', 0, 562),
   init: () => { termo('p2x', 130, 6); termo('p2c', 130, 6); kutuKur(2, 'B'); },
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.4, 3.2)); alev('p2f1', 180, 166, prog(s, 0, 0.4), s); alev('p2f2', 260, 166, prog(s, 0, 0.4), s + 1);
       at('p2i1', 'opacity', 1 - prog(s, 0.4, 1.6)); at('p2i2', 'opacity', 1 - prog(s, 0.6, 1.8)); const h = 6 + 30 * k;
       termo('p2x', 130, h); termo('p2c', 130, h); $('p2xv').textContent = s > 0.3 ? Math.round(20 + 30 * k) + ' °X' : ''; $('p2cv').textContent = s > 0.3 ? Math.round(30 * k) + ' °C' : '';
       at('p2xv', 'y', 130 - h + 5); at('p2cv', 'y', 130 - h + 5); at('p2ks', 'fill', k > 0.5 ? '#93c5fd' : '#bfdbfe'); }},
     {d: 0.6, o: [1, 2, 3, 4], f: () => {}},
     {d: 0.6, o: [5], f: () => {}},
     {d: 0.6, o: [6, 7, 8, 9, 10], f: () => {}},
   ],
   late: () => kutuIsik(2, 'B')},

  // 4 · Öz Isı · K, L, M sıvıları ve grafik -------------------------------------
  {konu: 'Öz Isı',
   html: `<span class="qt">Eşit kütleli K, L ve M sıvıları özdeş ısıtıcılarla eşit süre ısıtılıyor. Sıvıların sıcaklık-zaman grafiği şekildeki gibidir.<br>
     Buna göre, sıvıların öz ısıları c<sub>K</sub>, c<sub>L</sub> ve c<sub>M</sub> arasındaki ilişki nedir?</span>` +
    SK(3, ['c<sub>K</sub> > c<sub>L</sub> > c<sub>M</sub>', 'c<sub>L</sub> > c<sub>K</sub> > c<sub>M</sub>', 'c<sub>M</sub> > c<sub>L</sub> > c<sub>K</sub>',
      'c<sub>K</sub> = c<sub>L</sub> > c<sub>M</sub>', 'c<sub>M</sub> > c<sub>K</sub> > c<sub>L</sub>'], 1) +
    SCENE(262, 200, ['K', 'L', 'M'].map((h, j) => BEHER('p3' + h, 8 + j * 58, 70, 48, 60, 44, '#93c5fd') + `<rect x="${10 + j * 58}" y="150" width="44" height="8" rx="3" fill="#64748b"/>` +
        ALEV('p3f' + j, 32 + j * 58, 150) + T('p3n' + j, 26 + j * 58, 62, h, '#16181D', 15)).join('') +
      `<line x1="200" y1="180" x2="432" y2="180" stroke="#16181D" stroke-width="2.5"/><line x1="200" y1="186" x2="200" y2="8" stroke="#16181D" stroke-width="2.5"/>
       <polygon points="432,180 422,175 422,185" fill="#16181D"/><polygon points="200,8 195,18 205,18" fill="#16181D"/>
       <text class="ax" x="388" y="198">zaman</text><text class="ax" x="206" y="16">T (°C)</text>` +
      MARK(1, 200, 160, 400, 40, '#D62828', 3.5, 'p3g0') + MARK(2, 200, 160, 400, 80, '#B45309', 3.5, 'p3g1') + MARK(3, 200, 160, 400, 120, '#1D4ED8', 3.5, 'p3g2') +
      T('p3lK', 406, 40, 'K', '#D62828', 15) + T('p3lL', 406, 84, 'L', '#B45309', 15) + T('p3lM', 406, 124, 'M', '#1D4ED8', 15), false) +
    H(4, 'Q ve m eşit  →  c · ΔT eşit', 0, 486, 'eşit') + H(5, 'ΔT: K > L > M  →  c: M > L > K', 0, 522, 'büyük') +
    KUTU(3, 6) + CEVAP(10, 'C', 0, 562),
   init: () => { kutuKur(3, 'C'); ['p3lK', 'p3lL', 'p3lM'].forEach(id => at(id, 'opacity', 0)); },
   steps: [
     {d: 3.2, o: [], f: s => { const k = ease(prog(s, 0.3, 3.0)); ['K', 'L', 'M'].forEach((h, j) => { alev('p3f' + j, 32 + j * 58, 150, prog(s, 0, 0.4), s + j);
       at('p3' + h + 's', 'fill', k > [0.3, 0.5, 0.8][j] ? ['#f87171', '#fb923c', '#fcd34d'][j] : '#93c5fd'); }); }},
     {d: 0.6, o: [1, 2, 3], f: () => {}},
     {d: 0.6, o: [4, 5], f: () => {}},
     {d: 0.6, o: [6, 7, 8, 9, 10], f: () => {}},
   ],
   late: () => { kutuIsik(3, 'C'); ['p3lK', 'p3lL', 'p3lM'].forEach((id, j) => at(id, 'opacity', prog(drawnK('p3g' + j), 0.8, 1))); }},

  // 5 · Hal Değişimi · buzlu bardakta damlacıklar ---------------------------------
  {konu: 'Hal Değişimi',
   html: `<span class="qt">Aşağıdaki olayların hangisinde madde, çevresine ısı verir?</span>` +
    SK(4, ['Kolonyanın elde buharlaşması', 'Buzun erimesi', 'Islak çamaşırın kuruması',
      'Buzlu bardağın dış yüzeyinde su damlacıklarının oluşması', 'Naftalinin süblimleşmesi'], 1) +
    SCENE(196, 210, `<path d="M150 40 h130 l-14 150 h-102z" fill="#f0f9ff" stroke="#475569" stroke-width="3"/>
      <path d="M156 80 h118 l-10 106 h-98z" fill="#fde68a" opacity=".85"/>
      <rect x="180" y="86" width="26" height="24" rx="4" fill="#f8fafc" stroke="#93c5fd" stroke-width="2" transform="rotate(-12 193 98)"/>
      <rect x="226" y="98" width="26" height="24" rx="4" fill="#f8fafc" stroke="#93c5fd" stroke-width="2" transform="rotate(10 239 110)"/>
      ${Array.from({length: 10}, (_, i) => `<circle id="p4v${i}" cx="0" cy="0" r="4" fill="#94a3b8" opacity="0"/>`).join('')}
      ${Array.from({length: 10}, (_, i) => `<ellipse id="p4d${i}" cx="${i % 2 ? 279 - (i * 3) % 10 : 152 + (i * 3) % 10}" cy="${60 + i * 12}" rx="3.5" ry="5" fill="#3b82f6" opacity="0"/>`).join('')}
      ${T('p4a', 4, 30, 'su buharı', '#64748b', 14)}${T('p4b', 330, 140, 'su damlası', '#1D4ED8', 14)}${ARR('p4o', '#D62828')}` +
      MARK(1, 328, 147, 404, 147), false) +
    H(2, 'Yoğuşma: buhar → sıvı, ısı verir ✓', 0, 426, 'yoğuşma') + H(3, 'Buharlaşma, erime, süblimleşme: ısı alır', 0, 462, 'alır') +
    KUTU(4, 4) + CEVAP(8, 'D', 0, 506),
   init: () => kutuKur(4, 'D'),
   steps: [
     {d: 3.6, o: [], f: s => { S.p4 = s; const k = ease(prog(s, 2.0, 2.6)); arr('p4o', 300, 120, 300 - 12 * k, 120, k > 0 ? 1 : 0, 'ısı verir', 40, -12); }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3], f: () => {}},
     {d: 0.6, o: [4, 5, 6, 7, 8], f: () => {}},
   ],
   late: time => { kutuIsik(4, 'D'); const s = S.p4 || 0;
     for (let i = 0; i < 10; i++) { const left = i % 2 === 0, f = (time * 0.5 + i / 10) % 1, y = 50 + (i * 14) % 130;
       at('p4v' + i, 'cx', left ? 20 + 125 * f : 420 - 128 * f); at('p4v' + i, 'cy', y + 4 * Math.sin(time * 3 + i)); at('p4v' + i, 'opacity', prog(s, 0, 0.5) * (1 - f));
       at('p4d' + i, 'opacity', prog(s, 0.6 + i * 0.12, 0.9 + i * 0.12)); } }},

  // 6 · Isıl Denge · çay ve kaşık --------------------------------------------------
  {konu: 'Isıl Denge',
   html: `<span class="qt">Isıca yalıtılmış bir ortamda 80 °C'deki çayın içine 20 °C'deki metal kaşık konuyor. Isıl denge sağlanıncaya kadar,<br>
     I. Çayın sıcaklığı azalır.<br>II. Kaşığın aldığı ısı, çayın verdiği ısıya eşittir.<br>III. Denge anında çay ile kaşığın sıcaklıkları eşittir.<br>
     yargılarından hangileri doğrudur?</span>` +
    SK(5, ['Yalnız I', 'Yalnız III', 'I ve II', 'II ve III', 'I, II ve III'], 1) +
    SCENE(318, 165, `<defs><linearGradient id="p5gr" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f97316"/><stop id="p5st" offset="0" stop-color="#f97316"/><stop id="p5st2" offset="0" stop-color="#94a3b8"/></linearGradient></defs>
      <path d="M120 30 q-12 50 14 66 q-24 22 -12 66 h84 q12 -44 -12 -66 q26 -16 14 -66z" fill="#b45309" fill-opacity=".85" stroke="#475569" stroke-width="2.5"/>
      <rect x="112" y="162" width="104" height="8" rx="3" fill="#94a3b8"/>
      <line x1="180" y1="140" x2="262" y2="6" stroke="url(#p5gr)" stroke-width="7" stroke-linecap="round"/>
      <g id="p5b" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"><path d="M140 22 q-8 -10 0 -20"/><path d="M160 22 q-8 -10 0 -20"/></g>
      ${T('p5c', 290, 70, 'Çay: 80 °C', '#b45309', 16)}${T('p5k', 290, 110, 'Kaşık: 20 °C', '#475569', 16)}${ARR('p5o', '#D62828')}` +
      MARK(1, 330, 76, 382, 76) + MARK(2, 346, 116, 398, 116), false) +
    H(3, 'I. Çay ısı verir, soğur ✓', 0, 500, 'soğur') + H(4, 'II. Yalıtılmış: Q<sub>verilen</sub> = Q<sub>alınan</sub> ✓', 0, 536, 'yalıtılmış') +
    H(5, 'III. Dengede sıcaklıklar eşit ✓', 0, 572, 'dengede') + KUTU(5, 6) + CEVAP(10, 'E', 260, 572),
   init: () => kutuKur(5, 'E'),
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.6, 3.4)); const a = ease(prog(s, 0.2, 0.7)); arr('p5o', 196, 120, 196 + 36 * a, 120 - 50 * a, a > 0 ? 1 : 0, 'ısı', -10, -6);
       at('p5st', 'offset', 0.15 + 0.85 * k); at('p5st2', 'offset', 0.2 + 0.8 * k);
       $('p5c').textContent = 'Çay: ' + Math.round(80 - 5 * k) + ' °C'; $('p5k').textContent = 'Kaşık: ' + Math.round(20 + 55 * k) + ' °C'; }},
     {d: 0.6, o: [1, 2, 3], f: () => {}},
     {d: 0.6, o: [4, 5], f: () => {}},
     {d: 0.6, o: [6, 7, 8, 9, 10], f: () => {}},
   ],
   late: time => { kutuIsik(5, 'E'); at('p5b', 'transform', `translate(0,${-6 * ((time * 0.8) % 1)})`); at('p5b', 'opacity', 0.6 + 0.4 * Math.sin(time * 3)); }},

  // 7 · Isı Aktarımı · termos ----------------------------------------------------
  {konu: 'Isı Aktarımı',
   html: `<span class="qt">Termosun iç ve dış cidarları arasındaki bölmenin havası boşaltılarak vakum oluşturulmuştur.<br>
     Buna göre, bu vakumlu bölme ısının hangi yolla ya da yollarla aktarılmasını engeller?</span>` +
    SK(6, ['Yalnız iletim', 'Yalnız ışıma', 'İletim ve konveksiyon', 'Konveksiyon ve ışıma', 'İletim, konveksiyon ve ışıma'], 1) +
    SCENE(304, 196, `<rect x="110" y="20" width="200" height="170" rx="22" fill="#e2e8f0" stroke="#475569" stroke-width="3"/>
      <rect x="128" y="36" width="164" height="140" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4"/>
      <rect x="144" y="50" width="132" height="114" rx="12" fill="#78350f" stroke="#9ca3af" stroke-width="7"/>
      <rect x="150" y="6" width="120" height="22" rx="6" fill="#475569"/>
      ${Array.from({length: 7}, (_, i) => `<circle id="p6p${i}" cx="210" cy="110" r="5" fill="#fb923c"/>`).join('')}
      <g id="p6r" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round" opacity="0"><path d="M210 80 l40 -14"/><path d="M250 66 l-26 -10"/></g>
      ${T('p6v', 328, 60, 'vakum', '#1D4ED8', 16)}${T('p6g', 328, 150, 'gümüş yüzey', '#475569', 14)}` +
      MARK(1, 326, 54, 286, 44) + MARK(2, 328, 67, 380, 67), false) +
    H(3, 'Vakumda tanecik yok:', 0, 512, 'tanecik') + H(4, '→ iletim ve konveksiyon olmaz ✓', 190, 512, 'olmaz') +
    H(5, 'Işıma boşlukta da olur → gümüş yüzey yansıtır', 0, 548, 'yansıtır') + KUTU(6, 6) + CEVAP(10, 'C', 0, 586),
   init: () => kutuKur(6, 'C'),
   steps: [
     {d: 3.6, o: [], f: s => { S.p6 = prog(s, 0, 0.4); at('p6r', 'opacity', prog(s, 2.0, 2.4)); }},
     {d: 0.6, o: [1, 2, 3, 4], f: () => {}},
     {d: 0.6, o: [5], f: () => {}},
     {d: 0.6, o: [6, 7, 8, 9, 10], f: () => {}},
   ],
   late: time => { kutuIsik(6, 'C'); const a = S.p6 || 0;
     for (let i = 0; i < 7; i++) { const ang = i * 0.9 + time * (0.8 + i * 0.1); const R = 52 * Math.abs(Math.sin(time * 1.7 + i));   // duvara çarpar, geri döner
       at('p6p' + i, 'cx', 210 + Math.cos(ang) * R); at('p6p' + i, 'cy', 107 + Math.sin(ang) * R * 0.85); at('p6p' + i, 'opacity', a); } }},

  // 8 · Genleşme · bimetal şerit -------------------------------------------------
  {konu: 'Genleşme',
   html: `<span class="qt">Bakır ve demir şeritlerin birbirine perçinlenmesiyle yapılan bimetal şerit ısıtılınca, bakır şerit dış tarafta kalacak biçimde bükülüyor.<br>Buna göre,<br>
     I. Bakırın boyca uzama katsayısı demirinkinden büyüktür.<br>II. Isıtılınca demir şerit, bakır şeritten daha çok uzar.<br>III. Bimetal şeritler, ütü ve fırın termostatlarında kullanılır.<br>
     yargılarından hangileri doğrudur?</span>` +
    SK(7, ['Yalnız I', 'Yalnız II', 'I ve II', 'I ve III', 'II ve III'], 1) +
    SCENE(340, 150, `<rect x="10" y="30" width="30" height="60" fill="#64748b"/>
      <line x1="40" y1="60" x2="360" y2="60" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 5"/>
      <path id="p7u" fill="none" stroke="#f97316" stroke-width="9"/><path id="p7a" fill="none" stroke="#6b7280" stroke-width="9"/>
      ${T('p7un', 44, 44, 'bakır', '#c2410c', 13)}${T('p7an', 44, 86, 'demir', '#374151', 13)}` +
      ALEV('p7f1', 140, 140) + ALEV('p7f2', 240, 140) + MARK(1, 360, 60, 360, 60, '#1D3FB8', 3, 'p7e'), false) +
    H(2, 'I. Dışta kalan daha çok uzar → λ<sub>bakır</sub> > λ<sub>demir</sub> ✓', 0, 500, 'dışta') +
    H(3, 'II. Demir daha az uzar ✗', 0, 536, 'demir') + H(4, 'III. Termostat ✓', 0, 572, 'termostat') + KUTU(7, 5) + CEVAP(9, 'D', 200, 572),
   init: () => { kutuKur(7, 'D'); bimetal(0); const e = bimetalUc(1); at('p7e', 'x2', e[0]); at('p7e', 'y2', e[1]); },
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.4, 3.4)); alev('p7f1', 140, 140, prog(s, 0, 0.4), s); alev('p7f2', 240, 140, prog(s, 0, 0.4), s + 1); bimetal(k); }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3, 4], f: () => {}},
     {d: 0.6, o: [5, 6, 7, 8, 9], f: () => {}},
   ],
   late: () => kutuIsik(7, 'D')},
  ]};

// ---------- giriş: konu anlatımındaki 8 konu kartı → her biri bir test sorusuna döner ----------
(function () {
  const K = [['🔥', 'Isı ve Sıcaklık'], ['🌡️', 'Ölçme'], ['📏', 'Termometreler'], ['☀️', 'Öz Isı'],
             ['🧊', 'Hal Değişimi'], ['⚖️', 'Isıl Denge'], ['♨️', 'Isı Aktarımı'], ['🚆', 'Genleşme']];   // cevaplar girişte gösterilmez
  KONU.hook = {
    soru: 'Konuyu anlattık… Haydi şimdi SORU çözelim!',
    html: K.map(([ik, ad], i) => `<div class="hk-kart" id="hkk${i}" style="left:${80 + (i % 2) * 480}px;top:${40 + Math.floor(i / 2) * 240}px">
        <div class="yz"><span class="ik">${ik}</span><span class="ad">${ad}</span></div>
        <div class="ar"><span class="sn">SORU ${i + 1}</span><span class="op">${'ABCDE'.split('').map(h => `<i>${h}</i>`).join('')}</span></div></div>`).join('') +
      `<div class="hk-alt" id="hkAlt">8 KONU · <b>8 SORU</b></div>`,
    f: t => {
      K.forEach((_, i) => {
        const e = $('hkk' + i), a = prog(t, 0.7 + i * 0.22, 1.05 + i * 0.22);
        const fl = prog(t, 3.0 + i * 0.16, 3.45 + i * 0.16);            // kart döner: konu → soru
        const sx = Math.abs(Math.cos(Math.PI * fl));
        e.style.opacity = a; e.style.transform = `translateY(${(1 - ease(a)) * 40}px) scaleX(${sx})`;
        e.querySelector('.yz').style.opacity = fl < 0.5 ? 1 : 0; e.querySelector('.ar').style.opacity = fl >= 0.5 ? 1 : 0;
        e.style.borderColor = fl >= 0.5 ? '#F5A300' : '#475569';
      });
      const al = prog(t, 5.3, 5.8); st('hkAlt', {opacity: al, transform: `scale(${0.8 + 0.2 * ease(al)})`});
    }};
})();
