// AYT 9 · Kütle ve Ağırlık Merkezi — AYT 10 · Basit Makineler — AYT 11 · Elektriksel Kuvvet ve Alan — AYT 12 · Elektriksel Potansiyel
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const bin = x => Math.round(x).toLocaleString('tr-TR');

  // =====================================================================
  // AYT 9 · KÜTLE VE AĞIRLIK MERKEZİ — ipten asılı çubuk ve kütleler (0–8 m)
  // =====================================================================
  const s9 = sahne({ icon: '🎯', cam: [[1.6, 4, 15], [1.6, 3, 0]], plate: [12, 5, 0, 0],
    data: [['Çubuk', 'kütlesiz, 8 m']],
    S0: () => ({ m1: 1, x1: 0, m2: 3, x2: 8, m3: 0, x3: 4, cubuk: 0 }),
    kur(g) {
      kutu(g, 10, 0.2, 0.6, 0x64748b, 0, 5.2, 0);
      const ip = FZ.cizgi(g, 0x111827); const kol = new THREE.Group(); g.add(kol);
      kutu(kol, 8.2, 0.14, 0.4, 0xf59e0b, 0, 0, 0); for (let i = 0; i <= 8; i++) kutu(kol, 0.03, 0.18, 0.42, 0x111827, i - 4, 0, 0, { edge: false });
      const b = [0xef4444, 0x3b82f6, 0x22c55e].map(c => kutu(kol, 0.5, 0.5, 0.5, c, 0, -0.35, 0));
      const km = FZ.mesh(new THREE.ConeGeometry(0.18, 0.4, 16), 0x9333ea); km.rotation.x = Math.PI; kol.add(km);
      etiket('k9m', 'KM', '#9333ea'); kart('k9t', '', '#F5C400'); ['k9a', 'k9b', 'k9c'].forEach((id, i) => kart(id, '', ['#ef4444', '#3b82f6', '#22c55e'][i]));
      return { ip, kol, b, km };
    },
    tick(S, dt, o) {
      const ms = [[S.m1, S.x1], [S.m2, S.x2], [S.m3, S.x3]], cm = S.cubuk; // cubuk: türdeş çubuğun kütlesi (orta noktada)
      let M = cm, Mx = cm * 4; ms.forEach(([m, x]) => { M += m; Mx += m * x; }); const xk = M ? Mx / M : 4;
      o.kol.position.set(4 - xk, 3.6, 0); // ip tam KM'den bağlı → çubuk yatay dengede
      FZ.setLine(o.ip, [V3(0, 5.1, 0), V3(0, 3.7, 0)]);
      o.b.forEach((b, i) => { const [m, x] = ms[i]; b.visible = m > 0; b.position.x = x - 4; const s = 0.35 + 0.12 * m; b.scale.setScalar(s / 0.5); b.position.y = -0.07 - s / 2;
        FZ.setTag(['k9a', 'k9b', 'k9c'][i], `${m} kg · x = ${fs(x)} m`); FZ.show(['k9a', 'k9b', 'k9c'][i], b.getWorldPosition(V3()).add(V3(0, -0.9 - 0.25 * i, 0)), m > 0 ? 1 : 0); });
      o.km.position.set(xk - 4, 0.35, 0); FZ.show('k9m', V3(0, 4.35, 0), 1);
      FZ.setTag('k9t', `x<sub>KM</sub> = ${fs(xk)} m`); FZ.show('k9t', V3(3.6, 4.6, 0), 1);
    },
    qp: () => V3(0, 5.8, 0) });
  const d9 = ders(s9, { yk: 'AYT9-d1', no: 1, icon: '✏️', name: 'Kalemi parmağın ucunda dengele', task: 'Kütle merkezi, ağırlık merkezi, kütle merkezi formülü ve devrilme şartı.', steps: [
    { k: { tur: 'merak', b: 'Bir kalemi tek parmakla nereden tutarsan düşmez?', m: ['Türdeş kalemde ortadan. Peki ucuna silgi takılmış kalemde?', 'Cismin bütün kütlesi tek noktada toplanmış gibi davranır: kütle merkezi.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Kütle merkezi', m: [`${FM(`x<sub>KM</sub> = ${F('m<sub>1</sub>x<sub>1</sub> + m<sub>2</sub>x<sub>2</sub> + …', 'm<sub>1</sub> + m<sub>2</sub> + …')}`)}`, 'Çubuk, ip tam kütle merkezinden bağlanırsa yatay dengede kalır (mor işaret).'] } },
    { p: { t: '8 m\'lik kütlesiz çubuğun sol ucunda 1 kg, sağ ucunda 3 kg var. Kütle merkezi sol uçtan kaç m uzaktadır?', o: ['4 m', '6 m', '2 m', '5 m'], d: 1 } },
    { sub: 'Çubuğu kütle merkezinden asalım.', go: '▶︎ As' },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kütle merkezi ağır tarafa yakındır', f: ['k9t', 'k9m'], m: [`x<sub>KM</sub> = ${F('1 · 0 + 3 · 8', '1 + 3')} = ${F('24', '4')} = 6 m`, 'Uzaklıklar kütlelerle ters orantılı: 6 m · 1 kg = 2 m · 3 kg.'] } },
    { x: { b: 'Sağdaki kütleyi değiştir', m: ['Kütle merkezi nasıl kayıyor?'],
      kay: [{ ad: 'm2', etiket: 'Mavi kütle', min: 1, max: 7, adim: 1, deger: 3, birim: 'kg', set: (S, v) => { S.m2 = v; } }],
      olc: S => `x<sub>KM</sub> = ${F(`8 · ${S._m2}`, `1 + ${S._m2}`)} = <em>${fs(8 * S._m2 / (1 + S._m2))} m</em><br>Kütle arttıkça KM o kütleye yaklaşır ama hiçbir zaman uca ulaşmaz.` } },
    { do: S => { S.m2 = 3; S._m2 = 3; }, k: { tur: 'kavram', b: 'Ağırlık merkezi', m: ['Yer çekimi alanı düzgünse (g her yerde aynı) ağırlık merkezi kütle merkezi ile <em>aynı noktadır</em>.', 'Türdeş çubuk, kare, daire gibi simetrik cisimlerde ağırlık merkezi geometrik merkezdedir.'] } },
    { k: { tur: 'dikkat', b: 'KM cismin dışında olabilir · devrilme', m: ['Halkanın, bumerangın kütle merkezi cismin üzerinde değil, boşluktadır.', 'Bir cisim, ağırlık merkezinden geçen düşey doğru <em>taban alanının içinden</em> geçtikçe devrilmez.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`x<sub>KM</sub> = ${F('Σ m x', 'Σ m')}`)} · türdeş cisimde KM geometrik merkezde · düzgün g\'de AM = KM.`] } },
  ] });
  const g9 = gorev(s9, { yk: 'AYT9-g1', no: 1, icon: '⚖️', name: 'Askı noktasını bul', task: 'Kütle merkezinin yerini hesaplayın.', data: [['Çubuk', '8 m'], ['x', 'sol uçtan ölçülür']], steps: [
    { do: S => { S.m1 = 2; S.x1 = 0; S.m2 = 6; S.x2 = 8; }, sub: 'Kütlesiz çubuğa kütleler asılıyor.', go: '▶︎ Başlat' },
    { q: { t: 'Sol uçta 2 kg, sağ uçta (x = 8 m) 6 kg var. Kütle merkezi sol uçtan kaç m uzaktadır?', o: ['6 m', '4 m', '2 m', '5,3 m'], f: ['k9a', 'k9b'],
      s: [`x<sub>KM</sub> = ${F('2 · 0 + 6 · 8', '2 + 6')} = ${F('48', '8')} = <em>6 m</em> ✓`], n: ['Kütle merkezi her zaman ağır olan kütleye daha yakındır.'] } },
    { do: S => { S.m1 = 1; S.x1 = 0; S.m2 = 2; S.x2 = 3; S.m3 = 3; S.x3 = 6; }, q: { t: 'x = 0\'da 1 kg, x = 3 m\'de 2 kg, x = 6 m\'de 3 kg var. Kütle merkezi kaç m\'dedir?', o: ['4 m', '3 m', '2 m', '5 m'], f: ['k9a', 'k9b', 'k9c'],
      s: [`x<sub>KM</sub> = ${F('1 · 0 + 2 · 3 + 3 · 6', '1 + 2 + 3')} = ${F('24', '6')} = <em>4 m</em> ✓`], n: ['Pay: her kütle kendi konumuyla çarpılıp toplanır. Payda: toplam kütle.'] } },
    { do: S => { S.m1 = 0; S.m3 = 0; S.m2 = 2; S.x2 = 4; S.cubuk = 2; S.x1 = 0; }, q: { t: '4 m uzunluğunda 2 kg\'lık türdeş çubuğun sağ ucuna 2 kg\'lık cisim asılıyor. Sistemin kütle merkezi sol uçtan kaç m uzaktadır?', o: ['3 m', '2 m', '4 m', '2,5 m'],
      s: ['Türdeş çubuğun KM\'si ortasında: x = 2 m', `x<sub>KM</sub> = ${F('2 · 2 + 2 · 4', '2 + 2')} = ${F('12', '4')} = <em>3 m</em> ✓`], n: ['Türdeş çubuğu orta noktasında duran tek bir kütle gibi düşünebiliriz.'] } },
    { q: { t: 'Yatay zemindeki bir dolap ne zaman devrilmeye başlar?', o: ['Ağırlık merkezinden geçen düşey doğru taban alanının dışına çıkınca', 'Ağırlık merkezi tabandan yükselince', 'Kütlesi artınca', 'Taban alanı büyüyünce'],
      s: ['Ağırlık merkezinden geçen düşey doğru tabanın içindeyse ağırlığın torku dolabı geri döndürür.', 'Doğru tabanın dışına çıkınca tork devirme yönünde olur → <em>devrilir</em> ✓'], n: ['Geniş taban ve alçak ağırlık merkezi cismi daha kararlı yapar (yarış arabaları alçaktır).'] } },
  ] });
  konuEkle('AYT', 'Kütle ve Ağırlık Merkezi', { dersler: [d9], gorevler: [g9] });

  // =====================================================================
  // AYT 10 · BASİT MAKİNELER — sabit ve hareketli makara
  // =====================================================================
  const s10 = sahne({ icon: '🏗️', cam: [[0.7, 4, 12], [0.7, 3.4, 0]], plate: [10, 5, 0, 0],
    data: [['Makaralar', 'ağırlıksız, sürtünmesiz']],
    S0: () => ({ W: 80, mod: 'sabit', cek: 0, kos: 0 }),
    kur(g) {
      kutu(g, 7, 0.25, 1, 0x64748b, 0, 6.6, 0);
      const sab = silindir(g, 0.5, 0.5, 0.2, 0x94a3b8, 1, 6, 0); sab.rotation.x = Math.PI / 2;
      const har = silindir(g, 0.5, 0.5, 0.2, 0xcbd5e1, 0, 3, 0); har.rotation.x = Math.PI / 2;
      const yuk = kutu(g, 0.9, 0.9, 0.9, 0xef4444, 0, 2, 0), el = top(g, 0.1, 0xf1c27d, 1.5, 3, 0, { edge: false });
      kutu(g, 1.2, 1, 1.2, 0x78716c, 2.3, 0.5, 0);   // iskele
      const isci = FZ.insan(g, 0x0ea5e9, 1.5); isci.position.set(2.3, 1, 0); isci.rotation.y = Math.PI;   // ipi çeken kişi
      const ip = [FZ.cizgi(g, 0x111827), FZ.cizgi(g, 0x111827), FZ.cizgi(g, 0x111827), FZ.cizgi(g, 0x111827)];
      ip.forEach(l => { l.material.dashSize = 100; l.material.gapSize = 0; });
      etiket('b10f', 'F', '#dc2626'); etiket('b10w', 'G', '#7c3aed'); kart('b10t', '', '#F5C400');
      return { sab, har, yuk, el, isci, ip, oF: ok(0xef4444, 'b10f'), oW: ok(0x8b5cf6, 'b10w') };
    },
    tick(S, dt, o) {
      const h = S.mod === 'har'; if (S.kos) { S.cek = Math.min(2, S.cek + dt * 0.6); if (S.cek >= 2) S.kos = 0; }
      const yk = h ? S.cek / 2 : S.cek, Fk = h ? S.W / 2 : S.W;
      o.har.visible = h; const yy = 1.0 + yk; o.yuk.position.set(h ? 0 : 0.5, yy, 0);
      const elY = 4.2 - S.cek; o.el.position.set(1.5, elY, 0); [0, 1].forEach(i => FZ.koluUzat(o.isci, i, V3(1.55, elY, i ? -0.06 : 0.06)));
      o.ip.forEach(l => l.visible = false);
      if (h) { const hy = yy + 1; o.har.position.set(0, hy, 0);
        FZ.setLine(o.ip[0], [V3(-0.5, 6.5, 0), V3(-0.5, hy, 0)]); FZ.setLine(o.ip[1], [V3(0.5, hy, 0), V3(0.5, 6, 0)]);
        FZ.setLine(o.ip[2], [V3(1.5, 6, 0), V3(1.5, elY, 0)]); FZ.setLine(o.ip[3], [V3(0, hy, 0), V3(0, yy + 0.45, 0)]); }
      else { FZ.setLine(o.ip[0], [V3(0.5, 6, 0), V3(0.5, yy + 0.45, 0)]); FZ.setLine(o.ip[2], [V3(1.5, 6, 0), V3(1.5, elY, 0)]); }
      FZ.setArrow(o.oF, V3(1.5, elY - 0.2, 0.3), V3(0, -1, 0), Fk / 50); FZ.show('b10f', V3(1.85, elY - Fk / 50, 0.3), 1);
      FZ.setArrow(o.oW, o.yuk.position.clone().add(V3(0, 0, 0.6)), V3(0, -1, 0), S.W / 50); FZ.show('b10w', o.yuk.position.clone().add(V3(-0.4, -S.W / 50, 0.6)), 1);
      FZ.setTag('b10t', `G = ${S.W} N → F = ${fs(Fk)} N<br>ip: ${fs(S.cek)} m · yük: ${fs(yk)} m`); FZ.show('b10t', V3(-2.6, 4.5, 0), 1);
    },
    qp: () => V3(0, 7.3, 0) });
  const d10 = ders(s10, { yk: 'AYT10-d1', no: 1, icon: '🔧', name: 'Kuvvetten kazanç, yoldan kayıp', task: 'Sabit ve hareketli makara, kaldıraç, iş prensibi ve verim.', steps: [
    { k: { tur: 'merak', b: 'İnşaat işçisi ağır kovayı nasıl kolayca yukarı çeker?', m: ['Basit makineler kuvveti küçültür ya da yönünü değiştirir.', 'Ama bir bedeli vardır. Bakalım ne?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Sabit makara', m: ['Sabit makara yalnız kuvvetin <em>yönünü</em> değiştirir: F = G.', 'İpi 1 m çekersek yük 1 m yükselir.'] } },
    { sub: 'Sabit makarayla 80 N\'luk yükü çekelim.', go: '▶︎ Çek' },
    { do: S => { S.kos = 1; }, sub: 'İp 2 m çekiliyor…', until: S => !S.kos },
    { do: S => { S.mod = 'har'; S.cek = 0; }, p: { t: 'Aynı yükü hareketli makarayla kaldırırsak kaç N kuvvet gerekir?', o: ['80 N', '40 N', '160 N', '20 N'], d: 1 } },
    { sub: 'Hareketli makarayla çekelim.', go: '▶︎ Çek' },
    { do: S => { S.kos = 1; }, sub: 'İp 2 m çekiliyor; yükü iki ip taşıyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kuvvet yarıya indi, yol iki katına çıktı', f: ['b10t', 'b10f'], m: ['Yükü iki ip parçası taşır: 2F = G → F = 40 N.', 'İp 2 m çekildi, yük yalnız 1 m yükseldi.'] } },
    { k: { tur: 'kavram', b: 'İş prensibi', m: [`${FM('F · (ipin yolu) = G · (yükün yolu)')} · 40 · 2 = 80 · 1`, 'Basit makineler kuvvetten kazandırır ama <em>işten kazandırmaz</em>.'] } },
    { x: { b: 'Yükü değiştir', m: ['Hareketli makarada farklı yükler deneyin.'],
      kay: [{ ad: 'W', etiket: 'Yük (G)', min: 20, max: 200, adim: 20, deger: 80, birim: 'N', set: (S, v) => { S.W = v; } }],
      olc: S => `F = ${F('G', '2')} = <em>${fs(S._W / 2)} N</em> · kuvvet kazancı = ${F('G', 'F')} = 2` } },
    { do: S => { S.W = 80; S._W = 80; }, k: { tur: 'ornek', b: 'Kaldıraç', m: [`${FM('F · (kuvvet kolu) = G · (yük kolu)')}`, '2 m\'lik levyede destek yükten 0,4 m uzakta. 400 N\'luk yük için: F · 1,6 = 400 · 0,4 → F = 100 N.'] } },
    { k: { tur: 'dikkat', b: 'Verim', m: [`Gerçekte makara ağırlığı ve sürtünme vardır: ${FM(`verim = ${F('G · h', 'F · s')}`)} < %100`, 'Makara ağırlığı da ipler tarafından taşınır; hareketli makarada F = (G + G<sub>makara</sub>) / 2.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Sabit makara: F = G (yön değiştirir). Hareketli makara: F = G/2, yol 2 kat.', 'İş prensibi: kuvvetten kazanılan yoldan kaybedilir.'] } },
  ] });
  const g10 = gorev(s10, { yk: 'AYT10-g1', no: 1, icon: '🏗️', name: 'Yükü kaldır', task: 'Makara ve kaldıraçta gereken kuvveti ve ipin yolunu bulun.', data: [['Yük', 'G = 120 N'], ['Makaralar', 'ağırlıksız, sürtünmesiz']], steps: [
    { do: S => { S.W = 120; S.mod = 'sabit'; }, sub: '120 N\'luk yük sabit makaraya bağlı.', go: '▶︎ Başlat' },
    { q: { t: 'Sabit makarada 120 N\'luk yükü sabit hızla çekmek için kaç N kuvvet gerekir?', o: ['120 N', '60 N', '240 N', '30 N'], f: ['b10f', 'b10w'],
      s: ['Sabit makarada yükü tek ip taşır: <em>F = G = 120 N</em> ✓'], n: ['Sabit hız → net kuvvet sıfır.', 'Sabit makara kuvvet kazancı sağlamaz, yalnız yön değiştirir.'] } },
    { do: S => { S.mod = 'har'; S.cek = 0; }, q: { t: 'Aynı yük hareketli makaraya asılırsa kaç N kuvvet gerekir?', o: ['60 N', '120 N', '240 N', '40 N'], f: ['b10f', 'b10w'],
      s: ['İki ip parçası yükü taşır: 2F = 120', '<em>F = 60 N</em> ✓'], n: ['Hareketli makarada ipin her iki kolu da yukarı çeker.'] } },
    { do: S => { S.kos = 1; }, q: { t: 'Hareketli makarayla yükün 1,5 m yükselmesi için ip kaç m çekilmelidir?', o: ['3 m', '1,5 m', '0,75 m', '6 m'], f: ['b10t'],
      s: ['İş prensibi: F · s = G · h → 60 · s = 120 · 1,5', '<em>s = 3 m</em> ✓'], n: ['Kuvvet yarıya inince yol iki katına çıkar; iş değişmez.'] } },
    { q: { t: '2 m uzunluğunda kütlesiz levyede destek, ucundaki 400 N\'luk yükten 0,4 m uzakta. Diğer uca kaç N kuvvet uygulanmalıdır?', o: ['100 N', '400 N', '80 N', '1600 N'],
      s: ['Kuvvet kolu: 2 − 0,4 = 1,6 m', `F · 1,6 = 400 · 0,4 → F = ${F('160', '1,6')} = <em>100 N</em> ✓`], n: ['Destek yüke ne kadar yakınsa gereken kuvvet o kadar küçüktür.'] } },
  ] });
  konuEkle('AYT', 'Basit Makineler', { dersler: [d10], gorevler: [g10] });

  // =====================================================================
  // AYT 11 · ELEKTRİKSEL KUVVET VE ALAN — iki nokta yük ve P noktası (1 birim = 1 m)
  // =====================================================================
  const k = 9e9;
  const s11 = sahne({ icon: '⚡', cam: [[1.5, 4, 14], [1.5, 1.5, 0]], plate: [12, 5, 0, 0],
    data: [['k', '9 · 10⁹ N·m²/C²'], ['μC', '10⁻⁶ C']],
    S0: () => ({ q1: 4, q2: 4, x1: -3, x2: 3, xp: 1, ikinci: 1 }),
    kur(g) {
      const A = top(g, 0.3, 0xef4444, -3, 1, 0), B = top(g, 0.3, 0xef4444, 3, 1, 0), P = top(g, 0.1, 0x111827, 0, 1, 0);
      kutu(g, 10, 0.04, 0.04, 0x94a3b8, 0, 1, 0, { edge: false });
      etiket('e11a', 'q₁', '#dc2626'); etiket('e11b', 'q₂', '#dc2626'); etiket('e11p', 'P', '#111827');
      etiket('e11e1', 'E₁', '#ea580c'); etiket('e11e2', 'E₂', '#0891b2'); etiket('e11n', 'E<sub>net</sub>', '#16a34a'); kart('e11t', '', '#F5C400');
      return { A, B, P, o1: ok(0xf97316, 'e11e1'), o2: ok(0x06b6d4, 'e11e2'), on: ok(0x22c55e, 'e11n') };
    },
    tick(S, dt, o) {
      const renk = q => q > 0 ? 0xef4444 : 0x3b82f6;
      o.A.position.x = S.x1; o.B.position.x = S.x2; o.B.visible = !!S.ikinci; o.P.position.x = S.xp;
      o.A.material.color.setHex(renk(S.q1)); o.B.material.color.setHex(renk(S.q2));
      const alan = (q, x) => { const d = S.xp - x; return k * q * 1e-6 / (d * d) * Math.sign(d); }; // +x yönü pozitif
      const E1 = alan(S.q1, S.x1), E2 = S.ikinci ? alan(S.q2, S.x2) : 0, En = E1 + E2, L = E => Math.min(4, Math.abs(E) / 6000);
      const P = V3(S.xp, 1, 0);
      if (Math.abs(E1) > 1) { FZ.setArrow(o.o1, P.clone().add(V3(0, 0.45, 0)), V3(Math.sign(E1), 0, 0), L(E1)); FZ.show('e11e1', P.clone().add(V3(Math.sign(E1) * (L(E1) + 0.3), 0.45, 0)), 1); }
      if (Math.abs(E2) > 1) { FZ.setArrow(o.o2, P.clone().add(V3(0, 0.9, 0)), V3(Math.sign(E2), 0, 0), L(E2)); FZ.show('e11e2', P.clone().add(V3(Math.sign(E2) * (L(E2) + 0.3), 0.9, 0)), 1); }
      if (Math.abs(En) > 1) { FZ.setArrow(o.on, P.clone().add(V3(0, -0.45, 0)), V3(Math.sign(En), 0, 0), L(En)); FZ.show('e11n', P.clone().add(V3(Math.sign(En) * (L(En) + 0.4), -0.45, 0)), 1); }
      const yaz = q => `${q > 0 ? '+' : '−'}${Math.abs(q)} μC`;
      FZ.setTag('e11a', yaz(S.q1)); FZ.show('e11a', V3(S.x1, 0.4, 0), 1); FZ.setTag('e11b', yaz(S.q2)); FZ.show('e11b', V3(S.x2, 0.4, 0), S.ikinci ? 1 : 0); FZ.show('e11p', V3(S.xp, 0.6, 0), 1);
      FZ.setTag('e11t', `E<sub>net</sub> = ${bin(Math.abs(En))} N/C ${Math.abs(En) < 1 ? '' : En > 0 ? '(→)' : '(←)'}`); FZ.show('e11t', V3(0, 3.4, 0), 1);
    },
    qp: (at, S) => V3(S.xp, 2.7, 0) });
  const d11 = ders(s11, { yk: 'AYT11-d1', no: 1, icon: '🎈', name: 'Dokunmadan itmek', task: 'Coulomb kuvveti, elektrik alan, alanların vektörel toplamı, F = qE.', steps: [
    { k: { tur: 'merak', b: 'Sürtülmüş balon saçı dokunmadan nasıl kaldırır?', m: ['Yük, çevresindeki boşluğu "değiştirir": bu bölgeye elektrik alan denir.', 'Oraya gelen başka bir yük bu alan yüzünden kuvvet hisseder.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Coulomb kuvveti ve elektrik alan', m: [`${FM(`F = k ${F('q<sub>1</sub> q<sub>2</sub>', 'd<sup>2</sup>')}`)} · ${FM(`E = k ${F('q', 'd<sup>2</sup>')}`)} · ${FM('F = q · E')}`, 'Alan yönü: pozitif yükten <em>dışarı</em>, negatif yüke <em>doğru</em>.'] } },
    { do: S => { S.ikinci = 0; S.xp = -1; }, sub: 'Önce tek yük: q₁ = +4 μC, P noktası 2 m uzakta.', go: '▶︎ Devam' },
    { k: { tur: 'ornek', b: 'Tek yükün alanı', f: ['e11e1', 'e11t'], m: [`E = 9 · 10<sup>9</sup> · ${F('4 · 10<sup>−6</sup>', '2<sup>2</sup>')} = <em>9000 N/C</em>, yükten dışarı (sağa).`] } },
    { do: S => { S.ikinci = 1; S.xp = 1; }, p: { t: '+4 μC\'luk iki eşit yük 6 m arayla duruyor. Tam ortadaki noktada elektrik alan ne olur?', o: ['İki katına çıkar', 'Sıfır olur', 'Yalnız yukarı doğru olur', 'Değişmez'], d: 1 } },
    { sub: 'P noktasını ortaya getirelim.', go: '▶︎ Ortaya getir' },
    { do: S => { S.hedef = 0; }, sub: 'P orta noktaya kayıyor…', until: S => { S.xp = Math.max(0, S.xp - 0.02); return S.xp <= 0; } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Alanlar vektörel toplanır', f: ['e11t'], m: ['Ortada E₁ sağa, E₂ sola ve eşit büyüklükte → <em>E<sub>net</sub> = 0</em>.', 'Ortaya bırakılan bir yük kuvvet hissetmez.'] } },
    { x: { b: 'P noktasını kaydır', m: ['P\'yi iki yük arasında gezdirin; okların boyları gerçek oranlı.'],
      kay: [{ ad: 'xp', etiket: 'P konumu', min: -2, max: 2, adim: 0.5, deger: 0, birim: 'm', set: (S, v) => { S.xp = v; } }],
      olc: S => { const e1 = k * 4e-6 / (S._xp + 3) ** 2, e2 = k * 4e-6 / (3 - S._xp) ** 2; return `E₁ = ${bin(e1)} N/C (→) · E₂ = ${bin(e2)} N/C (←)<br>E<sub>net</sub> = <em>${bin(Math.abs(e1 - e2))} N/C</em>`; } } },
    { do: S => { S.xp = 0; }, k: { tur: 'dikkat', b: 'Negatif yükün kuvveti alana zıttır', m: ['Alan yönü, oraya konan <em>pozitif</em> deneme yükünün kuvvet yönüdür.', 'Negatif yük alanın tersine itilir. Yüklerden biri negatif olsaydı ortadaki alanlar toplanırdı.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`E = k ${F('q', 'd<sup>2</sup>')}`)} (vektör) · ${FM('F = q E')} · birden çok yükte alanlar vektörel toplanır.`] } },
  ] });
  const g11 = gorev(s11, { yk: 'AYT11-g1', no: 1, icon: '⚡', name: 'Alanı ölç', task: 'Nokta yüklerin oluşturduğu elektrik alanı ve kuvveti hesaplayın.', data: [['k', '9 · 10⁹ N·m²/C²'], ['μC', '10⁻⁶ C']], steps: [
    { do: S => { S.ikinci = 0; S.q1 = 9; S.x1 = -3; S.xp = 0; }, sub: '+9 μC\'luk yükten 3 m uzaktaki P noktası.', go: '▶︎ Başlat' },
    { q: { t: '+9 μC\'luk yükün 3 m uzaktaki P noktasında oluşturduğu elektrik alanın büyüklüğü kaç N/C\'dir?', o: ['9000 N/C', '27 000 N/C', '3000 N/C', '81 000 N/C'], f: ['e11e1'],
      s: [`E = 9 · 10<sup>9</sup> · ${F('9 · 10<sup>−6</sup>', '3<sup>2</sup>')} = 9 · 10<sup>9</sup> · 10<sup>−6</sup> = <em>9000 N/C</em> ✓`], n: ['Alan uzaklığın karesiyle azalır: uzaklık 3 kat → alan 9\'da 1.'] } },
    { q: { t: 'P noktasına +2 μC\'luk yük konursa yüke etki eden kuvvet kaç N olur?', o: ['0,018 N', '0,009 N', '18 N', '4500 N'],
      s: [`${FM('F = q E')} = 2 · 10<sup>−6</sup> · 9000 = <em>0,018 N</em> ✓ (alan yönünde)`], n: ['Yük negatif olsaydı kuvvetin büyüklüğü aynı, yönü alana zıt olurdu.'] } },
    { do: S => { S.ikinci = 1; S.q1 = 4; S.q2 = 4; S.x1 = -3; S.x2 = 3; S.xp = 0; }, q: { t: '+4 μC\'luk iki yük 6 m aralıklı. Tam orta noktada bileşke elektrik alan kaç N/C\'dir?', o: ['0', '8000 N/C', '4000 N/C', '16 000 N/C'], f: ['e11e1', 'e11e2', 'e11t'],
      s: ['E₁ = E₂ = 9 · 10<sup>9</sup> · 4 · 10<sup>−6</sup> / 9 = 4000 N/C', 'Zıt yönlü ve eşit → <em>E<sub>net</sub> = 0</em> ✓'], n: ['Pozitif yüklerin alanları dışarı doğru: ortada biri sağa, diğeri sola.'] } },
    { do: S => { S.q1 = 1; S.q2 = 4; S.x1 = -1.5; S.x2 = 1.5; S.xp = -0.5; }, q: { t: '+1 μC ve +4 μC\'luk yükler 3 m aralıklı. Aralarında alanın sıfır olduğu nokta +1 μC\'luk yükten kaç m uzaktadır?', o: ['1 m', '2 m', '1,5 m', '0,6 m'], f: ['e11t'],
      s: [`k ${F('1', 'x<sup>2</sup>')} = k ${F('4', '(3 − x)<sup>2</sup>')} → ${F('3 − x', 'x')} = 2`, '<em>x = 1 m</em> ✓ (küçük yüke yakın)'], n: ['Aynı işaretli yüklerde sıfır noktası aradadır ve küçük yüke yakındır.'] } },
  ] });
  konuEkle('AYT', 'Elektriksel Kuvvet ve Alan', { dersler: [d11], gorevler: [g11] });

  // =====================================================================
  // AYT 12 · ELEKTRİKSEL POTANSİYEL — eş potansiyel halkaları ve deneme yükü
  // =====================================================================
  const s12 = sahne({ icon: '🔋', cam: [[1.4, 10, 8], [1.4, 0, 0]], plate: [10, 10, 0, 0],
    data: [['Q', '+6 μC'], ['k', '9 · 10⁹ N·m²/C²']],
    S0: () => ({ Q: 6, r: 3, hedef: 3 }),
    kur(g) {
      const Q = top(g, 0.35, 0xef4444, 0, 0.4, 0), q = top(g, 0.15, 0xf97316, 3, 0.4, 0);
      [1, 2, 3, 4].forEach(r => { const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(V3(r * Math.cos(a), 0.05, r * Math.sin(a))); } FZ.cizgi(g, 0x0891b2, pts); });
      [1, 2, 3, 4].forEach(r => kart('v12r' + r, '', '#0891b2'));
      etiket('v12F', 'F', '#dc2626'); kart('v12t', '', '#F5C400');
      return { Q, q, oF: ok(0xef4444, 'v12F') };
    },
    tick(S, dt, o) {
      S.r += (S.hedef - S.r) * Math.min(1, dt * 2);
      o.q.position.x = S.r;
      [1, 2, 3, 4].forEach(r => { FZ.setTag('v12r' + r, `${bin(k * S.Q * 1e-6 / r)} V`); FZ.show('v12r' + r, V3(-r * 0.71, 0.1, r * 0.71), 0.9); });
      const E = k * S.Q * 1e-6 / (S.r * S.r);
      FZ.setArrow(o.oF, V3(S.r + 0.15, 0.4, 0), V3(1, 0, 0), Math.min(3, E / 6000)); FZ.show('v12F', V3(S.r + Math.min(3, E / 6000) + 0.4, 0.4, 0), 1);
      FZ.setTag('v12t', `r = ${fs(S.r)} m · V = ${bin(k * S.Q * 1e-6 / S.r)} V`); FZ.show('v12t', V3(2, 0.4, -2.5), 1);
    },
    qp: (at, S) => V3(S.r, 1.6, 0) });
  const d12 = ders(s12, { yk: 'AYT12-d1', no: 1, icon: '⛰️', name: 'Elektriğin "yüksekliği"', task: 'Elektriksel potansiyel, potansiyel fark, iş ve elektriksel potansiyel enerji.', steps: [
    { k: { tur: 'merak', b: 'Pilin üzerindeki "1,5 V" ne anlatır?', m: ['Bir topu yukarı taşımak iş ister; tepedeki top enerji depolar.', 'Pozitif yükü pozitif yüke yaklaştırmak da iş ister. Bu "elektrik yüksekliğine" potansiyel denir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Potansiyel', m: [`${FM(`V = k ${F('Q', 'd')}`)} (skaler, volt) · ${FM('W = q · ΔV')}`, 'Mavi halkalar <em>eş potansiyel</em> çizgileridir: üzerindeki her noktanın potansiyeli aynıdır.'] } },
    { p: { t: 'Q\'dan 2 m uzaktaki potansiyel, 4 m uzaktakinin kaç katıdır?', o: ['2 katı', '4 katı', 'Yarısı', 'Eşit'], d: 0 } },
    { sub: 'Deneme yükünü 4 m\'den 2 m\'ye getirelim.', go: '▶︎ Yaklaştır' },
    { do: S => { S.r = 4; S.hedef = 2; }, sub: 'Yük yaklaşıyor; itme kuvveti büyüyor…', wait: 3 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Potansiyel 1/d ile, alan 1/d² ile değişir', f: ['v12t', 'v12r2', 'v12r4'], m: [`V(2 m) = 27 000 V · V(4 m) = 13 500 V → <em>2 katı</em> (uzaklıkla ters orantılı).`, 'Kırmızı ok (kuvvet) ise 4 kat büyüdü: alan uzaklığın karesiyle ters orantılı.'] } },
    { x: { b: 'Uzaklığı değiştir', m: ['Deneme yükünü halkalar arasında gezdirin.'],
      kay: [{ ad: 'r', etiket: 'Uzaklık', min: 1, max: 4, adim: 0.5, deger: 2, birim: 'm', set: (S, v) => { S.hedef = v; } }],
      olc: S => `V = ${F('9 · 10<sup>9</sup> · 6 · 10<sup>−6</sup>', fs(S._r))} = <em>${bin(54000 / S._r)} V</em> · E = <em>${bin(54000 / S._r ** 2)} N/C</em>` } },
    { k: { tur: 'ornek', b: 'İş ve potansiyel enerji', m: [`2 μC\'luk yükü 3 m\'den (18 000 V) 1 m\'ye (54 000 V) taşımak için: W = q ΔV = 2 · 10<sup>−6</sup> · 36 000 = 0,072 J`, `İki yükün potansiyel enerjisi: ${FM(`U = k ${F('q<sub>1</sub> q<sub>2</sub>', 'd')}`)}`] } },
    { k: { tur: 'dikkat', b: 'Potansiyel skalerdir', m: ['Birden çok yükte potansiyeller <em>işaretleriyle</em> cebirsel toplanır, yön yoktur.', '+q ve −q\'nun tam ortasında V = 0 olur ama E ≠ 0! Eş potansiyel çizgisi boyunca yük taşımak iş gerektirmez.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`V = k ${F('Q', 'd')}`)} · ${FM('W = q ΔV')} · ${FM(`U = k ${F('q<sub>1</sub>q<sub>2</sub>', 'd')}`)}`] } },
  ] });
  const g12 = gorev(s12, { yk: 'AYT12-g1', no: 1, icon: '🔋', name: 'Yükü taşı', task: 'Potansiyel, potansiyel fark, iş ve potansiyel enerji hesaplayın.', data: [['Q', '+6 μC'], ['k', '9 · 10⁹ N·m²/C²'], ['μC', '10⁻⁶ C']], steps: [
    { do: S => { S.r = 3; S.hedef = 3; }, sub: '+6 μC\'luk yük merkezde, deneme yükü 3 m uzakta.', go: '▶︎ Başlat' },
    { q: { t: '+6 μC\'luk yükten 3 m uzaktaki noktanın potansiyeli kaç V\'tur?', o: ['18 000 V', '6000 V', '54 000 V', '9000 V'], f: ['v12r3', 'v12t'],
      s: [`V = 9 · 10<sup>9</sup> · ${F('6 · 10<sup>−6</sup>', '3')} = <em>18 000 V</em> ✓`], n: ['Potansiyelde uzaklığın karesi değil kendisi vardır.'] } },
    { q: { t: '+4 μC ve −4 μC\'luk yüklerin tam orta noktasında potansiyel kaç V\'tur?', o: ['0', 'Sıfırdan büyük', 'Sıfırdan küçük', 'Sonsuz'],
      s: ['V = k(+4)/d + k(−4)/d', '<em>V = 0</em> ✓ (ama elektrik alan sıfır değildir)'], n: ['Potansiyel skalerdir: işaretleriyle toplanır.', 'Sık yanlış: V = 0 olan yerde E de sıfır sanmak.'] } },
    { do: S => { S.hedef = 1.5; }, q: { t: '2 μC\'luk yük potansiyeli 1000 V olan noktadan 4000 V olan noktaya taşınıyor. Yapılması gereken iş kaç J\'dür?', o: ['0,006 J', '0,008 J', '0,002 J', '6000 J'],
      s: [`${FM('W = q ΔV')} = 2 · 10<sup>−6</sup> · (4000 − 1000)`, '= <em>6 · 10<sup>−3</sup> J = 0,006 J</em> ✓'], n: ['Pozitif yükü yüksek potansiyele taşımak dışarıdan iş ister.'] } },
    { q: { t: '2 μC ve 3 μC\'luk iki yük 0,3 m aralıklıdır. Sistemin elektriksel potansiyel enerjisi kaç J\'dür?', o: ['0,18 J', '0,6 J', '0,054 J', '1,8 J'],
      s: [`${FM(`U = k ${F('q<sub>1</sub> q<sub>2</sub>', 'd')}`)} = 9 · 10<sup>9</sup> · ${F('6 · 10<sup>−12</sup>', '0,3')}`, '= <em>0,18 J</em> ✓'], n: ['U skalerdir; yükler aynı işaretliyse pozitif, zıt işaretliyse negatiftir.'] } },
  ] });
  konuEkle('AYT', 'Elektriksel Potansiyel', { dersler: [d12], gorevler: [g12] });
})();
