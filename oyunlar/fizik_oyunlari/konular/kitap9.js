// Kitap soru bankası · AYT ELEKTRİK–MANYETİZMA, DÖNME, KÜTLE ÇEKİM, HARMONİK HAREKET, DALGA MEKANİĞİ, ATOM ve MODERN FİZİK
// Benim Hocam AYT s.127–320'deki SORU TİPLERİ örnek alınmıştır; sorular, sayılar ve durumlar özgündür.
(function () {
  const { gorev } = FZ;
  const bank = (ad, yk, icon, name, task, steps, tuzak) => { const b = FZ.taban('AYT', ad); if (!b) return; const L = [];
    [steps, tuzak || []].forEach(A => A.forEach(st => { if (st.goster && st.q && !st.q.goster) st.q.goster = st.goster; if (st.q && !st.sub) st.sub = steps[0].sub; if (st.q) st.q.kartGizle = true; }));   // sahnenin hesap kartları cevabı ele vermesin
    L.push(gorev(b, { yk: yk + '-k', no: 9, icon, name: 'Kitap soruları: ' + name, task, steps, data: [] }));
    if (tuzak) L.push(gorev(b, { yk: yk + '-t', no: 10, icon: '🪤', name: 'Tuzak sorular: ' + name, tuzak: true, task: 'Sık yapılan hatalar.', steps: tuzak, data: [] }));
    FZ.konuEk('AYT', ad, { gorevler: L }); };
  const D = (o) => S => Object.assign(S, o);
  const BAS = (o, sub) => ({ do: D(o), sub, go: '▶︎ Başla' });
  const TZ = (o) => ({ do: D(o), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' });

  // ---------------- ELEKTRİKSEL KUVVET VE ALAN (q1, q2, x1, x2, xp, ikinci) ----------------
  bank('Elektriksel Kuvvet ve Alan', 'AYT11', '⚡', 'elektriksel kuvvet ve alan', 'Coulomb kuvveti, uzaklıkla değişim, elektrik alan, alanın sıfır olduğu nokta.', [
    BAS({ ikinci: 1, q1: 2, q2: 3, x1: -1.5, x2: 1.5, xp: 0 }, 'Noktasal yükler ve P noktası.'),
    { do: D({ ikinci: 1, q1: 2, q2: 3, x1: -1.5, x2: 1.5, xp: 0 }), q: { t: '+2 μC ve +3 μC\'luk noktasal yükler arasında 3 m var. Birbirlerine uyguladıkları kuvvet kaç N\'dur? (k = 9 · 10⁹ N·m²/C²)', o: ['6 · 10⁻³', '2 · 10⁻³', '18 · 10⁻³', '6 · 10⁻⁶'],
      b: [FM(`F = k ${F('q<sub>1</sub> · q<sub>2</sub>', 'd<sup>2</sup>')}`), '1 μC = 10⁻⁶ C'], s: [`F = 9 · 10⁹ · ${F('2 · 10⁻⁶ · 3 · 10⁻⁶', '9')} = <em>6 · 10⁻³ N</em> ✓ (itme)`] } },
    { do: D({ ikinci: 1, q1: 2, q2: 3, x1: -0.75, x2: 0.75, xp: 0 }), q: { t: 'İki yük arasındaki uzaklık yarıya indirilirse aralarındaki kuvvet kaç katına çıkar?', o: ['4', '2', '½', '¼'],
      b: [FM(`F = k ${F('q<sub>1</sub> · q<sub>2</sub>', 'd<sup>2</sup>')}`)], s: ['F ∝ 1/d² → d yarıya → F <em>4 katı</em> ✓'] } },
    { do: D({ ikinci: 0, q1: 9, x1: -3, xp: 0 }), q: { t: '+9 μC\'luk yükten 3 m uzaktaki noktada elektrik alanın büyüklüğü kaç N/C\'dir?', o: ['9000', '27 000', '3000', '81 000'],
      b: [FM(`E = k ${F('q', 'd<sup>2</sup>')}`)], s: [`E = 9 · 10⁹ · ${F('9 · 10⁻⁶', '9')} = <em>9000 N/C</em> ✓`], n: ['Alan yönü: (+) yükten dışarı doğru.'] } },
    { do: D({ ikinci: 1, q1: 4, q2: 9, x1: -2.5, x2: 2.5, xp: -0.5 }), q: { t: '+4 μC ve +9 μC\'luk yükler 5 m aralıklı. Aralarında bileşke alanın sıfır olduğu nokta +4 μC\'luk yükten kaç m uzaktadır?', o: ['2', '3', '2,5', '1'],
      b: ['İki alan eşit ve zıt olmalı: ' + FM(`k ${F('q<sub>1</sub>', 'x<sup>2</sup>')} = k ${F('q<sub>2</sub>', '(d − x)<sup>2</sup>')}`)], s: [`${F('x', '5 − x')} = ${F('√4', '√9')} = ${F('2', '3')}`, '3x = 10 − 2x → x = <em>2 m</em> ✓'], n: ['Aynı işaretli yüklerde alanın sıfır olduğu nokta aralarında, küçük yüke yakındır.'] } },
    { do: D({ ikinci: 0, q1: 6, x1: -2, xp: 1 }), q: { t: 'Düzgün olmayan bir alanda alan çizgilerinin sık olduğu bölge için ne söylenir?', o: ['Alan şiddeti büyüktür', 'Alan sıfırdır', 'Potansiyel sıfırdır', 'Yük bulunamaz'],
      b: ['Alan çizgileri (+) yükten çıkar, (−) yüke girer; çizgi yoğunluğu alanın büyüklüğünü gösterir.'], s: ['Çizgiler sık → <em>alan büyük</em> ✓'] } },
  ], [
    TZ({ ikinci: 1, q1: 1, q2: 4, x1: -1.5, x2: 1.5, xp: 0 }),
    { do: D({ ikinci: 1, q1: 1, q2: 4, x1: -1.5, x2: 1.5, xp: 0 }), q: { t: '+1 μC\'luk yük +4 μC\'luk yüke F kuvveti uyguluyorsa, +4 μC\'luk yük +1 μC\'luk yüke kaç F uygular?', o: ['F', '4F', 'F/4', '16F'],
      b: ['Newton\'un 3. yasası: etki = tepki.'], s: ['Kuvvetler eşit büyüklükte, zıt yönlü → <em>F</em> ✓'], n: ['TUZAK: büyük yükün daha büyük kuvvet uygulayacağını sanmak. Yükler farklı ama kuvvetler eşittir; ivmeler kütlelere göre değişir.'] } },
    { do: D({ ikinci: 0, q1: 6, x1: -2, xp: 1 }), q: { t: 'Elektrik alanda serbest bırakılan elektron hangi yönde hızlanır?', o: ['Alan çizgilerine zıt yönde', 'Alan çizgileri yönünde', 'Alana dik', 'Hareket etmez'],
      b: [FM('F = q · E') + ' · elektronun yükü negatiftir.'], s: ['q < 0 → kuvvet alana <em>zıt</em> ✓'], n: ['TUZAK: her yükün alan yönünde gideceğini sanmak; alan yönü (+) deneme yükü için tanımlıdır.'] } },
  ]);

  // ---------------- ELEKTRİKSEL POTANSİYEL (Q, r, hedef) ----------------
  bank('Elektriksel Potansiyel', 'AYT12', '🔋', 'elektriksel potansiyel', 'Potansiyel, iş, potansiyel enerji, eş potansiyel yüzey.', [
    BAS({ Q: 6, r: 3, hedef: 3 }, 'Merkezde yük, çevresinde deneme yükü.'),
    { do: D({ Q: 6, r: 3, hedef: 3 }), q: { t: '+6 μC\'luk yükten 3 m uzaktaki noktanın potansiyeli kaç V\'tur?', o: ['18 000', '6000', '54 000', '2000'],
      b: [FM(`V = k ${F('q', 'd')}`)], s: [`V = 9 · 10⁹ · ${F('6 · 10⁻⁶', '3')} = <em>18 000 V</em> ✓`] } },
    { do: D({ Q: 6, r: 4, hedef: 4 }), goster: D({ hedef: 2 }), q: { t: '+3 μC\'luk yük, potansiyeli 2000 V olan noktadan 8000 V olan noktaya taşınıyor. Yapılması gereken iş kaç J\'dür?', o: ['0,018', '0,006', '0,024', '0,03'],
      b: [FM('W = q · (V<sub>son</sub> − V<sub>ilk</sub>)')], s: ['W = 3 · 10⁻⁶ · 6000 = <em>0,018 J</em> ✓'] } },
    { do: D({ Q: 2, r: 3, hedef: 3 }), q: { t: '+2 μC ve +3 μC\'luk yükler arasında 3 m var. Sistemin elektriksel potansiyel enerjisi kaç J\'dür?', o: ['0,018', '0,006', '0,054', '0,002'],
      b: [FM(`U = k ${F('q<sub>1</sub> q<sub>2</sub>', 'd')}`)], s: [`U = 9 · 10⁹ · ${F('6 · 10⁻¹²', '3')} = <em>0,018 J</em> ✓`] } },
    { do: D({ Q: 6, r: 3, hedef: 3 }), q: { t: 'Yük, yükü merkez alan bir çember (eş potansiyel yüzey) üzerinde bir noktadan diğerine taşınırsa yapılan iş nedir?', o: ['Sıfır', 'q · V', 'Yolun uzunluğuna bağlı', 'Negatif'],
      b: [FM('W = q · ΔV') + ' · eş potansiyel yüzeyde her noktanın potansiyeli aynıdır.'], s: ['ΔV = 0 → <em>W = 0</em> ✓'] } },
  ], [
    TZ({ Q: 6, r: 3, hedef: 3 }),
    { do: D({ Q: 6, r: 3, hedef: 3 }), q: { t: '+Q ve −Q yüklerinin tam ortasındaki noktada potansiyel ve alan için ne söylenir?', o: ['Potansiyel sıfır, alan sıfır değil', 'İkisi de sıfır', 'Alan sıfır, potansiyel sıfır değil', 'İkisi de sıfırdan farklı ve eşit'],
      b: ['Potansiyel skalerdir (işaretleriyle toplanır); alan vektördür.'], s: ['V = kQ/d − kQ/d = 0', 'İki alan da (−) yüke doğru, aynı yönde → toplanır: <em>alan sıfır değil</em> ✓'], n: ['TUZAK: potansiyel sıfır olan yerde alanın da sıfır olduğunu sanmak.'] } },
  ]);

  // ---------------- DÜZGÜN ELEKTRİK ALAN VE SIĞA (V, d, x, v, kos) ----------------
  bank('Düzgün Elektrik Alan ve Sığa', 'AYT13', '🧲', 'düzgün alan ve sığa', 'Paralel levhalar, yüklü parçacığın enerjisi, sığa, pil bağlı/ayrılmış kondansatör, enerji.', [
    BAS({ V: 200, d: 4, x: 0, v: 0, kos: 0 }, 'Paralel levhalı kondansatör.'),
    { do: D({ V: 200, d: 4, x: 0, v: 0, kos: 0 }), goster: D({ x: 0, v: 0, kos: 1 }), q: { t: 'Aralarında 4 cm bulunan paralel levhalar arasına 200 V uygulanıyor. Levhalar arasındaki alan kaç V/m\'dir?', o: ['5000', '50', '800', '500'],
      b: [FM(`E = ${F('V', 'd')}`)], s: [`E = ${F('200', '0,04')} = <em>5000 V/m</em> ✓`] } },
    { do: D({ V: 300, d: 4, x: 0, v: 0, kos: 0 }), goster: D({ x: 0, v: 0, kos: 1 }), q: { t: '4 μC\'luk yük, 300 V potansiyel farkı olan levhaların birinden diğerine hızlanıyor. Kazandığı kinetik enerji kaç J\'dür?', o: ['1,2 · 10⁻³', '1,2 · 10⁻⁶', '7,5 · 10⁻⁵', '12'],
      b: [FM('ΔE<sub>k</sub> = q · V')], s: ['ΔE<sub>k</sub> = 4 · 10⁻⁶ · 300 = <em>1,2 · 10⁻³ J</em> ✓'] } },
    { do: D({ V: 12, d: 4 }), q: { t: 'Sığası 5 μF olan kondansatör 12 V\'luk pile bağlanıyor. Depoladığı yük kaç μC\'dir?', o: ['60', '2,4', '17', '0,42'],
      b: [FM('q = C · V')], s: ['q = 5 · 12 = <em>60 μC</em> ✓'] } },
    { do: D({ V: 12, d: 2 }), q: { t: 'Pile bağlı kondansatörün levhaları arasındaki uzaklık yarıya indirilirse yükü ne olur?', o: ['2 katına çıkar', 'Yarıya iner', 'Değişmez', '4 katına çıkar'],
      b: [`${FM(`C = ε ${F('A', 'd')}`)} · pile bağlıyken V sabittir · ${FM('q = C V')}`], s: ['d yarıya → C 2 katı; V sabit → q <em>2 katı</em> ✓'] } },
    { do: D({ V: 24, d: 8 }), q: { t: 'Yüklenip pilden ayrılan kondansatörün levhaları arası uzaklık 2 katına çıkarılırsa levhalar arası gerilim ne olur?', o: ['2 katına çıkar', 'Yarıya iner', 'Değişmez', 'Sıfır olur'],
      b: ['Pilden ayrılınca yük q sabit kalır.', `${FM(`C = ε ${F('A', 'd')}`)} · ${FM(`V = ${F('q', 'C')}`)}`], s: ['d 2 katı → C yarıya; q sabit → V <em>2 katı</em> ✓'] } },
    { do: D({ V: 100, d: 4 }), q: { t: 'Sığası 10 μF olan kondansatör 100 V ile yüklenmiş. Depoladığı enerji kaç J\'dür?', o: ['0,05', '0,1', '0,001', '500'],
      b: [FM(`E = ${F('1', '2')} C V<sup>2</sup>`)], s: [`E = ${F('1', '2')} · 10 · 10⁻⁶ · 10⁴ = <em>0,05 J</em> ✓`] } },
  ], [
    TZ({ V: 200, d: 4 }),
    { do: D({ V: 200, d: 4 }), q: { t: 'Levhalar arasına konan bir elektron hangi levhaya doğru hızlanır?', o: ['(+) levhaya', '(−) levhaya', 'Hareket etmez', 'Levhalara paralel gider'],
      b: [FM('F = q E') + ' · elektron (−) yüklüdür.'], s: ['Elektron alana zıt yönde, yani <em>(+) levhaya</em> doğru çekilir ✓'], n: ['TUZAK: alan okları yönünde gideceğini sanmak.'] } },
  ]);

  // ---------------- MANYETİZMA VE İNDÜKLENME (B, L, R, v, x, kos) ----------------
  bank('Manyetizma ve İndüklenme', 'AYT14', '🧲', 'manyetizma ve indüksiyon', 'İndüksiyon emk\'sı, akım, tele etki eden kuvvet, yüklü parçacığa kuvvet, Lenz.', [
    BAS({ B: 0.4, L: 0.5, R: 2, v: 5, x: -2, kos: 0 }, 'Manyetik alanda raylar üzerinde kayan iletken çubuk.'),
    { do: D({ B: 0.4, L: 0.5, R: 2, v: 5, x: -2, kos: 0 }), goster: D({ x: -2, kos: 1 }), q: { t: 'B = 0,4 T\'lık alanda 0,5 m\'lik çubuk raylar üzerinde 5 m/s ile çekiliyor. Çubukta oluşan emk kaç V\'tur?', o: ['1', '10', '0,1', '4'],
      b: [FM('ε = B · L · v')], s: ['ε = 0,4 · 0,5 · 5 = <em>1 V</em> ✓'] } },
    { do: D({ B: 0.4, L: 0.5, R: 2, v: 5, x: -2, kos: 0 }), goster: D({ x: -2, kos: 1 }), q: { t: 'Aynı devrenin direnci 2 Ω ise devreden geçen akım kaç A\'dir?', o: ['0,5', '2', '1', '0,2'],
      b: [`${FM('ε = B L v')} · ${FM(`I = ${F('ε', 'R')}`)}`], s: ['ε = 1 V', `I = ${F('1', '2')} = <em>0,5 A</em> ✓`] } },
    { do: D({ B: 0.5, L: 0.2, R: 2, v: 0, x: 0, kos: 0 }), q: { t: '0,5 T\'lık alana dik, 0,2 m uzunluğundaki telden 4 A akım geçiyor. Tele etki eden manyetik kuvvet kaç N\'dur?', o: ['0,4', '4', '0,1', '2,5'],
      b: [FM('F = B · I · L') + ' (alan tele dikken)'], s: ['F = 0,5 · 4 · 0,2 = <em>0,4 N</em> ✓'], n: ['Yön sağ el kuralıyla bulunur.'] } },
    { do: D({ B: 0.5, L: 0.4, R: 4, v: 0, x: 0, kos: 0 }), q: { t: '3 μC\'luk yük 0,5 T\'lık alana dik olarak 2000 m/s hızla giriyor. Yüke etki eden manyetik kuvvet kaç N\'dur?', o: ['3 · 10⁻³', '3', '3 · 10⁻⁶', '1,5 · 10⁻³'],
      b: [FM('F = q · v · B') + ' (hız alana dikken)'], s: ['F = 3 · 10⁻⁶ · 2000 · 0,5 = <em>3 · 10⁻³ N</em> ✓'], n: ['Manyetik kuvvet hıza diktir: yükü çembersel yörüngeye sokar, hızın büyüklüğünü değiştirmez.'] } },
    { do: D({ B: 0.5, L: 0.4, R: 4, v: 0, x: 0, kos: 0 }), q: { t: 'Uzun düz telden geçen akımın oluşturduğu manyetik alan, telden uzaklık 2 katına çıkarılırsa ne olur?', o: ['Yarıya iner', '2 katına çıkar', '4\'te birine iner', 'Değişmez'],
      b: [FM(`B = 2k ${F('I', 'd')}`)], s: ['B ∝ 1/d → <em>yarıya iner</em> ✓'] } },
  ], [
    TZ({ B: 0.4, L: 0.5, R: 2, v: 5, x: -2, kos: 0 }),
    { do: D({ B: 0.5, L: 0.4, R: 4, v: 0, x: 0, kos: 0 }), q: { t: 'Yüklü parçacık manyetik alan çizgilerine paralel hareket ediyorsa manyetik kuvvet nedir?', o: ['Sıfır', 'q v B', 'En büyük', 'Hızla ters yönlü'],
      b: [FM('F = q v B sin θ')], s: ['θ = 0° → <em>F = 0</em> ✓'], n: ['TUZAK: alan içindeki her yüklü parçacığa kuvvet etki ettiğini sanmak.'] } },
    { do: D({ B: 0.4, L: 0.5, R: 2, v: 5, x: -2, kos: 0 }), goster: D({ x: -2, kos: 1 }), q: { t: 'Raylar üzerinde çekilen çubuktan indüksiyon akımı geçiyor. Alanın bu akıma uyguladığı kuvvet nasıldır?', o: ['Harekete zıt (yavaşlatır)', 'Hareket yönünde (hızlandırır)', 'Yukarı doğru', 'Sıfır'],
      b: ['Lenz kuralı: indüksiyon akımı kendisini oluşturan değişime karşı koyar.'], s: ['Kuvvet <em>harekete zıttır</em> ✓; çubuğu sabit hızla çekmek için dış kuvvet gerekir.'], n: ['TUZAK: indüksiyonun "bedava enerji" verdiğini sanmak (enerjinin korunumu).'] } },
  ]);

  // ---------------- ALTERNATİF AKIM VE TRANSFORMATÖR (N1, N2, V1, ac, f) ----------------
  bank('Alternatif Akım ve Transformatörler', 'AYT15', '🔌', 'alternatif akım ve transformatör', 'Sarım oranı, ideal transformatörde güç, etkin değer, endüktif reaktans.', [
    BAS({ N1: 400, N2: 100, V1: 220, ac: 1 }, 'Transformatör: birinci ve ikinci bobin.'),
    { do: D({ N1: 400, N2: 100, V1: 220, ac: 1 }), q: { t: 'Birinci bobini 400, ikincisi 100 sarımlı transformatörün birincisine 220 V uygulanıyor. İkinci bobinin gerilimi kaç V\'tur?', o: ['55', '880', '220', '110'],
      b: [FM(`${F('V<sub>2</sub>', 'V<sub>1</sub>')} = ${F('N<sub>2</sub>', 'N<sub>1</sub>')}`)], s: [`V<sub>2</sub> = 220 · ${F('100', '400')} = <em>55 V</em> ✓ (düşürücü)`] } },
    { do: D({ N1: 400, N2: 20, V1: 220, ac: 1 }), q: { t: 'İdeal transformatörün birinci devresi 220 V ve 0,5 A. İkinci devrenin gerilimi 11 V ise akımı kaç A\'dir?', o: ['10', '0,025', '0,5', '5'],
      b: ['İdeal transformatörde güç korunur: ' + FM('V<sub>1</sub> I<sub>1</sub> = V<sub>2</sub> I<sub>2</sub>')], s: ['220 · 0,5 = 11 · I<sub>2</sub>', 'I<sub>2</sub> = <em>10 A</em> ✓'] } },
    { do: D({ N1: 200, N2: 200, V1: 311, ac: 1 }), q: { t: 'Tepe değeri 311 V olan alternatif gerilimin etkin değeri yaklaşık kaç V\'tur? (√2 = 1,41)', o: ['220', '311', '440', '155'],
      b: [FM(`V<sub>etkin</sub> = ${F('V<sub>max</sub>', '√2')}`)], s: [`${F('311', '1,41')} ≈ <em>220 V</em> ✓`], n: ['Prizdeki "220 V" etkin değerdir.'] } },
    { do: D({ N1: 200, N2: 1000, V1: 220, ac: 1 }), q: { t: 'Elektrik santralinden şehre enerji iletilirken gerilim neden yükseltilir?', o: ['Akım düşer, hatlardaki ısı kaybı azalır', 'Enerji artar', 'Frekans yükselir', 'Akım artar, ışık parlar'],
      b: ['Aynı gücü (P = V I) yüksek gerilimle iletmek akımı küçültür.', FM('P<sub>kayıp</sub> = I<sup>2</sup> R')], s: ['V büyük → I küçük → I²R kaybı <em>azalır</em> ✓'] } },
    { do: D({ N1: 200, N2: 1000, V1: 220, ac: 1, f: 0.5 }), q: { t: '0,2 H\'lik bobin 50 Hz\'lik alternatif akım devresine bağlanıyor. Bobinin endüktif reaktansı kaç Ω\'dur? (π = 3)', o: ['60', '10', '30', '600'],
      b: [FM('X<sub>L</sub> = 2π f L')], s: ['X<sub>L</sub> = 2 · 3 · 50 · 0,2 = <em>60 Ω</em> ✓'] } },
  ], [
    TZ({ N1: 400, N2: 100, V1: 220, ac: 1 }),
    { do: D({ N1: 200, N2: 1000, V1: 220, ac: 1 }), q: { t: 'Yükseltici transformatör gerilimi 5 katına çıkarıyorsa çıkış gücü (ideal) ne olur?', o: ['Giriş gücüne eşittir', '5 katına çıkar', '25 katına çıkar', '5\'te birine iner'],
      b: ['İdeal transformatörde enerji kaybı yoktur.'], s: ['Gerilim 5 katı, akım 5\'te biri → <em>güç aynı</em> ✓'], n: ['TUZAK: transformatörün enerji kazandırdığını sanmak.'] } },
  ]);

  // ---------------- DÖNME VE AÇISAL MOMENTUM (r, hedef, L, ac) ----------------
  bank('Dönme ve Açısal Momentum', 'AYT17', '⛸️', 'dönme ve açısal momentum', 'Eylemsizlik momenti, açısal momentumun korunumu, dönme kinetik enerjisi, tork.', [
    BAS({ hedef: 1, r: 1, L: 12 }, 'Dönen platformda kollarında ağırlık tutan kişi.'),
    { do: D({ hedef: 1, r: 1, L: 12 }), goster: D({ hedef: 0.5 }), q: { t: 'Eylemsizlik momenti 6 kg·m² olan sistem 2 rad/s ile dönüyor. Dış tork olmadan I = 2 kg·m²\'ye düşerse açısal hızı kaç rad/s olur?', o: ['6', '2', '4', '0,67'],
      b: [FM('I<sub>1</sub> ω<sub>1</sub> = I<sub>2</sub> ω<sub>2</sub>')], s: ['6 · 2 = 2 · ω → ω = <em>6 rad/s</em> ✓'] } },
    { do: D({ hedef: 1, r: 1, L: 12 }), q: { t: 'Eylemsizlik momenti 2 kg·m² olan disk 3 rad/s ile dönüyor. Dönme kinetik enerjisi kaç J\'dür?', o: ['9', '6', '18', '3'],
      b: [FM(`E<sub>k</sub> = ${F('1', '2')} I ω<sup>2</sup>`)], s: [`E = ${F('1', '2')} · 2 · 9 = <em>9 J</em> ✓`] } },
    { do: D({ hedef: 0.5, r: 0.5, L: 12 }), q: { t: 'Kütlesiz çubuğun iki ucunda, dönme ekseninden 0,5 m uzakta 2\'şer kg\'lık kütleler var. Eylemsizlik momenti kaç kg·m²\'dir?', o: ['1', '2', '0,5', '4'],
      b: [FM('I = Σ m r<sup>2</sup>')], s: ['I = 2 · 0,25 + 2 · 0,25 = <em>1 kg·m²</em> ✓'] } },
    { do: D({ hedef: 1, r: 1, L: 12 }), q: { t: 'Eylemsizlik momenti 2 kg·m² olan tekere 6 N·m net tork uygulanıyor. Açısal ivmesi kaç rad/s²\'dir?', o: ['3', '12', '0,33', '6'],
      b: [FM('τ = I · α')], s: [`α = ${F('6', '2')} = <em>3 rad/s²</em> ✓`] } },
    { do: D({ hedef: 1, r: 1, L: 12 }), q: { t: 'Aynı kütle ve yarıçaptaki dolu silindir ile halka aynı eğik düzlemden kaymadan yuvarlanarak bırakılıyor. Hangisi dibe önce ulaşır?', o: ['Dolu silindir', 'Halka', 'Aynı anda', 'Kütleye bağlı'],
      b: ['Eylemsizlik momenti: dolu silindir ½ m r², halka m r².', 'Potansiyel enerjinin bir kısmı dönmeye gider; I büyükse ötelenme hızı küçük kalır.'], s: ['Silindirin I\'sı küçük → daha hızlı yuvarlanır → <em>dolu silindir</em> önce ✓'] } },
  ], [
    TZ({ hedef: 1, r: 1, L: 12 }),
    { do: D({ hedef: 1, r: 1, L: 12 }), goster: D({ hedef: 0.5 }), q: { t: 'Buz patencisi kollarını kapatınca açısal momentumu korunur. Dönme kinetik enerjisi için ne söylenir?', o: ['Artar', 'Korunur', 'Azalır', 'Sıfır olur'],
      b: [`${FM('L = I ω')} · ${FM(`E<sub>k</sub> = ${F('L<sup>2</sup>', '2I')}`)}`], s: ['L sabit, I azalır → E<sub>k</sub> <em>artar</em> ✓ (enerjiyi kaslar sağlar)'], n: ['TUZAK: açısal momentum korunuyorsa kinetik enerjinin de korunacağını sanmak.'] } },
  ]);

  // ---------------- KÜTLE ÇEKİM VE KEPLER (aAU, M, alan) ----------------
  bank('Kütle Çekim ve Kepler Yasaları', 'AYT18', '🪐', 'kütle çekim ve Kepler', 'Kepler\'in 3. yasası, yükseklikle g, uydu hızı, eşit alanlar.', [
    BAS({ aAU: 3, alan: 1 }, 'Güneş ve eliptik yörüngede gezegen.'),
    { do: D({ aAU: 9, alan: 1 }), q: { t: 'Güneş\'e ortalama uzaklığı 9 AB olan gezegenin yörünge periyodu kaç Dünya yılıdır?', o: ['27', '9', '81', '3'],
      b: [`Kepler 3: ${FM(`${F('T<sup>2</sup>', 'a<sup>3</sup>')} = sabit`)} · Dünya: a = 1 AB, T = 1 yıl`], s: ['T² = 9³ = 729', 'T = <em>27 yıl</em> ✓'] } },
    { do: D({ aAU: 3, alan: 1 }), q: { t: 'Yeryüzünde çekim ivmesi g. Yerden, Dünya yarıçapı kadar yükseklikte çekim ivmesi ne olur?', o: [`${F('g', '4')}`, `${F('g', '2')}`, 'g', `${F('g', '8')}`],
      b: [FM(`g = G ${F('M', 'r<sup>2</sup>')}`), 'r: Dünya\'nın merkezine uzaklık'], s: ['Yükseklik R → merkeze uzaklık 2R', `g' = ${F('g', '2<sup>2</sup>')} = <em>${F('g', '4')}</em> ✓`] } },
    { do: D({ aAU: 3, alan: 1 }), q: { t: 'Yarıçapı Dünya ile aynı, kütlesi 2 katı olan gezegenin yüzeyinde çekim ivmesi kaç g olur?', o: ['2g', 'g', '4g', `${F('g', '2')}`],
      b: [FM(`g = G ${F('M', 'R<sup>2</sup>')}`)], s: ['g ∝ M → <em>2g</em> ✓'] } },
    { do: D({ aAU: 3, alan: 1 }), q: { t: 'Dairesel yörüngedeki uydunun yörünge yarıçapı 4 katına çıkarsa yörünge hızı ne olur?', o: ['Yarıya iner', '2 katına çıkar', '4\'te birine iner', 'Değişmez'],
      b: [`Çekim merkezcil kuvveti sağlar: ${FM(`G ${F('M m', 'r<sup>2</sup>')} = m ${F('v<sup>2</sup>', 'r')}`)} → ${FM(`v = √${F('GM', 'r')}`)}`], s: ['v ∝ 1/√r → √4 = 2 → <em>yarıya iner</em> ✓'] } },
    { do: D({ aAU: 3, alan: 1 }), q: { t: 'Gezegen yörüngesinde nerede en hızlıdır?', o: ['Güneş\'e en yakın noktada (günberi)', 'En uzak noktada (günöte)', 'Her yerde aynı', 'Yörüngenin ortasında'],
      b: ['Kepler 2: Gezegeni Güneş\'e birleştiren doğru eşit sürelerde eşit alanlar tarar.'], s: ['Yakındayken yarıçap kısa → aynı alanı taramak için daha uzun yay → <em>günberide en hızlı</em> ✓'] } },
  ], [
    TZ({ aAU: 3, alan: 1 }),
    { do: D({ aAU: 3, alan: 1 }), q: { t: 'Uluslararası Uzay İstasyonu\'ndaki astronotun "ağırlıksız" görünmesinin nedeni nedir?', o: ['İstasyonla birlikte sürekli serbest düşmesi', 'Orada yer çekiminin olmaması', 'Havanın olmaması', 'Dünya\'nın manyetik alanı'],
      b: ['400 km yükseklikte g ≈ 8,7 m/s²: yer çekimi oradadır.'], s: ['Astronot ve istasyon aynı ivmeyle Dünya\'ya düşer (yörüngede dolanır) → <em>serbest düşme</em> ✓'], n: ['TUZAK: "uzayda yer çekimi yoktur" sanmak.'] } },
  ]);

  // ---------------- BASİT HARMONİK HAREKET (m, k, A, kos) ----------------
  const bh = (m, k, A) => S => Object.assign(S, { m, k, A, kos: 0, ph: 0, K: 5, vs: 0.6, as: 0.06 }), bhg = S => { S.kos = 1; };   // bütün sorularda aynı ölçek: 1 m → 5 birim, v oku 0,6/(m/s), a oku 0,06/(m/s²)
  bank('Basit Harmonik Hareket', 'AYT19', '🕰️', 'basit harmonik hareket', 'Yay–kütle ve sarkaç periyodu, en büyük hız ve ivme, periyodu etkileyenler.', [
    { do: bh(1, 100, 0.2), sub: 'Yaya bağlı blok sürtünmesiz yüzeyde.', go: '▶︎ Başla' },
    { do: bh(1, 100, 0.2), goster: bhg, q: { t: 'm = 1 kg, k = 100 N/m olan yay–kütle sisteminin periyodu kaç s\'dir? (π = 3)', o: ['0,6', '6', '0,3', '1,2'],
      b: [FM(`T = 2π √${F('m', 'k')}`)], s: [`T = 2 · 3 · √${F('1', '100')} = 6 · 0,1 = <em>0,6 s</em> ✓`] } },
    { do: bh(4, 100, 0.2), goster: bhg, q: { t: 'Yaya bağlı kütle 4 katına çıkarılırsa periyot kaç katına çıkar?', o: ['2', '4', '16', '½'],
      b: [FM(`T = 2π √${F('m', 'k')}`)], s: ['T ∝ √m → √4 = <em>2</em> ✓'] } },
    { do: bh(1, 100, 0.2), q: { t: '2,5 m uzunluğundaki basit sarkacın periyodu kaç s\'dir? (g = 10 m/s², π = 3)', o: ['3', '1,5', '6', '9,4'],
      b: [FM(`T = 2π √${F('L', 'g')}`)], s: [`T = 6 · √${F('2,5', '10')} = 6 · 0,5 = <em>3 s</em> ✓`] } },
    { do: bh(1, 100, 0.2), goster: bhg, q: { t: 'Genliği 0,2 m, açısal frekansı 10 rad/s olan harmonik hareketin en büyük hızı kaç m/s\'dir?', o: ['2', '20', '0,02', '50'],
      b: [`${FM('v<sub>max</sub> = A ω')} · ${FM('a<sub>max</sub> = A ω<sup>2</sup>')}`], s: ['v<sub>max</sub> = 0,2 · 10 = <em>2 m/s</em> ✓ (denge konumunda)'] } },
    { do: bh(1, 100, 0.2), goster: bhg, q: { t: 'Harmonik harekette cismin ivmesi nerede en büyüktür?', o: ['Uç noktalarda', 'Denge konumunda', 'Uç ile denge arasının ortasında', 'Her yerde eşit'],
      b: [FM('a = −ω<sup>2</sup> x') + ' · ivme uzanımla orantılıdır.'], s: ['|x| en büyük uçlarda → <em>ivme uçlarda en büyük</em> ✓; hız orada sıfır.'] } },
  ], [
    { do: bh(1, 100, 0.2), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: bh(1, 100, 0.4), goster: bhg, q: { t: 'Yay–kütle sisteminin genliği 2 katına çıkarılırsa periyodu ne olur?', o: ['Değişmez', '2 katına çıkar', '√2 katına çıkar', 'Yarıya iner'],
      b: [FM(`T = 2π √${F('m', 'k')}`)], s: ['Periyot genliğe bağlı değildir → <em>değişmez</em> ✓; en büyük hız 2 katına çıkar.'], n: ['TUZAK: "daha çok çekersem daha uzun sürer" sanmak.'] } },
    { do: bh(1, 100, 0.2), q: { t: 'Aynı yay–kütle sistemi ve aynı sarkaç Ay\'a götürülürse periyotları nasıl değişir?', o: ['Yayınki değişmez, sarkacınki artar', 'İkisi de artar', 'İkisi de değişmez', 'Yayınki artar, sarkacınki değişmez'],
      b: [`Yay: ${FM(`T = 2π √${F('m', 'k')}`)} · sarkaç: ${FM(`T = 2π √${F('L', 'g')}`)} · Ay\'da g küçüktür.`], s: ['Yay periyodu g\'ye bağlı değil; sarkaçta g azalınca T <em>artar</em> ✓'], n: ['TUZAK: iki sistemin de aynı davranacağını sanmak.'] } },
  ]);

  // ---------------- DALGA MEKANİĞİ (lam, P) ----------------
  bank('Dalga Mekaniği', 'AYT20', '🌊', 'dalga mekaniği', 'Girişim (katar–düğüm), Young deneyi, kırınım, Doppler.', [
    BAS({ lam: 1, P: 1 }, 'Dalga leğeninde iki noktasal kaynak.'),
    { do: D({ lam: 1, P: 1 }), q: { t: 'Aynı fazlı iki kaynaktan P noktasına uzaklıklar 10 cm ve 18 cm, dalga boyu 4 cm. P noktası nasıl titreşir?', o: ['Katar (en büyük genlik); 2. katar çizgisi', 'Düğüm (titreşmez)', '1. düğüm çizgisi', 'Merkez doğrusu'],
      b: ['Yol farkı Δ = n λ → katar · Δ = (n − ½) λ → düğüm'], s: ['Δ = 18 − 10 = 8 cm = 2λ', 'n = 2 → <em>2. katar çizgisi</em> ✓'] } },
    { do: D({ lam: 1, P: 1 }), q: { t: 'Young deneyinde λ = 500 nm, yarıklar arası 0,5 mm, perde uzaklığı 2 m. Saçak aralığı kaç mm\'dir?', o: ['2', '0,2', '20', '5'],
      b: [FM(`Δx = ${F('λ L', 'd')}`)], s: [`Δx = ${F('500 · 10⁻⁹ · 2', '0,5 · 10⁻³')} = 2 · 10⁻³ m = <em>2 mm</em> ✓`] } },
    { do: D({ lam: 1.4, P: 1 }), q: { t: 'Tek yarıkta kırınım deneyinde yarık genişliği azaltılırsa merkezî aydınlık saçak ne olur?', o: ['Genişler', 'Daralır', 'Değişmez', 'Kaybolur'],
      b: ['Kırınım, dalga boyu yarık genişliğine göre büyüdükçe belirginleşir.'], s: ['Yarık daralınca ışık daha çok yayılır → merkezî saçak <em>genişler</em> ✓'] } },
    { do: D({ lam: 1, P: 1 }), q: { t: 'Sireni çalan ambulans duran bir gözlemciye yaklaşırken gözlemci sesi nasıl duyar?', o: ['Daha tiz (yüksek frekanslı)', 'Daha pes (düşük frekanslı)', 'Aynı frekansta', 'Daha hızlı yayılan'],
      b: ['Doppler olayı: kaynak yaklaşırken dalga tepeleri sıkışır.'], s: ['Dalga boyu kısalır → algılanan frekans <em>artar</em>: ses tizleşir ✓', 'Uzaklaşırken pesleşir.'] } },
  ], [
    TZ({ lam: 1, P: 1 }),
    { do: D({ lam: 0.75, P: 1 }), q: { t: 'Young deneyi düzeneği havadan suya alınırsa (her şey aynı) saçak aralığı ne olur?', o: ['Azalır', 'Artar', 'Değişmez', 'Saçaklar kaybolur'],
      b: [FM(`Δx = ${F('λ L', 'd')}`) + ' · suda ışığın hızı ve dalga boyu azalır.'], s: ['λ<sub>su</sub> < λ<sub>hava</sub> → Δx <em>azalır</em> ✓'], n: ['TUZAK: frekans sabit olduğu için hiçbir şeyin değişmeyeceğini sanmak.'] } },
  ]);

  // ---------------- ATOM VE RADYOAKTİVİTE (mod, n, hedef, tt, kos, T) ----------------
  bank('Atom Fiziğine Giriş ve Radyoaktivite', 'AYT21', '⚛️', 'atom ve radyoaktivite', 'Bohr modeli, foton enerjisi, iyonlaşma, α–β–γ bozunmaları, yarı ömür.', [
    BAS({ mod: 'atom', n: 3, hedef: 3 }, 'Hidrojen atomu (Bohr modeli) ve çekirdekler.'),
    { do: D({ mod: 'atom', n: 3, hedef: 3 }), goster: D({ hedef: 1 }), q: { t: 'Hidrojende elektron n = 3\'ten n = 1\'e iniyor. Yayılan fotonun enerjisi kaç eV\'tur? (E<sub>n</sub> = −13,6 / n² eV)', o: ['12,09', '1,51', '13,6', '10,2'],
      b: [`${FM(`E<sub>n</sub> = − ${F('13,6', 'n<sup>2</sup>')} eV`)} · foton enerjisi = seviye farkı`], s: ['E₃ = −1,51 eV, E₁ = −13,6 eV', 'E<sub>foton</sub> = 13,6 − 1,51 = <em>12,09 eV</em> ✓'] } },
    { do: D({ mod: 'atom', n: 1, hedef: 1 }), q: { t: 'Temel hâldeki hidrojen atomunu iyonlaştırmak için en az kaç eV gerekir?', o: ['13,6', '10,2', '3,4', '0'],
      b: ['İyonlaşma: elektronu n = ∞ seviyesine (E = 0) çıkarmak.'], s: ['0 − (−13,6) = <em>13,6 eV</em> ✓'] } },
    { do: D({ mod: 'cekirdek', tt: 0, kos: 0 }), q: { t: 'Kütle numarası 238, atom numarası 92 olan çekirdek bir α parçacığı yayıyor. Oluşan çekirdeğin kütle ve atom numarası nedir?', o: ['234 ve 90', '238 ve 90', '234 ve 92', '236 ve 91'],
      b: ['α parçacığı: helyum çekirdeği (2 proton + 2 nötron) → Z 2, A 4 azalır.'], s: ['A = 238 − 4 = 234, Z = 92 − 2 = 90 → <em>234 ve 90</em> ✓'] } },
    { do: D({ mod: 'cekirdek', tt: 0, kos: 0 }), q: { t: 'β⁻ bozunmasında çekirdeğin atom ve kütle numarası nasıl değişir?', o: ['Z 1 artar, A değişmez', 'Z 1 azalır, A değişmez', 'Z 2 azalır, A 4 azalır', 'İkisi de değişmez'],
      b: ['β⁻ bozunmasında bir nötron, protona dönüşür ve elektron yayılır.'], s: ['Proton sayısı 1 artar, nükleon sayısı aynı → <em>Z + 1, A sabit</em> ✓'], n: ['γ ışımasında Z ve A değişmez; yalnız enerji yayılır.'] } },
    { do: D({ mod: 'cekirdek', tt: 0, kos: 0 }), goster: D({ tt: 0, kos: 1 }), q: { t: 'Yarı ömrü 2 gün olan 160 g\'lık radyoaktif maddenin 6 gün sonra kaç g\'ı bozunmadan kalır?', o: ['20', '40', '80', '0'],
      b: [FM(`m = m<sub>0</sub> · (${F('1', '2')})<sup>t / T</sup>`)], s: ['6 gün = 3 yarı ömür: 160 → 80 → 40 → <em>20 g</em> ✓'] } },
  ], [
    TZ({ mod: 'atom', n: 1, hedef: 1 }),
    { do: D({ mod: 'atom', n: 1, hedef: 1 }), q: { t: 'Temel hâldeki hidrojen atomuna 13 eV\'luk foton gönderiliyor. Ne olur?', o: ['Foton soğurulmaz', 'Elektron n = 2\'ye çıkar', 'Atom iyonlaşır', 'Elektron n = 3\'e çıkar'],
      b: ['Atom fotonu ancak enerjisi iki seviye farkına TAM eşitse soğurur (ya da iyonlaştıracak kadar büyükse).', 'Farklar: 10,2 · 12,09 · 12,75 · 13,06 eV… · iyonlaşma 13,6 eV'], s: ['13 eV hiçbir farka eşit değil ve 13,6 eV\'tan küçük → <em>soğurulmaz</em> ✓'], n: ['TUZAK: "10,2\'den büyük, n = 2\'ye çıkar" sanmak. Foton bölünemez; elektronla çarpışmada ise artan enerji elektronda kalabilir.'] } },
  ]);

  // ---------------- MODERN FİZİK (Ef, siddet, ac) ----------------
  bank('Modern Fizik', 'AYT22', '💡', 'modern fizik', 'Foton enerjisi, fotoelektrik olay, durdurma gerilimi, eşik dalga boyu, de Broglie.', [
    BAS({ Ef: 2, siddet: 1, ac: 1 }, 'Metal yüzeye ışık gönderen fotoselli düzenek.'),
    { do: D({ Ef: 2, siddet: 1, ac: 1, W0: 2.3 }), q: { t: 'Dalga boyu 620 nm olan fotonun enerjisi kaç eV\'tur? (hc = 1240 eV·nm)', o: ['2', '0,5', '6,2', '1,24'],
      b: [FM(`E = ${F('h c', 'λ')}`)], s: [`E = ${F('1240', '620')} = <em>2 eV</em> ✓`] } },
    { do: D({ Ef: 3.1, siddet: 1, ac: 1, W0: 2.3 }), q: { t: 'Eşik enerjisi 2,3 eV olan metale 3,1 eV\'luk fotonlar düşüyor. Kopan elektronların en büyük kinetik enerjisi kaç eV\'tur?', o: ['0,8', '5,4', '3,1', '2,3'],
      b: [FM('E<sub>k,max</sub> = h f − W<sub>0</sub>')], s: ['E<sub>k</sub> = 3,1 − 2,3 = <em>0,8 eV</em> ✓'] } },
    { do: D({ Ef: 3.1, siddet: 1, ac: 1, W0: 2.3 }), q: { t: 'Aynı deneyde (E<sub>k,max</sub> = 0,8 eV) elektronları durdurmak için gereken en küçük ters gerilim kaç V\'tur?', o: ['0,8', '3,1', '2,3', '1,6'],
      b: [FM('e · V<sub>durdurma</sub> = E<sub>k,max</sub>')], s: ['V = <em>0,8 V</em> ✓'] } },
    { do: D({ Ef: 2.48, siddet: 1, ac: 1, W0: 2.48 }), q: { t: 'Eşik enerjisi 2,48 eV olan metalden elektron koparabilecek ışığın en büyük dalga boyu kaç nm\'dir?', o: ['500', '248', '620', '400'],
      b: [FM(`λ<sub>eşik</sub> = ${F('h c', 'W<sub>0</sub>')}`)], s: [`λ = ${F('1240', '2,48')} = <em>500 nm</em> ✓`], n: ['Daha uzun dalga boylu (daha düşük enerjili) ışık elektron koparamaz.'] } },
    { do: D({ Ef: 3.1, siddet: 2.5, ac: 1, W0: 2.3 }), q: { t: 'Frekansı aynı kalan ışığın şiddeti artırılırsa ne olur?', o: ['Kopan elektron sayısı (akım) artar, E<sub>k,max</sub> değişmez', 'E<sub>k,max</sub> artar', 'İkisi de artar', 'Hiçbiri değişmez'],
      b: ['Şiddet foton SAYISINI, frekans her fotonun ENERJİSİNİ belirler.'], s: ['Daha çok foton → daha çok elektron → <em>akım artar</em>; foton enerjisi aynı → E<sub>k,max</sub> aynı ✓'] } },
    { do: D({ Ef: 3.1, siddet: 1, ac: 1, W0: 2.3 }), q: { t: 'Bir elektron daha büyük gerilimle hızlandırılırsa de Broglie dalga boyu ne olur?', o: ['Kısalır', 'Uzar', 'Değişmez', 'Sıfır olur'],
      b: [FM(`λ = ${F('h', 'p')}`) + ' · p = m v'], s: ['Hız artar → momentum artar → λ <em>kısalır</em> ✓'], n: ['Elektron mikroskobu kısa dalga boylu elektronlarla küçük ayrıntıları görür.'] } },
  ], [
    TZ({ Ef: 1.8, siddet: 1, ac: 1 }),
    { do: D({ Ef: 1.8, siddet: 3, ac: 1, W0: 2.3 }), q: { t: 'Eşik enerjisi 2,3 eV olan metale çok şiddetli kırmızı ışık (1,8 eV) uzun süre gönderilirse elektron kopar mı?', o: ['Hayır, hiç kopmaz', 'Evet, yeterince beklenirse', 'Evet, şiddet yeterince artarsa', 'Yalnız metal ısınırsa'],
      b: ['Her foton enerjisini tek bir elektrona verir.'], s: ['1,8 eV < 2,3 eV → hiçbir foton tek başına koparamaz → <em>kopmaz</em> ✓'], n: ['TUZAK: dalga modeline göre düşünüp enerjinin birikeceğini sanmak. Fotoelektrik olay anlıktır.'] } },
  ]);

  // ---------------- MODERN FİZİĞİN UYGULAMALARI (Eg, mod) ----------------
  bank('Modern Fiziğin Uygulamaları', 'AYT23', '🔬', 'modern fiziğin uygulamaları', 'LED rengi, güneş pili, lazer, MR, röntgen, süperiletken.', [
    BAS({ mod: 'led', Eg: 2 }, 'LED ve lazer düzeneği.'),
    { do: D({ mod: 'led', Eg: 2 }), q: { t: 'Yasak enerji aralığı 2 eV olan LED yaklaşık hangi dalga boyunda ışık yayar? (hc = 1240 eV·nm)', o: ['620 nm (kırmızı)', '450 nm (mavi)', '1240 nm (kızılötesi)', '310 nm (morötesi)'],
      b: [FM(`λ = ${F('h c', 'E<sub>g</sub>')}`)], s: [`λ = ${F('1240', '2')} = <em>620 nm</em>, kırmızı ✓`] } },
    { do: D({ mod: 'led', Eg: 1.1 }), q: { t: 'Güneş pilinde hangi enerji dönüşümü olur?', o: ['Işık → elektrik', 'Elektrik → ışık', 'Isı → elektrik', 'Kimyasal → elektrik'],
      b: ['Güneş pili p–n eklemli yarı iletkendir: foton, elektron–deşik çifti oluşturur.'], s: ['Soğurulan foton akım oluşturur → <em>ışık enerjisi elektriğe</em> ✓'], n: ['LED ise tersini yapar: elektrik → ışık.'] } },
    { do: D({ mod: 'lazer' }), q: { t: 'Lazer ışığının özelliği aşağıdakilerden hangisidir?', o: ['Tek renkli ve eş fazlı (uyumlu) olması', 'Her yöne eşit dağılması', 'Birçok farklı renk içermesi', 'Kendiliğinden ışımayla oluşması'],
      b: ['LASER: uyarılmış ışıma ile ışığın güçlendirilmesi.'], s: ['Uyarılmış ışımada çıkan fotonlar aynı frekans, faz ve yöndedir → <em>tek renkli, eş fazlı, paralel</em> ✓'] } },
    { do: D({ mod: 'lazer' }), q: { t: 'Röntgen (X ışını) görüntüsünde kemiklerin beyaz görünmesinin nedeni nedir?', o: ['Kemiklerin X ışınını daha çok soğurması', 'Kemiklerin X ışını yayması', 'Kemiklerin ışığı yansıtması', 'X ışınının kemikten hızlı geçmesi'],
      b: ['X ışını yumuşak dokudan kolay geçer; yoğun dokular (kemik) daha çok soğurur.'], s: ['Kemik X ışınını <em>soğurur</em>, filme ulaşmaz → o bölge açık renkli ✓'] } },
  ], [
    TZ({ mod: 'led', Eg: 2 }),
    { do: D({ mod: 'led', Eg: 2 }), q: { t: 'MR (manyetik rezonans) görüntülemede hangisi kullanılır?', o: ['Güçlü manyetik alan ve radyo dalgaları', 'X ışınları', 'Gama ışınları', 'Ultrason'],
      b: ['MR, vücuttaki hidrojen çekirdeklerinin güçlü manyetik alanda radyo dalgalarıyla etkileşimini ölçer.'], s: ['<em>Manyetik alan + radyo dalgası</em> ✓; iyonlaştırıcı ışınım kullanılmaz.'], n: ['TUZAK: MR\'ı röntgen ya da tomografi gibi X ışınıyla çalışan bir cihaz sanmak.'] } },
  ]);
})();
