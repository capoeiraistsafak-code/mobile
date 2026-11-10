// TYT · Isı ve Sıcaklık · konu anlatımı içeriği ("1 Dakikada Fizik" motoru, TYT kopyası)
// Her sayfa bir soru; tanım fosforla okunur, sahne animasyonu oynar, kalem notları yazılır.
const TN = (p, n, x0, y0, w, h, col, r = 6) => Array.from({length: n}, (_, i) => {
  const cx = x0 + 22 + (i % 5) * (w - 44) / 4, cy = y0 + 22 + Math.floor(i / 5) * (h - 44) / Math.max(1, Math.ceil(n / 5) - 1);
  return `<circle id="${p}${i}" data-x="${cx}" data-y="${cy}" cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; }).join('');
const titre = (p, n, t, A, w) => { for (let i = 0; i < n; i++) { const e = $(p + i); if (!e) continue; const x = +e.dataset.x, y = +e.dataset.y;
  e.setAttribute('cx', x + A * Math.sin(t * w + i * 1.7)); e.setAttribute('cy', y + A * Math.cos(t * w * 1.3 + i * 2.3)); } };
const TERMO = (id, x, top, alt, col = '#ef4444') => `<rect x="${x - 9}" y="${top}" width="18" height="${alt - top}" rx="9" fill="#1f2430" stroke="#cbd5e1" stroke-width="2.5"/>
  <circle cx="${x}" cy="${alt + 8}" r="15" fill="${col}" stroke="#cbd5e1" stroke-width="2.5"/><rect id="${id}" x="${x - 4.5}" y="${alt}" width="9" height="0" fill="${col}"/>`;
const termo = (id, alt, h) => { at(id, 'y', alt - h); at(id, 'height', h + 4); };
const PETEK = (p, x, y, w, h, n = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#94a3b8"/>` +
  Array.from({length: n}, (_, i) => `<rect x="${x + 5 + i * (w - 10) / n}" y="${y + 5}" width="${(w - 10) / n - 4}" height="${h - 10}" rx="5" fill="#e2e8f0"/>` +
  `<rect id="${p}${i}" x="${x + 5 + i * (w - 10) / n}" y="${y + 5}" width="${(w - 10) / n - 4}" height="${h - 10}" rx="5" fill="#fb923c" opacity="0"/>`).join('');
const petekIsi = (p, k, n = 6) => { for (let i = 0; i < n; i++) at(p + i, 'opacity', 0.6 * k); };
const T = (id, x, y, txt, col = '#e2e8f0', sz = 15, extra = '') => `<text id="${id}" x="${x}" y="${y}" font-family="Inter" font-weight="800" font-size="${sz}" fill="${col}" ${extra}>${txt}</text>`;
const S = {};   // sayfalar arası durum (adım → late)
// el yazısındaki gibi kesir: pay üstte, payda altta, arada çizgi
const KS = (pay, payda) => `<span class="ks"><span>${pay}</span><span>${payda}</span></span>`;
// kesrin altına neye ait olduğunu yaz (ör. Celsius)
const KSA = (kesir, ad) => `<span class="ksa">${kesir}<i>${ad}</i></span>`;

window.KONU = {
  meta: {tema: 'koyu', sinif: 'TYT', ust1: '5 DAKİKADA TYT', ust2: 'TYT FİZİK', baslik: 'Isı ve Sıcaklık', unite: 'Isı ve Sıcaklık', kazanim: 'TYT',
    kapakAlt: 'Isıdan genleşmeye, ünitenin tamamı', sonraki: 'Elektrostatik', kanca: 'Kalorifer petekleri evi NASIL ısıtıyor?',
    hookBaslik: 'ISI VE SICAKLIK', introSure: 8.2},
  P: [
  // 1 ---------------------------------------------------------------
  {konu: 'Isı ve Sıcaklık', soru: 'Isı nedir? Sıcaklık nedir? Farkı ne?',
   html: `<span class="qt"><b>Sıcaklık</b>, taneciklerin <b>ortalama hareket enerjisinin</b> göstergesidir. <b>Isı</b> ise sıcaklık farkı yüzünden <b>sıcaktan soğuğa aktarılan</b> enerjidir.</span>` +
    SCENE(100, 180, `<g id="p0g" opacity="0">
      <rect x="6" y="24" width="190" height="140" rx="14" fill="#2a1f24" stroke="#ef4444" stroke-width="3"/>${TN('p0h', 10, 6, 24, 190, 140, '#fb923c')}
      <rect x="245" y="24" width="190" height="140" rx="14" fill="#1c2433" stroke="#60a5fa" stroke-width="3"/>${TN('p0c', 10, 245, 24, 190, 140, '#60a5fa')}
      ${T('p0ht', 14, 16, '70 °C', '#f87171', 17)}${T('p0ct', 253, 16, '10 °C', '#93c5fd', 17)}</g>
      ${ARR('p0a', '#F5A300')}`, false) +
    H(1, 'Hızlı titreşim → yüksek sıcaklık', 0, 300, 'titreşirse') + H(2, 'Isı: sıcaktan → soğuğa', 0, 342, 'aktarılan') +
    H(3, 'İç enerji = taneciklerin toplamı', 0, 384, 'İç') + H(4, 'Cisim ısı içermez, ısı aktarılır ' + CK, 0, 426, 'aktarılan'),
   init: () => {},
   steps: [
     {d: 1.4, o: [1], f: s => { at('p0g', 'opacity', ease(prog(s, 0, 0.6))); }},
     {d: 3.0, o: [2], f: s => { const k = ease(prog(s, 0, 0.8)); arr('p0a', 198, 94, 198 + 45 * k, 94, k > 0 ? 1 : 0, 'ısı', -6, -12); S.p0 = prog(s, 0.4, 3.0); }},
     {d: 0.6, o: [3, 4], f: () => {}},
   ],
   late: time => { const h = S.p0 || 0; titre('p0h', 10, time, 6, 10); titre('p0c', 10, time, 1.5 + 4 * h, 2.5 + 6 * h);
     $('p0ct').textContent = Math.round(10 + 15 * h) + ' °C'; }},

  // 2 ---------------------------------------------------------------
  {konu: 'Ölçme', soru: 'Isı neyle, sıcaklık neyle ölçülür?',
   html: `<span class="qt"><b>Sıcaklık</b> termometreyle doğrudan ölçülür. <b>Isı</b> doğrudan ölçülemez; <b>kalorimetre kabında</b> sıcaklık değişiminden hesaplanır.</span>` +
    SCENE(100, 245, TERMO('p1l1', 80, 20, 190) + T('p1a', 30, 232, 'Termometre', '#e2e8f0', 15) +
      `<rect x="230" y="70" width="190" height="150" rx="14" fill="#475569" stroke="#cbd5e1" stroke-width="2.5"/>
       <rect x="246" y="86" width="158" height="120" rx="8" fill="#1f2430"/><rect id="p1su" x="250" y="130" width="150" height="72" rx="6" fill="#60a5fa" opacity=".75"/>
       <rect x="222" y="58" width="206" height="18" rx="6" fill="#94a3b8"/>
       <circle id="p1top" cx="300" cy="10" r="16" fill="#ef4444" stroke="#fca5a5" stroke-width="2"/>` +
      TERMO('p1l2', 380, 26, 168) + T('p1b', 262, 238, 'Kalorimetre kabı', '#e2e8f0', 15), false) +
    H(1, 'Sıcaklık: °C · °F · K', 0, 352, 'termometreyle') + H(2, 'Isı: joule · kalori', 250, 352, 'Birimi') +
    H(3, '1 cal ≈ 4,18 J ' + CK, 0, 420, 'kalori') + H(4, 'Termometre ısıyı ölçmez!', 0, 462, 'Dikkat'),
   init: () => { termo('p1l1', 190, 30); termo('p1l2', 168, 20); },
   steps: [
     {d: 2.2, o: [1], f: s => termo('p1l1', 190, 30 + 120 * ease(prog(s, 0, 2.0)))},
     {d: 3.2, o: [2, 3], f: s => { const k = ease(prog(s, 0, 0.9)); at('p1top', 'cy', 10 + 150 * k); at('p1top', 'opacity', 1 - 0.3 * prog(s, 0.9, 1.4));
       termo('p1l2', 168, 20 + 90 * ease(prog(s, 1.0, 3.0))); at('p1su', 'fill', k >= 1 ? '#f59e0b' : '#60a5fa'); at('p1su', 'opacity', .75); }},
     {d: 0.5, o: [4], f: () => {}},
   ]},

  // 3 ---------------------------------------------------------------
  {konu: 'Termometreler', soru: 'Termometreler arasındaki fark ne?',
   html: `<span class="qt">Termometre, ısınınca <b>genleşen bir sıvıyla</b> çalışır. Ölçekler, buzun erime ve suyun kaynama noktasına <b>farklı sayılar</b> verir.</span>` +
    SCENE(100, 250, [['°C', 80, '0', '100'], ['°F', 220, '32', '212'], ['K', 360, '273', '373']].map(([ad, x, a, b], i) =>
      TERMO('p2l' + i, x, 34, 215) + T('p2n' + i, x - 12, 22, ad, '#fff', 17) +
      T('p2a' + i, x + 20, 180, a, '#93c5fd', 16, 'opacity="0"') + T('p2b' + i, x + 20, 70, b, '#fca5a5', 16, 'opacity="0"')).join('') +
      `<line id="p2d1" x1="20" y1="175" x2="430" y2="175" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="6 5" opacity="0"/>
       <line id="p2d2" x1="20" y1="65" x2="430" y2="65" stroke="#fca5a5" stroke-width="1.5" stroke-dasharray="6 5" opacity="0"/>
       ${T('p2e1', 4, 192, 'buz erir', '#93c5fd', 12, 'opacity="0"')}${T('p2e2', 4, 58, 'su kaynar', '#fca5a5', 12, 'opacity="0"')}`, false) +
    H(1, KS('C', '100'), 59, 352, 'formül') + H(2, '=', 145, 365, 'formül') + H(3, KS('F − 32', '180'), 188, 352, 'formül') +
    H(4, '=', 285, 365, 'formül') + H(5, KS('K − 273', '100'), 325, 352, 'formül') +
    H(6, 'ΔT: 10 °C artış = 10 K artış ' + CK, 0, 430, 'on') + H(7, "Kelvin'de eksi değer yok", 0, 472, 'Değişimde'),
   init: () => { for (let i = 0; i < 3; i++) termo('p2l' + i, 215, 6); },
   steps: [
     {d: 2.4, o: [], f: s => { const k = ease(prog(s, 0, 1.6)); for (let i = 0; i < 3; i++) { termo('p2l' + i, 215, 6 + 34 * k); at('p2a' + i, 'opacity', prog(s, 1.2 + i * .3, 1.6 + i * .3)); }
       at('p2d1', 'opacity', prog(s, 1.4, 1.8)); at('p2e1', 'opacity', prog(s, 1.4, 1.8)); }},
     {d: 2.6, o: [], f: s => { if (!s) return; const k = ease(prog(s, 0, 1.6)); for (let i = 0; i < 3; i++) { termo('p2l' + i, 215, 40 + 110 * k); at('p2b' + i, 'opacity', prog(s, 1.2 + i * .3, 1.6 + i * .3)); }
       at('p2d2', 'opacity', prog(s, 1.4, 1.8)); at('p2e2', 'opacity', prog(s, 1.4, 1.8)); }},
     {d: 0.6, o: [1, 2, 3, 4, 5, 6, 7], f: () => {}},
   ]},

  // 4 ---------------------------------------------------------------
  {konu: 'Öz Isı', soru: 'Aynı ısıyı alan maddeler neden farklı ısınır?',
   html: `<span class="qt"><b>Öz ısı</b>, 1 gram maddenin sıcaklığını 1 °C artırmak için gereken ısıdır ve <b>maddeyi tanıtır</b>. Verilen ısı: <b>Q = m · c · ΔT</b></span>` +
    SCENE(100, 240, `<g id="p3r" opacity="0" stroke="#facc15" stroke-width="3" stroke-dasharray="8 7">
        <line x1="200" y1="60" x2="110" y2="150"/><line x1="240" y1="60" x2="330" y2="150"/><line x1="185" y1="70" x2="70" y2="150"/><line x1="255" y1="70" x2="370" y2="150"/></g>
      <rect x="10" y="160" width="190" height="62" rx="8" fill="#d6a85c"/>${T('p3k', 60, 198, 'KUM', '#451a03', 18)}
      <rect x="240" y="160" width="190" height="62" rx="8" fill="#2563eb"/>${T('p3s', 315, 198, 'SU', '#fff', 18)}
      <rect x="20" y="118" width="96" height="32" rx="16" fill="#dc2626"/>${T('p3kt', 34, 140, '20 °C', '#fff', 17)}
      <rect x="250" y="118" width="96" height="32" rx="16" fill="#1d4ed8"/>${T('p3st', 264, 140, '20 °C', '#fff', 17)}
      <g id="p3w" opacity="0" fill="none" stroke="#fdba74" stroke-width="3" stroke-linecap="round"><path d="M140 150 q-8 -12 0 -24 q8 -12 0 -24"/><path d="M175 150 q-8 -12 0 -24 q8 -12 0 -24"/></g>`, false,
      EM('p3g', '☀️', 190, 0, 52, 'opacity:0')) +
    H(1, 'Kum hızlı, su yavaş ısınır', 0, 362, 'hızla') + H(2, 'Su: öz ısı büyük (c = 1 ' + KS('cal', 'g·°C') + ')', 0, 396, 'büyüktür') +
    H(3, 'Kaloriferde su: bol ısı taşır ' + CK, 0, 454, 'kaloriferde') + H(4, 'm·c = ısı sığası (ayırt edici değil)', 0, 496, 'sığası'),
   init: () => {},
   steps: [
     {d: 3.6, o: [1], f: s => { st('p3g', {opacity: prog(s, 0, 0.4), transform: `rotate(${s * 20}deg)`}); at('p3r', 'opacity', prog(s, 0.3, 0.7) * (0.7 + 0.3 * Math.sin(s * 8)));
       $('p3kt').textContent = Math.round(20 + 30 * ease(prog(s, 0.6, 3.4))) + ' °C'; $('p3st').textContent = Math.round(20 + 4 * ease(prog(s, 0.6, 3.4))) + ' °C';
       at('p3w', 'opacity', prog(s, 1.5, 2.2)); at('p3w', 'transform', `translate(0,${-6 * ((s * 1.5) % 1)})`); }},
     {d: 0.5, o: [2, 3], f: () => {}},
     {d: 0.5, o: [4], f: () => {}},
   ]},

  // 5 ---------------------------------------------------------------
  {konu: 'Hal Değişimi', soru: 'Hal değişimi nasıl olur?',
   html: `<span class="qt">Isı alan madde <b>erir, buharlaşır</b>; ısı veren madde <b>donar, yoğuşur</b>. Saf maddede hal değişirken <b>sıcaklık sabit kalır</b>.</span>` +
    SCENE(100, 250, `<line x1="40" y1="225" x2="432" y2="225" stroke="#16181D" stroke-width="2.5"/><line x1="40" y1="232" x2="40" y2="14" stroke="#16181D" stroke-width="2.5"/>
      <polygon points="432,225 422,220 422,230" fill="#16181D"/><polygon points="40,14 35,24 45,24" fill="#16181D"/>
      <text class="ax" x="360" y="244">Q (ısı)</text><text class="ax" x="46" y="22">T (°C)</text><text class="ax" x="14" y="164">0</text><text class="ax" x="4" y="74">100</text>
      <line x1="40" y1="160" x2="430" y2="160" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 5"/><line x1="40" y1="70" x2="430" y2="70" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 5"/>` +
      PL(1, 40, 205, 100, 160, 'data-w="buzu" style="stroke:#60a5fa;stroke-width:4"') + PL(2, 100, 160, 190, 160, 'data-w="yataylaşır" style="stroke:#F5A300;stroke-width:4"') +
      PL(3, 190, 160, 280, 70, 'data-w="Hepsi" style="stroke:#60a5fa;stroke-width:4"') + PL(4, 280, 70, 390, 70, 'data-w="kaynarken" style="stroke:#F5A300;stroke-width:4"') +
      PL(5, 390, 70, 425, 34, 'style="stroke:#f87171;stroke-width:4"') +
      T('p4e', 112, 152, 'erime', '#F5C400', 13, 'opacity="0"') + T('p4k', 300, 62, 'kaynama', '#F5C400', 13, 'opacity="0"'), false,
      EM('p4i1', '🧊', 50, 150, 30, 'opacity:0') + EM('p4i2', '💧', 215, 100, 30, 'opacity:0') + EM('p4i3', '♨️', 400, 0, 30, 'opacity:0')) +
    H(6, 'Erirken / kaynarken T sabit', 0, 372, 'sabit') + H(7, 'Gereken ısı: Q = m · L ' + CK, 0, 414, 'gereken') + H(8, 'Isı alır ama T değişmez!', 0, 456, 'Dikkat'),
   init: () => {},
   steps: [
     {d: 0.6, o: [1, 2], f: () => {}},
     {d: 0.6, o: [3, 4, 5], f: () => {}},
     {d: 0.5, o: [6, 7], f: () => {}},
     {d: 0.5, o: [8], f: () => {}},
   ],
   late: () => { const L = [...document.querySelectorAll('.pg .pl')].filter(e => e.closest('.q') && e.closest('.q').querySelector('#p4e'));
     if (L.length < 5) return; const k = L.map(e => 1 - (+e.getAttribute('stroke-dashoffset')) / 100);
     st('p4i1', {opacity: k[0] > 0.1 ? 1 - prog(k[1], 0.6, 1) : 0}); st('p4i2', {opacity: k[2] > 0.3 ? 1 - prog(k[3], 0.7, 1) : 0}); st('p4i3', {opacity: k[4] > 0.3 ? 1 : 0});
     at('p4e', 'opacity', k[1] > 0.5 ? 1 : 0); at('p4k', 'opacity', k[3] > 0.5 ? 1 : 0); }},

  // 6 ---------------------------------------------------------------
  {konu: 'Isıl Denge', soru: 'Isıl denge nedir?',
   html: `<span class="qt">Sıcak madde ısı <b>verir</b>, soğuk madde ısı <b>alır</b>; sıcaklıklar <b>eşitlenince</b> ısı aktarımı durur.</span>` +
    SCENE(96, 230, `<g id="p5A"><path d="M20 40 v140 q0 18 18 18 h84 q18 0 18 -18 v-140" fill="none" stroke="#cbd5e1" stroke-width="3"/>
        <rect id="p5As" x="24" y="110" width="112" height="84" rx="12" fill="#60a5fa" opacity=".8"/>${T('p5Am', 52, 140, '100 g', '#fff', 16)}${T('p5At', 52, 168, '20 °C', '#fff', 18)}</g>
      <g id="p5B"><path d="M170 40 v140 q0 18 18 18 h84 q18 0 18 -18 v-140" fill="none" stroke="#cbd5e1" stroke-width="3"/>
        <rect id="p5Bs" x="174" y="70" width="112" height="124" rx="12" fill="#f97316" opacity=".85"/>${T('p5Bm', 202, 120, '200 g', '#fff', 16)}${T('p5Bt', 202, 148, '80 °C', '#fff', 18)}</g>
      ${ARR('p5a', '#F5A300')}
      <g id="p5C" opacity="0"><path d="M320 20 v160 q0 18 18 18 h76 q18 0 18 -18 v-160" fill="none" stroke="#cbd5e1" stroke-width="3"/>
        <rect x="324" y="40" width="104" height="154" rx="12" fill="#f59e0b" opacity=".85"/>${T('p5Cm', 348, 110, '300 g', '#fff', 16)}${T('p5Ct', 342, 140, '60 °C', '#fff', 20)}</g>`, false) +
    H(1, 'Q verilen = Q alınan', 0, 350, 'Verilen') + H(2, '100·(T − 20) = 200·(80 − T)', 0, 392, 'Verilen') +
    H(3, 'T = 60 °C ' + CK, 0, 434, 'altmış') + H(4, 'Kütlesi büyük olana yakın', 0, 476, 'yakın'),
   init: () => {},
   steps: [
     {d: 3.2, o: [], f: s => { const k = ease(prog(s, 0, 0.7)); arr('p5a', 168, 60, 168 - 30 * k, 60, k > 0 ? 1 : 0, 'ısı', -10, -12);
       const e = ease(prog(s, 0.6, 3.0)); $('p5At').textContent = Math.round(20 + 40 * e) + ' °C'; $('p5Bt').textContent = Math.round(80 - 20 * e) + ' °C';
       at('p5As', 'fill', e > 0.6 ? '#f59e0b' : '#60a5fa'); }},
     {d: 2.0, o: [1, 2, 3], f: s => { at('p5C', 'opacity', ease(prog(s, 0, 0.8))); }},
     {d: 0.5, o: [4], f: () => {}},
   ]},

  // 7 ---------------------------------------------------------------
  {konu: 'Isı Aktarımı', soru: 'Isı nasıl yayılır?',
   html: `<span class="qt">Isı üç yolla yayılır: <b>iletim</b> (dokunarak), <b>konveksiyon</b> (akışkanla taşınarak) ve <b>ışıma</b> (madde gerekmeden).</span>` +
    SCENE(96, 250, `<line x1="0" y1="200" x2="110" y2="200" stroke="#7f1d1d" stroke-width="12" stroke-linecap="round"/>
      <g id="p6su">${Array.from({length: 4}, (_, i) => `<circle id="p6d${i}" cy="200" r="5" fill="#ef4444"/>`).join('')}</g>
      ${PETEK('p6f', 110, 150, 170, 80)}
      <g fill="none" stroke-width="4" stroke-linecap="round" id="p6k" opacity="0">
        <path id="p6k1" d="M200 140 C 200 90, 205 50, 210 22" stroke="#fb923c" stroke-dasharray="12 9"/><path id="p6k2" d="M215 16 C 270 12, 320 12, 360 20" stroke="#fb923c" stroke-dasharray="12 9"/>
        <path id="p6k3" d="M372 30 C 380 100, 380 170, 372 220" stroke="#60a5fa" stroke-dasharray="12 9"/><path id="p6k4" d="M360 232 C 330 240, 310 240, 290 232" stroke="#60a5fa" stroke-dasharray="12 9"/></g>
      <g id="p6i" opacity="0" fill="none" stroke="#facc15" stroke-width="3" stroke-linecap="round">
        <path d="M290 170 q8 -8 16 0 t16 0 t16 0"/><path d="M290 190 q8 -8 16 0 t16 0 t16 0"/><path d="M290 210 q8 -8 16 0 t16 0 t16 0"/></g>
      ${T('p6t1', 4, 232, 'iletim', '#fca5a5', 14, 'opacity="0"')}${T('p6t2', 218, 52, 'konveksiyon', '#fdba74', 14, 'opacity="0"')}${T('p6t3', 296, 150, 'ışıma', '#fde047', 14, 'opacity="0"')}`, false,
      EM('p6h', '✋', 340, 168, 34, 'opacity:0')) +
    H(1, 'İletim: katılarda, dokunarak', 0, 368, 'iletim') + H(2, 'Konveksiyon: sıvı ve gazlarda', 0, 410, 'konveksiyon') +
    H(3, 'Işıma: boşlukta da olur ' + CK, 0, 452, 'ışıma') + H(4, 'Yalıtım: çift cam, mont, termos', 0, 494, 'Çift'),
   init: () => {},
   steps: [
     {d: 2.4, o: [1], f: s => { S.p6a = prog(s, 0, 0.3); petekIsi('p6f', ease(prog(s, 0.3, 2.2))); at('p6t1', 'opacity', prog(s, 0.2, 0.6)); }},
     {d: 2.6, o: [2], f: s => { S.p6b = prog(s, 0, 0.6); at('p6t2', 'opacity', prog(s, 0.2, 0.6)); }},
     {d: 2.2, o: [3], f: s => { at('p6i', 'opacity', prog(s, 0, 0.4)); at('p6i', 'transform', `translate(${8 * ((s * 1.2) % 1)},0)`); st('p6h', {opacity: prog(s, 0.4, 0.8)}); at('p6t3', 'opacity', prog(s, 0.2, 0.6)); }},
     {d: 0.5, o: [4], f: () => {}},
   ],
   late: time => { const a = S.p6a || 0, b = S.p6b || 0;
     for (let i = 0; i < 4; i++) { const x = ((time * 50 + i * 28) % 112); at('p6d' + i, 'cx', x); at('p6d' + i, 'opacity', a); }
     at('p6k', 'opacity', b); for (let i = 1; i <= 4; i++) $('p6k' + i).style.strokeDashoffset = -time * 30; }},

  // 8 ---------------------------------------------------------------
  {konu: 'Genleşme', soru: 'Genleşme nedir? Isıyla ilişkisi ne?',
   html: `<span class="qt">Isı alan maddenin sıcaklığı artar, tanecikleri <b>daha çok titreşir ve uzaklaşır</b>: madde <b>genleşir</b>. Soğuyunca <b>büzülür</b>.</span>` +
    SCENE(100, 220, `<g id="p7c">${Array.from({length: 9}, (_, i) => `<circle id="p7t${i}" cx="${30 + i * 38}" cy="80" r="15" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>`).join('')}</g>
      <line x1="${30 + 8 * 38 + 16}" y1="40" x2="${30 + 8 * 38 + 16}" y2="130" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="5 5"/>
      ${T('p7l0', 120, 150, 'L₀', '#e2e8f0', 16)}${ARR('p7d', '#F5C400')}`, false,
      EM('p7a', '🔥', 170, 120, 46, 'opacity:0')) +
    H(1, 'ΔL = L₀ · λ · ΔT', 0, 332, 'uzaması') + H(2, 'Isı alır → T artar → genleşir ' + CK, 0, 374, 'zincir') +
    H(3, 'Su 0 → 4 °C arası büzülür!', 0, 416, 'Dikkat'),
   init: () => {},
   steps: [
     {d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.4, 3.4)); st('p7a', {opacity: prog(s, 0, 0.4), transform: `scale(${1 + 0.08 * Math.sin(s * 14)})`});
       for (let i = 0; i < 9; i++) { at('p7t' + i, 'cx', 30 + i * (38 + 5 * k) + 2.5 * k * Math.sin(s * 25 + i)); at('p7t' + i, 'cy', 80 + 2.5 * k * Math.cos(s * 22 + i * 2));
         at('p7t' + i, 'fill', k > 0.5 ? '#fb923c' : '#94a3b8'); }
       const e = 30 + 8 * 38 + 16; arr('p7d', e, 150, e + 40 * k, 150, k > 0.05 ? 1 : 0, 'ΔL', 0, -10); }},
     {d: 0.5, o: [1, 2], f: () => {}},
     {d: 0.5, o: [3], f: () => {}},
   ]},
  ]};

