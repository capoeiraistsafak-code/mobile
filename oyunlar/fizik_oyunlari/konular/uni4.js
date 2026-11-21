// ÜNİVERSİTE · Termodinamik ve Entropi — Maxwell Denklemleri ve EM Dalgalar — SEÇMELİ · Lazer Fiziği — SEÇMELİ · Nükleer Fizik
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };

  // =====================================================================
  // TERMODİNAMİK VE ENTROPİ — serbest genleşme (bölmeli kap, 40 molekül)
  // =====================================================================
  const NM = 40;
  const sTD = sahne({ icon: '🔥', cam: [[1.6, 7, 7], [1.6, 0.5, 0]], plate: [11, 7, 0, 0],
    data: [['k<sub>B</sub>', '1,38 · 10⁻²³ J/K']],
    S0: () => ({ bolme: 1, mol: Array.from({ length: NM }, () => ({ x: -3.8 + Math.random() * 3.5, z: -1.6 + Math.random() * 3.2, vx: (Math.random() - 0.5) * 4, vz: (Math.random() - 0.5) * 4 })) }),
    kur(g) {
      kutu(g, 8.4, 0.1, 3.8, 0xcbd5e1, 0, 0.05, 0, { op: 0.7 }); [-1.95, 1.95].forEach(z => kutu(g, 8.4, 0.7, 0.1, 0x64748b, 0, 0.35, z, { op: 0.5 })); [-4.15, 4.15].forEach(x => kutu(g, 0.1, 0.7, 3.8, 0x64748b, x, 0.35, 0, { op: 0.5 }));
      const bol = kutu(g, 0.12, 0.8, 3.8, 0x7c3aed, 0, 0.4, 0); const m = []; for (let i = 0; i < NM; i++) m.push(top(g, 0.13, 0xef4444, 0, 0.3, 0, { edge: false }));
      kart('tdt', '', '#F5C400'); return { bol, m };
    },
    tick(S, dt, o) {
      let sol = 0; o.bol.visible = !!S.bolme;
      S.mol.forEach((p, i) => { p.x += p.vx * dt; p.z += p.vz * dt;
        const xmax = S.bolme ? -0.2 : 3.95; if (p.x < -3.95) { p.x = -3.95; p.vx *= -1; } if (p.x > xmax) { p.x = xmax; p.vx = -Math.abs(p.vx); }
        if (p.z < -1.75) { p.z = -1.75; p.vz *= -1; } if (p.z > 1.75) { p.z = 1.75; p.vz *= -1; }
        o.m[i].position.set(p.x, 0.3, p.z); if (p.x < 0) sol++; });
      FZ.setTag('tdt', `Sol: ${sol} · Sağ: ${NM - sol}${S.bolme ? ' · bölme kapalı' : ''}`); FZ.show('tdt', V3(0, 1.6, -2.3), 1);
    },
    qp: () => V3(0, 2.2, 0) });
  const dTD = ders(sTD, { yk: 'UNI2-d1', no: 1, icon: '🥛', name: 'Kırılan bardak neden kendiliğinden birleşmez?', task: 'Termodinamiğin 1. yasası, entropi, 2. yasa, Boltzmann entropisi, Carnot verimi.', steps: [
    { k: { tur: 'merak', b: 'Videoyu geri sararsanız hemen anlarsınız: bardak birleşiyor, süt kahveden ayrılıyor…', m: ['Newton yasaları zamanın iki yönünde de çalışır. Zamanın okunu belirleyen başka bir büyüklük olmalı: entropi.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: '1. yasa: enerjinin korunumu', m: [`${FM('ΔU = Q − W')} · Q: sisteme verilen ısı, W: sistemin yaptığı iş, U: iç enerji`, `İdeal gaz: ${FM('P V = n R T')}`] } },
    { p: { t: 'Gaz kabın sol yarısında. Bölme kaldırılırsa bir süre sonra ne görülür?', o: ['Moleküller solda kalır', 'Moleküller iki yana yaklaşık eşit dağılır ve öyle kalır', 'Hepsi sağa geçer', 'Moleküller durur'], d: 1 } },
    { sub: 'Bölmeyi kaldıralım.', go: '▶︎ Kaldır' },
    { do: S => { S.bolme = 0; }, sub: 'Moleküller yayılıyor…', wait: 6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Düzensizlik kendiliğinden artar', f: ['tdt'], m: ['Hiçbir yasa geri toplanmayı yasaklamaz; ama 40 molekülün hepsinin sola dönme olasılığı (½)<sup>40</sup> ≈ 10<sup>−12</sup>.', 'Gerçek gazda N ≈ 10²³: bu olasılık pratikte sıfır.'] } },
    { k: { tur: 'kavram', b: 'Entropi', m: [`Boltzmann: ${FM('S = k<sub>B</sub> ln W')} · W: aynı makro duruma karşılık gelen mikro durum sayısı`, `Tersinir ısı alışverişinde ${FM(`ΔS = ${F('Q', 'T')}`)} · 2. yasa: yalıtılmış sistemde ${FM('ΔS ≥ 0')}`] } },
    { x: { b: 'Molekül sayısı', m: ['Hepsinin aynı yarıda toplanma olasılığı (½)<sup>N</sup>'],
      kay: [{ ad: 'N', etiket: 'N', min: 2, max: 100, adim: 2, deger: 40, birim: '', set: () => {} }],
      olc: S => `(½)<sup>${S._N}</sup> ≈ <em>${Math.pow(0.5, S._N).toExponential(1).replace('.', ',')}</em>` } },
    { k: { tur: 'ornek', b: 'Isı makineleri: Carnot', m: [`İki sıcaklık arasında çalışan en verimli makine: ${FM(`η = 1 − ${F('T<sub>soğuk</sub>', 'T<sub>sıcak</sub>')}`)} (kelvin!)`, '600 K – 300 K arasında en fazla %50. Bu sınır 2. yasadan gelir.'] } },
    { k: { tur: 'dikkat', b: 'Entropi bir yerde azalabilir', m: ['Buzdolabının içinde entropi azalır; ama arkasından odaya atılan ısı odanın entropisini daha fazla artırır.', '2. yasa <em>toplam</em> (yalıtılmış sistem) entropi için geçerlidir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('ΔU = Q − W')} · ${FM(`ΔS = ${F('Q', 'T')}`)} · ${FM('S = k ln W')} · ${FM(`η<sub>C</sub> = 1 − ${F('T<sub>s</sub>', 'T<sub>h</sub>')}`)}`] } },
  ] });
  const gTD = gorev(sTD, { yk: 'UNI2-g1', no: 1, icon: '♨️', name: 'Isı makinesi', task: '1. yasa, Carnot verimi ve entropi değişimi.', steps: [
    { do: S => { S.bolme = 0; }, sub: 'Gaz kabın içinde.', go: '▶︎ Başlat' },
    { q: { t: 'Bir gaza 500 J ısı veriliyor ve gaz çevresine 200 J iş yapıyor. İç enerjisi kaç J değişir?', o: ['+300 J', '+700 J', '−300 J', '+200 J'],
      s: [`${FM('ΔU = Q − W')} = 500 − 200 = <em>+300 J</em> ✓`], n: ['İşaret kuralı: sisteme verilen ısı +, sistemin yaptığı iş +.'] } },
    { q: { t: '500 K ve 300 K sıcaklıklar arasında çalışan bir ısı makinesinin verimi en fazla yüzde kaç olabilir?', o: ['%40', '%60', '%100', '%166'],
      s: [`η = 1 − ${F('300', '500')} = 1 − 0,6 = <em>%40</em> ✓`], n: ['Sıcaklıklar mutlaka kelvin cinsinden olmalı.'] } },
    { q: { t: '250 K sabit sıcaklıktaki bir sisteme tersinir olarak 1000 J ısı veriliyor. Entropisi kaç J/K artar?', o: ['4 J/K', '0,25 J/K', '250 J/K', '1250 J/K'],
      s: [`${FM(`ΔS = ${F('Q', 'T')}`)} = ${F('1000', '250')} = <em>4 J/K</em> ✓`] , n: ['Aynı ısı düşük sıcaklıkta daha çok entropi değişimi yapar.'] } },
    { q: { t: '1000 J ısı 500 K\'lik cisimden 250 K\'lik cisme akıyor. Toplam entropi değişimi kaç J/K\'dir?', o: ['+2 J/K', '0', '−2 J/K', '+6 J/K'],
      s: ['Sıcak: −1000/500 = −2 J/K · soğuk: +1000/250 = +4 J/K', 'Toplam = <em>+2 J/K</em> ✓ (> 0, 2. yasa)'], n: ['Isı kendiliğinden soğuktan sıcağa akmaz; akarsa toplam entropi azalırdı.'] } },
  ] });
  konuEkle('UNI', 'Termodinamik ve Entropi', { dersler: [dTD], gorevler: [gTD] });

  // =====================================================================
  // MAXWELL VE EM DALGALAR — x yönünde ilerleyen dalga: E (y), B (z), aynı fazda
  // =====================================================================
  const NE = 26;
  const BANT = f => f < 3e9 ? 'radyo' : f < 3e11 ? 'mikrodalga' : f < 4e14 ? 'kızılötesi' : f < 7.9e14 ? 'görünür ışık' : f < 3e16 ? 'morötesi' : f < 3e19 ? 'X ışını' : 'gama';
  const sEM = sahne({ icon: '📡', cam: [[-2, 4.5, 10], [1.2, 1.5, 0]], plate: [13, 6, 0, 0],
    data: [['c', '3 · 10⁸ m/s'], ['μ₀', '4π · 10⁻⁷ T·m/A'], ['ε₀', '8,85 · 10⁻¹² C²/N·m²']],
    S0: () => ({ k: 1.2, kos: 1, lg: 8 }),
    kur(g) {
      const eks = duz(g, 0x334155); FZ.setLine(eks, [V3(-6, 1.5, 0), V3(6.3, 1.5, 0)]);
      const oE = [], oB = []; for (let i = 0; i < NE; i++) { oE.push(ok(0xef4444, 'emE')); oB.push(ok(0x3b82f6, 'emB')); }
      const eE = duz(g, 0xdc2626), eB = duz(g, 0x2563eb);
      etiket('emE', 'E', '#dc2626'); etiket('emB', 'B', '#2563eb'); etiket('emc', 'c', '#16a34a'); kart('emt', '', '#F5C400');
      return { oE, oB, eE, eB, oc: ok(0x22c55e, 'emc') };
    },
    tick(S, dt, o) {
      const w = 2.5, pe = [], pb = [];
      for (let i = 0; i < NE; i++) { const x = -6 + i * 12 / (NE - 1), a = Math.sin(S.k * x - w * S.t);
        if (Math.abs(a) > 0.05) { FZ.setArrow(o.oE[i], V3(x, 1.5, 0), V3(0, Math.sign(a), 0), Math.abs(a) * 1.4); FZ.setArrow(o.oB[i], V3(x, 1.5, 0), V3(0, 0, Math.sign(a)), Math.abs(a) * 1.0); } }
      for (let i = 0; i <= 200; i++) { const x = -6 + i * 12 / 200, a = Math.sin(S.k * x - w * S.t); pe.push(V3(x, 1.5 + a * 1.4, 0)); pb.push(V3(x, 1.5, a * 1.0)); }
      FZ.setLine(o.eE, pe); FZ.setLine(o.eB, pb);
      FZ.setArrow(o.oc, V3(4.2, 3.4, 0), V3(1, 0, 0), 1.8); FZ.show('emc', V3(6.3, 3.4, 0), 1);
      const x0 = -6 + 5 * 12 / (NE - 1); FZ.show('emE', V3(x0, 3.2, 0), 1); FZ.show('emB', V3(x0, 1.5, 1.4), 1);
      const f = Math.pow(10, S.lg) ; const lam = 3e8 / f;
      FZ.setTag('emt', `f = 10<sup>${S.lg}</sup> Hz · λ = ${F('c', 'f')} = ${lam >= 1 ? fs(lam) + ' m' : lam.toExponential(1).replace('.', ',') + ' m'} · ${BANT(f)}`); FZ.show('emt', V3(-0.5, 4.3, 0), 1);
    },
    qp: () => V3(-0.5, 4.9, 0) });
  const dEM = ders(sEM, { yk: 'UNI3-d1', no: 1, icon: '📶', name: 'Wi-Fi, radyo ve ışık aynı şeydir', task: 'Maxwell\'in dört denklemi, elektromanyetik dalganın oluşumu, ışık hızı, E/B = c, spektrum.', steps: [
    { k: { tur: 'merak', b: '1865: Maxwell elektrik ve manyetizmanın denklemlerini birleştirdi', m: ['Denklemlerden bir dalga çıktı; hızını hesapladı: ışık hızı! Işık bir elektromanyetik dalgadır.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Maxwell\'in dört denklemi', m: [`1) Gauss: ${FM(`∮ E · dA = ${F('q', 'ε<sub>0</sub>')}`)} — yükler elektrik alan kaynağıdır.`, `2) ${FM('∮ B · dA = 0')} — manyetik tek kutup yoktur.`, `3) Faraday: ${FM(`∮ E · dl = − ${F('dΦ<sub>B</sub>', 'dt')}`)} · 4) Ampère–Maxwell: ${FM(`∮ B · dl = μ<sub>0</sub> I + μ<sub>0</sub> ε<sub>0</sub> ${F('dΦ<sub>E</sub>', 'dt')}`)}`] } },
    { k: { tur: 'kavram', b: 'Dalga nasıl kendini taşır?', m: ['Değişen B alanı E alanı oluşturur (3), değişen E alanı B alanı oluşturur (4). Birbirini besleyerek boşlukta ilerler.'] } },
    { p: { t: 'Elektromanyetik dalgada E ile B arasındaki açı ve yayılma yönüyle ilişkileri nedir?', o: ['E ve B paralel, yayılmaya dik', 'E ⟂ B ve ikisi de yayılma yönüne dik', 'E yayılma yönünde, B dik', 'Aralarında 45°'], d: 1 } },
    { sub: 'Dalgaya bakalım (görüntü çok yavaşlatıldı).', go: '▶︎ Bak' },
    { k: { tur: 'gozlem', sonuc: true, b: 'Enine dalga', f: ['emE', 'emB', 'emc'], m: ['E (kırmızı) düşey, B (mavi) yatay ve ikisi de yayılma yönüne (yeşil) dik. Yayılma yönü E × B yönüdür.', `E ve B <em>aynı fazdadır</em>: biri en büyükken öbürü de en büyük. ${FM(`${F('E', 'B')} = c`)}`] } },
    { k: { tur: 'kavram', b: 'Işık hızı', m: [`${FM(`c = ${F('1', SQ('μ<sub>0</sub> ε<sub>0</sub>'))}`)} ≈ 3 · 10<sup>8</sup> m/s · ${FM('c = λ f')}`] } },
    { x: { b: 'Frekansı değiştir', m: ['Spektrumda geziniyoruz.'],
      kay: [{ ad: 'lg', etiket: 'log f', min: 6, max: 20, adim: 1, deger: 8, birim: '', set: (S, v) => { S.lg = v; } }],
      olc: S => { const f = Math.pow(10, S._lg), l = 3e8 / f; return `f = 10<sup>${S._lg}</sup> Hz → λ = <em>${l >= 1 ? fs(l) + ' m' : l.toExponential(1).replace('.', ',') + ' m'}</em> · <em>${BANT(f)}</em>`; } } },
    { do: S => { S.lg = 8; S._lg = 8; }, k: { tur: 'dikkat', b: 'E ile B arasında faz farkı yok', m: ['Sık yanlış: "E en büyükken B sıfırdır (LC devresi gibi)." Serbest uzayda ilerleyen dalgada ikisi aynı anda en büyüktür.', 'B çok küçük görünür: E = 300 V/m için B yalnız 10⁻⁶ T.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`Dört Maxwell denklemi · ${FM(`c = ${F('1', SQ('μ<sub>0</sub>ε<sub>0</sub>'))}`)} · ${FM('E = cB')} · E ⟂ B ⟂ yayılma · ${FM('c = λ f')}`] } },
  ] });
  const gEM = gorev(sEM, { yk: 'UNI3-g1', no: 1, icon: '📡', name: 'Anten başında', task: 'Dalga boyu, E–B ilişkisi, yayılma yönü ve Maxwell denklemleri.', data: [['c', '3 · 10⁸ m/s']], steps: [
    { do: S => { S.lg = 8; }, sub: 'Antenden radyo dalgası yayılıyor.', go: '▶︎ Başlat' },
    { q: { t: '100 MHz\'lik FM radyo dalgasının dalga boyu kaç m\'dir?', o: ['3 m', '0,3 m', '30 m', '3 · 10<sup>16</sup> m'], f: ['emt'],
      s: [`λ = ${F('c', 'f')} = ${F('3 · 10<sup>8</sup>', '10<sup>8</sup>')} = <em>3 m</em> ✓`], n: ['Mega = 10⁶ → 100 MHz = 10⁸ Hz.'] } },
    { q: { t: 'Bir noktada elektrik alanın büyüklüğü 300 V/m ise manyetik alan kaç T\'dır?', o: ['10<sup>−6</sup> T', '9 · 10<sup>10</sup> T', '10<sup>6</sup> T', '300 T'], f: ['emE', 'emB'],
      s: [`${FM(`B = ${F('E', 'c')}`)} = ${F('300', '3 · 10<sup>8</sup>')} = <em>10<sup>−6</sup> T</em> ✓`], n: ['Enerji iki alan arasında eşit paylaşılır; B\'nin küçük olması enerjisinin küçük olduğu anlamına gelmez.'] } },
    { q: { t: 'Bir anda E alanı +y, B alanı +z yönündedir. Dalga hangi yönde ilerler?', o: ['+x', '−x', '+y', '−z'], f: ['emc'],
      s: ['Yayılma yönü = E × B yönü', 'ŷ × ẑ = <em>x̂ (+x)</em> ✓'], n: ['Sağ el kuralı: parmaklar E\'den B\'ye kıvrılınca başparmak yayılma yönü.'] } },
    { q: { t: 'Maxwell denklemlerinden hangisi "manyetik tek kutup (monopol) yoktur" anlamına gelir?', o: ['∮ B · dA = 0', '∮ E · dA = q/ε₀', '∮ E · dl = −dΦ<sub>B</sub>/dt', '∮ B · dl = μ₀ I'],
      s: ['Kapalı bir yüzeyden çıkan net manyetik akı her zaman sıfırdır.', 'Yani manyetik alan çizgilerinin başlangıç/bitiş noktası yoktur: <em>∮ B · dA = 0</em> ✓'], n: ['Mıknatısı ne kadar bölerseniz bölün, her parçada yine N ve S kutbu olur.'] } },
  ] });
  konuEkle('UNI', 'Maxwell Denklemleri ve EM Dalgalar', { dersler: [dEM], gorevler: [gEM] });

  // =====================================================================
  // SEÇMELİ · LAZER FİZİĞİ — iki ayna arasında kazanç ortamı, pompalama, uyarılmış salma
  // =====================================================================
  const NA = 36;
  const sLZ = sahne({ icon: '🔴', cam: [[1.4, 4, 9.5], [1.4, 1.4, 0]], plate: [11, 5, 0, 0],
    data: [['He–Ne lazeri', 'λ = 633 nm'], ['hc', '1240 eV·nm']],
    S0: () => ({ pompa: 0, atom: Array.from({ length: NA }, (_, i) => ({ x: -3.2 + (i % 12) * 0.58, z: -0.4 + Math.floor(i / 12) * 0.4, u: 0 })), fo: [], cikan: 0 }),
    kur(g) {
      const tup = FZ.mesh(new THREE.CylinderGeometry(0.75, 0.75, 7.4, 28, 1, true), 0xe0f2fe, { op: 0.25, edge: false, side: THREE.DoubleSide }); tup.rotation.z = Math.PI / 2; tup.position.set(0, 1.2, 0); g.add(tup);
      kutu(g, 0.15, 1.8, 1.8, 0x94a3b8, -3.9, 1.2, 0); kutu(g, 0.15, 1.8, 1.8, 0xcbd5e1, 3.9, 1.2, 0, { op: 0.6 });
      const am = []; for (let i = 0; i < NA; i++) am.push(top(g, 0.1, 0x94a3b8, 0, 1.2, 0, { edge: false }));
      const fm = []; for (let i = 0; i < 80; i++) fm.push(top(g, 0.06, 0xef4444, 0, -5, 0, { edge: false }));
      const huzme = FZ.mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 10), 0xef4444, { edge: false, op: 0.85 }); huzme.rotation.z = Math.PI / 2; huzme.position.set(5.5, 1.2, 0); g.add(huzme);
      kart('lzt', '', '#F5C400'); kart('lzA', 'tam yansıtıcı ayna', '#475569'); kart('lzB', 'yarı geçirgen ayna', '#475569');
      return { am, fm, huzme };
    },
    tick(S, dt, o) {
      S.atom.forEach(a => { if (!a.u && Math.random() < S.pompa * dt * 1.5) a.u = 1; if (a.u && Math.random() < dt * 0.05) { a.u = 0; if (S.fo.length < 80) S.fo.push({ x: a.x, z: a.z, v: Math.random() < 0.5 ? 1 : -1, yan: Math.random() < 0.85 }); } });
      S.fo.forEach(f => { f.x += f.v * dt * 3; if (f.yan) { f.z += f.v * dt * 1.5; } if (f.x < -3.8) { f.x = -3.8; f.v = 1; }
        if (f.x > 3.8) { if (Math.random() < 0.1) { f.out = 1; S.cikan++; } else { f.x = 3.8; f.v = -1; } }
        if (!f.yan) S.atom.forEach(a => { if (a.u && Math.abs(a.x - f.x) < 0.08 && S.fo.length < 80) { a.u = 0; S.fo.push({ x: f.x + 0.01 * f.v, z: f.z, v: f.v, yan: false }); } }); });
      S.fo = S.fo.filter(f => !f.out && Math.abs(f.z) < 0.7);
      o.am.forEach((m, i) => { const a = S.atom[i]; m.position.set(a.x, 1.2 + (a.u ? 0.15 : -0.15), a.z); m.material.color.setHex(a.u ? 0xf97316 : 0x94a3b8); });
      o.fm.forEach((m, i) => { const f = S.fo[i]; if (!f) { m.visible = false; return; } m.visible = true; m.position.set(f.x, 1.2, f.z); });
      const ust = S.atom.filter(a => a.u).length, eks = S.fo.filter(f => !f.yan).length; o.huzme.visible = eks > 6;
      FZ.show('lzA', V3(-3.9, 2.5, 0), 1); FZ.show('lzB', V3(3.9, 2.5, 0), 1);
      FZ.setTag('lzt', `Uyarılmış atom: ${ust} / ${NA} ${ust > NA / 2 ? '(nüfus terslenmesi ✓)' : ''}<br>eksen boyunca foton: ${eks}`); FZ.show('lzt', V3(0, 3.3, 0), 1);
    },
    qp: () => V3(0, 3.9, 0) });
  const dLZ = ders(sLZ, { yk: 'SEC3-d1', no: 1, icon: '🔴', name: 'Işığı kopyalayan makine', task: 'Soğurma, kendiliğinden ve uyarılmış salma, nüfus terslenmesi, optik kovuk, lazer ışığının özellikleri.', steps: [
    { k: { tur: 'merak', b: 'Lazer: Light Amplification by Stimulated Emission of Radiation', m: ['Yani "uyarılmış salma ile ışığın güçlendirilmesi". Einstein bu süreci 1917\'de öngördü; ilk lazer 1960\'ta yapıldı.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Atom ile foton: üç süreç', m: ['Soğurma: foton atomu üst seviyeye çıkarır.', 'Kendiliğinden salma: atom rastgele bir anda, rastgele yönde foton yayar.', '<em>Uyarılmış salma</em>: uyarılmış atoma uygun foton gelirse, atom <em>aynı enerji, faz ve yönde</em> ikinci bir foton yayar.'] } },
    { p: { t: 'Pompalama yokken (atomlar çoğunlukla alt seviyedeyken) ortama giren foton büyük olasılıkla ne yapar?', o: ['Kopyalanır', 'Soğurulur', 'Hızlanır', 'İkiye bölünür'], d: 1 } },
    { k: { tur: 'kavram', sonuc: true, b: 'Nüfus terslenmesi gerekir', m: ['Alt seviyede çok atom varsa soğurma baskındır. Güçlendirme için üst seviyede <em>daha çok</em> atom olmalı: nüfus terslenmesi.', 'Bunu elektrik boşalması ya da flaş lambasıyla "pompalayarak" sağlarız.'] } },
    { sub: 'Pompalamayı açalım.', go: '▶︎ Pompala' },
    { do: S => { S.pompa = 1; }, sub: 'Turuncu: uyarılmış atomlar. Eksen boyunca giden fotonlar çoğalıyor…', wait: 9 },
    { k: { tur: 'gozlem', b: 'Optik kovuk', f: ['lzt', 'lzA', 'lzB'], m: ['Aynalar arasında gidip gelen fotonlar her geçişte yeni kopyalar üretir; yan yöndekiler kaçar.', 'Yarı geçirgen aynadan küçük bir kısım dışarı çıkar: lazer hüzmesi.'] } },
    { x: { b: 'Pompalama gücü', m: ['Eşik değerin altında lazer çalışmaz.'],
      kay: [{ ad: 'pompa', etiket: 'Pompa', min: 0, max: 1, adim: 0.25, deger: 1, birim: '', set: (S, v) => { S.pompa = v; } }],
      olc: S => S._pompa >= 0.5 ? '<em>Lazer çalışıyor</em>: üst seviye nüfusu baskın.' : '<em>Eşik altı</em>: soğurma ve kaçışlar kazancı yeniyor.' } },
    { do: S => { S.pompa = 1; }, k: { tur: 'dikkat', b: 'Enerji yoktan var olmuyor', m: ['Kopyalanan fotonların enerjisi pompadan gelir; lazerlerin verimi genelde %1–30\'dur.', `Foton enerjisi seviye farkına eşittir: ${FM(`E = ${F('hc', 'λ')}`)} · He–Ne: 633 nm → 1,96 eV`] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Uyarılmış salma · nüfus terslenmesi · optik kovuk → tek renkli, eş fazlı, paralel, yoğun ışık.'] } },
  ] });
  const gLZ = gorev(sLZ, { yk: 'SEC3-g1', no: 1, icon: '🔦', name: 'He–Ne lazeri', task: 'Uyarılmış salma, nüfus terslenmesi, foton enerjisi ve foton akısı.', data: [['λ', '633 nm'], ['hc', '1240 eV·nm'], ['1 eV', '1,6 · 10⁻¹⁹ J']], steps: [
    { do: S => { S.pompa = 1; }, sub: 'Lazer pompalanıyor.', go: '▶︎ Başlat' },
    { q: { t: 'Uyarılmış salmada çıkan ikinci foton gelen fotona göre nasıldır?', o: ['Aynı enerji, faz ve yönde', 'Daha yüksek enerjili', 'Rastgele yönde', 'Zıt fazda'],
      s: ['Uyarılmış salma gelen fotonun "kopyasını" üretir.', '<em>Aynı enerji, faz, yön ve kutuplanma</em> ✓'], n: ['Lazer ışığının eş fazlı (koherent) olması bu yüzdendir.'] } },
    { q: { t: 'Nüfus terslenmesi ne demektir?', o: ['Üst enerji seviyesinde alttakinden daha çok atom bulunması', 'Atomların iyonlaşması', 'Bütün atomların taban durumda olması', 'Aynaların yer değiştirmesi'], f: ['lzt'],
      s: ['Isıl dengede üst seviye her zaman daha az doludur.', 'Lazer için tersi gerekir: <em>üst seviyede daha çok atom</em> ✓'], n: ['Bu yüzden lazer ortamı sürekli dışarıdan enerjiyle pompalanır.'] } },
    { q: { t: '633 nm\'lik He–Ne lazerinin bir fotonunun enerjisi yaklaşık kaç eV\'tur?', o: ['1,96 eV', '0,51 eV', '6,33 eV', '3,92 eV'],
      s: [`E = ${F('1240', '633')} ≈ <em>1,96 eV</em> ✓`], n: ['Kırmızı ışık fotonları 2 eV civarındadır.'] } },
    { q: { t: '1 mW gücündeki bu lazer saniyede yaklaşık kaç foton yayar?', o: ['3,2 · 10<sup>15</sup>', '3,2 · 10<sup>18</sup>', '5,1 · 10<sup>−4</sup>', '1,96 · 10<sup>3</sup>'],
      s: ['Bir foton: 1,96 · 1,6 · 10<sup>−19</sup> ≈ 3,1 · 10<sup>−19</sup> J', `N = ${F('10<sup>−3</sup>', '3,1 · 10<sup>−19</sup>')} ≈ <em>3,2 · 10<sup>15</sup> foton/s</em> ✓`], n: ['Küçük bir lazer bile saniyede katrilyonlarca foton yayar.'] } },
  ] });
  konuEkle('SEC', 'Lazer Fiziği', { dersler: [dLZ], gorevler: [gLZ] });

  // =====================================================================
  // SEÇMELİ · NÜKLEER FİZİK — bağlanma enerjisi eğrisi, fisyon ve füzyon
  // =====================================================================
  // nükleon başına bağlanma enerjisi (MeV), gerçek eğriye yakın basit model: Fe-56 civarında tepe ≈ 8,8 MeV
  const BE = A => A < 2 ? 0 : A <= 4 ? [0, 0, 1.1, 2.8, 7.07][A] : A < 56 ? 7.07 + (8.79 - 7.07) * (1 - Math.exp(-(A - 4) / 12)) : 8.79 - (A - 56) * 0.0058;
  const sNK = sahne({ icon: '☢️', cam: [[1.8, 4, 11], [1.8, 2.2, 0]], plate: [12, 5, 0, 0],
    data: [['1 u', '931,5 MeV/c²'], ['R₀', '1,2 fm']],
    S0: () => ({ mod: 'fisyon', faz: 0, kos: 0, A: 56 }),
    kur(g) {
      const egri = duz(g, 0x111827), eks = duz(g, 0x94a3b8), nok = top(g, 0.12, 0xdc2626, 0, 0, 0);
      const cek = new THREE.Group(); cek.position.set(-3.5, 2.2, 0); g.add(cek); const nuk = [];
      for (let i = 0; i < 40; i++) { const u = Math.random() * 2 - 1, f = Math.random() * Math.PI * 2, r = 0.75 * Math.cbrt(Math.random()); nuk.push(top(cek, 0.17, i % 2 ? 0xef4444 : 0x94a3b8, r * Math.sqrt(1 - u * u) * Math.cos(f), r * u, r * Math.sqrt(1 - u * u) * Math.sin(f), { edge: false })); }
      const n0 = top(g, 0.12, 0x94a3b8, 0, 0, 0, { edge: false }), nn = [0, 1, 2].map(() => top(g, 0.12, 0x94a3b8, 0, 0, 0, { edge: false }));
      kart('nkt', '', '#F5C400'); kart('nkg', 'Nükleon başına bağlanma enerjisi', '#475569'); kart('nkf', 'Fe-56', '#dc2626');
      return { egri, eks, nok, cek, nuk, n0, nn };
    },
    tick(S, dt, o) {
      const gx = A => 0.8 + A / 240 * 5, gy = b => 0.6 + b / 9 * 3, pts = [];
      for (let A = 2; A <= 240; A += 2) pts.push(V3(gx(A), gy(BE(A)), 0)); FZ.setLine(o.egri, pts);
      FZ.setLine(o.eks, [V3(gx(0), gy(9.2), 0), V3(gx(0), gy(0), 0), V3(gx(240), gy(0), 0)]); o.nok.position.set(gx(S.A), gy(BE(S.A)), 0.05);
      FZ.show('nkg', V3(3.3, 4.4, 0), 1); FZ.show('nkf', V3(gx(56), gy(8.79) + 0.45, 0), 1);
      if (S.kos) S.faz = Math.min(3, S.faz + dt);
      const fis = S.mod === 'fisyon', f = S.faz;
      o.n0.visible = fis && f < 1; o.n0.position.set(-6 + 2.5 * Math.min(1, f) - 0.0, 2.2, 0);
      const ay = Math.max(0, f - 1) * 0.9;
      o.nuk.forEach((m, i) => { const yan = fis ? (i < 20 ? -1 : 1) : 1; m.userData.p0 = m.userData.p0 || m.position.clone();
        const p = m.userData.p0; m.position.set(p.x * (fis ? 0.8 : 1) + yan * ay * (fis ? 1 : 0), p.y, p.z); });
      o.nn.forEach((m, i) => { m.visible = fis && f > 1; const a = i * 2.1 + 0.4; m.position.set(-3.5 + Math.cos(a) * ay * 2.2, 2.2 + Math.sin(a) * ay * 2.2, 0.4); });
      FZ.setTag('nkt', fis ? 'Fisyon: ²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n + ≈ 200 MeV' : 'Füzyon: ²H + ³H → ⁴He + n + 17,6 MeV'); FZ.show('nkt', V3(-3.5, 4.2, 0), 1);
    },
    qp: () => V3(-3.5, 4.8, 0) });
  const dNK = ders(sNK, { yk: 'SEC4-d1', no: 1, icon: '⚛️', name: 'Güneş ve nükleer santral aynı yasayı kullanır', task: 'Çekirdek yapısı, kütle eksikliği, bağlanma enerjisi, fisyon, füzyon, bozunma yasası.', steps: [
    { k: { tur: 'merak', b: 'Güneş hafif çekirdekleri birleştirerek, santraller ağır çekirdeği bölerek enerji üretir', m: ['İki zıt işlem nasıl ikisi de enerji verebilir? Cevap bağlanma enerjisi eğrisinde.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Kütle eksikliği', m: ['Çekirdeğin kütlesi, proton ve nötronlarının ayrı ayrı kütleleri toplamından <em>küçüktür</em>.', `Fark (Δm) bağlanma enerjisine dönüşmüştür: ${FM('E<sub>b</sub> = Δm c<sup>2</sup>')} · 1 u = 931,5 MeV/c²`, `Çekirdek yarıçapı: ${FM('R = R<sub>0</sub> A<sup>1/3</sup>')}`] } },
    { k: { tur: 'kavram', b: 'Bağlanma enerjisi eğrisi', f: ['nkg', 'nkf'], m: ['Nükleon başına bağlanma enerjisi Fe-56 civarında en büyüktür (~8,8 MeV): en kararlı çekirdekler.', 'Eğride tepeye doğru giden her işlem enerji açığa çıkarır.'] } },
    { p: { t: 'Uranyum-235 (A = 235) iki orta büyüklükte çekirdeğe bölünürse ne olur?', o: ['Enerji soğurur', 'Enerji açığa çıkar', 'Enerji değişmez', 'Kütle artar'], d: 1 } },
    { sub: 'Uranyuma yavaş bir nötron gönderelim.', go: '▶︎ Gönder' },
    { do: S => { S.A = 235; S.kos = 1; S.faz = 0; }, sub: 'Fisyon…', until: S => S.faz >= 3 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Fisyon', f: ['nkt'], m: ['Parçalar eğride daha yüksekte (~8,5 MeV/nükleon) → her nükleon ~0,9 MeV kazandırır → ~200 MeV.', 'Çıkan 2–3 nötron yeni bölünmeler başlatabilir: zincirleme tepkime (santralde kontrol çubuklarıyla denetlenir).'] } },
    { do: S => { S.mod = 'fuzyon'; S.A = 4; S.faz = 0; }, k: { tur: 'kavram', b: 'Füzyon', f: ['nkt'], m: ['Hafif çekirdekler birleşince eğrinin sol dik kısmında yukarı çıkılır: nükleon başına kazanç fisyondan da büyüktür.', 'Çekirdekleri birleştirmek için itmeyi yenmek gerekir: milyonlarca derece sıcaklık (ve tünelleme).'] } },
    { x: { b: 'Kütle numarasını değiştir', m: ['Kırmızı nokta eğri üzerinde.'],
      kay: [{ ad: 'A', etiket: 'A', min: 4, max: 236, adim: 8, deger: 60, birim: '', set: (S, v) => { S.A = v; } }],
      olc: S => `A = ${S._A} → ≈ <em>${fs(BE(S._A))} MeV/nükleon</em> · R ≈ 1,2 · ${S._A}<sup>1/3</sup> = <em>${fs(1.2 * Math.cbrt(S._A))} fm</em>` } },
    { k: { tur: 'dikkat', b: 'Bozunma yasası', m: [`${FM('N = N<sub>0</sub> e<sup>−λt</sup>')} · ${FM(`T<sub>1/2</sub> = ${F('ln 2', 'λ')}`)} · etkinlik ${FM('A = λ N')} (Bq)`, 'Bozunma sabiti λ, tek bir çekirdeğin birim zamanda bozunma olasılığıdır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('E<sub>b</sub> = Δm c<sup>2</sup>')} · Fe-56 tepe · ağır → fisyon, hafif → füzyon · ${FM(`T<sub>1/2</sub> = ${F('ln 2', 'λ')}`)}`] } },
  ] });
  const gNK = gorev(sNK, { yk: 'SEC4-g1', no: 1, icon: '☢️', name: 'Çekirdek laboratuvarı', task: 'Bağlanma enerjisi, çekirdek yarıçapı ve bozunma sabiti.', data: [['1 u', '931,5 MeV/c²'], ['R₀', '1,2 fm'], ['ln 2', '0,693']], steps: [
    { do: S => { S.mod = 'fuzyon'; S.A = 4; }, sub: 'Helyum-4 çekirdeği inceleniyor.', go: '▶︎ Başlat' },
    { q: { t: 'He-4 çekirdeğinin kütle eksikliği 0,0304 u\'dur. Bağlanma enerjisi yaklaşık kaç MeV\'tur?', o: ['28,3 MeV', '0,03 MeV', '7,1 MeV', '931,5 MeV'],
      s: [`E<sub>b</sub> = 0,0304 · 931,5 ≈ <em>28,3 MeV</em> ✓`], n: ['Bu enerji, çekirdeği proton ve nötronlarına ayırmak için gereken enerjidir.'] } },
    { q: { t: 'He-4 için nükleon başına bağlanma enerjisi yaklaşık kaç MeV\'tur?', o: ['7,1 MeV', '28,3 MeV', '14,2 MeV', '3,5 MeV'], f: ['nkg'],
      s: [`${F('28,3', '4')} ≈ <em>7,1 MeV</em> ✓`], n: ['He-4 eğride komşularından belirgin yüksektir: çok kararlıdır (alfa parçacığı).'] } },
    { do: S => { S.A = 216; }, q: { t: 'Kütle numarası 216 olan çekirdeğin yarıçapı yaklaşık kaç fm\'dir? (R₀ = 1,2 fm)', o: ['7,2 fm', '259 fm', '1,2 fm', '18 fm'],
      s: [`${FM('R = R<sub>0</sub> A<sup>1/3</sup>')} = 1,2 · ${'216'}<sup>1/3</sup> = 1,2 · 6 = <em>7,2 fm</em> ✓`], n: ['Hacim A ile orantılı: çekirdek yoğunluğu bütün çekirdeklerde yaklaşık aynıdır.'] } },
    { q: { t: 'Yarı ömrü 10 s olan bir izotopun bozunma sabiti kaç s⁻¹\'dir?', o: ['0,0693', '6,93', '14,4', '0,1'],
      s: [`${FM(`λ = ${F('ln 2', 'T<sub>1/2</sub>')}`)} = ${F('0,693', '10')} = <em>0,0693 s<sup>−1</sup></em> ✓`], n: ['λ büyükse çekirdek hızlı bozunur.'] } },
  ] });
  konuEkle('SEC', 'Nükleer Fizik', { dersler: [dNK], gorevler: [gNK] });
})();
