// TYT · Isı ve Sıcaklık · TUZAK SORULAR (test kağıdı motoru: test_motor.js) · 10 tuzak soru, MEB TYT formatı
// Konu anlatımındaki 8 konunun her birinden bir TYT test sorusu. Kamera sayfadan sayfaya uzaklaşıp yakınlaşır.
// Her sayfa: soru kökü fosforla okunur → sahne animasyonu → kalem şekil üzerinde işaretler ve çözümü yazar (not kendi animasyonunun altında)
// → kalem doğru şıkkın etrafına kırmızı kutu çizer, şık büyüyüp parlar, "Cevap" + ✓. Sesler konu videosundaki gibi (kalem, çizgi, ✓, geçiş).

document.head.insertAdjacentHTML('beforeend', `<style>
.sk{display:grid;grid-template-columns:repeat(3,1fr);gap:1px 6px;margin-top:6px;font:14.5px/1.35 "Noto Serif",serif}
.sk.c1{grid-template-columns:1fr}
.sk>span{padding:1px 6px;border-radius:7px;border:2px solid transparent;justify-self:start}   /* kutu şıkkın yazısı kadar */
.bx{color:#15803D!important;border-color:#15803D!important}
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
.h .tz{color:#D62828}
.pl[stroke-dashoffset="100"]{opacity:0}
.hk-kart .tz{font:900 44px Inter;color:#F87171}
.cv-k{font-size:84px!important}
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
  PL(o0 + k, 0, 0, 0, 0, `id="p${i}b${k}" style="stroke:#16A34A;stroke-width:3.5"`)).join('')}</svg>`;
const kutuKur = (i, h) => { const e = $(`p${i}o${h}`), x = e.offsetLeft - 4, y = e.offsetTop - 3, w = e.offsetWidth + 8, hh = e.offsetHeight + 6;
  [[x, y, x + w, y], [x + w, y, x + w, y + hh], [x + w, y + hh, x, y + hh], [x, y + hh, x, y]].forEach((q, k) => {
    const l = $(`p${i}b${k}`); ['x1', 'y1', 'x2', 'y2'].forEach((a, j) => l.setAttribute(a, q[j])); }); };
// kutu kapanınca doğru şık büyüyüp parlar
const kutuIsik = (i, h) => { const k = drawnK(`p${i}b3`), e = $(`p${i}o${h}`);
  e.style.background = `rgba(22,163,74,${0.12 * k})`; e.style.transform = `scale(${1 + 0.1 * Math.sin(Math.PI * k)})`; };
const CEVAP = (o, h, x, y) => H(o, `Cevap: <span class="bx">${h}</span> ` + CK, x, y, 'cevap');


// sahne ve notlar şıkların bittiği yere kayar (nominal sahne üstü: 300)
const yerlestir = i => { const sk = $(`p${i}oA`).parentNode, q = sk.parentNode, sc = q.querySelector('.sc');
  const top = sk.offsetTop + sk.offsetHeight + 14, d = top - parseFloat(sc.style.top); sc.style.top = top + 'px';
  q.querySelectorAll(':scope > .h').forEach(h => { h.style.top = (parseFloat(h.style.top) + d) + 'px'; }); };
const kur = (i, h, ek) => () => { yerlestir(i); kutuKur(i, h); if (ek) ek(); };
// notlar: sahnenin altına sırayla (nominal y = 300 + sahne yüksekliği + 14 + 32·satır)
const N = (o, sh, satir, txt, w = '', x = 0) => H(o, txt, x, 300 + sh + 14 + 32 * satir, w);
const TZ = (o, sh, satir, txt) => N(o, sh, satir, `<span class="tz">⚠ Tuzak:</span> ${txt}`, 'tuzak');
const CV = (o, sh, satir, h, x = 0) => H(o, `Cevap: <span class="bx">${h}</span> ` + CK, x, 300 + sh + 14 + 32 * satir, 'cevap');
const S1 = ['Yalnız I', 'Yalnız II', 'I ve II', 'I ve III', 'II ve III'];
const S2 = ['Yalnız I', 'Yalnız III', 'I ve II', 'II ve III', 'I, II ve III'];
const S4 = ['Yalnız I', 'Yalnız II', 'I ve III', 'II ve III', 'I, II ve III'];
const DOT = (id, x, y, r, col) => `<circle id="${id}" data-x="${x}" data-y="${y}" cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
const ADIM = (n) => [{d: 0.6, o: n[0], f: () => {}}, {d: 0.6, o: n[1], f: () => {}}, {d: 0.6, o: n[2], f: () => {}}];

window.KONU = {
  meta: {satir: 690, sinif: 'TYT', ust1: '5 DAKİKADA TYT', ust2: 'TYT FİZİK', baslik: 'Isı ve Sıcaklık', unite: 'Isı ve Sıcaklık', kazanim: 'TYT',
    kalemMin: 0.4, sayfa: 5, sutun: 3, tur: 'TUZAK SORULAR', adim: 'TUZAK', bitti: '10 TUZAK ÇÖZÜLDÜ', kagitAlt: 'TYT TUZAK SORULARI',
    kapakAlt: '10 tuzak soru · animasyonlu çözüm', sonraki: 'Elektrostatik', kanca: 'TYT\'de bu TUZAKLARA düşme!',
    hookBaslik: 'ISI VE SICAKLIK', introSure: 8.2},
  P: [
  // 1 · ısı içerilmez; iç enerji ↔ sıcaklık ---------------------------------------------
  {konu: 'Isı ve İç Enerji',
   html: `<span class="qt">K kabında 80 °C sıcaklıkta 100 g su, L kabında 40 °C sıcaklıkta 1 kg su vardır.<br>Buna göre,<br>
     I. K'deki su, L'dekinden daha çok ısıya sahiptir.<br>II. L'deki suyun iç enerjisi, K'dekinden büyük olabilir.<br>
     III. K'deki su taneciklerinin ortalama kinetik enerjisi, L'dekilerinkinden büyüktür.<br>yargılarından hangileri doğrudur?</span>` +
    SK(0, S1, 1) +
    SCENE(300, 140, `<rect x="30" y="56" width="90" height="76" rx="10" fill="#fee2e2" stroke="#ef4444" stroke-width="3"/>
      ${[[52, 76], [96, 80], [60, 112], [100, 114]].map(([x, y], j) => DOT('p0k' + j, x, y, 6, '#ef4444')).join('')}
      <rect x="170" y="20" width="250" height="112" rx="12" fill="#dbeafe" stroke="#3b82f6" stroke-width="3"/>
      ${Array.from({length: 18}, (_, j) => DOT('p0l' + j, 192 + (j % 6) * 41, 42 + Math.floor(j / 6) * 32, 6, '#3b82f6')).join('')}
      ${T('p0a', 30, 48, 'K · 100 g · 80 °C', '#D62828', 13)}${T('p0b', 230, 14, 'L · 1 kg · 40 °C', '#1D4ED8', 13)}` +
      MARK(1, 76, 52, 114, 52) + MARK(2, 300, 18, 338, 18), false) +
    N(3, 140, 0, 'I. Cisim ısı içermez, ısı aktarılır ✗', 'içermez') + N(4, 140, 1, 'II. Çok tanecik → iç enerji büyük olabilir ✓', 'tanecik') +
    N(5, 140, 2, 'III. T büyük → ortalama E<sub>k</sub> büyük ✓', 'ortalama') + TZ(6, 140, 3, '"sıcak olanın ısısı fazladır"') +
    KUTU(0, 7) + CV(11, 140, 4, 'E'),
   init: kur(0, 'E'),
   steps: [{d: 3.2, o: [], f: s => { S.p0 = prog(s, 0, 0.5); }}, ...ADIM([[1, 2, 3, 4], [5, 6], [7, 8, 9, 10, 11]])],
   late: time => { kutuIsik(0, 'E'); const a = S.p0 || 0; titre('p0k', 4, time, 7 * a, 12); titre('p0l', 18, time, 2.5 * a, 3); }},

  // 2 · ΔT: °C = K ------------------------------------------------------------------
  {konu: 'Kelvin',
   html: `<span class="qt">Sıcaklığı 20 °C artırılan bir cismin sıcaklık artışı, Kelvin ölçeğinde kaç K'dir?</span>` + SK(1, ['20', '253', '273', '293', '313'], 1) +
    SCENE(300, 170, TERMO('p1c', 120, 10, 150) + TERMO('p1k', 300, 10, 150, '#2563eb') +
      T('p1cn', 108, 0, '°C', '#D62828', 15) + T('p1kn', 292, 0, 'K', '#2563eb', 15) +
      T('p1cv', 140, 0, '', '#D62828', 15) + T('p1kv', 320, 0, '', '#2563eb', 15) +
      MARK(1, 76, 118, 76, 78, '#B45309', 3, 'p1m1') + MARK(2, 256, 118, 256, 78, '#B45309', 3, 'p1m2') +
      T('p1d1', 30, 104, '+20', '#B45309', 15, 'opacity="0"') + T('p1d2', 210, 104, '+20', '#B45309', 15, 'opacity="0"'), false) +
    N(3, 170, 0, 'ΔT(°C) = ΔT(K): bölmeler eşit', 'bölmeler') + N(4, 170, 1, '303 K − 283 K = 20 K ✓', 'yirmi') +
    TZ(5, 170, 2, '20 + 273 = 293 bir sıcaklık, artış değil!') + KUTU(1, 6) + CV(10, 170, 3, 'A'),
   init: kur(1, 'A', () => { termo('p1c', 150, 40); termo('p1k', 150, 40); }),
   steps: [{d: 3.0, o: [], f: s => { const k = ease(prog(s, 0.2, 2.6)), h = 40 + 40 * k; termo('p1c', 150, h); termo('p1k', 150, h);
       $('p1cv').textContent = Math.round(10 + 20 * k) + ' °C'; $('p1kv').textContent = Math.round(283 + 20 * k) + ' K'; at('p1cv', 'y', 155 - h); at('p1kv', 'y', 155 - h); }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => { kutuIsik(1, 'A'); at('p1d1', 'opacity', prog(drawnK('p1m1'), 0.7, 1)); at('p1d2', 'opacity', prog(drawnK('p1m2'), 0.7, 1)); }},

  // 3 · ΔF = 1,8 · ΔC -------------------------------------------------------------
  {konu: 'Fahrenheit',
   html: `<span class="qt">Ocakta ısıtılan bir tencere suyun sıcaklığı 10 °C artıyor.<br>Buna göre, bu sıcaklık artışı Fahrenheit ölçeğinde kaç °F'dir?</span>` + SK(2, ['10', '18', '32', '42', '50'], 1) +
    SCENE(300, 180, `<path d="M150 70 h150 v80 q0 12 -12 12 h-126 q-12 0 -12 -12z" fill="#64748b" stroke="#334155" stroke-width="2.5"/>
      <rect x="140" y="62" width="170" height="10" rx="4" fill="#334155"/><rect x="130" y="168" width="190" height="8" rx="3" fill="#94a3b8"/>
      <g id="p2b" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" opacity="0"><path d="M190 54 q-8 -10 0 -20"/><path d="M225 54 q-8 -10 0 -20"/><path d="M260 54 q-8 -10 0 -20"/></g>` +
      ALEV('p2f1', 190, 168) + ALEV('p2f2', 260, 168) + TERMO('p2c', 60, 10, 150) + TERMO('p2fh', 380, 10, 150, '#7c3aed') +
      T('p2cn', 48, 0, '°C', '#D62828', 15) + T('p2fn', 370, 0, '°F', '#7c3aed', 15) + T('p2cv', 6, 0, '', '#D62828', 14) + T('p2fv', 326, 0, '', '#7c3aed', 14), false) +
    H(1, KS('Δ°C', '100'), 34, 300 + 194, 'bölü') + H(2, '=', 205, 300 + 206, 'eşittir') + H(3, KS('Δ°F', '180'), 352, 300 + 194, 'bölü') +
    N(4, 180, 2, 'Δ°F = 1,8 · 10 = 18 °F ✓', 'on') + TZ(5, 180, 3, '10 °C = 50 °F bir sıcaklık, artış değil!') + KUTU(2, 6) + CV(10, 180, 4, 'B'),
   init: kur(2, 'B', () => { termo('p2c', 150, 50); termo('p2fh', 150, 50); }),
   steps: [{d: 3.2, o: [], f: s => { const k = ease(prog(s, 0.4, 3.0)), h = 50 + 30 * k; alev('p2f1', 190, 168, prog(s, 0, 0.4), s); alev('p2f2', 260, 168, prog(s, 0, 0.4), s + 1);
       at('p2b', 'opacity', prog(s, 1.2, 1.8)); termo('p2c', 150, h); termo('p2fh', 150, h);
       $('p2cv').textContent = Math.round(20 + 10 * k) + ' °C'; $('p2fv').textContent = Math.round(68 + 18 * k) + ' °F'; at('p2cv', 'y', 155 - h); at('p2fv', 'y', 155 - h); }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: time => { kutuIsik(2, 'B'); at('p2b', 'transform', `translate(0,${-6 * ((time * 0.8) % 1)})`); }},

  // 4 · hal değişimi: T sabit, iç enerji artar ---------------------------------------
  {konu: 'Hal Değişimi',
   html: `<span class="qt">0 °C sıcaklıktaki buz, 0 °C sıcaklıktaki suya dönüşürken<br>I. sıcaklığı değişmez,<br>II. dışarıdan ısı alır,<br>III. iç enerjisi değişmez<br>
     yargılarından hangileri doğrudur?</span>` + SK(3, S2, 1) +
    SCENE(300, 150, `<ellipse cx="170" cy="128" rx="120" ry="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <ellipse id="p3su" cx="170" cy="124" rx="10" ry="4" fill="#93c5fd" opacity=".8"/>
      <rect id="p3b" x="130" y="44" width="80" height="78" rx="10" fill="#f0f9ff" stroke="#60a5fa" stroke-width="3"/>
      ${ARR('p3o1', '#D62828')}${ARR('p3o2', '#D62828')}
      <rect x="352" y="20" width="34" height="110" fill="none" stroke="#16181D" stroke-width="2"/><rect id="p3e" x="354" y="128" width="30" height="0" fill="#f59e0b"/>
      ${T('p3et', 330, 146, 'İç enerji', '#16181D', 13)}${T('p3t', 12, 30, 'T = 0 °C', '#1D4ED8', 16)}` + MARK(1, 10, 36, 82, 36), false) +
    N(2, 150, 0, 'I. Saf madde: hal değişirken T sabit ✓', 'sabit') + N(3, 150, 1, 'II. Erimek için ısı alır ✓', 'alır') +
    N(4, 150, 2, 'III. Isı alır → iç enerji artar ✗', 'artar') + TZ(5, 150, 3, '"T sabitse iç enerji de sabit"') + KUTU(3, 6) + CV(10, 150, 4, 'C'),
   init: kur(3, 'C'),
   steps: [{d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.4, 3.4)), a = ease(prog(s, 0, 0.6));
       arr('p3o1', 40, 84, 40 + 70 * a, 84, a > 0 ? 1 : 0, 'ısı', -8, -10); arr('p3o2', 300, 84, 300 - 70 * a, 84, a > 0 ? 1 : 0, 'ısı', -8, -10);
       at('p3b', 'height', 78 * (1 - k)); at('p3b', 'y', 44 + 78 * k); at('p3b', 'opacity', 1 - prog(k, 0.9, 1));
       at('p3su', 'rx', 10 + 90 * k); at('p3su', 'ry', 4 + 6 * k); at('p3e', 'height', 30 + 70 * k); at('p3e', 'y', 128 - 30 - 70 * k); }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(3, 'C')},

  // 5 · öz ısı kütleye bağlı değil ---------------------------------------------------
  {konu: 'Öz Isı ve Isı Sığası',
   html: `<span class="qt">Bir kaptaki suyun kütlesi iki katına çıkarılıyor.<br>Buna göre, suyun<br>I. öz ısısı,<br>II. ısı sığası,<br>III. sıcaklığını 1 °C artırmak için gereken ısı<br>
     niceliklerinden hangileri iki katına çıkar?</span>` + SK(4, S2, 1) +
    SCENE(300, 150, BEHER('p4a', 20, 40, 100, 100, 50, '#60a5fa') + `<g id="p4B" opacity="0">${BEHER('p4b', 150, 40, 100, 100, 100, '#60a5fa')}</g>` +
      T('p4am', 46, 128, 'm', '#fff', 18) + T('p4bm', 180, 128, '2m', '#fff', 18, 'opacity="0"') +
      T('p4c1', 22, 28, 'c = 1 cal/g·°C', '#1D4ED8', 12) + T('p4c2', 152, 28, 'c = 1 cal/g·°C', '#1D4ED8', 12, 'opacity="0"') +
      `<line x1="290" y1="140" x2="430" y2="140" stroke="#16181D" stroke-width="2"/><rect x="304" y="100" width="40" height="40" fill="#f59e0b"/>
       <rect id="p4s" x="372" y="140" width="40" height="0" fill="#f59e0b"/>${T('p4st', 300, 20, 'Isı sığası (m·c)', '#16181D', 13)}` +
      MARK(1, 150, 34, 236, 34), false) +
    N(2, 150, 0, 'I. Öz ısı maddeye özgü, değişmez ✗', 'özgü') + N(3, 150, 1, 'II. Isı sığası = m · c → 2 katı ✓', 'sığası') +
    N(4, 150, 2, 'III. Q = m · c · 1 → 2 katı ✓', 'gereken') + TZ(5, 150, 3, '"kütle artınca öz ısı da artar"') + KUTU(4, 6) + CV(10, 150, 4, 'D'),
   init: kur(4, 'D'),
   steps: [{d: 3.0, o: [], f: s => { const k = ease(prog(s, 0.2, 1.4)), b = ease(prog(s, 1.4, 2.8)); at('p4B', 'opacity', k); at('p4bm', 'opacity', k); at('p4c2', 'opacity', prog(s, 1.0, 1.5));
       at('p4s', 'height', 40 + 40 * b); at('p4s', 'y', 140 - 40 - 40 * b); }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(4, 'D')},

  // 6 · denge sıcaklığı ortalama değil -------------------------------------------------
  {konu: 'Isıl Denge',
   html: `<span class="qt">Isıca yalıtılmış bir kapta 20 °C'deki 200 g su ile 80 °C'deki 100 g su karıştırılıyor.<br>Buna göre,<br>
     I. Sıcak suyun verdiği ısı, soğuk suyun aldığı ısıya eşittir.<br>II. Suların sıcaklık değişimleri eşittir.<br>III. Denge sıcaklığı 50 °C'dir.<br>
     yargılarından hangileri doğrudur?</span>` + SK(5, S1, 1) +
    SCENE(300, 160, `<g id="p5j1"><path d="M20 20 h70 v70 q0 10 -10 10 h-50 q-10 0 -10 -10z" fill="#bfdbfe" stroke="#475569" stroke-width="2.5"/>${T('p5j1t', 26, 66, '200 g', '#1D4ED8', 13)}${T('p5j1u', 28, 84, '20 °C', '#1D4ED8', 13)}</g>
      <g id="p5j2"><path d="M350 20 h70 v70 q0 10 -10 10 h-50 q-10 0 -10 -10z" fill="#fed7aa" stroke="#475569" stroke-width="2.5"/>${T('p5j2t', 358, 66, '100 g', '#c2410c', 13)}${T('p5j2u', 358, 84, '80 °C', '#c2410c', 13)}</g>
      <path id="p5a1" d="M90 40 q60 0 110 70" fill="none" stroke="#60a5fa" stroke-width="5" stroke-dasharray="8 6" opacity="0"/>
      <path id="p5a2" d="M350 40 q-60 0 -110 70" fill="none" stroke="#fb923c" stroke-width="5" stroke-dasharray="8 6" opacity="0"/>
      <path d="M150 110 h140 q-6 44 -70 46 q-64 -2 -70 -46z" fill="#e2e8f0" stroke="#475569" stroke-width="2.5"/>
      <path id="p5k" d="M156 116 h128 q-6 34 -64 36 q-58 -2 -64 -36z" fill="#93c5fd" opacity="0"/>${T('p5kt', 192, 140, '', '#16181D', 15)}` + MARK(1, 190, 146, 252, 146), false) +
    N(2, 160, 0, 'I. Q<sub>verilen</sub> = Q<sub>alınan</sub> ✓', 'verilen') + N(3, 160, 1, '200 · (T − 20) = 100 · (80 − T) → T = 40 °C', 'kırk') +
    N(4, 160, 2, 'II. ΔT: 20 ve 40, eşit değil ✗   III. ✗', 'değil') + TZ(5, 160, 3, 'ortalama alıp 50 °C demek') + KUTU(5, 6) + CV(10, 160, 4, 'A'),
   init: kur(5, 'A'),
   steps: [{d: 3.4, o: [], f: s => { const k = ease(prog(s, 0, 1.2)), c = ease(prog(s, 0.8, 3.0));
       at('p5j1', 'transform', `rotate(${35 * k} 90 30)`); at('p5j2', 'transform', `rotate(${-35 * k} 350 30)`); at('p5a1', 'opacity', k * (1 - prog(s, 2.4, 2.8))); at('p5a2', 'opacity', k * (1 - prog(s, 2.4, 2.8)));
       at('p5k', 'opacity', c); $('p5kt').textContent = s < 1 ? '' : Math.round(lerp(60, 40, c)) + ' °C'; }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: time => { kutuIsik(5, 'A'); ['p5a1', 'p5a2'].forEach(id => { $(id).style.strokeDashoffset = -time * 40; }); }},

  // 7 · ısı iç enerjiye göre değil, sıcaklığa göre akar -----------------------------------
  {konu: 'Isı Akışı',
   html: `<span class="qt">İç enerjisi çok büyük olan 10 °C sıcaklıktaki havuz suyuna, 50 °C sıcaklıktaki küçük bir demir bilye bırakılıyor.<br>
     Buna göre, ısı alışverişi ile ilgili aşağıdakilerden hangisi doğrudur?</span>` +
    SK(6, ['Isı, iç enerjisi büyük olan sudan bilyeye akar.', 'Isı, bilyeden suya akar.', 'İç enerjiler eşitlenince ısı akışı durur.',
      'Isı alışverişi olmaz.', 'Isı, kütlesi büyük olandan küçük olana akar.'], 1) +
    SCENE(300, 160, `<rect x="10" y="40" width="420" height="114" rx="8" fill="#bfdbfe" stroke="#475569" stroke-width="2.5"/>
      <path d="M10 40 q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#3b82f6" stroke-width="3"/>
      ${[0, 1, 2, 3, 4, 5].map(j => ARR('p6o' + j, '#D62828')).join('')}
      <circle id="p6b" cx="220" cy="10" r="14" fill="#ef4444" stroke="#7f1d1d" stroke-width="2.5"/>
      ${T('p6bt', 244, 14, '50 °C', '#D62828', 14)}${T('p6st', 20, 140, 'Havuz: 10 °C · iç enerji çok büyük', '#1D4ED8', 13)}` + MARK(1, 64, 146, 106, 146) + MARK(2, 150, 146, 262, 146, '#D62828'), false) +
    N(3, 160, 0, 'Isı, sıcaktan → soğuğa akar ✓', 'sıcaktan') + N(4, 160, 1, 'Sıcaklıklar eşitlenince durur (iç enerji değil)', 'eşitlenince') +
    TZ(5, 160, 2, '"iç enerjisi büyükten küçüğe akar"') + KUTU(6, 6) + CV(10, 160, 3, 'B'),
   init: kur(6, 'B'),
   steps: [{d: 3.4, o: [], f: s => { const k = ease(prog(s, 0, 1.0)), y = 10 + 90 * k; at('p6b', 'cy', y); at('p6bt', 'y', y + 4);
       const a = ease(prog(s, 1.0, 2.4)); for (let j = 0; j < 6; j++) { const t = j * Math.PI / 3; arr('p6o' + j, 220 + 18 * Math.cos(t), y + 18 * Math.sin(t), 220 + (18 + 40 * a) * Math.cos(t), y + (18 + 30 * a) * Math.sin(t), a > 0 ? 0.9 : 0, ''); }
       $('p6bt').textContent = Math.round(50 - 38 * ease(prog(s, 1.2, 3.2))) + ' °C'; }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(6, 'B')},

  // 8 · ışıma: madde gerekmez, renk etkisi -------------------------------------------
  {konu: 'Işıma',
   html: `<span class="qt">Güneş altında aynı süre bekletilen özdeş siyah ve beyaz tişörtlerle ilgili,<br>I. Siyah tişört daha çok ısınır.<br>
     II. Güneş'in ısısı Dünya'ya iletim yoluyla ulaşır.<br>III. Beyaz tişört, üzerine gelen ışınların daha çoğunu yansıtır.<br>yargılarından hangileri doğrudur?</span>` + SK(7, S1, 1) +
    SCENE(300, 160, `<circle cx="36" cy="30" r="24" fill="#fde047" stroke="#f59e0b" stroke-width="3"/>
      <line x1="100" y1="40" x2="430" y2="40" stroke="#475569" stroke-width="2"/>
      <path id="p7s" d="M140 46 l-34 18 l10 22 l14 -6 v62 h76 v-62 l14 6 l10 -22 l-34 -18 q-18 14 -36 0z" fill="#1f2937" stroke="#111827" stroke-width="2"/>
      <path d="M300 46 l-34 18 l10 22 l14 -6 v62 h76 v-62 l14 6 l10 -22 l-34 -18 q-18 14 -36 0z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
      <g id="p7r" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" opacity="0"><path d="M58 44 l92 56"/><path d="M60 30 l250 64"/><path d="M310 94 l40 -50"/></g>
      ${T('p7a', 128, 162, '', '#D62828', 14)}${T('p7b', 290, 162, '', '#1D4ED8', 14)}` + MARK(1, 126, 168, 178, 168, '#D62828') + MARK(2, 288, 168, 340, 168), false) +
    N(3, 160, 0, 'I. Koyu renk çok soğurur ✓', 'koyu') + N(4, 160, 1, 'II. Uzay boşluk: ışıma ile gelir ✗', 'ışıma') +
    N(5, 160, 2, 'III. Açık renk çok yansıtır ✓', 'açık') + TZ(6, 160, 3, '"Güneş ısısı iletimle gelir"') + KUTU(7, 7) + CV(11, 160, 4, 'D'),
   init: kur(7, 'D'),
   steps: [{d: 3.2, o: [], f: s => { at('p7r', 'opacity', prog(s, 0, 0.5)); const k = ease(prog(s, 0.5, 3.0));
       $('p7a').textContent = Math.round(25 + 20 * k) + ' °C'; $('p7b').textContent = Math.round(25 + 5 * k) + ' °C'; }},
     ...ADIM([[1, 2, 3, 4], [5, 6], [7, 8, 9, 10, 11]])],
   late: time => { kutuIsik(7, 'D'); $('p7r').style.strokeDasharray = '10 8'; $('p7r').style.strokeDashoffset = -time * 40; }},

  // 9 · delikli levha: delik de büyür ------------------------------------------------
  {konu: 'Yüzeyce Genleşme',
   html: `<span class="qt">Ortasında dairesel delik bulunan bir metal levha düzgün biçimde ısıtılıyor.<br>Buna göre,<br>I. Levhanın yüzey alanı artar.<br>II. Deliğin çapı küçülür.<br>
     III. Isıtılmadan önce delikten zor geçen bir bilye, ısıtıldıktan sonra delikten daha kolay geçer.<br>yargılarından hangileri doğrudur?</span>` + SK(8, S4, 1) +
    SCENE(300, 160, `<line x1="80" y1="40" x2="360" y2="40" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 5"/><line x1="80" y1="140" x2="360" y2="140" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 5"/>
      <g id="p8l"><path d="M120 50 h200 v80 h-200z M220 72 a18 18 0 1 0 0.1 0z" fill="#94a3b8" fill-rule="evenodd" stroke="#475569" stroke-width="2.5"/></g>
      <circle id="p8b" cx="220" cy="0" r="19" fill="#475569"/>` + ALEV('p8f1', 160, 156) + ALEV('p8f2', 280, 156) + MARK(1, 196, 90, 244, 90, '#D62828'), false) +
    N(2, 160, 0, 'I. Levha her yönde genleşir ✓', 'genleşir') + N(3, 160, 1, 'II. Delik de levha gibi büyür ✗', 'büyür') +
    N(4, 160, 2, 'III. Delik büyür → bilye kolay geçer ✓', 'kolay') + TZ(5, 160, 3, '"ısınınca delik küçülür"') + KUTU(8, 6) + CV(10, 160, 4, 'C'),
   init: kur(8, 'C'),
   steps: [{d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.3, 2.6)); alev('p8f1', 160, 156, prog(s, 0, 0.4), s); alev('p8f2', 280, 156, prog(s, 0, 0.4), s + 1);
       at('p8l', 'transform', `translate(220 90) scale(${1 + 0.16 * k}) translate(-220 -90)`); at('p8l', 'fill', '');
       $('p8l').firstChild.setAttribute('fill', k > 0.5 ? '#fb923c' : '#94a3b8'); const b = ease(prog(s, 2.6, 3.5)); at('p8b', 'cy', 10 + 80 * b); at('p8b', 'opacity', 1 - prog(s, 3.3, 3.5)); }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(8, 'C')},

  // 10 · suyun 0–4 °C anomalisi ------------------------------------------------------
  {konu: 'Suyun Genleşmesi',
   html: `<span class="qt">Bir miktar su 0 °C'den 4 °C'ye kadar ısıtılıyor.<br>Buna göre, suyun<br>I. hacmi artar,<br>II. özkütlesi artar,<br>III. kütlesi değişmez<br>
     yargılarından hangileri doğrudur?</span>` + SK(9, S1, 1) +
    SCENE(300, 160, `<rect x="40" y="10" width="60" height="140" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="2.5"/>
      ${Array.from({length: 7}, (_, j) => `<line x1="40" y1="${30 + j * 18}" x2="54" y2="${30 + j * 18}" stroke="#475569" stroke-width="1.5"/>`).join('')}
      <rect id="p9s" x="43" y="52" width="54" height="95" rx="4" fill="#60a5fa" opacity=".8"/>${T('p9t', 110, 60, '0 °C', '#1D4ED8', 16)}
      <rect x="200" y="20" width="230" height="130" rx="8" fill="#bfdbfe" stroke="#475569" stroke-width="2"/><rect x="200" y="20" width="230" height="22" fill="#f8fafc" stroke="#93c5fd" stroke-width="2"/>
      ${T('p9g1', 290, 36, 'buz 0 °C', '#1D4ED8', 12)}${T('p9g2', 282, 140, 'en dipte 4 °C', '#1D4ED8', 12)}` + MARK(1, 36, 52, 110, 52, '#D62828'), false,
      EM('p9f', '🐟', 330, 90, 26)) +
    N(2, 160, 0, 'I. 0 → 4 °C: su büzülür, hacim azalır ✗', 'büzülür') + N(3, 160, 1, 'II. Kütle sabit, hacim azalır → özkütle artar ✓', 'özkütle') +
    N(4, 160, 2, 'III. Kütle değişmez ✓', 'kütle') + TZ(5, 160, 3, '"ısınan her madde genleşir"') + KUTU(9, 6) + CV(10, 160, 4, 'E'),
   init: kur(9, 'E'),
   steps: [{d: 3.2, o: [], f: s => { const k = ease(prog(s, 0.3, 2.8)); at('p9s', 'y', 52 + 8 * k); at('p9s', 'height', 95 - 8 * k); $('p9t').textContent = (4 * k).toFixed(0) + ' °C'; }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: time => { kutuIsik(9, 'E'); st('p9f', {transform: `translateX(${12 * Math.sin(time * 1.2)}px)`}); }},
  ]};

// ---------- giriş: 10 tuzak kartı → her biri bir test sorusuna döner ----------
(function () {
  KONU.hook = {
    soru: 'TYT\'de bu TUZAKLARA düşme!',
    html: Array.from({length: 10}, (_, i) => `<div class="hk-kart" id="hkk${i}" style="left:${80 + (i % 2) * 480}px;top:${20 + Math.floor(i / 2) * 196}px;height:172px">
        <div class="yz"><span class="ik">⚠️</span><span class="tz">TUZAK ${i + 1}</span></div>
        <div class="ar"><span class="sn">SORU ${i + 1}</span><span class="op">${'ABCDE'.split('').map(h => `<i>${h}</i>`).join('')}</span></div></div>`).join('') +
      `<div class="hk-alt" id="hkAlt">10 TUZAK · <b>10 SORU</b></div>`,
    f: t => {
      for (let i = 0; i < 10; i++) {
        const e = $('hkk' + i), a = prog(t, 0.7 + i * 0.18, 1.0 + i * 0.18);
        const fl = prog(t, 3.0 + i * 0.13, 3.45 + i * 0.13), sx = Math.abs(Math.cos(Math.PI * fl));
        e.style.opacity = a; e.style.transform = `translateY(${(1 - ease(a)) * 40}px) scaleX(${sx})`;
        e.querySelector('.yz').style.opacity = fl < 0.5 ? 1 : 0; e.querySelector('.ar').style.opacity = fl >= 0.5 ? 1 : 0;
        e.style.borderColor = fl >= 0.5 ? '#F5A300' : '#ef4444';
      }
      const al = prog(t, 5.3, 5.8); st('hkAlt', {opacity: al, transform: `scale(${0.8 + 0.2 * ease(al)})`});
    }};
})();
