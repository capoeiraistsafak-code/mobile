// ÜNİVERSİTE · Young Çift Yarık Deneyi — Schrödinger Denklemi ve Kutudaki Parçacık — Kuantum Tünelleme
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };
  const noktalar = (g, renk, n, boy) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); geo.setDrawRange(0, 0);
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: renk, size: boy, sizeAttenuation: true })); p.frustumCulled = false; g.add(p); return p; };
  const renkNm = l => (FZ.renkNm ? FZ.renkNm(l) : new THREE.Color(0xef4444));

  // =====================================================================
  // YOUNG ÇİFT YARIK — kaynak · iki yarık · perde (perdede 1 mm = 0,25 birim)
  // =====================================================================
  const YS = 0.25, a_mm = 0.05;
  const siddet = (y, S) => { const L = S.L * 1000, lam = S.lam * 1e-6, b = Math.PI * a_mm * y / (lam * L), zarf = b === 0 ? 1 : (Math.sin(b) / b) ** 2;
    return S.olc ? zarf : zarf * Math.cos(Math.PI * S.d * y / (lam * L)) ** 2; };
  const W = (x, y, z) => V3(z, y, -x); // yerel (yatay) → dünya
  const sY = sahne({ icon: '🌈', cam: [[5, 10.5, 15.5], [1.2, 0.8, 0.8]], plate: [11, 13, 0, -0.5],
    data: [['Yarık genişliği', 'a = 0,05 mm'], ['Perde uzaklığı', 'L = 1,5 m']],
    S0: () => ({ lam: 600, d: 0.25, L: 1.5, mod: 'isik', olc: 0, say: 0, zam: 0 }),
    kur(g0) {
      const g = new THREE.Group(); g.rotation.y = Math.PI / 2; g0.add(g); // perde arkada, karşıdan görünsün
      const kay = new THREE.Group(); kay.position.set(-5.75, 1, 0); g.add(kay); const lazer = FZ.lazerCihazi(kay), tabanca = FZ.elektronTabancasi(kay); tabanca.visible = false;
      kutu(g, 0.15, 2, 2.6, 0x475569, 0, 1, -1.5); kutu(g, 0.15, 2, 2.6, 0x475569, 0, 1, 1.5); kutu(g, 0.15, 2, 0.3, 0x475569, 0, 1, 0);
      const perde = kutu(g, 0.12, 2.4, 9.5, 0xf8fafc, 6, 1.2, 0);
      const isin = FZ.mesh(new THREE.BoxGeometry(5, 0.05, 0.5), 0xef4444, { edge: false, op: 0.35 }); isin.position.set(-2.6, 1, 0); g.add(isin);
      const egri = duz(g, 0x111827), nk = noktalar(g, 0xdc2626, 3000, 0.08), dedektor = FZ.dedektor(g, 0.6); dedektor.position.set(0.6, 2.55, 0.55); dedektor.rotation.set(0, -0.7, -0.5);
      const bantlar = []; for (let i = 0; i < 160; i++) { const m = FZ.mesh(new THREE.BoxGeometry(0.04, 2.2, 9.5 / 160), 0xffffff, { edge: false, cast: false }); m.position.set(5.92, 1.2, -4.75 + (i + 0.5) * 9.5 / 160); g.add(m); bantlar.push(m); }
      kart('y1t', '', '#F5C400'); etiket('y1d', 'd', '#334155'); kart('y1k', 'Kaynak', '#1f2937'); kart('y1o', 'Dedektör: hangi yarık?', '#d97706');
      return { kay, lazer, tabanca, perde, isin, egri, nk, dedektor, bantlar };
    },
    tick(S, dt, o) {
      const isik = S.mod === 'isik', c = isik ? renkNm(S.lam) : new THREE.Color(0xef4444); o.lazer.visible = isik; o.tabanca.visible = !isik;
      o.isin.material.color.copy(c); o.dedektor.visible = !!S.olc;
      let maxI = 0; const ys = []; for (let i = 0; i < 160; i++) { const zz = -4.75 + (i + 0.5) * 9.5 / 160, I = siddet(zz / YS, S); ys.push(I); }
      o.bantlar.forEach((m, i) => { m.visible = isik; m.material.color.copy(c).multiplyScalar(0.08 + 0.92 * ys[i]); });
      const pts = []; for (let i = 0; i <= 240; i++) { const zz = -4.75 + i / 240 * 9.5; pts.push(V3(6.3, 0.05 + 1.6 * siddet(zz / YS, S), zz)); } FZ.setLine(o.egri, pts); o.egri.visible = isik || S.say > 400;
      if (!isik && S.kos) { S.zam += dt * 60; const pos = o.nk.geometry.attributes.position;
        while (S.zam > 1 && S.say < 3000) { S.zam -= 1; let zz, I; do { zz = (Math.random() - 0.5) * 9.4; I = siddet(zz / YS, S); } while (Math.random() > I);
          pos.setXYZ(S.say, 5.9, 0.1 + Math.random() * 2.2, zz); S.say++; }
        pos.needsUpdate = true; o.nk.geometry.setDrawRange(0, S.say); }
      o.nk.visible = !isik;
      FZ.show('y1k', W(-5.5, 1.9, 0), 1); FZ.show('y1d', W(-0.4, 2.3, 0), 1); FZ.show('y1o', W(0.6, 3.4, 0.55), S.olc ? 1 : 0);
      const dy = S.lam * 1e-6 * S.L * 1000 / S.d;
      FZ.setTag('y1t', isik ? `λ = ${S.lam} nm · d = ${fs(S.d)} mm · L = ${fs(S.L)} m<br>Δy = ${F('λ L', 'd')} = ${fs(dy)} mm` : `Gönderilen elektron: ${S.say}${S.olc ? ' · yarık ölçülüyor' : ''}`);
      FZ.show('y1t', W(2.6, 3.4, 3.2), 1);
    },
    qp: () => W(4, 3.6, 0) });
  const dY = ders(sY, { yk: 'UNI4-d1', no: 1, icon: '🌈', name: 'Işık mı dalga, elektron mu parçacık?', task: 'Young deneyi, saçak aralığı, şiddet dağılımı, elektronlarla çift yarık ve ölçümün etkisi.', steps: [
    { k: { tur: 'merak', b: '1801: Thomas Young ışığı iki ince yarıktan geçirdi', m: ['Perdede iki parlak çizgi değil, art arda dizilen aydınlık-karanlık saçaklar gördü.', 'Bu, ışığın dalga olduğunun kanıtıydı. 20. yüzyılda aynı deney elektronlarla yapılınca fizik sarsıldı.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Yol farkı ve saçaklar', f: ['y1t'], m: [`Aydınlık: ${FM('d sin θ = m λ')} · karanlık: ${FM(`d sin θ = (m + ${F('1', '2')}) λ`)}`, `Küçük açılarda sin θ ≈ y/L → ${FM(`Δy = ${F('λ L', 'd')}`)}`] } },
    { p: { t: 'Yarıklar arası uzaklık d küçültülürse saçaklar ne olur?', o: ['Sıklaşır', 'Genişler (aralık büyür)', 'Değişmez', 'Kaybolur'], d: 1 } },
    { sub: 'd\'yi 0,25 mm\'den 0,125 mm\'ye indirelim.', go: '▶︎ Küçült' },
    { do: S => { S.d = 0.125; }, sub: 'Perdeye bakın.', wait: 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Δy, d ile ters orantılı', f: ['y1t'], m: [`Δy = ${F('600 · 10<sup>−9</sup> · 1,5', '1,25 · 10<sup>−4</sup>')} = 7,2 mm (önce 3,6 mm).`, 'Siyah eğri şiddet: tek yarığın kırınım zarfı içinde cos² saçakları.'] } },
    { x: { b: 'Dalga boyu ve yarık aralığı', m: ['Rengi ve d\'yi değiştirip perdeyi izleyin.'],
      kay: [{ ad: 'lam', etiket: 'λ', min: 400, max: 700, adim: 50, deger: 600, birim: 'nm', set: (S, v) => { S.lam = v; } },
            { ad: 'd', etiket: 'd', min: 0.1, max: 0.5, adim: 0.05, deger: 0.25, birim: 'mm', set: (S, v) => { S.d = v; } }],
      olc: S => `Δy = ${F(`${S._lam} · 10<sup>−9</sup> · 1,5`, `${fs(S._d)} · 10<sup>−3</sup>`)} = <em>${fs(S._lam * 1.5e-3 / S._d)} mm</em>` } },
    { do: S => { S.lam = 600; S.d = 0.25; S._lam = 600; S._d = 0.25; }, k: { tur: 'kavram', b: 'Şiddet dağılımı', m: [`${FM(`I = I<sub>0</sub> cos<sup>2</sup>(${F('π d y', 'λ L')})`)} × tek yarık zarfı`, `Elektronun da dalga boyu vardır: ${FM(`λ = ${F('h', 'p')}`)}`] } },
    { p: { t: 'Elektronları birer birer gönderirsek (aynı anda yalnız bir elektron) perdede ne birikir?', o: ['Yarıkların hizasında iki şerit', 'Yine girişim saçakları', 'Düzgün dağılmış noktalar', 'Hiçbir şey'], d: 1 } },
    { do: S => { S.mod = 'elektron'; S.say = 0; }, sub: 'Elektron tabancası açılıyor.', go: '▶︎ Gönder' },
    { do: S => { S.kos = 1; }, sub: 'Her elektron tek bir nokta bırakır…', until: S => S.say >= 1800 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Her elektron kendisiyle girişim yapar', m: ['Tek bir elektronun nereye düşeceği bilinemez; yalnız olasılığı (|ψ|²) bilinir.', 'Noktalar biriktikçe ışıktaki desenin aynısı ortaya çıktı: elektron iki yarıktan birden "dalga" olarak geçer.'] } },
    { do: S => { S.olc = 1; S.say = 0; }, sub: 'Şimdi bir dedektörle elektronun hangi yarıktan geçtiğini ölçelim.', go: '▶︎ Ölç ve gönder' },
    { sub: 'Hangi yarık bilgisi alınıyor…', until: S => S.say >= 1800 },
    { k: { tur: 'dikkat', b: 'Ölçüm deseni yok eder', m: ['"Hangi yarık?" bilgisi alınınca saçaklar kaybolur; yalnız iki yarığın kırınım zarfları kalır.', 'Kuantum mekaniğinde ölçüm sistemi etkiler: dalga-parçacık ikiliği ve tamamlayıcılık ilkesi.'] } },
    { do: S => { S.olc = 0; }, k: { tur: 'ozet', b: 'Özet', m: [`${FM('d sin θ = m λ')} · ${FM(`Δy = ${F('λ L', 'd')}`)} · ${FM(`λ = ${F('h', 'p')}`)}`, 'Tek tek parçacıklar da girişim deseni oluşturur; yol bilgisi alınınca desen kaybolur.'] } },
  ] });
  const gY = gorev(sY, { yk: 'UNI4-g1', no: 1, icon: '🔦', name: 'Saçakları ölç', task: 'Saçak aralığı, saçak konumu, yol farkı ve madde dalgası soruları.', data: [['λ', '500 nm'], ['d', '0,2 mm'], ['L', '2 m']], steps: [
    { do: S => { S.lam = 500; S.d = 0.2; S.L = 2; S.mod = 'isik'; }, sub: '500 nm\'lik ışık çift yarığa gönderiliyor.', go: '▶︎ Başlat' },
    { q: { t: 'λ = 500 nm, d = 0,2 mm, L = 2 m. Ardışık iki aydınlık saçak arası kaç mm\'dir?', o: ['5 mm', '0,5 mm', '2,5 mm', '50 mm'], f: ['y1t'],
      s: [`${FM(`Δy = ${F('λ L', 'd')}`)} = ${F('5 · 10<sup>−7</sup> · 2', '2 · 10<sup>−4</sup>')} = 5 · 10<sup>−3</sup> m = <em>5 mm</em> ✓`], n: ['Bütün uzunlukları metreye çevirin.'] } },
    { q: { t: '3. aydınlık saçak merkezi aydınlık saçaktan kaç mm uzaktadır?', o: ['15 mm', '12,5 mm', '5 mm', '17,5 mm'],
      s: [`y<sub>m</sub> = m · Δy = 3 · 5 = <em>15 mm</em> ✓`], n: ['Merkez saçak m = 0\'dır.', 'Karanlık saçaklar aydınlıkların tam arasındadır: 3. karanlık 12,5 mm\'de.'] } },
    { q: { t: 'Perdedeki bir noktada yarıklardan gelen ışınların yol farkı 1250 nm (λ = 500 nm). Bu nokta nedir?', o: ['3. karanlık saçak', '2. aydınlık saçak', '3. aydınlık saçak', '2. karanlık saçak'],
      s: [`${F('1250', '500')} = 2,5 λ = (2 + ${F('1', '2')}) λ`, '1. karanlık 0,5λ, 2. karanlık 1,5λ, <em>3. karanlık 2,5λ</em> ✓'], n: ['Buçuklu yol farkı → karanlık (yok edici girişim).'] } },
    { do: S => { S.mod = 'elektron'; S.say = 0; S.kos = 1; S.lam = 600; S.d = 0.25; S.L = 1.5; }, q: { t: 'Elektronların momentumu iki katına çıkarılırsa saçak aralığı nasıl değişir?', o: ['Yarıya iner', 'İki katına çıkar', 'Değişmez', 'Dört katına çıkar'],
      s: [`${FM(`λ = ${F('h', 'p')}`)} → p 2 katı → λ yarıya iner`, `Δy = ${F('λ L', 'd')} → <em>yarıya iner</em> ✓`], n: ['Hızlı elektronların dalga boyu kısadır; elektron mikroskobunun ayırma gücü bu yüzden yüksektir.'] } },
  ] });
  konuEkle('UNI', 'Young Çift Yarık Deneyi', { dersler: [dY], gorevler: [gY] });

  // =====================================================================
  // SCHRÖDİNGER — sonsuz kuyu (kutu) içinde parçacık, L = 1 nm, E₁ = 0,38 eV (elektron)
  // =====================================================================
  const sK = sahne({ icon: '📦', cam: [[1.2, 3.2, 10], [1.2, 2, 0]], plate: [11, 4, 0, 0],
    data: [['Kutu', 'L = 1 nm (sonsuz kuyu)'], ['Parçacık', 'elektron'], ['E₁', '≈ 0,38 eV']],
    S0: () => ({ n: 1, ph: 0, olas: 0, say: 0, zam: 0, kos: 0 }),
    kur(g) {
      kutu(g, 0.15, 4, 0.8, 0x475569, -3, 2, 0); kutu(g, 0.15, 4, 0.8, 0x475569, 3, 2, 0); kutu(g, 6, 0.08, 0.8, 0x94a3b8, 0, 0.04, 0);
      const psi = duz(g, 0x2563eb), p2 = duz(g, 0xdc2626), eks = duz(g, 0x64748b);
      const sv = []; for (let n = 1; n <= 4; n++) sv.push(duz(g, 0x16a34a));
      const nk = noktalar(g, 0xdc2626, 600, 0.09);
      etiket('k2psi', 'Re ψ', '#2563eb'); etiket('k2p2', '|ψ|²', '#dc2626'); kart('k2t', '', '#F5C400'); [1, 2, 3, 4].forEach(n => kart('k2e' + n, '', '#16a34a'));
      return { psi, p2, eks, sv, nk };
    },
    tick(S, dt, o) {
      S.ph += dt * 1.2 * S.n * S.n; // E ∝ n² → faz hızı
      const y0 = 2, A = 1.2, pp = [], p2 = [];
      for (let i = 0; i <= 120; i++) { const x = i / 120, s = Math.sin(S.n * Math.PI * x); pp.push(V3(-3 + 6 * x, y0 + A * s * Math.cos(S.ph), 0.2)); p2.push(V3(-3 + 6 * x, 0.15 + 1.2 * s * s, 0.25)); }
      FZ.setLine(o.psi, pp); FZ.setLine(o.p2, p2); FZ.setLine(o.eks, [V3(-3, y0, 0.2), V3(3, y0, 0.2)]); o.p2.visible = !!S.olas;
      o.sv.forEach((l, i) => { const n = i + 1, y = 0.2 + 0.24 * n * n; FZ.setLine(l, [V3(3.6, y, 0), V3(4.6, y, 0)]); FZ.setTag('k2e' + n, `n = ${n} · ${fs(0.376 * n * n)} eV`); FZ.show('k2e' + n, V3(5.5, y, 0), n === S.n ? 1 : 0.55); });
      if (S.kos) { S.zam += dt * 40; const pos = o.nk.geometry.attributes.position; while (S.zam > 1 && S.say < 600) { S.zam -= 1; let x; do { x = Math.random(); } while (Math.random() > Math.sin(S.n * Math.PI * x) ** 2); pos.setXYZ(S.say, -3 + 6 * x, 0.12 + Math.random() * 0.1, (Math.random() - 0.5) * 0.6); S.say++; } pos.needsUpdate = true; o.nk.geometry.setDrawRange(0, S.say); }
      FZ.show('k2psi', V3(-3.6, y0 + 0.6, 0.2), 1); FZ.show('k2p2', V3(-3.6, 0.7, 0.25), S.olas ? 1 : 0);
      FZ.setTag('k2t', `n = ${S.n} · E<sub>n</sub> = n² E<sub>1</sub> = ${fs(0.376 * S.n * S.n)} eV · iç düğüm: ${S.n - 1}`); FZ.show('k2t', V3(0, 3.95, 0), 1);
    },
    qp: () => V3(0, 4.5, 0) });
  const dK = ders(sK, { yk: 'UNI7-d1', no: 1, icon: '📺', name: 'QLED ekranın renkleri boyuttan gelir', task: 'Schrödinger denklemi, dalga fonksiyonu, olasılık yoğunluğu, kutudaki parçacığın enerji seviyeleri.', steps: [
    { k: { tur: 'merak', b: 'Aynı maddeden yapılan kuantum noktalar neden farklı renkte ışır?', m: ['Küçük nokta mavi, büyük nokta kırmızı ışık verir. Elektronu küçük bir "kutuya" hapsetmek enerjisini değiştirir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Schrödinger denklemi', m: [`${FM(`− ${F('ħ<sup>2</sup>', '2m')} ${F('d<sup>2</sup>ψ', 'dx<sup>2</sup>')} + V ψ = E ψ`)}`, 'ψ: dalga fonksiyonu. Kendisi ölçülemez; |ψ|² parçacığı o noktada bulma olasılık yoğunluğudur.'] } },
    { k: { tur: 'kavram', b: 'Kutudaki parçacık', f: ['k2t'], m: ['Duvarlarda V = ∞ → ψ = 0. Kutuya yalnız tam sayıda yarım dalga sığar: n λ/2 = L.', `${FM(`ψ<sub>n</sub> = ${SQ(F('2', 'L'))} sin ${F('nπx', 'L')}`)} · ${FM(`E<sub>n</sub> = ${F('n<sup>2</sup> h<sup>2</sup>', '8 m L<sup>2</sup>')}`)}`] } },
    { do: S => { S.n = 2; }, p: { t: 'n = 2 durumunda parçacığı kutunun tam ortasında bulma olasılığı nedir?', o: ['En büyük', 'Sıfır', 'Kenarlardakiyle aynı', 'Yarı yarıya'], d: 1 } },
    { sub: 'Parçacığın yerini tekrar tekrar ölçelim.', go: '▶︎ Ölç' },
    { do: S => { S.olas = 1; S.kos = 1; S.say = 0; }, sub: 'Her ölçüm bir kırmızı nokta…', until: S => S.say >= 500 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Düğüm noktasında olasılık sıfır', f: ['k2p2'], m: ['Noktalar |ψ|² eğrisine uydu: ortada hiç nokta yok.', 'Klasik bir top ise kutunun her yerinde eşit olasılıkla bulunurdu.'] } },
    { x: { b: 'Kuantum sayısını değiştir', m: ['Dalga fonksiyonu ve enerji nasıl değişiyor?'],
      kay: [{ ad: 'n', etiket: 'n', min: 1, max: 4, adim: 1, deger: 2, birim: '', set: (S, v) => { S.n = v; S.say = 0; } }],
      olc: S => `E<sub>${S._n}</sub> = ${S._n}² · 0,38 = <em>${fs(0.376 * S._n * S._n)} eV</em> · ${S._n} yarım dalga, ${S._n - 1} iç düğüm` } },
    { do: S => { S.n = 1; S._n = 1; S.say = 0; }, k: { tur: 'dikkat', b: 'Sıfır noktası enerjisi', m: ['En düşük enerji E₁ sıfır değildir: hapsedilmiş parçacık asla tam duramaz (belirsizlik ilkesi).', `L küçülünce E ∝ ${F('1', 'L<sup>2</sup>')} büyür → küçük kuantum noktası mavi ışır.`] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`E<sub>n</sub> = ${F('n<sup>2</sup> h<sup>2</sup>', '8 m L<sup>2</sup>')}`)} · |ψ|² = olasılık yoğunluğu · n. durumda n − 1 iç düğüm · E₁ ≠ 0`] } },
  ] });
  const gK = gorev(sK, { yk: 'UNI7-g1', no: 1, icon: '📦', name: 'Kuyudaki elektron', task: 'Enerji seviyeleri, geçiş fotonu ve kutu boyunun etkisi.', data: [['E₁', '0,4 eV (yaklaşık)'], ['Kutu', 'sonsuz kuyu']], steps: [
    { do: S => { S.n = 3; S.olas = 1; }, sub: 'Elektron 1 nm\'lik kutuda.', go: '▶︎ Başlat' },
    { q: { t: 'E₁ = 0,4 eV ise n = 3 seviyesinin enerjisi kaç eV\'tur?', o: ['3,6 eV', '1,2 eV', '0,13 eV', '2,7 eV'], f: ['k2t'],
      s: [`${FM('E<sub>n</sub> = n<sup>2</sup> E<sub>1</sub>')} = 9 · 0,4 = <em>3,6 eV</em> ✓`], n: ['Seviyeler n ile değil, n² ile artar; aralıklar giderek açılır.'] } },
    { q: { t: 'Elektron n = 3\'ten n = 2\'ye inerse yayılan fotonun enerjisi kaç eV\'tur?', o: ['2 eV', '0,4 eV', '1,6 eV', '3,6 eV'],
      s: ['E₃ − E₂ = (9 − 4) · 0,4', '= <em>2 eV</em> ✓'], n: ['Hidrojenin aksine burada seviyeler n² ile büyür.'] } },
    { q: { t: 'Kutunun boyu yarıya indirilirse E₁ kaç eV olur?', o: ['1,6 eV', '0,8 eV', '0,2 eV', '0,1 eV'],
      s: [`${FM(`E ∝ ${F('1', 'L<sup>2</sup>')}`)} → (${F('1', '1/2')})² = 4 katı`, '4 · 0,4 = <em>1,6 eV</em> ✓'], n: ['Bu yüzden küçük kuantum noktaları daha kısa dalga boyunda (maviye doğru) ışır.'] } },
    { do: S => { S.n = 3; S.kos = 1; S.say = 0; }, q: { t: 'n = 3 durumunda kutunun içinde (duvarlar hariç) bulunma olasılığının sıfır olduğu kaç nokta vardır?', o: ['2', '3', '1', '0'], f: ['k2p2'],
      s: ['ψ₃ = sin(3πx/L) → x = L/3 ve 2L/3\'te sıfır', '<em>2 iç düğüm</em> ✓ (genel kural: n − 1)'], n: ['Düğümler duvarlarla birlikte sayılmaz.'] } },
  ] });
  konuEkle('UNI', 'Schrödinger Denklemi ve Kutudaki Parçacık', { dersler: [dK], gorevler: [gK] });

  // =====================================================================
  // KUANTUM TÜNELLEME — enerji engeli, T ≈ e^(−2κa), V₀ − E = 1 eV, κ ≈ 5,12 nm⁻¹ (elektron)
  // =====================================================================
  const KAP = 5.12;
  const sT = sahne({ icon: '🚇', cam: [[0.6, 4, 16], [0.6, 2, 0]], plate: [12, 4, 0, 0],
    data: [['Parçacık', 'elektron'], ['Enerji', 'E = 3 eV'], ['Engel', 'V₀ = 4 eV']],
    S0: () => ({ a: 0.25, ph: 0, kuant: 1, par: [], zam: 0, gec: 0, top: 0 }),
    kur(g) {
      const engel = kutu(g, 1, 2.4, 1.4, 0x7c3aed, 0, 1.2, 0, { op: 0.55 });
      const psi = duz(g, 0x2563eb), parc = []; for (let i = 0; i < 40; i++) parc.push(top(g, 0.09, 0xef4444, 0, -5, 0, { edge: false }));
      const ey = duz(g, 0x16a34a); FZ.setLine(ey, [V3(-5.5, 1.8, -0.8), V3(5.5, 1.8, -0.8)]);
      kart('t3t', '', '#F5C400'); etiket('t3E', 'E = 3 eV', '#16a34a'); etiket('t3V', 'V₀ = 4 eV', '#7c3aed'); etiket('t3p', 'Re ψ', '#2563eb');
      return { engel, psi, parc };
    },
    tick(S, dt, o) {
      const gen = S.a * 4; o.engel.scale.x = gen; // görsel: 1 nm = 4 birim
      const T = S.kuant ? Math.exp(-2 * KAP * S.a) : 0, k = 4; S.ph += dt * 4;
      const pts = [], at = Math.sqrt(T);
      for (let i = 0; i <= 300; i++) { const x = -5.5 + i / 300 * 11; let y;
        if (x < -gen / 2) y = Math.cos(k * x - S.ph) * 0.5;
        else if (x <= gen / 2) y = S.kuant ? 0.5 * Math.exp(-KAP / 4 * (x + gen / 2)) * Math.cos(k * (-gen / 2) - S.ph) : 0;
        else y = 0.5 * at * Math.cos(k * x - S.ph);
        pts.push(V3(x, 2.9 + y, 0)); }
      FZ.setLine(o.psi, pts);
      if (S.kos) { S.zam += dt * 6; while (S.zam > 1) { S.zam -= 1; S.par.push({ x: -5.5, z: (Math.random() - 0.5) * 1, ge: Math.random() < T, yon: 1 }); S.top++; } }
      S.par.forEach(p => { p.x += p.yon * dt * 2.2; if (p.yon > 0 && p.x > -gen / 2 - 0.1 && !p.ge) p.yon = -1; if (p.ge && p.yon > 0 && p.x > gen / 2 && !p.say) { p.say = 1; S.gec++; } });
      S.par = S.par.filter(p => p.x > -5.6 && p.x < 5.6).slice(-40);
      o.parc.forEach((m, i) => { const p = S.par[i]; if (!p) { m.visible = false; return; } m.visible = true; m.position.set(p.x, 0.3, p.z); m.material.color.setHex(p.ge ? 0x22c55e : 0xef4444); });
      FZ.show('t3E', V3(-3.8, 1.8, -0.8), 1); FZ.show('t3V', V3(0, 2.75, 0), 1); FZ.show('t3p', V3(-4.6, 3.6, 0), 1);
      FZ.setTag('t3t', `a = ${fs(S.a)} nm · T ≈ e<sup>−2κa</sup> = ${(T * 100).toFixed(T < 0.01 ? 3 : 1).replace('.', ',')} %<br>geçen: ${S.gec} / ${S.top}`); FZ.show('t3t', V3(2.4, 4.3, 0), 1);
    },
    qp: () => V3(0, 5, 0) });
  const dT = ders(sT, { yk: 'UNI8-d1', no: 1, icon: '🔬', name: 'Duvarın içinden geçmek', task: 'Klasik engel, kuantum tünelleme, geçme olasılığı T ≈ e^(−2κa), tarama tünelleme mikroskobu.', steps: [
    { k: { tur: 'merak', b: 'Güneş neden yanıyor?', m: ['Güneş\'in merkezindeki protonların enerjisi, birbirlerini itmelerini yenmeye klasik olarak yetmez.', 'Yine de füzyon olur: protonlar enerji engelinin içinden "tünel" açarak geçer.'], dugme: 'Başlayalım ▶︎' } },
    { do: S => { S.kuant = 0; }, k: { tur: 'kavram', b: 'Klasik fizik', m: ['3 eV enerjili top, 4 eV yüksekliğinde bir tepeyi aşamaz: E < V₀ ise <em>her zaman</em> geri döner.'] } },
    { p: { t: 'Kuantum mekaniğinde 3 eV\'luk elektronlar 4 eV\'luk, 0,25 nm kalınlığında engele gönderilirse ne olur?', o: ['Hepsi geri döner', 'Bir kısmı engelin öbür yanına geçer', 'Hepsi geçer', 'Engelin içinde kalır'], d: 1 } },
    { do: S => { S.kuant = 1; S.gec = 0; S.top = 0; }, sub: 'Elektronları gönderelim.', go: '▶︎ Gönder' },
    { do: S => { S.kos = 1; }, sub: 'Yeşil olanlar engeli tünelledi…', until: S => S.top >= 60 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Tünelleme', f: ['t3t', 't3p'], m: ['ψ engelin içinde sıfır olmaz, üstel azalır. Engel incese öbür yanda küçük bir genlik kalır.', 'Yaklaşık %8\'i geçti. Geçen elektron enerji kaybetmez: öbür tarafta yine 3 eV\'tur.'] } },
    { k: { tur: 'kavram', b: 'Geçme olasılığı', m: [`${FM('T ≈ e<sup>−2 κ a</sup>')} · ${FM(`κ = ${F(SQ('2m (V<sub>0</sub> − E)'), 'ħ')}`)}`, 'Engel kalınlığı (a) ve yüksekliği arttıkça T <em>üstel</em> olarak küçülür.'] } },
    { x: { b: 'Engel kalınlığını değiştir', m: ['V₀ − E = 1 eV, κ ≈ 5,1 nm⁻¹'],
      kay: [{ ad: 'a', etiket: 'a', min: 0.1, max: 0.6, adim: 0.05, deger: 0.25, birim: 'nm', set: (S, v) => { S.a = v; S.gec = 0; S.top = 0; } }],
      olc: S => { const T = Math.exp(-2 * KAP * S._a); return `T ≈ e<sup>−2 · 5,12 · ${fs(S._a)}</sup> = <em>%${(T * 100).toFixed(2).replace('.', ',')}</em><br>Kalınlık 2 katına → T karesine iner.`; } } },
    { do: S => { S.a = 0.25; S._a = 0.25; }, k: { tur: 'ornek', b: 'Tarama tünelleme mikroskobu (STM)', m: ['Sivri uç yüzeye ~0,5 nm yaklaştırılır; elektronlar boşluktan tünelleyerek akım oluşturur.', 'Akım uzaklığa üstel bağlı olduğundan tek tek atomlar "görülür" (1986 Nobel). Flaş bellekler de tünellemeyle yazılır.'] } },
    { k: { tur: 'dikkat', b: 'Engel delinmiyor', m: ['Sık yanlış: "Parçacık engelin içinde enerji kazanıp üstünden atlar."', 'Hayır: enerjisi her yerde E\'dir. Geçiş dalga doğasının sonucudur; tek bir parçacığın geçip geçmeyeceği bilinemez, yalnız olasılığı bilinir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`E < V₀ olsa da ${FM('T ≈ e<sup>−2κa</sup>')} olasılıkla geçiş · kalın/yüksek engel → T üstel küçülür · uygulamalar: füzyon, STM, flaş bellek, alfa bozunumu`] } },
  ] });
  const gT = gorev(sT, { yk: 'UNI8-g1', no: 1, icon: '🚇', name: 'Tünel deneyi', task: 'Klasik ve kuantum engel davranışı, kalınlığın etkisi, geçen parçacığın enerjisi.', steps: [
    { do: S => { S.kuant = 1; S.a = 0.25; }, sub: '3 eV\'luk elektronlar 4 eV\'luk engele gönderiliyor.', go: '▶︎ Gönder' },
    { do: S => { S.kos = 1; }, q: { t: 'Aynı durumda klasik bir parçacık (E = 3 eV, V₀ = 4 eV) engelin öbür tarafına geçebilir mi?', o: ['Hayır, her zaman geri döner', 'Evet, her zaman geçer', 'Yarısı geçer', 'Engel inceyse geçer'],
      s: ['Klasik fizikte engelin içinde E<sub>k</sub> = E − V₀ < 0 olurdu: imkânsız.', '<em>Her zaman geri döner</em> ✓'], n: ['Tünelleme tamamen kuantum bir olaydır; makroskobik cisimlerde olasılık sıfıra çok yakındır.'] } },
    { q: { t: 'Bir engelden geçme olasılığı T = 0,1\'dir. Yükseklik aynı kalıp kalınlık 2 katına çıkarsa T kaç olur?', o: ['0,01', '0,05', '0,2', '0,001'], f: ['t3t'],
      s: [`T = e<sup>−2κa</sup> → kalınlık 2a: e<sup>−2κ(2a)</sup> = (e<sup>−2κa</sup>)<sup>2</sup>`, 'T\' = 0,1² = <em>0,01</em> ✓'], n: ['Üstel bağlılık: kalınlık 2 katı → olasılık karesi (yarısı değil!).'] } },
    { q: { t: 'Engeli tünelleyerek geçen 3 eV\'luk elektronun öbür taraftaki kinetik enerjisi kaç eV\'tur?', o: ['3 eV', '1 eV', '0', '4 eV'],
      s: ['Engelin iki yanında da V = 0 ve enerji korunur.', 'Geçen elektronun enerjisi yine <em>3 eV</em> ✓ (yalnız dalganın genliği küçüktür)'], n: ['Geçen parçacık sayısı azdır ama her biri enerjisini korur.'] } },
    { q: { t: 'Tarama tünelleme mikroskobunun atomları görebilmesinin temel sebebi nedir?', o: ['Tünel akımının uç-yüzey uzaklığına üstel bağlı olması', 'Görünür ışığın dalga boyunun kısa olması', 'Ucun çok sıcak olması', 'Elektronların ışıktan hızlı gitmesi'],
      s: ['Uzaklık 0,1 nm değişince akım yaklaşık 10 kat değişir.', 'Bu aşırı hassasiyet sayesinde <em>tek atom basamakları</em> ölçülebilir ✓'], n: ['STM ışık kullanmaz; görünür ışığın dalga boyu (400–700 nm) atomları görmek için çok büyüktür.'] } },
  ] });
  konuEkle('UNI', 'Kuantum Tünelleme', { dersler: [dT], gorevler: [gT] });
})();
