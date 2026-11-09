// 11. sınıf · 1. ders · FİZ.11.1.6 Statik ve kinetik sürtünme
const KUTU = (p, h) => `<line x1="0" y1="${h}" x2="441" y2="${h}" stroke="#16181D" stroke-width="3"/>
  ${Array.from({length: 23}, (_, i) => `<line x1="${8 + 20 * i}" y1="${h}" x2="${-4 + 20 * i}" y2="${h + 12}" stroke="#16181D" stroke-width="1.5"/>`).join('')}
  <g id="${p}box"><rect x="0" y="0" width="110" height="80" rx="4" fill="#8a5a33" stroke="#16181D" stroke-width="2.5"/>
    <rect x="8" y="8" width="44" height="64" rx="2" fill="none" stroke="#5c3a1f" stroke-width="2"/><rect x="58" y="8" width="44" height="64" rx="2" fill="none" stroke="#5c3a1f" stroke-width="2"/>
    <circle cx="48" cy="40" r="3" fill="#f1cf9e"/><circle cx="62" cy="40" r="3" fill="#f1cf9e"/></g>
  ${ARR(p + 'F', '#1D3FB8')}${ARR(p + 'f', '#D62828')}`;
const kutu = (p, x, h) => at(p + 'box', 'transform', `translate(${x},${h - 80})`);
window.KONU = {
  meta: {tema: 'koyu', sinif: 11, baslik: 'Statik ve Kinetik Sürtünme', unite: 'Kuvvet ve Hareket', kazanim: 'FİZ.11.1.6',
    kapakAlt: '1. Ders · Statik ve kinetik sürtünmenin karşılaştırılması', sonraki: 'Sürtünme kuvvetinin hesaplanması (f = k·N)',
    kanca: 'Dolabı itmeye BAŞLAMAK neden daha zor?'},
  P: [
  {konu: 'Statik Sürtünme', html: `<span class="qt">Cisim <b>durgunken</b> etki eden sürtünmeye <b>statik sürtünme</b> denir. Uygulanan kuvvet arttıkça statik sürtünme de <b>artar</b> ve cisim kımıldamaz.</span>` +
    SCENE(96, 220, KUTU('s', 190), false) +
    H(1, 'F = 10 N → fs = 10 N', 0, 330, 'sürtünme') + H(2, 'F = 20 N → fs = 20 N', 0, 372, 'sürtünme') + H(3, 'Sınır: fs,max ' + CK, 0, 414, 'en'),
    init: () => { kutu('s', 170, 190); },
    steps: [
      {d: 1.6, o: [1], f: s => { const k = ease(prog(s, 0, 0.8)); arr('sF', 165 - 60 * k, 150, 165, 150, k > 0 ? 1 : 0, '10 N'); arr('sf', 285, 186, 285 + 60 * k, 186, k > 0 ? 1 : 0, '10 N', 0, 24); }},
      {d: 2.2, o: [2], f: s => { if (!s) return; const k = ease(prog(s, 0, 0.8)), L = 60 + 60 * k, g = pulse(s, 0.8, 2.2);
        arr('sF', 165 - L, 150, 165, 150, 1, k > 0.5 ? '20 N' : '10 N'); arr('sf', 285, 186, 285 + L, 186, 1, k > 0.5 ? '20 N' : '10 N', 0, 24); kutu('s', 170 + 2 * Math.sin(s * 40) * g, 190); }},
      {d: 0.4, o: [3], f: () => {}},
    ]},
  {konu: 'Kinetik Sürtünme', html: `<span class="qt">Kuvvet <b>en büyük statik sürtünmeyi</b> geçince cisim kaymaya başlar. Kayan cisme <b>kinetik sürtünme</b> etki eder ve bu kuvvet <b>sabittir</b>.</span>` +
    SCENE(96, 380, KUTU('k', 150) + `
      <line x1="50" y1="360" x2="430" y2="360" stroke="#16181D" stroke-width="2.5"/><line x1="50" y1="360" x2="50" y2="200" stroke="#16181D" stroke-width="2.5"/>
      <polygon points="430,360 420,355 420,365" fill="#16181D"/><polygon points="50,200 45,210 55,210" fill="#16181D"/>
      <text class="ax" x="340" y="378">uygulanan kuvvet</text><text class="ax" x="56" y="210">sürtünme</text>
      <line x1="50" y1="240" x2="190" y2="240" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 5" id="kgd" opacity="0"/>
      <text class="ax" x="2" y="244" id="kgm" opacity="0">fs,max</text><text class="ax" x="22" y="276" id="kgk" opacity="0">fk</text>
      <text id="kgs" x="96" y="314" font-family="Inter" font-weight="800" font-size="14" fill="#1D3FB8" opacity="0" transform="rotate(-40 110 310)">statik</text>
      <text id="kgt" x="300" y="262" font-family="Inter" font-weight="800" font-size="14" fill="#D62828" opacity="0">kinetik</text>` +
      PL(2, 50, 360, 190, 240, 'data-w="önce" style="stroke:#1D3FB8;stroke-width:4"') + PL(3, 190, 240, 204, 272, 'data-w="düşüp" style="stroke:#D62828;stroke-width:4"') +
      PL(4, 204, 272, 420, 272, 'data-w="sabit" style="stroke:#D62828;stroke-width:4"'), false) +
    H(1, 'Kayarken fk sabit', 0, 492, 'artık') + H(5, 'fk < fs,max ' + CK, 0, 534, 'kinetik'),
    init: () => { kutu('k', 110, 150); },
    steps: [
      {d: 3.0, o: [1], f: s => { const m = ease(prog(s, 0.3, 3.0)), x = 110 + 120 * m;
        kutu('k', x, 150); arr('kF', x - 95, 110, x - 5, 110, s > 0 ? 1 : 0, 'F'); arr('kf', x + 115, 146, x + 165, 146, s > 0 ? 1 : 0, 'fk', 0, 24); }},
      {d: 0.4, o: [2, 3, 4, 5], f: () => {}},
    ]},
  ]};