// ---------- giriş animasyonu (onaylı): kombide ısınan su banyo ve oturma odasındaki peteklere gider, soğuyup döner ----------
KONU.hook = {
  soru: 'Kalorifer petekleri evi NASIL ısıtıyor?',
  html: `<svg viewBox="0 0 1080 1220" width="1080" height="1220" style="position:absolute;top:0;left:0">
    <defs>
      <marker id="gOkT" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fb923c"/></marker>
      <marker id="gOkM" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#60a5fa"/></marker>
    </defs>
    <g class="gOda" id="gBanyo">
      <rect x="70" y="330" width="940" height="410" rx="20" fill="#1f2a3a" stroke="#475569" stroke-width="4"/>
      <line x1="72" y1="372" x2="1008" y2="372" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="414" x2="1008" y2="414" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="456" x2="1008" y2="456" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="498" x2="1008" y2="498" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="540" x2="1008" y2="540" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="582" x2="1008" y2="582" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="624" x2="1008" y2="624" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="666" x2="1008" y2="666" stroke="#2b3547" stroke-width="2"/><line x1="72" y1="708" x2="1008" y2="708" stroke="#2b3547" stroke-width="2"/><line x1="112" y1="332" x2="112" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="154" y1="332" x2="154" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="196" y1="332" x2="196" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="238" y1="332" x2="238" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="280" y1="332" x2="280" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="322" y1="332" x2="322" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="364" y1="332" x2="364" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="406" y1="332" x2="406" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="448" y1="332" x2="448" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="490" y1="332" x2="490" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="532" y1="332" x2="532" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="574" y1="332" x2="574" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="616" y1="332" x2="616" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="658" y1="332" x2="658" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="700" y1="332" x2="700" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="742" y1="332" x2="742" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="784" y1="332" x2="784" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="826" y1="332" x2="826" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="868" y1="332" x2="868" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="910" y1="332" x2="910" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="952" y1="332" x2="952" y2="715" stroke="#2b3547" stroke-width="2"/><line x1="994" y1="332" x2="994" y2="715" stroke="#2b3547" stroke-width="2"/>
      <line x1="80" y1="715" x2="1000" y2="715" stroke="#64748b" stroke-width="4"/>
      <!-- ayna + lavabo -->
      <ellipse cx="430" cy="440" rx="62" ry="78" fill="#bae6fd" opacity=".35" stroke="#e2e8f0" stroke-width="6"/>
      <path d="M402 420 l30 -30 M418 448 l40 -40" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>
      <path d="M370 548 H490 Q486 602 430 606 Q374 602 370 548 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="4"/>
      <path d="M430 548 V528 H452" fill="none" stroke="#cbd5e1" stroke-width="7" stroke-linecap="round"/>
      <rect x="418" y="604" width="24" height="111" rx="8" fill="#e2e8f0"/>
      <!-- duşakabin -->
      <rect x="700" y="380" width="280" height="320" rx="6" fill="#7dd3fc" opacity=".14"/>
      <rect x="700" y="380" width="280" height="320" rx="6" fill="none" stroke="#e2e8f0" stroke-width="6"/>
      <line x1="840" y1="380" x2="840" y2="700" stroke="#e2e8f0" stroke-width="4"/>
      <rect x="806" y="520" width="8" height="60" rx="4" fill="#e2e8f0"/>
      <path d="M720 392 l40 70 M870 392 l40 70" stroke="#fff" stroke-width="5" opacity=".35" stroke-linecap="round"/>
      <path d="M950 700 V410 H900 V428" fill="none" stroke="#cbd5e1" stroke-width="7" stroke-linecap="round"/>
      <path d="M872 428 h56 l-8 16 h-40 z" fill="#cbd5e1"/>
      <g stroke="#7dd3fc" stroke-width="4" stroke-linecap="round" opacity=".85">
        <line x1="886" y1="452" x2="878" y2="490"/><line x1="900" y1="452" x2="900" y2="496"/><line x1="914" y1="452" x2="922" y2="490"/>
        <line x1="882" y1="510" x2="874" y2="548"/><line x1="900" y1="514" x2="900" y2="556"/><line x1="918" y1="510" x2="926" y2="548"/>
      </g>
      <rect x="692" y="700" width="296" height="15" rx="4" fill="#e2e8f0"/>
      <g font-family="Inter" font-weight="900">
        <rect x="100" y="350" width="14" height="50" rx="7" fill="#e5e7eb"/><circle cx="107" cy="404" r="11" fill="#ef4444"/>
        <rect x="104" y="368" width="6" height="34" fill="#ef4444"/>
        <text class="odaT" x="126" y="396" fill="#fff" font-size="34">10 °C</text></g>
      <g class="gPetek">
        <rect x="110" y="590" width="190" height="110" rx="10" fill="#94a3b8"/>
        <rect x="117" y="597" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="146" y="597" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="176" y="597" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="205" y="597" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="234" y="597" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="264" y="597" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <g class="gIsi" opacity="0"><rect x="117" y="597" width="23" height="96" rx="8" fill="#fb923c"/><rect x="146" y="597" width="23" height="96" rx="8" fill="#fb923c"/><rect x="176" y="597" width="23" height="96" rx="8" fill="#fb923c"/><rect x="205" y="597" width="23" height="96" rx="8" fill="#fb923c"/><rect x="234" y="597" width="23" height="96" rx="8" fill="#fb923c"/><rect x="264" y="597" width="23" height="96" rx="8" fill="#fb923c"/></g>
        <path d="M110 605 H284 V640 H126 V675 H284 V700" fill="none" stroke="#1e293b" stroke-width="8" stroke-linejoin="round" opacity=".3"/>
        <path class="yol ic" d="M110 605 H284 V640 H126 V675 H284 V700" fill="none" stroke="none"/>
      </g>
      <g class="havlu"><path d="M232 584 h58 v84 q-29 10 -58 0 z" fill="#f472b6"/><rect x="232" y="584" width="58" height="14" fill="#ec4899"/></g>
      <path class="dalga" data-i="0" d="M150 578 q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="#fdba74" stroke-width="6" stroke-linecap="round"/><path class="dalga" data-i="1" d="M205 578 q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="#fdba74" stroke-width="6" stroke-linecap="round"/><path class="dalga" data-i="2" d="M260 578 q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="#fdba74" stroke-width="6" stroke-linecap="round"/>
      <g fill="none" stroke-width="7" stroke-linecap="round">
        <path class="akis" d="M330 575 C 334 515, 328 420, 330 380" stroke="#fb923c" marker-end="url(#gOkT)"/>
        <path class="akis" d="M350 360 C 420 354, 570 354, 645 360" stroke="#fb923c" marker-end="url(#gOkT)"/>
        <path class="akis" d="M660 385 C 664 480, 664 635, 660 690" stroke="#60a5fa" marker-end="url(#gOkM)"/>
        <path class="akis" d="M645 707 C 570 713, 420 713, 345 707" stroke="#60a5fa" marker-end="url(#gOkM)"/>
      </g>
    </g>
    <g class="gOda" id="gOturma">
      <rect x="70" y="780" width="940" height="410" rx="20" fill="#2a2320" stroke="#475569" stroke-width="4"/>
      <rect x="72" y="1165" width="936" height="23" fill="#5b3a22"/>
      <line x1="80" y1="1165" x2="1000" y2="1165" stroke="#64748b" stroke-width="4"/>
      <!-- pencere -->
      <clipPath id="kesOturma"><rect x="140" y="830" width="130" height="130"/></clipPath>
      <rect x="140" y="830" width="130" height="130" rx="6" fill="#13203f"/>
      <g clip-path="url(#kesOturma)"><circle class="kar" data-x="160" data-y="10" data-h="1.0" data-ust="830" data-boy="130" r="4" fill="#fff"/><circle class="kar" data-x="190" data-y="60" data-h="1.3" data-ust="830" data-boy="130" r="3" fill="#fff"/><circle class="kar" data-x="220" data-y="30" data-h="0.9" data-ust="830" data-boy="130" r="5" fill="#fff"/><circle class="kar" data-x="250" data-y="90" data-h="1.1" data-ust="830" data-boy="130" r="3" fill="#fff"/><circle class="kar" data-x="175" data-y="110" data-h="0.8" data-ust="830" data-boy="130" r="3" fill="#fff"/><circle class="kar" data-x="240" data-y="5" data-h="1.2" data-ust="830" data-boy="130" r="4" fill="#fff"/></g>
      <rect x="140" y="830" width="130" height="130" rx="6" fill="none" stroke="#cbd5e1" stroke-width="7"/>
      <line x1="205" y1="830" x2="205" y2="960" stroke="#cbd5e1" stroke-width="5"/><line x1="140" y1="895" x2="270" y2="895" stroke="#cbd5e1" stroke-width="5"/>
      <rect x="128" y="960" width="154" height="10" rx="4" fill="#cbd5e1"/>
      <!-- televizyon + ünite -->
      <rect x="560" y="860" width="240" height="145" rx="10" fill="#0b1220" stroke="#475569" stroke-width="7"/>
      <rect x="572" y="872" width="216" height="121" rx="4" fill="#1e3a8a"/>
      <path d="M580 985 L640 925 L680 955 L720 905 L780 985 Z" fill="#22c55e" opacity=".85"/><circle cx="755" cy="895" r="12" fill="#facc15"/>
      <rect x="664" y="1005" width="32" height="20" fill="#475569"/>
      <rect x="560" y="1090" width="240" height="70" rx="8" fill="#7c4a24"/><line x1="680" y1="1090" x2="680" y2="1160" stroke="#5b3417" stroke-width="4"/>
      <circle cx="660" cy="1125" r="5" fill="#d6a85c"/><circle cx="700" cy="1125" r="5" fill="#d6a85c"/>
      <!-- koltuk -->
      <rect x="845" y="1035" width="150" height="70" rx="20" fill="#0d9488"/>
      <rect x="835" y="1085" width="170" height="55" rx="16" fill="#14b8a6"/>
      <rect x="826" y="1060" width="30" height="92" rx="12" fill="#0f766e"/><rect x="984" y="1060" width="24" height="92" rx="12" fill="#0f766e"/>
      <rect x="868" y="1050" width="48" height="38" rx="10" fill="#fde68a"/>
      <!-- lambader -->
      <line x1="815" y1="930" x2="815" y2="1160" stroke="#cbd5e1" stroke-width="6"/><path d="M790 930 h50 l-12 -42 h-26 z" fill="#fde68a"/>
      <g font-family="Inter" font-weight="900">
        <rect x="872" y="795" width="14" height="50" rx="7" fill="#e5e7eb"/><circle cx="879" cy="849" r="11" fill="#ef4444"/>
        <rect x="876" y="813" width="6" height="34" fill="#ef4444"/>
        <text class="odaT" x="898" y="841" fill="#fff" font-size="34">10 °C</text></g>
      <g class="gPetek">
        <rect x="110" y="1040" width="190" height="110" rx="10" fill="#94a3b8"/>
        <rect x="117" y="1047" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="146" y="1047" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="176" y="1047" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="205" y="1047" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="234" y="1047" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/><rect x="264" y="1047" width="23" height="96" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
        <g class="gIsi" opacity="0"><rect x="117" y="1047" width="23" height="96" rx="8" fill="#fb923c"/><rect x="146" y="1047" width="23" height="96" rx="8" fill="#fb923c"/><rect x="176" y="1047" width="23" height="96" rx="8" fill="#fb923c"/><rect x="205" y="1047" width="23" height="96" rx="8" fill="#fb923c"/><rect x="234" y="1047" width="23" height="96" rx="8" fill="#fb923c"/><rect x="264" y="1047" width="23" height="96" rx="8" fill="#fb923c"/></g>
        <path d="M110 1055 H284 V1090 H126 V1125 H284 V1150" fill="none" stroke="#1e293b" stroke-width="8" stroke-linejoin="round" opacity=".3"/>
        <path class="yol ic" d="M110 1055 H284 V1090 H126 V1125 H284 V1150" fill="none" stroke="none"/>
      </g>
      <path class="dalga" data-i="0" d="M150 1028 q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="#fdba74" stroke-width="6" stroke-linecap="round"/><path class="dalga" data-i="1" d="M205 1028 q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="#fdba74" stroke-width="6" stroke-linecap="round"/><path class="dalga" data-i="2" d="M260 1028 q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="#fdba74" stroke-width="6" stroke-linecap="round"/>
      <g fill="none" stroke-width="7" stroke-linecap="round">
        <path class="akis" d="M330 1025 C 334 965, 328 870, 330 830" stroke="#fb923c" marker-end="url(#gOkT)"/>
        <path class="akis" d="M350 810 C 420 804, 435 804, 510 810" stroke="#fb923c" marker-end="url(#gOkT)"/>
        <path class="akis" d="M525 835 C 529 930, 529 1085, 525 1140" stroke="#60a5fa" marker-end="url(#gOkM)"/>
        <path class="akis" d="M510 1157 C 435 1163, 420 1163, 345 1157" stroke="#60a5fa" marker-end="url(#gOkM)"/>
      </g>
    </g>
    <!-- borular: gidiş solda, dönüş sağda -->
    <g id="gBoru" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M440 110 H40 V1055 H110" stroke="#7f1d1d" stroke-width="16"/>
      <path d="M40 605 H110" stroke="#7f1d1d" stroke-width="16"/>
      <path d="M284 700 V728 H1045 V260 H640" stroke="#1e3a8a" stroke-width="16"/>
      <path d="M284 1150 V1178 H1045 V728" stroke="#1e3a8a" stroke-width="16"/>
    </g>
    <path class="yol sicak" d="M440 110 H40 V605 H110" fill="none" stroke="none"/>
    <path class="yol sicak" d="M40 605 V1055 H110" fill="none" stroke="none"/>
    <path class="yol soguk" d="M284 700 V728 H1045 V260 H640" fill="none" stroke="none"/>
    <path class="yol soguk" d="M284 1150 V1178 H1045 V728" fill="none" stroke="none"/>
    <!-- kombi -->
    <g id="gKombi" font-family="Inter" font-weight="900" text-anchor="middle">
      <rect x="440" y="10" width="200" height="290" rx="20" fill="#e5e7eb" stroke="#94a3b8" stroke-width="4"/>
      <rect x="460" y="24" width="160" height="50" rx="10" fill="#1f2937"/>
      <text id="gKombiT" x="540" y="60" fill="#4ade80" font-size="28">--</text>
      <rect x="455" y="85" width="170" height="200" rx="12" fill="#1f2937"/>
      <path d="M640 260 H612 V200 H468 V170 H612 V140 H468 V110 H440" fill="none" stroke="#475569" stroke-width="9" stroke-linejoin="round" opacity=".6"/>
      <path class="yol isit" d="M640 260 H612 V200 H468 V170 H612 V140 H468 V110 H440" fill="none" stroke="none"/>
      <g id="gAlev" transform="translate(540 278)">
        <path d="M0 0 C -26 -10, -20 -34, 0 -50 C 20 -34, 26 -10, 0 0 Z" fill="#f97316"/>
        <path d="M0 0 C -12 -6, -9 -20, 0 -30 C 9 -20, 12 -6, 0 0 Z" fill="#facc15"/>
      </g>
    </g>
    <g id="gDamla"></g>
    <g font-family="Inter" font-weight="900" text-anchor="middle">
      <g id="gEtS"><rect x="170" y="82" width="150" height="56" rx="28" fill="#dc2626"/><text x="245" y="121" fill="#fff" font-size="30">70 °C</text></g>
      <g id="gEtC"><rect x="770" y="232" width="150" height="56" rx="28" fill="#1d4ed8"/><text x="845" y="271" fill="#fff" font-size="30">50 °C</text></g>
    </g>
  </svg>
<div id="gAlt" style="position:absolute;left:0;right:0;top:1230px;text-align:center;font:700 40px Inter;color:#9ca3af;opacity:0">Sırrı, peteklerin içinde dolaşan <b style="color:#fff">SU</b>.</div>`,
  f: (t) => window.cizGiris(t)};
