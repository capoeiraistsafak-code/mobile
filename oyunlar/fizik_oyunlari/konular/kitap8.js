// Kitap soru bankası · AYT MEKANİK (vektörler, bağıl hareket, Newton, sabit ivmeli hareket, atışlar, enerji, momentum, tork, kütle merkezi, basit makineler)
// Benim Hocam AYT s.1–126'daki SORU TİPLERİ örnek alınmıştır; sorular, sayılar ve durumlar özgündür.
// Her konunun var olan 3D düzeneği kullanılır: soru, sahneyi kendi değerleriyle kurar; cevaptan sonra olay canlanır.
(function () {
  const { gorev } = FZ;
  const T = (ad) => FZ.taban('AYT', ad);
  const bank = (ad, yk, icon, name, task, steps, tuzak) => { const b = T(ad); if (!b) return; const L = [];
    [steps, tuzak || []].forEach(A => A.forEach(st => { if (st.q && !st.sub) st.sub = steps[0].sub; if (st.q) st.q.kartGizle = true; }));   // sahnenin hesap kartları cevabı ele vermesin   // her soruda düzeneği anlatan alt yazı
    L.push(gorev(b, { yk: yk + '-k', no: 9, icon, name: 'Kitap soruları: ' + name, task, steps, data: [] }));
    if (tuzak) L.push(gorev(b, { yk: yk + '-t', no: 10, icon: '🪤', name: 'Tuzak sorular: ' + name, tuzak: true, task: 'Sık yapılan hatalar.', steps: tuzak, data: [] }));
    FZ.konuEk('AYT', ad, { gorevler: L }); };

  // ---------------- VEKTÖRLER (A, B, th, uc, bil) ----------------
  const vk = (A, B, th) => S => Object.assign(S, { A, B, th, uc: 0, R: 0, bil: 0 }), vg = S => { S.uc = 0.01; S.bil = 1; };
  bank('Vektörler', 'AYT1', '📐', 'vektörler', 'Bileşke, sınırlar, bileşenlere ayırma, dengede üç kuvvet, vektör farkı.', [
    { do: vk(10, 10, 60), sub: 'İki kuvvet vektörü.', go: '▶︎ Başla' },
    { do: vk(10, 10, 60), q: { t: 'Aralarındaki açı 60° olan 10 N\'luk iki kuvvetin bileşkesi kaç N\'dur? (√3 = 1,7)', o: ['17', '20', '10', '14'], goster: vg,
      b: [`Kosinüs teoremi: ${FM('R<sup>2</sup> = A<sup>2</sup> + B<sup>2</sup> + 2AB cos θ')} · cos 60° = ${F('1', '2')}`],
      s: ['R² = 100 + 100 + 2 · 100 · ½ = 300', 'R = 10√3 ≈ <em>17 N</em> ✓'], n: ['Eşit iki vektörün bileşkesi aralarındaki açının ortasından geçer.'] } },
    { do: vk(7, 3, 90), q: { t: '7 N ve 3 N\'luk iki kuvvetin bileşkesi aşağıdakilerden hangisi olabilir?', o: ['8 N', '11 N', '3 N', '2 N'], goster: vg,
      b: [FM('|A − B| ≤ R ≤ A + B')],
      s: ['4 N ≤ R ≤ 10 N', 'Aralıkta yalnız <em>8 N</em> var ✓'], n: ['En büyük bileşke aynı yönde (açı 0°), en küçük zıt yönde (açı 180°) olur.'] } },
    { do: vk(16, 12, 90), q: { t: 'Yatayla 37° açı yapan 20 N\'luk kuvvetin yatay ve düşey bileşenleri kaç N\'dur? (sin 37° = 0,6; cos 37° = 0,8)', o: ['16 ve 12', '12 ve 16', '10 ve 10', '20 ve 0'], goster: vg,
      b: [`${FM('F<sub>x</sub> = F cos θ')} · ${FM('F<sub>y</sub> = F sin θ')}`],
      s: ['F<sub>x</sub> = 20 · 0,8 = 16 N', 'F<sub>y</sub> = 20 · 0,6 = 12 N → <em>16 ve 12</em> ✓'], n: ['Bileşenler birbirine diktir; bileşkesi yine 20 N verir: √(16² + 12²) = 20.'] } },
    { do: vk(6, 8, 90), q: { t: 'Bir noktaya etki eden birbirine dik 6 N ve 8 N\'luk kuvvetlerle birlikte cisim dengede kalıyor. Üçüncü kuvvetin büyüklüğü kaç N\'dur?', o: ['10', '14', '2', '48'], goster: vg,
      b: ['Dengede net kuvvet sıfırdır: üçüncü kuvvet, diğer ikisinin bileşkesine eşit ve zıt yönlüdür.'],
      s: ['İkisinin bileşkesi √(36 + 64) = 10 N', 'Üçüncü kuvvet <em>10 N</em>, bileşkeye zıt yönde ✓'], n: ['Kuvvetler uç uca eklenince kapalı üçgen oluşur.'] } },
    { do: vk(5, 5, 60), q: { t: 'Aralarında 60° açı bulunan 5 birimlik A ve B vektörleri için |A − B| kaç birimdir?', o: ['5', '10', '0', '8,5'], goster: vg,
      b: ['A − B = A + (−B): B\'nin tersi alınıp A ile toplanır.', FM('|A − B|<sup>2</sup> = A<sup>2</sup> + B<sup>2</sup> − 2AB cos θ')],
      s: ['|A − B|² = 25 + 25 − 2 · 25 · ½ = 25', '|A − B| = <em>5</em> ✓ (eşkenar üçgen)'] } },
    { do: vk(10, 10, 120), q: { t: 'Büyüklükleri sabit iki kuvvet arasındaki açı 60°\'den 120°\'ye çıkarılırsa bileşke nasıl değişir?', o: ['Azalır', 'Artar', 'Değişmez', 'Sıfır olur'], goster: vg,
      b: [FM('R<sup>2</sup> = A<sup>2</sup> + B<sup>2</sup> + 2AB cos θ')],
      s: ['Açı büyüdükçe cos θ küçülür → R <em>azalır</em> ✓', 'Eşit kuvvetlerde 120°\'de R = A olur.'] } },
  ], [
    { do: vk(3, 4, 90), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: vk(3, 4, 90), q: { t: '3 N doğuya, 4 N kuzeye etki eden kuvvetlerin bileşkesi kaç N\'dur?', o: ['5', '7', '1', '12'], goster: vg, b: ['Dik vektörlerde bileşke: Pisagor.'],
      s: ['R = √(9 + 16) = <em>5 N</em> ✓'], n: ['TUZAK: kuvvetleri sayı gibi toplamak (3 + 4 = 7). Vektörler yönleriyle toplanır.'] } },
    { do: vk(10, 10, 180), q: { t: 'Eşit büyüklükteki iki kuvvetin bileşkesi sıfır ise aralarındaki açı kaç derecedir?', o: ['180°', '0°', '90°', '120°'], goster: vg, b: [FM('R<sup>2</sup> = A<sup>2</sup> + B<sup>2</sup> + 2AB cos θ')],
      s: ['R = 0 için cos θ = −1 → <em>180°</em> ✓ (zıt yönlü)'], n: ['TUZAK: 0° sanmak; 0°\'de bileşke en büyüktür.'] } },
  ]);

  // ---------------- BAĞIL HAREKET (vk, va, gen) ----------------
  const ba = (vk_, va, gen) => S => Object.assign(S, { vk: vk_, va, gen, kos: 0, tt: 0 }), bg = S => { S.tt = 0; S.kos = 1; };
  bank('Bağıl Hareket', 'AYT2', '🛶', 'bağıl hareket', 'Nehirde karşıya geçiş, kayma, gözlemciye göre hız, yağmur.', [
    { do: ba(5, 2, 100), sub: 'Nehirde kayık.', go: '▶︎ Başla' },
    { do: ba(5, 2, 100), q: { t: 'Genişliği 100 m olan nehirde kayık, suya göre 5 m/s hızla burnu karşı kıyıya dik tutularak ilerliyor. Akıntı hızı 2 m/s. Kayık karşıya kaç saniyede geçer?', o: ['20', '50', '14', '25'], goster: bg,
      b: ['Karşıya geçiş süresini yalnız kıyıya dik hız bileşeni belirler.', FM(`t = ${F('d', 'v<sub>dik</sub>')}`)],
      s: [`t = ${F('100', '5')} = <em>20 s</em> ✓`], n: ['Akıntı kayığı yalnız kıyı boyunca sürükler; geçiş süresini değiştirmez.'] } },
    { do: ba(5, 2, 100), q: { t: 'Aynı kayık karşı kıyıya vardığında, hareket ettiği noktanın tam karşısından kaç m uzağa çıkar?', o: ['40', '100', '20', '50'], goster: bg,
      b: ['Kayma = akıntı hızı × geçiş süresi'],
      s: ['t = 20 s (önceki soru)', 'x = 2 · 20 = <em>40 m</em> ✓'] } },
    { do: ba(8, 6, 80), q: { t: 'Kayığın suya göre hızı 8 m/s (kıyıya dik), akıntı 6 m/s. Kayığın yere göre hızı kaç m/s\'dir?', o: ['10', '14', '2', '48'], goster: bg,
      b: ['Yere göre hız = suya göre hız + akıntı hızı (vektörel toplam)'],
      s: ['Dik hızlar: √(64 + 36) = <em>10 m/s</em> ✓'] } },
    { do: ba(5, 3, 100), q: { t: 'Kuzeye 20 m/s ile giden A arabasındaki gözlemci, güneye 30 m/s ile giden B arabasını hangi hızla görür?', o: ['50 m/s, güneye', '10 m/s, güneye', '50 m/s, kuzeye', '10 m/s, kuzeye'],
      b: [FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>'), 'Kuzeyi (+) al.'],
      s: ['v<sub>B</sub> = −30, v<sub>A</sub> = +20', 'v = −30 − 20 = −50 → <em>50 m/s güneye</em> ✓'], n: ['Zıt yönde giden araçlar birbirini hızların toplamıyla görür.'] } },
    { do: ba(5, 3, 100), q: { t: 'Rüzgârsız havada yağmur damlaları 6 m/s ile düşey düşüyor. 8 m/s ile giden otobüsteki yolcu damlaları hangi hızla görür?', o: ['10 m/s', '14 m/s', '2 m/s', '6 m/s'],
      b: [FM('v<sub>bağıl</sub> = v<sub>yağmur</sub> − v<sub>otobüs</sub>'), 'İki hız birbirine diktir.'],
      s: ['v = √(6² + 8²) = <em>10 m/s</em> ✓ (eğik, otobüsün hareketine ters yönden geliyormuş gibi)'], n: ['Bu yüzden yağmur, giden aracın ön camına eğik çarpar.'] } },
  ], [
    { do: ba(5, 2, 100), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: ba(5, 4, 100), q: { t: 'Akıntı hızı 2 m/s\'den 4 m/s\'ye çıkarsa (kayık yine kıyıya dik çekiyor) karşıya geçiş süresi ne olur?', o: ['Değişmez', 'Artar', 'Azalır', 'Kayık karşıya geçemez'], goster: bg,
      b: [FM(`t = ${F('d', 'v<sub>dik</sub>')}`)], s: ['Dik bileşen (5 m/s) aynı → <em>süre değişmez</em> ✓; yalnız kayma büyür.'], n: ['TUZAK: akıntı hızlanınca geçişin uzayacağını sanmak.'] } },
    { do: ba(5, 2, 100), q: { t: 'Aynı yönde 25 m/s ve 20 m/s ile giden iki arabadan yavaş olandaki yolcu hızlı arabayı nasıl görür?', o: ['5 m/s ile önde uzaklaşırken', '45 m/s ile', 'Duruyor', '5 m/s ile geri giderken'],
      b: [FM('v<sub>bağıl</sub> = v<sub>cisim</sub> − v<sub>gözlemci</sub>')], s: ['25 − 20 = +5 m/s → <em>5 m/s ile ileri</em> ✓'], n: ['TUZAK: hızları toplamak. Aynı yönde fark alınır.'] } },
  ]);

  // ---------------- NEWTON (mA, mB, k) — masa + makara ----------------
  const nw = (mA, mB, k) => S => Object.assign(S, { mA, mB, k, x: 0, v: 0, kos: 0, goster: 0 }), ng = S => { S.x = 0; S.v = 0; S.kos = 1; S.goster = 1; };
  bank("Newton'un Hareket Yasaları", 'AYT3', '🪢', 'Newton yasaları', 'Makaralı sistemde ivme, ip gerilmesi, sürtünme, statik denge.', [
    { do: nw(4, 1, 0), sub: 'Masadaki A bloğu, makaradan sarkan B bloğuna iple bağlı.', go: '▶︎ Başla' },
    { do: nw(4, 1, 0), q: { t: 'Sürtünmesiz masadaki 4 kg\'lık A bloğu, makaradan sarkan 1 kg\'lık B bloğuna bağlı. İpteki gerilme kuvveti kaç N\'dur? (g = 10 m/s²)', o: ['8', '10', '2', '40'], goster: ng,
      b: [`Sistem: ${FM(`a = ${F('m<sub>B</sub> g', 'm<sub>A</sub> + m<sub>B</sub>')}`)} · A bloğu için: ${FM('T = m<sub>A</sub> · a')}`],
      s: [`a = ${F('10', '5')} = 2 m/s²`, 'T = 4 · 2 = <em>8 N</em> ✓'], n: ['İp gerilmesi sarkan ağırlıktan (10 N) küçüktür; fark B\'yi hızlandırır.'] } },
    { do: nw(3, 3, 0.2), q: { t: 'A = 3 kg, B = 3 kg; masa ile A arasında sürtünme katsayısı 0,2. Sistemin ivmesi kaç m/s²\'dir?', o: ['4', '5', '3', '6'], goster: ng,
      b: [`${FM('f = μ · m<sub>A</sub> · g')} · ${FM(`a = ${F('m<sub>B</sub>g − f', 'm<sub>A</sub> + m<sub>B</sub>')}`)}`],
      s: ['f = 0,2 · 30 = 6 N', `a = ${F('30 − 6', '6')} = <em>4 m/s²</em> ✓`] } },
    { do: nw(3, 3, 0.2), q: { t: 'Aynı sistemde (A = 3 kg, B = 3 kg, μ = 0,2) ipteki gerilme kuvveti kaç N\'dur?', o: ['18', '30', '12', '24'], goster: ng,
      b: ['B bloğu için: m<sub>B</sub>g − T = m<sub>B</sub> · a'],
      s: ['a = 4 m/s²', 'T = 30 − 3 · 4 = <em>18 N</em> ✓', '§2. YOL: A için T − f = m<sub>A</sub> a → T = 6 + 12 = 18 N'] } },
    { do: nw(5, 1, 0.3), q: { t: 'A = 5 kg, B = 1 kg, masa ile A arasında statik sürtünme katsayısı 0,3. Sistem başlangıçta durgunsa ne olur?', o: ['Hareket etmez; sürtünme 10 N', 'a = 1 m/s² ile hızlanır', 'Hareket etmez; sürtünme 15 N', 'Sabit hızla gider'],
      b: [FM('f<sub>s,max</sub> = μ<sub>s</sub> · m<sub>A</sub> · g'), 'Statik sürtünme, uygulanan kuvvete eşit olur (en çok f<sub>s,max</sub>).'],
      s: ['f<sub>s,max</sub> = 0,3 · 50 = 15 N; çeken kuvvet m<sub>B</sub>g = 10 N', '10 < 15 → <em>hareket etmez, sürtünme 10 N</em> ✓'], n: ['Statik sürtünme her zaman en büyük değerinde değildir.'] } },
    { do: nw(6, 2, 0), q: { t: 'Sürtünmesiz sistemde A = 6 kg, B = 2 kg. Sistemin ivmesi ve ip gerilmesi nedir?', o: ['2,5 m/s² ve 15 N', '2,5 m/s² ve 20 N', '3,3 m/s² ve 15 N', '2 m/s² ve 12 N'], goster: ng,
      b: [`${FM(`a = ${F('m<sub>B</sub> g', 'm<sub>A</sub> + m<sub>B</sub>')}`)} · ${FM('T = m<sub>A</sub> · a')}`],
      s: [`a = ${F('20', '8')} = 2,5 m/s²`, 'T = 6 · 2,5 = <em>15 N</em> ✓'] } },
    { do: nw(4, 1, 0), q: { t: 'Hareket ederken ip kopuyor (masa sürtünmesiz). A bloğu bundan sonra nasıl hareket eder?', o: ['Kopma anındaki hızla sabit hızla gider', 'Hemen durur', 'Yavaşlayarak durur', 'Hızlanmaya devam eder'], goster: ng,
      b: ['Newton\'un 1. yasası: net kuvvet sıfırsa cisim hızını korur.'],
      s: ['İp kopunca A\'ya yatayda kuvvet kalmaz (sürtünme yok).', '<em>Sabit hızla</em> gider ✓'], n: ['Düşeyde ağırlık ile masanın tepki kuvveti dengededir.'] } },
  ], [
    { do: nw(4, 1, 0), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: nw(2, 2, 0), q: { t: 'Sürtünmesiz sistemde A = 2 kg, B = 2 kg. İp gerilmesi B\'nin ağırlığına (20 N) eşit midir?', o: ['Hayır, 10 N\'dur', 'Evet, 20 N\'dur', 'Hayır, 40 N\'dur', 'Hayır, 0\'dır'], goster: ng,
      b: [`${FM(`a = ${F('m<sub>B</sub> g', 'm<sub>A</sub> + m<sub>B</sub>')}`)} · ${FM('T = m<sub>A</sub> · a')}`],
      s: ['a = 20 / 4 = 5 m/s²', 'T = 2 · 5 = <em>10 N</em> ✓'], n: ['TUZAK: T = m<sub>B</sub>g sanmak. B hızlanıyorsa üzerindeki net kuvvet sıfır değildir, T < m<sub>B</sub>g.'] } },
    { do: nw(4, 1, 0), q: { t: 'A bloğu B\'yi çekiyor, B de A\'yı çekiyor (ip aracılığıyla). Hangisi doğrudur?', o: ['İpin iki ucundaki kuvvetler eşittir', 'Ağır olan A daha büyük kuvvet uygular', 'Hareket yönündeki kuvvet büyüktür', 'İp yalnız B\'yi çeker'],
      b: ['Kütlesiz ve sürtünmesiz makaradan geçen ipin her yerinde gerilme aynıdır.'],
      s: ['İp A\'yı ve B\'yi aynı T kuvvetiyle çeker ✓'], n: ['TUZAK: hareketin, büyük kuvvetin kazanmasıyla olduğunu sanmak. Hareketi net dış kuvvet (m<sub>B</sub>g) belirler.'] } },
  ]);

  // ---------------- SABİT İVMELİ HAREKET (x, v, a, kos, tt, iz) ----------------
  const si = (v, a) => S => Object.assign(S, { x: 0, v, a, kos: 0, tt: 0, iz: [] }), sg = (v, a) => S => Object.assign(S, { x: 0, v, a, tt: 0, iz: [], kos: 1 });
  bank('Bir Boyutta Sabit İvmeli Hareket', 'AYT4', '🏎️', 'sabit ivmeli hareket', 'Hız–zaman, yol, durma süresi, n. saniyede alınan yol, ortalama hız.', [
    { do: si(0, 4), sub: 'Düz yolda araba.', go: '▶︎ Başla' },
    { do: si(0, 4), q: { t: 'Durgun araba 4 m/s² sabit ivmeyle 5 s hızlanıyor. Bu sürede kaç m yol alır?', o: ['50', '100', '20', '40'], goster: sg(0, 4),
      b: [`${FM(`x = v<sub>0</sub> t + ${F('1', '2')} a t<sup>2</sup>`)}`], s: [`x = 0 + ${F('1', '2')} · 4 · 25 = <em>50 m</em> ✓`] } },
    { do: si(20, -4), q: { t: '20 m/s ile giden araba 4 m/s² ivmeyle yavaşlıyor. Kaç saniyede durur?', o: ['5', '80', '4', '2,5'], goster: sg(20, -4),
      b: [FM('v = v<sub>0</sub> + a t')], s: ['0 = 20 − 4t → t = <em>5 s</em> ✓'], n: ['Durma yolu: x = v<sub>0</sub>² / 2a = 400 / 8 = 50 m.'] } },
    { do: si(0, 2), q: { t: 'Durgun hâlden 2 m/s² ivmeyle hızlanan araba 4. saniye içinde kaç m yol alır?', o: ['7', '16', '9', '8'], goster: sg(0, 2),
      b: [`${FM(`x = ${F('1', '2')} a t<sup>2</sup>`)} · 4. saniye: t = 3 s ile t = 4 s arası`],
      s: ['x(4) = 16 m, x(3) = 9 m', 'Fark = <em>7 m</em> ✓'], n: ['Durgun başlayan düzgün hızlanan harekette ardışık saniyelerde alınan yollar 1 : 3 : 5 : 7 oranındadır.'] } },
    { do: si(10, 5), q: { t: 'Hızı 10 m/s\'den 30 m/s\'ye 5 m/s² sabit ivmeyle çıkan araba bu sürede kaç m yol alır?', o: ['80', '40', '160', '100'], goster: sg(10, 5),
      b: [FM('v<sup>2</sup> = v<sub>0</sub><sup>2</sup> + 2 a x')], s: ['900 = 100 + 10x', 'x = <em>80 m</em> ✓', '§2. YOL: t = (30 − 10)/5 = 4 s; ortalama hız 20 m/s → x = 20 · 4 = 80 m'] } },
    { do: si(10, 5), q: { t: 'Aynı hareketin (10 m/s → 30 m/s, sabit ivme) ortalama hızı kaç m/s\'dir?', o: ['20', '40', '10', '15'], goster: sg(10, 5),
      b: [`Sabit ivmede: ${FM(`v<sub>ort</sub> = ${F('v<sub>0</sub> + v', '2')}`)}`], s: [`v<sub>ort</sub> = ${F('10 + 30', '2')} = <em>20 m/s</em> ✓`] } },
    { do: si(12, 0), q: { t: 'Hız–zaman grafiğinde yatay doğru görülen bir araba için ne söylenir?', o: ['İvmesi sıfır, sabit hızla gidiyor', 'Duruyor', 'Düzgün hızlanıyor', 'Düzgün yavaşlıyor'], goster: sg(12, 0),
      b: ['Hız–zaman grafiğinin eğimi ivmeyi, altındaki alan yer değiştirmeyi verir.'], s: ['Eğim sıfır → a = 0: <em>sabit hızlı hareket</em> ✓'] } },
  ], [
    { do: si(0, 4), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: si(0, 3), q: { t: 'Durgun başlayan ve 3 m/s² ivmeyle hızlanan araba 2 s\'de kaç m yol alır?', o: ['6', '12', '3', '9'], goster: sg(0, 3),
      b: [FM(`x = ${F('1', '2')} a t<sup>2</sup>`)], s: [`x = ${F('1', '2')} · 3 · 4 = <em>6 m</em> ✓`], n: ['TUZAK: x = a · t² (½\'yi unutmak) ya da x = v · t ile son hızı kullanmak.'] } },
    { do: si(20, -5), q: { t: '20 m/s ile giden araba 5 m/s² ile fren yapıyor. 6 s sonra konumu, fren başladığı noktadan kaç m ileridedir?', o: ['40', '30', '210', '0'], goster: sg(20, -5),
      b: ['Önce durma süresini bul: araba durduktan sonra geri gitmez.'], s: ['Durma süresi: 20 / 5 = 4 s < 6 s', 'x = 400 / 10 = <em>40 m</em> ✓ (son 2 s duruyor)'], n: ['TUZAK: formüle t = 6 koyup 120 − 90 = 30 m bulmak. Fren arabayı geri götürmez.'] } },
  ]);

  // ---------------- ATIŞLAR (mod, v0, th, h0) ----------------
  const at = (mod, v0, th, h0) => S => Object.assign(S, { mod, v0, th, h0, tt: 0, kos: 0, iz: [] }), ag = S => { S.tt = 0; S.iz = []; S.kos = 1; };
  bank('İki Boyutta Hareket (Atışlar)', 'AYT5', '🎯', 'atışlar', 'Yatay atış, eğik atış, tepede hız, menzil, yere çarpma hızı.', [
    { do: at('yatay', 15, 0, 80), sub: 'Atış düzeneği: top atıcı (yatay ya da eğik).', go: '▶︎ Başla' },
    { do: at('yatay', 15, 0, 80), q: { t: '80 m yükseklikten 15 m/s ile yatay atılan cisim, atıldığı noktanın düşey izdüşümünden kaç m uzağa düşer? (g = 10 m/s²)', o: ['60', '80', '45', '120'], goster: ag,
      b: [`${FM(`h = ${F('1', '2')} g t<sup>2</sup>`)} · ${FM('x = v<sub>0</sub> · t')}`], s: ['80 = 5t² → t = 4 s', 'x = 15 · 4 = <em>60 m</em> ✓'] } },
    { do: at('yatay', 15, 0, 20), q: { t: '20 m yükseklikten 15 m/s ile yatay atılan cismin yere çarpma hızı kaç m/s\'dir?', o: ['25', '35', '20', '15'], goster: ag,
      b: [`Düşey: ${FM('v<sub>y</sub> = g t')} · yatay hız değişmez · ${FM('v<sup>2</sup> = v<sub>x</sub><sup>2</sup> + v<sub>y</sub><sup>2</sup>')}`],
      s: ['t = √(2 · 20 / 10) = 2 s → v<sub>y</sub> = 20 m/s', 'v = √(15² + 20²) = <em>25 m/s</em> ✓'] } },
    { do: at('egik', 50, 53, 0), q: { t: '50 m/s hızla yatayla 53° açıyla atılan cisim en fazla kaç m yükselir? (sin 53° = 0,8)', o: ['80', '45', '125', '160'], goster: ag,
      b: [`${FM('v<sub>0y</sub> = v<sub>0</sub> sin θ')} · ${FM(`h<sub>max</sub> = ${F('v<sub>0y</sub><sup>2</sup>', '2g')}`)}`], s: ['v<sub>0y</sub> = 40 m/s', `h = ${F('1600', '20')} = <em>80 m</em> ✓`] } },
    { do: at('egik', 50, 53, 0), q: { t: 'Aynı cismin (50 m/s, 53°) tepe noktasındaki hızı kaç m/s\'dir? (cos 53° = 0,6)', o: ['30', '0', '40', '50'], goster: ag,
      b: ['Tepede hızın düşey bileşeni sıfırdır; yatay bileşen hareket boyunca değişmez.'], s: ['v<sub>x</sub> = 50 · 0,6 = <em>30 m/s</em> ✓'], n: ['Sık yanlış: "tepede hız sıfır". Yalnız düşey bileşen sıfırdır.'] } },
    { do: at('egik', 50, 37, 0), q: { t: 'Aynı hızla 37° ve 53° ile atılan iki cismin menzilleri için ne söylenir? (hava direnci yok)', o: ['Eşittir', '37° ile atılanınki büyük', '53° ile atılanınki büyük', 'Karşılaştırılamaz'], goster: ag,
      b: [FM(`x<sub>max</sub> = ${F('v<sub>0</sub><sup>2</sup> · sin 2θ', 'g')}`)], s: ['sin 74° = sin 106° → menziller <em>eşit</em> ✓', 'Toplamı 90° olan açılarda menzil aynıdır; en büyük menzil 45°\'de.'] } },
  ], [
    { do: at('egik', 50, 37, 0), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: at('egik', 50, 37, 0), q: { t: 'Eğik atılan cismin tepe noktasında ivmesi nedir?', o: ['g, aşağı doğru', 'Sıfır', 'g, yukarı doğru', 'Yatay yönde'], goster: ag,
      b: ['Hava direnci yoksa cisme yalnız ağırlık etki eder.'], s: ['Ağırlık hep düşey aşağı → ivme her an <em>g, aşağı</em> ✓'], n: ['TUZAK: tepede hız düşeyde sıfır olduğu için ivmenin de sıfır olduğunu sanmak.'] } },
    { do: at('yatay', 20, 0, 45), q: { t: '45 m yükseklikten biri 20 m/s ile yatay atılıyor, diğeri serbest bırakılıyor. Hangisi yere önce düşer?', o: ['Aynı anda düşerler', 'Yatay atılan', 'Serbest bırakılan', 'Hıza bağlı'], goster: ag,
      b: ['Yatay ve düşey hareketler birbirinden bağımsızdır.'], s: ['İkisinin de düşey ilk hızı sıfır → t = √(2h/g) = 3 s, <em>aynı anda</em> ✓'], n: ['TUZAK: hızlı atılanın daha uzun süre havada kalacağını sanmak.'] } },
  ]);

  // ---------------- ENERJİ VE HAREKET (m, h, k, kayip) ----------------
  const en = (m, h, k, kayip) => S => Object.assign(S, { m, h, k, kayip, s: 0, kos: 0, sik: 0 }), eg = S => { S.s = 0; S.sik = 0; S.kos = 1; };
  bank('Enerji ve Hareket', 'AYT6', '🎢', 'enerji ve hareket', 'Enerji korunumu, yay enerjisi, sürtünmenin işi, iş–enerji teoremi.', [
    { do: en(2, 5, 800, 0), sub: 'Rampadan kayan blok yaya çarpıyor.', go: '▶︎ Başla' },
    { do: en(2, 5, 800, 0), q: { t: '2 kg\'lık blok 5 m yükseklikten sürtünmesiz rampadan bırakılıyor. Yay sabiti 800 N/m olan yayı en çok kaç m sıkıştırır?', o: ['0,5', '1', '0,25', '0,1'], goster: eg,
      b: [`${FM('E<sub>p</sub> = m g h')} · ${FM(`E<sub>yay</sub> = ${F('1', '2')} k x<sup>2</sup>`)}`], s: ['mgh = 2 · 10 · 5 = 100 J', `100 = ${F('1', '2')} · 800 · x² → x = <em>0,5 m</em> ✓`] } },
    { do: en(2, 5, 800, 0), q: { t: 'Aynı blok rampanın dibine (yaydan önce) kaç m/s hızla ulaşır?', o: ['10', '5', '20', '100'], goster: eg,
      b: [`${FM(`m g h = ${F('1', '2')} m v<sup>2</sup>`)}`], s: ['v = √(2gh) = √100 = <em>10 m/s</em> ✓'], n: ['Kütle sadeleşir: hız kütleye bağlı değildir.'] } },
    { do: en(2, 5, 800, 36), q: { t: 'Rampa sürtünmeli olsaydı ve yol boyunca 36 J ısıya dönüşseydi blok dibe kaç m/s hızla varırdı?', o: ['8', '10', '6', '4'], goster: eg,
      b: [`${FM('m g h = E<sub>k</sub> + Q')} (Q: ısıya dönüşen enerji)`], s: ['E<sub>k</sub> = 100 − 36 = 64 J', `64 = ${F('1', '2')} · 2 · v² → v = <em>8 m/s</em> ✓`] } },
    { do: en(2, 20, 800, 0), q: { t: 'Blok 4 kat yüksekten bırakılırsa yaydaki en büyük sıkışma kaç katına çıkar?', o: ['2', '4', '16', '√2'], goster: eg,
      b: [`${FM(`m g h = ${F('1', '2')} k x<sup>2</sup>`)} → x ∝ √h`], s: ['h 4 katı → x √4 = <em>2 katı</em> ✓'] } },
    { do: en(4, 5, 800, 0), q: { t: '4 kg\'lık cismin hızı 6 m/s\'den 2 m/s\'ye düşüyor. Cisme yapılan net iş kaç J\'dür?', o: ['−64', '64', '−32', '−80'],
      b: [`İş–enerji teoremi: ${FM('W<sub>net</sub> = ΔE<sub>k</sub>')}`], s: [`ΔE<sub>k</sub> = ${F('1', '2')} · 4 · (4 − 36) = <em>−64 J</em> ✓`], n: ['Net iş negatifse cisim yavaşlar (kuvvet harekete zıt).'] } },
  ], [
    { do: en(2, 5, 800, 0), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: en(2, 5, 800, 0), q: { t: 'Sürtünmesiz iki rampadan biri dik, biri yatık; aynı yükseklikten bırakılan özdeş bloklar dibe nasıl hızlarla varır?', o: ['Eşit hızla', 'Dik rampadaki daha hızlı', 'Yatık rampadaki daha hızlı', 'Rampa uzunluğuna bağlı'], goster: eg,
      b: [FM(`m g h = ${F('1', '2')} m v<sup>2</sup>`)], s: ['Hız yalnız yüksekliğe bağlı → <em>eşit</em> ✓ (süreler farklıdır)'], n: ['TUZAK: dik rampada daha hızlı varacağını sanmak; dikte yalnız daha KISA sürede varır.'] } },
    { do: en(2, 5, 800, 0), q: { t: 'Cisim yatay düzlemde sabit hızla çekiliyorsa ağırlığın yaptığı iş nedir?', o: ['Sıfır', 'm g x', 'Negatif', 'm g h'],
      b: [FM('W = F · x · cos θ')], s: ['Ağırlık düşey, yer değiştirme yatay → θ = 90° → <em>W = 0</em> ✓'], n: ['TUZAK: her kuvvetin iş yaptığını sanmak. Harekete dik kuvvet iş yapmaz.'] } },
  ]);

  // ---------------- MOMENTUM (m1, m2, v1, v2, yapis) ----------------
  const mo = (m1, v1, m2, v2, yapis) => S => Object.assign(S, { m1, v1, m2, v2, yapis, x1: -5, x2: 1, kos: 0, carpti: 0 }), mg_ = (m1, v1, m2, v2, yapis) => S => Object.assign(S, { m1, v1, m2, v2, yapis, x1: -5, x2: 1, carpti: 0, kos: 1 });
  bank('İtme ve Çizgisel Momentum', 'AYT7', '🚃', 'itme ve momentum', 'Yapışık ve esnek çarpışma, zıt yönlü çarpışma, itme–kuvvet, patlama, kinetik enerji kaybı.', [
    { do: mo(3, 4, 1, 0, 1), sub: 'Rayda iki vagon.', go: '▶︎ Başla' },
    { do: mo(3, 4, 1, 0, 1), q: { t: '3 kg\'lık araba 4 m/s ile duran 1 kg\'lık arabaya çarpıp yapışıyor. Ortak hızları kaç m/s\'dir?', o: ['3', '4', '1', '12'], goster: mg_(3, 4, 1, 0, 1),
      b: [FM('m<sub>1</sub>v<sub>1</sub> + m<sub>2</sub>v<sub>2</sub> = (m<sub>1</sub> + m<sub>2</sub>) v')], s: ['12 = 4v → v = <em>3 m/s</em> ✓'] } },
    { do: mo(3, 4, 1, 0, 1), q: { t: 'Bu yapışık çarpışmada kaç J kinetik enerji ısıya ve sese dönüşür?', o: ['6', '24', '18', '0'], goster: mg_(3, 4, 1, 0, 1),
      b: [FM(`E<sub>k</sub> = ${F('1', '2')} m v<sup>2</sup>`)], s: ['Önce: ½ · 3 · 16 = 24 J · Sonra: ½ · 4 · 9 = 18 J', 'Kayıp = <em>6 J</em> ✓'], n: ['Esnek olmayan çarpışmada momentum korunur, kinetik enerji korunmaz.'] } },
    { do: mo(1, 6, 1, 0, 0), q: { t: 'Kütleleri eşit iki araba esnek çarpışıyor: biri 6 m/s, diğeri duruyor. Çarpışmadan sonra hızları ne olur?', o: ['İlki durur, ikincisi 6 m/s', 'İkisi de 3 m/s', 'İlki 6 m/s geri döner', 'İkisi de durur'], goster: mg_(1, 6, 1, 0, 0),
      b: ['Esnek çarpışmada hem momentum hem kinetik enerji korunur.'], s: ['Eşit kütlelerde hızlar <em>değiş tokuş</em> edilir ✓'], n: ['Bilardo toplarında sık görülür.'] } },
    { do: mo(2, 5, 3, -2, 1), q: { t: '2 kg\'lık araba 5 m/s ile sağa, 3 kg\'lık araba 2 m/s ile sola gidiyor; çarpışıp yapışıyorlar. Ortak hız nedir?', o: ['0,8 m/s, sağa', '0,8 m/s, sola', '3,2 m/s, sağa', '1,6 m/s, sağa'], goster: mg_(2, 5, 3, -2, 1),
      b: [FM('m<sub>1</sub>v<sub>1</sub> + m<sub>2</sub>v<sub>2</sub> = (m<sub>1</sub> + m<sub>2</sub>) v'), 'Sağı (+) al.'], s: ['2 · 5 + 3 · (−2) = 4 kg·m/s', 'v = 4 / 5 = <em>0,8 m/s sağa</em> ✓'] } },
    { do: mo(3, 0, 1, 0, 0), q: { t: 'Duran 3 kg\'lık bir cisim iki parçaya ayrılıyor: 1 kg\'lık parça 6 m/s ile sola gidiyor. 2 kg\'lık parçanın hızı nedir?', o: ['3 m/s, sağa', '6 m/s, sağa', '3 m/s, sola', '2 m/s, sağa'],
      b: ['Patlamada dış kuvvet yoksa toplam momentum korunur (başta sıfır).'], s: ['0 = 1 · (−6) + 2 · v', 'v = <em>3 m/s sağa</em> ✓'] } },
    { do: mo(1, 6, 1, 0, 1), q: { t: '0,5 kg\'lık top duvara 10 m/s ile dik çarpıp 10 m/s ile geri dönüyor. Temas 0,02 s sürüyorsa duvarın topa uyguladığı ortalama kuvvet kaç N\'dur?', o: ['500', '0', '250', '100'],
      b: [FM('F · Δt = Δp = m (v<sub>son</sub> − v<sub>ilk</sub>)')], s: ['Δp = 0,5 · (10 − (−10)) = 10 kg·m/s', `F = ${F('10', '0,02')} = <em>500 N</em> ✓`] } },
  ], [
    { do: mo(3, 4, 1, 0, 1), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: mo(1, 6, 1, 0, 1), q: { t: 'Top duvara 8 m/s ile çarpıp aynı büyüklükte hızla geri dönüyor. Momentumunun değişimi için ne söylenir?', o: ['Sıfır değildir; 2 m v kadardır', 'Sıfırdır', 'm v kadardır', 'Hız aynı olduğu için hesaplanamaz'],
      b: ['Momentum vektöreldir: yön değişince momentum değişir.'], s: ['Δp = m · 8 − m · (−8) = <em>16 m</em> = 2 m v ✓'], n: ['TUZAK: hızın büyüklüğü aynı diye değişimi sıfır sanmak.'] } },
    { do: mo(2, 5, 3, -2, 1), q: { t: 'Yapışık çarpışmada aşağıdakilerden hangisi her zaman korunur?', o: ['Toplam momentum', 'Toplam kinetik enerji', 'Her cismin hızı', 'Her cismin momentumu'], goster: mg_(2, 5, 3, -2, 1),
      b: ['Dış kuvvet yoksa sistemin toplam momentumu korunur.'], s: ['<em>Toplam momentum</em> korunur ✓; kinetik enerjinin bir kısmı ısıya dönüşür.'], n: ['TUZAK: enerjinin de korunduğunu sanmak. Toplam enerji korunur, KİNETİK enerji korunmaz.'] } },
  ]);

  // ---------------- TORK VE DENGE (W1, d1, W2, d2) ----------------
  const tk = (W1, d1, W2, d2) => S => Object.assign(S, { W1, d1, W2, d2, ac: 0, goster2: 0 }), tg = S => { S.goster2 = 1; };
  bank('Tork ve Denge', 'AYT8', '⚖️', 'tork ve denge', 'Denge şartı, destek tepkisi, eğik kuvvetin torku, tahterevalli.', [
    { do: tk(40, 1.5, 20, 3), sub: 'Destek üzerinde kütlesiz çubuk.', go: '▶︎ Başla' },
    { do: tk(40, 1.5, 20, 3), q: { t: 'Kütlesiz çubukta destekten 1,5 m solda 40 N asılı. 20 N\'luk yük destekten kaç m sağa asılırsa çubuk dengede kalır?', o: ['3', '1,5', '2', '0,75'], goster: tg,
      b: [`Denge: ${FM('Στ = 0')} · ${FM('τ = F · d')}`], s: ['40 · 1,5 = 20 · d', 'd = <em>3 m</em> ✓'] } },
    { do: tk(40, 1.5, 20, 3), q: { t: 'Bu dengede desteğin çubuğa uyguladığı tepki kuvveti kaç N\'dur?', o: ['60', '20', '40', '0'], goster: tg,
      b: ['Dengede ayrıca net kuvvet sıfırdır: ΣF = 0.'], s: ['Tepki = 40 + 20 = <em>60 N</em> (yukarı) ✓'] } },
    { do: tk(300, 2, 400, 1.5), q: { t: 'Tahterevallinin bir ucunda destekten 2 m uzakta 30 kg\'lık çocuk oturuyor. 40 kg\'lık çocuk destekten kaç m uzağa oturursa denge sağlanır?', o: ['1,5', '2', '2,67', '1'], goster: tg,
      b: [FM('m<sub>1</sub> g d<sub>1</sub> = m<sub>2</sub> g d<sub>2</sub>')], s: ['30 · 2 = 40 · d', 'd = <em>1,5 m</em> ✓'], n: ['Ağır olan desteğe daha yakın oturmalıdır.'] } },
    { do: tk(50, 2, 50, 2), q: { t: 'Destekten 2 m uzaktaki noktaya çubukla 30° açı yapan 50 N\'luk kuvvet uygulanıyor. Kuvvetin torku kaç N·m\'dir? (sin 30° = 0,5)', o: ['50', '100', '25', '86'],
      b: [FM('τ = F · d · sin θ'), 'θ: kuvvet ile çubuk arasındaki açı'], s: ['τ = 50 · 2 · 0,5 = <em>50 N·m</em> ✓'], n: ['Torku yalnız kuvvetin çubuğa dik bileşeni oluşturur.'] } },
    { do: tk(60, 1, 20, 3), q: { t: 'Dengedeki çubukta soldaki yük 60 N, destekten 1 m uzakta. Sağdaki 20 N\'luk yük destekten 1 m daha uzağa kaydırılırsa çubuk ne yapar?', o: ['Sağ tarafa döner', 'Sol tarafa döner', 'Dengede kalır', 'Destekten kayar'],
      b: ['Torklar eşit değilse çubuk büyük tork yönünde döner.'], s: ['Sol: 60 · 1 = 60 N·m · Sağ: 20 · 4 = 80 N·m', 'Sağ tork büyük → <em>sağa döner</em> ✓'] } },
  ], [
    { do: tk(40, 1.5, 20, 3), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: tk(40, 2, 40, 2), q: { t: 'Kuvvet, çubuğa döndürme noktasından geçecek doğrultuda (çubuk boyunca) uygulanırsa torku nedir?', o: ['Sıfır', 'F · d', 'En büyük', 'F / d'],
      b: [FM('τ = F · d · sin θ')], s: ['Kuvvet çubuk doğrultusunda → θ = 0° → <em>τ = 0</em> ✓'], n: ['TUZAK: kuvvet büyükse mutlaka döndürür sanmak. Dik uzaklık sıfırsa döndürmez.'] } },
    { do: tk(40, 1.5, 20, 3), q: { t: 'Dengede çubuğa etki eden net kuvvet sıfırsa, çubuk mutlaka dengede midir?', o: ['Hayır, net tork da sıfır olmalı', 'Evet, her zaman', 'Evet, kütlesizse', 'Hayır, hız sıfır olmalı'],
      b: ['Denge için iki şart: ΣF = 0 ve Στ = 0.'], s: ['Zıt yönlü eşit kuvvetler farklı noktalardan uygulanırsa çubuk döner → <em>net tork da sıfır olmalı</em> ✓'], n: ['TUZAK: yalnız kuvvet dengesine bakmak (kuvvet çifti çubuğu döndürür).'] } },
  ]);

  // ---------------- KÜTLE MERKEZİ (m1, x1, m2, x2, m3, x3, cubuk) ----------------
  const km = (m1, x1, m2, x2, m3, x3, cubuk = 0) => S => Object.assign(S, { m1, x1, m2, x2, m3, x3, cubuk });
  bank('Kütle ve Ağırlık Merkezi', 'AYT9', '🎯', 'kütle merkezi', 'Noktasal kütleler, türdeş çubuk, kütle eklenince KM\'nin kayması.', [
    { do: km(2, 0, 6, 8, 0, 4), sub: 'Kütlesiz çubuğa kütleler asılıyor.', go: '▶︎ Başla' },
    { do: km(2, 0, 6, 8, 0, 4), q: { t: '8 m\'lik kütlesiz çubuğun sol ucunda 2 kg, sağ ucunda 6 kg var. Kütle merkezi sol uçtan kaç m uzaktadır?', o: ['6', '4', '2', '5'],
      b: [FM(`x<sub>KM</sub> = ${F('m<sub>1</sub>x<sub>1</sub> + m<sub>2</sub>x<sub>2</sub>', 'm<sub>1</sub> + m<sub>2</sub>')}`)], s: [`x = ${F('0 + 48', '8')} = <em>6 m</em> ✓`] } },
    { do: km(1, 0, 1, 4, 2, 8), q: { t: 'x = 0\'da 1 kg, x = 4 m\'de 1 kg, x = 8 m\'de 2 kg var. Kütle merkezi kaç m\'dedir?', o: ['5', '4', '6', '3'],
      b: [FM(`x<sub>KM</sub> = ${F('Σ m x', 'Σ m')}`)], s: [`x = ${F('0 + 4 + 16', '4')} = <em>5 m</em> ✓`] } },
    { do: km(0, 0, 3, 6, 0, 0, 3), q: { t: '6 m uzunluğunda 3 kg\'lık türdeş çubuğun sağ ucuna 3 kg\'lık cisim asılıyor. Sistemin kütle merkezi sol uçtan kaç m uzaktadır?', o: ['4,5', '3', '6', '5'],
      b: ['Türdeş çubuğun kütle merkezi tam ortasındadır.', FM(`x<sub>KM</sub> = ${F('Σ m x', 'Σ m')}`)], s: [`x = ${F('3 · 3 + 3 · 6', '6')} = <em>4,5 m</em> ✓`] } },
    { do: km(2, 0, 2, 8, 4, 8), q: { t: 'Kütle merkezi ortada olan simetrik bir sisteme sağ uca ek kütle konursa kütle merkezi ne yapar?', o: ['Sağa kayar', 'Sola kayar', 'Değişmez', 'Ortadan aşağı iner'],
      b: ['Kütle merkezi ağır tarafa yakındır.'], s: ['Sağdaki toplam kütle arttı → KM <em>sağa kayar</em> ✓'] } },
  ], [
    { do: km(2, 0, 6, 8, 0, 4), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: km(1, 0, 1, 8, 0, 4), q: { t: 'Bir halkanın (yüzük) kütle merkezi nerededir?', o: ['Halkanın merkezinde, boşlukta', 'Halkanın üzerinde bir noktada', 'Kütle merkezi yoktur', 'En alt noktasında'],
      b: ['Simetrik cisimlerin kütle merkezi simetri merkezindedir.'], s: ['Halkanın simetri merkezi ortadaki boşluktadır ✓'], n: ['TUZAK: kütle merkezinin mutlaka cismin üzerinde olacağını sanmak.'] } },
  ]);

  // ---------------- BASİT MAKİNELER (W, mod 'sabit' / 'har', cek) ----------------
  const bm = (W, mod) => S => Object.assign(S, { W, mod, cek: 0, kos: 0 }), bmg = S => { S.cek = 0; S.kos = 1; };
  bank('Basit Makineler', 'AYT10', '🏗️', 'basit makineler', 'Sabit ve hareketli makara, ip çekme yolu, verim, kaldıraç, iş kazancı.', [
    { do: bm(90, 'sabit'), sub: 'Makaralı düzenek.', go: '▶︎ Başla' },
    { do: bm(90, 'sabit'), q: { t: 'Sabit makarayla 90 N\'luk yük dengede tutuluyor (sürtünme ve makara ağırlığı yok). Uygulanan kuvvet kaç N\'dur?', o: ['90', '45', '180', '30'], goster: bmg,
      b: ['Sabit makara kuvvetin yalnız yönünü değiştirir.'], s: ['F = G = <em>90 N</em> ✓ (kuvvet kazancı 1)'] } },
    { do: bm(90, 'har'), q: { t: 'Aynı 90 N\'luk yük hareketli makaraya asılırsa kaç N kuvvetle dengede tutulur?', o: ['45', '90', '180', '30'], goster: bmg,
      b: ['Hareketli makarada yükü iki ip parçası taşır.'], s: ['2F = 90 → F = <em>45 N</em> ✓'] } },
    { do: bm(90, 'har'), q: { t: 'Hareketli makarada ip 4 m çekilirse yük kaç m yükselir?', o: ['2', '4', '8', '1'], goster: bmg,
      b: ['Kuvvetten kazanç, yoldan kayıptır (iş kazancı yok).'], s: ['İki ip parçası birlikte kısalır: yük 4 / 2 = <em>2 m</em> ✓'] } },
    { do: bm(100, 'har'), q: { t: 'Hareketli makarayla 100 N\'luk yük kaldırılırken ipe 60 N kuvvet uygulanıyor. Düzeneğin verimi yüzde kaçtır?', o: ['%83', '%60', '%100', '%50'], goster: bmg,
      b: [FM(`Verim = ${F('G · h', 'F · x')}`), 'Hareketli makarada x = 2h'], s: [`Verim = ${F('100 · h', '60 · 2h')} = ${F('100', '120')} ≈ <em>%83</em> ✓`], n: ['Verim %100\'den küçüktür: makara ağırlığı ve sürtünme için de iş yapılır.'] } },
    { do: bm(120, 'sabit'), q: { t: '2 m\'lik levyenin desteği yükten 0,5 m uzakta. 600 N\'luk yükü kaldırmak için diğer uca kaç N kuvvet gerekir?', o: ['200', '600', '150', '300'],
      b: [FM('F · (kuvvet kolu) = G · (yük kolu)')], s: ['Kuvvet kolu = 2 − 0,5 = 1,5 m', 'F · 1,5 = 600 · 0,5 → F = <em>200 N</em> ✓'] } },
  ], [
    { do: bm(90, 'sabit'), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' },
    { do: bm(90, 'har'), q: { t: 'Hareketli makara kuvvetten kazanç sağlıyorsa işten de kazanç sağlar mı?', o: ['Hayır, iş aynı kalır (sürtünmesizde)', 'Evet, iş yarıya iner', 'Evet, iş iki katına çıkar', 'Makara türüne bağlıdır'], goster: bmg,
      b: ['İş = kuvvet × yol'], s: ['Kuvvet yarıya iner ama ip iki kat çekilir: F · 2h = G · h → <em>iş aynı</em> ✓'], n: ['TUZAK: basit makinelerin enerji kazandırdığını sanmak. Hiçbir basit makine işten kazanç sağlamaz.'] } },
  ]);
})();