// grafik etiketleri, çizgiler çizildikçe görünür
KONU.P[1].late = () => { const L = [...document.querySelectorAll('.pl')].filter(e => e.closest('.pg') && e.getAttribute('data-o') >= 2 && e.getAttribute('data-o') <= 4);
  const k = L.map(e => 1 - (+e.getAttribute('stroke-dashoffset')) / 100);
  if (k.length < 3) return;
  at('kgs', 'opacity', k[0] > 0.6 ? 1 : 0); at('kgd', 'opacity', k[0] > 0.98 ? 1 : 0); at('kgm', 'opacity', k[0] > 0.98 ? 1 : 0);
  at('kgk', 'opacity', k[2] > 0.3 ? 1 : 0); at('kgt', 'opacity', k[2] > 0.6 ? 1 : 0); };

// ---------- giriş animasyonu: dolabı itmeye başlamak zor, kaydırmak kolay ----------
KONU.hook = {
  soru: 'Ağır bir dolabı itmeye BAŞLAMAK, onu kaydırmaktan neden daha zor?',
  html: `<svg width="1080" height="700" style="position:absolute;left:0;top:0">
    <line x1="40" y1="520" x2="1040" y2="520" stroke="#cbd5e1" stroke-width="5"/>
    ${Array.from({length: 33}, (_, i) => `<line x1="${50 + 30 * i}" y1="520" x2="${32 + 30 * i}" y2="542" stroke="#94a3b8" stroke-width="3"/>`).join('')}
    <g id="hkD"><rect x="0" y="0" width="260" height="360" rx="8" fill="#8a5a33" stroke="#1f232c" stroke-width="5"/>
      <rect x="18" y="18" width="104" height="324" rx="4" fill="none" stroke="#5c3a1f" stroke-width="5"/><rect x="138" y="18" width="104" height="324" rx="4" fill="none" stroke="#5c3a1f" stroke-width="5"/>
      <circle cx="112" cy="180" r="8" fill="#f1cf9e"/><circle cx="148" cy="180" r="8" fill="#f1cf9e"/></g>
    <g id="hkP" stroke="#fff" stroke-width="12" stroke-linecap="round" fill="none">
      <circle cx="0" cy="-262" r="36" fill="#fff" stroke="none"/><line x1="10" y1="-226" x2="52" y2="-110"/>
      <line x1="30" y1="-180" x2="95" y2="-168"/><line x1="30" y1="-160" x2="95" y2="-140"/>
      <line x1="52" y1="-110" x2="-20" y2="0"/><line x1="52" y1="-110" x2="70" y2="0"/></g>
    <g id="hkF" opacity="0"><line id="hkFl" stroke="#ef4444" stroke-width="10" stroke-linecap="round"/><polygon id="hkFp" fill="#ef4444"/>
      <text id="hkFt" font-family="Inter" font-weight="900" font-size="38" fill="#ef4444">sürtünme</text></g>
    <g id="hkS" stroke="#F5C400" stroke-width="6" stroke-linecap="round" opacity="0"><path d="M-20 40 l-30 -10 M-20 120 l-34 0 M-20 200 l-30 10"/></g>
  </svg>` +
  `<span class="em" id="hkSw" style="left:150px;top:150px;font-size:80px;opacity:0">💦</span>` +
  `<div class="hk-chip" id="hkC1" style="left:70px;top:660px;background:#1D3FB8">STATİK SÜRTÜNME</div>` +
  `<div class="hk-chip" id="hkC2" style="left:560px;top:660px;background:#D62828">KİNETİK SÜRTÜNME</div>` +
  `<div class="hk-big" id="hkQ" style="left:870px;top:-40px">?</div>`,
  f: (t, w) => {
    const tK = w('kaydırmaktan') ?? 2.6, tC = w('Cevap') ?? 4.4, tN = w('neden') ?? 3.3;
    const push = prog(t, 0.6, tK), slide = ease(prog(t, tK, tC + 0.6)), shake = t < tK ? Math.sin(t * 45) * 4 * push : 0;
    const dx = 470 + 220 * slide + shake;
    at('hkD', 'transform', `translate(${dx},160)`); at('hkP', 'transform', `translate(${dx - 120},520)`);
    at('hkS', 'transform', `translate(${dx},160)`); at('hkS', 'opacity', t < tK ? push * (0.5 + 0.5 * Math.sin(t * 20)) : 0);
    st('hkSw', {opacity: t < tK ? push : 1 - prog(t, tK, tK + 0.4), transform: `translateY(${-20 * ((t * 1.5) % 1)}px)`, left: (dx - 160) + 'px'});
    // sürtünme oku: itildikçe büyür, kayarken sabit kalır
    const L = t < tK ? 60 + 140 * push : 150, y = 556, x0 = dx + 130;
    at('hkF', 'opacity', prog(t, 0.6, 1.0)); at('hkFl', 'x1', x0); at('hkFl', 'y1', y); at('hkFl', 'x2', x0 - L + 18); at('hkFl', 'y2', y);
    at('hkFp', 'points', `${x0 - L},${y} ${x0 - L + 26},${y - 16} ${x0 - L + 26},${y + 16}`); at('hkFt', 'x', x0 - L - 10); at('hkFt', 'y', y + 56);
    const q = prog(t, tN, tN + 0.3); st('hkQ', {opacity: q, transform: `scale(${0.5 + 0.5 * ease(q) + 0.06 * Math.sin(t * 6)})`});
    [['hkC1', tC + 0.3], ['hkC2', tC + 0.9]].forEach(([id, a]) => { const k = prog(t, a, a + 0.3); st(id, {opacity: k, transform: `scale(${0.6 + 0.4 * ease(k)})`}); });
  }};
