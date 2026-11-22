// Kitap düzeninde HİKÂYE MODU + SORU SİSTEMİ · TYT Fizik Bilimine Giriş · Madde ve Özellikleri (madde bilgisi, karışımlar, dayanıklılık, adezyon–kohezyon)
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const SIVI = (renk, op = 0.6) => new THREE.MeshLambertMaterial({ color: renk, transparent: true, opacity: op, depthWrite: false });
  const CAM = () => new THREE.MeshPhongMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.22, shininess: 100, specular: 0xffffff, side: THREE.DoubleSide, depthWrite: false });
  // ölçü aletleri: cetvel, kronometre, dinamometre, termometre, ampermetre
  const cetvel = g => { const a = new THREE.Group(); g.add(a); kutu(a, 1.6, 0.03, 0.25, 0xfde68a, 0, 0.015, 0); for (let i = 0; i <= 16; i++) kutu(a, 0.01, 0.005, i % 5 ? 0.06 : 0.12, 0x111827, -0.78 + i * 0.1, 0.033, -0.08, { edge: false }); return a; };
  const kronometre = g => { const a = new THREE.Group(); g.add(a); const k = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 24), FZ.metal(0xd1d5db)); k.rotation.x = Math.PI / 2; a.add(k);
    const y = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), new THREE.MeshBasicMaterial({ color: 0xffffff })); y.position.z = 0.051; a.add(y); const ib = kutu(a, 0.02, 0.22, 0.01, 0xdc2626, 0, 0.1, 0.06, { edge: false });
    silindir(a, 0.05, 0.05, 0.12, 0x9ca3af, 0, 0.36, 0, { edge: false }); a.ibre = ib; return a; };
  const ampermetre = g => { const a = new THREE.Group(); g.add(a); kutu(a, 0.6, 0.45, 0.3, 0x1f2937, 0, 0.225, 0); const y = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xfef9c3 })); y.position.set(0, 0.17, 0.152); a.add(y);
    kutu(a, 0.01, 0.16, 0.01, 0xdc2626, 0.03, 0.25, 0.16, { edge: false }).rotation.z = -0.5; [-0.18, 0.18].forEach((x, i) => silindir(a, 0.04, 0.04, 0.06, i ? 0xdc2626 : 0x111827, x, 0.48, 0.05, { edge: false })); const l = FZ.levha(a, 'A', 0.12, 0.12, '#fef9c3', '#111827', 0, 0.08, 0.16); return a; };
  // Eşit kollu terazi: a.kol (dönen), a.kefe[0/1]; a.ayarla(eğim)
  const terazi = g => { const a = new THREE.Group(); g.add(a); kutu(a, 0.8, 0.1, 0.5, 0x78350f, 0, 0.05, 0); silindir(a, 0.05, 0.05, 1.6, 0x9ca3af, 0, 0.85, 0, { edge: false });
    const kol = new THREE.Group(); kol.position.y = 1.65; a.add(kol); kutu(kol, 2.6, 0.06, 0.06, 0x9ca3af, 0, 0, 0);
    a.kefe = [-1.2, 1.2].map(x => { const k = new THREE.Group(); a.add(k); [-0.2, 0.2].forEach(dz => { const ip = silindir(k, 0.006, 0.006, 0.7, 0x111827, 0, -0.35, dz, { edge: false }); }); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.05, 24), FZ.metal(0xd4a72c)); t.position.y = -0.72; k.add(t); k.x0 = x; return k; });
    a.kol = kol; a.ayarla = th => { kol.rotation.z = th; a.kefe.forEach((k, i) => { const s = i ? 1 : -1; k.position.set(s * 1.2 * Math.cos(th), 1.65 + s * 1.2 * Math.sin(th), 0); }); }; a.ayarla(0); return a; };

  const sMd = sahne({ icon: '⚖️', cam: [[2.2, 3.2, 10], [2.2, 1.2, 0]], plate: [12, 5, 0, 0], data: [['Suyun özkütlesi', '1 g/cm³']],
    cam2: S => ({ lab: [[2.0, 3.2, 8.5], [2.0, 1, 0]], terazi: [[2.2, 3, 9], [2.2, 1.2, 0]], karisim: [[2.2, 3.4, 10], [2.2, 1.2, 0]], dayan: [[2.2, 3, 9], [2.2, 0.9, 0]] })[S.mod],
    S0: () => ({ mod: 'lab', alet: 0, sol: [], sag: [], d1: 1, d2: 0.8, v1: 1, v2: 1, kar: 0, kos: 0, k: 1 }),
    kur(g) {
      const G = {}; ['lab', 'terazi', 'karisim', 'dayan'].forEach(k => { G[k] = new THREE.Group(); g.add(G[k]); });
      kutu(G.lab, 5, 0.12, 2, 0xb08150, 0, 0.9, 0); [-2.3, 2.3].forEach(x => kutu(G.lab, 0.12, 0.9, 1.8, 0x78350f, x, 0.45, 0));
      const al = []; const c = cetvel(G.lab); c.position.set(-1.7, 0.96, 0.3); al.push(c);
      const kr = kronometre(G.lab); kr.position.set(-0.6, 1.3, 0); al.push(kr);
      const am = ampermetre(G.lab); am.position.set(0.4, 0.96, 0); al.push(am);
      const tz = FZ.terazi(G.lab); tz.position.set(1.6, 0.96, 0); tz.scale.setScalar(0.8); al.push(tz);
      const din = new THREE.Group(); din.position.set(2.0, 2.4, 0.6); G.lab.add(din); const dg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8, 12), FZ.metal()); din.add(dg); silindir(din, 0.008, 0.008, 0.4, 0x111827, 0, -0.6, 0, { edge: false }); al.push(din);
      const ter = terazi(G.terazi); ter.position.x = 0;
      const blk = []; for (let i = 0; i < 6; i++) { const m = kutu(G.terazi, 0.3, 0.3, 0.3, 0xef4444, 0, 0, 0); m.visible = false; blk.push(m); }
      // karışım: iki beher + karışım kabı + yoğunluk kulesi
      const bh = [-1.6, 1.6].map((x, i) => { const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 1.4, 24, 1, true), CAM()); c2.position.set(x, 0.72, 0); G.karisim.add(c2); return silindir(G.karisim, 0.5, 0.48, 1, i ? 0xfacc15 : 0x3b82f6, x, 0.5, 0, { op: 0.6, edge: false }); });
      const kk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 24, 1, true), CAM()); kk.position.set(0, 0.92, -1.4); G.karisim.add(kk);
      const ks = silindir(G.karisim, 0.67, 0.67, 1, 0x22c55e, 0, 0.5, -1.4, { op: 0.6, edge: false });
      // dayanıklılık: üç küp + tabure + koltuk
      const kup = [1, 2, 3].map((a, i) => kutu(G.dayan, a * 0.4, a * 0.4, a * 0.4, 0xf59e0b, -2.2 + i * 1.6 + a * 0.08, a * 0.2, 0));
      const tab = new THREE.Group(); tab.position.set(2.8, 0, 0); G.dayan.add(tab); silindir(tab, 0.4, 0.4, 0.08, 0xb08150, 0, 0.9, 0); [0, 1, 2].forEach(i => { const a = i / 3 * 6.28, l = silindir(tab, 0.04, 0.04, 0.9, 0x78350f, Math.cos(a) * 0.3, 0.45, Math.sin(a) * 0.3); l.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); });
      ['k3a', 'k3b', 'k3c', 'k3d', 'k3e'].forEach(i => etiket(i, '', '#1e3a8a')); kart('k3K', '', '#F5C400');
      return { G, al, ter, blk, bh, ks, kup };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      if (S.mod === 'lab') {
        const AD = [['Cetvel', 'uzunluk · metre (m)'], ['Kronometre', 'zaman · saniye (s)'], ['Ampermetre', 'akım · amper (A)'], ['Terazi', 'kütle · kilogram (kg)'], ['Dinamometre', 'kuvvet · newton (N)']];
        o.al.forEach((a, i) => { a.scale.setScalar((i === 3 ? 0.8 : 1) * (i === S.alet ? 1.15 + 0.05 * Math.sin(S.t * 4) : 1)); });
        o.al[1].ibre.rotation.z = -S.t; const [ad, ne] = AD[S.alet]; FZ.setTag('k3a', `${ad}: ${ne}`); FZ.show('k3a', o.al[S.alet].position.clone().add(V3(0, 0.9, 0.3)), 1);
        FZ.setTag('k3K', S.alet === 4 ? 'Türetilmiş: kuvvet (N = kg·m/s²)' : 'Temel büyüklük'); FZ.show('k3K', V3(0, 2.9, 0), 1);
      } else if (S.mod === 'terazi') {
        const m = a => a.reduce((x, y) => x + y.m, 0), ml = m(S.sol), mr = m(S.sag), th = Math.max(-0.25, Math.min(0.25, (ml - mr) * 0.08));
        o.ter.kol.rotation.z += (th - o.ter.kol.rotation.z) * Math.min(1, dt * 3); o.ter.ayarla(o.ter.kol.rotation.z);
        let n = 0; [[S.sol, 0], [S.sag, 1]].forEach(([L, s]) => { const k = o.ter.kefe[s]; L.forEach((b, j) => { const m2 = o.blk[n++]; m2.visible = true; m2.material.color.setHex(b.c); m2.position.set(k.position.x - 0.2 + j * 0.34, k.position.y - 0.52, 0); FZ.setTag(['k3a', 'k3b', 'k3c', 'k3d', 'k3e'][Math.min(4, n - 1)], b.ad); FZ.show(['k3a', 'k3b', 'k3c', 'k3d', 'k3e'][Math.min(4, n - 1)], m2.position.clone().add(V3(0, 0.35, 0.2)), 1); }); });
        for (; n < o.blk.length; n++) o.blk[n].visible = false;
        FZ.setTag('k3K', Math.abs(th) < 0.01 ? 'Terazi dengede' : th > 0 ? 'Sol kefe ağır' : 'Sağ kefe ağır'); FZ.show('k3K', V3(0, 3, 0), 1);
      } else if (S.mod === 'karisim') {
        if (S.kos) { S.kar = Math.min(1, S.kar + dt * 0.4); if (S.kar >= 1) S.kos = 0; }
        o.bh.forEach((b, i) => { const v = [S.v1, S.v2][i]; b.scale.y = Math.max(0.01, Math.min(1.3, (1 - S.kar) * v)); b.position.y = 0.04 + b.scale.y / 2; });
        o.ks.scale.y = Math.max(0.01, Math.min(1.7, S.kar * (S.v1 + S.v2) * 0.8)); o.ks.position.y = 0.04 + o.ks.scale.y / 2;
        const dk = (S.d1 * S.v1 + S.d2 * S.v2) / (S.v1 + S.v2);
        FZ.setTag('k3a', `d<sub>1</sub> = ${fs(S.d1)} · V<sub>1</sub> = ${S.v1 * 100} cm³`); FZ.show('k3a', V3(-1.6, 1.8, 0), 1);
        FZ.setTag('k3b', `d<sub>2</sub> = ${fs(S.d2)} · V<sub>2</sub> = ${S.v2 * 100} cm³`); FZ.show('k3b', V3(1.6, 1.8, 0), 1);
        FZ.setTag('k3c', S.kar >= 1 ? `d<sub>k</sub> = ${fs(dk)} g/cm³` : '…'); FZ.show('k3c', V3(0, 2.3, -1.4), 1);
        FZ.setTag('k3K', 'd<sub>k</sub> = (m<sub>1</sub> + m<sub>2</sub>) / (V<sub>1</sub> + V<sub>2</sub>)'); FZ.show('k3K', V3(0, 3.2, 0), 1);
      } else {
        o.kup.forEach((m, i) => { const a = i + 1; FZ.setTag(['k3a', 'k3b', 'k3c'][i], `${a} kat · ${F('1', String(a))}`); FZ.show(['k3a', 'k3b', 'k3c'][i], m.position.clone().add(V3(0, a * 0.2 + 0.5, 0)), 1); });
        FZ.setTag('k3K', 'Dayanıklılık ∝ kesit / hacim'); FZ.show('k3K', V3(0.4, 2.4, 0), 1);
      }
    },
    qp: () => V3(0, 3.4, 0) });
  const md = (S, mod, x) => Object.assign(S, { mod, kos: 0 }, x || {});
  const B = (ad, m, c) => ({ ad, m, c });

  const h1 = ders(sMd, { yk: 'TYT1-d2', no: 2, icon: '🔬', name: 'Hikâye: Ece laboratuvarda — fizik nedir, neyi ölçer?', task: 'Fiziğin alt dalları, bilimsel yöntem, temel ve türetilmiş büyüklükler, skaler ve vektörel büyüklükler.', notlar: ['Temel büyüklükler (7): uzunluk m, kütle kg, zaman s, akım A, sıcaklık K, madde miktarı mol, ışık şiddeti cd.', 'Türetilmiş büyüklükler temel büyüklüklerden elde edilir: hız m/s, kuvvet N, enerji J…', 'Vektörel büyüklüğün yönü vardır (hız, kuvvet, ivme); skalerin yoktur (kütle, zaman, enerji).'], steps: [
    { do: S => md(S, 'lab', { alet: 0 }), sub: 'Ece, lisenin ilk fizik dersinde laboratuvara girdi. Masada beş ölçü aleti duruyordu.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'merak', b: 'Fizik neyi inceler?', m: ['Fizik; madde, enerji ve bunların etkileşimini inceler. Gözlem ve deneye dayanır, sonuçlarını matematikle ifade eder.'] } },
    { k: { tur: 'kavram', b: 'Bilimsel yöntem', m: ['Gözlem → problem → hipotez → deney → sonuç → teori/kanun.', 'Bilimsel bilgi değişebilir; yeni kanıtlarla güncellenir. Kişisel görüş bilimsel bilgi değildir.'] } },
    { do: S => { S.alet = 0; }, sub: 'Öğretmen önce cetveli gösterdi…', wait: 1.8 },
    { do: S => { S.alet = 1; }, sub: 'Sonra kronometreyi…', wait: 1.8 },
    { do: S => { S.alet = 2; }, sub: 'Ampermetreyi…', wait: 1.8 },
    { do: S => { S.alet = 3; }, sub: 'Teraziyi…', wait: 1.8 },
    { k: { tur: 'kavram', b: 'Temel büyüklükler (SI)', f: ['k3a'], m: ['Uzunluk (m), kütle (kg), zaman (s), elektrik akımı (A), sıcaklık (K), madde miktarı (mol), ışık şiddeti (cd).', 'Bu yedisi başka büyüklüklerle tanımlanmaz; bütün ölçümlerin temelidir.'] } },
    { do: S => { S.alet = 4; }, sub: 'En son dinamometreyi gösterdi: kuvvet ölçer.', wait: 1.8 },
    { k: { tur: 'kavram', b: 'Türetilmiş, skaler ve vektörel', f: ['k3K'], m: ['Kuvvet türetilmiştir: N = kg · m/s². Hız (m/s), enerji (J), basınç (Pa), özkütle (kg/m³) de türetilmiştir.', '<em>Vektörel</em>: büyüklük + yön (hız, kuvvet, ivme, yer değiştirme). <em>Skaler</em>: yalnız büyüklük (kütle, zaman, enerji, sıcaklık, sürat).'] } },
    { k: { tur: 'kavram', b: 'Fiziğin alt dalları', m: ['Mekanik (hareket, kuvvet) · Termodinamik (ısı) · Elektromanyetizma · Optik (ışık) · Atom ve nükleer fizik · Katıhal (yarı iletkenler) · Yüksek enerji ve plazma fiziği.', 'Örnek: güneş paneli → katıhal; MR cihazı → elektromanyetizma ve nükleer; uzay aracı → mekanik.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['7 temel büyüklük · diğerleri türetilmiş · vektör = büyüklük + yön · bilim deneye dayanır ve değişebilir.'] } },
  ] });
  const h2 = ders(sMd, { yk: 'TYT2-d4', no: 4, icon: '⚖️', name: 'Hikâye: Kuyumcudaki terazi ve meyve suyu karışımı', task: 'Kütle ve hacim, eşit kollu terazi, özkütle ayırt ediciliği, karışımların özkütlesi, dayanıklılık.', notlar: ['d = m / V; özkütle ayırt edicidir, kütle ve hacim değildir.', 'Karışım: d = (m₁ + m₂) / (V₁ + V₂); eşit hacim (d₁+d₂)/2, eşit kütle 2d₁d₂/(d₁+d₂).', 'Dayanıklılık ∝ kesit alanı / hacim; boyutlar k katına çıkınca 1/k katına iner.'], steps: [
    { do: S => md(S, 'terazi', { sol: [], sag: [] }), sub: 'Ece kuyumcu dedesini ziyaret etti. Dükkânda eski bir eşit kollu terazi vardı.', go: '▶︎ Hikâyeyi başlat' },
    { k: { tur: 'kavram', b: 'Kütle ve eşit kollu terazi', m: ['Kütle madde miktarıdır (kg), her yerde aynıdır. Eşit kollu terazi kütleleri karşılaştırır: kefeler dengedeyse kütleler eşittir.'] } },
    { do: S => { S.sol = [B('K', 2, 0xef4444)]; S.sag = [B('L', 1, 0x3b82f6), B('L', 1, 0x3b82f6)]; }, sub: 'Dedesi sol kefeye bir K bileziği, sağa iki özdeş L yüzüğü koydu: terazi dengede.', wait: 2.5 },
    { do: S => { S.sol = [B('K', 2, 0xef4444), B('M', 1.5, 0x22c55e)]; S.sag = [B('L', 1, 0x3b82f6), B('L', 1, 0x3b82f6), B('L', 1, 0x3b82f6)]; }, sub: 'Sonra sola bir M küpesi, sağa bir L yüzüğü daha ekledi. Sol kefe ağır bastı.', wait: 2.5 },
    { k: { tur: 'ornek', b: 'Teraziden sıralama', f: ['k3K'], m: ['1. durum: m<sub>K</sub> = 2m<sub>L</sub>. 2. durum: m<sub>K</sub> + m<sub>M</sub> > 3m<sub>L</sub> → m<sub>M</sub> > m<sub>L</sub>.', 'Kural: dengede eşitlik yaz, ağır basan tarafı eşitsizlikle göster, sonra birleştir.'] } },
    { k: { tur: 'kavram', b: 'Özkütle ayırt edicidir', m: [`${FM(`d = ${F('m', 'V')}`)} · altın 19,3, gümüş 10,5, bakır 8,9 g/cm³.`, 'Dedesi bileziğin altın olup olmadığını özkütlesinden anlar: kütleyi terazi, hacmi taşırma kabı verir.'] } },
    { do: S => md(S, 'karisim', { d1: 1, d2: 0.8, v1: 1, v2: 1, kar: 0 }), sub: 'Eve dönen Ece, 100 cm³ su ile 100 cm³ alkollü bir sıvıyı (d = 0,8) karıştırıyor.', go: '▶︎ Karıştır' },
    { do: S => { S.kos = 1; }, sub: 'Karışıyor…', until: S => S.kar >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Karışımın özkütlesi', f: ['k3c'], m: [`${FM(`d<sub>k</sub> = ${F('m<sub>1</sub> + m<sub>2</sub>', 'V<sub>1</sub> + V<sub>2</sub>')}`)} = (100 + 80) / 200 = <em>0,9 g/cm³</em>`, 'Eşit hacimde karışımda d<sub>k</sub> aritmetik ortalamadır. Karışımın özkütlesi iki sıvınınkinin arasındadır.'] } },
    { k: { tur: 'dikkat', b: 'UYARI · Eşit kütle', m: [`Eşit kütleler karışırsa: ${FM(`d<sub>k</sub> = ${F('2 d<sub>1</sub> d<sub>2</sub>', 'd<sub>1</sub> + d<sub>2</sub>')}`)} · özkütlesi küçük sıvıya daha yakındır (onun hacmi büyük).`] } },
    { do: S => md(S, 'dayan'), sub: 'Son olarak Ece neden fillerin ince bacaklı olmadığını merak etti. Kenarları 1, 2, 3 birim küplere baktı.', wait: 2 },
    { k: { tur: 'kavram', b: 'Dayanıklılık', f: ['k3a', 'k3b', 'k3c'], m: [`${FM(`Dayanıklılık ∝ ${F('kesit alanı', 'hacim')}`)} · küp için 1/a.`, 'Neden? Taşıma gücü kesitle (a²), ağırlık hacimle (a³) artar. Boyut büyüdükçe cisim kendi ağırlığına zor dayanır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['d = m/V ayırt edici · karışım d = Σm/ΣV · dayanıklılık 1/boyut.'] } },
  ] });

  const g1 = gorev(sMd, { yk: 'TYT1-g3', no: 3, icon: '🔬', name: 'Soru sistemi: fizik bilimine giriş', task: 'Temel–türetilmiş büyüklük, birim eşleştirme, skaler–vektör, bilimsel yöntem, fiziğin alt dalları.', steps: [
    { do: S => md(S, 'lab', { alet: 0 }), sub: 'Laboratuvar masası.', go: '▶︎ Başlat' },
    { do: S => { S.alet = 1; }, q: { t: 'Aşağıdaki büyüklük–SI birimi eşleştirmelerinden hangisi doğrudur?', o: ['Zaman – saniye, sıcaklık – kelvin', 'Zaman – dakika, sıcaklık – derece', 'Uzunluk – kilometre, kütle – gram', 'Akım – volt, kütle – newton'], f: ['k3a'],
      s: ['SI\'da zaman <em>saniye</em>, sıcaklık <em>kelvin</em>, uzunluk metre, kütle kilogram, akım amper ✓'], n: ['Dakika, °C, km, g SI temel birimi değildir.'] } },
    { do: S => { S.alet = 4; }, q: { t: 'I. Kuvvet<br>II. Elektrik akımı<br>III. Özkütle<br>IV. Madde miktarı<br>büyüklüklerinden hangileri türetilmiştir?', o: ['I ve III', 'II ve IV', 'I, II ve III', 'Yalnız I'], f: ['k3K'],
      s: ['Akım (A) ve madde miktarı (mol) temeldir.', 'Kuvvet (kg·m/s²) ve özkütle (kg/m³) türetilmiş → <em>I ve III</em> ✓'], n: ['7 temel büyüklüğü ezberlemek bu soruları kolaylaştırır.'] } },
    { q: { t: 'Hız, kütle, kuvvet, enerji, ivme, zaman büyüklüklerinden kaç tanesi vektöreldir?', o: ['3', '2', '4', '6'],
      s: ['Vektörel: hız, kuvvet, ivme → <em>3</em> ✓', 'Skaler: kütle, enerji, zaman.'], n: ['Yönü olan her büyüklük vektöreldir; sürat skaler, hız vektöreldir.'] } },
    { q: { t: 'Bir öğrenci "Sarkacın periyodu ipin boyuna bağlıdır" der ve farklı ip boylarıyla periyodu ölçer.<br>Öğrencinin söylediği ifade bilimsel yöntemin hangi basamağıdır?', o: ['Hipotez', 'Gözlem', 'Teori', 'Kanun'],
      s: ['Test edilecek geçici açıklama <em>hipotezdir</em>; ölçümler deneydir ✓'], n: ['Teori: çok kez doğrulanmış açıklama; kanun: doğadaki düzenliliğin ifadesi.'] } },
    { q: { t: 'Güneş paneli, MR cihazı ve dürbün sırasıyla fiziğin hangi alt dallarıyla doğrudan ilgilidir?', o: ['Katıhal – elektromanyetizma – optik', 'Optik – mekanik – termodinamik', 'Mekanik – optik – katıhal', 'Termodinamik – nükleer – mekanik'],
      s: ['Güneş paneli yarı iletken (katıhal), MR manyetik alan (elektromanyetizma), dürbün mercek (optik) ✓'], n: ['Bir teknoloji birden çok alt dalla ilgili olabilir; soruda en doğrudan olan aranır.'] } },
  ] });
  const g2 = gorev(sMd, { yk: 'TYT2-g4', no: 4, icon: '⚖️', name: 'Soru sistemi: madde, karışım, dayanıklılık', task: 'Eşit kollu terazi sıralama, özkütle tablosu, karışım özkütlesi, dayanıklılık, adezyon–kohezyon.', steps: [
    { do: S => md(S, 'terazi', { sol: [B('K', 2, 0xef4444)], sag: [B('L', 1, 0x3b82f6), B('L', 1, 0x3b82f6)] }), sub: 'Eşit kollu terazi.', go: '▶︎ Başlat' },
    { q: { t: 'Eşit kollu terazide 1 K = 2 L dengede; 1 K + 1 M ise 3 L\'den ağır basıyor. K, L, M kütleleri için hangisi kesinlikle doğrudur?', o: ['m<sub>K</sub> > m<sub>L</sub> ve m<sub>M</sub> > m<sub>L</sub>; K ile M karşılaştırılamaz', 'm<sub>L</sub> > m<sub>K</sub> > m<sub>M</sub>', 'm<sub>K</sub> = m<sub>L</sub> = m<sub>M</sub>', 'm<sub>M</sub> < m<sub>L</sub>'], f: ['k3K'],
      s: ['m<sub>K</sub> = 2m<sub>L</sub> → m<sub>K</sub> > m<sub>L</sub>', '2m<sub>L</sub> + m<sub>M</sub> > 3m<sub>L</sub> → m<sub>M</sub> > m<sub>L</sub>', 'K ile M karşılaştırılamaz ✓'], n: ['Teraziden çıkan her bilgi bir eşitlik ya da eşitsizliktir; olmayan bilgiyi uydurma.'] } },
    { q: { t: 'Özkütleleri: altın 19,3, gümüş 10,5, bakır 8,9 g/cm³. Kütlesi 193 g olan bir bilezik suya batırılınca 12 cm³ su taşıyor. Bilezik için ne söylenebilir?', o: ['Saf altın değildir; daha hafif bir metal karışmıştır', 'Saf altındır', 'Saf gümüştür', 'Saf bakırdır'],
      s: ['d = 193 / 12 ≈ 16,1 g/cm³', 'Altından küçük → içinde özkütlesi küçük metal var ✓'], n: ['Arşimet\'in taç hikâyesindeki yöntem budur.'] } },
    { do: S => md(S, 'karisim', { d1: 1, d2: 0.8, v1: 1, v2: 1, kar: 1 }), q: { t: 'Özkütleleri 1,2 g/cm³ ve 0,8 g/cm³ olan iki sıvıdan sırasıyla 200 cm³ ve 100 cm³ karıştırılıyor. Karışımın özkütlesi kaç g/cm³\'tür?', o: [F('16', '15'), '1', '0,9', '2'], f: ['k3c'],
      s: ['m = 240 + 80 = 320 g, V = 300 cm³', `d<sub>k</sub> = ${F('320', '300')} = <em>${F('16', '15')} g/cm³</em> ✓`], n: ['Hacimler farklıyken ortalama alınmaz; toplam kütle / toplam hacim.'] } },
    { q: { t: 'Özkütleleri d ve 3d olan sıvılardan eşit kütlede karıştırılıyor. Karışımın özkütlesi kaç d\'dir?', o: ['1,5', '2', '1,33', '2,5'],
      s: [`d<sub>k</sub> = ${F('2 · d · 3d', 'd + 3d')} = ${F('6d', '4')} = <em>1,5d</em> ✓`], n: ['Eşit kütlede sonuç az yoğun sıvıya yakındır.'] } },
    { do: S => md(S, 'dayan'), q: { t: 'Aynı maddeden yapılmış küp biçimli X, Y, Z cisimlerinin kenarları sırasıyla a, 2a, 3a\'dır. Dayanıklılıkları D<sub>X</sub>, D<sub>Y</sub>, D<sub>Z</sub> arasındaki ilişki nedir?', o: ['D<sub>X</sub> > D<sub>Y</sub> > D<sub>Z</sub>', 'D<sub>Z</sub> > D<sub>Y</sub> > D<sub>X</sub>', 'D<sub>X</sub> = D<sub>Y</sub> = D<sub>Z</sub>', 'D<sub>Y</sub> > D<sub>X</sub> > D<sub>Z</sub>'], f: ['k3a', 'k3b', 'k3c'],
      s: ['D ∝ 1/a → büyüdükçe azalır: <em>D<sub>X</sub> > D<sub>Y</sub> > D<sub>Z</sub></em> ✓'], n: ['Minyatür modeller gerçek yapıdan daha dayanıklıdır.'] } },
    { q: { t: 'Bir mobilya ustası aynı tahtadan bir tabure ve bütün boyutları 2 katı olan büyük bir tabure yapıyor. Büyük taburenin;<br>I. Ağırlığı 8 katıdır.<br>II. Ayak kesitleri 4 katıdır.<br>III. Kendi ağırlığına dayanıklılığı yarıya iner.<br>yargılarından hangileri doğrudur?', o: ['I, II ve III', 'Yalnız I', 'I ve II', 'II ve III'],
      s: ['Hacim 2³ = 8 (I) · kesit 2² = 4 (II) · dayanıklılık 4/8 = ½ (III)', '<em>I, II ve III</em> ✓'], n: ['Büyük yapılarda ayaklar orantısız kalın yapılır.'] } },
    { q: { t: 'I. Su damlasının küre biçimini alması<br>II. Suyun cam boruda yükselmesi<br>III. Cıvanın cam boruda alçalması<br>olayları sırasıyla hangi kavramlarla açıklanır?', o: ['Kohezyon (yüzey gerilimi) – adezyon > kohezyon – kohezyon > adezyon', 'Adezyon – kohezyon – adezyon', 'Kohezyon – kohezyon – adezyon', 'Adezyon – adezyon – kohezyon'],
      s: ['Damla: kohezyon kaynaklı yüzey gerilimi.', 'Su–cam: adezyon büyük → yükselir · cıva–cam: kohezyon büyük → alçalır ✓'], n: ['Hidrofil kumaş suyu emer (adezyon), su itici kumaş emmez.'] } },
  ] });
  FZ.konuEk('TYT', 'Fizik Bilimine Giriş', { dersler: [h1], gorevler: [g1] });
  FZ.konuEk('TYT', 'Madde ve Özellikleri', { dersler: [h2], gorevler: [g2] });
  const t1 = gorev(sMd, { yk: 'TYT1-g4', no: 4, tuzak: true, icon: '🪤', name: 'Tuzak sorular · fizik bilimine giriş', task: 'Büyüklük, birim ve bilimsel yöntemde sık yapılan yanlışlar.', steps: [
    { do: S => md(S, 'lab', { alet: 3 }), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başlat' },
    { q: { t: 'Ağırlık ile kütle için hangisi doğrudur?', o: ['Ağırlık vektörel ve N; kütle skaler ve kg', 'İkisi de kg ile ölçülür', 'Kütle yere göre değişir', 'Ağırlık skalerdir'],
      s: ['Ağırlık bir kuvvettir: vektörel, newton. Kütle madde miktarı: skaler, kg ✓'], n: ['TUZAK: günlük dildeki "kilom" ifadesi; aslında kütle. Ay\'da ağırlık azalır, kütle değişmez.'] } },
    { q: { t: 'Sıcaklığın SI birimi hangisidir?', o: ['Kelvin', 'Santigrat derece', 'Kalori', 'Joule'],
      s: ['SI temel birimi <em>kelvin</em> ✓; kalori ve joule enerji (ısı) birimidir.'], n: ['TUZAK: °C\'yi SI birimi sanmak.'] } },
    { q: { t: 'Bilimsel bir teori için hangisi doğrudur?', o: ['Yeni kanıtlarla değiştirilebilir', 'Kesin doğrudur, değişmez', 'Kişisel görüştür', 'Kanuna dönüşür'],
      s: ['Bilimsel bilgi yeni kanıtlarla <em>değişebilir</em> ✓'], n: ['TUZAK: teorinin zamanla kanuna dönüştüğünü sanmak; teori açıklar, kanun tanımlar.'] } },
  ] });
  const t2 = gorev(sMd, { yk: 'TYT2-g5', no: 5, tuzak: true, icon: '🪤', name: 'Tuzak sorular · madde ve özellikleri', task: 'Özkütle, karışım, dayanıklılık ve yüzey olaylarında sık yapılan yanlışlar.', steps: [
    { do: S => md(S, 'karisim', { d1: 1, d2: 0.8, v1: 1, v2: 1, kar: 1 }), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başlat' },
    { q: { t: 'Bir demir çubuk ikiye kesiliyor. Parçalardan birinin özkütlesi için hangisi doğrudur?', o: ['Değişmez', 'Yarıya iner', 'İki katına çıkar', 'Kütleye bağlı olarak artar'],
      s: ['Kütle ve hacim birlikte yarıya iner → <em>d değişmez</em> ✓'], n: ['TUZAK: kütle azaldı diye özkütle de azalır sanmak.'] } },
    { q: { t: 'Özkütleleri 1 ve 3 g/cm³ olan sıvılardan 100\'er gram karıştırılırsa karışımın özkütlesi kaç g/cm³ olur?', o: ['1,5', '2', '4', '1'], f: ['k3c'],
      s: ['Eşit kütle: 2 · 1 · 3 / (1 + 3) = <em>1,5</em> ✓'], n: ['TUZAK: eşit kütlede de ortalama (2) almak; ortalama yalnız eşit hacimde geçerli.'] } },
    { q: { t: 'Bir cismin bütün boyutları 2 katına çıkarılırsa dayanıklılığı ne olur?', o: ['Yarıya iner', 'İki katına çıkar', 'Değişmez', 'Dört katına çıkar'],
      s: ['Kesit 4, hacim 8 katı → 4/8 = <em>½</em> ✓'], n: ['TUZAK: büyük cisim daha sağlamdır sanmak.'] } },
    { q: { t: 'Cam boruda suyun yükselmesinin nedeni hangisidir?', o: ['Su–cam adezyonunun su–su kohezyonundan büyük olması', 'Kohezyonun adezyondan büyük olması', 'Açık hava basıncı', 'Suyun özkütlesinin küçük olması'],
      s: ['Kılcallıkta su yükselir çünkü <em>adezyon > kohezyon</em> ✓'], n: ['TUZAK: adezyon ile kohezyonu karıştırmak.'] } },
  ] });
  FZ.konuEk('TYT', 'Fizik Bilimine Giriş', { gorevler: [t1] });
  FZ.konuEk('TYT', 'Madde ve Özellikleri', { gorevler: [t2] });
})();
