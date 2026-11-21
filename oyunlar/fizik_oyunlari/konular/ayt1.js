// AYT 1 · Vektörler — AYT 2 · Bağıl Hareket — AYT 3 · Newton'un Hareket Yasaları — AYT 4 · Bir Boyutta Sabit İvmeli Hareket
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, levha, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');
  const rad = d => d * Math.PI / 180;

  // =====================================================================
  // AYT 1 · VEKTÖRLER — zeminde iki vektör ve bileşke (uç uca ekleme)
  // =====================================================================
  const s1 = sahne({ icon: '➡️', cam: [[1, 10, 8], [1.5, 0, -1]], plate: [14, 11, 1, -1],
    data: [['Bileşke', 'R = A + B (vektörel)']],
    S0: () => ({ A: 3, B: 4, th: 90, uc: 0, R: 0, bil: 0 }),
    kur(g) { etiket('v1A', 'A', '#dc2626'); etiket('v1B', 'B', '#2563eb'); etiket('v1R', 'R', '#16a34a'); kart('v1t', '', '#F5C400');
      return { oA: ok(0xef4444, 'v1A'), oB: ok(0x3b82f6, 'v1B'), oR: ok(0x22c55e, 'v1R') }; },
    tick(S, dt, o) {
      if (S.uc > 0 && S.uc < 1) S.uc = Math.min(1, S.uc + dt * 0.6);
      const k = 0.55, O = V3(-2, 0.2, 2), a = V3(S.A * k, 0, 0), b = V3(Math.cos(rad(S.th)) * S.B * k, 0, -Math.sin(rad(S.th)) * S.B * k);
      FZ.setArrow(o.oA, O, a, a.length()); FZ.show('v1A', O.clone().add(a.clone().multiplyScalar(0.5)).add(V3(0, 0, 0.5)), 1);
      const bB = O.clone().add(a.clone().multiplyScalar(FZ.ease(S.uc)));
      FZ.setArrow(o.oB, bB, b, b.length()); FZ.show('v1B', bB.clone().add(b.clone().multiplyScalar(0.5)).add(V3(0.4, 0, 0)), 1);
      const r = a.clone().add(b), R = Math.sqrt(S.A ** 2 + S.B ** 2 + 2 * S.A * S.B * Math.cos(rad(S.th)));
      if (S.bil) { FZ.setArrow(o.oR, O.clone().add(V3(0, 0.05, 0)), r, Math.max(0.05, r.length())); FZ.show('v1R', O.clone().add(r.clone().multiplyScalar(0.5)).add(V3(-0.4, 0, 0)), 1); }
      FZ.setTag('v1t', `A = ${fs(S.A)} · B = ${fs(S.B)} · açı = ${S.th}°${S.bil ? ` · R = ${fs(R)}` : ''}`); FZ.show('v1t', V3(1.5, 0.2, 3.6), 1);
    } });
  const d1 = ders(s1, { yk: 'AYT1-d1', no: 1, icon: '🧭', name: 'İki kuvvet birleşince', task: 'Vektörel toplama, uç uca ekleme, bileşkenin sınırları, bileşenlere ayırma.', steps: [
    { k: { tur: 'merak', b: 'İki kişi bir kutuyu farklı yönlere çekerse kutu nereye gider?', m: ['Birisi doğuya 3 N, diğeri kuzeye 4 N çekiyor. Kutu 7 N\'luk kuvvetle mi çekilir?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Vektör nedir?', m: ['Büyüklüğü ve <em>yönü</em> olan nicelik: kuvvet, hız, ivme, yer değiştirme.', 'Vektörler toplanırken yönleri hesaba katılır: <em>uç uca ekleme</em> yöntemi.'] } },
    { p: { t: '3 N doğuya ve 4 N kuzeye çeken iki kuvvetin bileşkesi kaç N\'dur?', o: ['7 N', '1 N', '5 N', '12 N'], d: 2 } },
    { sub: 'B vektörünü A\'nın ucuna taşıyalım.', go: '▶︎ Uç uca ekle' },
    { do: S => { S.uc = 0.01; }, sub: 'B vektörü kayıyor…', until: S => S.uc >= 1 },
    { do: S => { S.bil = 1; }, k: { tur: 'gozlem', sonuc: true, b: 'Bileşke', f: ['v1R', 'v1t'], m: ['A\'nın başlangıcından B\'nin ucuna çizilen vektör: <em>bileşke</em> (R).', `Dik vektörlerde ${FM(`R = ${SQ('A² + B²')}`)} = ${SQ('9 + 16')} = 5 N`] } },
    { x: { b: 'Açıyı değiştir', m: ['İki vektör arasındaki açıyı değiştirin; bileşke nasıl değişiyor?'],
      kay: [{ ad: 'th', etiket: 'Aradaki açı', min: 0, max: 180, adim: 30, deger: 90, birim: '°', set: (S, v) => { S.th = v; } }],
      olc: S => `${FM('R² = A² + B² + 2AB cos θ')}<br>θ = ${S._th}° → R = <em>${fs(Math.sqrt(9 + 16 + 24 * Math.cos(rad(S._th))))}</em><br>Aynı yön (0°): R = A + B = 7 · zıt yön (180°): R = |A − B| = 1` } },
    { do: S => { S.th = 90; S._th = 90; }, k: { tur: 'dikkat', b: 'Bileşkenin sınırları', m: [`${FM('|A − B| ≤ R ≤ A + B')} · 3 N ve 4 N\'luk kuvvetlerin bileşkesi 1 N ile 7 N arasındadır.`, 'Eşit büyüklükte iki vektör arasındaki açı 120° ise bileşke yine aynı büyüklüktedir.'] } },
    { k: { tur: 'ornek', b: 'Bileşenlere ayırma', m: ['Yatayla 37° açı yapan 10 N\'luk kuvvet (sin 37° = 0,6, cos 37° = 0,8):', `${FM('F<sub>x</sub> = F · cos θ')} = 8 N · ${FM('F<sub>y</sub> = F · sin θ')} = 6 N`, 'Bileşenler toplanırsa vektörün kendisi elde edilir.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Uç uca ekleme: bileşke ilkinin başından sonuncunun ucuna.', `${FM('R² = A² + B² + 2AB cos θ')} · ${FM('|A − B| ≤ R ≤ A + B')}`] } },
  ] });
  const g1 = gorev(s1, { yk: 'AYT1-g1', no: 1, icon: '📐', name: 'Bileşkeyi bul', task: 'Vektörlerin bileşkesini, sınırlarını ve bileşenlerini hesaplayın.', steps: [
    { do: S => { S.A = 6; S.B = 8; S.th = 90; }, sub: 'Birbirine dik 6 N ve 8 N\'luk iki kuvvet.', go: '▶︎ Uç uca ekle' },
    { do: S => { S.uc = 0.01; }, q: { t: 'Birbirine dik 6 N ve 8 N\'luk iki kuvvetin bileşkesi kaç N\'dur?', o: ['10 N', '14 N', '2 N', '48 N'], f: ['v1A', 'v1B'],
      s: [`${FM(`R = ${SQ('A² + B²')}`)} = ${SQ('36 + 64')} = ${SQ('100')} = <em>10 N</em> ✓`], n: ['Dik vektörlerde bileşke dik üçgenin hipotenüsüdür (6-8-10 üçgeni).'] } },
    { do: S => { S.bil = 1; S.A = 10; S.B = 10; S.th = 120; }, q: { t: 'Aralarında 120° açı bulunan 10 N\'luk iki kuvvetin bileşkesi kaç N\'dur?', o: ['10 N', '20 N', '0', '17,3 N'], f: ['v1R', 'v1t'],
      s: [`R² = 100 + 100 + 2 · 10 · 10 · cos 120° = 200 − 100 = 100`, '<em>R = 10 N</em> ✓'], n: ['cos 120° = −0,5. Eşit iki vektör arasında 120° varsa bileşke onlarla aynı büyüklüktedir (eşkenar üçgen).'] } },
    { do: S => { S.A = 5; S.B = 12; S.th = 60; }, q: { t: '5 N ve 12 N\'luk iki kuvvetin bileşkesi aşağıdakilerden hangisi <b>olamaz</b>?', o: ['20 N', '7 N', '13 N', '17 N'],
      s: [`${FM('|A − B| ≤ R ≤ A + B')} → 7 N ≤ R ≤ 17 N`, '20 N bu aralıkta değildir ✓'], n: ['Bileşke en büyük aynı yönde (0°), en küçük zıt yönde (180°) olur.'] } },
    { q: { t: 'Yatayla 37° açı yapan 20 N\'luk kuvvetin <b>yatay</b> bileşeni kaç N\'dur? (sin 37° = 0,6, cos 37° = 0,8)', o: ['16 N', '12 N', '20 N', '10 N'],
      s: [`${FM('F<sub>x</sub> = F · cos θ')} = 20 · 0,8 = <em>16 N</em> ✓`, '(düşey bileşen 12 N)'], n: ['Açının yanındaki bileşen cos, karşısındaki bileşen sin ile hesaplanır.'] } },
  ] });
  konuEkle('AYT', 'Vektörler', { dersler: [d1], gorevler: [g1] });

  // =====================================================================
  // AYT 2 · BAĞIL HAREKET — akıntılı nehirde kayık
  // =====================================================================
  const s2 = sahne({ icon: '🚣', cam: [[0, 11, 8], [0, 0, -0.5]], plate: [16, 10, 0, 0],
    data: [['Nehir genişliği', 'görevde verilir']],
    S0: () => ({ vk: 4, va: 3, gen: 60, kos: 0, tt: 0 }),
    kur(g) {
      kutu(g, 16, 0.05, 6, 0x1d4ed8, 0, 0.03, 0, { op: 0.6, edge: false, cast: false });
      kutu(g, 16, 0.3, 1.5, 0x16a34a, 0, 0.15, 3.75); kutu(g, 16, 0.3, 1.5, 0x16a34a, 0, 0.15, -3.75);
      const cizg = []; for (let i = 0; i < 14; i++) cizg.push(kutu(g, 0.8, 0.02, 0.06, 0x93c5fd, -7 + i * 1.1, 0.08, -2.2 + (i % 5) * 1.1, { edge: false, cast: false }));
      const kayik = new THREE.Group(); g.add(kayik);
      { kutu(kayik, 0.5, 0.22, 0.8, 0xb45309, 0, 0.16, 0.05); kutu(kayik, 0.42, 0.05, 0.72, 0xfde68a, 0, 0.26, 0.05, { edge: false });   // gövde ve içi (−z: burun)
        const burun = FZ.mesh(new THREE.ConeGeometry(0.25, 0.4, 4), 0xb45309); burun.rotation.set(-Math.PI / 2, Math.PI / 4, 0); burun.scale.set(1, 1, 0.9); burun.position.set(0, 0.16, -0.55); kayik.add(burun);
        kutu(kayik, 0.5, 0.04, 0.12, 0x78350f, 0, 0.3, 0.15, { edge: false });                       // oturak
        FZ.silindir(kayik, 0.09, 0.11, 0.26, 0xdc2626, 0, 0.45, 0.15); FZ.top(kayik, 0.08, 0xf5c09a, 0, 0.66, 0.15, { edge: false });   // kürekçi (can yeleği kırmızı)
        const kurek = FZ.silindir(kayik, 0.02, 0.02, 1.1, 0x92400e, 0, 0.42, 0.1, { edge: false }); kurek.rotation.z = Math.PI / 2; }
      const iz = FZ.cizgi(g, 0xfacc15);
      etiket('b2k', 'v<sub>kayık</sub>', '#dc2626'); etiket('b2a', 'v<sub>akıntı</sub>', '#2563eb'); etiket('b2y', 'v<sub>yere göre</sub>', '#16a34a'); kart('b2t', '', '#F5C400');
      return { cizg, kayik, iz, ok_: ok(0xef4444, 'b2k'), oa: ok(0x3b82f6, 'b2a'), oy: ok(0x22c55e, 'b2y') };
    },
    tick(S, dt, o) {
      const olc = 6 / S.gen;                                                   // 1 m → olc birim
      o.cizg.forEach(c => { c.position.x += S.va * olc * dt * 3; if (c.position.x > 8) c.position.x -= 16; });
      if (S.kos) { S.tt += dt * 3; if (S.tt >= S.gen / S.vk) { S.tt = S.gen / S.vk; S.kos = 0; } }
      const x = -5 + S.va * S.tt * olc, z = 3 - S.vk * S.tt * olc; o.kayik.position.set(x, 0, z);
      FZ.setLine(o.iz, [V3(-5, 0.1, 3), V3(x, 0.1, z)]);
      const b = V3(x, 0.5, z), K = 0.25;
      FZ.setArrow(o.ok_, b, V3(0, 0, -1), S.vk * K); FZ.show('b2k', b.clone().add(V3(-0.5, 0, -S.vk * K - 0.3)), 1);
      FZ.setArrow(o.oa, b, V3(1, 0, 0), S.va * K); FZ.show('b2a', b.clone().add(V3(S.va * K + 0.6, 0, 0.3)), S.va ? 1 : 0);
      const vy = V3(S.va, 0, -S.vk); FZ.setArrow(o.oy, b.clone().add(V3(0, 0.05, 0)), vy, vy.length() * K); FZ.show('b2y', b.clone().add(vy.clone().multiplyScalar(K)).add(V3(0.6, 0, -0.3)), 1);
      FZ.setTag('b2t', `t = ${fs(S.tt)} s · kayma = ${fs(S.va * S.tt)} m`); FZ.show('b2t', V3(4, 0.4, 3.9), S.tt > 0 ? 1 : 0);
    },
    qp: (at, S, o) => o.kayik.position.clone().add(V3(0, 1.5, 0)) });
  const d2 = ders(s2, { yk: 'AYT2-d1', no: 1, icon: '🌊', name: 'Kime göre hareket?', task: 'Bağıl hız, akıntıda karşıya geçme süresi ve kayma miktarı.', steps: [
    { k: { tur: 'merak', b: 'Trende yürüyen kişi ne kadar hızlıdır?', m: ['Tren 20 m/s, içindeki yolcu ileri doğru 1 m/s yürüyor. Yolcunun hızı 1 m/s mi, 21 m/s mi?', 'Cevap: <em>kime göre</em> sorduğumuza bağlı.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Bağıl hız', m: [`Gözlemciye göre hız: ${FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>')}`, 'Aynı yönde giden araçlar birbirini yavaş, zıt yönde gidenler hızlı görür.'] } },
    { p: { t: 'Kayık burnunu karşı kıyıya dik tutarak suya göre 4 m/s ile gidiyor. Akıntı 3 m/s. Kayık nereye varır?', o: ['Tam karşı noktaya', 'Akıntı yönünde kayarak karşıya', 'Akıntıya ters yönde', 'Hiç karşıya geçemez'], d: 1 } },
    { sub: 'Kayığı yüzdürelim.', go: '▶︎ Kürek çek' },
    { do: S => { S.kos = 1; }, sub: 'Kayık karşıya geçiyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Hızlar vektörel toplanır', f: ['b2y', 'b2t'], m: [`Yere göre hız: ${SQ('4² + 3²')} = 5 m/s (yeşil ok).`, `Karşıya geçiş süresi yalnız dik bileşene bağlı: ${FM(`t = ${F('d', 'v<sub>kayık</sub>')}`)} = ${F('60', '4')} = 15 s`, 'Kayma: x = v<sub>akıntı</sub> · t = 3 · 15 = 45 m'] } },
    { x: { b: 'Akıntıyı değiştir', m: ['Akıntı hızını değiştirin. Karşıya geçme süresi değişiyor mu?'],
      kay: [{ ad: 'va', etiket: 'Akıntı hızı', min: 0, max: 6, adim: 1, deger: 3, birim: 'm/s', set: (S, v) => { S.va = v; } }],
      olc: S => `t = ${F('60', '4')} = <em>15 s</em> (akıntıdan bağımsız)<br>kayma = ${S._va} · 15 = <em>${S._va * 15} m</em>` } },
    { do: S => { S.va = 3; S._va = 3; }, k: { tur: 'dikkat', b: 'Süreyi akıntı değiştirmez', m: ['Sık yanlış: "Akıntı hızlanırsa karşıya geçmek uzun sürer."', 'Kayık suya göre karşıya dik gidiyorsa süre yalnız d / v<sub>kayık</sub>\'tır; akıntı yalnız <em>kaymayı</em> değiştirir.'] } },
    { k: { tur: 'ornek', b: 'Çözümlü örnek', m: ['Aynı yolda A 25 m/s, B 15 m/s ile gidiyor.', 'Aynı yönde: A\'ya göre B\'nin hızı 15 − 25 = <em>−10 m/s</em> (A, B\'yi geride kalıyor görür).', 'Zıt yönde: bağıl hız büyüklüğü 25 + 15 = <em>40 m/s</em>.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>')} · ${FM(`t = ${F('d', 'v<sub>dik</sub>')}`)} · kayma = v<sub>akıntı</sub> · t`] } },
  ] });
  const g2 = gorev(s2, { yk: 'AYT2-g1', no: 1, icon: '🛶', name: 'Nehri geç', task: 'Kayığın karşıya geçme süresini, kaymasını ve yere göre hızını bulun.', data: [['Nehir genişliği', '48 m'], ['Kayığın suya göre hızı', '4 m/s (karşıya dik)'], ['Akıntı hızı', '3 m/s']], steps: [
    { do: S => { S.gen = 48; }, sub: 'Kayık karşıya dik doğrultuda kürek çekecek.', go: '▶︎ Başlat' },
    { q: { t: 'Nehir 48 m genişliğinde; kayık suya göre 4 m/s ile karşıya dik gidiyor. Karşıya kaç saniyede geçer?', o: ['12 s', '16 s', '9,6 s', '48 s'], f: ['b2k'],
      s: [`${FM(`t = ${F('d', 'v<sub>kayık</sub>')}`)} = ${F('48', '4')} = <em>12 s</em> ✓`], n: ['Karşıya geçiş süresi yalnızca kıyıya dik hız bileşenine bağlıdır.'] } },
    { do: S => { S.kos = 1; }, sub: 'Kayık karşıya geçiyor…', until: S => !S.kos },
    { q: { t: 'Akıntı 3 m/s ise kayık karşı kıyıda başlangıç noktasının kaç m aşağısına varır?', o: ['36 m', '48 m', '12 m', '60 m'], f: ['b2t', 'b2a'],
      s: [`x = v<sub>akıntı</sub> · t = 3 · 12 = <em>36 m</em> ✓`], n: ['Akıntı kayığı süre boyunca kendi yönünde taşır.'] } },
    { q: { t: 'Kayığın yere göre hızının büyüklüğü kaç m/s\'dir?', o: ['5 m/s', '7 m/s', '1 m/s', '12 m/s'], f: ['b2y'],
      s: ['§1. YOL · vektörel toplama', `v = ${SQ('4² + 3²')} = <em>5 m/s</em> ✓`, '§2. YOL · yol ÷ süre', `yer değiştirme = ${SQ('48² + 36²')} = 60 m → ${F('60', '12')} = <em>5 m/s</em> ✓`], n: ['Hızlar vektörlerdir: dik hızlar Pisagor ile toplanır.'] } },
    { q: { t: 'Aynı yolda zıt yönlerde 20 m/s ve 15 m/s ile giden iki aracın birbirine göre hızlarının büyüklüğü kaç m/s\'dir?', o: ['35 m/s', '5 m/s', '20 m/s', '300 m/s'],
      s: ['Zıt yönde hızlar: +20 ve −15', `|v<sub>bağıl</sub>| = |20 − (−15)| = <em>35 m/s</em> ✓`], n: ['Aynı yönde gitselerdi bağıl hız 5 m/s olurdu.'] } },
  ] });
  konuEkle('AYT', 'Bağıl Hareket', { dersler: [d2], gorevler: [g2] });

  // =====================================================================
  // AYT 3 · NEWTON'UN HAREKET YASALARI — masada blok, makaradan sarkan kütle
  // =====================================================================
  const s3 = sahne({ icon: '🧱', cam: [[0.5, 4.5, 11], [0.5, 2.2, 0]], plate: [12, 6, 0, 0],
    data: [['g', '10 m/s²'], ['İp', 'kütlesiz, makara sürtünmesiz']],
    S0: () => ({ mA: 3, mB: 2, k: 0, x: 0, v: 0, kos: 0 }),
    kur(g) {
      kutu(g, 7, 0.3, 2, 0x92400e, -1, 2.85, 0); for (const x of [-4.2, 2.2]) kutu(g, 0.25, 2.7, 0.25, 0x78350f, x, 1.35, 0.7);
      const mak = silindir(g, 0.3, 0.3, 0.2, 0x64748b, 2.6, 3.3, 0); mak.rotation.x = Math.PI / 2;
      const A = kutu(g, 1, 0.8, 0.8, 0x3b82f6, 0, 3.4, 0), B = kutu(g, 0.6, 0.6, 0.6, 0xef4444, 2.9, 1.8, 0);
      const ip1 = silindir(g, 0.02, 0.02, 1, 0x111827, 0, 3.4, 0, { edge: false }), ip2 = silindir(g, 0.02, 0.02, 1, 0x111827, 2.9, 2.5, 0, { edge: false }); ip1.rotation.z = Math.PI / 2;
      etiket('n3a', 'a', '#9333ea'); etiket('n3T', 'T', '#7c3aed'); etiket('n3G', 'm<sub>B</sub>g', '#dc2626'); etiket('n3f', 'f<sub>s</sub>', '#ea580c'); kart('n3t', '', '#F5C400');
      return { A, B, ip1, ip2, oa: ok(0xa855f7, 'n3a'), oT: ok(0x8b5cf6, 'n3T'), oG: ok(0xef4444, 'n3G'), of: ok(0xf97316, 'n3f') };
    },
    tick(S, dt, o) {
      const fs_ = S.k * S.mA * 10, a = Math.max(0, (S.mB * 10 - fs_) / (S.mA + S.mB)), T = S.mA * a + fs_;
      if (S.kos) { S.v += a * dt; S.x += S.v * dt * 0.6; if (S.x > 1.6) { S.x = 1.6; S.kos = 0; } }
      o.A.position.x = -1.5 + S.x; o.B.position.y = 2.2 - S.x;
      o.ip1.scale.y = 2.6 - (o.A.position.x + 0.5); o.ip1.position.x = (o.A.position.x + 0.5 + 2.6) / 2;
      o.ip2.scale.y = 3.3 - (o.B.position.y + 0.3); o.ip2.position.y = (3.3 + o.B.position.y + 0.3) / 2;
      const pa = o.A.position.clone().add(V3(0, 0.7, 0.5)); FZ.setArrow(o.oa, pa, V3(1, 0, 0), a * 0.25 + 0.01); FZ.show('n3a', pa.clone().add(V3(a * 0.25 + 0.3, 0, 0)), a > 0 ? 1 : 0);
      const pT = o.A.position.clone().add(V3(0.5, 0, 0.5)); FZ.setArrow(o.oT, pT, V3(1, 0, 0), T / 20); FZ.show('n3T', pT.clone().add(V3(T / 20 + 0.3, 0.2, 0)), 1);
      const pB = o.B.position.clone().add(V3(0, -0.3, 0.5)); FZ.setArrow(o.oG, pB, V3(0, -1, 0), S.mB / 2); FZ.show('n3G', pB.clone().add(V3(0.4, -S.mB / 2, 0)), 1);
      if (fs_ > 0) { const pf = o.A.position.clone().add(V3(-0.5, -0.3, 0.5)); FZ.setArrow(o.of, pf, V3(-1, 0, 0), fs_ / 20); FZ.show('n3f', pf.clone().add(V3(-fs_ / 20 - 0.3, 0, 0)), 1); }
      FZ.setTag('n3t', `a = ${fs(a)} m/s² · T = ${fs(T)} N`); FZ.show('n3t', V3(-1, 4.8, 0), S.goster ? 1 : 0);
    },
    qp: (at, S, o) => o.A.position.clone().add(V3(0, 1.5, 0)) });
  const d3 = ders(s3, { yk: 'AYT3-d1', no: 1, icon: '🍎', name: 'Kuvvet ivmeyi nasıl belirler?', task: 'Newton\'un üç yasası, bağlı cisimler, ip gerilmesi, sürtünme ve asansör.', steps: [
    { k: { tur: 'merak', b: 'Küçük bir kütle büyük bir kütleyi nasıl çeker?', m: ['Masadaki mavi blok (3 kg), makaradan sarkan kırmızı bloğa (2 kg) bağlı. Sürtünme yok.', 'Kırmızı blok düşerken ikisi birlikte hangi ivmeyle hareket eder?'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Üç yasa', m: ['1. Net kuvvet sıfırsa hız sabit kalır (eylemsizlik).', `2. ${FM(`a = ${F('F<sub>net</sub>', 'm<sub>toplam</sub>')}`)} · ivme net kuvvetle aynı yönde.`, '3. Etki-tepki: A, B\'ye kuvvet uygularsa B de A\'ya eşit ve zıt kuvvet uygular (farklı cisimlere etki eder).'] } },
    { p: { t: 'Sürtünme yok. Sistem hangi ivmeyle hareket eder? (m<sub>A</sub> = 3 kg, m<sub>B</sub> = 2 kg)', o: ['10 m/s²', '4 m/s²', '6,67 m/s²', '2 m/s²'], d: 1 } },
    { sub: 'Sistemi serbest bırakalım.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; S.goster = 1; }, sub: 'Bloklar birlikte hızlanıyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Sistemin ivmesi', f: ['n3a', 'n3t', 'n3G'], m: [`Sistemi hareket ettiren tek dış kuvvet m<sub>B</sub>g = 20 N; toplam kütle 5 kg.`, `a = ${F('20', '5')} = <em>4 m/s²</em> · İpteki gerilme: T = m<sub>A</sub> · a = 3 · 4 = 12 N`] } },
    { x: { b: 'Sarkan kütleyi değiştir', m: ['Kırmızı bloğun kütlesini değiştirin; ivme ve ip gerilmesi nasıl değişiyor?'],
      kay: [{ ad: 'mB', etiket: 'm<sub>B</sub>', min: 1, max: 8, adim: 1, deger: 2, birim: 'kg', set: (S, v) => { S.mB = v; } }],
      olc: S => { const a = S._mB * 10 / (3 + S._mB); return `a = ${F(`${S._mB} · 10`, `3 + ${S._mB}`)} = <em>${fs(a)} m/s²</em> · T = <em>${fs(3 * a)} N</em> &lt; m<sub>B</sub>g = ${S._mB * 10} N<br>m<sub>B</sub> çok büyürse a → g\'ye yaklaşır ama g\'yi geçemez.`; } } },
    { do: S => { S.mB = 2; S._mB = 2; }, k: { tur: 'dikkat', b: 'İp gerilmesi sarkan ağırlığa eşit değildir', f: ['n3T', 'n3G'], m: ['Sık yanlış: "İp gerilmesi m<sub>B</sub>g = 20 N\'dur."', 'B aşağı hızlandığı için m<sub>B</sub>g − T = m<sub>B</sub> · a → T = 20 − 8 = 12 N (20 N\'dan küçük).'] } },
    { k: { tur: 'gunluk', b: 'Asansörde ağırlaşmak', m: [`Yukarı hızlanan asansörde baskül: ${FM('N = m (g + a)')} → kendimizi ağır hissederiz.`, 'Aşağı hızlanırken N = m (g − a) → hafif. Halat koparsa a = g → N = 0 (ağırlıksızlık hissi).'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`a = ${F('F<sub>net</sub>', 'm<sub>top</sub>')}`)} · ${FM('f<sub>s</sub> = k · N')} · asansör ${FM('N = m (g ± a)')}`, 'Etki-tepki kuvvetleri farklı cisimlere etki eder, birbirini götürmez.'] } },
  ] });
  const g3 = gorev(s3, { yk: 'AYT3-g1', no: 1, icon: '🪢', name: 'Bağlı blokları hareket ettir', task: 'Sistemin ivmesini, ip gerilmesini ve sürtünmenin etkisini bulun.', data: [['m<sub>A</sub>', '4 kg (masada)'], ['m<sub>B</sub>', '1 kg (sarkan)'], ['g', '10 m/s²']], steps: [
    { do: S => { S.mA = 4; S.mB = 1; }, sub: 'Sürtünmesiz masada 4 kg, sarkan 1 kg.', go: '▶︎ Başlat' },
    { q: { t: 'Sürtünme yok. Sistemin ivmesi kaç m/s²\'dir?', o: ['2 m/s²', '2,5 m/s²', '10 m/s²', '0,5 m/s²'], lab: 'a = ?', f: ['n3G'],
      s: [`${FM(`a = ${F('m<sub>B</sub> · g', 'm<sub>A</sub> + m<sub>B</sub>')}`)} = ${F('10', '5')} = <em>2 m/s²</em> ✓`], n: ['Bağlı cisimleri tek bir sistem gibi düşünün: dış net kuvvet ÷ toplam kütle.'] } },
    { do: S => { S.kos = 1; S.goster = 1; }, sub: 'Bloklar hareket ediyor…', until: S => !S.kos },
    { q: { t: 'İpteki gerilme kuvveti kaç N\'dur?', o: ['8 N', '10 N', '2 N', '40 N'], f: ['n3T', 'n3t'],
      s: ['§1. YOL · A bloğu için', `T = m<sub>A</sub> · a = 4 · 2 = <em>8 N</em> ✓`, '§2. YOL · B bloğu için', `m<sub>B</sub>g − T = m<sub>B</sub> a → T = 10 − 2 = <em>8 N</em> ✓`], n: ['İki yoldan aynı sonucun çıkması çözümün doğru olduğunu gösterir.'] } },
    { do: S => { S.x = 0; S.v = 0; S.k = 0.1; }, q: { t: 'Masa ile A arasında sürtünme katsayısı 0,1 olursa ivme kaç m/s² olur?', o: ['1,2 m/s²', '2 m/s²', '0,8 m/s²', '1 m/s²'], f: ['n3f'],
      s: ['f<sub>s</sub> = k · m<sub>A</sub> · g = 0,1 · 40 = 4 N', `a = ${F('10 − 4', '5')} = <em>1,2 m/s²</em> ✓`], n: ['Sürtünme yalnız masadaki bloğa etki eder; net kuvvetten çıkarılır.'] } },
    { do: S => { S.kos = 1; }, q: { t: '60 kg\'lık öğrenci, yukarı doğru 2 m/s² ivmeyle hızlanan asansördeki baskülün üzerinde. Baskül kaç N gösterir?', o: ['720 N', '600 N', '480 N', '120 N'],
      s: ['Yukarı net kuvvet: N − mg = m · a', `${FM('N = m (g + a)')} = 60 · 12 = <em>720 N</em> ✓`], n: ['Baskül ağırlığı değil, bize uyguladığı tepki kuvvetini (N) gösterir.'] } },
  ] });
  konuEkle('AYT', "Newton'un Hareket Yasaları", { dersler: [d3], gorevler: [g3] });

  // =====================================================================
  // AYT 4 · BİR BOYUTTA SABİT İVMELİ HAREKET — fren yapan araba ve v–t grafiği
  // =====================================================================
  const s4 = sahne({ icon: '🚦', ses: 'engine', cam: [[1, 6, 16], [1, 1.5, 0]], plate: [26, 7, 2, 0],
    data: [['Ölçek', '1 birim = 5 m']],
    cam2: S => { const X = -9 + S.x / 5; return [[X + 5, 6, 16], [X + 5, 1.5, 0]]; },
    S0: () => ({ x: 0, v: 20, a: -5, kos: 0, tt: 0, iz: [] }),
    kur(g) {
      for (let i = 0; i <= 12; i++) { kutu(g, 0.06, 0.02, 3, 0xffffff, -9 + i * 2, 0.02, 0, { edge: false, cast: false }); etiket('a4m' + i, `${i * 10} m`, '#1f232c'); }
      const araba = FZ.araba(g, 0x16a34a);
      const pano = kutu(g, 7, 4, 0.1, 0x111827, 9, 3, -2.5, { cast: false });
      const grafik = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x22c55e })); g.add(grafik);
      levha(g, 'v', 0.4, 0.4, '#111827', '#fff', 5.8, 4.8, -2.4); levha(g, 't', 0.4, 0.4, '#111827', '#fff', 12.3, 1.2, -2.4);
      kutu(g, 0.04, 3.5, 0.02, 0xffffff, 6, 2.9, -2.4, { edge: false }); kutu(g, 6.2, 0.04, 0.02, 0xffffff, 9.1, 1.2, -2.4, { edge: false });
      etiket('a4v', 'v', '#16a34a'); kart('a4t', '', '#F5C400');
      return { araba, grafik, ov: ok(0x22c55e, 'a4v') };
    },
    tick(S, dt, o) {
      if (S.kos) { const dv = S.a * dt; if (S.v + dv <= 0 && S.a < 0) { S.x += S.v * S.v / (-2 * S.a); S.v = 0; S.kos = 0; } else { S.x += S.v * dt + 0.5 * S.a * dt * dt; S.v += dv; } S.tt += dt; S.iz.push([S.tt, S.v]); }
      const X = -9 + S.x / 5; FZ.tekerDondur(o.araba, X - o.araba.position.x); o.araba.position.x = X;
      for (let i = 0; i <= 12; i++) FZ.show('a4m' + i, V3(-9 + i * 2, 0.05, 1.8), 1, 0, 20);
      if (S.v > 0.1) { FZ.setArrow(o.ov, V3(X, 1.3, 0.5), V3(1, 0, 0), S.v / 8); FZ.show('a4v', V3(X + S.v / 8 + 0.3, 1.3, 0.5), 1); }
      o.grafik.geometry.setFromPoints(S.iz.length ? S.iz.map(([t, v]) => V3(6 + t * 0.6, 1.2 + v * 0.12, -2.38)) : [V3(6, 1.2, -2.38), V3(6, 1.2, -2.38)]);
      o.araba.visible = true;
      FZ.setTag('a4t', `t = ${fs(S.tt)} s · v = ${fs(S.v)} m/s · x = ${fs(S.x)} m`); FZ.show('a4t', V3(X, 2.4, 0), 1);
      S.ses = S.kos ? [0.05 + S.v / 400, S.v / 30] : [0, 0];
    },
    qp: (at, S) => V3(-9 + S.x / 5, 3, 0) });
  const d4 = ders(s4, { yk: 'AYT4-d1', no: 1, icon: '🛑', name: 'Fren mesafesi neden 4 katına çıkar?', task: 'İvme, sabit ivmeli hareket denklemleri, hız-zaman grafiği, serbest düşme.', steps: [
    { k: { tur: 'merak', b: 'Hızı 2 katına çıkan araba ne kadar uzakta durur?', m: ['Trafik kurallarında hız sınırları çok sıkıdır. Neden?', 'Bu derste fren mesafesinin hızla nasıl değiştiğini bulacağız.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Sabit ivmeli hareket', m: [`İvme: ${FM(`a = ${F('Δv', 'Δt')}`)} · sabit ivmede hız düzgün değişir.`, `${FM('v = v<sub>0</sub> + a t')} · ${FM(`x = v<sub>0</sub> t + ${F('1', '2')} a t<sup>2</sup>`)} · ${FM('v<sup>2</sup> = v<sub>0</sub><sup>2</sup> + 2 a x')}`] } },
    { do: S => { S.v = 10; S.a = -5; }, sub: 'Önce 10 m/s ile giden araba 5 m/s² ile fren yapsın.', go: '▶︎ Fren (10 m/s)' },
    { do: S => { S.kos = 1; }, sub: 'Araba yavaşlıyor; grafiği izleyin.', until: S => !S.kos },
    { k: { tur: 'gozlem', b: 'Durma mesafesi', f: ['a4t'], m: [`x = ${F('v<sub>0</sub><sup>2</sup>', '2 a')} = ${F('100', '10')} = 10 m · süre t = ${F('v<sub>0</sub>', 'a')} = 2 s`, 'Grafik: hız zamanla doğrusal azalıyor; eğim = ivme.'] } },
    { p: { t: 'Araba bu kez <b>20 m/s</b> ile gidip aynı ivmeyle fren yaparsa durma mesafesi ne olur?', o: ['10 m', '20 m', '40 m', '80 m'], d: 2 } },
    { do: S => { S.x = 0; S.v = 20; S.tt = 0; S.iz = []; }, sub: 'Şimdi 20 m/s.', go: '▶︎ Fren (20 m/s)' },
    { do: S => { S.kos = 1; }, sub: 'Araba yavaşlıyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Mesafe hızın karesiyle artar', f: ['a4t'], m: [`x = ${F('400', '10')} = 40 m: hız 2 katına çıkınca mesafe <em>4 katına</em> çıktı.`, 'Hız-zaman grafiğinin altındaki alan = alınan yol: ½ · 4 · 20 = 40 m.'] } },
    { x: { b: 'İlk hızı değiştir', m: ['Aynı freni (5 m/s²) farklı hızlarda deneyin.'],
      kay: [{ ad: 'v0', etiket: 'İlk hız', min: 5, max: 35, adim: 5, deger: 20, birim: 'm/s', set: () => {} }],
      olc: S => `Durma mesafesi = ${F('v<sub>0</sub><sup>2</sup>', '2a')} = ${F(`${S._v0}²`, '10')} = <em>${fs(S._v0 * S._v0 / 10)} m</em> · süre = <em>${fs(S._v0 / 5)} s</em>` } },
    { k: { tur: 'dikkat', b: 'Grafiğin eğimi ve alanı', m: ['Hız-zaman grafiğinde <em>eğim</em> ivmeyi, <em>alan</em> yer değiştirmeyi verir.', 'Konum-zaman grafiğinde eğim hızı verir; alanın anlamı yoktur.'] } },
    { k: { tur: 'ornek', b: 'Serbest düşme', m: ['Serbest düşmede a = g = 10 m/s² (hava direnci yok), v<sub>0</sub> = 0.', '3 s sonra: v = g t = 30 m/s · h = ½ g t² = 45 m', 'Kütleden bağımsızdır: tüy ile çekiç havasız ortamda birlikte düşer.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('v = v<sub>0</sub> + a t')} · ${FM(`x = v<sub>0</sub> t + ${F('1', '2')} a t<sup>2</sup>`)} · ${FM('v<sup>2</sup> = v<sub>0</sub><sup>2</sup> + 2 a x')}`, 'v–t grafiği: eğim = ivme, alan = yer değiştirme.'] } },
  ] });
  const g4 = gorev(s4, { yk: 'AYT4-g1', no: 1, icon: '🏎️', name: 'Arabayı güvenle durdur', task: 'Sabit ivmeli harekette hız, yol ve durma mesafesini hesaplayın.', steps: [
    { do: S => { S.v = 0; S.a = 3; }, sub: 'Araba duruştan 3 m/s² ile hızlanacak.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, sub: 'Araba hızlanıyor…', until: S => S.tt >= 4 },
    { do: S => { S.kos = 0; }, q: { t: 'Durgun araba 3 m/s² ivmeyle 4 s hızlanıyor. Son hızı kaç m/s\'dir?', o: ['12 m/s', '7 m/s', '24 m/s', '0,75 m/s'], f: ['a4t'],
      s: [`${FM('v = v<sub>0</sub> + a t')} = 0 + 3 · 4 = <em>12 m/s</em> ✓`], n: ['İvme, hızın her saniye ne kadar değiştiğini söyler: her saniye 3 m/s artar.'] } },
    { q: { t: 'Bu 4 saniyede araba kaç metre yol alır?', o: ['24 m', '48 m', '12 m', '36 m'], f: ['a4t'],
      s: ['§1. YOL · formül', `${FM(`x = ${F('1', '2')} a t<sup>2</sup>`)} = ${F('1', '2')} · 3 · 16 = <em>24 m</em> ✓`, '§2. YOL · grafik alanı', `üçgen alanı = ${F('4 · 12', '2')} = <em>24 m</em> ✓`], n: ['v–t grafiğinin altındaki alan yer değiştirmeyi verir.'] } },
    { do: S => { S.x = 0; S.tt = 0; S.iz = []; S.v = 30; S.a = -6; }, q: { t: '30 m/s ile giden araba 6 m/s² ile fren yapıyor. Kaç metrede durur?', o: ['75 m', '150 m', '5 m', '180 m'],
      s: ['§1. YOL · zamansız denklem', `0 = 30² − 2 · 6 · x → x = ${F('900', '12')} = <em>75 m</em> ✓`, '§2. YOL · süre ve ortalama hız', `t = ${F('30', '6')} = 5 s · x = ${F('30 + 0', '2')} · 5 = <em>75 m</em> ✓`], n: ['Fren yaparken ivme harekete zıttır (a negatif).'] } },
    { do: S => { S.kos = 1; }, sub: 'Araba fren yapıyor…', until: S => !S.kos },
    { q: { t: 'Hava direncinin olmadığı ortamda serbest bırakılan cisim 4 s sonra yere çarpıyor. Kaç metre yükseklikten bırakılmıştır? (g = 10 m/s²)', o: ['80 m', '40 m', '160 m', '20 m'],
      s: [`${FM(`h = ${F('1', '2')} g t<sup>2</sup>`)} = ${F('1', '2')} · 10 · 16 = <em>80 m</em> ✓`], n: ['Serbest düşme, v<sub>0</sub> = 0 ve a = g olan sabit ivmeli harekettir; kütleye bağlı değildir.'] } },
  ] });
  konuEkle('AYT', 'Bir Boyutta Sabit İvmeli Hareket', { dersler: [d4], gorevler: [g4] });
})();
