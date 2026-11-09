// 12. sınıf · 1. ders · 12.1.5.1 Kepler Kanunları (1. ve 2. kanun)
// Yörünge: elips (a=170, b=110, abartılı), Güneş sol odakta. Gezegen konumu Kepler denklemiyle (M = E − e·sinE) hesaplanır,
// böylece eşit sürelerde taranan alanlar gerçekten eşittir.
const KE = {cx: 220, cy: 150, a: 170, b: 110};
KE.c = Math.sqrt(KE.a ** 2 - KE.b ** 2); KE.e = KE.c / KE.a; KE.fx = KE.cx - KE.c;          // Güneş: sol odak
const solveE = M => { let E = M; for (let i = 0; i < 30; i++) E -= (E - KE.e * Math.sin(E) - M) / (1 - KE.e * Math.cos(E)); return E; };
const posM = M => { const E = solveE(M); return {x: KE.cx - KE.a * Math.cos(E), y: KE.cy - KE.b * Math.sin(E)}; };
// posM: M=0 → sol uç (günberi, Güneş'e en yakın, en hızlı); M=π → sağ uç (günöte, en yavaş)
const SECTOR = (M0, M1) => { const pts = [`${KE.fx},${KE.cy}`]; for (let i = 0; i <= 30; i++) { const p = posM(M0 + (M1 - M0) * i / 30); pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`); } return pts.join(' '); };
const ORBIT = id => `<ellipse id="${id}" cx="${KE.cx}" cy="${KE.cy}" rx="${KE.a}" ry="${KE.b}" fill="none" stroke="#475569" stroke-width="2.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>`;
const SUN = (id, o = 0) => `<g id="${id}" opacity="${o}"><circle cx="${KE.fx}" cy="${KE.cy}" r="16" fill="#F5A300"/><circle cx="${KE.fx}" cy="${KE.cy}" r="22" fill="#F5A300" opacity=".25"/></g>`;
const EARTH = id => `<g id="${id}" opacity="0"><circle r="9" fill="#2563eb"/><path d="M-4 -3 q3 -3 6 0 q-2 3 -6 0z M0 3 q3 0 4 3" fill="#22c55e"/></g>`;
const put = (id, p) => at(id, 'transform', `translate(${p.x},${p.y})`);
window.KONU = {
  meta: {tema: 'koyu', sinif: 12, baslik: 'Kepler Kanunları', unite: 'Çembersel Hareket', kazanim: '12.1.5.1',
    kapakAlt: '1. Ders · Kepler’in 1. ve 2. kanunu', sonraki: 'Kepler’in 3. kanunu', kanca: 'Dünya OCAKTA Güneş’e daha yakın!'},
  P: [
  {konu: 'Kepler’in 1. Kanunu', html: `<span class="qt">Gezegenler Güneş'in çevresinde <b>elips</b> yörüngelerde dolanır. Güneş, elipsin <b>odaklarından birindedir</b>.</span>` +
    SCENE(80, 300, ORBIT('o1') + `<circle id="f2" cx="${KE.cx + KE.c}" cy="${KE.cy}" r="4" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0"/>
      <text id="f2t" class="ax" x="${KE.cx + KE.c - 14}" y="${KE.cy - 12}" opacity="0">odak</text>` + SUN('s1') +
      `<text id="s1t" class="ax" x="${KE.fx - 18}" y="${KE.cy - 28}" opacity="0">Güneş</text>` +
      `<g id="gb" opacity="0"><circle cx="${KE.cx - KE.a}" cy="${KE.cy}" r="5" fill="#D62828"/><text x="${KE.cx - KE.a - 18}" y="${KE.cy + 30}" font-family="Inter" font-weight="800" font-size="13" fill="#D62828">günberi</text></g>
      <g id="go" opacity="0"><circle cx="${KE.cx + KE.a}" cy="${KE.cy}" r="5" fill="#1D3FB8"/><text x="${KE.cx + KE.a - 30}" y="${KE.cy + 30}" font-family="Inter" font-weight="800" font-size="13" fill="#1D3FB8">günöte</text></g>` +
      EARTH('e1') + `<text class="ax" x="300" y="292">(çizim abartılıdır)</text>`, false) +
    H(1, 'Yörünge = elips', 0, 400, 'elips') + H(2, 'Güneş → odakta', 0, 442, 'odaklardan') + H(3, 'Günberi · Günöte ' + CK, 0, 484, 'günberi'),
    steps: [
      {d: 2.0, o: [1], f: s => { at('o1', 'stroke-dashoffset', 100 * (1 - ease(prog(s, 0, 1.8)))); }},
      {d: 1.6, o: [2], f: s => { const k = prog(s, 0, 0.6); at('s1', 'opacity', k); at('s1t', 'opacity', k); at('f2', 'opacity', prog(s, 0.6, 1.0)); at('f2t', 'opacity', prog(s, 0.6, 1.0)); }},
      {d: 3.0, o: [3], f: s => { if (!s) return; at('e1', 'opacity', 1); put('e1', posM(Math.PI + 2 * Math.PI * prog(s, 0, 3.0)));
        at('gb', 'opacity', prog(s, 0, 0.4)); at('go', 'opacity', prog(s, 1.2, 1.6)); }},
    ]},
  {konu: 'Kepler’in 2. Kanunu', html: `<span class="qt">Gezegeni Güneş'e birleştiren doğru, <b>eşit zaman aralıklarında eşit alanlar</b> tarar.</span>` +
    SCENE(80, 300, `<ellipse cx="${KE.cx}" cy="${KE.cy}" rx="${KE.a}" ry="${KE.b}" fill="none" stroke="#475569" stroke-width="2.5"/>` +
      `<polygon id="ar1" points="${SECTOR(-0.55, 0.55)}" fill="#F5A300" fill-opacity=".45" stroke="#d97706" stroke-width="1.5" opacity="0"/>
       <polygon id="ar2" points="${SECTOR(Math.PI - 0.55, Math.PI + 0.55)}" fill="#60a5fa" fill-opacity=".45" stroke="#2563eb" stroke-width="1.5" opacity="0"/>
       <text id="ar1t" x="${KE.cx - KE.a + 22}" y="${KE.cy - 70}" font-family="Inter" font-weight="800" font-size="13" fill="#b45309" opacity="0">1 ay</text>
       <text id="ar2t" x="${KE.cx + KE.a - 60}" y="${KE.cy - 34}" font-family="Inter" font-weight="800" font-size="13" fill="#1d4ed8" opacity="0">1 ay</text>` +
      SUN('s2', 1) + `<line id="rl" stroke="#16181D" stroke-width="1.5" stroke-dasharray="4 4" opacity="0"/>` + EARTH('e2') +
      `<text id="hz" x="20" y="285" font-family="Inter" font-weight="800" font-size="15" fill="#D62828" opacity="0"></text>`, false) +
    H(1, 'Eşit sürede eşit alan', 0, 400, 'eşit') + H(2, 'Günberi → hızlı ' + CK, 0, 442, 'hızlı'),
    steps: [
      {d: 4.0, o: [1], f: s => { const k1 = prog(s, 0.2, 1.6), k2 = prog(s, 2.0, 3.4);
        at('ar1', 'opacity', k1); at('ar1t', 'opacity', k1); at('ar2', 'opacity', k2); at('ar2t', 'opacity', k2); }},
      {d: 4.5, o: [2], f: s => { if (!s) return; const M = Math.PI + 2 * Math.PI * prog(s, 0, 4.5) * 1.5, p = posM(M);
        at('e2', 'opacity', 1); put('e2', p); at('rl', 'opacity', 1); at('rl', 'x1', KE.fx); at('rl', 'y1', KE.cy); at('rl', 'x2', p.x); at('rl', 'y2', p.y);
        const near = p.x < KE.cx; at('hz', 'opacity', 1); $('hz').textContent = near ? 'Güneş’e yakın → HIZLI' : 'Güneş’ten uzak → yavaş'; at('hz', 'fill', near ? '#D62828' : '#1D3FB8'); }},
    ]},
  ]};

// ---------- giriş animasyonu: Dünya ocakta yakın, temmuzda uzak; yörünge çember değil ----------
const HKE = {cx: 540, cy: 380, a: 420, b: 250}; HKE.c = Math.sqrt(HKE.a ** 2 - HKE.b ** 2); HKE.e = HKE.c / HKE.a; HKE.fx = HKE.cx - HKE.c;
const hkPos = M => { let E = M; for (let i = 0; i < 30; i++) E -= (E - HKE.e * Math.sin(E) - M) / (1 - HKE.e * Math.cos(E)); return {x: HKE.cx - HKE.a * Math.cos(E), y: HKE.cy - HKE.b * Math.sin(E)}; };
KONU.hook = {
  soru: "Dünya, Güneş'e OCAKTA daha yakın, temmuzda daha uzak!",
  html: `<svg width="1080" height="800" style="position:absolute;left:0;top:0">
    <ellipse id="hkO" cx="${HKE.cx}" cy="${HKE.cy}" rx="${HKE.a}" ry="${HKE.b}" fill="none" stroke="#94a3b8" stroke-width="6"/>
    <circle id="hkCir" cx="${HKE.cx}" cy="${HKE.cy}" r="330" fill="none" stroke="#e2e8f0" stroke-width="5" pathLength="100" stroke-dasharray="100" opacity="0"/>
    <g id="hkX" opacity="0" stroke="#ef4444" stroke-width="16" stroke-linecap="round"><line x1="${HKE.cx + 150}" y1="${HKE.cy - 240}" x2="${HKE.cx + 330}" y2="${HKE.cy - 60}"/><line x1="${HKE.cx + 330}" y1="${HKE.cy - 240}" x2="${HKE.cx + 150}" y2="${HKE.cy - 60}"/></g>
    <circle cx="${HKE.fx}" cy="${HKE.cy}" r="70" fill="#F5A300" opacity=".25"/><circle cx="${HKE.fx}" cy="${HKE.cy}" r="48" fill="#F5A300"/>
    <line id="hkL" stroke="#fff" stroke-width="4" stroke-dasharray="10 8"/>
    <g id="hkE"><circle r="26" fill="#2563eb"/><path d="M-12 -8 q8 -9 17 0 q-6 8 -17 0z M0 8 q9 0 12 9" fill="#22c55e"/></g>
  </svg>` +
  `<div class="hk-chip" id="hkOc" style="left:30px;top:${HKE.cy + 70}px;background:#D62828">OCAK · YAKIN</div>` +
  `<div class="hk-chip" id="hkTe" style="left:610px;top:${HKE.cy + 70}px;background:#1D3FB8">TEMMUZ · UZAK</div>` +
  `<div class="hk-big" id="hkQ" style="left:470px;top:150px">?</div>`,
  f: (t, w) => {
    const tO = w('OCAKTA') ?? 1.6, tT = w('temmuzda') ?? 2.9, tN = w('Neden') ?? 4.2, tC = w('çember') ?? 5.3;
    // Dünya: ocak (günberi) → temmuz (günöte) arasını konuşmayla birlikte dolaşır, sonra döner
    const M = t < tO ? 0 : t < tT + 0.3 ? Math.PI * ease(prog(t, tO, tT + 0.3)) : Math.PI + 2 * Math.PI * (t - tT - 0.3) / 6;
    const p = hkPos(M); at('hkE', 'transform', `translate(${p.x},${p.y})`);
    at('hkL', 'x1', HKE.fx); at('hkL', 'y1', HKE.cy); at('hkL', 'x2', p.x); at('hkL', 'y2', p.y); at('hkL', 'opacity', prog(t, tO - 0.3, tO));
    const o = prog(t, tO, tO + 0.3), te = prog(t, tT, tT + 0.3);
    st('hkOc', {opacity: o, transform: `scale(${0.6 + 0.4 * ease(o)})`}); st('hkTe', {opacity: te, transform: `scale(${0.6 + 0.4 * ease(te)})`});
    const q = prog(t, tN, tN + 0.3); st('hkQ', {opacity: q * (1 - prog(t, tC, tC + 0.3)), transform: `scale(${0.5 + 0.5 * ease(q) + 0.06 * Math.sin(t * 6)})`});
    const c = prog(t, tC - 0.2, tC + 0.6); at('hkCir', 'opacity', c > 0 ? 1 : 0); at('hkCir', 'stroke-dashoffset', 100 * (1 - c));
    at('hkX', 'opacity', prog(t, tC + 0.6, tC + 0.8)); at('hkO', 'stroke', t > tC + 0.8 ? '#F5C400' : '#94a3b8'); at('hkO', 'stroke-width', t > tC + 0.8 ? 9 : 6);
  }};
