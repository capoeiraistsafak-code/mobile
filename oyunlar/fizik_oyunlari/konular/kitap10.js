// Kitap soru bankası · TYT (1): Fizik Bilimine Giriş, Madde ve Özellikleri, Enerji, Elektrostatik, Elektrik ve Manyetizma
// Benim Hocam TYT kitap taramasında "[Y] sistemde yok" diye işaretlenen SORU TİPLERİ (KITAP_TAM_TARAMA.md) örnek alınmıştır;
// sorular, sayılar ve durumlar özgündür. Düzenekler ilgili konuların kitap sahneleridir (FZ.SAHNE).
(function () {
  const { gorev } = FZ, SH = FZ.SAHNE || {};
  const D = o => S => Object.assign(S, o);
  const bank = (sinav, ad, sahne, yk, icon, name, task, steps, tuzak) => { if (!sahne) return; const L = [];
    [steps, tuzak || []].forEach(A => A.forEach(st => { if (st.goster && st.q && !st.q.goster) st.q.goster = st.goster; if (st.q && !st.sub) st.sub = steps[0].sub; if (st.q) st.q.kartGizle = true; }));
    L.push(gorev(sahne, { yk: yk + '-k', no: 9, icon, name: 'Kitap soruları: ' + name, task, steps }));
    if (tuzak) L.push(gorev(sahne, { yk: yk + '-t', no: 10, icon: '🪤', name: 'Tuzak sorular 2: ' + name, tuzak: true, task: 'Kitaptaki çeldiricilerden sık yapılan hatalar.', steps: tuzak }));
    FZ.konuEk(sinav, ad, { gorevler: L }); };
  const BAS = (o, sub) => ({ do: D(o), sub, go: '▶︎ Başla' });
  const TZ = o => ({ do: D(o), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' });

  // ======================= FİZİK BİLİMİNE GİRİŞ (madde sahnesi: lab, alet) =======================
  const lab = a => ({ mod: 'lab', alet: a, kos: 0 });
  bank('TYT', 'Fizik Bilimine Giriş', SH.madde, 'TYT1', '🔬', 'fizik bilimine giriş', 'Alt dallar, bilim kurumları, temel–türetilmiş, skaler–vektörel, ölçü aletleri, bilimsel bilgi.', [
    BAS(lab(0), 'Laboratuvar masasında ölçü aletleri.'),
    { do: D(lab(0)), q: { t: 'Güneş\'in enerjisini hidrojen çekirdeklerinin birleşmesiyle (füzyon) ürettiğini inceleyen fizik alt dalı hangisidir?', o: ['Nükleer fizik', 'Optik', 'Termodinamik', 'Mekanik'],
      b: ['Nükleer fizik: atom çekirdeğini, çekirdek tepkimelerini (fisyon, füzyon) ve radyoaktiviteyi inceler.'], s: ['Füzyon bir çekirdek tepkimesidir → <em>nükleer fizik</em> ✓'] } },
    { do: D(lab(0)), q: { t: 'Uçak kanadı tasarımında havanın kanat çevresindeki akışını ve kanada etkiyen kuvvetleri inceleyen alan, fiziğin hangi alt dalına girer?', o: ['Mekanik', 'Atom fiziği', 'Elektromanyetizma', 'Nükleer fizik'],
      b: ['Mekanik: kuvvet ve hareketi inceler (akışkanlar mekaniği, aerodinamik dahil).'], s: ['Aerodinamik → kuvvet ve hareket → <em>mekanik</em> ✓'] } },
    { do: D(lab(0)), q: { t: 'Arkeolojik bir kemiğin yaşının karbon-14 yöntemiyle belirlenmesinde fiziğin hangi alt dalından yararlanılır?', o: ['Nükleer fizik', 'Optik', 'Mekanik', 'Katıhal fiziği'],
      b: ['Karbon-14 radyoaktif bir çekirdektir; yarı ömrü yaklaşık 5730 yıldır.'], s: ['Radyoaktif bozunma → <em>nükleer fizik</em> ✓'] } },
    { do: D(lab(0)), q: { t: 'Türkiye\'de uzay çalışmalarını yürüten kurum hangisidir?', o: ['Türkiye Uzay Ajansı (TUA)', 'ASELSAN', 'TENMAK', 'TÜBA'],
      b: ['TÜBİTAK: bilimsel ve teknolojik araştırmalar · TUA: uzay politikası ve programları · TENMAK (eski TAEK): nükleer enerji ve maden · ASELSAN: savunma elektroniği · TÜBA: bilimler akademisi'], s: ['Uzay programları → <em>TUA</em> ✓'], n: ['Dünyada: NASA (ABD), ESA (Avrupa), CERN (parçacık fiziği, İsviçre–Fransa sınırı).'] } },
    { do: D(lab(2)), q: { t: 'Aşağıdakilerden hangisi hem türetilmiş hem vektörel bir büyüklüktür?', o: ['Kuvvet', 'Kütle', 'Enerji', 'Zaman'],
      b: ['Temel büyüklükler: uzunluk, kütle, zaman, akım, sıcaklık, madde miktarı, ışık şiddeti.', 'Vektörel: yönü olan büyüklük (kuvvet, hız, ivme, yer değiştirme).'], s: ['Kütle ve zaman temel; enerji türetilmiş ama skaler.', 'Kuvvet: türetilmiş (kg·m/s²) ve vektörel ✓'] } },
    { do: D(lab(4)), q: { t: 'Kuvvet hangi aletle ölçülür ve SI birimi nedir?', o: ['Dinamometre, newton', 'Terazi, kilogram', 'Barometre, pascal', 'Ampermetre, amper'],
      b: ['Her büyüklüğün kendine özgü ölçü aleti ve birimi vardır.'], s: ['Kuvvet → <em>dinamometre</em>, birimi <em>newton (N)</em> ✓'], n: ['Kütle eşit kollu terazi ile ölçülür ve değişmez; ağırlık (kuvvet) dinamometreyle ölçülür ve yere göre değişir.'] } },
    { do: D(lab(1)), q: { t: 'Evlerdeki elektrik sayacında okunan "kWh" hangi büyüklüğün birimidir?', o: ['Enerji', 'Güç', 'Akım', 'Gerilim'],
      b: [FM('Enerji = Güç · Zaman') + ' · 1 kWh = 1000 W · 3600 s'], s: ['kW (güç) × h (zaman) → <em>enerji</em> ✓ (1 kWh = 3,6 · 10⁶ J)'] } },
    { do: D(lab(3)), q: { t: 'Bilimsel bilgi için hangisi doğrudur?', o: ['Yeni kanıtlarla değişebilir', 'Bir kez kanıtlanınca hiç değişmez', 'Yalnız gözleme dayanır, deney gerekmez', 'Kişiden kişiye değişir'],
      b: ['Bilimsel bilgi gözlem, deney ve akıl yürütmeyle elde edilir; sınanabilir ve yanlışlanabilir.'], s: ['Bilimsel bilgi kesin değildir; yeni kanıtlarla <em>değişebilir</em> ✓ (ör. atom modelleri)'] } },
  ], [
    TZ(lab(3)),
    { do: D(lab(3)), q: { t: 'Kütle ile ağırlık için hangisi doğrudur?', o: ['Kütle her yerde aynıdır, ağırlık yere göre değişir', 'İkisi de aynı büyüklüktür', 'Kütle dinamometreyle ölçülür', 'Ağırlığın birimi kilogramdır'],
      b: [FM('G = m · g') + ' · g yere göre değişir.'], s: ['Kütle madde miktarıdır, <em>değişmez</em>; ağırlık kütle çekim kuvvetidir, g ile değişir ✓'], n: ['TUZAK: günlük dilde "70 kilo ağırlığındayım" denir; fizikte ağırlık newton ile ölçülür.'] } },
  ]);

  // ======================= MADDE VE ÖZELLİKLERİ (madde sahnesi: terazi, karisim, dayan) =======================
  const kar = (d1, d2, v1, v2) => ({ mod: 'karisim', d1, d2, v1, v2, kar: 0, kos: 0 }), karG = S => { S.kar = 0; S.kos = 1; };
  bank('TYT', 'Madde ve Özellikleri', SH.madde, 'TYT2', '🧪', 'madde ve özellikleri', 'Karışım özkütlesi, suyun özkütle anomalisi, gazın özkütlesi, dayanıklılık, adezyon–kohezyon, yüzey gerilimi, kılcallık.', [
    BAS(kar(1, 0.6, 1, 1), 'Laboratuvar: beherler, karışım kabı, terazi.'),
    { do: D(kar(1.2, 0.8, 1, 1)), goster: karG, q: { t: 'Özkütleleri 1,2 g/cm³ ve 0,8 g/cm³ olan iki sıvıdan EŞİT HACİMLERDE alınıp karıştırılıyor. Karışımın özkütlesi kaç g/cm³\'tür? (Hacim kaybı yok)', o: ['1', '0,96', '2', '0,4'],
      b: [FM(`d<sub>k</sub> = ${F('m<sub>1</sub> + m<sub>2</sub>', 'V<sub>1</sub> + V<sub>2</sub>')}`)], s: [`Eşit hacim V: ${F('1,2V + 0,8V', '2V')} = <em>1 g/cm³</em> ✓ (aritmetik ortalama)`] } },
    { do: D(kar(1.2, 0.8, 2, 3)), goster: karG, q: { t: 'Özkütleleri 1,2 g/cm³ ve 0,8 g/cm³ olan iki sıvıdan EŞİT KÜTLELERDE (240\'ar g) alınıp karıştırılıyor. Karışımın özkütlesi kaç g/cm³\'tür?', o: ['0,96', '1', '1,2', '0,8'],
      b: [FM(`d<sub>k</sub> = ${F('m<sub>1</sub> + m<sub>2</sub>', 'V<sub>1</sub> + V<sub>2</sub>')}`), FM(`V = ${F('m', 'd')}`)], s: ['V₁ = 240 / 1,2 = 200 cm³ · V₂ = 240 / 0,8 = 300 cm³', `d = ${F('480', '500')} = <em>0,96 g/cm³</em> ✓`, '§2. YOL: eşit kütlede ' + FM(`d = ${F('2 d<sub>1</sub> d<sub>2</sub>', 'd<sub>1</sub> + d<sub>2</sub>')}`) + ` = ${F('2 · 1,2 · 0,8', '2')} = 0,96`], n: ['Eşit kütlede karışım özkütlesi, hacmi büyük olan (az yoğun) sıvıya daha yakındır.'] } },
    { do: D(kar(1, 1, 1, 1)), q: { t: 'Su 0 °C\'den 10 °C\'ye ısıtılırken özkütlesi nasıl değişir?', o: ['Önce artar (4 °C\'ye kadar), sonra azalır', 'Sürekli artar', 'Sürekli azalır', 'Değişmez'],
      b: ['Su, 0–4 °C arasında ısıtılınca büzülür (anomali); 4 °C\'de özkütlesi en büyüktür.'], s: ['0 → 4 °C: hacim azalır, d <em>artar</em>; 4 °C\'den sonra hacim artar, d azalır ✓'], n: ['Göllerin yüzeyden donması ve dipte 4 °C\'lik suyun kalması bu yüzdendir.'] } },
    { do: D(kar(1, 1, 1, 1)), q: { t: 'Ucu kapalı şırıngadaki gaz, piston itilerek sıkıştırılıyor. Gazın kütlesi ve özkütlesi nasıl değişir?', o: ['Kütle değişmez, özkütle artar', 'İkisi de artar', 'Kütle artar, özkütle değişmez', 'İkisi de değişmez'],
      b: [FM(`d = ${F('m', 'V')}`), 'Kapalı kaptan madde çıkmaz.'], s: ['m sabit, V azalır → d <em>artar</em> ✓'] } },
    { do: D({ mod: 'dayan', kos: 0 }), q: { t: 'Kenar uzunluğu 2 cm olan küpten yapılmış bir maketin bütün boyutları 3 katına çıkarılırsa dayanıklılığı (kesit / hacim) ne olur?', o: [`${F('1', '3')}'üne iner`, '3 katına çıkar', 'Değişmez', `${F('1', '9')}'una iner`],
      b: [FM(`Dayanıklılık ∝ ${F('kesit alanı', 'hacim')}`), 'Boyut k katı → alan k², hacim k³ katı'], s: [`${F('9', '27')} = <em>${F('1', '3')}</em> ✓`], n: ['Bu yüzden büyük canlıların bacakları vücutlarına oranla kalındır; küçük canlılar kendi ağırlıklarının katlarını taşıyabilir.'] } },
    { do: D({ mod: 'dayan', kos: 0 }), q: { t: 'Cam boruya konan suyun yüzeyi içbükey, cıvanın yüzeyi tümsek görünür. Bunun nedeni nedir?', o: ['Suda adezyon kohezyondan, cıvada kohezyon adezyondan büyük', 'Suda kohezyon daha büyük', 'Cıvanın özkütlesi küçük', 'Cam suyu iter'],
      b: ['Adezyon: farklı maddelerin tanecikleri arasındaki çekim · Kohezyon: aynı maddenin tanecikleri arasındaki çekim.'], s: ['Su camı ıslatır (adezyon > kohezyon) → kenardan tırmanır, içbükey.', 'Cıva camı ıslatmaz (kohezyon > adezyon) → tümsek ✓'] } },
    { do: D({ mod: 'dayan', kos: 0 }), q: { t: 'Suyun yüzey gerilimini AZALTAN hangisidir?', o: ['Deterjan eklemek', 'Suyu soğutmak', 'Suyu saflaştırmak', 'Kabı küçültmek'],
      b: ['Yüzey gerilimi: sıvı yüzeyinin gerilmiş zar gibi davranması (kohezyondan kaynaklanır).', 'Sıcaklık ve yabancı maddeler (sabun, deterjan) yüzey gerilimini azaltır.'], s: ['Deterjan yüzeydeki taneciklerin çekimini zayıflatır → <em>azalır</em> ✓'], n: ['Bu yüzden sabunlu su kirli yüzeyleri daha iyi ıslatır; su üstünde duran böcek deterjanlı suda batar.'] } },
    { do: D({ mod: 'dayan', kos: 0 }), q: { t: 'Kılcal cam borularda suyun yükselme miktarı boru inceldikçe nasıl değişir?', o: ['Artar', 'Azalır', 'Değişmez', 'Su hiç yükselmez'],
      b: ['Kılcallık: sıvının ince borularda adezyon etkisiyle yükselmesi ya da alçalması.'], s: ['İnce boruda adezyonun etkisi daha büyüktür → su daha çok <em>yükselir</em> ✓'], n: ['Bitkilerin kökten yapraklara su taşıması ve gaz lambası fitili kılcallığa örnektir.'] } },
  ], [
    TZ(kar(1, 1, 1, 1)),
    { do: D(kar(1.2, 0.8, 1, 1)), q: { t: 'Altın yüzük ikiye kesilirse her parçanın özkütlesi ne olur?', o: ['Değişmez', 'Yarıya iner', 'İki katına çıkar', 'Kütleye bağlıdır'],
      b: [FM(`d = ${F('m', 'V')}`) + ' · özkütle maddeyi tanıtan (ayırt edici) bir özelliktir.'], s: ['Kütle ve hacim birlikte yarıya iner → <em>d değişmez</em> ✓'], n: ['TUZAK: madde miktarı değişince özkütlenin de değiştiğini sanmak.'] } },
  ]);

  // ======================= ENERJİ (enerji sahnesi: rampa, is, guc) =======================
  const ram = (h, mu) => ({ mod: 'rampa', h, mu, m: 2, k: 200, X: -3.4, v: 0, Q: 0, kos: 0 }), ramG = S => { S.X = -3.4; S.v = 0; S.Q = 0; S.kos = 1; };
  const is = th => ({ mod: 'is', th, F: 50, ix: 0, kos: 0 }), isG = S => { S.ix = 0; S.kos = 1; };
  const gu = (gm, gh, gt) => ({ mod: 'guc', gm, gh, gt, gy: 0, kos: 0 }), guG = S => { S.gy = 0; S.kos = 1; };
  bank('TYT', 'Enerji', SH.enerji, 'TYT4', '⚡', 'iş, güç, enerji', 'İşin tanımı, birimler, potansiyel ve kinetik enerji, güç, verim, enerji kaynakları, mekanik enerji kaybı.', [
    BAS(is(0), 'Kutu çekilen yatay düzlem, rampa ve vinç düzenekleri.'),
    { do: D(is(90)), goster: isG, q: { t: 'Elinde çanta tutarak yatay yolda sabit hızla yürüyen kişi, çantaya uyguladığı kuvvetle fizikçe iş yapar mı?', o: ['Hayır; kuvvet yere değiştirmeye dik', 'Evet; çanta yer değiştiriyor', 'Evet; kişi yoruluyor', 'Yalnız hızlanırsa iş yapar'],
      b: [FM('W = F · x · cos θ') + ' · θ: kuvvet ile yer değiştirme arasındaki açı'], s: ['Kuvvet yukarı, yer değiştirme yatay → θ = 90° → <em>W = 0</em> ✓'], n: ['Yorulmak fizikteki iş anlamına gelmez; kaslar içte enerji harcar.'] } },
    { do: D(is(37)), goster: isG, q: { t: 'Yatayla 37° açı yapan 50 N\'luk kuvvetle kutu 4 m çekiliyor. Kuvvetin yaptığı iş kaç J\'dür? (cos 37° = 0,8)', o: ['160', '200', '120', '40'],
      b: [FM('W = F · x · cos θ')], s: ['W = 50 · 4 · 0,8 = <em>160 J</em> ✓'], n: ['Yalnız kuvvetin hareket doğrultusundaki bileşeni (40 N) iş yapar.'] } },
    { do: D(is(0)), q: { t: 'Aşağıdakilerden hangisi enerji birimi değildir?', o: ['Watt', 'Joule', 'Kalori', 'Kilowatt-saat'],
      b: ['İş ve enerji birimleri: J = N·m = kg·m²/s², kalori, kWh · güç birimi: W = J/s'], s: ['Watt <em>güç</em> birimidir ✓'] } },
    { do: D(gu(50, 3, 5)), goster: guG, q: { t: 'Vinç 50 kg\'lık yükü 5 s\'de sabit hızla 3 m yükseltiyor. Vincin gücü kaç W\'tır? (g = 10 m/s²)', o: ['300', '1500', '30', '750'],
      b: [FM(`P = ${F('W', 't')} = ${F('m g h', 't')}`)], s: [`P = ${F('50 · 10 · 3', '5')} = <em>300 W</em> ✓`] } },
    { do: D(gu(40, 2, 4)), goster: guG, q: { t: 'İki işçi özdeş çimento torbalarını aynı yüksekliğe çıkarıyor. K işçisi 10 torbayı 5 dakikada, L işçisi 8 torbayı 2 dakikada çıkarıyor. Hangisinin gücü büyüktür?', o: ['L', 'K', 'Eşit', 'Karşılaştırılamaz'],
      b: [FM(`P = ${F('W', 't')}`) + ' · bir torba için yapılan iş aynıdır (mgh).'], s: ['K: 10 torba / 5 dk = 2 torba/dk · L: 8 / 2 = 4 torba/dk', 'Birim zamanda yapılan iş L\'de büyük → <em>L</em> ✓'], n: ['Toplam işi K daha çok yaptı; ama güç işin hızıdır.'] } },
    { do: D(ram(2, 0)), goster: ramG, q: { t: 'Yerden 5 m yükseklikten serbest bırakılan top yere çarpıp 1,25 m yükseliyor. Topun mekanik enerjisinin yüzde kaçı ısı ve sese dönüşmüştür?', o: ['%75', '%25', '%50', '%80'],
      b: [FM('E<sub>p</sub> = m g h') + ' · kaybolan enerji = başlangıç − son'], s: ['Son yükseklik ilkinin ¼\'ü → kalan enerji %25', 'Kayıp = <em>%75</em> ✓'] } },
    { do: D(ram(2, 0)), q: { t: 'Hangisi yenilenebilir enerji kaynağıdır?', o: ['Rüzgâr', 'Kömür', 'Doğal gaz', 'Uranyum'],
      b: ['Yenilenebilir: doğada sürekli kendini yenileyen kaynaklar (güneş, rüzgâr, su, jeotermal, biyokütle).'], s: ['<em>Rüzgâr</em> ✓; kömür, doğal gaz ve uranyum tükenebilir (yenilenemez).'] } },
    { do: D(gu(20, 3, 6)), q: { t: 'Bir motor 400 J elektrik enerjisi harcayarak 300 J iş yapıyor. Motorun verimi yüzde kaçtır?', o: ['75', '133', '25', '70'],
      b: [FM(`Verim = ${F('yararlı enerji', 'harcanan enerji')} · 100`)], s: [`${F('300', '400')} · 100 = <em>%75</em> ✓`], n: ['Verim %100\'ü geçemez; kayıp enerji çoğunlukla ısıya dönüşür.'] } },
  ], [
    TZ(ram(2, 0.2)),
    { do: D(ram(2, 0.2)), goster: ramG, q: { t: 'Sürtünmeli yolda kayıp duran bir kutunun enerjisi için hangisi doğrudur?', o: ['Kinetik enerjisi ısıya dönüşmüştür; toplam enerji korunur', 'Enerji yok olmuştur', 'Potansiyel enerjiye dönüşmüştür', 'Kutunun kütlesine dönüşmüştür'],
      b: ['Enerji yoktan var, vardan yok edilemez; biçim değiştirir.'], s: ['Sürtünme kinetik enerjiyi <em>ısıya</em> dönüştürür ✓ (kutu ve zemin ısınır)'], n: ['TUZAK: "enerji harcandı, bitti" demek. Mekanik enerji azalır, toplam enerji korunur.'] } },
  ]);

  // ======================= ELEKTROSTATİK (iki iletken küre: qa, qb, ra, rb, d, dok) =======================
  const kr = (qa, qb, ra = 0.6, rb = 0.6, d = 4) => ({ qa, qb, ra, rb, d, dok: 0, faz: 0, paylasti: 0 }), krG = S => { S.dok = 1; };
  bank('TYT', 'Elektrostatik', SH.statik, 'TYT6', '⚡', 'elektrostatik', 'Yükün kaynağı, sivri uç, topraklama, iki elektroskobun bağlanması, ortamın kuvvete etkisi, alan çizgileri, iletkende yük dağılımı.', [
    BAS(kr(4, -2), 'İki iletken küre yalıtkan ayaklar üzerinde.'),
    { do: D(kr(4, 0)), q: { t: 'Nötr bir cisimden 5 · 10¹² elektron alınırsa cismin yükü kaç C olur? (e = 1,6 · 10⁻¹⁹ C)', o: ['+8 · 10⁻⁷', '−8 · 10⁻⁷', '+3,1 · 10⁻⁷', '−5 · 10¹²'],
      b: [FM('q = n · e') + ' · elektron kaybeden cisim (+) yüklenir.'], s: ['q = 5 · 10¹² · 1,6 · 10⁻¹⁹ = 8 · 10⁻⁷ C', 'Elektron verdi → <em>+8 · 10⁻⁷ C</em> ✓'] } },
    { do: D(kr(6, 0)), q: { t: 'Yüklü bir iletkende yükler en çok nerede toplanır?', o: ['Sivri uçlarda', 'İletkenin merkezinde', 'Düz yüzeylerde', 'Her yerde eşit'],
      b: ['İletkende yükler birbirini iterek dış yüzeye yerleşir; yüzeyin eğriliği büyük (sivri) yerlerde yük yoğunluğu büyüktür.'], s: ['<em>Sivri uçlarda</em> ✓'], n: ['Paratoner (yıldırımsavar) sivri uçlu yapılır: yükü toprağa akıtır.'] } },
    { do: D(kr(-6, 0)), q: { t: 'Nötr iletken küreyi etki ile (+) yüklemek için doğru işlem sırası hangisidir? I. (−) çubuk yaklaştırılır. II. Küre topraklanır. III. Toprak bağlantısı kesilir. IV. Çubuk uzaklaştırılır.', o: ['I – II – III – IV', 'I – II – IV – III', 'II – I – IV – III', 'I – IV – II – III'],
      b: ['Etki ile yüklemede çubuk yakındayken toprak bağlantısı kesilmelidir; yoksa yükler geri döner.'], s: ['(−) çubuk elektronları iter → topraklanınca elektronlar toprağa gider → bağlantı kesilir → çubuk uzaklaşır: küre <em>(+)</em> ✓'], n: ['Çubuk önce uzaklaştırılırsa elektronlar topraktan geri gelir ve küre nötr kalır.'] } },
    { do: D(kr(8, 0)), goster: krG, q: { t: 'Özdeş iki elektroskobun topuzları iletken telle birleştiriliyor. Birinin yükü +8q, diğeri nötr. Son durumda yaprakları için ne söylenir?', o: ['İkisi de +4q ile eşit açılır', 'Birincisi kapanır, ikincisi açılır', 'İkisi de kapanır', 'Birincisi daha çok açık kalır'],
      b: ['Birbirine bağlanan özdeş iletkenler yükü eşit paylaşır.'], s: ['+8q iki özdeş elektroskoba eşit dağılır: <em>+4q ve +4q</em>, yapraklar eşit açılır ✓'] } },
    { do: D(kr(3, 3)), q: { t: 'Havada aralarında F kuvveti olan iki yük arasına yalıtkan (ör. parafin) bir levha konuyor. Kuvvet nasıl değişir?', o: ['Azalır', 'Artar', 'Değişmez', 'Yönü değişir'],
      b: [FM(`F = k ${F('q<sub>1</sub> q<sub>2</sub>', 'd<sup>2</sup>')}`) + ' · k sabiti ortama bağlıdır; boşlukta/havada en büyüktür.'], s: ['Yalıtkan ortam kutuplanarak alanı zayıflatır → k küçülür → F <em>azalır</em> ✓'] } },
    { do: D(kr(6, -2)), q: { t: 'İki yükten çıkan elektrik alan çizgilerinden K\'den çıkan çizgi sayısı L\'ye girenin 2 katıdır. Buna göre yükler için ne söylenir?', o: ['K (+), L (−); |q<sub>K</sub>| = 2|q<sub>L</sub>|', 'K (−), L (+); eşit büyüklükte', 'İkisi de (+)', 'K (+), L (−); |q<sub>L</sub>| = 2|q<sub>K</sub>|'],
      b: ['Alan çizgileri (+) yükten çıkar, (−) yüke girer; çizgi sayısı yük miktarıyla orantılıdır.'], s: ['Çizgi çıkan K (+), giren L (−); çizgi sayısı oranı → <em>|q<sub>K</sub>| = 2|q<sub>L</sub>|</em> ✓'] } },
    { do: D(kr(5, 0, 0.8, 0.4)), q: { t: 'Yüklü içi dolu metal kürenin yükü nerededir ve içindeki elektrik alan nedir?', o: ['Dış yüzeyde; içeride alan sıfır', 'Merkezde; içeride alan en büyük', 'Her yere eşit dağılmış', 'Dış yüzeyde; içeride alan en büyük'],
      b: ['Dengede iletkenin içinde yükler hareket etmez: içerideki net alan sıfırdır.'], s: ['Yük <em>dış yüzeyde</em>, içeride <em>E = 0</em> ✓'], n: ['Faraday kafesi: aracın içindeki kişi yıldırımdan korunur.'] } },
  ], [
    TZ(kr(6, 0)),
    { do: D(kr(6, 0)), q: { t: 'Yüklü bir cisim nötr bir kâğıt parçasını çekiyorsa cismin yükü için ne söylenebilir?', o: ['(+) ya da (−) olabilir', 'Kesinlikle (+)', 'Kesinlikle (−)', 'Cisim nötrdür'],
      b: ['Yüklü cisim nötr cismi kutuplayarak her zaman çeker.'], s: ['Çekme her iki işarette de olur → <em>(+) ya da (−)</em> ✓'], n: ['TUZAK: çekme görünce cisimlerin zıt yüklü olduğuna karar vermek. Kesin karar ancak İTME ile verilir.'] } },
  ]);

  // ======================= ELEKTRİK VE MANYETİZMA (devre: mod seri/paralel, V, R1, R2, pil, ters; mikn) =======================
  const dv = x => Object.assign({ mod: 'seri', V: 12, R1: 4, R2: 4, ac: 1, pil: 1, ters: 0 }, x || {});
  const mk = x => Object.assign({ mod: 'mikn', it: 1, ayr: 0.6 }, x || {});
  bank('TYT', 'Elektrik ve Manyetizma', SH.elektrik, 'TYT7', '💡', 'elektrik ve manyetizma', 'Akım, direnç, eşdeğer direnç, Ohm, üreteçler, akımın ısı etkisi, lamba parlaklığı, mıknatıs ve manyetik alan.', [
    BAS(dv(), 'Devre tahtası: pil, anahtar, lambalar, ölçü aletleri ve mıknatıslar.'),
    { do: D(dv()), q: { t: 'Bir iletkenin kesitinden 4 s\'de 12 C yük geçiyor. Akım kaç A\'dir?', o: ['3', '48', '0,33', '16'],
      b: [FM(`I = ${F('q', 't')}`)], s: [`I = ${F('12', '4')} = <em>3 A</em> ✓`] } },
    { do: D(dv()), q: { t: 'Aynı maddeden yapılmış X telinin boyu L, kesiti A; Y telinin boyu 2L, kesiti 4A. Dirençlerinin oranı R<sub>X</sub> / R<sub>Y</sub> kaçtır?', o: ['2', '½', '8', '1'],
      b: [FM(`R = ρ ${F('L', 'A')}`)], s: [`R<sub>X</sub> ∝ ${F('L', 'A')} · R<sub>Y</sub> ∝ ${F('2L', '4A')} = ${F('L', '2A')}`, `Oran = <em>2</em> ✓`] } },
    { do: D(dv({ mod: 'paralel', R1: 6, R2: 3 })), q: { t: '6 Ω ve 3 Ω\'luk dirençler paralel, bu ikiliye 4 Ω seri bağlanıyor. Eşdeğer direnç kaç Ω\'dur?', o: ['6', '13', '2', '4'],
      b: [`Seri: ${FM('R<sub>eş</sub> = R<sub>1</sub> + R<sub>2</sub>')} · Paralel: ${FM(`${F('1', 'R<sub>eş</sub>')} = ${F('1', 'R<sub>1</sub>')} + ${F('1', 'R<sub>2</sub>')}`)}`], s: [`Paralel: ${F('6 · 3', '6 + 3')} = 2 Ω`, 'Toplam: 2 + 4 = <em>6 Ω</em> ✓'] } },
    { do: D(dv({ R1: 4, R2: 2 })), q: { t: 'Bir direncin uçları arasındaki gerilim 6 V iken akım 1,5 A ölçülüyor. Gerilim 10 V yapılırsa akım kaç A olur? (direnç sabit)', o: ['2,5', '1,5', '4', '15'],
      b: [FM('V = I · R') + ' · V–I grafiğinin eğimi dirençtir.'], s: ['R = 6 / 1,5 = 4 Ω', 'I = 10 / 4 = <em>2,5 A</em> ✓'] } },
    { do: D(dv({ pil: 2 })), q: { t: 'Özdeş iki pil seri yerine paralel bağlanırsa lambanın parlaklığı ve pillerin tükenme süresi nasıl değişir? (iç direnç önemsiz)', o: ['Parlaklık azalır, piller daha uzun dayanır', 'Parlaklık artar, süre kısalır', 'İkisi de değişmez', 'Parlaklık artar, süre uzar'],
      b: ['Seri: ε<sub>eş</sub> = ε₁ + ε₂ · Paralel (özdeş): ε<sub>eş</sub> = ε, akım pillere paylaştırılır.'], s: ['Paralelde gerilim yarıya iner → akım ve parlaklık <em>azalır</em>; her pilden yarım akım çekilir ve akım da azalmıştır → piller <em>çok daha uzun</em> dayanır ✓'] } },
    { do: D(dv({ R1: 4, R2: 4 })), q: { t: '220 V\'luk kettle\'ın direnci 44 Ω. 2 dakikada ürettiği ısı kaç J\'dür?', o: ['132 000', '1100', '5280', '26 400'],
      b: [FM(`W = ${F('V<sup>2</sup>', 'R')} · t`) + ' = I² R t'], s: [`P = ${F('220²', '44')} = 1100 W`, 'W = 1100 · 120 = <em>132 000 J</em> ✓'] } },
    { do: D(dv({ mod: 'paralel', R1: 4, R2: 4 })), q: { t: 'Özdeş üç lambadan K tek başına bir kolda, L ve M birbirine seri olarak ikinci kolda; iki kol aynı üretece paralel bağlı. Parlaklık sıralaması nedir?', o: ['K > L = M', 'L = M > K', 'K = L = M', 'K < L < M'],
      b: [FM(`P = ${F('V<sup>2</sup>', 'R')}`) + ' · paralel kolların gerilimi eşittir; seri lambalar gerilimi paylaşır.'], s: ['K\'nin gerilimi V, L ve M\'nin her biri V/2', 'P ∝ V² → <em>K > L = M</em> ✓'] } },
    { do: D(mk({ it: 1, ayr: 0.6 })), q: { t: 'İki mıknatıs arasındaki uzaklık 2 katına çıkarılırsa aralarındaki manyetik kuvvet ne olur?', o: [`${F('1', '4')}'üne iner`, 'Yarıya iner', '2 katına çıkar', 'Değişmez'],
      b: [FM(`F = k ${F('m<sub>1</sub> m<sub>2</sub>', 'd<sup>2</sup>')}`) + ' (m: kutup şiddeti)'], s: [`d 2 katı → F <em>${F('1', '4')}</em> ✓`] } },
    { do: D(mk({ it: 0, ayr: 0.6 })), q: { t: 'Demir çivinin üzerine yalıtılmış tel sarılıp pile bağlanarak elektromıknatıs yapılıyor. Çivinin daha çok toplu iğne çekmesi için ne yapılmalıdır?', o: ['Sarım sayısını ve akımı artırmak', 'Teli kısaltıp sarımı azaltmak', 'Çiviyi bakır çiviyle değiştirmek', 'Pili ters bağlamak'],
      b: ['Bobinin manyetik alanı sarım sayısı ve akımla artar; demir çekirdek alanı güçlendirir.'], s: ['<em>Sarım sayısı ve akım artırılmalı</em> ✓'], n: ['Pili ters bağlamak yalnız kutupları yer değiştirir; alanın büyüklüğünü değiştirmez.'] } },
  ], [
    TZ(dv()),
    { do: D(dv({ mod: 'paralel', R1: 4, R2: 4 })), q: { t: 'Evdeki lambalardan biri yandığında diğerleri neden sönmez?', o: ['Lambalar paralel bağlıdır', 'Lambalar seri bağlıdır', 'Her lambanın ayrı sigortası vardır', 'Akım lambada harcanmaz'],
      b: ['Seri bağlamada tek yol vardır; paralelde her lamba ayrı koldadır.'], s: ['Paralel bağlı → bir kol kopunca diğer kollar etkilenmez ✓'], n: ['TUZAK: "lamba bozulunca akım biter" sanmak; yalnız o kolun akımı biter.'] } },
  ]);
})();
