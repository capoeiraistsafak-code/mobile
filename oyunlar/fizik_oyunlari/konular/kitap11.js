// Kitap soru bankası · TYT (2): Hareket ve Kuvvet, Basınç ve Kaldırma Kuvveti, Isı ve Sıcaklık
// Benim Hocam TYT kitap taramasında "[Y] sistemde yok" diye işaretlenen SORU TİPLERİ (KITAP_TAM_TARAMA.md) örnek alınmıştır;
// sorular, sayılar ve durumlar özgündür. Düzenekler ilgili konuların kitap sahneleridir (FZ.SAHNE).
(function () {
  const { gorev } = FZ, SH = FZ.SAHNE || {};
  const D = o => S => Object.assign(S, o);
  const bank = (sinav, ad, sahne, yk, icon, name, task, steps, tuzak) => { if (!sahne) return; const L = [];
    [steps, tuzak || []].forEach(A => A.forEach(st => { if (st.q && !st.sub) st.sub = steps[0].sub; if (st.q) { st.q.kartGizle = true; if (sahne === SH.basinc) st.q.gizle = (st.q.gizle || []).concat(['bsF', 'bsT']); } }));
    L.push(gorev(sahne, { yk: yk + '-k', no: 9, icon, name: 'Kitap soruları: ' + name, task, steps }));
    if (tuzak) L.push(gorev(sahne, { yk: yk + '-t', no: 10, icon: '🪤', name: 'Tuzak sorular 2: ' + name, tuzak: true, task: 'Kitaptaki çeldiricilerden sık yapılan hatalar.', steps: tuzak }));
    FZ.konuEk(sinav, ad, { gorevler: L }); };
  const BAS = (o, sub) => ({ do: D(o), sub, go: '▶︎ Başla' });
  const TZ = o => ({ do: D(o), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' });

  // ======================= HAREKET VE KUVVET (yol: iki araba; kutu: F, m, μs, μk) =======================
  const yol = (x1, v1, a1, x2, v2, a2, tson = 6) => ({ mod: 'yol', kos: 0, x1, v1, a1, x2, v2, a2, tk: 0, iz: [[], []], tson }), yolG = S => { S.kos = 1; };
  const ku = (F, m, mus, muk) => ({ mod: 'kutu', kos: 0, F, m, mus, muk, sp: 0, xk: mus > 0 ? 3.5 : 0, vk: 0 }), kuG = S => { S.xk = S.mus > 0 ? 3.5 : 0; S.vk = 0; S.kos = 1; };   // sürtünmeli sorularda koli halının (koyu bölge) üstünde
  bank('TYT', 'Hareket ve Kuvvet', SH.hareket, 'TYT3', '🚗', 'hareket ve kuvvet', 'Ortalama hız–sürat, ortalama hız sınırı, grafikler, ivmeli hareket, temas gerektirmeyen ve temel kuvvetler, sürtünme, tepki kuvveti, bağlı cisimler.', [
    BAS(yol(0, 10, 0, 60, -5, 0), 'Düz yol üzerinde arabalar ve halıdaki koli.'),
    { do: D(yol(0, 15, 0, 60, 0, 0)), goster: yolG, q: { t: 'Bir otomobil İstanbul\'dan Ankara\'ya 450 km\'lik yolu 5 saatte gidiyor. İki şehir arasındaki kuş uçuşu uzaklık 350 km. Ortalama sürat ve ortalama hızın büyüklüğü kaç km/h\'tir?', o: ['90 ve 70', '70 ve 90', '90 ve 90', '80 ve 70'],
      b: [`${FM(`Ortalama sürat = ${F('alınan yol', 'süre')}`)} · ${FM(`Ortalama hız = ${F('yer değiştirme', 'süre')}`)}`], s: [`Sürat = ${F('450', '5')} = 90 km/h`, `Hız = ${F('350', '5')} = <em>70 km/h</em> ✓`], n: ['Yol skaler, yer değiştirme vektördür; yer değiştirme yoldan büyük olamaz.'] } },
    { do: D(yol(0, 25, 0, 60, 0, 0)), goster: yolG, q: { t: '6 km\'lik ortalama hız denetimli yolda sınır 90 km/h. Bir araç bu yolu en az kaç dakikada geçmelidir ki ceza almasın?', o: ['4', '6', '5', '3'],
      b: [FM(`t = ${F('x', 'v')}`) + ' · 1 saat = 60 dakika'], s: [`t = ${F('6', '90')} saat = ${F('1', '15')} saat = <em>4 dakika</em> ✓`], n: ['4 dakikadan kısa sürede geçen aracın ortalama hızı 90 km/h\'i aşar.'] } },
    { do: D(yol(0, 10, -2.5, 60, 0, 0)), goster: yolG, q: { t: '10 m/s ile giden araba düzgün yavaşlayarak 4 s\'de duruyor. Hız–zaman grafiğine göre bu sürede kaç m yol alır?', o: ['20', '40', '10', '2,5'],
      b: ['Hız–zaman grafiğinin altındaki alan yer değiştirmeyi verir.'], s: [`Üçgen alanı: ${F('1', '2')} · 4 · 10 = <em>20 m</em> ✓`] } },
    { do: D(yol(0, 10, 0, 60, 0, 0)), q: { t: 'Konum–zaman grafiği zaman eksenine paralel bir doğru olan cisim için ne söylenir?', o: ['Duruyor', 'Sabit hızla gidiyor', 'Düzgün hızlanıyor', 'Düzgün yavaşlıyor'],
      b: ['Konum–zaman grafiğinin eğimi hızı verir.'], s: ['Konum değişmiyor → eğim sıfır → <em>duruyor</em> ✓'], n: ['Hız–zaman grafiğinde yatay doğru ise sabit hızlı hareket demektir; grafik türüne dikkat!'] } },
    { do: D(yol(0, 10, 0, 60, 0, 0)), q: { t: 'Sabit süratle dönen dönme dolaptaki yolcu için hangisi doğrudur?', o: ['İvmelidir, çünkü hızının yönü değişir', 'İvmesi sıfırdır, sürati sabittir', 'Yalnız tepede ivmelidir', 'Net kuvvet sıfırdır'],
      b: ['İvme: hız VEKTÖRÜNÜN değişimi (büyüklük ya da yön).'], s: ['Hızın yönü sürekli değişir → <em>ivmeli hareket</em> ✓ (merkeze doğru)'] } },
    { do: D(ku(0, 5, 0.4, 0.3)), q: { t: 'Yağmur damlası yere yaklaşırken bir süre sonra sabit hızla düşmeye başlıyor. Bu durumda damlaya etki eden kuvvetler için ne söylenir?', o: ['Hava direnci ağırlığa eşittir; net kuvvet sıfır', 'Ağırlık sıfır olmuştur', 'Hava direnci ağırlıktan büyüktür', 'Yalnız ağırlık etki eder'],
      b: ['Newton\'un 1. yasası: net kuvvet sıfırsa cisim sabit hızla gider.'], s: ['Sabit hız → <em>F<sub>net</sub> = 0</em>: hava direnci = ağırlık ✓ (limit hız)'] } },
    { do: D(ku(0, 5, 0.4, 0.3)), q: { t: 'Aşağıdaki kuvvetlerden hangisi temas gerektirir?', o: ['Sürtünme kuvveti', 'Kütle çekim kuvveti', 'Manyetik kuvvet', 'Elektriksel kuvvet'],
      b: ['Temas gerektirmeyen kuvvetler alanlar aracılığıyla etki eder (kütle çekim, elektrik, manyetik).'], s: ['Sürtünme yüzeyler birbirine değdiğinde oluşur → <em>temas gerektirir</em> ✓'], n: ['Doğadaki dört temel kuvvet (güçlüden zayıfa): güçlü nükleer, elektromanyetik, zayıf nükleer, kütle çekim.'] } },
    { do: D(ku(30, 10, 0.5, 0.4)), goster: kuG, q: { t: 'Yatay zeminde duran 10 kg\'lık kutuya 30 N yatay kuvvet uygulanıyor (μ<sub>s</sub> = 0,5, μ<sub>k</sub> = 0,4). Kutuya etki eden sürtünme kuvveti kaç N\'dur? (g = 10 m/s²)', o: ['30', '50', '40', '0'],
      b: [FM('f<sub>s,max</sub> = μ<sub>s</sub> · N') + ' · cisim kaymıyorsa statik sürtünme uygulanan kuvvete eşittir.'], s: ['f<sub>s,max</sub> = 0,5 · 100 = 50 N > 30 N → kutu kaymaz', 'Sürtünme = <em>30 N</em> ✓'] } },
    { do: D(ku(20, 4, 0.3, 0.2)), goster: kuG, q: { t: '4 kg\'lık kutu 20 N yatay kuvvetle çekiliyor ve kayıyor (μ<sub>k</sub> = 0,2). İvmesi kaç m/s²\'dir? (g = 10 m/s²)', o: ['3', '5', '2', '1,5'],
      b: [`${FM('f<sub>k</sub> = μ<sub>k</sub> · N')} · ${FM(`a = ${F('F − f', 'm')}`)}`], s: ['f = 0,2 · 40 = 8 N', `a = ${F('20 − 8', '4')} = <em>3 m/s²</em> ✓`] } },
    { do: D(ku(0, 5, 0.4, 0.3)), q: { t: 'Masa üzerindeki 5 kg\'lık kutunun üstüne elle 20 N düşey aşağı kuvvet uygulanıyor. Masanın kutuya uyguladığı tepki kuvveti kaç N\'dur? (g = 10 m/s²)', o: ['70', '50', '30', '20'],
      b: ['Düşeyde denge: yukarı kuvvetler = aşağı kuvvetler.'], s: ['N = mg + F = 50 + 20 = <em>70 N</em> ✓'], n: ['Tepki kuvveti her zaman mg\'ye eşit değildir.'] } },
    { do: D(ku(0, 2, 0.4, 0.3)), q: { t: '2 kg\'lık kitap düşey duvara 50 N yatay kuvvetle bastırılarak dengede tutuluyor. Duvarın kitaba uyguladığı sürtünme kuvveti kaç N ve hangi yöndedir? (g = 10 m/s²)', o: ['20 N, yukarı', '50 N, yukarı', '20 N, aşağı', '0'],
      b: ['Kitap düşeyde dengede: sürtünme ağırlığı dengeler. Duvarın tepki kuvveti yataydır (yüzeye dik).'], s: ['f = mg = <em>20 N, yukarı</em> ✓; N = 50 N yatay'] } },
    { do: D(ku(20, 5, 0, 0)), goster: kuG, q: { t: 'Sürtünmesiz yatay zeminde yan yana duran 2 kg ve 3 kg\'lık bloklara 2 kg\'lık bloktan 20 N kuvvet uygulanıyor. Blokların birbirine uyguladığı kuvvet kaç N\'dur?', o: ['12', '20', '8', '4'],
      b: [`Sistem: ${FM(`a = ${F('F', 'm<sub>1</sub> + m<sub>2</sub>')}`)} · arkadaki 3 kg\'lık bloğu yalnız temas kuvveti iter.`], s: ['a = 20 / 5 = 4 m/s²', 'Temas kuvveti = 3 · 4 = <em>12 N</em> ✓'] } },
  ], [
    TZ(ku(0, 5, 0.4, 0.3)),
    { do: D(ku(0, 5, 0.4, 0.3)), q: { t: 'Masa üzerinde duran kitaba etki eden ağırlık ile masanın kitaba uyguladığı tepki kuvveti için hangisi doğrudur?', o: ['Eşit ve zıttır ama etki–tepki çifti değildir', 'Etki–tepki çiftidir', 'Tepki kuvveti her zaman ağırlıktan büyüktür', 'İkisi de masaya etki eder'],
      b: ['Etki–tepki kuvvetleri FARKLI cisimlere etki eder.'], s: ['Ağırlık ve N\'nin ikisi de kitaba etki eder → <em>etki–tepki değildir</em> ✓', 'Ağırlığın tepkisi kitabın Dünya\'yı çekmesidir.'], n: ['TUZAK: eşit ve zıt her kuvvet çiftini etki–tepki sanmak.'] } },
    { do: D(ku(0, 5, 0, 0)), goster: kuG, q: { t: 'Sürtünmesiz yatay düzlemde hareket eden bir cismin sabit hızla gitmeye devam etmesi için ne gerekir?', o: ['Hiçbir kuvvet gerekmez', 'Hareket yönünde sabit bir kuvvet', 'Gittikçe artan bir kuvvet', 'Harekete zıt bir kuvvet'],
      b: ['Newton\'un 1. yasası (eylemsizlik).'], s: ['Net kuvvet sıfırsa cisim hızını korur → <em>kuvvet gerekmez</em> ✓'], n: ['TUZAK: "hareket için kuvvet gerekir" sanmak (Aristo\'nun yanlışı). Kuvvet hızı DEĞİŞTİRMEK için gerekir.'] } },
  ]);

  // ======================= BASINÇ VE KALDIRMA KUVVETİ =======================
  const md = (mod, x) => Object.assign({ mod, kos: 0 }, x || {});
  bank('TYT', 'Basınç ve Kaldırma Kuvveti', SH.basinc, 'TYT8', '🧱', 'basınç ve kaldırma kuvveti', 'Katı basıncı, kap ters çevirme, birleşik kaplar, gaz basıncı, yükseklik ve açık hava basıncı, hidrolik, kaldırma kuvveti, yüzme, Bernoulli.', [
    BAS(md('kati', { o: 0, ust: 0, dongu: 0, kes: 0 }), 'Basınç laboratuvarı: sünger, tuğla, kaplar, U borusu, hidrolik, barometre.'),
    { do: D(md('kati', { o: 2, ust: 0, dongu: 0, kes: 0 })), q: { t: '20 kg\'lık dikdörtgen kutunun yüzey alanları 0,1 m², 0,2 m² ve 0,4 m². Kutunun zemine yapabileceği en büyük basınç kaç Pa\'dır? (g = 10 m/s²)', o: ['2000', '500', '1000', '200'],
      b: [FM(`P = ${F('F', 'A')}`) + ' · F = mg her konumda aynıdır.'], s: [`En küçük yüzey üstünde: ${F('200', '0,1')} = <em>2000 Pa</em> ✓`] } },
    { do: D(md('sivi', { h: 1.5, dolum: 0, iki: 0 })), q: { t: 'Ağzı kapalı, tamamen su dolu kesik koni biçimli kap ters çevriliyor. Tabana etki eden sıvı basıncı ve basınç kuvveti nasıl değişir?', o: ['Basınç değişmez, kuvvet taban alanıyla değişir', 'İkisi de değişmez', 'Basınç artar, kuvvet azalır', 'İkisi de artar'],
      b: [`${FM('P = h · d · g')} · ${FM('F = P · A')}`], s: ['Kap tamamen dolu → h aynı → <em>P değişmez</em>', 'Taban alanı değişti → F = P · A <em>değişir</em> ✓'], n: ['Kap tamamen dolu değilse ters çevirince sıvı yüksekliği de değişir.'] } },
    { do: D(md('sivi', { h: 1.5, dolum: 0, iki: 0 })), q: { t: 'Barajların taban kısmının üst kısmından kalın yapılmasının nedeni nedir?', o: ['Sıvı basıncı derinlikle artar', 'Suyun ağırlığı yalnız tabana etki eder', 'Üstte rüzgâr basıncı vardır', 'Taban daha soğuktur'],
      b: [FM('P = h · d · g')], s: ['Derinlik arttıkça basınç ve yan yüzeye etki eden kuvvet artar → taban <em>kalın</em> yapılır ✓'] } },
    { do: D(md('gaz', { irt: 0, gazP: 86 })), q: { t: 'Açık hava basıncının 76 cmHg olduğu yerde kapalı kaptaki gaza bağlı açık uçlu cıvalı manometrede açık koldaki cıva 10 cm yukarıda. Gazın basıncı kaç cmHg\'dir?', o: ['86', '66', '76', '10'],
      b: ['Aynı yatay düzlemde, aynı sıvının içindeki noktalarda basınç eşittir.'], s: ['Gaz tarafı alçakta → P<sub>gaz</sub> = P<sub>0</sub> + h = 76 + 10 = <em>86 cmHg</em> ✓'] } },
    { do: D(md('gaz', { irt: 2000, gazP: 86 })), q: { t: 'Torricelli barometresi deniz kenarından 2000 m yükseklikteki bir dağa çıkarılıyor. Borudaki cıva yüksekliği ne olur?', o: ['Azalır', 'Artar', 'Değişmez', 'Sıfır olur'],
      b: ['Açık hava basıncı, üstteki hava sütununun ağırlığından kaynaklanır.'], s: ['Yükseklik arttıkça üstteki hava azalır → P<sub>0</sub> azalır → cıva <em>alçalır</em> ✓'], n: ['Bu yüzden yüksekte su daha düşük sıcaklıkta kaynar.'] } },
    { do: D(md('hid', { itis: 0, s1: 0.01, s2: 0.25, mk: 1000, x1: 50 })), goster: S => { S.itis = 0; S.kos = 1; }, q: { t: 'Hidrolik krikoda küçük pistonun alanı 0,01 m², büyük pistonun alanı 0,25 m². 1000 kg\'lık otomobili kaldırmak için küçük pistona kaç N kuvvet uygulanmalıdır? (g = 10 m/s²)', o: ['400', '10 000', '250', '40'],
      b: ['Pascal ilkesi: ' + FM(`${F('F<sub>1</sub>', 'S<sub>1</sub>')} = ${F('F<sub>2</sub>', 'S<sub>2</sub>')}`)], s: [`F<sub>1</sub> = 10 000 · ${F('0,01', '0,25')} = <em>400 N</em> ✓`], n: ['Kuvvetten kazanç yoldan kayıptır: küçük piston 25 kat fazla yol alır.'] } },
    { do: D(md('kald', { cis: 'demir', ind: 1, V: 2, indH: 1 })), q: { t: 'Havada 60 N gelen, hacmi 2 L olan cisim tamamen suya daldırılıyor. Dinamometre kaç N gösterir? (d<sub>su</sub> = 1000 kg/m³, g = 10 m/s²)', o: ['40', '20', '60', '80'],
      b: [`${FM('F<sub>k</sub> = V<sub>batan</sub> · d<sub>sıvı</sub> · g')} · dinamometre = G − F<sub>k</sub> · 1 L = 0,001 m³`], s: ['F<sub>k</sub> = 0,002 · 1000 · 10 = 20 N', 'Dinamometre = 60 − 20 = <em>40 N</em> ✓'] } },
    { do: D(md('kald', { cis: 'tahta', ind: 1, V: 1, dt: 0.6, indH: 1 })), q: { t: 'Özkütlesi 0,6 g/cm³ olan tahta suda yüzüyor. Hacminin yüzde kaçı su içindedir?', o: ['60', '40', '100', '6'],
      b: ['Yüzen cisimde F<sub>k</sub> = G: ' + FM('V<sub>batan</sub> · d<sub>sıvı</sub> = V · d<sub>cisim</sub>')], s: [`${F('V<sub>batan</sub>', 'V')} = ${F('0,6', '1')} = <em>%60</em> ✓`] } },
    { do: D(md('akis', { hiz: 1 })), q: { t: 'Aralarında birkaç cm boşluk olan iki kâğıdın arasına üflenirse kâğıtlar ne yapar?', o: ['Birbirine yaklaşır', 'Birbirinden uzaklaşır', 'Hareket etmez', 'Yukarı kalkar'],
      b: ['Bernoulli: akışkanın hızının büyük olduğu yerde basıncı küçüktür.'], s: ['Arada hava hızlanır → basınç düşer → dıştaki büyük basınç kâğıtları <em>birbirine yaklaştırır</em> ✓'], n: ['Uçak kanadı, rüzgârda uçan çatı ve duş perdesinin içeri çekilmesi aynı ilkeyle açıklanır.'] } },
    { do: D(md('kald', { cis: 'tahta', ind: 1, V: 1, dt: 0.9, indH: 1 })), q: { t: 'Su dolu bardakta yüzen buz tamamen eriyince su seviyesi nasıl değişir?', o: ['Değişmez', 'Yükselir', 'Alçalır', 'Bardak taşar'],
      b: ['Yüzen buz kendi ağırlığı kadar su taşırır (F<sub>k</sub> = G).'], s: ['Eriyen buz, ağırlığı kadar suya dönüşür; bu su tam olarak batan hacmi doldurur → seviye <em>değişmez</em> ✓'] } },
  ], [
    TZ(md('kald', { cis: 'demir', ind: 0.85, V: 1, indH: 1 })),
    { do: D(md('kald', { cis: 'demir', ind: 1, V: 1, indH: 1 })), q: { t: 'Tamamen suya batmış bir taş daha derine indirilirse taşa etki eden kaldırma kuvveti ne olur?', o: ['Değişmez', 'Artar', 'Azalır', 'Sıfır olur'],
      b: [FM('F<sub>k</sub> = V<sub>batan</sub> · d<sub>sıvı</sub> · g')], s: ['V<sub>batan</sub> artık değişmez → <em>F<sub>k</sub> değişmez</em> ✓'], n: ['TUZAK: "derinde basınç büyük, kaldırma da büyür" sanmak. Üst ve alt yüzey arasındaki basınç FARKI aynı kalır.'] } },
  ]);

  // ======================= ISI VE SICAKLIK (tencere, karisim, termo, halka, ray) =======================
  const is2 = (mod, x) => Object.assign({ mod, kos: 0 }, x || {});
  bank('TYT', 'Isı ve Sıcaklık', SH.isi, 'TYT5', '🌡️', 'ısı ve sıcaklık', 'Termometre ölçekleri, Kelvin, ısı alışverişi, hal değişimi, kaynama ve basınç, buharlaşma, genleşme, ısı iletimi.', [
    BAS(is2('termo', { Tx: [20, 120], Ty: [-10, 140], Tc: 40 }), 'Isı laboratuvarı: termometreler, ocaklar, halka ve küre, raylar.'),
    { do: D(is2('termo', { Tx: [20, 120], Ty: [-10, 140], Tc: 50 })), q: { t: 'Uydurma X termometresi suyun donma noktasını 20 °X, kaynama noktasını 120 °X gösteriyor. 50 °C\'lik su bu termometrede kaç °X okunur?', o: ['70', '50', '60', '80'],
      b: [FM(`${F('X − X<sub>donma</sub>', 'X<sub>kaynama</sub> − X<sub>donma</sub>')} = ${F('C − 0', '100 − 0')}`)], s: [`${F('X − 20', '100')} = ${F('50', '100')} → X = <em>70 °X</em> ✓`] } },
    { do: D(is2('termo', { Tx: [20, 120], Ty: [-10, 140], Tc: 0 })), q: { t: 'Celsius ve Fahrenheit termometrelerinin aynı değeri gösterdiği sıcaklık kaçtır?', o: ['−40', '0', '32', '100'],
      b: [FM(`${F('C', '100')} = ${F('F − 32', '180')}`)], s: ['C = F = x: 180x = 100x − 3200 → x = <em>−40</em> ✓'] } },
    { do: D(is2('termo', { Tx: [20, 120], Ty: [-10, 140], Tc: 27 })), q: { t: '27 °C kaç kelvindir?', o: ['300', '246', '27', '273'],
      b: [FM('T(K) = t(°C) + 273')], s: ['27 + 273 = <em>300 K</em> ✓'], n: ['Kelvin ölçeğinde negatif değer yoktur; 0 K mutlak sıfırdır.'] } },
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), goster: S => { S.Qmax = 6000; S.kos = 1; }, q: { t: '500 g su 20 °C\'den 60 °C\'ye ısıtılıyor. Suya kaç kalori ısı verilmiştir? (c<sub>su</sub> = 1 cal/g·°C)', o: ['20 000', '40 000', '10 000', '30 000'],
      b: [FM('Q = m · c · ΔT')], s: ['Q = 500 · 1 · 40 = <em>20 000 cal</em> ✓'] } },
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), q: { t: '0 °C\'deki 200 g buzu tamamen eritmek için kaç kalori ısı gerekir? (L<sub>erime</sub> = 80 cal/g)', o: ['16 000', '200', '80', '1600'],
      b: [FM('Q = m · L')], s: ['Q = 200 · 80 = <em>16 000 cal</em> ✓'], n: ['Erime süresince sıcaklık 0 °C\'de sabit kalır.'] } },
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), q: { t: 'Düdüklü tencerede yemeklerin daha çabuk pişmesinin nedeni nedir?', o: ['Basınç artar, kaynama sıcaklığı yükselir', 'Su daha düşük sıcaklıkta kaynar', 'Ocak daha çok ısı verir', 'Buhar dışarı kaçmaz, sıcaklık düşer'],
      b: ['Kaynama sıcaklığı, sıvının üzerindeki basınca bağlıdır.'], s: ['Kapalı tencerede buhar basıncı artar → su 100 °C\'nin üstünde kaynar → yemek <em>daha yüksek sıcaklıkta</em> pişer ✓'], n: ['Dağda (düşük basınç) su 100 °C\'nin altında kaynar; yemek geç pişer.'] } },
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), q: { t: 'Islak çamaşırın daha çabuk kuruması için hangisi YAPILMAMALIDIR?', o: ['Katlanıp üst üste konması', 'Rüzgârlı yere asılması', 'Güneşli yere asılması', 'Açık serilmesi'],
      b: ['Buharlaşma hızı: sıcaklık, açık yüzey alanı ve rüzgârla artar; ortamın nemi arttıkça azalır.'], s: ['Katlamak açık yüzeyi küçültür → buharlaşma <em>yavaşlar</em> ✓'] } },
    { do: D(is2('ray', { gun: 1 })), q: { t: 'Boyu 20 m olan çelik ray 40 °C ısınıyor. Boyca uzama katsayısı 1,2 · 10⁻⁵ 1/°C ise ray kaç mm uzar?', o: ['9,6', '0,96', '96', '4,8'],
      b: [FM('ΔL = L<sub>0</sub> · λ · ΔT')], s: ['ΔL = 20 · 1,2 · 10⁻⁵ · 40 = 9,6 · 10⁻³ m = <em>9,6 mm</em> ✓'], n: ['Raylar arasında bu yüzden boşluk bırakılır.'] } },
    { do: D(is2('halka', { isi: 0 })), goster: S => { S.isi = 1; S.kos = 1; }, q: { t: 'Delikli metal levha ısıtılırsa deliğin çapı nasıl değişir?', o: ['Büyür', 'Küçülür', 'Değişmez', 'Önce küçülür, sonra büyür'],
      b: ['Isınan katının bütün boyutları aynı oranda büyür.'], s: ['Delik, levhanın "eksik parçası" gibi genleşir → <em>büyür</em> ✓'] } },
    { do: D(is2('karisim', { mk: [300, 100], Tk: [70, 10], kar: 0 })), goster: S => { S.kar = 0; S.kos = 1; }, q: { t: '70 °C\'deki 300 g su ile 10 °C\'deki 100 g su ısı yalıtımlı kapta karıştırılıyor. Denge sıcaklığı kaç °C olur?', o: ['55', '40', '50', '60'],
      b: [FM('Q<sub>verilen</sub> = Q<sub>alınan</sub>') + ' · ' + FM('Q = m c ΔT')], s: ['300 · (70 − T) = 100 · (T − 10)', '21 000 + 1000 = 400T → T = <em>55 °C</em> ✓'] } },
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), q: { t: 'Kışın aynı sıcaklıktaki metal bank ile tahta banka dokunulduğunda metal daha soğuk hissedilir. Nedeni nedir?', o: ['Metal ısıyı elden daha hızlı iletir', 'Metalin sıcaklığı daha düşüktür', 'Tahta ısı üretir', 'Metal soğuğu iletir'],
      b: ['Isı iletim hızı maddenin cinsine bağlıdır: metaller iyi, tahta kötü iletkendir.'], s: ['Sıcaklıkları aynıdır; metal elden ısıyı <em>daha hızlı</em> çeker ✓'], n: ['"Soğuk" bir enerji türü değildir; aktarılan şey ısıdır.'] } },
  ], [
    TZ(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })),
    { do: D(is2('tencere', { ms: [1, 2, 3], cs: [1, 1, 1], T0: [20, 20, 20], Q: 0 })), q: { t: 'Isı alan bir maddenin sıcaklığı her zaman artar mı?', o: ['Hayır; hal değiştirirken sıcaklık sabit kalır', 'Evet, her zaman artar', 'Evet, yalnız katılarda', 'Hayır; ısı alınca sıcaklık azalır'],
      b: ['Hal değişimi sırasında verilen ısı tanecikler arası bağları koparmaya harcanır.'], s: ['Erime ve kaynama sırasında sıcaklık <em>sabit kalır</em> ✓'], n: ['TUZAK: ısı ile sıcaklığı aynı şey sanmak.'] } },
  ]);
})();