(function () {
const sınır=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const gir=(t,bas,sure=.5)=>sınır((t-bas)/sure);
const yumusak=x=>x*x*(3-2*x);
const renk=(f)=>{const a=[239,68,68],b=[59,130,246];return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*f)).join(',')})`};
const NS='http://www.w3.org/2000/svg', ARA=34, HIZ=230, GIRIS_SURE=6, TASARIM_SURE=8;
let damlalar=null;
function damlaKur(){damlalar=[];const g=$('gDamla');
  document.querySelectorAll('#hook .yol').forEach(y=>{const L=y.getTotalLength(), n=Math.floor(L/ARA);
    const tur=['ic','isit','sicak','soguk'].find(c=>y.classList.contains(c));
    for(let i=0;i<n;i++){const c=document.createElementNS(NS,'circle');c.setAttribute('r',tur==='ic'||tur==='isit'?7:8);
      (tur==='ic'||tur==='isit'?y.parentNode:g).appendChild(c);damlalar.push({c,y,L,i,tur});}});}
window.ciz=function(t){
  t=t*TASARIM_SURE/GIRIS_SURE;   // 8 sn'lik tasarım zaman çizelgesi 6 sn'ye sıkıştırılır
  if(!damlalar)damlaKur();
  document.querySelectorAll('#hook .gOda').forEach(o=>o.style.opacity=yumusak(gir(t,1.6,.5)));
  document.querySelectorAll('#hook .kar').forEach(c=>{const h=+c.dataset.h, y0=+c.dataset.y;
    c.setAttribute('cx',+c.dataset.x+Math.sin(t*1.5+y0)*6); c.setAttribute('cy',+c.dataset.ust+((y0+t*35*h)%+c.dataset.boy));});
  $('gKombi').style.opacity=yumusak(gir(t,1.0,.4));
  const al=yumusak(gir(t,1.3,.35));
  $('gAlev').setAttribute('transform',`translate(540 278) scale(${(.2+.8*al)*(1+.06*Math.sin(t*14))} ${(.2+.8*al)*(1+.1*Math.sin(t*11))})`);
  $('gAlev').style.opacity=al; $('gKombiT').textContent=t<1.3?'--':Math.round(20+50*yumusak(gir(t,1.3,1.4)))+' °C';
  const br=yumusak(gir(t,1.9,.4)); $('gBoru').style.opacity=br;
  document.querySelectorAll('#hook .gPetek, #hook .havlu').forEach(p=>p.style.opacity=br);
  const su=yumusak(gir(t,2.2,.5));
  damlalar.forEach(d=>{let x=(d.i*ARA+(t-2.2)*HIZ)%d.L; if(x<0)x+=d.L; const pt=d.y.getPointAtLength(x);
    d.c.setAttribute('cx',pt.x); d.c.setAttribute('cy',pt.y); d.c.style.opacity=t<2.2?0:su;
    const f=x/d.L; d.c.setAttribute('fill',d.tur==='sicak'?renk(0):d.tur==='soguk'?renk(1):d.tur==='ic'?renk(f):renk(1-f));});
  $('gEtS').style.opacity=yumusak(gir(t,2.7,.4)); $('gEtC').style.opacity=yumusak(gir(t,3.2,.4));
  [['gBanyo',2.9,3.5,24],['gOturma',3.2,3.8,22]].forEach(([id,bas,od,son])=>{const o=$(id);
    o.querySelector('.gIsi').setAttribute('opacity',.55*yumusak(gir(t,bas,2.7)));
    o.querySelector('.odaT').textContent=Math.round(10+(son-10)*yumusak(gir(t,od,3.2)))+' °C';
    o.querySelectorAll('.dalga').forEach(d=>{const i=+d.dataset.i, f=((t-3.4+i*.4)%1.4+1.4)%1.4/1.4, on=t>=3.4+i*.15?1:0;
      d.style.opacity=on*Math.sin(Math.PI*f)*.95; d.style.transform=`translateY(${-f*40}px)`;});
    const k=gir(t,4.0,1);
    o.querySelectorAll('.akis').forEach((a,i)=>{a.style.strokeDasharray='22 16'; a.style.strokeDashoffset=-(t*55)%38;
      a.style.opacity=yumusak(sınır(k*1.6-(i>1?.6:0)));});});
  $('gAlt').style.opacity=yumusak(gir(t,6.2,.5));
};

window.cizGiris = window.ciz;
})();
