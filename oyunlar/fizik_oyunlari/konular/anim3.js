// Animasyon programı · Madde ve Özellikleri Laboratuvarı: özkütle (taşırma kabı), m–V grafiği, karışımlar,
// dayanıklılık, adezyon–kohezyon, kılcallık, yüzey gerilimi
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };

  // =====================================================================
  // ÖZKÜTLE: terazi → taşırma kabı → dereceli silindir (1 cm = 0,28 birim)
  // =====================================================================
  const MAT = [['Altın', 19.3, 0xd4a72c], ['Demir', 7.9, 0x4b5563], ['Alüminyum', 2.7, 0xa9b3c1], ['Cam', 2.5, 0x7fc6dc], ['Buz', 0.92, 0xcfe8f5], ['Tahta', 0.5, 0xb08150]];
  const CM = 0.28, SU_Y = 1.75, KAB_X = 0, SIL_X = 2.6, TER_X = -3.6;
  const sOz = sahne({ icon: '⚖️', cam: [[1.3, 3.8, 13], [1.3, 1.6, 0]], plate: [12, 5, 0, 0],
    data: [['Suyun özkütlesi', '1 g/cm³']],
    S0: () => ({ mi: 2, a: 2, p: 0, kos: 0, push: 0, iit: 0, graf: 0 }),
    kur(g) {
      // terazi
      const ekran = FZ.terazi(g); ekran.scale.setScalar(1.9); ekran.position.set(TER_X, 0, 0);   // dijital terazi (kefe y ≈ 0,56)
      // taşırma kabı (cam silindir), su, oluk
      silindir(g, 0.95, 0.95, 2.1, 0xbfdbfe, KAB_X, 1.05, 0, { op: 0.25, edge: false });
      const su = silindir(g, 0.92, 0.92, SU_Y - 0.05, 0x3b82f6, KAB_X, (SU_Y - 0.05) / 2 + 0.03, 0, { op: 0.45, edge: false });
      const oluk = kutu(g, 1.2, 0.06, 0.18, 0x94a3b8, KAB_X + 1.35, SU_Y - 0.2, 0); oluk.rotation.z = -0.35;
      // dereceli silindir
      silindir(g, 0.36, 0.36, 2.6, 0xe0f2fe, SIL_X, 1.3, 0, { op: 0.25, edge: false });
      for (let i = 1; i <= 10; i++) kutu(g, 0.12, 0.015, 0.02, 0x334155, SIL_X - 0.3, i * 0.24, 0.36, { edge: false });
      const silSu = silindir(g, 0.33, 0.33, 0.01, 0x3b82f6, SIL_X, 0.01, 0, { op: 0.7, edge: false });
      const damla = top(g, 0.06, 0x3b82f6, SIL_X, 2, 0, { edge: false });
      const kup = kutu(g, 1, 1, 1, 0xa9b3c1, TER_X, 0.56, 0);
      const igne = silindir(g, 0.02, 0.02, 1.6, 0x111827, 0, 3, 0, { edge: false });
      // m–V grafiği (arka panoda)
      const pano = kutu(g, 3.4, 2.8, 0.06, 0x111827, -1.3, 4.4, -1.6, { edge: false }); pano.visible = false;
      const eks = duz(g, 0xe5e7eb), cizg = [0xd4a72c, 0x3b82f6, 0xb08150].map(c => duz(g, c));
      kart('ozT', '', '#0f766e'); kart('ozV', '', '#2563eb'); kart('ozD', '', '#F5C400'); etiket('ozI', 'iğne', '#334155');
      ['ozg1', 'ozg2', 'ozg3'].forEach((id, i) => etiket(id, ['Alüminyum 2,7', 'Su 1', 'Tahta 0,5'][i], ['#a16207', '#2563eb', '#92400e'][i]));
      return { ekran, su, silSu, damla, kup, igne, pano, eks, cizg };
    },
    tick(S, dt, o) {
      const [ad, d, renk] = MAT[S.mi], V = S.a ** 3, m = d * V, yuz = d < 1, side = S.a * CM;
      if (S.kos) { S.p = Math.min(1, S.p + dt / 2.4); if (S.p >= 1) S.kos = 0; }
      if (S.iit) { S.push = Math.min(1, S.push + dt / 1.2); if (S.push >= 1) S.iit = 0; }
      const sub = yuz ? d + (1 - d) * S.push : 1, Vb = V * sub, akan = Math.max(0, Math.min(1, (S.p - 0.6) / 0.4));
      o.kup.material.color.setHex(renk); o.kup.scale.setScalar(side);
      // küpün yolu: terazi → kabın üstü → suya
      const p = S.p, son = yuz ? SU_Y - side * sub + side / 2 : 0.05 + side / 2;
      let x, y;
      if (p < 0.5) { const q = FZ.ease(p / 0.5); x = TER_X + (KAB_X - TER_X) * q; y = 0.56 + side / 2 + Math.sin(q * Math.PI) * 1.6 + q * (SU_Y + 0.6 - 0.56); }
      else { const q = FZ.ease((p - 0.5) / 0.5); x = KAB_X; y = SU_Y + 0.6 + side / 2 + (son - SU_Y - 0.6 - side / 2) * q; }
      o.kup.position.set(x, y, 0);
      o.igne.visible = yuz && p >= 1 && S.push > 0; o.igne.position.set(0.05, y + side / 2 + 0.8, 0);
      const h = Math.max(0.01, Vb * akan * 0.016); o.silSu.scale.y = h / 0.01; o.silSu.position.y = h / 2 + 0.02;
      o.damla.visible = S.kos && akan > 0 && akan < 1; o.damla.position.y = 0.4 + h + ((S.t * 2) % 1) * (SU_Y - 0.4 - h);
      FZ.setTag('ozT', p < 0.05 ? `${fs(m)} g` : '0 g'); FZ.show('ozT', V3(TER_X, 1.25, 0.6), 1);
      FZ.setTag('ozV', `${fs(Vb * akan)} cm³`); FZ.show('ozV', V3(SIL_X, 2.95, 0.4), 1);
      FZ.show('ozI', V3(0.05, y + side / 2 + 1.75, 0), o.igne.visible ? 1 : 0);
      FZ.setTag('ozD', S.p >= 1 ? `${ad}: d = ${fs(m)} / ${fs(Vb)} = ${fs(m / Vb)} g/cm³` : `${ad} · kenar ${fs(S.a)} cm`);
      FZ.show('ozD', V3(1.5, 3.9, 0), 1);
      // grafik
      o.pano.visible = !!S.graf; o.eks.visible = !!S.graf; o.cizg.forEach(l => l.visible = !!S.graf);
      if (S.graf) { const X = v => -2.8 + v / 10 * 3, Y = mm => 3.2 + mm / 30 * 2.4, Z = -1.55;
        FZ.setLine(o.eks, [V3(X(0), Y(30), Z), V3(X(0), Y(0), Z), V3(X(10), Y(0), Z)]);
        [2.7, 1, 0.5].forEach((dd, i) => { const vm = Math.min(10, 30 / dd); FZ.setLine(o.cizg[i], [V3(X(0), Y(0), Z), V3(X(vm), Y(dd * vm), Z)]); FZ.show(['ozg1', 'ozg2', 'ozg3'][i], V3(X(vm) + 0.1, Y(dd * vm) + 0.12, Z), 1); }); }
    },
    qp: () => V3(0.4, 4, 0) });
  const birak = S => { S.p = 0; S.kos = 1; S.push = 0; S.iit = 0; };
  const sec = (S, mi, a) => { S.mi = mi; S.a = a; S.p = 0; S.kos = 0; S.push = 0; S.iit = 0; };
  const dOz = ders(sOz, { yk: 'TYT2-d2', no: 2, icon: '⚖️', name: 'Taç gerçekten altın mı?', task: 'Özkütle, taşırma kabıyla hacim ölçümü, yüzen cisimler, kütle–hacim grafiği ve karışımlar.', steps: [
    { k: { tur: 'merak', b: 'Kral, tacın saf altın olup olmadığını merak ediyordu', m: ['Arşimet tacı eritemezdi. Ama tacın kütlesini tartıp hacmini suyla ölçebilirdi.', 'Özkütle, maddeyi tanıtan bir "parmak izi" gibidir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Özkütle', f: ['ozD'], m: [`${FM(`d = ${F('m', 'V')}`)} · birim g/cm³ (1 g/cm³ = 1000 kg/m³)`, 'Aynı sıcaklık ve basınçta her saf madde için sabittir: <em>ayırt edicidir</em>. Kütle ve hacim tek başına ayırt edici değildir.'] } },
    { do: S => sec(S, 2, 2), p: { t: 'Kenarı 2 cm olan alüminyum küp teraziye konuyor: 21,6 g. Taşırma kabına bırakılırsa kaç cm³ su taşar?', o: ['21,6 cm³', '8 cm³', '2 cm³', '2,7 cm³'], d: 1 } },
    { sub: 'Küpü taşırma kabına bırakalım.', go: '▶︎ Bırak' },
    { do: birak, sub: 'Taşan su dereceli silindirde toplanıyor…', until: S => S.p >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Taşan su = batan hacim', f: ['ozV', 'ozD', 'ozT'], m: [`V = 2³ = 8 cm³ → d = ${F('21,6', '8')} = <em>2,7 g/cm³</em> (alüminyum)`, 'Düzensiz cisimlerin hacmi de böyle ölçülür.'] } },
    { do: S => sec(S, 5, 3), p: { t: 'Kenarı 3 cm tahta küp (d = 0,5 g/cm³) kaba bırakılıyor. Taşan su kaç cm³ olur?', o: ['27 cm³', '13,5 cm³', '0', '54 cm³'], d: 1 } },
    { sub: 'Tahta küpü bırakalım.', go: '▶︎ Bırak' },
    { do: birak, sub: 'Tahta yüzüyor…', until: S => S.p >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Yüzen cisim hacminin bir kısmını batırır', f: ['ozV', 'ozD'], m: ['Taşan su 13,5 cm³ ama küpün hacmi 27 cm³. Bu ölçümle d = 13,5 / 13,5 = 1 bulunur: <em>yanlış!</em>', 'Doğru ölçüm için yüzen cisim ince bir iğneyle tamamen batırılır.'] } },
    { sub: 'İğneyle tamamen batıralım.', go: '▶︎ Batır' },
    { do: S => { S.iit = 1; }, sub: 'İğne küpü itiyor…', until: S => S.push >= 1 },
    { k: { tur: 'ornek', b: 'Şimdi doğru', f: ['ozD'], m: [`V = 27 cm³, m = 13,5 g → d = ${F('13,5', '27')} = <em>0,5 g/cm³</em>`] } },
    { do: S => { S.graf = 1; }, k: { tur: 'kavram', b: 'Kütle–hacim grafiği', f: ['ozg1', 'ozg2', 'ozg3'], m: ['m–V grafiği orijinden geçen bir doğrudur: <em>eğim = özkütle</em>.', 'Dik doğru: büyük özkütle. Aynı maddeden farklı büyüklükteki cisimler aynı doğru üzerindedir.', 'Eksenler ters çizilirse (V–m) eğim 1/d olur. Eksenlere dikkat!'] } },
    { do: S => { S.graf = 0; }, k: { tur: 'kavram', b: 'Karışımlar', m: [`${FM(`d<sub>k</sub> = ${F('m<sub>1</sub> + m<sub>2</sub>', 'V<sub>1</sub> + V<sub>2</sub>')}`)} · karışımın özkütlesi iki sıvınınkinin <em>arasındadır</em>.`, `Eşit hacim: ${FM(`d<sub>k</sub> = ${F('d<sub>1</sub> + d<sub>2</sub>', '2')}`)} · eşit kütle: ${FM(`d<sub>k</sub> = ${F('2 d<sub>1</sub> d<sub>2</sub>', 'd<sub>1</sub> + d<sub>2</sub>')}`)}`] } },
    { x: { b: 'Madde seç ve ölç', m: ['Farklı maddeleri tartıp kaba bırakın.'],
      kay: [{ ad: 'mi', etiket: 'Madde', min: 0, max: 5, adim: 1, deger: 1, birim: '', set: (S, v) => { sec(S, v, S.a); birak(S); } },
            { ad: 'a', etiket: 'Kenar', min: 1, max: 4, adim: 0.5, deger: 2, birim: 'cm', set: (S, v) => { sec(S, S.mi, v); birak(S); } }],
      olc: S => { const [ad, d] = MAT[S._mi]; return `<em>${ad}</em> · V = ${fs(S._a ** 3)} cm³ · m = ${fs(d * S._a ** 3)} g · d = <em>${fs(d)} g/cm³</em>${d < 1 ? '<br>Yüzer: doğru ölçüm için iğneyle batırılmalı.' : ''}`; } } },
    { k: { tur: 'dikkat', b: 'Özkütle neyle değişir?', m: ['Cismi ikiye bölmek özkütleyi <em>değiştirmez</em>.', 'Sıcaklık artınca maddeler genleşir, hacim artar, özkütle azalır (suyun 0–4 °C davranışı hariç). Gazların özkütlesi basınçla da çok değişir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`d = ${F('m', 'V')}`)} · taşan su = batan hacim · m–V eğimi = d · ${FM(`d<sub>k</sub> = ${F('Σm', 'ΣV')}`)}`] } },
  ] });
  const gOz = gorev(sOz, { yk: 'TYT2-g2', no: 2, icon: '🧪', name: 'Özkütle dedektifi', task: 'Taşırma kabı, yüzen cisim, m–V grafiği ve karışım soruları.', data: [['Suyun özkütlesi', '1 g/cm³']], steps: [
    { do: S => sec(S, 2, 3), sub: 'Bilinmeyen bir küp teraziye konuyor.', go: '▶︎ Başlat' },
    { do: birak, q: { t: '81 g\'lık bir cisim taşırma kabına bırakılıyor, batıyor ve 30 cm³ su taşıyor. Cismin özkütlesi kaç g/cm³\'tür?', o: ['2,7', '0,37', '81', '30'], f: ['ozV', 'ozT'],
      s: ['Batan cisimde taşan su = cismin hacmi = 30 cm³', `d = ${F('81', '30')} = <em>2,7 g/cm³</em> ✓ (alüminyum)`], n: ['Özkütle tablosuyla karşılaştırarak maddeyi tanıyabiliriz.'] } },
    { do: S => { sec(S, 5, 4); birak(S); }, q: { t: 'Kenarı 4 cm olan tahta küp (d = 0,5 g/cm³) taşırma kabına bırakılıyor ve yüzüyor. Kaç cm³ su taşar?', o: ['32 cm³', '64 cm³', '0', '128 cm³'], f: ['ozV'],
      s: ['m = 0,5 · 64 = 32 g', `Yüzen cisim kendi kütlesi kadar su taşırır: V<sub>su</sub> = ${F('32 g', '1 g/cm³')} = <em>32 cm³</em> ✓`], n: ['Yüzen cismin ağırlığı, taşırdığı suyun ağırlığına eşittir.'] } },
    { q: { t: 'm–V grafiğinde X maddesinin 10 cm³\'ü 30 g, Y maddesinin 20 cm³\'ü 20 g. d<sub>X</sub> / d<sub>Y</sub> oranı kaçtır?', o: ['3', '1', '1/3', '6'],
      s: [`d<sub>X</sub> = ${F('30', '10')} = 3 g/cm³ · d<sub>Y</sub> = ${F('20', '20')} = 1 g/cm³`, 'Oran = <em>3</em> ✓'], n: ['Grafikte eğimi büyük olan doğru, özkütlesi büyük olan maddedir.'] } },
    { q: { t: 'Özkütleleri 1 g/cm³ ve 0,8 g/cm³ olan iki sıvıdan <b>eşit hacim</b> karıştırılıyor. Karışımın özkütlesi kaç g/cm³\'tür?', o: ['0,9', '0,8', '1,8', '0,89'],
      s: [`Eşit hacim: d<sub>k</sub> = ${F('1 + 0,8', '2')} = <em>0,9 g/cm³</em> ✓`], n: ['Hacimlerin korunduğu kabul edilir.'] } },
    { q: { t: 'Özkütleleri 2 g/cm³ ve 3 g/cm³ olan iki sıvıdan <b>eşit kütle</b> karıştırılıyor. Karışımın özkütlesi kaç g/cm³\'tür?', o: ['2,4', '2,5', '2,6', '5'],
      s: [`Eşit kütle: d<sub>k</sub> = ${F('2 · 2 · 3', '2 + 3')} = ${F('12', '5')} = <em>2,4 g/cm³</em> ✓`], n: ['Eşit kütlede karışım, özkütlesi küçük olana daha yakındır (onun hacmi büyüktür).'] } },
  ] });
  FZ.konuEk('TYT', 'Madde ve Özellikleri', { dersler: [dOz], gorevler: [gOz] });

  // =====================================================================
  // DAYANIKLILIK · ADEZYON–KOHEZYON · KILCALLIK · YÜZEY GERİLİMİ
  // =====================================================================
  const sYz = sahne({ icon: '💧', cam: [[1.2, 3.8, 13.5], [1.2, 1.4, 0]], plate: [12, 5, 0, 0],
    data: [['Boru', 'cam']],
    S0: () => ({ mod: 'dayan', dal: 0, det: 0, bat: 0 }),
    kur(g) {
      const G = { dayan: new THREE.Group(), kilcal: new THREE.Group(), yuzey: new THREE.Group() }; Object.values(G).forEach(x => g.add(x));
      const kupler = [1, 2, 3].map((a, i) => kutu(G.dayan, a * 0.45, a * 0.45, a * 0.45, 0xf59e0b, -3 + i * 2.4 + a * 0.1, a * 0.225, 0));
      // kılcallık: su (sol) ve cıva (sağ) kapları, üç ince boru
      const kap = (x, renk) => { kutu(G.kilcal, 2.4, 1.1, 1.3, 0xbfdbfe, x, 0.55, 0, { op: 0.25, edge: false }); return kutu(G.kilcal, 2.3, 0.8, 1.2, renk, x, 0.42, 0, { op: 0.6, edge: false }); };
      kap(-1.8, 0x3b82f6); kap(1.8, 0x9ca3af);
      const borular = [], sivi = [];
      [-1.8, 1.8].forEach((cx, k) => [0.04, 0.07, 0.11].forEach((r, i) => { const x = cx - 0.75 + i * 0.75;
        borular.push(silindir(G.kilcal, r + 0.025, r + 0.025, 2.6, 0xe0f2fe, x, 1.5, 0, { op: 0.3, edge: false }));
        const sv = silindir(G.kilcal, r, r, 1, k ? 0x475569 : 0x3b82f6, x, 0.6, 0, { edge: false }); sv.userData = { r, x, cıva: k }; sivi.push(sv); }));
      // yüzey gerilimi: su teknesi, iğne, su böceği
      kutu(G.yuzey, 5, 0.9, 2, 0xbfdbfe, 0, 0.45, 0, { op: 0.25, edge: false });
      const suY = kutu(G.yuzey, 4.9, 0.8, 1.9, 0x3b82f6, 0, 0.4, 0, { op: 0.45, edge: false });
      const igne = silindir(G.yuzey, 0.025, 0.025, 1.6, 0x6b7280, -1, 0.83, 0, { edge: false }); igne.rotation.z = Math.PI / 2;
      const bocek = new THREE.Group(); bocek.position.set(1.4, 0.86, 0); G.yuzey.add(bocek); top(bocek, 0.12, 0x1f2937, 0, 0.08, 0, { edge: false });
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, l = silindir(bocek, 0.01, 0.01, 0.55, 0x111827, Math.cos(a) * 0.22, 0.04, Math.sin(a) * 0.22, { edge: false }); l.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); }
      etiket('yzA', '', '#b45309'); etiket('yzB', '', '#b45309'); etiket('yzC', '', '#b45309'); kart('yzT', '', '#F5C400'); kart('yzS', 'Su – cam', '#2563eb'); kart('yzC2', 'Cıva – cam', '#475569');
      return { G, kupler, sivi, igne, bocek };
    },
    tick(S, dt, o) {
      Object.entries(o.G).forEach(([k, gr]) => gr.visible = S.mod === k);
      if (S.mod === 'dayan') { o.kupler.forEach((m, i) => { const a = i + 1; FZ.setTag(['yzA', 'yzB', 'yzC'][i], `a = ${a} → ${F('1', String(a))}`); FZ.show(['yzA', 'yzB', 'yzC'][i], m.position.clone().add(V3(0, a * 0.225 + 0.5, 0)), 1); });
        FZ.setTag('yzT', 'Boyut k katı → dayanıklılık 1/k'); FZ.show('yzT', V3(0.2, 3.2, 0), 1); }
      else if (S.mod === 'kilcal') {
        S.dal = Math.min(1, S.dal + dt * (S.kos ? 0.6 : 0)); const yuz = 0.82;
        o.sivi.forEach(sv => { const { r, x, cıva } = sv.userData, dh = (cıva ? -0.012 : 0.03) / r * FZ.ease(S.dal), ust = yuz + dh, alt = 0.1;
          sv.scale.y = Math.max(0.02, ust - alt); sv.position.y = (ust + alt) / 2; });
        FZ.show('yzS', V3(-1.8, -0.2, 0.9), 1); FZ.show('yzC2', V3(1.8, -0.2, 0.9), 1);
        FZ.setTag('yzT', S.dal > 0.5 ? 'Su yükselir · cıva alçalır' : 'Borular sıvıya daldırılıyor…'); FZ.show('yzT', V3(0, 3.7, 0), 1); }
      else { if (S.det) S.bat = Math.min(1, S.bat + dt * 0.8);
        o.igne.position.y = 0.83 - 0.7 * S.bat; o.bocek.position.y = 0.86 - 0.3 * S.bat; o.bocek.position.x = 1.4 + Math.sin(S.t) * 0.3 * (1 - S.bat);
        FZ.setTag('yzT', S.det ? 'Deterjan: yüzey gerilimi azaldı' : 'Yüzey gerilimi iğneyi taşıyor'); FZ.show('yzT', V3(0.2, 2.3, 0), 1); }
    },
    qp: () => V3(0, 3.8, 0) });
  const dYz = ders(sYz, { yk: 'TYT2-d3', no: 3, icon: '🐜', name: 'Karınca güçlü, damla küre, su ağaca tırmanır', task: 'Dayanıklılık, adezyon ve kohezyon, kılcallık, yüzey gerilimi.', steps: [
    { k: { tur: 'merak', b: 'Karınca kendi ağırlığının onlarca katını taşır. Fil neden taşıyamaz?', m: ['Boyut büyüdükçe dayanıklılık neden azalır? Su ağacın tepesine nasıl çıkar? Böcek suda nasıl yürür?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Dayanıklılık', f: ['yzA', 'yzB', 'yzC'], m: [`${FM(`Dayanıklılık ∝ ${F('kesit alanı', 'hacim')}`)} · küp için ${F('a<sup>2</sup>', 'a<sup>3</sup>')} = ${F('1', 'a')}`, 'Taşınabilecek yük kesit alanıyla, cismin kendi ağırlığı hacmiyle orantılıdır.'] } },
    { p: { t: 'Bir köprü maketinin bütün boyutları 3 katına çıkarılıyor. Dayanıklılığı ne olur?', o: ['3 katına çıkar', '1/3\'üne iner', 'Değişmez', '1/9\'una iner'], d: 1 } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Büyük cisim kendi ağırlığına daha zor dayanır', f: ['yzT'], m: ['Kesit 9 katı, hacim (ağırlık) 27 katı → oran 1/3.', 'Fillerin bacakları bu yüzden vücutlarına oranla kalındır.'] } },
    { do: S => { S.mod = 'kilcal'; S.dal = 0; }, k: { tur: 'kavram', b: 'Adezyon ve kohezyon', m: ['<em>Kohezyon</em>: aynı cins moleküller arası çekim (su–su). <em>Adezyon</em>: farklı cins moleküller arası çekim (su–cam).', 'Adezyon > kohezyon → sıvı yüzeyi ıslatır (su–cam). Kohezyon > adezyon → ıslatmaz, damla olur (cıva).'] } },
    { p: { t: 'İnce cam borular suya ve cıvaya daldırılırsa ne olur?', o: ['İkisinde de sıvı yükselir', 'Su yükselir, cıva alçalır', 'Su alçalır, cıva yükselir', 'Hiçbiri değişmez'], d: 1 } },
    { sub: 'Boruları daldıralım.', go: '▶︎ Daldır' },
    { do: S => { S.kos = 1; }, sub: 'Kılcallık…', until: S => S.dal >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kılcallık', f: ['yzT', 'yzS', 'yzC2'], m: ['Su borularda yükseldi, yüzeyi <em>içbükey</em>. Cıva alçaldı, yüzeyi <em>tümsek</em>.', 'Boru inceldikçe etki büyür (en ince boruda en çok). Örnek: bitkilerin su taşıması, havlunun suyu emmesi, fitil.'] } },
    { do: S => { S.mod = 'yuzey'; S.det = 0; S.bat = 0; }, k: { tur: 'kavram', b: 'Yüzey gerilimi', m: ['Yüzeydeki moleküller yalnız yandan ve alttan çekilir; yüzey gergin bir zar gibi davranır. Yüzey gerilimi <em>kohezyon</em> kaynaklıdır.', 'Su böceği yürür, çelik iğne yüzer, damlalar küre olur.'] } },
    { sub: 'Suya deterjan damlatalım.', go: '▶︎ Deterjan' },
    { do: S => { S.det = 1; }, sub: 'Yüzey gerilimi azalıyor…', wait: 2.5 },
    { k: { tur: 'dikkat', b: 'Yüzey gerilimini azaltanlar', f: ['yzT'], m: ['Deterjan ve sabun yüzey gerilimini <em>azaltır</em> (iğne battı).', 'Sıcaklık artınca yüzey gerilimi azalır: sıcak su kirleri daha iyi temizler.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Dayanıklılık ∝ 1/boyut · Ad > Koh: ıslatır, yükselir · Koh > Ad: ıslatmaz, alçalır · yüzey gerilimi kohezyondan gelir; deterjan ve sıcaklık azaltır.'] } },
  ] });
  const gYz = gorev(sYz, { yk: 'TYT2-g3', no: 3, icon: '💧', name: 'Damla laboratuvarı', task: 'Dayanıklılık, kılcallık, adezyon–kohezyon ve yüzey gerilimi soruları.', steps: [
    { do: S => { S.mod = 'dayan'; }, sub: 'Kenarları 1, 2 ve 3 cm olan küpler.', go: '▶︎ Başlat' },
    { q: { t: 'Kenarı a olan bir küpün kenarı 2a yapılırsa dayanıklılığı nasıl değişir?', o: ['Yarıya iner', 'İki katına çıkar', '4 katına çıkar', 'Değişmez'], f: ['yzA', 'yzB'],
      s: [`Dayanıklılık ∝ ${F('a<sup>2</sup>', 'a<sup>3</sup>')} = ${F('1', 'a')} → a 2 katı → <em>yarıya iner</em> ✓`], n: ['Ağırlık hacimle (a³), taşıma gücü kesitle (a²) artar.'] } },
    { q: { t: 'Yarıçapı r, yüksekliği h olan silindirin r ve h değerleri 4 katına çıkarılırsa dayanıklılığı kaç katına iner?', o: ['1/4', '1/16', '1/64', '4'],
      s: ['Bütün boyutlar 4 katı → kesit 16, hacim 64 katı', `Oran ${F('16', '64')} = <em>1/4</em> ✓`], n: ['Kural: bütün boyutlar k katına çıkarsa dayanıklılık 1/k olur.'] } },
    { do: S => { S.mod = 'kilcal'; S.kos = 1; }, q: { t: 'Cam boru cıvaya daldırıldığında cıvanın borudaki seviyesi kaptakinden aşağıda kalır. Bunun sebebi nedir?', o: ['Cıvada kohezyon adezyondan büyüktür', 'Cıvada adezyon kohezyondan büyüktür', 'Cıva çok ağırdır', 'Boru çok geniştir'], f: ['yzC2'],
      s: ['Cıva molekülleri birbirini, camdan daha çok çeker.', '<em>Kohezyon > adezyon</em> → alçalır, yüzey tümsek ✓'], n: ['Su–camda ise tersi: yükselir, yüzey içbükey.'] } },
    { q: { t: 'Aynı sıvıya daldırılan cam borular inceldikçe suyun yükselme miktarı nasıl değişir?', o: ['Artar', 'Azalır', 'Değişmez', 'Su alçalmaya başlar'], f: ['yzS'],
      s: ['Kılcallıkta yükselme boru yarıçapıyla ters orantılıdır.', 'Boru inceldikçe <em>artar</em> ✓'], n: ['Bitkilerin çok ince iletim boruları suyu yükseklere taşır.'] } },
    { do: S => { S.mod = 'yuzey'; S.det = 1; }, q: { t: 'Su yüzeyinde duran çelik iğne, suya deterjan damlatılınca batıyor. Hangisi doğrudur?', o: ['Deterjan yüzey gerilimini azaltmıştır', 'Deterjan suyun özkütlesini artırmıştır', 'İğnenin kütlesi artmıştır', 'Su ısınmıştır'], f: ['yzT'],
      s: ['İğneyi taşıyan yüzey gerilimidir; deterjan onu <em>azaltır</em> ✓'], n: ['Sıcaklık artışı da yüzey gerilimini azaltır.'] } },
  ] });
  FZ.konuEk('TYT', 'Madde ve Özellikleri', { dersler: [dYz], gorevler: [gYz] });
})();
