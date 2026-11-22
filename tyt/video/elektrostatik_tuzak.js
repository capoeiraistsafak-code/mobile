// TYT · Elektrostatik · TUZAK SORULAR (test kağıdı motoru: test_motor.js) · 10 tuzak soru, MEB TYT formatı, 2 bölüm × 5 soru
// Format: ../FORMAT_TUZAK.md. Ekran notları tam cümle, semboller adıyla (CLAUDE.md kuralı).


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
.cv-bolum{margin-top:34px;font:900 64px Inter;color:#fff;background:#D62828;padding:10px 40px;border-radius:999px;box-shadow:0 10px 30px rgba(214,40,40,.45);letter-spacing:1px}
.cv-bolum+.cv-t{margin-top:30px}
.hk-alt b{font-size:72px}
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


// ---------- elektrostatik yardımcıları ----------
const PLUS = '#D62828', EKSI = '#1D4ED8';
const ISR = (id, x, y, s, extra = '') => T(id, x - 5, y + 6, s, s === '+' ? PLUS : EKSI, 18, extra);          // yük işareti
const KURE = (id, x, y, r, fill = '#e2e8f0') => `<circle id="${id}" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#475569" stroke-width="2.5"/>`;
const OK = (id, col) => ARR(id, col);

window.KONU = {
  meta: {satir: 690, sinif: 'TYT', ust1: '3 DAKİKADA TYT', ust2: 'TYT FİZİK', baslik: 'Elektrostatik', unite: 'Elektrostatik', kazanim: 'TYT',
    kalemMin: 0.4, sayfa: 5, sutun: 3, tur: 'TUZAK SORULAR', adim: 'TUZAK', bitti: '10 TUZAK ÇÖZÜLDÜ', kagitAlt: 'TYT TUZAK SORULARI',
    kapakAlt: '10 tuzak soru · animasyonlu çözüm', sonraki: 'Elektrik ve Manyetizma', kanca: 'TYT\'de bu TUZAKLARA düşme!',
    hookBaslik: 'ELEKTROSTATİK', introSure: 8.2},
  P: [
  // 1 · sürtünme: elektron geçer, proton değil ------------------------------------------
  {konu: 'Sürtünmeyle Yüklenme',
   html: `<span class="qt">Cam çubuk ipek kumaşa sürtüldüğünde cam çubuk pozitif (+) yükle yükleniyor.<br>Buna göre,<br>
     I. Cam çubuktan ipeğe elektron geçmiştir.<br>II. İpek kumaş negatif (−) yükle yüklenmiştir.<br>III. İpekten cam çubuğa proton geçmiştir.<br>
     yargılarından hangileri doğrudur?</span>` + SK(0, S1, 1) +
    SCENE(300, 150, `<rect x="40" y="96" width="360" height="40" rx="10" fill="#fbcfe8" stroke="#be185d" stroke-width="2.5"/>
      <g id="p0c"><rect x="110" y="62" width="220" height="22" rx="11" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5"/>
        ${[0, 1, 2, 3, 4].map(j => ISR('p0p' + j, 140 + j * 40, 67, '+', 'opacity="0"')).join('')}</g>
      ${[0, 1, 2, 3, 4].map(j => `<circle id="p0e${j}" cx="${140 + j * 40}" cy="74" r="5" fill="${EKSI}" opacity="0"/>`).join('')}
      ${[0, 1, 2, 3, 4].map(j => ISR('p0m' + j, 90 + j * 62, 110, '−', 'opacity="0"')).join('')}
      ${T('p0a', 150, 50, 'Cam çubuk', '#0369a1', 14)}${T('p0b', 180, 150, 'İpek kumaş', '#be185d', 14)}` +
      MARK(1, 148, 55, 222, 55) + MARK(2, 178, 155, 256, 155), false) +
    N(3, 150, 0, 'I ✓ Elektronlar camdan ipeğe geçer.', 'camdan') + N(4, 150, 1, 'II ✓ Elektron alan ipek negatif (−) olur.', 'negatif') +
    N(5, 150, 2, 'III ✗ yanlış: Protonlar çekirdekte kalır.', 'proton') + TZ(6, 150, 3, '"Sürtünmede proton geçer" sanmak') +
    KUTU(0, 7) + CV(11, 150, 4, 'C'),
   init: kur(0, 'C'),
   steps: [{d: 3.6, o: [], f: s => { const sur = s < 2.6 ? 34 * Math.sin(s * 7) : 0; at('p0c', 'transform', `translate(${sur} 0)`);
       for (let j = 0; j < 5; j++) { const a = 0.3 + j * 0.45, k = ease(prog(s, a, a + 0.45));
         at('p0e' + j, 'opacity', s > a && k < 1 ? 1 : 0); at('p0e' + j, 'cx', 140 + j * 40 + sur * (1 - k) + (90 + j * 62 - 140 - j * 40) * k); at('p0e' + j, 'cy', 74 + 34 * k);
         at('p0p' + j, 'opacity', prog(s, a + 0.1, a + 0.3)); at('p0m' + j, 'opacity', prog(s, a + 0.4, a + 0.6)); } }},
     ...ADIM([[1, 2, 3, 4], [5, 6], [7, 8, 9, 10, 11]])],
   late: () => kutuIsik(0, 'C')},

  // 2 · özdeş kürelerde dokunma: toplam yük eşit paylaşılır ------------------------------------
  {konu: 'Dokunmayla Yüklenme',
   html: `<span class="qt">Özdeş iletken K ve L kürelerinin yükleri sırasıyla +8q ve −2q'dur. Küreler birbirine dokundurulup ayrılıyor.<br>
     Buna göre, dokunmadan sonra K küresinin yükü kaçtır?</span>` + SK(1, ['+6q', '+3q', '+5q', '0', '−3q'], 1) +
    SCENE(300, 140, `<g id="p1K">${KURE('p1Kc', 0, 0, 40, '#fee2e2')}${T('p1Kt', -20, 6, '+8q', PLUS, 18)}${T('p1Kn', -6, 62, 'K', '#16181D', 16)}</g>
      <g id="p1L">${KURE('p1Lc', 0, 0, 40, '#dbeafe')}${T('p1Lt', -20, 6, '−2q', EKSI, 18)}${T('p1Ln', -5, 62, 'L', '#16181D', 16)}</g>
      ${[0, 1, 2].map(j => `<circle id="p1e${j}" r="4.5" fill="${EKSI}" opacity="0"/>`).join('')}` +
      MARK(1, 60, 138, 160, 138) + MARK(2, 280, 138, 380, 138), false) +
    N(3, 140, 0, 'Toplam yük: +8q + (−2q) = +6q', 'toplam') + N(4, 140, 1, 'Özdeş küreler toplam yükü eşit paylaşır.', 'eşit') +
    N(5, 140, 2, 'Her kürenin yükü: ' + KS('+6q', '2') + ' = +3q', 'üç') + TZ(6, 140, 4, '"Her küre +6q olur" sanmak') +
    KUTU(1, 7) + CV(11, 140, 5, 'B'),
   init: kur(1, 'B', () => { at('p1K', 'transform', 'translate(110 60)'); at('p1L', 'transform', 'translate(330 60)'); }),
   steps: [{d: 3.6, o: [], f: s => { const g = ease(prog(s, 0.2, 1.2)) * (1 - ease(prog(s, 2.4, 3.3)));   // yaklaş, dokun, ayrıl
       at('p1K', 'transform', `translate(${110 + 70 * g} 60)`); at('p1L', 'transform', `translate(${330 - 70 * g} 60)`);
       for (let j = 0; j < 3; j++) { const a = 1.2 + j * 0.3, k = prog(s, a, a + 0.4); at('p1e' + j, 'opacity', k > 0 && k < 1 ? 1 : 0);
         at('p1e' + j, 'cx', 245 - 40 * k); at('p1e' + j, 'cy', 60 + 8 * Math.sin(j * 2)); }
       const d = s > 2.2; $('p1Kt').textContent = d ? '+3q' : '+8q'; $('p1Lt').textContent = d ? '+3q' : '−2q';
       at('p1Lt', 'fill', d ? PLUS : EKSI); at('p1Lc', 'fill', d ? '#fee2e2' : '#dbeafe'); }},
     ...ADIM([[1, 2, 3, 4], [5, 6], [7, 8, 9, 10, 11]])],
   late: () => kutuIsik(1, 'B')},

  // 3 · farklı yarıçap: yük yarıçapla orantılı ------------------------------------------------
  {konu: 'Farklı Kürelerde Dokunma',
   html: `<span class="qt">Yarıçapları r ve 2r olan iletken K ve L kürelerinden K'nin yükü +9q, L ise nötrdür. Küreler birbirine dokundurulup ayrılıyor.<br>
     Buna göre, kürelerin son yükleri nedir?</span>` +
    SK(2, ['K: +3q, L: +6q', 'K: +4,5q, L: +4,5q', 'K: +6q, L: +3q', 'K: +9q, L: 0', 'K: 0, L: +9q'], 1) +
    SCENE(300, 150, `<g id="p2K">${KURE('p2Kc', 0, 0, 26, '#fee2e2')}${T('p2Kt', -14, 18, '+9q', PLUS, 13)}${T('p2Kn', -5, 46, 'K', '#16181D', 15)}</g>
      <g id="p2L">${KURE('p2Lc', 0, 0, 52, '#f1f5f9')}${T('p2Lt', -8, 30, '0', '#16181D', 17)}${T('p2Ln', -5, 72, 'L', '#16181D', 15)}</g>` +
      MARK(1, 0, 0, 0, 0, '#B45309', 3, 'p2r1') + MARK(2, 0, 0, 0, 0, '#B45309', 3, 'p2r2') +
      T('p2rr', 0, 0, '', '#B45309', 13) + T('p2rR', 0, 0, '', '#B45309', 13), false) +
    N(3, 150, 0, 'Yük, yarıçapla orantılı paylaşılır.', 'yarıçapla') +
    N(4, 150, 1, 'K küresi: ' + KS('r', '3r') + ' · 9q = +3q', 'üç') + N(5, 150, 2.6, 'L küresi: ' + KS('2r', '3r') + ' · 9q = +6q', 'altı') +
    TZ(6, 150, 4.2, '"Yük eşit paylaşılır (+4,5q)" sanmak') + KUTU(2, 7) + CV(11, 150, 5.2, 'A'),
   init: kur(2, 'A', () => { at('p2K', 'transform', 'translate(110 70)'); at('p2L', 'transform', 'translate(300 70)');
     for (const [id, x, r] of [['p2r1', 110, 26], ['p2r2', 300, 52]]) { at(id, 'x1', x); at(id, 'y1', 70); at(id, 'x2', x + r * 0.707); at(id, 'y2', 70 - r * 0.707); } }),
   steps: [{d: 3.6, o: [], f: s => { const g = ease(prog(s, 0.2, 1.2)) * (1 - ease(prog(s, 2.4, 3.3)));
       at('p2K', 'transform', `translate(${110 + 112 * g} 70)`);
       const d = s > 2.0; $('p2Kt').textContent = d ? '+3q' : '+9q'; $('p2Lt').textContent = d ? '+6q' : '0';
       at('p2Lt', 'fill', d ? PLUS : '#16181D'); at('p2Lc', 'fill', d ? '#fee2e2' : '#f1f5f9'); at('p2Lt', 'x', d ? -18 : -8); }},
     ...ADIM([[1, 2, 3], [4, 5, 6], [7, 8, 9, 10, 11]])],
   late: () => { kutuIsik(2, 'A'); $('p2rr').textContent = drawnK('p2r1') > 0.9 ? 'r' : ''; $('p2rR').textContent = drawnK('p2r2') > 0.9 ? '2r' : '';
     at('p2rr', 'x', 128); at('p2rr', 'y', 48); at('p2rR', 'x', 340); at('p2rR', 'y', 30); }},

  // 4 · etki: net yük değişmez -----------------------------------------------------------
  {konu: 'Etkiyle Yüklenme',
   html: `<span class="qt">Nötr iletken bir küreye, pozitif (+) yüklü bir çubuk dokundurulmadan yaklaştırılıyor.<br>Buna göre,<br>
     I. Kürenin çubuğa yakın yüzü negatif (−) yüklenir.<br>II. Kürenin net yükü pozitif (+) olur.<br>III. Çubuk uzaklaştırılınca küre yine nötr olur.<br>
     yargılarından hangileri doğrudur?</span>` + SK(3, S1, 1) +
    SCENE(300, 150, `${KURE('p3k', 280, 75, 56)}
      ${[0, 1, 2, 3, 4, 5].map(j => ISR('p3e' + j, 0, 0, '−') + ISR('p3p' + j, 0, 0, '+')).join('')}
      <g id="p3c"><rect x="0" y="62" width="130" height="26" rx="13" fill="#fee2e2" stroke="${PLUS}" stroke-width="2.5"/>
        ${[0, 1, 2, 3].map(j => ISR('p3cp' + j, 22 + j * 28, 69, '+')).join('')}</g>
      ${T('p3n', 240, 148, 'Nötr küre', '#16181D', 13)}` + MARK(1, 238, 153, 304, 153), false) +
    N(2, 150, 0, 'I ✓ Elektronlar çubuğa yakın yüze toplanır.', 'yakın') + N(3, 150, 1, 'II ✗ yanlış: Dokunma yok, net yük sıfır.', 'sıfır') +
    N(4, 150, 2, 'III ✓ Çubuk gidince yükler yine karışır.', 'karışır') + TZ(5, 150, 3, '"Yaklaşan çubuk küreyi yükler" sanmak') +
    KUTU(3, 6) + CV(10, 150, 4, 'D'),
   init: kur(3, 'D'),
   steps: [{d: 3.6, o: [], f: s => { const yk = ease(prog(s, 0, 1.0)) * (1 - ease(prog(s, 2.6, 3.4))), ay = ease(prog(s, 0.6, 1.6)) * (1 - ease(prog(s, 2.8, 3.6)));
       at('p3c', 'transform', `translate(${-220 + 310 * yk} 0)`); at('p3c', 'opacity', yk > 0.02 ? 1 : 0);
       // iletkende yalnız elektronlar hareket eder: + (proton) yerinde kalır, − (elektron) çubuğa yakın yüze kayar
       for (let j = 0; j < 6; j++) { const px = [262, 300, 250, 312, 268, 296][j], py = [48, 52, 78, 80, 104, 102][j];
         at('p3p' + j, 'x', px + 10 - 5); at('p3p' + j, 'y', py + 6);
         at('p3e' + j, 'x', lerp(px - 10, 236 + 6 * (j % 2), ay) - 5); at('p3e' + j, 'y', lerp(py, 40 + j * 14, ay) + 6); } }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(3, 'D')},

  // 5 · topraklama: küre çubuğa zıt yüklenir -----------------------------------------------------
  {konu: 'Topraklama',
   html: `<span class="qt">Nötr iletken bir küreye pozitif (+) yüklü bir çubuk yaklaştırılıyor. Küre topraklanıyor, sonra toprak bağlantısı kesiliyor ve en son çubuk uzaklaştırılıyor.<br>
     Buna göre, kürenin son yükü nedir?</span>` +
    SK(4, ['Pozitif (+)', 'Negatif (−)', 'Nötr', 'Önce negatif (−), sonra nötr', 'Çubuğun yükü kadar pozitif (+)'], 1) +
    SCENE(300, 170, `${KURE('p4k', 200, 60, 46)}
      <line id="p4t" x1="200" y1="106" x2="200" y2="148" stroke="#475569" stroke-width="3" opacity="0"/>
      <g stroke="#475569" stroke-width="3"><line x1="176" y1="150" x2="224" y2="150"/><line x1="184" y1="157" x2="216" y2="157"/><line x1="192" y1="164" x2="208" y2="164"/></g>
      ${T('p4tn', 232, 162, 'Toprak', '#16181D', 13)}
      <g id="p4kes" opacity="0" stroke="${PLUS}" stroke-width="3"><line x1="188" y1="120" x2="212" y2="134"/><line x1="212" y1="120" x2="188" y2="134"/></g>
      ${[0, 1, 2, 3, 4].map(j => `<circle id="p4e${j}" cx="200" cy="148" r="4.5" fill="${EKSI}" opacity="0"/>`).join('')}
      ${[0, 1, 2, 3, 4].map(j => ISR('p4m' + j, 200 + 30 * Math.cos(j * 1.25 + 2), 60 + 30 * Math.sin(j * 1.25 + 2), '−', 'opacity="0"')).join('')}
      <g id="p4c"><rect x="0" y="48" width="120" height="24" rx="12" fill="#fee2e2" stroke="${PLUS}" stroke-width="2.5"/>
        ${[0, 1, 2, 3].map(j => ISR('p4cp' + j, 20 + j * 26, 54, '+')).join('')}</g>` + MARK(1, 232, 167, 280, 167), false) +
    N(2, 170, 0, 'Topraktan küreye elektron gelir.', 'topraktan') + N(3, 170, 1, 'Bağlantı kesilince elektronlar kürede kalır.', 'kalır') +
    N(4, 170, 2, 'Küre çubuğa zıt, negatif (−) yüklenir.', 'negatif') + TZ(5, 170, 3, '"Küre çubukla aynı işareti alır" sanmak') +
    KUTU(4, 6) + CV(10, 170, 4, 'B'),
   init: kur(4, 'B'),
   steps: [{d: 3.6, o: [], f: s => { const yk = ease(prog(s, 0, 0.6)) * (1 - ease(prog(s, 2.8, 3.4)));
       at('p4c', 'transform', `translate(${560 - 290 * yk} 0) scale(-1 1) translate(-120 0)`); at('p4c', 'opacity', yk > 0.02 ? 1 : 0);
       const bag = s > 0.7 && s < 2.2; at('p4t', 'opacity', bag ? 1 : (s >= 2.2 ? 0.25 : 0)); at('p4kes', 'opacity', s >= 2.2 ? 1 : 0);
       for (let j = 0; j < 5; j++) { const a = 0.9 + j * 0.22, k = prog(s, a, a + 0.5);
         at('p4e' + j, 'opacity', k > 0 && k < 1 ? 1 : 0); at('p4e' + j, 'cy', 148 - 46 * k); at('p4m' + j, 'opacity', prog(s, a + 0.45, a + 0.6)); } }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(4, 'B')},

  // 6 · elektroskop: yapraklar önce kapanır ----------------------------------------------------
  {konu: 'Elektroskop',
   html: `<span class="qt">Pozitif (+) yüklü bir elektroskobun topuzuna, negatif (−) yüklü bir çubuk dokundurulmadan yaklaştırılıyor.<br>Buna göre,<br>
     I. Elektroskobun yaprakları kapanmaya başlar.<br>II. Elektroskobun net yükü değişmez.<br>III. Yapraklar mutlaka daha çok açılır.<br>
     yargılarından hangileri doğrudur?</span>` + SK(5, ['Yalnız I', 'Yalnız II', 'Yalnız III', 'I ve II', 'I, II ve III'], 1) +
    SCENE(300, 170, `<path d="M150 60 h140 v100 h-140z" fill="#f8fafc" stroke="#475569" stroke-width="2.5"/>
      <circle cx="220" cy="22" r="14" fill="#cbd5e1" stroke="#475569" stroke-width="2.5"/><line x1="220" y1="36" x2="220" y2="100" stroke="#475569" stroke-width="4"/>
      <line id="p5y1" x1="220" y1="100" x2="220" y2="150" stroke="#B45309" stroke-width="5" stroke-linecap="round"/>
      <line id="p5y2" x1="220" y1="100" x2="220" y2="150" stroke="#B45309" stroke-width="5" stroke-linecap="round"/>
      ${ISR('p5p1', 0, 0, '+')}${ISR('p5p2', 0, 0, '+')}
      <g id="p5c"><rect x="0" y="0" width="120" height="22" rx="11" fill="#dbeafe" stroke="${EKSI}" stroke-width="2.5"/>
        ${[0, 1, 2, 3].map(j => ISR('p5cm' + j, 20 + j * 26, 5, '−')).join('')}</g>
      ${T('p5n', 300, 150, 'Yaprak', '#B45309', 13)}` + MARK(1, 298, 155, 346, 155), false) +
    N(2, 170, 0, 'I ✓ Elektronlar yapraklara iner, yük azalır.', 'iner') + N(3, 170, 1, 'II ✓ Dokunma yok, net yük değişmez.', 'değişmez') +
    N(4, 170, 2, 'III ✗ yanlış: Yapraklar önce kapanır.', 'kapanır') + TZ(5, 170, 3, '"Yapraklar hemen daha çok açılır" sanmak') +
    KUTU(5, 6) + CV(10, 170, 4, 'D'),
   init: kur(5, 'D'),
   steps: [{d: 3.6, o: [], f: s => { const yk = ease(prog(s, 0.2, 1.6)); at('p5c', 'transform', `translate(${380 - 140 * yk} ${-30 + 28 * yk}) rotate(${-20 * (1 - yk)})`);
       const aci = (34 - 26 * ease(prog(s, 0.8, 2.8))) * Math.PI / 180;
       at('p5y1', 'x2', 220 - 50 * Math.sin(aci)); at('p5y1', 'y2', 100 + 50 * Math.cos(aci)); at('p5y2', 'x2', 220 + 50 * Math.sin(aci)); at('p5y2', 'y2', 100 + 50 * Math.cos(aci));
       at('p5p1', 'x', 220 - 40 * Math.sin(aci) - 18); at('p5p1', 'y', 100 + 40 * Math.cos(aci)); at('p5p2', 'x', 220 + 40 * Math.sin(aci) + 6); at('p5p2', 'y', 100 + 40 * Math.cos(aci));
       const k = prog(s, 1.2, 2.8); at('p5p1', 'opacity', 1 - 0.75 * k); at('p5p2', 'opacity', 1 - 0.75 * k); }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(5, 'D')},

  // 7 · Coulomb: uzaklık 2 katı → kuvvet 1/4 ---------------------------------------------------
  {konu: 'Coulomb Kuvveti',
   html: `<span class="qt">Aralarında d uzaklığı bulunan iki noktasal yük birbirine F büyüklüğünde elektriksel kuvvet uyguluyor.<br>
     Buna göre, yükler arasındaki uzaklık 2d yapılırsa kuvvetin büyüklüğü ne olur?</span>` + SK(6, [KS('F', '4'), KS('F', '2'), 'F', '2F', '4F'], 1) +
    SCENE(300, 140, `${KURE('p6a', 120, 50, 18, '#fee2e2')}${ISR('p6as', 120, 44, '+')}
      <g id="p6B">${KURE('p6b', 0, 0, 18, '#fee2e2')}${ISR('p6bs', 0, -6, '+')}</g>
      ${OK('p6Fa', PLUS)}${OK('p6Fb', PLUS)}
      ${T('p6d', 0, 0, 'd', '#16181D', 15)}`, false) +
    N(1, 140, 0, 'Coulomb yasası: F = k · ' + KS('q₁ · q₂', 'd²'), 'coulomb') +
    N(2, 140, 1.6, 'Uzaklık 2 katına çıkınca kuvvet ' + KS('1', '4') + ' katına iner.', 'dörtte') +
    TZ(3, 140, 3.2, '"Uzaklık 2 kat, kuvvet yarıya iner" sanmak') + KUTU(6, 4) + CV(8, 140, 4.2, 'A'),
   init: kur(6, 'A'),
   steps: [{d: 3.6, o: [], f: s => { const k = ease(prog(s, 1.2, 2.6)), bx = 230 + 110 * k, L = 60 / Math.pow(1 + k, 2) * (s > 0.2 ? 1 : 0);
       at('p6B', 'transform', `translate(${bx} 50)`);
       arr('p6Fa', 102, 50, 102 - L, 50, L > 2 ? 1 : 0, 'F', -4, -10); arr('p6Fb', bx + 18, 50, bx + 18 + L, 50, L > 2 ? 1 : 0, 'F', 4, -10);
       $('p6d').textContent = k > 0.95 ? '2d' : (k < 0.05 ? 'd' : ''); at('p6d', 'x', (120 + bx) / 2 - 6); at('p6d', 'y', 100); }},
     ...ADIM([[1], [2, 3], [4, 5, 6, 7, 8]])],
   late: () => kutuIsik(6, 'A')},

  // 8 · etki-tepki: kuvvetler eşit -------------------------------------------------------------
  {konu: 'Etki-Tepki',
   html: `<span class="qt">+q ve +4q yüklü iki küre arasında elektriksel kuvvet vardır.<br>Buna göre,<br>
     I. Kürelerin birbirine uyguladığı kuvvetler eşit büyüklüktedir.<br>II. Kuvvetler zıt yönlüdür.<br>III. +4q yüklü küreye etki eden kuvvet 4 kat büyüktür.<br>
     yargılarından hangileri doğrudur?</span>` + SK(7, ['Yalnız I', 'Yalnız II', 'Yalnız III', 'I ve II', 'I, II ve III'], 1) +
    SCENE(300, 130, `${KURE('p7a', 140, 60, 18, '#fee2e2')}${T('p7at', 128, 66, '+q', PLUS, 14)}
      ${KURE('p7b', 290, 60, 32, '#fecaca')}${T('p7bt', 272, 66, '+4q', PLUS, 16)}
      ${OK('p7Fa', '#1D3FB8')}${OK('p7Fb', '#1D3FB8')}` + MARK(1, 40, 100, 120, 100) + MARK(2, 322, 100, 402, 100), false) +
    N(3, 130, 0, 'I ✓ Etki-tepki: Kuvvetler eşit büyüklüktedir.', 'etki') + N(4, 130, 1, 'II ✓ Kuvvetler zıt yönlüdür.', 'zıt') +
    N(5, 130, 2, 'III ✗ yanlış: İki küreye de F etki eder.', 'iki') + TZ(6, 130, 3, '"Büyük yüke büyük kuvvet etki eder" sanmak') +
    KUTU(7, 7) + CV(11, 130, 4, 'D'),
   init: kur(7, 'D'),
   steps: [{d: 3.0, o: [], f: s => { const L = 80 * ease(prog(s, 0.3, 1.6));
       arr('p7Fa', 122, 60, 122 - L, 60, L > 2 ? 1 : 0, 'F', -4, -12); arr('p7Fb', 322, 60, 322 + L, 60, L > 2 ? 1 : 0, 'F', 4, -12); }},
     ...ADIM([[1, 2, 3, 4], [5, 6], [7, 8, 9, 10, 11]])],
   late: () => kutuIsik(7, 'D')},

  // 9 · nötr cisim de çekilir (kutuplanma) -----------------------------------------------------
  {konu: 'Kutuplanma',
   html: `<span class="qt">Saça sürtülen plastik tarak, masadaki küçük kağıt parçalarını kendine çekiyor.<br>Buna göre,<br>
     I. Kağıt parçaları nötr olabilir.<br>II. Tarak sürtünmeyle yüklenmiştir.<br>III. Tarak, kağıttaki yüklerin ayrışmasına (kutuplanma) neden olur.<br>
     yargılarından hangileri doğrudur?</span>` + SK(8, S2, 1) +
    SCENE(300, 160, `<g id="p8t"><rect x="60" y="10" width="200" height="22" rx="5" fill="#334155"/>
        ${Array.from({length: 18}, (_, j) => `<rect x="${66 + j * 11}" y="32" width="5" height="22" rx="2" fill="#334155"/>`).join('')}
        ${[0, 1, 2, 3].map(j => ISR('p8tm' + j, 90 + j * 46, 15, '−', 'opacity="0"')).join('')}</g>
      <line x1="20" y1="150" x2="300" y2="150" stroke="#94a3b8" stroke-width="3"/>
      ${[0, 1, 2, 3, 4].map(j => `<rect id="p8k${j}" x="${80 + j * 34}" y="138" width="20" height="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>`).join('')}
      <g transform="translate(330 60)"><rect x="0" y="0" width="90" height="60" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
        ${[0, 1, 2].map(j => ISR('p8bp' + j, 18 + j * 27, 12, '+', 'opacity="0"') + ISR('p8bm' + j, 18 + j * 27, 40, '−', 'opacity="0"')).join('')}</g>
      ${T('p8bn', 336, 140, 'Kağıt (büyütülmüş)', '#16181D', 11)}` + MARK(1, 330, 54, 420, 54, '#D62828'), false) +
    N(2, 160, 0, 'I ✓ Nötr cisimler de yüklü cisme çekilir.', 'nötr') + N(3, 160, 1, 'II ✓ Tarak sürtünmeyle yüklenir.', 'tarak') +
    N(4, 160, 2, 'III ✓ Kağıtta yükler ayrışır, yakın yüz çekilir.', 'ayrışır') + TZ(5, 160, 3, '"Nötr cisim çekilmez" sanmak') +
    KUTU(8, 6) + CV(10, 160, 4, 'E'),
   init: kur(8, 'E'),
   steps: [{d: 3.6, o: [], f: s => { for (let j = 0; j < 4; j++) at('p8tm' + j, 'opacity', prog(s, 0.2 + j * 0.1, 0.5 + j * 0.1));
       for (let j = 0; j < 3; j++) { at('p8bp' + j, 'opacity', prog(s, 0.8, 1.2)); at('p8bm' + j, 'opacity', prog(s, 0.8, 1.2)); }
       for (let j = 0; j < 5; j++) { const a = 1.4 + j * 0.25, k = ease(prog(s, a, a + 0.5)); at('p8k' + j, 'y', 138 - 84 * k);
         at('p8k' + j, 'transform', `rotate(${(1 - k) * 0 + k * (j % 2 ? 14 : -12)} ${90 + j * 34} ${144 - 84 * k})`); } }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(8, 'E')},

  // 10 · yük dış yüzeyde, sivri uçta yoğun --------------------------------------------------------
  {konu: 'İletkende Yük Dağılımı',
   html: `<span class="qt">Yüklü iletken cisimlerle ilgili,<br>I. Yükler iletkenin dış yüzeyine dağılır.<br>II. Sivri uçlarda yük yoğunluğu daha büyüktür.<br>
     III. Yıldırımsavarların sivri uçlu yapılması bu nedenledir.<br>yargılarından hangileri doğrudur?</span>` + SK(9, S2, 1) +
    SCENE(300, 160, `<path d="M40 80 q0 -50 60 -50 q50 0 110 50 q-60 50 -110 50 q-60 0 -60 -50z" fill="#f1f5f9" stroke="#475569" stroke-width="2.5"/>
      ${Array.from({length: 10}, (_, j) => ISR('p9q' + j, 0, 0, '+')).join('')}
      <rect x="300" y="70" width="90" height="80" fill="#e2e8f0" stroke="#475569" stroke-width="2"/><path d="M300 70 l45 -26 l45 26z" fill="#cbd5e1" stroke="#475569" stroke-width="2"/>
      <line x1="345" y1="44" x2="345" y2="10" stroke="#475569" stroke-width="3"/><path d="M339 14 l6 -12 l6 12z" fill="#475569"/>
      <path id="p9s" d="M300 -30 l20 18 l-12 4 l30 22" fill="none" stroke="#facc15" stroke-width="4" stroke-linejoin="round" opacity="0"/>
      ${T('p9n', 316, 162, 'Yıldırımsavar', '#16181D', 12)}` + MARK(1, 205, 60, 205, 100, '#D62828'), false) +
    N(2, 160, 0, 'I ✓ Yükler birbirini iter, dış yüzeye gider.', 'iter') + N(3, 160, 1, 'II ✓ Sivri uçta yükler daha yoğun toplanır.', 'sivri') +
    N(4, 160, 2, 'III ✓ Yıldırım sivri uçtan toprağa iletilir.', 'yıldırım') + TZ(5, 160, 3, '"Yük iletkenin içine dağılır" sanmak') +
    KUTU(9, 6) + CV(10, 160, 4, 'E'),
   init: kur(9, 'E'),
   steps: [{d: 3.6, o: [], f: s => { const k = ease(prog(s, 0.2, 2.2));
       for (let j = 0; j < 10; j++) { const dis = j < 4 ? [190 - j * 8, 72 + (j % 2) * 14] : [[60, 50], [100, 34], [145, 46], [60, 112], [100, 126], [145, 112]][j - 4];
         at('p9q' + j, 'x', dis[0] - 5); at('p9q' + j, 'y', dis[1] + 6); at('p9q' + j, 'opacity', prog(k, j * 0.08, j * 0.08 + 0.2)); }
       at('p9s', 'opacity', s > 2.6 && s < 3.4 ? (Math.sin(s * 40) > 0 ? 1 : 0.4) : 0); }},
     ...ADIM([[1, 2, 3], [4, 5], [6, 7, 8, 9, 10]])],
   late: () => kutuIsik(9, 'E')},
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

// ---------- bölümler: konu.html?...&b=1 (tuzak 1–5) veya b=2 (tuzak 6–10); her biri 3 dakikanın altında, 1,3× hızlandırılır ----------
(function () {
  const b = new URLSearchParams(location.search).get('b'); if (!b) return;
  const M = KONU.meta; M.toplam = 10; M.sayfa = 5;
  const no = +b, ilk = (no - 1) * 5;
  M.bolum = no + '. BÖLÜM';                                                     // kapakta kırmızı rozet
  KONU.hook.html = KONU.hook.html.replace('10 TUZAK · <b>10 SORU</b>', `<b>${no}. BÖLÜM</b> · TUZAK ${ilk + 1}–${ilk + 5}`);
  const f0 = KONU.hook.f;
  KONU.hook.f = t => { f0(t);                                                   // girişte bölüm yazısı baştan görünür; bu bölümün kartları öne çıkar
    const al = prog(t, 0.8, 1.3); st('hkAlt', {opacity: al, transform: `scale(${0.8 + 0.2 * ease(al)})`});
    for (let i = 0; i < 10; i++) if (i < ilk || i >= ilk + 5) $('hkk' + i).style.opacity *= 0.35; };
  if (b === '1') { KONU.P = KONU.P.slice(0, 5); M.puanYok = true; M.bosYazi = 'Devamı 2. bölümde ➜'; M.bitti = '5 TUZAK ÇÖZÜLDÜ';
    M.sonraki = '2. bölüm · Tuzak 6–10'; M.outroSure = 3.5; M.kapakAlt = 'Tuzak 1–5'; }
  else { KONU.P = KONU.P.slice(5); M.ilk = 5; M.kapakAlt = 'Tuzak 6–10'; }   // giriş konuşması 1. bölümle aynı
})();
