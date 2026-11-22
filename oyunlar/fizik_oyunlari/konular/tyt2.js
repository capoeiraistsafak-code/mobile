// TYT 4 · Enerji — TYT 5 · Isı ve Sıcaklık — TYT 6 · Elektrostatik — TYT 7 · Elektrik ve Manyetizma
(function () {
  const { V3, sahne, gorev, ders, ok, etiket, kart, kutu, top, silindir, levha, konuEkle, THREE } = FZ;
  const fs = x => (+(+x).toFixed(2)).toString().replace('.', ',');

  // =====================================================================
  // TYT 4 · ENERJİ — rampadan kayan top ve enerji çubukları
  // =====================================================================
  const RL = 8, RH = 4;                                                   // rampa: 8 birim uzun, 4 birim yüksek (1 birim = 1,25 m → h = 5 m)
  const ry = x => x < RL ? RH * (1 + Math.cos(Math.PI * x / RL)) / 2 : 0;
  const s4 = sahne({ icon: '⚡', cam: [[1.5, 5, 15], [1.5, 2, 0]], plate: [20, 6, 2, 0],
    data: [['Topun kütlesi', 'm = 4 kg'], ['Rampa yüksekliği', 'h = 5 m'], ['g', '10 m/s²']],
    S0: () => ({ x: 0, kos: 0, kayip: 0, m: 4, h: 5, vYer: 0 }),
    kur(g) {
      const pts = []; for (let i = 0; i <= 60; i++) { const x = 13 * i / 60; pts.push(V3(x - 6, ry(x), 0)); }
      g.add(FZ.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, 0.08, 8, false), 0x94a3b8, { edge: false }));
      for (let x = 0.5; x < RL; x += 1.5) kutu(g, 0.15, ry(x), 0.15, 0xf59e0b, x - 6, ry(x) / 2, -0.2);
      const t = top(g, 0.35, 0xef4444, -6, RH + 0.35, 0);
      const cub = ['Ep', 'Ek', 'Isı'].map((a, i) => { const m = kutu(g, 0.7, 1, 0.7, [0xef4444, 0x22c55e, 0xf97316][i], 6 + i * 1.1, 0.5, -1.5); etiket('e4b' + i, a, ['#dc2626', '#16a34a', '#ea580c'][i]); return m; });
      kutu(g, 3.6, 0.08, 0.08, 0xffffff, 7.1, 4.02, -1.5); etiket('e4t', 'Toplam enerji', '#1f232c');
      kart('e4h', 'h = 5 m', '#F5C400'); kart('e4v', '', '#22c55e');
      return { t, cub, ov: ok(0x22c55e, 'e4v') };
    },
    tick(S, dt, o) {
      const E = S.m * 10 * S.h, yH = ry(S.x) / RH * S.h;                     // gerçek yükseklik (m)
      const Ep = S.m * 10 * yH, isi = S.kayip * (S.h - yH) / S.h * E, Ek = Math.max(0, E - Ep - isi);
      const v = Math.sqrt(2 * Ek / S.m);
      if (S.kos) { S.x += Math.max(v, 0.4) * dt * 0.45; if (S.x >= S.hedef) { S.x = S.hedef; S.kos = 0; } }
      const p = V3(S.x - 6, ry(S.x) + 0.35, 0); o.t.position.copy(p); o.t.rotation.z = -S.x * 1.5;
      [Ep, Ek, isi].forEach((e, i) => { const hh = Math.max(0.02, 4 * e / E); o.cub[i].scale.y = hh; o.cub[i].position.y = hh / 2; FZ.show('e4b' + i, V3(6 + i * 1.1, hh + 0.4, -1.5), 1); FZ.setTag('e4b' + i, `${['Ep', 'Ek', 'Isı'][i]} ${fs(e)} J`); });
      FZ.show('e4t', V3(7.1, 4.4, -1.5), 1); FZ.show('e4h', V3(-6.8, 2, 0), S.x < 0.3 ? 1 : 0); FZ.setTag('e4h', `h = ${fs(S.h)} m`);
      if (v > 0.3) { const d = V3(1, (ry(S.x + 0.05) - ry(S.x)) / 0.05, 0).normalize(); FZ.setArrow(o.ov, p.clone().add(V3(0, 0.5, 0.5)), d, v / 8); }
      FZ.setTag('e4v', `v = ${fs(v)} m/s`); FZ.show('e4v', p.clone().add(V3(0, 1.4, 0)), S.x > 0.2 ? 1 : 0);
    },
    qp: (at, S) => V3(S.x - 6, ry(S.x) + 1.6, 0) });
  const d4 = ders(s4, { yk: 'TYT4-d1', no: 1, icon: '🎢', name: 'Enerji nereye gider?', task: 'İş, güç, potansiyel ve kinetik enerji, enerji korunumu ve sürtünmeyle ısıya dönüşüm.', steps: [
    { k: { tur: 'merak', b: 'Yokuş aşağı pedal çevirmeden hızlanırız. Bu enerji nereden gelir?', m: ['Yukarıdayken bisiklette görünmeyen bir enerji saklıdır.', 'Bu derste enerjinin bir türden diğerine nasıl geçtiğini izleyeceğiz.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'İş ve enerji', m: [`İş: kuvvet doğrultusundaki yer değiştirme ile kuvvetin çarpımı: ${FM('W = F · x')} (J)`, `Yükseklik enerjisi: ${FM('E<sub>p</sub> = m · g · h')} · Hareket enerjisi: ${FM(`E<sub>k</sub> = ${F('1', '2')} · m · v<sup>2</sup>`)}`, 'Enerji, iş yapabilme yeteneğidir; birimi joule (J).'] } },
    { p: { t: 'Sürtünmesiz rampada top yüksekliğin <b>yarısına</b> indiğinde kinetik enerjisi ne olur?', o: ['Başlangıçtaki Ep\'nin yarısı', 'Başlangıçtaki Ep kadar', 'Sıfır', 'Ep\'nin 2 katı'], d: 0 } },
    { do: S => { S.hedef = RL / 2; }, sub: 'Topu bırakalım; enerji çubuklarını izleyin.', go: '▶︎ Bırak' },
    { do: S => { S.kos = 1; }, sub: 'Top iniyor…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Enerji korunur', f: ['e4b0', 'e4b1'], m: ['Yarı yükseklikte Ep = Ek = 100 J. Toplam (beyaz çizgi) hep 200 J.', `${FM('E<sub>p</sub> + E<sub>k</sub> = sabit')} (sürtünme yoksa)`] } },
    { do: S => { S.hedef = 12.5; S.kos = 1; }, sub: 'Top yere iniyor…', until: S => !S.kos },
    { x: { b: 'Yüksekliği değiştir', m: ['Topu farklı yüksekliklerden bıraksaydık yere hangi hızla varırdı?'],
      kay: [{ ad: 'h', etiket: 'Yükseklik (h)', min: 1.25, max: 20, adim: 1.25, deger: 5, birim: 'm', set: (S, v) => { S.h = v; } }],
      olc: S => `${F('1', '2')} m v² = m g h → v = ${SQ('2 g h')} = <em>${fs(Math.sqrt(20 * S._h))} m/s</em><br>Kütle sadeleşir: ağır top da hafif top da aynı hızla varır.<br>h 4 katına çıkınca v yalnız <em>2 katına</em> çıkar.` } },
    { do: S => { S.h = 5; S._h = 5; S.x = 0; S.kayip = 0.36; S.hedef = 12.5; }, p: { t: 'Rampa artık <b>sürtünmeli</b>. Top yere aynı hızla mı varır?', o: ['Daha hızlı varır', 'Aynı hızla varır', 'Daha yavaş varır; enerjinin bir kısmı ısıya dönüşür', 'Hiç inemez'], d: 2 } },
    { do: S => { S.kos = 1; }, sub: 'Sürtünmeli rampa…', until: S => !S.kos },
    { k: { tur: 'gozlem', sonuc: true, b: 'Enerji yok olmaz, dönüşür', f: ['e4b2'], m: ['Turuncu çubuk: sürtünmeyle ısıya dönüşen enerji (72 J).', 'Toplam yine 200 J: enerji yoktan var, vardan yok edilemez (enerjinin korunumu).'] } },
    { k: { tur: 'dikkat', b: 'Her kuvvet iş yapmaz', m: ['Çantayı yatay yolda sabit hızla taşırken yerçekimine karşı iş yapmazsınız (kuvvet düşey, hareket yatay).', 'Duvarı itip yerinden oynatamazsanız yorulursunuz ama fiziksel iş sıfırdır (x = 0).'] } },
    { k: { tur: 'ornek', b: 'Çözümlü örnek: güç', m: ['50 kg\'lık öğrenci 3 m yüksekliğindeki merdiveni 6 s\'de çıkıyor.', 'W = m g h = 50 · 10 · 3 = 1500 J', `${FM(`P = ${F('W', 't')}`)} = ${F('1500', '6')} = <em>250 W</em>`] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('W = F · x')} · ${FM('E<sub>p</sub> = m g h')} · ${FM(`E<sub>k</sub> = ${F('1', '2')} m v<sup>2</sup>`)} · ${FM(`P = ${F('W', 't')}`)}`, 'Toplam enerji korunur; sürtünme varsa bir kısmı ısıya dönüşür.'] } },
  ] });
  const g4 = gorev(s4, { yk: 'TYT4-g1', no: 1, icon: '🔴', name: 'Topu rampadan indir', task: 'Rampadan bırakılan topun enerjilerini ve hızını hesaplayın.', steps: [
    { sub: '4 kg\'lık top 5 m yüksekliğinde duruyor.', go: '▶︎ Başlat' },
    { q: { t: '4 kg\'lık topun 5 m yükseklikteki <b>potansiyel enerjisi</b> kaç J\'dür? (g = 10 m/s²)', o: ['200 J', '20 J', '9 J', '2000 J'], f: ['e4b0', 'e4h'],
      s: [`${FM('E<sub>p</sub> = m · g · h')} = 4 · 10 · 5 = <em>200 J</em> ✓`], n: ['Ep, seçilen yere (yer seviyesi) göre ölçülür; yer seviyesinde Ep = 0 kabul edilir.'] } },
    { do: S => { S.hedef = RL / 2; S.kos = 1; }, sub: 'Top yarı yüksekliğe iniyor…', until: S => !S.kos },
    { q: { t: 'Sürtünme yok. Top 2,5 m yüksekliğe indiğinde <b>kinetik enerjisi</b> kaç J\'dür?', o: ['100 J', '200 J', '50 J', '0'], f: ['e4b0', 'e4b1'],
      s: ['Bu noktada Ep = 4 · 10 · 2,5 = 100 J', `E<sub>k</sub> = E<sub>toplam</sub> − E<sub>p</sub> = 200 − 100 = <em>100 J</em> ✓`], n: ['Sürtünme yoksa mekanik enerji (Ep + Ek) her noktada aynıdır.'] } },
    { do: S => { S.hedef = 12.5; S.kos = 1; }, sub: 'Top yere iniyor…', until: S => !S.kos },
    { q: { t: 'Sürtünme yoksa top yere kaç m/s hızla varır?', o: ['10 m/s', '100 m/s', '5 m/s', '20 m/s'], lab: 'v = ?', f: ['e4v'],
      s: ['§1. YOL · enerji korunumu', `m g h = ${F('1', '2')} m v² → v = ${SQ('2 · 10 · 5')} = <em>10 m/s</em> ✓`, '§2. YOL · kinetik enerjiden', `${F('1', '2')} · 4 · v² = 200 → v² = 100 → <em>v = 10 m/s</em> ✓`], n: ['Hız kütleye bağlı değildir; 1 kg\'lık top da 10 m/s ile varır.'] } },
    { do: S => { S.x = 0; S.kayip = 0.36; S.hedef = 12.5; S.kos = 1; }, sub: 'Bu kez rampa sürtünmeli…', until: S => !S.kos },
    { q: { t: 'Sürtünmeli rampada top yere 8 m/s ile varıyor. Kaç J enerji <b>ısıya</b> dönüşmüştür?', o: ['72 J', '128 J', '200 J', '36 J'], f: ['e4b2', 'e4b1'],
      s: [`E<sub>k</sub> = ${F('1', '2')} · 4 · 8² = 128 J`, `Isı = 200 − 128 = <em>72 J</em> ✓`], n: ['Sürtünme kuvvetinin yaptığı iş kadar mekanik enerji ısıya dönüşür; toplam enerji yine korunur.'] } },
  ] });
  konuEkle('TYT', 'Enerji', { dersler: [d4], gorevler: [g4] });

  // =====================================================================
  // TYT 5 · ISI VE SICAKLIK — ocakta ısınan su ve termometre
  // =====================================================================
  const s5 = sahne({ icon: '🌡️', cam: [[1, 4.5, 10], [0.6, 1.8, 0]], plate: [12, 7, 0, 0],
    data: [['Suyun öz ısısı', 'c = 1 cal/g·°C'], ['Buzun erime ısısı', 'L = 80 cal/g']],
    S0: () => ({ T: 20, Th: 20, m: 200, Q: 0, isit: 0, guc: 2000, buz: 0 }),
    kur(g) {
      const ocak = FZ.ocak(g, 1.75); const alev = ocak.alev;   // gerçek ocak: düğmeli, ızgaralı; alev mavi gaz halkası
      silindir(g, 1, 0.9, 2, 0xbfdbfe, 0, 1.6, 0, { op: 0.3, edge: false });
      const su = silindir(g, 0.95, 0.88, 1, 0x38bdf8, 0, 1.2, 0, { op: 0.8, edge: false });
      silindir(g, 0.12, 0.12, 3, 0xf8fafc, 1.7, 1.9, 0, { op: 0.6 });
      const civa = silindir(g, 0.07, 0.07, 1, 0xef4444, 1.7, 0.9, 0.02, { edge: false });
      FZ.olcek(g, 1.92, 0.05, [0, 20, 40, 60, 80, 100].map(T => [0.75 + T / 100 * 2.3, `${T}`]), 1, 0.22); FZ.yazi(g, '°C', 1.7, 3.6, 0.05, 0.22);
      const buzlar = [0, 1, 2].map(i => { const b_ = kutu(g, 0.35, 0.35, 0.35, 0xbae6fd, -0.4 + i * 0.4, 1.8, 0.2); b_.material.emissive = new THREE.Color(0x0ea5e9); b_.material.emissiveIntensity = 0.25; return b_; });
      kart('e5T', '', '#ef4444'); kart('e5Q', '', '#f97316');
      return { alev, su, civa, buzlar };
    },
    tick(S, dt, o) {
      if (S.isit) { const dQ = S.guc * dt; S.Q += dQ; if (S.buz > 0) { S.buz = Math.max(0, S.buz - dQ / 80); } else S.T += dQ / (S.m * 1); if (S.T >= S.Th) { S.T = S.Th; S.isit = 0; } }
      o.alev.visible = !!S.isit; o.alev.scale.y = 0.8 + 0.4 * Math.random();
      const h = Math.min(2.6, 0.3 + S.T / 100 * 2.3); o.civa.scale.y = h; o.civa.position.y = 0.45 + h / 2;
      const k = Math.min(1, (S.T - 20) / 80); o.su.material.color.setRGB(0.22 + 0.6 * k, 0.74 - 0.4 * k, 0.97 - 0.6 * k);
      o.buzlar.forEach((b, i) => { b.visible = S.buz > i * (S.buz0 || 1) / 3 + 0.001; });
      FZ.setTag('e5T', `${fs(S.T)} °C`); FZ.show('e5T', V3(1.7, 3.6, 0), 1);
      FZ.setTag('e5Q', `Q = ${Math.round(S.Q)} cal`); FZ.show('e5Q', V3(-1.6, 3, 0), S.Q > 0 ? 1 : 0);
    },
    qp: () => V3(0, 3.4, 0) });
  const d5 = ders(s5, { yk: 'TYT5-d1', no: 1, icon: '🔥', name: 'Isı mı, sıcaklık mı?', task: 'Isı ile sıcaklık farkı, Q = m·c·ΔT, hal değişimi ve ısıl denge.', steps: [
    { k: { tur: 'merak', b: 'Aynı ocakta 1 L su mu, 2 L su mu önce kaynar?', m: ['Cevabı tahmin etmek kolay. Ama "neden" sorusu bizi ısı ile sıcaklığın farkına götürür.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Isı ve sıcaklık', m: ['<em>Sıcaklık</em>: taneciklerin ortalama hareket enerjisinin ölçüsü (°C, K). Termometreyle ölçülür.', '<em>Isı</em>: sıcaklık farkı yüzünden aktarılan enerji (cal, J). Sıcaktan soğuğa akar.', `${FM('Q = m · c · ΔT')} · c: öz ısı (suyun c = 1 cal/g·°C)`] } },
    { do: S => { S.m = 200; S.Th = 70; }, p: { t: 'Ocak her saniye aynı ısıyı veriyor. 200 g yerine <b>400 g</b> su olsaydı aynı sıcaklık artışı için ne kadar süre gerekirdi?', o: ['Yarısı kadar', 'Aynı süre', '2 katı', '4 katı'], d: 2 } },
    { sub: 'Önce 200 g suyu 20 °C\'tan 70 °C\'a ısıtalım.', go: '▶︎ Isıt' },
    { do: S => { S.isit = 1; }, sub: 'Su ısınıyor…', until: S => !S.isit },
    { k: { tur: 'gozlem', sonuc: true, b: 'Q = m · c · ΔT', f: ['e5Q', 'e5T'], m: ['Q = 200 · 1 · 50 = 10 000 cal verildi.', 'Kütle 2 katına çıkarsa aynı ΔT için 2 kat ısı, yani <em>2 kat süre</em> gerekir.'] } },
    { x: { b: 'Kütleyi değiştir', m: ['Aynı 10 000 cal ısı farklı kütlelerde suya verilseydi sıcaklık ne kadar artardı?'],
      kay: [{ ad: 'm', etiket: 'Su kütlesi (m)', min: 100, max: 500, adim: 50, deger: 200, birim: 'g', set: () => {} }],
      olc: S => `ΔT = ${F('Q', 'm · c')} = ${F('10 000', `${S._m} · 1`)} = <em>${fs(10000 / S._m)} °C</em><br>Kütle arttıkça aynı ısıyla sıcaklık daha az artar.` } },
    { k: { tur: 'dikkat', b: 'Isı ile sıcaklık aynı şey değildir', m: ['Bir bardak kaynar su ile bir kazan kaynar suyun sıcaklığı aynıdır (100 °C) ama kazandaki suyun verebileceği ısı çok daha fazladır.', 'Hal değişimi sırasında ısı alındığı hâlde <em>sıcaklık değişmez</em>.'] } },
    { do: S => { S.T = 0; S.Th = 0; S.Q = 0; S.buz = 60; S.buz0 = 60; S.m = 60; }, k: { tur: 'kavram', b: 'Hal değişimi', m: [`Erime/donma, kaynama/yoğuşma sırasında: ${FM('Q = m · L')} (L: hal değişim ısısı)`, 'Buzun erime ısısı L = 80 cal/g. Şimdi 0 °C\'taki 60 g buzu eritelim.'] } },
    { do: S => { S.isit = 1; S.Th = 0.001; }, sub: 'Buz eriyor; termometre 0 °C\'ta sabit…', until: S => S.buz <= 0 },
    { do: S => { S.isit = 0; }, k: { tur: 'ornek', b: 'Çözümlü örnek', f: ['e5Q', 'e5T'], m: ['60 g buzu eritmek için: Q = m · L = 60 · 80 = <em>4800 cal</em>', 'Bu sürede sıcaklık hep 0 °C kaldı: verilen ısı tanecikler arası bağları koparmaya harcandı.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('Q = m · c · ΔT')} · ${FM('Q = m · L')} · ısıl dengede: alınan ısı = verilen ısı`, 'Isı enerjidir; sıcaklık ortalama hareket enerjisinin göstergesidir.'] } },
  ] });
  const g5 = gorev(s5, { yk: 'TYT5-g1', no: 1, icon: '☕', name: 'Çayı doğru sıcaklıkta demle', task: 'Isı miktarını, sıcaklık değişimini ve karışım sıcaklığını hesaplayın.', data: [['Suyun öz ısısı', 'c = 1 cal/g·°C'], ['Buzun erime ısısı', 'L = 80 cal/g']], steps: [
    { do: S => { S.m = 300; S.Th = 80; }, sub: 'Demlikte 300 g, 20 °C su var.', go: '▶︎ Başlat' },
    { q: { t: '300 g su 20 °C\'tan 80 °C\'a ısıtılacak. Kaç cal ısı gerekir?', o: ['18 000 cal', '6 000 cal', '24 000 cal', '1 800 cal'], lab: 'Q = ?', f: ['e5T'],
      s: [`${FM('Q = m · c · ΔT')} = 300 · 1 · (80 − 20) = <em>18 000 cal</em> ✓`], n: ['ΔT = son sıcaklık − ilk sıcaklık.'] } },
    { do: S => { S.isit = 1; }, sub: 'Su ısınıyor…', until: S => !S.isit },
    { q: { t: 'Aynı 18 000 cal ısı 600 g suya verilseydi sıcaklığı kaç °C artardı?', o: ['30 °C', '60 °C', '120 °C', '15 °C'],
      s: [`ΔT = ${F('Q', 'm · c')} = ${F('18 000', '600 · 1')} = <em>30 °C</em> ✓`, 'Kütle 2 katına çıktı → ΔT yarıya indi.'], n: ['Aynı ısı, kütle arttıkça daha az sıcaklık artışı sağlar (ters orantı).'] } },
    { q: { t: '100 g 80 °C su ile 300 g 20 °C su karıştırılıyor. Isı kaybı yoksa denge sıcaklığı kaç °C\'tır?', o: ['35 °C', '50 °C', '40 °C', '30 °C'],
      s: ['§1. YOL · alınan ısı = verilen ısı', '100 · 1 · (80 − T) = 300 · 1 · (T − 20) → <em>T = 35 °C</em> ✓', '§2. YOL · kütle ağırlıklı ortalama', `T = ${F('100 · 80 + 300 · 20', '400')} = ${F('14 000', '400')} = <em>35 °C</em> ✓`],
      n: ['Aynı maddeler karışınca denge sıcaklığı kütle ağırlıklı ortalamadır; kütlesi büyük olanın sıcaklığına daha yakındır.'] } },
    { do: S => { S.T = 0; S.Th = 0.001; S.Q = 0; S.buz = 50; S.buz0 = 50; }, q: { t: '0 °C\'taki 50 g buzu tamamen eritmek için kaç cal ısı gerekir? (L = 80 cal/g)', o: ['4 000 cal', '50 cal', '80 cal', '400 cal'],
      s: [`${FM('Q = m · L')} = 50 · 80 = <em>4 000 cal</em> ✓`, 'Erime boyunca sıcaklık 0 °C\'ta sabit kalır.'], n: ['Hal değişiminde ΔT = 0 olduğu için Q = m·c·ΔT kullanılmaz.'] } },
    { do: S => { S.isit = 1; }, sub: 'Buz eriyor…', until: S => S.buz <= 0 },
  ] });
  konuEkle('TYT', 'Isı ve Sıcaklık', { dersler: [d5], gorevler: [g5] });

  // =====================================================================
  // TYT 6 · ELEKTROSTATİK — iletken kürelerin dokunması
  // =====================================================================
  const s6 = sahne({ icon: '🎈', cam: [[0, 4, 11], [0, 1.8, 0]], plate: [12, 6, 0, 0],
    data: [['Küreler', 'özdeş, iletken'], ['Coulomb', 'F = k·q₁·q₂ / d²']],
    S0: () => ({ qa: 6, qb: -2, d: 4, dok: 0, faz: 0, ra: 0.6, rb: 0.6 }),
    kur(g) {
      const ka = FZ.metalTop(g, 0.6, -2, 2, 0), kb = FZ.metalTop(g, 0.6, 2, 2, 0);   // iletken metal küreler
      const sa = FZ.yalitkanAyak(g, -2, 1.45), sb = FZ.yalitkanAyak(g, 2, 1.45);     // yalıtkan (pleksi) ayaklar
      kart('e6a', '', '#3b82f6'); kart('e6b', '', '#3b82f6'); etiket('e6F', 'F', '#ec4899'); etiket('e6F2', 'F', '#ec4899');
      return { ka, kb, sa, sb, fa: ok(0xec4899, 'e6F'), fb: ok(0xec4899, 'e6F2') };
    },
    tick(S, dt, o) {
      if (S.dok && S.faz < 2) { S.faz = Math.min(2, S.faz + dt * 0.6); if (S.faz >= 1 && !S.paylasti) { const top_ = S.qa + S.qb; S.qa = top_ * S.ra / (S.ra + S.rb); S.qb = top_ - S.qa; S.paylasti = 1; FZ.SFX.snap(); } }
      const ayrik = S.dok ? (S.faz < 1 ? 1 - S.faz : S.faz - 1) : 1, x = (S.ra + S.rb) / 2 + 0.01 + ayrik * (S.d / 2 - (S.ra + S.rb) / 2);
      o.ka.scale.setScalar(S.ra / 0.6); o.kb.scale.setScalar(S.rb / 0.6);
      o.ka.position.set(-x - (S.ra - S.rb) / 2, 2, 0); o.kb.position.set(x - (S.ra - S.rb) / 2, 2, 0); o.sa.position.x = o.ka.position.x; o.sb.position.x = o.kb.position.x;
      const renk = q => q > 0 ? 0xef4444 : q < 0 ? 0x3b82f6 : 0x000000; [[o.ka, S.qa], [o.kb, S.qb]].forEach(([k, q]) => { k.material.emissive.set(renk(q)); k.material.emissiveIntensity = Math.min(0.55, 0.12 + Math.abs(q) * 0.06); });
      const yz = q => (q > 0 ? '+' : '') + fs(q) + 'q';
      FZ.setTag('e6a', yz(S.qa)); FZ.setTag('e6b', yz(S.qb)); FZ.show('e6a', o.ka.position.clone().add(V3(0, S.ra + 0.6, 0)), 1); FZ.show('e6b', o.kb.position.clone().add(V3(0, S.rb + 0.6, 0)), 1);
      if (ayrik > 0.5 && S.qa && S.qb) { const it = S.qa * S.qb > 0, L = Math.min(2.2, 0.35 * Math.abs(S.qa * S.qb) / (x * x));
        const da = V3(it ? -1 : 1, 0, 0); FZ.setArrow(o.fa, o.ka.position.clone().add(V3(da.x * S.ra, 0, 0.7)), da, L); FZ.setArrow(o.fb, o.kb.position.clone().add(V3(-da.x * S.rb, 0, 0.7)), V3(-da.x, 0, 0), L);
        FZ.show('e6F', o.ka.position.clone().add(V3(da.x * (S.ra + L + 0.3), 0, 0.7)), 1); FZ.show('e6F2', o.kb.position.clone().add(V3(-da.x * (S.rb + L + 0.3), 0, 0.7)), 1); }
    },
    qp: () => V3(0, 3.6, 0) });
  const d6 = ders(s6, { yk: 'TYT6-d1', no: 1, icon: '⚡', name: 'Yükler nasıl taşınır?', task: 'Elektrik yükü, iletken ve yalıtkan, dokunma ile yüklenme, Coulomb kuvveti.', steps: [
    { k: { tur: 'merak', b: 'Kazağı çıkarırken neden çıtırtı duyarız?', m: ['Sürtünen yüzeyler arasında küçük bir şey yer değiştirir: <em>elektronlar</em>.', 'Bu derste yüklerin nasıl aktarıldığını ve birbirini nasıl ittiğini/çektiğini göreceğiz.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Yük ve yüklenme', m: ['Atomda proton (+) ve elektron (−) vardır. Yüklenmede yalnız <em>elektronlar</em> yer değiştirir.', 'Elektron kaybeden cisim (+), elektron kazanan (−) yüklenir. Yük yoktan var olmaz: <em>yük korunur</em>.', 'İletkenlerde (metal) elektronlar serbestçe dolaşır; yalıtkanlarda (cam, plastik) dolaşamaz.'] } },
    { p: { t: 'Özdeş iki metal kürenin yükleri +6q ve −2q. Dokundurulup ayrılırlarsa yükleri ne olur?', o: ['+6q ve −2q (değişmez)', '+4q ve 0', '+2q ve +2q', '+3q ve −1q'], d: 2 } },
    { sub: 'Küreleri dokunduralım.', go: '▶︎ Dokundur' },
    { do: S => { S.dok = 1; }, sub: 'Elektronlar akıyor…', until: S => S.faz >= 2 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Dokunma ile yüklenme', f: ['e6a', 'e6b'], m: ['Toplam yük korunur: +6q − 2q = +4q', 'Özdeş küreler toplamı <em>eşit paylaşır</em>: her biri +2q. Artık ikisi de (+) → birbirini <em>iter</em>.', 'Farklı büyüklükteki kürelerde yük yarıçapla orantılı paylaşılır.'] } },
    { k: { tur: 'kavram', b: 'Coulomb kuvveti', f: ['e6F', 'e6F2'], m: [`${FM(`F = k · ${F('q<sub>1</sub> · q<sub>2</sub>', 'd<sup>2</sup>')}`)} · aynı işaretli yükler iter, zıt işaretliler çeker.`, 'Kuvvetler eşit büyüklükte ve zıt yönlüdür (etki-tepki).'] } },
    { x: { b: 'Uzaklığı değiştir', m: ['Küreler arasındaki uzaklığı değiştirin; kuvvet nasıl değişiyor?'],
      kay: [{ ad: 'd', etiket: 'Uzaklık (d)', min: 2, max: 6, adim: 1, deger: 4, birim: 'birim', set: (S, v) => { S.d = v; } }],
      olc: S => `F ∝ ${F('1', 'd<sup>2</sup>')} → d = 2 birimdeki kuvvete göre <em>${fs(4 / (S._d * S._d))}</em> katı<br>Uzaklık 2 katına çıkınca kuvvet <em>4\'te 1</em>\'ine iner.` } },
    { k: { tur: 'dikkat', b: 'Pozitif yüklenme proton kazanmak değildir', m: ['Sık yanlış: "Cisim (+) yüklendiyse proton almıştır." Protonlar çekirdekte sabittir.', 'Doğrusu: (+) yüklenen cisim <em>elektron kaybetmiştir</em>.'] } },
    { k: { tur: 'ornek', b: 'Çözümlü örnek', m: ['İki yük arasındaki kuvvet F. Yüklerden biri 2 katına, uzaklık 2 katına çıkarılıyor.', `F' = k · ${F('2q<sub>1</sub> · q<sub>2</sub>', '(2d)<sup>2</sup>')} = ${F('2', '4')} F = <em>${F('F', '2')}</em>`] } },
    { k: { tur: 'ozet', b: 'Özet', m: ['Yalnız elektronlar aktarılır; toplam yük korunur.', `Özdeş kürelerde dokunma: yük eşit paylaşılır · ${FM(`F = k ${F('q<sub>1</sub> q<sub>2</sub>', 'd<sup>2</sup>')}`)}`] } },
  ] });
  const g6 = gorev(s6, { yk: 'TYT6-g1', no: 1, icon: '🧲', name: 'Yükleri paylaştır', task: 'Dokunma ile yük dağılımını ve Coulomb kuvvetini hesaplayın.', steps: [
    { do: S => { S.qa = 8; S.qb = -2; }, sub: 'Özdeş iki küre: +8q ve −2q.', go: '▶︎ Başlat' },
    { q: { t: 'Özdeş küreler (+8q ve −2q) dokundurulup ayrılıyor. Her birinin son yükü nedir?', o: ['+3q', '+5q', '+4q', '+6q'], f: ['e6a', 'e6b'],
      s: ['Toplam yük: +8q − 2q = +6q (korunur)', `Özdeş küreler eşit paylaşır: ${F('+6q', '2')} = <em>+3q</em> ✓`], n: ['Dokunma sonunda iletkenlerin potansiyelleri eşitlenir; özdeş kürelerde bu, yüklerin eşitlenmesi demektir.'] } },
    { do: S => { S.dok = 1; S.faz = 0; S.paylasti = 0; }, sub: 'Küreler dokunuyor…', until: S => S.faz >= 2 },
    { q: { t: 'İki yük arasındaki uzaklık <b>yarıya</b> indirilirse aralarındaki kuvvet kaç katına çıkar?', o: ['4 katına', '2 katına', 'Yarısına', 'Değişmez'], f: ['e6F', 'e6F2'],
      s: [`F ∝ ${F('1', 'd<sup>2</sup>')} → d yarıya inince d² dörtte birine iner`, '<em>F 4 katına</em> çıkar ✓'], n: ['Ters kare kuralı: uzaklık k katına çıkınca kuvvet k² katına iner.'] } },
    { do: S => { S.dok = 0; S.qa = 9; S.qb = 0; S.ra = 0.45; S.rb = 0.9; S.paylasti = 0; }, q: { t: 'Yarıçapları r ve 2r olan iletken kürelerden küçüğünün yükü +9q, büyüğü yüksüz. Dokundurulup ayrılınca büyük kürenin yükü ne olur?', o: ['+6q', '+3q', '+4,5q', '+9q'], f: ['e6a', 'e6b'],
      s: ['Toplam: +9q. Yük yarıçapla orantılı paylaşılır: r : 2r = 1 : 2', `Büyük küre: ${F('2', '3')} · 9q = <em>+6q</em> ✓ (küçük: +3q)`], n: ['Dokunan iletkenlerin potansiyelleri eşitlenir: V = kq/r → q, r ile orantılıdır.'] } },
    { do: S => { S.dok = 1; S.faz = 0; }, sub: 'Farklı büyüklükteki küreler dokunuyor…', until: S => S.faz >= 2 },
    { q: { t: 'Yüklü bir iletken kürenin fazla yükü nerede toplanır?', o: ['Dış yüzeyinde', 'Merkezinde', 'İçinde düzgün dağılır', 'Yalnız bir noktada'],
      s: ['Aynı işaretli fazla yükler birbirini iter ve birbirinden en uzak yere, <em>dış yüzeye</em> gider ✓', 'Bu yüzden iletkenin içinde elektrik alan sıfırdır (Faraday kafesi).'], n: ['Yalıtkanda ise yük sürtülen yerde kalır, dağılmaz.'] } },
  ] });
  konuEkle('TYT', 'Elektrostatik', { dersler: [d6], gorevler: [g6] });

  // =====================================================================
  // TYT 7 · ELEKTRİK VE MANYETİZMA — pil, ampuller, pusula
  // =====================================================================
  const YOL = [V3(-3, 0.3, 0), V3(-3, 3.3, 0), V3(3, 3.3, 0), V3(3, 0.3, 0), V3(-3, 0.3, 0)];
  const yolNokta = u => { u = ((u % 4) + 4) % 4; const i = Math.floor(u); return YOL[i].clone().lerp(YOL[i + 1], u - i); };
  const s7 = sahne({ icon: '💡', cam: [[0, 4.5, 11], [0, 1.8, 0]], plate: [12, 6, 0, 0],
    data: [['Ohm yasası', 'V = I · R']],
    S0: () => ({ V: 12, R1: 4, R2: 0, seri: 0, ac: 0, u: 0, pus: 0 }),
    kur(g) {
      for (let i = 0; i < 4; i++) { const a = YOL[i], b = YOL[i + 1], L = a.distanceTo(b), m = silindir(g, 0.05, 0.05, L, 0x94a3b8, (a.x + b.x) / 2, (a.y + b.y) / 2, 0, { edge: false });
        if (a.x === b.x) {} else m.rotation.z = Math.PI / 2; }
      const pil = FZ.pil(g, 1.3); pil.position.set(-3, 1.8, 0);   // (+) ucu yukarıda
      const amp = [-1, 1].map(x => { const a = FZ.ampul(g, 1.1); a.position.set(x, 3.3, 0); return a; });
      const el = []; for (let i = 0; i < 16; i++) el.push(top(g, 0.07, 0xef4444, 0, 0, 0, { edge: false, cast: false }));
      const pusula = new THREE.Group(); pusula.position.set(0, 0.32, 1.3); g.add(pusula);
      const ig1 = FZ.mesh(new THREE.ConeGeometry(0.1, 0.6, 8), 0xef4444, { cast: false }); ig1.rotation.x = -Math.PI / 2; ig1.position.z = -0.3; pusula.add(ig1);
      const ig2 = FZ.mesh(new THREE.ConeGeometry(0.1, 0.6, 8), 0xf8fafc, { cast: false }); ig2.rotation.x = Math.PI / 2; ig2.position.z = 0.3; pusula.add(ig2);
      kart('e7I', '', '#dc2626'); kart('e7a', '', '#F5C400'); kart('e7b', '', '#F5C400');
      return { amp, el, pusula };
    },
    tick(S, dt, o) {
      const Rt = S.R1 + (S.seri ? S.R2 : 0), I = S.ac ? S.V / Rt : 0;
      S.u += I * dt * 0.25; o.el.forEach((e, i) => { e.position.copy(yolNokta(-(S.u + i / 4))); e.visible = !!S.ac; });   // elektronlar (−'den +'ya) akım yönüne ters
      o.amp[1].visible = !!S.seri;
      const P1 = I * I * S.R1; o.amp.forEach((a, i) => { const P = i ? I * I * S.R2 : P1; a.parla(Math.min(1, P / 36)); });
      const hedef = S.pus && I > 0 ? -Math.PI / 2 * Math.min(1, I / 3) : 0; o.pusula.rotation.y += (hedef - o.pusula.rotation.y) * Math.min(1, dt * 4);
      FZ.setTag('e7I', `I = ${fs(I)} A`); FZ.show('e7I', V3(3.6, 1.8, 0), S.ac ? 1 : 0);
      FZ.setTag('e7a', `R<sub>1</sub> = ${S.R1} Ω`); FZ.show('e7a', V3(S.seri ? -1 : -1, 4.1, 0), 1);
      FZ.setTag('e7b', `R<sub>2</sub> = ${S.R2} Ω`); FZ.show('e7b', V3(1, 4.1, 0), S.seri ? 1 : 0);
    },
    qp: () => V3(0, 4.6, 0) });
  const d7 = ders(s7, { yk: 'TYT7-d1', no: 1, icon: '🔋', name: 'Akım neden ampulü yakar?', task: 'Akım, potansiyel farkı, direnç, Ohm yasası, seri bağlama, güç ve akımın manyetik etkisi.', steps: [
    { k: { tur: 'merak', b: 'İki ampul seri bağlanınca neden sönük yanar?', m: ['Evdeki lambaları düşünün: biri yanınca diğerleri sönmez. Neden?', 'Önce akımın ne olduğunu görelim.'], dugme: 'Başlayalım ▶︎' } },
    { k: { tur: 'kavram', b: 'Akım, gerilim, direnç', m: ['Akım (I): birim zamanda geçen yük, amper (A). Pil, uçları arasında <em>potansiyel farkı</em> (V, volt) oluşturur.', `Direnç (R, ohm Ω) akıma karşı koymadır. ${FM('V = I · R')} (Ohm yasası)`, 'Mavi noktalar elektronlardır; akım yönü elektron hareketinin <em>tersidir</em>.'] } },
    { sub: 'Anahtarı kapatalım.', go: '▶︎ Anahtarı kapat' },
    { do: S => { S.ac = 1; }, sub: '12 V\'luk pil, 4 Ω\'luk ampul.', wait: 2.5 },
    { k: { tur: 'gozlem', b: 'Ohm yasası', f: ['e7I'], m: [`I = ${F('V', 'R')} = ${F('12', '4')} = 3 A`, `Güç: ${FM('P = V · I = I<sup>2</sup> · R')} = 12 · 3 = 36 W`] } },
    { do: S => { S.R2 = 4; }, p: { t: 'Aynı ampulden bir tane daha <b>seri</b> bağlanırsa ilk ampulün parlaklığı ne olur?', o: ['Artar', 'Değişmez', 'Azalır', 'Söner'], d: 2 } },
    { do: S => { S.seri = 1; }, sub: 'İki ampul seri bağlandı.', wait: 2.5 },
    { k: { tur: 'gozlem', sonuc: true, b: 'Seri bağlama', f: ['e7I', 'e7a', 'e7b'], m: [`Seri: ${FM('R<sub>eş</sub> = R<sub>1</sub> + R<sub>2</sub>')} = 8 Ω → I = ${F('12', '8')} = 1,5 A`, 'Her ampulün gücü I²R = 9 W (önce 36 W) → sönük yanar.', 'Evlerde lambalar <em>paralel</em> bağlıdır: her biri pilin tam gerilimini alır.'] } },
    { x: { b: 'Gerilimi değiştir', m: ['Pilin gerilimini değiştirin; akım ve ampul gücü nasıl değişiyor?'],
      kay: [{ ad: 'V', etiket: 'Gerilim (V)', min: 3, max: 24, adim: 3, deger: 12, birim: 'V', set: (S, v) => { S.V = v; } }],
      olc: S => `I = ${F('V', 'R<sub>eş</sub>')} = ${F(S._V, 8)} = <em>${fs(S._V / 8)} A</em> · her ampul P = I²R = <em>${fs(S._V * S._V / 64 * 4)} W</em><br>V 2 katına → I 2 katına → P <em>4 katına</em>.` } },
    { do: S => { S.V = 12; S._V = 12; S.pus = 1; }, k: { tur: 'kavram', b: 'Akımın manyetik etkisi', m: ['Pusula iğnesi telin altında: akım geçince <em>sapar</em> (Oersted deneyi).', 'Akım geçen tel çevresinde manyetik alan oluşturur. Akım yönü değişirse sapma yönü de değişir.'] } },
    { k: { tur: 'dikkat', b: 'Akım devrede "tükenmez"', m: ['Sık yanlış: "İlk ampul akımın bir kısmını harcar, ikinciye az kalır."', 'Seri devrede akım her noktada <em>aynıdır</em>. Ampullerde harcanan akım değil, <em>enerjidir</em>.'] } },
    { k: { tur: 'ozet', b: 'Özet', m: [`${FM('V = I · R')} · seri: ${FM('R<sub>eş</sub> = R<sub>1</sub> + R<sub>2</sub>')} · paralel: ${FM(`${F('1', 'R<sub>eş</sub>')} = ${F('1', 'R<sub>1</sub>')} + ${F('1', 'R<sub>2</sub>')}`)} · ${FM('P = V · I')}`, 'Akım geçen tel manyetik alan oluşturur.'] } },
  ] });
  const g7 = gorev(s7, { yk: 'TYT7-g1', no: 1, icon: '🔌', name: 'Devreyi kur', task: 'Ohm yasasıyla akım, eşdeğer direnç, güç ve enerjiyi hesaplayın.', steps: [
    { do: S => { S.V = 12; S.R1 = 4; }, sub: '12 V pil ve 4 Ω direnç.', go: '▶︎ Anahtarı kapat' },
    { do: S => { S.ac = 1; }, q: { t: '12 V\'luk pile 4 Ω\'luk direnç bağlanıyor. Devreden geçen akım kaç A\'dir?', o: ['3 A', '48 A', '0,33 A', '16 A'], lab: 'I = ?', f: ['e7I', 'e7a'],
      s: [`${FM('V = I · R')} → I = ${F('V', 'R')} = ${F('12', '4')} = <em>3 A</em> ✓`], n: ['Ohm yasası: aynı direnç için akım gerilimle doğru orantılıdır.'] } },
    { do: S => { S.R1 = 2; S.R2 = 4; S.seri = 1; }, q: { t: '2 Ω ve 4 Ω\'luk dirençler 12 V\'luk pile <b>seri</b> bağlanıyor. 4 Ω\'luk direncin uçları arasındaki gerilim kaç V\'tur?', o: ['8 V', '4 V', '12 V', '6 V'], f: ['e7a', 'e7b', 'e7I'],
      s: ['R<sub>eş</sub> = 2 + 4 = 6 Ω → I = 12 / 6 = 2 A', `V<sub>2</sub> = I · R<sub>2</sub> = 2 · 4 = <em>8 V</em> ✓ (2 Ω\'da 4 V)`], n: ['Seri bağlamada gerilim dirençlerle doğru orantılı paylaşılır; büyük direnç büyük gerilim alır.'] } },
    { q: { t: '3 Ω ve 6 Ω\'luk dirençler <b>paralel</b> bağlanıyor. Eşdeğer direnç kaç Ω\'dur?', o: ['2 Ω', '9 Ω', '4,5 Ω', '18 Ω'],
      s: ['§1. YOL · ters toplam', `${F('1', 'R<sub>eş</sub>')} = ${F('1', '3')} + ${F('1', '6')} = ${F('3', '6')} → <em>R<sub>eş</sub> = 2 Ω</em> ✓`, '§2. YOL · çarpım bölü toplam', `R<sub>eş</sub> = ${F('3 · 6', '3 + 6')} = ${F('18', '9')} = <em>2 Ω</em> ✓`], n: ['Paralel eşdeğer direnç her zaman en küçük dirençten de küçüktür.'] } },
    { q: { t: '6 V\'luk pille çalışan bir lambadan 0,5 A akım geçiyor. Lamba 10 dakikada kaç J elektrik enerjisi harcar?', o: ['1800 J', '3 J', '30 J', '180 J'],
      s: [`${FM('P = V · I')} = 6 · 0,5 = 3 W`, `${FM('E = P · t')} = 3 · 600 = <em>1800 J</em> ✓`], n: ['Süreyi saniyeye çevirmeyi unutmayın: 10 dk = 600 s.'] } },
  ] });
  konuEkle('TYT', 'Elektrik ve Manyetizma', { dersler: [d7], gorevler: [g7] });
})();
