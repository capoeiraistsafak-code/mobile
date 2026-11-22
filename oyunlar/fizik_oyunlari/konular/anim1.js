// Animasyon programındaki projelerden: TYT Isı ve Sıcaklık (kalorifer konu anlatımı · 8 soru · 10 tuzak soru) ve TYT Elektrostatik (7 adım + TYT soruları)
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, THREE } = FZ;
  const fs = x => (+(+x).toFixed(1)).toString().replace('.', ',');

  // =====================================================================
  // KALORİFER SAHNESİ: kombi → sıcak boru → petek → oda → soğuk boru → kombi
  // =====================================================================
  const YOL = [V3(-3.2, 2.45, 0), V3(-3.2, 3.3, 0), V3(0.9, 3.3, 0), V3(0.9, 0.45, 0), V3(-2.7, 0.45, 0), V3(-2.7, 1.05, 0)];   // su devresi
  const yolUz = (() => { let t = 0; for (let i = 1; i < YOL.length; i++) t += YOL[i].distanceTo(YOL[i - 1]); return t; })();
  const yolNokta = s => { s = ((s % 1) + 1) % 1 * yolUz; for (let i = 1; i < YOL.length; i++) { const L = YOL[i].distanceTo(YOL[i - 1]); if (s <= L) return { p: YOL[i - 1].clone().lerp(YOL[i], s / L), seg: i }; s -= L; } return { p: YOL[0].clone(), seg: 1 }; };
  const sKal = sahne({ icon: '🔥', cam: [[1.9, 3.3, 14], [1.9, 1.7, 0]], plate: [13, 5, 0, 0],
    data: [['Petek', '70 °C'], ['Oda (başta)', '18 °C'], ['Suyun öz ısısı', 'c = 1 cal/g·°C']],
    S0: () => ({ akis: 0, faz: 0, Tp: 70, Toda: 18, konv: 0, isima: 0, gen: 0 }),
    kur(g) {
      // kombi
      const kombi = kutu(g, 1.1, 1.4, 0.7, 0xf8fafc, -3.2, 1.75, 0); kutu(g, 0.5, 0.22, 0.02, 0x0f172a, -3.2, 2.1, 0.36, { edge: false });
      const ekran = kutu(g, 0.4, 0.14, 0.02, 0x22c55e, -3.2, 2.1, 0.37, { edge: false }); ekran.material.emissive = new THREE.Color(0x16a34a); ekran.material.emissiveIntensity = 0.8;
      const alev = FZ.mesh(new THREE.ConeGeometry(0.16, 0.36, 12), 0x3b82f6, { edge: false, cast: false }); alev.position.set(-3.2, 1.45, 0.36); g.add(alev);
      // borular
      const boru = (a, b, renk) => { const d = b.clone().sub(a), L = d.length(), m = FZ.silindir(g, 0.07, 0.07, L, renk, 0, 0, 0, { edge: false }); m.position.copy(a.clone().add(b).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; };
      boru(YOL[0], YOL[1], 0xdc2626); boru(YOL[1], YOL[2], 0xdc2626); boru(YOL[3], YOL[4], 0x2563eb); boru(YOL[4], YOL[5], 0x2563eb);
      // petek (dilimli radyatör)
      const petek = new THREE.Group(); petek.position.set(0.9, 1.9, 0); g.add(petek); const dilim = [];
      for (let i = 0; i < 9; i++) dilim.push(FZ.kutu(petek, 0.14, 2.5, 0.42, 0xe5e7eb, -0.56 + i * 0.14, 0, 0));
      // oda: döşeme, koltuk, termometre
      kutu(g, 0.9, 0.45, 0.8, 0x7c3aed, 3.7, 0.25, 0); kutu(g, 0.9, 0.6, 0.18, 0x6d28d9, 3.7, 0.6, -0.32);
      kutu(g, 0.08, 1.6, 0.04, 0xf8fafc, 3.0, 2.4, 0.3, { op: 0.6 }); const civa = kutu(g, 0.05, 1, 0.05, 0xef4444, 3.0, 1.9, 0.32, { edge: false }); FZ.olcek(g, 3.13, 0.32, [10, 20, 30, 40].map(T => [1.82 + (T - 10) / 30 * 1.4, `${T}`]), 1, 0.2); FZ.yazi(g, '°C', 3.0, 3.42, 0.33, 0.2);
      // su tanecikleri, konveksiyon okları, ışıma dalgaları
      const tan = []; for (let i = 0; i < 26; i++) tan.push(top(g, 0.09, 0xef4444, 0, 0, 0.12, { edge: false }));
      const konv = []; for (let i = 0; i < 4; i++) konv.push(ok(0xf97316, 'k5k'));
      const dalga = []; for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.35, 0.025, 6, 40, Math.PI / 1.6), new THREE.MeshBasicMaterial({ color: 0xfb923c, transparent: true, opacity: 0.8 })); t.rotation.z = -Math.PI / 3.2; t.position.set(1.45, 1.9, 0.3); g.add(t); dalga.push(t); }
      kart('k5p', '', '#dc2626'); kart('k5o', '', '#2563eb'); etiket('k5k', 'konveksiyon', '#ea580c'); kart('k5i', 'ışıma', '#ea580c'); kart('k5b', 'Kombi', '#475569');
      return { alev, petek, dilim, civa, tan, konv, dalga };
    },
    tick(S, dt, o) {
      if (S.akis) S.faz += dt * 0.12;
      o.alev.visible = !!S.akis; o.alev.scale.y = 0.8 + 0.3 * Math.random();
      o.tan.forEach((m, i) => { const { p, seg } = yolNokta(S.faz + i / o.tan.length); m.position.set(p.x, p.y, 0.12); m.visible = !!S.akis;
        const sicak = seg <= 2 || (seg === 3 && p.y > 2); m.material.color.setHex(sicak ? 0xef4444 : 0x3b82f6); });
      if (S.akis && S.Toda < 24) S.Toda = Math.min(24, S.Toda + dt * 0.35 * (S.Tp - S.Toda) / 52);
      const k = Math.min(1, (S.Tp - 20) / 60); o.dilim.forEach(d => d.material.color.setRGB(1, 0.92 - 0.5 * k * (S.akis ? 1 : 0), 0.92 - 0.7 * k * (S.akis ? 1 : 0)));   /* ısınınca turuncu-kırmızı */
      const h = 0.2 + (S.Toda - 10) / 30 * 1.4; o.civa.scale.y = h; o.civa.position.y = 1.62 + h / 2;
      if (S.konv) { const r = 1.1; o.konv.forEach((a, i) => { const t0 = -S.t * 0.6 + i * Math.PI / 2,   /* saat yönünde: peteğin yanında yukarı */ c = V3(2.25, 2.2, 0.6), p = c.clone().add(V3(Math.cos(t0) * r * 0.5, Math.sin(t0) * r, 0)), d = V3(-Math.sin(t0) * 0.5, Math.cos(t0), 0).multiplyScalar(-1);
        FZ.setArrow(a, p, d, 0.55); }); FZ.show('k5k', V3(2.4, 0.85, 0.6), 1); }
      o.dalga.forEach((d, i) => { d.visible = !!S.isima; d.material.opacity = 0.25 + 0.6 * ((Math.sin(S.t * 3 - i) + 1) / 2); }); FZ.show('k5i', V3(1.6, 3.35, 0.3), S.isima ? 1 : 0);
      FZ.setTag('k5p', `Petek ${Math.round(S.Tp)} °C`); FZ.show('k5p', V3(0.35, 3.8, 0), 1);
      FZ.setTag('k5o', `Oda ${fs(S.Toda)} °C`); FZ.show('k5o', V3(3.5, 3.4, 0.3), 1); FZ.show('k5b', V3(-3.2, 1.25, 0.5), 1);
    },
    qp: () => V3(0, 4.6, 0) });

  const dKal = ders(sKal, { yk: 'TYT5-d2', no: 2, icon: '♨️', name: 'Kalorifer evi nasıl ısıtır?', task: 'Isı–sıcaklık–iç enerji, termometreler, öz ısı, hal değişimi, ısıl denge, ısının yayılma yolları ve genleşme.', steps: [
    { k: { tur: 'merak', b: 'Kalorifer petekleri evi nasıl ısıtıyor?', m: ['Kombide ısınan su borulardan peteklere gider, odayı ısıtır, soğuyup geri döner.', 'Bu döngünün her adımında bir ısı-sıcaklık kuralı saklı.'], dugme: 'Başlayalım ▶︎' } },
    { do: S => { S.akis = 1; }, sub: 'Kombi çalıştı; sıcak su (kırmızı) peteğe gidiyor, soğuyan su (mavi) dönüyor.', wait: 4 },
    { k: { tur: 'kavram', b: 'Isı, sıcaklık ve iç enerji', f: ['k5p', 'k5o'], m: ['<em>Sıcaklık</em>: taneciklerin ortalama hareket enerjisinin göstergesi. Madde miktarına bağlı değildir.', '<em>İç enerji</em>: taneciklerin toplam enerjisi; madde arttıkça artar.', '<em>Isı</em>: sıcaklık farkı yüzünden sıcaktan soğuğa aktarılan enerji. Petek 70 °C, oda 18 °C → ısı petekten odaya akar.'] } },
    { p: { t: 'Aynı sıcaklıktaki bir kova su ile bir bardak su için hangisi doğrudur?', o: ['Kovanın ısısı daha fazladır', 'Kovanın iç enerjisi daha fazladır', 'Bardağın sıcaklığı daha yüksektir', 'İç enerjileri eşittir'], d: 1 } },
    { k: { tur: 'gozlem', sonuc: true, b: 'Cisim ısı içermez', m: ['Kovada tanecik sayısı çok daha fazla → iç enerjisi büyük.', '"Kovanın ısısı fazla" demek <em>yanlıştır</em>: ısı bir cisimde depolanmaz, yalnız aktarılır.'] } },
    { k: { tur: 'kavram', b: 'Neyle ölçülür?', m: ['Sıcaklık <em>termometreyle</em> doğrudan ölçülür (°C, °F, K).', 'Isı doğrudan ölçülemez; kalorimetre kabındaki maddenin sıcaklık değişiminden hesaplanır (joule, kalori). 1 cal ≈ 4,18 J.', 'Termometre ısıyı değil <em>sıcaklığı</em> ölçer.'] } },
    { k: { tur: 'kavram', b: 'Termometreler arasındaki fark', m: ['Buz erirken: 0 °C · 32 °F · 273 K. Su kaynarken: 100 °C · 212 °F · 373 K.', `Dönüşüm: ${FM(`${F('C', '100')} = ${F('F − 32', '180')} = ${F('K − 273', '100')}`)}`] } },
    { k: { tur: 'dikkat', b: 'Değişimde 273 eklenmez', m: ['Sıcaklık 10 °C <em>artarsa</em> kelvinde de 10 K artar (bölmeler eşit).', `Fahrenhayt\'ta artış: ${F('ΔF', '180')} = ${F('ΔC', '100')} → 10 °C artış = 18 °F artış.`] } },
    { k: { tur: 'kavram', b: 'Aynı ısıyı alan maddeler neden farklı ısınır?', m: [`${FM('Q = m · c · ΔT')} · öz ısı (c) maddeyi tanıtır.`, 'Güneşte kum hızla, su yavaş ısınır: suyun öz ısısı çok büyüktür.', 'Kaloriferde bu yüzden su dolaşır: kombiden peteğe bol ısı taşır.'] } },
    { x: { b: 'Petek sıcaklığını değiştir', m: ['Sıcaklık farkı büyüdükçe ısı aktarımı ne olur?'],
      kay: [{ ad: 'Tp', etiket: 'Petek', min: 40, max: 80, adim: 10, deger: 70, birim: '°C', set: (S, v) => { S.Tp = v; } }],
      olc: S => `Petek − oda farkı: <em>${Math.round(S._Tp - S.Toda)} °C</em><br>Fark büyüdükçe odaya birim zamanda <em>daha çok</em> ısı aktarılır.` } },
    { do: S => { S.Tp = 70; S._Tp = 70; }, k: { tur: 'kavram', b: 'Hal değişimi', m: ['Isı alan madde erir, buharlaşır; ısı veren madde donar, yoğuşur.', `Hal değişirken sıcaklık <em>sabit</em> kalır, ama madde ısı almaya devam eder: ${FM('Q = m · L')}`] } },
    { k: { tur: 'ornek', b: 'Isıl denge', m: ['20 °C\'deki 100 g su ile 80 °C\'deki 200 g su karıştırılıyor.', `Verilen = alınan: 200 · (80 − T) = 100 · (T − 20) → <em>T = 60 °C</em>`, 'Denge sıcaklığı, kütlesi büyük olan sıcak suya daha yakın. Tam ortalama ancak ısı sığaları eşitse çıkar.'] } },
    { do: S => { S.konv = 1; S.isima = 1; }, k: { tur: 'kavram', b: 'Isı nasıl yayılır?', f: ['k5k', 'k5i'], m: ['<em>İletim</em>: sıcak su peteğin metaline dokunarak ısı verir.', '<em>Konveksiyon</em>: ısınan hava yükselir, soğuk hava iner; odada döner (turuncu oklar).', '<em>Işıma</em>: peteğin yanında yüzünde hissettiğin sıcaklık; Güneş de bizi böyle ısıtır.'] } },
    { k: { tur: 'dikkat', b: 'Yayılma tuzakları', m: ['Konveksiyon yalnız <em>sıvı ve gazlarda</em> olur.', 'Işıma için madde gerekmez: boşlukta da yayılır.'] } },
    { k: { tur: 'kavram', b: 'Genleşme', m: ['Isı alan maddenin sıcaklığı artar, tanecikleri uzaklaşır: madde genleşir.', `Çubuğun uzaması: ${FM('ΔL = L<sub>0</sub> · λ · ΔT')}`, 'Dikkat: su 0 °C ile 4 °C arasında ısıtılınca <em>büzülür</em>.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Isı aktarılır, sıcaklık ölçülür, iç enerji toplamdır.', `${FM('Q = m c ΔT')} · ${FM('Q = m L')} · iletim, konveksiyon, ışıma · ${FM('ΔL = L<sub>0</sub> λ ΔT')}`] } },
  ] });

  // ---- Isı · 8 TYT sorusu (mevcut beher-termometre sahnesi) ----
  const sIsi = FZ.taban('TYT', 'Isı ve Sıcaklık');
  const gIsi8 = gorev(sIsi, { yk: 'TYT5-g2', no: 2, icon: '🧪', name: 'Isı · 8 TYT sorusu', task: 'Isı ve sıcaklığın sekiz alt başlığından birer TYT sorusu.', data: [['Suyun öz ısısı', 'c = 1 cal/g·°C']], steps: [
    { do: S => { S.T = 22; S.Th = 22; }, sub: 'Sekiz alt başlık, sekiz soru.', go: '▶︎ Başlat' },
    { q: { t: 'Ece aynı mutfakta duran metal ve tahta kaşıklara dokunuyor; metali daha soğuk hissediyor.<br>I. Kaşıkların sıcaklıkları eşittir.<br>II. Metal kaşık elden birim zamanda daha çok ısı alır.<br>III. Tahta kaşığın sıcaklığı daha yüksektir.<br>Hangileri doğrudur?', o: ['I ve II', 'Yalnız I', 'Yalnız III', 'II ve III'],
      s: ['Aynı ortamdaki kaşıkların sıcaklıkları eşittir (I doğru).', 'Metal iyi iletkendir, elden ısıyı hızlı alır → soğuk hissedilir (II doğru).', 'III yanlış: sıcaklıklar eşit. <em>Cevap: I ve II</em> ✓'], n: ['Elimiz sıcaklığı değil, ısı akış hızını hisseder.'] } },
    { do: S => { S.T = 90; }, q: { t: 'Çaydanlıktaki 1 kg su ile bardaktaki 0,2 kg suyun ikisi de 90 °C.<br>I. Sıcaklıkları eşittir.<br>II. İç enerjileri eşittir.<br>III. Termometre ısıyı ölçer.<br>Hangileri doğrudur?', o: ['Yalnız I', 'I ve II', 'I ve III', 'I, II ve III'], f: ['e5T'],
      s: ['Sıcaklıklar eşit (I doğru).', 'Kütlesi büyük olanın iç enerjisi büyüktür (II yanlış).', 'Termometre sıcaklığı ölçer (III yanlış). <em>Cevap: Yalnız I</em> ✓'], n: ['İç enerji madde miktarına bağlıdır; sıcaklık bağlı değildir.'] } },
    { do: S => { S.T = 30; }, q: { t: 'Bir X termometresinde buzun erime sıcaklığı 20 °X, suyun kaynama sıcaklığı 120 °X. Celsius termometresi 30 °C gösterirken X kaç gösterir?', o: ['50 °X', '30 °X', '36 °X', '60 °X'], f: ['e5T'],
      s: [`${F('X − 20', '120 − 20')} = ${F('C − 0', '100')} → ${F('X − 20', '100')} = ${F('30', '100')}`, 'X − 20 = 30 → <em>X = 50 °X</em> ✓'], n: ['Aynı seviye, aynı oran: (değer − erime) / (kaynama − erime) her termometrede eşittir.'] } },
    { q: { t: 'Eşit kütleli K, L, M sıvıları özdeş ısıtıcılarla eşit süre ısıtılıyor. Sıcaklık artışları ΔT<sub>K</sub> > ΔT<sub>L</sub> > ΔT<sub>M</sub>. Öz ısılar arasındaki ilişki nedir?', o: ['c<sub>M</sub> > c<sub>L</sub> > c<sub>K</sub>', 'c<sub>K</sub> > c<sub>L</sub> > c<sub>M</sub>', 'c<sub>K</sub> = c<sub>L</sub> = c<sub>M</sub>', 'c<sub>L</sub> > c<sub>K</sub> > c<sub>M</sub>'],
      s: ['Özdeş ısıtıcı, eşit süre → eşit Q. Kütleler de eşit.', `${FM('Q = m c ΔT')} → c · ΔT sabit: en az ısınanın öz ısısı en büyük.`, '<em>c<sub>M</sub> > c<sub>L</sub> > c<sub>K</sub></em> ✓'], n: ['Öz ısı ile sıcaklık artışı ters orantılıdır (Q ve m eşitken).'] } },
    { q: { t: 'Aşağıdaki olayların hangisinde madde çevresine ısı verir?', o: ['Soğuk bardağın dış yüzeyinde su damlacıkları oluşması', 'Islak çamaşırın kuruması', 'Buzun erimesi', 'Naftalinin süblimleşmesi'],
      s: ['Havadaki su buharı soğuk bardağa çarpıp sıvıya döner: <em>yoğuşma</em> ✓', 'Yoğuşmada madde ısı verir; buharlaşma, erime ve süblimleşmede ısı alır.'], n: ['Isı veren hal değişimleri: donma, yoğuşma (ve kırağılaşma).'] } },
    { do: S => { S.T = 75; }, q: { t: 'Yalıtılmış ortamda 80 °C\'lik çaya 20 °C\'lik metal kaşık konuyor. Isıl denge kuruluncaya kadar:<br>I. Çay ısı verir.<br>II. Çayın verdiği ısı kaşığın aldığı ısıya eşittir.<br>III. Dengede sıcaklıklar eşittir.<br>Hangileri doğrudur?', o: ['I, II ve III', 'Yalnız I', 'I ve II', 'II ve III'],
      s: ['Isı sıcaktan soğuğa akar: çay verir (I).', 'Ortam yalıtılmış: verilen = alınan (II).', 'Dengede sıcaklıklar eşitlenir (III). <em>Hepsi doğru</em> ✓'], n: ['Isıl denge: sıcaklıklar eşit, ısı akışı durur.'] } },
    { q: { t: 'Termosun iki cidarı arasındaki havası boşaltılmıştır. Bu vakum ısının hangi yollarla aktarılmasını engeller?', o: ['İletim ve konveksiyon', 'Yalnız ışıma', 'Yalnız iletim', 'İletim, konveksiyon ve ışıma'],
      s: ['Vakumda tanecik yoktur → iletim ve konveksiyon olmaz ✓', 'Işıma boşlukta da yayılır; onu gümüş kaplı yüzeyler yansıtarak azaltır.'], n: ['Termosun parlak (gümüş) yüzeyi ışımayı, vakum iletim ve konveksiyonu engeller.'] } },
    { q: { t: 'Bakır ve demirden yapılmış bimetal şerit ısıtılınca bakır dışta kalacak şekilde bükülüyor.<br>I. Bakırın uzama katsayısı demirinkinden büyüktür.<br>II. Demir daha çok uzamıştır.<br>III. Bimetal şeritler termostatlarda kullanılır.<br>Hangileri doğrudur?', o: ['I ve III', 'Yalnız I', 'I ve II', 'II ve III'],
      s: ['Dışta kalan şerit daha çok uzamıştır → bakır (I doğru, II yanlış).', 'Ütü ve fırın termostatları bimetal kullanır (III doğru). <em>Cevap: I ve III</em> ✓'], n: ['Büküm, uzama katsayısı küçük olan metal tarafına doğrudur.'] } },
  ] });

  // ---- Isı · 10 tuzak soru (2 görev × 5) ----
  const tuzak1 = gorev(sIsi, { yk: 'TYT5-g3', no: 3, icon: '🪤', name: 'Tuzak sorular · 1', task: 'Sınavda en çok yapılan ısı-sıcaklık hataları (1–5).', data: [['Suyun öz ısısı', 'c = 1 cal/g·°C']], steps: [
    { do: S => { S.T = 80; S.Th = 80; }, sub: 'Her soruda bir tuzak var. Dikkat!', go: '▶︎ Başlat' },
    { q: { t: 'K kabında 80 °C\'de 100 g su, L kabında 40 °C\'de 1 kg su var.<br>I. K\'deki suyun ısısı daha fazladır.<br>II. L\'deki suyun iç enerjisi daha büyük olabilir.<br>III. K\'deki taneciklerin ortalama kinetik enerjisi daha büyüktür.<br>Hangileri doğrudur?', o: ['II ve III', 'Yalnız I', 'I ve III', 'I, II ve III'],
      s: ['I yanlış: cisim ısı <em>içermez</em>; ısı aktarılan enerjidir.', 'II doğru: L\'de tanecik sayısı çok fazla.', 'III doğru: sıcaklığı büyük olanın ortalama kinetik enerjisi büyüktür. <em>II ve III</em> ✓'], n: ['TUZAK: "Sıcak olanın ısısı fazladır" demek.'] } },
    { q: { t: 'Sıcaklığı 20 °C artırılan bir cismin sıcaklık artışı Kelvin ölçeğinde kaçtır?', o: ['20 K', '293 K', '253 K', '36 K'],
      s: ['Celsius ve Kelvin bölmeleri eşittir: 10 °C → 30 °C iken 283 K → 303 K.', '303 − 283 = <em>20 K</em> ✓'], n: ['TUZAK: 20\'ye 273 eklemek. 293 K bir sıcaklık <em>değeridir</em>, artış değildir.'] } },
    { q: { t: 'Tencerede ısıtılan suyun sıcaklığı 10 °C artıyor. Bu artış Fahrenheit ölçeğinde kaçtır?', o: ['18 °F', '50 °F', '10 °F', '42 °F'],
      s: [`${F('ΔC', '100')} = ${F('ΔF', '180')} → ΔF = 1,8 · 10`, '= <em>18 °F</em> ✓'], n: ['TUZAK: "10 °C = 50 °F" deyip artış yerine sıcaklık değerini yazmak.'] } },
    { do: S => { S.T = 0; }, q: { t: '0 °C\'deki buz 0 °C\'deki suya dönüşürken:<br>I. Sıcaklık sabit kalır.<br>II. Buz ısı alır.<br>III. İç enerji değişmez.<br>Hangileri doğrudur?', o: ['I ve II', 'Yalnız I', 'I ve III', 'I, II ve III'], f: ['e5T'],
      s: ['Saf madde hal değiştirirken sıcaklığı sabittir (I).', 'Erimek için ısı alır (II).', 'Isı alan maddenin iç enerjisi <em>artar</em> (III yanlış). <em>I ve II</em> ✓'], n: ['TUZAK: "Sıcaklık sabitse iç enerji de sabittir" sanmak.'] } },
    { q: { t: 'Bir kaptaki suyun kütlesi iki katına çıkarılıyor. Hangileri iki katına çıkar?<br>I. Öz ısı<br>II. Isı sığası<br>III. Sıcaklığı 1 °C artırmak için gereken ısı', o: ['II ve III', 'Yalnız I', 'I ve II', 'I, II ve III'],
      s: ['Öz ısı maddeye özgüdür, değişmez (I yanlış).', 'Isı sığası = m · c → iki katı (II).', 'Gereken ısı m c ΔT → iki katı (III). <em>II ve III</em> ✓'], n: ['TUZAK: kütle artınca öz ısının da arttığını düşünmek.'] } },
  ] });
  const tuzak2 = gorev(sIsi, { yk: 'TYT5-g4', no: 4, icon: '🪤', name: 'Tuzak sorular · 2', task: 'Sınavda en çok yapılan ısı-sıcaklık hataları (6–10).', data: [['Suyun öz ısısı', 'c = 1 cal/g·°C']], steps: [
    { do: S => { S.T = 40; S.Th = 40; }, sub: 'Beş tuzak daha.', go: '▶︎ Başlat' },
    { q: { t: '20 °C\'deki 200 g su ile 80 °C\'deki 100 g su karıştırılıyor.<br>I. Sıcak suyun verdiği ısı soğuk suyun aldığı ısıya eşittir.<br>II. İki suyun sıcaklık değişimleri eşittir.<br>III. Denge sıcaklığı 50 °C\'dir.<br>Hangileri doğrudur?', o: ['Yalnız I', 'I ve II', 'I ve III', 'I, II ve III'], f: ['e5T'],
      s: ['Verilen = alınan (I doğru): 200 (T − 20) = 100 (80 − T) → T = 40 °C.', 'Değişimler 20 °C ve 40 °C, eşit değil (II yanlış); denge 40 °C (III yanlış). <em>Yalnız I</em> ✓'], n: ['TUZAK: iki sıcaklığın ortalamasını almak (yalnız ısı sığaları eşitse doğru).'] } },
    { q: { t: 'İç enerjisi çok büyük olan 10 °C\'lik havuza 50 °C\'lik küçük bir demir bilye bırakılıyor. Isı hangi yönde akar ve ne zaman durur?', o: ['Bilyeden suya; sıcaklıklar eşitlenince durur', 'Sudan bilyeye; iç enerjiler eşitlenince durur', 'Sudan bilyeye; sıcaklıklar eşitlenince durur', 'Bilyeden suya; iç enerjiler eşitlenince durur'],
      s: ['Isı her zaman sıcaklığı yüksek olandan düşük olana akar: <em>bilyeden suya</em>.', 'Akış sıcaklıklar eşitlenince durur ✓'], n: ['TUZAK: ısının iç enerjisi büyük olandan aktığını düşünmek.'] } },
    { q: { t: 'Güneş altında özdeş siyah ve beyaz tişörtler bekletiliyor.<br>I. Koyu renkli yüzey ışınları daha çok soğurur.<br>II. Güneş\'in ısısı Dünya\'ya iletimle gelir.<br>III. Açık renkli yüzey ışınları daha çok yansıtır.<br>Hangileri doğrudur?', o: ['I ve III', 'Yalnız I', 'I ve II', 'I, II ve III'],
      s: ['I ve III doğru.', 'Uzay boşluktur: Güneş\'in ısısı <em>ışımayla</em> gelir (II yanlış). <em>I ve III</em> ✓'], n: ['TUZAK: Güneş ısısının iletimle geldiğini sanmak.'] } },
    { q: { t: 'Ortasında dairesel delik bulunan metal levha ısıtılıyor.<br>I. Levha her yönde genleşir.<br>II. Delik küçülür.<br>III. Delikten bilye daha kolay geçer.<br>Hangileri doğrudur?', o: ['I ve III', 'Yalnız I', 'I ve II', 'II ve III'],
      s: ['Levha her yönde genleşir; delik de levha gibi <em>büyür</em>.', 'Delik büyüdüğü için bilye daha kolay geçer. <em>I ve III</em> ✓'], n: ['TUZAK: ısınınca deliğin küçüldüğünü düşünmek. Delik, levhanın "eksik parçası" gibi o da genleşir.'] } },
    { do: S => { S.T = 4; }, q: { t: 'Su 0 °C\'den 4 °C\'ye kadar ısıtılıyor.<br>I. Hacmi artar.<br>II. Özkütlesi artar.<br>III. Kütlesi değişmez.<br>Hangileri doğrudur?', o: ['II ve III', 'Yalnız III', 'I ve III', 'I, II ve III'], f: ['e5T'],
      s: ['0–4 °C arasında su ısınınca <em>büzülür</em>: hacim azalır (I yanlış).', 'Kütle sabit, hacim azalır → özkütle artar (II); kütle değişmez (III). <em>II ve III</em> ✓'], n: ['TUZAK: ısınan her maddenin genleştiğini sanmak. Bu yüzden göllerin dibi 4 °C\'de kalır.'] } },
  ] });
  FZ.konuEk('TYT', 'Isı ve Sıcaklık', { dersler: [dKal], gorevler: [gIsi8, tuzak1, tuzak2] });

  // =====================================================================
  // ELEKTROSTATİK · "Kazağın çıtırtısı" (mevcut iki küre sahnesi)
  // =====================================================================
  const sElk = FZ.taban('TYT', 'Elektrostatik');
  const dokun = (S, a, b, ra = 0.6, rb = 0.6) => { S.qa = a; S.qb = b; S.ra = ra; S.rb = rb; S.dok = 0; S.faz = 0; S.paylasti = 0; };
  const dElk = ders(sElk, { yk: 'TYT6-d2', no: 2, icon: '🧶', name: 'Kazağın çıtırtısı: 7 adımda elektrostatik', task: 'Yük ve temel yük, iletken-yalıtkan, elektriklenme yolları, dokunmada paylaşım, elektroskop, Coulomb kuvveti.', steps: [
    { k: { tur: 'merak', b: 'Kazağını çıkarırken neden çıtırdıyor?', m: ['Karanlıkta minik kıvılcımlar, havaya kalkan saçlar… Sihir değil: elektrostatik.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Elektrik yükü', m: ['Proton ve elektron sayısı eşitse cisim nötrdür. Elektron kazanan (−), kaybeden (+) yüklenir.', 'Hareket eden her zaman <em>elektrondur</em>; proton çekirdekte yerinde durur.', `${FM('q = n · e')} · e = 1,6 · 10<sup>−19</sup> C (temel yük)`] } },
    { k: { tur: 'dikkat', b: 'Yük e\'nin tam katıdır', m: ['"2,5e" gibi bir yük olamaz: o şıkkı doğrudan ele.'] } },
    { k: { tur: 'kavram', b: 'İletken ve yalıtkan', m: ['İletkende yük serbestçe hareket eder ve dış yüzeye yayılır; yalıtkanda konduğu yerde kalır.', 'Metaller, insan vücudu, toprak iletken; plastik, cam, kuru tahta, kauçuk yalıtkandır.', 'Elde tutulan metal çubuk sürtülerek yüklenmez: yük vücuttan toprağa akar.'] } },
    { k: { tur: 'kavram', b: 'Üç elektriklenme yolu', m: ['<em>Sürtünme</em>: cisimler zıt işaretli, eşit miktarda yüklenir (cam–ipek: cam +, ipek −).', '<em>Dokunma</em>: yüklü iletken nötr iletkene yükünü paylaştırır; ikisi aynı işaretli olur.', '<em>Etki</em>: yüklü cisim yaklaşınca iletkenin yakın ucu zıt, uzak ucu aynı işaretle yüklenir. Nötr cisim yüklü cisme her zaman çekilir.'] } },
    { do: S => dokun(S, 9, 0, 0.4, 0.8), p: { t: 'Yarıçapı r olan +9q yüklü küre, yarıçapı 2r olan nötr küreye dokunuyor. Küçük kürede kaç q kalır?', o: ['+4,5q', '+3q', '+6q', '0'], d: 1 } },
    { sub: 'Küreleri dokunduralım.', go: '▶︎ Dokundur' },
    { do: S => { S.dok = 1; }, sub: 'Yük yarıçapla orantılı paylaşılıyor…', until: S => S.faz >= 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Dokunmada paylaşım', f: ['e6a', 'e6b'], m: ['İletken küreler dokununca yük <em>yarıçapla orantılı</em> paylaşılır: r : 2r = 1 : 2.', '9q → küçüğe 3q, büyüğe 6q. Özdeş kürelerde toplam ikiye bölünür.'] } },
    { do: S => dokun(S, 6, -2), k: { tur: 'dikkat', b: 'Toplamı işaretiyle al', m: ['+6q ile −2q dokunursa toplam +4q → her biri <em>+2q</em> (4q değil!).'] } },
    { k: { tur: 'kavram', b: 'Elektroskop', m: ['Yapraklar ne kadar açıksa yapraklardaki yük o kadar fazladır.', '(+) yüklü elektroskoba (+) cisim yaklaşırsa yapraklar <em>açılır</em>; (−) cisim ya da nötr iletken yaklaşırsa <em>kapanır</em>.', 'Kapandı diye cisim kesin zıt yüklüdür diyemezsin: nötr iletken de olabilir.'] } },
    { do: S => dokun(S, 4, 2), k: { tur: 'kavram', b: 'Coulomb kuvveti', f: ['e6F', 'e6F2'], m: [`${FM(`F = k ${F('q<sub>1</sub> · q<sub>2</sub>', 'd<sup>2</sup>')}`)} · aynı işaretliler iter, zıtlar çeker.`, 'Uzaklık 2 katına çıkarsa kuvvet 1/4\'üne iner.', 'Yükler farklı olsa da iki cismin birbirine uyguladığı kuvvetler <em>eşit büyüklükte, zıt yönlüdür</em> (oklar eşit).'] } },
    { k: { tur: 'ornek', b: 'TYT tarzı soru', m: ['Özdeş K, L, M kürelerinin yükleri +10q, −2q, 0. Önce K ile L, sonra L ile M dokundurulup ayrılıyor.', 'K–L: toplam +8q → ikisi de +4q. L–M: +4q → ikisi de +2q.', '<em>K: +4q · L: +2q · M: +2q</em>'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Sürtünme: zıt ve eşit · dokunma: aynı işaret · etki: yakın uçta zıt yük.', `${FM('q = n e')} · paylaşım yarıçapla orantılı · ${FM(`F = k ${F('q<sub>1</sub>q<sub>2</sub>', 'd<sup>2</sup>')}`)}`] } },
  ] });
  const gElk = gorev(sElk, { yk: 'TYT6-g2', no: 2, icon: '🧶', name: 'Elektrostatik · TYT soruları', task: 'Dokunma, yarıçapla paylaşım, elektroskop ve Coulomb kuvveti soruları.', data: [['Küreler', 'iletken']], steps: [
    { do: S => dokun(S, 10, -2), sub: 'Özdeş K, L, M küreleri: +10q, −2q ve 0.', go: '▶︎ Başlat' },
    { do: S => { S.dok = 1; }, q: { t: 'Özdeş iletken K, L, M kürelerinin yükleri +10q, −2q ve 0. Önce K ile L, sonra L ile M dokundurulup ayrılıyor. Son yükler nedir?', o: ['K: +4q · L: +2q · M: +2q', 'K: +4q · L: +4q · M: 0', 'K: +5q · L: +2q · M: +2q', 'K: +6q · L: +3q · M: +3q'], f: ['e6a', 'e6b'],
      s: ['K–L: (+10q − 2q)/2 = +4q → K = L = +4q', 'L–M: (+4q + 0)/2 = +2q → L = M = +2q', '<em>K: +4q · L: +2q · M: +2q</em> ✓'], n: ['Her dokunmada yalnız o iki kürenin toplamı paylaşılır.'] } },
    { do: S => dokun(S, 9, 0, 0.4, 0.8), q: { t: 'Yarıçapı r olan +9q yüklü küre, yarıçapı 2r olan nötr küreye dokundurulup ayrılıyor. Büyük kürenin yükü kaç q olur?', o: ['+6q', '+3q', '+4,5q', '+9q'], f: ['e6a', 'e6b'],
      s: ['Yük yarıçapla orantılı paylaşılır: 1 : 2', 'Büyük küre: 9q · (2/3) = <em>+6q</em> ✓'], n: ['Büyük küre daha çok yük alır ama yüzeyindeki yük yoğunluğu daha küçüktür.'] } },
    { do: S => dokun(S, 6, -2), q: { t: 'Özdeş iki iletken kürenin yükleri +6q ve −2q. Dokundurulup ayrılınca her birinin yükü ne olur?', o: ['+2q', '+4q', '+3q ve −1q', '0'], f: ['e6a', 'e6b'],
      s: ['Toplam işaretiyle: +6q − 2q = +4q', 'Özdeş → eşit paylaşım: <em>+2q</em> ✓'], n: ['Toplamı işaretsiz alıp 8q/2 = 4q bulmak sık yapılan hatadır.'] } },
    { q: { t: '(+) yüklü bir elektroskoba bir X cismi yaklaştırılınca yapraklar biraz kapanıyor. X için ne söylenebilir?', o: ['(−) yüklü ya da nötr iletken olabilir', 'Kesinlikle (−) yüklüdür', 'Kesinlikle (+) yüklüdür', 'Kesinlikle nötrdür'],
      s: ['Zıt yüklü cisim de, nötr iletken de yaprakları kapatır.', 'Kesin karar verilemez: <em>(−) ya da nötr iletken</em> ✓'], n: ['Yapraklar <em>açılıyorsa</em> cisim kesinlikle aynı işaretlidir.'] } },
    { do: S => dokun(S, 4, 2), q: { t: 'İki noktasal yük arasındaki uzaklık 2 katına çıkarılırsa aralarındaki elektriksel kuvvet F kaç olur?', o: [F('F', '4'), F('F', '2'), '2F', '4F'], f: ['e6F', 'e6F2'],
      s: [`F ∝ ${F('1', 'd<sup>2</sup>')} → ${F('1', '2<sup>2</sup>')} = ${F('1', '4')} → <em>${F('F', '4')}</em> ✓`], n: ['Yükler farklı olsa bile iki yüke etki eden kuvvetler eşit büyüklüktedir (Newton\'un 3. yasası).'] } },
  ] });
  FZ.konuEk('TYT', 'Elektrostatik', { dersler: [dElk], gorevler: [gElk] });
})();
