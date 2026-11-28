// TYT 8 · Basınç ve Kaldırma Kuvveti — TYT 9 · Dalgalar — TYT 10 · Optik
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, levha, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');

  // =====================================================================
  // TYT 8 · BASINÇ VE KALDIRMA KUVVETİ — dinamometreye asılı blok suya iner
  // =====================================================================
  const s8 = sahne({ icon: '🌊', cam: [[2.5, 4.2, 10], [0.4, 2.2, 0]], plate: [12, 7, 0, 0],
    data: [['Suyun özkütlesi', '1000 kg/m³'], ['g', '10 m/s²']],
    S0: () => ({ bat: 0, hedef: 0, G: 15, V: 500, dSiv: 1000 }),
    kur(g) {
      silindir(g, 1.8, 1.8, 3, 0xbfdbfe, 0, 1.5, 0, { op: 0.25, edge: false });
      const su = silindir(g, 1.75, 1.75, 2.4, 0x38bdf8, 0, 1.2, 0, { op: 0.55, edge: false });
      kutu(g, 0.12, 6, 0.12, 0x64748b, -2.4, 3, 0); kutu(g, 2.6, 0.12, 0.12, 0x64748b, -1.15, 6, 0);
      const din = silindir(g, 0.18, 0.18, 0.9, 0xf8fafc, 0, 5.4, 0); const ip = silindir(g, 0.02, 0.02, 1, 0x111827, 0, 4, 0, { edge: false });
      const blok = kutu(g, 0.8, 0.8, 0.8, 0xf59e0b, 0, 3.6, 0);
      for (let i = 0; i <= 4; i++) { kutu(g, 0.3, 0.02, 0.02, 0xffffff, 1.9, 2.4 - i * 0.5, 0, { edge: false }); }
      kart('e8d', '', '#F5C400'); etiket('e8G', 'G', '#dc2626'); etiket('e8k', 'F<sub>k</sub>', '#0891b2'); etiket('e8T', 'T', '#7c3aed');
      return { su, blok, ip, oG: ok(0xef4444, 'e8G'), oK: ok(0x06b6d4, 'e8k'), oT: ok(0x8b5cf6, 'e8T') };
    },
    tick(S, dt, o) {
      if (Math.abs(S.bat - S.hedef) > 0.001) S.bat += Math.sign(S.hedef - S.bat) * Math.min(Math.abs(S.hedef - S.bat), dt * 0.35);
      const yuz = 2.4, yAlt = 3.0 - 2.5 * S.bat, yb = yAlt + 0.4;               // bat: 0 → suyun üstünde, 0,4 → yarısı batık, ≥0,56 tamamen batık
      o.blok.position.y = yb; o.ip.scale.y = 4.95 - (yb + 0.4); o.ip.position.y = (4.95 + yb + 0.4) / 2;
      const batik = Math.max(0, Math.min(0.8, yuz - yAlt)) / 0.8, Fk = S.V * 1e-6 * S.dSiv * 10 * batik, T = S.G - Fk;
      const b = o.blok.position.clone().add(V3(0, 0, 0.6));
      FZ.setArrow(o.oG, b.clone().add(V3(0.15, 0, 0)), V3(0, -1, 0), S.G / 10); FZ.show('e8G', b.clone().add(V3(0.15, -S.G / 10 - 0.3, 0)), 1, 30, 0);
      if (Fk > 0.05) { FZ.setArrow(o.oK, b.clone().add(V3(-0.2, 0, 0)), V3(0, 1, 0), Fk / 10); FZ.show('e8k', b.clone().add(V3(-0.2, Fk / 10 + 0.3, 0)), 1, -30, 0); }
      FZ.setArrow(o.oT, b.clone().add(V3(0.45, 0.4, 0)), V3(0, 1, 0), T / 10); FZ.show('e8T', b.clone().add(V3(0.45, 0.4 + T / 10 + 0.3, 0)), 1, 30, 0);
      FZ.setTag('e8d', `Dinamometre: ${fs(T)} N`); FZ.show('e8d', V3(0, 6.1, 0), 1, 0, -20);
    },
    qp: (at, S, o) => o.blok.position.clone().add(V3(1.6, 0.6, 0)) });
  const d8 = ders(s8, { yk: 'TYT8-d1', no: 1, icon: '🤿', name: 'Su neden yukarı iter?', task: 'Katı ve sıvı basıncı, kaldırma kuvveti, yüzme ve batma.', steps: [
    { k: { tur: 'merak', b: 'Suda arkadaşımızı kaldırmak neden kolaydır?', m: ['Havuzda insanlar daha hafif gibidir. Su onları yukarı mı itiyor?', 'Önce basıncı, sonra kaldırma kuvvetini inceleyelim.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Basınç', m: [`Katı basıncı: ${FM(`P = ${F('F', 'A')}`)} (Pa) · bıçağın keskin tarafı az alan → büyük basınç`, `Sıvı basıncı: ${FM('P = h · d · g')} · derinlik arttıkça artar, kabın şekline bağlı değildir.`, 'Örnek: 2 m derinlikte suyun basıncı 2 · 1000 · 10 = 20 000 Pa'] } },
    { p: { t: 'Hacmi 500 cm³, ağırlığı 15 N olan blok suya <b>yarısına kadar</b> batırılıyor. Dinamometre ne gösterir?', o: ['15 N', '12,5 N', '7,5 N', '0'], d: 1, b: ['Blok: V = 500 cm³, G = 15 N · yarısı batıyor → V<sub>batan</sub> = 250 cm³', 'Su: d = 1 g/cm³ = 1000 kg/m³ · g = 10 m/s² · 1 cm³ = 10<sup>−6</sup> m³', 'Dinamometre = G − F<sub>k</sub> · F<sub>k</sub> = V<sub>batan</sub> · d<sub>sıvı</sub> · g'] } },
    { do: S => { S.hedef = 0.4; }, sub: 'Bloğu suya indirelim.', go: '▶︎ İndir' },
    { sub: 'Blok yarısına kadar batıyor…', until: S => Math.abs(S.bat - S.hedef) < 0.002 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Kaldırma kuvveti', f: ['e8k', 'e8d', 'e8G'], m: [`Su bloğu yukarı iter: ${FM('F<sub>k</sub> = V<sub>batan</sub> · d<sub>sıvı</sub> · g')}`, 'V<sub>batan</sub> = 250 cm³ → F<sub>k</sub> = 2,5 N → dinamometre 15 − 2,5 = 12,5 N', 'Kaldırma kuvveti, batan kısmın yer değiştirdiği sıvının ağırlığına eşittir (Arşimet).'] } },
    { do: S => { S.hedef = 0.8; }, sub: 'Bloğu tamamen batıralım.', go: '▶︎ Tamamen batır' },
    { sub: 'Blok tamamen batıyor…', until: S => Math.abs(S.bat - S.hedef) < 0.002 },
    { x: { b: 'Derinliği değiştir', m: ['Tamamen batmış bloğu daha derine indirin. Kaldırma kuvveti değişiyor mu?'],
      kay: [{ ad: 'h', etiket: 'İnme (bat)', min: 0.8, max: 1.0, adim: 0.05, deger: 0.8, birim: '', set: (S, v) => { S.hedef = v; } }],
      olc: S => `Kaldırma kuvveti: <em>5 N</em> (V<sub>batan</sub> = 500 cm³ değişmedi)<br>Blok derine indikçe <em>basınç</em> artar ama <em>kaldırma kuvveti değişmez</em>.` } },
    { k: { tur: 'dikkat', b: 'Kaldırma kuvveti neye bağlıdır?', m: ['Batan <em>hacme</em> ve <em>sıvının özkütlesine</em> bağlıdır; cismin ağırlığına ya da tamamen battıktan sonra derinliğe bağlı değildir.', 'Aynı hacimli demir ve tahta tamamen batırılırsa ikisine de aynı kaldırma kuvveti etki eder.'] } },
    { k: { tur: 'gunluk', b: 'Yüzme ve batma', m: ['Yüzen cisimde F<sub>k</sub> = G → batan oran = d<sub>cisim</sub> / d<sub>sıvı</sub>.', 'Buz (0,9 g/cm³) suda hacminin %90\'ı batık yüzer: buzdağının çoğu su altındadır.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`P = ${F('F', 'A')}`)} · ${FM('P = h d g')} · ${FM('F<sub>k</sub> = V<sub>batan</sub> d g')}`, 'Dinamometre: G − F<sub>k</sub>. Yüzende F<sub>k</sub> = G.'] } },
  ] });
  const g8 = gorev(s8, { yk: 'TYT8-g1', no: 1, icon: '⚓', name: 'Bloğu sudan çıkar', task: 'Sıvı basıncını, kaldırma kuvvetini ve dinamometre değerini bulun.', data: [['Bloğun ağırlığı', 'G = 12 N'], ['Bloğun hacmi', 'V = 400 cm³'], ['Suyun özkütlesi', '1000 kg/m³']], steps: [
    { do: S => { S.G = 12; S.V = 400; }, sub: '12 N ağırlığında, 400 cm³ hacminde blok.', go: '▶︎ Başlat' },
    { q: { t: 'Havuzda 2 m derinlikte suyun basıncı kaç Pa\'dır? (açık hava basıncını hesaba katmayın)', o: ['20 000 Pa', '2 000 Pa', '200 Pa', '500 Pa'],
      s: [`${FM('P = h · d · g')} = 2 · 1000 · 10 = <em>20 000 Pa</em> ✓`], n: ['Sıvı basıncı yalnız derinliğe ve sıvının özkütlesine bağlıdır; kabın şekli ve genişliği önemli değildir.'] } },
    { do: S => { S.hedef = 0.8; }, sub: 'Blok tamamen batırılıyor…', until: S => Math.abs(S.bat - S.hedef) < 0.002 },
    { q: { t: '400 cm³ hacimli blok tamamen battığında kaldırma kuvveti kaç N\'dur?', o: ['4 N', '12 N', '40 N', '0,4 N', '8 N'], lab: 'F<sub>k</sub> = ?', f: ['e8k'],
      s: ['V = 400 cm³ = 4 · 10⁻⁴ m³', `${FM('F<sub>k</sub> = V · d · g')} = 4 · 10⁻⁴ · 1000 · 10 = <em>4 N</em> ✓`], n: ['Birimleri SI\'a çevirin: 1 cm³ = 10⁻⁶ m³.'] } },
    { q: { t: 'Bu durumda dinamometre kaç N gösterir?', o: ['8 N', '12 N', '16 N', '4 N', '24 N'], f: ['e8d', 'e8T', 'e8G', 'e8k'],
      s: ['Blok dengede: T + F<sub>k</sub> = G', `T = 12 − 4 = <em>8 N</em> ✓`], n: ['Dinamometre ipteki gerilmeyi (T) gösterir; suda "görünür ağırlık" azalır.'] } },
    { q: { t: 'Özkütlesi 0,6 g/cm³ olan tahta suda (1 g/cm³) yüzüyor. Hacminin yüzde kaçı su içindedir?', o: ['%60', '%40', '%100', '%6'],
      s: ['Yüzende F<sub>k</sub> = G: V<sub>batan</sub> · d<sub>su</sub> · g = V · d<sub>tahta</sub> · g', `${F('V<sub>batan</sub>', 'V')} = ${F('0,6', '1')} = <em>%60</em> ✓`], n: ['Cisim ne kadar hafifse (d küçük) o kadar az batar.'] } },
  ] });
  konuEkle('TYT', 'Basınç ve Kaldırma Kuvveti', { dersler: [d8], gorevler: [g8] });

  // =====================================================================
  // TYT 9 · DALGALAR — ip üzerinde ilerleyen dalga
  // =====================================================================
  const NB = 70;
  const s9 = sahne({ icon: '〰️', cam: [[0, 3.5, 13], [0, 1.6, 0]], plate: [16, 5, 0, 0],
    data: [['Dalga hızı', 'v = λ · f']],
    S0: () => ({ f: 0.5, lam: 4, A: 0.8, kos: 0, faz: 0 }),
    kur(g) {
      const bon = []; for (let i = 0; i < NB; i++) bon.push(top(g, 0.12, i === 35 ? 0xef4444 : 0x60a5fa, -7 + 14 * i / (NB - 1), 1.6, 0, { edge: false }));
      kutu(g, 0.3, 3, 0.3, 0x64748b, -7.3, 1.5, 0);
      const cet = kutu(g, 1, 0.05, 0.05, 0xF5C400, 0, 0.3, 0.5, { edge: false });
      kart('e9l', 'λ', '#F5C400'); kart('e9f', '', '#22c55e');
      return { bon, cet };
    },
    tick(S, dt, o) {
      if (S.kos) S.faz += dt * S.f * 2 * Math.PI;
      const k = 2 * Math.PI / S.lam;
      o.bon.forEach((b, i) => { const x = -7 + 14 * i / (NB - 1), u = S.faz - k * (x + 7); b.position.y = 1.6 + (u > 0 ? S.A * Math.sin(u) : 0); });
      o.cet.scale.x = S.lam; o.cet.position.x = -1 + S.lam / 2 - 1;
      FZ.show('e9l', V3(-2 + S.lam / 2, 0.3, 0.5), S.kos ? 1 : 0, 0, 25); FZ.setTag('e9l', `λ = ${fs(S.lam / 2)} m`);
      FZ.setTag('e9f', `f = ${fs(S.f)} Hz · v = ${fs(S.lam / 2 * S.f)} m/s`); FZ.show('e9f', V3(4, 3.4, 0), S.kos ? 1 : 0);
    },
    qp: (at, S, o) => o.bon[35].position.clone().add(V3(0, 1.2, 0)) });
  const d9 = ders(s9, { yk: 'TYT9-d1', no: 1, icon: '🌊', name: 'Dalga neyi taşır?', task: 'Enine ve boyuna dalga, dalga boyu, frekans, periyot, dalga hızı.', steps: [
    { k: { tur: 'merak', b: 'Stadyumdaki "dalga" seyircileri yerinden kaldırır mı?', m: ['Dalga tribünün bir ucundan öbürüne gider ama hiçbir seyirci yer değiştirmez.', 'Peki ilerleyen şey nedir?'], dugme: 'Başlayalım ▶︎' } },
    { p: { t: 'İpte dalga ilerlerken <b>kırmızı boncuk</b> ne yapar?', o: ['Dalgayla birlikte ilerler', 'Yalnız aşağı yukarı titreşir', 'Hareket etmez', 'Kaynağa doğru gider'], d: 1 } },
    { sub: 'İpin ucunu titreştirelim.', go: '▶︎ Titreştir' },
    { do: S => { S.kos = 1; }, sub: 'Dalga ilerliyor; kırmızı boncuğu izleyin.', wait: 6 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Dalga enerji taşır, madde taşımaz', m: ['Boncuk yalnız yerinde aşağı yukarı titreşti; ilerleyen <em>enerji</em> ve <em>biçim</em>.', 'Titreşim yönü ilerleme yönüne dik → <em>enine dalga</em> (ip, ışık). Paralel → <em>boyuna dalga</em> (ses, yay).'] } },
    { k: { tur: 'kavram', b: 'Dalga boyu, frekans, hız', f: ['e9l', 'e9f'], m: ['Dalga boyu (λ): ardışık iki tepe arası uzaklık · Frekans (f): 1 s\'deki titreşim sayısı · Periyot T = 1/f', FM('v = λ · f'), 'Genlik: denge konumundan en büyük uzaklık; dalganın enerjisiyle ilgilidir.'] } },
    { x: { b: 'Frekansı değiştir', m: ['Aynı ipte frekansı değiştirin. Hız değişiyor mu, dalga boyu mu?'],
      kay: [{ ad: 'f', etiket: 'Frekans (f)', min: 0.25, max: 1.5, adim: 0.25, deger: 0.5, birim: 'Hz', set: (S, v) => { S.f = v; S.lam = 2 / v; } }],
      olc: S => `İpte dalga hızı sabit: <em>v = 1 m/s</em><br>λ = ${F('v', 'f')} = ${F('1', fs(S._f))} = <em>${fs(1 / S._f)} m</em><br>Frekans 2 katına → dalga boyu yarıya.` } },
    { k: { tur: 'dikkat', b: 'Hızı kim belirler?', m: ['Dalganın hızını <em>ortam</em> belirler (ipin gerginliği, havanın sıcaklığı...).', 'Frekansı <em>kaynak</em> belirler; ortam değişince frekans değişmez, hız ve dalga boyu değişir.'] } },
    { k: { tur: 'ornek', b: 'Çözümlü örnek', m: ['Bir su dalgasında iki tepe arası 0,5 m, kaynak saniyede 4 titreşim yapıyor.', 'v = λ · f = 0,5 · 4 = <em>2 m/s</em> · T = 1/4 = 0,25 s'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('v = λ · f')} · ${FM(`T = ${F('1', 'f')}`)} · hızı ortam, frekansı kaynak belirler.`, 'Dalga enerji taşır, madde taşımaz.'] } },
  ] });
  const g9 = gorev(s9, { yk: 'TYT9-g1', no: 1, icon: '🎸', name: 'İpte dalga oluştur', task: 'Dalga hızı, dalga boyu ve periyodu hesaplayın.', steps: [
    { do: S => { S.f = 1; S.lam = 2; }, sub: 'İp 1 Hz ile titreştirilecek.', go: '▶︎ Titreştir' },
    { do: S => { S.kos = 1; }, q: { t: 'İpte dalga boyu 2 m, frekans 3 Hz olan bir dalganın hızı kaç m/s\'dir?', o: ['6 m/s', '1,5 m/s', '0,67 m/s', '5 m/s', '12 m/s'],
      s: [`${FM('v = λ · f')} = 2 · 3 = <em>6 m/s</em> ✓`], n: ['Birimler: m · (1/s) = m/s.'] } },
    { q: { t: 'Aynı ipte frekans 2 katına çıkarılırsa dalga boyu ne olur?', o: ['Yarıya iner', '2 katına çıkar', 'Değişmez', '4 katına çıkar', '4\'te birine iner'], f: ['e9l', 'e9f'],
      s: ['Aynı ip → dalga hızı değişmez', `λ = ${F('v', 'f')} → f 2 katına çıkınca <em>λ yarıya iner</em> ✓`], n: ['Hızı ortam belirlediği için v sabit; f ile λ ters orantılıdır.'] } },
    { do: S => { S.f = 0.5; S.lam = 4; }, q: { t: 'Kaynak 10 saniyede 25 titreşim yapıyor. Dalganın periyodu kaç s\'dir?', o: ['0,4 s', '2,5 s', '250 s', '4 s', '0,8 s'],
      s: [`f = ${F('25', '10')} = 2,5 Hz`, `${FM(`T = ${F('1', 'f')}`)} = ${F('1', '2,5')} = <em>0,4 s</em> ✓`], n: ['Periyot bir tam titreşimin süresidir: T = toplam süre / titreşim sayısı = 10/25.'] } },
    { q: { t: 'Kaynak daha büyük <b>genlikle</b> titreştirilirse (frekans aynı) dalganın hızı ne olur?', o: ['Değişmez', 'Artar', 'Azalır', 'Sıfır olur', 'Önce artar, sonra azalır'],
      s: ['Dalga hızı ortama bağlıdır, genliğe bağlı değildir → <em>değişmez</em> ✓', 'Genlik artınca dalganın taşıdığı <em>enerji</em> artar.'], n: ['Sık yanlış: "Daha güçlü sallarsam dalga daha hızlı gider."'] } },
  ] });
  konuEkle('TYT', 'Dalgalar', { dersler: [d9], gorevler: [g9] });

  // =====================================================================
  // TYT 10 · OPTİK — düzlem ayna, cisim, görüntü ve ışınlar
  // =====================================================================
  const s10 = sahne({ icon: '🪞', cam: [[0, 9, 9], [0, 0.5, 0]], plate: [14, 10, 0, 0],
    data: [['Yansıma', 'gelme açısı = yansıma açısı']],
    S0: () => ({ d: 2, isin: 0, gor: 0 }),
    kur(g) {
      kutu(g, 0.12, 2.2, 7, 0xbfdbfe, 0, 1.1, 0, { op: 0.6 }); kutu(g, 0.2, 2.35, 0.12, 0x78350f, 0, 1.17, 3.55); kutu(g, 0.2, 2.35, 0.12, 0x78350f, 0, 1.17, -3.55);   // aynanın iki yan çerçevesi
      const cisim = FZ.mum(g, 1.15);   // cisim: yanan mum
      const goruntu = FZ.mum(g, 1.15, 0.35);   // görüntü: soluk mum (aynanın arkasında)
      const goz = FZ.goz(g, 0.28); goz.position.set(-3.5, 0.6, 2.6);
      const gelen = FZ.cizgi(g, 0xfacc15), yansi = FZ.cizgi(g, 0xfacc15), uzanti = FZ.cizgi(g, 0x94a3b8), normal = FZ.cizgi(g, 0xffffff);
      kart('e10c', 'cisim', '#ef4444'); kart('e10g', 'görüntü', '#94a3b8'); kart('e10a', '', '#F5C400'); kart('e10b', '', '#F5C400');
      return { cisim, goruntu, goz, gelen, yansi, uzanti, normal };
    },
    tick(S, dt, o) {
      o.cisim.position.set(-S.d, 0, 0); o.goruntu.position.set(S.d, 0, 0); o.goruntu.visible = !!S.gor;
      const C = V3(-S.d, 0.6, 0), E = o.goz.position.clone(), I = V3(S.d, 0.6, 0);
      const t = (0 - E.x) / (I.x - E.x), M = E.clone().lerp(I, t);                       // aynadaki yansıma noktası (göz ile görüntüyü birleştiren doğru)
      [o.gelen, o.yansi, o.uzanti, o.normal].forEach(l => l.visible = false);
      if (S.isin) { FZ.setLine(o.gelen, [C, M]); FZ.setLine(o.yansi, [M, E]); FZ.setLine(o.normal, [M.clone().add(V3(-1.5, 0, 0)), M.clone().add(V3(0.6, 0, 0))]);
        if (S.gor) FZ.setLine(o.uzanti, [M, I]);
        const ang = Math.round(Math.atan2(Math.abs(C.z - M.z), Math.abs(C.x - M.x)) * 180 / Math.PI);
        FZ.setTag('e10a', `${ang}°`); FZ.setTag('e10b', `${ang}°`); FZ.show('e10a', M.clone().add(V3(-0.7, 0.2, -0.45)), 1); FZ.show('e10b', M.clone().add(V3(-0.7, 0.2, 0.45)), 1); }
      FZ.show('e10c', V3(-S.d, 2.1, 0), 1); FZ.show('e10g', V3(S.d, 2.1, 0), S.gor ? 1 : 0);
    },
    qp: (at, S) => V3(0, 3, 0) });
  const d10 = ders(s10, { yk: 'TYT10-d1', no: 1, icon: '🔦', name: 'Aynadaki ben nerede?', task: 'Işığın yansıması, düzlem aynada görüntü, kırılma.', steps: [
    { k: { tur: 'merak', b: 'Aynaya yaklaşınca görüntümüz de yaklaşır mı?', m: ['Aynadaki "ikizimiz" aynanın arkasında duruyormuş gibi görünür.', 'Işığın aynada nasıl davrandığını izleyelim.'], dugme: 'Başlayalım ▶︎' } },
    { sub: 'Cisimden çıkan ışını aynaya gönderelim.', go: '▶︎ Işını gönder' },
    { do: S => { S.isin = 1; }, k: { tur: 'kavram', b: 'Yansıma yasası', f: ['e10a', 'e10b'], m: ['Beyaz çizgi aynaya dik <em>normal</em> çizgisidir. Açılar normalle ölçülür.', `${FM('gelme açısı = yansıma açısı')} · gelen ışın, normal ve yansıyan ışın aynı düzlemdedir.`] } },
    { p: { t: 'Cisim aynadan 2 m uzakta. Görüntü cisimden kaç m uzakta görünür?', o: ['2 m', '4 m', '1 m', 'Aynanın üzerinde'], d: 1 } },
    { do: S => { S.gor = 1; }, sub: 'Yansıyan ışını aynanın arkasına uzatalım (gri çizgi).', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Düzlem aynada görüntü', f: ['e10g', 'e10c'], m: ['Göz, ışını aynanın arkasından geliyormuş gibi algılar: görüntü aynanın 2 m arkasında.', 'Cisim–görüntü uzaklığı = 2 · 2 = <em>4 m</em>. Görüntü <em>sanal</em>, cisimle aynı boyda, sağ-sol ters.'] } },
    { x: { b: 'Cismi kaydır', m: ['Cismin aynaya uzaklığını değiştirin.'],
      kay: [{ ad: 'd', etiket: 'Ayna uzaklığı', min: 1, max: 5, adim: 0.5, deger: 2, birim: 'm', set: (S, v) => { S.d = v; } }],
      olc: S => `Görüntü aynanın <em>${fs(S._d)} m</em> arkasında · cisim–görüntü: <em>${fs(2 * S._d)} m</em><br>Cisim 1 m yaklaşırsa görüntü de 1 m yaklaşır; aralarındaki uzaklık 2 m azalır.` } },
    { k: { tur: 'kavram', b: 'Kırılma', m: ['Işık bir ortamdan diğerine geçerken hızı değiştiği için yön değiştirir.', 'Hızlıdan yavaşa (havadan suya) geçerken <em>normale yaklaşır</em>; yavaştan hızlıya uzaklaşır.', 'Bu yüzden havuzun dibi olduğundan sığ görünür.'] } },
    { k: { tur: 'dikkat', b: 'Görüntü aynanın üzerinde değildir', m: ['Sık yanlış: "Görüntü ayna yüzeyinde oluşur."', 'Doğrusu: düzlem aynada görüntü, cismin aynaya olan uzaklığı kadar <em>aynanın arkasındadır</em>.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('gelme açısı = yansıma açısı')} (normalle ölçülür)`, 'Düzlem ayna: görüntü sanal, düz, eşit boy, aynaya uzaklığı cisimle aynı.', 'Hızlıdan yavaşa geçen ışık normale yaklaşır.'] } },
  ] });
  const g10 = gorev(s10, { yk: 'TYT10-g1', no: 1, icon: '🔆', name: 'Işını yönlendir', task: 'Yansıma açısını, görüntü uzaklığını ve kırılmayı bulun.', steps: [
    { do: S => { S.d = 3; }, sub: 'Cisim aynadan 3 m uzakta.', go: '▶︎ Işını gönder' },
    { do: S => { S.isin = 1; }, q: { t: 'Bir ışın düzlem aynaya, ayna yüzeyiyle <b>30°</b> açı yapacak şekilde geliyor. Yansıma açısı kaç derecedir?', o: ['60°', '30°', '90°', '120°', '180°'],
      s: ['Açılar normalle ölçülür: gelme açısı = 90° − 30° = 60°', `${FM('gelme açısı = yansıma açısı')} → <em>60°</em> ✓`], n: ['Sık yanlış: açıyı ayna yüzeyinden ölçmek. Gelme ve yansıma açıları her zaman normalle ölçülür.'] } },
    { do: S => { S.gor = 1; }, q: { t: 'Cisim düzlem aynadan 3 m uzakta. Cisim ile görüntüsü arasındaki uzaklık kaç m\'dir?', o: ['6 m', '3 m', '1,5 m', '9 m', '12 m'], f: ['e10c', 'e10g'],
      s: ['Görüntü aynanın 3 m arkasındadır.', 'Cisim–görüntü = 3 + 3 = <em>6 m</em> ✓'], n: ['Düzlem aynada cismin ve görüntünün aynaya uzaklıkları eşittir.'] } },
    { q: { t: 'Cisim duruyor, ayna cisimden 1 m/s hızla uzaklaşıyor. Görüntü cisimden kaç m/s hızla uzaklaşır?', o: ['2 m/s', '1 m/s', '0', '0,5 m/s'],
      s: ['Ayna t saniyede 1·t uzaklaşırsa cisim–ayna uzaklığı 1·t artar.', 'Cisim–görüntü uzaklığı bunun iki katı artar → <em>2 m/s</em> ✓'], n: ['Cisim–görüntü uzaklığı = 2 · (cisim–ayna uzaklığı).'] } },
    { q: { t: 'Işık havadan suya eğik geçerken ne olur?', o: ['Normale yaklaşır', 'Normalden uzaklaşır', 'Doğrultusu değişmez', 'Tamamen yansır'],
      s: ['Işık suda havadakinden daha yavaştır.', 'Hızlıdan yavaşa geçerken <em>normale yaklaşır</em> ✓'], n: ['Dik (normal boyunca) gelen ışık kırılmadan geçer; yalnız eğik gelen ışık yön değiştirir.'] } },
  ] });
  konuEkle('TYT', 'Optik', { dersler: [d10], gorevler: [g10] });
})();
