// SEÇMELİ · Parçacık Fiziği ve Standart Model — Kuantum Hesaplama — Astrofizik ve Kozmoloji — Genel Görelilik ve Kara Delikler
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const duz = (g, renk) => { const l = FZ.cizgi(g, renk); l.material.dashSize = 100; l.material.gapSize = 0; return l; };

  // =====================================================================
  // PARÇACIK FİZİĞİ — Standart Model tablosu ve proton içindeki kuarklar
  // =====================================================================
  const SM = [
    ['u', '+⅔', 0xef4444], ['c', '+⅔', 0xef4444], ['t', '+⅔', 0xef4444], ['g', '0', 0x22c55e], ['H', '0', 0xeab308],
    ['d', '−⅓', 0xf97316], ['s', '−⅓', 0xf97316], ['b', '−⅓', 0xf97316], ['γ', '0', 0x22c55e], [],
    ['e', '−1', 0x3b82f6], ['μ', '−1', 0x3b82f6], ['τ', '−1', 0x3b82f6], ['Z', '0', 0x22c55e], [],
    ['ν<sub>e</sub>', '0', 0x8b5cf6], ['ν<sub>μ</sub>', '0', 0x8b5cf6], ['ν<sub>τ</sub>', '0', 0x8b5cf6], ['W', '±1', 0x22c55e], []];
  const sPF = sahne({ icon: '🔬', cam: [[1.4, 4, 10], [1.4, 2.2, 0]], plate: [12, 5, 0, 0],
    data: [['Yük birimi', 'e = 1,6 · 10⁻¹⁹ C']],
    S0: () => ({ mod: 'tablo', don: 0, had: 'uud' }),
    kur(g) {
      const tab = new THREE.Group(); g.add(tab);
      SM.forEach((p, i) => { if (!p.length) return; const x = -4 + (i % 5) * 1.15, y = 4 - Math.floor(i / 5) * 1.05; kutu(tab, 1, 0.9, 0.2, p[2], x, y, 0); kart('pf' + i, '', '#1f2937'); });
      const had = new THREE.Group(); had.position.set(1, 2.2, 0); g.add(had);
      const kab = FZ.mesh(new THREE.SphereGeometry(1.5, 32, 20), 0xe5e7eb, { op: 0.25, edge: false }); had.add(kab);
      const q = [0, 1, 2].map(i => top(had, 0.3, 0xef4444, 0, 0, 0)); const glu = [0, 1, 2].map(() => duz(had, 0x22c55e));
      kart('pft', '', '#F5C400'); ['pq0', 'pq1', 'pq2'].forEach(id => etiket(id, '', '#dc2626'));
      return { tab, had, q, glu };
    },
    tick(S, dt, o) {
      const t = S.mod === 'tablo'; o.tab.visible = t; o.had.visible = !t;
      if (t) { SM.forEach((p, i) => { if (!p.length) return; const x = -4 + (i % 5) * 1.15, y = 4 - Math.floor(i / 5) * 1.05; FZ.setTag('pf' + i, `${p[0]}<br><small>${p[1]}</small>`); FZ.show('pf' + i, V3(x, y, 0.2), 1); });
        FZ.setTag('pft', 'Kırmızı/turuncu: kuarklar · mavi/mor: leptonlar · yeşil: kuvvet taşıyıcılar · sarı: Higgs'); FZ.show('pft', V3(1.5, 0.3, 0), 1); }
      else { S.don += dt; const k = S.had.split(''), yuk = { u: 2 / 3, d: -1 / 3 }; let top_ = 0;
        o.q.forEach((m, i) => { const a = S.don * 1.3 + i * 2.094, r = 0.8 + 0.15 * Math.sin(S.don * 3 + i); m.position.set(r * Math.cos(a), r * Math.sin(a) * 0.8, 0.3 * Math.sin(a * 2)); m.material.color.setHex([0xef4444, 0x22c55e, 0x3b82f6][i]);
          top_ += yuk[k[i]]; FZ.setTag('pq' + i, `${k[i]} (${k[i] === 'u' ? '+⅔' : '−⅓'})`); FZ.show('pq' + i, m.getWorldPosition(V3()).add(V3(0, 0.5, 0)), 1); });
        o.glu.forEach((l, i) => { const a = o.q[i].position, b = o.q[(i + 1) % 3].position, pts = []; for (let j = 0; j <= 30; j++) { const s = j / 30; pts.push(a.clone().lerp(b, s).add(V3(0, 0.08 * Math.sin(s * 30 + S.don * 10), 0))); } FZ.setLine(l, pts); });
        FZ.setTag('pft', `${S.had === 'uud' ? 'Proton' : 'Nötron'} = ${S.had} · yük = ${Math.round(top_ * 3) === 3 ? '+1' : '0'} · renkler: kırmızı + yeşil + mavi = "beyaz"`); FZ.show('pft', V3(1, 4.2, 0), 1); }
    },
    qp: () => V3(1, 4.8, 0) });
  const dPF = ders(sPF, { yk: 'SEC5-d1', no: 1, icon: '🧩', name: 'Evrenin yapı taşları', task: 'Kuarklar, leptonlar, kuvvet taşıyıcı bozonlar, Higgs, hadronlar, korunum yasaları, karşıt madde.', steps: [
    { k: { tur: 'merak', b: 'Her şey atomlardan; atomlar proton, nötron, elektrondan. Peki proton neyden?', m: ['CERN\'deki çarpıştırıcılar protonun içinin de dolu olduğunu gösterdi.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Standart Model', f: ['pft'], m: ['Madde parçacıkları: 6 kuark (u, d, c, s, t, b) ve 6 lepton (e, μ, τ ve nötrinoları).', 'Kuvvet taşıyıcılar: foton (elektromanyetik), gluon (güçlü), W ve Z (zayıf). Higgs bozonu parçacıklara kütle kazandırır (2012).'] } },
    { p: { t: 'Proton iki u (+⅔) ve bir d (−⅓) kuarkından oluşur. Toplam yükü nedir?', o: ['0', '+1', '+⅓', '+2'], d: 1 } },
    { do: S => { S.mod = 'hadron'; S.had = 'uud'; }, sub: 'Protonun içine bakalım.', go: '▶︎ Bak' },
    { k: { tur: 'gozlem', sonuc: true, b: 'Hadronlar', f: ['pft'], m: ['⅔ + ⅔ − ⅓ = +1. Nötron (udd): ⅔ − ⅓ − ⅓ = 0.', 'Kuarklar gluonlarla (yeşil yaylar) bağlıdır ve tek başına gözlenemez (hapsolma).'] } },
    { do: S => { S.had = 'udd'; }, k: { tur: 'kavram', b: 'β bozunumu kuark düzeyinde', m: [`Nötronun bir d kuarkı u\'ya dönüşür: ${FM('d → u + W<sup>−</sup> → u + e<sup>−</sup> + ν̄<sub>e</sub>')}`, 'Zayıf kuvvet, kuark "çeşnisini" değiştirebilen tek kuvvettir.'] } },
    { k: { tur: 'dikkat', b: 'Korunum yasaları', m: ['Her tepkimede yük, baryon sayısı ve lepton sayısı korunur. Elektronla birlikte <em>karşıt nötrino</em> çıkması lepton sayısı içindir.', 'Her parçacığın aynı kütleli, zıt yüklü karşıt parçacığı vardır (e⁻ ↔ e⁺ pozitron).'] } },
    { do: S => { S.mod = 'tablo'; }, k: { tur: 'ozet', b: 'Özet', m: ['6 kuark + 6 lepton + 4 kuvvet taşıyıcı + Higgs · proton uud, nötron udd · kütle çekim henüz modele dahil değil.'] } },
  ] });
  const gPF = gorev(sPF, { yk: 'SEC5-g1', no: 1, icon: '⚛️', name: 'Kuark avı', task: 'Hadronların yükü, β bozunumu ve kuvvet taşıyıcılar.', steps: [
    { do: S => { S.mod = 'hadron'; S.had = 'uud'; }, sub: 'Protonun içi.', go: '▶︎ Başlat' },
    { q: { t: 'Kuark yapısı uud olan parçacığın yükü kaç e\'dir?', o: ['+1', '0', '+⅔', '−1'], f: ['pq0', 'pq1', 'pq2'],
      s: ['⅔ + ⅔ + (−⅓)', '= <em>+1</em> ✓ (proton)'], n: ['Kuarkların yükü kesirlidir ama hadronların yükü her zaman tam sayıdır.'] } },
    { do: S => { S.had = 'udd'; }, q: { t: 'Nötronun kuark yapısı hangisidir?', o: ['udd', 'uud', 'uuu', 'ddd'], f: ['pft'],
      s: ['Yük 0 olmalı: ⅔ − ⅓ − ⅓ = 0', '→ <em>udd</em> ✓'], n: ['uuu (Δ⁺⁺) ve ddd (Δ⁻) de vardır ama kararsızdır.'] } },
    { q: { t: 'β⁻ bozunumunda kuark düzeyinde ne olur?', o: ['Bir d kuarkı u kuarkına dönüşür', 'Bir u kuarkı d kuarkına dönüşür', 'Kuark sayısı artar', 'Bir kuark yok olur'],
      s: ['Nötron (udd) → proton (uud)', '<em>d → u</em> ✓ (W⁻ bozonu ile, e⁻ ve ν̄<sub>e</sub> çıkar)'], n: ['β⁺ bozunumunda tersi olur: u → d + e⁺ + ν<sub>e</sub>.'] } },
    { do: S => { S.mod = 'tablo'; }, q: { t: 'Elektromanyetik kuvveti taşıyan parçacık hangisidir?', o: ['Foton', 'Gluon', 'W bozonu', 'Higgs bozonu'], f: ['pft'],
      s: ['Yüklü parçacıklar foton alışverişiyle etkileşir.', '<em>Foton (γ)</em> ✓'], n: ['Gluon: güçlü kuvvet · W, Z: zayıf kuvvet · Higgs: kütle mekanizması.'] } },
  ] });
  konuEkle('SEC', 'Parçacık Fiziği ve Standart Model', { dersler: [dPF], gorevler: [gPF] });

  // =====================================================================
  // KUANTUM HESAPLAMA — Bloch küresi ve ölçüm istatistiği
  // =====================================================================
  const sKQ = sahne({ icon: '💠', cam: [[1.6, 3.5, 9], [1.6, 2, 0]], plate: [10, 5, 0, 0],
    data: [['Kübit', '|ψ⟩ = α|0⟩ + β|1⟩']],
    S0: () => ({ th: 0, hedef: 0, n0: 0, n1: 0, olc: 0, zam: 0 }),
    kur(g) {
      const k = new THREE.Group(); k.position.set(-1.2, 2.2, 0); g.add(k);
      k.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.5, 16, 10)), new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.5 })));
      const b0 = kutu(g, 0.7, 1, 0.5, 0x2563eb, 2.6, 0.5, 0), b1 = kutu(g, 0.7, 1, 0.5, 0xdc2626, 3.6, 0.5, 0);
      kart('kq0', '|0⟩', '#2563eb'); kart('kq1', '|1⟩', '#dc2626'); kart('kqt', '', '#F5C400'); etiket('kqv', 'ψ', '#7c3aed');
      kart('kh0', '', '#2563eb'); kart('kh1', '', '#dc2626');
      return { k, b0, b1, ov: ok(0x8b5cf6, 'kqv') };
    },
    tick(S, dt, o) {
      S.th += (S.hedef - S.th) * Math.min(1, dt * 2); const th = S.th * Math.PI / 180, P1 = Math.sin(th / 2) ** 2;
      const d = V3(Math.sin(th), Math.cos(th), 0); FZ.setArrow(o.ov, V3(-1.2, 2.2, 0), d, 1.5); FZ.show('kqv', V3(-1.2, 2.2, 0).add(d.clone().multiplyScalar(1.85)), 1);
      FZ.show('kq0', V3(-1.2, 4.1, 0), 1); FZ.show('kq1', V3(-1.2, 0.3, 0), 1);
      if (S.olc) { S.zam += dt * 25; while (S.zam > 1) { S.zam -= 1; if (Math.random() < P1) S.n1++; else S.n0++; } }
      const N = S.n0 + S.n1 || 1, h0 = Math.max(0.02, S.n0 / N * 3), h1 = Math.max(0.02, S.n1 / N * 3);
      o.b0.scale.y = h0; o.b0.position.y = h0 / 2; o.b1.scale.y = h1; o.b1.position.y = h1 / 2;
      FZ.setTag('kh0', `0: ${S.n0}`); FZ.show('kh0', V3(2.6, h0 + 0.4, 0), 1); FZ.setTag('kh1', `1: ${S.n1}`); FZ.show('kh1', V3(3.6, h1 + 0.4, 0), 1);
      FZ.setTag('kqt', `θ = ${Math.round(S.th)}° · P(0) = cos²(θ/2) = ${fs(1 - P1)} · P(1) = ${fs(P1)}`); FZ.show('kqt', V3(1, 4.7, 0), 1);
    },
    qp: () => V3(1, 5.2, 0) });
  const dKQ = ders(sKQ, { yk: 'SEC6-d1', no: 1, icon: '💻', name: 'Hem 0 hem 1 olan bit', task: 'Kübit, süperpozisyon, ölçüm, Bloch küresi, kuantum kapıları, dolanıklık.', steps: [
    { k: { tur: 'merak', b: 'Klasik bit ya 0 ya 1\'dir. Kübit ise ikisinin süperpozisyonunda olabilir', m: ['50 kübitlik bir durumu klasik bilgisayarda tutmak için 2⁵⁰ ≈ 10¹⁵ sayı gerekir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Kübit', m: [`${FM('|ψ⟩ = α|0⟩ + β|1⟩')} · ${FM('|α|<sup>2</sup> + |β|<sup>2</sup> = 1')}`, 'Ölçünce sonuç ya 0 (olasılık |α|²) ya 1 (|β|²) çıkar ve durum o sonuca "çöker".', 'Bloch küresi: kuzey kutbu |0⟩, güney kutbu |1⟩; ekvator eşit süperpozisyon.'] } },
    { do: S => { S.hedef = 90; }, p: { t: 'Kübit ekvatorda (Hadamard kapısından geçmiş |0⟩). 100 kez hazırlayıp ölçersek ne görürüz?', o: ['Hep 0', 'Yaklaşık 50 kez 0, 50 kez 1', 'Hep 1', 'Ölçüm sonucu 0,5 çıkar'], d: 1 } },
    { sub: 'Ölçmeye başlayalım.', go: '▶︎ Ölç' },
    { do: S => { S.olc = 1; }, sub: 'Her ölçüm ya 0 ya 1…', wait: 5 },
    { do: S => { S.olc = 0; }, k: { tur: 'gozlem', sonuc: true, b: 'Tek ölçüm rastgele, istatistik kesin', f: ['kh0', 'kh1', 'kqt'], m: ['Hiçbir ölçüm "0,5" vermez; her biri 0 ya da 1. Ama sayılar %50–%50\'ye yaklaşır.'] } },
    { x: { b: 'Kübiti döndür', m: ['Kuantum kapısı = Bloch küresinde dönme. Sonra yeniden ölç.'],
      kay: [{ ad: 'th', etiket: 'θ', min: 0, max: 180, adim: 30, deger: 90, birim: '°', set: (S, v) => { S.hedef = v; S.n0 = 0; S.n1 = 0; S.olc = 1; } }],
      olc: S => `P(1) = sin²(${S._th}°/2) = <em>${fs(Math.sin(S._th * Math.PI / 360) ** 2)}</em>` } },
    { do: S => { S.olc = 0; S.hedef = 90; }, k: { tur: 'kavram', b: 'Dolanıklık', m: [`Bell durumu: ${FM(`|Φ⁺⟩ = ${F('|00⟩ + |11⟩', SQ('2'))}`)}`, 'Kübitlerden biri ölçülüp 0 çıkarsa öbürü de kesin 0 çıkar, ne kadar uzakta olursa olsun. Ama bu yolla ışıktan hızlı bilgi gönderilemez.'] } },
    { k: { tur: 'dikkat', b: 'Kuantum bilgisayar her şeyi hızlandırmaz', m: ['Yalnız girişimi akıllıca kullanan algoritmalarda üstündür: Shor (çarpanlara ayırma), Grover (arama), molekül benzetimi.', 'Kübitler çevreyle etkileşince süperpozisyonu kaybeder (dekoherans); bu en büyük teknik engeldir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('|ψ⟩ = α|0⟩ + β|1⟩')} · ölçüm olasılıksal · kapı = dönme · n kübit → 2<sup>n</sup> genlik · dolanıklık`] } },
  ] });
  const gKQ = gorev(sKQ, { yk: 'SEC6-g1', no: 1, icon: '💠', name: 'Kübit laboratuvarı', task: 'Ölçüm olasılığı, kübit sayısı, kapılar ve dolanıklık.', steps: [
    { do: S => { S.hedef = 90; }, sub: 'Kübit hazırlandı.', go: '▶︎ Başlat' },
    { do: S => { S.olc = 1; }, q: { t: `|ψ⟩ = ${F('1', SQ('2'))}|0⟩ + ${F('1', SQ('2'))}|1⟩ durumundaki kübit ölçülürse 1 çıkma olasılığı nedir?`, o: ['½', F('1', SQ('2')), '1', '0'], f: ['kqt'],
      s: [`P(1) = |β|<sup>2</sup> = (${F('1', SQ('2'))})<sup>2</sup> = <em>${F('1', '2')}</em> ✓`], n: ['Olasılık genliğin karesidir, genliğin kendisi değil.'] } },
    { q: { t: '3 kübitlik bir sistemin genel durumu kaç karmaşık genlikle tanımlanır?', o: ['8', '3', '6', '9'],
      s: ['|000⟩, |001⟩, …, |111⟩', '2<sup>3</sup> = <em>8</em> ✓'], n: ['Her kübit eklendiğinde genlik sayısı iki katına çıkar.'] } },
    { do: S => { S.olc = 0; S.n0 = 0; S.n1 = 0; S.hedef = 180; }, q: { t: 'X (NOT) kapısı |0⟩ durumunu neye dönüştürür?', o: ['|1⟩', '|0⟩', F('|0⟩ + |1⟩', SQ('2')), 'Kübiti siler'], f: ['kqv'],
      s: ['X kapısı Bloch küresinde 180° döndürür: kuzey → güney.', '<em>|0⟩ → |1⟩</em> ✓'], n: [`Hadamard (H) kapısı ise |0⟩'ı ekvatora, ${F('|0⟩ + |1⟩', SQ('2'))} durumuna götürür.`] } },
    { q: { t: `${F('|00⟩ + |11⟩', SQ('2'))} durumundaki iki kübitten ilki ölçülüp 1 bulunuyor. İkincisi ölçülürse ne çıkar?`, o: ['Kesinlikle 1', 'Kesinlikle 0', '%50 olasılıkla 1', 'Ölçülemez'],
      s: ['İlk kübit 1 → durum |11⟩\'e çöker', 'İkinci kübit <em>kesinlikle 1</em> ✓'], n: ['Sonuçlar ilişkilidir ama ilk ölçümün sonucu yine rastgeledir; bu yüzden bilgi aktarılamaz.'] } },
  ] });
  konuEkle('SEC', 'Kuantum Hesaplama', { dersler: [dKQ], gorevler: [gKQ] });

  // =====================================================================
  // ASTROFİZİK VE KOZMOLOJİ — genişleyen evren (balon modeli), Hubble yasası
  // =====================================================================
  const sAK = sahne({ icon: '🌌', cam: [[1.4, 8, 7], [1.4, 0, 0]], plate: [11, 9, 0, 0],
    data: [['H₀', '70 km/s/Mpc'], ['c', '3 · 10⁵ km/s']],
    S0: () => ({ a: 1, kos: 0, sec: 12 }),
    kur(g) {
      const gal = []; for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const m = FZ.gokada(g, (i === 0 && j === 0) ? 0xfacc15 : 0x93c5fd, 1); m.rotation.y = Math.random() * 6; m.material = m.disk.material; m.userData.p = [i * 1.2 + (Math.random() - 0.5) * 0.3, j * 1.0 + (Math.random() - 0.5) * 0.3]; gal.push(m); }
      const oklar = gal.map(() => ok(0xef4444, 'akv'));
      etiket('akv', 'v', '#dc2626'); kart('akt', '', '#F5C400'); kart('akb', 'Biz', '#ca8a04');
      return { gal, oklar };
    },
    tick(S, dt, o) {
      if (S.kos) S.a = Math.min(1.8, S.a + dt * 0.08);
      const mer = o.gal[S.sec].userData.p;
      o.gal.forEach((m, i) => { const p = m.userData.p; m.position.set(p[0] * S.a, 0.3, p[1] * S.a); m.material.color.setHex(i === S.sec ? 0xfacc15 : 0x93c5fd);
        const r = V3((p[0] - mer[0]) * S.a, 0, (p[1] - mer[1]) * S.a), v = r.length() * 0.35;
        if (S.kos && v > 0.05) FZ.setArrow(o.oklar[i], m.position, r, v); });
      FZ.show('akb', o.gal[S.sec].position.clone().add(V3(0, 0.6, 0)), 1);
      FZ.setTag('akt', `Ölçek çarpanı a = ${fs(S.a)} · Her gökada her diğerinden uzaklıkla orantılı hızla uzaklaşıyor`); FZ.show('akt', V3(0, 0.3, -4), 1);
    },
    qp: () => V3(0, 2, 0) });
  const dAK = ders(sAK, { yk: 'SEC7-d1', no: 1, icon: '🔭', name: 'Evren neden genişliyor görünür?', task: 'Hubble yasası, kırmızıya kayma, evrenin yaşı, kozmik mikrodalga arka plan, karanlık madde ve enerji.', steps: [
    { k: { tur: 'merak', b: '1929: Hubble uzak gökadaların ışığını inceledi', m: ['Neredeyse hepsinin ışığı kırmızıya kaymıştı: bizden uzaklaşıyorlardı. Uzaktakiler daha hızlı!'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Hubble yasası', m: [`${FM('v = H<sub>0</sub> d')} · H<sub>0</sub> ≈ 70 km/s/Mpc (1 Mpc ≈ 3,26 milyon ışık yılı)`, `Kırmızıya kayma: ${FM(`z = ${F('Δλ', 'λ')} ≈ ${F('v', 'c')}`)} (v ≪ c)`] } },
    { p: { t: 'Biz evrenin merkezinde miyiz? Başka bir gökadadaki gözlemci ne görür?', o: ['Herkes bize doğru gelir', 'O da diğer gökadaların kendisinden uzaklaştığını görür', 'Gökadalar durağandır', 'Yalnız biz uzaklaşmayı görürüz'], d: 1 } },
    { sub: 'Evreni genişletelim (sarı: gözlemci).', go: '▶︎ Genişlet' },
    { do: S => { S.kos = 1; }, sub: 'Uzayın kendisi genişliyor…', wait: 4 },
    { do: S => { S.sec = 18; }, sub: 'Gözlemciyi başka bir gökadaya taşıyalım.', wait: 4 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Merkez yok', f: ['akt'], m: ['Her gözlemci kendini merkezde sanır: herkes için v ∝ d. Gökadalar uzayda koşmuyor; aralarındaki uzay genişliyor (balonun yüzeyindeki noktalar gibi).'] } },
    { k: { tur: 'kavram', b: 'Evrenin yaşı ve Büyük Patlama', m: [`Kabaca ${FM(`t ≈ ${F('1', 'H<sub>0</sub>')}`)} ≈ 14 milyar yıl (ölçülen: 13,8).`, 'Kozmik mikrodalga arka plan (2,7 K): evren 380 000 yaşındayken salınan ışık, genişlemeyle mikrodalgaya uzamış. Wien: λ<sub>max</sub> T = 2,9 · 10⁻³ m·K.'] } },
    { k: { tur: 'dikkat', b: 'Bilmediklerimiz', m: ['Gökadaların dönme hızları görünür maddeyle açıklanamıyor → <em>karanlık madde</em> (~%27).', 'Genişleme hızlanıyor → <em>karanlık enerji</em> (~%68). Bildiğimiz sıradan madde yalnız ~%5!'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('v = H<sub>0</sub> d')} · ${FM('z ≈ v/c')} · ${FM('t ≈ 1/H<sub>0</sub>')} · CMB 2,7 K · %5 madde, %27 karanlık madde, %68 karanlık enerji`] } },
  ] });
  const gAK = gorev(sAK, { yk: 'SEC7-g1', no: 1, icon: '🔭', name: 'Gökada avcısı', task: 'Hubble yasası, kırmızıya kayma, CMB ve evrenin yaşı.', data: [['H₀', '70 km/s/Mpc'], ['c', '3 · 10⁵ km/s'], ['Wien sabiti', '2,9 · 10⁻³ m·K']], steps: [
    { do: S => { S.kos = 1; S.sec = 12; }, sub: 'Gökadaları gözlüyoruz.', go: '▶︎ Başlat' },
    { q: { t: '100 Mpc uzaklıktaki bir gökada bizden kaç km/s hızla uzaklaşır?', o: ['7000 km/s', '700 km/s', '0,7 km/s', '70 000 km/s'],
      s: [`${FM('v = H<sub>0</sub> d')} = 70 · 100 = <em>7000 km/s</em> ✓`], n: ['Birimler: (km/s)/Mpc × Mpc = km/s.'] } },
    { q: { t: 'Bu gökadanın ışığındaki kırmızıya kayma z yaklaşık kaçtır?', o: ['0,023', '2,3', '0,23', '43'],
      s: [`z ≈ ${F('v', 'c')} = ${F('7000', '300 000')} ≈ <em>0,023</em> ✓`], n: ['Yani 500 nm\'lik bir çizgi yaklaşık 511,5 nm\'de gözlenir.'] } },
    { q: { t: 'Kozmik mikrodalga arka planın sıcaklığı 2,7 K\'dir. Işımanın en şiddetli olduğu dalga boyu yaklaşık nedir?', o: ['1,1 mm', '1,1 μm', '1,1 m', '7,8 mm'],
      s: [`λ<sub>max</sub> = ${F('2,9 · 10<sup>−3</sup>', '2,7')} ≈ 1,07 · 10<sup>−3</sup> m ≈ <em>1,1 mm</em> ✓ (mikrodalga)`], n: ['Adı da buradan gelir: mikrodalga arka plan.'] } },
    { q: { t: 'Hubble sabiti daha büyük ölçülseydi 1/H₀ ile tahmin edilen evren yaşı nasıl değişirdi?', o: ['Daha küçük olurdu', 'Daha büyük olurdu', 'Değişmezdi', 'Sonsuz olurdu'],
      s: [`t ≈ ${F('1', 'H<sub>0</sub>')} → H₀ büyürse <em>t küçülür</em> ✓`], n: ['Daha hızlı genişleyen evren bugünkü boyutuna daha kısa sürede ulaşır.'] } },
  ] });
  konuEkle('SEC', 'Astrofizik ve Kozmoloji', { dersler: [dAK], gorevler: [gAK] });

  // =====================================================================
  // GENEL GÖRELİLİK VE KARA DELİKLER — eğri uzay-zaman ızgarası (benzetme), ışığın bükülmesi
  // =====================================================================
  const sGG = sahne({ icon: '🕳️', cam: [[2, 9.5, 11], [2, 1.2, 0]], plate: [11, 9, 0, 0],
    data: [['G', '6,67 · 10⁻¹¹ N·m²/kg²'], ['c', '3 · 10⁸ m/s']],
    S0: () => ({ M: 1, kd: 0 }),
    kur(g) {
      const geo = new THREE.PlaneGeometry(10, 8, 60, 48); geo.rotateX(-Math.PI / 2);
      const lev = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true })); lev.position.y = 1.8; g.add(lev); // ızgara tabanın üstünde dursun
      const kut = top(g, 0.4, 0xfacc15, 0, 0, 0, { edge: false }), ufuk = FZ.mesh(new THREE.SphereGeometry(1, 32, 20), 0x000000, { edge: false }); g.add(ufuk);
      const isin = duz(g, 0xef4444), duzIsin = FZ.cizgi(g, 0x94a3b8);
      kart('ggt', '', '#F5C400'); etiket('ggi', 'ışık', '#dc2626');
      return { lev, kut, ufuk, isin, duzIsin, y0: geo.attributes.position.array.slice() };
    },
    tick(S, dt, o) {
      const pos = o.lev.geometry.attributes.position, d = S.kd ? 2.5 : 1.2 * S.M;
      for (let i = 0; i < pos.count; i++) { const x = o.y0[i * 3], z = o.y0[i * 3 + 2], r = Math.hypot(x, z); pos.setY(i, -d / Math.sqrt(r * r / (S.kd ? 0.5 : 1) + 0.6) + 0.3); }
      pos.needsUpdate = true;
      o.kut.visible = !S.kd; o.ufuk.visible = !!S.kd; o.kut.position.y = 1.8 - d / Math.sqrt(0.6) + 0.7; o.ufuk.position.y = o.kut.position.y; o.ufuk.scale.setScalar(0.8);
      const b = 1.6, sap = (S.kd ? 0.9 : 0.25 * S.M), pts = [];
      for (let i = 0; i <= 100; i++) { const x = -5 + i / 10; const aci = sap * (Math.atan(x / b) / (Math.PI / 2) + 1) / 2; pts.push(V3(x, 2.4, b - aci * (x + 5) * 0.25)); }
      FZ.setLine(o.isin, pts); FZ.setLine(o.duzIsin, [V3(-5, 2.4, b), V3(5, 2.4, b)]); FZ.show('ggi', V3(-4.3, 2.7, b), 1);
      const rs = 2 * 6.67e-11 * S.M * 2e30 / 9e16 / 1000;
      FZ.setTag('ggt', S.kd ? `Kara delik · olay ufku: r<sub>s</sub> = ${F('2GM', 'c<sup>2</sup>')}` : `Kütle = ${fs(S.M)} Güneş kütlesi · r<sub>s</sub> = ${fs(rs)} km`); FZ.show('ggt', V3(-1.5, 2.4, 3.6), 1);
    },
    qp: () => V3(0, 2.5, 0) });
  const dGG = ders(sGG, { yk: 'SEC8-d1', no: 1, icon: '🌀', name: 'Kütle uzay-zamanı büker', task: 'Eşdeğerlik ilkesi, uzay-zaman eğriliği, ışığın bükülmesi, kütle çekimsel zaman genişlemesi, kara delikler, kütle çekim dalgaları.', steps: [
    { k: { tur: 'merak', b: 'Kapalı bir asansörde uyanıyorsunuz. Ayağınızı yere bastıran şey Dünya\'nın çekimi mi, yoksa asansör uzayda 9,8 m/s² ile hızlanıyor mu?', m: ['Einstein: hiçbir deneyle ayırt edemezsiniz. Bu <em>eşdeğerlik ilkesi</em> genel göreliliğin temelidir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Kütle çekim = uzay-zamanın eğriliği', m: ['Kütle ve enerji uzay-zamanı büker; cisimler bu eğri uzay-zamanda "en düz" yolu izler.', 'Izgara bir <em>benzetmedir</em>: aslında dört boyutlu uzay-zaman eğrilir, lastik bir çarşaf değil.'] } },
    { p: { t: 'Uzak bir yıldızdan gelen ışık Güneş\'in yakınından geçerse ne olur?', o: ['Düz gider (ışığın kütlesi yok)', 'Güneş\'e doğru bükülür', 'Durur', 'Hızlanır'], d: 1 } },
    { sub: 'Işığın yoluna bakalım (gri: düz yol).', go: '▶︎ Bak' },
    { k: { tur: 'gozlem', sonuc: true, b: 'Işık da eğri uzay-zamanı izler', f: ['ggi'], m: ['1919 Güneş tutulmasında Eddington yıldızların yerini kaymış ölçtü: Güneş kenarında 1,75 açı saniyesi — Einstein\'ın tahmini.', 'Gökadaların arkasındaki cisimlerin çoklu görüntüsü: kütle çekimsel mercek.'] } },
    { x: { b: 'Kütleyi değiştir', m: ['Eğrilik ve olay ufku yarıçapı.'],
      kay: [{ ad: 'M', etiket: 'M', min: 0.5, max: 3, adim: 0.5, deger: 1, birim: 'M☉', set: (S, v) => { S.M = v; } }],
      olc: S => `r<sub>s</sub> = ${F('2GM', 'c<sup>2</sup>')} ≈ <em>${fs(2.96 * S._M)} km</em> (bu kütle bu yarıçapa sıkışırsa kara delik olur)` } },
    { do: S => { S.M = 1; S.kd = 1; }, k: { tur: 'kavram', b: 'Kara delik', f: ['ggt'], m: [`${FM(`r<sub>s</sub> = ${F('2 G M', 'c<sup>2</sup>')}`)} · olay ufkunun içinden ışık bile kaçamaz.`, '2019: Event Horizon Teleskobu M87 gökadasındaki kara deliğin gölgesini görüntüledi. 2015: LIGO iki kara deliğin birleşmesinden gelen kütle çekim dalgalarını ölçtü.'] } },
    { k: { tur: 'dikkat', b: 'Kütle çekim zamanı da yavaşlatır', m: ['Güçlü çekimde saatler yavaş işler. GPS uydularının saatleri yerdekilerden günde ~45 μs hızlı işler (özel görelilik −7 μs ile toplam +38 μs).', 'Kara delik "elektrikli süpürge" değildir: Güneş kara deliğe dönüşseydi Dünya\'nın yörüngesi değişmezdi.'] } },
    { do: S => { S.kd = 0; }, k: { tur: 'ozet', b: 'Özet', m: [`Eşdeğerlik ilkesi · kütle uzay-zamanı büker · ışık bükülür · ${FM(`r<sub>s</sub> = ${F('2GM', 'c<sup>2</sup>')}`)} · kütle çekim dalgaları`] } },
  ] });
  const gGG = gorev(sGG, { yk: 'SEC8-g1', no: 1, icon: '🕳️', name: 'Olay ufku', task: 'Schwarzschild yarıçapı, eşdeğerlik ilkesi ve kütle çekimsel zaman genişlemesi.', data: [['G', '6,67 · 10⁻¹¹ N·m²/kg²'], ['c', '3 · 10⁸ m/s'], ['Güneş kütlesi', '2 · 10³⁰ kg'], ['Dünya kütlesi', '6 · 10²⁴ kg']], steps: [
    { do: S => { S.M = 1; S.kd = 0; }, sub: 'Güneş kütleli bir cisim uzay-zamanı büküyor.', go: '▶︎ Başlat' },
    { q: { t: 'Güneş kara deliğe dönüşseydi olay ufkunun yarıçapı yaklaşık kaç km olurdu?', o: ['3 km', '300 km', '0,3 km', '3000 km'], f: ['ggt'],
      s: [`r<sub>s</sub> = ${F('2 · 6,67 · 10<sup>−11</sup> · 2 · 10<sup>30</sup>', '9 · 10<sup>16</sup>')} ≈ 2,96 · 10<sup>3</sup> m ≈ <em>3 km</em> ✓`], n: ['Güneş\'in gerçek yarıçapı 700 000 km; kara delik olması için 3 km\'ye sıkışması gerekirdi.'] } },
    { q: { t: 'Dünya için Schwarzschild yarıçapı yaklaşık ne kadardır?', o: ['9 mm', '9 km', '9 m', '0,9 μm'],
      s: [`r<sub>s</sub> = ${F('2 · 6,67 · 10<sup>−11</sup> · 6 · 10<sup>24</sup>', '9 · 10<sup>16</sup>')} ≈ 8,9 · 10<sup>−3</sup> m ≈ <em>9 mm</em> ✓`], n: ['r<sub>s</sub> kütleyle doğru orantılıdır.'] } },
    { q: { t: 'Kapalı bir kabinde serbest bırakılan topun düştüğü görülüyor. Kabin için ne söylenebilir?', o: ['Yerçekimi alanında duruyor da olabilir, uzayda yukarı ivmeleniyor da', 'Kesinlikle Dünya üzerinde duruyor', 'Kesinlikle uzayda sabit hızla gidiyor', 'Serbest düşüyor'],
      s: ['Eşdeğerlik ilkesi: düzgün kütle çekim alanı ile ivmeli sistem yerel deneylerle ayırt edilemez.', '<em>İkisi de olabilir</em> ✓'], n: ['Serbest düşen kabinde ise top havada asılı kalır gibi görünür (ağırlıksızlık).'] } },
    { q: { t: 'Bir saat dağın tepesinde, öbürü deniz kıyısında. Kütle çekim etkisiyle hangisi daha hızlı işler?', o: ['Dağdaki', 'Deniz kıyısındaki', 'İkisi aynı', 'Hangisi daha sıcaksa'],
      s: ['Çekim zayıfladıkça (Dünya\'dan uzaklaştıkça) zaman daha hızlı akar.', '<em>Dağdaki saat</em> ✓ (atom saatleriyle birkaç metre farkta bile ölçülmüştür)'], n: ['GPS uydu saatlerinin günde ~45 μs hızlı işlemesinin sebebi budur.'] } },
  ] });
  konuEkle('SEC', 'Genel Görelilik ve Kara Delikler', { dersler: [dGG], gorevler: [gGG] });
})();
