// TYT · Isı ve Sıcaklık · SORU ÇÖZÜMÜ ("5 Dakikada TYT" motoru + Soru Videosu 2. Format)
// Konu anlatımındaki 8 konunun her birinden bir TYT test sorusu. Kamera sayfadan sayfaya uzaklaşıp yakınlaşır.
// Her sayfa: soru kökü fosforla okunur → sahne animasyonu → kalem çözümü (not kendi animasyonunun altında) → doğru şık işaretlenir.

document.head.insertAdjacentHTML('beforeend', `<style>
.sk{display:grid;grid-template-columns:repeat(3,1fr);gap:3px 6px;margin-top:8px;font:14.5px/1.35 "Noto Serif",serif}
.sk.c1{grid-template-columns:1fr}
.sk>span{padding:1px 6px;border-radius:7px;border:2px solid transparent}
.sk>span>b{color:#fbbf24!important;font-family:Inter;font-weight:800;margin-right:3px}
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
const T = (id, x, y, txt, col = '#e2e8f0', sz = 15, extra = '') => `<text id="${id}" x="${x}" y="${y}" font-family="Inter" font-weight="800" font-size="${sz}" fill="${col}" ${extra}>${txt}</text>`;
const KS = (pay, payda) => `<span class="ks"><span>${pay}</span><span>${payda}</span></span>`;
const TN = (p, n, x0, y0, w, h, col, r = 6) => Array.from({length: n}, (_, i) => {
  const cx = x0 + 22 + (i % 5) * (w - 44) / 4, cy = y0 + 22 + Math.floor(i / 5) * (h - 44) / Math.max(1, Math.ceil(n / 5) - 1);
  return `<circle id="${p}${i}" data-x="${cx}" data-y="${cy}" cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; }).join('');
const titre = (p, n, t, A, w) => { for (let i = 0; i < n; i++) { const e = $(p + i); if (!e) continue; const x = +e.dataset.x, y = +e.dataset.y;
  e.setAttribute('cx', x + A * Math.sin(t * w + i * 1.7)); e.setAttribute('cy', y + A * Math.cos(t * w * 1.3 + i * 2.3)); } };
const TERMO = (id, x, top, alt, col = '#ef4444') => `<rect x="${x - 9}" y="${top}" width="18" height="${alt - top}" rx="9" fill="#1f2430" stroke="#cbd5e1" stroke-width="2.5"/>
  <circle cx="${x}" cy="${alt + 8}" r="15" fill="${col}" stroke="#cbd5e1" stroke-width="2.5"/><rect id="${id}" x="${x - 4.5}" y="${alt}" width="9" height="0" fill="${col}"/>`;
const termo = (id, alt, h) => { at(id, 'y', alt - h); at(id, 'height', h + 4); };
// beher (kap) + içindeki sıvı
const BEHER = (p, x, y, w, h, sv, col) => `<path d="M${x} ${y} v${h - 14} q0 14 14 14 h${w - 28} q14 0 14 -14 v-${h - 14}" fill="none" stroke="#cbd5e1" stroke-width="3"/>
  <rect id="${p}s" x="${x + 4}" y="${y + h - sv}" width="${w - 8}" height="${sv - 4}" rx="10" fill="${col}" opacity=".85"/>`;
const ALEV = (id, x, y) => `<g id="${id}" opacity="0" transform="translate(${x} ${y})"><path d="M0 0 q-14 -18 0 -38 q14 20 0 38z" fill="#f97316"/><path d="M0 0 q-7 -10 0 -22 q7 12 0 22z" fill="#fde047"/></g>`;
const alev = (id, x, y, s, t) => { at(id, 'opacity', s); at(id, 'transform', `translate(${x} ${y}) scale(${(0.6 + 0.4 * s) * (1 + 0.08 * Math.sin(t * 17))})`); };
const S = {};   // sayfalar arası durum (adım → late)

