// Kitap soru bankası · TYT (4): son eksik soru tipleri
// 1) Dokundurmalı elektroskop durumları (anim4 elektroskop sahnesi, S.dok)
// 2) Kuvvet düzeneği: duvara bastırılan kitap, masaya bastırılan/çekilen kutu, ipe asılı cisim, eğik düzlem — oklar gerçek oranlı,
//    tepki kuvveti yüzeye dik ve yüzeyden cisme doğru (mg'nin tersi olmak zorunda değil)
// 3) Tablo soruları: kitaptaki "tabloyu yorumla" tipi sorular, tablo sahnedeki tahtada gösterilir
// Benim Hocam TYT kitap taramasındaki SORU TİPLERİ örnek alınmıştır; sorular, sayılar ve durumlar özgündür.
(function () {
  const { V3, sahne, gorev, kutu, THREE } = FZ, SH = FZ.SAHNE || {};
  const D = o => S => Object.assign(S, o);
  const hazirla = (steps, gizle) => steps.forEach(st => { if (st.goster && st.q && !st.q.goster) st.q.goster = st.goster; if (st.q) { st.q.kartGizle = true; if (gizle) st.q.gizle = (st.q.gizle || []).concat(gizle); if (!st.sub) st.sub = steps[0].sub; } });

  // ======================= 1) DOKUNDURMALI ELEKTROSKOP =======================
  const dk = (eq, cq, payE) => ({ mod: 'elskop', eq, cub: Math.sign(cq) || 1, cq, payE, dok: 1, dokuldu: 0, yak: 0, ey: 0 }), dkG = S => { S.yak = 1.12; };
  if (SH.elLab) { const st = [
    { do: D(dk(0, -6, -3)), sub: 'Elektroskop ve yüklü iletken çubuk (dokundurulacak).', go: '▶︎ Başla' },
    { do: D(dk(0, -6, -3)), goster: dkG, q: { t: 'Nötr elektroskobun topuzuna −6q yüklü iletken dokundurulup çekiliyor. Elektroskoba 3q\'luk yük geçiyor. Son durumda yapraklar nasıldır?', o: ['(−) yükle açık', '(+) yükle açık', 'Kapalı', 'Topuz (−), yapraklar nötr'],
      b: ['Dokunma ile elektriklenmede cisimler AYNI işaretle yüklenir; toplam yük korunur.'], s: ['Elektroskop −3q ile yüklenir → yük yapraklara da dağılır → <em>(−) yükle açık</em> ✓'] } },
    { do: D(dk(4, -4, 0)), goster: dkG, q: { t: '+4q yüklü elektroskobun topuzuna −4q yüklü özdeş iletken dokundurulup çekiliyor (yük eşit paylaşılıyor). Yapraklar ne olur?', o: ['Kapanır', 'Daha çok açılır', '(−) yükle açılır', 'Değişmez'],
      b: ['Dokunan özdeş iletkenler toplam yükü eşit paylaşır.'], s: ['Toplam: +4q − 4q = 0 → her biri 0 → yapraklar <em>kapanır</em> ✓'] } },
    { do: D(dk(2, -8, -3)), goster: dkG, q: { t: '+2q yüklü elektroskoba −8q yüklü özdeş iletken dokundurulup çekiliyor. Dokunma sırasında yapraklar nasıl davranır?', o: ['Önce kapanır, sonra (−) yükle açılır', 'Hep açık kalır, (+) yüklü', 'Kapanır ve kapalı kalır', 'Daha çok açılır, (+) yüklü'],
      b: ['Toplam yük korunur; özdeş iletkenler eşit paylaşır.'], s: ['Gelen elektronlar önce (+) yükü nötrler → yapraklar kapanır', 'Toplam −6q → her biri −3q → <em>(−) yükle yeniden açılır</em> ✓'] } },
  ]; hazirla(st, ['esT', 'esC']);
    FZ.konuEk('TYT', 'Elektrostatik', { gorevler: [gorev(SH.elLab, { yk: 'TYT6-dk', no: 13, icon: '🔋', name: 'Elektroskop: dokunma ile yükleme', task: 'Nötr ve yüklü elektroskoba yüklü iletken dokundurma; yaprakların son durumu.', steps: st })] }); }

  // ======================= 2) KUVVET DÜZENEĞİ (duvar, masa, ip, eğik düzlem) =======================
  const K = 0.045;   // 1 N → 0,045 birim ok boyu (bütün kuvvetler AYNI ölçekle: gerçek oranlı)
  const sKv = sahne({ icon: '🧱', cam: [[1.2, 2.6, 10], [1.2, 1.6, 0]], plate: [12, 5, 0, 0], data: [['g', '10 m/s²']],
    S0: () => ({ mod: 'duvar', m: 2, F: 50, th: 37, cevap: 0 }),
    kur(g) {
      const T = {};
      T.duvar = kutu(g, 0.4, 4, 2, 0x94a3b8, 2.2, 2, 0);
      T.kitap = new THREE.Group(); g.add(T.kitap); kutu(T.kitap, 0.25, 0.9, 0.65, 0x1d4ed8, 0, 0, 0); kutu(T.kitap, 0.2, 0.85, 0.6, 0xf8fafc, 0.03, 0, 0, { edge: false });   // kapak + sayfalar
      T.masa = new THREE.Group(); g.add(T.masa); kutu(T.masa, 3.4, 0.16, 1.6, 0x92400e, 0, 1.0, 0); [-1.5, 1.5].forEach(x => [-0.65, 0.65].forEach(z => kutu(T.masa, 0.12, 1.0, 0.12, 0x78350f, x, 0.5, z)));
      T.kutu = kutu(g, 0.9, 0.7, 0.8, 0xb45309, 0, 1.43, 0);
      T.tavan = kutu(g, 3, 0.15, 1.2, 0x64748b, 0, 4.2, 0); T.ip = FZ.cizgi(g, 0xe5e7eb);
      T.rampa = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 1.6), new THREE.MeshLambertMaterial({ color: 0x9ca3af })); g.add(T.rampa);
      T.o = { G: FZ.ok(0x111827, 'kvG'), N: FZ.ok(0x2563eb, 'kvN'), F: FZ.ok(0xef4444, 'kvF'), f: FZ.ok(0x16a34a, 'kvf'), T: FZ.ok(0x7c3aed, 'kvT') };
      FZ.etiket('kvG', 'mg', '#111827'); FZ.etiket('kvN', 'N', '#2563eb'); FZ.etiket('kvF', 'F', '#ef4444'); FZ.etiket('kvf', 'f', '#16a34a'); FZ.etiket('kvT', 'T', '#7c3aed'); FZ.kart('kvK', '', '#F5C400');
      return T;
    },
    tick(S, dt, T) {
      const mg = S.m * 10, all = [T.duvar, T.kitap, T.masa, T.kutu, T.tavan, T.rampa]; all.forEach(o => o.visible = false); T.ip.visible = false;
      const ok = (k, p, d, F, et, dx = 0, dy = 0) => { if (F <= 0.01) return; FZ.setArrow(T.o[k], p, d, F * K); FZ.show(et, p.clone().add(d.clone().normalize().multiplyScalar(F * K + 0.3)), 1, dx, dy); };
      const lbl = txt => { FZ.setTag('kvK', txt); FZ.show('kvK', V3(1.2, 4.3, 0), S.cevap ? 1 : 0); };
      if (S.mod === 'duvar') {                    // kitap duvara yatay F ile bastırılıyor; sürtünme ağırlığı dengeler
        T.duvar.visible = T.kitap.visible = true; const c = V3(1.875, 2, 0); T.kitap.position.copy(c);
        ok('G', c.clone().add(V3(-0.05, 0, 0.4)), V3(0, -1, 0), mg, 'kvG'); ok('F', c.clone().add(V3(-0.125 - S.F * K, 0.15, 0.4)), V3(1, 0, 0), S.F, 'kvF', 0, -16);   // ok ucu kitabın sol yüzüne değer
        ok('N', c.clone().add(V3(0.12, -0.15, 0.4)), V3(-1, 0, 0), S.F, 'kvN', 0, 16);
        if (S.cevap) ok('f', c.clone().add(V3(0.12, 0.1, 0.4)), V3(0, 1, 0), mg, 'kvf'); lbl(`f = mg = ${mg} N (yukarı) · N = F = ${S.F} N`);
      } else if (S.mod === 'masa' || S.mod === 'cek') {   // masa üstünde kutu; elle aşağı bastırma (masa) ya da yukarı çekme (cek)
        T.masa.visible = T.kutu.visible = true; const c = V3(0, 1.43, 0); T.kutu.position.copy(c); const N = S.mod === 'masa' ? mg + S.F : Math.max(0, mg - S.F);
        ok('G', c.clone().add(V3(-0.15, 0, 0.45)), V3(0, -1, 0), mg, 'kvG');
        if (S.mod === 'masa') ok('F', c.clone().add(V3(0.2, 0.35 + S.F * K, 0.45)), V3(0, -1, 0), S.F, 'kvF', 22, 0); else ok('F', c.clone().add(V3(0.2, 0.35, 0.45)), V3(0, 1, 0), S.F, 'kvF', 22, 0);
        if (S.cevap) ok('N', c.clone().add(V3(0.45, -0.35, 0.45)), V3(0, 1, 0), N, 'kvN', 22, 0); lbl(`N = ${N} N`);
      } else if (S.mod === 'ip') {                // tavana iple asılı kutu
        T.tavan.visible = T.kutu.visible = true; const c = V3(0, 2.2, 0); T.kutu.position.copy(c); FZ.setLine(T.ip, [V3(0, 4.12, 0), V3(0, 2.55, 0)]);
        ok('G', c.clone().add(V3(0, 0, 0.45)), V3(0, -1, 0), mg, 'kvG', 22, 0); if (S.cevap) ok('T', c.clone().add(V3(0, 0.35, 0.45)), V3(0, 1, 0), mg, 'kvT', 22, 0); lbl(`T = mg = ${mg} N`);
      } else {                                    // eğik düzlem: N yüzeye dik, mg düşey aşağı
        const t = S.th * Math.PI / 180; T.rampa.visible = T.kutu.visible = true; T.rampa.position.set(0, 1.2, -0.0); T.rampa.rotation.set(0, 0, t);
        const n = V3(-Math.sin(t), Math.cos(t), 0), c = V3(0.3 * Math.cos(t), 1.2 + 0.3 * Math.sin(t), 0).add(n.clone().multiplyScalar(0.45)); T.kutu.position.copy(c); T.kutu.rotation.set(0, 0, t);
        ok('G', c.clone().add(V3(0, 0, 0.45)), V3(0, -1, 0), mg, 'kvG', 22, 0); if (S.cevap) { ok('N', c.clone().add(V3(0, 0, 0.45)), n, mg * Math.cos(t), 'kvN', -22, 0);
          ok('f', c.clone().add(n.clone().multiplyScalar(-0.35)).add(V3(0, 0, 0.45)), V3(Math.cos(t), Math.sin(t), 0), mg * Math.sin(t), 'kvf', 0, -16); }   // durması için statik sürtünme eğim boyunca yukarı: f = mg sin θ
        lbl(`N = mg cos ${S.th}° = ${Math.round(mg * Math.cos(t))} N · f<sub>s</sub> = mg sin ${S.th}° = ${Math.round(mg * Math.sin(t))} N`);
        T.kutu.position.copy(c);
      }
      if (S.mod !== 'egik') T.kutu.rotation.set(0, 0, 0);
    },
    qp: () => V3(1.2, 4, 0) });
  const KV = (mod, o) => S => Object.assign(S, { mod, cevap: 0 }, o), KVG = S => { S.cevap = 1; };
  const kst = [
    { do: KV('duvar', { m: 2, F: 50 }), sub: 'Kuvvet düzeneği: duvar, masa, ip ve eğik düzlem. Oklar gerçek oranlı.', go: '▶︎ Başla' },
    { do: KV('duvar', { m: 2, F: 50 }), q: { t: '2 kg\'lık kitap düşey duvara 50 N yatay kuvvetle bastırılarak dengede tutuluyor. Duvarın kitaba uyguladığı sürtünme kuvveti ve tepki kuvveti nedir? (g = 10 m/s²)', o: ['f = 20 N yukarı, N = 50 N yatay (duvardan kitaba)', 'f = 50 N yukarı, N = 20 N', 'f = 20 N aşağı, N = 50 N', 'f = 0, N = 20 N yukarı'],
      b: ['Tepki kuvveti yüzeye diktir ve yüzeyden cisme doğrudur.', 'Dengede: düşeyde ve yatayda ayrı ayrı net kuvvet sıfır.'], s: ['Düşey: f = mg = <em>20 N yukarı</em>', 'Yatay: N = F = <em>50 N</em>, duvardan kitaba ✓'], n: ['Burada N yataydır; mg ile hiçbir ilgisi yoktur. N her zaman mg\'nin tersi değildir.'] } },
    { do: KV('masa', { m: 3, F: 20 }), q: { t: 'Masadaki 3 kg\'lık kutunun üstüne elle 20 N düşey aşağı kuvvet uygulanıyor. Masanın kutuya uyguladığı tepki kuvveti kaç N\'dur? (g = 10 m/s²)', o: ['50', '30', '20', '10'],
      b: ['Düşeyde denge: yukarı kuvvetler = aşağı kuvvetler.'], s: ['N = mg + F = 30 + 20 = <em>50 N</em> ✓'] } },
    { do: KV('cek', { m: 3, F: 10 }), q: { t: 'Masadaki 3 kg\'lık kutu elle 10 N düşey yukarı çekiliyor (kutu yerinden kalkmıyor). Masanın tepki kuvveti kaç N\'dur? (g = 10 m/s²)', o: ['20', '30', '40', '10'],
      b: ['Düşeyde denge: N + F = mg'], s: ['N = 30 − 10 = <em>20 N</em> ✓'], n: ['F, mg\'ye ulaşınca N sıfır olur ve kutu masadan kalkmaya başlar.'] } },
    { do: KV('ip', { m: 4 }), q: { t: 'Tavana iple asılı 4 kg\'lık kutu dengede. İpteki gerilme kuvveti kaç N\'dur? Kutunun ağırlığının tepkisi nedir? (g = 10 m/s²)', o: ['40 N; kutunun Dünya\'yı çekmesi', '40 N; ipteki gerilme', '4 N; tavanın tepkisi', '0; kutu hareketsiz'],
      b: ['Etki–tepki kuvvetleri farklı cisimlere etki eder.'], s: ['Denge: T = mg = <em>40 N</em>', 'Ağırlığın tepkisi kutunun Dünya\'ya uyguladığı çekim kuvvetidir ✓'] } },
    { do: KV('egik', { m: 5, th: 37 }), q: { t: 'Eğim açısı 37° olan eğik düzlemde duran 5 kg\'lık kutuya yüzeyin uyguladığı tepki kuvveti kaç N\'dur? (cos 37° = 0,8; g = 10 m/s²)', o: ['40', '50', '30', '62,5'],
      b: ['Tepki kuvveti yüzeye diktir: ağırlığın yüzeye dik bileşenini dengeler.', FM('N = m g cos θ')], s: ['N = 50 · 0,8 = <em>40 N</em> ✓'], n: ['N burada mg\'den küçüktür ve düşey değildir; ağırlık her zaman düşey aşağıdır.'] } },
  ];
  kst.forEach(st => { if (st.q) st.q.goster = KVG; }); hazirla(kst);
  FZ.konuEk('TYT', 'Hareket ve Kuvvet', { gorevler: [gorev(sKv, { yk: 'TYT3-kv', no: 13, icon: '🧱', name: 'Kuvvet düzeneği: tepki kuvveti', task: 'Duvara bastırılan kitap, masaya bastırılan ve çekilen kutu, ipe asılı kutu, eğik düzlem.', steps: kst })] });

  // ======================= 3) TABLO SORULARI =======================
  const sTb = sahne({ icon: '📋', cam: [[1.1, 2.4, 10], [1.1, 2.2, 0]], plate: [12, 5, 0, 0], data: [],
    S0: () => ({ tablo: '' }),
    kur(g) { kutu(g, 7.4, 3.8, 0.1, 0x14532d, 0.2, 2.3, -1, { edge: false }); kutu(g, 7.7, 0.15, 0.3, 0x78350f, 0.2, 0.35, -0.9); FZ.etiket('tbT', '', 'transparent'); return {}; },
    tick(S) { FZ.setTag('tbT', S.tablo); FZ.show('tbT', V3(0.2, 2.35, -0.9), S.tablo ? 1 : 0); },
    qp: () => V3(0, 4, 0) });
  const TB = (bas, sat) => `<table style="font:700 24px Inter;border-collapse:collapse;color:#fff;background:rgba(0,0,0,.25)">${[bas, ...sat].map((r, i) => `<tr>${r.map(c => `<td style="border:2px solid #d1fae5;padding:4px 14px;text-align:center${i ? '' : ';color:#fde047'}">${c}</td>`).join('')}</tr>`).join('')}</table>`;
  const tablo = (ad, yk, html, sorular) => { const st = [{ do: D({ tablo: html }), sub: 'Tahtadaki tabloyu inceleyin.', go: '▶︎ Başla' }, ...sorular.map(q => ({ do: D({ tablo: html }), q }))]; hazirla(st);
    FZ.konuEk('TYT', ad, { gorevler: [gorev(sTb, { yk, no: 14, icon: '📋', name: 'Tablo soruları', task: 'Kitaptaki tablo yorumlama soru tipi: tabloyu oku, eksikleri bul, yargıları değerlendir.', steps: st })] }); };

  tablo('Madde ve Özellikleri', 'TYT2-tb', TB(['Madde', 'm (g)', 'V (cm³)', 'd (g/cm³)'], [['K', '60', '20', '?'], ['L', '?', '50', '0,8'], ['M', '54', '?', '2,7']]), [
    { t: 'Tahtadaki tabloda boş bırakılan değerler sırasıyla nedir? (d<sub>K</sub>, m<sub>L</sub>, V<sub>M</sub>)', o: ['3; 40; 20', '3; 62,5; 20', '1/3; 40; 145,8', '3; 40; 2'],
      b: [FM(`d = ${F('m', 'V')}`)], s: ['d<sub>K</sub> = 60 / 20 = 3 g/cm³', 'm<sub>L</sub> = 0,8 · 50 = 40 g · V<sub>M</sub> = 54 / 2,7 = 20 cm³ → <em>3; 40; 20</em> ✓'] },
    { t: 'Tablodaki maddelerden hangisi suda yüzer? (d<sub>su</sub> = 1 g/cm³)', o: ['Yalnız L', 'Yalnız K', 'K ve M', 'Hepsi'],
      b: ['Özkütlesi sıvınınkinden küçük olan cisim sıvıda yüzer.'], s: ['d<sub>L</sub> = 0,8 < 1 → <em>yalnız L</em> yüzer ✓'] },
  ]);
  tablo('Isı ve Sıcaklık', 'TYT5-tb', TB(['Madde', 'Kütle', 'İlk sıcaklık', 'Son sıcaklık', 'Verilen ısı'], [['X', 'm', '20 °C', '60 °C', 'Q'], ['Y', '2m', '20 °C', '40 °C', 'Q'], ['Z', 'm', '20 °C', '30 °C', 'Q']]), [
    { t: 'Tablodaki X, Y, Z maddelerinin öz ısıları arasındaki ilişki nedir?', o: ['c<sub>Z</sub> > c<sub>Y</sub> = c<sub>X</sub>', 'c<sub>X</sub> > c<sub>Y</sub> > c<sub>Z</sub>', 'c<sub>Y</sub> > c<sub>Z</sub> > c<sub>X</sub>', 'Üçü eşit'],
      b: [FM(`c = ${F('Q', 'm · ΔT')}`)], s: ['c<sub>X</sub> = Q / (m · 40) · c<sub>Y</sub> = Q / (2m · 20) = Q / (m · 40) · c<sub>Z</sub> = Q / (m · 10)', '<em>c<sub>Z</sub> > c<sub>Y</sub> = c<sub>X</sub></em> ✓'] },
  ]);
  tablo('Elektrik ve Manyetizma', 'TYT7-tb', TB(['Alet', 'Güç', 'Günlük süre'], [['Çamaşır makinesi', '2000 W', '1 saat'], ['Buzdolabı', '150 W', '24 saat'], ['Televizyon', '100 W', '5 saat'], ['Ütü', '1500 W', '0,5 saat']]), [
    { t: 'Tablodaki aletlerden hangisi günde en çok elektrik enerjisi harcar?', o: ['Buzdolabı', 'Çamaşır makinesi', 'Ütü', 'Televizyon'],
      b: [FM('E = P · t') + ' (kWh = kW · saat)'], s: ['Çamaşır 2 kWh · Buzdolabı 3,6 kWh · TV 0,5 kWh · Ütü 0,75 kWh', 'En çok: <em>buzdolabı</em> ✓'], n: ['Gücü en büyük olan alet değil, güç × süresi en büyük olan en çok enerji harcar.'] },
    { t: 'Tablodaki aletlerin günlük toplam enerji tüketimi kaç kWh\'tir?', o: ['6,85', '3,75', '68,5', '5,1'],
      b: [FM('E = P · t')], s: ['2 + 3,6 + 0,5 + 0,75 = <em>6,85 kWh</em> ✓'] },
  ]);
  tablo('Hareket ve Kuvvet', 'TYT3-tb', TB(['Araç', 'İlk konum', 'Son konum', 'Alınan yol'], [['K', '+10 m', '+40 m', '30 m'], ['L', '+10 m', '−20 m', '50 m'], ['M', '−10 m', '+20 m', '30 m']]), [
    { t: 'Tablodaki araçlardan hangilerinin yer değiştirmesinin büyüklüğü alınan yola eşittir?', o: ['K ve M', 'Yalnız L', 'K, L ve M', 'Yalnız K'],
      b: ['Yer değiştirme = son konum − ilk konum (vektör) · alınan yol skalerdir.'], s: ['K: 30 m = yol ✓ · L: |−30| = 30 m ≠ 50 m · M: 30 m = yol ✓', '<em>K ve M</em> ✓ (L geri dönmüş olmalı)'] },
  ]);
  tablo('Elektrostatik', 'TYT6-tb', TB(['Çift', 'Etkileşim'], [['K – L', 'iter'], ['L – M', 'çeker'], ['M – N', 'iter']]), [
    { t: 'Yüklü K, L, M, N küreleri için tablodaki etkileşimler gözleniyor. K (+) yüklü ise N\'nin yükü nedir?', o: ['(−)', '(+)', 'Nötr', 'Belirlenemez'],
      b: ['Aynı işaretli yükler iter, zıt işaretliler çeker. (Hepsi yüklü olduğundan çekme zıt işaret demektir.)'], s: ['K (+) → L (+) · L–M çeker → M (−) · M–N iter → <em>N (−)</em> ✓'] },
  ]);
  tablo('Dalgalar', 'TYT9-tb', TB(['Ortam', 'Sıcaklık', 'Ses hızı (m/s)'], [['Hava', '0 °C', '331'], ['Hava', '20 °C', '343'], ['Su', '20 °C', '1480'], ['Çelik', '20 °C', '5100']]), [
    { t: 'Tablodan aşağıdaki yargılardan hangisi çıkarılabilir?', o: ['Ses hızı ortama ve sıcaklığa bağlıdır; katıda en büyüktür', 'Ses hızı yalnız sıcaklığa bağlıdır', 'Ses en hızlı havada yayılır', 'Ses hızı ortamdan bağımsızdır'],
      b: ['Tablodaki satırları karşılaştır: aynı ortam farklı sıcaklık, aynı sıcaklık farklı ortam.'], s: ['Hava 0 → 20 °C hız artmış: sıcaklığa bağlı · 20 °C\'de hava < su < çelik: ortama bağlı ✓'] },
  ]);
  tablo('Optik', 'TYT10-tb', TB(['Ayna/mercek', 'Görüntü'], [['Düzlem ayna', 'sanal, düz, eşit boy'], ['Tümsek ayna', '?'], ['Kalın kenarlı mercek', '?']]), [
    { t: 'Tablodaki boşluklar için doğru eşleştirme hangisidir? (cisim gerçek ve her konumda)', o: ['İkisinde de: sanal, düz, küçük', 'Tümsek: gerçek, ters · Kalın kenarlı: sanal, büyük', 'İkisinde de: gerçek, ters, küçük', 'Tümsek: sanal, büyük · Kalın kenarlı: gerçek, küçük'],
      b: ['Işığı dağıtan optik araçlar (tümsek ayna, kalın kenarlı mercek) gerçek cisimden her zaman aynı tür görüntü verir.'], s: ['Işınlar dağılır, uzantılar kesişir → <em>sanal, düz, küçük</em> ✓'] },
  ]);
  tablo('Enerji', 'TYT4-tb', TB(['Santral', 'Kaynak'], [['Hidroelektrik', 'su'], ['Rüzgâr', 'rüzgâr'], ['Termik', 'kömür'], ['Nükleer', 'uranyum'], ['Jeotermal', 'yer ısısı']]), [
    { t: 'Tablodaki santrallerden hangileri yenilenebilir enerji kaynağı kullanır?', o: ['Hidroelektrik, rüzgâr, jeotermal', 'Termik ve nükleer', 'Yalnız rüzgâr', 'Hepsi'],
      b: ['Yenilenebilir kaynak: doğada kendini yenileyen (güneş, rüzgâr, su, jeotermal, biyokütle).'], s: ['Kömür ve uranyum tükenir → <em>hidroelektrik, rüzgâr, jeotermal</em> ✓'] },
  ]);
})();
