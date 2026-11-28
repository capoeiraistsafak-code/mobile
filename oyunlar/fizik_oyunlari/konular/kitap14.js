// Kitap soru bankası · AYT (3): kitabın s.199–320 taramasında "[Y] sistemde yok" diye işaretlenen SORU TİPLERİ
// (KITAP_TAM_TARAMA.md): yüklü parçacık ve indüksiyon, alternatif akım–rezonans, girişim–kırınım, Doppler ve EM dalgalar,
// Bohr modeli ve spektrum, kuarklar ve Big Bang, radyoaktivite, özel görelilik, Compton, fotoelektrik–fotosel,
// yarı iletkenler, süper iletkenlik, görüntüleme teknolojileri. Sorular, sayılar ve durumlar özgündür.
// Her görev, konusuna en uygun mevcut 3D düzeneği kullanır (FZ.taban).
(function () {
  const { gorev } = FZ;
  const D = o => S => Object.assign(S, o);
  // görev ekle: sahne = FZ.taban(...) ; steps[0] başlangıç adımı; kitap sorularında sahne hesap kartları cevaba kadar gizli
  const ekle = (konu, sahne, yk, no, icon, name, task, steps, tuzak) => { if (!sahne) return;
    steps.forEach(st => { if (st.goster && st.q && !st.q.goster) st.q.goster = st.goster; if (st.q) { st.q.kartGizle = true; if (!st.sub) st.sub = steps[0].sub; } });
    FZ.konuEk('AYT', konu, { gorevler: [gorev(sahne, { yk, no, icon, name, task, steps, tuzak: !!tuzak, data: [] })] }); };
  const BAS = (o, sub) => ({ do: D(o), sub, go: '▶︎ Başla' });
  const TZ = o => ({ do: D(o), sub: 'Dikkat: her sorunun bir tuzağı var.', go: '▶︎ Başla' });
  const T = (s, a) => FZ.taban(s, a);

  // ======================= MANYETİZMA VE İNDÜKLENME (B, L, R, v, x, kos) =======================
  const mi = (o) => Object.assign({ B: 0.5, L: 0.4, R: 4, v: 0, x: 0, kos: 0 }, o), miG = S => { S.x = -2; S.kos = 1; };
  ekle('Manyetizma ve İndüklenme', T('AYT', 'Manyetizma ve İndüklenme'), 'AYT14-k2', 11, '🧲', 'Kitap soruları 2: yüklü parçacık ve indüksiyon', 'Çembersel yörünge, periyot, hız seçici, manyetik akı, ε = −ΔΦ/Δt, dönen çubuk, öz indüksiyon, girdap akımı.', [
    BAS(mi({ v: 5, x: -2 }), 'Manyetik alanda raylar, iletken çubuk ve yüklü parçacıklar.'),
    { do: D(mi({})), q: { t: 'Düzgün manyetik alana dik giren yüklü parçacık çembersel yörünge izliyor. Parçacığın hızı 2 katına çıkarılırsa yörünge yarıçapı ve dolanım periyodu ne olur?', o: ['Yarıçap 2 katı, periyot değişmez', 'İkisi de 2 katı', 'Yarıçap değişmez, periyot yarıya iner', 'Yarıçap yarıya, periyot 2 katı'],
      b: [`Manyetik kuvvet merkezcil kuvveti sağlar: ${FM(`q v B = m ${F('v<sup>2</sup>', 'r')}`)} → ${FM(`r = ${F('m v', 'q B')}`)} · ${FM(`T = ${F('2π m', 'q B')}`)}`], s: ['r ∝ v → <em>2 katı</em>', 'T hıza bağlı değil → <em>değişmez</em> ✓'] } },
    { do: D(mi({})), q: { t: 'Yüklü parçacık düzgün manyetik alanda çembersel yörüngede dönerken kinetik enerjisi nasıl değişir?', o: ['Değişmez', 'Artar', 'Azalır', 'Periyodik artıp azalır'],
      b: ['Manyetik kuvvet (F = q v B) her an hıza diktir.', FM('W = F · x · cos 90° = 0')], s: ['Hıza dik kuvvet iş yapmaz → <em>kinetik enerji değişmez</em> ✓; yalnız hızın yönü değişir.'], n: ['Parçacığın kinetik enerjisini değiştirebilen yalnız ELEKTRİK alandır.'] } },
    { do: D(mi({})), q: { t: 'Birbirine dik E = 2000 V/m elektrik alan ile B = 0,5 T manyetik alanın bulunduğu bölgeye giren (+) yüklü parçacık sapmadan geçiyor. Parçacığın hızı kaç m/s\'dir?', o: ['4000', '1000', '2500', '1500', '8000'],
      b: ['Sapmadan geçme (hız seçici): elektriksel ve manyetik kuvvetler eşit ve zıt.', FM('q E = q v B')], s: [`v = ${F('E', 'B')} = ${F('2000', '0,5')} = <em>4000 m/s</em> ✓`], n: ['Sonuç parçacığın yüküne ve kütlesine bağlı değildir.'] } },
    { do: D(mi({})), q: { t: 'Alanı 0,5 m² olan çerçevenin yüzey normali, 0,4 T\'lık düzgün manyetik alanla 60° açı yapıyor. Çerçeveden geçen manyetik akı kaç Wb\'dir?', o: ['0,1', '0,2', '0,17', '0', '0,05'],
      b: [FM('Φ = B · A · cos θ') + ' (θ: yüzey normali ile B arasındaki açı)', 'cos 60° = ½'], s: ['Φ = 0,4 · 0,5 · ½ = <em>0,1 Wb</em> ✓'], n: ['Alan çizgileri yüzeye paralelse (normal alana dik) akı sıfırdır.'] } },
    { do: D(mi({})), q: { t: 'Bir halkadan geçen manyetik akı 0,1 s içinde 0,3 Wb\'den 0,1 Wb\'ye düzgün olarak azalıyor. Halkada oluşan indüksiyon emk\'sının büyüklüğü kaç V\'tur?', o: ['2', '4', '0,2', '1', '6'],
      b: ['Faraday: ' + FM(`ε = − ${F('ΔΦ', 'Δt')}`)], s: [`|ε| = ${F('0,3 − 0,1', '0,1')} = <em>2 V</em> ✓`], n: ['Lenz: akı azaldığı için indüksiyon akımı, azalan akıyı destekleyecek yönde dolanır.'] } },
    { do: D(mi({})), q: { t: '0,4 m uzunluğundaki iletken çubuk, bir ucu etrafında 0,5 T\'lık alana dik düzlemde 20 rad/s açısal hızla dönüyor. Çubuğun uçları arasındaki emk kaç V\'tur?', o: ['0,8', '1,6', '4', '0,4', '2,4'],
      b: [FM(`ε = ${F('1', '2')} B ω ℓ<sup>2</sup>`) + ' (çubuğun noktaları farklı hızlarla döner; ortalama hız ωℓ/2)'], s: [`ε = ${F('1', '2')} · 0,5 · 20 · 0,16 = <em>0,8 V</em> ✓`] } },
    { do: D(mi({})), q: { t: 'Öz indüksiyon katsayısı 0,2 H olan bobindeki akım 0,1 s içinde 4 A\'den sıfıra iniyor. Bobinde oluşan öz indüksiyon emk\'sı kaç V\'tur?', o: ['8', '0,8', '2', '80', '16'],
      b: [FM(`ε = L ${F('Δi', 'Δt')}`)], s: [`ε = 0,2 · ${F('4', '0,1')} = <em>8 V</em> ✓`], n: ['Öz indüksiyon akımı, azalan akımı sürdürmeye çalışan yöndedir (Lenz).'] } },
    { do: D(mi({})), q: { t: 'Güçlü bir mıknatıs dik duran bakır borunun içinden bırakılıyor. Aynı borudan bırakılan mıknatıs olmayan özdeş metal silindire göre nasıl düşer?', o: ['Daha yavaş düşer', 'Daha hızlı düşer', 'Aynı sürede düşer', 'Boruya yapışıp kalır'],
      b: ['Mıknatıs düşerken borunun duvarlarında akı değişir → girdap (Foucault) akımları oluşur (Lenz).'], s: ['Girdap akımlarının manyetik alanı mıknatısın hareketine karşı koyar → <em>daha yavaş</em> düşer ✓'], n: ['Bakır mıknatısa çekilmez; frenleme yalnız indüksiyondan kaynaklanır. Enerji ısıya dönüşür.'] } },
    { do: D(mi({})), q: { t: 'Aynı yönde akım taşıyan iki paralel düz tel birbirine nasıl kuvvet uygular?', o: ['Çeker', 'İter', 'Kuvvet uygulamaz', 'Yalnız akımı büyük olan çeker'],
      b: ['Her tel, diğerinin manyetik alanı içindedir: F = B · i · ℓ; yön sağ el kuralıyla bulunur.'], s: ['Aynı yönlü akımlar <em>çeker</em>, zıt yönlüler iter ✓; kuvvetler eşit büyüklüktedir (etki–tepki).'] } },
  ]);
  ekle('Manyetizma ve İndüklenme', T('AYT', 'Manyetizma ve İndüklenme'), 'AYT14-t2', 12, '🪤', 'Tuzak sorular 2: manyetizma', 'Kitaptaki çeldiricilerden sık yapılan hatalar.', [
    TZ(mi({})),
    { do: D(mi({})), q: { t: 'Durgun bir elektron düzgün manyetik alana bırakılırsa ne olur?', o: ['Hareketsiz kalır', 'Alan yönünde hızlanır', 'Çembersel yörüngede döner', 'Alana zıt yönde hızlanır'],
      b: [FM('F = q v B sin θ')], s: ['v = 0 → <em>F = 0</em>: elektron hareketsiz kalır ✓'], n: ['TUZAK: manyetik alanın her yüke kuvvet uyguladığını sanmak. Manyetik kuvvet yalnız HAREKETLİ yüke etki eder.'] } },
    { do: D(mi({})), q: { t: 'Düzgün manyetik alanın içinde, alana dik düzlemde duran bir halka alanın içinde sabit hızla kaydırılıyor (alandan çıkmıyor). Halkada indüksiyon akımı oluşur mu?', o: ['Hayır, akı değişmiyor', 'Evet, halka hareket ediyor', 'Evet, hızla orantılı', 'Yalnız halka büyükse oluşur'],
      b: [FM(`ε = − ${F('ΔΦ', 'Δt')}`) + ' · Φ = B · A'], s: ['B ve A değişmiyor → ΔΦ = 0 → <em>akım oluşmaz</em> ✓'], n: ['TUZAK: hareket varsa mutlaka indüksiyon olacağını sanmak. Önemli olan AKI DEĞİŞİMİdir.'] } },
  ], true);

  // ======================= ALTERNATİF AKIM (N1, N2, V1, ac, f) =======================
  const ac = o => Object.assign({ N1: 200, N2: 1000, V1: 220, ac: 1, f: 0.5 }, o);
  ekle('Alternatif Akım ve Transformatörler', T('AYT', 'Alternatif Akım ve Transformatörler'), 'AYT15-k2', 11, '🔌', 'Kitap soruları 2: reaktans, rezonans, transformatör zinciri', 'Kapasitif reaktans, frekansın etkisi, rezonans, DC\'de bobin ve kondansatör, zincir transformatör, enerji iletimi.', [
    BAS(ac({}), 'Alternatif akım devresi ve transformatörler.'),
    { do: D(ac({})), q: { t: 'Sığası 500 μF olan kondansatör açısal frekansı 200 rad/s olan alternatif akım kaynağına bağlanıyor. Kapasitif reaktans kaç Ω\'dur?', o: ['10', '0,1', '100', '1', '20'],
      b: [FM(`X<sub>C</sub> = ${F('1', 'ω C')}`) + ' = ' + FM(`${F('1', '2π f C')}`)], s: [`X<sub>C</sub> = ${F('1', '200 · 5 · 10⁻⁴')} = ${F('1', '0,1')} = <em>10 Ω</em> ✓`] } },
    { do: D(ac({ f: 0.8 })), q: { t: 'Bir lamba bobinle, özdeş başka bir lamba kondansatörle seri bağlanıp aynı AC kaynağa bağlanıyor. Kaynağın frekansı artırılırsa lambaların parlaklığı nasıl değişir?', o: ['Bobinli azalır, kondansatörlü artar', 'Bobinli artar, kondansatörlü azalır', 'İkisi de artar', 'İkisi de değişmez'],
      b: [`${FM('X<sub>L</sub> = 2π f L')} (f ile artar) · ${FM(`X<sub>C</sub> = ${F('1', '2π f C')}`)} (f ile azalır)`], s: ['Bobinin direnci artar → akım azalır → <em>sönükleşir</em>', 'Kondansatörün direnci azalır → <em>parlaklaşır</em> ✓'] } },
    { do: D(ac({})), q: { t: 'Seri RLC devresinde R = 4 Ω, X<sub>L</sub> = 3 Ω, X<sub>C</sub> = 3 Ω; kaynağın etkin gerilimi 20 V. Devreden geçen etkin akım kaç A\'dir?', o: ['5', '2', '4', '20/7'],
      b: ['Empedans: ' + FM('Z = √(R<sup>2</sup> + (X<sub>L</sub> − X<sub>C</sub>)<sup>2</sup>)'), 'X<sub>L</sub> = X<sub>C</sub> ise devre rezonanstadır.'], s: ['X<sub>L</sub> = X<sub>C</sub> → Z = R = 4 Ω', `I = ${F('20', '4')} = <em>5 A</em> ✓ (rezonansta akım en büyük)`] } },
    { do: D(ac({})), q: { t: 'Rezonans frekansında çalışan seri RLC devresinde kaynağın frekansı artırılırsa empedans ve akım nasıl değişir?', o: ['Empedans artar, akım azalır', 'İkisi de artar', 'Empedans azalır, akım artar', 'İkisi de değişmez'],
      b: ['Rezonansta empedans en küçük (Z = R), akım en büyüktür.'], s: ['f artınca X<sub>L</sub> > X<sub>C</sub> olur → Z artar → <em>akım azalır</em> ✓'] } },
    { do: D(ac({ ac: 0 })), q: { t: 'Doğru akım kaynağına seri bağlı lamba ve kondansatörden oluşan devrede, kondansatör dolduktan sonra lamba neden yanmaz?', o: ['Kondansatör doğru akımın geçmesini engeller', 'Kondansatör lambayı kısa devre eder', 'Doğru akımın frekansı çok yüksektir', 'Lamba yalnız AC ile yanar'],
      b: ['Kondansatör levhaları arasında yalıtkan vardır; dolduktan sonra yük akışı durur.', `DC\'de f = 0 → ${FM(`X<sub>C</sub> = ${F('1', '2π f C')} → ∞`)}`], s: ['Dolan kondansatör <em>doğru akımı geçirmez</em> ✓; lambayı yakmak için kondansatör yerine düz tel bağlanabilir ya da AC kaynak kullanılabilir.'] } },
    { do: D(ac({ N1: 10, N2: 40, V1: 12 })), q: { t: 'Art arda bağlı üç ideal transformatörün (primer : sekonder) sarım sayıları sırasıyla 10 : 40, 60 : 30 ve 20 : 100. İlk transformatörün girişine 12 V alternatif gerilim uygulanırsa son çıkış gerilimi kaç V olur?', o: ['120', '48', '60', '240', '360'],
      b: [FM(`${F('V<sub>s</sub>', 'V<sub>p</sub>')} = ${F('N<sub>s</sub>', 'N<sub>p</sub>')}`) + ' · her transformatörün çıkışı, sonrakinin girişidir.'], s: ['12 · 4 = 48 V → 48 · ½ = 24 V → 24 · 5 = <em>120 V</em> ✓'] } },
    { do: D(ac({ N1: 400, N2: 200, V1: 220 })), q: { t: '110 V ile çalışan bir cihaz 220 V\'luk prizde kullanılmak isteniyor. Hangi transformatör kullanılmalıdır?', o: ['Primer sarımı sekonderin 2 katı olan alçaltıcı', 'Sekonder sarımı primerin 2 katı olan yükseltici', 'Sarım sayıları eşit olan', 'Doğru akım transformatörü'],
      b: [FM(`${F('V<sub>s</sub>', 'V<sub>p</sub>')} = ${F('N<sub>s</sub>', 'N<sub>p</sub>')}`)], s: [`${F('110', '220')} = ${F('1', '2')} → N<sub>p</sub> = 2 N<sub>s</sub>: <em>alçaltıcı</em> ✓ (prize primer, cihaza sekonder bağlanır)`] } },
  ]);

  // ======================= DALGA MEKANİĞİ (lam, P) =======================
  const dm = o => Object.assign({ lam: 1, P: 1 }, o);
  ekle('Dalga Mekaniği', T('AYT', 'Dalga Mekaniği'), 'AYT20-k2', 11, '🌊', 'Kitap soruları 2: kırınım, girişim, Young, Doppler, EM dalgalar', 'Kırınım şartı, yol farkı ile çizgi bulma, saçak genişliği, ortam etkisi, tek yarık, Doppler, EM spektrum.', [
    BAS(dm({}), 'Dalga leğeninde kaynaklar; ışık deneyleri için çift yarık.'),
    { do: D(dm({})), q: { t: 'Aralarında w = 4 cm boşluk olan iki engelden geçen doğrusal su dalgalarının dalga boyu 3 cm, 5 cm ya da 6 cm olabilir. Hangilerinde belirgin kırınım gözlenir?', o: ['5 cm ve 6 cm', 'Yalnız 3 cm', 'Yalnız 6 cm', 'Üçünde de'],
      b: ['Kırınım şartı: dalga boyu yarık genişliğine eşit ya da büyük olmalı: ' + FM('λ ≥ w')], s: ['5 ≥ 4 ve 6 ≥ 4 ✓; 3 < 4 → belirgin kırınım yok', '<em>5 cm ve 6 cm</em> ✓'], n: ['Kırınımı artırmak için: yarığı daraltmak ya da dalga boyunu büyütmek (frekansı azaltmak, derinliği artırmak).'] } },
    { do: D(dm({ lam: 1 })), q: { t: 'Aynı fazlı iki noktasal kaynaktan B noktasına uzaklıklar 25 cm ve 20 cm, dalga boyu 2 cm. B noktası hangi girişim çizgisi üzerindedir?', o: ['3. düğüm', '2. katar', '3. katar', '2. düğüm'],
      b: [`Yol farkı Δs: ${FM('Δs = n λ')} → n. katar · ${FM(`Δs = (n − ${F('1', '2')}) λ`)} → n. düğüm`], s: ['Δs = 25 − 20 = 5 cm = 2,5 λ', `2,5 = 3 − ${F('1', '2')} → <em>3. düğüm</em> ✓`] } },
    { do: D(dm({ lam: 1 })), q: { t: 'Young deneyinde λ = 4000 Å. Perdedeki P noktasının yarıklara uzaklıkları farkı 10 000 Å ise P\'de hangi saçak oluşur?', o: ['3. karanlık', '2. aydınlık', '2. karanlık', '3. aydınlık'],
      b: [`Çift yarıkta: ${FM('Δs = n λ')} → n. aydınlık · ${FM(`Δs = (n − ${F('1', '2')}) λ`)} → n. karanlık`], s: [`${F('10 000', '4000')} = 2,5 = 3 − ${F('1', '2')} → <em>3. karanlık</em> ✓`] } },
    { do: D(dm({ lam: 0.7 })), q: { t: 'Kırmızı ışıkla yapılan Young deneyi, başka hiçbir şey değiştirilmeden mavi ışıkla tekrarlanıyor. Ne olur?', o: ['Saçaklar daralır, merkezî aydınlığın yeri değişmez', 'Saçaklar genişler', 'Merkezî aydınlık kayar', 'Saçaklar kaybolur'],
      b: [FM(`Δx = ${F('L λ', 'd')}`) + ' · λ<sub>mavi</sub> < λ<sub>kırmızı</sub>'], s: ['λ küçülür → Δx <em>küçülür</em> (saçaklar sıklaşır)', 'Merkezî aydınlık yine yarıkların tam karşısında ✓'] } },
    { do: D(dm({ lam: 0.75 })), q: { t: 'Young deneyinde fant ile perde arası kırıcılık indisi 4/3 olan suyla dolduruluyor. Saçak genişliği nasıl değişir?', o: ['¾\'üne iner', '4/3 katına çıkar', 'Değişmez', 'Yarıya iner'],
      b: [`Ortamda: ${FM(`Δx = ${F('L λ', 'd · n')}`)}`], s: [`n = ${F('4', '3')} → Δx ${F('3', '4')} katına iner ✓ (suda ışığın dalga boyu kısalır)`] } },
    { do: D(dm({ lam: 1.3 })), q: { t: 'Tek yarıkta kırınım deneyinde merkezî aydınlık saçağın genişliği, yanındaki aydınlık saçakların genişliğine göre nasıldır?', o: ['2 katıdır', 'Eşittir', 'Yarısıdır', '4 katıdır'],
      b: [`Tek yarıkta: ${FM(`Δx = ${F('L λ', 'w')}`)} · merkezî saçak iki birinci karanlık arasında uzanır.`], s: ['Merkezî aydınlık <em>2Δx</em> genişliğindedir ✓; diğer saçaklar Δx'] } },
    { do: D(dm({})), q: { t: 'Sireni çalan ambulans sabit hızla Ali\'ye yaklaşıp Ayşe\'den uzaklaşıyor; Can ambulansın içinde. Siren 1000 Hz ise kim hangi frekansı duyabilir?', o: ['Ali 1080 Hz, Ayşe 930 Hz, Can 1000 Hz', 'Ali 930 Hz, Ayşe 1080 Hz, Can 1000 Hz', 'Üçü de 1000 Hz', 'Ali 1000 Hz, Ayşe 1000 Hz, Can 1080 Hz'],
      b: ['Doppler olayı: kaynak yaklaşırken algılanan frekans artar, uzaklaşırken azalır; kaynağın kendi frekansı değişmez.'], s: ['Yaklaşan (Ali) → 1000\'den <em>büyük</em> · uzaklaşan (Ayşe) → <em>küçük</em> · birlikte hareket eden (Can) → <em>1000 Hz</em> ✓'], n: ['Doppler olayı ses, ışık ve su dalgalarında görülür: radarla hız ölçümü, galaksilerin kırmızıya kayması.'] } },
    { do: D(dm({})), q: { t: 'Radyo dalgaları ile görünür ışık karşılaştırıldığında hangisi doğrudur?', o: ['Boşluktaki hızları eşittir; radyo dalgasının dalga boyu daha büyüktür', 'Radyo dalgaları daha hızlıdır', 'Radyo dalgalarının enerjisi daha büyüktür', 'Radyo dalgaları boyuna dalgadır'],
      b: ['Bütün EM dalgalar boşlukta c ile yayılır; spektrumda radyo → gama yönünde frekans ve enerji artar, dalga boyu azalır.', FM(`E = h f = ${F('h c', 'λ')}`)], s: ['Hızlar eşit (c) ✓; radyo dalgasının λ\'sı büyük, frekansı ve enerjisi küçüktür.'] } },
    { do: D(dm({})), q: { t: 'Aşağıdakilerin hangisinde çevreye elektromanyetik dalga yayılır?', o: ['Elektronun düzgün çembersel hareketinde', 'Nötronun hızlanmasında', 'Durgun yüklü kürede', 'Sabit hızlı protonda'],
      b: ['EM dalga, yüklü taneciklerin İVMELİ hareketiyle oluşur.'], s: ['Çembersel harekette hızın yönü değişir → elektron <em>ivmelidir</em> ve yüklüdür ✓', 'Nötron yüksüz; durgun ya da sabit hızlı yük ivmesiz.'] } },
  ]);
  ekle('Dalga Mekaniği', T('AYT', 'Dalga Mekaniği'), 'AYT20-t2', 12, '🪤', 'Tuzak sorular 2: dalga ve ışık', 'Kitaptaki çeldiricilerden sık yapılan hatalar.', [
    TZ(dm({})),
    { do: D(dm({})), q: { t: 'Boşlukta gama ışınları ile radyo dalgalarından hangisi daha hızlı yayılır?', o: ['Eşit hızla yayılırlar', 'Gama ışınları', 'Radyo dalgaları', 'Kaynağa bağlıdır'],
      b: ['Bütün elektromanyetik dalgalar boşlukta aynı hızla (c ≈ 3 · 10⁸ m/s) yayılır.'], s: ['<em>Eşit</em> ✓'], n: ['TUZAK: enerjisi büyük olanın daha hızlı gideceğini sanmak. Enerji frekansa bağlıdır, hıza değil.'] } },
    { do: D(dm({})), q: { t: 'Doppler olayında kaynak gözlemciye yaklaşırken kaynağın yaydığı sesin frekansı ne olur?', o: ['Değişmez; yalnız algılanan frekans artar', 'Artar', 'Azalır', 'Sıfır olur'],
      b: ['Kaynağın frekansı kaynağın titreşimine bağlıdır.'], s: ['Kaynağın kendi frekansı <em>değişmez</em> ✓; gözlemciye ulaşan dalga tepeleri sıklaştığı için algılanan frekans artar.'], n: ['TUZAK: kaynağın kendi sesinin inceldiğini sanmak.'] } },
  ], true);

  // ======================= ATOM: BOHR MODELİ VE SPEKTRUM (mod: atom, n, hedef) =======================
  const at = (n, hedef) => ({ mod: 'atom', n, hedef: hedef == null ? n : hedef, ae: 0, foton: -1 }), atG = h => S => { S.hedef = h; };
  ekle('Atom Fiziğine Giriş ve Radyoaktivite', T('AYT', 'Atom Fiziğine Giriş ve Radyoaktivite'), 'AYT21-k2', 11, '⚛️', 'Kitap soruları 2: Bohr modeli, uyarılma, spektrum', 'Yörünge yarıçapı ve hızı, açısal momentum, elektronla ve fotonla uyarma, Lyman–Balmer serileri, atom modelleri.', [
    BAS(at(3), 'Bohr modeli: çekirdek ve enerji seviyeleri.'),
    { do: D(at(2)), q: { t: 'Bohr modeline göre hidrojenin n = 2 yörüngesinin yarıçapı r<sub>1</sub>, tek elektronlu helyum iyonunun (Z = 2) n = 1 yörüngesinin yarıçapı r<sub>2</sub>. r<sub>1</sub> / r<sub>2</sub> kaçtır?', o: ['8', '4', '2', '½'],
      b: [FM(`r<sub>n</sub> = a<sub>0</sub> ${F('n<sup>2</sup>', 'Z')}`)], s: [`r<sub>1</sub> = a<sub>0</sub> ${F('4', '1')} = 4a<sub>0</sub> · r<sub>2</sub> = a<sub>0</sub> ${F('1', '2')}`, 'Oran = <em>8</em> ✓'] } },
    { do: D(at(3)), goster: atG(2), q: { t: 'Hidrojende n = 3 yörüngesindeki elektronun hızı v ise n = 2 yörüngesindeki elektronun hızı kaç v\'dir?', o: [`${F('3', '2')}`, `${F('2', '3')}`, `${F('4', '9')}`, `${F('9', '4')}`],
      b: [FM(`v<sub>n</sub> ∝ ${F('Z', 'n')}`)], s: [`${F('v<sub>2</sub>', 'v<sub>3</sub>')} = ${F('3', '2')} → v<sub>2</sub> = <em>${F('3', '2')} v</em> ✓`] } },
    { do: D(at(4)), goster: atG(2), q: { t: 'Hidrojende elektron n = 4\'ten n = 2\'ye inerken açısal momentumu nasıl değişir? (h: Planck sabiti)', o: [`${F('h', 'π')} azalır`, `${F('h', '2π')} azalır`, `${F('h', 'π')} artar`, 'Değişmez'],
      b: [FM(`L = n ${F('h', '2π')}`)], s: [`ΔL = (2 − 4) ${F('h', '2π')} = −${F('h', 'π')} → <em>${F('h', 'π')} azalır</em> ✓`] } },
    { do: D(at(1)), q: { t: 'Cıva atomunun enerji seviyeleri 4,86 eV, 6,67 eV, 8,84 eV ve 10,4 eV (iyonlaşma). Temel hâldeki cıva atomlarına 9 eV kinetik enerjili elektronlar gönderiliyor. Çarpışmadan sonra elektronun kinetik enerjisi aşağıdakilerden hangisi OLAMAZ?', o: ['3,33 eV', '4,14 eV', '2,33 eV', '0,16 eV', '6,66 eV'],
      b: ['Elektronla uyarmada elektron, seviye farkı kadar enerjiyi verir, artanı kendinde kalır (ya da hiç enerji vermez).'], s: ['Kalan olasılıklar: 9; 9 − 4,86 = 4,14; 9 − 6,67 = 2,33; 9 − 8,84 = 0,16', '<em>3,33 eV</em> bunlardan biri değil ✓'], n: ['Fotonla uyarmada ise foton enerjisi seviye farkına TAM eşit olmalıdır (ya da iyonlaştırmalı).'] } },
    { do: D(at(1)), q: { t: 'Temel hâldeki hidrojen atomunu 2. uyarılmış duruma (n = 3) çıkarmak için kaç eV\'luk foton gerekir? (E<sub>n</sub> = −13,6 / n² eV)', o: ['12,09', '10,2', '1,89', '13,6', '24,18'],
      b: [FM(`E<sub>n</sub> = − ${F('13,6', 'n<sup>2</sup>')} eV`), 'Uyarılma seviyesi ≠ yörünge numarası: 1. uyarılma n = 2, 2. uyarılma n = 3.'], s: ['E₃ − E₁ = −1,51 − (−13,6) = <em>12,09 eV</em> ✓'] } },
    { do: D(at(5)), q: { t: 'n = 5 düzeyine uyarılmış hidrojen atomlarının ışımalarında Balmer serisinden en çok kaç farklı çizgi görülebilir?', o: ['3', '4', '10', '2', '6'],
      b: ['Balmer serisi: üst seviyelerden n = 2 seviyesine inişler (görünür bölge). Lyman: n = 1\'e (morötesi), Paschen: n = 3\'e (kızılötesi).'], s: ['n = 2\'ye iniş: 5 → 2, 4 → 2, 3 → 2 → <em>3 çizgi</em> ✓'] } },
    { do: D(at(1)), q: { t: 'Hidrojenin Lyman, Balmer ve Paschen serisi ışımaları hangi bölgelerdedir?', o: ['Morötesi, görünür, kızılötesi', 'Görünür, morötesi, kızılötesi', 'Kızılötesi, görünür, morötesi', 'Hepsi görünür'],
      b: ['Seriye inilen seviye ne kadar düşükse enerji farkları o kadar büyük olur.'], s: ['Lyman (n → 1, en büyük enerji) → <em>morötesi</em> · Balmer (n → 2) → <em>görünür</em> · Paschen (n → 3) → <em>kızılötesi</em> ✓'] } },
    { do: D(at(1)), q: { t: 'Rutherford\'un altın levha deneyinde alfa taneciklerinin çoğunun sapmadan geçmesi neyi gösterir?', o: ['Atomun büyük kısmı boşluktur', 'Elektronlar çekirdektedir', 'Atom içi dolu bir küredir', 'Alfa tanecikleri yüksüzdür'],
      b: ['Thomson: üzümlü kek modeli · Rutherford: küçük, yoğun, (+) yüklü çekirdek ve çevresinde boşluk · Bohr: kararlı enerji seviyeleri.'], s: ['Çoğu sapmadan geçti → <em>atomun büyük kısmı boşluk</em>; az sayıda büyük sapma → küçük, yoğun (+) çekirdek ✓'] } },
  ]);

  // ======================= KUARKLAR, ANTİMADDE, BIG BANG (parçacık ve kozmoloji sahneleri) =======================
  const pf = (had) => ({ mod: had ? 'hadron' : 'tablo', had: had || 'uud' });
  ekle('Atom Fiziğine Giriş ve Radyoaktivite', T('SEC', 'Parçacık Fiziği ve Standart Model'), 'AYT21-pf', 13, '🔬', 'Atom altı parçacıklar ve Big Bang', 'Kuarklar, baryon–mezon–lepton, temel kuvvetler ve taşıyıcıları, Higgs, antimadde, Big Bang kanıtları.', [
    BAS(pf('uud'), 'Standart model: kuarklar ve hadronlar.'),
    { do: D(pf('uud')), q: { t: '⁷₃Li çekirdeğindeki proton ve nötronlarda toplam kaç yukarı (u) ve kaç aşağı (d) kuark vardır?', o: ['10 u, 11 d', '11 u, 10 d', '7 u, 14 d', '9 u, 12 d'],
      b: ['Proton = uud, nötron = udd · ⁷₃Li: 3 proton, 7 − 3 = 4 nötron'], s: ['u: 3 · 2 + 4 · 1 = <em>10</em>', 'd: 3 · 1 + 4 · 2 = <em>11</em> ✓'] } },
    { do: D(pf('udd')), q: { t: 'Proton, nötron ve elektrondan hangilerinin yapısında kuark bulunur?', o: ['Proton ve nötron', 'Yalnız proton', 'Üçünde de', 'Yalnız elektron'],
      b: ['Hadronlar kuarklardan oluşur; leptonların (elektron, müon, nötrino) iç yapısı yoktur, temel parçacıktır.'], s: ['Proton (uud) ve nötron (udd) baryondur ✓; elektron <em>lepton</em>dur, kuark içermez.'] } },
    { do: D(pf('uud')), q: { t: 'Kuark ve karşıt kuarktan oluşan, kütlesi baryonlardan küçük ve kararsız parçacıklara ne ad verilir?', o: ['Mezon', 'Baryon', 'Lepton', 'Bozon'],
      b: ['Hadronlar ikiye ayrılır: baryon (3 kuark) ve mezon (kuark + karşıt kuark).'], s: ['<em>Mezon</em> ✓ (ör. pion, kaon)'] } },
    { do: D(pf()), q: { t: 'Temel kuvvetlerden hangisinin taşıyıcı parçacığı yanlış eşleştirilmiştir?', o: ['Güçlü çekirdek kuvveti – foton', 'Elektromanyetik – foton', 'Zayıf çekirdek – W ve Z bozonları', 'Kütle çekim – graviton (öngörülen)'],
      b: ['Güçlü: gluon · elektromanyetik: foton · zayıf: W, Z · kütle çekim: graviton (henüz gözlenmedi)'], s: ['Güçlü çekirdek kuvvetinin taşıyıcısı <em>gluon</em>dur ✓'] } },
    { do: D(pf()), q: { t: 'Higgs alanıyla etkileşmediği için kütlesi olmayan parçacık hangisidir?', o: ['Foton', 'Elektron', 'Yukarı kuark', 'W bozonu'],
      b: ['Higgs alanıyla etkileşen parçacıklar kütle kazanır (Higgs bozonu 2012\'de CERN\'de bulundu).'], s: ['<em>Foton</em> (ve gluon) kütlesizdir ✓'] } },
    { do: D(pf()), q: { t: 'Bir elektron ile pozitron karşılaştığında ne olur?', o: ['Birbirlerini yok ederek gama fotonlarına dönüşürler', 'Birleşip nötron oluştururlar', 'Birbirlerini iterler', 'Hidrojen atomu oluştururlar'],
      b: ['Her parçacığın kütlesi eşit, yükü zıt bir karşıt parçacığı vardır (elektron ↔ pozitron).', FM('E = m c<sup>2</sup>')], s: ['<em>Çift yok olma</em>: kütle enerjiye (gama ışınlarına) dönüşür ✓', 'Tersi (enerjiden parçacık–karşıt parçacık) çift oluşumudur.'], n: ['PET görüntüleme bu olayla çalışır.'] } },
    { do: D(pf()), q: { t: 'Aşağıdakilerden hangisi Big Bang teorisini destekleyen bir kanıt DEĞİLDİR?', o: ['Yıldızların gece parlak görünmesi', 'Evrenin genişlediğinin keşfi', 'Kozmik mikrodalga fon ışımasının keşfi', 'Galaksilerden gelen ışığın kırmızıya kayması'],
      b: ['Big Bang: evren yaklaşık 13,8 milyar yıl önce sıcak ve yoğun bir hâlden genişleyerek ve soğuyarak oluştu.'], s: ['Genişleme (Hubble), kırmızıya kayma ve kozmik fon ışıması (Penzias–Wilson 1965) kanıttır', 'Yıldızların parlaması <em>kanıt değildir</em> ✓'] } },
  ]);

  // ======================= RADYOAKTİVİTE (mod: cekirdek) =======================
  const ck = { mod: 'cekirdek', tt: 0, kos: 0 }, ckG = S => { S.tt = 0; S.kos = 1; };
  ekle('Atom Fiziğine Giriş ve Radyoaktivite', T('AYT', 'Atom Fiziğine Giriş ve Radyoaktivite'), 'AYT21-rd', 14, '☢️', 'Radyoaktivite soruları', 'α, β⁻, β⁺, γ bozunmaları, n/p oranı, bozunma zinciri, fisyon–füzyon.', [
    BAS(ck, 'Radyoaktif çekirdekler bozunuyor.'),
    { do: D(ck), goster: ckG, q: { t: '²³⁸₉₂U çekirdeği art arda 2 alfa ve 2 β⁻ bozunması yapıyor. Oluşan çekirdeğin kütle ve atom numarası nedir?', o: ['230 ve 90', '230 ve 88', '234 ve 90', '238 ve 92'],
      b: ['α: A − 4, Z − 2 · β⁻: A değişmez, Z + 1 · γ: A ve Z değişmez'], s: ['A: 238 − 2 · 4 = <em>230</em>', 'Z: 92 − 2 · 2 + 2 · 1 = <em>90</em> ✓'] } },
    { do: D(ck), q: { t: 'Nötron sayısının proton sayısına oranı 1\'den küçük olan (n/p < 1) kararsız bir çekirdek kararlı hâle geçmek için hangi bozunmayı yapar?', o: ['β⁺', 'β⁻', 'γ', 'Hiç bozunmaz'],
      b: ['β⁻: nötron → proton + elektron + karşıt nötrino (n/p > 1 olanlarda) · β⁺: proton → nötron + pozitron + nötrino (n/p < 1 olanlarda)'], s: ['Proton fazla → protonu nötrona çevirmeli → <em>β⁺</em> ✓'] } },
    { do: D(ck), q: { t: 'Kararsız ²¹⁴₈₃Bi çekirdeği önce ²¹⁴₈₄Po\'ya, sonra ²¹⁰₈₂Pb\'ye dönüşüyor. Bu iki bozunma sırasıyla hangileridir?', o: ['β⁻, α', 'α, β⁻', 'β⁺, α', 'γ, α'],
      b: ['α: A − 4, Z − 2 · β⁻: Z + 1 · β⁺: Z − 1'], s: ['214 → 214, Z 83 → 84: <em>β⁻</em>', '214 → 210, Z 84 → 82: <em>α</em> ✓'] } },
    { do: D({ mod: 'cekirdek', tt: 0, kos: 0 }), q: { t: 'Güneş\'te enerji hangi çekirdek tepkimesiyle üretilir?', o: ['Füzyon (hafif çekirdeklerin birleşmesi)', 'Fisyon (ağır çekirdeğin bölünmesi)', 'Alfa bozunması', 'Gama ışıması'],
      b: ['Fisyon: ağır çekirdek nötronla bölünür (nükleer santraller) · Füzyon: çok yüksek sıcaklıkta hafif çekirdekler birleşir.'], s: ['Hidrojen çekirdekleri birleşip helyum oluşturur → <em>füzyon</em> ✓'] } },
    { do: D(ck), q: { t: 'Bir atom çekirdeğindeki nötronlardan biri kendiliğinden protona dönüşürse kütle numarası, atom numarası ve toplam enerji için ne söylenir?', o: ['A değişmez, Z artar, enerji azalır', 'A artar, Z artar', 'A ve Z değişmez', 'A azalır, Z değişmez'],
      b: ['β⁻ bozunması: n → p + e⁻ + karşıt nötrino'], s: ['Nükleon sayısı aynı → <em>A değişmez</em>', 'Proton sayısı 1 artar → <em>Z artar</em>; kararlı hâle geçerken enerji yayılır ✓'] } },
  ]);

  // ======================= MODERN FİZİK: ÖZEL GÖRELİLİK (b = v/c) =======================
  ekle('Modern Fizik', T('UNI', 'Özel Görelilik'), 'AYT22-og', 11, '🚀', 'Özel görelilik soruları', 'Michelson–Morley, postulatlar, uzunluk büzülmesi, zaman genişlemesi, ikizler paradoksu.', [
    { do: D({ b: 0.6, kos: 0, tt: 0, x: -6 }), sub: 'Işık hızına yakın hızla giden tren ve perondaki gözlemci.', go: '▶︎ Başla' },
    { do: D({ b: 0.6, kos: 0, tt: 0, x: -6 }), goster: D({ kos: 1 }), q: { t: 'Durgun hâldeyken yatay boyu L<sub>0</sub>, düşey boyu h<sub>0</sub> olan uzay gemisi, yatay doğrultuda ışık hızına yakın bir hızla gidiyor. Yerdeki gözlemcinin ölçtüğü boyutlar için hangisi doğrudur?', o: ['Yatay boy L<sub>0</sub>\'dan kısa, düşey boy h<sub>0</sub>\'a eşit', 'Yatay boy L<sub>0</sub>\'a eşit, düşey boy h<sub>0</sub>\'dan kısa', 'İki boy da kısa', 'Yatay boy L<sub>0</sub>\'dan uzun, düşey boy h<sub>0</sub>\'a eşit', 'İki boy da değişmez'],
      b: ['Uzunluk büzülmesi: hareketli cismin boyu, hareket doğrultusunda durgun hâldeki boyundan (özuzunluk) kısa ölçülür.', '(MEB: özel görelilikte matematiksel hesaplamalara girilmez.)'], s: ['Büzülme yalnız <em>hareket doğrultusunda</em> olur → yatay boy kısa ölçülür', 'Düşey boy harekete dik → <em>değişmez</em> ✓'] } },
    { do: D({ b: 0.8, kos: 0, tt: 0, x: -6 }), goster: D({ kos: 1 }), q: { t: 'Işık hızına yakın hızla giden trendeki saatle Δt<sub>0</sub> süren bir olayın süresi perondaki gözlemciye göre Δt olarak ölçülüyor. Buna göre Δt ile Δt<sub>0</sub> arasındaki ilişki nedir?', o: ['Δt > Δt<sub>0</sub>', 'Δt < Δt<sub>0</sub>', 'Δt = Δt<sub>0</sub>', 'Δt = 0', 'Trenin yönüne göre Δt > Δt<sub>0</sub> ya da Δt < Δt<sub>0</sub> olur'],
      b: ['Özzaman (Δt<sub>0</sub>): olayla aynı yerde duran saatin ölçtüğü süre.', 'Zaman genişlemesi: hareketli saatler, onlara göre hareket eden gözlemciye göre yavaş işler. (MEB: matematiksel hesaplamalara girilmez.)'], s: ['Perondaki gözlemciye göre trendeki saat <em>yavaş</em> işler', 'Olay perondan daha uzun sürmüş ölçülür: <em>Δt > Δt<sub>0</sub></em> ✓ (yönden bağımsız)'], n: ['Hareketli saatler yavaş işler (zaman genişlemesi).'] } },
    { do: D({ b: 0.6, kos: 0, tt: 0, x: -6 }), q: { t: 'Michelson–Morley deneyinin sonucu nedir?', o: ['Ether (esir) yoktur; ışık hızı her yönde aynıdır', 'Işık hızı Dünya\'nın hareketine göre değişir', 'Işık mekanik bir dalgadır', 'Ether rüzgârı ölçülmüştür'],
      b: ['Deney, ışığın ether denen bir ortamda yayıldığını ispat etmek için yapıldı; girişim saçakları hiçbir zaman kaymadı.'], s: ['<em>Ether yok</em>; ışık hızı yönden bağımsız ✓ → Einstein\'ın postulatlarına zemin hazırladı.'] } },
    { do: D({ b: 0.6, kos: 0, tt: 0, x: -6 }), q: { t: 'Boş uzayda 0,8c hızla giden gemiye doğru Dünya\'dan lazer gönderiliyor. Gemideki gözlemci lazer ışığının hızını kaç ölçer?', o: ['c', '1,8c', '0,2c', '0,8c', '2c'],
      b: ['Einstein\'ın 2. postulatı: ışığın boşluktaki hızı gözlemcinin ve kaynağın hareketinden bağımsızdır.'], s: ['<em>c</em> ✓ — hızlar klasik mekanikteki gibi toplanmaz.'] } },
    { do: D({ b: 0.9, kos: 0, tt: 0, x: -6 }), q: { t: 'Yer atmosferinin üst katmanlarında oluşan ve çok kısa ömürlü olan müonların yeryüzüne ulaşabilmesi hangi görelilik sonucuyla açıklanır?', o: ['Zaman genişlemesi', 'Kütle–enerji eşdeğerliği', 'Işığın kırılması', 'Kütle çekim'],
      b: ['Işık hızına yakın hareket eden parçacığın ömrü yerdeki gözlemciye göre uzar.'], s: ['Müonların ömrü yere göre uzar → yeryüzüne ulaşırlar: <em>zaman genişlemesi</em> ✓'] } },
  ]);

  // ======================= MODERN FİZİK: COMPTON (th, kos) =======================
  ekle('Modern Fizik', T('UNI', 'Dalga–Parçacık İkiliği'), 'AYT22-cp', 12, '🎱', 'Compton saçılması ve de Broglie', 'Compton\'da enerji ve momentum korunumu, saçılan fotonun dalga boyu, ışığın ikili doğası, madde dalgası.', [
    { do: D({ th: 90, kos: 0, faz: 0 }), sub: 'X ışını fotonu durgun elektrona çarpıyor.', go: '▶︎ Başla' },
    { do: D({ th: 90, kos: 0, faz: 0 }), goster: D({ kos: 1 }), q: { t: 'Compton saçılmasında saçılan fotonun hızı, enerjisi ve dalga boyu gelen fotona göre nasıldır?', o: ['Hızı aynı, enerjisi küçük, dalga boyu büyük', 'Hızı küçük, enerjisi küçük', 'Hepsi aynı', 'Enerjisi büyük, dalga boyu küçük'],
      b: ['Esnek çarpışma: enerji ve momentum korunur; foton enerjisinin bir kısmını elektrona verir.', FM(`E = ${F('h c', 'λ')}`)], s: ['Foton her zaman c ile gider → <em>hız aynı</em>', 'Enerji azalır → <em>λ büyür</em> ✓'] } },
    { do: D({ th: 90, kos: 0, faz: 0 }), goster: D({ kos: 1 }), q: { t: 'λ dalga boylu X ışını fotonu durgun elektrona çarpıyor; elektrona aktarılan kinetik enerji, gelen fotonun enerjisinin ¼\'ü kadar. Saçılan fotonun dalga boyu kaç λ olur?', o: [`${F('4', '3')}`, `${F('3', '4')}`, '4', `${F('1', '4')}`],
      b: [FM('E<sub>gelen</sub> = E<sub>saçılan</sub> + E<sub>k</sub>') + ' · ' + FM(`E = ${F('h c', 'λ')}`)], s: [`E<sub>saçılan</sub> = ${F('3', '4')} E`, `λ' = ${F('4', '3')} λ ✓ (enerji ile dalga boyu ters orantılı)`] } },
    { do: D({ th: 90, kos: 0, faz: 0 }), q: { t: 'Aşağıdaki olaylardan hangisi yalnızca ışığın TANECİK modeliyle açıklanabilir?', o: ['Fotoelektrik olay', 'Girişim', 'Kırınım', 'Kutuplanma (polarizasyon)'],
      b: ['Tanecik modeli: fotoelektrik, Compton, ışık basıncı · Dalga modeli: girişim, kırınım, polarizasyon, renk ayrışması · İkisi: yansıma, kırılma, gölge'], s: ['<em>Fotoelektrik olay</em> ✓ (foton enerjisi tek elektrona aktarılır)'] } },
    { do: D({ th: 90, kos: 0, faz: 0 }), q: { t: 'Kütleleri 4m ve m olan X ve Y parçacıklarının de Broglie dalga boyları eşit. Hangisi doğrudur?', o: ['Momentumları eşit; Y\'nin kinetik enerjisi X\'inkinin 4 katı', 'X daha hızlıdır', 'Kinetik enerjileri eşittir', 'Y\'nin momentumu 4 katıdır'],
      b: [FM(`λ = ${F('h', 'p')} = ${F('h', 'm v')}`) + ' · ' + FM(`E<sub>k</sub> = ${F('p<sup>2</sup>', '2m')}`)], s: ['λ eşit → <em>p eşit</em>; v<sub>Y</sub> = 4 v<sub>X</sub>', 'E<sub>k</sub> ∝ 1/m → <em>Y\'ninki 4 katı</em> ✓'] } },
  ]);

  // ======================= MODERN FİZİK: FOTOELEKTRİK, FOTOSEL, SİYAH CİSİM (Ef, siddet, ac) =======================
  const mf = o => Object.assign({ Ef: 3.1, siddet: 1, ac: 1 }, o);
  ekle('Modern Fizik', T('AYT', 'Modern Fizik'), 'AYT22-k2', 13, '💡', 'Kitap soruları 2: fotosel, kesme gerilimi, siyah cisim', 'Eşik enerjisi bulma, kesme gerilimi, ileri gerilim, akım–gerilim grafiği, E_k–f grafiği, Wien yasası, foton momentumu.', [
    BAS(mf({}), 'Fotosel: katot, anot ve üreteç.'),
    { do: D(mf({ Ef: 4 })), q: { t: 'Eşik enerjisi 2,5 eV olan katoda 4 eV\'luk fotonlar düşürülüyor. Fotoelektrik akımı durdurmak için uygulanması gereken en küçük ters gerilim (kesme gerilimi) kaç V\'tur?', o: ['1,5', '4', '2,5', '6,5', '3'],
      b: [FM('E = E<sub>0</sub> + E<sub>k</sub>') + ' · kesme geriliminde: ' + FM('e V<sub>k</sub> = E<sub>k,max</sub>')], s: ['E<sub>k</sub> = 4 − 2,5 = 1,5 eV → <em>V<sub>k</sub> = 1,5 V</em> ✓'] } },
    { do: D(mf({ Ef: 5 })), q: { t: 'Bir metale E enerjili fotonlar düşürülünce sökülen elektronların en büyük kinetik enerjisi 1 eV, 2E enerjili fotonlarla 6 eV oluyor. Metalin eşik enerjisi kaç eV\'tur?', o: ['4', '5', '3', '2', '8'],
      b: [FM('E<sub>k</sub> = E − E<sub>0</sub>')], s: ['E − E<sub>0</sub> = 1 ve 2E − E<sub>0</sub> = 6 → E = 5 eV', '<em>E<sub>0</sub> = 4 eV</em> ✓'] } },
    { do: D(mf({ Ef: 5 })), q: { t: 'Eşik enerjisi 3 eV olan katoda 2480 Å dalga boylu ışık düşüyor; anot (+), katot (−) olacak biçimde 2 V\'luk üreteç bağlı. Anoda ulaşan elektronların en büyük kinetik enerjisi kaç eV\'tur? (hc = 12 400 eV·Å)', o: ['4', '2', '5', '0', '8'],
      b: [FM(`E = ${F('h c', 'λ')}`) + ' · ileri gerilimde: ' + FM('E + e V = E<sub>0</sub> + E<sub>k,anot</sub>')], s: [`E = ${F('12 400', '2480')} = 5 eV → katottan çıkışta E<sub>k</sub> = 2 eV`, 'Üreteç hızlandırır: 2 + 2 = <em>4 eV</em> ✓'] } },
    { do: D(mf({ Ef: 3.1, siddet: 2.5 })), q: { t: 'Fotosele düşen ışığın frekansı aynı kalıp şiddeti artırılırsa akım–gerilim grafiğinde ne değişir?', o: ['Doyma akımı artar, kesme gerilimi değişmez', 'Kesme gerilimi artar', 'İkisi de artar', 'Hiçbiri değişmez'],
      b: ['Işık şiddeti → birim zamandaki foton SAYISI → sökülen elektron sayısı (akım) · frekans → foton ENERJİSİ → E<sub>k,max</sub> → kesme gerilimi'], s: ['Daha çok elektron → <em>doyma akımı artar</em>; E<sub>k,max</sub> aynı → <em>kesme gerilimi değişmez</em> ✓'] } },
    { do: D(mf({})), q: { t: 'Farklı metallerin fotoelektrik olayında sökülen elektronların en büyük kinetik enerjisi–gelen ışığın frekansı grafikleri çiziliyor. Bu grafiklerin ortak özelliği nedir?', o: ['Eğimleri eşittir (Planck sabiti)', 'Hepsi orijinden geçer', 'Eşik frekansları eşittir', 'Eğimleri metalin eşik enerjisine eşittir'],
      b: [FM('E<sub>k</sub> = h f − h f<sub>0</sub>')], s: ['Doğrunun eğimi <em>h</em>: her metal için aynı ✓', 'Frekans eksenini kestiği yer eşik frekansı f<sub>0</sub>; metale göre değişir.'] } },
    { do: D(mf({})), q: { t: 'Wien yasasına göre bir yıldızın yüzey sıcaklığı 2 katına çıkarsa en şiddetli ışıma yaptığı dalga boyu ne olur?', o: ['Yarıya iner', '2 katına çıkar', 'Değişmez', '4\'te birine iner', '4 katına çıkar'],
      b: ['Wien yer değiştirme yasası: ' + FM('λ<sub>max</sub> · T = sabit') + ' (2,89 · 10⁻³ m·K)'], s: ['λ<sub>max</sub> ∝ 1/T → <em>yarıya iner</em> ✓ (daha sıcak yıldız daha mavi görünür)'] } },
    { do: D(mf({})), q: { t: 'Dalga boyu λ olan fotonun momentumu p ise, dalga boyu 2λ olan fotonun momentumu kaç p\'dir?', o: [`${F('1', '2')}`, '2', '1', '4'],
      b: [FM(`p = ${F('h', 'λ')} = ${F('E', 'c')}`)], s: [`p ∝ ${F('1', 'λ')} → <em>${F('p', '2')}</em> ✓`], n: ['Fotonun kütlesi yoktur ama momentumu vardır (ışık basıncı).'] } },
  ]);
  ekle('Modern Fizik', T('AYT', 'Modern Fizik'), 'AYT22-t2', 14, '🪤', 'Tuzak sorular 2: modern fizik', 'Kitaptaki çeldiricilerden sık yapılan hatalar.', [
    TZ(mf({})),
    { do: D(mf({})), q: { t: 'Compton saçılmasında foton enerjisinin bir kısmını elektrona verdiğine göre saçılan fotonun hızı nasıl değişir?', o: ['Değişmez, yine c\'dir', 'Azalır', 'Artar', 'Sıfır olur'],
      b: ['Fotonun boşluktaki hızı her zaman c\'dir.'], s: ['Enerji azalınca <em>frekans azalır, λ artar</em>; hız c kalır ✓'], n: ['TUZAK: enerji kaybedenin yavaşlayacağını sanmak (kütleli cisimlerdeki gibi).'] } },
    { do: D(mf({})), q: { t: 'Hareketli gözlemciye göre durgun bir cismin boyu kısalıyorsa, cismin kendi referans sistemindeki (durgun gözlemcinin ölçtüğü) boyu ne olur?', o: ['Değişmez; L<sub>0</sub> olarak kalır', 'O da kısalır', 'Uzar', 'Sıfır olur'],
      b: ['Uzunluk büzülmesi, ölçümün yapıldığı referans sistemine bağlıdır; cisim gerçekten sıkışmaz.'], s: ['Cisimle birlikte duran gözlemci her zaman özuzunluğu <em>L<sub>0</sub></em> ölçer ✓'], n: ['TUZAK: hızlı giden cismin "gerçekten küçüldüğünü" sanmak.'] } },
  ], true);

  // ======================= MODERN FİZİĞİN UYGULAMALARI (mod: led/lazer, Eg) =======================
  const up = (mod, Eg) => ({ mod, Eg: Eg || 2 });
  ekle('Modern Fiziğin Uygulamaları', T('AYT', 'Modern Fiziğin Uygulamaları'), 'AYT23-k2', 11, '🔬', 'Kitap soruları 2: yarı iletkenler, lazer, görüntüleme', 'N–P tipi yarı iletken, diyot, transistör, LED, güneş pili, lazer, MR–PET–BT–ultrason–radar–sonar–termal kamera, LCD–plazma.', [
    BAS(up('led', 2), 'Yarı iletken LED ve lazer düzeneği.'),
    { do: D(up('led', 2)), q: { t: 'Silisyuma fosfor gibi 5 değerlik elektronlu atomlar katılırsa nasıl bir yarı iletken elde edilir ve yük taşıyıcıları nedir?', o: ['N tipi; serbest elektronlar', 'P tipi; boşluklar', 'N tipi; boşluklar', 'Yalıtkan olur'],
      b: ['Silisyumun son yörüngesinde 4 elektron vardır. 5 değerlikli katkı → 1 elektron fazla · 3 değerlikli katkı (alüminyum) → 1 elektron eksik (boşluk).'], s: ['Fazla elektron → <em>N (negatif) tipi</em>, taşıyıcı <em>serbest elektron</em> ✓'] } },
    { do: D(up('led', 2)), q: { t: 'Alternatif akım kaynağına bir direnç ve bir devre elemanı seri bağlanınca dirençten yalnız tek yönde akım geçtiği (yarım dalgalar) gözleniyor. Bu eleman nedir?', o: ['Diyot', 'Kondansatör', 'Bobin', 'Transistör'],
      b: ['Diyot (P–N eklemi) akımı yalnız bir yönde geçirir; ters yönde engeller.'], s: ['AC\'nin bir yarısı geçer, diğer yarısı engellenir → <em>diyot</em> ✓ (doğrultma)'] } },
    { do: D(up('led', 1.1)), q: { t: 'Güneş pili için hangisi doğrudur?', o: ['P–N ekleminde ışık enerjisini doğrudan elektrik enerjisine çevirir', 'Elektrik enerjisini ışığa çevirir', 'Isıyla çalışır, ışığa ihtiyaç duymaz', 'Yalnız alternatif akım üretir'],
      b: ['Yasak enerji aralığından büyük enerjili fotonlar yarı iletkende elektron–boşluk çifti oluşturur.'], s: ['Fotonlar eklemde yük ayırır → <em>ışık → elektrik</em> ✓ (doğru akım). LED tersini yapar: elektrik → ışık.'] } },
    { do: D(up('lazer')), q: { t: 'Lazer ışığının elde edilmesinde aşağıdakilerden hangisi GERÇEKLEŞMEZ?', o: ['Füzyon', 'Atomların uyarılması', 'Uyarılmış emisyon', 'Tersine birikim (üst seviyede çok atom)'],
      b: ['LASER: uyarılmış ışıma ile ışığın güçlendirilmesi (Maiman, 1960).'], s: ['Uyarma → tersine birikim → uyarılmış emisyon ile aynı fazlı, tek renkli fotonlar', 'Çekirdek tepkimesi (<em>füzyon</em>) yoktur ✓'] } },
    { do: D(up('lazer')), q: { t: 'Hastaya verilen pozitronların vücuttaki elektronlarla yok olması sonucu oluşan gama ışınlarını algılayarak görüntü oluşturan teknoloji hangisidir?', o: ['PET', 'MR', 'BT', 'Ultrason'],
      b: ['MR: manyetik alan + radyo dalgası · BT: kesitsel X ışını · Ultrason: yüksek frekanslı ses · PET: pozitron emisyon tomografisi'], s: ['Pozitron–elektron çift yok olması → gama → <em>PET</em> ✓'] } },
    { do: D(up('lazer')), q: { t: 'Görüntüleme cihazlarından hangilerinde ses dalgalarından yararlanılır? I. Sonar  II. Termal kamera  III. Ultrason', o: ['I ve III', 'Yalnız II', 'I ve II', 'Hepsi'],
      b: ['Sonar ve ultrason ses yankısıyla (eko) çalışır; termal kamera kızılötesi ışımayı algılar; radar mikrodalga yankısıyla çalışır.'], s: ['Sonar ve ultrason → <em>ses</em> ✓; termal kamera → kızılötesi (EM).'] } },
    { do: D(up('lazer')), q: { t: 'Lotus çiçeği yaprağının nano boyuttaki yapısı sayesinde su tutmaması hangi ürünün geliştirilmesine ilham vermiştir?', o: ['Su ve kir tutmayan kumaşlar', 'Süper iletken kablolar', 'Lazer yazıcılar', 'Güneş pilleri'],
      b: ['Nanoteknoloji: maddenin nano boyutta (10⁻⁹ m) farklılaşan özelliklerinden yararlanır.'], s: ['Kendini temizleyen yüzeyler → <em>su ve kir tutmayan kumaş</em>, cam, boya ✓'] } },
  ]);
  ekle('Modern Fiziğin Uygulamaları', T('SEC', 'Süperiletkenlik'), 'AYT23-su', 12, '🧊', 'Süper iletkenlik soruları', 'Kritik sıcaklık, sıfır direnç, Meissner etkisi, kullanım alanları.', [
    { do: D({ T: 300, hedef: 300 }), sub: 'Süper iletken disk ve mıknatıs soğutuluyor.', go: '▶︎ Başla' },
    { do: D({ T: 300, hedef: 300 }), goster: D({ hedef: 70 }), q: { t: 'Süper iletken bir madde kritik sıcaklığının altına soğutulunca hangi iki temel özellik ortaya çıkar?', o: ['Direnci sıfır olur ve manyetik alanı içinden dışlar', 'Direnci artar ve mıknatıslanır', 'Yalıtkan olur', 'Işık yaymaya başlar'],
      b: ['Onnes (1911): cıvanın direnci 4,2 K\'de sıfırlandı · Meissner etkisi: süper iletken manyetik alanı dışarı iter.'], s: ['<em>Sıfır direnç</em> ve <em>Meissner etkisi</em> ✓ (mıknatıs süper iletkenin üstünde havada durur)'] } },
    { do: D({ T: 300, hedef: 300 }), q: { t: 'Aşağıdakilerden hangisi süper iletkenlerin kullanım alanlarından biri DEĞİLDİR?', o: ['El feneri ampulü', 'MR cihazı mıknatısları', 'Manyetik kaldırmalı (maglev) trenler', 'Parçacık hızlandırıcıları'],
      b: ['Süper iletkenler çok güçlü elektromıknatıs yapmakta ve kayıpsız akım taşımakta kullanılır; sıvı helyum/azotla soğutma gerekir.'], s: ['MR, maglev ve hızlandırıcılarda kullanılır; sıradan <em>el feneri ampulü</em> değil ✓'] } },
    { do: D({ T: 300, hedef: 300 }), q: { t: 'Oda sıcaklığında çok iyi iletken olan bakır için hangisi doğrudur?', o: ['Normal koşullarda süper iletken özelliği göstermez', 'En iyi süper iletkendir', 'Her sıcaklıkta direnci sıfırdır', 'Manyetik alanı dışlar'],
      b: ['İyi iletken olmak süper iletken olmak demek değildir; bilinen süper iletkenlerin çoğu alaşım ve seramiktir.'], s: ['Bakır, demir gibi iyi iletkenler <em>süper iletken değildir</em> ✓'] } },
  ]);
})();
