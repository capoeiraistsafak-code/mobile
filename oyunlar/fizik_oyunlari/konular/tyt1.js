// TYT 1 · Fizik Bilimine Giriş — TYT 2 · Madde ve Özellikleri — TYT 3 · Hareket ve Kuvvet
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, levha, konuEkle } = Object.assign({}, FZ, { sahne: FZ.sahne, gorev: FZ.gorev, ders: FZ.ders });
  const fs = x => (+x.toFixed(2)).toString().replace('.', ',');

  // =====================================================================
  // TYT 1 · FİZİK BİLİMİNE GİRİŞ — büyüklükler kutulara ayrılır
  // =====================================================================
  const BL = [ // [ad, birim, temel mi, vektörel mi, renk]
    ['Kütle', 'kg', 1, 0, 0xef4444], ['Uzunluk', 'm', 1, 0, 0xf59e0b], ['Zaman', 's', 1, 0, 0x22c55e], ['Akım', 'A', 1, 0, 0x3b82f6],
    ['Hız', 'm/s', 0, 1, 0x8b5cf6], ['Kuvvet', 'N', 0, 1, 0xec4899], ['Enerji', 'J', 0, 0, 0x14b8a6], ['Sıcaklık', 'K', 1, 0, 0xf97316]];
  const s1 = sahne({ icon: '📏', cam: [[0, 9.5, 17], [0, 0.6, 0.3]], plate: [16, 10, 0, 0],
    data: [['SI temel büyüklük', '7 tane'], ['Türetilmiş', 'temellerden elde edilir']],
    S0: () => ({ ayir: 0, vek: 0, isik: -1 }),
    kur(g) {
      const kutular = BL.map((b, i) => { const m = kutu(g, 1.4, 0.8, 0.8, b[4], 0, 0.4, 0); m.userData.ev = V3(-5.25 + i * 1.5, 0.4, 3);
        const y = FZ.textSprite(`${b[0]} (${b[1]})`, 1.35, 0.42, '#111827', '#ffffff'); y.position.set(0, 0, 0.41); m.add(y); return m; });
      kutu(g, 6.2, 0.2, 3.2, 0x2563eb, -3.6, 0.1, -1.4); levha(g, 'TEMEL', 2.6, 0.55, '#1e3a8a', '#fff', -3.6, 1.0, -3.1);
      kutu(g, 6.2, 0.2, 3.2, 0x7c3aed, 3.6, 0.1, -1.4); levha(g, 'TÜRETİLMİŞ', 3.4, 0.55, '#4c1d95', '#fff', 3.6, 1.0, -3.1);
      etiket('f1b5', 'Kuvvet', '#ec4899');
      return { kutular, oF: ok(0xec4899, 'f1F') };
    },
    tick(S, dt, o) {
      if (S.ayir > 0 && S.ayir < 1) S.ayir = Math.min(1, S.ayir + dt * 0.5);
      let ti = 0, tu = 0;
      o.kutular.forEach((m, i) => { const b = BL[i], hedef = b[2] ? V3(-5.6 + (ti % 3) * 2.1, 0.6, -0.6 - Math.floor(ti++ / 3) * 1.4) : V3(1.6 + (tu % 3) * 2.0, 0.6, -0.6 - Math.floor(tu++ / 3) * 1.4);
        const k = FZ.ease(S.ayir); m.position.lerpVectors(m.userData.ev, hedef, k); m.position.y += Math.sin(k * Math.PI) * 1.5;
        m.scale.setScalar(S.isik === i ? 1 + 0.12 * Math.sin(S.t * 8) : 1); });
      if (S.vek) { const m = o.kutular[5]; FZ.setArrow(o.oF, m.position.clone().add(V3(0.8, 0.1, 0.5)), V3(1, 0, 0), 1.8); FZ.show('f1b5', m.position.clone().add(V3(2.9, 0.1, 0.5)), 1); }
    },
    qp: (at, S, o) => o.kutular[at || 0].position.clone().add(V3(0, 1.4, 0)) });

  const d1 = ders(s1, { yk: 'TYT1-d1', no: 1, icon: '🔭', name: 'Fizik neyi inceler, neyle ölçer?', task: 'Fiziğin alt dalları, temel ve türetilmiş büyüklükler, skaler ve vektörel büyüklükler.', steps: [
    { k: { tur: 'merak', b: 'Bir şeyi "bilmek" için ne gerekir?', m: ['Bir arabanın "hızlı" gittiğini söylemek yetmez; <em>ne kadar</em> hızlı?', 'Fizik, doğayı <em>ölçerek</em> ve sayılarla anlatan bilimdir.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Fiziğin alt dalları', m: ['Mekanik (hareket, kuvvet) · Elektromanyetizma (elektrik, mıknatıs)', 'Termodinamik (ısı, sıcaklık) · Optik (ışık)', 'Atom ve nükleer fizik · Katıhal fiziği (yarı iletkenler)', 'Yüksek enerji ve plazma fiziği'] } },
    { p: { t: 'Masadaki büyüklüklerden hangisi <b>temel</b> büyüklüktür?', o: ['Hız', 'Kuvvet', 'Kütle', 'Enerji'], d: 2 } },
    { sub: 'Büyüklükleri kutularına ayıralım.', go: '▶︎ Ayır' },
    { do: S => { S.ayir = 0.01; }, sub: 'Büyüklükler kutularına gidiyor…', until: S => S.ayir >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Temel ve türetilmiş büyüklükler', m: ['SI\'da <em>7 temel</em> büyüklük: uzunluk (m), kütle (kg), zaman (s), sıcaklık (K), akım (A), madde miktarı (mol), ışık şiddeti (cd).', 'Diğerleri bunlardan <em>türetilir</em>: hız = yol ÷ zaman (m/s), kuvvet = kütle · ivme → kg · m/s² = N'] } },
    { p: { t: 'Hangisi <b>vektörel</b> bir büyüklüktür?', o: ['Sıcaklık', 'Kütle', 'Kuvvet', 'Enerji'], d: 2 } },
    { do: S => { S.vek = 1; S.isik = 5; }, sub: 'Kuvvetin bir yönü var: pembe ok.', wait: 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Skaler ve vektörel', m: ['<em>Skaler</em>: yalnız büyüklük ve birim yeter (kütle, sıcaklık, enerji, zaman).', '<em>Vektörel</em>: büyüklük + <em>yön</em> gerekir (kuvvet, hız, ivme, ağırlık, yer değiştirme).'] } },
    { k: { tur: 'dikkat', b: 'Kütle ile ağırlık aynı şey değildir', m: ['Kütle (kg) madde miktarıdır, skalerdir, her yerde aynıdır.', 'Ağırlık (N) Dünya\'nın çekim kuvvetidir, vektöreldir: G = m · g. Ay\'da ağırlık azalır, kütle aynı kalır.'] } },
    { k: { tur: 'ornek', b: 'Çözümlü örnek: birim çevirme', m: ['72 km/h kaç m/s?', `72 · ${F('1000 m', '3600 s')} = <em>20 m/s</em>`, 'Kısa yol: km/h → m/s için 3,6\'ya böl.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['7 temel büyüklük, diğerleri türetilmiş.', 'Skaler: büyüklük; vektörel: büyüklük + yön.', `${FM('1 m/s = 3,6 km/h')} · ${FM('G = m · g')}`] } },
  ] });
  const g1 = gorev(s1, { yk: 'TYT1-g1', no: 1, icon: '📦', name: 'Büyüklükleri sınıflandır', task: 'Büyüklükleri temel/türetilmiş ve skaler/vektörel olarak ayırın, birim çevirin.', steps: [
    { sub: 'Masada sekiz büyüklük var. Başlat\'a basın.', go: '▶︎ Başlat' },
    { do: S => { S.isik = 3; }, q: { t: 'Aşağıdakilerden hangisi SI sisteminde <b>temel</b> büyüklüktür?', o: ['Elektrik akımı', 'Hız', 'Basınç', 'Enerji'], lab: 'Temel mi?', at: 3, f: [],
      s: ['SI\'da 7 temel büyüklük vardır:', 'uzunluk, kütle, zaman, sıcaklık, <em>elektrik akımı</em>, madde miktarı, ışık şiddeti ✓', 'Hız, basınç ve enerji bunlardan türetilir.'],
      n: ['Temel büyüklük başka büyüklüklerle tanımlanmaz; türetilmişler temellerden çarpma/bölme ile elde edilir.', 'Basınç = kuvvet ÷ alan → N/m² = Pa (türetilmiş).'] } },
    { do: S => { S.ayir = 0.01; S.isik = -1; }, sub: 'Büyüklükler kutularına ayrılıyor…', until: S => S.ayir >= 1 },
    { do: S => { S.isik = 5; }, q: { t: 'Kuvvetin birimi newton (N), temel birimlerle nasıl yazılır?', o: ['kg · m/s²', 'kg · m/s', 'kg · m²/s²', 'kg/(m · s²)'], lab: 'N = ?', at: 5, f: ['f1F', 'f1b5'],
      s: [`${FM('F = m · a')} → kg · ${F('m', 's<sup>2</sup>')}`, '1 N = 1 <em>kg · m/s²</em> ✓', '(kg · m²/s² joule\'dür; kg · m/s momentum birimidir.)'],
      n: ['Birim bulmak için büyüklüğün tanım denklemini yazın: kuvvet = kütle × ivme.', 'İvmenin birimi m/s²\'dir (hızın birimi m/s, bölü zaman s).'] } },
    { do: S => { S.vek = 1; }, q: { t: 'Aşağıdakilerden hangisi <b>vektörel</b> bir büyüklüktür?', o: ['Ağırlık', 'Kütle', 'Sıcaklık', 'Zaman'], f: ['f1F', 'f1b5'],
      s: ['Ağırlık bir kuvvettir (G = m · g); yönü her zaman düşey aşağıdır.', 'Yönü olan büyüklük <em>vektöreldir</em> ✓', 'Kütle, sıcaklık ve zamanın yönü yoktur (skaler).'],
      n: ['Sık yanlış: "Kütle ile ağırlık aynıdır." Kütle skaler (kg), ağırlık vektörel (N).'] } },
    { q: { t: 'Bir otomobil 54 km/h hızla gidiyor. Bu hız kaç m/s\'dir?', o: ['15 m/s', '54 m/s', '5,4 m/s', '150 m/s'],
      s: ['§1. YOL · birimleri tek tek çevir', `54 · ${F('1000 m', '3600 s')} = <em>15 m/s</em> ✓`, '§2. YOL · 3,6\'ya böl', `${F('54', '3,6')} = <em>15 m/s</em> ✓`],
      n: ['1 km = 1000 m, 1 h = 3600 s → 1 km/h = 1/3,6 m/s.'] } },
  ] });
  konuEkle('TYT', 'Fizik Bilimine Giriş', { dersler: [d1], gorevler: [g1] });

  // =====================================================================
  // TYT 2 · MADDE VE ÖZELLİKLERİ — taşırma kabı ve özkütle
  // =====================================================================
  const s2 = sahne({ icon: '⚖️', cam: [[1.5, 4.6, 10.5], [0.8, 1.6, 0]], plate: [12, 8, 0, 0],
    data: [['Suyun özkütlesi', '1 g/cm³'], ['Özkütle', 'd = m / V']],
    S0: () => ({ in: 0, bas: 0, kes: 0, mGr: 540, V: 200 }),
    kur(g) {
      const kap = silindir(g, 1.1, 1.1, 2.6, 0x93c5fd, -1, 1.3, 0, { op: 0.35, edge: false });
      const su = silindir(g, 1.05, 1.05, 2.3, 0x38bdf8, -1, 1.15, 0, { op: 0.75, edge: false });
      const oluk = kutu(g, 1.2, 0.12, 0.3, 0x94a3b8, 0.45, 2.3, 0); oluk.rotation.z = -0.35;
      const behir = silindir(g, 0.75, 0.75, 1.6, 0xbfdbfe, 1.7, 0.8, 0, { op: 0.35, edge: false });
      const tsu = silindir(g, 0.7, 0.7, 1, 0x38bdf8, 1.7, 0.5, 0, { op: 0.8, edge: false });
      const kup = kutu(g, 0.9, 0.9, 0.9, 0x9ca3af, -1, 4.4, 0); const yar = kutu(g, 0.45, 0.9, 0.9, 0x9ca3af, -1, 4.4, 0); yar.visible = false;
      const dama = top(g, 0.1, 0x38bdf8, 1.1, 2.1, 0, { edge: false });
      kart('f2m', '', '#f59e0b'); kart('f2v', '', '#38bdf8');
      return { kup, yar, tsu, dama };
    },
    tick(S, dt, o) {
      if (S.bas && S.in < 1) S.in = Math.min(1, S.in + dt * 0.35);
      const k = FZ.ease(S.in); o.kup.position.set(-1, 4.4 - k * 3.6, 0);
      const tasan = Math.max(0, (k - 0.55) / 0.45);                            // küp suya girdikçe taşma kabından su akar
      o.tsu.scale.y = 0.05 + 0.95 * tasan; o.tsu.position.y = o.tsu.scale.y * 0.5;
      o.dama.visible = S.bas && tasan > 0 && tasan < 1; if (o.dama.visible) o.dama.position.y = 2.1 - ((S.t * 2) % 1) * 1.1;
      if (S.kes) { const a = Math.min(1, S.kes); o.kup.scale.x = 0.5; o.kup.position.x = -1.25 - a * 0.4; o.yar.visible = true; o.yar.position.set(-0.75 + a * 0.4, o.kup.position.y, 0); }
      FZ.show('f2m', o.kup.position.clone().add(V3(0, 0.9, 0)), S.in < 0.3 ? 1 : 0, 0, -10); FZ.setTag('f2m', `m = ${S.mGr} g`);
      FZ.show('f2v', V3(1.7, 1.9, 0), tasan > 0.99 ? 1 : 0, 0, -10); FZ.setTag('f2v', `Taşan su: ${S.V} cm³`);
    },
    basla(S, o) { o.kup.scale.set(1, 1, 1); o.yar.visible = false; },
    qp: () => V3(-1, 3.6, 0) });
  const d2 = ders(s2, { yk: 'TYT2-d1', no: 1, icon: '🧊', name: 'Batar mı, yüzer mi? Özkütle', task: 'Kütle, hacim, özkütle; taşırma kabıyla hacim ölçme; karışımın özkütlesi.', steps: [
    { k: { tur: 'merak', b: 'Demir çivi batar, demir gemi neden yüzer?', m: ['İkisi de demir. Fark ne olabilir?', 'Önce bir cismin "yoğunluğunu", yani <em>özkütlesini</em> ölçmeyi öğrenelim.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Kütle, hacim, özkütle', m: ['Kütle (m): madde miktarı · terazi ile ölçülür (g, kg).', 'Hacim (V): kapladığı yer (cm³, m³). Düzgün olmayan cismin hacmi taşırma kabıyla ölçülür.', `${FM(`d = ${F('m', 'V')}`)} · birimi g/cm³ ya da kg/m³ (1 g/cm³ = 1000 kg/m³)`] } },
    { do: S => { S.mGr = 270; S.V = 100; }, p: { t: 'Ağzına kadar dolu taşırma kabına küp bırakılırsa ne kadar su taşar?', o: ['Küpün kütlesi kadar', 'Küpün hacmi kadar', 'Hiç taşmaz', 'Kabın hacmi kadar'], d: 1 } },
    { sub: 'Küpü suya bırakalım.', go: '▶︎ Küpü bırak' },
    { do: S => { S.bas = 1; }, sub: 'Küp batarken su oluktan taşıyor…', until: S => S.in >= 1 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Taşan su = batan hacim', m: ['Taşan su 100 cm³ → küpün hacmi V = 100 cm³', `d = ${F('270 g', '100 cm³')} = <em>2,7 g/cm³</em> → küp alüminyum olabilir.`] } },
    { x: { b: 'Farklı maddeler dene', m: ['Aynı 100 cm³\'lük küp farklı maddeden olsaydı kütlesi ne olurdu?'],
      kay: [{ ad: 'd', etiket: 'Özkütle (d)', min: 0.5, max: 11.5, adim: 0.5, deger: 2.5, birim: 'g/cm³', set: (S, v) => { S.mGr = Math.round(v * 100); } }],
      olc: S => `m = d · V = ${fs(S._d)} · 100 = <em>${fs(S._d * 100)} g</em><br>${S._d < 1 ? 'Suya göre daha az yoğun → <em>yüzer</em>.' : S._d === 1 ? 'Suyla aynı → askıda kalır.' : 'Sudan yoğun → <em>batar</em>.'}<br>Buz 0,9 · su 1 · alüminyum 2,7 · demir 7,9 · kurşun 11,3 g/cm³` } },
    { k: { tur: 'dikkat', b: 'Özkütle miktara bağlı değildir', m: ['Küpü ikiye bölsek her parçanın kütlesi de hacmi de yarıya iner; <em>özkütle aynı kalır</em>.', 'Bu yüzden özkütle maddeyi tanıtan <em>ayırt edici</em> özelliktir. Kütle ve hacim ayırt edici değildir.'] } },
    { k: { tur: 'gunluk', b: 'Gemi neden yüzer?', m: ['Gemi içi boş bir kabuktur: toplam kütlesi büyük ama kapladığı hacim çok daha büyüktür.', 'Geminin <em>ortalama</em> özkütlesi sudan küçük olduğu için yüzer.'] } },
    { k: { tur: 'ornek', b: 'Çözümlü örnek: karışım', m: ['100 cm³ su (1 g/cm³) ile 100 cm³ zeytinyağı (0,9 g/cm³) karıştırılıyor (hacimler korunuyor).', 'm = 100 + 90 = 190 g, V = 200 cm³', `${FM(`d<sub>k</sub> = ${F('m<sub>1</sub> + m<sub>2</sub>', 'V<sub>1</sub> + V<sub>2</sub>')}`)} = ${F('190', '200')} = <em>0,95 g/cm³</em>`] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM(`d = ${F('m', 'V')}`)} · taşan su = batan hacim · ${FM(`d<sub>k</sub> = ${F('m<sub>top</sub>', 'V<sub>top</sub>')}`)}`, 'Özkütle ayırt edicidir; sudan az yoğun olan yüzer.'] } },
  ] });
  const g2 = gorev(s2, { yk: 'TYT2-g1', no: 1, icon: '🥽', name: 'Maddeyi tanı', task: 'Taşırma kabıyla hacmi ölçün, özkütleyi bulun ve maddeyi tanıyın.', data: [['Küpün kütlesi', 'm = 540 g'], ['Suyun özkütlesi', '1 g/cm³']], steps: [
    { sub: 'Taşırma kabı ağzına kadar dolu. Küp suya bırakılacak.', go: '▶︎ Küpü bırak' },
    { do: S => { S.bas = 1; }, sub: 'Küp batıyor, su taşıyor…', until: S => S.in >= 1 },
    { q: { t: 'Kütlesi 540 g olan küp batınca 200 cm³ su taştı. Küpün <b>özkütlesi</b> kaç g/cm³\'tür?', o: ['2,7', '0,37', '540', '1,08'], lab: 'd = ?', f: ['f2v'],
      s: ['Taşan su = küpün hacmi = 200 cm³', `${FM(`d = ${F('m', 'V')}`)} = ${F('540', '200')} = <em>2,7 g/cm³</em> ✓`],
      n: ['Taşırma kabı ağzına kadar dolu olmalı; yoksa ilk giren hacim taşmaz ve ölçüm yanlış çıkar.', 'Taşan suyun hacmi, cismin batan hacmine eşittir.'] } },
    { do: S => { S.kes = 1; }, q: { t: 'Küp ortadan iki eşit parçaya kesiliyor. Parçalardan birinin özkütlesi kaç g/cm³\'tür?', o: ['2,7', '1,35', '5,4', '0,9'],
      s: ['Parçanın kütlesi 270 g, hacmi 100 cm³ olur.', `d = ${F('270', '100')} = <em>2,7 g/cm³</em> ✓ (değişmez)`],
      n: ['Özkütle maddenin ayırt edici özelliğidir; miktarla değişmez.'] } },
    { q: { t: '300 cm³ su (1 g/cm³) ile 100 cm³ alkol (0,8 g/cm³) karıştırılıyor. Hacimler korunuyorsa karışımın özkütlesi kaç g/cm³\'tür?', o: ['0,95', '0,9', '1,8', '0,85'],
      s: ['m = 300 · 1 + 100 · 0,8 = 380 g', 'V = 300 + 100 = 400 cm³', `${FM(`d<sub>k</sub> = ${F('m<sub>top</sub>', 'V<sub>top</sub>')}`)} = ${F('380', '400')} = <em>0,95 g/cm³</em> ✓`],
      n: ['Karışımın özkütlesi iki sıvının arasındadır ve hacmi çok olana daha yakındır.', 'Sık yanlış: özkütlelerin ortalamasını almak ((1 + 0,8) / 2 = 0,9). Bu yalnız hacimler eşitse doğrudur.'] } },
    { q: { t: 'Hangi madde suya (1 g/cm³) bırakılınca <b>yüzer</b>?', o: ['Buz (0,92 g/cm³)', 'Alüminyum (2,7 g/cm³)', 'Demir (7,9 g/cm³)', 'Kurşun (11,3 g/cm³)'],
      s: ['Özkütlesi sıvınınkinden küçük olan katı yüzer.', '0,92 < 1 → <em>buz yüzer</em> ✓'],
      n: ['Buz, suyun katısı olmasına rağmen sudan az yoğundur; su donarken genleşir.'] } },
  ] });
  konuEkle('TYT', 'Madde ve Özellikleri', { dersler: [d2], gorevler: [g2] });

  // =====================================================================
  // TYT 3 · HAREKET VE KUVVET — yol üzerinde araba, kuvvet okları
  // =====================================================================
  const s3 = sahne({ icon: '🚗', ses: 'engine', cam: [[2, 5, 15], [2, 0.8, 0]], plate: [26, 6, 3, 0],
    data: [['Sürtünme', 'görevde verilir']],
    cam2: S => { const X = -8 + S.x / 4; return [[X + 3, 5, 15], [X + 3, 0.8, 0]]; },
    S0: () => ({ x: 0, v: 0, a: 0, F: 0, f: 0, kos: 0, sure: -1, m: 1000 }),
    kur(g) {
      for (let i = 0; i <= 10; i++) { kutu(g, 0.06, 0.02, 3, 0xffffff, -8 + i * 2.5, 0.02, 0, { edge: false, cast: false }); etiket('f3m' + i, `${i * 10} m`, '#1f232c'); }
      const araba = FZ.araba(g, 0xef4444);
      kart('f3t', '', '#F5C400'); etiket('f3F', 'F', '#ec4899'); etiket('f3f', 'f<sub>s</sub>', '#ef4444'); etiket('f3v', 'v', '#16a34a');
      return { araba, oF: ok(0xec4899, 'f3F'), of: ok(0xef4444, 'f3f'), ov: ok(0x22c55e, 'f3v') };
    },
    tick(S, dt, o) {
      if (S.kos) { S.a = (S.F - (S.v > 0 || S.F > S.f ? S.f : S.F)) / S.m; S.v = Math.max(0, S.v + S.a * dt); S.x += S.v * dt; if (S.sure >= 0) S.sure += dt; if (S.xMax && S.x >= S.xMax) { S.x = S.xMax; S.kos = 0; } }
      const X = -8 + S.x / 4; FZ.tekerDondur(o.araba, X - o.araba.position.x); o.araba.position.x = X;                       // 1 birim = 4 m
      for (let i = 0; i <= 10; i++) FZ.show('f3m' + i, V3(-8 + i * 2.5, 0.05, 1.8), 1, 0, 20);
      const b = V3(X, 0.6, 0.6);
      if (S.F > 0) { FZ.setArrow(o.oF, b.clone().add(V3(0.9, 0, 0)), V3(1, 0, 0), S.F / 1000); FZ.show('f3F', b.clone().add(V3(0.9 + S.F / 1000 + 0.3, 0, 0)), 1); }
      if (S.f > 0 && (S.v > 0 || S.F > 0)) { FZ.setArrow(o.of, b.clone().add(V3(-0.85, -0.45, 0.2)), V3(-1, 0, 0), S.f / 1000); FZ.show('f3f', b.clone().add(V3(-0.85 - S.f / 1000 - 0.3, -0.45, 0.2)), 1); }
      if (S.v > 0.05) { FZ.setArrow(o.ov, b.clone().add(V3(0, 0.7, 0)), V3(1, 0, 0), S.v / 8); FZ.show('f3v', b.clone().add(V3(S.v / 8 + 0.3, 0.7, 0)), 1); }
      FZ.setTag('f3t', `t = ${fs(Math.max(0, S.sure))} s · v = ${fs(S.v)} m/s · x = ${fs(S.x)} m`); FZ.show('f3t', V3(X, 2.2, 0), S.sure >= 0 ? 1 : 0);
      S.ses = S.kos ? [0.06 + S.v / 300, S.v / 20] : [0, 0];
    },
    qp: (at, S) => V3(-8 + S.x / 4, 2.6, 0) });
  const d3 = ders(s3, { yk: 'TYT3-d1', no: 1, icon: '🛞', name: 'Hareketi kuvvet mi sürdürür?', task: 'Konum, hız, ivme; Newton\'un hareket yasaları ve sürtünme kuvveti.', steps: [
    { k: { tur: 'merak', b: 'Araba fren yapınca yolcu neden öne savrulur?', m: ['Kimse yolcuyu öne itmiyor. O hâlde neden öne gidiyor?', 'Bu derste hareketi ve kuvveti birbirinden ayırmayı öğreneceğiz.'], dugme: 'Başlayalım ▶︎' } },
    { do: S => { S.v = 10; S.sure = 0; S.xMax = 40; }, p: { t: 'Araba 10 m/s sabit hızla gidiyor. 4 saniyede kaç metre yol alır?', o: ['2,5 m', '14 m', '40 m', '400 m'], d: 2 } },
    { sub: 'Sürtünmesiz yolda arabayı izleyelim.', go: '▶︎ Başlat' },
    { do: S => { S.kos = 1; }, sub: 'Sabit hız: işaretleri sayın.', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Sabit hızlı hareket', f: ['f3t'], m: [`${FM('x = v · t')} = 10 · 4 = 40 m`, 'Hız: birim zamandaki yer değiştirme (vektörel). Sürat: birim zamandaki yol (skaler).'] } },
    { p: { t: 'Yolda sürtünme yoksa ve motor kapatılırsa araba ne yapar?', o: ['Hemen durur', 'Sabit hızla gitmeye devam eder', 'Yavaşlayarak durur', 'Hızlanır'], d: 1 } },
    { do: S => { S.xMax = 80; S.kos = 1; }, sub: 'Motor kapalı, sürtünme yok…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Newton\'un 1. yasası (eylemsizlik)', m: ['Net kuvvet sıfırsa duran cisim durur, hareket eden cisim <em>sabit hızla</em> gider.', 'Fren yapınca araba yavaşlar ama yolcunun gövdesi eylemsizliğiyle eski hızını korumak ister → öne savrulur.'] } },
    { k: { tur: 'dikkat', b: 'Hareket için kuvvet gerekmez', m: ['Sık yanlış: "Cisim hareket ediyorsa üzerinde hareket yönünde kuvvet vardır."', 'Doğrusu: kuvvet hızı <em>değiştirmek</em> için gerekir. Sabit hızda net kuvvet sıfırdır.'] } },
    { do: S => { S.x = 0; S.v = 0; S.F = 3000; S.f = 1000; S.sure = 0; S.xMax = 64; }, k: { tur: 'kavram', b: 'Newton\'un 2. yasası ve sürtünme', f: ['f3F', 'f3f'], m: [`${FM('F<sub>net</sub> = m · a')} · ivme net kuvvet yönündedir.`, `Kinetik sürtünme: ${FM('f<sub>s</sub> = k · N')} (k: sürtünme katsayısı), harekete zıt yöndedir.`, 'Şimdi araba (1000 kg) 3000 N ile çekiliyor, sürtünme 1000 N.'] } },
    { sub: 'Arabayı kuvvetle çekelim.', go: '▶︎ Çek' },
    { do: S => { S.kos = 1; }, sub: 'Net kuvvet 2000 N → ivme…', until: S => !S.kos },
    { k: { tur: 'ornek', b: 'Çözümlü örnek', f: ['f3t'], m: [`a = ${F('F − f<sub>s</sub>', 'm')} = ${F('3000 − 1000', '1000')} = <em>2 m/s²</em>`, 'Hız her saniye 2 m/s artar: 8 s sonra v = 16 m/s, yol x = ½ · 2 · 8² = 64 m.', '3. yasa: araba yolu geri iterken yol da arabayı ileri iter (etki-tepki, farklı cisimlere etki eder).'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('x = v · t')} (sabit hız) · ${FM('F<sub>net</sub> = m · a')} · ${FM('f<sub>s</sub> = k · N')}`, 'Net kuvvet sıfır → hız sabit. Net kuvvet var → hız değişir.'] } },
  ] });
  const g3 = gorev(s3, { yk: 'TYT3-g1', no: 1, icon: '🏁', name: 'Arabayı hedefe götür', task: 'Sabit hızlı ve ivmeli hareketi hesaplayın; kuvvet ve sürtünmeyi bulun.', data: [['Arabanın kütlesi', 'm = 500 kg']], steps: [
    { do: S => { S.m = 500; S.v = 15; S.sure = 0; S.xMax = 90; }, sub: 'Araba sürtünmesiz yolda 15 m/s sabit hızla gidecek.', go: '▶︎ Başlat' },
    { q: { t: 'Araba 15 m/s sabit hızla 6 s gidiyor. Kaç metre yol alır?', o: ['90 m', '2,5 m', '21 m', '45 m'], lab: 'x = ?', f: ['f3t'],
      s: [`${FM('x = v · t')} = 15 · 6 = <em>90 m</em> ✓`], n: ['Sabit hızlı harekette hız-zaman grafiği yataydır; altındaki alan yolu verir: 15 · 6 = 90.'] } },
    { do: S => { S.kos = 1; }, sub: 'Araba ilerliyor…', until: S => !S.kos },
    { do: S => { S.x = 0; S.v = 0; S.F = 2500; S.f = 500; S.sure = 0; S.xMax = 72; }, q: { t: 'Duran arabaya (500 kg) 2500 N çekme kuvveti uygulanıyor; sürtünme kuvveti 500 N. Arabanın <b>ivmesi</b> kaç m/s²\'dir?', o: ['4 m/s²', '5 m/s²', '6 m/s²', '1 m/s²'], f: ['f3F', 'f3f'],
      s: ['F<sub>net</sub> = 2500 − 500 = 2000 N', `a = ${F('F<sub>net</sub>', 'm')} = ${F('2000', '500')} = <em>4 m/s²</em> ✓`],
      n: ['Sürtünme hareketi (ya da hareket eğilimini) zorlaştıran yöndedir; net kuvvet bulunurken çıkarılır.', 'Sık yanlış: sürtünmeyi unutup 2500 ÷ 500 = 5 bulmak.'] } },
    { sub: 'Arabayı çekelim.', go: '▶︎ Çek' },
    { do: S => { S.kos = 1; }, sub: 'Araba hızlanıyor…', until: S => S.sure >= 5 },
    { do: S => { S.kos = 0; }, q: { t: 'Araba durgun hâlden 4 m/s² ivmeyle 5 s hızlanıyor. Bu sürede kaç metre yol alır?', o: ['50 m', '20 m', '100 m', '10 m'],
      s: ['§1. YOL · formülle', `${FM(`x = ${F('1', '2')} · a · t<sup>2</sup>`)} = ${F('1', '2')} · 4 · 25 = <em>50 m</em> ✓`, '§2. YOL · hız-zaman grafiği alanı', `v = a · t = 20 m/s → alan = ${F('20 · 5', '2')} = <em>50 m</em> ✓`],
      n: ['Hız-zaman grafiğinin altındaki alan yer değiştirmeyi, eğimi ivmeyi verir.'] } },
    { do: S => { S.F = 800; S.f = 800; S.a = 0; }, q: { t: 'Araba artık 20 m/s <b>sabit hızla</b> gidiyor ve sürtünme kuvveti 800 N. Motorun çekme kuvveti kaç N\'dur?', o: ['800 N', '0', '1600 N', '10000 N'], f: ['f3F', 'f3f'],
      s: ['Hız sabit → a = 0 → F<sub>net</sub> = 0', `F − f<sub>s</sub> = 0 → <em>F = 800 N</em> ✓`],
      n: ['Sabit hız "kuvvet yok" demek değildir; kuvvetlerin <em>dengelendiği</em> demektir.'] } },
  ] });
  konuEkle('TYT', 'Hareket ve Kuvvet', { dersler: [d3], gorevler: [g3] });
})();