// şıklar: 'ABCDE' sırasıyla; kol = sütun sayısı
const SK = (i, ops, kol = 3) => `<div class="sk${kol === 1 ? ' c1' : ''}">${ops.map((o, j) => `<span id="p${i}o${'ABCDE'[j]}"><b>${'ABCDE'[j]})</b>${o}</span>`).join('')}</div>`;
// doğru şık yeşil çerçeveyle işaretlenir (k: 0 → 1)
const dogru = (id, k) => { const e = $(id); if (!e) return; const a = ease(cl(k));
  e.style.borderColor = `rgba(74,222,128,${a})`; e.style.background = `rgba(74,222,128,${0.18 * a})`; e.style.transform = `scale(${1 + 0.12 * Math.sin(Math.PI * cl(k * 1.4))})`; };
const CEVAP = (o, h, x, y) => H(o, `Cevap: <span class="bx">${h}</span> ` + CK, x, y, 'cevap');

window.KONU = {
  meta: {tema: 'koyu', sinif: 'TYT', ust1: '5 DAKİKADA TYT', ust2: 'TYT FİZİK', baslik: 'Isı ve Sıcaklık', unite: 'Isı ve Sıcaklık', kazanim: 'TYT',
    tur: 'SORU ÇÖZÜMÜ', adim: 'SORU', bitti: '8 SORU TAMAM', takipAlt: 'Fizik · soru çözümü',
    kapakAlt: '8 konu · 8 soru · animasyonlu çözüm', sonraki: 'Elektrostatik', kanca: 'Haydi şimdi SORU çözelim!',
    hookBaslik: 'ISI VE SICAKLIK', introSure: 8.2},
  P: [
  // 1 · Isı ve Sıcaklık ------------------------------------------------
  {konu: 'Isı ve Sıcaklık',
   html: `<span class="qt">Sıcaklıkları 70 °C ve 10 °C olan K ve L cisimleri birbirine dokundurulup dış ortamdan yalıtılıyor. Buna göre;<br>
     I. Isı, K'den L'ye aktarılır.<br>II. L'nin taneciklerinin ortalama hareket enerjisi artar.<br>III. K daha çok ısı içerdiği için sıcaktır.<br>
     yargılarından hangileri doğrudur?</span>` +
    SK(0, ['Yalnız I', 'Yalnız III', 'I ve II', 'II ve III', 'I, II ve III']) +
    SCENE(262, 165, `<g id="p0g" opacity="0">
      <rect x="6" y="28" width="190" height="130" rx="14" fill="#2a1f24" stroke="#ef4444" stroke-width="3"/>${TN('p0h', 10, 6, 28, 190, 130, '#fb923c')}
      <rect x="245" y="28" width="190" height="130" rx="14" fill="#1c2433" stroke="#60a5fa" stroke-width="3"/>${TN('p0c', 10, 245, 28, 190, 130, '#60a5fa')}
      ${T('p0kn', 14, 20, 'K', '#fff', 18)}${T('p0ht', 40, 20, '70 °C', '#f87171', 17)}${T('p0ln', 253, 20, 'L', '#fff', 18)}${T('p0ct', 279, 20, '10 °C', '#93c5fd', 17)}</g>
      ${ARR('p0a', '#F5A300')}`, false) +
    H(1, 'I. sıcaktan → soğuğa ✓', 0, 440, 'sıcaktan') + H(2, 'II. T artar → hareket enerjisi artar ✓', 0, 478, 'artar') +
    H(3, 'III. Cisim ısı içermez, ısı aktarılır ✗', 0, 516, 'içermez') + CEVAP(4, 'C', 0, 562),
   steps: [
     {d: 4.0, o: [], f: s => { at('p0g', 'opacity', ease(prog(s, 0, 0.5))); const k = ease(prog(s, 0.6, 1.3));
       arr('p0a', 198, 94, 198 + 45 * k, 94, k > 0 ? 1 : 0, 'ısı', -6, -12); S.p0 = prog(s, 1.0, 4.0); }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3], f: () => {}},
     {d: 1.0, o: [4], f: s => dogru('p0oC', prog(s, 0, 0.8))},
   ],
   late: time => { const h = S.p0 || 0; titre('p0h', 10, time, 6 - 3 * h, 10 - 4 * h); titre('p0c', 10, time, 1.5 + 3 * h, 2.5 + 3.5 * h);
     $('p0ht').textContent = Math.round(70 - 30 * h) + ' °C'; $('p0ct').textContent = Math.round(10 + 30 * h) + ' °C'; }},

  // 2 · Ölçme ----------------------------------------------------------
  {konu: 'Ölçme',
   html: `<span class="qt">Isı ve sıcaklık ile ilgili;<br>I. Sıcaklık, termometre ile doğrudan ölçülür.<br>II. Isı, kalorimetre kabında sıcaklık değişiminden hesaplanır.<br>
     III. Isının SI birimi kaloridir.<br>yargılarından hangileri doğrudur?</span>` +
    SK(1, ['Yalnız I', 'I ve II', 'I ve III', 'II ve III', 'I, II ve III']) +
    SCENE(232, 215, TERMO('p1l1', 80, 20, 175) + T('p1a', 32, 214, 'Termometre', '#e2e8f0', 15) +
      `<rect x="230" y="62" width="190" height="130" rx="14" fill="#475569" stroke="#cbd5e1" stroke-width="2.5"/>
       <rect x="246" y="78" width="158" height="100" rx="8" fill="#1f2430"/><rect id="p1su" x="250" y="112" width="150" height="62" rx="6" fill="#60a5fa" opacity=".75"/>
       <rect x="222" y="50" width="206" height="18" rx="6" fill="#94a3b8"/>
       <circle id="p1top" cx="300" cy="10" r="15" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>` +
      TERMO('p1l2', 380, 22, 150) + T('p1b', 258, 214, 'Kalorimetre kabı', '#e2e8f0', 15), false) +
    H(1, 'I. doğrudan ✓', 18, 452, 'doğrudan') + H(2, 'II. hesaplanır ✓', 255, 452, 'hesaplanır') +
    H(3, 'III. SI birimi joule (J) ✗', 0, 496, 'joule') + CEVAP(4, 'B', 0, 542),
   init: () => { termo('p1l1', 175, 30); termo('p1l2', 150, 20); },
   steps: [
     {d: 2.2, o: [1], f: s => termo('p1l1', 175, 30 + 105 * ease(prog(s, 0, 2.0)))},
     {d: 3.2, o: [2], f: s => { const k = ease(prog(s, 0, 0.9)); at('p1top', 'cy', 10 + 140 * k); at('p1top', 'opacity', 1 - 0.3 * prog(s, 0.9, 1.4));
       termo('p1l2', 150, 20 + 80 * ease(prog(s, 1.0, 3.0))); at('p1su', 'fill', k >= 1 ? '#f59e0b' : '#60a5fa'); }},
     {d: 0.6, o: [3], f: () => {}},
     {d: 1.0, o: [4], f: s => dogru('p1oB', prog(s, 0, 0.8))},
   ]},

  // 3 · Termometreler --------------------------------------------------
  {konu: 'Termometreler',
   html: `<span class="qt">Celsius termometresi 40 °C'yi gösterdiği anda Fahrenheit termometresi kaç °F'yi gösterir?</span>` +
    SK(2, ['72', '88', '96', '104', '140']) +
    SCENE(130, 250, [['°C', 110, '0', '100', 'p2c'], ['°F', 330, '32', '212', 'p2f']].map(([ad, x, a, b, id]) =>
      TERMO(id, x, 30, 215) + T(id + 'n', x - 14, 20, ad, '#fff', 18) +
      T(id + 'a', x + 22, 196, a, '#93c5fd', 16) + T(id + 'b', x + 22, 66, b, '#fca5a5', 16) +
      T(id + 'v', x - 74, 0, '', '#F5C400', 18)).join('') +
      `<line x1="40" y1="191" x2="420" y2="191" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="6 5"/>
       <line x1="40" y1="61" x2="420" y2="61" stroke="#fca5a5" stroke-width="1.5" stroke-dasharray="6 5"/>
       <line id="p2d" x1="40" y1="139" x2="420" y2="139" stroke="#F5C400" stroke-width="2" stroke-dasharray="6 5" opacity="0"/>
       ${T('p2e1', 4, 186, 'buz', '#93c5fd', 12)}${T('p2e2', 4, 56, 'kaynar', '#fca5a5', 12)}`, false) +
    H(1, KS('40', '100'), 86, 392, 'kırk') + H(2, '=', 205, 405, 'eşittir') + H(3, KS('F − 32', '180'), 285, 392, 'eksi') +
    H(4, 'F − 32 = 72  →  F = 104 °F', 0, 470, 'yetmiş') + CEVAP(5, 'D', 0, 516),
   init: () => { termo('p2c', 215, 6); termo('p2f', 215, 6); },
   steps: [
     {d: 3.2, o: [], f: s => { const k = ease(prog(s, 0, 2.6)); termo('p2c', 215, 6 + 52 * k); termo('p2f', 215, 6 + 52 * k);
       at('p2d', 'opacity', prog(s, 2.4, 2.9)); $('p2cv').textContent = s > 0.1 ? Math.round(40 * k) + ' °C' : ''; $('p2fv').textContent = s > 0.1 ? Math.round(32 + 72 * k) + ' °F' : '';
       at('p2cv', 'y', 215 - 52 * k + 4); at('p2fv', 'y', 215 - 52 * k + 4); }},
     {d: 0.6, o: [1, 2, 3], f: () => {}},
     {d: 0.6, o: [4], f: () => {}},
     {d: 1.0, o: [5], f: s => dogru('p2oD', prog(s, 0, 0.8))},
   ]},

  // 4 · Öz Isı ---------------------------------------------------------
  {konu: 'Öz Isı',
   html: `<span class="qt">Kütleleri eşit X ve Y sıvıları özdeş ısıtıcılarla eşit süre ısıtılıyor. X'in sıcaklığı 10 °C, Y'nin sıcaklığı 20 °C artıyor. Buna göre X'in öz ısısının Y'nin öz ısısına oranı kaçtır?</span>` +
    SK(3, ['2', '4', '1', KS('1', '2'), KS('1', '4')]) +
    SCENE(196, 210, BEHER('p3x', 40, 30, 140, 120, 70, '#60a5fa') + BEHER('p3y', 260, 30, 140, 120, 70, '#a78bfa') +
      `<rect x="45" y="170" width="130" height="14" rx="5" fill="#64748b"/><rect x="265" y="170" width="130" height="14" rx="5" fill="#64748b"/>` +
      ALEV('p3f1', 110, 168) + ALEV('p3f2', 330, 168) +
      T('p3xn', 100, 125, 'X', '#fff', 22) + T('p3yn', 320, 125, 'Y', '#fff', 22) +
      `<rect x="62" y="0" width="96" height="26" rx="13" fill="#1d4ed8"/><rect x="282" y="0" width="96" height="26" rx="13" fill="#7c3aed"/>` +
      T('p3xt', 76, 19, '+0 °C', '#fff', 16) + T('p3yt', 296, 19, '+0 °C', '#fff', 16), false) +
    H(1, 'ΔT = 10 °C', 60, 412, 'on') + H(2, 'ΔT = 20 °C', 278, 412, 'yirmi') +
    H(3, 'Q = m · c · ΔT  →  Q, m eşit', 0, 452, 'eşit') +
    H(4, 'c · ΔT eşit  →  ' + KS('c<sub>X</sub>', 'c<sub>Y</sub>') + ' = ' + KS('20', '10') + ' = 2', 0, 492, 'oran') + CEVAP(5, 'A', 0, 560),
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.4, 3.4)); const t = s; alev('p3f1', 110, 168, prog(s, 0, 0.4), t); alev('p3f2', 330, 168, prog(s, 0, 0.4), t);
       $('p3xt').textContent = '+' + Math.round(10 * k) + ' °C'; $('p3yt').textContent = '+' + Math.round(20 * k) + ' °C';
       at('p3ys', 'fill', k > 0.5 ? '#f472b6' : '#a78bfa'); }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3, 4], f: () => {}},
     {d: 1.0, o: [5], f: s => dogru('p3oA', prog(s, 0, 0.8))},
   ]},

  // 5 · Hal Değişimi ---------------------------------------------------
  {konu: 'Hal Değişimi',
   html: `<span class="qt">Saf bir katının sıcaklık-ısı grafiği şekildeki gibidir. Buna göre;<br>I. Madde L aralığında hal değiştirir.<br>II. L aralığında madde ısı almaz.<br>
     III. Maddenin erime sıcaklığı 40 °C'dir.<br>yargılarından hangileri doğrudur?</span>` +
    SK(4, ['Yalnız I', 'Yalnız II', 'I ve II', 'I ve III', 'II ve III']) +
    SCENE(228, 215, `<line x1="40" y1="190" x2="432" y2="190" stroke="#16181D" stroke-width="2.5"/><line x1="40" y1="197" x2="40" y2="10" stroke="#16181D" stroke-width="2.5"/>
      <polygon points="432,190 422,185 422,195" fill="#16181D"/><polygon points="40,10 35,20 45,20" fill="#16181D"/>
      <text class="ax" x="372" y="210">Q (ısı)</text><text class="ax" x="48" y="18">T (°C)</text><text class="ax" x="14" y="114">40</text>
      <line x1="40" y1="110" x2="430" y2="110" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 5"/>` +
      PL(0, 40, 175, 130, 110, 'style="stroke:#60a5fa;stroke-width:4"') + PL(0, 130, 110, 270, 110, 'style="stroke:#F5A300;stroke-width:4"') +
      PL(0, 270, 110, 380, 30, 'style="stroke:#f87171;stroke-width:4"') +
      T('p4K', 76, 132, 'K', '#93c5fd', 16) + T('p4L', 192, 100, 'L', '#F5C400', 16) + T('p4M', 312, 62, 'M', '#fca5a5', 16), false,
      EM('p4i1', '🧊', 66, 160, 30, 'opacity:0') + EM('p4i2', '💧', 186, 112, 30, 'opacity:0') + EM('p4i3', '💧', 300, 120, 30, 'opacity:0')) +
    H(1, 'I. L: erime (katı + sıvı) ✓', 0, 452, 'erime') + H(2, 'II. Isı alır ama T sabit ✗', 0, 490, 'sabit') +
    H(3, 'III. Erime sıcaklığı 40 °C ✓', 0, 528, 'kırk') + CEVAP(4, 'D', 0, 572),
   steps: [
     {d: 3.6, o: [], f: s => { const L = [...document.querySelectorAll('.pg .pl[data-o="0"]')].filter(e => e.closest('.q') && e.closest('.q').querySelector('#p4K'));
       L.forEach((e, j) => e.setAttribute('stroke-dashoffset', 100 * (1 - ease(prog(s, j * 1.1, j * 1.1 + 1.0)))));
       st('p4i1', {opacity: prog(s, 0.2, 0.5) * (1 - prog(s, 1.6, 2.0))}); st('p4i2', {opacity: prog(s, 1.1, 1.5) * (1 - prog(s, 2.4, 2.8))}); st('p4i3', {opacity: prog(s, 2.3, 2.7)});
       ['p4K', 'p4L', 'p4M'].forEach((id, j) => at(id, 'opacity', prog(s, j * 1.1 + 0.6, j * 1.1 + 1.0))); }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3], f: () => {}},
     {d: 1.0, o: [4], f: s => dogru('p4oD', prog(s, 0, 0.8))},
   ],
   init: () => { ['p4K', 'p4L', 'p4M'].forEach(id => at(id, 'opacity', 0)); }},

  // 6 · Isıl Denge -----------------------------------------------------
  {konu: 'Isıl Denge',
   html: `<span class="qt">30 °C'deki 200 g su ile 90 °C'deki 100 g su, ısıca yalıtılmış bir kapta karıştırılıyor. Isı alışverişi yalnız sular arasında olduğuna göre denge sıcaklığı kaç °C olur?</span>` +
    SK(5, ['40', '45', '50', '60', '70']) +
    SCENE(176, 200, `<g id="p5A">${BEHER('p5a', 10, 40, 120, 130, 96, '#60a5fa')}${T('p5am', 40, 120, '200 g', '#fff', 16)}${T('p5at', 40, 146, '30 °C', '#fff', 18)}</g>
      <g id="p5B">${BEHER('p5b', 150, 40, 110, 130, 54, '#f97316')}${T('p5bm', 178, 140, '100 g', '#fff', 15)}${T('p5bt', 176, 164, '90 °C', '#fff', 16)}</g>
      ${ARR('p5ok', '#F5A300')}
      <g id="p5C" opacity="0">${BEHER('p5c', 300, 20, 130, 150, 130, '#f59e0b')}${T('p5cm', 330, 100, '300 g', '#fff', 16)}${T('p5ct', 326, 130, '? °C', '#fff', 20)}</g>`, false) +
    H(1, 'Q<sub>verilen</sub> = Q<sub>alınan</sub>', 0, 392, 'verilen') +
    H(2, '200 · (T − 30) = 100 · (90 − T)', 0, 430, 'iki') +
    H(3, '300 · T = 15000  →  T = ' + KS('15000', '300') + ' = 50 °C', 0, 470, 'elli') +
    H(4, 'Kütlesi büyük olana (30 °C) yakın', 0, 528, 'yakın') + CEVAP(5, 'C', 0, 568),
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0, 0.8)); arr('p5ok', 268, 100, 268 + 26 * k, 100, k > 0 ? 1 : 0, '', 0, 0);
       const c = ease(prog(s, 0.6, 1.6)); at('p5C', 'opacity', c); at('p5A', 'opacity', 1 - 0.55 * c); at('p5B', 'opacity', 1 - 0.55 * c);
       $('p5ct').textContent = s < 1.6 ? '? °C' : Math.round(lerp(30, 50, ease(prog(s, 1.6, 3.4)))) + ' °C'; }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3, 4], f: () => {}},
     {d: 1.0, o: [5], f: s => dogru('p5oC', prog(s, 0, 0.8))},
   ]},

  // 7 · Isı Aktarımı ---------------------------------------------------
  {konu: 'Isı Aktarımı',
   html: `<span class="qt">Aşağıdakilerin hangisinde ısı, madde gerekmeden yalnızca ışıma yoluyla aktarılır?</span>` +
    SK(6, ['Çaya konan metal kaşığın sapının ısınması', 'Kaloriferin odadaki havayı dolaştırarak ısıtması', 'Ocaktaki tencerenin dibinin ısınması',
      'Denizden karaya esen meltem rüzgârı', "Güneş enerjisinin uzay boşluğundan Dünya'ya ulaşması"], 1) +
    SCENE(232, 190, `<g id="p6a" opacity="0"><path d="M20 90 v70 q0 12 12 12 h56 q12 0 12 -12 v-70z" fill="#92400e" stroke="#cbd5e1" stroke-width="2.5"/>
        <line x1="70" y1="120" x2="118" y2="40" stroke="#cbd5e1" stroke-width="7" stroke-linecap="round"/>
        <line id="p6as" x1="70" y1="120" x2="70" y2="120" stroke="#ef4444" stroke-width="7" stroke-linecap="round"/></g>
      <g id="p6b" opacity="0"><rect x="150" y="130" width="110" height="46" rx="6" fill="#94a3b8"/><rect id="p6bi" x="156" y="136" width="98" height="34" rx="5" fill="#fb923c" opacity="0"/>
        <g fill="none" stroke-width="4" stroke-linecap="round"><path id="p6k1" d="M205 120 C 205 80, 205 50, 210 30" stroke="#fb923c" stroke-dasharray="10 8"/>
        <path id="p6k2" d="M220 26 C 245 30, 262 60, 262 120" stroke="#60a5fa" stroke-dasharray="10 8"/></g></g>
      <g id="p6c" opacity="0"><rect x="290" y="0" width="151" height="190" rx="10" fill="#0b1020"/>
        ${[[310, 30], [420, 20], [360, 150], [430, 120], [300, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('')}
        <circle cx="318" cy="40" r="22" fill="#fde047"/><circle cx="410" cy="150" r="20" fill="#3b82f6"/><path d="M398 140 q8 4 10 14 q8 -2 12 6" fill="none" stroke="#22c55e" stroke-width="4"/>
        <g id="p6i" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round" opacity="0"><path d="M340 55 l50 70"/><path d="M332 64 l46 66"/><path d="M350 48 l52 70"/></g></g>`, false) +
    H(1, 'A, C: iletim', 6, 438, 'iletim') + H(2, 'B, D: konveksiyon', 140, 438, 'konveksiyon') + H(3, 'E: ışıma ✓', 316, 438, 'ışıma') +
    H(4, 'Işıma boşlukta da olur', 0, 482, 'boşlukta') + CEVAP(5, 'E', 0, 526),
   steps: [
     {d: 2.0, o: [1], f: s => { at('p6a', 'opacity', prog(s, 0, 0.4)); const k = ease(prog(s, 0.4, 1.9)); at('p6as', 'x2', 70 + 48 * k); at('p6as', 'y2', 120 - 80 * k); }},
     {d: 2.0, o: [2], f: s => { at('p6b', 'opacity', prog(s, 0, 0.4)); at('p6bi', 'opacity', 0.7 * prog(s, 0.3, 1.0)); S.p6b = prog(s, 0.3, 0.8); }},
     {d: 2.0, o: [3], f: s => { at('p6c', 'opacity', prog(s, 0, 0.4)); at('p6i', 'opacity', prog(s, 0.4, 0.8)); }},
     {d: 0.6, o: [4], f: () => {}},
     {d: 1.0, o: [5], f: s => dogru('p6oE', prog(s, 0, 0.8))},
   ],
   late: time => { const b = S.p6b || 0; for (let i = 1; i <= 2; i++) { $('p6k' + i).style.strokeDashoffset = -time * 30; $('p6k' + i).style.opacity = b; }
     $('p6i').style.strokeDasharray = '14 10'; $('p6i').style.strokeDashoffset = -time * 40; }},

  // 8 · Genleşme -------------------------------------------------------
  {konu: 'Genleşme',
   html: `<span class="qt">Aynı sıcaklıkta boyları eşit olan K ve L metal çubuklarının sıcaklıkları eşit miktarda artırılınca K'nin boyu L'ninkinden daha çok uzuyor. Buna göre;<br>
     I. K'nin boyca uzama katsayısı L'ninkinden büyüktür.<br>II. Isınan çubukların tanecikleri arasındaki uzaklık artar.<br>III. Eşit miktarda soğutulursa K, L'den daha çok kısalır.<br>
     yargılarından hangileri doğrudur?</span>` +
    SK(7, ['Yalnız I', 'I ve II', 'I ve III', 'II ve III', 'I, II ve III']) +
    SCENE(306, 150, `<rect id="p7k" x="30" y="24" width="300" height="26" rx="6" fill="#94a3b8"/>${T('p7kn', 4, 44, 'K', '#fff', 18)}
      <rect id="p7l" x="30" y="94" width="300" height="26" rx="6" fill="#94a3b8"/>${T('p7ln', 4, 114, 'L', '#fff', 18)}
      <line x1="330" y1="10" x2="330" y2="140" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="5 5"/>
      ${ARR('p7dk', '#F5C400')}${ARR('p7dl', '#F5C400')}` + ALEV('p7f1', 120, 82) + ALEV('p7f2', 220, 82) + ALEV('p7f3', 120, 150) + ALEV('p7f4', 220, 150), false) +
    H(1, 'ΔL = L<sub>0</sub> · λ · ΔT', 0, 462, 'uzama') + H(2, 'L<sub>0</sub>, ΔT eşit  →  λ<sub>K</sub> > λ<sub>L</sub>   I ✓', 0, 500, 'katsayı') +
    H(3, 'II. Tanecikler uzaklaşır ✓    III. ✓', 0, 538, 'uzaklaşır') + CEVAP(4, 'E', 0, 578),
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.4, 3.4)); ['p7f1', 'p7f2', 'p7f3', 'p7f4'].forEach((id, j) => alev(id, j % 2 ? 220 : 120, j < 2 ? 82 : 150, prog(s, 0, 0.4), s + j));
       at('p7k', 'width', 300 + 70 * k); at('p7l', 'width', 300 + 30 * k); at('p7k', 'fill', k > 0.4 ? '#fb923c' : '#94a3b8'); at('p7l', 'fill', k > 0.4 ? '#fb923c' : '#94a3b8');
       arr('p7dk', 330, 14, 330 + 70 * k, 14, k > 0.08 ? 1 : 0, 'ΔL', 0, -4); arr('p7dl', 330, 84, 330 + 30 * k, 84, k > 0.15 ? 1 : 0, '', 0, 0); }},
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3], f: () => {}},
     {d: 1.0, o: [4], f: s => dogru('p7oE', prog(s, 0, 0.8))},
   ]},
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
