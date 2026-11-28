// AJAN 1 · SAHNE–SORU–KONU UYUMU
// Kitap soru bankalarında soruyla ilgisiz ("temsilî") düzenekte gösterilen sorular burada:
//  1) Soruya uygun MEVCUT sahneye taşınır (Young, EM dalga, kılcallık, etki ile yükleme, kozmoloji),
//  2) Uygun sahne yoksa YENİ küçük düzenek yazılır (yüklü parçacık–manyetik alan, Doppler ambulansı),
//  3) Sahne doğruysa ama soru başka düzenek anlatıyorsa, soru sahnedeki düzeneğe göre yeniden yazılır (fizik korunarak).
// Bu dosya kitap14.js'ten sonra, tanimlar/bilgi/son.js'ten önce yüklenir.
(function () {
  const { V3, sahne, gorev, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const TXT = h => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent.replace(/\s+/g, ' ').trim(); };
  const HEPSI = () => Object.values(FZ.HAZIR).flatMap(h => (h.gorevler || []).concat(h.dersler || []));
  const GOR = yk => HEPSI().find(M => M.yk === yk);
  const TABAN = yk => { const M = GOR(yk); return M ? Object.getPrototypeOf(M) : null; };
  // yk görevinden metni 'bas' ile başlayan soruyu bul; sil = true ise görevden çıkar
  const SORU = (yk, bas, sil) => { const M = GOR(yk); if (!M) return null; const i = M.steps.findIndex(s => s.q && TXT(s.q.t).startsWith(bas)); if (i < 0) return null;
    const st = M.steps[i]; if (sil) M.steps.splice(i, 1); return st; };
  const TASI = (yk, bas, kur, goster) => { const st = SORU(yk, bas, true); if (!st) { console.warn('uyum: bulunamadı', yk, bas); return null; }
    const q = Object.assign({}, st.q, { kartGizle: true }); if (goster !== undefined) q.goster = goster; return { do: S => Object.assign(S, typeof kur === 'function' ? kur(S) : kur), q }; };
  const YAZ = (yk, bas, yeni) => { const st = SORU(yk, bas, false); if (!st) { console.warn('uyum: yazılamadı', yk, bas); return; } Object.assign(st.q, yeni.q || {}); if (yeni.do) st.do = yeni.do; if (yeni.sub) st.sub = yeni.sub; };
  const EKLE = (sinav, konu, sahne_, yk, no, icon, name, task, ilk, adimlar) => { const steps = [ilk].concat(adimlar.filter(Boolean));
    if (!sahne_ || steps.length < 2) return; steps.forEach(st => { if (st.q && !st.sub) st.sub = ilk.sub; });
    FZ.konuEk(sinav, konu, { gorevler: [gorev(sahne_, { yk, no, icon, name, task, steps, data: [] })] }); };

  // ================= GENEL KORUMA: sahne kartları soruyla çelişmesin, cevabı önceden vermesin =================
  // Her karede (motor etiketleri yerleştirdikten sonra) çalışır; index.html'e dokunmaz. Yalnız hesap kartlarına (chip) bakar.
  const NUM = /(?<![\w,.])[−-]?\d+(?:[.,]\d+)?/g, NRM = x => x.replace('−', '-').replace('.', ',');
  const sayilar = s => new Set((TXT(s).match(NUM) || []).map(NRM));
  const ONEMSIZ = new Set(['0', '1', '2', '-1']);
  let sonQ = null, kum = null;
  FZ.uyumKart = (q, cevaplandi) => {           // bu karede gizlenecek chip öğeleri
    if (!q || !q.t || !q.o) return [];
    if (q !== kum) { kum = q; const tum = [q.t].concat(q.o || [], q.s || [], q.n || [], q.b || []).join(' ');
      q._ilgili = sayilar(tum); const soru = sayilar(q.t); q._cevap = [...sayilar(q.o[0])].filter(x => !soru.has(x) && !ONEMSIZ.has(x)); }
    const gizle = (q.hepGizle || []).map(id => TAG[id]).filter(Boolean);    // bu soruda sahnenin çelişen kartı hiç gösterilmez
    Object.values(TAG).forEach(d => { if (+d.style.opacity <= 0.02 || d === TAG.qlab) return;
      const chip = d.classList.contains('chip'), tx = d.textContent; if (!chip && !/[=:]/.test(tx)) return;   // düz etiketlerde yalnız "x = …" türü değer etiketleri
      const ns = (tx.match(NUM) || []).map(NRM); if (!ns.length) return;
      const cvp = chip ? q._cevap : q._cevap.filter(x => x.replace(/[-,]/g, '').length >= 2);       // düz etikette tek haneli sayılar verilen değer olabilir
      if (!cevaplandi && cvp.some(x => ns.includes(x))) { gizle.push(d); return; }                // cevabı önceden veriyor
      const yab = ns.filter(x => !q._ilgili.has(x) && !ONEMSIZ.has(x));
      if (yab.length >= 2 && yab.length * 2 > ns.length) gizle.push(d); });                     // soruyla ilgisiz (eski) değerler
    return gizle; };
  const koru = () => { try { const G = window.__oyun && window.__oyun.GAME;
      if (G && G.mode === 'game' && G.q && G.q.q && G.q.q.t && !G.q.ders && !G.q.tahmin) {
        if (G.q.q !== sonQ) { sonQ = G.q.q; Object.values(TAG).forEach(d => { d._t = 0; }); }   // yeni soru: sayılar hemen güncellensin
        FZ.uyumKart(G.q.q, G.q.answered).forEach(d => { d.style.opacity = 0; }); }
      else sonQ = null; } catch (e) {} requestAnimationFrame(koru); };
  setTimeout(() => requestAnimationFrame(koru), 0);

  // ================= YENİ DÜZENEK 1 · Yüklü parçacık manyetik alanda =================
  const sYP = sahne({ icon: '🧲', cam: [[0, 2.6, 13], [0, 2.4, 0]], plate: [12, 6, 0, 0],
    data: [['⊗', 'alan sayfa düzleminden içeri'], ['Kırmızı', '(+) yüklü parçacık']],
    S0: () => ({ mod: 'cember', r: 1.5, v: 1, kos: 0, th: 0, xx: -4.5, etk: '' }),
    kur(g) {
      const T = {};
      T.ic = new THREE.Group(); g.add(T.ic);   // ⊗ işaretleri: sayfa düzleminden içeri doğru manyetik alan
      for (let i = -3; i <= 3; i++) for (let j = 0; j <= 4; j++) { const m = new THREE.Group(); m.position.set(i * 1.25, 0.6 + j * 0.95, -0.4); T.ic.add(m);
        const hal = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 20), new THREE.MeshBasicMaterial({ color: 0x64748b })); m.add(hal);
        [1, -1].forEach(s => { const c = kutu(m, 0.3, 0.035, 0.02, 0x64748b, 0, 0, 0, { edge: false }); c.rotation.z = s * Math.PI / 4; }); }
      T.par = new THREE.Group(); g.add(T.par);   // alana paralel çizgiler (alan +x yönünde)
      for (let j = 0; j <= 4; j++) { const y = 0.6 + j * 0.95; kutu(T.par, 8.6, 0.03, 0.03, 0x64748b, 0, y, -0.4, { edge: false });
        const uc = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 10), new THREE.MeshBasicMaterial({ color: 0x64748b })); uc.rotation.z = -Math.PI / 2; uc.position.set(4.45, y, -0.4); T.par.add(uc); }
      T.lev = new THREE.Group(); g.add(T.lev);   // hız seçici: üstte (+), altta (−) levha
      kutu(T.lev, 9, 0.12, 1.2, 0xdc2626, 0, 3.9, 0); kutu(T.lev, 9, 0.12, 1.2, 0x2563eb, 0, 0.2, 0);
      T.p = top(g, 0.18, 0xef4444, 0, 0, 0, { edge: false }); T.p.material.emissive = new THREE.Color(0xef4444); T.p.material.emissiveIntensity = 0.5;
      T.iz = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(), V3()]), new THREE.LineBasicMaterial({ color: 0xfacc15 })); g.add(T.iz);
      T.oV = FZ.ok(0x22c55e, 'ypv'); T.oF = FZ.ok(0xd946ef, 'ypf'); T.oE = FZ.ok(0x2563eb, 'ype');
      FZ.etiket('ypv', 'v', '#16a34a'); FZ.etiket('ypf', 'F<sub>m</sub>', '#a21caf'); FZ.etiket('ype', 'F<sub>e</sub> = qE', '#1d4ed8');
      FZ.etiket('ypB', '', '#334155'); FZ.etiket('ypL1', '+ + + + +', '#dc2626'); FZ.etiket('ypL2', '− − − − −', '#2563eb'); FZ.kart('ypK', '', '#F5C400');
      return T;
    },
    tick(S, dt, T) {
      const m = S.mod; T.ic.visible = m !== 'paralel'; T.par.visible = m === 'paralel'; T.lev.visible = m === 'secici';
      [T.oV, T.oF, T.oE].forEach(a => a.visible = false);
      FZ.setTag('ypB', m === 'paralel' ? 'B: alan çizgileri sağa doğru (→)' : 'B: sayfa düzleminden içeri (⊗)'); FZ.show('ypB', V3(0.6, 5.2, 0), 1);
      if (m === 'cember') {                        // F = q v × B merkeze doğru: (+) yük için v (→) ve B (⊗) iken F yukarı
        const C = V3(0, 2.5, 0), r = S.r; if (S.kos) S.th += dt * 1.6 / r;
        const th = S.th, p = C.clone().add(V3(r * Math.sin(th), -r * Math.cos(th), 0)); T.p.position.copy(p);
        const pts = [V3(-4.6, C.y - r, 0), V3(0, C.y - r, 0)]; for (let i = 0; i <= 48; i++) { const a = Math.min(th, 2 * Math.PI) * i / 48; pts.push(C.clone().add(V3(r * Math.sin(a), -r * Math.cos(a), 0))); } T.iz.geometry.setFromPoints(pts);
        const vd = V3(Math.cos(th), Math.sin(th), 0), fd = C.clone().sub(p).normalize();
        FZ.setArrow(T.oV, p, vd, 0.9); FZ.show('ypv', p.clone().add(vd.clone().multiplyScalar(1.15)), 1);
        FZ.setArrow(T.oF, p, fd, 0.9); FZ.show('ypf', p.clone().add(fd.clone().multiplyScalar(1.15)), 1);
      } else if (m === 'secici') {                 // elektriksel kuvvet aşağı, manyetik kuvvet yukarı, eşit → düz gider
        if (S.kos) { S.xx += dt * 2.2; if (S.xx > 4.5) S.xx = -4.5; } const p = V3(S.xx, 2.05, 0); T.p.position.copy(p); T.iz.geometry.setFromPoints([V3(-4.6, 2.05, 0), p]);
        FZ.setArrow(T.oV, p, V3(1, 0, 0), 0.9); FZ.show('ypv', p.clone().add(V3(1.15, 0, 0)), 1);
        FZ.setArrow(T.oF, p, V3(0, 1, 0), 0.8); FZ.show('ypf', p.clone().add(V3(0, 1.05, 0)), 1);
        FZ.setArrow(T.oE, p, V3(0, -1, 0), 0.8); FZ.show('ype', p.clone().add(V3(0.2, -1.05, 0)), 1);
        FZ.show('ypL1', V3(0, 4.25, 0.6), 1); FZ.show('ypL2', V3(0, -0.15, 0.6), 1);
      } else if (m === 'paralel') {                // hız alana paralel: F = 0, düz gider
        if (S.kos) { S.xx += dt * 2.2; if (S.xx > 4.5) S.xx = -4.5; } const p = V3(S.xx, 2.05, 0.2); T.p.position.copy(p); T.iz.geometry.setFromPoints([V3(-4.6, 2.05, 0.2), p]);
        FZ.setArrow(T.oV, p, V3(1, 0, 0), 0.9); FZ.show('ypv', p.clone().add(V3(1.15, 0, 0)), 1);
      } else {                                     // durgun parçacık: F = 0
        const p = V3(0, 2.1, 0); T.p.position.copy(p); T.iz.geometry.setFromPoints([p, p]);
      }
      FZ.setTag('ypK', S.etk || ''); FZ.show('ypK', V3(2.4, 4.6, 0), S.etk ? 1 : 0);
    },
    qp: () => V3(0, 4.8, 0) });

  // ================= YENİ DÜZENEK 2 · Doppler: sireni çalan ambulans ve gözlemciler =================
  const NR = 16;
  const sDp = sahne({ icon: '🚑', cam: [[0, 9.5, 13], [0, 0.2, 0]], plate: [14, 7, 0, 0],
    data: [['Sirenin frekansı', 'f₀ = 1000 Hz'], ['Halkalar', 'ses dalgası tepeleri (üstten)']],
    S0: () => ({ t: 0, kos: 1, x: -2.2, dal: [], son: 0, etk: '' }),
    kur(g) {
      const T = {};
      kutu(g, 15, 0.04, 2.2, 0x374151, 0, 0.02, 0, { edge: false }); for (let i = -7; i <= 7; i++) kutu(g, 0.5, 0.01, 0.08, 0xf8fafc, i, 0.05, 0, { edge: false });
      T.amb = FZ.araba(g, 0xf8fafc); T.amb.scale.setScalar(0.8);
      const isik = kutu(T.amb, 0.25, 0.1, 0.5, 0xdc2626, -0.15, 1.02, 0, { edge: false }); isik.material.emissive = new THREE.Color(0xdc2626); isik.material.emissiveIntensity = 0.8; T.isik = isik;
      [-1, 1].forEach(s => { kutu(T.amb, 0.3, 0.08, 0.01, 0xdc2626, -0.3, 0.55, s * 0.47, { edge: false }); kutu(T.amb, 0.08, 0.3, 0.01, 0xdc2626, -0.3, 0.55, s * 0.47, { edge: false }); });   // kırmızı haç
      T.ali = FZ.insan(g, 0x2563eb, 0.9); T.ali.position.set(3.4, 0, 1.6); T.ali.rotation.y = -Math.PI / 2;
      T.ayse = FZ.kiz(g, 0xdb2777, 0.9); T.ayse.position.set(-3.4, 0, 1.6); T.ayse.rotation.y = Math.PI / 2;
      T.hal = []; for (let i = 0; i < NR; i++) {   // dalga tepesi: yatay ince halka (üstten görünür)
        const l = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 64), new THREE.MeshBasicMaterial({ color: 0x1d4ed8, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false }));
        l.rotation.x = -Math.PI / 2; l.visible = false; l.position.y = 0.12; l.userData.golgesiz = true; g.add(l); T.hal.push(l); }
      FZ.etiket('dpA', 'Ali (önde)', '#1d4ed8'); FZ.etiket('dpB', 'Ayşe (arkada)', '#be185d'); FZ.etiket('dpC', 'Can (ambulansta)', '#334155'); FZ.kart('dpK', '', '#F5C400');
      return T;
    },
    tick(S, dt, T) {
      const vs = 2.2, vk = 0.8;                    // ses hızı ve ambulans hızı (ölçekli; ambulans sesten yavaş)
      if (S.kos) { S.t += dt; const dx = vk * dt; S.x += dx; FZ.tekerDondur(T.amb, dx); if (S.x > 2.2) { S.x = -2.2; S.dal = []; }
        if (S.t - S.son > 0.32) { S.son = S.t; S.dal.push({ x: S.x, t: S.t }); if (S.dal.length > NR) S.dal.shift(); } }
      T.amb.position.set(S.x, 0, 0); T.isik.material.emissiveIntensity = 0.4 + 0.5 * Math.abs(Math.sin(S.t * 8));
      T.hal.forEach((l, i) => { const d = S.dal[i]; l.visible = !!d; if (!d) return; const r = vs * (S.t - d.t); l.position.x = d.x; l.scale.set(r, r, 1); l.material.opacity = Math.max(0.15, 0.9 - r / 9); });
      FZ.show('dpA', V3(3.4, 2.1, 1.6), 1); FZ.show('dpB', V3(-3.4, 2.1, 1.6), 1); FZ.show('dpC', V3(S.x, 1.7, 0), 1);
      FZ.setTag('dpK', S.etk || ''); FZ.show('dpK', V3(-1.4, 0.2, 2.8), S.etk ? 1 : 0);
    },
    qp: () => V3(0, 3.2, 0) });

  // ================= A) AYT Manyetizma: yüklü parçacık soruları yeni düzeneğe =================
  const YP = (mod, etk, r) => ({ mod, etk, r: r || 1.5, kos: 0, th: 0, xx: -4.5 }), YPG = S => { S.kos = 1; };
  EKLE('AYT', 'Manyetizma ve İndüklenme', sYP, 'AYT14-yp', 13, '⚛️', 'Yüklü parçacık manyetik alanda', 'Manyetik kuvvet, çembersel yörünge, periyot, hız seçici, alana paralel ve durgun yük.',
    { do: S => Object.assign(S, YP('cember', '', 1.5)), sub: 'Düzgün manyetik alan (⊗) ve (+) yüklü parçacık.', go: '▶︎ Başla' }, [
    TASI('AYT14-k2', 'Düzgün manyetik alana dik giren yüklü parçacık çembersel', YP('cember', 'r = mv/qB · v 2 katı → r 2 katı · T = 2πm/qB değişmez', 1.2), S => { S.kos = 1; S.r = 2.0; }),
    TASI('AYT14-k2', 'Yüklü parçacık düzgün manyetik alanda çembersel yörüngede dönerken', YP('cember', 'F ⟂ v → iş yok → E<sub>k</sub> sabit', 1.5), YPG),
    TASI('AYT14-k2', 'Birbirine dik E = 2000 V/m', YP('secici', 'qE = qvB → v = E/B = 4000 m/s'), YPG),
    TASI('AYT14-k', '3 μC', YP('cember', 'F = qvB = 3 · 10⁻⁶ · 2000 · 0,5 = 3 · 10⁻³ N', 1.5), YPG),
    TASI('AYT14-t', 'Yüklü parçacık manyetik alan çizgilerine paralel', YP('paralel', 'v ∥ B → F = 0 · düz gider'), YPG),
    TASI('AYT14-t2', 'Durgun bir elektron düzgün manyetik alana', YP('dur', 'v = 0 → F = qvB = 0'), undefined),
  ]);

  // ================= B) AYT Dalga Mekaniği: Doppler soruları ambulans düzeneğine =================
  const DP = etk => ({ t: 0, kos: 1, x: -2.2, dal: [], son: 0, etk }), DPG = S => { S.etk = 'Ali: tepeler sık → f > f₀ · Ayşe: seyrek → f < f₀ · Can: f₀'; };
  EKLE('AYT', 'Dalga Mekaniği', sDp, 'AYT20-dp', 13, '🚑', 'Doppler olayı: ambulans', 'Yaklaşan ve uzaklaşan kaynakta algılanan frekans; kaynağın kendi frekansı.',
    { do: S => Object.assign(S, DP('')), sub: 'Sireni çalan ambulans: dalga tepeleri üstten halka olarak görünüyor.', go: '▶︎ Başla' }, [
    TASI('AYT20-k', 'Sireni çalan ambulans', () => DP(''), DPG),
    TASI('AYT20-k2', 'Sireni çalan ambulans sabit hızla', () => DP(''), DPG),
    TASI('AYT20-t2', 'Doppler olayında kaynak gözlemciye', () => DP(''), DPG),
  ]);

  // ================= C) AYT Dalga Mekaniği: ışık soruları Young düzeneğine, EM soruları EM dalga düzeneğine =================
  const sY = TABAN('UNI4-g1'), YG = (lam, d, L) => ({ mod: 'isik', lam, d, L, olc: 0, say: 0 });
  EKLE('AYT', 'Dalga Mekaniği', sY, 'AYT20-yg', 14, '🌈', 'Işıkta girişim ve kırınım (Young)', 'Young deneyi: saçak aralığı, yol farkı, renk ve ortam etkisi; tek yarık.',
    { do: S => Object.assign(S, YG(600, 0.25, 1.5)), sub: 'Young deneyi: lazer, çift yarık ve perde.', go: '▶︎ Başla' }, [
    TASI('AYT20-k', 'Young deneyinde λ = 500 nm', YG(500, 0.5, 2)),
    TASI('AYT20-k2', 'Young deneyinde λ = 4000 Å', YG(400, 0.25, 1.5)),
    TASI('AYT20-k2', 'Kırmızı ışıkla yapılan Young', YG(650, 0.25, 1.5), S => { S.lam = 450; }),
    TASI('AYT20-k2', 'Young deneyinde fant ile perde arası', YG(600, 0.25, 1.5), S => { S.lam = 450; }),
    TASI('AYT20-t', 'Young deneyi düzeneği havadan suya', YG(600, 0.25, 1.5), S => { S.lam = 450; }),
  ]);
  const sEM = TABAN('UNI3-g1');
  EKLE('AYT', 'Dalga Mekaniği', sEM, 'AYT20-em', 15, '📡', 'Elektromanyetik dalgalar', 'E ve B alanları, boşlukta hız, spektrum, EM dalganın kaynağı.',
    { do: S => Object.assign(S, { k: 1.2, kos: 1, lg: 8 }), sub: 'Elektromanyetik dalga: E (kırmızı) ve B (mavi) birbirine ve yayılma yönüne dik.', go: '▶︎ Başla' }, [
    TASI('AYT20-k2', 'Radyo dalgaları ile görünür ışık', { k: 0.6, kos: 1 }),
    TASI('AYT20-k2', 'Aşağıdakilerin hangisinde çevreye elektromanyetik', { k: 1.2, kos: 1 }),
    TASI('AYT20-t2', 'Boşlukta gama ışınları', { k: 2.4, kos: 1 }),
  ]);

  // ================= D) Big Bang sorusu kozmoloji (genişleyen evren) düzeneğine =================
  const sAK = TABAN('SEC7-g1');
  EKLE('AYT', 'Atom Fiziğine Giriş ve Radyoaktivite', sAK, 'AYT21-bb', 15, '🌌', 'Big Bang ve genişleyen evren', 'Evrenin genişlemesi, kırmızıya kayma, kozmik fon ışıması.',
    { do: S => Object.assign(S, { a: 1, kos: 0, sec: 12 }), sub: 'Genişleyen evren: gökadalar arasındaki uzay genişliyor.', go: '▶︎ Başla' }, [
    TASI('AYT21-pf', 'Aşağıdakilerden hangisi Big Bang', { a: 1, kos: 0 }, S => { S.kos = 1; }),
    { do: S => Object.assign(S, { a: 1, kos: 0 }), q: { kartGizle: true, goster: S => { S.kos = 1; }, t: 'Uzak bir gökadadan gelen ışığın tayf çizgilerinin, laboratuvardaki çizgilere göre daha <b>uzun</b> dalga boylarında görüldüğü ölçülüyor. Buna göre gökada için ne söylenebilir?', o: ['Bizden uzaklaşıyor', 'Bize yaklaşıyor', 'Duruyor', 'Sıcaklığı artıyor'],
      b: ['Doppler olayı ışıkta da görülür: uzaklaşan kaynaktan gelen ışığın dalga boyu uzar (kırmızıya kayma), yaklaşanınki kısalır (maviye kayma).'], s: ['Dalga boyu uzamış → <em>kırmızıya kayma</em> → gökada <em>uzaklaşıyor</em> ✓'], n: ['Hubble (1929): uzak gökadalar uzaklıklarıyla orantılı hızla uzaklaşıyor → evren genişliyor.'] } },
  ]);

  // ================= E) TYT Elektrostatik: etki ile yükleme sırası, etki–topraklama düzeneğine =================
  const sEt = TABAN('TYT6-g3');
  const etkiOynat = S => { S.ea = 0; [1, 2, 3, 4].forEach((e, i) => setTimeout(() => { if (S.mod === 'etki') S.ea = e; }, 700 + i * 900)); };
  EKLE('TYT', 'Elektrostatik', sEt, 'TYT6-et', 14, '⚡', 'Etki ile yükleme ve topraklama', 'Etki ile yüklemede işlem sırası.',
    { do: S => Object.assign(S, { mod: 'etki', ea: 0, ak: 0, ey: 0 }), sub: 'Nötr iletken küre, (−) yüklü çubuk ve toprak bağlantısı.', go: '▶︎ Başla' }, [
    TASI('TYT6-k', 'Nötr iletken küreyi etki ile (+) yüklemek', { mod: 'etki', ea: 0, ak: 0, ey: 0 }, etkiOynat),
  ]);

  // ================= F) TYT Madde: adezyon, yüzey gerilimi, kılcallık soruları kılcallık–yüzey düzeneğine =================
  const sYz = TABAN('TYT2-g3');
  EKLE('TYT', 'Madde ve Özellikleri', sYz, 'TYT2-yz', 14, '💧', 'Adezyon, yüzey gerilimi, kılcallık', 'Su ve cıvanın cam boruda yüzeyi, deterjanın etkisi, boru inceliği ve kılcal yükselme.',
    { do: S => Object.assign(S, { mod: 'kilcal', dal: 0, kos: 0 }), sub: 'Su ve cıva kapları, ince cam borular; su yüzeyi ve iğne.', go: '▶︎ Başla' }, [
    TASI('TYT2-k', 'Cam boruya konan suyun yüzeyi içbükey', { mod: 'kilcal', dal: 0, kos: 0 }, S => { S.kos = 1; }),
    TASI('TYT2-k', 'Suyun yüzey gerilimini AZALTAN', { mod: 'yuzey', det: 0, bat: 0 }, S => { S.det = 1; }),
    TASI('TYT2-k', 'Kılcal cam borularda suyun yükselme', { mod: 'kilcal', dal: 0, kos: 0 }, S => { S.kos = 1; }),
  ]);

  // ================= G) Sahne doğru, soru başka düzeneği anlatıyordu → soru sahneye göre yeniden yazıldı =================
  // AYT Momentum (vagon rayı): "topun duvara çarpması" → vagonların çarpışmasında itme
  YAZ('AYT7-k', '0,5 kg\'lık top duvara', { do: S => Object.assign(S, { m1: 3, v1: 4, m2: 1, v2: 0, yapis: 1, x1: -5, x2: 1, kos: 0, carpti: 0 }),
    q: { goster: S => Object.assign(S, { m1: 3, v1: 4, m2: 1, v2: 0, yapis: 1, x1: -5, x2: 1, carpti: 0, kos: 1 }),
      t: '3 kg\'lık vagon 4 m/s ile duran 1 kg\'lık vagona çarpıp yapışıyor; çarpışma 0,1 s sürüyor. 1 kg\'lık vagona etki eden ortalama kuvvet kaç N\'dur?', o: ['30', '40', '10', '120'],
      b: [FM('F · Δt = Δp = m (v<sub>son</sub> − v<sub>ilk</sub>)'), FM('m<sub>1</sub>v<sub>1</sub> + m<sub>2</sub>v<sub>2</sub> = (m<sub>1</sub> + m<sub>2</sub>) v')],
      s: ['Ortak hız: 12 = 4v → v = 3 m/s', 'Δp = 1 · (3 − 0) = 3 kg·m/s', `F = ${F('3', '0,1')} = <em>30 N</em> ✓`], n: ['3 kg\'lık vagona da eşit büyüklükte, zıt yönlü 30 N etki eder (etki–tepki).'] } });
  YAZ('AYT7-t', 'Top duvara 8 m/s', { do: S => Object.assign(S, { m1: 1, v1: 6, m2: 3, v2: 0, yapis: 0, x1: -5, x2: 1, kos: 0, carpti: 0 }),
    q: { goster: S => Object.assign(S, { m1: 1, v1: 6, m2: 3, v2: 0, yapis: 0, x1: -5, x2: 1, carpti: 0, kos: 1 }),
      t: '1 kg\'lık vagon 6 m/s ile duran 3 kg\'lık vagona esnek çarpıyor ve 3 m/s ile geri dönüyor. 1 kg\'lık vagonun momentum değişiminin büyüklüğü kaç kg·m/s\'dir?', o: ['9', '3', '6', '0'],
      b: ['Momentum vektöreldir: yön değişince işaret değişir.', FM('Δp = m (v<sub>son</sub> − v<sub>ilk</sub>)')],
      s: ['İlk yönü (+) al: v<sub>ilk</sub> = +6, v<sub>son</sub> = −3', 'Δp = 1 · (−3 − 6) = −9 → büyüklük <em>9 kg·m/s</em> ✓'], n: ['TUZAK: hızların büyüklüklerini çıkarıp 6 − 3 = 3 bulmak. Geri dönen cismin hızı ters işaretlidir.'] } });
  // AYT Bağıl hareket (nehirde kayık): karadaki araba ve yağmur soruları → kayık–akıntı
  YAZ('AYT2-k', 'Kuzeye 20 m/s ile giden A', { do: S => Object.assign(S, { vk: 4, va: 3, gen: 60, kos: 0, tt: 0 }),
    q: { goster: S => { S.tt = 0; S.kos = 1; }, t: 'Kayık suya göre 4 m/s ile kıyıya dik gidiyor; akıntı 3 m/s. Akıntıyla sürüklenen bir dal parçasının üzerindeki karıncaya göre kayığın hızı kaç m/s\'dir?', o: ['4', '5', '3', '7'],
      b: [FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>'), 'Dal parçası akıntıyla aynı hızla gider.'],
      s: ['Kayığın yere göre hızı = suya göre hızı + akıntı', 'Karıncanın hızı = akıntı → bağıl hız = kayığın <em>suya göre hızı: 4 m/s</em> ✓ (kıyıya dik)'], n: ['Akıntıyla sürüklenen gözlemci, kayığı durgun sudaki gibi görür.'] } });
  YAZ('AYT2-k', 'Rüzgârsız havada yağmur', { do: S => Object.assign(S, { vk: 3, va: 4, gen: 60, kos: 0, tt: 0 }),
    q: { goster: S => { S.tt = 0; S.kos = 1; }, t: 'Kayık suya göre 3 m/s ile kıyıya dik gidiyor; akıntı 4 m/s. Kıyıdaki gözlemciye göre kayığın hızı kaç m/s\'dir?', o: ['5', '7', '1', '3'],
      b: ['Yere göre hız = suya göre hız + akıntı hızı (vektörel toplam)', 'İki hız birbirine diktir.'],
      s: [`v = √(3² + 4²) = <em>5 m/s</em> ✓`], n: ['Hızlar sayı gibi toplanmaz (3 + 4 = 7 değil); dik vektörler Pisagor ile toplanır.'] } });
  YAZ('AYT2-t', 'Aynı yönde 25 m/s', { do: S => Object.assign(S, { vk: 5, va: 2, gen: 100, kos: 0, tt: 0 }),
    q: { goster: S => { S.tt = 0; S.kos = 1; }, t: 'Kayık suya göre 5 m/s ile kıyıya dik gidiyor, akıntı 2 m/s. Kayığa göre kıyıdaki bir ağaç hangi doğrultuda hareket ediyor görünür?', o: ['Kayığın hareketine ters yönde, 5,4 m/s ile', 'Hareketsiz görünür', 'Yalnız akıntıya ters, 2 m/s ile', 'Yalnız kayığın burnuna doğru, 5 m/s ile'],
      b: [FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>') + ' · ağacın yere göre hızı sıfır.'],
      s: ['v<sub>ağaç, kayığa göre</sub> = 0 − v<sub>kayık, yere göre</sub>', 'Büyüklük: √(25 + 4) ≈ <em>5,4 m/s</em>, kayığın yere göre hareketinin tersi yönünde ✓'], n: ['TUZAK: duran cismin her gözlemciye göre durduğunu sanmak.'] } });
  // AYT Basit makineler (makara düzeneği): levye sorusu → makara; "ip 4 m" → sahnedeki 2 m
  YAZ('AYT10-k', '2 m\'lik levyenin', { do: S => Object.assign(S, { W: 120, mod: 'har', cek: 0, kos: 0 }),
    q: { goster: S => { S.cek = 0; S.kos = 1; }, t: '120 N\'luk yük hareketli makaraya asılıyor (makara ağırlığı ve sürtünme önemsiz). Yükü sabit hızla kaldırmak için ipe kaç N kuvvet uygulanmalıdır?', o: ['60', '120', '240', '40'],
      b: ['Hareketli makarada yükü iki ip parçası taşır.'], s: ['2F = G → F = 120 / 2 = <em>60 N</em> ✓'], n: ['Kuvvetten kazanç: 2 kat; yoldan kayıp: ip, yükün iki katı kadar çekilir.'] } });
  YAZ('AYT10-k', 'Hareketli makarada ip 4 m', { q: { t: 'Hareketli makarada ip 2 m çekilirse yük kaç m yükselir?', o: ['1', '2', '4', '0,5'],
      s: ['İki ip parçası birlikte kısalır: yük 2 / 2 = <em>1 m</em> yükselir ✓'] } });
  // AYT Momentum: "cisim iki parçaya ayrılıyor" → rayda iki vagon arasında sıkıştırılmış yay (sahnedeki düzenek)
  YAZ('AYT7-k', 'Duran 3 kg\'lık bir cisim iki parçaya', { do: S => Object.assign(S, { m1: 1, v1: 0, m2: 3, v2: 0, yapis: 0, x1: -5, x2: 1, kos: 0, carpti: 0 }),
    q: { t: 'Rayda duran 1 kg ve 3 kg\'lık vagonlar, aralarına sıkıştırılmış hafif bir yayla birbirine itiliyor. Yay serbest kalınca 1 kg\'lık vagon 6 m/s ile sola gidiyor. 3 kg\'lık vagonun hızı nedir? (sürtünme yok)', o: ['2 m/s, sağa', '6 m/s, sağa', '2 m/s, sola', '18 m/s, sağa'],
      b: ['Dış kuvvet yoksa toplam momentum korunur; başlangıçta vagonlar durgun olduğu için toplam momentum sıfırdır.'], s: ['0 = 1 · (−6) + 3 · v', 'v = <em>2 m/s, sağa</em> ✓'], n: ['Vagonlara etki eden yay kuvvetleri eşit ve zıttır (etki–tepki); kütlesi büyük olan daha yavaş gider.'] } });
  // TYT Enerji (rampa – sürtünmeli bölge – yay): "zıplayan top" → aynı düzenekte enerji kaybı
  YAZ('TYT4-k', 'Yerden 5 m yükseklikten serbest bırakılan top', { do: S => Object.assign(S, { mod: 'rampa', h: 2, mu: 0.375, m: 2, k: 200, X: -3.4, v: 0, Q: 0, kos: 0 }),
    q: { goster: S => { S.X = -3.4; S.v = 0; S.Q = 0; S.kos = 1; }, t: '2 kg\'lık blok 2 m yükseklikten sürtünmesiz rampadan bırakılıyor; yataydaki sürtünmeli bölgeden geçip yaya çarpıyor, geri dönerken aynı bölgeden yine geçiyor ve rampada en çok 0,5 m yükseliyor. Başlangıçtaki mekanik enerjinin yüzde kaçı ısıya dönüşmüştür? (g = 10 m/s²)', o: ['%75', '%25', '%50', '%80'],
      b: [FM('E<sub>p</sub> = m g h') + ' · kaybolan mekanik enerji = ısıya dönüşen enerji (enerji korunumu)'], s: ['Başta: 2 · 10 · 2 = 40 J · sonda: 2 · 10 · 0,5 = 10 J', 'Isı: 30 J → 30 / 40 = <em>%75</em> ✓'], n: ['Yayda depolanan enerji geri verilir; kayıp yalnız sürtünmeli bölgede olur.'] } });
  // Sahnenin hesap kartı başka bir durumu anlatıyor → bu soruda gizle (hep) ya da cevaba kadar gizle
  const KART = (yk, bas, hep, once) => { const st = SORU(yk, bas, false); if (!st) { console.warn('uyum: kart', yk, bas); return; }
    if (hep) st.q.hepGizle = (st.q.hepGizle || []).concat(hep); if (once) st.q.gizle = (st.q.gizle || []).concat(once); };
  KART('TYT7-g3', '12 V\'luk üretece 4 Ω ve 4 Ω\'luk ampuller seri', null, ['k5a', 'k5b']);   // ampermetre ve voltmetre değerleri cevaptır
  KART('AYT10-k', 'Hareketli makarayla 100 N', ['b10t']);          // kart ideal makarayı (F = 50 N) gösteriyor, soru sürtünmeli (60 N)
  KART('AYT7-g1', 'Top duvara 0,02 s', ['m7t']);                   // kart vagonların momentumunu gösteriyor
  KART('AYT16-g5', 'Yatay virajda (r = 50 m)', ['c5t']);           // kart ipe bağlı cismi (r = 2 m) gösteriyor
  KART('AYT20-g1', 'Aynı deney kırılma indisi 4/3', ['w20t']);     // kart su dalgası yol farkını gösteriyor
  KART('AYT21-g1', 'Yarı ömrü 5 gün olan 800', ['a21t']);          // kart hızlandırılmış 64 çekirdek / 2 günü gösteriyor
  // AYT Tork (destek üzerinde çubuk ve asılı yükler): eğik kuvvet sorusu → asılı yüklerle net tork
  YAZ('AYT8-k', 'Destekten 2 m uzaktaki noktaya çubukla 30°', { do: S => Object.assign(S, { W1: 50, d1: 2, W2: 50, d2: 3, ac: 0, goster2: 0 }),
    q: { goster: S => { S.goster2 = 1; }, t: 'Kütlesiz çubukta destekten 2 m solda 50 N, 3 m sağda 50 N asılı. Desteğe göre net tork kaç N·m\'dir ve çubuk ne yapar?', o: ['50 N·m; sağa döner', '0; dengede kalır', '250 N·m; sağa döner', '50 N·m; sola döner'],
      b: [FM('τ = F · d'), 'Torklar zıt yönlüyse net tork = farkları; çubuk büyük tork yönünde döner.'],
      s: ['Sol: 50 · 2 = 100 N·m · sağ: 50 · 3 = 150 N·m', 'Net: <em>50 N·m</em>, sağdaki tork büyük → <em>sağa döner</em> ✓'] } });
})();
